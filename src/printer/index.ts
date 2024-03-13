import {SongDatabase, SongFilter} from '../database';
import * as fs from 'node:fs';
import {PdfCreator} from './pdf';
import {Song} from '../song';

export const print = async (databaseName: string, filter: SongFilter): Promise<void> => {
    const db = new SongDatabase(databaseName)
    await db.initDatabase()
    const songs = (await db.getSongs(filter)).map(x => {
        return {
            artist: x.artist,
            year: x.year,
            playUrl: x.playUrl,
            title: x.title
        } as Song
    })

    if(!fs.existsSync('./dist')) {
        fs.mkdirSync('./dist', { recursive: false})
    }

    const pdf = new PdfCreator()
    pdf.createPdf(songs)
}
