"use strict";(()=>{var A="openchamber.sdk";var ft="data-oc-scrolling",Mt=`
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
:hover, [${ft}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${ft}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${ft}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${ft}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function Lt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",n=>{let s=n.target===e?t:n.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let c=o.get(s);c!==void 0&&clearTimeout(c),o.set(s,setTimeout(()=>{o.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var xr=`(${Lt.toString()})(document);`;var Qo=/^[a-z][a-z0-9-]{0,39}$/;var Jo=e=>Object(e)===e&&!Array.isArray(e),Gt=(e,t)=>Object.keys(e).every(o=>t.includes(o)),Yo=e=>String(e)===e&&e.length>=1&&e.length<=60,qo=e=>String(e)===e&&e.length>=1&&e.length<=80,Zo=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!Jo(o)||!Qo.test(o.id)||!Yo(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!Gt(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!Gt(o,["kind","id","label","value","options","disabled"])||!qo(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let n=new Set;for(let s of o.options){if(!Jo(s)||!Gt(s,["value","label"])||!qo(s.value)||!Yo(s.label)||n.has(s.value))return!1;n.add(s.value)}if(!n.has(o.value))return!1}return!0};var Pt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,en=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var tn=/^[A-Za-z0-9_-]{1,80}$/;var on=["left","right","top","bottom"];var nn=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let n=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of n)if(!nn(s,t+1,o))return!1;return!0},Nt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(Nt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(Nt)}return String(e)===e||Number.isFinite(e)},$t=e=>{try{return String(e.id)!==e.id||!tn.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!on.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!nn(e.data)||!Nt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var sn=["file","directory","other","missing"],Ht=e=>!!(e&&"sessionId"in e),Ft=e=>!!(e&&"sent"in e&&!("sessionId"in e));var an=/^[0-9a-f]{7,64}$/i,Xt=e=>an.test(e),gt=500,ht=32e3,cn=16e3,ln=128,dn=200,pn=2e3,un=16e3,mn=80,fn=200,gn=16e3;var hn=2e3;var Bt=2e4,bt=1024,Et=2e6;var xt=64e3,vt=8e3,zt=4e3;var Vt=96e4,vr=60*6e4;var bn=999,En=1e4,it=500,xn=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],vn=["stopped","starting","ready","failed"],Sr=new Set(xn),Sn=e=>Sr.has(e),_n=e=>e&&Sn(e)?e:"HOST_REJECTED",Ve=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Ve):Object(e)===e?Object.values(e).every(Ve):!1,Tn=e=>Ve(e)&&JSON.stringify(e).length<=gn,rn=e=>e?.trim().slice(0,fn)??"",je=e=>{let t=e.id.trim().slice(0,ln),o=e.title.trim().slice(0,dn),n=e.url.trim().slice(0,pn),s=e.text?.trim().slice(0,un),c=e.author?.trim().slice(0,mn),l=e.kind==="pull"?"pull":"issue",p={providerId:e.providerId.trim(),id:t,title:o||t,url:n,kind:l};if(s&&(p.text=s),c&&(p.author=c),l==="pull"){let v=rn(e.branches?.head),w=rn(e.branches?.base);v&&w&&(p.branches={head:v,base:w})}return Tn(e.data)&&(p.data=e.data),p},jt=e=>{let t=je(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Kt=e=>{let t={text:e.text.trim().slice(0,cn)};return e.send&&(t.send=!0),t},Wt=e=>e===null||!Number.isFinite(e)?null:Math.min(bn,Math.max(0,Math.round(e))),Jt=e=>Number.isFinite(e)?Math.min(En,Math.max(0,Math.ceil(e))):0;var Ke=e=>e.length>0&&e.length<=bt&&!e.includes("\0")&&!e.includes("\\");var St=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>hn?!1:!e.split("/").some(o=>o==="."||o===".."),_r=new Set(vn),Yt=e=>!!(e&&"status"in e&&_r.has(String(e.status))&&!("body"in e)),_t=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),qt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Qt=e=>!!(e&&"written"in e&&e.written===!0),Zt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Tr=new Set(sn),eo=e=>!!(e&&"kind"in e&&"size"in e&&Tr.has(String(e.kind))&&Number.isFinite(e.size)),to=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),yr=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),kr=e=>Object(e)===e?e:null,Dt=e=>String(e)===e&&e.length>0,Ar=e=>{if(!Dt(e.id))return null;if(e.ok===!0){let t={channel:A,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&Dt(e.error)?{channel:A,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:_n(Dt(e.code)?e.code:void 0)}:null},oo=e=>{let t=kr(e);return!t||t.channel!==A||t.v!==1?null:t.type==="result"?Ar(t):!yr.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var yn=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,wr=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",E=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},kn=()=>Promise.reject(new E("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Tt=()=>Promise.reject(new E("BAD_PATH",`File path must be 1 to ${bt} characters without NUL or backslash.`)),yt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new E("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},T=e=>(e.value+=1,`oc-${e.value}`),ao=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new E("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(r=>r===t.parent),n=e.requestTimeoutMs??Bt,s=new Set,c=new Set,l=new Set,p=new Set,v=new Set,w=new Set,f=new Set,m=new Set,R=new Set,P=new Set,J=[],y=null,$=null,M=new Set,pe=new Set,ae=null,Ne=null,ze=!1,we=new Map,Oe=new Map,Re=new Map,ue=!1,S={value:0},x=null,_=null,B=!1,st=!1,No=null,$o=r=>r?{sessionId:r.id,phase:r.busy?"started":"completed"}:null,me=r=>{t.parent.postMessage(r,"*")},Do=()=>{ue||t.parent===t||P.size===0||x?.features?.lateGenerateResults!==!0||me({channel:A,v:1,type:"generate-late-listen"})},F=(r,i)=>{for(let g of r)try{g(i)}catch(b){console.error(b)}},Ho=r=>{if(!(r instanceof MessageEvent)||!o(r.source))return;let i=oo(r.data);if(!i)return;if(i.type==="workspace"){let b=Oe.get(i.payload.subscriptionId);b&&F([b],i.payload.snapshot);return}if(i.type==="shells"){let b=Re.get(i.payload.subscriptionId);b&&F([b],i.payload.snapshot);return}if(i.type==="ready"){x=i.payload,_=$o(i.payload.session),F(s,i.payload),F(c,i.payload.directory),F(l,i.payload.session),_&&F(p,_),F(v,i.payload.connection),F(w,i.payload.settings),F(f,i.payload.item),Do();return}if(i.type==="generate-late"){P.size===0?J.push(i.payload):F(P,i.payload);return}if(i.type==="directory"){x&&(x={...x,directory:i.payload.directory}),F(c,i.payload.directory);return}if(i.type==="session"){x&&(x={...x,session:i.payload.session}),i.payload.session?_?.sessionId!==i.payload.session.id&&(_=$o(i.payload.session)):_=null,F(l,i.payload.session);return}if(i.type==="session-lifecycle"){_=i.payload,F(p,i.payload);return}if(i.type==="connection"){x&&(x={...x,connection:i.payload.connection}),F(v,i.payload.connection);return}if(i.type==="settings"){x&&(x={...x,settings:i.payload.settings}),F(w,i.payload.settings);return}if(i.type==="item"){x&&(x={...x,item:i.payload.item}),F(f,i.payload.item);return}if(i.type==="status-control-event"){F(m,i.payload);return}if(i.type==="popover-closed"){F(R,i.payload);return}if(i.type==="action"){let b=L=>{ue||me({channel:A,v:1,type:"action-result",id:i.id,payload:L})},N=$;if(!N){b({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>N(i.payload)).then(()=>b({ok:!0}),L=>{let j=(L instanceof Error?L.message:String(L)).trim();b({ok:!1,error:(j||"Action failed.").slice(0,it)})});return}if(i.type==="file-open"){let b=i.payload;if(Ne&&en(Ne,b))return;Ne=b,F(M,i.payload);return}if(i.type==="file-saved"){F(pe,i.payload.version);return}if(i.type==="file-snapshot"){let b=j=>{ue||me({channel:A,v:1,type:"file-snapshot-result",id:i.id,payload:j})},N=j=>b({error:(j.trim()||"Could not read the edited file.").slice(0,it)}),L=ae;if(!L){N("This extension does not edit files.");return}Promise.resolve().then(()=>L(i.payload.purpose)).then(j=>{if(Pt(j)>2e7){N(`The file is over ${2e7} ${"bytes"in j?"bytes":"characters"}.`);return}if(j.version.length>256){N(`The snapshot version is over ${256} characters.`);return}b({snapshot:"bytes"in j?{bytes:j.bytes,version:j.version}:{content:j.content,version:j.version}})},j=>N(j instanceof Error?j.message:String(j)));return}if(i.type==="resolve"){let b=L=>{me({channel:A,v:1,type:"resolve-result",id:i.id,payload:L})},N=y;if(!N){b({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>N(i.payload)).then(L=>b({item:L?je(L):null}),L=>{let j=(L instanceof Error?L.message:String(L)).trim();b({error:(j||"Command failed.").slice(0,it)})});return}let g=we.get(i.id);if(g){if(clearTimeout(g.timer),we.delete(i.id),i.ok){g.resolve(i.payload);return}g.reject(new E(i.code,i.error))}};t.addEventListener("message",Ho),me({channel:A,v:1,type:"hello"});let ee=(r,i=n)=>ue||t.parent===t?Promise.reject(new E("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((g,b)=>{let N=setTimeout(()=>{we.delete(r.id),b(new E("HOST_TIMEOUT","Host did not answer in time."))},i);we.set(r.id,{resolve:g,reject:b,timer:N}),me(r)}),z=r=>ee(r).then(()=>{}),V={channel:A,v:1},It=r=>{!ue&&t.parent!==t&&me(r)},Fo=()=>It({...V,type:"file-save"}),Xo=r=>{!yn(r)||!wr(r)||(r.preventDefault(),Fo())},Bo=r=>{!yn(r)||r.key!=="Escape"||x?.surface!=="popover"||!x.popover||(r.preventDefault(),Ko(x.popover.id,"escape").catch(()=>{}))},pt=()=>{let r=x?.surface==="popover"?x.popover:void 0;if(!r)return;let i=B||st;No!==i&&(No=i,Wo(r.id,i).catch(()=>{}))},ut=()=>{x?.surface!=="popover"||B||(B=!0,pt())},zo=r=>{x?.surface!=="popover"||r.relatedTarget!==null||!B||(B=!1,pt())},Vo=()=>{x?.surface!=="popover"||st||(st=!0,pt())},jo=()=>{x?.surface!=="popover"||!st||(st=!1,pt())},be=(r,i=1024)=>{if(!r.trim()||r.length>i)throw new E("HOST_REJECTED",`Identity must contain 1 to ${i} characters.`)},Ct=async r=>{r.kind!=="projects"&&be(r.projectId);let i=await ee({...V,type:"workspace-read",id:T(S),payload:r});if(!i||!("kind"in i)||!("state"in i)||i.kind!==r.kind)throw new E("HOST_REJECTED","Host did not return workspace data.");return i},Ut=async(r,i)=>{r.kind!=="projects"&&be(r.projectId);let g=T(S);Oe.set(g,i);try{await z({...V,type:"workspace-subscribe",id:T(S),payload:{subscriptionId:g,query:r}})}catch(b){throw Oe.delete(g),ue||me({...V,type:"workspace-unsubscribe",id:T(S),payload:{subscriptionId:g}}),b}return()=>{!Oe.delete(g)||ue||me({...V,type:"workspace-unsubscribe",id:T(S),payload:{subscriptionId:g}})}},Er=async(r,i)=>{r.kind==="session"&&be(r.sessionId),r.kind==="project"&&be(r.projectId);let g=T(S);Re.set(g,i);try{await z({...V,type:"shells-subscribe",id:T(S),payload:{subscriptionId:g,scope:r}})}catch(b){throw Re.delete(g),ue||me({...V,type:"shells-unsubscribe",id:T(S),payload:{subscriptionId:g}}),b}return()=>{!Re.delete(g)||ue||me({...V,type:"shells-unsubscribe",id:T(S),payload:{subscriptionId:g}})}},mt=async r=>{if("key"in r&&(r.key.length===0||r.key.length>128))throw new E("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(r.op==="set"&&!Ve(r.value))throw new E("HOST_REJECTED","Storage values must be JSON.");if(r.op==="set"&&new TextEncoder().encode(JSON.stringify(r.value)).length>65536)throw new E("HOST_REJECTED","Storage value exceeds 64 KiB.");if(r.scope==="device"&&x?.features?.deviceStorage!==!0)throw new E("UNSUPPORTED","This host does not support device storage.");let i=await ee({...V,type:"storage",id:T(S),payload:r});if(!i||!("storage"in i)||i.op!==r.op)throw new E("HOST_REJECTED","Host did not return storage data.");return i},Ko=(r,i)=>x?.features?.popovers!==!0&&!(x?.surface==="popover"&&x.popover?.id===r)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):z({...V,type:"popover-close",id:T(S),payload:i?{id:r,reason:i}:{id:r}}),Wo=(r,i)=>x?.features?.popovers!==!0&&!(x?.surface==="popover"&&x.popover?.id===r)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):z({...V,type:"popover-anchor",id:T(S),payload:{id:r,active:i}});return t.addEventListener("keydown",Bo,!0),t.addEventListener("pointerover",ut),t.addEventListener("pointermove",ut),t.addEventListener("pointerout",zo),t.addEventListener("focus",Vo),t.addEventListener("blur",jo),{onAction:r=>($=r,()=>{$===r&&($=null)}),listProjects:async()=>{let r=await Ct({kind:"projects"});if(r.kind!=="projects")throw new E("HOST_REJECTED","Expected projects.");return r},listWorktrees:async r=>{let i=await Ct({kind:"worktrees",projectId:r});if(i.kind!=="worktrees")throw new E("HOST_REJECTED","Expected worktrees.");return i},listSessions:async r=>{let i=await Ct({kind:"sessions",projectId:r});if(i.kind!=="sessions")throw new E("HOST_REJECTED","Expected sessions.");return i},onProjects:r=>Ut({kind:"projects"},i=>{i.kind==="projects"&&r(i)}),onWorktrees:(r,i)=>Ut({kind:"worktrees",projectId:r},g=>{g.kind==="worktrees"&&i(g)}),onSessions:(r,i)=>Ut({kind:"sessions",projectId:r},g=>{g.kind==="sessions"&&i(g)}),onRunningShells:(r,i)=>Er(r,i),readShellOutput:async(r,i)=>{be(r,128);let g=i?.cursor;if(g!==void 0&&(!Number.isInteger(g)||g<0))throw new E("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let b=i?.tailBytes;if(b!==void 0&&(!Number.isInteger(b)||b<1||b>65536))throw new E("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let L=await ee({...V,type:"shell-output",id:T(S),payload:{shellId:r,cursor:g,tailBytes:b}});if(!L||typeof L.output!="string"||!Number.isFinite(L.cursor))throw new E("HOST_REJECTED","Host did not return shell output.");return L},stopShell:async r=>{if(be(r,128),(await ee({...V,type:"shell-stop",id:T(S),payload:{shellId:r}}))?.stopped!==!0)throw new E("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async r=>{be(r),await z({...V,type:"open-session",id:T(S),payload:{sessionId:r}})},storage:{get:async(r,i)=>{let g=yt(i),b={op:"get",key:r};g&&(b.scope=g);let N=await mt(b);return N.op==="get"&&N.found?N.value:void 0},set:async(r,i,g)=>{let b=yt(g),N={op:"set",key:r,value:i};b&&(N.scope=b),await mt(N)},delete:async(r,i)=>{let g=yt(i),b={op:"delete",key:r};g&&(b.scope=g),await mt(b)},keys:async r=>{let i=yt(r),g={op:"keys"};i&&(g.scope=i);let b=await mt(g);if(b.op!=="keys")throw new E("HOST_REJECTED","Expected storage keys.");return b.keys}},onReady:r=>(s.add(r),x&&r(x),()=>{s.delete(r)}),onDirectory:r=>(c.add(r),x&&r(x.directory),()=>{c.delete(r)}),onSession:r=>(l.add(r),x&&r(x.session),()=>{l.delete(r)}),onSessionLifecycle:r=>(p.add(r),_&&r(_),()=>{p.delete(r)}),onConnection:r=>(v.add(r),x&&r(x.connection),()=>{v.delete(r)}),onSettings:r=>(w.add(r),x&&r(x.settings),()=>{w.delete(r)}),onItem:r=>(f.add(r),x&&r(x.item),()=>{f.delete(r)}),onStatusControl:r=>(m.add(r),()=>{m.delete(r)}),onPopoverClosed:r=>(R.add(r),()=>{R.delete(r)}),setStatusControls:r=>x?.features?.statusControls!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support status controls.")):Zo(r)?z({...V,type:"status-controls",id:T(S),payload:{controls:r}}):Promise.reject(new E("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:r=>x?.features?.popovers!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):$t(r)?z({...V,type:"popover-open",id:T(S),payload:r}):Promise.reject(new E("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Ko,setPopoverAnchorActive:Wo,onResolve:r=>(y=r,()=>{y===r&&(y=null)}),toast:r=>{let i=r.message.trim();return!i||i.length>gt?Promise.reject(new E("HOST_REJECTED",`Toast message must contain 1 to ${gt} characters.`)):r.copy&&r.copy!==!0&&(!r.copy.text.length||r.copy.text.length>ht)?Promise.reject(new E("HOST_REJECTED",`Toast copy text must contain 1 to ${ht} characters.`)):z({channel:A,v:1,type:"toast",id:T(S),payload:{...r,message:i}})},openUrl:r=>z({channel:A,v:1,type:"open-url",id:T(S),payload:{url:r}}),openCommit:r=>Xt(r)?z({channel:A,v:1,type:"open-commit",id:T(S),payload:{sha:r}}):Promise.reject(new E("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),openSurface:r=>z({channel:A,v:1,type:"open-surface",id:T(S),payload:{surfaceId:r}}),writeClipboard:r=>z({channel:A,v:1,type:"clipboard-write",id:T(S),payload:{text:r}}),compose:r=>z({channel:A,v:1,type:"compose",id:T(S),payload:r}),attach:r=>z({channel:A,v:1,type:"attach",id:T(S),payload:je(r)}),startSession:async r=>{r.projectId!==void 0&&be(r.projectId);let i=r.worktree;i&&i!==!0&&(i.kind==="existing"?be(i.directory):(i.name!==void 0&&be(i.name,200),i.baseBranch!==void 0&&be(i.baseBranch,200)));let g=await ee({channel:A,v:1,type:"start-session",id:T(S),payload:jt(r)},e.requestTimeoutMs??18e4);if(!Ht(g))throw new E("HOST_REJECTED","Host did not return a session.");return g},prompt:r=>ee({channel:A,v:1,type:"prompt",id:T(S),payload:Kt(r)}).then(i=>{if(!Ft(i))throw new E("HOST_REJECTED","Host did not return a prompt result.");return i}),sessionLink:r=>z({channel:A,v:1,type:"session-link",id:T(S),payload:je(r)}),close:()=>z({channel:A,v:1,type:"close",id:T(S)}),oauthStart:()=>z({channel:A,v:1,type:"oauth-start",id:T(S)}),oauthDisconnect:()=>z({channel:A,v:1,type:"oauth-disconnect",id:T(S)}),request:r=>(St(r.path)?ee({channel:A,v:1,type:"request",id:T(S),payload:r}):kn()).then(i=>{if(!_t(i))throw new E("HOST_REJECTED","Host request result was empty.");return i}),serviceRequest:r=>(St(r.path)?ee({channel:A,v:1,type:"service-request",id:T(S),payload:r}):kn()).then(i=>{if(!_t(i))throw new E("HOST_REJECTED","Host service request result was empty.");return i}),serviceStatus:()=>ee({channel:A,v:1,type:"service-status",id:T(S)}).then(r=>{if(!Yt(r))throw new E("HOST_REJECTED","Host did not return service status.");return r}),readFile:r=>(Ke(r)?ee({channel:A,v:1,type:"file-read",id:T(S),payload:{path:r}}):Tt()).then(i=>{if(!qt(i))throw new E("HOST_REJECTED","Host did not return file content.");return i}),writeFile:(r,i)=>Ke(r)?i.length>Et?Promise.reject(new E("FILE_TOO_LARGE",`Content is over ${Et} characters.`)):ee({channel:A,v:1,type:"file-write",id:T(S),payload:{path:r,content:i}}).then(g=>{if(!Qt(g))throw new E("HOST_REJECTED","Host did not confirm the write.");return g}):Tt(),listDir:r=>(Ke(r)?ee({channel:A,v:1,type:"file-list",id:T(S),payload:{path:r}}):Tt()).then(i=>{if(!Zt(i))throw new E("HOST_REJECTED","Host did not return directory entries.");return i}),stat:r=>(Ke(r)?ee({channel:A,v:1,type:"file-stat",id:T(S),payload:{path:r}}):Tt()).then(i=>{if(!eo(i))throw new E("HOST_REJECTED","Host did not return file status.");return i}),generate:r=>{let i=r.prompt.trim(),g=r.system?.trim();if(i.length===0||i.length>xt)return Promise.reject(new E("HOST_REJECTED",`Prompt must be 1 to ${xt} characters.`));if(g!==void 0&&(g.length===0||g.length>vt))return Promise.reject(new E("HOST_REJECTED",`System prompt must be 1 to ${vt} characters.`));let b=r.maxOutputTokens===void 0?void 0:Math.min(zt,Math.max(1,Math.floor(r.maxOutputTokens)));if(b!==void 0&&!Number.isFinite(b))return Promise.reject(new E("HOST_REJECTED","maxOutputTokens must be a number."));let N={prompt:i};return g!==void 0&&(N.system=g),b!==void 0&&(N.maxOutputTokens=b),ee({channel:A,v:1,type:"generate",id:T(S),payload:N},e.requestTimeoutMs??Vt).then(L=>{if(!to(L))throw new E("HOST_REJECTED","Host did not return generated text.");return L})},onLateGenerateResult:r=>{P.add(r);for(let i of J.splice(0))F([r],i);return Do(),()=>{P.delete(r)}},setBadge:r=>z({channel:A,v:1,type:"badge",id:T(S),payload:{count:Wt(r)}}),setHeight:r=>z({channel:A,v:1,type:"resize",id:T(S),payload:{height:Jt(r)}}),onFileOpen:r=>(M.add(r),ze||(ze=!0,t.addEventListener("keydown",Xo,!0)),Ne&&r(Ne),()=>{M.delete(r)}),onFileSnapshot:r=>(ae=r,()=>{ae===r&&(ae=null)}),onFileSaved:r=>(pe.add(r),()=>{pe.delete(r)}),reportFileChange:r=>It({...V,type:"file-change",payload:{dirty:r.dirty,edited:r.edited}}),requestFileSave:Fo,reportFileUnsupported:()=>It({...V,type:"file-unsupported"}),dispose:()=>{for(let r of Oe.keys())me({...V,type:"workspace-unsubscribe",id:T(S),payload:{subscriptionId:r}});Oe.clear();for(let r of Re.keys())me({...V,type:"shells-unsubscribe",id:T(S),payload:{subscriptionId:r}});Re.clear(),ue=!0,y=null,$=null,ae=null,M.clear(),pe.clear(),ze&&t.removeEventListener("keydown",Xo,!0),t.removeEventListener("message",Ho),t.removeEventListener("keydown",Bo,!0),t.removeEventListener("pointerover",ut),t.removeEventListener("pointermove",ut),t.removeEventListener("pointerout",zo),t.removeEventListener("focus",Vo),t.removeEventListener("blur",jo);for(let r of we.values())clearTimeout(r.timer),r.reject(new E("HOST_UNAVAILABLE","Host client was disposed."));we.clear(),s.clear(),c.clear(),l.clear(),p.clear(),v.clear(),w.clear(),f.clear(),m.clear(),R.clear(),P.clear(),J.length=0}}};var On=["browser.open","browser.snapshot","browser.click","browser.type","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var pi=new Set(On);var Rn=["none","agent","user"];var mi=new Set(Rn);var Or=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Rr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],In=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,n]of Or)t.style.setProperty(o,e.tokens[n]);for(let[o,n,s]of Rr){let c=e.tokens[s]??"";t.style.setProperty(o,c),t.style.setProperty(n,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},co=(e,t)=>{In(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Ir={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},H=(e,t)=>`var(--${e}, var(--oc-${Ir[e]}, ${t}))`,Ce=H("surface-background","transparent"),At=H("surface-elevated","transparent"),We=H("surface-elevated-foreground","inherit"),he=H("surface-foreground","inherit"),D=H("surface-muted-foreground","gray"),Cr=H("surface-muted","transparent"),$e=H("interactive-border","currentColor"),te=H("interactive-hover","transparent"),De=H("interactive-active","transparent"),lo=H("interactive-selection","transparent"),po=H("interactive-selection-foreground","inherit"),Ie=H("primary","currentColor"),uo=H("primary-text","inherit"),mo=H("error-text","inherit"),Ur=H("font-sans","inherit"),fo=H("font-mono","monospace"),Gn=H("radius","9px"),go=`calc(${Gn} - 2px)`,Cn=`calc(${Gn} - 4px)`,X=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,Un=`background-image: linear-gradient(${te}, ${te});`,ho=e=>`box-shadow: inset 0 0 0 1px ${e}, var(--oc-sdk-field-lift);`,bo="box-shadow: inset 0 0 0 1px var(--oc-sdk-edge), var(--oc-sdk-raised-lift);",Mn="box-shadow: var(--oc-sdk-lit);",Ln=`inset 0 1px 0 0 ${X(he,1.5)}, 0 1px 1px 0 rgb(0 0 0 / 0.28), 0 2px 3px -2px rgb(0 0 0 / 0.2)`,Mr=`
:root {
  --oc-sdk-edge: ${X(he,10)};
  --oc-sdk-field-bg: ${At};
  --oc-sdk-raised-bg: ${Ce};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 2px 0 rgb(0 0 0 / 0.06);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.45), 0 1px 2px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.8), inset 0 0 0 1px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.1), 0 1px 2px -0.5px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.08);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${X(he,6)};
  --oc-sdk-field-bg: ${X(Ce,50,At)};
  --oc-sdk-raised-bg: ${At};
  --oc-sdk-field-lift: ${Ln};
  --oc-sdk-raised-lift: ${Ln};
  --oc-sdk-lit: inset 0 1px 0 0 ${X(he,1.5)}, 0 1px 1px 0 rgb(0 0 0 / 0.28), 0 2px 3px -2px rgb(0 0 0 / 0.2);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.36), 0 1px 1px -0.5px rgb(0 0 0 / 0.22), 0 3px 3px -1.5px rgb(0 0 0 / 0.2), 0 6px 6px -3px rgb(0 0 0 / 0.16);
}`,kt=e=>{let t=H(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${H(`${e}-text`,"inherit")}; }`},Lr=`
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
`,Pn=`${Mr}
.oc-sdk { color: ${he}; font-family: ${Ur}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Un} }
.oc-sdk-mono { font-family: ${fo}; }
.oc-sdk-muted { color: ${D}; }
${kt("success")}${kt("warning")}${kt("error")}${kt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Ie}; --oc-sdk-tone-text: ${uo}; }

.oc-sdk-btn { border-radius: ${go}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Cn}; }
.oc-sdk-btn[data-variant="default"] { color: ${uo}; background: ${X(Ie,10,Ce)}; border-color: ${X(Ie,12)}; ${Mn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${X(Ie,16,Ce)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${X(Ie,22,Ce)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Cr}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${De}, ${De}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${We}; border-color: transparent; ${bo} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${De}, ${De}); box-shadow: inset 0 0 0 1px var(--oc-sdk-edge); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${te}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${De}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${H("status-error","red")}; color: ${mo}; background: ${X("var(--oc-sdk-tone)",7,Ce)}; border-color: ${X("var(--oc-sdk-tone)",12)}; ${Mn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${X("var(--oc-sdk-tone)",9,Ce)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${X("var(--oc-sdk-tone)",11,Ce)}; box-shadow: none; }

.oc-sdk-field-note { color: ${D}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${mo}; }
.oc-sdk-input { border-radius: ${go}; background: var(--oc-sdk-field-bg); color: ${We}; ${ho("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${D}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${ho(X(he,26))} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${ho(H("status-error","red"))} }
.oc-sdk-input[data-mono="true"] { font-family: ${fo}; }

.oc-sdk-search-icon { color: ${D}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Ie}; }
.oc-sdk-search-clear { border-radius: ${Cn}; color: ${D}; }
.oc-sdk-search-clear:hover { background: ${te}; color: ${he}; }

.oc-sdk-trigger { border-color: transparent; border-radius: ${go}; background: var(--oc-sdk-raised-bg); color: ${We}; ${bo} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${De}, ${De}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${D}; }
.oc-sdk-trigger-chevron { color: ${D}; }
/* The app's dropdown light: lit top, hairline rings and a layered shadow, no border. */
.oc-sdk-popup { --surface-foreground: ${We}; border-color: transparent; border-radius: 12px; background: ${At}; color: ${We}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${te}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${lo}; color: ${po}; }
.oc-sdk-option-check { color: ${he}; }
.oc-sdk-option[data-destructive="true"] { color: ${mo}; }
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
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Un} }
.oc-sdk-check-desc { color: ${D}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${X(he,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${D}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${he}; }
.oc-sdk-tab[aria-selected="true"] { color: ${po}; background: ${lo}; border-color: ${$e}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${We}; background: var(--oc-sdk-raised-bg); border-color: transparent; ${bo} }
.oc-sdk-tab-count { color: ${D}; }

.oc-sdk-badge { border-radius: 9999px; background: ${te}; color: ${D}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${X("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${te}; }
.oc-sdk-row[aria-selected="true"] { background: ${lo}; color: ${po}; }
.oc-sdk-row-lead { font-family: ${fo}; color: ${D}; }
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

.oc-sdk-text a { color: ${uo}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${X($e,60)}; }
`,q=`
${Mt}
${Lr}
${Pn}`;var Nn="oc-sdk-ui-style",Je=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},Q=e=>{let t=document.getElementById(Nn);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}Lt(document);let o=document.createElement("style");o.id=Nn,o.textContent=e,document.head.appendChild(o)},C=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},ve=e=>{let t=C("button",e);return t.type="button",t},fe=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},Ye=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},$n=(e,t)=>{let o=n=>{n.target instanceof Node&&e.contains(n.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var Gr=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Ue=(e,t)=>{Q(q);let o=t,n=ve("oc-sdk oc-sdk-btn"),s=Gr(),c=document.createElement("span");n.append(c),e.append(n);let l=()=>{n.dataset.variant=o.variant??"default",n.dataset.size=o.size??"default",n.disabled=!!o.disabled||!!o.loading,n.dataset.loading=o.loading?"true":"false",n.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&s.parentNode!==n?n.prepend(s):!o.loading&&s.parentNode===n&&s.remove(),fe(c,o.label)},p=()=>{o.disabled||o.loading||o.onClick()};return n.addEventListener("click",p),l(),{update:v=>{o={...o,...v},l()},dispose:()=>{n.removeEventListener("click",p),n.remove()}}};var Dn="http://www.w3.org/2000/svg",Pr={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},qe=(e,t,o)=>{let n=document.createElementNS(Dn,"svg");n.setAttribute("viewBox","0 0 24 24"),n.setAttribute("width",String(t)),n.setAttribute("height",String(t)),n.setAttribute("aria-hidden","true"),n.setAttribute("fill","currentColor"),o&&n.setAttribute("class",o);let s=document.createElementNS(Dn,"path");return s.setAttribute("d",Pr[e]),n.append(s),n};var He=(e,t="vertical")=>{let[o,n]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===n||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Qe=(e,t,o)=>{let n=e.filter(v=>!v.disabled);if(n.length===0)return null;let s=n[0],c=n[n.length-1];if(o==="first"||!s||!c)return s?.id??null;if(o==="last")return c.id;let l=n.findIndex(v=>v.id===t);return l===-1?o==="next"?s.id:c.id:n[Math.min(n.length-1,Math.max(0,l+(o==="next"?1:-1)))]?.id??null};var Hn=(e,t)=>`${e}-${t??""}`,Eo=(e,t,o,n)=>{let s=ve("oc-sdk-option");s.id=Hn(e,o.id),s.setAttribute("role",t),s.tabIndex=-1,s.disabled=!!o.disabled,t==="option"&&s.setAttribute("aria-selected",o.selected?"true":"false"),s.dataset.destructive=o.destructive?"true":"false";let c=C("span","oc-sdk-option-label");if(c.textContent=o.label,s.append(c),o.hint){let l=C("span","oc-sdk-option-hint");l.textContent=o.hint,s.append(l)}if(t==="option"){s.dataset.mark="check";let l=C("span","oc-sdk-option-check");l.append(qe("check",14)),s.append(l)}return s.addEventListener("pointerenter",n.hover),s.addEventListener("click",n.pick),s},xo=(e,t,o,n)=>{let s=Hn(o,n);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===s?"true":"false");Ye(t,"aria-activedescendant",n?s:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Nr=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let n=e.offsetHeight,s=window.innerHeight-o.bottom-8;n>s&&o.top-8>s&&(e.style.top=`${Math.max(8,Math.round(o.top-4-n))}px`);let c=o.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(o.left-c))}px`)},vo=(e,t,o,n)=>{e.append(o),Nr(o,t);let s=$n(e,n),c=()=>{n()},l=p=>{p.target instanceof Node&&o.contains(p.target)||n()};return window.addEventListener("resize",c),window.addEventListener("scroll",l,!0),()=>{s(),window.removeEventListener("resize",c),window.removeEventListener("scroll",l,!0),o.remove()}};var Fn=(e,t)=>{let o=t.trim().toLowerCase();return o?e.filter(n=>n.label.toLowerCase().includes(o)||n.id.toLowerCase().includes(o)):[...e]},$r=0,So=(e,t)=>{Q(q);let o=t,n=`oc-sdk-select-${$r+=1}`,s=C("div","oc-sdk oc-sdk-select"),c=C("span","oc-sdk-field-label");c.id=`${n}-label`;let l=ve("oc-sdk-trigger");l.setAttribute("aria-haspopup","listbox"),l.setAttribute("aria-labelledby",c.id);let p=C("span","oc-sdk-trigger-value");l.append(p,qe("chevron",14,"oc-sdk-trigger-chevron")),s.append(c,l),e.append(s);let v="",w=null,f=null,m=C("div","oc-sdk oc-sdk-popup"),R=C("div","oc-sdk-popup-search"),P=C("input","oc-sdk-input");P.type="text",P.autocomplete="off",R.append(P);let J=C("div");J.setAttribute("role","listbox"),J.tabIndex=-1,m.append(J);let y=()=>Fn(o.options,o.searchable?v:""),$=()=>o.searchable?P:J,M=_=>{w=_,xo(J,$(),n,_)},pe=()=>{Je(J);let _=y();if(_.length===0){let B=C("div","oc-sdk-popup-empty");B.textContent="No matches",J.append(B)}for(let B of _)J.append(Eo(n,"option",{...B,selected:B.id===o.value},{hover:()=>M(B.id),pick:()=>ze(B.id)}));M(_.some(B=>B.id===w)?w:_[0]?.id??null)},ae=()=>{let _=f;f=null,_?.(),v="",P.value="",l.setAttribute("aria-expanded","false")},Ne=()=>{f||o.disabled||(w=o.value,P.placeholder=o.searchPlaceholder??"Search",o.searchable?m.prepend(R):R.remove(),pe(),f=vo(s,l,m,ae),l.setAttribute("aria-expanded","true"),$().focus())},ze=_=>{ae(),l.focus(),_!==o.value&&o.onChange(_)},we=()=>{f?ae():Ne()},Oe=_=>{!f&&He(_)&&(_.preventDefault(),Ne())},Re=_=>{let B=He(_);B?(_.preventDefault(),M(Qe(y(),w,B))):_.key==="Enter"?(_.preventDefault(),w&&ze(w)):_.key==="Escape"?(_.preventDefault(),ae(),l.focus()):o.searchable&&_.target!==P&&_.key.length===1&&!_.ctrlKey&&!_.metaKey&&P.focus()},ue=()=>{v=P.value,pe()},S=_=>{f&&!(_.relatedTarget instanceof Node&&s.contains(_.relatedTarget))&&ae()},x=()=>{fe(c,o.label),c.hidden=!o.label;let _=o.options.find(B=>B.id===o.value);fe(p,_?.label??o.placeholder??"Select"),p.dataset.empty=_?"false":"true",l.disabled=!!o.disabled,f&&pe()};return l.addEventListener("click",we),l.addEventListener("keydown",Oe),m.addEventListener("keydown",Re),P.addEventListener("input",ue),s.addEventListener("focusout",S),x(),{update:_=>{o={...o,..._},x()},dispose:()=>{ae(),l.removeEventListener("click",we),l.removeEventListener("keydown",Oe),m.removeEventListener("keydown",Re),P.removeEventListener("input",ue),s.removeEventListener("focusout",S),s.remove()}}};var Hr=/^[a-z0-9][a-z0-9-]{0,63}$/,Fr=new Set(["all","new"]),ce=class extends Error{constructor(t){super(t),this.name="GroupFileError"}};var Xn=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new ce("Invalid group config format");let t=e;if(t.version!==1)throw new ce("Unsupported group config version");if(!Array.isArray(t.groups))throw new ce("Invalid group list format");if(t.groups.length>50)throw new ce("Cannot have more than 50 groups");let o=[],n=new Set,s=new Set;for(let[c,l]of t.groups.entries()){if(!l||typeof l!="object"||Array.isArray(l))throw new ce(`Group ${c+1} has an invalid format`);let p=l;if(typeof p.id!="string"||!Hr.test(p.id)||Fr.has(p.id))throw new ce(`Group ${c+1} has an invalid ID`);if(n.has(p.id))throw new ce(`Duplicate group ID: ${p.id}`);let v=typeof p.name=="string"?p.name.trim():"";if(!v||v.length>40||/[\u0000-\u001f\u007f]/.test(v))throw new ce(`Group ${c+1} name must be 1-40 characters`);let w=v.toLowerCase();if(s.has(w))throw new ce(`Duplicate group name: ${v}`);if(!Array.isArray(p.serverIds))throw new ce(`Group "${v}" has an invalid member format`);if(p.serverIds.length>200)throw new ce(`Group "${v}" cannot have more than 200 members`);let f=[],m=new Set;for(let R of p.serverIds){if(typeof R!="string"||!R||R.length>128)throw new ce(`Group "${v}" contains an invalid server ID`);m.has(R)||(m.add(R),f.push(R))}n.add(p.id),s.add(w),o.push({id:p.id,name:v,serverIds:f})}return{version:1,groups:o}};var Bn=`:root {\r
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
`;var zn=`/* Shared foundation for OpenChamber extensions. Colors and fonts belong to the host. */\r
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
`;var xe=ao({requestTimeoutMs:3e4}),sr=document.querySelector("#root");if(!sr)throw new Error("Missing #root");var ir=document.createElement("style");ir.textContent=zn+Bn;document.head.append(ir);var a=(e,t="",o)=>{let n=document.createElement(e);return n.className=t,o!==void 0&&(n.textContent=o),n},zr=/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/,Vn="Values hidden by opencode.json stay blank; leaving them blank keeps what opencode.json already stores (kept from opencode.json).",jn="One KEY=VALUE per line.",Kn="One Name: value per line.",ye=class extends Error{code;conflicts;constructor(t,o,n){super(t),this.name="ServiceError",this.code=o,this.conflicts=n}},Z=e=>e&&typeof e=="object"&&!Array.isArray(e)?e:null,Ge=(e,t="")=>typeof e=="string"?e:t,Wn=e=>typeof e=="string"&&e.length>0?e:null,wt=e=>e===!0,Vr=e=>typeof e=="number"&&Number.isFinite(e)?e:0,le=e=>Array.isArray(e)?e.filter(t=>typeof t=="string"):[],jr=e=>e==="enabled"||e==="disabled"||e==="invalid"||e==="conflict",Kr=e=>e==="local"||e==="remote"||e==="unknown",Wr=e=>e==="both"||e==="read-error"||e==="duplicate"||e==="invalid"||e==="tools-off"||e==="insecure-url",Jr=e=>e==="auto"||e==="disabled"||e==="configured"||e==="none",Mo=e=>{let t=Z(e);return!t||!Wr(t.kind)?null:{kind:t.kind,serverId:Ge(t.serverId),message:Ge(t.message,"Conflict"),paths:le(t.paths),blocking:wt(t.blocking)}},Jn=e=>{let t=Z(e);return{path:Ge(t?.path),exists:wt(t?.exists),error:typeof t?.error=="string"?t.error:null}},Yr=e=>{let t=Z(e);if(!t||typeof t.id!="string"||!t.id||!jr(t.state))return null;let o=t.timeout;return{id:t.id,transport:Kr(t.transport)?t.transport:"unknown",command:le(t.command),url:Wn(t.url),cwd:Wn(t.cwd),environmentKeys:le(t.environmentKeys),headerKeys:le(t.headerKeys),timeout:typeof o=="number"&&Number.isFinite(o)?o:null,oauth:Jr(t.oauth)?t.oauth:"none",enabled:wt(t.enabled),state:t.state,advertised:wt(t.advertised),toolsOff:le(t.toolsOff),paths:le(t.paths),conflicts:Array.isArray(t.conflicts)?t.conflicts.map(Mo).filter(n=>n!==null):[],warnings:le(t.warnings),contentHash:Ge(t.contentHash)}},Ae=e=>{let t=Z(e);if(!t||!Array.isArray(t.servers))throw new ye("The service returned data in an invalid format.","parse",[]);let o=t.servers.map(Yr).filter(l=>l!==null),n=Array.isArray(t.conflicts)?t.conflicts.map(Mo).filter(l=>l!==null):o.flatMap(l=>l.conflicts),s=n.filter(l=>l.blocking).length,c={total:o.length,advertised:o.filter(l=>l.advertised).length,enabled:o.filter(l=>l.state==="enabled").length,disabled:o.filter(l=>l.state==="disabled").length,invalid:o.filter(l=>l.state==="invalid").length,blockingConflicts:s,warnings:n.length-s};return{servers:o,conflicts:n,summary:c,config:Jn(t.config),scanned:Array.isArray(t.scanned)?t.scanned.map(Jn).filter(l=>l.path.length>0):[],scannedAt:Vr(t.scannedAt)}},Lo=e=>{try{return Xn(e).groups}catch(t){throw new ye(t instanceof Error?t.message:"The group configuration format is invalid.","parse",[])}},qr=e=>{let t=Z(e),o=Z(t?.definition);return!t||!o||typeof t.id!="string"||!t.id?null:{id:t.id,definition:o,enabled:t.enabled!==!1}},Qr=e=>{let t=Z(e),o=Z(t?.definition);if(!t||!o)throw new ye("The service returned an invalid server definition.","parse",[]);return{id:Ge(t.id),definition:o,paths:le(t.paths),maskedPaths:le(t.maskedPaths)}},Zr=e=>{let t=Z(e);if(!t||!Array.isArray(t.drafts))throw new ye("The service returned data in an invalid format.","parse",[]);return{drafts:t.drafts.map(qr).filter(o=>o!==null),existing:le(t.existing),source:Ge(t.source)}},se=async(e,t,o)=>{let n=await xe.serviceRequest({method:e,path:t,...o===void 0?{}:{body:JSON.stringify(o)}}),s;try{s=JSON.parse(n.body)}catch{throw new ye("The service returned unrecognized data. Try again.","parse",[])}if(n.status>=400){let c=Z(s)??{},l=typeof c.error=="string"?c.error:`Request failed (${n.status})`,p=typeof c.code=="string"?c.code:null,v=Array.isArray(c.conflicts)?c.conflicts.map(Mo).filter(w=>w!==null):[];throw new ye(l,p,v)}return s},ie=e=>e instanceof E?e.code==="NO_SERVICE"?'Allow "MCP Manager" to run its local service in Settings \u2192 Extensions.':e.code==="SERVICE_FAILED"?"The local service is not ready. Reload the extension and try again.":e.code==="DISABLED"?"The MCP Manager extension is disabled. Enable it in extension settings.":e.code==="HOST_TIMEOUT"?"The local service timed out. Try again.":e.code==="NOT_GRANTED"?"Allow the required permission in extension settings, or reinstall the extension.":"Cannot connect to the local service. Check the extension permissions.":e instanceof ye||e instanceof Error?e.message:"The operation failed. Try again.",es=e=>e instanceof ye&&e.code==="not-found"?'The local service is outdated. Disable and re-enable "MCP Manager" in extension settings.':ie(e),Rt=a("main","ext mc");Rt.setAttribute("aria-label","MCP Manager");var ar=a("header","mc-header"),cr=a("div","mc-title-row"),ts=a("h1","mc-title","MCP Manager"),nt=a("div","mc-actions"),os=Ue(nt,{label:"Add server",size:"sm",onClick:()=>Us()}),ns=Ue(nt,{label:"Rescan",variant:"outline",size:"sm",onClick:()=>{hr(!0),Po()}}),rs=Ue(nt,{label:"Enable all",variant:"outline",size:"sm",onClick:()=>br(!0)}),ss=Ue(nt,{label:"Disable all",variant:"outline",size:"sm",onClick:()=>br(!1)});cr.append(ts,nt);var ko=a("p","mc-summary"),Ao=a("p","mc-summary mc-summary-secondary");ar.append(cr,ko,Ao);var lr=a("div","mc-body"),oe=a("div","mc-notice-root");oe.setAttribute("aria-live","polite");var wo=a("div","mc-groups-note"),dr=a("div","mc-groups-row"),at=a("div","mc-groups"),Go=a("div","mc-group-select"),Le=a("button","mc-chip mc-groups-edit","Edit groups");Le.type="button";Le.setAttribute("aria-pressed","false");Le.addEventListener("click",()=>{I?mr():bs()});dr.append(at,Go,Le);var Ze=a("div","mc-group-editor-root"),et=a("div","mc-server-editor-root"),Oo=a("div"),dt=a("div"),Ro=a("div","mc-install-root"),tt=a("input","mc-search");tt.type="search";tt.placeholder="Search ID, command or URL";tt.setAttribute("aria-label","Search MCP servers");tt.addEventListener("input",()=>{Io=tt.value.trim().toLowerCase(),gr()});var ct=a("div","mc-list");ct.setAttribute("role","list");var pr=a("footer","mc-footer");pr.append(a("p","","Manages the mcp block of ~/.config/opencode/opencode.json (and opencode.jsonc when present). Writes preserve comments and the rest of the file; every write keeps the previous content in opencode.json.mcp-manager.bak."),a("p","","Changes take effect when OpenCode reloads its config; running sessions keep the tools they already loaded."));lr.append(oe,wo,dr,Ze,et,Oo,dt,Ro,tt,ct,pr);Rt.append(ar,lr);sr.append(Rt);var h=null,ne=!1,Fe=null,k=null,d=null,ge=null,re=null,Te=null,K=null,W=[],ke=null,Xe=!0,I=null,de=null,ot=!1,U=null,Y=null,Se={paste:"",url:"",path:""},lt=!1,Me=null,_e=null,Io="",Yn=!1,is=So(Go,{value:"all",options:[{id:"all",label:"All"}],onChange:e=>{K=e==="all"?null:e,u()}}),_o=Go.querySelector(".oc-sdk-trigger");_o&&(_o.setAttribute("aria-label","Filter by group"),_o.removeAttribute("aria-labelledby"));var Pe=()=>!!h?.config.error,as=e=>e.state==="conflict"?"error":e.state==="invalid"?"warning":e.state==="disabled"?"info":e.advertised?"success":"warning",cs=e=>e.state==="conflict"?"Conflict":e.state==="invalid"?"Invalid":e.state==="disabled"?"Disabled":"Enabled",Ot=(e,t="neutral")=>{let o=a("span","mc-badge",e);return o.dataset.tone=t,o},ls=e=>{switch(e){case"both":return"Defined in more than one config file";case"duplicate":return"Duplicate entry in the mcp block";case"invalid":return"Definition cannot be read";case"read-error":return"Config cannot be read";case"tools-off":return"A tool is turned off";case"insecure-url":return"URL is not encrypted";default:return"Conflict"}},ds=(e,t)=>{if(!t)return null;let o=a("p","mc-path");return o.append(a("span","mc-path-label",`${e}: `),a("code","",t)),o},G=(e,t,o=!1,n=!1)=>{let s=a("button",o?"mc-inline-button mc-inline-primary":"mc-inline-button",e);return s.type="button",s.disabled=!!d||n,s.addEventListener("click",t),s},Ee=(e,t,o=null)=>{let n=a("div","mc-field");return n.append(a("span","mc-field-label",e),t),(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t instanceof HTMLSelectElement)&&t.setAttribute("aria-label",e),o&&n.append(a("span","mc-field-hint",o)),n},ps=e=>e.split(/[\\/]/).pop()||e,qn=e=>{let t=a("li","mc-conflict-item");t.dataset.tone=e.blocking?"error":"warning";let o=a("div","mc-conflict-copy");o.append(a("strong","",ls(e.kind)),a("p","mc-conflict-message",e.message));for(let n of e.paths){let s=ds("Config",n);s&&o.append(s)}if(t.append(o),e.kind==="both"&&e.paths.length>=2){let n=a("div","mc-conflict-actions");for(let s of e.paths)n.append(G(`Keep ${ps(s)}`,()=>void Bs(e,s),!1,Pe()));t.append(n)}return t},us=()=>{if(dt.replaceChildren(),!h)return;let e=h.conflicts,t=e.filter(c=>c.blocking),o=e.filter(c=>!c.blocking);if(t.length===0&&o.length===0)return;let n=a("section","mc-conflicts");n.setAttribute("aria-label","Conflict check");let s=a("div","mc-section-head");if(s.append(a("h2","mc-section-title","Conflict check"),a("span","mc-section-count",`${t.length} blocking \xB7 ${o.length} warning${o.length===1?"":"s"}`)),n.append(s),t.length>0){let c=a("ul","mc-conflict-list");for(let l of t)c.append(qn(l));n.append(c)}if(o.length>0){let c=a("details","mc-warning-details");c.append(a("summary","",`Warnings (${o.length})`));let l=a("ul","mc-conflict-list");for(let p of o)l.append(qn(p));c.append(l),n.append(c)}dt.append(n)},ms=()=>{if(oe.replaceChildren(),Te!==null){let e=Te,t=a("div","mc-notice",`Remove ${e} from opencode.json? The server definition is deleted; a copy is kept in opencode.json.mcp-manager.bak.`);t.dataset.tone="warning",t.setAttribute("role","status");let o=a("div","mc-notice-actions");o.append(G("Confirm remove",()=>void Xs(e),!0),G("Cancel",()=>{Te=null,u()})),t.append(o),oe.append(t);return}if(re){let e=re,t=new Set(e.serverIds),o=h?h.servers.filter(c=>!t.has(c.id)).length:0,n=a("div","mc-notice",`Only "${e.name}": ${o} other servers will be disabled.`);n.dataset.tone="warning",n.setAttribute("role","status");let s=a("div","mc-notice-actions");s.append(G("Confirm",()=>void ks(),!0),G("Cancel",()=>{re=null,u()})),n.append(s),oe.append(n);return}if(ge!==null){let e=h?h.servers.filter(n=>n.enabled!==ge).length:0,t=a("div","mc-notice",ge?`${e} servers will be enabled.`:`${e} servers will be disabled.`);t.dataset.tone="warning",t.setAttribute("role","status");let o=a("div","mc-notice-actions");o.append(G(ge?"Confirm enable":"Confirm disable",()=>void zs(),!0),G("Cancel",()=>{ge=null,u()})),t.append(o),oe.append(t);return}if(k){let e=a("div","mc-notice",k.text);if(e.dataset.tone=k.tone,e.setAttribute("role",k.tone==="error"?"alert":"status"),k.actions?.length){let t=a("div","mc-notice-actions");for(let o of k.actions)t.append(G(o.label,o.onClick,o.primary));e.append(t)}oe.append(e);return}if(Fe){let e=a("div","mc-notice",Fe);e.dataset.tone="error",e.setAttribute("role","alert"),oe.append(e);return}if(ne&&!h){let e=a("div","mc-notice","Reading servers\u2026");e.dataset.tone="info",e.setAttribute("role","status"),oe.append(e)}},fs=()=>{if(!h){ko.textContent=ne?"Reading servers\u2026":"Servers not loaded yet.",Ao.textContent="MCP servers live in the mcp block of opencode.json.";return}ko.textContent=`${h.summary.advertised} of ${h.summary.total} visible to the model \xB7 ${h.summary.enabled} enabled`;let e=h.summary.blockingConflicts,t=h.summary.warnings;Ao.textContent=[`${h.summary.disabled} disabled`,`${h.summary.invalid} invalid`,e>0?`${e} blocking conflict${e===1?"":"s"}`:"No blocking conflicts",`${t} warning${t===1?"":"s"}`].join(" \xB7 ")},Be=e=>e.serverIds.filter(t=>h?.servers.some(o=>o.id===t)),ur=e=>{let t=Be(e).map(n=>h?.servers.find(s=>s.id===n)).filter(n=>!!n);if(t.length===0)return"No servers";if(t.some(n=>n.state==="conflict"))return"Has conflicts";let o=t.filter(n=>n.state==="enabled").length;return o===t.length?"All on":o===0?"All off":"Partial"},Qn=e=>{Array.from(at.querySelectorAll("[data-group]")).find(o=>o.dataset.group===e)?.focus()},gs=()=>`custom-${globalThis.crypto?.randomUUID?.().slice(0,8)??Math.random().toString(36).slice(2,10)}`,hs=()=>{if(wo.replaceChildren(),!ke)return;let e=a("div","mc-notice",`Group configuration cannot be read: ${ke}`);e.dataset.tone="error",e.setAttribute("role","alert");let t=a("div","mc-notice-actions");t.append(G("Reload",()=>void Po(),!1,Xe)),e.append(t),wo.append(e)},Co=e=>{I={id:e?.id??null,name:e?.name??"",members:e?[...e.serverIds]:[]},de=null,ot=!1,u();let t=Ze.querySelector(".mc-group-name");t?.focus(),t?.select()},bs=()=>{if(ke||Xe||!h||Pe())return;let e=W.find(t=>t.id===K)??W[0]??null;Co(e),Ze.scrollIntoView({block:"nearest"})},mr=()=>{d||(I=null,de=null,ot=!1,u(),Le.focus())},Es=e=>{if(e==="new"){Co(null);return}let t=W.find(o=>o.id===e);t&&Co(t)},To=()=>{Ze.querySelector(".mc-group-name")?.focus()},Zn=async()=>{let e=I;if(!e||d||ke)return;let t=e.name.trim();if(!t){de="Enter a group name.",u(),To();return}if(t.length>40){de=`Group name cannot exceed ${40} characters.`,u(),To();return}if(W.some(c=>c.id!==e.id&&c.name.trim().toLowerCase()===t.toLowerCase())){de=`A group named "${t}" already exists.`,u(),To();return}if(e.members.length===0){de="A group needs at least one member.",u();return}let o=e.id??gs(),n={id:o,name:t,serverIds:[...e.members]},s=e.id?W.map(c=>c.id===e.id?n:c):[...W,n];d="groups",de=null,u();try{W=Lo(await se("POST","/groups",{version:1,groups:s})),ke=null,K=o,re=null;let c=W.find(l=>l.id===o)??null;I=c?{id:c.id,name:c.name,members:[...c.serverIds]}:null,k={text:`Saved group "${t}".`,tone:"success"},xe.toast({kind:"success",message:`Saved group "${t}"`}).catch(()=>{})}catch(c){de=ie(c)}finally{d=null,u()}},xs=()=>{!I?.id||d||(ot=!0,u())},vs=async()=>{if(!I?.id||d)return;let e=I.id,t=W.filter(o=>o.id!==e);d="groups",ot=!1,de=null,u();try{W=Lo(await se("POST","/groups",{version:1,groups:t})),ke=null,re?.id===e&&(re=null),K===e&&(K=null);let o=W.find(n=>n.id===K)??W[0]??null;K=o?.id??null,I=o?{id:o.id,name:o.name,members:[...o.serverIds]}:null,k={text:"Group deleted.",tone:"success"}}catch(o){de=ie(o)}finally{d=null,u()}},Ss=()=>{if(Ze.replaceChildren(),!I)return;let e=I,t=a("section","mc-group-editor");t.setAttribute("aria-label","Edit groups");let o=a("div","mc-section-head");o.append(a("h2","mc-section-title","Edit groups"),G("Close",mr,!1,!!d)),t.append(o);let n=a("label","mc-field");n.append(a("span","mc-field-label","Select group"));let s=a("select","mc-input");s.setAttribute("aria-label","Select group");let c=a("option","","New group");c.value="new",s.append(c);for(let y of W){let $=a("option","",`${y.name} (${y.serverIds.length})`);$.value=y.id,s.append($)}s.value=e.id??"new",s.disabled=!!d,s.addEventListener("change",()=>Es(s.value)),n.append(s);let l=a("label","mc-field");l.append(a("span","mc-field-label","Name"));let p=a("input","mc-input mc-group-name");p.type="text",p.value=e.name,p.maxLength=40,p.placeholder="e.g. Daily development",p.autocomplete="off",p.spellcheck=!1,p.disabled=!!d,p.addEventListener("input",()=>{I&&(I.name=p.value,de=null)}),p.addEventListener("keydown",y=>{y.key==="Enter"&&(y.preventDefault(),Zn())}),l.append(p),t.append(n,l);let v=a("fieldset","mc-members"),w=a("legend","",`Members (${e.members.length})`);v.append(w);let f=a("div","mc-members-tools");f.append(G("Select all",()=>{if(!I)return;let y=h?.servers.map(M=>M.id)??[],$=I.members.filter(M=>!y.includes(M));I.members=[...y,...$],u()},!1,!!d),G("Clear",()=>{I&&(I.members=[],u())},!1,!!d)),v.append(f);let m=a("div","mc-member-list");for(let y of h?.servers??[]){let $=a("label","mc-check"),M=a("input");M.type="checkbox",M.checked=e.members.includes(y.id),M.disabled=!!d,M.addEventListener("change",()=>{I&&(M.checked?I.members.includes(y.id)||I.members.push(y.id):I.members=I.members.filter(ae=>ae!==y.id),w.textContent=`Members (${I.members.length})`,de=null)});let pe=a("span","mc-check-copy");pe.append(a("span","mc-check-name",y.id),a("code","mc-check-id",y.transport)),$.append(M,pe),m.append($)}v.append(m);let R=new Set(h?.servers.map(y=>y.id)??[]),P=e.members.filter(y=>!R.has(y));if(P.length>0){let y=a("div","mc-missing");y.append(a("span","mc-missing-label","Missing from config:"));for(let $ of P){let M=a("button","mc-missing-chip",`${$} \xD7`);M.type="button",M.disabled=!!d,M.title="Remove this missing member from the group",M.addEventListener("click",()=>{I&&(I.members=I.members.filter(pe=>pe!==$),u())}),y.append(M)}v.append(y)}if(t.append(v),de){let y=a("p","mc-editor-error",de);y.setAttribute("role","alert"),t.append(y)}let J=a("div","mc-editor-actions");if(e.id&&J.append(G("Delete group",xs,!1,!!d)),J.append(G(e.id?"Save changes":"Create group",()=>void Zn(),!0,!!d)),t.append(J),ot){let y=a("div","mc-editor-confirm");y.dataset.tone="warning",y.append(a("p","",`Delete group "${e.name.trim()||"Untitled"}"? The servers themselves are not changed.`));let $=a("div","mc-actions");$.append(G("Confirm delete",()=>void vs(),!0,!!d),G("Cancel",()=>{ot=!1,u()},!1,!!d)),y.append($),t.append(y)}t.append(a("p","mc-editor-hint","Groups only affect panel filtering and bulk toggles; they do not change servers. Members are written to groups.json on save.")),Ze.append(t)},_s=()=>{at.replaceChildren();let e=h?.servers.length??0,t=a("button","mc-chip",`All ${e}`);t.type="button",t.dataset.group="all",t.setAttribute("aria-pressed",K===null?"true":"false"),t.addEventListener("click",()=>{K=null,u(),Qn("all")}),at.append(t);for(let o of W){let n=Be(o).length,s=a("button","mc-chip",`${o.name} ${n}`);s.type="button",s.dataset.group=o.id,s.setAttribute("aria-pressed",K===o.id?"true":"false"),s.addEventListener("click",()=>{K=o.id,u(),Qn(o.id)}),at.append(s)}Le.textContent=I?"Close editor":"Edit groups",Le.setAttribute("aria-pressed",I?"true":"false"),Le.disabled=Xe||!!ke||!!d||!h||Pe(),Le.title=Xe?"Reading groups\u2026":ke?"Group configuration cannot be read. Fix the file and reload.":h?Pe()?"Config cannot be read":"":"Server list not loaded yet",is.update({value:K??"all",options:[{id:"all",label:`All ${e}`},...W.map(o=>({id:o.id,label:`${o.name} ${Be(o).length}`,hint:ur(o)}))]})},Ts=()=>{if(Oo.replaceChildren(),!h||!K)return;let e=h,t=W.find(m=>m.id===K);if(!t)return;let o=Be(t),n=t.serverIds.filter(m=>!o.includes(m)),c=o.map(m=>e.servers.find(R=>R.id===m)).filter(m=>!!m).some(m=>m.state==="conflict"),l=Pe()||c||o.length===0,p=a("div","mc-groupbar"),v=a("div","mc-groupbar-text");v.append(a("strong","",t.name),a("span","mc-group-state",`${o.length} \xB7 ${ur(t)}`)),n.length>0&&v.append(a("p","mc-group-warning",`Missing: ${n.join(", ")}`));let w=a("div","mc-groupbar-actions");w.append(G("Enable group",()=>void er(t,!0),!1,l),G("Disable group",()=>void er(t,!1),!1,l));let f=G("Only this group",()=>ys(t),!1,l||n.length>0);n.length>0&&(f.title="The group has missing servers. Fix them before using only this group."),w.append(f),p.append(v,w),Oo.append(p)},er=async(e,t)=>{if(!h||d)return;let o=Be(e);if(o.length!==0){d=`group:${e.id}:${t?"on":"off"}`,re=null,ge=null,Te=null,k=null,u();try{h=Ae(await se("POST","/servers/batch",{enable:t?o:[],disable:t?[]:o})),k={text:`${o.length} servers in "${e.name}" ${t?"enabled":"disabled"}.`,tone:"success"},xe.toast({kind:"success",message:`${t?"Enabled":"Disabled"} "${e.name}"`}).catch(()=>{})}catch(n){k={text:ie(n),tone:"error"},d=null,u(),rt(!1,!0);return}d=null,u()}},ys=e=>{if(!h||d)return;let t=Be(e),o=e.serverIds.filter(n=>!t.includes(n));t.length===0||o.length>0||(re=e,ge=null,Te=null,k=null,u(),oe.scrollIntoView({block:"nearest"}),oe.querySelector("button")?.focus())},ks=async()=>{if(!h||d||!re)return;let e=re;re=null;let t=Be(e),o=e.serverIds.filter(c=>!t.includes(c));if(t.length===0||o.length>0){k={text:"The group has missing servers. Nothing changed.",tone:"error"},u();return}let n=new Set(e.serverIds),s=h.servers.filter(c=>!n.has(c.id)).map(c=>c.id);d=`group-only:${e.id}`,k=null,u();try{h=Ae(await se("POST","/servers/batch",{enable:t,disable:s})),k={text:`Only "${e.name}" enabled; ${s.length} other servers disabled.`,tone:"success"},xe.toast({kind:"success",message:`Only "${e.name}" enabled`}).catch(()=>{})}catch(c){k={text:ie(c),tone:"error"},d=null,u(),rt(!1,!0);return}d=null,u()},As=e=>{let t=[],o="",n=!1,s=!1;for(let c of e){if(c==='"'){n=!n,s=!0;continue}if(!n&&/\s/.test(c)){s&&(t.push(o),o="",s=!1);continue}o+=c,s=!0}return n?{tokens:t,error:"A double quote in the command is not closed."}:(s&&t.push(o),{tokens:t,error:null})},ws=e=>/\s/.test(e)?`"${e}"`:e,tr=(e,t,o)=>{let n={};for(let s of e.split(`
`)){let c=s.trim();if(!c||c.startsWith("#"))continue;let l=c.indexOf(t);if(l<=0)return{values:n,error:`"${c}" is not ${o}`};let p=c.slice(0,l).trim();if(!p)return{values:n,error:`"${c}" is not ${o}`};n[p]=c.slice(l+1).trim()}return{values:n,error:null}},Os=e=>{let t=Z(e),o=[],n=[];if(!t)return{lines:o,masked:n};for(let[s,c]of Object.entries(t)){let l=typeof c=="string"?c:"";l===""&&n.push(s),o.push(`${s}=${l}`)}return{lines:o,masked:n}},Rs=e=>{let t=Z(e),o=[],n=[];if(!t)return{lines:o,masked:n};for(let[s,c]of Object.entries(t)){let l=typeof c=="string"?c:"";l===""&&n.push(s),o.push(`${s}: ${l}`)}return{lines:o,masked:n}},Is=(e,t)=>{let o=Os(t.environment),n=Rs(t.headers),s=t.timeout;return{id:e,base:t,name:e,transport:t.type==="remote"?"remote":"local",command:le(t.command).map(ws).join(" "),cwd:Ge(t.cwd),environment:o.lines.join(`
`),url:Ge(t.url),headers:n.lines.join(`
`),timeout:typeof s=="number"&&Number.isFinite(s)?String(s):"",enabled:t.enabled!==!1,maskedEnvironment:o.masked,maskedHeaders:n.masked}},Cs=e=>{let t={...e.base};for(let n of["type","command","cwd","environment","url","headers","timeout","enabled"])delete t[n];if(t.type=e.transport,t.enabled=e.enabled,e.transport==="local"){let n=As(e.command);if(n.error)return{definition:t,error:n.error};if(n.tokens.length===0)return{definition:t,error:"Enter the command that starts the server."};t.command=n.tokens;let s=e.cwd.trim();s&&(t.cwd=s);let c=tr(e.environment,"=","KEY=VALUE");if(c.error)return{definition:t,error:`Environment: ${c.error}`};Object.keys(c.values).length>0&&(t.environment=c.values)}else{let n=e.url.trim();if(!/^https?:\/\/\S+$/i.test(n))return{definition:t,error:"Enter the URL, starting with http:// or https://."};t.url=n;let s=tr(e.headers,":","Name: value");if(s.error)return{definition:t,error:`Headers: ${s.error}`};Object.keys(s.values).length>0&&(t.headers=s.values)}let o=e.timeout.trim();if(o){let n=Number(o);if(!Number.isInteger(n)||n<=0)return{definition:t,error:"Timeout must be a whole number of milliseconds."};t.timeout=n}return{definition:t,error:null}},Uo=e=>{et.querySelector(`[data-field="${e}"]`)?.focus()},fr=e=>{U=e,Y=null,Te=null,u(),et.scrollIntoView({block:"nearest"}),Uo("id"),et.querySelector('[data-field="id"]')?.select()},Us=()=>{d||!h||Pe()||fr({id:null,base:{},name:"",transport:"local",command:"",cwd:"",environment:"",url:"",headers:"",timeout:"",enabled:!0,maskedEnvironment:[],maskedHeaders:[]})},or=async e=>{if(!(d||Pe())){d=`detail:${e.id}`,k=null,u();try{let t=Qr(await se("GET",`/servers/detail?id=${encodeURIComponent(e.id)}`));d=null,fr(Is(t.id||e.id,t.definition));return}catch(t){k={text:ie(t),tone:"error"}}d=null,u()}},nr=()=>{if(d)return;U=null,Y=null,u(),nt.querySelector("button")?.focus()},rr=async()=>{let e=U;if(!e||d)return;let t=e.name.trim();if(!zr.test(t)){Y="Server ID: use letters, numbers, dots, dashes and underscores, starting with a letter or number.",u(),Uo("id");return}let o=!!e.id&&e.id!==t;if((!e.id||o)&&h?.servers.some(s=>s.id===t)){Y=`A server named "${t}" already exists in the config.`,u(),Uo("id");return}let n=Cs(e);if(n.error){Y=n.error,u();return}d="save-server",Y=null,u();try{let s=await se("POST","/servers/save",{id:t,...e.id?{previousId:e.id}:{},definition:n.definition,enabled:e.enabled}),c=Z(s),l=typeof c?.backupPath=="string"?c.backupPath:null;h=Ae(s),U=null,k={text:e.id?`Saved ${t}${l?`; previous config copied to ${l}`:""}.`:`Added ${t}.`,tone:"success"},xe.toast({kind:"success",message:e.id?`Saved ${t}`:`Added ${t}`}).catch(()=>{})}catch(s){Y=ie(s)}finally{d=null,u()}},Ms=()=>{if(et.replaceChildren(),!U)return;let e=U,t=a("section","mc-group-editor");t.setAttribute("aria-label",e.id?"Edit server":"Add server");let o=a("div","mc-section-head");o.append(a("h2","mc-section-title",e.id?"Edit server":"Add server"),G("Close",nr,!1,!!d)),t.append(o);let n=a("input","mc-input");n.type="text",n.value=e.name,n.placeholder="my-server",n.autocomplete="off",n.spellcheck=!1,n.dataset.field="id",n.disabled=!!d,n.addEventListener("input",()=>{U&&(U.name=n.value,Y=null)}),n.addEventListener("keydown",f=>{f.key==="Enter"&&(f.preventDefault(),rr())});let s=a("div","mc-segment");for(let f of["local","remote"]){let m=a("button","mc-inline-button",f);m.type="button",m.dataset.field=`type-${f}`,m.setAttribute("aria-pressed",e.transport===f?"true":"false"),m.disabled=!!d,m.addEventListener("click",()=>{!U||U.transport===f||(U.transport=f,Y=null,u())}),s.append(m)}if(t.append(Ee("ID",n,"The key inside the mcp block of opencode.json."),Ee("Type",s)),e.transport==="local"){let f=a("input","mc-input");f.type="text",f.value=e.command,f.placeholder="npx -y @modelcontextprotocol/server-everything",f.autocomplete="off",f.spellcheck=!1,f.dataset.field="command",f.disabled=!!d,f.addEventListener("input",()=>{U&&(U.command=f.value,Y=null)});let m=a("input","mc-input");m.type="text",m.value=e.cwd,m.placeholder="Defaults to where OpenCode runs",m.autocomplete="off",m.spellcheck=!1,m.dataset.field="cwd",m.disabled=!!d,m.addEventListener("input",()=>{U&&(U.cwd=m.value,Y=null)});let R=a("textarea","mc-input mc-textarea");R.value=e.environment,R.placeholder=`LOG_LEVEL=info
API_TOKEN=`,R.spellcheck=!1,R.dataset.field="environment",R.disabled=!!d,R.addEventListener("input",()=>{U&&(U.environment=R.value,Y=null)}),t.append(Ee("Command",f,"Split on spaces; wrap an argument that contains spaces in double quotes."),Ee("Working directory",m,"Optional."),Ee("Environment",R,e.maskedEnvironment.length>0?`${Vn} ${jn}`:jn))}else{let f=a("input","mc-input");f.type="url",f.value=e.url,f.placeholder="https://example.com/mcp",f.autocomplete="off",f.spellcheck=!1,f.dataset.field="url",f.disabled=!!d,f.addEventListener("input",()=>{U&&(U.url=f.value,Y=null)});let m=a("textarea","mc-input mc-textarea");m.value=e.headers,m.placeholder="Authorization: Bearer \u2026",m.spellcheck=!1,m.dataset.field="headers",m.disabled=!!d,m.addEventListener("input",()=>{U&&(U.headers=m.value,Y=null)}),t.append(Ee("URL",f,"The MCP endpoint, starting with http:// or https://."),Ee("Headers",m,e.maskedHeaders.length>0?`${Vn} ${Kn}`:Kn))}let c=a("input","mc-input");c.type="text",c.inputMode="numeric",c.value=e.timeout,c.placeholder="e.g. 10000",c.autocomplete="off",c.dataset.field="timeout",c.disabled=!!d,c.addEventListener("input",()=>{U&&(U.timeout=c.value,Y=null)}),t.append(Ee("Timeout (ms)",c,"Milliseconds to wait for the server to start. Leave empty for the default."));let l=a("label","mc-check"),p=a("input");p.type="checkbox",p.checked=e.enabled,p.dataset.field="enabled",p.disabled=!!d,p.addEventListener("change",()=>{U&&(U.enabled=p.checked)});let v=a("span","mc-check-copy");if(v.append(a("span","mc-check-name","Enabled")),l.append(p,v),t.append(l),Y){let f=a("p","mc-editor-error",Y);f.setAttribute("role","alert"),t.append(f)}let w=a("div","mc-editor-actions");w.append(G("Cancel",nr,!1,!!d),G(e.id?"Save changes":"Add server",()=>void rr(),!0,!!d)),t.append(w),t.append(a("p","mc-editor-hint","Only the mcp entry is written. Secrets already in opencode.json are kept when the field is left blank; a new value replaces them.")),et.append(t)},Ls=async()=>{if(d)return;let e=Se.paste.trim(),t=Se.url.trim(),o=Se.path.trim(),n=[e,t,o].filter(l=>l.length>0);if(n.length===0){Me="Paste a manifest, enter a URL, or enter a path.",lt=!0,u();return}if(n.length>1){Me="Fill only one source: paste, URL or path.",lt=!0,u();return}let s=e?"paste":t?"url":"path",c=e||t||o;d="import",Me=null,lt=!0,u();try{_e=Zr(await se("POST","/servers/import",{kind:s,value:c})),Se={paste:"",url:"",path:""};let l=_e.drafts.length;k={text:`${l} server${l===1?"":"s"} found${_e.source?` in ${_e.source}`:""}.`,tone:"info"}}catch(l){Me=ie(l)}finally{d=null,u()}},Gs=async()=>{let e=_e;if(d||!e||e.drafts.length===0)return;d="import-save",k=null,u();let t=0;try{for(let o of e.drafts)h=Ae(await se("POST","/servers/save",{id:o.id,definition:o.definition,enabled:o.enabled})),t+=1;_e=null,k={text:`${t} server${t===1?"":"s"} added to opencode.json.`,tone:"success"},xe.toast({kind:"success",message:`Added ${t} MCP server${t===1?"":"s"}`}).catch(()=>{})}catch(o){_e=null,k={text:`Added ${t} of ${e.drafts.length}. ${ie(o)}`,tone:"error"}}finally{d=null,u()}},Ps=()=>{Ro.replaceChildren();let e=a("details","mc-install");e.open=lt,e.addEventListener("toggle",()=>{lt=e.open}),e.append(a("summary","","Install from source"));let t=a("div","mc-install-body"),o=a("textarea","mc-input mc-textarea");o.value=Se.paste,o.placeholder=`{
  "mcp": {
    "my-server": { "type": "local", "command": ["npx", "-y", "pkg"] }
  }
}`,o.spellcheck=!1,o.dataset.field="paste",o.disabled=!!d,o.addEventListener("input",()=>{Se.paste=o.value,Me=null});let n=a("input","mc-input");n.type="url",n.value=Se.url,n.placeholder="https://example.com/opencode.json",n.autocomplete="off",n.spellcheck=!1,n.dataset.field="url",n.disabled=!!d,n.addEventListener("input",()=>{Se.url=n.value,Me=null});let s=a("input","mc-input");s.type="text",s.value=Se.path,s.placeholder="~/.config/opencode/extra.json",s.autocomplete="off",s.spellcheck=!1,s.dataset.field="path",s.disabled=!!d,s.addEventListener("input",()=>{Se.path=s.value,Me=null}),t.append(Ee("Paste a manifest",o,"Accepts an mcp block, a single server definition, or a whole opencode.json."),Ee("URL",n,null),Ee("Local file or folder",s,null));let c=a("div","mc-editor-actions");if(c.append(G("Import",()=>void Ls(),!0,!!d)),t.append(c),Me){let l=a("p","mc-editor-error",Me);l.setAttribute("role","alert"),t.append(l)}if(_e){let l=_e,p=a("div","mc-section-head");p.append(a("h2","mc-section-title",`Found ${l.drafts.length}`),a("span","mc-section-count",l.source||"Pasted manifest")),t.append(p);let v=a("ul","mc-install-drafts");for(let m of l.drafts){let R=a("li","mc-install-draft"),P=m.definition.type==="remote"?"remote":"local",J=P==="local"?le(m.definition.command).join(" "):Ge(m.definition.url);R.append(a("code","mc-id",m.id),Ot(P,"neutral")),l.existing.includes(m.id)&&R.append(Ot("overwrites","warning")),R.append(a("span","mc-cmd",J||"No command")),v.append(R)}t.append(v);let w=l.drafts.filter(m=>l.existing.includes(m.id)).map(m=>m.id);w.length>0&&t.append(a("p","mc-editor-hint",`Already present and will be overwritten: ${w.join(", ")}.`));let f=a("div","mc-editor-actions");f.append(G(`Add ${l.drafts.length} server${l.drafts.length===1?"":"s"}`,()=>void Gs(),!0,!!d||l.drafts.length===0),G("Discard",()=>{_e=null,u()},!1,!!d)),t.append(f)}e.append(t),Ro.append(e)},Ns=e=>{let t=a("div","mc-server-action"),o=a("span","mc-action-note"),n=Pe();if(e.state==="conflict"){o.textContent=`Defined in ${e.paths.length||2} config files`;let l=a("button","mc-inline-button","Resolve");l.type="button",l.disabled=!!d||n,l.addEventListener("click",()=>{dt.scrollIntoView({block:"nearest"}),dt.querySelector("button")?.focus()}),t.append(o,l)}else if(e.state==="invalid"){o.textContent="Definition is invalid";let l=a("button","mc-inline-button","Edit definition");l.type="button",l.disabled=!!d||n,l.addEventListener("click",()=>void or(e)),t.append(o,l)}else{let l=e.state==="enabled",p=a("button","mc-switch");p.type="button",p.setAttribute("role","switch"),p.setAttribute("aria-checked",l?"true":"false"),p.setAttribute("aria-label",`${l?"Disable":"Enable"} ${e.id}`),p.dataset.serverId=e.id,p.disabled=!!d||n,p.append(a("span","mc-thumb")),p.addEventListener("click",()=>{p.disabled||Hs(e,!l)}),l?o.textContent=n?"Config cannot be read":e.advertised?"Visible to model":"No tools enabled":o.textContent=n?"Config cannot be read":"Disabled",t.append(o,p)}let s=a("div","mc-mini-actions");if(e.state!=="invalid"&&e.state!=="conflict"){let l=a("button","mc-inline-button","Edit");l.type="button",l.disabled=!!d||n,l.addEventListener("click",()=>void or(e)),s.append(l)}let c=a("button","mc-inline-button","Delete");return c.type="button",c.disabled=!!d||n,c.addEventListener("click",()=>Fs(e.id)),s.append(c),t.append(s),t},$s=e=>{let t=a("article","mc-server");t.dataset.state=e.state,t.setAttribute("role","listitem");let o=a("div","mc-server-main"),n=a("div","mc-server-head");n.append(a("strong","mc-name mc-mono",e.id),Ot(cs(e),as(e)),Ot(e.transport==="unknown"?"unknown":e.transport,"neutral"));let s=a("div","mc-meta");e.environmentKeys.length>0&&s.append(a("span","mc-stat",`env ${e.environmentKeys.length}`)),e.headerKeys.length>0&&s.append(a("span","mc-stat",`headers ${e.headerKeys.length}`)),e.timeout!==null&&s.append(a("span","mc-stat",`timeout ${e.timeout} ms`));let c=e.transport==="remote"?e.url??"No URL":e.command.length>0?e.command.join(" "):e.state==="invalid"?"Definition is invalid":"No command",l=a("p","mc-desc mc-cmd",c);return o.append(n),s.childElementCount>0&&o.append(s),o.append(l),e.warnings.length>0&&o.append(a("p","mc-warn",e.warnings.slice(0,2).join(" \xB7 "))),t.append(o,Ns(e)),t},gr=()=>{if(ct.replaceChildren(),!h)return;let e=K?W.find(n=>n.id===K):null,o=(e?e.serverIds.map(n=>h?.servers.find(s=>s.id===n)).filter(n=>!!n):h.servers).filter(n=>Io?[n.id,...n.command,n.url??"",...n.environmentKeys,...n.headerKeys,...n.warnings].join(" ").toLowerCase().includes(Io):!0);if(o.length===0){let n=a("div","mc-empty");n.append(a("h2","",h.servers.length===0?"No MCP servers configured":e?"This group has no available servers":"No matching servers"),a("p","",h.servers.length===0?"Add a server, or import a manifest into ~/.config/opencode/opencode.json.":e?"Check whether the servers in this group were removed.":"Try a different search term.")),ct.append(n);return}for(let n of o)ct.append($s(n))},u=()=>{Rt.setAttribute("aria-busy",ne?"true":"false"),fs(),ms(),hs(),_s(),Ss(),Ms(),Ts(),us(),Ps(),gr(),ns.update({label:ne?"Reading\u2026":"Rescan",loading:ne,disabled:ne||!!d});let e=Pe();os.update({disabled:ne||!!d||!h||e}),rs.update({disabled:ne||!!d||!h||e}),ss.update({disabled:ne||!!d||!h||e})},Ds=e=>{Array.from(document.querySelectorAll("[data-server-id]")).find(o=>o.dataset.serverId===e)?.focus()},rt=async(e=!1,t=!1)=>{if(!ne){ne=!0,t||(Fe=null),e&&u();try{h=Ae(await se("GET","/servers")),Fe=null}catch(o){t||(Fe=ie(o))}finally{ne=!1,u()}}},Po=async(e=!1)=>{if(!(Xe&&!e||I)){Xe=!0,u();try{W=Lo(await se("GET","/groups")),ke=null,K&&!W.some(t=>t.id===K)&&(K=null)}catch(t){ke=es(t)}finally{Xe=!1,u()}}},hr=async(e=!1)=>{if(!ne){ne=!0,e&&u();try{h=Ae(await se("GET","/servers")),Fe=null}catch(t){Fe=ie(t)}ne=!1,u()}},Hs=async(e,t)=>{if(!d){d=`toggle:${e.id}`,ge=null,re=null,Te=null,k=null,u();try{h=Ae(await se("POST","/servers/toggle",{id:e.id,enabled:t})),k={text:t?`Enabled ${e.id}.`:`Disabled ${e.id}; OpenCode will drop its tools after the next config reload.`,tone:"success"},xe.toast({kind:"success",message:t?`Enabled ${e.id}`:`Disabled ${e.id}`}).catch(()=>{})}catch(o){k={text:ie(o),tone:"error"},d=null,u(),rt(!1,!0);return}d=null,u(),Ds(e.id)}},Fs=e=>{d||(Te=e,ge=null,re=null,k=null,u(),oe.scrollIntoView({block:"nearest"}),oe.querySelector("button")?.focus())},Xs=async e=>{if(!d){Te=null,d=`remove:${e}`,k=null,u();try{let t=await se("POST","/servers/remove",{id:e}),o=Z(t),n=le(o?.removedPaths);h=Ae(t),U?.id===e&&(U=null,Y=null),k={text:`Removed ${e}${n.length>1?` from ${n.length} config files`:" from opencode.json"}.`,tone:"success"},xe.toast({kind:"success",message:`Removed ${e}`}).catch(()=>{})}catch(t){k={text:ie(t),tone:"error"},d=null,u(),rt(!1,!0);return}d=null,u()}},Bs=async(e,t)=>{if(!d&&!(!e.serverId||!t)){d=`resolve:${e.serverId}`,k=null,u();try{let o=await se("POST","/servers/resolve",{id:e.serverId,keep:t}),n=Z(o),s=typeof n?.backupPath=="string"?n.backupPath:null;h=Ae(o),k={text:`Kept the definition in ${t}${s?`; previous content copied to ${s}`:""}.`,tone:"success"},xe.toast({kind:"success",message:"Config conflict resolved"}).catch(()=>{})}catch(o){k={text:ie(o),tone:"error"},d=null,u(),rt(!1,!0);return}d=null,u()}},br=e=>{!h||d||(ge=e,re=null,Te=null,k=null,u(),oe.scrollIntoView({block:"nearest"}),oe.querySelector("button")?.focus())},zs=async()=>{if(ge===null||d)return;let e=ge;ge=null,re=null,d="bulk",k=null,u();try{let t=await se("POST","/servers/bulk",{enabled:e}),o=Z(t),n=le(o?.changed);h=Ae(t),k={text:`${n.length} server${n.length===1?"":"s"} ${e?"enabled":"disabled"}.`,tone:"success"},xe.toast({kind:"success",message:`${n.length} servers ${e?"enabled":"disabled"}`}).catch(()=>{})}catch(t){k={text:ie(t),tone:"error"},d=null,u(),rt(!1,!0);return}d=null,u()};xe.onReady(e=>{if(co(e,document.documentElement),document.documentElement.lang="en",Yn){u();return}Yn=!0,hr(!0),Po(!0)});u();})();
