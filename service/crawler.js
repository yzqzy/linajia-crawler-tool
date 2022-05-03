const https = require('https');

// 获取楼盘列表
const getLoupanList = ({
  city = 'tj',
  area = 'xiqing'
} = {}) => {
  let ans = [];

  const getList = (page) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'm.lianjia.com',
        port: 443,
        path: `/${ city }/loupan/${ area }/pg${ page }?_t=1&source=list`,
        method: 'GET',
        Headers: {
          'Content-Type': 'application/json',
        }
      }
  
      let buff = '';
  
      const req = https.request(options, res => {
        res.on('data', d => {
          buff += d;
        })
      })
      
      req.on('error', error => {
        reject(error);
      })
  
      req.on('close', () => {
        const { data } = JSON.parse(buff);
        const { _resblock_list } = data.body || {};
        
        resolve(_resblock_list);
      });
      
      req.end()
    });
  }

  return new Promise(async (resolve, reject) => {
    for (let p = 0; p < 100; p++) {
      const data = await getList(p);

      if (!Array.isArray(data) || Array.isArray(data) && data.length === 0) {
        resolve(ans);
        break;
      }

      ans = ans.concat(data);
    }
  });
}

module.exports = {
  getLoupanList
}
