import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Navigation.module.css';

export default function Navigation() {
  const router = useRouter();

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          AnimeList
        </Link>
        
        <div className={styles.links}>
          <Link 
            href="/" 
            className={`${styles.link} ${router.pathname === '/' ? styles.active : ''}`}
          >
            Главная
          </Link>
          <Link 
            href="/search" 
            className={`${styles.link} ${router.pathname === '/search' ? styles.active : ''}`}
          >
            Поиск
          </Link>
        </div>
      </div>
    </nav>
  );
} 