import test from 'node:test';
import assert from 'node:assert/strict';
import {platformSettings,platformFromUrl,settingsKey} from './platforms.js';
import {requestBody} from './core.js';
import {localizedDefaults} from './presets.js';
const defaults=localizedDefaults('en');
test('legacy custom labels and pause state remain exclusive to Weibo',()=>{
 const custom=[{id:'custom',group:'topic',name:'骑行',description:'自行车'}];
 const raw={labels:custom,enabled:false};
 assert.deepEqual(platformSettings(raw,'weibo'),{labels:custom,enabled:false});
 assert.deepEqual(platformSettings(raw,'threads'),{labels:defaults,enabled:false});
});
test('each platform keeps independent labels including an intentionally empty list',()=>{
 const raw={'platform:threads':{labels:[],enabled:false}};
 assert.deepEqual(platformSettings(raw,'threads'),{labels:[],enabled:false});
 const weibo=platformSettings(raw,'weibo');weibo.labels[0].name='Changed';
 assert.equal(platformSettings(raw,'weibo').labels[0].name,defaults[0].name);
 assert.notEqual(settingsKey('weibo'),settingsKey('threads'));
});
test('host detection rejects lookalikes and non-HTTPS URLs',()=>{
 assert.equal(platformFromUrl('https://www.threads.com/@user/post/123'),'threads');
 assert.equal(platformFromUrl('https://threads.net/'),'threads');
 assert.equal(platformFromUrl('https://weibo.com/'),'weibo');
 for(const u of ['https://threads.com.attacker.test','https://evil.test/threads.com','http://threads.com/'])assert.equal(platformFromUrl(u),null);
});
test('platform is part of the classification request so caches cannot cross platforms',()=>{
 const w=requestBody({text:'same',platform:'weibo'},defaults);
 const t=requestBody({text:'same',platform:'threads'},defaults);
 assert.notDeepEqual(w,t);assert.equal(t.state.platform,'threads');
});
test('X has independent defaults and recognizes current and legacy hosts',()=>{
 for(const host of ['x.com','www.x.com','twitter.com','www.twitter.com'])assert.equal(platformFromUrl(`https://${host}/home`),'x');
 assert.equal(platformFromUrl('https://x.com.evil.test/home'),null);
 const raw={labels:[],enabled:false,'platform:threads':{labels:[],enabled:false}};
 assert.deepEqual(platformSettings(raw,'x'),{labels:defaults,enabled:false});
 raw['platform:x']={labels:[],enabled:false};
 assert.deepEqual(platformSettings(raw,'x'),{labels:[],enabled:false});
 assert.notEqual(settingsKey('x'),settingsKey('threads'));
});

test('fresh profiles start with all platforms paused; saved switches remain unchanged',()=>{
 for(const platform of ['weibo','threads','x']){
  assert.equal(platformSettings({},platform).enabled,false);
  assert.equal(platformSettings({[settingsKey(platform)]:{enabled:true}},platform).enabled,true);
 }
});
