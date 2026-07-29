document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile Navigation Toggle ---
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileNavMenu");
  const mobileMenuClose = document.getElementById("mobileMenuClose");

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      mobileMenu.classList.add("active");
    });

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
      });
    }

    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove("active");
      }
    });
  }

  // --- FAQ Accordion Logic ---
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const faqItem = question.closest(".faq-item");
      const isOpen = faqItem.classList.contains("active");

      // Close all other FAQ items
      document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active");
      });

      // Toggle current item
      if (!isOpen) {
        faqItem.classList.add("active");
      }
    });
  });

  // --- Interactive Roadmap Tab Switcher ---
  const tabButtons = document.querySelectorAll(".track-tab-btn");
  const tabContents = document.querySelectorAll(".track-content");

  if (tabButtons.length > 0) {
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all buttons
        tabButtons.forEach((b) => {
          b.classList.remove("active", "bg-primary", "text-on-primary", "shadow-md", "shadow-primary/20");
          b.classList.add("bg-transparent", "text-on-surface-variant");
        });

        // Hide all track preview contents
        tabContents.forEach((c) => c.classList.remove("active"));

        // Add active class to clicked tab
        btn.classList.add("active", "bg-primary", "text-on-primary", "shadow-md", "shadow-primary/20");
        btn.classList.remove("bg-transparent", "text-on-surface-variant");

        // Show corresponding content panel
        const targetId = `track-${btn.dataset.track}`;
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add("active");
        }
      });
    });
  }

  // --- Features Section Visual Interactions ---
  const featureCards = document.querySelectorAll(".features-showcase [data-feature-card]");

  if (featureCards.length > 0) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointerEnabled = () => window.innerWidth > 900 && !prefersReducedMotion;

    featureCards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 90}ms`;

      card.addEventListener("mousemove", (event) => {
        if (!pointerEnabled()) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--mx", "50%");
        card.style.setProperty("--my", "50%");
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.25 }
    );

    featureCards.forEach((card) => observer.observe(card));
  }

  // --- Collaborator Welcome Modal Logic ---
  const collabModal = document.getElementById("collabModal");
  const closeCollabModal = document.getElementById("closeCollabModal");
  const dismissCollabModal = document.getElementById("dismissCollabModal");
  const collabGithubBtn = document.getElementById("collabGithubBtn");

  if (collabModal) {
    const isDismissed = localStorage.getItem("cc_dismiss_collab_popup");

    if (!isDismissed) {
      setTimeout(() => {
        collabModal.classList.add("active");
      }, 1500);
    }

    const hideModal = (storeDismissal = false) => {
      collabModal.classList.remove("active");
      if (storeDismissal) {
        localStorage.setItem("cc_dismiss_collab_popup", "true");
      }
    };

    if (closeCollabModal) {
      closeCollabModal.addEventListener("click", () => hideModal(false));
    }

    if (dismissCollabModal) {
      dismissCollabModal.addEventListener("click", () => hideModal(true));
    }

    if (collabGithubBtn) {
      collabGithubBtn.addEventListener("click", () => hideModal(true));
    }

    collabModal.addEventListener("click", (e) => {
      if (e.target === collabModal) {
        hideModal(false);
      }
    });
  }

  // --- Cookie Consent Banner Logic ---
  const cookieBanner = document.getElementById("cookieConsentBanner");
  const acceptCookiesBtn = document.getElementById("acceptCookiesBtn");
  const declineCookiesBtn = document.getElementById("declineCookiesBtn");

  if (cookieBanner) {
    const isConsentGiven = localStorage.getItem("cc_cookie_consent");

    if (!isConsentGiven) {
      setTimeout(() => {
        cookieBanner.classList.add("active");
      }, 2000);
    }

    if (acceptCookiesBtn) {
      acceptCookiesBtn.addEventListener("click", () => {
        cookieBanner.classList.remove("active");
        localStorage.setItem("cc_cookie_consent", "accepted");
      });
    }

    if (declineCookiesBtn) {
      declineCookiesBtn.addEventListener("click", () => {
        cookieBanner.classList.remove("active");
        localStorage.setItem("cc_cookie_consent", "declined");
      });
    }
  }

  // --- AI Agent Offline Modal Logic ---
  const aiAgentFloatingBtn = document.getElementById("aiAgentFloatingBtn");
  const aiAgentModal = document.getElementById("aiAgentModal");
  const closeAiAgentModal = document.getElementById("closeAiAgentModal");
  const dismissAiAgentModal = document.getElementById("dismissAiAgentModal");

  if (aiAgentModal && aiAgentFloatingBtn) {
    aiAgentFloatingBtn.addEventListener("click", () => {
      aiAgentModal.classList.add("active");
    });

    const hideAiModal = () => {
      aiAgentModal.classList.remove("active");
    };

    if (closeAiAgentModal) {
      closeAiAgentModal.addEventListener("click", hideAiModal);
    }

    if (dismissAiAgentModal) {
      dismissAiAgentModal.addEventListener("click", hideAiModal);
    }

    aiAgentModal.addEventListener("click", (e) => {
      if (e.target === aiAgentModal) {
        hideAiModal();
      }
    });
  }

  // --- Scroll Reveal Animation ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add stagger delay for feature cards
          const delay = entry.target.style.animationDelay || '0s';
          const delayMs = parseFloat(delay) * 1000;
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delayMs);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
    observer.observe(el);
  });

  // --- Micro-interactions for buttons ---
  document.querySelectorAll("button, .btn-interactive").forEach((button) => {
    button.addEventListener("mousedown", () => {
      button.style.transform = "scale(0.97)";
    });
    button.addEventListener("mouseup", () => {
      button.style.transform = "scale(1.02)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)";
    });
  });
});
