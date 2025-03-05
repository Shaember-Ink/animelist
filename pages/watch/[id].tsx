import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import styles from '../../styles/Watch.module.css';
import { FaList, FaBookmark, FaHeart, FaShare, FaCheck, FaCopy } from 'react-icons/fa';

interface Episode {
  number: number;
}

interface AnimeDetails {
  id: string;
  title: string;
  episodes: Episode[];
  shikimori_id: string;
}

export default function WatchAnime() {
  const router = useRouter();
  const { id } = router.query;
  const [animeDetails, setAnimeDetails] = useState<AnimeDetails | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<'default' | 'copied' | 'shared'>('default');

  useEffect(() => {
    if (id) {
      fetchAnimeDetails();
    }
  }, [id]);

  const fetchAnimeDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
      if (!response.ok) throw new Error('Не удалось загрузить информацию об аниме');
      
      const data = await response.json();
      
      setAnimeDetails({
        id: id as string,
        title: data.data.title,
        episodes: Array.from({ length: data.data.episodes || 1 }, (_, i) => ({
          number: i + 1
        })),
        shikimori_id: data.data.mal_id.toString()
      });
      
      setLoading(false);
    } catch (err) {
      setError('Произошла ошибка при загрузке данных');
      console.error('Error fetching anime details:', err);
      setLoading(false);
    }
  };

  const handleEpisodeSelect = (episodeNumber: number) => {
    setCurrentEpisode(episodeNumber);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Смотреть ${animeDetails?.title} - Эпизод ${currentEpisode}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareText,
          url: shareUrl
        });
        setShareStatus('shared');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('default'), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const getShareButtonContent = () => {
    switch (shareStatus) {
      case 'copied':
        return (
          <>
            <FaCheck />
            <span>Скопировано!</span>
          </>
        );
      case 'shared':
        return (
          <>
            <FaCheck />
            <span>Поделились!</span>
          </>
        );
      default:
        return (
          <>
            {typeof navigator !== 'undefined' && 'share' in navigator ? <FaShare /> : <FaCopy />}
            <span>{typeof navigator !== 'undefined' && 'share' in navigator ? 'Поделиться' : 'Копировать ссылку'}</span>
          </>
        );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => router.back()} className={styles.backButton}>
            Вернуться назад
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{animeDetails?.title} - Смотреть онлайн - AnimeList</title>
        <meta name="description" content={`Смотреть ${animeDetails?.title} онлайн бесплатно`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.playerSection}>
          <div className={styles.videoWrapper}>
            <iframe
              src={`https://kodik.info/find-player?shikimoriID=${animeDetails?.shikimori_id}&episode=${currentEpisode}`}
              className={styles.videoPlayer}
              frameBorder="0"
              allowFullScreen
              allow="autoplay *; fullscreen *"
            />
          </div>

          <div className={styles.controls}>
            <button className={`${styles.actionButton} ${styles.listButton}`}>
              <FaBookmark />
              <span>Добавить в список</span>
            </button>
            <button className={`${styles.actionButton} ${styles.favoriteButton}`}>
              <FaHeart />
              <span>В избранное</span>
            </button>
            <button 
              className={`${styles.actionButton} ${styles.shareButton} ${shareStatus !== 'default' ? styles.shared : ''}`}
              onClick={handleShare}
            >
              {getShareButtonContent()}
            </button>
          </div>

          <div className={styles.episodeInfo}>
            <h1 className={styles.title}>{animeDetails?.title}</h1>
            <p className={styles.episodeTitle}>
              Эпизод {currentEpisode}
            </p>
          </div>
        </div>

        <div className={styles.episodesList}>
          <h2 className={styles.episodesTitle}>
            <FaList /> Список эпизодов
          </h2>
          <div className={styles.episodesGrid}>
            {animeDetails?.episodes.map((episode) => (
              <button
                key={episode.number}
                onClick={() => handleEpisodeSelect(episode.number)}
                className={`${styles.episodeButton} ${
                  currentEpisode === episode.number ? styles.active : ''
                }`}
              >
                <span className={styles.episodeNumber}>{episode.number}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}