import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const PORT = Number(process.env.PORT || 8787);
const BASE = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v24.0';
const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const IG_REDIRECT_URI = process.env.IG_REDIRECT_URI || `${BASE}/oauth/instagram/callback`;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI || `${BASE}/oauth/facebook/callback`;
const IG_SCOPES = process.env.IG_SCOPES || 'instagram_business_basic,instagram_business_manage_insights';
const FB_SCOPES = process.env.FB_SCOPES || 'pages_show_list,pages_read_engagement,pages_read_user_content,read_insights';

const pending = new Map();
const sessions = new Map();
const snapshots = new Map();

const now = () => new Date().toISOString();
const graph = (path) => `https://graph.facebook.com/${GRAPH_VERSION}${path}`;
const instagramGraph = (path) => `https://graph.instagram.com/${GRAPH_VERSION}${path}`;

function requireConfig(res){
  if(!META_APP_ID || !META_APP_SECRET){
    return res.status(500).json({error:'Server is not configured. Add META_APP_ID and META_APP_SECRET to backend/.env.'});
  }
}

function oauthState(platform, state){
  pending.set(state, { platform, createdAt: Date.now(), status:'pending' });
}

app.get('/health', (req,res)=>res.json({ok:true, service:'Social Analytics Pro backend'}));

app.get('/auth/instagram', (req,res)=>{
  const c=requireConfig(res); if(c) return;
  const state=req.query.state;
  if(!state) return res.status(400).send('Missing state');
  oauthState('instagram',state);
  const url = new URL('https://www.instagram.com/oauth/authorize');
  url.searchParams.set('client_id', META_APP_ID);
  url.searchParams.set('redirect_uri', IG_REDIRECT_URI);
  url.searchParams.set('scope', IG_SCOPES);
  url.searchParams.set('response_type','code');
  url.searchParams.set('state',state);
  res.redirect(url.toString());
});

app.get('/auth/facebook', (req,res)=>{
  const c=requireConfig(res); if(c) return;
  const state=req.query.state;
  if(!state) return res.status(400).send('Missing state');
  oauthState('facebook',state);
  const url = new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`);
  url.searchParams.set('client_id', META_APP_ID);
  url.searchParams.set('redirect_uri', FB_REDIRECT_URI);
  url.searchParams.set('scope', FB_SCOPES);
  url.searchParams.set('response_type','code');
  url.searchParams.set('state',state);
  res.redirect(url.toString());
});

async function tokenExchangeFacebook(code){
  const url=new URL(graph('/oauth/access_token'));
  url.searchParams.set('client_id',META_APP_ID); url.searchParams.set('client_secret',META_APP_SECRET); url.searchParams.set('redirect_uri',FB_REDIRECT_URI); url.searchParams.set('code',code);
  const r=await fetch(url); const j=await r.json(); if(!r.ok || j.error) throw new Error(j.error?.message || 'Facebook token exchange failed'); return j.access_token;
}

async function tokenExchangeInstagram(code){
  const form=new URLSearchParams({client_id:META_APP_ID,client_secret:META_APP_SECRET,grant_type:'authorization_code',redirect_uri:IG_REDIRECT_URI,code});
  const r=await fetch('https://api.instagram.com/oauth/access_token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:form});
  const j=await r.json(); if(!r.ok || j.error_message || j.error_type) throw new Error(j.error_message || 'Instagram token exchange failed'); return j.access_token;
}

async function metaFetch(url, token){
  const u=new URL(url); u.searchParams.set('access_token',token);
  const r=await fetch(u); const j=await r.json(); if(!r.ok || j.error) throw new Error(j.error?.message || `Meta API error ${r.status}`); return j;
}

async function complete(platform, code, state){
  const record=pending.get(state); if(!record || record.platform!==platform) throw new Error('Invalid or expired OAuth state');
  const metaToken=platform==='instagram' ? await tokenExchangeInstagram(code) : await tokenExchangeFacebook(code);
  let profile;
  if(platform==='instagram') profile=await metaFetch(instagramGraph('/me?fields=id,username,account_type,media_count'),metaToken);
  else {
    const me=await metaFetch(graph('/me?fields=id,name'),metaToken);
    const pages=await metaFetch(graph(`/${me.id}/accounts?fields=id,name,access_token`),metaToken);
    if(!pages.data?.length) throw new Error('No Facebook Page was returned for this account.');
    const page=pages.data[0];
    profile={id:page.id,name:page.name,pageAccessToken:page.access_token};
  }
  const sessionToken=crypto.randomBytes(32).toString('hex');
  sessions.set(sessionToken,{platform,metaToken,profile,createdAt:Date.now()});
  pending.set(state,{...record,status:'connected',sessionToken,platform,profile});
}

function callbackPage(message){ return `<!doctype html><html><body style="font-family:system-ui;background:#0b1020;color:#eaf0ff;display:grid;place-items:center;height:100vh"><div style="text-align:center"><h2>${message}</h2><p>You can close this tab and return to Social Analytics Pro.</p></div></body></html>`; }

app.get('/oauth/instagram/callback',async(req,res)=>{try{if(req.query.error) throw new Error(req.query.error_description||'Instagram OAuth was denied'); await complete('instagram',req.query.code,req.query.state); res.send(callbackPage('Instagram connected successfully'));}catch(e){const s=req.query.state;if(s) pending.set(s,{status:'error',message:e.message});res.status(400).send(callbackPage(`Instagram connection failed: ${e.message}`));}});
app.get('/oauth/facebook/callback',async(req,res)=>{try{if(req.query.error) throw new Error(req.query.error_description||'Facebook OAuth was denied'); await complete('facebook',req.query.code,req.query.state); res.send(callbackPage('Facebook Page connected successfully'));}catch(e){const s=req.query.state;if(s) pending.set(s,{status:'error',message:e.message});res.status(400).send(callbackPage(`Facebook connection failed: ${e.message}`));}});

app.get('/api/auth/status',(req,res)=>{
  const state=req.query.state; const r=pending.get(state); if(!r) return res.json({status:'pending'});
  if(Date.now()-r.createdAt>5*60*1000 && r.status==='pending'){pending.delete(state); return res.json({status:'error',message:'OAuth state expired'});}
  res.json({status:r.status, message:r.message, platform:r.platform, profile:r.profile, sessionToken:r.sessionToken});
});

function auth(req,res,next){const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,''); const s=sessions.get(token); if(!s) return res.status(401).json({error:'Not connected'}); req.session=s; req.sessionToken=token; next();}

function pct(n,d){return d?`${((n/d)*100).toFixed(2)}%`:'—';}
function aggregatePosts(posts=[]){
  const counts=new Map(); let likes=0,comments=0;
  for(const p of posts){
    const l=p.like_count ?? p.likes?.summary?.total_count ?? 0; const c=p.comments_count ?? p.comments?.summary?.total_count ?? 0; likes+=Number(l)||0; comments+=Number(c)||0;
    const owner=p.from?.username || p.from?.name; if(owner){const x=counts.get(owner)||{likes:0,comments:0};x.likes+=Number(l)||0;x.comments+=Number(c)||0;counts.set(owner,x);}
  }
  const interactors=[...counts.entries()].sort((a,b)=>(b[1].likes+b[1].comments*2)-(a[1].likes+a[1].comments*2)).slice(0,5).map(([n,x])=>[n,`${x.likes} likes • ${x.comments} comments`,`Based on fetched media/post interactions.`,(x.likes+x.comments*2).toFixed(1)]);
  return {likes,comments,interactors};
}

async function instagramAnalytics(s){
  const profile=await metaFetch(instagramGraph(`/me?fields=id,username,account_type,media_count,followers_count`),s.metaToken);
  const media=await metaFetch(instagramGraph(`/${profile.id}/media?fields=id,caption,like_count,comments_count,timestamp&limit=50`),s.metaToken);
  const agg=aggregatePosts(media.data||[]);
  const total=agg.likes+agg.comments; const engagementRate=profile.followers_count ? pct(total,profile.followers_count) : '—';
  const day=new Date().toISOString().slice(0,10); const snap={date:day,followers:Number(profile.followers_count||0)};
  const arr=snapshots.get(s.profile.id)||[]; if(!arr.some(x=>x.date===day)){arr.push(snap);arr.splice(0,30);snapshots.set(s.profile.id,arr);}
  const series=arr.slice(-7); const first=series[0]?.followers||snap.followers; const change=snap.followers-first; const followerChange=change===0?'0':`${change>0?'+':''}${change}`;
  return {followers:profile.followers_count??'—',profileViews:'—',engagementRate,interactions:total,likeShare:total?(agg.likes/total)*100:50,days:series.map(x=>new Date(x.date).toLocaleDateString('en-US',{weekday:'short'})),views:series.map(()=>0),followersSeries:series.map(x=>x.followers),newFollowers:[],unfollowers:[],interactors:agg.interactors,followerChange,viewChange:'Not supplied',seriesAvailable:series.length>1,profile:{id:profile.id,username:profile.username,accountType:profile.account_type}};
}

async function facebookAnalytics(s){
  const page=s.profile; const posts=await metaFetch(graph(`/${page.id}/published_posts?fields=id,created_time,from,likes.summary(true),comments.summary(true)&limit=50`),s.metaToken); const agg=aggregatePosts(posts.data||[]);
  let fanCount='—', views='—';
  try{const p=await metaFetch(graph(`/${page.id}?fields=name,fan_count`),page.pageAccessToken);fanCount=p.fan_count??'—';}
  catch{}
  try{const ins=await metaFetch(graph(`/${page.id}/insights?metric=page_views_total&period=day&limit=7`),page.pageAccessToken); views=ins.data?.[0]?.values?.at(-1)?.value ?? '—';}
  catch{}
  return {followers:fanCount,profileViews:views,engagementRate:fanCount!=='—'?pct(agg.likes+agg.comments,Number(fanCount)):'—',interactions:agg.likes+agg.comments,likeShare:(agg.likes+agg.comments)?(agg.likes/(agg.likes+agg.comments))*100:50,days:[],views:[],followersSeries:[],newFollowers:[],unfollowers:[],interactors:agg.interactors,followerChange:'Live page metric',viewChange:'Live page metric',seriesAvailable:false,profile:{id:page.id,name:page.name}};
}

app.get('/api/analytics',auth,async(req,res)=>{try{const data=req.session.platform==='instagram'?await instagramAnalytics(req.session):await facebookAnalytics(req.session);res.json({ok:true,platform:req.session.platform,data});}catch(e){res.status(502).json({error:e.message});}});

app.post('/api/logout',auth,(req,res)=>{sessions.delete(req.sessionToken);res.json({ok:true});});

app.listen(PORT,()=>console.log(`Social Analytics Pro backend listening on ${BASE}`));
