/* DISASTER RECOVERY : Unraid skin (loaded by Aurora Theme as custom.js). Purely visual, no network request. */
(function () {
  if (window.__skinLoaded) return;
  window.__skinLoaded = true;
  var html = document.documentElement;
  if (!html.classList.contains('Theme--black')) return;

  function ready(fn) { document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    var host = (document.title.split('/')[0] || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'unraid';
    // 1) prompt root dans la barre de navigation
    var menu = document.getElementById('menu');
    if (menu && !document.getElementById('el-prompt')) {
      var page = (location.pathname.split('/').filter(Boolean)[0] || 'dashboard').toLowerCase();
      var p = document.createElement('span');
      p.id = 'el-prompt';
      p.innerHTML = 'root@' + host + ':<b>~/' + page.replace(/[^a-z0-9_-]/g, '') + '</b>#'
        + '<input id="el-search" type="text" placeholder=" " spellcheck="false" autocomplete="off" aria-label="Search Unraid">';
      p.title = 'hello, friend.';
      var first = menu.querySelector('.nav-tile');
      if (first) first.insertBefore(p, first.firstChild); else menu.insertBefore(p, menu.firstChild);
    }
    // 1 ter) le prompt devient la recherche d'Unraid (mêmes suggestions, même navigation, Ctrl+K)
    var box = document.getElementById('el-search');
    if (box) {
      var zone = document.getElementById('el-prompt');
      zone.addEventListener('mousedown', function (e) { if (e.target !== box) { e.preventDefault(); box.focus(); } });
      var go = function (val) {
        if (!val || typeof window.guiSearch !== 'function') return;
        var span = document.createElement('span');
        span.id = 'guiSearchBoxSpan'; span.style.display = 'none';
        span.innerHTML = '<input id="guiSearchBox" type="text">';
        document.body.appendChild(span);
        span.firstChild.value = val;
        try { window.guiSearch(); } catch (e) { span.remove(); }
      };
      var setup = function () {
        if (box.__eliot || !window.Awesomplete) return;
        box.__eliot = true;
        var aw = new Awesomplete(box, { list: window.guiSearchSuggestions || [], maxItems: 15, autoFirst: true, minChars: 1 });
        box.addEventListener('awesomplete-selectcomplete', function (e) { go(box.value); });
      };
      var place = function () {
        var r = box.getBoundingClientRect();
        document.documentElement.style.setProperty('--el-sugg-top', Math.round(r.bottom + 10) + 'px');
        document.documentElement.style.setProperty('--el-sugg-left', Math.round(r.left - 8) + 'px');
      };
      box.addEventListener('focus', function () { setup(); place(); });
      box.addEventListener('input', place);
      window.addEventListener('resize', place);
      box.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { box.value = ''; box.blur(); }
        else if (e.key === 'Enter' && !document.querySelector('.awesomplete ul:not([hidden]) li[aria-selected="true"]')) go(box.value);
      });
      window.gui_search = function () { setup(); box.focus(); box.select(); };
      window.guiSearchBoxSpan = function () { return document.activeElement === box; };
      window.closeSearchBox = (function (orig) {
        return function (e) { if (document.activeElement === box) { box.blur(); return; } return orig ? orig.apply(this, arguments) : undefined; };
      })(window.closeSearchBox);
      document.querySelectorAll('#menu [onclick*="gui_search"]').forEach(function (el) {
        (el.closest('.nav-item') || el).style.display = 'none';
      });
    }

    // 1 bis) nom du serveur à la place du logo Unraid (lu dans le titre « Vault/Page », donc toujours à jour)
    function brand() {
      var a = document.querySelector('#header a.uh-logo');
      if (!a || a.querySelector('.el-host-wrap')) return;
      var w = document.createElement('span');
      w.className = 'el-host-wrap';
      w.innerHTML = '<span class="el-host"></span><span class="el-host-prompt">&gt;:<i></i></span>';
      var h = w.firstChild; h.textContent = host; h.setAttribute('data-text', host);
      a.insertBefore(w, a.firstChild);
      a.setAttribute('title', 'hello, friend.');
      // bloc unique : lignes clés d'Eliot + journal (coût, tarif, capteurs), posé à la limite du fondu au noir
      var st = window.__skinStatus;
      if (st && !document.getElementById('el-syslog')) {
        var hdrEl = document.getElementById('header');
        if (!document.getElementById('el-fade')) {
          var fd = document.createElement('div'); fd.id = 'el-fade';
          hdrEl.insertBefore(fd, hdrEl.firstChild);
        }
        var sl = document.createElement('div');
        sl.id = 'el-syslog';
        sl.className = 'el-blk';
        var sx = document.createElement('div');
        sx.id = 'el-stats'; sx.className = 'el-blk';
        sl.title = 'Eliot · run ' + st.when + (st.headline ? ' — ' + st.headline : '');
        sx.title = sl.title;
        var v = document.createElement('div');
        v.className = 'el-gl-v el-gl-v-' + String(st.verdict_en || '').toLowerCase();
        v.textContent = '[ ' + (st.verdict_en || '?') + ' ] ' + st.when;
        sl.appendChild(v);
        (st.lines || []).forEach(function (l) {
          var d = document.createElement('div');
          d.className = 'el-gl el-gl-' + l.c;
          d.textContent = '> ' + l.t;
          sl.appendChild(d);
        });
        (st.syslog || []).forEach(function (l, i) {
          var d = document.createElement('div');
          d.className = 'l-' + l.tag + (l.warn ? ' l-warn' : '') + (i === 0 ? ' l-first' : '');
          var parts = [['ts', st.stamp + ' '], ['hn', host + ' '], ['pr', (st.proc || 'eliot') + '[' + st.pid + ']: '], ['tg', ('[' + l.tag + ']          ').slice(0, 11)], ['ms', l.msg + (l.warn ? ' [!]' : '')]];
          parts.forEach(function (x) { var sp = document.createElement('span'); sp.className = x[0]; sp.textContent = x[1]; d.appendChild(sp); });
          sx.appendChild(d);
        });
        hdrEl.appendChild(sl);
        hdrEl.appendChild(sx);
        var place2 = function () {
          var blk = a.closest('.uh-logo-block') || a;
          var ver = blk.querySelector('.uh-version') || blk;
          var right = Math.max(a.getBoundingClientRect().right, ver.getBoundingClientRect().right);
          var base = hdrEl.getBoundingClientRect();
          var left = right - base.left + 40;                       // report : à droite du logo
          sl.style.left = Math.round(left) + 'px';
          var rw = sl.getBoundingClientRect().width, sw = sx.getBoundingClientRect().width;
          var free0 = left + rw + 40, free1 = base.width - 440;    // espace libre entre le report et les boutons de droite
          var xl = Math.max(free0, Math.round((free0 + free1) / 2 - sw / 2));
          sx.style.left = xl + 'px';                               // stats : au milieu de cet espace
          document.documentElement.style.setProperty('--el-fade-x', Math.round(xl + sw - 60) + 'px');
        };
        place2(); setTimeout(place2, 600); window.addEventListener('resize', place2);
      }
    }
    brand();
    var hdr = document.getElementById('header');
    if (hdr && window.MutationObserver) new MutationObserver(brand).observe(hdr, { childList: true, subtree: true });

    // 1 quater) « Logout » déplacé dans le menu Power (plugin System Buttons)
    if (window.MutationObserver) new MutationObserver(function () {
      document.querySelectorAll('ul.dropdown-context').forEach(function (ul) {
        if (ul.querySelector('#el-logout') || !/Shutdown|Reboot/.test(ul.textContent)) return;
        var sep = document.createElement('li'); sep.className = 'divider';
        var li = document.createElement('li');
        li.innerHTML = '<a tabindex="-1" href="#" id="el-logout"><i class="fa fa-fw fa-sign-out fa-lg"></i>&nbsp;&nbsp;Logout</a>';
        li.firstChild.addEventListener('click', function (e) { e.preventDefault(); if (typeof window.LogoutButton === 'function') window.LogoutButton(); else location.href = '/logout'; });
        ul.appendChild(sep); ul.appendChild(li);
      });
    }).observe(document.body, { childList: true, subtree: true });

    // 2) signature dans le pied de page
    var footer = document.getElementById('footer');
    if (footer && !document.getElementById('el-friend')) {
      var f = document.createElement('span');
      f.id = 'el-friend';
      f.textContent = 'hello, friend.';
      var right = footer.querySelector('#copyright, .right, span:last-child');
      (right && right.parentNode ? right.parentNode : footer).insertBefore(f, right || null);
    }
    // 3 bis) bugs qui traînent, au hasard sur la page (réf. écrans CRT de Fallout : séparation des couleurs, vidéo inverse, scintillement, barre de balayage)
    (function () {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
          if (e.closest('#el-prompt, .awesomplete, [role="modal"], .sweet-alert, #el-roll')) continue;
          var cs = getComputedStyle(e);
          if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
          if (getComputedStyle(e, '::before').content !== 'none' || getComputedStyle(e, '::after').content !== 'none') continue;
          out.push(e);
        }
        return out;
      }
      function shift(el, n) {
        el.setAttribute('data-el', el.textContent);
        el.style.setProperty('--el-n', n);
        el.classList.add('el-bug');
        setTimeout(function () { el.classList.remove('el-bug'); el.removeAttribute('data-el'); el.style.removeProperty('--el-n'); }, n * 700 + 80);
      }
      function invert(el) {
        var old = el.getAttribute('style'), k = 0;
        var restore = function () { if (old === null) el.removeAttribute('style'); else el.setAttribute('style', old); };
        (function tick() {
          if (k >= 6) { restore(); return; }
          if (k % 2 === 0) { el.style.setProperty('background', '#ff1e3c', 'important'); el.style.setProperty('color', '#000', 'important'); }
          else restore();
          k++; setTimeout(tick, 110);
        })();
      }
      function flicker() { html.classList.add('el-flicker'); setTimeout(function () { html.classList.remove('el-flicker'); }, 700); }
      function roll() {
        if (document.getElementById('el-roll')) return;
        var d = document.createElement('div'); d.id = 'el-roll'; document.body.appendChild(d);
        setTimeout(function () { d.remove(); }, 4800);
      }
      function fire() {
        var r = Math.random();
        if (r < .08) return flicker();
        if (r < .14) return roll();
        var list = leafs();
        if (!list.length) return;
        var el = list[Math.floor(Math.random() * list.length)];
        if (r < .36) return invert(el);
        shift(el, Math.random() < .25 ? 4 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2));
      }
      function busy() {
        var a = document.activeElement, m = document.querySelector('[role="modal"]');
        return document.hidden || (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) || (m && m.offsetParent !== null);
      }
      function loop() {
        if (!busy()) {
          try { fire(); } catch (e) {}
          // de temps à autre (≈ 1 fois sur 4), un deuxième bug apparaît presque en même temps
          if (Math.random() < .25) setTimeout(function () { if (!busy()) { try { fire(); } catch (e) {} } }, 150 + Math.random() * 600);
        }
        setTimeout(loop, 2000 + Math.random() * 3000);
      }
      window.__skinBug = { shift: shift, invert: invert, flicker: flicker, roll: roll, leafs: leafs, fire: fire };
      setTimeout(loop, 3000);
    })();

    // 3) tremblement d'écran : 0,5 à 1 s, toutes les 15 à 40 s, jamais pendant la saisie
    function glitch() {
      var a = document.activeElement;
      if (!document.hidden && !(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) {
        var d = 500 + Math.random() * 500;
        html.style.setProperty('--el-shake-d', Math.round(d) + 'ms');
        html.classList.add('el-glitching');
        setTimeout(function () { html.classList.remove('el-glitching'); }, d + 40);
      }
      setTimeout(glitch, 15000 + Math.random() * 25000);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(glitch, 5000);
    // 4) clin d'œil dans la console
    try { console.log('%chello, friend.', 'color:#ff1e3c;font:700 16px monospace;text-shadow:2px 0 #5ee7ff'); } catch (e) {}
  });
})();
