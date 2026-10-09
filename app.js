/* Gold Motion — Custom Effects docs */
(function () {
  'use strict';

  /* ---------- 1. syntax highlighting (single pass, no nesting) ---------- */
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var GLSL_RE = /(\/\/[^\n]*)|(\bac[A-Z]\w*)|(\b(?:void|float|int|bool|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|ivec2|ivec3|ivec4)\b)|(\b(?:if|else|for|while|return|const|break|continue|discard|in|out|inout|uniform|attribute|varying|precision|highp|mediump|lowp|struct|true|false)\b)|(\b\d+\.?\d*(?:[eE][-+]?\d+)?\b)/g;

  function hlGLSL(code) {
    return esc(code).replace(GLSL_RE, function (m, com, uni, typ, kw, num) {
      if (com) return '<span class="tc">' + com + '</span>';
      if (uni) return '<span class="gu">' + uni + '</span>';
      if (typ) return '<span class="gt">' + typ + '</span>';
      if (kw)  return '<span class="gk">' + kw + '</span>';
      if (num) return '<span class="gn">' + num + '</span>';
      return m;
    });
  }

  var XML_RE = /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([A-Za-z_][\w.:-]*)|([A-Za-z_][\w.:-]*)(=)("[^"]*")|(\/?&gt;)/g;

  function hlXMLOnly(code) {
    return esc(code).replace(XML_RE, function (m, com, open, tag, attr, eq, val, close) {
      if (com) return '<span class="tc">' + com + '</span>';
      if (open !== undefined && tag !== undefined) {
        return '<span class="tx">' + open + '</span><span class="tt">' + tag + '</span>';
      }
      if (attr !== undefined && val !== undefined) {
        return '<span class="ta">' + attr + '</span>' + eq + '<span class="tav">' + val + '</span>';
      }
      if (close !== undefined) return '<span class="tx">' + close + '</span>';
      return m;
    });
  }

  function hlXML(code) {
    return code.split(/(<!\[CDATA\[[\s\S]*?\]\]>)/g).map(function (p) {
      if (p.indexOf('<![CDATA[') === 0) {
        return '<span class="tx">&lt;![CDATA[</span>' + hlGLSL(p.slice(9, -3)) + '<span class="tx">]]&gt;</span>';
      }
      return hlXMLOnly(p);
    }).join('');
  }

  var HL = { xml: hlXML, glsl: hlGLSL, text: function (c) { return esc(c); } };

  document.querySelectorAll('pre code[data-lang]').forEach(function (el) {
    var raw = el.textContent;
    var fn = HL[el.getAttribute('data-lang')];
    if (fn) el.innerHTML = fn(raw);
    el.dataset.raw = raw;
  });

  /* ---------- 2. copy buttons ---------- */
  document.querySelectorAll('.cb-c').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.closest('.cb').querySelector('pre code');
      var text = code.dataset.raw || code.textContent;
      function done() {
        btn.textContent = 'copied';
        btn.classList.add('ok');
        setTimeout(function () { btn.textContent = 'copy'; btn.classList.remove('ok'); }, 1500);
      }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { btn.textContent = 'ctrl+c'; }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
    });
  });

  /* ---------- 3. contents drawer ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('scrim');
  var drawerClose = document.getElementById('drawerClose');

  function setDrawer(open) {
    if (!drawer || !menuBtn) return;
    drawer.classList.toggle('open', open);
    if (scrim) scrim.classList.toggle('show', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('drawer-open', open);
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('open'));
    });
  }
  if (scrim) {
    scrim.addEventListener('click', function () { setDrawer(false); });
  }
  if (drawerClose) {
    drawerClose.addEventListener('click', function () { setDrawer(false); });
  }
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
  }
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && drawer && drawer.classList.contains('open')) setDrawer(false);
  });

  /* ---------- 4. effects library ---------- */
  var data = window.GM_EFFECTS || [];
  var grid = document.getElementById('fxgrid');
  var chips = document.getElementById('chips');
  var search = document.getElementById('search');
  var empty = document.getElementById('fxempty');

  var CATS = {
    color:      'Colour & Grade',
    blur:       'Blur & Focus',
    distort:    'Distort & Warp',
    glitch:     'Glitch & Digital',
    lighting:   'Light & Glow',
    stylize:    'Stylize & Art',
    procedural: 'Procedural',
    other:      'Retro & Analog',
    '3d':       '3D & Depth'
  };
  var ORDER = ['color', 'blur', 'distort', 'glitch', 'lighting', 'stylize', 'procedural', 'other', '3d'];

  if (grid && data.length) {
    var counts = {};
    data.forEach(function (e) { counts[e.cat] = (counts[e.cat] || 0) + 1; });

    var all = document.createElement('button');
    all.className = 'chip on';
    all.innerHTML = 'All<i>' + data.length + '</i>';
    all.dataset.cat = '*';
    chips.appendChild(all);

    ORDER.forEach(function (c) {
      if (!counts[c]) return;
      var b = document.createElement('button');
      b.className = 'chip';
      b.innerHTML = CATS[c] + '<i>' + counts[c] + '</i>';
      b.dataset.cat = c;
      chips.appendChild(b);
    });

    var state = { cat: '*', q: '' };

    function isPro(e) {
      return (' ' + (e.tags || '') + ' ').indexOf(' pro ') > -1;
    }

    function render() {
      var q = state.q.toLowerCase();
      var out = data.filter(function (e) {
        if (state.cat !== '*' && e.cat !== state.cat) return false;
        if (!q) return true;
        return (e.name + ' ' + e.desc + ' ' + e.tags + ' ' + e.slug).toLowerCase().indexOf(q) > -1;
      });
      out.sort(function (a, b) {
        return (isPro(b) ? 1 : 0) - (isPro(a) ? 1 : 0);
      });
      grid.innerHTML = out.map(function (e) {
        var pro = isPro(e);
        return '<article class="fx' + (pro ? ' pro' : '') + '">' +
          '<span class="n">' + e.name + '</span>' +
          '<span class="d">' + e.desc + '</span>' +
          '<span class="m">' +
            '<span class="tag">' + (pro ? 'PRO · ' : '') + CATS[e.cat] + '</span>' +
            '<a class="dl" href="effects/' + e.slug + '.xml" download>xml &darr;</a>' +
          '</span>' +
        '</article>';
      }).join('');
      empty.style.display = out.length ? 'none' : 'block';
    }

    chips.addEventListener('click', function (ev) {
      var b = ev.target.closest('.chip');
      if (!b) return;
      chips.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
      b.classList.add('on');
      state.cat = b.dataset.cat;
      render();
    });

    search.addEventListener('input', function () {
      state.q = search.value.trim();
      render();
    });

    render();
  }

})();
