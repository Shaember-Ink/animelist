import { useState } from 'react';
import styles from '../styles/AnimeDetails.module.css';

interface AnimeDetailsProps {
  anime: {
    mal_id: number;
    title: string;
    image_url: string;
    synopsis: string;
    score: number;
    episodes: number;
    status: string;
    aired: string;
    studios: Array<{ name: string }>;
    genres: Array<{ name: string }>;
    characters: Array<{
      character: {
        name: string;
        image_url: string;
        role: string;
      };
    }>;
  };
}

export default function AnimeDetails({ anime }: AnimeDetailsProps) {
  const [userStatus, setUserStatus] = useState('Не смотрю');
  const [userScore, setUserScore] = useState(0);
  const [userEpisodes, setUserEpisodes] = useState(0);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserStatus(e.target.value);
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserScore(Number(e.target.value));
  };

  const handleEpisodesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Math.max(0, Number(e.target.value)), anime.episodes);
    setUserEpisodes(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика сохранения данных пользователя
    console.log({
      animeId: anime.mal_id,
      status: userStatus,
      score: userScore,
      episodes: userEpisodes
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={anime.image_url} alt={anime.title} className={styles.coverImage} />
        <div className={styles.info}>
          <h1>{anime.title}</h1>
          <div className={styles.meta}>
            <p>Рейтинг: {anime.score}/10</p>
            <p>Эпизоды: {anime.episodes}</p>
            <p>Статус: {anime.status}</p>
            <p>Дата выхода: {anime.aired}</p>
          </div>
          <div className={styles.genres}>
            {anime.genres.map((genre) => (
              <span key={genre.name} className={styles.genre}>
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.synopsis}>
          <h2>Описание</h2>
          <p>{anime.synopsis}</p>
        </section>

        <section className={styles.userSection}>
          <h2>Мой прогресс</h2>
          <form onSubmit={handleSubmit} className={styles.userForm}>
            <div className={styles.formGroup}>
              <label htmlFor="status">Статус просмотра:</label>
              <select
                id="status"
                value={userStatus}
                onChange={handleStatusChange}
                className={styles.select}
              >
                <option value="Не смотрю">Не смотрю</option>
                <option value="Смотрю">Смотрю</option>
                <option value="Просмотрено">Просмотрено</option>
                <option value="Запланировано">Запланировано</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="score">Моя оценка:</label>
              <select
                id="score"
                value={userScore}
                onChange={handleScoreChange}
                className={styles.select}
              >
                <option value="0">Не оценено</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <option key={score} value={score}>
                    {score}/10
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="episodes">Просмотрено эпизодов:</label>
              <input
                type="number"
                id="episodes"
                value={userEpisodes}
                onChange={handleEpisodesChange}
                min="0"
                max={anime.episodes}
                className={styles.input}
              />
              <span className={styles.episodesTotal}>/ {anime.episodes}</span>
            </div>

            <button type="submit" className={styles.submitButton}>
              Сохранить
            </button>
          </form>
        </section>

        <section className={styles.characters}>
          <h2>Персонажи</h2>
          <div className={styles.characterGrid}>
            {anime.characters.slice(0, 10).map((char) => (
              <div key={char.character.name} className={styles.characterCard}>
                <img
                  src={char.character.image_url}
                  alt={char.character.name}
                  className={styles.characterImage}
                />
                <h3>{char.character.name}</h3>
                <p>{char.character.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 