
const $ = (s) => document.querySelector(s);
let currentDbKey = null;
let historyDbKey = null;

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
  btn.textContent = "Extracting Full Data (May take a minute)...";
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
        let followingList = [];
        
        try {
          let userId = null;
          const htmlText = document.documentElement.innerHTML;
          const idMatch = htmlText.match(/"user_id":"(\d+)"/) || htmlText.match(/"profile_id":"(\d+)"/);
          
          if (idMatch) {
            userId = idMatch[1];
          } else {
            const searchRes = await fetch(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${username}`);
            const searchJson = await searchRes.json();
            const userObj = searchJson.users.find(u => u.user.username.toLowerCase() === username.toLowerCase());
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
            
            async function fetchUsers(endpoint) {
              let hasNext = true;
              let maxId = "";
              let usersSet = new Set();
              let count = 0;
              // Safe parameters to avoid Instagram blocking us
              while (hasNext && count < 3000) { 
                const url = `https://www.instagram.com/api/v1/friendships/${userId}/${endpoint}/?count=50${maxId ? "&max_id="+maxId : ""}`;
                const res = await fetch(url, { headers });
                
                if (!res.ok) throw new Error("API block");
                const json = await res.json();
                
                if (json.users) {
                    for (let u of json.users) {
                        usersSet.add(u.username.toLowerCase());
                        count++;
                    }
                }
                
                if (json.next_max_id) {
                    maxId = json.next_max_id;
                    await new Promise(r => setTimeout(r, 800)); // sleep 800ms
                } else {
                    hasNext = false;
                }
              }
              return Array.from(usersSet);
            }

            followersList = await fetchUsers("followers");
            followingList = await fetchUsers("following");
          }
        } catch(e) {
          console.error("API Extractor Error:", e);
        }

        return { 
          followers: followersCount, 
          following: followingCount, 
          posts: postsCount, 
          username: username.toLowerCase(),
          avatarUrl,
          followersList,
          followingList
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
  historyDbKey = `history_${stats.username}`;

  chrome.storage.local.get([currentDbKey, historyDbKey], (result) => {
    const last = result[currentDbKey];
    let history = result[historyDbKey] || [];
    const hc = $("#historyContent");
    
    let lostFollowers = [];
    let newFollowers = [];
    let lostFollowing = [];
    let newFollowing = [];
    
    const sanitizeList = (list) => (list || []).map(u => u.toLowerCase());
    
    const oldFollowersList = sanitizeList(last ? last.followersList : []);
    const newFollowersList = sanitizeList(stats.followersList);
    
    const oldFollowingList = sanitizeList(last ? last.followingList : []);
    const newFollowingList = sanitizeList(stats.followingList);

    // Only compare if we successfully fetched lists THIS time and LAST time
    const apiSuccessFollowers = oldFollowersList.length > 0 && newFollowersList.length > 0;
    if (apiSuccessFollowers) {
      lostFollowers = oldFollowersList.filter(u => !newFollowersList.includes(u));
      newFollowers = newFollowersList.filter(u => !oldFollowersList.includes(u));
    }
    
    const apiSuccessFollowing = oldFollowingList.length > 0 && newFollowingList.length > 0;
    if (apiSuccessFollowing) {
      lostFollowing = oldFollowingList.filter(u => !newFollowingList.includes(u));
      newFollowing = newFollowingList.filter(u => !oldFollowingList.includes(u));
    }

    if (last) {
      const diffF = fNum - last.followers;
      const diffFl = flNum - last.following;
      
      const fColor = diffF > 0 ? "var(--success)" : (diffF < 0 ? "#ef4444" : "var(--text)");
      const flColor = diffFl > 0 ? "var(--success)" : (diffFl < 0 ? "#ef4444" : "var(--text)");
      
      const signF = diffF > 0 ? "+" : "";
      const signFl = diffFl > 0 ? "+" : "";

      if (diffF !== 0 || diffFl !== 0 || lostFollowers.length > 0 || newFollowers.length > 0 || lostFollowing.length > 0 || newFollowing.length > 0) {
          history.unshift({
              date: now,
              diffF,
              diffFl,
              lost: lostFollowers,
              gained: newFollowers,
              lostFollowing,
              newFollowing
          });
          if (history.length > 5) history = history.slice(0, 5); 
      }

      let lostUsersHtml = "";
      if (lostFollowers.length > 0) {
         lostUsersHtml = `<div style="margin-top:1rem; padding:1rem; background:rgba(239, 68, 68, 0.1); border-radius:0.5rem; border:1px solid #ef4444; flex: 1; min-width: 200px;">
            <strong style="color:#ef4444; display:block; margin-bottom:0.5rem;">Unfollowers Detected 📉</strong>
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem;">
              ${lostFollowers.map(u => `<li><a href="https://instagram.com/${u}" target="_blank" style="color:var(--text); text-decoration:none;">@${u}</a></li>`).join("")}
            </ul>
         </div>`;
      }

      let newUsersHtml = "";
      if (newFollowers.length > 0) {
         newUsersHtml = `<div style="margin-top:1rem; padding:1rem; background:rgba(16, 185, 129, 0.1); border-radius:0.5rem; border:1px solid var(--success); flex: 1; min-width: 200px;">
            <strong style="color:var(--success); display:block; margin-bottom:0.5rem;">New Followers 🎉</strong>
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem;">
              ${newFollowers.map(u => `<li><a href="https://instagram.com/${u}" target="_blank" style="color:var(--text); text-decoration:none;">@${u}</a></li>`).join("")}
            </ul>
         </div>`;
      }
      
      let newFollowingHtml = "";
      if (newFollowing.length > 0) {
         newFollowingHtml = `<div style="margin-top:1rem; padding:1rem; background:rgba(59, 130, 246, 0.1); border-radius:0.5rem; border:1px solid #3b82f6; flex: 1; min-width: 200px;">
            <strong style="color:#3b82f6; display:block; margin-bottom:0.5rem;">You Newly Followed 🔍</strong>
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem;">
              ${newFollowing.map(u => `<li><a href="https://instagram.com/${u}" target="_blank" style="color:var(--text); text-decoration:none;">@${u}</a></li>`).join("")}
            </ul>
         </div>`;
      }
      
      let lostFollowingHtml = "";
      if (lostFollowing.length > 0) {
         lostFollowingHtml = `<div style="margin-top:1rem; padding:1rem; background:rgba(156, 163, 175, 0.1); border-radius:0.5rem; border:1px solid #9ca3af; flex: 1; min-width: 200px;">
            <strong style="color:#6b7280; display:block; margin-bottom:0.5rem;">You Unfollowed ✂️</strong>
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem;">
              ${lostFollowing.map(u => `<li><a href="https://instagram.com/${u}" target="_blank" style="color:var(--text); text-decoration:none;">@${u}</a></li>`).join("")}
            </ul>
         </div>`;
      }

      let comparisonHtml = `
        <p style="margin-bottom:1rem; color:var(--text-muted);">Compared to your scan on <strong>${last.date}</strong>:</p>
        <div style="display:flex; gap:2rem; font-size:1.1rem; margin-bottom:1rem;">
          <div>Followers: <strong style="color:${fColor}">${signF}${diffF}</strong></div>
          <div>Following: <strong style="color:${flColor}">${signFl}${diffFl}</strong></div>
        </div>
      `;
      
      if (!apiSuccessFollowers && diffF !== 0) {
          comparisonHtml += `<div style="margin-top:1rem; padding:1rem; background:rgba(234, 179, 8, 0.1); border:1px solid #eab308; border-radius:0.5rem; color:#ca8a04;"><strong>API Blocked:</strong> We see your follower count changed (${signF}${diffF}), but Instagram temporarily blocked our script from fetching the exact names today. Try again in a few hours.</div>`;
      }
      
      if (!apiSuccessFollowing && diffFl !== 0) {
          comparisonHtml += `<div style="margin-top:1rem; padding:1rem; background:rgba(234, 179, 8, 0.1); border:1px solid #eab308; border-radius:0.5rem; color:#ca8a04;"><strong>API Blocked:</strong> We see your following count changed (${signFl}${diffFl}), but Instagram temporarily blocked the exact name extraction.</div>`;
      }

      if (lostFollowers.length === 0 && newFollowers.length === 0 && lostFollowing.length === 0 && newFollowing.length === 0 && diffF === 0 && diffFl === 0) {
          comparisonHtml += `<div style="margin-top:1rem; color:var(--success);">No changes detected since last scan.</div>`;
      } else {
          comparisonHtml += `<div style="display:flex; gap:1rem; flex-wrap: wrap;">${lostUsersHtml}${newUsersHtml}${newFollowingHtml}${lostFollowingHtml}</div>`;
      }

      comparisonHtml += `<p style="color:var(--text-muted); font-size:0.85rem; margin-top:1rem;">(We securely saved a new snapshot for your next visit).</p>`;
      hc.innerHTML = comparisonHtml;
      
    } else {
      hc.innerHTML = `
        <div style="color:var(--success); font-size:1.1rem; margin-bottom:0.5rem; font-weight:600;">Initial Invisible Scan Complete! ✓</div>
        <p style="color:var(--text-muted); margin-bottom:0.5rem;">We saved your current counts and lists locally. Run this extension again tomorrow to detect exact changes.</p>
        <p style="color:var(--primary); font-size:0.9rem;">Followers extracted: ${stats.followersList?.length || 0} | Following extracted: ${stats.followingList?.length || 0}</p>
      `;
    }

    const hlCard = $("#historyLogCard");
    const hlContent = $("#historyLogContent");
    if (history.length > 0) {
        hlCard.style.display = "block";
        hlContent.innerHTML = history.map(log => {
            const fColor = log.diffF > 0 ? "var(--success)" : (log.diffF < 0 ? "#ef4444" : "var(--text)");
            const flColor = log.diffFl > 0 ? "var(--success)" : (log.diffFl < 0 ? "#ef4444" : "var(--text)");
            const signF = log.diffF > 0 ? "+" : "";
            const signFl = log.diffFl > 0 ? "+" : "";
            
            let usersStr = "";
            if (log.lost && log.lost.length > 0) {
               usersStr += `<div style="color:#ef4444; font-size: 0.85rem; margin-top: 0.25rem;">Unfollowers: ${log.lost.map(u=>`<a href="https://instagram.com/${u}" target="_blank" style="color:#ef4444;">@${u}</a>`).join(", ")}</div>`;
            }
            if (log.gained && log.gained.length > 0) {
               usersStr += `<div style="color:var(--success); font-size: 0.85rem; margin-top: 0.25rem;">New Followers: ${log.gained.map(u=>`<a href="https://instagram.com/${u}" target="_blank" style="color:var(--success);">@${u}</a>`).join(", ")}</div>`;
            }
            if (log.newFollowing && log.newFollowing.length > 0) {
               usersStr += `<div style="color:#3b82f6; font-size: 0.85rem; margin-top: 0.25rem;">Newly Following: ${log.newFollowing.map(u=>`<a href="https://instagram.com/${u}" target="_blank" style="color:#3b82f6;">@${u}</a>`).join(", ")}</div>`;
            }
            if (log.lostFollowing && log.lostFollowing.length > 0) {
               usersStr += `<div style="color:#6b7280; font-size: 0.85rem; margin-top: 0.25rem;">Unfollowed By You: ${log.lostFollowing.map(u=>`<a href="https://instagram.com/${u}" target="_blank" style="color:#6b7280;">@${u}</a>`).join(", ")}</div>`;
            }

            return `
            <div style="border-left: 3px solid var(--primary); padding-left: 1rem; padding-bottom: 0.5rem;">
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">${log.date}</div>
                <div style="font-size: 0.95rem;">
                    Followers: <span style="color:${fColor}">${signF}${log.diffF}</span> | 
                    Following: <span style="color:${flColor}">${signFl}${log.diffFl}</span>
                </div>
                ${usersStr}
            </div>`;
        }).join("");
    } else {
        hlCard.style.display = "none";
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

      if (lostFollowers.length > 0) {
        csvStr += `Unfollowers Detected\n`;
        lostFollowers.forEach(u => csvStr += `${u}\n`);
        csvStr += `\n`;
      }

      if (newFollowers.length > 0) {
        csvStr += `New Followers Detected\n`;
        newFollowers.forEach(u => csvStr += `${u}\n`);
        csvStr += `\n`;
      }
      
      if (newFollowing.length > 0) {
        csvStr += `Newly Following\n`;
        newFollowing.forEach(u => csvStr += `${u}\n`);
        csvStr += `\n`;
      }
      
      if (lostFollowing.length > 0) {
        csvStr += `Unfollowed By Me\n`;
        lostFollowing.forEach(u => csvStr += `${u}\n`);
        csvStr += `\n`;
      }

      if (stats.followersList && stats.followersList.length > 0) {
        csvStr += `Full Followers List (${stats.followersList.length} users)\n`;
        stats.followersList.forEach(u => csvStr += `${u}\n`);
      } else {
        csvStr += `Full Followers List\n(No names extracted - API blocked or empty)\n`;
      }
      
      csvStr += `\n`;
      
      if (stats.followingList && stats.followingList.length > 0) {
        csvStr += `Full Following List (${stats.followingList.length} users)\n`;
        stats.followingList.forEach(u => csvStr += `${u}\n`);
      } else {
        csvStr += `Full Following List\n(No names extracted)\n`;
      }

      const blob = new Blob(["\uFEFF" + csvStr], { type: "text/csv;charset=utf-8" });
      const u = URL.createObjectURL(blob);
      chrome.downloads.download({url: u, filename: `${stats.username}-full-analytics.csv`, saveAs: true});
    };

    chrome.storage.local.set({
      [currentDbKey]: { 
         followers: fNum, 
         following: flNum, 
         date: now,
         followersList: stats.followersList || [],
         followingList: stats.followingList || []
      },
      [historyDbKey]: history
    });
  });

  $("#connectState").classList.add("hidden");
  $("#dashboardState").classList.remove("hidden");
}

document.getElementById("connectBtn").addEventListener("click", connectLiveProfile);

document.getElementById("resetDbBtn").addEventListener("click", () => {
  if (currentDbKey) {
    chrome.storage.local.remove([currentDbKey, historyDbKey], () => {
      $("#historyContent").innerHTML = `
        <div style="color:#ef4444; font-size:1.1rem; margin-bottom:0.5rem; font-weight:600;">History Cleared! 🗑️</div>
        <p style="color:var(--text-muted);">Your historical data for this account has been deleted. Click "Extract" again to start a fresh snapshot.</p>
      `;
      $("#historyLogCard").style.display = "none";
    });
  }
});

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
      let followingList = [];
      let parseMode = null;

      for (let line of lines) {
        line = line.replace(/^\uFEFF/, "").replace(/"/g, "");
        
        if (line.startsWith("Username,")) username = line.split(",")[1].toLowerCase();
        else if (line.startsWith("Followers,")) followers = parseInt(line.split(",")[1]);
        else if (line.startsWith("Following,")) following = parseInt(line.split(",")[1]);
        else if (line.startsWith("Last Scanned,")) date = line.substring(line.indexOf(",") + 1);
        else if (line.startsWith("Full Followers List")) parseMode = "followers";
        else if (line.startsWith("Full Following List")) parseMode = "following";
        else if (line.startsWith("Unfollowers Detected") || line.startsWith("New Followers Detected") || line.startsWith("Newly Following") || line.startsWith("Unfollowed By Me")) parseMode = "ignore";
        else if (parseMode === "followers" && !line.includes("(No names")) {
          followersList.push(line.toLowerCase());
        }
        else if (parseMode === "following" && !line.includes("(No names")) {
          followingList.push(line.toLowerCase());
        }
      }

      if (!username) throw new Error("Invalid CSV format: Username not found.");

      const dbKey = `snapshot_${username}`;
      chrome.storage.local.set({
        [dbKey]: { followers, following, date, followersList, followingList }
      }, () => {
        const msg = $("#importSuccessMsg");
        msg.textContent = `✓ Successfully imported backup for @${username}. Click Extract to compare!`;
        msg.classList.remove("hidden");
        $("#csvFileInput").value = "";
      });
      
    } catch(err) {
      alert("Error importing CSV: " + err.message);
    }
  };
  reader.readAsText(file);
});

