export class TransportError extends Error{constructor(code,params={}){super(code);this.params=params;}}
// One scheduler is shared by all tabs in this service worker.
export function createTransport({fetchImpl=fetch,sleep=ms=>new Promise(r=>setTimeout(r,ms)),now=Date.now,random=Math.random,concurrency=8,budgetMs=45000,attemptMs=20000,queueMs=60000}={}){
 let active=0;const queue=[];
 if(!Number.isInteger(concurrency)||concurrency<1)throw Error('Invalid concurrency');
 const transient=new Set([408,429,500,502,503,504,529]);
 function delay(response,attempt){
  const value=response?.headers.get('Retry-After');
  const seconds=value===null||value===undefined?NaN:Number(value);
  const server=Number.isFinite(seconds)?seconds*1000:Date.parse(value)-now();
  return Math.min(60000,Math.max(2000*2**attempt+random()*500,Number.isFinite(server)?server:0));
 }
 async function perform(body,apiKey,check,progress){
  const deadline=now()+budgetMs;
  for(let attempt=0;attempt<4;attempt++){
   await check();
   const remaining=deadline-now();
   if(remaining<=0)throw new TransportError('budget');
   progress({phase:'request',attempt:attempt+1});
   const controller=new AbortController();
   let timer,response,data,networkError;
   try{
    data=await Promise.race([
     (async()=>{
      response=await fetchImpl('https://api.typesafe.ai/v1/systemone',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
      // Body download and JSON parsing are covered by the same timeout.
      if(response.ok)return await response.json();
      response.body?.cancel().catch(()=>{});
     })(),
     new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('timeout'));},Math.min(attemptMs,remaining));})
    ]);
   }catch{networkError=true;}finally{clearTimeout(timer);}
   if(!networkError&&response.ok)return data;
   const reason=networkError?'networkError':'busy',status=response?.status;
   if(!networkError&&!transient.has(response.status))throw new TransportError(({401:'badKey',403:'forbidden'})[response.status]||'apiError',{status});
   if(attempt===3)throw new TransportError('retriesExhausted',{reason,status});
   const waitMs=delay(networkError?null:response,attempt);
   if(now()+waitMs>=deadline)throw new TransportError('waitLimit',{reason,status});
   progress({phase:'retry',attempt:attempt+2,reason,status,waitMs});
   await sleep(waitMs);
  }
 }
 function drain(){
  while(active<concurrency&&queue.length){
   const job=queue.shift();clearTimeout(job.timer);active++;
   perform(job.body,job.apiKey,job.check,job.progress).then(job.resolve,job.reject).finally(()=>{active--;drain();});
  }
 }
 return (body,apiKey,check=async()=>{},onProgress=()=>{})=>new Promise((resolve,reject)=>{
  const progress=state=>{try{onProgress(state);}catch{}};
  const job={body,apiKey,check,progress,resolve,reject};
  progress({phase:'queued'});
  job.timer=setTimeout(()=>{const i=queue.indexOf(job);if(i>=0){queue.splice(i,1);reject(new TransportError('queueTimeout'));}},queueMs);
  queue.push(job);drain();
 });
}
