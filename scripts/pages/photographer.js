/* FACTORY */

class MediaFactory {
  constructor(data, index) {
        if (data.image) {
            return new ImageMedia(data, index);
        } else if (data.video) {
            return new VideoMedia(data, index);
        } else {
            throw "Format de média inconnu";
        }
    }
}

class Media {
    constructor(data, index) {
        this.id = data.id;
        this.title = data.title;
        this.likes = data.likes;
        this.folderName = data.folderName;
        this.index = index;
    }
}

class ImageMedia extends Media {
    constructor(data, index) {
        super(data, index);
        this.image = data.image;
    }

    getHTML() {
        return `<img src="assets/photographers/${this.folderName}/${this.image}" 
                    alt="${this.title}" 
                    class="media-item"
                    data-index="${this.index}">`;
    }
}

class VideoMedia extends Media {
    constructor(data, index) {
        super(data, index);
        this.video = data.video;
    }

    getHTML() {
        return `<video class="media-item" data-index="${this.index}">
                    <source src="assets/photographers/${this.folderName}/${this.video}" type="video/mp4">
                    Votre navigateur ne supporte pas la vidéo.
                </video>`;
    }
}


let photographerMedia = [];
let currentLightboxIndex = 0;
let currentPhotographer = null;
const likedMediaIds = new Set();

/* FETCH */
function getPhotographerIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"));
}

async function fetchData() {
    const response = await fetch("./data/photographers.json");
    return await response.json();
}

/* AFFICHAGE  */
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
        <aside id="daily-price">
            <span id="total-likes">0 <i class="fas fa-heart"></i></span>
            ${photographer.price}€ / jour
        </aside>`;
}

function updateTotalLikes() {
    const likeSpans = document.querySelectorAll(".likes");
    let total = 0;
    likeSpans.forEach(span => {
        const val = parseInt(span.textContent, 10);
        if (!isNaN(val)) total += val;
    });
    const totalLikesElement = document.getElementById("total-likes");
    if (totalLikesElement) {
        totalLikesElement.innerHTML = `${total} <i class="fas fa-heart"></i>`;
    }
}


function displayMedia(mediaArray, photographer) {
    
    const folderName = photographer.name.split(" ")[0];
    
    photographerMedia = mediaArray.map(m => ({ ...m, folderName }));

    const gallery = document.getElementById("media-gallery");
    gallery.innerHTML = "";

    photographerMedia.forEach((mediaData, index) => {
        
        const mediaModel = new MediaFactory(mediaData, index);
        const mediaElement = document.createElement("article");

        mediaElement.innerHTML = `
            <a href="#" class="media-link" aria-label="${mediaModel.title}, closeup view">
                ${mediaModel.getHTML()}
            </a>
            <div class="media-info">
                <h3>${mediaModel.title}</h3>
                <div class="like-container">
                    <span class="likes">${mediaModel.likes}</span>
                    <button class="like-button" aria-label="Like" data-id="${mediaModel.id}">
                        <i class="${likedMediaIds.has(mediaModel.id) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            </div>`;

        gallery.appendChild(mediaElement);

        // Events
        mediaElement.querySelector(".media-item").addEventListener("click", (e) => {
            e.preventDefault();
            openLightbox(index);
        });

        const likeButton = mediaElement.querySelector(".like-button");
        likeButton.addEventListener("click", () => {
            const spanLikes = mediaElement.querySelector(".likes");
            if (!likedMediaIds.has(mediaData.id)) {
                mediaData.likes++;
                likedMediaIds.add(mediaData.id);
                likeButton.querySelector("i").className = "fas fa-heart";
            } else {
                mediaData.likes--;
                likedMediaIds.delete(mediaData.id);
                likeButton.querySelector("i").className = "far fa-heart";
            }
            spanLikes.textContent = mediaData.likes;
            updateTotalLikes();
        });
    });

    updateTotalLikes();
}

/* TRI */
function sortMediaAndDisplay(criteria) {
    if (criteria === "popularity") {
        photographerMedia.sort((a, b) => b.likes - a.likes);
    } else if (criteria === "date") {
        photographerMedia.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (criteria === "title") {
        photographerMedia.sort((a, b) => a.title.localeCompare(b.title));
    }
    displayMedia(photographerMedia, currentPhotographer);
}

/* LIGHTBOX  */
function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById("lightbox");
    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
    displayLightboxMedia();
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    document.getElementById("lightbox").classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
}

function displayLightboxMedia() {
    const media = photographerMedia[currentLightboxIndex];
    const container = document.getElementById("lightbox-media-container");
    const title = document.getElementById("lightbox-title");
    
    
    const mediaModel = new MediaFactory(media, currentLightboxIndex);
    container.innerHTML = mediaModel.getHTML();
    
    // Si c'est une vidéo, on ajoute les contrôles dans la lightbox
    const video = container.querySelector('video');
    if(video) video.setAttribute("controls", "");
    
    title.textContent = media.title;
}

function showNextMedia() {
    currentLightboxIndex = (currentLightboxIndex + 1) % photographerMedia.length;
    displayLightboxMedia();
}

function showPrevMedia() {
    currentLightboxIndex = (currentLightboxIndex - 1 + photographerMedia.length) % photographerMedia.length;
    displayLightboxMedia();
}


async function init() {
  const photographerId = getPhotographerIdFromUrl();
  const data = await fetchData();
  currentPhotographer = data.photographers.find(p => p.id === photographerId);

    if (currentPhotographer) {
        displayPhotographerInfo(currentPhotographer);
        const mediaArray = data.media.filter(m => m.photographerId === photographerId);
        displayMedia(mediaArray, currentPhotographer);

        const sortSelect = document.getElementById("sort-select");
        if (sortSelect) {
            sortSelect.addEventListener("change", (e) => sortMediaAndDisplay(e.target.value));
        }
    }
}

// Listeners
document.addEventListener("keydown", (e) => {
    if (!document.getElementById("lightbox").classList.contains("show")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNextMedia();
    if (e.key === "ArrowLeft") showPrevMedia();
});

document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
document.querySelector(".lightbox-next").addEventListener("click", showNextMedia);
document.querySelector(".lightbox-prev").addEventListener("click", showPrevMedia);

init();