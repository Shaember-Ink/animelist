import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Layout.module.css';
import { FaSearch, FaTelegram, FaGithub, FaEnvelope } from 'react-icons/fa';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.navContent}>
            <Link href="/" className={styles.logo}>
              AnimeList
            </Link>

            <div className={styles.mainNav}>
              <Link
                href="/anime"
                className={`${styles.navLink} ${isActive('/anime') ? styles.active : ''}`}
              >
                Аниме
              </Link>
              <Link
                href="/catalog"
                className={`${styles.navLink} ${isActive('/catalog') ? styles.active : ''}`}
              >
                Манга
              </Link>
              <Link
                href="/ranobe"
                className={`${styles.navLink} ${isActive('/ranobe') ? styles.active : ''}`}
              >
                Ранобэ
              </Link>
              <Link
                href="/catalog"
                className={`${styles.navLink} ${isActive('/catalog') ? styles.active : ''}`}
              >
                Каталог
              </Link>
              <Link
                href="/news"
                className={`${styles.navLink} ${isActive('/news') ? styles.active : ''}`}
              >
                Новости
              </Link>
            </div>

            <div className={styles.searchIcon}>
              <Link href="/search" className={styles.iconButton}>
                <FaSearch />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>База данных</h3>
            <ul>
              <li><Link href="/anime">Аниме</Link></li>
              <li><Link href="/manga">Манга</Link></li>
              <li><Link href="/ranobe">Ранобэ</Link></li>
              <li><Link href="/catalog">Каталог</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>О проекте</h3>
            <ul>
              <li><Link href="/about">О нас</Link></li>
              <li><Link href="/rules">Правила</Link></li>
              <li><Link href="/help">Помощь</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Контакты</h3>
            <ul className={styles.contactsList}>
              <li>
                <a href="https://t.me/Shaember" target="_blank" rel="noopener noreferrer">
                  <FaTelegram /> Telegram
                </a>
              </li>
              <li>
                <a href="https://github.com/Shaember" target="_blank" rel="noopener noreferrer">
                  <FaGithub /> Github
                </a>
              </li>
              <li>
                <a href="mailto:shaember@yandex.ru">
                  <FaEnvelope /> shaember@yandex.ru
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
} 