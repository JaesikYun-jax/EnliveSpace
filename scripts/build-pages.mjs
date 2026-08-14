#!/usr/bin/env node
// Generates project detail pages, portfolio listing, and homepage assets
// from /images/projects/NN-slug/manifest.json + scripts/projects-data.mjs.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROJECTS, projDirById } from './projects-data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function html(strings, ...values) {
  return String.raw({ raw: strings }, ...values);
}

const HEADER = `
  <header class="site-header">
    <div class="site-header-inner">
      <a href="/" class="site-logo" aria-label="Enliven Space 홈"><img src="/images/logo/logo-dark.png" srcset="/images/logo/logo-dark@1x.png 1x, /images/logo/logo-dark.png 2x" alt="Enliven Space"></a>
      <nav class="site-nav" aria-label="주요 메뉴">
        <a href="/about.html">인라이븐스페이스</a>
        <a href="/story.html">공간이야기</a>
        <a href="/process.html">진행방식</a>
        <a href="/project/">포트폴리오</a>
        <a href="/reviews.html">후기</a>
      </nav>
      <button id="menu-toggle" class="menu-toggle" type="button" aria-label="메뉴 열기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </header>
  <div id="mobile-menu" class="mobile-menu" aria-hidden="true">
    <button id="menu-close" class="menu-close" type="button" aria-label="메뉴 닫기">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
    </button>
    <a href="/about.html">인라이븐스페이스</a>
    <a href="/story.html">공간이야기</a>
    <a href="/process.html">진행방식</a>
    <a href="/project/">포트폴리오</a>
    <a href="/reviews.html">후기</a>
  </div>
`;

const FOOTER = `
  <footer class="site-footer" id="contact">
    <div class="site-footer-inner">
      <div class="footer-top">
        <div><a href="/" class="footer-logo" aria-label="Enliven Space 홈"><img src="/images/logo/logo-light.png" srcset="/images/logo/logo-light@1x.png 1x, /images/logo/logo-light.png 2x" alt="Enliven Space"></a></div>
        <div class="footer-cols">
          <div class="footer-col">
            <h4 class="footer-col-title">정보</h4>
            <ul class="footer-col-list">
              <li><a href="/about.html">회사 소개</a></li>
              <li><a href="/story.html">공간이야기</a></li>
              <li><a href="/process.html">진행방식</a></li>
              <li><a href="/project/">포트폴리오</a></li>
              <li><a href="/reviews.html">후기</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">안내</h4>
            <ul class="footer-col-list">
              <li><a href="https://tally.so/r/J9eROr" target="_blank" rel="noopener noreferrer" data-action="consult">상담 문의</a></li>
              <li><a href="/reviews.html">서비스 후기</a></li>
            </ul>
            <div class="footer-sns" aria-label="SNS 연결">
              <a href="http://pf.kakao.com/_eSTPG/chat" target="_blank" rel="noopener noreferrer" aria-label="카카오톡 채널"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.88 5.36 4.7 6.78l-.95 3.48c-.08.3.25.55.5.38l4.18-2.78c.51.05 1.04.08 1.57.08 5.52 0 10-3.58 10-8S17.52 3 12 3z"/></svg></a>
              <a href="https://www.instagram.com/enlivenspace_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg></a>
              <a href="https://blog.naver.com/enlivenspace" target="_blank" rel="noopener noreferrer" aria-label="네이버 블로그"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><defs><mask id="naverBlogMask"><rect width="24" height="24" fill="white"/><text x="12" y="13.2" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="7" text-anchor="middle" letter-spacing="-0.3" fill="black">Blog</text></mask></defs><path d="M3 3h18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6l-2.3 3a1 1 0 0 1-1.6 0L8.8 18H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" mask="url(#naverBlogMask)"/></svg></a>
            </div>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">고객센터</h4>
            <ul class="footer-col-list">
              <li class="footer-contact-line"><span class="label">전화번호</span><a href="tel:050-6662-8126">050-6662-8126</a></li>
              <li class="footer-contact-line"><span class="label">영업시간</span>평일 10:00 ~ 17:00 (공휴일 제외)</li>
              <li class="footer-contact-line"><span class="label">Email</span><a href="mailto:enlivenspace@naver.com">enlivenspace@naver.com</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-info">
          <div class="info-line">
            <span>상호명: 인라이븐 스페이스</span><span class="sep">|</span>
            <span>사업자 등록번호: 524-05-03153</span><span class="sep">|</span>
            <span>주소: 경기도 용인시 수지구 신봉3로 6 (동도센트리움 1층 상가, 101동 102호)</span><span class="sep">|</span>
            <span>TEL: 050-6662-8126</span><span class="sep">|</span>
            <span>Email: <a href="mailto:enlivenspace@naver.com">enlivenspace@naver.com</a></span>
          </div>
          <p class="copyright">Copyright © 2026 ENLIVEN SPACE All Rights Reserved</p>
        </div>
      </div>
    </div>
  </footer>
  <div class="fab" id="fab" aria-label="플로팅 액션">
    <a class="fab-item fab-item--consult" href="https://tally.so/r/J9eROr" data-action="consult" target="_blank" rel="noopener noreferrer" aria-label="상담 신청">상담<br/>신청</a>
    <a class="fab-item fab-item--kakao" href="http://pf.kakao.com/_eSTPG/chat" data-action="kakao" target="_blank" rel="noopener noreferrer" aria-label="카카오 문의">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.88 5.36 4.7 6.78l-.95 3.48c-.08.3.25.55.5.38l4.18-2.78c.51.05 1.04.08 1.57.08 5.52 0 10-3.58 10-8S17.52 3 12 3z"/></svg>
    </a>
    <button class="fab-main" id="fab-toggle" type="button" aria-label="문의 메뉴" aria-expanded="false">
      <span class="fab-face fab-face--consult">상담<br/>신청</span>
      <span class="fab-face fab-face--kakao"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.88 5.36 4.7 6.78l-.95 3.48c-.08.3.25.55.5.38l4.18-2.78c.51.05 1.04.08 1.57.08 5.52 0 10-3.58 10-8S17.52 3 12 3z"/></svg></span>
      <span class="fab-face fab-face--close"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span>
    </button>
  </div>
`;

const TW_CONFIG = `
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: {
        fontFamily: {
          sans: ['NanumSquare','Noto Sans KR','sans-serif'],
          en: ['GmarketSansMedium','Inter','sans-serif'],
          'en-bold': ['GmarketSansBold','Inter','sans-serif']
        },
        colors: {
          ink:'#171717','ink-2':'#525252','ink-3':'#a3a3a3',paper:'#ffffff','paper-2':'#f7f7f7'
        }
      } }
    }
  </script>
`;

async function readManifest(id) {
  const p = path.join(ROOT, 'images/projects', projDirById(id), 'manifest.json');
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

function findFile(variants, suffix) {
  return variants.find((v) => v.name.endsWith(suffix === '' ? '.webp' : `${suffix}.webp`) && !/-(1200|600)\.webp$/.test(v.name) === (suffix === '')) || variants[0];
}

// Pick variant by suffix ('', '-1200', '-600')
function pick(variants, suffix) {
  if (suffix === '') {
    return variants.find((v) => !/-(1200|600)\.webp$/.test(v.name));
  }
  return variants.find((v) => v.name.endsWith(`${suffix}.webp`));
}

// Hero pair for a section: returns { before, after } objects or null if not present
function getHeroPair(section) {
  const heroes = section.filter((f) => f.kind === 'hero');
  if (heroes.length === 0) return null;
  let before = heroes.find((h) => /-before\.jpg$/i.test(h.source));
  let after = heroes.find((h) => /-after\.jpg$/i.test(h.source));
  return { before, after };
}

function imgTag({ src, alt, className = '', loading = 'lazy', sizes = '100vw', srcsetVariants = [] }) {
  const srcset = srcsetVariants.length
    ? `srcset="${srcsetVariants.map((v) => `${v.url} ${v.w}w`).join(', ')}" sizes="${sizes}"`
    : '';
  return `<img src="${src}" alt="${alt}" loading="${loading}" decoding="async" class="${className}" ${srcset}>`;
}

// `name` is the manifest variant name = project-relative path, which now
// includes the section subfolder (e.g. "living/06-pangyo-living-01.webp" or
// "bath-a/before-after/06-pangyo-bath-a-hero-after.webp"). No extra logic
// needed — the nested path concatenates straight into the URL.
function projectAssetUrl(projId, name) {
  return `/images/projects/${projDirById(projId)}/${name}`;
}

function buildSrcset(projId, variantSet) {
  return variantSet
    .filter(Boolean)
    .map((v) => ({ url: projectAssetUrl(projId, v.name), w: v.w }));
}

// =========================
// DETAIL PAGE BUILDER
// =========================
function renderRoomTabs(project, manifest) {
  const labels = project.sectionLabels;
  const order = Object.keys(labels).filter((k) => manifest.sections[k]?.length);
  // PDF round-2 feedback: "전체" 탭 제거, 거실/주방/욕실/침실/현관 등 실 섹션만 노출
  const tabs = order.map((sec, i) => {
    const count = manifest.sections[sec].reduce((acc, f) => acc + (f.kind === 'regular' ? 1 : 0), 0)
      + (getHeroPair(manifest.sections[sec])?.after ? 1 : 0);
    const activeCls = i === 0 ? ' active' : '';
    return `<button class="room-tab${activeCls}" data-room="${sec}" type="button">${labels[sec]} (${count})</button>`;
  });
  return tabs.join('\n          ');
}

// 섹션별 첫 화면 노출 카드 수. 초과분은 'data-overflow' 로 표시되어 '사진 더보기' 로 펼침.
const INITIAL_VISIBLE = 5;

// 섹션의 갤러리 카드 총수 (hero 카드 1 + regular N)
function sectionCardCount(items) {
  const pair = getHeroPair(items);
  const heroCount = pair?.after ? 1 : 0;
  const regCount = items.filter((f) => f.kind === 'regular').length;
  return heroCount + regCount;
}

function renderGalleryCards(project, manifest) {
  const labels = project.sectionLabels;
  const cards = [];
  const order = Object.keys(labels).filter((k) => manifest.sections[k]?.length);

  for (const section of order) {
    const items = manifest.sections[section];
    const pair = getHeroPair(items);
    let idx = 0; // 섹션 내 카드 순번 — INITIAL_VISIBLE 이상이면 overflow
    const ov = () => (idx >= INITIAL_VISIBLE ? ' data-overflow="1"' : '');

    // Hero card: before/after toggle (shown only if both exist)
    if (pair?.before && pair?.after) {
      const afterMain = pick(pair.after.variants, '');
      const afterMid = pick(pair.after.variants, '-1200');
      const beforeMain = pick(pair.before.variants, '');
      const beforeMid = pick(pair.before.variants, '-1200');
      // 비포/애프터 hero(after 기준)가 세로 원본이면 가로 크롭 대신 세로비(3:4)로 — 사이트의 일반 세로 카드 규칙(data-ar 0.75)과 동일.
      // 가로 hero는 기존 와이드 배너(4:3 / 3:2). 비포/애프터 비율이 서로 달라도 한 박스에 object-cover 로 담는다(예: 신당동 거실 before 0.75 / after 0.667).
      const baVertical = afterMain.vertical;
      const baAspect = baVertical ? 'aspect-[3/4]' : 'aspect-[4/3] sm:aspect-[3/2]';
      const baAr = baVertical ? 'data-ar="0.75"' : 'data-ar="1.3333" data-ar-sm="1.5"';
      cards.push(`
          <div class="gallery-item relative ba-card cursor-zoom-in ${baAspect}" data-room="${section}"${ov()} data-span="2" ${baAr} data-lightbox-src="${projectAssetUrl(project.id, afterMain.name)}">
            <img class="ba-after absolute inset-0 w-full h-full object-cover"
                 src="${projectAssetUrl(project.id, afterMid.name)}"
                 srcset="${projectAssetUrl(project.id, afterMid.name)} 1200w, ${projectAssetUrl(project.id, afterMain.name)} 1920w"
                 sizes="(min-width: 640px) 66vw, 100vw"
                 alt="${project.title} ${labels[section]} after"
                 loading="lazy" decoding="async">
            <img class="ba-before absolute inset-0 w-full h-full object-cover hidden"
                 src="${projectAssetUrl(project.id, beforeMid.name)}"
                 srcset="${projectAssetUrl(project.id, beforeMid.name)} 1200w, ${projectAssetUrl(project.id, beforeMain.name)} 1920w"
                 sizes="(min-width: 640px) 66vw, 100vw"
                 alt="${project.title} ${labels[section]} before"
                 loading="lazy" decoding="async">
            <div class="absolute top-3 left-3 ba-toggle">
              <button class="active" data-ba="after" type="button">after</button>
              <button data-ba="before" type="button">before</button>
            </div>
            <span class="absolute top-3 right-3 px-3 py-1.5 bg-black/55 text-white text-xs font-bold rounded-full backdrop-blur">${labels[section]}</span>
          </div>`);
      idx++;
    } else if (pair?.after) {
      // Only after, no before — show as a single card with section label
      const main = pick(pair.after.variants, '');
      const mid = pick(pair.after.variants, '-1200');
      const thumb = pick(pair.after.variants, '-600');
      cards.push(`
          <div class="gallery-item relative cursor-zoom-in" data-room="${section}"${ov()} data-ar="0.75" data-lightbox-src="${projectAssetUrl(project.id, main.name)}">
            <img class="w-full h-full object-cover aspect-[3/4]"
                 src="${projectAssetUrl(project.id, thumb.name)}"
                 srcset="${projectAssetUrl(project.id, thumb.name)} 600w, ${projectAssetUrl(project.id, mid.name)} 1200w"
                 sizes="(min-width: 640px) 33vw, 50vw"
                 alt="${project.title} ${labels[section]}"
                 loading="lazy" decoding="async">
            <span class="absolute top-3 right-3 px-3 py-1.5 bg-black/55 text-white text-xs font-bold rounded-full backdrop-blur">${labels[section]}</span>
          </div>`);
      idx++;
    }

    // Regular items
    const regulars = items.filter((f) => f.kind === 'regular');
    for (const item of regulars) {
      const main = pick(item.variants, '');
      const mid = pick(item.variants, '-1200');
      const thumb = pick(item.variants, '-600');
      const aspect = main.vertical ? 'aspect-[3/4]' : 'aspect-[4/3]';
      cards.push(`
          <div class="gallery-item relative cursor-zoom-in" data-room="${section}"${ov()} data-ar="${main.vertical ? '0.75' : '1.3333'}" data-lightbox-src="${projectAssetUrl(project.id, main.name)}">
            <img class="w-full h-full object-cover ${aspect}"
                 src="${projectAssetUrl(project.id, thumb.name)}"
                 srcset="${projectAssetUrl(project.id, thumb.name)} 600w, ${projectAssetUrl(project.id, mid.name)} 1200w"
                 sizes="(min-width: 640px) 33vw, 50vw"
                 alt="${project.title} ${labels[section]}"
                 loading="lazy" decoding="async">
          </div>`);
      idx++;
    }
  }
  return cards.join('');
}

// 섹션별 '사진 더보기' 버튼 — overflow 카드가 있는 섹션만. 첫 섹션만 초기 표시.
function renderMoreButtons(project, manifest) {
  const labels = project.sectionLabels;
  const order = Object.keys(labels).filter((k) => manifest.sections[k]?.length);
  return order
    .map((sec, i) => {
      const overflow = Math.max(0, sectionCardCount(manifest.sections[sec]) - INITIAL_VISIBLE);
      if (overflow === 0) return '';
      const hidden = i === 0 ? '' : ' style="display:none"';
      return `<button class="gallery-more-btn" data-room="${sec}" data-count="${overflow}"${hidden} type="button">사진 더보기 (${overflow}장)</button>`;
    })
    .filter(Boolean)
    .join('\n          ');
}

function buildDetailHTML(project, manifest) {
  // pick main hero (living section preferred, else first section with pair)
  const sectionOrder = Object.keys(project.sectionLabels);
  let heroSection = sectionOrder.find((s) => {
    const items = manifest.sections[s];
    if (!items) return false;
    const p = getHeroPair(items);
    return p?.before && p?.after;
  });
  if (!heroSection) heroSection = sectionOrder[0];

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>${project.title} 인테리어 | Enliven Space 포트폴리오</title>
  <meta name="description" content="${project.title} ${project.pyeong} 인테리어 프로젝트 — Enliven Space" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
${TW_CONFIG}
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon-180.png" />
  <link rel="manifest" href="/images/site.webmanifest" />
  <meta name="theme-color" content="#ffffff" />
  <style>
    .room-tab { padding: 8px 18px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.15); font-family: 'NanumSquare', sans-serif; font-size: 13px; font-weight: 700; color: #525252; background: #fff; transition: all 0.2s ease; white-space: nowrap; }
    .room-tab.active { background: #171717; color: #fff; border-color: #171717; }
    .room-tab:hover { border-color: #171717; }
    .ba-toggle { display: inline-flex; background: rgba(255,255,255,0.9); border-radius: 999px; padding: 3px; backdrop-filter: blur(4px); z-index: 5; }
    .ba-toggle button { padding: 4px 14px; font-size: 11px; font-weight: 700; font-family: 'GmarketSansBold', sans-serif; letter-spacing: 0.05em; border-radius: 999px; color: #525252; transition: all 0.2s ease; }
    .ba-toggle button.active { background: #171717; color: #fff; }
    /* 공유 토스트 — 버튼 클릭 즉시 링크 복사 후 하단 중앙에 살짝 떠오름 */
    .toast { position: fixed; left: 50%; bottom: calc(30px + env(safe-area-inset-bottom)); transform: translate(-50%, 18px); display: inline-flex; align-items: center; gap: 9px; max-width: calc(100vw - 32px); background: #171717; color: #fff; padding: 13px 22px; border-radius: 999px; font-family: 'NanumSquare', 'Noto Sans KR', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: -0.01em; white-space: nowrap; box-shadow: 0 14px 40px rgba(0,0,0,0.30); opacity: 0; visibility: hidden; pointer-events: none; z-index: 100; transition: opacity 0.34s ease, transform 0.34s cubic-bezier(0.22,1,0.36,1), visibility 0s linear 0.34s; }
    .toast.is-show { opacity: 1; visibility: visible; transform: translate(-50%, 0); transition: opacity 0.34s ease, transform 0.34s cubic-bezier(0.22,1,0.36,1); }
    .toast-check { display: inline-flex; flex-shrink: 0; }
    @media (prefers-reduced-motion: reduce) { .toast, .toast.is-show { transition: opacity 0.2s ease, visibility 0s; transform: translate(-50%, 0); } }
    .lightbox { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,0.92); display: none; align-items: center; justify-content: center; padding: 24px; }
    .lightbox.is-open { display: flex; }
    .lightbox-close { position: absolute; top: 20px; right: 20px; color: #fff; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; }
    .lightbox-img { max-width: 100%; max-height: 90vh; object-fit: contain; }
    .gallery-item { overflow: hidden; }
    .gallery-item img { transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    .gallery-item:hover img { transform: scale(1.03); }
    /* 퍼즐형 masonry — 카드는 JS가 절대좌표로 배치(빈틈 없음). --gap 은 기존 gap-2/gap-3 대응 */
    #gallery { position: relative; --gap: 8px; }
    @media (min-width: 640px) { #gallery { --gap: 12px; } }
    #gallery .gallery-item { position: absolute; top: 0; left: 0; }
    .gallery-more-btn { display: inline-flex; align-items: center; gap: 6px; padding: 11px 28px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.15); font-family: 'NanumSquare', 'Noto Sans KR', sans-serif; font-size: 14px; font-weight: 700; color: #171717; background: #fff; transition: all 0.2s ease; }
    .gallery-more-btn:hover { background: #171717; color: #fff; border-color: #171717; }
  </style>
</head>
<body>
${HEADER}

  <main class="site-main">

    <section class="px-5 sm:px-10 pt-12 sm:pt-16">
      <div class="max-w-[1440px] mx-auto">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 class="font-kr font-black text-2xl sm:text-3xl md:text-4xl mb-3 tracking-tight">${project.title}</h1>
            <p class="font-kr text-ink-2 text-sm sm:text-base">${project.subtitle}</p>
          </div>
          <div>
            <button id="share-trigger" class="inline-flex items-center gap-2 border border-black/15 px-4 py-2 rounded-full text-sm font-kr font-bold hover:bg-ink hover:text-white hover:border-ink transition-colors" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>
              공유하기
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="px-5 sm:px-10 pt-8">
      <div class="max-w-[1440px] mx-auto">
        <div class="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
          ${renderRoomTabs(project, manifest)}
        </div>
      </div>
    </section>

    <section class="px-5 sm:px-10 pt-6 pb-16">
      <div class="max-w-[1440px] mx-auto">
        <div id="gallery" class="masonry" style="visibility:hidden">${renderGalleryCards(project, manifest)}
        </div>
        <noscript><style>#gallery{visibility:visible!important}#gallery .gallery-item{position:static!important;width:auto!important;height:auto!important;transform:none!important;margin-bottom:12px}</style></noscript>
        <div id="gallery-more" class="text-center mt-6 sm:mt-8">
          ${renderMoreButtons(project, manifest)}
        </div>
      </div>
    </section>

    <section class="px-5 sm:px-10 pb-16 sm:pb-20">
      <div class="max-w-[1440px] mx-auto border-t border-black/15 pt-10 sm:pt-12">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <p class="font-kr text-ink-3 text-xs mb-3">상세 내용</p>
            ${project.description.map((p) => `<p class="font-kr text-ink leading-relaxed text-sm sm:text-base mb-4">${p}</p>`).join('\n            ')}
          </div>
          <div>
            <dl class="grid grid-cols-2 gap-x-6 gap-y-5 font-kr text-sm sm:text-base">
              <div><dt class="text-ink-3 text-xs mb-1">${project.type === 'house' ? '단독주택' : '아파트'}</dt><dd class="font-bold">${project.apartment}</dd></div>
              <div><dt class="text-ink-3 text-xs mb-1">주소</dt><dd class="font-bold">${project.address}</dd></div>
              <div><dt class="text-ink-3 text-xs mb-1">평형</dt><dd class="font-bold">${project.pyeong}</dd></div>
              <div><dt class="text-ink-3 text-xs mb-1">서비스</dt><dd class="font-bold">${project.service || '—'}</dd></div>
              <div><dt class="text-ink-3 text-xs mb-1">시공 기간</dt><dd class="font-bold">${project.period}</dd></div>
              <div><dt class="text-ink-3 text-xs mb-1">시공 시기</dt><dd class="font-bold">${project.completedAt}</dd></div>
              <div class="col-span-2"><dt class="text-ink-3 text-xs mb-1">시공 범위</dt><dd class="font-bold">${project.scope}</dd></div>
              <div class="col-span-2"><dt class="text-ink-3 text-xs mb-1">키워드</dt><dd class="font-bold">${project.keywords}</dd></div>
              <div class="col-span-2"><dt class="text-ink-3 text-xs mb-1">평당 견적</dt><dd class="font-bold">${project.pricePerPy}</dd></div>
            </dl>
          </div>
        </div>
        <div class="mt-12 sm:mt-16 text-center">
          <p class="font-kr text-ink-2 text-sm mb-4">해당 포트폴리오로 상담 받아보세요.</p>
          <a href="https://tally.so/r/J9eROr" data-action="consult" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-kr font-bold text-sm sm:text-base" style="background:#FFD60A; color:#171717;">
            견적 상담 신청하기
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 7H13M13 7L8 2M13 7L8 12"/></svg>
          </a>
        </div>
      </div>
    </section>

    <section class="px-5 sm:px-10 pb-20 sm:pb-28">
      <div class="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        <a href="/project/" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white text-sm font-kr font-bold hover:bg-ink-2 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 12L4 7L9 2"/></svg>
          목록
        </a>
        <a href="/project/" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-ink text-ink text-sm font-kr font-bold hover:bg-ink hover:text-white transition-colors">
          더 많은 공간모음 보러가기
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 2L10 7L5 12"/></svg>
        </a>
      </div>
    </section>
  </main>

  <div id="lightbox" class="lightbox" role="dialog" aria-modal="true">
    <button id="lightbox-close" class="lightbox-close" type="button" aria-label="닫기">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
    </button>
    <img id="lightbox-img" class="lightbox-img" alt="" />
  </div>

  <div id="toast" class="toast" role="status" aria-live="polite">
    <span class="toast-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
    <span class="toast-msg">링크가 복사되었습니다</span>
  </div>

${FOOTER}

  <script src="/js/main.js"></script>
  <script>
    // BEFORE/AFTER toggle (per-card)
    document.querySelectorAll('.ba-toggle').forEach(group => {
      const card = group.closest('.ba-card');
      const btns = group.querySelectorAll('button');
      btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = btn.dataset.ba;
          btns.forEach(b => b.classList.toggle('active', b === btn));
          card.querySelector('.ba-after').classList.toggle('hidden', target !== 'after');
          card.querySelector('.ba-before').classList.toggle('hidden', target !== 'before');
          // Update lightbox src so click opens currently visible state
          const visibleImg = card.querySelector(target === 'after' ? '.ba-after' : '.ba-before');
          card.dataset.lightboxSrc = visibleImg.currentSrc || visibleImg.src;
        });
      });
    });

    // ---- 퍼즐형 masonry 배치 (hero 2칸 폭, 나머지는 가장 짧은 열에 채워 내부 빈틈 제거) ----
    const galleryEl = document.getElementById('gallery');
    let _mAttempts = 0;
    function layoutMasonry() {
      if (!galleryEl) return;
      const isSm = window.matchMedia('(min-width: 640px)').matches;
      const cols = isSm ? 3 : 2;
      const gap = parseFloat(getComputedStyle(galleryEl).getPropertyValue('--gap')) || (isSm ? 12 : 8);
      const totalW = galleryEl.clientWidth;
      // 너비가 아직 0이면(폰트/레이아웃 타이밍) 숨긴 채 다음 프레임 재시도 — 영구 숨김 방지
      if (totalW <= 0) { if (_mAttempts++ < 60) requestAnimationFrame(layoutMasonry); return; }
      _mAttempts = 0;
      const colW = (totalW - gap * (cols - 1)) / cols;
      const colH = new Array(cols).fill(0); // 각 열의 현재 높이
      const items = Array.prototype.slice.call(galleryEl.querySelectorAll('.gallery-item'))
        .filter(function (el) { return el.style.display !== 'none'; });
      items.forEach(function (el) {
        const span = Math.min(el.dataset.span === '2' ? 2 : 1, cols);
        const ar = (isSm && el.dataset.arSm ? parseFloat(el.dataset.arSm) : parseFloat(el.dataset.ar)) || 1.3333;
        let col = 0;
        if (span === 2) {
          // 두 열을 차지 → 두 열 중 더 높은 쪽이 가장 낮아지는 시작열 선택
          let bestH = Infinity;
          for (let c = 0; c <= cols - 2; c++) {
            const h = Math.max(colH[c], colH[c + 1]);
            if (h < bestH - 0.5) { bestH = h; col = c; }
          }
        } else {
          // 가장 짧은 열
          let bestH = Infinity;
          for (let c = 0; c < cols; c++) {
            if (colH[c] < bestH - 0.5) { bestH = colH[c]; col = c; }
          }
        }
        const w = colW * span + gap * (span - 1);
        const h = w / ar;
        const x = col * (colW + gap);
        const y = span === 2 ? Math.max(colH[col], colH[col + 1]) : colH[col];
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        el.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        const bottom = y + h + gap;
        if (span === 2) { colH[col] = bottom; colH[col + 1] = bottom; }
        else { colH[col] = bottom; }
      });
      galleryEl.style.height = (Math.max.apply(null, colH.concat(gap)) - gap) + 'px';
      galleryEl.style.visibility = 'visible';
      galleryEl.classList.add('is-masonry-ready');
    }
    let _masonryT;
    window.addEventListener('resize', function () {
      clearTimeout(_masonryT);
      _masonryT = setTimeout(layoutMasonry, 120);
    });
    window.addEventListener('load', layoutMasonry);

    // Room tabs filter + 섹션별 '사진 더보기/접기'
    // (PDF round-2: '전체' 없음 → 첫 active 탭으로 초기 필터링)
    const expandedRooms = {}; // { 섹션: 펼침여부 }
    function applyRoom(room) {
      document.querySelectorAll('.gallery-item').forEach(item => {
        const inRoom = item.dataset.room === room;
        const isOverflow = item.dataset.overflow === '1';
        // 같은 섹션이고, overflow 아니거나 펼친 상태면 표시
        item.style.display = (inRoom && (!isOverflow || expandedRooms[room])) ? '' : 'none';
      });
      document.querySelectorAll('.gallery-more-btn').forEach(btn => {
        const inRoom = btn.dataset.room === room;
        btn.style.display = inRoom ? '' : 'none';
        if (inRoom) {
          btn.textContent = expandedRooms[room] ? '접기' : ('사진 더보기 (' + btn.dataset.count + '장)');
        }
      });
      layoutMasonry();
    }
    document.querySelectorAll('.room-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        applyRoom(tab.dataset.room);
      });
    });
    document.querySelectorAll('.gallery-more-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const room = btn.dataset.room;
        expandedRooms[room] = !expandedRooms[room];
        applyRoom(room);
      });
    });
    const initRoom = document.querySelector('.room-tab.active');
    if (initRoom) applyRoom(initRoom.dataset.room);

    // Share — 클릭 즉시 현재 페이지 URL 복사 후 토스트 표시
    const shareTrigger = document.getElementById('share-trigger');
    const toast = document.getElementById('toast');
    const toastMsg = toast?.querySelector('.toast-msg');
    let toastTimer;
    function showToast(message) {
      if (!toast) return;
      if (toastMsg) toastMsg.textContent = message;
      toast.classList.add('is-show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-show'), 2400);
    }
    async function copyCurrentUrl() {
      const url = location.href;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          const ta = document.createElement('textarea');
          ta.value = url; ta.setAttribute('readonly', '');
          ta.style.position = 'fixed'; ta.style.top = '-9999px'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta);
        }
        showToast('링크가 복사되었습니다');
      } catch (err) {
        showToast('복사에 실패했습니다');
      }
    }
    shareTrigger?.addEventListener('click', copyCurrentUrl);

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    document.querySelectorAll('.gallery-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.ba-toggle')) return;
        const src = el.dataset.lightboxSrc;
        if (!src) return;
        lightboxImg.src = src;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });
    lightboxClose.addEventListener('click', () => { lightbox.classList.remove('is-open'); document.body.style.overflow = ''; lightboxImg.src = ''; });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.classList.remove('is-open'); document.body.style.overflow = ''; lightboxImg.src = ''; } });
  </script>
</body>
</html>
`;
}

// =========================
// PORTFOLIO LISTING
// =========================
function projectCard(project, manifest) {
  // Pick cover: 1) manifest 의 'card-cover' 섹션 override → 2) living 의 after-hero → 3) 첫 regular
  const order = Object.keys(project.sectionLabels);
  let cover;
  const cardOverride = manifest.sections['card-cover'];
  if (cardOverride && cardOverride.length > 0) {
    cover = pick(cardOverride[0].variants, '-1200') || pick(cardOverride[0].variants, '');
  }
  if (!cover) {
    for (const sec of order) {
      const items = manifest.sections[sec];
      if (!items) continue;
      const p = getHeroPair(items);
      if (p?.after) {
        cover = pick(p.after.variants, '-1200') || pick(p.after.variants, '');
        break;
      }
    }
  }
  // Fallback: first regular
  if (!cover) {
    for (const sec of order) {
      const items = manifest.sections[sec];
      if (!items) continue;
      const reg = items.find((f) => f.kind === 'regular');
      if (reg) { cover = pick(reg.variants, '-1200') || pick(reg.variants, ''); break; }
    }
  }
  const src1200 = projectAssetUrl(project.id, cover.name);
  const src600 = projectAssetUrl(project.id, cover.name.replace(/-1200\.webp$/, '-600.webp'));

  return `
        <a href="/project/${project.slug}.html" class="gallery-card group" data-type="${project.type}">
          <div class="overflow-hidden mb-4 aspect-[4/3]">
            <img src="${src1200}" srcset="${src600} 600w, ${src1200} 1200w" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" alt="${project.title}" loading="lazy" decoding="async" class="w-full h-full object-cover">
          </div>
          <p class="font-kr font-bold text-base sm:text-lg mb-1">${project.title}</p>
          <p class="font-kr text-ink-2 text-sm mb-2">${project.subtitle}</p>
          <p class="font-en text-ink-3 text-xs">${project.pricePerPy}</p>
        </a>`;
}

// 포트폴리오 목록 상단 hero 배너 — 판교원9단지 한림풀에버 '포트폴리오 상단이미지' 전용 와이드 컷.
// (예전엔 첫 프로젝트의 거실 after-hero 를 재사용) 원본은 .gitignore 대상이라
// scripts/build-portfolio-hero.mjs 가 생성한 고정 산출물을 참조한다.
const PORTFOLIO_HERO_SRC = '/images/portfolio-hero.webp';

function buildPortfolioIndex(projectsWithManifests) {
  const heroSrc = PORTFOLIO_HERO_SRC;

  const cards = projectsWithManifests.map(({ project, manifest }) => projectCard(project, manifest)).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>포트폴리오 | Enliven Space</title>
  <meta name="description" content="인라이븐스페이스의 시공 포트폴리오를 만나보세요." />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
${TW_CONFIG}
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon-180.png" />
  <link rel="manifest" href="/images/site.webmanifest" />
  <meta name="theme-color" content="#ffffff" />
  <style>
    .gallery-card img { transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    .gallery-card:hover img { transform: scale(1.03); }
    .filter-btn.active { color: #171717; border-bottom: 2px solid #171717; }
    .filter-btn { color: #a3a3a3; border-bottom: 2px solid transparent; padding-bottom: 6px; transition: all 0.2s ease; }
    .filter-btn:hover { color: #171717; }
    .portfolio-hero { position: relative; overflow: hidden; }
    .portfolio-hero img { width: 100%; height: 100%; object-fit: cover; }
  </style>
</head>
<body>
${HEADER}
  <main class="site-main">
    <section class="relative">
      <div class="portfolio-hero aspect-[16/7] sm:aspect-[1920/700]">
        ${heroSrc ? `<img src="${heroSrc}" alt="포트폴리오" loading="eager" fetchpriority="high">` : ''}
      </div>
      <div class="absolute inset-0 z-10 flex items-end pointer-events-none">
        <div class="px-5 sm:px-10 pb-10 sm:pb-16 w-full max-w-[1440px] mx-auto">
          <h1 class="font-kr font-black text-white text-4xl sm:text-6xl tracking-tight mb-2">포트폴리오</h1>
          <p class="font-kr text-white text-sm sm:text-base">인라이븐스페이스가 바꾼 공간을 만나보세요.</p>
        </div>
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none"></div>
    </section>

    <section class="px-5 sm:px-10 pt-12 sm:pt-16">
      <div class="max-w-[1440px] mx-auto border-b border-black/10 pb-2">
        <div class="flex items-end justify-between flex-wrap gap-4">
          <div class="flex gap-5 sm:gap-8 font-kr">
            <button class="filter-btn active text-sm sm:text-base font-bold" data-filter="all">전체</button>
            <button class="filter-btn text-sm sm:text-base font-bold" data-filter="apartment">아파트</button>
            <button class="filter-btn text-sm sm:text-base font-bold" data-filter="house">주택</button>
            <button class="filter-btn text-sm sm:text-base font-bold" data-filter="commercial">상업공간</button>
          </div>
          <p class="font-en text-ink-3 text-sm"><span id="project-count">${projectsWithManifests.length}</span> Projects</p>
        </div>
      </div>
    </section>

    <section class="px-5 sm:px-10 pt-10 sm:pt-12 pb-16">
      <div id="gallery-grid" class="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12 sm:gap-y-16">${cards}
      </div>
    </section>
  </main>
${FOOTER}
  <script src="/js/main.js"></script>
  <script>
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.gallery-card');
    const countEl = document.getElementById('project-count');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        let visible = 0;
        cards.forEach(card => {
          if (filter === 'all' || card.dataset.type === filter) { card.style.display = ''; visible++; }
          else card.style.display = 'none';
        });
        countEl.textContent = visible;
      });
    });
  </script>
</body>
</html>
`;
}

// =========================
// MAIN
// =========================
async function main() {
  const projectsWithManifests = [];
  for (const project of PROJECTS) {
    const manifest = await readManifest(project.id);
    projectsWithManifests.push({ project, manifest });
  }

  // Detail pages
  for (const { project, manifest } of projectsWithManifests) {
    const out = path.join(ROOT, 'project', `${project.slug}.html`);
    await fs.writeFile(out, buildDetailHTML(project, manifest));
    console.log(`✓ wrote ${out}`);
  }

  // Portfolio listing
  const listOut = path.join(ROOT, 'project', 'index.html');
  await fs.writeFile(listOut, buildPortfolioIndex(projectsWithManifests));
  console.log(`✓ wrote ${listOut}`);

  // Generate JSON snippet for homepage assets
  const heroSlides = projectsWithManifests
    .map(({ project, manifest }) => {
      const sec = Object.keys(project.sectionLabels).find((s) => {
        const items = manifest.sections[s];
        return items && getHeroPair(items)?.after;
      });
      if (!sec) return null;
      const pair = getHeroPair(manifest.sections[sec]);
      const main = pick(pair.after.variants, '');
      const mid = pick(pair.after.variants, '-1200');
      return {
        href: `/project/${project.slug}.html`,
        title: project.title,
        main: projectAssetUrl(project.id, main.name),
        mid: projectAssetUrl(project.id, mid.name),
      };
    })
    .filter(Boolean);

  const portfolioCovers = projectsWithManifests.map(({ project, manifest }) => {
    // 1) 'card-cover' 섹션 override → 2) living 의 after-hero → 3) 첫 regular
    let cover;
    const cardOverride = manifest.sections['card-cover'];
    if (cardOverride && cardOverride.length > 0) {
      cover = pick(cardOverride[0].variants, '-1200');
    }
    if (!cover) {
      const sec = Object.keys(project.sectionLabels).find((s) => {
        const items = manifest.sections[s];
        return items && getHeroPair(items)?.after;
      });
      if (sec) {
        cover = pick(getHeroPair(manifest.sections[sec]).after.variants, '-1200');
      }
    }
    if (!cover) {
      for (const s of Object.keys(project.sectionLabels)) {
        const items = manifest.sections[s];
        if (!items) continue;
        const reg = items.find((f) => f.kind === 'regular');
        if (reg) { cover = pick(reg.variants, '-1200'); break; }
      }
    }
    return {
      slug: project.slug,
      title: project.title,
      subtitle: project.subtitle,
      pricePerPy: project.pricePerPy,
      type: project.type,
      cover: projectAssetUrl(project.id, cover.name),
      cover600: projectAssetUrl(project.id, cover.name.replace(/-1200\.webp$/, '-600.webp')),
    };
  });

  await fs.writeFile(
    path.join(ROOT, 'images/projects/_assets.json'),
    JSON.stringify({ heroSlides, portfolioCovers }, null, 2),
  );
  console.log(`✓ wrote images/projects/_assets.json (hero=${heroSlides.length} slides, ${portfolioCovers.length} covers)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
