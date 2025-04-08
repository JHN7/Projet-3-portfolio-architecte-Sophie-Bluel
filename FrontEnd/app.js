// Initialisation des variables
let modal = null;
let fileInput = null;
let validateBtn = null;
let selectedImageContainer = null;
let errorMessage = null;

const openModal = (e) => {
    e.preventDefault();
    modal = document.getElementById('modal-gallery');
    modal.style.display = "flex";
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');

    // Affiche la vue galerie
    showGalleryView();

    modal.addEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-wrapper').addEventListener('click', (e) => e.stopPropagation());

    // Bouton "Ajouter une photo" (ouvre la deuxième modale)
    modal.querySelector('.add-photo-btn').addEventListener('click', showUploadView);

    // Bouton "Retour"
    modal.querySelector('.js-modal-back').addEventListener('click', showGalleryView);
};

const closeModal = (e) => {
    if (modal === null) return;
    e.preventDefault();
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal = null;

    // Réinitialiser les champs et masquer le message d'erreur
    resetForm();
};

// Afficher la galerie dans la modale
async function loadGallery() {
    const response = await fetch("http://localhost:5678/api/works");
    const travaux = await response.json();
    const galleryContainer = document.querySelector('.modal-gallery');
    galleryContainer.innerHTML = "";

    travaux.forEach(travail => {
        const container = document.createElement('div');
        container.classList.add('image-container');

        const img = document.createElement('img');
        img.src = travail.imageUrl;
        img.alt = travail.title;

        const trashIcon = document.createElement('i');
        trashIcon.classList.add('fa-solid', 'fa-trash', 'trash-icon');
        trashIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            alert(`Supprimer l'image : ${travail.title}`);
        });

        container.appendChild(img);
        container.appendChild(trashIcon);
        galleryContainer.appendChild(container);
    });
}

// Fonction qui vérifie la validité des champs
function checkFormValidity() {
    const title = document.getElementById('upload-title').value;
    const category = document.getElementById('upload-category').value;
    const file = fileInput.files.length > 0;  // Vérifie si un fichier est sélectionné

    // Vérifier si tous les champs sont remplis et qu'un fichier est sélectionné
    if (title && category && file) {
        // Si tous les champs sont valides, activer le bouton "Valider"
        validateBtn.style.backgroundColor = '#1d6154';
        validateBtn.style.cursor = 'pointer';
    } else {
        // Si un des champs est vide, désactiver le bouton "Valider"
        validateBtn.style.backgroundColor = '#cbd6dc';
        validateBtn.style.cursor = 'not-allowed';

    }

    // Afficher ou masquer le message d'erreur
    if (!title || !category || !file) {
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
}



// Vue Galerie
function showGalleryView() {
    document.querySelector('.modal-gallery-view').style.display = 'block';
    document.querySelector('.modal-upload-view').style.display = 'none';
    loadGallery();
}

// Afficher la vue Upload
async function showUploadView() {
    document.querySelector('.modal-gallery-view').style.display = 'none';
    const galleryContainer = document.querySelector('.modal-gallery');
    galleryContainer.innerHTML = "";  // Vide le contenu de la galerie
    document.querySelector('.modal-upload-view').style.display = 'block';

    // Charger les catégories pour le formulaire d'upload
    await loadCategories();

    fileInput = document.getElementById('file-input');
    validateBtn = document.querySelector('.validate-btn');
    errorMessage = document.getElementById('error-message');
    selectedImageContainer = document.getElementById('selected-image-container');

    validateBtn.style.backgroundColor = '#cbd6dc';  // Couleur gris au début

    // Ajouter l'événement de clic sur le bouton "+ Ajouter photo"
    const addPhotoButton = document.querySelector('.upload-btn');
    addPhotoButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Ajouter l'événement au champ file pour afficher l'image sélectionnée
    fileInput.addEventListener('change', handleFileSelect);

    // Ajouter l'événement pour vérifier la validité des champs lorsque l'utilisateur modifie un champ
    document.getElementById('upload-title').addEventListener('input', checkFormValidity);
    document.getElementById('upload-category').addEventListener('change', checkFormValidity);

    // Écouter l'événement du bouton "Valider"
    validateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        checkFormValidity();  // Vérifier encore la validité avant la soumission
    });
}

// Fonction pour afficher l'aperçu de l'image sélectionnée
function handleFileSelect(event) {
    const file = event.target.files[0];  // Récupère le premier fichier sélectionné

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            // Créer une image et l'ajouter au conteneur
            const imgElement = document.createElement('img');
            imgElement.src = e.target.result; // URL de l'image
            imgElement.alt = "Image sélectionnée";

            // Effacer le texte d'origine dans la div .upload-container
            const uploadContainer = document.querySelector('.upload-container');
            uploadContainer.innerHTML = '';  // Supprimer le texte (et l'icône) dans .upload-container

            // Ajouter l'image dans la div
            uploadContainer.appendChild(imgElement);

            // Vérifier la validité des champs après l'ajout de l'image
            checkFormValidity();
        };

        // Lire l'image comme une URL de données (base64)
        reader.readAsDataURL(file);
    }
}

// Réinitialiser les champs et masquer le message d'erreur
function resetForm() {
    document.getElementById('upload-title').value = '';
    document.getElementById('upload-category').value = '';
    fileInput.value = '';
    validateBtn.style.backgroundColor = '#cbd6dc';
    errorMessage.style.display = 'none';
}

// Charger les catégories pour le <select>
async function loadCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();
    const select = document.getElementById('upload-category');
    select.innerHTML = "";

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}
