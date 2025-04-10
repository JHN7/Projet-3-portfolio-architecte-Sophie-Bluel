// Initialisation des variables
let modal = null;
let fileInput = null;
let validateBtn = null;
let selectedImageContainer = null;
let uploadButtonEventAttached = false;


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

    // Réinitialiser
    // les champs et masquer le message d'erreur
    resetForm();

    // Si on ferme la modale, on reload la page
    // location.reload()
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
            deleteImage(travail.id, travail.title);
        });

        container.appendChild(img);
        container.appendChild(trashIcon);
        galleryContainer.appendChild(container);
    });
}

// Fonction qui vérifie la validité des champs
function checkFormValidity(showError = false) {
    const title = document.getElementById('upload-title').value;
    const category = document.getElementById('upload-category').value;
    const file = fileInput.files.length > 0;

    const isValid = title && category && file;

    if (isValid) {
        validateBtn.style.backgroundColor = '#1d6154';
        validateBtn.style.cursor = 'pointer';
    } else {
        validateBtn.style.backgroundColor = '#cbd6dc';
    }
}



// Vue Galerie
function showGalleryView() {
    document.querySelector('.modal-gallery-view').style.display = 'block';
    document.querySelector('.modal-upload-view').style.display = 'none';
    resetForm();
    loadGallery();
}

// Afficher la vue Upload
async function showUploadView() {
    document.querySelector('.modal-gallery-view').style.display = 'none';
    const galleryContainer = document.querySelector('.modal-gallery');
    galleryContainer.innerHTML = "";
    document.querySelector('.modal-upload-view').style.display = 'flex';

    // Charger les catégories pour le formulaire d'upload
    await loadCategories();

    fileInput = document.getElementById('file-input');
    validateBtn = document.querySelector('.validate-btn');
    selectedImageContainer = document.getElementById('selected-image-container');

    validateBtn.style.backgroundColor = '#cbd6dc';

    // Ajouter l'événement de clic sur le bouton "+ Ajouter photo" UNE SEULE FOIS
    const addPhotoButton = document.querySelector('.upload-btn');
    if (!uploadButtonEventAttached) {
        addPhotoButton.addEventListener('click', () => {
            fileInput.click();
        });
        uploadButtonEventAttached = true;
    }

    // Ajouter l'événement au champ file pour afficher l'image sélectionnée
    fileInput.addEventListener('change', handleFileSelect);

    document.getElementById('upload-title').addEventListener('input', checkFormValidity);
    document.getElementById('upload-category').addEventListener('input', checkFormValidity);
    document.getElementById('file-input').addEventListener('change', checkFormValidity);

    // Écouter l'événement du bouton "Valider"
    validateBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const title = document.getElementById('upload-title').value;
        const categoryId = document.getElementById('upload-category').value;
        const file = fileInput.files[0];

        const isValid = title && categoryId && file;

        if (!isValid) {
            checkFormValidity(true);
            return;
        }

        // Appel de la fonction d'envoi à l'API
        await uploadImageToAPI(file, title, categoryId);

        // Réinitialise le formulaire
        resetForm();

        // Reviens à la galerie
        showGalleryView();
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
            uploadContainer.innerHTML = '';

            // Ajouter l'image dans la div
            uploadContainer.appendChild(imgElement);

        };

        // Lire l'image comme une URL de données (base64)
        reader.readAsDataURL(file);
    }
}

// Réinitialiser les champs et masquer le message d'erreur
function resetForm() {
    const titleInput = document.getElementById('upload-title');
    const categorySelect = document.getElementById('upload-category');
    const fileInput = document.getElementById('file-input');


    titleInput.value = '';
    categorySelect.value = '';
    fileInput.value = '';

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


