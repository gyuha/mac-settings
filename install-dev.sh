######
# Install
# - dev tools
# - pyenv
# - nvs
#

declare -a Apps=(
"tig"
"gitui"
"tmux"
"pyenv"
"pyenv-virtualenv"
"poetry"
)

msg() {
	printf "\e[38;5;81m${1}\e[0m\n"
}

install() {
	msg "Install : ${1}"
	brew install "${1}"
}


for entry in "${Apps[@]}"
do
	install "$entry"
done

poetry config virtualenvs.in-project true
poetry config virtualenvs.path "./.venv"

install_nvs() {
	msg "Install : nvs"
	export NVS_HOME="$HOME/.nvs"
	git clone https://github.com/jasongin/nvs "$NVS_HOME"
	. "$NVS_HOME/nvs.sh" install
}

ln -snf ~/.settings/conf/ideavimrc ~/.ideavimrc

install_nvs
