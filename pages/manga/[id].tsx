import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FaSearch, FaBookOpen } from 'react-icons/fa';
import styles from '@/styles/Watch.module.css';
import * as mangakakalot from '@/utils/mangakakalot';

export default function MangaPage() {
  const router = useRouter();
  const { id } = router.query;

  const [manga, setManga] = useState<mangakakalot.MangaKakalotManga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<mangakakalot.MangaKakalotManga[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchMangaData() {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching manga data for ID:', id);
        const data = await mangakakalot.getManga(id as string);
        console.log('Received manga data:', data);
        
        if (!data.title || !data.chapters || data.chapters.length === 0) {
          throw new Error('Не удалось загрузить информацию о манге');
        }
        
        setManga(data);
      } catch (err) {
        console.error('Error fetching manga:', err);
        setError((err as Error).message);
        // Если манга не найдена, показываем поиск
        handleSearch(id as string);
      } finally {
        setLoading(false);
      }
    }

    fetchMangaData();
  }, [id]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setSearching(true);
      setSearchQuery(query);
      console.log('Searching for:', query);
      const results = await mangakakalot.searchManga(query);
      console.log('Search results:', results);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching manga:', err);
      setError((err as Error).message);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка манги...</p>
        </div>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className={styles.container}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Поиск манги..."
              className={styles.searchInput}
            />
            <FaSearch
              className={styles.searchIcon}
              onClick={() => handleSearch(searchQuery)}
            />
          </div>

          {searching ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Поиск манги...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className={styles.searchResults}>
              {searchResults.map((result) => (
                <Link
                  href={`/manga/${encodeURIComponent(result.id)}`}
                  key={result.id}
                  className={styles.searchResult}
                >
                  <div className={styles.resultImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.image} alt={result.title} />
                  </div>
                  <div className={styles.resultInfo}>
                    <h3>{result.title}</h3>
                    {result.alternativeTitle && (
                      <p className={styles.japaneseTitle}>{result.alternativeTitle}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              {error ? (
                <>
                  <p>{error}</p>
                  <p>Попробуйте найти мангу по названию</p>
                </>
              ) : (
                <p>Ничего не найдено</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{manga.title} - AniList</title>
        <meta name="description" content={manga.description} />
      </Head>

      <div className={styles.header}>
        <div className={styles.cover}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={manga.image} 
            alt={manga.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />
        </div>

        <div className={styles.info}>
          <h1>{manga.title}</h1>
          {manga.alternativeTitle && (
            <h2 className={styles.alternativeTitle}>{manga.alternativeTitle}</h2>
          )}

          <div className={styles.details}>
            <div className={styles.status}>
              <span>Статус:</span> {manga.status}
            </div>
            <div className={styles.chapters}>
              <span>Глав:</span> {manga.chapters.length}
            </div>
          </div>

          <p className={styles.description}>{manga.description}</p>

          <div className={styles.actions}>
            <Link 
              href={`/manga/${encodeURIComponent(id as string)}/read`} 
              className={styles.readButton}
            >
              <FaBookOpen /> Читать
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.chapterList}>
        <h2>Список глав</h2>
        <div className={styles.chapters}>
          {manga.chapters.map((chapter) => (
            <Link
              href={`/manga/${encodeURIComponent(id as string)}/read?chapter=${encodeURIComponent(chapter.id)}`}
              key={chapter.id}
              className={styles.chapter}
            >
              <span className={styles.chapterNumber}>Глава {chapter.number}</span>
              {chapter.title && (
                <span className={styles.chapterTitle}>{chapter.title}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 