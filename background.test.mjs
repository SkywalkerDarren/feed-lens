import test from 'node:test';
import assert from 'node:assert/strict';
test('background derives platform from sender and isolates requests and cache',async()=>{
 const raw={apiKey:'test-only',labels:[{id:'old',group:'topic',name:'微博',description:'Test classification criterion'}],
  'platform:threads':{enabled:true,labels:[{id:'new',group:'topic',name:'Threads',description:'Test classification criterion'}]}};
 let handler;const calls=[];
 globalThis.chrome={storage:{local:{setAccessLevel:async()=>{},get:async()=>raw},onChanged:{addListener(){}}},runtime:{id:'test-extension',getURL:p=>`chrome-extension://test-extension/${p}`,onMessage:{addListener:fn=>handler=fn}},tabs:{sendMessage:async()=>{}}};
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async(url,opts)=>{const body=JSON.parse(opts.body);calls.push(body);return new Response(JSON.stringify({answers:Object.fromEntries(Object.keys(body.questions).map(id=>[id,{type:'noul',noul:.9}]))}));};
 try{
  await import('./background.js');
  const send=(url,platform)=>new Promise(resolve=>handler({type:'classify',platform,post:{text:'same text'}},{id:'test-extension',url},resolve));
  const weibo=await send('https://weibo.com/','threads');
  const threads=await send('https://www.threads.com/','weibo');
  assert.equal(weibo.data.labels[0].id,'old');assert.equal(threads.data.labels[0].id,'new');
  assert.deepEqual(calls.map(c=>c.state.platform),['weibo','threads']);
  await send('https://www.threads.com/','threads');assert.equal(calls.length,2);
  raw['platform:threads'].enabled=false;
  assert.equal((await send('https://www.threads.com/','threads')).ok,false);assert.equal(calls.length,2);
  const testMessage=url=>new Promise(resolve=>handler({type:'test',platform:'threads'},{id:'test-extension',url},resolve));
  assert.equal((await testMessage('https://www.threads.com/')).ok,false);assert.equal(calls.length,2);
  assert.equal((await testMessage('chrome-extension://test-extension/options.html')).ok,true);assert.equal(calls.length,3);
  raw.apiKey='';
  assert.equal((await testMessage('chrome-extension://test-extension/options.html')).ok,false);assert.equal(calls.length,3);
  let replied=false;handler({type:'classify'},{id:'test-extension',url:'https://threads.com.evil.test/'},()=>replied=true);assert.equal(replied,false);
 }finally{globalThis.fetch=originalFetch;delete globalThis.chrome;}
});
