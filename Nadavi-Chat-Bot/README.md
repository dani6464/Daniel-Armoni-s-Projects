# Nadavi Chat Bot

Nadavi Chat Bot is a specialized interactive platform designed for conducting academic user studies on human-AI collaboration. The platform simulates an AI assistant helping participants draft a cover letter while allowing the researcher to inject various conditions (e.g., personality changes based on sliders) to test participant reactions.

## For Developers 💻

### Technology Stack
This platform is built entirely using vanilla web technologies, intentionally avoiding complex frameworks to ensure maximum portability, ease of modification, and rapid deployment.
- **HTML5:** Provides the semantic structure and layout of the chat interface, overlays, and sidebars.
- **CSS3 (Vanilla):** Custom styling using CSS variables for a modern, glassmorphic design system. No external libraries like Tailwind or Bootstrap are used, making it lightweight.
- **JavaScript (Vanilla ES6+):** Handles all logic, state management, event listeners, and API communications without React, Vue, or Angular.
- **Google Gemini API:** The core LLM powering the AI assistant's responses (specifically `gemini-3.5-flash`).
- **Google Apps Script (Sheets API):** Used as a serverless backend to log all participant metrics (typing speed, slider changes, timestamps) directly into a Google Spreadsheet.

### Key Files
- `index.html`: The main UI structure.
- `style.css`: All design and layout rules, including responsive behavior.
- `app.js`: The central brain. It handles the Gemini API requests, dynamic system prompt building based on slider values, condition parsing from the URL, and sending logs to Google Sheets.

---

## For Operators / Researchers 🔬

### How to Run a Study
When sending the link to a participant, you can control the experimental condition they experience by adding a `?c=` parameter to the end of the URL. 

**Condition Parameters:**
- `?c=1` : **Full Interactive Mode** (Default). Participants see the sidebars and can adjust the Verbosity, Certainty, and Self-Promotion sliders to actively change the AI's personality.
- `?c=2` : **Static/Control Mode**. The sidebars are completely hidden. The participant interacts with a standard, unchanging AI assistant without any sliders.

**Example Link for Condition 2:**
`https://nadavi-chat-bot-deploy.vercel.app/?c=2`

### The Participant Flow
1. **Login:** The participant enters their unique Participant Number (which you assign to them) and chooses their language (English or Hebrew).
2. **Onboarding:** They answer three quick questions about the role they want, their traits, and their experience. (These answers are secretly injected into the AI's prompt so it knows context).
3. **Drafting:** They enter the chat interface. A 10-minute timer starts. They chat with the AI to generate a cover letter.
4. **Completion:** When the 10-minute timer runs out, or if they click "Ready to Submit", the final cover letter and all interaction metrics are immediately sent to the Google Sheet, and the study ends.

### Data Logging
All data is saved automatically to your connected Google Sheet. The logged metrics include:
- Timestamp & Participant Number
- Condition Number
- Start Time & Submit Time
- Total Characters Typed by the participant
- Total Prompts (messages) Sent
- Total Slider Changes (with exact timestamps and new values)
- The Final Cover Letter Draft produced.

### Changing the API Key
If the API key expires or hits a limit, you can update it directly in the UI. 
1. Open the app link and add `?operator=true` (e.g., `https://nadavi-chat-bot-deploy.vercel.app/?operator=true`).
2. Click the Settings Gear (⚙️) in the top right.
3. Paste the new Gemini API Key and click **Save**. It will save to your local browser storage.
