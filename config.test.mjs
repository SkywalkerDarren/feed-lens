import test from 'node:test';
import assert from 'node:assert/strict';
import {exportConfig,parseConfig,importedStorage,configLimit} from './config.js';
import {platforms,platformSettings} from './platforms.js';
import {localizedDefaults} from './presets.js';
import {validateLabels,requestBody} from './core.js';
import './i18n.js';
const drafts=()=>new Map(Object.keys(platforms).map(id=>[id,{enabled:id==='x',labels:localizedDefaults('en')}]));
test('configuration round-trip preserves custom labels, empty dictionaries and switches',()=>{
 const data=drafts();data.get('x').labels=[{id:'custom',group:'topic',name:'自定义',description:'A personal rule'}];data.get('threads').labels=[];
 const exported=exportConfig(data,'ja');assert.deepEqual(parseConfig(JSON.stringify(exported)),exported);
 assert.deepEqual(Object.keys(importedStorage(exported)).sort(),['language','platform:threads','platform:weibo','platform:x']);
});
test('exports and imports cannot copy credentials, consent or arbitrary storage properties',()=>{
 const data=drafts();data.get('x').apiKey='test-only';data.get('x').labels[0].secret='test-only';
 const exported=exportConfig(data,'en');assert.equal(JSON.stringify(exported).includes('test-only'),false);
 exported.apiKey='incoming-test';exported.consentVersion=1;exported.enabled=true;
 const storage=importedStorage(parseConfig(JSON.stringify(exported)));
 assert.equal(Object.hasOwn(storage,'apiKey'),false);assert.equal(Object.hasOwn(storage,'consentVersion'),false);assert.equal(Object.hasOwn(storage,'enabled'),false);
});
test('malformed, future, oversized and partial configurations are rejected before writes',()=>{
 assert.throws(()=>parseConfig('{'),/configInvalid/);assert.throws(()=>parseConfig(' '.repeat(configLimit+1)),/configSize/);
 for(const mutate of [d=>d.version=2,d=>d.language='fr',d=>delete d.platforms.x,d=>d.platforms.x.enabled='true',d=>d.platforms.x.labels[0].group='constructor',d=>d.platforms.x.labels[0].name='',d=>d.platforms.x.labels.push(d.platforms.x.labels[0])]){
  const data=exportConfig(drafts(),'en');mutate(data);assert.throws(()=>parseConfig(JSON.stringify(data)));
 }
});
test('six complete UI dictionaries preserve interpolation arguments and valid preset labels',()=>{
 const {languages,messages,translate}=FeedLensI18n;
 assert.equal(Object.keys(languages).length,6);
 for(const [key,values]of Object.entries(messages)){
  assert.equal(values.length,6,key);
  const expected=[...values[0].matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();
  for(const value of values){assert.ok(value.trim(),key);assert.deepEqual([...value.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),expected,key);}
 }
 for(const language of Object.keys(languages)){assert.equal(validateLabels(localizedDefaults(language)).length,29);assert.ok(translate(language,'labelCount',{count:5}).includes('5'));}
});
test('language selects fresh presets without rewriting stored custom labels',()=>{
 const saved={enabled:true,labels:[{id:'custom',group:'topic',name:'Mine',description:'My words'}]};
 for(const language of Object.keys(FeedLensI18n.languages)){
  assert.deepEqual(platformSettings({language,'platform:x':saved},'x'),saved);
  assert.deepEqual(platformSettings({language},'threads').labels,localizedDefaults(language));
 }
});
test('prototype-shaped IDs stay data while inherited groups are rejected',()=>{
 const label={id:'__proto__',group:'topic',name:'test',description:'Test classification criterion'};const body=requestBody({text:'test'},[label]);
 assert.equal(Object.getPrototypeOf(body.questions),null);assert.ok(Object.hasOwn(body.questions,'__proto__'));
 assert.throws(()=>validateLabels([{...label,group:'toString'}]));
});
test('empty descriptions cannot be imported or exported; maximum valid configuration round-trips',()=>{
 const drafts=new Map(Object.keys(platforms).map(id=>[id,{enabled:false,labels:Array.from({length:60},(_,i)=>({id:`l${i}`,group:'topic',name:'名'.repeat(30),description:'述'.repeat(400)}))}]));
 const exported=exportConfig(drafts,'zh');assert.deepEqual(parseConfig(JSON.stringify(exported,null,2)),exported);
 exported.platforms.weibo.labels[0].description='  ';
 assert.throws(()=>parseConfig(JSON.stringify(exported)),/descriptionRequired/);
 drafts.get('weibo').labels[0].description='';assert.throws(()=>exportConfig(drafts,'zh'),/descriptionRequired/);
});
