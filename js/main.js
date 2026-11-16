/* Los Argentinos RP — interacciones y animaciones.
   Sin dependencias: IntersectionObserver, scroll y transforms 3D. */
(() => {
  "use strict";

  const C = window.LA_CONFIG || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Enlaces desde la config ---------- */
  $$("[data-link='discord']").forEach((a) => (a.href = C.discordUrl || "#"));
  $$("[data-link='tiktok']").forEach((a) => (a.href = C.tiktokUrl || "#"));
  $$("[data-link='bot']").forEach((a) => (a.href = C.botUrl || "#"));

  /* ---------- Fundación ---------- */
  const founders = $("#founders");
  if (founders && C.founders) {
    founders.innerHTML = C.founders.map((f) => {
      const initials = f.name.split(" ").map((p) => p[0] || "").join("").slice(0, 2).toUpperCase();
      const av = f.avatar ? `<img src="${esc(f.avatar)}" alt="Avatar de ${esc(f.name)}">` : esc(initials);
      return `<div class="card founder reveal-3d" data-tilt>
        <div class="avatar">${av}</div>
        <div><b>${esc(f.name)}</b><small>@${esc(f.user)}</small></div>
      </div>`;
    }).join("");
  }

  /* ---------- Datos del server, tags, pasos y FAQ ---------- */
  const setCount = (sel, val) => { const n = $(sel); if (n && val != null) n.dataset.count = String(val); };
  setCount("[data-count='187']", C.members);
  setCount("[data-count='28']", C.online);
  const sinceEl = $("#since");
  if (sinceEl && C.since) sinceEl.textContent = C.since;

  const tagsEl = $("#tags");
  if (tagsEl && C.tags) {
    tagsEl.innerHTML = C.tags.map((t) => `<span class="tag-pill">${esc(t)}</span>`).join("");
  }

  const stepsEl = $("#steps");
  if (stepsEl && C.steps) {
    stepsEl.innerHTML = C.steps.map((s, i) => `
      <li class="step card reveal-3d" data-tilt style="--stagger:${i * 90}ms">
        <span class="step-n">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.desc)}</p>
      </li>`).join("");
  }

  const faqEl = $("#faq-list");
  if (faqEl && C.faq) {
    faqEl.innerHTML = C.faq.map((f, i) => `
      <details class="faq-item reveal-3d" ${i === 0 ? "open" : ""} style="--stagger:${i * 80}ms">
        <summary>${esc(f.q)}<span class="faq-plus" aria-hidden="true">+</span></summary>
        <p>${esc(f.a)}</p>
      </details>`).join("");
  }

  /* ---------- Facciones (tarjetas 3D) ---------- */
  const factions = $("#factions");
  if (factions && C.factions) {
    factions.innerHTML = C.factions.map((f, i) => `
      <article class="card faction reveal-3d" data-tilt style="--c:${esc(f.color)};--stagger:${i * 120}ms">
        <span class="face-badge">${esc(f.name.charAt(0))}</span>
        <h3>${esc(f.name)}</h3>
        <p>${esc(f.desc)}</p>
      </article>`).join("");
  }

  /* ---------- Carrusel de liveries ---------- */
  const track = $("#car-track");
  const dotsWrap = $("#car-dots");
  const prevBtn = $(".car-btn.prev");
  const nextBtn = $(".car-btn.next");
  const palette = [
    ["#1b5fa8", "#4aa8ff"], ["#8a6b00", "#f5b700"], ["#5b2a86", "#b07cff"],
    ["#0f5e4a", "#4ade80"], ["#8a2a3a", "#ff6b8a"], ["#2a3a5a", "#7f96b8"]
  ];
  let slides = [];
  let dots = [];
  let current = 0;
  let autoTimer = null;

  if (track && C.liveries) {
    track.innerHTML = C.liveries.map((l, i) => {
      const [c1, c2] = palette[i % palette.length];
      return `<figure class="slide" style="--c1:${c1};--c2:${c2}" aria-label="${esc(l.title)}">
        <span class="tag">${esc(l.note)}</span>
        <h3>${esc(l.title)}</h3>
        <span class="car-shape" aria-hidden="true"></span>
      </figure>`;
    }).join("");
    slides = $$(".slide", track);
    dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Ir a la livery ${i + 1}`);
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(b);
      return b;
    });
  }

  function goTo(i, userAction) {
    if (!slides.length) return;
    current = (i + slides.length) % slides.length;
    const target = slides[current];
    track.scrollTo({
      left: target.offsetLeft - (track.clientWidth - target.clientWidth) / 2,
      behavior: reduce ? "auto" : "smooth"
    });
    update();
    if (userAction) restartAuto();
  }

  function update() {
    slides.forEach((s, i) => {
      s.classList.toggle("active", i === current);
      const d = i - current;
      s.style.setProperty("--ry", `${d * -18}deg`);
      s.style.setProperty("--sc", i === current ? 1 : 0.9);
    });
    dots.forEach((d, i) => d.classList.toggle("on", i === current));
  }

  function restartAuto() {
    clearInterval(autoTimer);
    if (reduce || slides.length < 2) return;
    autoTimer = setInterval(() => goTo(current + 1, false), 4500);
  }

  if (track && slides.length) {
    prevBtn.addEventListener("click", () => goTo(current - 1, true));
    nextBtn.addEventListener("click", () => goTo(current + 1, true));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") goTo(current + 1, true);
      if (e.key === "ArrowLeft") goTo(current - 1, true);
    });
    // Detecta la tarjeta centrada mientras se desliza con el dedo o la rueda
    let raf = 0;
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = 0, bestDist = Infinity;
        slides.forEach((s, i) => {
          const dist = Math.abs(s.offsetLeft + s.clientWidth / 2 - mid);
          if (dist < bestDist) { bestDist = dist; best = i; }
        });
        if (best !== current) { current = best; update(); }
      });
    }, { passive: true });
    track.addEventListener("mouseenter", () => clearInterval(autoTimer));
    track.addEventListener("mouseleave", restartAuto);
    update();
    restartAuto();
  }

  /* ---------- Título con letras que entran en 3D ---------- */
  $$("[data-split]").forEach((el) => {
    const walk = (node) => {
      const out = document.createDocumentFragment();
      node.childNodes.forEach((child) => {
        if (child.nodeType === 3) {
          let idx = 0;
          [...child.textContent].forEach((ch) => {
            if (ch === " ") { out.appendChild(document.createTextNode(" ")); return; }
            const s = document.createElement("span");
            s.className = "ch";
            s.textContent = ch;
            s.style.setProperty("--d", `${0.15 + idx * 0.045}s`);
            out.appendChild(s);
            idx++;
          });
        } else {
          const clone = child.cloneNode(false);
          clone.appendChild(walk(child));
          out.appendChild(clone);
        }
      });
      return out;
    };
    const frag = walk(el);
    el.textContent = "";
    el.appendChild(frag);
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
  });

  /* ---------- Revelado al hacer scroll ---------- */
  const revealEls = $$(".reveal-3d");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Contadores ---------- */
  const counters = $$("[data-count]");
  const runCount = (el) => {
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = end + suffix; return; }
    const dur = 1600;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCount);
  }

  /* ---------- Tilt 3D con el mouse + brillo que sigue al cursor ---------- */
  if (finePointer && !reduce) {
    $$("[data-tilt]").forEach((card) => {
      card.classList.add("tilt");
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (0.5 - y) * 12;
        const ry = (x - 0.5) * 14;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Botones magnéticos ---------- */
  if (finePointer && !reduce) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Scroll: progreso, logo 3D, orbes y títulos ---------- */
  const bar = $("#progress-bar");
  const logoStage = $("[data-tilt-scroll]");
  const orbs = $$(".orb");
  const hero = $(".hero");
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

    if (!reduce) {
      const heroH = hero ? hero.offsetHeight : window.innerHeight;
      const p = Math.min(y / heroH, 1);
      if (logoStage) {
        logoStage.style.transform =
          `perspective(900px) rotateX(${p * 40}deg) rotateY(${p * -25}deg) translateY(${p * -40}px) scale(${1 - p * 0.25})`;
        logoStage.style.opacity = String(1 - p * 0.8);
      }
      orbs.forEach((o, i) => {
        const dir = i === 0 ? 1 : -1;
        o.style.transform = `translate3d(${dir * p * 80}px, ${p * 160}px, 0)`;
      });
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Formulario de staff ---------- */
  const staffStatus = $("#staff-status");
  const staffText = $("#staff-status-text");
  const openArea = $("#open-area");
  const closedBox = $("#closed");
  const gate = $("#gate");
  const form = $("#form");
  let linked = false;

  if (C.staffOpen) {
    staffStatus.classList.add("open");
    staffText.textContent = "Postulaciones abiertas";
    openArea.hidden = false;
    closedBox.hidden = true;
  } else {
    staffText.textContent = "Postulaciones cerradas";
    openArea.hidden = true;
    closedBox.hidden = false;
  }

  $("#gate-btn")?.addEventListener("click", () => {
    const v = $("#discord-id").value.trim();
    const msg = $("#gate-msg");
    if (!/^\d{17,20}$/.test(v)) {
      msg.className = "msg err";
      msg.textContent = "El ID tiene que ser numérico, de 17 a 20 dígitos.";
      return;
    }
    linked = true;
    msg.className = "msg ok";
    msg.textContent = "Cuenta vinculada. Ya podés completar el formulario.";
    gate.hidden = true;
    form.hidden = false;
    form.classList.add("reveal-3d", "in");
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = $("#form-msg");
    const ids = ["f-name", "f-age", "f-hours", "f-why"];
    if (!linked) { msg.className = "msg err"; msg.textContent = "Primero vinculá tu cuenta de Discord."; return; }
    if (ids.some((id) => !$("#" + id).value.trim())) {
      msg.className = "msg err"; msg.textContent = "Completá todos los campos."; return;
    }
    msg.className = "msg ok";
    msg.textContent = "Postulación lista. Este formulario todavía no envía datos: hace falta conectarlo a un backend.";
  });
})();
