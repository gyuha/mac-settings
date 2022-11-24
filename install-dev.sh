# 인증 받지 않은 앱 실행하기
sudo spctl --master-disable

export CLICOLOR=1

install() {
	printf "\e[38;5;81m${1}\e[0m\n"
	brew install "${1}"
}

declare -a Apps=(
"tig"
"gitui"
"tmux"
"pyenv"
"pyenv-virtualenv"
)

for entry in "${Apps[@]}"
do
	install "$entry"
done
