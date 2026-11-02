/*!
 * ÖLÇÜM VE ÇEREZ İZNİ — tek dosya
 * ---------------------------------------------------------------
 * Ayarlar yalnızca aşağıdaki OLCUM_AYAR nesnesinden değiştirilir.
 * - gtmId boşken: hiçbir Google etiketi yüklenmez, çerez bandı açılmaz
 *   (izin istenecek analiz/reklam çerezi olmadığı için). Olaylar yalnızca
 *   sayfa içindeki dataLayer'a yazılır, Google'a gitmez.
 * - gtmId yazıldığında: Consent Mode v2 varsayılanı "reddedildi"; ziyaretçi
 *   analiz ve reklam iznini AYRI AYRI verir. GTM yalnızca en az bir izin
 *   verildiğinde ve yalnızca canlı alan adında yüklenir.
 * - Hiçbir olaya ad, telefon, e-posta veya mesaj içeriği eklenmez.
 * - "?olcum_test=1" ile açılan cihaz ölçüm dışı bırakılır ("?olcum_test=0" geri alır).
 */
(function () {
  'use strict';
  var OLCUM_AYAR = {
    gtmId: '',                                   // örn. 'GTM-ABC1234' — boşken ölçüm kapalı
    hosts: ['cansuakgun.com', 'www.cansuakgun.com'],                          // ölçümün çalışacağı canlı alan adları
    izinAnahtari: 'olcum.izin.v1',
    politikaUrl: '/cerez-politikasi.html'                   // çerez politikası adresi (kökten)
  };

  var w = window, d = document;
  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }

  /* ---------- güvenli depolama ---------- */
  var LS = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var SS = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- iç trafik / canlı ortam ---------- */
  try {
    var q = new URLSearchParams(location.search).get('olcum_test');
    if (q === '1') LS.set('olcum.ic', 1);
    if (q === '0') LS.del('olcum.ic');
  } catch (e) {}
  var canli = OLCUM_AYAR.hosts.indexOf(location.hostname) !== -1;
  var ic = !!LS.get('olcum.ic');
  var etkin = !!OLCUM_AYAR.gtmId;

  /* ---------- Consent Mode v2 varsayılanı ---------- */
  gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    functionality_storage: 'granted', security_storage: 'granted', wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', false);

  var gtmYuklendi = false;
  function gtmYukle() {
    if (gtmYuklendi || !etkin || !canli || ic) return;
    gtmYuklendi = true;
    w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = d.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(OLCUM_AYAR.gtmId);
    d.head.appendChild(s);
  }

  function cerezSil(onekler) {
    var parca = location.hostname.split('.');
    var alanlar = ['', location.hostname, '.' + location.hostname];
    if (parca.length > 2) alanlar.push('.' + parca.slice(-2).join('.'));
    d.cookie.split(';').forEach(function (c) {
      var ad = c.split('=')[0].trim();
      if (!onekler.some(function (o) { return ad.indexOf(o) === 0; })) return;
      alanlar.forEach(function (al) {
        d.cookie = ad + '=; Max-Age=0; path=/' + (al ? '; domain=' + al : '');
      });
    });
  }

  function izinUygula(izin, kaynak) {
    izin = { analytics: !!izin.analytics, ads: !!izin.ads, v: 1, t: Date.now() };
    var onceki = LS.get(OLCUM_AYAR.izinAnahtari);
    LS.set(OLCUM_AYAR.izinAnahtari, izin);
    gtag('consent', 'update', {
      analytics_storage: izin.analytics ? 'granted' : 'denied',
      ad_storage: izin.ads ? 'granted' : 'denied',
      ad_user_data: izin.ads ? 'granted' : 'denied',
      ad_personalization: izin.ads ? 'granted' : 'denied'
    });
    // izin geri alındığında daha önce yazılmış Google çerezleri silinir
    if (onceki && onceki.analytics && !izin.analytics) cerezSil(['_ga', '_gid']);
    if (onceki && onceki.ads && !izin.ads) cerezSil(['_gcl', '_gac', 'FPGCL']);
    w.dataLayer.push({ event: 'consent_update', consent_analytics: izin.analytics, consent_ads: izin.ads, consent_source: kaynak || 'banner' });
    if (izin.analytics || izin.ads) gtmYukle();
    bantKapat();
  }

  /* ---------- olaylar (kişisel veri içermez) ---------- */
  var IZINLI = ['page_path', 'link_location', 'form_name', 'valid', 'error_field', 'method'];
  function olay(ad, p) {
    var o = { event: ad, page_path: location.pathname };
    if (p) for (var k in p) if (IZINLI.indexOf(k) !== -1 && p[k] !== undefined) o[k] = p[k];
    w.dataLayer.push(o);
  }
  function konum(el) {
    var x = el.closest('[data-loc]'); if (x) return x.getAttribute('data-loc');
    if (el.closest('header')) return 'header';
    if (el.closest('footer')) return 'footer';
    if (el.closest('.wa-float')) return 'floating';
    if (el.closest('.mobile-links, .mobile-panel, #mobile-menu')) return 'mobile_menu';
    return 'content';
  }
  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(h)) olay('whatsapp_click', { link_location: konum(a) });
    else if (h.indexOf('tel:') === 0) olay('phone_click', { link_location: konum(a) });
  }, true);

  /**
   * WhatsApp formu yardımcıları — sayfa betikleri bunları çağırır:
   *   olcum.formDenemesi('iletisim', false, 'telefon')  → her gönder tıklaması (geçersizse de)
   *   olcum.whatsappHazirlandi('iletisim', metin)       → yalnızca alanlar geçerliyse; aynı mesaj oturumda bir kez sayılır
   * "whatsapp_message_prepared" mesajın GÖNDERİLDİĞİ anlamına gelmez; gönderim WhatsApp'ta ziyaretçinin elindedir.
   */
  function ozet(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return String(h); }
  var api = {
    olay: olay,
    formDenemesi: function (form, gecerli, alan) { olay('form_submit_attempt', { form_name: form, valid: !!gecerli, error_field: gecerli ? undefined : alan }); },
    whatsappHazirlandi: function (form, metin) {
      var k = 'olcum.wa.' + form, h = ozet(metin || '');
      if (SS.get(k) === h) return false;              // aynı talep tekrar sayılmaz
      SS.set(k, h);
      olay('whatsapp_message_prepared', { form_name: form, method: 'whatsapp' });
      return true;
    },
    tercihleriAc: function () { pencereAc(); },
    durum: function () { return { gtmId: OLCUM_AYAR.gtmId, canli: canli, ic: ic, gtmYuklendi: gtmYuklendi, izin: LS.get(OLCUM_AYAR.izinAnahtari) }; }
  };
  w.olcum = api;

  /* ---------- çerez bandı ve tercih penceresi ---------- */
  var bant = null, pencere = null;
  function stil() {
    if (d.getElementById('olcum-stil')) return;
    var css = '' +
      '.olcum-bant{position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:760px;margin:0 auto;background:#fff;color:#1b1b1b;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.35);padding:14px 16px;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;gap:10px 18px;align-items:center;flex-wrap:wrap}' +
      '.olcum-bant p{margin:0;flex:1 1 320px;color:#333}.olcum-bant a{color:#1b1b1b;text-decoration:underline}' +
      '.olcum-btns{display:flex;gap:8px;flex:0 0 auto;flex-wrap:wrap}' +
      '.olcum-btn{font:600 14px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;min-height:42px;padding:0 14px;border-radius:8px;border:1px solid #1b1b1b;background:#fff;color:#1b1b1b;cursor:pointer}' +
      '.olcum-btn--ana{background:#1b1b1b;color:#fff}.olcum-btn:focus-visible{outline:3px solid #c9a46a;outline-offset:2px}' +
      '.olcum-pencere{border:0;border-radius:12px;padding:0;max-width:min(520px,calc(100vw - 24px));width:100%;color:#1b1b1b;font:14px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
      '.olcum-pencere::backdrop{background:rgba(0,0,0,.55)}.olcum-pencere form{padding:20px;display:grid;gap:12px}' +
      '.olcum-pencere h2{margin:0;font-size:18px}.olcum-sec{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px solid #e5e1d8}' +
      '.olcum-sec input{width:20px;height:20px;margin-top:2px;flex:none}.olcum-sec b{display:block}.olcum-sec span{color:#555;font-size:13px}' +
      '@media (max-width:560px){.olcum-bant{left:8px;right:8px;bottom:8px;padding:12px;font-size:13px}.olcum-btns{width:100%}.olcum-btn{flex:1 1 0;padding:0 8px}}';
    var s = d.createElement('style'); s.id = 'olcum-stil'; s.textContent = css; d.head.appendChild(s);
  }
  function bantAc() {
    stil();
    bant = d.createElement('section');
    bant.className = 'olcum-bant'; bant.setAttribute('aria-label', 'Çerez tercihleri');
    bant.innerHTML = '<p>Ziyaret istatistikleri ve reklam ölçümü için çerezleri yalnızca izninizle kullanırız. Ayrıntılar <a href="' + OLCUM_AYAR.politikaUrl + '">çerez politikasında</a>.</p>' +
      '<div class="olcum-btns"><button type="button" class="olcum-btn olcum-btn--ana" data-olcum="kabul">Kabul et</button>' +
      '<button type="button" class="olcum-btn" data-olcum="ret">Reddet</button>' +
      '<button type="button" class="olcum-btn" data-olcum="tercih">Tercihler</button></div>';
    d.body.appendChild(bant);
  }
  function bantKapat() { if (bant) { bant.remove(); bant = null; } }
  function pencereAc() {
    stil();
    var c = LS.get(OLCUM_AYAR.izinAnahtari) || { analytics: false, ads: false };
    if (!pencere) {
      pencere = d.createElement('dialog'); pencere.className = 'olcum-pencere'; pencere.setAttribute('aria-labelledby', 'olcum-baslik');
      pencere.innerHTML = '<form method="dialog"><h2 id="olcum-baslik">Çerez tercihleri</h2>' +
        '<p style="margin:0;color:#555">Seçiminizi istediğiniz zaman sayfanın altındaki “Çerez tercihleri” bağlantısından değiştirebilir veya geri alabilirsiniz.</p>' +
        '<label class="olcum-sec"><input type="checkbox" checked disabled><span><b>Zorunlu</b><span>Bu tercihin tarayıcınızda hatırlanması için gerekir.</span></span></label>' +
        '<label class="olcum-sec"><input type="checkbox" name="analytics"><span><b>Analiz</b><span>Hangi sayfaların ziyaret edildiğini anonim istatistiklerle görmemizi sağlar (Google Analytics).</span></span></label>' +
        '<label class="olcum-sec"><input type="checkbox" name="ads"><span><b>Reklam ve dönüşüm ölçümü</b><span>Reklamlarımızın hangi iletişimleri getirdiğini ölçmemizi sağlar (Google Ads).</span></span></label>' +
        '<div class="olcum-btns"><button class="olcum-btn" value="ret" data-olcum="ret">Tümünü reddet</button><button class="olcum-btn olcum-btn--ana" value="kaydet" data-olcum="kaydet">Seçimi kaydet</button></div></form>';
      d.body.appendChild(pencere);
    }
    pencere.querySelector('[name="analytics"]').checked = !!c.analytics;
    pencere.querySelector('[name="ads"]').checked = !!c.ads;
    if (typeof pencere.showModal === 'function') pencere.showModal(); else pencere.setAttribute('open', '');
  }
  function pencereKapat() { if (pencere) { if (typeof pencere.close === 'function') pencere.close(); else pencere.removeAttribute('open'); } }

  d.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-olcum], [data-olcum-tercih]') : null;
    if (!t) return;
    if (t.hasAttribute('data-olcum-tercih')) { e.preventDefault(); pencereAc(); return; }
    var a = t.getAttribute('data-olcum');
    if (a === 'kabul') izinUygula({ analytics: true, ads: true }, 'banner');
    if (a === 'ret') { e.preventDefault(); izinUygula({ analytics: false, ads: false }, pencere && pencere.contains(t) ? 'dialog' : 'banner'); pencereKapat(); }
    if (a === 'tercih') pencereAc();
    if (a === 'kaydet') { e.preventDefault(); izinUygula({ analytics: pencere.querySelector('[name="analytics"]').checked, ads: pencere.querySelector('[name="ads"]').checked }, 'dialog'); pencereKapat(); }
  });

  /* ---------- başlangıç ---------- */
  var kayitli = LS.get(OLCUM_AYAR.izinAnahtari);
  if (kayitli) {
    gtag('consent', 'update', {
      analytics_storage: kayitli.analytics ? 'granted' : 'denied',
      ad_storage: kayitli.ads ? 'granted' : 'denied',
      ad_user_data: kayitli.ads ? 'granted' : 'denied',
      ad_personalization: kayitli.ads ? 'granted' : 'denied'
    });
    if (kayitli.analytics || kayitli.ads) gtmYukle();
  }
  function hazir() { if (!kayitli && etkin) bantAc(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', hazir); else hazir();
})();
