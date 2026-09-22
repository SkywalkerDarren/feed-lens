# 商店提交清单

本地发布候选：0.4.0。这个文件不代表已提交或已通过商店审核。

## 单一用途

为用户浏览的微博、Threads 和 X 帖子添加用户自定义的文字分类标签。

## 权限说明

| 权限 | 用途 |
| --- | --- |
| storage | 在本机保存用户 API key、语言、各平台标签与开关。仅受信任的扩展上下文可读取。 |
| api.typesafe.ai | 直接向用户自己的 TypeSafe 账户发起分类请求，接收结构化标签分值。 |
| weibo.com / www.weibo.com | 提取已加载的微博帖子文字并在帖子上展示标签。 |
| threads.com / threads.net 及 www | 提取已加载的 Threads 帖子文字并展示标签，覆盖当前与旧域名。 |
| x.com / twitter.com 及 www | 提取已加载的 X 帖子文字并展示标签，覆盖当前与旧域名。 |

没有 `tabs`、`cookies`、`history`、`webRequest`、`<all_urls>` 权限。依靠已获准的网站 host 权限识别相关标签页并通知设置变更。

远程代码：否。所有执行代码随包提供，TypeSafe 返回分类数据，不下载或执行 JavaScript/WASM。

## 隐私表单

不得填写“不收集/不传输任何数据”：帖子文字确实发送给 TypeSafe。

- Website content：选择，传输帖子文字与标签判断标准。
- Authentication information：选择，用户 API key 在本机保存并发送给 TypeSafe 认证。
- 正文可能含个人、健康、财务或通信内容。提交者应据商店当时的字段定义如实补充相关类别，不能仅凭没有自建服务器免于披露。
- 不出售数据、不用于与单一用途无关的目的、不用于信用判断。隐私政策、实际行为必须一致。

## 素材与验证

- 图标：icons/icon-128.png（128×128，透明留白）。
- 小型宣传图：store/promo-440x280.png。
- 截图：store/screenshot-labels.png 与 store/screenshot-settings.png，均为 1280×800。使用实际组件代码和本地合成数据，页面注明示例，不含真实 Key 或个人账号；不代表线上平台验收。
- 安装包：npm test && npm run package，上传 dist/feed-lens-0.4.0.zip；manifest.json 位于 ZIP 根目录。
- 干净配置验证：无 Key/未开启平台时没有 API 请求；开启一个平台后其它新平台仍暂停；检查正常标签、错误、重试、四标签与 +N、展开详情、保存和清除 Key。
- 人工确认微博/Threads/X 线上信息流 DOM 仍适配，并记录日期、Chrome 版本和结果。单元测试或模拟截图不能替代这一项。

## 仍需完成的外部步骤

1. 已确认仓库 SkywalkerDarren/feed-lens，隐私/安全联系邮箱 contact@darrenis.top。
2. 发布 Apache-2.0 仓库，公开托管隐私政策，验证无需登录可读。
3. 登录 Chrome Web Store Developer Dashboard；若需注册、接受协议或付费，由账户所有人完成相应步骤。
4. 上传 ZIP、图标、宣传图、截图，填写文案和隐私披露。
5. 使用具有可用额度的审核专用 TypeSafe 凭据提供必要测试条件；不要把个人 Key 写入公开文案、仓库或 ZIP。
6. 检查开发者后台实际内容后提交审核。以后台状态和公开商店页面确认结果。

官方参考：[隐私字段](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy) · [素材尺寸](https://developer.chrome.com/docs/webstore/images) · [注册](https://developer.chrome.com/docs/webstore/register)
