#!/bin/bash

# .ts 파일을 .mp4로 변환하는 스크립트

# 사용법 출력 함수
show_usage() {
    echo "=== TS to MP4 Converter ==="
    echo ""
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  -q, --quality <1-4>   변환 품질 선택 (필수)"
    echo "      1 - 고화질 (CRF 18, 큰 용량)"
    echo "      2 - 중간화질 (CRF 23, 보통 용량) - 권장"
    echo "      3 - 저화질 (CRF 28, 작은 용량)"
    echo "      4 - 최저화질 (CRF 32, 최소 용량)"
    echo ""
    echo "  -d, --delete          변환 완료 후 원본 TS 파일 삭제"
    echo "  -h, --help            도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0 -q 2               # 중간화질로 변환만"
    echo "  $0 -q 4 -d            # 최저화질로 변환 후 TS 파일 삭제"
    echo "  $0 --quality 3 --delete  # 위와 동일"
    echo ""
}

# 기본값 설정
QUALITY=""
DELETE_TS=false

# 옵션 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -q|--quality)
            QUALITY="$2"
            shift 2
            ;;
        -d|--delete)
            DELETE_TS=true
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
    echo "오류: 변환 품질을 선택해야 합니다."
    echo ""
    show_usage
    exit 1
fi

# CRF 값과 프리셋 설정
case $QUALITY in
    1)
        CRF=18
        PRESET="slow"
        AUDIO_BITRATE="192k"
        QUALITY_NAME="고화질"
        ;;
    2)
        CRF=23
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

echo "=== TS to MP4 Converter ==="
echo "선택된 품질: $QUALITY_NAME (CRF $CRF)"
if [ "$DELETE_TS" = true ]; then
    echo "변환 완료 후 원본 TS 파일 삭제: 예"
fi
echo "현재 폴더의 모든 .ts 파일을 .mp4로 변환합니다..."
echo

# .ts 파일 개수 확인
ts_count=$(find . -name "*.ts" -type f | wc -l)
if [ $ts_count -eq 0 ]; then
    echo "변환할 .ts 파일이 없습니다."
    exit 1
fi

echo "총 $ts_count 개의 .ts 파일을 찾았습니다."
echo

# 카운터 초기화
converted=0
failed=0
deleted_ts=0

# 성공적으로 변환된 파일 목록 저장 (TS 삭제용)
declare -a converted_files

# 모든 .ts 파일에 대해 반복
for file in *.ts; do
    # 파일이 실제로 존재하는지 확인
    if [ -f "$file" ]; then
        echo "처리 중: $file"

        # 출력 파일명 생성 (.ts를 .mp4로 변경)
        output="${file%.*}.mp4"

        # 이미 mp4 파일이 존재하는 경우 덮어쓸지 확인
        if [ -f "$output" ]; then
            echo "  경고: $output 파일이 이미 존재합니다. 덮어씁니다."
        fi

        # ffmpeg를 사용하여 변환
        echo "  변환 시작: $file -> $output [$QUALITY_NAME]"

        # 변환 실행
        if ffmpeg -i "$file" -c:v libx264 -c:a aac -crf $CRF -preset $PRESET -b:a $AUDIO_BITRATE "$output" -y 2>/dev/null; then
            echo "  ✓ 성공: $output"
            converted=$((converted + 1))

            # 성공한 파일 목록에 추가
            converted_files+=("$file")
        else
            echo "  ✗ 실패: $file"
            failed=$((failed + 1))
        fi
        echo
    fi
done

# TS 파일 삭제 (옵션이 활성화된 경우)
if [ "$DELETE_TS" = true ] && [ ${#converted_files[@]} -gt 0 ]; then
    echo
    echo "=== 원본 TS 파일 삭제 중 ==="
    for ts_file in "${converted_files[@]}"; do
        if [ -f "$ts_file" ]; then
            echo "  삭제: $ts_file"
            rm "$ts_file"
            if [ $? -eq 0 ]; then
                deleted_ts=$((deleted_ts + 1))
            else
                echo "    경고: $ts_file 삭제 실패"
            fi
        fi
    done
    echo "삭제 완료: $deleted_ts 개"
fi

# 결과 요약
echo
echo "=== 변환 완료 ==="
echo "성공: $converted 개"
echo "실패: $failed 개"
echo "총 처리: $((converted + failed)) 개"

if [ "$DELETE_TS" = true ]; then
    echo "삭제된 TS 파일: $deleted_ts 개"
fi

if [ $converted -gt 0 ]; then
    echo
    echo "변환된 파일 목록:"
    ls -lh *.mp4 2>/dev/null
fi