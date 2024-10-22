#!/bin/bash

# Install Zinit
bash -c "$(curl --fail --show-error --silent --location https://raw.githubusercontent.com/zdharma-continuum/zinit/HEAD/scripts/install.sh)"

# Configure .zshrc
cat <<EOT > ~/.zshrc

[[ ! -f ~/.settings/conf/zsh_profile.sh ]] || source ~/.settings/conf/zsh_profile.sh
[[ ! -f ~/.settings/conf/zinit/profile.zsh ]] || source ~/.settings/conf/zinit/profile.zsh

EOT

# Print completion message
echo "Zinit installation complete!"
echo "Please restart your terminal or run 'source ~/.zshrc' to apply changes."
echo "After restarting, you may want to run 'p10k configure' to set up the Powerlevel10k theme."
