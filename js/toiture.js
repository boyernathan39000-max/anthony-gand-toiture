/* toiture.js — à la souris, la poignée des comparateurs avant/après suit le
   curseur sans qu'il faille cliquer ; au doigt et au clavier, le glisser de
   js/main.js reste la règle. */
(function () {
  'use strict';
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.comparateur .avant-apres').forEach(function (bloc) {
    var apres = bloc.querySelector('.avant-apres__couche--apres');
    var poignee = bloc.querySelector('.avant-apres__poignee');
    var bouton = bloc.querySelector('.avant-apres__bouton');
    bloc.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = bloc.getBoundingClientRect();
      var pct = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      apres.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      poignee.style.insetInlineStart = pct + '%';
      bouton.setAttribute('aria-valuenow', Math.round(pct));
    });
  });
})();

/* Carrousel des prestations — même mécanique que « Nos dernières
   réalisations » d'obt-agency.fr : trois copies de la série, départ sur la
   copie du milieu, recalage invisible d'une longueur de série en fin de
   transition. Boucle infinie dans les deux sens. En plus : les onglets 01–04,
   le glisser au doigt, un clic sur une voisine et les ancres (#gouttieres…). */
(function () {
  'use strict';
  var root = document.getElementById('carrousel-prestations');
  if (!root) return;
  var track = root.querySelector('[data-carousel-track]');
  var viewport = root.querySelector('.carrousel__fenetre');
  var originals = Array.prototype.slice.call(track.querySelectorAll('[data-carousel-slide]'));
  var onglets = root.querySelectorAll('.carrousel__onglet');
  var count = originals.length;
  var ids = originals.map(function (li) { var a = li.querySelector('[id]'); return a ? a.id : ''; });

  var copie = function () {
    var frag = document.createDocumentFragment();
    originals.forEach(function (node) {
      var c = node.cloneNode(true);
      c.setAttribute('data-carousel-clone', '');
      c.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
      frag.appendChild(c);
    });
    return frag;
  };
  track.insertBefore(copie(), track.firstChild);
  track.appendChild(copie());

  var slides = Array.prototype.slice.call(track.querySelectorAll('[data-carousel-slide]'));
  var index = count;
  var anime = false;

  function place(avecTransition) {
    var active = slides[index];
    viewport.scrollLeft = 0;   /* un saut d'ancre peut avoir fait défiler la fenêtre */
    track.style.transition = avecTransition ? '' : 'none';
    var offset = active.offsetLeft - (viewport.clientWidth - active.offsetWidth) / 2;
    track.style.transform = 'translateX(' + (-offset) + 'px)';
    /* La fenêtre prend la hauteur de la fiche active : pas de vide sous une
       fiche courte quand sa voisine est plus haute. */
    viewport.style.height = (active.offsetHeight + 32) + 'px';
    if (!avecTransition) { void track.offsetWidth; track.style.transition = ''; }
    slides.forEach(function (sl, i) {
      var actif = i === index;
      sl.setAttribute('aria-hidden', actif ? 'false' : 'true');
      sl.classList.toggle('est-voisine', i === index - 1 || i === index + 1);
      sl.querySelectorAll('a, button').forEach(function (el) { el.tabIndex = actif ? 0 : -1; });
    });
    var k = index % count;
    onglets.forEach(function (o, j) { o.setAttribute('aria-current', String(j === k)); });
  }
  function normaliser() {
    var avant = index;
    while (index < count) index += count;
    while (index >= count * 2) index -= count;
    if (index !== avant) place(false);
    anime = false;
  }
  var garde;
  function aller(pas) {
    var suivant = index + pas;
    if (suivant < 0 || suivant >= count * 3) return;
    anime = true;
    index = suivant;
    place(true);
    clearTimeout(garde);
    garde = setTimeout(function () { if (anime) normaliser(); }, 1000);
  }
  function versFiche(k) {
    var pas = k - (index % count);
    if (pas > count / 2) pas -= count;
    if (pas < -count / 2) pas += count;
    if (pas) aller(pas);
  }

  track.addEventListener('transitionend', function (e) {
    if (e.propertyName === 'transform' && e.target === track) normaliser();
  });
  root.querySelector('[data-carousel-prev]').addEventListener('click', function () { aller(-1); });
  root.querySelector('[data-carousel-next]').addEventListener('click', function () { aller(1); });
  onglets.forEach(function (o) { o.addEventListener('click', function () { versFiche(Number(o.dataset.cible)); }); });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') aller(-1);
    else if (e.key === 'ArrowRight') aller(1);
  });
  /* Un clic sur une fiche voisine l'amène au centre. */
  slides.forEach(function (sl, i) {
    sl.addEventListener('click', function (e) {
      if (i === index) return;
      e.preventDefault();
      aller(i - index);
    });
  });
  /* Glisser au doigt : un geste horizontal de plus de 40 px change de fiche. */
  var x0 = null, y0 = null;
  viewport.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  viewport.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) aller(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });

  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { place(false); }, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(false); });

  function depuisAncre() {
    var k = ids.indexOf(location.hash.slice(1));
    if (k < 0) return;
    index = count + k;
    place(false);
    root.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  window.addEventListener('hashchange', depuisAncre);
  place(false);
  depuisAncre();
})();
