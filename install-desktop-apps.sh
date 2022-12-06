# 인증 받지 않은 앱 실행하기
sudo spctl --master-disable

export CLICOLOR=1

install() {
	printf "\e[38;5;81m${1}\e[0m\n"
	brew install --cask "${1}"
}

declare -a Apps=(
"firefox"
"brave-browser"
"iterm2"
"easy-move-plus-resize"
"karabiner-elements"
"sourcetree"
"alt-tab"
"iina"
"keka"
"xnviewmp"
"appcleaner"
"couleurs"
"double-commander"
"rectangle"
"obsidian"
"stats"
"maccy"
"notion-enhanced"
"visual-studio-code"
"dbeaver-community"
"linearmouse"
"meld"
"kdiff3"
"gittyup"
"gitup"
"marta"
"skitch"
)

for entry in "${Apps[@]}"
do
	install "$entry"
done
