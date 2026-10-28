# TEND — Discord 서버 관리 콘솔

GitHub Pages에서 호스팅하는 React/Vite 정적 사이트입니다. 로그인, 사용자 권한, 채팅 기록과 서비스 데이터는 Supabase를 사용합니다. Discord 서버에 실제 조치를 수행하는 기능은 별도 Discord 봇이 Supabase와 연동되어 있어야 작동합니다.

## 1. 로컬 실행

필요 환경: Node.js 22 이상, npm

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에 실제 Supabase URL과 publishable/anon key를 입력합니다. 비밀키(`service_role`, Discord bot token, OAuth client secret)는 절대 프론트엔드 환경 변수에 넣지 마세요.

## 2. Supabase 준비

1. Supabase 프로젝트를 만듭니다.
2. `supabase/migrations/001_initial_schema.sql`을 SQL Editor에서 실행합니다.
3. Authentication → Providers에서 Discord를 활성화합니다.
4. Discord Developer Portal의 OAuth2 Redirect URL과 Supabase Authentication URL 설정을 일치시킵니다. Supabase Discord provider 설정에 필요한 Client ID/Secret은 Supabase 대시보드에만 입력합니다.
5. Authentication → URL Configuration에 로컬 주소와 GitHub Pages 배포 주소를 등록합니다.
6. Storage 정책과 채팅 첨부 파일 버킷은 마이그레이션에 포함된 정책을 확인하고, 버킷이 생성되었는지 확인합니다.

오너 계정은 Discord 사용자명만으로 확인하지 않습니다. 실제 Discord 숫자 사용자 ID를 확인한 후 Supabase Edge Function 환경 변수 `TEND_OWNER_DISCORD_ID`에 설정해야 합니다. Supabase CLI로 `supabase functions deploy owner-bootstrap` 및 `supabase functions deploy owner-admin`을 실행하고, `supabase secrets set TEND_OWNER_DISCORD_ID=실제_숫자_ID`로 설정하세요. Supabase의 `SUPABASE_URL` 및 `SUPABASE_SERVICE_ROLE_KEY`는 함수 실행 환경에서만 사용해야 하며 저장소에 커밋하지 마세요.

## 3. GitHub Pages 배포 (필수 설정)

**`src/main.tsx` 404는 원본 `index.html`이 그대로 게시되고 있다는 뜻입니다.** 브라우저는 TSX 파일을 직접 실행할 수 없습니다. GitHub Actions가 Vite로 빌드한 `dist/` 폴더를 배포해야 합니다.

1. ZIP 안의 `TEND-GitHub-Pages` 폴더 안에 있는 파일과 숨김 폴더 `.github`를 저장소 최상위에 업로드합니다. 저장소에 `TEND-GitHub-Pages/TEND-GitHub-Pages/`처럼 폴더가 중첩되면 안 됩니다.
2. 저장소에서 **Settings → Pages → Build and deployment → Source → GitHub Actions**를 선택합니다. **Deploy from a branch / main / root를 사용하면 안 됩니다.**
3. **Settings → Secrets and variables → Actions → Variables**에서 다음 Repository variables를 추가합니다.
   - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase publishable/anon key
4. 변경 사항을 기본 브랜치에 push합니다. `.github/workflows/deploy.yml`은 push 시 실행되도록 구성되어 있습니다. 또는 **Actions → Deploy TEND to GitHub Pages → Run workflow**로 수동 실행합니다.
5. **Actions** 탭에서 `Deploy TEND to GitHub Pages` 작업이 초록색 체크로 성공했는지 확인합니다. 실패하면 해당 실행을 열고 첫 번째 오류를 확인합니다.
6. **Settings → Pages**에서 표시되는 배포 주소를 열어 확인합니다. `src/main.tsx`가 계속 요청되면 Actions가 실제로 성공했는지와 Pages Source가 GitHub Actions인지 다시 확인한 뒤 강력 새로고침합니다.

워크플로는 `npm run build`를 실행하고 `dist/`만 배포합니다. 원본 `index.html`에 있는 `/src/main.tsx`는 개발용 진입점이며, 빌드가 완료되면 Vite가 이를 번들 파일 경로로 바꿉니다.

GitHub Pages 주소를 Supabase Auth의 허용 URL 및 Discord OAuth Redirect URL에도 등록해야 로그인할 수 있습니다.

## 4. 빌드 및 점검

```bash
npm run typecheck
npm run build
npm run preview
```

`dist/`가 정적 배포 결과물입니다. `404.html` fallback은 GitHub Pages에서 직접 URL을 열거나 새로고침할 때 SPA 라우팅이 깨지는 문제를 줄입니다.

## 5. 알려진 통합 전제

- 이 프로젝트는 정적 웹사이트입니다. Discord 봇을 실행하거나 서버에 직접 가입시킬 수 없습니다.
- 서버 관리 시작/중지, 실제 모더레이션 적용, Discord 공지 발송은 별도 봇과 서버 측 작업이 구성되어 있어야 실제 동작합니다.
- 수동 결제 확인은 결제사 자동 결제와 다릅니다. 결제 제공자 연동이 없으면 자동 결제/환불을 완료했다고 표시하지 않습니다.
- Supabase 프로젝트별 RLS, Edge Function 배포, Discord OAuth, GitHub Pages 변수 설정 없이는 실서비스 로그인 및 관리자 기능을 검증할 수 없습니다.
- 사이트에 있는 기능 중 외부 서비스가 필요한 기능은 연결 상태와 오류를 확인한 후 사용하세요. 설정되지 않은 연동을 성공한 것처럼 표시하지 않습니다.


## 파일 구조 간소화 (v1.1)

사용하지 않던 UI 컴포넌트 수십 개와 관련 훅을 제거했습니다. CSS는 `src/styles.css` 하나로 통합했습니다. 주요 기능 코드는 다음 파일에 집중되어 있습니다.

- `src/App.tsx` — 페이지 및 화면 흐름
- `src/lib/tend-data.ts` — Supabase 데이터 조회/변경
- `src/lib/supabase.ts` — Supabase 연결
- `src/types/domain.ts` — 데이터 타입
- `src/styles.css` — 전체 스타일
- `supabase/migrations/` — 데이터베이스 스키마
- `supabase/functions/` — 서버 측 권한 검증 기능

설치 후 `npm install`을 실행해 현재 `package.json` 기준으로 의존성을 설치하세요. 기존 `node_modules` 폴더가 있다면 새 의존성 목록에 맞춰 다시 설치하는 것이 좋습니다.
