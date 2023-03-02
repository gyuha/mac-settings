#!/bin/bash

SCRIPT=$(readlink -f "$0")
BASEDIR=$(dirname "$SCRIPT")
echo $BASEDIR
ln -snf $BASEDIR/bin $HOME/.bin

PROFILE=$HOME"/.zshrc"

ZSH_CUSTOM=${ZSH_CUSTOM:-~/.oh-my-zsh/custom}
# 플러그인 설치
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
    echo "zsh-autosuggestions plugin not found"
    git clone https://github.com/zsh-users/zsh-autosuggestions.git $ZSH_CUSTOM/plugins/zsh-autosuggestions --depth=1
fi

if [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ]; then
    echo "zsh-syntax-highlighting plugin not found"
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM/plugins/zsh-syntax-highlighting --depth=1
fi

if [ ! -d "$ZSH_CUSTOM/plugins/zsh-better-npm-completion" ]; then
    echo "zsh-better-npm-completion plugin not found"
    git clone https://github.com/lukechilds/zsh-better-npm-completion $ZSH_CUSTOM/plugins/zsh-better-npm-completion --depth=1
fi


echo "Copy Settings"
CONFIG_PATH=/Users/gyuha/.settings/conf

ZSHRC_SRC="
# GYUHA SETTINGS
export ZSH=\"$HOME/.oh-my-zsh\"

[ -s $HOME/.settings/conf/zsh_profile.sh ] && . $CONFIG_PATH/zsh_profile.sh
[ -s /opt/homebrew/bin/pyenv ] && . $CONFIG_PATH/pyenv.sh
[ -s $HOME/.nvs/nvs.sh ] && . $CONFIG_PATH/nvs.sh
[ -s /opt/homebrew/bin/jenv ] && . $CONFIG_PATH/jenv.sh

source $ZSH/oh-my-zsh.sh

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
"

# 개인 설정 적용하기
echo "$ZSHRC_SRC" > $PROFILE
