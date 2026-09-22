# Chrome Web Store 文案草稿

名称：Feed Lens · 社媒标签

摘要：为微博、Threads 和 X 添加可自定义的主题与表达方式标签，各平台独立配置。

## 详细说明

给每条帖子，多两个观察角度。

Feed Lens 根据帖子文字显示“讲什么”和“如何表达”标签，帮助你在浏览微博、Threads 和 X 时快速了解内容特征。

- 作者名字一行最多展示四个标签，多余标签收起为 +N。
- 点击小齿轮查看完整标签、判断分值、所读文字，或重新判断。
- 每个平台拥有独立标签词典和开关。可增删标签，自定义名称和判断标准。
- 使用你自己的 TypeSafe API key；Key 保存在当前浏览器本机扩展存储中，不通过 Chrome 同步。

使用前需要 TypeSafe 账户、API key 和可用额度，调用费用由你的 TypeSafe 账户承担。在设置中保存 Key，再按平台开启自动标注。

开启后，已加载的帖子文字（包括屏幕外预加载和你有权查看的非公开帖子）、平台标识和标签判断标准会直接发送至 TypeSafe。API key 用于认证。只分析文字，不识别图片和视频。标签是模型判断，不能代替事实核查；分类服务依赖 TypeSafe 的可用性。

本项目基于 Apache-2.0 开源，与微博、Meta、X、Google 和 TypeSafe 无隶属关系。当前设置界面为简体中文。

## 提交前填写

- 源码：https://github.com/SkywalkerDarren/feed-lens
- 支持：https://github.com/SkywalkerDarren/feed-lens/issues
- 隐私政策 URL：https://skywalkerdarren.github.io/feed-lens/privacy.html （发布 Pages 后验证）
- 发布者：SkywalkerDarren；隐私联系邮箱：contact@darrenis.top。
- 商店页面链接：尚未创建。
