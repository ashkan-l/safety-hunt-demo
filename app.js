(() => {
  'use strict';

  const DATA = window.HUNT_DATA;
  const app = document.getElementById('app');
  const panel = document.getElementById('panel');

  // ---------- storage (progress + settings only; photos are never stored) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } }
  };
  const settings = Object.assign(
    { mode: 'smart', threshold: 0.6, bigText: false, showScores: false },
    store.get('hunt.settings', {})
  );
  const saveSettings = () => { store.set('hunt.settings', settings); applySettings(); };
  const applySettings = () => document.documentElement.classList.toggle('big', !!settings.bigText);

  let progress = store.get('hunt.progress', null);
  const saveProgress = () => (progress ? store.set('hunt.progress', progress) : store.del('hunt.progress'));

  // ---------- helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const route = id => DATA.routes.find(r => r.id === id);
  const allSteps = () => DATA.routes.flatMap(r => r.steps);
  const labelName = id => id === 'other' ? 'Other things' : (allSteps().find(s => s.id === id) || {}).name || '—';
  const render = html => { app.innerHTML = html; window.scrollTo(0, 0); };
  const on = (sel, ev, fn) => app.querySelectorAll(sel).forEach(el => el.addEventListener(ev, fn));

  // ---------- on-phone photo check (MobileNet features + nearest reference photo) ----------
  const Vision = {
    model: null, loading: null, status: 'idle', error: '',
    load() {
      if (this.model) return Promise.resolve(this.model);
      if (this.loading) return this.loading;
      this.status = 'loading';
      this.loading = (async () => {
        if (!window.tf || !window.mobilenet) throw new Error('Image model scripts did not load (no internet?)');
        await tf.ready();
        this.model = await mobilenet.load({ version: 2, alpha: 1.0 });
        this.status = 'ready';
        return this.model;
      })().catch(e => { this.status = 'failed'; this.error = e.message; this.loading = null; throw e; });
      return this.loading;
    },
    async embed(file) {
      const canvas = await fileToCanvas(file);
      const model = await this.load();
      const t = model.infer(canvas, true);
      const data = await t.data();
      t.dispose();
      canvas.width = canvas.height = 0; // drop the pixels right away
      return normalize(Array.from(data));
    }
  };

  function fileToCanvas(file, max = 800) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * s);
        c.height = Math.round(img.naturalHeight * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read the photo')); };
      img.src = url;
    });
  }
  function normalize(v) {
    const n = Math.hypot(...v) || 1;
    return v.map(x => Math.round((x / n) * 1e4) / 1e4);
  }
  const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

  // Reference "fingerprints" taught in the presenter panel: { stepId|other: [vector, ...] }
  const getRefs = () => store.get('hunt.refs', {});
  const setRefs = refs => store.set('hunt.refs', refs);

  function nearest(emb, refs, stepId) {
    let best = { label: null, sim: -1 }, own = -1;
    for (const [label, list] of Object.entries(refs)) {
      for (const r of list) {
        const s = dot(emb, r);
        if (s > best.sim) best = { label, sim: s };
        if (label === stepId && s > own) own = s;
      }
    }
    return { best, own };
  }

  async function checkPhoto(step, file) {
    const t0 = performance.now();
    const ms = () => Math.round(performance.now() - t0);
    if (settings.mode === 'auto') {
      await sleep(1200);
      return { pass: true, note: `auto-pass mode · ${ms()} ms` };
    }
    const refs = getRefs();
    if (!refs[step.id] || !refs[step.id].length) {
      await sleep(900);
      return { pass: true, note: `no reference photos taught for this step, so it passed · ${ms()} ms` };
    }
    try {
      const emb = await Vision.embed(file);
      const { best, own } = nearest(emb, refs, step.id);
      const pass = best.label === step.id && own >= settings.threshold;
      return {
        pass,
        note: `match ${own.toFixed(2)} (need ${settings.threshold.toFixed(2)}) · closest: ${labelName(best.label)} ${best.sim.toFixed(2)} · ${ms()} ms`
      };
    } catch (e) {
      return { pass: false, unavailable: true, note: e.message };
    }
  }

  // ---------- screens ----------
  function welcome() {
    const resume = progress && !progress.done && route(progress.routeId);
    render(`
      <h1>Welcome to the team!</h1>
      <p>Finish your first day with a short <strong>Safety Hunt</strong>. Find the safety items for your job, take a photo of each one, and answer one quick question at each step.</p>
      <div class="note"><span aria-hidden="true">⚠️</span><span><b>Your buddy will walk with you.</b> Never take photos near a running machine.</span></div>
      ${resume ? `<button class="btn" id="resume">Continue: ${esc(resume.label)} (step ${progress.index + 1})</button>
                  <button class="btn ghost" id="start">Start over</button>`
               : `<button class="btn" id="start">Start your Safety Hunt</button>`}
      <p class="small muted" style="margin-top:14px">Photos are checked on this phone and deleted right away. No account, no names.</p>
      <p class="small muted">Demo by Team BAME (BADM 202) for Harrison Hot Springs Resort &amp; Spa. A concept, not an official resort tool.</p>
    `);
    on('#start', 'click', () => { progress = null; saveProgress(); positions(); });
    on('#resume', 'click', step);
  }

  function positions() {
    render(`
      <h1>Choose your position</h1>
      <p class="muted">Your hunt covers the safety items for your job.</p>
      ${DATA.routes.map(r => `
        <button class="position" data-route="${esc(r.id)}" ${r.comingSoon ? 'disabled' : ''}>
          <strong>${esc(r.label)}${r.comingSoon ? ' · coming soon' : ''}</strong>
          <span>${esc(r.blurb)}${r.comingSoon ? '' : ` · ${r.steps.length} steps`}</span>
        </button>`).join('')}
      <button class="btn ghost" id="back">Back</button>
    `);
    on('.position', 'click', e => {
      const id = e.currentTarget.dataset.route;
      progress = { routeId: id, index: 0, tries: 0, flagged: [], buddy: [], done: false };
      saveProgress();
      step();
    });
    on('#back', 'click', welcome);
  }

  function photoButton(label, cls = 'btn') {
    return `<label class="${cls}"><input type="file" accept="image/*" capture="environment" id="photo">${label}</label>`;
  }

  function stepHeader(r, i) {
    const pct = Math.round((i / r.steps.length) * 100);
    return `<div class="stepcount">${esc(r.label)} · Step ${i + 1} of ${r.steps.length}</div>
            <div class="progress" aria-hidden="true"><i style="width:${pct}%"></i></div>`;
  }

  function step() {
    const r = route(progress.routeId), s = r.steps[progress.index];
    render(`
      ${stepHeader(r, progress.index)}
      <div class="card">
        <h1 style="margin-top:0">${esc(s.task)}</h1>
        <p class="small muted">${esc(s.safety_note)}</p>
      </div>
      <div class="hint" id="hint" hidden>💡 ${esc(s.hint)}</div>
      ${photoButton('📷&nbsp; Take photo')}
      <button class="btn secondary" id="showhint">Show hint</button>
    `);
    on('#showhint', 'click', e => { app.querySelector('#hint').hidden = false; e.currentTarget.remove(); });
    bindPhoto(s);
  }

  function bindPhoto(s) {
    on('#photo', 'change', async e => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      checking();
      const res = await checkPhoto(s, file);
      res.pass ? correct(s, res) : notQuite(s, res);
    });
  }

  function checking() {
    render(`<div class="spinner" role="status" aria-label="Checking"></div>
            <p style="text-align:center"><strong>Checking your photo…</strong></p>`);
  }

  const scoreLine = res => (settings.showScores && res && res.note ? `<p class="score">${esc(res.note)}</p>` : '');

  function correct(s, res, viaBuddy = false) {
    progress.tries = 0;
    if (viaBuddy && !progress.buddy.includes(s.id)) progress.buddy.push(s.id);
    saveProgress();
    render(`
      <div class="result good"><div class="icon">✓</div>
        <h1>${viaBuddy ? 'Confirmed by your buddy' : 'Found it!'}</h1>
        <p class="muted">${esc(s.name)}</p></div>
      ${scoreLine(res)}
      <div class="card hazard">
        <h2><span aria-hidden="true">⚠️</span> Hazard card</h2>
        <p style="margin:0">${esc(s.hazard_card)}</p>
      </div>
      <div class="card">
        <h2>${esc(s.question)}</h2>
        ${s.choices.map((c, i) => `<button class="choice" data-i="${i}">${String.fromCharCode(65 + i)}) ${esc(c)}</button>`).join('')}
      </div>
    `);
    on('.choice', 'click', e => feedback(s, Number(e.currentTarget.dataset.i)));
  }

  function notQuite(s, res) {
    progress.tries += 1;
    saveProgress();
    const askBuddy = progress.tries >= 2 || res.unavailable;
    render(`
      <div class="result warn"><div class="icon">?</div>
        <h1>${res.unavailable ? "Photo check isn't available" : 'Not quite'}</h1></div>
      ${scoreLine(res)}
      <div class="card">
        <p>${res.unavailable ? 'Your buddy can confirm this step for you.' : `That doesn't look like the <strong>${esc(s.name.toLowerCase())}</strong> yet. Get the whole item in the photo, with good light.`}</p>
        <div class="hint" style="margin:0">💡 ${esc(s.hint)}</div>
      </div>
      ${res.unavailable ? '' : photoButton('📷&nbsp; Try again')}
      ${askBuddy ? '<button class="btn secondary" id="buddy">Ask your buddy</button>' : ''}
      <button class="btn ghost" id="back">Back to the step</button>
    `);
    bindPhoto(s);
    on('#buddy', 'click', () => buddy(s));
    on('#back', 'click', step);
  }

  function buddy(s) {
    render(`
      <h1>Buddy check</h1>
      <p>Buddy: walk to the <strong>${esc(s.name.toLowerCase())}</strong> together, show it, then enter your 4-digit code.</p>
      <input class="pin" id="pin" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="Buddy code">
      <p class="small" id="err" style="color:var(--bad)" hidden>That code isn't right.</p>
      <button class="btn" id="ok">Confirm</button>
      <button class="btn ghost" id="back">Back</button>
    `);
    const pin = app.querySelector('#pin');
    pin.focus();
    const submit = () => {
      if (pin.value === DATA.overrideCode) correct(s, null, true);
      else { app.querySelector('#err').hidden = false; pin.value = ''; pin.focus(); }
    };
    pin.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    on('#ok', 'click', submit);
    on('#back', 'click', step);
  }

  function feedback(s, i) {
    const right = i === s.answer;
    if (!right && !progress.flagged.includes(s.id)) progress.flagged.push(s.id);
    saveProgress();
    app.querySelectorAll('.choice').forEach(b => {
      b.disabled = true;
      const n = Number(b.dataset.i);
      if (n === s.answer) b.classList.add('right');
      else if (n === i) b.classList.add('wrong');
    });
    const r = route(progress.routeId);
    const last = progress.index === r.steps.length - 1;
    const box = document.createElement('div');
    box.innerHTML = `
      <div class="card" style="border-left:6px solid ${right ? 'var(--good)' : 'var(--warn)'}">
        <h2>${right ? '✅ Correct' : '📝 Good to know'}</h2>
        <p>${esc(s.explanation)}</p>
        ${right ? '' : '<p class="small muted" style="margin:0">Flagged so you and your supervisor can go over it. This is not a fail.</p>'}
      </div>
      <button class="btn" id="next">${last ? 'Finish' : 'Next step →'}</button>`;
    app.appendChild(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    box.querySelector('#next').addEventListener('click', () => {
      if (last) { finish(); return; }
      progress.index += 1;
      progress.tries = 0;
      saveProgress();
      step();
    });
  }

  function finish() {
    const r = route(progress.routeId);
    if (!progress.code) progress.code = `${r.prefix}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    progress.done = true;
    saveProgress();
    const review = r.steps.filter(s => progress.flagged.includes(s.id) || progress.buddy.includes(s.id));
    render(`
      <div class="progress" aria-hidden="true"><i style="width:100%"></i></div>
      <div class="result good"><div class="icon">★</div><h1>Hunt complete!</h1>
        <p class="muted">You found all ${r.steps.length} ${esc(r.label)} safety items.</p></div>
      <div class="card">
        <p style="margin:0" class="small muted">Your completion code</p>
        <div class="code">${esc(progress.code)}</div>
        <p class="small" style="margin:0">Show this to your supervisor. They write it on your department safety checklist.</p>
      </div>
      <div class="card">
        <h2>To go over with your supervisor</h2>
        ${review.length
          ? `<ul class="flags">${review.map(s => `<li>${esc(s.name)} <span class="muted small">(${progress.buddy.includes(s.id) ? 'buddy confirmed' : 'question'}, ${esc(s.checklist_ref)})</span></li>`).join('')}</ul>`
          : '<p style="margin:0">Nothing flagged. Great work!</p>'}
      </div>
      <button class="btn" id="pulse">Quick pulse check (30 sec)</button>
      <button class="btn ghost" id="again">Back to start</button>
    `);
    on('#pulse', 'click', pulse);
    on('#again', 'click', () => { progress = null; saveProgress(); welcome(); });
  }

  function pulse() {
    const qs = ['I know the main hazards in my work area.', 'I know who to ask and where to go in an emergency.'];
    render(`
      <h1>Pulse check</h1>
      <p class="muted">1 = not yet, 5 = very sure. Anonymous.</p>
      ${qs.map((q, n) => `<div class="card"><p><strong>${esc(q)}</strong></p>
        <div class="rating" data-q="${n}">${[1, 2, 3, 4, 5].map(v => `<button data-v="${v}">${v}</button>`).join('')}</div></div>`).join('')}
      <button class="btn" id="done">Send</button>
    `);
    on('.rating button', 'click', e => {
      e.currentTarget.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('on'));
      e.currentTarget.classList.add('on');
    });
    on('#done', 'click', () => {
      render(`
        <div class="result good"><div class="icon">✓</div><h1>Thanks, and welcome aboard!</h1>
        <p class="muted">Your supervisor will check in with you during your first week.</p></div>
        <button class="btn ghost" id="home">Back to start</button>`);
      on('#home', 'click', () => { progress = null; saveProgress(); welcome(); });
    });
  }

  // ---------- presenter panel (tap "Safety Hunt" 5 times, press P, or open with ?presenter) ----------
  let taps = [];
  document.getElementById('brand').addEventListener('click', () => {
    const now = Date.now();
    taps = taps.filter(t => now - t < 2500).concat(now);
    if (taps.length >= 5) { taps = []; openPanel(); }
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'p' || e.key === 'P') && !/input|textarea/i.test(e.target.tagName)) panel.hidden ? openPanel() : closePanel();
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });

  function closePanel() { panel.hidden = true; panel.innerHTML = ''; }

  function openPanel() {
    panel.hidden = false;
    const refs = getRefs();
    const count = id => (refs[id] || []).length;
    const routes = DATA.routes.filter(r => !r.comingSoon);
    panel.innerHTML = `<div class="inner">
      <div class="row" style="border:0"><h2 style="margin:0">Presenter panel</h2><button class="mini" id="close">Close</button></div>

      <div class="card">
        <div class="row"><label>Photo check</label>
          <div class="seg"><button data-mode="smart" class="${settings.mode === 'smart' ? 'on' : ''}">On-phone</button><button data-mode="auto" class="${settings.mode === 'auto' ? 'on' : ''}">Auto-pass</button></div></div>
        <div class="row"><label for="thr">Match strictness <span class="count" id="thrv">${settings.threshold.toFixed(2)}</span></label>
          <input type="range" id="thr" min="0.3" max="0.9" step="0.05" value="${settings.threshold}"></div>
        <div class="row"><label for="big">Large text (projector)</label><input type="checkbox" id="big" ${settings.bigText ? 'checked' : ''}></div>
        <div class="row"><label for="scores">Show match scores</label><input type="checkbox" id="scores" ${settings.showScores ? 'checked' : ''}></div>
        <div class="row"><label>Buddy override code</label><strong class="count" style="font-size:1.1rem">${esc(DATA.overrideCode)}</strong></div>
        <div class="row"><label>Image model</label><span class="count" id="mstat">${Vision.status}</span></div>
        <div class="row"><label>Reset the hunt on this phone</label><button class="mini danger" id="reset">Reset</button></div>
      </div>

      <h3>Teach the photo check</h3>
      <p class="small muted">Add 5–8 photos of each real item (or printed picture) from different angles and distances, in the room where you'll present. Also add 10+ photos of "other things" (walls, doors, chairs, desks) so wrong photos get rejected. Only a numeric fingerprint is saved. The photos themselves are discarded.</p>
      ${routes.map(r => `<div class="card"><strong>${esc(r.label)}</strong>
        ${r.steps.map(s => `<div class="row"><label>${esc(s.name)} <span class="count ${count(s.id) >= 5 ? 'ok' : ''}">${count(s.id)}</span></label>
          <label class="mini">+ Photos<input type="file" accept="image/*" multiple data-teach="${esc(s.id)}"></label>
          <button class="mini danger" data-clear="${esc(s.id)}" ${count(s.id) ? '' : 'disabled'}>Clear</button></div>`).join('')}
      </div>`).join('')}
      <div class="card"><div class="row"><label><strong>Other things</strong> <span class="count ${count('other') >= 10 ? 'ok' : ''}">${count('other')}</span></label>
        <label class="mini">+ Photos<input type="file" accept="image/*" multiple data-teach="other"></label>
        <button class="mini danger" data-clear="other" ${count('other') ? '' : 'disabled'}>Clear</button></div></div>
      <p class="small" id="teachmsg" aria-live="polite"></p>

      <div class="card">
        <div class="row"><label>Test a photo (shows closest match)</label><label class="mini">Test<input type="file" accept="image/*" id="testphoto"></label></div>
        <div class="row"><label>Move teaching to another phone</label>
          <span style="display:flex;gap:6px"><button class="mini" id="export">Export</button><label class="mini">Import<input type="file" accept="application/json,.json" id="import"></label></span></div>
      </div>

      <h3>Open on a phone</h3>
      <div id="qr"></div>
      <p class="small muted" style="text-align:center;word-break:break-all">${esc(location.href.split('?')[0])}</p>
    </div>`;

    const $ = sel => panel.querySelector(sel);
    const msg = t => { $('#teachmsg').textContent = t; };
    $('#close').onclick = closePanel;
    panel.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { settings.mode = b.dataset.mode; saveSettings(); openPanel(); });
    $('#thr').oninput = e => { settings.threshold = Number(e.target.value); $('#thrv').textContent = settings.threshold.toFixed(2); saveSettings(); };
    $('#big').onchange = e => { settings.bigText = e.target.checked; saveSettings(); };
    $('#scores').onchange = e => { settings.showScores = e.target.checked; saveSettings(); };
    $('#reset').onclick = () => { progress = null; saveProgress(); closePanel(); welcome(); };

    panel.querySelectorAll('[data-teach]').forEach(inp => inp.onchange = async e => {
      const id = e.target.dataset.teach, files = Array.from(e.target.files || []);
      e.target.value = '';
      if (!files.length) return;
      const all = getRefs();
      all[id] = all[id] || [];
      try {
        for (let i = 0; i < files.length; i++) {
          msg(`Learning ${labelName(id)}… ${i + 1}/${files.length}`);
          all[id].push(await Vision.embed(files[i]));
        }
        if (!setRefs(all)) throw new Error('Phone storage is full');
        openPanel();
        panel.querySelector('#teachmsg').textContent = `Added ${files.length} photo(s) to ${labelName(id)}.`;
      } catch (err) { msg(`Could not learn: ${err.message}`); }
    });
    panel.querySelectorAll('[data-clear]').forEach(b => b.onclick = () => {
      const all = getRefs(); delete all[b.dataset.clear]; setRefs(all); openPanel();
    });

    $('#testphoto').onchange = async e => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      const all = getRefs();
      if (!Object.keys(all).length) { msg('Teach at least one item first.'); return; }
      msg('Testing…');
      try {
        const emb = await Vision.embed(file);
        const ranked = Object.entries(all)
          .map(([label, list]) => ({ label, sim: Math.max(...list.map(v => dot(emb, v))) }))
          .sort((a, b) => b.sim - a.sim).slice(0, 3);
        msg('Closest: ' + ranked.map(x => `${labelName(x.label)} ${x.sim.toFixed(2)}`).join(' · '));
      } catch (err) { msg(`Test failed: ${err.message}`); }
    };

    $('#export').onclick = () => {
      const blob = new Blob([JSON.stringify({ app: 'safety-hunt', refs: getRefs() })], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'safety-hunt-teaching.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $('#import').onchange = async e => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (data.app !== 'safety-hunt' || typeof data.refs !== 'object') throw new Error('Not a Safety Hunt file');
        if (!setRefs(data.refs)) throw new Error('Phone storage is full');
        openPanel();
        panel.querySelector('#teachmsg').textContent = 'Teaching imported.';
      } catch (err) { msg(`Import failed: ${err.message}`); }
    };

    if (window.QRCode) new QRCode($('#qr'), { text: location.href.split('?')[0], width: 180, height: 180 });
    else $('#qr').hidden = true;

    if (Vision.status === 'idle') Vision.load().then(() => { const el = $('#mstat'); if (el) el.textContent = 'ready'; }, () => { const el = $('#mstat'); if (el) el.textContent = 'failed: ' + Vision.error; });
  }

  // ---------- start ----------
  applySettings();
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (settings.mode === 'smart' && Object.keys(getRefs()).length) Vision.load().catch(() => {}); // warm up so the first check is fast
  welcome();
  if (new URLSearchParams(location.search).has('presenter')) openPanel();
})();
