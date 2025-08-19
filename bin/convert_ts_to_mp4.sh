#!/bin/bash

# .ts 파일을 .mp4로 변환하는 스크립트
echo "=== TS to MP4 Converter ==="
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
        echo "  변환 시작: $file -> $output"
        
        # 변환 실행 (전체 영상, 일반 품질 설정)
        if ffmpeg -i "$file" -c:v libx264 -c:a aac -crf 23 -preset medium "$output" -y 2>/dev/null; then
            echo "  ✓ 성공: $output"
            converted=$((converted + 1))
        else
            echo "  ✗ 실패: $file"
            failed=$((failed + 1))
        fi
        echo
    fi
done

# 결과 요약
echo "=== 변환 완료 ==="
echo "성공: $converted 개"
echo "실패: $failed 개"
echo "총 처리: $((converted + failed)) 개"

if [ $converted -gt 0 ]; then
    echo
    echo "변환된 파일 목록:"
    ls -la *.mp4 2>/dev/null
fi