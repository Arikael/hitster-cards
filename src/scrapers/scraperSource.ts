import {Song} from '../song';

export interface ScraperSource {
    get name(): string
    getYears(): Promise<ScrapedYear[]>
    getSongs(year: ScrapedYear): Promise<ScrapedSong[] | Song[]>
    getSongDetail(detailUrl: string): Promise<Song>
}

export interface ScrapedYear {
    url: string,
    year: string
}

export interface ScrapedSong extends Partial<Song> {
    scrapePlayUrl: boolean
}