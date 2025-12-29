import client from "./app.js";




const productDetail = document.getElementById("productDetail")
const params = new URLSearchParams(window.location.search)
const productId = params.get("id")
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
<div class="card bg-white w-full sm:w-[350px] border border-gray-200 rounded-2xl shadow-md p-4">
    <img class="w-full h-48 object-cover rounded-t-2xl" src="${data.image}" alt="${data.name}" />
    <div class="text-center mt-3">
        <h2 class="text-xl font-semibold">${data.name}</h2>
        <p class="text-gray-500">${data.description}</p>
        <p class="text-gray-500">${data.category}</p>
        <p class="text-gray-500">${data.brand}</p>
        <p class="font-semibold text-lg mt-2">Rs: ${data.price}</p>
 <!-- colors -->
        <div class="flex justify-center gap-2 mt-3">
            ${colorHTML}
        </div>
 
        <button type="button" class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br shadow-lg shadow-blue-500/50 font-medium rounded-xl text-sm px-6 py-2.5 mt-3">Add to Cart</button>
    </div>
</div>  
`;


    }
}

getSingleProduct()




