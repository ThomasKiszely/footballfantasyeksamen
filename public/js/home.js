const goToTeamBtn = document.getElementById('goToTeam');
const teamLink = document.getElementById('teamLink');



async function goToTeam() {
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

document.addEventListener("DOMContentLoaded", () => {
    initAuthUI();
});