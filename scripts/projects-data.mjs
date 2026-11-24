// Single source of truth for project metadata.
// Image data comes from /images/projects/NN-slug/manifest.json.
//
// id stays aligned with the image folders, now named `${id}-${folderSlug}`
// (e.g. 06-pangyo, 01-sanun12). slug ('1'…'6') drives the page URL
// (/project/1.html …). folderSlug is the single source for the asset folder
// name — stage/optimize/build all derive `images/projects/NN-slug/` from it.
// The display order on the homepage hero/strip and portfolio listing follows
// the order of this PROJECTS array.

export const PROJECTS = [
  // ── 1. 판교원9단지 한림풀에버 ──
  {
    id: '06',
    slug: '6',
    folderSlug: 'pangyo',
    title: '판교원9단지 한림풀에버',
    subtitle: '미니멀 라이프의 시작 29평 리모델링',
    apartment: '판교원9단지 한림풀에버 아파트',
    address: '성남시 분당구 판교동',
    pyeong: '29평',
    period: '5주',
    completedAt: '2025년 10월',
    type: 'apartment',
    service: '11년 이상 구축',
    pricePerPy: '평당 300만원',
    keywords: '미니멀 주방, 중문이 있는, 우드 포인트',
    scope: '거실, 주방, 욕실, 침실, 현관',
    description: [
      '숲이 한눈에 들어오는 큰 창을 중심으로, 자연광과 여백이 돋보이는 공간으로 완성했어요.',
      '화이트와 뉴트럴 톤을 베이스로 차분하고 편안한 분위기를 담아냈습니다. 현관에는 우드 프레임의 유리 중문을 적용해 따뜻한 첫인상과 개방감을 더했어요.',
      '벽면은 미니멀한 마감으로 정리해 공간이 하나의 면처럼 이어지도록 연출했고, 주방과 세탁 공간은 히든 도어와 수납 디테일로 미니멀한 생활감을 유지할 수 있도록 구성했습니다.',
    ],
    sectionLabels: {
      living: '거실',
      kitchen: '주방',
      'bath-a': '욕실-A',
      'bath-b': '욕실-B',
      'bed-a': '침실-A',
      'bed-b': '침실-B',
      'bed-c': '침실-C',
      entrance: '현관',
    },
  },

  // ── 2. 성복역 롯데캐슬 골드타운 ──
  {
    id: '02',
    slug: '2',
    folderSlug: 'seongbok',
    title: '성복역 롯데캐슬 골드타운',
    subtitle: '따뜻한 우드톤 35평 홈스타일링',
    apartment: '성복역 롯데캐슬골드타운 아파트',
    address: '용인시 수지구 성복동',
    pyeong: '35평',
    period: '4주',
    completedAt: '2025년 9월',
    type: 'apartment',
    service: '5년 이상 준신축',
    pricePerPy: '평당 150만원',
    keywords: '화이트 앤 베이지, 세련된 오브제',
    scope: '거실, 주방, 욕실, 침실, 현관',
    description: [
      '전체 공간은 기존 구조를 살리면서 화이트와 베이지 톤 중심으로 분위기를 정돈했어요.',
      '부드러운 패브릭과 우드 소재, 간결한 조명 연출을 더해 일상 속 편안함이 느껴지는 공간으로 완성했어요. 거실은 긴 커튼과 미니멀한 가구 구성으로 자연광이 더욱 부드럽게 퍼지도록 연출했어요.',
      '다이닝 공간은 조형감 있는 펜던트 조명과 따뜻한 컬러감의 소품으로 톤 변화를 두었고, 침실과 복도 공간 역시 조명과 스타일링 요소를 정리해 집 전체의 톤이 자연스럽게 이어지도록 구성했습니다. *이 현장은 홈리에종과 함께 진행한 현장입니다.',
    ],
    sectionLabels: {
      living: '거실',
      kitchen: '주방',
      'bed-a': '침실-A',
      'bed-b': '침실-B',
      'bed-c': '침실-C',
      entrance: '현관',
    },
  },

  // ── 3. 산운12단지 판교센트럴포레와이시티 ──
  {
    id: '01',
    slug: '1',
    folderSlug: 'sanun12',
    title: '산운12단지 판교센트럴포레와이시티',
    subtitle: '가족의 온기를 담은 24평 리모델링',
    apartment: '산운12단지 판교센트럴포레와이시티 아파트',
    address: '성남시 분당구 판교동',
    pyeong: '24평',
    period: '4주',
    completedAt: '2026년 3월',
    type: 'apartment',
    service: '11년 이상 구축',
    pricePerPy: '평당 240만원',
    keywords: '우드톤 포인트, 남다른 욕실',
    scope: '거실, 주방, 욕실, 침실, 현관',
    description: [
      '전체 공간은 화이트와 베이지 톤을 중심으로 차분하고 편안한 분위기를 담아냈어요.',
      '밝은 우드 마루와 간결한 조명 계획으로 24평 공간이 더욱 넓고 부드럽게 느껴지도록 구성했습니다. 주방은 화이트 상부장과 우드 하부장을 매치해 깔끔하면서도 따뜻한 분위기를 더했어요.',
      '동선을 고려한 ㄱ자 구조로 실용성과 수납 효율까지 함께 담아냈고, 현관은 화이트 수납장과 패턴 타일로 이국적인 분위기를 은은하게 더했습니다.',
    ],
    sectionLabels: {
      living: '거실',
      kitchen: '주방',
      'bath-a': '욕실-A',
      'bath-b': '욕실-B',
      'bed-a': '침실-A',
      'bed-b': '침실-B',
      'bed-c': '침실-C',
      entrance: '현관',
    },
  },

  // ── 4. 은어송마을 코오롱하늘채2단지 ──
  {
    id: '04',
    slug: '4',
    folderSlug: 'euneosong',
    title: '은어송마을 코오롱하늘채2단지',
    subtitle: '반려견과 신혼부부를 위한 홈스타일링',
    apartment: '은어송마을 코오롱하늘채2단지 아파트',
    address: '대전 동구 대성동',
    pyeong: '35평',
    period: '4주',
    completedAt: '2025년 7월',
    type: 'apartment',
    service: '11년 이상 구축',
    pricePerPy: '평당 200만원',
    keywords: '화이트 앤 우드, 반려견',
    scope: '거실, 주방, 침실, 현관',
    description: [
      '결혼을 앞둔 신혼부부 고객님이 기존 거주 공간을 새롭게 리디자인하며 진행한 35평 홈스타일링 프로젝트입니다.',
      '화이트와 아이보리 톤을 중심으로 공간 전체를 밝고 편안한 분위기로 정리하고, 우드 포인트로 따뜻한 무드를 더했어요. 거실은 자연광과 패브릭의 부드러운 조화를 중심으로 여유롭고 깨끗한 분위기를 담아냈습니다.',
      '주방과 현관은 우드 디테일과 정돈된 수납 구성을 통해 생활감과 디자인의 균형을 맞췄고, 반려견과 함께하는 일상까지 고려해 편안한 동선과 관리가 쉬운 공간으로 완성한 신혼집 프로젝트입니다.',
    ],
    sectionLabels: {
      living: '거실',
      kitchen: '주방',
      'bed-a': '침실-A',
      'bed-b': '침실-B',
      'bed-c': '침실-C',
      entrance: '현관',
    },
  },

  // ── 5. 신당동 남산타운 ──
  {
    id: '03',
    slug: '3',
    folderSlug: 'sindang',
    title: '신당동 남산타운',
    subtitle: '자연의 온도를 담은 26평 홈스타일링',
    apartment: '남산타운 아파트',
    address: '서울시 중구 신당동',
    pyeong: '26평',
    period: '3주',
    completedAt: '2024년 10월',
    type: 'apartment',
    service: '11년 이상 구축',
    pricePerPy: '평당 150만원',
    keywords: '화이트 앤 베이지, 세련된 오브제',
    scope: '거실, 주방, 욕실, 침실, 현관',
    description: [
      '전체 공간은 화이트와 베이지 톤을 중심으로 부드럽고 안정감 있는 분위기를 담아냈어요.',
      '은은한 텍스처의 벽면과 우드 가구, 패브릭 커튼을 조화롭게 구성해 일상 속 편안함이 느껴지는 공간으로 완성했습니다. 다이닝 공간은 조형감 있는 조명과 모빌 오브제를 더해 차분한 공간에 감각적인 포인트를 담아냈어요.',
      '긴 템바보드 수납장과 아트 스타일링으로 벽면이 하나의 갤러리처럼 느껴지도록 연출했고, 침실은 결이 살아있는 우드 가구와 따뜻한 조명으로 호텔 같은 아늑한 분위기를 완성했어요. *이 현장은 홈리에종과 함께 진행한 현장입니다.',
    ],
    sectionLabels: {
      living: '거실',
      bedroom: '안방',
      entrance: '현관',
    },
  },

  // ── 6. 이태원 단독주택 에어비앤비 ──
  {
    id: '05',
    slug: '5',
    folderSlug: 'itaewon',
    title: '이태원 단독주택 에어비앤비',
    subtitle: '빈티지 무드 에어비앤비 홈스타일링',
    apartment: '이태원 단독주택 에어비앤비',
    address: '서울시 용산구 보광동',
    pyeong: '34평',
    period: '4주',
    completedAt: '2025년 2월',
    type: 'house',
    // 에어비앤비 운영 공간이라 '주택' / '상업공간' 필터 양쪽에 노출한다.
    // (type 은 상세 페이지 라벨·_assets.json 의 단일 값으로 계속 쓰이고,
    //  extraTypes 는 포트폴리오 목록 카드의 data-type 에만 더해진다)
    extraTypes: ['commercial'],
    service: '11년 이상 구축',
    pricePerPy: '평당 170만원',
    keywords: '월넛 앤 우드, 게스트하우스',
    scope: '거실, 주방, 게스트룸, 현관',
    description: [
      '이태원 단독주택을 에어비앤비 공간으로 운영하기 위해 진행한 홈스타일링 프로젝트입니다.',
      '화이트 벽면과 짙은 우드 가구, 브라운 레더 소파를 조화롭게 구성해 따뜻하고 깊이 있는 분위기를 완성했어요. 기존 공간의 클래식한 구조를 살리면서 아치 디테일과 오픈 북셀프를 더해 이국적인 무드를 담아냈습니다.',
      '거실과 다이닝 공간은 여행처럼 머무는 듯한 편안함과 감성을 중심으로 스타일링했고, 침실은 호텔처럼 안정감 있는 조명과 우드톤 가구를 활용해 차분한 휴식 공간으로 연출했어요.',
    ],
    sectionLabels: {
      living: '거실',
      kitchen: '주방',
      'room-a': 'Room-A',
      'room-b': 'Room-B',
      'room-c': 'Room-C',
    },
  },

  // ── 7. 경태의 서재 (하남 감일동 애견호텔 — 목록 마지막 노출) ──
  {
    id: '07',
    slug: '7',
    folderSlug: 'gamil',
    title: '경태의 서재',
    subtitle: '하남 감일동 14평 애견호텔, 빈티지 유럽 서재처럼',
    // 상업공간은 상세 스펙 첫 칸이 '상업공간' 라벨 + 공간 유형 값으로 렌더된다.
    apartment: '애견호텔 · 데이케어 · 운영자 서재',
    address: '경기도 하남시 감일백제로180번길 30-1, 근린생활시설동 1층',
    pyeong: '14평 (약 46㎡)',
    period: '2주',
    completedAt: '2026년 10월',
    type: 'commercial',
    service: '상업공간 외부·내부 인테리어 및 가구·소품 스타일링',
    pricePerPy: '-',
    keywords: '빈티지 유럽 서재, 딥 브라운, 앤티크 조명, 템바보드, 반려견 안전 동선',
    scope: '외부 파사드 갈바 및 도장, 어닝, 유리면 레터링, 금속 이중 출입문, 내부 천장·도배·템바보드, 조명, 수도 설비 및 싱크대, 가구·소품 스타일링',
    description: [
      '‘경태의 서재’는 반려견 경태와 친구들이 편안하게 쉬고, 작가를 꿈꾸는 사장님이 글을 쓰는 애견호텔입니다. 하남 감일동의 14평 공간에 짙은 브라운과 따뜻한 조명으로 빈티지 유럽 서재의 분위기를 담았습니다.',
      '외부 파사드는 갈바 작업 후 벤자민무어 페인트로 마감하고, 짙은 브라운 어닝을 더해 클래식한 첫인상을 만들었어요. 강아지들의 안전을 위해 외부 출입문과 실내 안전문을 금속으로 제작해 이중 출입 구조를 만들고, 같은 페인트 톤으로 일체감을 주었습니다.',
      '실내 벽 하부는 관리하기 편하도록 우드 톤 템바보드를 두르고, 상부는 따뜻한 화이트 계열 벽지로 마감했습니다. 다운라이트로 공간을 고르게 밝히고 앤티크 펜던트로 서재의 아늑한 분위기를 더했어요. 책장과 책상, 원목 가구와 앤티크 소품을 스타일링해 경태와 친구들의 쉼과 사장님의 글쓰기가 함께하는 공간을 완성했습니다.',
    ],
    // 원본 사진 stage 시 프로젝트 대표 컷(NN-slug-hero-*)으로 쓸 섹션. 거실이 없어 '내부'.
    mainHeroSection: 'interior',
    // 갤러리는 외부부터 보여주지만, 카드 커버/메인 썸네일은 내부 after 컷을 쓴다
    // (메인 홈 strip 썸네일과 소스를 맞추기 위함).
    coverSection: 'interior',
    // 외부(파사드) → 내부 순서. 이 키 순서가 갤러리 탭/사진 순서를 그대로 결정한다.
    sectionLabels: {
      exterior: '외부',
      interior: '내부',
    },
  },
];

export const PROJECTS_BY_ID = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

// id → folderSlug (sanun12, pangyo …). stage-images / optimize-images import this
// so the slug is defined in exactly one place. Asset folder = `${id}-${slug}`.
export const FOLDER_SLUG_BY_ID = Object.fromEntries(
  PROJECTS.map((p) => [p.id, p.folderSlug]),
);

// 'NN' → 'NN-slug' helper for building the asset folder/file prefix.
export const projDirById = (id) => `${id}-${FOLDER_SLUG_BY_ID[id]}`;

// 프로젝트의 '메인 hero' 섹션 — 비포에프터 쌍이 프로젝트 대표 컷(NN-slug-hero-*)이 되는
// 섹션. 주거는 거실('living')이 기본이고, 상업공간처럼 거실이 없는 현장은
// projects-data 의 mainHeroSection 으로 지정한다. stage-images 가 파일명을 정할 때 쓴다.
export const mainHeroSectionById = (id) =>
  PROJECTS_BY_ID[id]?.mainHeroSection || 'living';
