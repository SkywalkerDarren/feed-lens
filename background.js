import './i18n.js';
import {validateLabels,requestBody,parseAnswers} from './core.js';
import {platforms,platformFromUrl,settingsKey,platformSettings} from './platforms.js';
import {createTransport} from './transport.js';
const request=createTransport();
const ready=chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
const cache=new Map(); const pending=new Map();
async function settings(platform){await ready;const raw=await chrome.storage.local.get(['apiKey','language','enabled','labels',settingsKey(platform)]);return {apiKey:raw.apiKey||'',language:FeedLensI18n.resolve(raw.language),...platformSettings(raw,platform)};}
async function classify(platform,post,force=false,onProgress=()=>{},testing=false){
 const s=await settings(platform);
 if(!testing&&!s.enabled)throw Error('paused');
 if(!s.apiKey)throw Error('keyRequired');
 if(typeof post?.text!=='string'||!post.text.trim())throw Error('noText');
 const labels=validateLabels(s.labels);
 if(!labels.length)throw Error('noLabels');
 const body=requestBody({...post,platform},labels);
 const key=JSON.stringify([platform,s.apiKey,body]);
 if(force)cache.delete(key);
 if(cache.has(key))return cache.get(key);
 if(pending.has(key)){
  const existing=pending.get(key);existing.listeners.add(onProgress);
  if(existing.state)onProgress(existing.state);
  return existing.promise;
 }
 const entry={listeners:new Set([onProgress]),state:null,promise:null};
 const progress=state=>{entry.state=state;for(const listener of entry.listeners)listener(state);};
 const job=(async()=>{
  const start=Date.now();
  const data=await request(body,s.apiKey,async()=>{
   const current=await settings(platform);
   if((!testing&&!current.enabled)||current.apiKey!==s.apiKey||JSON.stringify(current.labels)!==JSON.stringify(s.labels))throw Error('settingsChanged');
  },progress);
  const result={labels:parseAnswers(data,labels),ms:Date.now()-start};
  const current=await settings(platform);
  if(current.enabled&&current.apiKey===s.apiKey&&JSON.stringify(current.labels)===JSON.stringify(s.labels)){
   cache.set(key,result);if(cache.size>300)cache.delete(cache.keys().next().value);
  }
  return result;
 })();
 entry.promise=job;pending.set(key,entry);try{return await job;}finally{pending.delete(key);}
}
chrome.storage.onChanged.addListener(()=>cache.clear());
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 const extension=sender.id===chrome.runtime.id;
 const page=sender.url?.startsWith(chrome.runtime.getURL(''));
 const sourcePlatform=platformFromUrl(sender.url);
 if(!extension||(!page&&!sourcePlatform))return;
 const platform=sourcePlatform||(Object.hasOwn(platforms,msg.platform)?msg.platform:'weibo');
 (async()=>{
  if(msg.type==='status'){const s=await settings(platform);return {enabled:s.enabled,hasKey:!!s.apiKey,language:s.language};}
  if(msg.type==='options'){await chrome.tabs.create({url:chrome.runtime.getURL(`options.html?platform=${platform}`)});return {};}
  if(msg.type==='test'&&page)return await classify(platform,{text:'A practical guide to writing and testing a small computer program.'},true,()=>{},true);
  if(msg.type==='classify')return await classify(platform,msg.post,msg.force===true,state=>{
   if(sender.tab&&typeof msg.requestId==='string')chrome.tabs.sendMessage(sender.tab.id,{type:'classificationProgress',requestId:msg.requestId,state},sender.documentId?{documentId:sender.documentId}:{frameId:sender.frameId??0}).catch(()=>{});
  });
  throw Error('unknown');
 })().then(data=>reply({ok:true,data}),async error=>{let language='en';try{language=(await settings(platform)).language;}catch{}const params={...error.params};if(params.reason)params.reason=FeedLensI18n.translate(language,params.reason,params);reply({ok:false,error:FeedLensI18n.translate(language,error.message,params)});});return true;
});
