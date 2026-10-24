const { test, expect } = require('@playwright/test');

test.describe('Onboarding & Chat Flow', () => {
  test('Complete onboarding and interact with mocked chat', async ({ page }) => {
    // Intercept Gemini API
    await page.route('**/api/anthropic**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type": "content_block_delta", "delta": {"text": "Mocked AI Response"}}\n\ndata: [DONE]\n\n'
      });
    });

    await page.goto('/');

    // Step 0: Language and ID
    await page.waitForSelector('#login-overlay');
    await page.fill('#participant-id', '1234');
    await page.check('input[value="en"]', { force: true }); // explicit English
    await page.click('#login-next-btn');

    // Step 1
    await page.waitForSelector('#step-1');
    await page.fill('#q1-input', 'Software Engineer');
    await page.click('#next-step-1');

    // Step 2
    await page.waitForSelector('#step-2');
    await page.fill('#q2-1', 'Smart');
    await page.fill('#q2-2', 'Fast');
    await page.fill('#q2-3', 'Kind');
    await page.fill('#q2-4', 'Cool');
    await page.fill('#q2-5', 'Brave');
    await page.click('#next-step-2');

    // Step 3
    await page.waitForSelector('#step-3');
    await page.fill('#q3-input', '10 years of experience');
    await page.click('#next-step-3');

    // Step 4 (Your Task)
    await page.waitForSelector('#step-4');
    await page.click('#start-task-btn');
    
    // Custom confirm modal removed in new flow

    // Main App Container should be visible
    await page.waitForSelector('#app');
    
    // Test Chat sending
    await page.fill('#chat-input', 'Hello AI!');
    await page.click('#send-btn');

    // Verify response
    const aiMessages = page.locator('.message.ai');
    await expect(aiMessages.first()).toContainText('Mocked AI Response');
  });

  test('Saves final cover letter on submit', async ({ page }) => {
    let capturedLog = null;
    
    // Mock the Google Script URL to intercept the fetch request
    await page.route('https://script.google.com/macros/s/**', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        try {
          capturedLog = JSON.parse(request.postData());
        } catch (e) {}
      }
      await route.fulfill({ status: 200, body: 'ok' });
    });

    // Mock Gemini API with a specific letter tag
    await page.route('**/api/anthropic**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type": "content_block_delta", "delta": {"text": "Here is your draft:\\n\\n<letter>Final Awesome Cover Letter</letter>"}}\n\ndata: [DONE]\n\n'
      });
    });

    await page.goto('/');

    // Quick Onboarding
    await page.waitForSelector('#login-overlay');
    await page.fill('#participant-id', '9999');
    await page.check('input[value="en"]', { force: true });
    await page.click('#login-next-btn');
    
    await page.waitForSelector('#step-1');
    await page.fill('#q1-input', 'Software Engineer');
    await page.click('#next-step-1');
    
    await page.waitForSelector('#step-2');
    await page.fill('#q2-1', 'A');
    await page.fill('#q2-2', 'B');
    await page.fill('#q2-3', 'C');
    await page.fill('#q2-4', 'D');
    await page.fill('#q2-5', 'E');
    await page.click('#next-step-2');

    await page.waitForSelector('#step-3');
    await page.fill('#q3-input', '10 years exp');
    await page.click('#next-step-3');
    
    await page.waitForSelector('#step-4');
    await page.click('#start-task-btn');

    await page.waitForSelector('#app');

    // Send a prompt to trigger API and get the "Ready to Submit" button
    await page.fill('#chat-input', 'Write a draft');
    await page.click('#send-btn');

    // Wait for the AI response to populate the canvas
    const canvas = page.locator('#cover-letter-canvas');
    await expect(canvas).toContainText('Final Awesome Cover Letter');

    // Set up request listener BEFORE triggering the action to avoid missing it
    const logRequestPromise = page.waitForRequest(request => 
      request.url().includes('script.google.com') && request.method() === 'POST'
    );

    // Call handleExperimentComplete directly to avoid 5-minute timer
    await page.evaluate(() => {
      window.handleExperimentComplete();
    });
    
    const logRequest = await logRequestPromise;
    capturedLog = JSON.parse(logRequest.postData());

    // Verify the intercepted log
    expect(capturedLog).not.toBeNull();
    expect(capturedLog.finalCoverLetter).toBe('Final Awesome Cover Letter');
  });

  test('Submit button appears after 4 mins and not during generation', async ({ page }) => {
    // Install the clock to manipulate time
    await page.clock.install();

    // Mock Gemini API but delay the response to test "during generation" state
    let resolveApi;
    const apiPromise = new Promise(resolve => { resolveApi = resolve; });
    
    await page.route('**/api/anthropic**', async route => {
      await apiPromise; // Wait until we tell it to resolve
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type": "content_block_delta", "delta": {"text": "Delayed AI Response"}}\n\ndata: [DONE]\n\n'
      });
    });

    await page.goto('/');

    // Quick Onboarding
    await page.fill('#participant-id', '9999');
    await page.check('input[value="en"]', { force: true });
    await page.click('#login-next-btn');
    await page.fill('#q1-input', 'Test');
    await page.click('#next-step-1');
    await page.fill('#q2-1', 'A');
    await page.fill('#q2-2', 'B');
    await page.fill('#q2-3', 'C');
    await page.fill('#q2-4', 'D');
    await page.fill('#q2-5', 'E');
    await page.click('#next-step-2');
    await page.fill('#q3-input', 'Test');
    await page.click('#next-step-3');
    
    // Clicking start task triggers the initial draft generation which gets blocked by our promise
    await page.click('#start-task-btn');
    await page.waitForSelector('#app');

    const submitBtn = page.locator('#submit-letter-btn');

    // Button should be hidden initially
    await expect(submitBtn).toBeHidden();

    // Fast-forward 4 minutes (240000 ms)
    await page.clock.fastForward('04:00');

    // Even though 4 mins passed, AI is still generating, so button must be hidden!
    await expect(submitBtn).toBeHidden();

    // Now resolve the AI generation
    resolveApi();
    
    // Once AI is done, the button should appear immediately
    await expect(submitBtn).toBeVisible();
  });

  test('Auto-submit triggers at 8 minutes and shows timer countdown', async ({ page }) => {
    await page.clock.install();

    await page.goto('/');

    // Quick Onboarding
    await page.fill('#participant-id', '9999');
    await page.check('input[value="en"]', { force: true });
    await page.click('#login-next-btn');
    await page.fill('#q1-input', 'Test');
    await page.click('#next-step-1');
    await page.fill('#q2-1', 'A');
    await page.fill('#q2-2', 'B');
    await page.fill('#q2-3', 'C');
    await page.fill('#q2-4', 'D');
    await page.fill('#q2-5', 'E');
    await page.click('#next-step-2');
    await page.fill('#q3-input', 'Test');
    await page.click('#next-step-3');
    await page.click('#start-task-btn');
    await page.waitForSelector('#app');

    const timerDisplay = page.locator('#timer-display');

    // Fast forward to 6 minutes
    await page.clock.fastForward('06:00');
    await expect(timerDisplay).toBeVisible();
    await expect(timerDisplay).toContainText('Less than 2 minutes');
    
    // Fast forward remaining 2 minutes to hit 8 minutes
    await page.clock.fastForward('02:00');

    // End overlay should automatically appear
    await expect(page.locator('#end-overlay')).toHaveClass(/active/);
    await expect(page.locator('#end-message')).toBeVisible();
  });
});

test.describe('Operator Mode', () => {
  test('Render Operator Elements', async ({ page }) => {
    await page.goto('/?o=1&c=3');
    
    // Quick Onboarding for Operator to reach the chat view
    await page.waitForSelector('#login-overlay');
    await page.fill('#participant-id', 'OP-999');
    await page.check('input[value="en"]', { force: true });
    await page.click('#login-next-btn');
    
    await page.waitForSelector('#step-1');
    await page.fill('#q1-input', 'Test');
    await page.click('#next-step-1');
    
    await page.waitForSelector('#step-2');
    await page.fill('#q2-1', 'A');
    await page.fill('#q2-2', 'B');
    await page.fill('#q2-3', 'C');
    await page.fill('#q2-4', 'D');
    await page.fill('#q2-5', 'E');
    await page.click('#next-step-2');

    await page.waitForSelector('#step-3');
    await page.fill('#q3-input', 'Test Exp');
    await page.click('#next-step-3');
    
    await page.waitForSelector('#step-4');
    await page.click('#start-task-btn');
    
    // Custom confirm modal removed

    await page.waitForSelector('#app');

    // Operator has new-chat, refresh, settings buttons
    await expect(page.locator('#settings-toggle-btn')).toBeVisible();
    await expect(page.locator('#new-chat-btn')).toBeVisible();
  });
});

test.describe('New Logic Tests', () => {
  test('Initial draft is generated automatically upon starting the task', async ({ page }) => {
    // Intercept Gemini API to provide a specific initial draft response
    await page.route('**/api/anthropic**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type": "content_block_delta", "delta": {"text": "This is the automatic initial draft.\\n\\n<letter>Initial Cover Letter</letter>"}}\n\ndata: [DONE]\n\n'
      });
    });

    await page.goto('/');

    // Quick Onboarding
    await page.waitForSelector('#login-overlay');
    await page.fill('#participant-id', 'NEW-123');
    await page.check('input[value="en"]', { force: true });
    await page.click('#login-next-btn');
    
    await page.waitForSelector('#step-1');
    await page.fill('#q1-input', 'Role');
    await page.click('#next-step-1');
    
    await page.waitForSelector('#step-2');
    await page.fill('#q2-1', 'A');
    await page.fill('#q2-2', 'B');
    await page.fill('#q2-3', 'C');
    await page.fill('#q2-4', 'D');
    await page.fill('#q2-5', 'E');
    await page.click('#next-step-2');

    await page.waitForSelector('#step-3');
    await page.fill('#q3-input', 'Exp');
    await page.click('#next-step-3');
    
    // Start task - this should trigger the initial draft automatically
    await page.waitForSelector('#step-4');
    await page.click('#start-task-btn');
    
    await page.waitForSelector('#app');

    // Verify the AI generates a message without us typing anything
    const aiMessages = page.locator('.message.ai');
    await expect(aiMessages.first()).toContainText('This is the automatic initial draft.');

    // Verify the canvas got updated with the letter
    const canvas = page.locator('#cover-letter-canvas');
    await expect(canvas).toContainText('Initial Cover Letter');
  });

  test('Slider update sends correct overriding prompts to API', async ({ page }) => {
    let lastApiRequest = null;
    await page.route('**/api/anthropic**', async route => {
      lastApiRequest = JSON.parse(route.request().postData());
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type": "content_block_delta", "delta": {"text": "Updated Draft.\\n\\n<letter>Updated Cover Letter</letter>"}}\n\ndata: [DONE]\n\n'
      });
    });

    await page.goto('/?c=3');

    // Quick Onboarding
    await page.waitForSelector('#login-overlay');
    await page.fill('#participant-id', 'NEW-124');
    await page.check('input[value="en"]', { force: true });
    await page.click('#login-next-btn');
    
    await page.waitForSelector('#step-1');
    await page.fill('#q1-input', 'Role');
    await page.click('#next-step-1');
    
    await page.waitForSelector('#step-2');
    await page.fill('#q2-1', 'A');
    await page.fill('#q2-2', 'B');
    await page.fill('#q2-3', 'C');
    await page.fill('#q2-4', 'D');
    await page.fill('#q2-5', 'E');
    await page.click('#next-step-2');

    await page.waitForSelector('#step-3');
    await page.fill('#q3-input', 'Exp');
    await page.click('#next-step-3');
    
    await page.waitForSelector('#step-4');
    await page.click('#start-task-btn');
    
    await page.waitForSelector('#app');

    // Change verbosity slider to 5 (Very Detailed)
    const verbositySlider = page.locator('#slider-verbosity');
    await verbositySlider.fill('5');
    
    await page.waitForTimeout(500); // wait for UI/state update
    
    await page.click('#update-letter-btn');
    
    // Wait for the AI message to appear
    await expect(page.locator('#cover-letter-canvas')).toContainText('Updated Cover Letter');

    // Verify the system prompt contains the new verbosity rule
    expect(lastApiRequest.system).toContain('Try to be around 240 words');
    expect(lastApiRequest.system).toContain('NEVER mention, hint, or complain');
    
    // Check that the history contains the strong override text
    const userMessages = lastApiRequest.messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    expect(lastUserMessage.content).toContain('Ignore all previous instructions');
    expect(lastUserMessage.content).toContain('Never tell the user you are restricted');
  });
});
