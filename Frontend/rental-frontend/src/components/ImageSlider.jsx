import { useState } from 'react';

const ImageSlider = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return <div className="slider" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>No Images</div>;
    }

    const goToPrevious = (e) => {
        e.preventDefault();
        setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    };

    const goToNext = (e) => {
        e.preventDefault();
        setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    };

    return (
        <div className="slider">
            {images.length > 1 && (
                <>
                    <button className="slider-arrow left" onClick={goToPrevious}>❮</button>
                    <button className="slider-arrow right" onClick={goToNext}>❯</button>

                    <div className="slider-dots">
                        {images.map((_, idx) => (
                            <div key={idx} className={`slider-dot ${idx === currentIndex ? 'active' : ''}`}></div>
                        ))}
                    </div>
                </>
            )}

            <img 
                src={images[currentIndex].image.startsWith('http') 
                    ? images[currentIndex].image 
                    : `https://onegb.co.ke/backend/${images[currentIndex].image}`
                } 
                alt="Property" 
            />
        </div>
    );
};

export default ImageSlider;