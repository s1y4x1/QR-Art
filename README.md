# QR-Art
你可以自由绘制二维码的数据区，或导入图片（含动图）自动二值化生成二维码。

https://s1y4x1.github.io/QR-Art \
https://s1y4x1.github.io/QR-Art/dual-mode-entry.html

## 嵌入模式

`embed.html` 仅显示二维码，复用 `qrcode-lib.js`，不加载编辑器界面。父页面通过 `postMessage` 发送 `{type: 'QR_ART_RENDER', protocol: 1, requestId, config: {text, version: 5, ecc: 'L', mask: 7, animate: true, speed: 1}}`。嵌入页面加载后会发送 `QR_ART_READY`，生成成功后回复 `QR_ART_RENDERED`，失败回复 `QR_ART_ERROR`；回复带有相同的 requestId。双方应校验消息来源窗口和 origin。

像素文字使用移除 `http(s)://` 前缀后的实际地址，位于第 11–22 列，从上向下滚动。只调整终止标记后的填充位，每帧重算纠错码，不覆盖正文、定位或时序图形。参数为 8px 模块、8px 外边距、100% 方块、黑白配色。URL 超过版本 5 可用容量时明确报错。

使用 `{type: 'QR_ART_PAUSE', protocol: 1, paused: true}` 可暂停（false 恢复），页面隐藏时也自动暂停。嵌入页面不读取父页面内容或浏览器扩展 API。部署时需一起发布 `embed.html`、`embed.css`、`embed.js` 及更新的 `qrcode-lib.js`。
