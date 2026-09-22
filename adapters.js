(()=>{
 function text(nodes){return [...new Set(nodes.map(n=>n.innerText.trim()).filter(Boolean))].join('\n\n[转发原文或附言]\n').slice(0,12000);}
 const weibo={id:'weibo',hosts:['weibo.com','www.weibo.com'],scan(){
  return [...new Set([...document.querySelectorAll('article [class*="wbtext"]')].map(n=>n.closest('article')))].map(card=>({
   card,target:card.querySelector('header [class*="_nick_"]')||card.querySelector('header a[usercard]')?.parentElement,
   text:text([...card.querySelectorAll('[class*="wbtext"]')])
  }));
 }};
 function threadParts(card){
  // Timestamp permalink identifies the outer post, excluding media/profile links.
  const time=[...card.querySelectorAll('a[href*="/post/"]')].find(a=>a.querySelector('time')&&a.closest('[data-pressable-container="true"]')===card);
  if(!time)return null;
  const path=new URL(time.href,location.href).pathname;
  const profile=path.split('/post/')[0];
  const author=[...card.querySelectorAll('a[href]')].find(a=>new URL(a.href,location.href).pathname===profile&&!a.querySelector('img')&&a.textContent.trim());
  if(!author)return null;
  let row=author.parentElement;
  while(row&&row!==card&&!row.contains(time))row=row.parentElement;
  if(!row||row===card)return null;
  // Pick text blocks outside the author row and controls. Avoid double-counting
  // nested dir=auto spans and including quoted cards as the author's own words.
  const nodes=[...card.querySelectorAll('[dir="auto"]')].filter(n=>
   !row.contains(n)&&!n.closest('button,[role="button"],a,time,[contenteditable="true"],feed-lens-labels')&&
   n.closest('[data-pressable-container="true"]')===card&&
   !n.parentElement.closest('[dir="auto"]')
  );
  return {card,target:row,text:text(nodes),id:path};
 }
 const threads={id:'threads',hosts:['threads.com','www.threads.com','threads.net','www.threads.net'],scan(){
  if(/^\/(messages|activity|insights)(\/|$)/.test(location.pathname))return [];
  return [...document.querySelectorAll('[data-pressable-container="true"]')].map(threadParts).filter(Boolean);
 }};
 const x={id:'x',hosts:['x.com','www.x.com','twitter.com','www.twitter.com'],scan(){
  if(/^\/(messages|i\/chat|i\/grok|settings|compose)(\/|$)/.test(location.pathname))return [];
  return [...document.querySelectorAll('article[data-testid="tweet"]')].map(card=>{
   const owner=node=>node.closest('article[data-testid="tweet"]')===card;
   const target=[...card.querySelectorAll('[data-testid="User-Name"]')].find(owner);
   const nodes=[...card.querySelectorAll('[data-testid="tweetText"]')].filter(n=>owner(n)&&!n.closest('[contenteditable="true"]'));
   return {card,target,text:text(nodes)};
  });
 }};
 globalThis.FeedLensAdapters={weibo,threads,x};
})();
