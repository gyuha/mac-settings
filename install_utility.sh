#!/usr/bin/env bash

source ./install_common.sh

# Utillity install
utility() {
	apt_add cronolog vim ctags git build-essential g++ curl
	apt_add libssl-dev sysv-rc-conf expect tmux rcconf
	apt_add gawk cmake apt_add exuberant-ctags ncurses-term
	apt_add inxi htop net-tools
}


# Python3
python3() {
	apt_add python3-dev
	apt_add python3-pip
	apt_add python3-virtualenv
}

# Java 8 install
java() {
	repo_add "ppa:webupd8team/java"
	apt_add oracle-java8-installer
}

# mysql 5.6 install
mysql() {
	apt_add mysql-server-5.6 mysql-client-5.6
}

# mariadb install
mariadb() {
	apt_add mariadb-server mariadb-client
}

# Docker
docker() {
	apt_add docker.io
}

# mongodb install
mongodb() {
	sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
	echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
	apt_add mongodb-org
}


if [ $PACKAGES == "all" ]; then
	msg "Install all packages."
	utility;
	docker;
	run_all;
	exit;
fi

source ./install_run.sh
