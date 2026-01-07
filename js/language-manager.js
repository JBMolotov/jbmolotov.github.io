document.addEventListener("DOMContentLoaded", function () {
  const LANG_PREF_KEY = "language-preference-v1";
  const langToggleBtn = document.getElementById("language-toggle");
  const langIcon = langToggleBtn ? langToggleBtn.querySelector("span") : null;
  
  // Default to Portuguese if not set
  let currentLang = "pt-br";

  function loadLanguagePref() {
    try {
      const stored = window.localStorage.getItem(LANG_PREF_KEY);
      if (stored && (stored === "pt-br" || stored === "en")) {
        return stored;
      }
    } catch (e) {
      console.warn("Could not load language preference", e);
    }
    return "pt-br";
  }

  function saveLanguagePref(lang) {
    try {
      window.localStorage.setItem(LANG_PREF_KEY, lang);
    } catch (e) {
      console.warn("Could not save language preference", e);
    }
  }

  function updateTypewriter(texts) {
    // Check if the typewriter restart function is exposed
    if (window.restartTypewriter && Array.isArray(texts)) {
       window.restartTypewriter(texts);
    }
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update all elements with data-i18n
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang][key]) {
        // Handle input placeholders if needed, but mostly textContent
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
            el.placeholder = translations[lang][key];
        } else {
            // Check if it has child elements that we shouldn't overwrite (like icons)
            // For this simple case, most keys map directly to text.
            // If the element has specific children we need to preserve, we might need a more complex strategy.
            // But looking at the HTML, most text is in leaf nodes or can be replaced.
            
            // Special case for elements with icons (like buttons)
            // If the key translates to text that should verify nested structure
            
            if (el.children.length > 0 && !el.classList.contains("typewriter")) {
                 // Try to find a text node to replace
                 let textNode = null;
                 el.childNodes.forEach(node => {
                     if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                         textNode = node;
                     }
                 });
                 if (textNode) {
                     textNode.textContent = translations[lang][key];
                 } else {
                     // Fallback, might wipe icons
                     // Check specific known patterns or just Replace innerHTML if simple
                     // For the "Copy email" button: <i class="fas fa-copy"></i> Copiar e-mail
                     if (el.classList.contains("copy-email-btn")) {
                         const icon = el.querySelector("i").outerHTML;
                         el.innerHTML = `${icon} ${translations[lang][key]}`;
                     } else if (el.classList.contains("contact-email")) {
                         const icon = el.querySelector("i").outerHTML;
                         el.innerHTML = `${icon} ${translations[lang][key]}`;
                     } else {
                        // safest for now
                        el.innerText = translations[lang][key]; 
                     }
                 }
            } else {
                el.textContent = translations[lang][key];
            }
        }
      }
    });

    // Update Typewriter
    if (translations[lang]["typewriter-texts"]) {
        window.initialTypewriterTexts = translations[lang]["typewriter-texts"];
        updateTypewriter(translations[lang]["typewriter-texts"]);
    }
    
    // Update Toggle Button Text/Icon
    if (langIcon) {
        langIcon.textContent = lang === "en" ? "PT" : "EN";
    }
    
    saveLanguagePref(lang);
  }

  // Initialize
  const savedLang = loadLanguagePref();
  setLanguage(savedLang);

  // Event Listener
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", () => {
      const newLang = currentLang === "pt-br" ? "en" : "pt-br";
      setLanguage(newLang);
    });
  }
});
