import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Layout from '../../components/Layout';
import styles from '../../styles/Watch.module.css';
import { FaList, FaBookmark, FaHeart, FaShare, FaCheck, FaCopy } from 'react-icons/fa';
import { fetchWithRetry } from '../../utils/api';

interface Episode {
  number: number;
}

interface AnimeDetails {
  id: string;
  title: string;
  episodes: Episode[];
  shikimori_id: string;
}

interface WatchAnimePageProps {
  initialAnimeDetails: AnimeDetails | null;
  error: string | null;
}

export const getServerSideProps: GetServerSideProps<WatchAnimePageProps> = async ({ params, res }) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );

  const id = params?.id;

  if (!id || typeof id !== 'string') {
    return { notFound: true };
  }

  try {
    const data = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}`);
    
    if (!data || !data.data) {
      throw new Error('Не удалось загрузить информацию об аниме');
    }

    const animeDetails: AnimeDetails = {
      id: id,
      title: data.data.title,
      episodes: Array.from({ length: data.data.episodes || 1 }, (_, i) => ({
        number: i + 1
      })),
      shikimori_id: data.data.mal_id.toString()
    };

    return {
      props: {
        initialAnimeDetails: animeDetails,
        error: null,
      },
    };
  } catch (err) {
    console.error('Error fetching anime details in getServerSideProps:', err);
    return {
      props: {
        initialAnimeDetails: null,
        error: 'Произошла ошибка при загрузке данных',
      },
    };
  }
};

export default function WatchAnime({ initialAnimeDetails, error }: WatchAnimePageProps) {
  const router = useRouter();
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [shareStatus, setShareStatus] = useState<'default' | 'copied' | 'shared'>('default');

  const handleEpisodeSelect = (episodeNumber: number) => {
    setCurrentEpisode(episodeNumber);
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Смотреть ${initialAnimeDetails?.title} - Эпизод ${currentEpisode}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: shareText,
          url: shareUrl
        });
        setShareStatus('shared');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
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

  if (error || !initialAnimeDetails) {
    return (
      <Layout>
        <div className={styles.error}>
          <p>{error || 'Аниме не найдено'}</p>
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
        <title>{initialAnimeDetails.title} - Смотреть онлайн - AnimeList</title>
        <meta name="description" content={`Смотреть ${initialAnimeDetails.title} онлайн бесплатно`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.playerSection}>
          <div className={styles.videoWrapper}>
            <iframe
              src={`https://kodik.info/find-player?shikimoriID=${initialAnimeDetails.shikimori_id}&episode=${currentEpisode}`}
              className={styles.videoPlayer}
              frameBorder="0"
              allowFullScreen
              allow="autoplay *; fullscreen *"
            />
          </div>

          <div className={styles.controls}>

            <button 
              className={`${styles.actionButton} ${styles.shareButton} ${shareStatus !== 'default' ? styles.shared : ''}`}
              onClick={handleShare}
            >
              {getShareButtonContent()}
            </button>
          </div>

          <div className={styles.episodeInfo}>
            <h1 className={styles.title}>{initialAnimeDetails.title}</h1>
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
            {initialAnimeDetails.episodes.map((episode) => (
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