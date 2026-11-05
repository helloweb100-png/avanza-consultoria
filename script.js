/* ==========================================================================
   AVANZA Consultoría Financiera · script.js
   Todo lo que hay aquí es una mejora progresiva: si el JavaScript o la CDN
   de anime.js fallan, la página se ve completa y los enlaces siguen sirviendo.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Configuración
     El número de WhatsApp vive SOLO aquí (código de país 52 + 10 dígitos).
     Si se deja vacío, el botón flotante, los CTA y el envío del formulario
     se ocultan con elegancia.
     --------------------------------------------------------------------- */
  const WHATSAPP_NUMERO = '524424536038';
  const MENSAJE_BASE = 'Hola, vi la página de AVANZA y quiero información.';

  /* ---------- Utilidades ---------- */
  const $ = (sel, raizBusqueda) => (raizBusqueda || document).querySelector(sel);
  const $$ = (sel, raizBusqueda) => Array.from((raizBusqueda || document).querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const raiz = document.documentElement;
  const prefiereMenos = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hayPuntero = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const NUM = String(WHATSAPP_NUMERO).replace(/\D/g, '');
  const HAY_WA = NUM.length >= 10;

  function urlWhatsApp(texto) {
    return 'https://wa.me/' + NUM + '?text=' + encodeURIComponent(texto || MENSAJE_BASE);
  }

  function formatearNumero(digitos) {
    const d = digitos.slice(-10);
    return d.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  /* ---------- 1. WhatsApp: enlaces, número visible y modo sin número ---------- */
  function iniciarWhatsApp() {
    raiz.classList.toggle('sin-wa', !HAY_WA);
    if (!HAY_WA) return;
    $$('[data-wa]').forEach((a) => {
      a.href = urlWhatsApp(a.dataset.msg || MENSAJE_BASE);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
    $$('[data-wa-numero]').forEach((el) => {
      el.textContent = formatearNumero(NUM);
    });
  }

  /* ---------- 2. Cargador ---------- */
  function iniciarCargador() {
    const c = $('#cargador');
    if (!c) {
      raiz.classList.add('listo');
      return;
    }
    let terminado = false;
    const pct = $('[data-cargador-pct]', c);
    const anillo = $('.avance', c);
    const duracion = prefiereMenos ? 250 : 1500;

    function terminar() {
      if (terminado) return;
      terminado = true;
      c.classList.add('fuera');
      raiz.classList.add('listo');
      window.setTimeout(() => {
        c.hidden = true;
      }, 600);
    }

    if (anillo) anillo.style.animation = 'none';
    const t0 = performance.now();
    (function paso(t) {
      if (terminado) return;
      const p = clamp((t - t0) / duracion, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      if (pct) pct.textContent = String(Math.round(e * 100));
      if (anillo) anillo.style.strokeDashoffset = String(100 - e * 100);
      if (p < 1) {
        requestAnimationFrame(paso);
      } else {
        window.setTimeout(terminar, 120);
      }
    })(t0);

    // Seguro: aunque el navegador pause las animaciones, el cargador se va
    window.setTimeout(terminar, 1900);
  }

  /* ---------- 3. Menú móvil y año ---------- */
  function iniciarMenu() {
    const btn = $('.burger');
    const menu = $('#menu');
    if (!btn || !menu) return;

    function abrir(valor) {
      menu.classList.toggle('abierto', valor);
      btn.setAttribute('aria-expanded', String(valor));
      btn.setAttribute('aria-label', valor ? 'Cerrar menú' : 'Abrir menú');
      raiz.classList.toggle('bloqueado', valor);
    }

    btn.addEventListener('click', () => abrir(btn.getAttribute('aria-expanded') !== 'true'));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => abrir(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') abrir(false);
    });
    window.matchMedia('(min-width: 980px)').addEventListener('change', (e) => {
      if (e.matches) abrir(false);
    });

    $$('[data-anio]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- 4. Enlace activo del menú ---------- */
  function iniciarEnlaceActivo() {
    if (!('IntersectionObserver' in window)) return;
    const ids = ['inicio', 'enfoque', 'rutas', 'retiro', 'metodo', 'historias', 'confianza', 'asesora', 'faq', 'contacto'];
    const enlaces = $$('.menu a');
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((en) => {
          if (!en.isIntersecting) return;
          const destino = '#' + en.target.id;
          enlaces.forEach((a) => {
            if (a.getAttribute('href') === destino) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ---------- 5. Revelado al hacer scroll ---------- */
  function iniciarRevelado() {
    const els = $$('.rev');
    if (prefiereMenos || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('visible');
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    els.forEach((el) => {
      // Lo que quedó por encima de la pantalla (carga a mitad de página) ya se muestra
      if (el.getBoundingClientRect().bottom < 0) el.classList.add('visible');
      else io.observe(el);
    });
  }

  /* ---------- 6. Contadores ---------- */
  function iniciarContadores() {
    const els = $$('[data-contar]');
    if (!els.length || prefiereMenos || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          animarNumero(en.target, parseInt(en.target.dataset.contar, 10));
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => io.observe(el));
  }

  function animarNumero(el, meta) {
    if (!meta) return;
    const poner = (n) => {
      el.textContent = Math.round(n).toLocaleString('es-MX');
    };
    if (window.anime) {
      const obj = { v: 0 };
      window.anime({
        targets: obj,
        v: meta,
        duration: 1600,
        easing: 'easeOutExpo',
        update: () => poner(obj.v),
        complete: () => poner(meta),
      });
      return;
    }
    const t0 = performance.now();
    (function paso(t) {
      const p = clamp((t - t0) / 1400, 0, 1);
      poner(meta * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(paso);
    })(t0);
  }

  /* ---------- 7. Inclinación 3D con el puntero (escena del hero y volante) ---------- */
  function iniciarInclinacion() {
    if (!hayPuntero || prefiereMenos) return;
    $$('[data-inclinar]').forEach((el) => {
      const esEscena = el.classList.contains('escena');
      const zona = esEscena ? $('.hero') || el : el;
      const max = esEscena ? 13 : 11;
      zona.addEventListener('pointermove', (e) => {
        const r = zona.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * max * 2).toFixed(2) + 'deg');
      });
      zona.addEventListener('pointerleave', () => {
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ---------- 8. Botones magnéticos y luz de las tarjetas ---------- */
  function iniciarInteracciones() {
    if (hayPuntero && !prefiereMenos) {
      $$('[data-mag]').forEach((b) => {
        b.addEventListener('pointermove', (e) => {
          const r = b.getBoundingClientRect();
          const x = (e.clientX - (r.left + r.width / 2)) * 0.2;
          const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
          b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
        });
        b.addEventListener('pointerleave', () => {
          b.style.transform = '';
        });
      });
    }
    $$('.tile').forEach((t) => {
      t.addEventListener('pointermove', (e) => {
        const r = t.getBoundingClientRect();
        t.style.setProperty('--mx', e.clientX - r.left + 'px');
        t.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    });
    $$('.faq__item').forEach((d) => {
      d.addEventListener('toggle', () => {
        if (!d.open) return;
        $$('.faq__item').forEach((otro) => {
          if (otro !== d) otro.open = false;
        });
      });
    });
  }

  /* ---------- 9. Efectos ligados al scroll ---------- */
  const paralajes = $$('[data-parallax]');
  const manifiesto = $('[data-palabras]');
  const pasos = $('.pasos');
  const itemsPasos = pasos ? $$('.paso', pasos) : [];
  const tarjetasRuta = $$('.ruta');
  const expandir = $('[data-expandir]');
  const barra = $('.progreso');
  const cabecera = $('#cabecera');
  const heroEl = $('.hero');
  const heroTexto = $('.hero__texto');
  const heroEscena = $('.escena');
  let ultimoHero = -1;
  let palabras = [];
  let encendidas = 0;
  let progManifiesto = 0;
  let progPasos = 0;

  function prepararPalabras() {
    if (!manifiesto) return;
    (function recorrer(nodo) {
      Array.from(nodo.childNodes).forEach((hijo) => {
        if (hijo.nodeType === 3) {
          const frag = document.createDocumentFragment();
          hijo.textContent.split(/(\s+)/).forEach((trozo) => {
            if (!trozo) return;
            if (/^\s+$/.test(trozo)) {
              frag.appendChild(document.createTextNode(trozo));
            } else {
              const s = document.createElement('span');
              s.className = 'pal';
              s.textContent = trozo;
              frag.appendChild(s);
            }
          });
          nodo.replaceChild(frag, hijo);
        } else if (hijo.nodeType === 1) {
          recorrer(hijo);
        }
      });
    })(manifiesto);
    palabras = $$('.pal', manifiesto);
  }

  function actualizarProgresoGeneral() {
    const y = window.scrollY || window.pageYOffset || 0;
    const total = raiz.scrollHeight - window.innerHeight;
    if (barra) barra.style.setProperty('--p', total > 0 ? (y / total).toFixed(4) : '0');
    if (cabecera) cabecera.classList.toggle('solida', y > 24);
  }

  // El hero se aleja suavemente (sube, se desvanece y se encoge) al empezar a bajar
  function actualizarHero() {
    if (prefiereMenos || !heroEl || !heroTexto || !heroEscena) return;
    const y = window.scrollY || window.pageYOffset || 0;
    const p = clamp(y / Math.max(heroEl.offsetHeight, 1), 0, 1);
    if (Math.abs(p - ultimoHero) < 0.002) return;
    ultimoHero = p;
    heroTexto.style.transform = 'translate3d(0,' + (p * 70).toFixed(1) + 'px,0)';
    heroTexto.style.opacity = (1 - p * 0.9).toFixed(3);
    heroEscena.style.transform = 'translate3d(0,' + (p * -50).toFixed(1) + 'px,0) scale(' + (1 - p * 0.12).toFixed(3) + ')';
  }

  function actualizarParallax() {
    if (prefiereMenos || !paralajes.length) return;
    const vh = window.innerHeight;
    paralajes.forEach((el) => {
      const base = el.parentElement.getBoundingClientRect();
      if (base.bottom < -vh || base.top > vh * 2) return;
      const f = parseFloat(el.dataset.parallax) || 0;
      const desplazamiento = (base.top + base.height / 2 - vh / 2) * -f;
      el.style.transform = 'translate3d(0,' + desplazamiento.toFixed(1) + 'px,0)';
    });
  }

  function actualizarManifiesto() {
    if (!palabras.length) return;
    if (prefiereMenos) {
      palabras.forEach((p) => p.classList.add('on'));
      palabras = [];
      return;
    }
    const r = manifiesto.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.33), 0, 1);
    if (p > progManifiesto) progManifiesto = p;
    const meta = Math.round(progManifiesto * palabras.length);
    for (let i = encendidas; i < meta; i += 1) palabras[i].classList.add('on');
    encendidas = Math.max(encendidas, meta);
  }

  function actualizarPasos() {
    if (!pasos) return;
    if (prefiereMenos) progPasos = 1;
    else {
      const r = pasos.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.62 - r.top) / r.height, 0, 1);
      if (p > progPasos) progPasos = p;
    }
    pasos.style.setProperty('--prog', progPasos.toFixed(4));
    const limite = progPasos * pasos.offsetHeight;
    itemsPasos.forEach((li) => {
      if (li.offsetTop + 30 <= limite) li.classList.add('activo');
    });
  }

  function actualizarPila() {
    if (!tarjetasRuta.length) return;
    const anclado = window.innerHeight > 720 && !prefiereMenos;
    tarjetasRuta.forEach((c, i) => {
      const sig = tarjetasRuta[i + 1];
      if (!sig || !anclado) {
        c.style.setProperty('--esc', '1');
        c.style.setProperty('--vel', '0');
        return;
      }
      const a = c.getBoundingClientRect();
      const b = sig.getBoundingClientRect();
      const t = clamp(1 - (b.top - a.top) / c.offsetHeight, 0, 1);
      c.style.setProperty('--esc', (1 - 0.06 * t).toFixed(4));
      c.style.setProperty('--vel', (t * 0.5).toFixed(3));
    });
  }

  function actualizarExpandir() {
    if (!expandir) return;
    if (prefiereMenos) {
      expandir.style.setProperty('--p', '1');
      return;
    }
    const r = expandir.getBoundingClientRect();
    const vh = window.innerHeight;
    const centro = r.top + r.height / 2;
    const fin = vh * 0.62;
    const p = clamp((vh + r.height / 2 - centro) / (vh + r.height / 2 - fin), 0, 1);
    const suave = 1 - Math.pow(1 - p, 2);
    expandir.style.setProperty('--p', suave.toFixed(4));
  }

  let programado = false;
  function alScroll() {
    programado = false;
    actualizarProgresoGeneral();
    actualizarHero();
    actualizarParallax();
    actualizarManifiesto();
    actualizarPasos();
    actualizarPila();
    actualizarExpandir();
  }

  function pedirActualizacion() {
    if (programado) return;
    programado = true;
    requestAnimationFrame(alScroll);
  }

  /* ---------- 10. Lienzo del hero: chevrones que suben ---------- */
  function iniciarLienzo() {
    const cv = $('#lienzo-hero');
    const hero = $('.hero');
    if (!cv || !hero) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let particulas = [];
    let raf = 0;
    let visible = true;
    let mx = -9999;
    let my = -9999;

    function crear(inicial) {
      const z = Math.random();
      return {
        x: Math.random() * w,
        y: inicial ? Math.random() * h : h + 30,
        z: z,
        s: 5 + z * 17,
        v: 0.18 + z * 0.75,
        a: 0.14 + z * 0.5,
        verde: Math.random() < 0.38,
        fase: Math.random() * 6.283,
      };
    }

    function medir() {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(clamp((w * h) / 16000, 22, 72));
      particulas = [];
      for (let i = 0; i < n; i += 1) particulas.push(crear(true));
    }

    function dibujar(p) {
      ctx.beginPath();
      ctx.moveTo(p.x - p.s, p.y + p.s * 0.7);
      ctx.lineTo(p.x, p.y - p.s * 0.7);
      ctx.lineTo(p.x + p.s, p.y + p.s * 0.7);
      ctx.lineWidth = 1 + p.z * 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = p.verde ? 'rgba(123,182,26,' + p.a.toFixed(2) + ')' : 'rgba(255,255,255,' + (p.a * 0.7).toFixed(2) + ')';
      ctx.stroke();
    }

    function cuadro(mover) {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particulas.length; i += 1) {
        const p = particulas[i];
        if (mover) {
          p.y -= p.v;
          p.x += Math.sin(p.fase + p.y * 0.012) * 0.18;
          const dx = p.x - mx;
          const dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14000) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d2 / 14000) * 2.4;
            p.x += (dx / d) * f;
            p.y += (dy / d) * f;
          }
          if (p.y < -40) particulas[i] = crear(false);
        }
        dibujar(particulas[i]);
      }
    }

    function bucle() {
      cuadro(true);
      raf = requestAnimationFrame(bucle);
    }

    function arrancar() {
      if (raf || prefiereMenos) return;
      raf = requestAnimationFrame(bucle);
    }

    function parar() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    medir();
    cuadro(false);
    arrancar();

    window.addEventListener('resize', () => {
      medir();
      cuadro(false);
    });

    hero.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => {
      mx = -9999;
      my = -9999;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entradas) => {
        visible = entradas[0].isIntersecting;
        if (visible && !document.hidden) arrancar();
        else parar();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) parar();
      else if (visible) arrancar();
    });
  }

  /* ---------- 11. anime.js: escena 3D del hero (opcional) ---------- */
  function iniciarAnime() {
    const a = window.anime;
    const monolito = $('.monolito');
    if (!a || prefiereMenos || !monolito) return;
    try {
      raiz.classList.add('anime-ok');
      const estado = { sep: 1 };
      const apareciendo = $$('.tarjeta, .pastilla');

      // Estado inicial (el cargador todavía cubre la pantalla)
      a.set(monolito, { opacity: 0, rotateY: -200, rotateX: 18, scale: 0.6 });
      a.set(apareciendo, { opacity: 0 });

      // Entrada del monolito y luego balanceo continuo
      a({
        targets: monolito,
        opacity: [0, 1],
        rotateY: [-200, -24],
        rotateX: [18, 8],
        scale: [0.6, 1],
        duration: 1900,
        delay: 1700,
        easing: 'easeOutExpo',
        complete: () => {
          a({
            targets: monolito,
            rotateY: [-24, 24],
            rotateX: [8, -6],
            duration: 9000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine',
          });
        },
      });

      // Las capas del monolito se separan y se juntan (profundidad que respira)
      a({
        targets: estado,
        sep: [0.55, 1.4],
        duration: 3200,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
        update: () => monolito.style.setProperty('--sep', estado.sep.toFixed(3)),
      });

      // Tarjetas y pastillas aparecen en cascada
      a({
        targets: apareciendo,
        opacity: [0, 1],
        duration: 900,
        delay: a.stagger(170, { start: 2400 }),
        easing: 'easeOutQuad',
      });

      // Flotación constante de las tarjetas
      a({
        targets: '.tarjeta__in',
        translateY: [-8, 9],
        duration: 3400,
        delay: a.stagger(450),
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
      });
    } catch (err) {
      raiz.classList.remove('anime-ok');
    }
  }

  /* ---------- 12. Verificador de requisitos ---------- */
  function iniciarVerificador() {
    const caja = $('#verificador');
    if (!caja) return;
    const checks = $$('input[name="req"]', caja);
    const num = $('[data-verif-n]', caja);
    const titulo = $('[data-verif-titulo]', caja);
    const texto = $('[data-verif-texto]', caja);
    const cta = $('[data-verif-cta]', caja);
    const anillo = $('.anillo__avance', caja);
    const mensajes = [
      ['Marca lo que aplica a tu caso', 'Te mostramos al instante qué tan cerca estás de avanzar.'],
      ['Vas en camino', 'Ya cumples uno de los requisitos. Cuéntanos tu caso y revisamos el resto contigo, sin costo.'],
      ['Casi lo logras', 'Cumples dos requisitos. Confirmemos el tercero en tu prevalidación gratuita.'],
      ['¡Todo indica que puedes avanzar!', 'Confirmémoslo con tu prevalidación gratuita: sin compromiso y sin costo.'],
    ];

    function actualizar() {
      const marcados = checks.filter((c) => c.checked);
      const k = marcados.length;
      num.textContent = String(k);
      anillo.style.strokeDashoffset = String(3 - k);
      titulo.textContent = mensajes[k][0];
      texto.textContent = mensajes[k][1];
      let msg = 'Hola, vi la página de AVANZA y quiero mi prevalidación gratuita para el Retiro por desempleo de mi Afore.';
      if (k > 0) {
        msg += '\nLo que ya cumplo:\n' + marcados.map((c) => '- ' + c.value).join('\n');
      }
      cta.dataset.msg = msg;
      if (HAY_WA) cta.href = urlWhatsApp(msg);
    }

    checks.forEach((c) => c.addEventListener('change', actualizar));
    actualizar();
  }

  /* ---------- 13. Visor de imágenes ---------- */
  function iniciarVisor() {
    const visor = $('#visor');
    if (!visor) return;
    const img = $('.visor__img', visor);
    const cerrarBtn = $('.visor__cerrar', visor);
    let origen = null;

    function abrir(src, alt, disparador) {
      origen = disparador;
      img.classList.remove('vertical');
      img.onload = () => img.classList.toggle('vertical', img.naturalHeight > img.naturalWidth);
      img.alt = alt || '';
      img.src = src;
      visor.hidden = false;
      raiz.classList.add('bloqueado');
      cerrarBtn.focus();
    }

    function cerrar() {
      if (visor.hidden) return;
      visor.hidden = true;
      raiz.classList.remove('bloqueado');
      img.removeAttribute('src');
      if (origen) origen.focus();
    }

    $$('[data-ampliar]').forEach((b) => {
      b.addEventListener('click', () => abrir(b.dataset.ampliar, b.dataset.alt, b));
    });
    cerrarBtn.addEventListener('click', cerrar);
    visor.addEventListener('click', (e) => {
      if (e.target === visor || e.target.classList.contains('visor__marco')) cerrar();
    });
    document.addEventListener('keydown', (e) => {
      if (visor.hidden) return;
      if (e.key === 'Escape') cerrar();
      if (e.key === 'Tab') {
        e.preventDefault();
        cerrarBtn.focus();
      }
    });
  }

  /* ---------- 14. Formulario: arma el mensaje y abre WhatsApp ---------- */
  function iniciarFormulario() {
    const f = $('#formulario');
    if (!f) return;
    const estado = $('[data-estado]', f);
    const nombre = $('#f-nombre');
    const tramite = $('#f-tramite');
    const mensaje = $('#f-mensaje');

    function marcar(campo, error) {
      const e = $('[data-error="' + campo.name + '"]', f);
      if (e) e.textContent = error || '';
      campo.setAttribute('aria-invalid', error ? 'true' : 'false');
    }

    nombre.addEventListener('input', () => marcar(nombre, ''));
    tramite.addEventListener('change', () => marcar(tramite, ''));

    f.addEventListener('submit', (e) => {
      e.preventDefault();
      let valido = true;
      let primero = null;

      if (nombre.value.trim().length < 2) {
        marcar(nombre, 'Escribe tu nombre para poder atenderte.');
        valido = false;
        primero = primero || nombre;
      } else {
        marcar(nombre, '');
      }
      if (!tramite.value) {
        marcar(tramite, 'Elige el trámite que te interesa.');
        valido = false;
        primero = primero || tramite;
      } else {
        marcar(tramite, '');
      }
      if (!valido) {
        estado.textContent = '';
        if (primero) primero.focus();
        return;
      }
      if (!HAY_WA) {
        estado.textContent = 'Por ahora no podemos abrir WhatsApp desde aquí. Visítanos en Plaza Alameda.';
        return;
      }

      const via = $('input[name="via"]:checked', f);
      const partes = [
        'Hola, soy ' + nombre.value.trim() + '.',
        'Me interesa: ' + tramite.value + '.',
        via ? via.value + '.' : '',
        mensaje.value.trim() ? 'Mi caso: ' + mensaje.value.trim() : '',
        'Los vi en su página web de AVANZA.',
      ].filter(Boolean);
      const url = urlWhatsApp(partes.join('\n'));

      window.open(url, '_blank', 'noopener');
      estado.textContent = '¡Listo! Abriendo WhatsApp con tu mensaje… ';
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.target = '_blank';
      enlace.rel = 'noopener noreferrer';
      enlace.textContent = 'Si no se abrió, toca aquí.';
      estado.appendChild(enlace);
    });
  }

  /* ---------- Arranque ---------- */
  function iniciar() {
    iniciarCargador();
    iniciarWhatsApp();
    iniciarMenu();
    iniciarEnlaceActivo();
    prepararPalabras();
    iniciarRevelado();
    iniciarContadores();
    iniciarInclinacion();
    iniciarInteracciones();
    iniciarVerificador();
    iniciarVisor();
    iniciarFormulario();
    iniciarLienzo();
    iniciarAnime();

    window.addEventListener('scroll', pedirActualizacion, { passive: true });
    window.addEventListener('resize', pedirActualizacion);
    window.addEventListener('load', pedirActualizacion);
    alScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
