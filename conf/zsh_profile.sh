# GYUHA SETTINGS

## Function to create alias if command exists
create_alias_if_exists() {
    local cmd=$1    # Original command
    local alias=$2  # Alias to create

    if command -v "$cmd" &> /dev/null; then
        alias "$alias"="$cmd"
    fi
}

export CLICOLOR=1
export LSCOLORS=ExFxCxDxBxegedabagacad

set -o vi

alias tn='ts-node'

export FZF_DEFAULT_OPTS='
--color=dark
--border
--color=fg:-1,bg:-1,hl:#c678dd,fg+:#ffffff,bg+:#4b5263,hl+:#d858fe
--color=info:#98c379,prompt:#61afef,pointer:#be5046,marker:#e5c07b,spinner:#61afef,header:#61afef
'

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

function fzfp() {
	fzf --height 100% --color=bg+:24 --preview '[[ $(file --mime {}) =~ binary ]] &&
					 echo {} is a binary file ||
					 (highlight -O ansi -l {} ||
					  coderay {} ||
					  rougify {} ||
					  cat {}) 2> /dev/null | head -500'
}

[ -s /opt/homebrew/bin/pyenv ] && . $HOME/.settings/conf/pyenv.sh
[ -s /opt/homebrew/bin/jenv ] && . $HOME/.settings/conf/jenv.sh
[ -f $HOME/.settings/conf/claude_code.bash ] && . $HOME/.settings/conf/claude_code.bash

# Basic ZSH configurations
HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=10000
setopt appendhistory

# alias tmux="tmux -2"
alias tm="tmux -2"
alias vi='nvim'
alias dgrep="grep --exclude-dir='.git' --exclude='*.swp'"
alias pn='pnpm'

## ls와 관련된 별칭 설정
alias ls='ls -G'
alias ll='ls -lah'
alias la='ls -A'
alias l='ls -CF'
alias lt='tree -d'
alias grep='grep --color=auto'

alias y='yazi'

## appliation
alias oc='opencode'

PATH=$PATH:~/.settings/bin
