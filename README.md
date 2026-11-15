# SONNY BOY — 漂流之后

动画《Sonny Boy》的非官方同人展示页，线上地址：<https://sonny-boy.xeed.ink>。

## 运行

图片和音频通过 Git LFS 管理，直接打开静态页面就能跑，不需要额外构建：

```bash
git lfs install
git clone https://github.com/xihale/sonny-boy.git
cd sonny-boy
python3 -m http.server
```

也可以直接双击 `index.html` 打开。点击页面后会淡入背景环境音，右上角可以随时关掉。

## 目录

- `index.html`：页面入口（序章的取样图直接内嵌在数据里，本地打开不依赖外部网络）
- `assets/stills/`、`assets/faces/`：剧照与角色立绘（WebP，按内容哈希命名）
- `assets/audio/bgm.mp3`：背景环境音，由 `src/make_bgm.py` 合成，想换音乐直接替换它即可
- `src/`：源码与文案（`data.py`、`template.html`、`style.css`、`main.js`、`build.py`）

## 声明

非官方同人致敬作品，仅作设计与技术演示。画面与角色版权归 Sonny Boy committee 所有。
