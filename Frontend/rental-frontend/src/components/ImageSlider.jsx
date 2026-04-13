import { useState } from 'react';
import { BASE_URL } from '../config';
import ImageModal from './ImageModal';

const ImageSlider = ({ images, className = '', onMediaClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!images || images.length === 0) {
        return <div className={`slider ${className}`.trim()} style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>No Images</div>;
    }

    const goToPrevious = (e) => {
        e.preventDefault();
        setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    };

    const goToNext = (e) => {
        e.preventDefault();
        setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    };

    const currentMedia = images[currentIndex];
    const mediaUrl = (currentMedia.url || currentMedia.image || '').startsWith('http')
        ? (currentMedia.url || currentMedia.image)
        : `${BASE_URL}${currentMedia.url || currentMedia.image}`;
    const isVideo = currentMedia.media_type === 'VIDEO';

    const handleMediaClick = () => {
        if (onMediaClick) {
            onMediaClick();
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div className={`slider ${className}`.trim()}>
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

                {isVideo ? (
                    <video
                        src={mediaUrl}
                        controls
                        preload="metadata"
                        className={`slider-media ${onMediaClick ? 'slider-media-clickable' : 'slider-media-clickable'}`.trim()}
                        onClick={handleMediaClick}
                    />
                ) : (
                    <img
                        src={mediaUrl}
                        alt="Property"
                        className={`slider-media ${onMediaClick ? 'slider-media-clickable' : 'slider-media-clickable'}`.trim()}
                        onClick={handleMediaClick}
                    />
                )}
            </div>

            <ImageModal
                isOpen={isModalOpen}
                mediaUrl={mediaUrl}
                mediaType={isVideo ? 'VIDEO' : 'IMAGE'}
                onClose={() => setIsModalOpen(false)}
                images={images}
                currentIndex={currentIndex}
                onNavigate={setCurrentIndex}
            />
        </>
    );
};

export default ImageSlider;