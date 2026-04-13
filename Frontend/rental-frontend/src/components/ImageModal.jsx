import { useState, useEffect } from 'react';
import { BASE_URL } from '../config';

const ImageModal = ({ isOpen, mediaUrl, mediaType, onClose, images, currentIndex, onNavigate }) => {
    const [index, setIndex] = useState(currentIndex || 0);

    useEffect(() => {
        setIndex(currentIndex || 0);
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, index]);

    const handlePrevious = () => {
        const newIndex = index === 0 ? images.length - 1 : index - 1;
        setIndex(newIndex);
        if (onNavigate) onNavigate(newIndex);
    };

    const handleNext = () => {
        const newIndex = index === images.length - 1 ? 0 : index + 1;
        setIndex(newIndex);
        if (onNavigate) onNavigate(newIndex);
    };

    if (!isOpen) return null;

    const currentMedia = images[index];
    const currentMediaUrl = (currentMedia.url || currentMedia.image || '').startsWith('http')
        ? (currentMedia.url || currentMedia.image)
        : `${BASE_URL}${currentMedia.url || currentMedia.image}`;
    const isVideo = currentMedia.media_type === 'VIDEO';

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={onClose}></div>

            {/* Modal Container */}
            <div className="image-modal">
                {/* Close Button */}
                <button className="modal-close" onClick={onClose} title="Close (ESC)">✕</button>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        <button className="modal-nav modal-nav-prev" onClick={handlePrevious} title="Previous (←)">
                            ❮
                        </button>
                        <button className="modal-nav modal-nav-next" onClick={handleNext} title="Next (→)">
                            ❯
                        </button>
                    </>
                )}

                {/* Media Container */}
                <div className="modal-media-container">
                    {isVideo ? (
                        <video
                            src={currentMediaUrl}
                            controls
                            preload="metadata"
                            className="modal-media"
                            autoPlay
                        />
                    ) : (
                        <img
                            src={currentMediaUrl}
                            alt="Full view"
                            className="modal-media"
                        />
                    )}
                </div>

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="modal-counter">
                        {index + 1} / {images.length}
                    </div>
                )}

                {/* Dots Navigation */}
                {images.length > 1 && (
                    <div className="modal-dots">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                className={`modal-dot ${idx === index ? 'active' : ''}`}
                                onClick={() => {
                                    setIndex(idx);
                                    if (onNavigate) onNavigate(idx);
                                }}
                                title={`Image ${idx + 1}`}
                            ></button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default ImageModal;
