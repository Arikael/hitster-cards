import {ScraperSource, ScrapedSong} from './scraperSource';
import {SwisschartsNr1} from './sources/swisschartsNr1';
import {SongDatabase} from '../database';
import chalk from 'chalk';
import {Song} from "../song";

const availableScrapers: ScraperSource[] = [
    new SwisschartsNr1()
]

const maxSongsToInsertPerBatch = 20

export const scrape = async (source: string, detailUrl?: string) => {
    console.log(chalk.green.bold('getting songs from ' + source))
    const db = new SongDatabase()
    await db.initDatabase()
    const scraperSource = availableScrapers.find(x => x.name === source)

    if (!scraperSource) {
        return
    }

    if (detailUrl) {
        await scrapeSingleDetail(detailUrl, scraperSource, db)
    }
    else {
        await fullScrape(scraperSource, db)
    }
}

const fullScrape = async(scraperSource: ScraperSource, db: SongDatabase) => {
    let currentSongBulkCount = 0
    const songsToInsert: Song[] = []
    const years = await scraperSource.getYears()

    if (years.length === 0) {
        console.error(chalk.red('unable to get any years'))
    }
    console.log(JSON.stringify(years))
    console.info(chalk.blue(`got years ${years[0].year} - ${years[years.length - 1].year}`))

    for (let scrapedYear of years) {
        const songsTitles = await scraperSource.getSongs(scrapedYear)
        const songsToGetDetail = songsTitles.filter(x => {
            return (<ScrapedSong>x).scrapePlayUrl && (<ScrapedSong>x).playUrl
        })

        console.log(chalk.blue(`${scrapedYear.year} -> got ${songsTitles.length} songs`))

        for (let i = 0; i < songsTitles.length; i++) {
            const currentSong = songsToGetDetail[i]
            let songToInsert: Song

            if ((<ScrapedSong>currentSong).scrapePlayUrl) {
                songToInsert = await scraperSource.getSongDetail(currentSong.playUrl!)
            } else {
                songToInsert = currentSong as Song
            }

            console.info(chalk.blue(`    -> ${songToInsert.playUrl}`))

            songsToInsert.push(songToInsert)
            currentSongBulkCount++

            if (currentSongBulkCount >= maxSongsToInsertPerBatch || i + 1 === songsToGetDetail.length) {
                await db.addSongs(songsToInsert)
                console.info(chalk.green(`inserted ${songsToInsert.length} songs`))
                currentSongBulkCount = 0
                songsToInsert.length = 0
                break
            }
        }
    }
}

const scrapeSingleDetail = async (detailUrl: string, scraperSource: ScraperSource, db: SongDatabase) => {
    const song = await scraperSource.getSongDetail(detailUrl)
    await db.addSongs([song])
}