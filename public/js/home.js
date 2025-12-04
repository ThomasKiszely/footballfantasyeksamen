const logoutBtn = document.getElementById('logoutBtn');
const goToTeamBtn = document.getElementById('goToTeam');
const teamLink = document.getElementById('teamLink');

async function logout() {
    try {
        const response = await fetch('/api/user/logout', {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            localStorage.removeItem('user');
            localStorage.removeItem('teamId');
            window.location.href = '/';
        } else {
            alert('Could not logout');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Could not logout: ' + error.message);
    }
}
async function updateAuthUI(){
    try{
        const isLoggedIn = await checkAuth();
        if(logoutBtn){
            if(isLoggedIn){
                logoutBtn.textContent = 'Logout';
                logoutBtn.onclick = logout;
            } else {
                logoutBtn.textContent = 'Login';
                logoutBtn.onclick = () => {
                    window.location.href = '/login.html';
                }
            }
        }
        if (goToTeamBtn) {
            goToTeamBtn.disabled = !isLoggedIn; // deaktiver knappen hvis ikke logget ind
        }
    } catch (error) {
        console.log(error.message);
    }
}

async function checkAuth() {
    try{
        const response = await fetch('/api/user/checkAuth', {
            method: 'GET',
            credentials: 'include',
        })
        if (response.ok) {
            const data = await response.json();
            return data.success === true;
        } else {
            return false;
        }
    } catch (error){
        alert('CheckAuth error:', error.message);
    }
}

async function goToTeam() {
    const isLoggedIn = await checkAuth();
    if (!isLoggedIn) {
        window.location.href = '/login.html';
        return;
    }
    const teamId = localStorage.getItem('teamId');
    if (teamId) {
        window.location.href = `/team?teamId=${teamId}`;
    } else {
        window.location.href = '/create-team';
    }
}

if (goToTeamBtn) {
    goToTeamBtn.addEventListener('click', goToTeam);
}

if (teamLink) {
    teamLink.addEventListener('click', (e) => {
        e.preventDefault();
        goToTeam();
    });
}

document.addEventListener("DOMContentLoaded", updateAuthUI);