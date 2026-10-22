// eprime.js : mouse-based processing trials to match the E-Prime span tasks.
// Screen 1: problem + "click when ready". Screen 2: answer + two buttons.
// The time limit (from practice) applies to screen 1 only, like E-Prime.
// Feedback comes after each set instead of after every problem.
const EP = {
  VERSION: 'mouse-v2',
  sec: null, secN: 0, secOK: 0, setN: 0, setErr: 0,

  proc(t, cfg) {
    let limit = null, handler = null, done = false;
    const finish = data => {
      if (done) return; done = true;
      if (handler) document.removeEventListener('click', handler);
      jsPsych.pluginAPI.clearAllTimeouts();
      jsPsych.finishTrial(data);
    };
    return {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<div id="ep-wrap"></div>',
      choices: 'NO_KEYS',
      data: Object.assign({}, t.data, { task_version: EP.VERSION }),
      on_start: trial => {
        done = false; handler = null;
        if (t.on_start) t.on_start(trial);
        limit = trial.trial_duration || null;
        trial.trial_duration = null;
      },
      on_load: () => {
        const wrap = document.getElementById('ep-wrap');
        wrap.innerHTML = t.stimulus +
          '<p class="ep-hint">Click the mouse when you are ready to answer.</p>';
        const t0 = performance.now();
        if (limit) jsPsych.pluginAPI.setTimeout(() =>
          finish({ response: null, rt: null, rt_problem: null, rt_answer: null }), limit);
        handler = () => {
          document.removeEventListener('click', handler); handler = null;
          jsPsych.pluginAPI.clearAllTimeouts();
          const rtP = Math.round(performance.now() - t0);
          wrap.innerHTML = cfg.answer(t.data) + '<div class="ep-btns">' +
            cfg.buttons.map(([lab, key]) =>
              `<button class="ep-btn" data-key="${key}">${lab}</button>`).join('') + '</div>';
          const t1 = performance.now();
          wrap.querySelectorAll('.ep-btn').forEach(b => b.addEventListener('click', e => {
            e.stopPropagation();
            finish({ response: b.dataset.key, rt: rtP, rt_problem: rtP,
                     rt_answer: Math.round(performance.now() - t1) });
          }));
        };
        // short delay so the click that ended the last screen doesn't count
        setTimeout(() => { if (!done && handler) document.addEventListener('click', handler); }, 150);
      },
      on_finish: d => {
        if (t.on_finish) t.on_finish(d);
        if (d.timed_out === undefined) d.timed_out = d.response === null;
        const key = d.task || d.trial_type;
        if (/combined|main/.test(key)) {
          if (EP.sec !== key) { EP.sec = key; EP.secN = 0; EP.secOK = 0; }
          const ok = !!d[cfg.field];
          EP.secN++; if (ok) EP.secOK++;
          EP.setN++; if (!ok) EP.setErr++;
        }
      }
    };
  },

  // Shown right after recall: recalled X of Y, errors this set, running accuracy.
  setFeedback(label) {
    return {
      type: jsPsychHtmlKeyboardResponse,
      choices: 'NO_KEYS',
      trial_duration: 2500,
      data: { trial_type: 'set_feedback' },
      stimulus: () => {
        const r = jsPsych.data.get().last(1).values()[0] || {};
        const pct = EP.secN ? Math.round(100 * EP.secOK / EP.secN) : 100;
        const html = `<div class="ep-fb">
          <p>You recalled <strong>${r.partial_correct ?? 0}</strong> out of <strong>${r.set_size ?? '?'}</strong> correctly.</p>
          <p>${EP.setErr} ${label} error${EP.setErr === 1 ? '' : 's'} on this set.</p>
          <p class="ep-pct" style="color:${pct < 85 ? '#b71c1c' : '#2e7d32'}">${label} accuracy: ${pct}%</p>
          ${pct < 85 ? '<p style="color:#b71c1c">Please keep your accuracy above 85%.</p>' : ''}
        </div>`;
        EP.setN = 0; EP.setErr = 0;
        return html;
      }
    };
  }
};

document.head.insertAdjacentHTML('beforeend', `<style>
  .ep-hint { color:#888; margin-top:28px; font-size:.95em; }
  .ep-btns { display:flex; gap:40px; justify-content:center; margin-top:30px; }
  .ep-btn  { font-size:1.3em; font-weight:bold; min-width:150px; padding:16px 28px;
             border-radius:10px; border:2px solid #555; background:#f5f5f5; cursor:pointer; }
  .ep-btn:hover { background:#e3f2fd; border-color:#1565c0; }
  .ep-q    { font-size:1.35em; margin-bottom:6px; }
  .ep-fb   { font-size:1.2em; line-height:1.7; text-align:center; }
  .ep-pct  { font-weight:bold; font-size:1.15em; }
  .btn-blank { font-size:1.05em; padding:11px 30px; border-radius:8px;
               border:2px solid #999; background:#e0e0e0; cursor:pointer; }
</style>`);

// Instruction screens: ignore key presses for the first 2 s so nobody skips by accident.
(function () {
  let shownAt = 0, seen = null;
  new MutationObserver(() => {
    const el = document.querySelector('.instr');
    if (el && el !== seen) { seen = el; shownAt = performance.now(); }
    if (!el) seen = null;
  }).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('keydown', e => {
    if (seen && document.contains(seen) && performance.now() - shownAt < 2000) e.stopImmediatePropagation();
  }, true);
})();
