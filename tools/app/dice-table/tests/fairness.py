"""Fairness test for the Dice Table page.

Rolls every die type many times through the page itself (button throws, drop-in-place, slow drags, flicks, fast flicks, taps,
re-rolling a single die) and reports, per die: a chi-square test against a fair die, how often a die repeats its previous result
compared with chance, and how often two dice thrown together match.  A healthy run has chi-square p-values that are mostly above
0.05 and repeat rates close to "fair" (small samples wobble, so use 150+ trials; the d100 needs about 1,000 rolls to say much).
Needs: pip install playwright scipy numpy && playwright install chromium

Usage:  python tests/fairness.py <mode> <trials>      modes: button drop tap slow flick quick single
"""
import sys,json,time,os,pathlib
from playwright.sync_api import sync_playwright
from scipy.stats import chisquare
import numpy as np

HARNESS = """
async ([mode,trials])=>{
  const D=DiceTable,cv=document.getElementById('cv'),R=cv.getBoundingClientRect();
  const ev=(t,x,y)=>cv.dispatchEvent(new PointerEvent(t,{clientX:R.left+x,clientY:R.top+y,button:0,pointerId:1,bubbles:true}));
  const out=[];
  const empty=()=>{let best=[30,30],bd=-1;for(let k=0;k<60;k++){const x=20+Math.random()*(R.width-40),y=20+Math.random()*(R.height-40);
      let m=1e9;for(const b of D.bodies){const p=D.project(b.p[0],b.p[1],b.p[2]);m=Math.min(m,Math.hypot(p[0]-x,p[1]-y))}if(m>bd){bd=m;best=[x,y]}}return best};
  const snap=()=>{const bs=D.bodies.slice().sort((a,b)=>a.id-b.id);return bs.map(b=>[b.kind,D.readDie(b).value])};
  for(let t=0;t<trials;t++){
    if(mode==='button'){D.throwAll();D.skipRoll()}
    else if(mode==='drop'){ // scoop everything and let go without moving
      ev('pointerdown',8,8);for(let i=0;i<70;i++)D.step(1/120);ev('pointerup',8,8);D.skipRoll()}
    else if(mode==='tap'){ // click and release at once
      ev('pointerdown',8,8);ev('pointerup',8,8);D.skipRoll()}
    else if(mode==='flick'){
      const [x0,y0]=empty();ev('pointerdown',x0,y0);for(let i=0;i<40;i++)D.step(1/120);
      const dx=(Math.random()<.5?-1:1)*(200+Math.random()*400),dy=-80+Math.random()*160,N=20+Math.floor(Math.random()*20);
      for(let i=0;i<N;i++){const e=(i+1)/N;ev('pointermove',x0+dx*e*e,y0+dy*e*e);for(let k=0;k<2;k++)D.step(1/120)}
      ev('pointerup',x0+dx,y0+dy);D.skipRoll()}
    else if(mode==='slow'){ // gentle drag, then let go
      const [x0,y0]=empty();ev('pointerdown',x0,y0);for(let i=0;i<40;i++)D.step(1/120);
      for(let i=0;i<30;i++){ev('pointermove',x0+i*4,y0);for(let k=0;k<3;k++)D.step(1/120)}
      for(let i=0;i<30;i++)D.step(1/120);ev('pointerup',x0+120,y0);D.skipRoll()}
    else if(mode==='quick'){ // very fast flick: let go before the in-hand shuffle has finished
      const [x0,y0]=empty();ev('pointerdown',x0,y0);for(let i=0;i<2;i++)D.step(1/120);
      const dx=(Math.random()<.5?-1:1)*(150+Math.random()*350),dy=-60+Math.random()*120,N=8;
      for(let i=0;i<N;i++){const e=(i+1)/N;ev('pointermove',x0+dx*e,y0+dy*e);D.step(1/120);D.step(1/120)}
      ev('pointerup',x0+dx,y0+dy);D.skipRoll()}
    else if(mode==='single'){ // pick up ONE die where it lies and drop it again, no mouse movement
      const bs=D.bodies;const b=bs[t%bs.length];const p=D.project(b.p[0],b.p[1],b.p[2]);
      ev('pointerdown',p[0],p[1]);for(let i=0;i<50;i++)D.step(1/120);ev('pointerup',p[0],p[1]);D.skipRoll()}
    out.push(snap());
  }
  return out;
}
"""
def run(mode,pool,trials,surface='felt',rails=True,extra=None):
    with sync_playwright() as p:
        b=p.chromium.launch()
        pg=b.new_context(viewport={'width':1280,'height':760}).new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(PAGE)
        cfg={'pool':pool,'surface':surface,'rails':rails}
        if extra:cfg.update(extra)
        pg.evaluate("c=>{localStorage.clear();localStorage.setItem('fand.dphys',JSON.stringify(c));localStorage.setItem('fand.dicesound','false')}",cfg)
        pg.reload();pg.wait_for_timeout(1500)
        pg.evaluate("()=>DiceTable.bodies.forEach(b=>{})")
        res=pg.evaluate(HARNESS,[mode,trials])
        b.close()
    return res,errs

PAGE=os.environ.get('DICE_PAGE') or pathlib.Path(__file__).resolve().parent.parent.joinpath('dice-table.html').as_uri()
SIDES={'dw':6,'dm':8,'df':6,'d100':100,'d2':2,'d4':4,'d6':6,'d8':8,'d10':10,'d12':12,'d20':20,'d%t':10,'d%u':10}
def analyse(label,res):
    print(f'--- {label}  ({len(res)} trials)')
    kinds=[k for k in SIDES if any(r_[0]==k for r_ in res[0])]
    worst=1
    for k in kinds:
        # per-trial sequences per die slot
        seqs=[[v for kk,v in r if kk==k] for r in res]
        flat=[v for s in seqs for v in s]
        vals=sorted(set(flat)) if k.startswith('d%') else list(range(1,SIDES[k]+1))
        small=len(flat)<5*len(vals)
        n=len(vals);cnt=[flat.count(v) for v in vals]
        chi=chisquare(cnt) if len(flat)>=3*n else None
        # repeat rate: same slot, consecutive trials
        slots=len(seqs[0]);rep=tot=0
        for s in range(slots):
            for t in range(1,len(seqs)):
                tot+=1;rep+= seqs[t][s]==seqs[t-1][s]
        exp=1/n
        # within-trial agreement (dice thrown together): rate two dice in the same throw match
        pm=pt=0
        for s_ in seqs:
            for i in range(len(s_)):
                for j in range(i+1,len(s_)):
                    pt+=1;pm+= s_[i]==s_[j]
        pstr=f'chi2 p={chi.pvalue:.3f}' if chi else 'chi2 n/a'
        worst=min(worst,chi.pvalue if chi else 1)
        print(f'{k:>4}: n={len(flat):4d} {pstr}  repeat-of-previous {rep/tot:.3f} (fair {exp:.3f})  same-throw match {pm/max(pt,1):.3f} (fair {exp:.3f})  min/max count {min(cnt)}/{max(cnt)}')
    return worst

if __name__=='__main__':
    mode=sys.argv[1];trials=int(sys.argv[2])
    pool={'d2':2,'d4':2,'d6':2,'d8':2,'d10':2,'d12':2,'d20':3,'d100':2}
    t0=time.time();res,errs=run(mode,pool,trials)
    analyse(mode,res);print('errors',errs,'time %.0fs'%(time.time()-t0))
    json.dump(res,open(f'fair_{mode}.json','w'))
