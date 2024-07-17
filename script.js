let currentProducts = [];
let filteredProducts = [];

async function fetchCategories() {
    try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function populateCategoryOptions() {
    const categories = await fetchCategories();
    const categorySelect = document.getElementById('category-select');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
}

function filterProducts(products, searchQuery, category, minPrice, maxPrice) {
    return products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = category ? product.category === category : true;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
    });
}


const cart = [];

function addToCart(productId) {
    const product = currentProducts.find(p => p.id === productId);
    cart.push(product);
    updateCart();
}

function updateCart() {
    const cartContainer = document.getElementById('cart');
    cartContainer.innerHTML = '';

    cart.forEach(product => {
        cartContainer.innerHTML += `
            <div class="cart-item">
                <span>${product.title} - $${product.price}</span>
                <button onclick="removeFromCart(${product.id})">Remove</button>
            </div>
        `;
    });

    const totalPrice = cart.reduce((total, product) => total + product.price, 0);
    document.getElementById('total-price').innerText = `Total Price: $${totalPrice.toFixed(2)}`;
}

function removeFromCart(productId) {
    const productIndex = cart.findIndex(p => p.id === productId);
    if (productIndex > -1) {
        cart.splice(productIndex, 1);
        updateCart();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await populateCategoryOptions();
    currentProducts = await fetchProducts();
    filteredProducts = currentProducts;  // Initialize filteredProducts with all products
    displayProducts(filteredProducts);
});

document.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    const searchQuery = document.getElementById('search-input').value;
    const category = document.getElementById('category-select').value;
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;

    filteredProducts = filterProducts(currentProducts, searchQuery, category, minPrice, maxPrice);
    displayProducts(filteredProducts);
});

function displayProducts(products, page = 1) {
    const itemsPerPage = 4;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = products.slice(start, end);

    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '';

    paginatedProducts.forEach(product => {
        productContainer.innerHTML += `
            <div class="product">
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>$${product.price}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
    });

    displayPagination(products.length, itemsPerPage, page);
}

function displayPagination(totalItems, itemsPerPage, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.innerHTML += `
            <button onclick="displayProducts(filteredProducts, ${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>
        `;
    }
}