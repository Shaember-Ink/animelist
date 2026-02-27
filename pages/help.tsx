import Layout from '../components/Layout';
import styles from '../styles/About.module.css';
import Head from 'next/head';

export default function Help() {
  return (
    <Layout>
      <Head>
        <title>Help & Support - AnimeList</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Help Center</h1>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Site Navigation</h2>
            <p>
              AnimeList provides a streamlined experience for anime fans:
            </p>
            <ul className={styles.list}>
              <li><strong>Home</strong> - Discover trending and upcoming series with our dynamic carousel.</li>
              <li><strong>Catalog</strong> - Browse the full database with advanced filtering options.</li>
              <li><strong>Search</strong> - Find specific series or characters using the search bar at the top right.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Data Accuracy</h2>
            <p>
              Our data is synced with MyAnimeList via the Jikan API. If you notice any discrepancies,
              please verify the information on the source platform.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Support</h2>
            <p>
              As this is an experimental and educational project, direct support is not provided. 
              We are constantly working to improve this platform's stability. If you're a developer, 
              feel free to explore the repository for implementation details.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}