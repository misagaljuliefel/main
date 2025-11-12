document.addEventListener('DOMContentLoaded', () => {
    // GET ELEMENTS
    const nameInput = document.getElementById('productName');
    const detailInput = document.getElementById('productDetail');
    const priceInput = document.getElementById('productPrice');
    const imageInput = document.getElementById('productImage');
    const addBtn = document.getElementById('addBtn');
    const productList = document.getElementById('productList');

    // GET ALL PRODUCTS FROM LOCAL STORAGE
    let products = getArrayedProducts();

    /* FUNCTION TO DISPLAY ALL PRODUCTS */
    function renderProducts() {
        productList.innerHTML = '';

        if (products.length === 0) {
            productList.innerHTML = '<p>No products yet.</p>';
            return;
        }

        // LOOP THROUGH EACH PRODUCT
        products.forEach((p, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${p.productName}</strong> - ₱${p.productPrice} <br>
                <small>${p.productDetail}</small>
                <button class="deleteBtn" data-index="${index}">Delete</button>
            `;
            productList.appendChild(li);
        });

        // DELETE BUTTON FUNCTION
        document.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.addEventListener('click', e => {
                const i = e.target.dataset.index;
                products.splice(i, 1); // REMOVE ITEM
                saveAllProducts(products);
                renderProducts();
            });
        });
    }

    /* ADD NEW PRODUCT */
    addBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const detail = detailInput.value.trim();
        const price = parseFloat(priceInput.value);
        const image = imageInput.value.trim();

        // VALIDATION
        if (!name || isNaN(price)) {
            alert('Please enter valid product name and price.');
            return;
        }

        // CREATE NEW PRODUCT OBJECT
        const newProduct = {
            productName: name,
            productDetail: detail,
            productPrice: price,
            productImage: image
        };

        // SAVE TO LOCAL STORAGE
        products.push(newProduct);
        saveAllProducts(products);
        renderProducts();

        // CLEAR INPUT FIELDS
        nameInput.value = '';
        detailInput.value = '';
        priceInput.value = '';
        imageInput.value = '';
    });

    // SHOW PRODUCTS ON PAGE LOAD
    renderProducts();
});
