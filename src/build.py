"""生成 index.html 与 assets/。需要官方站素材目录 OFF(见 README)。
用法: python3 src/build.py <OFF 目录>   (OFF/img 内含 stpEE_NN.jpg 与 chara_face_*.png)"""
import json, sys, os, base64, io
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
OFF=(sys.argv[1] if len(sys.argv)>1 else '/data/sb/off').rstrip('/')+'/img/'
sys.path.insert(0,HERE)
from data import EPS,CAST
def lum(c):
    def f(v):
        v/=255;return v/12.92 if v<=.03928 else ((v+.055)/1.055)**2.4
    return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])
def cr(a,b):
    la,lb=lum(a),lum(b);hi,lo=max(la,lb),min(la,lb);return (hi+.05)/(lo+.05)
def hexc(c):return '#%02x%02x%02x'%tuple(int(x) for x in c)
for e in EPS:
    main=Image.open(f'{OFF}stp{e["imgs"][0]}.jpg').convert('RGB').resize((120,68))
    cc=sorted(main.quantize(6,method=Image.MEDIANCUT).convert('RGB').getcolors(),reverse=True)
    bg=None
    for n,c in cc:
        if sum(c)<720: bg=c;break
    bg=list(bg);W=(255,255,255);K=(18,20,22)
    if cr(bg,W)<4.6 and cr(bg,K)<4.6:
        while cr(bg,W)<4.6: bg=[v*.94 for v in bg]
    fg=W if cr(bg,W)>=cr(bg,K) else K
    pal=[]
    for k in e['imgs'][:4]:
        im=Image.open(f'{OFF}stp{k}.jpg').convert('RGB').resize((100,56)).quantize(5,method=Image.MEDIANCUT).convert('RGB')
        for n,c in sorted(im.getcolors(),reverse=True)[:3]:
            if all(sum(abs(a-b) for a,b in zip(c,p))>90 for p in pal): pal.append(c)
    e['pal']=[hexc(c) for c in pal[:6]];e['bg']=hexc(bg);e['fg']=hexc(fg)
# --- assets ---
os.makedirs(ROOT+'/assets/stills',exist_ok=True);os.makedirs(ROOT+'/assets/faces',exist_ok=True)
keys=[]
for f in sorted(os.listdir(OFF)):
    if f.startswith('stp') and f.endswith('.jpg'):
        k=f[3:-4];keys.append(k)
        o=f'{ROOT}/assets/stills/{k}.webp'
        if not os.path.exists(o): Image.open(OFF+f).convert('RGB').save(o,quality=60,method=6)
for f in sorted(os.listdir(OFF)):
    if f.startswith('chara_face_'):
        o=f'{ROOT}/assets/faces/{f[11:-4]}.webp'
        if os.path.exists(o): continue
        im=Image.open(OFF+f).convert('RGBA');im.thumbnail((520,520),Image.LANCZOS)
        im.save(o,quality=75,method=6)
# prologue samples must be inline (file:// canvases cannot read external images)
PRO={}
for k in ('01_01','01_07'):
    b=io.BytesIO();im=Image.open(f'{OFF}stp{k}.jpg').convert('RGB');im.thumbnail((800,800));im.save(b,'WEBP',quality=60)
    PRO[k]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
t=open(HERE+'/template.html',encoding='utf-8').read()
J=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'))
t=t.replace('/*KEYS*/[]',J(keys)).replace('/*PRO*/{}',J(PRO)).replace('/*EPS*/[]',J(EPS)).replace('/*CAST*/[]',J([list(c) for c in CAST]))
open(ROOT+'/index.html','w',encoding='utf-8').write(t)
print('ok',len(keys),'stills')
