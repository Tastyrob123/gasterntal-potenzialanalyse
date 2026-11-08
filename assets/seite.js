/* Potenzialanalyse Berghotel Gasterntal · Wegleiste, Zeilen, Auftritte, Varianten, Karussell, Zahlen */
(function () {
  var d = document, w = window;
  var ruhig = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in w)) d.documentElement.classList.add('ohne-js');

  /* Überschriften: Wörter nach dem echten Umbruch in Zeilen legen */
  function zeilen(h) {
    var text = h.getAttribute('data-t') || h.textContent.trim();
    h.setAttribute('data-t', text); h.setAttribute('aria-label', text);
    var woerter = text.split(/\s+/);
    h.innerHTML = woerter.map(function (x) { return '<span class="w">' + x.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>'; }).join(' ');
    var reihen = [], oben = null;
    [].forEach.call(h.querySelectorAll('.w'), function (s) {
      var t = s.offsetTop; if (oben === null || Math.abs(t - oben) > 4) { reihen.push([]); oben = t; }
      reihen[reihen.length - 1].push(s.textContent);
    });
    h.innerHTML = reihen.map(function (r) { return '<span class="z" aria-hidden="true"><span>' + r.join(' ') + '</span></span>'; }).join('');
  }
  var zl = [].slice.call(d.querySelectorAll('.zl'));
  function alleZeilen() { zl.forEach(zeilen); }
  alleZeilen();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(alleZeilen);
  var breite = w.innerWidth;
  w.addEventListener('resize', function () { if (Math.abs(w.innerWidth - breite) > 40) { breite = w.innerWidth; alleZeilen(); } });

  /* Auftritte: .da sobald im Bild (Zeilen, Zoom, Rückfall ohne Scroll-Zeitachse) */
  /* Robert 18.10.2026 18:17: los, wenn rund ein Fünftel im Bild ist (bei sehr hohen ein Fünftel des Fensters); oben weit offen, wer springt, überspringt nichts */
  var fuenftel = function (e) { return e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= w.innerHeight * 0.2); }, FUENFTEL = { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] };
  var ziele = [].slice.call(d.querySelectorAll('.zl, [data-z], .rahmen, .auftakt'));
  if ('IntersectionObserver' in w && !ruhig) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (fuenftel(e)) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, FUENFTEL);
    ziele.forEach(function (el) { io.observe(el); });
  } else ziele.forEach(function (el) { el.classList.add('da'); });

  /* Grosse Zahlen zählen hoch (nur einmal) */
  var zahlen = [].slice.call(d.querySelectorAll('[data-zahl]'));
  if ('IntersectionObserver' in w && !ruhig) {
    var zo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || e.intersectionRatio < 0.6) return; zo.unobserve(e.target);
        var el = e.target, ziel = +el.getAttribute('data-zahl'); if (ziel < 4) return;
        var t0 = performance.now();
        (function lauf(t) { var p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(ziel * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(lauf); })(t0);
      });
    }, { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.3, 0.6] });   /* Zahlen zählen, wenn sie gut zur Hälfte im Bild sind */
    zahlen.forEach(function (z) { if (+z.getAttribute('data-zahl') >= 4) z.textContent = '0'; zo.observe(z); });
  }

  /* Wegleiste: erscheint nach dem Auftakt, zeigt die Etappe und den Fortschritt */
  var weg = d.querySelector('.weg'), fill = d.querySelector('.weg__fill'), knopf = d.querySelector('.weg__knopf');
  var links = [].slice.call(d.querySelectorAll('.weg__liste a')), etappen = [].slice.call(d.querySelectorAll('.et'));
  var auftakt = d.querySelector('.auftakt'), mainEl = d.querySelector('main'), jetzt = -1, plan = false;
  function messen() {
    plan = false;
    var y = w.scrollY, h = w.innerHeight;
    d.body.classList.toggle('unterwegs', y > auftakt.offsetHeight * .7);
    var a = mainEl.offsetTop, b = a + mainEl.offsetHeight - h;
    fill.style.transform = 'scaleX(' + Math.max(0, Math.min(1, (y - a + h * .4) / (b - a + h * .4))).toFixed(4) + ')';
    var n = 0;
    for (var i = 0; i < etappen.length; i++) if (etappen[i].offsetTop - h * .4 <= y) n = i;
    if (n !== jetzt) {
      jetzt = n;
      links.forEach(function (l, i) { l.classList.toggle('ist', i === n); l.classList.toggle('vorbei', i < n); });
      knopf.querySelector('b').textContent = (n + 1) + ' / ' + etappen.length;
      knopf.querySelector('span').textContent = links[n].textContent;
    }
  }
  w.addEventListener('scroll', function () { if (!plan) { plan = true; requestAnimationFrame(messen); } }, { passive: true });
  w.addEventListener('resize', messen); messen();
  knopf.addEventListener('click', function () { var o = weg.classList.toggle('offen'); knopf.setAttribute('aria-expanded', o); });
  links.forEach(function (l) { l.addEventListener('click', function () { weg.classList.remove('offen'); knopf.setAttribute('aria-expanded', 'false'); }); });

  /* Zahlenreihe: Variante tauschen, Fläche bleibt gleich hoch */
  [].forEach.call(d.querySelectorAll('.zr'), function (zr) {
    var folge = zr.previousElementSibling;
    zr.addEventListener('click', function (ev) {
      var k = ev.target.closest('.zr__k'); if (!k) return;
      var v = k.getAttribute('data-v');
      [].forEach.call(zr.children, function (x) { var ja = x === k; x.classList.toggle('ist', ja); x.setAttribute('aria-selected', ja); });
      [].forEach.call(folge.children, function (x) { x.classList.toggle('ist', x.getAttribute('data-v') === v); });
      var neu = folge.querySelector('.fl__v.ist'); if (neu) neu.scrollLeft = 0;
    });
  });

  /* Karussell: endlos mit Pfeilen, Wischen nativ */
  [].forEach.call(d.querySelectorAll('.karu'), function (k) {
    var bahn = k.querySelector('.karu__bahn'), s = [].slice.call(bahn.children), fig = k.parentNode;
    var z = fig.querySelector('.karu__z'), u = fig.querySelector('.karu__u');
    function nr() { return Math.round(bahn.scrollLeft / bahn.clientWidth); }
    function zeige(i) { i = (i + s.length) % s.length; bahn.scrollTo({ left: i * bahn.clientWidth, behavior: ruhig ? 'auto' : 'smooth' }); }
    k.querySelector('.karu__p--l').addEventListener('click', function () { zeige(nr() - 1); });
    k.querySelector('.karu__p--r').addEventListener('click', function () { zeige(nr() + 1); });
    var pl = false;
    bahn.addEventListener('scroll', function () {
      if (pl) return; pl = true;
      requestAnimationFrame(function () { pl = false; var i = Math.min(s.length - 1, nr()); z.textContent = (i + 1) + ' / ' + s.length; u.textContent = s[i].getAttribute('data-u'); });
    }, { passive: true });
  });
})();
