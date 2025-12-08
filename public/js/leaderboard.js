const listEl = document.getElementById('list');
const teamLink = document.getElementById('teamlink');


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

document.addEventListener("DOMContentLoaded", () => {
    initAuthUI();
    getLeaderboard();
});