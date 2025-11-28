const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const msg = document.getElementById('message');

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

loginTab.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    msg.textContent = "";

    loginTab.classList.add("active");
    signupTab.classList.remove("active");
});

signupTab.addEventListener("click", () => {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    msg.textContent = "";

    signupTab.classList.add("active");
    loginTab.classList.remove("active");
});

async function handleAuthentication(event, endpoint, usernameId, passwordId) {
    event.preventDefault();

    const username = document.getElementById(usernameId).value;
    const password = document.getElementById(passwordId).value;

    try {
        const res = await fetch(`/api/user/${endpoint}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password}),
        });

        const data = await res.json();

        if (data.success) {
            msg.textContent = endpoint === "login" ? "Login successfuldt" : "Bruger oprettet";
            msg.style.color = "green";

            console.log('Token modtaget:', data.token);
            if (data.token) {
                localStorage.setItem('jwt', data.token);
                window.location.href = "/team.html"; // Sørg for at denne route findes
            }
        } else {
            msg.textContent = "Fejl: " + (data.error || "Ukendt fejl");
            msg.style.color = "red";
        }
    } catch (error) {
        console.error(error);
        msg.textContent = "Serverfejl";
    }
}

loginForm.addEventListener("submit", (event) => handleAuthentication(event, "login", "loginUsername", "loginPassword"));
signupForm.addEventListener("submit", (event) => handleAuthentication(event, "signup", "signupUsername", "signupPassword"));
