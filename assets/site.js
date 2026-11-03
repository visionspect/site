/* VisionSpect Solutions — site.js
   1. Mobile nav  2. UTM capture for the contact form
   3. Cloudflare Web Analytics (live domain only)  4. Hero inspection animation */
(function () {
  "use strict";

  /* ---------- 1. mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      }
    });
  }

  /* ---------- 2. UTM capture ----------
     Share links like visionspect.com/?utm_source=flyer&utm_campaign=semc26
     and the tag rides along with the contact form submission. */
  var keys = ["utm_source", "utm_campaign"];
  var params = new URLSearchParams(window.location.search);
  keys.forEach(function (k) {
    var v = params.get(k);
    try {
      if (v) sessionStorage.setItem(k, v.slice(0, 80));
      v = v || sessionStorage.getItem(k);
    } catch (e) { /* storage blocked: use the URL value only */ }
    var input = document.querySelector('form[name="contact"] input[name="' + k + '"]');
    if (input && v) input.value = v;
  });

  /* ---------- 3. Cloudflare Web Analytics ----------
     Paste the public site token from Cloudflare (Web Analytics > visionspect.com). */
  var CF_TOKEN = "6ed466e79e99484ab051c0b4e6300530";
  var LIVE_HOSTS = ["visionspect.com", "www.visionspect.com"];
  if (CF_TOKEN && LIVE_HOSTS.indexOf(location.hostname) !== -1) {
    var s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: CF_TOKEN }));
    document.head.appendChild(s);
  }

  /* ---------- 4. hero inspection animation ---------- */
  var scene = document.querySelector(".scene");
  if (!scene) return;

  var NS = "http://www.w3.org/2000/svg";
  var partsG = scene.querySelector(".parts");
  var overG = scene.querySelector(".overlays");
  var flap = scene.querySelector(".flap");
  var flash = scene.querySelector(".fov-flash");
  var dashes = scene.querySelectorAll(".belt-dash");
  var insetPart = document.querySelector(".inset-part use");
  var insetTools = document.querySelector(".inset-tools");
  var scoreFill = document.querySelector(".score-fill");
  var scoreVal = document.querySelector(".score-val");
  var resultsEl = document.querySelector(".results");
  var statTotal = document.querySelector('[data-stat="total"]');
  var statNg = document.querySelector('[data-stat="ng"]');

  var CAM_X = 210, BELT_Y = 222, PART_W = 48, PART_H = 26;
  var FLAP_X0 = 340, FLAP_X1 = 400, BIN_Y = 270;
  var SPEED = 72, SPACING = 84;
  // repeating production pattern: mostly good, the odd short shot or missing hole
  var PATTERN = ["ok","ok","ok","ok","short","ok","ok","ok","ok","ok","ok","hole","ok","ok"];
  var patIdx = 0, nextId = 1241, total = 1240, ngCount = 3;
  var parts = [], belt = 0, flash_t = 0, flapAngle = 0, flapTarget = 0, flapHold = 0;
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function spawn(x) {
    var type = PATTERN[patIdx++ % PATTERN.length];
    var g = el("g", {}, partsG);
    el("use", { href: "#part-" + type, width: PART_W, height: PART_H, x: -PART_W / 2, y: -PART_H }, g);
    parts.push({ x: x, y: BELT_Y, rot: 0, vy: 0, type: type, g: g, done: false, falling: false, fade: 1, over: null, id: nextId++ });
  }

  function makeOverlay(p) {
    var ng = p.type !== "ok";
    var col = ng ? "#E5533D" : "#8FD162";
    var g = el("g", {}, overG);
    el("rect", { x: -31, y: -PART_H - 7, width: 62, height: PART_H + 12, rx: 3, fill: "none", stroke: col, "stroke-width": 2, "stroke-dasharray": ng ? "none" : "5 4" }, g);
    var label = ng ? (p.type === "short" ? "NG  Short shot" : "NG  Hole missing") : "OK  " + p.score.toFixed(2);
    var w = ng ? (p.type === "short" ? 92 : 104) : 62;
    el("rect", { x: -w / 2, y: -PART_H - 30, width: w, height: 19, rx: 4, fill: col }, g);
    var t = el("text", { x: 0, y: -PART_H - 16.5, "text-anchor": "middle", fill: "#10161A", style: "font:700 11px Lato, sans-serif" }, g);
    t.textContent = label;
    return g;
  }

  function updateInset(p) {
    var ng = p.type !== "ok";
    insetPart.setAttribute("href", "#part-" + p.type);
    while (insetTools.firstChild) insetTools.removeChild(insetTools.firstChild);
    // part drawn at translate(28 30) scale(3): spans x 28-172, y 30-108
    var g = insetTools, green = "#8FD162", red = "#E5533D";
    el("line", { x1: 28, y1: 18, x2: 172, y2: 18, stroke: green, "stroke-width": 1.5 }, g);
    el("line", { x1: 28, y1: 13, x2: 28, y2: 26, stroke: green, "stroke-width": 1.5 }, g);
    el("line", { x1: 172, y1: 13, x2: 172, y2: 26, stroke: green, "stroke-width": 1.5 }, g);
    var t = el("text", { x: 100, y: 13, "text-anchor": "middle", fill: "#C9D4D9", style: "font:700 10px Lato, sans-serif" }, g);
    t.textContent = (24 + (rand() - 0.5) * 0.06).toFixed(2) + " mm";
    el("circle", { cx: 70, cy: 72, r: 16, fill: "none", stroke: green, "stroke-width": 1.5 }, g);
    if (p.type === "short") {
      el("circle", { cx: 130, cy: 78, r: 16, fill: "none", stroke: green, "stroke-width": 1.5 }, g);
      el("rect", { x: 112, y: 24, width: 66, height: 46, fill: "rgba(229,83,61,.15)", stroke: red, "stroke-width": 2 }, g);
      var l1 = el("text", { x: 145, y: 122, "text-anchor": "middle", fill: "#F09684", style: "font:700 10px Lato, sans-serif" }, g);
      l1.textContent = "Fill 71%";
    } else if (p.type === "hole") {
      el("circle", { cx: 130, cy: 72, r: 16, fill: "rgba(229,83,61,.15)", stroke: red, "stroke-width": 2, "stroke-dasharray": "4 3" }, g);
      var l2 = el("text", { x: 130, y: 122, "text-anchor": "middle", fill: "#F09684", style: "font:700 10px Lato, sans-serif" }, g);
      l2.textContent = "Hole missing";
    } else {
      el("circle", { cx: 130, cy: 72, r: 16, fill: "none", stroke: green, "stroke-width": 1.5 }, g);
    }
    scoreFill.style.width = Math.round(p.score * 100) + "%";
    scoreFill.classList.toggle("ng", ng);
    scoreVal.textContent = p.score.toFixed(2);

    var li = document.createElement("li");
    if (ng) li.className = "ng";
    li.innerHTML = '<span class="id">#' + p.id + '</span><span class="r">' + (ng ? "NG" : "OK") + "</span>";
    resultsEl.insertBefore(li, resultsEl.firstChild);
    while (resultsEl.children.length > 5) resultsEl.removeChild(resultsEl.lastChild);

    total += 1; if (ng) ngCount += 1;
    statTotal.textContent = total.toLocaleString("en-US");
    statNg.textContent = ngCount;
  }

  function inspect(p) {
    p.done = true;
    p.score = p.type === "ok" ? 0.93 + rand() * 0.06 : 0.32 + rand() * 0.3;
    p.over = makeOverlay(p);
    flash_t = 1;
    updateInset(p);
  }

  function step(dt) {
    belt += SPEED * dt;
    for (var d = 0; d < dashes.length; d++) dashes[d].setAttribute("stroke-dashoffset", (-belt % 16).toFixed(1));

    // spawn so parts stay evenly spaced
    var last = parts[parts.length - 1];
    if (!last) spawn(-40); else if (last.x > -30) spawn(last.x - SPACING);

    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      if (p.falling) {
        p.vy += 520 * dt; p.y += p.vy * dt; p.x += 30 * dt; p.rot += 160 * dt;
        if (p.y > BIN_Y) { p.y = BIN_Y; p.fade -= dt * 2.5; }
      } else {
        p.x += SPEED * dt;
        if (!p.done && p.x >= CAM_X) inspect(p);
        if (p.type !== "ok" && p.x >= (FLAP_X0 + FLAP_X1) / 2 - 8) {
          p.falling = true; flapTarget = 48; flapHold = 0.8;
        }
      }
      p.g.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") rotate(" + p.rot.toFixed(1) + " 0 -13)");
      p.g.setAttribute("opacity", Math.max(p.fade, 0).toFixed(2));
      if (p.over) {
        var fadeOver = p.type === "ok" ? Math.max(0, Math.min(1, (330 - p.x) / 40)) : (p.falling ? Math.max(0, 1 - (p.y - BELT_Y) / 30) : 1);
        p.over.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + (p.falling ? BELT_Y : p.y).toFixed(1) + ")");
        p.over.setAttribute("opacity", fadeOver.toFixed(2));
        if (fadeOver <= 0) { overG.removeChild(p.over); p.over = null; }
      }
      if (p.x > 540 || p.fade <= 0) {
        if (p.over) overG.removeChild(p.over);
        partsG.removeChild(p.g);
        parts.splice(i, 1);
      }
    }

    // reject flap
    if (flapHold > 0) { flapHold -= dt; if (flapHold <= 0) flapTarget = 0; }
    flapAngle += (flapTarget - flapAngle) * Math.min(1, dt * 12);
    flap.setAttribute("transform", "rotate(" + flapAngle.toFixed(1) + " " + FLAP_X0 + " 225)");

    // light strobe on trigger
    flash_t = Math.max(0, flash_t - dt * 4);
    flash.setAttribute("opacity", (flash_t * 0.9).toFixed(2));
  }

  // fill the belt so the first frame isn't empty
  for (var x = 150; x > -60; x -= SPACING) spawn(x);
  // start with a few results already in the list
  for (var w = 0; w < 160; w++) step(1 / 60);

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    // static frame: advance until a reject is on screen, then stop
    for (var r = 0; r < 600 && !parts.some(function (p) { return p.type !== "ok" && p.done; }); r++) step(1 / 60);
    for (var r2 = 0; r2 < 20; r2++) step(1 / 60);
    return;
  }

  var visible = true, lastT = null, raf = null;
  function frame(t) {
    if (lastT === null) lastT = t;
    var dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    step(dt);
    raf = visible ? requestAnimationFrame(frame) : null;
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !raf) { lastT = null; raf = requestAnimationFrame(frame); }
    }).observe(scene);
  } else {
    raf = requestAnimationFrame(frame);
  }
})();
