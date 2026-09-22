import './i18n.js';
import {validateLabels,labelLimits} from './core.js';
import {localizedDefaults} from './presets.js';
import {platforms,platformFromUrl,settingsKey,platformSettings} from './platforms.js';
import {createPlatformWriter} from './settings-writer.js';
import {configLimit,exportConfig,parseConfig,importedStorage} from './config.js';
const {t,resolve,setLanguage,languages}=FeedLensI18n;
const $=id=>document.getElementById(id);
const platformIds=Object.keys(platforms);
const raw=await chrome.storage.local.get(['apiKey','language','enabled','labels',...platformIds.map(settingsKey)]);
let language=resolve(raw.language),platform=new URLSearchParams(location.search).get('platform');
if(!Object.hasOwn(platforms,platform))platform='weibo';
setLanguage(language);
const drafts=new Map(platformIds.map(id=>[id,platformSettings(raw,id)]));
const pristine=new Set(platformIds.filter(id=>!raw[settingsKey(id)]?.labels&&!(id==='weibo'&&raw.labels)));
const writePlatform=createPlatformWriter(chrome.storage.local);
const savedLabels=new Map();
const dirty=new Set();let group='topic',pendingImport=null,hasKey=!!raw.apiKey;
const title=id=>id==='weibo'?t('weibo'):platforms[id].name;
const current=()=>drafts.get(platform);
function status(key,params={},error=false){$('status').textContent=t(key,params);$('status').classList.toggle('error',error);}
function changed(){
 if(JSON.stringify(current().labels)===savedLabels.get(platform))dirty.delete(platform);else dirty.add(platform);
 pristine.delete(platform);status(dirty.has(platform)?'unsaved':'upToDate');
}
window.addEventListener('beforeunload',event=>{if(dirty.size){event.preventDefault();event.returnValue='';}});
async function notify(changedPlatform){
 const tabs=await chrome.tabs.query({}).catch(()=>[]);
 await Promise.all(tabs.filter(tab=>platformFromUrl(tab.url)&&(!changedPlatform||platformFromUrl(tab.url)===changedPlatform)).map(tab=>chrome.tabs.sendMessage(tab.id,{type:'settingsChanged',...(changedPlatform?{platform:changedPlatform}:{})}).catch(()=>{})));
}
function renderNav(){
 $('platform-nav').replaceChildren();
 for(const id of platformIds){
  const button=document.createElement('button');button.className='platform-button';button.type='button';
  if(id===platform)button.setAttribute('aria-current','page');
  const symbol=document.createElement('span');symbol.className='platform-symbol';symbol.setAttribute('aria-hidden','true');symbol.textContent={weibo:'W',threads:'@',x:'𝕏'}[id];
  button.append(symbol,document.createTextNode(title(id)));button.onclick=()=>{platform=id;renderNav();renderPlatform();};$('platform-nav').append(button);
 }
}
function renderRows(){
 const labels=current().labels,query=$('search').value.trim().toLocaleLowerCase();
 $('groups').replaceChildren();$('groups').setAttribute('aria-labelledby',`${group}-tab`);
 for(const g of ['topic','influence']){$(`${g}-tab`).textContent=`${t(g)} (${labels.filter(l=>l.group===g).length})`;$(`${g}-tab`).setAttribute('aria-selected',String(g===group));$(`${g}-tab`).tabIndex=g===group?0:-1;}
 const shown=labels.filter(label=>label.group===group&&`${label.name} ${label.description}`.toLocaleLowerCase().includes(query));
 if(!shown.length){const message=document.createElement('p');message.className='empty';message.textContent=t(query?'noResults':'empty');$('groups').append(message);}
 for(const label of shown){
  const row=document.createElement('div');row.className=`labelrow ${label.group}`;
  const name=document.createElement('input');name.value=label.name;name.maxLength=labelLimits.name;name.required=true;name.setAttribute('aria-label',t('name'));
  const rule=document.createElement('textarea');rule.value=label.description;rule.maxLength=labelLimits.description;rule.required=true;rule.placeholder=t('rule');rule.setAttribute('aria-label',`${label.name}: ${t('rule')}`);
  const remove=document.createElement('button');remove.type='button';remove.className='delete';remove.textContent='×';remove.setAttribute('aria-label',t('delete',{name:label.name}));
  name.oninput=()=>{label.name=name.value;rule.setAttribute('aria-label',`${label.name}: ${t('rule')}`);remove.setAttribute('aria-label',t('delete',{name:label.name}));changed();};
  rule.oninput=()=>{label.description=rule.value;changed();};
  remove.onclick=()=>{current().labels=labels.filter(item=>item.id!==label.id);changed();renderRows();};
  row.append(name,rule,remove);$('groups').append(row);
 }
}
function renderPlatform(){
 $('platform-name').textContent=title(platform);$('enabled').checked=current().enabled;$('enabled-label').textContent=t('enabled',{platform:title(platform)});
 $('save').textContent=t('save',{platform:title(platform)});$('search').value='';status(dirty.has(platform)?'unsaved':'upToDate');renderRows();
}
function renderLanguage(){
 document.documentElement.lang=language==='zh'?'zh-CN':language;document.title=`Feed Lens · ${t('settings')}`;
 for(const node of document.querySelectorAll('[data-i18n]'))node.textContent=t(node.dataset.i18n);
 $('language').value=language;$('platform-nav').setAttribute('aria-label',t('platforms'));document.querySelector('.editor').setAttribute('aria-label',t('workspace'));
 $('search').placeholder=t('search');$('search').setAttribute('aria-label',t('search'));$('key').placeholder=t('keyPlaceholder');
 $('connection-close').setAttribute('aria-label',t('close'));$('import-close').setAttribute('aria-label',t('close'));
 $('connection-status').textContent=t(hasKey?'connected':'notConnected');$('connection-dot').classList.toggle('ready',hasKey);
 $('export').title=t('configHelp');$('show').textContent=t($('key').type==='password'?'show':'hide');renderNav();renderPlatform();
}
for(const [value,name]of Object.entries(languages)){const option=document.createElement('option');option.value=value;option.textContent=name;$('language').append(option);}
$('language').onchange=async()=>{
 const next=$('language').value;
 try{await chrome.storage.local.set({language:next});language=next;setLanguage(language);for(const id of pristine){drafts.get(id).labels=localizedDefaults(language);savedLabels.set(id,JSON.stringify(drafts.get(id).labels));}renderLanguage();await notify();}
 catch(error){$('language').value=language;status(error.message,{},true);}
};
for(const id of pristine)drafts.get(id).labels=localizedDefaults(language);
for(const id of platformIds)savedLabels.set(id,JSON.stringify(drafts.get(id).labels));
let pendingToggles=0;
$('enabled').onchange=async()=>{
 const id=platform,enabled=$('enabled').checked,previous=drafts.get(id).enabled;
 drafts.get(id).enabled=enabled;pendingToggles++;$('enabled').disabled=true;
 try{await writePlatform(id,{enabled});if(platform===id)status(dirty.has(id)?'unsaved':'upToDate');await notify(id);}
 catch(error){drafts.get(id).enabled=previous;if(platform===id){$('enabled').checked=previous;status(error.message,error.params,true);}}
 finally{pendingToggles--;$('enabled').disabled=pendingToggles>0;}
};
$('search').oninput=renderRows;
for(const g of ['topic','influence']){
 $(`${g}-tab`).onclick=()=>{group=g;renderRows();};
 $(`${g}-tab`).onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();group=event.key==='Home'?'topic':event.key==='End'?'influence':group==='topic'?'influence':'topic';renderRows();$(`${group}-tab`).focus();}};
}
$('add').onclick=()=>{if(current().labels.length>=labelLimits.count){status('labelLimit',{},true);return;}current().labels.push({id:crypto.randomUUID(),group,name:t('newLabel'),description:''});$('search').value='';changed();renderRows();$('groups').lastElementChild.querySelector('input').focus();};
$('restore').onclick=()=>{if(confirm(t('restorePrompt',{platform:title(platform)}))){current().labels=localizedDefaults(language);changed();renderRows();}};
$('save').onclick=async()=>{
 const savedPlatform=platform,labels=structuredClone(current().labels);$('save').disabled=true;
 try{validateLabels(labels);await writePlatform(savedPlatform,{labels});
  savedLabels.set(savedPlatform,JSON.stringify(labels));
  if(JSON.stringify(drafts.get(savedPlatform).labels)===JSON.stringify(labels))dirty.delete(savedPlatform);else dirty.add(savedPlatform);
  pristine.delete(savedPlatform);await notify(savedPlatform);if(platform===savedPlatform)status(dirty.has(platform)?'unsaved':'saved',{platform:title(savedPlatform)});
 }catch(error){status(error.message,error.params,true);}finally{$('save').disabled=false;}
};
$('key').value=raw.apiKey||'';
function openConnection(){$('connection-message').textContent='';$('connection-dialog').showModal();}
$('connection-open').onclick=openConnection;$('connection-status').onclick=openConnection;
$('connection-close').onclick=()=>$('connection-dialog').close();
$('show').onclick=()=>{$('key').type=$('key').type==='password'?'text':'password';$('show').textContent=t($('key').type==='password'?'show':'hide');};
async function saveConnection(){
 const apiKey=$('key').value.trim();
 await chrome.storage.local.set({apiKey});hasKey=!!apiKey;
 $('connection-status').textContent=t(hasKey?'connected':'notConnected');$('connection-dot').classList.toggle('ready',hasKey);await notify();
}
$('connection-save').onclick=async()=>{const button=$('connection-save');button.disabled=true;try{await saveConnection();$('connection-message').textContent=t('connectionSaved');}catch(e){$('connection-message').textContent=t(e.message,e.params);}finally{button.disabled=false;}};
$('clear').onclick=async()=>{try{await chrome.storage.local.remove('apiKey');$('key').value='';hasKey=false;$('connection-status').textContent=t('notConnected');$('connection-dot').classList.remove('ready');await notify();$('connection-message').textContent=t('cleared');}catch(e){$('connection-message').textContent=t(e.message,e.params);}};
$('test').onclick=async()=>{
 $('test').disabled=true;try{await saveConnection();$('connection-message').textContent=t('connecting');const result=await chrome.runtime.sendMessage({type:'test',platform});$('connection-message').textContent=result.ok?t('connectedTest',{seconds:(result.data.ms/1000).toFixed(1)}):result.error;}catch(error){$('connection-message').textContent=t(error.message,error.params);}finally{$('test').disabled=false;}
};
$('export').onclick=()=>{
 try{const data=exportConfig(drafts,language);const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='feed-lens-settings.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('exported');}catch(error){status(error.message,error.params,true);}
};
$('import').onclick=()=>{$('import-file').value='';$('import-file').click();};
$('import-file').onchange=async()=>{
 const file=$('import-file').files[0];if(!file)return;
 try{if(file.size>configLimit)throw Error('configSize');pendingImport=parseConfig(await file.text());$('import-summary').replaceChildren();
  for(const id of platformIds){const row=document.createElement('div');row.className='import-row';const name=document.createElement('strong');name.textContent=title(id);const detail=document.createElement('span');detail.textContent=`${t('labelCount',{count:pendingImport.platforms[id].labels.length})} · ${t(pendingImport.platforms[id].enabled?'active':'paused')}`;row.append(name,detail);$('import-summary').append(row);}
  $('import-dialog').showModal();
 }catch(error){pendingImport=null;status(error.message,error.params,true);}
};
for(const id of ['import-close','import-cancel'])$(id).onclick=()=>$('import-dialog').close();
$('import-dialog').addEventListener('close',()=>pendingImport=null);
$('import-apply').onclick=async()=>{
 if(!pendingImport)return;$('import-apply').disabled=true;
 try{const config=pendingImport;await writePlatform.replace(importedStorage(config));for(const id of platformIds){drafts.set(id,structuredClone(config.platforms[id]));savedLabels.set(id,JSON.stringify(config.platforms[id].labels));}dirty.clear();pristine.clear();language=config.language;setLanguage(language);renderLanguage();await notify();$('import-dialog').close();status('imported');}
 catch(error){status(error.message,error.params,true);}finally{$('import-apply').disabled=false;}
};
renderLanguage();
