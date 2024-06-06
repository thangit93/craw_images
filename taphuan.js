const mergeImagesToPDF = require('./ultils/taphuan')
const { program } = require('commander');

function commandToRun() {
  program
    .option('-l, --link <char>')
    .option('-p, --path <char>');
  program.parse();

  const options = program.opts();

  let link = options.link;
  if (link === undefined) {
    link = program.args[0];
  }
  const path = options.path ?? 0;

  mergeImagesToPDF(link, path);
}

// Call the function to merge images into PDF
commandToRun();
