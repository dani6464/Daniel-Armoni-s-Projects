// ===== Available Models =====
const MODELS = [
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku', display: 'Claude Haiku' }
];

// ===== Slider Configuration =====
const SLIDER_CONFIG = {
  verbosity: {
    "1": "Very Concise. Try to be around 80 words total, one short paragraph. Keep every sentence as brief as possible. IMPORTANT: Maintain proper grammar and complete sentences. Do NOT omit basic words like articles (a, the) or prepositions.",
    "2": "Concise. Try to be around 120 words total. Use short sentences. IMPORTANT: Maintain proper grammar and complete sentences. Do NOT omit basic words like articles (a, the) or prepositions.",
    "3": "Balanced. Try to be around 160 words total. Standard cover letter length. (Baseline)",
    "4": "Detailed. Try to be around 200 words total. Provide longer explanations of skills and experience.",
    "5": "Very Detailed. Try to be around 240 words total, multiple paragraphs. Elaborate deeply on every point."
  },
  tone: {
    "1": "Very Analytical. Try to be around 0% of claim-sentences carrying an affect or motivation marker. Every claim is evidence-based: credentials, responsibilities, results. State no feelings, enthusiasm, personal motivation, or values. Do not change the total word count set by Verbosity.",
    "2": "Analytical. Try to be around 25% of claim-sentences carrying an affect or motivation marker (e.g., 'I care about...', 'what draws me to this role...'); the remaining ~75% are evidence-only statements. Do not change the total word count set by Verbosity.",
    "3": "Balanced. Try to be around 50% of claim-sentences carrying an affect or motivation marker; the other ~50% are evidence-only statements. Do not change the total word count set by Verbosity. (Baseline)",
    "4": "Warm. Try to be around 75% of claim-sentences carrying an affect or motivation marker (e.g., 'I\\'m genuinely excited by...', 'this work matters to me because...'); the remaining ~25% are evidence-only. Do not change the total word count set by Verbosity.",
    "5": "Very Warm. Try to be around 100% of claim-sentences carrying an affect or motivation marker. Frame every qualification through personal meaning, enthusiasm, values, or relationship to people. Do not change the total word count set by Verbosity."
  },
  "self-promotion": {
    "1": "Very Modest. Try to be around 0% of achievement-sentences using superlative or quantified-impact language. Describe contributions plainly using tentative language (e.g., 'I contributed to...', 'I was involved in...', 'I believe I can...').",
    "2": "Modest. Try to be around 25% of achievement-sentences using emphatic language; the remaining ~75% plain or tentative statements (e.g., 'I contributed').",
    "3": "Balanced. Try to be around 50% of achievement-sentences using emphatic or quantified-impact language; the other ~50% stated plainly. (Baseline)",
    "4": "Bold. Try to be around 75% of achievement-sentences using emphatic or quantified-impact language. Use strong, confident words (e.g., 'strongly', 'excellent', 'I have X', 'increased X by Y%').",
    "5": "Very Bold. Try to be around 100% of achievement-sentences using superlative or quantified-impact language, presenting the candidate as the strongest possible choice using highly confident words (e.g., 'outstanding', 'strongly', 'excellent')."
  }
};

const SLIDER_LABELS = {
  he: {
    verbosity: ["תמציתי מאוד", "תמציתי", "מאוזן", "מפורט", "מפורט מאוד"],
    tone: ["אנליטי מאוד", "אנליטי", "מאוזן", "חם", "חם מאוד"],
    "self-promotion": ["צנוע מאוד", "צנוע", "מאוזן", "מדגיש הישגים", "מדגיש הישגים מאוד"]
  },
  en: {
    verbosity: ["Very concise", "Concise", "Balanced", "Detailed", "Very detailed"],
    tone: ["Very analytical", "Analytical", "Balanced", "Warm", "Very warm"],
    "self-promotion": ["Very modest", "Modest", "Balanced", "Bold", "Very bold"]
  }
};

const i18n = {
  he: {
    welcome_title: "ברוכים הבאים לעוזר החכם",
    welcome_desc: "",
    login_title: "ברוכים הבאים למחקר",
    login_hint: "Ask the researcher עבור מספר המשתתף שלך.",
    next_btn: "המשך",
    onboarding_title: "בואו נבנה את המכתב המקדים שלך",
    q1_label: "1. תפקיד שהיית רוצה לעבוד בו בעוד שנה:",
    q2_label: "2. חמש תכונות שלך שהופכות אותך למועמד מתאים לתפקיד:",
    q3_label: "3. משפט אחד על ניסיון רלוונטי שיש לך. (ללא שמות!):",
    start_btn: "התחל",
    canvas_title: "טיוטת מכתב",
    timer_warning: "נשארו 2 דקות!",
    submit_btn: "מוכן להגשה",
    canvas_placeholder: "העוזר החכם שלך יכתוב את הטיוטה כאן.",
    input_placeholder: "הקלד כאן את ההודעה...",
    controls_title: "בקרת תגובה",
    verbosity: "פירוט",
    tone: "טון",
    self_promotion: "קידום עצמי",
    back_btn: "חזור",
    confirm_start: "לא ניתן לחזור ולשנות את התשובות לאחר תחילת המשימה. האם להמשיך?",
    task_desc_title: "המשימה שלך",
    api_config: "🔑 הגדרות API",
    save: "שמור",
    enter_api_key_placeholder: "הכנס מפתח API...",
    enter_api_key: "מפתח API",
    update_letter_btn: "עדכן מכתב"
  },
  en: {
    welcome_title: "Welcome to your AI assistant",
    welcome_desc: "",
    login_title: "Welcome to the Study",
    login_hint: "Ask the researcher for your participant number.",
    next_btn: "Next",
    onboarding_title: "Let's build your cover letter",
    q1_label: "1. A position you would enjoy working in one year from now:",
    q2_label: "2. Five things about yourself that would make you a good candidate for that role:",
    q3_label: "3. One sentence about relevant experience you have. (No names!):",
    start_btn: "Start",
    canvas_title: "Cover Letter Draft",
    timer_warning: "2 Minutes Remaining!",
    submit_btn: "Ready to Submit",
    canvas_placeholder: "Your AI assistant will write the draft here.",
    input_placeholder: "Type your message...",
    controls_title: "Response Controls",
    verbosity: "Verbosity",
    tone: "Tone",
    self_promotion: "Self-Promotion",
    back_btn: "Back",
    confirm_start: "You cannot change your answers after starting. Proceed?",
    task_desc_title: "Your Task",
    api_config: "🔑 API Configuration",
    save: "Save",
    enter_api_key_placeholder: "Enter Anthropic API Key...",
    enter_api_key: "API Key",
    update_letter_btn: "Update Letter"
  }
};

// ===== App State & Logger =====
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw0-79H6koOtJlEJGJ3rV96nsUbbbcmGr-FpSm6gJR-2bzOzm4tsSBDMVaK7p5u-LZU/exec";
// API Key is managed via Vercel Environment Variables (ANTHROPIC_API_KEY)
const ANTHROPIC_API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";

const urlParams = new URLSearchParams(window.location.search);
const isOperator = urlParams.get('o') === '1';
if (isOperator) {
  document.body.classList.add('operator-mode');
}
let currentCondition = parseInt(urlParams.get('c')) || 1; // 1: Hidden, 2: Locked, 3: Controllable
let currentLang = 'en';
let currentActiveModel = MODELS[0].id;
let activeChat = { messages: [] };
let onboardingContext = "";

const Logger = {
  participantNumber: null,
  condition: currentCondition,
  language: currentLang,
  startTime: null,
  submitTime: null,
  totalCharactersTyped: 0,
  promptsSent: 0,
  promptsSentAfterSubmitAppeared: 0,
  totalSliderChanges: 0,
  verbosityChanges: 0,
  toneChanges: 0,
  selfPromotionChanges: 0,
  sliderChanges: [],
  submitAppearedTime: null,
  finalCoverLetter: "",
  
  logSliderChange(slider, oldVal, newVal) {
    // Basic trace log, but counts are handled on send
  },

  logSentSliderChanges() {
    if (currentCondition !== 3) return;
    let changed = false;
    if (currentSliders.verbosity !== lastSentSliders.verbosity) {
      this.verbosityChanges++;
      this.totalSliderChanges++;
      changed = true;
    }
    if (currentSliders.tone !== lastSentSliders.tone) {
      this.toneChanges++;
      this.totalSliderChanges++;
      changed = true;
    }
    if (currentSliders["self-promotion"] !== lastSentSliders["self-promotion"]) {
      this.selfPromotionChanges++;
      this.totalSliderChanges++;
      changed = true;
    }
    
    if (changed) {
      this.sliderChanges.push({
        timestamp: new Date().toISOString(),
        slidersAtSend: { ...currentSliders }
      });
      lastSentSliders = { ...currentSliders };
    }
  },
  
  async sendLog() {
    this.finalCoverLetter = document.getElementById('cover-letter-canvas').innerText;
    
    if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE") {
      console.warn("Google Script URL is not set. Log will not be saved.");
      return;
    }
    
    try {
      // Using no-cors and text/plain to avoid CORS preflight issues with Google Scripts
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(this)
      });
      console.log('Log submitted successfully to Google Sheets');
    } catch (err) {
      console.error('Error submitting log:', err);
    }
  }
};

let baselineSliders = { verbosity: 2, tone: 4, "self-promotion": 2 };
let currentSliders = { ...baselineSliders };
let lastSentSliders = { ...baselineSliders };

// ===== Timers =====
let sessionTimer = null;
let submitTimer = null;
let canSubmit = false;

// ===== DOM Elements =====
const htmlEl = document.documentElement;
const loginOverlay = document.getElementById('login-overlay');
const loginNextBtn = document.getElementById('login-next-btn');
const participantInput = document.getElementById('participant-id');
const onboardingOverlay = document.getElementById('onboarding-overlay');
const startTaskBtn = document.getElementById('start-task-btn');
const appContainer = document.getElementById('app');
const canvasEl = document.getElementById('cover-letter-canvas');
const timerDisplay = document.getElementById('timer-display');
const submitBtn = document.getElementById('submit-letter-btn');

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const apiKeyInput = document.getElementById('api-key-input');
const saveKeyBtn = document.getElementById('save-key-btn');
const apiKeyStatus = document.getElementById('api-key-status');

const sliders = {
  verbosity: document.getElementById('slider-verbosity'),
  tone: document.getElementById('slider-tone'),
  "self-promotion": document.getElementById('slider-self-promotion')
};

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  // Check API Key
  const savedKey = localStorage.getItem('anthropic_api_key');
  if (savedKey) {
    apiKeyInput.value = savedKey;
    updateApiKeyStatus(true);
  }
  
  // Settings modal
  document.getElementById('settings-toggle-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('open');
  });
  document.getElementById('settings-close-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.remove('open');
  });
  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem('anthropic_api_key', key);
      updateApiKeyStatus(true);
    } else {
      localStorage.removeItem('anthropic_api_key');
      updateApiKeyStatus(false);
    }
  });
  
  // Apply condition UI rules
  applyConditionRules();

  // Custom Alert
  window.showCustomAlert = function(message) {
    document.getElementById('custom-alert-text').textContent = message;
    document.getElementById('custom-alert-overlay').classList.add('active');
  };
  document.getElementById('custom-alert-btn').addEventListener('click', () => {
    document.getElementById('custom-alert-overlay').classList.remove('active');
  });

  // Custom Confirm
  window.showCustomConfirm = function(message, onConfirm) {
    document.getElementById('custom-confirm-text').textContent = message;
    
    // Update buttons text for Hebrew/English
    document.getElementById('custom-confirm-cancel-btn').textContent = currentLang === 'he' ? 'ביטול' : 'Cancel';
    document.getElementById('custom-confirm-ok-btn').textContent = currentLang === 'he' ? 'אישור' : 'OK';
    
    const overlay = document.getElementById('custom-confirm-overlay');
    overlay.classList.add('active');

    const okBtn = document.getElementById('custom-confirm-ok-btn');
    const cancelBtn = document.getElementById('custom-confirm-cancel-btn');
    
    // Remove old listeners to avoid multiple fires
    const newOkBtn = okBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newOkBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      onConfirm();
    });
    newCancelBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });
  };

  // Login Flow
  loginNextBtn.addEventListener('click', () => {
    const pId = participantInput.value.trim();
    if (!pId) return showCustomAlert('Please enter Participant Number');
    Logger.participantNumber = pId;
    currentLang = document.querySelector('input[name="lang"]:checked').value;
    applyLanguage(currentLang);
    Logger.language = currentLang;
    loginOverlay.classList.remove('active');
    onboardingOverlay.classList.add('active');
  });

  // Onboarding Flow - Multi-step
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  
  document.getElementById('back-step-1').addEventListener('click', () => {
    onboardingOverlay.classList.remove('active');
    loginOverlay.classList.add('active');
  });

  document.getElementById('next-step-1').addEventListener('click', () => {
    if (!document.getElementById('q1-input').value.trim()) return showCustomAlert(currentLang === 'he' ? 'אנא ענו על השאלה' : 'Please answer the question');
    step1.style.display = 'none';
    step2.style.display = 'flex';
  });

  document.getElementById('back-step-2').addEventListener('click', () => {
    step2.style.display = 'none';
    step1.style.display = 'flex';
  });

  document.getElementById('next-step-2').addEventListener('click', () => {
    const q2_1 = document.getElementById('q2-1').value.trim();
    const q2_2 = document.getElementById('q2-2').value.trim();
    const q2_3 = document.getElementById('q2-3').value.trim();
    const q2_4 = document.getElementById('q2-4').value.trim();
    const q2_5 = document.getElementById('q2-5').value.trim();
    if (!q2_1 || !q2_2 || !q2_3 || !q2_4 || !q2_5) return showCustomAlert(currentLang === 'he' ? 'אנא מלאו את כל 5 התכונות' : 'Please fill in all 5 slots');
    step2.style.display = 'none';
    step3.style.display = 'flex';
  });

  document.getElementById('back-step-3').addEventListener('click', () => {
    step3.style.display = 'none';
    step2.style.display = 'flex';
  });

  const step4 = document.getElementById('step-4');

  document.getElementById('next-step-3').addEventListener('click', () => {
    const q1 = document.getElementById('q1-input').value.trim();
    const q3 = document.getElementById('q3-input').value.trim();
    if (!q3) return showCustomAlert(currentLang === 'he' ? 'אנא ענו על השאלה' : 'Please answer the question');
    
    const textEl = document.getElementById('task-desc-text');
    const baseTextHe = `במשימה זו, תעבוד/תעבדי עם בינה מלאכותית (AI) כדי ליצור מכתב מקדים. מכתב מקדים הוא מסמך הנשלח יחד עם קורות החיים שלך כדי לספק מידע נוסף על הכישורים והניסיון שלך. זו ההזדמנות שלך להסביר מדוע את/ה המועמד/ת המתאימ/ה ביותר לתפקיד.<br/><br/>הבינה המלאכותית תכתוב טיוטה ראשונית המבוססת על המידע שסיפקת. לאחר מכן, תוכל/י לשוחח איתה כדי לערוך ולשפר את הטיוטה.<br/><br/>הבינה המלאכותית תעריך את הטיוטה באופן רציף, וברגע שהיא תחליט שהיא מוכנה להגשה, יופיע כפתור "מוכן להגשה" שיאפשר לך לשמור את המכתב.<br/><br/>יש לך 8 דקות לעבוד על המכתב. שתי דקות לפני תום הזמן תופיע התראה.`;
    
    const baseTextEn = `In this task, you will work with an AI to create a cover letter. A cover letter is a document sent with your resume to provide additional information on your skills and experience. It is your chance to explain why you are the best fit for the role.<br/><br/>The AI will write a first draft based on the information you provided. After that, you'll be able to interact with it to edit and improve the draft.<br/><br/>The AI will continuously assess the draft, and once it judges that it's ready to submit, a "Ready to Submit" button will appear, letting you save your letter.<br/><br/>You have 8 minutes to work on the letter. Two minutes before time is up, you'll see a notice.`;
    
    let conditionTextHe = "";
    let conditionTextEn = "";
    
    if (currentCondition === 2) {
      conditionTextHe = `<br/><br/><strong>בנוסף, תראה/י את ההגדרות שבהן משתמשת הבינה המלאכותית כדי לכתוב את המכתב, אך לא תוכל/י לשנות אותן.</strong>`;
      conditionTextEn = `<br/><br/><strong>You'll also see the settings the AI is using to write your letter, but you won't be able to change them.</strong>`;
    } else if (currentCondition === 3) {
      conditionTextHe = `<br/><br/><strong>בנוסף, תראה/י את ההגדרות שבהן משתמשת הבינה המלאכותית כדי לכתוב את המכתב, ותוכל/י לשנות אותן בכל עת.</strong>`;
      conditionTextEn = `<br/><br/><strong>You'll also see the settings the AI is using to write your letter, and you'll be able to change them at any time.</strong>`;
    }
    
    if (currentLang === 'he') {
      textEl.innerHTML = baseTextHe + conditionTextHe;
    } else {
      textEl.innerHTML = baseTextEn + conditionTextEn;
    }
    
    step3.style.display = 'none';
    step4.style.display = 'flex';
  });

  document.getElementById('back-step-4').addEventListener('click', () => {
    step4.style.display = 'none';
    step3.style.display = 'flex';
  });

  startTaskBtn.addEventListener('click', () => {
    const q1 = document.getElementById('q1-input').value.trim();
    const q2 = [
      document.getElementById('q2-1').value.trim(),
      document.getElementById('q2-2').value.trim(),
      document.getElementById('q2-3').value.trim(),
      document.getElementById('q2-4').value.trim(),
      document.getElementById('q2-5').value.trim()
    ].join(", ");
    const q3 = document.getElementById('q3-input').value.trim();
    
    onboardingOverlay.classList.remove('active');
    appContainer.style.display = 'flex';
    
    Logger.startTime = new Date().toISOString();
    startExperimentTimers();
    
    onboardingContext = `Role applied for: ${q1}. Key characteristics: ${q2}. Relevant experience: ${q3}.`;
    
    // Trigger initial draft automatically
    generateInitialDraft();
  });

  // Sliders
  Object.keys(sliders).forEach(key => {
    sliders[key].value = baselineSliders[key];
    updateSliderUI(key);
    sliders[key].addEventListener('input', () => updateSliderUI(key));
    sliders[key].addEventListener('change', () => {
      const newVal = parseInt(sliders[key].value);
      Logger.logSliderChange(key, currentSliders[key], newVal);
      currentSliders[key] = newVal;
    });
  });

  // Chat Input
  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  });

  // Submit button
  submitBtn.addEventListener('click', handleExperimentComplete);
});

function applyConditionRules() {
  const controlPane = document.querySelector('.control-pane');
  const divider = document.getElementById('canvas-chat-divider');
  const slidersCard = document.querySelector('.sliders-card');
  const updateLetterBtn = document.getElementById('update-letter-btn');
  
  if (currentCondition === 1) {
    // Hidden
    controlPane.style.display = 'none';
  } else if (currentCondition === 2) {
    // Locked
    slidersCard.classList.add('locked');
    Object.values(sliders).forEach(s => s.disabled = true);
  } else if (currentCondition === 3) {
    // Visible and Controllable - Show Update Letter Button
    if (updateLetterBtn) {
      updateLetterBtn.style.display = 'block';
      updateLetterBtn.addEventListener('click', generateUpdateDraft);
    }
  }
}

async function generateUpdateDraft() {
  const promptTextUI = currentLang === 'he' 
    ? 'עדכן את המכתב לפי ההגדרות החדשות.' 
    : 'Update the letter based on the new settings.';
    
  // Add message to chat visually to show the user what happened
  appendMessage('user', promptTextUI);
  
  // Log slider changes on update
  Logger.logSentSliderChanges();
  Logger.promptsSent++;
  if (canSubmit) {
    Logger.promptsSentAfterSubmitAppeared++;
  }
  
  // Prune history to prevent slider updates from getting stuck due to previous conflicting drafts
  let prunedMessages = [];
  for (let i = 0; i < activeChat.messages.length; i++) {
    let msg = activeChat.messages[i];
    if (msg.isSliderUpdate) {
      if (i + 1 < activeChat.messages.length && activeChat.messages[i+1].role === 'model') {
        i++; // skip model response too
      }
    } else {
      prunedMessages.push(msg);
    }
  }
  activeChat.messages = prunedMessages;

  const promptTextAPI = currentLang === 'he'
    ? 'התעלם מכל ההנחיות וההגדרות הקודמות לגבי אורך, טון וקידום עצמי (כולל בקשות קודמות של המשתמש). חובה לכתוב מחדש את הטיוטה במלואה כך שתתאים בדיוק להגדרות הנוכחיות החדשות המופיעות בהוראות המערכת (System Instructions), ואל תישאר מקובע לטיוטות קודמות שכתבת. בשום אופן אל תאמר למשתמש שאתה מוגבל באורך - פשוט תענה באופן משתף פעולה ותשכתב את הטקסט בהתאם להגדרות החדשות.'
    : 'Ignore all previous instructions and settings regarding verbosity, tone, and self-promotion (including previous manual requests). You must completely rewrite the full draft so it strictly matches the newly updated settings in the System Instructions, and do not remain anchored to previous drafts. Never tell the user you are restricted by length limits - just act cooperative and rewrite the text according to the new settings.';
  
  activeChat.messages.push({ role: "user", parts: [{ text: promptTextAPI }], isSliderUpdate: true });
  
  const systemPrompt = buildSystemPrompt();
  sendBtn.disabled = true;
  if (canSubmit) submitBtn.style.display = 'none'; 
  
  const apiKey = ANTHROPIC_API_KEY !== "YOUR_ANTHROPIC_API_KEY_HERE" ? ANTHROPIC_API_KEY : localStorage.getItem('anthropic_api_key');
  
  const chatContentEl = appendMessage('ai', '');
  if (chatContentEl) chatContentEl.innerHTML = currentLang === 'he' ? '<i>חושב...</i>' : '<i>Thinking...</i>';
  
  try {
    const response = await callAnthropicAPI(apiKey, systemPrompt, currentActiveModel, activeChat.messages, (currentText, isRaw) => {
      processProgressiveResponse(currentText, chatContentEl, isRaw);
    });
    activeChat.messages.push({ role: "model", parts: [{ text: response }] });
  } catch (err) {
    console.error(err);
    if (chatContentEl) chatContentEl.innerHTML = '❌ Error: ' + err.message;
  }

  sendBtn.disabled = false;
  if (canSubmit) submitBtn.style.display = 'block'; 
}

function applyLanguage(lang) {
  htmlEl.lang = lang;
  htmlEl.dir = lang === 'he' ? 'rtl' : 'ltr';
  const dict = i18n[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });
  Object.keys(sliders).forEach(key => updateSliderUI(key));
}

function updateSliderUI(sliderKey) {
  if (!sliders[sliderKey]) return;
  const slider = sliders[sliderKey];
  const value = parseInt(slider.value);
  const badge = document.getElementById(`badge-${sliderKey}`);
  const stepsContainer = document.getElementById(`steps-${sliderKey}`);

  if (SLIDER_LABELS[currentLang]) {
    badge.textContent = SLIDER_LABELS[currentLang][sliderKey][value - 1];
    const steps = stepsContainer.querySelectorAll('span');
    SLIDER_LABELS[currentLang][sliderKey].forEach((label, i) => {
       const words = label.split(' ');
       if (words.length > 1 && words[0].length > 3) {
           steps[i].innerHTML = words[0] + '<br/>' + words.slice(1).join(' ');
       } else if (label.includes('/')) {
           steps[i].innerHTML = label.replace('/', '/<br/>');
       } else {
           steps[i].textContent = label;
       }
       steps[i].classList.toggle('active', i === value - 1);
    });
  }

  const percent = ((value - 1) / 4) * 100;
  const direction = currentLang === 'he' ? 'to left' : 'to right';
  slider.style.background = `linear-gradient(${direction}, var(--accent-primary) 0%, var(--accent-primary) ${percent}%, var(--slider-track) ${percent}%, var(--slider-track) 100%)`;
}

function updateApiKeyStatus(saved) {
  if (saved) {
    apiKeyStatus.textContent = currentLang === 'he' ? '✓ נשמר' : '✓ API Key saved';
    apiKeyStatus.className = 'api-key-status saved';
  } else {
    apiKeyStatus.textContent = currentLang === 'he' ? 'הכנס מפתח API' : 'Enter your Anthropic API Key';
    apiKeyStatus.className = 'api-key-status empty';
  }
}

// ===== Experiment Timers =====
function startExperimentTimers() {
  // 4 Minutes to enable Submit
  submitTimer = setTimeout(() => {
    canSubmit = true;
    Logger.submitAppearedTime = new Date().toISOString();
    // Intentionally not displaying the button immediately here so it doesn't pop up randomly.
    // It will be displayed after the next message is generated.
  }, 4 * 60 * 1000);

  // 6 Minutes - Show less than 2 minutes message
  setTimeout(() => {
    timerDisplay.style.display = 'block';
    timerDisplay.style.opacity = '1';
    timerDisplay.textContent = currentLang === 'he' ? "נותרו פחות מ-2 דקות!" : "Less than 2 minutes remaining!";
  }, 6 * 60 * 1000);

  // 7 Minutes - Show less than 1 minute message
  setTimeout(() => {
    timerDisplay.style.display = 'block';
    timerDisplay.style.opacity = '1';
    timerDisplay.textContent = currentLang === 'he' ? "נותרה פחות מדקה!" : "Less than 1 minute remaining!";
  }, 7 * 60 * 1000);

  // 7.5 Minutes - Start 30s Countdown
  setTimeout(() => {
    timerDisplay.style.display = 'block';
    timerDisplay.style.opacity = '1';
    let timeLeft = 30; // 30 seconds
    
    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    timerDisplay.textContent = currentLang === 'he' ? `נשארו ${formatTime(timeLeft)}` : `${formatTime(timeLeft)} Remaining`;
    
    const countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        timerDisplay.textContent = currentLang === 'he' ? `נשארו ${formatTime(timeLeft)}` : `${formatTime(timeLeft)} Remaining`;
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }, 7.5 * 60 * 1000);

  // 8 Minutes - Auto End
  sessionTimer = setTimeout(() => {
    handleExperimentComplete();
  }, 8 * 60 * 1000);
}

function handleExperimentComplete() {
  clearTimeout(sessionTimer);
  Logger.submitTime = new Date().toISOString();
  
  // Fire and forget the log to prevent UI delay
  Logger.sendLog().catch(err => console.error("Log failed:", err));
  
  // Instantly show end screen and hide the main app
  document.getElementById('app').style.display = 'none';
  const endOverlay = document.getElementById('end-overlay');
  document.getElementById('end-title').textContent = currentLang === 'he' ? "תודה רבה" : "Thank You";
  document.getElementById('end-message').textContent = currentLang === 'he' ? "הטיוטה הוגשה! אנא פנה לחוקר." : "Cover letter submitted! Please contact your researcher.";
  endOverlay.classList.add('active');
}

// ===== Chat Logic =====
function buildSystemPrompt() {
  const vals = currentCondition === 3 ? currentSliders : baselineSliders;
  let prompt = `You are an AI assistant helping the user write a cover letter. \n\n` +
    (Logger.promptsSent === 0 ? "CRITICAL INSTRUCTION: This is the VERY FIRST draft. The draft itself MUST be extremely 'quarter-baked' and terribly basic. It should look like someone spent only 30 seconds writing it. Make it very short, use repetitive or poor sentence structure, leave obvious gaps like '[Company Name]', omit important details, and use overly simple vocabulary. It MUST NOT look like a solid or complete cover letter. However, in your conversational response, act as if it is a standard draft. DO NOT mention or hint that the draft is rough, 'half-baked', or needs a lot of work. Present it confidently.\n" : 
    (Logger.promptsSent === 1 ? "CRITICAL INSTRUCTION: This is the SECOND draft. The draft itself MUST still be very 'bad' and 'quarter-baked'. Incorporate the user's feedback, but keep the writing quality extremely low, informal, and basic. Retain some placeholders and poor sentence structure. However, in your conversational response, DO NOT mention or hint that the draft is bad or needs improvement. Present it confidently.\n" :
    (Logger.promptsSent === 2 ? "CRITICAL INSTRUCTION: This is the THIRD draft. The draft itself should still be 'half-baked' and informal, with obvious room for improvement. It should not be highly professional yet. However, in your conversational response, DO NOT mention or hint that the draft is still rough or needs improvement. Present it confidently.\n" : 
    "CRITICAL INSTRUCTION: The user has interacted sufficiently. You may now produce a highly polished, professional, and excellent cover letter.\n"))) +
    `YOU MUST STRICTLY OBEY THE FOLLOWING THREE CONSTRAINTS FOR THE TONE OF THE COVER LETTER:\n` +
    `1. VERBOSITY: ${SLIDER_CONFIG.verbosity[vals.verbosity]}\n` +
    `2. TONE: ${SLIDER_CONFIG.tone[vals.tone]}\n` +
    `3. SELF-PROMOTION: ${SLIDER_CONFIG["self-promotion"][vals["self-promotion"]]}\n\n` +
    `CRITICAL INSTRUCTION: Your output MUST contain the full, updated cover letter wrapped exactly inside <letter> and </letter> tags.\n` +
    `Any conversational response to the user should be placed OUTSIDE the <letter> tags.\n` +
    `CRITICAL RULE: The letter MUST start with the exact text <letter> and MUST end with the exact text </letter>. Do NOT put the tags inside markdown code blocks.\n` +
    `If the user requests a change, generate the entire updated letter inside the tags.\n` +
    `CRITICAL INSTRUCTION: You MUST adhere entirely to the CURRENT constraint values for Tone, Verbosity, and Self-Promotion given above. Completely IGNORE the length, tone, and self-promotion levels of any past drafts or messages in this conversation history.\n` +
    `CRUCIAL: DO NOT explicitly tell the user that you are making the draft 'concise', 'assertive', etc. based on the sliders. Just adopt the tone naturally without commenting on your own hidden instructions.\n` +
    `CRITICAL RULE: NEVER mention, hint, or complain to the user about your internal word counts, limits, or constraints. If you cannot perfectly fulfill a user's manual request because it conflicts with the current Verbosity, Tone, or Self-Promotion settings, just silently do your best to blend their request with your settings. NEVER say "I am restricted" or "I cannot change the length". Always act cooperative and seamlessly provide the updated draft.\n` +
    `CRUCIAL: NEVER output any word counts, variables, arrays, calculations, or internal thoughts. Just output the natural conversational text and the draft inside the tags. Make sure the letter finishes naturally and completely, do NOT cut off mid-sentence even if it slightly exceeds the word count.`;

  if (currentLang === 'he') {
    prompt += "\nIMPORTANT: The cover letter and conversation must be in Hebrew.";
  } else {
    prompt += "\nIMPORTANT: The cover letter and conversation must be in English.";
  }
  
  if (onboardingContext) {
    prompt += `\n\nUSER DETAILS TO USE IN COVER LETTER:\n${onboardingContext}`;
  }
  
  prompt += `\nCRITICAL RULE: You MUST write your responses and the cover letter draft entirely in ${currentLang === 'he' ? 'Hebrew' : 'English'}, regardless of the language the user types in. If the user writes in English, reply in ${currentLang === 'he' ? 'Hebrew' : 'English'}. If the user writes in Hebrew, reply in ${currentLang === 'he' ? 'Hebrew' : 'English'}.`;

  return prompt;
}

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Log slider changes only on send
  Logger.logSentSliderChanges();

  // Logging
  Logger.promptsSent++;
  if (canSubmit) {
    Logger.promptsSentAfterSubmitAppeared++;
  }
  Logger.totalCharactersTyped += text.length;

  appendMessage('user', text);
  chatInput.value = '';
  chatInput.style.height = 'auto';

  activeChat.messages.push({ role: "user", parts: [{ text: text }] });
  
  const systemPrompt = buildSystemPrompt();
  sendBtn.disabled = true;
  if (canSubmit) submitBtn.style.display = 'none'; // hide during generation
  
  const apiKey = ANTHROPIC_API_KEY !== "YOUR_ANTHROPIC_API_KEY_HERE" ? ANTHROPIC_API_KEY : localStorage.getItem('anthropic_api_key');
  const chatContentEl = appendMessage('ai', '');
  if (chatContentEl) chatContentEl.innerHTML = currentLang === 'he' ? '<i>חושב...</i>' : '<i>Thinking...</i>'; // Create empty bubble for streaming
  
  try {
    const response = await callAnthropicAPI(apiKey, systemPrompt, currentActiveModel, activeChat.messages, (currentText, isRaw) => {
      processProgressiveResponse(currentText, chatContentEl, isRaw);
    });
    activeChat.messages.push({ role: "model", parts: [{ text: response }] });
  } catch (err) {
    console.error(err);
    chatContentEl.innerHTML = '❌ Error: ' + err.message;
  }

  sendBtn.disabled = false;
  if (canSubmit) submitBtn.style.display = 'block'; // show again
}

async function generateInitialDraft() {
  const promptText = currentLang === 'he' 
    ? 'אנא כתוב את הטיוטה הראשונית של המכתב המקדים על בסיס הנתונים שהזנתי. אל תעשה אותה "טובה מדי" או מקצועית. הטיוטה צריכה להיות "חצי אפויה", בסיסית מאוד, פחות רשמית, ועם ניסוח פשוט מאוד שדורש עריכה ושיפור מצדי, כדי לעודד אותי לערוך אותה ולא להעתיק אותה כפי שהיא. עם זאת, בתשובה המילולית שלך אליי, אל תציין או תרמוז בשום צורה שהטיוטה היא "חצי אפויה" או דורשת עבודה. פשוט הגש אותה כטיוטה רגילה.' 
    : 'Please write the initial cover letter draft based on the details provided. Do not make it "too perfect" or highly professional. Make it "half-baked", very basic, informal, and requiring editing. However, in your conversational response to me, DO NOT mention or hint that the draft is "half-baked", rough, or needs work. Just present it as a normal draft.';
  
  // We do not append the user message to the UI, but we add it to history so the AI knows
  activeChat.messages.push({ role: "user", parts: [{ text: promptText }] });
  
  const systemPrompt = buildSystemPrompt();
  sendBtn.disabled = true;
  if (canSubmit) submitBtn.style.display = 'none'; 
  
  const apiKey = ANTHROPIC_API_KEY !== "YOUR_ANTHROPIC_API_KEY_HERE" ? ANTHROPIC_API_KEY : localStorage.getItem('anthropic_api_key');
  const chatContentEl = appendMessage('ai', '');
  if (chatContentEl) chatContentEl.innerHTML = currentLang === 'he' ? '<i>חושב...</i>' : '<i>Thinking...</i>'; // Create empty bubble for streaming
  
  try {
    const response = await callAnthropicAPI(apiKey, systemPrompt, currentActiveModel, activeChat.messages, (currentText, isRaw) => {
      processProgressiveResponse(currentText, chatContentEl, isRaw);
    });
    activeChat.messages.push({ role: "model", parts: [{ text: response }] });
  } catch (err) {
    console.error(err);
    chatContentEl.innerHTML = '❌ Error: ' + err.message;
  }

  sendBtn.disabled = false;
  if (canSubmit) submitBtn.style.display = 'block'; 
}



// ===== API call & Chat UI Helpers =====
const delay = ms => new Promise(res => setTimeout(res, ms));

async function callAnthropicAPI(apiKey, systemPrompt, modelId, history, onUpdate) {
  const url = '/api/anthropic';
  const anthropicHistory = history.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.parts ? msg.parts.map(p => p.text).join('') : msg.content
  }));

  const body = {
    model: modelId,
    system: systemPrompt,
    messages: anthropicHistory,
    max_tokens: 4096,
    temperature: 0.8,
    stream: true
  };

  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerously-allow-browser': 'true'
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        if ((res.status === 529 || res.status === 503 || res.status === 429) && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1500; // 1.5s, 3s, 6s
          console.warn(`API Overloaded (${res.status}). Retrying in ${waitTime}ms...`);
          if (onUpdate) onUpdate(`<i>${currentLang === 'he' ? 'חווה עומס, מנסה שוב...' : 'Experiencing high demand, retrying...'}</i>`, true);
          await delay(waitTime);
          attempt++;
          continue;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let fullText = "";
      let streamStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        let lines = buffer.split('\n');
        buffer = lines.pop(); 
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'content_block_delta' && data.delta && data.delta.text) {
                fullText += data.delta.text;
                if (!streamStarted) streamStarted = true;
                if (onUpdate) onUpdate(fullText, false);
              }
            } catch (e) {
              console.error("SSE Parse error", e);
            }
          }
        }
      }
      return fullText;
      
    } catch (e) {
      if (attempt < maxRetries && (e.message.includes('fetch') || e.message.includes('network'))) {
         attempt++;
         await delay(2000);
         continue;
      }
      throw e;
    }
  }
}

function processProgressiveResponse(fullText, chatContentEl, isRawHtml = false) {
  if (isRawHtml) {
    if (chatContentEl) {
       chatContentEl.innerHTML = fullText;
       chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    return;
  }

  let letterText = "";
  let chatResponse = fullText;
  
  let cleanedResponse = fullText.replace(/```html\n<letter>/gi, '<letter>').replace(/```\n<letter>/gi, '<letter>').replace(/<\/letter>\n```/gi, '</letter>');
  
  const startIndex = cleanedResponse.toLowerCase().indexOf('<letter>');
  if (startIndex !== -1) {
    let endIndex = cleanedResponse.toLowerCase().indexOf('</letter>');
    if (endIndex === -1) {
      letterText = cleanedResponse.substring(startIndex + 8).trim();
      chatResponse = cleanedResponse.substring(0, startIndex).trim();
    } else {
      letterText = cleanedResponse.substring(startIndex + 8, endIndex).trim();
      chatResponse = cleanedResponse.substring(0, startIndex).trim();
      if (endIndex !== cleanedResponse.length) {
         chatResponse += " " + cleanedResponse.substring(endIndex + 9).trim();
      }
    }
    chatResponse = chatResponse.trim();
  }
  
  if (letterText && typeof canvasEl !== 'undefined') {
    canvasEl.innerText = letterText;
  }
  
  if (chatContentEl) {
    if (chatResponse === "" && letterText !== "") {
       chatContentEl.innerHTML = currentLang === 'he' ? "הטיוטה עודכנה במסמך משמאל." : "The draft has been updated in the document.";
    } else {
       chatContentEl.innerHTML = escapeHTML(chatResponse);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}


function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'ai' ? '✨' : 'U';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.innerHTML = text ? escapeHTML(text) : ''; // Allow raw html if needed later, but here we just escape or leave empty
  
  div.appendChild(avatar);
  div.appendChild(contentDiv);
  
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return contentDiv;
}

function showTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'message ai typing';
  div.innerHTML = `
    <div class="message-avatar">✨</div>
    <div class="typing-indicator"><span></span><span></span><span></span></div>
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function removeTypingIndicator(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag]));
}
