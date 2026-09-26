/* Polar Bear concept catalog — interactions */
document.documentElement.classList.add("js");

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer:fine)").matches;

/* ---------- transform grid into editorial menu list ---------- */
const grid = $(".product-grid");
if (grid) {
  const cats = new Map();
  for (const p of $$(".product", grid)) {
    const c = p.dataset.cat;
    if (!cats.has(c)) cats.set(c, []);
    cats.get(c).push(p);
  }
  const wrap = document.createElement("div");
  wrap.className = "menu";
  for (const [cat, items] of cats) {
    const sec = document.createElement("section");
    sec.className = "menu-cat reveal";
    sec.dataset.cat = cat;
    const head = document.createElement("header");
    head.className = "menu-cat__head";
    head.innerHTML = '<h3 class="menu-cat__title">' + cat + '</h3><span class="menu-cat__count tabular-nums">' + items.length + " items</span>";
    const list = document.createElement("ul");
    list.className = "menu-list";
    for (const p of items) {
      const row = document.createElement("li");
      row.className = "product menu-row";
      row.dataset.cat = p.dataset.cat;
      const media = $(".product__media", p);
      const name = $(".product__name", p);
      const desc = $(".product__desc", p);
      const price = $(".product__price", p);
      const add = $(".product__add", p);
      const line = document.createElement("div");
      line.className = "menu-row__top";
      name.classList.add("menu-row__name");
      const leader = document.createElement("span");
      leader.className = "menu-row__leader";
      leader.setAttribute("aria-hidden", "true");
      line.append(name, leader, price);
      const body = document.createElement("div");
      body.className = "menu-row__body";
      body.append(line, desc);
      media.classList.add("menu-row__media");
      row.append(media, body, add);
      list.append(row);
    }
    sec.append(head, list);
    wrap.append(sec);
  }
  grid.replaceWith(wrap);
}

/* ---------- filter tabs ---------- */
const note = $("#grid-note");
const catSecs = $$(".menu-cat");
$$(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".tab").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    const f = tab.dataset.filter;
    let shown = 0;
    catSecs.forEach((sec) => {
      const on = f === "All" || sec.dataset.cat === f;
      sec.hidden = !on;
      if (on) shown += $$(".menu-row", sec).length;
    });
    note.textContent = "Showing " + shown + (shown === 1 ? " item" : " items") + " in " + (f === "All" ? "the full catalog" : f);
  });
});

/* ---------- bag ---------- */
let bag = 0;
const chip = $("#bag-chip");
const count = $("#bag-count");
const toast = $("#toast");
let toastTimer;
$$(".product__add").forEach((btn) => {
  btn.addEventListener("click", () => {
    bag++;
    count.textContent = bag;
    chip.hidden = false;
    const r = btn.getBoundingClientRect();
    const sx = Math.max(40, Math.min(r.left + r.width / 2, innerWidth - 40));
    const sy = Math.max(60, Math.min(r.top + r.height / 2, innerHeight - 60));
    sprinkle(sx, sy);
    btn.classList.add("ok");
    btn.textContent = "Added \u2713";
    setTimeout(() => { btn.classList.remove("ok"); btn.textContent = "Add +"; }, 1200);
    const name = btn.closest(".product").querySelector(".product__name").firstChild.textContent.trim();
    toast.textContent = name + " added to your bag";
    toast.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("on"), 2000);
  });
});

/* ---------- entrance + scroll reveal (Motion, gated) ---------- */
if (!reduced && "onscroll" in window) {
  import("https://cdn.jsdelivr.net/npm/motion@13/+esm")
    .then(({ animate, stagger }) => {
      animate(
        $(".nav-mast > *"),
        { opacity: [0, 1], y: [12, 0] },
        { duration: 0.55, delay: stagger(0.09), easing: [0.22, 1, 0.35, 1] }
      );
      const io = new IntersectionObserver((entries, obs) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          animate(e.target, { opacity: [0, 1], y: [18, 0] }, { duration: 0.6, easing: [0.22, 1, 0.35, 1] });
          obs.unobserve(e.target);
        }
      }, { rootMargin: "0px 0px -8% 0px" });
      $$(".reveal").forEach((el) => io.observe(el));
      const io2 = new IntersectionObserver((entries, obs) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const rows = $$(".menu-row", e.target);
          if (rows.length) {
            animate(rows, { opacity: [0, 1], y: [26, 0] }, { duration: 0.55, delay: stagger(0.045), easing: [0.22, 1, 0.35, 1] });
          }
          obs.unobserve(e.target);
        }
      }, { rootMargin: "0px 0px -5% 0px" });
      catSecs.forEach((sec) => io2.observe(sec));
    })
    .catch(() => document.documentElement.classList.remove("js"));
} else {
  document.documentElement.classList.remove("js");
}

/* ---------- scroll progress scoop bar ---------- */
const bar = document.createElement("div");
bar.className = "progress";
document.body.appendChild(bar);
addEventListener("scroll", () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
}, { passive: true });

/* ---------- hero parallax ---------- */
const art = $("#hero-art");
if (art && !reduced) {
  const onScroll = () => {
    const y = Math.min(scrollY, 600);
    art.style.transform = "translateY(" + (y * -0.06) + "px)";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- floating hover photo for menu rows ---------- */
if (fine && !reduced) {
  const floatBox = document.createElement("div");
  floatBox.className = "float-media";
  floatBox.setAttribute("aria-hidden", "true");
  document.body.appendChild(floatBox);
  let fx = innerWidth / 2, fy = innerHeight / 2, tx = fx, ty = fy;
  addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function loop() {
    fx += (tx - fx) * 0.14; fy += (ty - fy) * 0.14;
    floatBox.style.transform = "translate(" + (fx + 26) + "px," + (fy - 150) + "px) rotate(2.5deg)";
    requestAnimationFrame(loop);
  })();
  $$(".menu-row").forEach((row) => {
    row.addEventListener("pointerenter", () => {
      const media = $(".product__media", row);
      if (!media) return;
      floatBox.textContent = "";
      for (const n of media.childNodes) {
        if (n.nodeName === "IMG" || n.nodeName === "svg" || n.nodeName === "SVG") {
          floatBox.appendChild(n.cloneNode(true));
        }
      }
      floatBox.classList.add("on");
    });
    row.addEventListener("pointerleave", () => floatBox.classList.remove("on"));
  });
}

/* ---------- gallery drag-to-scroll ---------- */
const gal = $("#gallery");
if (gal) {
  let down = false, sx = 0, sl = 0;
  gal.addEventListener("pointerdown", (e) => {
    down = true; sx = e.clientX; sl = gal.scrollLeft;
    gal.setPointerCapture(e.pointerId);
  });
  gal.addEventListener("pointermove", (e) => { if (down) gal.scrollLeft = sl - (e.clientX - sx); });
  ["pointerup", "pointercancel"].forEach((t) => gal.addEventListener(t, () => { down = false; }));
}

/* ---------- dock nav ---------- */
const dock = $("#dock");
if (dock) addEventListener("scroll", () => dock.classList.toggle("on", scrollY > 480), { passive: true });

/* ---------- split hero word into letters ---------- */
const sun = $(".hero__title em");
if (sun) {
  const t = sun.textContent;
  sun.textContent = "";
  [...t].forEach((ch, i) => {
    const s = document.createElement("span");
    s.textContent = ch;
    s.style.setProperty("--i", i);
    sun.appendChild(s);
  });
}

/* ---------- mouse parallax on polaroids ---------- */
if (fine && !reduced) {
  const zone = $("#hero-art");
  if (zone) {
    zone.addEventListener("pointermove", (e) => {
      const r = zone.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      $$("[data-depth]", zone).forEach((el) => {
        const d = +el.dataset.depth;
        el.style.translate = (dx * d) + "px " + (dy * d) + "px";
      });
    });
    zone.addEventListener("pointerleave", () => {
      $$("[data-depth]", zone).forEach((el) => { el.style.translate = ""; });
    });
  }
}

/* ---------- custom scoop cursor ---------- */
if (fine && !reduced) {
  const c = document.createElement("div");
  c.className = "cursor";
  document.body.appendChild(c);
  let x = innerWidth / 2, y = innerHeight / 2, tx2 = x, ty2 = y;
  addEventListener("pointermove", (e) => { tx2 = e.clientX; ty2 = e.clientY; });
  (function loop() {
    x += (tx2 - x) * 0.22; y += (ty2 - y) * 0.22;
    c.style.transform = "translate(" + x + "px," + y + "px)";
    requestAnimationFrame(loop);
  })();
  addEventListener("pointerover", (e) => {
    c.classList.toggle("big", !!e.target.closest("a, button, .polaroid, .gallery__card, .menu-row"));
  });
}

/* ---------- magnetic buttons ---------- */
if (fine && !reduced) {
  $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.18) + "px)";
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
}

/* ---------- sprinkle confetti ---------- */
function sprinkle(x, y) {
  if (reduced) return;
  const c = document.createElement("canvas");
  c.width = innerWidth; c.height = innerHeight;
  c.style.cssText = "position:fixed;inset:0;z-index:99;pointer-events:none";
  document.body.appendChild(c);
  const ctx = c.getContext("2d");
  const colors = ["#F5C518", "#F27121", "#12A3C4", "#7BC47F", "#ffffff"];
  const ps = Array.from({ length: 34 }, () => ({
    x: x, y: y,
    vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 8 - 3,
    r: 2 + Math.random() * 3, col: colors[(Math.random() * colors.length) | 0],
    rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, life: 1
  }));
  (function tick() {
    ctx.clearRect(0, 0, c.width, c.height);
    let alive = false;
    for (const p of ps) {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.012;
      if (p.life > 0 && p.y < c.height + 20) {
        alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(p.life, 0); ctx.fillStyle = p.col;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      }
    }
    if (alive) requestAnimationFrame(tick); else c.remove();
  })();
}

/* ---------- flavour duo builder ---------- */
const duoWrap = $(".flavour-list");
if (duoWrap) {
  const col = duoWrap.closest(".flavours__grid").querySelector("div");
  const duoNote = document.createElement("p");
  duoNote.className = "duo-note";
  duoNote.setAttribute("aria-live", "polite");
  col.appendChild(duoNote);
  let picks = [];
  const chips = [...duoWrap.children];
  const render = () => {
    chips.forEach((c) => c.classList.toggle("picked", picks.includes(c.textContent)));
    duoNote.textContent = picks.length === 2
      ? "Your duo: " + picks[0] + " + " + picks[1] + " \u2014 \u20B999. Bold choice."
      : picks.length === 1
        ? "One scoop in \u2014 pick a partner for " + picks[0] + "."
        : "Tap any two flavours to build your duo.";
  };
  const toggle = (li) => {
    const name = li.textContent;
    if (picks.includes(name)) picks = picks.filter((p) => p !== name);
    else { if (picks.length >= 2) picks.shift(); picks.push(name); }
    render();
  };
  chips.forEach((li) => {
    li.setAttribute("role", "button");
    li.tabIndex = 0;
    li.addEventListener("click", () => toggle(li));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(li); }
    });
  });
  render();
}

/* ---------- scroll-velocity marquee ---------- */
const mTrack = $(".marquee__track");
if (mTrack && !reduced) {
  mTrack.style.animation = "none";
  const anim = mTrack.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }],
    { duration: 30000, iterations: Infinity, easing: "linear" }
  );
  let rate = 1, target = 1, lastY = scrollY;
  addEventListener("scroll", () => {
    target = 1 + Math.min(Math.abs(scrollY - lastY) * 0.25, 7);
    lastY = scrollY;
  }, { passive: true });
  (function decay() {
    target += (1 - target) * 0.06;
    rate += (target - rate) * 0.2;
    anim.playbackRate = rate;
    requestAnimationFrame(decay);
  })();
}
