const fs = require('fs')
const download = require('image-downloader')
const axios = require('axios')
const PDFDocument = require('pdfkit');

async function downloadImagesAndCreatePDF() {
  try {
    // Call API
    const response = await axios.get('https://api.hoc10.vn/api/get-detail-page', {
      params: {
        book_id: 765,
        page: 0,
        book_name: 'sgt-toan-12-tap-1',
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
        const imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

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

downloadImagesAndCreatePDF();