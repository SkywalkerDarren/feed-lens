import test from 'node:test';
import assert from 'node:assert/strict';
import {createTransport} from './transport.js';
function fixture(statuses){
 let time=0;const calls=[];const waits=[];
 const request=createTransport({now:()=>time,random:()=>0,sleep:async ms=>{waits.push(ms);time+=ms;},fetchImpl:async(url,opts)=>{
  calls.push({time,body:JSON.parse(opts.body)});
  const value=statuses.shift();if(value instanceof Error)throw value;
  return new Response(JSON.stringify({answers:{}}),{status:value?.status??value,headers:value?.headers});
 }});
 return {request,calls,waits};
}
test('503 retries with independent backoff',async()=>{
 const f=fixture([503,503,200]);await f.request({post:1},'test');
 assert.deepEqual(f.calls.map(c=>c.time),[0,2000,6000]);
});
test('8 requests start concurrently and the ninth waits for a slot',async()=>{
 const releases=[];let calls=0;
 const request=createTransport({fetchImpl:()=>{calls++;return new Promise(resolve=>releases.push(()=>resolve(new Response('{}'))));}});
 const jobs=Array.from({length:9},()=>request({},'test'));
 await new Promise(r=>setImmediate(r));assert.equal(calls,8);
 releases.shift()();await new Promise(r=>setImmediate(r));assert.equal(calls,9);
 releases.splice(0).forEach(release=>release());await Promise.all(jobs);
});
test('one retrying post does not block a healthy post',async()=>{
 let wake;let attempts=0;let time=0;
 const request=createTransport({now:()=>time,random:()=>0,sleep:ms=>new Promise(r=>{wake=()=>{time+=ms;r();};}),fetchImpl:async(url,opts)=>new Response('{}',{status:JSON.parse(opts.body).bad&&++attempts===1?503:200})});
 const bad=request({bad:true},'test');await new Promise(r=>setImmediate(r));
 await request({bad:false},'test');assert.equal(attempts,1);wake();await bad;
});
test('Retry-After seconds and HTTP date are respected',async()=>{
 for(const value of ['10','Thu, 01 Jan 1970 00:00:10 GMT']){
  const f=fixture([{status:429,headers:{'Retry-After':value}},200]);
  await f.request({},'test');assert.equal(f.calls[1].time,10000);
 }
});
test('exhausted 503 remains an error without delaying the next post',async()=>{
 const f=fixture([503,503,503,503,200]);
 await assert.rejects(f.request({},'test'),/retriesExhausted/);
 await f.request({},'test');assert.equal(f.calls.length,5);assert.equal(f.calls[4].time,14000);
});
test('authentication failure is not retried and does not block subsequent work',async()=>{
 const f=fixture([401,200]);await assert.rejects(f.request({},'test'),/badKey/);
 await f.request({},'test');assert.equal(f.calls.length,2);
});
test('network timeout and gateway errors recover',async()=>{
 const f=fixture([new Error('timeout'),502,504,200]);await f.request({},'test');assert.equal(f.calls.length,4);
});
test('settings are rechecked after backoff before sending another request',async()=>{
 const f=fixture([503,200]);let checks=0;
 await assert.rejects(f.request({},'test',async()=>{if(++checks===2)throw Error('设置已变更');}),/设置已变更/);
 assert.equal(f.calls.length,1);
});
test('progress distinguishes queue, request and actual 529 backoff',async()=>{
 const f=fixture([529,200]);const states=[];
 await f.request({},'test',async()=>{},s=>states.push(s));
 assert.deepEqual(states.map(s=>s.phase),['queued','request','retry','request']);
 assert.equal(states[2].reason,'busy');assert.equal(states[2].status,529);assert.equal(states[2].attempt,2);
});
test('stalled response body times out and releases the concurrent slot',async()=>{
 let calls=0;
 const request=createTransport({concurrency:1,budgetMs:15,attemptMs:15,fetchImpl:async()=>++calls===1?{ok:true,json:()=>new Promise(()=>{})}:new Response('{}')});
 const first=request({},'test');const next=request({},'test');
 await assert.rejects(first,/waitLimit/);assert.deepEqual(await next,{});
});
test('queued requests expire without being sent',async()=>{
 let calls=0;
 const request=createTransport({concurrency:1,budgetMs:30,attemptMs:30,queueMs:5,fetchImpl:async()=>{calls++;return new Promise(()=>{});}});
 const first=request({},'test');const checked=assert.rejects(first,/waitLimit/);
 await assert.rejects(request({},'test'),/queueTimeout/);await checked;assert.equal(calls,1);
});
test('Retry-After beyond remaining budget stops without an early retry',async()=>{
 const f=fixture([{status:529,headers:{'Retry-After':'60'}}]);
 await assert.rejects(f.request({},'test'),/waitLimit/);assert.equal(f.calls.length,1);
});
