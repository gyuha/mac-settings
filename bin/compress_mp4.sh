#!/bin/bash

# MP4 파일 용량을 줄이는 스크립트

# 사용법 출력 함수
show_usage() {
    echo "=== MP4 Compressor ==="
    echo ""
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  -q, --quality <1-4>   압축 품질 선택 (필수)"
    echo "      1 - 고화질 (CRF 20, 약간의 용량 감소)"
    echo "      2 - 중간화질 (CRF 24, 적당한 용량 감소) - 권장"
    echo "      3 - 저화질 (CRF 28, 많은 용량 감소)"
    echo "      4 - 최저화질 (CRF 32, 최대 용량 감소)"
    echo ""
    echo "  -t, --target <경로>   압축 파일 저장 폴더 지정 (기본값: ./compressed)"
    echo "  -d, --delete         압축 완료 후 원본 파일을 압축된 파일로 대체"
    echo "  -h, --help           도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0 -q 2                    # 현재 폴더의 파일을 중간화질로 압축"
    echo "  $0 -q 3 -t /path/to/output # 압축 파일을 지정된 폴더에 저장"
    echo "  $0 -q 4 -d                 # 최저화질로 압축 후 원본 파일 대체"
    echo ""
}

# 기본값 설정
QUALITY=""
OUTPUT_DIR="./compressed"
REPLACE_ORIGINAL=false

# 옵션 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -q|--quality)
            QUALITY="$2"
            shift 2
            ;;
        -t|--target)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -d|--delete)
            REPLACE_ORIGINAL=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "알 수 없는 옵션: $1"
            show_usage
            exit 1
            ;;
    esac
done

# 필수 옵션 확인
if [ -z "$QUALITY" ]; then
    echo "오류: 압축 품질을 선택해야 합니다."
    echo ""
    show_usage
    exit 1
fi

# CRF 값과 프리셋 설정
case $QUALITY in
    1)
        CRF=20
        PRESET="slow"
        AUDIO_BITRATE="192k"
        QUALITY_NAME="고화질"
        ;;
    2)
        CRF=24
        PRESET="medium"
        AUDIO_BITRATE="128k"
        QUALITY_NAME="중간화질"
        ;;
    3)
        CRF=28
        PRESET="fast"
        AUDIO_BITRATE="128k"
        QUALITY_NAME="저화질"
        ;;
    4)
        CRF=32
        PRESET="veryfast"
        AUDIO_BITRATE="96k"
        QUALITY_NAME="최저화질"
        ;;
    *)
        echo "오류: 올바르지 않은 품질 옵션입니다. 1, 2, 3, 4 중 하나를 선택하세요."
        exit 1
        ;;
esac

# 소스 폴더는 현재 폴더로 고정
SOURCE_DIR="."

# -d 옵션 사용 시 -t 옵션 무시
if [ "$REPLACE_ORIGINAL" = true ]; then
    OUTPUT_DIR="./.compress_temp"
    echo "원본 대체 모드: 임시 폴더 사용 ($OUTPUT_DIR)"
fi

# 출력 폴더 확인 및 생성
if [ ! -d "$OUTPUT_DIR" ]; then
    mkdir -p "$OUTPUT_DIR"
    if [ $? -ne 0 ]; then
        echo "오류: 출력 폴더를 생성할 수 없습니다: $OUTPUT_DIR"
        exit 1
    fi
fi

# 절대 경로로 변환
OUTPUT_DIR=$(cd "$OUTPUT_DIR" && pwd)

echo "=== MP4 Compressor ==="
echo "선택된 옵션: $QUALITY_NAME (CRF $CRF)"
echo "소스 폴더: $(pwd)"
if [ "$REPLACE_ORIGINAL" = true ]; then
    echo "원본 파일 대체: 예"
else
    echo "출력 폴더: $OUTPUT_DIR"
fi
echo "현재 폴더의 모든 .mp4 파일을 압축합니다..."
echo

# .mp4 파일 개수 확인
cd "$SOURCE_DIR"
mp4_count=$(find . -maxdepth 1 -name "*.mp4" -type f | wc -l)
if [ $mp4_count -eq 0 ]; then
    echo "압축할 .mp4 파일이 없습니다."
    exit 1
fi

echo "총 $mp4_count 개의 .mp4 파일을 찾았습니다."
echo

# 카운터 초기화
compressed=0
failed=0
replaced=0
total_original_size=0
total_compressed_size=0

# 성공적으로 압축된 파일 목록 저장 (원본 대체용)
declare -a compressed_files

# 모든 .mp4 파일에 대해 반복
for file in *.mp4; do
    # 파일이 실제로 존재하는지 확인
    if [ -f "$file" ]; then
        echo "처리 중: $file"

        # 원본 파일 크기
        original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        original_size_mb=$(echo "scale=2; $original_size / 1048576" | bc)
        echo "  원본 크기: ${original_size_mb}MB"

        # 출력 파일명 생성
        output="$OUTPUT_DIR/$file"

        # 이미 압축된 파일이 존재하는 경우 덮어쓸지 확인
        if [ -f "$output" ]; then
            echo "  경고: $output 파일이 이미 존재합니다. 덮어씁니다."
        fi

        # ffmpeg를 사용하여 압축
        output_filename=$(basename "$output")
        echo "  압축 시작: $file -> $output_filename [$QUALITY_NAME]"

        # 압축 실행
        if ffmpeg -i "$file" -c:v libx264 -c:a aac -crf $CRF -preset $PRESET -b:a $AUDIO_BITRATE "$output" -y 2>/dev/null; then
            # 압축된 파일 크기
            compressed_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
            compressed_size_mb=$(echo "scale=2; $compressed_size / 1048576" | bc)
            reduction=$(echo "scale=2; 100 - ($compressed_size * 100 / $original_size)" | bc)

            echo "  ✓ 성공: $output_filename"
            echo "    압축 크기: ${compressed_size_mb}MB"
            echo "    용량 감소: ${reduction}%"

            compressed=$((compressed + 1))
            total_original_size=$((total_original_size + original_size))
            total_compressed_size=$((total_compressed_size + compressed_size))

            # 성공한 파일 목록에 추가 (원본 대체용)
            if [ "$REPLACE_ORIGINAL" = true ]; then
                compressed_files+=("$file")
            fi
        else
            echo "  ✗ 실패: $file"
            failed=$((failed + 1))
        fi
        echo
    fi
done

# 원본 파일 대체 (옵션이 활성화된 경우)
if [ "$REPLACE_ORIGINAL" = true ] && [ ${#compressed_files[@]} -gt 0 ]; then
    echo
    echo "=== 원본 파일 대체 중 ==="
    for original_file in "${compressed_files[@]}"; do
        compressed_file="$OUTPUT_DIR/$original_file"
        if [ -f "$compressed_file" ]; then
            echo "  대체: $original_file"
            mv "$compressed_file" "$original_file"
            if [ $? -eq 0 ]; then
                replaced=$((replaced + 1))
            else
                echo "    경고: $original_file 대체 실패"
            fi
        fi
    done
    echo "대체 완료: $replaced 개"

    # 임시 폴더 삭제
    if [ -d "$OUTPUT_DIR" ] && [ "$OUTPUT_DIR" = "$(pwd)/.compress_temp" ]; then
        rmdir "$OUTPUT_DIR" 2>/dev/null
    fi
fi

# 결과 요약
echo
echo "=== 압축 완료 ==="
echo "성공: $compressed 개"
echo "실패: $failed 개"
echo "총 처리: $((compressed + failed)) 개"

if [ "$REPLACE_ORIGINAL" = true ]; then
    echo "대체된 파일: $replaced 개"
fi

if [ $compressed -gt 0 ]; then
    total_original_mb=$(echo "scale=2; $total_original_size / 1048576" | bc)
    total_compressed_mb=$(echo "scale=2; $total_compressed_size / 1048576" | bc)
    total_reduction=$(echo "scale=2; 100 - ($total_compressed_size * 100 / $total_original_size)" | bc)

    echo ""
    echo "=== 용량 통계 ==="
    echo "원본 총 크기: ${total_original_mb}MB"
    echo "압축 총 크기: ${total_compressed_mb}MB"
    echo "총 용량 감소: ${total_reduction}%"

    if [ "$REPLACE_ORIGINAL" = false ]; then
        echo ""
        echo "압축된 파일 목록:"
        ls -lh "$OUTPUT_DIR"/*.mp4 2>/dev/null
    fi
fi
