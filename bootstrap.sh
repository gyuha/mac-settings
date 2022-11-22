#!/usr/bin/env bash

# SETUP Paramters
app_name=settings
git_uri='https://github.com/gyuha/mac-settings.git'
git_branch=''
debug_mode=0
fork_maintainer='0'

# BASIC SETUP TOOLS
msg() {
    printf '%b\n' "$1" >&2
}

success() {
    if [ "$ret" -eq '0' ]; then
    msg "\e[32m[✔]\e[0m ${1}${2}"
    fi
}

error() {
    msg "\e[31m[✘]\e[0m ${1}${2}"
    exit 1
}

debug() {
    if [ "$debug_mode" -eq '1' ] && [ "$ret" -gt '1' ]; then
      msg "An error occured in function \"${FUNCNAME[$i+1]}\" on line ${BASH_LINENO[$i+1]}, we're sorry for that."
    fi
}

program_exists() {
    local ret='0'
    type $1 >/dev/null 2>&1 || { local ret='1'; }

    # throw error on non-zero return value
    if [ ! "$ret" -eq '0' ]; then
    error "$2"
    fi
}

############################ SETUP FUNCTIONS
lnif() {
    if [ -e "$1" ]; then
        ln -sf "$1" "$2"
    fi
    ret="$?"
    debug
}

do_backup() {
    if [ -e "$2" ] || [ -e "$3" ] || [ -e "$4" ]; then
        today=`date +%Y%m%d_%s`
        for i in "$2" "$3" "$4"; do
            [ -e "$i" ] && [ ! -L "$i" ] && mv "$i" "$i.$today";
        done
        ret="$?"
        success "$1"
        debug
   fi
}

upgrade_repo() {
      msg "trying to update $1"

      if [ "$1" = "$app_name" ]; then
          cd "$HOME/.$app_name" &&
          git pull origin "$git_branch"
      fi

      if [ "$1" = "vundle" ]; then
          cd "$HOME/.vim/bundle/vundle" &&
          git pull origin master
      fi

      ret="$?"
      success "$2"
      debug
}


# SETUP FUNCTIONS
clone_repo() {
    program_exists "git" "Sorry, we cannot continue without GIT, please install it first."
    endpath="$HOME/.$app_name"

    if [ ! -e "$endpath/.git" ]; then
        #git clone --recursive -b "$git_branch" "$git_uri" "$endpath"
        git clone --recursive "$git_uri" "$endpath"
        ret="$?"
        success "$1"
        debug
    else
        upgrade_repo "$app_name"    "Successfully updated $app_name"
    fi
}

clone_vundle() {
    if [ ! -e "$HOME/.vim/bundle/vundle" ]; then
        git clone https://github.com/gmarik/vundle.git "$HOME/.vim/bundle/vundle"
    else
        upgrade_repo "vundle"   "Successfully updated vundle"
    fi
    ret="$?"
    success "$1"
    debug
}

create_symlinks() {
    endpath="$HOME/.$app_name/vim"

    lnif "$endpath/vimrc"              "$HOME/.vimrc"
    lnif "$endpath/vimrc.bundles"      "$HOME/.vimrc.bundles"

    # Useful for fork maintainers
    touch  "$HOME/.vimrc.local"

    if [ -e "$endpath/.vimrc.fork" ]; then
        ln -sf "$endpath/.vimrc.fork" "$HOME/.vimrc.fork"
    elif [ "$fork_maintainer" -eq '1' ]; then
       touch "$HOME/.vimrc.fork"
       touch "$HOME/.vimrc.bundles.fork"
    fi

    if [ -e "$endpath/.vimrc.bundles.fork" ]; then
        ln -sf "$endpath/.vimrc.bundles.fork" "$HOME/.vimrc.bundles.fork"
    fi

    if [ ! -d "$endpath/.vim/bundle" ]; then
        mkdir -p "$endpath/.vim/bundle"
    fi

    if [ ! -d "$endpath/.vim/tmp" ]; then
        mkdir -p "$endpath/.vim/tmp"
    fi

    if [ ! -d "$endpath/.vim/backup" ]; then
        mkdir -p "$endpath/.vim/backup"
    fi

	ret="$?"
    success "$1"
    debug
}


setup_vundle() {
    system_shell="$SHELL"
    export SHELL='/bin/sh'
    vim -u "$HOME/.vimrc.bundles" +BundleInstall! +BundleClean +qall
    export SHELL="$system_shell"

    success "$1"
    debug
}


usage()
{
	echo -e "Setting ubuntu shell
Usage: `basename $0` [-a OR ID OR name] [-h]
	-h : help
	"
}

clone_repo "Successfully cloned $app_name"

POWERLINE=""
case "$1" in
	"-h")
		usage;
		exit 0;
		;;
	"-p")
		POWERLINE="-p"
		;;
esac

msg "$HOME/.$app_name"
cd "$HOME/.$app_name"
./shell.sh $POWERLINE
