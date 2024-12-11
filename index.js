const logger = require('./src/log.js');
const getAuth = require('./src/getAuth.js');

const express = require('express');             // 导入express框架

const app = express();
const port = 10201;

// // 连接到 SQLite 数据库
// const db = new sqlite3.Database('auth-codes.db');

// // 创建授权码表格
// db.serialize(() => {
//     db.run("CREATE TABLE IF NOT EXISTS authcodes (uuid TEXT PRIMARY KEY, key TEXT)");
// });

// // 创建已分配的授权码表格
// db.serialize(() => {
//     db.run("CREATE TABLE IF NOT EXISTS assignedcodes (uuid TEXT PRIMARY KEY, key TEXT, mac TEXT)");
// });

app.set('trust proxy', true);

// 监听网络请求
app.get('/getAuthCode', (req, res) => {
    getAuth.onGet(req, res);
});

// 获取所有授权码
app.get('/authCodes', (req, res) => {
    getAuth.onCheck(req, res);
});

// 测试超时
app.get('/timeout.tar.gz', (req, res) => {
});


// 启动服务器
app.listen(port, () => {
    logger.info(`[start]服务器运行在 http://localhost:${ port }`);
});
