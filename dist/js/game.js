(() => {
  const canvas = document.querySelector('#world'), ctx = canvas.getContext('2d');
  const ui = Object.fromEntries(['dayLabel','timeLabel','locationName','weatherIcon','weatherName','sceneCaption','toast','playerName','level','xpText','xpBar','happyVal','happyBar','energyVal','energyBar','friendVal','friendBar','mood','questCount','questList','berryCount','flowerCount','coinCount','modalBackdrop','modalIcon','modalEyebrow','modalTitle','modalText','modalChoices'].map(id=>[id,document.getElementById(id)]));
  const state={x:480,y:378,dir:0,walk:0,day:1,minutes:480,xp:20,level:1,happy:78,energy:85,friend:32,berries:2,flowers:0,coins:12,quests:{walk:false,talk:false,flower:false},name:localStorage.getItem('hanamiName')||'Mika',near:null,modal:false};
  const questDefs=[['walk','Take a stroll around town'],['talk','Say hello to someone new'],['flower','Pick a little flower']];
  const stations=[{id:'cafe',x:145,y:290,r:82,name:'MAPLE CAFÉ',kind:'cafe'},{id:'npc',x:616,y:348,r:68,name:'YUI',kind:'npc'},{id:'flower',x:800,y:397,r:70,name:'FLOWER PATCH',kind:'flower'},{id:'bench',x:340,y:365,r:68,name:'THE OLD BENCH',kind:'bench'},{id:'shop',x:145,y:290,r:90,name:'MAPLE CAFÉ',kind:'cafe'}];
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function addXP(amount){state.xp+=amount;while(state.xp>=100){state.xp-=100;state.level++;toast('Level up! A new little chapter begins ✨')}}
  function updateUI(){
    document.querySelector('#playerName').textContent=state.name;
    document.querySelector('#level').textContent=String(state.level).padStart(2,'0');
    ui.xpText.textContent=`${state.xp} / 100 XP`;ui.xpBar.style.width=`${state.xp}%`;
    for(const [key,val] of [['happy',state.happy],['energy',state.energy],['friend',state.friend]]){document.querySelector(`#${key}Val`).textContent=val;document.querySelector(`#${key}Bar`).style.width=val+'%';}
    ui.berryCount.textContent=state.berries;ui.flowerCount.textContent=state.flowers;ui.coinCount.textContent=state.coins;
    ui.questList.innerHTML=questDefs.map(([id,text])=>`<div class="quest ${state.quests[id]?'done':''}"><span class="quest-check">${state.quests[id]?'✓':''}</span><span>${text}</span></div>`).join('');
    const done=Object.values(state.quests).filter(Boolean).length;ui.questCount.textContent=`${done} / 3`;
    ui.dayLabel.textContent=['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'][(state.day-1)%7];
    const h=Math.floor(state.minutes/60)%12||12,m=state.minutes%60;ui.timeLabel.textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${state.minutes<720?'AM':'PM'}`;
    ui.mood.textContent=state.happy>65?'✧ cozy':state.happy>35?'♡ okay':'☁ a little low';
  }
  function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(canvas.width/960,0,0,canvas.height/560,0,0)}
  function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
  function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
  function path(points,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fill()}
  function drawWorld(t){
    // warm sky and far hills
    let g=ctx.createLinearGradient(0,0,0,560);g.addColorStop(0,'#a9d8d1');g.addColorStop(.58,'#d7e8c9');g.addColorStop(1,'#e5e3bd');ctx.fillStyle=g;ctx.fillRect(0,0,960,560);
    ellipse(812,87,37,37,'#ffe9a8');ellipse(812,87,51,51,'#ffe9a833');
    path([[0,237],[85,182],[170,228],[276,164],[380,227],[495,169],[614,235],[738,173],[845,226],[960,176],[960,334],[0,334]],'#a7cbaa');
    path([[0,273],[110,213],[231,279],[356,206],[480,274],[604,208],[745,281],[860,212],[960,260],[960,360],[0,360]],'#8fbb96');
    // distant town
    for(let i=0;i<7;i++){const x=i*157-16,w=105+(i%3)*16,y=228+(i%2)*18;rounded(x,y,w,122,5,['#f2cdbd','#f7e2bb','#e9c4ca','#f3d9bd'][i%4]);ctx.fillStyle='#bd958c';ctx.fillRect(x-4,y-8,w+8,12);for(let wx=x+14;wx<x+w-10;wx+=31){rounded(wx,y+29,15,20,3,'#9cc8c2');rounded(wx,y+62,15,19,3,'#9cc8c2');}}
    // blossom branches
    for(const side of [0,1]){let bx=side?918:45,by=158;ctx.strokeStyle='#735c50';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(bx,by+105);ctx.quadraticCurveTo(bx+(side?-27:30),by+26,bx+(side?-69:65),by-29);ctx.stroke();for(let i=0;i<17;i++){let x=bx+(side?-1:1)*(12+(i*19)%72),y=by+20-(i*17)%90;blossom(x,y,4.5);}}
    // street depth
    path([[0,324],[960,324],[960,560],[0,560]],'#e9dcbf');path([[0,389],[960,389],[960,560],[0,560]],'#d9c9ad');
    // sidewalk slabs and road
    path([[0,418],[960,418],[960,560],[0,560]],'#aeb8a0');
    ctx.strokeStyle='#c9d0b6';ctx.lineWidth=3;for(let x=0;x<960;x+=112){ctx.beginPath();ctx.moveTo(x,390);ctx.lineTo(x-25,418);ctx.stroke();}
    // road markings
    ctx.fillStyle='#f2e8c7';for(let x=38;x<960;x+=180)ctx.fillRect(x,490,68,5);
    // cafe foreground, left
    rounded(30,257,190,154,8,'#dc9c8b');rounded(40,267,170,134,6,'#f3d7b8');path([[24,273],[124,220],[225,273]],'#bb817d');path([[36,269],[124,230],[212,269]],'#f6c6b8');
    rounded(75,304,58,50,5,'#9cc9c1');ctx.strokeStyle='#fff4d9';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(104,304);ctx.lineTo(104,354);ctx.moveTo(75,329);ctx.lineTo(133,329);ctx.stroke();rounded(148,305,44,96,4,'#a77669');rounded(158,317,23,34,3,'#b7d8cb');
    // awning
    for(let i=0;i<6;i++){rounded(44+i*28,274,28,21,3,i%2?'#fff1d2':'#df8690');}rounded(80,244,90,25,5,'#fff6e2');ctx.fillStyle='#9b6f73';ctx.font='bold 11px Nunito';ctx.textAlign='center';ctx.fillText('MAPLE CAFÉ',125,261);
    // garden and fence right
    for(let i=0;i<8;i++){let x=711+i*31;rounded(x,353,7,67,2,'#b99176');}ctx.fillStyle='#b99176';ctx.fillRect(702,367,260,5);ctx.fillRect(702,400,260,5);
    for(let i=0;i<14;i++){let x=725+(i*47)%231,y=370+(i*29)%65;blossom(x,y,7+(i%3));ctx.strokeStyle='#6d9d6d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+5);ctx.lineTo(x,y+24);ctx.stroke();}
    // bench
    rounded(299,362,99,10,3,'#a97764');rounded(303,374,91,9,3,'#b98670');ctx.fillStyle='#806557';ctx.fillRect(312,383,5,21);ctx.fillRect(379,383,5,21);rounded(293,349,108,9,4,'#bb8d71');
    // little flower stand sign
    rounded(733,293,145,35,8,'#fff8e9');ctx.fillStyle='#806b73';ctx.font='bold 10px Nunito';ctx.fillText('MIMI’S FLOWERS',805,315);
    // floating foliage
    for(let i=0;i<6;i++){ellipse((i*179+43)%960,448+(i%3)*32,13,4,'#91b28a');}
    drawNpc(616,343,t);drawPlayer(t);
    // sparkling petals
    for(let i=0;i<11;i++){let x=(i*127+Math.sin(t/800+i)*14)%960,y=(i*71+t/80)%310;ctx.globalAlpha=.5;blossom(x,y,2.4);ctx.globalAlpha=1;}
  }
  function blossom(x,y,r){for(let i=0;i<5;i++){let a=i*Math.PI*2/5;ellipse(x+Math.cos(a)*r*.85,y+Math.sin(a)*r*.85,r*.57,r*.43,'#f5c5d0');}ellipse(x,y,r*.28,r*.28,'#f5dc9c')}
  function drawNpc(x,y,t){let bob=Math.sin(t/350)*2;ellipse(x,y+24,14,5,'#556b5560');ctx.save();ctx.translate(x,y+bob); // sweet Yui
    rounded(-10,1,20,24,7,'#8eb6b0');path([[-10,9],[-19,27],[0,23],[18,27],[10,9]],'#8eb6b0');ellipse(0,-8,13,15,'#f6d2b7');ellipse(0,-15,14,12,'#694d5e');ellipse(-11,-5,4,10,'#694d5e');ellipse(11,-5,4,10,'#694d5e');ellipse(-4,-7,1.3,1.8,'#473c4b');ellipse(4,-7,1.3,1.8,'#473c4b');ctx.strokeStyle='#be7482';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-2,2,0.2,2.7);ctx.stroke();ctx.restore();}
  function drawPlayer(t){const walking=keys.size>0,bob=walking?Math.sin(state.walk)*3:Math.sin(t/480)*1.5;ellipse(state.x,state.y+25,16,6,'#665d4f55');ctx.save();ctx.translate(state.x,state.y+bob);if(state.dir===1)ctx.scale(-1,1);
    // legs and shoes
    rounded(-9,12,7,16,4,'#fff0dd');rounded(2,12,7,16,4,'#fff0dd');ellipse(-6,28,6,3,'#d48799');ellipse(7,28,6,3,'#d48799');
    // dress
    path([[-9,-1],[9,-1],[15,20],[-15,20]],'#e994aa');rounded(-9,-7,18,17,6,'#f4afbd');ctx.fillStyle='#ffe9db';ctx.beginPath();ctx.moveTo(-5,-5);ctx.lineTo(0,1);ctx.lineTo(5,-5);ctx.fill();
    // arms
    rounded(-15,0,6,17,3,'#f3cdb3');rounded(9,0,6,17,3,'#f3cdb3');
    // hair/head
    ellipse(0,-15,14,16,'#f2cfb3');ellipse(0,-22,15,12,'#594454');ellipse(-11,-17,4,10,'#594454');ellipse(11,-17,4,10,'#594454');path([[-14,-21],[-9,-34],[2,-35],[14,-26],[7,-24],[1,-28],[-4,-23],[-9,-26]],'#594454');
    ellipse(-5,-16,1.6,2.2,'#4e424f');ellipse(5,-16,1.6,2.2,'#4e424f');ellipse(-8,-11,2,1,'#e89aa2');ellipse(8,-11,2,1,'#e89aa2');ctx.strokeStyle='#b86e7c';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-11,2.7,.3,2.8);ctx.stroke();
    // bow
    ellipse(11,-29,5,3,'#e991a9');ellipse(16,-29,5,3,'#e991a9');ellipse(13.5,-29,2,2,'#f3c2b9');
    ctx.restore();}
  const keys=new Set();
  function update(seconds){if(state.modal)return;const sp=118*seconds;let dx=0,dy=0;if(keys.has('arrowleft')||keys.has('a'))dx--;if(keys.has('arrowright')||keys.has('d'))dx++;if(keys.has('arrowup')||keys.has('w'))dy--;if(keys.has('arrowdown')||keys.has('s'))dy++;if(dx||dy){let len=Math.hypot(dx,dy);state.x=clamp(state.x+dx/len*sp,22,938);state.y=clamp(state.y+dy/len*sp,280,443);state.walk+=seconds*12;if(dx)state.dir=dx<0?0:1;state.minutes+=seconds*1.7;if(state.minutes>=1440){state.minutes-=1440;state.day++;state.quests={walk:false,talk:false,flower:false};toast('A new day in your little world ✨')}state.energy=Math.max(0,Math.floor(state.energy-seconds*.3));if(!state.quests.walk){addXP(seconds*4);if(state.xp>=35)state.quests.walk=true;}}
    state.near=null;for(const s of stations){if(Math.hypot(s.x-state.x,s.y-state.y)<s.r){state.near=s;break;}}
    document.querySelector('#interactBtn').style.opacity=state.near?'1':'.72';if(state.near){ui.sceneCaption.innerHTML=`<span class="caption-dot"></span> ${state.near.kind==='npc'?'Yui is here. Go say hello!':state.near.kind==='cafe'?'The smell of fresh pastries is heavenly.':'A quiet little spot, just for you.'}`;document.querySelector('#locationName').textContent=state.near.name;}else{ui.sceneCaption.innerHTML='<span class="caption-dot"></span> The morning is yours. Where shall we go?';document.querySelector('#locationName').textContent=state.x<245?'MAPLE CAFÉ':state.x>700?'MIMI’S GARDEN':'SAKURA STREET';}
    updateUI();}
  let last=0;function frame(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;drawWorld(ts);update(dt);requestAnimationFrame(frame)}
  function toast(message){ui.toast.textContent=message;ui.toast.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>ui.toast.classList.remove('show'),2100)}
  function openModal({icon='✿',eyebrow='A LITTLE MOMENT',title,text,choices=[]}){state.modal=true;ui.modalIcon.textContent=icon;ui.modalEyebrow.textContent=eyebrow;ui.modalTitle.textContent=title;ui.modalText.textContent=text;ui.modalChoices.innerHTML='';choices.forEach(c=>{const b=document.createElement('button');b.className=`choice-btn ${c.secondary?'secondary':''}`;b.textContent=c.label;b.onclick=()=>{if(c.action)c.action();closeModal()};ui.modalChoices.append(b)});ui.modalBackdrop.hidden=false}
  function closeModal(){state.modal=false;ui.modalBackdrop.hidden=true}
  function interact(){if(!state.near){toast('Wander closer to someone or somewhere ✧');return}const k=state.near.kind;
    if(k==='npc')openModal({icon:'♡',eyebrow:'A NEW FRIEND',title:'Yui waves hello!',text:'“It’s such a pretty morning, isn’t it? I’m Yui. I help out at the flower stand down the street.”',choices:[{label:'Chat for a while',action:()=>{state.friend=Math.min(100,state.friend+14);state.happy=Math.min(100,state.happy+8);state.quests.talk=true;addXP(15);toast('A lovely chat! Friendship +14 ♡')}},{label:'Give her a strawberry 🍓',secondary:true,action:()=>{if(state.berries){state.berries--;state.friend=Math.min(100,state.friend+22);state.happy=Math.min(100,state.happy+10);state.quests.talk=true;addXP(20);toast('Yui loved the sweet gift!')}else toast('No strawberries left in your bag!')}},{label:'See you later',secondary:true}]});
    else if(k==='flower')openModal({icon:'🌷',eyebrow:'MIMI’S GARDEN',title:'A little patch of color',text:'The flowers sway in the breeze. You spot a tiny pink tulip that would brighten anyone’s day.',choices:[{label:'Pick a flower · 1 energy',action:()=>{if(state.energy<10){toast('You need a little rest first.');return}state.energy=Math.max(0,state.energy-10);state.flowers++;state.coins+=2;state.happy=Math.min(100,state.happy+5);state.quests.flower=true;addXP(18);toast('A tulip for your bag! +2 coins 🌷')}},{label:'Just enjoy the view',secondary:true,action:()=>{state.happy=Math.min(100,state.happy+3);toast('The colors make you feel lighter ✨')}}]});
    else if(k==='cafe')openModal({icon:'☕',eyebrow:'MAPLE CAFÉ',title:'Warm and wonderful',text:'The café is full of soft sunlight and the smell of cinnamon. What sounds nice?',choices:[{label:'Berry tart · 4 coins',action:()=>{if(state.coins<4){toast('Not enough coins just yet!');return}state.coins-=4;state.happy=Math.min(100,state.happy+16);state.energy=Math.min(100,state.energy+14);addXP(12);toast('A perfect little treat 🍓')}},{label:'Hot cocoa · 3 coins',action:()=>{if(state.coins<3){toast('Not enough coins just yet!');return}state.coins-=3;state.energy=Math.min(100,state.energy+20);state.happy=Math.min(100,state.happy+8);toast('Mmm, warm cocoa ☕')}},{label:'Maybe another time',secondary:true}]});
    else openModal({icon:'☁',eyebrow:'THE OLD BENCH',title:'Take a breather',text:'You sit for a moment and watch the clouds drift by. There’s no rush at all.',choices:[{label:'Rest a little',action:()=>{state.energy=Math.min(100,state.energy+24);state.happy=Math.min(100,state.happy+4);state.minutes+=30;toast('Feeling refreshed! Energy +24 ☁')}},{label:'Get back to exploring',secondary:true}]});
  }
  function shop(){openModal({icon:'🛍️',eyebrow:'A TINY SHOP',title:'Little things for your day',text:'A neighbor has set out some treats. Choose something to take along.',choices:[{label:'Buy strawberries · 3 coins',action:()=>{if(state.coins<3){toast('Not enough coins!');return}state.coins-=3;state.berries++;toast('Two juicy strawberries added 🍓')}},{label:'Sell a flower · +5 coins',action:()=>{if(!state.flowers){toast('Pick a flower in Mimi’s garden first!');return}state.flowers--;state.coins+=5;toast('A kind neighbor bought your flower! +5 coins')}},{label:'Not today',secondary:true}]})}
  function showMap(){openModal({icon:'⌖',eyebrow:'YOUR NEIGHBORHOOD',title:'A little town map',text:'Maple Café is to the west · Yui is waiting near the middle of Sakura Street · Mimi’s flower garden is to the east. Take your time getting there!',choices:[{label:'Let’s explore!',action:()=>toast('Use WASD or the arrow keys to wander ✿')}]})}
  document.addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d'].includes(key))e.preventDefault();if(key===' '){if(!state.modal)interact();return}if(key==='escape'){closeModal();return}keys.add(key)});
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
  document.querySelectorAll('.mobile-pad button').forEach(button=>{const key={up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}[button.dataset.dir];button.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(key);button.setPointerCapture(e.pointerId)});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>button.addEventListener(ev,()=>keys.delete(key)))});
  document.querySelector('#interactBtn').addEventListener('click',interact);document.querySelector('#shopBtn').addEventListener('click',shop);document.querySelector('#mapBtn').addEventListener('click',showMap);
  document.querySelector('#helpBtn').addEventListener('click',()=>openModal({icon:'✧',eyebrow:'WELCOME TO HANAMI DAYS',title:'Your little world',text:'A cozy life sim with no rush and no wrong turns. Explore Sakura Street with WASD or the arrow keys. Get close to a place or person and press Space (or tap Interact) to share a moment. Finish your three little things to grow your friendship, happiness, and level!',choices:[{label:'Sounds lovely',action:()=>{}}]}));
  document.querySelector('#editName').addEventListener('click',()=>{const name=prompt('What should we call you?',state.name);if(name&&name.trim()){state.name=name.trim().slice(0,14);localStorage.setItem('hanamiName',state.name);updateUI();toast(`Hello, ${state.name}! ♡`)}});
  document.querySelector('#modalClose').addEventListener('click',closeModal);ui.modalBackdrop.addEventListener('click',e=>{if(e.target===ui.modalBackdrop)closeModal()});
  document.querySelector('#soundBtn').addEventListener('click',e=>{const on=e.currentTarget.dataset.off!=='true';e.currentTarget.dataset.off=on?'true':'false';e.currentTarget.textContent=on?'♫̸':'♫';toast(on?'Sound off':'Sound on')});
  document.querySelector('#bagHint').addEventListener('click',()=>toast('Strawberries are gifts · flowers can be sold · coins buy café treats'));
  updateUI();resize();window.addEventListener('resize',resize);requestAnimationFrame(frame);
})();
