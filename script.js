/* La Couronne — interactions */
(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var nav = document.getElementById('nav');
  var menuToggle = document.getElementById('menu-toggle');
  var backdrop = document.getElementById('nav-backdrop');
  var shopToggle = document.getElementById('shop-toggle');
  var shopItem = shopToggle ? shopToggle.parentElement : null;
  var searchToggle = document.getElementById('search-toggle');
  var searchBar = document.getElementById('search-bar');
  var searchInput = document.getElementById('search-input');
  var searchClose = document.getElementById('search-close');

  /* ---------- sticky header state ---------- */
  var onScroll = function () {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-stuck', y > 8);
      header.classList.toggle('is-compact', y > 120);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  function setMenu(open) {
    if (!nav || !menuToggle) return;
    nav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);

    if (!backdrop) return;
    if (open) {
      backdrop.hidden = false;
      /* force a reflow so the fade transition always runs, even in hidden tabs */
      void backdrop.offsetHeight;
      backdrop.classList.add('is-visible');
    } else {
      backdrop.classList.remove('is-visible');
      window.setTimeout(function () {
        if (!nav.classList.contains('is-open')) backdrop.hidden = true;
      }, 300);
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', function () { setMenu(false); });
  }

  if (nav) {
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
  }

  /* close the drawer if the viewport grows past the mobile breakpoint */
  var desktopQuery = window.matchMedia('(min-width: 1101px)');
  var handleBreakpoint = function (event) {
    if (event.matches) setMenu(false);
  };
  if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', handleBreakpoint);
  else if (desktopQuery.addListener) desktopQuery.addListener(handleBreakpoint);

  /* ---------- shop dropdown ---------- */
  if (shopToggle) {
    shopToggle.addEventListener('click', function (event) {
      event.preventDefault();
      var open = !shopItem.classList.contains('is-open');
      shopItem.classList.toggle('is-open', open);
      shopToggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.addEventListener('click', function (event) {
    if (shopItem && !shopItem.contains(event.target)) {
      shopItem.classList.remove('is-open');
      if (shopToggle) shopToggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (shopItem) shopItem.classList.remove('is-open');
    if (shopToggle) shopToggle.setAttribute('aria-expanded', 'false');
    setMenu(false);
    closeSearch();
  });

  /* ---------- search ---------- */
  function openSearch() {
    if (!searchBar) return;
    searchBar.hidden = false;
    searchToggle.setAttribute('aria-expanded', 'true');
    if (searchInput) searchInput.focus();
  }

  function closeSearch() {
    if (!searchBar || searchBar.hidden) return;
    searchBar.hidden = true;
    if (searchToggle) searchToggle.setAttribute('aria-expanded', 'false');
    if (searchInput) searchInput.value = '';
    filterProducts('');
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', function () {
      if (searchBar.hidden) openSearch();
      else closeSearch();
    });
  }
  if (searchClose) searchClose.addEventListener('click', closeSearch);

  /* ---------- product filtering ---------- */
  var productNodes = Array.prototype.slice.call(document.querySelectorAll('#products .product'));
  var emptyNote = document.getElementById('empty-note');

  function filterProducts(term) {
    if (!productNodes.length) return;
    var query = term.trim().toLowerCase();
    var shown = 0;

    productNodes.forEach(function (card) {
      var haystack = (card.getAttribute('data-name') || '') + ' ' + (card.textContent || '');
      var match = !query || haystack.toLowerCase().indexOf(query) !== -1;
      card.hidden = !match;
      if (match) shown += 1;
    });

    if (emptyNote) emptyNote.hidden = shown !== 0;
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      filterProducts(searchInput.value);
    });
  }

  /* ---------- active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link[href^="#"]'));

  if ('IntersectionObserver' in window && sections.length) {
    var visible = {};

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });

      var current = null;
      sections.forEach(function (section) {
        if (visible[section.id]) current = section.id;
      });
      if (!current) return;

      navLinks.forEach(function (link) {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }
})();
