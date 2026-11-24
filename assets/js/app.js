(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=$('#toolContent');
const tools={
 json:['DATA & FORMATTING','JSON formatter','Format, minify and validate JSON data.'],
 base64:['ENCODING','Base64 encoder / decoder','Encode text to Base64 or decode Base64 back to text.'],
 url:['ENCODING','URL encoder / decoder','Safely encode and decode URL components.'],
 jwt:['INSPECTION','JWT decoder','Inspect JSON Web Token header and payload without verifying its signature.'],
 uuid:['GENERATORS','UUID generator','Generate random UUID v4 identifiers in your browser.'],
 hash:['CRYPTOGRAPHY','Hash generator','Create SHA-1, SHA-256, SHA-384 or SHA-512 hashes with Web Crypto.'],
 timestamp:['CONVERSION','Timestamp converter','Convert Unix timestamps and readable dates.'],
 regex:['TESTING','Regex tester','Test a regular expression against sample text and inspect matches.'],
 html:['ENCODING','HTML entities','Encode special characters or decode HTML entities.'],
 color:['CONVERSION','Color converter','Convert HEX, RGB and HSL color representations.']
};
const state={tool:'json'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status=(msg,type='')=>{const el=$('#status',root);if(el){el.className='status '+type;el.textContent=msg}};
const field=(label,id,value='',type='text',hint='')=>'<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" value="'+esc(value)+'" '+(type==='number'?'step="any"':'')+'>'+(hint?'<small>'+hint+'</small>':'')+'</div>';
const area=(label,id,value='',hint='')=>'<div class="field"><label for="'+id+'">'+label+'</label><textarea id="'+id+'" spellcheck="false" placeholder="Paste or type here...">'+esc(value)+'</textarea>'+(hint?'<small>'+hint+'</small>':'')+'</div>';
const select=(label,id,opts)=>'<div class="field"><label for="'+id+'">'+label+'</label><select id="'+id+'">'+opts.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('')+'</select></div>';
const btn=(id,label,kind='')=>'<button class="btn '+kind+'" id="'+id+'">'+label+'</button>';
const actions=(html)=>'<div class="actions">'+html+'</div>';
const out=(id='output')=>'<div class="output-box" id="'+id+'" aria-live="polite"></div>';
const layout=(html)=>{root.innerHTML=html+'<div id="status" class="status" role="status" aria-live="polite"></div>'};
function render(){
 const [group,title,desc]=tools[state.tool];$('#toolGroup').textContent=group;$('#toolTitle').textContent=title;$('#toolDesc').textContent=desc;$('#toolCount').textContent=String(Object.keys(tools).indexOf(state.tool)+1).padStart(2,'0')+' / 10';
 $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tool===state.tool));
 ({json:json,base64:base64,url:url,jwt:jwt,uuid:uuid,hash:hash,timestamp:timestamp,regex:regex,html:html,color:color})[state.tool]();
}
function json(){
 layout('<div class="editor-grid"><div class="editor-pane"><div class="pane-head"><b>INPUT JSON</b><span>Paste your JSON</span></div><textarea class="editor" id="jsonInput" spellcheck="false" placeholder="{&#10;  &quot;name&quot;: &quot;DevKit&quot;,&#10;  &quot;active&quot;: true&#10;}"></textarea></div><div class="editor-pane"><div class="pane-head"><b>OUTPUT</b><span id="jsonOutputLabel">Formatted JSON</span></div><textarea class="editor" id="jsonOutput" spellcheck="false" readonly placeholder="Your result will appear here..."></textarea></div></div>'+actions(btn('jsonFormat','Format JSON')+btn('jsonMinify','Minify','secondary')+btn('jsonValidate','Validate','ghost')+btn('jsonCopy','Copy output','ghost'))+out('jsonStatus'));
 const run=min=>{try{const parsed=JSON.parse($('#jsonInput').value);$('#jsonOutput').value=JSON.stringify(parsed,null,min?0:2);$('#jsonOutputLabel').textContent=min?'Minified JSON':'Formatted JSON';status('Valid JSON. '+(min?'Minified':'Formatted')+' successfully.','success')}catch(e){status('Invalid JSON: '+e.message,'error')}};
 $('#jsonFormat').onclick=()=>run(false);$('#jsonMinify').onclick=()=>run(true);$('#jsonValidate').onclick=()=>{try{JSON.parse($('#jsonInput').value);status('Valid JSON. No syntax errors found.','success')}catch(e){status('Invalid JSON: '+e.message,'error')}};
 $('#jsonCopy').onclick=()=>copyText($('#jsonOutput').value);
}
function base64(){
 layout('<div class="segmented"><button class="mode active" data-mode="encode">Encode</button><button class="mode" data-mode="decode">Decode</button></div><div class="editor-grid"><div class="editor-pane"><div class="pane-head"><b>INPUT TEXT</b></div><textarea class="editor" id="b64Input" placeholder="Enter text or Base64..."></textarea></div><div class="editor-pane"><div class="pane-head"><b>RESULT</b></div><textarea class="editor" id="b64Output" readonly placeholder="Result will appear here..."></textarea></div></div>'+actions(btn('b64Run','Encode to Base64')+btn('b64Copy','Copy result','secondary')+btn('b64Swap','Use result as input','ghost'))+out());
 let mode='encode';$$('[data-mode]',root).forEach(b=>b.onclick=()=>{mode=b.dataset.mode;$$('[data-mode]',root).forEach(x=>x.classList.toggle('active',x===b));$('#b64Run').textContent=mode==='encode'?'Encode to Base64':'Decode Base64'});
 $('#b64Run').onclick=()=>{try{const v=$('#b64Input').value;$('#b64Output').value=mode==='encode'?btoa(unescape(encodeURIComponent(v))):decodeURIComponent(escape(atob(v.replace(/\s/g,''))));status('Conversion completed.','success')}catch(e){status('Could not convert input. Check the text and encoding.','error')}};
 $('#b64Copy').onclick=()=>copyText($('#b64Output').value);$('#b64Swap').onclick=()=>{$('#b64Input').value=$('#b64Output').value;$('#b64Output').value=''};
}
function url(){
 layout('<div class="segmented"><button class="mode active" data-mode="encode">Encode</button><button class="mode" data-mode="decode">Decode</button></div>'+area('Input','urlInput')+actions(btn('urlRun','Encode URL')+btn('urlCopy','Copy result','secondary')+btn('urlSwap','Use result as input','ghost'))+'<div class="field" style="margin-top:15px"><label for="urlOutput">Result</label><textarea class="editor" id="urlOutput" readonly></textarea></div>');
 let mode='encode';$$('[data-mode]',root).forEach(b=>b.onclick=()=>{mode=b.dataset.mode;$$('[data-mode]',root).forEach(x=>x.classList.toggle('active',x===b));$('#urlRun').textContent=mode==='encode'?'Encode URL':'Decode URL'});
 $('#urlRun').onclick=()=>{try{$('#urlOutput').value=mode==='encode'?encodeURIComponent($('#urlInput').value):decodeURIComponent($('#urlInput').value);status('Conversion completed.','success')}catch(e){status('Invalid encoded URL component.','error')}};$('#urlCopy').onclick=()=>copyText($('#urlOutput').value);$('#urlSwap').onclick=()=>{$('#urlInput').value=$('#urlOutput').value;$('#urlOutput').value=''};
}
function jwt(){
 layout(area('JSON Web Token','jwtInput','')+actions(btn('jwtDecode','Decode token')+btn('jwtCopy','Copy payload JSON','secondary'))+'<div class="tool-grid" style="margin-top:16px"><div><div class="pane-head"><b>HEADER</b></div><pre class="output-box" id="jwtHeader">Waiting for token...</pre></div><div><div class="pane-head"><b>PAYLOAD</b></div><pre class="output-box" id="jwtPayload">Waiting for token...</pre></div></div>'+out('jwtStatus')+'<p class="hint">Decoding does not verify the signature or establish trust. Do not use this tool to validate authentication tokens.</p>');
 $('#jwtDecode').onclick=()=>{try{const parts=$('#jwtInput').value.trim().split('.');if(parts.length!==3)throw Error('A JWT must contain three dot-separated parts.');const decode=s=>{const b=s.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(decodeURIComponent(escape(atob(b.padEnd(Math.ceil(b.length/4)*4,'=')))))};const h=decode(parts[0]),p=decode(parts[1]);$('#jwtHeader').textContent=JSON.stringify(h,null,2);$('#jwtPayload').textContent=JSON.stringify(p,null,2);status('Decoded successfully. Signature was not verified.','success')}catch(e){status('Unable to decode token: '+e.message,'error')}};$('#jwtCopy').onclick=()=>copyText($('#jwtPayload').textContent==='Waiting for token... '?'':$('#jwtPayload').textContent);
}
function uuid(){
 layout('<div class="tool-grid">'+field('Number of UUIDs','uuidCount','5','number','Generate between 1 and 100 identifiers.')+select('Format','uuidFormat',[['standard','Standard UUID v4'],['compact','Compact (no hyphens)']])+'</div>'+actions(btn('uuidGenerate','Generate UUIDs')+btn('uuidCopy','Copy all','secondary'))+out('uuidOutput'));
 const generate=()=>{const n=Math.max(1,Math.min(100,Math.floor(Number($('#uuidCount').value)||1))),compact=$('#uuidFormat').value==='compact';const values=Array.from({length:n},()=>{const id=crypto.randomUUID();return compact?id.replace(/-/g,''):id});$('#uuidOutput').textContent=values.join('\n');status(n+' UUID(s) generated.','success')};$('#uuidGenerate').onclick=generate;$('#uuidCopy').onclick=()=>copyText($('#uuidOutput').textContent);generate();
}
async function digest(algorithm,text){const bytes=new TextEncoder().encode(text);const hash=await crypto.subtle.digest(algorithm,bytes);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')}
function hash(){
 layout(area('Text to hash','hashInput')+'<div class="tool-grid" style="margin-top:14px">'+select('Algorithm','hashAlgorithm',[['SHA-256','SHA-256'],['SHA-1','SHA-1'],['SHA-384','SHA-384'],['SHA-512','SHA-512']])+'<div class="field"><label>Output encoding</label><input value="Hexadecimal" disabled></div></div>'+actions(btn('hashRun','Generate hash')+btn('hashCopy','Copy hash','secondary'))+out('hashOutput')+'<p class="hint">Uses the browser Web Crypto API. SHA-1 is included for compatibility and should not be used for security-sensitive new designs.</p>');
 $('#hashRun').onclick=async()=>{try{if(!crypto.subtle)throw Error('Web Crypto requires a secure context (HTTPS or localhost).');$('#hashRun').disabled=true;const v=await digest($('#hashAlgorithm').value,$('#hashInput').value);$('#hashOutput').textContent=v;status('Hash generated.','success')}catch(e){status(e.message,'error')}finally{$('#hashRun').disabled=false}};$('#hashCopy').onclick=()=>copyText($('#hashOutput').textContent);
}
function timestamp(){
 layout('<div class="tool-grid">'+field('Unix timestamp','tsInput',String(Math.floor(Date.now()/1000)),'number','Enter seconds or milliseconds.')+select('Timestamp unit','tsUnit',[['seconds','Seconds'],['milliseconds','Milliseconds']])+'</div>'+actions(btn('tsConvert','Convert timestamp')+btn('tsNow','Use current time','secondary'))+'<div class="result-card" id="tsResult"><small>Local date and time</small><b>—</b></div>'+out('tsStatus')+'<div class="field" style="margin-top:20px">'+field('Date/time to Unix timestamp','dateInput',new Date().toISOString().slice(0,16),'datetime-local')+'</div>'+actions(btn('dateConvert','Convert date'))+'<div class="result-card" id="dateResult"><small>Unix timestamp</small><b>—</b></div>');
 $('#tsConvert').onclick=()=>{const raw=Number($('#tsInput').value);if(!Number.isFinite(raw)){status('Enter a valid timestamp.','error');return}const ms=$('#tsUnit').value==='seconds'?raw*1000:raw,date=new Date(ms);if(Number.isNaN(date.getTime())){status('Timestamp is outside the supported date range.','error');return}$('#tsResult').innerHTML='<small>Local date and time</small><b>'+esc(date.toLocaleString())+'</b><small>UTC: '+esc(date.toISOString())+'</small>';status('Timestamp converted.','success')};
 $('#tsNow').onclick=()=>{$('#tsInput').value=Math.floor(Date.now()/($('#tsUnit').value==='seconds'?1000:1));$('#tsConvert').click()};
 $('#dateConvert').onclick=()=>{const d=new Date($('#dateInput').value);if(Number.isNaN(d.getTime())){status('Choose a valid date and time.','error');return}$('#dateResult').innerHTML='<small>Unix timestamp</small><b>'+Math.floor(d.getTime()/1000)+' seconds</b><small>'+d.getTime()+' milliseconds</small>'};
 $('#tsConvert').click();
}
function regex(){
 layout('<div class="tool-grid">'+field('Regular expression','regexPattern','\\b(dev|kit)\\b')+field('Flags','regexFlags','gi','text','Common flags: g, i, m, s, u')+'</div><div class="field" style="margin-top:14px">'+area('Test text','regexText','Build with DevKit. Ship your dev tools.')+'</div>'+actions(btn('regexRun','Test expression')+btn('regexClear','Clear matches','secondary'))+out('regexOutput')+'<p class="hint">Runs JavaScript regular expressions locally. Keep test input reasonably small; pathological patterns can be computationally expensive.</p>');
 $('#regexRun').onclick=()=>{try{const p=$('#regexPattern').value,f=$('#regexFlags').value,t=$('#regexText').value;if(p.length>500||t.length>50000)throw Error('Pattern limit is 500 characters and test text limit is 50,000 characters.');if(/[^dgimsuvy]/.test(f)||new Set(f).size!==f.length)throw Error('Invalid or duplicate regex flags.');const re=new RegExp(p,f.includes('g')?f:f+'g'),matches=[...t.matchAll(re)].slice(0,500);$('#regexOutput').textContent=matches.length?matches.map((m,i)=>(i+1)+'. "'+m[0]+'" at index '+m.index+(m.length>1?' · groups: '+m.slice(1).join(', '):'')).join('\n'):'No matches found.';status(matches.length+' match(es) found.','success')}catch(e){status('Regex error: '+e.message,'error')}};
 $('#regexClear').onclick=()=>{$('#regexOutput').textContent='';status('')};
}
function html(){
 layout('<div class="segmented"><button class="mode active" data-mode="encode">Encode entities</button><button class="mode" data-mode="decode">Decode entities</button></div><div class="editor-grid"><div class="editor-pane">'+area('Input','htmlInput')+'</div><div class="editor-pane"><div class="pane-head"><b>RESULT</b></div><textarea class="editor" id="htmlOutput" readonly></textarea></div></div>'+actions(btn('htmlRun','Encode HTML')+btn('htmlCopy','Copy result','secondary')+btn('htmlSwap','Use result as input','ghost')));
 let mode='encode';$$('[data-mode]',root).forEach(b=>b.onclick=()=>{mode=b.dataset.mode;$$('[data-mode]',root).forEach(x=>x.classList.toggle('active',x===b));$('#htmlRun').textContent=mode==='encode'?'Encode HTML':'Decode HTML'});
 $('#htmlRun').onclick=()=>{const v=$('#htmlInput').value;if(mode==='encode'){$('#htmlOutput').value=v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}else{const t=document.createElement('textarea');t.innerHTML=v;$('#htmlOutput').value=t.value}status('Conversion completed.','success')};
 $('#htmlCopy').onclick=()=>copyText($('#htmlOutput').value);$('#htmlSwap').onclick=()=>{$('#htmlInput').value=$('#htmlOutput').value;$('#htmlOutput').value=''};
}
function color(){
 layout('<div class="tool-grid">'+field('HEX color','colorHex','#6658e8')+field('RGB color','colorRgb','102, 88, 232')+field('HSL color','colorHsl','245, 75%, 63%')+ '<div class="field"><label for="colorPicker">Color picker</label><input id="colorPicker" type="color" value="#6658e8"></div></div><div class="color-preview" id="colorPreview"></div>'+actions(btn('colorConvert','Convert color')+btn('colorCopy','Copy HEX','secondary'))+out('colorStatus'));
 const hexToRgb=h=>{const x=h.replace(/^#/,'');if(!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(x))throw Error('Enter a valid 3- or 6-digit HEX color.');const s=x.length===3?x.split('').map(c=>c+c).join(''):x;return [parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)]};
 const rgbToHsl=(r,g,b)=>{r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0,s=0,l=(max+min)/2;if(d){s=d/(1-Math.abs(2*l-1));switch(max){case r:h=((g-b)/d)%6;break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}h*=60;if(h<0)h+=360}return [Math.round(h),Math.round(s*100),Math.round(l*100)]};
 const convert=()=>{try{const rgb=hexToRgb($('#colorHex').value),hex='#'+rgb.map(x=>x.toString(16).padStart(2,'0')).join(''),hsl=rgbToHsl(...rgb);$('#colorHex').value=hex;$('#colorRgb').value=rgb.join(', ');$('#colorHsl').value=hsl[0]+', '+hsl[1]+'%, '+hsl[2]+'%';$('#colorPicker').value=hex;$('#colorPreview').style.background=hex;status('Color values converted.','success')}catch(e){status(e.message,'error')}};
 $('#colorConvert').onclick=convert;$('#colorPicker').oninput=()=>{$('#colorHex').value=$('#colorPicker').value;convert()};$('#colorCopy').onclick=()=>copyText($('#colorHex').value);convert();
}
async function copyText(value){if(!value){status('There is nothing to copy.','error');return}try{await navigator.clipboard.writeText(value);status('Copied to clipboard.','success')}catch(e){status('Clipboard access was blocked by the browser. Select and copy the result manually.','error')}}
$('#toolNav').addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(!b)return;state.tool=b.dataset.tool;render();history.replaceState(null,'','#'+state.tool)});
$('#clearBtn').onclick=()=>render();
$('#themeToggle').onclick=()=>{document.body.classList.toggle('dark');try{localStorage.setItem('devkit-theme',document.body.classList.contains('dark')?'dark':'light')}catch(e){}};
try{if(localStorage.getItem('devkit-theme')==='dark')document.body.classList.add('dark')}catch(e){}
$('#year').textContent=new Date().getFullYear();if(tools[location.hash.slice(1)])state.tool=location.hash.slice(1);render();
})();