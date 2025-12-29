// VoiceMessagePlayer.jsx
import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Volume2 } from 'lucide-react';
import './SoundMessage.css';

export default function VoiceMessagePlayer({ audioUrl, duration }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const containerRef = useRef(null);

  // Инициализация волны
  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#a0a0a0',
      progressColor: '#3390ec', // Синий цвет как в Telegram
      cursorColor: 'transparent',
      barWidth: 3,
      barRadius: 10,
      barGap: 0,
      height: 25,
      responsive: true,
      normalize: true,
      hideScrollbar: true,
      interact: false, // Отключаем клик по волне для перемотки
    });

    wavesurfer.current.load(audioUrl);

    wavesurfer.current.on('ready', () => {
      wavesurfer.current.setVolume(volume);
    });

    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });

    wavesurfer.current.on('finish', () => {
      setIsPlaying(false);
    });

    return () => {
      wavesurfer.current.destroy();
    };
  }, [audioUrl]);

  // Управление воспроизведением
  const togglePlay = () => {
    if (wavesurfer.current) {
      if (isPlaying) {
        wavesurfer.current.pause();
      } else {
        wavesurfer.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Перемотка при клике по прогресс-бару
  const handleSeek = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;

    if (wavesurfer.current) {
      const duration = wavesurfer.current.getDuration();
      const seekTime = duration * percentage;
      wavesurfer.current.seekTo(percentage);
      setCurrentTime(seekTime);
    }
  };

  // Форматирование времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="voice-message-container">
      {/* Кнопка воспроизведения */}
      <button
        onClick={togglePlay}
        className="voice-play-button"
        aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
      >
        {isPlaying ? (
          <Pause size={20} color="#3390ec" />
        ) : (
          <Play size={20} color="#3390ec" />
        )}
      </button>

      {/* Основная область с волной и временем */}
      <div
        ref={containerRef}
        className="voice-wave-container"
        onClick={handleSeek}
      >
        {/* Визуализация волны */}
        <div ref={waveformRef} className="voice-waveform" />

        {/* Прогресс и время */}
        <div className="voice-time-info">
          <span className="voice-current-time">
            {formatTime(currentTime)}
          </span>
          <span className="voice-duration">
            {formatTime(duration || wavesurfer.current?.getDuration() || 0)}
          </span>
        </div>

        {/* Индикатор перемотки (появляется при клике) */}
        <div
          className="voice-seek-indicator"
          style={{
            left: `${(currentTime / (duration || 1)) * 100}%`
          }}
        />
      </div>
    </div>
  );
}