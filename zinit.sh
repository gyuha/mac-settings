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

# Check if .zshrc exists
if [ ! -f ~/.zshrc ]; then
    echo "📝 Creating new .zshrc file..."
    touch ~/.zshrc
fi

# Add Powerlevel10k instant prompt
cat << 'EOF' > ~/.zshrc
# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

EOF

# Add Zinit initialization to .zshrc
cat << 'EOF' >> ~/.zshrc
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

### End of Zinit installer chunk

# Powerlevel10k theme
zinit ice depth=1; zinit light romkatv/powerlevel10k

# Essential plugins
zinit light zsh-users/zsh-autosuggestions
zinit light zsh-users/zsh-syntax-highlighting
zinit light zsh-users/zsh-completions
zinit light zdharma-continuum/fast-syntax-highlighting

# Load Powerlevel10k configuration
#[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
[[ ! -f ~/.settings/conf/p10k.zsh]] || source ~/.settings/conf/p10k.zsh

# Basic ZSH configurations
HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=10000
setopt appendhistory

# Useful aliases
alias ls='ls -G'
alias ll='ls -lah'
alias grep='grep --color=auto'
EOF

# Download p10k configuration file
curl -L -o ~/.p10k.zsh https://raw.githubusercontent.com/romkatv/powerlevel10k/master/config/p10k-rainbow.zsh

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
