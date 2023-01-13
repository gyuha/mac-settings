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
"linearmouse"
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
"another-redis-desktop-manager"
"meld"
"kdiff3"
"gittyup"
"gitup"
"marta"
"skitch"
"visual-studio-code-insiders"
)

# 실험적인 버전의 소프트웨어를 설치 할 수 있게 해 준다.
brew tap homebrew/cask-versions

# 목록의 앱 설치 하기
for entry in "${Apps[@]}"
do
	install "$entry"
done
