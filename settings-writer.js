import {settingsKey,platformSettings} from './platforms.js';

// Serialize partial updates so a label save cannot restore an older toggle value.
export function createPlatformWriter(storage){
 let tail=Promise.resolve();
 const write=(platform,patch)=>{
  const snapshot=structuredClone(patch);
  const operation=tail.then(async()=>{
   const key=settingsKey(platform);
   const raw=await storage.get([key,'labels','enabled','language']);
   const settings={...raw[key],enabled:platformSettings(raw,platform).enabled,...snapshot};
   await storage.set({[key]:settings});
   return settings;
  });
  tail=operation.catch(()=>{});
  return operation;
 };
 write.replace=patch=>{
  const snapshot=structuredClone(patch);
  const operation=tail.then(()=>storage.set(snapshot));
  tail=operation.catch(()=>{});
  return operation;
 };
 return write;
}
