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

function goToTeam() {
    const teamId = localStorage.getItem('teamId');
    if (teamId) {
        window.location.href = `/team?teamId=${teamId}`;
    } else {
        window.location.href = '/create-team';
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
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