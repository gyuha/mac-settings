# 인증 받지 않은 앱 실행하기
sudo spctl --master-disable

export CLICOLOR=1

install() {
	printf "\e[38;5;81m${1}\e[0m\n"
	brew install "${1}"
}

declare -a Apps=(
"noevim"
"fzf"
"ripgrep"
"fd"
"fasd"
"eza"
"thefuck"
"autojump"
"bat"
"tmux"
"noborus/tap/ov"         # https://noborus.github.io/ov/
"tree"
"lf" # file
"ncdu" # Disk usage analyzer with an ncurses interface.
"htop"
)

for entry in "${Apps[@]}"
do
	install "$entry"
done

curl -fsSL https://raw.githubusercontent.com/the0807/ff/main/install.sh | bash
