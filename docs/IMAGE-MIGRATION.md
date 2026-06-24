# 이미지 파일 재정리 — 매핑 문서

사이트맵/용도 기준으로 `images/` 를 재구성한 기록. **옛 경로 → 새 경로** 전체 테이블.
(2026-06 작업.)

> **후속 변경 1(2026-06):** 프로젝트 갤러리 폴더를 `images/projects/proj-XX/` → `images/projects/NN-slug/`
> (`id-folderSlug`, 예: 첫 프로젝트 → `06-pangyo`)로 리네임했다. 아래 표의 `images/projects/` 소스 경로는
> 모두 새 `NN-slug` 이름을 반영해 갱신돼 있다. slug 단일 출처는 `scripts/projects-data.mjs` 의 `folderSlug`.
>
> **후속 변경 2(2026-06):** 각 프로젝트 폴더 안을 **섹션별 폴더 + `{섹션}/before-after/`** 로 세분화했다
> (예: `06-pangyo/bath-a/06-pangyo-bath-a-01.webp`, `06-pangyo/bath-a/before-after/06-pangyo-bath-a-hero-after.webp`).
> 특수 섹션 `card-cover`·`index-hero` 도 각자 폴더. manifest 의 variant `name` 이 프로젝트 폴더 기준
> 상대경로를 담고, `build-pages` 의 `projectAssetUrl` 이 그대로 URL로 만든다. (이동: `scripts/migrate-section-subfolders.mjs`)

## 네이밍 컨벤션
- 폴더는 **사이트맵/용도** 기준: `images/main/{purpose}`, `images/pages/{page}/`. 브랜드·프로젝트는 기존 위치 유지.
- 파일명 `{descriptor}[-{NN 순서}]-{size}.webp` — `size` ∈ `600` | `1200` | (full=접미사 없음). 순서가 있는 세트(hero 슬라이드·포트폴리오 카드)는 2자리 순번 접두로 **화면 노출 순서** 반영.
- 변형: hero 슬라이드 = `-1200` + full (풀스크린이라 -600 미생성), 카드 썸네일 = `-600` + `-1200`, 페이지 hero = `-600`/`-1200`/full 3종.

## 구조 (요약)
```
images/
├── favicon*.png, og-image.jpg, site.webmanifest   # 브랜드 (유지)
├── logo/                                            # 브랜드 (유지)
├── main/                # 메인(index) 전용 — 프로젝트 이미지의 독립 복사본
│   ├── hero/            # 풀스크린 hero 슬라이더 7장 (순서 01~07)
│   ├── portfolio-thumbnail/   # 포트폴리오 스트립 카드 6장 (순서 01~06)
│   └── reviews-banner/  # 메인 후기 섹션 배너
├── pages/               # 페이지별 hero·콘텐츠 이미지
│   ├── about/ story/ process/(+services/) reviews/
└── projects/{01-sanun12 … 06-pangyo}/   # 갤러리 (= id-folderSlug, 파이프라인 생성)
```

## 매핑: 메인 hero 슬라이더 (복사본, `images/main/hero/`)
| 순서 | 옛 (images/projects/) | 새 (images/main/hero/) |
|---|---|---|
| 01 | 06-pangyo/06-pangyo-index-hero-01 | hero-01-pangyo |
| 02 | 06-pangyo/06-pangyo-index-hero-02 | hero-02-pangyo |
| 03 | 06-pangyo/06-pangyo-hero-after | hero-03-pangyo |
| 04 | 02-seongbok/02-seongbok-hero-after | hero-04-seongbok |
| 05 | 04-euneosong/04-euneosong-hero-after | hero-05-euneosong |
| 06 | 05-itaewon/05-itaewon-hero-after | hero-06-itaewon |
| 07 | 03-sindang/03-sindang-hero-after | hero-07-sindang |

## 매핑: 메인 포트폴리오 썸네일 (복사본, `images/main/portfolio-thumbnail/`)
| 순서 | 옛 | 새 (images/main/portfolio-thumbnail/) |
|---|---|---|
| 01 | 06-pangyo/06-pangyo-card-cover-01 | thumb-01-pangyo |
| 02 | 02-seongbok/02-seongbok-hero-after | thumb-02-seongbok |
| 03 | 04-euneosong/04-euneosong-hero-after | thumb-03-euneosong |
| 04 | 01-sanun12/01-sanun12-card-cover-01 | thumb-04-sanun12 |
| 05 | 03-sindang/03-sindang-hero-after | thumb-05-sindang |
| 06 | 05-itaewon/05-itaewon-hero-after | thumb-06-itaewon |

> 메인 hero·썸네일은 프로젝트 갤러리 이미지를 **공유**하던 것을, 독립 복사본으로 분리(프로젝트 갤러리 원본은 목록·상세 페이지가 계속 사용).

## 매핑: 페이지별 loose 이미지 (이동 `git mv`)
| 옛 (images/) | 새 | 페이지 |
|---|---|---|
| reviews-banner | main/reviews-banner/banner | index(메인) |
| about-hero | pages/about/hero | about |
| story-hero | pages/story/hero | story |
| story-ceo | pages/story/ceo | story |
| process-hero | pages/process/hero | process |
| process-1to1 | pages/process/detail-1to1 | process |
| process-integrated | pages/process/detail-integrated | process |
| service-01-full | pages/process/services/service-01-full | process |
| service-02-total | pages/process/services/service-02-total | process |
| service-03-home | pages/process/services/service-03-home | process |
| reviews-hero | pages/reviews/hero | reviews |

(각 항목 `-600`/`-1200`/full 3변형 동반.)

## 삭제한 파일 (미사용)
| 파일 | 사유 |
|---|---|
| images/projects/06-pangyo/06-pangyo-card-cover-01{,-1200,-600}.webp (3) | 메인이 복사본 사용 후 미참조 (매니페스트에도 없던 수동 파일) |
| (메인 복사 시 과다생성분) main/hero/*-600 (7), main/portfolio-thumbnail/*풀사이즈(6) | 슬라이더는 -1200/full, 카드는 -600/-1200만 사용 → 미생성/삭제 |

## 변경 없음
- 매니페스트, `images/logo/**`, 루트 브랜드(favicon·og·webmanifest), 파이프라인 스크립트의 동작.
- (갤러리 폴더 `images/projects/**` 자체는 위 후속 변경에서 `proj-XX` → `NN-slug` 로 리네임됨 — 산출물 내용·매니페스트 구조는 동일.)

## 알아둘 점
- 메인이 쓰는 이미지는 **복사본**이라, 원본 프로젝트 이미지를 바꿔도 메인은 자동 반영되지 않음(메인 갱신 시 해당 main/ 파일 교체 필요).
- 프로젝트 갤러리의 미사용 hero `-600` 변형(섹션 hero 등 일부)은 매니페스트·파이프라인과 얽혀 있어 이번에 정리하지 않음 — 필요 시 optimize 스크립트에 변형 스킵 가드를 추가해 일괄 정리 가능.
