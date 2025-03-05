import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import styles from '../../styles/Ranobe.module.css';
import heroStyles from '../../styles/Hero.module.css';
import { FaStar } from 'react-icons/fa';
import CardStyles from '../../styles/Card.module.css';

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  score: number;
  members: number;
  type: string;
  episodes: number;
}

const UpcomingAnimePage: NextPage = () => {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAnime = async (currentPage: number) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/seasons/upcoming?page=${currentPage}`);
      if (!response.ok) throw new Error('Ошибка при загрузке данных');
      
      const data = await response.json();
      
      if (currentPage === 1) {
        setAnime(data.data);
      } else {
        setAnime(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.pagination.has_next_page);
    } catch (err) {
      console.error('Error fetching anime:', err);
      setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAnime(nextPage);
    }
  };

  const renderAnimeCard = (anime: Anime) => (
    <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id} className={CardStyles.card}>
      <div className={CardStyles.imageWrapper}>
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className={CardStyles.image}
        />
        <div className={CardStyles.overlay}>
          <div className={CardStyles.stats}>
            <span className={CardStyles.score}>
              <FaStar /> {anime.score || '??'}
            </span>
            <span className={CardStyles.episodes}>
              {anime.episodes ? `${anime.episodes} эп.` : 'TBA'}
            </span>
          </div>
        </div>
      </div>
      <div className={CardStyles.content}>
        <h3 className={CardStyles.title}>{anime.title}</h3>
        <div className={CardStyles.info}>
          <span className={CardStyles.type}>{anime.type}</span>
          <span className={CardStyles.members}>{anime.members.toLocaleString()} участников</span>
        </div>
      </div>
    </Link>
  );

  if (loading && page === 1) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка аниме...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.error}>{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Предстоящие аниме - AnimeList</title>
        <meta name="description" content="Список предстоящих аниме" />
      </Head>

      <div className={heroStyles.hero}>
        <div className={heroStyles.heroContent}>
          <h1 className={heroStyles.heroTitle}>Предстоящие аниме</h1>
          <p className={heroStyles.heroSubtitle}>
            Аниме, которые выйдут в следующем сезоне
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.ranobeGrid}>
          {anime.map(renderAnimeCard)}
        </div>

        {hasMore && (
          <button 
            className={styles.loadMore}
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinnerSmall}></div>
                Загрузка...
              </>
            ) : (
              'Показать больше'
            )}
          </button>
        )}
      </div>
    </Layout>
  );
};

export default UpcomingAnimePage; 