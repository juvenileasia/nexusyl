// Aaz Travel — shared site JS (used by every page).
// Guarded with existence checks throughout so the same file can be safely
// included on pages that don't have every element (e.g. only index.html has
// the contact form / FAQ accordion / Umrah questionnaire).

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Sticky nav shadow/background on scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ── Mobile hamburger menu
  const toggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const bar1 = document.getElementById('bar1');
  const bar2 = document.getElementById('bar2');
  const bar3 = document.getElementById('bar3');
  let menuOpen = false;

  if (toggle && mobileMenu && bar1 && bar2 && bar3) {
    toggle.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      bar1.style.transform = menuOpen ? 'translateY(8px) rotate(45deg)' : '';
      bar2.style.opacity   = menuOpen ? '0' : '1';
      bar3.style.transform = menuOpen ? 'translateY(-8px) rotate(-45deg)' : '';
      bar3.style.width     = menuOpen ? '24px' : '16px';
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        bar1.style.transform = bar2.style.opacity = bar3.style.transform = '';
        bar3.style.width = '16px';
        bar2.style.opacity = '1';
      });
    });
  }

  // ── Desktop "Travel Services" nav dropdown
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });
      dropdown.classList.toggle('open', !isOpen);
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
      if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
  });

  // ── Mobile "Travel Services" accordion (inside the hamburger menu)
  document.querySelectorAll('.mobile-nav-dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const submenu = trigger.nextElementSibling;
      const isOpen = trigger.classList.contains('open');
      trigger.classList.toggle('open', !isOpen);
      if (submenu) submenu.style.maxHeight = !isOpen ? submenu.scrollHeight + 'px' : null;
    });
  });

  // ── Scroll-reveal animation
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));
  }

  // ── Back to top button
  const btt = document.getElementById('back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.style.display = window.scrollY > 400 ? 'flex' : 'none';
    });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    btt.addEventListener('mouseenter', () => btt.style.transform = 'translateY(-3px)');
    btt.addEventListener('mouseleave', () => btt.style.transform = '');
  }

  // ── Homepage contact form: show the field set that matches the selected
  //    service, and only require those visible fields.
  const enquirySelect = document.getElementById('enquiry');
  const subjectInput = document.querySelector('form.enquiry-form input[name="_subject"]');
  const serviceSubjects = {
    flights: 'New Flights enquiry from the Aaz Travel website',
    holiday: 'New Holiday Package enquiry from the Aaz Travel website',
    umrah: 'New Umrah & Hajj enquiry from the Aaz Travel website',
    'travel-money': 'New Travel Money enquiry from the Aaz Travel website',
    'money-transfer': 'New Money Transfer enquiry from the Aaz Travel website',
    'travel-insurance': 'New Travel Insurance enquiry from the Aaz Travel website',
    'visa-assistance': 'New Visa Assistance enquiry from the Aaz Travel website',
    'airport-transfer': 'New Airport Transfer enquiry from the Aaz Travel website',
    general: 'New enquiry from the Aaz Travel website',
  };

  function syncServiceFields() {
    const panels = document.querySelectorAll('.service-fields');
    if (!panels.length || !enquirySelect) return;
    const selected = enquirySelect.value;
    panels.forEach(panel => {
      const active = panel.dataset.service === selected;
      panel.classList.toggle('is-active', active);
      panel.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type === 'hidden' || field.name === '_honey') return;
        if (field.dataset.alwaysRequired === 'true') return;
        if (field.dataset.wasRequired === undefined) {
          field.dataset.wasRequired = field.required ? '1' : '0';
        }
        field.required = active && field.dataset.wasRequired === '1';
        field.disabled = !active;
      });
    });
    if (subjectInput && serviceSubjects[selected]) {
      subjectInput.value = serviceSubjects[selected];
    }
  }

  if (enquirySelect) {
    enquirySelect.addEventListener('change', syncServiceFields);
    syncServiceFields();
  }

  // ── Enquiry forms — every form on the site (the general contact form on
  //    index.html, plus each service page's dedicated enquiry form) shares
  //    this same handler. Every such form has class="enquiry-form" and a
  //    ".form-success" element as a sibling inside the same ".form-card"
  //    wrapper; forms submit to info@aaztravel.com via FormSubmit (see the
  //    comment above each <form> tag for the one-time confirmation step).
  document.querySelectorAll('form.enquiry-form').forEach(form => {
    const card = form.closest('.form-card') || form.parentElement;
    const successMsg = card ? card.querySelector('.form-success') : null;
    if (!successMsg) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalBtnHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Sending...';
      btn.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        if (!response.ok) throw new Error('Form submission failed');
        form.style.display = 'none';
        successMsg.style.display = 'block';
      } catch (err) {
        btn.innerHTML = originalBtnHTML;
        btn.disabled = false;
        alert("Sorry, we couldn't send your message. Please email us directly at info@aaztravel.com or WhatsApp us at 020 8154 9513.");
      }
    });
  });

  // ── FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          const openAnswer = openItem.querySelector('.faq-answer');
          if (openAnswer) openAnswer.style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

  // ── Smooth anchor offset (account for fixed nav) — only for in-page
  //    anchors (href starting with "#") that resolve on THIS page.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const hash = this.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (target && navbar) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 16;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });
});
