import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,validateLabels,requestBody,parseAnswers} from './core.js';
test('29 preset labels have unique IDs across two groups',()=>{assert.equal(validateLabels(defaults).length,29);assert.equal(defaults.filter(l=>l.group==='topic').length,14);});
test('custom labels can be renamed, added, deleted; request keeps exact IDs',()=>{const labels=[{id:'custom',group:'topic',name:'骑行',description:'自行车骑行'}];assert.deepEqual(Object.keys(requestBody({text:'骑自行车'},labels).questions),['custom']);});
test('invalid taxonomy rejected',()=>{assert.throws(()=>validateLabels([...defaults,defaults[0]]));assert.throws(()=>validateLabels([{id:'x',name:'',group:'topic',description:''}]));});
test('content is data, bounded to 12000 characters',()=>{const b=requestBody({text:'x'.repeat(13000)},defaults);assert.equal(b.state.text.length,12000);assert.equal(b.model,'jev-latest');assert.equal(Object.keys(b.questions).length,29);});
test('incomplete or malformed API output is not silently classified',()=>{assert.throws(()=>parseAnswers({answers:{}},defaults));assert.throws(()=>parseAnswers({answers:{t0:{type:'noul',noul:2}}},[defaults[0]]));assert.equal(parseAnswers({answers:{t0:{type:'noul',noul:0.8}}},[defaults[0]])[0].score,0.8);});
test('display limit stays 30 and description is required with a 400 character limit',()=>{
 const label={id:'custom',group:'topic',name:'名'.repeat(30),description:'述'.repeat(400)};
 assert.equal(validateLabels([label])[0],label);
 for(const description of ['', ' \n\t'])assert.throws(()=>validateLabels([{...label,description}]),/descriptionRequired/);
 assert.throws(()=>validateLabels([{...label,description:'x'.repeat(401)}]),/labelInvalid/);
 assert.throws(()=>validateLabels([{...label,name:'x'.repeat(31)}]),/labelInvalid/);
 const labels=Array.from({length:60},(_,i)=>({...label,id:`l${i}`}));
 assert.equal(validateLabels(labels).length,60);
 assert.throws(()=>validateLabels([...labels,{...label,id:'extra'}]),/labelLimit/);
});
test('request preflight bounds combined questions and longest-question context',()=>{
 assert.doesNotThrow(()=>requestBody({text:'正文'},defaults));
 assert.throws(()=>requestBody({text:'文'.repeat(12000)},[defaults[0]]),/requestSize/);
 const labels=Array.from({length:60},(_,i)=>({...defaults[0],id:`l${i}`,description:'文'.repeat(400)}));
 assert.throws(()=>requestBody({text:'short'},labels),/requestSize/);
});
