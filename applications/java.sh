#!/usr/bin/env bash
# =============================================================================
# java.sh — SDKMAN 설치 및 Java 설치 스크립트
# 참고: https://sdkman.io/install/
# =============================================================================
#
# ┌─────────────────────────────────────────────────────────────────────────┐
# │                        SDKMAN 간단 사용 설명서                          │
# ├─────────────────────────────────────────────────────────────────────────┤
# │  SDKMAN(Software Development Kit Manager)은 Java, Scala, Groovy,       │
# │  Kotlin, Maven, Gradle 등 다양한 JVM 생태계 SDK를 버전별로 관리하는    │
# │  도구입니다. 여러 버전을 병렬로 설치하고 손쉽게 전환할 수 있습니다.   │
# │                                                                         │
# │  ▶ 초기화 (새 셸 세션에서 sdk 명령어 사용 시)                          │
# │    source "$HOME/.sdkman/bin/sdkman-init.sh"                           │
# │                                                                         │
# │  ▶ SDKMAN 버전 확인                                                     │
# │    sdk version                                                           │
# │                                                                         │
# │  ▶ SDKMAN 자체 업데이트                                                 │
# │    sdk selfupdate                                                        │
# │                                                                         │
# │  ┌── 설치 ────────────────────────────────────────────────────────────┐ │
# │  │  sdk install java              # 최신 LTS 버전 설치                │ │
# │  │  sdk install java 21.0.5-tem   # 특정 버전 설치 (Temurin 21)       │ │
# │  │  sdk install java 17.0.13-tem  # Java 17 설치                      │ │
# │  │  sdk install maven             # Maven 최신 버전 설치               │ │
# │  │  sdk install gradle            # Gradle 최신 버전 설치              │ │
# │  └───────────────────────────────────────────────────────────────────┘ │
# │                                                                         │
# │  ┌── 목록 조회 ───────────────────────────────────────────────────────┐ │
# │  │  sdk list                      # 지원하는 모든 SDK 목록            │ │
# │  │  sdk list java                 # 설치 가능한 Java 버전 전체 목록   │ │
# │  │  sdk current                   # 현재 활성화된 모든 SDK 버전       │ │
# │  │  sdk current java              # 현재 사용 중인 Java 버전          │ │
# │  └───────────────────────────────────────────────────────────────────┘ │
# │                                                                         │
# │  ┌── 버전 전환 ───────────────────────────────────────────────────────┐ │
# │  │  sdk use java 17.0.13-tem      # 현재 셸에서만 임시 전환           │ │
# │  │  sdk default java 21.0.5-tem   # 기본 버전으로 영구 설정           │ │
# │  └───────────────────────────────────────────────────────────────────┘ │
# │                                                                         │
# │  ┌── 프로젝트별 환경 (.sdkmanrc) ────────────────────────────────────┐ │
# │  │  sdk env init                  # .sdkmanrc 파일 생성               │ │
# │  │  sdk env                       # .sdkmanrc 설정 적용               │ │
# │  │  sdk env clear                 # 기본 버전으로 복구                 │ │
# │  └───────────────────────────────────────────────────────────────────┘ │
# │                                                                         │
# │  ┌── 업그레이드 / 제거 ──────────────────────────────────────────────┐ │
# │  │  sdk upgrade                   # 구버전 SDK 업그레이드 확인        │ │
# │  │  sdk upgrade java              # Java 업그레이드 가능 버전 확인    │ │
# │  │  sdk uninstall java 17.0.13-tem # 특정 버전 제거                   │ │
# │  └───────────────────────────────────────────────────────────────────┘ │
# │                                                                         │
# │  ▶ Java 벤더 식별자 예시                                               │
# │    -tem  Eclipse Temurin (권장, 무료 LTS)                              │
# │    -graalce  GraalVM Community Edition                                  │
# │    -zulu  Azul Zulu OpenJDK                                             │
# │    -amzn  Amazon Corretto                                               │
# │    -librca  Bellsoft Liberica                                           │
# └─────────────────────────────────────────────────────────────────────────┘
#
# =============================================================================

set -euo pipefail

# root 실행 방지
if [ "${UID}" -eq 0 ]; then
    echo "root로 실행하지 마세요. 일반 사용자로 실행해 주세요."
    exit 1
fi

# 설치할 Java 버전 (인자로 덮어쓸 수 있음)
JAVA_VERSION="${1:-21.0.7-tem}"

echo "========================================="
echo " SDKMAN 설치 시작"
echo "========================================="

# SDKMAN이 이미 설치된 경우 건너뜀
if [ -d "$HOME/.sdkman" ] && [ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]; then
    echo "[INFO] SDKMAN이 이미 설치되어 있습니다. 건너뜁니다."
else
    echo "[INFO] SDKMAN 설치 중..."
    curl -s "https://get.sdkman.io" | bash

    echo "[INFO] SDKMAN 설치 완료."
fi

# 현재 셸 세션에 SDKMAN 로드
# shellcheck source=/dev/null
source "$HOME/.sdkman/bin/sdkman-init.sh"

echo ""
echo "========================================="
echo " Java ${JAVA_VERSION} 설치 시작 (via SDKMAN)"
echo "========================================="

# 이미 설치된 경우 건너뜀
if sdk list java 2>/dev/null | grep -q "installed.*${JAVA_VERSION}\|${JAVA_VERSION}.*installed"; then
    echo "[INFO] Java ${JAVA_VERSION}가 이미 설치되어 있습니다."
else
    echo "[INFO] Java ${JAVA_VERSION} 설치 중..."
    sdk install java "${JAVA_VERSION}"
fi

echo ""
echo "========================================="
echo " 설치 완료"
echo "========================================="
sdk current java

echo ""
echo "[INFO] 새 터미널을 열거나 아래 명령어를 실행하면 sdk 명령어를 바로 사용할 수 있습니다:"
echo "       source \"\$HOME/.sdkman/bin/sdkman-init.sh\""
echo ""
echo "[INFO] 다른 Java 버전 목록 확인:"
echo "       sdk list java"
