const log4js = require('log4js');                       // 导入日志插件
const fs = require('fs');                               // 导入文件模块
const path = require('path');                           // 导入路径模块

const folderPath = './log';                             // 日志目录
const filePath = path.join(folderPath, 'run.log');      // 日志文件

try {
    fs.mkdirSync(folderPath, { recursive: true });      // 创建日志目录
    fs.writeFileSync(filePath, '');                     // 创建空文件
    console.log('Log File created successfully!');
} catch (err) {
    console.error('Error:', err);
    process.exit(1);                                    // 文件创建异常
}

log4js.configure('log4js.json');                        // 导入配置文件
const logger = log4js.getLogger('ricken');              // 使用ricken类型的日志实例

module.exports = logger;                                // 抛出接口