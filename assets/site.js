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

/* Telefon/WhatsApp tıklama ölçümü ve çerez izni: assets/olcum.js */

/* altbilgi yılı */
(function () { var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear(); })();

/* anasayfa arama kutusu → iletişim formu (tercihler forma aktarılır) */
(function () {
  var f = document.querySelector('form.search-widget');
  if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var g = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
    var q = new URLSearchParams({ islem: g('sw-islem'), kategori: g('sw-kategori'), bolge: g('sw-bolge') });
    window.location.href = 'iletisim.html?' + q.toString();
  });
})();
