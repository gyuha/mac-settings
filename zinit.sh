#!/bin/zsh

echo "🚀 Starting Zinit and Powerlevel10k installation..."

# Install required fonts for Powerlevel10k
echo "🎨 Installing Meslo Nerd Font..."
font_dir="$HOME/Library/Fonts"
mkdir -p "$font_dir"

# Download all variants of Meslo Nerd Font
fonts=(
    "MesloLGS%20NF%20Regular.ttf"
    "MesloLGS%20NF%20Bold.ttf"
    "MesloLGS%20NF%20Italic.ttf"
    "MesloLGS%20NF%20Bold%20Italic.ttf"
)

for font in "${fonts[@]}"; do
    curl -L -o "$font_dir/${font//\%20/ }" \
        "https://github.com/romkatv/powerlevel10k-media/raw/master/${font}"
done

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
echo "1. Change your terminal font to 'MesloLGS NF' in your terminal preferences"
echo "2. Restart your terminal or run 'source ~/.zshrc'"
echo "3. Run 'p10k configure' if you want to customize your prompt"
echo ""
echo "💡 Installed plugins:"
echo "- Powerlevel10k theme"
echo "- zsh-autosuggestions"
echo "- zsh-syntax-highlighting"
echo "- zsh-completions"
echo "- fast-syntax-highlighting"
