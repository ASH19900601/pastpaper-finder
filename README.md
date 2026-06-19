# Past Paper Finder · 历年真题直连聚合器

> 选择科目与场次，一键生成 CAIE / AQA 的 IGCSE 与 A-Level 历年真题下载链接，并附带官方分数线参考。**纯前端、零后端、不托管任何文件。**

![status](https://img.shields.io/badge/type-static%20site-blue) ![license](https://img.shields.io/badge/license-MIT-green) ![stack](https://img.shields.io/badge/stack-HTML%2FCSS%2FJS-orange)

## ✨ 功能特性

- 🎯 **级联筛选**：学习阶段 → 科目 → 年份 → 考季 → Paper → 文件类型，逐级联动。
- 🌐 **多体系支持**：
  - Cambridge IGCSE / A-Level（按文件名规则拼装 BestExamHelp、PastPapers.co、Google 节点）；
  - AQA UK（filestore 官方直链，含 `-CR` 去版权变体优先逻辑）；
  - OxfordAQA International（从内置 manifest 读取真实 PDF 直链）。
- 📊 **分数线展示**：Question Paper 类型会显示官方等级分数线；A* 缺失时按 `A* = A + (A - B)` 自动预估。
- 🔌 **可用性探测**：可选地探测各镜像链接是否可访问，并显示状态图标。
- 🔐 **无密钥**：本工具不需要任何 API Key，开箱即用。

## 🚀 快速开始

纯静态网站，无需构建。

```bash
python -m http.server 8080
# 或 npx serve .
```

浏览器打开 `http://localhost:8080`。

### 部署到 GitHub Pages

将本目录推送到 GitHub，仓库 **Settings → Pages** 选择主分支根目录即可。

## ⚙️ 设置（可选）

本工具不需要密钥。唯一可配置项是「链接探测代理 URL」（右上角 **设置**）：

- 用于检测镜像链接是否可访问，默认使用公开 CORS 服务 `https://api.allorigins.win/get?url=`；
- 你可以换成自己部署的代理，或清空以禁用探测（此时直接给出链接，不做检测）；
- 设置仅保存在浏览器 `localStorage`。

## 📁 目录结构

```
pastpaper-finder/
├── index.html
├── css/style.css
├── js/config.js            # 设置弹窗（探测代理）
├── js/pastpapers.js        # 链接拼装 + 分数线 + 可用性探测
├── data/thresholds.json    # 分数线数据
├── data/aqa-papers.json    # OxfordAQA 资源 manifest
├── README.md
├── LICENSE
└── .gitignore
```

## 🧩 技术栈

原生 HTML / CSS / JavaScript，无框架；图标来自 Font Awesome。

## 🧪 测试与架构（CLI = GUI）

所有与界面无关的纯逻辑都抽到了同构模块 **`js/core.js`**（`PPCore`）——浏览器和 Node 共用同一份实现。因此 **命令行测试覆盖的就是 GUI 实际运行的逻辑**，两者结果一致，无需打开浏览器即可验证正确性。

```bash
node --test        # 或 npm test
```

覆盖：CAIE/AQA 链接拼装、`-CR` 去版权变体排序、分数线 `A*=A+(A-B)` 预测与封顶等。

```
js/core.js          # 纯逻辑（链接拼装 / 分数线），浏览器与 Node 共用
js/pastpapers.js    # DOM 绑定，调用 PPCore
tests/core.test.js  # Node 内置 node:test，无需安装依赖
```

## ⚠️ 免责声明

本工具**仅生成指向第三方公开镜像的链接**，不存储、不分发任何试卷文件。所有考试资源版权归 Cambridge / AQA / OxfordAQA 等考试局所有。分数线数据仅供参考，请以官方公布为准。

## 📄 License

[MIT](./LICENSE)
