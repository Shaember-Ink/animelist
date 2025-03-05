import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import KodikPlayer from '@/components/KodikPlayer';
import styles from '@/styles/Watch.module.css';
import * as kodik from '@/utils/kodik';

export default function WatchAnime() {
  const router = useRouter();
  const { id, episode } = router.query;

  const [anime, setAnime] = useState<kodik.KodikAnime | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [translations, setTranslations] = useState<{ id: number; title: string }[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadAnimeData() {
      try {
        setLoading(true);
        setError(null);

        // Загружаем информацию об аниме
        const animeData = await kodik.getAnimeById(id as string);
        setAnime(animeData);

        // Загружаем список переводов
        const translationsList = await kodik.getTranslations(id as string);
        setTranslations(translationsList);

        if (translationsList.length > 0) {
          setSelectedTranslation(translationsList[0].id);
        }

        // Устанавливаем текущий эпизод
        if (episode) {
          setCurrentEpisode(parseInt(episode as string));
        }
      } catch (err) {
        console.error('Error loading anime:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadAnimeData();
  }, [id, episode]);

  const handleEpisodeChange = (newEpisode: number) => {
    setCurrentEpisode(newEpisode);
    router.push(
      `/anime/${id}/watch?episode=${newEpisode}`,
      undefined,
      { shallow: true }
    );
  };

  const handleTranslationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTranslation(parseInt(event.target.value));
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Ошибка</h2>
          <p>{error || 'Не удалось загрузить аниме'}</p>
          <button 
            onClick={() => router.back()} 
            className={styles.backButton}
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  const playerUrl = kodik.getPlayerUrl(
    kodik.getEpisodeUrl(anime.id, currentEpisode, selectedTranslation)
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>{`${anime.title} - Эпизод ${currentEpisode} - AniList`}</title>
        <meta name="description" content={`Смотреть ${anime.title} онлайн`} />
      </Head>

      <div className={styles.playerSection}>
        <KodikPlayer 
          url={playerUrl}
          title={`${anime.title} - Эпизод ${currentEpisode}`}
        />

        <div className={styles.controls}>
          <div className={styles.episodeControls}>
            <button
              onClick={() => handleEpisodeChange(currentEpisode - 1)}
              disabled={currentEpisode <= 1}
              className={styles.actionButton}
            >
              Предыдущий эпизод
            </button>

            <select
              value={currentEpisode}
              onChange={(e) => handleEpisodeChange(parseInt(e.target.value))}
              className={styles.episodeSelect}
            >
              {Array.from({ length: anime.material_data.episodes_total }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Эпизод {i + 1}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleEpisodeChange(currentEpisode + 1)}
              disabled={currentEpisode >= anime.material_data.episodes_total}
              className={styles.actionButton}
            >
              Следующий эпизод
            </button>
          </div>

          <div className={styles.translationControl}>
            <select
              value={selectedTranslation}
              onChange={handleTranslationChange}
              className={styles.translationSelect}
            >
              {translations.map((translation) => (
                <option key={translation.id} value={translation.id}>
                  {translation.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.episodeInfo}>
        <h1 className={styles.title}>{anime.title}</h1>
        <h2 className={styles.episodeTitle}>Эпизод {currentEpisode}</h2>
      </div>

      <div className={styles.episodesList}>
        <h3 className={styles.episodesTitle}>Список эпизодов</h3>
        <div className={styles.episodesGrid}>
          {Array.from({ length: anime.material_data.episodes_total }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handleEpisodeChange(i + 1)}
              className={`${styles.episodeButton} ${currentEpisode === i + 1 ? styles.active : ''}`}
            >
              <span className={styles.episodeNumber}>{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 