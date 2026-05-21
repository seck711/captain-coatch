(function () {
  var header = document.querySelector(".site-header");
  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var HERO_IMG_WIDTH = 1600;
  var GALLERY_IMG_WIDTH = 900;
  var LIGHTBOX_IMG_WIDTH = 1920;

  function useImageCdn() {
    var host = window.location.hostname;
    return (
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      window.location.protocol !== "file:"
    );
  }

  function toSitePath(src) {
    if (!src || src.indexOf("http") === 0) return src;
    return src.charAt(0) === "/" ? src : "/" + src;
  }

  function optimizedImageUrl(src, width) {
    if (!src || !useImageCdn() || !/\.(jpe?g|png)$/i.test(src)) return src;
    return (
      "/.netlify/images?url=" +
      encodeURIComponent(toSitePath(src)) +
      "&w=" +
      width +
      "&fm=webp&q=80"
    );
  }

  function resolveImageSrc(src, width) {
    if (!src) return src;
    if (useImageCdn()) return optimizedImageUrl(src, width);
    if (/\.jpe?g$/i.test(src)) return src.replace(/\.jpe?g$/i, ".webp");
    return src;
  }

  function setImageSrc(img, src, width, options) {
    if (!img || !src) return;
    options = options || {};
    var resolved = options.direct
      ? src
      : resolveImageSrc(src, width);
    img.onerror = null;
    img.src = resolved;
    if (resolved !== src) {
      img.onerror = function () {
        img.onerror = null;
        img.src = src;
      };
    }
  }

  function enhanceContentImages() {
    document
      .querySelectorAll(
        ".gallery-item img[src], .about-portrait img[src], .about-intro img[src]"
      )
      .forEach(function (img) {
        var raw = img.getAttribute("src");
        if (!raw || raw.indexOf("images/") === -1) return;
        img.setAttribute("data-raw-src", raw);
        img.setAttribute("decoding", "async");
        img.setAttribute(
          "sizes",
          "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 360px"
        );
        setImageSrc(img, raw, GALLERY_IMG_WIDTH);
      });
  }

  enhanceContentImages();

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
  if (heroSlides.length > 0) {
    var heroIndex = 0;
    var heroIntervalMs = 3000;
    var heroTimer = null;

    function loadHeroSlideImage(slide) {
      if (!slide) return;
      var img = slide.querySelector("img");
      if (!img || img.getAttribute("data-loaded") === "true") return;
      var raw = img.getAttribute("data-src") || img.getAttribute("src");
      if (!raw) return;
      setImageSrc(img, raw, HERO_IMG_WIDTH, { direct: true });
      img.setAttribute("data-loaded", "true");
      img.removeAttribute("data-src");
    }

    function showHeroSlide(index) {
      heroSlides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      heroIndex = index;
      loadHeroSlideImage(heroSlides[index]);
      loadHeroSlideImage(
        heroSlides[(index + 1) % heroSlides.length]
      );
    }

    showHeroSlide(0);

    window.addEventListener("load", function () {
      heroSlides.forEach(function (slide) {
        loadHeroSlideImage(slide);
      });
    });

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

    if (heroSlides.length > 1 && !prefersReducedMotion.matches) {
      startHeroSlideshow();
      prefersReducedMotion.addEventListener("change", function (e) {
        if (e.matches) stopHeroSlideshow();
        else startHeroSlideshow();
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (heroSlides.length < 2) return;
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
  var GALLERY_PREVIEW_COUNT = 30;
  var galleryGrid = document.querySelector(".gallery-grid--photos");
  var galleryFigureEls = galleryGrid
    ? galleryGrid.querySelectorAll(".gallery-item")
    : [];
  var galleryTriggers = document.querySelectorAll(".gallery-trigger");
  var galleryItems = [];
  var lightboxIndex = 0;
  var lastFocusedEl = null;
  var didSwipe = false;
  var touchStartX = 0;
  var touchStartY = 0;

  galleryFigureEls.forEach(function (figure, index) {
    if (index >= GALLERY_PREVIEW_COUNT) {
      figure.classList.add("gallery-item--hidden");
    }
  });

  galleryTriggers.forEach(function (trigger) {
    var figure = trigger.closest(".gallery-item");
    var img = trigger.querySelector("img");
    var captionEl = figure && figure.querySelector("figcaption");
    if (!img) return;

    var rawSrc =
      img.getAttribute("data-raw-src") || img.getAttribute("src");
    galleryItems.push({
      rawSrc: rawSrc,
      alt: img.getAttribute("alt") || "",
      caption: captionEl ? captionEl.textContent : "",
    });

    trigger.addEventListener("click", function () {
      var index = galleryItems.findIndex(function (item) {
        return item.rawSrc === rawSrc;
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
    setImageSrc(lightboxImg, item.rawSrc, LIGHTBOX_IMG_WIDTH);
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

  if (galleryGrid && galleryFigureEls.length > GALLERY_PREVIEW_COUNT) {
    var extraCount = galleryFigureEls.length - GALLERY_PREVIEW_COUNT;
    var anchorPhoto = galleryFigureEls[GALLERY_PREVIEW_COUNT - 1];
    var previewFigure = galleryFigureEls[GALLERY_PREVIEW_COUNT];
    var previewImg =
      previewFigure && previewFigure.querySelector("img");
    var previewSrc = previewImg && previewImg.getAttribute("src");
    var moreCard = document.createElement("figure");
    moreCard.className = "gallery-item gallery-item-more";
    var galleryMoreBtn = document.createElement("button");
    galleryMoreBtn.type = "button";
    galleryMoreBtn.className = "gallery-more-card";
    galleryMoreBtn.id = "gallery-more-btn";
    galleryMoreBtn.setAttribute(
      "aria-label",
      "Voir " + String(extraCount) + " autres photos"
    );
    if (previewSrc) {
      var bgImg = document.createElement("img");
      bgImg.className = "gallery-more-bg";
      bgImg.src = previewSrc;
      bgImg.alt = "";
      bgImg.setAttribute("aria-hidden", "true");
      bgImg.decoding = "async";
      galleryMoreBtn.appendChild(bgImg);
    }

    var moreOverlay = document.createElement("span");
    moreOverlay.className = "gallery-more-overlay";
    moreOverlay.setAttribute("aria-hidden", "true");
    galleryMoreBtn.appendChild(moreOverlay);

    var moreContent = document.createElement("span");
    moreContent.className = "gallery-more-content";
    moreContent.innerHTML =
      '<span class="gallery-more-icon" aria-hidden="true">+</span>' +
      '<span class="gallery-more-label">Autres photos</span>' +
      '<span class="gallery-more-count">(' +
      String(extraCount) +
      ")</span>";
    galleryMoreBtn.appendChild(moreContent);

    galleryMoreBtn.addEventListener("click", function () {
      openLightbox(GALLERY_PREVIEW_COUNT);
    });
    moreCard.appendChild(galleryMoreBtn);
    if (anchorPhoto) {
      anchorPhoto.insertAdjacentElement("afterend", moreCard);
    } else {
      galleryGrid.appendChild(moreCard);
    }
  }
})();
