let currentSlide = 0;
const products = [
    { imageUrl: 'images/Cleanser-scaled.webp', description: 'Product 1 Description' },
    { imageUrl: 'images/bhringraj-oil.jpg', description: 'Product 2 Description' },
    { imageUrl: 'images/gh-best-skincare-products-6557978b58b57.png', description: 'Product 3 Description' },
    { imageUrl: 'images/mixedNew_93b59dc4-59a8-4169-a7d7-916b31ff6b3a.webp', description: 'Product 4 Description' }
];

function renderCarousel() {
    const carouselInner = document.getElementById('carousel-inner');
    carouselInner.innerHTML = ''; // Clear existing content

    products.forEach((product, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) {
            carouselItem.classList.add('active'); // Make the first item active
        }

        carouselItem.innerHTML = `
            <img src="${product.imageUrl}" alt="Product ${index + 1}">
            <div class="carousel-caption">${product.description}</div>
        `;
        carouselInner.appendChild(carouselItem);
    });
}

// Call this function to render the carousel when the page loads
renderCarousel();

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-item');
    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }
    slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentSlide) * 100}%)`;
    });
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

// Initialize the carousel
showSlide(currentSlide);

// Auto-slide functionality
setInterval(nextSlide, 5000);
