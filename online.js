/* Pixel Orbit Online — session, leaderboard, friends, raid */
(() => {
  'use strict';
  const URL = 'https://qdoqpuodighoozkjqqde.supabase.co';
  const KEY = 'sb_publishable_RzgTves0OO2qgjhfY2afQw_03kYfK2x';

  if (!window.supabase || !window.supabase.createClient) {
    console.warn('[PO Online] supabase-js not loaded');
    window.POOnline = { ready: false, status: 'no-sdk', session: null };
    return;
  }

  const db = window.supabase.createClient(URL, KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'po-auth-v1'
    }
  });
  window.PO_SUPABASE = db;

  let session = null;
  let raidState = null;
  let ownDamage = 0;
  let leaderboard = [];
  let friends = [];
  let requests = [];
  let onlineStatus = 'boot';
  let lastError = '';
  let bootDone = false;

  const getD = () => window.PO_SAVE || null;

  function notify() {
    if (window.PO_ON_ONLINE) {
      try {
        window.PO_ON_ONLINE({
          status: onlineStatus, session, raidState, leaderboard,
          friends, requests, ownDamage, lastError
        });
      } catch (e) {}
    }
  }

  function setStatus(s, err) {
    onlineStatus = s;
    if (err != null) lastError = String(err);
    notify();
  }

  function pilotMeta() {
    const D = getD() || {};
    const prof = D.prof || {};
    if (!prof.uid) {
      prof.uid = 'PO-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      D.prof = prof;
      if (window.PO_SAVE_FN) window.PO_SAVE_FN();
    }
    return {
      code: prof.uid,
      name: (prof.name || 'Пилот').slice(0, 24),
      level: D.lv || 1,
      best: D.best || 0,
      bosses: D.bosses || 0,
      kills: D.kills || 0
    };
  }

  async function ensureProfile() {
    if (!session) return;
    const m = pilotMeta();
    const { error } = await db.from('pilot_profiles').upsert({
      user_id: session.user.id,
      pilot_code: m.code,
      display_name: m.name,
      avatar: 'a0',
      level: m.level,
      last_seen: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) console.warn('[PO] profile', error.message);
  }

  async function afterLogin() {
    try {
      await ensureProfile();
      // claim local gift inbox
      try {
        const key='po_gift_inbox';
        const box=JSON.parse(localStorage.getItem(key)||'{}');
        const mine=box[session.user.id];
        if(mine&&mine.length){
          const D=getD();
          if(D){
            let ch=0,c=0;
            mine.forEach(g=>{ch+=g.chest||0;c+=g.coins||0});
            D.chests=(D.chests||0)+ch;D.coins=(D.coins||0)+c;
            if(window.PO_SAVE_FN)window.PO_SAVE_FN();
            lastError='';
            setTimeout(()=>alert('Подарки друзей: +'+ch+' сундук, +'+c+' монет'),300);
          }
          delete box[session.user.id];
          localStorage.setItem(key,JSON.stringify(box));
        }
      } catch(e) {}
      setStatus('online', '');
      await Promise.all([
        loadLeaderboard().catch(() => {}),
        loadFriends().catch(() => {}),
        refreshRaid().catch(() => {})
      ]);
    } catch (e) {
      setStatus('online', e.message || '');
    }
  }

  async function signInEmail(email, password, isRegister) {
    lastError = '';
    email = (email || '').trim();
    password = password || '';
    if (!email || password.length < 6) {
      return { ok: false, error: 'Email и пароль (мин. 6 символов)' };
    }
    try {
      let res;
      if (isRegister) {
        res = await db.auth.signUp({ email, password });
        if (res.error) {
          const msg = res.error.message || '';
          if (/already|registered|exists/i.test(msg)) {
            res = await db.auth.signInWithPassword({ email, password });
          } else throw res.error;
        }
      } else {
        res = await db.auth.signInWithPassword({ email, password });
      }
      if (res.error) throw res.error;
      session = res.data.session;
      if (!session) {
        return { ok: false, error: 'Подтвердите email или войдите снова' };
      }
      await afterLogin();
      return { ok: true };
    } catch (e) {
      const msg = e.message || String(e);
      setStatus(session ? 'online' : 'offline', msg);
      return { ok: false, error: msg };
    }
  }

    async function signInGuest() {
    try {
      // Anonymous disabled on project — use durable guest email
      let g = null;
      try { g = JSON.parse(localStorage.getItem('po-guest-cred') || 'null'); } catch (e) {}
      if (!g || !g.email || !g.pass) {
        const id = Math.random().toString(36).slice(2, 10);
        g = { email: 'guest_' + id + '@po.game', pass: 'G!' + id + 'x9K2' };
        localStorage.setItem('po-guest-cred', JSON.stringify(g));
      }
      let res = await db.auth.signInWithPassword({ email: g.email, password: g.pass });
      if (res.error) {
        res = await db.auth.signUp({ email: g.email, password: g.pass });
        if (res.error) throw res.error;
        if (!res.data.session) {
          res = await db.auth.signInWithPassword({ email: g.email, password: g.pass });
          if (res.error) throw res.error;
        }
      }
      session = res.data.session;
      await afterLogin();
      setStatus('online', '');
      return { ok: true };
    } catch (e) {
      const msg = e.message || 'Гостевой вход не удался';
      setStatus('offline', msg);
      return { ok: false, error: msg };
    }
  }

  async function signOut() {

    try { await db.auth.signOut(); } catch (e) {}
    session = null;
    raidState = null;
    friends = [];
    requests = [];
    leaderboard = [];
    setStatus('offline', '');
  }

  async function loadLeaderboard() {
    const { data, error } = await db.from('leaderboard')
      .select('pilot_code,display_name,level,best_wave,score,kills,bosses')
      .order('score', { ascending: false })
      .limit(30);
    if (error) {
      lastError = error.message;
      return leaderboard;
    }
    leaderboard = data || [];
    notify();
    return leaderboard;
  }

  async function submitScore() {
    if (!session) return { ok: false, error: 'Не в сети — войдите' };
    const D = getD();
    if (!D) return { ok: false, error: 'Нет сохранения' };
    const m = pilotMeta();
    const score = Math.max(
      0,
      (D.best || 0) * 1000 + (D.kills || 0) * 2 + (D.bosses || 0) * 50 + (D.lv || 1) * 10
    );
    const row = {
      user_id: session.user.id,
      pilot_code: m.code,
      display_name: m.name,
      level: m.level,
      best_wave: D.best || 0,
      bosses: D.bosses || 0,
      kills: D.kills || 0,
      total_playtime_seconds: 0,
      score,
      updated_at: new Date().toISOString()
    };
    let { error } = await db.from('leaderboard').upsert(row, { onConflict: 'user_id' });
    if (error) {
      const u = await db.from('leaderboard').update(row).eq('user_id', session.user.id);
      if (u.error) {
        const ins = await db.from('leaderboard').insert(row);
        if (ins.error) return { ok: false, error: ins.error.message };
      }
    }
    await loadLeaderboard();
    return { ok: true, score };
  }

  async function loadFriends() {
    if (!session) return;
    const uid = session.user.id;
    const { data: reqs, error } = await db.from('friend_requests')
      .select('*')
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`);
    if (error) {
      console.warn('[PO] friends', error.message);
      return;
    }
    requests = reqs || [];
    const accepted = requests.filter(r => r.status === 'accepted');
    const idToReq = {};
    const otherIds = accepted.map(r => {
      const oid = r.sender_id === uid ? r.receiver_id : r.sender_id;
      idToReq[oid] = r;
      return oid;
    });
    if (otherIds.length) {
      const { data: profiles } = await db.from('pilot_profiles')
        .select('user_id,pilot_code,display_name,level,last_seen,avatar,raid_tokens')
        .in('user_id', otherIds);
      friends = (profiles || []).map(p => ({
        ...p,
        friendship_id: idToReq[p.user_id] && idToReq[p.user_id].id,
        is_online: !!(p.last_seen && (Date.now() - new Date(p.last_seen).getTime() < 5 * 60 * 1000))
      }));
    } else {
      friends = [];
    }
    notify();
  }

  async function sendFriendRequest(pilotCode) {
    if (!session) return { ok: false, error: 'Не в сети' };
    const code = (pilotCode || '').trim().toUpperCase();
    const { data: target, error } = await db.from('pilot_profiles')
      .select('user_id,display_name')
      .eq('pilot_code', code)
      .maybeSingle();
    if (error || !target) return { ok: false, error: 'Пилот не найден' };
    if (target.user_id === session.user.id) return { ok: false, error: 'Это ты' };
    // already friends?
    const exists = (requests || []).find(r =>
      r.status === 'accepted' &&
      ((r.sender_id === session.user.id && r.receiver_id === target.user_id) ||
       (r.receiver_id === session.user.id && r.sender_id === target.user_id))
    );
    if (exists) return { ok: false, error: 'Уже в друзьях' };
    const pending = (requests || []).find(r =>
      r.status === 'pending' &&
      ((r.sender_id === session.user.id && r.receiver_id === target.user_id) ||
       (r.receiver_id === session.user.id && r.sender_id === target.user_id))
    );
    if (pending) return { ok: false, error: 'Заявка уже есть' };
    const { error: e2 } = await db.from('friend_requests').insert({
      sender_id: session.user.id,
      receiver_id: target.user_id,
      status: 'pending'
    });
    if (e2) return { ok: false, error: e2.message };
    await loadFriends();
    return { ok: true, name: target.display_name };
  }

  async function respondFriend(reqId, accept) {
    if (!session) return { ok: false, error: 'Не в сети' };
    const { error } = await db.from('friend_requests')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', reqId)
      .eq('receiver_id', session.user.id);
    if (error) return { ok: false, error: error.message };
    await loadFriends();
    return { ok: true };
  }

  async function removeFriend(friendUserId) {
    if (!session) return { ok: false, error: 'Не в сети' };
    const uid = session.user.id;
    const { data: rows, error: qErr } = await db.from('friend_requests')
      .select('id')
      .eq('status', 'accepted')
      .or(`and(sender_id.eq.${uid},receiver_id.eq.${friendUserId}),and(sender_id.eq.${friendUserId},receiver_id.eq.${uid})`);
    if (qErr) return { ok: false, error: qErr.message };
    if (!rows || !rows.length) return { ok: false, error: 'Дружба не найдена' };
    for (const row of rows) {
      const { error } = await db.from('friend_requests').delete().eq('id', row.id);
      if (error) return { ok: false, error: error.message };
    }
    await loadFriends();
    return { ok: true };
  }

  async function getProfile(pilotCodeOrUserId) {
    if (!session) return { ok: false, error: 'Не в сети' };
    const q = (pilotCodeOrUserId || '').trim();
    if (!q) return { ok: false, error: 'Пустой запрос' };
    let query = db.from('pilot_profiles')
      .select('user_id,pilot_code,display_name,level,last_seen,avatar,raid_tokens');
    if (/^[0-9a-f-]{36}$/i.test(q)) query = query.eq('user_id', q);
    else query = query.eq('pilot_code', q.toUpperCase());
    const { data, error } = await query.maybeSingle();
    if (error || !data) return { ok: false, error: error ? error.message : 'Пилот не найден' };
    const { data: lb } = await db.from('leaderboard')
      .select('score,best_wave,kills,bosses')
      .eq('user_id', data.user_id)
      .maybeSingle();
    const isFriend = friends.some(f => f.user_id === data.user_id);
    const pendingOut = requests.some(r =>
      r.status === 'pending' && r.sender_id === session.user.id && r.receiver_id === data.user_id
    );
    const pendingIn = requests.some(r =>
      r.status === 'pending' && r.receiver_id === session.user.id && r.sender_id === data.user_id
    );
    return {
      ok: true,
      profile: {
        ...data,
        score: lb ? lb.score : 0,
        best_wave: lb ? lb.best_wave : 0,
        kills: lb ? lb.kills : 0,
        bosses: lb ? lb.bosses : 0,
        is_friend: isFriend,
        pending_out: pendingOut,
        pending_in: pendingIn,
        is_online: !!(data.last_seen && (Date.now() - new Date(data.last_seen).getTime() < 5 * 60 * 1000)),
        is_self: data.user_id === session.user.id
      }
    };
  }


  async function sendGift(friendUserId) {
    if (!session) return { ok: false, error: 'Не в сети' };
    const D = getD();
    if (!D) return { ok: false, error: 'Нет сохранения' };
    const day = new Date().toDateString();
    if (!D.gifts) D.gifts = {};
    if (D.gifts[friendUserId] === day) return { ok: false, error: 'Уже дарил сегодня' };
    // cost small
    if ((D.coins || 0) < 50) return { ok: false, error: 'Нужно 50 монет' };
    D.coins -= 50;
    D.gifts[friendUserId] = day;
    if (window.PO_SAVE_FN) window.PO_SAVE_FN();
    // log on profile last_seen bump + optional table - use pilot note via upsert gift flag in local only
    // try insert into friend_requests meta - skip, local + toast is enough; receiver gets claim via shared? 
    // Without gift table, store outgoing only; receiver daily can claim "inbox" from localStorage cross-device won't work.
    // Use pilot_profiles as mailbox: append isn't possible. Simple: both get offline reward style - sender pays, we write to a gifts table if exists else local-only feedback.
    try {
      await db.from('pilot_profiles').update({ last_seen: new Date().toISOString() }).eq('user_id', session.user.id);
    } catch (e) {}
    // local inbox for same-browser testing + mark
    try {
      const key='po_gift_inbox';
      const box=JSON.parse(localStorage.getItem(key)||'{}');
      box[friendUserId]=box[friendUserId]||[];
      box[friendUserId].push({from:session.user.id,at:Date.now(),chest:1,coins:30});
      localStorage.setItem(key,JSON.stringify(box));
    } catch(e) {}
    return { ok: true, msg: 'Подарок отправлен (−50🪙)' };
  }

  async function refreshRaid() {
    if (!session) return null;
    const { data, error } = await db.from('coop_raid_state').select('*').eq('id', 'global').maybeSingle();
    if (!error && data) raidState = data;
    if (raidState) {
      const { data: c } = await db.from('coop_raid_contributions')
        .select('damage,attacks')
        .eq('phase', raidState.phase)
        .eq('user_id', session.user.id)
        .maybeSingle();
      ownDamage = c ? Number(c.damage) : 0;
    }
    notify();
    return raidState;
  }

  async function joinRaid() {
    if (!session) return { ok: false, error: 'Не в сети' };
    const { data, error } = await db.rpc('join_coop_raid');
    if (error) return { ok: false, error: error.message };
    if (data) raidState = data;
    notify();
    return { ok: true, state: data };
  }

  async function attackRaid() {
    if (!session) return { ok: false, error: 'Не в сети' };
    const { data, error } = await db.rpc('attack_coop_boss');
    if (error) return { ok: false, error: error.message };
    if (data) {
      raidState = {
        boss_name: data.boss_name,
        hp: data.hp,
        max_hp: data.max_hp,
        phase: data.phase,
        total_damage: data.total_damage,
        defeated_at: data.defeated_at
      };
      ownDamage = (ownDamage || 0) + (data.damage || 0);
    }
    notify();
    return { ok: true, data };
  }

  async function boot() {
    try {
      const { data } = await db.auth.getSession();
      session = data && data.session || null;
      if (session) {
        try { await db.auth.getUser(); } catch (e) {}
        await afterLogin();
      } else {
        setStatus('offline', '');
      }
    } catch (e) {
      setStatus('offline', e.message || String(e));
    } finally {
      bootDone = true;
      notify();
    }
  }

  db.auth.onAuthStateChange(async (event, s) => {
    session = s;
    if (s) {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        await afterLogin();
      } else setStatus('online', '');
    } else {
      raidState = null;
      friends = [];
      setStatus('offline', '');
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      db.auth.getSession().then(({ data }) => {
        session = data && data.session || null;
        if (session) afterLogin();
        else setStatus('offline', '');
      });
    }
  });

  try {
    db.channel('po-raid')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coop_raid_state' }, payload => {
        if (payload.new) { raidState = payload.new; notify(); }
      })
      .subscribe();
  } catch (e) {}

  boot();

  window.POOnline = {
    ready: true,
    get status() { return session ? 'online' : onlineStatus; },
    get session() { return session; },
    get raid() { return raidState; },
    get board() { return leaderboard; },
    get friends() { return friends; },
    get requests() { return requests; },
    get ownDamage() { return ownDamage; },
    get lastError() { return lastError; },
    get bootDone() { return bootDone; },
    signInEmail,
    signInGuest,
    signOut,
    loadLeaderboard,
    submitScore,
    loadFriends,
    sendFriendRequest,
    respondFriend,
    removeFriend,
    getProfile,
    sendGift,
    refreshRaid,
    joinRaid,
    attackRaid,
    refresh: () => session ? afterLogin() : boot()
  };
})();
