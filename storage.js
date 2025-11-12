/* storage.js
   Responsible for initializing product DB (from products.json),
   and exposing simple storage helper functions used by admin.js & pos.js.

   Author: Misagal
*/

/* initializeDatabase()
   If localStorage doesn't have "myProductItems", fetch products.json
   and save into localStorage. Otherwise do nothing.
*/
function initializeDatabase() {
    let getProductFromLocal = localStorage.getItem("myProductItems");
    if (getProductFromLocal === null) {
        fetch("products.json") //GETTER (fetch package from DB)
        // READ AND OPEN
        .then(function (package) {
            return package.json();
        })
        // USE DATA, SAVE IT TO LOCAL STORAGE
        .then(function (itemsInPackage) {
            let stringedProduct = JSON.stringify(itemsInPackage);
            localStorage.setItem("myProductItems", stringedProduct);
            console.log("Database created in Local Storage!");
            ensureIds(); // <--- safer than timeout
        })

        .catch(function (error) {
            console.log("Error found: " + error);
        });
    } else {
        console.log("Database already exists in Local Storage!");
    }
}

/* getAllProducts()
   Return array of product objects from localStorage (or empty array).
   This is the main getter used throughout the app.
*/
function getAllProducts() {
    let raw = localStorage.getItem("myProductItems");
    try {
        let arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

/* getProductById(id)
   Return single product (object) found by id field (if exists), else null.
   Note: Some older product sets may not have 'id' — we handle both cases
   by matching on productName if id missing.
*/
function getProductById(id) {
    const arr = getAllProducts();
    if (!id) return null;
    return arr.find(p => p.id === id) || arr.find(p => p.productName === id) || null;
}

/* saveAllProducts(newArray)
   Save entire product array back to localStorage.
*/
function saveAllProducts(newArray) {
    let newStringedProducts = JSON.stringify(newArray);
    localStorage.setItem("myProductItems", newStringedProducts);
    console.log("Products saved in Local Storage!");
}

/* ensure every product has an 'id' field (useful for edit/delete)
   This runs once after DB initialization to normalize older product entries.
*/
function ensureIds() {
    const arr = getAllProducts();
    let changed = false;
    for (let p of arr) {
        if (!p.id) {
            // generate a simple id based on current time + random - predictable enough
            p.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
            changed = true;
        }
        // normalize stock field name - some products may use different keys
        if (p.stock === undefined && p.stockQuantity !== undefined) {
            p.stock = Number(p.stockQuantity); // copy / convert
            changed = true;
        } else if (p.stock === undefined) {
            // if no stock info, give default
            p.stock = p.stock || 0;
            changed = true;
        }
    }
    if (changed) saveAllProducts(arr);
}

/* Run initialization and normalization when the script loads */
initializeDatabase();
/* Delay ensureIds slightly so fetch can finish on first-run.
   If DB already existed, ensureIds runs immediately.
*/
setTimeout(ensureIds, 300);
