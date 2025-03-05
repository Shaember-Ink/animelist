import { useState, useEffect } from 'react';
import type { FC } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Ranobe.module.css';
import { FaFire, FaCalendarAlt, FaStar, FaChevronRight } from 'react-icons/fa';

interface Ranobe {
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

const RanobePage: React.FC = () => {
  const [trendingRanobe, setTrendingRanobe] = useState<Ranobe[]>([]);
  const [newRanobe, setNewRanobe] = useState<Ranobe[]>([]);
  const [upcomingRanobe, setUpcomingRanobe] = useState<Ranobe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sections: Section[] = [
    { title: 'Популярное ранобэ', icon: <FaFire />, endpoint: 'top/manga' },
    { title: 'Новое ранобэ', icon: <FaCalendarAlt />, endpoint: 'seasons/now' },
    { title: 'Скоро выйдет', icon: <FaStar />, endpoint: 'seasons/upcoming' }
  ];

  useEffect(() => {
    const fetchRanobeData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Делаем запросы последовательно с задержкой
        const trendingData = await fetchWithRetry('https://api.jikan.moe/v4/top/manga?type=lightnovel');
        await delay(1000);
        const newData = await fetchWithRetry('https://api.jikan.moe/v4/manga?type=lightnovel&status=publishing&order_by=members&sort=desc');
        await delay(1000);
        const upcomingData = await fetchWithRetry('https://api.jikan.moe/v4/manga?type=lightnovel&status=upcoming&order_by=members&sort=desc');

        setTrendingRanobe(trendingData.data.slice(0, 12));
        setNewRanobe(newData.data.slice(0, 12));
        setUpcomingRanobe(upcomingData.data.slice(0, 12));
      } catch (err) {
        console.error('Error fetching ranobe data:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
      } finally {
        setLoading(false);
      }
    };

    fetchRanobeData();
  }, []);

  const renderRanobeCard = (ranobe: Ranobe) => (
    <Link href={`/ranobe/${ranobe.mal_id}`} key={ranobe.mal_id}>
      <div className={styles.ranobeCard}>
        <div className={styles.imageWrapper}>
          <img
            src={ranobe.images.jpg.large_image_url}
            alt={ranobe.title}
            className={styles.ranobeImage}
          />
          <div className={styles.overlay}>
            <div className={styles.stats}>
              <span className={styles.score}>
                <FaStar /> {ranobe.score || '??'}
              </span>
              <span className={styles.chapters}>
                {ranobe.chapters ? `${ranobe.chapters} гл.` : 'TBA'}
              </span>
            </div>
          </div>
        </div>
        <h3 className={styles.ranobeTitle}>{ranobe.title}</h3>
        <div className={styles.ranobeInfo}>
          <span className={styles.type}>{ranobe.type}</span>
          <span className={styles.members}>{ranobe.members.toLocaleString()} участников</span>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка ранобэ...</p>
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
        <title>AnimeList - Ранобэ</title>
        <meta name="description" content="Читайте ранобэ онлайн" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Исследуйте мир ранобэ
          </h1>
          <p className={styles.heroSubtitle}>
            Откройте для себя лучшие японские ранобэ
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.sections}>
          {trendingRanobe.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaFire className={styles.sectionIcon} />
                  Популярное ранобэ
                </h2>
                <Link href="/ranobe/popular" className={styles.viewAll}>
                  Смотреть все <FaChevronRight />
                </Link>
              </div>
              <div className={styles.ranobeGrid}>
                {trendingRanobe.map(renderRanobeCard)}
              </div>
            </section>
          )}

          {newRanobe.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaCalendarAlt className={styles.sectionIcon} />
                  Новое ранобэ
                </h2>
                <Link href="/ranobe/new" className={styles.viewAll}>
                  Смотреть все <FaChevronRight />
                </Link>
              </div>
              <div className={styles.ranobeGrid}>
                {newRanobe.map(renderRanobeCard)}
              </div>
            </section>
          )}

          {upcomingRanobe.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaStar className={styles.sectionIcon} />
                  Скоро выйдет
                </h2>
                <Link href="/ranobe/upcoming" className={styles.viewAll}>
                  Смотреть все <FaChevronRight />
                </Link>
              </div>
              <div className={styles.ranobeGrid}>
                {upcomingRanobe.map(renderRanobeCard)}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RanobePage; 