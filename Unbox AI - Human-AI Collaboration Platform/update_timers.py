import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define replacement
def replace_timers(match):
    return """  // 4 Minutes to enable Submit
  submitTimer = setTimeout(() => {
    canSubmit = true;
    Logger.submitAppearedTime = new Date().toISOString();
    
    // Only show button if we are not generating
    if (!isGenerating) {
      submitBtn.style.display = 'block';
    }
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
  }, 8 * 60 * 1000);"""

pattern = r"  // 5 Minutes to enable Submit.*?10 \* 60 \* 1000\);"
new_content = re.sub(pattern, replace_timers, content, flags=re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
