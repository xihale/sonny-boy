# SONNY BOY — 漂流之后

动画《Sonny Boy》的非官方数字展览页（设计演示）。

以粒子序章、逐话剧照取色展厅、19 组角色展签、144 帧剧照墙与合成环境音，还原“少作说明、多留白”的观看体验。

## 直接运行

```bash
git lfs install          # 首次需要，图片与音频由 Git LFS 管理
git clone https://github.com/xihale/sonny-boy.git
cd sonny-boy
# 双击 index.html 即可；或：
python3 -m http.server 8000   # 访问 http://localhost:8000
```

无需构建，不依赖外部网络。点击页面后环境音会自动淡入，可通过右上角“声音”按钮随时开关。

## 结构

- `index.html`：页面壳（约 5KB，序章采样图以 data-URI 内嵌，支持本地直接打开）
- `assets/stills/`：144 张剧照（WebP，内容哈希命名）
- `assets/faces/`：25 张角色立绘（WebP，透明底，内容哈希命名）
- `assets/audio/bgm.mp3`：环境音（96 秒无缝循环，由 `src/make_bgm.py` 合成）
- `src/`：`data.py`（分集与角色文案）、`template.html`、`style.css`、`main.js`、`build.py`（构建脚本）

替换背景音乐只需覆盖 `assets/audio/bgm.mp3`。

## 声明

非营利同人数字展览，仅作设计与研究演示。画面与角色版权归 © Sonny Boy committee 所有。
