let modal = null;

const openModal = function (e) {
    e.preventDefault();
    modal = document.getElementById('modal-gallery');
    modal.style.display = "flex";
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');
    loadGallery(); // Charge les images à l'ouverture

    modal.addEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-wrapper').addEventListener('click', (e) => e.stopPropagation());
};

const observer = new MutationObserver((mutations, obs) => {
    const editButton = document.querySelector('.modifier-link');
    if (editButton) {
        editButton.addEventListener('click', openModal);
        console.log("✅ Bouton Modifier détecté et event listener ajouté !");
        obs.disconnect(); // On arrête d'observer après avoir trouvé l'élément
    }
});

// Observer les changements dans `#portfolio`
observer.observe(document.body, { childList: true, subtree: true });

const closeModal = function (e) {
    if (modal === null) return;
    e.preventDefault();
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal = null;
};

async function loadGallery() {
    const response = await fetch("http://localhost:5678/api/works");
    const travaux = await response.json();
    const galleryContainer = document.querySelector('.modal-gallery');
    galleryContainer.innerHTML = ""; // Vide la galerie avant d'ajouter les nouvelles images

    travaux.forEach(travail => {
        // Crée un conteneur pour l'image + icône poubelle
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');

        // Crée l'image
        const img = document.createElement('img');
        img.src = travail.imageUrl;
        img.alt = travail.title;

        // Crée l'icône poubelle
        const trashIcon = document.createElement('i');
        trashIcon.classList.add('fa-solid', 'fa-trash', 'trash-icon');

        // Ajoute un événement pour la suppression de l'image
        trashIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            alert(`Supprimer l'image : ${travail.title}`);
            // Ici, ajoutez la logique de suppression via l'API si nécessaire
        });

        // Ajoute l'image et l'icône poubelle au conteneur
        imageContainer.appendChild(img);
        imageContainer.appendChild(trashIcon);

        // Ajoute le conteneur d'image à la galerie
        galleryContainer.appendChild(imageContainer);
    });
}


// Ajout de l'événement sur le bouton pour ouvrir la modale
document.querySelector('.js-modal').addEventListener('click', openModal);
