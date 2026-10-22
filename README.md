# SONNY BOY — 漂流之后

动画《Sonny Boy》的非官方个人数字展览页(设计演示)。

## 直接运行

```bash
git lfs install          # 首次需要,图片与音频由 Git LFS 管理
git clone git@github.com:xihale/sonny-boy.git
cd sonny-boy
# 双击 index.html 即可;或:
python3 -m http.server 8000   # 然后访问 http://localhost:8000
```

不需要构建,不依赖外部网络。右上角“声音”按钮控制背景音乐(首次点击页面任意位置会自动淡入,可随时关闭)。

## 结构

- `index.html` 页面壳(仅 ~4KB,引 `assets/` 下的样式与脚本;序章两张取样图仍以 data-URI 内嵌在数据里,保证双击打开也能运行)
- `assets/stills/` 144 张官方剧照(webp,1000px,文件名含内容哈希,改动即换 URL,浏览器可长缓存)
- `assets/faces/` 25 张官方角色立绘(webp,透明底,同样带内容哈希)
- `assets/audio/bgm.mp3` 背景音乐(原创氛围音,96 秒无缝循环,`src/make_bgm.py` 合成)
- `src/` `data.py` 内容、`template.html` 模板、`style.css` 样式、`main.js` 渲染逻辑、`build.py` 生成脚本(需官方站素材,见脚本说明;构建时 CSS/数据/逻辑写入 assets/ 并按内容哈希命名)

换背景音乐:替换 `assets/audio/bgm.mp3` 即可。

## 声明

非官方同人致敬作品,仅作设计演示。画面与角色 © Sonny Boy committee;文字为据官方网站与 Wikipedia 整理的中文概述。
