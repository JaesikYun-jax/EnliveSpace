#!/usr/bin/env node
// Generates project detail pages, portfolio listing, and homepage assets
// from /images/projects/proj-XX/manifest.json + scripts/projects-data.mjs.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROJECTS } from './projects-data.mjs';

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
              <a href="http://pf.kakao.com/_eSTPG" target="_blank" rel="noopener noreferrer" aria-label="카카오톡 채널"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.88 5.36 4.7 6.78l-.95 3.48c-.08.3.25.55.5.38l4.18-2.78c.51.05 1.04.08 1.57.08 5.52 0 10-3.58 10-8S17.52 3 12 3z"/></svg></a>
              <a href="https://www.instagram.com/enlivenspace_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg></a>
              <a href="https://blog.naver.com/enlivenspace" target="_blank" rel="noopener noreferrer" aria-label="네이버 블로그"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><defs><mask id="naverBlogMask"><rect width="24" height="24" fill="white"/><text x="12" y="13.2" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="7" text-anchor="middle" letter-spacing="-0.3" fill="black">Blog</text></mask></defs><path d="M3 3h18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6l-2.3 3a1 1 0 0 1-1.6 0L8.8 18H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" mask="url(#naverBlogMask)"/></svg></a>
            </div>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">고객센터</h4>
            <ul class="footer-col-list">
              <li class="footer-contact-line"><span class="label">전화번호</span><a href="tel:050-6662-8126">050-6662-8126</a></li>
              <li class="footer-contact-line"><span class="label">영업시간</span>평일 09:00 ~ 18:00 (공휴일 제외)</li>
              <li class="footer-contact-line"><span class="label">Email</span><a href="mailto:enlivenspace@naver.com">enlivenspace@naver.com</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-legal"><a href="#">이용약관</a><span class="divider">|</span><a href="#">개인정보처리방침</a></div>
        <div class="footer-info">
          <div class="info-line">
            <span>상호명: 인라이븐 스페이스</span><span class="sep">|</span>
            <span>사업자 등록번호: 524-05-03153</span><span class="sep">|</span>
            <span>주소: 경기도 수원시 영통구 대학로 16</span><span class="sep">|</span>
            <span>TEL: 050-6662-8126</span><span class="sep">|</span>
            <span>Email: <a href="mailto:enlivenspace@naver.com">enlivenspace@naver.com</a></span>
          </div>
          <p class="copyright">Copyright © 2026 ENLIVEN SPACE All Rights Reserved</p>
        </div>
      </div>
    </div>
  </footer>
  <div class="floating-actions">
    <a class="float-btn float-btn--consult" href="https://tally.so/r/J9eROr" data-action="consult" target="_blank" rel="noopener noreferrer" aria-label="상담 신청">상담<br/>신청</a>
    <a class="float-btn float-btn--kakao" href="#" data-url="#" data-action="kakao" target="_blank" rel="noopener noreferrer" aria-label="카카오 문의">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.88 5.36 4.7 6.78l-.95 3.48c-.08.3.25.55.5.38l4.18-2.78c.51.05 1.04.08 1.57.08 5.52 0 10-3.58 10-8S17.52 3 12 3z"/></svg>
    </a>
    <button id="scroll-top-btn" class="float-btn float-btn--top" type="button" aria-label="맨 위로">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 12V2M7 2L2 7M7 2L12 7"/></svg>
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
  const p = path.join(ROOT, 'images/projects', `proj-${id}`, 'manifest.json');
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

function projectAssetUrl(projId, name) {
  return `/images/projects/proj-${projId}/${name}`;
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

function renderGalleryCards(project, manifest) {
  const labels = project.sectionLabels;
  const cards = [];
  const order = Object.keys(labels).filter((k) => manifest.sections[k]?.length);

  for (const section of order) {
    const items = manifest.sections[section];
    const pair = getHeroPair(items);

    // Hero card: before/after toggle (shown only if both exist)
    if (pair?.before && pair?.after) {
      const afterMain = pick(pair.after.variants, '');
      const afterMid = pick(pair.after.variants, '-1200');
      const beforeMain = pick(pair.before.variants, '');
      const beforeMid = pick(pair.before.variants, '-1200');
      cards.push(`
          <div class="gallery-item col-span-2 sm:col-span-2 sm:row-span-2 relative ba-card cursor-zoom-in aspect-[4/3] sm:aspect-[3/2]" data-room="${section}" data-lightbox-src="${projectAssetUrl(project.id, afterMain.name)}">
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
    } else if (pair?.after) {
      // Only after, no before — show as a single card with section label
      const main = pick(pair.after.variants, '');
      const mid = pick(pair.after.variants, '-1200');
      const thumb = pick(pair.after.variants, '-600');
      cards.push(`
          <div class="gallery-item relative cursor-zoom-in" data-room="${section}" data-lightbox-src="${projectAssetUrl(project.id, main.name)}">
            <img class="w-full h-full object-cover aspect-[3/4]"
                 src="${projectAssetUrl(project.id, thumb.name)}"
                 srcset="${projectAssetUrl(project.id, thumb.name)} 600w, ${projectAssetUrl(project.id, mid.name)} 1200w"
                 sizes="(min-width: 640px) 33vw, 50vw"
                 alt="${project.title} ${labels[section]}"
                 loading="lazy" decoding="async">
            <span class="absolute top-3 right-3 px-3 py-1.5 bg-black/55 text-white text-xs font-bold rounded-full backdrop-blur">${labels[section]}</span>
          </div>`);
    }

    // Regular items
    const regulars = items.filter((f) => f.kind === 'regular');
    for (const item of regulars) {
      const main = pick(item.variants, '');
      const mid = pick(item.variants, '-1200');
      const thumb = pick(item.variants, '-600');
      const aspect = main.vertical ? 'aspect-[3/4]' : 'aspect-[4/3]';
      cards.push(`
          <div class="gallery-item relative cursor-zoom-in" data-room="${section}" data-lightbox-src="${projectAssetUrl(project.id, main.name)}">
            <img class="w-full h-full object-cover ${aspect}"
                 src="${projectAssetUrl(project.id, thumb.name)}"
                 srcset="${projectAssetUrl(project.id, thumb.name)} 600w, ${projectAssetUrl(project.id, mid.name)} 1200w"
                 sizes="(min-width: 640px) 33vw, 50vw"
                 alt="${project.title} ${labels[section]}"
                 loading="lazy" decoding="async">
          </div>`);
    }
  }
  return cards.join('');
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
  <link rel="icon" href="/images/favicon.png" />
  <style>
    .room-tab { padding: 8px 18px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.15); font-family: 'NanumSquare', sans-serif; font-size: 13px; font-weight: 700; color: #525252; background: #fff; transition: all 0.2s ease; white-space: nowrap; }
    .room-tab.active { background: #171717; color: #fff; border-color: #171717; }
    .room-tab:hover { border-color: #171717; }
    .ba-toggle { display: inline-flex; background: rgba(255,255,255,0.9); border-radius: 999px; padding: 3px; backdrop-filter: blur(4px); z-index: 5; }
    .ba-toggle button { padding: 4px 14px; font-size: 11px; font-weight: 700; font-family: 'GmarketSansBold', sans-serif; letter-spacing: 0.05em; border-radius: 999px; color: #525252; transition: all 0.2s ease; }
    .ba-toggle button.active { background: #171717; color: #fff; }
    .share-pop { position: absolute; top: 100%; right: 0; margin-top: 8px; background: #171717; color: #fff; border-radius: 12px; padding: 12px; display: none; gap: 12px; align-items: center; box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 30; }
    .share-pop.is-open { display: flex; }
    .share-pop button { width: 38px; height: 38px; border-radius: 999px; background: #fff; color: #171717; display: inline-flex; align-items: center; justify-content: center; transition: opacity 0.2s ease; }
    .share-pop button:hover { opacity: 0.85; }
    .share-pop .share-close { background: transparent; color: #fff; width: 28px; height: 28px; }
    .lightbox { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,0.92); display: none; align-items: center; justify-content: center; padding: 24px; }
    .lightbox.is-open { display: flex; }
    .lightbox-close { position: absolute; top: 20px; right: 20px; color: #fff; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; }
    .lightbox-img { max-width: 100%; max-height: 90vh; object-fit: contain; }
    .gallery-item { overflow: hidden; }
    .gallery-item img { transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    .gallery-item:hover img { transform: scale(1.03); }
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
          <div class="relative">
            <button id="share-trigger" class="inline-flex items-center gap-2 border border-black/15 px-4 py-2 rounded-full text-sm font-kr font-bold hover:bg-ink hover:text-white hover:border-ink transition-colors" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>
              공유하기
            </button>
            <div id="share-popup" class="share-pop">
              <button data-share="facebook" type="button" aria-label="페이스북 공유"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 21h3v-7H15l.5-3H12.5V9c0-.83.5-1.5 1.5-1.5h1.5V5h-2c-2.5 0-3 1.5-3 3v3H8v3h2.5v7z"/></svg></button>
              <button data-share="kakao" type="button" aria-label="카카오 공유"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.88 5.36 4.7 6.78l-.95 3.48c-.08.3.25.55.5.38l4.18-2.78c.51.05 1.04.08 1.57.08 5.52 0 10-3.58 10-8S17.52 3 12 3z"/></svg></button>
              <button data-share="url" type="button" aria-label="URL 복사"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 17H7a5 5 0 010-10h2"/><path d="M15 7h2a5 5 0 010 10h-2"/><path d="M8 12h8"/></svg></button>
              <button class="share-close" id="share-close" type="button" aria-label="닫기"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>
            </div>
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
        <div id="gallery" class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">${renderGalleryCards(project, manifest)}
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
              <div class="col-span-2"><dt class="text-ink-3 text-xs mb-1">디자인비 / 평당 견적</dt><dd class="font-bold">${project.pricePerPy}</dd></div>
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
          더 많은 공감모음 보러가기
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

    // Room tabs filter (PDF round-2: '전체' 없음 → 첫 active 탭으로 초기 필터링)
    function applyRoom(room) {
      document.querySelectorAll('.gallery-item').forEach(item => {
        item.style.display = (item.dataset.room === room) ? '' : 'none';
      });
    }
    document.querySelectorAll('.room-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        applyRoom(tab.dataset.room);
      });
    });
    const initRoom = document.querySelector('.room-tab.active');
    if (initRoom) applyRoom(initRoom.dataset.room);

    // Share popup
    const shareTrigger = document.getElementById('share-trigger');
    const sharePopup = document.getElementById('share-popup');
    const shareClose = document.getElementById('share-close');
    shareTrigger?.addEventListener('click', (e) => { e.stopPropagation(); sharePopup.classList.toggle('is-open'); });
    shareClose?.addEventListener('click', () => sharePopup.classList.remove('is-open'));
    document.addEventListener('click', (e) => {
      if (!sharePopup.contains(e.target) && e.target !== shareTrigger) sharePopup.classList.remove('is-open');
    });
    sharePopup.querySelectorAll('button[data-share]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.share;
        const url = location.href;
        if (type === 'url') navigator.clipboard.writeText(url).then(() => alert('링크가 복사되었습니다.')).catch(() => alert(url));
        else if (type === 'facebook') window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
        else if (type === 'kakao') { alert('카카오톡 공유 SDK 키를 연결해주세요. 임시로 URL을 복사합니다.'); navigator.clipboard.writeText(url).catch(() => {}); }
      });
    });

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
  // Pick the project's main "after" hero (living section preferred)
  const order = Object.keys(project.sectionLabels);
  let cover;
  for (const sec of order) {
    const items = manifest.sections[sec];
    if (!items) continue;
    const p = getHeroPair(items);
    if (p?.after) {
      cover = pick(p.after.variants, '-1200') || pick(p.after.variants, '');
      break;
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

function buildPortfolioIndex(projectsWithManifests) {
  // Hero cover for portfolio page — first project's main after
  const heroProject = projectsWithManifests[0];
  let heroCover;
  for (const sec of Object.keys(heroProject.project.sectionLabels)) {
    const items = heroProject.manifest.sections[sec];
    if (!items) continue;
    const p = getHeroPair(items);
    if (p?.after) { heroCover = pick(p.after.variants, ''); break; }
  }
  const heroSrc = heroCover ? projectAssetUrl(heroProject.project.id, heroCover.name) : '';

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
  <link rel="icon" href="/images/favicon.png" />
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
    const sec = Object.keys(project.sectionLabels).find((s) => {
      const items = manifest.sections[s];
      return items && getHeroPair(items)?.after;
    });
    let cover;
    if (sec) {
      cover = pick(getHeroPair(manifest.sections[sec]).after.variants, '-1200');
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
