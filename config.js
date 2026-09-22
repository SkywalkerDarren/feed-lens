import {validateLabels} from './core.js';
import {platforms,settingsKey} from './platforms.js';
import './i18n.js';
export const configLimit=1024*1024;
function cleanPlatform(value){
 if(!value||typeof value.enabled!=='boolean')throw Error('configInvalid');
 validateLabels(value.labels);
 return {enabled:value.enabled,labels:value.labels.map(({id,group,name,description})=>({id,group,name,description}))};
}
export function exportConfig(drafts,language){
 if(!Object.hasOwn(FeedLensI18n.languages,language))throw Error('configInvalid');
 return {format:'feed-lens',version:1,language,platforms:Object.fromEntries(Object.keys(platforms).map(id=>[id,cleanPlatform(drafts.get(id))]))};
}
export function parseConfig(text){
 if(new TextEncoder().encode(text).length>configLimit)throw Error('configSize');
 let data;try{data=JSON.parse(text);}catch{throw Error('configInvalid');}
 if(!data||data.format!=='feed-lens')throw Error('configInvalid');
 if(data.version!==1)throw Error('configVersion');
 if(!Object.hasOwn(FeedLensI18n.languages,data.language)||!data.platforms||typeof data.platforms!=='object'||Object.keys(data.platforms).length!==Object.keys(platforms).length)throw Error('configInvalid');
 const drafts=new Map(Object.keys(platforms).map(id=>[id,cleanPlatform(Object.hasOwn(data.platforms,id)?data.platforms[id]:null)]));
 return exportConfig(drafts,data.language);
}
export function importedStorage(config){
 return {language:config.language,...Object.fromEntries(Object.keys(platforms).map(id=>[settingsKey(id),cleanPlatform(config.platforms[id])]))};
}
