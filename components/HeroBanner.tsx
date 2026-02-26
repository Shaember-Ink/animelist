import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlay } from 'react-icons/fa';
import styles from '../styles/HeroBanner.module.css';

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  synopsis: string;
}

interface HeroBannerProps {
  animeList: Anime[];
}

export default function HeroBanner({ animeList }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!animeList || animeList.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % animeList.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [animeList]);

  if (!animeList || animeList.length === 0) return null;

  const currentAnime = animeList[currentIndex];

  return (
    <div className={styles.heroContainer}>
      {/* Background Image (blurred) */}
      <div 
        className={styles.heroBackgroundImage} 
        style={{ backgroundImage: `url(${currentAnime.images.jpg.large_image_url})` }}
      />
      <div className={styles.heroOverlay} />
      
      <div className={styles.heroContent} key={currentAnime.mal_id}>
        <div className={styles.leftColumn}>
          <div className={styles.featuredTag}>FEATURED SERIES</div>
          <h1 className={styles.heroTitle}>{currentAnime.title}</h1>
          <p className={styles.heroSynopsis}>
            {currentAnime.synopsis ? (currentAnime.synopsis.length > 200 ? `${currentAnime.synopsis.substring(0, 200)}...` : currentAnime.synopsis) : 'No synopsis available.'}
          </p>
          <div className={styles.heroActions}>
            <Link href={`/watch/${currentAnime.mal_id}`} className={styles.btnWatch}>
              <FaPlay className={styles.btnIcon} /> Watch Now
            </Link>
          </div>
          
          <div className={styles.carouselIndicators}>
            {animeList.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === currentIndex ? styles.activeIndicator : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className={styles.rightColumn}>
          <img 
            src={currentAnime.images.jpg.large_image_url} 
            alt={currentAnime.title} 
            className={styles.heroPoster} 
          />
        </div>
      </div>
    </div>
  );
}
