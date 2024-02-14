import {HitParadeScraper} from './scrapers/hitParadeScraper';


async function main(): Promise<void> {
    const scraper = new HitParadeScraper()
    const songs = await scraper.getSongs({year: '1968', url: '/charts/number-1/1968'})
    const song = await scraper.getSongDetail(songs[0].playUrl!)
    console.log(song)
}

main()
