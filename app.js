const projectUrl = "https://nsvbxmhwoncpxmqfsdab.supabase.co"
const projectKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdmJ4bWh3b25jcHhtcWZzZGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMjQzOTAsImV4cCI6MjA2ODcwMDM5MH0.mVyqnlyV2cQx3laoXqxvHFpRcAwSsjvHvIbHTc9675A"

const { createClient } = supabase;
const client = createClient(projectUrl, projectKey)

console.log(createClient);
console.log(client);

export default client;

// =====signup work=========

const password = document.getElementById("password");
const email = document.getElementById("email");
const username = document.getElementById("name");
const profileImg = document.getElementById("profileImg");
const btn = document.getElementById("btn");

btn && btn.addEventListener("click", async (e) => {
    e.preventDefault();

    const userValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    // Empty fields
    if (userValue === "" || emailValue === "" || passwordValue === "" || !profileImg.files[0]) {
        Swal.fire({
            icon: "warning",
            title: "Oops!",
            text: "Please fill all fields"
        });
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
        Swal.fire({
            icon: "error",
            title: "Invalid Email",
            text: "Please enter a valid email address"
        });
        return;
    }

    // Password validation
    if (passwordValue.length < 6) {
        Swal.fire({
            icon: "error",
            title: "Weak Password",
            text: "Password must be at least 6 characters"
        });
        return;
    }

    // Signup
    const { data, error } = await client.auth.signUp({
        email: emailValue,
        password: passwordValue,
        options: {
            data: {
                username: userValue,
                role: "user"
            }
        }
    });

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Signup Failed",
            text: error.message
        });
        return;
    }

    // Success alert
    Swal.fire({
        icon: "success",
        title: "Account Created 🎉",
        text: "Your account has been created successfully",
        timer: 2000,
        showConfirmButton: false
    });

    // ===== Image Upload =====
    const profileImgFile = profileImg.files[0];
    const fileName = `${Date.now()}-${profileImgFile.name}`;

    const { error: uploadError } = await client.storage
        .from("ecommerce_profile")
        .upload(fileName, profileImgFile, { upsert: true });

    if (uploadError) {
        Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: "Profile image upload failed"
        });
        return;
    }

    // ===== Get Public URL =====
    const { data: imgData } = client.storage
        .from("ecommerce_profile")
        .getPublicUrl(fileName);

    const profileImageUrl = imgData.publicUrl;

    // ===== Insert User Data =====
    const { error: insertError } = await client
        .from("all-users-data")
        .insert({
            name: data.user.user_metadata.username,
            email: data.user.email,
            role: data.user.user_metadata.role,
            user_id: data.user.id,
            profile_img: profileImageUrl,
        });

    if (!insertError) {
        window.location.href = "login.html";

    }
});


// ============= login ============

const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");
const loginBtn = document.getElementById("loginBtn");

loginBtn && loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // ❌ empty check
    if (loginEmail.value.trim() === "" || loginPass.value.trim() === "") {
        Swal.fire({
            icon: "warning",
            title: "Missing Fields",
            text: "Please fill all fields"
        });
        return;
    }

    // ❌ password length check
    if (loginPass.value.length < 6) {
        Swal.fire({
            icon: "error",
            title: "Invalid Password",
            text: "Password must be at least 6 characters"
        });
        return;
    }

    // ⏳ loading
    Swal.fire({
        title: "Logging in...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const { data, error } = await client.auth.signInWithPassword({
        email: loginEmail.value,
        password: loginPass.value,
    });

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: error.message
        });
        return;
    }

    let userId = data.user.id;

    const { data: roleData, error: roleError } = await client
        .from("all-users-data")
        .select("role")
        .eq("user_id", userId)
        .single();

    if (roleError) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Role fetch nahi ho raha"
        });
        return;
    }

    // ✅ success + redirect
    Swal.fire({
        icon: "success",
        title: "Login Successful 🎉",
        text: "Redirecting...",
        timer: 1500,
        showConfirmButton: false
    });

    setTimeout(() => {
        if (roleData.role === "admin") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "index.html";
        }
    }, 1500);
});


// ========= LOGOUT =========

const logout = document.getElementById("logout");

logout && logout.addEventListener("click", async () => {

    // 🔔 confirm before logout
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to logout from your account",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#475569",
        confirmButtonText: "Yes, logout",
        cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    // ⏳ loading
    Swal.fire({
        title: "Logging out...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const { error } = await client.auth.signOut();

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Logout Failed",
            text: error.message
        });
    } else {
        Swal.fire({
            icon: "success",
            title: "Logged out 👋",
            text: "See you again!",
            timer: 1500,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    }
});




// ===========Fetch product ==========

const showProduct = document.getElementById("showProduct")

async function showAllProduct() {
    const { data, error } = await client
        .from('product_detail')
        .select("*")
    if (error) {
        console.log(error, "fething error");
    } else {
        showProduct.innerHTML = ""

        data.forEach(product => {
            console.log(product);

            let colorHTML = ""

            product.color.forEach(c => {
                colorHTML += `
                <div 
                    class="w-6 h-6 rounded-full border border-gray-300"
                    style="background-color:${c}">
                </div>
            `
            })

            showProduct.innerHTML += `
   <div class="card bg-white w-full 
            border border-gray-200 rounded-2xl shadow-md
           hover:scale-103  transition duration-500"  onClick="productCard(${product.id})">

    <img 
        class="w-full h-48 object-cover rounded-t-2xl"
        src="${product.image}" 
        alt=""
    />

    <div class="p-4 text-center space-y-2">

        <p class="text-sm line-clamp-2 text-gray-500">
            
              ${product.description}
        </p>

         <div>
          <span class="text-xl font-semibold text-green-600 ">Rs. ${product.price}</span>
          <del class="text-md font-bold text-gray-400 mx-2">Rs. ${product.rendomprice}</del>
          
        </div

        <!-- colors -->
        <div class="flex justify-center gap-2 mt-3">
            ${colorHTML}
        </div>
<button type="button" class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br  shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-xl text-sm px-6 py-2.5 text-center leading-5">Add to Cart</button>
    </div>
</div>`
        });
    }
}

showAllProduct()

window.productCard = function (id) {
    console.log(id);
    window.location.href = `productDetail.html?id=${id}`

}
