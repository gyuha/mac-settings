#!/usr/bin/env python3
"""
SRT 자막 파일을 번역하는 스크립트
deep-translator를 사용하여 자막을 번역합니다.
"""

import os
import sys
import re
import glob
import argparse
from pathlib import Path

# 필수 라이브러리 확인
try:
    from deep_translator import GoogleTranslator
    TRANSLATOR_AVAILABLE = True
except ImportError:
    TRANSLATOR_AVAILABLE = False

try:
    from simple_term_menu import TerminalMenu
    MENU_AVAILABLE = True
except ImportError:
    MENU_AVAILABLE = False


def check_dependencies():
    """필수 의존성을 확인하고 설치 안내를 표시합니다."""
    missing = []

    if not TRANSLATOR_AVAILABLE:
        missing.append("deep-translator")

    if not MENU_AVAILABLE:
        missing.append("simple-term-menu")

    if missing:
        print("\n" + "="*60)
        print("필수 라이브러리 미설치")
        print("="*60)
        print("\n다음 라이브러리가 설치되지 않았습니다:\n")

        for lib in missing:
            print(f"  ✗ {lib}")

        print("\n" + "-"*60)
        print("설치 방법:")
        print("-"*60)

        if "deep-translator" in missing:
            print("\n[deep-translator 설치]")
            print("  pip install deep-translator")
            print("  또는")
            print("  pip3 install deep-translator")

        if "simple-term-menu" in missing:
            print("\n[simple-term-menu 설치]")
            print("  pip install simple-term-menu")
            print("  또는")
            print("  pip3 install simple-term-menu")

        print("\n" + "="*60)
        print("모든 라이브러리를 한번에 설치:")
        print("-"*60)
        print("  pip install deep-translator simple-term-menu")
        print("="*60 + "\n")

        return False

    return True


class SRTBlock:
    """SRT 자막 블록을 나타내는 클래스"""
    def __init__(self, index, timestamp, text):
        self.index = index
        self.timestamp = timestamp
        self.text = text

    def __str__(self):
        return f"{self.index}\n{self.timestamp}\n{self.text}\n"


def parse_srt(file_path):
    """SRT 파일을 파싱합니다."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # SRT 블록 파싱
    blocks = []
    pattern = r'(\d+)\n([\d:,]+ --> [\d:,]+)\n((?:.*\n)*?)(?=\n\d+\n|$)'
    matches = re.finditer(pattern, content, re.MULTILINE)

    for match in matches:
        index = match.group(1)
        timestamp = match.group(2)
        text = match.group(3).strip()
        blocks.append(SRTBlock(index, timestamp, text))

    return blocks


def translate_text(text, translator, src_lang, dest_lang):
    """텍스트를 번역합니다."""
    try:
        result = translator.translate(text)
        return result
    except Exception as e:
        print(f"\n번역 오류: {e}")
        return text


def translate_srt(input_file, output_file, src_lang, dest_lang):
    """SRT 파일을 번역합니다."""
    print(f"\n처리 중: {input_file}")
    print(f"원본 언어: {src_lang}")
    print(f"대상 언어: {dest_lang}")

    # SRT 파싱
    print("자막 파일 파싱 중...")
    blocks = parse_srt(input_file)
    print(f"총 {len(blocks)}개의 자막 블록을 찾았습니다.")

    # 번역기 초기화
    translator = GoogleTranslator(source=src_lang, target=dest_lang)

    # 각 블록 번역
    print("번역 중...")
    translated_blocks = []
    for i, block in enumerate(blocks, 1):
        print(f"  진행률: {i}/{len(blocks)}", end='\r')
        translated_text = translate_text(block.text, translator, src_lang, dest_lang)
        translated_blocks.append(SRTBlock(block.index, block.timestamp, translated_text))

    print(f"\n번역 완료: {len(translated_blocks)}개 블록")

    # 번역된 내용 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        for block in translated_blocks:
            f.write(str(block))
            f.write('\n')

    print(f"저장 완료: {output_file}\n")


def show_language_menu():
    """언어 선택 메뉴를 표시합니다."""
    print("\n" + "="*50)
    print("SRT 자막 번역 스크립트")
    print("="*50)

    # 지원 언어 목록
    languages = [
        ("한국어", "ko"),
        ("영어", "en"),
        ("일본어", "ja")
    ]

    # 원본 언어 선택
    print("\n[1단계] 원본 언어를 선택하세요 (방향키로 이동, Enter로 선택):")
    source_options = [f"{name} ({code})" for name, code in languages]
    terminal_menu = TerminalMenu(source_options, title="")
    src_idx = terminal_menu.show()

    if src_idx is None:
        print("\n취소되었습니다.")
        sys.exit(0)

    src_lang = languages[src_idx][1]
    src_name = languages[src_idx][0]

    # 대상 언어 선택
    print(f"\n[2단계] 대상 언어를 선택하세요 (방향키로 이동, Enter로 선택):")
    terminal_menu = TerminalMenu(source_options, title="")
    dest_idx = terminal_menu.show()

    if dest_idx is None:
        print("\n취소되었습니다.")
        sys.exit(0)

    dest_lang = languages[dest_idx][1]
    dest_name = languages[dest_idx][0]

    # 파일 저장 옵션 선택
    print(f"\n[3단계] 번역된 파일 저장 방식을 선택하세요 (방향키로 이동, Enter로 선택):")
    save_options = [
        "새 파일로 저장 (원본파일명_translated.srt)",
        "원본 파일 대체 (백업: 원본파일명_backup.srt)"
    ]
    terminal_menu = TerminalMenu(save_options, title="")
    save_idx = terminal_menu.show()

    if save_idx is None:
        print("\n취소되었습니다.")
        sys.exit(0)

    replace_original = (save_idx == 1)

    print("\n" + "="*50)
    print("선택 완료!")
    print(f"  원본 언어: {src_name} ({src_lang})")
    print(f"  대상 언어: {dest_name} ({dest_lang})")
    print(f"  저장 방식: {'원본 대체 (백업 생성)' if replace_original else '새 파일 생성'}")
    print("="*50 + "\n")

    return src_lang, dest_lang, replace_original


def parse_arguments():
    """명령줄 인자를 파싱합니다."""
    parser = argparse.ArgumentParser(
        description='SRT 자막 파일을 번역합니다.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  # 대화형 모드
  %(prog)s

  # 명령줄 옵션 모드
  %(prog)s --src ko --dest en
  %(prog)s -s en -d ko --output replace
  %(prog)s -s ja -d ko -o new

지원 언어:
  ko : 한국어
  en : 영어
  ja : 일본어
        """
    )

    parser.add_argument('-s', '--src', '--source',
                        help='원본 언어 코드 (ko, en, ja)')
    parser.add_argument('-d', '--dest', '--target',
                        help='대상 언어 코드 (ko, en, ja)')
    parser.add_argument('-o', '--output',
                        choices=['new', 'replace'],
                        help='출력 모드: new=새 파일 생성, replace=원본 대체')

    return parser.parse_args()


def process_files(src_lang, dest_lang, replace_original):
    """SRT 파일들을 처리합니다."""
    # 현재 폴더의 SRT 파일 찾기
    srt_files = glob.glob("*.srt")
    srt_files.extend(glob.glob("*.SRT"))

    if not srt_files:
        print("현재 폴더에 SRT 파일을 찾을 수 없습니다.")
        return

    print(f"총 {len(srt_files)}개의 파일을 처리합니다.\n")

    # 각 파일 번역
    for srt_file in srt_files:
        if not os.path.exists(srt_file):
            print(f"파일을 찾을 수 없습니다: {srt_file}")
            continue

        file_path = Path(srt_file)

        if replace_original:
            # 원본 파일 대체 모드: 백업 생성 후 원본에 덮어쓰기
            backup_file = file_path.parent / f"{file_path.stem}_backup.srt"
            output_file = file_path
            temp_output = file_path.parent / f"{file_path.stem}_temp.srt"

            try:
                # 임시 파일로 번역
                translate_srt(srt_file, temp_output, src_lang, dest_lang)

                # 원본을 백업으로 이동
                import shutil
                shutil.copy2(srt_file, backup_file)
                print(f"백업 생성: {backup_file}")

                # 번역된 파일을 원본으로 이동
                shutil.move(str(temp_output), str(output_file))
                print(f"원본 파일 대체 완료: {output_file}\n")

            except Exception as e:
                print(f"오류 발생 ({srt_file}): {e}\n")
                # 임시 파일이 있으면 삭제
                if temp_output.exists():
                    temp_output.unlink()
        else:
            # 새 파일 생성 모드
            output_file = file_path.parent / f"{file_path.stem}_translated.srt"

            try:
                translate_srt(srt_file, output_file, src_lang, dest_lang)
            except Exception as e:
                print(f"오류 발생 ({srt_file}): {e}\n")

    print("모든 작업이 완료되었습니다.")


def main():
    # 의존성 확인
    if not check_dependencies():
        sys.exit(1)

    # 명령줄 인자 파싱
    args = parse_arguments()

    # 명령줄 옵션이 제공되었는지 확인
    has_cli_options = args.src or args.dest or args.output

    if has_cli_options:
        # 명령줄 모드: 모든 필수 옵션이 있는지 확인
        if not args.src:
            print("오류: 원본 언어를 지정해야 합니다. (--src 또는 -s)")
            sys.exit(1)
        if not args.dest:
            print("오류: 대상 언어를 지정해야 합니다. (--dest 또는 -d)")
            sys.exit(1)

        src_lang = args.src
        dest_lang = args.dest
        replace_original = (args.output == 'replace') if args.output else False

        # 유효한 언어 코드 확인
        valid_langs = ['ko', 'en', 'ja']
        if src_lang not in valid_langs:
            print(f"오류: 유효하지 않은 원본 언어 코드: {src_lang}")
            print(f"지원 언어: {', '.join(valid_langs)}")
            sys.exit(1)
        if dest_lang not in valid_langs:
            print(f"오류: 유효하지 않은 대상 언어 코드: {dest_lang}")
            print(f"지원 언어: {', '.join(valid_langs)}")
            sys.exit(1)

        print("\n" + "="*50)
        print("명령줄 모드로 실행")
        print(f"  원본 언어: {src_lang}")
        print(f"  대상 언어: {dest_lang}")
        print(f"  저장 방식: {'원본 대체 (백업 생성)' if replace_original else '새 파일 생성'}")
        print("="*50 + "\n")
    else:
        # 대화형 모드
        src_lang, dest_lang, replace_original = show_language_menu()

    # 파일 처리
    process_files(src_lang, dest_lang, replace_original)


if __name__ == "__main__":
    main()
