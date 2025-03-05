import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Ranobe.module.css';
import heroStyles from '../styles/Hero.module.css';
import { FaFire, FaCalendarAlt, FaStar, FaChevronRight } from 'react-icons/fa';
import CardStyles from '../styles/Card.module.css';

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
}

interface Section {
  title: string;
  icon: JSX.Element;
  endpoint: string;
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

const AnimePage: NextPage = () => {
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [newAnime, setNewAnime] = useState<Anime[]>([]);
  const [upcomingAnime, setUpcomingAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sections: Section[] = [
    { title: 'Популярное аниме', icon: <FaFire />, endpoint: 'top/anime' },
    { title: 'Новое аниме', icon: <FaCalendarAlt />, endpoint: 'seasons/now' },
    { title: 'Скоро выйдет', icon: <FaStar />, endpoint: 'seasons/upcoming' }
  ];

  useEffect(() => {
    const fetchAnimeData = async () => {
      setLoading(true);
      setError(null);

      try {
        const trendingData = await fetchWithRetry('https://api.jikan.moe/v4/top/anime');
        await delay(1000);
        const newData = await fetchWithRetry('https://api.jikan.moe/v4/seasons/now');
        await delay(1000);
        const upcomingData = await fetchWithRetry('https://api.jikan.moe/v4/seasons/upcoming');

        setTrendingAnime(trendingData.data.slice(0, 12));
        setNewAnime(newData.data.slice(0, 12));
        setUpcomingAnime(upcomingData.data.slice(0, 12));
      } catch (err) {
        console.error('Error fetching anime data:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, []);

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
        <title>AnimeList - Аниме</title>
        <meta name="description" content="Смотрите аниме онлайн" />
      </Head>

      <div className={heroStyles.hero}>
        <div className={heroStyles.heroContent}>
          <h1 className={heroStyles.heroTitle}>
            Исследуйте мир аниме
          </h1>
          <p className={heroStyles.heroSubtitle}>
            Откройте для себя лучшие японские анимационные сериалы
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.sections}>
          {trendingAnime.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaFire className={styles.sectionIcon} />
                  Популярное аниме
                </h2>
                <Link href="/anime/popular" className={styles.viewAll}>
                  Смотреть все <FaChevronRight />
                </Link>
              </div>
              <div className={styles.ranobeGrid}>
                {trendingAnime.map(renderAnimeCard)}
              </div>
            </section>
          )}

          {newAnime.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaCalendarAlt className={styles.sectionIcon} />
                  Новое аниме
                </h2>
                <Link href="/anime/new" className={styles.viewAll}>
                  Смотреть все <FaChevronRight />
                </Link>
              </div>
              <div className={styles.ranobeGrid}>
                {newAnime.map(renderAnimeCard)}
              </div>
            </section>
          )}

          {upcomingAnime.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaStar className={styles.sectionIcon} />
                  Скоро выйдет
                </h2>
                <Link href="/anime/upcoming" className={styles.viewAll}>
                  Смотреть все <FaChevronRight />
                </Link>
              </div>
              <div className={styles.ranobeGrid}>
                {upcomingAnime.map(renderAnimeCard)}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AnimePage; 