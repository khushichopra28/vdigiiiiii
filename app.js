/* ============================================
   VDIGI — V3 STUDIOS | PREMIUM INTERACTIONS
   ============================================ */

(function () {
  'use strict';

  // ─── GSAP SETUP ───────────────────────────────────────────────────────────
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create('cinematic', 'M0,0 C0.16,1 0.3,1 1,1');
  CustomEase.create('reveal', 'M0,0 C0.05,0 0.133,0.142 0.166,0.25 0.208,0.39 0.25,0.65 0.3,0.8 0.4,1 0.5,1 1,1');

  const isMobile = () => window.innerWidth <= 768;

  // ─── LENIS SMOOTH SCROLL ──────────────────────────────────────────────────
  let lenis;
  function initLenis() {
    if (isMobile()) return;
    lenis = new window.Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
  }

  // ─── CUSTOM CURSOR ────────────────────────────────────────────────────────
  function initCursor() {
    if (isMobile()) return;
    const cursor = document.getElementById('cursor');
    const label = document.getElementById('cursorLabel');
    let mouseX = 0, mouseY = 0;
    let outerX = 0, outerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(cursor.querySelector('.cursor-inner'), { x: mouseX, y: mouseY });
    });

    function animateOuter() {
      outerX += (mouseX - outerX) * 0.12;
      outerY += (mouseY - outerY) * 0.12;
      gsap.set(cursor.querySelector('.cursor-outer'), { x: outerX, y: outerY });
      gsap.set(label, { x: outerX, y: outerY });
      requestAnimationFrame(animateOuter);
    }
    animateOuter();

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        label.textContent = el.dataset.cursor;
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        label.textContent = '';
      });
    });

    document.addEventListener('mouseleave', () => gsap.to(cursor, { opacity: 0, duration: 0.3 }));
    document.addEventListener('mouseenter', () => gsap.to(cursor, { opacity: 1, duration: 0.3 }));
  }

  // ─── INTRO LOADER ─────────────────────────────────────────────────────────
  function initIntro() {
    document.body.classList.add('loading');
    const loader = document.getElementById('introLoader');
    const canvas = document.getElementById('introLines');

    // On mobile: don't animate the full-screen canvas intro. Show main landing immediately.
    // This avoids blocking first paint on slow devices and ensures the hero loads right after intro.
    if (isMobile()) {
      if (loader) {
        // Start closing immediately
        gsap.set(loader, { opacity: 1, display: 'flex' });
        gsap.to(loader, {
          opacity: 0,
          duration: 0.15,
          ease: 'power2.out',
          onComplete: () => {
            if (!loader) return;
            loader.style.display = 'none';
          },
        });
      }

      // Immediately reveal the main landing content for mobile
      document.body.classList.remove('loading');
      initMainAnimations();

      // Stop any canvas work immediately
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw animated tracking lines
    const lines = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: 60 + Math.random() * 120,
      angle: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1,
      opacity: 0,
      maxOpacity: 0.15 + Math.random() * 0.2,
    }));

    let lineAnim = true;
    function drawLines() {
      if (!lineAnim) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lines.forEach((l) => {
        l.opacity = Math.min(l.maxOpacity, l.opacity + 0.01);
        l.x += Math.cos(l.angle) * l.speed;
        l.y += Math.sin(l.angle) * l.speed;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x + Math.cos(l.angle) * l.len, l.y + Math.sin(l.angle) * l.len);
        ctx.strokeStyle = `rgba(139,0,0,${l.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
      requestAnimationFrame(drawLines);
    }
    drawLines();

    const tl = gsap.timeline({
      onComplete: () => {
        lineAnim = false;
        document.body.classList.remove('loading');
        initMainAnimations();
      },
    });

    tl.to('#introLogo', { opacity: 1, y: 0, duration: 0.8, ease: 'cinematic' }, 0.6)
      .to('#introDivider', { opacity: 1, scaleY: 1, duration: 0.5, ease: 'cinematic' }, 1.2)
      .to('#introV3', { opacity: 1, y: 0, duration: 0.7, ease: 'cinematic' }, 1.4)
      .to('#introTagline', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.9)
      .to('#introReveal', { height: '100%', duration: 0.9, ease: 'power4.inOut' }, 2.8)
      .to(loader, { opacity: 0, duration: 0.3 }, 3.6)
      .set(loader, { display: 'none' });
  }

  // ─── HERO PARTICLES ───────────────────────────────────────────────────────
  function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    const particleCount = 140;
    for (let i = 0; i < particleCount; i++) {
      const size = 1.8 + Math.random() * 4.2;
      const p = document.createElement('div');
      p.className = 'hero-particle';
      p.style.cssText = `
        position:absolute;
        width:${size}px;
        height:${size}px;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        opacity:0.85;
        pointer-events:none;
        background: rgba(139, 0, 0, 0.95);
      `;
      container.appendChild(p);
      const travelY = -240 - Math.random() * 140;
      gsap.to(p, {
        y: travelY,
        x: (Math.random() - 0.5) * 34,
        duration: 5 + Math.random() * 5,
        repeat: -1,
        delay: Math.random() * 2,
        ease: 'power1.out',
        onRepeat: () => {
          p.style.left = `${Math.random() * 100}%`;
          p.style.top = `${102 + Math.random() * 18}%`;
        },
      });
    }
  }

  // ─── HERO MOUSE PARALLAX ──────────────────────────────────────────────────
  function initHeroParallax() {
    if (isMobile()) return;
    const hero = document.querySelector('.hero');
    const lines = document.querySelectorAll('.hero-line');
    const orb1 = document.querySelector('.hero-orb-1');
    const orb2 = document.querySelector('.hero-orb-2');

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;

      lines.forEach((line) => {
        const depth = parseFloat(line.dataset.depth || 0.02);
        gsap.to(line, {
          x: cx * depth * 80,
          y: cy * depth * 40,
          duration: 1.2,
          ease: 'power2.out',
        });
      });

      gsap.to(orb1, { x: cx * 40, y: cy * 20, duration: 2, ease: 'power2.out' });
      gsap.to(orb2, { x: cx * -30, y: cy * -15, duration: 2, ease: 'power2.out' });
    });
  }

  // ─── MAGNETIC BUTTONS ─────────────────────────────────────────────────────
  function initMagnetic() {
    if (isMobile()) return;
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: cx * 0.3, y: cy * 0.3, duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--x', x + '%');
        el.style.setProperty('--y', y + '%');
      });
    });
  }

  const reelVideos = [
    { src: 'Final Giftara Bhavya Reel_1.mp4' },
    { src: 'Bombaysthan Reel-.mp4' },
    { src: 'bombaysthan new.mp4' },
    { src: 'RCB poojaReel.mp4' },
    { src: 'pearl banquet hall x influencer.mp4' },
    { src: 'mint vault new reel - 1.mp4' },
    { src: 'IMG_7765.mp4' },
    { src: 'IMG_3534.mp4' },
  ];

  function getVideoMimeType(src) {
    const extension = src.split('.').pop().toLowerCase();
    if (extension === 'mp4') return 'video/mp4';
    if (extension === 'mov') return 'video/quicktime';
    return 'video/mp4';
  }

  function pauseMarqueeVideos() {
    document.querySelectorAll('.reel-video').forEach((video) => {
      if (!video.paused) {
        video.pause();
      }
    });
  }

  function playMarqueeVideos() {
    document.querySelectorAll('.reel-video').forEach((video) => {
      video.play().catch(() => {
        // autoplay may be blocked; allow user interaction.
      });
    });
  }

  function closeReelModal() {
    const modal = document.getElementById('reelModal');
    const video = document.getElementById('reelModalVideo');
    if (!modal || !video) return;
    video.pause();
    video.innerHTML = '';
    video.load();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    playMarqueeVideos();
  }

  function initReelModal() {
    const modal = document.getElementById('reelModal');
    const modalVideo = document.getElementById('reelModalVideo');
    const modalTitle = document.getElementById('reelModalTitle');
    const closeButton = document.getElementById('reelModalClose');
    if (!modal || !modalVideo || !modalTitle || !closeButton) return;

    closeButton.addEventListener('click', closeReelModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeReelModal();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('open')) {
        closeReelModal();
      }
    });
  }

  function initReelCards() {
    const marquee = document.getElementById('reelsMarquee');
    if (!marquee) return;
    marquee.innerHTML = '';

    const items = [...reelVideos, ...reelVideos];
    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'reel-card';
      card.dataset.cursor = 'WATCH';
      card.dataset.src = item.src;
      card.dataset.label = '';

      const container = document.createElement('div');
      container.className = 'reel-video-container';

      const video = document.createElement('video');
      video.className = 'reel-video';
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';

      const source = document.createElement('source');
      source.src = encodeURI(item.src);
      source.type = getVideoMimeType(item.src);
      video.appendChild(source);

      const overlay = document.createElement('div');
      overlay.className = 'reel-card-overlay';

      const brandTag = document.createElement('div');
      brandTag.className = 'reel-brand-tag';
      brandTag.textContent = '';

      const playIndicator = document.createElement('div');
      playIndicator.className = 'reel-play-indicator';
      playIndicator.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';

      container.appendChild(video);
      container.appendChild(overlay);
      container.appendChild(brandTag);
      container.appendChild(playIndicator);
      card.appendChild(container);
      marquee.appendChild(card);

      card.addEventListener('click', () => {
        const modal = document.getElementById('reelModal');
        const modalVideo = document.getElementById('reelModalVideo');
        const modalTitle = document.getElementById('reelModalTitle');
        if (!modal || !modalVideo || !modalTitle) return;
        pauseMarqueeVideos();
        modalTitle.textContent = '';
        modalVideo.innerHTML = '';
        const source = document.createElement('source');
        source.src = encodeURI(item.src);
        source.type = getVideoMimeType(item.src);
        modalVideo.appendChild(source);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        modalVideo.load();
        modalVideo.play().catch(() => {
          // if autoplay is blocked, user can click play manually.
        });
      });
    });
  }

  /* ============================================
     COLLECTION GRID (curated + PNG-based)
     ============================================ */
  function prettyNameFromFile(fileName) {
    // Intentionally returns blank so poster/reel names are not shown.
    return '';
  }

  function getCollectionImagesCurated() {
    // Curated selection (clean titles + good variety). Edit list anytime.
    const curatedFiles = [
      'BOARD MEETING.png',
      'GIFTARA - IPL.png',
      'JAIN - LABOUR DAY.png',
      'KALYANI DOOR LOCK 2.png',
      'MAHITHA - TRAY SET.png',
      'MOTHER\'S DAY - BOMBAYSTHAN.png',
      'MOTHER\'S DAY - LEGAL.png',
      'MOTHER\'S DAY - kiara.png',
      'NASREEN COSMO - NAIL ART.png',
      'NASREEN CROCHETC- 2.png',
      'RAINBOW AUTOS 3.png',
      'RECORD.png',
      'RFL - GIRNAR.png',
      'SAI SASHTI.png',
      'SUI MAGEC - 1.png',
      'SUI MAGEC - 2.png',
      'SUI MAGEC - 3.png',
      'SVJ poster .png'
    ];

    // Map to relative src paths that work when opening index.html directly.
    return curatedFiles.map((file) => {
      const src = `collection/${file}`;
      return {
        src,
        title: '',
        caption: ''
      };
    });
  }

  function initCollectionGrid(items) {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const data = Array.isArray(items) ? items : [];

    // Render only a professional subset.
    data.slice(0, 18).forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'portfolio-card';

      const img = document.createElement('img');
      const src = typeof entry === 'string' ? entry : (entry.src || '');
      img.src = encodeURI(src);
      img.alt = '';
      img.loading = 'lazy';

      const body = document.createElement('div');
      body.className = 'card-body';

      const title = document.createElement('h4');
      title.textContent = '';

      const caption = document.createElement('p');
      caption.textContent = entry.caption || '';

      body.appendChild(title);
      body.appendChild(caption);

      card.appendChild(img);
      card.appendChild(body);
      grid.appendChild(card);

      card.addEventListener('click', () => openImageModal(src, img.alt));
    });
  }


  function openImageModal(src, caption) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('imageModalImg');
    const modalCaption = document.getElementById('imageModalCaption');
    if (!modal || !modalImg) return;
    modalImg.src = encodeURI(src);
    modalImg.alt = caption || '';
    if (modalCaption) modalCaption.textContent = caption || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('imageModalImg');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (modalImg) { modalImg.src = ''; modalImg.alt = ''; }
  }

  function initImageModal() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.getElementById('imageModalClose');
    if (!modal) return;
    if (closeBtn) closeBtn.addEventListener('click', closeImageModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeImageModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeImageModal(); });
  }

  function closeSignUpModal() {
    const modal = document.getElementById('signUpModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function initSignUpModal() {
    const modal = document.getElementById('signUpModal');
    const closeBtn = document.getElementById('signUpModalClose');
    const heroSignUpBtn = document.getElementById('heroSignUpBtn');
    if (!modal) return;

    if (heroSignUpBtn) {
      heroSignUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeSignUpModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeSignUpModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeSignUpModal(); });
  }

  function initHeroCycler() {
    const words = Array.from(document.querySelectorAll('#heroCycler .cycler-word'));
    if (words.length < 2) return;

    let currentIndex = 0;
    setInterval(() => {
      const current = words[currentIndex];
      const nextIndex = (currentIndex + 1) % words.length;
      const next = words[nextIndex];

      current.classList.remove('active');
      current.classList.add('exit-up');
      next.classList.remove('exit-up');
      next.classList.add('active');

      setTimeout(() => current.classList.remove('exit-up'), 700);
      currentIndex = nextIndex;
    }, 2000);
  }

  // ─── WAVEFORM ANIMATION ───────────────────────────────────────────────────
  function initWaveform() {
    const container = document.getElementById('v3Waveform');
    if (!container) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '120');
    svg.setAttribute('viewBox', '0 0 1440 120');
    svg.setAttribute('preserveAspectRatio', 'none');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(139,0,0,0.4)');
    path.setAttribute('stroke-width', '1');
    svg.appendChild(path);
    container.appendChild(svg);

    let t = 0;
    function animateWave() {
      t += 0.02;
      const points = [];
      for (let x = 0; x <= 1440; x += 8) {
        const y = 60 + Math.sin(x * 0.01 + t) * 20 + Math.sin(x * 0.02 + t * 1.3) * 10 + Math.sin(x * 0.005 + t * 0.7) * 30;
        points.push(`${x},${y}`);
      }
      path.setAttribute('d', 'M' + points.join(' L'));
      requestAnimationFrame(animateWave);
    }
    animateWave();
  }

  // ─── STATS GRID BACKGROUND ────────────────────────────────────────────────
  function initStatsGrid() {
    // CSS animation handles this
  }

  // ─── COUNTER ANIMATION ────────────────────────────────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    gsap.to({ val: 0 }, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: function () {
        el.textContent = Math.round(this.targets()[0].val);
      },
    });
  }

  // ─── NAVIGATION ───────────────────────────────────────────────────────────
  function initNav() {
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    let menuOpen = false;

    ScrollTrigger.create({
      start: 'top -80',
      onEnter: () => nav.classList.add('scrolled'),
      onLeaveBack: () => nav.classList.remove('scrolled'),
    });

    hamburger.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      const spans = hamburger.querySelectorAll('span');
      if (menuOpen) {
        gsap.to(spans[0], { rotation: 45, y: 7, duration: 0.3 });
        gsap.to(spans[1], { rotation: -45, y: -7, duration: 0.3 });
      } else {
        gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
        gsap.to(spans[1], { rotation: 0, y: 0, duration: 0.3 });
      }
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        const spans = hamburger.querySelectorAll('span');
        gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
        gsap.to(spans[1], { rotation: 0, y: 0, duration: 0.3 });
      });
    });
  }

  // ─── MAIN SCROLL ANIMATIONS ───────────────────────────────────────────────
  function initMainAnimations() {
    // ─── NAV + HERO: mobile uses simple fast animations, desktop uses cinematic
    if (isMobile()) {
      // On mobile: instant reveal with simple fade — no cinematic ease required
      gsap.set(['.nav-logo', '.nav-link', '.nav-cta'], { opacity: 1 });
      gsap.set('.hero-line', { y: '0%' });
      gsap.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.05 });
      gsap.to('.hero-sub', { opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.15 });
      gsap.to('.hero-cta-group', {
        opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.25,
        onComplete: () => { document.documentElement.classList.add('snap-enabled'); }
      });
    } else {
      // Desktop: full cinematic entrance
      gsap.to('.nav-logo', { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.1 });
      gsap.to('.nav-link', { opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.2 });
      gsap.to('.nav-cta', { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.5 });

      const heroTl = gsap.timeline({
        delay: 0.2,
        onComplete: () => {
          document.documentElement.classList.add('snap-enabled');
        }
      });
      heroTl
        .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'cinematic' })
        .to('.hero-cta-tagline', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6')
        .to('.hero-line', { y: '0%', duration: 1, stagger: 0.12, ease: 'cinematic' }, '-=0.4')
        .to('.hero-sub', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.3')
        .to('.hero-cta-group', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.4');
    }

    // About section
    ScrollTrigger.create({
      trigger: '.about-strip',
      start: 'top 75%',
      onEnter: () => {
        gsap.from('.about-heading', { y: 40, opacity: 0, duration: 1, ease: 'cinematic' });
        gsap.from('.about-desc', { y: 30, opacity: 0, duration: 1, ease: 'cinematic', delay: 0.2 });
        gsap.from('.stat-item', { y: 20, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'cinematic', delay: 0.4 });
      },
    });

    // Services cards
    ScrollTrigger.create({
      trigger: '.services-grid',
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.service-card', {
          y: 60, opacity: 0, duration: 0.9,
          stagger: 0.1, ease: 'cinematic',
        });
      },
    });

    // Brand Reels section
    ScrollTrigger.create({
      trigger: '.brand-reels',
      start: 'top 75%',
      onEnter: () => {
        gsap.from('.brand-reels .section-title', { y: 40, opacity: 0, duration: 1, ease: 'cinematic' });
        gsap.from('.brand-reels .reel-card', {
          y: 60,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'cinematic',
          delay: 0.2
        });
      },
    });

    // V3 Studios section
    ScrollTrigger.create({
      trigger: '.v3studios',
      start: 'top 60%',
      onEnter: () => {
        gsap.from('.v3-title', { y: 60, opacity: 0, duration: 1.2, ease: 'cinematic' });
        gsap.from('.v3-sub', { y: 30, opacity: 0, duration: 1, ease: 'cinematic', delay: 0.3 });
        gsap.from('.v3studios .btn-primary', { y: 20, opacity: 0, duration: 0.8, ease: 'cinematic', delay: 0.5 });
        gsap.from('.reel-item', { y: 40, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'cinematic', delay: 0.4 });
      },
    });

    // Portfolio items
    ScrollTrigger.create({
      trigger: '.portfolio-grid',
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.portfolio-item', {
          y: 50, opacity: 0, duration: 1,
          stagger: 0.12, ease: 'cinematic',
        });
      },
    });

    // Stats counters
    ScrollTrigger.create({
      trigger: '.stats-strip',
      start: 'top 75%',
      onEnter: () => {
        document.querySelectorAll('.stat-counter').forEach(animateCounter);
        document.querySelectorAll('.stats-strip-item').forEach((item, i) => {
          setTimeout(() => item.classList.add('animated'), i * 150);
        });
        gsap.from('.stats-strip-item', { y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'cinematic' });
      },
    });

    // Footer
    ScrollTrigger.create({
      trigger: '.footer',
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.footer-title', { y: 40, opacity: 0, duration: 1.2, ease: 'cinematic' });
        gsap.from('.footer-sub', { y: 20, opacity: 0, duration: 0.9, ease: 'cinematic', delay: 0.2 });
        gsap.from('.footer .btn-primary', { y: 20, opacity: 0, duration: 0.8, ease: 'cinematic', delay: 0.4 });
        gsap.from('.footer-col', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'cinematic', delay: 0.3 });
      },
    });

    // Section labels
    document.querySelectorAll('.section-label, .v3-eyebrow, .hero-eyebrow').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => gsap.from(el, { x: -20, opacity: 0, duration: 0.7, ease: 'power2.out' }),
      });
    });

    // Horizontal scroll hint on services
    ScrollTrigger.create({
      trigger: '.services',
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: (self) => {
        gsap.to('.services-header', {
          x: self.progress * -30,
          duration: 0.1,
        });
      },
    });
  }

  // ─── INTRO CANVAS LINES ───────────────────────────────────────────────────
  function resizeCanvas() {
    const canvas = document.getElementById('introLines');
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  // ─── VDIGI DEVLAB WORKSPACE INTERACTIONS ──────────────────────────────────
  function initDevLab() {
    const fontSelect = document.getElementById('insFontSelect');
    const sizeSlider = document.getElementById('insFontSizeSlider');
    const sizeVal = document.getElementById('insFontSizeVal');
    const textInput = document.getElementById('insTextInput');
    const targetText = document.getElementById('interactiveElementText');
    const swatches = document.querySelectorAll('.swatch-item');
    const hexLabel = document.getElementById('insHexLabel');
    const targetElement = document.getElementById('stageInspectedElement');
    const previewCard = document.getElementById('devlabPreviewCard');

    if (!fontSelect || !sizeSlider || !targetText) return;

    // Font family change
    fontSelect.addEventListener('change', (e) => {
      targetText.style.fontFamily = `var(--font-${e.target.value === 'Space Grotesk' ? 'sans' : 'serif'})`;
    });

    // Font size slider change
    sizeSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      sizeVal.textContent = `${val}px`;
      targetText.style.fontSize = `${val}px`;
      
      // Update canvas inspector tag sizes based on slider
      const elWidth = Math.round(300 + val * 2.5);
      const elHeight = Math.round(120 + val * 1.5);
      targetElement.style.width = `${elWidth}px`;
      targetElement.style.height = `${elHeight}px`;
      document.getElementById('selectionElementSize').textContent = `${elWidth}x${elHeight}`;
      document.getElementById('stageDimensions').textContent = `CANVAS: 1200x${elHeight + 280}`;
    });

    // Custom text input
    textInput.addEventListener('input', (e) => {
      targetText.textContent = e.target.value;
    });

    // Swatches selection
    swatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        swatches.forEach((s) => s.classList.remove('active'));
        swatch.classList.add('active');
        const color = swatch.dataset.color;
        hexLabel.textContent = `HEX: ${color}`;
        
        // Dynamic style adjustment on center canvas element
        if (color === '#8B0000') {
          targetText.style.color = '#FFFFFF';
          targetElement.style.background = '#8B0000';
          targetElement.style.borderColor = '#ECE8E2';
        } else if (color === '#F4F1EA') {
          targetText.style.color = '#111111';
          targetElement.style.background = '#F4F1EA';
          targetElement.style.borderColor = '#8B0000';
        } else if (color === '#ECE8E2') {
          targetText.style.color = '#111111';
          targetElement.style.background = '#ECE8E2';
          targetElement.style.borderColor = '#8B0000';
        } else {
          targetText.style.color = '#FFFFFF';
          targetElement.style.background = '#111111';
          targetElement.style.borderColor = '#8B0000';
        }
      });
    });

    // Split-pane simulated inspector hover animation
    if (previewCard) {
      previewCard.addEventListener('mousemove', (e) => {
        const rect = previewCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tooltip = previewCard.querySelector('.devlab-inspector-tooltip');
        if (tooltip) {
          gsap.to(tooltip, {
            x: (x - rect.width / 2) * 0.15,
            y: (y - rect.height / 2) * 0.15,
            duration: 0.6,
            ease: 'power2.out',
          });
        }
      });
      previewCard.addEventListener('mouseleave', () => {
        const tooltip = previewCard.querySelector('.devlab-inspector-tooltip');
        if (tooltip) {
          gsap.to(tooltip, { x: 0, y: 0, duration: 0.8, ease: 'power2.out' });
        }
      });
    }

    // ScrollTrigger to reveal the devlab workspace
    ScrollTrigger.create({
      trigger: '.devlab-section',
      start: 'top 75%',
      onEnter: () => {
        gsap.from('.devlab-browser', {
          y: 80,
          opacity: 0,
          duration: 1.2,
          ease: 'cinematic',
        });
      },
    });
  }

  // ─── LENIS LOAD (CDN fallback) ────────────────────────────────────────────
  function loadLenis() {
    return new Promise((resolve) => {
      if (window.Lenis) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js';
      script.onload = resolve;
      script.onerror = resolve; // graceful fallback
      document.head.appendChild(script);
    });
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  async function init() {
    await loadLenis();
    initLenis();
    initCursor();
    initNav();
    initHeroParallax();
    initMagnetic();
    initReelCards();
    initReelModal();
    initCollectionGrid(getCollectionImagesCurated());
    initImageModal();
    initSignUpModal();

    initHeroCycler();
    initWaveform();
    initIntro();
    initDevLab();
    window.addEventListener('resize', resizeCanvas);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
