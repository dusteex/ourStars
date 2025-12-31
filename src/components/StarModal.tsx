import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from '../types';
import './StarModal.css';
import SoundMessage from '../components/SoundMessage/SoundMessage';
import CircleMessage from '../components/CircleMessage/CircleMessage';
import audioSrc from '../data/msg.mp4';

// Импорты Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, FreeMode, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
import { formatDate } from '../utils/formatDate';

interface StarModalProps {
  star: Star;
  onClose: () => void;
}

export default function StarModal({ star, onClose }: StarModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          closeFullscreen();
        } else {
          onClose();
        }
      }
    };

    // Блокируем скролл на body
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscape);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [onClose, isFullscreen]);

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

  // Открытие полноэкранного просмотра
  const openFullscreen = (index: number) => {
    setActiveImageIndex(index);
    setIsFullscreen(true);
    document.body.style.overflow = 'hidden';
  };

  // Закрытие полноэкранного просмотра
  const closeFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = 'auto';
  };

  // Переключение изображений в полноэкранном режиме
  const nextImage = () => {
    setActiveImageIndex((prev) =>
      prev === star.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setActiveImageIndex((prev) =>
      prev === 0 ? star.images.length - 1 : prev - 1
    );
  };

  // Закрытие по клику вне модалки
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Обработчик для клавиатуры в полноэкранном режиме
  useEffect(() => {
    const handleFullscreenKeydown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === 'ArrowRight') {
          nextImage();
        } else if (e.key === 'ArrowLeft') {
          prevImage();
        }
      }
    };

    window.addEventListener('keydown', handleFullscreenKeydown);
    return () => window.removeEventListener('keydown', handleFullscreenKeydown);
  }, [isFullscreen]);

  return (
    <>
      {/* Основная модалка */}
        {(
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
          >
            <motion.div
              ref={modalRef}
              className="modal-container"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{
                y: '100%',
                transition: {
                  duration: 0.3,
                  ease: "easeInOut"
                }
              }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300
              }}
            >
              {/* Кнопка закрытия сверху справа */}
              <motion.button
                className="modal-close-button"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>

              <div className="modal-content">
                {/* Хедер с заголовком */}
                <div className="modal-header">
                  <h2>{star.name}</h2>
                  <p className="star-date">{formatDate(star.date)}</p>
                </div>

                {/* Контентная область */}
                <div className="modal-body">
                  {/* Описание */}
                  {star.description && (
                    <p className="star-description">{star.description}</p>
                  )}

                  {/* Галерея изображений с Swiper */}
                  {!!star.images.length && (
                    <div className="image-gallery-swiper">
                      {/* Основной слайдер */}
                      <Swiper
                        modules={[Navigation, Pagination, Zoom]}
                        spaceBetween={10}
                        navigation={!isMobile}
                        pagination={{
                          type: 'fraction'
                        }}
                        zoom={{
                          maxRatio: 3,
                          minRatio: 1,
                        }}
                        // thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                        onSwiper={(swiper) => swiperRef.current = swiper}
                        className="main-swiper"
                      >
                        {star.images.map((image, index) => (
                          <SwiperSlide key={index}>
                            <div className="swiper-zoom-container">
                              <motion.img
                                src={image}
                                alt={`${star.name} - изображение ${index + 1}`}
                                className="gallery-image"
                                loading="lazy"
                                onClick={() => openFullscreen(index)}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EИзображение не загружено%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <div className="fullscreen-hint">
                                Нажмите для полноэкранного просмотра
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      {/* Миниатюры (только для десктопа) */}
                      {!isMobile && star.images.length > 1 && (
                        <Swiper
                          modules={[FreeMode, Thumbs]}
                          spaceBetween={8}
                          slidesPerView={5}
                          freeMode={true}
                          watchSlidesProgress={true}
                          onSwiper={setThumbsSwiper}
                          className="thumbs-swiper"
                        >
                          {star.images.map((image, index) => (
                            <SwiperSlide key={index}>
                              <motion.img
                                src={image}
                                alt={`Миниатюра ${index + 1}`}
                                className="thumb-image"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      )}
                    </div>
                  )}

                  <div className="messages-section">
                    <div className="sound-messages">
                    </div>

                  {!!star.videos?.length && (
                    <div className="circle-messages-grid">
                      {star.videos?.map(item => (
                         <CircleMessage
                          videoUrl={item}
                          duration={100}
                        />
                      ))}
                    </div>
                   )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      {/* Полноэкранный просмотр изображений */}
      <AnimatePresence>

      {isFullscreen && (
        <motion.div
          className="fullscreen-overlay"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={closeFullscreen}
        >
          {/* Кнопка закрытия */}
          <motion.button
            className="fullscreen-close-button"
            onClick={closeFullscreen}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>

          {/* Изображение */}
          <motion.div
            className="fullscreen-image-container"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              key={activeImageIndex}
              src={star.images[activeImageIndex]}
              alt={`${star.name} - изображение ${activeImageIndex + 1}`}
              className="fullscreen-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EИзображение не загружено%3C/text%3E%3C/svg%3E';
              }}
            />
          </motion.div>

          {/* Навигация */}
          {star.images.length > 1 && (
            <>
              <motion.button
                className="fullscreen-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Предыдущее изображение"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>

              <motion.button
                className="fullscreen-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Следующее изображение"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>

              {/* Индикатор прогресса */}
              <motion.div className="fullscreen-counter">
                {activeImageIndex + 1} / {star.images.length}
              </motion.div>
            </>
          )}
        </motion.div>
      )}
      </AnimatePresence>

    </>
  );
}