const MANGADEX_API_URL = 'https://api.mangadex.org';

export interface MangaDexManga {
  id: string;
  type: string;
  attributes: {
    title: {
      [key: string]: string;
    };
    description: {
      [key: string]: string;
    };
    status: string;
    year: number | null;
    contentRating: string;
    lastVolume: string | null;
    lastChapter: string | null;
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: {
      fileName?: string;
    };
  }>;
}

export interface MangaDexChapter {
  id: string;
  type: string;
  attributes: {
    volume: string | null;
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    pages: number;
  };
}

export async function getManga(mangaId: string): Promise<MangaDexManga> {
  try {
    console.log('Fetching manga with ID:', mangaId);
    const response = await fetch(`${MANGADEX_API_URL}/manga/${mangaId}?includes[]=cover_art`);
    
    if (!response.ok) {
      console.error('MangaDex API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Raw API response:', data);
    
    if (!data.data) {
      console.error('Invalid API response:', data);
      throw new Error('Неверный формат ответа от API');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error in getManga:', error);
    throw new Error('Ошибка при загрузке манги: ' + (error as Error).message);
  }
}

export async function getMangaChapters(mangaId: string): Promise<MangaDexChapter[]> {
  try {
    console.log('Fetching chapters for manga:', mangaId);
    
    // Запрашиваем главы с расширенным списком языков и без лишних фильтров
    const queryParams = {
      limit: '500',
      'includes[]': 'scanlation_group',
      'order[chapter]': 'asc'
    };
    
    const url = new URL(`${MANGADEX_API_URL}/manga/${mangaId}/feed`);
    
    // Добавляем языки
    ['ru', 'en', 'uk', 'be', 'ja', 'zh', 'ko'].forEach(lang => {
      url.searchParams.append('translatedLanguage[]', lang);
    });
    
    // Добавляем рейтинги контента
    ['safe', 'suggestive', 'erotica'].forEach(rating => {
      url.searchParams.append('contentRating[]', rating);
    });
    
    // Добавляем остальные параметры
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('MangaDex Chapters API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`Ошибка при загрузке глав: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw chapters response:', data);
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid chapters response:', data);
      throw new Error('Неверный формат ответа от API');
    }

    // Группируем главы по языкам
    const chaptersByLang = data.data.reduce((acc: { [key: string]: MangaDexChapter[] }, chapter: MangaDexChapter) => {
      const lang = chapter.attributes.translatedLanguage;
      if (!acc[lang]) {
        acc[lang] = [];
      }
      acc[lang].push(chapter);
      return acc;
    }, {});

    // Приоритет языков
    const languagePriority = ['ru', 'en', 'uk', 'be', 'ja', 'zh', 'ko'];
    
    // Ищем первый доступный язык с главами
    let selectedChapters: MangaDexChapter[] = [];
    
    for (const lang of languagePriority) {
      if (chaptersByLang[lang] && chaptersByLang[lang].length > 0) {
        selectedChapters = chaptersByLang[lang];
        console.log(`Using chapters in ${lang} language (${selectedChapters.length} chapters found)`);
        break;
      }
    }

    // Если не нашли главы по приоритетным языкам, берем первый доступный язык
    if (selectedChapters.length === 0) {
      const availableLanguages = Object.keys(chaptersByLang);
      if (availableLanguages.length > 0) {
        const firstLang = availableLanguages[0];
        selectedChapters = chaptersByLang[firstLang];
        console.log(`Using chapters in ${firstLang} language (${selectedChapters.length} chapters found)`);
      }
    }

    if (selectedChapters.length === 0) {
      throw new Error('Главы не найдены или недоступны для чтения');
    }

    // Сортируем главы по номеру
    selectedChapters.sort((a: MangaDexChapter, b: MangaDexChapter) => {
      const aNum = parseFloat(a.attributes.chapter || '0');
      const bNum = parseFloat(b.attributes.chapter || '0');
      return aNum - bNum;
    });

    console.log(`Returning ${selectedChapters.length} chapters`);
    return selectedChapters;
  } catch (error) {
    console.error('Error in getMangaChapters:', error);
    throw error;
  }
}

export async function getChapterPages(chapterId: string): Promise<string[]> {
  try {
    console.log('Fetching pages for chapter:', chapterId);
    const response = await fetch(`${MANGADEX_API_URL}/at-home/server/${chapterId}`);
    
    if (!response.ok) {
      console.error('MangaDex Pages API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Raw pages response:', data);
    
    if (!data.baseUrl || !data.chapter) {
      console.error('Invalid pages API response:', data);
      throw new Error('Неверный формат ответа от API');
    }
    
    const baseUrl = data.baseUrl;
    const chapter = data.chapter;
    
    return chapter.data.map((hash: string) => 
      `${baseUrl}/data/${chapter.hash}/${hash}`
    );
  } catch (error) {
    console.error('Error in getChapterPages:', error);
    throw new Error('Ошибка при загрузке страниц: ' + (error as Error).message);
  }
}

export function getCoverArtUrl(mangaId: string, coverId: string): string {
  return `${MANGADEX_API_URL}/covers/${mangaId}/${coverId}`;
}

export function formatMangaData(manga: MangaDexManga) {
  try {
    console.log('Formatting manga data:', manga);
    
    // Получаем обложку
    const coverRelationship = manga.relationships.find(rel => rel.type === 'cover_art');
    const coverFileName = coverRelationship?.attributes?.fileName;
    
    // Получаем заголовок (сначала пробуем английский, потом первый доступный)
    const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
    
    // Получаем японский заголовок, если есть
    const originalTitle = manga.attributes.title.ja;
    
    // Получаем описание (сначала пробуем английское, потом первое доступное)
    const description = manga.attributes.description.en || 
                       Object.values(manga.attributes.description)[0] || 
                       'Описание отсутствует';
    
    const formattedData = {
      id: manga.id,
      title,
      originalTitle,
      description,
      status: manga.attributes.status,
      chapters: parseInt(manga.attributes.lastChapter || '0'),
      image: coverFileName ? 
        `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}` :
        '/placeholder.jpg'
    };
    
    console.log('Formatted data:', formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error in formatMangaData:', error);
    throw new Error('Ошибка при форматировании данных манги: ' + (error as Error).message);
  }
}

// Функция для поиска манги по названию
export async function searchManga(query: string): Promise<MangaDexManga[]> {
  try {
    console.log('Searching manga:', query);
    const response = await fetch(
      `${MANGADEX_API_URL}/manga?title=${encodeURIComponent(query)}&includes[]=cover_art&limit=5&contentRating[]=safe&contentRating[]=suggestive&order[relevance]=desc`
    );
    
    if (!response.ok) {
      console.error('MangaDex Search API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Search results:', data);
    
    if (!data.data) {
      console.error('Invalid search response:', data);
      throw new Error('Неверный формат ответа от API');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error in searchManga:', error);
    throw new Error('Ошибка при поиске манги: ' + (error as Error).message);
  }
}

// Функция для получения тегов/жанров
export async function getTags(): Promise<{
  id: string;
  name: string;
  group: string;
}[]> {
  try {
    const response = await fetch(`${MANGADEX_API_URL}/manga/tag`);
    if (!response.ok) {
      throw new Error('Ошибка при загрузке тегов');
    }
    const data = await response.json();
    return data.data.map((tag: any) => ({
      id: tag.id,
      name: tag.attributes.name.en,
      group: tag.attributes.group
    }));
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw new Error('Ошибка при загрузке тегов');
  }
}

// Функция для поиска манги с фильтрами
export async function searchMangaWithFilters({
  title = '',
  tags = [],
  page = 1,
  limit = 20,
  status = '',
  order = 'relevance'
}: {
  title?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  status?: string;
  order?: string;
}): Promise<{
  data: MangaDexManga[];
  total: number;
  offset: number;
  limit: number;
}> {
  try {
    const offset = (page - 1) * limit;
    let url = `${MANGADEX_API_URL}/manga?includes[]=cover_art&limit=${limit}&offset=${offset}&contentRating[]=safe&contentRating[]=suggestive`;

    if (title) {
      url += `&title=${encodeURIComponent(title)}`;
    }

    if (tags.length > 0) {
      tags.forEach(tag => {
        url += `&includedTags[]=${tag}`;
      });
    }

    if (status) {
      url += `&status[]=${status}`;
    }

    url += `&order[${order}]=desc`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Ошибка при поиске манги');
    }

    const data = await response.json();
    return {
      data: data.data,
      total: data.total,
      offset: data.offset,
      limit: data.limit
    };
  } catch (error) {
    console.error('Error in searchMangaWithFilters:', error);
    throw new Error('Ошибка при поиске манги');
  }
} 