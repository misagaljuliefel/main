/* admin.js */

function generateId(prefix='p'){ return prefix + Math.random().toString(36).slice(2,9); }

const adminProductList = document.getElementById('adminProductList');
const addProductForm = document.getElementById('addProductForm');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const adminSearch = document.getElementById('adminSearch');
const goToPOS = document.getElementById('goToPOS');

const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeEditBtn = document.getElementById('closeEditBtn');
const editName = document.getElementById('editName');
const editDesc = document.getElementById('editDesc');
const editPrice = document.getElementById('editPrice');
const editStock = document.getElementById('editStock');
const editImageUpload = document.getElementById('editImageUpload');
const editImagePreview = document.getElementById('editImagePreview');

const deleteModal = document.getElementById('deleteModal');
const deleteProductName = document.getElementById('deleteProductName');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let products = [], currentEditId=null, tempImageDataURL=null, tempEditImageDataURL=null, deleteCandidateId=null;

function loadProducts(){
  products = getAllProducts().map(p=>({
    id: p.id || generateId(),
    productName: p.productName || p.name || 'Unnamed',
    productDetail: p.productDetail || p.desc || '',
    productPrice: Number(p.productPrice || p.price || 0),
    stock: Number(p.stock || p.stockQuantity || 0),
    productImage: p.productImage || p.image || ''
  }));
}

function persistProducts(){
  const normalized = products.map(p=>({
    id: p.id,
    productName: p.productName,
    productDetail: p.productDetail,
    productPrice: p.productPrice,
    stockQuantity: p.stock,
    productImage: p.productImage
  }));
  saveAllProducts(normalized);
}

function renderAdminProducts(filter=''){
  loadProducts();
  const q = filter.trim().toLowerCase();
  adminProductList.innerHTML = '';
  const filtered = products.filter(p => p.productName.toLowerCase().includes(q));
  if(!filtered.length) { adminProductList.innerHTML='<div class="empty">No products yet.</div>'; return; }

  filtered.forEach(p=>{
    const item = document.createElement('div');
    item.className='admin-product';
    item.innerHTML = `
      <img class="thumb" src="${p.productImage||''}" alt="${escapeHtml(p.productName)}"/>
      <div class="info">
        <div class="title">${escapeHtml(p.productName)}</div>
        <div class="meta">Price: ₱${Number(p.productPrice).toFixed(2)}</div>
        <div class="meta">Stock: ${p.stock} unit${p.stock!==1?'s':''}</div>
        <div class="desc">${escapeHtml(p.productDetail||'')}</div>
      </div>
      <div class="actions">
        <button class="edit-btn" data-id="${p.id}">Edit</button>
        <button class="delete-btn" data-id="${p.id}">Delete</button>
      </div>
    `;
    adminProductList.appendChild(item);
  });
}

addProductForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name=document.getElementById('productName').value.trim();
  const desc=document.getElementById('productDesc').value.trim();
  const price=Number(document.getElementById('productPrice').value);
  const stock=Number(document.getElementById('productStock').value);
  if(!name || isNaN(price)||isNaN(stock)){alert('Please fill fields correctly.'); return;}

  products.push({id:generateId(), productName:name, productDetail:desc, productPrice:price, stock:stock, productImage:tempImageDataURL||''});
  persistProducts();
  renderAdminProducts(adminSearch.value);
  addProductForm.reset();
  imagePreview.innerText='Image preview will appear here';
  imagePreview.style.backgroundImage='';
  tempImageDataURL=null;
});

imageUpload.addEventListener('change', e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=evt=>{ tempImageDataURL=evt.target.result; imagePreview.style.backgroundImage=`url('${tempImageDataURL}')`; imagePreview.innerText=''; };
  reader.readAsDataURL(file);
});

adminSearch.addEventListener('input', ()=>renderAdminProducts(adminSearch.value));

adminProductList.addEventListener('click', e=>{
  const del=e.target.closest('.delete-btn');
  if(del){ openDeleteModal(del.dataset.id); return; }
  const edit=e.target.closest('.edit-btn');
  if(edit){ openEditModal(edit.dataset.id); return; }
});

function openEditModal(id){
  currentEditId=id; loadProducts();
  const p=products.find(x=>x.id===id); if(!p) return;
  editName.value=p.productName; editDesc.value=p.productDetail; editPrice.value=p.productPrice; editStock.value=p.stock;
  tempEditImageDataURL=p.productImage||null;
  if(tempEditImageDataURL){ editImagePreview.style.backgroundImage=`url('${tempEditImageDataURL}')`; editImagePreview.innerText=''; }
  else{ editImagePreview.style.backgroundImage=''; editImagePreview.innerText='Image preview will appear here'; }
  editModal.classList.remove('hidden');
}

closeEditBtn.addEventListener('click', ()=>{ editModal.classList.add('hidden'); currentEditId=null; });

editImageUpload.addEventListener('change', e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=evt=>{ tempEditImageDataURL=evt.target.result; editImagePreview.style.backgroundImage=`url('${tempEditImageDataURL}')`; editImagePreview.innerText=''; };
  reader.readAsDataURL(file);
});

editForm.addEventListener('submit', e=>{
  e.preventDefault();
  if(!currentEditId) return; loadProducts();
  const p=products.find(x=>x.id===currentEditId); if(!p) return;
  p.productName=editName.value.trim();
  p.productDetail=editDesc.value.trim();
  p.productPrice=Number(editPrice.value);
  p.stock=parseInt(editStock.value,10);
  if(tempEditImageDataURL) p.productImage=tempEditImageDataURL;
  persistProducts();
  editModal.classList.add('hidden');
  currentEditId=null;
  renderAdminProducts(adminSearch.value);
});

function openDeleteModal(id){
  loadProducts();
  const p=products.find(x=>x.id===id); if(!p) return;
  deleteCandidateId=id;
  deleteProductName.textContent=p.productName;
  deleteModal.classList.remove('hidden');
}
cancelDeleteBtn.addEventListener('click', ()=>{ deleteModal.classList.add('hidden'); deleteCandidateId=null; });
confirmDeleteBtn.addEventListener('click', ()=>{
  if(!deleteCandidateId) return;
  loadProducts(); products=products.filter(x=>x.id!==deleteCandidateId);
  persistProducts(); deleteModal.classList.add('hidden'); deleteCandidateId=null;
  renderAdminProducts(adminSearch.value);
});

function escapeHtml(text=''){ return text.toString().replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;"); }

goToPOS.addEventListener('click', ()=>{ window.location.href='index.html'; });

document.addEventListener('DOMContentLoaded', ()=>{ loadProducts(); renderAdminProducts(); });
