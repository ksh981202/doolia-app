# DOOLIA Printables

**Print, Play & Discover** — 부모님과 교사가 어린이 그림 도안(색칠공부, 미로, 따라그리기 등)을 탐색하고 A4 고화질 PDF로 무료 인쇄할 수 있는 웹 서비스입니다.

이 문서는 프로젝트 뼈대 구성 결과와 이후 구현 지침을 함께 담습니다.

---

## 1단계. 프론트엔드 초기 환경

이미 적용된 스택:

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Zustand, React Router, TanStack Query (`@tanstack/react-query`)
- lucide-react, `@supabase/supabase-js`

### 설치 명령어 리스트 (처음부터 다시 만들 때)

PowerShell에서는 `&&` 대신 명령을 한 줄씩 실행하세요.

```bash
npm create vite@latest . -- --template react-ts
npm install react@18.3.1 react-dom@18.3.1
npm install lucide-react @tanstack/react-query zustand @supabase/supabase-js react-router-dom
npm install -D @types/react@18.3.18 @types/react-dom@18.3.5 tailwindcss @tailwindcss/vite
```

일상 개발:

```bash
npm install
npm run dev
```

### FSD를 고려한 `src` 구조

```
src/
  app/                 # 앱 셸 — Provider, Router
  pages/               # 라우트 페이지 (Home, Detail)
  components/          # 공통 UI (Header, Card, Layout)
  features/            # 유스케이스 단위 기능
    gallery/           # 목록 조회 · 그리드
    download/          # 3초 광고 카운트다운 모달
  shared/              # 카테고리 상수, cn, Zustand 스토어
  db/                  # Supabase 클라이언트, 타입, 쿼리
```

핵심 컴포넌트 경로:

- `src/components/layout/Header.tsx`
- `src/features/download/ui/DownloadModal.tsx`

---

## 2단계. Supabase 스키마

마이그레이션 파일:

`supabase/migrations/20260821140000_create_printables.sql`

`printables` 컬럼:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID PK | `gen_random_uuid()` |
| `title` | VARCHAR(200) | 도안 제목 |
| `category` | VARCHAR(50) | `coloring`, `maze`, `tracing`, `alphabet`, `numbers` |
| `tags` | TEXT[] | 검색/필터 태그 |
| `color_image_url` | TEXT | R2 컬러 미리보기 |
| `line_art_url` | TEXT | R2 흑백 선화 |
| `pdf_url` | TEXT | R2 A4 PDF |
| `views` | INT default 0 | 상세 조회수 |
| `downloads` | INT default 0 | PDF 다운로드 수 |
| `created_at` | TIMESTAMPTZ | UTC 생성 시각 |

### RLS 정책

- **SELECT**: `anon`, `authenticated` 모두 가능 (갤러리 공개)
- **INSERT / UPDATE / DELETE**: JWT `app_metadata.role = 'admin'` 인 사용자만
- 관리자 역할은 **`user_metadata`가 아니라 `app_metadata`** 에 둡니다. 전자는 클라이언트가 스스로 수정할 수 있습니다.

대시보드에서 관리자 지정:

1. Authentication → Users → 해당 유저
2. App Metadata에 `{ "role": "admin" }` 저장
3. 해당 계정은 한 번 로그아웃 후 다시 로그인해야 JWT가 갱신됩니다

파이썬 업로드 스크립트는 **service_role 키**를 사용하므로 RLS를 우회하고 INSERT 합니다. 이 키는 프론트엔드 `.env`에 넣지 마세요.

조회수/다운로드 카운터는 `increment_printable_views`, `increment_printable_downloads` RPC로만 1씩 증가합니다.

SQL Editor에 마이그레이션 파일을 붙여 넣거나, CLI를 쓰는 경우:

```bash
supabase db query --linked -f supabase/migrations/20260821140000_create_printables.sql
```

---

## 3단계. 파이썬 변환 · 업로드 파이프라인

`python/process_and_upload.py`

동작:

1. `python/input_images/` 의 컬러 PNG를 읽음 (Windows 한글 경로 대응)
2. A4 300DPI(2480×3508) 캔버스에 맞춤
3. OpenCV 적응형 임계값으로 흑백 선화 PNG 생성
4. ReportLab으로 A4 PDF 생성, 하단에 `© DOOLIA Printables`
5. boto3로 Cloudflare R2에 컬러 / 선화 / PDF 업로드
6. supabase-py로 `printables` INSERT

파일명 규칙:

```
{title}__{category}__{tag1}_{tag2}.png
happy-lion__coloring__animal_lion.png
```

```bash
cd python
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python process_and_upload.py --dry-run
python process_and_upload.py
```

`--dry-run` 은 로컬 `python/output/` 생성만 하고 R2/DB는 건너뜁니다.

---

## 4단계. 프론트엔드 핵심 보일러플레이트

- **Header**: 로고 `DOOLIA Printables`, 슬로건, 카테고리 메뉴 (모바일 햄버거 포함)
- **DownloadModal**: 다운로드 클릭 → 3초 광고 카운트다운 → `PDF 다운로드` 활성화
- **갤러리**: Zustand 카테고리 필터 + TanStack Query 목록. `.env`가 없으면 샘플 카드 3장으로 UI를 미리 볼 수 있습니다.

---

## 5단계. 배포 및 실행 안내

### `.env.example` (프론트, 프로젝트 루트)

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
VITE_R2_PUBLIC_BASE_URL=https://files.doolia.example
```

### `vercel.json` (SPA 라우팅)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Vercel 프로젝트 Environment Variables에 위 `VITE_*` 값을 동일하게 등록하세요.

### 터미널에 순서대로 입력할 명령어

```bash
cd C:\Users\vlvlz\Desktop\Doolia
npm install
copy .env.example .env
npm run dev
```

브라우저에서 http://localhost:5173 을 엽니다.

프로덕션 빌드 확인:

```bash
npm run build
npm run preview
```

Vercel 배포:

```bash
npm i -g vercel
vercel
```

Cloudflare R2:

1. 버킷 생성 (`doolia-printables` 등)
2. API 토큰(Access Key) 발급
3. 커스텀 도메인 또는 r2.dev 공개 URL을 `R2_PUBLIC_BASE_URL` / `VITE_R2_PUBLIC_BASE_URL` 에 설정
4. 공개 읽기가 가능해야 갤러리 이미지와 PDF 다운로드가 동작합니다

---

## 다음 구현 우선순위

1. AdSense 실제 슬롯을 `DownloadModal` 광고 영역에 연결
2. 검색(제목/태그)과 페이지네이션
3. 관리자 전용 업로드 현황 페이지 (Auth + `app_metadata.role`)
4. 선화 품질 프리셋(캐니 / 스케치)을 파이썬 CLI 플래그로 분기
