/* Widget del asistente con Gemini.
   Habla con /api/chat (función de Vercel). La clave nunca llega al navegador. */
(() => {
  "use strict";

  const ENDPOINT = "/api/chat";
  const STORE_KEY = "la-chat-v1";
  const WELCOME = "¡Hola! Soy el asistente de Los Argentinos RP. Preguntame sobre cómo entrar, las facciones, el staff o el bot.";
  const SUGGESTIONS = ["¿Cómo entro al server?", "¿Cómo me postulo a staff?", "¿Qué facciones hay?", "¿Qué es ER:LC?"];

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  let history = loadHistory();
  let busy = false;

  // ---- Estructura del widget ----
  const fab = el("button", "chat-fab");
  fab.type = "button";
  fab.setAttribute("aria-label", "Abrir asistente");
  fab.setAttribute("aria-expanded", "false");
  fab.innerHTML = '<span class="fab-ico" aria-hidden="true">💬</span><span class="fab-label">Preguntá al bot</span>';

  const panel = el("section", "chat-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Asistente de Los Argentinos RP");
  panel.hidden = true;

  const head = el("header", "chat-head");
  const headTitle = el("div", "chat-title");
  headTitle.append(el("b", null, "Asistente LA RP"), el("small", null, "Con inteligencia artificial"));
  const closeBtn = el("button", "chat-close", "×");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Cerrar asistente");
  head.append(headTitle, closeBtn);

  const log = el("div", "chat-log");
  log.setAttribute("aria-live", "polite");

  const chips = el("div", "chat-chips");
  SUGGESTIONS.forEach((s) => {
    const b = el("button", "chip", s);
    b.type = "button";
    b.addEventListener("click", () => send(s));
    chips.appendChild(b);
  });

  const form = el("form", "chat-form");
  const input = el("input");
  input.type = "text";
  input.maxLength = 500;
  input.placeholder = "Escribí tu pregunta…";
  input.setAttribute("aria-label", "Tu pregunta");
  input.autocomplete = "off";
  const sendBtn = el("button", "chat-send", "Enviar");
  sendBtn.type = "submit";
  form.append(input, sendBtn);

  panel.append(head, log, chips, form);
  document.body.append(fab, panel);

  // ---- Render ----
  // Escapa el texto y convierte **negrita** del modelo; nunca se inserta HTML crudo.
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const formatBot = (s) => escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  function bubble(role, text) {
    const b = el("div", "cb " + (role === "user" ? "me" : "bot"));
    if (role === "user") b.textContent = text;
    else b.innerHTML = formatBot(text);
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function renderAll() {
    log.textContent = "";
    bubble("bot", WELCOME);
    history.forEach((m) => bubble(m.role, m.content));
    if (history.length) chips.hidden = true;
  }

  function typing() {
    const t = el("div", "cb bot typing-bubble");
    t.innerHTML = "<span></span><span></span><span></span>";
    t.setAttribute("aria-label", "El asistente está escribiendo");
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    return t;
  }

  // ---- Lógica ----
  function setOpen(open) {
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    fab.classList.toggle("is-open", open);
    if (open) setTimeout(() => input.focus(), 50);
  }

  async function send(text) {
    const content = (text ?? input.value).trim();
    if (!content || busy) return;
    input.value = "";
    chips.hidden = true;
    busy = true;
    sendBtn.disabled = true;

    history.push({ role: "user", content });
    bubble("user", content);
    saveHistory();
    const t = typing();

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12) })
      });
      const data = await res.json().catch(() => ({}));
      t.remove();
      if (!res.ok) throw new Error(data.error || "No se pudo responder.");
      history.push({ role: "assistant", content: data.reply });
      bubble("bot", data.reply);
      saveHistory();
    } catch (err) {
      t.remove();
      // El último mensaje del usuario queda para reintentar; no se guarda la respuesta fallida.
      const e = bubble("bot", err.message || "Algo salió mal. Probá de nuevo.");
      e.classList.add("err");
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.slice(-12) : [];
    } catch { return []; }
  }

  function saveHistory() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-12))); } catch { /* sin storage */ }
  }

  // ---- Eventos ----
  fab.addEventListener("click", () => setOpen(panel.hidden));
  closeBtn.addEventListener("click", () => setOpen(false));
  form.addEventListener("submit", (e) => { e.preventDefault(); send(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) setOpen(false); });

  // Botones de la página que abren el asistente
  document.querySelectorAll("[data-open-chat]").forEach((b) =>
    b.addEventListener("click", (e) => { e.preventDefault(); setOpen(true); }));

  renderAll();
})();
