import {
  Source,
  Manga,
  Chapter,
  ChapterDetails,
  HomeSection,
  SearchRequest,
  PagedResults,
  SourceInfo,
  Request,
  Response
} from '@paperback/types'
import { WorldTriggerOnlineInfo } from './pbconfig'

const DOMAIN = 'https://world-trigger-chapters.online'

export class WorldTriggerOnline extends Source {
  override async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${DOMAIN}/`,
      method: 'GET'
    })

    const response = await this.requestManager.schedule(request, 1)
    const $ = this.cheerio.load(response.data)

    return createManga({
      id: mangaId,
      titles: ['World Trigger'],
      image: $('meta[property="og:image"]').attr('content') ?? '',
      status: 1, // Ongoing
      desc: $('meta[name="description"]').attr('content') ?? 'World Trigger manga series.',
      author: 'Daisuke Ashihara'
    })
  }

  override async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${DOMAIN}/`,
      method: 'GET'
    })

    const response = await this.requestManager.schedule(request, 1)
    const $ = this.cheerio.load(response.data)
    const chapters: Chapter[] = []

    // Adjust selector based on site's actual chapter link structure
    $('a[href*="chapter"]').each((index, element) => {
      const href = $(element).attr('href') ?? ''
      const title = $(element).text().trim()
      
      // Parse chapter number from link or text
      const chapNumMatch = title.match(/Chapter\s*(\d+(\.\d+)?)/i) || href.match(/chapter-(\d+(\.\d+)?)/i)
      const chapNum = chapNumMatch ? parseFloat(chapNumMatch[1]) : index + 1

      chapters.push(
        createChapter({
          id: href.replace(DOMAIN, ''),
          mangaId: mangaId,
          chapNum: chapNum,
          name: title || `Chapter ${chapNum}`,
          langCode: 'en'
        })
      )
    })

    return chapters
  }

  override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${DOMAIN}${chapterId.startsWith('/') ? '' : '/'}${chapterId}`,
      method: 'GET'
    })

    const response = await this.requestManager.schedule(request, 1)
    const $ = this.cheerio.load(response.data)
    const pages: string[] = []

    // Scraping image URLs from chapter view
    $('img[src*="chapter"], img[src*="uploads"], .entry-content img').each((_, element) => {
      const src = $(element).attr('src') || $(element).attr('data-src')
      if (src) {
        pages.push(src.startsWith('http') ? src : `${DOMAIN}${src}`)
      }
    })

    return createChapterDetails({
      id: chapterId,
      mangaId: mangaId,
      pages: pages
    })
  }

  override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
    // Single-manga site returns static result for matching queries
    if (query.title && 'world trigger'.includes(query.title.toLowerCase())) {
      const manga = await this.getMangaDetails('world-trigger')
      return createPagedResults({
        results: [
          createMangaTile({
            id: 'world-trigger',
            title: createIconText({ text: 'World Trigger' }),
            image: manga.image
          })
        ]
      })
    }
    return createPagedResults({ results: [] })
  }
}
