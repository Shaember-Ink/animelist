import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import styles from '../../styles/RanobeDetail.module.css';
import { FaStar, FaUsers, FaBookOpen, FaCalendarAlt, FaHeart, FaBookmark } from 'react-icons/fa';

interface RanobeDetail {
  mal_id: number;
  title: string;
  title_japanese: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  synopsis: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  status: string;
  type: string;
  chapters: number;
  volumes: number;
  published: {
    from: string;
    to: string;
    prop: {
      from: {
        year: number;
      };
      to: {
        year: number;
      };
    };
  };
  authors: Array<{
    name: string;
    url: string;
  }>;
  genres: Array<{
    name: string;
    url: string;
  }>;
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

const RanobeDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [ranobe, setRanobe] = useState<RanobeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanobeData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);

      try {
        const data = await fetchWithRetry(`https://api.jikan.moe/v4/manga/${id}`);
        setRanobe(data.data);
      } catch (err) {
        console.error('Error fetching ranobe data:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
      } finally {
        setLoading(false);
      }
    };

    fetchRanobeData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка информации о ранобэ...</p>
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

  if (!ranobe) {
    return (
      <Layout>
        <div className={styles.error}>Ранобэ не найдено</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{ranobe.title} - AnimeList</title>
        <meta name="description" content={ranobe.synopsis?.slice(0, 160)} />
      </Head>

      <div className={styles.container}>
        <div className={styles.heroSection}>
          <div 
            className={styles.heroBackground}
            style={{
              backgroundImage: `url(${ranobe.images.jpg.large_image_url})`
            }}
          />
          <div className={styles.header}>
            <div className={styles.coverWrapper}>
              <img
                src={ranobe.images.jpg.large_image_url}
                alt={ranobe.title}
                className={styles.cover}
              />
            </div>
            
            <div className={styles.info}>
              <h1 className={styles.title}>{ranobe.title}</h1>
              {ranobe.title_japanese && (
                <h2 className={styles.japaneseTitle}>{ranobe.title_japanese}</h2>
              )}

              <div className={styles.actionButtons}>
                <button className={styles.actionButton}>
                  <FaBookmark /> Добавить в список
                </button>
                <button className={`${styles.actionButton} ${styles.secondary}`}>
                  <FaHeart /> В избранное
                </button>
              </div>

              <div className={styles.stats}>
                {ranobe.score && (
                  <div className={styles.statItem}>
                    <FaStar className={styles.statIcon} />
                    <div>
                      <div className={styles.statValue}>{ranobe.score}</div>
                      <div className={styles.statLabel}>Оценка</div>
                    </div>
                  </div>
                )}
                
                <div className={styles.statItem}>
                  <FaUsers className={styles.statIcon} />
                  <div>
                    <div className={styles.statValue}>#{ranobe.popularity}</div>
                    <div className={styles.statLabel}>Популярность</div>
                  </div>
                </div>

                {ranobe.rank && (
                  <div className={styles.statItem}>
                    <FaStar className={styles.statIcon} />
                    <div>
                      <div className={styles.statValue}>#{ranobe.rank}</div>
                      <div className={styles.statLabel}>Рейтинг</div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.details}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Статус:</span>
                  <span className={styles.detailValue}>{ranobe.status}</span>
                </div>

                {ranobe.chapters && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Главы:</span>
                    <span className={styles.detailValue}>{ranobe.chapters}</span>
                  </div>
                )}

                {ranobe.volumes && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Тома:</span>
                    <span className={styles.detailValue}>{ranobe.volumes}</span>
                  </div>
                )}

                {ranobe.published?.from && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Публикация:</span>
                    <span className={styles.detailValue}>
                      {new Date(ranobe.published.from).getFullYear()}
                      {ranobe.published.to ? ` - ${new Date(ranobe.published.to).getFullYear()}` : ' - настоящее время'}
                    </span>
                  </div>
                )}

                {ranobe.authors && ranobe.authors.length > 0 && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Авторы:</span>
                    <span className={styles.detailValue}>
                      {ranobe.authors.map(author => author.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {ranobe.genres && ranobe.genres.length > 0 && (
                <div className={styles.genres}>
                  {ranobe.genres.map(genre => (
                    <span key={genre.name} className={styles.genre}>
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {ranobe.synopsis && (
          <div className={styles.synopsis}>
            <h3 className={styles.synopsisTitle}>
              <FaBookOpen /> Описание
            </h3>
            <p className={styles.synopsisText}>{ranobe.synopsis}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RanobeDetailPage; 