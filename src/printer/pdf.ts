import {jsPDF, TextOptionsLight} from 'jspdf'
import QRCode from 'qrcode';
import {Song} from '../song';

var page = 1;

type PdfSong = Song & { qrcode?: string }
type PdfSongData = PdfSong[][][]

export class PdfCreator {
    private pageWidth = 210
    private pageHeight = 297
    private pageMargin = 5
    private cellPadding = 5
    private cellWidth = 65
    private cellHeight = 65
    private lineHeight = 10
    private startX = 0
    private startY = 0

    private doc!: jsPDF

    constructor() {
        this.startX = this.pageMargin
        this.startY = this.pageMargin
        this.pageWidth -= this.pageMargin * 2
        this.pageHeight -= this.pageMargin * 2
    }

    private createCardData(songs: Song[]): PdfSongData {
        const cardsPerRow = Math.floor(this.pageWidth / this.cellWidth)
        const rowsPerPage = Math.floor(this.pageHeight / this.cellHeight)
        const totalCardsPerPage = cardsPerRow * rowsPerPage
        let data: Song[][][] = []
        data.push([])
        data[0].push([])

        let dataRow = 0
        let totalPerPage = 0
        for (let song of songs) {
            data[data.length - 1][dataRow].push(song)
            totalPerPage++

            if (totalPerPage % cardsPerRow === 0) {
                if (totalPerPage < totalCardsPerPage) {
                    data[data.length - 1].push([])

                    dataRow++
                }
            }

            if (totalPerPage === totalCardsPerPage) {
                dataRow = 0
                totalPerPage = 0
                data.push([])
                data[data.length - 1].push([])
            }

        }

        return data
    }

    async createPdf(songs: Song[]) {
        this.doc = new jsPDF({
            unit: 'mm',
            format: 'a4'
        })

        this.doc.setFontSize(12)
        const data = this.createCardData(songs)

        for (let i = 0; i < data.length; i++) {
            let songPage = data[i];
            await this.drawPage(songPage, 'text')
            this.addNewPage()
            await this.drawPage(songPage, 'qrcode')

            if (i < data.length) {
                this.addNewPage()
            }
        }

        this.doc.save('./dist/songs.pdf')
    }

    private addNewPage() {
        this.doc.addPage()
        page++;
        this.doc.setPage(page)
        this.startY = this.pageMargin
    }

    private async drawPage(songData: PdfSong[][], type: 'text' | 'qrcode'): Promise<void> {
        console.log(songData.length)
        for (let row of songData) {
            const rowToDraw = type === 'qrcode' ? row.reverse() : row

            for (let song of rowToDraw) {
                console.log(song.title)

                if (type === 'qrcode') {
                    await this.drawQrCode(song)
                } else {
                    await this.drawCard(song)
                }

                this.startX += this.cellWidth
                console.log(this.startX)
            }
            console.log('break')

            this.startY += this.cellHeight
            this.startX = this.pageMargin
        }
    }

    private async drawCard(item: Song) {
        this.doc.rect(this.startX, this.startY, this.cellWidth, this.cellHeight)
        let options: TextOptionsLight = {
            align: 'center'
        }
        const x = this.startX + this.cellWidth / 2
        const y = this.startY + this.cellPadding

        this.setFontSize(item.title)
        this.doc.text(item.title, x, y, options);
        this.doc.setFontSize(32)
        this.doc.text(item.year.toString(), x, y + this.cellHeight / 2 - this.lineHeight / 2, options);
        this.setFontSize(item.artist)
        this.doc.text(item.artist, x, y + this.cellHeight - this.cellPadding * 2, options);

        return Promise.resolve()
    }

    private setFontSize(text: string, maxLengthBeforeReduce: number = 30) {
        if (text.length > maxLengthBeforeReduce) {
            this.doc.setFontSize(11)
        }
        else {
            this.doc.setFontSize(11)
        }
    }

    private async drawQrCode(song: PdfSong) {
        song.qrcode = await QRCode.toDataURL(song.playUrl)
        const qrCodeWidth = this.cellWidth / 2
        const qrCodeHeight = this.cellHeight / 2

        const x = this.startX + this.cellWidth / 2 - qrCodeWidth / 2
        const y = this.startY + this.cellHeight / 2 - qrCodeHeight / 2

        this.doc.rect(this.startX, this.startY, this.cellWidth, this.cellHeight)
        this.doc.addImage(song.qrcode, x, y, qrCodeWidth, qrCodeHeight)
    }
}