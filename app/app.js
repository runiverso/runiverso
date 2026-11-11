/* Runiverso App v2 · carreras, apuntarse, marcas, vitrina, cuentas y ranking */
(function () {
  "use strict";

  /* ---------- Utilidades ---------- */
  var $ = function (id) { return document.getElementById(id); };
  function esc(t) { return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function pd(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  var MES_C = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var MES_L = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var DIAS_L = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  function daysTo(d) { return Math.round((d - today) / 86400000); }
  function fdate(d) { return DIAS_L[d.getDay()] + " " + d.getDate() + " de " + MES_L[d.getMonth()] + " de " + d.getFullYear(); }
  function sdate(d) { return d.getDate() + " " + MES_C[d.getMonth()] + " " + d.getFullYear(); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function fmtT(sec) { sec = Math.round(sec); var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return (h ? h + ":" + pad(m) : m) + ":" + pad(s); }
  function pace(sec, km) { var p = sec / km; return Math.floor(p / 60) + ":" + pad(Math.round(p % 60)) + " /km"; }
  function seasonStart() { var y = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1; return new Date(y, 8, 1); }

  var APP_V = "32";
  var CANAL = "https://whatsapp.com/channel/0029VbDrJk2InlqSVj746L0L";
  var WA_ICO = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z"/></svg>';
  function canalCard(title, text) {
    return '<a class="canal" href="' + CANAL + '" target="_blank" rel="noopener"><span class="ci">' + WA_ICO + '</span><span class="ct"><b>' + title + '</b><span>' + text + '</span></span><span class="cb">Unirme</span></a>';
  }

  /* ---------- Datos guardados en el móvil ---------- */
  var KEY = "runiverso-app-v1";
  var S = { name: "", mine: {}, marks: [], prov: "", ccaa: "", pub: false, acct: "", q: [] };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) { S.name = saved.name || ""; S.mine = saved.mine || {}; S.marks = saved.marks || []; S.prov = saved.prov || ""; S.ccaa = saved.ccaa || ""; S.pub = !!saved.pub; S.acct = saved.acct || ""; S.q = saved.q || []; S.push = !!saved.push; S.onb = saved.onb || !!saved.prov; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("No se ha podido guardar en este móvil"); } }


  /* ---------- Movimiento (GSAP): solo transform y opacidad; nada si el sistema pide reducir movimiento ---------- */
  var motion = (function () {
    var G = window.gsap, RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches, on = !!G && !RM;
    var D = 0.55, E = "power3.out", CLR = "transform,opacity";
    function q(el, sel) { return el ? [].slice.call(el.querySelectorAll(sel)) : []; }
    function splitWords(h) {
      if (!h || h.getAttribute("data-split")) return [];
      if ([].some.call(h.childNodes, function (n) { return n.nodeType === 1; })) return [];
      var words = h.textContent.split(/(\s+)/);
      h.setAttribute("data-split", "1"); h.setAttribute("aria-label", h.textContent);
      h.innerHTML = words.map(function (w) { return /^\s+$/.test(w) ? w : '<span class="w" aria-hidden="true"><span>' + esc(w) + '</span></span>'; }).join("");
      return q(h, ".w > span");
    }
    function count(el) {
      q(el, ".stat b, .pr b, .hnum").forEach(function (b) {
        var txt = b.textContent.trim(); if (!/^\d{1,5}$/.test(txt) || txt === "0") return;
        var o = { v: 0 }, n = +txt; b.textContent = "0";
        G.to(o, { v: n, duration: 1.1, ease: "power2.out", delay: 0.15, onUpdate: function () { b.textContent = Math.round(o.v); } });
      });
    }
    function view(el) {
      if (!on || !el) return;
      G.fromTo(el, { opacity: 0.4 }, { opacity: 1, duration: 0.16, ease: "power1.out", clearProps: "opacity" });
      if (!view.counted) { view.counted = true; count(el); }
      var m = q(el, ".medal"); if (m.length) medals(m);
      var rk = q(el, ".rank li"); if (rk.length) G.from(rk, { x: -18, opacity: 0, duration: 0.45, ease: E, stagger: 0.05, delay: 0.2, clearProps: CLR });
    }
    function medals(list) { G.from(list, { scale: 0.55, rotation: -16, opacity: 0, duration: 0.75, ease: "back.out(1.9)", stagger: 0.06, delay: 0.15, clearProps: CLR }); }
    function list(el) { if (!on || !el) return; G.from(q(el, ".mineres, .pod, .rsearch, .rrow, .card, .ahint").slice(0, 40), { y: 12, opacity: 0, duration: 0.45, ease: E, stagger: 0.025, clearProps: CLR }); }
    function screen(el) {
      if (!on || !el) return;
      G.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out", clearProps: "opacity" });
      G.from(q(el, ".abrand, .rhead, h1, .asub, .aperks li, .abtn, .or, .atabs, .fld, .f > .btn, .alinks, .ahint"), { y: 18, opacity: 0, duration: D, ease: E, stagger: 0.04, delay: 0.05, clearProps: CLR });
    }
    function sheet(el) {
      if (!on || !el) return;
      G.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out", clearProps: "opacity" });
      var sh = el.querySelector(".sheet"); if (sh) G.fromTo(sh, { yPercent: 100 }, { yPercent: 0, duration: 0.42, ease: "expo.out", clearProps: "transform" });
    }
    function tilt() {
      return;
      if (!on || !(window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches)) return;
      var cur = null, rect = null;
      document.addEventListener("pointerover", function (e) { var p = e.target.closest && e.target.closest(".poster"); if (p && p !== cur) { cur = p; rect = p.getBoundingClientRect(); G.set(p, { transformPerspective: 700 }); } });
      document.addEventListener("pointermove", function (e) {
        if (!cur || !rect) return;
        var x = (e.clientX - rect.left) / rect.width - 0.5, y = (e.clientY - rect.top) / rect.height - 0.5;
        if (Math.abs(x) > 0.6 || Math.abs(y) > 0.6) { G.to(cur, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.5, ease: E }); cur = null; return; }
        G.to(cur, { rotationY: x * 10, rotationX: -y * 10, scale: 1.03, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      }, { passive: true });
    }
    if (on) document.documentElement.classList.add("gs");
    return { view: view, list: list, screen: screen, sheet: sheet, tilt: tilt, on: on };
  })();

  /* ---------- Cuenta y sincronización (Supabase) ----------
     El móvil guarda una copia; con sesión iniciada, cada cambio va a una cola que se sube a la cuenta.
     La clave es la pública (publishable): la seguridad la ponen las políticas RLS de la base de datos. */
  var SUPA_URL = "https://unengrhtdilebybstggx.supabase.co", SUPA_KEY = "sb_publishable_YBVAFdLXuZSJPTTFZr0UaA_e8sTn4Hj";
  var SUPA_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
  var sb = null, user = null, busy = false, cloudReady = false, rankCache = {};
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); });
  }
  function isUuid(v) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v || ""); }
  function queue(op) { if (!user) return; S.q.push(op); save(); flush(); }
  function profRow() { return { name: S.name || null, prov: S.prov || null, ccaa: S.ccaa || null, public: !!S.pub, updated_at: new Date().toISOString() }; }
  function runOp(op) {
    if (op.t === "mark+") { var m = op.m; return sb.from("marks").upsert({ id: m.id, user_id: user.id, race_id: m.raceId || null, race_name: m.name, km: m.km, sec: m.sec, date: m.date }); }
    if (op.t === "mark-") return sb.from("marks").delete().eq("id", op.id);
    if (op.t === "mine+") return sb.from("signups").upsert({ user_id: user.id, race_id: op.id });
    if (op.t === "mine-") return sb.from("signups").delete().eq("race_id", op.id).eq("user_id", user.id);
    if (op.t === "prof") return sb.from("profiles").update(profRow()).eq("id", user.id);
    return Promise.resolve({});
  }
  function flush() {
    if (!user || busy) return;
    if (!S.q.length) { pull(); return; }
    busy = true;
    runOp(S.q[0]).then(function (res) {
      busy = false;
      if (res && res.error) { console.warn("Runiverso: no se pudo sincronizar", res.error); if (res.error.code && /^(23|22|42)/.test(res.error.code)) { S.q.shift(); save(); } else { setTimeout(flush, 15000); return; } }
      else { S.q.shift(); save(); }
      flush();
    }, function () { busy = false; setTimeout(flush, 15000); });
  }
  function pull() {
    if (!user) return;
    Promise.all([
      sb.from("profiles").select("name,prov,ccaa,public").eq("id", user.id).maybeSingle(),
      sb.from("marks").select("id,race_id,race_name,km,sec,date").eq("user_id", user.id),
      sb.from("signups").select("race_id").eq("user_id", user.id)
    ]).then(function (r) {
      if (r[0].error || r[1].error || r[2].error || S.q.length) return;
      var pf = r[0].data || {};
      if (pf.name) S.name = pf.name; if (pf.prov) S.prov = pf.prov; if (pf.ccaa) S.ccaa = pf.ccaa; S.pub = !!pf.public;
      S.marks = r[1].data.map(function (m) { return { id: m.id, raceId: m.race_id || "", name: m.race_name, km: +m.km, sec: m.sec, date: m.date }; });
      S.mine = {}; r[2].data.forEach(function (x) { if (BY[x.race_id] && daysTo(BY[x.race_id].date) >= -60) S.mine[x.race_id] = true; });
      save(); if (!$("layer").innerHTML) render();
    });
  }
  // Primera vez que se enlaza este móvil con una cuenta: sube lo que ya hubiera guardado aquí
  function link() {
    S.acct = user.id;
    S.marks.forEach(function (m) { if (!isUuid(m.id)) m.id = uuid(); S.q.push({ t: "mark+", m: m }); });
    Object.keys(S.mine).forEach(function (id) { S.q.push({ t: "mine+", id: id }); });
    save();
    sb.from("profiles").select("name,prov,ccaa").eq("id", user.id).maybeSingle().then(function (r) {
      var pf = (r && r.data) || {};
      if (!pf.name && !pf.prov) S.q.push({ t: "prof" }); else { if (!pf.name && S.name) S.q.push({ t: "prof" }); }
      save(); flush();
    }, flush);
  }
  function onSession(session) {
    var was = user; user = session ? session.user : null;
    if (user && S.acct !== user.id) link(); else if (user) flush();
    checkAdmin();
    if (!!was !== !!user && !$("layer").innerHTML) render();
  }
  function initCloud() {
    var sc = document.createElement("script"); sc.src = SUPA_JS; sc.async = true;
    sc.onload = function () {
      if (!window.supabase || !window.supabase.createClient) return;
      sb = window.supabase.createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit", storageKey: "runiverso-auth" } });
      cloudReady = true;
      sb.auth.onAuthStateChange(function (ev, session) { onSession(session); if (ev === "PASSWORD_RECOVERY") setTimeout(function () { authScreen("newpass"); }, 50); });
      sb.auth.getSession().then(function (r) { onSession(r.data && r.data.session); if (view.tab === "comunidad" || view.tab === "perfil") render(); });
    };
    document.head.appendChild(sc);
    window.addEventListener("online", flush);
  }
  function logout() {
    if (!sb) return;
    sb.auth.signOut().finally(function () {
      user = null; S.acct = ""; S.q = []; S.marks = []; S.mine = {}; S.name = ""; S.pub = false; save();
      toast("Sesión cerrada. Tus datos siguen guardados en tu cuenta"); render();
    });
  }
  /* Eliminar la cuenta desde la app (lo exigen Google Play y App Store) */
  function delSheet() {
    openSheet('<h2>Eliminar tu cuenta</h2><p class="muted" style="margin:0">Se borran para siempre y no se pueden recuperar:</p>' +
      '<ul class="dellist"><li>Tu cuenta y tu correo (' + esc(user && user.email || "") + ')</li><li>Tus marcas, medallas y carreras apuntadas</li><li>Tu puesto en el ranking y los avisos en el móvil</li></ul>' +
      '<p class="muted" style="margin:0;font-size:14px">Si has reclamado un resultado de una clasificación, el resultado sigue en la clasificación oficial, pero ya no estará unido a ti.</p>' +
      '<div class="f"><button class="btn wide danger" type="button" data-act="delacct-go">Eliminar mi cuenta para siempre</button><button class="btn alt wide" type="button" data-close="1">Cancelar</button></div>', "Eliminar tu cuenta");
  }
  function deleteAccount(btn) {
    if (!sb || !user) return;
    btn.disabled = true; btn.textContent = "Eliminando…";
    sb.rpc("delete_my_account").then(function (r) {
      if (r.error) throw r.error;
      return sb.auth.signOut().catch(function () {});
    }).then(function () {
      user = null; S.acct = ""; S.q = []; S.marks = []; S.mine = {}; S.name = ""; S.pub = false; S.push = false; save();
      closeSheet(); view.tab = "inicio"; if (location.hash !== "#inicio") location.hash = "#inicio"; else render();
      toast("Tu cuenta y tus datos se han eliminado");
    }).catch(function (e) {
      console.warn("Runiverso eliminar cuenta", e); btn.disabled = false; btn.textContent = "Eliminar mi cuenta para siempre";
      toast("No hemos podido eliminar la cuenta. Inténtalo de nuevo o escríbenos a hola@runiverso.com");
    });
  }
  /* Bienvenida: tres pasos la primera vez */
  var onbStep = 0;
  function onboarding(step) {
    onbStep = step || 0;
    var cc = S.ccaa || "Andalucía", opts = Object.keys(ZONES).sort(function (a, b) { return a.localeCompare(b, "es"); });
    var dots = '<div class="odots" aria-hidden="true">' + [0, 1, 2].map(function (i) { return '<i' + (i === onbStep ? ' class="on"' : '') + '></i>'; }).join("") + '</div>';
    var h = '';
    if (onbStep === 0) {
      h = '<h1>Todas las carreras de Andalucía, en tu bolsillo</h1><p class="asub">Runiverso es el calendario de carreras de running de Andalucía: populares, 5K, 10K, medias y San Silvestres de las ocho provincias, y las grandes citas de España.</p>' +
        '<ul class="aperks"><li>Las carreras de tu provincia primero, con fecha, distancia y web oficial</li><li>Te avisamos en el móvil antes de cada carrera a la que te apuntes</li><li>Guarda tus marcas, gana medallas y sal en el ranking de tu provincia</li></ul>' +
        '<div class="f"><button class="btn wide" type="button" data-onb="1">Empezar</button></div>';
    } else if (onbStep === 1) {
      h = '<h1>¿Dónde sueles correr?</h1><p class="asub">Te enseñamos primero las carreras de tu provincia y de tu comunidad. Puedes cambiarlo cuando quieras.</p>' +
        '<form class="f" id="onbf"><div class="fld"><label for="zc">Comunidad autónoma</label><select id="zc">' + opts.map(function (k) { return '<option' + (k === cc ? " selected" : "") + '>' + esc(k) + '</option>'; }).join("") + '</select></div>' +
        '<div class="fld"><label for="zp">Provincia</label><select id="zp">' + provOpts(cc, S.prov || "Cádiz") + '</select></div>' +
        '<button class="btn wide" type="submit">Siguiente</button><button class="btn alt wide" type="button" data-onb="2">Ver toda España</button></form>';
    } else {
      h = '<h1>Que no se te pase ninguna</h1><p class="asub">Con una cuenta gratis te avisamos antes de cada carrera y tus marcas quedan guardadas aunque cambies de móvil.</p>' +
        '<div class="f"><button class="btn wide" type="button" data-onb="signup">Crear cuenta gratis</button><button class="btn alt wide" type="button" data-onb="done">Ahora no, ver las carreras</button></div>';
    }
    lastFocus = lastFocus || document.activeElement;
    $("layer").innerHTML = '<div class="auth onb" role="dialog" aria-modal="true" aria-label="Bienvenida"><div class="auth-in">' +
      '<div class="abrand"><span class="amark">' + AUTH_ICO + '</span><span class="lw">Runiverso<small>el universo del running</small></span></div>' + dots + h +
      '<p class="alegal">Paso ' + (onbStep + 1) + ' de 3</p></div></div>';
    document.documentElement.classList.add("lock");
    if (motion.screen) motion.screen($("layer").firstChild);
  }
  function onbDone() { S.onb = true; save(); closeSheet(); render(); }
  /* Pantalla de acceso: correo y contraseña, código por correo y (cuando se active) Google */
  var GOOGLE_ON = true;
  var AUTH_ICO = '<svg viewBox="12 12 96 96" aria-hidden="true"><path d="M44 30V90M44 30H64a17 17 0 0 1 0 34H44" fill="none" stroke="#F3F5FA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 64L82 90" fill="none" stroke="#4D7CFF" stroke-width="11" stroke-linecap="round"/></svg>';
  var G_ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.8l4-3z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"/></svg>';
  var authEmail = "";
  function authScreen(mode, err, info) {
    if (!cloudReady) { toast("Sin conexión: inténtalo en un momento"); return; }
    mode = mode || "login";
    var em = esc(authEmail), body = "", title = "", sub = "";
    var errH = err ? '<p class="err" role="alert">' + esc(err) + '</p>' : "", infoH = info ? '<p class="ok" role="status">' + esc(info) + '</p>' : "";
    if (mode === "login" || mode === "signup") {
      var isUp = mode === "signup";
      title = isUp ? "Crea tu cuenta" : "Entra en Runiverso"; sub = isUp ? "Gratis. Tus marcas, medallas y carreras, guardadas para siempre." : "Tus marcas, medallas y carreras, en cualquier móvil.";
      body = (GOOGLE_ON ? '<button class="abtn g" type="button" data-auth="google">' + G_ICO + 'Continuar con Google</button><div class="or"><span>o con tu correo</span></div>' : '') +
        '<div class="seg atabs" role="tablist"><button type="button" role="tab" data-auth="login" aria-selected="' + !isUp + '">Entrar</button><button type="button" role="tab" data-auth="signup" aria-selected="' + isUp + '">Crear cuenta</button></div>' +
        '<form class="f" id="authf" data-mode="' + mode + '" novalidate>' +
        (isUp ? '<div class="fld"><label for="an">Nombre</label><input id="an" type="text" maxlength="40" autocomplete="name" placeholder="Cómo quieres aparecer" value="' + esc(S.name) + '"></div>' : '') +
        '<div class="fld"><label for="ae">Correo electrónico</label><input id="ae" type="email" autocomplete="email" inputmode="email" required value="' + em + '"></div>' +
        '<div class="fld"><label for="ap">Contraseña</label><div class="pw"><input id="ap" type="password" autocomplete="' + (isUp ? "new-password" : "current-password") + '" minlength="8" required' + (isUp ? ' placeholder="Mínimo 8 caracteres"' : '') + '><button type="button" class="eye" data-auth="eye" aria-label="Mostrar contraseña">Ver</button></div></div>' +
        errH + infoH + '<button class="btn wide" type="submit">' + (isUp ? "Crear cuenta" : "Entrar") + '</button></form>' +
        '<div class="alinks">' + (isUp ? '' : '<button type="button" class="link" data-auth="forgot">¿Has olvidado la contraseña?</button>') + '<button type="button" class="link" data-auth="otp">Entrar sin contraseña, con un código</button></div>';
    } else if (mode === "otp" || mode === "forgot") {
      var fg = mode === "forgot";
      title = fg ? "Recupera tu contraseña" : "Entra con un código"; sub = fg ? "Te mandamos un código para crear una contraseña nueva." : "Te mandamos un código de 6 cifras a tu correo. Sin contraseña.";
      body = '<form class="f" id="sendf" data-mode="' + mode + '" novalidate><div class="fld"><label for="ae">Correo electrónico</label><input id="ae" type="email" autocomplete="email" inputmode="email" required value="' + em + '"></div>' + errH +
        '<button class="btn wide" type="submit">Enviarme el código</button></form><div class="alinks"><button type="button" class="link" data-auth="login">Volver a entrar con contraseña</button></div>';
    } else if (mode === "code-email" || mode === "code-signup" || mode === "code-recovery") {
      title = "Revisa tu correo"; sub = 'Hemos enviado un código a ' + em + '. Escríbelo aquí o pulsa el botón del correo.';
      body = '<form class="f" id="codef" data-type="' + mode.slice(5) + '" novalidate><div class="fld"><label for="otp">Código de 6 cifras</label><input id="otp" class="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="8" pattern="[0-9]*" required></div>' + errH + infoH +
        '<button class="btn wide" type="submit">Continuar</button></form><div class="alinks"><button type="button" class="link" data-auth="resend" data-type="' + mode.slice(5) + '">Reenviar el código</button><button type="button" class="link" data-auth="login">Usar otro correo</button></div><p class="ahint">¿No llega? Mira en spam o promociones.</p>';
    } else if (mode === "newpass") {
      title = "Nueva contraseña"; sub = "Elige una contraseña para entrar a partir de ahora.";
      body = '<form class="f" id="newpf" novalidate><div class="fld"><label for="ap">Contraseña nueva</label><div class="pw"><input id="ap" type="password" autocomplete="new-password" minlength="8" required placeholder="Mínimo 8 caracteres"><button type="button" class="eye" data-auth="eye" aria-label="Mostrar contraseña">Ver</button></div></div>' + errH + '<button class="btn wide" type="submit">Guardar contraseña</button></form>';
    }
    lastFocus = lastFocus || document.activeElement;
    $("layer").innerHTML = '<div class="auth" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="auth-in">' +
      '<button class="aclose" type="button" data-close="1" aria-label="Cerrar">×</button>' +
      '<div class="abrand"><span class="amark">' + AUTH_ICO + '</span><span class="lw">Runiverso<small>el universo del running</small></span></div>' +
      '<h1>' + title + '</h1><p class="asub">' + sub + '</p>' +
      (mode === "signup" ? '<ul class="aperks"><li>Tus marcas y medallas, a salvo aunque cambies de móvil</li><li>Ranking de corredores de ' + (S.prov ? esc(S.prov) : "tu provincia") + '</li><li>Tus carreras apuntadas en todos tus dispositivos</li></ul>' : '') +
      body + '<p class="alegal">Al continuar aceptas las <a href="../condiciones/" target="_blank" rel="noopener">condiciones de uso</a> y la <a href="../privacidad/" target="_blank" rel="noopener">política de privacidad</a>. Puedes borrar tu cuenta cuando quieras.</p></div></div>';
    var f = $("layer").querySelector(mode.indexOf("code") === 0 ? "#otp" : "#ae, #ap"); if (f) setTimeout(function () { f.focus(); }, 50);
    if (!authScreen.open) motion.screen($("layer").firstChild); authScreen.open = true; document.documentElement.classList.add("lock");
  }
  function authErr(e) {
    var m = (e && e.message) || "";
    if (/invalid login credentials/i.test(m)) return "Correo o contraseña incorrectos.";
    if (/email not confirmed/i.test(m)) return "confirm";
    if (/already registered|already been registered/i.test(m)) return "Ya hay una cuenta con ese correo. Entra con tu contraseña o con un código.";
    if (/password/i.test(m) && /(least|short|weak)/i.test(m)) return "La contraseña es demasiado corta o sencilla: usa al menos 8 caracteres.";
    if (/rate|limit|seconds|too many/i.test(m)) return "Demasiados intentos seguidos. Espera un minuto y vuelve a probar.";
    if (/token|otp|expired|invalid/i.test(m)) return "Código incorrecto o caducado. Revísalo o pide otro.";
    return "Algo ha fallado. Inténtalo de nuevo en un momento.";
  }
  function busyBtn(form, txt) { var b = form.querySelector("button[type=submit]"); if (b) { b.disabled = true; b.textContent = txt; } }
  function authDone(msg) { closeSheet(); toast(msg || "¡Bienvenido a Runiverso!"); view.tab = "perfil"; if (location.hash !== "#perfil") location.hash = "#perfil"; else render(); }
  function loginSheet() { authScreen("login"); }
  /* Avisos en el móvil (Web Push) */
  var IOS = /iphone|ipad|ipod/i.test(navigator.userAgent), STANDALONE = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
  function pushOK() { return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window; }
  function pushOn() { return S.push && pushOK() && Notification.permission === "granted"; }
  function b64u(str) { var pad = "=".repeat((4 - str.length % 4) % 4), b = atob((str + pad).replace(/-/g, "+").replace(/_/g, "/")), out = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) out[i] = b.charCodeAt(i); return out; }
  function fnCall(body) {
    return sb.auth.getSession().then(function (r) {
      var tk = (r.data && r.data.session && r.data.session.access_token) || SUPA_KEY;
      return fetch(SUPA_URL + "/functions/v1/avisos", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tk, apikey: SUPA_KEY }, body: JSON.stringify(body) }).then(function (res) { return res.json(); });
    });
  }
  function testPush() {
    fnCall({ test: true }).catch(function () {});
  }
  function enablePush() {
    if (!user) { authScreen("signup"); return; }
    if (!pushOK()) { toast(IOS && !STANDALONE ? "En iPhone: añade Runiverso a la pantalla de inicio y ábrela desde allí para recibir avisos" : "Este navegador no permite avisos"); return; }
    Notification.requestPermission().then(function (perm) {
      if (perm !== "granted") { toast("Has bloqueado los avisos. Actívalos en los ajustes del navegador para Runiverso"); return; }
      navigator.serviceWorker.ready.then(function (reg) {
        return reg.pushManager.getSubscription().then(function (ex) {
          if (ex) return ex;
          return fnCall({ key: true }).then(function (k) { if (!k || !k.publicKey) throw new Error("sin clave"); return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(k.publicKey) }); });
        });
      }).then(function (sub) {
        var j = sub.toJSON();
        return sb.from("push_subs").upsert({ endpoint: j.endpoint, user_id: user.id, p256dh: j.keys.p256dh, auth: j.keys.auth });
      }).then(function (r) {
        if (r && r.error) throw r.error;
        S.push = true; save(); render(); toast("¡Avisos activados!"); testPush();
      }).catch(function (e) { console.warn("Runiverso avisos", e); toast("No hemos podido activar los avisos. Inténtalo de nuevo"); });
    });
  }
  function disablePush() {
    var done = function () { S.push = false; save(); render(); toast("Avisos desactivados"); };
    if (!pushOK()) { done(); return; }
    navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      if (!sub) return; var ep = sub.endpoint;
      return sub.unsubscribe().then(function () { return sb.from("push_subs").delete().eq("endpoint", ep); });
    }).then(done, done);
  }
  function pushRow() {
    var on = pushOn();
    return '<div class="pushrow"><span class="pi" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg></span><span class="pt"><b>Avisos de mis carreras</b><span>' +
      (on ? "Activados en este móvil: una semana antes, el día antes y el mismo día." : "Te recordamos cada carrera a la que te apuntes: una semana antes, el día antes y el mismo día.") +
      '</span></span><button class="btn sm' + (on ? ' alt' : '') + '" type="button" data-act="' + (on ? "pushoff" : "pushon") + '">' + (on ? "Desactivar" : "Activar") + '</button></div>';
  }
  function accountCard() {
    if (!user) return '<div class="card acct"><div><h3>Guarda tus marcas en la nube</h3><p>Crea tu cuenta gratis con tu correo: no pierdes nada si cambias de móvil y puedes salir en el ranking de ' + (S.prov ? esc(S.prov) : "tu provincia") + '.</p></div><button class="btn" type="button" data-act="login">Crear cuenta o entrar</button></div>';
    var pend = S.q.length;
    return '<div class="card acct on"><div><h3>' + esc(user.email || "Tu cuenta") + '</h3><p>' + (pend ? "Sincronizando " + pend + (pend === 1 ? " cambio" : " cambios") + "…" : "Todo guardado en tu cuenta ✓") + '</p></div>' +
      '<label class="sw"><input type="checkbox" id="pubtog"' + (S.pub ? " checked" : "") + '><span>Aparecer en el ranking de ' + (S.prov ? esc(S.prov) : "tu provincia") + ' con mi nombre</span></label>' +
      pushRow() + '<div class="row"><button class="btn sm alt" type="button" data-act="logout">Cerrar sesión</button><button class="link danger" type="button" data-act="delacct">Eliminar mi cuenta</button></div></div>';
  }
  function rankingHtml() {
    if (!S.prov) return '<div class="card"><p style="margin:0">Elige tu zona para ver el ranking de tu provincia.</p><button class="btn sm alt" type="button" data-act="zone" style="margin-top:10px">Elegir zona</button></div>';
    var key = S.prov, c = rankCache[key];
    if (!c) {
      rankCache[key] = { loading: true };
      var tries = 0, go = function () {
        if (!sb) { if (++tries > 12) { rankCache[key] = { rows: [], err: true }; delete rankCache[key].loading; if (view.tab === "comunidad" && !$("layer").innerHTML) render(); setTimeout(function () { delete rankCache[key]; }, 100); return; } setTimeout(go, 800); return; }
        sb.from("ranking").select("user_id,name,club,carreras,diezmil,medias,maratones,km").eq("prov", key).order("carreras", { ascending: false }).order("km", { ascending: false }).limit(20)
          .then(function (r) { rankCache[key] = { rows: r.error ? [] : r.data, err: !!r.error }; if (view.tab === "comunidad" && !$("layer").innerHTML) render(); });
      };
      go();
      c = rankCache[key];
    }
    var h = '<div class="sechd"><h2>Ranking de ' + esc(key) + '</h2><span class="muted" style="font-size:12.5px">temporada ' + seasonStart().getFullYear() + '/' + String(seasonStart().getFullYear() + 1).slice(2) + '</span></div>';
    if (c.loading) return h + '<div class="card"><p class="muted" style="margin:0">Cargando ranking…</p></div>';
    var rows = c.rows || [];
    if (!rows.length) h += '<div class="card empty"><p>' + (c.err ? "No hemos podido cargar el ranking. Prueba en un rato." : "Todavía nadie de " + esc(key) + " sale en el ranking. ¡Sé el primero!") + '</p></div>';
    else h += '<ol class="rank">' + rows.map(function (x, i) {
      var me = user && x.user_id === user.id;
      return '<li' + (me ? ' class="me"' : '') + '><span class="pos">' + (i + 1) + '</span><span class="who"><b>' + esc(x.name || "Corredor") + (me ? " (tú)" : "") + '</b><span>' + (x.club ? esc(x.club) + " · " : "") + x.km + ' km</span></span><span class="num"><b>' + x.carreras + '</b><span>' + (x.carreras === 1 ? "carrera" : "carreras") + '</span></span></li>';
    }).join("") + '</ol>';
    if (!user) h += '<button class="btn wide" type="button" data-act="login">Crear cuenta y entrar en el ranking</button>';
    else if (!S.pub) h += '<div class="card"><p style="margin:0 0 10px">Ahora mismo no apareces. Actívalo en tu perfil o aquí:</p><button class="btn sm" type="button" data-act="gopublic">Aparecer en el ranking</button></div>';
    return h;
  }

  /* ---------- Carreras ---------- */
  var RACES = (window.RV_RACES || []).concat(window.RV_SUSP || []).sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; }).map(function (r) { r.date = pd(r.d); r.hay = norm([r.n, r.c, r.r, r.p, r.k].join(" ")); return r; });
  var BY = {}; RACES.forEach(function (r) { BY[r.id] = r; });
  var RESULTS = window.RV_RESULTS || [];
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function upcoming() { return RACES.filter(function (r) { return daysTo(r.date) >= 0; }); }
  var ZONES = window.RV_ZONES || {};
  function ccaaOf(p) { for (var k in ZONES) if (ZONES[k].indexOf(p) >= 0) return k; return ""; }
  var ANDP = ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"];
  /* Colores de cada provincia (los de sus equipos de fútbol, sin escudos ni nombres): franja, color, fondo y texto del contador */
  var PCOL = {
    "Almería": ["repeating-linear-gradient(90deg,#E30613 0 4px,#fff 4px 8px)", "#D10511", "#E30613", "#fff"],
    "Cádiz": ["linear-gradient(#FFD200 0 55%,#0045A0 55%)", "#0045A0", "#FFD200", "#0045A0"],
    "Córdoba": ["repeating-linear-gradient(90deg,#00843D 0 4px,#fff 4px 8px)", "#00843D", "#00843D", "#fff"],
    "Granada": ["repeating-linear-gradient(#D2001F 0 3px,#fff 3px 6px)", "#C8001D", "#D2001F", "#fff"],
    "Huelva": ["repeating-linear-gradient(90deg,#1B3F94 0 4px,#fff 4px 8px)", "#1B3F94", "#1B3F94", "#fff"],
    "Jaén": ["linear-gradient(90deg,#fff 0 60%,#5E2A84 60%)", "#5E2A84", "#5E2A84", "#fff"],
    "Málaga": ["repeating-linear-gradient(90deg,#0099D8 0 4px,#fff 4px 8px)", "#0083BE", "#0099D8", "#fff"],
    "Sevilla": ["linear-gradient(90deg,#D50032 0 50%,#00954C 50%)", "#B8002B", "linear-gradient(90deg,#D50032,#00954C)", "#fff"]
  };
  var ALL_SW = "linear-gradient(#007A33 0 33%,#fff 0 66%,#007A33 0)";
  function pvars(p) { var c = PCOL[p]; return c ? "--sw:" + c[0] + ";--pc:" + c[1] + ";--bb:" + c[2] + ";--bf:" + c[3] : ""; }
  /* Racha: semanas seguidas abriendo la app */
  var STREAK = (function () {
    var K2 = "runiverso-racha", wk = function (d) { var t = new Date(d.getFullYear(), d.getMonth(), d.getDate()); t.setDate(t.getDate() - (t.getDay() + 6) % 7); return Math.round(t / 6048e5); };
    var now = wk(new Date()), o = { n: 1, w: now };
    try { var v = JSON.parse(localStorage.getItem(K2) || "null"); if (v) o = v.w === now ? v : v.w === now - 1 ? { n: v.n + 1, w: now } : { n: 1, w: now }; localStorage.setItem(K2, JSON.stringify(o)); } catch (e) {}
    return o.n;
  })();
  function hello() { var h = new Date().getHours(); return h < 6 ? "Buenas noches" : h < 13 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches"; }
  function andMode() { return !S.ccaa || S.ccaa === "Andalucía"; }
  function curZp() {
    if (!view.zp) view.zp = view.sc === "es" ? "ES" : view.sc === "ccaa" ? "AND" : (ANDP.indexOf(S.prov) >= 0 ? S.prov : "AND");
    return view.zp;
  }
  function inZp(r, zp) { return zp === "ES" ? true : zp === "AND" ? r.r === "Andalucía" : r.p === zp; }
  function inProv(r) { return !!S.prov && r.p === S.prov; }
  function inCcaa(r) { return !!S.ccaa && r.r === S.ccaa; }
  function scopeName(sc) { return sc === "prov" ? (S.prov || "Tu provincia") : sc === "ccaa" ? (S.ccaa || "Tu comunidad") : "España"; }
  /* Orden por cercanía: tu provincia, tu comunidad y luego el resto */
  function near(a, b) { var x = inProv(a) ? 0 : inCcaa(a) ? 1 : 2, y = inProv(b) ? 0 : inCcaa(b) ? 1 : 2; return x - y || a.date - b.date; }
  var KM = { "21K": 21.0975, "42K": 42.195, "10K": 10 };
  var LABEL = { "21K": "Media", "42K": "Maratón", "10K": "10K", "TR": "Trail", "SS": "San Silvestre", "POP": "Popular" };
  var MARK = '<svg viewBox="12 12 96 96" aria-hidden="true"><path d="M44 30V90M44 30H64a17 17 0 0 1 0 34H44" fill="none" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 64L82 90" fill="none" stroke="#4D7CFF" stroke-width="11" stroke-linecap="round"/></svg>';

  var DIAS_C = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  function distTxt(r) { var d = String(r.dist || "").replace(/^Trail · /, ""); return /^(Trail|Popular|San Silvestre)$/.test(d) ? "" : d; }
  /* Cada carrera es un dorsal: banda de color por prueba, imperdibles, el día en grande */
  function poster(r, tag, extra) {
    var C = window.CARTELES || {};
    var at = ' data-k="' + r.k + '" data-race="' + r.id + '" type="button" aria-label="' + esc(r.n) + ': ver ficha"';
    var t = tag || (r.s ? '<span class="tag">Suspendida</span>' : S.mine[r.id] ? '<span class="tag mine">Apuntada</span>' : (r.ok ? '' : '<span class="tag">Por confirmar</span>'));
    if (C[r.id]) return '<button class="poster img"' + at + ' style="padding:0"><img src="../carteles/' + C[r.id] + '" alt="" style="width:100%;height:100%;object-fit:cover">' + t + '</button>';
    var dist = distTxt(r);
    return '<button class="poster bib"' + at + (extra || "") + '><span class="bb">' + LABEL[r.k] + (dist ? '<span>' + esc(dist) + '</span>' : '') + '</span>' +
      '<span class="bbody"><span class="bn">' + pad(r.date.getDate()) + '</span><span class="bm">' + MES_C[r.date.getMonth()] + ' · ' + DIAS_C[r.date.getDay()] + '</span>' +
      '<span class="pn">' + esc(r.n) + '</span><span class="pc">' + esc(r.c) + '</span></span>' + t + '</button>';
  }
  /* Fila tipo entrada para listas */
  function item(r) {
    var C = window.CARTELES || {}, dist = distTxt(r), st = r.s ? '<span class="tks">Suspendida</span>' : S.mine[r.id] ? '<span class="tks mine">Apuntada</span>' : (r.ok ? '' : '<span class="tks">Por confirmar</span>');
    return '<button class="tk" type="button" data-k="' + r.k + '" data-race="' + r.id + '" aria-label="' + esc(r.n) + ': ver ficha">' +
      '<span class="tkd"><b>' + r.date.getDate() + '</b><span>' + MES_C[r.date.getMonth()] + '</span></span>' +
      '<span class="tkb"><b>' + esc(r.n) + '</b><span>' + esc(r.c) + (r.p && r.c.indexOf(r.p) < 0 ? ', ' + esc(r.p) : '') + '</span>' +
      '<span class="tkm"><i></i>' + LABEL[r.k] + (dist ? ' · ' + esc(dist) : '') + (r.h ? ' · ' + esc(r.h) : '') + st + '</span></span>' +
      (C[r.id] ? '<img class="tki" src="../carteles/' + C[r.id] + '" alt="">' : '') + '</button>';
  }
  /* Próximos 14 días: los días con carrera llevan punto; al tocar uno, sus carreras debajo */
  function weekStrip(pool) {
    var days = [], i, d, firstWith = -1;
    for (i = 0; i < 14; i++) {
      d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      var rs = pool.filter(function (r) { return r.date.getTime() === d.getTime(); });
      if (rs.length && firstWith < 0) firstWith = i;
      days.push({ d: d, rs: rs });
    }
    if (view.day == null || view.day < 0) view.day = firstWith < 0 ? 0 : firstWith;
    var sel = days[view.day];
    var h = '<div class="wk" role="tablist" aria-label="Próximos 14 días">' + days.map(function (x, k) {
      return '<button type="button" role="tab" class="wd" data-day="' + k + '" aria-selected="' + (k === view.day) + '"' + (x.rs.length ? '' : ' data-none="1"') + '><span>' + (k === 0 ? "hoy" : DIAS_C[x.d.getDay()]) + '</span><b>' + x.d.getDate() + '</b><i>' + (x.rs.length ? new Array(Math.min(3, x.rs.length) + 1).join("<em></em>") : "") + '</i></button>';
    }).join("") + '</div>';
    h += '<div class="tklist" id="wkl">' + (sel.rs.length ? sel.rs.slice(0, 5).map(item).join("") : '<p class="tkempty">' + (view.day === 0 ? "Hoy" : cap(DIAS_L[sel.d.getDay()]) + " " + sel.d.getDate()) + ' no hay carreras' + (S.prov ? ' en ' + esc(S.prov) : '') + '.</p>') + '</div>';
    return h;
  }

  /* ---------- Marcas ---------- */
  var DKEYS = [[5, "5K"], [10, "10K"], [21.0975, "21K"], [42.195, "42K"]];
  function dLabel(km) { for (var i = 0; i < DKEYS.length; i++) if (Math.abs(DKEYS[i][0] - km) < 0.05) return DKEYS[i][1]; return (Math.round(km * 10) / 10 + " km").replace(".", ","); }
  function prs() { var b = {}; S.marks.forEach(function (m) { var l = dLabel(m.km); if (!b[l] || m.sec < b[l].sec) b[l] = m; }); return b; }
  /* Predicción de tiempos (fórmula de Riegel): usa la marca de distancia más parecida */
  function predict(km) {
    var best = null;
    S.marks.forEach(function (m) {
      if (daysTo(pd(m.date)) < -730) return;
      var t = m.sec * Math.pow(km / m.km, 1.06), w = Math.abs(Math.log(km / m.km));
      if (!best || w < best.w - 1e-9 || (Math.abs(w - best.w) < 1e-9 && t < best.sec)) best = { sec: t, from: m, w: w };
    });
    return best;
  }
  function seasonMarks() { var s = seasonStart(); return S.marks.filter(function (m) { return pd(m.date) >= s; }); }

  /* ---------- Navegación ---------- */
  var TABS = [
    ["inicio", "Inicio", "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"],
    ["carreras", "Carreras", "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4"],
    ["perfil", "Perfil", "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"],
    ["clasificaciones", "Resultados", "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"],
    ["comunidad", "Comunidad", "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11.5a2.5 2.5 0 1 0 0-5M15 14.5c3 0 6 2 6 5.5"]
  ];
  var view = { tab: "inicio", sub: "marcas", f: "", q: "", lim: 30, sc: S.prov ? "prov" : "es" };
  function route() {
    if ($("layer").innerHTML) closeSheet();
    var h = (location.hash || "#inicio").slice(1).split("?");
    var t = h[0]; if (!TABS.some(function (x) { return x[0] === t; })) t = "inicio";
    view.tab = t;
    if (h[1]) { var m = /sc=(prov|ccaa|es)/.exec(h[1]); if (m) { view.sc = m[1]; view.zp = ""; view.f = ""; view.lim = 30; } var fm = /f=(\w+)/.exec(h[1]); if (fm) { view.f = fm[1]; view.lim = 30; } }
    render(); window.scrollTo(0, 0);
  }
  function renderTabs() {
    $("tabbar").innerHTML = TABS.map(function (t) {
      return '<a href="#' + t[0] + '"' + (view.tab === t[0] ? ' aria-current="page"' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + t[2] + '"/></svg>' + t[1] + '</a>';
    }).join("");
    var ini = (S.name || "?").split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
    $("topav").textContent = ini; $("topav").classList.toggle("on", !!user); $("topav").setAttribute("aria-label", user ? "Mi perfil (sesión iniciada)" : "Mi perfil");
  }
  document.addEventListener("keydown", function (e) {
    var t = e.target; if (!t || !t.getAttribute || !t.getAttribute("data-zp") || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault(); t.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  var TTL = { inicio: "Inicio", carreras: "Carreras", perfil: "Perfil", clasificaciones: "Resultados", comunidad: "Comunidad" };
  (function () {
    var on = false;
    window.addEventListener("scroll", function () { var v = window.scrollY > 64; if (v !== on) { on = v; document.documentElement.classList.toggle("scrolled", v); } }, { passive: true });
  })();
  function render() {
    renderTabs();
    if ($("ttl")) $("ttl").textContent = TTL[view.tab] || "";
    var fn = { inicio: vInicio, carreras: vCarreras, perfil: vPerfil, clasificaciones: vResultados, comunidad: vComunidad }[view.tab];
    $("main").innerHTML = '<div class="view">' + fn() + '</div>';
    fx3d();
    var vk = view.tab + "/" + view.sub; if (vk !== lastView) { lastView = vk; motion.view($("main").firstChild); }
    if (!S.onb && !zoneAsked && !$("layer").innerHTML) { zoneAsked = true; onboarding(0); }
    else if (!S.prov && !zoneAsked && !$("layer").innerHTML) { zoneAsked = true; zoneSheet(true); }
  }
  /* ---------- Efectos 3D: carrusel de carteles, relieve del mapa e inclinación de tarjetas ---------- */
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, tiltG = { x: 0, y: 0 };
  function cfUpdate(el) {
    var mid = el.scrollLeft + el.clientWidth / 2, its = el.children;
    for (var i = 0; i < its.length; i++) {
      var it = its[i], d = (it.offsetLeft + it.offsetWidth / 2 - mid) / it.offsetWidth, a = Math.max(-1.6, Math.min(1.6, d)), c = it.firstChild;
      c.style.transform = "rotateY(" + (-a * 38).toFixed(1) + "deg) translateZ(" + (-Math.abs(a) * 70).toFixed(0) + "px) scale(" + (1 - Math.min(.22, Math.abs(a) * .14)).toFixed(3) + ")";
      it.style.zIndex = String(100 - Math.round(Math.abs(a) * 10));
      it.classList.toggle("mid", Math.abs(a) < .5);
    }
  }
  function tiltApply(el, x, y) { el.style.setProperty("--ry", (x * 9).toFixed(2) + "deg"); el.style.setProperty("--rx", (-y * 7).toFixed(2) + "deg"); el.style.setProperty("--gx", (50 + x * 50).toFixed(0) + "%"); el.style.setProperty("--gy", (50 + y * 50).toFixed(0) + "%"); }
  function fx3d() {
    if (RM) return;
    var cf = document.querySelector("[data-cf]");
    if (cf) {
      var tick = false; cf.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; cfUpdate(cf); }); } }, { passive: true });
      requestAnimationFrame(function () { if (cf.children[1]) cf.scrollLeft = cf.children[1].offsetLeft - (cf.clientWidth - cf.children[1].offsetWidth) / 2; cfUpdate(cf); });
    }
    [].forEach.call(document.querySelectorAll(".nx:not(.empty), [data-tilt]"), function (el) {
      el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); tiltApply(el, ((e.clientX - r.left) / r.width - .5) * 2, ((e.clientY - r.top) / r.height - .5) * 2); });
      el.addEventListener("pointerleave", function () { tiltApply(el, tiltG.x, tiltG.y); });
      tiltApply(el, tiltG.x, tiltG.y);
    });
  }
  /* En Android el móvil inclina las tarjetas al moverlo (iOS pide permiso: ahí se usa el dedo) */
  if (!RM && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function") {
    var b0 = null;
    window.addEventListener("deviceorientation", function (e) {
      if (e.gamma == null) return; if (b0 == null) b0 = e.beta;
      tiltG.x = Math.max(-1, Math.min(1, e.gamma / 25)); tiltG.y = Math.max(-1, Math.min(1, (e.beta - b0) / 25));
      [].forEach.call(document.querySelectorAll(".nx:not(.empty), [data-tilt]"), function (el) { tiltApply(el, tiltG.x, tiltG.y); });
    }, { passive: true });
  }
  var zoneAsked = false, lastView = "";
  function zoneChip() {
    return '<button class="zone" type="button" data-act="zone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>' +
      (S.prov ? esc(S.prov) + (S.ccaa && S.ccaa !== S.prov ? '<span> · ' + esc(S.ccaa) + '</span>' : '') : 'Elige tu zona') + '<em>Cambiar</em></button>';
  }

  /* ---------- Inicio ---------- */
  var deferredInstall = null;
  function installBanner() {
    var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    if (standalone) return "";
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (deferredInstall) return '<div class="install"><p><b>Instala Runiverso</b> en tu pantalla de inicio y ábrela como una app.</p><button class="btn sm" type="button" data-act="install">Instalar</button></div>';
    if (ios) return '<div class="install"><p><b>Instálala en tu iPhone:</b> pulsa Compartir y luego «Añadir a pantalla de inicio».</p></div>';
    return "";
  }
  function vInicio() {
    var up = upcoming();
    var mine = up.filter(function (r) { return S.mine[r.id] && !r.s; });
    var h = installBanner();
    up.filter(function (r) { return S.mine[r.id] && r.s; }).forEach(function (r) {
      h += '<button class="susp" type="button" data-race="' + r.id + '"><b>' + esc(r.n) + ': suspendida</b><span>Toca para ver los detalles. Consulta la devolución de la inscripción con la organización.</span></button>';
    });
    var C = window.CARTELES || {}, nm = S.name ? ", " + esc(S.name.split(" ")[0]) : "";
    h += '<div class="hey"><div><p class="hi">' + hello() + nm + ' 👋</p><h1 class="ht">¿Dónde corremos?</h1></div>' +
      '<div class="stk" title="Semanas seguidas en Runiverso"><svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2A541"/><stop offset="1" stop-color="#E8622C"/></linearGradient></defs><path fill="url(#fg)" d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1.2-4 2.5-5 .2 1.6 1 2.6 2 3-.6-3.3.5-6.5.5-9z"/></svg><b>' + STREAK + '</b><span>' + (STREAK === 1 ? "semana" : "semanas") + '</span></div></div>';
    h += '<div class="row" style="margin-top:-4px">' + zoneChip() + (S.name ? '' : '<button class="btn sm alt" type="button" data-act="name">Pon tu nombre</button>') + '</div>';
    if (mine.length) {
      var r = mine[0], d = daysTo(r.date), pct = Math.max(6, Math.min(100, Math.round((1 - d / 30) * 100)));
      h += '<button class="nx" type="button" data-race="' + r.id + '" style="' + pvars(r.p) + '">' + (C[r.id] ? '<img class="nxp" src="../carteles/' + C[r.id] + '" alt="">' : '<span class="nxp nxb"><b>' + pad(r.date.getDate()) + '</b>' + MES_C[r.date.getMonth()] + '</span>') +
        '<span class="nxt"><span class="nxk">Tu próxima carrera</span><span class="nxn">' + esc(r.n) + '</span><span class="nxm">' + esc(r.c) + ' · ' + esc(distTxt(r) || LABEL[r.k]) + (r.h ? ' · ' + esc(r.h) : '') + '</span></span>' +
        '<span class="nxbar"><i style="width:' + pct + '%"></i></span><span class="nxf"><span class="nxd"><b>' + (d === 0 ? "¡Hoy!" : d) + '</b>' + (d === 0 ? "a correr" : d === 1 ? "día para la salida" : "días para la salida") + '</span><span class="nxgo">Ver ficha</span></span>' +
        (KM[r.k] && S.marks.length ? '<span class="est">Tu tiempo estimado: <b>≈ ' + fmtT(predict(KM[r.k]).sec) + '</b></span>' : '') + '</button>';
    } else {
      h += '<div class="nx empty"><span class="nxk">Tu próxima carrera</span><span class="nxn">Elige tu próximo dorsal</span><span class="nxm">Pulsa «Apuntarme» en cualquier carrera y aquí verás la cuenta atrás.</span><a class="nxgo" href="#carreras">Ver carreras</a></div>';
    }
    var past = RACES.filter(function (x) { return S.mine[x.id] && daysTo(x.date) < 0; }), lastM = S.marks.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; })[0];
    var last = past.length ? past[past.length - 1] : (lastM && BY[lastM.raceId]) || null, goal = mine[1] || null;
    var cell = function (lab, cls, r2, empty) {
      return '<div class="tc"><small class="' + cls + '">' + lab + '</small>' + (r2 ? '<button class="tcp" type="button" data-race="' + r2.id + '" style="' + pvars(r2.p) + '">' + (C[r2.id] ? '<img src="../carteles/' + C[r2.id] + '" alt="">' : '<span class="tcb"><b>' + r2.date.getDate() + '</b>' + MES_C[r2.date.getMonth()] + '</span>') + (r2.s ? '<em>SUSPENDIDA</em>' : '') + '</button><span class="tcn">' + esc(r2.n) + '</span>' : empty) + '</div>';
    };
    h += '<div class="tmp"><p class="tml">⇆ Tu temporada</p><div class="tri">' +
      cell("Última", "c1", last, '<a class="tce" href="#perfil">¿Ya corriste alguna?<b>Añade tu marca</b></a>') +
      cell("Próxima", "c2", mine[0], '<a class="tce" href="#carreras">Sin dorsal todavía<b>Elige una</b></a>') +
      cell("Objetivo", "c3", goal, '<a class="tce" href="#carreras?f=SS"><b class="pl">+</b>Elige tu San Silvestre</a>') + '</div></div>';
    if (andMode()) {
      var ex = view.ex || "", sat = new Date(today); sat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7)); var sun = new Date(sat); sun.setDate(sat.getDate() + 1);
      var finde = up.filter(function (x) { return x.r === "Andalucía" && x.date >= today && x.date <= sun; });
      var cfs = finde.filter(function (x) { return C[x.id] && !x.s; });
      if (cfs.length >= 3) h += '<div class="sec"><div class="sechd"><h2>Carteles del finde</h2><span class="muted" style="font-size:13px;font-weight:700">' + cfs.length + ' oficiales</span></div><div class="cf" data-cf>' +
        cfs.map(function (x) { return '<button class="cfi" type="button" data-race="' + x.id + '" style="' + pvars(x.p) + '" aria-label="' + esc(x.n) + '"><span class="cfc"><img src="../carteles/' + C[x.id] + '" alt="" loading="lazy"><i></i></span><b>' + esc(x.n) + '</b><small>' + esc(x.p) + ' · ' + DIAS_C[x.date.getDay()] + ' ' + x.date.getDate() + '</small></button>'; }).join("") + '</div></div>';
      h += '<div class="sec"><div class="sechd"><h2>Explora</h2><a href="#carreras">Calendario</a></div><p class="muted" style="margin:-6px 0 0">Carreras de este finde en Andalucía</p>' +
        '<div class="pchips" role="group" aria-label="Provincia"><button type="button" data-ex=""' + (ex ? '' : ' aria-pressed="true"') + '><i style="background:' + ALL_SW + '"></i>Todas</button>' +
        ANDP.map(function (p) { return '<button type="button" data-ex="' + p + '"' + (ex === p ? ' aria-pressed="true"' : '') + ' style="' + pvars(p) + '"><i></i>' + p + '</button>'; }).join("") + '</div>';
      var provs = ex ? [ex] : ANDP.filter(function (p) { return finde.some(function (x) { return x.p === p; }); });
      if (!provs.length) h += '<div class="card empty"><p>Este finde no hay carreras en Andalucía. Mira el calendario para las próximas.</p></div>';
      provs.forEach(function (p) {
        var rs = finde.filter(function (x) { return x.p === p; });
        if (!rs.length) rs = up.filter(function (x) { return x.p === p; }).slice(0, 3);
        h += '<div class="pcard" style="' + pvars(p) + '"><div class="pch"><i></i>' + p + '<span>' + (finde.some(function (x) { return x.p === p; }) ? rs.length + ' este finde' : 'próximas') + '</span></div>' +
          rs.slice(0, 4).map(function (x) { return '<button class="pr2" type="button" data-race="' + x.id + '">' + (C[x.id] ? '<img src="../carteles/' + C[x.id] + '" alt="">' : '<span class="ph">' + (LABEL[x.k] || "").slice(0, 7) + '</span>') + '<span><b>' + esc(x.n) + '</b><span>' + esc(x.c) + (distTxt(x) ? ' · ' + esc(distTxt(x)) : '') + ' · ' + DIAS_C[x.date.getDay()] + ' ' + x.date.getDate() + (x.h ? ', ' + esc(x.h) : '') + (x.s ? ' · suspendida' : '') + '</span></span></button>'; }).join("") + '</div>';
      });
      h += '</div>';
    }
    var pool = S.prov ? up.filter(inProv) : up;
    h += '<div class="sec"><div class="sechd"><h2>' + (S.prov ? 'Próximos días en ' + esc(S.prov) : 'Próximos días') + '</h2><a href="#carreras' + (S.prov ? '?sc=prov' : '') + '">Calendario</a></div><div id="wkw">' + weekStrip(pool) + '</div></div>';
    var sm = seasonMarks(), km = sm.reduce(function (a, m) { return a + m.km; }, 0);
    h += '<div class="sec"><div class="sechd"><h2>Tus números ' + String(seasonStart().getFullYear()).slice(2) + '/' + String(seasonStart().getFullYear() + 1).slice(2) + '</h2><a href="#perfil">Mis marcas</a></div><div class="stats">' +
      '<div class="stat"><b>' + sm.length + '</b><span>Carreras</span></div><div class="stat"><b>' + Math.round(km) + '</b><span>Kilómetros</span></div><div class="stat"><b>' + S.marks.length + '</b><span>Medallas</span></div></div></div>';
    if (S.prov && !andMode()) {
      var lp = up.filter(inProv), lc = up.filter(function (r) { return inCcaa(r) && !inProv(r); });
      h += '<div class="sec"><div class="sechd"><h2>En ' + esc(S.prov) + '</h2><a href="#carreras?sc=prov">Ver ' + lp.length + '</a></div>' + (lp.length ? '<div class="hscroll">' + lp.slice(0, 10).map(function (r) { return poster(r); }).join("") + '</div>' : '<div class="card empty"><p>Aún no tenemos carreras en ' + esc(S.prov) + '. ¿Conoces alguna? Avísanos en el canal y la añadimos.</p></div>') + '</div>';
      if (S.ccaa !== S.prov) h += '<div class="sec"><div class="sechd"><h2>Resto de ' + esc(S.ccaa) + '</h2><a href="#carreras?sc=ccaa">Ver ' + lc.length + '</a></div>' + (lc.length ? '<div class="hscroll">' + lc.slice(0, 10).map(function (r) { return poster(r); }).join("") + '</div>' : '<p class="muted" style="margin:0">Sin más carreras en tu comunidad de momento.</p>') + '</div>';
      var rest = up.filter(function (r) { return !inCcaa(r); }).length;
      h += '<a class="card" href="#carreras?sc=es" style="text-decoration:none;display:flex;gap:14px;align-items:center"><span class="zic">ES</span><span style="flex:1;min-width:0"><b style="font-family:var(--display);font-size:17px;letter-spacing:-.02em">Resto de España</b><br><span class="muted" style="font-size:13.5px">' + rest + ' carreras fuera de tu comunidad</span></span></a>';
    } else if (andMode()) {
      h += '<a class="card" href="#carreras?sc=es" style="text-decoration:none;display:flex;gap:14px;align-items:center"><span class="zic">ES</span><span style="flex:1;min-width:0"><b style="font-family:var(--display);font-size:17px">Resto de España</b><br><span class="muted" style="font-size:13.5px">' + up.filter(function (r) { return r.r !== "Andalucía"; }).length + ' carreras fuera de Andalucía</span></span></a>';
    } else {
      h += '<div class="sec"><div class="sechd"><h2>Próximas carreras</h2><a href="#carreras">Ver todas</a></div><div class="hscroll">' + up.slice(0, 10).map(function (r) { return poster(r); }).join("") + '</div></div>';
    }
    h += canalCard("Avisos de dorsales en WhatsApp", "Cuándo abren y suben las inscripciones" + (S.prov ? " en " + esc(S.prov) : "") + ", horarios y novedades. Gratis.");
    if (RESULTS.length) {
      h += '<div class="sec"><div class="sechd"><h2>Últimos resultados</h2><a href="#clasificaciones">Ver todos</a></div><div class="list">' + RESULTS.slice().sort(function (a, b) { return near({ p: a.p, r: ccaaOf(a.p), date: -pd(a.d) }, { p: b.p, r: ccaaOf(b.p), date: -pd(b.d) }); }).slice(0, 3).map(resLi).join("") + '</div></div>';
    }
    h += '<p class="foot">Calendario completo y mapa en <a href="../">runiverso.com</a></p>';
    return h;
  }
  function resLi(r) {
    var d = pd(r.d);
    return '<a class="li" href="' + esc(r.url) + '" target="_blank" rel="noopener" style="text-decoration:none"><span class="dt"><b>' + d.getDate() + '</b><span>' + MES_C[d.getMonth()] + '</span></span><span class="tx"><b>' + esc(r.n) + '</b><span>' + esc(r.c) + ' · ' + d.getFullYear() + '</span></span><span class="btn sm">Clasificación</span></a>';
  }

  /* ---------- Carreras ---------- */
  var CHIPS = [["", "Todas"], ["21K", "Medias"], ["42K", "Maratones"], ["10K", "10K"], ["TR", "Trail"], ["SS", "San Silvestre"], ["POP", "Populares"], ["mine", "Apuntadas"]];
  function filtered() {
    var q = norm(view.q.trim()).split(/\s+/).filter(Boolean), sc = S.prov ? view.sc : "es", zp = andMode() ? curZp() : "";
    return upcoming().filter(function (r) {
      if (zp && !q.length && !inZp(r, zp)) return false;
      if (zp) { if (view.f === "mine" && !S.mine[r.id]) return false; if (view.f && view.f !== "mine" && r.k !== view.f) return false; for (var j = 0; j < q.length; j++) if (r.hay.indexOf(q[j]) < 0) return false; return true; }
      if (!q.length && sc === "prov" && !inProv(r)) return false;
      if (!q.length && sc === "ccaa" && !inCcaa(r)) return false;
      if (view.f === "mine" && !S.mine[r.id]) return false;
      if (view.f && view.f !== "mine" && r.k !== view.f) return false;
      for (var i = 0; i < q.length; i++) if (r.hay.indexOf(q[i]) < 0) return false;
      return true;
    });
  }
  function vCarreras() {
    var list = filtered(), up = upcoming();
    var h = '<div><h1>Carreras</h1><div class="row" style="margin-top:8px">' + zoneChip() + '</div></div>';
    if (andMode()) {
      h += zpMap(up) + zpTabs(up) + zpSummary(up);
    } else if (S.prov) {
      var n = { prov: up.filter(inProv).length, ccaa: up.filter(inCcaa).length, es: up.length };
      h += '<div class="seg" role="tablist" aria-label="Zona">' + ["prov", "ccaa", "es"].filter(function (k) { return k !== "ccaa" || S.ccaa !== S.prov; }).map(function (k) {
        return '<button type="button" role="tab" data-sc="' + k + '" aria-selected="' + (view.sc === k) + '">' + esc(scopeName(k)) + '<span class="n">' + n[k] + '</span></button>';
      }).join("") + '</div>';
    }
    h += '<label class="sr" for="q">Buscar carrera o ciudad</label><input id="q" class="search" type="search" placeholder="Busca en toda España: carrera o ciudad" value="' + esc(view.q) + '" autocomplete="off">';
    h += '<div class="chips" role="group" aria-label="Tipo de prueba">' + CHIPS.map(function (c) { return '<button type="button" class="chip" data-f="' + c[0] + '" aria-pressed="' + (view.f === c[0]) + '">' + c[1] + '</button>'; }).join("") + '</div>';
    h += '<p class="count" id="cnt">' + countText(list) + '</p>';
    h += '<div id="rlist">' + raceGrid(list) + '</div>';
    return h;
  }
  function zpName(zp) { return zp === "AND" ? "Andalucía" : zp === "ES" ? "España" : zp; }
  function countText(list) { return list.length + (list.length === 1 ? " carrera" : " carreras") + (view.q.trim() ? " en toda España" : andMode() ? " · " + zpName(curZp()) : S.prov ? " · " + scopeName(view.sc) : ""); }
  /* Mapa de Andalucía: cada provincia con sus carreras; tocar para elegir */
  function zpMap(up) {
    var M = window.RV_MAP; if (!M) return "";
    var zp = curZp(), cnt = {}, max = 1;
    ANDP.forEach(function (p) { cnt[p] = up.filter(function (r) { return r.p === p; }).length; max = Math.max(max, cnt[p]); });
    var paths = "", labels = "";
    ANDP.forEach(function (p) {
      var g = M.p[p]; if (!g) return;
      var lv = cnt[p] ? Math.min(4, 1 + Math.floor(3 * cnt[p] / max)) : 0, on = zp === p;
      paths += '<path class="mp l' + lv + (on ? ' on' : '') + '" style="' + pvars(p) + '" d="' + g.d + '" data-zp="' + p + '" role="button" tabindex="0" aria-label="' + p + ': ' + cnt[p] + ' carreras" aria-pressed="' + on + '"></path>';
      labels += '<g class="ml' + (on ? ' inv up' : '') + '" transform="translate(' + g.x + ' ' + g.y + ')"><text y="-4">' + p + '</text><text class="mn" y="17">' + cnt[p] + '</text></g>';
    });
    var base = ""; for (var bi = 12; bi >= 2; bi -= 2) base += '<use href="#mapg" class="mb" transform="translate(0 ' + bi + ')"></use>';
    return '<div class="mapc m3d' + (zp === "AND" ? ' all' : '') + '" data-tilt="map"><svg viewBox="0 -14 ' + M.w + ' ' + (M.h + 30) + '" role="group" aria-label="Mapa de Andalucía: elige una provincia"><g aria-hidden="true">' + base + '</g><g id="mapg">' + paths + '</g><g aria-hidden="true">' + labels + '</g></svg></div>';
  }
  function zpTabs(up) {
    var zp = curZp(), n = function (z) { return up.filter(function (r) { return inZp(r, z); }).length; };
    return '<div class="ztabs" role="tablist" aria-label="Zona">' + ["AND"].concat(ANDP).concat(["ES"]).map(function (z) {
      return '<button type="button" role="tab" data-zp="' + z + '" aria-selected="' + (zp === z) + '"' + (z === "ES" ? ' class="es"' : '') + (PCOL[z] ? ' style="' + pvars(z) + '"' : '') + '><i style="background:' + (z === "AND" ? ALL_SW : z === "ES" ? "linear-gradient(#C60B1E 0 25%,#FFC400 25% 75%,#C60B1E 75%)" : "var(--sw)") + '"></i>' + zpName(z) + '<span>' + n(z) + '</span></button>';
    }).join("") + '</div>';
  }
  function zpSummary(up) {
    var zp = curZp(); if (zp === "ES") return "";
    var rs = up.filter(function (r) { return inZp(r, zp) && !r.s; }); if (!rs.length) return "";
    var big = rs.filter(function (r) { return r.k === "21K" || r.k === "42K"; }), nx = big.filter(function (r) { return r.ok; })[0] || big[0] || rs[0], d = daysTo(nx.date);
    var dow = today.getDay(), sat = new Date(today.getFullYear(), today.getMonth(), today.getDate() + ((6 - dow + 7) % 7)), sun = new Date(sat.getFullYear(), sat.getMonth(), sat.getDate() + 1);
    if (dow === 0) { sun = new Date(today); sat = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1); }
    var fin = rs.filter(function (r) { return r.date.getTime() === sat.getTime() || r.date.getTime() === sun.getTime(); }).length;
    var by = {}; rs.forEach(function (r) { by[r.k] = (by[r.k] || 0) + 1; });
    var TY = [["21K", "Medias"], ["42K", "Maratones"], ["10K", "10K"], ["POP", "Populares"], ["SS", "San Silvestres"], ["TR", "Trail"]];
    return '<div class="zsum"' + (PCOL[zp] ? ' style="' + pvars(zp) + '"' : '') + '><button type="button" class="zsn" data-race="' + nx.id + '" data-k="' + nx.k + '"><span class="zcd"><b>' + (d === 0 ? "Hoy" : d) + '</b>' + (d === 0 ? "" : d === 1 ? "día" : "días") + '</span><span class="zt"><small>Próxima gran cita en ' + esc(zpName(zp)) + '</small><b>' + esc(nx.n) + '</b><span>' + cap(fdate(nx.date)) + ' · ' + esc(nx.c) + '</span></span></button>' +
      '<div class="zst"><span><b>' + fin + '</b>' + (fin === 1 ? "carrera" : "carreras") + ' este finde</span>' + TY.filter(function (t) { return by[t[0]]; }).map(function (t) { return '<span><b>' + by[t[0]] + '</b>' + t[1] + '</span>'; }).join("") + '</div></div>';
  }
  /* Agrupa: en tu provincia por meses; en tu comunidad por provincias (la tuya primero); en España por comunidades (la tuya primero) */
  function raceGrid(list) {
    if (!list.length) return '<div class="card empty"><p>' + (view.f === "mine" ? "Aún no te has apuntado a ninguna carrera." : "No hay carreras con ese filtro" + (S.prov && view.sc !== "es" ? " en " + esc(scopeName(view.sc)) + "." : ".")) + '</p>' + (S.prov && view.sc !== "es" ? '<button class="btn sm alt" type="button" data-sc="es">Ver toda España</button>' : '') + '</div>';
    var sc = andMode() ? (curZp() === "ES" && !view.q.trim() ? "es" : "month") : S.prov && !view.q.trim() ? view.sc : "month", key, groups = [], idx = {};
    list.forEach(function (r) {
      key = sc === "ccaa" ? r.p : sc === "es" ? r.r : (MES_L[r.date.getMonth()] + " " + r.date.getFullYear());
      if (!(key in idx)) { idx[key] = groups.length; groups.push({ k: key, items: [] }); }
      groups[idx[key]].items.push(r);
    });
    if (sc === "ccaa" || sc === "es") {
      var mineK = sc === "ccaa" ? S.prov : S.ccaa;
      groups.sort(function (a, b) { return (b.k === mineK) - (a.k === mineK) || b.items.length - a.items.length || a.k.localeCompare(b.k, "es"); });
    }
    var left = view.lim, out = "";
    groups.forEach(function (g) {
      if (left <= 0) return;
      var it = g.items.slice(0, left); left -= it.length;
      out += '<section class="grp"><h2 class="gh">' + cap(esc(g.k)) + '<span>' + g.items.length + '</span></h2><div class="tklist">' + it.map(item).join("") + '</div></section>';
    });
    var shown = view.lim - Math.max(0, left);
    return out + (list.length > shown ? '<button class="btn alt wide" type="button" data-act="more" style="margin-top:16px">Ver más (' + (list.length - shown) + ')</button>' : '');
  }

  /* ---------- Perfil ---------- */
  function vPerfil() {
    var ini = (S.name || "?").split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
    var h = '<div class="prof"><span class="av">' + esc(ini) + '</span><span class="nm"><h1 style="font-size:26px">' + (S.name ? esc(S.name) : "Tu perfil") + '</h1><button type="button" data-act="name">' + (S.name ? "Cambiar nombre" : "Pon tu nombre") + '</button></span></div>';
    h += '<div class="seg" role="tablist" aria-label="Perfil">' + [["marcas", "Mis marcas"], ["vitrina", "Vitrina"], ["mis", "Mis carreras"]].map(function (s) {
      return '<button type="button" role="tab" data-sub="' + s[0] + '" aria-selected="' + (view.sub === s[0]) + '">' + s[1] + '</button>';
    }).join("") + '</div>';
    h += accountCard();
    h += { marcas: pMarcas, vitrina: pVitrina, mis: pMis }[view.sub]();
    h += '<p class="foot">' + (user ? "Tus datos se guardan en tu cuenta Runiverso y en este móvil." : "Sin cuenta, tus datos se guardan solo en este móvil.") + ' · Versión ' + APP_V + '<br><a href="../privacidad/">Privacidad</a> · <a href="../condiciones/">Condiciones</a> · <a href="../borrar-cuenta/">Eliminar cuenta</a></p>';
    return h;
  }
  function pMarcas() {
    var b = prs();
    var h = '<div class="prs">' + DKEYS.map(function (k) {
      var m = b[k[1]];
      return '<div class="pr' + (m ? "" : " none") + '"><span class="d">' + (k[1] === "21K" ? "Media" : k[1] === "42K" ? "Maratón" : k[1]) + '</span><b>' + (m ? fmtT(m.sec) : "—") + '</b><span>' + (m ? pace(m.sec, m.km) + " · " + sdate(pd(m.date)) : "Sin marca todavía") + '</span></div>';
    }).join("") + '</div>';
    if (S.marks.length) {
      h += '<div class="sec"><div class="sechd"><h2>Tu predicción</h2><span class="muted" style="font-size:12.5px">según tus marcas</span></div><div class="prs">' + DKEYS.map(function (k) {
        var pr = predict(k[0]), own = b[k[1]];
        return '<div class="pr pred"><span class="d">' + (k[1] === "21K" ? "Media" : k[1] === "42K" ? "Maratón" : k[1]) + '</span><b>≈ ' + fmtT(pr.sec) + '</b><span>' + pace(pr.sec, k[0]) + (own && Math.abs(own.km - k[0]) < 0.05 ? " · tu récord: " + fmtT(own.sec) : " · desde tu " + dLabel(pr.from.km)) + '</span></div>';
      }).join("") + '</div><p class="muted" style="margin:0;font-size:12.5px">Estimación con la fórmula de Riegel a partir de tu marca más parecida en distancia. Cuanto más entrenes la distancia, más se acerca.</p></div>';
    }
    h += '<button class="btn wide" type="button" data-act="addmark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Añadir marca</button>';
    var ms = S.marks.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    h += '<div class="sec"><h2>Historial</h2>' + (ms.length ? '<div class="list">' + ms.map(function (m) {
      var d = pd(m.date);
      return '<div class="li"><span class="dt"><b>' + d.getDate() + '</b><span>' + MES_C[d.getMonth()] + '</span></span><span class="tx"><b>' + esc(m.name) + '</b><span>' + dLabel(m.km) + ' · ' + d.getFullYear() + '</span></span><span class="tm">' + fmtT(m.sec) + '<small>' + pace(m.sec, m.km) + '</small></span><button class="x sh" type="button" data-card="' + m.id + '" aria-label="Compartir marca de ' + esc(m.name) + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg></button><button class="x" type="button" data-del="' + m.id + '" aria-label="Borrar marca de ' + esc(m.name) + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';
    }).join("") + '</div>' : '<div class="card empty"><p>Registra el tiempo de tus carreras y aquí verás tu evolución y tus récords.</p></div>') + '</div>';
    return h;
  }
  function pVitrina() {
    var b = prs(), prIds = {};
    Object.keys(b).forEach(function (k) { prIds[b[k].id] = 1; });
    var RIB = { "5K": ["#FF7A2F", "#F3F5FA"], "10K": ["#14B8A6", "#F3F5FA"], "21K": ["#3D7BFF", "#F3F5FA"], "42K": ["#7A5CFF", "#F2C14E"] };
    var ms = S.marks.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var medals = ms.map(function (m) {
      var l = dLabel(m.km), rb = RIB[l] || ["#3DD68C", "#0A0E1A"];
      return '<div class="medal' + (prIds[m.id] ? " gold" : "") + '" role="button" tabindex="0" data-medal="' + m.id + '" aria-label="Ver la medalla de ' + esc(m.name) + ' en 3D" style="--r1:' + rb[0] + ';--r2:' + rb[1] + '"><span class="rib"><i></i><i></i></span><span class="disc"><b>' + (l.length <= 3 ? l : "★") + '</b><small>' + m.date.slice(0, 4) + '</small></span><span>' + esc(m.name) + '</span></div>';
    });
    upcoming().filter(function (r) { return S.mine[r.id]; }).slice(0, 3).forEach(function (r) {
      medals.push('<div class="medal lock"><span class="rib"><i></i><i></i></span><span class="disc"><b>' + (r.k === "TR" || r.k === "POP" ? "?" : r.k) + '</b><small>' + r.date.getFullYear() + '</small></span><span>' + esc(r.n) + '</span></div>');
    });
    if (!b["42K"]) medals.push('<div class="medal lock"><span class="rib"><i></i><i></i></span><span class="disc"><b>42K</b><small>?</small></span><span>Tu primera maratón</span></div>');
    while (medals.length < 6) medals.push('<div class="medal lock"><span class="rib"><i></i><i></i></span><span class="disc"><b>?</b></span><span>Próxima medalla</span></div>');
    var h = '<div class="sechd"><h2>Mi vitrina</h2><span class="muted" style="font-size:13px">' + S.marks.length + (S.marks.length === 1 ? ' medalla' : ' medallas') + ' · tócalas para verlas en 3D</span></div><div class="vitrina">' + medals.join("") + '</div>';
    var sm = seasonMarks().length, regs = {};
    S.marks.forEach(function (m) { var r = BY[m.raceId]; if (r) regs[r.p] = 1; });
    var goals = [["5 carreras esta temporada", sm, 5], ["Tu primera media maratón", b["21K"] ? 1 : 0, 1], ["Correr en 3 provincias", Object.keys(regs).length, 3]];
    if (b["10K"]) goals.push(["Bajar de 50 min en 10K", Math.min(1, 3000 / b["10K"].sec), 1, fmtT(b["10K"].sec) + " → 50:00"]);
    h += '<div class="sec"><h2>Retos</h2>' + goals.map(function (g) {
      var p = Math.min(1, g[1] / g[2]);
      return '<div class="goal"><div class="h"><b style="font-weight:700">' + g[0] + '</b><span>' + (g[3] || (Math.min(g[1], g[2]) + " de " + g[2])) + '</span></div><div class="bar"><i style="width:' + Math.round(p * 100) + '%"></i></div></div>';
    }).join("") + '</div>';
    return h;
  }
  function pMis() {
    var mine = RACES.filter(function (r) { return S.mine[r.id]; });
    var fut = mine.filter(function (r) { return daysTo(r.date) >= 0; });
    var past = mine.filter(function (r) { return daysTo(r.date) < 0 && !S.marks.some(function (m) { return m.raceId === r.id; }); });
    var h = "";
    if (past.length) h += '<div class="sec"><h2>¿Cómo te fue?</h2><div class="list">' + past.map(function (r) {
      return '<div class="li"><span class="dt"><b>' + r.date.getDate() + '</b><span>' + MES_C[r.date.getMonth()] + '</span></span><span class="tx"><b>' + esc(r.n) + '</b><span>Añade tu tiempo y gana la medalla</span></span><button class="btn sm" type="button" data-act="addmark" data-race="' + r.id + '" data-noopen="1">Añadir</button></div>';
    }).join("") + '</div></div>';
    h += '<div class="sec"><h2>Próximas</h2>' + (fut.length ? '<div class="grid">' + fut.map(item).join("") + '</div>' : '<div class="card empty"><p>No estás apuntado a ninguna carrera.</p><a class="btn" href="#carreras">Buscar carreras</a></div>') + '</div>';
    return h;
  }

  /* ---------- Resultados ---------- */
  function vResultados() {
    var h = '<div><h1>Resultados</h1><p class="kick">Clasificaciones oficiales de las últimas carreras</p></div>';
    function cards(list) {
      return '<div class="grid">' + list.map(function (r) {
        var d = pd(r.d), fake = { id: r.id, n: r.n, c: r.c, p: r.p, k: r.k, dist: r.dist, date: d, ok: true };
        return '<div class="item">' + poster(fake, '<span class="tag done">Terminada</span>', ' data-res="' + esc(r.id) + '"') + '<div><h3>' + esc(r.n) + '</h3><p>' + esc(r.c) + ' · ' + sdate(d) + '</p></div><button class="btn sm" type="button" data-res="' + esc(r.id) + '">Ver clasificación</button></div>';
      }).join("") + '</div>';
    }
    if (S.ccaa) {
      var mine = RESULTS.filter(function (r) { return ccaaOf(r.p) === S.ccaa; }), rest = RESULTS.filter(function (r) { return ccaaOf(r.p) !== S.ccaa; });
      h += '<section class="grp"><h2 class="gh">En ' + esc(S.ccaa) + '<span>' + mine.length + '</span></h2>' + (mine.length ? cards(mine) : '<p class="muted" style="margin:0">Todavía no hay resultados de tu comunidad. Los añadimos según se publican.</p>') + '</section>';
      if (rest.length) h += '<section class="grp"><h2 class="gh">Resto de España<span>' + rest.length + '</span></h2>' + cards(rest) + '</section>';
    } else h += cards(RESULTS);
    h += '<p class="foot">Las clasificaciones las publica cada organización o su empresa de cronometraje. Las cargamos en Runiverso con su permiso; si aún no está, te llevamos a la oficial.</p>';
    return h;
  }

  /* ---------- Clasificación dentro de la app ---------- */
  var RES_BY = {}; RESULTS.forEach(function (r) { RES_BY[r.id] = r; });
  var isAdmin = false, resState = null;
  function checkAdmin() { if (!user || !sb) { isAdmin = false; return; } sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle().then(function (r) { isAdmin = !!(r && r.data); }); }
  function kmOfRes(r) { return KM[r.k] || parseFloat(String(r.dist || "").replace(",", ".")) || null; }
  function resRow(x, km) {
    var me = user && x.user_id === user.id, pc = x.sec && km ? pace(x.sec, km) : "";
    return '<li class="rrow' + (me ? ' me' : '') + '"><span class="rp">' + (x.pos || "—") + '</span><span class="rn"><b>' + esc(x.name) + (me ? ' <em>Tú</em>' : '') + '</b><span>' + [x.category, x.club].filter(Boolean).map(esc).join(" · ") + '</span></span><span class="rt"><b>' + (x.sec ? fmtT(x.sec) : "—") + '</b><span>' + pc + '</span></span>' +
      (user && !x.user_id ? '<button class="rclaim" type="button" data-claim="' + x.id + '" aria-label="Soy yo: ' + esc(x.name) + '">Soy yo</button>' : '') + '</li>';
  }
  function resScreen(id, q) {
    var r = RES_BY[id]; if (!r) return;
    var d = pd(r.d), km = kmOfRes(r), fake = { id: r.id, n: r.n, c: r.c, p: r.p, k: r.k, dist: r.dist, date: d, ok: true };
    resState = { id: id, q: q || "" };
    var head = '<div class="rhead">' + poster(fake, '<span class="tag done">Terminada</span>').replace('data-race="', 'data-x="') + '<div><p class="kick">Clasificación</p><h1>' + esc(r.n) + '</h1><p class="asub">' + cap(fdate(d)) + ' · ' + esc(r.c) + (r.extra ? ' · ' + esc(r.extra) : '') + '</p></div></div>';
    $("layer").innerHTML = '<div class="auth res" role="dialog" aria-modal="true" aria-label="Clasificación ' + esc(r.n) + '"><div class="auth-in"><button class="aclose" type="button" data-close="1" aria-label="Cerrar">×</button>' + head + '<div id="resbody"><p class="muted">Cargando clasificación…</p></div></div></div>';
    motion.screen($("layer").firstChild); document.documentElement.classList.add("lock");
    if (!sb) { resEmpty(r); return; }
    var base = function () { return sb.from("results").select("id,pos,name,sex,category,club,sec,user_id").eq("race_id", id); };
    Promise.all([
      (q ? base().ilike("name", "%" + q + "%") : base()).order("pos", { ascending: true, nullsFirst: false }).limit(q ? 200 : 100),
      sb.from("results").select("id", { count: "exact", head: true }).eq("race_id", id),
      base().eq("sex", "M").order("pos").limit(3), base().eq("sex", "F").order("pos").limit(3),
      user ? base().eq("user_id", user.id).limit(1) : Promise.resolve({ data: [] })
    ]).then(function (rs) {
      if (!resState || resState.id !== id) return;
      var total = rs[1].count || 0;
      if (!total) { resEmpty(r); return; }
      var rows = rs[0].data || [], mine = (rs[4].data || [])[0];
      var pod = function (list, lab) { return list.length ? '<div class="pod"><h3>' + lab + '</h3>' + list.map(function (x, i) { return '<div class="pp p' + (i + 1) + '"><span class="pm">' + (i + 1) + '</span><span class="pnm">' + esc(x.name) + '</span><b>' + (x.sec ? fmtT(x.sec) : "") + '</b></div>'; }).join("") + '</div>' : ''; };
      var h = (mine ? '<div class="card mineres"><span>Tu resultado</span><b>' + (mine.pos ? "Puesto " + mine.pos + " · " : "") + (mine.sec ? fmtT(mine.sec) : "") + '</b><button class="link" type="button" data-unclaim="' + mine.id + '">No soy yo</button></div>' : '') +
        (q ? '' : '<div class="pods">' + pod(rs[2].data || [], "Hombres") + pod(rs[3].data || [], "Mujeres") + '</div>') +
        '<form class="rsearch" id="resq" role="search"><input id="rq" type="search" placeholder="Busca tu nombre entre ' + total.toLocaleString("es-ES") + ' finalistas" value="' + esc(q || "") + '" autocomplete="off"><button class="btn sm" type="submit">Buscar</button></form>' +
        (rows.length ? '<ol class="rlist">' + rows.map(function (x) { return resRow(x, km); }).join("") + '</ol>' : '<p class="muted">Nadie con ese nombre. Prueba solo con el apellido.</p>') +
        (!q && total > rows.length ? '<p class="muted" style="text-align:center;margin:0">Mostrando los ' + rows.length + ' primeros. Busca tu nombre para encontrarte.</p>' : '') +
        (!user ? '<button class="btn alt wide" type="button" data-act="login">Entra para guardar tu resultado en tu perfil</button>' : '') +
        '<p class="ahint">Fuente: clasificación oficial · <a href="' + esc(r.url) + '" target="_blank" rel="noopener">ver original</a></p>' + adminBox(r);
      $("resbody").innerHTML = h; motion.list($("resbody"));
    });
  }
  function resEmpty(r) {
    $("resbody").innerHTML = '<div class="card empty"><p><b>Todavía no tenemos esta clasificación en Runiverso.</b> Estamos pidiendo permiso a las organizaciones para cargarlas aquí, con buscador y para que guardes tu resultado con un toque.</p><a class="btn" href="' + esc(r.url) + '" target="_blank" rel="noopener">Ver clasificación oficial</a></div>' + adminBox(r);
    motion.list($("resbody"));
  }
  function adminBox(r) {
    if (!isAdmin) return "";
    return '<div class="card admin"><h3>Administrador · Subir clasificación</h3><p class="muted" style="margin:0;font-size:13px">Archivo CSV con columnas: puesto; dorsal; nombre; sexo (M/F); categoría; club; tiempo. Solo con permiso de la organización. Sustituye la clasificación anterior.</p><label class="btn sm alt" style="align-self:flex-start">Elegir CSV<input type="file" id="rescsv" accept=".csv,text/csv" hidden data-race="' + esc(r.id) + '"></label><p id="resmsg" class="muted" style="margin:0"></p></div>';
  }
  function parseTime(t) { t = String(t || "").trim().replace(",", "."); if (!t) return null; var p = t.split(":").map(Number); if (p.some(isNaN)) return null; var s2 = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : null; return s2 ? Math.round(s2) : null; }
  function parseCSV(text) {
    var lines = text.replace(/\r/g, "").split("\n").filter(function (l) { return l.trim(); });
    var sep = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ";" : ",";
    var split = function (l) { var out = [], cur = "", qq = false; for (var i = 0; i < l.length; i++) { var c = l[i]; if (c === '"') qq = !qq; else if (c === sep && !qq) { out.push(cur); cur = ""; } else cur += c; } out.push(cur); return out.map(function (x) { return x.trim(); }); };
    var rows = lines.map(split), hdr = rows[0].map(function (h) { return norm(h); }), has = /nombre|name|puesto|pos/.test(hdr.join(" "));
    var idx = function (re, def) { for (var i = 0; i < hdr.length; i++) if (re.test(hdr[i])) return i; return has ? -1 : def; };
    var I = { pos: idx(/^(pos|puesto|clas|lugar)/, 0), bib: idx(/dorsal|bib/, 1), name: idx(/nombre|name|corredor|atleta/, 2), sex: idx(/^(sexo|sex|genero|g)$/, 3), cat: idx(/categ/, 4), club: idx(/club|equipo/, 5), time: idx(/tiempo|time|neto|real|oficial/, 6) };
    return rows.slice(has ? 1 : 0).map(function (c) {
      var sx = String(c[I.sex] || "").trim().toUpperCase().charAt(0); sx = sx === "H" ? "M" : sx === "M" || sx === "F" ? sx : null;
      return { pos: parseInt(c[I.pos], 10) || null, bib: c[I.bib] || null, name: c[I.name] || "", sex: sx, category: c[I.cat] || null, club: c[I.club] || null, sec: parseTime(c[I.time]) };
    }).filter(function (x) { return x.name; });
  }
  function importCSV(file, raceId) {
    var r = RES_BY[raceId], msg = function (t) { var m = $("resmsg"); if (m) m.textContent = t; };
    var fr = new FileReader();
    fr.onload = function () {
      var rows = parseCSV(String(fr.result)); if (!rows.length) { msg("No he encontrado filas válidas en el archivo."); return; }
      msg("Subiendo " + rows.length + " filas…");
      sb.from("races").upsert({ id: r.id, name: r.n, city: r.c, prov: r.p, ccaa: r.r, date: r.d, kind: r.k, km: kmOfRes(r), official_url: r.url, source: r.src || "Organización" }).then(function (a) {
        if (a.error) throw a.error;
        return sb.from("results").delete().eq("race_id", r.id);
      }).then(function (b) {
        if (b && b.error) throw b.error;
        var chunks = []; for (var i = 0; i < rows.length; i += 500) chunks.push(rows.slice(i, i + 500).map(function (x) { x.race_id = r.id; return x; }));
        return chunks.reduce(function (pr, ch) { return pr.then(function () { return sb.from("results").insert(ch).then(function (c) { if (c.error) throw c.error; }); }); }, Promise.resolve());
      }).then(function () { msg("Clasificación subida: " + rows.length + " corredores."); setTimeout(function () { resScreen(r.id); }, 700); })
        .catch(function (e) { console.warn(e); msg("Error al subir: " + (e.message || e)); });
    };
    fr.readAsText(file, "utf-8");
  }

  /* ---------- Comunidad (próximamente) ---------- */
  function vComunidad() {
    var C = [
      ["Clubes", "Los clubes de tu provincia con su espacio: sus corredores, sus carreras y su propio ranking.", "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11.5a2.5 2.5 0 1 0 0-5M15 14.5c3 0 6 2 6 5.5", ""],
      ["Muro", "Fotos y marcas de los corredores de tu zona después de cada carrera.", "M4 5h16v15H4zM9 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 17l-5-5-9 8", ""],
      ["Runiverso Pro", "Alertas antes de que suban los dorsales, plan hacia tu carrera, predicción de tiempos y ranking por edad.", "M13 2L4 14h7l-1 8 9-12h-7z", "pro"]
    ];
    var h = '<div><h1>Comunidad</h1><p class="kick">' + (S.prov ? "Los corredores de " + esc(S.prov) + " y " + esc(S.ccaa) : "Los corredores de tu zona") + '</p></div>';
    h += '<div class="sec">' + rankingHtml() + '</div><h2 style="margin:8px 0 0">Muy pronto</h2>';
    h += C.map(function (c) {
      return '<div class="card soon"><span class="ic"' + (c[3] ? ' style="color:var(--pro)"' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + c[2] + '"/></svg></span><div><h3>' + c[0] + (c[3] ? ' <span class="pill pro">Pro</span>' : ' <span class="pill">Próximamente</span>') + '</h3><p>' + c[1] + '</p></div></div>';
    }).join("");
    h += '<div class="card" style="display:flex;flex-direction:column;gap:12px"><p style="margin:0">Te avisaremos en cuanto lleguen los clubes y el muro. Síguenos para enterarte el primero:</p><div class="row"><a class="btn" href="https://whatsapp.com/channel/0029VbDrJk2InlqSVj746L0L" target="_blank" rel="noopener">Canal de WhatsApp</a><a class="btn alt" href="https://www.tiktok.com/@runiverso_" target="_blank" rel="noopener">TikTok</a><a class="btn alt" href="https://www.instagram.com/runivers0/" target="_blank" rel="noopener">Instagram</a></div></div>';
    return h;
  }

  /* ---------- Hojas (ficha, marca, nombre) ---------- */
  var lastFocus = null;
  function openSheet(html, label) {
    lastFocus = document.activeElement;
    $("layer").innerHTML = '<div class="scrim" data-close="1"><div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(label) + '"><span class="grab" aria-hidden="true"></span>' + html + '</div></div>';
    var f = $("layer").querySelector(".sheet input, .sheet button, .sheet a"); if (f) f.focus();
    motion.sheet($("layer").firstChild);
  }
  function closeSheet() { authScreen.open = false; resState = null; document.documentElement.classList.remove("lock"); $("layer").innerHTML = ""; if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  function raceSheet(id) {
    var r = BY[id]; if (!r) return;
    var on = !!S.mine[id], d = daysTo(r.date);
    var h = '<div class="sstripe" style="' + pvars(r.p) + '"><i></i>' + esc(r.p || r.r) + '</div><div class="shead">' + poster(r).replace('data-race="', 'data-x="') + '<div style="display:flex;flex-direction:column;gap:8px"><h2>' + esc(r.n) + '</h2><span class="st ' + (r.s ? "prov" : r.ok ? "ok" : "prov") + '">' + (r.s ? "Suspendida" : r.ok ? "Fecha confirmada" : "Fecha por confirmar") + '</span><span class="muted" style="font-size:14px">' + (d === 0 ? "Es hoy" : d > 0 ? "Faltan " + d + (d === 1 ? " día" : " días") : "Ya celebrada") + '</span></div></div>';
    h += '<dl class="facts"><div><dt>Fecha</dt><dd>' + cap(fdate(r.date)) + (r.h ? ", " + esc(r.h) : "") + '</dd></div><div><dt>Lugar</dt><dd>' + esc(r.c) + ', ' + esc(r.r) + '</dd></div><div><dt>Distancia</dt><dd>' + esc(r.dist || LABEL[r.k]) + '</dd></div>' + (r.x && r.x.length ? '<div><dt>También</dt><dd>' + r.x.map(esc).join(" · ") + '</dd></div>' : '') + '</dl>';
    if (r.s) h += '<p class="susp" role="status"><b>Carrera suspendida.</b> ' + esc(r.t.replace(/^SUSPENDIDA\. /, "")) + '</p>';
    else if (r.t) h += '<p class="note">' + esc(r.t) + '</p>';
    if (KM[r.k] && S.marks.length) {
      var pe = predict(KM[r.k]);
      h += '<div class="marks"><span class="k">Tu tiempo estimado aquí</span><span class="r"><span>Según tu ' + dLabel(pe.from.km) + ' de ' + fmtT(pe.from.sec) + '</span><b>≈ ' + fmtT(pe.sec) + '</b></span><span class="muted" style="font-size:12.5px">Ritmo ' + pace(pe.sec, KM[r.k]) + '</span></div>';
    }
    if (r.m && (r.m.h || r.m.f)) {
      h += '<div class="marks"><span class="k">Ganadores · ' + esc(r.m.ed) + '</span>' + [["Hombres", r.m.h], ["Mujeres", r.m.f]].filter(function (x) { return x[1]; }).map(function (x) { return '<span class="r"><span>' + x[0] + ': ' + esc(x[1][0]) + '</span><b>' + esc(x[1][2]) + '</b></span>'; }).join("") + '</div>';
    }
    h += '<button class="btn wide ' + (on ? "ok" : "") + '" type="button" data-mine="' + id + '">' + (on ? "✓ Apuntada · quitar" : "Apuntarme") + '</button>';
    if (on && d >= 0) h += canalCard("¿Te avisamos de esta carrera?", "Recogida de dorsales, horarios y cambios de última hora en nuestro canal.");
    h += '<div class="row">' + (r.w ? '<a class="btn sm alt" href="' + esc(r.w) + '" target="_blank" rel="noopener">Web oficial</a>' : '<a class="btn sm alt" href="https://www.google.com/search?q=' + encodeURIComponent(r.n + " " + r.date.getFullYear() + " inscripción") + '" target="_blank" rel="noopener">Buscar inscripción</a>') +
      '<button class="btn sm alt" type="button" data-ics="' + id + '">Añadir al calendario</button><button class="btn sm alt" type="button" data-share="' + id + '">Compartir</button>' +
      (KM[r.k] && d < 0 ? '<button class="btn sm alt" type="button" data-act="addmark" data-race="' + id + '">Añadir mi marca</button>' : '') + '</div>';
    h += '<button class="btn alt wide" type="button" data-close="1">Cerrar</button>';
    openSheet(h, r.n);
  }

  function markSheet(raceId, err, vals) {
    vals = vals || {};
    var r = raceId ? BY[raceId] : null;
    var past = RACES.filter(function (x) { return daysTo(x.date) <= 0; }).slice().reverse();
    var km = vals.km || (r && KM[r.k]) || 10;
    var dsel = [[5, "5 km"], [10, "10 km"], [21.0975, "Media maratón (21,1 km)"], [42.195, "Maratón (42,2 km)"]];
    var other = !dsel.some(function (x) { return Math.abs(x[0] - km) < 0.01; });
    var h = '<h2>Añadir marca</h2><form class="f" id="markf" novalidate>' +
      '<div class="fld"><label for="mrace">Carrera</label><select id="mrace"><option value="">Otra carrera (escribe el nombre)</option>' +
      past.map(function (x) { return '<option value="' + x.id + '"' + (r && r.id === x.id ? " selected" : "") + '>' + esc(x.n) + ' · ' + sdate(x.date) + '</option>'; }).join("") + '</select></div>' +
      '<div class="fld" id="mnamew"' + (r ? " hidden" : "") + '><label for="mname">Nombre de la carrera</label><input id="mname" type="text" maxlength="80" value="' + esc(vals.name || "") + '" placeholder="Ej.: Media Maratón de Cádiz 2025"></div>' +
      '<div class="fld"><label for="mdate">Fecha</label><input id="mdate" type="date" value="' + esc(vals.date || (r ? r.d : "")) + '" max="' + today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate()) + '"></div>' +
      '<div class="fld"><label for="mdist">Distancia</label><select id="mdist">' + dsel.map(function (x) { return '<option value="' + x[0] + '"' + (!other && Math.abs(x[0] - km) < 0.01 ? " selected" : "") + '>' + x[1] + '</option>'; }).join("") + '<option value="otra"' + (other ? " selected" : "") + '>Otra distancia</option></select></div>' +
      '<div class="fld" id="mkmw"' + (other ? "" : " hidden") + '><label for="mkm">Kilómetros</label><input id="mkm" type="number" inputmode="decimal" min="1" max="250" step="0.1" value="' + (other ? km : "") + '"></div>' +
      '<div class="fld"><span class="lb" id="tlb">Tiempo oficial</span><div class="time" role="group" aria-labelledby="tlb"><input id="mh" type="number" inputmode="numeric" min="0" max="48" placeholder="h" aria-label="Horas" value="' + esc(vals.h || "") + '"><input id="mm" type="number" inputmode="numeric" min="0" max="59" placeholder="min" aria-label="Minutos" value="' + esc(vals.m || "") + '"><input id="ms" type="number" inputmode="numeric" min="0" max="59" placeholder="s" aria-label="Segundos" value="' + esc(vals.s || "") + '"></div><span class="pace" id="mpace" aria-live="polite"></span></div>' +
      (err ? '<p class="err" role="alert">' + esc(err) + '</p>' : '') +
      '<button class="btn wide" type="submit">Guardar marca</button><button class="btn alt wide" type="button" data-close="1">Cancelar</button></form>';
    openSheet(h, "Añadir marca");
    updPace();
  }
  function readMark() {
    var rid = $("mrace").value, r = BY[rid];
    var dv = $("mdist").value, km = dv === "otra" ? parseFloat(String($("mkm").value).replace(",", ".")) : parseFloat(dv);
    var sec = (+$("mh").value || 0) * 3600 + (+$("mm").value || 0) * 60 + (+$("ms").value || 0);
    return { rid: rid, r: r, km: km, sec: sec, name: r ? r.n : $("mname").value.trim(), date: $("mdate").value, h: $("mh").value, m: $("mm").value, s: $("ms").value };
  }
  function updPace() {
    var p = $("mpace"); if (!p) return;
    var v = readMark();
    p.innerHTML = v.sec > 0 && v.km > 0 ? 'Ritmo: <b>' + pace(v.sec, v.km) + '</b>' : '';
  }

  function zoneSheet(first) {
    var cc = S.ccaa || "Andalucía";
    var opts = Object.keys(ZONES).sort(function (a, b) { return a.localeCompare(b, "es"); });
    openSheet('<h2>' + (first ? "¿Dónde sueles correr?" : "Tu zona") + '</h2><p class="muted" style="margin:0">' + (first ? "Te enseñamos primero las carreras de tu provincia y de tu comunidad. Puedes cambiarlo cuando quieras." : "Las carreras, resultados y retos se ordenan por cercanía.") + '</p>' +
      '<form class="f" id="zonef"><div class="fld"><label for="zc">Comunidad autónoma</label><select id="zc">' + opts.map(function (k) { return '<option' + (k === cc ? " selected" : "") + '>' + esc(k) + '</option>'; }).join("") + '</select></div>' +
      '<div class="fld"><label for="zp">Provincia</label><select id="zp">' + provOpts(cc, S.prov || "Cádiz") + '</select></div>' +
      '<button class="btn wide" type="submit">Guardar mi zona</button>' + (first ? '<button class="btn alt wide" type="button" data-close="1">Ahora no, ver toda España</button>' : '<button class="btn alt wide" type="button" data-close="1">Cancelar</button>') + '</form>', "Tu zona");
  }
  function provOpts(cc, sel) {
    var up = upcoming();
    return (ZONES[cc] || []).map(function (p) { var n = up.filter(function (r) { return r.p === p; }).length; return '<option value="' + esc(p) + '"' + (p === sel ? " selected" : "") + '>' + esc(p) + (n ? " · " + n + (n === 1 ? " carrera" : " carreras") : "") + '</option>'; }).join("");
  }
  /* ---------- Tarjeta para compartir (imagen 1080 × 1350) ---------- */
  var RIBC = { "5K": ["#FF7A2F", "#F3F5FA"], "10K": ["#14B8A6", "#F3F5FA"], "21K": ["#3D7BFF", "#F3F5FA"], "42K": ["#7A5CFF", "#F2C14E"] };
  function drawCard(m, isPr) {
    var W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d"), F = "Manrope, 'Hanken Grotesk', system-ui, sans-serif", d = pd(m.date), l = dLabel(m.km);
    var g = x.createRadialGradient(W * 0.85, 0, 50, W * 0.85, 0, 1100); g.addColorStop(0, "#2A4BB5"); g.addColorStop(0.55, "#0E1630"); g.addColorStop(1, "#0A0E1A");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.strokeStyle = "rgba(127,166,255,0.16)"; x.lineWidth = 3;
    [260, 360, 460].forEach(function (rr, i) { x.setLineDash(i === 2 ? [4, 18] : []); x.beginPath(); x.arc(W - 90, 150, rr, 0, Math.PI * 2); x.stroke(); });
    x.setLineDash([]);
    // logo
    x.save(); x.translate(80, 80); x.fillStyle = "#0E1630"; x.beginPath(); x.roundRect ? x.roundRect(0, 0, 76, 76, 20) : x.rect(0, 0, 76, 76); x.fill();
    x.strokeStyle = "rgba(255,255,255,0.18)"; x.lineWidth = 2; x.stroke();
    x.scale(76 / 96, 76 / 96); x.translate(-12, -12); x.lineCap = "round"; x.lineJoin = "round"; x.lineWidth = 11;
    x.strokeStyle = "#F3F5FA"; x.stroke(new Path2D("M44 30V90M44 30H64a17 17 0 0 1 0 34H44")); x.strokeStyle = "#7FA6FF"; x.stroke(new Path2D("M60 64L82 90")); x.restore();
    x.fillStyle = "#F3F5FA"; x.font = "800 44px " + F; x.textBaseline = "middle"; x.fillText("Runiverso", 176, 120);
    // medalla
    var rb = RIBC[l] || ["#3DD68C", "#0A0E1A"], cx = W / 2, cy = 430;
    x.save(); x.fillStyle = rb[0]; x.translate(cx - 70, 200); x.transform(1, 0, 0.25, 1, 0, 0); x.fillRect(0, 0, 62, 130); x.restore();
    x.save(); x.fillStyle = rb[1]; x.translate(cx + 8, 200); x.transform(1, 0, -0.25, 1, 0, 0); x.fillRect(0, 0, 62, 130); x.restore();
    var mg = x.createRadialGradient(cx - 45, cy - 50, 10, cx, cy, 150);
    if (isPr) { mg.addColorStop(0, "#FFE7A3"); mg.addColorStop(0.5, "#F2C14E"); mg.addColorStop(1, "#B8862A"); } else { mg.addColorStop(0, "#FFFFFF"); mg.addColorStop(0.5, "#C9D1DE"); mg.addColorStop(1, "#7E889C"); }
    x.shadowColor = isPr ? "rgba(242,193,78,0.45)" : "rgba(0,0,0,0.4)"; x.shadowBlur = 60;
    x.fillStyle = mg; x.beginPath(); x.arc(cx, cy, 140, 0, Math.PI * 2); x.fill(); x.shadowBlur = 0;
    x.strokeStyle = "rgba(255,255,255,0.45)"; x.lineWidth = 12; x.beginPath(); x.arc(cx, cy, 126, 0, Math.PI * 2); x.stroke();
    x.fillStyle = "#0A0E1A"; x.textAlign = "center"; x.font = "800 " + (l.length > 3 ? 54 : 84) + "px " + F; x.fillText(l.length > 4 ? "★" : l, cx, cy - 8);
    x.font = "600 30px 'DM Mono', ui-monospace, monospace"; x.fillText(String(d.getFullYear()), cx, cy + 60);
    // etiqueta récord
    var ty = 640;
    if (isPr) { x.fillStyle = "#F2C14E"; var tw = 420; x.beginPath(); x.roundRect ? x.roundRect(cx - tw / 2, ty - 34, tw, 68, 34) : x.rect(cx - tw / 2, ty - 34, tw, 68); x.fill(); x.fillStyle = "#3A2600"; x.font = "800 30px " + F; x.fillText("RÉCORD PERSONAL", cx, ty + 2); }
    else { x.fillStyle = "#7FA6FF"; x.font = "700 30px " + F; x.fillText("NUEVA MEDALLA", cx, ty); }
    // nombre (hasta 2 líneas)
    x.fillStyle = "#F3F5FA"; x.font = "800 58px " + F;
    var words = m.name.split(" "), lines = [""], i;
    for (i = 0; i < words.length; i++) { var t = (lines[lines.length - 1] + " " + words[i]).trim(); if (x.measureText(t).width > W - 160 && lines[lines.length - 1]) lines.push(words[i]); else lines[lines.length - 1] = t; }
    if (lines.length > 2) { lines = lines.slice(0, 2); lines[1] += "…"; }
    lines.forEach(function (ln, k) { x.fillText(ln, cx, 750 + k * 70); });
    // tiempo
    x.font = "800 190px " + F; x.fillStyle = "#FFFFFF"; x.fillText(fmtT(m.sec), cx, 760 + lines.length * 70 + 110);
    // fila de datos
    var yy = 1150, cols = [["DISTANCIA", l.length <= 3 ? (l === "21K" ? "21,1 km" : l === "42K" ? "42,2 km" : l.replace("K", " km")) : l], ["RITMO", pace(m.sec, m.km).replace(" /km", "/km")], ["FECHA", d.getDate() + " " + MES_C[d.getMonth()] + " " + d.getFullYear()]];
    x.strokeStyle = "rgba(255,255,255,0.14)"; x.lineWidth = 2; x.beginPath(); x.moveTo(80, yy - 70); x.lineTo(W - 80, yy - 70); x.stroke();
    cols.forEach(function (col, k) { var px = 80 + (W - 160) / 6 * (k * 2 + 1); x.fillStyle = "#A9B3C8"; x.font = "700 24px " + F; x.fillText(col[0], px, yy - 20); x.fillStyle = "#F3F5FA"; x.font = "800 40px " + F; x.fillText(col[1], px, yy + 30); });
    x.fillStyle = "#7FA6FF"; x.font = "700 28px " + F; x.fillText("Runiverso · El universo del running · runiverso.com", cx, H - 70);
    return c;
  }
  function cardSheet(id, fresh) {
    var m = S.marks.filter(function (z) { return z.id === id; })[0]; if (!m) return;
    var b = prs()[dLabel(m.km)], isPr = b && b.id === m.id;
    var go = function () {
      var c = drawCard(m, isPr);
      openSheet((fresh ? '<h2>' + (isPr ? "¡Récord personal!" : "¡Nueva medalla!") + '</h2><p class="muted" style="margin:0">Compártelo con tu gente: la imagen está lista para Instagram y WhatsApp.</p>' : '<h2>Compartir marca</h2>') +
        '<img class="cardimg" src="' + c.toDataURL("image/png") + '" alt="Tarjeta de ' + esc(m.name) + ': ' + fmtT(m.sec) + '">' +
        '<button class="btn wide" type="button" data-sharecard="' + id + '">Compartir imagen</button><button class="btn alt wide" type="button" data-dlcard="' + id + '">Descargar imagen</button><button class="btn alt wide" type="button" data-close="1">' + (fresh ? "Ahora no" : "Cerrar") + '</button>', "Compartir marca");
    };
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("800 80px Manrope"), document.fonts.load("600 30px 'DM Mono'")]).then(go, go); else go();
  }
  function cardBlob(id, cb) {
    var m = S.marks.filter(function (z) { return z.id === id; })[0], b = prs()[dLabel(m.km)];
    drawCard(m, b && b.id === m.id).toBlob(function (bl) { cb(bl, m); }, "image/png");
  }
  function nameSheet() {
    openSheet('<h2>Tu nombre</h2><form class="f" id="namef"><div class="fld"><label for="nm">Cómo quieres que te llamemos</label><input id="nm" type="text" maxlength="40" autocomplete="given-name" value="' + esc(S.name) + '"></div><button class="btn wide" type="submit">Guardar</button><button class="btn alt wide" type="button" data-close="1">Cancelar</button></form>', "Tu nombre");
  }

  /* ---------- Acciones ---------- */
  function toast(t) {
    var el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); el.textContent = t;
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 2400);
  }
  function ics(r) {
    var d = r.date, ymd = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    var n1 = new Date(d.getTime() + 86400000), ymd2 = n1.getFullYear() + pad(n1.getMonth() + 1) + pad(n1.getDate());
    var hm = /^(\d{1,2}):(\d{2})/.exec(r.h || "");
    var start = hm ? "DTSTART;TZID=Europe/Madrid:" + ymd + "T" + pad(+hm[1]) + hm[2] + "00" : "DTSTART;VALUE=DATE:" + ymd;
    var end = hm ? "DTEND;TZID=Europe/Madrid:" + ymd + "T" + pad(Math.min(23, +hm[1] + 3)) + hm[2] + "00" : "DTEND;VALUE=DATE:" + ymd2;
    var txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Runiverso//App//ES", "BEGIN:VEVENT", "UID:" + r.id + "-" + d.getFullYear() + "@runiverso.com", "DTSTAMP:20261103T120000Z", start, end,
      "SUMMARY:" + r.n.replace(/,/g, "\\,"), "LOCATION:" + r.c.replace(/,/g, "\\,"), "URL:https://runiverso.com/app/", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/calendar" })); a.download = r.id + ".ics";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }
  function shareText(r) {
    var text = r.n + " · " + sdate(r.date) + " · " + r.c + "\nAvisos de dorsales: " + CANAL, url = "https://runiverso.com/app/";
    if (navigator.share) { navigator.share({ title: r.n, text: text, url: url }).catch(function () {}); return; }
    var full = text + "\n" + url;
    if (navigator.clipboard) navigator.clipboard.writeText(full).then(function () { toast("Enlace copiado"); }, function () { window.open("https://wa.me/?text=" + encodeURIComponent(full), "_blank"); });
    else window.open("https://wa.me/?text=" + encodeURIComponent(full), "_blank");
  }
  /* Imagen vertical (1080×1920) de una carrera para WhatsApp e historias: cartel oficial si lo hay, fecha, lugar y cuenta atrás */
  function raceImage(r, cb) {
    var W = 1080, H = 1920, cv = document.createElement("canvas"); cv.width = W; cv.height = H; var x = cv.getContext("2d");
    var g = x.createLinearGradient(0, 0, W * .6, H); g.addColorStop(0, "#2B1C6E"); g.addColorStop(.4, "#5B3FD1"); g.addColorStop(.85, "#E8622C"); g.addColorStop(1, "#F2A541");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    var F = function (w, px) { return w + " " + px + "px Fraunces, Georgia, serif"; }, N = function (w, px) { return w + " " + px + "px Nunito, system-ui, sans-serif"; };
    var rr = function (px, py, w, h, rad) { x.beginPath(); x.moveTo(px + rad, py); x.arcTo(px + w, py, px + w, py + h, rad); x.arcTo(px + w, py + h, px, py + h, rad); x.arcTo(px, py + h, px, py, rad); x.arcTo(px, py, px + w, py, rad); x.closePath(); };
    var wrap = function (t, maxW, maxL) { var ws = t.split(" "), ls = [], c = ""; ws.forEach(function (w) { var n = c ? c + " " + w : w; if (x.measureText(n).width > maxW && c) { ls.push(c); c = w; } else c = n; }); ls.push(c); if (ls.length > maxL) { ls = ls.slice(0, maxL); ls[maxL - 1] = ls[maxL - 1].replace(/.{2}$/, "…"); } return ls; };
    var finish = function (img) {
      x.textAlign = "center"; x.fillStyle = "#fff"; x.font = F(800, 54); x.fillText("Runiverso", W / 2, 190);
      x.font = N(900, 40); x.fillStyle = "#FFE1C2"; x.fillText((r.p || r.r).toUpperCase() + " · " + sdate(r.date).toUpperCase(), W / 2, 262);
      var top = 330, bh = 860;
      x.save(); x.translate(W / 2, top + bh / 2); x.rotate(-0.035); x.shadowColor = "rgba(0,0,0,.45)"; x.shadowBlur = 70; x.shadowOffsetY = 34;
      if (img) {
        var k = Math.min(700 / img.width, bh / img.height), iw = img.width * k, ih = img.height * k;
        rr(-iw / 2, -ih / 2, iw, ih, 28); x.fillStyle = "#fff"; x.fill(); x.shadowColor = "transparent"; x.save(); x.clip(); x.drawImage(img, -iw / 2, -ih / 2, iw, ih); x.restore();
      } else {
        rr(-330, -330, 660, 660, 56); x.fillStyle = "#fff"; x.fill(); x.shadowColor = "transparent";
        x.fillStyle = "#5B3FD1"; x.font = F(900, 330); x.fillText(String(r.date.getDate()), 0, 90); x.font = N(900, 76); x.fillStyle = "#E8622C"; x.fillText(MES_C[r.date.getMonth()].toUpperCase() + " " + r.date.getFullYear(), 0, 220);
        x.font = N(900, 44); x.fillStyle = "#6B6878"; x.fillText((LABEL[r.k] || "").toUpperCase(), 0, -230);
      }
      x.restore();
      x.fillStyle = "#fff"; x.font = F(800, 82); var ls = wrap(r.n, 940, 2), y = 1330;
      ls.forEach(function (l) { x.fillText(l, W / 2, y); y += 92; });
      x.font = N(800, 44); x.fillStyle = "#FFF3E6"; x.fillText(r.c + (distTxt(r) ? " · " + distTxt(r) : "") + (r.h ? " · " + r.h : ""), W / 2, y + 6);
      var d = daysTo(r.date), pill = r.s ? "Suspendida" : d === 0 ? "¡Es hoy!" : d === 1 ? "¡Es mañana!" : d > 1 ? "Faltan " + d + " días" : "Ya se corrió";
      x.font = F(800, 62); var pw = x.measureText(pill).width + 110; rr(W / 2 - pw / 2, y + 60, pw, 116, 58); x.fillStyle = "#1D2140"; x.fill(); x.fillStyle = "#fff"; x.fillText(pill, W / 2, y + 140);
      x.font = N(900, 40); x.fillStyle = "#fff"; x.fillText("Todas las carreras de Andalucía · runiverso.com", W / 2, H - 150);
      cv.toBlob(function (bl) { cb(bl); }, "image/jpeg", 0.9);
    };
    var C = window.CARTELES || {};
    if (C[r.id]) { var im = new Image(); im.onload = function () { finish(im); }; im.onerror = function () { finish(null); }; im.src = "../carteles/" + C[r.id]; } else finish(null);
  }
  function share(r) {
    if (!navigator.canShare || typeof File === "undefined") { shareText(r); return; }
    toast("Preparando la imagen…");
    raceImage(r, function (bl) {
      if (!bl) { shareText(r); return; }
      var file = new File([bl], "runiverso-" + r.id + ".jpg", { type: "image/jpeg" }), d = daysTo(r.date);
      var txt = (S.mine[r.id] && d >= 0 ? "Yo corro la " : "") + r.n + " · " + sdate(r.date) + " · " + r.c + "\nTodas las carreras en https://runiverso.com/app/";
      if (navigator.canShare({ files: [file] })) navigator.share({ files: [file], text: txt }).catch(function (e) { if (e && e.name !== "AbortError") shareText(r); });
      else shareText(r);
    });
  }
  /* Medalla en 3D: gira sola y se puede girar con el dedo; por detrás lleva el tiempo */
  function medalSheet(id, isNew) {
    var m = S.marks.filter(function (z) { return z.id === id; })[0]; if (!m) return;
    var l = dLabel(m.km), b = prs()[l], gold = !!(b && b.id === m.id), edge = "";
    for (var i = -5; i <= 5; i++) edge += '<i class="mdE" style="transform:translateZ(' + i + 'px)"></i>';
    var h = '<h2 style="text-align:center">' + (isNew ? (gold ? "¡Nuevo récord personal!" : "¡Medalla conseguida!") : esc(m.name)) + '</h2>' +
      '<div class="md3' + (gold ? " gold" : "") + '" id="md3"><span class="mdR"></span><div class="mdC" id="mdc">' + edge +
      '<div class="mdF"><small>RUNIVERSO</small><b>' + (l.length <= 3 ? l : "★") + '</b><span>' + m.date.slice(0, 4) + '</span></div>' +
      '<div class="mdB"><small>' + esc(m.name) + '</small><b>' + fmtT(m.sec) + '</b><span>' + pace(m.sec, m.km) + '</span><span>' + sdate(pd(m.date)) + '</span></div></div></div>' +
      '<p class="muted" style="text-align:center;margin:0">' + (gold ? "Tu mejor " + l + ". " : "") + 'Gírala con el dedo: detrás está tu tiempo.</p>' +
      '<button class="btn wide" type="button" data-card="' + m.id + '">Compartir mi marca</button><button class="btn alt wide" type="button" data-close="1">Cerrar</button>';
    openSheet(h, "Medalla de " + m.name);
    var c = $("mdc"), box = $("md3"), ang = isNew ? -200 : 20, vel = isNew ? 14 : 1, drag = false, lx = 0;
    if (!c) return;
    box.addEventListener("pointerdown", function (e) { drag = true; lx = e.clientX; vel = 0; if (box.setPointerCapture) box.setPointerCapture(e.pointerId); });
    box.addEventListener("pointermove", function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; ang += dx * 0.9; vel = dx * 0.9; });
    var up2 = function () { drag = false; }; box.addEventListener("pointerup", up2); box.addEventListener("pointercancel", up2);
    (function loop() {
      if (!document.body.contains(c)) return;
      if (!drag) { ang += vel; vel += ((RM ? 0 : 0.7) - vel) * 0.035; }
      c.style.transform = "rotateX(-10deg) rotateY(" + ang.toFixed(1) + "deg)";
      requestAnimationFrame(loop);
    })();
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains("scrim")) { closeSheet(); return; }
    var c = t.closest("button[data-close]"); if (c) { closeSheet(); return; }
    var au = t.closest("[data-auth]");
    if (au) {
      var am = au.getAttribute("data-auth"), aei = $("ae"); if (aei) authEmail = aei.value.trim();
      if (am === "eye") { var pi = $("ap"); if (pi) { var sh = pi.type === "password"; pi.type = sh ? "text" : "password"; au.textContent = sh ? "Ocultar" : "Ver"; } return; }
      if (am === "google") { sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } }); return; }
      if (am === "resend") { var rt = au.getAttribute("data-type"); (rt === "recovery" ? sb.auth.resetPasswordForEmail(authEmail, { redirectTo: location.origin + location.pathname }) : rt === "signup" ? sb.auth.resend({ type: "signup", email: authEmail }) : sb.auth.signInWithOtp({ email: authEmail })).then(function (r) { authScreen("code-" + rt, r.error ? authErr(r.error) : "", r.error ? "" : "Código reenviado."); }); return; }
      authScreen(am); return;
    }
    var rs0 = t.closest("[data-res]"); if (rs0) { resScreen(rs0.getAttribute("data-res")); return; }
    var cl0 = t.closest("[data-claim]");
    if (cl0) { cl0.disabled = true; sb.rpc("claim_result", { rid: +cl0.getAttribute("data-claim") }).then(function (r) { if (r.error) { toast("No se ha podido guardar"); cl0.disabled = false; return; } toast("¡Resultado guardado en tu perfil!"); pull(); resScreen(resState.id, resState.q); }); return; }
    var uc0 = t.closest("[data-unclaim]");
    if (uc0) { sb.rpc("unclaim_result", { rid: +uc0.getAttribute("data-unclaim") }).then(function () { toast("Hecho"); resScreen(resState.id, resState.q); }); return; }
    var pu = t.closest(".poster[data-url]"); if (pu) { window.open(pu.getAttribute("data-url"), "_blank", "noopener"); return; }
    var ob = t.closest("[data-onb]");
    if (ob) { var v = ob.getAttribute("data-onb"); if (v === "done") onbDone(); else if (v === "signup") { S.onb = true; save(); closeSheet(); render(); authScreen("signup"); } else onboarding(+v); return; }
    var wd = t.closest("[data-day]"); if (wd) { view.day = +wd.getAttribute("data-day"); var pool = S.prov ? upcoming().filter(inProv) : upcoming(), w = $("wkw"); w.innerHTML = weekStrip(pool); var nb = w.querySelector('[data-day="' + view.day + '"]'); if (nb && nb.scrollIntoView) nb.scrollIntoView({ block: "nearest", inline: "nearest" }); return; }
    var exb = t.closest("[data-ex]"); if (exb) { view.ex = exb.getAttribute("data-ex"); render(); return; }
    var rc = t.closest("[data-race]:not([data-act])"); if (rc) { raceSheet(rc.getAttribute("data-race")); return; }
    var mi = t.closest("[data-mine]");
    if (mi) { var id = mi.getAttribute("data-mine"); if (S.mine[id]) { delete S.mine[id]; queue({ t: "mine-", id: id }); } else { S.mine[id] = true; queue({ t: "mine+", id: id }); } save(); toast(S.mine[id] ? (user && !pushOn() ? "¡Apuntada! Activa los avisos en tu perfil y te la recordamos" : "¡Apuntada! La verás en Inicio") : "Ya no estás apuntado"); render(); raceSheet(id); return; }
    var cd = t.closest("[data-card]"); if (cd) { cardSheet(cd.getAttribute("data-card")); return; }
    var dc = t.closest("[data-dlcard]");
    if (dc) { cardBlob(dc.getAttribute("data-dlcard"), function (bl, m) { var a = document.createElement("a"); a.href = URL.createObjectURL(bl); a.download = "runiverso-" + dLabel(m.km).replace(/[^a-z0-9]+/gi, "") + "-" + m.date + ".png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500); toast("Imagen descargada"); }); return; }
    var sc2 = t.closest("[data-sharecard]");
    if (sc2) {
      cardBlob(sc2.getAttribute("data-sharecard"), function (bl, m) {
        var file = new File([bl], "runiverso-marca.png", { type: "image/png" }), txt = m.name + ": " + fmtT(m.sec) + " (" + pace(m.sec, m.km) + "). Mis carreras en runiverso.com · Avisos de carreras: " + CANAL;
        if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], text: txt }).catch(function () {});
        else { toast("Tu móvil no permite compartir imágenes desde aquí: descárgala y súbela"); }
      });
      return;
    }
    var md0 = t.closest("[data-medal]"); if (md0) { medalSheet(md0.getAttribute("data-medal")); return; }
    var ic = t.closest("[data-ics]"); if (ic) { ics(BY[ic.getAttribute("data-ics")]); return; }
    var sh = t.closest("[data-share]"); if (sh) { share(BY[sh.getAttribute("data-share")]); return; }
    var f = t.closest("[data-f]"); if (f) { view.f = f.getAttribute("data-f"); view.lim = 30; render(); return; }
    var zpb = t.closest && t.closest("[data-zp]"); if (zpb) { view.zp = zpb.getAttribute("data-zp"); view.lim = 30; view.q = ""; render(); var tb = document.querySelector('.ztabs [aria-selected="true"]'); if (tb && tb.scrollIntoView) tb.scrollIntoView({ block: "nearest", inline: "center" }); return; }
    var sc = t.closest("[data-sc]"); if (sc) { view.sc = sc.getAttribute("data-sc"); view.lim = 30; view.q = ""; render(); return; }
    var sbt = t.closest("[data-sub]"); if (sbt) { view.sub = sbt.getAttribute("data-sub"); render(); return; }
    var dl = t.closest("[data-del]");
    if (dl) { var mid = dl.getAttribute("data-del"); if (dl.getAttribute("data-sure")) { S.marks = S.marks.filter(function (m) { return m.id !== mid; }); queue({ t: "mark-", id: mid }); save(); toast("Marca borrada"); render(); } else { dl.setAttribute("data-sure", "1"); dl.style.borderColor = "#FF8A8A"; dl.style.color = "#FF8A8A"; dl.setAttribute("aria-label", "Pulsa otra vez para borrar"); toast("Pulsa otra vez para borrar"); } return; }
    var a = t.closest("[data-act]");
    if (a) {
      var act = a.getAttribute("data-act");
      if (act === "more") { view.lim += 30; $("rlist").innerHTML = raceGrid(filtered()); }
      else if (act === "name") nameSheet();
      else if (act === "zone") zoneSheet(false);
      else if (act === "addmark") markSheet(a.getAttribute("data-race") || "");
      else if (act === "login") authScreen("signup");
      else if (act === "logout") logout();
      else if (act === "delacct") delSheet();
      else if (act === "delacct-go") deleteAccount(a);
      else if (act === "pushon") enablePush();
      else if (act === "pushoff") disablePush();
      else if (act === "gopublic") { S.pub = true; save(); queue({ t: "prof" }); rankCache = {}; toast("¡Ya apareces en el ranking!"); setTimeout(function () { rankCache = {}; render(); }, 1500); render(); }
      else if (act === "install" && deferredInstall) { deferredInstall.prompt(); deferredInstall.userChoice.finally(function () { deferredInstall = null; render(); }); }
    }
  });
  document.addEventListener("input", function (e) {
    if (e.target.id === "q") { view.q = e.target.value; view.lim = 30; var l = filtered(); $("rlist").innerHTML = raceGrid(l); $("cnt").textContent = countText(l); }
    if (e.target.closest && e.target.closest("#markf")) updPace();
  });
  document.addEventListener("change", function (e) {
    if (e.target.id === "mrace") { var r = BY[e.target.value]; $("mnamew").hidden = !!r; if (r) { $("mdate").value = r.d; if (KM[r.k]) { $("mdist").value = String(KM[r.k]); $("mkmw").hidden = true; } } updPace(); }
    if (e.target.id === "zc") { $("zp").innerHTML = provOpts(e.target.value, ""); }
    if (e.target.id === "mdist") { $("mkmw").hidden = e.target.value !== "otra"; updPace(); }
    if (e.target.id === "rescsv" && e.target.files[0]) { importCSV(e.target.files[0], e.target.getAttribute("data-race")); return; }
    if (e.target.id === "pubtog") { S.pub = e.target.checked; save(); queue({ t: "prof" }); rankCache = {}; toast(S.pub ? "Apareces en el ranking" : "Ya no apareces en el ranking"); }
  });
  document.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.id === "onbf") { e.preventDefault(); S.ccaa = $("zc").value; S.prov = $("zp").value; save(); queue({ t: "prof" }); rankCache = {}; view.zp = ""; view.sc = "prov"; view.f = ""; view.day = null; onboarding(2); return; }
    if (e.target.id === "zonef") { S.ccaa = $("zc").value; S.prov = $("zp").value; save(); queue({ t: "prof" }); rankCache = {}; view.zp = ""; view.sc = "prov"; view.f = ""; closeSheet(); render(); toast("Tu zona: " + S.prov); return; }
    if (e.target.id === "namef") { S.name = $("nm").value.trim(); save(); queue({ t: "prof" }); closeSheet(); render(); toast(S.name ? "¡Hola, " + S.name.split(" ")[0] + "!" : "Nombre borrado"); return; }
    if (e.target.id === "resq") { resScreen(resState.id, $("rq").value.trim()); return; }
    if (e.target.id === "authf") {
      var fm = e.target, up = fm.getAttribute("data-mode") === "signup", em = $("ae").value.trim(), pw = $("ap").value;
      authEmail = em;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { authScreen(up ? "signup" : "login", "Ese correo no parece válido."); return; }
      if (pw.length < (up ? 8 : 1)) { authScreen(up ? "signup" : "login", up ? "La contraseña necesita al menos 8 caracteres." : "Escribe tu contraseña."); return; }
      if (up) {
        var nmv = $("an").value.trim(); if (nmv) { S.name = nmv; save(); }
        busyBtn(fm, "Creando tu cuenta…");
        sb.auth.signUp({ email: em, password: pw, options: { data: { name: nmv }, emailRedirectTo: location.origin + location.pathname } }).then(function (r) {
          if (r.error) { authScreen("signup", authErr(r.error)); return; }
          if (r.data.user && r.data.user.identities && !r.data.user.identities.length) { authScreen("login", "Ya hay una cuenta con ese correo. Entra con tu contraseña o con un código."); return; }
          if (r.data.session) { authDone("¡Cuenta creada!"); return; }
          authScreen("code-signup");
        });
      } else {
        busyBtn(fm, "Entrando…");
        sb.auth.signInWithPassword({ email: em, password: pw }).then(function (r) {
          if (r.error) { var m = authErr(r.error); if (m === "confirm") { sb.auth.resend({ type: "signup", email: em }); authScreen("code-signup", "", "Antes de entrar confirma tu correo: te hemos enviado un código."); } else authScreen("login", m); return; }
          authDone("¡Hola de nuevo!");
        });
      }
      return;
    }
    if (e.target.id === "sendf") {
      var fm2 = e.target, fg = fm2.getAttribute("data-mode") === "forgot", em2 = $("ae").value.trim();
      authEmail = em2;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em2)) { authScreen(fg ? "forgot" : "otp", "Ese correo no parece válido."); return; }
      busyBtn(fm2, "Enviando…");
      var pr = fg ? sb.auth.resetPasswordForEmail(em2, { redirectTo: location.origin + location.pathname }) : sb.auth.signInWithOtp({ email: em2, options: { emailRedirectTo: location.origin + location.pathname } });
      pr.then(function (r) { if (r.error) authScreen(fg ? "forgot" : "otp", authErr(r.error)); else authScreen(fg ? "code-recovery" : "code-email"); });
      return;
    }
    if (e.target.id === "codef") {
      var ty = e.target.getAttribute("data-type"), tk = $("otp").value.replace(/\D/g, "");
      if (tk.length < 6) { authScreen("code-" + ty, "El código tiene 6 cifras."); return; }
      busyBtn(e.target, "Comprobando…");
      sb.auth.verifyOtp({ email: authEmail, token: tk, type: ty }).then(function (r) {
        if (r.error) { authScreen("code-" + ty, authErr(r.error)); return; }
        if (ty === "recovery") authScreen("newpass"); else authDone(ty === "signup" ? "¡Cuenta creada!" : "");
      });
      return;
    }
    if (e.target.id === "newpf") {
      var np = $("ap").value;
      if (np.length < 8) { authScreen("newpass", "La contraseña necesita al menos 8 caracteres."); return; }
      busyBtn(e.target, "Guardando…");
      sb.auth.updateUser({ password: np }).then(function (r) { if (r.error) authScreen("newpass", authErr(r.error)); else authDone("Contraseña guardada"); });
      return;
    }
    if (e.target.id === "markf") {
      var v = readMark(), err = "";
      if (!v.name) err = "Escribe el nombre de la carrera o elígela de la lista.";
      else if (!v.date) err = "Pon la fecha de la carrera.";
      else if (pd(v.date) > today) err = "La fecha no puede ser futura: añade la marca cuando la hayas corrido.";
      else if (!(v.km > 0)) err = "Indica la distancia en kilómetros.";
      else if (!(v.sec > 0)) err = "Escribe tu tiempo oficial (horas, minutos y segundos).";
      else if (v.sec / v.km < 120) err = "Ese tiempo es demasiado rápido para la distancia: revísalo.";
      if (err) { var keep = { name: v.name, date: v.date, km: v.km, h: v.h, m: v.m, s: v.s }; markSheet(v.rid, err, keep); return; }
      var b = prs()[dLabel(v.km)], isPr = !b || v.sec < b.sec, nid = uuid(), nm = { id: nid, raceId: v.rid || "", name: v.name, km: v.km, sec: v.sec, date: v.date };
      S.marks.push(nm); queue({ t: "mark+", m: nm });
      if (v.rid && S.mine[v.rid]) { delete S.mine[v.rid]; queue({ t: "mine-", id: v.rid }); }
      save(); closeSheet(); view.tab = "perfil"; view.sub = isPr ? "vitrina" : "marcas";
      if (location.hash !== "#perfil") location.hash = "#perfil"; else render();
      medalSheet(nid, true);
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("layer").innerHTML) closeSheet(); });
  window.addEventListener("hashchange", route);
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferredInstall = e; if (view.tab === "inicio") render(); });
  // Actualización automática: al volver a la app busca versión nueva y, si la hay, recarga una vez
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    var hadCtrl = !!navigator.serviceWorker.controller, reloaded = false;
    navigator.serviceWorker.register("sw.js").then(function (reg) {
      var check = function () { reg.update().catch(function () {}); };
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") check(); });
      setInterval(check, 30 * 60 * 1000);
    }).catch(function () {});
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadCtrl || reloaded || $("layer").innerHTML) { hadCtrl = true; return; }
      reloaded = true; location.reload();
    });
  }
  route();
  initCloud();
  motion.tilt();
})();
