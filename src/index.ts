import * as yargs from 'yargs';
import * as one from 'onelang';

yargs.command('compile <inputFile>', 'compile one standalone file to an other language',
    cmd => cmd.option('target-language', { 
        alias: 't',
        describe: 'language to compile source file to',
        demand: true,
        choices: one.getAvailableLanguages() }),
    args => {
        console.log(`compile called!`, args);
    })
    .demandCommand().recommendCommands().strict()
    .wrap(Math.min(yargs.terminalWidth(), 140)).help()
    .argv