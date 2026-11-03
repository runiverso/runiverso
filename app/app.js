/* Runiverso App v1 · carreras, apuntarse, marcas y vitrina (guardado en el móvil) */
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

  /* ---------- Datos guardados en el móvil ---------- */
  var KEY = "runiverso-app-v1";
  var S = { name: "", mine: {}, marks: [], prov: "", ccaa: "" };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) { S.name = saved.name || ""; S.mine = saved.mine || {}; S.marks = saved.marks || []; S.prov = saved.prov || ""; S.ccaa = saved.ccaa || ""; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("No se ha podido guardar en este móvil"); } }

  /* ---------- Carreras ---------- */
  var RACES = (window.RV_RACES || []).map(function (r) { r.date = pd(r.d); r.hay = norm([r.n, r.c, r.r, r.p, r.k].join(" ")); return r; });
  var BY = {}; RACES.forEach(function (r) { BY[r.id] = r; });
  var RESULTS = window.RV_RESULTS || [];
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function upcoming() { return RACES.filter(function (r) { return daysTo(r.date) >= 0; }); }
  var ZONES = window.RV_ZONES || {};
  function ccaaOf(p) { for (var k in ZONES) if (ZONES[k].indexOf(p) >= 0) return k; return ""; }
  function inProv(r) { return !!S.prov && r.p === S.prov; }
  function inCcaa(r) { return !!S.ccaa && r.r === S.ccaa; }
  function scopeName(sc) { return sc === "prov" ? (S.prov || "Tu provincia") : sc === "ccaa" ? (S.ccaa || "Tu comunidad") : "España"; }
  /* Orden por cercanía: tu provincia, tu comunidad y luego el resto */
  function near(a, b) { var x = inProv(a) ? 0 : inCcaa(a) ? 1 : 2, y = inProv(b) ? 0 : inCcaa(b) ? 1 : 2; return x - y || a.date - b.date; }
  var KM = { "21K": 21.0975, "42K": 42.195, "10K": 10 };
  var LABEL = { "21K": "Media", "42K": "Maratón", "10K": "10K", "TR": "Trail", "SS": "San Silvestre", "POP": "Popular" };
  var MARK = '<svg viewBox="12 12 96 96" aria-hidden="true"><path d="M44 30V90M44 30H64a17 17 0 0 1 0 34H44" fill="none" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 64L82 90" fill="none" stroke="#7FA6FF" stroke-width="11" stroke-linecap="round"/></svg>';

  function poster(r, tag, extra) {
    var C = window.CARTELES || {};
    var at = ' data-k="' + r.k + '" data-race="' + r.id + '" type="button" aria-label="' + esc(r.n) + ': ver ficha"';
    var t = tag || (S.mine[r.id] ? '<span class="tag mine">Apuntada</span>' : (r.ok ? '' : '<span class="tag">Por confirmar</span>'));
    if (C[r.id]) return '<button class="poster"' + at + ' style="padding:0"><img src="../carteles/' + C[r.id] + '" alt="" style="width:100%;height:100%;object-fit:cover">' + t + '</button>';
    var dist = String(r.dist || "").replace(/^Trail · /, "");
    if (/^(Trail|Popular|San Silvestre)$/.test(dist)) dist = "";
    return '<button class="poster"' + at + (extra || "") + '><span class="pt">' + MARK + LABEL[r.k] + (dist ? '<span class="pdist">' + esc(dist) + '</span>' : '') + '</span>' +
      '<span class="pn">' + esc(r.n) + '</span><span class="pc">' + esc(r.c) + (r.p && r.c.indexOf(r.p) < 0 && r.p !== S.prov ? " · " + esc(r.p) : "") + '</span>' +
      '<span class="pdate"><b>' + pad(r.date.getDate()) + '</b><span>' + MES_C[r.date.getMonth()] + '<small>' + r.date.getFullYear() + '</small></span></span>' + t + '</button>';
  }
  function item(r) {
    return '<div class="item">' + poster(r) + '<div><h3>' + esc(r.n) + '</h3><p>' + esc(r.c) + ' · ' + pad(r.date.getDate()) + '/' + pad(r.date.getMonth() + 1) + '</p></div></div>';
  }

  /* ---------- Marcas ---------- */
  var DKEYS = [[5, "5K"], [10, "10K"], [21.0975, "21K"], [42.195, "42K"]];
  function dLabel(km) { for (var i = 0; i < DKEYS.length; i++) if (Math.abs(DKEYS[i][0] - km) < 0.05) return DKEYS[i][1]; return (Math.round(km * 10) / 10 + " km").replace(".", ","); }
  function prs() { var b = {}; S.marks.forEach(function (m) { var l = dLabel(m.km); if (!b[l] || m.sec < b[l].sec) b[l] = m; }); return b; }
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
    var h = (location.hash || "#inicio").slice(1).split("?");
    var t = h[0]; if (!TABS.some(function (x) { return x[0] === t; })) t = "inicio";
    view.tab = t;
    if (h[1]) { var m = /sc=(prov|ccaa|es)/.exec(h[1]); if (m) { view.sc = m[1]; view.f = ""; view.lim = 30; } }
    render(); window.scrollTo(0, 0);
  }
  function renderTabs() {
    $("tabbar").innerHTML = TABS.map(function (t) {
      return '<a href="#' + t[0] + '"' + (view.tab === t[0] ? ' aria-current="page"' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + t[2] + '"/></svg>' + t[1] + '</a>';
    }).join("");
    var ini = (S.name || "?").split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
    $("topav").textContent = ini;
  }
  function render() {
    renderTabs();
    var fn = { inicio: vInicio, carreras: vCarreras, perfil: vPerfil, clasificaciones: vResultados, comunidad: vComunidad }[view.tab];
    $("main").innerHTML = '<div class="view">' + fn() + '</div>';
    if (!S.prov && !zoneAsked) { zoneAsked = true; zoneSheet(true); }
  }
  var zoneAsked = false;
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
    var mine = up.filter(function (r) { return S.mine[r.id]; });
    var h = installBanner();
    h += '<div><p class="kick">' + cap(fdate(today)) + '</p><h1>Hola' + (S.name ? ", " + esc(S.name.split(" ")[0]) : "") + '</h1>' +
      '<div class="row" style="margin-top:10px">' + zoneChip() + (S.name ? '' : '<button class="btn sm alt" type="button" data-act="name">Pon tu nombre</button>') + '</div></div>';
    if (mine.length) {
      var r = mine[0], d = daysTo(r.date);
      h += '<button class="dorsal" type="button" data-race="' + r.id + '"><span class="band"><i></i>Tu próximo dorsal<i></i></span><span class="bd">' +
        '<span class="nums"><span class="num">' + pad(r.date.getDate()) + ' ' + MES_C[r.date.getMonth()].toUpperCase() + '</span><span class="days"><b>' + (d === 0 ? "HOY" : d) + '</b><span>' + (d === 0 ? "a correr" : d === 1 ? "día" : "días") + '</span></span></span>' +
        '<span class="nm">' + esc(r.n) + '</span><span class="mt">' + esc(r.c) + ' · ' + esc(r.dist) + (r.h ? ' · salida ' + esc(r.h) : '') + '</span></span></button>';
    } else {
      h += '<div class="card empty"><h2>Apúntate a tu primera carrera</h2><p>Elige una carrera, pulsa «Apuntarme» y aquí verás la cuenta atrás.</p><a class="btn" href="#carreras">Ver carreras</a></div>';
    }
    var sm = seasonMarks(), km = sm.reduce(function (a, m) { return a + m.km; }, 0);
    h += '<div class="sec"><div class="sechd"><h2>Tu temporada ' + String(seasonStart().getFullYear()).slice(2) + '/' + String(seasonStart().getFullYear() + 1).slice(2) + '</h2><a href="#perfil">Mis marcas ›</a></div><div class="stats">' +
      '<div class="stat"><b>' + sm.length + '</b><span>Carreras</span></div><div class="stat"><b>' + Math.round(km) + '</b><span>Kilómetros</span></div><div class="stat"><b>' + S.marks.length + '</b><span>Medallas</span></div></div></div>';
    if (S.prov) {
      var lp = up.filter(inProv), lc = up.filter(function (r) { return inCcaa(r) && !inProv(r); });
      h += '<div class="sec"><div class="sechd"><h2>En ' + esc(S.prov) + '</h2><a href="#carreras?sc=prov">Ver ' + lp.length + ' ›</a></div>' + (lp.length ? '<div class="hscroll">' + lp.slice(0, 10).map(function (r) { return poster(r); }).join("") + '</div>' : '<div class="card empty"><p>Aún no tenemos carreras en ' + esc(S.prov) + '. ¿Conoces alguna? Avísanos en el canal y la añadimos.</p></div>') + '</div>';
      if (S.ccaa !== S.prov) h += '<div class="sec"><div class="sechd"><h2>Resto de ' + esc(S.ccaa) + '</h2><a href="#carreras?sc=ccaa">Ver ' + lc.length + ' ›</a></div>' + (lc.length ? '<div class="hscroll">' + lc.slice(0, 10).map(function (r) { return poster(r); }).join("") + '</div>' : '<p class="muted" style="margin:0">Sin más carreras en tu comunidad de momento.</p>') + '</div>';
      var rest = up.filter(function (r) { return !inCcaa(r); }).length;
      h += '<a class="card" href="#carreras?sc=es" style="text-decoration:none;display:flex;gap:14px;align-items:center"><span class="zic">ES</span><span style="flex:1;min-width:0"><b style="font-family:var(--display);font-size:17px;letter-spacing:-.02em">Resto de España</b><br><span class="muted" style="font-size:13.5px">' + rest + ' carreras fuera de tu comunidad</span></span><span aria-hidden="true" style="color:var(--sky);font-weight:800">›</span></a>';
    } else {
      h += '<div class="sec"><div class="sechd"><h2>Próximas carreras</h2><a href="#carreras">Ver todas ›</a></div><div class="hscroll">' + up.slice(0, 10).map(function (r) { return poster(r); }).join("") + '</div></div>';
    }
    if (RESULTS.length) {
      h += '<div class="sec"><div class="sechd"><h2>Últimos resultados</h2><a href="#clasificaciones">Ver todos ›</a></div><div class="list">' + RESULTS.slice().sort(function (a, b) { return near({ p: a.p, r: ccaaOf(a.p), date: -pd(a.d) }, { p: b.p, r: ccaaOf(b.p), date: -pd(b.d) }); }).slice(0, 3).map(resLi).join("") + '</div></div>';
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
    var q = norm(view.q.trim()).split(/\s+/).filter(Boolean), sc = S.prov ? view.sc : "es";
    return upcoming().filter(function (r) {
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
    if (S.prov) {
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
  function countText(list) { return list.length + (list.length === 1 ? " carrera" : " carreras") + (view.q.trim() ? " en toda España" : S.prov ? " · " + scopeName(view.sc) : ""); }
  /* Agrupa: en tu provincia por meses; en tu comunidad por provincias (la tuya primero); en España por comunidades (la tuya primero) */
  function raceGrid(list) {
    if (!list.length) return '<div class="card empty"><p>' + (view.f === "mine" ? "Aún no te has apuntado a ninguna carrera." : "No hay carreras con ese filtro" + (S.prov && view.sc !== "es" ? " en " + esc(scopeName(view.sc)) + "." : ".")) + '</p>' + (S.prov && view.sc !== "es" ? '<button class="btn sm alt" type="button" data-sc="es">Ver toda España</button>' : '') + '</div>';
    var sc = S.prov && !view.q.trim() ? view.sc : "month", key, groups = [], idx = {};
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
      out += '<section class="grp"><h2 class="gh">' + cap(esc(g.k)) + '<span>' + g.items.length + '</span></h2><div class="grid">' + it.map(item).join("") + '</div></section>';
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
    h += { marcas: pMarcas, vitrina: pVitrina, mis: pMis }[view.sub]();
    h += '<p class="foot">Tus datos se guardan solo en este móvil. Con las cuentas de Runiverso podrás llevarlos a cualquier dispositivo.</p>';
    return h;
  }
  function pMarcas() {
    var b = prs();
    var h = '<div class="prs">' + DKEYS.map(function (k) {
      var m = b[k[1]];
      return '<div class="pr' + (m ? "" : " none") + '"><span class="d">' + (k[1] === "21K" ? "Media" : k[1] === "42K" ? "Maratón" : k[1]) + '</span><b>' + (m ? fmtT(m.sec) : "—") + '</b><span>' + (m ? pace(m.sec, m.km) + " · " + sdate(pd(m.date)) : "Sin marca todavía") + '</span></div>';
    }).join("") + '</div>';
    h += '<button class="btn wide" type="button" data-act="addmark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Añadir marca</button>';
    var ms = S.marks.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    h += '<div class="sec"><h2>Historial</h2>' + (ms.length ? '<div class="list">' + ms.map(function (m) {
      var d = pd(m.date);
      return '<div class="li"><span class="dt"><b>' + d.getDate() + '</b><span>' + MES_C[d.getMonth()] + '</span></span><span class="tx"><b>' + esc(m.name) + '</b><span>' + dLabel(m.km) + ' · ' + d.getFullYear() + '</span></span><span class="tm">' + fmtT(m.sec) + '<small>' + pace(m.sec, m.km) + '</small></span><button class="x" type="button" data-del="' + m.id + '" aria-label="Borrar marca de ' + esc(m.name) + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';
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
      return '<div class="medal' + (prIds[m.id] ? " gold" : "") + '" style="--r1:' + rb[0] + ';--r2:' + rb[1] + '"><span class="rib"><i></i><i></i></span><span class="disc"><b>' + (l.length <= 3 ? l : "★") + '</b><small>' + m.date.slice(0, 4) + '</small></span><span>' + esc(m.name) + '</span></div>';
    });
    upcoming().filter(function (r) { return S.mine[r.id]; }).slice(0, 3).forEach(function (r) {
      medals.push('<div class="medal lock"><span class="rib"><i></i><i></i></span><span class="disc"><b>' + (r.k === "TR" || r.k === "POP" ? "?" : r.k) + '</b><small>' + r.date.getFullYear() + '</small></span><span>' + esc(r.n) + '</span></div>');
    });
    if (!b["42K"]) medals.push('<div class="medal lock"><span class="rib"><i></i><i></i></span><span class="disc"><b>42K</b><small>?</small></span><span>Tu primera maratón</span></div>');
    while (medals.length < 6) medals.push('<div class="medal lock"><span class="rib"><i></i><i></i></span><span class="disc"><b>?</b></span><span>Próxima medalla</span></div>');
    var h = '<div class="sechd"><h2>Mi vitrina</h2><span class="muted" style="font-size:13px">' + S.marks.length + (S.marks.length === 1 ? ' medalla' : ' medallas') + ' · en oro, tus récords</span></div><div class="vitrina">' + medals.join("") + '</div>';
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
        return '<div class="item">' + poster(fake, '<span class="tag done">Terminada</span>', ' data-url="' + esc(r.url) + '"') + '<div><h3>' + esc(r.n) + '</h3><p>' + esc(r.c) + ' · ' + sdate(d) + '</p></div><a class="btn sm" href="' + esc(r.url) + '" target="_blank" rel="noopener">Clasificación ›</a></div>';
      }).join("") + '</div>';
    }
    if (S.ccaa) {
      var mine = RESULTS.filter(function (r) { return ccaaOf(r.p) === S.ccaa; }), rest = RESULTS.filter(function (r) { return ccaaOf(r.p) !== S.ccaa; });
      h += '<section class="grp"><h2 class="gh">En ' + esc(S.ccaa) + '<span>' + mine.length + '</span></h2>' + (mine.length ? cards(mine) : '<p class="muted" style="margin:0">Todavía no hay resultados de tu comunidad. Los añadimos según se publican.</p>') + '</section>';
      if (rest.length) h += '<section class="grp"><h2 class="gh">Resto de España<span>' + rest.length + '</span></h2>' + cards(rest) + '</section>';
    } else h += cards(RESULTS);
    h += '<p class="foot">Cada clasificación la publica la organización o su empresa de cronometraje.</p>';
    return h;
  }

  /* ---------- Comunidad (próximamente) ---------- */
  function vComunidad() {
    var C = [
      ["Ranking anual", "Quién hace más carreras, 10K, medias y maratones en la temporada: en tu provincia, en tu comunidad y en toda España.", "M9 21V9h6v12M3 21v-7h6M15 21v-5h6M3 21h18", ""],
      ["Clubes", "Los clubes de tu provincia con su espacio: sus corredores, sus carreras y su propio ranking.", "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11.5a2.5 2.5 0 1 0 0-5M15 14.5c3 0 6 2 6 5.5", ""],
      ["Muro", "Fotos y marcas de los corredores de tu zona después de cada carrera.", "M4 5h16v15H4zM9 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 17l-5-5-9 8", ""],
      ["Runiverso Pro", "Alertas antes de que suban los dorsales, plan hacia tu carrera, predicción de tiempos y ranking por edad.", "M13 2L4 14h7l-1 8 9-12h-7z", "pro"]
    ];
    var h = '<div><h1>Comunidad</h1><p class="kick">' + (S.prov ? "Los corredores de " + esc(S.prov) + " y " + esc(S.ccaa) + ", muy pronto" : "Llega con las cuentas de Runiverso") + '</p></div>';
    h += C.map(function (c) {
      return '<div class="card soon"><span class="ic"' + (c[3] ? ' style="color:var(--pro)"' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + c[2] + '"/></svg></span><div><h3>' + c[0] + (c[3] ? ' <span class="pill pro">Pro</span>' : ' <span class="pill">Próximamente</span>') + '</h3><p>' + c[1] + '</p></div></div>';
    }).join("");
    h += '<div class="card" style="display:flex;flex-direction:column;gap:12px"><p style="margin:0">Te avisaremos en cuanto abramos las cuentas. Síguenos para enterarte el primero:</p><div class="row"><a class="btn" href="https://whatsapp.com/channel/0029VbDrJk2InlqSVj746L0L" target="_blank" rel="noopener">Canal de WhatsApp</a><a class="btn alt" href="https://www.tiktok.com/@runiverso_" target="_blank" rel="noopener">TikTok</a></div></div>';
    return h;
  }

  /* ---------- Hojas (ficha, marca, nombre) ---------- */
  var lastFocus = null;
  function openSheet(html, label) {
    lastFocus = document.activeElement;
    $("layer").innerHTML = '<div class="scrim" data-close="1"><div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(label) + '"><span class="grab" aria-hidden="true"></span>' + html + '</div></div>';
    var f = $("layer").querySelector(".sheet input, .sheet button, .sheet a"); if (f) f.focus();
  }
  function closeSheet() { $("layer").innerHTML = ""; if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  function raceSheet(id) {
    var r = BY[id]; if (!r) return;
    var on = !!S.mine[id], d = daysTo(r.date);
    var h = '<div class="shead">' + poster(r).replace('data-race="', 'data-x="') + '<div style="display:flex;flex-direction:column;gap:8px"><h2>' + esc(r.n) + '</h2><span class="st ' + (r.ok ? "ok" : "prov") + '">' + (r.ok ? "Fecha confirmada" : "Fecha por confirmar") + '</span><span class="muted" style="font-size:14px">' + (d === 0 ? "Es hoy" : d > 0 ? "Faltan " + d + (d === 1 ? " día" : " días") : "Ya celebrada") + '</span></div></div>';
    h += '<dl class="facts"><div><dt>Fecha</dt><dd>' + cap(fdate(r.date)) + (r.h ? ", " + esc(r.h) : "") + '</dd></div><div><dt>Lugar</dt><dd>' + esc(r.c) + ', ' + esc(r.r) + '</dd></div><div><dt>Distancia</dt><dd>' + esc(r.dist || LABEL[r.k]) + '</dd></div>' + (r.x && r.x.length ? '<div><dt>También</dt><dd>' + r.x.map(esc).join(" · ") + '</dd></div>' : '') + '</dl>';
    if (r.t) h += '<p class="note">' + esc(r.t) + '</p>';
    if (r.m && (r.m.h || r.m.f)) {
      h += '<div class="marks"><span class="k">Ganadores · ' + esc(r.m.ed) + '</span>' + [["Hombres", r.m.h], ["Mujeres", r.m.f]].filter(function (x) { return x[1]; }).map(function (x) { return '<span class="r"><span>' + x[0] + ': ' + esc(x[1][0]) + '</span><b>' + esc(x[1][2]) + '</b></span>'; }).join("") + '</div>';
    }
    h += '<button class="btn wide ' + (on ? "ok" : "") + '" type="button" data-mine="' + id + '">' + (on ? "✓ Apuntada · quitar" : "Apuntarme") + '</button>';
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
  function share(r) {
    var text = r.n + " · " + sdate(r.date) + " · " + r.c, url = "https://runiverso.com/app/";
    if (navigator.share) { navigator.share({ title: r.n, text: text, url: url }).catch(function () {}); return; }
    var full = text + "\n" + url;
    if (navigator.clipboard) navigator.clipboard.writeText(full).then(function () { toast("Enlace copiado"); }, function () { window.open("https://wa.me/?text=" + encodeURIComponent(full), "_blank"); });
    else window.open("https://wa.me/?text=" + encodeURIComponent(full), "_blank");
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains("scrim")) { closeSheet(); return; }
    var c = t.closest("button[data-close]"); if (c) { closeSheet(); return; }
    var pu = t.closest(".poster[data-url]"); if (pu) { window.open(pu.getAttribute("data-url"), "_blank", "noopener"); return; }
    var rc = t.closest("[data-race]:not([data-act])"); if (rc) { raceSheet(rc.getAttribute("data-race")); return; }
    var mi = t.closest("[data-mine]");
    if (mi) { var id = mi.getAttribute("data-mine"); if (S.mine[id]) delete S.mine[id]; else S.mine[id] = true; save(); toast(S.mine[id] ? "¡Apuntada! La verás en Inicio" : "Ya no estás apuntado"); render(); raceSheet(id); return; }
    var ic = t.closest("[data-ics]"); if (ic) { ics(BY[ic.getAttribute("data-ics")]); return; }
    var sh = t.closest("[data-share]"); if (sh) { share(BY[sh.getAttribute("data-share")]); return; }
    var f = t.closest("[data-f]"); if (f) { view.f = f.getAttribute("data-f"); view.lim = 30; render(); return; }
    var sc = t.closest("[data-sc]"); if (sc) { view.sc = sc.getAttribute("data-sc"); view.lim = 30; view.q = ""; render(); return; }
    var sb = t.closest("[data-sub]"); if (sb) { view.sub = sb.getAttribute("data-sub"); render(); return; }
    var dl = t.closest("[data-del]");
    if (dl) { var mid = dl.getAttribute("data-del"); if (dl.getAttribute("data-sure")) { S.marks = S.marks.filter(function (m) { return m.id !== mid; }); save(); toast("Marca borrada"); render(); } else { dl.setAttribute("data-sure", "1"); dl.style.borderColor = "#FF8A8A"; dl.style.color = "#FF8A8A"; dl.setAttribute("aria-label", "Pulsa otra vez para borrar"); toast("Pulsa otra vez para borrar"); } return; }
    var a = t.closest("[data-act]");
    if (a) {
      var act = a.getAttribute("data-act");
      if (act === "more") { view.lim += 30; $("rlist").innerHTML = raceGrid(filtered()); }
      else if (act === "name") nameSheet();
      else if (act === "zone") zoneSheet(false);
      else if (act === "addmark") markSheet(a.getAttribute("data-race") || "");
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
  });
  document.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.id === "zonef") { S.ccaa = $("zc").value; S.prov = $("zp").value; save(); view.sc = "prov"; view.f = ""; closeSheet(); render(); toast("Tu zona: " + S.prov); return; }
    if (e.target.id === "namef") { S.name = $("nm").value.trim(); save(); closeSheet(); render(); toast(S.name ? "¡Hola, " + S.name.split(" ")[0] + "!" : "Nombre borrado"); return; }
    if (e.target.id === "markf") {
      var v = readMark(), err = "";
      if (!v.name) err = "Escribe el nombre de la carrera o elígela de la lista.";
      else if (!v.date) err = "Pon la fecha de la carrera.";
      else if (pd(v.date) > today) err = "La fecha no puede ser futura: añade la marca cuando la hayas corrido.";
      else if (!(v.km > 0)) err = "Indica la distancia en kilómetros.";
      else if (!(v.sec > 0)) err = "Escribe tu tiempo oficial (horas, minutos y segundos).";
      else if (v.sec / v.km < 120) err = "Ese tiempo es demasiado rápido para la distancia: revísalo.";
      if (err) { var keep = { name: v.name, date: v.date, km: v.km, h: v.h, m: v.m, s: v.s }; markSheet(v.rid, err, keep); return; }
      var b = prs()[dLabel(v.km)], isPr = !b || v.sec < b.sec;
      S.marks.push({ id: "m" + Date.now().toString(36), raceId: v.rid || "", name: v.name, km: v.km, sec: v.sec, date: v.date });
      if (v.rid) delete S.mine[v.rid];
      save(); closeSheet(); view.tab = "perfil"; view.sub = isPr ? "vitrina" : "marcas";
      if (location.hash !== "#perfil") location.hash = "#perfil"; else render();
      toast(isPr ? "¡Nuevo récord en " + dLabel(v.km) + "! Medalla de oro" : "Marca guardada. ¡Nueva medalla!");
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("layer").innerHTML) closeSheet(); });
  window.addEventListener("hashchange", route);
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferredInstall = e; if (view.tab === "inicio") render(); });
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () {});
  route();
})();
