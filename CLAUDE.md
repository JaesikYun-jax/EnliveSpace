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

머지 직전 마지막으로 한 번 더 실행해 **220+ 검사 모두 pass**를 확인한 뒤에만 `gh pr merge` 호출.

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
- 프로젝트 상세 갤러리(`project/N.html`)는 **퍼즐형 masonry** — `<div id="gallery" class="masonry">` 안의 카드를 JS(`layoutMasonry`)가 "가장 짧은 열"에 절대좌표로 채워 내부 빈칸을 없앤다. 각 카드는 높이 계산용 `data-ar`(가로/세로비)를 갖고, hero(before/after)는 `data-span="2"`로 2칸 폭. **예전 고정 `grid-cols-3` + `row-span-2`로 되돌리지 말 것** — 카드 수가 안 맞으면 우하단에 빈칸이 생긴다. (`build-pages.mjs` 에서 생성, 테스트가 강제)
- 모든 페이지 `<head>` 에는 파비콘 4종 세트가 있어야 함 — PNG 32 icon + apple-touch 180 + manifest 링크 + `theme-color`. 원본은 `images/logo/logo-light.png` (흰색 워드마크) 를 검정 배경에 10% 여백으로 레터박스한 것이며, `npm run favicons` 가 32/180/192/512 PNG 와 `site.webmanifest` 를 생성. (SVG favicon은 원본이 raster 라 의미가 없어 의도적으로 두지 않음 — 테스트가 잔존 참조를 잡아냄. `theme-color` 는 `#ffffff` — 사이트 헤더가 흰색이라 모바일 브라우저 상단 바와 톤 맞춤.)

새 규칙이 필요해지면 `scripts/test-site.mjs` 의 `checkPageHtml` 함수에 추가하고 테스트로 강제할 것.

## 자산 생성 파이프라인

원본 사진은 `홈페이지제작(인라이븐스페이스)/4. 포트폴리오/` 아래에 프로젝트별 폴더(`1)판교원9단지...` ~ `6)이태원...`)로 보관되고, 그 안에 섹션별 한글 폴더(`거실`, `주방`, `욕실-A`, `침실-A`, `안방`, `Room-A` 등)와 `비포에프터` 하위 폴더가 들어간다. 이 원본 폴더는 2GB+ 라 `.gitignore` 로 빠져 있다.

전체 파이프라인:

```bash
npm run stage      # 원본 폴더 → _staging/ 로 자동 리네임 복사 (proj-XX-section-NN.jpg)
npm run optimize   # _staging/ → WebP 3사이즈(1920/1200/600) → images/projects/proj-XX/
npm run build      # manifest 기반으로 project/1.html ~ project/6.html + project/index.html 재생성
npm run favicons   # images/logo/logo-light.png 검정 배경 레터박스 → 32/180/192/512 PNG + site.webmanifest
npm run all        # stage → optimize → build → favicons → test
npm run test       # 마지막 검증

# dry-run: 분류 누락 / 미지원 섹션 사전 점검
node scripts/stage-images.mjs --dry-run
```

- **프로젝트 폴더명 → proj-NN** 매핑은 `scripts/stage-images.mjs` 의 `PROJECT_MAP` (예: `판교원9단지 한림풀에버` → `06`, `산운12단지 판교센트럴포레와이시티` → `01`)
- **섹션 폴더명 → 영문 키** 매핑은 `SECTION_MAP`: 거실 → living, 주방 → kitchen, 욕실-A → bath-a, 안방 → bedroom, Room-A → room-a 등 (`stage-images.mjs` 와 `optimize-images.mjs` 양쪽에 동일 정의)
- **비포/에프터 사진**: 섹션 폴더의 `비포에프터` 하위 폴더에 두고 파일명에 `비포`/`before` 또는 `에프터`/`애프터`/`after` 마커가 있으면 자동 분류. 거실(`living`)의 비포에프터는 프로젝트 메인 hero → `proj-XX-hero-{before|after}.jpg`, 그 외 섹션은 `proj-XX-{section}-hero-{before|after}.jpg`
- 분류 불가 파일명(예: 날짜시각 파일)은 `stage-images.mjs` 의 `FILE_KIND_OVERRIDES` 에 명시
- 새 프로젝트 메타데이터는 `scripts/projects-data.mjs` 의 `PROJECTS` 배열에 객체로 추가 (id, slug, title, address, pyeong, period, completedAt, type, pricePerPy, keywords, scope, description, sectionLabels)
- `_staging/` 은 빌드 산출물 — 언제든 삭제 가능, `npm run stage` 가 새로 생성

## 디렉토리 구조

```
enlivespace/
├── *.html              # 정적 페이지 (about, story, process, reviews, index)
├── project/            # 포트폴리오 (index.html + 1~6.html)
├── images/
│   ├── logo/           # 헤더용(dark) / 푸터용(light), 1x · 2x
│   ├── favicon*.png    # 32/180/192/512 — logo-light.png 을 검정 배경에 레터박스, npm run favicons 로 생성
│   ├── site.webmanifest # PWA 매니페스트 — 같은 스크립트로 생성
│   └── projects/       # proj-01 ~ proj-06 각각 WebP 3사이즈 + manifest.json
├── css/style.css       # 모든 페이지 공통 스타일
├── js/main.js          # 인터랙션 (hero slider, 룸 필터, 라이트박스, strip arrows 등)
└── scripts/
    ├── projects-data.mjs    # 프로젝트 메타데이터 단일 출처
    ├── stage-images.mjs     # 원본 폴더 → _staging/ 리네임 복사
    ├── optimize-images.mjs  # sharp 기반 WebP 변환 (_staging/ → images/projects/)
    ├── build-pages.mjs      # 매니페스트 → 프로젝트 페이지 생성
    ├── build-favicons.mjs   # logo-light.png 검정 배경 레터박스 → 다중 사이즈 PNG + webmanifest
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

캐시 무효화는 `_headers` 가 처리 — HTML/CSS/JS 는 `max-age=0, must-revalidate`(ETag 재검증), 이미지는 `max-age=3600`. 재배포 시 구버전 CSS 캐시로 UI가 깨지지 않는다. (별도 조치 불필요)

### PR 머지 절차 (gh 계정 전환 — "배포/머지" 요청 시 자동 수행)

이 저장소(`JaesikYun-jax/EnliveSpace`)의 PR 생성·머지는 **repo owner 계정으로만** 가능하다. gh CLI 의 active 계정이 평소 `difflabs-dev`(collaborator 아님)라 PR 생성이 막힌다. 따라서 **사용자가 "배포"/"머지"/"PR 올려줘" 등을 요청하면 매번 재확인 없이** 아래 절차를 수행한다 — **배포 요청에는 이 계정 전환 절차 승인이 항상 포함된 것으로 간주**한다:

```bash
# 1) 머지 직전 npm run test 로 225+ 검사 모두 pass 확인
npm run test
# 2) repo owner 로 전환
gh auth switch --user JaesikYun-jax
# 3) PR 생성 + squash 머지 + 브랜치 삭제
gh pr create --base main --title "…" --body "…"
gh pr merge <N> --squash --delete-branch
# 4) 반드시 원래 계정으로 원복
gh auth switch --user difflabs-dev
```

- 머지 후 **반드시 `difflabs-dev` 로 원복**한다.
- `gh pr merge` 가 `'main' is already used by worktree …` 로 로컬 체크아웃에 실패해도 **머지 자체는 완료**됨 — `gh pr view <N> --json state` 로 `MERGED` 확인하면 된다.
- 원격 브랜치가 안 지워졌으면 `git push origin --delete <branch>` 로 정리.
