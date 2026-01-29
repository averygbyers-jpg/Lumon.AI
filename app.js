// app.js
(function () {
  // -----------------------------
  // Element references
  // -----------------------------
  const onboardingScreen = document.getElementById("onboarding-screen") || document.getElementById("screen-welcome");
  const chatScreen = document.getElementById("chat-screen") || document.getElementById("screen-chat");
  const chatInputBar = document.getElementById("chat-input-bar") || document.querySelector(".chat-form-wrapper");
  const userInput = document.getElementById("user-input");
  const chatLog = document.getElementById("chat-log") || document.getElementById("chat-messages");
  const nameInput = document.getElementById("onboard-name") || document.getElementById("user-name-input");
  const expButtons = document.querySelectorAll(".pill-toggle[data-exp]");
  const onboardContinueBtn = document.getElementById("onboard-continue") || document.getElementById("btn-problem-next");

  // Compatibility: new onboarding flow screens (screen-welcome -> screen-setup -> screen-chat)
  const screenWelcome = document.getElementById("screen-welcome");
  const screenSetup = document.getElementById("screen-setup");
  const screenChat = document.getElementById("screen-chat");
  const btnNameNext = document.getElementById("btn-name-next");
  const btnProblemNext = document.getElementById("btn-problem-next");
  const problemInput = document.getElementById("problem-input");

  // Multi-step onboarding flow
  const onboardStep1 = document.getElementById("onboard-step-1");
  const onboardStep2 = document.getElementById("onboard-step-2");
  const onboardStep3 = document.getElementById("onboard-step-3");
  const onboardNext1 = document.getElementById("onboard-next-1");
  const onboardBack2 = document.getElementById("onboard-back-2");
  const onboardNext2 = document.getElementById("onboard-next-2");
  const onboardBack3 = document.getElementById("onboard-back-3");

  function showOnboardStep(step) {
    [onboardStep1, onboardStep2, onboardStep3].forEach(s => {
      if (s) s.classList.add("hidden");
    });
    if (step === 1 && onboardStep1) onboardStep1.classList.remove("hidden");
    if (step === 2 && onboardStep2) onboardStep2.classList.remove("hidden");
    if (step === 3 && onboardStep3) onboardStep3.classList.remove("hidden");
  }

  // Step 1 -> Step 2
  if (onboardNext1) {
    onboardNext1.addEventListener("click", () => {
      showOnboardStep(2);
    });
  }

  // Step 2 -> Step 3
  if (onboardNext2) {
    onboardNext2.addEventListener("click", () => {
      showOnboardStep(3);
    });
  }

  // Step 2 -> Step 1 (back)
  if (onboardBack2) {
    onboardBack2.addEventListener("click", () => {
      showOnboardStep(1);
    });
  }

  // Step 3 -> Step 2 (back)
  if (onboardBack3) {
    onboardBack3.addEventListener("click", () => {
      showOnboardStep(2);
    });
  }

  // Learn More toggle on splash screen
  const learnMoreToggle = document.getElementById("learn-more-toggle");
  const learnMoreContent = document.getElementById("learn-more-content");

  if (learnMoreToggle && learnMoreContent) {
    learnMoreToggle.addEventListener("click", () => {
      const isHidden = learnMoreContent.classList.contains("hidden");
      if (isHidden) {
        learnMoreContent.classList.remove("hidden");
        learnMoreToggle.textContent = "Hide Details";
        learnMoreToggle.classList.add("active");
      } else {
        learnMoreContent.classList.add("hidden");
        learnMoreToggle.textContent = "Learn More About Lumon";
        learnMoreToggle.classList.remove("active");
      }
    });
  }

  function setActiveScreen(screenEl) {
    const screens = document.querySelectorAll(".screen");
    screens.forEach((s) => s.classList.remove("active"));
    if (screenEl) screenEl.classList.add("active");
    
    // Manage onboarding-active class based on which screen is showing
    const isOnboardingScreen = screenEl && (
      screenEl.id === "screen-welcome" || 
      screenEl.id === "screen-setup" || 
      screenEl.id === "onboarding-screen"
    );
    
    if (isOnboardingScreen) {
      document.body.classList.add("onboarding-active");
    } else {
      document.body.classList.remove("onboarding-active");
    }
  }

  // Screen 1 -> Screen 2
  if (btnNameNext) {
    btnNameNext.addEventListener("click", (e) => {
      e.preventDefault();
      // Save the name early so it persists even if the user refreshes
      if (nameInput) {
        profile.name = (nameInput.value || "").trim() || "Friend";
        saveProfileToStorage();
        updateProfileUI();
      }
      setActiveScreen(screenSetup || document.getElementById("screen-setup"));
    });
  }

  // Screen 2 -> Chat (Screen 3)
  if (btnProblemNext) {
    btnProblemNext.addEventListener("click", (e) => {
      e.preventDefault();
      // Ensure profile exists
      profile.name = (nameInput?.value || profile.name || "").trim() || "Friend";
      saveProfileToStorage();
      updateProfileUI();

      setActiveScreen(screenChat || document.getElementById("screen-chat"));

      // Open sidebar automatically when entering chat
      setSidebar(true);

      // Use the setup text as the first message (as your UI says)
      const firstMsg = (problemInput?.value || "").trim();
      if (firstMsg) {
        // Put it into the real chat input and send
        if (userInput) userInput.value = firstMsg;
        // Clear setup box
        if (problemInput) problemInput.value = "";
        // Trigger your existing send flow
        try {
          handleSend();
        } catch (_) {
          // If handleSend isn't in scope yet, fall back to clicking send button / submit
          if (sendButton) sendButton.click();
          const form = document.getElementById("chat-form");
          if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }
      }
    });
  }


  // Sidebar + sessions
  const sidebarHandle = document.getElementById("sidebar-handle");
  const sidebarIcon = document.querySelector(".sidebar-handle-icon");
  const conversationListEl = document.getElementById("conversation-list");
  const newChatBtn = document.getElementById("new-chat-btn");

  // Sidebar footer buttons
  const sidebarSettingsBtn = document.getElementById("sidebar-settings-btn");
  const sidebarArchiveBtn = document.getElementById("sidebar-archive-btn");
  const sidebarTrashBtn = document.getElementById("sidebar-trash-btn");

  // Profile
  const profileBtn = document.getElementById("profile-btn");
  const profilePanel = document.getElementById("profile-panel");
  const profileNameInput = document.getElementById("profile-name-input");
  const profileChipName = document.getElementById("profile-chip-name");
  const profileAvatarInitial = document.getElementById("profile-avatar-initial");
  const profileAvatarLargeInitial = document.getElementById(
    "profile-avatar-large-initial"
  );
  const profileDeleteAccountBtn = document.getElementById(
    "profile-delete-account-btn"
  );

  // Settings panel (separate from profile)
  const settingsPanel = document.getElementById("settings-panel");
  const settingsThemeButtons = document.querySelectorAll(".settings-theme-btn");
  const notifEmailCheckbox = document.getElementById("notif-email");
  const notifDesktopCheckbox = document.getElementById("notif-desktop");

  // Archive / trash panels
  const archivePanel = document.getElementById("archive-panel");
  const archiveCloseBtn = document.getElementById("archive-close-btn");
  const archiveListEl = document.getElementById("archive-list");

  const trashPanel = document.getElementById("trash-panel");
  const trashCloseBtn = document.getElementById("trash-close-btn");
  const trashListEl = document.getElementById("trash-list");

  // Delete account modal (confirm + progress)
  const deleteModal = document.getElementById("delete-modal");
  const deleteModalStepConfirm = document.getElementById(
    "delete-modal-step-confirm"
  );
  const deleteModalStepProgress = document.getElementById(
    "delete-modal-step-progress"
  );
  const deleteConfirmCheckbox = document.getElementById(
    "delete-confirm-checkbox"
  );
  const deleteModalCancel = document.getElementById("delete-modal-cancel");
  const deleteModalConfirm = document.getElementById("delete-modal-confirm");
  const deleteProgressFill = document.getElementById("delete-progress-fill");
  const deleteProgressLabel = document.getElementById("delete-progress-label");
  const deleteModalAbort = document.getElementById("delete-modal-abort");
  
  // Progress modal elements
  const deleteProgressModal = document.getElementById("delete-progress-modal");
  const deleteProgressAbortBtn = document.getElementById("delete-progress-abort-btn");
  const deleteProgressAbortX = document.getElementById("delete-progress-abort-x");
  const deleteProgressAbortHeader = document.getElementById("delete-progress-abort-header");
  const deleteProgressFillBar = document.getElementById("delete-progress-fill");
  const deleteProgressPct = document.getElementById("delete-progress-pct");
  const deleteProgressStatus = document.getElementById("delete-progress-status");

  // NEW: Add these lines
const sidebarViewToggle = document.getElementById("sidebar-view-toggle");
const sidebarViewMenu = document.getElementById("sidebar-view-menu");
const sidebarViewLabel = document.getElementById("sidebar-view-label");
let currentView = "sessions";

if (sidebarViewToggle) {
  sidebarViewToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (sidebarViewMenu) {
      sidebarViewMenu.classList.toggle("hidden");
    }
  });
}

// Handle menu item clicks
document.querySelectorAll(".sidebar-view-menu-item").forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    const view = item.dataset.view;
    currentView = view;
    
    if (sidebarViewLabel) {
      if (view === "sessions") sidebarViewLabel.textContent = "Sessions";
      else if (view === "archive") sidebarViewLabel.textContent = "Archived";
      else if (view === "trash") sidebarViewLabel.textContent = "Deleted";
    }
    
    if (sidebarViewMenu) sidebarViewMenu.classList.add("hidden");
    renderConversationList();
  });
});

// Close menu when clicking outside
document.addEventListener("click", () => {
  if (sidebarViewMenu) sidebarViewMenu.classList.add("hidden");
});
  // Input bar / attach files
  const modeMenuBtn = document.getElementById("mode-menu-btn");
  const modeMenu = document.getElementById("mode-menu");
  const modeBadge = document.getElementById("mode-badge");
  const attachFilesBtn = document.getElementById("attach-files-btn");
  const fileInput = document.getElementById("file-input");
  const sendButton = document.getElementById("send-button") || document.querySelector('#chat-form button[type="submit"]');

  // NEW: Quick Picks elements
  const quickPicksBar = document.getElementById("quick-picks-bar");
  const quickPicksBtn = document.getElementById("quick-picks-btn");

  // NEW: Prompt Coach elements
  const userInputCoachEl = document.getElementById("user-input-coach");

  // Session setup elements
  const sessionSetup = document.getElementById("session-setup");
  const sessionProblemInput = document.getElementById("session-problem");
  const sessionWhyInput = document.getElementById("session-why");
  const sessionTimeSelect = document.getElementById("session-time");
  const sessionSaveBtn = document.getElementById("session-save");
  const sessionPillButtons = document.querySelectorAll(".session-pill");
  
  // NEW: Extended Customizations elements
  const sessionExtendedBtn = document.getElementById("session-extended-btn");
  const extendedModal = document.getElementById("extended-modal");
  const extendedModalClose = document.getElementById("extended-modal-close");
  const extendedSaveBtn = document.getElementById("extended-save-btn");
  const extendedResetBtn = document.getElementById("extended-reset-btn");
  const extendedChips = document.querySelectorAll(".extended-chip");
  const extendedCheckboxes = document.querySelectorAll(".extended-checkbox");
  const extendedTextareas = document.querySelectorAll(".extended-textarea");
  const extendedCharCounts = document.querySelectorAll(".extended-char-count span");

  // -----------------------------
  // Storage keys
  // -----------------------------
  const PROFILE_KEY = "lumonProfileV1";
  const CONVOS_KEY = "lumonConversationsV1";
  const THEME_KEY = "lumonThemeV1";
  const PREFS_KEY = "lumonPrefsV1";
  const MEMORIES_KEY = "lumonMemoriesV1";

  // -----------------------------
  // In-memory state
  // -----------------------------
  let profile = {
    name: "",
    goal: "",
    experience: "beginner",
  };

  let prefs = {
    theme: "light",
    notifEmail: false,
    notifDesktop: false,
    tone: "formal",
    responseLength: "balanced",
    sessionTips: true,
    promptSuggestions: true,
    localStorageEnabled: true,
  };

  let conversations = [];
  let activeConversationId = null;
  let messageHistory = [];
  let sidebarOpen = false;
  let sessionConfidenceLevel = "beginner";
  let memories = []; // Cross-conversation memory storage

  // delete progress state
  let deleteProgressTimer = null;
  let deleteProgressValue = 0;

  // NEW: User Input Coach state
  let userInputCoach = {
    visible: false,
    selected: [],
  };

  // -----------------------------
  // Helpers – profile/name
  // -----------------------------
  function getDisplayName() {
    const n = (profile.name || "").trim();
    return n || "Friend";
  }

  function refreshUserMetaNames() {
    const name = getDisplayName();
    document
      .querySelectorAll(".chat-message-row.user .chat-meta")
      .forEach((el) => {
        el.textContent = name;
      });
  }

  function updateProfileUI() {
    const name = getDisplayName();
    if (profileChipName) profileChipName.textContent = name;
    const initial = name.charAt(0).toUpperCase();
    if (profileAvatarInitial) profileAvatarInitial.textContent = initial;
    if (profileAvatarLargeInitial)
      profileAvatarLargeInitial.textContent = initial;
    if (profileNameInput) profileNameInput.value = name;
    refreshUserMetaNames();
  }

  function commitProfileNameChange() {
    if (!profileNameInput) return;
    const newName = profileNameInput.value.trim() || "Friend";
    profile.name = newName;
    saveProfileToStorage();
    updateProfileUI();
  }

  // -----------------------------
  // Helpers – theme + prefs
  // -----------------------------
  // NEW: Theme state
  let currentTheme = "light";

  function loadThemeFromStorage() {
    try {
      const stored = localStorage.getItem("lumonThemeV1");
      if (stored === "dark") {
        currentTheme = "dark";
        return "dark";
      }
    } catch (e) {
      // ignore
    }
    currentTheme = "light";
    return "light";
  }

  function saveThemeToStorage(theme) {
    try {
      localStorage.setItem("lumonThemeV1", theme);
    } catch (e) {
      // ignore
    }
  }

  function applyTheme(theme) {
    currentTheme = theme;
    document.body.classList.remove("lumon-dark");
    if (theme === "dark") {
      document.body.classList.add("lumon-dark");
    }
    saveThemeToStorage(theme);
  }

  function savePrefsToStorage() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {
      // ignore
    }
  }

  function loadPrefsFromStorage() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;
      prefs = {
        theme: data.theme === "dark" ? "dark" : "light",
        notifEmail: !!data.notifEmail,
        notifDesktop: !!data.notifDesktop,
        tone: data.tone || "formal",
        responseLength: data.responseLength || "balanced",
        sessionTips: data.sessionTips !== false,
        promptSuggestions: data.promptSuggestions !== false,
        localStorageEnabled: data.localStorageEnabled !== false,
      };
    } catch (e) {
      // ignore
    }
  }

  function syncPrefsUI() {
    applyTheme(prefs.theme || "light");
    if (notifEmailCheckbox) notifEmailCheckbox.checked = !!prefs.notifEmail;
    if (notifDesktopCheckbox)
      notifDesktopCheckbox.checked = !!prefs.notifDesktop;
  }

  // -----------------------------
  // Helpers – sidebar toggle
  // -----------------------------
  function setSidebar(open) {
    // CRITICAL: Never allow sidebar to open during onboarding
    const isOnboarding = document.body.classList.contains("onboarding-active");
    if (isOnboarding && open) {
      // If trying to open sidebar during onboarding, silently reject
      return;
    }
    
    sidebarOpen = open;
    document.body.classList.toggle("sidebar-open", open);
    if (sidebarIcon) {
      sidebarIcon.textContent = open ? "<" : ">";
    }
  }

  if (sidebarHandle) {
    sidebarHandle.addEventListener("click", () => {
      setSidebar(!sidebarOpen);
    });
  }

  // -----------------------------
  // Helpers – mode menu / file attach
  // -----------------------------
  function closeModeMenu() {
    if (modeMenu) modeMenu.classList.add("hidden");
  }

  // NEW: Toggle Quick Picks bar
  function toggleQuickPicksBar() {
    if (!quickPicksBar) return;
    const isHidden = quickPicksBar.classList.contains("hidden");
    if (isHidden) {
      quickPicksBar.classList.remove("hidden");
    } else {
      quickPicksBar.classList.add("hidden");
    }
  }

  if (modeBadge) {
    modeBadge.textContent = "Text";
  }

  if (modeMenuBtn) {
    modeMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!modeMenu) return;
      const hidden = modeMenu.classList.contains("hidden");
      if (hidden) modeMenu.classList.remove("hidden");
      else modeMenu.classList.add("hidden");
    });
  }

  // Connect Files functionality
  const connectFilesBtn = document.getElementById("connect-files-btn");
  const attachmentPreview = document.getElementById("attachment-preview");
  let attachedFiles = []; // Store file data
  
  if (connectFilesBtn) {
    connectFilesBtn.addEventListener("click", () => {
      // Create hidden file input
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.multiple = true;
      fileInput.accept = "*/*";
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);
      
      fileInput.addEventListener("change", async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        // Don't clear previous files - append new ones
        // attachedFiles = []; // REMOVED - now allows multiple uploads
        // attachmentPreview.innerHTML = ""; // REMOVED - now preserves previous uploads
        
        // Process each file
        for (const file of files) {
          const isImage = file.type.startsWith('image/');
          
          if (isImage) {
            // For images, convert to base64 and show thumbnail
            const reader = new FileReader();
            reader.onload = (event) => {
              const fileData = {
                name: file.name,
                type: 'image',
                mimeType: file.type,
                data: event.target.result, // base64 data
              };
              attachedFiles.push(fileData);
              
              // Create thumbnail
              const thumbnail = document.createElement("div");
              thumbnail.className = "attachment-thumbnail";
              thumbnail.innerHTML = `
                <img src="${event.target.result}" alt="${file.name}">
                <button class="attachment-remove" type="button" title="Remove">×</button>
              `;
              
              // Remove button functionality
              thumbnail.querySelector(".attachment-remove").addEventListener("click", (e) => {
                e.preventDefault();
                attachedFiles = attachedFiles.filter(f => f.name !== file.name);
                thumbnail.remove();
              });
              
              attachmentPreview.appendChild(thumbnail);
              console.log(`📸 Image loaded: ${file.name}`);
            };
            reader.readAsDataURL(file);
          } else {
            // For other files, just store metadata and show icon
            attachedFiles.push({
              name: file.name,
              type: 'file',
              mimeType: file.type,
            });
            
            const fileIcon = document.createElement("div");
            fileIcon.className = "attachment-thumbnail";
            fileIcon.style.background = "#faf6f1";
            fileIcon.style.display = "flex";
            fileIcon.style.alignItems = "center";
            fileIcon.style.justifyContent = "center";
            fileIcon.style.fontSize = "24px";
            fileIcon.innerHTML = `
              <span title="${file.name}">📎</span>
              <button class="attachment-remove" type="button" title="Remove">×</button>
            `;
            
            // Remove button functionality
            fileIcon.querySelector(".attachment-remove").addEventListener("click", (e) => {
              e.preventDefault();
              attachedFiles = attachedFiles.filter(f => f.name !== file.name);
              fileIcon.remove();
            });
            
            attachmentPreview.appendChild(fileIcon);
          }
        }
        
        console.log("📎 Files connected:", files.map(f => f.name));
        
        // Clean up
        document.body.removeChild(fileInput);
        
        // Close menu
        if (modeMenu) modeMenu.classList.add("hidden");
        
        // Focus on input
        if (userInput) userInput.focus();
      });
      
      // Trigger file picker
      fileInput.click();
    });
  }

  // NEW: Function to populate Quick Picks with intelligent options
  async function populateQuickPicks() {
    if (!quickPicksBar) return;
    
    try {
      console.log("📡 Generating quick picks...");
      
      // Show loading skeleton with shimmer animation
      quickPicksBar.classList.add("loading");
      quickPicksBar.innerHTML = `
        <div class="quick-picks-skeleton">
          <div class="quick-picks-skeleton-btn"></div>
          <div class="quick-picks-skeleton-btn"></div>
          <div class="quick-picks-skeleton-btn"></div>
          <div class="quick-picks-skeleton-btn"></div>
        </div>
      `;
      
      const currentText = (userInput?.value || "").trim();
      
      if (!currentText) {
        quickPicksBar.classList.remove("loading");
        quickPicksBar.classList.add("hidden");
        return;
      }

      const res = await fetch("https://lumonai-production.up.railway.app/api/quick-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentText,
          history: messageHistory,
          topic: "quick_picks",
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const options = data.options || [];

      quickPicksBar.classList.remove("loading");

      if (options.length === 0) {
        quickPicksBar.classList.add("hidden");
        return;
      }

      // Build HTML with clickable quick picks
      let html = `<div style="display: flex; gap: 6px; padding: 8px 12px; flex-wrap: wrap; align-items: center;">`;
      options.forEach((option, idx) => {
        html += `<button type="button" class="quick-pick-btn" data-quick-pick="${idx}" style="
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.25);
          color: #fdfaf6;
          padding: 4px 10px;
          font-size: 11px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        ">${option}</button>`;
      });
      html += `<button type="button" class="quick-picks-close-btn" style="
        margin-left: auto;
        border: none;
        background: none;
        color: #fdfaf6;
        font-size: 16px;
        cursor: pointer;
        padding: 0 4px;
        transition: opacity 0.15s ease;
      ">✕</button>`;
      html += `</div>`;

      quickPicksBar.innerHTML = html;

      // Wire clicks to send selection
      quickPicksBar.querySelectorAll(".quick-pick-btn").forEach((btn, idx) => {
        btn.addEventListener("click", () => {
          const selected = options[idx];
          if (userInput && selected) {
            userInput.value = selected;
            autoResizeInput();
            userInput.focus();
            
            // Auto-send after brief delay
            setTimeout(() => {
              handleUserMessage(selected);
            }, 100);
          }
        });
        
        // Hover effect
        btn.addEventListener("mouseenter", () => {
          btn.style.background = "rgba(255, 255, 255, 0.4)";
          btn.style.borderColor = "rgba(255, 255, 255, 0.6)";
        });
        
        btn.addEventListener("mouseleave", () => {
          btn.style.background = "rgba(255, 255, 255, 0.25)";
          btn.style.borderColor = "rgba(255, 255, 255, 0.4)";
        });
      });

      // Wire close button
      const closeBtn = quickPicksBar.querySelector(".quick-picks-close-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          quickPicksBar.classList.add("hidden");
        });
        
        closeBtn.addEventListener("mouseenter", () => {
          closeBtn.style.opacity = "0.7";
        });
        
        closeBtn.addEventListener("mouseleave", () => {
          closeBtn.style.opacity = "1";
        });
      }

    } catch (err) {
      console.error("❌ Quick picks error:", err);
      quickPicksBar.classList.remove("loading");
      quickPicksBar.classList.add("hidden");
    }
  }

  // NEW: Quick Picks button handler
  if (quickPicksBtn) {
    quickPicksBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModeMenu();
      
      // Check if bar is currently hidden
      const isHidden = quickPicksBar.classList.contains("hidden");
      
      if (isHidden) {
        // Show the bar first
        quickPicksBar.classList.remove("hidden");
        
        // Then populate it
        const currentText = (userInput?.value || "").trim();
        if (!currentText) {
          // If no text, show empty state but keep bar visible
          quickPicksBar.classList.remove("loading");
          quickPicksBar.innerHTML = `
            <div style="display: flex; gap: 6px; padding: 8px 12px; flex-wrap: nowrap; align-items: center; justify-content: space-between; width: 100%;">
              <div style="font-size: 11px; color: #2b2117; font-weight: 500;">Start typing to see suggestions...</div>
              <button type="button" class="quick-picks-close-btn" style="
                border: none;
                background: none;
                color: #2b2117;
                font-size: 16px;
                cursor: pointer;
                padding: 0 4px;
                transition: opacity 0.15s ease;
              ">✕</button>
            </div>
          `;
          
          // Wire close button
          const closeBtn = quickPicksBar.querySelector(".quick-picks-close-btn");
          if (closeBtn) {
            closeBtn.addEventListener("click", () => {
              quickPicksBar.classList.add("hidden");
            });
            
            closeBtn.addEventListener("mouseenter", () => {
              closeBtn.style.opacity = "0.7";
            });
            
            closeBtn.addEventListener("mouseleave", () => {
              closeBtn.style.opacity = "1";
            });
          }
        } else {
          // If there's text, populate with quick picks
          populateQuickPicks();
        }
      } else {
        // Hide the bar
        quickPicksBar.classList.add("hidden");
      }
    });
  }

  if (attachFilesBtn && fileInput) {
    attachFilesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
      closeModeMenu();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      if (!fileInput.files || fileInput.files.length === 0) return;
      const names = Array.from(fileInput.files).map((f) => f.name);
      // Simple display: show file names in a small system message
      addMessage(
        "ai",
        `I see these files attached:\n\n- ${names.join("\n- ")}\n\nI’ll keep them in mind for this session.`,
        true
      );
    });
  }

  // -----------------------------
  // Session setup helpers
  // -----------------------------
  function resetSessionForm() {
    if (!sessionProblemInput || !sessionWhyInput || !sessionTimeSelect) return;
    sessionProblemInput.value = "";
    sessionWhyInput.value = "";
    sessionTimeSelect.value = "this_week";
    sessionConfidenceLevel = "beginner";

    sessionPillButtons.forEach((btn) => {
      btn.classList.toggle("pill-active", btn.dataset.level === "beginner");
    });
  }

  function applySessionToForm(session) {
    if (!session) {
      resetSessionForm();
      return;
    }
    if (sessionProblemInput)
      sessionProblemInput.value = session.problemTitle || "";
    if (sessionWhyInput) sessionWhyInput.value = session.whyItMatters || "";
    if (sessionTimeSelect)
      sessionTimeSelect.value = session.timeHorizon || "this_week";
    sessionConfidenceLevel = session.confidenceLevel || "beginner";

    sessionPillButtons.forEach((btn) => {
      btn.classList.toggle(
        "pill-active",
        btn.dataset.level === sessionConfidenceLevel
      );
    });
  }

  function showSessionSetupForActiveConversation() {
    const convo = getActiveConversation();
    if (!sessionSetup) return;

    if (!convo) {
      sessionSetup.classList.add("hidden");
      return;
    }

    if (convo.session && convo.session.problemTitle) {
      sessionSetup.classList.add("hidden");
      applySessionToForm(convo.session);
    } else {
      sessionSetup.classList.remove("hidden");
      applySessionToForm(convo.session || null);
    }
  }

  if (sessionPillButtons && sessionPillButtons.length) {
    sessionPillButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        sessionConfidenceLevel = btn.dataset.level || "beginner";
        sessionPillButtons.forEach((b) => {
          b.classList.toggle("pill-active", b === btn);
        });
      });
    });
  }

  if (sessionSaveBtn) {
    sessionSaveBtn.addEventListener("click", () => {
      const convo = getActiveConversation();
      if (!convo) return;

      const problemTitle = sessionProblemInput.value.trim();
      const whyItMatters = sessionWhyInput.value.trim();
      const timeHorizon = sessionTimeSelect.value || "this_week";

      if (!problemTitle) {
        sessionProblemInput.focus();
        return;
      }

      convo.session = {
        problemTitle,
        whyItMatters,
        timeHorizon,
        confidenceLevel: sessionConfidenceLevel || "beginner",
      };
      convo.updatedAt = Date.now();
      saveConversationsToStorage();
      showSessionSetupForActiveConversation();

      if (!Array.isArray(convo.messages) || convo.messages.length === 0) {
        showWelcomeMessage();
      }
    });
  }

  // NEW: Skip session setup button
  const sessionSkipBtn = document.getElementById("session-skip-btn");
  if (sessionSkipBtn) {
    sessionSkipBtn.addEventListener("click", () => {
      const convo = getActiveConversation();
      if (!convo) return;

      // Hide session setup without saving a session
      if (sessionSetup) {
        sessionSetup.classList.add("hidden");
      }

      // Send greeting message when skipping session focus
      if (!Array.isArray(convo.messages) || convo.messages.length === 0) {
        const greetings = [
          `Hey there, ${profile.name}! What can I help you with today?`,
          `Welcome, ${profile.name}! I'm here to help you think through anything. What's on your mind?`,
          `Hi ${profile.name}! Ready to dive into something? What would you like to explore?`,
          `${profile.name}, let's get started. What can I assist you with?`,
          `Welcome aboard, ${profile.name}! What challenge can I help you tackle?`
        ];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        addMessage("assistant", greeting, false);
      }
    });
  }

  // -----------------------------
  // Storage helpers – profile + conversations
  // -----------------------------
  function loadProfileFromStorage() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      return {
        name: data.name || "",
        goal: data.goal || "",
        experience: data.experience || "beginner",
      };
    } catch (e) {
      return null;
    }
  }

  function saveProfileToStorage() {
    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          name: profile.name,
          goal: profile.goal,
          experience: profile.experience,
        })
      );
    } catch (e) {
      // ignore
    }
  }

  function loadConversationsFromStorage() {
    try {
      const raw = localStorage.getItem(CONVOS_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      return data
        .map((c) => ({
          id: c.id,
          title: c.title || "New chat",
          messages: Array.isArray(c.messages) ? c.messages : [],
          createdAt: c.createdAt || Date.now(),
          updatedAt: c.updatedAt || c.createdAt || Date.now(),
          archived: !!c.archived,
          deleted: !!c.deleted,
          deletedAt: c.deletedAt || null,
          session: c.session || null,
        }))
        .filter((c) => {
          if (!c.deleted || !c.deletedAt) return true;
          return now - c.deletedAt < thirtyDays;
        });
    } catch (e) {
      return [];
    }
  }

  function saveConversationsToStorage() {
    try {
      localStorage.setItem(CONVOS_KEY, JSON.stringify(conversations));
    } catch (e) {
      // ignore
    }
  }

  // Cross-conversation memory functions
  function loadMemoriesFromStorage() {
    try {
      const raw = localStorage.getItem(MEMORIES_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveMemoriesToStorage() {
    try {
      localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
    } catch (e) {
      // ignore
    }
  }

  function addMemory(fact) {
    if (!fact || fact.trim().length === 0) return;
    const memory = {
      id: "mem_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      fact: fact.trim(),
      addedAt: Date.now(),
      sourceConversation: activeConversationId || "unknown",
    };
    memories.push(memory);
    saveMemoriesToStorage();
    // Update UI if memories tab is visible
    const memoriesTab = document.getElementById("tab-memories");
    if (memoriesTab && !memoriesTab.classList.contains("hidden")) {
      updateMemoriesUI();
    }
    return memory;
  }

  function deleteMemory(memoryId) {
    memories = memories.filter((m) => m.id !== memoryId);
    saveMemoriesToStorage();
  }

  function getRelevantMemories(maxCount = 5) {
    // Return up to maxCount memories for inclusion in system prompt
    return memories.slice(-maxCount);
  }

  function updateMemoriesUI() {
    const memoriesList = document.getElementById("memories-list");
    const memoryCount = document.getElementById("memory-count");
    if (!memoriesList || !memoryCount) return;

    memoryCount.textContent = memories.length;

    if (memories.length === 0) {
      memoriesList.innerHTML = '<div style="text-align: center; color: var(--text-soft); font-size: 12px; padding: 20px;"><p>Memories will appear here as Lumon learns about you</p></div>';
      return;
    }

    const html = memories
      .slice()
      .reverse()
      .map((mem) => {
        const date = new Date(mem.addedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return `<div style="padding: 8px; border-bottom: 1px solid rgba(211, 196, 180, 0.2); display: flex; justify-content: space-between; align-items: start; gap: 8px;">
          <div>
            <p style="margin: 0; font-size: 13px; color: var(--text-primary); line-height: 1.4;">${typeof mem === "string" ? mem : mem.fact}</p>
            <p style="margin: 4px 0 0; font-size: 11px; color: var(--text-soft);">${date}</p>
          </div>
          <button class="memory-delete-btn" data-memory-id="${mem.id}" type="button" style="border: none; background: none; color: #c93b1d; cursor: pointer; padding: 0 4px; font-weight: 600; min-width: 28px;">✕</button>
        </div>`;
      })
      .join("");

    memoriesList.innerHTML = html;

    // Wire delete buttons
    memoriesList.querySelectorAll(".memory-delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const memoryId = btn.dataset.memoryId;
        deleteMemory(memoryId);
        updateMemoriesUI();
      });
    });
  }

  // -----------------------------
  // Conversation helpers
  // -----------------------------
  function getActiveConversation() {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }

  function clearChatLog() {
    if (chatLog) chatLog.innerHTML = "";
  }

  function closeAllConversationMenus() {
    const menus = document.querySelectorAll(".conversation-menu");
    menus.forEach((m) => m.classList.add("hidden"));
  }

  function renderArchiveList() {
    if (!archiveListEl) return;
    const archived = conversations.filter((c) => c.archived && !c.deleted);
    archiveListEl.innerHTML = "";

    if (archived.length === 0) {
      archiveListEl.classList.add("mini-list-empty");
      archiveListEl.textContent = "No archived chats yet.";
      return;
    }

    archiveListEl.classList.remove("mini-list-empty");

    archived.forEach((convo) => {
      const row = document.createElement("div");
      row.className = "mini-list-item";
      const title = document.createElement("div");
      title.className = "mini-list-title";
      title.textContent = convo.title || "Untitled chat";

      const actions = document.createElement("div");
      actions.className = "mini-list-actions";
      const restoreBtn = document.createElement("button");
      restoreBtn.className = "mini-list-btn";
      restoreBtn.textContent = "Restore";

      restoreBtn.addEventListener("click", () => {
        convo.archived = false;
        convo.updatedAt = Date.now();
        saveConversationsToStorage();
        renderConversationList();
        renderArchiveList();
      });

      row.addEventListener("click", (e) => {
        if (e.target === restoreBtn) return;
        activeConversationId = convo.id;
        loadConversationIntoUI(convo.id);
      });

      actions.appendChild(restoreBtn);
      row.appendChild(title);
      row.appendChild(actions);
      archiveListEl.appendChild(row);
    });
  }

  function renderTrashList() {
    if (!trashListEl) return;
    const deleted = conversations.filter((c) => c.deleted);
    trashListEl.innerHTML = "";

    if (deleted.length === 0) {
      trashListEl.classList.add("mini-list-empty");
      trashListEl.textContent = "No deleted chats yet.";
      return;
    }

    trashListEl.classList.remove("mini-list-empty");

    deleted.forEach((convo) => {
      const row = document.createElement("div");
      row.className = "mini-list-item";
      const title = document.createElement("div");
      title.className = "mini-list-title";
      title.textContent = convo.title || "Untitled chat";

      const actions = document.createElement("div");
      actions.className = "mini-list-actions";

      const restoreBtn = document.createElement("button");
      restoreBtn.className = "mini-list-btn";
      restoreBtn.textContent = "Restore";

      const deleteForeverBtn = document.createElement("button");
      deleteForeverBtn.className = "mini-list-btn mini-list-btn-danger";
      deleteForeverBtn.textContent = "Delete forever";

      restoreBtn.addEventListener("click", () => {
        convo.deleted = false;
        convo.deletedAt = null;
        convo.updatedAt = Date.now();
        saveConversationsToStorage();
        renderConversationList();
        renderTrashList();
        renderArchiveList();
      });

      deleteForeverBtn.addEventListener("click", () => {
        const idx = conversations.findIndex((c) => c.id === convo.id);
        if (idx !== -1) conversations.splice(idx, 1);

        if (activeConversationId === convo.id) {
          activeConversationId = null;
          clearChatLog();
          const first = conversations.find(
            (c) => !c.deleted && !c.archived
          );
          if (first) {
            activeConversationId = first.id;
            loadConversationIntoUI(first.id);
          } else {
            createNewConversation(true);
          }
        }

        saveConversationsToStorage();
        renderConversationList();
        renderTrashList();
        renderArchiveList();
      });

      row.addEventListener("click", (e) => {
        if (e.target === restoreBtn || e.target === deleteForeverBtn) return;
        activeConversationId = convo.id;
        loadConversationIntoUI(convo.id);
      });

      actions.appendChild(restoreBtn);
      actions.appendChild(deleteForeverBtn);
      row.appendChild(title);
      row.appendChild(actions);
      trashListEl.appendChild(row);
    });
  }

  function renderConversationList() {
    if (!conversationListEl) return;
    conversationListEl.innerHTML = "";

    const visibleConvos = conversations.filter(
      (c) => !c.archived && !c.deleted
    );

    // Sort: pinned conversations first
    visibleConvos.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

    visibleConvos.forEach((convo) => {
      const row = document.createElement("div");
      row.className =
        "conversation-item" +
        (convo.id === activeConversationId ? " active" : "") +
        (convo.pinned ? " pinned" : "");
      row.dataset.id = convo.id;

      const titleSpan = document.createElement("span");
      titleSpan.className = "conversation-item-title" + (convo.isLoadingTitle ? " ai-loading" : "");
      
      // Show loading animation or actual title
      if (convo.isLoadingTitle) {
        titleSpan.innerHTML = "";
        // Create ripple effect with "Working on title..."
        const rippleContainer = document.createElement("span");
        rippleContainer.className = "title-ripple-container";
        rippleContainer.innerHTML = '<span class="ripple-word">Working</span> <span class="ripple-word">on</span> <span class="ripple-word">title</span><span class="ripple-dots">.</span><span class="ripple-dots">.</span><span class="ripple-dots">.</span>';
        titleSpan.appendChild(rippleContainer);
      } else {
        titleSpan.textContent = convo.title || "New chat";
      }

      const moreBtn = document.createElement("button");
      moreBtn.className = "conversation-more";
      moreBtn.textContent = "⋯";

      const menu = document.createElement("div");
      menu.className = "conversation-menu hidden";

      const renameBtn = document.createElement("button");
      renameBtn.className = "conversation-menu-item";
      renameBtn.textContent = "Rename";

      const archiveBtn = document.createElement("button");
      archiveBtn.className = "conversation-menu-item";
      archiveBtn.textContent = convo.archived ? "Unarchive" : "Archive";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "conversation-menu-item";
      deleteBtn.textContent = "Move to trash";

      const pinBtn = document.createElement("button");
      pinBtn.className = "conversation-menu-item";
      pinBtn.textContent = convo.pinned ? "Unpin" : "Pin";

      menu.appendChild(renameBtn);
      menu.appendChild(pinBtn);
      menu.appendChild(archiveBtn);
      menu.appendChild(deleteBtn);

      function beginRename() {
        menu.classList.add("hidden");

        const currentTitle = convo.title || "New chat";
        const input = document.createElement("input");
        input.type = "text";
        input.className = "conversation-rename-input";
        input.value = currentTitle;

        row.replaceChild(input, titleSpan);
        input.focus();
        input.select();

        const finish = (commit) => {
          let finalTitle = currentTitle;
          if (commit) {
            const newTitle = input.value.trim();
            if (newTitle) {
              finalTitle = newTitle;
              convo.title = finalTitle;
              convo.updatedAt = Date.now();
              saveConversationsToStorage();
            }
          }
          titleSpan.textContent = finalTitle;
          row.replaceChild(titleSpan, input);
          renderConversationList();
        };

        input.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter") {
            ev.preventDefault();
            finish(true);
          } else if (ev.key === "Escape") {
            ev.preventDefault();
            finish(false);
          }
        });

        input.addEventListener("blur", () => {
          finish(true);
        });
      }

      row.addEventListener("click", () => {
        if (convo.id === activeConversationId) return;
        loadConversationIntoUI(convo.id);
      });

      titleSpan.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        beginRename();
      });

      row.addEventListener("dblclick", (e) => {
        if (e.target === moreBtn) return;
        e.stopPropagation();
        beginRename();
      });

      moreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = menu.classList.contains("hidden");
        closeAllConversationMenus();
        if (isHidden) {
          menu.classList.remove("hidden");
        }
      });

      renameBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        beginRename();
      });

      pinBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Check if trying to pin and already at max 10 pins
        if (!convo.pinned) {
          const pinnedCount = conversations.filter(c => c.pinned && !c.archived && !c.deleted).length;
          if (pinnedCount >= 10) {
            alert("You can pin a maximum of 10 conversations");
            menu.classList.add("hidden");
            return;
          }
        }
        
        convo.pinned = !convo.pinned;
        convo.updatedAt = Date.now();
        saveConversationsToStorage();
        renderConversationList();
        menu.classList.add("hidden");
      });

      archiveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        convo.archived = !convo.archived;
        convo.deleted = false;
        convo.updatedAt = Date.now();
        saveConversationsToStorage();
        renderConversationList();
        renderArchiveList();
        menu.classList.add("hidden");
      });

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        convo.deleted = true;
        convo.deletedAt = Date.now();
        convo.archived = false;
        convo.updatedAt = Date.now();
        saveConversationsToStorage();
        renderConversationList();
        renderTrashList();
        renderArhechiveList();
        menu.classList.add("hidden");

        if (activeConversationId === convo.id) {
          const first = conversations.find(
            (c) => !c.deleted && !c.archived
          );
          if (first) {
            activeConversationId = first.id;
            loadConversationIntoUI(first.id);
          } else {
            activeConversationId = null;
            clearChatLog();
            createNewConversation(true);
          }
        }
      });

      row.appendChild(titleSpan);
      row.appendChild(moreBtn);
      row.appendChild(menu);
      conversationListEl.appendChild(row);
    });

    renderArchiveList();
    renderTrashList();
  }

  function loadConversationIntoUI(convoId) {
    const convo = conversations.find((c) => c.id === convoId);
    if (!convo) return;

    activeConversationId = convoId;
    messageHistory = Array.isArray(convo.messages)
      ? convo.messages.slice()
      : [];

    clearChatLog();

    if (Array.isArray(convo.messages)) {
      convo.messages.forEach((m) => {
        const role = m.role === "assistant" ? "ai" : "user";
        const opts = {};
        if (m.type === "image" && m.imageUrl) {
          opts.type = "image";
          opts.imageUrl = m.imageUrl;
        }
        if (m.attachments && m.attachments.length > 0) {
          opts.attachments = m.attachments;
        }
        addMessage(role, m.content, false, opts);
      });
    }
  }

  function createNewConversation(withSessionSetup) {
    const id = Math.random().toString(36).slice(2, 11);
    const convo = {
      id,
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      archived: false,
      deleted: false,
      deletedAt: null,
      session: null,
      pinned: false,
    };

    conversations.unshift(convo);
    activeConversationId = id;

    saveConversationsToStorage();
    renderConversationList();

    clearChatLog();
    messageHistory = [];

    if (withSessionSetup) {
      if (sessionSetup) sessionSetup.classList.remove("hidden");
      showSessionSetupForActiveConversation();
    }
  }

  function updateActiveConversationTitleFromFirstUserMessage() {
    const convo = getActiveConversation();
    if (!convo) return;
    if (convo.title && convo.title !== "New chat") return;

    // Set placeholder - don't use first message as title
    convo.title = "Working on title...";
    convo.isLoadingTitle = true;
    convo.updatedAt = Date.now();
    saveConversationsToStorage();
    renderConversationList();
  }

  // Fast local title generation (no API calls, no user text)
  function generateTitleFromText(text) {
    // Keywords that indicate the topic - extract these instead of the text itself
    const keywords = {
      'help|assist|question|problem|issue|trouble|broken|error|fix|how to': 'Help Needed',
      'python|javascript|code|program|app|software|develop': 'Coding',
      'math|calculate|solve|algebra|geometry|physics': 'Math',
      'write|essay|story|article|poem|book': 'Writing',
      'learn|teach|explain|understand|concept': 'Learning',
      'business|startup|marketing|sales|money|invest': 'Business',
      'design|creative|art|visual|style|layout': 'Design',
      'recipe|cook|food|meal|diet|nutrition': 'Cooking',
      'travel|vacation|trip|destination|hotel': 'Travel',
      'health|exercise|fitness|workout|sports': 'Health',
      'music|song|audio|sound|instrument': 'Music',
      'movie|film|show|watch|actor|scene': 'Entertainment',
      'game|play|strategy|win|competition': 'Gaming',
      'idea|brainstorm|think|concept|plan': 'Ideas',
      'bug|debug|crash|fail|not working': 'Debugging',
    };

    const textLower = text.toLowerCase();
    
    // Check each keyword pattern
    for (const [pattern, title] of Object.entries(keywords)) {
      if (new RegExp(pattern).test(textLower)) {
        return title;
      }
    }

    // Fallback: create a generic title based on question/statement structure
    if (textLower.includes('?')) {
      return 'Question';
    } else if (textLower.includes('how')) {
      return 'How to';
    } else if (textLower.includes('what')) {
      return 'What is';
    } else if (textLower.includes('why')) {
      return 'Why';
    } else if (text.length > 50) {
      return 'Discussion';
    }
    
    return 'Chat';
  }

  async function generateAISessionTitle() {
    const convo = getActiveConversation();
    if (!convo || !convo.messages) return;

    // Get all user and AI messages so far
    const userMessages = convo.messages.filter(m => m.role === "user").map(m => m.content || "");
    const aiMessages = convo.messages.filter(m => m.role === "assistant").map(m => m.content || "");
    
    if (userMessages.length === 0) return;

    // If title already generated, don't regenerate
    if (convo.aiTitleGenerated) return;

    // Generate title after SECOND back-and-forth (2 AI responses = topic is established)
    if (aiMessages.length < 2) {
      console.log(`⏳ Waiting for title trigger... (${aiMessages.length}/2 AI responses)`);
      return;
    }

    try {
      const allUserText = userMessages.join(" ");

      console.log("🔄 Generating creative title from conversation...");
      
      // Generate title using AI based on the actual conversation
      const titleResponse = await fetch("https://lumonai-production.up.railway.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Based on this conversation so far, generate a VERY SHORT session title (2-5 words max, under 40 characters) that captures the main topic or issue being discussed. Return ONLY the title, nothing else. No quotes, no explanation, no markdown, no ellipsis.\n\nConversation:\n${userMessages.map((m, i) => `User ${i + 1}: ${m}`).join("\n")}`,
          history: [],
          profile,
          session: convo.session || {},
          isTitleGeneration: true,
        }),
      });

      if (titleResponse.ok) {
        const data = await titleResponse.json();
        let newTitle = (data.reply || "").trim();
        
        console.log("📝 Raw title response:", newTitle);
        
        // Clean up the title
        newTitle = newTitle.replace(/^["'`]+|["'`]+$/g, ''); // Remove quotes
        newTitle = newTitle.replace(/^#+\s+/, ''); // Remove markdown headers
        newTitle = newTitle.replace(/\*\*|__|\*|_/g, ''); // Remove formatting
        newTitle = newTitle.replace(/\.\.\.$/, ''); // Remove ellipsis
        
        // Enforce max length
        const maxLength = 40;
        if (newTitle.length > maxLength) {
          newTitle = newTitle.slice(0, maxLength).trim();
        }
        
        if (newTitle && newTitle.length > 2) {
          convo.title = newTitle;
          convo.isLoadingTitle = false;
          convo.aiTitleGenerated = true;
          convo.updatedAt = Date.now();
          saveConversationsToStorage();
          renderConversationList();
          console.log(`✅ Title generated: "${newTitle}"`);
        }
      } else {
        console.log("❌ Title API response not OK:", titleResponse.status);
        convo.aiTitleGenerated = true; // Mark as attempted
        convo.isLoadingTitle = false;
        renderConversationList();
      }
    } catch (err) {
      console.error("⚠️ Could not generate title:", err);
      convo.aiTitleGenerated = true; // Mark as attempted
      convo.isLoadingTitle = false;
      renderConversationList();
    }
  }

  // -----------------------------
  // Experience pill toggles
  // -----------------------------
  function updateExperience(level) {
    profile.experience = level;
    expButtons.forEach((btn) => {
      btn.classList.toggle("pill-active", btn.dataset.exp === level);
    });
    saveProfileToStorage();
  }

  expButtons.forEach((btn) => {
    btn.addEventListener("click", () => updateExperience(btn.dataset.exp));
  });

  // -----------------------------
  // Profile panel open/close
  // -----------------------------
  function openProfilePanel() {
    if (!profilePanel) return;
    updateProfileUI();
    profilePanel.classList.remove("hidden");
  }

  function closeProfilePanel() {
    if (!profilePanel) return;
    profilePanel.classList.add("hidden");
  }

  if (profileBtn) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (profilePanel && profilePanel.classList.contains("hidden")) {
        openProfilePanel();
      } else {
        closeProfilePanel();
      }
    });
  }

  if (profileNameInput) {
    profileNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitProfileNameChange();
        profileNameInput.blur();
      }
    });
    profileNameInput.addEventListener("blur", commitProfileNameChange);
  }

  // -----------------------------
  // Settings panel open/close
  // -----------------------------
  function openSettingsPanel() {
    if (!settingsPanel) return;
    syncPrefsUI();
    settingsPanel.classList.remove("hidden");
  }

  function closeSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.add("hidden");
  }

  if (sidebarSettingsBtn) {
    sidebarSettingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (settingsPanel && settingsPanel.classList.contains("hidden")) {
        openSettingsPanel();
      } else {
        closeSettingsPanel();
      }
    });
  }

  if (settingsThemeButtons && settingsThemeButtons.length) {
    settingsThemeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.dataset.theme === "dark" ? "dark" : "light";
        applyTheme(theme);
        savePrefsToStorage();
      });
    });
  }

  if (notifEmailCheckbox) {
    notifEmailCheckbox.addEventListener("change", () => {
      prefs.notifEmail = !!notifEmailCheckbox.checked;
      savePrefsToStorage();
    });
  }

  if (notifDesktopCheckbox) {
    notifDesktopCheckbox.addEventListener("change", () => {
      prefs.notifDesktop = !!notifDesktopCheckbox.checked;
      savePrefsToStorage();
    });
  }

  // ========== DELETE ALL DATA (Red/Purple Abort Window) ==========
  let deleteDataBackdropEl = null;
  let deleteDataModalEl = null;
  let deleteDataAbort = false;
  let deleteDataTimer = null;


  // -----------------------------
  // Delete account modal + progress
  // -----------------------------
  function resetDeleteModalUI() {
    if (deleteProgressTimer) {
      clearInterval(deleteProgressTimer);
      deleteProgressTimer = null;
    }
    deleteProgressValue = 0;

    if (deleteProgressFill) deleteProgressFill.style.width = "0%";
    if (deleteProgressLabel) deleteProgressLabel.textContent = "0%";

    if (deleteModalStepProgress && deleteModalStepConfirm) {
      deleteModalStepProgress.classList.add("hidden");
      deleteModalStepConfirm.classList.remove("hidden");
    }

    if (deleteConfirmCheckbox) deleteConfirmCheckbox.checked = false;
    if (deleteModalConfirm) deleteModalConfirm.disabled = true;
  }

  function openDeleteModal() {
    if (!deleteModal) return;
    resetDeleteModalUI();
    deleteModal.classList.remove("hidden");
  }

  function closeDeleteModal() {
    if (!deleteModal) return;
    resetDeleteModalUI();
    deleteModal.classList.add("hidden");
  }

  function performHardDelete() {
    // Fade out the deletion progress modal
    if (deleteProgressModal) {
      deleteProgressModal.style.opacity = '0';
      deleteProgressModal.style.transition = 'opacity 400ms ease-out';
    }
    
    // After modal fades, clear data and show onboarding
    setTimeout(() => {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(CONVOS_KEY);
      localStorage.removeItem(PREFS_KEY);

      profile = { name: "", goal: "", experience: "beginner" };
      prefs = { theme: "light", notifEmail: false, notifDesktop: false };
      conversations = [];
      activeConversationId = null;
      messageHistory = [];
      sidebarOpen = false;

      clearChatLog();
      if (sessionSetup) sessionSetup.classList.add("hidden");
      if (chatScreen) chatScreen.classList.add("hidden");
      if (chatInputBar) chatInputBar.classList.add("hidden");
      if (onboardingScreen) onboardingScreen.classList.remove("hidden");
      
      // Restore onboarding-active class to hide sidebar and prompt coach
      document.body.classList.add("onboarding-active");
      
      closeProfilePanel();
      closeSettingsPanel();
      updateProfileUI();
      renderConversationList();
      applyTheme("light"); // reset to light
      closeDeleteModal();
      
      // Hide the modal after fade completes
      if (deleteProgressModal) deleteProgressModal.classList.add("hidden");
    }, 400);
  }

  if (profileDeleteAccountBtn) {
    profileDeleteAccountBtn.addEventListener("click", () => {
      openDeleteModal();
    });
  }

  if (deleteConfirmCheckbox && deleteModalConfirm) {
    deleteModalConfirm.disabled = !deleteConfirmCheckbox.checked;
    deleteConfirmCheckbox.addEventListener("change", () => {
      deleteModalConfirm.disabled = !deleteConfirmCheckbox.checked;
    });
  }

  if (deleteModalCancel) {
    deleteModalCancel.addEventListener("click", (e) => {
      e.preventDefault();
      closeDeleteModal();
    });
  }

  if (deleteModalAbort) {
    deleteModalAbort.addEventListener("click", (e) => {
      e.preventDefault();
      resetDeleteModalUI();
    });
  }

  if (deleteModalConfirm) {
    deleteModalConfirm.addEventListener("click", (e) => {
      e.preventDefault();
      if (deleteConfirmCheckbox && !deleteConfirmCheckbox.checked) return;

      // Close the confirmation modal and show the progress modal
      if (deleteModal) deleteModal.classList.add("hidden");
      if (deleteProgressModal) deleteProgressModal.classList.remove("hidden");
      
      // Start the deletion progress
      startDeletionProgress();
    });
  }
  
  // Handle abort button clicks
  if (deleteProgressAbortBtn) {
    deleteProgressAbortBtn.addEventListener("click", () => {
      abortDeletion();
    });
  }
  if (deleteProgressAbortHeader) {
    deleteProgressAbortHeader.addEventListener("click", () => {
      abortDeletion();
    });
  }
  
  let deletionTimer = null;
  let isAborted = false;
  
  function startDeletionProgress() {
    if (!deleteProgressFillBar || !deleteProgressPct || !deleteProgressStatus) return;
    
    isAborted = false;
    let progress = 0;
    const totalDuration = 10000; // 10 seconds
    const updateInterval = 100; // Update every 100ms
    const increment = (updateInterval / totalDuration) * 100;
    
    const statuses = [
      "Initializing deletion...",
      "Removing conversations...",
      "Clearing preferences...",
      "Wiping sessions...",
      "Erasing extended customizations...",
      "Nullifying Prompt Coach data...",
      "Destroying Quick Picks...",
      "Obliterating profile...",
      "Final purge...",
      "Complete."
    ];
    
    let statusIndex = 0;
    
    deletionTimer = setInterval(() => {
      if (isAborted) {
        clearInterval(deletionTimer);
        return;
      }
      
      progress += increment;
      
      if (progress >= 100) {
        progress = 100;
        deleteProgressFillBar.style.width = "100%";
        deleteProgressPct.textContent = "100%";
        deleteProgressStatus.textContent = "Complete.";
        clearInterval(deletionTimer);
        
        // Actually delete after a brief moment
        setTimeout(() => {
          if (!isAborted) performHardDelete();
        }, 500);
        return;
      }
      
      deleteProgressFillBar.style.width = progress + "%";
      deleteProgressPct.textContent = Math.round(progress) + "%";
      
      // Update status message
      const newStatusIndex = Math.floor((progress / 100) * (statuses.length - 1));
      if (newStatusIndex !== statusIndex) {
        statusIndex = newStatusIndex;
        deleteProgressStatus.textContent = statuses[statusIndex];
      }
    }, updateInterval);
  }
  
  function abortDeletion() {
    isAborted = true;
    if (deletionTimer) {
      clearInterval(deletionTimer);
      deletionTimer = null;
    }
    
    // Hide progress modal and show confirmation again
    if (deleteProgressModal) deleteProgressModal.classList.add("hidden");
    if (deleteModal) deleteModal.classList.remove("hidden");
    
    // Reset the progress bar
    if (deleteProgressFillBar) deleteProgressFillBar.style.width = "0%";
    if (deleteProgressPct) deleteProgressPct.textContent = "0%";
    if (deleteProgressStatus) deleteProgressStatus.textContent = "Preparing…";
  }

  // -----------------------------
  // Archive / trash panel open/close
  // -----------------------------
  function openArchivePanel() {
    if (!archivePanel) return;
    renderArchiveList();
    archivePanel.classList.remove("hidden");
    if (chatLog) chatLog.style.filter = "blur(6px)";
    if (chatInputBar) chatInputBar.style.filter = "blur(6px)";
  }

  function closeArchivePanel() {
    if (!archivePanel) return;
    archivePanel.classList.add("hidden");
    if (chatLog) chatLog.style.filter = "";
    if (chatInputBar) chatInputBar.style.filter = "";
  }

  function openTrashPanel() {
    if (!trashPanel) return;
    renderTrashList();
    trashPanel.classList.remove("hidden");
    if (chatLog) chatLog.style.filter = "blur(6px)";
    if (chatInputBar) chatInputBar.style.filter = "blur(6px)";
  }

  function closeTrashPanel() {
    if (!trashPanel) return;
    trashPanel.classList.add("hidden");
    if (chatLog) chatLog.style.filter = "";
    if (chatInputBar) chatInputBar.style.filter = "";
  }

  if (sidebarArchiveBtn) {
    sidebarArchiveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openArchivePanel();
    });
  }

  if (sidebarTrashBtn) {
    sidebarTrashBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openTrashPanel();
    });
  }

  // Sessions menu dropdown
  const sessionsMenuBtn = document.getElementById("sessions-menu-btn");
  const sessionsMenu = document.getElementById("sessions-menu");
  const menuArchivedBtn = document.getElementById("menu-archived-btn");
  const menuDeletedBtn = document.getElementById("menu-deleted-btn");

  if (sessionsMenuBtn) {
    sessionsMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sessionsMenu.classList.toggle("hidden");
    });
  }

  if (menuArchivedBtn) {
    menuArchivedBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sessionsMenu.classList.add("hidden");
      openArchivePanel();
    });
  }

  if (menuDeletedBtn) {
    menuDeletedBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sessionsMenu.classList.add("hidden");
      openTrashPanel();
    });
  }

  // Close menu when clicking outside
  document.addEventListener("click", () => {
    if (sessionsMenu && !sessionsMenu.classList.contains("hidden")) {
      sessionsMenu.classList.add("hidden");
    }
  });

  if (archiveCloseBtn) {
    archiveCloseBtn.addEventListener("click", () => {
      closeArchivePanel();
    });
  }

  if (trashCloseBtn) {
    trashCloseBtn.addEventListener("click", () => {
      closeTrashPanel();
    });
  }

  // -----------------------------
  // Initial load
  // -----------------------------
  conversations = loadConversationsFromStorage();
  memories = loadMemoriesFromStorage();
  const storedProfile = loadProfileFromStorage();
  loadPrefsFromStorage();

  if (storedProfile) {
    profile = storedProfile;
  }
  updateExperience(profile.experience || "beginner");
  updateProfileUI();
  syncPrefsUI(); // applies theme + notifications

  if (storedProfile) {
    onboardingScreen && onboardingScreen.classList.add("hidden");
    document.body.classList.remove("onboarding-active");
    chatScreen && chatScreen.classList.remove("hidden");
    chatInputBar && chatInputBar.classList.remove("hidden");

    // Open sidebar automatically when user logs in
    setSidebar(true);

    if (conversations.length > 0) {
      const first =
        conversations.find((c) => !c.deleted && !c.archived) || conversations[0];
      activeConversationId = first.id;
      renderConversationList();
      loadConversationIntoUI(activeConversationId);
    } else {
      createNewConversation(true);
    }
  } else {
    // Show onboarding screen and hide sidebars
    document.body.classList.add("onboarding-active");
  }

  // -----------------------------
  // Onboarding → chat
  // -----------------------------
  if (onboardContinueBtn) {
    onboardContinueBtn && onboardContinueBtn.addEventListener("click", () => {
      profile.name = (nameInput?.value || "").trim() || "Friend";
      saveProfileToStorage();
      updateProfileUI();

      onboardingScreen.classList.add("hidden");
      document.body.classList.remove("onboarding-active");
      chatScreen.classList.remove("hidden");
      chatInputBar.classList.remove("hidden");

      // Open sidebar automatically when user creates account
      setSidebar(true);

      // Show tutorial prompt if first time
      checkAndShowTutorial();

      if (conversations.length > 0) {
        const first =
          conversations.find((c) => !c.deleted && !c.archived) ||
          conversations[0];
        activeConversationId = first.id;
        renderConversationList();
        loadConversationIntoUI(activeConversationId);
      } else {
        createNewConversation(true);
        // Show session setup for new conversation
        if (sessionSetup) {
          sessionSetup.classList.remove("hidden");
        }
      }

      if (userInput) userInput.focus();
    });
  }

  // Tutorial system
  const tutorialPromptModal = document.getElementById("tutorial-prompt-modal");
  const tutorialStepsModal = document.getElementById("tutorial-steps-modal");
  const tutorialYesBtn = document.getElementById("tutorial-yes-btn");
  const tutorialNoBtn = document.getElementById("tutorial-no-btn");
  const tutorialStepsClose = document.getElementById("tutorial-steps-close");
  const tutorialSkipBtn = document.getElementById("tutorial-skip-btn");
  const tutorialNextBtn = document.getElementById("tutorial-next-btn");
  const tutorialPrevBtn = document.getElementById("tutorial-prev-btn");
  const tutorialSteps = document.querySelectorAll(".tutorial-step");
  const tutorialDots = document.querySelectorAll(".tutorial-dot");
  let currentTutorialStep = 1;

  function showTutorialPrompt() {
    if (tutorialPromptModal) {
      tutorialPromptModal.classList.remove("hidden");
    }
  }

  function hideTutorialPrompt() {
    if (tutorialPromptModal) {
      tutorialPromptModal.classList.add("hidden");
    }
  }

  function showTutorialSteps() {
    if (tutorialStepsModal) {
      tutorialStepsModal.classList.remove("hidden");
    }
  }

  function hideTutorialSteps() {
    if (tutorialStepsModal) {
      tutorialStepsModal.classList.add("hidden");
    }
  }

  function goToTutorialStep(step) {
    currentTutorialStep = Math.max(1, Math.min(step, 4));
    
    // Hide all steps
    tutorialSteps.forEach(s => s.classList.remove("active"));
    tutorialDots.forEach(d => d.classList.remove("active"));
    
    // Show current step
    const stepEl = document.querySelector(`.tutorial-step-${currentTutorialStep}`);
    if (stepEl) {
      stepEl.classList.add("active");
    }
    
    // Update dots
    const dotEl = document.querySelector(`.tutorial-dot[data-step="${currentTutorialStep}"]`);
    if (dotEl) {
      dotEl.classList.add("active");
    }

    // Update button states
    if (tutorialPrevBtn) {
      tutorialPrevBtn.style.opacity = currentTutorialStep === 1 ? "0.5" : "1";
      tutorialPrevBtn.style.pointerEvents = currentTutorialStep === 1 ? "none" : "auto";
    }
    
    if (tutorialNextBtn) {
      tutorialNextBtn.textContent = currentTutorialStep === 4 ? "Done! →" : "Next →";
    }
  }

  if (tutorialYesBtn) {
    tutorialYesBtn.addEventListener("click", () => {
      hideTutorialPrompt();
      showTutorialSteps();
      goToTutorialStep(1);
      localStorage.setItem("tutorialShown", "true");
    });
  }

  if (tutorialNoBtn) {
    tutorialNoBtn.addEventListener("click", () => {
      hideTutorialPrompt();
      localStorage.setItem("tutorialShown", "true");
    });
  }

  if (tutorialStepsClose) {
    tutorialStepsClose.addEventListener("click", () => {
      hideTutorialSteps();
    });
  }

  if (tutorialSkipBtn) {
    tutorialSkipBtn.addEventListener("click", () => {
      hideTutorialSteps();
    });
  }

  if (tutorialNextBtn) {
    tutorialNextBtn.addEventListener("click", () => {
      if (currentTutorialStep === 4) {
        hideTutorialSteps();
      } else {
        goToTutorialStep(currentTutorialStep + 1);
      }
    });
  }

  if (tutorialPrevBtn) {
    tutorialPrevBtn.addEventListener("click", () => {
      goToTutorialStep(currentTutorialStep - 1);
    });
  }

  tutorialDots.forEach(dot => {
    dot.addEventListener("click", () => {
      const step = parseInt(dot.getAttribute("data-step"));
      goToTutorialStep(step);
    });
  });

  // Show tutorial on first chat entry
  function checkAndShowTutorial() {
    const tutorialShown = localStorage.getItem("tutorialShown");
    if (!tutorialShown && chatScreen && !chatScreen.classList.contains("hidden")) {
      // Delay slightly to ensure UI is ready
      setTimeout(() => {
        showTutorialPrompt();
      }, 500);
    }
  }

  // New chat button
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      createNewConversation(true);
    });
  }

  // -----------------------------
  // Click outside menus: close them
  // -----------------------------
  document.addEventListener("click", (e) => {
    const convoItem = e.target.closest(".conversation-item");
    if (!convoItem) {
      closeAllConversationMenus();
    }

    if (
      !e.target.closest("#mode-menu") &&
      !e.target.closest("#mode-menu-btn") &&
      !e.target.closest("#mode-badge")
    ) {
      closeModeMenu();
    }

    if (
      profilePanel &&
      !profilePanel.classList.contains("hidden") &&
      !e.target.closest("#profile-panel") &&
      !e.target.closest("#profile-btn")
    ) {
      closeProfilePanel();
    }

    if (
      settingsPanel &&
      !settingsPanel.classList.contains("hidden") &&
      !e.target.closest("#settings-panel") &&
      !e.target.closest("#sidebar-settings-btn")
    ) {
      closeSettingsPanel();
    }
  });

  // -----------------------------
  // Rendering helpers for rich text
  // -----------------------------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatRichText(text) {
    let html = text;
    
    // Split into lines first for heading detection
    let lines = text.split(/\r?\n/);
    let processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let trimmed = line.trim();
      
      // Skip empty lines initially
      if (!trimmed) {
        processedLines.push("");
        continue;
      }
      
      // DETECT HEADINGS - Markdown style (# ## ###)
      if (/^#{1,3}\s+/.test(trimmed)) {
        const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)/);
        if (headingMatch) {
          const hashes = headingMatch[1].length;
          const title = headingMatch[2];
          const sizeMap = { 1: '22px', 2: '18px', 3: '14px' };
          const size = sizeMap[hashes] || '14px';
          processedLines.push(`<p style="font-size: ${size}; font-weight: 700; color: #8c5d3c; margin-top: 12px; margin-bottom: 6px;">${title}</p>`);
          continue;
        }
      }
      
      // DETECT HEADINGS - Line followed by equals or dashes (===)
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (/^={3,}$/.test(nextLine)) {
          processedLines.push(`<p style="font-size: 22px; font-weight: 700; color: #8c5d3c; margin-top: 12px; margin-bottom: 6px;">${trimmed}</p>`);
          i++; // Skip the next line (the equals signs)
          continue;
        }
        if (/^-{3,}$/.test(nextLine)) {
          processedLines.push(`<p style="font-size: 18px; font-weight: 700; color: #a16b3f; margin-top: 10px; margin-bottom: 6px;">${trimmed}</p>`);
          i++; // Skip the next line (the dashes)
          continue;
        }
      }
      
      // DETECT HEADINGS - ALL CAPS (if more than 3 words, treat as heading)
      if (/^[A-Z\s:]+$/.test(trimmed) && trimmed.split(/\s+/).length >= 2) {
        processedLines.push(`<p style="font-size: 16px; font-weight: 700; color: #c99b72; margin-top: 8px; margin-bottom: 4px;">${trimmed}</p>`);
        continue;
      }
      
      // DETECT SUBHEADINGS - Text ending with colon (Key Point:)
      if (/:\s*$/.test(trimmed)) {
        processedLines.push(`<p style="font-size: 14px; font-weight: 700; color: #a16b3f; margin-top: 6px; margin-bottom: 3px;">${trimmed}</p>`);
        continue;
      }
      
      // Regular line
      processedLines.push(trimmed);
    }
    
    // Now apply explicit formatting to the content
    html = processedLines.join('\n');
    
    // Convert markdown-style formatting
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #8c5d3c;">$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong style="font-weight: 700; color: #8c5d3c;">$1</strong>');
    
    // Italic: *text* or _text_
    html = html.replace(/\*([^*]+)\*/g, '<em style="font-style: italic; color: #a16b3f;">$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em style="font-style: italic; color: #a16b3f;">$1</em>');
    
    // Underline: ~~text~~ (repurposed for underline)
    html = html.replace(/~~(.+?)~~/g, '<u style="text-decoration: underline; text-decoration-color: #c99b72; text-underline-offset: 2px;">$1</u>');
    
    // Colored text: {color:red|text} or {color:#hexcode|text}
    html = html.replace(/\{color:([^|]+)\|([^}]+)\}/g, (match, color, text) => {
      const colorMap = {
        'brown': '#8c5d3c',
        'tan': '#c99b72',
        'gold': '#d4a574',
        'dark': '#654321',
        'rust': '#a16b3f',
        'cream': '#fdf9f4'
      };
      const finalColor = colorMap[color.toLowerCase()] || color;
      return `<span style="color: ${finalColor};">${text}</span>`;
    });
    
    // Font size: {size:sm|text}, {size:lg|text}, {size:xl|text}
    html = html.replace(/\{size:(sm|lg|xl)\|([^}]+)\}/g, (match, size, text) => {
      const sizeMap = {
        'sm': '11px',
        'lg': '16px',
        'xl': '20px'
      };
      return `<span style="font-size: ${sizeMap[size]};">${text}</span>`;
    });
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    // Split into lines and process
    const finalLines = html.split(/<br>/);
    return finalLines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "<p>&nbsp;</p>";
        
        // Skip if already a heading paragraph (contains style attribute)
        if (/<p style=/.test(trimmed)) {
          return trimmed;
        }
        
        // Handle bullet points
        if (/^(•|-|\*)\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^(•|-|\*)\s+/, '');
          return `<p style="margin-left: 16px;">• ${bulletText}</p>`;
        }
        
        // Regular paragraphs with proper spacing
        return `<p style="margin: 6px 0;">${trimmed}</p>`;
      })
      .join("");
  }

  // NEW: Explosion effect for feedback buttons
  function createExplosion(button, symbol) {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create 12 particles that fly up then fall
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("div");
      particle.style.position = "fixed";
      particle.style.left = centerX + "px";
      particle.style.top = centerY + "px";
      particle.style.fontSize = "24px";
      particle.style.fontWeight = "bold";
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "10000";
      particle.textContent = symbol;
      
      // Random color from brown theme
      const colors = ["#8c5d3c", "#c99b72", "#a16b3f", "#d4c3b4"];
      particle.style.color = colors[Math.floor(Math.random() * colors.length)];
      
      document.body.appendChild(particle);
      
      // Spread horizontally
      const angle = (i / 12) * Math.PI * 2;
      const horizontalVelocity = 3 + Math.random() * 3;
      const vx = Math.cos(angle) * horizontalVelocity;
      const vy = -10; // Start going upward
      
      let x = centerX;
      let y = centerY;
      let velocityY = vy;
      let opacity = 1;
      let frame = 0;
      const maxFrames = 80; // Twice as slow
      
      // Animate particle
      const animate = () => {
        frame++;
        x += vx;
        velocityY += 0.3; // Gravity - accelerates downward
        y += velocityY;
        opacity = Math.max(0, 1 - (frame / maxFrames));
        
        particle.style.left = x + "px";
        particle.style.top = y + "px";
        particle.style.opacity = opacity;
        
        if (frame < maxFrames) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      };
      animate();
    }
  }

  // -----------------------------
  // ========== EDIT MESSAGE INLINE ==========
  function enableEditMode(messageRow, originalContent) {
    const bubble = messageRow.querySelector(".chat-bubble");
    const body = bubble.querySelector("div:nth-child(2)");
    
    if (!body) return;

    // Get the current dimensions before we change anything
    const originalHeight = body.offsetHeight;
    const originalWidth = body.offsetWidth;

    // Hide action buttons
    const actionButtons = messageRow.querySelector(".message-action-buttons");
    if (actionButtons) actionButtons.style.display = "none";

    // Style bubble for editing mode - subtle, professional
    bubble.style.background = "linear-gradient(135deg, #fbf7f3 0%, #f9f3ea 100%)";
    bubble.style.border = "1px solid #a16b3f";
    bubble.style.boxShadow = "inset 0 1px 3px rgba(161, 106, 63, 0.1)";
    bubble.style.borderRadius = "12px";

    // Create textarea for editing - EXACT SAME SIZE as bubble (NO HEIGHT REDUCTION!)
    const textarea = document.createElement("textarea");
    textarea.value = originalContent;
    textarea.style.cssText = `
      width: ${originalWidth}px;
      height: ${originalHeight}px;
      padding: 6px;
      border: none;
      border-radius: 0;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.6;
      color: #2b2117;
      background: transparent;
      resize: none;
      overflow-y: auto;
      box-sizing: border-box;
      margin: 0;
      display: block;
    `;

    // Clear body and add textarea only
    body.innerHTML = "";
    body.appendChild(textarea);

    // Create floating button container OUTSIDE the bubble
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 8px;
      padding: 0;
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
      padding: 6px 14px;
      border-radius: 6px;
      border: 1px solid rgba(211, 196, 180, 0.8);
      background: #f5eadd;
      color: #654321;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;
    `;
    cancelBtn.addEventListener("mouseenter", () => { 
      cancelBtn.style.background = "#ede2d4";
      cancelBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    });
    cancelBtn.addEventListener("mouseleave", () => { 
      cancelBtn.style.background = "#f5eadd";
      cancelBtn.style.boxShadow = "none";
    });
    cancelBtn.addEventListener("click", () => {
      disableEditMode(messageRow, originalContent);
      buttonContainer.remove();
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Yes, save";
    saveBtn.style.cssText = `
      padding: 6px 14px;
      border-radius: 6px;
      border: 1px solid #a16b3f;
      background: linear-gradient(135deg, #b07d4f 0%, #916348 100%);
      color: #fdfaf6;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 6px rgba(145, 99, 72, 0.25);
      transition: all 0.2s ease;
    `;
    saveBtn.addEventListener("mouseenter", () => { 
      saveBtn.style.background = "linear-gradient(135deg, #c08c5c 0%, #9d6f4f 100%)";
      saveBtn.style.boxShadow = "0 4px 12px rgba(145, 99, 72, 0.35)";
    });
    saveBtn.addEventListener("mouseleave", () => { 
      saveBtn.style.background = "linear-gradient(135deg, #b07d4f 0%, #916348 100%)";
      saveBtn.style.boxShadow = "0 2px 6px rgba(145, 99, 72, 0.25)";
    });
    saveBtn.addEventListener("click", async () => {
      const editedContent = textarea.value.trim();
      
      if (!editedContent) {
        alert("Message cannot be empty");
        return;
      }

      // Find the message in conversation and update it
      const convo = getActiveConversation();
      if (convo && convo.messages) {
        // Find the index of the user message that matches the original content
        const msgIndex = convo.messages.findIndex(m => m.role === "user" && m.content === originalContent);
        
        if (msgIndex !== -1) {
          // Update the user message
          convo.messages[msgIndex].content = editedContent;

          // Remove all messages after this one (including the AI response)
          convo.messages = convo.messages.slice(0, msgIndex + 1);
          messageHistory = convo.messages.slice();
          saveConversationsToStorage();

          // Update bubble back to normal
          disableEditMode(messageRow, editedContent, true);
          buttonContainer.remove();

          // Remove the AI response bubble from UI
          const aiMessageRows = Array.from(chatLog.querySelectorAll('.chat-message-row.ai'));
          if (aiMessageRows.length > 0) {
            aiMessageRows[aiMessageRows.length - 1].remove();
          }

          // Show thinking bubble and regenerate response with edited message
          showThinkingBubble();
          try {
            const reply = await sendChatToServer(editedContent);
            clearThinkingBubble();
            addMessage("ai", reply, true);
            generateQuickPicksFromResponse(editedContent, reply);
          } catch (err) {
            console.error("❌ Error regenerating response:", err);
            clearThinkingBubble();
            addMessage("ai", "I couldn't regenerate the response. Please try again.", false);
          }
        }
      }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(saveBtn);

    // Insert button container after the message row
    messageRow.parentNode.insertBefore(buttonContainer, messageRow.nextSibling);

    textarea.focus();
    textarea.select();
  }

  function disableEditMode(messageRow, content, wasEdited = false) {
    const bubble = messageRow.querySelector(".chat-bubble");
    const body = bubble.querySelector("div:nth-child(2)");
    
    if (!body) return;

    // Reset bubble style
    bubble.style.background = "";
    bubble.style.border = "";
    bubble.style.borderRadius = "";

    // Replace textarea with text
    body.innerHTML = "";
    body.textContent = content;

    // Show action buttons
    const actionButtons = messageRow.querySelector(".message-action-buttons");
    if (actionButtons) actionButtons.style.display = "flex";
  }

  // Chat message rendering
  // -----------------------------
  function addMessage(role, content, store, options = {}) {
    const row = document.createElement("div");
    row.className = "chat-message-row " + (role === "user" ? "user" : "ai");

    const msg = document.createElement("div");
    msg.className = "chat-message " + (role === "user" ? "user" : "ai");

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";

    const meta = document.createElement("div");
    meta.className = "chat-meta";
    meta.textContent = role === "user" ? getDisplayName() : "Lumon";

    const body = document.createElement("div");

    if (options.type === "image" && options.imageUrl) {
      body.innerHTML = `
        <div style="margin-bottom: 6px;">${escapeHtml(content)}</div>
        <img src="${options.imageUrl}" alt="${escapeHtml(
        content
      )}" style="max-width: 100%; border-radius: 12px; display: block;">
      `;
    } else if (options.attachments && options.attachments.length > 0 && role === "user") {
      // Render user message with attached images
      if (content) {
        body.appendChild(document.createTextNode(content));
      }
      
      // Create attachments container
      const attachmentsDiv = document.createElement("div");
      attachmentsDiv.style.marginTop = "10px";
      attachmentsDiv.style.display = "flex";
      attachmentsDiv.style.gap = "10px";
      attachmentsDiv.style.flexWrap = "wrap";
      
      options.attachments.forEach(att => {
        if (att.type === 'image') {
          const img = document.createElement("img");
          img.src = att.data;
          img.style.maxWidth = "300px";
          img.style.maxHeight = "300px";
          img.style.borderRadius = "12px";
          img.style.display = "block";
          img.alt = att.name;
          attachmentsDiv.appendChild(img);
        }
      });
      
      if (options.attachments.length > 0) {
        body.appendChild(attachmentsDiv);
      }
    } else if (role === "ai") {
      body.innerHTML = formatRichText(content);
    } else {
      body.textContent = content;
    }

    bubble.appendChild(meta);
    bubble.appendChild(body);
    msg.appendChild(bubble);
    
    // Add action buttons for AI responses
    if (role === "ai") {
      const actionButtons = document.createElement("div");
      actionButtons.className = "message-action-buttons";
      
      // Copy button
      const copyBtn = document.createElement("button");
      copyBtn.className = "action-btn copy-btn";
      copyBtn.title = "Copy message";
      copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(content).then(() => {
          copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => { copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'; }, 2000);
        });
      });
      
      // Reload button
      const reloadBtn = document.createElement("button");
      reloadBtn.className = "action-btn reload-btn";
      reloadBtn.title = "Regenerate response";
      reloadBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path></svg>';
      reloadBtn.addEventListener("click", async () => {
        // Get the last user message from conversation history (not UI)
        const convo = getActiveConversation();
        if (!convo || !convo.messages || convo.messages.length < 2) return;
        
        // Find the last user message in the conversation
        const lastUserMsg = convo.messages.filter(m => m.role === "user").pop();
        if (!lastUserMsg) return;
        
        // Remove the last assistant message from the conversation
        if (convo.messages.length > 0 && convo.messages[convo.messages.length - 1].role === "assistant") {
          convo.messages.pop();
        }
        messageHistory = convo.messages.slice();
        saveConversationsToStorage();
        
        // Remove the AI message bubble from the UI
        const aiMessageRows = Array.from(chatLog.querySelectorAll('.chat-message-row.ai'));
        if (aiMessageRows.length > 0) {
          aiMessageRows[aiMessageRows.length - 1].remove();
        }
        
        // Show thinking bubble and regenerate with the user message
        showThinkingBubble();
        try {
          // Pass the message content (or default if empty)
          const messageToSend = lastUserMsg.content || "What is this?";
          const reply = await sendChatToServer(messageToSend);
          clearThinkingBubble();
          addMessage("ai", reply, true);
          
          // Regenerate quick picks if applicable
          generateQuickPicksFromResponse(messageToSend, reply);
        } catch (err) {
          console.error("❌ Regeneration error:", err);
          clearThinkingBubble();
          addMessage("ai", "I couldn't regenerate the response. Please try again.", false);
        }
      });
      
      // Yes - AI understands button
      const yesBtn = document.createElement("button");
      yesBtn.className = "action-btn feedback-btn yes-btn";
      yesBtn.title = "Yes, the AI understands";
      yesBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      yesBtn.addEventListener("click", () => {
        yesBtn.classList.add('active');
        noBtn.classList.remove('active');
        createExplosion(yesBtn, "✓"); // Checkmark explosion
        // Store feedback
        const convo = getActiveConversation();
        if (convo && convo.messages) {
          const lastMsg = convo.messages[convo.messages.length - 1];
          if (lastMsg) lastMsg.feedback = 'yes';
          saveConversationsToStorage();
        }
      });
      
      // No - AI doesn't understand button
      const noBtn = document.createElement("button");
      noBtn.className = "action-btn feedback-btn no-btn";
      noBtn.title = "No, the AI doesn't understand";
      noBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      noBtn.addEventListener("click", () => {
        noBtn.classList.add('active');
        yesBtn.classList.remove('active');
        createExplosion(noBtn, "✕"); // X explosion
        // Store feedback
        const convo = getActiveConversation();
        if (convo && convo.messages) {
          const lastMsg = convo.messages[convo.messages.length - 1];
          if (lastMsg) lastMsg.feedback = 'no';
          saveConversationsToStorage();
        }
      });
      
      // Share button
      const shareBtn = document.createElement("button");
      shareBtn.className = "action-btn share-btn";
      shareBtn.title = "Share message";
      shareBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>';
      shareBtn.addEventListener("click", () => {
        const userMessages = Array.from(chatLog.querySelectorAll('.chat-message-row.user'));
        const shareText = `${getDisplayName()}: ${userMessages.length > 0 ? userMessages[userMessages.length - 1].querySelector('.chat-bubble')?.textContent : ''}\n\nLumon: ${content}`;
        if (navigator.share) {
          navigator.share({ text: shareText }).catch(() => {});
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(shareText).then(() => {
            shareBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(() => { shareBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>'; }, 2000);
          });
        }
      });
      
      actionButtons.appendChild(copyBtn);
      actionButtons.appendChild(reloadBtn);
      actionButtons.appendChild(yesBtn);
      actionButtons.appendChild(noBtn);
      actionButtons.appendChild(shareBtn);
      msg.appendChild(actionButtons);
    } else if (role === "user") {
      // Add action buttons for user messages
      const actionButtons = document.createElement("div");
      actionButtons.className = "message-action-buttons user-message-buttons";
      
      // Copy button
      const copyBtn = document.createElement("button");
      copyBtn.className = "action-btn copy-btn";
      copyBtn.title = "Copy message";
      copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(content).then(() => {
          copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => { copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'; }, 2000);
        });
      });
      
      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "action-btn edit-btn";
      editBtn.title = "Edit message";
      editBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
      editBtn.addEventListener("click", () => {
        enableEditMode(row, content);
      });
      
      actionButtons.appendChild(copyBtn);
      actionButtons.appendChild(editBtn);
      msg.appendChild(actionButtons);
    }
    
    row.appendChild(msg);
    chatLog.appendChild(row);
    
    // NEW: Enhanced autoscroll - immediate + deferred
    autoScrollChatLog();
    setTimeout(() => autoScrollChatLog(), 10);

    if (store) {
      const convo = getActiveConversation();
      if (convo) {
        const storedRole = role === "user" ? "user" : "assistant";
        if (!Array.isArray(convo.messages)) {
          convo.messages = [];
        }
        const stored = {
          role: storedRole,
          content,
        };
        if (options.type === "image" && options.imageUrl) {
          stored.type = "image";
          stored.imageUrl = options.imageUrl;
        }
        if (options.attachments && options.attachments.length > 0) {
          stored.attachments = options.attachments;
        }
        convo.messages.push(stored);
        convo.updatedAt = Date.now();
        messageHistory = convo.messages.slice();
        saveConversationsToStorage();
        renderConversationList();
      }
    }
  }

  // NEW: Dedicated autoscroll function
  function autoScrollChatLog() {
    if (!chatLog) return;
    
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      chatLog.scrollTop = chatLog.scrollHeight;
    });
  }

  // NEW: Auto-resize input
  function autoResizeInput() {
    if (!userInput) return;
    userInput.style.height = "auto";
    const max = 180;
    const newHeight = Math.min(userInput.scrollHeight, max);
    userInput.style.height = newHeight + "px";
  }

  // NEW: Initialize thinking message element (was missing!)
  let thinkingMessageEl = null;

  // UPDATED: Thinking bubble also autoscrolls
  function showThinkingBubble() {
    if (thinkingMessageEl) return;

    const row = document.createElement("div");
    row.className = "chat-message-row ai";

    const msg = document.createElement("div");
    msg.className = "chat-message ai";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";

    const meta = document.createElement("div");
    meta.className = "chat-meta";
    meta.textContent = "Lumon";

    const body = document.createElement("div");
    body.innerHTML = `
      <span class="thinking-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </span>
    `;

    bubble.appendChild(meta);
    bubble.appendChild(body);
    msg.appendChild(bubble);
    row.appendChild(msg);

    thinkingMessageEl = row;
    chatLog.appendChild(row);
    
    // NEW: Autoscroll for thinking bubble
    autoScrollChatLog();
  }

  function clearThinkingBubble() {
    if (thinkingMessageEl) {
      thinkingMessageEl.remove();
      thinkingMessageEl = null;
    }
  }

  // -----------------------------
  // Backend calls
  // -----------------------------
  async function sendChatToServer(text) {
    const convo = getActiveConversation();
    
    // Prepare memories for sending to server
    const memoriesForContext = getRelevantMemories(5).map(m => 
      typeof m === "string" ? m : m.fact
    );
    
    const payload = {
      message: text,
      history: messageHistory,
      profile,
      prefs: { uniqueness: "balanced" },
      session: convo && convo.session ? convo.session : {},
      memories: memoriesForContext,
      extendedCustomizations,
      attachments: attachedFiles.length > 0 ? attachedFiles : undefined,
      formattingInstructions: `
FORMATTING SYNTAX - USE THESE IN EVERY RESPONSE TO ENHANCE VISUAL HIERARCHY:

**Bold (Dark Brown):** **important point** or __emphasized text__
*Italic (Medium Brown):* *context or nuance* or _detailed explanation_
~~Underline:~~ ~~key concept~~

**Colors (use liberally):**
- {color:gold|highlights} for important highlights
- {color:rust|warnings} for cautions or important notes
- {color:tan|secondary} for secondary information
- {color:dark|critical} for critical information

**Font Sizes (create visual hierarchy):**
- {size:xl|MAJOR HEADINGS} for main topics
- {size:lg|Key Points} for important sub-points
- {size:sm|minor details} for supplementary info

**USAGE GUIDELINES - USE FORMATTING IN EVERY RESPONSE:**
1. Make section headers larger with {size:lg|Header}
2. Bold key recommendations with **bold text**
3. Use colors to differentiate types of information
4. Apply italics to explanations and context
5. Use different sizes to guide the reader's eye

**REQUIRED: Include at least one font size variation (lg or xl) and one color in every response.**

Example response format:
{size:xl|Main Topic}
Here's the explanation with **bold highlights** and {color:gold|colored emphasis}.
- {color:tan|Secondary point}: explanation
- *italicized context* for clarity
      `,
      systematicApproach: `
**IMPORTANT: Always ask clarifying questions before providing solutions.**

When a user presents a problem, follow this guided discovery process:

1. **Don't assume the problem** - Ask specific, hierarchical questions that progressively narrow down the issue
2. **Start broad, then get specific**:
   - Example: For a broken tractor, ask:
     * "What brand is your tractor?" (narrows category)
     * "What model and year?" (narrows options)
     * "What specifically isn't working?" (symptom description)
     * "When did this start?" (timeline helps with diagnosis)
     * "Have you noticed any warning signs?" (additional context)
     * "What was the last thing it did successfully?" (baseline)

3. **Build context systematically**:
   - Gather all relevant details BEFORE suggesting solutions
   - Ask about the environment, recent changes, maintenance history
   - Understand what the user has already tried
   - Don't jump to conclusions based on incomplete information

4. **Show your reasoning**:
   - Explain why you're asking each question
   - Help the user understand how details lead to better solutions
   - Use formatting to highlight what information you still need

5. **Only provide solutions after sufficient context**:
   - Once you have enough information, present solutions that are tailored to their specific situation
   - Explain why each solution applies to their particular problem
   - Reference the specific details they provided to show you listened

This approach makes you more helpful and trustworthy because solutions are customized, not generic.
      `,
    };

    console.log("📤 Sending to server:", payload);

    try {
      // CHANGE THIS LINE - use full URL
      const res = await fetch("https://lumonai-production.up.railway.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📥 Response status:", res.status);

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Server error:", res.status, errText);
        throw new Error(`Server responded with ${res.status}: ${errText}`);
      }

      const data = await res.json();
      console.log("✅ Received data:", data);

      if (!data || typeof data !== "object") {
        console.error("❌ Invalid response format:", data);
        throw new Error("Invalid response format from server");
      }

      return data.reply || "I couldn't understand that response.";
    } catch (err) {
      console.error("❌ Fetch error:", err);
      throw err;
    }
  }

  // -----------------------------
  // Message flows
  // -----------------------------
  async function maybeExtractMemories() {
    const convo = getActiveConversation();
    if (!convo || !convo.messages || convo.messages.length < 6) return;
    if (convo.messages.length % 6 === 0) await extractMemoriesFromConversation(convo.messages);
  }

  async function extractMemoriesFromConversation(messages) {
    if (!messages || messages.length < 4) return;
    try {
      const existingMemoryFacts = memories.map(m => typeof m === "string" ? m : m.fact);
      const response = await fetch("https://lumonai-production.up.railway.app/api/extract-memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, existingMemories: existingMemoryFacts }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.memories) && data.memories.length > 0) {
        data.memories.forEach(fact => {
          if (fact && fact.trim().length > 0) addMemory(fact);
        });
        console.log("✨ Extracted " + data.memories.length + " new memories");
      }
    } catch (err) {
      console.error("⚠️ Memory extraction failed:", err.message);
    }
  }

  async function handleTextRequest(trimmed) {
    // Add message with attachments if present
    const attachments = attachedFiles.filter(f => f.type === 'image');
    addMessage("user", trimmed, true, { attachments: attachments });
    
    updateActiveConversationTitleFromFirstUserMessage();
    userInput.value = "";
    const attachmentPreview = document.getElementById("attachment-preview");
    if (attachmentPreview) attachmentPreview.innerHTML = ""; // Clear preview
    autoResizeInput();
    clearThinkingBubble();

    // NEW: Hide session setup when user sends a message
    if (sessionSetup && !sessionSetup.classList.contains("hidden")) {
      sessionSetup.classList.add("hidden");
    }

    showThinkingBubble();
    try {
      console.log("📨 Sending message:", trimmed);
      const reply = await sendChatToServer(trimmed);
      console.log("✅ Got reply:", reply);
      
      clearThinkingBubble();
      addMessage("ai", reply, true);
      
      // NEW: Update Prompt Coach suggestions after each AI response
      increasePromptCoachStrictness();
      populatePromptCoach(trimmed);
      
      // NEW: Auto-generate Quick Picks from Lumon's response
      generateQuickPicksFromResponse(trimmed, reply);
      
      // Extract memories periodically from the conversation
      await maybeExtractMemories();
      
      // Generate AI title after first exchange
      generateAISessionTitle();
      
      // Clear attached files after sending
      attachedFiles = [];
      
    } catch (err) {
      console.error("❌ Chat error:", err);
      clearThinkingBubble();
      addMessage(
        "ai",
        "Hmm, something went wrong reaching the server. Try again in a moment.",
        true
      );
    }
  }

  // NEW: Function to generate Quick Picks from Lumon's response
  async function generateQuickPicksFromResponse(userMessage, lumonResponse) {
    if (!quickPicksBar) return;
    
    try {
      console.log("📡 Checking if Lumon is asking for a choice...");
      
      // ONLY show quick picks if Lumon is asking a QUESTION (for clarification/choice)
      // NOT if Lumon is providing instructions, lists, recipes, steps, etc.
      
      // Signs Lumon is asking for user choice (DO show quick picks):
      const isAsking = /\?\s*$|what|which|choose|select|prefer|help me choose|pick|option|which of|any of these/i.test(lumonResponse);
      
      // Signs Lumon is giving information (DON'T show quick picks):
      const isInstructing = /step|instruction|recipe|procedure|how to|guide|follow|next|do this|then|ingredients|tools needed|materials|required/i.test(lumonResponse);
      
      if (!isAsking || isInstructing) {
        console.log("✅ Lumon is giving information, not asking for choice. Hiding quick picks.");
        quickPicksBar.classList.add("hidden");
        return;
      }
      
      // Generate quick picks via API instead of trying to extract from response
      console.log("✅ Lumon is asking for user input. Generating quick pick options via API...");
      
      try {
        const apiRes = await fetch("https://lumonai-production.up.railway.app/api/quick-picks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            history: messageHistory,
          }),
        });

        if (!apiRes.ok) {
          throw new Error(`API error: ${apiRes.status}`);
        }

        const data = await apiRes.json();
        const options = (data.options || []).filter(opt => opt && typeof opt === 'string');
        
        if (options.length === 0) {
          console.log("⚠️ No options generated");
          quickPicksBar.classList.add("hidden");
          return;
        }

        console.log("✅ Quick picks generated:", options);
        populateQuickPicksWithOptions(options);
        
        if (quickPicksBar.classList.contains("hidden")) {
          quickPicksBar.classList.remove("hidden");
        }
      } catch (apiErr) {
        console.error("❌ Quick picks API error:", apiErr);
        quickPicksBar.classList.add("hidden");
      }

    } catch (err) {
      console.error("❌ Quick picks generation error:", err);
      quickPicksBar.classList.add("hidden");
    }
  }

  // NEW: Function to populate Quick Picks bar with specific options
  function populateQuickPicksWithOptions(options) {
    if (!quickPicksBar || !Array.isArray(options) || options.length === 0) return;
    
    // Clean options: remove markdown formatting, asterisks, truncate to 35 chars
    const cleanOptions = options
      .map(opt => {
        if (!opt) return '';
        // Remove leading/trailing asterisks, dashes, bullets
        let cleaned = opt.replace(/^[*\-•]+\s*|\s*[*\-•]+$/g, '');
        // Remove markdown bold/italic (**text**, *text*, __text__)
        cleaned = cleaned.replace(/[*_]{1,2}(.+?)[*_]{1,2}/g, '$1');
        // Truncate to 35 chars and add ellipsis if needed
        if (cleaned.length > 35) {
          cleaned = cleaned.substring(0, 32) + '...';
        }
        return cleaned.trim();
      })
      .filter(opt => opt.length > 0);
    
    if (cleanOptions.length === 0) return;
    
    // Build HTML with clickable quick picks
    let html = `<div style="display: flex; gap: 6px; padding: 8px 12px; flex-wrap: nowrap; align-items: center; overflow-x: auto; overflow-y: hidden;">`;
    cleanOptions.forEach((option, idx) => {
      html += `<button type="button" class="quick-pick-btn" data-quick-pick="${idx}" title="${option}" style="
        border-radius: 999px;
        border: 1px solid rgba(161, 106, 63, 0.5);
        background: rgba(161, 106, 63, 0.08);
        color: #a16b3f;
        padding: 4px 10px;
        font-size: 11px;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s ease;
      ">${option}</button>`;
    });
    
    // Add reject option with full text initially (will be condensed to X if needed)
    html += `<button type="button" class="quick-pick-btn quick-pick-reject" style="
      border-radius: 999px;
      border: 1px solid rgba(161, 106, 63, 0.3);
      background: rgba(161, 106, 63, 0.04);
      color: #a16b3f;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
      opacity: 0.7;
    "><span class="reject-text">Something different</span><span class="reject-icon" style="display: none;">✕</span></button>`;
    
    // Add close button on the right
    html += `<button type="button" class="quick-pick-close-btn" style="
      margin-left: auto;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: transparent;
      color: #fdfaf6;
      width: 24px;
      height: 24px;
      padding: 0;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      flex-shrink: 0;
    ">✕</button>`;
    
    html += `</div>`;

    quickPicksBar.innerHTML = html;
    
    // Check if content is overflowing and adjust reject button accordingly
    setTimeout(() => {
      const container = quickPicksBar.querySelector('div');
      if (container) {
        const isOverflowing = container.scrollWidth > container.clientWidth;
        const rejectBtn = quickPicksBar.querySelector('.quick-pick-reject');
        const rejectText = quickPicksBar.querySelector('.reject-text');
        const rejectIcon = quickPicksBar.querySelector('.reject-icon');
        const closeBtn = quickPicksBar.querySelector('.quick-pick-close-btn');
        
        if (isOverflowing && rejectBtn) {
          // Hide text, show icon, hide separate close button to avoid duplicate X
          rejectText.style.display = 'none';
          rejectIcon.style.display = 'inline';
          rejectBtn.style.padding = '2px 6px';
          rejectBtn.style.minWidth = '22px';
          rejectBtn.style.textAlign = 'center';
          if (closeBtn) closeBtn.style.display = 'none';
        } else if (rejectBtn) {
          // Show text, hide icon, show close button
          rejectText.style.display = 'inline';
          rejectIcon.style.display = 'none';
          rejectBtn.style.padding = '4px 10px';
          rejectBtn.style.minWidth = 'auto';
          if (closeBtn) closeBtn.style.display = 'flex';
        }
      }
    }, 10);

    // Wire clicks to send selection
    quickPicksBar.querySelectorAll(".quick-pick-btn:not(.quick-pick-reject)").forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        const selected = cleanOptions[idx];
        if (userInput && selected) {
          userInput.value = selected;
          autoResizeInput();
          userInput.focus();
          
          // Slide down and hide the quick picks bar
          if (quickPicksBar) {
            quickPicksBar.style.opacity = "0";
            quickPicksBar.style.transform = "translateX(-50%) translateY(35px)";
            quickPicksBar.style.pointerEvents = "none";
            setTimeout(() => {
              quickPicksBar.classList.add("hidden");
            }, 300);
          }
          
          // Auto-send after brief delay
          setTimeout(() => {
            handleUserMessage(selected);
          }, 100);
        }
      });
      
      // Hover effect
      btn.addEventListener("mouseenter", () => {
        btn.style.background = "rgba(161, 106, 63, 0.18)";
        btn.style.borderColor = "rgba(161, 106, 63, 0.8)";
      });
      
      btn.addEventListener("mouseleave", () => {
        btn.style.background = "rgba(161, 106, 63, 0.08)";
        btn.style.borderColor = "rgba(161, 106, 63, 0.5)";
      });
    });
    
    // Wire reject button to close quick picks
    const rejectBtn = quickPicksBar.querySelector(".quick-pick-reject");
    if (rejectBtn) {
      rejectBtn.addEventListener("click", () => {
        if (quickPicksBar) {
          quickPicksBar.classList.add("hidden");
        }
      });
      
      // Hover effect for reject button
      rejectBtn.addEventListener("mouseenter", () => {
        rejectBtn.style.background = "rgba(161, 106, 63, 0.12)";
        rejectBtn.style.borderColor = "rgba(161, 106, 63, 0.5)";
        rejectBtn.style.opacity = "1";
      });
      
      rejectBtn.addEventListener("mouseleave", () => {
        rejectBtn.style.background = "rgba(161, 106, 63, 0.04)";
        rejectBtn.style.borderColor = "rgba(161, 106, 63, 0.3)";
        rejectBtn.style.opacity = "0.7";
      });
    }
    
    // Wire close button
    const closeBtn = quickPicksBar.querySelector(".quick-pick-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        if (quickPicksBar) {
          quickPicksBar.classList.add("hidden");
        }
      });
      
      // Hover effect for close button
      closeBtn.addEventListener("mouseenter", () => {
        closeBtn.style.background = "rgba(255, 255, 255, 0.2)";
        closeBtn.style.borderColor = "rgba(255, 255, 255, 0.6)";
      });
      
      closeBtn.addEventListener("mouseleave", () => {
        closeBtn.style.background = "transparent";
        closeBtn.style.borderColor = "rgba(255, 255, 255, 0.3)";
      });
    }

    console.log("✅ Quick picks populated with", options.length, "options");
  }

  // -----------------------------
  // Extended customizations state (PREMIUM)
  let extendedCustomizations = {
    depth: "medium",
    assistance: "balanced",
    focusAreas: [],
    knowledge: "experienced",
    communicationStyle: ["casual"],
    timeframe: "15min",
    constraints: "",
    whatTriedAlready: "",
    successCriteria: "",
    examples: "yes",
  };

  // NEW: Character counter for textareas
  function setupCharCounters() {
    extendedTextareas.forEach((ta, idx) => {
      ta.addEventListener("input", () => {
        const maxLength = parseInt(ta.getAttribute("maxlength")) || 200;
        const currentLength = ta.value.length;
        if (extendedCharCounts[idx]) {
          extendedCharCounts[idx].textContent = currentLength;
        }
      });
    });
  }

  // NEW: Extended Customizations Modal Functions
  function openExtendedModal() {
    if (!extendedModal) return;
    extendedModal.classList.remove("hidden");
    syncExtendedUI();
    setupCharCounters();
  }

  function closeExtendedModal() {
    if (!extendedModal) return;
    extendedModal.classList.add("hidden");
  }

  function syncExtendedUI() {
    // Sync single-select chips (depth, assistance, knowledge, timeframe, examples)
    extendedChips.forEach((chip) => {
      const depth = chip.dataset.depth;
      const assist = chip.dataset.assist;
      const knowledge = chip.dataset.knowledge;
      const timeframe = chip.dataset.timeframe;
      const examples = chip.dataset.examples;
      
      if (depth) {
        chip.classList.toggle("extended-chip-active", depth === extendedCustomizations.depth);
      }
      if (assist) {
        chip.classList.toggle("extended-chip-active", assist === extendedCustomizations.assistance);
      }
      if (knowledge) {
        chip.classList.toggle("extended-chip-active", knowledge === extendedCustomizations.knowledge);
      }
      if (timeframe) {
        chip.classList.toggle("extended-chip-active", timeframe === extendedCustomizations.timeframe);
      }
      if (examples) {
        chip.classList.toggle("extended-chip-active", examples === extendedCustomizations.examples);
      }
    });

    // Sync multi-select checkboxes (focusAreas, communicationStyle)
    extendedCheckboxes.forEach((check) => {
      const focus = check.dataset.focus;
      const style = check.dataset.style;
      
      if (focus) {
        check.checked = extendedCustomizations.focusAreas.includes(focus);
      }
      if (style) {
        check.checked = extendedCustomizations.communicationStyle.includes(style);
      }
    });

    // Sync textarea values
    const constraintsTA = document.getElementById("extended-constraints-input");
    const triedTA = document.getElementById("extended-tried-input");
    const successTA = document.getElementById("extended-success-input");
    
    if (constraintsTA) constraintsTA.value = extendedCustomizations.constraints;
    if (triedTA) triedTA.value = extendedCustomizations.whatTriedAlready;
    if (successTA) successTA.value = extendedCustomizations.successCriteria;
  }

  // Wire Extended Customizations modal
  if (sessionExtendedBtn) {
    sessionExtendedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openExtendedModal();
    });
  }

  if (extendedModalClose) {
    extendedModalClose.addEventListener("click", () => {
      closeExtendedModal();
    });
  }

  // Single-select chips (depth, assistance, knowledge, timeframe, examples)
  extendedChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const depth = chip.dataset.depth;
      const assist = chip.dataset.assist;
      const knowledge = chip.dataset.knowledge;
      const timeframe = chip.dataset.timeframe;
      const examples = chip.dataset.examples;
      
      if (depth) {
        extendedCustomizations.depth = depth;
      }
      if (assist) {
        extendedCustomizations.assistance = assist;
      }
      if (knowledge) {
        extendedCustomizations.knowledge = knowledge;
      }
      if (timeframe) {
        extendedCustomizations.timeframe = timeframe;
      }
      if (examples) {
        extendedCustomizations.examples = examples;
      }
      
      syncExtendedUI();
    });
  });

  // Multi-select checkboxes (focusAreas, communicationStyle)
  extendedCheckboxes.forEach((check) => {
    check.addEventListener("change", () => {
      const focus = check.dataset.focus;
      const style = check.dataset.style;
      
      if (focus) {
        if (check.checked) {
          if (!extendedCustomizations.focusAreas.includes(focus)) {
            extendedCustomizations.focusAreas.push(focus);
          }
        } else {
          extendedCustomizations.focusAreas = extendedCustomizations.focusAreas.filter(f => f !== focus);
        }
      }
      
      if (style) {
        if (check.checked) {
          if (!extendedCustomizations.communicationStyle.includes(style)) {
            extendedCustomizations.communicationStyle.push(style);
          }
        } else {
          extendedCustomizations.communicationStyle = extendedCustomizations.communicationStyle.filter(s => s !== style);
        }
      }
    });
  });

  // Textarea inputs
  const constraintsTA = document.getElementById("extended-constraints-input");
  const triedTA = document.getElementById("extended-tried-input");
  const successTA = document.getElementById("extended-success-input");
  
  if (constraintsTA) {
    constraintsTA.addEventListener("input", () => {
      extendedCustomizations.constraints = constraintsTA.value;
    });
  }
  
  if (triedTA) {
    triedTA.addEventListener("input", () => {
      extendedCustomizations.whatTriedAlready = triedTA.value;
    });
  }
  
  if (successTA) {
    successTA.addEventListener("input", () => {
      extendedCustomizations.successCriteria = successTA.value;
    });
  }

  // Reset button
  if (extendedResetBtn) {
    extendedResetBtn.addEventListener("click", () => {
      extendedCustomizations = {
        depth: "medium",
        assistance: "balanced",
        focusAreas: [],
        knowledge: "experienced",
        communicationStyle: ["casual"],
        timeframe: "15min",
        constraints: "",
        whatTriedAlready: "",
        successCriteria: "",
        examples: "yes",
      };
      syncExtendedUI();
    });
  }

  // Save extended customizations
  if (extendedSaveBtn) {
    extendedSaveBtn.addEventListener("click", () => {
      console.log("✅ Extended customizations saved:", extendedCustomizations);
      closeExtendedModal();
      // Save to localStorage so it persists across sessions
      try {
        localStorage.setItem("lumonExtendedCustomizationsV1", JSON.stringify(extendedCustomizations));
      } catch (e) {
        console.warn("Failed to save extended customizations");
      }
    });
  }

  // Close modal when clicking backdrop
  if (extendedModal) {
    extendedModal.addEventListener("click", (e) => {
      if (e.target === extendedModal) {
        closeExtendedModal();
      }
    });
  }

  // Load extended customizations from storage at startup
  function loadExtendedCustomizationsFromStorage() {
    try {
      const stored = localStorage.getItem("lumonExtendedCustomizationsV1");
      if (stored) {
        const data = JSON.parse(stored);
        if (data && typeof data === "object") {
          extendedCustomizations = { ...extendedCustomizations, ...data };
        }
      }
    } catch (e) {
      console.warn("Failed to load extended customizations");
    }
  }

  // Call at startup
  loadExtendedCustomizationsFromStorage();

  // Prompt Coach state tracking
  let promptCoachStrictnessLevel = 0.3; // Starts lenient, gets stricter over time
  let totalUserInteractions = 0; // Track total interactions across all conversations
  
  // Load strictness level from storage
  function loadPromptCoachStrictness() {
    try {
      const stored = localStorage.getItem("lumonPromptCoachStrictnessV1");
      if (stored) {
        const data = JSON.parse(stored);
        if (typeof data.strictness === 'number') {
          promptCoachStrictnessLevel = Math.min(1, data.strictness); // Cap at 1.0
        }
        if (typeof data.interactions === 'number') {
          totalUserInteractions = data.interactions;
        }
      }
    } catch (e) {
      console.warn("Failed to load prompt coach strictness");
    }
  }
  
  // Save strictness level to storage
  function savePromptCoachStrictness() {
    try {
      localStorage.setItem("lumonPromptCoachStrictnessV1", JSON.stringify({
        strictness: promptCoachStrictnessLevel,
        interactions: totalUserInteractions,
        lastUpdated: Date.now()
      }));
    } catch (e) {
      console.warn("Failed to save prompt coach strictness");
    }
  }
  
  // Increase strictness over time (very gradually)
  function increasePromptCoachStrictness() {
    totalUserInteractions++;
    // Increase by 0.001 per interaction (reaches 0.4 after 100 interactions, 0.5 after 200, etc.)
    promptCoachStrictnessLevel = Math.min(1, 0.3 + (totalUserInteractions * 0.001));
    savePromptCoachStrictness();
  }
  
  loadPromptCoachStrictness();

  // NEW: Wire Prompt Coach tab click
  const promptCoachTab = document.getElementById("prompt-coach-tab");
  const promptCoachPanel = document.getElementById("prompt-coach-panel");
  const promptCoachClose = document.getElementById("prompt-coach-close");
  const promptCoachBody = document.getElementById("prompt-coach-body");

  // NEW: Function to populate Prompt Coach with suggestions
  async function populatePromptCoach(userMessage = null) {
    if (!promptCoachBody) {
      console.warn("⚠️ promptCoachBody element not found");
      return;
    }
    
    try {
      console.log("📡 Generating Prompt Coach suggestions...");
      promptCoachBody.innerHTML = `<div class="prompt-coach-muted">Loading suggestions...</div>`;
      
      const currentText = userMessage || (userInput?.value || "").trim() || "";
      const convo = getActiveConversation();
      const conversationDepth = (convo?.messages || []).length;
      
      // Track last update depth to avoid excessive updates
      let lastUpdateDepth = parseInt(localStorage.getItem("lumonCoachLastDepth") || "0");
      
      try {
        const apiRes = await fetch("https://lumonai-production.up.railway.app/api/prompt-coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: currentText,
            history: messageHistory,
            conversationDepth,
            strictnessLevel: promptCoachStrictnessLevel,
            lastUpdateDepth
          }),
        });

        if (!apiRes.ok) {
          throw new Error(`API error: ${apiRes.status}`);
        }

        const data = await apiRes.json();
        const shouldUpdate = data.shouldUpdate;
        
        // If no update needed, skip rendering
        if (!shouldUpdate) {
          console.log("✅ Suggestions still fresh, skipping update");
          return;
        }
        
        const statements = (data.statements || []).filter(s => s && typeof s === 'string');
        const questions = (data.questions || []).filter(q => q && typeof q === 'string');
        const shouldAutoOpen = data.shouldAutoOpen;
        
        if (statements.length === 0 && questions.length === 0) {
          promptCoachBody.innerHTML = `<div class="prompt-coach-muted">Keep sharing! The more details you provide, the better I can help.</div>`;
          return;
        }

        // Auto-open if Lumon thinks user is being too vague
        if (shouldAutoOpen && promptCoachPanel && promptCoachPanel.classList.contains("hidden")) {
          console.log("✅ Auto-opening Prompt Coach - user input too vague");
          promptCoachPanel.classList.remove("hidden");
          if (promptCoachTab) promptCoachTab.classList.add("hidden");
        }

        // Save update depth
        localStorage.setItem("lumonCoachLastDepth", conversationDepth.toString());

        // Build rich HTML with sections and varied styles
        let html = `<div class="coach-body-container">`;
        
        // STATEMENTS SECTION
        if (statements.length > 0) {
          html += `<div class="coach-section">
            <div class="coach-section-label">Start with:</div>
            <div class="coach-statement-grid">`;
          
          statements.forEach((statement, idx) => {
            const size = idx % 3 === 0 ? 'large' : (idx % 3 === 1 ? 'medium' : 'small');
            const displayText = statement.endsWith('...') ? statement : statement + '...';
            const escapedStatement = statement.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += `<button type="button" class="coach-statement coach-statement-${size}" data-coach-statement="${escapedStatement}">${displayText}</button>`;
          });
          
          html += `</div></div>`;
        }
        
        // QUESTIONS SECTION
        if (questions.length > 0) {
          html += `<div class="coach-section">
            <div class="coach-section-label">Lumon asks:</div>
            <div class="coach-question-list">`;
          
          questions.forEach(question => {
            const escapedQuestion = question.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += `<button type="button" class="coach-question" data-coach-question="${escapedQuestion}">
              <span class="question-mark">?</span>
              <span class="question-text">${question}</span>
            </button>`;
          });
          
          html += `</div></div>`;
        }
        
        html += `</div>`;
        promptCoachBody.innerHTML = html;

        // Wire statement clicks - insert as-is
        promptCoachBody.querySelectorAll(".coach-statement").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            let statement = btn.dataset.coachStatement;
            // Decode HTML entities
            statement = statement.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            if (userInput) {
              userInput.value = statement;
              autoResizeInput();
              userInput.focus();
            }
          });
        });
        
        // Wire question clicks - transform question to statement
        promptCoachBody.querySelectorAll(".coach-question").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            e.preventDefault();
            let question = btn.dataset.coachQuestion;
            // Decode HTML entities
            question = question.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            
            // Transform question to statement using AI
            try {
              const transformRes = await fetch("https://lumonai-production.up.railway.app/api/transform-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, userMessage: currentText }),
              });
              
              if (transformRes.ok) {
                const transformData = await transformRes.json();
                if (transformData.statement && userInput) {
                  userInput.value = transformData.statement;
                  autoResizeInput();
                  userInput.focus();
                }
              }
            } catch (err) {
              console.error("❌ Transform error:", err);
              // Fallback: use question as-is
              if (userInput) {
                userInput.value = question;
                autoResizeInput();
                userInput.focus();
              }
            }
          });
        });

        console.log("✅ Prompt Coach updated with", statements.length, "statements +", questions.length, "questions");

      } catch (apiErr) {
        console.error("❌ Prompt coach API error:", apiErr);
        promptCoachBody.innerHTML = `<div class="prompt-coach-muted">Ready to help! Share what's on your mind.</div>`;
      }

    } catch (err) {
      console.error("❌ Coach error:", err);
      promptCoachBody.innerHTML = `<div class="prompt-coach-muted">Ready to help! Share what's on your mind.</div>`;
    }
  }

  if (promptCoachTab) {
    promptCoachTab.addEventListener("click", (e) => {
      e.stopPropagation();
      if (promptCoachPanel) {
        promptCoachPanel.classList.remove("hidden");
        promptCoachTab.classList.add("hidden");
        
        // NEW: Populate with suggestions when opening
        populatePromptCoach();
        
        promptCoachPanel.offsetHeight;
      }
    });
  }

  if (promptCoachClose) {
    promptCoachClose.addEventListener("click", (e) => {
      e.stopPropagation();
      if (promptCoachPanel) {
        promptCoachPanel.classList.add("hidden");
        setTimeout(() => {
          promptCoachTab.classList.remove("hidden");
        }, 350);
      }
    });
  }

  // NEW: Placeholder rotation
  const placeholders = [
    "What's on your mind?",
    "Tell me what you're thinking...",
    "What do you need help with?",
    "Share what's troubling you...",
    "Let's explore this together..."
  ];

  function setRandomPlaceholder() {
    if (!userInput) return;
    const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
    userInput.placeholder = randomPlaceholder;
  }

  // Set initial placeholder on load
  setRandomPlaceholder();

  // Optional: Change placeholder on new chat
  if (newChatBtn) {
    const originalNewChatClick = newChatBtn.onclick;
    newChatBtn.addEventListener("click", () => {
      setRandomPlaceholder();
    });
  }

  async function handleUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed && attachedFiles.length === 0) return;
    await handleTextRequest(trimmed);
  }

  // Wire send, enter key, resize
  if (sendButton) {
    sendButton.addEventListener("click", () => {
      handleUserMessage(userInput.value);
    });
  }

  if (userInput) {
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleUserMessage(userInput.value);
      }
    });

    userInput.addEventListener("input", autoResizeInput);
    autoResizeInput();
  }

  // ========== Image Lightbox Modal ==========
  const lightbox = document.getElementById("image-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxZoomLevel = document.querySelector(".lightbox-zoom-level");
  const lightboxZoomIn = document.querySelector(".lightbox-zoom-in");
  const lightboxZoomOut = document.querySelector(".lightbox-zoom-out");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxOverlay = document.querySelector(".lightbox-overlay");
  
  let currentZoom = 100;
  const MIN_ZOOM = 50;
  const MAX_ZOOM = 300;
  const ZOOM_STEP = 25;
  const INITIAL_ZOOM = 30; // Start zoomed out

  // Add click handler to all images in chat (current and future)
  function setupImageLightbox(img) {
    if (!img || img.classList.contains("lightbox-enabled")) return;
    img.classList.add("lightbox-enabled");
    img.style.cursor = "pointer";
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      openLightbox(img.src);
    });
  }

  // Setup for existing images
  document.querySelectorAll("#chat-log img").forEach(img => setupImageLightbox(img));

  // Observer to setup lightbox for newly added images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const imgs = node.querySelectorAll("img");
            imgs.forEach(img => setupImageLightbox(img));
            if (node.tagName === "IMG") setupImageLightbox(node);
          }
        });
      }
    });
  });

  if (chatLog) {
    observer.observe(chatLog, { childList: true, subtree: true });
  }

  function openLightbox(imageSrc) {
    lightboxImage.src = imageSrc;
    currentZoom = INITIAL_ZOOM; // Start at 60%
    updateZoom();
    lightbox.classList.remove("hidden");
    // Blur background and move input bar behind
    document.body.style.overflow = "hidden";
    if (chatLog) chatLog.style.filter = "blur(8px)";
    if (chatInputBar) {
      chatInputBar.style.filter = "blur(8px)";
      chatInputBar.classList.add("behind-lightbox");
    }
  }

  function closeLightbox() {
    lightbox.classList.add("hidden");
    currentZoom = 100;
    // Remove blur and restore input bar
    document.body.style.overflow = "";
    if (chatLog) chatLog.style.filter = "";
    if (chatInputBar) {
      chatInputBar.style.filter = "";
      chatInputBar.classList.remove("behind-lightbox");
    }
  }

  function updateZoom() {
    lightboxImage.style.transform = `scale(${currentZoom / 100})`;
    lightboxZoomLevel.textContent = `${currentZoom}%`;
  }

  function zoomIn() {
    if (currentZoom < MAX_ZOOM) {
      currentZoom += ZOOM_STEP;
      updateZoom();
    }
  }

  function zoomOut() {
    if (currentZoom > MIN_ZOOM) {
      currentZoom -= ZOOM_STEP;
      updateZoom();
    }
  }

  // Event listeners
  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxOverlay) {
    lightboxOverlay.addEventListener("click", closeLightbox);
  }

  if (lightboxZoomIn) {
    lightboxZoomIn.addEventListener("click", zoomIn);
  }

  if (lightboxZoomOut) {
    lightboxZoomOut.addEventListener("click", zoomOut);
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "+") zoomIn();
    if (e.key === "-") zoomOut();
  });

  // Mouse wheel zoom
  lightboxImage.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  });

  // ========== Settings, Archive, Trash Menus ==========
  const settingsModal = document.getElementById("settings-modal");
  const settingsBtn = document.getElementById("sidebar-settings-btn");
  const settingsCloseBtn = document.getElementById("settings-close-btn");

  function blurBackground() {
    if (chatLog) chatLog.style.filter = "blur(6px)";
    if (chatInputBar) chatInputBar.style.filter = "blur(6px)";
  }

  function unblurBackground() {
    if (chatLog) chatLog.style.filter = "";
    if (chatInputBar) chatInputBar.style.filter = "";
  }

  // Settings menu
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      settingsModal.classList.remove("hidden");
      blurBackground();
    });
  }

  if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener("click", () => {
      settingsModal.classList.add("hidden");
      unblurBackground();
    });
  }

  // Close settings if backdrop clicked
  const settingsBackdrop = settingsModal ? settingsModal.querySelector(".center-modal-backdrop") : null;
  if (settingsBackdrop) {
    settingsBackdrop.addEventListener("click", () => {
      settingsModal.classList.add("hidden");
      unblurBackground();
    });
  }

  // Settings tabs functionality
  const settingsTabs = document.querySelectorAll(".settings-tab");
  const settingsTabContents = document.querySelectorAll(".settings-tab-content");

  settingsTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");
      
      // Remove active from all tabs
      settingsTabs.forEach(t => t.classList.remove("active"));
      settingsTabContents.forEach(content => content.classList.remove("active"));
      
      // Add active to clicked tab
      tab.classList.add("active");
      const activeContent = document.getElementById(`tab-${tabName}`);
      if (activeContent) {
        activeContent.classList.add("active");
        // Update memories UI when memories tab is opened
        if (tabName === "memories") {
          updateMemoriesUI();
        }
      }
    });
  });

  // Clear all memories button
  const clearAllMemoriesBtn = document.getElementById("clear-all-memories-btn");
  if (clearAllMemoriesBtn) {
    clearAllMemoriesBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all memories? This cannot be undone.")) {
        memories = [];
        saveMemoriesToStorage();
        updateMemoriesUI();
        console.log("✨ All memories cleared");
      }
    });
  }

  // Theme radio buttons
  const themeRadios = document.querySelectorAll('input[name="theme"]');
  themeRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      applyTheme(e.target.value);
    });
    // Set initial checked state based on current theme
    if (radio.value === currentTheme) {
      radio.checked = true;
    }
  });

  // AI Model preferences
  const toneRadios = document.querySelectorAll('input[name="tone"]');
  const lengthRadios = document.querySelectorAll('input[name="length"]');

  toneRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      prefs.tone = e.target.value;
      savePrefsToStorage();
    });
    if (radio.value === (prefs.tone || "formal")) {
      radio.checked = true;
    }
  });

  lengthRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      prefs.responseLength = e.target.value;
      savePrefsToStorage();
    });
    if (radio.value === (prefs.responseLength || "balanced")) {
      radio.checked = true;
    }
  });

  // Privacy settings
  const privacyCheckbox = document.getElementById("privacy-local-storage");
  if (privacyCheckbox) {
    privacyCheckbox.checked = prefs.localStorageEnabled !== false;
    privacyCheckbox.addEventListener("change", (e) => {
      prefs.localStorageEnabled = e.target.checked;
      savePrefsToStorage();
    });
  }

  // Clear all data button
  const clearDataBtn = document.getElementById("clear-all-data-btn");
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete all conversations? This cannot be undone.")) {
        try {
          localStorage.removeItem(CONVERSATIONS_KEY);
          conversations = [];
          currentConversationId = null;
          chatLog.innerHTML = "";
          addMessage("assistant", "All conversations have been cleared.", false);
        } catch (e) {
          console.error("Error clearing conversations:", e);
        }
      }
    });
  }

  // Notifications preferences
  const notifSessionTips = document.getElementById("notif-session-tips");
  const notifPrompts = document.getElementById("notif-prompts");

  if (notifSessionTips) {
    notifSessionTips.checked = prefs.sessionTips !== false;
    notifSessionTips.addEventListener("change", (e) => {
      prefs.sessionTips = e.target.checked;
      savePrefsToStorage();
    });
  }

  if (notifPrompts) {
    notifPrompts.checked = prefs.promptSuggestions !== false;
    notifPrompts.addEventListener("change", (e) => {
      prefs.promptSuggestions = e.target.checked;
      savePrefsToStorage();
    });
  }

  // Profile settings
  const profileNameInputSettings = document.getElementById("profile-name-input-settings");
  const profileDeleteBtn = document.getElementById("settings-delete-account-btn");

  if (profileNameInputSettings) {
    profileNameInputSettings.value = profile.name || "";
    profileNameInputSettings.addEventListener("blur", () => {
      profile.name = profileNameInputSettings.value || "User";
      saveProfileToStorage();
      // Update profile chip if visible
      if (profileChipName) profileChipName.textContent = profile.name;
      if (profileAvatarInitial) profileAvatarInitial.textContent = profile.name.charAt(0).toUpperCase();
    });
  }

  if (profileDeleteBtn) {
    profileDeleteBtn.addEventListener("click", () => {
      if (confirm("Delete your account and all local data? This cannot be undone.")) {
        try {
          localStorage.removeItem(PROFILE_KEY);
          localStorage.removeItem(CONVERSATIONS_KEY);
          localStorage.removeItem(PREFS_KEY);
          profile = { name: "User", aiExperience: "beginner" };
          conversations = [];
          currentConversationId = null;
          prefs = { theme: "light", tone: "formal", responseLength: "balanced", sessionTips: true, promptSuggestions: true, localStorageEnabled: true };
          settingsModal.classList.add("hidden");
          unblurBackground();
          location.reload();
        } catch (e) {
          console.error("Error deleting account:", e);
        }
      }
    });
  }

  // Archive Done button
  const archiveDoneBtn = document.getElementById("archive-done-btn");
  if (archiveDoneBtn) {
    archiveDoneBtn.addEventListener("click", () => {
      closeArchivePanel();
    });
  }

  // Archive backdrop click
  const archiveBackdrop = archivePanel ? archivePanel.querySelector(".center-modal-backdrop") : null;
  if (archiveBackdrop) {
    archiveBackdrop.addEventListener("click", () => {
      closeArchivePanel();
    });
  }

  // Trash Done button
  const trashDoneBtn = document.getElementById("trash-done-btn");
  if (trashDoneBtn) {
    trashDoneBtn.addEventListener("click", () => {
      closeTrashPanel();
    });
  }

  // Trash backdrop click
  const trashBackdrop = trashPanel ? trashPanel.querySelector(".center-modal-backdrop") : null;
  if (trashBackdrop) {
    trashBackdrop.addEventListener("click", () => {
      closeTrashPanel();
    });
  }

  // Close menus with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!settingsModal.classList.contains("hidden")) {
        settingsModal.classList.add("hidden");
        unblurBackground();
      }
      if (!archivePanel.classList.contains("hidden")) {
        archivePanel.classList.add("hidden");
        unblurBackground();
      }
      if (!trashPanel.classList.contains("hidden")) {
        trashPanel.classList.add("hidden");
        unblurBackground();
      }
    }
  });
})();
