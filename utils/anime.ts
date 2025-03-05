const KODIK_API_URL = 'https://kodikapi.com';
const KODIK_TOKEN = process.env.NEXT_PUBLIC_KODIK_TOKEN;

export interface AnimeFilters {
  title?: string;
  year?: number;
  genre?: string[];
  status?: string;
  type?: string;
  sort?: string;
  page?: number;
}

export interface AnimeItem {
  id: string;
  title: string;
  titleOriginal: string;
  year: number;
  description: string;
  poster: string;
  status: string;
  type: string;
  genres: string[];
  rating: number;
  episodes: {
    current: number;
    total: number | string;
  };
}

export const ANIME_TYPES = [
  { value: 'tv-series', label: 'TV Сериал' },
  { value: 'movie', label: 'Фильм' },
  { value: 'ova', label: 'OVA' },
  { value: 'ona', label: 'ONA' },
  { value: 'special', label: 'Спешл' }
];

export const ANIME_STATUS = [
  { value: 'ongoing', label: 'Онгоинг' },
  { value: 'completed', label: 'Завершён' },
  { value: 'announced', label: 'Анонсировано' }
];

export const SORT_OPTIONS = [
  { value: 'year', label: 'По году' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'title', label: 'По названию' },
  { value: 'created_at', label: 'По дате добавления' }
];

export const GENRES = [
  'Боевик', 'Приключения', 'Комедия', 'Драма', 'Фэнтези',
  'Игры', 'Историческое', 'Ужасы', 'Магия', 'Боевые искусства',
  'Меха', 'Музыка', 'Детектив', 'Романтика', 'Научная фантастика',
  'Повседневность', 'Спорт', 'Супер сила', 'Школа', 'Сёнен',
  'Сёдзё', 'Сэйнэн', 'Сёдзё-ай', 'Сёнен-ай'
];

export async function searchAnime(filters: AnimeFilters): Promise<{
  items: AnimeItem[];
  total: number;
}> {
  try {
    const params = new URLSearchParams({
      token: KODIK_TOKEN || '',
      types: 'anime-serial,anime',
      limit: '20',
      with_material_data: 'true',
      sort: filters.sort || 'created_at',
      order: 'desc',
      page: (filters.page || 1).toString()
    });

    if (filters.title) {
      params.append('title', filters.title);
    }

    if (filters.year) {
      params.append('year', filters.year.toString());
    }

    if (filters.type) {
      params.append('anime_type', filters.type);
    }

    if (filters.status) {
      params.append('status', filters.status);
    }

    if (filters.genre && filters.genre.length > 0) {
      filters.genre.forEach(genre => {
        params.append('genre[]', genre);
      });
    }

    const response = await fetch(`${KODIK_API_URL}/search?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка при получении данных');
    }

    const items = data.results.map((item: any) => ({
      id: item.id,
      title: item.title || item.title_orig,
      titleOriginal: item.title_orig,
      year: parseInt(item.year),
      description: item.material_data?.description || '',
      poster: item.material_data?.poster_url || '',
      status: item.material_data?.status || 'Неизвестно',
      type: item.material_data?.anime_type || 'tv',
      genres: item.material_data?.genres || [],
      rating: item.material_data?.shikimori_rating || 0,
      episodes: {
        current: item.material_data?.episodes_aired || 0,
        total: item.material_data?.episodes_total || '?'
      }
    }));

    return {
      items,
      total: data.total || items.length
    };
  } catch (error) {
    console.error('Ошибка при поиске аниме:', error);
    throw error;
  }
} 