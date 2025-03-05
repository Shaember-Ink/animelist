import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import styles from '../../styles/AnimeDetail.module.css';
import { FaStar, FaPlay, FaHeart, FaBookmark, FaShare, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoTimeOutline, IoCalendarOutline, IoTvOutline, IoPeopleOutline, IoPencilOutline } from 'react-icons/io5';
import Link from 'next/link';

interface Character {
  character: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  role: string;
  voice_actors: Array<{
    person: {
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

interface Staff {
  person: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  positions: string[];
}

interface AnimeDetail {
  mal_id: number;
  title: string;
  title_japanese: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string;
    url: string;
  };
  synopsis: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  status: string;
  episodes: number;
  duration: string;
  rating: string;
  season: string;
  year: number;
  genres: Array<{ name: string }>;
  studios: Array<{ name: string }>;
  aired: {
    string: string;
  };
}

interface AnimeRecommendation {
  entry: {
    mal_id: number;
    title: string;
    images: {
      jpg: {
        large_image_url: string;
      };
    };
  };
  votes: number;
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
      await delay(1000); // Ждем секунду перед повторной попыткой
    }
  }
};

export default function AnimeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [recommendations, setRecommendations] = useState<AnimeRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  useEffect(() => {
    const fetchAnimeData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const animeData = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}`);
        await delay(1000);
        const charactersData = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/characters`);
        await delay(1000);
        const staffData = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/staff`);
        await delay(1000);
        const recommendationsData = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/recommendations`);

        setAnime(animeData.data);
        setCharacters(charactersData.data);
        setStaff(staffData.data);
        setRecommendations(recommendationsData.data);
      } catch (err) {
        console.error('Error fetching anime data:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка информации об аниме...</p>
        </div>
      </Layout>
    );
  }

  if (error || !anime) {
    return (
      <Layout>
        <div className={styles.error}>
          {error || 'Аниме не найдено'}
        </div>
      </Layout>
    );
  }

  const displayedStaff = showAllStaff ? staff : staff.slice(0, 6);
  const displayedCharacters = showAllCharacters ? characters : characters.slice(0, 8);
  const displayedRecommendations = showAllRecommendations ? recommendations : recommendations.slice(0, 10);

  return (
    <Layout>
      <Head>
        <title>{anime.title} - AnimeList</title>
        <meta name="description" content={anime.synopsis?.slice(0, 160)} />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className={styles.heroSection} style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)), url(${anime.images.jpg.large_image_url})`
      }}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.coverWrapper}>
              <img 
                src={anime.images.jpg.large_image_url} 
                alt={anime.title}
                className={styles.cover}
              />
              <div className={styles.actions}>
                <Link href={`/watch/${anime.mal_id}`} className={`${styles.actionButton} ${styles.watchButton}`}>
                  <FaPlay />
                  <span>Смотреть</span>
                </Link>
                <button type="button" className={`${styles.actionButton} ${styles.listButton}`}>
                  <FaBookmark />
                  <span>Добавить в список</span>
                </button>
                <button type="button" className={`${styles.actionButton} ${styles.favoriteButton}`}>
                  <FaHeart />
                  <span>В избранное</span>
                </button>
                <button type="button" className={`${styles.actionButton} ${styles.shareButton}`}>
                  <FaShare />
                  <span>Поделиться</span>
                </button>
              </div>
            </div>

            <div className={styles.info}>
              <div className={styles.titleWrapper}>
                <h1 className={styles.title}>{anime.title}</h1>
                {anime.title_japanese && (
                  <h2 className={styles.japaneseTitle}>{anime.title_japanese}</h2>
                )}
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <FaStar className={styles.statIcon} />
                  <div className={styles.statContent}>
                    <span className={styles.statValue} data-score="true">{anime.score || '??'}</span>
                    <span className={styles.statLabel}>Рейтинг</span>
                    {anime.scored_by && (
                      <span className={styles.statSubtext}>
                        {anime.scored_by.toLocaleString()} оценок
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.statItem}>
                  <IoTvOutline className={styles.statIcon} />
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>#{anime.rank || '??'}</span>
                    <span className={styles.statLabel}>Место</span>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <IoCalendarOutline className={styles.statIcon} />
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>#{anime.popularity || '??'}</span>
                    <span className={styles.statLabel}>Популярность</span>
                  </div>
                </div>
              </div>

              <div className={styles.details}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    <IoTimeOutline className={styles.detailIcon} /> Статус:
                  </span>
                  <span className={styles.detailValue}>{anime.status}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    <IoTvOutline className={styles.detailIcon} /> Эпизоды:
                  </span>
                  <span className={styles.detailValue}>
                    {anime.episodes || 'Неизвестно'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    <IoTimeOutline className={styles.detailIcon} /> Длительность:
                  </span>
                  <span className={styles.detailValue}>
                    {anime.duration || 'Неизвестно'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    <IoCalendarOutline className={styles.detailIcon} /> Сезон:
                  </span>
                  <span className={styles.detailValue}>
                    {anime.season ? `${anime.season} ${anime.year}` : 'Неизвестно'}
                  </span>
                </div>
                {anime.studios && anime.studios.length > 0 && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      <IoTvOutline className={styles.detailIcon} /> Студия:
                    </span>
                    <span className={styles.detailValue}>
                      {anime.studios.map(studio => studio.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {anime.genres && (
                <div className={styles.genres}>
                  {anime.genres.map(genre => (
                    <span key={genre.name} className={styles.genre}>
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {anime.synopsis && (
          <div className={styles.synopsis}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📝</span> Описание
            </h3>
            <p className={styles.synopsisText}>{anime.synopsis}</p>
          </div>
        )}

        {anime.trailer?.youtube_id && (
          <div className={styles.trailerSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🎬</span> Трейлер
            </h3>
            <div className={styles.trailerWrapper}>
              <iframe
                className={styles.trailer}
                src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        <div className={styles.charactersSection}>
          <h3 className={styles.sectionTitle}>
            <IoPeopleOutline className={styles.sectionTitleIcon} /> Персонажи
          </h3>
          <div className={styles.charactersGrid}>
            {displayedCharacters.map((char) => (
              <Link 
                href={`/character/${char.character.mal_id}`} 
                key={char.character.mal_id}
                className={styles.characterCard}
              >
                <div className={styles.characterImageWrapper}>
                  <img
                    src={char.character.images.jpg.image_url}
                    alt={char.character.name}
                    className={styles.characterImage}
                  />
                </div>
                <div className={styles.characterInfo}>
                  <h4 className={styles.characterName}>{char.character.name}</h4>
                  <span className={styles.characterRole}>{char.role}</span>
                  {char.voice_actors[0] && (
                    <div className={styles.voiceActor}>
                      <img
                        src={char.voice_actors[0].person.images.jpg.image_url}
                        alt={char.voice_actors[0].person.name}
                        className={styles.vaImage}
                      />
                      <span className={styles.vaName}>
                        {char.voice_actors[0].person.name}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {characters.length > 8 && (
            <button 
              className={styles.showMoreButton}
              onClick={() => setShowAllCharacters(!showAllCharacters)}
            >
              {showAllCharacters ? (
                <>Свернуть <FaChevronUp /></>
              ) : (
                <>Показать больше персонажей <FaChevronDown /></>
              )}
            </button>
          )}
        </div>

        {staff.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <IoPencilOutline className={styles.sectionIcon} /> Авторы
            </h2>
            <div className={styles.staffGrid}>
              {displayedStaff.map((staffMember) => (
                <div key={staffMember.person.mal_id} className={styles.staffCard}>
                  <img
                    src={staffMember.person.images.jpg.image_url}
                    alt={staffMember.person.name}
                    className={styles.staffImage}
                  />
                  <div className={styles.staffInfo}>
                    <h3 className={styles.staffName}>{staffMember.person.name}</h3>
                    <p className={styles.staffPosition}>{staffMember.positions.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
            {staff.length > 6 && (
              <button 
                className={styles.showMoreButton}
                onClick={() => setShowAllStaff(!showAllStaff)}
              >
                {showAllStaff ? (
                  <>Свернуть <FaChevronUp /></>
                ) : (
                  <>Показать всех <FaChevronDown /></>
                )}
              </button>
            )}
          </section>
        )}

        {recommendations.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaStar className={styles.sectionIcon} /> Похожие аниме
            </h2>
            <div className={styles.recommendationsGrid}>
              {displayedRecommendations.map((rec) => (
                <Link
                  href={`/anime/${rec.entry.mal_id}`}
                  key={rec.entry.mal_id}
                  className={styles.recommendationCard}
                >
                  <div className={styles.recommendationImageWrapper}>
                    <img
                      src={rec.entry.images.jpg.large_image_url}
                      alt={rec.entry.title}
                      className={styles.recommendationImage}
                    />
                    <div className={styles.recommendationOverlay}>
                      <span className={styles.recommendationVotes}>
                        <FaHeart /> {rec.votes}
                      </span>
                    </div>
                  </div>
                  <h3 className={styles.recommendationTitle}>{rec.entry.title}</h3>
                </Link>
              ))}
            </div>
            {recommendations.length > 10 && (
              <button 
                className={styles.showMoreButton}
                onClick={() => setShowAllRecommendations(!showAllRecommendations)}
              >
                {showAllRecommendations ? (
                  <>Свернуть <FaChevronUp /></>
                ) : (
                  <>Показать больше рекомендаций <FaChevronDown /></>
                )}
              </button>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
} 