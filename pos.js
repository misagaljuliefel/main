    /* pos.js
    Handles rendering sales products, cart operations (click to add, +/-), search,
    clear cart, and finalize sale with stock validation.
    */

    document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('productContainer');
    const posSearch = document.getElementById('posSearch');
    const cartContainer = document.getElementById('cartContainer');
    const grandTotalEl = document.getElementById('grandTotal');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const finalizeBtn = document.getElementById('finalizeBtn');
    const goToAdmin = document.getElementById('goToAdmin');

    // Modal
    const stockModal = document.getElementById('stockModal');
    const stockErrorMessage = document.getElementById('stockErrorMessage');
    const closeStockBtn = document.getElementById('closeStockBtn');

    let products = [];
    let cart = [];

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
            <img src="${p.productImage || ''}" alt="${p.productName}">
            <div class="pos-info">
            <div class="pos-title">${escapeHtml(p.productName)}</div>
            <div class="pos-meta">₱${p.productPrice.toFixed(2)}</div>
            <div class="pos-meta">Stock: ${p.stock} units</div>
            </div>
        `;

        // click anywhere on card to add to cart
        el.addEventListener('click', () => addToCart(p));

        productContainer.appendChild(el);
        });
    }

    function addToCart(product) {
        const existing = cart.find(c => c.id === product.id);
        if (existing) {
        if (existing.quantity + 1 > product.stock) {
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
            const idx = cart.findIndex(c => c.id === id);
            if (idx === -1) return;
            if (cart[idx].quantity > 1) {
            cart[idx].quantity -= 1;
            } else {
            cart.splice(idx, 1);
            }
            renderCart();
        });
        });

        grandTotalEl.textContent = `₱${total.toFixed(2)}`;
    }

    clearCartBtn.addEventListener('click', () => {
        cart = [];
        renderCart();
    });

    finalizeBtn.addEventListener('click', () => {
        if (cart.length === 0) {
        showStockError('Cart is empty. Add items before finalizing.');
        return;
        }

        loadProducts();
        for (let item of cart) {
        const product = products.find(p => p.id === item.id);
        if (!product) {
            showStockError(`Product ${item.productName} not found.`);
            return;
        }
        if (item.quantity > product.stock) {
            showStockError(`${product.productName} only has ${product.stock} in stock.`);
            return;
        }
        }

        const updated = products.map(p => {
        const c = cart.find(x => x.id === p.id);
        if (c) return {...p, stock: p.stock - c.quantity};
        return p;
        });

        const normalized = updated.map(p => ({
        id: p.id,
        productName: p.productName,
        productDetail: p.productDetail,
        productPrice: p.productPrice,
        stockQuantity: p.stock,
        productImage: p.productImage
        }));

        saveAllProducts(normalized);
        cart = [];
        renderProducts(posSearch.value);
        renderCart();

        alert('Sale finalized. Stocks updated.');
    });

    posSearch.addEventListener('input', e => renderProducts(e.target.value));

    function showStockError(msg) {
        stockErrorMessage.textContent = msg;
        stockModal.classList.remove('hidden');
    }
    closeStockBtn.addEventListener('click', () => stockModal.classList.add('hidden'));

    goToAdmin.addEventListener('click', () => {
        window.location.href = 'admin.html';
    });

    function escapeHtml(text = '') {
        return text.toString()
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    renderProducts();
    renderCart();
    });
