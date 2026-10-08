"use strict";

/* =====================================================
   DEALBAZAR - MAIN JAVASCRIPT
   ===================================================== */


/* =====================================================
   APP STATE
   ===================================================== */

let products = [];

let cart = loadCart();

let selectedCategory = "All";

let currentProduct = null;


/* =====================================================
   DOM ELEMENTS
   ===================================================== */

const productGrid =
  document.getElementById("productGrid");

const categoriesContainer =
  document.getElementById("categories");

const searchInput =
  document.getElementById("searchInput");

const searchButton =
  document.getElementById("searchButton");

const cartButton =
  document.getElementById("cartButton");

const cartCount =
  document.getElementById("cartCount");

const cartDrawer =
  document.getElementById("cartDrawer");

const cartItems =
  document.getElementById("cartItems");

const cartTotal =
  document.getElementById("cartTotal");

const closeCartButton =
  document.getElementById("closeCartButton");

const overlay =
  document.getElementById("overlay");

const checkoutButton =
  document.getElementById("checkoutButton");

const productModal =
  document.getElementById("productModal");

const closeModalButton =
  document.getElementById("closeModalButton");

const modalImage =
  document.getElementById("modalImage");

const modalCategory =
  document.getElementById("modalCategory");

const modalName =
  document.getElementById("modalName");

const modalRating =
  document.getElementById("modalRating");

const modalPrice =
  document.getElementById("modalPrice");

const modalOldPrice =
  document.getElementById("modalOldPrice");

const modalDescription =
  document.getElementById("modalDescription");

const modalAddButton =
  document.getElementById("modalAddButton");

const shopNowButton =
  document.getElementById("shopNowButton");

const clearFilterButton =
  document.getElementById("clearFilterButton");

const noProducts =
  document.getElementById("noProducts");


/* =====================================================
   LOAD PRODUCTS
   ===================================================== */

async function loadProducts() {

  try {

    const response =
      await fetch("products.json", {
        cache: "no-store"
      });

    if (!response.ok) {
      throw new Error(
        "Unable to load products"
      );
    }

    const data =
      await response.json();

    if (!Array.isArray(data)) {
      throw new Error(
        "Invalid product data"
      );
    }

    products = data;

    renderCategories();

    renderProducts();

    updateCartUI();

  } catch (error) {

    console.error(error);

    /*
      Temporary fallback.

      This means the app can still show
      products if products.json is not ready.
    */

    products = getFallbackProducts();

    renderCategories();

    renderProducts();

    updateCartUI();

  }

}


/* =====================================================
   FALLBACK PRODUCTS
   ===================================================== */

function getFallbackProducts() {

  return [

    {
      id: 1,
      name: "Premium Casual T-Shirt",
      category: "Fashion",
      price: 499,
      oldPrice: 999,
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
      description:
        "Comfortable premium casual T-shirt for everyday use."
    },

    {
      id: 2,
      name: "Wireless Bluetooth Earbuds",
      category: "Electronics",
      price: 899,
      oldPrice: 1999,
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=80",
      description:
        "Compact wireless earbuds with a modern charging case."
    },

    {
      id: 3,
      name: "Smart Watch",
      category: "Electronics",
      price: 1499,
      oldPrice: 2999,
      rating: 4.3,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
      description:
        "Stylish smartwatch for everyday use."
    },

    {
      id: 4,
      name: "Beauty Care Kit",
      category: "Beauty",
      price: 699,
      oldPrice: 1299,
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80",
      description:
        "A convenient beauty care collection."
    },

    {
      id: 5,
      name: "Modern Home Lamp",
      category: "Home",
      price: 799,
      oldPrice: 1499,
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80",
      description:
        "Modern decorative lamp for your home."
    },

    {
      id: 6,
      name: "Men's Sneakers",
      category: "Fashion",
      price: 1299,
      oldPrice: 2499,
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
      description:
        "Comfortable casual sneakers for everyday use."
    }

  ];

}


/* =====================================================
   CATEGORIES
   ===================================================== */

function renderCategories() {

  const categoryNames = [
    "All",
    ...new Set(
      products.map(
        product => product.category
      )
    )
  ];

  categoriesContainer.innerHTML =
    categoryNames.map(category => {

      const icon =
        getCategoryIcon(category);

      const active =
        selectedCategory === category
          ? "active"
          : "";

      return `
        <button
          class="category-card ${active}"
          type="button"
          data-category="${escapeHTML(category)}"
        >
          <span class="category-icon">
            ${icon}
          </span>

          <span class="category-name">
            ${escapeHTML(category)}
          </span>
        </button>
      `;

    }).join("");

}


/* =====================================================
   CATEGORY ICONS
   ===================================================== */

function getCategoryIcon(category) {

  const icons = {

    All: "🔥",

    Fashion: "👕",

    Electronics: "📱",

    Beauty: "💄",

    Home: "🏠",

    Sports: "⚽",

    Grocery: "🛒",

    Accessories: "⌚"

  };

  return icons[category] || "🛍️";

}


/* =====================================================
   PRODUCT RENDERING
   ===================================================== */

function renderProducts() {

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  let filtered =
    products.filter(product => {

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const searchableText =
        `${product.name} ${product.category} ${product.description || ""}`
          .toLowerCase();

      const matchesSearch =
        searchableText.includes(query);

      return (
        matchesCategory &&
        matchesSearch
      );

    });


  if (filtered.length === 0) {

    productGrid.innerHTML = "";

    noProducts.classList.remove(
      "hidden"
    );

    return;

  }


  noProducts.classList.add(
    "hidden"
  );


  productGrid.innerHTML =
    filtered.map(
      product => createProductCard(product)
    ).join("");

}


/* =====================================================
   PRODUCT CARD
   ===================================================== */

function createProductCard(product) {

  const discount =
    calculateDiscount(
      product.price,
      product.oldPrice
    );

  const rating =
    createStars(product.rating);


  return `
    <article
      class="product-card"
      data-id="${product.id}"
    >

      <div class="product-image-container">

        ${
          discount > 0
            ? `
              <span class="discount-badge">
                ${discount}% OFF
              </span>
            `
            : ""
        }

        <img
          class="product-image"
          src="${escapeAttribute(product.image)}"
          alt="${escapeAttribute(product.name)}"
          loading="lazy"
        >

      </div>


      <div class="product-content">

        <div class="product-category">
          ${escapeHTML(product.category)}
        </div>

        <h3 class="product-name">
          ${escapeHTML(product.name)}
        </h3>

        <div class="rating">
          ${rating}
          <span>
            ${Number(product.rating || 0).toFixed(1)}
          </span>
        </div>

        <div class="price-row">

          <span class="product-price">
            ₹${formatMoney(product.price)}
          </span>

          ${
            product.oldPrice
              ? `
                <span class="old-price">
                  ₹${formatMoney(product.oldPrice)}
                </span>
              `
              : ""
          }

        </div>

        ${
          discount > 0
            ? `
              <div class="discount-text">
                Save ${discount}%
              </div>
            `
            : ""
        }


        <div class="product-actions">

          <button
            class="add-cart-button"
            type="button"
            data-action="add"
            data-id="${product.id}"
          >
            Add to Cart
          </button>

          <button
            class="view-product-button"
            type="button"
            data-action="view"
            data-id="${product.id}"
            aria-label="View product"
          >
            👁️
          </button>

        </div>

      </div>

    </article>
  `;

}


/* =====================================================
   STARS
   ===================================================== */

function createStars(rating) {

  const value =
    Number(rating) || 0;

  const rounded =
    Math.round(value);

  return (
    "★".repeat(rounded) +
    "☆".repeat(5 - rounded)
  );

}


/* =====================================================
   DISCOUNT
   ===================================================== */

function calculateDiscount(
  price,
  oldPrice
) {

  const current =
    Number(price);

  const old =
    Number(oldPrice);

  if (
    !current ||
    !old ||
    old <= current
  ) {
    return 0;
  }

  return Math.round(
    ((old - current) / old) * 100
  );

}


/* =====================================================
   CART STORAGE
   ===================================================== */

function loadCart() {

  try {

    const saved =
      localStorage.getItem(
        "dealbazar_cart"
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    console.error(error);

    return [];

  }

}


function saveCart() {

  localStorage.setItem(
    "dealbazar_cart",
    JSON.stringify(cart)
  );

}


/* =====================================================
   ADD TO CART
   ===================================================== */

function addToCart(productId) {

  const product =
    products.find(
      item =>
        Number(item.id) === Number(productId)
    );

  if (!product) {
    return;
  }


  const existing =
    cart.find(
      item =>
        Number(item.id) === Number(productId)
    );


  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: Number(product.price),

      image: product.image,

      quantity: 1

    });

  }


  saveCart();

  updateCartUI();

  showNotification(
    `${product.name} added to cart`
  );

}


/* =====================================================
   REMOVE FROM CART
   ===================================================== */

function removeFromCart(productId) {

  cart =
    cart.filter(
      item =>
        Number(item.id) !== Number(productId)
    );

  saveCart();

  updateCartUI();

}


/* =====================================================
   CHANGE QUANTITY
   ===================================================== */

function changeQuantity(
  productId,
  change
) {

  const item =
    cart.find(
      product =>
        Number(product.id) === Number(productId)
    );

  if (!item) {
    return;
  }


  item.quantity += change;


  if (item.quantity <= 0) {

    removeFromCart(productId);

    return;

  }


  saveCart();

  updateCartUI();

}


/* =====================================================
   UPDATE CART UI
   ===================================================== */

function updateCartUI() {

  const totalQuantity =
    cart.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    );


  cartCount.textContent =
    totalQuantity;


  if (cart.length === 0) {

    cartItems.innerHTML = `
      <div class="empty-cart">

        <div class="empty-cart-icon">
          🛒
        </div>

        <h3>
          Your cart is empty
        </h3>

        <p>
          Add some products to get started.
        </p>

      </div>
    `;

    cartTotal.textContent = "0";

    return;

  }


  cartItems.innerHTML =
    cart.map(
      item => createCartItem(item)
    ).join("");


  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
        Number(item.quantity),
      0
    );


  cartTotal.textContent =
    formatMoney(total);

}


/* =====================================================
   CART ITEM
   ===================================================== */

function createCartItem(item) {

  return `
    <div class="cart-item">

      <img
        class="cart-item-image"
        src="${escapeAttribute(item.image)}"
        alt="${escapeAttribute(item.name)}"
      >

      <div class="cart-item-info">

        <div class="cart-item-name">
          ${escapeHTML(item.name)}
        </div>

        <div class="cart-item-price">
          ₹${formatMoney(item.price)}
        </div>

        <div class="quantity-controls">

          <button
            type="button"
            data-cart-action="decrease"
            data-id="${item.id}"
          >
            −
          </button>

          <strong>
            ${item.quantity}
          </strong>

          <button
            type="button"
            data-cart-action="increase"
            data-id="${item.id}"
          >
            +
          </button>

        </div>

        <button
          class="remove-button"
          type="button"
          data-cart-action="remove"
          data-id="${item.id}"
        >
          Remove
        </button>

      </div>

    </div>
  `;

}


/* =====================================================
   PRODUCT MODAL
   ===================================================== */

function openProduct(productId) {

  const product =
    products.find(
      item =>
        Number(item.id) === Number(productId)
    );

  if (!product) {
    return;
  }


  currentProduct =
    product;


  modalImage.src =
    product.image;

  modalImage.alt =
    product.name;

  modalCategory.textContent =
    product.category;

  modalName.textContent =
    product.name;

  modalRating.innerHTML =
    `${createStars(product.rating)} ${Number(product.rating || 0).toFixed(1)}`;

  modalPrice.textContent =
    formatMoney(product.price);

  modalOldPrice.textContent =
    formatMoney(product.oldPrice || 0);

  modalDescription.textContent =
    product.description ||
    "No description available.";


  productModal.classList.add(
    "active"
  );

  productModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";

}


/* =====================================================
   CLOSE PRODUCT MODAL
   ===================================================== */

function closeProduct() {

  productModal.classList.remove(
    "active"
  );

  productModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow =
    "";

  currentProduct = null;

}


/* =====================================================
   OPEN CART
   ===================================================== */

function openCart() {

  cartDrawer.classList.add(
    "active"
  );

  overlay.classList.add(
    "active"
  );

  cartDrawer.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";

}


/* =====================================================
   CLOSE CART
   ===================================================== */

function closeCart() {

  cartDrawer.classList.remove(
    "active"
  );

  overlay.classList.remove(
    "active"
  );

  cartDrawer.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow =
    "";

}


/* =====================================================
   CHECKOUT
   ===================================================== */

function checkout() {

  if (cart.length === 0) {

    showNotification(
      "Your cart is empty"
    );

    return;

  }


  /*
    Payment gateway will be connected
    here later.

    For now we safely show a message.
  */

  showNotification(
    "Checkout system will be connected next."
  );

}


/* =====================================================
   SEARCH
   ===================================================== */

function searchProducts() {

  renderProducts();

}


function performSearch() {

  renderProducts();

  document
    .getElementById("productsSection")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* =====================================================
   FILTER CATEGORY
   ===================================================== */

function filterCategory(category) {

  selectedCategory =
    category;

  renderCategories();

  renderProducts();

  document
    .getElementById("productsSection")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* =====================================================
   EVENT LISTENERS
   ===================================================== */


/*
  Product grid events
*/

productGrid.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-action]"
      );

    if (!button) {
      return;
    }

    const id =
      button.dataset.id;

    const action =
      button.dataset.action;


    if (action === "add") {

      addToCart(id);

    }


    if (action === "view") {

      openProduct(id);

    }

  }
);


/*
  Category events
*/

categoriesContainer.addEventListener(
  "click",
  event => {

    const categoryButton =
      event.target.closest(
        "[data-category]"
      );

    if (!categoryButton) {
      return;
    }

    filterCategory(
      categoryButton.dataset.category
    );

  }
);


/*
  Cart events
*/

cartItems.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-cart-action]"
      );

    if (!button) {
      return;
    }

    const id =
      Number(button.dataset.id);

    const action =
      button.dataset.cartAction;


    if (action === "increase") {

      changeQuantity(
        id,
        1
      );

    }


    if (action === "decrease") {

      changeQuantity(
        id,
        -1
      );

    }


    if (action === "remove") {

      removeFromCart(id);

    }

  }
);


/*
  Search
*/

searchInput.addEventListener(
  "input",
  searchProducts
);

searchButton.addEventListener(
  "click",
  performSearch
);


/*
  Enter key search
*/

searchInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      performSearch();

    }

  }
);


/*
  Cart open/close
*/

cartButton.addEventListener(
  "click",
  openCart
);

closeCartButton.addEventListener(
  "click",
  closeCart
);

overlay.addEventListener(
  "click",
  closeCart
);


/*
  Product modal
*/

closeModalButton.addEventListener(
  "click",
  closeProduct
);

productModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      productModal
    ) {

      closeProduct();

    }

  }
);


/*
  Add from product modal
*/

modalAddButton.addEventListener(
  "click",
  () => {

    if (!currentProduct) {
      return;
    }

    addToCart(
      currentProduct.id
    );

    closeProduct();

  }
);


/*
  Shop now
*/

shopNowButton.addEventListener(
  "click",
  () => {

    document
      .getElementById("productsSection")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


/*
  View all
*/

clearFilterButton.addEventListener(
  "click",
  () => {

    selectedCategory =
      "All";

    searchInput.value =
      "";

    renderCategories();

    renderProducts();

  }
);


/*
  Escape key
*/

document.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Escape") {
      return;
    }

    closeCart();

    closeProduct();

  }
);


/* =====================================================
   NOTIFICATION
   ===================================================== */

function showNotification(message) {

  const old =
    document.querySelector(
      ".dealbazar-notification"
    );

  if (old) {
    old.remove();
  }


  const notification =
    document.createElement("div");


  notification.className =
    "dealbazar-notification";


  notification.textContent =
    message;


  Object.assign(
    notification.style,
    {

      position: "fixed",

      left: "50%",

      bottom: "25px",

      transform:
        "translateX(-50%)",

      zIndex: "5000",

      background: "#171717",

      color: "#fff",

      padding: "12px 18px",

      borderRadius: "8px",

      fontSize: "14px",

      fontWeight: "600",

      boxShadow:
        "0 5px 20px rgba(0,0,0,.2)",

      maxWidth: "90%",

      textAlign: "center"

    }
  );


  document.body.appendChild(
    notification
  );


  setTimeout(
    () => {

      notification.remove();

    },
    2200
  );

}


/* =====================================================
   FORMAT MONEY
   ===================================================== */

function formatMoney(value) {

  const number =
    Number(value) || 0;

  return number.toLocaleString(
    "en-IN"
  );

}


/* =====================================================
   SECURITY HELPERS
   ===================================================== */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


/* =====================================================
   START APP
   ===================================================== */

loadProducts();
