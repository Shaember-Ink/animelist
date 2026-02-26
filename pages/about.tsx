import Layout from '../components/Layout';
import styles from '../styles/About.module.css';

export default function About() {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>About AnimeList</h1>
        <div className={styles.content}>
          <p>
            AnimeList is an experimental, non-commercial project developed exclusively for educational
            and demonstration purposes. Our goal is to provide a modern, high-performance interface
            for exploring anime metadata.
          </p>
          <p>
            <strong>Educational Scope:</strong> This platform was built to study modern web technologies
            such as Next.js, Server-Side Rendering (SSR), and Incremental Static Regeneration (ISR).
            It serves as a technical showcase for UI/UX design and API integration.
          </p>
          <p>
            <strong>Fair Use Notice:</strong> All metadata and media displayed on this site are fetched
            via the public <a href="https://jikan.moe/" target="_blank" rel="noopener noreferrer">Jikan API</a>.
            AnimeList does not host any video files or copyrighted content on its own servers. We strictly
            adhere to the principles of fair use for informational and research purposes.
          </p>
          <p>
            We are committed to providing a seamless experience for fans of Japanese animation,
            leveraging community-supported open APIs.
          </p>
        </div>
      </div>
    </Layout>
  );
} 