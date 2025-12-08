const editUserForm = document.getElementById('editUser');
const storedUser = JSON.parse(localStorage.getItem('user'));
const deleteUserButton = document.getElementById('deleteUser');
const backbutton = document.getElementById('backbutton');
const teamId = localStorage.getItem('teamId');

backbutton.onclick = () => {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', () => {
    if (storedUser && storedUser.username) {
        document.getElementById('username').value = storedUser.username;
    }
})

editUserForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const updatedData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
    };

    try {
        const res = await fetch('/api/user/' + storedUser._id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // så cookien med JWT sendes med
            body: JSON.stringify(updatedData),
        });

        if (!res.ok) throw new Error('Failed to update user');

        const result = await res.json();
        console.log("Bruger opdateret:", result);

        // Opdater localStorage med den nye bruger
        if (result.updatedUser) {
            localStorage.setItem("user", JSON.stringify(result.updatedUser));
        }

        alert("Din profil er opdateret!");
        editUserForm.reset();
    } catch (error) {
        console.error(error);
        alert('Kunne ikke opdatere bruger');
    }
});

deleteUserButton.addEventListener('click', async function(e) {
    e.preventDefault();
    if (!storedUser || !storedUser._id) {
        alert('Ingen bruger fundet');
        return;
    }
    if (!confirm("Er du sikker på du vil slette din profil")) {
        return;
    }
    try {
        const res = await fetch('/api/user/' + storedUser._id, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to delete user');

        localStorage.removeItem('user');
        localStorage.removeItem('teamId');

        alert("Din profil er slettet!");
        window.location.href="/";
    } catch (error){
        console.error(error);
        alert('Kunne ikke slette bruger');
    }
});