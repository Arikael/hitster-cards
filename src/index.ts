import {scrape} from './scrapers/scraper'
import { Command } from 'commander'
import {print} from './printer'
const program = new Command();

program.command('scrape')
    .description('gets the songs from the sources')
    .option('-s --single <url>', 'only scrape a single detail url', '')
    .action(async(options) => scrape('swisscharts.com', options.single))

program.command('print')
    .description('writes song from the database to a csv file (see README for how to print those)')
    .option('-s --source <source>', 'print only from this source')
    .option('-f --year-from <year>', 'only include songs newer (and including) than this year')
    .option('-t --year-to <year>', 'only include songs older (and including) than this year')
    .action(async(options) => print({
        source: options.source,
        yearFrom: +options.yearFrom,
        yearTo: +options.yearTo
    }))

async function main(): Promise<void> {
    await program.parseAsync(process.argv)
}

main()
