document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     NAV: Mobile menu toggle
  ========================== */
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  if (navToggle && navMenu) {
    // Toggle menu (pointerdown for iOS Safari reliability)
    navToggle.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
    });

    // Close menu when a link is clicked (mobile UX)
    navLinks.forEach((link) => {
      link.addEventListener("pointerdown", () => {
        navMenu.classList.remove("active");
        navToggle.classList.remove("active");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove("active");
        navToggle.classList.remove("active");
      }
    });
  }

  /* =========================
     Smooth scroll (same-page anchors only)
     - ignores plain "#"
     - ignores links to other pages
  ========================== */
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();

      const navbar = document.querySelector(".navbar");
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = targetElement.offsetTop - navbarHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    });
  });

  /* =========================
     Navbar shadow on scroll
  ========================== */
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.style.boxShadow =
        window.scrollY > 50
          ? "0 4px 6px -1px rgb(0 0 0 / 0.1)"
          : "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    });
  }

  /* =========================
     Contact form (EmailJS)
  ========================== */
  const contactForm = document.getElementById("contactForm");

  // === EmailJS CONFIG (your values) ===
  const EMAILJS_PUBLIC_KEY = "Dix7lm4DQPSv9IOOc";
  const EMAILJS_SERVICE_ID = "service_0888kdg";
  const TEMPLATE_ID_OWNER = "template_l6tuv2t";  // owner
  const TEMPLATE_ID_THANKS = "template_5o0awyi"; // thank-you

  // Load EmailJS SDK if it isn't already loaded
  function loadEmailJSSDK() {
    return new Promise((resolve, reject) => {
      if (window.emailjs) return resolve();

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load EmailJS SDK."));
      document.head.appendChild(script);
    });
  }

  async function initEmailJS() {
    await loadEmailJSSDK();
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const name = (formData.get("name") || "").toString().trim();
      const email = (formData.get("email") || "").toString().trim();
      const subject = (formData.get("subject") || "").toString().trim();
      const message = (formData.get("message") || "").toString().trim();

      // Basic validation
      if (!name || !email || !subject || !message) {
        showNotification("Please fill in all fields.", "error");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification("Please enter a valid email address.", "error");
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton ? submitButton.textContent : "Send";

      try {
        if (submitButton) {
          submitButton.textContent = "Sending...";
          submitButton.disabled = true;
        }

        // Init EmailJS once per page load
        if (!window.__emailjsReady) {
          await initEmailJS();
          window.__emailjsReady = true;
        }

        // Params for the email YOU receive
        const ownerParams = {
          to_email: "anavhinojosa0@gmail.com",
          from_name: name,
          reply_to: email,
          subject: subject,
          message: message,
        };

        // Params for the THANK-YOU email the USER receives
        const userParams = {
          to_email: email,
          from_name: name,
          subject: subject,
        };

        // Send email to you (owner notification)
        await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_ID_OWNER, ownerParams);

        // Send confirmation email to the user
        await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_ID_THANKS, userParams);

        showNotification("Thank you! Your message has been sent.", "success");
        contactForm.reset();
      } catch (err) {
        console.error(err);
        showNotification("Sorry — something went wrong. Please try again.", "error");
      } finally {
        if (submitButton) {
          submitButton.textContent = originalText;
          submitButton.disabled = false;
        }
      }
    });
  }

  // Notification function
  function showNotification(message, type) {
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) existingNotification.remove();

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
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }

  // Add animation keyframes dynamically (only once)
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

  /* =========================
     Intersection Observer animations
  ========================== */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(".service-card, .contact-item");
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    observer.observe(el);
  });
});
