import {scrape} from "./scrapers/scraper";
import { Command } from 'commander';
const program = new Command();

program.command('scrape')
    .description('gets the songs from the sources')
    .option('-s --single <url>', 'only scrape a single detail url', '')
    .action(async(options) => scrape('swisscharts.com', options.single))

async function main(): Promise<void> {
    await program.parseAsync(process.argv)
}

main()
