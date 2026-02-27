(() => {
  // Prevent double-initialization if script is included twice
  if (window.__mavaguMainInitialized) return;
  window.__mavaguMainInitialized = true;

  document.addEventListener("DOMContentLoaded", () => {
    /* =========================
       NAV: Mobile menu toggle
    ========================== */
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    const navOverlay = document.querySelector(".nav-overlay");

    const closeMenu = () => {
      if (!navMenu || !navToggle) return;
      navMenu.classList.remove("active");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
      if (navOverlay) navOverlay.classList.remove("active");
    };

    const openMenu = () => {
      if (!navMenu || !navToggle) return;
      navMenu.classList.add("active");
      navToggle.classList.add("active");
      navToggle.setAttribute("aria-expanded", "true");
      if (navOverlay) navOverlay.classList.add("active");
    };

    const toggleMenu = () => {
      if (!navMenu || !navToggle) return;
      const isOpen = navMenu.classList.contains("active");
      if (isOpen) closeMenu();
      else openMenu();
    };

    if (navToggle && navMenu) {
      // Ensure aria-expanded exists
      if (!navToggle.hasAttribute("aria-expanded")) {
        navToggle.setAttribute("aria-expanded", "false");
      }

      navToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      });

      // Close menu when a nav link is clicked
      navLinks.forEach((link) => {
        link.addEventListener("click", () => closeMenu());
      });

      if (navOverlay) {
        navOverlay.addEventListener("click", () => closeMenu());
      }

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          closeMenu();
        }
      });

      // Close on Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
      });
    }

    /* =========================
       Smooth scroll (same-page anchors only)
    ========================== */
    document
      .querySelectorAll('a[href^="#"]:not([href="#"])')
      .forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
          const href = anchor.getAttribute("href");
          if (!href) return;

          const targetEl = document.querySelector(href);
          if (!targetEl) return;

          e.preventDefault();

          const navbar = document.querySelector(".navbar");
          const navH = navbar ? navbar.offsetHeight : 0;

          const y =
            targetEl.getBoundingClientRect().top + window.pageYOffset - navH;

          window.scrollTo({ top: y, behavior: "smooth" });

          // If user clicked nav link on mobile, close menu
          closeMenu();
        });
      });

    /* =========================
       Navbar shadow on scroll
    ========================== */
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      const onScroll = () => {
        navbar.classList.toggle("is-scrolled", window.scrollY > 50);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* =========================
       Contact form (EmailJS)
    ========================== */
    const contactForm =
      document.getElementById("contactForm") ||
      document.querySelector("form.contact-form");

    // === EmailJS CONFIG (your values) ===
    
    const EMAILJS_PUBLIC_KEY = "Dix7lm4DQPSv9IOOc";
    const EMAILJS_SERVICE_ID = "service_0888kdg";
    const TEMPLATE_ID_OWNER = "template_l6tuv2t"; // owner
    const TEMPLATE_ID_THANKS = "template_5o0awyi"; // thank-you

    function loadEmailJSSDK() {
      return new Promise((resolve, reject) => {
        if (window.emailjs) return resolve();

        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load EmailJS SDK."));
        document.head.appendChild(script);
      });
    }

    async function initEmailJS() {
      if (window.__emailjsReady) return;
      await loadEmailJSSDK();
      window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      window.__emailjsReady = true;
    }

    function setButtonLoading(btn, isLoading, originalText) {
      if (!btn) return;
      if (isLoading) {
        btn.dataset.originalText = originalText || btn.textContent || "Send";
        btn.textContent = "Sending...";
        btn.disabled = true;
      } else {
        btn.textContent = btn.dataset.originalText || originalText || "Send";
        btn.disabled = false;
      }
    }

    function showNotification(message, type) {
      const existing = document.querySelector(".notification");
      if (existing) existing.remove();

      const notification = document.createElement("div");
      notification.className = `notification notification-${type}`;
      notification.textContent = message;

      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 90%;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      `;

      if (type === "success") notification.style.backgroundColor = "#10b981";
      if (type === "error") notification.style.backgroundColor = "#ef4444";

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease-out forwards";
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    }

    // Add notification keyframes once
    if (!document.getElementById("notif-animations")) {
      const style = document.createElement("style");
      style.id = "notif-animations";
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    if (contactForm && !contactForm.dataset.boundEmailjs) {
      contactForm.dataset.boundEmailjs = "true";

      contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = (formData.get("name") || "").toString().trim();
        const email = (formData.get("email") || "").toString().trim();
        const subject = (formData.get("subject") || "").toString().trim();
        const message = (formData.get("message") || "").toString().trim();

        if (!name || !email || !subject || !message) {
          showNotification("Please fill in all required fields.", "error");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showNotification("Please enter a valid email address.", "error");
          return;
        }

        const token =
          document.querySelector('input[name="cf-turnstile-response"]')?.value || "";

        if (!token) {
          showNotification("Please complete the captcha.", "error");
          return;
        }

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : "Send";

        try {
          setButtonLoading(submitButton, true, originalText);

          await initEmailJS();

          const ownerParams = {
            to_email: "info@mavagutech.com",
            from_name: name,
            reply_to: email,
            subject,
            message,
          };

          const userParams = {
            to_email: email,
            from_name: name,
            subject,
          };

          await window.emailjs.send(
            EMAILJS_SERVICE_ID,
            TEMPLATE_ID_OWNER,
            ownerParams
          );
          await window.emailjs.send(
            EMAILJS_SERVICE_ID,
            TEMPLATE_ID_THANKS,
            userParams
          );

          showNotification("Thank you! Your message has been sent.", "success");
          contactForm.reset();
        } catch (err) {
          console.error(err);
          showNotification(
            "Sorry — something went wrong. Please try again.",
            "error"
          );
        } finally {
          setButtonLoading(submitButton, false, originalText);
        }
      });
    }

    /* =========================
       Intersection Observer animations
       - uses classes that exist in your HTML
       - avoids dead selector .contact-item
    ========================== */
    const animatedElements = document.querySelectorAll(
      ".service-card, .contact-method, .team-card, .service-detail-card"
    );

    if (animatedElements.length) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target); // animate once
          }
        });
      }, observerOptions);

      animatedElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        observer.observe(el);
      });
    }
  });
})();
