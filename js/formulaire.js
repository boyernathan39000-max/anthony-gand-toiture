/* =========================================================================
   formulaire.js — validation côté client et état de confirmation.
   Le formulaire n'envoie rien : preventDefault, puis message de succès.
   ========================================================================= */
(function () {
  'use strict';

  var form = document.getElementById('devis');
  if (!form) return;

  var regles = [
    { id: 'nom', test: function (v) { return v.trim().length >= 2; } },
    { id: 'prenom', test: function (v) { return v.trim().length >= 2; } },
    { id: 'email', test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); } },
    { id: 'message', test: function (v) { return v.trim().length >= 20; } }
  ];

  var champDe = function (id) { return document.getElementById(id).closest('.champ'); };

  var valider = function (regle, marquer) {
    var input = document.getElementById(regle.id);
    var ok = regle.test(input.value);
    if (marquer) {
      champDe(regle.id).dataset.invalide = String(!ok);
      input.setAttribute('aria-invalid', String(!ok));
    }
    return ok;
  };

  /* On ne signale une erreur qu'après une première tentative d'envoi,
     puis on la corrige en direct — pas de rouge dès la première frappe. */
  var tentative = false;

  regles.forEach(function (regle) {
    var input = document.getElementById(regle.id);
    var evenement = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(evenement, function () {
      if (tentative) valider(regle, true);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    tentative = true;

    var premierInvalide = null;
    regles.forEach(function (regle) {
      var ok = valider(regle, true);
      if (!ok && !premierInvalide) premierInvalide = document.getElementById(regle.id);
    });

    if (premierInvalide) {
      premierInvalide.focus();
      premierInvalide.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    var prenom = document.getElementById('prenom').value.trim();
    var detail = document.getElementById('succes-detail');
    detail.textContent = 'Merci' + (prenom ? ' ' + prenom : '')
      + ', nous revenons vers vous rapidement avec votre devis gratuit.';

    form.dataset.envoye = 'true';
    if (window.apparitions) window.apparitions.verifier();
    form.scrollIntoView({ block: 'center', behavior: 'smooth' });
    document.getElementById('nouvelle-demande').focus();
  });

  document.getElementById('nouvelle-demande').addEventListener('click', function () {
    form.reset();
    tentative = false;
    regles.forEach(function (regle) {
      champDe(regle.id).dataset.invalide = 'false';
      document.getElementById(regle.id).removeAttribute('aria-invalid');
    });
    form.dataset.envoye = 'false';
    document.getElementById('nom').focus();
  });
})();
