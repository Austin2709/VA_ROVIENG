const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const currentYear = document.querySelector("#current-year");
const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
const heroPhotoTrigger = document.querySelector(".hero-photo-trigger");
const previousSlideButton = document.querySelector(".slide-previous");
const nextSlideButton = document.querySelector(".slide-next");
const photoDialog = document.querySelector(".photo-dialog");
const photoDialogClose = document.querySelector(".photo-dialog-close");
const photoDialogImage = document.querySelector("#photo-dialog-image");
const photoDialogCaption = document.querySelector("#photo-dialog-caption");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeSlideIndex = 0;

function setMenuOpen(isOpen) {
  if (!menuToggle || !primaryNav) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
  primaryNav.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });
}

window.addEventListener("resize", () => {
  if (
    window.matchMedia("(min-width: 901px)").matches &&
    menuToggle?.getAttribute("aria-expanded") === "true"
  ) {
    setMenuOpen(false);
    if (document.activeElement === menuToggle) {
      primaryNav?.querySelector("a")?.focus();
    }
  }
});

if (primaryNav) {
  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setMenuOpen(false);
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && photoDialog?.open) {
    event.preventDefault();
    photoDialog.close();
    return;
  }

  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function openPhotoViewer(source, caption) {
  if (!photoDialog || !photoDialogImage || !photoDialogCaption) {
    return;
  }

  photoDialogImage.src = source;
  photoDialogImage.alt = caption;
  photoDialogCaption.textContent = caption;
  if (!photoDialog.open) {
    photoDialog.showModal();
  }
}

function showSlide(index) {
  if (heroSlides.length === 0) {
    return;
  }

  activeSlideIndex = (index + heroSlides.length) % heroSlides.length;
  const activeSlide = heroSlides[activeSlideIndex];
  const caption = activeSlide.dataset.caption || "Project photo";

  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlideIndex);
  });

  if (heroPhotoTrigger) {
    heroPhotoTrigger.setAttribute("aria-label", `View photo: ${caption}`);
  }
}

if (heroPhotoTrigger) {
  heroPhotoTrigger.addEventListener("click", () => {
    const activeSlide = heroSlides[activeSlideIndex];
    if (activeSlide) {
      openPhotoViewer(activeSlide.src, activeSlide.dataset.caption || "Project photo");
    }
  });
}

previousSlideButton?.addEventListener("click", () => {
  showSlide(activeSlideIndex - 1);
});

nextSlideButton?.addEventListener("click", () => {
  showSlide(activeSlideIndex + 1);
});

document.querySelectorAll(".field-photo-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const source = trigger.dataset.photoSrc;
    const caption = trigger.dataset.photoCaption;
    if (source && caption) {
      openPhotoViewer(source, caption);
    }
  });
});

document.querySelectorAll(".brand-logo-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const logo = trigger.querySelector(".brand-logo");
    if (logo) {
      openPhotoViewer(logo.src, "VA ROVIENG CO.,LTD logo");
    }
  });
});

if (photoDialogClose && photoDialog) {
  photoDialogClose.addEventListener("click", () => {
    photoDialog.close();
  });
}

if (photoDialog) {
  photoDialog.addEventListener("click", (event) => {
    if (event.target === photoDialog) {
      photoDialog.close();
    }
  });
}

showSlide(activeSlideIndex);

if (heroSlides.length > 1 && !prefersReducedMotion) {
  window.setInterval(() => {
    if (!document.hidden) {
      showSlide(activeSlideIndex + 1);
    }
  }, 8000);
}

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
