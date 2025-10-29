#!/usr/bin/env python3
"""
MP4 파일에서 자막을 추출하는 스크립트
OpenAI Whisper를 사용하여 음성을 인식하고 자막을 생성합니다.
"""

import os
import sys
import argparse
import glob
import subprocess
from pathlib import Path

# 필수 라이브러리 확인
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

try:
    from simple_term_menu import TerminalMenu
    MENU_AVAILABLE = True
except ImportError:
    MENU_AVAILABLE = False


def check_ffmpeg():
    """ffmpeg가 설치되어 있는지 확인합니다."""
    try:
        subprocess.run(["ffmpeg", "-version"],
                      stdout=subprocess.DEVNULL,
                      stderr=subprocess.DEVNULL,
                      check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def check_dependencies():
    """필수 의존성을 확인하고 설치 안내를 표시합니다."""
    missing = []

    if not WHISPER_AVAILABLE:
        missing.append("openai-whisper")

    if not check_ffmpeg():
        missing.append("ffmpeg")

    if not MENU_AVAILABLE:
        missing.append("simple-term-menu")

    if missing:
        print("\n" + "="*60)
        print("필수 라이브러리/도구 미설치")
        print("="*60)
        print("\n다음 라이브러리/도구가 설치되지 않았습니다:\n")

        for lib in missing:
            print(f"  ✗ {lib}")

        print("\n" + "-"*60)
        print("설치 방법:")
        print("-"*60)

        if "openai-whisper" in missing:
            print("\n[openai-whisper 설치]")
            print("  pip install openai-whisper")
            print("  또는")
            print("  pip3 install openai-whisper")

        if "ffmpeg" in missing:
            print("\n[ffmpeg 설치]")
            print("  macOS (Homebrew):")
            print("    brew install ffmpeg")
            print("\n  Ubuntu/Debian:")
            print("    sudo apt update")
            print("    sudo apt install ffmpeg")
            print("\n  CentOS/RHEL:")
            print("    sudo yum install ffmpeg")
            print("\n  Windows (Chocolatey):")
            print("    choco install ffmpeg")

        if "simple-term-menu" in missing:
            print("\n[simple-term-menu 설치]")
            print("  pip install simple-term-menu")
            print("  또는")
            print("  pip3 install simple-term-menu")

        print("\n" + "="*60)
        print("모든 라이브러리를 한번에 설치:")
        print("-"*60)
        print("  pip install openai-whisper simple-term-menu")
        print("="*60 + "\n")

        return False

    return True


def extract_subtitles(video_file, model_name="base", output_format="srt", language=None):
    """
    비디오 파일에서 자막을 추출합니다.

    Args:
        video_file (str): 비디오 파일 경로
        model_name (str): Whisper 모델 이름 (tiny, base, small, medium, large)
        output_format (str): 출력 형식 (srt, vtt, txt, json)
        language (str): 음성 언어 (ko, en, ja, zh 등, None이면 자동 감지)
    """
    print(f"\n처리 중: {video_file}")
    print(f"모델: {model_name}")
    if language:
        print(f"언어: {language}")
    else:
        print("언어: 자동 감지")

    # Whisper 모델 로드
    print("모델 로딩 중...")
    model = whisper.load_model(model_name)

    # 음성 인식
    print("음성 인식 중...")
    transcribe_options = {"verbose": True}
    if language:
        transcribe_options["language"] = language

    result = model.transcribe(video_file, **transcribe_options)

    # 출력 파일명 생성
    video_path = Path(video_file)
    output_file = video_path.with_suffix(f".{output_format}")

    # 자막 저장
    if output_format == "srt":
        save_srt(result, output_file)
    elif output_format == "vtt":
        save_vtt(result, output_file)
    elif output_format == "txt":
        save_txt(result, output_file)
    elif output_format == "json":
        import json
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"저장 완료: {output_file}")
    return output_file


def format_timestamp(seconds):
    """초를 SRT 타임스탬프 형식으로 변환 (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def format_timestamp_vtt(seconds):
    """초를 VTT 타임스탬프 형식으로 변환 (HH:MM:SS.mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def save_srt(result, output_file):
    """SRT 형식으로 자막 저장"""
    with open(output_file, "w", encoding="utf-8") as f:
        for i, segment in enumerate(result["segments"], start=1):
            f.write(f"{i}\n")
            f.write(f"{format_timestamp(segment['start'])} --> {format_timestamp(segment['end'])}\n")
            f.write(f"{segment['text'].strip()}\n\n")


def save_vtt(result, output_file):
    """VTT 형식으로 자막 저장"""
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for segment in result["segments"]:
            f.write(f"{format_timestamp_vtt(segment['start'])} --> {format_timestamp_vtt(segment['end'])}\n")
            f.write(f"{segment['text'].strip()}\n\n")


def save_txt(result, output_file):
    """일반 텍스트 형식으로 자막 저장"""
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(result["text"])


def show_interactive_menu():
    """대화형 메뉴를 표시하고 사용자 선택을 받습니다."""
    print("\n" + "="*50)
    print("MP4 자막 추출 스크립트")
    print("="*50)

    if MENU_AVAILABLE:
        # simple-term-menu를 사용한 방향키 메뉴
        # 언어 선택
        print("\n[1단계] 언어를 선택하세요 (방향키로 이동, Enter로 선택):")
        language_options = [
            "한국어 (Korean)",
            "영어 (English)",
            "일본어 (Japanese)",
            "자동 감지 (Auto detect)"
        ]
        terminal_menu = TerminalMenu(language_options, title="")
        lang_idx = terminal_menu.show()

        if lang_idx is None:  # ESC 키 등으로 취소
            print("\n취소되었습니다.")
            sys.exit(0)

        language_map = ["ko", "en", "ja", None]
        language = language_map[lang_idx]

        # 모델 선택
        print("\n[2단계] 인식 모델을 선택하세요 (방향키로 이동, Enter로 선택):")
        model_options = [
            "tiny   - 가장 빠름, 낮은 정확도 (~1GB RAM)",
            "base   - 빠름, 적절한 정확도 (~1GB RAM)",
            "small  - 균형잡힌 속도와 정확도 (~2GB RAM) [추천]",
            "medium - 높은 정확도, 느림 (~5GB RAM)",
            "large  - 최고 정확도, 매우 느림 (~10GB RAM)"
        ]
        terminal_menu = TerminalMenu(model_options, title="", cursor_index=2)
        model_idx = terminal_menu.show()

        if model_idx is None:
            print("\n취소되었습니다.")
            sys.exit(0)

        model_map = ["tiny", "base", "small", "medium", "large"]
        model = model_map[model_idx]

        # 출력 형식 선택
        print("\n[3단계] 출력 형식을 선택하세요 (방향키로 이동, Enter로 선택):")
        format_options = [
            "SRT - SubRip 자막 형식 [추천]",
            "VTT - WebVTT 자막 형식",
            "TXT - 일반 텍스트",
            "JSON - JSON 형식 (전체 결과)"
        ]
        terminal_menu = TerminalMenu(format_options, title="")
        format_idx = terminal_menu.show()

        if format_idx is None:
            print("\n취소되었습니다.")
            sys.exit(0)

        format_map = ["srt", "vtt", "txt", "json"]
        output_format = format_map[format_idx]

    print("\n" + "="*50)
    print("선택 완료!")
    print(f"  언어: {language if language else '자동 감지'}")
    print(f"  모델: {model}")
    print(f"  형식: {output_format}")
    print("="*50 + "\n")

    return language, model, output_format


def main():
    parser = argparse.ArgumentParser(
        description="MP4 파일에서 자막을 추출합니다.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
모델 크기별 특징:
  tiny   - 가장 빠르지만 정확도 낮음 (~1GB RAM)
  base   - 빠르고 적절한 정확도 (기본값, ~1GB RAM)
  small  - 균형잡힌 속도와 정확도 (~2GB RAM)
  medium - 높은 정확도, 느린 속도 (~5GB RAM)
  large  - 최고 정확도, 매우 느림 (~10GB RAM)

출력 형식:
  srt    - SubRip 자막 형식 (기본값)
  vtt    - WebVTT 자막 형식
  txt    - 일반 텍스트
  json   - JSON 형식 (전체 결과 포함)

언어 코드 (주요):
  ko     - 한국어
  en     - 영어
  ja     - 일본어
  zh     - 중국어
  es     - 스페인어
  fr     - 프랑스어
  de     - 독일어
  ru     - 러시아어
  (미지정시 자동 감지)

사용 예시:
  # 대화형 모드
  %(prog)s

  # 명령줄 옵션 모드
  %(prog)s --model medium           # medium 모델 사용
  %(prog)s --language ko            # 한국어로 지정
  %(prog)s -l en -m large           # 영어, large 모델
  %(prog)s -m large -f vtt          # large 모델로 VTT 형식 생성
  %(prog)s video.mp4                # 특정 파일만 처리
  %(prog)s -l ko -m small *.mp4     # 모든 MP4 파일을 한국어로
        """
    )

    parser.add_argument(
        "files",
        nargs="*",
        help="처리할 MP4 파일 (미지정시 현재 폴더의 모든 MP4 파일)"
    )

    parser.add_argument(
        "-m", "--model",
        choices=["tiny", "base", "small", "medium", "large"],
        default=None,
        help="Whisper 모델 선택 (기본값: base)"
    )

    parser.add_argument(
        "-f", "--format",
        choices=["srt", "vtt", "txt", "json"],
        default=None,
        help="출력 형식 (기본값: srt)"
    )

    parser.add_argument(
        "-l", "--language",
        type=str,
        default=None,
        help="음성 언어 코드 (예: ko, en, ja, zh 등, 미지정시 자동 감지)"
    )

    args = parser.parse_args()

    # 의존성 확인
    if not check_dependencies():
        sys.exit(1)

    # 명령줄 옵션이 제공되었는지 확인
    has_cli_options = args.model or args.format or args.language or args.files

    if has_cli_options:
        # 명령줄 모드
        language = args.language
        model = args.model if args.model else "base"
        output_format = args.format if args.format else "srt"

        print("\n" + "="*50)
        print("명령줄 모드로 실행")
        print(f"  언어: {language if language else '자동 감지'}")
        print(f"  모델: {model}")
        print(f"  형식: {output_format}")
        print("="*50 + "\n")
    else:
        # 대화형 모드
        # MP4 파일이 있는지 먼저 확인
        mp4_files = glob.glob("*.mp4")
        mp4_files.extend(glob.glob("*.MP4"))

        if not mp4_files:
            print("현재 폴더에 MP4 파일을 찾을 수 없습니다.")
            return

        # 대화형 메뉴 표시
        language, model, output_format = show_interactive_menu()

    # 처리할 파일 목록 생성
    if args.files:
        mp4_files = args.files
    else:
        mp4_files = glob.glob("*.mp4")
        mp4_files.extend(glob.glob("*.MP4"))

    if not mp4_files:
        print("MP4 파일을 찾을 수 없습니다.")
        return

    print(f"총 {len(mp4_files)}개의 파일을 처리합니다.")

    # 각 파일 처리
    for video_file in mp4_files:
        if not os.path.exists(video_file):
            print(f"파일을 찾을 수 없습니다: {video_file}")
            continue

        try:
            extract_subtitles(video_file, model, output_format, language)
        except Exception as e:
            print(f"오류 발생 ({video_file}): {e}")

    print("\n모든 작업이 완료되었습니다.")


if __name__ == "__main__":
    main()
