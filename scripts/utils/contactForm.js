// eslint-disable-next-line no-unused-vars
function displayModal() {
    const modal = document.getElementById("contact_modal");
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
    const modal = document.getElementById("contact_modal");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
}

// Gestion de la soumission du formulaire
function handleFormSubmit(event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    console.log("Formulaire soumis :");
    console.log("Prénom :", firstName);
    console.log("Nom :", lastName);
    console.log("Email :", email);
    console.log("Message :", message);

    alert("Message envoyé !");
    closeModal();

    // Optionnel : reset du formulaire après soumission
    document.getElementById("contact-form").reset();
}

// Ferme la modale avec la touche Escape
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeModal();
    }
});

// Ajout des écouteurs une fois le DOM chargé
document.addEventListener("DOMContentLoaded", () => {
    // Bouton fermeture modale
    const closeBtn = document.getElementById("close-contact-modal");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    // Soumission du formulaire
    const form = document.getElementById("contact-form");
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }
});
