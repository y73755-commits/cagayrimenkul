(function () {
  var btn = document.querySelector('.menu-toggle');
  var panel = document.getElementById('mobile-menu');
  if (!btn || !panel) return;
  function setOpen(open) {
    if (open) { panel.removeAttribute('hidden'); } else { panel.setAttribute('hidden', ''); }
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  }
  btn.addEventListener('click', function () { setOpen(panel.hasAttribute('hidden')); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();
