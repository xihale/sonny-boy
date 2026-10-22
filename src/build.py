import json,sys
sys.path.insert(0,'.')
from data import EPS,CAST
from PIL import Image
def lum(c):
    def f(v):
        v/=255;return v/12.92 if v<=.03928 else ((v+.055)/1.055)**2.4
    return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])
def cr(a,b):
    la,lb=lum(a),lum(b);hi,lo=max(la,lb),min(la,lb);return (hi+.05)/(lo+.05)
def hexc(c):return '#%02x%02x%02x'%tuple(int(x) for x in c)
OFF='/data/sb/off/img/'
for e in EPS:
    main=Image.open(f'{OFF}stp{e["imgs"][0]}.jpg').convert('RGB').resize((120,68))
    q=main.quantize(6,method=Image.MEDIANCUT).convert('RGB')
    cc=sorted(q.getcolors(),reverse=True)
    # pick largest cluster that is not near-white
    bg=None
    for n,c in cc:
        if sum(c)<720: bg=c;break
    bg=list(bg)
    # ensure legible: darken until white contrast>=4.6 unless black works
    W=(255,255,255);K=(18,20,22)
    if cr(bg,W)<4.6 and cr(bg,K)<4.6:
        while cr(bg,W)<4.6: bg=[v*.94 for v in bg]
    fg=W if cr(bg,W)>=cr(bg,K) else K
    # palette from three stills
    pal=[]
    for k in e['imgs'][:4]:
        im=Image.open(f'{OFF}stp{k}.jpg').convert('RGB').resize((100,56)).quantize(5,method=Image.MEDIANCUT).convert('RGB')
        for n,c in sorted(im.getcolors(),reverse=True)[:3]:
            if all(sum(abs(a-b) for a,b in zip(c,p))>90 for p in pal): pal.append(c)
    e['pal']=[hexc(c) for c in pal[:6]]
    e['bg']=hexc(bg);e['fg']=hexc(fg)
    print(e['n'],e['bg'],e['fg'],round(max(cr(bg,W),cr(bg,K)),1))
A=json.load(open(OFF+'../assets.json'))
t=open('template.html',encoding='utf-8').read()
rep=lambda s,k,v:s.replace(k,json.dumps(v,ensure_ascii=False,separators=(',',':')),1)
t=t.replace('/*IMGS*/{}',json.dumps(A['stills'],separators=(',',':')))
t=t.replace('/*FACES*/{}',json.dumps(A['faces'],separators=(',',':')))
t=t.replace('/*EPS*/[]',json.dumps(EPS,ensure_ascii=False,separators=(',',':')))
t=t.replace('/*CAST*/[]',json.dumps([list(c) for c in CAST],ensure_ascii=False,separators=(',',':')))
open('sonny-boy-final.html','w',encoding='utf-8').write(t)
import os;print(os.path.getsize('sonny-boy-final.html')/1e6,'MB')
