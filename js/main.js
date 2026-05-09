/* ============================================
   Enlive Space - Main JS
   v1.0 (홈페이지 수정 v1.0_0423 반영)
   ============================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    // ---- Hero Slider (메인 페이지에만 존재) ----
    const slider = document.getElementById('hero-slider');
    if (slider) {
      const currentEl = document.getElementById('slide-current');
      const progressEl = document.getElementById('slide-progress');
      const totalSlides = slider.children.length;
      let currentSlide = 0;
      let autoTimer = null;

      const goTo = (i) => {
        currentSlide = (i + totalSlides) % totalSlides;
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        if (currentEl) currentEl.textContent = String(currentSlide + 1).padStart(2, '0');
        if (progressEl) progressEl.style.transform = `scaleX(${(currentSlide + 1) / totalSlides})`;
      };
      const next = () => goTo(currentSlide + 1);
      const start = () => { stop(); autoTimer = setInterval(next, 5000); };
      const stop = () => { if (autoTimer) clearInterval(autoTimer); };

      if (totalSlides > 1) {
        start();
        let touchStartX = 0;
        slider.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
          stop();
        }, { passive: true });
        slider.addEventListener('touchend', (e) => {
          const dx = touchStartX - e.changedTouches[0].screenX;
          if (Math.abs(dx) > 50) goTo(currentSlide + (dx > 0 ? 1 : -1));
          start();
        }, { passive: true });
      }
    }

    // ---- Mobile menu ----
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuClose = document.getElementById('menu-close');

    const openMenu = () => {
      if (!mobileMenu) return;
      mobileMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    menuToggle?.addEventListener('click', openMenu);
    menuClose?.addEventListener('click', closeMenu);
    mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // ---- Scroll to top ----
    const topBtn = document.getElementById('scroll-top-btn');
    topBtn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- Floating buttons (toast for placeholder links) ----
    document.querySelectorAll('[data-action="consult"]').forEach(el => {
      el.addEventListener('click', (e) => {
        const url = el.getAttribute('data-url');
        if (!url || url === '#') {
          e.preventDefault();
          alert('상담신청 폼(Tally) URL을 연결해주세요.');
        }
      });
    });
    document.querySelectorAll('[data-action="kakao"]').forEach(el => {
      el.addEventListener('click', (e) => {
        const url = el.getAttribute('data-url');
        if (!url || url === '#') {
          e.preventDefault();
          alert('카카오톡 채널 URL을 연결해주세요.');
        }
      });
    });

    // ---- Reviews Carousel (메인 페이지) ----
    const reviewsTrack = document.getElementById('reviews-track');
    if (reviewsTrack) {
      const cards = reviewsTrack.querySelectorAll('.reviews-card');
      const prevBtn = document.getElementById('reviews-prev');
      const nextBtn = document.getElementById('reviews-next');
      const progressEl = document.getElementById('reviews-progress');
      const currentEl = document.getElementById('reviews-current');
      const totalEl = document.getElementById('reviews-total');

      let curPage = 0;
      let totalPages = 0;
      let revTimer = null;
      const AUTO_MS = 5000;

      const perView = () => window.matchMedia('(min-width: 640px)').matches ? 3 : 1;

      const apply = () => {
        reviewsTrack.style.transform = `translateX(-${curPage * 100}%)`;
        if (currentEl) currentEl.textContent = String(curPage + 1).padStart(2, '0');
        if (progressEl) progressEl.style.width = `${((curPage + 1) / totalPages) * 100}%`;
      };

      const recalc = () => {
        totalPages = Math.max(1, Math.ceil(cards.length / perView()));
        if (totalEl) totalEl.textContent = String(totalPages).padStart(2, '0');
        if (curPage >= totalPages) curPage = 0;
        apply();
      };

      const goTo = (p) => {
        curPage = ((p % totalPages) + totalPages) % totalPages;
        apply();
      };

      const startAuto = () => {
        stopAuto();
        if (totalPages > 1) revTimer = setInterval(() => goTo(curPage + 1), AUTO_MS);
      };
      const stopAuto = () => { if (revTimer) clearInterval(revTimer); };

      prevBtn?.addEventListener('click', () => { goTo(curPage - 1); startAuto(); });
      nextBtn?.addEventListener('click', () => { goTo(curPage + 1); startAuto(); });

      // Pause on hover (desktop)
      reviewsTrack.parentElement.addEventListener('mouseenter', stopAuto);
      reviewsTrack.parentElement.addEventListener('mouseleave', startAuto);

      // Touch swipe
      let revStartX = 0;
      reviewsTrack.addEventListener('touchstart', (e) => {
        revStartX = e.changedTouches[0].screenX;
        stopAuto();
      }, { passive: true });
      reviewsTrack.addEventListener('touchend', (e) => {
        const dx = revStartX - e.changedTouches[0].screenX;
        if (Math.abs(dx) > 50) goTo(curPage + (dx > 0 ? 1 : -1));
        startAuto();
      }, { passive: true });

      // Resize handling
      let resizeT;
      window.addEventListener('resize', () => {
        clearTimeout(resizeT);
        resizeT = setTimeout(recalc, 150);
      });

      recalc();
      startAuto();
    }

    // ---- Reveal on scroll ----
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('visible');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(el => io.observe(el));
    }

    // ---- Active nav link highlight ----
    const path = location.pathname.replace(/\/index\.html$/, '/');
    document.querySelectorAll('.site-nav a, .mobile-menu a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      const norm = href.replace(/\/index\.html$/, '/');
      if (norm === path || (norm !== '/' && path.startsWith(norm))) {
        a.classList.add('active');
      }
    });

  });
})();
