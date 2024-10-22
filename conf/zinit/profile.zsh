# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

### Added by Zinit's installer  
if [[ ! -f $HOME/.local/share/zinit/zinit.git/zinit.zsh ]]; then  
    print -P "%F{33} %F{220}Installing %F{33}ZDHARMA-CONTINUUM%F{220} Initiative Plugin Manager (%F{33}zdharma-continuum/zinit%F{220})…%f"  
    command mkdir -p "$HOME/.local/share/zinit" && command chmod g-rwX "$HOME/.local/share/zinit"  
    command git clone https://github.com/zdharma-continuum/zinit "$HOME/.local/share/zinit/zinit.git" && \
        print -P "%F{33} %F{34}Installation successful.%f%b" || \
        print -P "%F{160} The clone has failed.%f%b"  
fi  

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

# 문법 하이라이팅  
zinit light zdharma-continuum/fast-syntax-highlighting  
# 자동 제안  
zinit light zsh-users/zsh-autosuggestions  
# 명령어 완성  
zinit light zsh-users/zsh-completions

zinit ice depth=1; zinit light romkatv/powerlevel10k

# ls 색상 활성화
zinit ice atclone"dircolors -b LS_COLORS > c.zsh" atpull'%atclone' pick"c.zsh" nocompile'!'
zinit light trapd00r/LS_COLORS



# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.settings/conf/zinit/p10k.zsh ]] || source ~/.settings/conf/zinit/p10k.zsh
# [[ ! -f ~/.settings/conf/zinit/p10k-lite.zsh ]] || source ~/.settings/conf/zinit/p10k-lite.zsh
# [[ ! -f ~/.settings/conf/zinit/p10k-prd.zsh ]] || source ~/.settings/conf/zinit/p10k-prd.zsh

### End of Zinit's installer chunk


