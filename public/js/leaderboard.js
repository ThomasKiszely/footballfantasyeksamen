const listEl = document.getElementById('list');
const logoutBtn = document.getElementById('logoutBtn');
const editUserBtn = document.getElementById('editUserBtn');
const teamLink = document.getElementById('teamlink');


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

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}



if (teamLink) {
    teamLink.addEventListener('click', async (e) => {
        e.preventDefault(); // stop det normale link
        const isLoggedIn = await checkAuth();
        if (!isLoggedIn) {
            window.location.href = '/login';
            return;
        }

        const teamId = localStorage.getItem('teamId');
        if (teamId) {
            window.location.href = `/team?teamId=${teamId}`;
        } else {
            window.location.href = '/create-team';
        }
    });
}


if (editUserBtn) {
    editUserBtn.addEventListener('click', async () => {
        const isLoggedIn = await checkAuth();
        const user = JSON.parse(localStorage.getItem('user'));
        if (!isLoggedIn){
            window.location.href = '/login';
            return;
        }
        if (user && user._id) {
            window.location.href = `/editUser?userid=${user._id}`}
    });
}
async function checkAuth(){
    try{
        const response = await fetch('/api/user/check', {
            method: 'GET',
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            return data.success === true;
        }
        return false;
    } catch (error) {
        alert('Kunne ikke checke bruger: ' + error.message);
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
                    window.location.href = '/login';
                }
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

async function getLeaderboard() {
    try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) {
            throw new Error('Failed to fetch leaderboard: ' + res.status);
        }

        const leaderboard = await res.json();
        renderLeaderboard(leaderboard);
    } catch(error) {
        console.log("Leaderboard fejl:", error.message);
        const listBody = document.querySelector('#list tbody');
        listBody.innerHTML = '<tr><td colspan="4" class="error-message">Kunne ikke hente leaderboard. Prøv igen senere.</td></tr>';
    }
}

function renderLeaderboard(data) {
    const listBody = document.querySelector('#list tbody');
    listBody.innerHTML = '';

    if (!data || data.length === 0) {
        listBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">Ingen hold fundet endnu.</td></tr>';
        return;
    }

    data.forEach((team, index) => {
        const row = document.createElement('tr');

        const username = team.userId?.username || 'Ukendt bruger';

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${username}</td>
            <td>${team.teamName}</td>
            <td>${team.points}</td>
        `;
        listBody.appendChild(row);
    });
}

getLeaderboard();
document.addEventListener("DOMContentLoaded", updateAuthUI);