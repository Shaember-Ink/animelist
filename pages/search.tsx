import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Search.module.css';
import { FaStar, FaPlay, FaBookmark, FaSearch } from 'react-icons/fa';
import { IoTimeOutline, IoTvOutline } from 'react-icons/io5';
import Card from '../styles/Card.module.css';

interface Anime {
  mal_id: number;
  title: string;
  title_japanese: string;
  images: {
    jpg: {
      large_image_url: string;
      image_url: string;
    };
  };
  score: number;
  scored_by: number;
  episodes: number;
  status: string;
  duration: string;
  rating: string;
  season: string;
  year: number;
  genres: Array<{ name: string }>;
  synopsis: string;
  type: string;
  members: number;
}

interface ApiResponse {
  data: Anime[];
  pagination: {
    has_next_page: boolean;
    current_page: number;
    last_visible_page: number;
  };
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const searchAnime = async (currentPage: number) => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${currentPage}&limit=24&sfw=true`
      );
      
      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }

      const data: ApiResponse = await response.json();
      
      if (currentPage === 1) {
        setResults(data.data || []);
      } else {
        setResults(prev => [...prev, ...(data.data || [])]);
      }
      
      setHasMore(data.pagination.has_next_page);
    } catch (error) {
      console.error('Error searching anime:', error);
      setError('Произошла ошибка при поиске. Пожалуйста, попробуйте позже.');
      if (currentPage === 1) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    const debounceTimer = setTimeout(() => searchAnime(1), 500);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchAnime(nextPage);
  };

  return (
    <Layout>
      <Head>
        <title>Search Anime - AnimeList</title>
        <meta name="description" content="Search for your favorite anime on AnimeList" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Search Anime</h1>
          <p className={styles.heroSubtitle}>Find your favorite series in our extensive database</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter anime title..."
            className={styles.searchInput}
          />
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {loading && page === 1 ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className={styles.grid}>
              {results.map((anime) => (
                <Link
                  href={`/anime/${anime.mal_id}`}
                  key={anime.mal_id}
                  className={Card.card}
                >
                  <div className={Card.imageWrapper}>
                    <img 
                      src={anime.images.jpg.large_image_url || anime.images.jpg.image_url} 
                      alt={anime.title}
                      className={Card.image}
                    />
                    <div className={Card.overlay}>
                      <div className={Card.stats}>
                        {anime.score && (
                          <span className={Card.score}>
                            <FaStar /> {anime.score}
                          </span>
                        )}
                        {anime.episodes && (
                          <span className={Card.episodes}>
                            <IoTvOutline /> {anime.episodes} ep.
                          </span>
                        )}
                      </div>
                      <button className={Card.watchButton}>
                        <FaPlay /> Watch Now
                      </button>
                    </div>
                  </div>
                  <div className={Card.content}>
                    <h3 className={Card.title}>{anime.title}</h3>
                    <div className={Card.info}>
                      <span className={Card.type}>{anime.type}</span>
                      <span className={Card.members}>{anime.members.toLocaleString()} members</span>
                    </div>
                  </div>
                </Link>
              ))}
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
                    Loading...
                  </>
                ) : (
                  'Show More'
                )}
              </button>
            )}
          </>
        ) : query.trim() ? (
          <div className={styles.noResults}>
            <p>No results found for "{query}"</p>
            <p>Try searching for something else or check your spelling.</p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
} 