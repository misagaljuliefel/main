/* admin.js
   Handles admin page: render list, search, add product, edit/delete via modals,
   and image upload (file input -> Data URL).
*/

/* Utility: generate simple id */
function generateId(prefix = 'p') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/* --- DOM references --- */
const adminProductList = document.getElementById('adminProductList');
const addProductForm = document.getElementById('addProductForm');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const adminSearch = document.getElementById('adminSearch');
const goToPOS = document.getElementById('goToPOS');

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

/* Delete modal elements */
const deleteModal = document.getElementById('deleteModal');
const deleteProductName = document.getElementById('deleteProductName');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let products = []; // local copy
let currentEditId = null;
let tempImageDataURL = null; // for add form
let tempEditImageDataURL = null; // for edit form
let deleteCandidateId = null;

/* Load products from storage into local 'products' then render */
function loadProducts() {
  products = getAllProducts().map(p => {
    // ensure fields exist with expected names
    return {
      id: p.id || generateId(),
      productName: p.productName || p.name || 'Unnamed',
      productDetail: p.productDetail || p.desc || '',
      productPrice: Number(p.productPrice || p.price || 0),
      stock: Number(p.stock || p.stockQuantity || 0),
      productImage: p.productImage || p.image || ''
    };
  });
}

/* Save products to storage (normalize key names back to your team's schema) */
function persistProducts() {
  // save with the product keys that match your products.json structure
  const normalized = products.map(p => ({
    id: p.id,
    productName: p.productName,
    productDetail: p.productDetail,
    productPrice: p.productPrice,
    stockQuantity: p.stock,
    productImage: p.productImage
  }));
  saveAllProducts(normalized);
}

/* Render product list in admin page with optional search filter */
function renderAdminProducts(filter = '') {
  loadProducts();
  const q = filter.trim().toLowerCase();
  adminProductList.innerHTML = '';

  if (!products.length) {
    adminProductList.innerHTML = '<div class="empty">No products yet. Add one on the right.</div>';
    return;
  }

  products
    .filter(p => (q ? p.productName.toLowerCase().includes(q) : true))
    .forEach(p => {
      const item = document.createElement('div');
      item.className = 'admin-product';
      item.innerHTML = `
        <img class="thumb" src="${p.productImage || ''}" alt="${escapeHtml(p.productName)}" />
        <div class="info">
          <div class="title">${escapeHtml(p.productName)}</div>
          <div class="meta">Price: ₱ ${Number(p.productPrice).toFixed(2)}</div>
          <div class="meta">Stock: ${p.stock} unit${p.stock !== 1 ? 's' : ''}</div>
          <div class="desc">${escapeHtml(p.productDetail || '')}</div>
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
    productName: name,
    productDetail: desc,
    productPrice: Number(price),
    stock: parseInt(stock, 10),
    productImage: tempImageDataURL || '' // data URL from preview (or empty)
  };

  // load existing, push new, persist
  loadProducts();
  products.push(newProduct);
  persistProducts();

  // refresh view and reset form
  renderAdminProducts(adminSearch.value);
  addProductForm.reset();
  imagePreview.innerText = 'Image preview will appear here';
  imagePreview.style.backgroundImage = '';
  tempImageDataURL = null;
});

/* Image preview for add form (file -> data URL) */
imageUpload.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    tempImageDataURL = evt.target.result; // store data URL (base64)
    imagePreview.style.backgroundImage = `url('${tempImageDataURL}')`;
    imagePreview.innerText = '';
  };
  reader.readAsDataURL(file);
});

/* Search input */
adminSearch.addEventListener('input', () => {
  renderAdminProducts(adminSearch.value);
});

/* Click handlers for edit/delete using event delegation */
adminProductList.addEventListener('click', function (e) {
  const del = e.target.closest('.delete-btn');
  if (del) {
    const id = del.dataset.id;
    openDeleteModal(id);
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
  loadProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  editName.value = product.productName || '';
  editDesc.value = product.productDetail || '';
  editPrice.value = product.productPrice || 0;
  editStock.value = product.stock || 0;
  tempEditImageDataURL = product.productImage || null;
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

/* Edit image upload preview (file -> data URL) */
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

  loadProducts();
  const product = products.find(p => p.id === currentEditId);
  if (!product) return;

  product.productName = editName.value.trim();
  product.productDetail = editDesc.value.trim();
  product.productPrice = Number(editPrice.value);
  product.stock = parseInt(editStock.value, 10);
  if (tempEditImageDataURL) product.productImage = tempEditImageDataURL;

  persistProducts();
  editModal.classList.add('hidden');
  currentEditId = null;
  renderAdminProducts(adminSearch.value);
});

/* --- Delete confirmation modal --- */
function openDeleteModal(id) {
  loadProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;
  deleteCandidateId = id;
  deleteProductName.textContent = product.productName;
  deleteModal.classList.remove('hidden');
}
cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.classList.add('hidden');
  deleteCandidateId = null;
});
confirmDeleteBtn.addEventListener('click', () => {
  if (!deleteCandidateId) return;
  loadProducts();
  products = products.filter(p => p.id !== deleteCandidateId);
  persistProducts();
  deleteModal.classList.add('hidden');
  deleteCandidateId = null;
  renderAdminProducts(adminSearch.value);
});

/* Small helper to escape HTML in strings */
function escapeHtml(text = '') {
  return text
    .toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* Go to POS page (index.html) */
goToPOS.addEventListener('click', () => {
  window.location.href = 'index.html';
});

/* Initial load & render */
document.addEventListener('DOMContentLoaded', function () {
  loadProducts();
  renderAdminProducts();
});
