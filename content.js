(()=>{
 const {t,setLanguage}=FeedLensI18n;
 const adapter=Object.values(globalThis.FeedLensAdapters).find(a=>a.hosts.includes(location.hostname));
 if(!adapter)return;
 const platform=adapter.id;
 const requests=new Map();
 const records=new Map();let scheduled=false;let generation=0;
 const css=`:host{display:block;flex:0 1 auto;min-width:26px;max-width:60%;margin-left:auto;padding-left:8px;font:12px/1.5 system-ui,sans-serif;color:inherit}*{box-sizing:border-box}.bar{display:flex;align-items:center;justify-content:flex-end;gap:4px;height:24px;min-width:0}.badges{display:flex;align-items:center;gap:4px;min-width:0;overflow:hidden}.tag{display:inline-block;border-radius:4px;padding:1px 5px;background:#dfedff;color:#204e8a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.influence{background:#eee6ff;color:#65439c}button{font:inherit;cursor:pointer;color:inherit;background:transparent;border:1px solid #8885;border-radius:5px;padding:4px 8px}button:focus-visible,summary:focus-visible{outline:2px solid #448bdb;outline-offset:2px}button:hover{background:#8882}.gear{position:relative;display:grid;place-items:center;flex:0 0 24px;width:24px;height:24px;padding:4px;border:0;color:#858b94}.gear svg{width:15px;height:15px}.gear[data-state="pending"]:after,.gear[data-state="error"]:after{content:"";position:absolute;right:1px;top:1px;width:5px;height:5px;border-radius:50%;background:#448bdb}.gear[data-state="error"]:after{background:#df9549}.more{flex:none;padding:0 3px;border:0;font-size:11px;color:#888}.popover{position:fixed;inset:auto;margin:0;width:min(330px,calc(100vw - 16px));max-height:min(440px,calc(100dvh - 16px));overflow:auto;padding:14px;background:#fff;color:#30343b;border:1px solid #8884;border-radius:10px;box-shadow:0 8px 32px #0003;white-space:normal;font:12px/1.6 system-ui,sans-serif}.heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.heading strong{font-size:13px}.close{border:0;padding:0 6px;font-size:18px}.row{display:flex;gap:6px;align-items:baseline;flex-wrap:wrap;margin:6px 0}.row .tag{white-space:normal;overflow-wrap:anywhere}.name{color:#777;min-width:54px}small{color:#777}details{margin-top:10px}summary{cursor:pointer;color:#777}.foot{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}.read-text{white-space:pre-wrap;overflow-wrap:anywhere}.status{margin:0 0 10px}@media(prefers-color-scheme:dark){.tag{background:#243c59;color:#b4d4ff}.influence{background:#403151;color:#e0c8ff}.popover{background:#232426;color:#e0e2e6}small,summary,.name{color:#a4a6ad}}`;
 function el(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
 function message(msg){return chrome.runtime.sendMessage({...msg,platform});}
 function positionPanel(r){
  const rect=r.button.getBoundingClientRect(),width=r.panel.offsetWidth,height=r.panel.offsetHeight;
  r.panel.style.left=`${Math.max(8,Math.min(innerWidth-width-8,rect.right-width))}px`;
  r.panel.style.top=`${Math.max(8,Math.min(innerHeight-height-8,rect.bottom+6))}px`;
 }
 function openPanel(r){
  if(r.panel.matches(':popover-open')){r.panel.hidePopover();return;}
  r.panel.showPopover();positionPanel(r);r.close.focus();
 }
 function setup(r){
  r.root.append(el('style',css));
  const bar=el('div',null,'bar');r.badges=el('div',null,'badges');
  r.more=action('',()=>openPanel(r));r.more.className='more';r.more.hidden=true;
  r.button=action('',()=>openPanel(r));r.button.className='gear';r.button.setAttribute('aria-label',t('gear'));r.button.setAttribute('aria-expanded','false');r.button.setAttribute('aria-controls','lens-details');r.button.title=t('gear');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');svg.setAttribute('aria-hidden','true');
  const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M18.93 9.13 L21.78 9.92 L21.78 14.08 L18.93 14.87 L18.93 14.87 L20.39 17.45 L17.45 20.39 L14.87 18.93 L14.87 18.93 L14.08 21.78 L9.92 21.78 L9.13 18.93 L9.13 18.93 L6.55 20.39 L3.61 17.45 L5.07 14.87 L5.07 14.87 L2.22 14.08 L2.22 9.92 L5.07 9.13 L5.07 9.13 L3.61 6.55 L6.55 3.61 L9.13 5.07 L9.13 5.07 L9.92 2.22 L14.08 2.22 L14.87 5.07 L14.87 5.07 L17.45 3.61 L20.39 6.55 L18.93 9.13Z');path.setAttribute('stroke-linejoin','round');const circle=document.createElementNS(svg.namespaceURI,'circle');circle.setAttribute('cx','12');circle.setAttribute('cy','12');circle.setAttribute('r','3');svg.append(path,circle);r.button.append(svg);
  bar.append(r.badges,r.more,r.button);
  r.panel=el('section',null,'popover');r.panel.id='lens-details';r.panel.setAttribute('popover','auto');r.panel.setAttribute('aria-label',t('details'));
  const heading=el('div',null,'heading');r.close=action('×',()=>{r.panel.hidePopover();r.button.focus();});r.close.className='close';r.close.setAttribute('aria-label',t('close'));heading.append(el('strong',t('details')),r.close);
  r.body=el('div');r.panel.append(heading,r.body);r.root.append(bar,r.panel);
  r.panel.addEventListener('toggle',()=>{const open=r.panel.matches(':popover-open');r.button.setAttribute('aria-expanded',String(open));if(open)positionPanel(r);});
  r.host.addEventListener('click',event=>event.stopPropagation());
 }
 function shell(r){r.body.replaceChildren();r.statusNode=null;return r.body;}
 function action(text,fn){const b=el('button',text);b.type='button';b.addEventListener('click',fn);return b;}
 function status(r,text,retry=false){
  r.button.dataset.state=retry?'error':'pending';r.button.title=t(retry?'failed':'pending');
  r.button.setAttribute('aria-label',t(retry?'failed':'pending'));
  r.badges.replaceChildren();r.more.hidden=true;
  if(!r.statusNode||r.retry!==retry){
   const p=shell(r);r.statusNode=el('p',null,'status');r.statusNode.setAttribute('role','status');p.append(r.statusNode);
   if(retry)p.append(action(t('retry'),()=>run(r)));p.append(' ',action(t('editConnection'),()=>message({type:'options'})));r.retry=retry;
  }
  r.statusNode.textContent=text;
 }
 function render(r,data){const p=shell(r);
  r.button.dataset.state='ready';r.button.title=t('gear');r.button.setAttribute('aria-label',t('gear'));
  const matched=data.labels.filter(l=>l.score>=0.7).sort((a,b)=>b.score-a.score);
  const visible=['topic','influence'].map(group=>matched.find(l=>l.group===group)).filter(Boolean);
  if(visible.length<4)visible.push(...matched.filter(l=>!visible.includes(l)).slice(0,4-visible.length));
  r.badges.replaceChildren(...visible.map(l=>{const tag=el('span',l.name,`tag ${l.group}`);tag.title=l.name;return tag;}));
  r.more.hidden=matched.length<=visible.length;r.more.textContent=`+${matched.length-visible.length}`;r.more.setAttribute('aria-label',t('more',{count:matched.length}));

  for(const [group,title]of [['topic',t('topic')],['influence',t('influence')]]){
   const row=el('div',null,'row');row.append(el('span',title,'name'));
   const matches=data.labels.filter(l=>l.group===group&&l.score>=0.7).sort((a,b)=>b.score-a.score);
   if(!matches.length)row.append(el('small',t('noMatch')));
   matches.forEach(l=>{const tag=el('span',l.name,`tag ${group}`);tag.title=l.description;row.append(tag);});p.append(row);
  }
  const foot=el('div',null,'foot');foot.append(el('small',t('duration',{seconds:(data.ms/1000).toFixed(1)})),action(t('reclassify'),()=>run(r,true)),action(t('editLabels'),()=>message({type:'options'})));p.append(foot);
  const details=el('details');details.append(el('summary',t('readText')));
  details.append(el('small',t('scoreHelp')));
  for(const l of [...data.labels].sort((a,b)=>b.score-a.score))details.append(el('div',`${l.name}：${l.score.toFixed(2)}`));
  const text=el('p',r.text,'read-text');details.append(text);p.append(details);
 }
 function progressText(state){
  if(state.phase==='queued')return t('queued');
  if(state.phase==='retry')return t('retrying',{reason:t(state.reason,{status:state.status}),seconds:Math.ceil(state.waitMs/1000),attempt:state.attempt});
  return t('request',{attempt:state.attempt});
 }
 async function run(r,force=false){
  if(r.busy){r.rerun=true;return;}
  r.rerun=false;r.busy=true;
  const token=++r.token,gen=generation,text=r.text,requestId=crypto.randomUUID(),start=Date.now();
  let timer,watchdog,state={phase:'queued'};
  const valid=()=>token===r.token&&gen===generation&&r.card.isConnected;
  const paint=()=>{if(valid())status(r,t('elapsed',{progress:progressText(state),seconds:Math.floor((Date.now()-start)/1000)}));};
  requests.set(requestId,next=>{state=next;paint();});paint();timer=setInterval(paint,1000);
  try{
   const result=await Promise.race([
    message({type:'classify',post:{text},force,requestId}),
    new Promise((_,reject)=>{watchdog=setTimeout(()=>reject(Error('watchdog')),110000);})
   ]);
   if(!valid())return;
   if(result.ok)render(r,result.data);else status(r,result.error,true);
  }catch(error){if(valid())status(r,t(error.message==='watchdog'?'watchdog':'extensionReload'),true);}
  finally{
   clearInterval(timer);clearTimeout(watchdog);requests.delete(requestId);r.busy=false;
   if((r.rerun||r.text!==text)&&r.card.isConnected)schedule(r);
  }
 }
 function schedule(r){
  clearTimeout(r.timer);
  r.timer=setTimeout(()=>{if(r.card.isConnected)run(r);},350);
 }
 function scan(){scheduled=false;
  const found=adapter.scan().filter(item=>item.target&&item.text);
  const cards=new Set(found.map(item=>item.card));
  for(const [card,r]of records)if(!card.isConnected||!cards.has(card)){clearTimeout(r.timer);if(r.panel.matches(':popover-open'))r.panel.hidePopover();r.host.remove();records.delete(card);r.token++;}
  for(const {card,target,text} of found){if(!text||!target)continue;let r=records.get(card);
   if(r){if(r.host.parentElement!==target)target.append(r.host);if(r.text!==text){r.text=text;r.token++;r.panel.setAttribute('aria-label',t('details'));r.panel.querySelector('.heading strong').textContent=t('details');r.close.setAttribute('aria-label',t('close'));schedule(r);}continue;}
   const host=document.createElement('feed-lens-labels');const root=host.attachShadow({mode:'closed'});target.append(host);
   r={card,host,root,text,token:0,busy:false,timer:null};records.set(card,r);setup(r);status(r,t('noText'));schedule(r);
  }
 }
 new MutationObserver(()=>{if(!scheduled){scheduled=true;setTimeout(scan,250);}}).observe(document.body,{childList:true,subtree:true,characterData:true});
 chrome.runtime.onMessage.addListener(msg=>{if(msg.type==='classificationProgress')requests.get(msg.requestId)?.(msg.state);if(msg.type==='settingsChanged'&&(!msg.platform||msg.platform===platform)){message({type:'status'}).then(result=>{setLanguage(result.data?.language);generation++;for(const r of records.values()){r.token++;r.panel.setAttribute('aria-label',t('details'));r.panel.querySelector('.heading strong').textContent=t('details');r.close.setAttribute('aria-label',t('close'));schedule(r);}}).catch(()=>{});}});
 window.addEventListener('resize',()=>{for(const r of records.values())if(r.panel.matches(':popover-open'))positionPanel(r);});
 window.addEventListener('scroll',event=>{for(const r of records.values())if(r.panel.matches(':popover-open')&&!event.composedPath().includes(r.host))r.panel.hidePopover();},true);
 message({type:'status'}).then(result=>{setLanguage(result.data?.language);scan();}).catch(()=>scan());
})();
