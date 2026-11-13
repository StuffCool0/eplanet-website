/* ============================================================
   EPLANET — Interaction layer
   nav state · mobile menu · reveals · counters ·
   hero parallax · pointer spotlight · ticker guard
   ============================================================ */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. Navigation — transparent over hero, glass when scrolled
  ---------------------------------------------------------- */
  const nav = document.getElementById("nav");

  const navState = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  };
  navState();
  window.addEventListener("scroll", navState, { passive: true });

  /* ---------------------------------------------------------
     1b. Scrollspy + sliding indicator + click pulse
  ---------------------------------------------------------- */
  const linksWrap = document.querySelector(".nav-links");
  if (linksWrap) {
    const navAnchors = [...linksWrap.querySelectorAll("a")];
    const targets = navAnchors.map((a) => document.querySelector(a.getAttribute("href")));

    const indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    linksWrap.appendChild(indicator);

    const moveIndicator = (link) => {
      if (!link) {
        indicator.classList.remove("on");
        return;
      }
      indicator.style.left = `${link.offsetLeft}px`;
      indicator.style.width = `${link.offsetWidth}px`;
      indicator.classList.add("on");
    };

    const spy = () => {
      const y = window.scrollY + window.innerHeight * 0.28;
      let current = null;
      targets.forEach((t, i) => {
        if (t && t.offsetTop <= y) current = navAnchors[i];
      });
      navAnchors.forEach((a) => a.classList.toggle("active", a === current));
      moveIndicator(current);
    };
    spy();
    window.addEventListener("scroll", spy, { passive: true });
    window.addEventListener("resize", spy);
    if (document.fonts?.ready) document.fonts.ready.then(spy);

    navAnchors.forEach((a) => {
      a.addEventListener("click", () => {
        navAnchors.forEach((x) => x.classList.remove("active"));
        a.classList.add("active");
        moveIndicator(a);
        a.classList.remove("clicked");
        void a.offsetWidth; // restart the pulse animation
        a.classList.add("clicked");
      });
      a.addEventListener("animationend", () => a.classList.remove("clicked"));
    });
  }

  /* ---------------------------------------------------------
     2. Mobile menu
  ---------------------------------------------------------- */
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobileMenu");

  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);

    // staggered link entrance
    if (open && !prefersReduced) {
      menu.querySelectorAll("nav a").forEach((a, i) => {
        a.style.transitionDelay = `${0.06 + i * 0.055}s`;
      });
    } else {
      menu.querySelectorAll("nav a").forEach((a) => (a.style.transitionDelay = "0s"));
    }
  };

  burger.addEventListener("click", () =>
    setMenu(burger.getAttribute("aria-expanded") !== "true")
  );
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------------------------------------------------------
     3. Scroll reveals with sibling stagger
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  const groups = document.querySelectorAll("[data-reveal-group]");

  groups.forEach((group) => {
    group.querySelectorAll("[data-reveal]").forEach((el, i) => {
      if (!el.closest(".hero")) el.style.transitionDelay = `${(i % 4) * 0.09}s`;
    });
  });

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------
     4. Animated counters
  ---------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count]");

  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (prefersReduced) { el.textContent = target; return; }

    const duration = 1600;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(ease(p) * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------------------------------------------------------
     5. Hero parallax — video drifts, content lifts
  ---------------------------------------------------------- */
  const hero = document.querySelector(".hero");
  const video = document.getElementById("heroVideo");
  const heroContent = document.querySelector("[data-hero-content]");

  if (hero && video && heroContent && !prefersReduced) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const h = hero.offsetHeight || 1;
          if (y < h) {
            video.style.transform = `scale(1.06) translateY(${y * 0.12}px)`;
            heroContent.style.transform = `translateY(${y * 0.22}px)`;
            heroContent.style.opacity = String(Math.max(0, 1 - (y / h) * 1.4));
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     6. Pointer spotlight on service cards
  ---------------------------------------------------------- */
  document.querySelectorAll(".card-spot").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------------------------------------------------------
     7. Video resilience — poster/gradient fallback
  ---------------------------------------------------------- */
  if (video) {
    video.addEventListener("error", () => {
      const media = video.closest(".hero-media");
      if (media) {
        media.style.background =
          "radial-gradient(120% 100% at 70% 10%, #0E6B5C 0%, #06332D 45%, #032723 100%)";
      }
    });
    // Autoplay can be blocked in some contexts; retry muted.
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }

  /* ---------------------------------------------------------
     8. Footer year
  ---------------------------------------------------------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
