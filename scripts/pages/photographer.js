  
    let photographerMedia = []; 
    let currentLightboxIndex = 0;
    const likedMediaIds = new Set();

// Récupère l'ID du photographe depuis l'URL
function getPhotographerIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("id"));
}

// Récupère les données JSON
async function fetchData() {
  const response = await fetch("./data/photographers.json");
  const data = await response.json();
  return data;
}

// Affiche les infos du photographe (en haut de la page)
function displayPhotographerInfo(photographer) {
  const header = document.getElementById("photographer-header");

  header.innerHTML = `
      <div class="photographer-info">
                       <h1>${photographer.name}</h1>
                        <p>${photographer.city}, ${photographer.country}</p>
                     <p>${photographer.tagline}</p>
                  </div>
                <button class="contact_button" onclick="displayModal()">Contactez-moi</button>
                 <img src="assets/images/photographersID/${photographer.portrait}" alt="${photographer.name}">
                
                <aside>
                    <span id="daily-price">
                    <span id="total-likes">0 <i class="fas fa-heart"></i></span>
                    ${photographer.price}€ / jour
                  </span>
                </aside>
        `;
        
}


// Nouvelle version : lit les likes du DOM pour totaliser
function updateTotalLikes() {
  const likeSpans = document.querySelectorAll(".likes");
  let total = 0;
  likeSpans.forEach(span => {
    const val = parseInt(span.textContent, 10);
    if (!isNaN(val)) {
      total += val;
    }
  });
  const totalLikesElement = document.getElementById("total-likes");
  if (totalLikesElement) {
    totalLikesElement.innerHTML = `${total} <i class="fas fa-heart"></i>`;
  }
}

function displayMedia(mediaArray, photographer) {
  photographerMedia = mediaArray.map(media => ({
    ...media,
    folderName: photographer.name.split(" ")[0]
  }));

  const gallery = document.getElementById("media-gallery");
  gallery.innerHTML = "";

  photographerMedia.forEach((media, index) => {
    const mediaElement = document.createElement("article");

    let mediaContent = "";
    if (media.image) {
      mediaContent = `
        <img src="assets/photographers/${media.folderName}/${media.image}" 
             alt="${media.title}" 
             class="media-item"
             data-index="${index}">
      `;
    } else if (media.video) {
      mediaContent = `
        <video class="media-item" data-index="${index}">
          <source src="assets/photographers/${media.folderName}/${media.video}" type="video/mp4">
          Votre navigateur ne supporte pas la vidéo.
        </video>
      `;
    }

    mediaElement.innerHTML = `
      <a href="#" class="media-link">
        ${mediaContent}
      </a>
      <div class="media-info">
        <h3>${media.title}</h3>
        <div class="like-container">
          <span class="likes" data-id="${media.id}">${media.likes}</span>
          <button class="like-button" aria-label="Like" data-id="${media.id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
    `;

    gallery.appendChild(mediaElement);

    // Lightbox
    const clickable = mediaElement.querySelector(".media-item");
    clickable.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = parseInt(clickable.dataset.index, 10);
      openLightbox(idx);
    });

    // Like button listener
    const likeButton = mediaElement.querySelector(".like-button");
    likeButton.addEventListener("click", () => {
      const spanLikes = mediaElement.querySelector(".likes");
      let currentLikes = parseInt(spanLikes.textContent, 10);

      if (!likedMediaIds.has(media.id)) {
        currentLikes += 1;
        likedMediaIds.add(media.id);
        likeButton.querySelector("i").classList.replace("far", "fas");
      } else {
        currentLikes -= 1;
        likedMediaIds.delete(media.id);
        likeButton.querySelector("i").classList.replace("fas", "far");
      }

      // Mettre à jour le DOM du span
      spanLikes.textContent = currentLikes;

      // Mettre à jour media.likes si tu veux que le tri par popularité reflète les likes
      media.likes = currentLikes;

      updateTotalLikes();
    });
  });

  // Une fois tous les médias affichés, initialiser le total
  updateTotalLikes();
}

async function init() {
  const photographerId = getPhotographerIdFromUrl();
  const data = await fetchData();

  const photographer = data.photographers.find(p => p.id === photographerId);
  if (!photographer) {
    console.error("Photographe non trouvé");
    return;
  }

  displayPhotographerInfo(photographer);

  const mediaArray = data.media.filter(m => m.photographerId === photographerId);
  displayMedia(mediaArray, photographer);

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      sortMediaAndDisplay(this.value);
    });
  }
}

init();

function sortMediaAndDisplay(criteria) {
  let sortedMedia = [...photographerMedia]; // clone du tableau original

  switch(criteria) {
    case "popularity":
      sortedMedia.sort((a, b) => b.likes - a.likes);
      break;
    case "date":
      sortedMedia.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "title":
      sortedMedia.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  displayMedia(sortedMedia, currentPhotographer);
  updateTotalLikes(sortedMedia);
}


function openLightbox(index) {
  currentLightboxIndex = index;
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.add("show");
  lightbox.setAttribute("aria-hidden", "false");
  displayLightboxMedia();
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("show");
  lightbox.setAttribute("aria-hidden", "true");
}

function showNextMedia() {
  currentLightboxIndex = (currentLightboxIndex + 1) % photographerMedia.length;
  displayLightboxMedia();
}

function showPrevMedia() {
  currentLightboxIndex = (currentLightboxIndex - 1 + photographerMedia.length) % photographerMedia.length;
  displayLightboxMedia();
}

function displayLightboxMedia() {
  const media = photographerMedia[currentLightboxIndex];
  const container = document.getElementById("lightbox-media-container");
  const title = document.getElementById("lightbox-title");

  container.innerHTML = "";

  let mediaElement;

  if (media.image) {
    mediaElement = document.createElement("img");
    mediaElement.src = `assets/photographers/${media.folderName}/${media.image}`;
    mediaElement.alt = media.title;
  } else if (media.video) {
    mediaElement = document.createElement("video");
    mediaElement.controls = true;
    mediaElement.innerHTML = `
      <source src="assets/photographers/${media.folderName}/${media.video}" type="video/mp4">
      Votre navigateur ne prend pas en charge la vidéo HTML5.
    `;
  }

  container.appendChild(mediaElement);
  title.textContent = media.title;
}

// Événements clavier
document.addEventListener("keydown", (e) => {
  const isOpen = document.getElementById("lightbox").classList.contains("show");
  if (!isOpen) return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") showNextMedia();
  if (e.key === "ArrowLeft") showPrevMedia();
});

// Boutons
document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
document.querySelector(".lightbox-next").addEventListener("click", showNextMedia);
document.querySelector(".lightbox-prev").addEventListener("click", showPrevMedia);



let currentPhotographer = null;
// Initialisation de la page

init();

