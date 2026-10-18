const tri=(a,b,c)=>x=>x<=a||x>=c?0:x<b?(x-a)/(b-a):(c-x)/(c-b);
const trap=(a,b,c,d)=>x=>x<a||x>d?0:x<b?(b==a?1:(x-a)/(b-a)):x<=c?1:(d==c?1:(d-x)/(d-c));
const IN=[
 {n:'Dirt level',u:'%',min:0,max:100,v:50,st:1,t:[['Low',trap(0,0,20,45)],['Medium',tri(25,50,75)],['High',trap(55,80,100,100)]]},
 {n:'Fabric sturdiness',u:'/10',min:0,max:10,v:5,st:.1,t:[['Delicate',trap(0,0,2,4.5)],['Normal',tri(3,5,7)],['Sturdy',trap(5.5,8,10,10)]]},
 {n:'Load size',u:'kg',min:0,max:8,v:4,st:.1,t:[['Small',trap(0,0,1.5,3.5)],['Medium',tri(2,4,6)],['Large',trap(4.5,6.5,8,8)]]}];
const L5=['Very low','Low','Medium','High','Very high'];
const OUT=[{n:'Wash time',u:'min',min:10,max:90,d:0},{n:'Water level',u:'%',min:20,max:100,d:0},
 {n:'Spin speed',u:'rpm',min:400,max:1400,d:0},{n:'Detergent',u:'ml',min:10,max:100,d:0}];
OUT.forEach(o=>o.t=[0,1,2,3,4].map(k=>tri(k/4-.25,k/4,k/4+.25)));
const cl=v=>Math.max(0,Math.min(4,Math.round(v)));
const RULES=[];
for(let d=0;d<3;d++)for(let f=0;f<3;f++)for(let l=0;l<3;l++)
 RULES.push({d,f,l,o:[cl(d*1.2+l*.5+f*.4),cl(l*1.5+d*.5),cl(f*2-(l==2&&f>0?1:0)),cl(d*1.5+l*.5)]});
const N=201,col=['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'];
const V=()=>IN.map(i=>i.v);
function fuzz(x){return IN.map((i,k)=>i.t.map(t=>t[1](x[k])))}
function infer(x,sel){
 const m=fuzz(x),s=RULES.map(r=>Math.min(m[0][r.d],m[1][r.f],m[2][r.l])),res=[];
 for(const oi of (sel||[0,1,2,3])){
  const ag=new Float32Array(N);let sn=0,sd=0;
  for(let j=0;j<N;j++){const u=j/(N-1);let mx=0;
   for(let r=0;r<27;r++){if(s[r]<=0)continue;const v=Math.min(s[r],OUT[oi].t[RULES[r].o[oi]](u));if(v>mx)mx=v}
   ag[j]=mx;sn+=u*mx;sd+=mx}
  const c=sd?sn/sd:.5;res[oi]={c,val:OUT[oi].min+c*(OUT[oi].max-OUT[oi].min),ag}}
 return{m,s,res}}
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function prep(cv){const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);return c}
function plot(cv,fns,mark,ag,dots){
 const c=prep(cv),W=cv.width,H=cv.height,p=14;c.font='10px sans-serif';
 const X=u=>p+u*(W-2*p),Y=v=>H-p-v*(H-2*p);
 c.strokeStyle=css('--bd');c.beginPath();c.moveTo(p,Y(0));c.lineTo(W-p,Y(0));c.stroke();
 if(ag){const gr=c.createLinearGradient(0,p,0,H);gr.addColorStop(0,'rgba(99,102,241,.65)');gr.addColorStop(1,'rgba(6,182,212,.08)');c.fillStyle=gr;c.beginPath();c.moveTo(X(0),Y(0));
  for(let j=0;j<N;j++)c.lineTo(X(j/(N-1)),Y(ag[j]));c.lineTo(X(1),Y(0));c.fill()}
 fns.forEach((f,k)=>{c.strokeStyle=col[k];c.lineWidth=2.2;c.lineJoin='round';c.beginPath();
  for(let j=0;j<N;j++){const u=j/(N-1),y=Y(f(u));j?c.lineTo(X(u),y):c.moveTo(X(u),y)}c.stroke()});
 if(mark!=null){c.strokeStyle=css('--tx');c.setLineDash([4,3]);c.beginPath();c.moveTo(X(mark),p/2);c.lineTo(X(mark),Y(0));c.stroke();c.setLineDash([]);
  (dots||[]).forEach((v,k)=>{if(v>0){c.fillStyle=col[k];c.beginPath();c.arc(X(mark),Y(v),4,0,7);c.fill()}})}}
// UI build
const sl=document.getElementById('sliders');
IN.forEach((i,k)=>{sl.insertAdjacentHTML('beforeend',`<div class="sl"><label>${i.n}<span id="v${k}"></span></label><input type="range" id="s${k}" min="${i.min}" max="${i.max}" step="${i.st}" value="${i.v}"><div class="mem" id="m${k}"></div></div>`);
 document.getElementById('s'+k).oninput=e=>{i.v=+e.target.value;cancelSim();upd()}});
const PRE={'Silk blouse':[15,1,1],'Everyday cotton':[45,5,4],'Muddy jeans':[90,9,3],'Bedding set':[60,6,7.5],'Sports kit':[75,6,2]};
const pr=document.getElementById('presets');
for(const n in PRE){const b=document.createElement('button');b.className='s';b.textContent=n;
 b.onclick=()=>{PRE[n].forEach((v,k)=>{IN[k].v=v;document.getElementById('s'+k).value=v});cancelSim();upd()};pr.appendChild(b)}
const outs=document.getElementById('outs');
OUT.forEach((o,k)=>outs.insertAdjacentHTML('beforeend',`<div class="c"><div class="mem">${o.n}</div><div class="big" id="o${k}"></div><div class="mem" id="l${k}"></div><canvas id="op${k}" width="200" height="110"></canvas></div>`));
const ip=document.getElementById('inplots');
IN.forEach((i,k)=>ip.insertAdjacentHTML('beforeend',`<div><div class="mem">${i.n} (${i.u})</div><canvas id="ip${k}" width="240" height="130"></canvas></div>`));
const osel=document.getElementById('osel');OUT.forEach((o,k)=>osel.add(new Option(o.n+' ('+o.u+')',k)));osel.onchange=upd;
const rl=document.getElementById('rules');
RULES.forEach((r,k)=>rl.insertAdjacentHTML('beforeend',`<div class="r" id="r${k}"><span>R${k+1}</span><span>IF dirt <b>${IN[0].t[r.d][0]}</b> AND fabric <b>${IN[1].t[r.f][0]}</b> AND load <b>${IN[2].t[r.l][0]}</b> → time <b>${L5[r.o[0]]}</b>, water <b>${L5[r.o[1]]}</b>, spin <b>${L5[r.o[2]]}</b>, detergent <b>${L5[r.o[3]]}</b></span><span><i id="rb${k}" style="width:0"></i></span></div>`));
let R=null;
function upd(){
 const x=V();R=infer(x);
 IN.forEach((i,k)=>{document.getElementById('v'+k).textContent=i.v.toFixed(i.st<1?1:0)+' '+i.u;
  document.getElementById('m'+k).textContent=i.t.map((t,j)=>t[0]+': '+R.m[k][j].toFixed(2)).join('  ·  ');
  plot(document.getElementById('ip'+k),i.t.map(t=>u=>t[1](i.min+u*(i.max-i.min))),(i.v-i.min)/(i.max-i.min),null,R.m[k])});
 OUT.forEach((o,k)=>{const r=R.res[k];document.getElementById('o'+k).innerHTML=Math.round(r.val)+' <span class="u">'+o.u+'</span>';
  document.getElementById('l'+k).textContent='centroid '+r.c.toFixed(3);
  plot(document.getElementById('op'+k),o.t,r.c,r.ag)});
 R.s.forEach((s,k)=>{document.getElementById('r'+k).classList.toggle('on',s>0.001);document.getElementById('rb'+k).style.width=(s*100)+'%'});
 const t=R.res[0].val,f=x[1];
 document.getElementById('cyc').textContent=f<3.5?'Delicate Care':t>65?'Heavy Duty':t<30?'Quick Wash':'Normal Wash';
 heat()}
function heat(){
 const cv=document.getElementById('hm'),c=prep(cv),oi=+osel.value,n=26,o=OUT[oi],x=V();
 const cw=cv.width/n,ch=cv.height/n;
 for(let a=0;a<n;a++)for(let b=0;b<n;b++){
  const v=infer([a/(n-1)*100,x[1],b/(n-1)*8],[oi]).res[oi].c;
  c.fillStyle=`hsl(${255-v*255},85%,${42+v*14}%)`;c.fillRect(a*cw,cv.height-(b+1)*ch,cw+1,ch+1)}
 c.fillStyle='#fff';c.strokeStyle='#000';c.beginPath();c.arc(x[0]/100*cv.width,cv.height-x[2]/8*cv.height,6,0,7);c.fill();c.stroke();
 c.fillStyle='#fff';c.font='11px sans-serif';c.fillText('blue = '+o.min+' '+o.u+'   →   red = '+o.max+' '+o.u,8,14)}
// drum animation + simulation
let ang=0,phase='idle',prog=0,simT=null;
const dr=document.getElementById('drum'),dc=dr.getContext('2d');
function cancelSim(){phase='idle';prog=0;simT=null;document.getElementById('pg').style.width='0';document.getElementById('ph').textContent=''}
document.getElementById('sim').onclick=()=>{phase='sim';simT=performance.now()};
const PH=[['Filling',.1],['Washing',.55],['Rinsing',.2],['Spinning',.15]];
function frame(now){
 let spin=false,wl=R.res[1].val/100,name='';
 if(simT){prog=Math.min(1,(now-simT)/14000);let a=0;
  for(const[p,w]of PH){if(prog<=a+w){name=p;if(p=='Filling')wl*=(prog-a)/w;if(p=='Spinning'){spin=true;wl=0}break}a+=w}
  document.getElementById('pg').style.width=prog*100+'%';
  document.getElementById('ph').textContent=' '+name+' — '+Math.round(R.res[0].val+20)+' min cycle (time-compressed)';
  if(prog>=1){simT=null;document.getElementById('ph').textContent=' ✔ Done'}}
 ang+=spin?R.res[2].val/1400*.45:(simT?.05*Math.sin(now/400)+.02:.02);
 const W=dr.width,H=dr.height,cx=W/2,cy=H/2,r=80;dc.clearRect(0,0,W,H);
 dc.save();dc.beginPath();dc.arc(cx,cy,r,0,7);dc.clip();
 dc.fillStyle=css('--bd');dc.fillRect(0,0,W,H);
 dc.fillStyle='rgba(59,130,246,.55)';dc.fillRect(cx-r,cy+r-wl*2*r,2*r,wl*2*r);
 const nC=Math.round(3+IN[2].v*2);
 for(let i=0;i<nC;i++){const a=ang+i*6.283/nC,rr=r*(.35+.35*((i*37)%10)/10);
  dc.fillStyle=['#f59e0b','#ef4444','#10b981','#8b5cf6'][i%4];dc.beginPath();dc.arc(cx+rr*Math.cos(a),cy+rr*Math.sin(a),9,0,7);dc.fill()}
 dc.restore();dc.strokeStyle=css('--tx');dc.lineWidth=5;dc.beginPath();dc.arc(cx,cy,r,0,7);dc.stroke();
 requestAnimationFrame(frame)}
upd();requestAnimationFrame(frame);
