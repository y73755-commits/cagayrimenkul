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

window.dataLayer = window.dataLayer || [];
document.addEventListener('click', function(e){
  var t = e.target;
  var a = t && t.closest ? t.closest('a[href]') : null;
  if(a){
    var h = a.getAttribute('href') || '';
    if(h.indexOf('wa.me') !== -1) window.dataLayer.push({event: 'whatsapp_click', page_path: location.pathname});
    else if(h.indexOf('tel:') === 0) window.dataLayer.push({event: 'phone_click', page_path: location.pathname});
  }
  if(t && t.closest && t.closest('#btn-whatsapp')) window.dataLayer.push({event: 'form_whatsapp_submit_attempt', page_path: location.pathname});
});
