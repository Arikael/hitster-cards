import {SongDatabase, SongFilter} from '../database';
import QRCode from 'qrcode'
import {CellConfig, jsPDF, TextOptionsLight} from 'jspdf';
import * as fs from 'node:fs';
import {Song} from "../scrapers/scraperSource";
import {start} from "node:repl";
import {PdfCreator} from "./pdf";

export const print = async (filter: SongFilter): Promise<void> => {
    const db = new SongDatabase()
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
