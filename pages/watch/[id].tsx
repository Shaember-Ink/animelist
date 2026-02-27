import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
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
  id: string;
}

export const getServerSideProps: GetServerSideProps<WatchAnimePageProps> = async ({ params }) => {
  const id = params?.id;
  if (!id || typeof id !== 'string') {
    return { notFound: true };
  }
  return {
    props: { id }
  };
};

export default function WatchAnime({ id }: WatchAnimePageProps) {
  const router = useRouter();
  const [initialAnimeDetails, setInitialAnimeDetails] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [shareStatus, setShareStatus] = useState<'default' | 'copied' | 'shared'>('default');

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
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
        setInitialAnimeDetails(animeDetails);
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError('Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Watch ${initialAnimeDetails?.title} - Episode ${currentEpisode}`;

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
            <span>Copied!</span>
          </>
        );
      case 'shared':
        return (
          <>
            <FaCheck />
            <span>Shared!</span>
          </>
        );
      default:
        return (
          <>
            {typeof navigator !== 'undefined' && 'share' in navigator ? <FaShare /> : <FaCopy />}
            <span>Share</span>
          </>
        );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка плеера...</p>
        </div>
      </Layout>
    );
  }

  if (error || !initialAnimeDetails) {
    return (
      <Layout>
        <div className={styles.error}>
          <p>{error || 'Anime not found'}</p>
          <Link href="/anime" className={styles.backButton}>
            Go Back to Catalog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{initialAnimeDetails.title} - Watch Online - AnimeList</title>
        <meta name="description" content={`Watch ${initialAnimeDetails.title} online for free`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.theatreSection}>
          <div className={styles.ambientGlow} />
          
          <div className={styles.contentWrapper}>
            <div className={styles.videoWrapper}>
              <iframe
                src={`https://kodik.info/find-player?shikimoriID=${initialAnimeDetails.shikimori_id}`}
                className={styles.videoPlayer}
                frameBorder="0"
                allowFullScreen
                allow="autoplay *; fullscreen *"
              />
            </div>

            <div className={styles.infoSection}>
              <div className={styles.header}>
                <div className={styles.episodeInfo}>
                  <h1 className={styles.title}>{initialAnimeDetails.title}</h1>
                  <Link href={`/anime/${initialAnimeDetails.id}`} className={styles.backToDetails}>
                    <FaList /> К описанию аниме
                  </Link>
                </div>

                <div className={styles.controls}>
                  <button 
                    className={`${styles.actionButton} ${shareStatus !== 'default' ? styles.shared : ''}`}
                    onClick={handleShare}
                  >
                    {getShareButtonContent()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}