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

// ❌ not admin
if (data.role !== "admin") {
  Swal.fire({
    icon: "error",
    title: "Access Denied",
    text: "You are not authorized to access this page",
    confirmButtonColor: "#2563eb"
  }).then(() => {
    window.location.href = "./login.html";
  });
} else {
  console.log("Admin access granted");
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

// =====Add to supabase=======

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
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill all fields"
    })
    return
  }

  // ⏳ loading
  Swal.fire({
    title: "Adding Product...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })

  let file = productImg.files[0]

  // ===== upload image =====
  const { data, error: storageError } = await client
    .storage
    .from('Product_image')
    .upload(file.name, file, { upsert: true })

  if (storageError) {
    Swal.fire({
      icon: "error",
      title: "Upload Failed",
      text: "Product image upload failed"
    })
    console.log(storageError)
    return
  }

  const { data: publicData } = client
    .storage
    .from('Product_image')
    .getPublicUrl(file.name)

  if (publicData) {
    window.productUrl = publicData.publicUrl
  }

  // ===== insert product =====
  const { error } = await client
    .from('product_detail')
    .insert({
      name: productName.value,
      brand: brand.value,
      rendomprice: randomprice.value,
      price: finalprice.value,
      category: category.value,
      color: allColor,
      description: description.value,
      image: productUrl
    })

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error in adding Product"
    })
    console.log(error, "inserted error")
  } else {
    Swal.fire({
      icon: "success",
      title: "Success 🎉",
      text: "Product added successfully !",
      timer: 1500,
      showConfirmButton: false
    })

    // optional: form reset
    productName.value = ""
    brand.value = ""
    randomprice.value = ""
    finalprice.value = ""
    category.value = ""
    description.value = ""
    allColor = []
  }
})

// ======fetch product on admin side========

let products = []
const showproductadmin = document.getElementById("showproductadmin")

function updateProductInUI(updatedProduct) {
  const index = products.findIndex(p => p.id === updatedProduct.id)
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct }
    renderProducts()
  }
}

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

  // 🔔 confirm delete
  const confirmDel = await Swal.fire({
    title: "Are you sure?",
    text: "This product will be permanently deleted",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#475569",
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel"
  })

  if (!confirmDel.isConfirmed) return

  // ⏳ loading
  Swal.fire({
    title: "Deleting...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })

  const { error } = await client
    .from("product_detail")
    .delete()
    .eq("id", id)

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Delete Failed",
      text: "Product delete nahi ho saka"
    })
    console.log(error)
    return
  }

  // ✅ update UI without reload
  products = products.filter(p => p.id !== id)
  renderProducts()

  Swal.fire({
    icon: "success",
    title: "Deleted!",
    text: "Product successfully deleted",
    timer: 1200,
    showConfirmButton: false
  })
}



// ====EDIT CARD========

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
      <label class="block mb-2 text-start text-lg font-bold">Name</label>
      <input id="sw-name" type="text"
        class="border rounded-lg p-2.5 w-full"
        value="${name}">
    </div>

    <div>
      <label class="block mb-2 text-start text-lg font-bold">Brand</label>
      <input id="sw-brand" type="text"
        class="border rounded-lg p-2.5 w-full"
        value="${brand}">
    </div>

    <div>
      <label class="block mb-2 text-start text-lg font-bold">Random Price</label>
      <input id="sw-randprice" type="number"
        class="border rounded-lg p-2.5 w-full"
        value="${randomprice}">
    </div>

    <div>
      <label class="block mb-2 text-start text-lg font-bold">Final Price</label>
      <input id="sw-finalprice" type="number"
        class="border rounded-lg p-2.5 w-full"
        value="${price}">
    </div>

    <div>
      <label class="block mb-2 text-start text-lg font-bold">Category</label>
      <input id="sw-category" type="text"
        class="border rounded-lg p-2.5 w-full"
        value="${category}">
    </div>

    <div>
      <label class="block mb-2 text-start text-lg font-bold">Update Image</label>
      <input type="file" id="sw-updateimg"
        class="border rounded-lg p-2.5  w-full">
    </div>

    <div class="sm:col-span-2">
      <label class="block mb-2 text-start text-lg font-bold">Description</label>
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

        updateProductInUI({
          id: formValues.id,
          name: formValues.name,
          brand: formValues.brand,
          category: formValues.category,
          rendomprice: formValues.randomPrice,
          price: formValues.finalPrice,
          description: formValues.description,
          image: updimgUrl
        })


        if (dbError) {
          console.log("DB error:", dbError);
          return;
        }
        Swal.fire("Updated", "Product & Image updated successfully", "success");
      }
    }
  }
};


// =========PROFILE PIC SHOW =======

const profile_pic_update = document.getElementById("profile_pic_update");
const deletPicture = document.getElementById("deletPicture");
const chanagePicture = document.getElementById("chanagePicture");
const profileUpdate = document.getElementById("profileUpdate");
const profile_email = document.getElementById("profile_email");
const fullname_ = document.getElementById("fullname_");
const saveBtn = document.getElementById("saveBtn");

let updPublicUrl = null;

try {
  const { data: profileShow, error: profileShowErr } = await client.auth.getUser();
  if (profileShowErr) throw profileShowErr;

  const adminUserid = profileShow.user.id;

  try {
    // ========Fetch admin profile========
    const { data: fetchadminProfileData, error: fetchadminProfileErr } = await client
      .from('all-users-data')
      .select("*")
      .eq("user_id", adminUserid)
      .single();

    if (fetchadminProfileErr) throw fetchadminProfileErr;

    profile_email.placeholder = fetchadminProfileData.email || "";
    fullname_.placeholder = fetchadminProfileData.name || "";
    updPublicUrl = fetchadminProfileData.profile_img || null;

    if (updPublicUrl) {
      profile_pic_update.src = updPublicUrl;
    } else {
      profile_pic_update.src = "https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-600nw-2470054311.jpg";
    }

  } catch (fetchErr) {
    console.error("Error fetching profile:", fetchErr);
  }

  // Change profile picture
  chanagePicture?.addEventListener("click", () => profileUpdate?.click());

  // Handle file selection
  profileUpdate?.addEventListener("change", async () => {
    try {
      const file = profileUpdate.files[0];
      if (!file) return;

      const fileName = file.name;

      // Loading SweetAlert
      Swal.fire({
        title: "Uploading Picture...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const { data, error } = await client
        .storage
        .from('ecommerce_profile')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: profileUrl } = client
        .storage
        .from('ecommerce_profile')
        .getPublicUrl(fileName);

      updPublicUrl = profileUrl.publicUrl;
      profile_pic_update.src = updPublicUrl;
      console.log("Profile picture updated:", updPublicUrl);

      Swal.close(); // close loading
      Swal.fire({
        icon: "success",
        title: "Uploaded!",
        text: "Profile picture updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (uploadErr) {
      console.error("Upload error:", uploadErr);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Failed to upload profile picture!",
      });
    }
  });

  // Save updated profile
  saveBtn?.addEventListener("click", async () => {
    try {
      if (!fullname_.value || !profile_email.value) {
        return Swal.fire({
          icon: "warning",
          title: "Missing Fields",
          text: "Please fill in both name and email",
        });
      }

      // Loading SweetAlert
      Swal.fire({
        title: "Updating Profile...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const { error } = await client
        .from("all-users-data")
        .update({
          name: fullname_.value,
          email: profile_email.value,
          profile_img: updPublicUrl,
        })
        .eq("user_id", adminUserid);

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      // Optional: redirect after a short delay
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1600);

    } catch (saveErr) {
      console.error("Update failed:", saveErr);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update profile! Please try again.",
      });
    }
  });


  // Delete profile picture

  deletPicture?.addEventListener("click", async () => {
    try {
      // agar picture hi nahi
      if (!updPublicUrl) {
        Swal.fire({
          icon: "info",
          title: "No Picture",
          text: "There is no profile picture to delete.",
        });
        profile_pic_update.src =
          "https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-600nw-2470054311.jpg";
        return;
      }

      // confirmation alert
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Your profile picture will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it",
      });

      if (!result.isConfirmed) return;

      // Extract file path from public URL
      const url = new URL(updPublicUrl);
      const filePath = url.pathname.split("/").slice(4).join("/");

      const { data, error } = await client.storage
        .from("ecommerce_profile")
        .remove([filePath]);

      if (error) throw error;

      // reset image
      profile_pic_update.src =
        "https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-600nw-2470054311.jpg";
      updPublicUrl = null;

      // DB se bhi remove
      const { error: updateErr } = await client
        .from("all-users-data")
        .update({ profile_img: null })
        .eq("user_id", adminUserid);

      if (updateErr) {
        console.error("DB update error:", updateErr);
      }

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Profile picture has been deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (deleteErr) {
      console.error("Error deleting profile picture:", deleteErr);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete profile picture. Please try again.",
      });
    }
  });


} catch (authErr) {
  console.error("Error getting user:", authErr);
}


// ======user & product count========


const userTable = document.getElementById("userTable");
const userCount = document.getElementById("userCount");

try {
  const { data: showuserCount, error: countErr } = await client
    .from('all-users-data')
    .select('*')
  userCount.innerHTML = showuserCount.length

  if (countErr) throw countErr;

  if (userTable) userTable.innerHTML = "";

  showuserCount.forEach(user => {
    const row = document.createElement("tr");

    row.innerHTML = `
  <td class="p-3">
    <div class="flex items-center gap-3">
      <img 
        class="w-10 h-10 rounded-full border border-gray-200 object-cover"
        src="${user.profile_img || 'https://via.placeholder.com/40'}"
        alt="profile"
      >
      <span class="text-gray-700 font-medium">
        ${user.name || "-"}
      </span>
    </div>
  </td>

  <td class="p-3 text-gray-700">${user.user_id || "-"}</td>
  <td class="p-3 text-gray-700">${user.email || "-"}</td>

    `;

    userTable.appendChild(row);
  });

} catch (err) {
  console.error("Error fetching users:", err);
}



// ======TOTAL PRODUCT======
const totalProduct = document.getElementById("totalProduct")

const { data: showProduct, error: productError } = await client
  .from('product_detail')
  .select('*');

if (productError) {
  console.error(productError);
} else {
  console.log("Total product:", showProduct.length);
  totalProduct.textContent = showProduct.length
}


// ======ORDER PLACED======
const order_placed = document.getElementById("order_placed")

const { data: order_placedData, error: order_placedErr } = await client
  .from('order_placed')
  .select('*');

if (productError) {
  console.error(order_placedErr);
} else {
  console.log("order placed", order_placedData.length);
  order_placed.textContent = order_placedData.length
}
