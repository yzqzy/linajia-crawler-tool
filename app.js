const { downloadImage }  = require('./shared/download');
const { getLoupanList } = require('./service/crawler');
const ExcelService = require('./shared/excel');

const HEADERS = [
  { header: '城市', key: 'city_name', width: 15 },
  { header: '地区', key: 'district_name', width: 15 },
  { header: '图片地址', key: 'cover_pic', width: 15 },
  { header: '名称', key: 'title', width: 30 },
  { header: '规模', key: 'frame_rooms_desc', width: 15 },
  { header: '规模详情', key: 'converged_rooms', width: 30 },
  { header: '平均价格', key: 'average_price', width: 15 },
  { header: '展示价格', key: 'show_price_info', width: 15 },
  { header: '参考总价', key: 'reference_total_price', width: 30 },
  { header: '地址', key: 'address', width: 50 },
  { header: '房屋类型', key: 'house_type', width: 15 },
  { header: '在售状态', key: 'sale_status', width: 15 },
  { header: '效果图', key: 'preload_detail_image', width: 30 },
  { header: '卖点', key: 'tags', width: 50 },
  { header: '商圈', key: 'bizcircle_name', width: 15 },
  { header: '建面', key: 'resblock_frame_area', width: 30 },
  { header: '装修', key: 'decoration', width: 15 },
  { header: '开发商', key: 'developer_company', width: 50 },
];

const normalizeData = (data) => {
  return data.map(cur => ({
    ...cur,
    tags: cur.tags.join('、'),
    developer_company: cur.developer_company.join('、'),
    preload_detail_image: Array.isArray(cur.preload_detail_image) 
      ? cur.preload_detail_image[0] && cur.preload_detail_image[0].image_url : '',
    converged_rooms: cur.converged_rooms.reduce((prev, cur) => {
      prev += `${ cur.bedroom_count }居,${ cur.area_range }、`
      return prev;
    }, '').replace(/、$/, '')
  }))
}

const crawler = async (options) => {
  const { filename, ...otherArgs } = options;

  const result = await getLoupanList(otherArgs);
  const data = normalizeData(result);

  console.log('download linajia loupan info finished.');

  // 下载图片
  for (let i = 0; i < data.length; i++) {
    const { cover_pic, preload_detail_image } = data[i];
    
    try {
      await downloadImage(cover_pic);
      await downloadImage(preload_detail_image);
    } catch (error) {
      console.log(error);
    }
  }

  console.log('download images finished.');

  const baseInfo = {
    data,
    filename,
    header: HEADERS,
    sheetName: '列表',
    imageKeys: [
      {
        name: 'cover_pic',
        imgWidth: '100',
        imgHeight: '100',
      },
      {
        name: 'preload_detail_image',
        imgWidth: '100',
        imgHeight: '100',
      },
    ],
  }

  // 导出 Excel
  new ExcelService().exportExcel(baseInfo);
}

// https://m.lianjia.com/tj/loupan/xiqing/pg1
const init = () => {
  crawler({
    filename: '天津西青楼盘列表',
    city: 'tj',
    area: 'xiqing'
  });
  // crawler({
  //   filename: '天津南开楼盘列表',
  //   city: 'tj',
  //   area: 'nankai'
  // });
}

init();
