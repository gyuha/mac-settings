############################################################
# Install Docker and Docker compose
# REF
#  - https://assu10.github.io/dev/2022/02/02/rancher-desktop/
#


declare -a Apps=(
"docker"
"docker-compose"
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
