# 申兆文 — AI 视频创作者 作品集

## 使用说明

### 1. 放入视频文件

把视频文件（MP4 格式）放到 `videos/` 文件夹，命名为 `01.mp4` ~ `16.mp4`。

```
videos/
  ├── 01.mp4   ← 对应「猫砂盆」
  ├── 02.mp4   ← 对应「数字幻境」
  ├── 03.mp4   ← 对应「机械纪元」
  ...以此类推
  └── 16.mp4   ← 对应「最后帧」
```

### 2. 修改标题（可选）

打开 `index.html`，找到下面这段，改 `title` 里的文字：

```js
{ file: 'videos/01.mp4', title: '猫砂盆', colors: [...] },
```

### 3. 本地预览

直接用浏览器打开 `index.html` 即可查看。

---

## 发布到 GitHub Pages（免费上线）

### 方法一：GitHub Desktop（推荐）

1. 下载 [GitHub Desktop](https://desktop.github.com/)
2. 登录后 File → Clone repository → 选 `SHEN778io.github.io`
3. 把本文件夹内容复制到克隆下来的目录
4. GitHub Desktop 会显示变更 → 填写 Summary → Commit to main
5. 点 Push origin
6. 等 1-2 分钟，访问 `https://shen778io.github.io`

### 方法二：网页直接上传

1. 打开 `https://github.com/SHEN778io/SHEN778io.github.io`
2. 点 Add file → Upload files
3. 把 `index.html` 和整个 `videos/` 文件夹拖进去
4. Commit changes
5. 等 1-2 分钟即可
