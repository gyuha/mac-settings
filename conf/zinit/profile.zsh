# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
#   source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
# fi

### Added by Zinit installer
source "$HOME/.local/share/zinit/zinit.git/zinit.zsh"
autoload -Uz _zinit
(( ${+_comps} )) && _comps[zinit]=_zinit

# Load a few important annexes, without Turbo
# (this is currently required for annexes)
zinit light-mode for \
    zdharma-continuum/zinit-annex-as-monitor \
    zdharma-continuum/zinit-annex-bin-gem-node \
    zdharma-continuum/zinit-annex-patch-dl \
    zdharma-continuum/zinit-annex-rust

# Powerlevel10k theme
# zinit ice depth=1; zinit light romkatv/powerlevel10k

# Essential plugins
zinit light zsh-users/zsh-autosuggestions
zinit light zsh-users/zsh-syntax-highlighting
zinit light zsh-users/zsh-completions
zinit light zdharma-continuum/fast-syntax-highlighting

# 문법 하이라이팅  
zinit light zdharma-continuum/fast-syntax-highlighting  
# 자동 제안  
zinit light zsh-users/zsh-autosuggestions  
# 명령어 완성  
zinit light zsh-users/zsh-completions


# ls 색상 활성화
zinit ice atclone"dircolors -b LS_COLORS > c.zsh" atpull'%atclone' pick"c.zsh" nocompile'!'
zinit light trapd00r/LS_COLORS


# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.settings/conf/zinit/pp.zsh ]] || source ~/.settings/conf/zinit/pp.zsh

### End of Zinit's installer chunk


