let travaux = [];
const API_URL = 'http://localhost:5678/api';

// Cette fonction crée un bandeau "Mode édition" si l'utilisateur est connecté
function afficherBandeauEdition() {
    const isConnected = localStorage.getItem('isConnected');
    if (isConnected === 'true') {
        const editionBanner = document.createElement('div');
        editionBanner.style.backgroundColor = 'black';
        editionBanner.style.color = 'white';
        editionBanner.style.padding = '10px';
        editionBanner.style.textAlign = 'center';
        editionBanner.style.width = '100%';
        editionBanner.style.position = 'fixed';
        editionBanner.style.top = '0';
        editionBanner.style.left = '0';
        editionBanner.style.zIndex = '1000';
        editionBanner.innerHTML = '<i class="fa-solid fa-pen-to-square" style="margin-right: 10px;"></i> Mode édition';

        document.body.prepend(editionBanner); // Ajoute le bandeau en haut de la page
    }
}

window.addEventListener('load', () => {
    // Vérifie si l'utilisateur est connecté et ajoute le bandeau "Mode édition"
    afficherBandeauEdition();

    // Si l'utilisateur est en mode édition, ajouter le bouton "Modifier" à côté de "Mes projets"
    const isConnected = localStorage.getItem('isConnected');
    if (isConnected === 'true') {
        const portfolioSection = document.querySelector('#portfolio h2');
        if (portfolioSection) {
            // Crée le lien "Modifier" avec une icône de stylo
            const modifierLink = document.createElement('a');
            modifierLink.classList.add('modifier-link');
            modifierLink.href = "#";

            // Ajoute une icône de stylo de Font Awesome à l'intérieur du lien
            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-pen-to-square');
            modifierLink.appendChild(icon);

            // Ajouter le texte "Modifier" après l'icône
            const text = document.createElement('span');
            text.textContent = 'modifier';
            modifierLink.appendChild(text);

            // 💡 Ajoute l'écouteur juste ici :
            modifierLink.addEventListener('click', openModal);

            // Ajoute le lien à la section "Mes Projets"
            portfolioSection.appendChild(modifierLink);
        }
    }

    const loginLink = document.getElementById('login-link');

    if (isConnected) {
        loginLink.textContent = 'logout';
        loginLink.href = '#';
        loginLink.classList.remove('active');
        loginLink.classList.remove('active', 'no-underline');
        loginLink.classList.add('logout');

        // Gestion du clic sur "Logout"
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();

            // Supprime les données de connexion
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('isConnected');

            // Redirection vers login
            window.location.href = 'login.html';
        });
    } else {
        // Si on est sur login.html, on ajoute "active"
        if (window.location.pathname.includes('login.html')) {
            loginLink.classList.add('active');
        }

        // Si on est sur index.html, on enlève la soulignure
        if (window.location.pathname.includes('index.html')) {
            loginLink.classList.add('no-underline');
        }
    }

});



// Fonction qui affiche un message de succès ou d'erreur
function afficherMessage(type, message) {
    const messageWindow = document.createElement('div');
    messageWindow.classList.add('message-window', type);

    // Créer le contenu de la fenêtre de message
    const modalContent = document.createElement('div');
    modalContent.classList.add('message-content');

    // Créer l'icône et le texte
    const icon = document.createElement('i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle'; // Icône de succès
    } else if (type === 'error') {
        icon.className = 'fas fa-times-circle'; // Icône d'erreur
    }

    const messageText = document.createElement('span');
    messageText.textContent = message;

    modalContent.appendChild(icon);
    modalContent.appendChild(messageText);
    messageWindow.appendChild(modalContent);

    // Ajouter le message à l'élément body
    document.body.appendChild(messageWindow);

    // Afficher la fenêtre de message
    messageWindow.style.display = 'flex';

    // Fermer la fenêtre de message si on clique en dehors de celle-ci
    messageWindow.addEventListener('click', (e) => {
        if (e.target === messageWindow) {
            messageWindow.style.display = 'none';
        }
    });

    // Empêcher la propagation du clic dans le contenu de la modale
    modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Optionnel : fermer la fenêtre après 3 secondes
    setTimeout(() => {
        messageWindow.style.display = 'none';
    }, 3000);
}

// Afficher les travaux dans la galerie
function afficherTravaux(travaux) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // On vide la galerie avant de la remplir

    travaux.forEach(travail => {
        const figure = document.createElement('figure');
        const image = document.createElement('img');
        image.src = travail.imageUrl;
        image.alt = travail.title;
        const caption = document.createElement('figcaption');
        caption.textContent = travail.title;

        figure.appendChild(image);
        figure.appendChild(caption);
        gallery.appendChild(figure);
    });
}

//Filtrage

// Fonction qui crée les boutons de filtre et attribue la catégorie
function genererBouton(categorie) {
    const btn = document.createElement("button");
    btn.textContent = categorie.name || "Tous";
    btn.classList.add("btn-filtre");

    btn.addEventListener("click", () => {
        activerBouton(btn);
        filtrerTravauxParCategorie(categorie.id || "all");
    });

    return btn;
}

// Fonction pour gérer l'état actif des boutons
function activerBouton(boutonActif) {
    document.querySelectorAll(".btn-filtre").forEach(btn => btn.classList.remove("active"));
    boutonActif.classList.add("active");
}

// Filtrer les travaux par catégorie
function filtrerTravauxParCategorie(categorieId) {
    if (categorieId === "all") {
        afficherTravaux(travaux); // Affiche tous les travaux
    } else {
        const travauxFiltres = travaux.filter(travail => travail.category.id === categorieId);
        afficherTravaux(travauxFiltres);
    }
}

async function chargerCategorie() {
    const isConnected = localStorage.getItem('isConnected');
    const containerBoutons = document.querySelector('.boutons-filtre');

    if (!isConnected) {
        // Si l'utilisateur n'est pas connecté, on charge les catégories et les boutons de filtre
        const repCat = await fetch(`${API_URL}/categories`);
        const categories = await repCat.json();

        const btnTous = genererBouton({ name: "Tous", id: "all" });
        containerBoutons.appendChild(btnTous);
        btnTous.click();

        categories.forEach(category => {
            const btn = genererBouton(category);
            containerBoutons.appendChild(btn);
        });
    }
}

// Charger les travaux depuis l'API
async function chargerTravaux() {
    const repWork = await fetch(`${API_URL}/works`);
    travaux = await repWork.json();
    afficherTravaux(travaux);
}



// Fonction upload de l'image vers l'API
async function uploadImageToAPI(imageFile, title, categoryId) {
    const authToken = localStorage.getItem('authToken');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', title);
    formData.append('category', categoryId);

    try {
        const response = await fetch(`${API_URL}/works`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (response.ok) {
            const newWork = await response.json();
            travaux.push(newWork);         // ajoute le nouveau travail au tableau
            afficherTravaux(travaux);      // met à jour la galerie
            afficherMessage("success", "Image ajoutée avec succès !");
        } else {
            const errorData = await response.json();
            afficherMessage("error", "Échec de l'envoi. Vérifie les champs et réessaie.");
        }

    } catch (error) {
        afficherMessage("error", "Une erreur réseau est survenue.");
    }
}

// Crée une modale pour demander confirmation pour la suppression
async function deleteImage(imageId, imageTitle = "cette image") {
    // Créer une fenêtre modale de confirmation
    const confirmationModal = document.createElement('div');
    confirmationModal.classList.add('confirmation-modal');  // Utilise la classe CSS

    // Contenu de la modale
    const modalContent = document.createElement('div');

    // Texte de confirmation
    const confirmationText = document.createElement('p');
    confirmationText.textContent = `Êtes-vous sûr de vouloir supprimer l'image "${imageTitle}" ?`;

    // Boutons de confirmation
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Non';
    cancelButton.classList.add('cancel-btn');
    cancelButton.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Oui';
    confirmButton.classList.add('confirm-btn');
    confirmButton.addEventListener('click', async () => {

        // Effectuer la suppression de l'image
        const isConfirmed = await supprimerImage(imageId);
        if (isConfirmed) {
            afficherMessage("success", `L'image "${imageTitle}" a été supprimée avec succès !`);
            loadGallery(); // Recharger la galerie après suppression
        } else {
            afficherMessage("error", "Erreur lors de la suppression de l'image.");
        }
        confirmationModal.style.display = 'none';
    });

    // Ajouter les éléments à la modale
    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(cancelButton);

    modalContent.appendChild(confirmationText);
    modalContent.appendChild(buttonContainer);

    confirmationModal.appendChild(modalContent);

    // Ajouter la modale au body
    document.body.appendChild(confirmationModal);

    // Afficher la fenêtre modale
    confirmationModal.style.display = 'block';

    // Fermer la modale si on clique en dehors de celle-ci
    confirmationModal.addEventListener('click', (e) => {
        // Vérifier si le clic vient de l'extérieur de la modale
        if (e.target === confirmationModal) {
            confirmationModal.style.display = 'none'; // Fermer la modale
        }
    });

    // Empêcher la propagation du clic à l'extérieur de la modale
    modalContent.addEventListener('click', (e) => {
        e.stopPropagation();  // Empêche le clic de se propager à confirmationModal
    });
}

// Fonction pour supprimer l'image réellement
async function supprimerImage(imageId) {
    try {
        const response = await fetch(`${API_URL}/works/${imageId}`, {

            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (response.ok) {
            const index = travaux.findIndex(travail => travail.id === imageId);
            if (index !== -1) {
                travaux.splice(index, 1);
                afficherTravaux(travaux);
                return true;
            }
        } else {
            console.error("Erreur de suppression");
            return false;
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
        return false;
    }
}

chargerTravaux();
chargerCategorie();
