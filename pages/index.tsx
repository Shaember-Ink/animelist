import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';
import heroStyles from '../styles/Hero.module.css';
import { FaFire, FaCalendarAlt, FaStar, FaChevronRight, FaPlay, FaBook, FaNewspaper, FaUsers } from 'react-icons/fa';
import cardStyles from '../styles/Card.module.css';

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
      await delay(1000); // Ждем секунду перед повторной попыткой
    }
  }
};

const Home: NextPage = () => {
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [seasonalAnime, setSeasonalAnime] = useState<Anime[]>([]);
  const [upcomingAnime, setUpcomingAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sections: Section[] = [
    { title: 'Популярное сейчас', icon: <FaFire />, endpoint: 'top/anime' },
    { title: 'Сезонное аниме', icon: <FaCalendarAlt />, endpoint: 'seasons/now' },
    { title: 'Скоро выйдет', icon: <FaStar />, endpoint: 'seasons/upcoming' }
  ];

  useEffect(() => {
    const fetchAnimeData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Делаем запросы последовательно с задержкой
        const trendingData = await fetchWithRetry('https://api.jikan.moe/v4/top/anime');
        await delay(1000);
        const seasonalData = await fetchWithRetry('https://api.jikan.moe/v4/seasons/now');
        await delay(1000);
        const upcomingData = await fetchWithRetry('https://api.jikan.moe/v4/seasons/upcoming');

        setTrendingAnime(trendingData.data.slice(0, 6));
        setSeasonalAnime(seasonalData.data.slice(0, 6));
        setUpcomingAnime(upcomingData.data.slice(0, 6));
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
    <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id} className={cardStyles.card}>
      <div className={cardStyles.imageWrapper}>
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className={cardStyles.image}
        />
        <div className={cardStyles.overlay}>
          <div className={cardStyles.stats}>
            <span className={cardStyles.score}>
              <FaStar /> {anime.score || '??'}
            </span>
            <span className={cardStyles.episodes}>
              {anime.episodes ? `${anime.episodes} эп.` : 'TBA'}
            </span>
          </div>
        </div>
      </div>
      <div className={cardStyles.content}>
        <h3 className={cardStyles.title}>{anime.title}</h3>
        <div className={cardStyles.info}>
          <span className={cardStyles.type}>{anime.type}</span>
          <span className={cardStyles.members}>{anime.members.toLocaleString()} участников</span>
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
        <title>AnimeList - Главная</title>
        <meta name="description" content="Исследуйте мир аниме и манги" />
      </Head>

      <div className={`${heroStyles.hero} ${styles.mainHero}`}>
        <div className={heroStyles.heroContent}>
          <h1 className={heroStyles.heroTitle}>
            Добро пожаловать в мир аниме
          </h1>
          <p className={heroStyles.heroSubtitle}>
            Исследуйте тысячи аниме, следите за новинками и делитесь впечатлениями
          </p>
          <div className={styles.heroButtons}>
            <Link href="/anime" className={styles.primaryButton}>
              <FaPlay /> Смотреть аниме
            </Link>
            <Link href="/manga" className={styles.secondaryButton}>
              <FaBook /> Читать мангу
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <FaPlay />
            </div>
            <h2>Огромная коллекция</h2>
            <p>Тысячи аниме и манги в одном месте</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <FaNewspaper />
            </div>
            <h2>Свежие новости</h2>
            <p>Будьте в курсе последних событий</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <FaUsers />
            </div>
            <h2>Сообщество</h2>
            <p>Обсуждайте и делитесь мнениями</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home; 