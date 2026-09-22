import './i18n.js';
const {t,resolve,setLanguage,languages}=FeedLensI18n;
let language=resolve(new URLSearchParams(location.search).get('lang'));
if(globalThis.chrome?.storage?.local){try{const state=await chrome.storage.local.get('language');language=resolve(state.language);}catch{}}
const select=document.getElementById('language');
for(const [value,name]of Object.entries(languages)){const option=document.createElement('option');option.value=value;option.textContent=name;select.append(option);}
function render(){setLanguage(language);select.value=language;document.documentElement.lang=language==='zh'?'zh-CN':language;document.title=t('privacyTitle');for(const node of document.querySelectorAll('[data-i18n]'))node.textContent=t(node.dataset.i18n);}
select.onchange=()=>{language=select.value;render();};render();
