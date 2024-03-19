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
    private cellVerticalPadding = 5
    private cellWidth = 65
    private cellHeight = 65
    private lineHeight = 10
    private maxRemainingWidth = 0
    private startX = 0
    private startY = 0
    private cardsPerRow = 0
    private rowsPerPage = 0
    private printBorders = false
    private maxTextLength = 28
    private cardTextRegex = new RegExp(/[\s\S]{1,28}(?!\S)/g) // use maxTextLength
    private doc!: jsPDF

    constructor() {
        this.startX = this.pageMargin
        this.startY = this.pageMargin
        this.pageWidth -= this.pageMargin * 2
        this.pageHeight -= this.pageMargin * 2
        this.cardsPerRow = Math.floor(this.pageWidth / this.cellWidth)
        this.rowsPerPage = Math.floor(this.pageHeight / this.cellHeight)
        this.maxRemainingWidth = this.pageWidth - this.cardsPerRow * this.cellWidth
    }

    private createCardData(songs: Song[]): PdfSongData {
        const totalCardsPerPage = this.cardsPerRow * this.rowsPerPage
        let data: Song[][][] = []
        data.push([])
        data[0].push([])

        let dataRow = 0
        let totalPerPage = 0
        for (let song of songs) {
            data[data.length - 1][dataRow].push(song)
            totalPerPage++

            if (totalPerPage % this.cardsPerRow === 0) {
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

    async createPdf(songs: Song[], printBorders: boolean) {
        this.printBorders = printBorders
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
        const isReverse = type === 'qrcode'

        // if (!isReverse) {
        //     this.drawHorizontalHelpLine()
        //     this.drawVerticalHelpLine()
        // }

        for (let row of songData) {
            if (isReverse) {
                this.startX += (this.cardsPerRow - 1) * this.cellWidth + this.maxRemainingWidth
            }

            for (let song of row) {
                if (isReverse) {
                    await this.drawQrCode(song)
                } else {
                    await this.drawCard(song)
                }

                if (isReverse) {
                    this.startX -= this.cellWidth
                } else {
                    this.startX += this.cellWidth
                }
            }

            this.startX = this.pageMargin
            this.startY += this.cellHeight
        }

        // if (!isReverse) {
        //     this.doc.line(this.startX, this.startY, this.startX, this.pageHeight)
        // }
    }

    private async drawCard(item: Song) {
        this.drawHorizontalHelpLine()
        this.drawVerticalHelpLine()

        if (this.printBorders) {
            this.doc.rect(this.startX, this.startY, this.cellWidth, this.cellHeight)
        }

        let options: TextOptionsLight = {
            align: 'center'
        }
        const x = this.startX + this.cellWidth / 2
        const y = this.startY + this.cellVerticalPadding

        this.doc.setFontSize(12)
        const title = this.splitCardText(item.title)

        this.doc.text(title, x, y, options);
        this.doc.setFontSize(32)
        this.doc.text(item.year.toString(), x, y + this.cellHeight / 2 - this.lineHeight / 2, options);
        this.doc.setFontSize(12)

        const artist = this.splitCardText(item.artist)
        const artistLines = artist.split('\n').length

        this.doc.text(artist, x, this.startY + this.cellHeight - (this.cellVerticalPadding / 2 * artistLines), options);

        if (this.startX + this.cellWidth * 2 >= this.pageWidth) {
            this.doc.line(this.startX + this.cellWidth * 2, this.startY, this.pageWidth, this.startY)

            if(this.startY === this.pageMargin) {
                this.doc.line(this.startX + this.cellWidth * 2, 0, this.startX + this.cellWidth * 2, this.startY)
            }
        }

        if(this.startY + this.cellHeight * 2 >= this.pageHeight) {
            this.doc.line(0, this.startY + this.cellHeight, this.pageMargin, this.startY + this.cellHeight)


        }
    }

    private splitCardText(input: string): string {
        return input.length > this.maxTextLength
            ? input.replace(this.cardTextRegex, '$&\n')
            : input
    }

    private async drawQrCode(song: PdfSong) {
        if (this.printBorders) {
            this.doc.rect(this.startX, this.startY, this.cellWidth, this.cellHeight)
        }

        song.qrcode = await QRCode.toDataURL(song.playUrl)
        const qrCodeWidth = this.cellWidth / 2
        const qrCodeHeight = this.cellHeight / 2

        const x = this.startX + this.cellWidth / 2 - qrCodeWidth / 2
        const y = this.startY + this.cellHeight / 2 - qrCodeHeight / 2

        this.doc.addImage(song.qrcode, x, y, qrCodeWidth, qrCodeHeight)
    }

    private drawVerticalHelpLine() {
        if (this.startY == this.pageMargin) {
            this.doc.line(this.startX, 0, this.startX, this.pageMargin)
        }
    }

    private drawHorizontalHelpLine() {
        if (this.startX === this.pageMargin) {
            this.doc.line(0, this.startY, this.pageMargin, this.startY)
        }
    }
}