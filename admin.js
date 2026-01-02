import client from "./app.js";

const { data: { user }, error } = await client.auth.getUser();

if (!user) {
  window.location.href = "signup.html";
}

const { data, error: adminErr } = await client
  .from("all-users-data")
  .select("*")
  .eq("user_id", user.id)
  .single();

console.log(data);

if (data.role != "admin") {
  alert("access denied");
  window.location.href = "./login.html";
} else {
  console.log(adminErr);

}


// ======== add color ========
const color = document.getElementById("color")
const addmore = document.getElementById("addmore")
const colorBtn = document.getElementById("colorBtn")


colorBtn && colorBtn.addEventListener("click", (e) => {

  e.preventDefault()
  const selectedColor = color.value
  const wrapper = document.createElement("div")

  wrapper.className = "flex flex-col items-center gap-1 cursor-pointer"

  const newcolor = document.createElement("div")
  newcolor.className = `
        w-7 h-7 rounded-full 
        border border-gray-300 
        shadow-sm
    `
  newcolor.style.backgroundColor = selectedColor
  console.log(selectedColor);

  allColor.push(selectedColor)

  console.log(allColor);

  wrapper.appendChild(newcolor)
  addmore.appendChild(wrapper)

})



// ========= Add product in supabase table=======

const addProductBtn = document.getElementById("addProductBtn")
const productName = document.getElementById("productName")
const brand = document.getElementById("brand")
const randomprice = document.getElementById("randomprice")
const finalprice = document.getElementById("finalprice")
const category = document.getElementById("category")
const productImg = document.getElementById("productImg")
const description = document.getElementById("description")
let allColor = []

addProductBtn && addProductBtn.addEventListener("click", async () => {

  if (
    productName.value.trim() === "" ||
    brand.value.trim() === "" ||
    randomprice.value.trim() === "" ||
    finalprice.value.trim() === "" ||
    category.value.trim() === "" ||
    !productImg.files.length ||
    description.value.trim() === "" ||
    allColor.length === 0
  ) {
    alert("Please fill all fields")
    return
  } else {

    let file = productImg.files[0]


    const { data, error: storageError } = await client
      .storage
      .from('Product_image')
      .upload(file.name, file,
        { upsert: true })

    if (storageError) {
      console.log(storageError);
    } else {
      console.log("uploaded img on storage", data);
      const { data: publicData } = client
        .storage
        .from('Product_image')
        .getPublicUrl(file.name)
      if (publicData) {
        console.log(publicData.publicUrl);
        window.productUrl = publicData.publicUrl
      }
    }

    const { error } = await client
      .from('product_detail')
      .insert({ name: productName.value, brand: brand.value, rendomprice: randomprice.value, price: finalprice.value, category: category.value, color: allColor, description: description.value, image: productUrl })

    if (error) {
      console.log(error, "inserted error");
    } else {
      alert("successfully added!")
    }
  }


})

// ======fetch product on admin side========

let products = []
const showproductadmin = document.getElementById("showproductadmin")



async function showProd() {
  const { data, error } = await client
    .from("product_detail")
    .select("*")

  if (error) {
    console.log(error, "fetching error")
    return
  }

  products = data
  renderProducts()
}


showProd()



function renderProducts() {
  showproductadmin.innerHTML = ""

  products.forEach(prod => {

    let colorHTML = ""

    if (Array.isArray(prod.color)) {
      prod.color.forEach(clr => {
        colorHTML += `
          <span 
            title="${clr}"
            class="w-6 h-6 rounded-full border border-gray-300"
            style="background-color:${clr}"
          ></span>
        `
      })
    }

    showproductadmin.innerHTML += `
      <div 
        class="group bg-white rounded-2xl border border-gray-200 
        shadow-sm hover:shadow-xl transition-all duration-300 
        hover:-translate-y-1 overflow-hidden"
      >

        <div class="relative overflow-hidden">
          <img
            src="${prod.image}"
            class="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div class="p-4 text-center space-y-2">

          <p class="text-sm text-gray-500 line-clamp-2">
            ${prod.description}
          </p>

           <div>
          <span class="text-xl font-semibold text-green-600 ">Rs. ${prod.price}</span>
          <del class="text-md font-bold text-gray-400 mx-2">Rs. ${prod.rendomprice}</del>
        </div>

          <div class="flex justify-center gap-2 mt-2">
            ${colorHTML}
          </div>

          <button
            onclick="EditCard(${prod.id},
            '${prod.name}',
            '${prod.brand}',
            '${prod.category}',
             '${prod.price}',
             '${prod.rendomprice}',
               '${prod.description}',
                '${prod.image}',
                '${prod.color}')"
            class="mt-4 w-full rounded-lg bg-gradient-to-r 
            from-blue-500 via-blue-600 to-blue-700 
            text-white py-2 font-bold tracking-wider
            hover:from-blue-600 hover:to-blue-800 transition"
          >
            Edit <i class="fa-solid fa-pen-to-square ml-2"></i>
          </button>

          <button
            onclick="dltCard(${prod.id})"
            class="w-full rounded-lg bg-gradient-to-r 
            from-red-400 via-red-500 to-red-600 
            text-white py-2 font-bold tracking-wider
            hover:from-red-500 hover:to-red-700 transition"
          >
            Delete <i class="fa-regular fa-trash-can ml-2"></i>
          </button>

        </div>
      </div>
    `
  })
}

// ======Delete card ===========

window.dltCard = async function (id) {
  const confirmDel = confirm("Are you sure you want to delete?")
  if (!confirmDel) return

  const { error } = await client
    .from("product_detail")
    .delete()
    .eq("id", id)

  if (!error) {
    // ✅ update UI without reload
    products = products.filter(p => p.id !== id)
    renderProducts()
    alert("Deleted successfully!")
  }
}

// ====EDIT CARD========

const updateProduct = document.getElementById("updateProduct")

// window.EditCard = async function (id, name, price, category, image, brand, description , color) {
//     console.log("edit id:", id)
//     console.log(name)
//     console.log(price)
//     console.log(category)
//     console.log(image)
//     console.log(description)
//     console.log(brand)
//     console.log(color)

//     const { value: formValues } = await Swal.fire({
//   title: "Update Product",
//   html: `NAME:
//     <input id="swal-input1" class="swal2-input">
//     Brand:
//     <input id="swal-input2" class="swal2-input">
//     Category:
//     <input id="swal-input3" class="swal2-input">
//    Rand Price:
//     <input id="swal-input4" class="swal2-input">
//     Final Price:
//     <input id="swal-input5" class="swal2-input">
//      Description:
//     <input id="swal-input6" class="swal2-input">
//      Image:
//     <input type="file" id="swal-input7" class="swal2-input">
//      Color:
//     <input type="color" id="swal-input8" class="swal2-input">
//   `,
//   focusConfirm: false,
//   preConfirm: () => {
//     return [
//       document.getElementById("swal-input1").value,
//       document.getElementById("swal-input2").value
//     ];
//   }
// });
// if (formValues) {
//   Swal.fire(JSON.stringify(formValues));
// }



// }







// window.EditCard = async function (
//   id, name, brand, category, price, randomprice, description, image, colorArray
// ) {


//   const { value: formValues } = await Swal.fire({
//     width: 700,
//     showConfirmButton: false,
//     html: `
//     <div class="relative p-4 my-5 bg-white rounded-xl shadow dark:bg-gray-800 sm:p-5">
//       <!-- Modal header -->
//       <div class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
//         <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
//           Update Product
//         </h3>

//       </div>
//       <!-- Modal body -->
//       <form action="#">
//         <div class="grid gap-4 mb-4 sm:grid-cols-2">
//           <div>
//             <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
//             <input type="text" name="name" id=""
//               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//               placeholder="${name}" required="">
//           </div>
//           <div>
//             <label for="brand" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Brand</label>
//             <input type="text" name="brand" id=""
//               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//               placeholder="${brand}" required="">
//           </div>
//           <div>
//             <label for="randomprice" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Random
//               Price</label>
//             <input type="number" name="randomprice" id=""
//               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//               placeholder="${randomprice}" required="">
//           </div>

//           <div>
//             <label for="finalprice" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Final
//               Price</label>
//             <input type="number" name="finalprice" id=""
//               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//               placeholder="${price}" required="">
//           </div>
//           <div>
//             <label for="category" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
//             <input type="text" name="category" id=""
//               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//               placeholder="${category}" required="">
//           </div>
//          <div class="sm:col-span-2">

//   <input type="file"
//          id="updateimg"
//          accept="image/*"
//          class="bg-gray-50 border py-2.5 px-2 border-gray-300 rounded-lg w-full"
//          ">
// </div>

//           <div class="sm:col-span-2">
//             <label for="description"
//               class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
//             <textarea id="description" rows="7"
//               class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//               placeholder="${description}"></textarea>
//           </div>
//         </div>
//         <div>
//         <button type="button" onClick="updateProductBtn()"
//           class="text-white  border block items-center bg-gray-800  hover:cursor-pointer  font-medium rounded-lg text-sm px-5 py-2.5 text-center ">
//           Update product
//         </button>
//         </div>
//       </form>
//     </div>
//     `,


//     preConfirm: () => {
//       const file = document.getElementById("updateimg").files[0];

//       return {
//         id,
//         name: document.getElementById("sw-name").value,
//         brand: document.getElementById("sw-brand").value,
//         category: document.getElementById("sw-category").value,
//         randomPrice: document.getElementById("sw-randprice").value,
//         finalPrice: document.getElementById("sw-finalprice").value,
//         description: document.getElementById("sw-desc").value,
//         imageFile: file || null,
//       };
//     }

//   });

//   if (formValues.imageFile) {
//     const fileName = `${Date.now()}-${formValues.imageFile.name}`;



//     const { data, error } = await client.storage

//       .storage
//       .from("Product_image")
//       .update(fileName, formValues.imageFile, {
//         upsert: true
//       })
//     if (error) {
//       console.log(error);
//     } else {
//       console.log(data, "updatae image data!!");

//     }

//   }


//   // =======updateProductBtn=======

//   window.updateProductBtn = function () {

//     console.log("clicekd");
//     Swal.fire("Updated!", "Product data ready to update 🚀", "success");

//   }
// }





// window.EditCard = async function (
//   id, name, brand, category, price, randomprice, description, image
// ) {

//   const { value: formValues } = await Swal.fire({
//     width: 700,
//     html: `
//     <div class="relative p-4 my-5 bg-white rounded-xl shadow dark:bg-gray-800 sm:p-5">
//        <!-- Modal header -->
//        <div class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
//          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
//            Update Product
//          </h3>

//        </div>
//        <!-- Modal body -->
//        <form action="#">
//          <div class="grid gap-4 mb-4 sm:grid-cols-2">
//            <div>
//              <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
//              <input type="text" name="name" id=""
//                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//                placeholder="${name}" required="">
//            </div>
//            <div>
//              <label for="brand" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Brand</label>
//              <input type="text" name="brand" id=""
//                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//                placeholder="${brand}" required="">
//            </div>
//            <div>
//              <label for="randomprice" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Random
//                Price</label>
//              <input type="number" name="randomprice" id=""
//                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//                placeholder="${randomprice}" required="">
//            </div>
//            <div>
//             <label for="finalprice" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Final
//               Price</label>
//             <input type="number" name="finalprice" id=""
//               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//               placeholder="${price}" required="">
//           </div>
//           <div>
//             <label for="category" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>         <input type="text" name="category" id=""           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//               placeholder="${category}" required="">
//           </div>
//          <div class="sm:col-span-2">

//    <input type="file"
//           id="updateimg"
//           accept="image/*"
//           class="bg-gray-50 border py-2.5 px-2 border-gray-300 rounded-lg w-full"
//           ">
//  </div>

//            <div class="sm:col-span-2">
//              <label for="description"
//                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
//              <textarea id="description" rows="7"
//                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//                placeholder="${description}"></textarea>
//            </div>
//          </div>
//          <div>
//          <button type="button" onClick="updateProductBtn()"
//            class="text-white  border block items-center bg-gray-800  hover:cursor-pointer  font-medium rounded-lg text-sm px-5 py-2.5 text-center ">
//            Update product
//          </button>
//          </div>
//        </form>
//      </div>
//      `,

//     preConfirm: () => {
//       return {
//         id,
//         name: document.getElementById("sw-name").value,
//         brand: document.getElementById("sw-brand").value,
//         category: document.getElementById("sw-category").value,
//         randomPrice: document.getElementById("sw-randprice").value,
//         finalPrice: document.getElementById("sw-finalprice").value,
//         description: document.getElementById("sw-desc").value,
//         imageFile: document.getElementById("updateimg").files[0]
//       };
//     }
//   });

//   if (!formValues) return;

//   // ================= IMAGE REPLACE =================
//   let imagePath = image; // SAME old image

//   if (formValues.imageFile) {
//     const fileName = image.split("/").pop(); // same image name
//     console.log(fileName);
//     console.log(formValues.imageFile);

//     const { error } = await client.storage
//       .from("Product_image")
//       .upload(fileName, formValues.imageFile, {
//         upsert: true
//       });

//     if (error) {
//       console.log("Image error:", error);
//       return;
//     }
//   }

//   // ================= DB UPDATE =================

//   window.updateProductBtn = async function () {
//     const { data: updData, error: dbError } = await client
//       .from("product_detail")
//       .update({
//         name: formValues.name,
//         brand: formValues.brand,
//         category: formValues.category,
//         randomprice: formValues.randomPrice,
//         price: formValues.finalPrice,
//         description: formValues.description,
//         image: imagePath
//       })
//       .eq("id", formValues.id);

//     if (dbError) {
//       console.log("DB error:", dbError);
//       return;
//     } else {
//       console.log(updData, "update");
//       Swal.fire("Updated ✅", "Product & Image updated successfully", "success");
//     }


//   }


// };





window.EditCard = async function (
  id, name, brand, category, price, randomprice, description, image
) {

  const { value: formValues } = await Swal.fire({
    width: 700,
    showCancelButton: true,
    confirmButtonText: "Update",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#1f2937", // dark gray
    cancelButtonColor: "#9298a3ff",
    html: `
     <div class="relative p-4 my-5 bg-gray-100 border border-gray-300 rounded-2xl sm:p-5">

  <!-- Header -->
  <div class="flex justify-between items-center pb-4 mb-4 border-b">
    <h3 class="text-2xl font-semibold text-gray-900">
      Update Product
    </h3>
  </div>

  <!-- Body -->
  <div class="grid gap-4 mb-4 sm:grid-cols-2">

    <div>
      <label class="block mb-2 text-sm font-medium">Name</label>
      <input id="sw-name" type="text"
        class="border rounded-lg p-2.5 w-full"
        value="${name}">
    </div>

    <div>
      <label class="block mb-2 text-sm font-medium">Brand</label>
      <input id="sw-brand" type="text"
        class="border rounded-lg p-2.5 w-full"
        value="${brand}">
    </div>

    <div>
      <label class="block mb-2 text-sm font-medium">Random Price</label>
      <input id="sw-randprice" type="number"
        class="border rounded-lg p-2.5 w-full"
        value="${randomprice}">
    </div>

    <div>
      <label class="block mb-2 text-sm font-medium">Final Price</label>
      <input id="sw-finalprice" type="number"
        class="border rounded-lg p-2.5 w-full"
        value="${price}">
    </div>

    <div>
      <label class="block mb-2 text-sm font-medium">Category</label>
      <input id="sw-category" type="text"
        class="border rounded-lg p-2.5 w-full"
        value="${category}">
    </div>

    <div>
      <label class="block mb-2 text-sm font-medium">Update Image</label>
      <input type="file" id="sw-updateimg"
        class="border rounded-lg p-2.5  w-full">
    </div>

    <div class="sm:col-span-2">
      <label class="block mb-2 text-sm font-medium">Description</label>
      <textarea id="sw-desc" rows="6"
        class="border rounded-lg p-2.5 w-full">${description}</textarea>
    </div>

  </div>

</div>
`,


    preConfirm: () => {
      return {
        id,
        name: document.getElementById("sw-name").value,
        brand: document.getElementById("sw-brand").value,
        category: document.getElementById("sw-category").value,
        randomPrice: document.getElementById("sw-randprice").value,
        finalPrice: document.getElementById("sw-finalprice").value,
        description: document.getElementById("sw-desc").value,
        imageFile: document.getElementById("sw-updateimg").files[0]
      };
    }
  });

  if (!formValues) return;

  // ========= IMAGE OVERWRITE =========
  if (formValues.imageFile) {
    console.log(formValues.imageFile);

    const updfileName = formValues.imageFile.name
    console.log(updfileName);
    console.log(formValues.imageFile);

    const { error, data } = await client.storage
      .from("Product_image")
      .update(updfileName, formValues.imageFile, { upsert: true });

    if (error) {
      console.log("Image error:", error);
    } else {
      console.log(data, "image data aagya");
      const { data: updImgData } = client
        .storage
        .from('Product_image')
        .getPublicUrl(updfileName)
      if (updImgData) {
        let updimgUrl = updImgData.publicUrl
        console.log(updimgUrl);


        const { error: dbError } = await client
          .from("product_detail")
          .update({
            name: formValues.name,
            brand: formValues.brand,
            category: formValues.category,
            rendomprice: formValues.randomPrice,
            price: formValues.finalPrice,
            description: formValues.description,
            image: updimgUrl
          })
          .eq("id", formValues.id);
        console.log(image);


        if (dbError) {
          console.log("DB error:", dbError);
          return;
        }

        Swal.fire("Updated ✅", "Product & Image updated successfully", "success");




      }
    }
  }
};
