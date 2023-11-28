const axios = require('axios');
const imgToPDF = require('image-to-pdf')
const download = require('image-downloader')
const fs = require('fs')

const BASE_URL = 'https://apitaphuan.nxbgd.vn';

const downloadImage = (dir, image) => {
  return new Promise(resolve => {
    let options = {
      url: `${BASE_URL}/${image}`, dest: dir // will be saved to /path/to/dest/image.jpg
    }
    download.image(options)
      .then(({ filename }) => {
        console.log(filename);
        resolve(fs.readFileSync(filename))
      })
  })
}

axios.post(`${BASE_URL}/api/training-course/get-by-id-home-page`, {
  ID: "c91fee93-ca0c-4b71-976a-2c60c76fcb6d",
}).then((res) => {
  const { data } = res
  const { Childrens } = data.Data.ListDocumentGroup[0]

  for (let i = 0; i < Childrens.length; i++) {
    var dir = `/tmp/images/folder_${i}`
    const images = []
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    const promises = [];
    for (let j = 0; j < Childrens[i].Childrens.length; j++) {
      promises.push(downloadImage(dir, Childrens[i].Childrens[j].Front.LinkFile)
        .then((image) => {
          images.push(image)
        }))
      if (Childrens[i].Childrens[j].Back.LinkFile) {
        promises.push(downloadImage(dir, Childrens[i].Childrens[j].Back.LinkFile)
        .then((image) => {
          images.push(image)
        }))
      }
      // images.push(`${BASE_URL}/${Childrens[i].Childrens[j].Front.LinkFile}`)
      // if (Childrens[i].Childrens[j].Back.LinkFile) {
      //   images.push(`${BASE_URL}/${Childrens[i].Childrens[j].Back.LinkFile}`)
      // }
    }
    Promise.all(promises)
      .then(() => {
        imgToPDF(images, imgToPDF.sizes.A4)
          .pipe(fs.createWriteStream(`/app/pdf/${Childrens[i].FileName}.pdf`))
      })
  }

})
