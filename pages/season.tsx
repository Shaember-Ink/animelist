import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Season.module.css';
import { searchAnime, KodikAnime } from '../utils/kodik';

interface AnimeItem {
  id: string;
  title: string;
  image: string;
  description: string;
  year: number;
  status: string;
  episodes: {
    current: number;
    total: number | string;
  };
}

export default function Season() {
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState<string>('');

  useEffect(() => {
    async function loadSeasonAnime() {
      try {
        setLoading(true);
        setError('');
        setDebug('Начало загрузки...');

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        // Определяем текущий сезон
        const season = 
          currentMonth <= 3 ? 'Зима' :
          currentMonth <= 6 ? 'Весна' :
          currentMonth <= 9 ? 'Лето' : 'Осень';

        setDebug(prev => `${prev}\nТекущий сезон: ${season} ${currentYear}`);

        const results = await searchAnime({
          year: currentYear,
          limit: 100,
          types: 'anime-serial,anime'
        });

        setDebug(prev => `${prev}\nПолучено аниме: ${results.length}`);

        // Фильтруем аниме по дате создания для текущего сезона
        const seasonStart = new Date(currentYear, (Math.floor((currentMonth - 1) / 3) * 3), 1);
        const seasonEnd = new Date(currentYear, (Math.floor((currentMonth - 1) / 3) * 3) + 3, 0);

        const seasonalAnime = results.filter(anime => {
          const animeDate = new Date(anime.created_at);
          return animeDate >= seasonStart && animeDate <= seasonEnd;
        });

        setDebug(prev => `${prev}\nОтфильтровано для сезона: ${seasonalAnime.length}`);

        const formattedAnime = seasonalAnime.map(anime => ({
          id: anime.id,
          title: anime.title || anime.title_orig,
          image: anime.material_data?.poster_url || '',
          description: anime.material_data?.description || '',
          year: parseInt(anime.year.toString()),
          status: anime.material_data?.status || 'Онгоинг',
          episodes: {
            current: anime.material_data?.episodes_aired || 0,
            total: anime.material_data?.episodes_total || '?'
          }
        }));

        setAnimeList(formattedAnime);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError(`Не удалось загрузить список сезонного аниме: ${errorMessage}`);
        console.error('Ошибка загрузки:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSeasonAnime();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Сезонное аниме | AniList</title>
        <meta name="description" content="Текущий сезон аниме" />
      </Head>

      <h1 className={styles.title}>Сезонное аниме</h1>

      {loading && (
        <div className={styles.loading}>
          Загрузка...
          <pre className={styles.debug}>{debug}</pre>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
          <pre className={styles.debug}>{debug}</pre>
        </div>
      )}

      <div className={styles.grid}>
        {animeList.map((anime) => (
          <div key={anime.id} className={styles.card}>
            <img 
              src={anime.image || '/placeholder.jpg'} 
              alt={anime.title} 
              className={styles.image}
            />
            <div className={styles.content}>
              <h3 className={styles.animeTitle}>{anime.title}</h3>
              <p className={styles.episodes}>
                Эпизоды: {anime.episodes.current} / {anime.episodes.total}
              </p>
              <p className={styles.year}>{anime.year}</p>
              <p className={styles.status}>{anime.status}</p>
              <p className={styles.description}>{anime.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 