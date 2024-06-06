const fs = require('fs');
const axios = require('axios');
const PDFDocument = require('pdfkit');

const BASE_URL = 'https://apitaphuan.nxbgd.vn';

async function downloadImage(url, imageName) {
  if (!url) return null;
  try {
    const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/${url}`,
        responseType: 'arraybuffer'
      });
      fs.writeFileSync(imageName, response.data);
      
      // Get image dimensions
      const image = new PDFDocument({ size: 'Letter' });
      const imageSize = image.openImage(imageName);
      const imageWidth = imageSize.width;
      const imageHeight = imageSize.height;
    
      return [imageWidth, imageHeight];
  } catch (e) {
    console.log(e.message)
  }
  return false;
}

async function mergeImagesToPDF(link, path = 0) {
  try {
    const bookId = link.split('/')[5];

    const response = await axios.post(`${BASE_URL}/api/training-course/get-by-id-home-page`, {
      ID: bookId
    });
    const { data: Data } = response;
    const { Childrens, FileName } = Data.Data.ListDocumentGroup[0].Childrens[path];

    const pdfDoc = new PDFDocument({ autoFirstPage: false });
    const writeStream = fs.createWriteStream(`pdf/${FileName}.pdf`);
    pdfDoc.pipe(writeStream);

    for (const child of Childrens) {
      const frontImage = await downloadImage(child.Front.LinkFile, `images/${child.Front.FileName}`);
      const backImage = await downloadImage(child.Back.LinkFile, `images/${child.Back.FileName}`);

      // Add front image to PDF
      if (frontImage) {
        pdfDoc.addPage({
          size: frontImage
        }).image(`images/${child.Front.FileName}`, 0, 0, { width: frontImage[0], height: frontImage[1] });
        fs.unlinkSync(`images/${child.Front.FileName}`);
      }

      // Add back image to PDF
      if (backImage) {
        pdfDoc.addPage({
          size: backImage
        }).image(`images/${child.Back.FileName}`, 0, 0, { width: backImage[0], height: backImage[1] });
        fs.unlinkSync(`images/${child.Back.FileName}`);
        console.log(`Crawl done image: ${child.Back.FileName}`);
      }
    }

    pdfDoc.end();
    writeStream.on('finish', () => {
      console.log('PDF file created successfully!');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = mergeImagesToPDF;
