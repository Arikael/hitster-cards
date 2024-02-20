import {ScraperSource, ScrapedSong, Song} from "./scraperSource";
import {SwisschartsNr1} from "./sources/swisschartsNr1";
import {SongDatabase} from "../database";
import chalk from "chalk";

const availableScrapers: ScraperSource[] = [
    new SwisschartsNr1()
]

const maxSongsToInsert = 20

export const scrape = async (source: string) => {
    console.log(chalk.green.bold('getting songs from ' + source))
    let currentSongBulkCount = 0
    const songsToInsert: Song[] = []
    const db = new SongDatabase()
    await db.initDatabase()
    const scraperSource = availableScrapers.find(x => x.name === source)

    if (!scraperSource) {
        return
    }

    const years =  await scraperSource.getYears()

    if(years.length === 0) {
        console.error(chalk.red('unable to get any years'))
    }

    console.info(chalk.blue(`got years ${years[0]} - ${years[years.length -1 ]}`))

    for (let year of years) {
        const songsTitles = await scraperSource.getSongs(year)
        const songsToGetDetail = songsTitles.filter(x => {
            return (<ScrapedSong>x).scrapePlayUrl && (<ScrapedSong>x).playUrl
        })

        console.log(chalk.blue(`-> got ${songsTitles.length} songs`))

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

            if (currentSongBulkCount >= maxSongsToInsert || i + 1 === songsToGetDetail.length) {
                await db.addSongs(songsToInsert)
                console.info(chalk.green(`inserted ${songsToInsert.length} songs`))
                currentSongBulkCount = 0
                break
            }
        }
    }
}