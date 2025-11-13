# Backend Setup Guide

이 문서는 Chef's Last Stand 게임의 백엔드 API를 Cloudflare Workers와 D1 데이터베이스를 사용하여 설정하는 방법을 설명합니다.

## 아키텍처

- **Frontend**: Phaser 3 + TypeScript + Vite
- **Backend**: Cloudflare Workers (서버리스 함수)
- **Database**: Cloudflare D1 (SQLite 기반 서버리스 DB)
- **Hosting**: Cloudflare Pages (프론트엔드 + Workers)

## 필수 요구사항

1. Cloudflare 계정 (무료로 시작 가능)
2. Node.js 20+ 설치
3. Wrangler CLI 설치:
```bash
npm install -g wrangler
```

## 설정 단계

### 1. Cloudflare 로그인

```bash
wrangler login
```

### 2. D1 데이터베이스 생성

```bash
# 데이터베이스 생성
wrangler d1 create chefs-last-stand-db
```

이 명령어는 다음과 같은 출력을 생성합니다:
```
✅ Successfully created DB 'chefs-last-stand-db'

[[d1_databases]]
binding = "DB"
database_name = "chefs-last-stand-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. wrangler.toml 업데이트

위에서 생성된 `database_id`를 복사하여 `wrangler.toml` 파일의 `REPLACE_WITH_YOUR_DATABASE_ID` 부분을 교체합니다:

```toml
[[d1_databases]]
binding = "DB"
database_name = "chefs-last-stand-db"
database_id = "YOUR_ACTUAL_DATABASE_ID_HERE"
```

### 4. 데이터베이스 스키마 적용

```bash
# 로컬 개발 환경에 스키마 적용
wrangler d1 execute chefs-last-stand-db --local --file=./schema.sql

# 프로덕션 환경에 스키마 적용
wrangler d1 execute chefs-last-stand-db --remote --file=./schema.sql
```

### 5. 로컬에서 테스트

```bash
# 개발 서버 실행 (프론트엔드 + 백엔드)
npm run dev

# 별도 터미널에서 Wrangler 개발 서버 실행
wrangler pages dev dist --port 8788
```

로컬 테스트 URL:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8788/api

### 6. Cloudflare Pages에 배포

#### 방법 1: Cloudflare Dashboard (권장)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 접속
2. **Pages** 섹션으로 이동
3. **Create a project** 클릭
4. Git 저장소 연결 (GitHub/GitLab)
5. 빌드 설정:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: `NODE_VERSION = 20`
6. D1 데이터베이스 바인딩 추가:
   - Settings → Functions → D1 database bindings
   - Variable name: `DB`
   - D1 database: `chefs-last-stand-db` 선택
7. **Save and Deploy** 클릭

#### 방법 2: Wrangler CLI

```bash
# 빌드
npm run build

# 배포
wrangler pages deploy dist --project-name=chefs-last-stand
```

## API 엔드포인트

### 인증 API

#### POST /api/auth/register
사용자 등록

Request:
```json
{
  "username": "player1",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "abc123...",
  "username": "player1",
  "message": "계정이 생성되었습니다!"
}
```

#### POST /api/auth/login
로그인

Request:
```json
{
  "username": "player1",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "abc123...",
  "username": "player1",
  "message": "로그인 성공!"
}
```

### 사용자 프로필 API

#### GET /api/user/profile
현재 사용자 프로필 조회

Headers:
```
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "profile": {
    "username": "player1",
    "totalPlaytime": 12345,
    "totalKills": 500,
    "highScores": {
      "longestSurvivalTime": 1800000,
      "highestLevel": 15,
      "mostKills": 200
    },
    "unlockedCharacters": ["rookie_cook", "grill_master"],
    "achievements": ["first_kill", "level_10"]
  }
}
```

#### PUT /api/user/profile
사용자 프로필 업데이트

Headers:
```
Authorization: Bearer {token}
```

Request:
```json
{
  "totalPlaytime": 5000,
  "totalKills": 50,
  "longestSurvivalTime": 600000,
  "unlockCharacter": "sushi_chef",
  "addAchievement": "level_20"
}
```

### 게임 저장 API

#### GET /api/game/save
저장된 게임 불러오기

Headers:
```
Authorization: Bearer {token}
```

#### POST /api/game/save
게임 저장

Headers:
```
Authorization: Bearer {token}
```

Request:
```json
{
  "selectedCharacter": "rookie_cook",
  "playerLevel": 5,
  "currentXP": 150,
  "requiredXP": 200,
  "killCount": 50,
  "gameTimer": 300000,
  "playerHealth": 80,
  "playerMaxHealth": 100,
  "playerSpeed": 120,
  "playerDefense": 10,
  "playerDamageMultiplier": 1.5,
  "weapons": [
    { "type": "hamburger_station", "level": 2 },
    { "type": "pizza_cutter", "level": 1 }
  ]
}
```

#### DELETE /api/game/save
저장된 게임 삭제

Headers:
```
Authorization: Bearer {token}
```

### 리더보드 API

#### GET /api/game/leaderboard?type=survival&limit=100
리더보드 조회

Query Parameters:
- `type`: `survival`, `level`, 또는 `kills` (기본값: `survival`)
- `limit`: 최대 결과 수 (기본값: 100, 최대: 100)

Response:
```json
{
  "success": true,
  "type": "survival",
  "leaderboard": [
    {
      "rank": 1,
      "username": "player1",
      "longestSurvivalTime": 1800000,
      "highestLevel": 20,
      "mostKills": 500
    }
  ]
}
```

## 데이터베이스 스키마

데이터베이스는 다음 테이블로 구성됩니다:

- `users`: 사용자 계정 정보
- `unlocked_characters`: 잠금 해제된 캐릭터
- `achievements`: 달성한 업적
- `game_saves`: 게임 저장 데이터
- `sessions`: 인증 세션 (토큰)

자세한 스키마는 `schema.sql` 파일을 참조하세요.

## 보안 고려사항

1. **비밀번호 해싱**: SHA-256을 사용하여 비밀번호를 해시합니다
2. **토큰 기반 인증**: 세션 토큰으로 API 접근을 보호합니다
3. **CORS**: 모든 오리진에서 접근 가능 (필요시 제한 가능)
4. **세션 만료**: 토큰은 30일 후 만료됩니다

## 로컬 개발

로컬에서 개발할 때는 Wrangler의 로컬 D1 데이터베이스를 사용합니다:

```bash
# 로컬 데이터베이스에 스키마 적용
wrangler d1 execute chefs-last-stand-db --local --file=./schema.sql

# 로컬 데이터 확인
wrangler d1 execute chefs-last-stand-db --local --command="SELECT * FROM users"
```

## 트러블슈팅

### CORS 오류
- Cloudflare Pages 설정에서 CORS가 올바르게 구성되었는지 확인
- `functions/_middleware.ts`에서 CORS 헤더 확인

### 데이터베이스 연결 오류
- `wrangler.toml`의 `database_id`가 올바른지 확인
- D1 데이터베이스가 생성되었는지 확인: `wrangler d1 list`

### 인증 실패
- 토큰이 올바르게 전달되는지 확인 (Authorization: Bearer {token})
- 세션이 만료되지 않았는지 확인

## 비용

Cloudflare의 무료 플랜으로 시작할 수 있습니다:

- **Pages**: 무제한 대역폭, 무료 빌드
- **Workers**: 하루 10만 요청 무료
- **D1**: 하루 5백만 행 읽기, 10만 행 쓰기 무료

대부분의 소규모 게임에는 무료 플랜으로 충분합니다.

## 추가 리소스

- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 문서](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 문서](https://developers.cloudflare.com/workers/wrangler/)
