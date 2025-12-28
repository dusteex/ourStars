import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from '../types';
import './StarModal.css';

interface StarModalProps {
  star: Star;
  onClose: () => void;
}

export default function StarModal({ star, onClose }: StarModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? star.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === star.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      const handleError = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-button" onClick={onClose}>
            ×
          </button>

          <div className="modal-header">
            <h2>{star.name}</h2>
            <p className="star-date">{star.date}</p>
          </div>

          <div className="modal-body">
            <p className="star-description">{star.description}</p>

            {star.images.length > 0 && (
              <div className="image-gallery">
                {star.images.length > 1 && (
                  <button
                    className="gallery-nav prev"
                    onClick={handlePreviousImage}
                    aria-label="Предыдущее изображение"
                  >
                    ‹
                  </button>
                )}
                <div className="gallery-image-container">
                  <img
                    src={
                      star.images[currentImageIndex]}
                    alt={`${star.name} - изображение ${currentImageIndex + 1}`}
                    className="gallery-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EИзображение не загружено%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {star.images.length > 1 && (
                    <div className="image-counter">
                      {currentImageIndex + 1} / {star.images.length}
                    </div>
                  )}
                </div>
                {star.images.length > 1 && (
                  <button
                    className="gallery-nav next"
                    onClick={handleNextImage}
                    aria-label="Следующее изображение"
                  >
                    ›
                  </button>
                )}
              </div>
            )}

            {star.audioUrl && (
              <div className="audio-player">
                <audio ref={audioRef} src={star.audioUrl} />
                <button
                  className="audio-button"
                  onClick={handlePlayAudio}
                >
                  {isPlaying ? '⏸️ Пауза' : '▶️ Воспроизвести'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

