/* =========================================================
   Serrurier Toulouse Amidonniers — interactions
   ========================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Smooth scroll inertiel (Lenis) */
  var lenis = null;
  if (window.Lenis && !reduce) {
    try {
      lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
      var rafLoop = function (t) { lenis.raf(t); requestAnimationFrame(rafLoop); };
      requestAnimationFrame(rafLoop);
    } catch (e) { lenis = null; }
  }

  /* Liens d'ancre fluides */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Préchargeur + révélation du hero */
  var preloader = document.getElementById('preloader');
  function revealHero() { document.body.classList.add('is-loaded'); }
  function dismissPreloader() {
    if (preloader && !preloader.classList.contains('done')) {
      preloader.classList.add('done');
      setTimeout(function () { if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 950);
    }
    if (lenis) lenis.start();
    revealHero();
  }
  if (reduce || !preloader) {
    if (preloader) preloader.style.display = 'none';
    revealHero();
  } else {
    if (lenis) lenis.stop();
    var plStart = (window.performance && performance.now) ? performance.now() : 0;
    var MIN_PL = 1200;
    window.addEventListener('load', function () {
      var now = (window.performance && performance.now) ? performance.now() : plStart + MIN_PL;
      setTimeout(dismissPreloader, Math.max(0, MIN_PL - (now - plStart)));
    });
    setTimeout(dismissPreloader, 3500); // sécurité anti-blocage
  }

  /* Reveal au scroll */
  var reveal = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('in'); });
  }

  /* Header collé + retour haut */
  var hdr = document.getElementById('hdr');
  var totop = document.getElementById('totop');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (hdr) hdr.classList.toggle('scrolled', y > 8);
    if (totop) totop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (totop) totop.addEventListener('click', function () {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* Menu mobile */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
  }

  /* Formulaire devis -> mailto */
  var form = document.getElementById('devis-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = function (n) { return (form[n] && form[n].value || '').trim(); };
      var subject = 'Demande de devis — ' + (v('name') || 'site web');
      var body = 'Nom : ' + v('name') + '\n'
        + 'Téléphone : ' + v('phone') + '\n'
        + 'Quartier / code postal : ' + v('zone') + '\n\n'
        + 'Besoin :\n' + v('message') + '\n';
      window.location.href = 'mailto:serruriertoulouseamidonniers@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
    });
  }

  /* Carte hero — inclinaison 3D + reflet qui suit le curseur */
  (function () {
    var card = document.querySelector('.hero-card');
    if (!card || reduce) return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var MAX = 9, raf = null;
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var rx = (0.5 - py) * MAX, ry = (px - 0.5) * MAX;
        card.style.transition = 'none';
        card.style.transform = 'perspective(950px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-6px)';
        card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
    });
    card.addEventListener('pointerleave', function () {
      card.style.transition = 'transform .6s cubic-bezier(.19,1,.22,1)';
      card.style.transform = 'perspective(950px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  })();

  /* Clé 3D dans le hero (Three.js) */
  (function () {
    if (reduce) return;
    if (!window.matchMedia('(min-width:1000px)').matches) return;
    var canvas = document.getElementById('key3d');
    var THREE = window.THREE;
    if (!canvas || !THREE) return;
    var hero = canvas.parentElement, renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    function dims() { return { w: hero.clientWidth, h: hero.clientHeight }; }
    var d = dims();
    renderer.setSize(d.w, d.h, false);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, d.w / d.h, 0.1, 100);
    camera.position.set(0, 0, 9);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x40685a, 0.85));
    var dl = new THREE.DirectionalLight(0xffffff, 1.05); dl.position.set(5, 8, 6); scene.add(dl);
    var gl = new THREE.DirectionalLight(0x86bfaa, 0.55); gl.position.set(-6, -3, 2); scene.add(gl);
    var pl = new THREE.PointLight(0xffffff, 0.5); pl.position.set(-2, 3, 6); scene.add(pl);

    var mat = new THREE.MeshStandardMaterial({ color: 0x8fc6b0, metalness: 0.62, roughness: 0.28 });

    var keyG = new THREE.Group();
    var bow = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.24, 28, 80), mat); keyG.add(bow);
    var collar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.45, 28), mat);
    collar.rotation.z = Math.PI / 2; collar.position.x = 1.2; keyG.add(collar);
    var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 3.1, 28), mat);
    shaft.rotation.z = Math.PI / 2; shaft.position.x = 2.95; keyG.add(shaft);
    function tooth(x, h) { var t = new THREE.Mesh(new THREE.BoxGeometry(0.2, h, 0.4), mat); t.position.set(x, -0.3 - (h - 0.5) / 2, 0); keyG.add(t); }
    tooth(3.85, 0.55); tooth(4.15, 0.36); tooth(4.42, 0.5);
    keyG.rotation.z = -0.42;

    var box = new THREE.Box3().setFromObject(keyG);
    var ctr = box.getCenter(new THREE.Vector3());
    keyG.position.sub(ctr);
    var pivot = new THREE.Group();
    pivot.add(keyG);
    pivot.scale.setScalar(0.98);
    pivot.position.set(1.5, -0.1, 0);
    scene.add(pivot);

    var mx = 0, my = 0, tx = 0.28, ty = -0.2, visible = true;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    }
    window.addEventListener('resize', function () {
      var d = dims(); renderer.setSize(d.w, d.h, false); camera.aspect = d.w / d.h; camera.updateProjectionMatrix();
    });

    var started = false;
    function animate(t) {
      requestAnimationFrame(animate);
      if (!visible) return;
      tx += ((0.28 - my * 0.5) - tx) * 0.05;
      ty += ((mx * 0.9) - ty) * 0.05;
      pivot.rotation.x = tx;
      pivot.rotation.y = ty + t * 0.00016;
      renderer.render(scene, camera);
      if (!started) { started = true; canvas.classList.add('ready'); }
    }
    requestAnimationFrame(animate);
  })();

  /* Curseur personnalisé */
  (function () {
    if (reduce || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    var label = ring.querySelector('.cursor-label');
    document.documentElement.classList.add('has-cursor');
    dot.style.opacity = ring.style.opacity = '0';
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, shown = false;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      if (!shown) { shown = true; dot.style.opacity = ring.style.opacity = '1'; }
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,summary,.hero-card,[data-magnetic],input,textarea').forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        ring.classList.add('hover');
        var t = el.getAttribute('data-cursor');
        if (t) { ring.classList.add('label'); if (label) label.textContent = t; }
      });
      el.addEventListener('pointerleave', function () {
        ring.classList.remove('hover', 'label'); if (label) label.textContent = '';
      });
    });
    document.addEventListener('mouseleave', function () { dot.style.opacity = ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { dot.style.opacity = ring.style.opacity = '1'; });
  })();

  /* Boutons magnétiques */
  (function () {
    if (reduce || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var STR = 0.3, MAXP = 14;
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var raf = null;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = Math.max(-MAXP, Math.min(MAXP, (e.clientX - (r.left + r.width / 2)) * STR));
        var y = Math.max(-MAXP, Math.min(MAXP, (e.clientY - (r.top + r.height / 2)) * STR));
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transition = 'none';
          el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
        });
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform .4s cubic-bezier(.19,1,.22,1)';
        el.style.transform = '';
      });
    });
  })();

  /* Titres révélés mot par mot */
  (function () {
    if (reduce) return;
    var heads = document.querySelectorAll('.sec-title, .velo-title, .conf-title, .contact-title');
    function wrapText(text, into) {
      text.split(/( )/).forEach(function (tok) {
        if (tok === ' ') { into.appendChild(document.createTextNode(' ')); }
        else if (tok !== '') { var s = document.createElement('span'); s.className = 'wi'; s.textContent = tok; into.appendChild(s); }
      });
    }
    heads.forEach(function (h) {
      var frag = document.createDocumentFragment();
      Array.prototype.forEach.call(h.childNodes, function (node) {
        if (node.nodeType === 3) { wrapText(node.textContent, frag); }
        else if (node.nodeName === 'BR') { frag.appendChild(document.createElement('br')); }
        else { var c = node.cloneNode(false); wrapText(node.textContent, c); frag.appendChild(c); }
      });
      h.innerHTML = '';
      h.appendChild(frag);
      h.classList.add('words');
      h.removeAttribute('data-reveal');
      h.querySelectorAll('.wi').forEach(function (w, i) { w.style.transitionDelay = (i * 0.05).toFixed(2) + 's'; });
    });
  })();

  /* Vélo : tracé au scroll */
  (function () {
    var bike = document.querySelector('.bike');
    if (!bike) return;
    if (reduce) { bike.classList.add('draw'); return; }
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { bike.classList.add('draw'); o.unobserve(e.target); } });
      }, { threshold: 0.3 });
      o.observe(bike);
    } else { bike.classList.add('draw'); }
  })();

  /* Tilt léger sur les lignes de tarifs */
  (function () {
    if (reduce || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    document.querySelectorAll('.tarifs .tr').forEach(function (el) {
      var raf = null;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var rx = (0.5 - py) * 5, ry = (px - 0.5) * 5;
          el.style.transition = 'none';
          el.style.transform = 'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(6px)';
        });
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform .45s cubic-bezier(.19,1,.22,1)';
        el.style.transform = '';
      });
    });
  })();

  /* Carte des zones — allumage + interaction */
  (function () {
    var map = document.getElementById('zoneMap');
    if (!map) return;
    if (reduce || !('IntersectionObserver' in window)) {
      map.classList.add('lit');
    } else {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { map.classList.add('lit'); o.unobserve(e.target); } });
      }, { threshold: 0.25 });
      o.observe(map);
    }
    var detail = document.getElementById('zoneDetail');
    var cpEl = detail ? detail.querySelector('.zone-detail-cp') : null;
    var qEl = detail ? detail.querySelector('.zone-detail-q') : null;
    var nodes = map.querySelectorAll('.znode');
    function activate(n) {
      nodes.forEach(function (x) { x.classList.remove('active'); });
      n.classList.add('active');
      if (cpEl) cpEl.textContent = n.getAttribute('data-cp');
      if (qEl) qEl.textContent = n.getAttribute('data-q');
    }
    nodes.forEach(function (n) {
      n.addEventListener('pointerenter', function () { activate(n); });
      n.addEventListener('click', function () { activate(n); });
      n.addEventListener('focus', function () { activate(n); });
    });
  })();

  /* Compteurs chiffrés (hero) */
  (function () {
    if (reduce) return;
    var nums = document.querySelectorAll('.hero-meta b');
    if (!nums.length) return;
    function run(el) {
      var m = el.textContent.trim().match(/^(\d+)([\s\S]*)$/);
      if (!m) return;
      var target = parseInt(m[1], 10), suffix = m[2], t0 = null, dur = 1100;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { run(e.target); o.unobserve(e.target); } });
      }, { threshold: 0.6 });
      nums.forEach(function (n) { o.observe(n); });
    } else { nums.forEach(run); }
  })();

  /* Estimateur de prix interactif */
  (function () {
    var root = document.getElementById('est');
    if (!root) return;
    var FLOW = {
      besoin: { q: 'Quel est votre besoin ?', opts: [
        { label: 'Ouverture de porte', val: 'ouverture', next: 'ouverture2' },
        { label: 'Sécurisation', val: 'securisation', next: 'securisation2' },
        { label: 'Installation de serrure', val: 'installation', next: 'installation2' },
        { label: 'Réparation', val: 'reparation', next: 'reparation2' }
      ] },
      ouverture2: { q: 'Quelle est la situation ?', opts: [
        { label: 'Porte claquée', next: 'quand' },
        { label: 'Fermée à clé / clés perdues', next: 'quand' },
        { label: 'Serrure forcée ou bloquée', next: 'quand' }
      ] },
      securisation2: { q: 'Que souhaitez-vous ?', opts: [
        { label: 'Sécuriser après effraction', next: 'quand' },
        { label: 'Renforcer ma porte', next: 'quand' },
        { label: 'Ajouter un verrou', next: 'quand' }
      ] },
      installation2: { q: 'À installer ?', opts: [
        { label: 'Changer une serrure', next: 'quand' },
        { label: 'Une serrure multipoints', next: 'quand' },
        { label: 'Après une perte de clés', next: 'quand' }
      ] },
      reparation2: { q: 'Quel élément ?', opts: [
        { label: 'Porte / poignée', next: 'quand' },
        { label: 'Vitrage', next: 'quand' },
        { label: 'Volet roulant', next: 'quand' }
      ] },
      quand: { q: 'C’est pour quand ?', opts: [
        { label: 'Maintenant — urgence', val: 'urgence', next: 'result' },
        { label: 'Dès que possible', val: 'asap', next: 'result' },
        { label: 'Je planifie tranquillement', val: 'plan', next: 'result' }
      ] }
    };
    var TOTAL = 3, answers = {}, history = [];

    function go(key) {
      if (key === 'result') return renderResult();
      var step = FLOW[key], idx = Math.min(history.length, TOTAL - 1), prog = '';
      for (var i = 0; i < TOTAL; i++) prog += '<span class="' + (i <= idx ? 'on' : '') + '"></span>';
      var opts = step.opts.map(function (o, i) { return '<button class="est-opt" type="button" data-i="' + i + '">' + o.label + '</button>'; }).join('');
      root.innerHTML = '<div class="est-step"><div class="est-progress">' + prog + '</div>' +
        '<p class="est-q">' + step.q + '</p><div class="est-options">' + opts + '</div>' +
        (history.length ? '<div class="est-foot"><button class="est-back" type="button">Retour</button></div>' : '') + '</div>';
      root.querySelectorAll('.est-opt').forEach(function (b) {
        b.addEventListener('click', function () {
          var o = step.opts[parseInt(b.getAttribute('data-i'), 10)];
          if (o.val) answers[key] = o.val;
          history.push(key);
          go(o.next);
        });
      });
      var back = root.querySelector('.est-back');
      if (back) back.addEventListener('click', function () { go(history.pop()); });
    }

    function renderResult() {
      var ouverture = answers.besoin === 'ouverture';
      var price = ouverture ? 'À partir de 40&nbsp;€ TTC' : 'Devis gratuit';
      var sub = ouverture
        ? 'Le tarif exact dépend de votre serrure — il vous est toujours annoncé avant l’intervention. Aucune surprise.'
        : 'Quentin établit un devis clair et gratuit, annoncé avant toute intervention.';
      var lead = answers.quand === 'urgence'
        ? '⚡ Intervention en ~15 minutes, à vélo, 24h/24.'
        : 'Quentin vous rappelle vite pour convenir d’un créneau.';
      root.innerHTML = '<div class="est-result"><span class="est-tag">Votre estimation</span>' +
        '<div class="est-price">' + price + '</div><p class="est-sub">' + sub + '</p>' +
        '<p class="est-lead">' + lead + '</p>' +
        '<div class="est-cta"><a href="tel:+33669209971" class="btn btn-solid btn-lg">Appeler le 06 69 20 99 71</a>' +
        '<a href="#contact" class="btn btn-ghost btn-lg">Demander un devis</a></div>' +
        '<div class="est-foot"><button class="est-back" type="button">Recommencer</button></div></div>';
      var back = root.querySelector('.est-back');
      if (back) back.addEventListener('click', function () { answers = {}; history = []; go('besoin'); });
    }
    go('besoin');
  })();

  /* Barre d'appel mobile : retour haptique */
  (function () {
    var bar = document.querySelector('.callbar');
    if (bar && 'vibrate' in navigator) {
      bar.addEventListener('click', function () { try { navigator.vibrate(18); } catch (e) {} });
    }
  })();

  /* Année */
  var year = document.getElementById('year');
  if (year) { try { year.textContent = new Date().getFullYear(); } catch (e) {} }
})();
