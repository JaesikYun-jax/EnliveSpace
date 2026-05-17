# Enliven Space — 운영 메모

인라이븐스페이스 홈페이지(https://enlivespace.pages.dev) 정적 사이트. Cloudflare Pages에서 `main` 브랜치를 자동 배포.

## 머지 전 체크리스트 (절대 건너뛰지 말 것)

PR을 머지하기 전에 **반드시** 다음을 수행한다:

```bash
npm run test
```

내부적으로 `node scripts/test-site.mjs` 가 실행되며:
1. 임시 정적 서버를 띄우고 (`python3 -m http.server`, 임의 포트)
2. 모든 페이지(`/`, `/about.html`, `/story.html`, `/process.html`, `/reviews.html`, `/project/`, `/project/{1..6}.html`)를 fetch
3. 페이지별 HTML invariant 검사 + 필수 자산 도달 가능성 + JS 핸들러 sanity 점검
4. 단 한 건이라도 실패하면 exit 1

머지 직전 마지막으로 한 번 더 실행해 **157+ 검사 모두 pass**를 확인한 뒤에만 `gh pr merge` 호출.

## 페이지 invariant (테스트가 강제하는 규칙)

페이지를 수정할 때 다음 규칙을 깨면 테스트가 잡아낸다:

- `tailwind.config = {...}` 만 사용 (`tailwindcss.config`는 Tailwind CDN의 전역이 아니라 무시됨 — 모든 커스텀 색상 유틸이 죽어버림)
- 헤더는 `<a class="site-logo">` 안에 `<img src="/images/logo/logo-dark...">` 사용 (텍스트 `<span>Enliven Space</span>` 금지)
- 푸터는 `<a class="footer-logo">` 안에 `<img src="/images/logo/logo-light...">` 사용
- 푸터 SNS는 정확히 3개 — `카카오톡 채널`, `Instagram`, `네이버 블로그` (YouTube 금지)
- 네이버 블로그 SVG는 `<text>Blog</text>` 요소 포함 (mask 컷아웃으로 'Blog' 글자 표시)
- 상담 신청 버튼(`data-action="consult"`)은 항상 `https://tally.so/r/J9eROr` 로 연결. `href="#"` 금지
- 메인을 제외한 페이지의 hero text 오버레이(`<div class="absolute inset-0 ... flex items-end">`)에는 반드시 `z-10` 포함 — 안 그러면 그라디언트가 텍스트를 덮어 흐려짐
- hero 영역에 `text-white/80`, `text-white/90` 같은 반투명 흰색 금지 (실 사진 위 가독성 떨어짐)
- 플로팅 `상담신청` 버튼은 Tally URL 로 직접 링크
- `js/main.js` 의 consult/kakao 클릭 핸들러는 **`href` 기준으로 placeholder 판정** (`data-url`이 아님 — 그 속성은 더 이상 사용 안 함)

새 규칙이 필요해지면 `scripts/test-site.mjs` 의 `checkPageHtml` 함수에 추가하고 테스트로 강제할 것.

## 자산 생성 파이프라인

원본 이미지(JPG, 카메라 원본)는 외부에서 받아 `/Users/j6/Downloads/...` 또는 다른 절대 경로에서 가져온다. 다음 두 스크립트로 일괄 처리:

```bash
npm run optimize   # 원본 JPG → WebP 3사이즈 (1920/1200/600) → images/projects/proj-XX/
npm run build      # manifest 기반으로 project/1.html ~ project/6.html + project/index.html 재생성
npm run all        # 위 둘 차례로
npm run test       # 마지막 검증
```

- 소스 경로가 외부 폴더라면 `scripts/optimize-images.mjs` 상단의 `SRC_OVERRIDES` 에 `proj-id → 절대 경로`로 추가
- 새 프로젝트 메타데이터는 `scripts/projects-data.mjs` 의 `PROJECTS` 배열에 객체로 추가 (id, slug, title, address, pyeong, period, completedAt, type, pricePerPy, keywords, scope, description, sectionLabels)
- 섹션 폴더명 → 영문 키 매핑(`SECTION_MAP`): 거실 → living, 주방 → kitchen, 욕실-A → bath-a, 안방 → bedroom, Room-A → room-a 등
- 비포/에프터 사진은 섹션 폴더의 `비포에프터` 하위 폴더 또는 섹션 폴더 직접에 `*-hero-before.jpg` / `*-hero-after.jpg` 명명

## 디렉토리 구조

```
enlivespace/
├── *.html              # 정적 페이지 (about, story, process, reviews, index)
├── project/            # 포트폴리오 (index.html + 1~6.html)
├── images/
│   ├── logo/           # 헤더용(dark) / 푸터용(light), 1x · 2x
│   └── projects/       # proj-01 ~ proj-06 각각 WebP 3사이즈 + manifest.json
├── css/style.css       # 모든 페이지 공통 스타일
├── js/main.js          # 인터랙션 (hero slider, 룸 필터, 라이트박스, strip arrows 등)
└── scripts/
    ├── projects-data.mjs    # 프로젝트 메타데이터 단일 출처
    ├── optimize-images.mjs  # sharp 기반 WebP 변환
    ├── build-pages.mjs      # 매니페스트 → 프로젝트 페이지 생성
    ├── test-site.mjs        # 머지 전 검증 (필수)
    └── apply-*.mjs / update-*.mjs  # 일회성 일괄 변환 (기록용 보존)
```

## 절대 하지 말 것

- `script src="https://cdn.tailwindcss.com"` 가 있는데 `tailwindcss.config = {...}`처럼 잘못된 전역명 사용. 항상 `tailwind.config`.
- `text-white/80`, `text-white/90` 등 반투명 흰색을 hero overlay에 사용
- placeholder div(`.ph-img`)로 실제 콘텐츠 영역을 덮기 (실 사진 대체 시 반드시 `<img>` 또는 배경 이미지로 교체)
- `data-action="consult"` 에 `href="#"` 남기기 (테스트에서 잡힘)
- 메인 외 페이지에서 hero 텍스트 오버레이 `<div>` 에 `z-10` 빠뜨리기 (테스트에서 잡힘)
- `git pr merge --no-verify` 또는 테스트 우회

## 배포

`main` 브랜치 push → Cloudflare Pages가 1~2분 내 자동 빌드 & 배포. PR 미리보기는 PR별로 별도 preview URL이 자동 생성됨.
