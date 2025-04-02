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

// Charger les catégories et générer les boutons dynamiquement
async function chargerCategorie() {
    const repCat = await fetch("http://localhost:5678/api/categories");
    const categories = await repCat.json();

    const containerBoutons = document.querySelector('.boutons-filtre');
    containerBoutons.innerHTML = ""; // Vide le conteneur avant d'ajouter les boutons

    // Créer le bouton "Tous"
    const btnTous = genererBouton({ name: "Tous", id: "all" }, "btn-filtre", "active");
    btnTous.classList.add("active");
    containerBoutons.appendChild(btnTous);
    btnTous.click();

    // Créer les boutons des catégories
    categories.forEach(category => {
        const btn = genererBouton(category);
        containerBoutons.appendChild(btn);
    });
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
            modifierLink.href = "#"; // Il peut être lié à une action ou une autre page

            // Ajoute une icône de stylo de Font Awesome à l'intérieur du lien
            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-pen-to-square'); // Font Awesome classe pour l'icône du stylo
            modifierLink.appendChild(icon);

            // Ajouter le texte "Modifier" après l'icône
            const text = document.createElement('span');
            text.textContent = 'modifier';
            modifierLink.appendChild(text);

            // Ajoute le lien à la section "Mes Projets"
            portfolioSection.appendChild(modifierLink);
        }
    }

    // Si la page actuelle est "login.html", on ajoute la classe "active" au lien "login"
    const loginLink = document.getElementById('login-link');
    if (window.location.pathname.includes('login.html')) {
        loginLink.classList.add('active');
    }

    // Si la page actuelle est "index.html", on enlève la soulignure du lien "Login"
    if (window.location.pathname.includes('index.html')) {
        loginLink.classList.add('no-underline');
    }
});

chargerTravaux();
chargerCategorie();
