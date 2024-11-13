// ==UserScript==
// @name         breakRpeat
// @author       Sheyiyuan
// @version      1.0.1
// @description  打断复读，打断复读的消息条数和打断回复的消息可以装载插件后在设置界面中配置相关参数
// @timestamp    1731507453
// 2024-11-13 22:17:33
// @license      MIT
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

/**
 * 检查消息记录数组中是否存在连续重复的消息，且重复次数是否达到指定限制
 * @param {Array} messageRecord - 消息记录数组
 * @param {number} limit - 复读次数限制
 * @returns {boolean} - 如果消息记录中存在连续重复的消息且达到指定限制，返回 true；否则返回 false
 */
function RepeatTimeCheck(messageRecord, limit) {
    //检查messageRecord长度是否超过limit且各消息是否相同
    if (messageRecord.length < limit) {
        return false
    }
    for (let i = 0; i < messageRecord.length; i++) {
        if (messageRecord[i] !== messageRecord[0]) {
            return false
        }
    }
    return true
}

// 注册扩展
let ext = seal.ext.find('breakRepeat');
if (!ext) {
    ext = seal.ext.new('breakRepeat', 'Sheyiyuan', '1.0.1');
    ext.onNotCommandReceived = (ctx, msg) => {
        let limit = seal.ext.getIntConfig(ext, "触发打断复读的消息条数")
        let reply = seal.ext.getStringConfig(ext, "打断回复的消息（可以使用豹语）")
        let message = msg.message
        let messageRecordJson = seal.vars.strGet(ctx, `$g_breakRepeat_messageRecord`)[0]
        if (!messageRecordJson) {
            messageRecordJson = JSON.stringify([])
        }
        let messageRecord = JSON.parse(messageRecordJson)
        messageRecord.push(message)
        if (messageRecord.length > limit) {
            messageRecord.shift()
        }
        if (RepeatTimeCheck(messageRecord, limit)) {
            // 连续三条消息相同，打断复读
            seal.replyToSender(ctx, msg, reply);
            messageRecord = []
        }
        seal.vars.strSet(ctx, `$g_breakRepeat_messageRecord`, JSON.stringify(messageRecord))
    }
    seal.ext.register(ext);
}
seal.ext.registerIntConfig(ext, "触发打断复读的消息条数", 5)
seal.ext.registerStringConfig(ext, "打断回复的消息（可以使用豹语）", "打断复读")