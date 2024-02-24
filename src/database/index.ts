import {Database, open} from "sqlite"
import sqlite3 from 'sqlite3'
import * as path from 'path'
import {Song} from "../scrapers/scraperSource";
import {toUtf8} from "../utils";

export class SongDatabase {
    private _db!: Database

    get db(): Database {
        if (!this._db) {
            (async () => {
                await this.initDatabase()
            })()
        }

        return this._db
    }

    initDatabase = async () => {
        this._db = await open({
            filename: path.join(process.cwd(), 'data', 'songs.db'),
            driver: sqlite3.Database
        })

        await this.db.migrate()
    }

    async addSong(song: Song) {
        const sql = `INSERT OR IGNORE INTO Songs (artist, title, year, playUrl, createdAt) ` +
            `VALUES("${song.artist}", "${song.title}", "${song.year}", "${song.playUrl}", DATE(\'now\'))`
        await this.db.exec(sql)
    }

    async addSongs(songs: Song[]) {
        let sql = `INSERT OR IGNORE INTO Songs (artist, title, year, playUrl, createdAt) VALUES`
        const valueSql = songs.map(song => `("${song.artist}", "${toUtf8(song.title)}", "${song.year}", "${song.playUrl}", DATE(\'now\'))`)
        sql += valueSql.join(', ')
        await this.db.exec(toUtf8(sql))
    }
}

