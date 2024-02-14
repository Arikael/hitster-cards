import {ScrapedSong, ScrapedYear, Scraper, Song} from "./scraper";
import axios from "axios";
import * as cheerio from "cheerio";

export class HitParadeScraper implements Scraper {
    private baseUrl = 'http://www.swisscharts.com'

    async getYears(): Promise<ScrapedYear[]> {
        const result = await axios.get(this.baseUrl + 'charts/number-1/1968')
        const $ = cheerio.load(result.data)
        return $('a[href^="/charts/number-1"]').get().map((el) => {
            const url = $(el).attr('href') || ''
            const year = url.substring(url.lastIndexOf('/') + 1)

            return {
                url,
                year
            }
        })
    }

    async getSongs(scrapedYear: ScrapedYear): Promise<ScrapedSong[] | Song[]> {
        const result = await axios.get(this.baseUrl + scrapedYear.url)
        const $ = cheerio.load(result.data)
        return $('table td.textline a[href^="/song"]').get().map((el) => {
            return {
                playUrl: $(el).attr('href'),
                scrapePlayUrl: true,
                year: +scrapedYear.year
            }
        })
    }

    async getSongDetail(detailUrl: string): Promise<Song> {
        const result = await axios.get(this.baseUrl + detailUrl)
        const $ = cheerio.load(result.data)
        const year = $('.song .th:contains("Jahr") + .td').text()
        const artistTitleEl = $('.content h1')
        const artist = artistTitleEl.contents().first().text()
        const title = artistTitleEl.find('div').contents().last().text()

        return {
            playUrl: detailUrl,
            artist,
            title,
            year: +year
        }

    }

}