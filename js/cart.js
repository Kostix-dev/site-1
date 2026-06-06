// =============================================
//  CART.JS — Логіка кошика
// =============================================

const Cart = (() => {
  let items = JSON.parse(localStorage.getItem("vogue_cart") || "[]");

  function save() {
    localStorage.setItem("vogue_cart", JSON.stringify(items));
    updateBadge();
    renderCartSidebar();
  }

  function updateBadge() {
    const badge = document.getElementById("cartBadge");
    const total = items.reduce((sum, i) => sum + i.qty, 0);
    badge.textContent = total;
    badge.classList.toggle("visible", total > 0);
  }

  function add(product, size, qty = 1) {
    const key = `${product.id}-${size}`;
    const existing = items.find(i => i.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ key, id: product.id, name: product.name, price: product.price, img: product.img, size, qty });
    }
    save();
    showToast(`✓ "${product.name}" додано до кошика`);
  }

  function remove(key) {
    items = items.filter(i => i.key !== key);
    save();
  }

  function updateQty(key, delta) {
    const item = items.find(i => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) remove(key);
    else save();
  }

  function getTotal() {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function renderCartSidebar() {
    const container = document.getElementById("cartItems");
    const empty = document.getElementById("cartEmpty");
    const footer = document.getElementById("cartFooter");
    const totalEl = document.getElementById("cartTotal");

    if (items.length === 0) {
      empty.style.display = "flex";
      footer.style.display = "none";
      container.innerHTML = "";
      container.appendChild(empty);
      return;
    }

    empty.style.display = "none";
    footer.style.display = "block";
    totalEl.textContent = getTotal().toLocaleString("uk-UA") + " грн";

    container.innerHTML = items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <img src="${item.img}" alt="${item.name}" class="cart-item__img" />
        <div class="cart-item__info">
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__size">Розмір: ${item.size}</p>
          <p class="cart-item__price">${(item.price * item.qty).toLocaleString("uk-UA")} грн</p>
          <div class="cart-item__qty">
            <button onclick="Cart.updateQty('${item.key}', -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="Cart.updateQty('${item.key}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item__remove" onclick="Cart.remove('${item.key}')">✕</button>
      </div>
    `).join("");
  }

  function init() {
    updateBadge();
    renderCartSidebar();
  }

  return { add, remove, updateQty, getTotal, init, renderCartSidebar };
})();