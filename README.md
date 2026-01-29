# settings
----

Gyuha's Macos Setting...

## Installation
### brew install
```bash
./homebrew.sh
```
터미널을 새로 띄우고,

```bash
brew install wget
```

### 1. 기본 설정 받기
```bash
wget -O - https://raw.githubusercontent.com/gyuha/mac-settings/master/bootstrap.sh | bash
```

## vim 설정
개인 적인 vim 설정
```bash
curl https://raw.githubusercontent.com/gyuha/vim-start/master/vimrc > ~/.vimrc
```

### zsh 설정
```bash
cd ~/.settings/applications
./zinit.sh

```

### fzf 설치
```bash
cd ~/.settings/applications
./fzf.sh
```
#### fzf key binding
- `ctrl + t` : 파일 찾기
- `ctrl + r` : 커맨드상에서 입력했던 history search
- `alt + c` : 경로 이동 용

-----

## 추가 설정
```bash
# 마우스 휠 가속 끄기
sudo defaults write .GlobalPreferences com.apple.scrollwheel.scaling -1
```

- [macOS에서 마우스 휠 사용시 가속도(acceleration,inertia) 없애는 방법](defaults write .GlobalPreferences com.apple.scrollwheel.scaling -1)

## karabiner 설정
아래 링크를 클릭 합니다.
- [link click](karabiner://karabiner/assets/complex_modifications/import?url=https://raw.githubusercontent.com/gyuha/karabiner-caplock-map/main/caplock.json)
설정 이후에는 한글 키를 `right_option`과 `right_command`를 `F19`로 변경을 해 줘야 합니다.

## AppStore에서 설치 해야 하는 것들
[HotKey App](https://apps.apple.com/kr/app/hotkey-app/id975890633?mt=12) : 단축키 만들어 주는 앱
[올ㅋ사전](https://apps.apple.com/kr/app/snap/id418073146?mt=12) : 화면 하단 Dock의 실행을 `Command + 숫자`로 실행 하도록 해준다.
[Snap](https://apps.apple.com/kr/app/snap/id418073146?mt=12) : 화면 하단 Dock의 실행을 `Command + 숫자`로 실행 하도록 해준다.

## 구름 입력기 설치
맥 기본 입력기 사용시 한글 입력시 문제가 많아서 `구름`입력기를 설치 해 주는게 좋다.
설정 방법
- [구름 입력기](https://gureum.io/)
