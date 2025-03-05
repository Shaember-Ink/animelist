import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/News.module.css';
import heroStyles from '../styles/Hero.module.css';
import { FaCalendarAlt, FaUser, FaCommentAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { getNews, NewsItem } from '../utils/news';

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

const NewsPage: NextPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        setError('');
        const newsData = await getNews();
        setNews(newsData);
      } catch (err) {
        setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
        console.error('Ошибка загрузки новостей:', err);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка новостей...</p>
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
        <title>Новости аниме | AniList</title>
        <meta name="description" content="Последние новости из мира аниме" />
      </Head>

      <div className={heroStyles.hero}>
        <div className={heroStyles.heroContent}>
          <h1 className={heroStyles.heroTitle}>
            Новости аниме
          </h1>
          <p className={heroStyles.heroSubtitle}>
            Будьте в курсе последних событий в мире аниме
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>Новости аниме</h1>

        <div className={styles.newsGrid}>
          {news.map((item) => (
            <article key={item.id} className={styles.newsCard}>
              <div className={styles.imageWrapper}>
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className={styles.newsImage}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg';
                  }}
                />
              </div>
              <div className={styles.newsContent}>
                <div className={styles.meta}>
                  <span className={styles.date}>{formatDate(item.date)}</span>
                  <span className={styles.source}>{item.source}</span>
                </div>
                <h2 className={styles.newsTitle}>{item.title}</h2>
                <p className={styles.newsExcerpt}>{item.content}</p>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.readMore}
                >
                  Читать далее
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default NewsPage; 