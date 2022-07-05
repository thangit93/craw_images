const fs = require('fs')
const download = require('image-downloader')
const imgToPDF = require('image-to-pdf')

const downloadImages = async () => {
  for (let i = 1; i <= 22; i++) {
    let options = {
      url: 'https://hvegjijo7jobj.vcdn.cloud/E_Learning/page/' + i + '_Toan10T1_07_04_2022_v20.jpg', dest: '/app/images' // will be saved to /path/to/dest/image.jpg
    }
    filename = await download.image(options)
    console.log('Saved to', filename)
  }
}

downloadImages()

// const convertImagesToPdf = async () => {
//   fs.readdir('/app/images', (err, files) => {
//     console.log(files);

//   })
// }

// convertImagesToPdf()