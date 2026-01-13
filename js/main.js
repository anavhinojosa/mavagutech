// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle mobile menu
  navToggle.addEventListener('click', function () {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

  // Close mobile menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function (e) {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    }
  });

  // Smooth scroll for navigation links (ignore plain "#")
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = targetElement.offsetTop - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Navbar shadow on scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function () {
    navbar.style.boxShadow =
      window.scrollY > 50
        ? '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        : '0 1px 2px 0 rgb(0 0 0 / 0.05)';
  });

  // Contact form handling (EmailJS)
  const contactForm = document.getElementById('contactForm');

  // === EmailJS CONFIG (replace these 3 values) ===
  const EMAILJS_PUBLIC_KEY = 'Dix7lm4DQPSv9IOOc';
  const EMAILJS_SERVICE_ID = 'service_0888kdg';
  const EMAILJS_TEMPLATE_ID = 'template_5o0awyi';

  // Load EmailJS SDK if it isn't already loaded (keeps setup simple)
  function loadEmailJSSDK() {
    return new Promise((resolve, reject) => {
      if (window.emailjs) return resolve();

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load EmailJS SDK.'));
      document.head.appendChild(script);
    });
  }

  async function initEmailJS() {
    await loadEmailJSSDK();
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const subject = (formData.get('subject') || '').toString().trim();
      const message = (formData.get('message') || '').toString().trim();

      // Basic validation
      if (!name || !email || !subject || !message) {
        showNotification('Please fill in all fields.', 'error');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;

      try {
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        // Init EmailJS once per page load
        if (!window.__emailjsReady) {
          await initEmailJS();
          window.__emailjsReady = true;
        }

        // Map to your EmailJS template variables
        const templateParams = {
          to_email: "mavagutech@gmail.com",
          from_name: name,
          reply_to: email,
          subject: subject,
          message: message
        };

        await window.emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams
        );

        showNotification('Thank you! Your message has been sent.', 'success');
        contactForm.reset();
      } catch (err) {
        console.error(err);
        showNotification('Sorry — something went wrong. Please try again.', 'error');
      } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }
    });
  }

  // Notification function
  function showNotification(message, type) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
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

    if (type === 'success') notification.style.backgroundColor = '#10b981';
    if (type === 'error') notification.style.backgroundColor = '#ef4444';

    document.body.appendChild(notification);

    setTimeout(function () {
      notification.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(function () {
        notification.remove();
      }, 300);
    }, 5000);
  }

  // Add animation keyframes dynamically
  const style = document.createElement('style');
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

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.service-card, .contact-item');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
});
