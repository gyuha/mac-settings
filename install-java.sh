############################################################
# Install jenv
# REF : https://carpfish.tistory.com/entry/jEnv-Mac%EC%97%90-jEnv%EB%A1%9C-%EC%97%AC%EB%9F%AC-%EB%B2%84%EC%A0%84%EC%9D%98-Java-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0
# 설치 이후에 등록을 별로도 해 줘야 한다.


declare -a Apps=(
"jenv"
"java"
"AdoptOpenJDK/openjdk/adoptopenjdk8"
"AdoptOpenJDK/openjdk/adoptopenjdk11"
"AdoptOpenJDK/openjdk/adoptopenjdk15"
)


msg() {
	printf "\e[38;5;81m${1}\e[0m\n"
}

install() {
	msg "Install : ${1}"
	brew install "${1}"
}

for entry in "${Apps[@]}"
do
	install "$entry"
done
