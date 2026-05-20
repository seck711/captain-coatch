(function () {
  var header = document.querySelector(".site-header");
  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        open ? "Fermer le menu" : "Ouvrir le menu"
      );
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
      });
    });
  }

  var heroSlides = document.querySelectorAll(".hero-slide");
  if (heroSlides.length > 1) {
    var heroIndex = 0;
    var heroIntervalMs = 5000;
    var heroTimer = null;

    function showHeroSlide(index) {
      heroSlides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      heroIndex = index;
    }

    function nextHeroSlide() {
      showHeroSlide((heroIndex + 1) % heroSlides.length);
    }

    function startHeroSlideshow() {
      if (heroTimer) clearInterval(heroTimer);
      heroTimer = setInterval(nextHeroSlide, heroIntervalMs);
    }

    function stopHeroSlideshow() {
      if (heroTimer) {
        clearInterval(heroTimer);
        heroTimer = null;
      }
    }

    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (!prefersReducedMotion.matches) {
      startHeroSlideshow();
      prefersReducedMotion.addEventListener("change", function (e) {
        if (e.matches) stopHeroSlideshow();
        else startHeroSlideshow();
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopHeroSlideshow();
      else if (!prefersReducedMotion.matches) startHeroSlideshow();
    });
  }

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox && lightbox.querySelector(".lightbox-img");
  var lightboxCaption = lightbox && lightbox.querySelector(".lightbox-caption");
  var lightboxClose = lightbox && lightbox.querySelector(".lightbox-close");
  var lightboxPrev = lightbox && lightbox.querySelector(".lightbox-prev");
  var lightboxNext = lightbox && lightbox.querySelector(".lightbox-next");
  var lightboxFigure = lightbox && lightbox.querySelector(".lightbox-figure");
  var lightboxCounter = lightbox && lightbox.querySelector(".lightbox-counter");
  var galleryTriggers = document.querySelectorAll(".gallery-trigger");
  var galleryItems = [];
  var lightboxIndex = 0;
  var lastFocusedEl = null;
  var didSwipe = false;
  var touchStartX = 0;
  var touchStartY = 0;

  galleryTriggers.forEach(function (trigger) {
    var figure = trigger.closest(".gallery-item");
    var img = trigger.querySelector("img");
    var captionEl = figure && figure.querySelector("figcaption");
    if (!img) return;

    galleryItems.push({
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt") || "",
      caption: captionEl ? captionEl.textContent : "",
    });

    trigger.addEventListener("click", function () {
      var index = galleryItems.findIndex(function (item) {
        return item.src === img.getAttribute("src");
      });
      openLightbox(index >= 0 ? index : 0);
    });
  });

  function updateLightboxCounter() {
    if (!lightboxCounter || !galleryItems.length) return;
    lightboxCounter.textContent =
      String(lightboxIndex + 1) + " / " + String(galleryItems.length);
  }

  function showLightboxSlide(index) {
    if (!lightbox || !lightboxImg || !galleryItems.length) return;
    lightboxIndex = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[lightboxIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    if (lightboxCaption) {
      lightboxCaption.textContent = item.caption;
      lightboxCaption.hidden = !item.caption;
    }
    updateLightboxCounter();
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lastFocusedEl = document.activeElement;
    showLightboxSlide(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lightboxImg) lightboxImg.src = "";
    if (lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus();
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", function () {
      showLightboxSlide(lightboxIndex - 1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", function () {
      showLightboxSlide(lightboxIndex + 1);
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (didSwipe) {
        didSwipe = false;
        return;
      }
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showLightboxSlide(lightboxIndex - 1);
      if (e.key === "ArrowRight") showLightboxSlide(lightboxIndex + 1);
    });
  }

  if (lightboxFigure) {
    lightboxFigure.addEventListener(
      "touchstart",
      function (e) {
        if (lightbox.hidden || !e.changedTouches.length) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        didSwipe = false;
      },
      { passive: true }
    );

    lightboxFigure.addEventListener(
      "touchend",
      function (e) {
        if (lightbox.hidden || !e.changedTouches.length) return;
        var deltaX = e.changedTouches[0].screenX - touchStartX;
        var deltaY = e.changedTouches[0].screenY - touchStartY;
        var threshold = 48;

        if (
          Math.abs(deltaX) > threshold &&
          Math.abs(deltaX) > Math.abs(deltaY)
        ) {
          didSwipe = true;
          if (deltaX < 0) showLightboxSlide(lightboxIndex + 1);
          else showLightboxSlide(lightboxIndex - 1);
        }
      },
      { passive: true }
    );
  }
})();
