import client from "./app.js";

const productDetail = document.getElementById("productDetail")
const params = new URLSearchParams(window.location.search)
const productId = params.get("id")
let currentProduct = null
console.log(productId);


async function getSingleProduct() {
  const { data, error } = await client
    .from("product_detail")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    console.log(error);
  } else {
    currentProduct = data
    productDetail.innerHTML = ""
    console.log(data);

    let colorHTML = "";

    data.color.forEach(color => {
      colorHTML += `
    <span
      title="${color}" class="w-6 h-6 md:w-9 md:h-9 lg:w-11 lg:h-11 "
      style="
        display:inline-block;
        
        border-radius:50%;
        background-color:${color};
        border:1px solid #d1d5db;
      ">
    </span>
  `;
    });

    productDetail.innerHTML = `
 <div class=" mx-auto p-10 bg-white">

    <!-- Product Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- Left: Images -->
      <div>
        <img
          src="${data.image}"
          class="w-full h-[450px] object-cover shadow border border-gray-300 rounded-xl"
        />

      </div>

      <!-- Right: Details -->
      <div class="mt-10">
        <h1 class="text-2xl md:text-3xl lg:text-5xl  font-bold text-gray-800">
       ${data.name.toUpperCase()}
        </h1>

        <p class="text-lg text-gray-500 mt-2">
        High quality product with premium materials
       </p>


        <!-- Rating -->
        <div class="flex items-center gap-2 mt-2">
          <span class="text-yellow-400 text-xl">★★★★☆</span>
          <span class="text-lg text-gray-500">(120 Reviews)</span>
        </div>

        <!-- Price -->
        <div class="mt-3 ">
          <span class="text-4xl font-bold text-green-600 ">Rs. ${data.price}</span>
          <del class="text-xl font-bold text-gray-400 mx-4">Rs. ${data.rendomprice}</del>
          
        </div>

        <p class="text-lg text-gray-500 mt-3">
        Inclusive of all taxes
       </p>


       <p class="text-lg text-gray-500 mt-3">
       <span class="font-semibold text-gray-700">Brand:</span> ${data.brand}
       </p>

       <p class="text-lg text-gray-500 mt-1">
        <span class="font-semibold text-gray-700">Category:</span> ${data.category}
       </p>

        <!-- Colors -->
        <div class="mt-4">
       <p class="font-semibold text-2xl mb-4 text-gray-700">
          Available Colors
        </p>

          <div class="flex gap-2">
           ${colorHTML}
          </div>
        </div>
        
        <!-- Buttons -->
       <div class="flex flex-col md:flex-row gap-4 mt-10">

       <button id="cartBtn" type="button" class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br shadow-lg shadow-blue-500/50 font-medium rounded-xl text-lg px-20 py-4">Add to Cart</button>
       <button type="button" class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br font-medium rounded-xl text-lg px-20 py-4 ">Buy Now</button>
        </div>

      </div>
    </div>

    <!-- Description -->
    <div class="mt-5">
      <h2 class="text-4xl font-bold mb-3">Product Description</h2>
      <p class="text-gray-600 text-xl leading-relaxed">
      ${data.description}
      </p>
    </div>

  </div>
     
    </div>
</div>  
`;

    const cartBtn = document.getElementById("cartBtn")

    cartBtn.addEventListener("click", () => {
      addToCart()
    })

  }
}

getSingleProduct()


let cart = JSON.parse(localStorage.getItem("cart")) || []

const cartDrawer = document.getElementById("cartDrawer")
const cartItems = document.getElementById("cartItems")
const closeDrawer = document.getElementById("closeDrawer")


function openDrawer() {
  cartDrawer.classList.remove("translate-x-full")
}

function closeDrawerFunc() {
  cartDrawer.classList.add("translate-x-full")
}

closeDrawer.addEventListener("click", closeDrawerFunc)


// =====Add to cart=======
async function addToCart() {

  const { data: { user }, error } = await client.auth.getUser()
  if (!user) {
    Swal.fire({
      title: 'Oops!',
      text: 'Please login first!',
      icon: 'warning',
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Login Now'
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }


  // Check if product already in cart
  const existingItem = cart.find(item => item.id === currentProduct.id);

  if (existingItem) {
    existingItem.quantity += 1; // quantity increase
  } else {
    cart.push({ ...currentProduct, quantity: 1 }); // add new product with quantity 1
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  openDrawer();
}

const cartIcon = document.getElementById("cartIcon")

cartIcon.addEventListener("click", (e) => {
  e.preventDefault()
  openDrawer()
})

const mobileCartIcon = document.getElementById("mobileCartIcon")

mobileCartIcon.addEventListener("click", (e) => {
  e.preventDefault()
  openDrawer()
})



function renderCart() {
  cartItems.innerHTML = "";

  // ======EMPTY CART =======

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="text-2xl font-bold text-center text-gray-500 mt-5 font-payfair">YOUR CART IS EMPTY...!</p>`;
    return;
  }


  // Cart items container (scrollable)
  const container = document.createElement("div");
  container.className = " overflow-y-auto space-y-3";

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "flex gap-3 border-b pb-3";

    div.innerHTML = `
     <img src="${item.image}" class="w-16 h-16 rounded object-cover">

<div class="flex-1">
  <!-- name + price same row -->
  <div class="flex justify-between items-center">
    <p class="font-semibold text-md truncate">
      ${item.name}
    </p>
    <p class="text-md text-gray-500 whitespace-nowrap">
      Rs. ${item.price * item.quantity}
    </p>
  </div>

  <!-- increment / decrement niche -->
  <div class="flex items-center gap-2 mt-2">
    <button type="button"
      class="decrease text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 font-bold rounded-full w-7 h-7 flex items-center justify-center">
      <i class="fa-solid fa-minus"></i>
    </button>

    <span class="text-lg font-bold">${item.quantity}</span>

    <button type="button"
      class="increase text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 font-bold rounded-full w-7 h-7 flex items-center justify-center">
      <i class="fa-solid fa-plus"></i>
    </button>
  </div>
</div>

    `;

    container.appendChild(div);

    // Event listeners for +/- buttons
    div.querySelector(".increase").addEventListener("click", () => increaseQty(item.id));
    div.querySelector(".decrease").addEventListener("click", () => decreaseQty(item.id));
  });

  cartItems.appendChild(container);

  // ===== Total + Checkout =====
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const totalDiv = document.createElement("div");
  totalDiv.className = "mt-4 pt-3";

  totalDiv.innerHTML = `
    <div class="text-right text-3xl"><span class="text-green-700 font-medium">Total: </span><span class="text-gray-500">${total}/-</span></div>
    <button id="checkoutBtn" class="text-white mt-5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br shadow-lg shadow-blue-500/50 font-medium rounded-xl text-lg w-full py-4">Proceed to Checkout</button>
  `;

  cartItems.appendChild(totalDiv);

  // Checkout click handler
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    window.location.href = "checkout.html";
  });
}

window.increaseQty = function (id) {
  const item = cart.find(i => i.id === id);
  if (item) item.quantity += 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

window.decreaseQty = function (id) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});


const checkoutprocess = document.getElementById("checkoutprocess")

renderCart(checkoutprocess)

