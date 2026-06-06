// =============================================
//  APP.JS — Головна логіка
// =============================================

// --- STATE ---
let currentFilter = "all";
let currentSearch = "";
let currentSort = "default";

// --- DOM ---
const productsGrid    = document.getElementById("productsGrid");
const saleGrid        = document.getElementById("saleGrid");
const catalogFilters  = document.getElementById("catalogFilters");
const categoriesGrid  = document.getElementById("categoriesGrid");
const searchBar       = document.getElementById("searchBar");
const searchInput     = document.getElementById("searchInput");
const cartSidebar     = document.getElementById("cartSidebar");
const cartOverlay     = document.getElementById("cartOverlay");
const modalOverlay    = document.getElementById("modalOverlay");
const productModal    = document.getElementById("productModal");
const noResults       = document.getElementById("noResults");
const catalogCount    = document.getElementById("catalogCount");

// =============================================
//  RENDER CATEGORIES
// =============================================
function renderCategories() {
  categoriesGrid.innerHTML = CATEGORIES.map(cat => `
    <button class="category-card" data-id="${cat.id}" onclick="setFilter('${cat.id}'); scrollToCatalog()">
      <div class="category-card__img-wrap">
        <img src="${cat.img}" alt="${cat.label}" loading="lazy" />
      </div>
      <span class="category-card__label">${cat.emoji} ${cat.label}</span>
    </button>
  `).join("");
}

// =============================================
//  RENDER FILTER BUTTONS
// =============================================
function renderFilters() {
  const existing = catalogFilters.querySelector('[data-filter="all"]');
  CATEGORIES.forEach(cat => {
    if (!catalogFilters.querySelector(`[data-filter="${cat.id}"]`)) {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.dataset.filter = cat.id;
      btn.textContent = cat.label;
      btn.onclick = () => setFilter(cat.id);
      catalogFilters.appendChild(btn);
    }
  });
  if (existing) existing.onclick = () => setFilter("all");
}

function setFilter(id) {
  currentFilter = id;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b.dataset.filter === id));
  renderProducts();
}

function scrollToCatalog() {
  document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
}

// =============================================
//  STAR RATING
// =============================================
function stars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

// =============================================
//  RENDER PRODUCT CARD
// =============================================
function productCard(p) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
  return `
    <article class="product-card" data-id="${p.id}">
      <div class="product-card__img-wrap" onclick="openModal(${p.id})">
        <img src="${p.img}" alt="${p.name}" loading="lazy" class="product-card__img" />
        <div class="product-card__badges">
          ${p.isNew  ? '<span class="badge badge--new">NEW</span>' : ""}
          ${discount  ? `<span class="badge badge--sale">-${discount}%</span>` : ""}
        </div>
        <button class="product-card__quick" onclick="event.stopPropagation(); openModal(${p.id})">Швидкий перегляд</button>
      </div>
      <div class="product-card__body">
        <p class="product-card__cat">${CATEGORIES.find(c => c.id === p.category)?.label || ""}</p>
        <h3 class="product-card__name" onclick="openModal(${p.id})">${p.name}</h3>
        <div class="product-card__rating">
          <span class="stars">${stars(p.rating)}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="product-card__footer">
          <div class="product-card__prices">
            <span class="price">${p.price.toLocaleString("uk-UA")} грн</span>
            ${p.oldPrice ? `<span class="price--old">${p.oldPrice.toLocaleString("uk-UA")} грн</span>` : ""}
          </div>
          <button class="btn-add" onclick="addToCartDefault(${p.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

// =============================================
//  RENDER PRODUCTS
// =============================================
function getFiltered() {
  return PRODUCTS.filter(p => {
    const matchCat    = currentFilter === "all" || p.category === currentFilter;
    const matchSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase());
    return matchCat && matchSearch;
  });
}

function getSorted(list) {
  const arr = [...list];
  switch (currentSort) {
    case "price-asc":  return arr.sort((a, b) => a.price - b.price);
    case "price-desc": return arr.sort((a, b) => b.price - a.price);
    case "name-asc":   return arr.sort((a, b) => a.name.localeCompare(b.name, "uk"));
    default:           return arr;
  }
}

function renderProducts() {
  const filtered = getSorted(getFiltered());
  catalogCount.textContent = `Знайдено: ${filtered.length} товарів`;

  if (filtered.length === 0) {
    productsGrid.innerHTML = "";
    noResults.style.display = "block";
  } else {
    noResults.style.display = "none";
    productsGrid.innerHTML = filtered.map(productCard).join("");
  }
}

function renderSale() {
  const sale = PRODUCTS.filter(p => p.isSale);
  saleGrid.innerHTML = sale.map(productCard).join("");
}

// =============================================
//  PRODUCT MODAL
// =============================================
function openModal(id) {
  const p = PRODUCTS.find(p => p.id === id);
  if (!p) return;

  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;

  document.getElementById("modalBody").innerHTML = `
    <div class="modal__img-wrap">
      <img src="${p.img}" alt="${p.name}" />
      <div class="product-card__badges">
        ${p.isNew  ? '<span class="badge badge--new">NEW</span>' : ""}
        ${discount  ? `<span class="badge badge--sale">-${discount}%</span>` : ""}
      </div>
    </div>
    <div class="modal__info">
      <p class="product-card__cat">${CATEGORIES.find(c => c.id === p.category)?.label || ""}</p>
      <h2>${p.name}</h2>
      <div class="product-card__rating" style="margin-bottom:12px">
        <span class="stars">${stars(p.rating)}</span>
        <span class="rating-count">(${p.reviews} відгуків)</span>
      </div>
      <p class="modal__desc">${p.desc}</p>
      <div class="modal__prices">
        <span class="price price--lg">${p.price.toLocaleString("uk-UA")} грн</span>
        ${p.oldPrice ? `<span class="price--old">${p.oldPrice.toLocaleString("uk-UA")} грн</span>` : ""}
      </div>

      <div class="modal__colors">
        <p>Колір:</p>
        <div class="colors-list">
          ${p.colors.map((c, i) => `<button class="color-dot ${i === 0 ? 'active' : ''}" style="background:${c}" data-color="${c}" onclick="selectColor(this)"></button>`).join("")}
        </div>
      </div>

      <div class="modal__sizes">
        <p>Розмір:</p>
        <div class="sizes-list" id="modalSizes">
          ${p.sizes.map((s, i) => `<button class="size-btn ${i === 0 ? 'active' : ''}" data-size="${s}" onclick="selectSize(this)">${s}</button>`).join("")}
        </div>
      </div>

      <button class="btn btn--dark btn--full" style="margin-top:20px" onclick="addToCartFromModal(${p.id})">
        Додати до кошика
      </button>
    </div>
  `;

  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function selectSize(btn) {
  btn.closest(".sizes-list").querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function selectColor(btn) {
  btn.closest(".colors-list").querySelectorAll(".color-dot").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function addToCartFromModal(id) {
  const p = PRODUCTS.find(p => p.id === id);
  const sizeBtn = document.querySelector("#modalSizes .size-btn.active");
  const size = sizeBtn ? sizeBtn.dataset.size : p.sizes[0];
  Cart.add(p, size);
  closeModal();
}

function addToCartDefault(id) {
  const p = PRODUCTS.find(p => p.id === id);
  Cart.add(p, p.sizes[0]);
}

// =============================================
//  SEARCH
// =============================================
document.getElementById("searchToggle").addEventListener("click", () => {
  searchBar.classList.toggle("open");
  if (searchBar.classList.contains("open")) searchInput.focus();
});

document.getElementById("searchClose").addEventListener("click", () => {
  searchBar.classList.remove("open");
  searchInput.value = "";
  currentSearch = "";
  renderProducts();
});

searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value;
  renderProducts();
  if (currentSearch) scrollToCatalog();
});

// =============================================
//  SORT
// =============================================
document.getElementById("sortSelect").addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderProducts();
});

// =============================================
//  CART SIDEBAR
// =============================================
document.getElementById("cartToggle").addEventListener("click", () => {
  cartSidebar.classList.add("open");
  cartOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
});

function closeCart() {
  cartSidebar.classList.remove("open");
  cartOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// =============================================
//  MODAL CLOSE
// =============================================
document.getElementById("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

// =============================================
//  MOBILE MENU
// =============================================
const burgerBtn    = document.getElementById("burgerBtn");
const navLinks     = document.getElementById("navLinks");
const mobileOverlay = document.getElementById("mobileOverlay");

burgerBtn.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  burgerBtn.classList.toggle("open");
  mobileOverlay.classList.toggle("open");
});
mobileOverlay.addEventListener("click", () => {
  navLinks.classList.remove("open");
  burgerBtn.classList.remove("open");
  mobileOverlay.classList.remove("open");
});

// Close mobile menu on link click
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  burgerBtn.classList.remove("open");
  mobileOverlay.classList.remove("open");
}));

// =============================================
//  HEADER SCROLL
// =============================================
window.addEventListener("scroll", () => {
  document.getElementById("header").classList.toggle("scrolled", window.scrollY > 60);
});

// =============================================
//  TOAST
// =============================================
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Make showToast available globally (used in cart.js)
window.showToast = showToast;

// =============================================
//  INIT
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  renderFilters();
  renderProducts();
  renderSale();
  Cart.init();
});