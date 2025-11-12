document.addEventListener('DOMContentLoaded', () => {
    // GET ELEMENTS
    const productContainer = document.getElementById('productContainer');
    const searchBar = document.getElementById('searchBar');
    const cartList = document.getElementById('cartList');
    const grandTotalEl = document.getElementById('grandTotal');
    const clearBtn = document.getElementById('clearBtn');

    let products = getArrayedProducts(); // LOAD PRODUCTS FROM LOCAL STORAGE
    let cart = []; // EMPTY CART ARRAY

    /* DISPLAY PRODUCTS ON SCREEN */
    function renderProducts(filter = '') {
        productContainer.innerHTML = '';
        const q = filter.trim().toLowerCase();

        // FILTER PRODUCTS BASED ON SEARCH BAR INPUT
        const filtered = products.filter(p =>
            p.productName.toLowerCase().includes(q)
        );

        if (filtered.length === 0) {
            productContainer.innerHTML = '<p>No products found.</p>';
            return;
        }

        // LOOP THROUGH EACH PRODUCT AND CREATE CARD
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

            // WHEN ADD BUTTON IS CLICKED
            card.querySelector('.addBtn').addEventListener('click', () => addToCart(p));
            productContainer.appendChild(card);
        });
    }

    /* ADD PRODUCT TO CART */
    function addToCart(product) {
        const existing = cart.find(item => item.productName === product.productName);

        if (existing) {
            existing.quantity += 1; // ADD QUANTITY IF ALREADY IN CART
        }
