import * as yargs from 'yargs';
import * as one from 'onelang';
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
            choices: one.getCapabilities().targetLanguages 
        },
        from: { 
            alias: 'f',
            describe: 'source language, the input file is written in this language',
            default: 'auto',
            choices: ['auto', ...one.getCapabilities().sourceLanguages]
        }
    }),
    args => {
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
        const compiledCode = one.transpile(sourceCode, sourceLang, args.to);
        console.log(compiledCode);
    })
    .demandCommand().recommendCommands().strict()
    .wrap(Math.min(yargs.terminalWidth(), 140)).help()
    .argv