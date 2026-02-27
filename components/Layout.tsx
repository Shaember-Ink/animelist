import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Layout.module.css";
import { FaSearch, FaTelegram, FaGithub, FaEnvelope } from "react-icons/fa";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return router.pathname === '/';
    // Exact match for the path
    if (router.pathname === path) return true;
    // Special case for /anime to not match sub-routes that have their own tabs
    if (path === '/anime' && router.pathname.startsWith('/anime/') && router.pathname !== '/anime') {
      const subroutes = ['/anime/popular', '/anime/upcoming', '/anime/new'];
      return !subroutes.includes(router.pathname);
    }
    return router.pathname.startsWith(path);
  };

  const isHomePage = router.pathname === '/';

  return (
    <div className={styles.wrapper}>
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''} ${!isHomePage ? styles.headerSolid : ''}`}>
        <div className={styles.headerContent}>
          <nav className={styles.nav}>
            <div className={styles.navLeft}>
              <Link href="/" className={styles.logo}>
                ANIMELIST
              </Link>
              <div className={styles.mainNav}>
                <Link href="/" className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}>Home</Link>
                <Link href="/anime" className={`${styles.navLink} ${isActive("/anime") ? styles.active : ""}`}>Catalog</Link>
                <Link href="/anime/popular" className={`${styles.navLink} ${isActive("/anime/popular") ? styles.active : ""}`}>Popular</Link>
              </div>
            </div>
            <div className={styles.navRight}>
              <Link href="/search" className={styles.iconButton}>
                <FaSearch />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className={styles.main} style={{ paddingTop: isHomePage ? 0 : '80px' }}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Resource</h3>
            <ul>
              <li><Link href="/anime">Anime</Link></li>
              <li><Link href="/catalog">Catalog</Link></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h3>Legal</h3>
            <ul>
              <li><Link href="/about">Terms Of Use</Link></li>
              <li><Link href="/rules">Privacy Policy</Link></li>
              <li><Link href="/help">Security</Link></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h3>Contact Us</h3>
            <ul className={styles.contactsList}>
              <li><Link href="/help"><FaEnvelope /> Support</Link></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>©2026 AnimeList. All Right Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
