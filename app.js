import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-config.js";

// ---------------------------------------------------------
// COLUMNAS / PERSONAS — edita aqu\u00ed para a\u00f1adir o renombrar
// ---------------------------------------------------------
const COLUMNS = [
  { id: "mafer", label: "Mafer" },
  { id: "pau", label: "Pau" },
  { id: "monkeynovios", label: "Monkeynovios" },
];

const itemsCol = collection(db, "articulos");
let ALL_ITEMS = [];

let currentView = "wishlist";     // "wishlist" | "comprados"
let currentPerson = COLUMNS[0].id; // id de columna, o "todos"
let currentPriceFilter = "todo";   // "todo" o "min-max"

// ---------------------------------------------------------
// RANGOS DE PRECIO AUTOM\u00c1TICOS
// ---------------------------------------------------------
const STEP_OPTIONS = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000];

function pickStep(maxPrice) {
  if (maxPrice <= 0) return 20;
  for (const step of STEP_OPTIONS) {
    if (maxPrice / step <= 5) return step;
  }
  return STEP_OPTIONS[STEP_OPTIONS.length - 1];
}

function buildRanges(prices) {
  if (prices.length === 0) return [];
  const max = Math.max(...prices);
  const step = pickStep(max);
  const numRanges = Math.max(1, Math.ceil(max / step));
  const ranges = [];
  for (let i = 0; i < numRanges; i++) {
    const min = i * step;
    const isLast = i === numRanges - 1;
    ranges.push({
      min,
      max: isLast ? Infinity : (i + 1) * step,
      label: isLast ? `${min}\u20ac+` : `${min}\u2013${(i + 1) * step}\u20ac`,
      key: `${min}-${isLast ? "inf" : (i + 1) * step}`,
    });
  }
  return ranges;
}

function money(n) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
function escapeAttr(str) {
  return (str ?? "").replace(/"/g, "&quot;");
}

// ---------------------------------------------------------
// SETUP EST\u00c1TICO: pesta\u00f1as de persona + select del modal
// ---------------------------------------------------------
const personTabsEl = document.getElementById("personTabs");
const fPersonaSelect = document.getElementById("fPersona");

function buildPersonTabs() {
  const tabs = [{ id: "todos", label: "Todos" }, ...COLUMNS];
  personTabsEl.innerHTML = tabs.map((t) =>
    `<button type="button" class="person-tab ${t.id === currentPerson ? "active" : ""}" data-person="${t.id}">${t.label} <span class="count" data-count-for="${t.id}"></span></button>`
  ).join("");

  personTabsEl.querySelectorAll(".person-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPerson = btn.dataset.person;
      currentPriceFilter = "todo";
      personTabsEl.querySelectorAll(".person-tab").forEach((b) => b.classList.toggle("active", b === btn));
      render();
    });
  });

  fPersonaSelect.innerHTML = COLUMNS.map((c) => `<option value="${c.id}">${c.label}</option>`).join("");
}
buildPersonTabs();

document.querySelectorAll(".view-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    currentView = tab.dataset.view;
    currentPriceFilter = "todo";
    document.querySelectorAll(".view-tab").forEach((t) => t.classList.toggle("active", t === tab));
    render();
  });
});

// ---------------------------------------------------------
// RENDER
// ---------------------------------------------------------
const grid = document.getElementById("grid");
const priceFiltersEl = document.getElementById("priceFilters");
const addFab = document.getElementById("addFab");

function render() {
  const byView = ALL_ITEMS.filter((it) => (currentView === "comprados" ? it.comprado : !it.comprado));

  // contadores en las pesta\u00f1as de persona
  personTabsEl.querySelectorAll("[data-count-for]").forEach((el) => {
    const pid = el.dataset.countFor;
    const n = pid === "todos" ? byView.length : byView.filter((it) => it.persona === pid).length;
    el.textContent = n;
  });

  const byPerson = currentPerson === "todos" ? byView : byView.filter((it) => it.persona === currentPerson);

  // chips de precio, calculados sobre lo que se ve ahora mismo
  const ranges = buildRanges(byPerson.map((it) => it.precio));
  priceFiltersEl.innerHTML = `<button type="button" class="price-chip ${currentPriceFilter === "todo" ? "active" : ""}" data-range="todo">Todo</button>` +
    ranges.map((r) => `<button type="button" class="price-chip ${currentPriceFilter === r.key ? "active" : ""}" data-range="${r.key}">${r.label}</button>`).join("");

  priceFiltersEl.querySelectorAll(".price-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      currentPriceFilter = chip.dataset.range;
      render();
    });
  });

  let visible = byPerson;
  if (currentPriceFilter !== "todo") {
    const range = ranges.find((r) => r.key === currentPriceFilter);
    if (range) visible = visible.filter((it) => it.precio >= range.min && it.precio < range.max);
  }
  visible = visible.slice().sort((a, b) => a.precio - b.precio);

  addFab.style.display = currentView === "wishlist" ? "inline-flex" : "none";

  grid.innerHTML = "";
  if (visible.length === 0) {
    const empty = document.createElement("div");
    empty.className = "grid-empty";
    empty.textContent = currentView === "comprados"
      ? "Nada comprado todav\u00eda aqu\u00ed."
      : "A\u00fan no hay nada aqu\u00ed. Pulsa \u00abA\u00f1adir art\u00edculo\u00bb.";
    grid.appendChild(empty);
    return;
  }

  visible.forEach((item, i) => {
    const card = renderCard(item);
    card.style.animationDelay = `${Math.min(i, 10) * 30}ms`;
    grid.appendChild(card);
  });
}

function personLabel(id) {
  return COLUMNS.find((c) => c.id === id)?.label ?? id;
}

function placeholderSvg() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M20 12v9H4v-9M2 7h20v5H2V7zm10 0V4a2 2 0 00-4 0c0 1.66 4 3 4 3zm0 0V4a2 2 0 014 0c0 1.66-4 3-4 3z"/></svg>`;
}

function renderCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  const hasImage = !!item.imagen;
  const mediaContent = hasImage
    ? `<img src="${escapeAttr(item.imagen)}" alt="" onerror="this.style.display='none'; this.closest('.card-media').classList.add('placeholder'); this.closest('.card-media').insertAdjacentHTML('afterbegin', '${placeholderSvg().replace(/'/g, "\\'")}')">`
    : placeholderSvg();

  card.innerHTML = `
    <div class="card-media ${hasImage ? "" : "placeholder"}">
      ${mediaContent}
      ${currentPerson === "todos" ? `<span class="card-tag tag-${item.persona}">${personLabel(item.persona)}</span>` : ""}
      <button class="card-check ${item.comprado ? "checked" : ""}" data-toggle="${item.id}" title="${item.comprado ? "Devolver a la wishlist" : "Marcar como comprado"}">&#10003;</button>
    </div>
    <p class="card-price">${money(item.precio)}</p>
    <p class="card-title">${escapeHtml(item.nombre)}</p>
    ${item.detalles ? `<p class="card-detalles">${escapeHtml(item.detalles)}</p>` : ""}
    ${item.motivo ? `<p class="card-motivo">&ldquo;${escapeHtml(item.motivo)}&rdquo;</p>` : ""}
    ${item.link ? `<a class="card-link" href="${escapeAttr(item.link)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Ver producto</a>` : ""}
  `;

  card.querySelector("[data-toggle]").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleComprado(item);
  });

  card.addEventListener("click", (e) => {
    if (e.target.closest("[data-toggle]") || e.target.closest(".card-link")) return;
    openModal(item);
  });

  return card;
}

// ---------------------------------------------------------
// FIRESTORE
// ---------------------------------------------------------
onSnapshot(itemsCol, (snap) => {
  ALL_ITEMS = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  render();
}, (err) => {
  console.error(err);
  showToast("Error al conectar con la base de datos. Revisa firebase-config.js");
});

async function toggleComprado(item) {
  await updateDoc(doc(db, "articulos", item.id), { comprado: !item.comprado });
}

// ---------------------------------------------------------
// MODAL
// ---------------------------------------------------------
const backdrop = document.getElementById("modalBackdrop");
const form = document.getElementById("itemForm");
const modalTitle = document.getElementById("modalTitle");
const deleteBtn = document.getElementById("deleteBtn");

function openModal(item = {}) {
  form.reset();
  document.getElementById("itemId").value = item.id || "";
  fPersonaSelect.value = item.persona || (currentPerson !== "todos" ? currentPerson : COLUMNS[0].id);
  document.getElementById("fNombre").value = item.nombre || "";
  document.getElementById("fPrecio").value = item.precio ?? "";
  document.getElementById("fLink").value = item.link || "";
  document.getElementById("fImagen").value = item.imagen || "";
  document.getElementById("fDetalles").value = item.detalles || "";
  document.getElementById("fMotivo").value = item.motivo || "";

  modalTitle.textContent = item.id ? "Editar art\u00edculo" : "Nuevo art\u00edculo";
  deleteBtn.style.display = item.id ? "inline-flex" : "none";
  deleteBtn.classList.remove("confirming");
  deleteBtn.textContent = "Eliminar";
  clearTimeout(deleteBtn._resetTimer);

  backdrop.classList.add("open");
  document.getElementById("fNombre").focus();
}

function closeModal() {
  backdrop.classList.remove("open");
  deleteBtn.classList.remove("confirming");
  deleteBtn.textContent = "Eliminar";
  clearTimeout(deleteBtn._resetTimer);
}

addFab.addEventListener("click", () => openModal());
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelBtn").addEventListener("click", closeModal);
backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("itemId").value;
  const payload = {
    persona: fPersonaSelect.value,
    nombre: document.getElementById("fNombre").value.trim(),
    precio: parseFloat(document.getElementById("fPrecio").value),
    link: document.getElementById("fLink").value.trim(),
    imagen: document.getElementById("fImagen").value.trim(),
    detalles: document.getElementById("fDetalles").value.trim(),
    motivo: document.getElementById("fMotivo").value.trim(),
  };

  try {
    if (id) {
      await updateDoc(doc(db, "articulos", id), payload);
      showToast("Art\u00edculo actualizado");
    } else {
      payload.comprado = false;
      payload.createdAt = Date.now();
      await addDoc(itemsCol, payload);
      showToast("A\u00f1adido a la wishlist");
    }
    closeModal();
  } catch (err) {
    console.error(err);
    showToast("No se pudo guardar. Revisa la conexi\u00f3n con Firebase.");
  }
});

deleteBtn.addEventListener("click", async () => {
  const id = document.getElementById("itemId").value;
  if (!id) return;

  if (!deleteBtn.classList.contains("confirming")) {
    deleteBtn.classList.add("confirming");
    deleteBtn.textContent = "\u00bfSeguro? Pulsa otra vez";
    clearTimeout(deleteBtn._resetTimer);
    deleteBtn._resetTimer = setTimeout(() => {
      deleteBtn.classList.remove("confirming");
      deleteBtn.textContent = "Eliminar";
    }, 3500);
    return;
  }

  clearTimeout(deleteBtn._resetTimer);
  deleteBtn.classList.remove("confirming");
  deleteBtn.textContent = "Eliminar";

  try {
    await deleteDoc(doc(db, "articulos", id));
    showToast("Art\u00edculo eliminado");
    closeModal();
  } catch (err) {
    console.error(err);
    showToast("No se pudo eliminar. Revisa la conexi\u00f3n con Firebase.");
  }
});

// ---------------------------------------------------------
// TOAST
// ---------------------------------------------------------
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
