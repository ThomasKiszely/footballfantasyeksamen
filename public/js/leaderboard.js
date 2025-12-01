const listEl = document.getElementById('list');

async function getLeaderboard() {
    try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) {
            alert('Failed to fetch leaderboard' + res.status);
        }

        const leaderboard = await res.json();
        renderLeaderboard(leaderboard);
    } catch(error) {
        alert('Error fetching leaderboard:', error.message);
    }
}

function renderLeaderboard(data) {
    const listBody = document.querySelector('#list tbody');

    listBody.innerHTML = '';

    for (const team of data) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${team.user.username}</td>
            <td>${team.teamName}</td>
            <td>${team.points}</td>
        `;
        listBody.appendChild(row);
    }
}

getLeaderboard();