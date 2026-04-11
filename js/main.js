/* ============================================
   Enlive Space - Main JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Hero Slider ----
  const slider = document.getElementById('hero-slider');
  const currentEl = document.getElementById('slide-current');
  const progressEl = document.getElementById('slide-progress');
  const totalSlides = slider ? slider.children.length : 0;
  let currentSlide = 0;
  let autoSlideTimer = null;

  function goToSlide(index) {
    if (!slider) return;
    currentSlide = index;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    if (currentEl) currentEl.textContent = currentSlide + 1;
    if (progressEl) progressEl.style.transform = `scaleX(${(currentSlide + 1) / totalSlides})`;
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % totalSlides);
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  if (totalSlides > 1) {
    startAutoSlide();

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoSlide();
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToSlide(Math.min(currentSlide + 1, totalSlides - 1));
        } else {
          goToSlide(Math.max(currentSlide - 1, 0));
        }
      }
      startAutoSlide();
    }, { passive: true });
  }


  // ---- Fixed GNB on scroll ----
  const gnbFixed = document.getElementById('gnb-fixed');
  const heroSection = document.getElementById('hero');
  let lastScrollY = 0;
  let gnbVisible = false;

  function handleScroll() {
    const scrollY = window.scrollY;
    const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;

    if (scrollY > heroHeight) {
      if (!gnbVisible) {
        gnbFixed.style.transform = 'translateY(0)';
        gnbVisible = true;
      }
    } else {
      if (gnbVisible) {
        gnbFixed.style.transform = 'translateY(-100%)';
        gnbVisible = false;
      }
    }

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });


  // ---- Scroll to top ----
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ---- Mobile menu ----
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.add('flex');
      document.body.style.overflow = 'hidden';
    });

    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('flex');
      document.body.style.overflow = '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        document.body.style.overflow = '';
      });
    });
  }

});
