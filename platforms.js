import {localizedDefaults} from './presets.js';
export const platforms={
 weibo:{name:'微博',hosts:['weibo.com','www.weibo.com']},
 x:{name:'X',hosts:['x.com','www.x.com','twitter.com','www.twitter.com']},
 threads:{name:'Threads',hosts:['threads.com','www.threads.com','threads.net','www.threads.net']}
};
export function platformFromUrl(url){
 try{const u=new URL(url);if(u.protocol!=='https:')return null;return Object.keys(platforms).find(id=>platforms[id].hosts.includes(u.hostname))||null;}catch{return null;}
}
export function settingsKey(platform){if(!platforms[platform])throw Error('configInvalid');return `platform:${platform}`;}
export function platformSettings(raw,platform){
 const saved=raw[settingsKey(platform)],defaults=localizedDefaults(raw.language);
 // Legacy labels belong to Weibo only. Never copy them into another platform.
 return {enabled:saved?.enabled??(platform==='weibo'&&(raw.labels!==undefined||raw.enabled!==undefined)?raw.enabled!==false:false),labels:structuredClone(saved?.labels??(platform==='weibo'?raw.labels??defaults:defaults))};
}
