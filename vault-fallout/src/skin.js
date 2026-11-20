/* VAULT_ : Unraid skin, thèmes clairs (loaded by Aurora Theme as custom.js, after the Disaster Recovery skin).
   Alter ego « lecture seule » d'eliot_ : terminal RobCo / Pip-Boy. Purely visual, no network request. */
(function () {
  if (window.__vaultSkinLoaded) return;
  var html = document.documentElement;
  if (!(html.classList.contains('Theme--white') || html.classList.contains('Theme--azure'))) return;
  window.__vaultSkinLoaded = true;

  function ready(fn) { document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ready(function () {
    var host = (document.title.split('/')[0] || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'vault';

    // 0) séquence de démarrage RobCo, une fois par session d'onglet (ne bloque jamais les clics)
    (function () {
      var seen = false;
      try { seen = sessionStorage.getItem('vt-boot') === '1'; sessionStorage.setItem('vt-boot', '1'); } catch (e) { seen = true; }
      if (seen || calm) return;
      var lines = [
        'ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL',
        'ENTER PASSWORD NOW',
        '',
        '> SET TERMINAL/INQUIRE',
        '> SET FILE/PROTECTION=OWNER:R',
        '> RUN DEBUG/ACCOUNTS.F',
        '',
        'VAULT-TEC ' + host.toUpperCase() + ' NODE ........ ONLINE',
        'MODE ...................... READ-ONLY'
      ];
      var b = document.createElement('div'); b.id = 'vt-boot';
      document.body.appendChild(b);
      var out = '', li = 0, ci = 0;
      (function type() {
        if (li >= lines.length) {
          b.innerHTML = ''; b.textContent = out; b.appendChild(document.createElement('i'));
          setTimeout(function () { b.classList.add('vt-out'); setTimeout(function () { b.remove(); }, 500); }, 420);
          return;
        }
        var l = lines[li];
        if (ci < l.length) { out += l.slice(ci, ci + 3); ci += 3; }
        else { out += '\n'; li++; ci = 0; }
        b.textContent = out; b.appendChild(document.createElement('i'));
        setTimeout(type, ci === 0 ? 40 : 9);
      })();
    })();

    // 1) logo vault_ >_ à la place du logo Unraid, avec le prompt caché (même mécanique qu'eliot_)
    function brand() {
      var a = document.querySelector('#header a.uh-logo');
      if (!a || a.querySelector('.vt-host-wrap')) return;
      var w = document.createElement('span');
      w.className = 'vt-host-wrap';
      w.innerHTML = '<span class="vt-host"></span><span class="vt-host-prompt">&gt;_<i></i>'
        + '<span class="vt-ask-line"><span class="vt-ask-txt"></span><i class="vt-ask-caret"></i></span>'
        + '<input id="vt-ask" type="text" spellcheck="false" autocomplete="off" aria-label="Parler à vault_"></span>';
      var h = w.firstChild; h.textContent = 'vault_'; h.setAttribute('data-text', 'vault_');
      a.insertBefore(w, a.firstChild);
      a.setAttribute('title', 'war. war never changes.');
      // prompt caché : on tape dans le vide, seuls les caractères apparaissent ; Entrée ouvre vault_ en popup terminal
      var ask = w.querySelector('#vt-ask'), txt = w.querySelector('.vt-ask-txt');
      var off = function () { w.classList.remove('vt-asking'); html.classList.remove('vt-ask-on'); };
      var stop = function (e) { e.stopPropagation(); if (e.type === 'click') e.preventDefault(); };
      ['mousedown', 'click', 'mouseup'].forEach(function (t) { ask.addEventListener(t, stop); });
      ask.addEventListener('focus', function () { w.classList.add('vt-asking'); html.classList.add('vt-ask-on'); });
      ask.addEventListener('blur', function () { if (!ask.value) off(); });
      ask.addEventListener('input', function () { txt.textContent = ask.value; });
      ask.addEventListener('keydown', function (e) {
        e.stopPropagation();
        if (e.key === 'Escape') { ask.value = ''; txt.textContent = ''; ask.blur(); off(); }
        else if (e.key === 'Enter') {
          e.preventDefault();
          var q = ask.value.trim();
          var url = '/webterminal/vault/';
          var H = Math.min(screen.availHeight, 780), W = Math.min(screen.availWidth, 1100);
          var win = (typeof window.makeWindow === 'function') ? window.makeWindow('vault_', H, W)
            : window.open('', 'vault_', 'width=' + W + ',height=' + H + ',left=' + ((screen.availWidth - W) / 2) + ',top=' + ((screen.availHeight - H) / 2));
          if (win) setTimeout(function () {
            win.location = url; win.focus();
            if (!q) return;
            // nginx ne transmet pas la query string aux terminaux : la question est tapée dans le terminal une fois vault_ démarré
            var tries = 0, t = setInterval(function () {
              tries++;
              var term = null;
              try { term = win.term; } catch (e) {}
              if (term || tries > 60) {
                clearInterval(t);
                if (!term) return;
                setTimeout(function () {
                  try { if (typeof term.input === 'function') term.input(q + '\r', true); else term._core.coreService.triggerDataEvent(q + '\r', true); } catch (e) {}
                }, 3200);
              }
            }, 250);
          }, 120);
          ask.value = ''; txt.textContent = ''; ask.blur(); off();
        }
      });
      // bloc TERMLINK : verdict et lignes clés du dernier rapport d'Eliot (window.__skinStatus, posé par build.py)
      var st = window.__skinStatus, hdrEl = document.getElementById('header');
      if (hdrEl && !document.getElementById('vt-term')) {
        var tb = document.createElement('div'); tb.id = 'vt-term';
        var add = function (cls, s) { var d = document.createElement('div'); d.className = cls; d.textContent = s; tb.appendChild(d); };
        add('vt-t-h', 'robco termlink · ' + host + ' · read-only');
        if (st) {
          tb.title = 'Eliot · run ' + st.when + (st.headline ? ' — ' + st.headline : '');
          add('vt-t-v vt-t-v-' + String(st.verdict_en || '').toLowerCase(), '[ ' + (st.verdict_en || '?') + ' ] ' + (st.when || ''));
          (st.lines || []).slice(0, 3).forEach(function (l) { add('vt-c-' + (l.c || 'txt'), '> ' + l.t); });
        } else add('vt-t-v', '[ STANDBY ] no report');
        hdrEl.appendChild(tb);
        var place = function () {
          var blk = a.closest('.uh-logo-block') || a;
          var ver = blk.querySelector('.uh-version') || blk;
          var right = Math.max(a.getBoundingClientRect().right, ver.getBoundingClientRect().right);
          tb.style.left = Math.round(right - hdrEl.getBoundingClientRect().left + 40) + 'px';
        };
        place(); setTimeout(place, 600); window.addEventListener('resize', place);
      }
    }
    brand();
    var hdr = document.getElementById('header');
    if (hdr && window.MutationObserver) new MutationObserver(brand).observe(hdr, { childList: true, subtree: true });

    // 2) signature dans le pied de page
    var footer = document.getElementById('footer');
    if (footer && !document.getElementById('vt-friend')) {
      var f = document.createElement('span');
      f.id = 'vt-friend';
      f.textContent = 'war. war never changes.';
      var right = footer.querySelector('#copyright, .right, span:last-child');
      (right && right.parentNode ? right.parentNode : footer).insertBefore(f, right || null);
    }

    if (calm) return;

    // 3) bugs façon Fallout, un toutes les 2,5 à 6 s : ligne qui saute, caractères qui clignotent,
    //    vidéo inverse, surexposition, scintillement, barre de balayage, encart VAULT-TEC LOADING
    var SKIP = {SCRIPT: 1, STYLE: 1, OPTION: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, SVG: 1, PATH: 1, NOSCRIPT: 1, IFRAME: 1};
    function leafs() {
      var out = [], all = document.body.getElementsByTagName('*');
      for (var i = 0; i < all.length; i++) {
        var e = all[i];
        if (SKIP[e.tagName.toUpperCase()] || e.children.length > 0) continue;
        var t = (e.textContent || '').trim();
        if (t.length < 3 || t.length > 48) continue;
        var r = e.getBoundingClientRect();
        if (r.width < 24 || r.height < 8 || r.height > 60 || r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) continue;
        if (e.closest('.awesomplete, [role="modal"], .sweet-alert, #vt-roll, #vt-load, #vt-boot, .vt-host-wrap, [contenteditable]')) continue;
        var cs = getComputedStyle(e);
        if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
        out.push(e);
      }
      return out;
    }
    function pick() { var l = leafs(); return l.length ? l[Math.floor(Math.random() * l.length)] : null; }
    function jump(el) { el.classList.add('vt-jump'); setTimeout(function () { el.classList.remove('vt-jump'); }, 460); }
    function flash(el, cls, n, ms) {
      var k = 0;
      (function tick() {
        if (k >= n) { el.classList.remove(cls); return; }
        el.classList.toggle(cls, k % 2 === 0); k++; setTimeout(tick, ms);
      })();
    }
    // caractères qui clignotent : 1 à 3 lettres remplacées un instant ; abandon si la page a changé le texte entre-temps
    var GLYPH = '#%&@$/\\|<>?!*+=01[]{}';
    function chars(el) {
      var orig = el.textContent, mine = orig, k = 0, steps = 3 + Math.floor(Math.random() * 4);
      var idx = [], n = 1 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i++) idx.push(Math.floor(Math.random() * orig.length));
      (function tick() {
        if (el.textContent !== mine) return;            // texte mis à jour par Unraid : on ne touche plus à rien
        if (k >= steps) { el.textContent = orig; return; }
        var s = orig.split('');
        if (k % 2 === 0) idx.forEach(function (j) { if (s[j] && s[j] !== ' ') s[j] = GLYPH[Math.floor(Math.random() * GLYPH.length)]; });
        mine = s.join(''); el.textContent = mine; k++;
        setTimeout(tick, 70 + Math.random() * 70);
      })();
    }
    function flicker() { html.classList.add('vt-flicker'); setTimeout(function () { html.classList.remove('vt-flicker'); }, 700); }
    function roll() {
      if (document.getElementById('vt-roll')) return;
      var d = document.createElement('div'); d.id = 'vt-roll'; document.body.appendChild(d);
      setTimeout(function () { d.remove(); }, 4400);
    }
    function loading() {
      if (document.getElementById('vt-load')) return;
      var d = document.createElement('div'); d.id = 'vt-load'; document.body.appendChild(d);
      var p = 0, N = 14, lbl = ['vault-tec loading', 'pip-os v7.1.0.8', 'decrypting termlink', 'g.e.c.k. checksum'][Math.floor(Math.random() * 4)];
      (function tick() {
        p += 1 + Math.floor(Math.random() * 3);
        if (p > N) p = N;
        d.innerHTML = '';
        d.appendChild(document.createTextNode(lbl + '  '));
        var b = document.createElement('b'); b.textContent = '[' + '▮'.repeat(p) + '·'.repeat(N - p) + '] ' + Math.round(p / N * 100) + '%';
        d.appendChild(b);
        if (p < N) setTimeout(tick, 90 + Math.random() * 160); else setTimeout(function () { d.remove(); }, 650);
      })();
    }
    function vhold() {
      html.style.setProperty('--vt-d', Math.round(420 + Math.random() * 380) + 'ms');
      html.classList.add('vt-vhold');
      setTimeout(function () { html.classList.remove('vt-vhold'); }, 860);
    }
    function fire() {
      var r = Math.random(), el;
      if (r < .07) return flicker();
      if (r < .13) return roll();
      if (r < .19) return loading();
      if (!(el = pick())) return;
      if (r < .45) return jump(el);
      if (r < .75) return chars(el);
      if (r < .9) return flash(el, 'vt-inv', 6, 110);
      flash(el, 'vt-burn', 4, 140);
    }
    function busy() {
      var a = document.activeElement, m = document.querySelector('[role="modal"]');
      return document.hidden || (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) || (m && m.offsetParent !== null);
    }
    function loop() {
      if (!busy()) {
        try { fire(); } catch (e) {}
        if (Math.random() < .25) setTimeout(function () { if (!busy()) { try { fire(); } catch (e) {} } }, 150 + Math.random() * 600);
      }
      setTimeout(loop, 2500 + Math.random() * 3500);
    }
    setTimeout(loop, 3500);
    // 4) perte de synchro verticale : toutes les 20 à 45 s, jamais pendant la saisie
    setTimeout(function hold() {
      if (!busy()) vhold();
      setTimeout(hold, 20000 + Math.random() * 25000);
    }, 12000 + Math.random() * 10000);
    window.__vaultBug = { jump: jump, chars: chars, flash: flash, flicker: flicker, roll: roll, loading: loading, vhold: vhold, fire: fire, leafs: leafs };
    try { console.log('%cwar. war never changes.', 'color:#14ff4a;font:700 16px monospace;text-shadow:0 0 8px #14ff4a'); } catch (e) {}
  });
})();
