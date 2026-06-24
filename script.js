/* ================================================================
   script.js — Upgrade Facilities
   ================================================================ */
(function () {
  "use strict";

  /* ── 1. Scroll fade-in ── */
  /* Rendre tous les éléments visibles immédiatement au chargement,
     puis animer ceux qui apparaissent ensuite */
  function initFadeIn() {
    var els = document.querySelectorAll(".fade-in");
    if (!els.length) return;

    /* Fallback : si IntersectionObserver non dispo ou fichier local, tout visible */
    if (!window.IntersectionObserver || window.location.protocol === "file:") {
      els.forEach(function(el) { el.classList.add("visible"); });
      return;
    }

    var io = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(function(el) { io.observe(el); });
  }

  /* ── 1bis. Flèche de scroll du hero ── */
  var scrollHint = document.querySelector(".hero-scroll-hint");
  if (scrollHint) {
    scrollHint.addEventListener("click", function(e) {
      var targetId = scrollHint.getAttribute("href");
      var target = targetId ? document.querySelector(targetId) : null;
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  /* ── 2. Nav: scroll state + active link highlighting ── */
  var navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", function() {
      navbar.classList.toggle("scrolled", window.scrollY > 40);
    }, { passive: true });
  }

  /* ── 3. Hamburger / mobile menu ── */
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function() {
      var isOpen = mobileMenu.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
    document.querySelectorAll(".mobile-link, .cta-mobile").forEach(function(l) {
      l.addEventListener("click", function() {
        mobileMenu.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── 4. Contact form ── */
  var form = document.getElementById("contactForm");
  if (form) {
    var successBox = document.getElementById("formSuccess");
    var submitBtn  = document.getElementById("submitBtn");

    function validateField(input) {
      var group = input.closest(".form-group");
      if (!group) return true;
      var errMsg = group.querySelector(".error-msg");
      var valid = true;
      var val = input.value.trim();

      if (input.hasAttribute("required") && !val) {
        valid = false;
      } else if (input.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        valid = false;
      } else if (input.type === "tel" && val && !/^[+0-9][0-9 .\-()]{6,19}$/.test(val)) {
        valid = false;
      } else if (input.tagName === "SELECT" && input.hasAttribute("required") && !val) {
        valid = false;
      } else if (input.type === "checkbox" && input.hasAttribute("required") && !input.checked) {
        valid = false;
      }

      input.classList.toggle("error", !valid);
      if (errMsg) errMsg.classList.toggle("visible", !valid);
      return valid;
    }

    form.querySelectorAll("input, select, textarea").forEach(function(field) {
      field.addEventListener("blur", function() { validateField(field); });
    });

    function collectData() {
      var fd = new FormData(form);
      var payload = {};
      fd.forEach(function(v, k) { payload[k] = v; });
      return payload;
    }

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      var allValid = true;
      form.querySelectorAll("input, select, textarea").forEach(function(f) {
        if (!validateField(f)) allValid = false;
      });
      if (!allValid) return;

      var endpoint = form.dataset.action || "/api/contact";
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify(collectData()),
      }).then(function(response) {
        if (response.ok) {
          form.style.display = "none";
          if (successBox) {
            successBox.classList.add("visible");
            successBox.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else {
          throw new Error("server_error");
        }
      }).catch(function() {
        alert("Une erreur s'est produite. Veuillez réessayer ou nous contacter directement par email.");
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      });
    });
  }

  /* Init */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFadeIn);
  } else {
    initFadeIn();
  }

})();
