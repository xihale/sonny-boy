const PRESETS=[
 [[[1,6,'16/9',0],[7,2,'3/4',9]],[[2,3,'1/1',0],[5,4,'16/9',5]],[[1,4,'16/9',0],[6,3,'3/4',7]]],
 [[[3,6,'16/9',0],[1,2,'3/4',8]],[[1,4,'16/9',2],[5,3,'1/1',0]],[[3,3,'3/4',0],[6,3,'16/9',8]]],
 [[[1,4,'3/4',0],[5,4,'16/9',6]],[[1,3,'1/1',2],[4,5,'16/9',0]],[[3,4,'16/9',0],[7,2,'3/4',7]]]
];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const src=k=>'assets/'+(KMAP['stills/'+k]||('stills/'+k+'.webp'));
const fsrc=k=>'assets/'+(KMAP['faces/'+k]||('faces/'+k+'.webp'));
const pad=n=>String(n).padStart(2,'0');
/* ---------- build episodes ---------- */
const eps=$('#eps');
const lazy=[];
function shot(k,ratio,extra){const d=document.createElement('div');d.className='sh';d.style.aspectRatio=ratio;if(extra)d.style.marginTop=extra+'vw';
 const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','放大剧照 '+k.replace('_',' - '));b.dataset.k=k;const im=document.createElement('img');im.alt='';im.decoding='async';im.dataset.k=k;lazy.push(im);b.appendChild(im);d.appendChild(b);return d}
EPS.forEach((e,i)=>{
 const s=document.createElement('section');s.className='ep'+(i%2?' flip':'');s.id='ep'+pad(e.n);s.dataset.ep=pad(e.n);s.dataset.bg=e.bg;s.dataset.fg=e.fg;s.setAttribute('aria-labelledby','t'+e.n);
 s.style.setProperty('--bg',e.bg);s.style.setProperty('--fg',e.fg);
 s.innerHTML='<div class="info"><div class="num" aria-hidden="true">'+pad(e.n)+'</div><h2 id="t'+e.n+'" lang="ja">'+e.jp+'</h2><p class="cn">'+e.cn+'</p><p class="en">'+e.en+'</p><p class="syn">'+e.syn+'</p><dl class="meta"><div><dt>首播</dt><dd>'+e.date+'</dd></div><div><dt>OST</dt><dd>'+e.ost+'</dd></div><div><dt>制作</dt><dd>'+e.staff+'</dd></div></dl><div class="sw" aria-hidden="true">'+e.pal.map(c=>'<i style="background:'+c+'"></i>').join('')+'</div></div><div class="shots"></div>';
 const wrap=s.querySelector('.shots');let n=0;
 PRESETS[i%3].forEach(row=>{const r=document.createElement('div');r.className='row';row.forEach(c=>{const d=shot(e.imgs[n],c[2],c[3]);d.dataset.i=n;n++;d.style.gridColumn=c[0]+' / span '+c[1];r.appendChild(d)});wrap.appendChild(r)});
 eps.appendChild(s)});
/* mobile row layout: handled with CSS grid spans as-is */
/* cast */
function card(c){const a=document.createElement('article');a.className='card';a.innerHTML='<div class="face"><img alt="" src="'+fsrc(c[0])+'"></div><h3 lang="ja">'+c[1]+'</h3>'+(c[2]?'<div class="cv">CV '+c[2]+'</div>':'')+(c[3]?'<span class="pw" lang="ja">'+c[3]+'</span>':'')+'<p>'+c[4]+'</p>';return a}
CAST.forEach((c,i)=>(i<11?$('#g1'):$('#g2')).appendChild(card(c)));
/* band */
['12_03','08_01','09_09','02_02'].forEach(k=>$('#band').appendChild(shot(k,'16/9')));
/* wall */
const all=KEYS;const mos=$('#mos');
all.forEach(k=>{const b=document.createElement('button');b.type='button';b.dataset.k=k;b.dataset.ep=k.slice(0,2);b.setAttribute('aria-label','剧照 '+k.replace('_',' - '));const im=document.createElement('img');im.alt='';im.decoding='async';im.dataset.k=k;lazy.push(im);b.appendChild(im);mos.appendChild(b)});
const chips=$('#chips');
['全部'].concat(EPS.map(e=>pad(e.n))).forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.setAttribute('aria-pressed',i===0?'true':'false');b.addEventListener('click',()=>{$$('#chips button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');let c=0;$$('#mos button').forEach(m=>{const ok=i===0||m.dataset.ep===t;m.hidden=!ok;if(ok)c++});$('#wcount').textContent=c+' frames'});chips.appendChild(b)});
/* index */
EPS.forEach(e=>{const li=document.createElement('li');li.innerHTML='<a href="#ep'+pad(e.n)+'"><b>'+pad(e.n)+'</b><span lang="ja">'+e.jp+'</span></a>';$('#idxl').appendChild(li)});
/* lazy images */
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){const im=en.target;if(!im.src)im.src=src(im.dataset.k);io.unobserve(im)}}),{rootMargin:'900px 0px'});
lazy.forEach(im=>io.observe(im));
const rv=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');rv.unobserve(en.target)}}),{threshold:.12});
$$('.sh').forEach(d=>{if(RM)d.classList.add('in');else rv.observe(d)});
/* dialogs */
const idx=$('#idx'),lb=$('#lb');let lbList=[],lbPos=0,lastFocus=null;
const openD=(d)=>{lastFocus=document.activeElement;d.showModal()};
$('#idxbtn').addEventListener('click',()=>openD(idx));$('#idxx').addEventListener('click',()=>idx.close());
idx.addEventListener('click',e=>{if(e.target.closest('a'))idx.close()});
function showLb(){const k=lbList[lbPos];$('#lbi').src=src(k);$('#lbt').textContent='EP '+k.slice(0,2)+(lbList.length>1?' · '+(lbPos+1)+' / '+lbList.length:'');$('#lbp').hidden=$('#lbnx').hidden=lbList.length<2}
function openLb(k,list){lbList=list;lbPos=list.indexOf(k);showLb();openD(lb)}
document.addEventListener('click',e=>{const b=e.target.closest('.sh button,.mos button');if(!b)return;const k=b.dataset.k;const ctx=b.closest('.mos')?$$('#mos button:not([hidden])').map(x=>x.dataset.k):[k];openLb(k,ctx)});
$('#lbx').addEventListener('click',()=>lb.close());
const step=d=>{if(lbList.length>1){lbPos=(lbPos+d+lbList.length)%lbList.length;showLb()}};
$('#lbp').addEventListener('click',()=>step(-1));$('#lbnx').addEventListener('click',()=>step(1));
lb.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1)});
lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lb'))lb.close()});
[idx,lb].forEach(d=>d.addEventListener('close',()=>{if(lastFocus)lastFocus.focus()}));
/* ---------- ui state ---------- */
const bar=$('#bar'),epi=$('#epi'),ib=$('#idxbtn');
const secs=[{el:$('#pro'),bg:'#000',fg:'#fff',ep:''},...$$('.ep').map(el=>({el,bg:el.dataset.bg,fg:el.dataset.fg,ep:el.dataset.ep})),{el:$('#cast'),bg:'#e9e7e1',fg:'#15171a',ep:''},{el:$('#make'),bg:'#0b0c0e',fg:'#f2f1ed',ep:''},{el:$('#wall'),bg:'#141517',fg:'#f2f1ed',ep:''},{el:$('#end'),bg:'#d9dcde',fg:'#15171a',ep:''}];
let cur=null;
function ui(){
 const h=document.documentElement,max=h.scrollHeight-innerHeight;bar.style.transform='scaleX('+(max>0?scrollY/max:0)+')';
 const mid=scrollY+innerHeight*.18;let c=secs[0];for(const s of secs){if(s.el.offsetTop<=mid)c=s}
 if(c!==cur){cur=c;const r=document.documentElement.style;r.setProperty('--ubg',c.bg);r.setProperty('--ufg',c.fg);if(c.ep){epi.textContent='EP '+c.ep+' / 12';epi.classList.add('on')}else epi.classList.remove('on')}
}
addEventListener('scroll',ui,{passive:true});addEventListener('resize',ui);ui();
/* ---------- background music ---------- */
(function(){
const au=new Audio('assets/audio/bgm.mp3');au.loop=true;au.preload='auto';au.volume=0;
const snd=$('#snd');let playing=false,touched=false,fade;
const label=()=>{snd.textContent=playing?'声音 开':'声音 关';snd.setAttribute('aria-pressed',playing)};
function fadeTo(v,ms,done){clearInterval(fade);const s=au.volume,t0=performance.now();fade=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/ms);au.volume=Math.max(0,Math.min(1,s+(v-s)*k));if(k>=1){clearInterval(fade);if(done)done()}},50)}
function on(){const p=au.play();if(p&&p.then)p.then(()=>{playing=true;label();fadeTo(.45,3000)}).catch(()=>{})}
function off(){playing=false;label();fadeTo(0,700,()=>au.pause())}
snd.addEventListener('click',()=>{touched=true;playing?off():on()});
function first(e){if(e.target.closest&&e.target.closest('#snd'))return;['pointerdown','keydown'].forEach(v=>removeEventListener(v,first,true));if(!touched)on()}
['pointerdown','keydown'].forEach(v=>addEventListener(v,first,true));
document.addEventListener('visibilitychange',()=>{if(!playing)return;if(document.hidden)au.pause();else au.play().catch(()=>{})});
})();
/* ---------- prologue particle engine ---------- */
(function(){
const NS=4,N=16600,NL=36,T=N+NL*2;
const cv=$('#cv');
let gl=cv.getContext('webgl',{antialias:false,alpha:false});let ctx2=null;if(!gl)ctx2=cv.getContext('2d');
let vw=innerWidth,vh=innerHeight,dpr=Math.min(devicePixelRatio||1,2);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const mobile=()=>vw<=820;
let sd=36;const rnd=()=>{sd=(sd*1664525+1013904223)%4294967296;return sd/4294967296};
const gauss=()=>Math.sqrt(-2*Math.log(rnd()+1e-9))*Math.cos(6.2831853*rnd());
const dl=new Float32Array(N),sw=new Float32Array(N),ph=new Float32Array(N),sp=new Float32Array(N),dX=new Float32Array(N),dY=new Float32Array(N);
for(let i=0;i<N;i++){dl[i]=rnd()*.42;sw[i]=(rnd()-.5)*.9;ph[i]=rnd()*6.28;sp[i]=.15+rnd()*.5;dX[i]=rnd();dY[i]=rnd()}
const lights=[];for(let i=0;i<NL;i++)lights.push({x:rnd(),y:rnd(),vx:(rnd()-.5)*.011,vy:(rnd()-.5)*.011,s:3+rnd()*2.2,a:.55+rnd()*.45});
const ox=new Float32Array(N),oy=new Float32Array(N),vx=new Float32Array(N),vy=new Float32Array(N);
const bgs=[[0,0,0],[0,0,0],[.012,.024,.05],[.02,.07,.16]];
const lightA=[1,1,1,0],dustA=[.2,.12,.1,0],AMP=[16,2.4,2.4,2.4];
const shuffle=()=>{const o=new Uint32Array(N);for(let i=0;i<N;i++)o[i]=i;for(let i=N-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=o[i];o[i]=o[j];o[j]=t}return o};
const light=()=>mobile()?[.66*vw,.22*vh]:[.74*vw,.26*vh];
let scenes=[],dyn=null,ready=false;
const off=document.createElement('canvas'),oc=off.getContext('2d',{willReadFrequently:true});
function newScene(si){const s={m:new Float32Array(N),x:new Float32Array(T),y:new Float32Array(T),s:new Float32Array(T),r:new Float32Array(T),g:new Float32Array(T),b:new Float32Array(T),a:new Float32Array(T),bg:bgs[si]};
 for(let i=0;i<N;i++){s.x[i]=dX[i]*vw;s.y[i]=dY[i]*vh;s.s[i]=1.5;s.r[i]=.78;s.g[i]=.85;s.b[i]=1;s.a[i]=dustA[si];s.m[i]=AMP[si]}
 for(let l=0;l<NL*2;l++){const i=N+l;s.s[i]=l<NL?lights[l].s:lights[l-NL].s*4;s.r[i]=s.g[i]=s.b[i]=1;s.a[i]=(l<NL?lights[l].a:.1)*lightA[si]}
 return s}
function place(sc,order,list){const n=Math.min(list.length,N);for(let j=0;j<n;j++){const i=order[j],q=list[j];sc.x[i]=q[0];sc.y[i]=q[1];sc.s[i]=q[2];sc.r[i]=q[3];sc.g[i]=q[4];sc.b[i]=q[5];sc.a[i]=q[6];sc.m[i]=RM?0:.7}}
function sampleImage(img,dx,dy,dw,dh,cell,skipDark,sizeF,crop){
 const cols=Math.round(dw/cell),rows=Math.round(dh/cell);off.width=cols;off.height=rows;
 if(crop)oc.drawImage(img,crop[0],crop[1],crop[2],crop[3],0,0,cols,rows);else oc.drawImage(img,0,0,cols,rows);
 const d=oc.getImageData(0,0,cols,rows).data,cw=dw/cols,ch=dh/rows,out=[];
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const k=(r*cols+c)*4,R=d[k],G=d[k+1],B=d[k+2];
  if(skipDark&&R+G+B<26)continue;out.push([dx+(c+.5)*cw,dy+(r+.5)*ch,cw*sizeF,R/255,G/255,B/255,1])}
 return out}
function sampleDraw(w,h,drawFn,step,size,col,ox_,oy_,alpha){step=Math.max(1,Math.round(step));off.width=w;off.height=h;oc.clearRect(0,0,w,h);oc.fillStyle='#fff';drawFn(oc);
 const d=oc.getImageData(0,0,w,h).data,out=[];
 for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){if(d[(y*w+x)*4+3]>110)out.push([ox_+x+(rnd()-.5)*step*.5,oy_+y+(rnd()-.5)*step*.5,size,col[0],col[1],col[2],alpha])}
 return out}
function build(imgs){
 const M=mobile(),vm=Math.min(vw,vh);scenes=[];dyn=null;sd=7;
 const orders=[];for(let s=0;s<NS;s++)orders.push(shuffle());
 for(let s=0;s<NS;s++)scenes.push(newScene(s));
 {const fs=M?vw*.3:Math.min(vw*.13,230),x=vw*(M?.08:.06),y=vh*(M?.4:.52);
  const w=Math.ceil(vw),h=Math.ceil(fs*(M?2.5:1.5)),sz=Math.max(2,Math.round(fs/60)),dt=Math.max(1.7,fs/70);
  const q=sampleDraw(w,h,c=>{c.font='400 '+fs+'px Georgia,"Times New Roman",serif';c.textBaseline='alphabetic';if(M){c.fillText('Sonny',x,fs);c.fillText('Boy',x,fs*2.1)}else c.fillText('Sonny Boy',x,fs*1.1)},sz,dt,[1,1,1],0,y-(M?fs:fs*1.1),.95);
  place(scenes[0],orders[0],q)}
 {const dw=M?vw*1.0:Math.min(vw*.78,1180),dh=dw*9/16,dx=M?-vw*.06:vw*.04,dy=(vh-dh)/2-(M?vh*.04:vh*.02),cell=Math.max(dw/132,6.2);
  place(scenes[1],orders[1],sampleImage(imgs.a,dx,dy,dw,dh,cell,true,.84))}
 {const cx=vw/2,cy=vh/2-(M?vh*.04:0),R=vm*(M?.34:.3),Ln=vm*(M?.44:.46),q=[],dd=[],[lx,ly]=light();
  const nR=Math.round(2*Math.PI*R/4);for(let k=0;k<nR;k++){const a=k/nR*6.2832;q.push([cx+Math.cos(a)*R,cy+Math.sin(a)*R,1.6,1,1,1,.5])}
  for(let k=0;k<4;k++)for(let m=0;m<10;m++){const a=k*1.5708,r0=R+8+m*2.4;q.push([cx+Math.cos(a)*r0,cy+Math.sin(a)*r0,1.6,1,1,1,.5])}
  const nn=Math.round(Ln/1.6);
  for(let k=0;k<nn;k++){const u=(k+.5)/nn;for(let m=0;m<3;m++){q.push([cx,cy,2.2,1,1,1,1]);dd.push({j:q.length-1,u,side:1,lat:(m-1)*3.2*(1-u)+(rnd()-.5)*.8})}}
  const ns=Math.round(Ln/2.4);
  for(let k=0;k<ns;k++){const u=(k+.5)/ns;for(let m=0;m<2;m++){q.push([cx,cy,2,1,1,1,.32]);dd.push({j:q.length-1,u,side:-1,lat:(m-.5)*3*(1-u)})}}
  const sig=vm*.055;for(let k=0;k<520;k++){const gx=gauss(),gy=gauss(),r=Math.hypot(gx,gy),core=Math.exp(-r*r*1.2);q.push([lx+gx*sig,ly+gy*sig,1.8+core*7,.78+.22*core,.88+.12*core,1,.35+.65*core])}
  place(scenes[2],orders[2],q);
  dyn={sc:scenes[2],idx:dd.map(o=>({i:orders[2][o.j],u:o.u,side:o.side,lat:o.lat})),cx,cy,Ln}}
 {const cell=Math.max(M?8:9.3,Math.sqrt(vw*vh/15200)),cols=Math.ceil(vw/cell),rows=Math.ceil(vh/cell),dw=cols*cell,dh=rows*cell;
  const iw=800,ih=450,sc=Math.max(dw/iw,dh/ih),sw_=dw/sc,sh_=dh/sc,fx=M?.7:.5;
  place(scenes[3],orders[3],sampleImage(imgs.b,0,0,dw,dh,cell,false,.88,[(iw-sw_)*fx,(ih-sh_)*.5,sw_,sh_]))}
 ready=true}
let px=-999,py=-999,lastMove=-1e9,ang=0;
addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;lastMove=performance.now()},{passive:true});
const norm=a=>{a%=360;if(a>180)a-=360;if(a<-180)a+=360;return a};
function compass(now){
 const [lx,ly]=light(),cx=dyn.cx,cy=dyn.cy,la=Math.atan2(lx-cx,-(ly-cy))*180/Math.PI;let tg=la;
 if(!RM&&now-lastMove<1500){const pa=Math.atan2(px-cx,-(py-cy))*180/Math.PI;tg=la+norm(pa-la)*.6*(1-(now-lastMove)/1500)}
 ang+=norm(tg-ang)*(RM?1:.07);const a=ang*Math.PI/180,sx=Math.sin(a),sy=-Math.cos(a),qx=-sy,qy=sx,sc=dyn.sc;
 for(const o of dyn.idx){const d=o.side*o.u*dyn.Ln;sc.x[o.i]=cx+sx*d+qx*o.lat;sc.y[o.i]=cy+sy*d+qy*o.lat}}
const buf=new Float32Array(T*7);let uRes,uDpr;
function glInit(){
 const vs='attribute vec2 p;attribute float s;attribute vec4 c;uniform vec2 R;uniform float D;varying vec4 v;void main(){gl_Position=vec4(p.x/R.x*2.-1.,1.-p.y/R.y*2.,0,1);gl_PointSize=s*D;v=c;}';
 const fs='precision mediump float;varying vec4 v;void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.40,.5,d);if(a<=0.)discard;gl_FragColor=vec4(v.rgb,v.a*a);}';
 const mk=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
 const prog=gl.createProgram();gl.attachShader(prog,mk(gl.VERTEX_SHADER,vs));gl.attachShader(prog,mk(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);gl.useProgram(prog);
 const bo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bo);gl.bufferData(gl.ARRAY_BUFFER,buf.byteLength,gl.DYNAMIC_DRAW);
 const st=28,at=(n,sz,o_)=>{const l=gl.getAttribLocation(prog,n);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,sz,gl.FLOAT,false,st,o_)};
 at('p',2,0);at('s',1,8);at('c',4,12);uRes=gl.getUniformLocation(prog,'R');uDpr=gl.getUniformLocation(prog,'D');
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)}
function resize(){vw=innerWidth;vh=innerHeight;dpr=Math.min(devicePixelRatio||1,2);cv.width=Math.round(vw*dpr);cv.height=Math.round(vh*dpr);if(gl)gl.viewport(0,0,cv.width,cv.height)}
const caps=$$('.pc'),shade=$('#shade'),pro=$('#pro');let t0=performance.now();
function frame(now){
 requestAnimationFrame(frame);if(!ready)return;
 const top=pro.offsetTop;if(scrollY>top+pro.offsetHeight+10)return;
 const t=(now-t0)/1000,p=clamp((scrollY-top)/Math.max(1,vh),0,NS-1),k=Math.min(Math.floor(p),NS-2),f=p-k,A=scenes[k],B=scenes[k+1];
 compass(now);
 const ef=ease(f),RMk=RM?0:1;
 const pOn=now-lastMove<2500,R2=130*130;let n=0;
 for(let i=0;i<N;i++){
  const e=ease(clamp((f-dl[i])/.58)),ax=A.x[i],ay=A.y[i],bx=B.x[i],by=B.y[i],dx=bx-ax,dy=by-ay;
  let x=ax+dx*e,y=ay+dy*e;
  if(e>0&&e<1){const ln=Math.hypot(dx,dy)||1,s=Math.sin(3.1416*e)*sw[i]*Math.min(ln,420);x+=-dy/ln*s;y+=dx/ln*s}
  const q=t*sp[i]+ph[i],am=(A.m[i]+(B.m[i]-A.m[i])*e)*RMk;x+=Math.sin(q)*am;y+=Math.cos(q*1.3)*am;
  if(pOn){const ddx=x+ox[i]-px,ddy=y+oy[i]-py,d2=ddx*ddx+ddy*ddy;if(d2<R2&&d2>1){const d=Math.sqrt(d2),fo=(1-d/130)*1.6;vx[i]+=ddx/d*fo;vy[i]+=ddy/d*fo}}
  vx[i]=(vx[i]-ox[i]*.045)*.9;vy[i]=(vy[i]-oy[i]*.045)*.9;ox[i]+=vx[i];oy[i]+=vy[i];x+=ox[i];y+=oy[i];
  const a=A.a[i]+(B.a[i]-A.a[i])*e;if(a<.01)continue;
  const o=n*7;buf[o]=x;buf[o+1]=y;buf[o+2]=A.s[i]+(B.s[i]-A.s[i])*e;buf[o+3]=A.r[i]+(B.r[i]-A.r[i])*e;buf[o+4]=A.g[i]+(B.g[i]-A.g[i])*e;buf[o+5]=A.b[i]+(B.b[i]-A.b[i])*e;buf[o+6]=a;n++}
 const la=lightA[k]+(lightA[k+1]-lightA[k])*ef;
 if(la>.01)for(let l=0;l<NL;l++){const L=lights[l],lx=((L.x+L.vx*(RM?0:t))%1+1)%1*vw,ly=((L.y+L.vy*(RM?0:t))%1+1)%1*vh;
  for(let h=0;h<2;h++){const o=n*7;buf[o]=lx;buf[o+1]=ly;buf[o+2]=h?L.s:L.s*4;buf[o+3]=buf[o+4]=buf[o+5]=1;buf[o+6]=(h?L.a:.1)*la;n++}}
 const bg=[0,1,2].map(c=>A.bg[c]+(B.bg[c]-A.bg[c])*ef);
 if(gl){gl.clearColor(bg[0],bg[1],bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(uRes,vw,vh);gl.uniform1f(uDpr,dpr);gl.bufferSubData(gl.ARRAY_BUFFER,0,buf,0,n*7);gl.drawArrays(gl.POINTS,0,n)}
 else{ctx2.setTransform(dpr,0,0,dpr,0,0);ctx2.globalAlpha=1;ctx2.fillStyle='rgb('+bg.map(v=>Math.round(v*255)).join(',')+')';ctx2.fillRect(0,0,vw,vh);for(let j=0;j<n;j++){const o=j*7;ctx2.globalAlpha=buf[o+6];ctx2.fillStyle='rgb('+Math.round(buf[o+3]*255)+','+Math.round(buf[o+4]*255)+','+Math.round(buf[o+5]*255)+')';ctx2.beginPath();ctx2.arc(buf[o],buf[o+1],buf[o+2]/2,0,6.3);ctx2.fill()}}
 const idxS=Math.round(p);
 caps.forEach((c,i)=>{const on=i===idxS&&Math.abs(p-i)<.28&&scrollY<top+pro.offsetHeight-vh*.4;c.classList.toggle('on',on)});
 shade.style.opacity=clamp(1.2-Math.abs(p-3)*1.6);
}
const ld=src_=>new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.src=src_});
let imgs;resize();if(gl)glInit();
Promise.all([ld(PRO['01_01']),ld(PRO['01_07'])]).then(([a,b])=>{imgs={a,b};build(imgs);window.__ready=true;requestAnimationFrame(frame)});
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{resize();if(imgs)build(imgs)},150)});
})();