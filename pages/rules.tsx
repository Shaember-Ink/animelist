import Layout from '../components/Layout';
import styles from '../styles/About.module.css';

export default function Rules() {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Правила использования</h1>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Общие положения</h2>
            <p>
              Сайт предназначен для личного некоммерческого использования. 
              Вся информация на сайте предоставляется "как есть" и может быть изменена 
              без предварительного уведомления.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Использование контента</h2>
            <p>
              Весь контент на сайте предназначен исключительно для ознакомительных целей.
              При использовании материалов сайта, пожалуйста, указывайте источник.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Ограничение ответственности</h2>
            <p>
              Администрация сайта не несет ответственности за точность и актуальность 
              представленной информации. Сайт является учебным проектом и может содержать 
              неточности или ошибки.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
} 