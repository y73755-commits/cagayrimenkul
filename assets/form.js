/* İletişim ve mülk değerlendirme formları → WhatsApp mesajı.
 * Bilgiler sunucuya gönderilmez; ziyaretçi WhatsApp'ta "Gönder"e bastığında bize ulaşır.
 * Ölçüm (assets/olcum.js):
 *   - her "WhatsApp’ta mesajı hazırla" tıklaması  → form_submit_attempt (valid: true/false, geçersizse error_field)
 *   - yalnızca alanlar geçerliyse          → whatsapp_message_prepared (aynı mesaj oturumda bir kez)
 * Bu olaylar mesajın GÖNDERİLDİĞİ anlamına gelmez; gönderim WhatsApp'ta ziyaretçinin elindedir.
 * Olaylara ad, telefon, e-posta veya mesaj içeriği eklenmez. */
(function () {
  'use strict';
  var WA = '905425573048';
  var TEL_HTML = '<a href="tel:+905425573048">0542 557 30 48</a>';
  var FORMLAR = {
    'iletisim-form': {
      ad: 'iletisim',
      mesaj: function (v) {
        return ['Merhaba, iletişim formu üzerinden yazıyorum:',
          'Ad Soyad: ' + v('ad'), 'Telefon: ' + v('telefon'), 'E-posta: ' + (v('email') || '-'),
          'İlgi Alanı: ' + (v('ilgi') || '-'), 'Mesaj: ' + v('mesaj')].join('\n');
      }
    },
    'degerlendir-form': {
      ad: 'mulk_degerlendirme',
      mesaj: function (v) {
        return ['Merhaba, mülk değerlendirme talebim:',
          'Ad Soyad: ' + v('ad'), 'Telefon: ' + v('telefon'), 'İşlem Tipi: ' + v('islem'), 'Mülk Tipi: ' + v('mulktipi'),
          'Bölge/Adres: ' + v('adres'), 'Metrekare: ' + (v('m2') || '-'), 'Kat: ' + (v('kat') || '-'),
          'Tapu Durumu: ' + (v('tapu') || '-'), 'Kullanım Durumu: ' + (v('kullanim') || '-'), 'Açıklama: ' + (v('aciklama') || '-')].join('\n');
      }
    }
  };

  // iletişim sayfası: anasayfa arama kutusundan gelen tercihleri forma aktar
  (function onDoldur() {
    var ilgi = document.getElementById('ilgi'), mesaj = document.getElementById('mesaj');
    if (!ilgi || !mesaj || !document.getElementById('iletisim-form')) return;
    var q = new URLSearchParams(location.search);
    var islem = q.get('islem'), kategori = q.get('kategori'), bolge = q.get('bolge');
    var map = { satilik: 'Satılık', kiralik: 'Kiralık' };
    if (islem && map[islem]) ilgi.value = map[islem];
    var parca = [];
    if (kategori) parca.push('Kategori: ' + kategori.slice(0, 40));
    if (bolge) parca.push('Bölge: ' + bolge.slice(0, 40));
    if (parca.length && !mesaj.value) mesaj.value = 'Arama tercihlerim -> ' + parca.join(', ');
  })();

  Object.keys(FORMLAR).forEach(function (id) {
    var form = document.getElementById(id);
    var btn = document.getElementById('btn-whatsapp');
    if (!form || !btn) return;
    var ayar = FORMLAR[id];
    var statusEl = document.getElementById('form-status');
    var olcum = function () { return window.olcum; };
    function durum(html) { if (statusEl) { statusEl.innerHTML = html; statusEl.hidden = false; } }
    function v(alan) { var el = document.getElementById(alan); return el ? el.value.trim() : ''; }

    btn.addEventListener('click', function () {
      if (!form.checkValidity()) {
        var hatali = form.querySelector('input:invalid, select:invalid, textarea:invalid');
        if (olcum()) olcum().formDenemesi(ayar.ad, false, hatali ? hatali.name : '');
        form.reportValidity();
        return;
      }
      var phoneEl = document.getElementById('telefon');
      var digits = phoneEl.value.replace(/\D/g, '');
      if (!/^05\d{9}$/.test(digits)) {
        if (olcum()) olcum().formDenemesi(ayar.ad, false, 'telefon');
        durum('Lütfen geçerli bir cep telefonu numarası girin (örnek: 0542 557 30 48).');
        phoneEl.focus();
        return;
      }
      if (btn.disabled) return;
      if (olcum()) olcum().formDenemesi(ayar.ad, true);
      var metin = ayar.mesaj(v);
      var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(metin);
      var link = '<a href="' + url + '" target="_blank" rel="noopener" data-loc="form_fallback">';
      var w = null;
      try { w = window.open(url, '_blank'); } catch (e) { w = null; }
      if (w) {
        try { w.opener = null; } catch (e) {}
        durum('Mesajınız WhatsApp\'ta hazırlandı. <strong>Son adım:</strong> açılan WhatsApp ekranında <strong>Gönder</strong> tuşuna basmanız gerekir; siz göndermeden mesaj bize ulaşmaz. ' +
          'WhatsApp açılmadıysa ' + link + 'buradan açın</a> veya ' + TEL_HTML + ' numarasını arayın.');
      } else {
        durum('WhatsApp penceresi otomatik açılamadı (tarayıcınız engellemiş olabilir). Mesajınız hazır: ' +
          link.replace('<a ', '<a class="btn btn-gold btn-sm" style="margin:8px 0;" ') + 'WhatsApp\'ta mesajı aç</a> ' +
          'bağlantısına dokunun, ardından açılan ekranda <strong>Gönder</strong> tuşuna basın. Dilerseniz ' + TEL_HTML + ' numarasını arayabilirsiniz.');
      }
      if (olcum()) olcum().whatsappHazirlandi(ayar.ad, metin);
      btn.disabled = true;
      setTimeout(function () { btn.disabled = false; }, 4000);
    });
  });
})();
