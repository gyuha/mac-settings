# ccv
# This bash function was taken from the following Reddit post: https://www.reddit.com/r/ClaudeAI/comments/1lkfz1h/how_i_use_claude_code/
# ccv.bat for window ccv.bash for mac
# usage in terminul: ccv ccv -y (skip permission) ccv -r (resume session) ccv -ry (skip permission and resume seesion)
# REF : https://github.com/NEWBIE0413/ccv/blob/main/ccv.bash

function ccv() {
    local env_vars=(
        "ENABLE_BACKGROUND_TASKS=true"
        "FORCE_AUTO_BACKGROUND_TASKS=true"
        "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=true"
        "CLAUDE_CODE_ENABLE_UNIFIED_READ_TOOL=true"
    )
    
    local claude_args=()
    if [[ "$1" == "-y" ]]; then
        claude_args+=("--dangerously-skip-permissions")
    elif [[ "$1" == "-r" ]]; then
        claude_args+=("--resume")
    elif [[ "$1" == "-ry" ]] || [[ "$1" == "-yr" ]]; then
        claude_args+=("--resume" "--dangerously-skip-permissions")
    fi
    
    env "${env_vars[@]}" claude "${claude_args[@]}"
}
