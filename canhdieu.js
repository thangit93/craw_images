const fs = require('fs')
const axios = require('axios')
const PDFDocument = require('pdfkit');
const { program } = require('commander');

async function downloadImagesAndCreatePDF() {
  try {
    //Sample: node canhdieu.js https://hoc10.vn/doc-sach/sgt-toan-5-tap-2/8/648/0/
    program
        .option('-l, --link <char>');
    program.parse();

    const options = program.opts();

    let link = options.link
    if (link === undefined) {
      link = program.args[0]
    }
    const bookId = link.split('/')[6]
    const bookName = link.split('/')[4]
    // Call API
    const response = await axios.get('https://api.hoc10.vn/api/get-detail-page', {
      params: {
        book_id: bookId,
        page: 0,
        book_name: bookName,
        limit: 0,
        status: '',
        app_id: 68
      }
    });

    if (response.data.status === 'success') {
      const listPage = response.data.data.list_page;
      const pdfDoc = new PDFDocument({ autoFirstPage: false });
      const pdfStream = fs.createWriteStream(`pdf/${response.data.data.title}.pdf`);

      pdfDoc.pipe(pdfStream);


      for (const page of listPage) {
        const imageUrl = `https://hoc10.monkeyuni.net/${page.background}`;
        const imageName = `images/${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)}`;

        // Download image
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(imageName, imageResponse.data);

        // Get image dimensions
        const image = new PDFDocument({size: 'Letter'});
        const imageSize = image.openImage(imageName);
        const imageWidth = imageSize.width;
        const imageHeight = imageSize.height;

        // Add page to PDF
        pdfDoc.addPage({
          size: [imageWidth, imageHeight]
        }).image(imageName, 0, 0, {width: imageWidth, height: imageHeight});


        // Delete downloaded image after adding to PDF
        fs.unlinkSync(imageName);
        console.log(`Crawl done image: ${imageName}`);
      }

      pdfDoc.end();
      console.log('PDF created successfully.');
    } else {
      console.error('Failed to fetch data from API.');
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

downloadImagesAndCreatePDF().then(() => {
  console.log('DONE!')
});