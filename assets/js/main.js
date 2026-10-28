/* ==========================================================================
   WISEINN — main.js
   Defensive, mobile-first behaviour layer.
   Every block checks for its elements before running, so pages without a
   gallery/form/carousel never throw errors.
   ========================================================================== */

/* --------------------------------------------------------------------------
   SITE CONFIG — edit these values before go-live.
   No secrets/API keys belong here.
   -------------------------------------------------------------------------- */
const WISEINN = {
  /* TODO: replace with the production domain once registered (demo only). */
  domain: "https://www.wiseinn.co.za",

  /* From the company profile PDF: +27 79 972 2549.
     TODO: confirm this line is WhatsApp-enabled for business. */
  whatsappNumber: "27799722549",
  whatsappDefaultMsg: "Hello WISEINN, I'd like to make an enquiry.",

  phoneDisplay: "+27 79 972 2549",
  phoneTel: "+27799722549",
  email: "wiseinntrading@gmail.com",

  /* TODO: set to your form provider endpoint (Formspree/Web3Forms/custom).
     While empty, the form shows an honest "not configured yet" notice. */
  formEndpoint: "",

  /* TODO: paste verified profile URLs when the pages are created.
     "#" = icon shows but is marked "coming soon" (never a fake link). */
  social: {
    facebook: "#",
    instagram: "#",
    tiktok: "#"
  },

  /* Approved values for contact.html?service= */
  serviceParams: {
    maintenance:  "SEEFAKO Projects and Design",
    landscaping:  "Wiseinn Landscaping and Outdoor Design",
    shisanyama:   "WISEINN Grilladin",
    general:      "General Enquiry"
  }
};

(function () {
  "use strict";

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. Footer year
     ------------------------------------------------------------------ */
  $$(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ------------------------------------------------------------------
     2. Header scroll state
     ------------------------------------------------------------------ */
  const header = $(".site-header");
  if (header) {
    const onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     3. Mobile nav: close Bootstrap collapse after a link is tapped
     ------------------------------------------------------------------ */
  const navCollapse = $("#navMenu");
  if (navCollapse) {
    $$(".nav-link, .nav-cta", navCollapse).forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.getComputedStyle(navCollapse).position !== "static" &&
            navCollapse.classList.contains("show") && window.bootstrap) {
          const inst = bootstrap.Collapse.getOrCreateInstance(navCollapse, { toggle: false });
          inst.hide();
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     4. WhatsApp FAB + links
     ------------------------------------------------------------------ */
  if (WISEINN.whatsappNumber) {
    const waHref = "https://wa.me/" + WISEINN.whatsappNumber +
      "?text=" + encodeURIComponent(WISEINN.whatsappDefaultMsg);
    $$("[data-whatsapp-link]").forEach(function (el) {
      el.href = waHref;
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  } else {
    /* Number not configured — hide the button rather than ship a broken link. */
    $$("[data-whatsapp-link]").forEach(function (el) { el.hidden = true; });
  }

  /* ------------------------------------------------------------------
     5. Social links: only activate when a real URL exists
     ------------------------------------------------------------------ */
  Object.keys(WISEINN.social).forEach(function (key) {
    $$("[data-social='" + key + "']").forEach(function (el) {
      const url = WISEINN.social[key];
      if (url && url !== "#") {
        el.href = url;
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      } else {
        el.setAttribute("aria-disabled", "true");
        el.setAttribute("title", "WISEINN on " + key + " — page coming soon");
        el.addEventListener("click", function (e) { e.preventDefault(); });
      }
    });
  });

  /* ------------------------------------------------------------------
     6. Contact page: context-aware service preselection
        e.g. contact.html?service=maintenance
     ------------------------------------------------------------------ */
  const serviceSelect = $("#serviceSelect");
  if (serviceSelect) {
    try {
      const param = new URLSearchParams(window.location.search).get("service");
      if (param && WISEINN.serviceParams[param]) {
        Array.from(serviceSelect.options).forEach(function (opt) {
          if (opt.textContent.trim() === WISEINN.serviceParams[param]) {
            serviceSelect.value = opt.value;
          }
        });
      }
    } catch (e) { /* invalid params are simply ignored */ }
  }

  /* ------------------------------------------------------------------
     7. Graceful image fallbacks (keeps the demo looking intentional
        before client photography is placed)
     ------------------------------------------------------------------ */
  $$(".img-frame img").forEach(function (img) {
    img.addEventListener("error", function () {
      const frame = img.closest(".img-frame");
      if (frame) frame.classList.add("img-missing");
    }, { once: true });
    if (img.complete && img.naturalWidth === 0) {
      const frame = img.closest(".img-frame");
      if (frame) frame.classList.add("img-missing");
    }
  });

  /* ------------------------------------------------------------------
     8. Reveal-on-scroll (native IntersectionObserver; WOW-free)
     ------------------------------------------------------------------ */
  const revealEls = $$(".reveal");
  if (revealEls.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------------------------------
     9. Swiper carousels — init only where present, once, with a11y
     ------------------------------------------------------------------ */
  if (window.Swiper) {
    $$("[data-swiper='gallery']").forEach(function (el) {
      if (el.dataset.wiInit) return;
      el.dataset.wiInit = "1";
      new Swiper(el, {
        slidesPerView: 1.12,
        spaceBetween: 16,
        grabCursor: true,
        speed: reducedMotion ? 0 : 650,
        keyboard: { enabled: true },
        a11y: { enabled: true },
        pagination: { el: el.querySelector(".swiper-pagination"), clickable: true },
        navigation: {
          nextEl: el.querySelector(".swiper-button-next"),
          prevEl: el.querySelector(".swiper-button-prev")
        },
        breakpoints: {
          576:  { slidesPerView: 1.6,  spaceBetween: 18 },
          768:  { slidesPerView: 2.2,  spaceBetween: 20 },
          1024: { slidesPerView: 3,    spaceBetween: 24 },
          1400: { slidesPerView: 3.4,  spaceBetween: 24 }
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     10. Lightbox defaults (pages that include lightbox.js)
     ------------------------------------------------------------------ */
  if (window.lightbox && window.lightbox.option) {
    window.lightbox.option({
      resizeDuration: reducedMotion ? 0 : 250,
      fadeDuration: reducedMotion ? 0 : 400,
      imageFadeDuration: reducedMotion ? 0 : 400,
      wrapAround: false,
      albumLabel: "Image %1 of %2"
    });
  }

  /* ------------------------------------------------------------------
     11. Contact form — honest behaviour.
         No fake success: if formEndpoint is empty the visitor is told
         submission is not configured and given phone/WhatsApp routes.
     ------------------------------------------------------------------ */
  const form = $("#enquiryForm");
  if (form) {
    const statusBox = $("#formStatus");

    const showStatus = function (type, html) {
      if (!statusBox) return;
      statusBox.className = "form-status show form-status--" + type;
      statusBox.innerHTML = html;
      statusBox.setAttribute("role", "status");
      statusBox.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
    };

    const setError = function (field, message) {
      const wrap = field.closest(".wi-field");
      if (wrap) wrap.classList.add("has-error");
      field.classList.add("is-invalid");
      field.setAttribute("aria-invalid", "true");
      const errEl = wrap && wrap.querySelector(".field-error");
      if (errEl && message) errEl.textContent = message;
    };
    const clearError = function (field) {
      const wrap = field.closest(".wi-field");
      if (wrap) wrap.classList.remove("has-error");
      field.classList.remove("is-invalid");
      field.removeAttribute("aria-invalid");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;

      $$("[required]", form).forEach(function (field) {
        clearError(field);
        if (!field.value.trim()) { setError(field, "This field is required."); valid = false; }
        else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
          setError(field, "Please enter a valid email address."); valid = false;
        } else if (field.type === "checkbox" && !field.checked) {
          setError(field, "Please confirm before sending."); valid = false;
        }
      });

      if (!valid) { showStatus("error", "Please check the highlighted fields and try again."); return; }

      if (!WISEINN.formEndpoint) {
        showStatus("info",
          "<strong>Submission is not configured yet.</strong><br>" +
          "For a fast response, call " + WISEINN.phoneDisplay +
          " or <a href='https://wa.me/" + WISEINN.whatsappNumber + "?text=" +
          encodeURIComponent(WISEINN.whatsappDefaultMsg) +
          "' target='_blank' rel='noopener'>message us on WhatsApp</a>.");
        return;
      }

      /* Real submission via the configured provider */
      const btn = form.querySelector("[type='submit']");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      fetch(WISEINN.formEndpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          showStatus("success", "<strong>Thank you!</strong> Your enquiry has been sent. We will be in touch shortly.");
        } else {
          showStatus("error", "Something went wrong sending your message. Please call " + WISEINN.phoneDisplay + ".");
        }
      }).catch(function () {
        showStatus("error", "Connection problem. Please call " + WISEINN.phoneDisplay + ".");
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = "Send Enquiry"; }
      });
    });

    $$("[required]", form).forEach(function (field) {
      field.addEventListener("input", function () { clearError(field); });
    });
  }

})();