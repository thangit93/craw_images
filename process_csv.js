const fs = require('fs');
const csv = require('csv-parser');
const mergeImagesToPDFCanhDieu = require('./ultils/canhdieu')
const mergeImagesToPDFTapHuan = require('./ultils/taphuan')

// Hàm đọc và xử lý tệp CSV
async function processCSV(filePath) {
  try {
    const results = [];
    const tasks = [];

    // Đọc tệp CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        let { type, link, path} = data;
        
        if (type === 'canhdieu') {
          tasks.push(mergeImagesToPDFCanhDieu(link));
        } else if (type === 'taphuan') {
          if (!path) path = 0
          tasks.push(mergeImagesToPDFTapHuan(link, path));
        } else {
          console.error(`Unknown type: ${type}`);
        }
      })
      .on('end', async () => {
        // Chờ tất cả các tác vụ hoàn thành
        try {
          await Promise.all(tasks);
          console.log('CSV processing completed.');
        } catch (error) {
          console.error('Error processing tasks:', error);
        }
      });
  } catch (error) {
    console.error('Error processing CSV file:', error);
  }
}

// Gọi hàm processCSV với đường dẫn tới tệp CSV của bạn
processCSV('/app/download.csv');
