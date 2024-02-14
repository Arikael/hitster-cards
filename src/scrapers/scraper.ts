export interface Scraper {
    getYears(): Promise<ScrapedYear[]>
    getSongs(year: ScrapedYear): Promise<ScrapedSong[] | Song[]>
    getSongDetail(detailUrl: string): Promise<Song>
}

export interface ScrapedYear {
    url: string,
    year: string
}

export interface Song {
    year: number
    artist: string
    title: string
    playUrl: string
}

export interface ScrapedSong extends Partial<Song> {
    scrapePlayUrl: boolean
}