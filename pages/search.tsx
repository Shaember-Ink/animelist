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

  // Filter States
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [sortDir, setSortDir] = useState('desc');

  const searchAnime = async (currentPage: number) => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${currentPage}&limit=24&sfw=true`;
      
      if (type) url += `&type=${type}`;
      if (status) url += `&status=${status}`;
      if (rating) url += `&rating=${rating}`;
      if (orderBy) {
        url += `&order_by=${orderBy}&sort=${sortDir}`;
      } else {
        // Default sorting if no specific order is chosen but a query exists
        if (query) {
           // Let jikan handle default relevance sorting for text search
        } else {
           // Default to score if just browsing filters without text
           url += `&order_by=score&sort=desc`;
        }
      }

      const response = await fetch(url);
      
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
    // Debounce search
    const debounceTimer = setTimeout(() => searchAnime(1), 500);
    return () => clearTimeout(debounceTimer);
  }, [query, type, status, rating, orderBy, sortDir]);

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
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime title, characters, or keywords..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filtersBar}>
            <div className={styles.filterGroup}>
              <select value={type} onChange={(e) => setType(e.target.value)} className={styles.filterSelect}>
                <option value="">All Types</option>
                <option value="tv">TV</option>
                <option value="movie">Movie</option>
                <option value="ova">OVA</option>
                <option value="special">Special</option>
                <option value="ona">ONA</option>
                <option value="music">Music</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.filterSelect}>
                <option value="">All Statuses</option>
                <option value="airing">Airing</option>
                <option value="complete">Complete</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <select value={rating} onChange={(e) => setRating(e.target.value)} className={styles.filterSelect}>
                <option value="">All Ratings</option>
                <option value="g">G - All Ages</option>
                <option value="pg">PG - Children</option>
                <option value="pg13">PG-13 - Teens 13+</option>
                <option value="r17">R - 17+ (violence & profanity)</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)} className={styles.filterSelect}>
                <option value="">Sort By (Relevance)</option>
                <option value="score">Score</option>
                <option value="popularity">Popularity</option>
                <option value="members">Members</option>
                <option value="start_date">Start Date</option>
                <option value="end_date">End Date</option>
              </select>
            </div>

            {orderBy && (
              <div className={styles.filterGroup}>
                <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className={styles.filterSelect}>
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            )}
          </div>
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
                    <span>Loading...</span>
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
 