import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '@/styles/Read.module.css';
import * as mangakakalot from '@/utils/mangakakalot';
import Link from 'next/link';

export default function ReadManga() {
  const router = useRouter();
  const { id } = router.query;
  
  const [manga, setManga] = useState<mangakakalot.MangaKakalotManga | null>(null);
  const [currentChapter, setCurrentChapter] = useState<mangakakalot.MangaKakalotChapter | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadManga() {
      try {
        setLoading(true);
        setError(null);
        
        // Загружаем информацию о манге
        const mangaData = await mangakakalot.getManga(id as string);
        setManga(mangaData);
        
        // Если есть главы, выбираем первую
        if (mangaData.chapters.length > 0) {
          const firstChapter = mangaData.chapters[0];
          setCurrentChapter(firstChapter);
          
          // Загружаем страницы главы
          const chapterPages = await mangakakalot.getChapterPages(firstChapter.url);
          setPages(chapterPages);
        } else {
          throw new Error('Главы не найдены');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadManga();
  }, [id]);

  async function handleChapterChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const chapterId = event.target.value;
    const selectedChapter = manga?.chapters.find(ch => ch.id === chapterId);
    
    if (selectedChapter) {
      try {
        setLoading(true);
        setError(null);
        setCurrentChapter(selectedChapter);
        
        const chapterPages = await mangakakalot.getChapterPages(selectedChapter.url);
        setPages(chapterPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Ошибка</h2>
          <p>{error}</p>
          <div className={styles.errorDetails}>
            <p>Возможные причины:</p>
            <ul>
              <li>Манга не найдена</li>
              <li>Главы недоступны для чтения</li>
              <li>Проблемы с подключением к серверу</li>
            </ul>
          </div>
          <div className={styles.errorActions}>
            <Link href={`/manga/${id}`} className={styles.returnButton}>
              <FaArrowLeft /> Вернуться к манге
            </Link>
            <Link href="/catalog" className={styles.catalogButton}>
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{manga?.title} - Чтение - AniList</title>
        <meta name="description" content={`Читать мангу ${manga?.title} онлайн`} />
      </Head>

      <div className={styles.header}>
        <Link href={`/manga/${id}`} className={styles.backButton}>
          <FaArrowLeft /> Назад
        </Link>
        
        <h1>{manga?.title}</h1>
        
        <select 
          value={currentChapter?.id} 
          onChange={handleChapterChange}
          className={styles.chapterSelect}
        >
          {manga?.chapters.map(chapter => (
            <option key={chapter.id} value={chapter.id}>
              Глава {chapter.number}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.reader}>
        {pages.map((pageUrl, index) => (
          <div key={index} className={styles.page}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={pageUrl} 
              alt={`Страница ${index + 1}`}
              className={styles.pageImage}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 