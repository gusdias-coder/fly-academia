(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = Fly.icon(el.dataset.icon); });

  // Bootstrap owns the focus trap; hash navigation runs after the trap is released.
  const menu = document.querySelector('#menu');
  const trigger = document.querySelector('#menuButton');
  let destination = null;
  const setActive = () => {
    document.querySelectorAll('.site-nav a, #menu nav a').forEach(a => {
      const u = new URL(a.href);
      const currentFile = location.pathname.split('/').pop() || 'index.html';
      const samePage = (u.pathname.split('/').pop() || 'index.html') === currentFile;
      if (samePage && (u.hash ? u.hash === location.hash : !location.hash)) a.setAttribute('aria-current', u.hash ? 'location' : 'page');
      else a.removeAttribute('aria-current');
    });
  };
  setActive();
  addEventListener('hashchange', setActive);
  if (menu && trigger && window.bootstrap) {
    menu.addEventListener('show.bs.offcanvas', () => trigger.setAttribute('aria-expanded', 'true'));
    menu.addEventListener('hidden.bs.offcanvas', () => {
      trigger.setAttribute('aria-expanded', 'false');
      if (!destination) return;
      const url = destination;
      destination = null;
      const currentFile = location.pathname.split('/').pop() || 'index.html';
      if ((url.pathname.split('/').pop() || 'index.html') !== currentFile || url.search !== location.search) {
        location.assign(url.href);
        return;
      }
      const target = document.getElementById(url.hash.slice(1)) || document.querySelector('main');
      history.pushState(null, '', url.href);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' });
      setActive();
    });
    menu.querySelectorAll('nav a').forEach(a => a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      destination = new URL(a.href);
      bootstrap.Offcanvas.getOrCreateInstance(menu).hide();
    }));
    matchMedia('(min-width: 992px)').addEventListener('change', e => {
      if (e.matches) bootstrap.Offcanvas.getInstance(menu)?.hide();
    });
  }

  // Elements remain visible even if observers or animation APIs are unavailable.
  let observer;
  if ('IntersectionObserver' in window && Element.prototype.animate && !reduced.matches) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (!reduced.matches) entry.target.animate([{ opacity: 0.5, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'ease-out' });
    }), { threshold: 0.08 });
    document.querySelectorAll('.section-heading, .modality, .plan, .agenda-intro, .hours-card').forEach(el => observer.observe(el));
  }
  reduced.addEventListener('change', e => {
    if (e.matches) { observer?.disconnect(); document.getAnimations().forEach(a => a.cancel()); }
  });
})();
