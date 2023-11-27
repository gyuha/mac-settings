#!/bin/bash
# GIT HUB 세팅하기

NAME=""

# 사용법에 대한 함수.
function usage()
{
	echo "Usage: `basename $0` [-h] EMAIL NAME [ssh reset]"
	echo "Git user settings"
	echo "	-h : help"
	echo "	EMAIL : User email address"
	echo "	NAME  : Name used in the git"
	echo "	ssh reset : if YES ssh reset. [option]"
}

while getopts :hr: optname ;do
	case $optname in
		h)
			usage; exit 1;;
		*)
			usage; exit 1;;
	esac
done

# 만약 파라메터 2개가 아니면 종료
[ $# -lt 2 ] && usage && exit 1

regex="^[a-z0-9!#\$%&'*+/=?^_\`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?\$"
if [[ $1 =~ $regex ]]
then
	EMAIL=$1
else
	echo "ERROR : Email is wrong."
	exit 1;
fi

NAME=$2

# Default git setting
git config --global user.name "$NAME"
git config --global user.email $EMAIL

git config --global core.editor vim
git config --global push.default matching
git config --global diff.tool vimdiff
git config --global difftool.prompt false
git config --global core.autocrlf false

git config --global alias.l "log --graph --abbrev-commit --decorate --date=relative --format=format:'%C(bold blue)%h%C(reset)%x09%C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all"
git config --global alias.ls "log --graph --abbrev-commit --decorate --date=relative --format=format:'%C(bold blue)%h%C(reset)%x09%C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all"
git config --global alias.filelog "log -u"
git config --global alias.fl "log -u"
git config --global alias.dl "'!git ll -1'"
git config --global alias.dlc "diff --cached HEAD^ "
git config --global alias.assume "update-index --assume-unchanged"
git config --global alias.unassume "update-index --no-assume-unchanged"
git config --global alias.assumed "'!git ls-files -v | grep ^h | cut -c 3-'"
git config --global alias.lasttag "describe --tags --abbrev=0"
git config --global alias.lt "describe --tags --abbrev=0"
git config --global alias.ours "'!f() { git co --ours $@ && git add $@; }; f'"
git config --global alias.theirs "'!f() { git co --theirs $@ && git add $@; }; f'"
git config --global alias.fo "fetch origin"
git config --global alias.cp "cherry-pick"
git config --global alias.st "status -s"
git config --global alias.cl "clone"
git config --global alias.ci "commit"
git config --global alias.co "checkout"
git config --global alias.cob "checkout -b "
git config --global alias.br "branch"
git config --global alias.diff "diff --word-diff"
git config --global alias.dc "diff --cached"
git config --global alias.d difftool
git config --global alias.r "reset"
git config --global alias.r1 "reset HEAD^ "
git config --global alias.r2 "reset HEAD^^"
git config --global alias.rh "reset --hard HEAD"
git config --global alias.rh1 "reset HEAD^ --hard"
git config --global alias.rh2 "reset HEAD^^ --hard"
git config --global alias.sl "stash list"
git config --global alias.sa "stash apply"
git config --global alias.ss "stash save"
git config --global alias.url "config remote.origin.url"

# git https auth cache
# git config --global credential.helper cache

# Git Aliases Setting
if [ "$3" = "YES" ]
then
	cd ~/.ssh
	# Checks to see if there is a directory named ".ssh" in your user director
	mkdir key_backup
	cp id_rsa* key_backup
	rm id_rsa*
	ssh-keygen -t rsa -C $EMAIL

	echo "GO HERE : https://github.com/settings/ssh"
	echo "============= Copy Bottom text ============"
	cat id_rsa.pub
	echo "==========================================="
fi
