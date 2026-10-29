"use strict";(()=>{var A="openchamber.sdk";var ut="data-oc-scrolling",Rt=`
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
:hover, [${ut}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${ut}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${ut}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${ut}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function Ct(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",r=>{let s=r.target===e?t:r.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let c=o.get(s);c!==void 0&&clearTimeout(c),o.set(s,setTimeout(()=>{o.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var mn=`(${Ct.toString()})(document);`;var Ko=/^[a-z][a-z0-9-]{0,39}$/;var zo=e=>Object(e)===e&&!Array.isArray(e),It=(e,t)=>Object.keys(e).every(o=>t.includes(o)),Vo=e=>String(e)===e&&e.length>=1&&e.length<=60,jo=e=>String(e)===e&&e.length>=1&&e.length<=80,Wo=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!zo(o)||!Ko.test(o.id)||!Vo(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!It(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!It(o,["kind","id","label","value","options","disabled"])||!jo(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let r=new Set;for(let s of o.options){if(!zo(s)||!It(s,["value","label"])||!jo(s.value)||!Vo(s.label)||r.has(s.value))return!1;r.add(s.value)}if(!r.has(o.value))return!1}return!0};var Ut=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Jo=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var Yo=/^[A-Za-z0-9_-]{1,80}$/;var qo=["left","right","top","bottom"];var Qo=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let r=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of r)if(!Qo(s,t+1,o))return!1;return!0},Mt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(Mt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(Mt)}return String(e)===e||Number.isFinite(e)},Lt=e=>{try{return String(e.id)!==e.id||!Yo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!qo.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Qo(e.data)||!Mt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var er=["file","directory","other","missing"],Nt=e=>!!(e&&"sessionId"in e),Pt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var tr=/^[0-9a-f]{7,64}$/i,$t=e=>tr.test(e),mt=500,ft=32e3,or=16e3,rr=128,nr=200,sr=2e3,ir=16e3,ar=80,cr=200,lr=16e3;var dr=2e3;var Dt=2e4,gt=1024,ht=2e6;var bt=64e3,Et=8e3,Ht=4e3;var Ft=96e4,fn=60*6e4;var pr=999,ur=1e4,rt=500,mr=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],fr=["stopped","starting","ready","failed"],gn=new Set(mr),gr=e=>gn.has(e),hr=e=>e&&gr(e)?e:"HOST_REJECTED",Xe=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Xe):Object(e)===e?Object.values(e).every(Xe):!1,br=e=>Xe(e)&&JSON.stringify(e).length<=lr,Zo=e=>e?.trim().slice(0,cr)??"",Be=e=>{let t=e.id.trim().slice(0,rr),o=e.title.trim().slice(0,nr),r=e.url.trim().slice(0,sr),s=e.text?.trim().slice(0,ir),c=e.author?.trim().slice(0,ar),l=e.kind==="pull"?"pull":"issue",p={providerId:e.providerId.trim(),id:t,title:o||t,url:r,kind:l};if(s&&(p.text=s),c&&(p.author=c),l==="pull"){let x=Zo(e.branches?.head),u=Zo(e.branches?.base);x&&u&&(p.branches={head:x,base:u})}return br(e.data)&&(p.data=e.data),p},Xt=e=>{let t=Be(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Bt=e=>{let t={text:e.text.trim().slice(0,or)};return e.send&&(t.send=!0),t},zt=e=>e===null||!Number.isFinite(e)?null:Math.min(pr,Math.max(0,Math.round(e))),Vt=e=>Number.isFinite(e)?Math.min(ur,Math.max(0,Math.ceil(e))):0;var ze=e=>e.length>0&&e.length<=gt&&!e.includes("\0")&&!e.includes("\\");var xt=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>dr?!1:!e.split("/").some(o=>o==="."||o===".."),hn=new Set(fr),jt=e=>!!(e&&"status"in e&&hn.has(String(e.status))&&!("body"in e)),St=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Kt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Wt=e=>!!(e&&"written"in e&&e.written===!0),Jt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),bn=new Set(er),Yt=e=>!!(e&&"kind"in e&&"size"in e&&bn.has(String(e.kind))&&Number.isFinite(e.size)),qt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),En=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),xn=e=>Object(e)===e?e:null,Gt=e=>String(e)===e&&e.length>0,Sn=e=>{if(!Gt(e.id))return null;if(e.ok===!0){let t={channel:A,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&Gt(e.error)?{channel:A,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:hr(Gt(e.code)?e.code:void 0)}:null},Qt=e=>{let t=xn(e);return!t||t.channel!==A||t.v!==1?null:t.type==="result"?Sn(t):!En.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var Er=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,vn=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",h=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},xr=()=>Promise.reject(new h("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),vt=()=>Promise.reject(new h("BAD_PATH",`File path must be 1 to ${gt} characters without NUL or backslash.`)),_t=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new h("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},T=e=>(e.value+=1,`oc-${e.value}`),ro=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new h("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(n=>n===t.parent),r=e.requestTimeoutMs??Dt,s=new Set,c=new Set,l=new Set,p=new Set,x=new Set,u=new Set,b=new Set,k=new Set,j=new Set,D=new Set,Q=[],y=null,G=null,I=new Set,ae=new Set,re=null,Ie=null,Fe=!1,_e=new Map,Te=new Map,ye=new Map,ce=!1,S={value:0},E=null,_=null,X=!1,ot=!1,Uo=null,Mo=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,le=n=>{t.parent.postMessage(n,"*")},Lo=()=>{ce||t.parent===t||D.size===0||E?.features?.lateGenerateResults!==!0||le({channel:A,v:1,type:"generate-late-listen"})},H=(n,i)=>{for(let f of n)try{f(i)}catch(g){console.error(g)}},Go=n=>{if(!(n instanceof MessageEvent)||!o(n.source))return;let i=Qt(n.data);if(!i)return;if(i.type==="workspace"){let g=Te.get(i.payload.subscriptionId);g&&H([g],i.payload.snapshot);return}if(i.type==="shells"){let g=ye.get(i.payload.subscriptionId);g&&H([g],i.payload.snapshot);return}if(i.type==="ready"){E=i.payload,_=Mo(i.payload.session),H(s,i.payload),H(c,i.payload.directory),H(l,i.payload.session),_&&H(p,_),H(x,i.payload.connection),H(u,i.payload.settings),H(b,i.payload.item),Lo();return}if(i.type==="generate-late"){D.size===0?Q.push(i.payload):H(D,i.payload);return}if(i.type==="directory"){E&&(E={...E,directory:i.payload.directory}),H(c,i.payload.directory);return}if(i.type==="session"){E&&(E={...E,session:i.payload.session}),i.payload.session?_?.sessionId!==i.payload.session.id&&(_=Mo(i.payload.session)):_=null,H(l,i.payload.session);return}if(i.type==="session-lifecycle"){_=i.payload,H(p,i.payload);return}if(i.type==="connection"){E&&(E={...E,connection:i.payload.connection}),H(x,i.payload.connection);return}if(i.type==="settings"){E&&(E={...E,settings:i.payload.settings}),H(u,i.payload.settings);return}if(i.type==="item"){E&&(E={...E,item:i.payload.item}),H(b,i.payload.item);return}if(i.type==="status-control-event"){H(k,i.payload);return}if(i.type==="popover-closed"){H(j,i.payload);return}if(i.type==="action"){let g=U=>{ce||le({channel:A,v:1,type:"action-result",id:i.id,payload:U})},L=G;if(!L){g({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>L(i.payload)).then(()=>g({ok:!0}),U=>{let V=(U instanceof Error?U.message:String(U)).trim();g({ok:!1,error:(V||"Action failed.").slice(0,rt)})});return}if(i.type==="file-open"){let g=i.payload;if(Ie&&Jo(Ie,g))return;Ie=g,H(I,i.payload);return}if(i.type==="file-saved"){H(ae,i.payload.version);return}if(i.type==="file-snapshot"){let g=V=>{ce||le({channel:A,v:1,type:"file-snapshot-result",id:i.id,payload:V})},L=V=>g({error:(V.trim()||"Could not read the edited file.").slice(0,rt)}),U=re;if(!U){L("This extension does not edit files.");return}Promise.resolve().then(()=>U(i.payload.purpose)).then(V=>{if(Ut(V)>2e7){L(`The file is over ${2e7} ${"bytes"in V?"bytes":"characters"}.`);return}if(V.version.length>256){L(`The snapshot version is over ${256} characters.`);return}g({snapshot:"bytes"in V?{bytes:V.bytes,version:V.version}:{content:V.content,version:V.version}})},V=>L(V instanceof Error?V.message:String(V)));return}if(i.type==="resolve"){let g=U=>{le({channel:A,v:1,type:"resolve-result",id:i.id,payload:U})},L=y;if(!L){g({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>L(i.payload)).then(U=>g({item:U?Be(U):null}),U=>{let V=(U instanceof Error?U.message:String(U)).trim();g({error:(V||"Command failed.").slice(0,rt)})});return}let f=_e.get(i.id);if(f){if(clearTimeout(f.timer),_e.delete(i.id),i.ok){f.resolve(i.payload);return}f.reject(new h(i.code,i.error))}};t.addEventListener("message",Go),le({channel:A,v:1,type:"hello"});let Z=(n,i=r)=>ce||t.parent===t?Promise.reject(new h("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((f,g)=>{let L=setTimeout(()=>{_e.delete(n.id),g(new h("HOST_TIMEOUT","Host did not answer in time."))},i);_e.set(n.id,{resolve:f,reject:g,timer:L}),le(n)}),B=n=>Z(n).then(()=>{}),z={channel:A,v:1},At=n=>{!ce&&t.parent!==t&&le(n)},No=()=>At({...z,type:"file-save"}),Po=n=>{!Er(n)||!vn(n)||(n.preventDefault(),No())},$o=n=>{!Er(n)||n.key!=="Escape"||E?.surface!=="popover"||!E.popover||(n.preventDefault(),Xo(E.popover.id,"escape").catch(()=>{}))},lt=()=>{let n=E?.surface==="popover"?E.popover:void 0;if(!n)return;let i=X||ot;Uo!==i&&(Uo=i,Bo(n.id,i).catch(()=>{}))},dt=()=>{E?.surface!=="popover"||X||(X=!0,lt())},Do=n=>{E?.surface!=="popover"||n.relatedTarget!==null||!X||(X=!1,lt())},Ho=()=>{E?.surface!=="popover"||ot||(ot=!0,lt())},Fo=()=>{E?.surface!=="popover"||!ot||(ot=!1,lt())},be=(n,i=1024)=>{if(!n.trim()||n.length>i)throw new h("HOST_REJECTED",`Identity must contain 1 to ${i} characters.`)},wt=async n=>{n.kind!=="projects"&&be(n.projectId);let i=await Z({...z,type:"workspace-read",id:T(S),payload:n});if(!i||!("kind"in i)||!("state"in i)||i.kind!==n.kind)throw new h("HOST_REJECTED","Host did not return workspace data.");return i},Ot=async(n,i)=>{n.kind!=="projects"&&be(n.projectId);let f=T(S);Te.set(f,i);try{await B({...z,type:"workspace-subscribe",id:T(S),payload:{subscriptionId:f,query:n}})}catch(g){throw Te.delete(f),ce||le({...z,type:"workspace-unsubscribe",id:T(S),payload:{subscriptionId:f}}),g}return()=>{!Te.delete(f)||ce||le({...z,type:"workspace-unsubscribe",id:T(S),payload:{subscriptionId:f}})}},un=async(n,i)=>{n.kind==="session"&&be(n.sessionId),n.kind==="project"&&be(n.projectId);let f=T(S);ye.set(f,i);try{await B({...z,type:"shells-subscribe",id:T(S),payload:{subscriptionId:f,scope:n}})}catch(g){throw ye.delete(f),ce||le({...z,type:"shells-unsubscribe",id:T(S),payload:{subscriptionId:f}}),g}return()=>{!ye.delete(f)||ce||le({...z,type:"shells-unsubscribe",id:T(S),payload:{subscriptionId:f}})}},pt=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new h("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!Xe(n.value))throw new h("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new h("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&E?.features?.deviceStorage!==!0)throw new h("UNSUPPORTED","This host does not support device storage.");let i=await Z({...z,type:"storage",id:T(S),payload:n});if(!i||!("storage"in i)||i.op!==n.op)throw new h("HOST_REJECTED","Host did not return storage data.");return i},Xo=(n,i)=>E?.features?.popovers!==!0&&!(E?.surface==="popover"&&E.popover?.id===n)?Promise.reject(new h("UNSUPPORTED","This host does not support popovers.")):B({...z,type:"popover-close",id:T(S),payload:i?{id:n,reason:i}:{id:n}}),Bo=(n,i)=>E?.features?.popovers!==!0&&!(E?.surface==="popover"&&E.popover?.id===n)?Promise.reject(new h("UNSUPPORTED","This host does not support popovers.")):B({...z,type:"popover-anchor",id:T(S),payload:{id:n,active:i}});return t.addEventListener("keydown",$o,!0),t.addEventListener("pointerover",dt),t.addEventListener("pointermove",dt),t.addEventListener("pointerout",Do),t.addEventListener("focus",Ho),t.addEventListener("blur",Fo),{onAction:n=>(G=n,()=>{G===n&&(G=null)}),listProjects:async()=>{let n=await wt({kind:"projects"});if(n.kind!=="projects")throw new h("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let i=await wt({kind:"worktrees",projectId:n});if(i.kind!=="worktrees")throw new h("HOST_REJECTED","Expected worktrees.");return i},listSessions:async n=>{let i=await wt({kind:"sessions",projectId:n});if(i.kind!=="sessions")throw new h("HOST_REJECTED","Expected sessions.");return i},onProjects:n=>Ot({kind:"projects"},i=>{i.kind==="projects"&&n(i)}),onWorktrees:(n,i)=>Ot({kind:"worktrees",projectId:n},f=>{f.kind==="worktrees"&&i(f)}),onSessions:(n,i)=>Ot({kind:"sessions",projectId:n},f=>{f.kind==="sessions"&&i(f)}),onRunningShells:(n,i)=>un(n,i),readShellOutput:async(n,i)=>{be(n,128);let f=i?.cursor;if(f!==void 0&&(!Number.isInteger(f)||f<0))throw new h("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let g=i?.tailBytes;if(g!==void 0&&(!Number.isInteger(g)||g<1||g>65536))throw new h("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let U=await Z({...z,type:"shell-output",id:T(S),payload:{shellId:n,cursor:f,tailBytes:g}});if(!U||typeof U.output!="string"||!Number.isFinite(U.cursor))throw new h("HOST_REJECTED","Host did not return shell output.");return U},stopShell:async n=>{if(be(n,128),(await Z({...z,type:"shell-stop",id:T(S),payload:{shellId:n}}))?.stopped!==!0)throw new h("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{be(n),await B({...z,type:"open-session",id:T(S),payload:{sessionId:n}})},storage:{get:async(n,i)=>{let f=_t(i),g={op:"get",key:n};f&&(g.scope=f);let L=await pt(g);return L.op==="get"&&L.found?L.value:void 0},set:async(n,i,f)=>{let g=_t(f),L={op:"set",key:n,value:i};g&&(L.scope=g),await pt(L)},delete:async(n,i)=>{let f=_t(i),g={op:"delete",key:n};f&&(g.scope=f),await pt(g)},keys:async n=>{let i=_t(n),f={op:"keys"};i&&(f.scope=i);let g=await pt(f);if(g.op!=="keys")throw new h("HOST_REJECTED","Expected storage keys.");return g.keys}},onReady:n=>(s.add(n),E&&n(E),()=>{s.delete(n)}),onDirectory:n=>(c.add(n),E&&n(E.directory),()=>{c.delete(n)}),onSession:n=>(l.add(n),E&&n(E.session),()=>{l.delete(n)}),onSessionLifecycle:n=>(p.add(n),_&&n(_),()=>{p.delete(n)}),onConnection:n=>(x.add(n),E&&n(E.connection),()=>{x.delete(n)}),onSettings:n=>(u.add(n),E&&n(E.settings),()=>{u.delete(n)}),onItem:n=>(b.add(n),E&&n(E.item),()=>{b.delete(n)}),onStatusControl:n=>(k.add(n),()=>{k.delete(n)}),onPopoverClosed:n=>(j.add(n),()=>{j.delete(n)}),setStatusControls:n=>E?.features?.statusControls!==!0?Promise.reject(new h("UNSUPPORTED","This host does not support status controls.")):Wo(n)?B({...z,type:"status-controls",id:T(S),payload:{controls:n}}):Promise.reject(new h("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>E?.features?.popovers!==!0?Promise.reject(new h("UNSUPPORTED","This host does not support popovers.")):Lt(n)?B({...z,type:"popover-open",id:T(S),payload:n}):Promise.reject(new h("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Xo,setPopoverAnchorActive:Bo,onResolve:n=>(y=n,()=>{y===n&&(y=null)}),toast:n=>{let i=n.message.trim();return!i||i.length>mt?Promise.reject(new h("HOST_REJECTED",`Toast message must contain 1 to ${mt} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>ft)?Promise.reject(new h("HOST_REJECTED",`Toast copy text must contain 1 to ${ft} characters.`)):B({channel:A,v:1,type:"toast",id:T(S),payload:{...n,message:i}})},openUrl:n=>B({channel:A,v:1,type:"open-url",id:T(S),payload:{url:n}}),openCommit:n=>$t(n)?B({channel:A,v:1,type:"open-commit",id:T(S),payload:{sha:n}}):Promise.reject(new h("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),openSurface:n=>B({channel:A,v:1,type:"open-surface",id:T(S),payload:{surfaceId:n}}),writeClipboard:n=>B({channel:A,v:1,type:"clipboard-write",id:T(S),payload:{text:n}}),compose:n=>B({channel:A,v:1,type:"compose",id:T(S),payload:n}),attach:n=>B({channel:A,v:1,type:"attach",id:T(S),payload:Be(n)}),startSession:async n=>{n.projectId!==void 0&&be(n.projectId);let i=n.worktree;i&&i!==!0&&(i.kind==="existing"?be(i.directory):(i.name!==void 0&&be(i.name,200),i.baseBranch!==void 0&&be(i.baseBranch,200)));let f=await Z({channel:A,v:1,type:"start-session",id:T(S),payload:Xt(n)},e.requestTimeoutMs??18e4);if(!Nt(f))throw new h("HOST_REJECTED","Host did not return a session.");return f},prompt:n=>Z({channel:A,v:1,type:"prompt",id:T(S),payload:Bt(n)}).then(i=>{if(!Pt(i))throw new h("HOST_REJECTED","Host did not return a prompt result.");return i}),sessionLink:n=>B({channel:A,v:1,type:"session-link",id:T(S),payload:Be(n)}),close:()=>B({channel:A,v:1,type:"close",id:T(S)}),oauthStart:()=>B({channel:A,v:1,type:"oauth-start",id:T(S)}),oauthDisconnect:()=>B({channel:A,v:1,type:"oauth-disconnect",id:T(S)}),request:n=>(xt(n.path)?Z({channel:A,v:1,type:"request",id:T(S),payload:n}):xr()).then(i=>{if(!St(i))throw new h("HOST_REJECTED","Host request result was empty.");return i}),serviceRequest:n=>(xt(n.path)?Z({channel:A,v:1,type:"service-request",id:T(S),payload:n}):xr()).then(i=>{if(!St(i))throw new h("HOST_REJECTED","Host service request result was empty.");return i}),serviceStatus:()=>Z({channel:A,v:1,type:"service-status",id:T(S)}).then(n=>{if(!jt(n))throw new h("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(ze(n)?Z({channel:A,v:1,type:"file-read",id:T(S),payload:{path:n}}):vt()).then(i=>{if(!Kt(i))throw new h("HOST_REJECTED","Host did not return file content.");return i}),writeFile:(n,i)=>ze(n)?i.length>ht?Promise.reject(new h("FILE_TOO_LARGE",`Content is over ${ht} characters.`)):Z({channel:A,v:1,type:"file-write",id:T(S),payload:{path:n,content:i}}).then(f=>{if(!Wt(f))throw new h("HOST_REJECTED","Host did not confirm the write.");return f}):vt(),listDir:n=>(ze(n)?Z({channel:A,v:1,type:"file-list",id:T(S),payload:{path:n}}):vt()).then(i=>{if(!Jt(i))throw new h("HOST_REJECTED","Host did not return directory entries.");return i}),stat:n=>(ze(n)?Z({channel:A,v:1,type:"file-stat",id:T(S),payload:{path:n}}):vt()).then(i=>{if(!Yt(i))throw new h("HOST_REJECTED","Host did not return file status.");return i}),generate:n=>{let i=n.prompt.trim(),f=n.system?.trim();if(i.length===0||i.length>bt)return Promise.reject(new h("HOST_REJECTED",`Prompt must be 1 to ${bt} characters.`));if(f!==void 0&&(f.length===0||f.length>Et))return Promise.reject(new h("HOST_REJECTED",`System prompt must be 1 to ${Et} characters.`));let g=n.maxOutputTokens===void 0?void 0:Math.min(Ht,Math.max(1,Math.floor(n.maxOutputTokens)));if(g!==void 0&&!Number.isFinite(g))return Promise.reject(new h("HOST_REJECTED","maxOutputTokens must be a number."));let L={prompt:i};return f!==void 0&&(L.system=f),g!==void 0&&(L.maxOutputTokens=g),Z({channel:A,v:1,type:"generate",id:T(S),payload:L},e.requestTimeoutMs??Ft).then(U=>{if(!qt(U))throw new h("HOST_REJECTED","Host did not return generated text.");return U})},onLateGenerateResult:n=>{D.add(n);for(let i of Q.splice(0))H([n],i);return Lo(),()=>{D.delete(n)}},setBadge:n=>B({channel:A,v:1,type:"badge",id:T(S),payload:{count:zt(n)}}),setHeight:n=>B({channel:A,v:1,type:"resize",id:T(S),payload:{height:Vt(n)}}),onFileOpen:n=>(I.add(n),Fe||(Fe=!0,t.addEventListener("keydown",Po,!0)),Ie&&n(Ie),()=>{I.delete(n)}),onFileSnapshot:n=>(re=n,()=>{re===n&&(re=null)}),onFileSaved:n=>(ae.add(n),()=>{ae.delete(n)}),reportFileChange:n=>At({...z,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:No,reportFileUnsupported:()=>At({...z,type:"file-unsupported"}),dispose:()=>{for(let n of Te.keys())le({...z,type:"workspace-unsubscribe",id:T(S),payload:{subscriptionId:n}});Te.clear();for(let n of ye.keys())le({...z,type:"shells-unsubscribe",id:T(S),payload:{subscriptionId:n}});ye.clear(),ce=!0,y=null,G=null,re=null,I.clear(),ae.clear(),Fe&&t.removeEventListener("keydown",Po,!0),t.removeEventListener("message",Go),t.removeEventListener("keydown",$o,!0),t.removeEventListener("pointerover",dt),t.removeEventListener("pointermove",dt),t.removeEventListener("pointerout",Do),t.removeEventListener("focus",Ho),t.removeEventListener("blur",Fo);for(let n of _e.values())clearTimeout(n.timer),n.reject(new h("HOST_UNAVAILABLE","Host client was disposed."));_e.clear(),s.clear(),c.clear(),l.clear(),p.clear(),x.clear(),u.clear(),b.clear(),k.clear(),j.clear(),D.clear(),Q.length=0}}};var _r=["browser.open","browser.snapshot","browser.click","browser.type","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var oi=new Set(_r);var Tr=["none","agent","user"];var ni=new Set(Tr);var _n=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Tn=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],yr=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,r]of _n)t.style.setProperty(o,e.tokens[r]);for(let[o,r,s]of Tn){let c=e.tokens[s]??"";t.style.setProperty(o,c),t.style.setProperty(r,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},no=(e,t)=>{yr(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var yn={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},P=(e,t)=>`var(--${e}, var(--oc-${yn[e]}, ${t}))`,Ae=P("surface-background","transparent"),yt=P("surface-elevated","transparent"),Ve=P("surface-elevated-foreground","inherit"),he=P("surface-foreground","inherit"),N=P("surface-muted-foreground","gray"),kn=P("surface-muted","transparent"),Ue=P("interactive-border","currentColor"),ee=P("interactive-hover","transparent"),Ge=P("interactive-active","transparent"),so=P("interactive-selection","transparent"),io=P("interactive-selection-foreground","inherit"),ke=P("primary","currentColor"),ao=P("primary-text","inherit"),co=P("error-text","inherit"),An=P("font-sans","inherit"),lo=P("font-mono","monospace"),Rr=P("radius","9px"),po=`calc(${Rr} - 2px)`,kr=`calc(${Rr} - 4px)`,F=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,Ar=`background-image: linear-gradient(${ee}, ${ee});`,uo=e=>`box-shadow: inset 0 0 0 1px ${e}, var(--oc-sdk-field-lift);`,mo="box-shadow: inset 0 0 0 1px var(--oc-sdk-edge), var(--oc-sdk-raised-lift);",wr="box-shadow: var(--oc-sdk-lit);",Or=`inset 0 1px 0 0 ${F(he,1.5)}, 0 1px 1px 0 rgb(0 0 0 / 0.28), 0 2px 3px -2px rgb(0 0 0 / 0.2)`,wn=`
:root {
  --oc-sdk-edge: ${F(he,10)};
  --oc-sdk-field-bg: ${yt};
  --oc-sdk-raised-bg: ${Ae};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 2px 0 rgb(0 0 0 / 0.06);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.45), 0 1px 2px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.8), inset 0 0 0 1px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.1), 0 1px 2px -0.5px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.08);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${F(he,6)};
  --oc-sdk-field-bg: ${F(Ae,50,yt)};
  --oc-sdk-raised-bg: ${yt};
  --oc-sdk-field-lift: ${Or};
  --oc-sdk-raised-lift: ${Or};
  --oc-sdk-lit: inset 0 1px 0 0 ${F(he,1.5)}, 0 1px 1px 0 rgb(0 0 0 / 0.28), 0 2px 3px -2px rgb(0 0 0 / 0.2);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.36), 0 1px 1px -0.5px rgb(0 0 0 / 0.22), 0 3px 3px -1.5px rgb(0 0 0 / 0.2), 0 6px 6px -3px rgb(0 0 0 / 0.16);
}`,Tt=e=>{let t=P(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${P(`${e}-text`,"inherit")}; }`},On=`
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
`,Cr=`${wn}
.oc-sdk { color: ${he}; font-family: ${An}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Ar} }
.oc-sdk-mono { font-family: ${lo}; }
.oc-sdk-muted { color: ${N}; }
${Tt("success")}${Tt("warning")}${Tt("error")}${Tt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ke}; --oc-sdk-tone-text: ${ao}; }

.oc-sdk-btn { border-radius: ${po}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${kr}; }
.oc-sdk-btn[data-variant="default"] { color: ${ao}; background: ${F(ke,10,Ae)}; border-color: ${F(ke,12)}; ${wr} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${F(ke,16,Ae)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${F(ke,22,Ae)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${kn}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${ee}, ${ee}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Ge}, ${Ge}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Ve}; border-color: transparent; ${mo} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${ee}, ${ee}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Ge}, ${Ge}); box-shadow: inset 0 0 0 1px var(--oc-sdk-edge); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${ee}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Ge}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${P("status-error","red")}; color: ${co}; background: ${F("var(--oc-sdk-tone)",7,Ae)}; border-color: ${F("var(--oc-sdk-tone)",12)}; ${wr} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${F("var(--oc-sdk-tone)",9,Ae)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${F("var(--oc-sdk-tone)",11,Ae)}; box-shadow: none; }

.oc-sdk-field-note { color: ${N}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${co}; }
.oc-sdk-input { border-radius: ${po}; background: var(--oc-sdk-field-bg); color: ${Ve}; ${uo("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${N}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${ee}, ${ee}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${uo(F(he,26))} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${uo(P("status-error","red"))} }
.oc-sdk-input[data-mono="true"] { font-family: ${lo}; }

.oc-sdk-search-icon { color: ${N}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ke}; }
.oc-sdk-search-clear { border-radius: ${kr}; color: ${N}; }
.oc-sdk-search-clear:hover { background: ${ee}; color: ${he}; }

.oc-sdk-trigger { border-color: transparent; border-radius: ${po}; background: var(--oc-sdk-raised-bg); color: ${Ve}; ${mo} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${ee}, ${ee}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Ge}, ${Ge}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${N}; }
.oc-sdk-trigger-chevron { color: ${N}; }
/* The app's dropdown light: lit top, hairline rings and a layered shadow, no border. */
.oc-sdk-popup { --surface-foreground: ${Ve}; border-color: transparent; border-radius: 12px; background: ${yt}; color: ${Ve}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${ee}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${so}; color: ${io}; }
.oc-sdk-option-check { color: ${he}; }
.oc-sdk-option[data-destructive="true"] { color: ${co}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${F(P("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${N}; }
.oc-sdk-popup-empty { color: ${N}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Ue}; border-radius: 4px; color: ${he}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${F(he,60,Ue)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Ue}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${Ae}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${ke}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Ar} }
.oc-sdk-check-desc { color: ${N}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${F(he,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${N}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${he}; }
.oc-sdk-tab[aria-selected="true"] { color: ${io}; background: ${so}; border-color: ${Ue}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Ve}; background: var(--oc-sdk-raised-bg); border-color: transparent; ${mo} }
.oc-sdk-tab-count { color: ${N}; }

.oc-sdk-badge { border-radius: 9999px; background: ${ee}; color: ${N}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${F("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${ee}; }
.oc-sdk-row[aria-selected="true"] { background: ${so}; color: ${io}; }
.oc-sdk-row-lead { font-family: ${lo}; color: ${N}; }
.oc-sdk-row-sub { color: ${N}; }
.oc-sdk-row-meta { color: ${N}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${N}; }

.oc-sdk-empty-body { color: ${N}; }

.oc-sdk-spinner { color: ${N}; }
.oc-sdk-spinner-ring { border-color: ${Ue}; border-top-color: ${ke}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${F("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${N}; }

.oc-sdk-separator { color: ${N}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${F(Ue,40)}; }

.oc-sdk-progress-label { color: ${N}; }
.oc-sdk-progress-track { border-radius: 9999px; background: ${Ue}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${ke}); }

.oc-sdk-text a { color: ${ao}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${F(Ue,60)}; }
`,J=`
${Rt}
${On}
${Cr}`;var Ir="oc-sdk-ui-style",je=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},Y=e=>{let t=document.getElementById(Ir);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}Ct(document);let o=document.createElement("style");o.id=Ir,o.textContent=e,document.head.appendChild(o)},C=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},Ee=e=>{let t=C("button",e);return t.type="button",t},de=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},Ke=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},Ur=(e,t)=>{let o=r=>{r.target instanceof Node&&e.contains(r.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var Rn=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Me=(e,t)=>{Y(J);let o=t,r=Ee("oc-sdk oc-sdk-btn"),s=Rn(),c=document.createElement("span");r.append(c),e.append(r);let l=()=>{r.dataset.variant=o.variant??"default",r.dataset.size=o.size??"default",r.disabled=!!o.disabled||!!o.loading,r.dataset.loading=o.loading?"true":"false",r.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&s.parentNode!==r?r.prepend(s):!o.loading&&s.parentNode===r&&s.remove(),de(c,o.label)},p=()=>{o.disabled||o.loading||o.onClick()};return r.addEventListener("click",p),l(),{update:x=>{o={...o,...x},l()},dispose:()=>{r.removeEventListener("click",p),r.remove()}}};var Mr="http://www.w3.org/2000/svg",Cn={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},We=(e,t,o)=>{let r=document.createElementNS(Mr,"svg");r.setAttribute("viewBox","0 0 24 24"),r.setAttribute("width",String(t)),r.setAttribute("height",String(t)),r.setAttribute("aria-hidden","true"),r.setAttribute("fill","currentColor"),o&&r.setAttribute("class",o);let s=document.createElementNS(Mr,"path");return s.setAttribute("d",Cn[e]),r.append(s),r};var Ne=(e,t="vertical")=>{let[o,r]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===r||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Je=(e,t,o)=>{let r=e.filter(x=>!x.disabled);if(r.length===0)return null;let s=r[0],c=r[r.length-1];if(o==="first"||!s||!c)return s?.id??null;if(o==="last")return c.id;let l=r.findIndex(x=>x.id===t);return l===-1?o==="next"?s.id:c.id:r[Math.min(r.length-1,Math.max(0,l+(o==="next"?1:-1)))]?.id??null};var Lr=(e,t)=>`${e}-${t??""}`,fo=(e,t,o,r)=>{let s=Ee("oc-sdk-option");s.id=Lr(e,o.id),s.setAttribute("role",t),s.tabIndex=-1,s.disabled=!!o.disabled,t==="option"&&s.setAttribute("aria-selected",o.selected?"true":"false"),s.dataset.destructive=o.destructive?"true":"false";let c=C("span","oc-sdk-option-label");if(c.textContent=o.label,s.append(c),o.hint){let l=C("span","oc-sdk-option-hint");l.textContent=o.hint,s.append(l)}if(t==="option"){s.dataset.mark="check";let l=C("span","oc-sdk-option-check");l.append(We("check",14)),s.append(l)}return s.addEventListener("pointerenter",r.hover),s.addEventListener("click",r.pick),s},go=(e,t,o,r)=>{let s=Lr(o,r);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===s?"true":"false");Ke(t,"aria-activedescendant",r?s:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var In=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let r=e.offsetHeight,s=window.innerHeight-o.bottom-8;r>s&&o.top-8>s&&(e.style.top=`${Math.max(8,Math.round(o.top-4-r))}px`);let c=o.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(o.left-c))}px`)},ho=(e,t,o,r)=>{e.append(o),In(o,t);let s=Ur(e,r),c=()=>{r()},l=p=>{p.target instanceof Node&&o.contains(p.target)||r()};return window.addEventListener("resize",c),window.addEventListener("scroll",l,!0),()=>{s(),window.removeEventListener("resize",c),window.removeEventListener("scroll",l,!0),o.remove()}};var Gr=(e,t)=>{let o=t.trim().toLowerCase();return o?e.filter(r=>r.label.toLowerCase().includes(o)||r.id.toLowerCase().includes(o)):[...e]},Un=0,bo=(e,t)=>{Y(J);let o=t,r=`oc-sdk-select-${Un+=1}`,s=C("div","oc-sdk oc-sdk-select"),c=C("span","oc-sdk-field-label");c.id=`${r}-label`;let l=Ee("oc-sdk-trigger");l.setAttribute("aria-haspopup","listbox"),l.setAttribute("aria-labelledby",c.id);let p=C("span","oc-sdk-trigger-value");l.append(p,We("chevron",14,"oc-sdk-trigger-chevron")),s.append(c,l),e.append(s);let x="",u=null,b=null,k=C("div","oc-sdk oc-sdk-popup"),j=C("div","oc-sdk-popup-search"),D=C("input","oc-sdk-input");D.type="text",D.autocomplete="off",j.append(D);let Q=C("div");Q.setAttribute("role","listbox"),Q.tabIndex=-1,k.append(Q);let y=()=>Gr(o.options,o.searchable?x:""),G=()=>o.searchable?D:Q,I=_=>{u=_,go(Q,G(),r,_)},ae=()=>{je(Q);let _=y();if(_.length===0){let X=C("div","oc-sdk-popup-empty");X.textContent="No matches",Q.append(X)}for(let X of _)Q.append(fo(r,"option",{...X,selected:X.id===o.value},{hover:()=>I(X.id),pick:()=>Fe(X.id)}));I(_.some(X=>X.id===u)?u:_[0]?.id??null)},re=()=>{let _=b;b=null,_?.(),x="",D.value="",l.setAttribute("aria-expanded","false")},Ie=()=>{b||o.disabled||(u=o.value,D.placeholder=o.searchPlaceholder??"Search",o.searchable?k.prepend(j):j.remove(),ae(),b=ho(s,l,k,re),l.setAttribute("aria-expanded","true"),G().focus())},Fe=_=>{re(),l.focus(),_!==o.value&&o.onChange(_)},_e=()=>{b?re():Ie()},Te=_=>{!b&&Ne(_)&&(_.preventDefault(),Ie())},ye=_=>{let X=Ne(_);X?(_.preventDefault(),I(Je(y(),u,X))):_.key==="Enter"?(_.preventDefault(),u&&Fe(u)):_.key==="Escape"?(_.preventDefault(),re(),l.focus()):o.searchable&&_.target!==D&&_.key.length===1&&!_.ctrlKey&&!_.metaKey&&D.focus()},ce=()=>{x=D.value,ae()},S=_=>{b&&!(_.relatedTarget instanceof Node&&s.contains(_.relatedTarget))&&re()},E=()=>{de(c,o.label),c.hidden=!o.label;let _=o.options.find(X=>X.id===o.value);de(p,_?.label??o.placeholder??"Select"),p.dataset.empty=_?"false":"true",l.disabled=!!o.disabled,b&&ae()};return l.addEventListener("click",_e),l.addEventListener("keydown",Te),k.addEventListener("keydown",ye),D.addEventListener("input",ce),s.addEventListener("focusout",S),E(),{update:_=>{o={...o,..._},E()},dispose:()=>{re(),l.removeEventListener("click",_e),l.removeEventListener("keydown",Te),k.removeEventListener("keydown",ye),D.removeEventListener("input",ce),s.removeEventListener("focusout",S),s.remove()}}};var Ln=/^[a-z0-9][a-z0-9-]{0,63}$/,Gn=new Set(["all","new"]),ne=class extends Error{constructor(t){super(t),this.name="GroupFileError"}};var Nr=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new ne("Invalid group config format");let t=e;if(t.version!==1)throw new ne("Unsupported group config version");if(!Array.isArray(t.groups))throw new ne("Invalid group list format");if(t.groups.length>50)throw new ne("Cannot have more than 50 groups");let o=[],r=new Set,s=new Set;for(let[c,l]of t.groups.entries()){if(!l||typeof l!="object"||Array.isArray(l))throw new ne(`Group ${c+1} has an invalid format`);let p=l;if(typeof p.id!="string"||!Ln.test(p.id)||Gn.has(p.id))throw new ne(`Group ${c+1} has an invalid ID`);if(r.has(p.id))throw new ne(`Duplicate group ID: ${p.id}`);let x=typeof p.name=="string"?p.name.trim():"";if(!x||x.length>40||/[\u0000-\u001f\u007f]/.test(x))throw new ne(`Group ${c+1} name must be 1-40 characters`);let u=x.toLowerCase();if(s.has(u))throw new ne(`Duplicate group name: ${x}`);if(!Array.isArray(p.serverIds))throw new ne(`Group "${x}" has an invalid member format`);if(p.serverIds.length>200)throw new ne(`Group "${x}" cannot have more than 200 members`);let b=[],k=new Set;for(let j of p.serverIds){if(typeof j!="string"||!j||j.length>128)throw new ne(`Group "${x}" contains an invalid server ID`);k.has(j)||(k.add(j),b.push(j))}r.add(p.id),s.add(u),o.push({id:p.id,name:x,serverIds:b})}return{version:1,groups:o}};var Pr=`:root {\r
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
.mc-title-block {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 2px 8px;
  min-width: 0;
}
.mc-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}
.mc-title-count {
  color: var(--mc-muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}\r
.mc-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 4px;
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
.mc-warning-details summary {
  cursor: pointer;
  color: var(--mc-muted);
  font-size: 11px;
}
.mc-failure {
  margin: 6px 0 0;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--mc-error) 35%, var(--mc-border));
  border-radius: var(--oc-radius, 6px);
  background: color-mix(in srgb, var(--mc-error) 5%, var(--mc-bg));
}
.mc-failure-summary {
  cursor: pointer;
  color: var(--mc-fg);
  font-size: 11px;
  font-weight: 500;
}
.mc-failure-summary:focus-visible {
  outline: 2px solid var(--oc-focus);
  outline-offset: 2px;
}
.mc-failure-body {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mc-failure-lead {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
}
.mc-failure-detail {
  margin: 0;
  max-height: 180px;
  overflow: auto;
  padding: 6px 8px;
  border-radius: var(--oc-radius, 6px);
  background: var(--oc-code-bg, rgba(127, 127, 127, 0.12));
  color: var(--mc-fg);
  font-family: var(--oc-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.mc-failure-meta {
  margin: 0;
  color: var(--mc-muted);
  font-size: 11px;
  overflow-wrap: anywhere;
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
.mc-search {
  width: 100%;
  min-height: 32px;
  margin: 0;
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
`;var $r=`/* Shared foundation for OpenChamber extensions. Colors and fonts belong to the host. */\r
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
`;var ve=ro({requestTimeoutMs:3e4}),Qr=document.querySelector("#root");if(!Qr)throw new Error("Missing #root");var Zr=document.createElement("style");Zr.textContent=$r+Pr;document.head.append(Zr);var a=(e,t="",o)=>{let r=document.createElement(e);return r.className=t,o!==void 0&&(r.textContent=o),r},$n=/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/,Dr="Values hidden by opencode.json stay blank; leaving them blank keeps what opencode.json already stores (kept from opencode.json).",Hr="One KEY=VALUE per line.",Fr="One Name: value per line.",Oe=class extends Error{code;conflicts;constructor(t,o,r){super(t),this.name="ServiceError",this.code=o,this.conflicts=r}},ie=e=>e&&typeof e=="object"&&!Array.isArray(e)?e:null,Re=(e,t="")=>typeof e=="string"?e:t,Ye=e=>typeof e=="string"&&e.length>0?e:null,nt=e=>e===!0,Dn=e=>typeof e=="number"&&Number.isFinite(e)?e:0,pe=e=>Array.isArray(e)?e.filter(t=>typeof t=="string"):[],Hn=e=>e==="enabled"||e==="disabled"||e==="invalid"||e==="conflict",Fn=e=>e==="local"||e==="remote"||e==="unknown",Xn=e=>e==="both"||e==="read-error"||e==="duplicate"||e==="invalid"||e==="stub"||e==="tools-off"||e==="insecure-url",Bn=e=>e==="auto"||e==="disabled"||e==="configured"||e==="none",wo=e=>{let t=ie(e);return!t||!Xn(t.kind)?null:{kind:t.kind,serverId:Re(t.serverId),message:Re(t.message,"Conflict"),paths:pe(t.paths),blocking:nt(t.blocking)}},Xr=e=>{let t=ie(e);return{path:Re(t?.path),exists:nt(t?.exists),error:typeof t?.error=="string"?t.error:null}},zn=e=>{let t=ie(e);return t?{message:Re(t.message,"mcp connect failed"),detail:Ye(t.detail),at:Re(t.at),directory:Ye(t.directory)}:null},Vn=e=>{let t=ie(e);return!t||typeof t.id!="string"||!t.id||!Hn(t.state)?null:{id:t.id,container:t.container==="legacy"?"legacy":"servers",transport:Fn(t.transport)?t.transport:"unknown",command:pe(t.command),url:Ye(t.url),cwd:Ye(t.cwd),environmentKeys:pe(t.environmentKeys),headerKeys:pe(t.headerKeys),timeout:Ye(t.timeout),codemode:nt(t.codemode),protocol:Ye(t.protocol),oauth:Bn(t.oauth)?t.oauth:"none",enabled:nt(t.enabled),state:t.state,advertised:nt(t.advertised),toolsOff:pe(t.toolsOff),paths:pe(t.paths),targets:pe(t.targets),conflicts:Array.isArray(t.conflicts)?t.conflicts.map(wo).filter(o=>o!==null):[],warnings:pe(t.warnings),failure:zn(t.failure),contentHash:Re(t.contentHash)}},Ce=e=>{let t=ie(e);if(!t||!Array.isArray(t.servers))throw new Oe("The service returned data in an invalid format.","parse",[]);let o=t.servers.map(Vn).filter(l=>l!==null),r=Array.isArray(t.conflicts)?t.conflicts.map(wo).filter(l=>l!==null):o.flatMap(l=>l.conflicts),s=r.filter(l=>l.blocking).length,c={total:o.length,advertised:o.filter(l=>l.advertised).length,enabled:o.filter(l=>l.state==="enabled").length,disabled:o.filter(l=>l.state==="disabled").length,invalid:o.filter(l=>l.state==="invalid"||l.state==="conflict").length,legacy:o.filter(l=>l.container==="legacy").length,blockingConflicts:s,warnings:r.length-s};return{servers:o,conflicts:r,summary:c,config:Xr(t.config),scanned:Array.isArray(t.scanned)?t.scanned.map(Xr).filter(l=>l.path.length>0):[],scannedAt:Dn(t.scannedAt)}},Oo=e=>{try{return Nr(e).groups}catch(t){throw new Oe(t instanceof Error?t.message:"The group configuration format is invalid.","parse",[])}},jn=e=>{let t=ie(e),o=ie(t?.definition);if(!t||!o)throw new Oe("The service returned an invalid server definition.","parse",[]);return{id:Re(t.id),container:t.container==="legacy"?"legacy":"servers",definition:o,paths:pe(t.paths),maskedPaths:pe(t.maskedPaths)}},fe=async(e,t,o)=>{let r=await ve.serviceRequest({method:e,path:t,...o===void 0?{}:{body:JSON.stringify(o)}}),s;try{s=JSON.parse(r.body)}catch{throw new Oe("The service returned unrecognized data. Try again.","parse",[])}if(r.status>=400){let c=ie(s)??{},l=typeof c.error=="string"?c.error:`Request failed (${r.status})`,p=typeof c.code=="string"?c.code:null,x=Array.isArray(c.conflicts)?c.conflicts.map(wo).filter(u=>u!==null):[];throw new Oe(l,p,x)}return s},ge=e=>e instanceof h?e.code==="NO_SERVICE"?'Allow "MCP Manager" to run its local service in Settings \u2192 Extensions.':e.code==="SERVICE_FAILED"?"The local service is not ready. Reload the extension and try again.":e.code==="DISABLED"?"The MCP Manager extension is disabled. Enable it in extension settings.":e.code==="HOST_TIMEOUT"?"The local service timed out. Try again.":e.code==="NOT_GRANTED"?"Allow the required permission in extension settings, or reinstall the extension.":"Cannot connect to the local service. Check the extension permissions.":e instanceof Oe||e instanceof Error?e.message:"The operation failed. Try again.",Kn=e=>e instanceof Oe&&e.code==="not-found"?'The local service is outdated. Disable and re-enable "MCP Manager" in extension settings.':ge(e),kt=a("main","ext mc");kt.setAttribute("aria-label","MCP Manager");var Ro=a("header","mc-header"),en=a("div","mc-title-row"),tn=a("div","mc-title-block"),Wn=a("h1","mc-title","MCP Manager"),on=a("span","mc-title-count"),ct=a("div","mc-actions"),Jn=Me(ct,{label:"Rescan",variant:"outline",size:"sm",onClick:()=>{dn(!0),Io()}}),Yn=Me(ct,{label:"Enable all",variant:"outline",size:"sm",onClick:()=>pn(!0)}),qn=Me(ct,{label:"Disable all",variant:"outline",size:"sm",onClick:()=>pn(!1)});tn.append(Wn,on);en.append(tn);Ro.append(en);var rn=a("div","mc-body"),te=a("div","mc-notice-root");te.setAttribute("aria-live","polite");var _o=a("div","mc-groups-note"),nn=a("div","mc-groups-row"),st=a("div","mc-groups"),Co=a("div","mc-group-select"),we=a("button","mc-chip mc-groups-edit","Edit groups");we.type="button";we.setAttribute("aria-pressed","false");we.addEventListener("click",()=>{R?cn():cs()});nn.append(st,Co,we);var qe=a("div","mc-group-editor-root"),Qe=a("div","mc-server-editor-root"),To=a("div"),at=a("div"),Ze=a("input","mc-search");Ze.type="search";Ze.placeholder="Search name, command or URL";Ze.setAttribute("aria-label","Search MCP servers");Ze.addEventListener("input",()=>{yo=Ze.value.trim().toLowerCase(),ln()});Ro.append(Ze);var it=a("div","mc-list");it.setAttribute("role","list");var sn=a("footer","mc-footer");sn.append(a("p","","Manages the mcp.servers block of ~/.config/opencode/opencode.json (and opencode.jsonc when present). Writes preserve comments and the rest of the file; every write keeps the previous content in opencode.json.mcp-manager.bak."),a("p","","Changes take effect when OpenCode reloads its config; running sessions keep the tools they already loaded."));rn.append(te,ct,_o,nn,qe,Qe,To,at,it,sn);kt.append(Ro,rn);Qr.append(kt);var v=null,ue=!1,$e=null,O=null,d=null,me=null,oe=null,xe=null,K=null,W=[],Se=null,De=!0,R=null,se=null,et=!1,M=null,q=null,yo="",Br=!1,Qn=bo(Co,{value:"all",options:[{id:"all",label:"All"}],onChange:e=>{K=e==="all"?null:e,m()}}),Eo=Co.querySelector(".oc-sdk-trigger");Eo&&(Eo.setAttribute("aria-label","Filter by group"),Eo.removeAttribute("aria-labelledby"));var Le=()=>!!v?.config.error,Zn=e=>e.state==="conflict"?"error":e.state==="invalid"?"warning":e.state==="disabled"?"info":e.advertised?"success":"warning",es=e=>e.state==="conflict"?"Conflict":e.state==="invalid"?"Invalid":e.state==="disabled"?"Disabled":"Enabled",xo=(e,t="neutral")=>{let o=a("span","mc-badge",e);return o.dataset.tone=t,o},ts=e=>{switch(e){case"both":return"Defined in more than one config file";case"duplicate":return"Duplicate entry inside mcp.servers";case"invalid":return"Definition cannot be read";case"read-error":return"Config cannot be read";case"tools-off":return"A tool is turned off";case"insecure-url":return"URL is not encrypted";default:return"Conflict"}},os=(e,t)=>{if(!t)return null;let o=a("p","mc-path");return o.append(a("span","mc-path-label",`${e}: `),a("code","",t)),o},$=(e,t,o=!1,r=!1)=>{let s=a("button",o?"mc-inline-button mc-inline-primary":"mc-inline-button",e);return s.type="button",s.disabled=!!d||r,s.addEventListener("click",t),s},Pe=(e,t,o=null)=>{let r=a("div","mc-field");return r.append(a("span","mc-field-label",e),t),(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t instanceof HTMLSelectElement)&&t.setAttribute("aria-label",e),o&&r.append(a("span","mc-field-hint",o)),r},rs=e=>e.split(/[\\/]/).pop()||e,zr=e=>{let t=a("li","mc-conflict-item");t.dataset.tone=e.blocking?"error":"warning";let o=a("div","mc-conflict-copy");o.append(a("strong","",ts(e.kind)),a("p","mc-conflict-message",e.message));for(let r of e.paths){let s=os("Config",r);s&&o.append(s)}if(t.append(o),e.kind==="both"){let s=(v?.servers.find(c=>c.id===e.serverId)??null)?.targets??[];if(s.length>=2){let c=a("div","mc-conflict-actions");for(let l of s){let[p]=l.split("#"),x=l.endsWith("#legacy")?"legacy entry":"mcp.servers";c.append($(`Keep ${rs(p??l)} \xB7 ${x}`,()=>void Ls(e,l),!1,Le()))}t.append(c)}}return t},ns=()=>{if(at.replaceChildren(),!v)return;let e=v.conflicts,t=e.filter(c=>c.blocking),o=e.filter(c=>!c.blocking);if(t.length===0&&o.length===0)return;let r=a("section","mc-conflicts");r.setAttribute("aria-label","Conflict check");let s=a("div","mc-section-head");if(s.append(a("h2","mc-section-title","Conflict check"),a("span","mc-section-count",`${t.length} blocking \xB7 ${o.length} warning${o.length===1?"":"s"}`)),r.append(s),t.length>0){let c=a("ul","mc-conflict-list");for(let l of t)c.append(zr(l));r.append(c)}if(o.length>0){let c=a("details","mc-warning-details");c.append(a("summary","",`Warnings (${o.length})`));let l=a("ul","mc-conflict-list");for(let p of o)l.append(zr(p));c.append(l),r.append(c)}at.append(r)},ss=()=>{if(te.replaceChildren(),xe!==null){let e=xe,t=a("div","mc-notice",`Remove ${e} from opencode.json? The server definition is deleted; a copy is kept in opencode.json.mcp-manager.bak.`);t.dataset.tone="warning",t.setAttribute("role","status");let o=a("div","mc-notice-actions");o.append($("Confirm remove",()=>void Ms(e),!0),$("Cancel",()=>{xe=null,m()})),t.append(o),te.append(t);return}if(oe){let e=oe,t=new Set(e.serverIds),o=v?v.servers.filter(c=>!t.has(c.id)).length:0,r=a("div","mc-notice",`Only "${e.name}": ${o} other servers will be disabled.`);r.dataset.tone="warning",r.setAttribute("role","status");let s=a("div","mc-notice-actions");s.append($("Confirm",()=>void hs(),!0),$("Cancel",()=>{oe=null,m()})),r.append(s),te.append(r);return}if(me!==null){let e=v?v.servers.filter(r=>r.enabled!==me).length:0,t=a("div","mc-notice",me?`${e} servers will be enabled.`:`${e} servers will be disabled.`);t.dataset.tone="warning",t.setAttribute("role","status");let o=a("div","mc-notice-actions");o.append($(me?"Confirm enable":"Confirm disable",()=>void Gs(),!0),$("Cancel",()=>{me=null,m()})),t.append(o),te.append(t);return}if(O){let e=a("div","mc-notice",O.text);if(e.dataset.tone=O.tone,e.setAttribute("role",O.tone==="error"?"alert":"status"),O.actions?.length){let t=a("div","mc-notice-actions");for(let o of O.actions)t.append($(o.label,o.onClick,o.primary));e.append(t)}te.append(e);return}if($e){let e=a("div","mc-notice",$e);e.dataset.tone="error",e.setAttribute("role","alert"),te.append(e);return}if(ue&&!v){let e=a("div","mc-notice","Reading servers\u2026");e.dataset.tone="info",e.setAttribute("role","status"),te.append(e)}},He=e=>e.serverIds.filter(t=>v?.servers.some(o=>o.id===t)),an=e=>{let t=He(e).map(r=>v?.servers.find(s=>s.id===r)).filter(r=>!!r);if(t.length===0)return"No servers";if(t.some(r=>r.state==="conflict"))return"Has conflicts";let o=t.filter(r=>r.state==="enabled").length;return o===t.length?"All on":o===0?"All off":"Partial"},Vr=e=>{Array.from(st.querySelectorAll("[data-group]")).find(o=>o.dataset.group===e)?.focus()},is=()=>`custom-${globalThis.crypto?.randomUUID?.().slice(0,8)??Math.random().toString(36).slice(2,10)}`,as=()=>{if(_o.replaceChildren(),!Se)return;let e=a("div","mc-notice",`Group configuration cannot be read: ${Se}`);e.dataset.tone="error",e.setAttribute("role","alert");let t=a("div","mc-notice-actions");t.append($("Reload",()=>void Io(),!1,De)),e.append(t),_o.append(e)},ko=e=>{R={id:e?.id??null,name:e?.name??"",members:e?[...e.serverIds]:[]},se=null,et=!1,m();let t=qe.querySelector(".mc-group-name");t?.focus(),t?.select()},cs=()=>{if(Se||De||!v||Le())return;let e=W.find(t=>t.id===K)??W[0]??null;ko(e),qe.scrollIntoView({block:"nearest"})},cn=()=>{d||(R=null,se=null,et=!1,m(),we.focus())},ls=e=>{if(e==="new"){ko(null);return}let t=W.find(o=>o.id===e);t&&ko(t)},So=()=>{qe.querySelector(".mc-group-name")?.focus()},jr=async()=>{let e=R;if(!e||d||Se)return;let t=e.name.trim();if(!t){se="Enter a group name.",m(),So();return}if(t.length>40){se=`Group name cannot exceed ${40} characters.`,m(),So();return}if(W.some(c=>c.id!==e.id&&c.name.trim().toLowerCase()===t.toLowerCase())){se=`A group named "${t}" already exists.`,m(),So();return}if(e.members.length===0){se="A group needs at least one member.",m();return}let o=e.id??is(),r={id:o,name:t,serverIds:[...e.members]},s=e.id?W.map(c=>c.id===e.id?r:c):[...W,r];d="groups",se=null,m();try{W=Oo(await fe("POST","/groups",{version:1,groups:s})),Se=null,K=o,oe=null;let c=W.find(l=>l.id===o)??null;R=c?{id:c.id,name:c.name,members:[...c.serverIds]}:null,O={text:`Saved group "${t}".`,tone:"success"},ve.toast({kind:"success",message:`Saved group "${t}"`}).catch(()=>{})}catch(c){se=ge(c)}finally{d=null,m()}},ds=()=>{!R?.id||d||(et=!0,m())},ps=async()=>{if(!R?.id||d)return;let e=R.id,t=W.filter(o=>o.id!==e);d="groups",et=!1,se=null,m();try{W=Oo(await fe("POST","/groups",{version:1,groups:t})),Se=null,oe?.id===e&&(oe=null),K===e&&(K=null);let o=W.find(r=>r.id===K)??W[0]??null;K=o?.id??null,R=o?{id:o.id,name:o.name,members:[...o.serverIds]}:null,O={text:"Group deleted.",tone:"success"}}catch(o){se=ge(o)}finally{d=null,m()}},us=()=>{if(qe.replaceChildren(),!R)return;let e=R,t=a("section","mc-group-editor");t.setAttribute("aria-label","Edit groups");let o=a("div","mc-section-head");o.append(a("h2","mc-section-title","Edit groups"),$("Close",cn,!1,!!d)),t.append(o);let r=a("label","mc-field");r.append(a("span","mc-field-label","Select group"));let s=a("select","mc-input");s.setAttribute("aria-label","Select group");let c=a("option","","New group");c.value="new",s.append(c);for(let y of W){let G=a("option","",`${y.name} (${y.serverIds.length})`);G.value=y.id,s.append(G)}s.value=e.id??"new",s.disabled=!!d,s.addEventListener("change",()=>ls(s.value)),r.append(s);let l=a("label","mc-field");l.append(a("span","mc-field-label","Name"));let p=a("input","mc-input mc-group-name");p.type="text",p.value=e.name,p.maxLength=40,p.placeholder="e.g. Daily development",p.autocomplete="off",p.spellcheck=!1,p.disabled=!!d,p.addEventListener("input",()=>{R&&(R.name=p.value,se=null)}),p.addEventListener("keydown",y=>{y.key==="Enter"&&(y.preventDefault(),jr())}),l.append(p),t.append(r,l);let x=a("fieldset","mc-members"),u=a("legend","",`Members (${e.members.length})`);x.append(u);let b=a("div","mc-members-tools");b.append($("Select all",()=>{if(!R)return;let y=v?.servers.map(I=>I.id)??[],G=R.members.filter(I=>!y.includes(I));R.members=[...y,...G],m()},!1,!!d),$("Clear",()=>{R&&(R.members=[],m())},!1,!!d)),x.append(b);let k=a("div","mc-member-list");for(let y of v?.servers??[]){let G=a("label","mc-check"),I=a("input");I.type="checkbox",I.checked=e.members.includes(y.id),I.disabled=!!d,I.addEventListener("change",()=>{R&&(I.checked?R.members.includes(y.id)||R.members.push(y.id):R.members=R.members.filter(re=>re!==y.id),u.textContent=`Members (${R.members.length})`,se=null)});let ae=a("span","mc-check-copy");ae.append(a("span","mc-check-name",y.id),a("code","mc-check-id",y.transport)),G.append(I,ae),k.append(G)}x.append(k);let j=new Set(v?.servers.map(y=>y.id)??[]),D=e.members.filter(y=>!j.has(y));if(D.length>0){let y=a("div","mc-missing");y.append(a("span","mc-missing-label","Missing from config:"));for(let G of D){let I=a("button","mc-missing-chip",`${G} \xD7`);I.type="button",I.disabled=!!d,I.title="Remove this missing member from the group",I.addEventListener("click",()=>{R&&(R.members=R.members.filter(ae=>ae!==G),m())}),y.append(I)}x.append(y)}if(t.append(x),se){let y=a("p","mc-editor-error",se);y.setAttribute("role","alert"),t.append(y)}let Q=a("div","mc-editor-actions");if(e.id&&Q.append($("Delete group",ds,!1,!!d)),Q.append($(e.id?"Save changes":"Create group",()=>void jr(),!0,!!d)),t.append(Q),et){let y=a("div","mc-editor-confirm");y.dataset.tone="warning",y.append(a("p","",`Delete group "${e.name.trim()||"Untitled"}"? The servers themselves are not changed.`));let G=a("div","mc-actions");G.append($("Confirm delete",()=>void ps(),!0,!!d),$("Cancel",()=>{et=!1,m()},!1,!!d)),y.append(G),t.append(y)}t.append(a("p","mc-editor-hint","Groups only affect panel filtering and bulk toggles; they do not change servers. Members are written to groups.json on save.")),qe.append(t)},ms=()=>{st.replaceChildren();let e=v?.servers.length??0,t=a("button","mc-chip",`All ${e}`);t.type="button",t.dataset.group="all",t.setAttribute("aria-pressed",K===null?"true":"false"),t.addEventListener("click",()=>{K=null,m(),Vr("all")}),st.append(t);for(let o of W){let r=He(o).length,s=a("button","mc-chip",`${o.name} ${r}`);s.type="button",s.dataset.group=o.id,s.setAttribute("aria-pressed",K===o.id?"true":"false"),s.addEventListener("click",()=>{K=o.id,m(),Vr(o.id)}),st.append(s)}we.textContent=R?"Close editor":"Edit groups",we.setAttribute("aria-pressed",R?"true":"false"),we.disabled=De||!!Se||!!d||!v||Le(),we.title=De?"Reading groups\u2026":Se?"Group configuration cannot be read. Fix the file and reload.":v?Le()?"Config cannot be read":"":"Server list not loaded yet",Qn.update({value:K??"all",options:[{id:"all",label:`All ${e}`},...W.map(o=>({id:o.id,label:`${o.name} ${He(o).length}`,hint:an(o)}))]})},fs=()=>{if(To.replaceChildren(),!v||!K)return;let e=v,t=W.find(k=>k.id===K);if(!t)return;let o=He(t),r=t.serverIds.filter(k=>!o.includes(k)),c=o.map(k=>e.servers.find(j=>j.id===k)).filter(k=>!!k).some(k=>k.state==="conflict"),l=Le()||c||o.length===0,p=a("div","mc-groupbar"),x=a("div","mc-groupbar-text");x.append(a("strong","",t.name),a("span","mc-group-state",`${o.length} \xB7 ${an(t)}`)),r.length>0&&x.append(a("p","mc-group-warning",`Missing: ${r.join(", ")}`));let u=a("div","mc-groupbar-actions");u.append($("Enable group",()=>void Kr(t,!0),!1,l),$("Disable group",()=>void Kr(t,!1),!1,l));let b=$("Only this group",()=>gs(t),!1,l||r.length>0);r.length>0&&(b.title="The group has missing servers. Fix them before using only this group."),u.append(b),p.append(x,u),To.append(p)},Kr=async(e,t)=>{if(!v||d)return;let o=He(e);if(o.length!==0){d=`group:${e.id}:${t?"on":"off"}`,oe=null,me=null,xe=null,O=null,m();try{v=Ce(await fe("POST","/servers/batch",{enable:t?o:[],disable:t?[]:o})),O={text:`${o.length} servers in "${e.name}" ${t?"enabled":"disabled"}.`,tone:"success"},ve.toast({kind:"success",message:`${t?"Enabled":"Disabled"} "${e.name}"`}).catch(()=>{})}catch(r){O={text:ge(r),tone:"error"},d=null,m(),tt(!1,!0);return}d=null,m()}},gs=e=>{if(!v||d)return;let t=He(e),o=e.serverIds.filter(r=>!t.includes(r));t.length===0||o.length>0||(oe=e,me=null,xe=null,O=null,m(),te.scrollIntoView({block:"nearest"}),te.querySelector("button")?.focus())},hs=async()=>{if(!v||d||!oe)return;let e=oe;oe=null;let t=He(e),o=e.serverIds.filter(c=>!t.includes(c));if(t.length===0||o.length>0){O={text:"The group has missing servers. Nothing changed.",tone:"error"},m();return}let r=new Set(e.serverIds),s=v.servers.filter(c=>!r.has(c.id)).map(c=>c.id);d=`group-only:${e.id}`,O=null,m();try{v=Ce(await fe("POST","/servers/batch",{enable:t,disable:s})),O={text:`Only "${e.name}" enabled; ${s.length} other servers disabled.`,tone:"success"},ve.toast({kind:"success",message:`Only "${e.name}" enabled`}).catch(()=>{})}catch(c){O={text:ge(c),tone:"error"},d=null,m(),tt(!1,!0);return}d=null,m()},bs=e=>{let t=[],o="",r=!1,s=!1;for(let c of e){if(c==='"'){r=!r,s=!0;continue}if(!r&&/\s/.test(c)){s&&(t.push(o),o="",s=!1);continue}o+=c,s=!0}return r?{tokens:t,error:"A double quote in the command is not closed."}:(s&&t.push(o),{tokens:t,error:null})},Es=e=>/\s/.test(e)?`"${e}"`:e,Wr=(e,t,o)=>{let r={};for(let s of e.split(`
`)){let c=s.trim();if(!c||c.startsWith("#"))continue;let l=c.indexOf(t);if(l<=0)return{values:r,error:`"${c}" is not ${o}`};let p=c.slice(0,l).trim();if(!p)return{values:r,error:`"${c}" is not ${o}`};r[p]=c.slice(l+1).trim()}return{values:r,error:null}},xs=e=>{let t=ie(e),o=[],r=[];if(!t)return{lines:o,masked:r};for(let[s,c]of Object.entries(t)){let l=typeof c=="string"?c:"";l===""&&r.push(s),o.push(`${s}=${l}`)}return{lines:o,masked:r}},Ss=e=>{let t=ie(e),o=[],r=[];if(!t)return{lines:o,masked:r};for(let[s,c]of Object.entries(t)){let l=typeof c=="string"?c:"";l===""&&r.push(s),o.push(`${s}: ${l}`)}return{lines:o,masked:r}},vs=(e,t)=>{let o=xs(t.environment),r=Ss(t.headers);return{id:e,base:t,name:e,transport:t.type==="remote"?"remote":"local",command:pe(t.command).map(Es).join(" "),cwd:Re(t.cwd),environment:o.lines.join(`
`),url:Re(t.url),headers:r.lines.join(`
`),enabled:t.disabled!==!0&&t.enabled!==!1,maskedEnvironment:o.masked,maskedHeaders:r.masked}},_s=e=>{let t={...e.base};for(let o of["type","command","cwd","environment","url","headers","enabled","disabled"])delete t[o];if(t.type=e.transport,e.transport==="local"){let o=bs(e.command);if(o.error)return{definition:t,error:o.error};if(o.tokens.length===0)return{definition:t,error:"Enter the command that starts the server."};t.command=o.tokens;let r=e.cwd.trim();r&&(t.cwd=r);let s=Wr(e.environment,"=","KEY=VALUE");if(s.error)return{definition:t,error:`Environment: ${s.error}`};Object.keys(s.values).length>0&&(t.environment=s.values)}else{let o=e.url.trim();if(!/^https?:\/\/\S+$/i.test(o))return{definition:t,error:"Enter the URL, starting with http:// or https://."};t.url=o;let r=Wr(e.headers,":","Name: value");if(r.error)return{definition:t,error:`Headers: ${r.error}`};Object.keys(r.values).length>0&&(t.headers=r.values)}return{definition:t,error:null}},Ao=e=>{Qe.querySelector(`[data-field="${e}"]`)?.focus()},Ts=e=>{M=e,q=null,xe=null,m(),Qe.scrollIntoView({block:"nearest"}),Ao("id"),Qe.querySelector('[data-field="id"]')?.select()},Jr=async e=>{if(!(d||Le())){d=`detail:${e.id}`,O=null,m();try{let t=jn(await fe("GET",`/servers/detail?id=${encodeURIComponent(e.id)}`));d=null,Ts(vs(t.id||e.id,t.definition));return}catch(t){O={text:ge(t),tone:"error"}}d=null,m()}},Yr=()=>{if(d)return;M=null,q=null,m(),ct.querySelector("button")?.focus()},qr=async()=>{let e=M;if(!e||d)return;let t=e.name.trim();if(!$n.test(t)){q="Server ID: use letters, numbers, dots, dashes and underscores, starting with a letter or number.",m(),Ao("id");return}let o=!!e.id&&e.id!==t;if((!e.id||o)&&v?.servers.some(s=>s.id===t)){q=`A server named "${t}" already exists in the config.`,m(),Ao("id");return}let r=_s(e);if(r.error){q=r.error,m();return}d="save-server",q=null,m();try{let s=await fe("POST","/servers/save",{id:t,...e.id?{previousId:e.id}:{},definition:r.definition,enabled:e.enabled}),c=ie(s),l=typeof c?.backupPath=="string"?c.backupPath:null;v=Ce(s),M=null,O={text:e.id?`Saved ${t}${l?`; previous config copied to ${l}`:""}.`:`Added ${t}.`,tone:"success"},ve.toast({kind:"success",message:e.id?`Saved ${t}`:`Added ${t}`}).catch(()=>{})}catch(s){q=ge(s)}finally{d=null,m()}},ys=()=>{if(Qe.replaceChildren(),!M)return;let e=M,t=a("section","mc-group-editor");t.setAttribute("aria-label",e.id?"Edit server":"Add server");let o=a("div","mc-section-head");o.append(a("h2","mc-section-title",e.id?"Edit server":"Add server"),$("Close",Yr,!1,!!d)),t.append(o);let r=a("input","mc-input");r.type="text",r.value=e.name,r.placeholder="my-server",r.autocomplete="off",r.spellcheck=!1,r.dataset.field="id",r.disabled=!!d,r.addEventListener("input",()=>{M&&(M.name=r.value,q=null)}),r.addEventListener("keydown",u=>{u.key==="Enter"&&(u.preventDefault(),qr())});let s=a("div","mc-segment");for(let u of["local","remote"]){let b=a("button","mc-inline-button",u);b.type="button",b.dataset.field=`type-${u}`,b.setAttribute("aria-pressed",e.transport===u?"true":"false"),b.disabled=!!d,b.addEventListener("click",()=>{!M||M.transport===u||(M.transport=u,q=null,m())}),s.append(b)}if(t.append(Pe("ID",r,"The key inside mcp.servers of opencode.json."),Pe("Type",s)),e.transport==="local"){let u=a("input","mc-input");u.type="text",u.value=e.command,u.placeholder="npx -y @modelcontextprotocol/server-everything",u.autocomplete="off",u.spellcheck=!1,u.dataset.field="command",u.disabled=!!d,u.addEventListener("input",()=>{M&&(M.command=u.value,q=null)});let b=a("input","mc-input");b.type="text",b.value=e.cwd,b.placeholder="Defaults to where OpenCode runs",b.autocomplete="off",b.spellcheck=!1,b.dataset.field="cwd",b.disabled=!!d,b.addEventListener("input",()=>{M&&(M.cwd=b.value,q=null)});let k=a("textarea","mc-input mc-textarea");k.value=e.environment,k.placeholder=`LOG_LEVEL=info
API_TOKEN=`,k.spellcheck=!1,k.dataset.field="environment",k.disabled=!!d,k.addEventListener("input",()=>{M&&(M.environment=k.value,q=null)}),t.append(Pe("Command",u,"Split on spaces; wrap an argument that contains spaces in double quotes."),Pe("Working directory",b,"Optional."),Pe("Environment",k,e.maskedEnvironment.length>0?`${Dr} ${Hr}`:Hr))}else{let u=a("input","mc-input");u.type="url",u.value=e.url,u.placeholder="https://example.com/mcp",u.autocomplete="off",u.spellcheck=!1,u.dataset.field="url",u.disabled=!!d,u.addEventListener("input",()=>{M&&(M.url=u.value,q=null)});let b=a("textarea","mc-input mc-textarea");b.value=e.headers,b.placeholder="Authorization: Bearer \u2026",b.spellcheck=!1,b.dataset.field="headers",b.disabled=!!d,b.addEventListener("input",()=>{M&&(M.headers=b.value,q=null)}),t.append(Pe("URL",u,"The MCP endpoint, starting with http:// or https://."),Pe("Headers",b,e.maskedHeaders.length>0?`${Dr} ${Fr}`:Fr))}let c=a("label","mc-check"),l=a("input");l.type="checkbox",l.checked=e.enabled,l.dataset.field="enabled",l.disabled=!!d,l.addEventListener("change",()=>{M&&(M.enabled=l.checked)});let p=a("span","mc-check-copy");if(p.append(a("span","mc-check-name","Enabled")),c.append(l,p),t.append(c),q){let u=a("p","mc-editor-error",q);u.setAttribute("role","alert"),t.append(u)}let x=a("div","mc-editor-actions");x.append($("Cancel",Yr,!1,!!d),$(e.id?"Save changes":"Add server",()=>void qr(),!0,!!d)),t.append(x),t.append(a("p","mc-editor-hint","Only this server definition is written. Secrets already in opencode.json are kept when the field is left blank; a new value replaces them.")),Qe.append(t)},ks=e=>{switch(e.message){case"mcp http authentication rejected":return"OpenCode reached the endpoint but it rejected the credentials.";case"mcp oauth authorization failed":return"OpenCode could not complete the OAuth flow.";default:return"OpenCode could not start this server."}},As=e=>{let t=Date.parse(e);return Number.isNaN(t)?e:new Date(t).toLocaleString()},ws=e=>{let t=a("details","mc-failure"),o=a("summary","mc-failure-summary","Why did it fail?"),r=a("div","mc-failure-body");r.append(a("p","mc-failure-lead",ks(e))),e.detail&&r.append(a("pre","mc-failure-detail",e.detail));let s=a("p","mc-failure-meta");return s.textContent=[e.at?`Last attempt ${As(e.at)}`:null,e.directory?`from ${e.directory}`:null].filter(Boolean).join(" \xB7 "),s.textContent&&r.append(s),t.append(o,r),t},Os=e=>{let t=a("div","mc-server-action"),o=a("span","mc-action-note"),r=Le();if(e.state==="conflict"){o.textContent=`Defined in ${e.targets.length||2} places`;let l=a("button","mc-inline-button","Resolve");l.type="button",l.disabled=!!d||r,l.addEventListener("click",()=>{at.scrollIntoView({block:"nearest"}),at.querySelector("button")?.focus()}),t.append(o,l)}else if(e.state==="invalid"){o.textContent="Definition is invalid";let l=a("button","mc-inline-button","Edit definition");l.type="button",l.disabled=!!d||r,l.addEventListener("click",()=>void Jr(e)),t.append(o,l)}else{let l=e.state==="enabled",p=a("button","mc-switch");p.type="button",p.setAttribute("role","switch"),p.setAttribute("aria-checked",l?"true":"false"),p.setAttribute("aria-label",`${l?"Disable":"Enable"} ${e.id}`),p.dataset.serverId=e.id,p.disabled=!!d||r,p.append(a("span","mc-thumb")),p.addEventListener("click",()=>{p.disabled||Is(e,!l)}),l?o.textContent=r?"Config cannot be read":e.failure?"Failed to load":e.advertised?"Visible to model":"No tools enabled":o.textContent=r?"Config cannot be read":"Disabled",t.append(o,p)}let s=a("div","mc-mini-actions");if(e.state!=="invalid"&&e.state!=="conflict"){let l=a("button","mc-inline-button","Edit");l.type="button",l.disabled=!!d||r,l.addEventListener("click",()=>void Jr(e)),s.append(l)}let c=a("button","mc-inline-button","Delete");return c.type="button",c.disabled=!!d||r,c.addEventListener("click",()=>Us(e.id)),s.append(c),t.append(s),t},Rs=e=>{let t=a("article","mc-server");t.dataset.state=e.state,t.setAttribute("role","listitem");let o=a("div","mc-server-main"),r=a("div","mc-server-head");r.append(a("strong","mc-name mc-mono",e.id),xo(es(e),Zn(e)),xo(e.transport==="unknown"?"unknown":e.transport,"neutral")),e.enabled&&e.failure&&r.append(xo("failed","error"));let s=a("div","mc-meta");e.container==="legacy"&&s.append(a("span","mc-stat","deprecated entry")),e.environmentKeys.length>0&&s.append(a("span","mc-stat",`env ${e.environmentKeys.length}`)),e.headerKeys.length>0&&s.append(a("span","mc-stat",`headers ${e.headerKeys.length}`)),e.timeout!==null&&s.append(a("span","mc-stat",`timeout ${e.timeout}`)),e.codemode&&s.append(a("span","mc-stat","codemode")),e.protocol!==null&&s.append(a("span","mc-stat",`protocol ${e.protocol}`));let c=e.transport==="remote"?e.url??"No URL":e.command.length>0?e.command.join(" "):e.state==="invalid"?"Definition is invalid":"No command",l=a("p","mc-desc mc-cmd",c);return o.append(r),s.childElementCount>0&&o.append(s),o.append(l),e.warnings.length>0&&o.append(a("p","mc-warn",e.warnings.slice(0,2).join(" \xB7 "))),e.enabled&&e.failure&&o.append(ws(e.failure)),t.append(o,Os(e)),t},ln=()=>{if(it.replaceChildren(),!v)return;let e=K?W.find(r=>r.id===K):null,o=(e?e.serverIds.map(r=>v?.servers.find(s=>s.id===r)).filter(r=>!!r):v.servers).filter(r=>yo?[r.id,...r.command,r.url??"",...r.environmentKeys,...r.headerKeys,...r.warnings].join(" ").toLowerCase().includes(yo):!0);if(o.length===0){let r=a("div","mc-empty");r.append(a("h2","",v.servers.length===0?"No MCP servers configured":e?"This group has no available servers":"No matching servers"),a("p","",v.servers.length===0?"Nothing under mcp.servers in ~/.config/opencode/opencode.json yet.":e?"Check whether the servers in this group were removed.":"Try a different search term.")),it.append(r);return}for(let r of o)it.append(Rs(r))},m=()=>{kt.setAttribute("aria-busy",ue?"true":"false"),on.textContent=v?`- ${v.summary.enabled} / ${v.summary.total} enabled`:"",ss(),as(),ms(),us(),ys(),fs(),ns(),ln(),Jn.update({label:ue?"Reading\u2026":"Rescan",loading:ue,disabled:ue||!!d});let e=Le();Yn.update({disabled:ue||!!d||!v||e}),qn.update({disabled:ue||!!d||!v||e})},Cs=e=>{Array.from(document.querySelectorAll("[data-server-id]")).find(o=>o.dataset.serverId===e)?.focus()},tt=async(e=!1,t=!1)=>{if(!ue){ue=!0,t||($e=null),e&&m();try{v=Ce(await fe("GET","/servers")),$e=null}catch(o){t||($e=ge(o))}finally{ue=!1,m()}}},Io=async(e=!1)=>{if(!(De&&!e||R)){De=!0,m();try{W=Oo(await fe("GET","/groups")),Se=null,K&&!W.some(t=>t.id===K)&&(K=null)}catch(t){Se=Kn(t)}finally{De=!1,m()}}},dn=async(e=!1)=>{if(!ue){ue=!0,e&&m();try{v=Ce(await fe("GET","/servers")),$e=null}catch(t){$e=ge(t)}ue=!1,m()}},Is=async(e,t)=>{if(!d){d=`toggle:${e.id}`,me=null,oe=null,xe=null,O=null,m();try{v=Ce(await fe("POST","/servers/toggle",{id:e.id,enabled:t})),O={text:t?`Enabled ${e.id}.`:`Disabled ${e.id}; OpenCode will drop its tools after the next config reload.`,tone:"success"},ve.toast({kind:"success",message:t?`Enabled ${e.id}`:`Disabled ${e.id}`}).catch(()=>{})}catch(o){O={text:ge(o),tone:"error"},d=null,m(),tt(!1,!0);return}d=null,m(),Cs(e.id)}},Us=e=>{d||(xe=e,me=null,oe=null,O=null,m(),te.scrollIntoView({block:"nearest"}),te.querySelector("button")?.focus())},Ms=async e=>{if(!d){xe=null,d=`remove:${e}`,O=null,m();try{let t=await fe("POST","/servers/remove",{id:e}),o=ie(t),r=pe(o?.removedPaths);v=Ce(t),M?.id===e&&(M=null,q=null),O={text:`Removed ${e}${r.length>1?` from ${r.length} config files`:" from opencode.json"}.`,tone:"success"},ve.toast({kind:"success",message:`Removed ${e}`}).catch(()=>{})}catch(t){O={text:ge(t),tone:"error"},d=null,m(),tt(!1,!0);return}d=null,m()}},Ls=async(e,t)=>{if(!d&&!(!e.serverId||!t)){d=`resolve:${e.serverId}`,O=null,m();try{let o=await fe("POST","/servers/resolve",{id:e.serverId,keep:t}),r=ie(o),s=typeof r?.backupPath=="string"?r.backupPath:null;v=Ce(o),O={text:`Kept the definition in ${t.split("#")[0]??t}${s?`; previous content copied to ${s}`:""}.`,tone:"success"},ve.toast({kind:"success",message:"Config conflict resolved"}).catch(()=>{})}catch(o){O={text:ge(o),tone:"error"},d=null,m(),tt(!1,!0);return}d=null,m()}},pn=e=>{!v||d||(me=e,oe=null,xe=null,O=null,m(),te.scrollIntoView({block:"nearest"}),te.querySelector("button")?.focus())},Gs=async()=>{if(me===null||d)return;let e=me;me=null,oe=null,d="bulk",O=null,m();try{let t=await fe("POST","/servers/bulk",{enabled:e}),o=ie(t),r=pe(o?.changed);v=Ce(t),O={text:`${r.length} server${r.length===1?"":"s"} ${e?"enabled":"disabled"}.`,tone:"success"},ve.toast({kind:"success",message:`${r.length} servers ${e?"enabled":"disabled"}`}).catch(()=>{})}catch(t){O={text:ge(t),tone:"error"},d=null,m(),tt(!1,!0);return}d=null,m()};ve.onReady(e=>{if(no(e,document.documentElement),document.documentElement.lang="en",Br){m();return}Br=!0,dn(!0),Io(!0)});m();})();
