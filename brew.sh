#!/bin/zsh

HOME_PATH=$HOME

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo '# Set PATH, MANPATH, etc., for Homebrew.' >> $HOME_PATH/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> $HOME_PATH/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
