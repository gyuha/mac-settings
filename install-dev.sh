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
"bit" 	# Bit is a modern Git CLI.
#"pyenv"
#"pyenv-virtualenv"
#"poetry"
)

msg() {
	printf "\e[38;5;81m${1}\e[0m\n"
}

install() {
	msg "Install : ${1}"
	brew install "${1}"
}



#poetry config virtualenvs.in-project true
#poetry config virtualenvs.path "./.venv"

install_nvs() {
	msg "Install : nvs"
	export NVS_HOME="$HOME/.nvs"
	git clone https://github.com/jasongin/nvs "$NVS_HOME"
	. "$NVS_HOME/nvs.sh" install
}

install_uv() {
	# Python version and package manager
	msg "Install : uv"
	# On macOS and Linux.
	curl -LsSf https://astral.sh/uv/install.sh | sh
}

install_volta() {
	# Node Package Manager
	msg "Install : volta"
	curl https://get.volta.sh | bash
}

ln -snf ~/.settings/conf/ideavimrc ~/.ideavimrc

for entry in "${Apps[@]}"
do
	install "$entry"
done

install_nvs
install_uv
# install_volta
