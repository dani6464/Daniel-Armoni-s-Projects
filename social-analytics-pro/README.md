# Social Analytics PRO

A privacy-first, serverless Chrome Extension for Instagram analytics.

## Features
- **Authentic Live Data**: Extracts real follower, following, and posts counts directly from the active Instagram tab.
- **Invisible Exact Unfollowers Engine**: Automatically fetches exact usernames of followers and compares them against previous snapshots to pinpoint unfollowers without disruptive DOM scrolling.
- **Privacy-First Architecture**: Stores all historical data locally in the browser (`chrome.storage.sync`), avoiding risky third-party databases.
- **Backup & Restore**: Export all metrics and user lists to CSV, and import CSV backups to seamlessly restore historical data across devices.
- **Multi-Tenant System**: Automatically isolates data for different Instagram profiles (e.g. `snapshot_username1`, `snapshot_username2`).

## Installation
1. Download this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked** and select the `social-analytics-pro` folder.
5. Open an Instagram profile, click the extension icon, and run the Deep Scan!

