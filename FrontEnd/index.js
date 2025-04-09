let travaux = [];

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

// Supprime le bandeau d'édition s'il existe
const editionBanner = document.querySelector('div[style*="Mode édition"]');
if (editionBanner) {
    editionBanner.remove();
}


// Cette fonction génère un bouton avec une certaine classe et un comportement de filtrage
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

// Charger les travaux depuis l'API
async function chargerTravaux() {
    const repWork = await fetch("http://localhost:5678/api/works");
    travaux = await repWork.json();
    afficherTravaux(travaux);
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

async function chargerCategorie() {
    if (isConnected) {
        // Si l'utilisateur est connecté, on ne montre pas les filtres
        const containerBoutons = document.querySelector('.boutons-filtre');
        if (containerBoutons) {
            containerBoutons.innerHTML = "";
            containerBoutons.style.display = 'none';
        }
        return;
    }

    const repCat = await fetch("http://localhost:5678/api/categories");
    const categories = await repCat.json();

    const containerBoutons = document.querySelector('.boutons-filtre');
    containerBoutons.innerHTML = "";
    containerBoutons.style.display = 'flex'; // Ou 'block', selon ton design

    const btnTous = genererBouton({ name: "Tous", id: "all" }, "btn-filtre", "active");
    btnTous.classList.add("active");
    containerBoutons.appendChild(btnTous);
    btnTous.click();

    categories.forEach(category => {
        const btn = genererBouton(category);
        containerBoutons.appendChild(btn);
    });
}

async function uploadImageToAPI(imageFile, title, categoryId) {
    const authToken = localStorage.getItem('authToken');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', title);
    formData.append('category', categoryId);

    try {
        const response = await fetch('http://localhost:5678/api/works', {
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
            alert("Image ajoutée avec succès !");
        } else {
            const errorData = await response.json();
            console.error("Erreur lors de l'envoi :", errorData);
            alert("Échec de l'envoi. Vérifie les champs et réessaie.");
        }

    } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Une erreur est survenue lors de l'envoi.");
    }
}

async function deleteImage(imageId, imageTitle = "cette image") {
    const isConfirmed = confirm(`Voulez-vous vraiment supprimer "${imageTitle}" ?`);

    if (!isConfirmed) return;

    try {
        const response = await fetch(`http://localhost:5678/api/works/${imageId}`, {
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
            }

            if (typeof loadGallery === "function") {
                loadGallery();
            }

        } else {
            alert("Erreur lors de la suppression de l'image.");
        }
    } catch (error) {
        console.error("Erreur de suppression:", error);
        alert("Une erreur est survenue lors de la suppression de l'image.");
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
    const isConnectedNow = localStorage.getItem('isConnected') === 'true';

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

chargerTravaux();
chargerCategorie();
