# Powerline-style prompt for Zsh, inspired by the provided image.
# This version uses a robust left/right prompt.

# Enable color support
autoload -U colors && colors

# --- Functions to get prompt data ---

# Get an icon based on the operating system
get_platform_icon() {
    case "$OSTYPE" in
        linux*)
            if [[ -f /proc/version ]] && grep -q -i Microsoft /proc/version; then
                echo "" # Windows icon for WSL (Nerd Font)
            else
                echo "" # Linux (Nerd Font)
            fi
            ;;
        darwin*)
            echo "" # macOS (Nerd Font)
            ;;
        msys*|cygwin*)
            echo "" # Windows (Nerd Font)
            ;;
        *)
            echo "" # Generic (Nerd Font)
            ;;
    esac
}

# Get Git branch and status information
get_git_info() {
    if ! command git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        return
    fi

    local branch
    branch=$(command git rev-parse --abbrev-ref HEAD 2> /dev/null)
    if [[ -z "$branch" ]]; then return; fi

    local git_status
    git_status=$(command git status --porcelain=v1 2> /dev/null)
    local staged_count
    staged_count=$(echo "$git_status" | grep -c -E '^[MARCD]')
    local untracked_count
    untracked_count=$(echo "$git_status" | grep -c '^??')

    local status_str=""
    if [[ "$staged_count" -ne 0 ]]; then
        status_str+=" !${staged_count}"
    fi
    if [[ "$untracked_count" -ne 0 ]]; then
        status_str+=" ?${untracked_count}"
    fi

    echo "  ${branch}${status_str}"
}

# --- Prompt Setup ---

# This function is executed before each prompt
precmd() {
    # --- Colors ---
    local C_BG_ICON='%K{white}'      # White background for the icon
    local C_FG_ICON='%F{black}'      # Black foreground for the icon
    local C_BG_PATH='%K{25}'         # Darker Blue for path
    local C_FG_PATH='%F{white}'      # White foreground for path
    local C_BG_GIT='%K{178}'        # Darker Yellow/Gold for git
    local C_FG_GIT='%F{black}'       # Black foreground for git
    local C_RESET='%k%f'

    # --- Powerline Separator ---
    local SEP_R=''
	local SEP_D=''

    # --- Left Prompt (PROMPT) ---
    local platform_icon=$(get_platform_icon)
    local current_path='%~'
    local git_info=$(get_git_info)

    local prompt_left=""

    # Segment 1: Platform Icon (White BG, Black FG)
    prompt_left+="${C_BG_ICON}${C_FG_ICON} ${platform_icon} "

    # Separator from Icon to Path
    prompt_left+="${C_BG_PATH}%F{white}${SEP_D}"

    # Segment 2: Path (Blue BG, White FG)
    prompt_left+="${C_FG_PATH} ${current_path} "

    if [[ -n "$git_info" ]]; then
        # Separator from Path to Git
        prompt_left+="${C_BG_GIT}%F{25}${SEP_D}"
        # Segment 3: Git (Yellow BG, Black FG)
        prompt_left+="${C_FG_GIT} ${git_info} "
        # Final separator for the git segment
        prompt_left+="${C_RESET}%F{178}${SEP_R}"
    else
        # Final separator if no git info
        prompt_left+="${C_RESET}%F{25}${SEP_R}"
    fi

    # --- Final Assembly ---
    PROMPT="${prompt_left}${C_RESET} "
    RPROMPT="" # Right prompt is disabled
    
    PROMPT+=$'
%F{green}❯%f '
}
