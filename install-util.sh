# 인증 받지 않은 앱 실행하기
sudo spctl --master-disable

export CLICOLOR=1

install() {
	printf "\e[38;5;81m${1}\e[0m\n"
	brew install "${1}"
}

declare -a Apps=(
"autojump"
"bat"
"elgar328/nfd2nfc/nfd2nfc" # MacOS 자소 수정 https://github.com/elgar328/nfd2nfc/blob/main/docs/README.ko.md
"eza"
"fasd"
"fd" 
"ffmpeg-full" 
"font-symbols-only-nerd-font"
"fontconfig"
"fzf" 
"htop"
"imagemagick-full" 
"jq" 
"lf" # file
"ncdu" # Disk usage analyzer with an ncurses interface.
"noborus/tap/ov"         # https://noborus.github.io/ov/
"noevim"
"poppler"
"resvg" 
"ripgrep" 
"sevenzip" 
"thefuck"
"tmux"
"tree"
"yazi" 
"zoxide" 
)

for entry in "${Apps[@]}"
do
	install "$entry"
done

# REF : https://github.com/the0807/ff
curl -fsSL https://raw.githubusercontent.com/the0807/ff/main/install.sh | bash
