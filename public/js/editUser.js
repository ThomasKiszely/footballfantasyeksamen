const editUserForm = document.getElementById('editUser');
const storedUser = JSON.parse(localStorage.getItem('user'));

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
