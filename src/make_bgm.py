import numpy as np, subprocess
sr=44100; D=96.0; TAIL=7.0
n=int((D+TAIL)*sr); rng=np.random.default_rng(16)
t=np.arange(n)/sr
L=np.zeros(n); R=np.zeros(n)
def hz(m): return 440*2**((m-69)/12)
def env(dur,a,r):
    k=int(dur*sr); e=np.ones(k); ka=int(a*sr); kr=int(r*sr)
    e[:ka]=np.linspace(0,1,ka)**1.5; e[-kr:]=np.minimum(e[-kr:],np.linspace(1,0,kr)**1.5); return e
def add(sig,start,pan):
    i=int(start*sr); j=min(n,i+len(sig)); s=sig[:j-i]
    L[i:j]+=s*np.cos((pan+1)*np.pi/4); R[i:j]+=s*np.sin((pan+1)*np.pi/4)
# pad chords: Dmaj9, Bm9, Gmaj7#11, A6/9  x2  (12s each)
chords=[[50,57,61,64,69],[47,54,62,66,69],[43,55,62,66,69,73],[45,57,61,64,71]]
for ci in range(8):
    ch=chords[ci%4]; st=ci*12; dur=12+5
    for m in ch:
        for det,pan in ((-0.07,-.7),(0.0,0),(0.08,.7)):
            f=hz(m)*2**(det/12*0.5)
            k=int(dur*sr); tt=np.arange(k)/sr
            s=np.sin(2*np.pi*f*tt)+.35*np.sin(2*np.pi*2*f*tt+.5)+.12*np.sin(2*np.pi*3*f*tt)
            s*=env(dur,5,6)*(0.028 if m>=50 else .05)*(1+.15*np.sin(2*np.pi*.11*tt+rng.random()*6))
            add(s,st,pan)
# bells (compass pings): D major pentatonic, sparse
pent=[74,76,78,81,83,86,88]
tc=3.0
while tc<D-3:
    m=int(rng.choice(pent)); dur=5.0; k=int(dur*sr); tt=np.arange(k)/sr; f=hz(m)
    s=(np.sin(2*np.pi*f*tt)+.3*np.sin(2*np.pi*2.76*f*tt)*np.exp(-tt*3))*np.exp(-tt*1.1)*0.05*np.minimum(1,tt/0.02)
    pan=rng.uniform(-.8,.8); add(s,tc,pan)
    # echo
    add(s*.35,tc+.52,-pan)
    tc+=rng.uniform(4.0,10.5)
# sea noise: filtered noise with slow swell
w=rng.standard_normal(n)
spec=np.fft.rfft(w); fr=np.fft.rfftfreq(n,1/sr); spec*=1/np.maximum(fr,30)**.9*(fr<1800); w2=np.fft.irfft(spec,n)
w2/=np.abs(w2).max()
sw=.5+.5*np.sin(2*np.pi*t/16-1.2)
for ch,ph in ((L,0),(R,1.4)):
    ch+=w2*(0.06+0.07*(.5+.5*np.sin(2*np.pi*t/13+ph)))*sw
# low drone
dr=np.sin(2*np.pi*hz(38)*t)*0.05*(.6+.4*np.sin(2*np.pi*t/24)); L+=dr; R+=dr
# reverb (synthetic IR)
irn=int(3.2*sr); ir=rng.standard_normal((2,irn))*np.exp(-np.arange(irn)/sr*1.9)
# lowpass IR
for c in range(2):
    sp=np.fft.rfft(ir[c]); f2=np.fft.rfftfreq(irn,1/sr); sp*=1/(1+(f2/3500)**2); ir[c]=np.fft.irfft(sp,irn)
ir/=np.sqrt((ir**2).sum(1,keepdims=True))
def conv(x,h):
    m=len(x)+len(h)-1; N=1<<(m-1).bit_length()
    return np.fft.irfft(np.fft.rfft(x,N)*np.fft.rfft(h,N),N)[:m]
wl=conv(L,ir[0])[:n+irn-1]; wr=conv(R,ir[1])[:n+irn-1]
Lw=np.zeros(n+irn-1);Rw=np.zeros(n+irn-1);Lw[:n]+=L*.45;Rw[:n]+=R*.45
Lw+=wl*.8;Rw+=wr*.8
# fold tail beyond D into start => seamless loop
N=int(D*sr)
oL=Lw[:N].copy();oR=Rw[:N].copy()
rest=len(Lw)-N
oL[:rest]+=Lw[N:];oR[:rest]+=Rw[N:]
# gentle fade at very edges to avoid click
x=np.stack([oL,oR],1); pk=np.abs(x).max(); x=x/pk*0.7
pcm=(x*32767).astype('<i2')
open('/tmp/bgm.raw','wb').write(pcm.tobytes())
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','s16le','-ar',str(sr),'-ac','2','-i','/tmp/bgm.raw','-b:a','112k','assets/audio/bgm.mp3'],check=True)
import os;os.remove('/tmp/bgm.raw');print(os.path.getsize('assets/audio/bgm.mp3')/1e6)
