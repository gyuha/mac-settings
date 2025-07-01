
### Added by Zinit installer
source "$HOME/.local/share/zinit/zinit.git/zinit.zsh"

autoload -Uz _zinit
(( ${+_comps} )) && _comps[zinit]=_zinit


# 문법 하이라이팅  
zinit light zdharma-continuum/fast-syntax-highlighting  
# 자동 제안  
zinit light zsh-users/zsh-autosuggestions  
# 명령어 완성  
zinit light zsh-users/zsh-completions


# ls 색상 활성화
zinit ice atclone"dircolors -b LS_COLORS > c.zsh" atpull'%atclone' pick"c.zsh" nocompile'!'
zinit light trapd00r/LS_COLORS


[[ ! -f ~/.settings/conf/zinit/pp.zsh ]] || source ~/.settings/conf/zinit/pp.zsh



