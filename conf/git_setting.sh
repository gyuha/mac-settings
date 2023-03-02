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
git config --global color.ui "auto"
git config --global merge.tool vimdiff
git config --global color.branch auto
git config --global color.diff auto
git config --global color.interactive auto
git config --global color.status auto
git config --global core.editor vim
git config --global push.default matching
git config --global diff.tool vimdiff
git config --global difftool.prompt false
git config --global core.autocrlf false
git config --global credential.helper store

# Default git alias settings
#  Reference URL : http://durdn.com/blog/2012/11/22/must-have-git-aliases-advanced-examples
git config --global alias.l 'log --pretty=format:"%C(yellow)%h\\ [%ad]%Cred%d\\ %Creset%s%Cblue\\ [%cn]" --decorate --date=short --graph'
git config --global alias.ls 'log --pretty=format:"%C(yellow)%h%Cred%d\\ %Creset%s%Cblue\\ [%cn]" --decorate --graph'
git config --global alias.ll 'log --pretty=format:"%C(yellow)%h%Cred%d\\ %Creset%s%Cblue\\ [%cn]" --decorate --numstat'
git config --global alias.lnc 'log --pretty=format:"%h\\ %s\\ [%cn]"'
git config --global alias.lds 'log --pretty=format:"%C(yellow)%h\\ %ad%Cred%d\\ %Creset%s%Cblue\\ [%cn]" --decorate --date=short'
git config --global alias.ld 'log --pretty=format:"%C(yellow)%h\\ %ad%Cred%d\\ %Creset%s%Cblue\\ [%cn]" --decorate --date=relative'
git config --global alias.le 'log --oneline --decorate'
git config --global alias.filelog 'log -u'
git config --global alias.fl 'log -u'
git config --global alias.dl '"!git ll -1"'
git config --global alias.dlc 'diff --cached HEAD^'
git config --global alias.f '"!git ls-files | grep -i"'
git config --global alias.grep 'grep -Ii'
git config --global alias.gr 'grep -Ii'
git config --global alias.gra '"!f() { A=$(pwd) && TOPLEVEL=$(git rev-parse --show-toplevel) && cd $TOPLEVEL && git grep --full-name -In $1 | xargs -I{} echo $TOPLEVEL/{} && cd $A; }; f"'
git config --global alias.la '"!git config -l | grep alias | cut -c 7-"'
git config --global alias.done '"!f() { git branch | grep "$1" | cut -c 3- | grep -v done | xargs -I{} git branch -m {} done-{}; }; f"'
git config --global alias.assume 'update-index --assume-unchanged'
git config --global alias.unassume 'update-index --no-assume-unchanged'
git config --global alias.assumed '"!git ls-files -v | grep ^h | cut -c 3-"'
git config --global alias.unassumeall '"!git assumed | xargs git update-index --no-assume-unchanged"'
git config --global alias.assumeall '"!git st -s | awk {'print $2'} | xargs git assume"'
git config --global alias.lasttag 'describe --tags --abbrev=0'
git config --global alias.lt 'describe --tags --abbrev=0'
git config --global alias.ours '"!f() { git co --ours $@ && git add $@; }; f"'
git config --global alias.theirs '"!f() { git co --theirs $@ && git add $@; }; f"'
git config --global alias.cp 'cherry-pick'
git config --global alias.st 'status -s'
git config --global alias.cl 'clone'
git config --global alias.ci 'commit'
git config --global alias.ca 'commit --amend'
git config --global alias.co 'checkout'
git config --global alias.br 'branch'
git config --global alias.diff 'diff --word-diff'
git config --global alias.dc 'diff --cached'
git config --global alias.d difftool
git config --global alias.r 'reset'
git config --global alias.r1 'reset HEAD^'
git config --global alias.r2 'reset HEAD^^'
git config --global alias.rh 'reset --hard HEAD'
git config --global alias.rh1 'reset HEAD^ --hard'
git config --global alias.rh2 'reset HEAD^^ --hard'
git config --global alias.svnr 'svn rebase'
git config --global alias.svnd 'svn dcommit'
git config --global alias.svnl 'svn log --oneline --show-commit'
git config --global alias.sl 'stash list'
git config --global alias.sa 'stash apply'
git config --global alias.ss 'stash save'
git config --global alias.url 'config remote.origin.url'
git config --global alias.authReset 'config --system --unset credential.helper'

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
