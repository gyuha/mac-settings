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

function fzfp() {
	fzf --height 100% --color=bg+:24 --preview '[[ $(file --mime {}) =~ binary ]] &&
					 echo {} is a binary file ||
					 (highlight -O ansi -l {} ||
					  coderay {} ||
					  rougify {} ||
					  cat {}) 2> /dev/null | head -500'
}

#export FZF_DEFAULT_COMMAND=’fd — type f’

plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
  zsh-better-npm-completion
  fzf
  fasd
)

#ZSH_THEME="bira"
ZSH_THEME="agnoster"

if [ -f ~/.config/nvim/init.vim ]
then
	alias vim="nvim"
	alias vi="nvim"
	alias vimdiff="nvim -d"
fi

# prompt host name skip
# ref : https://github.com/agnoster/agnoster-zsh-theme/issues/39
prompt_context() {}
