/* ============================================================
   ETHOS — Gestor de consentimiento de cookies
   ------------------------------------------------------------
   PARA ACTIVAR UN SERVICIO EN EL FUTURO: pega su ID aquí abajo.
   Nada se carga hasta que el visitante lo acepta.
   ============================================================ */
const ETHOS_COOKIES_CONFIG = {
  GOOGLE_ANALYTICS_ID: '',   // ej. 'G-XXXXXXXXXX'
  META_PIXEL_ID: ''          // ej. '123456789012345'
};

(function () {
  const KEY = 'ethos_cookie_consent';
  const VERSION = 1;
  const DURACION_DIAS = 365;

  function leer() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY));
      if (!c || c.v !== VERSION) return null;
      if (Date.now() - c.fecha > DURACION_DIAS * 864e5) return null;
      return c;
    } catch (e) { return null; }
  }
  function guardar(analiticas, marketing) {
    const c = { v: VERSION, fecha: Date.now(), analiticas: !!analiticas, marketing: !!marketing };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    aplicar(c);
    ocultar();
    document.dispatchEvent(new CustomEvent('ethos-consent', { detail: c }));
  }

  /* ---------- Carga de servicios solo con consentimiento ---------- */
  function aplicar(c) {
    if (c.analiticas && ETHOS_COOKIES_CONFIG.GOOGLE_ANALYTICS_ID && !window.__ethosGA) {
      window.__ethosGA = true;
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ETHOS_COOKIES_CONFIG.GOOGLE_ANALYTICS_ID;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', ETHOS_COOKIES_CONFIG.GOOGLE_ANALYTICS_ID, { anonymize_ip: true });
    }
    if (c.marketing && ETHOS_COOKIES_CONFIG.META_PIXEL_ID && !window.__ethosPixel) {
      window.__ethosPixel = true;
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', ETHOS_COOKIES_CONFIG.META_PIXEL_ID);
      fbq('track', 'PageView');
    }
    /* Vídeos de terceros (YouTube/Vimeo): usar <iframe data-ethos-src="URL"> en lugar de src.
       Solo se cargan si el visitante acepta marketing. */
    document.querySelectorAll('iframe[data-ethos-src]').forEach(function (f) {
      if (c.marketing && !f.src) f.src = f.getAttribute('data-ethos-src');
    });
  }

  /* ---------- Interfaz ---------- */
  const css = `
  #ethos-cookies{position:fixed;left:0;right:0;bottom:0;z-index:3000;background:#111111;border-top:1px solid #8a6a20;padding:1.4rem 2rem;font-family:'Montserrat',sans-serif;display:none}
  #ethos-cookies .ec-in{max-width:1100px;margin:0 auto;display:flex;gap:2rem;align-items:center;flex-wrap:wrap}
  #ethos-cookies .ec-txt{flex:1;min-width:260px;font-size:0.72rem;color:#888888;line-height:1.7}
  #ethos-cookies .ec-txt strong{color:#f5f0e8;font-weight:500}
  #ethos-cookies .ec-txt a{color:#c9a84c}
  #ethos-cookies .ec-btns{display:flex;gap:0.6rem;flex-wrap:wrap}
  #ethos-cookies button{font-family:'Montserrat',sans-serif;font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;padding:0.75rem 1.4rem;cursor:pointer;background:transparent;border:1px solid #c9a84c;color:#c9a84c;transition:background .3s,color .3s}
  #ethos-cookies button:hover{background:#c9a84c;color:#0a0a0a}
  #ethos-cookies button.ec-link{border-color:#1e1e1e;color:#888888}
  #ethos-cookies button.ec-link:hover{background:transparent;color:#c9a84c;border-color:#c9a84c}
  #ethos-cookies .ec-panel{display:none;max-width:1100px;margin:1.2rem auto 0;border-top:1px solid #1e1e1e;padding-top:1rem}
  #ethos-cookies .ec-op{display:flex;gap:0.8rem;align-items:flex-start;margin-bottom:0.8rem;font-size:0.7rem;color:#888888;line-height:1.6}
  #ethos-cookies .ec-op input{accent-color:#c9a84c;margin-top:0.2rem;flex-shrink:0}
  #ethos-cookies .ec-op strong{color:#f5f0e8;font-weight:500}
  @media(max-width:768px){#ethos-cookies{padding:1.2rem 1rem}#ethos-cookies .ec-btns{width:100%}#ethos-cookies .ec-btns button{flex:1}}`;

  const html = `
  <div id="ethos-cookies" role="dialog" aria-live="polite" aria-label="Preferencias de cookies">
    <div class="ec-in">
      <p class="ec-txt"><strong>Usamos cookies.</strong> Las necesarias hacen que la web funcione. Con tu permiso, usaríamos también cookies de análisis y de marketing para entender cómo se usa la web y mostrarte contenido relevante. Puedes aceptar, rechazar o elegir. Más información en la <a href="privacidad.html#cookies">Política de cookies</a>.</p>
      <div class="ec-btns">
        <button type="button" id="ec-rechazar">Rechazar</button>
        <button type="button" id="ec-aceptar">Aceptar</button>
        <button type="button" id="ec-config" class="ec-link">Configurar</button>
      </div>
    </div>
    <div class="ec-panel" id="ec-panel">
      <label class="ec-op"><input type="checkbox" checked disabled /><span><strong>Necesarias</strong> — imprescindibles para que la web funcione y para recordar tu elección de cookies. Siempre activas.</span></label>
      <label class="ec-op"><input type="checkbox" id="ec-analiticas" /><span><strong>Análisis</strong> — nos permiten medir visitas y uso de la web (por ejemplo, Google Analytics).</span></label>
      <label class="ec-op"><input type="checkbox" id="ec-marketing" /><span><strong>Marketing y contenido de terceros</strong> — permiten medir campañas publicitarias (por ejemplo, Meta Pixel) y reproducir vídeos incrustados (por ejemplo, YouTube o Vimeo).</span></label>
      <div class="ec-btns"><button type="button" id="ec-guardar">Guardar mi elección</button></div>
    </div>
  </div>`;

  function montar() {
    if (document.getElementById('ethos-cookies')) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const w = document.createElement('div'); w.innerHTML = html; document.body.appendChild(w.firstElementChild);
    document.getElementById('ec-aceptar').onclick = function () { guardar(true, true); };
    document.getElementById('ec-rechazar').onclick = function () { guardar(false, false); };
    document.getElementById('ec-config').onclick = function () {
      const p = document.getElementById('ec-panel');
      p.style.display = p.style.display === 'block' ? 'none' : 'block';
    };
    document.getElementById('ec-guardar').onclick = function () {
      guardar(document.getElementById('ec-analiticas').checked, document.getElementById('ec-marketing').checked);
    };
  }
  function mostrar() {
    montar();
    const c = leer();
    document.getElementById('ec-analiticas').checked = !!(c && c.analiticas);
    document.getElementById('ec-marketing').checked = !!(c && c.marketing);
    document.getElementById('ethos-cookies').style.display = 'block';
  }
  function ocultar() {
    const b = document.getElementById('ethos-cookies');
    if (b) b.style.display = 'none';
  }

  /* Enlace "Configurar cookies" disponible en toda la web */
  window.ethosConfigurarCookies = function () {
    mostrar();
    document.getElementById('ec-panel').style.display = 'block';
  };

  function init() {
    const c = leer();
    if (c) aplicar(c); else mostrar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
