import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import styles from '../styles/Catalog.module.css';
import { FaSearch, FaFilter, FaTimes, FaStar, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  genres: Array<{ name: string }>;
}

const ANIME_TYPES = [
  { value: 'tv', label: 'TV Сериал' },
  { value: 'movie', label: 'Фильм' },
  { value: 'ova', label: 'OVA' },
  { value: 'ona', label: 'ONA' },
  { value: 'special', label: 'Спешл' }
];

const ANIME_STATUS = [
  { value: 'airing', label: 'Онгоинг' },
  { value: 'complete', label: 'Завершён' },
  { value: 'upcoming', label: 'Анонсировано' }
];

const SORT_OPTIONS = [
  { value: 'score', label: 'По рейтингу' },
  { value: 'members', label: 'По популярности' },
  { value: 'title', label: 'По названию' },
  { value: 'start_date', label: 'По дате выхода' }
];

const GENRES = [
  'Боевик', 'Приключения', 'Комедия', 'Драма', 'Фэнтези',
  'Игры', 'Историческое', 'Ужасы', 'Магия', 'Боевые искусства',
  'Меха', 'Музыка', 'Детектив', 'Романтика', 'Научная фантастика',
  'Повседневность', 'Спорт', 'Супер сила', 'Школа', 'Сёнен',
  'Сёдзё', 'Сэйнэн', 'Сёдзё-ай', 'Сёнен-ай'
];

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

const CatalogPage: NextPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSort, setSelectedSort] = useState('members');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    type: true,
    status: true,
    year: true,
    genres: true,
    sort: true
  });

  const years = Array.from(
    { length: new Date().getFullYear() - 1990 + 1 },
    (_, i) => new Date().getFullYear() - i
  );

  const filteredGenres = GENRES.filter(genre =>
    genre.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const searchAnime = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `https://api.jikan.moe/v4/anime?page=${currentPage}&limit=24&order_by=${selectedSort}&sort=desc`;

      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }
      if (selectedType) {
        url += `&type=${selectedType}`;
      }
      if (selectedStatus) {
        url += `&status=${selectedStatus}`;
      }
      if (selectedYear) {
        url += `&start_date=${selectedYear}`;
      }
      if (selectedGenres.length > 0) {
        url += `&genres=${selectedGenres.join(',')}`;
      }

      const data = await fetchWithRetry(url);
      setAnimeList(data.data);
      setTotalPages(data.pagination.last_visible_page);
    } catch (err) {
      console.error('Error fetching anime:', err);
      setError('Произошла ошибка при загрузке данных. Пожалуйста, подождите немного и обновите страницу.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchAnime();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    searchAnime();
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedType('');
    setSelectedSort('members');
    setSelectedYear('');
    setSelectedGenres([]);
    setGenreSearch('');
    setCurrentPage(1);
    searchAnime();
  };

  return (
    <Layout>
      <Head>
        <title>Каталог аниме | AniList</title>
        <meta name="description" content="Каталог аниме с удобным поиском и фильтрами" />
      </Head>

      <div className={styles.container}>
        <div className={styles.searchBar}>
          <div className={styles.searchInput}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск аниме..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <FaSearch className={styles.searchIcon} onClick={handleSearch} />
          </div>
          <button 
            className={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <FaTimes /> : <FaFilter />}
            <span>Фильтры</span>
          </button>
        </div>

        {showFilters && (
          <div className={styles.filters}>
            <div className={styles.filterSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('type')}>
                <h3>Тип</h3>
                {expandedSections.type ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.type && (
                <div className={styles.sectionContent}>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Все типы</option>
                    {ANIME_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className={styles.filterSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('status')}>
                <h3>Статус</h3>
                {expandedSections.status ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.status && (
                <div className={styles.sectionContent}>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Все статусы</option>
                    {ANIME_STATUS.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className={styles.filterSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('year')}>
                <h3>Год</h3>
                {expandedSections.year ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.year && (
                <div className={styles.sectionContent}>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : '')}
                    className={styles.select}
                  >
                    <option value="">Все годы</option>
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className={styles.filterSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('genres')}>
                <h3>Жанры</h3>
                {expandedSections.genres ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.genres && (
                <div className={styles.sectionContent}>
                  <div className={styles.genreSearch}>
                    <input
                      type="text"
                      value={genreSearch}
                      onChange={(e) => setGenreSearch(e.target.value)}
                      placeholder="Поиск жанра..."
                      className={styles.genreSearchInput}
                    />
                  </div>
                  <div className={styles.genresList}>
                    {filteredGenres.map(genre => (
                      <label key={genre} className={styles.genreLabel}>
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre)}
                          onChange={() => toggleGenre(genre)}
                        />
                        <span>{genre}</span>
                      </label>
                    ))}
                  </div>
                  {selectedGenres.length > 0 && (
                    <div className={styles.selectedGenres}>
                      {selectedGenres.map(genre => (
                        <span key={genre} className={styles.selectedGenre}>
                          {genre}
                          <button
                            onClick={() => toggleGenre(genre)}
                            className={styles.removeGenre}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.filterSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('sort')}>
                <h3>Сортировка</h3>
                {expandedSections.sort ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.sort && (
                <div className={styles.sectionContent}>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className={styles.select}
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className={styles.filterActions}>
              <button onClick={handleReset} className={styles.resetButton}>
                Сбросить
              </button>
              <button onClick={handleSearch} className={styles.applyButton}>
                Применить
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Загрузка...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={handleSearch} className={styles.retryButton}>
              Попробовать снова
            </button>
          </div>
        ) : (
          <>
            <div className={styles.animeGrid}>
              {animeList.map(anime => (
                <div
                  key={anime.mal_id}
                  className={styles.animeCard}
                  onClick={() => router.push(`/anime/${anime.mal_id}`)}
                >
                  <div className={styles.imageWrapper}>
                    <img
                      src={anime.images.jpg.large_image_url}
                      alt={anime.title}
                      className={styles.image}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                      }}
                    />
                    {anime.score > 0 && (
                      <div className={styles.rating}>
                        <FaStar /> {anime.score.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.title}>{anime.title}</h3>
                    <div className={styles.stats}>
                      <span className={styles.type}>{anime.type}</span>
                      <span className={styles.episodes}>
                        {anime.episodes ? `${anime.episodes} эп.` : 'TBA'}
                      </span>
                    </div>
                    <div className={styles.genres}>
                      {anime.genres.slice(0, 3).map(genre => (
                        <span key={genre.name} className={styles.genre}>{genre.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {animeList.length > 0 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={styles.pageButton}
                >
                  Назад
                </button>
                <span className={styles.pageInfo}>
                  Страница {currentPage} из {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={styles.pageButton}
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default CatalogPage; 