#!/bin/zsh

echo "🚀 Starting Zinit and Powerlevel10k installation..."

# Create .zsh directory if it doesn't exist
mkdir -p ~/.zsh

# Install Zinit
ZINIT_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}/zinit/zinit.git"
if [ ! -d "$ZINIT_HOME" ]; then
    echo "📦 Installing Zinit..."
    mkdir -p "$(dirname $ZINIT_HOME)"
    git clone https://github.com/zdharma-continuum/zinit.git "$ZINIT_HOME"
else
    echo "✨ Zinit is already installed"
fi

# Download p10k configuration file
curl -L -o ~/.p10k.zsh https://raw.githubusercontent.com/romkatv/powerlevel10k/master/config/p10k-rainbow.zsh

# Check if .zshrc exists
if [ ! -f ~/.zshrc ]; then
    echo "📝 Creating new .zshrc file..."
    touch ~/.zshrc
fi

# Add Zinit initialization to .zshrc
cat << 'EOF' >> ~/.zshrc
source ~/.settings/conf/zsh_profile.sh
[[ ! -f ~/.settings/conf/zinit/profile.zsh ]] || source ~/.settings/conf/zinit/profile.zsh
EOF

echo "✅ Installation completed!"
echo "⚠️ Important steps to complete setup:"
echo "1. Restart your terminal or run 'source ~/.zshrc'"
echo "3. Run 'p10k configure' if you want to customize your prompt"
echo ""
echo "💡 Installed plugins:"
echo "- Powerlevel10k theme"
echo "- zsh-autosuggestions"
echo "- zsh-syntax-highlighting"
echo "- zsh-completions"
echo "- fast-syntax-highlighting"
