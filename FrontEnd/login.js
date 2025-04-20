document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('submit-btn');
    const errorMessageContainer = document.getElementById('login-error-msg'); // Conteneur pour les messages d'erreur

    // Vérifier la validité des champs
    function checkFormValidity() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        // Désactiver le bouton d'envoi si les champs sont vides
        submitButton.disabled = !(email && password);
    }

    // Ajouter un événement pour vérifier la validité des champs à chaque modification
    emailInput.addEventListener('input', function () {
        checkFormValidity();
        clearError(); // Effacer le message d'erreur si l'utilisateur modifie les champs
    });

    passwordInput.addEventListener('input', function () {
        checkFormValidity();
        clearError(); // Effacer le message d'erreur si l'utilisateur modifie les champs
    });

    // Initialiser le bouton en fonction des champs
    checkFormValidity();

    // Fonction pour afficher l'erreur
    function showError(message) {
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = 'block'; // Afficher le message d'erreur
    }

    // Fonction pour effacer l'erreur
    function clearError() {
        errorMessageContainer.textContent = '';
        errorMessageContainer.style.display = 'none'; // Cacher le message d'erreur
    }

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Réinitialiser le message d'erreur
        clearError();

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
            // Afficher le message d'erreur dans la div créée
            showError('Identifiants incorrects');
        }
    });
});
