import Layout from '../components/Layout';
import styles from '../styles/About.module.css';

export default function Help() {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Помощь</h1>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Навигация по сайту</h2>
            <p>
              На сайте есть несколько основных разделов:
            </p>
            <ul className={styles.list}>
              <li><strong>Аниме</strong> - каталог аниме с возможностью поиска и фильтрации</li>
              <li><strong>Манга</strong> - раздел с мангой различных жанров</li>
              <li><strong>Ранобэ</strong> - коллекция ранобэ</li>
              <li><strong>Каталог</strong> - общий каталог со всеми материалами</li>
              <li><strong>Новости</strong> - актуальные новости из мира аниме и манги</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Поиск</h2>
            <p>
              Для поиска контента используйте строку поиска в верхней части сайта. 
              Вы можете искать по названию, жанрам и другим параметрам.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Обратная связь</h2>
            <p>
              Если у вас возникли вопросы или предложения, вы можете связаться с нами 
              через контакты, указанные в нижней части сайта.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
} 