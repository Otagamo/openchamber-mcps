"use strict";(()=>{var w="openchamber.sdk";var gt="data-oc-scrolling",Lt=`
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${gt}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${gt}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${gt}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${gt}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function Gt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",r=>{let s=r.target===e?t:r.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let l=o.get(s);l!==void 0&&clearTimeout(l),o.set(s,setTimeout(()=>{o.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var xn=`(${Gt.toString()})(document);`;var Zo=/^[a-z][a-z0-9-]{0,39}$/;var Yo=e=>Object(e)===e&&!Array.isArray(e),Pt=(e,t)=>Object.keys(e).every(o=>t.includes(o)),qo=e=>String(e)===e&&e.length>=1&&e.length<=60,Qo=e=>String(e)===e&&e.length>=1&&e.length<=80,er=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!Yo(o)||!Zo.test(o.id)||!qo(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!Pt(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!Pt(o,["kind","id","label","value","options","disabled"])||!Qo(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let r=new Set;for(let s of o.options){if(!Yo(s)||!Pt(s,["value","label"])||!Qo(s.value)||!qo(s.label)||r.has(s.value))return!1;r.add(s.value)}if(!r.has(o.value))return!1}return!0};var Nt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,tr=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var or=/^[A-Za-z0-9_-]{1,80}$/;var rr=["left","right","top","bottom"];var nr=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let r=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of r)if(!nr(s,t+1,o))return!1;return!0},$t=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every($t);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every($t)}return String(e)===e||Number.isFinite(e)},Dt=e=>{try{return String(e.id)!==e.id||!or.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!rr.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!nr(e.data)||!$t(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var ir=["file","directory","other","missing"],Ft=e=>!!(e&&"sessionId"in e),Xt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var ar=/^[0-9a-f]{7,64}$/i,Bt=e=>ar.test(e),ht=500,bt=32e3,cr=16e3,lr=128,dr=200,pr=2e3,ur=16e3,mr=80,fr=200,gr=16e3;var hr=2e3;var zt=2e4,Et=1024,xt=2e6;var vt=64e3,St=8e3,Vt=4e3;var jt=96e4,vn=60*6e4;var br=999,Er=1e4,it=500,xr=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],vr=["stopped","starting","ready","failed"],Sn=new Set(xr),Sr=e=>Sn.has(e),_r=e=>e&&Sr(e)?e:"HOST_REJECTED",Ve=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Ve):Object(e)===e?Object.values(e).every(Ve):!1,Tr=e=>Ve(e)&&JSON.stringify(e).length<=gr,sr=e=>e?.trim().slice(0,fr)??"",je=e=>{let t=e.id.trim().slice(0,lr),o=e.title.trim().slice(0,dr),r=e.url.trim().slice(0,pr),s=e.text?.trim().slice(0,ur),l=e.author?.trim().slice(0,mr),c=e.kind==="pull"?"pull":"issue",p={providerId:e.providerId.trim(),id:t,title:o||t,url:r,kind:c};if(s&&(p.text=s),l&&(p.author=l),c==="pull"){let v=sr(e.branches?.head),m=sr(e.branches?.base);v&&m&&(p.branches={head:v,base:m})}return Tr(e.data)&&(p.data=e.data),p},Kt=e=>{let t=je(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Wt=e=>{let t={text:e.text.trim().slice(0,cr)};return e.send&&(t.send=!0),t},Jt=e=>e===null||!Number.isFinite(e)?null:Math.min(br,Math.max(0,Math.round(e))),Yt=e=>Number.isFinite(e)?Math.min(Er,Math.max(0,Math.ceil(e))):0;var Ke=e=>e.length>0&&e.length<=Et&&!e.includes("\0")&&!e.includes("\\");var _t=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>hr?!1:!e.split("/").some(o=>o==="."||o===".."),_n=new Set(vr),qt=e=>!!(e&&"status"in e&&_n.has(String(e.status))&&!("body"in e)),Tt=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Qt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Zt=e=>!!(e&&"written"in e&&e.written===!0),eo=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Tn=new Set(ir),to=e=>!!(e&&"kind"in e&&"size"in e&&Tn.has(String(e.kind))&&Number.isFinite(e.size)),oo=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),yn=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),kn=e=>Object(e)===e?e:null,Ht=e=>String(e)===e&&e.length>0,An=e=>{if(!Ht(e.id))return null;if(e.ok===!0){let t={channel:w,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&Ht(e.error)?{channel:w,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:_r(Ht(e.code)?e.code:void 0)}:null},ro=e=>{let t=kn(e);return!t||t.channel!==w||t.v!==1?null:t.type==="result"?An(t):!yn.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var yr=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,wn=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",E=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},kr=()=>Promise.reject(new E("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),yt=()=>Promise.reject(new E("BAD_PATH",`File path must be 1 to ${Et} characters without NUL or backslash.`)),kt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new E("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},y=e=>(e.value+=1,`oc-${e.value}`),co=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new E("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(n=>n===t.parent),r=e.requestTimeoutMs??zt,s=new Set,l=new Set,c=new Set,p=new Set,v=new Set,m=new Set,h=new Set,S=new Set,G=new Set,P=new Set,J=[],k=null,$=null,C=new Set,pe=new Set,ce=null,Ne=null,ze=!1,we=new Map,Oe=new Map,Re=new Map,ue=!1,_={value:0},x=null,T=null,B=!1,st=!1,$o=null,Do=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,me=n=>{t.parent.postMessage(n,"*")},Ho=()=>{ue||t.parent===t||P.size===0||x?.features?.lateGenerateResults!==!0||me({channel:w,v:1,type:"generate-late-listen"})},F=(n,i)=>{for(let f of n)try{f(i)}catch(b){console.error(b)}},Fo=n=>{if(!(n instanceof MessageEvent)||!o(n.source))return;let i=ro(n.data);if(!i)return;if(i.type==="workspace"){let b=Oe.get(i.payload.subscriptionId);b&&F([b],i.payload.snapshot);return}if(i.type==="shells"){let b=Re.get(i.payload.subscriptionId);b&&F([b],i.payload.snapshot);return}if(i.type==="ready"){x=i.payload,T=Do(i.payload.session),F(s,i.payload),F(l,i.payload.directory),F(c,i.payload.session),T&&F(p,T),F(v,i.payload.connection),F(m,i.payload.settings),F(h,i.payload.item),Ho();return}if(i.type==="generate-late"){P.size===0?J.push(i.payload):F(P,i.payload);return}if(i.type==="directory"){x&&(x={...x,directory:i.payload.directory}),F(l,i.payload.directory);return}if(i.type==="session"){x&&(x={...x,session:i.payload.session}),i.payload.session?T?.sessionId!==i.payload.session.id&&(T=Do(i.payload.session)):T=null,F(c,i.payload.session);return}if(i.type==="session-lifecycle"){T=i.payload,F(p,i.payload);return}if(i.type==="connection"){x&&(x={...x,connection:i.payload.connection}),F(v,i.payload.connection);return}if(i.type==="settings"){x&&(x={...x,settings:i.payload.settings}),F(m,i.payload.settings);return}if(i.type==="item"){x&&(x={...x,item:i.payload.item}),F(h,i.payload.item);return}if(i.type==="status-control-event"){F(S,i.payload);return}if(i.type==="popover-closed"){F(G,i.payload);return}if(i.type==="action"){let b=U=>{ue||me({channel:w,v:1,type:"action-result",id:i.id,payload:U})},N=$;if(!N){b({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>N(i.payload)).then(()=>b({ok:!0}),U=>{let j=(U instanceof Error?U.message:String(U)).trim();b({ok:!1,error:(j||"Action failed.").slice(0,it)})});return}if(i.type==="file-open"){let b=i.payload;if(Ne&&tr(Ne,b))return;Ne=b,F(C,i.payload);return}if(i.type==="file-saved"){F(pe,i.payload.version);return}if(i.type==="file-snapshot"){let b=j=>{ue||me({channel:w,v:1,type:"file-snapshot-result",id:i.id,payload:j})},N=j=>b({error:(j.trim()||"Could not read the edited file.").slice(0,it)}),U=ce;if(!U){N("This extension does not edit files.");return}Promise.resolve().then(()=>U(i.payload.purpose)).then(j=>{if(Nt(j)>2e7){N(`The file is over ${2e7} ${"bytes"in j?"bytes":"characters"}.`);return}if(j.version.length>256){N(`The snapshot version is over ${256} characters.`);return}b({snapshot:"bytes"in j?{bytes:j.bytes,version:j.version}:{content:j.content,version:j.version}})},j=>N(j instanceof Error?j.message:String(j)));return}if(i.type==="resolve"){let b=U=>{me({channel:w,v:1,type:"resolve-result",id:i.id,payload:U})},N=k;if(!N){b({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>N(i.payload)).then(U=>b({item:U?je(U):null}),U=>{let j=(U instanceof Error?U.message:String(U)).trim();b({error:(j||"Command failed.").slice(0,it)})});return}let f=we.get(i.id);if(f){if(clearTimeout(f.timer),we.delete(i.id),i.ok){f.resolve(i.payload);return}f.reject(new E(i.code,i.error))}};t.addEventListener("message",Fo),me({channel:w,v:1,type:"hello"});let ee=(n,i=r)=>ue||t.parent===t?Promise.reject(new E("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((f,b)=>{let N=setTimeout(()=>{we.delete(n.id),b(new E("HOST_TIMEOUT","Host did not answer in time."))},i);we.set(n.id,{resolve:f,reject:b,timer:N}),me(n)}),z=n=>ee(n).then(()=>{}),V={channel:w,v:1},Ct=n=>{!ue&&t.parent!==t&&me(n)},Xo=()=>Ct({...V,type:"file-save"}),Bo=n=>{!yr(n)||!wn(n)||(n.preventDefault(),Xo())},zo=n=>{!yr(n)||n.key!=="Escape"||x?.surface!=="popover"||!x.popover||(n.preventDefault(),Wo(x.popover.id,"escape").catch(()=>{}))},ut=()=>{let n=x?.surface==="popover"?x.popover:void 0;if(!n)return;let i=B||st;$o!==i&&($o=i,Jo(n.id,i).catch(()=>{}))},mt=()=>{x?.surface!=="popover"||B||(B=!0,ut())},Vo=n=>{x?.surface!=="popover"||n.relatedTarget!==null||!B||(B=!1,ut())},jo=()=>{x?.surface!=="popover"||st||(st=!0,ut())},Ko=()=>{x?.surface!=="popover"||!st||(st=!1,ut())},be=(n,i=1024)=>{if(!n.trim()||n.length>i)throw new E("HOST_REJECTED",`Identity must contain 1 to ${i} characters.`)},Ut=async n=>{n.kind!=="projects"&&be(n.projectId);let i=await ee({...V,type:"workspace-read",id:y(_),payload:n});if(!i||!("kind"in i)||!("state"in i)||i.kind!==n.kind)throw new E("HOST_REJECTED","Host did not return workspace data.");return i},Mt=async(n,i)=>{n.kind!=="projects"&&be(n.projectId);let f=y(_);Oe.set(f,i);try{await z({...V,type:"workspace-subscribe",id:y(_),payload:{subscriptionId:f,query:n}})}catch(b){throw Oe.delete(f),ue||me({...V,type:"workspace-unsubscribe",id:y(_),payload:{subscriptionId:f}}),b}return()=>{!Oe.delete(f)||ue||me({...V,type:"workspace-unsubscribe",id:y(_),payload:{subscriptionId:f}})}},En=async(n,i)=>{n.kind==="session"&&be(n.sessionId),n.kind==="project"&&be(n.projectId);let f=y(_);Re.set(f,i);try{await z({...V,type:"shells-subscribe",id:y(_),payload:{subscriptionId:f,scope:n}})}catch(b){throw Re.delete(f),ue||me({...V,type:"shells-unsubscribe",id:y(_),payload:{subscriptionId:f}}),b}return()=>{!Re.delete(f)||ue||me({...V,type:"shells-unsubscribe",id:y(_),payload:{subscriptionId:f}})}},ft=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new E("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!Ve(n.value))throw new E("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new E("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&x?.features?.deviceStorage!==!0)throw new E("UNSUPPORTED","This host does not support device storage.");let i=await ee({...V,type:"storage",id:y(_),payload:n});if(!i||!("storage"in i)||i.op!==n.op)throw new E("HOST_REJECTED","Host did not return storage data.");return i},Wo=(n,i)=>x?.features?.popovers!==!0&&!(x?.surface==="popover"&&x.popover?.id===n)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):z({...V,type:"popover-close",id:y(_),payload:i?{id:n,reason:i}:{id:n}}),Jo=(n,i)=>x?.features?.popovers!==!0&&!(x?.surface==="popover"&&x.popover?.id===n)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):z({...V,type:"popover-anchor",id:y(_),payload:{id:n,active:i}});return t.addEventListener("keydown",zo,!0),t.addEventListener("pointerover",mt),t.addEventListener("pointermove",mt),t.addEventListener("pointerout",Vo),t.addEventListener("focus",jo),t.addEventListener("blur",Ko),{onAction:n=>($=n,()=>{$===n&&($=null)}),listProjects:async()=>{let n=await Ut({kind:"projects"});if(n.kind!=="projects")throw new E("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let i=await Ut({kind:"worktrees",projectId:n});if(i.kind!=="worktrees")throw new E("HOST_REJECTED","Expected worktrees.");return i},listSessions:async n=>{let i=await Ut({kind:"sessions",projectId:n});if(i.kind!=="sessions")throw new E("HOST_REJECTED","Expected sessions.");return i},onProjects:n=>Mt({kind:"projects"},i=>{i.kind==="projects"&&n(i)}),onWorktrees:(n,i)=>Mt({kind:"worktrees",projectId:n},f=>{f.kind==="worktrees"&&i(f)}),onSessions:(n,i)=>Mt({kind:"sessions",projectId:n},f=>{f.kind==="sessions"&&i(f)}),onRunningShells:(n,i)=>En(n,i),readShellOutput:async(n,i)=>{be(n,128);let f=i?.cursor;if(f!==void 0&&(!Number.isInteger(f)||f<0))throw new E("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let b=i?.tailBytes;if(b!==void 0&&(!Number.isInteger(b)||b<1||b>65536))throw new E("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let U=await ee({...V,type:"shell-output",id:y(_),payload:{shellId:n,cursor:f,tailBytes:b}});if(!U||typeof U.output!="string"||!Number.isFinite(U.cursor))throw new E("HOST_REJECTED","Host did not return shell output.");return U},stopShell:async n=>{if(be(n,128),(await ee({...V,type:"shell-stop",id:y(_),payload:{shellId:n}}))?.stopped!==!0)throw new E("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{be(n),await z({...V,type:"open-session",id:y(_),payload:{sessionId:n}})},storage:{get:async(n,i)=>{let f=kt(i),b={op:"get",key:n};f&&(b.scope=f);let N=await ft(b);return N.op==="get"&&N.found?N.value:void 0},set:async(n,i,f)=>{let b=kt(f),N={op:"set",key:n,value:i};b&&(N.scope=b),await ft(N)},delete:async(n,i)=>{let f=kt(i),b={op:"delete",key:n};f&&(b.scope=f),await ft(b)},keys:async n=>{let i=kt(n),f={op:"keys"};i&&(f.scope=i);let b=await ft(f);if(b.op!=="keys")throw new E("HOST_REJECTED","Expected storage keys.");return b.keys}},onReady:n=>(s.add(n),x&&n(x),()=>{s.delete(n)}),onDirectory:n=>(l.add(n),x&&n(x.directory),()=>{l.delete(n)}),onSession:n=>(c.add(n),x&&n(x.session),()=>{c.delete(n)}),onSessionLifecycle:n=>(p.add(n),T&&n(T),()=>{p.delete(n)}),onConnection:n=>(v.add(n),x&&n(x.connection),()=>{v.delete(n)}),onSettings:n=>(m.add(n),x&&n(x.settings),()=>{m.delete(n)}),onItem:n=>(h.add(n),x&&n(x.item),()=>{h.delete(n)}),onStatusControl:n=>(S.add(n),()=>{S.delete(n)}),onPopoverClosed:n=>(G.add(n),()=>{G.delete(n)}),setStatusControls:n=>x?.features?.statusControls!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support status controls.")):er(n)?z({...V,type:"status-controls",id:y(_),payload:{controls:n}}):Promise.reject(new E("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>x?.features?.popovers!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):Dt(n)?z({...V,type:"popover-open",id:y(_),payload:n}):Promise.reject(new E("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Wo,setPopoverAnchorActive:Jo,onResolve:n=>(k=n,()=>{k===n&&(k=null)}),toast:n=>{let i=n.message.trim();return!i||i.length>ht?Promise.reject(new E("HOST_REJECTED",`Toast message must contain 1 to ${ht} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>bt)?Promise.reject(new E("HOST_REJECTED",`Toast copy text must contain 1 to ${bt} characters.`)):z({channel:w,v:1,type:"toast",id:y(_),payload:{...n,message:i}})},openUrl:n=>z({channel:w,v:1,type:"open-url",id:y(_),payload:{url:n}}),openCommit:n=>Bt(n)?z({channel:w,v:1,type:"open-commit",id:y(_),payload:{sha:n}}):Promise.reject(new E("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),openSurface:n=>z({channel:w,v:1,type:"open-surface",id:y(_),payload:{surfaceId:n}}),writeClipboard:n=>z({channel:w,v:1,type:"clipboard-write",id:y(_),payload:{text:n}}),compose:n=>z({channel:w,v:1,type:"compose",id:y(_),payload:n}),attach:n=>z({channel:w,v:1,type:"attach",id:y(_),payload:je(n)}),startSession:async n=>{n.projectId!==void 0&&be(n.projectId);let i=n.worktree;i&&i!==!0&&(i.kind==="existing"?be(i.directory):(i.name!==void 0&&be(i.name,200),i.baseBranch!==void 0&&be(i.baseBranch,200)));let f=await ee({channel:w,v:1,type:"start-session",id:y(_),payload:Kt(n)},e.requestTimeoutMs??18e4);if(!Ft(f))throw new E("HOST_REJECTED","Host did not return a session.");return f},prompt:n=>ee({channel:w,v:1,type:"prompt",id:y(_),payload:Wt(n)}).then(i=>{if(!Xt(i))throw new E("HOST_REJECTED","Host did not return a prompt result.");return i}),sessionLink:n=>z({channel:w,v:1,type:"session-link",id:y(_),payload:je(n)}),close:()=>z({channel:w,v:1,type:"close",id:y(_)}),oauthStart:()=>z({channel:w,v:1,type:"oauth-start",id:y(_)}),oauthDisconnect:()=>z({channel:w,v:1,type:"oauth-disconnect",id:y(_)}),request:n=>(_t(n.path)?ee({channel:w,v:1,type:"request",id:y(_),payload:n}):kr()).then(i=>{if(!Tt(i))throw new E("HOST_REJECTED","Host request result was empty.");return i}),serviceRequest:n=>(_t(n.path)?ee({channel:w,v:1,type:"service-request",id:y(_),payload:n}):kr()).then(i=>{if(!Tt(i))throw new E("HOST_REJECTED","Host service request result was empty.");return i}),serviceStatus:()=>ee({channel:w,v:1,type:"service-status",id:y(_)}).then(n=>{if(!qt(n))throw new E("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(Ke(n)?ee({channel:w,v:1,type:"file-read",id:y(_),payload:{path:n}}):yt()).then(i=>{if(!Qt(i))throw new E("HOST_REJECTED","Host did not return file content.");return i}),writeFile:(n,i)=>Ke(n)?i.length>xt?Promise.reject(new E("FILE_TOO_LARGE",`Content is over ${xt} characters.`)):ee({channel:w,v:1,type:"file-write",id:y(_),payload:{path:n,content:i}}).then(f=>{if(!Zt(f))throw new E("HOST_REJECTED","Host did not confirm the write.");return f}):yt(),listDir:n=>(Ke(n)?ee({channel:w,v:1,type:"file-list",id:y(_),payload:{path:n}}):yt()).then(i=>{if(!eo(i))throw new E("HOST_REJECTED","Host did not return directory entries.");return i}),stat:n=>(Ke(n)?ee({channel:w,v:1,type:"file-stat",id:y(_),payload:{path:n}}):yt()).then(i=>{if(!to(i))throw new E("HOST_REJECTED","Host did not return file status.");return i}),generate:n=>{let i=n.prompt.trim(),f=n.system?.trim();if(i.length===0||i.length>vt)return Promise.reject(new E("HOST_REJECTED",`Prompt must be 1 to ${vt} characters.`));if(f!==void 0&&(f.length===0||f.length>St))return Promise.reject(new E("HOST_REJECTED",`System prompt must be 1 to ${St} characters.`));let b=n.maxOutputTokens===void 0?void 0:Math.min(Vt,Math.max(1,Math.floor(n.maxOutputTokens)));if(b!==void 0&&!Number.isFinite(b))return Promise.reject(new E("HOST_REJECTED","maxOutputTokens must be a number."));let N={prompt:i};return f!==void 0&&(N.system=f),b!==void 0&&(N.maxOutputTokens=b),ee({channel:w,v:1,type:"generate",id:y(_),payload:N},e.requestTimeoutMs??jt).then(U=>{if(!oo(U))throw new E("HOST_REJECTED","Host did not return generated text.");return U})},onLateGenerateResult:n=>{P.add(n);for(let i of J.splice(0))F([n],i);return Ho(),()=>{P.delete(n)}},setBadge:n=>z({channel:w,v:1,type:"badge",id:y(_),payload:{count:Jt(n)}}),setHeight:n=>z({channel:w,v:1,type:"resize",id:y(_),payload:{height:Yt(n)}}),onFileOpen:n=>(C.add(n),ze||(ze=!0,t.addEventListener("keydown",Bo,!0)),Ne&&n(Ne),()=>{C.delete(n)}),onFileSnapshot:n=>(ce=n,()=>{ce===n&&(ce=null)}),onFileSaved:n=>(pe.add(n),()=>{pe.delete(n)}),reportFileChange:n=>Ct({...V,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:Xo,reportFileUnsupported:()=>Ct({...V,type:"file-unsupported"}),dispose:()=>{for(let n of Oe.keys())me({...V,type:"workspace-unsubscribe",id:y(_),payload:{subscriptionId:n}});Oe.clear();for(let n of Re.keys())me({...V,type:"shells-unsubscribe",id:y(_),payload:{subscriptionId:n}});Re.clear(),ue=!0,k=null,$=null,ce=null,C.clear(),pe.clear(),ze&&t.removeEventListener("keydown",Bo,!0),t.removeEventListener("message",Fo),t.removeEventListener("keydown",zo,!0),t.removeEventListener("pointerover",mt),t.removeEventListener("pointermove",mt),t.removeEventListener("pointerout",Vo),t.removeEventListener("focus",jo),t.removeEventListener("blur",Ko);for(let n of we.values())clearTimeout(n.timer),n.reject(new E("HOST_UNAVAILABLE","Host client was disposed."));we.clear(),s.clear(),l.clear(),c.clear(),p.clear(),v.clear(),m.clear(),h.clear(),S.clear(),G.clear(),P.clear(),J.length=0}}};var Or=["browser.open","browser.snapshot","browser.click","browser.type","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var pi=new Set(Or);var Rr=["none","agent","user"];var mi=new Set(Rr);var On=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Rn=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Ir=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,r]of On)t.style.setProperty(o,e.tokens[r]);for(let[o,r,s]of Rn){let l=e.tokens[s]??"";t.style.setProperty(o,l),t.style.setProperty(r,l)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},lo=(e,t)=>{Ir(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var In={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},H=(e,t)=>`var(--${e}, var(--oc-${In[e]}, ${t}))`,Ce=H("surface-background","transparent"),wt=H("surface-elevated","transparent"),We=H("surface-elevated-foreground","inherit"),he=H("surface-foreground","inherit"),D=H("surface-muted-foreground","gray"),Cn=H("surface-muted","transparent"),$e=H("interactive-border","currentColor"),te=H("interactive-hover","transparent"),De=H("interactive-active","transparent"),po=H("interactive-selection","transparent"),uo=H("interactive-selection-foreground","inherit"),Ie=H("primary","currentColor"),mo=H("primary-text","inherit"),fo=H("error-text","inherit"),Un=H("font-sans","inherit"),go=H("font-mono","monospace"),Gr=H("radius","9px"),ho=`calc(${Gr} - 2px)`,Cr=`calc(${Gr} - 4px)`,X=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,Ur=`background-image: linear-gradient(${te}, ${te});`,bo=e=>`box-shadow: inset 0 0 0 1px ${e}, var(--oc-sdk-field-lift);`,Eo="box-shadow: inset 0 0 0 1px var(--oc-sdk-edge), var(--oc-sdk-raised-lift);",Mr="box-shadow: var(--oc-sdk-lit);",Lr=`inset 0 1px 0 0 ${X(he,1.5)}, 0 1px 1px 0 rgb(0 0 0 / 0.28), 0 2px 3px -2px rgb(0 0 0 / 0.2)`,Mn=`
:root {
  --oc-sdk-edge: ${X(he,10)};
  --oc-sdk-field-bg: ${wt};
  --oc-sdk-raised-bg: ${Ce};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 2px 0 rgb(0 0 0 / 0.06);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.45), 0 1px 2px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.8), inset 0 0 0 1px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.1), 0 1px 2px -0.5px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.08);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${X(he,6)};
  --oc-sdk-field-bg: ${X(Ce,50,wt)};
  --oc-sdk-raised-bg: ${wt};
  --oc-sdk-field-lift: ${Lr};
  --oc-sdk-raised-lift: ${Lr};
  --oc-sdk-lit: inset 0 1px 0 0 ${X(he,1.5)}, 0 1px 1px 0 rgb(0 0 0 / 0.28), 0 2px 3px -2px rgb(0 0 0 / 0.2);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.36), 0 1px 1px -0.5px rgb(0 0 0 / 0.22), 0 3px 3px -1.5px rgb(0 0 0 / 0.2), 0 6px 6px -3px rgb(0 0 0 / 0.16);
}`,At=e=>{let t=H(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${H(`${e}-text`,"inherit")}; }`},Ln=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 32px; padding: 0 12px; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: 6px; height: 28px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: 4px; height: 24px; padding: 0 8px; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 32px; padding: 0 10px; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: 8px 10px; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 28px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: 14px; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; }
`,Pr=`${Mn}
.oc-sdk { color: ${he}; font-family: ${Un}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Ur} }
.oc-sdk-mono { font-family: ${go}; }
.oc-sdk-muted { color: ${D}; }
${At("success")}${At("warning")}${At("error")}${At("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Ie}; --oc-sdk-tone-text: ${mo}; }

.oc-sdk-btn { border-radius: ${ho}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Cr}; }
.oc-sdk-btn[data-variant="default"] { color: ${mo}; background: ${X(Ie,10,Ce)}; border-color: ${X(Ie,12)}; ${Mr} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${X(Ie,16,Ce)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${X(Ie,22,Ce)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Cn}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${De}, ${De}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${We}; border-color: transparent; ${Eo} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${De}, ${De}); box-shadow: inset 0 0 0 1px var(--oc-sdk-edge); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${te}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${De}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${H("status-error","red")}; color: ${fo}; background: ${X("var(--oc-sdk-tone)",7,Ce)}; border-color: ${X("var(--oc-sdk-tone)",12)}; ${Mr} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${X("var(--oc-sdk-tone)",9,Ce)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${X("var(--oc-sdk-tone)",11,Ce)}; box-shadow: none; }

.oc-sdk-field-note { color: ${D}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${fo}; }
.oc-sdk-input { border-radius: ${ho}; background: var(--oc-sdk-field-bg); color: ${We}; ${bo("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${D}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${bo(X(he,26))} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${bo(H("status-error","red"))} }
.oc-sdk-input[data-mono="true"] { font-family: ${go}; }

.oc-sdk-search-icon { color: ${D}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Ie}; }
.oc-sdk-search-clear { border-radius: ${Cr}; color: ${D}; }
.oc-sdk-search-clear:hover { background: ${te}; color: ${he}; }

.oc-sdk-trigger { border-color: transparent; border-radius: ${ho}; background: var(--oc-sdk-raised-bg); color: ${We}; ${Eo} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${De}, ${De}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${D}; }
.oc-sdk-trigger-chevron { color: ${D}; }
/* The app's dropdown light: lit top, hairline rings and a layered shadow, no border. */
.oc-sdk-popup { --surface-foreground: ${We}; border-color: transparent; border-radius: 12px; background: ${wt}; color: ${We}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${te}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${po}; color: ${uo}; }
.oc-sdk-option-check { color: ${he}; }
.oc-sdk-option[data-destructive="true"] { color: ${fo}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${X(H("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${D}; }
.oc-sdk-popup-empty { color: ${D}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${$e}; border-radius: 4px; color: ${he}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${X(he,60,$e)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${$e}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${Ce}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${Ie}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Ur} }
.oc-sdk-check-desc { color: ${D}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${X(he,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${D}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${he}; }
.oc-sdk-tab[aria-selected="true"] { color: ${uo}; background: ${po}; border-color: ${$e}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${We}; background: var(--oc-sdk-raised-bg); border-color: transparent; ${Eo} }
.oc-sdk-tab-count { color: ${D}; }

.oc-sdk-badge { border-radius: 9999px; background: ${te}; color: ${D}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${X("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${te}; }
.oc-sdk-row[aria-selected="true"] { background: ${po}; color: ${uo}; }
.oc-sdk-row-lead { font-family: ${go}; color: ${D}; }
.oc-sdk-row-sub { color: ${D}; }
.oc-sdk-row-meta { color: ${D}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${D}; }

.oc-sdk-empty-body { color: ${D}; }

.oc-sdk-spinner { color: ${D}; }
.oc-sdk-spinner-ring { border-color: ${$e}; border-top-color: ${Ie}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${X("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${D}; }

.oc-sdk-separator { color: ${D}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${X($e,40)}; }

.oc-sdk-progress-label { color: ${D}; }
.oc-sdk-progress-track { border-radius: 9999px; background: ${$e}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${Ie}); }

.oc-sdk-text a { color: ${mo}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${X($e,60)}; }
`,Y=`
${Lt}
${Ln}
${Pr}`;var Nr="oc-sdk-ui-style",Je=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},q=e=>{let t=document.getElementById(Nr);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}Gt(document);let o=document.createElement("style");o.id=Nr,o.textContent=e,document.head.appendChild(o)},I=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},xe=e=>{let t=I("button",e);return t.type="button",t},fe=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},Ye=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},$r=(e,t)=>{let o=r=>{r.target instanceof Node&&e.contains(r.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var Gn=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Ue=(e,t)=>{q(Y);let o=t,r=xe("oc-sdk oc-sdk-btn"),s=Gn(),l=document.createElement("span");r.append(l),e.append(r);let c=()=>{r.dataset.variant=o.variant??"default",r.dataset.size=o.size??"default",r.disabled=!!o.disabled||!!o.loading,r.dataset.loading=o.loading?"true":"false",r.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&s.parentNode!==r?r.prepend(s):!o.loading&&s.parentNode===r&&s.remove(),fe(l,o.label)},p=()=>{o.disabled||o.loading||o.onClick()};return r.addEventListener("click",p),c(),{update:v=>{o={...o,...v},c()},dispose:()=>{r.removeEventListener("click",p),r.remove()}}};var Dr="http://www.w3.org/2000/svg",Pn={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},qe=(e,t,o)=>{let r=document.createElementNS(Dr,"svg");r.setAttribute("viewBox","0 0 24 24"),r.setAttribute("width",String(t)),r.setAttribute("height",String(t)),r.setAttribute("aria-hidden","true"),r.setAttribute("fill","currentColor"),o&&r.setAttribute("class",o);let s=document.createElementNS(Dr,"path");return s.setAttribute("d",Pn[e]),r.append(s),r};var He=(e,t="vertical")=>{let[o,r]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===r||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Qe=(e,t,o)=>{let r=e.filter(v=>!v.disabled);if(r.length===0)return null;let s=r[0],l=r[r.length-1];if(o==="first"||!s||!l)return s?.id??null;if(o==="last")return l.id;let c=r.findIndex(v=>v.id===t);return c===-1?o==="next"?s.id:l.id:r[Math.min(r.length-1,Math.max(0,c+(o==="next"?1:-1)))]?.id??null};var Hr=(e,t)=>`${e}-${t??""}`,xo=(e,t,o,r)=>{let s=xe("oc-sdk-option");s.id=Hr(e,o.id),s.setAttribute("role",t),s.tabIndex=-1,s.disabled=!!o.disabled,t==="option"&&s.setAttribute("aria-selected",o.selected?"true":"false"),s.dataset.destructive=o.destructive?"true":"false";let l=I("span","oc-sdk-option-label");if(l.textContent=o.label,s.append(l),o.hint){let c=I("span","oc-sdk-option-hint");c.textContent=o.hint,s.append(c)}if(t==="option"){s.dataset.mark="check";let c=I("span","oc-sdk-option-check");c.append(qe("check",14)),s.append(c)}return s.addEventListener("pointerenter",r.hover),s.addEventListener("click",r.pick),s},vo=(e,t,o,r)=>{let s=Hr(o,r);for(let l of Array.from(e.children))l instanceof HTMLElement&&l.classList.contains("oc-sdk-option")&&(l.dataset.active=l.id===s?"true":"false");Ye(t,"aria-activedescendant",r?s:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Nn=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let r=e.offsetHeight,s=window.innerHeight-o.bottom-8;r>s&&o.top-8>s&&(e.style.top=`${Math.max(8,Math.round(o.top-4-r))}px`);let l=o.left+e.offsetWidth-window.innerWidth+8;l>0&&(e.style.left=`${Math.max(8,Math.round(o.left-l))}px`)},So=(e,t,o,r)=>{e.append(o),Nn(o,t);let s=$r(e,r),l=()=>{r()},c=p=>{p.target instanceof Node&&o.contains(p.target)||r()};return window.addEventListener("resize",l),window.addEventListener("scroll",c,!0),()=>{s(),window.removeEventListener("resize",l),window.removeEventListener("scroll",c,!0),o.remove()}};var Fr=(e,t)=>{let o=t.trim().toLowerCase();return o?e.filter(r=>r.label.toLowerCase().includes(o)||r.id.toLowerCase().includes(o)):[...e]},$n=0,_o=(e,t)=>{q(Y);let o=t,r=`oc-sdk-select-${$n+=1}`,s=I("div","oc-sdk oc-sdk-select"),l=I("span","oc-sdk-field-label");l.id=`${r}-label`;let c=xe("oc-sdk-trigger");c.setAttribute("aria-haspopup","listbox"),c.setAttribute("aria-labelledby",l.id);let p=I("span","oc-sdk-trigger-value");c.append(p,qe("chevron",14,"oc-sdk-trigger-chevron")),s.append(l,c),e.append(s);let v="",m=null,h=null,S=I("div","oc-sdk oc-sdk-popup"),G=I("div","oc-sdk-popup-search"),P=I("input","oc-sdk-input");P.type="text",P.autocomplete="off",G.append(P);let J=I("div");J.setAttribute("role","listbox"),J.tabIndex=-1,S.append(J);let k=()=>Fr(o.options,o.searchable?v:""),$=()=>o.searchable?P:J,C=T=>{m=T,vo(J,$(),r,T)},pe=()=>{Je(J);let T=k();if(T.length===0){let B=I("div","oc-sdk-popup-empty");B.textContent="No matches",J.append(B)}for(let B of T)J.append(xo(r,"option",{...B,selected:B.id===o.value},{hover:()=>C(B.id),pick:()=>ze(B.id)}));C(T.some(B=>B.id===m)?m:T[0]?.id??null)},ce=()=>{let T=h;h=null,T?.(),v="",P.value="",c.setAttribute("aria-expanded","false")},Ne=()=>{h||o.disabled||(m=o.value,P.placeholder=o.searchPlaceholder??"Search",o.searchable?S.prepend(G):G.remove(),pe(),h=So(s,c,S,ce),c.setAttribute("aria-expanded","true"),$().focus())},ze=T=>{ce(),c.focus(),T!==o.value&&o.onChange(T)},we=()=>{h?ce():Ne()},Oe=T=>{!h&&He(T)&&(T.preventDefault(),Ne())},Re=T=>{let B=He(T);B?(T.preventDefault(),C(Qe(k(),m,B))):T.key==="Enter"?(T.preventDefault(),m&&ze(m)):T.key==="Escape"?(T.preventDefault(),ce(),c.focus()):o.searchable&&T.target!==P&&T.key.length===1&&!T.ctrlKey&&!T.metaKey&&P.focus()},ue=()=>{v=P.value,pe()},_=T=>{h&&!(T.relatedTarget instanceof Node&&s.contains(T.relatedTarget))&&ce()},x=()=>{fe(l,o.label),l.hidden=!o.label;let T=o.options.find(B=>B.id===o.value);fe(p,T?.label??o.placeholder??"Select"),p.dataset.empty=T?"false":"true",c.disabled=!!o.disabled,h&&pe()};return c.addEventListener("click",we),c.addEventListener("keydown",Oe),S.addEventListener("keydown",Re),P.addEventListener("input",ue),s.addEventListener("focusout",_),x(),{update:T=>{o={...o,...T},x()},dispose:()=>{ce(),c.removeEventListener("click",we),c.removeEventListener("keydown",Oe),S.removeEventListener("keydown",Re),P.removeEventListener("input",ue),s.removeEventListener("focusout",_),s.remove()}}};var Hn=/^[a-z0-9][a-z0-9-]{0,63}$/,Fn=new Set(["all","new"]),le=class extends Error{constructor(t){super(t),this.name="GroupFileError"}};var Xr=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new le("Invalid group config format");let t=e;if(t.version!==1)throw new le("Unsupported group config version");if(!Array.isArray(t.groups))throw new le("Invalid group list format");if(t.groups.length>50)throw new le("Cannot have more than 50 groups");let o=[],r=new Set,s=new Set;for(let[l,c]of t.groups.entries()){if(!c||typeof c!="object"||Array.isArray(c))throw new le(`Group ${l+1} has an invalid format`);let p=c;if(typeof p.id!="string"||!Hn.test(p.id)||Fn.has(p.id))throw new le(`Group ${l+1} has an invalid ID`);if(r.has(p.id))throw new le(`Duplicate group ID: ${p.id}`);let v=typeof p.name=="string"?p.name.trim():"";if(!v||v.length>40||/[\u0000-\u001f\u007f]/.test(v))throw new le(`Group ${l+1} name must be 1-40 characters`);let m=v.toLowerCase();if(s.has(m))throw new le(`Duplicate group name: ${v}`);if(!Array.isArray(p.serverIds))throw new le(`Group "${v}" has an invalid member format`);if(p.serverIds.length>200)throw new le(`Group "${v}" cannot have more than 200 members`);let h=[],S=new Set;for(let G of p.serverIds){if(typeof G!="string"||!G||G.length>128)throw new le(`Group "${v}" contains an invalid server ID`);S.has(G)||(S.add(G),h.push(G))}r.add(p.id),s.add(m),o.push({id:p.id,name:v,serverIds:h})}return{version:1,groups:o}};var Br=`:root {\r
  --mc-bg: var(--surface-background, var(--oc-bg, transparent));\r
  --mc-fg: var(--oc-fg);\r
  --mc-muted: var(--oc-muted);\r
  --mc-border: var(--oc-border);\r
  --mc-primary: var(--oc-primary);\r
  --mc-primary-fg: var(--oc-primary-fg, #fff);\r
  --mc-warning: var(--oc-warning);\r
  --mc-error: var(--oc-error);\r
  --mc-success: var(--oc-success);\r
  --mc-info: var(--oc-info);\r
  --ext-bg: var(--mc-bg);\r
}\r
\r
.mc {
  height: 100%;\r
  display: flex;\r
  flex-direction: column;\r
  color: var(--mc-fg);\r
  font-size: 13px;\r
  line-height: 1.5;\r
}\r
.mc-header {\r
  flex: none;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  padding: 14px 16px 10px;\r
  border-bottom: 1px solid var(--mc-border);\r
}\r
.mc-title-row {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  flex-wrap: wrap;\r
  gap: 8px 12px;\r
}\r
.mc-title {\r
  margin: 0;\r
  font-size: 14px;\r
  font-weight: 600;\r
  line-height: 1.4;\r
}\r
.mc-actions {\r
  display: flex;\r
  align-items: center;\r
  flex-wrap: wrap;\r
  gap: 6px;\r
}\r
.mc-summary {\r
  margin: 0;\r
  color: var(--mc-fg);\r
  font-size: 12px;\r
  line-height: 1.5;\r
  overflow-wrap: anywhere;\r
}\r
.mc-summary-secondary {\r
  margin-top: -4px;\r
  color: var(--mc-muted);\r
  font-size: 11px;\r
}\r
.mc-body {\r
  min-height: 0;\r
  flex: 1;\r
  overflow: auto;\r
  padding: 12px 16px 24px;\r
  scrollbar-gutter: stable;\r
}\r
.mc-notice-root:empty {\r
  display: none;\r
}\r
.mc-notice {\r
  margin: 0 0 12px;\r
  padding: 10px 12px;\r
  border-radius: var(--oc-radius, 6px);\r
  background: color-mix(in srgb, var(--mc-info) 7%, var(--mc-bg));\r
  color: var(--oc-info-text);\r
  font-size: 12px;\r
  line-height: 1.5;\r
  overflow-wrap: anywhere;\r
}\r
.mc-notice[data-tone="success"] {\r
  background: color-mix(in srgb, var(--mc-success) 7%, var(--mc-bg));\r
  color: var(--oc-success-text);\r
}\r
.mc-notice[data-tone="warning"] {\r
  background: color-mix(in srgb, var(--mc-warning) 8%, var(--mc-bg));\r
  color: var(--oc-warning-text);\r
}\r
.mc-notice[data-tone="error"] {\r
  background: color-mix(in srgb, var(--mc-error) 7%, var(--mc-bg));\r
  color: var(--oc-error-text);\r
}\r
.mc-notice-actions,\r
.mc-conflict-actions,\r
.mc-mini-actions {\r
  display: flex;\r
  align-items: center;\r
  flex-wrap: wrap;\r
  gap: 6px;\r
}\r
.mc-notice-actions {\r
  margin-top: 8px;\r
}\r
.mc-inline-button {\r
  border: 1px solid var(--mc-border);\r
  border-radius: var(--oc-radius, 6px);\r
  background: transparent;\r
  color: var(--mc-fg);\r
  padding: 3px 8px;\r
  font-size: 11px;\r
  line-height: 1.5;\r
  cursor: pointer;\r
}\r
.mc-inline-button:hover:not(:disabled) {\r
  background: color-mix(in srgb, var(--mc-fg) 6%, transparent);\r
}\r
.mc-inline-button:disabled {\r
  opacity: 0.45;\r
  cursor: not-allowed;\r
}\r
.mc-inline-primary {\r
  background: var(--mc-primary);\r
  border-color: var(--mc-primary);\r
  color: var(--mc-primary-fg);\r
}\r
.mc-inline-primary:hover:not(:disabled) {\r
  background: var(--mc-primary);\r
  filter: brightness(1.05);\r
}\r
.mc-conflicts {\r
  margin: 0 0 12px;\r
  padding: 12px;\r
  border: 1px solid color-mix(in srgb, var(--mc-warning) 35%, var(--mc-border));\r
  border-radius: var(--oc-radius, 6px);\r
  background: color-mix(in srgb, var(--mc-warning) 5%, transparent);\r
}\r
.mc-section-head {\r
  display: flex;\r
  align-items: baseline;\r
  justify-content: space-between;\r
  flex-wrap: wrap;\r
  gap: 4px 12px;\r
}\r
.mc-section-title {\r
  margin: 0;\r
  font-size: 13px;\r
  font-weight: 600;\r
}\r
.mc-section-count {\r
  color: var(--mc-muted);\r
  font-size: 11px;\r
}\r
.mc-conflict-list {\r
  list-style: none;\r
  margin: 8px 0 0;\r
  padding: 0;\r
  display: grid;\r
  gap: 10px;\r
}\r
.mc-conflict-item {\r
  display: flex;\r
  align-items: flex-start;\r
  justify-content: space-between;\r
  flex-wrap: wrap;\r
  gap: 8px 12px;\r
  padding-left: 10px;\r
  border-left: 2px solid var(--mc-border);\r
}\r
.mc-conflict-item[data-tone="error"] {\r
  border-left-color: var(--mc-error);\r
}\r
.mc-conflict-item[data-tone="warning"] {\r
  border-left-color: var(--mc-warning);\r
}\r
.mc-conflict-copy {\r
  min-width: 0;\r
  flex: 1 1 260px;\r
}\r
.mc-conflict-copy strong {\r
  display: block;\r
  font-size: 12px;\r
  font-weight: 600;\r
}\r
.mc-conflict-message {\r
  margin: 2px 0 0;\r
  color: var(--mc-muted);\r
  font-size: 11px;\r
  line-height: 1.5;\r
  overflow-wrap: anywhere;\r
}\r
.mc-path {\r
  display: flex;\r
  gap: 4px;\r
  margin: 4px 0 0;\r
  min-width: 0;\r
  font-size: 10px;\r
  line-height: 1.5;\r
  color: var(--mc-muted);\r
  overflow-wrap: anywhere;\r
}\r
.mc-path-label {\r
  flex: none;\r
}\r
.mc-path code {\r
  min-width: 0;\r
  font-family: var(--oc-mono, ui-monospace, SFMono-Regular, Menlo, monospace);\r
  overflow-wrap: anywhere;\r
}\r
.mc-warning-details {\r
  margin-top: 8px;\r
}\r
.mc-warning-details summary {\r
  cursor: pointer;\r
  color: var(--mc-muted);\r
  font-size: 11px;\r
}\r
\r
.mc-groups {\r
  flex: 1;\r
  min-width: 0;\r
  display: flex;\r
  align-items: center;\r
  flex-wrap: wrap;\r
  gap: 4px;\r
  margin: 0;\r
}\r
.mc-groups-row {\r
  display: flex;\r
  align-items: center;\r
  gap: 6px;\r
  margin: 2px 0 6px;\r
}\r
.mc-groups-edit {\r
  flex: none;\r
  align-self: flex-start;\r
  border-color: var(--mc-border);\r
  white-space: nowrap;\r
}\r
.mc-groups-edit:disabled {\r
  opacity: 0.45;\r
  cursor: not-allowed;\r
}\r
.mc-group-select {\r
  display: none;\r
  flex: 1;\r
  min-width: 0;\r
}\r
.mc-groups-note:empty {\r
  display: none;\r
}\r
.mc-groups-note .mc-notice {\r
  margin-bottom: 8px;\r
}\r
.mc-chip {\r
  max-width: 100%;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
  white-space: nowrap;\r
  border: 1px solid transparent;\r
  border-radius: 999px;\r
  background: transparent;\r
  color: var(--mc-muted);\r
  padding: 2px 7px;\r
  font-size: 11px;\r
  line-height: 1.5;\r
  cursor: pointer;\r
}\r
.mc-chip:hover {\r
  color: var(--mc-fg);\r
}\r
.mc-chip[aria-pressed="true"] {\r
  color: var(--mc-fg);\r
  border-color: var(--mc-border);\r
  background: color-mix(in srgb, var(--mc-fg) 5%, transparent);\r
}\r
.mc-groupbar {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  flex-wrap: wrap;\r
  gap: 6px 12px;\r
  padding: 7px 0;\r
  border-top: 1px solid var(--mc-border);\r
  border-bottom: 1px solid var(--mc-border);\r
  margin-bottom: 8px;\r
}.mc-groupbar-text {\r
  min-width: 0;\r
  display: flex;\r
  align-items: baseline;\r
  flex-wrap: wrap;\r
  gap: 4px 8px;\r
}\r
.mc-groupbar-text strong {\r
  font-size: 13px;\r
  font-weight: 600;\r
  overflow-wrap: anywhere;\r
}\r
.mc-group-state {\r
  color: var(--mc-muted);\r
  font-size: 11px;\r
}\r
.mc-group-warning {\r
  flex-basis: 100%;\r
  margin: 0;\r
  color: var(--oc-warning-text);\r
  font-size: 11px;\r
  line-height: 1.5;\r
  overflow-wrap: anywhere;\r
}\r
.mc-groupbar-actions {\r
  display: flex;\r
  align-items: center;\r
  flex-wrap: wrap;\r
  gap: 6px;\r
}\r
.mc-group-editor-root:empty,
.mc-server-editor-root:empty {
  display: none;
}\r
.mc-group-editor {\r
  margin: 2px 0 10px;\r
  padding: 10px;\r
  border: 1px solid var(--mc-border);\r
  border-radius: var(--oc-radius, 6px);\r
  background: color-mix(in srgb, var(--mc-fg) 3%, transparent);\r
}\r
.mc-group-editor .mc-section-head {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  gap: 8px;\r
  margin-bottom: 8px;\r
}\r
.mc-group-editor .mc-section-title {\r
  margin: 0;\r
  font-size: 12px;\r
  font-weight: 600;\r
}\r
.mc-field {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 3px;\r
  margin: 0 0 8px;\r
}\r
.mc-field-label {\r
  color: var(--mc-muted);\r
  font-size: 11px;\r
}\r
.mc-input {\r
  width: 100%;\r
  min-height: 28px;\r
  padding: 3px 7px;\r
  border: 1px solid var(--mc-border);\r
  border-radius: var(--oc-radius, 6px);\r
  background: var(--mc-bg);\r
  color: var(--mc-fg);\r
  font: inherit;\r
  font-size: 12px;\r
}\r
.mc-input:disabled {\r
  opacity: 0.55;\r
}\r
.mc-members {\r
  min-width: 0;\r
  margin: 0 0 8px;\r
  padding: 6px 8px 8px;\r
  border: 1px solid var(--mc-border);\r
  border-radius: var(--oc-radius, 6px);\r
}\r
.mc-members legend {\r
  padding: 0 4px;\r
  color: var(--mc-muted);\r
  font-size: 11px;\r
}\r
.mc-members-tools {\r
  display: flex;\r
  justify-content: flex-end;\r
  gap: 6px;\r
  margin-bottom: 2px;\r
}\r
.mc-member-list {\r
  display: grid;\r
  gap: 1px;\r
  max-height: 220px;\r
  overflow: auto;\r
}\r
.mc-check {\r
  display: flex;\r
  align-items: flex-start;\r
  gap: 6px;\r
  min-width: 0;\r
  padding: 2px 0;\r
  cursor: pointer;\r
}\r
.mc-check input {\r
  flex: none;\r
  margin: 3px 0 0;\r
  accent-color: var(--mc-primary);\r
}\r
.mc-check-copy {\r
  display: flex;\r
  flex-direction: column;\r
  min-width: 0;\r
}\r
.mc-check-name {\r
  font-size: 12px;\r
  line-height: 1.4;\r
  overflow-wrap: anywhere;\r
}\r
.mc-check-id {\r
  color: var(--mc-muted);\r
  font-size: 10px;\r
  line-height: 1.4;\r
  overflow-wrap: anywhere;\r
}\r
.mc-missing {\r
  display: flex;\r
  flex-wrap: wrap;\r
  align-items: center;\r
  gap: 4px;\r
  margin-top: 6px;\r
}\r
.mc-missing-label {\r
  color: var(--oc-warning-text);\r
  font-size: 11px;\r
}\r
.mc-missing-chip {\r
  border: 1px dashed var(--mc-border);\r
  border-radius: 999px;\r
  background: transparent;\r
  color: var(--oc-warning-text);\r
  padding: 1px 6px;\r
  font-size: 10px;\r
  line-height: 1.5;\r
  cursor: pointer;\r
}\r
.mc-missing-chip:disabled {\r
  opacity: 0.5;\r
  cursor: not-allowed;\r
}\r
.mc-editor-error {\r
  margin: 0 0 8px;\r
  color: var(--oc-error-text);\r
  font-size: 11px;\r
  line-height: 1.5;\r
  overflow-wrap: anywhere;\r
}\r
.mc-editor-actions {\r
  display: flex;\r
  align-items: center;\r
  justify-content: flex-end;\r
  flex-wrap: wrap;\r
  gap: 6px;\r
}\r
.mc-editor-confirm {\r
  margin-top: 8px;\r
  padding: 8px;\r
  border-radius: var(--oc-radius, 6px);\r
  background: color-mix(in srgb, var(--mc-warning) 8%, transparent);\r
}\r
.mc-editor-confirm p {\r
  margin: 0 0 6px;\r
  color: var(--oc-warning-text);\r
  font-size: 11px;\r
  line-height: 1.5;\r
}\r
.mc-editor-hint {\r
  margin: 8px 0 0;\r
  color: var(--mc-muted);\r
  font-size: 10px;\r
  line-height: 1.5;\r
}\r
.mc-step {\r
  flex: none;\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
  width: 18px;\r
  height: 18px;\r
  border: 1px solid var(--mc-border);\r
  border-radius: 50%;\r
  color: var(--mc-muted);\r
  font-size: 10px;\r
  line-height: 1;\r
}\r
.mc-mono,
.mc-cmd {
  font-family: var(--oc-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
.mc-cmd {
  font-size: 11px;
}
.mc-stat,
.mc-field-hint {
  color: var(--mc-muted);
  font-size: 10px;
  line-height: 1.5;
}
.mc-textarea {
  min-height: 64px;
  resize: vertical;
  font-family: var(--oc-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 11px;
  line-height: 1.5;
}
.mc-segment {
  display: flex;
}
.mc-segment .mc-inline-button {
  border-radius: 0;
}
.mc-segment .mc-inline-button:first-child {
  border-radius: var(--oc-radius, 6px) 0 0 var(--oc-radius, 6px);
}
.mc-segment .mc-inline-button:last-child {
  margin-left: -1px;
  border-radius: 0 var(--oc-radius, 6px) var(--oc-radius, 6px) 0;
}
.mc-segment .mc-inline-button[aria-pressed="true"] {
  background: color-mix(in srgb, var(--mc-fg) 8%, transparent);
  border-color: var(--mc-muted);
  color: var(--mc-fg);
}
.mc-install {
  margin: 0 0 10px;
  padding: 8px 10px;
  border: 1px solid var(--mc-border);
  border-radius: var(--oc-radius, 6px);
}
.mc-install > summary {
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}
.mc-install-body {
  padding-top: 8px;
}
.mc-install-drafts {
  list-style: none;
  margin: 8px 0;
  padding: 0;
  display: grid;
  gap: 4px;
}
.mc-install-draft {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 6px;
  min-width: 0;
}
.mc-install-draft .mc-cmd {
  flex-basis: 100%;
  color: var(--mc-muted);
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mc-chip:focus-visible,
.mc-input:focus-visible,
.mc-missing-chip:focus-visible,
.mc-install > summary:focus-visible {\r
  outline: 2px solid var(--oc-focus);\r
  outline-offset: 2px;\r
}\r
\r
.mc-search {\r
  width: 100%;\r
  min-height: 32px;\r
  margin: 0 0 4px;\r
  padding: 4px 8px;\r
  border: 1px solid var(--mc-border);\r
  border-radius: var(--oc-radius, 6px);\r
  background: transparent;\r
  color: var(--mc-fg);\r
  font-size: 12px;\r
}\r
.mc-search::placeholder {\r
  color: var(--mc-muted);\r
}\r
.mc-list {\r
  display: block;\r
}\r
.mc-skill,
.mc-server {
  display: grid;\r
  grid-template-columns: minmax(0, 1fr) auto;\r
  gap: 12px 16px;\r
  padding: 14px 0;\r
  border-bottom: 1px solid var(--mc-border);\r
}\r
.mc-skill-main,
.mc-server-main {
  min-width: 0;
}\r
.mc-skill-head,
.mc-server-head {
  display: flex;\r
  align-items: center;\r
  flex-wrap: wrap;\r
  gap: 6px;\r
}\r
.mc-name {\r
  font-size: 13px;\r
  font-weight: 600;\r
  line-height: 1.5;\r
  overflow-wrap: anywhere;\r
}\r
.mc-badge {\r
  display: inline-flex;\r
  align-items: center;\r
  max-width: 100%;\r
  padding: 1px 6px;\r
  border: 1px solid var(--mc-border);\r
  border-radius: 999px;\r
  color: var(--mc-muted);\r
  font-size: 10px;\r
  line-height: 1.6;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
}\r
.mc-badge[data-tone="success"] {\r
  border-color: color-mix(in srgb, var(--mc-success) 30%, var(--mc-border));\r
  background: color-mix(in srgb, var(--mc-success) 8%, transparent);\r
  color: var(--oc-success-text);\r
}\r
.mc-badge[data-tone="warning"] {\r
  border-color: color-mix(in srgb, var(--mc-warning) 35%, var(--mc-border));\r
  background: color-mix(in srgb, var(--mc-warning) 8%, transparent);\r
  color: var(--oc-warning-text);\r
}\r
.mc-badge[data-tone="error"] {\r
  border-color: color-mix(in srgb, var(--mc-error) 35%, var(--mc-border));\r
  background: color-mix(in srgb, var(--mc-error) 8%, transparent);\r
  color: var(--oc-error-text);\r
}\r
.mc-badge[data-tone="info"] {\r
  border-color: color-mix(in srgb, var(--mc-info) 30%, var(--mc-border));\r
  color: var(--oc-info-text);\r
}\r
.mc-meta {\r
  display: flex;\r
  align-items: center;\r
  flex-wrap: wrap;\r
  gap: 4px 6px;\r
  margin-top: 4px;\r
}\r
.mc-id {\r
  color: var(--mc-muted);\r
  font-family: var(--oc-mono, ui-monospace, SFMono-Regular, Menlo, monospace);\r
  font-size: 10px;\r
  overflow-wrap: anywhere;\r
}\r
.mc-desc {\r
  margin: 6px 0 0;\r
  color: var(--mc-muted);\r
  font-size: 12px;\r
  line-height: 1.5;\r
  overflow-wrap: anywhere;\r
  display: -webkit-box;\r
  -webkit-line-clamp: 2;\r
  -webkit-box-orient: vertical;\r
  overflow: hidden;\r
}\r
.mc-warn {\r
  margin: 6px 0 0;\r
  color: var(--oc-warning-text);\r
  font-size: 11px;\r
  line-height: 1.5;\r
  overflow-wrap: anywhere;\r
}\r
.mc-skill-action,
.mc-server-action {
  display: flex;\r
  flex-direction: column;\r
  align-items: flex-end;\r
  justify-content: center;\r
  gap: 5px;\r
  min-width: 72px;\r
}\r
.mc-action-note {\r
  color: var(--mc-muted);\r
  font-size: 10px;\r
  line-height: 1.4;\r
  white-space: nowrap;\r
}\r
.mc-switch {\r
  position: relative;\r
  flex: none;\r
  width: 34px;\r
  height: 20px;\r
  padding: 0;\r
  border: 1px solid var(--mc-border);\r
  border-radius: 999px;\r
  background: color-mix(in srgb, var(--mc-fg) 8%, transparent);\r
  cursor: pointer;\r
  appearance: none;\r
  -webkit-appearance: none;\r
  transition: background 0.15s ease, border-color 0.15s ease;\r
}\r
.mc-switch .mc-thumb {\r
  position: absolute;\r
  top: 2px;\r
  left: 2px;\r
  width: 14px;\r
  height: 14px;\r
  border-radius: 50%;\r
  background: var(--mc-muted);\r
  transition: transform 0.15s ease, background 0.15s ease;\r
}\r
.mc-switch[aria-checked="true"] {\r
  background: var(--mc-primary);\r
  border-color: var(--mc-primary);\r
}\r
.mc-switch[aria-checked="true"] .mc-thumb {\r
  transform: translateX(14px);\r
  background: var(--mc-primary-fg);\r
}\r
.mc-switch:disabled {\r
  opacity: 0.45;\r
  cursor: not-allowed;\r
}\r
.mc-empty {\r
  padding: 28px 2px;\r
}\r
.mc-empty h2 {\r
  margin: 0 0 5px;\r
  font-size: 13px;\r
  font-weight: 600;\r
}\r
.mc-empty p {\r
  margin: 0;\r
  max-width: 42em;\r
  color: var(--mc-muted);\r
  font-size: 12px;\r
}\r
.mc-footer {\r
  margin-top: 18px;\r
  padding-top: 12px;\r
  border-top: 1px solid var(--mc-border);\r
  color: var(--mc-muted);\r
  font-size: 11px;\r
  line-height: 1.6;\r
}\r
.mc-footer p {\r
  margin: 0 0 4px;\r
}\r
.mc-footer p:last-child {\r
  margin-bottom: 0;\r
}\r
.mc-inline-button:focus-visible,\r
.mc-switch:focus-visible,\r
.mc-search:focus-visible {\r
  outline: 2px solid var(--oc-focus);\r
  outline-offset: 2px;\r
}@media (max-width: 380px) {\r
  .mc-header,\r
  .mc-body {\r
    padding-left: 12px;\r
    padding-right: 12px;\r
  }\r
  .mc-skill,
  .mc-server {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .mc-skill-action,
  .mc-server-action {\r
    flex-direction: row;\r
    align-items: center;\r
    justify-content: space-between;\r
    min-width: 0;\r
  }\r
  .mc-action-note {\r
    order: 2;\r
  }\r
  .mc-actions {\r
    width: 100%;\r
  }\r
  .mc-conflict-item {
    flex-direction: column;
  }
  .mc-conflict-copy {
    flex: 0 1 auto;
  }\r
  .mc-groupbar-actions {\r
    width: 100%;\r
  }\r
  .mc-groups {\r
    display: none;\r
  }\r
  .mc-group-select {\r
    display: block;\r
  }\r
  .mc-group-select .oc-sdk-select {\r
    gap: 0;\r
  }\r
  .mc-group-select .oc-sdk-trigger {\r
    width: 100%;\r
    height: 28px;\r
    border: 1px solid var(--mc-border);\r
    border-radius: var(--oc-radius, 6px);\r
    background: transparent;\r
    color: var(--mc-fg);\r
    font-size: 12px;\r
  }\r
  .mc-group-select .oc-sdk-trigger:hover,\r
  .mc-group-select .oc-sdk-trigger[aria-expanded="true"] {\r
    background-color: color-mix(in srgb, var(--mc-fg) 5%, transparent);\r
    background-image: none;\r
  }\r
}\r
@media (prefers-reduced-motion: reduce) {\r
  .mc-switch,\r
  .mc-switch .mc-thumb {\r
    transition: none;\r
  }\r
}\r
`;var zr=`/* Shared foundation for OpenChamber extensions. Colors and fonts belong to the host. */\r
:root {\r
  --ext-bg: var(--surface-background, var(--oc-bg, transparent));\r
  --ext-space-1: 4px;\r
  --ext-space-2: 8px;\r
  --ext-space-3: 12px;\r
  --ext-space-4: 16px;\r
  --ext-space-6: 24px;\r
  --ext-text-small: 11px;\r
  --ext-text-body: 13px;\r
  --ext-text-title: 14px;\r
}\r
* { box-sizing: border-box; }\r
html, body { margin: 0; height: 100%; background: var(--ext-bg); }\r
body { overflow: hidden; }\r
#root { height: 100%; }\r
[hidden] { display: none !important; }\r
button, input, textarea, select { font: inherit; }\r
.ext { color: var(--oc-fg); font-family: var(--oc-font); font-size: var(--ext-text-body); line-height: 1.5; }\r
.ext button:focus-visible, .ext [tabindex]:focus-visible { outline: 2px solid var(--oc-focus); outline-offset: 2px; }\r
.ext-actions { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ext-space-2); }\r
.ext-muted { color: var(--oc-muted); font-size: var(--ext-text-small); }\r
.ext-notice { margin: 0; padding: 10px 12px; border-radius: var(--oc-radius, 6px); font-size: 12px; overflow-wrap: anywhere; background: color-mix(in srgb, var(--oc-info) 7%, var(--ext-bg)); color: var(--oc-info-text); }\r
.ext-notice[data-tone="success"] { background: color-mix(in srgb, var(--oc-success) 7%, var(--ext-bg)); color: var(--oc-success-text); }\r
.ext-notice[data-tone="warning"] { background: color-mix(in srgb, var(--oc-warning) 8%, var(--ext-bg)); color: var(--oc-warning-text); }\r
.ext-notice[data-tone="error"] { background: color-mix(in srgb, var(--oc-error) 7%, var(--ext-bg)); color: var(--oc-error-text); }\r
.ext .oc-sdk-btn[data-size="sm"], .ext .oc-sdk-tab { font-size: 12px; }\r
.ext .oc-sdk-field-note { font-size: var(--ext-text-small); }\r
@media (prefers-reduced-motion: reduce) {\r
  .ext *, .ext *::before, .ext *::after { animation: none !important; transition: none !important; }\r
}\r
`;var Ee=co({requestTimeoutMs:3e4}),nn=document.querySelector("#root");if(!nn)throw new Error("Missing #root");var sn=document.createElement("style");sn.textContent=zr+Br;document.head.append(sn);var a=(e,t="",o)=>{let r=document.createElement(e);return r.className=t,o!==void 0&&(r.textContent=o),r},zn=/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/,Vr="Values hidden by opencode.json stay blank; leaving them blank keeps what opencode.json already stores (kept from opencode.json).",jr="One KEY=VALUE per line.",Kr="One Name: value per line.",ye=class extends Error{code;conflicts;constructor(t,o,r){super(t),this.name="ServiceError",this.code=o,this.conflicts=r}},Z=e=>e&&typeof e=="object"&&!Array.isArray(e)?e:null,Ge=(e,t="")=>typeof e=="string"?e:t,Ot=e=>typeof e=="string"&&e.length>0?e:null,at=e=>e===!0,Vn=e=>typeof e=="number"&&Number.isFinite(e)?e:0,oe=e=>Array.isArray(e)?e.filter(t=>typeof t=="string"):[],jn=e=>e==="enabled"||e==="disabled"||e==="invalid"||e==="conflict",Kn=e=>e==="local"||e==="remote"||e==="unknown",Wn=e=>e==="both"||e==="read-error"||e==="duplicate"||e==="invalid"||e==="stub"||e==="tools-off"||e==="insecure-url",Jn=e=>e==="auto"||e==="disabled"||e==="configured"||e==="none",Lo=e=>{let t=Z(e);return!t||!Wn(t.kind)?null:{kind:t.kind,serverId:Ge(t.serverId),message:Ge(t.message,"Conflict"),paths:oe(t.paths),blocking:at(t.blocking)}},Wr=e=>{let t=Z(e);return{path:Ge(t?.path),exists:at(t?.exists),error:typeof t?.error=="string"?t.error:null}},Yn=e=>{let t=Z(e);return!t||typeof t.id!="string"||!t.id||!jn(t.state)?null:{id:t.id,container:t.container==="legacy"?"legacy":"servers",transport:Kn(t.transport)?t.transport:"unknown",command:oe(t.command),url:Ot(t.url),cwd:Ot(t.cwd),environmentKeys:oe(t.environmentKeys),headerKeys:oe(t.headerKeys),timeout:Ot(t.timeout),codemode:at(t.codemode),protocol:Ot(t.protocol),oauth:Jn(t.oauth)?t.oauth:"none",enabled:at(t.enabled),state:t.state,advertised:at(t.advertised),toolsOff:oe(t.toolsOff),paths:oe(t.paths),targets:oe(t.targets),conflicts:Array.isArray(t.conflicts)?t.conflicts.map(Lo).filter(o=>o!==null):[],warnings:oe(t.warnings),contentHash:Ge(t.contentHash)}},Ae=e=>{let t=Z(e);if(!t||!Array.isArray(t.servers))throw new ye("The service returned data in an invalid format.","parse",[]);let o=t.servers.map(Yn).filter(c=>c!==null),r=Array.isArray(t.conflicts)?t.conflicts.map(Lo).filter(c=>c!==null):o.flatMap(c=>c.conflicts),s=r.filter(c=>c.blocking).length,l={total:o.length,advertised:o.filter(c=>c.advertised).length,enabled:o.filter(c=>c.state==="enabled").length,disabled:o.filter(c=>c.state==="disabled").length,invalid:o.filter(c=>c.state==="invalid"||c.state==="conflict").length,legacy:o.filter(c=>c.container==="legacy").length,blockingConflicts:s,warnings:r.length-s};return{servers:o,conflicts:r,summary:l,config:Wr(t.config),scanned:Array.isArray(t.scanned)?t.scanned.map(Wr).filter(c=>c.path.length>0):[],scannedAt:Vn(t.scannedAt)}},Go=e=>{try{return Xr(e).groups}catch(t){throw new ye(t instanceof Error?t.message:"The group configuration format is invalid.","parse",[])}},qn=e=>{let t=Z(e),o=Z(t?.definition);return!t||!o||typeof t.id!="string"||!t.id?null:{id:t.id,definition:o,enabled:t.enabled!==!1}},Qn=e=>{let t=Z(e),o=Z(t?.definition);if(!t||!o)throw new ye("The service returned an invalid server definition.","parse",[]);return{id:Ge(t.id),container:t.container==="legacy"?"legacy":"servers",definition:o,paths:oe(t.paths),maskedPaths:oe(t.maskedPaths)}},Zn=e=>{let t=Z(e);if(!t||!Array.isArray(t.drafts))throw new ye("The service returned data in an invalid format.","parse",[]);return{drafts:t.drafts.map(qn).filter(o=>o!==null),existing:oe(t.existing),source:Ge(t.source)}},ie=async(e,t,o)=>{let r=await Ee.serviceRequest({method:e,path:t,...o===void 0?{}:{body:JSON.stringify(o)}}),s;try{s=JSON.parse(r.body)}catch{throw new ye("The service returned unrecognized data. Try again.","parse",[])}if(r.status>=400){let l=Z(s)??{},c=typeof l.error=="string"?l.error:`Request failed (${r.status})`,p=typeof l.code=="string"?l.code:null,v=Array.isArray(l.conflicts)?l.conflicts.map(Lo).filter(m=>m!==null):[];throw new ye(c,p,v)}return s},ae=e=>e instanceof E?e.code==="NO_SERVICE"?'Allow "MCP Manager" to run its local service in Settings \u2192 Extensions.':e.code==="SERVICE_FAILED"?"The local service is not ready. Reload the extension and try again.":e.code==="DISABLED"?"The MCP Manager extension is disabled. Enable it in extension settings.":e.code==="HOST_TIMEOUT"?"The local service timed out. Try again.":e.code==="NOT_GRANTED"?"Allow the required permission in extension settings, or reinstall the extension.":"Cannot connect to the local service. Check the extension permissions.":e instanceof ye||e instanceof Error?e.message:"The operation failed. Try again.",es=e=>e instanceof ye&&e.code==="not-found"?'The local service is outdated. Disable and re-enable "MCP Manager" in extension settings.':ae(e),It=a("main","ext mc");It.setAttribute("aria-label","MCP Manager");var an=a("header","mc-header"),cn=a("div","mc-title-row"),ts=a("h1","mc-title","MCP Manager"),rt=a("div","mc-actions"),os=Ue(rt,{label:"Add server",size:"sm",onClick:()=>Us()}),rs=Ue(rt,{label:"Rescan",variant:"outline",size:"sm",onClick:()=>{hn(!0),No()}}),ns=Ue(rt,{label:"Enable all",variant:"outline",size:"sm",onClick:()=>bn(!0)}),ss=Ue(rt,{label:"Disable all",variant:"outline",size:"sm",onClick:()=>bn(!1)});cn.append(ts,rt);var Ao=a("p","mc-summary"),wo=a("p","mc-summary mc-summary-secondary");an.append(cn,Ao,wo);var ln=a("div","mc-body"),re=a("div","mc-notice-root");re.setAttribute("aria-live","polite");var Oo=a("div","mc-groups-note"),dn=a("div","mc-groups-row"),ct=a("div","mc-groups"),Po=a("div","mc-group-select"),Le=a("button","mc-chip mc-groups-edit","Edit groups");Le.type="button";Le.setAttribute("aria-pressed","false");Le.addEventListener("click",()=>{R?mn():bs()});dn.append(ct,Po,Le);var Ze=a("div","mc-group-editor-root"),et=a("div","mc-server-editor-root"),Ro=a("div"),pt=a("div"),Io=a("div","mc-install-root"),tt=a("input","mc-search");tt.type="search";tt.placeholder="Search ID, command or URL";tt.setAttribute("aria-label","Search MCP servers");tt.addEventListener("input",()=>{Co=tt.value.trim().toLowerCase(),gn()});var lt=a("div","mc-list");lt.setAttribute("role","list");var pn=a("footer","mc-footer");pn.append(a("p","","Manages the mcp.servers block of ~/.config/opencode/opencode.json (and opencode.jsonc when present). Writes preserve comments and the rest of the file; every write keeps the previous content in opencode.json.mcp-manager.bak."),a("p","","Changes take effect when OpenCode reloads its config; running sessions keep the tools they already loaded."));ln.append(re,Oo,dn,Ze,et,Ro,pt,Io,tt,lt,pn);It.append(an,ln);nn.append(It);var g=null,ne=!1,Fe=null,A=null,d=null,ge=null,se=null,Te=null,K=null,W=[],ke=null,Xe=!0,R=null,de=null,ot=!1,M=null,Q=null,Se={paste:"",url:"",path:""},dt=!1,Me=null,_e=null,Co="",Jr=!1,is=_o(Po,{value:"all",options:[{id:"all",label:"All"}],onChange:e=>{K=e==="all"?null:e,u()}}),To=Po.querySelector(".oc-sdk-trigger");To&&(To.setAttribute("aria-label","Filter by group"),To.removeAttribute("aria-labelledby"));var Pe=()=>!!g?.config.error,as=e=>e.state==="conflict"?"error":e.state==="invalid"?"warning":e.state==="disabled"?"info":e.advertised?"success":"warning",cs=e=>e.state==="conflict"?"Conflict":e.state==="invalid"?"Invalid":e.state==="disabled"?"Disabled":"Enabled",Rt=(e,t="neutral")=>{let o=a("span","mc-badge",e);return o.dataset.tone=t,o},ls=e=>{switch(e){case"both":return"Defined in more than one config file";case"duplicate":return"Duplicate entry inside mcp.servers";case"invalid":return"Definition cannot be read";case"read-error":return"Config cannot be read";case"tools-off":return"A tool is turned off";case"insecure-url":return"URL is not encrypted";default:return"Conflict"}},ds=(e,t)=>{if(!t)return null;let o=a("p","mc-path");return o.append(a("span","mc-path-label",`${e}: `),a("code","",t)),o},L=(e,t,o=!1,r=!1)=>{let s=a("button",o?"mc-inline-button mc-inline-primary":"mc-inline-button",e);return s.type="button",s.disabled=!!d||r,s.addEventListener("click",t),s},ve=(e,t,o=null)=>{let r=a("div","mc-field");return r.append(a("span","mc-field-label",e),t),(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t instanceof HTMLSelectElement)&&t.setAttribute("aria-label",e),o&&r.append(a("span","mc-field-hint",o)),r},ps=e=>e.split(/[\\/]/).pop()||e,Yr=e=>{let t=a("li","mc-conflict-item");t.dataset.tone=e.blocking?"error":"warning";let o=a("div","mc-conflict-copy");o.append(a("strong","",ls(e.kind)),a("p","mc-conflict-message",e.message));for(let r of e.paths){let s=ds("Config",r);s&&o.append(s)}if(t.append(o),e.kind==="both"){let s=(g?.servers.find(l=>l.id===e.serverId)??null)?.targets??[];if(s.length>=2){let l=a("div","mc-conflict-actions");for(let c of s){let[p]=c.split("#"),v=c.endsWith("#legacy")?"legacy entry":"mcp.servers";l.append(L(`Keep ${ps(p??c)} \xB7 ${v}`,()=>void Bs(e,c),!1,Pe()))}t.append(l)}}return t},us=()=>{if(pt.replaceChildren(),!g)return;let e=g.conflicts,t=e.filter(l=>l.blocking),o=e.filter(l=>!l.blocking);if(t.length===0&&o.length===0)return;let r=a("section","mc-conflicts");r.setAttribute("aria-label","Conflict check");let s=a("div","mc-section-head");if(s.append(a("h2","mc-section-title","Conflict check"),a("span","mc-section-count",`${t.length} blocking \xB7 ${o.length} warning${o.length===1?"":"s"}`)),r.append(s),t.length>0){let l=a("ul","mc-conflict-list");for(let c of t)l.append(Yr(c));r.append(l)}if(o.length>0){let l=a("details","mc-warning-details");l.append(a("summary","",`Warnings (${o.length})`));let c=a("ul","mc-conflict-list");for(let p of o)c.append(Yr(p));l.append(c),r.append(l)}pt.append(r)},ms=()=>{if(re.replaceChildren(),Te!==null){let e=Te,t=a("div","mc-notice",`Remove ${e} from opencode.json? The server definition is deleted; a copy is kept in opencode.json.mcp-manager.bak.`);t.dataset.tone="warning",t.setAttribute("role","status");let o=a("div","mc-notice-actions");o.append(L("Confirm remove",()=>void Xs(e),!0),L("Cancel",()=>{Te=null,u()})),t.append(o),re.append(t);return}if(se){let e=se,t=new Set(e.serverIds),o=g?g.servers.filter(l=>!t.has(l.id)).length:0,r=a("div","mc-notice",`Only "${e.name}": ${o} other servers will be disabled.`);r.dataset.tone="warning",r.setAttribute("role","status");let s=a("div","mc-notice-actions");s.append(L("Confirm",()=>void ks(),!0),L("Cancel",()=>{se=null,u()})),r.append(s),re.append(r);return}if(ge!==null){let e=g?g.servers.filter(r=>r.enabled!==ge).length:0,t=a("div","mc-notice",ge?`${e} servers will be enabled.`:`${e} servers will be disabled.`);t.dataset.tone="warning",t.setAttribute("role","status");let o=a("div","mc-notice-actions");o.append(L(ge?"Confirm enable":"Confirm disable",()=>void zs(),!0),L("Cancel",()=>{ge=null,u()})),t.append(o),re.append(t);return}if(A){let e=a("div","mc-notice",A.text);if(e.dataset.tone=A.tone,e.setAttribute("role",A.tone==="error"?"alert":"status"),A.actions?.length){let t=a("div","mc-notice-actions");for(let o of A.actions)t.append(L(o.label,o.onClick,o.primary));e.append(t)}re.append(e);return}if(Fe){let e=a("div","mc-notice",Fe);e.dataset.tone="error",e.setAttribute("role","alert"),re.append(e);return}if(ne&&!g){let e=a("div","mc-notice","Reading servers\u2026");e.dataset.tone="info",e.setAttribute("role","status"),re.append(e)}},fs=()=>{if(!g){Ao.textContent=ne?"Reading servers\u2026":"Servers not loaded yet.",wo.textContent="MCP servers live in the mcp.servers block of opencode.json.";return}Ao.textContent=`${g.summary.advertised} of ${g.summary.total} visible to the model \xB7 ${g.summary.enabled} enabled`;let e=g.summary.blockingConflicts,t=g.summary.warnings,o=[`${g.summary.disabled} disabled`,`${g.summary.invalid} invalid`,e>0?`${e} blocking conflict${e===1?"":"s"}`:"No blocking conflicts",`${t} warning${t===1?"":"s"}`];g.summary.legacy>0&&o.push(`${g.summary.legacy} deprecated entries`),wo.textContent=o.join(" \xB7 ")},Be=e=>e.serverIds.filter(t=>g?.servers.some(o=>o.id===t)),un=e=>{let t=Be(e).map(r=>g?.servers.find(s=>s.id===r)).filter(r=>!!r);if(t.length===0)return"No servers";if(t.some(r=>r.state==="conflict"))return"Has conflicts";let o=t.filter(r=>r.state==="enabled").length;return o===t.length?"All on":o===0?"All off":"Partial"},qr=e=>{Array.from(ct.querySelectorAll("[data-group]")).find(o=>o.dataset.group===e)?.focus()},gs=()=>`custom-${globalThis.crypto?.randomUUID?.().slice(0,8)??Math.random().toString(36).slice(2,10)}`,hs=()=>{if(Oo.replaceChildren(),!ke)return;let e=a("div","mc-notice",`Group configuration cannot be read: ${ke}`);e.dataset.tone="error",e.setAttribute("role","alert");let t=a("div","mc-notice-actions");t.append(L("Reload",()=>void No(),!1,Xe)),e.append(t),Oo.append(e)},Uo=e=>{R={id:e?.id??null,name:e?.name??"",members:e?[...e.serverIds]:[]},de=null,ot=!1,u();let t=Ze.querySelector(".mc-group-name");t?.focus(),t?.select()},bs=()=>{if(ke||Xe||!g||Pe())return;let e=W.find(t=>t.id===K)??W[0]??null;Uo(e),Ze.scrollIntoView({block:"nearest"})},mn=()=>{d||(R=null,de=null,ot=!1,u(),Le.focus())},Es=e=>{if(e==="new"){Uo(null);return}let t=W.find(o=>o.id===e);t&&Uo(t)},yo=()=>{Ze.querySelector(".mc-group-name")?.focus()},Qr=async()=>{let e=R;if(!e||d||ke)return;let t=e.name.trim();if(!t){de="Enter a group name.",u(),yo();return}if(t.length>40){de=`Group name cannot exceed ${40} characters.`,u(),yo();return}if(W.some(l=>l.id!==e.id&&l.name.trim().toLowerCase()===t.toLowerCase())){de=`A group named "${t}" already exists.`,u(),yo();return}if(e.members.length===0){de="A group needs at least one member.",u();return}let o=e.id??gs(),r={id:o,name:t,serverIds:[...e.members]},s=e.id?W.map(l=>l.id===e.id?r:l):[...W,r];d="groups",de=null,u();try{W=Go(await ie("POST","/groups",{version:1,groups:s})),ke=null,K=o,se=null;let l=W.find(c=>c.id===o)??null;R=l?{id:l.id,name:l.name,members:[...l.serverIds]}:null,A={text:`Saved group "${t}".`,tone:"success"},Ee.toast({kind:"success",message:`Saved group "${t}"`}).catch(()=>{})}catch(l){de=ae(l)}finally{d=null,u()}},xs=()=>{!R?.id||d||(ot=!0,u())},vs=async()=>{if(!R?.id||d)return;let e=R.id,t=W.filter(o=>o.id!==e);d="groups",ot=!1,de=null,u();try{W=Go(await ie("POST","/groups",{version:1,groups:t})),ke=null,se?.id===e&&(se=null),K===e&&(K=null);let o=W.find(r=>r.id===K)??W[0]??null;K=o?.id??null,R=o?{id:o.id,name:o.name,members:[...o.serverIds]}:null,A={text:"Group deleted.",tone:"success"}}catch(o){de=ae(o)}finally{d=null,u()}},Ss=()=>{if(Ze.replaceChildren(),!R)return;let e=R,t=a("section","mc-group-editor");t.setAttribute("aria-label","Edit groups");let o=a("div","mc-section-head");o.append(a("h2","mc-section-title","Edit groups"),L("Close",mn,!1,!!d)),t.append(o);let r=a("label","mc-field");r.append(a("span","mc-field-label","Select group"));let s=a("select","mc-input");s.setAttribute("aria-label","Select group");let l=a("option","","New group");l.value="new",s.append(l);for(let k of W){let $=a("option","",`${k.name} (${k.serverIds.length})`);$.value=k.id,s.append($)}s.value=e.id??"new",s.disabled=!!d,s.addEventListener("change",()=>Es(s.value)),r.append(s);let c=a("label","mc-field");c.append(a("span","mc-field-label","Name"));let p=a("input","mc-input mc-group-name");p.type="text",p.value=e.name,p.maxLength=40,p.placeholder="e.g. Daily development",p.autocomplete="off",p.spellcheck=!1,p.disabled=!!d,p.addEventListener("input",()=>{R&&(R.name=p.value,de=null)}),p.addEventListener("keydown",k=>{k.key==="Enter"&&(k.preventDefault(),Qr())}),c.append(p),t.append(r,c);let v=a("fieldset","mc-members"),m=a("legend","",`Members (${e.members.length})`);v.append(m);let h=a("div","mc-members-tools");h.append(L("Select all",()=>{if(!R)return;let k=g?.servers.map(C=>C.id)??[],$=R.members.filter(C=>!k.includes(C));R.members=[...k,...$],u()},!1,!!d),L("Clear",()=>{R&&(R.members=[],u())},!1,!!d)),v.append(h);let S=a("div","mc-member-list");for(let k of g?.servers??[]){let $=a("label","mc-check"),C=a("input");C.type="checkbox",C.checked=e.members.includes(k.id),C.disabled=!!d,C.addEventListener("change",()=>{R&&(C.checked?R.members.includes(k.id)||R.members.push(k.id):R.members=R.members.filter(ce=>ce!==k.id),m.textContent=`Members (${R.members.length})`,de=null)});let pe=a("span","mc-check-copy");pe.append(a("span","mc-check-name",k.id),a("code","mc-check-id",k.transport)),$.append(C,pe),S.append($)}v.append(S);let G=new Set(g?.servers.map(k=>k.id)??[]),P=e.members.filter(k=>!G.has(k));if(P.length>0){let k=a("div","mc-missing");k.append(a("span","mc-missing-label","Missing from config:"));for(let $ of P){let C=a("button","mc-missing-chip",`${$} \xD7`);C.type="button",C.disabled=!!d,C.title="Remove this missing member from the group",C.addEventListener("click",()=>{R&&(R.members=R.members.filter(pe=>pe!==$),u())}),k.append(C)}v.append(k)}if(t.append(v),de){let k=a("p","mc-editor-error",de);k.setAttribute("role","alert"),t.append(k)}let J=a("div","mc-editor-actions");if(e.id&&J.append(L("Delete group",xs,!1,!!d)),J.append(L(e.id?"Save changes":"Create group",()=>void Qr(),!0,!!d)),t.append(J),ot){let k=a("div","mc-editor-confirm");k.dataset.tone="warning",k.append(a("p","",`Delete group "${e.name.trim()||"Untitled"}"? The servers themselves are not changed.`));let $=a("div","mc-actions");$.append(L("Confirm delete",()=>void vs(),!0,!!d),L("Cancel",()=>{ot=!1,u()},!1,!!d)),k.append($),t.append(k)}t.append(a("p","mc-editor-hint","Groups only affect panel filtering and bulk toggles; they do not change servers. Members are written to groups.json on save.")),Ze.append(t)},_s=()=>{ct.replaceChildren();let e=g?.servers.length??0,t=a("button","mc-chip",`All ${e}`);t.type="button",t.dataset.group="all",t.setAttribute("aria-pressed",K===null?"true":"false"),t.addEventListener("click",()=>{K=null,u(),qr("all")}),ct.append(t);for(let o of W){let r=Be(o).length,s=a("button","mc-chip",`${o.name} ${r}`);s.type="button",s.dataset.group=o.id,s.setAttribute("aria-pressed",K===o.id?"true":"false"),s.addEventListener("click",()=>{K=o.id,u(),qr(o.id)}),ct.append(s)}Le.textContent=R?"Close editor":"Edit groups",Le.setAttribute("aria-pressed",R?"true":"false"),Le.disabled=Xe||!!ke||!!d||!g||Pe(),Le.title=Xe?"Reading groups\u2026":ke?"Group configuration cannot be read. Fix the file and reload.":g?Pe()?"Config cannot be read":"":"Server list not loaded yet",is.update({value:K??"all",options:[{id:"all",label:`All ${e}`},...W.map(o=>({id:o.id,label:`${o.name} ${Be(o).length}`,hint:un(o)}))]})},Ts=()=>{if(Ro.replaceChildren(),!g||!K)return;let e=g,t=W.find(S=>S.id===K);if(!t)return;let o=Be(t),r=t.serverIds.filter(S=>!o.includes(S)),l=o.map(S=>e.servers.find(G=>G.id===S)).filter(S=>!!S).some(S=>S.state==="conflict"),c=Pe()||l||o.length===0,p=a("div","mc-groupbar"),v=a("div","mc-groupbar-text");v.append(a("strong","",t.name),a("span","mc-group-state",`${o.length} \xB7 ${un(t)}`)),r.length>0&&v.append(a("p","mc-group-warning",`Missing: ${r.join(", ")}`));let m=a("div","mc-groupbar-actions");m.append(L("Enable group",()=>void Zr(t,!0),!1,c),L("Disable group",()=>void Zr(t,!1),!1,c));let h=L("Only this group",()=>ys(t),!1,c||r.length>0);r.length>0&&(h.title="The group has missing servers. Fix them before using only this group."),m.append(h),p.append(v,m),Ro.append(p)},Zr=async(e,t)=>{if(!g||d)return;let o=Be(e);if(o.length!==0){d=`group:${e.id}:${t?"on":"off"}`,se=null,ge=null,Te=null,A=null,u();try{g=Ae(await ie("POST","/servers/batch",{enable:t?o:[],disable:t?[]:o})),A={text:`${o.length} servers in "${e.name}" ${t?"enabled":"disabled"}.`,tone:"success"},Ee.toast({kind:"success",message:`${t?"Enabled":"Disabled"} "${e.name}"`}).catch(()=>{})}catch(r){A={text:ae(r),tone:"error"},d=null,u(),nt(!1,!0);return}d=null,u()}},ys=e=>{if(!g||d)return;let t=Be(e),o=e.serverIds.filter(r=>!t.includes(r));t.length===0||o.length>0||(se=e,ge=null,Te=null,A=null,u(),re.scrollIntoView({block:"nearest"}),re.querySelector("button")?.focus())},ks=async()=>{if(!g||d||!se)return;let e=se;se=null;let t=Be(e),o=e.serverIds.filter(l=>!t.includes(l));if(t.length===0||o.length>0){A={text:"The group has missing servers. Nothing changed.",tone:"error"},u();return}let r=new Set(e.serverIds),s=g.servers.filter(l=>!r.has(l.id)).map(l=>l.id);d=`group-only:${e.id}`,A=null,u();try{g=Ae(await ie("POST","/servers/batch",{enable:t,disable:s})),A={text:`Only "${e.name}" enabled; ${s.length} other servers disabled.`,tone:"success"},Ee.toast({kind:"success",message:`Only "${e.name}" enabled`}).catch(()=>{})}catch(l){A={text:ae(l),tone:"error"},d=null,u(),nt(!1,!0);return}d=null,u()},As=e=>{let t=[],o="",r=!1,s=!1;for(let l of e){if(l==='"'){r=!r,s=!0;continue}if(!r&&/\s/.test(l)){s&&(t.push(o),o="",s=!1);continue}o+=l,s=!0}return r?{tokens:t,error:"A double quote in the command is not closed."}:(s&&t.push(o),{tokens:t,error:null})},ws=e=>/\s/.test(e)?`"${e}"`:e,en=(e,t,o)=>{let r={};for(let s of e.split(`
`)){let l=s.trim();if(!l||l.startsWith("#"))continue;let c=l.indexOf(t);if(c<=0)return{values:r,error:`"${l}" is not ${o}`};let p=l.slice(0,c).trim();if(!p)return{values:r,error:`"${l}" is not ${o}`};r[p]=l.slice(c+1).trim()}return{values:r,error:null}},Os=e=>{let t=Z(e),o=[],r=[];if(!t)return{lines:o,masked:r};for(let[s,l]of Object.entries(t)){let c=typeof l=="string"?l:"";c===""&&r.push(s),o.push(`${s}=${c}`)}return{lines:o,masked:r}},Rs=e=>{let t=Z(e),o=[],r=[];if(!t)return{lines:o,masked:r};for(let[s,l]of Object.entries(t)){let c=typeof l=="string"?l:"";c===""&&r.push(s),o.push(`${s}: ${c}`)}return{lines:o,masked:r}},Is=(e,t)=>{let o=Os(t.environment),r=Rs(t.headers);return{id:e,base:t,name:e,transport:t.type==="remote"?"remote":"local",command:oe(t.command).map(ws).join(" "),cwd:Ge(t.cwd),environment:o.lines.join(`
`),url:Ge(t.url),headers:r.lines.join(`
`),enabled:t.disabled!==!0&&t.enabled!==!1,maskedEnvironment:o.masked,maskedHeaders:r.masked}},Cs=e=>{let t={...e.base};for(let o of["type","command","cwd","environment","url","headers","enabled","disabled"])delete t[o];if(t.type=e.transport,e.transport==="local"){let o=As(e.command);if(o.error)return{definition:t,error:o.error};if(o.tokens.length===0)return{definition:t,error:"Enter the command that starts the server."};t.command=o.tokens;let r=e.cwd.trim();r&&(t.cwd=r);let s=en(e.environment,"=","KEY=VALUE");if(s.error)return{definition:t,error:`Environment: ${s.error}`};Object.keys(s.values).length>0&&(t.environment=s.values)}else{let o=e.url.trim();if(!/^https?:\/\/\S+$/i.test(o))return{definition:t,error:"Enter the URL, starting with http:// or https://."};t.url=o;let r=en(e.headers,":","Name: value");if(r.error)return{definition:t,error:`Headers: ${r.error}`};Object.keys(r.values).length>0&&(t.headers=r.values)}return{definition:t,error:null}},Mo=e=>{et.querySelector(`[data-field="${e}"]`)?.focus()},fn=e=>{M=e,Q=null,Te=null,u(),et.scrollIntoView({block:"nearest"}),Mo("id"),et.querySelector('[data-field="id"]')?.select()},Us=()=>{d||!g||Pe()||fn({id:null,base:{},name:"",transport:"local",command:"",cwd:"",environment:"",url:"",headers:"",enabled:!0,maskedEnvironment:[],maskedHeaders:[]})},tn=async e=>{if(!(d||Pe())){d=`detail:${e.id}`,A=null,u();try{let t=Qn(await ie("GET",`/servers/detail?id=${encodeURIComponent(e.id)}`));d=null,fn(Is(t.id||e.id,t.definition));return}catch(t){A={text:ae(t),tone:"error"}}d=null,u()}},on=()=>{if(d)return;M=null,Q=null,u(),rt.querySelector("button")?.focus()},rn=async()=>{let e=M;if(!e||d)return;let t=e.name.trim();if(!zn.test(t)){Q="Server ID: use letters, numbers, dots, dashes and underscores, starting with a letter or number.",u(),Mo("id");return}let o=!!e.id&&e.id!==t;if((!e.id||o)&&g?.servers.some(s=>s.id===t)){Q=`A server named "${t}" already exists in the config.`,u(),Mo("id");return}let r=Cs(e);if(r.error){Q=r.error,u();return}d="save-server",Q=null,u();try{let s=await ie("POST","/servers/save",{id:t,...e.id?{previousId:e.id}:{},definition:r.definition,enabled:e.enabled}),l=Z(s),c=typeof l?.backupPath=="string"?l.backupPath:null;g=Ae(s),M=null,A={text:e.id?`Saved ${t}${c?`; previous config copied to ${c}`:""}.`:`Added ${t}.`,tone:"success"},Ee.toast({kind:"success",message:e.id?`Saved ${t}`:`Added ${t}`}).catch(()=>{})}catch(s){Q=ae(s)}finally{d=null,u()}},Ms=()=>{if(et.replaceChildren(),!M)return;let e=M,t=a("section","mc-group-editor");t.setAttribute("aria-label",e.id?"Edit server":"Add server");let o=a("div","mc-section-head");o.append(a("h2","mc-section-title",e.id?"Edit server":"Add server"),L("Close",on,!1,!!d)),t.append(o);let r=a("input","mc-input");r.type="text",r.value=e.name,r.placeholder="my-server",r.autocomplete="off",r.spellcheck=!1,r.dataset.field="id",r.disabled=!!d,r.addEventListener("input",()=>{M&&(M.name=r.value,Q=null)}),r.addEventListener("keydown",m=>{m.key==="Enter"&&(m.preventDefault(),rn())});let s=a("div","mc-segment");for(let m of["local","remote"]){let h=a("button","mc-inline-button",m);h.type="button",h.dataset.field=`type-${m}`,h.setAttribute("aria-pressed",e.transport===m?"true":"false"),h.disabled=!!d,h.addEventListener("click",()=>{!M||M.transport===m||(M.transport=m,Q=null,u())}),s.append(h)}if(t.append(ve("ID",r,"The key inside mcp.servers of opencode.json."),ve("Type",s)),e.transport==="local"){let m=a("input","mc-input");m.type="text",m.value=e.command,m.placeholder="npx -y @modelcontextprotocol/server-everything",m.autocomplete="off",m.spellcheck=!1,m.dataset.field="command",m.disabled=!!d,m.addEventListener("input",()=>{M&&(M.command=m.value,Q=null)});let h=a("input","mc-input");h.type="text",h.value=e.cwd,h.placeholder="Defaults to where OpenCode runs",h.autocomplete="off",h.spellcheck=!1,h.dataset.field="cwd",h.disabled=!!d,h.addEventListener("input",()=>{M&&(M.cwd=h.value,Q=null)});let S=a("textarea","mc-input mc-textarea");S.value=e.environment,S.placeholder=`LOG_LEVEL=info
API_TOKEN=`,S.spellcheck=!1,S.dataset.field="environment",S.disabled=!!d,S.addEventListener("input",()=>{M&&(M.environment=S.value,Q=null)}),t.append(ve("Command",m,"Split on spaces; wrap an argument that contains spaces in double quotes."),ve("Working directory",h,"Optional."),ve("Environment",S,e.maskedEnvironment.length>0?`${Vr} ${jr}`:jr))}else{let m=a("input","mc-input");m.type="url",m.value=e.url,m.placeholder="https://example.com/mcp",m.autocomplete="off",m.spellcheck=!1,m.dataset.field="url",m.disabled=!!d,m.addEventListener("input",()=>{M&&(M.url=m.value,Q=null)});let h=a("textarea","mc-input mc-textarea");h.value=e.headers,h.placeholder="Authorization: Bearer \u2026",h.spellcheck=!1,h.dataset.field="headers",h.disabled=!!d,h.addEventListener("input",()=>{M&&(M.headers=h.value,Q=null)}),t.append(ve("URL",m,"The MCP endpoint, starting with http:// or https://."),ve("Headers",h,e.maskedHeaders.length>0?`${Vr} ${Kr}`:Kr))}let l=a("label","mc-check"),c=a("input");c.type="checkbox",c.checked=e.enabled,c.dataset.field="enabled",c.disabled=!!d,c.addEventListener("change",()=>{M&&(M.enabled=c.checked)});let p=a("span","mc-check-copy");if(p.append(a("span","mc-check-name","Enabled")),l.append(c,p),t.append(l),Q){let m=a("p","mc-editor-error",Q);m.setAttribute("role","alert"),t.append(m)}let v=a("div","mc-editor-actions");v.append(L("Cancel",on,!1,!!d),L(e.id?"Save changes":"Add server",()=>void rn(),!0,!!d)),t.append(v),t.append(a("p","mc-editor-hint","Only this server definition is written. Secrets already in opencode.json are kept when the field is left blank; a new value replaces them.")),et.append(t)},Ls=async()=>{if(d)return;let e=Se.paste.trim(),t=Se.url.trim(),o=Se.path.trim(),r=[e,t,o].filter(c=>c.length>0);if(r.length===0){Me="Paste a manifest, enter a URL, or enter a path.",dt=!0,u();return}if(r.length>1){Me="Fill only one source: paste, URL or path.",dt=!0,u();return}let s=e?"paste":t?"url":"path",l=e||t||o;d="import",Me=null,dt=!0,u();try{_e=Zn(await ie("POST","/servers/import",{kind:s,value:l})),Se={paste:"",url:"",path:""};let c=_e.drafts.length;A={text:`${c} server${c===1?"":"s"} found${_e.source?` in ${_e.source}`:""}.`,tone:"info"}}catch(c){Me=ae(c)}finally{d=null,u()}},Gs=async()=>{let e=_e;if(d||!e||e.drafts.length===0)return;d="import-save",A=null,u();let t=0;try{for(let o of e.drafts)g=Ae(await ie("POST","/servers/save",{id:o.id,definition:o.definition,enabled:o.enabled})),t+=1;_e=null,A={text:`${t} server${t===1?"":"s"} added to opencode.json.`,tone:"success"},Ee.toast({kind:"success",message:`Added ${t} MCP server${t===1?"":"s"}`}).catch(()=>{})}catch(o){_e=null,A={text:`Added ${t} of ${e.drafts.length}. ${ae(o)}`,tone:"error"}}finally{d=null,u()}},Ps=()=>{Io.replaceChildren();let e=a("details","mc-install");e.open=dt,e.addEventListener("toggle",()=>{dt=e.open}),e.append(a("summary","","Install from source"));let t=a("div","mc-install-body"),o=a("textarea","mc-input mc-textarea");o.value=Se.paste,o.placeholder=`{
  "mcp": {
    "my-server": { "type": "local", "command": ["npx", "-y", "pkg"] }
  }
}`,o.spellcheck=!1,o.dataset.field="paste",o.disabled=!!d,o.addEventListener("input",()=>{Se.paste=o.value,Me=null});let r=a("input","mc-input");r.type="url",r.value=Se.url,r.placeholder="https://example.com/opencode.json",r.autocomplete="off",r.spellcheck=!1,r.dataset.field="url",r.disabled=!!d,r.addEventListener("input",()=>{Se.url=r.value,Me=null});let s=a("input","mc-input");s.type="text",s.value=Se.path,s.placeholder="~/.config/opencode/extra.json",s.autocomplete="off",s.spellcheck=!1,s.dataset.field="path",s.disabled=!!d,s.addEventListener("input",()=>{Se.path=s.value,Me=null}),t.append(ve("Paste a manifest",o,"Accepts an mcp block (mcp.servers or deprecated flat entries), a single server definition, or a whole opencode.json."),ve("URL",r,null),ve("Local file or folder",s,null));let l=a("div","mc-editor-actions");if(l.append(L("Import",()=>void Ls(),!0,!!d)),t.append(l),Me){let c=a("p","mc-editor-error",Me);c.setAttribute("role","alert"),t.append(c)}if(_e){let c=_e,p=a("div","mc-section-head");p.append(a("h2","mc-section-title",`Found ${c.drafts.length}`),a("span","mc-section-count",c.source||"Pasted manifest")),t.append(p);let v=a("ul","mc-install-drafts");for(let S of c.drafts){let G=a("li","mc-install-draft"),P=S.definition.type==="remote"?"remote":"local",J=P==="local"?oe(S.definition.command).join(" "):Ge(S.definition.url);G.append(a("code","mc-id",S.id),Rt(P,"neutral")),c.existing.includes(S.id)&&G.append(Rt("overwrites","warning")),G.append(a("span","mc-cmd",J||"No command")),v.append(G)}t.append(v);let m=c.drafts.filter(S=>c.existing.includes(S.id)).map(S=>S.id);m.length>0&&t.append(a("p","mc-editor-hint",`Already present and will be overwritten: ${m.join(", ")}.`));let h=a("div","mc-editor-actions");h.append(L(`Add ${c.drafts.length} server${c.drafts.length===1?"":"s"}`,()=>void Gs(),!0,!!d||c.drafts.length===0),L("Discard",()=>{_e=null,u()},!1,!!d)),t.append(h)}e.append(t),Io.append(e)},Ns=e=>{let t=a("div","mc-server-action"),o=a("span","mc-action-note"),r=Pe();if(e.state==="conflict"){o.textContent=`Defined in ${e.targets.length||2} places`;let c=a("button","mc-inline-button","Resolve");c.type="button",c.disabled=!!d||r,c.addEventListener("click",()=>{pt.scrollIntoView({block:"nearest"}),pt.querySelector("button")?.focus()}),t.append(o,c)}else if(e.state==="invalid"){o.textContent="Definition is invalid";let c=a("button","mc-inline-button","Edit definition");c.type="button",c.disabled=!!d||r,c.addEventListener("click",()=>void tn(e)),t.append(o,c)}else{let c=e.state==="enabled",p=a("button","mc-switch");p.type="button",p.setAttribute("role","switch"),p.setAttribute("aria-checked",c?"true":"false"),p.setAttribute("aria-label",`${c?"Disable":"Enable"} ${e.id}`),p.dataset.serverId=e.id,p.disabled=!!d||r,p.append(a("span","mc-thumb")),p.addEventListener("click",()=>{p.disabled||Hs(e,!c)}),c?o.textContent=r?"Config cannot be read":e.advertised?"Visible to model":"No tools enabled":o.textContent=r?"Config cannot be read":"Disabled",t.append(o,p)}let s=a("div","mc-mini-actions");if(e.state!=="invalid"&&e.state!=="conflict"){let c=a("button","mc-inline-button","Edit");c.type="button",c.disabled=!!d||r,c.addEventListener("click",()=>void tn(e)),s.append(c)}let l=a("button","mc-inline-button","Delete");return l.type="button",l.disabled=!!d||r,l.addEventListener("click",()=>Fs(e.id)),s.append(l),t.append(s),t},$s=e=>{let t=a("article","mc-server");t.dataset.state=e.state,t.setAttribute("role","listitem");let o=a("div","mc-server-main"),r=a("div","mc-server-head");r.append(a("strong","mc-name mc-mono",e.id),Rt(cs(e),as(e)),Rt(e.transport==="unknown"?"unknown":e.transport,"neutral"));let s=a("div","mc-meta");e.container==="legacy"&&s.append(a("span","mc-stat","deprecated entry")),e.environmentKeys.length>0&&s.append(a("span","mc-stat",`env ${e.environmentKeys.length}`)),e.headerKeys.length>0&&s.append(a("span","mc-stat",`headers ${e.headerKeys.length}`)),e.timeout!==null&&s.append(a("span","mc-stat",`timeout ${e.timeout}`)),e.codemode&&s.append(a("span","mc-stat","codemode")),e.protocol!==null&&s.append(a("span","mc-stat",`protocol ${e.protocol}`));let l=e.transport==="remote"?e.url??"No URL":e.command.length>0?e.command.join(" "):e.state==="invalid"?"Definition is invalid":"No command",c=a("p","mc-desc mc-cmd",l);return o.append(r),s.childElementCount>0&&o.append(s),o.append(c),e.warnings.length>0&&o.append(a("p","mc-warn",e.warnings.slice(0,2).join(" \xB7 "))),t.append(o,Ns(e)),t},gn=()=>{if(lt.replaceChildren(),!g)return;let e=K?W.find(r=>r.id===K):null,o=(e?e.serverIds.map(r=>g?.servers.find(s=>s.id===r)).filter(r=>!!r):g.servers).filter(r=>Co?[r.id,...r.command,r.url??"",...r.environmentKeys,...r.headerKeys,...r.warnings].join(" ").toLowerCase().includes(Co):!0);if(o.length===0){let r=a("div","mc-empty");r.append(a("h2","",g.servers.length===0?"No MCP servers configured":e?"This group has no available servers":"No matching servers"),a("p","",g.servers.length===0?"Add a server, or import a manifest into ~/.config/opencode/opencode.json.":e?"Check whether the servers in this group were removed.":"Try a different search term.")),lt.append(r);return}for(let r of o)lt.append($s(r))},u=()=>{It.setAttribute("aria-busy",ne?"true":"false"),fs(),ms(),hs(),_s(),Ss(),Ms(),Ts(),us(),Ps(),gn(),rs.update({label:ne?"Reading\u2026":"Rescan",loading:ne,disabled:ne||!!d});let e=Pe();os.update({disabled:ne||!!d||!g||e}),ns.update({disabled:ne||!!d||!g||e}),ss.update({disabled:ne||!!d||!g||e})},Ds=e=>{Array.from(document.querySelectorAll("[data-server-id]")).find(o=>o.dataset.serverId===e)?.focus()},nt=async(e=!1,t=!1)=>{if(!ne){ne=!0,t||(Fe=null),e&&u();try{g=Ae(await ie("GET","/servers")),Fe=null}catch(o){t||(Fe=ae(o))}finally{ne=!1,u()}}},No=async(e=!1)=>{if(!(Xe&&!e||R)){Xe=!0,u();try{W=Go(await ie("GET","/groups")),ke=null,K&&!W.some(t=>t.id===K)&&(K=null)}catch(t){ke=es(t)}finally{Xe=!1,u()}}},hn=async(e=!1)=>{if(!ne){ne=!0,e&&u();try{g=Ae(await ie("GET","/servers")),Fe=null}catch(t){Fe=ae(t)}ne=!1,u()}},Hs=async(e,t)=>{if(!d){d=`toggle:${e.id}`,ge=null,se=null,Te=null,A=null,u();try{g=Ae(await ie("POST","/servers/toggle",{id:e.id,enabled:t})),A={text:t?`Enabled ${e.id}.`:`Disabled ${e.id}; OpenCode will drop its tools after the next config reload.`,tone:"success"},Ee.toast({kind:"success",message:t?`Enabled ${e.id}`:`Disabled ${e.id}`}).catch(()=>{})}catch(o){A={text:ae(o),tone:"error"},d=null,u(),nt(!1,!0);return}d=null,u(),Ds(e.id)}},Fs=e=>{d||(Te=e,ge=null,se=null,A=null,u(),re.scrollIntoView({block:"nearest"}),re.querySelector("button")?.focus())},Xs=async e=>{if(!d){Te=null,d=`remove:${e}`,A=null,u();try{let t=await ie("POST","/servers/remove",{id:e}),o=Z(t),r=oe(o?.removedPaths);g=Ae(t),M?.id===e&&(M=null,Q=null),A={text:`Removed ${e}${r.length>1?` from ${r.length} config files`:" from opencode.json"}.`,tone:"success"},Ee.toast({kind:"success",message:`Removed ${e}`}).catch(()=>{})}catch(t){A={text:ae(t),tone:"error"},d=null,u(),nt(!1,!0);return}d=null,u()}},Bs=async(e,t)=>{if(!d&&!(!e.serverId||!t)){d=`resolve:${e.serverId}`,A=null,u();try{let o=await ie("POST","/servers/resolve",{id:e.serverId,keep:t}),r=Z(o),s=typeof r?.backupPath=="string"?r.backupPath:null;g=Ae(o),A={text:`Kept the definition in ${t.split("#")[0]??t}${s?`; previous content copied to ${s}`:""}.`,tone:"success"},Ee.toast({kind:"success",message:"Config conflict resolved"}).catch(()=>{})}catch(o){A={text:ae(o),tone:"error"},d=null,u(),nt(!1,!0);return}d=null,u()}},bn=e=>{!g||d||(ge=e,se=null,Te=null,A=null,u(),re.scrollIntoView({block:"nearest"}),re.querySelector("button")?.focus())},zs=async()=>{if(ge===null||d)return;let e=ge;ge=null,se=null,d="bulk",A=null,u();try{let t=await ie("POST","/servers/bulk",{enabled:e}),o=Z(t),r=oe(o?.changed);g=Ae(t),A={text:`${r.length} server${r.length===1?"":"s"} ${e?"enabled":"disabled"}.`,tone:"success"},Ee.toast({kind:"success",message:`${r.length} servers ${e?"enabled":"disabled"}`}).catch(()=>{})}catch(t){A={text:ae(t),tone:"error"},d=null,u(),nt(!1,!0);return}d=null,u()};Ee.onReady(e=>{if(lo(e,document.documentElement),document.documentElement.lang="en",Jr){u();return}Jr=!0,hn(!0),No(!0)});u();})();
