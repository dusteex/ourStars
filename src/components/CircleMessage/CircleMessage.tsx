// CircleVideoPlayer.jsx
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCw, RotateCcw } from 'lucide-react';
import './CircleMessage.css';

export default function CircleVideoPlayer({
  videoUrl,
  posterUrl,
  duration = 0,
  autoPlay = false,
  muted = false,
  loop = false,
  skipSeconds = 5
}) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration);
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressCircleRef = useRef(null);
  const animationRef = useRef(null);

  // Инициализация видео
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);
    setHasError(false);

    const handleLoadedMetadata = () => {
      const dur = video.duration;
      if (isFinite(dur) && dur > 0) {
        setVideoDuration(dur);
      } else if (duration > 0) {
        setVideoDuration(duration);
      }
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (videoDuration > 0 && isFinite(video.currentTime)) {
        const currentProgress = (video.currentTime / videoDuration) * 100;
        setProgress(currentProgress);
        setCurrentTime(video.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!loop) {
        setProgress(0);
        setCurrentTime(0);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
      }
    };

    const handleError = () => {
      console.error("Video loading error:", video.error);
      setHasError(true);
      setIsLoading(false);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    if (autoPlay) {
      video.play().catch(e => {
        console.error("Auto-play failed:", e);
        setIsPlaying(false);
      });
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoPlay, loop, duration]);

  // Анимация прогресса
  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current && isPlaying && videoDuration > 0) {
        const video = videoRef.current;
        const currentTime = video.currentTime;

        if (isFinite(currentTime) && isFinite(videoDuration)) {
          const currentProgress = (currentTime / videoDuration) * 100;
          setProgress(currentProgress);
          setCurrentTime(currentTime);
        }
        animationRef.current = requestAnimationFrame(updateProgress);
      } else {
        setProgress(0)
        setCurrentTime(0);
      }
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, videoDuration]);

  // Управление видео
  const togglePlay = () => {
    if (!videoRef.current || hasError) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.error("Play error:", e);
          setIsPlaying(false);
        });
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    const element = videoRef.current

    if (!document.fullscreenElement) {
      if(!!element.webkitEnterFullscreen) {
        element.webkitEnterFullscreen();
      }
      else {
        element.requestFullscreen?.();
      }
    } else {
      document.exitFullscreen();
    }
  };

  // Безопасная перемотка
  const handleSeek = (e) => {
    e.stopPropagation();

    if (!videoRef.current || !containerRef.current || videoDuration <= 0) {
      console.warn("Cannot seek: video not ready");
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clickX = e.clientX - centerX;
    const clickY = e.clientY - centerY;

    // Вычисляем угол
    let angle = Math.atan2(clickY, clickX) * (180 / Math.PI);
    angle = (angle + 90) % 360; // Начинаем с 12 часов
    if (angle < 0) angle += 360;

    const clickProgress = Math.max(0, Math.min(100, angle / 360 * 100));

    // Безопасное вычисление нового времени
    let newTime = (clickProgress / 100) * videoDuration;
    newTime = Math.max(0, Math.min(videoDuration, newTime));

    if (isFinite(newTime)) {
      videoRef.current.currentTime = newTime;
      setProgress(clickProgress);
      setCurrentTime(newTime);
    } else {
      console.error("Invalid time value:", newTime);
    }
  };

  // Форматирование времени
  const formatTime = (seconds) => {
    if (!isFinite(seconds) || seconds < 0) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Вычисляем координаты для точки прогресса
  const getProgressPointPosition = () => {
    const size = 200;
    const center = size / 2;
    const radius = 90;

    if (!isFinite(progress)) return { x: center, y: center - radius };

    const angle = (progress / 100) * 360 - 90;
    const angleRad = (angle * Math.PI) / 180;

    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);

    return {
      x: isFinite(x) ? x : center,
      y: isFinite(y) ? y : center - radius
    };
  };

  const skipBackward = () => {
    if (!videoRef.current || videoDuration <= 0) return;

    const newTime = Math.max(0, videoRef.current.currentTime - skipSeconds);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);

    if (videoDuration > 0) {
      setProgress((newTime / videoDuration) * 100);
    }

    // Визуальная обратная связь
    flashButton('backward');
  };

  // Перемотка вперед
  const skipForward = () => {
    if (!videoRef.current || videoDuration <= 0) return;

    const newTime = Math.min(videoDuration, videoRef.current.currentTime + skipSeconds);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);

    if (videoDuration > 0) {
      setProgress((newTime / videoDuration) * 100);
    }

    // Визуальная обратная связь
    flashButton('forward');
  };

  const flashButton = (direction) => {
    const btn = document.querySelector(`.skip-${direction}`);
    if (btn) {
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 300);
    }
  };

  const progressPoint = getProgressPointPosition();
  const displayDuration = videoDuration > 0 ? videoDuration : duration;

  return (
    <div
      className={`circle-video-container ${isFullscreen ? 'fullscreen' : ''} ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`}
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setShowControls(true)}
    >
      {/* Видео элемент */}
      <video
        ref={videoRef}
        className="circle-video"
        src={videoUrl}
        muted={isMuted}
        loop={loop}
        playsInline
        preload="metadata"
        onCanPlay={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Загрузка...</span>
        </div>
      )}

      {/* Сообщение об ошибке */}
      {hasError && (
        <div className="error-message">
          <span>Ошибка загрузки видео</span>
          <button
            className="retry-button"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
          >
            Повторить
          </button>
        </div>
      )}

      {/* Круговой прогресс-бар (только если видео загружено) */}


      {/* Оверлей с контролами (только если видео загружено) */}
      {!isLoading && !hasError && (
        <div className={`video-controls ${isHovered || showControls ? 'visible' : ''}`}>
           <div className="time-display">
            {formatTime(currentTime)} / {formatTime(displayDuration)}
          </div>
          <div className="skip-controls">
            <button
              onClick={(e) => {
                e.stopPropagation();
                skipBackward();
              }}
              className="control-button skip-button skip-backward"
              aria-label={`Назад ${skipSeconds} сек`}
              title={`Назад ${skipSeconds} сек (←)`}
            >
              <RotateCcw size={20} color="white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                skipForward();
              }}
              className="control-button skip-button skip-forward"
              aria-label={`Вперед ${skipSeconds} сек`}
              title={`Вперед ${skipSeconds} сек (→)`}
            >
              <RotateCw size={20} color="white" />
            </button>
          </div>
          {/* Кнопка воспроизведения */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="control-button play-button"
            aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
            disabled={isLoading}
          >
            {isPlaying ? (
              <Pause size={24} color="white" />
            ) : (
              <Play size={24} color="white" />
            )}
          </button>

          {/* Время и звук */}
          <div className="bottom-controls">
            <div className="right-controls">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="control-button fullscreen-button"
                aria-label={isFullscreen ? "Выйти из полноэкранного режима" : "Полный экран"}
              >
                <Maximize2 size={20} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}