import client from "./app.js";




const productDetail = document.getElementById("productDetail")
const params = new URLSearchParams(window.location.search)
const productId = params.get("id")
let currentProduct = null
console.log(productId);

if (!productId) {
    alert("Product not found");
}

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
      title="${color}"
      style="
        display:inline-block;
        width:22px;
        height:22px;
        border-radius:50%;
        background-color:${color};
        border:1px solid #d1d5db;
      ">
    </span>
  `;
        });



        productDetail.innerHTML = `
 <div class="max-w-6xl mx-auto my-5 p-4 md:p-8 bg-white mt-6 rounded-3xl shadow">

    <!-- Product Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- Left: Images -->
      <div>
        <img
          src="${data.image}"
          class="w-full h-[350px] object-cover shadow border border-gray-300 rounded-xl"
        />

      </div>

      <!-- Right: Details -->
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
       ${data.name.toUpperCase()}
        </h1>

        <p class="text-sm text-gray-500 mt-1">
  High quality product with premium materials
</p>


        <!-- Rating -->
        <div class="flex items-center gap-2 mt-2">
          <span class="text-yellow-400 text-lg">★★★★☆</span>
          <span class="text-sm text-gray-500">(120 Reviews)</span>
        </div>

        <!-- Price -->
        <div class="">
          <span class="text-3xl font-bold text-green-600">Rs. ${data.price}</span>
          
        </div>

        <p class="text-sm text-gray-500 mt-1">
  Inclusive of all taxes
</p>


      <p class="text-sm text-gray-500 mt-3">
  <span class="font-semibold text-gray-700">Brand:</span> ${data.brand}
</p>

<p class="text-sm text-gray-500 mt-1">
  <span class="font-semibold text-gray-700">Category:</span> ${data.category}
</p>

        <!-- Colors -->
        <div class="mt-4">
     <p class="font-semibold mb-2 text-gray-700">
  Available Colors
</p>

          <div class="flex gap-1">
           ${colorHTML}
          </div>
        </div>
        
        <!-- Buttons -->
    <div class="flex flex-col md:flex-row gap-4 mt-6">

       <button id="cartBtn" type="button" class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br shadow-lg shadow-blue-500/50 font-medium rounded-xl text-lg px-20 py-4">Add to Cart</button>
       <button type="button" class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br font-medium rounded-xl text-lg px-20 py-4 ">Buy Now</button>
        </div>

      </div>
    </div>

    <!-- Description -->
    <div class="mt-5">
      <h2 class="text-xl font-bold mb-3">Product Description</h2>
      <p class="text-gray-600 leading-relaxed">
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
function addToCart() {
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


function renderCart() {
    cartItems.innerHTML = "";

    // Cart items container (scrollable)
    const container = document.createElement("div");
    container.className = " overflow-y-auto space-y-3";

    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "flex gap-3 border-b pb-3";

        div.innerHTML = `
      <img src="${item.image}" class="w-16 h-16 rounded object-cover">
      <div class="flex-1">
        <p class="font-semibold">${item.name}</p>
        <p class="text-sm text-gray-500">Rs. ${item.price * item.quantity}</p>
        <div class="flex items-center gap-2 mt-1">
         <button type="button" class="decrease text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br font-bold rounded-full w-7 h-7 text-center text-md"><i class="fa-solid fa-minus"></i></button>
          <span class="text-lg font-bold">${item.quantity}</span>
            <button type="button" class="increase text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br font-bold rounded-full w-7 h-7 text-center text-md"><i class="fa-solid fa-plus"></i></button>
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
    <div class="text-right text-xl"><span class="text-green-700 font-medium">Total: </span><span class="italic text-gray-500">${total}/-</span></div>
    <button id="checkoutBtn" class="text-white mt-5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br shadow-lg shadow-blue-500/50 font-medium rounded-xl text-lg w-full py-4">Proceed to Checkout</button>
  `;

    cartItems.appendChild(totalDiv);

    // Checkout click handler
    document.getElementById("checkoutBtn").addEventListener("click", () => {
        alert("Proceeding to checkout!");
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
