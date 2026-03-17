# cc - Claude Code launcher
# Usage: cc [options]
#   -g    GLM mode + launch
#   -c    Claude mode + launch (default)
#   -y    Skip permissions + chrome + teammate mode
#   -r    Resume session
#   -gr   GLM mode + resume
#   -gry  GLM mode + resume + skip permissions + chrome + teammate mode
# REF: https://github.com/NEWBIE0413/ccv/blob/main/ccv.bash

function cc() {
  local env_vars=(
    "ENABLE_BACKGROUND_TASKS=true"
    "FORCE_AUTO_BACKGROUND_TASKS=true"
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=true"
    "CLAUDE_CODE_ENABLE_UNIFIED_READ_TOOL=true"
  )

  local claude_args=()
  local opt="${1:-}"
  local service_type="c"  # default to Claude mode

  # Parse options
  [[ "$opt" == *g* ]] && service_type="g"
  [[ "$opt" == *r* ]] && claude_args+=("--resume")
  [[ "$opt" == *y* ]] && claude_args+=("--chrome" "--teammate-mode" "auto" "--dangerously-skip-permissions")

  # Set mode
  case "$service_type" in
    "g")  # GLM 모드
      export ANTHROPIC_AUTH_TOKEN="$GLM_API_KEY"
      export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
      export ANTHROPIC_VERSION="2023-06-01"
      export API_TIMEOUT_MS="3000000"
      export ANTHROPIC_DEFAULT_HAIKU_MODEL="glm-4.5-air"
      export ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.7"
      export ANTHROPIC_DEFAULT_OPUS_MODEL="glm-5"
      ;;
    "c")  # Claude 모드
      unset ANTHROPIC_AUTH_TOKEN
      unset ANTHROPIC_BASE_URL
      unset ANTHROPIC_VERSION
      unset API_TIMEOUT_MS
      unset ANTHROPIC_DEFAULT_HAIKU_MODEL
      unset ANTHROPIC_DEFAULT_SONNET_MODEL
      unset ANTHROPIC_DEFAULT_OPUS_MODEL
      ;;
  esac

  # Launch Claude
  env "${env_vars[@]}" claude "${claude_args[@]}"
}
