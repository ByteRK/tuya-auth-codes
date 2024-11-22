const logger = require('./src/log.js');
const getAuth = require('./src/getAuth.js');

const express = require('express');             // 导入express框架

const app = express();
const port = 10211;

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



    // // 查询数据库中是否存在与提供的MAC地址绑定的授权码
    // db.get("SELECT uuid, key FROM assignedcodes WHERE mac = ?", [mac], (err, row) => {
    //     if (err) {
    //         getAuthLog(ip, id, mac, 3, '用户数据库查询出错');
    //         return res.status(200).json({ code: 404, message: '用户数据库查询出错', data: {} });
    //     }

    //     if (row) {
    //         const { uuid, key } = row;
    //         logRequest(ip, requestTime, mac, '已有授权码 uuid:' + uuid + ', key:' + key);
    //         return res.json({ code: 200, message: '已有授权码', data: { mac: mac, uuid: uuid, key: key } });
    //     } else {
    //         // 获取一个授权码并从授权码表中删除
    //         db.get("SELECT uuid, key FROM authcodes LIMIT 1", (err, row) => {
    //             if (err) {
    //                 logRequest(ip, requestTime, mac, '授权码数据库查询出错');
    //                 return res.status(200).json({ code: 404, message: '授权码数据库查询出错', data: {} });
    //             }

    //             if (!row) {
    //                 logRequest(ip, requestTime, mac, '没有可用的授权码');
    //                 return res.status(200).json({ code: 201, message: '没有可用的授权码', data: {} });
    //             }

    //             const { uuid, key } = row;

    //             // 插入分配的授权码到已分配表中
    //             db.run("INSERT INTO assignedcodes (uuid, key, mac) VALUES (?, ?, ?)", [uuid, key, mac], (err) => {
    //                 if (err) {
    //                     logRequest(ip, requestTime, mac, '数据库插入出错');
    //                     return res.status(200).json({ code: 300, message: '数据库插入出错', data: {} });
    //                 }

    //                 // 从授权码表中删除已分配的授权码
    //                 db.run("DELETE FROM authcodes WHERE uuid = ?", [uuid], (err) => {
    //                     if (err) {
    //                         logRequest(ip, requestTime, mac, '删除授权码出错 uuid:' + uuid + ', key:' + key);
    //                         return res.status(200).json({ code: 300, message: '删除授权码出错', data: {} });
    //                     }

    //                     logRequest(ip, requestTime, mac, '授权码分配成功 uuid:' + uuid + ', key:' + key);
    //                     return res.json({ code: 200, message: '授权码分配成功', data: { mac: mac, uuid: uuid, key: key } });
    //                 });
    //             });
    //         });
    //     }
    // });
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
