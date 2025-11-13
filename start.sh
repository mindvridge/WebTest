#!/bin/bash

# Chef's Last Stand 게임 실행 스크립트
echo "=================================="
echo "Chef's Last Stand 게임을 시작합니다..."
echo "=================================="
echo ""

# node_modules가 없으면 설치
if [ ! -d "node_modules" ]; then
    echo "의존성 패키지를 설치합니다..."
    npm install
    echo ""
fi

# 개발 서버 시작
echo "개발 서버를 시작합니다..."
echo "브라우저에서 자동으로 열립니다."
echo ""
echo "종료하려면 Ctrl+C를 누르세요."
echo ""

npm run dev
