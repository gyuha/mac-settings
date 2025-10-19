#!/usr/bin/env bash

# ==================================================================================
# resterm 설치 스크립트
# ==================================================================================
#
# [설명]
# resterm은 터미널 기반 REST/GraphQL/gRPC 클라이언트입니다.
# Vim 스타일의 키바인딩과 직관적인 UI를 제공하며, .http/.rest 파일을
# 사용하여 API 요청을 관리할 수 있습니다.
#
# [주요 기능]
# - REST, GraphQL, gRPC 지원
# - Vim 스타일 에디터
# - 문법 강조 (Syntax Highlighting)
# - 워크스페이스 기반 프로젝트 관리
# - 요청/응답 비교 (Diff)
# - 멀티 스텝 워크플로우
#
# [기본 사용법]
# 1. 실행: resterm
# 2. 워크스페이스 지정: resterm --workspace /path/to/project
# 3. 프로젝트 디렉토리에 .http 또는 .rest 파일 생성
# 4. 요청 작성 예시:
#    GET https://api.github.com/users/octocat
#    Content-Type: application/json
#
# [키바인딩]
# - Ctrl+Enter: 요청 전송
# - Tab / Shift+Tab: 패널 이동
# - g+r: 요청 목록으로 이동
# - g+i: 에디터로 이동
# - g+p: 응답 패널로 이동
# - q: 종료
#
# [자세한 문서]
# https://github.com/unkn0wn-root/resterm
#
# ==================================================================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 필수 명령어 확인
check_dependencies() {
    if ! command -v curl &> /dev/null && ! command -v wget &> /dev/null; then
        log_error "curl 또는 wget이 설치되어 있어야 합니다."
        log_info "설치 방법:"
        log_info "  Ubuntu/Debian: sudo apt-get install curl"
        log_info "  Fedora/RHEL: sudo dnf install curl"
        log_info "  macOS: brew install curl"
        exit 1
    fi
}

# resterm Quick Install 실행
install_resterm() {
    log_info "공식 설치 스크립트를 사용하여 resterm을 설치합니다..."

    if command -v curl &> /dev/null; then
        log_info "curl을 사용하여 설치 중..."
        if ! curl -fsSL https://raw.githubusercontent.com/unkn0wn-root/resterm/main/install.sh | bash; then
            log_error "설치 실패"
            exit 1
        fi
    elif command -v wget &> /dev/null; then
        log_info "wget을 사용하여 설치 중..."
        if ! wget -qO- https://raw.githubusercontent.com/unkn0wn-root/resterm/main/install.sh | bash; then
            log_error "설치 실패"
            exit 1
        fi
    fi

    log_success "resterm 설치가 완료되었습니다."
}

# 설치 확인
verify_installation() {
    if command -v resterm &> /dev/null; then
        log_success "설치 완료! resterm을 사용할 수 있습니다."
        log_info "실행: resterm"
        log_info "버전 확인: resterm --version"
    else
        log_warn "설치는 완료되었으나 PATH에서 resterm을 찾을 수 없습니다."
        log_info "셸을 재시작하거나 다음 명령을 실행하세요:"
        echo ""
        echo "  source ~/.bashrc  # 또는 source ~/.zshrc"
        echo ""
    fi
}

# 사용 예시 출력
print_usage_examples() {
    echo ""
    echo -e "${GREEN}=== resterm 사용 시작하기 ===${NC}"
    echo ""
    echo "1. 기본 실행:"
    echo "   $ resterm"
    echo ""
    echo "2. 워크스페이스 지정:"
    echo "   $ resterm --workspace ~/my-api-project"
    echo ""
    echo "3. .http 파일 예시 (example.http):"
    echo "   ### GitHub API 테스트"
    echo "   GET https://api.github.com/users/octocat"
    echo "   Accept: application/json"
    echo ""
    echo "   ### POST 요청 예시"
    echo "   POST https://api.example.com/data"
    echo "   Content-Type: application/json"
    echo ""
    echo "   {"
    echo "     \"name\": \"test\","
    echo "     \"value\": 123"
    echo "   }"
    echo ""
    echo "자세한 사용법: https://github.com/unkn0wn-root/resterm"
    echo ""
}

# 메인 실행
main() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  resterm 설치 스크립트${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    check_dependencies
    install_resterm
    verify_installation
    print_usage_examples

    log_success "설치 프로세스가 완료되었습니다!"
}

# 스크립트 실행
main "$@"
