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


colorBtn.addEventListener("click", (e) => {

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
const price = document.getElementById("price")
const category = document.getElementById("category")
const productImg = document.getElementById("productImg")
const description = document.getElementById("description")
let allColor = []

addProductBtn && addProductBtn.addEventListener("click", async () => {

    if (
        productName.value.trim() === "" ||
        brand.value.trim() === "" ||
        price.value.trim() === "" ||
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
            .insert({ name: productName.value, brand: brand.value, price: price.value, category: category.value, color: allColor, description: description.value, image: productUrl })

        if (error) {
            console.log(error, "inserted error");
        } else {
            alert("successfully added!")
        }
    }


})

