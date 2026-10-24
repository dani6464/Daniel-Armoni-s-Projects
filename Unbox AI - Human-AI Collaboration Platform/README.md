# Unbox AI - Human-AI Collaboration Platform

**Unbox AI - Human-AI Collaboration Platform** is an interactive research platform built at Reichman University's Media Innovation Lab (miLab) for conducting academic user studies on human-AI collaboration.

Participants collaborate with a live AI assistant to draft a cover letter across different experimental conditions that vary the visibility and controllability of the AI's response settings (Verbosity, Tone, and Self-Promotion).

**Live Platform:** [https://unbox-ai.vercel.app](https://unbox-ai.vercel.app)

---

## Experimental Conditions

When sending the link to a participant, control the experimental condition they experience by adding a `?c=` parameter to the URL:

- `?c=1` : **Hidden Mode (Baseline)** - Response controls are hidden from the participant.
- `?c=2` : **Transparent / Locked Mode** - Participants can see the AI's current settings (Verbosity, Tone, Self-Promotion), but the sliders are locked.
- `?c=3` : **Controllable Mode** - Participants can see and actively adjust the AI's settings at any time and click "Update Letter" to regenerate the draft.

**Examples:**
- `https://unbox-ai.vercel.app/?c=1`
- `https://unbox-ai.vercel.app/?c=2`
- `https://unbox-ai.vercel.app/?c=3`

---

## Participant Flow

1. **Login:** The participant enters their assigned Participant Number and selects their preferred language (English or Hebrew).
2. **Onboarding:** They answer three quick questions about the target role, five personal strengths, and relevant experience.
3. **Interactive Drafting (8 Minutes):** The AI generates an initial draft and the participant collaborates with the AI via chat (and sliders in Condition 3) to refine the cover letter.
   - After 4 minutes, the **"Ready to Submit"** button becomes available.
   - Time notices appear at 2 minutes remaining, 1 minute remaining, and a 30-second countdown.
4. **Completion & Logging:** When submitted (or after 8 minutes), all session telemetry and the final cover letter are automatically logged to Google Sheets.

---

## Automated Telemetry Logged

Every completed session automatically records:
- Participant Number, Condition (`1`, `2`, or `3`), and Language (`en` or `he`)
- Session Start Time, Submit Button Appearance Time, and Submit Time
- Total Characters Typed and Total Prompts Sent (including prompts sent after the submit button appeared)
- Slider Changes (total changes, per-slider counts for Verbosity, Tone, and Self-Promotion, and timestamped slider states)
- Final Cover Letter Text

---

## Architecture & Setup

- **Frontend:** Vanilla HTML5 (`index.html`), CSS3 (`style.css`), and ES6+ JavaScript (`app.js`) with full English (LTR) and Hebrew (RTL) support.
- **Backend Proxy:** Vercel Edge Function (`api/anthropic.js`) that streams responses from Anthropic's Claude API while keeping the API key private on the server.
- **Telemetry Backend:** Google Apps Script (`apps_script.js`) connected to Google Sheets.

### Updating the Anthropic API Key in Vercel
1. Open [Vercel Project Settings -> Environment Variables](https://vercel.com/nadav-unbox-ai/unbox-ai/settings/environment-variables).
2. Edit `ANTHROPIC_API_KEY` and save the new key.
3. Redeploy the latest deployment from the **Deployments** tab.
