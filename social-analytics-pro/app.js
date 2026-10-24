const $ = (s) => document.querySelector(s);
let currentDbKey = null;
let historyDbKey = null;

function parseNumberStr(str) {
  if (!str) return 0;
  let s = String(str).toUpperCase().replace(/,/g, "").trim();
  let mult = 1;
  if (s.endsWith("K")) { mult = 1000; s = s.slice(0, -1); }
  else if (s.endsWith("M")) { mult = 1000000; s = s.slice(0, -1); }
  else if (s.endsWith("B")) { mult = 1000000000; s = s.slice(0, -1); }
  const val = parseFloat(s);
  return isNaN(val) ? 0 : Math.round(val * mult);
}

async function connectLiveProfile() {
  const btn = $("#connectBtn");
  const rescanBtn = $("#rescanBtn");
  const err = $("#errorMsg");
  if (btn) btn.textContent = "Extracting Full Data (May take a minute)...";
  if (rescanBtn) {
    rescanBtn.textContent = "Scanning...";
    rescanBtn.disabled = true;
  }
  if (err) err.classList.add("hidden");
  if ($("#importSuccessMsg")) $("#importSuccessMsg").classList.add("hidden");

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
        let debugError = null;
        
        try {
          const csrfMatch = document.cookie.match(/csrftoken=([^;]+)/);
          const csrf = csrfMatch ? csrfMatch[1] : "";
          
          const headers = {
            "X-IG-App-ID": "936619743392459", 
            "X-CSRFToken": csrf,
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "*/*"
          };

          let userId = null;

          // Method 1: Official web_profile_info API
          try {
            const profRes = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`, {
              headers,
              credentials: "include"
            });
            if (profRes.ok) {
              const profJson = await profRes.json();
              const u = profJson?.data?.user;
              if (u?.id) {
                userId = String(u.id);
              }
              if (u?.edge_followed_by?.count !== undefined && followersCount === "0") {
                followersCount = String(u.edge_followed_by.count);
              }
              if (u?.edge_follow?.count !== undefined && followingCount === "0") {
                followingCount = String(u.edge_follow.count);
              }
              if (u?.edge_owner_to_timeline_media?.count !== undefined && postsCount === "0") {
                postsCount = String(u.edge_owner_to_timeline_media.count);
              }
            }
          } catch (e) {
            console.warn("web_profile_info lookup failed:", e);
          }

          // Method 2: HTML source regex (avoiding "0")
          if (!userId) {
            const htmlText = document.documentElement.innerHTML;
            const idMatch =
              htmlText.match(/"profilePage_([1-9]\d+)"/) ||
              htmlText.match(/"profile_id":"([1-9]\d+)"/) ||
              htmlText.match(/"target_id":"([1-9]\d+)"/) ||
              htmlText.match(/"user_id":"([1-9]\d+)"/);
            if (idMatch) userId = idMatch[1];
          }

          // Method 3: Topsearch API with headers
          if (!userId) {
            try {
              const searchRes = await fetch(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${encodeURIComponent(username)}`, {
                headers,
                credentials: "include"
              });
              if (searchRes.ok) {
                const searchJson = await searchRes.json();
                const userObj = (searchJson.users || []).find(u => u?.user?.username?.toLowerCase() === username.toLowerCase());
                if (userObj?.user?.pk) userId = String(userObj.user.pk);
              }
            } catch (e) {
              console.warn("topsearch lookup failed:", e);
            }
          }

          // Method 4: Logged-in ds_user_id cookie fallback
          if (!userId) {
            const dsMatch = document.cookie.match(/ds_user_id=([1-9]\d+)/);
            if (dsMatch) userId = dsMatch[1];
          }

          if (userId) {
            // Primary extractor: REST v1 friendships API
            async function fetchUsersV1(endpoint) {
              let hasNext = true;
              let maxId = "";
              let usersSet = new Set();
              let count = 0;
              
              while (hasNext && count < 5000) { 
                const url = `https://www.instagram.com/api/v1/friendships/${userId}/${endpoint}/?count=50${maxId ? "&max_id=" + encodeURIComponent(maxId) : ""}`;
                let res = await fetch(url, { headers, credentials: "include" });
                
                if (!res.ok) {
                  await new Promise(r => setTimeout(r, 1200));
                  res = await fetch(url, { headers, credentials: "include" });
                  if (!res.ok) break;
                }
                const json = await res.json();
                
                if (json.users && Array.isArray(json.users)) {
                  for (let u of json.users) {
                    if (u && u.username) {
                      usersSet.add(u.username.toLowerCase());
                      count++;
                    }
                  }
                }
                
                if (json.next_max_id) {
                  maxId = json.next_max_id;
                  await new Promise(r => setTimeout(r, 450)); 
                } else {
                  hasNext = false;
                }
              }
              return Array.from(usersSet);
            }

            // Secondary fallback extractor: GraphQL query API
            async function fetchUsersGraphQL(edgeType) {
              const queryHash = edgeType === "followers"
                ? "c76146de99bb02f6415203be841dd25a"
                : "d04b0a864b4b54837c0d870b0e77e076";
              const edgeKey = edgeType === "followers" ? "edge_followed_by" : "edge_follow";
              let hasNext = true;
              let afterCursor = null;
              let usersSet = new Set();
              let count = 0;

              while (hasNext && count < 5000) {
                const vars = {
                  id: userId,
                  include_reel: false,
                  fetch_mutual: false,
                  first: 50,
                  after: afterCursor
                };
                const url = `https://www.instagram.com/graphql/query/?query_hash=${queryHash}&variables=${encodeURIComponent(JSON.stringify(vars))}`;
                const res = await fetch(url, { headers, credentials: "include" });
                if (!res.ok) break;
                const json = await res.json();
                const edgeObj = json?.data?.user?.[edgeKey];
                if (!edgeObj) break;

                for (let edge of (edgeObj.edges || [])) {
                  if (edge?.node?.username) {
                    usersSet.add(edge.node.username.toLowerCase());
                    count++;
                  }
                }

                if (edgeObj.page_info?.has_next_page && edgeObj.page_info?.end_cursor) {
                  afterCursor = edgeObj.page_info.end_cursor;
                  await new Promise(r => setTimeout(r, 450));
                } else {
                  hasNext = false;
                }
              }
              return Array.from(usersSet);
            }

            try {
              followersList = await fetchUsersV1("followers");
              if (followersList.length === 0) {
                followersList = await fetchUsersGraphQL("followers");
              }
            } catch (e) {
              console.warn("Followers fetch error:", e);
            }

            try {
              followingList = await fetchUsersV1("following");
              if (followingList.length === 0) {
                followingList = await fetchUsersGraphQL("following");
              }
            } catch (e) {
              console.warn("Following fetch error:", e);
            }
          } else {
            debugError = "Could not resolve numeric Instagram userId.";
          }
        } catch(e) {
          console.error("API Extractor Error:", e);
          debugError = e.message;
        }

        return { 
          followers: followersCount, 
          following: followingCount, 
          posts: postsCount, 
          username: username.toLowerCase(),
          avatarUrl,
          followersList,
          followingList,
          debugError
        };
      }
    });

    const data = results[0]?.result;
    
    if (!data || (data.followers === "0" && data.following === "0")) {
      throw new Error("Could not find profile stats. Make sure you are on a profile page.");
    }

    parseAndShowData(data);

  } catch (e) {
    if (btn) btn.textContent = "Extract & Save Snapshot";
    if (rescanBtn) {
      rescanBtn.textContent = "Re-Scan Now";
      rescanBtn.disabled = false;
    }
    if (err) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    } else {
      alert(e.message);
    }
  }
}

function parseAndShowData(stats) {
  const btn = $("#connectBtn");
  const rescanBtn = $("#rescanBtn");
  if (btn) btn.textContent = "Extract & Save Snapshot";
  if (rescanBtn) {
    rescanBtn.textContent = "Re-Scan Now";
    rescanBtn.disabled = false;
  }

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
    
    const sanitizeList = (list) => Array.from(new Set((list || []).map(u => String(u).trim().toLowerCase()).filter(Boolean)));
    
    let oldFollowersList = sanitizeList(last ? last.followersList : []);
    let newFollowersList = sanitizeList(stats.followersList);
    
    let oldFollowingList = sanitizeList(last ? last.followingList : []);
    let newFollowingList = sanitizeList(stats.followingList);

    const liveFollowersExtracted = newFollowersList.length > 0;
    const liveFollowingExtracted = newFollowingList.length > 0;

    // Preserve previous lists if Instagram temporarily blocked live list extraction
    if (!liveFollowersExtracted && oldFollowersList.length > 0) {
      newFollowersList = [...oldFollowersList];
    }
    if (!liveFollowingExtracted && oldFollowingList.length > 0) {
      newFollowingList = [...oldFollowingList];
    }

    // --- SMART HEALING ALGORITHM ---
    // If the Instagram API drops a few users due to pagination jitter, the new list length will be strictly less than the HTML count.
    // Only heal when the count itself hasn't dropped, or heal up to the target HTML count.
    if (last) {
      if (liveFollowersExtracted && newFollowersList.length < fNum && oldFollowersList.length > 0) {
        const diffF = fNum - last.followers;
        if (diffF >= 0) {
          const missing = oldFollowersList.filter(u => !newFollowersList.includes(u));
          newFollowersList.push(...missing);
        }
      }
      if (liveFollowingExtracted && newFollowingList.length < flNum && oldFollowingList.length > 0) {
        const diffFl = flNum - last.following;
        if (diffFl >= 0) {
          const missing = oldFollowingList.filter(u => !newFollowingList.includes(u));
          newFollowingList.push(...missing);
        }
      }
    }

    const apiSuccessFollowers = oldFollowersList.length > 0 && liveFollowersExtracted;
    if (apiSuccessFollowers) {
      lostFollowers = oldFollowersList.filter(u => !newFollowersList.includes(u));
      newFollowers = newFollowersList.filter(u => !oldFollowersList.includes(u));
    }
    
    const apiSuccessFollowing = oldFollowingList.length > 0 && liveFollowingExtracted;
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
      
      if (!liveFollowersExtracted && diffF !== 0) {
        comparisonHtml += `<div style="margin-top:1rem; padding:1rem; background:rgba(234, 179, 8, 0.1); border:1px solid #eab308; border-radius:0.5rem; color:#ca8a04;"><strong>API Notice:</strong> Follower count changed (${signF}${diffF}), but Instagram temporarily restricted full name list extraction. Make sure you are logged into Instagram on that tab and refresh it.</div>`;
      }
      
      if (!liveFollowingExtracted && diffFl !== 0) {
        comparisonHtml += `<div style="margin-top:1rem; padding:1rem; background:rgba(234, 179, 8, 0.1); border:1px solid #eab308; border-radius:0.5rem; color:#ca8a04;"><strong>API Notice:</strong> Following count changed (${signFl}${diffFl}), but Instagram temporarily restricted full name list extraction.</div>`;
      }

      if (lostFollowers.length === 0 && newFollowers.length === 0 && lostFollowing.length === 0 && newFollowing.length === 0 && diffF === 0 && diffFl === 0) {
        comparisonHtml += `<div style="margin-top:1rem; color:var(--success);">No changes detected since last scan.</div>`;
      } else {
        comparisonHtml += `<div style="display:flex; gap:1rem; flex-wrap: wrap;">${lostUsersHtml}${newUsersHtml}${newFollowingHtml}${lostFollowingHtml}</div>`;
      }

      comparisonHtml += `<p style="color:var(--text-muted); font-size:0.85rem; margin-top:1rem;">(We securely saved a new snapshot for your next visit. Extracted ${newFollowersList.length} followers & ${newFollowingList.length} following).</p>`;
      hc.innerHTML = comparisonHtml;
      
    } else {
      hc.innerHTML = `
        <div style="color:var(--success); font-size:1.1rem; margin-bottom:0.5rem; font-weight:600;">Initial Invisible Scan Complete! ✓</div>
        <p style="color:var(--text-muted); margin-bottom:0.5rem;">We saved your current counts and lists locally. Run this extension again tomorrow to detect exact changes.</p>
        <p style="color:var(--primary); font-size:0.9rem;">Followers extracted: ${newFollowersList.length} | Following extracted: ${newFollowingList.length}</p>
      `;
    }

    // --- FOLLOW BACK INSIGHTS (Always Visible) ---
    const insightsContainer = $("#insightsContainer");
    const insightsContent = $("#insightsContent");
    insightsContainer.style.display = "block";

    const notFollowingMeBack = newFollowingList.filter(u => !newFollowersList.includes(u));
    const fansIDontFollow = newFollowersList.filter(u => !newFollowingList.includes(u));
    const mutuals = newFollowingList.filter(u => newFollowersList.includes(u));

    if (newFollowersList.length > 0 && newFollowingList.length > 0) {
      insightsContent.innerHTML = `
        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1rem; font-size:0.9rem; color:var(--text-muted);">
          <span>🤝 <strong>Mutual Followers:</strong> ${mutuals.length}</span>
          <span>👻 <strong>I Follow, Not Following Back:</strong> ${notFollowingMeBack.length}</span>
          <span>🌟 <strong>Follows Me, I Don't Follow Back:</strong> ${fansIDontFollow.length}</span>
        </div>
        <div style="margin-bottom:0.75rem;">
          <input type="text" id="insightsSearchInput" placeholder="Search username in lists below..." style="width:100%; padding:0.6rem 0.85rem; border-radius:0.5rem; border:1px solid var(--border); background:rgba(15, 23, 42, 0.6); color:var(--text); font-size:0.9rem; outline:none;" />
        </div>
        <div style="display:flex; gap:1.25rem; flex-wrap: wrap;">
          <div style="padding:1rem; background:rgba(239, 68, 68, 0.08); border-radius:0.5rem; border:1px solid rgba(239, 68, 68, 0.35); flex: 1; min-width: 260px;">
            <strong style="color:#ef4444; display:block; margin-bottom:0.75rem; font-size:1rem;">
              I Follow — Not Following Me Back 👻 (${notFollowingMeBack.length})
            </strong>
            <div style="max-height: 260px; overflow-y: auto; padding-right: 6px;">
              ${notFollowingMeBack.length > 0 ? `
                <ul id="notFollowingBackList" style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem;">
                  ${notFollowingMeBack.map(u => `<li data-user="${u}" style="padding:0.35rem 0.5rem; background:rgba(255,255,255,0.03); border-radius:0.35rem;"><a href="https://instagram.com/${u}" target="_blank" style="color:var(--text); text-decoration:none; display:flex; justify-content:space-between; align-items:center;"><span>@${u}</span><span style="font-size:0.75rem; color:#ef4444;">View Profile ↗</span></a></li>`).join("")}
                </ul>
              ` : `<p style="color:var(--text-muted); font-size:0.9rem;">Everyone you follow follows you back!</p>`}
            </div>
          </div>

          <div style="padding:1rem; background:rgba(16, 185, 129, 0.08); border-radius:0.5rem; border:1px solid rgba(16, 185, 129, 0.35); flex: 1; min-width: 260px;">
            <strong style="color:var(--success); display:block; margin-bottom:0.75rem; font-size:1rem;">
              Follows Me — I Don't Follow Back 🌟 (${fansIDontFollow.length})
            </strong>
            <div style="max-height: 260px; overflow-y: auto; padding-right: 6px;">
              ${fansIDontFollow.length > 0 ? `
                <ul id="fansList" style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem;">
                  ${fansIDontFollow.map(u => `<li data-user="${u}" style="padding:0.35rem 0.5rem; background:rgba(255,255,255,0.03); border-radius:0.35rem;"><a href="https://instagram.com/${u}" target="_blank" style="color:var(--text); text-decoration:none; display:flex; justify-content:space-between; align-items:center;"><span>@${u}</span><span style="font-size:0.75rem; color:var(--success);">View Profile ↗</span></a></li>`).join("")}
                </ul>
              ` : `<p style="color:var(--text-muted); font-size:0.9rem;">You follow back all of your followers!</p>`}
            </div>
          </div>
        </div>
      `;

      const searchInput = $("#insightsSearchInput");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const q = e.target.value.trim().toLowerCase().replace(/^@/, "");
          document.querySelectorAll("#notFollowingBackList li, #fansList li").forEach(li => {
            const u = li.getAttribute("data-user") || "";
            li.style.display = u.includes(q) ? "" : "none";
          });
        });
      }
    } else {
      insightsContent.innerHTML = `
        <div style="padding:1rem; background:rgba(234, 179, 8, 0.1); border:1px solid #eab308; border-radius:0.5rem; color:#ca8a04; line-height:1.5;">
          <strong>Full Username Lists Needed:</strong> Instagram did not return the full follower/following username lists on this scan (Extracted: ${newFollowersList.length} followers, ${newFollowingList.length} following).<br/>
          Please make sure you are logged into Instagram in your active tab, refresh your Instagram profile page (<code>instagram.com/${stats.username}</code>), and click <strong>Re-Scan Now</strong> above (or import a previous CSV backup).
        </div>
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
      csvStr += `Followers,${String(stats.followers).replace(/,/g,"")}\n`;
      csvStr += `Following,${String(stats.following).replace(/,/g,"")}\n`;
      csvStr += `Posts,${String(stats.posts).replace(/,/g,"")}\n`;
      csvStr += `Follow Ratio,${ratio}\n`;
      csvStr += `Last Scanned,${now}\n\n`;

      if (notFollowingMeBack.length > 0) {
        csvStr += `Not Following Me Back (${notFollowingMeBack.length} users)\n`;
        notFollowingMeBack.forEach(u => csvStr += `${u}\n`);
        csvStr += `\n`;
      }

      if (fansIDontFollow.length > 0) {
        csvStr += `Fans - Followers I Don't Follow Back (${fansIDontFollow.length} users)\n`;
        fansIDontFollow.forEach(u => csvStr += `${u}\n`);
        csvStr += `\n`;
      }

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

      if (newFollowersList.length > 0) {
        csvStr += `Full Followers List (${newFollowersList.length} users)\n`;
        newFollowersList.forEach(u => csvStr += `${u}\n`);
      } else {
        csvStr += `Full Followers List\n(No names extracted - API blocked or empty)\n`;
      }
      
      csvStr += `\n`;
      
      if (newFollowingList.length > 0) {
        csvStr += `Full Following List (${newFollowingList.length} users)\n`;
        newFollowingList.forEach(u => csvStr += `${u}\n`);
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
        followersList: newFollowersList,
        followingList: newFollowingList
      },
      [historyDbKey]: history
    });
  });

  $("#connectState").classList.add("hidden");
  $("#dashboardState").classList.remove("hidden");
}

document.getElementById("connectBtn").addEventListener("click", connectLiveProfile);
if (document.getElementById("rescanBtn")) {
  document.getElementById("rescanBtn").addEventListener("click", connectLiveProfile);
}

document.getElementById("resetDbBtn").addEventListener("click", () => {
  if (currentDbKey) {
    chrome.storage.local.remove([currentDbKey, historyDbKey], () => {
      $("#historyContent").innerHTML = `
        <div style="color:#ef4444; font-size:1.1rem; margin-bottom:0.5rem; font-weight:600;">History Cleared! 🗑️</div>
        <p style="color:var(--text-muted);">Your historical data for this account has been deleted. Click "Re-Scan Now" below to start a fresh snapshot.</p>
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
        else if (
          line.startsWith("Unfollowers Detected") ||
          line.startsWith("New Followers Detected") ||
          line.startsWith("Newly Following") ||
          line.startsWith("Unfollowed By Me") ||
          line.startsWith("Not Following Me Back") ||
          line.startsWith("Fans -")
        ) {
          parseMode = "ignore";
        }
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
        if (msg) {
          msg.textContent = `✓ Successfully imported backup for @${username}. Click Extract to compare!`;
          msg.classList.remove("hidden");
        }
        $("#csvFileInput").value = "";
      });
      
    } catch(err) {
      alert("Error importing CSV: " + err.message);
    }
  };
  reader.readAsText(file);
});
