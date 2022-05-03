const request = require('request');
const fs = require('fs');

const downloadImage = (url) => {
  const filename =  url.split('/').pop();

  console.log(url);

  return new Promise((resolve, reject) => {
    request({ url })
      .pipe(
        fs.createWriteStream(`./imgs/${filename}`)
          .on('end', () => { resolve() })
          .on('close', err => { reject(err) })
      )   
  })
}

module.exports = {
  downloadImage
}
