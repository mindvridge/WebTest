# 회원가입 오류 해결 방법

## 문제 상황
회원가입 시 "Failed to fetch" 에러가 발생합니다.

## 원인
D1 데이터베이스가 아직 설정되지 않았습니다. 백엔드 API가 작동하려면 Cloudflare D1 데이터베이스를 생성하고 연결해야 합니다.

## 해결 방법

### 옵션 1: 로컬에서 테스트 (권장)

로컬에서 전체 스택(프론트엔드 + 백엔드)을 실행하려면:

#### 1. Wrangler CLI 설치
```bash
npm install -g wrangler
```

#### 2. Cloudflare 로그인
```bash
wrangler login
```

#### 3. D1 데이터베이스 생성
```bash
wrangler d1 create chefs-last-stand-db
```

이 명령어 실행 후 나오는 `database_id`를 복사하세요. 예시:
```
✅ Successfully created DB 'chefs-last-stand-db'

[[d1_databases]]
binding = "DB"
database_name = "chefs-last-stand-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← 이 값을 복사
```

#### 4. wrangler.toml 파일 수정
`wrangler.toml` 파일을 열고 마지막 줄의 `REPLACE_WITH_YOUR_DATABASE_ID`를 위에서 복사한 `database_id`로 교체:

```toml
[[d1_databases]]
binding = "DB"
database_name = "chefs-last-stand-db"
database_id = "여기에-복사한-ID-붙여넣기"
```

#### 5. 데이터베이스 스키마 적용
```bash
# 로컬 개발용
wrangler d1 execute chefs-last-stand-db --local --file=./schema.sql

# 프로덕션용 (나중에 배포할 때)
wrangler d1 execute chefs-last-stand-db --remote --file=./schema.sql
```

#### 6. 로컬 개발 서버 실행

터미널 1 (프론트엔드):
```bash
npm run dev
```

터미널 2 (백엔드):
```bash
# 먼저 빌드
npm run build

# Wrangler Pages 개발 서버 실행
wrangler pages dev dist --port 8788
```

이제 http://localhost:3000 (또는 Vite가 지정한 포트)에서 게임에 접속하면 회원가입이 작동합니다!

### 옵션 2: Cloudflare Pages에 배포

로컬 테스트 없이 바로 배포하려면:

#### 1-3단계는 위와 동일 (Wrangler 설치, 로그인, D1 생성)

#### 4. wrangler.toml 수정 및 커밋
```bash
# wrangler.toml 파일에서 database_id 수정 후
git add wrangler.toml
git commit -m "Configure D1 database"
git push
```

#### 5. Cloudflare Pages 설정

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 접속
2. **Pages** → 프로젝트 선택 (또는 새로 생성)
3. **Settings** → **Functions** → **D1 database bindings**
4. **Add binding** 클릭:
   - Variable name: `DB`
   - D1 database: `chefs-last-stand-db` 선택
5. **Save** 클릭

#### 6. 데이터베이스 스키마 적용
```bash
wrangler d1 execute chefs-last-stand-db --remote --file=./schema.sql
```

#### 7. 재배포
Cloudflare Pages가 자동으로 재배포하거나, 수동으로:
```bash
npm run build
wrangler pages deploy dist --project-name=chefs-last-stand
```

배포 URL(예: https://chefs-last-stand.pages.dev)에서 회원가입이 정상 작동합니다!

## 테스트 방법

회원가입이 제대로 작동하는지 확인:

1. 게임 실행
2. 회원가입 모드로 전환
3. 사용자 이름 (3자 이상) 입력
4. 비밀번호 (4자 이상) 입력
5. 제출

성공 시: "계정이 생성되었습니다!" 메시지가 표시됩니다.

## 추가 참고 자료

- 상세 백엔드 설정: `BACKEND_SETUP.md` 참조
- 배포 가이드: `DEPLOYMENT.md` 참조

## 문제가 계속되면

1. 브라우저 콘솔(F12)에서 에러 메시지 확인
2. API 요청이 어디로 가는지 확인 (Network 탭)
3. Wrangler 서버가 실행 중인지 확인 (로컬 테스트 시)
4. D1 데이터베이스 바인딩이 올바른지 확인 (배포 시)
