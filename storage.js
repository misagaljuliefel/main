function initializeDatabase() {
    let getProductFromLocal = localStorage.getItem("myProductItems");
    if (getProductFromLocal === null) {
        fetch("products.json") //GETTER(fetch package from DB) AND GIVER(response)
        
        // READ AND OPEN
        .then(function(package){
            return package.json();
        })
        // USE DATA, SAVE IT TO LOCAL STORAGE
        .then(function(itemsInPackage){
            let stringedProduct = JSON.stringify(itemsInPackage);
            localStorage.setItem("myProductItems", stringedProduct);
            console.log("Database created in Local Storage!");

        })
        .catch(function(error){
            console.log("Error found: " + error);
        });
    }else{
        console.log("Database already exists in Local Storage!");
    }
}
/* get products from local storage and return as an array of objects */
function getArrayedProducts() {
    let rawStringedProducts = localStorage.getItem("myProductItems");
    let convertedProductArray = JSON.parse(rawStringedProducts);
    return convertedProductArray;
}
function saveAllProducts(newArray) {
    let newStringedProducts = JSON.stringify(newArray);
    localStorage.setItem("myProductItems", newStringedProducts);
    console.log("Products added in Local Storage!");
}
initializeDatabase();