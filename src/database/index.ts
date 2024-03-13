import {Database, open} from 'sqlite'
import sqlite3 from 'sqlite3'
import * as path from 'path'
import {toUtf8} from '../utils';
import {Song} from '../song';

export class SongDatabase {
    private _db!: Database
    private readonly _databaseName: string

    constructor(databaseName: string) {
        this._databaseName = databaseName
    }

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
            filename: path.join(process.cwd(), 'data', this._databaseName),
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
        let sql = `INSERT INTO Songs (artist, title, year, playUrl, createdAt, source) VALUES`
        const valueSql = songs.map(song => `("${song.artist}", "${toUtf8(song.title)}", "${song.year}", 
            "${song.playUrl}", DATE(\'now\'), "${song.source}")`)
        sql += valueSql.join(', ')
        sql += ' ON CONFLICT(title, artist, year) DO NOTHING'
        await this.db.exec(toUtf8(sql))
    }

    async getSongs(filter: SongFilter): Promise<Song[]> {
        let sql = 'SELECT * FROM Songs'
        let params = undefined

        if (filter.source || filter.yearTo || filter.yearFrom) {
            sql += ' WHERE '
            params = {
                source: filter.source,
                yearFrom: filter.yearFrom,
                yearTo: filter.yearTo
            }
        }

        const filters: string[] = []

        if (filter.source) {
            filters.push('source = :source')
        }

        if (filter.yearFrom) {
            filters.push('year >= :yearFrom')
        }

        if (filter.yearTo) {
            filters.push('year <= :yearTo')
        }

        sql += filters.join(' AND ')

        return (await this.db.all(sql, params)).map(x => {
            return {
                year: +x.year,
                artist: x.artist,
                title: x.title,
                playUrl: x.playUrl,
                source: x.source
            } as Song
        })
    }
}

export interface SongFilter {
    source?: string,
    yearFrom?: number,
    yearTo?: number
}
