# 申兆文 — AI 视频创作者 作品集

## 使用说明

### 1. 上传视频到 B站

把你的 AI 视频上传到 [bilibili.com](https://bilibili.com)，上传后每个视频会有一个 **BV 号**（例如 `BV1GJ411x7z`）。

### 2. 替换 BV 号

打开 `index.html`，搜索下面这段：

```js
{ bv: '', title: '梦境回廊', colors: ['#1a0533','#4a1a7a'] },
```

在 `bv: ''` 的引号里填入对应的 B站 BV 号。16 个视频全填完。

### 3. 修改标题

如果想改视频标题，把 `title: '梦境回廊'` 里的文字改成你想要的。

### 4. 本地预览

直接用浏览器打开 `index.html` 即可查看。

---

## 发布到 GitHub Pages（免费上线）

你需要有一个 GitHub 账号（没有的话去 [github.com](https://github.com) 注册一个）。

### 方法一：在 GitHub 网页上直接上传

1. 打开 [github.com](https://github.com)，登录后点右上角 `+` → `New repository`
2. 仓库名填 `你的用户名.github.io`（例如 `shenzhaowen.github.io`），选 Public，点 Create
3. 进入仓库后，点 **uploading an existing file**
4. 把本文件夹的 `index.html` 拖进去，点 Commit changes
5. 点仓库顶部的 Settings → 左侧 Pages
6. Source 选 `Deploy from a branch`，Branch 选 `main`，文件夹选 `/ (root)`，点 Save
7. 等 2 分钟，访问 `https://你的用户名.github.io` 即可

### 方法二：用桌面版 GitHub（推荐）

1. 下载 [GitHub Desktop](https://desktop.github.com/)
2. 登录后，File → New repository，取名 `你的用户名.github.io`
3. 把本文件夹复制到 GitHub Desktop 指定的目录下
4. GitHub Desktop 里会显示变更 → 填写 Summary（比如"首次发布"）→ 点 Commit to main
5. 点 Publish repository → 选 Public → Publish
6. 去仓库 Settings → Pages → 选 main 分支 → Save
7. 等 2 分钟即可访问

---

## 自定义域名（可选）

如果想用自己买的域名（如 `shenzhaowen.com`），在仓库 Settings → Pages 里填域名，并在域名服务商处添加 CNAME 记录指向 `你的用户名.github.io`。
