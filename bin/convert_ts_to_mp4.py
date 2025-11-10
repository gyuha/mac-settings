#!/usr/bin/env python3

"""
TS to MP4 Converter with Progress Bar
.ts 파일을 .mp4로 변환하는 스크립트 (진행률 표시 포함)
"""

import argparse
import subprocess
import sys
import os
import re
import threading
from pathlib import Path
from typing import List, Tuple

# 색상 코드
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

# 품질 설정
QUALITY_SETTINGS = {
    1: {
        'crf': 18,
        'preset': 'slow',
        'audio_bitrate': '192k',
        'name': '고화질'
    },
    2: {
        'crf': 23,
        'preset': 'medium',
        'audio_bitrate': '128k',
        'name': '중간화질'
    },
    3: {
        'crf': 28,
        'preset': 'fast',
        'audio_bitrate': '128k',
        'name': '저화질'
    },
    4: {
        'crf': 32,
        'preset': 'veryfast',
        'audio_bitrate': '96k',
        'name': '최저화질'
    }
}


def show_banner():
    """배너 출력"""
    print(f"{Colors.BOLD}{Colors.CYAN}=== TS to MP4 Converter ==={Colors.RESET}")
    print()


def get_video_duration(file_path: str) -> float:
    """ffprobe를 사용하여 비디오 길이(초) 가져오기"""
    try:
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            file_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return float(result.stdout.strip())
    except (ValueError, subprocess.SubprocessError):
        return 0.0


def format_time(seconds: float) -> str:
    """초를 HH:MM:SS 형식으로 변환"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


def format_size(bytes_size: int) -> str:
    """바이트를 읽기 쉬운 형식으로 변환"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.1f}{unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.1f}TB"


def convert_file_with_progress(input_file: str, output_file: str, quality: int) -> bool:
    """
    파일 변환 (진행률 표시 포함)

    Returns:
        bool: 변환 성공 여부
    """
    settings = QUALITY_SETTINGS[quality]

    # 비디오 총 길이 가져오기
    duration = get_video_duration(input_file)

    cmd = [
        'ffmpeg',
        '-i', input_file,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-crf', str(settings['crf']),
        '-preset', settings['preset'],
        '-b:a', settings['audio_bitrate'],
        '-progress', 'pipe:1',  # 진행률 정보를 stdout으로 출력
        '-nostdin',  # stdin 비활성화로 블로킹 방지
        '-y',
        output_file
    ]

    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            bufsize=1,
            stdin=subprocess.DEVNULL  # stdin 명시적으로 차단
        )

        # stderr를 별도 스레드에서 소비하여 버퍼 오버플로우 방지
        stderr_lines = []
        def consume_stderr():
            try:
                for line in process.stderr:
                    stderr_lines.append(line)
            except:
                pass

        stderr_thread = threading.Thread(target=consume_stderr, daemon=True)
        stderr_thread.start()

        current_time = 0.0
        last_update = 0.0

        # ffmpeg 출력 파싱
        try:
            for line in process.stdout:
                line = line.strip()

                # out_time_ms 값에서 현재 진행 시간 추출
                if line.startswith('out_time_ms='):
                    try:
                        microseconds = int(line.split('=')[1])
                        current_time = microseconds / 1_000_000  # 마이크로초를 초로 변환

                        # 5초마다 진행률 업데이트 (출력 빈도 감소)
                        if duration > 0 and (current_time - last_update >= 5.0 or current_time >= duration):
                            progress = min((current_time / duration) * 100, 100)
                            bar_length = 40
                            filled = int(bar_length * progress / 100)
                            bar = '█' * filled + '░' * (bar_length - filled)

                            # 진행률 표시 (같은 줄에 업데이트)
                            print(f'\r  {Colors.CYAN}[{bar}]{Colors.RESET} '
                                  f'{Colors.BOLD}{progress:.1f}%{Colors.RESET} '
                                  f'({format_time(current_time)}/{format_time(duration)})',
                                  end='', flush=True)
                            last_update = current_time
                    except (ValueError, IndexError):
                        pass
        except KeyboardInterrupt:
            print(f'\n  {Colors.YELLOW}사용자에 의해 중단됨{Colors.RESET}')
            process.kill()
            return False

        # 프로세스 종료 대기 (타임아웃 없음)
        returncode = process.wait()
        stderr_thread.join(timeout=1.0)  # stderr 스레드 종료 대기
        print()  # 줄바꿈

        # stderr 출력 확인 (에러 로깅용)
        if returncode != 0 and stderr_lines:
            print(f'  {Colors.YELLOW}ffmpeg 오류 상세:{Colors.RESET}')
            # 마지막 10줄만 출력
            for line in stderr_lines[-10:]:
                print(f'  {line.rstrip()}')

        return returncode == 0

    except Exception as e:
        print(f'\r  {Colors.RED}✗ 오류 발생: {str(e)}{Colors.RESET}')
        try:
            process.kill()  # 프로세스 강제 종료
        except:
            pass
        return False


def find_ts_files(recursive: bool) -> List[Path]:
    """
    .ts 파일 찾기

    Args:
        recursive: 하위 폴더 포함 여부

    Returns:
        List[Path]: 찾은 .ts 파일 목록
    """
    current_dir = Path('.')

    if recursive:
        return sorted(current_dir.rglob('*.ts'))
    else:
        return sorted(current_dir.glob('*.ts'))


def convert_files(quality: int, delete_ts: bool, recursive: bool) -> Tuple[int, int, int]:
    """
    파일 변환 메인 로직

    Returns:
        Tuple[int, int, int]: (성공 수, 실패 수, 삭제된 파일 수)
    """
    settings = QUALITY_SETTINGS[quality]

    print(f"{Colors.BOLD}선택된 품질:{Colors.RESET} {settings['name']} (CRF {settings['crf']})")

    if delete_ts:
        print(f"{Colors.BOLD}변환 완료 후 원본 TS 파일 삭제:{Colors.RESET} {Colors.YELLOW}예{Colors.RESET}")

    if recursive:
        print(f"{Colors.BOLD}재귀적 변환:{Colors.RESET} 예 (하위 폴더 포함)")
        print("현재 폴더 및 하위 폴더의 모든 .ts 파일을 .mp4로 변환합니다...")
    else:
        print("현재 폴더의 모든 .ts 파일을 .mp4로 변환합니다...")

    print()

    # .ts 파일 찾기
    ts_files = find_ts_files(recursive)

    if not ts_files:
        print(f"{Colors.YELLOW}변환할 .ts 파일이 없습니다.{Colors.RESET}")
        return 0, 0, 0

    print(f"총 {Colors.BOLD}{len(ts_files)}{Colors.RESET} 개의 .ts 파일을 찾았습니다.")
    print()

    converted = 0
    failed = 0
    deleted_ts = 0

    for idx, ts_file in enumerate(ts_files, 1):
        print(f"{Colors.BOLD}[{idx}/{len(ts_files)}]{Colors.RESET} 처리 중: {Colors.BLUE}{ts_file}{Colors.RESET}")

        # 출력 파일명 생성
        output_file = ts_file.with_suffix('.mp4')

        if output_file.exists():
            file_size = format_size(output_file.stat().st_size)
            print(f"  {Colors.YELLOW}경고: {output_file} 파일이 이미 존재합니다 ({file_size}). 덮어씁니다.{Colors.RESET}")

        print(f"  변환 시작: {ts_file.name} -> {output_file.name} [{settings['name']}]")

        # 변환 실행
        if convert_file_with_progress(str(ts_file), str(output_file), quality):
            output_size = format_size(output_file.stat().st_size)
            print(f"  {Colors.GREEN}✓ 성공:{Colors.RESET} {output_file} ({output_size})")
            converted += 1

            # 변환 성공 시 즉시 원본 TS 파일 삭제
            if delete_ts and ts_file.exists():
                try:
                    print(f"  {Colors.YELLOW}삭제:{Colors.RESET} {ts_file}")
                    ts_file.unlink()
                    deleted_ts += 1
                except OSError as e:
                    print(f"  {Colors.YELLOW}경고: {ts_file} 삭제 실패 - {e}{Colors.RESET}")
        else:
            print(f"  {Colors.RED}✗ 실패:{Colors.RESET} {ts_file}")
            failed += 1

        print()

    return converted, failed, deleted_ts


def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(
        description='TS to MP4 Converter - .ts 파일을 .mp4로 변환',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  %(prog)s -q 2               # 중간화질로 변환만
  %(prog)s -q 4 -d            # 최저화질로 변환 후 TS 파일 삭제
  %(prog)s -q 2 -r            # 하위 폴더 포함 재귀적으로 변환
  %(prog)s --quality 3 --delete --recursive  # 재귀 변환 후 TS 파일 삭제
        """
    )

    parser.add_argument(
        '-q', '--quality',
        type=int,
        choices=[1, 2, 3, 4],
        required=True,
        help='변환 품질 선택: 1=고화질(CRF 18), 2=중간화질(CRF 23), 3=저화질(CRF 28), 4=최저화질(CRF 32)'
    )

    parser.add_argument(
        '-d', '--delete',
        action='store_true',
        help='변환 완료 후 원본 TS 파일 삭제'
    )

    parser.add_argument(
        '-r', '--recursive',
        action='store_true',
        help='하위 경로 포함하여 재귀적으로 변환'
    )

    args = parser.parse_args()

    # ffmpeg 설치 확인
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
    except (subprocess.SubprocessError, FileNotFoundError):
        print(f"{Colors.RED}오류: ffmpeg가 설치되어 있지 않습니다.{Colors.RESET}")
        print("ffmpeg를 설치한 후 다시 시도하세요.")
        sys.exit(1)

    show_banner()

    # 파일 변환 실행
    converted, failed, deleted_ts = convert_files(args.quality, args.delete, args.recursive)

    # 결과 요약
    print()
    print(f"{Colors.BOLD}{Colors.GREEN}=== 변환 완료 ==={Colors.RESET}")
    print(f"{Colors.GREEN}성공:{Colors.RESET} {converted} 개")
    print(f"{Colors.RED}실패:{Colors.RESET} {failed} 개")
    print(f"{Colors.BOLD}총 처리:{Colors.RESET} {converted + failed} 개")

    if args.delete:
        print(f"{Colors.YELLOW}삭제된 TS 파일:{Colors.RESET} {deleted_ts} 개")

    if converted > 0:
        print()
        print(f"{Colors.BOLD}변환된 파일 목록:{Colors.RESET}")
        mp4_files = sorted(Path('.').glob('*.mp4')) if not args.recursive else sorted(Path('.').rglob('*.mp4'))
        for mp4_file in mp4_files:
            size = format_size(mp4_file.stat().st_size)
            print(f"  {mp4_file} ({size})")


if __name__ == '__main__':
    main()
