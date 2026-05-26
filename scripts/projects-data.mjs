// Single source of truth for project metadata.
// Image data comes from /images/projects/proj-XX/manifest.json.
//
// id/slug stay aligned with the image folders (proj-01 … proj-06), so existing
// URLs (/project/1.html …) and asset paths keep working.
// The display order on the homepage hero/strip and portfolio listing follows
// the order of this PROJECTS array.

export const PROJECTS = [
  // ── 1. 판교원9단지 한림풀에버 (시공 가장 최근, 메인 노출 1순위) ──
  {
    id: '06',
    slug: '6',
    title: '판교원9단지 한림풀에버',
    subtitle: '미니멀 라이프의 시작 29평 리모델링',
    apartment: '판교원9단지 한림풀에버 아파트',
    address: '성남시 분당구 판교동',
    pyeong: '29평',
    period: '5주',
    completedAt: '2025년 10월',
    type: 'apartment',
    service: '11년 이상 구축',
    pricePerPy: '평당 300만원대',
    keywords: '미니멀 주방, 중문이 있는, 우드 포인트',
    scope: '거실, 주방, 욕실, 침실, 현관',
    description: [
      '숲이 한눈에 들어오는 큰 창을 중심으로, 자연광과 여백이 돋보이는 공간으로 완성했어요.',
      '화이트와 뉴트럴 톤을 베이스로 차분하고 편안한 분위기를 담아냈습니다. 현관에는 우드 프레임의 유리 중문을 적용해 따뜻한 첫인상과 개방감을 더했어요.',
      '벽면은 미니멀한 마감으로 정리해 공간이 하나의 면처럼 이어지도록 연출했고, 주방과 세탁 공간은 정돈된 도어와 수납 디테일로 알뜰한 생활감을 유지할 수 있도록 구성했습니다.',
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
    title: '성복역 롯데캐슬 골드타운',
    subtitle: '따뜻한 우드 톤 35평 홈스타일링',
    apartment: '성복역 롯데캐슬골드타운 아파트',
    address: '용인시 수지구 성복동',
    pyeong: '35평',
    period: '4주',
    completedAt: '2025년 9월',
    type: 'apartment',
    service: '5년 이상 준신축',
    pricePerPy: '디자인비 350만원~ (*프로젝트별 견적진행)',
    keywords: '화이트 앤 베이지, 세련된 오브제',
    scope: '거실, 주방, 욕실, 침실, 현관',
    description: [
      '전체 공간은 기존 구조를 살리면서 화이트와 베이지 톤 중심으로 분위기를 정돈했어요.',
      '부드러운 패브릭과 우드 소재, 간결한 조명 연출을 더해 일상 속 편안함이 느껴지는 공간으로 완성했어요. 거실은 긴 커튼과 미니멀한 가구 구성으로 자연광이 더욱 부드럽게 퍼지도록 연출했어요.',
      '다이닝 공간은 조형감 있는 펜던트 조명과 따뜻한 컬러감의 소품으로 톤 변화를 두었고, 침실과 복도 공간 역시 조명과 스타일링 요소를 정리해 집 전체의 톤이 자연스럽게 이어지도록 구성했습니다. *이 현장은 졸리예중과 함께 진행한 현장입니다.',
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

  // ── 3. 은어송마을 코오롱하늘채2단지 ──
  {
    id: '04',
    slug: '4',
    title: '은어송마을 코오롱하늘채2단지',
    subtitle: '반려견과 신혼부부를 위한 홈스타일링',
    apartment: '은어송마을 코오롱하늘채2단지 아파트',
    address: '대전 동구 대성동',
    pyeong: '35평',
    period: '4주',
    completedAt: '2025년 7월',
    type: 'apartment',
    service: '11년 이상 구축',
    pricePerPy: '디자인비 350만원~ (*프로젝트별 견적진행)',
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

  // ── 4. 이태원 단독주택 에어비앤비 ──
  {
    id: '05',
    slug: '5',
    title: '이태원 단독주택 에어비앤비',
    subtitle: '빈티지 무드 에어비앤비 홈스타일링',
    apartment: '이태원 단독주택 에어비앤비',
    address: '서울시 용산구 보광동',
    pyeong: '34평',
    period: '4주',
    completedAt: '2025년 2월',
    type: 'house',
    service: '11년 이상 구축',
    pricePerPy: '홈스타일링 컨설팅비 350만원~ (*프로젝트별 견적진행)',
    keywords: '월넛 앤 우드, 게스트하우스',
    scope: '거실, 주방, 게스트룸, 현관',
    description: [
      '이태원 단독주택을 에어비앤비 공간으로 운영하기 위해 진행한 홈스타일링 프로젝트입니다.',
      '화이트 벽면과 짙은 우드 가구, 브라운 레더 소파를 조화롭게 구성해 따뜻하고 깊이 있는 분위기를 완성했어요. 기존 공간의 클래식한 구조를 살리면서 아치 디테일과 오픈 북셀프를 더해 이국적인 무드를 담아냈습니다.',
      '거실과 다이닝 공간은 여행처럼 머무는 듯한 편안함과 감성을 중심으로 스타일링했고, 침실은 호텔처럼 안정감 있는 조명과 우드 톤 가구를 활용해 차분한 휴식 공간으로 연출했어요.',
    ],
    sectionLabels: {
      living: '거실',
      kitchen: '주방',
      'room-a': 'Room-A',
      'room-b': 'Room-B',
      'room-c': 'Room-C',
    },
  },

  // ── 5. 신당동 남산타운 ──
  {
    id: '03',
    slug: '3',
    title: '신당동 남산타운',
    subtitle: '따뜻한 우드 톤 26평 홈스타일링',
    apartment: '남산타운 아파트',
    address: '서울시 중구 신당동',
    pyeong: '26평',
    period: '3주',
    completedAt: '2024년 10월',
    type: 'apartment',
    service: '11년 이상 구축',
    pricePerPy: '디자인비 - (*프로젝트별 견적진행)',
    keywords: '화이트 앤 베이지, 세련된 오브제',
    scope: '거실, 주방, 욕실, 침실, 현관',
    description: [
      '전체 공간은 화이트와 베이지 톤을 중심으로 부드럽고 안정감 있는 분위기를 담아냈어요.',
      '은은한 텍스처의 벽면과 우드 가구, 패브릭 커튼을 조화롭게 구성해 일상 속 편안함이 느껴지는 공간으로 완성했습니다. 다이닝 공간은 조형감 있는 조명과 모빌 오브제를 더해 차분한 공간에 감각적인 포인트를 담아냈어요.',
      '긴 템부드 수납장과 아트 스타일링으로 벽면이 하나의 갤러리처럼 느껴지도록 연출했고, 침실은 결이 살아있는 우드 가구와 따뜻한 조명으로 호텔 같은 아늑한 분위기를 완성했어요. *이 현장은 졸리예중과 함께 진행한 현장입니다.',
    ],
    sectionLabels: {
      living: '거실',
      bedroom: '안방',
      entrance: '현관',
    },
  },

  // ── 6. 산운12단지 판교센트럴포레와이시티 ──
  {
    id: '01',
    slug: '1',
    title: '산운12단지 판교센트럴포레와이시티',
    subtitle: '가족의 온기를 담은 24평 리모델링',
    apartment: '산운12단지 판교센트럴포레와이시티 아파트',
    address: '성남시 분당구 판교동',
    pyeong: '24평',
    period: '4주',
    completedAt: '2026년 3월',
    type: 'apartment',
    service: '11년 이상 구축',
    pricePerPy: '평당 240만원대',
    keywords: '우드 톤 포인트, 남다른 욕실',
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
];

export const PROJECTS_BY_ID = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
