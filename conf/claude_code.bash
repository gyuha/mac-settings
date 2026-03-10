# cc - Claude Code launcher
# Usage: cc [options]
#   -y    Skip permissions + chrome + teammate mode
#   -r    Resume session
#   -ry   Resume + skip permissions + chrome + teammate mode
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

  # Parse combined options (e.g., -ry, -yr)
  [[ "$opt" == *r* ]] && claude_args+=("--resume")
  [[ "$opt" == *y* ]] && claude_args+=("--chrome" "--teammate-mode" "auto" "--dangerously-skip-permissions")

  env "${env_vars[@]}" claude "${claude_args[@]}"
}
