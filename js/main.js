/**
 * SESURAJ A — PORTFOLIO MASTER JAVASCRIPT
 * High-End Animations, Canvas Physics, 3D Tilt, ROI Calculator & Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCanvas();
  initCustomCursor();
  initTypewriter();
  init3DTilt();
  initScrollSpyAndNav();
  initStatsCounter();
  initFilters();
  initRoiCalculator();
  initModals();
  initContactForm();
  initScrollReveals();
});

/* ==========================================================================
   1. THEME SWITCHER (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('sa_theme') || 'dark';

  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('sa_theme', next);
      updateThemeIcon(next);
      showToast(`Switched to ${next.toUpperCase()} mode!`);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
  }
}

/* ==========================================================================
   2. INTERACTIVE CANVAS PARTICLE & CONSTELLATION BACKGROUND
   ========================================================================== */
function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const isMobile = width < 768;
  const particleCount = isMobile ? 22 : Math.min(Math.floor((width * height) / 14000), 75);
  let mouse = { x: null, y: null, radius: isMobile ? 80 : 140 };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.5 ? '#8b5cf6' : '#06b6d4';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse Proximity Repulsion / Attraction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 3;
          this.y -= (dy / dist) * force * 3;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting constellation lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const alpha = 1 - dist / 130;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * 0.25})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   3. CUSTOM MAGNETIC CURSOR
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderRing);
  }
  renderRing();

  // Hover expansion on interactive elements
  const interactives = document.querySelectorAll('a, button, input, select, textarea, .tilt-card, .skill-card');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
}

/* ==========================================================================
   4. DYNAMIC TYPEWRITER EFFECT
   ========================================================================== */
function initTypewriter() {
  const target = document.getElementById('typewriter');
  if (!target) return;

  const roles = [
    'Full-Stack Developer 💻',
    'Digital Marketing Manager 📈',
    'Technical SEO Specialist 🚀',
    'Google & Meta Ads Strategist 🎯',
    'CRM & Automation Architect ⚙️',
    'Growth & CRO Strategist 📊'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 90;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      target.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 45;
    } else {
      target.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 90;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typeSpeed = 1800; // Pause at end of text
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 400; // Pause before typing next word
    }

    setTimeout(type, typeSpeed);
  }

  type();
}

/* ==========================================================================
   5. 3D CARD TILT & MOUSE PARALLAX
   ========================================================================== */
function init3DTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card, .profile-3d-card');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
      card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

/* ==========================================================================
   6. SCROLL SPY, NAVBAR GLASS & BACK TO TOP
   ========================================================================== */
function initScrollSpyAndNav() {
  const navbar = document.getElementById('navbar');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Sticky Glass Navbar Style
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top button visibility
    if (scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }

    // Active Section Scroll Spy
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('active');
      mobileToggle.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    });

    // Close menu when clicking link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('open');
        document.body.style.overflow = 'auto';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('open');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Back to Top Scroll
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   7. LIVE KPI ANIMATED COUNTERS
   ========================================================================== */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let counted = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          statNumbers.forEach((num) => {
            const target = parseInt(num.getAttribute('data-target'), 10);
            const duration = 1800;
            const start = 0;
            const startTime = performance.now();

            function updateCount(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // EaseOutQuad function
              const easeProgress = 1 - (1 - progress) * (1 - progress);
              const current = Math.floor(easeProgress * target);

              num.textContent = current;

              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                num.textContent = target;
              }
            }

            requestAnimationFrame(updateCount);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsContainer = document.querySelector('.hero-stats-container');
  if (statsContainer) observer.observe(statsContainer);
}

/* ==========================================================================
   8. FILTER TABS (Skills & Projects)
   ========================================================================== */
function initFilters() {
  // Skills Filter
  const skillBtns = document.querySelectorAll('.skill-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      skillBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Projects Filter
  const projectBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  projectBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      projectBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-pfilter');

      projectCards.forEach((card) => {
        const cat = card.getAttribute('data-pcat');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   9. INTERACTIVE MARKETING ROI CALCULATOR
   ========================================================================== */
function initRoiCalculator() {
  const budgetInput = document.getElementById('monthlyBudget');
  const trafficInput = document.getElementById('monthlyTraffic');
  const dealInput = document.getElementById('dealValue');

  const budgetDisplay = document.getElementById('budgetDisplay');
  const trafficDisplay = document.getElementById('trafficDisplay');
  const dealDisplay = document.getElementById('dealDisplay');

  const roiMultiplier = document.getElementById('roiMultiplier');
  const calcLeads = document.getElementById('calcLeads');
  const calcDeals = document.getElementById('calcDeals');
  const calcRevenue = document.getElementById('calcRevenue');
  const calcNetProfit = document.getElementById('calcNetProfit');

  if (!budgetInput || !trafficInput || !dealInput) return;

  function calculate() {
    const budget = parseFloat(budgetInput.value);
    const traffic = parseFloat(trafficInput.value);
    const deal = parseFloat(dealInput.value);

    // Displays
    budgetDisplay.textContent = `₹ ${budget.toLocaleString('en-IN')}`;
    trafficDisplay.textContent = `${traffic.toLocaleString('en-IN')} Visitors`;
    dealDisplay.textContent = `₹ ${deal.toLocaleString('en-IN')}`;

    // Optimization Formulas
    // Benchmark: 2.8% base conversion rate + 25% lift from Sesuraj's CRO = 3.5%
    const conversionRate = 0.035;
    const leads = Math.max(10, Math.round(traffic * conversionRate + (budget / 400)));
    // Sales Close Rate: 14%
    const closedDeals = Math.max(2, Math.round(leads * 0.14));
    const grossRevenue = closedDeals * deal;
    const netProfit = grossRevenue - budget;
    const roi = ((grossRevenue / budget)).toFixed(1);
    const profitPct = Math.round((netProfit / budget) * 100);

    // Update Output Elements
    roiMultiplier.textContent = `${roi}x`;
    calcLeads.textContent = `${leads.toLocaleString('en-IN')} Leads`;
    calcDeals.textContent = `${closedDeals} Deals`;
    calcRevenue.textContent = `₹ ${grossRevenue.toLocaleString('en-IN')}`;
    calcNetProfit.textContent = `+${profitPct > 0 ? profitPct : 0}%`;
  }

  [budgetInput, trafficInput, dealInput].forEach((input) => {
    input.addEventListener('input', calculate);
  });

  calculate();
}

/* ==========================================================================
   10. MODALS & CASE STUDY POPUPS
   ========================================================================== */
function initModals() {
  const resumeModal = document.getElementById('resumeModal');
  const openResumeNav = document.getElementById('openResumeBtn');
  const openResumeHero = document.getElementById('heroResumeBtn');
  const closeResume = document.getElementById('closeResumeModal');

  const projectModal = document.getElementById('projectDetailsModal');
  const closeProject = document.getElementById('closeProjectModal');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectContent = document.getElementById('modalProjectContent');

  // Open Resume Modal
  [openResumeNav, openResumeHero].forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (resumeModal) resumeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }
  });

  // Close Resume Modal
  if (closeResume && resumeModal) {
    closeResume.addEventListener('click', () => {
      resumeModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  // Case Study Details Database
  const projectDetails = {
    solar: {
      title: 'Solar Energy Full-Funnel Lead Generation Engine',
      category: 'Paid Search & Meta Ads Strategy',
      challenge: 'High cost-per-lead (CPL) and low inquiry qualification for commercial & residential rooftop installations.',
      solution: 'Restructured Google Search campaigns with negative keyword scrub, high-intent keyword targeting, and bespoke geo-fenced Meta Lead Ads with pre-qualifying quiz forms.',
      results: ['3.8x Return on Ad Spend (ROAS)', '-38% Reduction in Average CPL', '520+ High-Ticket Qualified Installation Inquiries'],
      driveLink: 'https://drive.google.com/drive/folders/1G2bg3hbl9Kt5YbzDdq_zq3basdsOIg4C?usp=sharing',
      tech: ['Google Ads', 'Meta Ads Manager', 'Landing Page CRO', 'Google Analytics 4']
    },
    ecom: {
      title: 'Retail E-Commerce Platform & Organic Search Growth',
      category: 'Custom E-Commerce & Technical SEO',
      challenge: 'Slow page speed (4.2s), cart abandonment, and poor organic search visibility against major aggregators.',
      solution: 'Built a lightweight, responsive e-commerce web platform with optimized assets, payment integration, structured product schema markup, and local SEO citations.',
      results: ['Sub-2-second load times (1.4s)', '100/100 Core Web Vitals score', '+180% Month-over-Month organic revenue growth'],
      driveLink: 'https://drive.google.com/drive/folders/1G2bg3hbl9Kt5YbzDdq_zq3basdsOIg4C?usp=sharing',
      tech: ['WordPress / WooCommerce', 'Schema.org', 'Stripe / Razorpay', 'Speed CRO']
    },
    seo: {
      title: 'Dry Fruits & Retail Organic SEO Authority Engine',
      category: 'Technical & Organic SEO',
      challenge: 'Zero presence on top 3 SERP pages for high-volume commercial keywords.',
      solution: 'Executed comprehensive keyword mapping, on-page meta rewrites, internal linking architecture, and authority directory link building.',
      results: ['45+ Target Keywords ranked in Top 3 SERPs', '+62% Organic Click-Through Rate (CTR)', '3.2x Increase in organic search traffic'],
      driveLink: 'https://drive.google.com/drive/folders/1G2bg3hbl9Kt5YbzDdq_zq3basdsOIg4C?usp=sharing',
      tech: ['Google Search Console', 'SEMrush/Ahrefs', 'Technical SEO', 'Content Strategy']
    },
    gmb: {
      title: 'Restaurant & Hospitality Local GMB Domination',
      category: 'Local SEO & Geo-Targeted Meta Ads',
      challenge: 'Inconsistent foot-traffic and underutilized local Google Maps presence.',
      solution: 'Optimized Google My Business profile with localized keywords, review generation strategy, and hyper-local Instagram reels & story promotions.',
      results: ['#1 Ranking in Local 3-Pack Maps', '+240% Increase in Map Directions & Calls', '1,200+ monthly reservation direction requests'],
      driveLink: 'https://drive.google.com/drive/folders/1G2bg3hbl9Kt5YbzDdq_zq3basdsOIg4C?usp=sharing',
      tech: ['Google My Business', 'Geo-Targeted Meta Ads', 'Local Citations', 'Reputation Management']
    },
    video: {
      title: 'High-Retention Brand Video & Creative Engine',
      category: 'Video Editing & Visual Content',
      challenge: 'Stagnant social media engagement and high ad creative fatigue.',
      solution: 'Scripted and edited high-energy short-form video reels (CapCut & Premiere Pro) with dynamic captions, sound design, and brand consistent Canva graphics.',
      results: ['850,000+ Total Organic Views across platforms', '8.4% Average Engagement Rate (industry benchmark 2.1%)', '5x Growth in active social followers'],
      driveLink: 'https://drive.google.com/drive/folders/1G2bg3hbl9Kt5YbzDdq_zq3basdsOIg4C?usp=sharing',
      tech: ['CapCut Pro', 'Adobe Premiere Pro', 'Canva Pro', 'Prompt Engineering']
    }
  };

  // Open Project Details Modal
  const detailButtons = document.querySelectorAll('.open-details-btn');
  detailButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-project');
      const data = projectDetails[key];
      if (!data) return;

      modalProjectTitle.textContent = data.title;
      modalProjectContent.innerHTML = `
        <div class="modal-detail-body">
          <div class="modal-detail-tag">${data.category}</div>
          
          <div class="modal-section-box">
            <h4><i class="fa-solid fa-triangle-exclamation"></i> The Challenge</h4>
            <p>${data.challenge}</p>
          </div>

          <div class="modal-section-box">
            <h4><i class="fa-solid fa-lightbulb"></i> The Engineered Solution</h4>
            <p>${data.solution}</p>
          </div>

          <div class="modal-section-box">
            <h4><i class="fa-solid fa-trophy"></i> Key Results & Impact</h4>
            <ul class="modal-results-list">
              ${data.results.map((r) => `<li><i class="fa-solid fa-circle-check"></i> ${r}</li>`).join('')}
            </ul>
          </div>

          <div class="modal-section-box">
            <h4><i class="fa-solid fa-microchip"></i> Technologies & Tools</h4>
            <div class="modal-tech-pills">
              ${data.tech.map((t) => `<span>${t}</span>`).join('')}
            </div>
          </div>

          <div class="modal-footer-actions">
            <a href="${data.driveLink}" target="_blank" rel="noopener noreferrer" class="btn-primary-glow btn-full">
              <i class="fa-brands fa-google-drive"></i> Open Complete Drive Dossier
            </a>
          </div>
        </div>
      `;

      projectModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeProject && projectModal) {
    closeProject.addEventListener('click', () => {
      projectModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  // Close modals on clicking backdrop
  [resumeModal, projectModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = 'auto';
        }
      });
    }
  });

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (resumeModal) resumeModal.classList.remove('active');
      if (projectModal) projectModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
}

/* ==========================================================================
   11. CONTACT FORM & INSTANT EMAIL COPY
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const copyEmailCard = document.getElementById('copyEmailCard');

  // Copy Email to Clipboard
  if (copyEmailCard) {
    copyEmailCard.addEventListener('click', () => {
      const email = copyEmailCard.getAttribute('data-copy');
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email copied to clipboard: sesuraj15af@gmail.com');
      });
    });
  }

  // Form Submission handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('formName').value.trim();
      const email = document.getElementById('formEmail').value.trim();
      const service = document.getElementById('formService').value;
      const message = document.getElementById('formMessage').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      // Pre-fill WhatsApp or mailto as secondary action
      const mailtoUrl = `mailto:sesuraj15af@gmail.com?subject=Portfolio Inquiry from ${encodeURIComponent(name)} - ${encodeURIComponent(service)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${message}`)}`;

      // Show confirmation toast
      showToast(`Thank you, ${name}! Redirecting to email composer...`);
      setTimeout(() => {
        window.location.href = mailtoUrl;
        form.reset();
      }, 1000);
    });
  }
}

/* ==========================================================================
   12. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
   ========================================================================== */
function initScrollReveals() {
  const reveals = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute('data-delay') || 0;

          setTimeout(() => {
            el.classList.add('revealed');
          }, delay);

          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => revealObserver.observe(el));
}

/* ==========================================================================
   13. TOAST NOTIFICATION HELPER
   ========================================================================== */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}
