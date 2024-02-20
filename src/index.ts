import {scrape} from "./scrapers/scraper";
import { Command } from 'commander';
const program = new Command();

program.command('scrape')
    .description('gets the songs from the sources')
    .action(async() => scrape('swisscharts.com'))

async function main(): Promise<void> {
    const options = program.parseAsync(process.argv)
}

main()
