import axios from 'axios';
import * as cheerio from 'cheerio';

const MANGAKAKALOT_URL = 'https://mangakakalot.com';

export interface MangaKakalotManga {
  id: string;
  title: string;
  alternativeTitle?: string;
  image: string;
  description: string;
  status: string;
  chapters: MangaKakalotChapter[];
}

export interface MangaKakalotChapter {
  id: string;
  title: string;
  number: number;
  url: string;
}

export async function searchManga(query: string): Promise<MangaKakalotManga[]> {
  try {
    const response = await axios.get(`${MANGAKAKALOT_URL}/search/story/${encodeURIComponent(query)}`);
    const $ = cheerio.load(response.data);
    const results: MangaKakalotManga[] = [];

    $('.story_item').each((_, element) => {
      const $item = $(element);
      const link = $item.find('.story_name a');
      const image = $item.find('img');

      results.push({
        id: link.attr('href')?.split('/').pop() || '',
        title: link.text().trim(),
        image: image.attr('src') || '',
        description: $item.find('.story_chapter').text().trim(),
        status: $item.find('.story_item_right span:contains("Status")').next().text().trim(),
        chapters: []
      });
    });

    return results;
  } catch (error) {
    console.error('Error searching manga:', error);
    throw new Error('Ошибка при поиске манги');
  }
}

export async function getManga(mangaId: string): Promise<MangaKakalotManga> {
  try {
    console.log('Getting manga with ID:', mangaId);
    
    // Проверяем, является ли mangaId полным URL
    const url = mangaId.startsWith('http') ? mangaId : `${MANGAKAKALOT_URL}/manga/${mangaId}`;
    console.log('Fetching URL:', url);
    
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Получаем заголовок
    const title = $('.story-info-right h1').text().trim() || 
                 $('.manga-info-text h1').text().trim() ||
                 $('.panel-story-info h1').text().trim();
                 
    // Получаем альтернативный заголовок
    const alternativeTitle = $('.story-info-right h2').text().trim() ||
                           $('.manga-info-text h2:contains("Alternative")').next().text().trim() ||
                           $('.panel-story-info h2:contains("Alternative")').next().text().trim();
                           
    // Получаем изображение
    const image = $('.info-image img').attr('src') ||
                 $('.manga-info-pic img').attr('src') ||
                 $('.story-info-left img').attr('src') || '';
                 
    // Получаем описание
    const description = $('#panel-story-info-description').text().trim() ||
                       $('#noidungm').text().trim() ||
                       $('.panel-story-info-description').text().trim();
                       
    // Получаем статус
    const status = $('.story-info-right-extent span:contains("Status")').next().text().trim() ||
                  $('.manga-info-text li:contains("Status")').text().replace('Status :', '').trim() ||
                  $('.story-info-right-extent p:contains("Status")').text().replace('Status :', '').trim();

    const chapters: MangaKakalotChapter[] = [];
    
    // Пытаемся найти главы в разных форматах
    $('.row-content-chapter li, .chapter-list .row, .panel-story-chapter-list li').each((_, element) => {
      const $chapter = $(element);
      const link = $chapter.find('a');
      const chapterUrl = link.attr('href') || '';
      const chapterTitle = link.text().trim();
      
      // Извлекаем номер главы из заголовка
      const chapterMatch = chapterTitle.match(/Chapter\s+(\d+(\.\d+)?)/i) || 
                          chapterTitle.match(/Глава\s+(\d+(\.\d+)?)/i);
      const chapterNumber = chapterMatch ? parseFloat(chapterMatch[1]) : 0;

      if (chapterUrl && chapterNumber > 0) {
        chapters.push({
          id: chapterUrl.split('/').pop() || '',
          title: chapterTitle,
          number: chapterNumber,
          url: chapterUrl.startsWith('http') ? chapterUrl : `${MANGAKAKALOT_URL}${chapterUrl}`
        });
      }
    });

    // Сортируем главы по номеру
    chapters.sort((a, b) => a.number - b.number);

    const manga: MangaKakalotManga = {
      id: mangaId,
      title,
      alternativeTitle,
      image,
      description,
      status,
      chapters
    };

    console.log('Parsed manga data:', manga);
    return manga;
  } catch (error) {
    console.error('Error getting manga:', error);
    throw new Error('Ошибка при загрузке манги');
  }
}

export async function getChapterPages(chapterUrl: string): Promise<string[]> {
  try {
    const response = await axios.get(chapterUrl);
    const $ = cheerio.load(response.data);
    const pages: string[] = [];

    $('.container-chapter-reader img').each((_, element) => {
      const imageUrl = $(element).attr('src');
      if (imageUrl) {
        pages.push(imageUrl);
      }
    });

    return pages;
  } catch (error) {
    console.error('Error getting chapter pages:', error);
    throw new Error('Ошибка при загрузке страниц главы');
  }
}

export async function searchMangaWithFilters({
  query = '',
  page = 1,
  status = '',
  genre = ''
}: {
  query?: string;
  page?: number;
  status?: string;
  genre?: string;
}): Promise<MangaKakalotManga[]> {
  try {
    let url = `${MANGAKAKALOT_URL}/manga_list`;

    if (query) {
      url += `?search=${encodeURIComponent(query)}`;
    }
    if (status) {
      url += `${query ? '&' : '?'}status=${status}`;
    }
    if (genre) {
      url += `${query || status ? '&' : '?'}genre=${genre}`;
    }
    if (page > 1) {
      url += `${query || status || genre ? '&' : '?'}page=${page}`;
    }

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const results: MangaKakalotManga[] = [];

    $('.list-truyen-item-wrap').each((_, element) => {
      const $item = $(element);
      const link = $item.find('h3 a');
      const image = $item.find('img');

      results.push({
        id: link.attr('href')?.split('/').pop() || '',
        title: link.text().trim(),
        image: image.attr('src') || '',
        description: $item.find('.list-story-item-wrap-chapter').text().trim(),
        status: $item.find('.story_item_right span:contains("Status")').next().text().trim(),
        chapters: []
      });
    });

    return results;
  } catch (error) {
    console.error('Error searching manga with filters:', error);
    throw new Error('Ошибка при поиске манги с фильтрами');
  }
} 