import { OneLang } from 'onelang';
import * as yargs from 'yargs';
import * as fs from 'fs';

function fail(msg) {
    console.error(msg);
    process.exit(1);
}

yargs.command('transpile <inputFile>', 'compile one standalone file to an other language',
    cmd => cmd.options({
        to: { 
            alias: 't',
            describe: 'target language to transpile the input file to',
            demand: true,
            choices: OneLang.getCapabilities().targetLanguages 
        },
        from: { 
            alias: 'f',
            describe: 'source language, the input file is written in this language',
            default: 'auto',
            choices: ['auto', ...OneLang.getCapabilities().sourceLanguages]
        }
    }),
    async args => {
        const inputFile = <string>args.inputFile;
        let sourceLang = args.from;
        if (sourceLang === 'auto') {
            const ext = inputFile.split('.').pop();
            const extMap = { ts: 'typescript', rb: 'ruby', cs: 'csharp', php: 'php' };
            if (!(ext in extMap))
                fail(`Cannot determine source language from input file extension ('${ext}'). Specify the source language explicitly using the --from argument or rename the file to one of the following extensions: ${Object.keys(extMap).join(', ')}`);
            sourceLang = extMap[ext];
        }

        const sourceCode = fs.readFileSync(inputFile, 'utf-8');
        const compiledCode = await OneLang.transpile(sourceCode, sourceLang, args.to);
        console.log(compiledCode);
    });

//yargs.command('error', 'SHOW ERROR', {}, async args => { console.log("HELLO"); throw new Error("ERROR"); });

let helpShown = false;
yargs.fail((msg, err) => {
    if (err) {
        console.error(err);
        throw err;
    } else {
        if (!helpShown) {
            yargs.showHelp();
            console.error();
            helpShown = true;
        }
        console.error(msg);
    }
});

yargs.demandCommand().recommendCommands().strict()
    .wrap(Math.min(yargs.terminalWidth(), 140))
    .showHelpOnFail(true).help()
    .argv