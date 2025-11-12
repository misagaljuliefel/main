/* pos.js
   Handles rendering sales products, cart operations (add, +/-), search,
   clear cart, and finalize sale which validates stock and updates localStorage.
*/

document.addEventListener('DOMContentLoaded', () => {
  const productContainer = document.getElementById('productContainer');
  const posSearch = document.getElementById('posSearch');
  const cartContainer = document.getElementById('cartContainer');
  const grandTotalEl = document.getElementById('grandTotal');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const finalizeBtn = document.getElementById('finalizeBtn');
  const goToAdmin = document.getElementById('goToAdmin');

  // modal for stock errors
  const stockModal = document.getElementById('stockModal');
  const stockErrorMessage = document.getElementById('stockErrorMessage');
  const closeStockBtn = document.getElementById('closeStockBtn');

  let products = []; // loaded from storage
  let cart = []; // { id, productName, productPrice, quantity }

  /* Load products from storage with normalized keys */
  function loadProducts() {
    const arr = getAllProducts();
    products = arr.map(p => ({
      id: p.id || p.productName,
      productName: p.productName,
      productDetail: p.productDetail || p.desc || '',
      productPrice: Number(p.productPrice || p.price || 0),
      stock: Number(p.stock || p.stockQuantity || 0),
      productImage: p.productImage || p.image || ''
    }));
  }

  /* Render product cards (clickable: add to cart) */
  function renderProducts(filter = '') {
    loadProducts();
    productContainer.innerHTML = '';
    const q = filter.trim().toLowerCase();

    const filtered = products.filter(p => p.productName.toLowerCase().includes(q));

    if (filtered.length === 0) {
      productContainer.innerHTML = '<div class="empty">No products found.</div>';
      return;
    }

    filtered.forEach(p => {
      const el = document.createElement('div');
      el.className = 'pos-product';
      el.innerHTML = `
        <div class="pos-thumb"><img src="${p.productImage || ''}" alt="${p.productName}"></div>
        <div class="pos-info">
          <div class="pos-title">${escapeHtml(p.productName)}</div>
          <div class="pos-meta">Price: ₱${Number(p.productPrice).toFixed(2)}</div>
          <div class="pos-meta">Stock: ${p.stock} units</div>
        </div>
        <div class="pos-actions">
          <button class="add-to-cart" data-id="${p.id}">Add</button>
        </div>
      `;
      productContainer.appendChild(el);
    });

    // attach events for add buttons
    productContainer.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const product = products.find(x => x.id == id);
        if (product) addToCart(product);
      });
    });
  }

  /* Add product to cart (or increase qty if exists) */
  function addToCart(product) {
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        // prevent adding beyond stock
        showStockError(`${product.productName} only has ${product.stock} in stock.`);
        return;
      }
      existing.quantity += 1;
    } else {
      if (product.stock <= 0) {
        showStockError(`${product.productName} is out of stock.`);
        return;
      }
      cart.push({
        id: product.id,
        productName: product.productName,
        productPrice: product.productPrice,
        quantity: 1,
        stock: product.stock
      });
    }
    renderCart();
  }

  /* Render cart with +/- buttons and subtotals */
  function renderCart() {
    cartContainer.innerHTML = '';
    if (cart.length === 0) {
      cartContainer.innerHTML = '<div class="empty">Cart is empty.</div>';
      grandTotalEl.textContent = '₱0.00';
      return;
    }

    let total = 0;
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      const subtotal = item.productPrice * item.quantity;
      total += subtotal;
      row.innerHTML = `
        <div class="cart-left">
          <div class="cart-name">${escapeHtml(item.productName)}</div>
          <div class="cart-sub">₱${item.productPrice.toFixed(2)} x ${item.quantity} = ₱${subtotal.toFixed(2)}</div>
        </div>
        <div class="cart-right">
          <button class="minus" data-id="${item.id}">−</button>
          <span class="qty">${item.quantity}</span>
          <button class="plus" data-id="${item.id}">+</button>
        </div>
      `;
      cartContainer.appendChild(row);
    });

    // attach plus/minus events
    cartContainer.querySelectorAll('.plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = cart.find(c => c.id === id);
        const product = products.find(p => p.id === id);
        if (!item || !product) return;
        if (item.quantity + 1 > product.stock) {
          showStockError(`${product.productName} only has ${product.stock} in stock.`);
          return;
        }
        item.quantity += 1;
        renderCart();
      });
    });

    cartContainer.querySelectorAll('.minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const itemIndex = cart.findIndex(c => c.id === id);
        if (itemIndex === -1) return;
        if (cart[itemIndex].quantity > 1) {
          cart[itemIndex].quantity -= 1;
        } else {
          cart.splice(itemIndex, 1); // remove if quantity goes to zero
        }
        renderCart();
      });
    });

    grandTotalEl.textContent = `₱${total.toFixed(2)}`;
  }

  /* Clear cart */
  clearCartBtn.addEventListener('click', () => {
    cart = [];
    renderCart();
  });

  /* Finalize sale - validate stock, deduct stock, save to localStorage */
  finalizeBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showStockError('Cart is empty. Add items before finalizing.');
      return;
    }

    loadProducts(); // fresh product stock from storage
    // check stock for every cart item
    for (let item of cart) {
      const product = products.find(p => p.id === item.id);
      if (!product) {
        showStockError(`Product ${item.productName} not found in database.`);
        return;
      }
      if (item.quantity > product.stock) {
        showStockError(`${item.productName} only has ${product.stock} in stock. Please adjust quantity.`);
        return;
      }
    }

    // all good — deduct stock and save
    const updated = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        return Object.assign({}, p, { stock: p.stock - cartItem.quantity });
      }
      return p;
    });

    // Save using the same key names your DB expects
    const normalized = updated.map(p => ({
      id: p.id,
      productName: p.productName,
      productDetail: p.productDetail,
      productPrice: p.productPrice,
      stockQuantity: p.stock,
      productImage: p.productImage
    }));
    saveAllProducts(normalized);

    // Clear cart and update UI
    cart = [];
    renderProducts(posSearch.value);
    renderCart();

    alert('Sale finalized. Stocks updated.');
  });

  /* Search */
  posSearch.addEventListener('input', (e) => {
    renderProducts(e.target.value);
  });

  /* Modal helpers */
  function showStockError(msg) {
    stockErrorMessage.textContent = msg;
    stockModal.classList.remove('hidden');
  }
  closeStockBtn.addEventListener('click', () => {
    stockModal.classList.add('hidden');
  });

  /* Navigation to admin page */
  goToAdmin.addEventListener('click', () => {
    window.location.href = 'admin.html';
  });

  // helper
  function escapeHtml(text = '') {
    return text.toString()
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // initial render
  renderProducts();
  renderCart();
});
