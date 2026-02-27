import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Anime.module.css';
import { FaFire, FaClapperboard, FaStar } from 'react-icons/fa6';
import { FaChevronRight } from 'react-icons/fa';
import CardStyles from '../styles/Card.module.css';
import { fetchWithRetry, delay } from '../utils/api';

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

interface AnimePageProps {
  trendingAnime: Anime[];
  newAnime: Anime[];
  upcomingAnime: Anime[];
  error?: string | null;
}

export const getStaticProps: GetStaticProps<AnimePageProps> = async () => {
  try {
    const trendingData = await fetchWithRetry('https://api.jikan.moe/v4/top/anime');
    await delay(1000); // Respect API rate limits
    const newData = await fetchWithRetry('https://api.jikan.moe/v4/seasons/now');
    await delay(1000);
    const upcomingData = await fetchWithRetry('https://api.jikan.moe/v4/seasons/upcoming');

    return {
      props: {
        trendingAnime: trendingData?.data?.slice(0, 18) || [],
        newAnime: newData?.data?.slice(0, 18) || [],
        upcomingAnime: upcomingData?.data?.slice(0, 18) || [],
        error: null,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (err) {
    console.error('Error fetching anime data in getStaticProps:', err);
    return {
      props: {
        trendingAnime: [],
        newAnime: [],
        upcomingAnime: [],
        error: 'An error occurred while loading data from the server.',
      },
      revalidate: 60, // Try generating again sooner if error
    };
  }
};

const AnimePage: NextPage<AnimePageProps> = ({ trendingAnime, newAnime, upcomingAnime, error }) => {
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
          <span className={CardStyles.type}>{anime.year || 'TBA'}</span>
        </div>
      </div>
    </Link>
  );

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
        <title>AnimeList - Catalog</title>
        <meta name="description" content="Anime Catalog" />
      </Head>

      <div className={styles.container}>
        <div className={styles.sections}>
          {trendingAnime.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaFire className={styles.sectionIcon} /> Popular Anime
                </h2>
                <Link href="/anime/popular" className={styles.viewAll}>
                  View All <FaChevronRight />
                </Link>
              </div>
              <div className={styles.grid}>
                {trendingAnime.map(renderAnimeCard)}
              </div>
            </section>
          )}

          {newAnime.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaClapperboard className={styles.sectionIcon} /> Streaming Now
                </h2>
                <Link href="/anime/new" className={styles.viewAll}>
                  View All <FaChevronRight />
                </Link>
              </div>
              <div className={styles.grid}>
                {newAnime.map(renderAnimeCard)}
              </div>
            </section>
          )}

          {upcomingAnime.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FaStar className={styles.sectionIcon} /> Upcoming
                </h2>
                <Link href="/anime/upcoming" className={styles.viewAll}>
                  View All <FaChevronRight />
                </Link>
              </div>
              <div className={styles.grid}>
                {upcomingAnime.map(renderAnimeCard)}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AnimePage; 