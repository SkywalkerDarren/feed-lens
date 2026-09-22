import './i18n.js';
import {platformFromUrl,platforms} from './platforms.js';
const {t,setLanguage}=FeedLensI18n;
const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
const platform=platformFromUrl(tab?.url)||'weibo';
try{
 const result=await chrome.runtime.sendMessage({type:'status',platform});setLanguage(result.data?.language);
 document.documentElement.lang=FeedLensI18n.resolve(result.data?.language);
 document.getElementById('status').textContent=result.ok?(!result.data.hasKey?t('keyRequired'):`${platform==='weibo'?t('weibo'):platforms[platform].name}: ${t(result.data.enabled?'active':'paused')}`):result.error;
}catch{document.getElementById('status').textContent=t('extensionReload');}
document.getElementById('open').textContent=t('settings');document.getElementById('note').textContent=t('popupNote');
document.getElementById('open').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL(`options.html?platform=${platform}`)});
