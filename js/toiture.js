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

/* Carrousel des prestations : flèches, onglets, glisser au doigt (défilement
   natif avec aimantation) et ancres du pied de page (#gouttieres…). */
(function () {
  'use strict';
  var bloc = document.getElementById('carrousel-prestations');
  if (!bloc) return;
  var piste = bloc.querySelector('.carrousel__piste');
  var fiches = Array.prototype.slice.call(piste.children);
  var onglets = bloc.querySelectorAll('.carrousel__onglet');
  var prec = bloc.querySelector('[data-carrousel="prec"]');
  var suiv = bloc.querySelector('[data-carrousel="suiv"]');

  var courant = function () {
    var meilleur = 0;
    fiches.forEach(function (f, k) {
      if (Math.abs(f.offsetLeft - piste.offsetLeft - piste.scrollLeft) <
          Math.abs(fiches[meilleur].offsetLeft - piste.offsetLeft - piste.scrollLeft)) meilleur = k;
    });
    return meilleur;
  };
  var aller = function (i, instantane) {
    i = Math.max(0, Math.min(fiches.length - 1, i));
    piste.scrollTo({ left: fiches[i].offsetLeft - piste.offsetLeft, behavior: instantane ? 'instant' : 'smooth' });
  };
  var maj = function () {
    var i = courant();
    onglets.forEach(function (o, k) { o.setAttribute('aria-current', String(k === i)); });
    prec.disabled = i <= 0;
    suiv.disabled = i >= fiches.length - 1;
  };

  prec.addEventListener('click', function () { aller(courant() - 1); });
  suiv.addEventListener('click', function () { aller(courant() + 1); });
  onglets.forEach(function (o) { o.addEventListener('click', function () { aller(Number(o.dataset.cible)); }); });
  piste.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); aller(courant() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); aller(courant() - 1); }
  });
  var t;
  piste.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(maj, 60); }, { passive: true });
  window.addEventListener('resize', function () { aller(courant(), true); });

  var depuisAncre = function () {
    var k = fiches.findIndex(function (f) { return '#' + f.id === location.hash; });
    if (k < 0) return;
    bloc.scrollIntoView({ block: 'start', behavior: 'instant' });
    aller(k, true);
    maj();
  };
  window.addEventListener('hashchange', depuisAncre);
  depuisAncre();
  maj();
})();
