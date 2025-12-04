const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const msg = document.getElementById('message');

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

console.log("login.js loaded");
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
            credentials: "include",
        });
        console.log("Fetch response status:", res.status);
        const data = await res.json();
        console.log("Auth response JSON:", data);

        if (data.success) {
            msg.textContent = endpoint === "login" ? "Login successfuldt" : "Bruger oprettet";
            msg.style.color = "green";
            localStorage.clear();
            localStorage.setItem("user", JSON.stringify(data.user));

            if(data.teamId) {
                console.log("TeamId received:", data.teamId);
                localStorage.setItem('teamId', data.teamId);
                console.log("Saved teamId in localStorage:", localStorage.getItem('teamId'));
                window.location.href = `/team?teamId=${data.teamId}`;
            } else {
                console.warn("Ingen teamId i respons → redirect til create-team");
                window.location.href = `/create-team`;
            }

        } else {
            msg.textContent = "Forkert brugernavn eller kodeord";
            msg.style.color = "red";
        }
    } catch (error) {
        console.error(error);
        msg.textContent = "Forkert brugernavn eller password";
    }
}

loginForm.addEventListener("submit", (event) => handleAuthentication(event, "login", "loginUsername", "loginPassword"));
signupForm.addEventListener("submit", (event) => handleAuthentication(event, "signup", "signupUsername", "signupPassword"));
