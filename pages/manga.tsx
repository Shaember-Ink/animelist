import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Ranobe.module.css';
import heroStyles from '../styles/Hero.module.css';
import { FaFire, FaCalendarAlt, FaStar, FaChevronRight } from 'react-icons/fa';

interface Manga {
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
  chapters: number;
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

const MangaPage: NextPage = () => {
  const [trendingManga, setTrendingManga] = useState<Manga[]>([]);
  const [newManga, setNewManga] = useState<Manga[]>([]);
  const [upcomingManga, setUpcomingManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sections: Section[] = [
    { title: 'Популярная манга', icon: <FaFire />, endpoint: 'top/manga' },
    { title: 'Новая манга', icon: <FaCalendarAlt />, endpoint: 'manga?status=publishing' },
    { title: 'Скоро выйдет', icon: <FaStar />, endpoint: 'manga?status=upcoming' }
  ];

  useEffect(() => {
    const fetchMangaData = async () => {
      setLoading(true);
      setError(null);

      try {
        const trendingData = await fetchWithRetry('https://api.jikan.moe/v4/top/manga?type=manga');
        await delay(1000);
        const newData = await fetchWithRetry('https://api.jikan.moe/v4/manga?type=manga&status=publishing&order_by=members&sort=desc');
        await delay(1000);
        const upcomingData = await fetchWithRetry('https://api.jikan.moe/v4/manga?type=manga&status=upcoming&order_by=members&sort=desc');

        setTrendingManga(trendingData.data.slice(0, 12));
        setNewManga(newData.data.slice(0, 12));
        setUpcomingManga(upcomingData.data.slice(0, 12));
      } catch (err) {
        console.error('Error fetching manga data:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
      } finally {
        setLoading(false);
      }
    };

    fetchMangaData();
  }, []);

  const renderMangaCard = (manga: Manga) => (
    <Link href={`/manga/${manga.mal_id}`} key={manga.mal_id}>
      <div className={styles.ranobeCard}>
        <div className={styles.imageWrapper}>
          <img
            src={manga.images.jpg.large_image_url}
            alt={manga.title}
            className={styles.ranobeImage}
          />
          <div className={styles.overlay}>
            <div className={styles.stats}>
              <span className={styles.score}>
                <FaStar /> {manga.score || '??'}
              </span>
              <span className={styles.chapters}>
                {manga.chapters ? `${manga.chapters} гл.` : 'TBA'}
              </span>
            </div>
          </div>
        </div>
        <h3 className={styles.ranobeTitle}>{manga.title}</h3>
        <div className={styles.ranobeInfo}>
          <span className={styles.type}>{manga.type}</span>
          <span className={styles.members}>{manga.members.toLocaleString()} участников</span>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка манги...</p>
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
        <title>AnimeList - Манга</title>
        <meta name="description" content="Читайте мангу онлайн" />
      </Head>

      <div className={heroStyles.hero}>
        <div className={heroStyles.heroContent}>
          <h1 className={heroStyles.heroTitle}>
            Исследуйте мир манги
          </h1>
          <p className={heroStyles.heroSubtitle}>
            Откройте для себя лучшие японские комиксы
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.sections}>
          {trendingManga.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaFire className={styles.sectionIcon} />
                  Популярная манга
                </h2>
                <Link href="/manga/popular" className={styles.viewAll}>
                  Смотреть все <FaChevronRight />
                </Link>
              </div>
              <div className={styles.ranobeGrid}>
                {trendingManga.map(renderMangaCard)}
              </div>
            </section>
          )}

          {newManga.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaCalendarAlt className={styles.sectionIcon} />
                  Новая манга
                </h2>
                <Link href="/manga/new" className={styles.viewAll}>
                  Смотреть все <FaChevronRight />
                </Link>
              </div>
              <div className={styles.ranobeGrid}>
                {newManga.map(renderMangaCard)}
              </div>
            </section>
          )}

          {upcomingManga.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaStar className={styles.sectionIcon} />
                  Скоро выйдет
                </h2>
                <Link href="/manga/upcoming" className={styles.viewAll}>
                  Смотреть все <FaChevronRight />
                </Link>
              </div>
              <div className={styles.ranobeGrid}>
                {upcomingManga.map(renderMangaCard)}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MangaPage; 