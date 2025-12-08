async function logout() {
    try {
        const response = await fetch(`api/user/logout`, {
            method: "POST",
            credentials: "include",
        });
        if (response.ok) {
            localStorage.removeItem("user");
            localStorage.removeItem("teamId");
            window.location.href = "/";
        } else {
            alert("Kunne ikke logge ud");
        }
    } catch (err) {
        alert("Logout fejl: " + err.message);
    }
}

async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/check`, {
            method: "GET",
            credentials: "include",
        });
        if (response.ok) {
            const data = await response.json();
            return data.success === true;
        }
        return false;
    } catch (err) {
        console.error("Auth fejl:", err);
        return false;
    }
}

function initAuthUI() {
    const logoutBtn = document.getElementById("logout");
    const editUserBtn = document.getElementById("editUser");

    checkAuth().then(isLoggedIn => {
        if (logoutBtn) {
            if (isLoggedIn) {
                logoutBtn.textContent = "Logout";
                logoutBtn.onclick = logout;
            } else {
                logoutBtn.textContent = "Login";
                logoutBtn.onclick = () => window.location.href = "/login";
            }
        }

        if (editUserBtn) {
            editUserBtn.onclick = () => {
                const user = JSON.parse(localStorage.getItem("user"));
                if (user && user._id) {
                    window.location.href = `/editUser?userid=${user._id}`;
                } else {
                    window.location.href = "/login";
                }
            };
        }
    });
}