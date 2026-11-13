/* ============================================================
   EPLANET — Contact form modal
   Any element with [data-contact-open] opens it.
   Optional data-topic pre-selects "I'm interested in".
   Exposed as window.EPLANET.openContact(topic?)
   ============================================================ */
(() => {
  "use strict";

  const overlay   = document.getElementById("contactOverlay");
  const modal     = overlay?.querySelector(".contact-modal");
  const formView  = document.getElementById("contactFormView");
  const success   = document.getElementById("contactSuccessView");
  const form      = document.getElementById("contactForm");
  const closeBtn  = document.getElementById("contactClose");
  const doneBtn   = document.getElementById("contactDone");
  const submitBtn = document.getElementById("contactSubmit");
  const refEl     = document.getElementById("successRef");
  const select    = document.getElementById("cf-interest");

  if (!overlay) return;

  let lastFocused = null;

  /* ---------------- open / close ---------------- */
  const open = (topic) => {
    lastFocused = document.activeElement;
    if (topic) {
      const match = [...select.options].find((o) => o.value === topic);
      if (match) select.value = topic;
    }
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => form.querySelector("input")?.focus(), 250);
  };

  const close = () => {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    // reset back to the form view for next time
    setTimeout(() => {
      if (success.hidden) return;
      success.hidden = true;
      formView.hidden = false;
      form.reset();
      clearErrors();
    }, 450);
    lastFocused?.focus();
  };

  window.EPLANET = Object.assign(window.EPLANET || {}, { openContact: open });

  /* ---------------- global triggers ---------------- */
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-contact-open]");
    if (!trigger) return;
    e.preventDefault();
    open(trigger.dataset.topic || "");
  });

  closeBtn.addEventListener("click", close);
  doneBtn?.addEventListener("click", close);
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
  });

  /* ---------------- basic focus trap ---------------- */
  overlay.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusables = modal.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });

  /* ---------------- validation ---------------- */
  const fields = {
    name:    { el: document.getElementById("cf-name"),    test: (v) => v.trim().length >= 2,            msg: "Please enter your name." },
    email:   { el: document.getElementById("cf-email"),   test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: "Please enter a valid email." },
    phone:   { el: document.getElementById("cf-phone"),   test: (v) => /^[+\d][\d\s-]{7,14}$/.test(v.trim()),       msg: "Please enter a valid phone number." },
    service: { el: select,                                test: (v) => v !== "",                        msg: "Please choose a topic." },
  };

  const clearErrors = () =>
    Object.values(fields).forEach(({ el }) => el.closest(".field").classList.remove("invalid"));

  Object.values(fields).forEach(({ el }) =>
    el.addEventListener("input", () => el.closest(".field").classList.remove("invalid"))
  );

  /* ---------------- submit (demo) ---------------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let ok = true;
    Object.values(fields).forEach(({ el, test, msg }) => {
      const field = el.closest(".field");
      const error = field.querySelector(".field-error");
      if (!test(el.value)) {
        field.classList.add("invalid");
        if (error) error.textContent = msg;
        ok = false;
      }
    });
    if (!ok) {
      modal.querySelector(".field.invalid input, .field.invalid select")?.focus();
      return;
    }

    submitBtn.classList.add("loading");
    submitBtn.textContent = "Sending…";

    // Frontend demo — no real submission happens.
    setTimeout(() => {
      const ref = `EP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      if (refEl) refEl.textContent = ref;
      formView.hidden = true;
      success.hidden = false;
      submitBtn.classList.remove("loading");
      submitBtn.innerHTML = 'Send enquiry <span class="arr">→</span>';
      doneBtn?.focus();
    }, 1100);
  });
})();
