// eslint-disable-next-line no-unused-vars
function photographerTemplate(data) {
    const { name, portrait, city, country, tagline, price  } = data;

    const picture = `assets/images/photographersID/${portrait}`;

    function getUserCardDOM() {
        const article = document.createElement( 'article' );

        const link = document.createElement( 'a' );
        link.setAttribute("href", "photographer.html?id=" + data.id);
        link.setAttribute("aria-label", name);

        const img = document.createElement( 'img' );
        img.setAttribute("src", picture)

        const h2 = document.createElement( 'h2' );
        h2.textContent = name;

        const location = document.createElement('p');
        location.textContent = city + ", " + country;
        
        location.classList.add("location")

        const tag = document.createElement('p');
        tag.textContent = tagline;
        tag.classList.add("tagline")

        const priceTag = document.createElement('p');
        priceTag.textContent = price + "€/jour";
        priceTag.classList.add("price")
        tag.appendChild(priceTag)  

        link.appendChild(img);
        link.appendChild(h2);
        article.appendChild(link);
        article.appendChild(location);
        article.appendChild(tag);
        article.appendChild(priceTag);

        return (article);
    }
    return { name, picture, getUserCardDOM }
}

