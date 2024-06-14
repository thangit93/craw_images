const fs = require('fs');
const axios = require('axios');
const PDFDocument = require('pdfkit');

async function downloadImage(url, imageName) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(imageName, response.data);
    
    const image = new PDFDocument({ size: 'Letter' });
    const imageSize = image.openImage(imageName);
    const imageWidth = imageSize.width;
    const imageHeight = imageSize.height;

    return [imageWidth/2, imageHeight/2];
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return null;
  }
}

async function mergeImagesToPDF(link) {
  try {
    const bookId = link.split('/')[6];
    const bookName = link.split('/')[4];

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

        const imageSize = await downloadImage(imageUrl, imageName);
        if (imageSize) {
          const [imageWidth, imageHeight] = imageSize;
          pdfDoc.addPage({
            size: [imageWidth, imageHeight]
          }).image(imageName, 0, 0, { width: imageWidth, height: imageHeight });

          fs.unlinkSync(imageName);
          console.log(`Crawl done image: ${imageName}`);
        }
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

module.exports = mergeImagesToPDF;

