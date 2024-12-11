const logger = require('./log.js');
const files = require('./files.js');
const sqlite3 = require('sqlite3').verbose();

function getAuthLog(ip, id, mac, level, result) {
    const logData = `[getAuthLog] ${ id } | ${ ip } | ${ mac } | ${ result }`;
    if (level == 1) {
        logger.info(logData);
    } else if (level == 2) {
        logger.warn(logData);
    } else {
        logger.error(logData);
    }
}

function checkAuthLog(ip, id, mac, level, result) {
    let logData;
    if (mac) {
        logData = `[checkAuthLog] ${ id } | ${ ip } | ${ mac } | ${ result }`;
    } else {
        logData = `[checkAuthLog] ${ id } | ${ ip } | ${ result }`;
    }
    if (level == 1) {
        logger.info(logData);
    } else if (level == 2) {
        logger.warn(logData);
    } else {
        logger.error(logData);
    }
}

function searchAuthLog(ip, id, mac, level, result) {
    const logData = `[searchAuthLog] ${ id } | ${ ip } | ${ mac } | ${ result }`;
    if (level == 1) {
        logger.info(logData);
    } else if (level == 2) {
        logger.warn(logData);
    } else {
        logger.error(logData);
    }
}

// 搜索授权码
function searchAuthCode(id, mac, ip, callback) {
    const db = new sqlite3.Database(`./db/${ id }.db`);
    db.get("SELECT uuid, key FROM assignedcodes WHERE mac = ?", [mac], (err, row) => {
        if (err) {
            searchAuthLog(ip, id, mac, 3, '搜索授权码失败');
            callback(err, false, "", "");
        } else if (row) {
            const { uuid, key } = row;
            searchAuthLog(ip, id, mac, 1, `搜索授权码成功 ${ uuid } - ${ key }`);
            callback(null, true, uuid, key);
        } else {
            searchAuthLog(ip, id, mac, 1, '未分配授权码');
            callback(null, false, "", "");
        }
    });
}

// 获取授权码
function onGet(req, res) {
    const id = req.query.project;
    const mac = req.query.mac;
    const ip = req.ip;

    if (!mac || !id) {
        getAuthLog(ip, id, mac, 2, '请求信息不完整');
        return res.status(200).json({ code: 300, message: '请求信息不完整', data: {} });
    }

    files.checkDbFiles(id, (err, status) => {
        if (status) {
            const db = new sqlite3.Database(`./db/${ id }.db`);
            db.get("SELECT uuid, key FROM assignedcodes WHERE mac = ?", [mac], (err, row) => {
                if (err) {
                    getAuthLog(ip, id, mac, 3, '用户数据库查询出错');
                    return res.status(200).json({ code: 404, message: '用户数据库查询出错', data: {} });
                }

                if (row) {
                    const { uuid, key } = row;
                    getAuthLog(ip, id, mac, 1, '已有授权码 uuid:' + uuid + ', key:' + key);
                    return res.json({ code: 200, message: '已有授权码', data: { mac: mac, uuid: uuid, key: key } });
                } else {
                    // 获取一个授权码并从授权码表中删除
                    db.get("SELECT uuid, key FROM authcodes LIMIT 1", (err, row) => {
                        if (err) {
                            getAuthLog(ip, id, mac, 3, '授权码数据库查询出错');
                            return res.status(200).json({ code: 404, message: '授权码数据库查询出错', data: {} });
                        }
                        if (!row) {
                            getAuthLog(ip, id, mac, 2, '没有可用的授权码');
                            return res.status(200).json({ code: 201, message: '没有可用的授权码', data: {} });
                        }

                        const { uuid, key } = row;

                        // 插入分配的授权码到已分配表中
                        db.run("INSERT INTO assignedcodes (uuid, key, mac) VALUES (?, ?, ?)", [uuid, key, mac], (err) => {
                            if (err) {
                                getAuthLog(ip, id, mac, 3, '数据库插入出错');
                                return res.status(200).json({ code: 300, message: '数据库插入出错', data: {} });
                            }

                            // 从授权码表中删除已分配的授权码
                            db.run("DELETE FROM authcodes WHERE uuid = ?", [uuid], (err) => {
                                if (err) {
                                    getAuthLog(ip, id, mac, 3, '删除授权码出错 uuid:' + uuid + ', key:' + key);
                                    return res.status(200).json({ code: 300, message: '删除授权码出错', data: {} });
                                }
                                getAuthLog(ip, id, mac, 1, '授权码分配成功 uuid:' + uuid + ', key:' + key);
                                return res.json({ code: 200, message: '授权码分配成功', data: { mac: mac, uuid: uuid, key: key } });
                            });
                        });
                    });
                }
            });
        } else {
            getAuthLog(ip, id, mac, 3, '请求的项目数据库文件不存在');
            return res.status(200).json({ code: 300, message: '请求的项目数据库文件不存在', data: {} });
        }
    })
}

// 查询授权码
function onCheck(req, res) {
    const id = req.query.project;
    const mac = req.query.mac;
    const ip = req.ip;

    if (!id) {
        checkAuthLog(ip, id, mac, 2, '请求信息不完整');
        return res.status(200).json({
            code: 300, message: '请求信息不完整(mac为可选项)', data: {
                id: id ? id : null,
                mac: mac ? mac : null,
            }
        });
    }

    files.checkDbFiles(id, (err, status) => {
        if (status) {
            if (mac) {
                // 搜索指定设备
                searchAuthCode(id, mac, ip, (serErr, serStatus, uuid, key) => {
                    if (serErr) {
                        return res.status(200).json({
                            code: 300, message: `搜索设备授权码失败`, data: {
                                id: id,
                                mac: mac,
                                uuid: null,
                                key: null
                            }
                        });
                    } else if (serStatus) {
                        return res.status(200).json({
                            code: 200, message: `搜索设备授权码成功`, data: {
                                id: id,
                                mac: mac,
                                uuid: uuid,
                                key: key
                            }
                        })
                    } else {
                        return res.status(200).json({
                            code: 300, message: `设备未分配授权码`, data: {
                                id: id,
                                mac: mac,
                                uuid: null,
                                key: null
                            }
                        });
                    }
                });
            } else {
                // 查询项目授权码
                let useCount = 0;
                let overCount = 0;
                const db = new sqlite3.Database(`./db/${ id }.db`);
                db.all("SELECT * FROM authcodes", (overErr, overRows) => {
                    if (overErr) {
                        checkAuthLog(ip, id, mac, 3, `剩余授权码数据查询失败`);
                        overCount = -1;
                    } else {
                        overCount = overRows.length;
                    }
                    db.all("SELECT * FROM assignedcodes", (useErr, useRows) => {
                        if (useErr) {
                            checkAuthLog(ip, id, mac, 3, `已分配的授权码数据查询失败`);
                            useCount = -1;
                        } else {
                            useCount = useRows.length;
                        }
                        return res.json({
                            code: 200, message: `项目授权码数据查询成功`, data: {
                                id: id,
                                use: useCount,
                                over: overCount
                            }
                        });
                    });
                });
            }
        } else {
            checkAuthLog(ip, id, mac, 3, '查询的项目数据库文件不存在');
            return res.status(200).json({ code: 300, message: `查询的 ${ id } 项目数据库文件不存在`, data: {} });
        }
    })
}

module.exports = {
    onGet,
    onCheck
};