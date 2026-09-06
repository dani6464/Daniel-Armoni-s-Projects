
const $ = (s) => document.querySelector(s);
let currentDbKey = null;

function parseNumberStr(str) {
  if (!str) return 0;
  let s = str.toUpperCase().replace(/,/g, "");
  let mult = 1;
  if (s.endsWith("K")) { mult = 1000; s = s.slice(0, -1); }
  else if (s.endsWith("M")) { mult = 1000000; s = s.slice(0, -1); }
  else if (s.endsWith("B")) { mult = 1000000000; s = s.slice(0, -1); }
  const val = parseFloat(s);
  return isNaN(val) ? 0 : val * mult;
}

async function connectLiveProfile() {
  const btn = $("#connectBtn");
  const err = $("#errorMsg");
  btn.textContent = "Connecting via Invisible API...";
  err.classList.add("hidden");
  $("#importSuccessMsg").classList.add("hidden");

  try {
    const tabs = await chrome.tabs.query({ url: "*://*.instagram.com/*" });
    if (tabs.length === 0) throw new Error("No Instagram tab found. Please open your profile in another tab.");

    let targetTab = tabs.find(t => t.url.match(/instagram\.com\/[^\/]+\/?/i) && !t.url.includes("explore") && !t.url.includes("direct") && !t.url.endsWith("instagram.com/") && !t.url.endsWith("instagram.com"));
    
    if (!targetTab) {
      throw new Error("You MUST open your specific profile page (e.g. instagram.com/daniel_armoni1) to scan followers.");
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: targetTab.id },
      func: async () => {
        let username = "user";
        const path = window.location.pathname.replace(/^\/|\/$/g, "");
        if (path && !["explore", "direct", "reels", "stories"].includes(path.split("/")[0])) {
          username = path.split("/")[0];
        }

        const text = document.body.innerText;
        const fwMatch = text.match(/([\d,.]+[KMBkm]?)\s*(?:followers|עוקבים)/i);
        const flMatch = text.match(/([\d,.]+[KMBkm]?)\s*(?:following|במעקב)/i);
        const ptMatch = text.match(/([\d,.]+[KMBkm]?)\s*(?:posts|פוסטים)/i);

        const img = document.querySelector("img[alt*=\"profile\"], img[alt*=\"פרופיל\"]") || document.querySelector("header img");
        const avatarUrl = img ? img.src : null;

        let followersCount = fwMatch ? fwMatch[1] : "0";
        let followingCount = flMatch ? flMatch[1] : "0";
        let postsCount = ptMatch ? ptMatch[1] : "0";

        let followersList = [];
        try {
          let userId = null;
          const htmlText = document.documentElement.innerHTML;
          const idMatch = htmlText.match(/"user_id":"(\d+)"/) || htmlText.match(/"profile_id":"(\d+)"/);
          
          if (idMatch) {
            userId = idMatch[1];
          } else {
            const searchRes = await fetch(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${username}`);
            const searchJson = await searchRes.json();
            const userObj = searchJson.users.find(u => u.user.username === username);
            if (userObj) userId = userObj.user.pk;
          }

          if (userId) {
            const csrfMatch = document.cookie.match(/csrftoken=([^;]+)/);
            const csrf = csrfMatch ? csrfMatch[1] : "";
            
            const headers = {
                "X-IG-App-ID": "936619743392459", 
                "X-CSRFToken": csrf,
                "X-Requested-With": "XMLHttpRequest",
                "Accept": "*/*"
            };
            
            let hasNext = true;
            let maxId = "";
            let usersSet = new Set();
            let count = 0;
            
            while (hasNext && count < 3000) { 
              const url = `https://www.instagram.com/api/v1/friendships/${userId}/followers/?count=200${maxId ? "&max_id="+maxId : ""}`;
              const res = await fetch(url, { headers });
              
              if (!res.ok) throw new Error("API rate limit or auth error");
              
              const json = await res.json();
              if (json.users) {
                  for (let u of json.users) {
                      usersSet.add(u.username);
                      count++;
                  }
              }
              
              if (json.next_max_id) {
                  maxId = json.next_max_id;
                  await new Promise(r => setTimeout(r, 600)); 
              } else {
                  hasNext = false;
              }
            }
            followersList = Array.from(usersSet);
          }
        } catch(e) {
          console.error("API Extractor Error:", e);
        }

        return { 
          followers: followersCount, 
          following: followingCount, 
          posts: postsCount, 
          username,
          avatarUrl,
          followersList
        };
      }
    });

    const data = results[0]?.result;
    
    if (!data || (data.followers === "0" && data.following === "0")) {
      throw new Error("Could not find profile stats. Make sure you are on a profile page.");
    }

    parseAndShowData(data);

  } catch (e) {
    btn.textContent = "Extract & Save Snapshot";
    err.textContent = e.message;
    err.classList.remove("hidden");
  }
}

function parseAndShowData(stats) {
  $("#username").textContent = `@${stats.username}`;
  $("#realFollowers").textContent = stats.followers;
  $("#realFollowing").textContent = stats.following;
  $("#realPosts").textContent = stats.posts;

  if (stats.avatarUrl) {
    const av = $("#avatar");
    av.onload = () => av.classList.remove("hidden");
    av.onerror = () => av.classList.add("hidden");
    av.src = stats.avatarUrl;
  }

  const fNum = parseNumberStr(stats.followers);
  const flNum = parseNumberStr(stats.following);
  
  let ratio = "0";
  if (flNum > 0) ratio = (fNum / flNum).toFixed(2);
  else if (fNum > 0) ratio = "∞";
  $("#followRatio").textContent = ratio;

  const now = new Date().toLocaleString();
  currentDbKey = `snapshot_${stats.username}`;

  chrome.storage.sync.get([currentDbKey], (result) => {
    const last = result[currentDbKey];
    const hc = $("#historyContent");
    
    let lostUsers = [];
    if (last && last.followersList && stats.followersList && stats.followersList.length > 0) {
      lostUsers = last.followersList.filter(u => !stats.followersList.includes(u));
    }

    if (last) {
      const diffF = fNum - last.followers;
      const diffFl = flNum - last.following;
      
      const fColor = diffF > 0 ? "var(--success)" : (diffF < 0 ? "#ef4444" : "var(--text)");
      const flColor = diffFl > 0 ? "var(--success)" : (diffFl < 0 ? "#ef4444" : "var(--text)");
      
      const signF = diffF > 0 ? "+" : "";
      const signFl = diffFl > 0 ? "+" : "";

      let lostUsersHtml = "";
      if (lostUsers.length > 0) {
         lostUsersHtml = `<div style="margin-top:1rem; padding:1rem; background:rgba(239, 68, 68, 0.1); border-radius:0.5rem; border:1px solid #ef4444;">
            <strong style="color:#ef4444; display:block; margin-bottom:0.5rem;">Exact Unfollowers Detected! 📉</strong>
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem;">
              ${lostUsers.map(u => `<li><a href="https://instagram.com/${u}" target="_blank" style="color:var(--text); text-decoration:none;">@${u}</a></li>`).join("")}
            </ul>
         </div>`;
      } else if (diffF < 0) {
         lostUsersHtml = `<p style="color:#ef4444; margin-top:1rem;">Scan detected missing followers, but API exact name comparison failed.</p>`;
      } else {
         lostUsersHtml = `<div style="margin-top:1rem; color:var(--success);">No unfollowers detected since last scan.</div>`;
      }

      hc.innerHTML = `
        <p style="margin-bottom:1rem; color:var(--text-muted);">Compared to your scan on <strong>${last.date}</strong>:</p>
        <div style="display:flex; gap:2rem; font-size:1.1rem; margin-bottom:1rem;">
          <div>Followers: <strong style="color:${fColor}">${signF}${diffF}</strong></div>
          <div>Following: <strong style="color:${flColor}">${signFl}${diffFl}</strong></div>
        </div>
        ${lostUsersHtml}
        <p style="color:var(--text-muted); font-size:0.85rem; margin-top:1rem;">(We securely saved a new snapshot for your next visit).</p>
      `;
    } else {
      const namesExtractedMsg = stats.followersList && stats.followersList.length > 0 
          ? `We successfully extracted <strong>${stats.followersList.length} exact usernames automatically</strong>.` 
          : "Note: We couldn't extract exact names from the API.";

      hc.innerHTML = `
        <div style="color:var(--success); font-size:1.1rem; margin-bottom:0.5rem; font-weight:600;">Initial Invisible Scan Complete! ✓</div>
        <p style="color:var(--text-muted); margin-bottom:0.5rem;">We saved your current follower counts and names locally. Run this extension again tomorrow to detect exactly who unfollowed you.</p>
        <p style="color:var(--primary); font-size:0.9rem;">${namesExtractedMsg}</p>
      `;
    }

    $("#exportBtn").classList.remove("hidden");
    $("#exportBtn").onclick = () => {
      let csvStr = `Summary Metrics,Value\n`;
      csvStr += `Username,${stats.username}\n`;
      csvStr += `Followers,${stats.followers.replace(/,/g,"")}\n`;
      csvStr += `Following,${stats.following.replace(/,/g,"")}\n`;
      csvStr += `Posts,${stats.posts.replace(/,/g,"")}\n`;
      csvStr += `Follow Ratio,${ratio}\n`;
      csvStr += `Last Scanned,${now}\n\n`;

      if (lostUsers.length > 0) {
        csvStr += `Unfollowers Detected\n`;
        lostUsers.forEach(u => csvStr += `${u}\n`);
        csvStr += `\n`;
      }

      if (stats.followersList && stats.followersList.length > 0) {
        csvStr += `Full Followers List (${stats.followersList.length} users)\n`;
        stats.followersList.forEach(u => csvStr += `${u}\n`);
      } else {
        csvStr += `Full Followers List\n(No names extracted - API blocked or empty)\n`;
      }

      const blob = new Blob(["\uFEFF" + csvStr], { type: "text/csv;charset=utf-8" });
      const u = URL.createObjectURL(blob);
      chrome.downloads.download({url: u, filename: `${stats.username}-full-analytics.csv`, saveAs: true});
    };

    chrome.storage.sync.set({
      [currentDbKey]: { 
         followers: fNum, 
         following: flNum, 
         date: now,
         followersList: stats.followersList || []
      }
    });
  });

  $("#connectState").classList.add("hidden");
  $("#dashboardState").classList.remove("hidden");
}

document.getElementById("connectBtn").addEventListener("click", connectLiveProfile);

document.getElementById("resetDbBtn").addEventListener("click", () => {
  if (currentDbKey) {
    chrome.storage.sync.remove(currentDbKey, () => {
      $("#historyContent").innerHTML = `
        <div style="color:#ef4444; font-size:1.1rem; margin-bottom:0.5rem; font-weight:600;">History Cleared! 🗑️</div>
        <p style="color:var(--text-muted);">Your historical data for this account has been deleted. Click "Extract" again to start a fresh snapshot.</p>
      `;
    });
  }
});

// CSV Import Logic
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("csvFileInput").click();
});

document.getElementById("csvFileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const text = event.target.result;
      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      
      let username = null;
      let followers = 0;
      let following = 0;
      let date = "";
      let followersList = [];
      let isParsingList = false;

      for (let line of lines) {
        line = line.replace(/^\uFEFF/, "").replace(/"/g, "");
        
        if (line.startsWith("Username,")) username = line.split(",")[1];
        else if (line.startsWith("Followers,")) followers = parseInt(line.split(",")[1]);
        else if (line.startsWith("Following,")) following = parseInt(line.split(",")[1]);
        else if (line.startsWith("Last Scanned,")) date = line.substring(line.indexOf(",") + 1);
        else if (line.startsWith("Full Followers List")) isParsingList = true;
        else if (line.startsWith("Unfollowers Detected")) isParsingList = false;
        else if (isParsingList && !line.includes("(No names")) {
          followersList.push(line);
        }
      }

      if (!username) throw new Error("Invalid CSV format: Username not found.");

      const dbKey = `snapshot_${username}`;
      chrome.storage.sync.set({
        [dbKey]: { followers, following, date, followersList }
      }, () => {
        const msg = $("#importSuccessMsg");
        msg.textContent = `✓ Successfully imported backup for @${username} (${followersList.length} users). Click Extract to compare!`;
        msg.classList.remove("hidden");
        
        // Reset file input
        $("#csvFileInput").value = "";
      });
      
    } catch(err) {
      alert("Error importing CSV: " + err.message);
    }
  };
  reader.readAsText(file);
});

