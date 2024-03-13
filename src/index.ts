import {scrape} from './scrapers/scraper'
import { Command } from 'commander'
import {print} from './printer'
const program = new Command();

program.command('scrape')
    .description('gets the songs from the sources')
    .option('-s --single <url>', 'only scrape a single detail url', '')
    .option('-d --database <name>', 'name of the database', 'allSongs.db')
    .action(async(options) => scrape(options.database,'swisscharts.com', options.single))

program.command('print')
    .description('writes song from the database to a csv file (see README for how to print those)')
    .option('-s --source <source>', 'print only from this source')
    .option('-f --year-from <year>', 'only include songs newer (and including) than this year')
    .option('-t --year-to <year>', 'only include songs older (and including) than this year')
    .option('-d --database <name>', 'name of the database', 'allSongs.db')
    .action(async(options) => print(options.database,{
        source: options.source,
        yearFrom: +options.yearFrom,
        yearTo: +options.yearTo
    }))

async function main(): Promise<void> {
    await program.parseAsync(process.argv)
}

main()
