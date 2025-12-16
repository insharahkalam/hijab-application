const projectUrl = "https://nsvbxmhwoncpxmqfsdab.supabase.co"
const projectKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdmJ4bWh3b25jcHhtcWZzZGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMjQzOTAsImV4cCI6MjA2ODcwMDM5MH0.mVyqnlyV2cQx3laoXqxvHFpRcAwSsjvHvIbHTc9675A"

const { createClient } = supabase;
const client = createClient(projectUrl, projectKey)

console.log(createClient);
console.log(client);


const password = document.getElementById("password")
const email = document.getElementById("email")
const username = document.getElementById("name")
const btn = document.getElementById("btn")

btn && btn.addEventListener("click", async () => {

    const { data, error } = await client.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
            data: {
                username: username.value,
                role: "user"
            }
        }

    })

    if (error) {
        console.log(error);

    } else {
        console.log(data, "successfully!!");
        window.location.href = "login.html"
    }
})

