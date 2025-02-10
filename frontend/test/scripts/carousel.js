class ImageCarousel {
    constructor(container, images) {
        this.container = container;
        this.images = images;
        this.currentIndex = 0;
        this.createCarousel();
    }

    createCarousel() {
        // Create carousel container
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-container';

        // Create slides
        this.images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            const img = document.createElement('img');
            img.src = image;
            img.alt = `Slide ${index + 1}`;
            slide.appendChild(img);
            carouselContainer.appendChild(slide);
        });

        // Create navigation buttons
        const prevButton = document.createElement('button');
        prevButton.className = 'carousel-nav carousel-prev';
        prevButton.innerHTML = '❮';
        prevButton.onclick = () => this.navigate(-1);

        const nextButton = document.createElement('button');
        nextButton.className = 'carousel-nav carousel-next';
        nextButton.innerHTML = '❯';
        nextButton.onclick = () => this.navigate(1);

        // Create dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';
        this.images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.onclick = () => this.goToSlide(index);
            dotsContainer.appendChild(dot);
        });

        carouselContainer.appendChild(prevButton);
        carouselContainer.appendChild(nextButton);
        carouselContainer.appendChild(dotsContainer);

        this.container.appendChild(carouselContainer);
    }

    navigate(direction) {
        const slides = this.container.querySelectorAll('.carousel-slide');
        const dots = this.container.querySelectorAll('.carousel-dot');
        
        slides[this.currentIndex].classList.remove('active');
        dots[this.currentIndex].classList.remove('active');
        
        this.currentIndex = (this.currentIndex + direction + slides.length) % slides.length;
        
        slides[this.currentIndex].classList.add('active');
        dots[this.currentIndex].classList.add('active');
    }

    goToSlide(index) {
        const slides = this.container.querySelectorAll('.carousel-slide');
        const dots = this.container.querySelectorAll('.carousel-dot');
        
        slides[this.currentIndex].classList.remove('active');
        dots[this.currentIndex].classList.remove('active');
        
        this.currentIndex = index;
        
        slides[this.currentIndex].classList.add('active');
        dots[this.currentIndex].classList.add('active');
    }
}
