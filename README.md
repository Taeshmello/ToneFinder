# ToneFinder

AI 기반 기타 톤 매칭 플랫폼. 자세한 설계는 [`docs/ToneFinder_개발가이드.md`](docs/ToneFinder_개발가이드.md) 참고.

## 현재 상태: Phase 1 — 환경 세팅

Frontend와 Backend 골격이 준비되어 있고, Frontend에서 Backend의 `/api/v1/health` 호출이 동작합니다. DB(PostgreSQL)와 Docker 관련 구성은 **Phase 2부터** 추가됩니다.

## 사전 요구사항

- Node.js 22+
- JDK 21+ (Gradle Wrapper가 toolchain을 통해 21을 자동 다운로드합니다)

## 실행

### 1) Backend 기동

```bash
cd backend
./gradlew bootRun
```

확인:
```bash
curl http://localhost:8080/api/v1/health
# {"status":"ok","service":"tonefinder"}
```

### 2) Frontend 기동 (다른 터미널)

```bash
cd frontend
npm install   # 최초 1회
npm run dev
```

브라우저에서 http://localhost:5173 접속 → 화면에 Backend health 응답이 표시됩니다.

## 디렉터리 구조

```
ToneFinder/
├── docs/         # 개발 가이드
├── frontend/     # Vite + React + TS + Tailwind
└── backend/      # Spring Boot 3.x + Kotlin
```
