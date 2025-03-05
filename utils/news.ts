interface NewsItem {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
  source: string;
  url: string;
}

// Временные тестовые данные для новостей
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Анонсирован новый сезон "Demon Slayer"',
    content: 'Студия ufotable официально анонсировала новый сезон аниме "Demon Slayer: Kimetsu no Yaiba". Премьера запланирована на 2024 год.',
    image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
    date: '2024-03-01',
    source: 'AnimeNews Network',
    url: '#'
  },
  {
    id: '2',
    title: 'One Piece празднует 25-летие',
    content: 'Манга One Piece отмечает свое 25-летие. В честь юбилея анонсированы специальные мероприятия и коллаборации.',
    image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
    date: '2024-02-28',
    source: 'Crunchyroll',
    url: '#'
  },
  {
    id: '3',
    title: 'Новый фильм Studio Ghibli',
    content: 'Studio Ghibli анонсировала новый полнометражный анимационный фильм. Хаяо Миядзаки выступит креативным консультантом проекта.',
    image: 'https://cdn.myanimelist.net/images/anime/1305/132237.jpg',
    date: '2024-02-25',
    source: 'ANN',
    url: '#'
  }
];

export async function getNews(): Promise<NewsItem[]> {
  // В будущем здесь будет реальный API запрос
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockNews);
    }, 1000);
  });
}

export type { NewsItem }; 