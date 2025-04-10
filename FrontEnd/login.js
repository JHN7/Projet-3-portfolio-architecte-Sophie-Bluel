document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const data = { email, password };

            try {
                const response = await fetch('http://localhost:5678/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!response.ok) throw new Error('Identifiants incorrects');

                const result = await response.json();
                const { token, userId } = result;

                localStorage.setItem('authToken', token);
                localStorage.setItem('userId', userId);
                localStorage.setItem('isConnected', 'true');

                window.location.href = 'index.html';
            } catch (error) {
                alert('Erreur de connexion: ' + error.message);
            }
        });
    }
});
