// // 导入数据库操作模块
// const db = require('./db/index')
// const cate = 9
// const text =[{
//   title: '目前我国义务兵服役期限为（）',
//   opa: '1年',
//   opb: '2年',
//   opc: '3年',
//   opd: '4年',
//   answer:'B'
// },
// {
//   title: '毛泽东是一位伟大的军事家，撰写了大量的军事著作，下列哪一部不是毛泽东所著？',
//   opa: '《论持久战》',
//   opb: '《战争和战略问题》',
//   opc: '《战争论》',
//   opd: '《星星之火，可以燎原》',
//   answer:'C'
//   },{
//     title: '目前我国边界地区存在划界争端的主要是在（）',
//     opa: '中俄边界',
//     opb: '中印边界',
//     opc: '中越边界',
//     opd: '中朝边界',
//     answer:'B'
//   },{
//     title: '信息化战争使战争进程大大缩短，1999年的科索沃战争共进行了多少天？',
//     opa: '18天',
//     opb: '42天',
//     opc: '44天',
//     opd: '78天',
//     answer:'D'
//   },{
//     title: '《孙子兵法》是我国历史上经典的军事著作，作者孙武所属年代是（）',
//     opa: '春秋末年',
//     opb: '秦朝',
//     opc: '唐朝',
//     opd: '宋朝',
//     answer:'A'
//   },{
//     title: '隐身战术已经广泛应用于现代作战飞机，下列哪种型号的飞机不是隐身飞机？',
//     opa: 'B-2',
//     opb: 'B-52',
//     opc: 'F-22',
//     opd: 'F-117',
//     answer:'B'
//   },{
//     title: '下列哪个国家目前还没有拥有核武器（）',
//     opa: '巴基斯坦',
//     opb: '印度',
//     opc: '日本',
//     opd: '朝鲜',
//     answer:'C'
//   },{
//     title: '我国的装甲兵兵种是（）组建的',
//     opa: '1938年',
//     opb: '1942年',
//     opc: '1945年',
//     opd: '1950年',
//     answer:'C'
//   },{
//     title: '以下哪一项不是基本的队列队形？',
//     opa: '横队',
//     opb: '纵队',
//     opc: '并列纵队',
//     opd: '菱形横队',
//     answer:'D'
//   },{
//     title: '精确制导技术是以什么探测器为基础的？',
//     opa: '太空探测器',
//     opb: '光电探测器',
//     opc: '生物探测器',
//     opd: '声呐',
//     answer:'B'
//   }
// ]
// const sql='insert into app_questions (title,option_A,option_B,option_C,option_D,answer,cate_id) values (?,?,?,?,?,?,?)'
// text.forEach((item,index) => {
//   db.query(sql, [item.title, item.opa, item.opb, item.opc, item.opd, item.answer,cate], (err, results) => {
//     if (err) console.log(err);
//     if (results.affectedRows !== 1) console.log('出错');
//     const i = index+1
//     console.log('共'+text.length+'条数据，第'+i+'条写入成功');
//   })
// })
// const arr = [1, 2]
// const res = arr.slice(0, 3)
// console.log(res);
