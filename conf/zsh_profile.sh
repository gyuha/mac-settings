# GYUHA SETTINGS
export CLICOLOR=1
export LSCOLORS=ExFxCxDxBxegedabagacad

set -o vi

alias tmux="tmux -2"
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
[ -s $HOME/.nvs/nvs.sh ] && . $HOME/.settings/conf/nvs.sh
[ -s /opt/homebrew/bin/jenv ] && . $HOME/.settings/conf/jenv.sh


plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
  zsh-better-npm-completion
  fzf
  fasd
)

alias tmux="tmux -2"
alias vi='vim'
alias of='/usr/bin/nautilus .' # 우분투에서 현재 폴더 탐색기로 열기
alias dgrep="grep --exclude-dir='.git' --exclude='*.swp'"
alias fd='fdfind'

## ls와 관련된 별칭 설정
alias ls='ls --color=auto'
alias ll='ls -l'
alias la='ls -A'
alias l='ls -CF'
alias lt='tree -d'
