# 인증 받지 않은 앱 실행하기
sudo spctl --master-disable

export CLICOLOR=1

install() {
	printf "\e[38;5;81m${1}\e[0m\n"
	brew install "${1}"
}

declare -a Apps=(
"fzf"
"ripgrep"
"fd"
"thefuck"
"autojump"
"zsh-autosuggestions"
"zsh-syntax-highlighting"
"bat"
"tmux"
"noborus/tap/ov"         # https://noborus.github.io/ov/
"tree"
)

for entry in "${Apps[@]}"
do
	install "$entry"
done

install_nvs
