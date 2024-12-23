const fs = require('fs');

// 检查数据库文件是否存在
function checkDbFiles(project, callback) {
    // console.log(`./db/${ project }.db`);
    fs.access(`./db/${ project }.db`, (err) => {
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