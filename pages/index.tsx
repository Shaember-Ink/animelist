import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import HeroBanner from '../components/HeroBanner';
import styles from '../styles/Home.module.css';
import CardStyles from '../styles/Card.module.css';
import { FaFire, FaClapperboard, FaStar } from 'react-icons/fa6';
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
  synopsis: string;
  year: number;
}

interface HomePageProps {
  trendingAnime: Anime[];
  newAnime: Anime[];
  upcomingAnime: Anime[];
  error?: string | null;
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  try {
    const trendingData = await fetchWithRetry('https://api.jikan.moe/v4/top/anime');
    await delay(1000);
    const newData = await fetchWithRetry('https://api.jikan.moe/v4/seasons/now');
    await delay(1000);
    const upcomingData = await fetchWithRetry('https://api.jikan.moe/v4/seasons/upcoming');

    return {
      props: {
        trendingAnime: trendingData?.data?.slice(0, 15) || [],
        newAnime: newData?.data?.slice(0, 15) || [],
        upcomingAnime: upcomingData?.data?.slice(0, 15) || [],
        error: null,
      },
      revalidate: 3600,
    };
  } catch (err) {
    console.error('Error fetching home data in getStaticProps:', err);
    return {
      props: {
        trendingAnime: [],
        newAnime: [],
        upcomingAnime: [],
        error: 'Произошла ошибка загрузки данных.',
      },
      revalidate: 60,
    };
  }
};

const Home: NextPage<HomePageProps> = ({ trendingAnime, newAnime, upcomingAnime, error }) => {
  const heroAnimeList = trendingAnime?.slice(0, 5) || [];
  const popularList = trendingAnime?.slice(1) || [];

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.dataset.isDown = 'true';
    el.dataset.isDragging = 'false';
    el.dataset.startX = (e.pageX - el.offsetLeft).toString();
    el.dataset.scrollLeft = el.scrollLeft.toString();
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.dataset.isDown = 'false';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.dataset.isDown = 'false';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.dataset.isDown !== 'true') return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const startX = parseFloat(el.dataset.startX || '0');
    const scrollLeft = parseFloat(el.dataset.scrollLeft || '0');
    const walk = (x - startX) * 2;
    el.scrollLeft = scrollLeft - walk;
    if (Math.abs(walk) > 5) {
      el.dataset.isDragging = 'true';
    }
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.dataset.isDragging === 'true') {
      e.preventDefault();
      e.stopPropagation();
      el.dataset.isDragging = 'false';
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (e.deltaX !== 0 || Math.abs(e.deltaY) > 0) {
      // If the scroll is mostly horizontal or we want to force horizontal scroll
      // preventDefault here ensures the page doesn't try to scroll vertically/diagonally
      e.preventDefault();
      el.scrollLeft += (e.deltaY + e.deltaX);
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

  return (
    <Layout>
      <Head>
        <title>AnimeList - Watch Anime Online</title>
        <meta name="description" content="Watch the best anime online with a sleek interface" />
      </Head>

      {error && <div className={styles.error}>{error}</div>}

      <HeroBanner animeList={heroAnimeList} />

      <div className={styles.container}>
        {/* Trends Now Section */}
        {popularList.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FaFire className={styles.sectionIcon} /> Trends Now
              </h2>
            </div>

            <div className={styles.rowContainer}>
              <div 
                className={styles.row}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onClickCapture={handleClickCapture}
                onWheel={handleWheel}
              >
                {popularList.map(renderAnimeCard)}
              </div>
            </div>
          </section>
        )}

        {/* Movies Section (Used for New Anime here) */}
        {newAnime.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FaClapperboard className={styles.sectionIcon} /> Latest Anime
              </h2>
            </div>

            <div className={styles.rowContainer}>
              <div 
                className={styles.row}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onClickCapture={handleClickCapture}
                onWheel={handleWheel}
              >
                {newAnime.map(renderAnimeCard)}
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Section */}
        {upcomingAnime.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FaStar className={styles.sectionIcon} /> Upcoming Drops
              </h2>
            </div>
            <div className={styles.rowContainer}>
              <div 
                className={styles.row}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onClickCapture={handleClickCapture}
                onWheel={handleWheel}
              >
                {upcomingAnime.map(renderAnimeCard)}
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Home; 