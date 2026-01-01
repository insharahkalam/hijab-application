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
const btn = document.getElementById("btn");

btn && btn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Trim values
    const userValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    // Username validation
    if (userValue === "" || emailValue === "" || passwordValue === "") {
        alert("please fill all field!");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
        alert("Please enter a valid email");
        return;
    }

    if (passwordValue.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }

    // Supabase Signup
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
        alert(error.message);
        console.log(error);
    } else {
        alert("Account created successfully!");
        console.log(data);
        if (data) {
            const { error } = await client
                .from('all-users-data')
                .insert({ name: data.user.user_metadata.username, email: data.user.email, role: data.user.user_metadata.role, user_id: data.user.id })
            if (error) {
                console.log(error, "insert error");
            } else {
                console.log("data insert in table.");
            }

        }
        else {
            console.log(error);
        }
        window.location.href = "login.html";
    }
});

// =============login========

const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");
const loginBtn = document.getElementById("loginBtn");

loginBtn && loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // ❌ empty check
    if (loginEmail.value.trim() === "" || loginPass.value.trim() === "") {
        alert("Please fill all fields");
        return;
    }

    // ❌ password length check
    if (loginPass.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }

    const { data, error } = await client.auth.signInWithPassword({
        email: loginEmail.value,
        password: loginPass.value,
    });

    if (error) {
        alert(error.message);
    }

    let userId = data.user.id

    const { data: roleData, error: roleError } = await client
        .from("all-users-data")
        .select("role")
        .eq("user_id", userId)
        .single();

    if (roleError) {
        alert("Role fetch nahi ho raha");
        return;
    }

    if (roleData.role === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "index.html";
    }
});

// =========LOGOUT=======

const logout = document.getElementById("logout")

logout && logout.addEventListener("click", async () => {
    const { error } = await client.auth.signOut()
    if (error) {
        console.log(error, "logout error");
    } else {
        alert("logout successfully!")
        window.location.href = "login.html"
    }
})





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

        <p class=" font-semibold text-lg text-gray-600">
            Rs: ${product.price}
        </p>

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
