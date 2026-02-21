#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "이 스크립트는 macOS에서만 실행할 수 있습니다."
  exit 1
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "[정보] Homebrew를 찾을 수 없어 설치를 시작합니다..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
fi

echo "[정보] tmux와 git을 설치합니다..."
brew install tmux git

TPM_DIR="$HOME/.tmux/plugins/tpm"
if [[ -d "$TPM_DIR/.git" ]]; then
  echo "[정보] TPM이 이미 있어 업데이트합니다..."
  git -C "$TPM_DIR" pull --ff-only
else
  echo "[정보] TPM 저장소를 복제합니다..."
  mkdir -p "$(dirname "$TPM_DIR")"
  git clone https://github.com/tmux-plugins/tpm "$TPM_DIR"
fi

ln -snf ~/.settings/conf/tmux.conf ~/.tmux.conf

echo "[완료] tmux + TPM 설치가 완료되었습니다."
echo
echo "다음 단계:"
echo "1) ~/.tmux.conf에 아래 줄을 추가하세요:"
echo "   run '~/.tmux/plugins/tpm/tpm'"
echo "2) tmux를 시작한 뒤 Prefix + I를 누르세요"
