import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import styles from '../../styles/CharacterDetail.module.css';
import { FaStar, FaHeart } from 'react-icons/fa';

interface Character {
  mal_id: number;
  name: string;
  name_kanji: string;
  about: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  favorites: number;
  nicknames: string[];
  animeography: Array<{
    anime: {
      mal_id: number;
      title: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
    };
    role: string;
  }>;
  mangaography: Array<{
    manga: {
      mal_id: number;
      title: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
    };
    role: string;
  }>;
  voice_actors: Array<{
    person: {
      mal_id: number;
      name: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
    };
    language: string;
  }>;
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

export default function CharacterDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacterData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const characterData = await fetchWithRetry(`https://api.jikan.moe/v4/characters/${id}/full`);
        setCharacter(characterData.data);
      } catch (err) {
        console.error('Error fetching character data:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacterData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка информации о персонаже...</p>
        </div>
      </Layout>
    );
  }

  if (error || !character) {
    return (
      <Layout>
        <div className={styles.error}>
          {error || 'Персонаж не найден'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{character.name} - AnimeList</title>
        <meta name="description" content={character.about?.slice(0, 160)} />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.characterImage}>
            <img
              src={character.images.jpg.image_url}
              alt={character.name}
              className={styles.image}
            />
          </div>

          <div className={styles.info}>
            <div className={styles.titleWrapper}>
              <h1 className={styles.name}>{character.name}</h1>
              {character.name_kanji && (
                <h2 className={styles.nameKanji}>{character.name_kanji}</h2>
              )}
            </div>

            {character.nicknames && character.nicknames.length > 0 && (
              <div className={styles.nicknames}>
                <h3>Прозвища:</h3>
                <p>{character.nicknames.join(', ')}</p>
              </div>
            )}

            <div className={styles.stats}>
              <div className={styles.favorites}>
                <FaHeart className={styles.icon} />
                <span>{character.favorites.toLocaleString()} избранное</span>
              </div>
            </div>

            <button className={styles.favoriteButton}>
              <FaHeart /> Добавить в избранное
            </button>
          </div>
        </div>

        {character.about && (
          <div className={styles.about}>
            <h3 className={styles.sectionTitle}>О персонаже</h3>
            <p className={styles.aboutText}>{character.about}</p>
          </div>
        )}

        {character.animeography && character.animeography.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Появления в аниме</h3>
            <div className={styles.mediaGrid}>
              {character.animeography.map((entry) => (
                <div key={entry.anime.mal_id} className={styles.mediaCard}>
                  <img
                    src={entry.anime.images.jpg.image_url}
                    alt={entry.anime.title}
                    className={styles.mediaImage}
                  />
                  <div className={styles.mediaInfo}>
                    <h4 className={styles.mediaTitle}>{entry.anime.title}</h4>
                    <span className={styles.role}>{entry.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {character.mangaography && character.mangaography.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Появления в манге</h3>
            <div className={styles.mediaGrid}>
              {character.mangaography.map((entry) => (
                <div key={entry.manga.mal_id} className={styles.mediaCard}>
                  <img
                    src={entry.manga.images.jpg.image_url}
                    alt={entry.manga.title}
                    className={styles.mediaImage}
                  />
                  <div className={styles.mediaInfo}>
                    <h4 className={styles.mediaTitle}>{entry.manga.title}</h4>
                    <span className={styles.role}>{entry.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {character.voice_actors && character.voice_actors.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Сэйю</h3>
            <div className={styles.voiceActorsGrid}>
              {character.voice_actors.map((va) => (
                <div key={va.person.mal_id} className={styles.vaCard}>
                  <img
                    src={va.person.images.jpg.image_url}
                    alt={va.person.name}
                    className={styles.vaImage}
                  />
                  <div className={styles.vaInfo}>
                    <h4 className={styles.vaName}>{va.person.name}</h4>
                    <span className={styles.language}>{va.language}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 