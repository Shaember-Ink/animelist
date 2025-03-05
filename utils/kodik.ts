const KODIK_API_URL = 'https://kodikapi.com';
const KODIK_TOKEN = 'YOUR_KODIK_TOKEN'; // Замените на ваш токен

export interface KodikAnime {
  id: string;
  title: string;
  title_orig: string;
  other_title: string;
  year: number;
  kinopoisk_id: string;
  shikimori_id: string;
  material_data: {
    episodes_total: number;
    episodes_aired: number;
    poster_url?: string;
    description?: string;
    status?: string;
  };
  translation: {
    id: number;
    title: string;
  };
  screenshots: string[];
  quality: string;
  camrip: boolean;
  created_at: string;
  updated_at: string;
  link: string;
}

export interface KodikSearchParams {
  title?: string;
  year?: number;
  kinopoisk_id?: string;
  shikimori_id?: string;
  limit?: number;
  page?: number;
  types?: string;
  translation_id?: number;
}

export async function searchAnime(params: KodikSearchParams): Promise<KodikAnime[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('token', KODIK_TOKEN);
    searchParams.append('types', 'anime-serial,anime');

    // Добавляем остальные параметры
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${KODIK_API_URL}/search?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Ошибка при поиске аниме');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw new Error('Ошибка при поиске аниме');
  }
}

export async function getAnimeById(id: string): Promise<KodikAnime> {
  try {
    const params = new URLSearchParams();
    params.append('token', KODIK_TOKEN);
    params.append('id', id);

    const response = await fetch(`${KODIK_API_URL}/search?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Ошибка при получении информации об аниме');
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('Аниме не найдено');
    }

    return data.results[0];
  } catch (error) {
    console.error('Error getting anime:', error);
    throw new Error('Ошибка при получении информации об аниме');
  }
}

export function getEpisodeUrl(animeId: string, episode: number, translation: number): string {
  return `https://kodik.info/video/${animeId}/${translation}/${episode}`;
}

export function getPlayerUrl(url: string): string {
  return `https://kodik.info/embed/${url}?hide_selectors=true&theme=dark&hide_timeline=true`;
}

// Функция для получения списка переводов
export async function getTranslations(animeId: string): Promise<{
  id: number;
  title: string;
}[]> {
  try {
    const params = new URLSearchParams();
    params.append('token', KODIK_TOKEN);
    params.append('id', animeId);

    const response = await fetch(`${KODIK_API_URL}/translations?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Ошибка при получении списка переводов');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error getting translations:', error);
    throw new Error('Ошибка при получении списка переводов');
  }
}

// Функция для получения качества видео
export async function getQualities(url: string): Promise<string[]> {
  try {
    const params = new URLSearchParams();
    params.append('token', KODIK_TOKEN);
    params.append('url', url);

    const response = await fetch(`${KODIK_API_URL}/qualities?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Ошибка при получении списка качества');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error getting qualities:', error);
    throw new Error('Ошибка при получении списка качества');
  }
}

export async function getSeasonAnime(year: number) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Определяем текущий сезон
  const season = 
    currentMonth <= 3 ? 'winter' :
    currentMonth <= 6 ? 'spring' :
    currentMonth <= 9 ? 'summer' : 'fall';

  // Формируем параметры запроса
  const params = new URLSearchParams({
    token: KODIK_TOKEN,
    year: year.toString(),
    limit: '100',
    types: 'anime-serial,anime',
    season: season,
    sort: 'created_at',
    order: 'desc'
  });

  try {
    const response = await fetch(`${KODIK_API_URL}/list?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка при получении данных');
    }

    return data.results.map((anime: any) => ({
      id: anime.id,
      title: anime.title,
      image: anime.material_data?.poster_url || '',
      description: anime.material_data?.description || '',
      year: parseInt(anime.year),
      status: anime.material_data?.status || 'Онгоинг'
    }));
  } catch (error) {
    console.error('Ошибка при получении сезонного аниме:', error);
    throw error;
  }
} 