import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Anime.module.css';
import { FaStar, FaSlidersH, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import CardStyles from '../styles/Card.module.css';
import { fetchWithRetry } from '../utils/api';

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
  year: number;
}

const GENRES = [
  { id: 0, name: 'All' },
  { id: 1, name: 'Action' },
  { id: 2, name: 'Adventure' },
  { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasy' },
  { id: 14, name: 'Horror' },
  { id: 7, name: 'Mystery' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 37, name: 'Supernatural' },
  { id: 41, name: 'Suspense' },
];

const AnimePage: NextPage = () => {
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnime = async (genreId: number, type: string, status: string, rating: string, currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = 'https://api.jikan.moe/v4';
      let endpoint = '';
      const hasSecondaryFilters = type || status || rating;

      if (genreId === 0 && !hasSecondaryFilters) {
        endpoint = `${baseUrl}/top/anime?page=${currentPage}&limit=24`;
      } else {
        const params = new URLSearchParams({
          order_by: 'score',
          sort: 'desc',
          page: currentPage.toString(),
          limit: '24'
        });
        
        if (genreId !== 0) params.append('genres', genreId.toString());
        if (type) params.append('type', type);
        if (status) params.append('status', status);
        if (rating) params.append('rating', rating);

        endpoint = `${baseUrl}/anime?${params.toString()}`;
      }

      const data = await fetchWithRetry(endpoint);
      
      if (currentPage === 1) {
        setAnimeList(data.data || []);
      } else {
        setAnimeList(prev => [...prev, ...(data.data || [])]);
      }
      
      setHasMore(data.pagination.has_next_page);
    } catch (err) {
      console.error('Error fetching catalog:', err);
      setError('Failed to load anime. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchAnime(selectedGenre, selectedType, selectedStatus, selectedRating, 1);
  }, [selectedGenre, selectedType, selectedStatus, selectedRating]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAnime(selectedGenre, selectedType, selectedStatus, selectedRating, nextPage);
  };


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
          </div>
        </div>
      </div>
      <div className={CardStyles.content}>
        <h3 className={CardStyles.title}>{anime.title}</h3>
        <div className={CardStyles.info}>
          <span className={CardStyles.type}>{anime.year || anime.status}</span>
          <span className={CardStyles.members}>{anime.members.toLocaleString()} members</span>
        </div>
      </div>
    </Link>
  );

  return (
    <Layout>
      <Head>
        <title>Anime Catalog - Explore Your Next Series - AnimeList</title>
        <meta name="description" content="Browse anime by categories and genres" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Explore Anime</h1>
          <p className={styles.subtitle}>Navigate through categories to discover hidden gems and trending masterpieces</p>
        </header>

        <div className={styles.filtersContainer}>
          <div className={styles.filtersRow}>
            <span className={styles.filterLabel}>Genres:</span>
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                className={selectedGenre === genre.id ? styles.filterPillActive : styles.filterPill}
                onClick={() => setSelectedGenre(genre.id)}
              >
                {genre.name}
              </button>
            ))}
            <button 
              className={`${styles.advancedToggle} ${isAdvancedOpen ? styles.active : ''}`}
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            >
              <FaSlidersH /> Filters {isAdvancedOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          <div className={`${styles.advancedPanel} ${isAdvancedOpen ? styles.panelOpen : ''}`}>
            <div className={styles.filterGroup}>
              <label>Type</label>
              <select className={styles.filterSelect} value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="">All Types</option>
                <option value="tv">TV</option>
                <option value="movie">Movie</option>
                <option value="ova">OVA</option>
                <option value="special">Special</option>
                <option value="ona">ONA</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label>Status</label>
              <select className={styles.filterSelect} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="airing">Airing</option>
                <option value="complete">Complete</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label>Rating</label>
              <select className={styles.filterSelect} value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
                <option value="">All Ratings</option>
                <option value="g">G - All Ages</option>
                <option value="pg">PG - Children</option>
                <option value="pg13">PG-13 - Teens 13 or older</option>
                <option value="r17">R - 17+ (violence & profanity)</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <div className={styles.grid}>
              {animeList.map(renderAnimeCard)}
            </div>

            {loading && (
              <div className={styles.loadingSection}>
                <div className={styles.spinner}></div>
                <p>Curating your list...</p>
              </div>
            )}

            {!loading && hasMore && (
              <button className={styles.loadMore} onClick={handleLoadMore}>
                Show More Results
              </button>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AnimePage;
 