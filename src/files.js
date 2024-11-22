const fs = require('fs');                       // 导入文件系统模块

// 检查数据库文件是否存在
function checkDbFiles(id, callback) {
    console.log(`./db/${ id }.db`);
    fs.access(`./db/${ id }.db`, (err) => {
        if (err) {
            console.log(err);
            if (err.code === 'ENOENT') {
                callback(null, false); // 文件不存在
            } else {
                callback(err, false); // 其他错误
            }
        } else {
            callback(null, true); // 文件存在
        }
    });
}

module.exports = {
    checkDbFiles
};