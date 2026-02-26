import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Layout from '../../components/Layout';
import styles from '../../styles/CharacterDetail.module.css';
import { FaStar, FaHeart } from 'react-icons/fa';
import { fetchWithRetry } from '../../utils/api';

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

interface CharacterDetailPageProps {
  character: Character | null;
  error: string | null;
}

export const getServerSideProps: GetServerSideProps<CharacterDetailPageProps> = async ({ params, res }) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );

  const id = params?.id;

  if (!id || typeof id !== 'string') {
    return { notFound: true };
  }

  try {
    const characterData = await fetchWithRetry(`https://api.jikan.moe/v4/characters/${id}/full`);
    return {
      props: {
        character: characterData?.data || null,
        error: null,
      },
    };
  } catch (err) {
    console.error('Error fetching character detail data in getServerSideProps:', err);
    return {
      props: {
        character: null,
        error: 'Произошла ошибка при загрузке данных о персонаже.',
      },
    };
  }
};

export default function CharacterDetailPage({ character, error }: CharacterDetailPageProps) {
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
              {character.animeography.map((entry, index) => (
                <div key={`${entry.anime.mal_id}-${index}`} className={styles.mediaCard}>
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

        {character.voice_actors && character.voice_actors.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Сэйю</h3>
            <div className={styles.voiceActorsGrid}>
              {character.voice_actors.map((va, index) => (
                <div key={`${va.person.mal_id}-${index}`} className={styles.vaCard}>
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