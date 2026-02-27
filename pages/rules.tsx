import Layout from '../components/Layout';
import styles from '../styles/About.module.css';
import Head from 'next/head';

export default function Rules() {
  return (
    <Layout>
      <Head>
        <title>Terms of Use - AnimeList</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Terms of Use</h1>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Acceptable Use</h2>
            <p>
              AnimeList is intended for personal, non-commercial use. All information provided on the
              site is "as-is" and may be modified without prior notice. Users are expected to use the
              platform responsibly for anime discovery and metadata browsing.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Content Disclaimer</h2>
            <p>
              All content on this site is for informational and educational purposes only. We do not
              host copyrighted video files on our servers. All metadata and images are retrieved
              via public third-party APIs (Jikan/MyAnimeList).
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Limitation of Liability</h2>
            <p>
              The site administration is not responsible for the accuracy or timeliness of the
              information provided. As an experimental project, AnimeList may contain technical
              inaccuracies or typographical errors.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}