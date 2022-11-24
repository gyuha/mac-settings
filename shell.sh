#!/usr/bin/env bash
# Vim setting base : http://vim.spf13.com/

echo "Copy Settings"
SCRIPT=$(readlink -f "$0")
BASEDIR=$(dirname "$SCRIPT")
echo $BASEDIR
ln -snf $BASEDIR/bin $HOME/.bin


PROFILE=$HOME"/.zshrc"

function usage()
{
    echo "
Gyuha's linux setting install
Usage: `basename $0` [-p]

    -h : help
    "
}


BASHRC_SRC="# GYUHA SETTINGS
CONFIG_PATH=$HOME/.settings/conf
[ -s $HOME/.settings/conf/zsh_profile.sh ] && . $CONFIG_PATH/zsh_profile.sh
[ -s /opt/homebrew/bin/pyenv.sh ] && . $CONFIG_PATH/pyenv.sh
[ -s $HOME/.nvs/nvs.sh ] && . $CONFIG_PATH/nvs.sh
[ -s /opt/homebrew/bin/jenv ] && . $CONFIG_PATH/jenv.sh
# GYUHA SETTINGS END
"

while [[ "$1" == -* ]]; do
    case $1 in
        -h)
            usage;
            exit;
            ;;
    esac
    shift
done

echo $BASHRC_SRC

LINE=`grep -n "# GYUHA" $PROFILE |sed 's/\:.*$//g'`

if [ "$LINE" == "" ]
then
    echo "$BASHRC_SRC" >> $PROFILE
else
	LINE=`expr $LINE - 1`
	echo "Exist profile settings"
	TMP_FILE="tmp"
	head -n $LINE $PROFILE > $TMP_FILE
	echo "$BASHRC_SRC" >> $TMP_FILE
	mv -f $TMP_FILE $PROFILE
fi

echo -e "Type this \\n\\t# source $PROFILE"

# vim, jetbrain... key repeat on
defaults write -g ApplePressAndHoldEnabled -bool false
