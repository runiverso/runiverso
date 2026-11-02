/* Runiverso · lógica de la web (calendario, filtros, mapa, marcas y calculadora) */
(function () {
  "use strict";

  var R = window.RACES || [], MARKS = window.MARKS || {}, MAP = window.MAP;
  var TYPES = { "21K": "Media", "42K": "Maratón", "10K": "10K", "TR": "Trail" };
  var TYPE_WORDS = { "21K": "media maraton 21k", "42K": "maraton 42k", "10K": "10k 10 km", "TR": "trail montana ultra" };
  var DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  var DIAS_L = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MES_C = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var MES_L = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.6l6.1-.8z"/></svg>';
  var KM = { "21K": 21.0975, "42K": 42.195 };

  function $(id) { return document.getElementById(id); }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function pd(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fdate(d) { return DIAS_L[d.getDay()] + " " + d.getDate() + " de " + MES_L[d.getMonth()].toLowerCase() + " de " + d.getFullYear(); }
  function tsec(t) { var p = String(t).split(":").map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; }
  function fmt(sec, forceH) {
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    var mm = (h || forceH ? String(m).padStart(2, "0") : String(m)), ss = String(s).padStart(2, "0");
    return h || forceH ? h + ":" + mm + ":" + ss : mm + ":" + ss;
  }
  function paceOf(sec, km) { var p = sec / km; return Math.floor(p / 60) + ":" + String(Math.round(p % 60)).padStart(2, "0"); }

  var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  function daysTo(r) { return Math.round((r.date - today) / 86400000); }
  function cdText(n) {
    if (n === 0) return "hoy";
    if (n === 1) return "mañana";
    if (n < 0) return "ya celebrada";
    if (n < 60) return "en " + n + " días";
    return "en " + Math.round(n / 30.4) + " meses";
  }

  R.forEach(function (r) {
    r.date = pd(r.d);
    r.m = MARKS[r.n] || null;
    r.hay = norm([r.n, r.c, r.r, TYPE_WORDS[r.k] || ""].join(" "));
  });
  R.sort(function (a, b) { return a.date - b.date || a.n.localeCompare(b.n, "es"); });
  R.forEach(function (r, i) { r.id = i; });

  /* Favoritas (solo en este navegador) */
  var FAV_KEY = "runiverso-favoritas", favs = {};
  try { JSON.parse(localStorage.getItem(FAV_KEY) || "[]").forEach(function (n) { favs[n] = true; }); } catch (e) {}
  function saveFavs() { try { localStorage.setItem(FAV_KEY, JSON.stringify(Object.keys(favs))); } catch (e) {} }

  var state = { q: "", reg: "", ok: false, fav: false, k: "" };
  var open = {};
  var upcoming = R.filter(function (r) { return daysTo(r) >= 0; });

  /* Portada */
  var counts = {};
  upcoming.forEach(function (r) { counts[r.k] = (counts[r.k] || 0) + 1; });
  $("lead").textContent = upcoming.length + " próximas pruebas: " + (counts["21K"] || 0) + " medias maratones, " + (counts["42K"] || 0) + " maratones, " + (counts["10K"] || 0) + " carreras de 10K y " + (counts["TR"] || 0) + " trails. Con fechas, mapa, marcas de la última edición y calculadora de ritmo.";
  if (upcoming.length) {
    var nx = upcoming[0];
    $("next").innerHTML = '<span class="k">Próxima</span><b>' + esc(nx.n) + '</b><span class="m">' + esc(nx.c) + " · " + fdate(nx.date) + " · " + cdText(daysTo(nx)) + "</span>";
  }

  /* Tipos y comunidades */
  $("kseg").innerHTML = [["", "Todas"], ["21K", "Medias"], ["42K", "Maratones"], ["10K", "10K"], ["TR", "Trail"]].map(function (p) {
    var n = p[0] ? (counts[p[0]] || 0) : upcoming.length;
    return '<button type="button" data-k="' + p[0] + '" aria-pressed="' + (p[0] === "") + '">' + p[1] + '<span class="n">' + n + "</span></button>";
  }).join("");
  var regs = Array.from(new Set(upcoming.map(function (r) { return r.r; }))).sort(function (a, b) { return a.localeCompare(b, "es"); });
  regs.forEach(function (g) { var o = document.createElement("option"); o.value = g; o.textContent = g; $("reg").appendChild(o); });

  function filtered() {
    var q = norm(state.q.trim());
    return upcoming.filter(function (r) {
      if (state.k && r.k !== state.k) return false;
      if (state.reg && r.r !== state.reg) return false;
      if (state.ok && !r.ok) return false;
      if (state.fav && !favs[r.n]) return false;
      if (q && q.split(/\s+/).some(function (w) { return r.hay.indexOf(w) === -1; })) return false;
      return true;
    });
  }

  function marksBlock(r) {
    var m = r.m; if (!m) return "";
    var h = "";
    [["Hombres", m.h], ["Mujeres", m.f]].forEach(function (x) {
      if (!x[1]) return;
      var who = esc(x[1][0]) + (x[1][1] ? " (" + esc(x[1][1]) + ")" : "");
      h += '<div class="mline"><span>' + x[0] + "</span><span>" + who + '</span><span class="tm">' + esc(x[1][2]) + "</span></div>";
    });
    return '<div class="marks"><b>Marcas · ' + esc(m.ed) + "</b>" + h + (m.p ? "<p>" + esc(m.p) + "</p>" : "") + "</div>";
  }

  function rowHTML(r) {
    var d = r.date, n = daysTo(r), isOpen = !!open[r.id], fav = !!favs[r.n];
    var h = '<article class="row' + (isOpen ? " open" : "") + '" id="r' + r.id + '">';
    h += '<button type="button" class="head" data-open="' + r.id + '" aria-expanded="' + isOpen + '" aria-controls="d' + r.id + '">';
    h += '<span class="bib' + (r.ok ? "" : " prov") + '" aria-hidden="true"><span class="dow">' + DIAS[d.getDay()] + '</span><span class="day">' + d.getDate() + '</span><span class="mon">' + MES_C[d.getMonth()] + "</span></span>";
    h += '<span class="ttl"><h4>' + esc(r.n) + '</h4><span class="place">' + esc(r.c) + " · " + esc(r.r) + "</span>";
    h += '<span class="meta"><span class="pill ty">' + TYPES[r.k] + '</span><span class="pill">' + esc(r.dist.replace(/^Trail · /, "")) + "</span>";
    h += r.ok ? '<span class="st ok">Fecha confirmada</span>' : '<span class="st prov">Fecha provisional</span>';
    h += '<span class="cd">' + cdText(n) + "</span></span></span></button>";
    h += '<button type="button" class="fav" data-fav="' + r.id + '" aria-pressed="' + fav + '" aria-label="' + (fav ? "Quitar de favoritas: " : "Añadir a favoritas: ") + esc(r.n) + '">' + STAR + "</button>";
    if (isOpen) {
      h += '<div class="detail" id="d' + r.id + '">';
      h += '<dl class="dl"><dt>Fecha</dt><dd>' + fdate(d) + (r.ok ? "" : " (provisional)") + "</dd><dt>Lugar</dt><dd>" + esc(r.c) + ", " + esc(r.r) + "</dd><dt>Distancia</dt><dd>" + esc(r.dist) + "</dd>";
      if (r.x && r.x.length) h += "<dt>También</dt><dd>" + r.x.map(esc).join(" · ") + "</dd>";
      h += "</dl>";
      if (r.t) h += "<p>" + esc(r.t) + "</p>";
      h += marksBlock(r);
      h += '<div class="acts">';
      if (r.w) h += '<a class="btn" href="' + esc(r.w) + '" target="_blank" rel="noopener">Web oficial</a>';
      h += '<a class="btn alt" href="https://www.google.com/search?q=' + encodeURIComponent(r.n + " " + d.getFullYear() + " inscripción") + '" target="_blank" rel="noopener">Buscar inscripción</a>';
      if (KM[r.k] || r.k === "10K") h += '<button type="button" class="btn alt" data-calc="' + r.id + '">Calcular mi ritmo</button>';
      h += "</div></div>";
    }
    return h + "</article>";
  }

  function render() {
    var list = filtered();
    document.querySelectorAll("#kseg button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-k") === state.k)); });
    $("tok").setAttribute("aria-pressed", String(state.ok));
    var nf = Object.keys(favs).filter(function (n) { return upcoming.some(function (r) { return r.n === n; }); }).length;
    $("tfav").innerHTML = STAR + " Favoritas" + (nf ? " (" + nf + ")" : "");
    $("tfav").setAttribute("aria-pressed", String(state.fav));
    var active = state.q || state.reg || state.ok || state.fav || state.k;
    $("reset").hidden = !active;
    $("count").textContent = list.length + (list.length === 1 ? " carrera" : " carreras");

    var groups = [], cur = null;
    list.forEach(function (r) {
      var key = r.date.getFullYear() + "-" + r.date.getMonth();
      if (!cur || cur.key !== key) { cur = { key: key, d: r.date, items: [] }; groups.push(cur); }
      cur.items.push(r);
    });
    $("list").innerHTML = groups.map(function (g) {
      return '<section class="month"><h3 class="mt">' + MES_L[g.d.getMonth()] + " " + g.d.getFullYear() + "<span>" + g.items.length + (g.items.length === 1 ? " carrera" : " carreras") + '</span></h3><div class="rows">' + g.items.map(rowHTML).join("") + "</div></section>";
    }).join("");
    $("empty").hidden = list.length > 0;
    renderMap(list);
  }

  /* Mapa */
  var mapSel = null;
  function renderMap(list) {
    if (!MAP) return;
    var groups = {}, order = [];
    list.forEach(function (r) {
      var xy = MAP.cities[r.c]; if (!xy) return;
      var k = xy[0] + "," + xy[1];
      if (!groups[k]) { groups[k] = { xy: xy, races: [], names: [] }; order.push(k); }
      groups[k].races.push(r);
      if (groups[k].names.indexOf(r.c) === -1) groups[k].names.push(r.c);
    });
    order.sort(function (a, b) { return groups[b].races.length - groups[a].races.length; });
    if (mapSel && !groups[mapSel]) mapSel = null;
    var svg = '<path class="nb" d="' + MAP.neigh + '"/><path class="es" d="' + MAP.spain + '"/>' +
      '<rect class="frame" x="14" y="' + (MAP.MB + 6) + '" width="300" height="' + (MAP.H - MAP.MB - 12) + '" rx="6"/>' +
      '<text class="flabel" x="24" y="' + (MAP.MB + 22) + '">Islas Canarias</text><path class="es" d="' + MAP.can + '"/>';
    order.forEach(function (k) {
      var g = groups[k], n = g.races.length, rad = (5 + Math.sqrt(n) * 3).toFixed(1);
      var label = g.names.join(" / ") + ": " + n + (n === 1 ? " carrera" : " carreras");
      svg += '<g class="dot' + (k === mapSel ? " sel" : "") + '" data-k="' + k + '" tabindex="0" role="button" aria-label="' + esc(label) + '"><title>' + esc(label) + "</title>" +
        '<circle cx="' + g.xy[0] + '" cy="' + g.xy[1] + '" r="' + rad + '"/>' +
        (n > 1 ? '<text x="' + g.xy[0] + '" y="' + g.xy[1] + '" text-anchor="middle" dominant-baseline="central">' + n + "</text>" : "") + "</g>";
    });
    $("map").innerHTML = svg;
    $("mapcount").textContent = order.length + (order.length === 1 ? " lugar" : " lugares") + " · " + list.length + (list.length === 1 ? " carrera" : " carreras") + " con los filtros actuales";
    var p = $("mappanel");
    if (!mapSel) {
      p.innerHTML = "<h3>Elige un punto</h3><p>Toca una ciudad del mapa para ver sus carreras. Cuanto más grande el punto, más carreras hay. Los filtros del calendario también se aplican al mapa.</p>";
      return;
    }
    var sel = groups[mapSel];
    p.innerHTML = "<h3>" + esc(sel.names.join(" / ")) + "</h3><ul>" + sel.races.map(function (r) {
      return '<li><button type="button" data-go="' + r.id + '"><span>' + esc(r.n) + '</span><span class="when">' + r.date.getDate() + " " + MES_C[r.date.getMonth()] + " " + r.date.getFullYear() + " · " + esc(r.dist) + "</span></button></li>";
    }).join("") + "</ul>";
  }
  function pickDot(el) {
    var k = el.getAttribute("data-k");
    mapSel = mapSel === k ? null : k;
    render();
    var again = document.querySelector('#map .dot[data-k="' + k + '"]');
    if (again && again.focus) again.focus();
  }
  $("map").addEventListener("click", function (e) { var g = e.target.closest(".dot"); if (g) pickDot(g); });
  $("map").addEventListener("keydown", function (e) {
    var g = e.target.closest(".dot");
    if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pickDot(g); }
  });
  $("mappanel").addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]"); if (!b) return;
    goTo(+b.getAttribute("data-go"));
  });
  function goTo(id) {
    var r = R[id];
    if (filtered().indexOf(r) === -1) { state = { q: "", reg: "", ok: false, fav: false, k: "" }; $("q").value = ""; $("reg").value = ""; }
    open[id] = true; render();
    var el = $("r" + id); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* Eventos del calendario */
  $("kseg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; state.k = b.getAttribute("data-k"); render(); });
  $("q").addEventListener("input", function () { state.q = this.value; render(); });
  $("reg").addEventListener("change", function () { state.reg = this.value; render(); });
  $("tok").addEventListener("click", function () { state.ok = !state.ok; render(); });
  $("tfav").addEventListener("click", function () { state.fav = !state.fav; render(); });
  function reset() { state = { q: "", reg: "", ok: false, fav: false, k: "" }; $("q").value = ""; $("reg").value = ""; render(); }
  $("reset").addEventListener("click", reset);
  $("reset2").addEventListener("click", reset);
  $("list").addEventListener("click", function (e) {
    var f = e.target.closest("[data-fav]");
    if (f) {
      var r = R[+f.getAttribute("data-fav")];
      if (favs[r.n]) delete favs[r.n]; else favs[r.n] = true;
      saveFavs(); render();
      var nb = document.querySelector('[data-fav="' + r.id + '"]'); if (nb) nb.focus();
      return;
    }
    var c = e.target.closest("[data-calc]");
    if (c) { setCalcFor(R[+c.getAttribute("data-calc")]); return; }
    var o = e.target.closest("[data-open]");
    if (o) {
      var id = +o.getAttribute("data-open");
      open[id] = !open[id]; render();
      var nh = document.querySelector('[data-open="' + id + '"]'); if (nh) nh.focus();
    }
  });

  /* Marcas */
  function renderMarks() {
    var type = $("mtype").value, sort = $("msort").value, km = KM[type];
    var seen = {}, rows = R.filter(function (r) {
      if (r.k !== type || !r.m || seen[r.n]) return false;
      return (seen[r.n] = true);
    });
    rows.sort(function (a, b) {
      if (sort === "date") return a.m.od < b.m.od ? 1 : a.m.od > b.m.od ? -1 : 0;
      var x = a.m[sort], y = b.m[sort];
      if (!x && !y) return 0; if (!x) return 1; if (!y) return -1;
      return tsec(x[2]) - tsec(y[2]);
    });
    function cell(w) {
      if (!w) return '<td><span class="na">Sin datos</span></td>';
      return '<td><span class="tm">' + esc(w[2]) + '</span><span class="who">' + esc(w[0]) + (w[1] ? " (" + esc(w[1]) + ")" : "") + '</span><span class="pc">' + paceOf(tsec(w[2]), km) + " min/km</span></td>";
    }
    $("mbody").innerHTML = rows.length ? rows.map(function (r) {
      return '<tr><td><span class="cn">' + esc(r.n) + '</span><span class="ce">' + esc(r.c) + " · " + esc(r.m.ed) + "</span></td>" + cell(r.m.h) + cell(r.m.f) + "</tr>";
    }).join("") : '<tr><td colspan="3" class="na">Aún no hay marcas para esta distancia.</td></tr>';
  }
  $("mtype").addEventListener("change", renderMarks);
  $("msort").addEventListener("change", renderMarks);

  /* Calculadora */
  var PRESETS = {
    "10": [[0, 40, 0], [0, 45, 0], [0, 50, 0], [0, 55, 0], [1, 0, 0]],
    "21.0975": [[1, 30, 0], [1, 40, 0], [1, 45, 0], [1, 50, 0], [2, 0, 0], [2, 15, 0]],
    "42.195": [[3, 0, 0], [3, 30, 0], [3, 45, 0], [4, 0, 0], [4, 30, 0]]
  };
  function getT() { return (+$("hh").value || 0) * 3600 + (+$("mm").value || 0) * 60 + (+$("ss").value || 0); }
  function setT(t) { $("hh").value = t[0]; $("mm").value = t[1]; $("ss").value = t[2]; }
  function renderPresets() {
    var t = getT();
    $("presets").innerHTML = PRESETS[$("cdist").value].map(function (p) {
      var s = p[0] * 3600 + p[1] * 60 + p[2];
      return '<button type="button" data-t="' + p.join(",") + '" aria-pressed="' + (s === t) + '">' + (p[0] ? p[0] + "h" + (p[1] ? String(p[1]).padStart(2, "0") : "") : p[1] + " min") + "</button>";
    }).join("");
  }
  function calc() {
    var km = +$("cdist").value, t = getT();
    renderPresets();
    if (!t) { $("pace").textContent = "–"; $("speed").textContent = "–"; $("splits").innerHTML = ""; return; }
    $("pace").textContent = paceOf(t, km);
    $("speed").textContent = (km / (t / 3600)).toFixed(1).replace(".", ",");
    var pts = km === 10 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : km < 30 ? [1, 5, 10, 15, 20] : [1, 5, 10, 15, 20, 21.0975, 25, 30, 35, 40];
    var forceH = t >= 3600;
    $("splits").innerHTML = pts.map(function (p) {
      var lab = p === 21.0975 ? "Media (21,1 km)" : "Km " + p;
      return "<tr><td>" + lab + "</td><td>" + fmt(t * p / km) + "</td></tr>";
    }).join("") + "<tr><td><b>Meta (" + String(km).replace(".", ",") + " km)</b></td><td><b>" + fmt(t, forceH) + "</b></td></tr>";
  }
  function setCalcFor(r) {
    $("cdist").value = r.k === "42K" ? "42.195" : r.k === "10K" ? "10" : "21.0975";
    if (r.k === "42K") setT([4, 0, 0]); else if (r.k === "10K") setT([0, 50, 0]); else setT([1, 55, 0]);
    calc();
    $("ritmo").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  ["hh", "mm", "ss"].forEach(function (id) { $(id).addEventListener("input", calc); });
  $("cdist").addEventListener("change", function () {
    var v = this.value; setT(v === "10" ? [0, 50, 0] : v === "42.195" ? [4, 0, 0] : [1, 55, 0]); calc();
  });
  $("presets").addEventListener("click", function (e) {
    var b = e.target.closest("[data-t]"); if (!b) return;
    setT(b.getAttribute("data-t").split(",").map(Number)); calc();
  });

  /* Pie */
  $("srclist").innerHTML = (window.SOURCES || []).map(function (s) { return '<a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + "</a>"; }).join("");
  $("yr").textContent = today.getFullYear();

  render();
  renderMarks();
  calc();
})();
