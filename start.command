#!/bin/bash
# 인라이븐스페이스 로컬 미리보기 서버
# 사용법: 이 파일을 Finder에서 더블클릭하세요.

cd "$(dirname "$0")"

PORT=8080
while lsof -i:$PORT -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

URL="http://localhost:$PORT/"

echo ""
echo "========================================"
echo "  Enliven Space 로컬 미리보기"
echo "========================================"
echo ""
echo "  주소:  $URL"
echo ""
echo "  - 잠시 후 크롬이 자동으로 열립니다."
echo "  - 종료: 이 창에서 Ctrl+C 또는 창 닫기"
echo ""
echo "========================================"
echo ""

# 서버가 뜰 시간 잠깐 주고 브라우저 열기
( sleep 1 && open -a "Google Chrome" "$URL" 2>/dev/null || open "$URL" ) &

# Python 내장 웹서버로 현재 폴더를 띄움
exec python3 -m http.server "$PORT"
