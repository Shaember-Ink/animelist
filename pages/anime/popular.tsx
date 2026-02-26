import { useState } from 'react';
import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import styles from '../../styles/Anime.module.css';
import heroStyles from '../../styles/Hero.module.css';
import { FaStar } from 'react-icons/fa';
import CardStyles from '../../styles/Card.module.css';
import { fetchWithRetry } from '../../utils/api';

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

interface PopularAnimePageProps {
  initialAnime: Anime[];
  initialHasMore: boolean;
  initialError: string | null;
}

export const getStaticProps: GetStaticProps<PopularAnimePageProps> = async () => {
  try {
    const data = await fetchWithRetry('https://api.jikan.moe/v4/top/anime?page=1');
    return {
      props: {
        initialAnime: data?.data || [],
        initialHasMore: data?.pagination?.has_next_page || false,
        initialError: null,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (err) {
    console.error('Error in getStaticProps for popular anime:', err);
    return {
      props: {
        initialAnime: [],
        initialHasMore: false,
        initialError: 'Произошла ошибка при загрузке данных со стороны сервера.',
      },
      revalidate: 60,
    };
  }
};

const PopularAnimePage: NextPage<PopularAnimePageProps> = ({ initialAnime, initialHasMore, initialError }) => {
  const [anime, setAnime] = useState<Anime[]>(initialAnime);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);

  const fetchAnime = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${currentPage}`);
      if (!response.ok) throw new Error('Ошибка при загрузке данных');
      
      const data = await response.json();
      setAnime(prev => [...prev, ...data.data]);
      setHasMore(data.pagination.has_next_page);
    } catch (err) {
      console.error('Error fetching anime:', err);
      setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAnime(nextPage);
    }
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

  if (error && anime.length === 0) {
    return (
      <Layout>
        <div className={styles.error}>{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Популярное аниме - AnimeList</title>
        <meta name="description" content="Список популярного аниме" />
      </Head>

      <div className={heroStyles.hero}>
        <div className={heroStyles.heroContent}>
          <h1 className={heroStyles.heroTitle}>Популярное аниме</h1>
          <p className={heroStyles.heroSubtitle}>
            Самые популярные аниме всех времен
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.grid}>
          {anime.map(renderAnimeCard)}
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
                Загрузка...
              </>
            ) : (
              'Показать больше'
            )}
          </button>
        )}
      </div>
    </Layout>
  );
};

export default PopularAnimePage; 