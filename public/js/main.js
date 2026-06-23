document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Navigation Menu Toggle ---
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      // Update hamburger icon
      const icon = navToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        const icon = navToggle.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      }
    });
  }

  // --- FAQ Accordion Logic ---
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const isOpen = faqItem.classList.contains('active');

      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        const icon = item.querySelector('.faq-chevron');
        if (icon) icon.className = 'fa-solid fa-chevron-down faq-chevron';
      });

      // Toggle current item
      if (!isOpen) {
        faqItem.classList.add('active');
        const icon = question.querySelector('.faq-chevron');
        if (icon) icon.className = 'fa-solid fa-chevron-up faq-chevron';
      }
    });
  });

  // --- Alert Close Action ---
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    // Add close button dynamically
    const closeBtn = document.createElement('button');
    closeBtn.className = 'alert-close-btn';
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'inherit';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = 'auto';
    closeBtn.style.padding = '0 0 0 10px';
    closeBtn.setAttribute('aria-label', 'Dismiss Alert');
    
    alert.appendChild(closeBtn);

    closeBtn.addEventListener('click', () => {
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      alert.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        alert.remove();
      }, 300);
    });
  });
  // --- Interactive Roadmap Tab Switcher ---
  const tabButtons = document.querySelectorAll('.track-tab-btn');
  const tabContents = document.querySelectorAll('.track-content');

  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        tabButtons.forEach(b => b.classList.remove('active'));
        // Hide all track preview contents
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab
        btn.classList.add('active');
        // Show corresponding content panel
        const targetId = `track-${btn.dataset.track}`;
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  // Dashboard Semester Tab Switcher
  const semBtns = document.querySelectorAll('.sem-tab-btn');
  if (semBtns.length > 0) {
    semBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Deactivate all buttons
        semBtns.forEach(b => b.classList.remove('active'));
        // Activate current button
        btn.classList.add('active');

        // Hide all panes
        const panes = document.querySelectorAll('.semester-pane');
        panes.forEach(pane => pane.classList.remove('active'));

        // Show target pane
        const targetId = `sem-pane-${btn.dataset.sem}`;
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });
  }
});

// Global function to toggle social connection forms in the dashboard sidebar
function toggleConnectForm(platform) {
  const form = document.getElementById(`connect-form-${platform}`);
  if (form) {
    if (form.style.display === 'none' || form.style.display === '') {
      form.style.display = 'block';
      // Auto focus the input field inside
      const input = form.querySelector('input');
      if (input) input.focus();
    } else {
      form.style.display = 'none';
    }
  }
}

// Global function to toggle peer statistics cards on the social directory page
function toggleStudentSocialStats(studentId, platform) {
  // Hide all panels for this student first to avoid overlapping
  const panels = document.querySelectorAll(`[id^="social-stats-${studentId}-"]`);
  const targetId = `social-stats-${studentId}-${platform}`;
  const targetPanel = document.getElementById(targetId);
  
  if (targetPanel) {
    const isShowing = targetPanel.style.display === 'block';
    panels.forEach(p => p.style.display = 'none');
    if (!isShowing) {
      targetPanel.style.display = 'block';
    }
  }
}
