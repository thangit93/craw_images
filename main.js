const mergeImagesToPDFCanhDieu = require('./ultils/canhdieu')
const mergeImagesToPDFTapHuan = require('./ultils/taphuan')
const { program } = require('commander');

function commandToRun() {
    program
        .option('-t, --type <char>')
        .option('-l, --link <char>')
        .option('-p, --path <char>');
    program.parse();

    const options = program.opts();
    const type = options.type;

    const path = options.path ?? 0;
    let link = options.link;
    if (!link && program.args[0]) {
        link = program.args[0];
    } else {
        console.error('Please provide a link using -l or --link option.');
    }

    switch (type) {
        case 'canhdieu':
            mergeImagesToPDFCanhDieu(link);
            return
        case 'taphuan':
            mergeImagesToPDFTapHuan(link, path);
            return
    }
}
  
commandToRun();