import { useState, useEffect } from 'react';
import styles from '@/styles/KodikPlayer.module.css';
import { FaExpand, FaCompress, FaPlay, FaPause, FaCog } from 'react-icons/fa';

interface KodikPlayerProps {
  url: string;
  title: string;
}

export default function KodikPlayer({ url, title }: KodikPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('720');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const toggleFullscreen = () => {
    const player = document.getElementById('kodik-player');
    if (!player) return;

    if (!isFullscreen) {
      if (player.requestFullscreen) {
        player.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const togglePlay = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      // Отправляем сообщение в iframe для управления воспроизведением
      iframe.contentWindow?.postMessage({ type: 'togglePlay' }, '*');
      setIsPlaying(!isPlaying);
    }
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    // Здесь можно добавить логику для изменения качества через API Кодика
    setShowSettings(false);
  };

  return (
    <div 
      id="kodik-player"
      className={styles.playerContainer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className={styles.playerWrapper}>
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
        />
      </div>

      {showControls && (
        <div className={styles.controls}>
          <div className={styles.topControls}>
            <h2 className={styles.title}>{title}</h2>
          </div>

          <div className={styles.bottomControls}>
            <div className={styles.leftControls}>
              <button onClick={togglePlay} className={styles.controlButton}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
            </div>

            <div className={styles.rightControls}>
              <div className={styles.settingsContainer}>
                <button 
                  onClick={() => setShowSettings(!showSettings)} 
                  className={styles.controlButton}
                >
                  <FaCog />
                </button>

                {showSettings && (
                  <div className={styles.settingsMenu}>
                    <div className={styles.qualityOptions}>
                      <button 
                        onClick={() => handleQualityChange('1080')}
                        className={`${styles.qualityButton} ${quality === '1080' ? styles.active : ''}`}
                      >
                        1080p
                      </button>
                      <button 
                        onClick={() => handleQualityChange('720')}
                        className={`${styles.qualityButton} ${quality === '720' ? styles.active : ''}`}
                      >
                        720p
                      </button>
                      <button 
                        onClick={() => handleQualityChange('480')}
                        className={`${styles.qualityButton} ${quality === '480' ? styles.active : ''}`}
                      >
                        480p
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className={styles.controlButton}>
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 