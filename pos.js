document.addEventListener('DOMContentLoaded', () => {
  const productContainer = document.getElementById('productContainer');
  const searchBar = document.getElementById('searchBar');
  const cartList = document.getElementById('cartList');
  const grandTotalEl = document.getElementById('grandTotal');
  const clearBtn = document.getElementById('clearBtn');

  let products = getArrayedProducts();
  let cart = [];

  function renderProducts(filter = '') {
    productContainer.innerHTML = '';
    const q = filter.trim().toLowerCase();
    const filtered = products.filter(p =>
      p.productName.toLowerCase().includes(q)
    );

    if (!filtered.length) {
      productContainer.innerHTML = '<p>No products found.</p>';
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.productImage || ''}" alt="${p.productName}">
        <h4>${p.productName}</h4>
        <p>${p.productDetail}</p>
        <p>₱${Number(p.productPrice).toFixed(2)}</p>
        <button class="addBtn">Add to Cart</button>
      `;
      card.querySelector('.addBtn').addEventListener('click', () => addToCart(p));
      productContainer.appendChild(card);
    });
  }

  function addToCart(product) {
    const existing = cart.find(item => item.productName === product.productName);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    renderCart();
  }

  function renderCart() {
    cartList.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      const li = document.createElement('li');
      const subtotal = item.productPrice * item.quantity;
      total += subtotal;
      li.innerHTML = `${item.productName} (x${item.quantity}) - ₱${subtotal.toFixed(2)}`;
      cartList.appendChild(li);
    });
    grandTotalEl.textContent = `₱${total.toFixed(2)}`;
  }

  clearBtn.addEventListener('click', () => {
    cart = [];
    renderCart();
  });

  searchBar.addEventListener('input', e => {
    renderProducts(e.target.value);
  });

  renderProducts();
});
