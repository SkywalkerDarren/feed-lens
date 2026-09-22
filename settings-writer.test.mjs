import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlatformWriter} from './settings-writer.js';
function fixture(){
 const state={'platform:weibo':{enabled:false,labels:[{id:'saved',name:'Saved'}]}};
 let fail=false;
 const storage={get:async()=>structuredClone(state),set:async patch=>{if(fail){fail=false;throw Error('write failed');}Object.assign(state,structuredClone(patch));}};
 return {state,write:createPlatformWriter(storage),fail:()=>fail=true};
}
test('toggle preserves persisted labels, not the unsaved editor draft',async()=>{
 const {state,write}=fixture();await write('weibo',{enabled:true});
 assert.deepEqual(state['platform:weibo'],{enabled:true,labels:[{id:'saved',name:'Saved'}]});
});
test('overlapping label and toggle writes retain both changes',async()=>{
 const {state,write}=fixture();const labels=[{id:'new',name:'New'}];
 await Promise.all([write('weibo',{labels}),write('weibo',{enabled:true})]);
 assert.deepEqual(state['platform:weibo'],{enabled:true,labels});
 await Promise.all([write('weibo',{enabled:false}),write('weibo',{labels:[]})]);
 assert.deepEqual(state['platform:weibo'],{enabled:false,labels:[]});
});
test('failed storage operation does not poison subsequent saves',async()=>{
 const {state,write,fail}=fixture();fail();await assert.rejects(write('weibo',{enabled:true}));
 await write('weibo',{enabled:true});assert.equal(state['platform:weibo'].enabled,true);
});
test('snapshot is isolated and platform changes do not overwrite another platform',async()=>{
 const {state,write}=fixture();const labels=[{id:'x',name:'X'}];const pending=write('x',{labels});labels[0].name='unsaved';await pending;
 assert.equal(state['platform:x'].labels[0].name,'X');assert.equal(state['platform:weibo'].labels[0].name,'Saved');
});
test('confirmed import follows pending writes and remains authoritative',async()=>{
 const {state,write}=fixture();
 await Promise.all([write('weibo',{enabled:true}),write.replace({'platform:weibo':{enabled:false,labels:[]}})]);
 assert.deepEqual(state['platform:weibo'],{enabled:false,labels:[]});
});
test('first toggle does not freeze localized defaults before labels are saved',async()=>{
 const state={language:'en'};
 const storage={get:async()=>structuredClone(state),set:async patch=>Object.assign(state,patch)};
 const write=createPlatformWriter(storage);
 await write('weibo',{enabled:true});
 assert.deepEqual(state['platform:weibo'],{enabled:true});
 const {platformSettings}=await import('./platforms.js');
 state.language='zh';assert.equal(platformSettings(state,'weibo').labels[0].name,'科技数码');
});
