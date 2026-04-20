import { useState } from 'react';
import { BASE_URL } from '../config';
import ImageModal from './ImageModal';

const ImageSlider = ({ images, className = '', onMediaClick, preferThumbnail = false }) => {
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

    // Resolve media URL from either the thumbnail or full source.
    const getMediaUrl = (media, useThumbnail = false) => {
        if (!media) return '';
        const rawUrl = useThumbnail
            ? (media.thumbnail_url || media.full_url || media.url || media.image || '')
            : (media.full_url || media.url || media.image || '');
        return rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl}`;
    };

    // Calculate indices for preloading adjacent images
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;

    const currentMedia = images[currentIndex];
    const mediaUrl = getMediaUrl(currentMedia, preferThumbnail);
    const nextMediaUrl = getMediaUrl(images[nextIndex], preferThumbnail);
    const prevMediaUrl = getMediaUrl(images[prevIndex], preferThumbnail);
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
                {/* INVISIBLE PRELOADER: Forces browser to download next/prev images in advance */}
                <div style={{ display: 'none' }}>
                    {images.length > 1 && <img src={nextMediaUrl} alt="preload next" />}
                    {images.length > 1 && <img src={prevMediaUrl} alt="preload prev" />}
                </div>

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