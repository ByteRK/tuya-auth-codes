const log4js = require('log4js');               // 导入日志插件
log4js.configure('log4js.json');                // 导入配置文件
const logger = log4js.getLogger('ricken');      // 使用ricken类型的日志实例

module.exports = logger;