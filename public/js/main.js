document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile Navigation Menu Toggle ---
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");

      // Update hamburger icon
      const icon = navToggle.querySelector("i");
      if (navMenu.classList.contains("active")) {
        icon.className = "fa-solid fa-xmark";
      } else {
        icon.className = "fa-solid fa-bars";
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove("active");
        const icon = navToggle.querySelector("i");
        if (icon) icon.className = "fa-solid fa-bars";
      }
    });
  }

  // --- FAQ Accordion Logic ---
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const faqItem = question.parentElement;
      const isOpen = faqItem.classList.contains("active");

      // Close all other FAQ items
      document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active");
        const icon = item.querySelector(".faq-chevron");
        if (icon) icon.className = "fa-solid fa-chevron-down faq-chevron";
      });

      // Toggle current item
      if (!isOpen) {
        faqItem.classList.add("active");
        const icon = question.querySelector(".faq-chevron");
        if (icon) icon.className = "fa-solid fa-chevron-up faq-chevron";
      }
    });
  });

  // --- Alert Close Action ---
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alert) => {
    // Add close button dynamically
    const closeBtn = document.createElement("button");
    closeBtn.className = "alert-close-btn";
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    closeBtn.style.background = "none";
    closeBtn.style.border = "none";
    closeBtn.style.color = "inherit";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.marginLeft = "auto";
    closeBtn.style.padding = "0 0 0 10px";
    closeBtn.setAttribute("aria-label", "Dismiss Alert");

    alert.appendChild(closeBtn);

    closeBtn.addEventListener("click", () => {
      alert.style.opacity = "0";
      alert.style.transform = "translateY(-10px)";
      alert.style.transition = "all 0.3s ease";
      setTimeout(() => {
        alert.remove();
      }, 300);
    });
  });
  // --- Interactive Roadmap Tab Switcher ---
  const tabButtons = document.querySelectorAll(".track-tab-btn");
  const tabContents = document.querySelectorAll(".track-content");

  if (tabButtons.length > 0) {
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all buttons
        tabButtons.forEach((b) => b.classList.remove("active"));
        // Hide all track preview contents
        tabContents.forEach((c) => c.classList.remove("active"));

        // Add active class to clicked tab
        btn.classList.add("active");
        // Show corresponding content panel
        const targetId = `track-${btn.dataset.track}`;
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add("active");
        }
      });
    });
  }

  // Dashboard Semester Tab Switcher
  const semBtns = document.querySelectorAll(".sem-tab-btn");
  if (semBtns.length > 0) {
    semBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Deactivate all buttons
        semBtns.forEach((b) => b.classList.remove("active"));
        // Activate current button
        btn.classList.add("active");

        // Hide all panes
        const panes = document.querySelectorAll(".semester-pane");
        panes.forEach((pane) => pane.classList.remove("active"));

        // Show target pane
        const targetId = `sem-pane-${btn.dataset.sem}`;
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.add("active");
        }
      });
    });
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
      }, 1000);
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
      cookieBanner.classList.add("active");
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

  // --- Dashboard Tabs Logic ---
  const dbTabBtns = document.querySelectorAll(".db-tab-btn");
  const dbTabPanes = document.querySelectorAll(".db-tab-pane");

  if (dbTabBtns.length > 0) {
    dbTabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        dbTabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        dbTabPanes.forEach((pane) => pane.classList.remove("active"));
        const targetId = `db-pane-${btn.dataset.tab}`;
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.add("active");
        }
      });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get("tab");
    if (activeTab) {
      const targetBtn = document.querySelector(
        `.db-tab-btn[data-tab="${activeTab}"]`,
      );
      if (targetBtn) {
        targetBtn.click();
      }
    }
  }

  // --- Personalized Study Planner / Time-Boxing Logic ---
  const toggleButtons = document.querySelectorAll(".toggle-planner-btn");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const playlistId = btn.dataset.playlistId;
      const panel = document.getElementById(`planner-${playlistId}`);
      if (!panel) return;

      const isHidden = window.getComputedStyle(panel).display === "none";
      if (isHidden) {
        panel.style.display = "block";
        btn.classList.add("btn-primary");
        btn.classList.remove("btn-secondary");
        btn.innerHTML =
          '<i class="fa-solid fa-clock-rotate-left"></i> Hide Plan';
        // Run initial calculation when opened
        calculateStudyPlan(panel);
      } else {
        panel.style.display = "none";
        btn.classList.remove("btn-primary");
        // Check if there is an active saved plan to decide styling
        const playlistTitle = panel.dataset.title;
        const savedHours = localStorage.getItem(
          `cc_study_hours_${playlistTitle}`,
        );
        if (savedHours) {
          btn.classList.add("btn-secondary");
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Plan Active';
          btn.style.borderColor = "var(--success)";
          btn.style.color = "var(--success)";
        } else {
          btn.classList.add("btn-secondary");
          btn.innerHTML = '<i class="fa-solid fa-clock"></i> Plan Study';
          btn.style.borderColor = "";
          btn.style.color = "";
        }
      }
    });
  });

  // Calculate and update the UI details

  function calculateStudyPlan(panel) {
    console.log("calculateStudyPlan called");
    const remainingHoursEl = panel.querySelector(".remaining-hours");
    const durationStr = panel.dataset.durationStr;
    const title = panel.dataset.title;
    const slider = panel.querySelector(".study-hours-slider");
    const displayValue = panel.querySelector(".slider-value-display");
    const parsedHoursEl = panel.querySelector(".parsed-hours");
    const estDaysEl = panel.querySelector(".est-days");
    const estFinishEl = panel.querySelector(".est-finish");
    const milestoneList = panel.querySelector(".milestone-list");
    const badge = panel.querySelector(".plan-status-badge");
    const startDateInput = panel.querySelector(".study-start-date");
    const progressFill = panel.querySelector(".study-progress-fill");
    if (startDateInput && !startDateInput.value) {
      startDateInput.value = new Date().toISOString().split("T")[0];
    }
    const progressText = panel.querySelector(".study-progress-text");
    console.log({
      durationStr,
      title,
      slider,
      displayValue,
      parsedHoursEl,
      estDaysEl,
      estFinishEl,
      milestoneList,
      badge,
      startDateInput,
    });
    if (!slider) return;

    // Parse duration string to numeric hours
    const match = durationStr.match(/(\d+)/);
    const totalHours = match ? parseInt(match[1], 10) : 10;

    // Update estimated length
    parsedHoursEl.textContent = `${totalHours} hours`;
    if (remainingHoursEl) {
      remainingHoursEl.textContent = `${totalHours} hours`;
    }

    // Get daily study hours from slider
    const dailyHours = parseFloat(slider.value);

    displayValue.textContent = `${dailyHours} ${dailyHours === 1 ? "hour" : "hours"} / day`;

    // Calculate completion days
    const totalDays = Math.ceil(totalHours / dailyHours);

    estDaysEl.textContent = totalDays;
    const completedDays = parseInt(
      localStorage.getItem(`cc_completed_days_${title}`) || "0",
      10,
    );

    const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }

    if (progressText) {
      if (completedDays === totalDays && totalDays > 0) {
        progressText.textContent = "🎉 Study Plan Completed!";
      } else {
        progressText.textContent = `${completedDays}/${totalDays} days completed`;
      }
    }
    // Calculate target date
    let targetDate = new Date();

    if (startDateInput && startDateInput.value) {
      targetDate = new Date(startDateInput.value + "T00:00:00");
    }

    targetDate.setDate(targetDate.getDate() + totalDays);

    const dateOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    estFinishEl.textContent = targetDate.toLocaleDateString(
      "en-US",
      dateOptions,
    );

    // Generate custom milestones based on the title
    const cleanTitle = title
      .replace(/Tutorial|Course|for Beginners|Beginners/gi, "")
      .trim();
    milestoneList.innerHTML = "";

    let milestones = [];
    if (totalDays === 1) {
      milestones.push(
        `Watch the complete <strong>${cleanTitle}</strong> lectures. Code along to establish primary muscle memory.`,
      );
    } else if (totalDays === 2) {
      milestones.push(
        `<strong>Day 1</strong>: Watch the first half. Focus on installation, tool config, and basic code patterns.`,
      );
      milestones.push(
        `<strong>Day 2</strong>: Finish the course. Tackle advanced modules and build a quick sandbox app to test ideas.`,
      );
    } else if (totalDays === 3) {
      milestones.push(
        `<strong>Day 1</strong>: Set up the workspace. Complete fundamental lessons and setup scripts.`,
      );
      milestones.push(
        `<strong>Day 2</strong>: Work on intermediate techniques, logic flows, and code exercises.`,
      );
      milestones.push(
        `<strong>Day 3</strong>: Complete advanced features, debugging patterns, and outline a capstone module.`,
      );
    } else if (totalDays === 4) {
      milestones.push(
        `<strong>Day 1</strong>: Lay basic groundwork and introductory setup.`,
      );
      milestones.push(
        `<strong>Day 2</strong>: Complete core syntax lessons and small practice programs.`,
      );
      milestones.push(
        `<strong>Day 3</strong>: Explore intermediate structures, secondary APIs, and coding loops.`,
      );
      milestones.push(
        `<strong>Day 4</strong>: Study performance reviews, watch remaining modules, and finalize portfolio code.`,
      );
    } else {
      const part = Math.floor(totalDays / 3);
      milestones.push(
        `<strong>Days 1 to ${part}</strong>: Foundations. Learn concepts, basic structures, and complete configuration.`,
      );
      milestones.push(
        `<strong>Days ${part + 1} to ${totalDays - part}</strong>: Build phase. Follow coding demonstrations and write exercise logic.`,
      );
      milestones.push(
        `<strong>Days ${totalDays - part + 1} to ${totalDays}</strong>: Master phase. Tackle optimization, project finalization, and review docs.`,
      );
    }

    milestones.forEach((item) => {
      const li = document.createElement("li");
      li.style.marginBottom = "6px";
      li.innerHTML = item;
      milestoneList.appendChild(li);
    });

    // Check if the current slider value is the saved one to show the status badge
    const savedHours = localStorage.getItem(`cc_study_hours_${title}`);
    if (savedHours && parseFloat(savedHours) === dailyHours) {
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  // Handle slider inputs
  const sliders = document.querySelectorAll(".study-hours-slider");
  sliders.forEach((slider) => {
    slider.addEventListener("input", (e) => {
      const panel = e.target.closest(".planner-panel");
      if (panel) calculateStudyPlan(panel);
    });
  });
  const startDateInputs = document.querySelectorAll(".study-start-date");

  startDateInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      const panel = e.target.closest(".planner-panel");

      if (panel) {
        calculateStudyPlan(panel);
      }
    });
  });
  // Handle saving the plan
  const completeBtns = document.querySelectorAll(".complete-day-btn");

  completeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".planner-panel");

      if (!panel) return;

      const title = panel.dataset.title;

      const totalDays = parseInt(
        panel.querySelector(".est-days").textContent,
        10,
      );

      let completedDays = parseInt(
        localStorage.getItem(`cc_completed_days_${title}`) || "0",
        10,
      );

      if (completedDays < totalDays) {
        completedDays++;
      }

      localStorage.setItem(`cc_completed_days_${title}`, completedDays);

      calculateStudyPlan(panel);
    });
  });
  const savePlanBtns = document.querySelectorAll(".save-plan-btn");
  savePlanBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".planner-panel");
      if (!panel) return;

      const title = panel.dataset.title;
      const slider = panel.querySelector(".study-hours-slider");
      const dailyHours = slider.value;

      localStorage.setItem(`cc_study_hours_${title}`, dailyHours);
      localStorage.setItem(`cc_completed_days_${title}`, "0");
      const startDateInput = panel.querySelector(".study-start-date");

      if (startDateInput) {
        localStorage.setItem(`cc_study_date_${title}`, startDateInput.value);
      }

      const badge = panel.querySelector(".plan-status-badge");
      if (badge) {
        badge.style.display = "inline-block";
        badge.style.animation = "heroFadeInUp 0.3s ease";
      }

      // Update toggle button text/state
      const playlistId = panel.id.replace("planner-", "");
      const toggleBtn = document.querySelector(
        `.toggle-planner-btn[data-playlist-id="${playlistId}"]`,
      );
      if (toggleBtn) {
        toggleBtn.style.borderColor = "var(--success)";
        toggleBtn.style.color = "var(--success)";
      }
    });
  });

  // Handle exporting the plan to Markdown
  const exportPlanBtns = document.querySelectorAll(".export-plan-btn");
  exportPlanBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".planner-panel");
      if (!panel) return;

      const title = panel.dataset.title;
      const channel = panel.dataset.channel;
      const durationStr = panel.dataset.durationStr;
      const slider = panel.querySelector(".study-hours-slider");
      const dailyHours = parseFloat(slider.value);
      const totalDays = panel.querySelector(".est-days").textContent;
      const finishDate = panel.querySelector(".est-finish").textContent;
      const milestoneItems = panel.querySelectorAll(".milestone-list li");

      let markdown = `# Study Plan: ${title}\n`;
      markdown += `* **Instructor/Channel:** ${channel}\n`;
      markdown += `* **Total Estimated Length:** ${durationStr}\n`;
      markdown += `* **Daily Commitment:** ${dailyHours} ${dailyHours === 1 ? "hour" : "hours"}/day\n`;
      markdown += `* **Timeline:** ${totalDays} days (Target Completion: ${finishDate})\n\n`;
      markdown += `## 📅 Day-by-Day Learning Roadmap\n\n`;

      milestoneItems.forEach((item) => {
        // Strip HTML tags for clean Markdown formatting
        const text = item.innerText || item.textContent;
        markdown += `- ${text}\n`;
      });

      markdown += `\n---\n*Generated by Campus Compass Study Planner on ${new Date().toLocaleDateString()}. Make it happen!*`;

      // Download file client-side
      const blob = new Blob([markdown], {
        type: "text/markdown;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const fileSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      link.setAttribute("download", `study-plan-${fileSlug}.md`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  // Load saved planner settings on startup
  const allPlanners = document.querySelectorAll(".planner-panel");
  allPlanners.forEach((panel) => {
    const title = panel.dataset.title;

    const savedHours = localStorage.getItem(`cc_study_hours_${title}`);

    const savedDate = localStorage.getItem(`cc_study_date_${title}`);

    const slider = panel.querySelector(".study-hours-slider");

    const startDateInput = panel.querySelector(".study-start-date");

    if (savedHours && slider) {
      slider.value = savedHours;
    }

    if (savedDate && startDateInput) {
      startDateInput.value = savedDate;
    }

    calculateStudyPlan(panel);

    if (savedHours) {
      const playlistId = panel.id.replace("planner-", "");

      const toggleBtn = document.querySelector(
        `.toggle-planner-btn[data-playlist-id="${playlistId}"]`,
      );

      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-check"></i> Plan Active';

        toggleBtn.style.borderColor = "var(--success)";

        toggleBtn.style.color = "var(--success)";
      }
    }
  });
});
// Global function to toggle social connection forms in the dashboard sidebar
function toggleConnectForm(platform) {
  const form = document.getElementById(`connect-form-${platform}`);
  if (form) {
    if (form.style.display === "none" || form.style.display === "") {
      form.style.display = "block";
      // Auto focus the input field inside
      const input = form.querySelector("input");
      if (input) input.focus();
    } else {
      form.style.display = "none";
    }
  }
}

// Global function to toggle peer statistics cards on the social directory page
function toggleStudentSocialStats(studentId, platform) {
  // Hide all panels for this student first to avoid overlapping
  const panels = document.querySelectorAll(
    `[id^="social-stats-${studentId}-"]`,
  );
  const targetId = `social-stats-${studentId}-${platform}`;
  const targetPanel = document.getElementById(targetId);

  if (targetPanel) {
    const isShowing = targetPanel.style.display === "block";
    panels.forEach((p) => (p.style.display = "none"));
    if (!isShowing) {
      targetPanel.style.display = "block";
    }
  }
}
