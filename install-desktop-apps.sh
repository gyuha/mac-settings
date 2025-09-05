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
"iterm2" # Terminal
"warp" # Terminal
"linearmouse" # 마우스 이동 조정
"easy-move-plus-resize" # 리눅스 처럼 창 이동 지원
"karabiner-elements" # Keyboard remapping
"fork" # Git GUI
"alt-tab" # Alternate Tab
"iina" # Movie Player
"skim" # PDF Reader
"obsidian" # Markdown Editor
"keka" # zip 압축
"xnviewmp" # 이미지 뷰어
"appcleaner" # App Remover
"double-commander" # File Manager
"rectangle" # Window Manager
"stats" # System monitor for the menu bar
"maccy" # Clipboard manager
"dbeaver-community" # Universal database tool and SQL client
"meld" # Visual diff and merge tool
"kdiff3" # Visual diff and merge tool
"raycast" # Control your tools with a few keystrokes
"another-redis-desktop-manager"
"only-switch" # Top bar switcher
"visual-studio-code" # Open-source code editor
"visual-studio-code-insiders" # Open-source code editor indsiders
"sublime-text" # Text Editor
"zed" # Text Editor
"flameshot" # Screenshot tool
"shottr"
"keyboard-cowboy" # Keyboard Cowboy https://github.com/zenangst/KeyboardCowboy
)

# 미사용
# "couleurs"  // color picker
# "gureumkim" // 구름 입력기

# 실험적인 버전의 소프트웨어를 설치 할 수 있게 해 준다.
# brew tap homebrew/cask-versions

# 목록의 앱 설치 하기
for entry in "${Apps[@]}"
do
	install "$entry"
done
