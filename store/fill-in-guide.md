# Feed Lens 0.4.0 商店填写材料

对应草稿 ID：`bohbflibcjahgkjibdcpamjpoacdbcan`。本文件是填写材料，不表示已保存或提交审核。

## 1. Store listing

当前默认语言为 English – en。Title 和 Summary 由安装包自动提供。

### Description（英文，直接复制）

```text
Your labels. Your perspective on the feed.

Feed Lens adds customizable text labels to Weibo, Threads and X, helping you see what a post is about and how it communicates.

CUSTOMIZE YOUR FEED
• Organize labels into content topics and expression styles.
• Create your own label names and descriptions.
• Keep a separate label dictionary and automatic-labeling switch for each platform.

COMPACT, USEFUL DETAILS
• See up to four labels beside the post author, with +N for additional matches.
• Open the gear menu to view all matching labels, scores and extracted text, or retry a classification.
• Posts are detected as they load, with duplicate requests combined and temporary errors retried automatically.

TAKE YOUR SETTINGS WITH YOU
• Import and export platform dictionaries, switches and interface language as JSON.
• Your API key stays in your browser and is excluded from configuration exports.
• Choose English, Simplified Chinese, Japanese, Spanish, Italian or German.

GET STARTED
1. Open Feed Lens settings and save your TypeSafe API key under API connection.
2. Select Weibo, Threads or X, enable automatic labeling and save the platform.
3. Refresh the social website.

A TypeSafe account, API key and available usage allowance are required. API usage is billed to your TypeSafe account. New installations start with all platforms paused.

Enabled platforms send loaded post text, platform names and label rules directly to TypeSafe for classification. This includes preloaded posts, quoted text and non-public posts you can access. Your key and settings are stored locally without Chrome sync.

Open source under Apache-2.0:
https://github.com/SkywalkerDarren/feed-lens

Privacy:
https://darrenis.top/products/feed-lens/privacy/

Support:
https://github.com/SkywalkerDarren/feed-lens/issues
```

### Description（简体中文，可切到 zh-CN 后填写）

```text
用自己的标签，从自己的视角阅读信息流。

Feed Lens 为微博、Threads 和 X 的帖子添加自定义文字标签，从「讲什么」与「如何表达」两个角度帮助你阅读内容。

自定义你的标签
• 按内容主题与表达方式组织标签。
• 自行编辑标签显示文字与标签描述。
• 微博、Threads 和 X 分别保存标签词典与自动标注开关。

紧凑展示，按需查看详情
• 作者名字旁最多显示四个标签，多出的用 +N 表示。
• 点击齿轮查看全部匹配标签、分值、所读文字，或重新判断。
• 帖子加载后自动检测，合并重复请求，临时错误自动重试。

随身携带你的配置
• 用 JSON 导入、导出所有平台的标签、开关和界面语言。
• API Key 留在当前浏览器中，不包含在导出配置里。
• 支持简体中文、英语、日语、西班牙语、意大利语和德语界面。

开始使用
1. 打开 Feed Lens 设置，在「API 连接」中保存自己的 TypeSafe API Key。
2. 选择微博、Threads 或 X，开启自动标注并保存当前平台。
3. 刷新社交网站。

需要 TypeSafe 账户、API Key 和可用额度，API 调用费用由你的 TypeSafe 账户承担。首次安装时所有平台默认暂停。

启用的平台会将已加载的帖子文字、平台名称和标签规则直接发送至 TypeSafe 进行分类，可能包括预加载帖子、引用文字及你有权查看的非公开帖子。Key 与设置保存在本机，不通过 Chrome 同步。

Apache-2.0 开源代码：
https://github.com/SkywalkerDarren/feed-lens

隐私说明：
https://darrenis.top/products/feed-lens/privacy/?lang=zh

反馈与支持：
https://github.com/SkywalkerDarren/feed-lens/issues
```

### 其他字段

| 字段 | 填写内容 |
| --- | --- |
| Category | 优先选 Productivity / 生产力；若有细分类，选 Tools / 工具 |
| Official URL | 保留已验证的 darrenis.top |
| Homepage URL | `https://darrenis.top/products/feed-lens/` |
| Support URL | `https://darrenis.top/products/feed-lens/support/` |
| Mature content | 关闭；扩展本身是通用文字标签工具 |
| Promo video | 留空 |
| Marquee promo tile | 留空，当前未制作此可选素材 |

### 上传素材

以下路径相对于项目目录 `/Users/darren/Documents/feed-lens`。

| 后台位置 | 文件 | 尺寸 |
| --- | --- | --- |
| Store icon | `icons/icon-128.png` | 128 × 128 |
| Global screenshots（第 1 张） | `store/screenshot-labels.png` | 1280 × 800 |
| Global screenshots（第 2 张） | `store/screenshot-settings.png` | 1280 × 800 |
| Small promo tile | `store/promo-440x280.png` | 440 × 280 |

截图与宣传图已核对为无 Alpha 的 RGB PNG。现有截图展示中文界面；全局截图可供各语言共用，Localized screenshots 可用于以后上传对应语言截图。标签示例使用合成帖子与模拟结果。

## 2. Privacy

### Single purpose description

```text
Feed Lens adds user-defined text classification labels to posts on Weibo, Threads and X, using the user's own TypeSafe API key and independently configured labels for each platform.
```

### storage justification

```text
The storage permission saves the user's TypeSafe API key, interface language, label dictionaries and per-platform enabled switches in chrome.storage.local. These settings are needed to authenticate classification requests and apply the user's chosen labels. Chrome sync is not used. Storage access is restricted to trusted extension contexts.
```

### Host permission justification

```text
Access to weibo.com, threads.com, threads.net, x.com and twitter.com, including their www hosts, is used to extract loaded social post text and display labels beside each post's author. The current and legacy domains support the same platforms. Each platform has its own automatic-labeling switch.

Access to api.typesafe.ai is used by the extension service worker to send post text, platform identifiers and label rules directly to the user's TypeSafe account and receive structured classification scores. The user's API key authenticates these requests. No remote executable code is downloaded.
```

若后台按域名拆开，社交域名使用第一段；api.typesafe.ai 使用第二段。

### Remote code

选择 **No, I am not using remote code**。若显示说明栏：

```text
All JavaScript and other executable extension code is included in the package. TypeSafe returns JSON classification scores only. The extension does not download or execute remote JavaScript or WebAssembly.
```

### Privacy policy URL

```text
https://darrenis.top/products/feed-lens/privacy/
```

### Data usage

确定涉及的类型：

- **Website content**：提取并发送帖子正文和标签规则。
- **Authentication information**：API Key 保存在本机，并发送至 TypeSafe 用于认证。

正文还可能含姓名、账号提及、链接及其他个人或敏感信息，TypeSafe 接收连接 IP。遇到后台其余类别时，应结合各项具体定义与这些实际数据流披露；这两项不是对其余类别一律不选的建议。

关于用途的三项声明，代码与隐私说明支持以下事实，勾选前由提交者核对后台完整原文：

- 不向第三方出售用户数据；为分类向 TypeSafe 传输的情况已披露。
- 仅为扩展的文字分类用途使用、传输数据。
- 不为确定信用状况或贷款资格使用、传输数据。

## 3. Distribution

面向公开发布可选择 **Public**。本工具免费安装，TypeSafe API 调用单独由用户账户付费。地区按你希望服务的市场选择；如无地区限制，可选择所有可用地区。

## 4. Test instructions

### 测试说明（直接复制）

```text
Feed Lens has no separate extension account. Classification requires a TypeSafe API key with available usage allowance. Social websites may require their own login to display a feed.

1. Install the extension in Chrome 114 or later.
2. Open the extension settings and choose API connection.
3. Enter a valid TypeSafe API key, save it, and click Test connection. The test uses a built-in sample and works while automatic labeling is paused.
4. Select Weibo, Threads or X in the sidebar, enable automatic labeling and save that platform. Other platforms remain independently controlled.
5. Open or refresh the chosen social website and view posts containing text. Matching labels appear beside the author. Up to four labels are shown; additional matches are available through +N and the gear menu.
6. Open the gear menu to inspect labels, scores and extracted text, or retry a request.
7. In settings, add or edit a label. Label display is required and accepts up to 30 characters; label description is required and accepts up to 400 characters. Save and refresh the social page.
8. Export settings as JSON, then import the file and confirm the summary. Dictionaries, platform switches and language are restored; the API key is not exported or replaced by an import.
9. Switch the interface language to English, Simplified Chinese, Japanese, Spanish, Italian or German.
10. Pause a platform and save, or clear the API key, to stop future classification requests.

Source code: https://github.com/SkywalkerDarren/feed-lens
Support contact: contact@darrenis.top
```

**需要你准备的审核条件：** 如后台要求凭据，请在其私密测试凭据栏提供具有可用额度的审核专用 TypeSafe Key。当前素材没有附带审核 Key，不要把 Key 写到公开 Description、截图或 GitHub 中。社交平台登录要求与 TypeSafe Key 是两件事。

## 5. 保存与提交

完成各页后点击 Save draft，再用 Why can't I submit? 查看后台尚缺项目。补齐后点击 Submit for review，按实际确认窗口完成提交。最终以后台显示 Pending review / In review 等状态为提交凭据；公开上架另以商店页面为准。

官方参考：https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
