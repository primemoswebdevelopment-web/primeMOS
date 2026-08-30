document.documentElement.classList.add('js-enabled');

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
        mobileToggle.classList.add('active');
        if (icon) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        }
        document.body.style.overflow = 'hidden'; // Lock background scroll
      } else {
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        mobileToggle.classList.remove('active');
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
  
  // ---- GLOBAL SEARCH SYSTEM (NEW) ----
  function initGlobalSearch() {
    const path = window.location.pathname;
    const isSubdirectory = path.includes('/home/') || 
                           path.includes('/services/') || 
                           path.includes('/research/') || 
                           path.includes('/about/') || 
                           path.includes('/events/') || 
                           path.includes('/contact/') || 
                           path.includes('/privacy/') || 
                           path.includes('/terms/') || 
                           path.includes('/cancellation/') || 
                           path.includes('/disclaimer/') || 
                           path.includes('/testimonials/');
    const prefix = isSubdirectory ? '../' : './';

    const searchIndex = [
      { title: "Home — PrimeMOS Research & Solutions", description: "Transforming digital visions into silicon reality.", url: `${prefix}home/`, category: "page", icon: "fa-house" },
      { title: "Student Guidance & Support", description: "Career guidance, mock interviews, and academic mini/major projects support.", url: `${prefix}services/#student-services`, category: "program", icon: "fa-user-graduate" },
      { title: "Engineering Programs & Upskilling", description: "Methodology workshops for RTL-to-GDSII timing closure.", url: `${prefix}services/`, category: "program", icon: "fa-chalkboard-user" },
      { title: "Semiconductor Fabrication Concepts & Learning", description: "Online course on fundamentals from silicon wafer to CMOS integration.", url: `${prefix}services/`, category: "learning", icon: "fa-atom" },
      { title: "Pre-Fabrication Chip Verification", description: "Premium physical design verification services including DRC, LVS, and STA.", url: `${prefix}services/`, category: "premium", icon: "fa-circle-check" },
      { title: "Research Support & IEEE Publications", description: "Formatting and drafting guidance for IEEE and Springer journals.", url: `${prefix}services/`, category: "research", icon: "fa-graduation-cap" },
      { title: "Resume Screening & Career Readiness", description: "Alignment with core ECE and VLSI job requirements.", url: `${prefix}services/`, category: "career", icon: "fa-file-lines" },
      { title: "Research Internship Program", description: "Intensive 3 to 5 weeks remote program for CMOS VLSI and Digital IC designs.", url: `${prefix}research/`, category: "internship", icon: "fa-microchip" },
      { title: "Host a College Workshop / Webinar", description: "Hands-on VLSI bootcamps and customized webinars.", url: `${prefix}events/`, category: "institutional", icon: "fa-building-columns" },
      { title: "VBIT Hyderabad VLSI Workshop", description: "Review our workshop organized for 150+ ECE students.", url: `${prefix}events/#past-events`, category: "event", icon: "fa-calendar-check" },
      { title: "VBIT (JNTUH) Official Testimonial", description: "Official institutional testimonial from Vignan's Bharathi Institute of Technology.", url: `${prefix}testimonials/`, category: "reviews", icon: "fa-building-columns" },
      { title: "Technical Webinar on Digital Design", description: "Awarding best participant certificates for VLSI & EDA tool webinars.", url: `${prefix}events/#past-events`, category: "event", icon: "fa-award" },
      { title: "TapeoutX Collaboration Event", description: "Semiconductor Ecosystem & VLSI webinar and student project presentations.", url: `${prefix}events/`, category: "event", icon: "fa-calendar-check" },
      { title: "Online VLSI Internship Enrollment", description: "Enrolment open for intensive 3 to 5 weeks remote chip design program.", url: `${prefix}services/#student-services`, category: "internship", icon: "fa-user-graduate" },
      { title: "IETE Hyderabad Centre Collaboration", description: "Strategic partnership with the Institution of Electronics and Telecommunication Engineers.", url: `${prefix}home/`, category: "page", icon: "fa-handshake" },
      { title: "About PVSDD Mallikarjuna (Founder)", description: "Semiconductor Innovator, Associate IETE member, AI-Enabled VLSI engineer.", url: `${prefix}about/`, category: "founder", icon: "fa-user-tie" },
      { title: "Contact Information & Location", description: "Reach out via WhatsApp or Email in Hyderabad, India.", url: `${prefix}contact/`, category: "contact", icon: "fa-envelope" },
      { title: "Student Testimonials & Reviews", description: "Read ratings and comments from VTU, OU, JNTUH students.", url: `${prefix}testimonials/`, category: "reviews", icon: "fa-comments" },
      { title: "Privacy Policy", description: "Data security and guidelines.", url: `${prefix}privacy/`, category: "legal", icon: "fa-shield-halved" },
      { title: "Terms & Conditions", description: "Service usage guidelines and mathematical simulator rules.", url: `${prefix}terms/`, category: "legal", icon: "fa-scale-balanced" },
      { title: "Cancellation & Refund Policy", description: "Refund parameters and timelines.", url: `${prefix}cancellation/`, category: "legal", icon: "fa-rotate-left" },
      { title: "Disclaimer Policy", description: "Mathematical results versus physical silicon behavior note.", url: `${prefix}disclaimer/`, category: "legal", icon: "fa-triangle-exclamation" }
    ];

    const navContainers = document.querySelectorAll('.navbar .container');
    navContainers.forEach(container => {
      const mobileToggle = container.querySelector('.mobile-toggle');
      if (mobileToggle) {
        const searchBtn = document.createElement('button');
        searchBtn.className = 'search-toggle';
        searchBtn.setAttribute('aria-label', 'Search Website');
        searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
        container.insertBefore(searchBtn, mobileToggle);
      }
    });

    const modalHTML = `
      <div class="search-overlay" id="searchOverlay" role="dialog" aria-modal="true" aria-label="Search site">
        <div class="search-modal">
          <div class="search-input-wrapper">
            <i class="fa-solid fa-magnifying-glass search-input-icon"></i>
            <input type="text" class="search-input" id="searchInput" placeholder="Search topics, services, founder..." autocomplete="off" spellcheck="false">
            <button class="search-close" id="searchClose" aria-label="Close search"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="search-results" id="searchResults"></div>
          <div class="search-footer">
            <div class="search-shortcuts">
              <span class="search-shortcut"><span class="search-key">↑↓</span> to navigate</span>
              <span class="search-shortcut"><span class="search-key">Enter</span> to select</span>
              <span class="search-shortcut"><span class="search-key">ESC</span> to close</span>
            </div>
            <div>
              Powered by <span style="font-weight: 700; color: var(--primary-orange);">PrimeMOS Search</span>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const closeBtn = document.getElementById('searchClose');
    const resultsContainer = document.getElementById('searchResults');
    let selectedIndex = -1;

    const openSearch = () => {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input.focus(), 150);
      renderResults("");
    };

    const closeSearch = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      input.value = "";
      selectedIndex = -1;
    };

    document.querySelectorAll('.search-toggle').forEach(btn => {
      btn.addEventListener('click', openSearch);
    });

    closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });

    // Delegated click handler for search items to ensure reliable navigation
    resultsContainer.addEventListener('click', (e) => {
      const searchItem = e.target.closest('.search-item');
      if (searchItem) {
        e.preventDefault();
        const url = searchItem.getAttribute('href');
        closeSearch();
        window.location.href = url;
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        openSearch();
      }
      
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeSearch();
      }

      if (overlay.classList.contains('active')) {
        const items = resultsContainer.querySelectorAll('.search-item');
        if (items.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection(items);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection(items);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const targetItem = selectedIndex >= 0 && selectedIndex < items.length ? items[selectedIndex] : items[0];
            const url = targetItem.getAttribute('href');
            closeSearch();
            window.location.href = url;
          }
        }
      }
    });

    function updateSelection(items) {
      items.forEach((item, index) => {
        if (index === selectedIndex) {
          item.classList.add('selected');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('selected');
        }
      });
    }

    input.addEventListener('input', (e) => {
      renderResults(e.target.value.trim());
    });

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function renderResults(query) {
      selectedIndex = -1;
      resultsContainer.innerHTML = "";

      if (query === "") {
        const popular = searchIndex.slice(0, 5);
        let html = `
          <div style="font-size: 0.76rem; font-weight: 700; color: var(--primary-maroon); text-transform: uppercase; letter-spacing: 0.08em; padding: 0.75rem 1.5rem 0.25rem;">
            Recommended Topics
          </div>
        `;
        popular.forEach(item => {
          html += createItemHTML(item);
        });
        resultsContainer.innerHTML = html;
        return;
      }

      const cleanQuery = query.toLowerCase();
      const matches = searchIndex.filter(item => 
        item.title.toLowerCase().includes(cleanQuery) || 
        item.description.toLowerCase().includes(cleanQuery) ||
        item.category.toLowerCase().includes(cleanQuery)
      );

      if (matches.length === 0) {
        resultsContainer.innerHTML = `
          <div class="search-empty">
            <i class="fa-solid fa-magnifying-glass"></i>
            <div class="search-empty-text">No results found for "${query}"</div>
            <div style="font-size: 0.8rem; margin-top: 0.25rem;">Try searching for VLSI, CMOS, Research, or Founder</div>
          </div>
        `;
        return;
      }

      let html = "";
      matches.forEach(item => {
        const escapedQuery = escapeRegExp(query);
        const regex = new RegExp(`(${escapedQuery})`, "gi");
        const highlightedTitle = item.title.replace(regex, `<span class="search-highlight">$1</span>`);
        const highlightedDesc = item.description.replace(regex, `<span class="search-highlight">$1</span>`);
        
        html += createItemHTML(item, highlightedTitle, highlightedDesc);
      });
      resultsContainer.innerHTML = html;
    }

    function createItemHTML(item, displayTitle, displayDesc) {
      const title = displayTitle || item.title;
      const desc = displayDesc || item.description;
      return `
        <a href="${item.url}" class="search-item">
          <div class="search-item-icon">
            <i class="fa-solid ${item.icon}"></i>
          </div>
          <div class="search-item-details">
            <div class="search-item-title">${title}</div>
            <div class="search-item-desc">${desc}</div>
          </div>
        </a>
      `;
    }
  }

  initGlobalSearch();
});

