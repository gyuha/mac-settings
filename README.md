settings
========

Gyuha's Macos Setting...

## Installation
### 1. 기본 설정 받기
```bash
wget -O - https://raw.githubusercontent.com/gyuha/mac-settings/master/bootstrap.sh | bash
```

## vim 설정
개인 적인 vim 설정
```bash
curl https://raw.githubusercontent.com/gyuha/vim-start/master/vimrc > ~/.vimrc
```

### zsh 설치
```bash
cd ~/.settings/applications
./zsh.sh
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

## AppStore에서 설치 해야 하는 것들
[Snap](https://apps.apple.com/kr/app/snap/id418073146?mt=12) : 화면 하단 Dock의 실행을 `Command + 숫자`로 실행 하도록 해준다.
