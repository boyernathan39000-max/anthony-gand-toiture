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
