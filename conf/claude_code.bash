# cc - Claude Code launcher
# Usage: cc [options] [worktree_name]
#   -g    GLM mode + launch
#   -c    Claude mode + launch (default)
#   -y    Skip permissions + chrome + teammate mode
#   -w    Worktree mode (isolated git worktree session)
#   -r    Resume session
#   -gr   GLM mode + resume
#   -gry  GLM mode + resume + skip permissions + chrome + teammate mode
#   -gw   GLM mode + worktree
#   -grw  GLM mode + resume + worktree
#   -gryw GLM mode + resume + skip permissions + chrome + teammate + worktree
#
# Examples:
#   cc                        # Claude mode, fresh session
#   cc -g                     # GLM mode, fresh session
#   cc -w my-feature          # Claude mode + worktree named "my-feature"
#   cc -gw fix-bug            # GLM mode + worktree named "fix-bug"
#   cc -grw continue-work     # GLM mode + resume + worktree
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
  local worktree_name=""
  local use_worktree=false

  # Check if first arg is an option (starts with -)
  if [[ "$opt" == -* ]]; then
    # Parse options
    [[ "$opt" == *g* ]] && service_type="g"
    [[ "$opt" == *r* ]] && claude_args+=("--resume")
    [[ "$opt" == *w* ]] && use_worktree=true
    [[ "$opt" == *y* ]] && claude_args+=("--chrome" "--teammate-mode" "auto" "--dangerously-skip-permissions")

    # If worktree option is set, get the name from second argument
    if [[ "$use_worktree" == true ]]; then
      worktree_name="${2:-}"
    fi
  fi

  # Add worktree argument if specified
  if [[ -n "$worktree_name" ]]; then
    claude_args+=("--worktree" "$worktree_name")
  elif [[ "$use_worktree" == true ]]; then
    # -w 옵션은 있지만 이름이 없으면 플래그만 전달
    claude_args+=("--worktree")
  fi

  # Set mode
  case "$service_type" in
    "g")  # GLM 모드
      export ANTHROPIC_AUTH_TOKEN="$GLM_API_KEY"
      export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
      export API_TIMEOUT_MS="3000000"
      export ANTHROPIC_DEFAULT_HAIKU_MODEL="glm-4.5-air"
      export ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.7"
      export ANTHROPIC_DEFAULT_OPUS_MODEL="glm-5"
      ;;
    "c")  # Claude 모드
      unset ANTHROPIC_AUTH_TOKEN
      unset ANTHROPIC_BASE_URL
      unset API_TIMEOUT_MS
      unset ANTHROPIC_DEFAULT_HAIKU_MODEL
      unset ANTHROPIC_DEFAULT_SONNET_MODEL
      unset ANTHROPIC_DEFAULT_OPUS_MODEL
      ;;
  esac

  # Launch Claude
  env "${env_vars[@]}" claude "${claude_args[@]}"
}
