/* Utility: generate simple id */
function generateId(prefix = 'p') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/* --- DOM references --- */
const adminProductList = document.getElementById('adminProductList');
const addProductForm = document.getElementById('addProductForm');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const searchInput = document.getElementById('searchInput');

/* Edit modal elements */
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeEditBtn = document.getElementById('closeEditBtn');
const editName = document.getElementById('editName');
const editDesc = document.getElementById('editDesc');
const editPrice = document.getElementById('editPrice');
const editStock = document.getElementById('editStock');
const editImageUpload = document.getElementById('editImageUpload');
const editImagePreview = document.getElementById('editImagePreview');

let products = []; // local copy
let currentEditId = null;
let tempImageDataURL = null; // for add form
let tempEditImageDataURL = null; // for edit form

/* Ensure storage.js initialized DB (storage.js calls initializeDatabase on load) */
/* Use functions from storage.js: getArrayedProducts(), saveAllProducts(newArray) */

/* Load products from storage into local 'products' then render */
function loadProducts() {
  // getArrayedProducts() returns parsed array
  try {
    const arr = getArrayedProducts();
    products = Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error('Error reading products from storage:', err);
    products = [];
  }
}

/* Save products to storage */
function persistProducts() {
  // saveAllProducts(expectedArray) is defined in storage.js
  saveAllProducts(products);
}

/* Render product list in admin page */
function renderAdminProducts(filter = '') {
  loadProducts();
  const q = filter.trim().toLowerCase();
  adminProductList.innerHTML = '';

  if (!products.length) {
    adminProductList.innerHTML = '<div class="empty">No products yet. Add one on the right.</div>';
    return;
  }

  products
    .filter(p => (q ? p.name.toLowerCase().includes(q) : true))
    .forEach(p => {
      const item = document.createElement('div');
      item.className = 'admin-product';
      item.innerHTML = `
        <img class="thumb" src="${p.image || ''}" alt="${escapeHtml(p.name)}" />
        <div class="info">
          <div class="title">${escapeHtml(p.name)}</div>
          <div class="meta">Price: ₱ ${Number(p.price).toFixed(2)}</div>
          <div class="meta">Stock: ${p.stock} unit${p.stock!=1?'s':''}</div>
          <div class="desc">${escapeHtml(p.desc || '')}</div>
        </div>
        <div class="actions">
          <button class="edit-btn" data-id="${p.id}">Edit</button>
          <button class="delete-btn" data-id="${p.id}">Delete</button>
        </div>
      `;
      adminProductList.appendChild(item);
    });
}

/* Add product handler */
addProductForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('productName').value.trim();
  const desc = document.getElementById('productDesc').value.trim();
  const price = Number(document.getElementById('productPrice').value);
  const stock = Number(document.getElementById('productStock').value);

  if (!name || isNaN(price) || isNaN(stock)) {
    alert('Please fill required fields correctly.');
    return;
  }

  const newProduct = {
    id: generateId('p'),
    name,
    desc,
    price: Number(price),
    stock: parseInt(stock, 10),
    image: tempImageDataURL || '' // data URL from preview (or empty)
  };

  products.push(newProduct);
  persistProducts();
  renderAdminProducts(searchInput.value);
  addProductForm.reset();
  imagePreview.innerText = 'Image preview will appear here';
  imagePreview.style.backgroundImage = '';
  tempImageDataURL = null;
});

/* Image preview for add form */
imageUpload.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    tempImageDataURL = evt.target.result;
    imagePreview.style.backgroundImage = `url('${tempImageDataURL}')`;
    imagePreview.innerText = '';
  };
  reader.readAsDataURL(file);
});

/* Search input */
searchInput.addEventListener('input', () => {
  renderAdminProducts(searchInput.value);
});

/* Click handlers for edit/delete using event delegation */
adminProductList.addEventListener('click', function (e) {
  const del = e.target.closest('.delete-btn');
  if (del) {
    const id = del.dataset.id;
    if (confirm('Delete this product?')) {
      products = products.filter(p => p.id !== id);
      persistProducts();
      renderAdminProducts(searchInput.value);
    }
    return;
  }

  const edit = e.target.closest('.edit-btn');
  if (edit) {
    const id = edit.dataset.id;
    openEditModal(id);
    return;
  }
});

/* Open edit modal and populate fields */
function openEditModal(id) {
  currentEditId = id;
  const product = products.find(p => p.id === id);
  if (!product) return;

  editName.value = product.name || '';
  editDesc.value = product.desc || '';
  editPrice.value = product.price || 0;
  editStock.value = product.stock || 0;
  tempEditImageDataURL = product.image || null;
  if (tempEditImageDataURL) {
    editImagePreview.style.backgroundImage = `url('${tempEditImageDataURL}')`;
    editImagePreview.innerText = '';
  } else {
    editImagePreview.style.backgroundImage = '';
    editImagePreview.innerText = 'Image preview will appear here';
  }
  editModal.classList.remove('hidden');
}

/* Close edit modal */
closeEditBtn.addEventListener('click', () => {
  editModal.classList.add('hidden');
  currentEditId = null;
});

/* Edit image upload preview */
editImageUpload.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    tempEditImageDataURL = evt.target.result;
    editImagePreview.style.backgroundImage = `url('${tempEditImageDataURL}')`;
    editImagePreview.innerText = '';
  };
  reader.readAsDataURL(file);
});

/* Save edits */
editForm.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!currentEditId) return;

  const product = products.find(p => p.id === currentEditId);
  if (!product) return;

  product.name = editName.value.trim();
  product.desc = editDesc.value.trim();
  product.price = Number(editPrice.value);
  product.stock = parseInt(editStock.value, 10);
  if (tempEditImageDataURL) product.image = tempEditImageDataURL;

  persistProducts();
  editModal.classList.add('hidden');
  currentEditId = null;
  renderAdminProducts(searchInput.value);
});

/* Small helper to escape HTML in strings */
function escapeHtml(text = '') {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* Initial load & render */
document.addEventListener('DOMContentLoaded', function () {
  // storage.js initializes DB, but ensure we load from it
  loadProducts();
  renderAdminProducts();
});
//dto mo lagay code mo
