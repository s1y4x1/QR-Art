# QR-Art
你可以自由绘制二维码的数据区，或导入图片（含动图）自动二值化生成二维码。

https://s1y4x1.github.io/QR-Art \
https://s1y4x1.github.io/QR-Art/dual-mode-entry.html

## 通用嵌入模式

`embed.html` 是独立的二维码渲染页面，不依赖编辑器 DOM。任何网页或应用可通过 iframe 和 `postMessage` 调用；接口不包含特定项目的地址、字体、绘制区域、文字排版或滚动方向。纯二维码、单帧图案和多帧动画使用同一接口。

### 通信协议（v2）

1. 父页面嵌入 `embed.html`，推荐设置 `sandbox="allow-scripts allow-same-origin"`。
2. 子页面就绪后向父窗口发送 `{type: 'QR_ART_READY', protocol: 2, capabilities: ['bitmap-frames', 'qr-parameters']}`。
3. 父页面发送 `QR_ART_RENDER`，提供请求 ID 和配置：

```javascript
frame.contentWindow.postMessage({
  type: 'QR_ART_RENDER',
  protocol: 2,
  requestId: 'example-1',
  config: {
    text: '任意内容 / any content',
    version: 0,
    encoding: 'Byte',
    ecc: 'M',
    mask: -1,
    moduleSize: 8,
    margin: 32,
    foreground: '#000000',
    background: '#ffffff'
  }
}, qrArtOrigin);
```

4. 成功回复 `QR_ART_RENDERED`，带有相同的 `requestId` 和实际 `version`、`ecc`、`mask`、`size`、`modules`、`editableModules`、`artWritableModules`、`frameCount`。失败回复 `QR_ART_ERROR` 和 `message`。
5. `{type: 'QR_ART_PAUSE', protocol: 2, paused: true}` 暂停，false 恢复。页面隐藏时自动暂停，暂停期间不推进动画时间。

双方应校验消息的来源窗口和 origin；子页面只接受直接父窗口，第一次渲染后锁定其 origin。请求与响应必须匹配协议版本和请求 ID。不要使用远程页面传来的字符串执行代码。本页面不访问父页面 DOM 或扩展 API。

### 通用参数

| 参数 | 含义与默认值 |
| --- | --- |
| `text` | 要编码的原始字符串；不会删除协议或改变内容 |
| `encoding` | `Byte`（默认，UTF-8）、`Numeric`、`Alphanumeric` |
| `version` | `0` / `"auto"` 自动选择（默认），或 1–40 |
| `ecc` | `L`、`M`（默认）、`Q`、`H` |
| `mask` | `-1` / `"auto"` 自动选择（默认），或 0–7；动画各帧固定使用同一掩码 |
| `moduleSize` | 模块边长，默认 8px，范围 1–32 |
| `margin` | 外边距，默认四个模块宽，范围 0–256px |
| `foreground` / `background` | 十六进制 RGB，默认黑/白 |
| `moduleShape` | `square`（默认）或 `circle`；功能图形保持经典方块 |
| `moduleScale` | 数据模块缩放，0.2–1，默认 1；功能图形不缩放 |
| `paddingBackground` | `"original"`（默认）保留原填充图案；0/1 将可编辑填充模块设为背景色/前景色 |
| `animate` | 默认 true；false 仅显示第一帧 |
| `art` | 可选的像素帧配置，见下文；未提供时生成普通二维码 |

最终画布边长不得超过 2048px。内容超过所选版本容量时返回错误，不会擅自修改固定版本。自定义颜色、边距、圆点或缩放会影响实际扫描效果，调用方应验证自己的输出。

### 像素帧

```javascript
config.art = {
  x: 10, y: 10, width: 3, height: 3,
  frames: [
    '010111010',
    '101010101'
  ],
  frameDuration: 200,
  loop: true
};
```

坐标和宽高均以二维码模块为单位，不含外边距。每帧按行排列，长度必须等于 `width * height`：`1` 为前景色，`0` 为背景色，`.` 为透明（保留原图案或 paddingBackground）。可传入 1–512 帧，总像素数上限 2000000；每帧时长 16–60000ms。仅在多个帧且启用动画时运行播放循环；loop=false 时最后一帧停留。

图案只能修改终止标记后的填充位，定位、时序、正文及不可编辑模块会自动跳过，每帧重新计算纠错码。一个区域不保证全部可绘制，请查看返回的 `artWritableModules`，必要时增大版本或调整区域。文字、字体、图形、滚动方向、帧序列和速度策略均由调用方自行生成。

### 部署与调试

一起发布 `embed.html`、`embed.css`、`embed.js` 和更新的 `qrcode-lib.js`。v2 不再内置旧演示中的文字滚动规则，调用方应发送自己的像素帧，而不是依赖演示行为。

本地调试可通过 `QRArtEmbed.render(config)`、`drawFrame(index)`、`stop()` 和 `getState()` 检查渲染；这不赋予跨域父页面访问子页面 DOM 的权限。普通编辑器的生成行为不受这些可选接口影响。
