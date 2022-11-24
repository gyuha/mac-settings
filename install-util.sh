# 인증 받지 않은 앱 실행하기
sudo spctl --master-disable

export CLICOLOR=1

install() {
	printf "\e[38;5;81m${1}\e[0m\n"
	brew install "${1}"
}

install_nvs() {
	export NVS_HOME="$HOME/.nvs"
	git clone https://github.com/jasongin/nvs "$NVS_HOME"
	. "$NVS_HOME/nvs.sh" install
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
)

for entry in "${Apps[@]}"
do
	install "$entry"
done

install_nvs
