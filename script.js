'use strict';
const $=s=>document.querySelector(s);
const audio=$('#audio'),view=$('#view'),stTitle=$('#stTitle'),stPlay=$('#stPlay'),wheel=$('#wheel'),center=$('#center'),fileIn=$('#file'),
screenEl=$('#screen'),scaler=$('#scaler'),panel=$('#panel'),ipod=$('#ipod'),toastEl=$('#toast');
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),ROWS=8;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=t=>{t=Math.max(0,Math.floor(t||0));return(t/60|0)+':'+String(t%60).padStart(2,'0')};
let tt;const toast=m=>{toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toastEl.classList.remove('on'),1800)};

/* ================= settings & customisation ================= */
const THEMES={White:{sbg:'#ffffff',sfg:'#000000',head:'#c8ccd2',hl:'#2f86e8'},Black:{sbg:'#000000',sfg:'#ffffff',head:'#2b2b2b',hl:'#2f86e8'},
 Midnight:{sbg:'#0d1b33',sfg:'#e6f0ff',head:'#1d3a6b',hl:'#4aa3ff'},Amber:{sbg:'#2a1700',sfg:'#ffb03a',head:'#4a2a00',hl:'#ff8a00'},
 Mint:{sbg:'#effbf3',sfg:'#103018',head:'#b5e3c3',hl:'#1fa35a'},Rose:{sbg:'#fff1f4',sfg:'#40101f',head:'#f1bccb',hl:'#e0407a'}};
const PRE={Black:{body:'#2d2d30',wheel:'#111111',btn:'#1b1b1b',ink:'#e8e8e8'},Silver:{body:'#c8c9cc',wheel:'#f3f3f3',btn:'#f7f7f7',ink:'#9a9a9a'},
 Blue:{body:'#2a8be0',wheel:'#111111',btn:'#2a8be0',ink:'#dddddd'},Green:{body:'#2fae3f',wheel:'#111111',btn:'#2fae3f',ink:'#dddddd'},
 Purple:{body:'#8a35c6',wheel:'#111111',btn:'#8a35c6',ink:'#dddddd'},Red:{body:'#d3262e',wheel:'#111111',btn:'#d3262e',ink:'#dddddd'},
 Gold:{body:'#d8a62b',wheel:'#111111',btn:'#d8a62b',ink:'#dddddd'}};
const FONTS={Sans:'-apple-system,"Helvetica Neue",Arial,sans-serif',Rounded:'ui-rounded,"SF Pro Rounded",Nunito,"Trebuchet MS",sans-serif',Serif:'Georgia,"Times New Roman",serif',Mono:'"SF Mono","Courier New",monospace'};
const DEF={theme:'White',finish:'Glossy',wfinish:'Glossy',radius:28,fs:14,bright:100,font:'Sans',battery:'On',wsz:224,btnsz:84,
 shuffle:'Off',repeat:'Off',clicker:'On',cvol:60,haptic:'Off',sens:20,demo:'On',
 c:{body:'#2d2d30',rim:'#9a9ca0',frame:'#0a0a0a',wheel:'#111111',btn:'#1b1b1b',ring:'#000000',ink:'#e8e8e8',page:'#16181d',...THEMES.White}};
const clone=o=>JSON.parse(JSON.stringify(o));
let cfg;try{cfg=JSON.parse(localStorage.ipod2||'{}')}catch(e){cfg={}}
cfg={...clone(DEF),...cfg,c:{...DEF.c,...(cfg.c||{})}};
const save=()=>{try{localStorage.ipod2=JSON.stringify(cfg)}catch(e){}};
const SECTIONS=[
 ['Device body',[['c','body','Body color'],['c','rim','Edge trim'],['s','finish','Body finish',['Glossy','Matte','Brushed']],['r','radius','Corner radius',8,40]]],
 ['Screen',[['s','theme','Screen theme',[...Object.keys(THEMES),'Custom']],['c','sbg','Background'],['c','sfg','Text color'],['c','head','Header bar'],['c','hl','Highlight'],
  ['c','frame','Screen frame'],['s','font','Font',Object.keys(FONTS)],['r','fs','Text size',12,17],['r','bright','Brightness',25,100],['s','battery','Battery icon',['On','Off']]]],
 ['Click wheel',[['c','wheel','Wheel color'],['c','ink','Label color'],['s','wfinish','Wheel finish',['Glossy','Matte','Metal']],['r','wsz','Wheel size',190,250]]],
 ['Center button',[['c','btn','Button color'],['c','ring','Ring color'],['r','btnsz','Button size',50,110]]],
 ['Sound & feel',[['s','clicker','Click sound',['On','Off']],['r','cvol','Click volume',10,100],['s','haptic','Vibration',['Off','On']],['r','sens','Degrees per step',10,40]]],
 ['Library & page',[['s','demo','Demo songs',['On','Off']],['c','page','Page color']]]];
const rowHTML=([t,k,l,a,b])=>`<label>${l}`+(t==='c'?`<input type="color" data-c="${k}">`:t==='r'?`<input type="range" min="${a}" max="${b}" data-r="${k}">`:`<select data-s="${k}">${a.map(o=>`<option>${o}</option>`).join('')}</select>`)+'</label>';
panel.innerHTML='<h2>Customize</h2><div class="sw">'+Object.entries(PRE).map(([n,c])=>`<button title="${n}" data-p="${n}" style="background:${c.body}"></button>`).join('')+'</div>'+
 SECTIONS.map(([n,r],i)=>`<details${i<2?' open':''}><summary>${n}</summary>${r.map(rowHTML).join('')}</details>`).join('')+'<div class="acts"><button id="rst">Reset all</button><button id="done">Done</button></div>';
function applyCfg(){
 const r=document.documentElement.style;
 for(const k in cfg.c)r.setProperty('--'+k,cfg.c[k]);
 r.setProperty('--btnsz',cfg.btnsz+'px');r.setProperty('--wsz',cfg.wsz+'px');r.setProperty('--r',cfg.radius+'px');r.setProperty('--fs',cfg.fs+'px');
 r.setProperty('--bright',cfg.bright);r.setProperty('--font',FONTS[cfg.font]);
 ipod.className='ipod f-'+cfg.finish.toLowerCase();wheel.className='wheel w-'+cfg.wfinish.toLowerCase();
 $('#battery').classList.toggle('off',cfg.battery==='Off');
 $('#snd').textContent='Click sound: '+cfg.clicker;
 panel.querySelectorAll('[data-c]').forEach(i=>i.value=cfg.c[i.dataset.c]);
 panel.querySelectorAll('[data-r]').forEach(i=>i.value=cfg[i.dataset.r]);
 panel.querySelectorAll('[data-s]').forEach(i=>i.value=cfg[i.dataset.s]);
}
function setOpt(k,v){cfg[k]=v;if(k==='theme'&&THEMES[v])Object.assign(cfg.c,THEMES[v]);if(k==='demo')syncDemo();applyCfg();save()}
panel.oninput=e=>{const d=e.target.dataset,v=e.target.value;
 if(d.c){cfg.c[d.c]=v;if(['sbg','sfg','head'].includes(d.c))cfg.theme='Custom';applyCfg();save()}
 else if(d.r){cfg[d.r]=+v;applyCfg();save()}else if(d.s)setOpt(d.s,v);render()};
panel.onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.p){Object.assign(cfg.c,PRE[b.dataset.p]);applyCfg();save()}
 if(b.id==='rst')resetAll();if(b.id==='done')panel.classList.remove('open')};
function resetAll(){cfg=clone(DEF);syncDemo();applyCfg();save();render()}
$('#gear').onclick=()=>panel.classList.toggle('open');
$('#snd').onclick=()=>{setOpt('clicker',cfg.clicker==='On'?'Off':'On');toast('Click sound '+cfg.clicker.toLowerCase());render()};

/* ================= generated cover art ================= */
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const rnd=seed=>{let s=hash(seed);return()=>(s=(s*1664525+1013904223)>>>0)/4294967296};
function genCover(name,artist){
 const R=rnd(name+artist),c=document.createElement('canvas');c.width=c.height=240;const x=c.getContext('2d');
 const h=R()*360,C=[`hsl(${h} 70% 55%)`,`hsl(${(h+35)%360} 80% 62%)`,`hsl(${(h+180)%360} 55% 42%)`,`hsl(${(h+215)%360} 65% 18%)`,'#f4ecdc'],p=()=>C[R()*5|0];
 let g=x.createLinearGradient(0,0,0,240);g.addColorStop(0,C[3]);g.addColorStop(1,C[2]);x.fillStyle=g;x.fillRect(0,0,240,240);
 const st=R()*6|0;
 if(st===0){g=x.createLinearGradient(0,50,0,180);g.addColorStop(0,C[1]);g.addColorStop(1,C[0]);x.fillStyle=g;x.beginPath();x.arc(120,120,64,0,7);x.fill();x.fillStyle=C[3];for(let i=0;i<7;i++)x.fillRect(40,126+i*i*1.6,160,2+i*1.3);x.fillRect(0,182,240,60)}
 else if(st===1){for(let i=0;i<7;i++){x.fillStyle=p();const a=R()*180,b=R()*180,s=40+R()*80;x.beginPath();if(i%3==0)x.arc(a+30,b+30,s/2,0,7);else if(i%3==1)x.rect(a,b,s,s);else{x.moveTo(a,b+s);x.lineTo(a+s/2,b);x.lineTo(a+s,b+s)}x.fill()}}
 else if(st===2){const cx=R()*240,cy=R()*160+20;for(let r=300,i=0;r>0;r-=22,i++){x.fillStyle=C[i%5];x.beginPath();x.arc(cx,cy,r,0,7);x.fill()}}
 else if(st===3){x.globalAlpha=.88;for(let k=0;k<6;k++){x.fillStyle=C[k%5];x.beginPath();x.moveTo(0,240);for(let i=0;i<=240;i+=8)x.lineTo(i,60+k*28+Math.sin(i/(30+k*9)+k*2)*(14+k*3));x.lineTo(240,240);x.fill()}x.globalAlpha=1}
 else if(st===4){x.fillStyle=C[4];for(let i=0;i<14;i++)for(let j=0;j<14;j++){x.beginPath();x.arc(i*17+12,j*17+12,Math.max(.5,7*(1-Math.hypot(i-7,j-7)/10)+R()*1.5),0,7);x.fill()}}
 else{for(let k=0;k<4;k++){x.fillStyle=C[k];x.beginPath();x.moveTo(0,240);for(let i=-20;i<260;i+=40+R()*20)x.lineTo(i,100+k*34-R()*60);x.lineTo(260,240);x.fill()}}
 x.fillStyle='rgba(0,0,0,.38)';x.fillRect(0,194,240,46);x.fillStyle='#fff';x.font='bold 19px sans-serif';x.fillText(name.slice(0,20),12,222);
 return c.toDataURL('image/jpeg',.85);
}
const albumArt={};
const coverOf=(album,artist,real)=>real?(albumArt[album]=albumArt[album]||real):(albumArt[album]=albumArt[album]||genCover(album,artist));

/* ================= library, ID3 tags, demo songs ================= */
const DEMO=[{id:'sun',title:'Sunrise Drift',artist:'Aurora Fields',album:'Slow Light',genre:'Ambient'},
 {id:'keys',title:'Midnight Keys',artist:'Aurora Fields',album:'Slow Light',genre:'Piano'},
 {id:'neon',title:'Neon Highway',artist:'Night Circuit',album:'Retro Grid',genre:'Synthwave'},
 {id:'chrome',title:'Chrome Sunset',artist:'Night Circuit',album:'Retro Grid',genre:'Synthwave'},
 {id:'rain',title:'Rainy Window',artist:'Paper Moon',album:'Study Tapes',genre:'Lo-Fi'},
 {id:'pixel',title:'Pixel Parade',artist:'8-Bit Orchard',album:'Level One',genre:'Chiptune'}];
/*SYNTH-START*/
const SR=22050,hz=n=>440*2**((n-69)/12);
const mkDrum=(n,f)=>{const a=new Float32Array(n*SR|0);for(let i=0;i<a.length;i++)a[i]=f(i/SR,i);return a};
let _ph=0;
const DK=mkDrum(.3,(t,i)=>{if(!i)_ph=0;_ph+=2*Math.PI*(45+95*Math.exp(-t*32))/SR;return Math.sin(_ph)*Math.exp(-t*8)*.9});
const DS=mkDrum(.25,t=>(Math.random()*1-.5+Math.sin(2*Math.PI*190*t))*.5*Math.exp(-t*22)*.5);
const DH=mkDrum(.05,t=>(Math.random()-.5)*Math.exp(-t*90)*.5),DO=mkDrum(.22,t=>(Math.random()-.5)*Math.exp(-t*16)*.45);
function makeSong(id){
 const R=rnd('song'+id),secs={sun:62,keys:64,neon:54,chrome:63,rain:64,pixel:59}[id],N=secs*SR|0,L=new Float32Array(N),Rr=new Float32Array(N);
 const pg=p=>[Math.cos((p+1)*Math.PI/4),Math.sin((p+1)*Math.PI/4)];
 const put=(f,t0,d,k,amp,pan=0,a=.01,dec=1)=>{
  const i0=t0*SR|0,len=Math.min(((d+.15)*SR)|0,N-i0),[gl,gr]=pg(pan),w=2*Math.PI*f/SR;
  for(let i=0;i<len;i++){const t=i/SR,p=w*i,ph=f*t%1;let v=0;
   switch(k){case'sine':v=Math.sin(p);break;case'saw':v=2*ph-1;break;case'sq':v=ph<.5?1:-1;break;case'sq25':v=ph<.25?1:-1;break;
    case'tri':v=4*Math.abs(ph-.5)-1;break;case'ep':v=Math.sin(p+1.3*Math.exp(-t*5)*Math.sin(p*2));break;
    case'pad':v=(Math.sin(p*.997)+Math.sin(p*1.003)+(Math.sin(p*2)+Math.sin(p*2.01))*.33+Math.sin(p*3)*.2)*.45;break;
    case'piano':for(let h=1;h<6;h++)v+=Math.sin(p*h)/Math.pow(h,1.3)*Math.exp(-t*(h-.4)*1.1);break}
   v*=Math.min(t/a,1)*Math.exp(-t/dec)*(t>d?Math.exp(-(t-d)*28):1)*amp;L[i0+i]+=v*gl;Rr[i0+i]+=v*gr}};
 const add=(a,t0,g,pan=0)=>{const i0=t0*SR|0,[gl,gr]=pg(pan);for(let i=0;i<a.length&&i0+i<N;i++){L[i0+i]+=a[i]*g*gl;Rr[i0+i]+=a[i]*g*gr}};
 const comb=(a,d,g)=>{for(let i=d;i<N;i++)a[i]+=a[i-d]*g};
 const sw=(bpm,prog,reps)=>{const be=60/bpm,bar=be*4;
  for(let i=0;i<prog.length*reps;i++){const[r,q]=prog[i%prog.length],t0=i*bar,ch=q.map(x=>r+x);
   ch.forEach(n=>put(hz(n+12),t0,bar,'pad',.07,R()*1.4-.7,.4,4));
   for(let j=0;j<8;j++)put(hz(r-24),t0+j*be/2,be*.45,'saw',.17,0,.005,.25);
   if(i>=2)for(let j=0;j<16;j++)put(hz(ch[(j*2+(j>>2))%3]+24),t0+j*be/4,be/4,'sq25',.05,j%2?.4:-.4,.003,.12);
   for(let j=0;j<4;j++){add(DK,t0+j*be,.9);if(j%2)add(DS,t0+j*be,.9)}
   for(let j=0;j<8;j++)add(j%4==3?DO:DH,t0+j*be/2,.5,.3);
   if(i>=prog.length)(i%2?[0,3,5,3]:[7,5,3,0]).forEach((s,j)=>put(hz(ch[0]+12+[0,2,3,5,7,10][s%6]),t0+j*be,be*.9,'saw',.07,.2,.01,.5))}};
 if(id==='sun'){const bar=240/66,ch=[[48,55,59,64],[45,52,57,64],[41,48,57,64],[43,50,59,62]];
  for(let i=0;i<8;i++){const c=ch[i%4];c.forEach(n=>put(hz(n),i*bar*2,bar*2,'pad',.09,R()*1.2-.6,1.4,9));
   for(let j=0;j<16;j++)put(hz(c[(j*3+i)%4]+12+(j%5?0:12)),i*bar*2+j*bar/8,.5,'sine',.1,j%2?.5:-.5,.004,.5)}
  comb(L,.29*SR|0,.45);comb(Rr,.37*SR|0,.45)}
 else if(id==='keys'){const ch=[[45,57,60,64],[41,53,60,65],[48,55,60,64],[43,55,59,62]],mel=[76,74,72,67,69,72,74,72];
  for(let i=0;i<16;i++){const c=ch[(i>>1)%4],t0=i*4;put(hz(c[0]-12),t0,4,'piano',.3,-.3,.01,2);put(hz(c[0]),t0,4,'piano',.14,-.2,.01,2);
   for(let j=0;j<8;j++)put(hz(c[j%4?1+j%3:3]+(j%4===2?12:0)),t0+j/2,1.2,'piano',.17,.3,.01,1.5);
   if(i>=4)put(hz(mel[i%8]),t0+2*(i%2),2,'piano',.2,.1,.005,2)}
  comb(L,.23*SR|0,.35);comb(Rr,.31*SR|0,.35)}
 else if(id==='neon'){sw(108,[[57,[0,3,7]],[53,[0,4,7]],[48,[0,4,7]],[55,[0,4,7]]],6);comb(L,.2*SR|0,.25);comb(Rr,.27*SR|0,.25)}
 else if(id==='chrome'){sw(92,[[50,[0,3,7]],[46,[0,4,7]],[53,[0,4,7]],[48,[0,4,7]]],6);comb(L,.22*SR|0,.28);comb(Rr,.3*SR|0,.28)}
 else if(id==='rain'){const be=60/76,bar=be*4,sc=[69,72,74,76,79,81],ch=[[50,57,60,64,67],[43,53,59,64,65],[48,55,59,62,64],[41,48,57,60,64]];
  for(let i=0;i<20;i++){const c=ch[i%4],t0=i*bar,s=be*.16;
   c.forEach((n,k)=>{put(hz(n),t0+k*.02,be*1.4,'ep',.11,-.3+k*.15,.01,1.1);put(hz(n),t0+be*2.5+s+k*.02,be*.8,'ep',.08,.2,.01,.9)});
   put(hz(c[0]-24),t0,be*1.6,'sine',.35,0,.01,.8);put(hz(c[0]-24),t0+be*2.5+s,be,'sine',.3,0,.01,.6);
   add(DK,t0,.8);add(DK,t0+be*2.5+s,.6);[1,3].forEach(j=>add(DS,t0+j*be,.7));
   for(let j=0;j<8;j++)add(DH,t0+j*be/2+(j%2?s:0),.5,.3);
   if(i>=2)for(let j=0;j<4;j++)if(R()<.75)put(hz(sc[R()*6|0]),t0+j*be+(j%2?s:0)+be/2,be*.7,'ep',.1,.4,.01,.5)}
  for(let k=0;k<1500;k++){const i=R()*N|0;L[i]+=R()*.2;Rr[i]+=R()*.2}
  comb(L,.17*SR|0,.2);comb(Rr,.23*SR|0,.2)}
 else{const be=.4,bar=1.6,roots=[48,45,41,43],ph=[0,1,2,3].map(()=>Array.from({length:8},()=>R()*6|0)),sc=[72,74,76,79,81,84];
  for(let i=0;i<36;i++){const r=roots[(i>>1)%4],p=ph[(i>>1)%4],t0=i*bar;
   for(let j=0;j<8;j++){const t=t0+j*be/2;put(hz(r-12+[0,0,7,0,12,7,0,7][j]),t,be*.45,'tri',.28,0,.003,.3);
    if(i>=4)put(hz(sc[p[j]]+(i%8<4?0:12)),t,be*.45,'sq25',.1,.2,.002,.25);
    if(i>=8)put(hz(r+12+[0,4,7,4][j%4]),t,be/4,'sq',.04,-.4,.002,.08)}
   for(let j=0;j<4;j++)j%2?add(DS,t0+j*be,.9):add(DK,t0+j*be,.7);
   for(let j=0;j<8;j++)add(DH,t0+j*be/2,.6)}}
 let pk=0;for(let i=0;i<N;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(Rr[i]));
 const g=.85/pk,fo=2.5*SR|0,buf=new ArrayBuffer(44+N*4),v=new DataView(buf),ws=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));
 ws(0,'RIFF');v.setUint32(4,36+N*4,true);ws(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,SR,true);
 v.setUint32(28,SR*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,N*4,true);
 for(let i=0;i<N;i++){const f=i>N-fo?(N-i)/fo:i<400?i/400:1;v.setInt16(44+i*4,clamp(L[i]*g*f,-1,1)*32767,true);v.setInt16(46+i*4,clamp(Rr[i]*g*f,-1,1)*32767,true)}
 return URL.createObjectURL(new Blob([buf],{type:'audio/wav'}));
}
/*SYNTH-END*/
const lib=[];let queue=[],qi=-1,mode='',vt;
function syncDemo(){
 const has=lib.some(t=>t.demo);
 if(cfg.demo==='On'&&!has)DEMO.forEach((d,i)=>lib.splice(i,0,{...d,url:null,synth:d.id,plays:0,demo:true,cover:coverOf(d.album,d.artist)}));
 if(cfg.demo==='Off'&&has){
  if(queue[qi]&&queue[qi].demo){audio.pause();audio.removeAttribute('src');queue=[];qi=-1}
  for(let i=lib.length;i--;)if(lib[i].demo)lib.splice(i,1);
  if(typeof stack!=='undefined')stack.splice(1);
 }
}
const dec=(b,e)=>{if(e===1)e=b[0]===0xFE?2:1;return new TextDecoder(['iso-8859-1','utf-16le','utf-16be','utf-8'][e]||'utf-8').decode(b).replace(/\0/g,'').replace(/^\uFEFF/,'').trim()};
function pic(f,v2){
 const e=f[0];let mime,p;
 if(v2){mime='image/'+(String.fromCharCode(f[1],f[2],f[3])==='PNG'?'png':'jpeg');p=4}
 else{p=1;while(p<f.length&&f[p])p++;mime=String.fromCharCode(...f.subarray(1,p));p++}
 p++;if(e===0||e===3){while(p<f.length&&f[p])p++;p++}else{while(p+1<f.length&&(f[p]||f[p+1]))p+=2;p+=2}
 return URL.createObjectURL(new Blob([f.subarray(p)],{type:mime.includes('/')?mime:'image/jpeg'}));
}
async function readTags(file){
 const t={};
 try{
  const h=new Uint8Array(await file.slice(0,10).arrayBuffer());
  if(String.fromCharCode(h[0],h[1],h[2])!=='ID3')return t;
  const ver=h[3],size=(h[6]<<21)|(h[7]<<14)|(h[8]<<7)|h[9];
  const d=new Uint8Array(await file.slice(10,10+Math.min(size,8e6)).arrayBuffer());
  const il=ver===2?3:4,hl=ver===2?6:10;let p=0;
  while(p+hl<d.length){
   const id=String.fromCharCode(...d.subarray(p,p+il));if(!/^[A-Z0-9]+$/.test(id))break;
   const fs=ver===2?(d[p+3]<<16)|(d[p+4]<<8)|d[p+5]:ver===4?(d[p+4]<<21)|(d[p+5]<<14)|(d[p+6]<<7)|d[p+7]:((d[p+4]<<24)|(d[p+5]<<16)|(d[p+6]<<8)|d[p+7])>>>0;
   const fr=d.subarray(p+hl,p+hl+fs);p+=hl+fs;
   const k={TIT2:'title',TT2:'title',TPE1:'artist',TP1:'artist',TALB:'album',TAL:'album',TCON:'genre',TCO:'genre'}[id];
   if(k)t[k]=dec(fr.subarray(1),fr[0]);else if((id==='APIC'||id==='PIC')&&!t.cover)t.cover=pic(fr,ver===2);
  }
  if(t.genre)t.genre=t.genre.replace(/^\(\d+\)/,'')||'Unknown';
 }catch(e){}
 return t;
}
fileIn.onchange=async()=>{
 let n=0;
 for(const f of [...fileIn.files]){
  if(!/^audio\//.test(f.type)&&!/\.(mp3|m4a|aac|wav|flac|ogg|opus)$/i.test(f.name))continue;
  const g=await readTags(f);let{title,artist}=g;const base=f.name.replace(/\.[^.]+$/,'');
  if(!title){const m=base.split(/\s+-\s+/);if(m.length>1&&!artist){artist=m[0];title=m.slice(1).join(' - ')}else title=base}
  artist=artist||'Unknown Artist';const album=g.album||'Unknown Album';
  lib.push({title,artist,album,genre:g.genre||'Unknown',cover:coverOf(album,artist,g.cover),url:URL.createObjectURL(f),plays:0});n++;
 }
 fileIn.value='';toast(n?`${n} song${n>1?'s':''} added`:'No audio files found');render();
};

/* ================= screens ================= */
const bgOf=o=>!o?'linear-gradient(#c9c9c9,#808080)':`url(${o.cover}) center/cover`;
const L=(title,items,x)=>({title,type:'list',items,sel:0,top:0,...x});
const addItem={t:'Add Songs…',act:()=>fileIn.click()};
const group=(k,l=lib)=>[...new Set(l.map(t=>t[k]))].sort((a,b)=>a.localeCompare(b));
const byTitle=l=>[...l].sort((a,b)=>a.title.localeCompare(b.title));
const songItems=l=>l.map((t,i)=>({t:t.title,on:()=>queue[qi]===t,act:()=>{play(l,i);push(nowScr())}}));
const songsScr=(title,l,keep)=>L(title,()=>l.length?songItems(keep?l:byTitle(l)):[addItem]);
const albumsScr=(title,f)=>L(title,()=>{const g=group('album',f());return g.length?g.map(a=>({t:a,go:()=>songsScr(a,f().filter(t=>t.album===a),1)})):[addItem]});
const msgScr=(title,...text)=>({title,type:'msg',text,items:()=>[]});
const nowScr=()=>{mode='';return{title:'Now Playing',type:'now',items:()=>[]}};
const clockScr=()=>({title:'Clock',type:'clock',items:()=>[]});
const coverScr=()=>({title:'Cover Flow',type:'cover',sel:0,ts:0,flip:false,items:()=>group('album').map(a=>{const l=lib.filter(t=>t.album===a);return{t:a,o:l[0],l}})});
const musicScr=()=>L('Music',()=>[
 {t:'Cover Flow',go:coverScr},
 {t:'Playlists',go:()=>L('Playlists',()=>[{t:'Recently Added',go:()=>songsScr('Recently Added',[...lib].reverse(),1)},{t:'Most Played',go:()=>songsScr('Most Played',[...lib].sort((a,b)=>b.plays-a.plays),1)}])},
 {t:'Artists',go:()=>L('Artists',()=>group('artist').length?group('artist').map(a=>({t:a,go:()=>albumsScr(a,()=>lib.filter(t=>t.artist===a))})):[addItem])},
 {t:'Albums',go:()=>albumsScr('Albums',()=>lib)},{t:'Songs',go:()=>songsScr('Songs',lib)},
 {t:'Genres',go:()=>L('Genres',()=>group('genre').length?group('genre').map(g=>({t:g,go:()=>songsScr(g,lib.filter(t=>t.genre===g))})):[addItem])},addItem]);
const opt=(t,k,o,suf='')=>({t,v:()=>cfg[k]+suf,act:()=>setOpt(k,o[(o.indexOf(cfg[k])+1)%o.length])});
const settingsScr=()=>L('Settings',()=>[opt('Shuffle','shuffle',['Off','Songs']),opt('Repeat','repeat',['Off','One','All']),opt('Clicker','clicker',['On','Off']),
 opt('Click Volume','cvol',[25,50,75,100],'%'),opt('Brightness','bright',[100,75,50,25],'%'),opt('Theme','theme',Object.keys(THEMES)),opt('Demo Songs','demo',['On','Off']),
 {t:'Customize…',act:()=>panel.classList.add('open')},{t:'Reset All Settings',act:()=>{resetAll();toast('Settings reset')}},
 {t:'About',go:()=>msgScr('About','iPod Classic',`${lib.length} songs`,'Version 2.1')}]);
const mainScr=()=>L('iPod',()=>[{t:'Music',go:musicScr},{t:'Videos',go:()=>msgScr('Videos','No Videos')},{t:'Photos',go:()=>msgScr('Photos','No Photos')},
 {t:'Podcasts',go:()=>msgScr('Podcasts','No Podcasts')},{t:'Extras',go:()=>L('Extras',()=>[{t:'Clock',go:clockScr}])},{t:'Settings',go:settingsScr},
 {t:'Shuffle Songs',act:shuffleAll},...(qi>=0?[{t:'Now Playing',go:nowScr}]:[])],{main:true});

/* ================= navigation ================= */
syncDemo();
const stack=[mainScr()],cur=()=>stack[stack.length-1];
const push=s=>{stack.push(s);render()};
function back(){const s=cur();if(s.flip){s.flip=false;render();return}if(stack.length>1){stack.pop();render()}}
function select(){
 const s=cur();
 if(s.type==='now'){mode=mode==='scrub'?'':'scrub';updNow();return}
 if(s.type==='cover'){const a=s.items()[s.sel];if(!a)return;
  if(!s.flip){s.flip=true;s.ts=0;render()}else{play(a.l,s.ts);push(nowScr())}return}
 if(s.type!=='list')return;
 const it=s.items()[s.sel];if(!it)return;
 if(it.go)push(it.go());else{it.act&&it.act();render()}
}
let ac;
function click(){
 if(cfg.haptic==='On'&&navigator.vibrate)navigator.vibrate(4);
 if(cfg.clicker!=='On')return;
 try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
  o.type='square';o.frequency.value=1800;g.gain.setValueAtTime(cfg.cvol/100*.07,t);g.gain.exponentialRampToValueAtTime(.0005,t+.012);
  o.connect(g).connect(ac.destination);o.start();o.stop(t+.015)}catch(e){}
}
function tick(d){
 const s=cur();
 if(s.type==='now'){
  click();
  if(mode==='scrub'&&audio.duration)audio.currentTime=clamp(audio.currentTime+d*audio.duration/40,0,audio.duration);
  else{audio.volume=clamp(Math.round(audio.volume*16)+d,0,16)/16;mode='vol';clearTimeout(vt);vt=setTimeout(()=>{if(mode==='vol'){mode='';updNow()}},1500)}
  updNow();return;
 }
 if(s.type==='cover'){
  const it=s.items();if(!it.length)return;
  if(s.flip){const n=it[s.sel].l.length,v=clamp(s.ts+d,0,n-1);if(v!==s.ts){click();s.ts=v;render()}}
  else{const v=clamp(s.sel+d,0,it.length-1);if(v!==s.sel){click();s.sel=v;render()}}
  return;
 }
 if(s.type==='list'){
  const n=s.items().length,v=clamp(s.sel+d,0,n-1);
  if(n&&v!==s.sel){click();s.sel=v;render()}
 }
}

/* ================= playback ================= */
audio.volume=.75;
function play(l,i){queue=l;qi=i;loadTrack()}
function loadTrack(){
 const t=queue[qi];audio.pause();render();
 const go=()=>{audio.src=t.url;audio.play().catch(()=>{})};
 if(t.synth&&!t.url){toast('Preparing song…');setTimeout(()=>{if(queue[qi]!==t)return;t.url=makeSong(t.synth);go()},60)}else go()}
function shuffleAll(){if(!lib.length){fileIn.click();return}setOpt('shuffle','Songs');queue=[...lib];qi=Math.random()*queue.length|0;loadTrack();push(nowScr())}
function next(auto){
 if(!queue.length)return;
 if(auto&&cfg.repeat==='One'){audio.currentTime=0;audio.play();return}
 if(cfg.shuffle==='Songs'&&queue.length>1){let n;do{n=Math.random()*queue.length|0}while(n===qi);qi=n}
 else if(qi<queue.length-1)qi++;
 else if(cfg.repeat==='All'||!auto)qi=0;
 else{audio.currentTime=0;render();return}
 loadTrack();
}
function prev(){if(!queue.length)return;if(audio.currentTime>3)audio.currentTime=0;else{qi=Math.max(qi-1,0);loadTrack()}}
const toggle=()=>{if(qi<0)return;audio.paused?audio.play():audio.pause()};
audio.onended=()=>{queue[qi].plays++;next(true)};
audio.onplay=audio.onpause=()=>render();
audio.onerror=()=>{if(audio.getAttribute('src'))toast("Can't play this song")};
audio.ontimeupdate=audio.onloadedmetadata=()=>updNow();

/* ================= rendering ================= */
function updNow(){
 const b=$('#bar');if(!b)return;
 const d=audio.duration||0,c=audio.currentTime||0,v=mode==='vol',p=v?audio.volume*100:d?c/d*100:0;
 b.className='bar'+(mode==='scrub'?' scrub':'');
 b.innerHTML=`<i style="width:${p}%"></i><u style="left:${p}%"></u>`;
 $('#te').textContent=v?'Volume':fmt(c);$('#tr').textContent=v?'':'-'+fmt(d-c);
}
function renderCover(s){
 const it=s.items();
 if(!it.length){view.innerHTML='<div class="msg">No Albums<br>Add songs in Music</div>';return}
 s.sel=clamp(s.sel,0,it.length-1);
 let w=view.querySelector('.cfw');
 if(!w||w._s!==s||+w.dataset.n!==it.length){
  view.innerHTML='<div class="cfw"><div class="cf">'+it.map(a=>`<div class="ci"><div class="fl"><div class="fr" style="background-image:url(${a.o.cover})"></div><div class="bk"></div></div><div class="rf" style="background-image:url(${a.o.cover})"></div></div>`).join('')+'</div><div class="cap"></div></div>';
  w=view.querySelector('.cfw');w._s=s;w.dataset.n=it.length;w.querySelector('.cap');
 }
 const els=w.querySelectorAll('.ci'),cap=w.querySelector('.cap');
 els.forEach((e,i)=>{
  const d=i-s.sel,ad=Math.abs(d),sg=Math.sign(d);
  e.style.transform=d?`translate3d(${sg*(68+(ad-1)*20)}px,0,-60px) rotateY(${-sg*68}deg)`:'translate3d(0,0,40px)';
  e.style.zIndex=20-ad;e.style.opacity=ad>6?0:1;e.style.pointerEvents='none';
  e.classList.toggle('big',!d&&s.flip);
  if(!d&&s.flip){const l=it[i].l,top=clamp(s.ts-3,0,Math.max(0,l.length-6));
   e.querySelector('.bk').innerHTML=`<b>${esc(it[i].t)}</b>`+l.slice(top,top+6).map((t,j)=>`<div class="${top+j===s.ts?'sel':''}">${esc(t.title)}</div>`).join('')}
 });
 cap.classList.toggle('h',s.flip);
 cap.innerHTML=`<b>${esc(it[s.sel].t)}</b><span>${esc(it[s.sel].o.artist)}</span>`;
}
function render(){
 const s=cur(),t=queue[qi];
 stTitle.textContent=s.main?'iPod':s.title;
 stPlay.classList.toggle('on',qi>=0&&!audio.paused);
 if(s.type==='cover'){renderCover(s);return}
 if(s.type==='list'){
  const it=s.items();s.sel=clamp(s.sel,0,Math.max(0,it.length-1));
  if(s.sel<s.top)s.top=s.sel;if(s.sel>=s.top+ROWS)s.top=s.sel-ROWS+1;
  const rows=it.slice(s.top,s.top+ROWS).map((x,j)=>`<div class="row${s.top+j===s.sel?' sel':''}"><span class="tx">${x.on&&x.on()?'<i class="np"></i>':''}${esc(x.t)}</span>${x.v?`<span class="v">${esc(x.v())}</span>`:''}${x.go?'<i class="arr"></i>':''}</div>`).join('');
  const sb=it.length>ROWS?`<div class="sb"><i style="top:${s.top/it.length*100}%;height:${ROWS/it.length*100}%"></i></div>`:'';
  const a=t||lib[0];
  view.innerHTML=s.main?`<div class="split"><div class="list">${rows}</div><div class="pane"><div class="art" style="background:${bgOf(a)}"></div></div></div>`:`<div class="list full">${rows}${sb}</div>`;
 }else if(s.type==='now'){
  if(!t){view.innerHTML='<div class="msg">No Song</div>';return}
  view.innerHTML=`<div class="now"><div class="nt"><div class="art" style="background:${bgOf(t)}"></div><div class="meta"><b>${esc(t.title)}</b><span>${esc(t.artist)}</span><span>${esc(t.album)}</span><em>${qi+1} of ${queue.length}</em></div></div><div id="bar" class="bar"></div><div class="times"><span id="te"></span><span id="tr"></span></div></div>`;
  updNow();
 }else if(s.type==='clock'){
  const d=new Date();
  view.innerHTML=`<div class="msg"><b class="big">${d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit',second:'2-digit'})}</b>${d.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'})}</div>`;
 }else view.innerHTML=`<div class="msg">${s.text.map(esc).join('<br>')}</div>`;
}
setInterval(()=>{if(cur().type==='clock')render()},1000);

/* ================= click wheel ================= */
let reg=null,ang=null,acc=0,mv=0,hold=0,held=false;
const rel=e=>{const r=wheel.getBoundingClientRect();return[e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2]};
const angle=e=>{const[x,y]=rel(e);return Math.atan2(y,x)*180/Math.PI};
const step=()=>cfg.sens*(cur().type==='cover'&&!cur().flip?.65:1);
function region(e){
 const[x,y]=rel(e);if(Math.hypot(x,y)<center.getBoundingClientRect().width/2)return'sel';
 const a=Math.atan2(y,x)*180/Math.PI;
 return a>-135&&a<=-45?'menu':a>-45&&a<=45?'next':a>45&&a<=135?'play':'prev';
}
const press=r=>({menu:back,sel:select,next:()=>next(false),prev,play:toggle})[r]();
wheel.onpointerdown=e=>{
 wheel.setPointerCapture(e.pointerId);reg=region(e);ang=reg==='sel'?null:angle(e);acc=mv=0;held=false;
 if(reg==='sel')center.classList.add('dn');
 if(reg==='next'||reg==='prev')hold=setTimeout(()=>{held=true;hold=setInterval(()=>{
  if(audio.duration)audio.currentTime=clamp(audio.currentTime+(reg==='next'?6:-6),0,audio.duration)},120)},500);
};
wheel.onpointermove=e=>{
 if(ang==null)return;
 const a=angle(e);let d=a-ang;if(d>180)d-=360;if(d<-180)d+=360;
 ang=a;acc+=d;mv+=Math.abs(d);
 if(mv>10&&!held){clearTimeout(hold);hold=0}
 const st=step();
 while(acc>=st){tick(1);acc-=st}
 while(acc<=-st){tick(-1);acc+=st}
};
wheel.onpointerup=()=>{
 if(reg==null)return;
 clearTimeout(hold);clearInterval(hold);center.classList.remove('dn');
 if(mv<10&&!held)press(reg);
 reg=ang=null;
};
wheel.onpointercancel=()=>{clearTimeout(hold);clearInterval(hold);center.classList.remove('dn');reg=ang=null};
let wacc=0;
ipod.addEventListener('wheel',e=>{e.preventDefault();wacc+=e.deltaY;if(Math.abs(wacc)>30){tick(wacc>0?1:-1);wacc=0}},{passive:false});
addEventListener('keydown',e=>{
 const m={ArrowDown:()=>tick(1),ArrowUp:()=>tick(-1),Enter:select,Escape:back,Backspace:back,ArrowRight:()=>next(false),ArrowLeft:prev,' ':toggle}[e.key];
 if(m&&!/INPUT|SELECT/.test(e.target.tagName)){e.preventDefault();m()}
});
function fit(){scaler.style.transform=`scale(${Math.min(1.1,(innerHeight-20)/560,(innerWidth-20)/340)})`}
addEventListener('resize',fit);
applyCfg();fit();render();
