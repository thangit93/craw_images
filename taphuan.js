const fs = require('fs')
const axios = require('axios')
const PDFDocument = require('pdfkit');

const BASE_URL = 'https://apitaphuan.nxbgd.vn';

async function downloadImage(url, imageName) {
  if (!url) return null
  const response = await axios({
    method: 'GET',
    url: `${BASE_URL}/${url}`,
    responseType: 'arraybuffer'
  });
  fs.writeFileSync(imageName, response.data);
  // Get image dimensions
  const image = new PDFDocument({size: 'Letter'});
  const imageSize = image.openImage(imageName);
  const imageWidth = imageSize.width;
  const imageHeight = imageSize.height;

  return [imageWidth, imageHeight]
}

async function mergeImagesToPDF() {
  try {
    const response = await axios.post(`${BASE_URL}/api/training-course/get-by-id-home-page`, {
      ID: '6f3472c8-cd3a-7367-8947-fe5995409e34'
    });
    const { data: Data } = response;
    const {Childrens, FileName} = Data.Data.ListDocumentGroup[0].Childrens[0]

    const pdfDoc = new PDFDocument({ autoFirstPage: false });
    const writeStream = fs.createWriteStream(`pdf/${FileName}.pdf`);
    pdfDoc.pipe(writeStream);

    for (const child of Childrens) {
      const frontImage = await downloadImage(child.Front.LinkFile, child.Front.FileName);
      const backImage = await downloadImage(child.Back.LinkFile, child.Back.FileName);

      // Add front image to PDF
      if (frontImage) {
        pdfDoc.addPage({
          size: frontImage
        }).image(child.Front.FileName, 0, 0, {width: frontImage[0], height: frontImage[1]});
        fs.unlinkSync(child.Front.FileName);
      }
      
      // Add back image to PDF
      if (backImage) {
        pdfDoc.addPage({
          size: backImage
        }).image(child.Back.FileName, 0, 0, {width: backImage[0], height: backImage[1]});
        fs.unlinkSync(child.Back.FileName);
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

// Call the function to merge images into PDF
mergeImagesToPDF();