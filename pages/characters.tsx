import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Characters.module.css';
import heroStyles from '../styles/Hero.module.css';
import { FaHeart, FaStar } from 'react-icons/fa';

interface Character {
  mal_id: number;
  name: string;
  name_kanji: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  favorites: number;
  about: string;
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

const CharactersPage: NextPage = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      if (page === 1) setLoading(true);
      setError(null);

      try {
        const data = await fetchWithRetry(`https://api.jikan.moe/v4/top/characters?page=${page}`);
        
        if (data.pagination.has_next_page) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }

        if (page === 1) {
          setCharacters(data.data);
        } else {
          setCharacters(prev => [...prev, ...data.data]);
        }
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && page === 1) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка персонажей...</p>
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
        <title>AnimeList - Персонажи аниме</title>
        <meta name="description" content="Популярные персонажи из аниме" />
      </Head>

      <div className={heroStyles.hero}>
        <div className={heroStyles.heroContent}>
          <h1 className={heroStyles.heroTitle}>
            Персонажи аниме
          </h1>
          <p className={heroStyles.heroSubtitle}>
            Исследуйте мир любимых персонажей аниме
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {characters.map(character => (
            <Link
              href={`/character/${character.mal_id}`}
              key={character.mal_id}
              className={styles.card}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={character.images.jpg.image_url}
                  alt={character.name}
                  className={styles.image}
                />
              </div>
              <div className={styles.content}>
                <h2 className={styles.name}>{character.name}</h2>
                {character.name_kanji && (
                  <p className={styles.nameKanji}>{character.name_kanji}</p>
                )}
                <div className={styles.stats}>
                  <span className={styles.favorites}>
                    <FaHeart /> {character.favorites.toLocaleString()}
                  </span>
                </div>
                {character.about && (
                  <p className={styles.about}>
                    {character.about.length > 150
                      ? `${character.about.substring(0, 150)}...`
                      : character.about}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {hasMore && !loading && (
          <button onClick={loadMore} className={styles.loadMore}>
            Загрузить еще
          </button>
        )}

        {loading && page > 1 && (
          <div className={styles.loadingMore}>
            <div className={styles.spinner}></div>
            <p>Загрузка...</p>
          </div>
        )}

        {!hasMore && characters.length > 0 && (
          <div className={styles.noMore}>
            Больше персонажей нет
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CharactersPage; 