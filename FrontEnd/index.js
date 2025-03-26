let travaux = [];

//Définition d'une fonction async pour permettre le fetch une fois que la page est bien chargée
async function chargerTravaux() {
    // On va chercher les travaux sur l'API
    const repWork = await fetch("http://localhost:5678/api/works")
    travaux = await repWork.json()

    afficherTravaux(travaux);

}

async function afficherTravaux(travaux) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';  // On vide la galerie avant de la remplir

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

async function filtrerTravauxParCategorie(categorie) {
    const travauxFiltres = travaux.filter(travail => travail.category.name === categorie);
    afficherTravaux(travauxFiltres);
}

// Fonction pour charger les catégories depuis l'API
async function chargerCategorie() {

    // On va chercher les travaux sur l'API   
    const repCat = await fetch("http://localhost:5678/api/categories")
    const category = await repCat.json()

    // Cibler les boutons de filtrage
    const btnTous = document.querySelector('.btnTous');
    btnTous.addEventListener("click", function () {
        afficherTravaux(travaux);
    });

    const btnObjet = document.querySelector('.btnObjet');
    btnObjet.addEventListener("click", function () {
        filtrerTravauxParCategorie('Objets');
    });

    const btnApp = document.querySelector('.btnApp');
    btnApp.addEventListener("click", function () {
        filtrerTravauxParCategorie('Appartements');
    });
    const btnHotel = document.querySelector('.btnHotel');
    btnHotel.addEventListener("click", function () {
        filtrerTravauxParCategorie('Hotels & restaurants');
    });




}

chargerTravaux()
chargerCategorie()