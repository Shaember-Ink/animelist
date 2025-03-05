import Layout from '../components/Layout';
import styles from '../styles/About.module.css';

export default function About() {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>О нас</h1>
        <div className={styles.content}>
          <p>
            AnimeList - это проект, созданный для личного пользования и в учебных целях. 
            Наш сайт предоставляет удобный способ отслеживать и находить информацию об аниме, 
            манге и ранобэ.
          </p>
          <p>
            Этот проект является некоммерческим и создан с целью изучения современных 
            веб-технологий и практики в разработке пользовательских интерфейсов.
          </p>
          <p>
            Мы стремимся создать удобную и функциональную платформу для любителей 
            японской анимации и культуры, где каждый может найти интересующий его контент.
          </p>
        </div>
      </div>
    </Layout>
  );
} 