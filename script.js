document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileToggle && navLinks) {
    // Dynamically create a blur backdrop overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    
    const toggleMenu = (show) => {
      const icon = mobileToggle.querySelector('i');
      const shouldOpen = show !== undefined ? show : !navLinks.classList.contains('active');
      
      if (shouldOpen) {
        navLinks.classList.add('active');
        overlay.classList.add('active');
        if (icon) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        }
        document.body.style.overflow = 'hidden'; // Lock background scroll
      } else {
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
        document.body.style.overflow = ''; // Restore background scroll
      }
    };
    
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
    
    overlay.addEventListener('click', () => {
      toggleMenu(false);
    });
    
    // Auto-close when clicking any link inside the nav
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });
  }

  // Intersection Observer for fade-in animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10px 0px',
    threshold: 0.02 // Tiny threshold to trigger fade-in instantly
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => {
    observer.observe(el);
  });

  // Back to Top scroll and click logic
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Animated Stats Counter
  const countUp = (element, target, suffix) => {
    let current = 0;
    const duration = 1500; // 1.5s animation duration
    const stepTime = 15;
    const steps = duration / stepTime;
    const increment = target / steps;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target + suffix;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + suffix;
      }
    }, stepTime);
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        countUp(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.05 });

  const statDigits = document.querySelectorAll('.stat-digit');
  statDigits.forEach(el => {
    statsObserver.observe(el);
  });

  // FAQ Accordion Toggle Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close other panels
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle current panel
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    }
  });

  // Visitor Counter Logic
  async function initVisitorCounter() {
    const BASE_COUNT  = 7000;
    const LAUNCH_DATE = new Date('2024-11-01');
    const DAILY_RATE  = 4.2;

    const now = new Date();
    const daysSinceLaunch = Math.max(0, (now - LAUNCH_DATE) / 86400000);
    const organicGrowth   = Math.floor(daysSinceLaunch * DAILY_RATE);

    let stored = {};
    try { stored = JSON.parse(localStorage.getItem('primemos_vc') || '{}'); } catch (_) {}

    const trackedIPs  = stored.ips    || [];
    const localOffset = stored.offset || 0;

    let ip = 'unknown';
    try {
        const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
        const dat = await res.json();
        ip = dat.ip || 'unknown';
    } catch (_) {
        ip = 'unknown_' + Math.random().toString(36).slice(2, 8);
    }

    const todayKey = ip + '_' + now.toISOString().slice(0, 10);
    let newOffset  = localOffset;

    if (!trackedIPs.includes(todayKey)) {
        trackedIPs.push(todayKey);
        newOffset = localOffset + 1;
        const pruned = trackedIPs.slice(-500);
        try {
            localStorage.setItem('primemos_vc', JSON.stringify({ ips: pruned, offset: newOffset }));
        } catch (_) {}
    }

    const rawCount     = BASE_COUNT + organicGrowth + newOffset;
    const displayCount = rawCount * 2;

    const counterEls = document.querySelectorAll('#visitor-counter');
    counterEls.forEach(el => {
        let current  = Math.floor(displayCount * 0.88);
        const target = displayCount;
        const step   = Math.ceil((target - current) / 40);
        el.textContent = current.toLocaleString('en-IN');
        const ticker = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current.toLocaleString('en-IN');
            if (current >= target) clearInterval(ticker);
        }, 28);
    });
  }
  
  initVisitorCounter();
});
