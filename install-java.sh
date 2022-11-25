############################################################
# Install jenv
# REF : https://carpfish.tistory.com/entry/jEnv-Mac%EC%97%90-jEnv%EB%A1%9C-%EC%97%AC%EB%9F%AC-%EB%B2%84%EC%A0%84%EC%9D%98-Java-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0
# 설치 이후에 등록을 별로도 해 줘야 한다.
# 아래아 같이 버전별 실행이 필요 함.
#
#  8, 11, 16 등록
#    jenv add  /Library/Java/JavaVirtualMachines/adoptopenjdk-16.jdk/Contents/Home/
#
#  17 등록
#    jenv add /opt/homebrew/Cellar/openjdk@17/17.0.5
#
#  버전 목룍 확인
#    jenv versions

#  버전을 전역으로  사용하기
#    jenv global [version]
#
#  버전 사용하기
#    jenv local [version]


declare -a Apps=(
"jenv"
"java"
"gradle"
"openjdk@17"
)

declare -a CaskApps=(
"AdoptOpenJDK/openjdk/adoptopenjdk8"
"AdoptOpenJDK/openjdk/adoptopenjdk11"
"AdoptOpenJDK/openjdk/adoptopenjdk16"
)


msg() {
	printf "\e[38;5;81m${1}\e[0m\n"
}

install() {
	msg "Install : ${1}"
	brew install "${1}"
}

install_cask() {
	msg "Install : ${1}"
	brew install --cask "${1}"
}

for entry in "${Apps[@]}"
do
	install "$entry"
done

for entry in "${CaskApps[@]}"
do
	install_cask "$entry"
done
