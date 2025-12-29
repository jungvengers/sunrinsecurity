# 선린인터넷고등학교 정보보호과 홈페이지

정보보호과 공식 홈페이지 및 동아리 지원 시스템입니다.

## 기술 스택

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: PostgreSQL + Prisma
- **File Storage**: MinIO
- **Reverse Proxy**: Nginx
- **Authentication**: NextAuth.js v5 (Google OAuth)
- **Rich Editor**: Tiptap

## 아키텍처

```
                    ┌──────────────┐
                    │    Nginx     │ :80
                    │  (Reverse    │
                    │   Proxy)     │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
      /storage/*      /minio-console/*     /*
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  MinIO   │    │  MinIO   │    │ Next.js  │
    │  :9000   │    │  :9001   │    │  :3000   │
    └──────────┘    └──────────┘    └──────────┘
```

## 시작하기

### 방법 1: Docker Compose (권장)

```bash
# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 Google OAuth 등 필요한 값 설정

# 전체 서비스 실행 (Nginx + PostgreSQL + MinIO + Next.js 앱)
docker compose up -d --build

# DB 마이그레이션 (최초 실행시)
docker compose exec app npx prisma db push
```

http://localhost 에서 확인하세요.

### 방법 2: 로컬 개발

```bash
# 환경 변수 설정
cp .env.example .env

# DB/스토리지만 Docker로 실행
docker compose up -d postgres minio minio-init

# 의존성 설치 및 DB 설정
pnpm install
pnpm db:generate
pnpm db:push

# 개발 서버 실행
pnpm dev
```

http://localhost:3000 에서 확인하세요.

## URL 구조

| 경로 | 서비스 |
|------|--------|
| `/` | Next.js 앱 |
| `/storage/*` | MinIO 파일 스토리지 |
| `/minio-console/*` | MinIO 관리 콘솔 |

## 주요 기능

### 공개 페이지

- **메인페이지**: 히어로 섹션 (배경 이미지 설정 가능)
- **프로젝트 전시장**: Tiptap 에디터 기반 프로젝트 상세
- **동아리 소개**: 동아리별 정보 및 커리큘럼
- **동아리 지원**: 복수 지원 및 지망순위 설정

### 관리자 패널 (/admin)

- **대시보드**: 통계 및 현황
- **프로젝트 관리**: Notion-like 슬래시 명령어 에디터
- **동아리 관리**: 동아리 정보 CRUD (로고 업로드 지원)
- **지원 사이클 관리**: 년도별 모집 라운드 관리
- **라운드별 동아리 설정**: 참여 동아리 및 최대 인원 설정
- **지원서 양식 빌더**: Google Form 스타일 질문 작성
- **지원서 관리**: 지원자 순위 매기기 및 합격/불합격 처리
- **합격자 배분**: 지망순위 기반 자동 배분
- **설정**: 사이트 설정, 배경 이미지 관리

## 권한 체계

| 역할 | 권한 |
|------|------|
| STUDENT | 지원서 제출, 본인 지원 현황 조회 |
| TEACHER | 조회만 가능 |
| ADMIN | 전체 관리 권한 |

### ClubAdmin (동아리 관리자)

- 사이클(년도)별로 지정됨
- 해당 사이클에서만 담당 동아리 지원서 검토 가능
- 지원자 순위 매기기 가능

## 지원 사이클 라이프사이클

```
DRAFT → OPEN → REVIEWING → ALLOCATING → COMPLETED
          │                                   │
          └─────── (추가 모집) ───────────────┘
```

1. **DRAFT**: 사이클 생성, 라운드별 동아리/최대인원 설정, 지원서 양식 설정
2. **OPEN**: 학생 지원 가능 (시작 버튼 또는 시작일 도래 시 자동)
3. **REVIEWING**: 지원 마감 후 동아리 어드민 심사 (종료일 도래 시 자동)
4. **ALLOCATING**: 관리자 심사 마감 → 합격자 배분
5. **COMPLETED**: 완료 (추가 모집 가능)

## 환경 변수

| 변수 | 설명 |
|------|------|
| DATABASE_URL | PostgreSQL 연결 문자열 |
| NEXTAUTH_URL | 사이트 URL |
| NEXTAUTH_SECRET | NextAuth 시크릿 |
| GOOGLE_CLIENT_ID | Google OAuth 클라이언트 ID |
| GOOGLE_CLIENT_SECRET | Google OAuth 시크릿 |
| MINIO_ENDPOINT | MinIO 엔드포인트 (내부: minio) |
| MINIO_PORT | MinIO 포트 (기본: 9000) |
| MINIO_ACCESS_KEY | MinIO 액세스 키 |
| MINIO_SECRET_KEY | MinIO 시크릿 키 |
| MINIO_BUCKET | MinIO 버킷 이름 |
| PUBLIC_URL | 공개 URL (http://localhost 또는 실제 도메인) |
