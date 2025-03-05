import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Seasonal.module.css';
import heroStyles from '../styles/Hero.module.css';
import { FaStar, FaCalendarAlt, FaUsers, FaPlay } from 'react-icons/fa';

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
  status: string;
  season: string;
  year: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000);
    }
  }
};

const SeasonalPage: NextPage = () => {
  const [currentSeason, setCurrentSeason] = useState<Anime[]>([]);
  const [nextSeason, setNextSeason] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeasonalAnime = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentData = await fetchWithRetry('https://api.jikan.moe/v4/seasons/now');
        await delay(1000);
        const nextData = await fetchWithRetry('https://api.jikan.moe/v4/seasons/upcoming');

        setCurrentSeason(currentData.data);
        setNextSeason(nextData.data);
      } catch (err) {
        console.error('Error fetching seasonal anime:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
      } finally {
        setLoading(false);
      }
    };

    fetchSeasonalAnime();
  }, []);

  const renderAnimeCard = (anime: Anime) => (
    <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className={styles.image}
        />
        <div className={styles.overlay}>
          <div className={styles.stats}>
            <span className={styles.score}>
              <FaStar /> {anime.score || '??'}
            </span>
            <span className={styles.episodes}>
              {anime.episodes ? `${anime.episodes} эп.` : 'TBA'}
            </span>
          </div>
          <button className={styles.watchButton}>
            <FaPlay /> Смотреть
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{anime.title}</h3>
        <div className={styles.info}>
          <span className={styles.type}>{anime.type}</span>
          <span className={styles.members}>
            <FaUsers /> {anime.members.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );

  if (loading) {
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
        <title>AnimeList - Сезонное аниме</title>
        <meta name="description" content="Смотрите текущие и предстоящие аниме сезона" />
      </Head>

      <div className={heroStyles.hero}>
        <div className={heroStyles.heroContent}>
          <h1 className={heroStyles.heroTitle}>
            Сезонное аниме
          </h1>
          <p className={heroStyles.heroSubtitle}>
            Исследуйте текущие и предстоящие аниме сезона
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {currentSeason.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FaCalendarAlt className={styles.sectionIcon} />
                Текущий сезон
              </h2>
            </div>
            <div className={styles.grid}>
              {currentSeason.map(renderAnimeCard)}
            </div>
          </section>
        )}

        {nextSeason.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FaStar className={styles.sectionIcon} />
                Следующий сезон
              </h2>
            </div>
            <div className={styles.grid}>
              {nextSeason.map(renderAnimeCard)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default SeasonalPage; 