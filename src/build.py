"""生成 index.html 与 assets/。需要官方站素材目录 OFF(见 README)。
用法: python3 src/build.py <OFF 目录>   (OFF/img 内含 stpEE_NN.jpg 与 chara_face_*.png)"""
import json, sys, os, re, base64, io, hashlib
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
# --- assets: content-hashed filenames -> immutable browser caching;
# index.html (no-cache) always carries the current mapping via KMAP ---
KMAP={}
os.makedirs(ROOT+'/assets/stills',exist_ok=True);os.makedirs(ROOT+'/assets/faces',exist_ok=True)
keys=[]
def put(dirn,logical,im,q):
    b=io.BytesIO();im.save(b,'WEBP',quality=q,method=6)
    name=f'{logical}_{hashlib.sha256(b.getvalue()).hexdigest()[:8]}.webp'
    open(f'{ROOT}/assets/{dirn}/{name}','wb').write(b.getvalue())
    KMAP[f'{dirn}/{logical}']=f'{dirn}/{name}'
for f in sorted(os.listdir(OFF)):
    if f.startswith('stp') and f.endswith('.jpg'):
        k=f[3:-4];keys.append(k)
        put('stills',k,Image.open(OFF+f).convert('RGB'),60)
for f in sorted(os.listdir(OFF)):
    if f.startswith('chara_face_'):
        im=Image.open(OFF+f).convert('RGBA');im.thumbnail((520,520),Image.LANCZOS)
        put('faces',f[11:-4],im,75)
for d in ('stills','faces'):
    keep={v.split('/',1)[1] for k,v in KMAP.items() if v.startswith(d+'/')}
    for f in os.listdir(f'{ROOT}/assets/{d}'):
        if f not in keep: os.remove(f'{ROOT}/assets/{d}/{f}')
# prologue samples must be inline (file:// canvases cannot read external images)
PRO={}
for k in ('01_01','01_07'):
    b=io.BytesIO();im=Image.open(f'{OFF}stp{k}.jpg').convert('RGB');im.thumbnail((800,800));im.save(b,'WEBP',quality=60)
    PRO[k]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
J=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'))
data_js=('const KEYS='+J(keys)+';\nconst PRO='+J(PRO)+';\nconst KMAP='+J(KMAP)+';\n'
         'const EPS='+J(EPS)+';\nconst CAST='+J([list(c) for c in CAST])+';\n')
def emit(logical,content,ext):
    b=content.encode()
    name=f'{logical}_{hashlib.sha256(b).hexdigest()[:8]}.{ext}'
    open(f'{ROOT}/assets/{name}','wb').write(b)
    return f'assets/{name}'
refs=[emit('app',open(HERE+'/style.css',encoding='utf-8').read(),'css'),
      emit('data',data_js,'js'),
      emit('app',open(HERE+'/main.js',encoding='utf-8').read(),'js')]
for f in os.listdir(ROOT+'/assets'):
    if re.fullmatch(r'(app|data)_[0-9a-f]{8}\.(css|js)',f) and 'assets/'+f not in refs:
        os.remove(f'{ROOT}/assets/{f}')
t=open(HERE+'/template.html',encoding='utf-8').read()
t=t.replace('/*CSS*/',refs[0]).replace('/*DATA*/',refs[1]).replace('/*APP*/',refs[2])
open(ROOT+'/index.html','w',encoding='utf-8').write(t)
print('ok',len(keys),'stills')
