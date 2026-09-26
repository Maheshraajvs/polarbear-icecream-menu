/* Polar Bear concept catalog — interactions */
document.documentElement.classList.add("js");

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- filter tabs ---------- */
const note = $("#grid-note");
const products = $$(".product");
$$(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".tab").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    const f = tab.dataset.filter;
    let shown = 0;
    products.forEach((p) => {
      const on = f === "All" || p.dataset.cat === f;
      p.hidden = !on;
      if (on) shown++;
    });
    note.textContent = `Showing ${shown} ${shown === 1 ? "item" : "items"} in ${f === "All" ? "the full catalog" : f}`;
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
    btn.classList.add("ok");
    btn.textContent = "Added \u2713";
    setTimeout(() => { btn.classList.remove("ok"); btn.textContent = "Add +"; }, 1200);
    const name = btn.closest(".product").querySelector(".product__name").firstChild.textContent.trim();
    toast.textContent = `${name} added to your bag`;
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
          const cards = $$(".product", e.target);
          animate(cards, { opacity: [0, 1], y: [22, 0] }, { duration: 0.55, delay: stagger(0.05), easing: [0.22, 1, 0.35, 1] });
          obs.unobserve(e.target);
        }
      }, { rootMargin: "0px 0px -5% 0px" });
      io2.observe($(".product-grid"));
    })
    .catch(() => document.documentElement.classList.remove("js"));
} else {
  document.documentElement.classList.remove("js");
}

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
if (matchMedia("(pointer:fine)").matches && !reduced) {
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
if (matchMedia("(pointer:fine)").matches && !reduced) {
  const c = document.createElement("div");
  c.className = "cursor";
  document.body.appendChild(c);
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    x += (tx - x) * 0.22; y += (ty - y) * 0.22;
    c.style.transform = "translate(" + x + "px," + y + "px)";
    requestAnimationFrame(loop);
  })();
  addEventListener("pointerover", (e) => {
    c.classList.toggle("big", !!e.target.closest("a, button, .polaroid, .gallery__card"));
  });
}

/* ---------- magnetic buttons ---------- */
if (matchMedia("(pointer:fine)").matches && !reduced) {
  $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.18) + "px)";
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
}
