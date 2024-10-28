#!/bin/zsh

# Directory for fonts
font_dir="$HOME/Library/Fonts"
mkdir -p "$font_dir"

# Function to download and install fonts
install_font() {  
  local font_name="$1"  
  local url="$2"  
  
  echo "🎨 Installing $font_name Nerd Font..."  
  tmp_dir=$(mktemp -d)  
  curl -L -o "$tmp_dir/$font_name.zip" "$url"  
  unzip -o "$tmp_dir/$font_name.zip" -d "$tmp_dir"  
  mv "$tmp_dir"/*Regular.ttf "$font_dir"  
  rm -rf "$tmp_dir"  
}  

# Base URL for Nerd Fonts  
base_url="https://github.com/ryanoasis/nerd-fonts/releases/latest/download"  

# Array of font names  
fonts_to_install=(  
    "D2Coding"  
    "JetBrainsMono"  
    "UbuntuMono"  
    "Inconsolata"  
    "FiraCode"  
)  

# Install additional fonts using the function  
for font_name in "${fonts_to_install[@]}"; do  
    font_url="$base_url/$font_name.zip"  
    install_font "$font_name" "$font_url"  
done  
