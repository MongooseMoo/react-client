var Zu=Object.defineProperty;var Ku=(i,t,e)=>t in i?Zu(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var fi=(i,t,e)=>Ku(i,typeof t!="symbol"?t+"":t,e);import{aT as Ns,aU as Fn,aV as kr,aW as Ju,aX as $u,aY as Qu,aZ as Gl,a_ as ju,a$ as tf,b0 as Us,b1 as Hs,b2 as Ph,b3 as Qo,b4 as Lh,b5 as ef,b6 as Dh,b7 as nf,b8 as sf,b9 as rf,ba as of,bb as af,A as Tn,d as lf,aL as Vl,_ as cf,bc as hf,bd as uf,h as er,be as ff,bf as ho,bg as Wl,bh as Xl,u as Yl}from"./index-ChztmO8u.js";/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const il="187",os={ROTATE:0,DOLLY:1,PAN:2},rs={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},df=0,ql=1,pf=2,Os=1,mf=2,Cs=3,Ni=0,cn=1,Pn=2,as=0,Fs=1,Zl=2,Kl=3,Jl=4,gf=5,ss=100,_f=101,xf=102,vf=103,Mf=104,Sf=200,yf=201,Ef=202,bf=203,Ih=204,Nh=205,wf=206,Tf=207,Af=208,Rf=209,Cf=210,Pf=211,Lf=212,Df=213,If=214,jo=0,ta=1,ea=2,ks=3,na=4,ia=5,sa=6,ra=7,sl=0,Nf=1,Uf=2,ri=0,Uh=1,Oh=2,Fh=3,Bh=4,zh=5,Hh=6,rl=7,kh=300,ds=301,Gs=302,uo=303,fo=304,oa=1e3,ni=1001,aa=1002,en=1003,Of=1004,nr=1005,pn=1006,po=1007,vi=1008,Mn=1009,Gh=1010,Vh=1011,Vs=1012,ol=1013,Xn=1014,Dn=1015,Yn=1016,al=1017,ll=1018,ps=1020,Wh=35902,Xh=35899,Yh=1021,qh=1022,Hn=1023,yi=1026,Mi=1027,cl=1028,hl=1029,Ui=1030,ul=1031,fl=1033,Dr=33776,Ir=33777,Nr=33778,Ur=33779,la=35840,ca=35841,ha=35842,ua=35843,fa=36196,da=37492,pa=37496,ma=37488,ga=37489,Gr=37490,_a=37491,xa=37808,va=37809,Ma=37810,Sa=37811,ya=37812,Ea=37813,ba=37814,wa=37815,Ta=37816,Aa=37817,Ra=37818,Ca=37819,Pa=37820,La=37821,Da=36492,Ia=36494,Na=36495,Ua=36283,Oa=36284,Vr=36285,Fa=36286,Ff=3200,Wr=0,Bf=1,xi="",xn="srgb",Xr="srgb-linear",Yr="linear",Te="srgb",mo=7680,zf=519,Hf=512,kf=513,Gf=514,Zh=515,Vf=516,Wf=517,Kh=518,Jh=519,Xf=35044,$l="300 es",In=2e3,Ws=2001;function Yf(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function qr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function qf(){const i=qr("canvas");return i.style.display="block",i}const Ql={};function jl(...i){const t="THREE."+i.shift();console.log(t,...i)}function $h(i){const t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){const e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function $t(...i){i=$h(i);const t="THREE."+i.shift();{const e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Ee(...i){i=$h(i);const t="THREE."+i.shift();{const e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function ls(...i){const t=i.join(" ");t in Ql||(Ql[t]=!0,$t(...i))}function Zf(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}const Kf={[jo]:jo,[ea]:sa,[na]:na,[ks]:ia,[ta]:ta,[sa]:ea,[ra]:ra,[ia]:ks};class bi{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){const n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){const n=this._listeners;if(n===void 0)return;const s=n[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){const e=this._listeners;if(e===void 0)return;const n=e[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const rn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Or=Math.PI/180,Ba=180/Math.PI;function vs(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(rn[i&255]+rn[i>>8&255]+rn[i>>16&255]+rn[i>>24&255]+"-"+rn[t&255]+rn[t>>8&255]+"-"+rn[t>>16&15|64]+rn[t>>24&255]+"-"+rn[e&63|128]+rn[e>>8&255]+"-"+rn[e>>16&255]+rn[e>>24&255]+rn[n&255]+rn[n>>8&255]+rn[n>>16&255]+rn[n>>24&255]).toLowerCase()}function pe(i,t,e){return Math.max(t,Math.min(e,i))}function Jf(i,t){return(i%t+t)%t}function go(i,t,e){return(1-e)*i+e*t}function $f(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function dl(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Qf(i,t){if(t.constructor===Float32Array)return i;const e=dl(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/e,-1)}function jf(i,t){if(t.constructor===Float32Array)return i;const e=dl(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*e)}const td={DEG2RAD:Or},Fl=class Fl{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(pe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(pe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Fl.prototype.isVector2=!0;let _t=Fl;class ze{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],h=n[s+1],d=n[s+2],f=n[s+3],c=r[o+0],u=r[o+1],p=r[o+2],_=r[o+3];if(f!==_||l!==c||h!==u||d!==p){let m=l*c+h*u+d*p+f*_;m<0&&(c=-c,u=-u,p=-p,_=-_,m=-m);let g=1-a;if(m<.9995){const x=Math.acos(m),y=Math.sin(x);g=Math.sin(g*x)/y,a=Math.sin(a*x)/y,l=l*g+c*a,h=h*g+u*a,d=d*g+p*a,f=f*g+_*a}else{l=l*g+c*a,h=h*g+u*a,d=d*g+p*a,f=f*g+_*a;const x=1/Math.sqrt(l*l+h*h+d*d+f*f);l*=x,h*=x,d*=x,f*=x}}t[e]=l,t[e+1]=h,t[e+2]=d,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,s,r,o){const a=n[s],l=n[s+1],h=n[s+2],d=n[s+3],f=r[o],c=r[o+1],u=r[o+2],p=r[o+3];return t[e]=a*p+d*f+l*u-h*c,t[e+1]=l*p+d*c+h*f-a*u,t[e+2]=h*p+d*u+a*c-l*f,t[e+3]=d*p-a*f-l*c-h*u,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,h=a(n/2),d=a(s/2),f=a(r/2),c=l(n/2),u=l(s/2),p=l(r/2);switch(o){case"XYZ":this._x=c*d*f+h*u*p,this._y=h*u*f-c*d*p,this._z=h*d*p+c*u*f,this._w=h*d*f-c*u*p;break;case"YXZ":this._x=c*d*f+h*u*p,this._y=h*u*f-c*d*p,this._z=h*d*p-c*u*f,this._w=h*d*f+c*u*p;break;case"ZXY":this._x=c*d*f-h*u*p,this._y=h*u*f+c*d*p,this._z=h*d*p+c*u*f,this._w=h*d*f-c*u*p;break;case"ZYX":this._x=c*d*f-h*u*p,this._y=h*u*f+c*d*p,this._z=h*d*p-c*u*f,this._w=h*d*f+c*u*p;break;case"YZX":this._x=c*d*f+h*u*p,this._y=h*u*f+c*d*p,this._z=h*d*p-c*u*f,this._w=h*d*f-c*u*p;break;case"XZY":this._x=c*d*f-h*u*p,this._y=h*u*f-c*d*p,this._z=h*d*p+c*u*f,this._w=h*d*f+c*u*p;break;default:$t("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],h=e[2],d=e[6],f=e[10],c=n+a+f;if(c>0){const u=.5/Math.sqrt(c+1);this._w=.25/u,this._x=(d-l)*u,this._y=(r-h)*u,this._z=(o-s)*u}else if(n>a&&n>f){const u=2*Math.sqrt(1+n-a-f);this._w=(d-l)/u,this._x=.25*u,this._y=(s+o)/u,this._z=(r+h)/u}else if(a>f){const u=2*Math.sqrt(1+a-n-f);this._w=(r-h)/u,this._x=(s+o)/u,this._y=.25*u,this._z=(l+d)/u}else{const u=2*Math.sqrt(1+f-n-a);this._w=(o-s)/u,this._x=(r+h)/u,this._y=(l+d)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(pe(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,h=e._z,d=e._w;return this._x=n*d+o*a+s*h-r*l,this._y=s*d+o*l+r*a-n*h,this._z=r*d+o*h+n*l-s*a,this._w=o*d-n*a-s*l-r*h,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){const h=Math.acos(a),d=Math.sin(h);l=Math.sin(l*h)/d,e=Math.sin(e*h)/d,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Bl=class Bl{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(tc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(tc.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,h=2*(o*s-a*n),d=2*(a*e-r*s),f=2*(r*n-o*e);return this.x=e+l*h+o*f-a*d,this.y=n+l*d+a*h-r*f,this.z=s+l*f+r*d-o*h,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this.z=pe(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this.z=pe(this.z,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(pe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return _o.copy(this).projectOnVector(t),this.sub(_o)}reflect(t){return this.sub(_o.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(pe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Bl.prototype.isVector3=!0;let T=Bl;const _o=new T,tc=new ze,zl=class zl{constructor(t,e,n,s,r,o,a,l,h){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,h)}set(t,e,n,s,r,o,a,l,h){const d=this.elements;return d[0]=t,d[1]=s,d[2]=a,d[3]=e,d[4]=r,d[5]=l,d[6]=n,d[7]=o,d[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],h=n[1],d=n[4],f=n[7],c=n[2],u=n[5],p=n[8],_=s[0],m=s[3],g=s[6],x=s[1],y=s[4],M=s[7],A=s[2],b=s[5],v=s[8];return r[0]=o*_+a*x+l*A,r[3]=o*m+a*y+l*b,r[6]=o*g+a*M+l*v,r[1]=h*_+d*x+f*A,r[4]=h*m+d*y+f*b,r[7]=h*g+d*M+f*v,r[2]=c*_+u*x+p*A,r[5]=c*m+u*y+p*b,r[8]=c*g+u*M+p*v,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],h=t[7],d=t[8];return e*o*d-e*a*h-n*r*d+n*a*l+s*r*h-s*o*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],h=t[7],d=t[8],f=d*o-a*h,c=a*l-d*r,u=h*r-o*l,p=e*f+n*c+s*u;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/p;return t[0]=f*_,t[1]=(s*h-d*n)*_,t[2]=(a*n-s*o)*_,t[3]=c*_,t[4]=(d*e-s*l)*_,t[5]=(s*r-a*e)*_,t[6]=u*_,t[7]=(n*l-h*e)*_,t[8]=(o*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){const l=Math.cos(r),h=Math.sin(r);return this.set(n*l,n*h,-n*(l*o+h*a)+o+t,-s*h,s*l,-s*(-h*o+l*a)+a+e,0,0,1),this}scale(t,e){return ls("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(xo.makeScale(t,e)),this}rotate(t){return ls("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(xo.makeRotation(-t)),this}translate(t,e){return ls("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(xo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};zl.prototype.isMatrix3=!0;let se=zl;const xo=new se,ec=new se().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),nc=new se().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ed(){const i={enabled:!0,workingColorSpace:Xr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Te&&(s.r=oi(s.r),s.g=oi(s.g),s.b=oi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Te&&(s.r=cs(s.r),s.g=cs(s.g),s.b=cs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===xi?Yr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Xr]:{primaries:t,whitePoint:n,transfer:Yr,toXYZ:ec,fromXYZ:nc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:xn},outputColorSpaceConfig:{drawingBufferColorSpace:xn}},[xn]:{primaries:t,whitePoint:n,transfer:Te,toXYZ:ec,fromXYZ:nc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:xn}}}),i}const Me=ed();function oi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function cs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let ki;class nd{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{ki===void 0&&(ki=qr("canvas")),ki.width=t.width,ki.height=t.height;const s=ki.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=ki}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=qr("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=oi(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(oi(e[n]/255)*255):e[n]=oi(e[n]);return{data:e,width:t.width,height:t.height}}else return $t("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let id=0;class pl{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:id++}),this.uuid=vs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width||0,e.height||0,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(vo(s[o].image)):r.push(vo(s[o]))}else r=vo(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function vo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?nd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:($t("Texture: Unable to serialize Texture."),{})}let sd=0;const Mo=new T;class hn extends bi{constructor(t=hn.DEFAULT_IMAGE,e=hn.DEFAULT_MAPPING,n=ni,s=ni,r=pn,o=vi,a=Hn,l=Mn,h=hn.DEFAULT_ANISOTROPY,d=xi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:sd++}),this.uuid=vs(),this.name="",this.source=new pl(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=h,this.format=a,this.internalFormat=null,this.type=l,this.offset=new _t(0,0),this.repeat=new _t(1,1),this.center=new _t(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new se,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Mo).x}get height(){return this.source.getSize(Mo).y}get depth(){return this.source.getSize(Mo).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const e in t){const n=t[e];if(n===void 0){$t(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){$t(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==kh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case oa:t.x=t.x-Math.floor(t.x);break;case ni:t.x=t.x<0?0:1;break;case aa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case oa:t.y=t.y-Math.floor(t.y);break;case ni:t.y=t.y<0?0:1;break;case aa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}hn.DEFAULT_IMAGE=null;hn.DEFAULT_MAPPING=kh;hn.DEFAULT_ANISOTROPY=1;const Hl=class Hl{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,h=l[0],d=l[4],f=l[8],c=l[1],u=l[5],p=l[9],_=l[2],m=l[6],g=l[10];if(Math.abs(d-c)<.01&&Math.abs(f-_)<.01&&Math.abs(p-m)<.01){if(Math.abs(d+c)<.1&&Math.abs(f+_)<.1&&Math.abs(p+m)<.1&&Math.abs(h+u+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(h+1)/2,M=(u+1)/2,A=(g+1)/2,b=(d+c)/4,v=(f+_)/4,E=(p+m)/4;return y>M&&y>A?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=b/n,r=v/n):M>A?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=b/s,r=E/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=v/r,s=E/r),this.set(n,s,r,e),this}let x=Math.sqrt((m-p)*(m-p)+(f-_)*(f-_)+(c-d)*(c-d));return Math.abs(x)<.001&&(x=1),this.x=(m-p)/x,this.y=(f-_)/x,this.z=(c-d)/x,this.w=Math.acos((h+u+g-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this.z=pe(this.z,t.z,e.z),this.w=pe(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this.z=pe(this.z,t,e),this.w=pe(this.w,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(pe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Hl.prototype.isVector4=!0;let Fe=Hl;class rd extends bi{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:pn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Fe(0,0,t,e),this.scissorTest=!1,this.viewport=new Fe(0,0,t,e),this.textures=[];const s=n.count;for(let r=0;r<s;r++)this.textures[r]=new hn({width:t,height:e,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){const e={minFilter:pn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.mipmapsAutoUpdate!==void 0&&(e.mipmapsAutoUpdate=t.mipmapsAutoUpdate),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;const s=Object.assign({},t.textures[e].image);this.textures[e].source=new pl(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){const e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Wn extends rd{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Qh extends hn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=en,this.minFilter=en,this.wrapR=ni,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class od extends hn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=en,this.minFilter=en,this.wrapR=ni,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}const eo=class eo{constructor(t,e,n,s,r,o,a,l,h,d,f,c,u,p,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,h,d,f,c,u,p,_,m)}set(t,e,n,s,r,o,a,l,h,d,f,c,u,p,_,m){const g=this.elements;return g[0]=t,g[4]=e,g[8]=n,g[12]=s,g[1]=r,g[5]=o,g[9]=a,g[13]=l,g[2]=h,g[6]=d,g[10]=f,g[14]=c,g[3]=u,g[7]=p,g[11]=_,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new eo().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const e=this.elements,n=t.elements,s=1/Gi.setFromMatrixColumn(t,0).length(),r=1/Gi.setFromMatrixColumn(t,1).length(),o=1/Gi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),h=Math.sin(s),d=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){const c=o*d,u=o*f,p=a*d,_=a*f;e[0]=l*d,e[4]=-l*f,e[8]=h,e[1]=u+p*h,e[5]=c-_*h,e[9]=-a*l,e[2]=_-c*h,e[6]=p+u*h,e[10]=o*l}else if(t.order==="YXZ"){const c=l*d,u=l*f,p=h*d,_=h*f;e[0]=c+_*a,e[4]=p*a-u,e[8]=o*h,e[1]=o*f,e[5]=o*d,e[9]=-a,e[2]=u*a-p,e[6]=_+c*a,e[10]=o*l}else if(t.order==="ZXY"){const c=l*d,u=l*f,p=h*d,_=h*f;e[0]=c-_*a,e[4]=-o*f,e[8]=p+u*a,e[1]=u+p*a,e[5]=o*d,e[9]=_-c*a,e[2]=-o*h,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const c=o*d,u=o*f,p=a*d,_=a*f;e[0]=l*d,e[4]=p*h-u,e[8]=c*h+_,e[1]=l*f,e[5]=_*h+c,e[9]=u*h-p,e[2]=-h,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const c=o*l,u=o*h,p=a*l,_=a*h;e[0]=l*d,e[4]=_-c*f,e[8]=p*f+u,e[1]=f,e[5]=o*d,e[9]=-a*d,e[2]=-h*d,e[6]=u*f+p,e[10]=c-_*f}else if(t.order==="XZY"){const c=o*l,u=o*h,p=a*l,_=a*h;e[0]=l*d,e[4]=-f,e[8]=h*d,e[1]=c*f+_,e[5]=o*d,e[9]=u*f-p,e[2]=p*f-u,e[6]=a*d,e[10]=_*f+c}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ad,t,ld)}lookAt(t,e,n){const s=this.elements;return gn.subVectors(t,e),gn.lengthSq()===0&&(gn.z=1),gn.normalize(),di.crossVectors(n,gn),di.lengthSq()===0&&(Math.abs(n.z)===1?gn.x+=1e-4:gn.z+=1e-4,gn.normalize(),di.crossVectors(n,gn)),di.normalize(),ir.crossVectors(gn,di),s[0]=di.x,s[4]=ir.x,s[8]=gn.x,s[1]=di.y,s[5]=ir.y,s[9]=gn.y,s[2]=di.z,s[6]=ir.z,s[10]=gn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],h=n[12],d=n[1],f=n[5],c=n[9],u=n[13],p=n[2],_=n[6],m=n[10],g=n[14],x=n[3],y=n[7],M=n[11],A=n[15],b=s[0],v=s[4],E=s[8],D=s[12],P=s[1],L=s[5],U=s[9],V=s[13],N=s[2],z=s[6],k=s[10],G=s[14],st=s[3],C=s[7],B=s[11],W=s[15];return r[0]=o*b+a*P+l*N+h*st,r[4]=o*v+a*L+l*z+h*C,r[8]=o*E+a*U+l*k+h*B,r[12]=o*D+a*V+l*G+h*W,r[1]=d*b+f*P+c*N+u*st,r[5]=d*v+f*L+c*z+u*C,r[9]=d*E+f*U+c*k+u*B,r[13]=d*D+f*V+c*G+u*W,r[2]=p*b+_*P+m*N+g*st,r[6]=p*v+_*L+m*z+g*C,r[10]=p*E+_*U+m*k+g*B,r[14]=p*D+_*V+m*G+g*W,r[3]=x*b+y*P+M*N+A*st,r[7]=x*v+y*L+M*z+A*C,r[11]=x*E+y*U+M*k+A*B,r[15]=x*D+y*V+M*G+A*W,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],h=t[13],d=t[2],f=t[6],c=t[10],u=t[14],p=t[3],_=t[7],m=t[11],g=t[15],x=l*u-h*c,y=a*u-h*f,M=a*c-l*f,A=o*u-h*d,b=o*c-l*d,v=o*f-a*d;return e*(_*x-m*y+g*M)-n*(p*x-m*A+g*b)+s*(p*y-_*A+g*v)-r*(p*M-_*b+m*v)}determinantAffine(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],o=t[5],a=t[9],l=t[2],h=t[6],d=t[10];return e*(o*d-a*h)-n*(r*d-a*l)+s*(r*h-o*l)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],h=t[7],d=t[8],f=t[9],c=t[10],u=t[11],p=t[12],_=t[13],m=t[14],g=t[15],x=e*a-n*o,y=e*l-s*o,M=e*h-r*o,A=n*l-s*a,b=n*h-r*a,v=s*h-r*l,E=d*_-f*p,D=d*m-c*p,P=d*g-u*p,L=f*m-c*_,U=f*g-u*_,V=c*g-u*m,N=x*V-y*U+M*L+A*P-b*D+v*E;if(N===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const z=1/N;return t[0]=(a*V-l*U+h*L)*z,t[1]=(s*U-n*V-r*L)*z,t[2]=(_*v-m*b+g*A)*z,t[3]=(c*b-f*v-u*A)*z,t[4]=(l*P-o*V-h*D)*z,t[5]=(e*V-s*P+r*D)*z,t[6]=(m*M-p*v-g*y)*z,t[7]=(d*v-c*M+u*y)*z,t[8]=(o*U-a*P+h*E)*z,t[9]=(n*P-e*U-r*E)*z,t[10]=(p*b-_*M+g*x)*z,t[11]=(f*M-d*b-u*x)*z,t[12]=(a*D-o*L-l*E)*z,t[13]=(e*L-n*D+s*E)*z,t[14]=(_*y-p*A-m*x)*z,t[15]=(d*A-f*y+c*x)*z,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,h=r*o,d=r*a;return this.set(h*o+n,h*a-s*l,h*l+s*a,0,h*a+s*l,d*a+n,d*l-s*o,0,h*l-s*a,d*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,h=r+r,d=o+o,f=a+a,c=r*h,u=r*d,p=r*f,_=o*d,m=o*f,g=a*f,x=l*h,y=l*d,M=l*f,A=n.x,b=n.y,v=n.z;return s[0]=(1-(_+g))*A,s[1]=(u+M)*A,s[2]=(p-y)*A,s[3]=0,s[4]=(u-M)*b,s[5]=(1-(c+g))*b,s[6]=(m+x)*b,s[7]=0,s[8]=(p+y)*v,s[9]=(m-x)*v,s[10]=(1-(c+_))*v,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=Gi.set(s[0],s[1],s[2]).length();const a=Gi.set(s[4],s[5],s[6]).length(),l=Gi.set(s[8],s[9],s[10]).length();r<0&&(o=-o),An.copy(this);const h=1/o,d=1/a,f=1/l;return An.elements[0]*=h,An.elements[1]*=h,An.elements[2]*=h,An.elements[4]*=d,An.elements[5]*=d,An.elements[6]*=d,An.elements[8]*=f,An.elements[9]*=f,An.elements[10]*=f,e.setFromRotationMatrix(An),n.x=o,n.y=a,n.z=l,this}makePerspective(t,e,n,s,r,o,a=In,l=!1){const h=this.elements,d=2*r/(e-t),f=2*r/(n-s),c=(e+t)/(e-t),u=(n+s)/(n-s);let p,_;if(l)p=r/(o-r),_=o*r/(o-r);else if(a===In)p=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Ws)p=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return h[0]=d,h[4]=0,h[8]=c,h[12]=0,h[1]=0,h[5]=f,h[9]=u,h[13]=0,h[2]=0,h[6]=0,h[10]=p,h[14]=_,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=In,l=!1){const h=this.elements,d=2/(e-t),f=2/(n-s),c=-(e+t)/(e-t),u=-(n+s)/(n-s);let p,_;if(l)p=1/(o-r),_=o/(o-r);else if(a===In)p=-2/(o-r),_=-(o+r)/(o-r);else if(a===Ws)p=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return h[0]=d,h[4]=0,h[8]=0,h[12]=c,h[1]=0,h[5]=f,h[9]=0,h[13]=u,h[2]=0,h[6]=0,h[10]=p,h[14]=_,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};eo.prototype.isMatrix4=!0;let re=eo;const Gi=new T,An=new re,ad=new T(0,0,0),ld=new T(1,1,1),di=new T,ir=new T,gn=new T,ic=new re,sc=new ze;class ke{constructor(t=0,e=0,n=0,s=ke.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],h=s[5],d=s[9],f=s[2],c=s[6],u=s[10];switch(e){case"XYZ":this._y=Math.asin(pe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-d,u),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(c,h),this._z=0);break;case"YXZ":this._x=Math.asin(-pe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(a,u),this._z=Math.atan2(l,h)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(pe(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(-f,u),this._z=Math.atan2(-o,h)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-pe(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(c,u),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,h));break;case"YZX":this._z=Math.asin(pe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,h),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,u));break;case"XZY":this._z=Math.asin(-pe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(c,h),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-d,u),this._y=0);break;default:$t("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return ic.makeRotationFromQuaternion(t),this.setFromRotationMatrix(ic,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return sc.setFromEuler(this),this.setFromQuaternion(sc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ke.DEFAULT_ORDER="XYZ";class ml{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let cd=0;const rc=new T,Vi=new ze,$n=new re,sr=new T,Ss=new T,hd=new T,ud=new ze,oc=new T(1,0,0),ac=new T(0,1,0),lc=new T(0,0,1),cc={type:"added"},fd={type:"removed"},Wi={type:"childadded",child:null},So={type:"childremoved",child:null};class Ge extends bi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:cd++}),this.uuid=vs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ge.DEFAULT_UP.clone();const t=new T,e=new ke,n=new ze,s=new T(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new re},normalMatrix:{value:new se}}),this.matrix=new re,this.matrixWorld=new re,this.matrixAutoUpdate=Ge.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ml,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Vi.setFromAxisAngle(t,e),this.quaternion.multiply(Vi),this}rotateOnWorldAxis(t,e){return Vi.setFromAxisAngle(t,e),this.quaternion.premultiply(Vi),this}rotateX(t){return this.rotateOnAxis(oc,t)}rotateY(t){return this.rotateOnAxis(ac,t)}rotateZ(t){return this.rotateOnAxis(lc,t)}translateOnAxis(t,e){return rc.copy(t).applyQuaternion(this.quaternion),this.position.add(rc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(oc,t)}translateY(t){return this.translateOnAxis(ac,t)}translateZ(t){return this.translateOnAxis(lc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4($n.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?sr.copy(t):sr.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Ss.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$n.lookAt(Ss,sr,this.up):$n.lookAt(sr,Ss,this.up),this.quaternion.setFromRotationMatrix($n),s&&($n.extractRotation(s.matrixWorld),Vi.setFromRotationMatrix($n),this.quaternion.premultiply(Vi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Ee("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(cc),Wi.child=t,this.dispatchEvent(Wi),Wi.child=null):Ee("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(fd),So.child=t,this.dispatchEvent(So),So.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),$n.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),$n.multiply(t.parent.matrixWorld)),t.applyMatrix4($n),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(cc),Wi.child=t,this.dispatchEvent(Wi),Wi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ss,t,hd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ss,ud,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){const s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let h=0,d=l.length;h<d;h++){const f=l[h];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,h=this.material.length;l<h;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),h=o(t.textures),d=o(t.images),f=o(t.shapes),c=o(t.skeletons),u=o(t.animations),p=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),h.length>0&&(n.textures=h),d.length>0&&(n.images=d),f.length>0&&(n.shapes=f),c.length>0&&(n.skeletons=c),u.length>0&&(n.animations=u),p.length>0&&(n.nodes=p)}return n.object=s,n;function o(a){const l=[];for(const h in a){const d=a[h];delete d.metadata,l.push(d)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Ge.DEFAULT_UP=new T(0,1,0);Ge.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class kn extends Ge{constructor(){super(),this.isGroup=!0,this.type="Group"}}const dd={type:"move"};class yo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new kn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new kn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new T,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new T),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new kn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new T,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new T,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,h=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(h&&t.hand){o=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,n),g=this._getHandJoint(h,_);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}const d=h.joints["index-finger-tip"],f=h.joints["thumb-tip"],c=d.position.distanceTo(f.position),u=.02,p=.005;h.inputState.pinching&&c>u+p?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!h.inputState.pinching&&c<=u-p&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(dd)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),h!==null&&(h.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new kn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const jh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},pi={h:0,s:0,l:0},rr={h:0,s:0,l:0};function Eo(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class jt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=xn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Me.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=Me.workingColorSpace){return this.r=t,this.g=e,this.b=n,Me.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=Me.workingColorSpace){if(t=Jf(t,1),e=pe(e,0,1),n=pe(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Eo(o,r,t+1/3),this.g=Eo(o,r,t),this.b=Eo(o,r,t-1/3)}return Me.colorSpaceToWorking(this,s),this}setStyle(t,e=xn){function n(r){r!==void 0&&parseFloat(r)<1&&$t("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:$t("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);$t("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=xn){const n=jh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):$t("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=oi(t.r),this.g=oi(t.g),this.b=oi(t.b),this}copyLinearToSRGB(t){return this.r=cs(t.r),this.g=cs(t.g),this.b=cs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=xn){return Me.workingToColorSpace(on.copy(this),t),Math.round(pe(on.r*255,0,255))*65536+Math.round(pe(on.g*255,0,255))*256+Math.round(pe(on.b*255,0,255))}getHexString(t=xn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Me.workingColorSpace){Me.workingToColorSpace(on.copy(this),e);const n=on.r,s=on.g,r=on.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,h;const d=(a+o)/2;if(a===o)l=0,h=0;else{const f=o-a;switch(h=d<=.5?f/(o+a):f/(2-o-a),o){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return t.h=l,t.s=h,t.l=d,t}getRGB(t,e=Me.workingColorSpace){return Me.workingToColorSpace(on.copy(this),e),t.r=on.r,t.g=on.g,t.b=on.b,t}getStyle(t=xn){Me.workingToColorSpace(on.copy(this),t);const e=on.r,n=on.g,s=on.b;return t!==xn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(pi),this.setHSL(pi.h+t,pi.s+e,pi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(pi),t.getHSL(rr);const n=go(pi.h,rr.h,e),s=go(pi.s,rr.s,e),r=go(pi.l,rr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const on=new jt;jt.NAMES=jh;class tu extends Ge{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ke,this.environmentIntensity=1,this.environmentRotation=new ke,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}}const Rn=new T,Qn=new T,bo=new T,jn=new T,Xi=new T,Yi=new T,hc=new T,wo=new T,To=new T,Ao=new T,Ro=new Fe,Co=new Fe,Po=new Fe;class yn{constructor(t=new T,e=new T,n=new T){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Rn.subVectors(t,e),s.cross(Rn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Rn.subVectors(s,e),Qn.subVectors(n,e),bo.subVectors(t,e);const o=Rn.dot(Rn),a=Rn.dot(Qn),l=Rn.dot(bo),h=Qn.dot(Qn),d=Qn.dot(bo),f=o*h-a*a;if(f===0)return r.set(0,0,0),null;const c=1/f,u=(h*l-a*d)*c,p=(o*d-a*l)*c;return r.set(1-u-p,p,u)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,jn)===null?!1:jn.x>=0&&jn.y>=0&&jn.x+jn.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,jn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,jn.x),l.addScaledVector(o,jn.y),l.addScaledVector(a,jn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return Ro.setScalar(0),Co.setScalar(0),Po.setScalar(0),Ro.fromBufferAttribute(t,e),Co.fromBufferAttribute(t,n),Po.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(Ro,r.x),o.addScaledVector(Co,r.y),o.addScaledVector(Po,r.z),o}static isFrontFacing(t,e,n,s){return Rn.subVectors(n,e),Qn.subVectors(t,e),Rn.cross(Qn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Rn.subVectors(this.c,this.b),Qn.subVectors(this.a,this.b),Rn.cross(Qn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return yn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return yn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return yn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return yn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return yn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let o,a;Xi.subVectors(s,n),Yi.subVectors(r,n),wo.subVectors(t,n);const l=Xi.dot(wo),h=Yi.dot(wo);if(l<=0&&h<=0)return e.copy(n);To.subVectors(t,s);const d=Xi.dot(To),f=Yi.dot(To);if(d>=0&&f<=d)return e.copy(s);const c=l*f-d*h;if(c<=0&&l>=0&&d<=0&&l-d>0)return o=l/(l-d),e.copy(n).addScaledVector(Xi,o);Ao.subVectors(t,r);const u=Xi.dot(Ao),p=Yi.dot(Ao);if(p>=0&&u<=p)return e.copy(r);const _=u*h-l*p;if(_<=0&&h>=0&&p<=0)return a=h/(h-p),e.copy(n).addScaledVector(Yi,a);const m=d*p-u*f;if(m<=0&&f-d>=0&&u-p>=0)return hc.subVectors(r,s),a=(f-d)/(f-d+(u-p)),e.copy(s).addScaledVector(hc,a);const g=1/(m+_+c);return o=_*g,a=c*g,e.copy(n).addScaledVector(Xi,o).addScaledVector(Yi,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class mn{constructor(t=new T(1/0,1/0,1/0),e=new T(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Cn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Cn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Cn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Cn):Cn.fromBufferAttribute(r,o),Cn.applyMatrix4(t.matrixWorld),this.expandByPoint(Cn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),or.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),or.copy(n.boundingBox)),or.applyMatrix4(t.matrixWorld),this.union(or)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Cn),Cn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(ys),ar.subVectors(this.max,ys),qi.subVectors(t.a,ys),Zi.subVectors(t.b,ys),Ki.subVectors(t.c,ys),mi.subVectors(Zi,qi),gi.subVectors(Ki,Zi),Ti.subVectors(qi,Ki);let e=[0,-mi.z,mi.y,0,-gi.z,gi.y,0,-Ti.z,Ti.y,mi.z,0,-mi.x,gi.z,0,-gi.x,Ti.z,0,-Ti.x,-mi.y,mi.x,0,-gi.y,gi.x,0,-Ti.y,Ti.x,0];return!Lo(e,qi,Zi,Ki,ar)||(e=[1,0,0,0,1,0,0,0,1],!Lo(e,qi,Zi,Ki,ar))?!1:(lr.crossVectors(mi,gi),e=[lr.x,lr.y,lr.z],Lo(e,qi,Zi,Ki,ar))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Cn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Cn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(ti[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),ti[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),ti[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),ti[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),ti[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),ti[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),ti[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),ti[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(ti),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const ti=[new T,new T,new T,new T,new T,new T,new T,new T],Cn=new T,or=new mn,qi=new T,Zi=new T,Ki=new T,mi=new T,gi=new T,Ti=new T,ys=new T,ar=new T,lr=new T,Ai=new T;function Lo(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Ai.fromArray(i,r);const a=s.x*Math.abs(Ai.x)+s.y*Math.abs(Ai.y)+s.z*Math.abs(Ai.z),l=t.dot(Ai),h=e.dot(Ai),d=n.dot(Ai);if(Math.max(-Math.max(l,h,d),Math.min(l,h,d))>a)return!1}return!0}const Ve=new T,cr=new _t;let pd=0;class En extends bi{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:pd++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Xf,this.updateRanges=[],this.gpuType=Dn,this.version=0,this._normalizationScale=t!==void 0?dl(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)cr.fromBufferAttribute(this,e),cr.applyMatrix3(t),this.setXY(e,cr.x,cr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.applyMatrix3(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.applyMatrix4(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.applyNormalMatrix(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.transformDirection(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=this._denormalize(n)),n}setComponent(t,e,n){return this.normalized&&(n=this._normalize(n)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=this._denormalize(e)),e}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=this._denormalize(e)),e}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=this._denormalize(e)),e}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=this._denormalize(e)),e}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){const e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Qf(t,this.array)}_normalize(t){const e=this._normalizationScale;return e!==void 0?Math.round(t*e):jf(t,this.array)}}class eu extends En{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class nu extends En{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class ue extends En{constructor(t,e,n){super(new Float32Array(t),e,n)}}const md=new mn,Es=new T,Do=new T;class zi{constructor(t=new T,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):md.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Es.subVectors(t,this.center);const e=Es.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Es,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Do.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Es.copy(t.center).add(Do)),this.expandByPoint(Es.copy(t.center).sub(Do))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}let gd=0;const Sn=new re,Io=new Ge,Ji=new T,_n=new mn,bs=new mn,Qe=new T;class Le extends bi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:gd++}),this.uuid=vs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Yf(t)?nu:eu)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new se().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Sn.makeRotationFromQuaternion(t),this.applyMatrix4(Sn),this}rotateX(t){return Sn.makeRotationX(t),this.applyMatrix4(Sn),this}rotateY(t){return Sn.makeRotationY(t),this.applyMatrix4(Sn),this}rotateZ(t){return Sn.makeRotationZ(t),this.applyMatrix4(Sn),this}translate(t,e,n){return Sn.makeTranslation(t,e,n),this.applyMatrix4(Sn),this}scale(t,e,n){return Sn.makeScale(t,e,n),this.applyMatrix4(Sn),this}lookAt(t){return Io.lookAt(t),Io.updateMatrix(),this.applyMatrix4(Io.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ji).negate(),this.translate(Ji.x,Ji.y,Ji.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ue(n,3))}else{const n=Math.min(t.length,e.count);for(let s=0;s<n;s++){const r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&$t("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new mn);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ee("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new T(-1/0,-1/0,-1/0),new T(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];_n.setFromBufferAttribute(r),this.morphTargetsRelative?(Qe.addVectors(this.boundingBox.min,_n.min),this.boundingBox.expandByPoint(Qe),Qe.addVectors(this.boundingBox.max,_n.max),this.boundingBox.expandByPoint(Qe)):(this.boundingBox.expandByPoint(_n.min),this.boundingBox.expandByPoint(_n.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ee('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new zi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ee("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new T,1/0);return}if(t){const n=this.boundingSphere.center;if(_n.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];bs.setFromBufferAttribute(a),this.morphTargetsRelative?(Qe.addVectors(_n.min,bs.min),_n.expandByPoint(Qe),Qe.addVectors(_n.max,bs.max),_n.expandByPoint(Qe)):(_n.expandByPoint(bs.min),_n.expandByPoint(bs.max))}_n.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)Qe.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Qe));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let h=0,d=a.count;h<d;h++)Qe.fromBufferAttribute(a,h),l&&(Ji.fromBufferAttribute(t,h),Qe.add(Ji)),s=Math.max(s,n.distanceToSquared(Qe))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ee('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Ee("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;let o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new En(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));const a=[],l=[],h=new Uint8Array(n.count);for(let D=0;D<n.count;D++)a[D]=new T,l[D]=new T;const d=new T,f=new T,c=new T,u=new _t,p=new _t,_=new _t,m=new T,g=new T;function x(D,P,L){h[D]=h[P]=h[L]=1,d.fromBufferAttribute(n,D),f.fromBufferAttribute(n,P),c.fromBufferAttribute(n,L),u.fromBufferAttribute(r,D),p.fromBufferAttribute(r,P),_.fromBufferAttribute(r,L),f.sub(d),c.sub(d),p.sub(u),_.sub(u);const U=1/(p.x*_.y-_.x*p.y);isFinite(U)&&(m.copy(f).multiplyScalar(_.y).addScaledVector(c,-p.y).multiplyScalar(U),g.copy(c).multiplyScalar(p.x).addScaledVector(f,-_.x).multiplyScalar(U),a[D].add(m),a[P].add(m),a[L].add(m),l[D].add(g),l[P].add(g),l[L].add(g))}let y=this.groups;y.length===0&&(y=[{start:0,count:t.count}]);for(let D=0,P=y.length;D<P;++D){const L=y[D],U=L.start,V=L.count;for(let N=U,z=U+V;N<z;N+=3)x(t.getX(N+0),t.getX(N+1),t.getX(N+2))}const M=new T,A=new T,b=new T,v=new T;function E(D){b.fromBufferAttribute(s,D),v.copy(b);const P=a[D];M.copy(P),M.sub(b.multiplyScalar(b.dot(P))).normalize(),A.crossVectors(v,P);const U=A.dot(l[D])<0?-1:1;o.setXYZW(D,M.x,M.y,M.z,U)}for(let D=0,P=n.count;D<P;++D)h[D]&&E(D);this._transformed=!0}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new En(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let c=0,u=n.count;c<u;c++)n.setXYZ(c,0,0,0);const s=new T,r=new T,o=new T,a=new T,l=new T,h=new T,d=new T,f=new T;if(t)for(let c=0,u=t.count;c<u;c+=3){const p=t.getX(c+0),_=t.getX(c+1),m=t.getX(c+2);s.fromBufferAttribute(e,p),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),d.subVectors(o,r),f.subVectors(s,r),d.cross(f),a.fromBufferAttribute(n,p),l.fromBufferAttribute(n,_),h.fromBufferAttribute(n,m),a.add(d),l.add(d),h.add(d),n.setXYZ(p,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,h.x,h.y,h.z)}else for(let c=0,u=e.count;c<u;c+=3)s.fromBufferAttribute(e,c+0),r.fromBufferAttribute(e,c+1),o.fromBufferAttribute(e,c+2),d.subVectors(o,r),f.subVectors(s,r),d.cross(f),n.setXYZ(c+0,d.x,d.y,d.z),n.setXYZ(c+1,d.x,d.y,d.z),n.setXYZ(c+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Qe.fromBufferAttribute(t,e),Qe.normalize(),t.setXYZ(e,Qe.x,Qe.y,Qe.z)}toNonIndexed(){function t(a,l){const h=a.array,d=a.itemSize,f=a.normalized,c=new h.constructor(l.length*d);let u=0,p=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?u=l[_]*a.data.stride+a.offset:u=l[_]*d;for(let g=0;g<d;g++)c[p++]=h[u++]}return new En(c,d,f)}if(this.index===null)return $t("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Le,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],h=t(l,n);e.setAttribute(a,h)}const r=this.morphAttributes;for(const a in r){const l=[],h=r[a];for(let d=0,f=h.length;d<f;d++){const c=h[d],u=t(c,n);l.push(u)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const h=o[a];e.addGroup(h.start,h.count,h.materialIndex)}return e}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const h in l)l[h]!==void 0&&(t[h]=l[h]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const h=n[l];t.data.attributes[l]=h.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const h=this.morphAttributes[l],d=[];for(let f=0,c=h.length;f<c;f++){const u=h[f];d.push(u.toJSON(t.data))}d.length>0&&(s[l]=d,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone());const s=t.attributes;for(const h in s){const d=s[h];this.setAttribute(h,d.clone(e))}const r=t.morphAttributes;for(const h in r){const d=[],f=r[h];for(let c=0,u=f.length;c<u;c++)d.push(f[c].clone(e));this.morphAttributes[h]=d}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let h=0,d=o.length;h<d;h++){const f=o[h];this.addGroup(f.start,f.count,f.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const No=new T,_d=new T,xd=new se;class Bn{constructor(t=new T(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=No.subVectors(n,e).cross(_d.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){const s=t.delta(No),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(s,o)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||xd.getNormalMatrix(t),s=this.coplanarPoint(No).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}let vd=0;class Hi extends bi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:vd++}),this.uuid=vs(),this.name="",this.type="Material",this.blending=Fs,this.side=Ni,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ih,this.blendDst=Nh,this.blendEquation=ss,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new jt(0,0,0),this.blendAlpha=0,this.depthFunc=ks,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=zf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=mo,this.stencilZFail=mo,this.stencilZPass=mo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){$t(`Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){$t(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new jt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.diffuseRoughness!==void 0&&(this.diffuseRoughness=t.diffuseRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum),t.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1]),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new Bn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new _t().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new _t().fromArray(t.clearcoatNormalScale)),t.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}const ei=new T,Uo=new T,hr=new T,ur=new T;class Js{constructor(t=new T,e=new T(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ei)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=ei.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ei.copy(this.origin).addScaledVector(this.direction,e),ei.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Uo.copy(t).add(e).multiplyScalar(.5),hr.copy(e).sub(t).normalize(),ur.copy(this.origin).sub(Uo);const r=t.distanceTo(e)*.5,o=-this.direction.dot(hr),a=ur.dot(this.direction),l=-ur.dot(hr),h=ur.lengthSq(),d=Math.abs(1-o*o);let f,c,u,p;if(d>0)if(f=o*l-a,c=o*a-l,p=r*d,f>=0)if(c>=-p)if(c<=p){const _=1/d;f*=_,c*=_,u=f*(f+o*c+2*a)+c*(o*f+c+2*l)+h}else c=r,f=Math.max(0,-(o*c+a)),u=-f*f+c*(c+2*l)+h;else c=-r,f=Math.max(0,-(o*c+a)),u=-f*f+c*(c+2*l)+h;else c<=-p?(f=Math.max(0,-(-o*r+a)),c=f>0?-r:Math.min(Math.max(-r,-l),r),u=-f*f+c*(c+2*l)+h):c<=p?(f=0,c=Math.min(Math.max(-r,-l),r),u=c*(c+2*l)+h):(f=Math.max(0,-(o*r+a)),c=f>0?r:Math.min(Math.max(-r,-l),r),u=-f*f+c*(c+2*l)+h);else c=o>0?-r:r,f=Math.max(0,-(o*c+a)),u=-f*f+c*(c+2*l)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Uo).addScaledVector(hr,c),u}intersectSphere(t,e){if(t.radius<0)return null;ei.subVectors(t.center,this.origin);const n=ei.dot(this.direction),s=ei.dot(ei)-n*n,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l;const h=1/this.direction.x,d=1/this.direction.y,f=1/this.direction.z,c=this.origin;return h>=0?(n=(t.min.x-c.x)*h,s=(t.max.x-c.x)*h):(n=(t.max.x-c.x)*h,s=(t.min.x-c.x)*h),d>=0?(r=(t.min.y-c.y)*d,o=(t.max.y-c.y)*d):(r=(t.max.y-c.y)*d,o=(t.min.y-c.y)*d),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),f>=0?(a=(t.min.z-c.z)*f,l=(t.max.z-c.z)*f):(a=(t.max.z-c.z)*f,l=(t.min.z-c.z)*f),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ei)!==null}intersectTriangle(t,e,n,s,r){const o=this.origin,a=this.direction,l=a.x,h=a.y,d=a.z,f=t.x-o.x,c=t.y-o.y,u=t.z-o.z,p=e.x-o.x,_=e.y-o.y,m=e.z-o.z,g=n.x-o.x,x=n.y-o.y,y=n.z-o.z,M=Math.abs(l),A=Math.abs(h),b=Math.abs(d);let v,E,D,P,L,U,V,N,z,k,G,st;if(M>=A&&M>=b?(D=l,U=f,z=p,st=g,l>=0?(v=h,E=d,P=c,L=u,V=_,N=m,k=x,G=y):(v=d,E=h,P=u,L=c,V=m,N=_,k=y,G=x)):A>=b?(D=h,U=c,z=_,st=x,h>=0?(v=d,E=l,P=u,L=f,V=m,N=p,k=y,G=g):(v=l,E=d,P=f,L=u,V=p,N=m,k=g,G=y)):(D=d,U=u,z=m,st=y,d>=0?(v=l,E=h,P=f,L=c,V=p,N=_,k=g,G=x):(v=h,E=l,P=c,L=f,V=_,N=p,k=x,G=g)),D===0)return null;const C=v/D,B=E/D,W=1/D,ot=P-C*U,yt=L-B*U,J=V-C*z,rt=N-B*z,bt=k-C*st,Nt=G-B*st,ct=bt*rt-Nt*J,Ct=ot*Nt-yt*bt,Vt=J*yt-rt*ot;if(s){if(ct<0||Ct<0||Vt<0)return null}else if((ct<0||Ct<0||Vt<0)&&(ct>0||Ct>0||Vt>0))return null;const Bt=ct+Ct+Vt;if(Bt===0)return null;const Xt=W*(ct*U+Ct*z+Vt*st);return(Bt>0?Xt<0:Xt>0)?null:this.at(Xt/Bt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class no extends Hi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ke,this.combine=sl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const uc=new re,Ri=new Js,fr=new zi,fc=new T,dr=new T,pr=new T,mr=new T,Oo=new T,gr=new T,dc=new T,_r=new T;let Ce=class extends Ge{constructor(t=new Le,e=new no){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){gr.set(0,0,0);for(let l=0,h=r.length;l<h;l++){const d=a[l],f=r[l];d!==0&&(Oo.fromBufferAttribute(f,t),o?gr.addScaledVector(Oo,d):gr.addScaledVector(Oo.sub(e),d))}e.add(gr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),fr.copy(n.boundingSphere),fr.applyMatrix4(r),Ri.copy(t.ray).recast(t.near),!(fr.containsPoint(Ri.origin)===!1&&(Ri.intersectSphere(fr,fc)===null||Ri.origin.distanceToSquared(fc)>(t.far-t.near)**2))&&(uc.copy(r).invert(),Ri.copy(t.ray).applyMatrix4(uc),!(n.boundingBox!==null&&Ri.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Ri)))}_computeIntersections(t,e,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,h=r.attributes.uv,d=r.attributes.uv1,f=r.attributes.normal,c=r.groups,u=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,_=c.length;p<_;p++){const m=c[p],g=o[m.materialIndex],x=Math.max(m.start,u.start),y=Math.min(a.count,Math.min(m.start+m.count,u.start+u.count));for(let M=x,A=y;M<A;M+=3){const b=a.getX(M),v=a.getX(M+1),E=a.getX(M+2);s=xr(this,g,t,n,h,d,f,b,v,E),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const p=Math.max(0,u.start),_=Math.min(a.count,u.start+u.count);for(let m=p,g=_;m<g;m+=3){const x=a.getX(m),y=a.getX(m+1),M=a.getX(m+2);s=xr(this,o,t,n,h,d,f,x,y,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let p=0,_=c.length;p<_;p++){const m=c[p],g=o[m.materialIndex],x=Math.max(m.start,u.start),y=Math.min(l.count,Math.min(m.start+m.count,u.start+u.count));for(let M=x,A=y;M<A;M+=3){const b=M,v=M+1,E=M+2;s=xr(this,g,t,n,h,d,f,b,v,E),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const p=Math.max(0,u.start),_=Math.min(l.count,u.start+u.count);for(let m=p,g=_;m<g;m+=3){const x=m,y=m+1,M=m+2;s=xr(this,o,t,n,h,d,f,x,y,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function Md(i,t,e,n,s,r,o,a){let l;if(t.side===cn?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===Ni,a),l===null)return null;_r.copy(a),_r.applyMatrix4(i.matrixWorld);const h=e.ray.origin.distanceTo(_r);return h<e.near||h>e.far?null:{distance:h,point:_r.clone(),object:i}}function xr(i,t,e,n,s,r,o,a,l,h){i.getVertexPosition(a,dr),i.getVertexPosition(l,pr),i.getVertexPosition(h,mr);const d=Md(i,t,e,n,dr,pr,mr,dc);if(d){const f=new T;yn.getBarycoord(dc,dr,pr,mr,f),s&&(d.uv=yn.getInterpolatedAttribute(s,a,l,h,f,new _t)),r&&(d.uv1=yn.getInterpolatedAttribute(r,a,l,h,f,new _t)),o&&(d.normal=yn.getInterpolatedAttribute(o,a,l,h,f,new T),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));const c={a,b:l,c:h,normal:new T,materialIndex:0};yn.getNormal(dr,pr,mr,c.normal),d.face=c,d.barycoord=f}return d}class iu extends hn{constructor(t=null,e=1,n=1,s,r,o,a,l,h=en,d=en,f,c){super(null,o,a,l,h,d,s,r,f,c),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class pc extends En{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const $i=new re,mc=new re,vr=[],gc=new mn,Sd=new re,ws=new Ce,Ts=new zi;class yd extends Ce{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new pc(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Sd)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new mn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,$i),gc.copy(t.boundingBox).applyMatrix4($i),this.boundingBox.union(gc)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new zi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,$i),Ts.copy(t.boundingSphere).applyMatrix4($i),this.boundingSphere.union(Ts)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),this.morphTexture=t.morphTexture!==null?t.morphTexture.clone():null,this.instanceColor=t.instanceColor!==null?t.instanceColor.clone():null,this.count=t.count,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(ws.geometry=this.geometry,ws.material=this.material,ws.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ts.copy(this.boundingSphere),Ts.applyMatrix4(n),t.ray.intersectsSphere(Ts)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,$i),mc.multiplyMatrices(n,$i),ws.matrixWorld=mc,ws.raycast(t,vr);for(let o=0,a=vr.length;o<a;o++){const l=vr[o];l.instanceId=r,l.object=this,e.push(l)}vr.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new pc(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new iu(new Float32Array(s*this.count),s,this.count,cl,Dn));const r=this.morphTexture.source.data.data;let o=0;for(let h=0;h<n.length;h++)o+=n[h];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Ci=new zi,Ed=new _t(.5,.5),Mr=new T;class Xs{constructor(t=new Bn,e=new Bn,n=new Bn,s=new Bn,r=new Bn,o=new Bn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=In,n=!1){const s=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],h=r[3],d=r[4],f=r[5],c=r[6],u=r[7],p=r[8],_=r[9],m=r[10],g=r[11],x=r[12],y=r[13],M=r[14],A=r[15];if(s[0].setComponents(h-o,u-d,g-p,A-x).normalize(),s[1].setComponents(h+o,u+d,g+p,A+x).normalize(),s[2].setComponents(h+a,u+f,g+_,A+y).normalize(),s[3].setComponents(h-a,u-f,g-_,A-y).normalize(),n)s[4].setComponents(l,c,m,M).normalize(),s[5].setComponents(h-l,u-c,g-m,A-M).normalize();else if(s[4].setComponents(h-l,u-c,g-m,A-M).normalize(),e===In)s[5].setComponents(h+l,u+c,g+m,A+M).normalize();else if(e===Ws)s[5].setComponents(l,c,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ci.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ci.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ci)}intersectsSprite(t){Ci.center.set(0,0,0);const e=Ed.distanceTo(t.center);return Ci.radius=.7071067811865476+e,Ci.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ci)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(Mr.x=s.normal.x>0?t.max.x:t.min.x,Mr.y=s.normal.y>0?t.max.y:t.min.y,Mr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Mr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const _c=new re;class gl{constructor(){this.coordinateSystem=In,this._frustums=[],this._count=0}setFromArrayCamera(t){const e=t.cameras,n=this._frustums;for(let s=0;s<e.length;s++){const r=e[s];_c.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new Xs),n[s].setFromProjectionMatrix(_c,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsObject(t))return!0;return!1}intersectsSprite(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSprite(t))return!0;return!1}intersectsSphere(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSphere(t))return!0;return!1}intersectsBox(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsBox(t))return!0;return!1}containsPoint(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;const e=this._frustums,n=t._frustums;for(let s=0;s<t._count;s++)e[s]===void 0&&(e[s]=new Xs),e[s].copy(n[s]);return this._count=t._count,this}clone(){return new gl().copy(this)}}class _l extends Hi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new jt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Zr=new T,Kr=new T,xc=new re,As=new Js,Sr=new zi,Fo=new T,vc=new T;class bd extends Ge{constructor(t=new Le,e=new _l){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Zr.fromBufferAttribute(e,s-1),Kr.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Zr.distanceTo(Kr);t.setAttribute("lineDistance",new ue(n,1))}else $t("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Sr.copy(n.boundingSphere),Sr.applyMatrix4(s),Sr.radius+=r,t.ray.intersectsSphere(Sr)===!1)return;xc.copy(s).invert(),As.copy(t.ray).applyMatrix4(xc);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,h=this.isLineSegments?2:1,d=n.index,c=n.attributes.position;if(d!==null){const u=Math.max(0,o.start),p=Math.min(d.count,o.start+o.count);for(let _=u,m=p-1;_<m;_+=h){const g=d.getX(_),x=d.getX(_+1),y=yr(this,t,As,l,g,x,_);y&&e.push(y)}if(this.isLineLoop){const _=d.getX(p-1),m=d.getX(u),g=yr(this,t,As,l,_,m,p-1);g&&e.push(g)}}else{const u=Math.max(0,o.start),p=Math.min(c.count,o.start+o.count);for(let _=u,m=p-1;_<m;_+=h){const g=yr(this,t,As,l,_,_+1,_);g&&e.push(g)}if(this.isLineLoop){const _=yr(this,t,As,l,p-1,u,p-1);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function yr(i,t,e,n,s,r,o){const a=i.geometry.attributes.position;if(Zr.fromBufferAttribute(a,s),Kr.fromBufferAttribute(a,r),e.distanceSqToSegment(Zr,Kr,Fo,vc)>n)return;Fo.applyMatrix4(i.matrixWorld);const h=t.ray.origin.distanceTo(Fo);if(!(h<t.near||h>t.far))return{distance:h,point:vc.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}const Mc=new T,Sc=new T;class io extends bd{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Mc.fromBufferAttribute(e,s),Sc.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Mc.distanceTo(Sc);t.setAttribute("lineDistance",new ue(n,1))}else $t("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class su extends hn{constructor(t=[],e=ds,n,s,r,o,a,l,h,d){super(t,e,n,s,r,o,a,l,h,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class ms extends hn{constructor(t,e,n=Xn,s,r,o,a=en,l=en,h,d=yi,f=1){if(d!==yi&&d!==Mi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const c={width:t,height:e,depth:f};super(c,s,r,o,a,l,d,n,h),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new pl(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}}class ru extends ms{constructor(t,e=Xn,n=ds,s,r,o=en,a=en,l,h=yi){const d={width:t,height:t,depth:1},f=[d,d,d,d,d,d];super(t,t,e,n,s,r,o,a,l,h),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class ou extends hn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class qn extends Le{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],h=[],d=[],f=[];let c=0,u=0;p("z","y","x",-1,-1,n,e,t,o,r,0),p("z","y","x",1,-1,n,e,-t,o,r,1),p("x","z","y",1,1,t,n,e,s,o,2),p("x","z","y",1,-1,t,n,-e,s,o,3),p("x","y","z",1,-1,t,e,n,s,r,4),p("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ue(h,3)),this.setAttribute("normal",new ue(d,3)),this.setAttribute("uv",new ue(f,2));function p(_,m,g,x,y,M,A,b,v,E,D){const P=M/v,L=A/E,U=M/2,V=A/2,N=b/2,z=v+1,k=E+1;let G=0,st=0;const C=new T;for(let B=0;B<k;B++){const W=B*L-V;for(let ot=0;ot<z;ot++){const yt=ot*P-U;C[_]=yt*x,C[m]=W*y,C[g]=N,h.push(C.x,C.y,C.z),C[_]=0,C[m]=0,C[g]=b>0?1:-1,d.push(C.x,C.y,C.z),f.push(ot/v),f.push(1-B/E),G+=1}}for(let B=0;B<E;B++)for(let W=0;W<v;W++){const ot=c+W+z*B,yt=c+W+z*(B+1),J=c+(W+1)+z*(B+1),rt=c+(W+1)+z*B;l.push(ot,yt,rt),l.push(yt,J,rt),st+=6}a.addGroup(u,st,D),u+=st,c+=G}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qn(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class xl extends Le{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const o=[],a=[],l=[],h=[],d=e/2,f=Math.PI/2*t,c=e,u=2*f+c,p=n*2+r,_=s+1,m=new T,g=new T;for(let x=0;x<=p;x++){let y=0,M=0,A=0,b=0;if(x<=n){const D=x/n,P=D*Math.PI/2;M=-d-t*Math.cos(P),A=t*Math.sin(P),b=-t*Math.cos(P),y=D*f}else if(x<=n+r){const D=(x-n)/r;M=-d+D*e,A=t,b=0,y=f+D*c}else{const D=(x-n-r)/n,P=D*Math.PI/2;M=d+t*Math.sin(P),A=t*Math.cos(P),b=t*Math.sin(P),y=f+c+D*f}const v=Math.max(0,Math.min(1,y/u));let E=0;x===0?E=.5/s:x===p&&(E=-.5/s);for(let D=0;D<=s;D++){const P=D/s,L=P*Math.PI*2,U=Math.sin(L),V=Math.cos(L);g.x=-A*V,g.y=M,g.z=A*U,a.push(g.x,g.y,g.z),m.set(-A*V,b,A*U),m.normalize(),l.push(m.x,m.y,m.z),h.push(P+E,v)}if(x>0){const D=(x-1)*_;for(let P=0;P<s;P++){const L=D+P,U=D+P+1,V=x*_+P,N=x*_+P+1;o.push(L,U,V),o.push(U,N,V)}}}this.setIndex(o),this.setAttribute("position",new ue(a,3)),this.setAttribute("normal",new ue(l,3)),this.setAttribute("uv",new ue(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new xl(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}}class Gn extends Le{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const h=this;s=Math.floor(s),r=Math.floor(r);const d=[],f=[],c=[],u=[];let p=0;const _=[],m=n/2;let g=0;x(),o===!1&&(t>0&&y(!0),e>0&&y(!1)),this.setIndex(d),this.setAttribute("position",new ue(f,3)),this.setAttribute("normal",new ue(c,3)),this.setAttribute("uv",new ue(u,2));function x(){const M=new T,A=new T;let b=0;const v=(e-t)/n;for(let E=0;E<=r;E++){const D=[],P=E/r,L=P*(e-t)+t;for(let U=0;U<=s;U++){const V=U/s,N=V*l+a,z=Math.sin(N),k=Math.cos(N);A.x=L*z,A.y=-P*n+m,A.z=L*k,f.push(A.x,A.y,A.z),M.set(z,v,k).normalize(),c.push(M.x,M.y,M.z),u.push(V,1-P),D.push(p++)}_.push(D)}for(let E=0;E<s;E++)for(let D=0;D<r;D++){const P=_[D][E],L=_[D+1][E],U=_[D+1][E+1],V=_[D][E+1];(t>0||D!==0)&&(d.push(P,L,V),b+=3),(e>0||D!==r-1)&&(d.push(L,U,V),b+=3)}h.addGroup(g,b,0),g+=b}function y(M){const A=p,b=new _t,v=new T;let E=0;const D=M===!0?t:e,P=M===!0?1:-1;for(let U=1;U<=s;U++)f.push(0,m*P,0),c.push(0,P,0),u.push(.5,.5),p++;const L=p;for(let U=0;U<=s;U++){const N=U/s*l+a,z=Math.cos(N),k=Math.sin(N);v.x=D*k,v.y=m*P,v.z=D*z,f.push(v.x,v.y,v.z),c.push(0,P,0),b.x=z*.5+.5,b.y=k*.5*P+.5,u.push(b.x,b.y),p++}for(let U=0;U<s;U++){const V=A+U,N=L+U;M===!0?d.push(N,N+1,V):d.push(N+1,N,V),E+=3}h.addGroup(g,E,M===!0?1:2),g+=E}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Gn(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Si extends Gn{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new Si(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class $s extends Le{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};const r=[],o=[];a(s),h(n),d(),this.setAttribute("position",new ue(r,3)),this.setAttribute("normal",new ue(r.slice(),3)),this.setAttribute("uv",new ue(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(x){const y=new T,M=new T,A=new T;for(let b=0;b<e.length;b+=3)u(e[b+0],y),u(e[b+1],M),u(e[b+2],A),l(y,M,A,x)}function l(x,y,M,A){const b=A+1,v=[];for(let E=0;E<=b;E++){v[E]=[];const D=x.clone().lerp(M,E/b),P=y.clone().lerp(M,E/b),L=b-E;for(let U=0;U<=L;U++)U===0&&E===b?v[E][U]=D:v[E][U]=D.clone().lerp(P,U/L)}for(let E=0;E<b;E++)for(let D=0;D<2*(b-E)-1;D++){const P=Math.floor(D/2);D%2===0?(c(v[E][P+1]),c(v[E+1][P]),c(v[E][P])):(c(v[E][P+1]),c(v[E+1][P+1]),c(v[E+1][P]))}}function h(x){const y=new T;for(let M=0;M<r.length;M+=3)y.x=r[M+0],y.y=r[M+1],y.z=r[M+2],y.normalize().multiplyScalar(x),r[M+0]=y.x,r[M+1]=y.y,r[M+2]=y.z}function d(){const x=new T;for(let y=0;y<r.length;y+=3){x.x=r[y+0],x.y=r[y+1],x.z=r[y+2];const M=m(x)/2/Math.PI+.5,A=g(x)/Math.PI+.5;o.push(M,1-A)}p(),f()}function f(){for(let x=0;x<o.length;x+=6){const y=o[x+0],M=o[x+2],A=o[x+4],b=Math.max(y,M,A),v=Math.min(y,M,A);b>.9&&v<.1&&(y<.2&&(o[x+0]+=1),M<.2&&(o[x+2]+=1),A<.2&&(o[x+4]+=1))}}function c(x){r.push(x.x,x.y,x.z)}function u(x,y){const M=x*3;y.x=t[M+0],y.y=t[M+1],y.z=t[M+2]}function p(){const x=new T,y=new T,M=new T,A=new T,b=new _t,v=new _t,E=new _t;for(let D=0,P=0;D<r.length;D+=9,P+=6){x.set(r[D+0],r[D+1],r[D+2]),y.set(r[D+3],r[D+4],r[D+5]),M.set(r[D+6],r[D+7],r[D+8]),b.set(o[P+0],o[P+1]),v.set(o[P+2],o[P+3]),E.set(o[P+4],o[P+5]),A.copy(x).add(y).add(M).divideScalar(3);const L=m(A);_(b,P+0,x,L),_(v,P+2,y,L),_(E,P+4,M,L)}}function _(x,y,M,A){A<0&&x.x===1&&(o[y]=x.x-1),M.x===0&&M.z===0&&(o[y]=A/2/Math.PI+.5)}function m(x){return Math.atan2(x.z,-x.x)}function g(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new $s(t.vertices,t.indices,t.radius,t.detail)}}class Zn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){$t("Curve: .getPoint() not implemented.")}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){const n=this.getLengths();let s=0;const r=n.length;let o;e?o=e:o=t*n[r-1];let a=0,l=r-1,h;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),h=n[s]-o,h<0)a=s+1;else if(h>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);const d=n[s],c=n[s+1]-d,u=(o-d)/c;return(s+u)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=e||(o.isVector2?new _t:new T);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){const n=new T,s=[],r=[],o=[],a=new T,l=new re;for(let u=0;u<=t;u++){const p=u/t;s[u]=this.getTangentAt(p,new T)}r[0]=new T,o[0]=new T;let h=Number.MAX_VALUE;const d=Math.abs(s[0].x),f=Math.abs(s[0].y),c=Math.abs(s[0].z);d<=h&&(h=d,n.set(1,0,0)),f<=h&&(h=f,n.set(0,1,0)),c<=h&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let u=1;u<=t;u++){if(r[u]=r[u-1].clone(),o[u]=o[u-1].clone(),a.crossVectors(s[u-1],s[u]),a.length()>Number.EPSILON){a.normalize();const p=Math.acos(pe(s[u-1].dot(s[u]),-1,1));r[u].applyMatrix4(l.makeRotationAxis(a,p))}o[u].crossVectors(s[u],r[u])}if(e===!0){let u=Math.acos(pe(r[0].dot(r[t]),-1,1));u/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(u=-u);for(let p=1;p<=t;p++)r[p].applyMatrix4(l.makeRotationAxis(s[p],u*p)),o[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}}class vl extends Zn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new _t){const n=e,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(a),h=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const d=Math.cos(this.aRotation),f=Math.sin(this.aRotation),c=l-this.aX,u=h-this.aY;l=c*d-u*f+this.aX,h=c*f+u*d+this.aY}return n.set(l,h)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class wd extends vl{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Ml(){let i=0,t=0,e=0,n=0;function s(r,o,a,l){i=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,h){s(o,a,h*(a-r),h*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,h,d,f){let c=(o-r)/h-(a-r)/(h+d)+(a-o)/d,u=(a-o)/d-(l-o)/(d+f)+(l-a)/f;c*=d,u*=d,s(o,a,c,u)},calc:function(r){const o=r*r,a=o*r;return i+t*r+e*o+n*a}}}const yc=new T,Ec=new T,Bo=new Ml,zo=new Ml,Ho=new Ml;class Sl extends Zn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new T){const n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let h,d;this.closed||a>0?h=s[(a-1)%r]:(Ec.subVectors(s[0],s[1]).add(s[0]),h=Ec);const f=s[a%r],c=s[(a+1)%r];if(this.closed||a+2<r?d=s[(a+2)%r]:(yc.subVectors(s[r-1],s[r-2]).add(s[r-1]),d=yc),this.curveType==="centripetal"||this.curveType==="chordal"){const u=this.curveType==="chordal"?.5:.25;let p=Math.pow(h.distanceToSquared(f),u),_=Math.pow(f.distanceToSquared(c),u),m=Math.pow(c.distanceToSquared(d),u);_<1e-4&&(_=1),p<1e-4&&(p=_),m<1e-4&&(m=_),Bo.initNonuniformCatmullRom(h.x,f.x,c.x,d.x,p,_,m),zo.initNonuniformCatmullRom(h.y,f.y,c.y,d.y,p,_,m),Ho.initNonuniformCatmullRom(h.z,f.z,c.z,d.z,p,_,m)}else this.curveType==="catmullrom"&&(Bo.initCatmullRom(h.x,f.x,c.x,d.x,this.tension),zo.initCatmullRom(h.y,f.y,c.y,d.y,this.tension),Ho.initCatmullRom(h.z,f.z,c.z,d.z,this.tension));return n.set(Bo.calc(l),zo.calc(l),Ho.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new T().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function bc(i,t,e,n,s){const r=(n-t)*.5,o=(s-e)*.5,a=i*i,l=i*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*i+e}function Td(i,t){const e=1-i;return e*e*t}function Ad(i,t){return 2*(1-i)*i*t}function Rd(i,t){return i*i*t}function Bs(i,t,e,n){return Td(i,t)+Ad(i,e)+Rd(i,n)}function Cd(i,t){const e=1-i;return e*e*e*t}function Pd(i,t){const e=1-i;return 3*e*e*i*t}function Ld(i,t){return 3*(1-i)*i*i*t}function Dd(i,t){return i*i*i*t}function zs(i,t,e,n,s){return Cd(i,t)+Pd(i,e)+Ld(i,n)+Dd(i,s)}class au extends Zn{constructor(t=new _t,e=new _t,n=new _t,s=new _t){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new _t){const n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(zs(t,s.x,r.x,o.x,a.x),zs(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Id extends Zn{constructor(t=new T,e=new T,n=new T,s=new T){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new T){const n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(zs(t,s.x,r.x,o.x,a.x),zs(t,s.y,r.y,o.y,a.y),zs(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class lu extends Zn{constructor(t=new _t,e=new _t){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new _t){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new _t){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Nd extends Zn{constructor(t=new T,e=new T){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new T){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new T){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class cu extends Zn{constructor(t=new _t,e=new _t,n=new _t){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new _t){const n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Bs(t,s.x,r.x,o.x),Bs(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Ud extends Zn{constructor(t=new T,e=new T,n=new T){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new T){const n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Bs(t,s.x,r.x,o.x),Bs(t,s.y,r.y,o.y),Bs(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class hu extends Zn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new _t){const n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],h=s[o],d=s[o>s.length-2?s.length-1:o+1],f=s[o>s.length-3?s.length-1:o+2];return n.set(bc(a,l.x,h.x,d.x,f.x),bc(a,l.y,h.y,d.y,f.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new _t().fromArray(s))}return this}}var za=Object.freeze({__proto__:null,ArcCurve:wd,CatmullRomCurve3:Sl,CubicBezierCurve:au,CubicBezierCurve3:Id,EllipseCurve:vl,LineCurve:lu,LineCurve3:Nd,QuadraticBezierCurve:cu,QuadraticBezierCurve3:Ud,SplineCurve:hu});class Od extends Zn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new za[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const o=s[r]-n,a=this.curves[r],l=a.getLength(),h=l===0?0:1-o/l;return a.getPointAt(h,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let h=0;h<l.length;h++){const d=l[h];n&&n.equals(d)||(e.push(d),n=d)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this.cacheLengths=null,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(new za[s.type]().fromJSON(s))}return this.cacheLengths=null,this}}class wc extends Od{constructor(t){super(),this.type="Path",this.currentPoint=new _t,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new lu(this.currentPoint.clone(),new _t(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){const r=new cu(this.currentPoint.clone(),new _t(t,e),new _t(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){const a=new au(this.currentPoint.clone(),new _t(t,e),new _t(n,s),new _t(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new hu(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,l){const h=this.currentPoint.x,d=this.currentPoint.y;return this.absellipse(t+h,e+d,n,s,r,o,a,l),this}absellipse(t,e,n,s,r,o,a,l){const h=new vl(t,e,n,s,r,o,a,l);if(this.curves.length>0){const f=h.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(h);const d=h.getPoint(1);return this.currentPoint.copy(d),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class uu extends wc{constructor(t){super(t),this.uuid=vs(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(new wc().fromJSON(s))}return this}}function Fd(i,t,e=2){const n=t&&t.length,s=n?t[0]*e:i.length;let r=fu(i,0,s,e,!0);const o=[];if(!r||r.next===r.prev)return o;let a,l,h;if(n&&(r=Gd(i,t,r,e)),i.length>80*e){a=i[0],l=i[1];let d=a,f=l;for(let c=e;c<s;c+=e){const u=i[c],p=i[c+1];u<a&&(a=u),p<l&&(l=p),u>d&&(d=u),p>f&&(f=p)}h=Math.max(d-a,f-l),h=h!==0?32767/h:0}return Ys(r,o,e,a,l,h,0),o}function fu(i,t,e,n,s){let r;if(s===jd(i,t,e,n)>0)for(let o=t;o<e;o+=n)r=Tc(o/n|0,i[o],i[o+1],r);else for(let o=e-n;o>=t;o-=n)r=Tc(o/n|0,i[o],i[o+1],r);return r&&gs(r,r.next)&&(Zs(r),r=r.next),r}function Oi(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(gs(e,e.next)||Be(e.prev,e,e.next)===0)){if(Zs(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Ys(i,t,e,n,s,r,o){if(!i)return;!o&&r&&qd(i,n,s,r);let a=i;for(;i.prev!==i.next;){const l=i.prev,h=i.next;if(r?zd(i,n,s,r):Bd(i)){t.push(l.i,i.i,h.i),Zs(i),i=h.next,a=h.next;continue}if(i=h,i===a){o?o===1?(i=Hd(Oi(i),t),Ys(i,t,e,n,s,r,2)):o===2&&kd(i,t,e,n,s,r):Ys(Oi(i),t,e,n,s,r,1);break}}}function Bd(i){const t=i.prev,e=i,n=i.next;if(Be(t,e,n)>=0)return!1;const s=t.x,r=e.x,o=n.x,a=t.y,l=e.y,h=n.y,d=Math.min(s,r,o),f=Math.min(a,l,h),c=Math.max(s,r,o),u=Math.max(a,l,h);let p=n.next;for(;p!==t;){if(p.x>=d&&p.x<=c&&p.y>=f&&p.y<=u&&Ps(s,a,r,l,o,h,p.x,p.y)&&Be(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function zd(i,t,e,n){const s=i.prev,r=i,o=i.next;if(Be(s,r,o)>=0)return!1;const a=s.x,l=r.x,h=o.x,d=s.y,f=r.y,c=o.y,u=Math.min(a,l,h),p=Math.min(d,f,c),_=Math.max(a,l,h),m=Math.max(d,f,c),g=Ha(u,p,t,e,n),x=Ha(_,m,t,e,n);let y=i.prevZ,M=i.nextZ;for(;y&&y.z>=g&&M&&M.z<=x;){if(y.x>=u&&y.x<=_&&y.y>=p&&y.y<=m&&y!==s&&y!==o&&Ps(a,d,l,f,h,c,y.x,y.y)&&Be(y.prev,y,y.next)>=0||(y=y.prevZ,M.x>=u&&M.x<=_&&M.y>=p&&M.y<=m&&M!==s&&M!==o&&Ps(a,d,l,f,h,c,M.x,M.y)&&Be(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;y&&y.z>=g;){if(y.x>=u&&y.x<=_&&y.y>=p&&y.y<=m&&y!==s&&y!==o&&Ps(a,d,l,f,h,c,y.x,y.y)&&Be(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;M&&M.z<=x;){if(M.x>=u&&M.x<=_&&M.y>=p&&M.y<=m&&M!==s&&M!==o&&Ps(a,d,l,f,h,c,M.x,M.y)&&Be(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function Hd(i,t){let e=i;do{const n=e.prev,s=e.next.next;!gs(n,s)&&pu(n,e,e.next,s)&&qs(n,s)&&qs(s,n)&&(t.push(n.i,e.i,s.i),Zs(e),Zs(e.next),e=i=s),e=e.next}while(e!==i);return Oi(e)}function kd(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Jd(o,a)){let l=mu(o,a);o=Oi(o,o.next),l=Oi(l,l.next),Ys(o,t,e,n,s,r,0),Ys(l,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Gd(i,t,e,n){const s=[];for(let r=0,o=t.length;r<o;r++){const a=t[r]*n,l=r<o-1?t[r+1]*n:i.length,h=fu(i,a,l,n,!1);h===h.next&&(h.steiner=!0),s.push(Kd(h))}s.sort(Vd);for(let r=0;r<s.length;r++)e=Wd(s[r],e);return e}function Vd(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function Wd(i,t){const e=Xd(i,t);if(!e)return t;const n=mu(e,i);return Oi(n,n.next),Oi(e,e.next)}function Xd(i,t){let e=t;const n=i.x,s=i.y;let r=-1/0,o;if(gs(i,e))return e;do{if(gs(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){const f=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(f<=n&&f>r&&(r=f,o=e.x<e.next.x?e:e.next,f===n))return o}e=e.next}while(e!==t);if(!o)return null;const a=o,l=o.x,h=o.y;let d=1/0;e=o;do{if(n>=e.x&&e.x>=l&&n!==e.x&&du(s<h?n:r,s,l,h,s<h?r:n,s,e.x,e.y)){const f=Math.abs(s-e.y)/(n-e.x);qs(e,i)&&(f<d||f===d&&(e.x>o.x||e.x===o.x&&Yd(o,e)))&&(o=e,d=f)}e=e.next}while(e!==a);return o}function Yd(i,t){return Be(i.prev,i,t.prev)<0&&Be(t.next,i,i.next)<0}function qd(i,t,e,n){let s=i;do s.z===0&&(s.z=Ha(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Zd(s)}function Zd(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let o=n,a=0;for(let h=0;h<e&&(a++,o=o.nextZ,!!o);h++);let l=e;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,e*=2}while(t>1);return i}function Ha(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function Kd(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function du(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function Ps(i,t,e,n,s,r,o,a){return!(i===o&&t===a)&&du(i,t,e,n,s,r,o,a)}function Jd(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!$d(i,t)&&(qs(i,t)&&qs(t,i)&&Qd(i,t)&&(Be(i.prev,i,t.prev)||Be(i,t.prev,t))||gs(i,t)&&Be(i.prev,i,i.next)>0&&Be(t.prev,t,t.next)>0)}function Be(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function gs(i,t){return i.x===t.x&&i.y===t.y}function pu(i,t,e,n){const s=br(Be(i,t,e)),r=br(Be(i,t,n)),o=br(Be(e,n,i)),a=br(Be(e,n,t));return!!(s!==r&&o!==a||s===0&&Er(i,e,t)||r===0&&Er(i,n,t)||o===0&&Er(e,i,n)||a===0&&Er(e,t,n))}function Er(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function br(i){return i>0?1:i<0?-1:0}function $d(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&pu(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function qs(i,t){return Be(i.prev,i,i.next)<0?Be(i,t,i.next)>=0&&Be(i,i.prev,t)>=0:Be(i,t,i.prev)<0||Be(i,i.next,t)<0}function Qd(i,t){let e=i,n=!1;const s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function mu(i,t){const e=ka(i.i,i.x,i.y),n=ka(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Tc(i,t,e,n){const s=ka(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Zs(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function ka(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function jd(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}class tp{static triangulate(t,e,n=2){return Fd(t,e,n)}}class ii{static area(t){const e=t.length;let n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return ii.area(t)<0}static triangulateShape(t,e){const n=[],s=[],r=[];Ac(t),Rc(n,t);let o=t.length;e.forEach(Ac);for(let l=0;l<e.length;l++)s.push(o),o+=e[l].length,Rc(n,e[l]);const a=tp.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}}function Ac(i){const t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function Rc(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}class yl extends Le{constructor(t=new uu([new _t(.5,.5),new _t(-.5,.5),new _t(-.5,-.5),new _t(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,s=[],r=[];for(let a=0,l=t.length;a<l;a++){const h=t[a];o(h)}this.setAttribute("position",new ue(s,3)),this.setAttribute("uv",new ue(r,2)),this.computeVertexNormals();function o(a){const l=[],h=e.curveSegments!==void 0?e.curveSegments:12,d=e.steps!==void 0?e.steps:1,f=e.depth!==void 0?e.depth:1;let c=e.bevelEnabled!==void 0?e.bevelEnabled:!0,u=e.bevelThickness!==void 0?e.bevelThickness:.2,p=e.bevelSize!==void 0?e.bevelSize:u-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3;const g=e.extrudePath,x=e.UVGenerator!==void 0?e.UVGenerator:ep;let y,M=!1,A,b,v,E;if(g){y=g.getSpacedPoints(d),M=!0,c=!1;const tt=g.isCatmullRomCurve3?g.closed:!1;A=g.computeFrenetFrames(d,tt),b=new T,v=new T,E=new T}c||(m=0,u=0,p=0,_=0);const D=a.extractPoints(h);let P=D.shape;const L=D.holes;if(!ii.isClockWise(P)){P=P.reverse();for(let tt=0,dt=L.length;tt<dt;tt++){const xt=L[tt];ii.isClockWise(xt)&&(L[tt]=xt.reverse())}}function V(tt){const xt=10000000000000001e-36;let At=tt[0];for(let Et=1;Et<=tt.length;Et++){const Jt=Et%tt.length,zt=tt[Jt],Qt=zt.x-At.x,he=zt.y-At.y,fe=Qt*Qt+he*he,F=Math.max(Math.abs(zt.x),Math.abs(zt.y),Math.abs(At.x),Math.abs(At.y)),Ie=xt*F*F;if(fe<=Ie){tt.splice(Jt,1),Et--;continue}At=zt}}V(P),L.forEach(V);const N=L.length,z=P;for(let tt=0;tt<N;tt++){const dt=L[tt];P=P.concat(dt)}function k(tt,dt,xt){return dt||Ee("ExtrudeGeometry: vec does not exist"),tt.clone().addScaledVector(dt,xt)}const G=P.length;function st(tt,dt,xt){let At,Et,Jt;const zt=tt.x-dt.x,Qt=tt.y-dt.y,he=xt.x-tt.x,fe=xt.y-tt.y,F=zt*zt+Qt*Qt,Ie=zt*fe-Qt*he;if(Math.abs(Ie)>Number.EPSILON){const oe=Math.sqrt(F),we=Math.sqrt(he*he+fe*fe),Z=dt.x-Qt/oe,lt=dt.y+zt/oe,at=xt.x-fe/we,Dt=xt.y+he/we,R=((at-Z)*fe-(Dt-lt)*he)/(zt*fe-Qt*he);At=Z+zt*R-tt.x,Et=lt+Qt*R-tt.y;const S=At*At+Et*Et;if(S<=2)return new _t(At,Et);Jt=Math.sqrt(S/2)}else{let oe=!1;zt>Number.EPSILON?he>Number.EPSILON&&(oe=!0):zt<-Number.EPSILON?he<-Number.EPSILON&&(oe=!0):Math.sign(Qt)===Math.sign(fe)&&(oe=!0),oe?(At=-Qt,Et=zt,Jt=Math.sqrt(F)):(At=zt,Et=Qt,Jt=Math.sqrt(F/2))}return new _t(At/Jt,Et/Jt)}const C=[];for(let tt=0,dt=z.length,xt=dt-1,At=tt+1;tt<dt;tt++,xt++,At++)xt===dt&&(xt=0),At===dt&&(At=0),C[tt]=st(z[tt],z[xt],z[At]);const B=[];let W,ot=C.concat();for(let tt=0,dt=N;tt<dt;tt++){const xt=L[tt];W=[];for(let At=0,Et=xt.length,Jt=Et-1,zt=At+1;At<Et;At++,Jt++,zt++)Jt===Et&&(Jt=0),zt===Et&&(zt=0),W[At]=st(xt[At],xt[Jt],xt[zt]);B.push(W),ot=ot.concat(W)}let yt;if(m===0)yt=ii.triangulateShape(z,L);else{const tt=[],dt=[];for(let xt=0;xt<m;xt++){const At=xt/m,Et=u*Math.cos(At*Math.PI/2),Jt=p*Math.sin(At*Math.PI/2)+_;for(let zt=0,Qt=z.length;zt<Qt;zt++){const he=k(z[zt],C[zt],Jt);Ct(he.x,he.y,-Et),At===0&&tt.push(he)}for(let zt=0,Qt=N;zt<Qt;zt++){const he=L[zt];W=B[zt];const fe=[];for(let F=0,Ie=he.length;F<Ie;F++){const oe=k(he[F],W[F],Jt);Ct(oe.x,oe.y,-Et),At===0&&fe.push(oe)}At===0&&dt.push(fe)}}yt=ii.triangulateShape(tt,dt)}const J=yt.length,rt=p+_;for(let tt=0;tt<G;tt++){const dt=c?k(P[tt],ot[tt],rt):P[tt];M?(v.copy(A.normals[0]).multiplyScalar(dt.x),b.copy(A.binormals[0]).multiplyScalar(dt.y),E.copy(y[0]).add(v).add(b),Ct(E.x,E.y,E.z)):Ct(dt.x,dt.y,0)}for(let tt=1;tt<=d;tt++)for(let dt=0;dt<G;dt++){const xt=c?k(P[dt],ot[dt],rt):P[dt];M?(v.copy(A.normals[tt]).multiplyScalar(xt.x),b.copy(A.binormals[tt]).multiplyScalar(xt.y),E.copy(y[tt]).add(v).add(b),Ct(E.x,E.y,E.z)):Ct(xt.x,xt.y,f/d*tt)}for(let tt=m-1;tt>=0;tt--){const dt=tt/m,xt=u*Math.cos(dt*Math.PI/2),At=p*Math.sin(dt*Math.PI/2)+_;for(let Et=0,Jt=z.length;Et<Jt;Et++){const zt=k(z[Et],C[Et],At);Ct(zt.x,zt.y,f+xt)}for(let Et=0,Jt=L.length;Et<Jt;Et++){const zt=L[Et];W=B[Et];for(let Qt=0,he=zt.length;Qt<he;Qt++){const fe=k(zt[Qt],W[Qt],At);M?Ct(fe.x,fe.y+y[d-1].y,y[d-1].x+xt):Ct(fe.x,fe.y,f+xt)}}}bt(),Nt();function bt(){const tt=s.length/3;if(c){let dt=0,xt=G*dt;for(let At=0;At<J;At++){const Et=yt[At];Vt(Et[2]+xt,Et[1]+xt,Et[0]+xt)}dt=d+m*2,xt=G*dt;for(let At=0;At<J;At++){const Et=yt[At];Vt(Et[0]+xt,Et[1]+xt,Et[2]+xt)}}else{for(let dt=0;dt<J;dt++){const xt=yt[dt];Vt(xt[2],xt[1],xt[0])}for(let dt=0;dt<J;dt++){const xt=yt[dt];Vt(xt[0]+G*d,xt[1]+G*d,xt[2]+G*d)}}n.addGroup(tt,s.length/3-tt,0)}function Nt(){const tt=s.length/3;let dt=0;ct(z,dt),dt+=z.length;for(let xt=0,At=L.length;xt<At;xt++){const Et=L[xt];ct(Et,dt),dt+=Et.length}n.addGroup(tt,s.length/3-tt,1)}function ct(tt,dt){let xt=tt.length;for(;--xt>=0;){const At=xt;let Et=xt-1;Et<0&&(Et=tt.length-1);for(let Jt=0,zt=d+m*2;Jt<zt;Jt++){const Qt=G*Jt,he=G*(Jt+1),fe=dt+At+Qt,F=dt+Et+Qt,Ie=dt+Et+he,oe=dt+At+he;Bt(fe,F,Ie,oe)}}}function Ct(tt,dt,xt){l.push(tt),l.push(dt),l.push(xt)}function Vt(tt,dt,xt){Xt(tt),Xt(dt),Xt(xt);const At=s.length/3,Et=x.generateTopUV(n,s,At-3,At-2,At-1);Zt(Et[0]),Zt(Et[1]),Zt(Et[2])}function Bt(tt,dt,xt,At){Xt(tt),Xt(dt),Xt(At),Xt(dt),Xt(xt),Xt(At);const Et=s.length/3,Jt=x.generateSideWallUV(n,s,Et-6,Et-3,Et-2,Et-1);Zt(Jt[0]),Zt(Jt[1]),Zt(Jt[3]),Zt(Jt[1]),Zt(Jt[2]),Zt(Jt[3])}function Xt(tt){s.push(l[tt*3+0]),s.push(l[tt*3+1]),s.push(l[tt*3+2])}function Zt(tt){r.push(tt.x),r.push(tt.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return np(e,n,t)}static fromJSON(t,e){const n=[];for(let r=0,o=t.shapes.length;r<o;r++){const a=e[t.shapes[r]];n.push(a)}const s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new za[s.type]().fromJSON(s)),new yl(n,t.options)}}const ep={generateTopUV:function(i,t,e,n,s){const r=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],h=t[s*3],d=t[s*3+1];return[new _t(r,o),new _t(a,l),new _t(h,d)]},generateSideWallUV:function(i,t,e,n,s,r){const o=t[e*3],a=t[e*3+1],l=t[e*3+2],h=t[n*3],d=t[n*3+1],f=t[n*3+2],c=t[s*3],u=t[s*3+1],p=t[s*3+2],_=t[r*3],m=t[r*3+1],g=t[r*3+2];return Math.abs(a-d)<Math.abs(o-h)?[new _t(o,1-l),new _t(h,1-f),new _t(c,1-p),new _t(_,1-g)]:[new _t(a,1-l),new _t(d,1-f),new _t(u,1-p),new _t(m,1-g)]}};function np(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class El extends $s{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new El(t.radius,t.detail)}}class bl extends Le{constructor(t=[new _t(0,-.5),new _t(.5,0),new _t(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=pe(s,0,Math.PI*2);const r=[],o=[],a=[],l=[],h=[],d=1/e,f=new T,c=new _t,u=new T,p=new T,_=new T;let m=0,g=0;for(let x=0;x<=t.length-1;x++)switch(x){case 0:m=t[x+1].x-t[x].x,g=t[x+1].y-t[x].y,u.x=g*1,u.y=-m,u.z=g*0,_.copy(u),u.normalize(),l.push(u.x,u.y,u.z);break;case t.length-1:_.normalize(),l.push(_.x,_.y,_.z);break;default:m=t[x+1].x-t[x].x,g=t[x+1].y-t[x].y,u.x=g*1,u.y=-m,u.z=g*0,p.copy(u),u.x+=_.x,u.y+=_.y,u.z+=_.z,u.normalize(),l.push(u.x,u.y,u.z),_.copy(p)}for(let x=0;x<=e;x++){const y=n+x*d*s,M=Math.sin(y),A=Math.cos(y);for(let b=0;b<=t.length-1;b++){f.x=t[b].x*M,f.y=t[b].y,f.z=t[b].x*A,o.push(f.x,f.y,f.z),c.x=x/e,c.y=b/(t.length-1),a.push(c.x,c.y);const v=l[3*b+0]*M,E=l[3*b+1],D=l[3*b+0]*A;h.push(v,E,D)}}for(let x=0;x<e;x++)for(let y=0;y<t.length-1;y++){const M=y+x*t.length,A=M,b=M+t.length,v=M+t.length+1,E=M+1;r.push(A,b,E),r.push(v,E,b)}this.setIndex(r),this.setAttribute("position",new ue(o,3)),this.setAttribute("uv",new ue(a,2)),this.setAttribute("normal",new ue(h,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new bl(t.points,t.segments,t.phiStart,t.phiLength)}}class wl extends $s{constructor(t=1,e=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new wl(t.radius,t.detail)}}class so extends Le{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),h=a+1,d=l+1,f=t/a,c=e/l,u=[],p=[],_=[],m=[];for(let g=0;g<d;g++){const x=g*c-o;for(let y=0;y<h;y++){const M=y*f-r;p.push(M,-x,0),_.push(0,0,1),m.push(y/a),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let x=0;x<a;x++){const y=x+h*g,M=x+h*(g+1),A=x+1+h*(g+1),b=x+1+h*g;u.push(y,M,b),u.push(M,A,b)}this.setIndex(u),this.setAttribute("position",new ue(p,3)),this.setAttribute("normal",new ue(_,3)),this.setAttribute("uv",new ue(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new so(t.width,t.height,t.widthSegments,t.heightSegments)}}class Tl extends Le{constructor(t=.5,e=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],l=[],h=[],d=[];let f=t;const c=(e-t)/s,u=new T,p=new _t;for(let _=0;_<=s;_++){for(let m=0;m<=n;m++){const g=r+m/n*o;u.x=f*Math.cos(g),u.y=f*Math.sin(g),l.push(u.x,u.y,u.z),h.push(0,0,1),p.x=(u.x/e+1)/2,p.y=(u.y/e+1)/2,d.push(p.x,p.y)}f+=c}for(let _=0;_<s;_++){const m=_*(n+1);for(let g=0;g<n;g++){const x=g+m,y=x,M=x+n+1,A=x+n+2,b=x+1;a.push(y,M,b),a.push(M,A,b)}}this.setIndex(a),this.setAttribute("position",new ue(l,3)),this.setAttribute("normal",new ue(h,3)),this.setAttribute("uv",new ue(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Tl(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class Vn extends Le{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let h=0;const d=[],f=new T,c=new T,u=[],p=[],_=[],m=[];for(let g=0;g<=n;g++){const x=[],y=g/n,M=o+y*a,A=t*Math.cos(M),b=Math.sqrt(t*t-A*A);let v=0;g===0&&o===0?v=.5/e:g===n&&l===Math.PI&&(v=-.5/e);for(let E=0;E<=e;E++){const D=E/e,P=s+D*r;f.x=-b*Math.cos(P),f.y=A,f.z=b*Math.sin(P),p.push(f.x,f.y,f.z),c.copy(f).normalize(),_.push(c.x,c.y,c.z),m.push(D+v,1-y),x.push(h++)}d.push(x)}for(let g=0;g<n;g++)for(let x=0;x<e;x++){const y=d[g][x+1],M=d[g][x],A=d[g+1][x],b=d[g+1][x+1];(g!==0||o>0)&&u.push(y,M,b),(g!==n-1||l<Math.PI)&&u.push(M,A,b)}this.setIndex(u),this.setAttribute("position",new ue(p,3)),this.setAttribute("normal",new ue(_,3)),this.setAttribute("uv",new ue(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Vn(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Al extends $s{constructor(t=1,e=0){const n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],s=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,s,t,e),this.type="TetrahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Al(t.radius,t.detail)}}class si extends Le{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),s=Math.floor(s);const l=[],h=[],d=[],f=[],c=new T,u=new T,p=new T;for(let _=0;_<=n;_++){const m=o+_/n*a;for(let g=0;g<=s;g++){const x=g/s*r;u.x=(t+e*Math.cos(m))*Math.cos(x),u.y=(t+e*Math.cos(m))*Math.sin(x),u.z=e*Math.sin(m),h.push(u.x,u.y,u.z),c.x=t*Math.cos(x),c.y=t*Math.sin(x),p.subVectors(u,c).normalize(),d.push(p.x,p.y,p.z),f.push(g/s),f.push(_/n)}}for(let _=1;_<=n;_++)for(let m=1;m<=s;m++){const g=(s+1)*_+m-1,x=(s+1)*(_-1)+m-1,y=(s+1)*(_-1)+m,M=(s+1)*_+m;l.push(g,x,M),l.push(x,y,M)}this.setIndex(l),this.setAttribute("position",new ue(h,3)),this.setAttribute("normal",new ue(d,3)),this.setAttribute("uv",new ue(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new si(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}}function _s(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];if(Cc(s))s.isRenderTargetTexture?($t("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(Cc(s[0])){const r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function ln(i){const t={};for(let e=0;e<i.length;e++){const n=_s(i[e]);for(const s in n)t[s]=n[s]}return t}function Cc(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function ip(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function gu(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Me.workingColorSpace}const sp={clone:_s,merge:ln};var rp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,op=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Fi extends Hi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=rp,this.fragmentShader=op,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=_s(t.uniforms),this.uniformsGroups=ip(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(const n in t.uniforms){const s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new jt().setHex(s.value);break;case"v2":this.uniforms[n].value=new _t().fromArray(s.value);break;case"v3":this.uniforms[n].value=new T().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Fe().fromArray(s.value);break;case"m3":this.uniforms[n].value=new se().fromArray(s.value);break;case"m4":this.uniforms[n].value=new re().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(const n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}}class ap extends Fi{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class hs extends Hi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new jt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new jt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wr,this.normalScale=new _t(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ke,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class lp extends hs{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new _t(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return pe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new jt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new jt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new jt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(t){this._diffuseRoughness>0!=t>0&&this.version++,this._diffuseRoughness=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}get iridescenceThicknessRange(){return ls('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(t){ls('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=t[0],this.iridescenceThicknessMaximum=t[1]}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.diffuseRoughness=t.diffuseRoughness,this.diffuseRoughnessMap=t.diffuseRoughnessMap,this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum,this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class cp extends Hi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new jt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wr,this.normalScale=new _t(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ke,this.combine=sl,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class hp extends Hi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ff,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class up extends Hi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class Rl extends Ge{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new jt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}}class fp extends Rl{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ge.DEFAULT_UP),this.updateMatrix(),this.groundColor=new jt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){const e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}}const ko=new re,Pc=new T,Lc=new T;class _u{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new _t(512,512),this.mapType=Mn,this.map=null,this.mapPass=null,this.matrix=new re,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Xs,this._frameExtents=new _t(1,1),this._viewportCount=1,this._viewports=[new Fe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera;Pc.setFromMatrixPosition(t.matrixWorld),e.position.copy(Pc),Lc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Lc),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){ko.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(ko,t.coordinateSystem,t.reversedDepth);const r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,h=s?s.y/r.y:0;t.coordinateSystem===Ws||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+h,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+h,0,0,.5,.5,0,0,0,1),e.multiply(ko)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const wr=new T,Tr=new ze,Un=new T;class xu extends Ge{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new re,this.projectionMatrix=new re,this.projectionMatrixInverse=new re,this.coordinateSystem=In,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(wr,Tr,Un),Un.x===1&&Un.y===1&&Un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(wr,Tr,Un.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(wr,Tr,Un),Un.x===1&&Un.y===1&&Un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(wr,Tr,Un.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const _i=new T,Dc=new _t,Ic=new _t;class vn extends xu{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Ba*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Or*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ba*2*Math.atan(Math.tan(Or*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){_i.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(_i.x,_i.y).multiplyScalar(-t/_i.z),_i.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(_i.x,_i.y).multiplyScalar(-t/_i.z)}getViewSize(t,e){return this.getViewBounds(t,Dc,Ic),e.subVectors(Ic,Dc)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Or*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,h=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/h,s*=o.width/l,n*=o.height/h}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}class dp extends _u{constructor(){super(new vn(90,1,.5,500)),this.isPointLightShadow=!0}}class pp extends Rl{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new dp}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){const e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}}class vu extends xu{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const h=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=h*this.view.offsetX,o=r+h*this.view.width,a-=d*this.view.offsetY,l=a-d*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class mp extends _u{constructor(){super(new vu(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class gp extends Rl{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ge.DEFAULT_UP),this.updateMatrix(),this.target=new Ge,this.shadow=new mp}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){const e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}}const Qi=-90,ji=1;class Ga extends Ge{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new vn(Qi,ji,t,e);s.layers=this.layers,this.add(s);const r=new vn(Qi,ji,t,e);r.layers=this.layers,this.add(r);const o=new vn(Qi,ji,t,e);o.layers=this.layers,this.add(o);const a=new vn(Qi,ji,t,e);a.layers=this.layers,this.add(a);const l=new vn(Qi,ji,t,e);l.layers=this.layers,this.add(l);const h=new vn(Qi,ji,t,e);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(const h of e)this.remove(h);if(t===In)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ws)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const h of e)this.add(h),h.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,h,d]=this.children,f=t.getRenderTarget(),c=t.getActiveCubeFace(),u=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),n.texture.mipmapsAutoUpdate=_,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,d),t.setRenderTarget(f,c,u),t.xr.enabled=p,n.texture.needsPMREMUpdate=!0}}class _p extends vn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}}const Nc=new re;class Jr{constructor(t,e,n=0,s=1/0){this.ray=new Js(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new ml,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Ee("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Nc.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Nc),this}intersectObject(t,e=!0,n=[]){return Va(t,this,n,e),n.sort(Uc),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Va(t[s],this,n,e);return n.sort(Uc),n}}function Uc(i,t){return i.distance-t.distance}function Va(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)Va(r[o],t,e,!0)}}class Oc{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=pe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(pe(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class xp extends bi{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}}function Fc(i,t,e,n){const s=vp(n);switch(e){case Yh:return i*t;case cl:return i*t/s.components*s.byteLength;case hl:return i*t/s.components*s.byteLength;case Ui:return i*t*2/s.components*s.byteLength;case ul:return i*t*2/s.components*s.byteLength;case qh:return i*t*3/s.components*s.byteLength;case Hn:return i*t*4/s.components*s.byteLength;case fl:return i*t*4/s.components*s.byteLength;case Dr:case Ir:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Nr:case Ur:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ca:case ua:return Math.max(i,16)*Math.max(t,8)/4;case la:case ha:return Math.max(i,8)*Math.max(t,8)/2;case fa:case da:case ma:case ga:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case pa:case Gr:case _a:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case xa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case va:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Ma:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Sa:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case ya:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Ea:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case ba:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case wa:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Ta:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Aa:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Ra:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Ca:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Pa:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case La:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Da:case Ia:case Na:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Ua:case Oa:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Vr:case Fa:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function vp(i){switch(i){case Mn:case Gh:return{byteLength:1,components:1};case Vs:case Vh:case Yn:return{byteLength:2,components:1};case al:case ll:return{byteLength:2,components:4};case Xn:case ol:case Dn:return{byteLength:4,components:1};case Wh:case Xh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:il}}));typeof window<"u"&&(window.__THREE__?$t("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=il);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Mu(){let i=null,t=!1,e=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),e(r,o)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Mp(i){const t=new WeakMap;function e(a,l){const h=a.array,d=a.usage,f=h.byteLength,c=i.createBuffer();i.bindBuffer(l,c),i.bufferData(l,h,d),a.onUploadCallback();let u;if(h instanceof Float32Array)u=i.FLOAT;else if(typeof Float16Array<"u"&&h instanceof Float16Array)u=i.HALF_FLOAT;else if(h instanceof Uint16Array)a.isFloat16BufferAttribute?u=i.HALF_FLOAT:u=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)u=i.SHORT;else if(h instanceof Uint32Array)u=i.UNSIGNED_INT;else if(h instanceof Int32Array)u=i.INT;else if(h instanceof Int8Array)u=i.BYTE;else if(h instanceof Uint8Array)u=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)u=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:c,type:u,bytesPerElement:h.BYTES_PER_ELEMENT,version:a.version,size:f}}function n(a,l,h){const d=l.array,f=l.updateRanges;if(i.bindBuffer(h,a),f.length===0)i.bufferSubData(h,0,d);else{f.sort((u,p)=>u.start-p.start);let c=0;for(let u=1;u<f.length;u++){const p=f[c],_=f[u];_.start<=p.start+p.count+1?p.count=Math.max(p.count,_.start+_.count-p.start):(++c,f[c]=_)}f.length=c+1;for(let u=0,p=f.length;u<p;u++){const _=f[u];i.bufferSubData(h,_.start*d.BYTES_PER_ELEMENT,d,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const d=t.get(a);(!d||d.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const h=t.get(a);if(h===void 0)t.set(a,e(a,l));else if(h.version<a.version){if(h.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(h.buffer,a,l),h.version=a.version}}return{get:s,remove:r,update:o}}var Sp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,yp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ep=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,bp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,wp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Tp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ap=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Rp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Cp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Pp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Lp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Dp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ip=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Np=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Up=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Op=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Fp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Bp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,zp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Hp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,kp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Gp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Vp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Wp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Xp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Yp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,qp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Zp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Kp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Jp="gl_FragColor = linearToOutputTexel( gl_FragColor );",$p=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Qp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,jp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,tm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,em=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,nm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,im=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,sm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,rm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,om=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,am=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,cm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,hm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,um=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,fm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,dm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,pm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,mm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,gm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,_m=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,xm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,vm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Mm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Sm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ym=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Em=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,bm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,wm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Tm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Am=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Rm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Cm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Pm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Lm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Dm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Im=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Nm=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Um=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Om=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Fm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Bm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,zm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Hm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,km=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Vm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Wm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Xm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ym=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,qm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Zm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Km=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Jm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,$m=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,jm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,t0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,e0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,n0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,i0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,s0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,r0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,o0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,a0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,l0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,c0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,h0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,u0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,f0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,d0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,p0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,m0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,g0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,_0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,x0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,v0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const M0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,S0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,y0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,E0=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,b0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,w0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,T0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,A0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,R0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,C0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,P0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,L0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,D0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,I0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,N0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,U0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,O0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,F0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,B0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,z0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,H0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,k0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,G0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,V0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,W0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,X0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Y0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,q0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Z0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,K0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,J0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Q0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,j0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,me={alphahash_fragment:Sp,alphahash_pars_fragment:yp,alphamap_fragment:Ep,alphamap_pars_fragment:bp,alphatest_fragment:wp,alphatest_pars_fragment:Tp,aomap_fragment:Ap,aomap_pars_fragment:Rp,batching_pars_vertex:Cp,batching_vertex:Pp,begin_vertex:Lp,beginnormal_vertex:Dp,bsdfs:Ip,iridescence_fragment:Np,bumpmap_pars_fragment:Up,clipping_planes_fragment:Op,clipping_planes_pars_fragment:Fp,clipping_planes_pars_vertex:Bp,clipping_planes_vertex:zp,color_fragment:Hp,color_pars_fragment:kp,color_pars_vertex:Gp,color_vertex:Vp,common:Wp,defaultnormal_vertex:Xp,displacementmap_pars_vertex:Yp,displacementmap_vertex:qp,emissivemap_fragment:Zp,emissivemap_pars_fragment:Kp,colorspace_fragment:Jp,colorspace_pars_fragment:$p,envmap_fragment:Qp,envmap_common_pars_fragment:jp,envmap_pars_fragment:tm,envmap_pars_vertex:em,envmap_physical_pars_fragment:fm,envmap_vertex:nm,fog_vertex:im,fog_pars_vertex:sm,fog_fragment:rm,fog_pars_fragment:om,gradientmap_pars_fragment:am,lightmap_pars_fragment:lm,lights_lambert_fragment:cm,lights_lambert_pars_fragment:hm,lights_pars_begin:um,lights_toon_fragment:dm,lights_toon_pars_fragment:pm,lights_phong_fragment:mm,lights_phong_pars_fragment:gm,lights_physical_fragment:_m,lights_physical_pars_fragment:xm,lights_fragment_begin:vm,lights_fragment_maps:Mm,lights_fragment_end:Sm,lightprobes_pars_fragment:ym,logdepthbuf_fragment:Em,logdepthbuf_pars_fragment:bm,logdepthbuf_pars_vertex:wm,logdepthbuf_vertex:Tm,map_fragment:Am,map_pars_fragment:Rm,map_particle_fragment:Cm,map_particle_pars_fragment:Pm,metalnessmap_fragment:Lm,metalnessmap_pars_fragment:Dm,morphinstance_vertex:Im,morphcolor_vertex:Nm,morphnormal_vertex:Um,morphtarget_pars_vertex:Om,morphtarget_vertex:Fm,normal_fragment_begin:Bm,normal_fragment_maps:zm,normal_pars_fragment:Hm,normal_pars_vertex:km,normal_vertex:Gm,normalmap_pars_fragment:Vm,clearcoat_normal_fragment_begin:Wm,clearcoat_normal_fragment_maps:Xm,clearcoat_pars_fragment:Ym,iridescence_pars_fragment:qm,opaque_fragment:Zm,packing:Km,premultiplied_alpha_fragment:Jm,project_vertex:$m,dithering_fragment:Qm,dithering_pars_fragment:jm,roughnessmap_fragment:t0,roughnessmap_pars_fragment:e0,shadowmap_pars_fragment:n0,shadowmap_pars_vertex:i0,shadowmap_vertex:s0,shadowmask_pars_fragment:r0,skinbase_vertex:o0,skinning_pars_vertex:a0,skinning_vertex:l0,skinnormal_vertex:c0,specularmap_fragment:h0,specularmap_pars_fragment:u0,tonemapping_fragment:f0,tonemapping_pars_fragment:d0,transmission_fragment:p0,transmission_pars_fragment:m0,uv_pars_fragment:g0,uv_pars_vertex:_0,uv_vertex:x0,worldpos_vertex:v0,background_vert:M0,background_frag:S0,backgroundCube_vert:y0,backgroundCube_frag:E0,cube_vert:b0,cube_frag:w0,depth_vert:T0,depth_frag:A0,distance_vert:R0,distance_frag:C0,equirect_vert:P0,equirect_frag:L0,linedashed_vert:D0,linedashed_frag:I0,meshbasic_vert:N0,meshbasic_frag:U0,meshlambert_vert:O0,meshlambert_frag:F0,meshmatcap_vert:B0,meshmatcap_frag:z0,meshnormal_vert:H0,meshnormal_frag:k0,meshphong_vert:G0,meshphong_frag:V0,meshphysical_vert:W0,meshphysical_frag:X0,meshtoon_vert:Y0,meshtoon_frag:q0,points_vert:Z0,points_frag:K0,shadow_vert:J0,shadow_frag:$0,sprite_vert:Q0,sprite_frag:j0},Lt={common:{diffuse:{value:new jt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new se},alphaMap:{value:null},alphaMapTransform:{value:new se},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new se}},envmap:{envMap:{value:null},envMapRotation:{value:new se},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new se}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new se}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new se},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new se},normalScale:{value:new _t(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new se},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new se}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new se}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new se}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new jt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new jt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new se},alphaTest:{value:0},uvTransform:{value:new se}},sprite:{diffuse:{value:new jt(16777215)},opacity:{value:1},center:{value:new _t(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new se},alphaMap:{value:null},alphaMapTransform:{value:new se},alphaTest:{value:0}}},zn={basic:{uniforms:ln([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.fog]),vertexShader:me.meshbasic_vert,fragmentShader:me.meshbasic_frag},lambert:{uniforms:ln([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},envMapIntensity:{value:1}}]),vertexShader:me.meshlambert_vert,fragmentShader:me.meshlambert_frag},phong:{uniforms:ln([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},specular:{value:new jt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:me.meshphong_vert,fragmentShader:me.meshphong_frag},standard:{uniforms:ln([Lt.common,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.roughnessmap,Lt.metalnessmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:me.meshphysical_vert,fragmentShader:me.meshphysical_frag},toon:{uniforms:ln([Lt.common,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.gradientmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)}}]),vertexShader:me.meshtoon_vert,fragmentShader:me.meshtoon_frag},matcap:{uniforms:ln([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,{matcap:{value:null}}]),vertexShader:me.meshmatcap_vert,fragmentShader:me.meshmatcap_frag},points:{uniforms:ln([Lt.points,Lt.fog]),vertexShader:me.points_vert,fragmentShader:me.points_frag},dashed:{uniforms:ln([Lt.common,Lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:me.linedashed_vert,fragmentShader:me.linedashed_frag},depth:{uniforms:ln([Lt.common,Lt.displacementmap]),vertexShader:me.depth_vert,fragmentShader:me.depth_frag},normal:{uniforms:ln([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,{opacity:{value:1}}]),vertexShader:me.meshnormal_vert,fragmentShader:me.meshnormal_frag},sprite:{uniforms:ln([Lt.sprite,Lt.fog]),vertexShader:me.sprite_vert,fragmentShader:me.sprite_frag},background:{uniforms:{uvTransform:{value:new se},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:me.background_vert,fragmentShader:me.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new se}},vertexShader:me.backgroundCube_vert,fragmentShader:me.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:me.cube_vert,fragmentShader:me.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:me.equirect_vert,fragmentShader:me.equirect_frag},distance:{uniforms:ln([Lt.common,Lt.displacementmap,{referencePosition:{value:new T},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:me.distance_vert,fragmentShader:me.distance_frag},shadow:{uniforms:ln([Lt.lights,Lt.fog,{color:{value:new jt(0)},opacity:{value:1}}]),vertexShader:me.shadow_vert,fragmentShader:me.shadow_frag}};zn.physical={uniforms:ln([zn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new se},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new se},clearcoatNormalScale:{value:new _t(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new se},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new se},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new se},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new se},sheen:{value:0},sheenColor:{value:new jt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new se},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new se},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new se},transmissionSamplerSize:{value:new _t},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new se},attenuationDistance:{value:0},attenuationColor:{value:new jt(0)},specularColor:{value:new jt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new se},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new se},anisotropyVector:{value:new _t},anisotropyMap:{value:null},anisotropyMapTransform:{value:new se}}]),vertexShader:me.meshphysical_vert,fragmentShader:me.meshphysical_frag};const Ar={r:0,b:0,g:0},tg=new re,Su=new se;Su.set(-1,0,0,0,1,0,0,0,1);function eg(i,t,e,n,s,r){const o=new jt(0);let a=s===!0?0:1,l,h,d=null,f=0,c=null;function u(x){let y=x.isScene===!0?x.background:null;if(y&&y.isTexture){const M=x.backgroundBlurriness>0;y=t.get(y,M)}return y}function p(x){let y=!1;const M=u(x);M===null?m(o,a):M&&M.isColor&&(m(M,1),y=!0);const A=i.xr.getEnvironmentBlendMode();A==="additive"?e.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||y)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function _(x,y){const M=u(y);M&&M.isCubeTexture?(h===void 0&&(h=new Ce(new qn(1,1,1),new Fi({name:"BackgroundCubeMaterial",uniforms:_s(zn.backgroundCube.uniforms),vertexShader:zn.backgroundCube.vertexShader,fragmentShader:zn.backgroundCube.fragmentShader,side:cn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,b,v){this.matrixWorld.copyPosition(v.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(h)),h.material.uniforms.envMap.value=M,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(tg.makeRotationFromEuler(y.backgroundRotation)).transpose(),M.isRenderTargetTexture===!1&&h.material.uniforms.backgroundRotation.value.premultiply(Su),h.material.toneMapped=Me.getTransfer(M.colorSpace)!==Te,(d!==M||f!==M.version||c!==i.toneMapping)&&(h.material.needsUpdate=!0,d=M,f=M.version,c=i.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new Ce(new so(2,2),new Fi({name:"BackgroundMaterial",uniforms:_s(zn.background.uniforms),vertexShader:zn.background.vertexShader,fragmentShader:zn.background.fragmentShader,side:Ni,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,l.material.toneMapped=Me.getTransfer(M.colorSpace)!==Te,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(d!==M||f!==M.version||c!==i.toneMapping)&&(l.material.needsUpdate=!0,d=M,f=M.version,c=i.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function m(x,y){x.getRGB(Ar,gu(i)),e.buffers.color.setClear(Ar.r,Ar.g,Ar.b,y,r)}function g(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,y=1){o.set(x),a=y,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,m(o,a)},render:p,addToRenderList:_,dispose:g}}function ng(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=c(null);let r=s,o=!1;function a(L,U,V,N,z){let k=!1;const G=f(L,N,V,U);r!==G&&(r=G,h(r.object)),k=u(L,N,V,z),k&&p(L,N,V,z),z!==null&&t.update(z,i.ELEMENT_ARRAY_BUFFER),(k||o)&&(o=!1,M(L,U,V,N),z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(z).buffer))}function l(){return i.createVertexArray()}function h(L){return i.bindVertexArray(L)}function d(L){return i.deleteVertexArray(L)}function f(L,U,V,N){const z=N.wireframe===!0;let k=n[U.id];k===void 0&&(k={},n[U.id]=k);const G=L.isInstancedMesh===!0?L.id:0;let st=k[G];st===void 0&&(st={},k[G]=st);let C=st[V.id];C===void 0&&(C={},st[V.id]=C);let B=C[z];return B===void 0&&(B=c(l()),C[z]=B),B}function c(L){const U=[],V=[],N=[];for(let z=0;z<e;z++)U[z]=0,V[z]=0,N[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:V,attributeDivisors:N,object:L,attributes:{},index:null}}function u(L,U,V,N){const z=r.attributes,k=U.attributes;let G=0;const st=V.getAttributes();for(const C in st)if(st[C].location>=0){const W=z[C];let ot=k[C];if(ot===void 0&&(C==="instanceMatrix"&&L.instanceMatrix&&(ot=L.instanceMatrix),C==="instanceColor"&&L.instanceColor&&(ot=L.instanceColor)),W===void 0||W.attribute!==ot||ot&&W.data!==ot.data)return!0;G++}return r.attributesNum!==G||r.index!==N}function p(L,U,V,N){const z={},k=U.attributes;let G=0;const st=V.getAttributes();for(const C in st)if(st[C].location>=0){let W=k[C];W===void 0&&(C==="instanceMatrix"&&L.instanceMatrix&&(W=L.instanceMatrix),C==="instanceColor"&&L.instanceColor&&(W=L.instanceColor));const ot={};ot.attribute=W,W&&W.data&&(ot.data=W.data),z[C]=ot,G++}r.attributes=z,r.attributesNum=G,r.index=N}function _(){const L=r.newAttributes;for(let U=0,V=L.length;U<V;U++)L[U]=0}function m(L){g(L,0)}function g(L,U){const V=r.newAttributes,N=r.enabledAttributes,z=r.attributeDivisors;V[L]=1,N[L]===0&&(i.enableVertexAttribArray(L),N[L]=1),z[L]!==U&&(i.vertexAttribDivisor(L,U),z[L]=U)}function x(){const L=r.newAttributes,U=r.enabledAttributes;for(let V=0,N=U.length;V<N;V++)U[V]!==L[V]&&(i.disableVertexAttribArray(V),U[V]=0)}function y(L,U,V,N,z,k,G){G===!0?i.vertexAttribIPointer(L,U,V,z,k):i.vertexAttribPointer(L,U,V,N,z,k)}function M(L,U,V,N){_();const z=N.attributes,k=V.getAttributes(),G=U.defaultAttributeValues;for(const st in k){const C=k[st];if(C.location>=0){let B=z[st];if(B===void 0&&(st==="instanceMatrix"&&L.instanceMatrix&&(B=L.instanceMatrix),st==="instanceColor"&&L.instanceColor&&(B=L.instanceColor)),B!==void 0){const W=B.normalized,ot=B.itemSize,yt=t.get(B);if(yt===void 0)continue;const J=yt.buffer,rt=yt.type,bt=yt.bytesPerElement,Nt=rt===i.INT||rt===i.UNSIGNED_INT||B.gpuType===ol;if(B.isInterleavedBufferAttribute){const ct=B.data,Ct=ct.isInterleavedBuffer===!0?ct.stride:ct.itemSize,Vt=B.offset;if(ct.isInstancedInterleavedBuffer||ct.isInstancedBufferAttribute){for(let Bt=0;Bt<C.locationSize;Bt++)g(C.location+Bt,ct.meshPerAttribute);L.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=ct.meshPerAttribute*ct.count)}else for(let Bt=0;Bt<C.locationSize;Bt++)m(C.location+Bt);i.bindBuffer(i.ARRAY_BUFFER,J);for(let Bt=0;Bt<C.locationSize;Bt++)y(C.location+Bt,ot/C.locationSize,rt,W,Ct*bt,(Vt+ot/C.locationSize*Bt)*bt,Nt)}else{if(B.isInstancedBufferAttribute){for(let ct=0;ct<C.locationSize;ct++)g(C.location+ct,B.meshPerAttribute);L.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=B.meshPerAttribute*B.count)}else for(let ct=0;ct<C.locationSize;ct++)m(C.location+ct);i.bindBuffer(i.ARRAY_BUFFER,J);for(let ct=0;ct<C.locationSize;ct++)y(C.location+ct,ot/C.locationSize,rt,W,ot*bt,ot/C.locationSize*ct*bt,Nt)}}else if(G!==void 0){const W=G[st];if(W!==void 0)switch(W.length){case 2:i.vertexAttrib2fv(C.location,W);break;case 3:i.vertexAttrib3fv(C.location,W);break;case 4:i.vertexAttrib4fv(C.location,W);break;default:i.vertexAttrib1fv(C.location,W)}}}}x()}function A(){D();for(const L in n){const U=n[L];for(const V in U){const N=U[V];for(const z in N){const k=N[z];for(const G in k)d(k[G].object),delete k[G];delete N[z]}}delete n[L]}}function b(L){if(n[L.id]===void 0)return;const U=n[L.id];for(const V in U){const N=U[V];for(const z in N){const k=N[z];for(const G in k)d(k[G].object),delete k[G];delete N[z]}}delete n[L.id]}function v(L){for(const U in n){const V=n[U];for(const N in V){const z=V[N];if(z[L.id]===void 0)continue;const k=z[L.id];for(const G in k)d(k[G].object),delete k[G];delete z[L.id]}}}function E(L){for(const U in n){const V=n[U],N=L.isInstancedMesh===!0?L.id:0,z=V[N];if(z!==void 0){for(const k in z){const G=z[k];for(const st in G)d(G[st].object),delete G[st];delete z[k]}delete V[N],Object.keys(V).length===0&&delete n[U]}}}function D(){P(),o=!0,r!==s&&(r=s,h(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:D,resetDefaultState:P,dispose:A,releaseStatesOfGeometry:b,releaseStatesOfObject:E,releaseStatesOfProgram:v,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function ig(i,t,e){let n;function s(l){n=l}function r(l,h){i.drawArrays(n,l,h),e.update(h,n,1)}function o(l,h,d){d!==0&&(i.drawArraysInstanced(n,l,h,d),e.update(h,n,d))}function a(l,h,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,d);let c=0;for(let u=0;u<d;u++)c+=h[u];e.update(c,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function sg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const v=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(v.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(v){return!(v!==Hn&&n.convert(v)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(v){const E=v===Yn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(v!==Mn&&v!==Dn&&!E&&n.convert(v)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(v){if(v==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";v="mediump"}return v==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=e.precision!==void 0?e.precision:"highp";const d=l(h);d!==h&&($t("WebGLRenderer:",h,"not supported, using",d,"instead."),h=d);const f=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),c=e.logarithmicDepthBuffer===!0&&f===!1;e.reversedDepthBuffer===!0&&f===!1&&$t("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),e.logarithmicDepthBuffer===!0&&f===!0&&$t("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const u=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=i.getParameter(i.MAX_SAMPLES),b=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:h,logarithmicDepthBuffer:c,reversedDepthBuffer:f,maxTextures:u,maxVertexTextures:p,maxTextureSize:_,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:x,maxVaryings:y,maxFragmentUniforms:M,maxSamples:A,samples:b}}function rg(i){const t=this;let e=null,n=0,s=!1,r=!1;const o=new Bn,a=new se,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,c){const u=f.length!==0||c||n!==0||s;return s=c,n=f.length,u},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,c){e=d(f,c,0)},this.setState=function(f,c,u){const p=f.clippingPlanes,_=f.clipIntersection,m=f.clipShadows,g=i.get(f);if(!s||p===null||p.length===0||r&&!m)r?d(null):h();else{const x=r?0:n,y=x*4;let M=g.clippingState||null;l.value=M,M=d(p,c,y,u);for(let A=0;A!==y;++A)M[A]=e[A];g.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function h(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function d(f,c,u,p){const _=f!==null?f.length:0;let m=null;if(_!==0){if(m=l.value,p!==!0||m===null){const g=u+_*4,x=c.matrixWorldInverse;a.getNormalMatrix(x),(m===null||m.length<g)&&(m=new Float32Array(g));for(let y=0,M=u;y!==_;++y,M+=4)o.copy(f[y]).applyMatrix4(x,a),o.normal.toArray(m,M),m[M+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}class Cl extends Wn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new su(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new qn(5,5,5),r=new Fi({name:"CubemapFromEquirect",uniforms:_s(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:cn,blending:as});r.uniforms.tEquirect.value=e;const o=new Ce(s,r),a=e.minFilter;return e.minFilter===vi&&(e.minFilter=pn),new Ga(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}}const Bc=256,og=3,ag=20,yu=256,Eu=16,lg=3,cg=new T,hg=new jt;class Ks{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Ga(1,10,null),this._boxMesh=new Ce(new qn(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){const{size:o=256,position:a=cg}=r,l=this._renderer;this._setSize(o);const h=this._allocateTarget(),d=this._getSourceTarget(!0);e>0&&(d.texture.mipmapsAutoUpdate=!1);const f=l.autoClear,c=l.autoClearColor,u=l.autoClearDepth,p=l.autoClearStencil,_=t.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,_===null&&(t.background=l.getClearColor(hg));const m=new Ga(n,s,d);return m.position.copy(a),m.update(l,t),l.autoClear=f,l.autoClearColor=c,l.autoClearDepth=u,l.autoClearStencil=p,t.background=_,e>0&&(d.texture.mipmapsAutoUpdate=!0,this._blur(h,e)),this._applyPMREM(h),h}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Hc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(Bc,$f(t))}_fromTexture(t,e){t.mapping===ds||t.mapping===Gs?this._setSize(t.image.length===0?Bc:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4);const n=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(n),n}_allocateTarget(){const t=this._cubeSize,e=zc(t,!1,!1),n=Math.log2(t)-og;for(let s=0;s<=n;s++)e.texture.mipmaps.push({width:t>>s,height:t>>s});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){const e=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==e||t&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=zc(e,!0,t)),this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,n){const s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=t,r.activeMipmapLevel=e;const o=t.width>>e;t.viewport.set(0,0,o,o),r.update(this._renderer,s),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;t.mapping===ds||t.mapping===Gs?(this._cubemapMaterial===null&&(this._cubemapMaterial=kc()),e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Hc()),e=this._equirectMaterial),e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=ug(),this._integrationMaterial=fg());const e=this._cubeSize,n=t.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;const r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(e/Eu);for(let o=0;o<=n;o++){const a=Ks.lodToRoughness(o,n);if(o>n-lg)r.roughness.value=a,this._renderCube(t,o,this._integrationMaterial);else{const l=a>0?Math.log2(e)+.5*Math.log2(6/(yu*Math.pow(a,4)))+.5:0;s.roughness.value=a,s.lodBias.value=l,this._renderCube(t,o,this._ggxMaterial)}}}_blur(t,e){this._blurMaterial===null&&(this._blurMaterial=dg());const n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(t,0,n),s.envMap.value=t.texture,this._renderCube(r,0,n)}}function zc(i,t,e){return new Cl(i,{minFilter:vi,generateMipmaps:t,type:Yn,colorSpace:Xr,depthBuffer:e})}function Qs(i,t,e){return new Fi({name:i,uniforms:t,vertexShader:me.cube_vert,fragmentShader:e,side:cn,blending:as,depthTest:!1,depthWrite:!1})}function ug(){return Qs("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${yu}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function fg(){return Qs("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Eu}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function dg(){return Qs("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${ag}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Hc(){return Qs("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function kc(){return Qs("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function pg(i){let t=new WeakMap,e=new WeakMap,n=null;function s(c,u=!1){return c==null?null:u?o(c):r(c)}function r(c){if(c&&c.isTexture){const u=c.mapping;if(u===uo||u===fo)if(t.has(c)){const p=t.get(c).texture;return a(p,c.mapping)}else{const p=c.image;if(p&&p.height>0){const _=new Cl(p.height);return _.fromEquirectangularTexture(i,c),t.set(c,_),c.addEventListener("dispose",h),a(_.texture,c.mapping)}else return null}}return c}function o(c){if(c&&c.isTexture&&c.isPMREMTexture!==!0){const u=c.mapping,p=u===uo||u===fo,_=u===ds||u===Gs;if(p||_){let m=e.get(c);const g=m!==void 0?m.texture.pmremVersion:0;if(c.isRenderTargetTexture&&c.pmremVersion!==g)return n===null&&(n=new Ks(i)),m=p?n.fromEquirectangular(c,m):n.fromCubemap(c,m),m.texture.pmremVersion=c.pmremVersion,e.set(c,m),m.texture;if(m!==void 0)return m.texture;{const x=c.image;return p&&x&&x.height>0||_&&x&&l(x)?(n===null&&(n=new Ks(i)),m=p?n.fromEquirectangular(c):n.fromCubemap(c),m.texture.pmremVersion=c.pmremVersion,e.set(c,m),c.addEventListener("dispose",d),m.texture):null}}}return c}function a(c,u){return u===uo?c.mapping=ds:u===fo&&(c.mapping=Gs),c}function l(c){let u=0;const p=6;for(let _=0;_<p;_++)c[_]!==void 0&&u++;return u===p}function h(c){const u=c.target;u.removeEventListener("dispose",h);const p=t.get(u);p!==void 0&&(t.delete(u),p.dispose())}function d(c){const u=c.target;u.removeEventListener("dispose",d);const p=e.get(u);p!==void 0&&(e.delete(u),p.dispose())}function f(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function mg(i){const t={};function e(n){if(t[n]!==void 0)return t[n];const s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&ls("WebGLRenderer: "+n+" extension not supported."),s}}}function gg(i,t,e,n){const s={},r=new WeakMap,o=new FinalizationRegistry(p=>delete s[p]);function a(p){l(p.target)}function l(p){p.index!==null&&t.remove(p.index);for(const m in p.attributes)t.remove(p.attributes[m]);p.removeEventListener("dispose",a),delete s[p.id],o.unregister(p);const _=r.get(p);_&&(t.remove(_),r.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,e.memory.geometries--}function h(p,_){return s[_.id]!==void 0||(_.addEventListener("dispose",a),s[_.id]=new WeakRef(_),o.register(_,_.id,_),e.memory.geometries++),_}function d(p){const _=p.attributes;for(const m in _)t.update(_[m],i.ARRAY_BUFFER)}function f(p){const _=p.index,m=p.attributes.position;let g=0;if(m===void 0)return;const x=_!==null?_.array.length:m.array.length/3-1,y=m.count>=65535?nu:eu,M=new y(Math.ceil(x/3)*6,1),A=M.array;if(_!==null){const v=_.array;g=_.version;for(let E=0,D=0;E<x;E+=3){const P=v[E+0],L=v[E+1],U=v[E+2];A[D++]=P,A[D++]=L,A[D++]=L,A[D++]=U,A[D++]=U,A[D++]=P}}else{g=m.version;for(let v=0,E=0;v<x;v+=3){const D=v+0,P=v+1,L=v+2;A[E++]=D,A[E++]=P,A[E++]=P,A[E++]=L,A[E++]=L,A[E++]=D}}M.version=g;const b=r.get(p);b&&t.remove(b),r.set(p,M)}function c(p){const _=r.get(p);if(_){const m=p.index;m!==null&&_.version<m.version&&f(p)}else f(p);return r.get(p)}function u(){for(const p in s){const _=s[p].deref();_!==void 0&&l(_)}}return{get:h,update:d,getWireframeAttribute:c,dispose:u}}function _g(i,t,e){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,c){i.drawElements(n,c,r,f*o),e.update(c,n,1)}function h(f,c,u){u!==0&&(i.drawElementsInstanced(n,c,r,f*o,u),e.update(c,n,u))}function d(f,c,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,c,0,r,f,0,u);let _=0;for(let m=0;m<u;m++)_+=c[m];e.update(_,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=h,this.renderMultiDraw=d}function xg(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:Ee("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function vg(i,t,e){const n=new WeakMap,s=new Fe;function r(o,a,l){const h=o.morphTargetInfluences,d=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=d!==void 0?d.length:0;let c=n.get(a);if(c===void 0||c.count!==f){let D=function(){v.dispose(),n.delete(a),a.removeEventListener("dispose",D)};c!==void 0&&c.texture.dispose();const u=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],x=a.morphAttributes.color||[];let y=0;u===!0&&(y=1),p===!0&&(y=2),_===!0&&(y=3);let M=a.attributes.position.count*y,A=1;M>t.maxTextureSize&&(A=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);const b=new Float32Array(M*A*4*f),v=new Qh(b,M,A,f);v.type=Dn,v.needsUpdate=!0;const E=y*4;for(let P=0;P<f;P++){const L=m[P],U=g[P],V=x[P],N=M*A*4*P;for(let z=0;z<L.count;z++){const k=z*E;u===!0&&(s.fromBufferAttribute(L,z),b[N+k+0]=s.x,b[N+k+1]=s.y,b[N+k+2]=s.z,b[N+k+3]=0),p===!0&&(s.fromBufferAttribute(U,z),b[N+k+4]=s.x,b[N+k+5]=s.y,b[N+k+6]=s.z,b[N+k+7]=0),_===!0&&(s.fromBufferAttribute(V,z),b[N+k+8]=s.x,b[N+k+9]=s.y,b[N+k+10]=s.z,b[N+k+11]=V.itemSize===4?s.w:1)}}c={count:f,texture:v,size:new _t(M,A)},n.set(a,c),a.addEventListener("dispose",D)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let u=0;for(let _=0;_<h.length;_++)u+=h[_];const p=a.morphTargetsRelative?1:1-u;l.getUniforms().setValue(i,"morphTargetBaseInfluence",p),l.getUniforms().setValue(i,"morphTargetInfluences",h)}l.getUniforms().setValue(i,"morphTargetsTexture",c.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",c.size)}return{update:r}}function Mg(i,t,e,n,s){let r=new WeakMap;function o(h){const d=s.render.frame,f=h.geometry,c=t.get(h,f);if(r.get(c)!==d&&(t.update(c),r.set(c,d)),h.isInstancedMesh&&(h.hasEventListener("dispose",l)===!1&&h.addEventListener("dispose",l),r.get(h)!==d&&(e.update(h.instanceMatrix,i.ARRAY_BUFFER),h.instanceColor!==null&&e.update(h.instanceColor,i.ARRAY_BUFFER),r.set(h,d))),h.isSkinnedMesh){const u=h.skeleton;r.get(u)!==d&&(u.update(),r.set(u,d))}return c}function a(){r=new WeakMap}function l(h){const d=h.target;d.removeEventListener("dispose",l),n.releaseStatesOfObject(d),e.remove(d.instanceMatrix),d.instanceColor!==null&&e.remove(d.instanceColor)}return{update:o,dispose:a}}const Sg={[Uh]:"LINEAR_TONE_MAPPING",[Oh]:"REINHARD_TONE_MAPPING",[Fh]:"CINEON_TONE_MAPPING",[Bh]:"ACES_FILMIC_TONE_MAPPING",[Hh]:"AGX_TONE_MAPPING",[rl]:"NEUTRAL_TONE_MAPPING",[zh]:"CUSTOM_TONE_MAPPING"};function yg(i,t,e,n,s,r){const o=new Wn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let a=null,l=null,h=null;const d=new Le;d.setAttribute("position",new ue([-1,3,0,-1,-1,0,3,-1,0],3)),d.setAttribute("uv",new ue([0,2,0,0,2,0],2));const f=new ap({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new Ce(d,f),u=new vu(-1,1,1,-1,0,1);let p=null,_=null,m=!1,g,x=null,y=[],M=!1;this.setSize=function(A,b){o.setSize(A,b),a!==null&&a.setSize(A,b),l!==null&&l.setSize(A,b);for(let v=0;v<y.length;v++){const E=y[v];E.setSize&&E.setSize(A,b)}},this.setEffects=function(A){y=A,M=y.length>0&&y[0].isRenderPass===!0;const b=o.width,v=o.height;y.length>0&&a===null&&(a=new Wn(b,v,{type:Yn,depthBuffer:!1,stencilBuffer:!1}),l=new Wn(b,v,{type:Yn,depthBuffer:!1,stencilBuffer:!1}));const E=s===!0&&y.some(D=>D.needsDepthTexture===!0);E!==(o.depthTexture!==null)&&(E===!0&&h===null&&(h=new ms(b,v),r===!0&&(h.format=Mi,h.type=ps)),o.dispose(),o.depthTexture=E?h:null,o.resolveDepthBuffer=E,o.storeMultisampledDepthBuffer=E);for(let D=0;D<y.length;D++){const P=y[D];P.setSize&&P.setSize(b,v),E&&P.needsDepthTexture===!0&&P.setDepthTexture&&P.setDepthTexture(h)}},this.begin=function(A,b){if(m||A.toneMapping===ri&&y.length===0)return!1;if(x=b,b!==null){const v=b.width,E=b.height;(o.width!==v||o.height!==E)&&this.setSize(v,E)}return M===!1&&A.setRenderTarget(o),g=A.toneMapping,A.toneMapping=ri,!0},this.hasRenderPass=function(){return M},this.end=function(A,b){A.toneMapping=g,m=!0;let v=o,E=a;for(let D=0;D<y.length;D++){const P=y[D];P.enabled!==!1&&(P.render(A,E,v,b),P.needsSwap!==!1&&(v=E,E=E===a?l:a))}if(p!==A.outputColorSpace||_!==A.toneMapping){p=A.outputColorSpace,_=A.toneMapping,f.defines={},Me.getTransfer(p)===Te&&(f.defines.SRGB_TRANSFER="");const D=Sg[_];D&&(f.defines[D]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=v.texture,A.setRenderTarget(x),A.render(c,u),x=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),d.dispose(),f.dispose()}}const bu=new hn,wu=new ms(1,1),Tu=new ru(1),Au=new Qh,Ru=new od,Cu=new su,Gc=[],Vc=[],Wc=new Float32Array(16),Xc=new Float32Array(9),Yc=new Float32Array(4);function Ms(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=Gc[s];if(r===void 0&&(r=new Float32Array(s),Gc[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function qe(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ze(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function ro(i,t){let e=Vc[t];e===void 0&&(e=new Int32Array(t),Vc[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Eg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function bg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(qe(e,t))return;i.uniform2fv(this.addr,t),Ze(e,t)}}function wg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(qe(e,t))return;i.uniform3fv(this.addr,t),Ze(e,t)}}function Tg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(qe(e,t))return;i.uniform4fv(this.addr,t),Ze(e,t)}}function Ag(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(qe(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ze(e,t)}else{if(qe(e,n))return;Yc.set(n),i.uniformMatrix2fv(this.addr,!1,Yc),Ze(e,n)}}function Rg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(qe(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ze(e,t)}else{if(qe(e,n))return;Xc.set(n),i.uniformMatrix3fv(this.addr,!1,Xc),Ze(e,n)}}function Cg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(qe(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ze(e,t)}else{if(qe(e,n))return;Wc.set(n),i.uniformMatrix4fv(this.addr,!1,Wc),Ze(e,n)}}function Pg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Lg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(qe(e,t))return;i.uniform2iv(this.addr,t),Ze(e,t)}}function Dg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(qe(e,t))return;i.uniform3iv(this.addr,t),Ze(e,t)}}function Ig(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(qe(e,t))return;i.uniform4iv(this.addr,t),Ze(e,t)}}function Ng(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Ug(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(qe(e,t))return;i.uniform2uiv(this.addr,t),Ze(e,t)}}function Og(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(qe(e,t))return;i.uniform3uiv(this.addr,t),Ze(e,t)}}function Fg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(qe(e,t))return;i.uniform4uiv(this.addr,t),Ze(e,t)}}function oo(i){return i.version===0&&(i.compareFunction=Jh,i.needsUpdate=!0),i}function Bg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=oo(wu):r=bu,e.setTexture2D(t||r,s)}function zg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Ru,s)}function Hg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=oo(Tu):r=Cu,e.setTextureCube(t||r,s)}function kg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Au,s)}function Gg(i){switch(i){case 5126:return Eg;case 35664:return bg;case 35665:return wg;case 35666:return Tg;case 35674:return Ag;case 35675:return Rg;case 35676:return Cg;case 5124:case 35670:return Pg;case 35667:case 35671:return Lg;case 35668:case 35672:return Dg;case 35669:case 35673:return Ig;case 5125:return Ng;case 36294:return Ug;case 36295:return Og;case 36296:return Fg;case 35678:case 36198:case 36298:case 36306:case 35682:return Bg;case 35679:case 36299:case 36307:return zg;case 35680:case 36300:case 36308:case 36293:return Hg;case 36289:case 36303:case 36311:case 36292:return kg}}function Vg(i,t){i.uniform1fv(this.addr,t)}function Wg(i,t){const e=Ms(t,this.size,2);i.uniform2fv(this.addr,e)}function Xg(i,t){const e=Ms(t,this.size,3);i.uniform3fv(this.addr,e)}function Yg(i,t){const e=Ms(t,this.size,4);i.uniform4fv(this.addr,e)}function qg(i,t){const e=Ms(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function Zg(i,t){const e=Ms(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Kg(i,t){const e=Ms(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function Jg(i,t){i.uniform1iv(this.addr,t)}function $g(i,t){i.uniform2iv(this.addr,t)}function Qg(i,t){i.uniform3iv(this.addr,t)}function jg(i,t){i.uniform4iv(this.addr,t)}function t_(i,t){i.uniform1uiv(this.addr,t)}function e_(i,t){i.uniform2uiv(this.addr,t)}function n_(i,t){i.uniform3uiv(this.addr,t)}function i_(i,t){i.uniform4uiv(this.addr,t)}function s_(i,t,e){const n=this.cache,s=t.length,r=ro(e,s);qe(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=oo(wu):o=bu;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function r_(i,t,e){const n=this.cache,s=t.length,r=ro(e,s);qe(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Ru,r[o])}function o_(i,t,e){const n=this.cache,s=t.length,r=ro(e,s);qe(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));let o;this.type===i.SAMPLER_CUBE_SHADOW?o=oo(Tu):o=Cu;for(let a=0;a!==s;++a)e.setTextureCube(t[a]||o,r[a])}function a_(i,t,e){const n=this.cache,s=t.length,r=ro(e,s);qe(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Au,r[o])}function l_(i){switch(i){case 5126:return Vg;case 35664:return Wg;case 35665:return Xg;case 35666:return Yg;case 35674:return qg;case 35675:return Zg;case 35676:return Kg;case 5124:case 35670:return Jg;case 35667:case 35671:return $g;case 35668:case 35672:return Qg;case 35669:case 35673:return jg;case 5125:return t_;case 36294:return e_;case 36295:return n_;case 36296:return i_;case 35678:case 36198:case 36298:case 36306:case 35682:return s_;case 35679:case 36299:case 36307:return r_;case 35680:case 36300:case 36308:case 36293:return o_;case 36289:case 36303:case 36311:case 36292:return a_}}class c_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Gg(e.type)}}class h_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=l_(e.type)}}class u_{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],n)}}}const Go=/(\w+)(\])?(\[|\.)?/g;function qc(i,t){i.seq.push(t),i.map[t.id]=t}function f_(i,t,e){const n=i.name,s=n.length;for(Go.lastIndex=0;;){const r=Go.exec(n),o=Go.lastIndex;let a=r[1];const l=r[2]==="]",h=r[3];if(l&&(a=a|0),h===void 0||h==="["&&o+2===s){qc(e,h===void 0?new c_(a,i,t):new h_(a,i,t));break}else{let f=e.map[a];f===void 0&&(f=new u_(a),qc(e,f)),e=f}}}class Fr{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){const a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);f_(a,l,this)}const s=[],r=[];for(const o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&n.push(o)}return n}}function Zc(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const d_=37297;let p_=0;function m_(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}const Kc=new se;function g_(i){Me._getMatrix(Kc,Me.workingColorSpace,i);const t=`mat3( ${Kc.elements.map(e=>e.toFixed(4))} )`;switch(Me.getTransfer(i)){case Yr:return[t,"LinearTransferOETF"];case Te:return[t,"sRGBTransferOETF"];default:return $t("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Jc(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+m_(i.getShaderSource(t),a)}else return r}function __(i,t){const e=g_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( ${e[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const x_={[Uh]:"Linear",[Oh]:"Reinhard",[Fh]:"Cineon",[Bh]:"ACESFilmic",[Hh]:"AgX",[rl]:"Neutral",[zh]:"Custom"};function v_(i,t){const e=x_[t];return e===void 0?($t("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Rr=new T;function M_(){Me.getLuminanceCoefficients(Rr);const i=Rr.x.toFixed(4),t=Rr.y.toFixed(4),e=Rr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function S_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ls).join(`
`)}function y_(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function E_(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Ls(i){return i!==""}function $c(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function Qc(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const b_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wa(i){return i.replace(b_,w_)}function w_(i,t){const e=me[t];if(e===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">");return Wa(e)}const T_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function jc(i){return i.replace(T_,A_)}function A_(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function th(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}const R_={[Os]:"SHADOWMAP_TYPE_PCF",[Cs]:"SHADOWMAP_TYPE_VSM"};function C_(i){return R_[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const P_={[Gs]:"ENVMAP_MODE_REFRACTION"};function L_(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":P_[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const D_={[sl]:"ENVMAP_BLENDING_MULTIPLY",[Nf]:"ENVMAP_BLENDING_MIX",[Uf]:"ENVMAP_BLENDING_ADD"};function I_(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":D_[i.combine]||"ENVMAP_BLENDING_NONE"}function N_(i,t,e,n){const s=i.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=C_(e),h=e.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",d=L_(e),f=I_(e),c=S_(e),u=y_(r),p=s.createProgram();let _,m,g=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(_=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u].filter(Ls).join(`
`),_.length>0&&(_+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u].filter(Ls).join(`
`),m.length>0&&(m+=`
`)):(_=[th(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+d:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+e.diffuseRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ls).join(`
`),m=[th(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",e.envMap?"#define "+f:"",e.envMapPMREM?"#define ENVMAP_MAX_LOD "+e.envMapMaxLod+".0":"",e.envMapPMREM?"#define ENVMAP_SIZE "+e.envMapSize+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ri?"#define TONE_MAPPING":"",e.toneMapping!==ri?me.tonemapping_pars_fragment:"",e.toneMapping!==ri?v_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",me.colorspace_pars_fragment,__("linearToOutputTexel",e.outputColorSpace),M_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ls).join(`
`)),o=Wa(o),o=$c(o,e),o=Qc(o,e),a=Wa(a),a=$c(a,e),a=Qc(a,e),o=jc(o),a=jc(a),e.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,_=[c,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,m=["#define varying in",e.glslVersion===$l?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===$l?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const x=g+_+o,y=g+m+a,M=Zc(s,s.VERTEX_SHADER,x),A=Zc(s,s.FRAGMENT_SHADER,y);s.attachShader(p,M),s.attachShader(p,A),e.index0AttributeName!==void 0?s.bindAttribLocation(p,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(p,0,"position"),s.linkProgram(p);function b(P){if(i.debug.checkShaderErrors){const L=s.getProgramInfoLog(p)||"",U=s.getShaderInfoLog(M)||"",V=s.getShaderInfoLog(A)||"",N=L.trim(),z=U.trim(),k=V.trim();let G=!0,st=!0;if(s.getProgramParameter(p,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,p,M,A);else{const C=Jc(s,M,"vertex"),B=Jc(s,A,"fragment");Ee("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(p,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+N+`
`+C+`
`+B)}else N!==""?$t("WebGLProgram: Program Info Log:",N):(z===""||k==="")&&(st=!1);st&&(P.diagnostics={runnable:G,programLog:N,vertexShader:{log:z,prefix:_},fragmentShader:{log:k,prefix:m}})}s.deleteShader(M),s.deleteShader(A),v=new Fr(s,p),E=E_(s,p)}let v;this.getUniforms=function(){return v===void 0&&b(this),v};let E;this.getAttributes=function(){return E===void 0&&b(this),E};let D=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=s.getProgramParameter(p,d_)),D},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(p),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=p_++,this.cacheKey=t,this.usedTimes=1,this.program=p,this.vertexShader=M,this.fragmentShader=A,this}let U_=0;class O_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){const s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new F_(t),e.set(t,n)),n}}class F_{constructor(t){this.id=U_++,this.code=t,this.usedTimes=0}}function B_(i){return i===Ui||i===Gr||i===Vr}function z_(i,t,e,n,s,r){const o=new ml,a=new O_,l=new Set,h=[],d=new Map,f=n.logarithmicDepthBuffer,c={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function u(v){return l.add(v),v===0?"uv":`uv${v}`}function p(v,E,D,P,L,U){const V=P.fog,N=L.geometry,z=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?P.environment:null,k=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,G=t.get(v.envMap||z,k),st=c[v.type];let C=n.precision;v.precision!==null&&(C=n.getMaxPrecision(v.precision),C!==v.precision&&$t("WebGLProgram.getParameters:",v.precision,"not supported, using",C,"instead."));const B=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,W=B!==void 0?B.length:0;let ot=0;N.morphAttributes.position!==void 0&&(ot=1),N.morphAttributes.normal!==void 0&&(ot=2),N.morphAttributes.color!==void 0&&(ot=3);let yt,J,rt,bt;if(st){const ft=zn[st];yt=ft.vertexShader,J=ft.fragmentShader}else{yt=v.vertexShader,J=v.fragmentShader;const ft=a.getVertexShaderStage(v),qt=a.getFragmentShaderStage(v);a.update(v,ft,qt),rt=ft.id,bt=qt.id}const Nt=i.getRenderTarget(),ct=i.state.buffers.depth.getReversed(),Ct=L.isInstancedMesh===!0,Vt=L.isBatchedMesh===!0,Bt=!!v.map,Xt=!!v.matcap,Zt=!!G,tt=Zt&&G.isPMREMTexture===!0,dt=!!v.aoMap,xt=!!v.lightMap,At=!!v.bumpMap&&v.wireframe===!1,Et=!!v.normalMap,Jt=!!v.displacementMap,zt=!!v.emissiveMap,Qt=!!v.metalnessMap,he=!!v.roughnessMap,fe=v.anisotropy>0,F=v.clearcoat>0,Ie=v.diffuseRoughness>0,oe=v.dispersion>0,we=v.retroreflectivity>0,Z=v.iridescence>0,lt=v.sheen>0,at=v.transmission>0,Dt=fe&&!!v.anisotropyMap,R=F&&!!v.clearcoatMap,S=F&&!!v.clearcoatNormalMap,H=F&&!!v.clearcoatRoughnessMap,nt=Ie&&!!v.diffuseRoughnessMap,q=Z&&!!v.iridescenceMap,ht=Z&&!!v.iridescenceThicknessMap,vt=lt&&!!v.sheenColorMap,Q=lt&&!!v.sheenRoughnessMap,et=!!v.specularMap,Mt=!!v.specularColorMap,I=!!v.specularIntensityMap,j=at&&!!v.transmissionMap,K=at&&!!v.thicknessMap,mt=!!v.gradientMap,pt=!!v.alphaMap,St=v.alphaTest>0,Ut=!!v.alphaHash,Yt=!!v.extensions;let gt=ri;v.toneMapped&&(Nt===null||Nt.isXRRenderTarget===!0)&&(gt=i.toneMapping);const ut=tt?G.isCompressedCubeTexture?G.image[0].mipmaps:G.mipmaps:null,Pt={shaderID:st,shaderType:v.type,shaderName:v.name,vertexShader:yt,fragmentShader:J,defines:v.defines,customVertexShaderID:rt,customFragmentShaderID:bt,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:C,batching:Vt,batchingColor:Vt&&L._colorsTexture!==null,instancing:Ct,instancingColor:Ct&&L.instanceColor!==null,instancingMorph:Ct&&L.morphTexture!==null,outputColorSpace:Nt===null?i.outputColorSpace:Nt.isXRRenderTarget===!0?Nt.texture.colorSpace:Me.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:Bt,matcap:Xt,envMap:Zt,envMapMode:Zt&&G.mapping,envMapPMREM:tt,envMapMaxLod:tt?ut.length-1:null,envMapSize:tt?ut[0].width:null,aoMap:dt,lightMap:xt,bumpMap:At,normalMap:Et,displacementMap:Jt,emissiveMap:zt,normalMapObjectSpace:Et&&v.normalMapType===Bf,normalMapTangentSpace:Et&&v.normalMapType===Wr,packedNormalMap:Et&&v.normalMapType===Wr&&B_(v.normalMap.format),metalnessMap:Qt,roughnessMap:he,anisotropy:fe,anisotropyMap:Dt,clearcoat:F,clearcoatMap:R,clearcoatNormalMap:S,clearcoatRoughnessMap:H,diffuseRoughness:Ie,diffuseRoughnessMap:nt,dispersion:oe,retroreflection:we,iridescence:Z,iridescenceMap:q,iridescenceThicknessMap:ht,sheen:lt,sheenColorMap:vt,sheenRoughnessMap:Q,specularMap:et,specularColorMap:Mt,specularIntensityMap:I,transmission:at,transmissionMap:j,thicknessMap:K,gradientMap:mt,opaque:v.transparent===!1&&v.blending===Fs&&v.alphaToCoverage===!1,alphaMap:pt,alphaTest:St,alphaHash:Ut,combine:v.combine,mapUv:Bt&&u(v.map.channel),aoMapUv:dt&&u(v.aoMap.channel),lightMapUv:xt&&u(v.lightMap.channel),bumpMapUv:At&&u(v.bumpMap.channel),normalMapUv:Et&&u(v.normalMap.channel),displacementMapUv:Jt&&u(v.displacementMap.channel),emissiveMapUv:zt&&u(v.emissiveMap.channel),metalnessMapUv:Qt&&u(v.metalnessMap.channel),roughnessMapUv:he&&u(v.roughnessMap.channel),anisotropyMapUv:Dt&&u(v.anisotropyMap.channel),clearcoatMapUv:R&&u(v.clearcoatMap.channel),clearcoatNormalMapUv:S&&u(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:H&&u(v.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:nt&&u(v.diffuseRoughnessMap.channel),iridescenceMapUv:q&&u(v.iridescenceMap.channel),iridescenceThicknessMapUv:ht&&u(v.iridescenceThicknessMap.channel),sheenColorMapUv:vt&&u(v.sheenColorMap.channel),sheenRoughnessMapUv:Q&&u(v.sheenRoughnessMap.channel),specularMapUv:et&&u(v.specularMap.channel),specularColorMapUv:Mt&&u(v.specularColorMap.channel),specularIntensityMapUv:I&&u(v.specularIntensityMap.channel),transmissionMapUv:j&&u(v.transmissionMap.channel),thicknessMapUv:K&&u(v.thicknessMap.channel),alphaMapUv:pt&&u(v.alphaMap.channel),vertexTangents:!!N.attributes.tangent&&(Et||fe),vertexNormals:!!N.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!N.attributes.uv&&(Bt||pt),fog:!!V,useFog:v.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||N.attributes.normal===void 0&&Et===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:ct,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:N.attributes.position!==void 0,morphTargets:N.morphAttributes.position!==void 0,morphNormals:N.morphAttributes.normal!==void 0,morphColors:N.morphAttributes.color!==void 0,morphTargetsCount:W,morphTextureStride:ot,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:U.filter(ft=>ft.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&D.length>0,shadowMapType:i.shadowMap.type,toneMapping:gt,decodeVideoTexture:Bt&&v.map.isVideoTexture===!0&&Me.getTransfer(v.map.colorSpace)===Te,decodeVideoTextureEmissive:zt&&v.emissiveMap.isVideoTexture===!0&&Me.getTransfer(v.emissiveMap.colorSpace)===Te,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Pn,flipSided:v.side===cn,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:Yt&&v.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Yt&&v.extensions.multiDraw===!0||Vt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Pt.vertexUv1s=l.has(1),Pt.vertexUv2s=l.has(2),Pt.vertexUv3s=l.has(3),l.clear(),Pt}function _(v){const E=[];if(v.shaderID?E.push(v.shaderID):(E.push(v.customVertexShaderID),E.push(v.customFragmentShaderID)),v.defines!==void 0)for(const D in v.defines)E.push(D),E.push(v.defines[D]);return v.isRawShaderMaterial===!1&&(m(E,v),g(E,v),E.push(i.outputColorSpace)),E.push(v.customProgramCacheKey),E.join()}function m(v,E){v.push(E.precision),v.push(E.outputColorSpace),v.push(E.envMapMode),v.push(E.envMapPMREM),v.push(E.envMapMaxLod),v.push(E.envMapSize),v.push(E.mapUv),v.push(E.alphaMapUv),v.push(E.lightMapUv),v.push(E.aoMapUv),v.push(E.bumpMapUv),v.push(E.normalMapUv),v.push(E.displacementMapUv),v.push(E.emissiveMapUv),v.push(E.metalnessMapUv),v.push(E.roughnessMapUv),v.push(E.anisotropyMapUv),v.push(E.clearcoatMapUv),v.push(E.clearcoatNormalMapUv),v.push(E.clearcoatRoughnessMapUv),v.push(E.diffuseRoughnessMapUv),v.push(E.iridescenceMapUv),v.push(E.iridescenceThicknessMapUv),v.push(E.sheenColorMapUv),v.push(E.sheenRoughnessMapUv),v.push(E.specularMapUv),v.push(E.specularColorMapUv),v.push(E.specularIntensityMapUv),v.push(E.transmissionMapUv),v.push(E.thicknessMapUv),v.push(E.combine),v.push(E.fogExp2),v.push(E.sizeAttenuation),v.push(E.morphTargetsCount),v.push(E.numSunLights),v.push(E.numDirLights),v.push(E.numPointLights),v.push(E.numSpotLights),v.push(E.numSpotLightMaps),v.push(E.numHemiLights),v.push(E.numRectAreaLights),v.push(E.numSunLightShadows),v.push(E.numDirLightShadows),v.push(E.numPointLightShadows),v.push(E.numSpotLightShadows),v.push(E.numSpotLightShadowsWithMaps),v.push(E.numLightProbes),v.push(E.numLightProbeGrids),v.push(E.shadowMapType),v.push(E.toneMapping),v.push(E.numClippingPlanes),v.push(E.numClipIntersection),v.push(E.depthPacking)}function g(v,E){o.disableAll(),E.instancing&&o.enable(0),E.instancingColor&&o.enable(1),E.instancingMorph&&o.enable(2),E.matcap&&o.enable(3),E.envMap&&o.enable(4),E.normalMapObjectSpace&&o.enable(5),E.normalMapTangentSpace&&o.enable(6),E.clearcoat&&o.enable(7),E.iridescence&&o.enable(8),E.alphaTest&&o.enable(9),E.vertexColors&&o.enable(10),E.vertexAlphas&&o.enable(11),E.vertexUv1s&&o.enable(12),E.vertexUv2s&&o.enable(13),E.vertexUv3s&&o.enable(14),E.vertexTangents&&o.enable(15),E.anisotropy&&o.enable(16),E.alphaHash&&o.enable(17),E.batching&&o.enable(18),E.dispersion&&o.enable(19),E.retroreflection&&o.enable(24),E.diffuseRoughness&&o.enable(25),E.batchingColor&&o.enable(20),E.gradientMap&&o.enable(21),E.packedNormalMap&&o.enable(22),E.vertexNormals&&o.enable(23),v.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reversedDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),E.numLightProbeGrids>0&&o.enable(22),E.hasPositionAttribute&&o.enable(23),v.push(o.mask)}function x(v){const E=c[v.type];let D;if(E){const P=zn[E];D=sp.clone(P.uniforms)}else D=v.uniforms;return D}function y(v,E){let D=d.get(E);return D!==void 0?++D.usedTimes:(D=new N_(i,E,v,s),h.push(D),d.set(E,D)),D}function M(v){if(--v.usedTimes===0){const E=h.indexOf(v);h[E]=h[h.length-1],h.pop(),d.delete(v.cacheKey),v.destroy()}}function A(v){a.remove(v)}function b(){a.dispose()}return{getParameters:p,getProgramCacheKey:_,getUniforms:x,acquireProgram:y,releaseProgram:M,releaseShaderCache:A,programs:h,dispose:b}}function H_(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function k_(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function eh(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function nh(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(c){let u=0;return c.isInstancedMesh&&(u+=2),c.isSkinnedMesh&&(u+=1),u}function a(c,u,p,_,m,g){let x=i[t];return x===void 0?(x={id:c.id,object:c,geometry:u,material:p,materialVariant:o(c),groupOrder:_,renderOrder:c.renderOrder,z:m,group:g},i[t]=x):(x.id=c.id,x.object=c,x.geometry=u,x.material=p,x.materialVariant=o(c),x.groupOrder=_,x.renderOrder=c.renderOrder,x.z=m,x.group=g),t++,x}function l(c,u,p,_,m,g,x){x.reversedDepth===!0&&(m=-m);const y=a(c,u,p,_,m,g);p.transmission>0?n.push(y):p.transparent===!0?s.push(y):e.push(y)}function h(c,u,p,_,m,g){const x=a(c,u,p,_,m,g);p.transmission>0?n.unshift(x):p.transparent===!0?s.unshift(x):e.unshift(x)}function d(c,u){e.length>1&&e.sort(c||k_),n.length>1&&n.sort(u||eh),s.length>1&&s.sort(u||eh)}function f(){for(let c=t,u=i.length;c<u;c++){const p=i[c];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:h,finish:f,sort:d}}function G_(){let i=new WeakMap;function t(n,s){const r=i.get(n);let o;return r===void 0?(o=new nh,i.set(n,[o])):s>=r.length?(o=new nh,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function V_(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new T,color:new jt};break;case"SpotLight":e={position:new T,direction:new T,color:new jt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new T,color:new jt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new T,skyColor:new jt,groundColor:new jt};break;case"RectAreaLight":e={color:new jt,position:new T,halfWidth:new T,halfHeight:new T};break}return i[t.id]=e,e}}}function W_(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _t};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _t};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _t,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let X_=0;function Y_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function q_(i){const t=new V_,e=W_(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)n.probe.push(new T);const s=new T,r=new re,o=new re;function a(h){let d=0,f=0,c=0;for(let U=0;U<9;U++)n.probe[U].set(0,0,0);let u=0,p=0,_=0,m=0,g=0,x=0,y=0,M=0,A=0,b=0,v=0,E=0,D=0,P=0;h.sort(Y_);for(let U=0,V=h.length;U<V;U++){const N=h[U],z=N.color,k=N.intensity,G=N.distance;let st=null;if(N.shadow&&N.shadow.map&&(N.shadow.map.texture.format===Ui?st=N.shadow.map.texture:st=N.shadow.map.depthTexture||N.shadow.map.texture),N.isAmbientLight)d+=z.r*k,f+=z.g*k,c+=z.b*k;else if(N.isLightProbe){for(let C=0;C<9;C++)n.probe[C].addScaledVector(N.sh.coefficients[C],k);P++}else if(N.isSunLight){const C=t.get(N);if(C.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){const B=N.shadow,W=e.get(N);W.shadowIntensity=B.intensity,W.shadowBias=B.bias,W.shadowNormalBias=B.normalBias,W.shadowRadius=B.radius,W.shadowMapSize.copy(B.mapSize).multiply(B.getFrameExtents()),n.sunShadow[p]=W,n.sunShadowMap[p]=st;const ot=B.getViewportCount();for(let yt=0;yt<ot;yt++)n.sunShadowMatrix[_+yt]=B.getMatrix(yt),n.sunShadowCascade[_+yt]=B._cascadeData[yt];_+=ot,p++}n.sun[u]=C,u++}else if(N.isDirectionalLight){const C=t.get(N);if(C.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){const B=N.shadow,W=e.get(N);W.shadowIntensity=B.intensity,W.shadowBias=B.bias,W.shadowNormalBias=B.normalBias,W.shadowRadius=B.radius,W.shadowMapSize=B.mapSize,n.directionalShadow[m]=W,n.directionalShadowMap[m]=st,n.directionalShadowMatrix[m]=N.shadow.matrix,A++}n.directional[m]=C,m++}else if(N.isSpotLight){const C=t.get(N);C.position.setFromMatrixPosition(N.matrixWorld),C.color.copy(z).multiplyScalar(k),C.distance=G,C.coneCos=Math.cos(N.angle),C.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),C.decay=N.decay,n.spot[x]=C;const B=N.shadow;if(N.map&&(n.spotLightMap[E]=N.map,E++,B.updateMatrices(N),N.castShadow&&D++),n.spotLightMatrix[x]=B.matrix,N.castShadow){const W=e.get(N);W.shadowIntensity=B.intensity,W.shadowBias=B.bias,W.shadowNormalBias=B.normalBias,W.shadowRadius=B.radius,W.shadowMapSize=B.mapSize,n.spotShadow[x]=W,n.spotShadowMap[x]=st,v++}x++}else if(N.isRectAreaLight){const C=t.get(N);C.color.copy(z).multiplyScalar(k),C.halfWidth.set(N.width*.5,0,0),C.halfHeight.set(0,N.height*.5,0),n.rectArea[y]=C,y++}else if(N.isPointLight){const C=t.get(N);if(C.color.copy(N.color).multiplyScalar(N.intensity),C.distance=N.distance,C.decay=N.decay,N.castShadow){const B=N.shadow,W=e.get(N);W.shadowIntensity=B.intensity,W.shadowBias=B.bias,W.shadowNormalBias=B.normalBias,W.shadowRadius=B.radius,W.shadowMapSize=B.mapSize,W.shadowCameraNear=B.camera.near,W.shadowCameraFar=B.camera.far,n.pointShadow[g]=W,n.pointShadowMap[g]=st,n.pointShadowMatrix[g]=N.shadow.matrix,b++}n.point[g]=C,g++}else if(N.isHemisphereLight){const C=t.get(N);C.skyColor.copy(N.color).multiplyScalar(k),C.groundColor.copy(N.groundColor).multiplyScalar(k),n.hemi[M]=C,M++}}y>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Lt.LTC_FLOAT_1,n.rectAreaLTC2=Lt.LTC_FLOAT_2):(n.rectAreaLTC1=Lt.LTC_HALF_1,n.rectAreaLTC2=Lt.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=f,n.ambient[2]=c;const L=n.hash;(L.sunLength!==u||L.directionalLength!==m||L.pointLength!==g||L.spotLength!==x||L.rectAreaLength!==y||L.hemiLength!==M||L.numSunShadows!==p||L.numDirectionalShadows!==A||L.numPointShadows!==b||L.numSpotShadows!==v||L.numSpotMaps!==E||L.numLightProbes!==P)&&(n.sun.length=u,n.directional.length=m,n.spot.length=x,n.rectArea.length=y,n.point.length=g,n.hemi.length=M,n.sunShadow.length=p,n.sunShadowMap.length=p,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=A,n.directionalShadowMap.length=A,n.directionalShadowMatrix.length=A,n.pointShadow.length=b,n.pointShadowMap.length=b,n.pointShadowMatrix.length=b,n.spotShadow.length=v,n.spotShadowMap.length=v,n.spotLightMatrix.length=v+E-D,n.spotLightMap.length=E,n.numSpotLightShadowsWithMaps=D,n.numLightProbes=P,L.sunLength=u,L.directionalLength=m,L.pointLength=g,L.spotLength=x,L.rectAreaLength=y,L.hemiLength=M,L.numSunShadows=p,L.numDirectionalShadows=A,L.numPointShadows=b,L.numSpotShadows=v,L.numSpotMaps=E,L.numLightProbes=P,n.version=X_++)}function l(h,d){let f=0,c=0,u=0,p=0,_=0,m=0;const g=d.matrixWorldInverse;for(let x=0,y=h.length;x<y;x++){const M=h[x];if(M.isSunLight){const A=n.sun[f];A.direction.setFromMatrixPosition(M.matrixWorld),A.direction.transformDirection(g),f++}else if(M.isDirectionalLight){const A=n.directional[c];A.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(g),c++}else if(M.isSpotLight){const A=n.spot[p];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(g),A.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(g),p++}else if(M.isRectAreaLight){const A=n.rectArea[_];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(g),o.identity(),r.copy(M.matrixWorld),r.premultiply(g),o.extractRotation(r),A.halfWidth.set(M.width*.5,0,0),A.halfHeight.set(0,M.height*.5,0),A.halfWidth.applyMatrix4(o),A.halfHeight.applyMatrix4(o),_++}else if(M.isPointLight){const A=n.point[u];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(g),u++}else if(M.isHemisphereLight){const A=n.hemi[m];A.direction.setFromMatrixPosition(M.matrixWorld),A.direction.transformDirection(g),m++}}}return{setup:a,setupView:l,state:n}}function ih(i){const t=new q_(i),e=[],n=[],s=[];function r(f){d.camera=f,e.length=0,n.length=0,s.length=0}function o(f){f.isLightProbeGrid?s.push(f):e.push(f)}function a(f){n.push(f)}function l(){t.setup(e),s.sort((f,c)=>f.priority-c.priority||f.id-c.id)}function h(f){t.setupView(e,f)}const d={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:l,setupLightsView:h,pushLight:o,pushShadow:a}}function Z_(i){let t=new WeakMap;function e(s,r=0){const o=t.get(s);let a;return o===void 0?(a=new ih(i),t.set(s,[a])):r>=o.length?(a=new ih(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}const K_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,J_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,$_=[new T(1,0,0),new T(-1,0,0),new T(0,1,0),new T(0,-1,0),new T(0,0,1),new T(0,0,-1)],Q_=[new T(0,-1,0),new T(0,-1,0),new T(0,0,1),new T(0,0,-1),new T(0,-1,0),new T(0,-1,0)],sh=new re,Rs=new T,Vo=new T;function j_(i,t,e){let n=new Xs;const s=new _t,r=new _t,o=new Fe,a=new hp,l=new up,h={},d=e.maxTextureSize,f={[Ni]:cn,[cn]:Ni,[Pn]:Pn},c=new Fi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new _t},radius:{value:4}},vertexShader:K_,fragmentShader:J_}),u=c.clone();u.defines.HORIZONTAL_PASS=1;const p=new Le;p.setAttribute("position",new En(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Ce(p,c),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Os;let g=this.type;this.render=function(b,v,E){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;this.type===mf&&($t("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Os);const D=i.getRenderTarget(),P=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),U=i.state;U.setBlending(as),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);const V=g!==this.type;V&&v.traverse(function(N){N.material&&(Array.isArray(N.material)?N.material.forEach(z=>z.needsUpdate=!0):N.material.needsUpdate=!0)});for(let N=0,z=b.length;N<z;N++){const k=b[N],G=k.shadow;if(G===void 0){$t("WebGLShadowMap:",k,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);const st=G.getFrameExtents();s.multiply(st),r.copy(G.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/st.x),s.x=r.x*st.x,G.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/st.y),s.y=r.y*st.y,G.mapSize.y=r.y));const C=i.state.buffers.depth.getReversed();if(G.camera._reversedDepth=C,G.map===null||V===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===Cs){if(k.isPointLight){$t("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new Wn(s.x,s.y,{format:Ui,type:Yn,minFilter:pn,magFilter:pn,generateMipmaps:!1}),G.map.texture.name=k.name+".shadowMap",G.map.depthTexture=new ms(s.x,s.y,Dn),G.map.depthTexture.name=k.name+".shadowMapDepth",G.map.depthTexture.format=yi,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=en,G.map.depthTexture.magFilter=en}else k.isPointLight?(G.map=new Cl(s.x),G.map.depthTexture=new ru(s.x,Xn)):(G.map=new Wn(s.x,s.y),G.map.depthTexture=new ms(s.x,s.y,Xn)),G.map.depthTexture.name=k.name+".shadowMap",G.map.depthTexture.format=yi,this.type===Os?(G.map.depthTexture.compareFunction=C?Kh:Zh,G.map.depthTexture.minFilter=pn,G.map.depthTexture.magFilter=pn):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=en,G.map.depthTexture.magFilter=en);G.camera.updateProjectionMatrix()}G.map.isWebGLCubeRenderTarget!==!0&&(G.map.width!==s.x||G.map.height!==s.y)&&G.map.setSize(s.x,s.y);const B=G.map.isWebGLCubeRenderTarget?6:G.getViewportCount();k.isPointLight!==!0&&G.updateMatrices(k,E);const W=(G.camera.layers.mask&4294967294)!==0?G.camera.layers:E.layers;for(let ot=0;ot<B;ot++){const yt=G.getCamera(ot);if(k.isPointLight){const J=G.camera,rt=G.matrix,bt=k.distance||J.far;bt!==J.far&&(J.far=bt,J.updateProjectionMatrix()),Rs.setFromMatrixPosition(k.matrixWorld),J.position.copy(Rs),Vo.copy(J.position),Vo.add($_[ot]),J.up.copy(Q_[ot]),J.lookAt(Vo),J.updateMatrixWorld(),rt.makeTranslation(-Rs.x,-Rs.y,-Rs.z),sh.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),G._frustum.setFromProjectionMatrix(sh,J.coordinateSystem,J.reversedDepth)}if(G.map.isWebGLCubeRenderTarget)i.setRenderTarget(G.map,ot),i.clear();else{ot===0&&(i.setRenderTarget(G.map),i.clear());const J=G.getViewport(ot);o.set(r.x*J.x,r.y*J.y,r.x*J.z,r.y*J.w),U.viewport(o)}n=G.getFrustum(ot),M(v,E,yt,k,W,this.type)}G.isPointLightShadow!==!0&&this.type===Cs&&x(G,E),G.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(D,P,L)};function x(b,v){const E=t.update(_);c.defines.VSM_SAMPLES!==b.blurSamples&&(c.defines.VSM_SAMPLES=b.blurSamples,u.defines.VSM_SAMPLES=b.blurSamples,c.needsUpdate=!0,u.needsUpdate=!0),b.mapPass===null?b.mapPass=new Wn(s.x,s.y,{format:Ui,type:Yn}):(b.mapPass.width!==b.map.width||b.mapPass.height!==b.map.height)&&b.mapPass.setSize(b.map.width,b.map.height),c.uniforms.shadow_pass.value=b.map.depthTexture,c.uniforms.resolution.value.set(b.map.width,b.map.height),c.uniforms.radius.value=b.radius,i.setRenderTarget(b.mapPass),i.clear(),i.renderBufferDirect(v,null,E,c,_,null),u.uniforms.shadow_pass.value=b.mapPass.texture,u.uniforms.resolution.value.set(b.map.width,b.map.height),u.uniforms.radius.value=b.radius,i.setRenderTarget(b.map),i.clear(),i.renderBufferDirect(v,null,E,u,_,null)}function y(b,v,E,D){let P=null;const L=E.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(L!==void 0)P=L;else if(P=E.isPointLight===!0?l:a,i.localClippingEnabled&&v.clipShadows===!0&&Array.isArray(v.clippingPlanes)&&v.clippingPlanes.length!==0||v.displacementMap&&v.displacementScale!==0||v.alphaMap&&v.alphaTest>0||v.map&&v.alphaTest>0||v.alphaToCoverage===!0){const U=P.uuid,V=v.uuid;let N=h[U];N===void 0&&(N={},h[U]=N);let z=N[V];z===void 0&&(z=P.clone(),N[V]=z,v.addEventListener("dispose",A)),P=z}if(P.visible=v.visible,P.wireframe=v.wireframe,D===Cs?P.side=v.shadowSide!==null?v.shadowSide:v.side:P.side=v.shadowSide!==null?v.shadowSide:f[v.side],P.alphaMap=v.alphaMap,P.alphaTest=v.alphaToCoverage===!0?.5:v.alphaTest,P.map=v.map,P.clipShadows=v.clipShadows,P.clippingPlanes=v.clippingPlanes,P.clipIntersection=v.clipIntersection,P.displacementMap=v.displacementMap,P.displacementScale=v.displacementScale,P.displacementBias=v.displacementBias,P.wireframeLinewidth=v.wireframeLinewidth,P.linewidth=v.linewidth,E.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const U=i.properties.get(P);U.light=E}return P}function M(b,v,E,D,P,L){if(b.visible===!1)return;if(b.layers.test(P)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&L===Cs)&&(!b.frustumCulled||b.intersectsFrustum(n))){b.modelViewMatrix.multiplyMatrices(E.matrixWorldInverse,b.matrixWorld);const N=t.update(b),z=b.material;if(Array.isArray(z)){const k=N.groups;for(let G=0,st=k.length;G<st;G++){const C=k[G],B=z[C.materialIndex];if(B&&B.visible){const W=y(b,B,D,L);b.onBeforeShadow(i,b,v,E,N,W,C),i.renderBufferDirect(E,null,N,W,b,C),b.onAfterShadow(i,b,v,E,N,W,C)}}}else if(z.visible){const k=y(b,z,D,L);b.onBeforeShadow(i,b,v,E,N,k,null),i.renderBufferDirect(E,null,N,k,b,null),b.onAfterShadow(i,b,v,E,N,k,null)}}const V=b.children;for(let N=0,z=V.length;N<z;N++)M(V[N],v,E,D,P,L)}function A(b){b.target.removeEventListener("dispose",A);for(const E in h){const D=h[E],P=b.target.uuid;P in D&&(D[P].dispose(),delete D[P])}}}function tx(i,t){function e(){let I=!1;const j=new Fe;let K=null;const mt=new Fe(0,0,0,0);return{setMask:function(pt){K!==pt&&!I&&(i.colorMask(pt,pt,pt,pt),K=pt)},setLocked:function(pt){I=pt},setClear:function(pt,St,Ut,Yt,gt){gt===!0&&(pt*=Yt,St*=Yt,Ut*=Yt),j.set(pt,St,Ut,Yt),mt.equals(j)===!1&&(i.clearColor(pt,St,Ut,Yt),mt.copy(j))},reset:function(){I=!1,K=null,mt.set(-1,0,0,0)}}}function n(){let I=!1,j=!1,K=null,mt=null,pt=null;return{setReversed:function(St){if(j!==St){const Ut=t.get("EXT_clip_control");St?Ut.clipControlEXT(Ut.LOWER_LEFT_EXT,Ut.ZERO_TO_ONE_EXT):Ut.clipControlEXT(Ut.LOWER_LEFT_EXT,Ut.NEGATIVE_ONE_TO_ONE_EXT),j=St;const Yt=pt;pt=null,this.setClear(Yt)}},getReversed:function(){return j},setTest:function(St){St?ct(i.DEPTH_TEST):Ct(i.DEPTH_TEST)},setMask:function(St){K!==St&&!I&&(i.depthMask(St),K=St)},setFunc:function(St){if(j&&(St=Kf[St]),mt!==St){switch(St){case jo:i.depthFunc(i.NEVER);break;case ta:i.depthFunc(i.ALWAYS);break;case ea:i.depthFunc(i.LESS);break;case ks:i.depthFunc(i.LEQUAL);break;case na:i.depthFunc(i.EQUAL);break;case ia:i.depthFunc(i.GEQUAL);break;case sa:i.depthFunc(i.GREATER);break;case ra:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}mt=St}},setLocked:function(St){I=St},setClear:function(St){pt!==St&&(pt=St,j&&(St=1-St),i.clearDepth(St))},reset:function(){I=!1,K=null,mt=null,pt=null,j=!1}}}function s(){let I=!1,j=null,K=null,mt=null,pt=null,St=null,Ut=null,Yt=null,gt=null;return{setTest:function(ut){I||(ut?ct(i.STENCIL_TEST):Ct(i.STENCIL_TEST))},setMask:function(ut){j!==ut&&!I&&(i.stencilMask(ut),j=ut)},setFunc:function(ut,Pt,ft){(K!==ut||mt!==Pt||pt!==ft)&&(i.stencilFunc(ut,Pt,ft),K=ut,mt=Pt,pt=ft)},setOp:function(ut,Pt,ft){(St!==ut||Ut!==Pt||Yt!==ft)&&(i.stencilOp(ut,Pt,ft),St=ut,Ut=Pt,Yt=ft)},setLocked:function(ut){I=ut},setClear:function(ut){gt!==ut&&(i.clearStencil(ut),gt=ut)},reset:function(){I=!1,j=null,K=null,mt=null,pt=null,St=null,Ut=null,Yt=null,gt=null}}}const r=new e,o=new n,a=new s;let l={};const h=new WeakMap;let d={},f={},c={},u=new WeakMap,p=[],_=null,m=!1,g=null,x=null,y=null,M=null,A=null,b=null,v=null,E=new jt(0,0,0),D=0,P=!1,L=null,U=null,V=null,N=null,z=null;const k=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let G=!1,st=0;const C=i.getParameter(i.VERSION);C.indexOf("WebGL")!==-1?(st=parseFloat(/^WebGL (\d)/.exec(C)[1]),G=st>=1):C.indexOf("OpenGL ES")!==-1&&(st=parseFloat(/^OpenGL ES (\d)/.exec(C)[1]),G=st>=2);let B=null,W={};const ot=i.getParameter(i.SCISSOR_BOX),yt=i.getParameter(i.VIEWPORT),J=new Fe().fromArray(ot),rt=new Fe().fromArray(yt);function bt(I,j,K,mt){const pt=new Uint8Array(4),St=i.createTexture();i.bindTexture(I,St),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ut=0;Ut<K;Ut++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(j,0,i.RGBA,1,1,mt,0,i.RGBA,i.UNSIGNED_BYTE,pt):i.texImage2D(j+Ut,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,pt);return St}const Nt={};Nt[i.TEXTURE_2D]=bt(i.TEXTURE_2D,i.TEXTURE_2D,1),Nt[i.TEXTURE_CUBE_MAP]=bt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Nt[i.TEXTURE_2D_ARRAY]=bt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Nt[i.TEXTURE_3D]=bt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ct(i.DEPTH_TEST),o.setFunc(ks),At(!1),Et(ql),ct(i.CULL_FACE),dt(as);function ct(I){d[I]!==!0&&(i.enable(I),d[I]=!0)}function Ct(I){d[I]!==!1&&(i.disable(I),d[I]=!1)}function Vt(I,j){return c[I]!==j?(i.bindFramebuffer(I,j),c[I]=j,I===i.DRAW_FRAMEBUFFER&&(c[i.FRAMEBUFFER]=j),I===i.FRAMEBUFFER&&(c[i.DRAW_FRAMEBUFFER]=j),!0):!1}function Bt(I,j){let K=p,mt=!1;if(I){K=u.get(j),K===void 0&&(K=[],u.set(j,K));const pt=I.textures;if(K.length!==pt.length||K[0]!==i.COLOR_ATTACHMENT0){for(let St=0,Ut=pt.length;St<Ut;St++)K[St]=i.COLOR_ATTACHMENT0+St;K.length=pt.length,mt=!0}}else K[0]!==i.BACK&&(K[0]=i.BACK,mt=!0);mt&&i.drawBuffers(K)}function Xt(I){return _!==I?(i.useProgram(I),_=I,!0):!1}const Zt={[ss]:i.FUNC_ADD,[_f]:i.FUNC_SUBTRACT,[xf]:i.FUNC_REVERSE_SUBTRACT};Zt[vf]=i.MIN,Zt[Mf]=i.MAX;const tt={[Sf]:i.ZERO,[yf]:i.ONE,[Ef]:i.SRC_COLOR,[Ih]:i.SRC_ALPHA,[Cf]:i.SRC_ALPHA_SATURATE,[Af]:i.DST_COLOR,[wf]:i.DST_ALPHA,[bf]:i.ONE_MINUS_SRC_COLOR,[Nh]:i.ONE_MINUS_SRC_ALPHA,[Rf]:i.ONE_MINUS_DST_COLOR,[Tf]:i.ONE_MINUS_DST_ALPHA,[Pf]:i.CONSTANT_COLOR,[Lf]:i.ONE_MINUS_CONSTANT_COLOR,[Df]:i.CONSTANT_ALPHA,[If]:i.ONE_MINUS_CONSTANT_ALPHA};function dt(I,j,K,mt,pt,St,Ut,Yt,gt,ut){if(I===as){m===!0&&(Ct(i.BLEND),m=!1);return}if(m===!1&&(ct(i.BLEND),m=!0),I!==gf){if(I!==g||ut!==P){if((x!==ss||A!==ss)&&(i.blendEquation(i.FUNC_ADD),x=ss,A=ss),ut)switch(I){case Fs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Zl:i.blendFunc(i.ONE,i.ONE);break;case Kl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Jl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ee("WebGLState: Invalid blending: ",I);break}else switch(I){case Fs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Zl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Kl:Ee("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Jl:Ee("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ee("WebGLState: Invalid blending: ",I);break}y=null,M=null,b=null,v=null,E.set(0,0,0),D=0,g=I,P=ut}return}pt=pt||j,St=St||K,Ut=Ut||mt,(j!==x||pt!==A)&&(i.blendEquationSeparate(Zt[j],Zt[pt]),x=j,A=pt),(K!==y||mt!==M||St!==b||Ut!==v)&&(i.blendFuncSeparate(tt[K],tt[mt],tt[St],tt[Ut]),y=K,M=mt,b=St,v=Ut),(Yt.equals(E)===!1||gt!==D)&&(i.blendColor(Yt.r,Yt.g,Yt.b,gt),E.copy(Yt),D=gt),g=I,P=!1}function xt(I,j){I.side===Pn?Ct(i.CULL_FACE):ct(i.CULL_FACE);let K=I.side===cn;j&&(K=!K),At(K),I.blending===Fs&&I.transparent===!1?dt(as):dt(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),o.setFunc(I.depthFunc),o.setTest(I.depthTest),o.setMask(I.depthWrite),r.setMask(I.colorWrite);const mt=I.stencilWrite;a.setTest(mt),mt&&(a.setMask(I.stencilWriteMask),a.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),a.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),zt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?ct(i.SAMPLE_ALPHA_TO_COVERAGE):Ct(i.SAMPLE_ALPHA_TO_COVERAGE)}function At(I){L!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),L=I)}function Et(I){I!==df?(ct(i.CULL_FACE),I!==U&&(I===ql?i.cullFace(i.BACK):I===pf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ct(i.CULL_FACE),U=I}function Jt(I){I!==V&&(G&&i.lineWidth(I),V=I)}function zt(I,j,K){I?(ct(i.POLYGON_OFFSET_FILL),(N!==j||z!==K)&&(N=j,z=K,o.getReversed()&&(j=-j,K=-K),i.polygonOffset(j,K))):Ct(i.POLYGON_OFFSET_FILL)}function Qt(I){I?ct(i.SCISSOR_TEST):Ct(i.SCISSOR_TEST)}function he(I){I===void 0&&(I=i.TEXTURE0+k-1),B!==I&&(i.activeTexture(I),B=I)}function fe(I,j,K){K===void 0&&(B===null?K=i.TEXTURE0+k-1:K=B);let mt=W[K];mt===void 0&&(mt={type:void 0,texture:void 0},W[K]=mt),(mt.type!==I||mt.texture!==j)&&(B!==K&&(i.activeTexture(K),B=K),i.bindTexture(I,j||Nt[I]),mt.type=I,mt.texture=j)}function F(){const I=W[B];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function Ie(){try{i.compressedTexImage2D(...arguments)}catch(I){Ee("WebGLState:",I)}}function oe(){try{i.compressedTexImage3D(...arguments)}catch(I){Ee("WebGLState:",I)}}function we(){try{i.texSubImage2D(...arguments)}catch(I){Ee("WebGLState:",I)}}function Z(){try{i.texSubImage3D(...arguments)}catch(I){Ee("WebGLState:",I)}}function lt(){try{i.compressedTexSubImage2D(...arguments)}catch(I){Ee("WebGLState:",I)}}function at(){try{i.compressedTexSubImage3D(...arguments)}catch(I){Ee("WebGLState:",I)}}function Dt(){try{i.texStorage2D(...arguments)}catch(I){Ee("WebGLState:",I)}}function R(){try{i.texStorage3D(...arguments)}catch(I){Ee("WebGLState:",I)}}function S(){try{i.texImage2D(...arguments)}catch(I){Ee("WebGLState:",I)}}function H(){try{i.texImage3D(...arguments)}catch(I){Ee("WebGLState:",I)}}function nt(I){return f[I]!==void 0?f[I]:i.getParameter(I)}function q(I,j){f[I]!==j&&(i.pixelStorei(I,j),f[I]=j)}function ht(I){J.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),J.copy(I))}function vt(I){rt.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),rt.copy(I))}function Q(I,j){let K=h.get(j);K===void 0&&(K=new WeakMap,h.set(j,K));let mt=K.get(I);mt===void 0&&(mt=i.getUniformBlockIndex(j,I.name),i.uniformBlockBinding(j,mt,mt),K.set(I,mt))}function et(I,j,K){const pt=h.get(j).get(I);l[pt]!==K&&(i.bindBufferBase(i.UNIFORM_BUFFER,pt,K),l[pt]=K)}function Mt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),d={},f={},B=null,W={},c={},l={},u=new WeakMap,p=[],_=null,m=!1,g=null,x=null,y=null,M=null,A=null,b=null,v=null,E=new jt(0,0,0),D=0,P=!1,L=null,U=null,V=null,N=null,z=null,J.set(0,0,i.canvas.width,i.canvas.height),rt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ct,disable:Ct,bindFramebuffer:Vt,drawBuffers:Bt,useProgram:Xt,setBlending:dt,setMaterial:xt,setFlipSided:At,setCullFace:Et,setLineWidth:Jt,setPolygonOffset:zt,setScissorTest:Qt,activeTexture:he,bindTexture:fe,unbindTexture:F,compressedTexImage2D:Ie,compressedTexImage3D:oe,texImage2D:S,texImage3D:H,pixelStorei:q,getParameter:nt,updateUBOMapping:Q,uniformBlockBinding:et,texStorage2D:Dt,texStorage3D:R,texSubImage2D:we,texSubImage3D:Z,compressedTexSubImage2D:lt,compressedTexSubImage3D:at,scissor:ht,viewport:vt,reset:Mt}}function ex(i,t,e,n,s,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new _t,d=new WeakMap,f=new Set;let c;const u=new WeakMap,p=new Set,_=new FinalizationRegistry(R=>p.delete(R));let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,S){return m?new OffscreenCanvas(R,S):qr("canvas")}function x(R,S,H){let nt=1;const q=Dt(R);if((q.width>H||q.height>H)&&(nt=H/Math.max(q.width,q.height)),nt<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const ht=Math.floor(nt*q.width),vt=Math.floor(nt*q.height);c===void 0&&(c=g(ht,vt));const Q=S?g(ht,vt):c;return Q.width=ht,Q.height=vt,Q.getContext("2d").drawImage(R,0,0,ht,vt),$t("WebGLRenderer: Texture has been resized from ("+q.width+"x"+q.height+") to ("+ht+"x"+vt+")."),Q}else return"data"in R&&$t("WebGLRenderer: Image in DataTexture is too big ("+q.width+"x"+q.height+")."),R;return R}function y(R){return R.generateMipmaps}function M(R){i.generateMipmap(R)}function A(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(R,S,H,nt,q,ht=!1){if(R!==null){if(i[R]!==void 0)return i[R];$t("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let vt;nt&&(vt=t.get("EXT_texture_norm16"),vt||$t("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=S;if(S===i.RED&&(H===i.FLOAT&&(Q=i.R32F),H===i.HALF_FLOAT&&(Q=i.R16F),H===i.UNSIGNED_BYTE&&(Q=i.R8),H===i.UNSIGNED_SHORT&&vt&&(Q=vt.R16_EXT),H===i.SHORT&&vt&&(Q=vt.R16_SNORM_EXT)),S===i.RED_INTEGER&&(H===i.UNSIGNED_BYTE&&(Q=i.R8UI),H===i.UNSIGNED_SHORT&&(Q=i.R16UI),H===i.UNSIGNED_INT&&(Q=i.R32UI),H===i.BYTE&&(Q=i.R8I),H===i.SHORT&&(Q=i.R16I),H===i.INT&&(Q=i.R32I)),S===i.RG&&(H===i.FLOAT&&(Q=i.RG32F),H===i.HALF_FLOAT&&(Q=i.RG16F),H===i.UNSIGNED_BYTE&&(Q=i.RG8),H===i.UNSIGNED_SHORT&&vt&&(Q=vt.RG16_EXT),H===i.SHORT&&vt&&(Q=vt.RG16_SNORM_EXT)),S===i.RG_INTEGER&&(H===i.UNSIGNED_BYTE&&(Q=i.RG8UI),H===i.UNSIGNED_SHORT&&(Q=i.RG16UI),H===i.UNSIGNED_INT&&(Q=i.RG32UI),H===i.BYTE&&(Q=i.RG8I),H===i.SHORT&&(Q=i.RG16I),H===i.INT&&(Q=i.RG32I)),S===i.RGB_INTEGER&&(H===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),H===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),H===i.UNSIGNED_INT&&(Q=i.RGB32UI),H===i.BYTE&&(Q=i.RGB8I),H===i.SHORT&&(Q=i.RGB16I),H===i.INT&&(Q=i.RGB32I)),S===i.RGBA_INTEGER&&(H===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),H===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),H===i.UNSIGNED_INT&&(Q=i.RGBA32UI),H===i.BYTE&&(Q=i.RGBA8I),H===i.SHORT&&(Q=i.RGBA16I),H===i.INT&&(Q=i.RGBA32I)),S===i.RGB&&(H===i.UNSIGNED_SHORT&&vt&&(Q=vt.RGB16_EXT),H===i.SHORT&&vt&&(Q=vt.RGB16_SNORM_EXT),H===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),H===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),S===i.RGBA){const et=ht?Yr:Me.getTransfer(q);H===i.FLOAT&&(Q=i.RGBA32F),H===i.HALF_FLOAT&&(Q=i.RGBA16F),H===i.UNSIGNED_BYTE&&(Q=et===Te?i.SRGB8_ALPHA8:i.RGBA8),H===i.UNSIGNED_SHORT&&vt&&(Q=vt.RGBA16_EXT),H===i.SHORT&&vt&&(Q=vt.RGBA16_SNORM_EXT),H===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),H===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Q}function v(R,S){let H;return R?S===null||S===Xn||S===ps?H=i.DEPTH24_STENCIL8:S===Dn?H=i.DEPTH32F_STENCIL8:S===Vs&&(H=i.DEPTH24_STENCIL8,$t("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Xn||S===ps?H=i.DEPTH_COMPONENT24:S===Dn?H=i.DEPTH_COMPONENT32F:S===Vs&&(H=i.DEPTH_COMPONENT16),H}function E(R,S){return y(R)===!0||R.isFramebufferTexture&&R.minFilter!==en&&R.minFilter!==pn?Math.log2(Math.max(S.width,S.height))+1:R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?S.mipmaps.length:1}function D(R){const S=new WeakRef(R);n.get(R).__ref=S,p.add(S),_.register(R,S,S)}function P(R){const S=n.get(R).__ref;S!==void 0&&(p.delete(S),_.unregister(S))}function L(R){V(R.target)}function U(R){N(R.target)}function V(R){R.removeEventListener("dispose",L),P(R),k(R),R.isVideoTexture&&d.delete(R),R.isHTMLTexture&&f.delete(R)}function N(R){R.removeEventListener("dispose",U),P(R),st(R)}function z(){for(const R of p){const S=R.deref();S!==void 0&&(S.isRenderTarget===!0?N(S):V(S))}p.clear(),f.clear()}function k(R){const S=n.get(R);if(S.__webglInit===void 0)return;const H=R.source,nt=u.get(H);if(nt){const q=nt[S.__cacheKey];q.usedTimes--,q.usedTimes===0&&G(R),Object.keys(nt).length===0&&u.delete(H)}n.remove(R)}function G(R){const S=n.get(R);i.deleteTexture(S.__webglTexture);const H=R.source,nt=u.get(H);delete nt[S.__cacheKey],o.memory.textures--}function st(R){const S=n.get(R);S.__depthDisposeCallback&&S.__depthDisposeCallback();const H=R.depthTexture;if(H&&H.renderTarget===R&&V(H),R.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(S.__webglFramebuffer[q]))for(let ht=0;ht<S.__webglFramebuffer[q].length;ht++)i.deleteFramebuffer(S.__webglFramebuffer[q][ht]);else i.deleteFramebuffer(S.__webglFramebuffer[q]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[q])}else{if(Array.isArray(S.__webglFramebuffer))for(let q=0;q<S.__webglFramebuffer.length;q++)i.deleteFramebuffer(S.__webglFramebuffer[q]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let q=0;q<S.__webglColorRenderbuffer.length;q++)S.__webglColorRenderbuffer[q]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[q]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const nt=R.textures;for(let q=0,ht=nt.length;q<ht;q++){const vt=n.get(nt[q]);vt.__webglTexture&&(i.deleteTexture(vt.__webglTexture),o.memory.textures--),n.remove(nt[q])}n.remove(R)}let C=0;function B(){C=0}function W(){return C}function ot(R){C=R}function yt(){const R=C;return R>=s.maxTextures&&$t("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),C+=1,R}function J(R){const S=[];return S.push(R.wrapS),S.push(R.wrapT),S.push(R.wrapR||0),S.push(R.magFilter),S.push(R.minFilter),S.push(R.anisotropy),S.push(R.internalFormat),S.push(R.format),S.push(R.type),S.push(R.generateMipmaps),S.push(R.mipmapsAutoUpdate),S.push(R.premultiplyAlpha),S.push(R.flipY),S.push(R.unpackAlignment),S.push(R.colorSpace),S.join()}function rt(R,S){const H=n.get(R);if(R.isVideoTexture&&lt(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&H.__version!==R.version){const nt=R.image;if(nt===null)$t("WebGLRenderer: Texture marked for update but no image data found.");else if(nt.complete===!1)$t("WebGLRenderer: Texture marked for update but image is incomplete");else{xt(H,R,S);return}}else R.isExternalTexture&&(H.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,H.__webglTexture,i.TEXTURE0+S)}function bt(R,S){const H=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&H.__version!==R.version){xt(H,R,S);return}else R.isExternalTexture&&(H.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,H.__webglTexture,i.TEXTURE0+S)}function Nt(R,S){const H=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&H.__version!==R.version){xt(H,R,S);return}e.bindTexture(i.TEXTURE_3D,H.__webglTexture,i.TEXTURE0+S)}function ct(R,S){const H=n.get(R);if(R.version>0&&H.__version!==R.version){At(H,R,S);return}e.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture,i.TEXTURE0+S)}const Ct={[oa]:i.REPEAT,[ni]:i.CLAMP_TO_EDGE,[aa]:i.MIRRORED_REPEAT},Vt={[en]:i.NEAREST,[Of]:i.NEAREST_MIPMAP_NEAREST,[nr]:i.NEAREST_MIPMAP_LINEAR,[pn]:i.LINEAR,[po]:i.LINEAR_MIPMAP_NEAREST,[vi]:i.LINEAR_MIPMAP_LINEAR},Bt={[Hf]:i.NEVER,[Jh]:i.ALWAYS,[kf]:i.LESS,[Zh]:i.LEQUAL,[Gf]:i.EQUAL,[Kh]:i.GEQUAL,[Vf]:i.GREATER,[Wf]:i.NOTEQUAL};function Xt(R,S){if(S.type===Dn&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===pn||S.magFilter===po||S.magFilter===nr||S.magFilter===vi||S.minFilter===pn||S.minFilter===po||S.minFilter===nr||S.minFilter===vi)&&$t("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,Ct[S.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,Ct[S.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,Ct[S.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,Vt[S.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,Vt[S.minFilter]),S.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,Bt[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===en||S.minFilter!==nr&&S.minFilter!==vi||S.type===Dn&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const H=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function Zt(R,S){let H=!1;R.__webglInit===void 0&&(R.__webglInit=!0,S.addEventListener("dispose",L),D(S));const nt=S.source;let q=u.get(nt);q===void 0&&(q={},u.set(nt,q));const ht=J(S);if(ht!==R.__cacheKey){q[ht]===void 0&&(q[ht]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,H=!0),q[ht].usedTimes++;const vt=q[R.__cacheKey];vt!==void 0&&(q[R.__cacheKey].usedTimes--,vt.usedTimes===0&&G(S)),R.__cacheKey=ht,R.__webglTexture=q[ht].texture}return H}function tt(R,S,H){return Math.floor(Math.floor(R/H)/S)}function dt(R,S,H,nt){const ht=R.updateRanges;if(ht.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,S.width,S.height,H,nt,S.data);else{ht.sort((I,j)=>I.start-j.start);let vt=0;for(let I=1;I<ht.length;I++){const j=ht[vt],K=ht[I],mt=j.start+j.count,pt=tt(K.start,S.width,4),St=tt(j.start,S.width,4);K.start<=mt+1&&pt===St&&tt(K.start+K.count-1,S.width,4)===pt?j.count=Math.max(j.count,K.start+K.count-j.start):(++vt,ht[vt]=K)}ht.length=vt+1;const Q=e.getParameter(i.UNPACK_ROW_LENGTH),et=e.getParameter(i.UNPACK_SKIP_PIXELS),Mt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,S.width);for(let I=0,j=ht.length;I<j;I++){const K=ht[I],mt=Math.floor(K.start/4),pt=Math.ceil(K.count/4),St=mt%S.width,Ut=Math.floor(mt/S.width),Yt=pt,gt=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,St),e.pixelStorei(i.UNPACK_SKIP_ROWS,Ut),e.texSubImage2D(i.TEXTURE_2D,0,St,Ut,Yt,gt,H,nt,S.data)}R.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,Q),e.pixelStorei(i.UNPACK_SKIP_PIXELS,et),e.pixelStorei(i.UNPACK_SKIP_ROWS,Mt)}}function xt(R,S,H){let nt=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(nt=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(nt=i.TEXTURE_3D);const q=Zt(R,S),ht=S.source;e.bindTexture(nt,R.__webglTexture,i.TEXTURE0+H);const vt=n.get(ht);if(ht.version!==vt.__version||q===!0){if(e.activeTexture(i.TEXTURE0+H),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){const gt=Me.getPrimaries(Me.workingColorSpace),ut=S.colorSpace===xi?null:Me.getPrimaries(S.colorSpace),Pt=S.colorSpace===xi||gt===ut?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pt)}e.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment);let et=x(S.image,!1,s.maxTextureSize);et=at(S,et);const Mt=r.convert(S.format,S.colorSpace),I=r.convert(S.type);let j=b(S.internalFormat,Mt,I,S.normalized,S.colorSpace,S.isVideoTexture);Xt(nt,S);let K;const mt=S.mipmaps,pt=S.isVideoTexture!==!0,St=vt.__version===void 0||q===!0,Ut=ht.dataReady,Yt=E(S,et);if(S.isDepthTexture)j=v(S.format===Mi,S.type),St&&(pt?e.texStorage2D(i.TEXTURE_2D,1,j,et.width,et.height):e.texImage2D(i.TEXTURE_2D,0,j,et.width,et.height,0,Mt,I,null));else if(S.isDataTexture)if(mt.length>0){pt&&St&&e.texStorage2D(i.TEXTURE_2D,Yt,j,mt[0].width,mt[0].height);for(let gt=0,ut=mt.length;gt<ut;gt++)K=mt[gt],pt?Ut&&e.texSubImage2D(i.TEXTURE_2D,gt,0,0,K.width,K.height,Mt,I,K.data):e.texImage2D(i.TEXTURE_2D,gt,j,K.width,K.height,0,Mt,I,K.data);S.generateMipmaps=!1}else pt?(St&&e.texStorage2D(i.TEXTURE_2D,Yt,j,et.width,et.height),Ut&&dt(S,et,Mt,I)):e.texImage2D(i.TEXTURE_2D,0,j,et.width,et.height,0,Mt,I,et.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){pt&&St&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Yt,j,mt[0].width,mt[0].height,et.depth);for(let gt=0,ut=mt.length;gt<ut;gt++)if(K=mt[gt],S.format!==Hn)if(Mt!==null)if(pt){if(Ut)if(S.layerUpdates.size>0){const Pt=Fc(K.width,K.height,S.format,S.type);for(const ft of S.layerUpdates){const qt=K.data.subarray(ft*Pt/K.data.BYTES_PER_ELEMENT,(ft+1)*Pt/K.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,gt,0,0,ft,K.width,K.height,1,Mt,qt)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,gt,0,0,0,K.width,K.height,et.depth,Mt,K.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,gt,j,K.width,K.height,et.depth,0,K.data,0,0);else $t("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else pt?Ut&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,gt,0,0,0,K.width,K.height,et.depth,Mt,I,K.data):e.texImage3D(i.TEXTURE_2D_ARRAY,gt,j,K.width,K.height,et.depth,0,Mt,I,K.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{pt&&St&&e.texStorage2D(i.TEXTURE_2D,Yt,j,mt[0].width,mt[0].height);for(let gt=0,ut=mt.length;gt<ut;gt++)K=mt[gt],S.format!==Hn?Mt!==null?pt?Ut&&e.compressedTexSubImage2D(i.TEXTURE_2D,gt,0,0,K.width,K.height,Mt,K.data):e.compressedTexImage2D(i.TEXTURE_2D,gt,j,K.width,K.height,0,K.data):$t("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):pt?Ut&&e.texSubImage2D(i.TEXTURE_2D,gt,0,0,K.width,K.height,Mt,I,K.data):e.texImage2D(i.TEXTURE_2D,gt,j,K.width,K.height,0,Mt,I,K.data)}else if(S.isDataArrayTexture)if(pt){if(St&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Yt,j,et.width,et.height,et.depth),Ut)if(S.layerUpdates.size>0){const gt=Fc(et.width,et.height,S.format,S.type);for(const ut of S.layerUpdates){const Pt=et.data.subarray(ut*gt/et.data.BYTES_PER_ELEMENT,(ut+1)*gt/et.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ut,et.width,et.height,1,Mt,I,Pt)}S.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,et.width,et.height,et.depth,Mt,I,et.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,j,et.width,et.height,et.depth,0,Mt,I,et.data);else if(S.isData3DTexture)pt?(St&&e.texStorage3D(i.TEXTURE_3D,Yt,j,et.width,et.height,et.depth),Ut&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,et.width,et.height,et.depth,Mt,I,et.data)):e.texImage3D(i.TEXTURE_3D,0,j,et.width,et.height,et.depth,0,Mt,I,et.data);else if(S.isFramebufferTexture){if(St)if(pt)e.texStorage2D(i.TEXTURE_2D,Yt,j,et.width,et.height);else{let gt=et.width,ut=et.height;for(let Pt=0;Pt<Yt;Pt++)e.texImage2D(i.TEXTURE_2D,Pt,j,gt,ut,0,Mt,I,null),gt>>=1,ut>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in i){const gt=i.canvas;if(gt.hasAttribute("layoutsubtree")||gt.setAttribute("layoutsubtree","true"),et.parentNode!==gt){gt.appendChild(et),f.add(S),gt.onpaint=ut=>{const Pt=ut.changedElements;for(const ft of f)Pt.includes(ft.image)&&(ft.needsUpdate=!0)},gt.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,et);else{const Pt=i.RGBA,ft=i.RGBA,qt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Pt,ft,qt,et)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(mt.length>0){if(pt&&St){const gt=Dt(mt[0]);e.texStorage2D(i.TEXTURE_2D,Yt,j,gt.width,gt.height)}for(let gt=0,ut=mt.length;gt<ut;gt++)K=mt[gt],pt?Ut&&e.texSubImage2D(i.TEXTURE_2D,gt,0,0,Mt,I,K):e.texImage2D(i.TEXTURE_2D,gt,j,Mt,I,K);S.generateMipmaps=!1}else if(pt){if(St){const gt=Dt(et);e.texStorage2D(i.TEXTURE_2D,Yt,j,gt.width,gt.height)}Ut&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Mt,I,et)}else e.texImage2D(i.TEXTURE_2D,0,j,Mt,I,et);y(S)&&S.mipmapsAutoUpdate===!0&&M(nt),vt.__version=ht.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function At(R,S,H){if(S.image.length!==6)return;const nt=Zt(R,S),q=S.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+H);const ht=n.get(q);if(q.version!==ht.__version||nt===!0){e.activeTexture(i.TEXTURE0+H);const vt=Me.getPrimaries(Me.workingColorSpace),Q=S.colorSpace===xi?null:Me.getPrimaries(S.colorSpace),et=S.colorSpace===xi||vt===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,et);const Mt=S.isCompressedTexture||S.image[0].isCompressedTexture,I=S.image[0]&&S.image[0].isDataTexture,j=[];for(let ft=0;ft<6;ft++)!Mt&&!I?j[ft]=x(S.image[ft],!0,s.maxCubemapSize):j[ft]=I?S.image[ft].image:S.image[ft],j[ft]=at(S,j[ft]);const K=j[0],mt=r.convert(S.format,S.colorSpace),pt=r.convert(S.type);let St=b(S.internalFormat,mt,pt,S.normalized,S.colorSpace);const Ut=S.isVideoTexture!==!0,Yt=ht.__version===void 0||nt===!0,gt=q.dataReady;let ut=E(S,K);Xt(i.TEXTURE_CUBE_MAP,S);let Pt;if(S.isDepthTexture){if(St=v(S.format===Mi,S.type),Yt)if(Ut)e.texStorage2D(i.TEXTURE_CUBE_MAP,1,St,K.width,K.height);else for(let ft=0;ft<6;ft++)e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0,St,K.width,K.height,0,mt,pt,null)}else if(Mt){Ut&&Yt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ut,St,K.width,K.height);for(let ft=0;ft<6;ft++){Pt=j[ft].mipmaps;for(let qt=0;qt<Pt.length;qt++){const xe=Pt[qt];S.format!==Hn?mt!==null?Ut?gt&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,qt,0,0,xe.width,xe.height,mt,xe.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,qt,St,xe.width,xe.height,0,xe.data):$t("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ut?gt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,qt,0,0,xe.width,xe.height,mt,pt,xe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,qt,St,xe.width,xe.height,0,mt,pt,xe.data)}}}else{if(Pt=S.mipmaps,Ut&&Yt){Pt.length>0&&ut++;const ft=Dt(j[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,ut,St,ft.width,ft.height)}for(let ft=0;ft<6;ft++)if(I){Ut?gt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0,0,0,j[ft].width,j[ft].height,mt,pt,j[ft].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0,St,j[ft].width,j[ft].height,0,mt,pt,j[ft].data);for(let qt=0;qt<Pt.length;qt++){const De=Pt[qt].image[ft].image;Ut?gt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,qt+1,0,0,De.width,De.height,mt,pt,De.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,qt+1,St,De.width,De.height,0,mt,pt,De.data)}}else{Ut?gt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0,0,0,mt,pt,j[ft]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0,St,mt,pt,j[ft]);for(let qt=0;qt<Pt.length;qt++){const xe=Pt[qt];Ut?gt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,qt+1,0,0,mt,pt,xe.image[ft]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,qt+1,St,mt,pt,xe.image[ft])}}}y(S)&&S.mipmapsAutoUpdate===!0&&M(i.TEXTURE_CUBE_MAP),ht.__version=q.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function Et(R,S,H,nt,q,ht){const vt=r.convert(H.format,H.colorSpace),Q=r.convert(H.type),et=b(H.internalFormat,vt,Q,H.normalized,H.colorSpace),Mt=n.get(S),I=n.get(H);if(I.__renderTarget=S,!Mt.__hasExternalTextures){const j=Math.max(1,S.width>>ht),K=Math.max(1,S.height>>ht);q===i.TEXTURE_3D||q===i.TEXTURE_2D_ARRAY?e.texImage3D(q,ht,et,j,K,S.depth,0,vt,Q,null):e.texImage2D(q,ht,et,j,K,0,vt,Q,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),Z(S)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,nt,q,I.__webglTexture,0,we(S)):(q===i.TEXTURE_2D||q>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&q<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,nt,q,I.__webglTexture,ht),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Jt(R,S,H){if(i.bindRenderbuffer(i.RENDERBUFFER,R),S.depthBuffer){const nt=S.depthTexture,q=nt&&nt.isDepthTexture?nt.type:null,ht=v(S.stencilBuffer,q),vt=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Z(S)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,we(S),ht,S.width,S.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,we(S),ht,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,ht,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,vt,i.RENDERBUFFER,R)}else{const nt=S.textures;for(let q=0;q<nt.length;q++){const ht=nt[q],vt=r.convert(ht.format,ht.colorSpace),Q=r.convert(ht.type),et=b(ht.internalFormat,vt,Q,ht.normalized,ht.colorSpace);Z(S)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,we(S),et,S.width,S.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,we(S),et,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,et,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function zt(R,S,H){const nt=S.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const q=n.get(S.depthTexture);q.__renderTarget=S;const ht=nt?S.depthTexture.image[0]:S.depthTexture.image;(!q.__webglTexture||ht.width!==S.width||ht.height!==S.height)&&(ht.width=S.width,ht.height=S.height,S.depthTexture.needsUpdate=!0),nt?ct(S.depthTexture,0):rt(S.depthTexture,0);const vt=q.__webglTexture,Q=we(S),et=nt?i.TEXTURE_CUBE_MAP_POSITIVE_X+H:i.TEXTURE_2D,Mt=S.depthTexture.format===Mi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(S.depthTexture.format===yi)Z(S)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Mt,et,vt,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,Mt,et,vt,0);else if(S.depthTexture.format===Mi)Z(S)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Mt,et,vt,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,Mt,et,vt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Qt(R){const S=n.get(R),H=R.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==R.depthTexture){const nt=R.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),nt){const q=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,nt.removeEventListener("dispose",q)};nt.addEventListener("dispose",q),S.__depthDisposeCallback=q}S.__boundDepthTexture=nt}if(R.depthTexture&&!S.__autoAllocateDepthBuffer)if(H)for(let nt=0;nt<6;nt++)zt(S.__webglFramebuffer[nt],R,nt);else R.texture.mipmaps.length>0?zt(S.__webglFramebuffer[0],R,0):zt(S.__webglFramebuffer,R,0);else if(H){S.__webglDepthbuffer=[];for(let nt=0;nt<6;nt++)if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[nt]),S.__webglDepthbuffer[nt]===void 0)S.__webglDepthbuffer[nt]=i.createRenderbuffer(),Jt(S.__webglDepthbuffer[nt],R,!1);else{const q=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ht=S.__webglDepthbuffer[nt];i.bindRenderbuffer(i.RENDERBUFFER,ht),i.framebufferRenderbuffer(i.FRAMEBUFFER,q,i.RENDERBUFFER,ht)}}else if(R.texture.mipmaps.length>0?e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),Jt(S.__webglDepthbuffer,R,!1);else{const q=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ht=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ht),i.framebufferRenderbuffer(i.FRAMEBUFFER,q,i.RENDERBUFFER,ht)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function he(R,S,H){const nt=n.get(R);S!==void 0&&Et(nt.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),H!==void 0&&Qt(R)}function fe(R){const S=R.texture,H=n.get(R),nt=n.get(S);R.addEventListener("dispose",U),D(R);const q=R.textures,ht=R.isWebGLCubeRenderTarget===!0,vt=q.length>1;if(vt||(nt.__webglTexture===void 0&&(nt.__webglTexture=i.createTexture()),nt.__version=S.version,o.memory.textures++),ht){H.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(S.mipmaps.length>0){H.__webglFramebuffer[Q]=[];for(let et=0;et<S.mipmaps.length;et++)H.__webglFramebuffer[Q][et]=i.createFramebuffer()}else H.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(S.mipmaps.length>0){H.__webglFramebuffer=[];for(let Q=0;Q<S.mipmaps.length;Q++)H.__webglFramebuffer[Q]=i.createFramebuffer()}else H.__webglFramebuffer=i.createFramebuffer();if(vt)for(let Q=0,et=q.length;Q<et;Q++){const Mt=n.get(q[Q]);Mt.__webglTexture===void 0&&(Mt.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&Z(R)===!1){H.__webglMultisampledFramebuffer=i.createFramebuffer(),H.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let Q=0;Q<q.length;Q++){const et=q[Q];H.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,H.__webglColorRenderbuffer[Q]);const Mt=r.convert(et.format,et.colorSpace),I=r.convert(et.type),j=b(et.internalFormat,Mt,I,et.normalized,et.colorSpace,R.isXRRenderTarget===!0),K=we(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,K,j,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,H.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(H.__webglDepthRenderbuffer=i.createRenderbuffer(),Jt(H.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ht){e.bindTexture(i.TEXTURE_CUBE_MAP,nt.__webglTexture),Xt(i.TEXTURE_CUBE_MAP,S);for(let Q=0;Q<6;Q++)if(S.mipmaps.length>0)for(let et=0;et<S.mipmaps.length;et++)Et(H.__webglFramebuffer[Q][et],R,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,et);else Et(H.__webglFramebuffer[Q],R,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);y(S)?M(i.TEXTURE_CUBE_MAP):S.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),e.unbindTexture()}else if(vt){for(let Q=0,et=q.length;Q<et;Q++){const Mt=q[Q],I=n.get(Mt);let j=i.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(j=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(j,I.__webglTexture),Xt(j,Mt),Et(H.__webglFramebuffer,R,Mt,i.COLOR_ATTACHMENT0+Q,j,0),y(Mt)&&M(j)}e.unbindTexture()}else{let Q=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Q=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Q,nt.__webglTexture),Xt(Q,S),S.mipmaps.length>0)for(let et=0;et<S.mipmaps.length;et++)Et(H.__webglFramebuffer[et],R,S,i.COLOR_ATTACHMENT0,Q,et);else Et(H.__webglFramebuffer,R,S,i.COLOR_ATTACHMENT0,Q,0);y(S)?M(Q):S.mipmaps.length>0&&i.texParameteri(Q,i.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),e.unbindTexture()}R.depthBuffer&&Qt(R)}function F(R){const S=R.textures;for(let H=0,nt=S.length;H<nt;H++){const q=S[H];if(y(q)&&q.mipmapsAutoUpdate===!0){const ht=A(R),vt=n.get(q).__webglTexture;e.bindTexture(ht,vt),M(ht),e.unbindTexture()}}}const Ie=[];function oe(R){if(R.samples>0){if(Z(R)===!1){const S=R.textures,H=R.width,nt=R.height;let q=i.COLOR_BUFFER_BIT;const ht=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,vt=n.get(R),Q=S.length>1;if(Q)for(let Mt=0;Mt<S.length;Mt++)e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,vt.__webglMultisampledFramebuffer),R.texture.mipmaps.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglFramebuffer);for(let Mt=0;Mt<S.length;Mt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(q|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(q|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,vt.__webglColorRenderbuffer[Mt]);const I=n.get(S[Mt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,I,0)}i.blitFramebuffer(0,0,H,nt,0,0,H,nt,q,i.NEAREST),l===!0&&(Ie.length=0,Ie.push(i.COLOR_ATTACHMENT0+Mt),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&Ie.push(ht),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ie))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let Mt=0;Mt<S.length;Mt++){e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.RENDERBUFFER,vt.__webglColorRenderbuffer[Mt]);const I=n.get(S[Mt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.TEXTURE_2D,I,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&l){const S=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function we(R){return Math.min(s.maxSamples,R.samples)}function Z(R){const S=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function lt(R){const S=o.render.frame;d.get(R)!==S&&(d.set(R,S),R.update())}function at(R,S){const H=R.colorSpace,nt=R.format,q=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||H!==Xr&&H!==xi&&(Me.getTransfer(H)===Te?(nt!==Hn||q!==Mn)&&$t("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ee("WebGLTextures: Unsupported texture color space:",H)),S}function Dt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(h.width=R.naturalWidth||R.width,h.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(h.width=R.displayWidth,h.height=R.displayHeight):(h.width=R.width,h.height=R.height),h}this.allocateTextureUnit=yt,this.resetTextureUnits=B,this.getTextureUnits=W,this.setTextureUnits=ot,this.setTexture2D=rt,this.setTexture2DArray=bt,this.setTexture3D=Nt,this.setTextureCube=ct,this.rebindTextures=he,this.setupRenderTarget=fe,this.updateRenderTargetMipmap=F,this.updateMultisampleRenderTarget=oe,this.setupDepthRenderbuffer=Qt,this.setupFrameBufferTexture=Et,this.useMultisampledRTT=Z,this.dispose=z}function nx(i,t){function e(n,s=xi){let r;const o=Me.getTransfer(s);if(n===Mn)return i.UNSIGNED_BYTE;if(n===al)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ll)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Wh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Xh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Gh)return i.BYTE;if(n===Vh)return i.SHORT;if(n===Vs)return i.UNSIGNED_SHORT;if(n===ol)return i.INT;if(n===Xn)return i.UNSIGNED_INT;if(n===Dn)return i.FLOAT;if(n===Yn)return i.HALF_FLOAT;if(n===Yh)return i.ALPHA;if(n===qh)return i.RGB;if(n===Hn)return i.RGBA;if(n===yi)return i.DEPTH_COMPONENT;if(n===Mi)return i.DEPTH_STENCIL;if(n===cl)return i.RED;if(n===hl)return i.RED_INTEGER;if(n===Ui)return i.RG;if(n===ul)return i.RG_INTEGER;if(n===fl)return i.RGBA_INTEGER;if(n===Dr||n===Ir||n===Nr||n===Ur)if(o===Te)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Dr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ur)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Dr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ir)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Nr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ur)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===la||n===ca||n===ha||n===ua)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===la)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ca)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ha)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ua)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===fa||n===da||n===pa||n===ma||n===ga||n===Gr||n===_a)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===fa||n===da)return o===Te?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===pa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===ma)return r.COMPRESSED_R11_EAC;if(n===ga)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Gr)return r.COMPRESSED_RG11_EAC;if(n===_a)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===xa||n===va||n===Ma||n===Sa||n===ya||n===Ea||n===ba||n===wa||n===Ta||n===Aa||n===Ra||n===Ca||n===Pa||n===La)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===xa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===va)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ma)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Sa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ya)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ea)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ba)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===wa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ta)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Aa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ra)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ca)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Pa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===La)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Da||n===Ia||n===Na)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Da)return o===Te?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ia)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Na)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ua||n===Oa||n===Vr||n===Fa)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ua)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Oa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Vr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Fa)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ps?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}const ix=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,sx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class rx{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){const n=new ou(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Fi({vertexShader:ix,fragmentShader:sx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ce(new so(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class ox extends bi{constructor(t,e){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,h=null,d=null,f=null,c=null,u=null,p=null;const _=typeof XRWebGLBinding<"u",m=new rx,g={},x=e.getContextAttributes();let y=null,M=null;const A=[],b=[],v=new _t;let E=null,D=null;const P=new vn;P.viewport=new Fe;const L=new vn;L.viewport=new Fe;const U=[P,L],V=new _p;let N=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let rt=A[J];return rt===void 0&&(rt=new yo,A[J]=rt),rt.getTargetRaySpace()},this.getControllerGrip=function(J){let rt=A[J];return rt===void 0&&(rt=new yo,A[J]=rt),rt.getGripSpace()},this.getHand=function(J){let rt=A[J];return rt===void 0&&(rt=new yo,A[J]=rt),rt.getHandSpace()};function k(J){const rt=b.indexOf(J.inputSource);if(rt===-1)return;const bt=A[rt];bt!==void 0&&(bt.update(J.inputSource,J.frame,h||o),bt.dispatchEvent({type:J.type,data:J.inputSource}))}function G(){s.removeEventListener("select",k),s.removeEventListener("selectstart",k),s.removeEventListener("selectend",k),s.removeEventListener("squeeze",k),s.removeEventListener("squeezestart",k),s.removeEventListener("squeezeend",k),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",st);for(let J=0;J<A.length;J++){const rt=b[J];rt!==null&&(b[J]=null,A[J].disconnect(rt))}N=null,z=null,m.reset();for(const J in g)delete g[J];if(t.setRenderTarget(y),u=null,c=null,f=null,s=null,M=null,yt.stop(),n.isPresenting=!1,t.setPixelRatio(E),t.setSize(v.width,v.height,!1),D!==null){const J=D.camera;J.fov=D.fov,J.zoom=D.zoom,J.updateProjectionMatrix(),D=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&$t("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){a=J,n.isPresenting===!0&&$t("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||o},this.setReferenceSpace=function(J){h=J},this.getBaseLayer=function(){return c!==null?c:u},this.getBinding=function(){return f===null&&_&&(f=new XRWebGLBinding(s,e)),f},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(y=t.getRenderTarget(),s.addEventListener("select",k),s.addEventListener("selectstart",k),s.addEventListener("selectend",k),s.addEventListener("squeeze",k),s.addEventListener("squeezestart",k),s.addEventListener("squeezeend",k),s.addEventListener("end",G),s.addEventListener("inputsourceschange",st),x.xrCompatible!==!0&&await e.makeXRCompatible(),E=t.getPixelRatio(),t.getSize(v),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let bt=null,Nt=null,ct=null;x.depth&&(ct=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,bt=x.stencil?Mi:yi,Nt=x.stencil?ps:Xn);const Ct={colorFormat:e.RGBA8,depthFormat:ct,scaleFactor:r};f=this.getBinding(),c=f.createProjectionLayer(Ct),s.updateRenderState({layers:[c]}),t.setPixelRatio(1),t.setSize(c.textureWidth,c.textureHeight,!1),M=new Wn(c.textureWidth,c.textureHeight,{format:Hn,type:Mn,depthTexture:new ms(c.textureWidth,c.textureHeight,Nt,void 0,void 0,void 0,void 0,void 0,void 0,bt),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:c.ignoreDepthValues===!1,resolveStencilBuffer:c.ignoreDepthValues===!1,storeMultisampledDepthBuffer:c.ignoreDepthValues===!1,storeMultisampledStencilBuffer:c.ignoreDepthValues===!1})}else{const bt={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};u=new XRWebGLLayer(s,e,bt),s.updateRenderState({baseLayer:u}),t.setPixelRatio(1),t.setSize(u.framebufferWidth,u.framebufferHeight,!1),M=new Wn(u.framebufferWidth,u.framebufferHeight,{format:Hn,type:Mn,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),h=null,o=await s.requestReferenceSpace(a),yt.setContext(s),yt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function st(J){for(let rt=0;rt<J.removed.length;rt++){const bt=J.removed[rt],Nt=b.indexOf(bt);Nt>=0&&(b[Nt]=null,A[Nt].disconnect(bt))}for(let rt=0;rt<J.added.length;rt++){const bt=J.added[rt];let Nt=b.indexOf(bt);if(Nt===-1){for(let Ct=0;Ct<A.length;Ct++)if(Ct>=b.length){b.push(bt),Nt=Ct;break}else if(b[Ct]===null){b[Ct]=bt,Nt=Ct;break}if(Nt===-1)break}const ct=A[Nt];ct&&ct.connect(bt)}}function C(J,rt){rt===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(rt.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let rt=J.near,bt=J.far;m.texture!==null&&(m.depthNear>0&&(rt=m.depthNear),m.depthFar>0&&(bt=m.depthFar)),V.near=L.near=P.near=rt,V.far=L.far=P.far=bt,(N!==V.near||z!==V.far)&&(s.updateRenderState({depthNear:V.near,depthFar:V.far}),N=V.near,z=V.far),V.layers.mask=J.layers.mask|6,P.layers.mask=V.layers.mask&-5,L.layers.mask=V.layers.mask&-3;const Nt=J.parent,ct=V.cameras;C(V,Nt);for(let Ct=0;Ct<ct.length;Ct++)C(ct[Ct],Nt);V.projectionMatrix.copy(P.projectionMatrix),V.projectionMatrixInverse.copy(P.projectionMatrixInverse),D===null&&J.isPerspectiveCamera&&(D={camera:J,fov:J.fov,zoom:J.zoom}),B(J,V,Nt)};function B(J,rt,bt){bt===null?J.matrix.copy(rt.matrixWorld):(J.matrix.copy(bt.matrixWorld),J.matrix.invert(),J.matrix.multiply(rt.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(rt.projectionMatrix),J.projectionMatrixInverse.copy(rt.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Ba*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(c===null&&u===null))return l},this.setFoveation=function(J){l=J,c!==null&&(c.fixedFoveation=J),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=J)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(V)},this.getCameraTexture=function(J){return g[J]};let W=null;function ot(J,rt){if(d=rt.getViewerPose(h||o),p=rt,d!==null){const bt=d.views;u!==null&&(t.setRenderTargetFramebuffer(M,u.framebuffer),t.setRenderTarget(M));let Nt=!1;bt.length!==V.cameras.length&&(V.cameras.length=0,Nt=!0);for(let Bt=0;Bt<bt.length;Bt++){const Xt=bt[Bt];let Zt=null;if(u!==null)Zt=u.getViewport(Xt);else{const dt=f.getViewSubImage(c,Xt);Zt=dt.viewport,Bt===0&&(t.setRenderTargetTextures(M,dt.colorTexture,dt.depthStencilTexture),t.setRenderTarget(M))}let tt=U[Bt];tt===void 0&&(tt=new vn,tt.layers.enable(Bt),tt.viewport=new Fe,U[Bt]=tt),tt.matrix.fromArray(Xt.transform.matrix),tt.matrix.decompose(tt.position,tt.quaternion,tt.scale),tt.projectionMatrix.fromArray(Xt.projectionMatrix),tt.projectionMatrixInverse.copy(tt.projectionMatrix).invert(),tt.viewport.set(Zt.x,Zt.y,Zt.width,Zt.height),Bt===0&&(V.matrix.copy(tt.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),Nt===!0&&V.cameras.push(tt)}const ct=s.enabledFeatures;if(ct&&ct.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){f=n.getBinding();const Bt=f.getDepthInformation(bt[0]);Bt&&Bt.isValid&&Bt.texture&&m.init(Bt,s.renderState)}if(ct&&ct.includes("camera-access")&&_){t.state.unbindTexture(),f=n.getBinding();for(let Bt=0;Bt<bt.length;Bt++){const Xt=bt[Bt].camera;if(Xt){let Zt=g[Xt];Zt||(Zt=new ou,g[Xt]=Zt);const tt=f.getCameraImage(Xt);Zt.sourceTexture=tt}}}}for(let bt=0;bt<A.length;bt++){const Nt=b[bt],ct=A[bt];Nt!==null&&ct!==void 0&&ct.update(Nt,rt,h||o)}W&&W(J,rt),rt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:rt}),p=null}const yt=new Mu;yt.setAnimationLoop(ot),this.setAnimationLoop=function(J){W=J},this.dispose=function(){}}}const ax=new re,Pu=new se;Pu.set(-1,0,0,0,1,0,0,0,1);function lx(i,t){function e(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,gu(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,x,y,M){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),f(m,g)):g.isMeshPhongMaterial?(r(m,g),d(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),c(m,g),g.isMeshPhysicalMaterial&&u(m,g,M)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),_(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?l(m,g,x,y):g.isSpriteMaterial?h(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,e(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===cn&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,e(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===cn&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,e(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,e(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);const x=t.get(g),y=x.envMap,M=x.envMapRotation;y&&(m.envMap.value=y,m.envMapRotation.value.setFromMatrix4(ax.makeRotationFromEuler(M)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Pu),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,x,y){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*x,m.scale.value=y*.5,g.map&&(m.map.value=g.map,e(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function h(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function d(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function f(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function c(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function u(m,g,x){m.ior.value=g.ior,g.diffuseRoughness>0&&(m.diffuseRoughness.value=g.diffuseRoughness,g.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=g.diffuseRoughnessMap,e(g.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===cn&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=g.iridescenceThicknessMaximum,g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function _(m,g){const x=t.get(g).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function cx(i,t,e,n){let s={},r={};function o(x,y){const M=y.program;n.uniformBlockBinding(x,M,s[x.id])}function a(x,y){let M=s[x.id];M===void 0&&(p(x),M=l(x),s[x.id]=M,x.addEventListener("dispose",m));const A=y.program;n.updateUBOMapping(x,A);const b=t.render.frame;r[x.id]!==b&&(h(x),r[x.id]=b)}function l(x){const y=i.createBuffer(),M=x.__size,A=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,M,A),i.bindBuffer(i.UNIFORM_BUFFER,null),y}function h(x){const y=s[x.id],M=x.uniforms,A=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let b=0,v=M.length;b<v;b++){const E=M[b];if(Array.isArray(E))for(let D=0,P=E.length;D<P;D++)d(E[D],b,D,A);else d(E,b,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(x,y,M,A){if(c(x,y,M,A)===!0){const b=x.__offset,v=x.value;if(Array.isArray(v)){let E=0;for(let D=0;D<v.length;D++){const P=v[D],L=_(P,!0);f(P,x.__data,E),E+=L.storage/Float32Array.BYTES_PER_ELEMENT}}else f(v,x.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,b,x.__data)}}function f(x,y,M){typeof x=="number"||typeof x=="boolean"?y[M]=x:x.isMatrix3?(y[M]=x.elements[0],y[M+1]=x.elements[1],y[M+2]=x.elements[2],y[M+3]=0,y[M+4]=x.elements[3],y[M+5]=x.elements[4],y[M+6]=x.elements[5],y[M+7]=0,y[M+8]=x.elements[6],y[M+9]=x.elements[7],y[M+10]=x.elements[8],y[M+11]=0):ArrayBuffer.isView(x)?y.set(x.subarray(0,y.length-M),M):x.toArray(y,M)}function c(x,y,M,A){const b=x.value,v=y+"_"+M;if(Array.isArray(b)){A[v]===void 0&&(A[v]=[]);const E=A[v];let D=!1;for(let P=0;P<b.length;P++)u(b[P],E,P)===!0&&(D=!0);return D}return u(b,A,v)}function u(x,y,M){if(y[M]===void 0)return typeof x=="number"||typeof x=="boolean"?y[M]=x:ArrayBuffer.isView(x)?y[M]=x.slice():y[M]=x.clone(),!0;{const A=y[M];if(typeof x=="number"||typeof x=="boolean"){if(A!==x)return y[M]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(A.equals(x)===!1)return A.copy(x),!0}}return!1}function p(x){const y=x.uniforms;let M=0;const A=16;for(let v=0,E=y.length;v<E;v++){const D=Array.isArray(y[v])?y[v]:[y[v]];for(let P=0,L=D.length;P<L;P++){const U=D[P],V=Array.isArray(U.value)?U.value:[U.value],N=Array.isArray(y[v])||Array.isArray(U.value);let z=M;for(let G=0,st=V.length;G<st;G++){const C=V[G],B=_(C,N),W=M%A,ot=W%B.boundary,yt=W+ot;M+=ot,yt!==0&&A-yt<B.storage&&(M+=A-yt),G===0&&(z=M),M+=B.storage}const k=U.type==="int"?Int32Array:U.type==="uint"?Uint32Array:Float32Array;U.__data=new k((M-z)/Float32Array.BYTES_PER_ELEMENT),U.__offset=z}}const b=M%A;return b>0&&(M+=A-b),x.__size=M,x.__cache={},this}function _(x,y){const M={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(M.boundary=4,M.storage=4):x.isVector2?(M.boundary=8,M.storage=8):x.isVector3||x.isColor?(M.boundary=16,M.storage=12):x.isVector4?(M.boundary=16,M.storage=16):x.isMatrix3?(M.boundary=16,M.storage=48):x.isMatrix4?(M.boundary=16,M.storage=64):x.isTexture?$t("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(M.boundary=16,M.storage=x.byteLength):$t("WebGLRenderer: Unsupported uniform value type.",x),y===!0&&(M.boundary=16,M.storage=Math.ceil(M.storage/16)*16),M}function m(x){const y=x.target;y.removeEventListener("dispose",m),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function g(){for(const x in s)i.deleteBuffer(s[x]);s={},r={}}return{bind:o,update:a,dispose:g}}const hx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let On=null;function ux(){return On===null&&(On=new iu(hx,16,16,Ui,Yn),On.name="DFG_LUT",On.minFilter=pn,On.magFilter=pn,On.wrapS=ni,On.wrapT=ni,On.generateMipmaps=!1,On.needsUpdate=!0),On}class fx{constructor(t={}){const{canvas:e=qf(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:h=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:c=!1,outputBufferType:u=Mn}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;const _=u,m=new Set([fl,ul,hl]),g=new Set([Mn,Xn,Vs,ps,al,ll]),x=new Uint32Array(4),y=new Int32Array(4),M={textures:[],min:[],max:[],resolution:[]};let A=null,b=null;const v=[],E=[];let D=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ri,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let L=!1,U=null,V=null,N=null,z=null;this._outputColorSpace=xn;let k=0,G=0,st=null,C=-1,B=null;const W=new Fe,ot=new Fe;let yt=null;const J=new jt(0);let rt=0,bt=e.width,Nt=e.height,ct=1,Ct=null,Vt=null;const Bt=new Fe(0,0,bt,Nt),Xt=new Fe(0,0,bt,Nt);let Zt=!1;const tt=new Xs,dt=new gl;let xt=!1,At=!1;const Et=new re,Jt=new T,zt=new Fe,Qt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let he=!1;function fe(){return st===null?ct:1}let F=n;function Ie(w,O){return e.getContext(w,O)}let oe,we,Z,lt,at,Dt,R,S,H,nt,q,ht,vt,Q,et,Mt,I,j,K,mt,pt,St,Ut;try{const w={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:h,powerPreference:d,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${il}`),e.addEventListener("webglcontextlost",ut,!1),e.addEventListener("webglcontextrestored",Pt,!1),e.addEventListener("webglcontextcreationerror",ft,!1),F===null){const O="webgl2";if(F=Ie(O,w),F===null)throw Ie(O)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Yt()}catch(w){throw e.removeEventListener("webglcontextlost",ut,!1),e.removeEventListener("webglcontextrestored",Pt,!1),e.removeEventListener("webglcontextcreationerror",ft,!1),Ee("WebGLRenderer: "+w.message),w}function Yt(){oe=new mg(F),oe.init(),pt=new nx(F,oe),we=new sg(F,oe,t,pt),Z=new tx(F,oe),we.reversedDepthBuffer&&c&&Z.buffers.depth.setReversed(!0),V=F.createFramebuffer(),N=F.createFramebuffer(),z=F.createFramebuffer(),lt=new xg(F),at=new H_,Dt=new ex(F,oe,Z,at,we,pt,lt),R=new pg(P),S=new Mp(F),St=new ng(F,S),H=new gg(F,S,lt,St),nt=new Mg(F,H,S,St,lt),j=new vg(F,we,Dt),et=new rg(at),q=new z_(P,R,oe,we,St,et),ht=new lx(P,at),vt=new G_,Q=new Z_(oe),I=new eg(P,R,Z,nt,p,l),Mt=new j_(P,nt,we),Ut=new cx(F,lt,we,Z),K=new ig(F,oe,lt),mt=new _g(F,oe,lt),lt.programs=q.programs,P.capabilities=we,P.extensions=oe,P.properties=at,P.renderLists=vt,P.shadowMap=Mt,P.state=Z,P.info=lt}_!==Mn&&(D=new yg(_,e.width,e.height,a,s,r));const gt=new ox(P,F);this.xr=gt,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){const w=oe.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=oe.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return ct},this.setPixelRatio=function(w){w!==void 0&&(ct=w,this.setSize(bt,Nt,!1))},this.getSize=function(w){return w.set(bt,Nt)},this.setSize=function(w,O,$=!0){if(gt.isPresenting){$t("WebGLRenderer: Can't change size while VR device is presenting.");return}bt=w,Nt=O,e.width=Math.floor(w*ct),e.height=Math.floor(O*ct),$===!0&&(e.style.width=w+"px",e.style.height=O+"px"),D!==null&&D.setSize(e.width,e.height),this.setViewport(0,0,w,O)},this.getDrawingBufferSize=function(w){return w.set(bt*ct,Nt*ct).floor()},this.setDrawingBufferSize=function(w,O,$){bt=w,Nt=O,ct=$,e.width=Math.floor(w*$),e.height=Math.floor(O*$),this.setViewport(0,0,w,O)},this.setEffects=function(w){if(_===Mn){Ee("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let O=0;O<w.length;O++)if(w[O].isOutputPass===!0){$t("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}D.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(W)},this.getViewport=function(w){return w.copy(Bt)},this.setViewport=function(w,O,$,X){w.isVector4?Bt.set(w.x,w.y,w.z,w.w):Bt.set(w,O,$,X),Z.viewport(W.copy(Bt).multiplyScalar(fe()).round())},this.getScissor=function(w){return w.copy(Xt)},this.setScissor=function(w,O,$,X){w.isVector4?Xt.set(w.x,w.y,w.z,w.w):Xt.set(w,O,$,X),Z.scissor(ot.copy(Xt).multiplyScalar(fe()).round())},this.getScissorTest=function(){return Zt},this.setScissorTest=function(w){Z.setScissorTest(Zt=w)},this.setOpaqueSort=function(w){Ct=w},this.setTransparentSort=function(w){Vt=w},this.getClearColor=function(w){return w.copy(I.getClearColor())},this.setClearColor=function(){I.setClearColor(...arguments)},this.getClearAlpha=function(){return I.getClearAlpha()},this.setClearAlpha=function(){I.setClearAlpha(...arguments)},this.clear=function(w=!0,O=!0,$=!0){let X=0;if(w){let Y=!1;if(st!==null){const wt=st.texture.format;Y=m.has(wt)}if(Y){const wt=st.texture.type,Ft=g.has(wt),Tt=I.getClearColor(),Rt=I.getClearAlpha(),Wt=Tt.r,ee=Tt.g,ae=Tt.b;Ft?(x[0]=Wt,x[1]=ee,x[2]=ae,x[3]=Rt,F.clearBufferuiv(F.COLOR,0,x)):(y[0]=Wt,y[1]=ee,y[2]=ae,y[3]=Rt,F.clearBufferiv(F.COLOR,0,y))}else X|=F.COLOR_BUFFER_BIT}O&&(X|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),$&&(X|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),X!==0&&F.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),U=w},this.dispose=function(){e.removeEventListener("webglcontextlost",ut,!1),e.removeEventListener("webglcontextrestored",Pt,!1),e.removeEventListener("webglcontextcreationerror",ft,!1),I.dispose(),vt.dispose(),Q.dispose(),Dt.dispose(),at.dispose(),R.dispose(),nt.dispose(),H.dispose(),St.dispose(),Ut.dispose(),q.dispose(),gt.dispose(),gt.removeEventListener("sessionstart",kt),gt.removeEventListener("sessionend",Gt),Kt.stop()};function ut(w){w.preventDefault(),jl("WebGLRenderer: Context Lost."),L=!0}function Pt(){jl("WebGLRenderer: Context Restored."),L=!1;const w=lt.autoReset,O=Mt.enabled,$=Mt.autoUpdate,X=Mt.needsUpdate,Y=Mt.type;Yt(),lt.autoReset=w,Mt.enabled=O,Mt.autoUpdate=$,Mt.needsUpdate=X,Mt.type=Y}function ft(w){Ee("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function qt(w){const O=w.target;O.removeEventListener("dispose",qt),xe(O)}function xe(w){De(w),at.remove(w)}function De(w){const O=at.get(w).programs;O!==void 0&&(O.forEach(function($){q.releaseProgram($)}),w.isShaderMaterial&&q.releaseShaderCache(w))}this.renderBufferDirect=function(w,O,$,X,Y,wt){O===null&&(O=Qt);const Ft=Y.isMesh&&Y.matrixWorld.determinantAffine()<0,Tt=Xe(w,O,$,X,Y);Z.setMaterial(X,Ft);let Rt=$.index,Wt=1;if(X.wireframe===!0){if(Rt=H.getWireframeAttribute($),Rt===void 0)return;Wt=2}const ee=$.drawRange,ae=$.attributes.position;let Ht=ee.start*Wt,ie=(ee.start+ee.count)*Wt;wt!==null&&(Ht=Math.max(Ht,wt.start*Wt),ie=Math.min(ie,(wt.start+wt.count)*Wt)),Rt!==null?(Ht=Math.max(Ht,0),ie=Math.min(ie,Rt.count)):ae!=null&&(Ht=Math.max(Ht,0),ie=Math.min(ie,ae.count));const Pe=ie-Ht;if(Pe<0||Pe===1/0)return;St.setup(Y,X,Tt,$,Rt);let ve,le=K;if(Rt!==null&&(ve=S.get(Rt),le=mt,le.setIndex(ve)),Y.isMesh)X.wireframe===!0?(Z.setLineWidth(X.wireframeLinewidth*fe()),le.setMode(F.LINES)):le.setMode(F.TRIANGLES);else if(Y.isLine){let Ue=X.linewidth;Ue===void 0&&(Ue=1),Z.setLineWidth(Ue*fe()),Y.isLineSegments?le.setMode(F.LINES):Y.isLineLoop?le.setMode(F.LINE_LOOP):le.setMode(F.LINE_STRIP)}else Y.isPoints?le.setMode(F.POINTS):Y.isSprite&&le.setMode(F.TRIANGLES);if(Y.isBatchedMesh)if(oe.get("WEBGL_multi_draw"))le.renderMultiDraw(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount);else{const Ue=Y._multiDrawStarts,Ot=Y._multiDrawCounts,Je=Y._multiDrawCount,Se=Rt?S.get(Rt).bytesPerElement:1,Nn=at.get(X).currentProgram.getUniforms();for(let sn=0;sn<Je;sn++)Nn.setValue(F,"_gl_DrawID",sn),le.render(Ue[sn]/Se,Ot[sn])}else if(Y.isInstancedMesh)le.renderInstances(Ht,Pe,Y.count);else if($.isInstancedBufferGeometry){const Ue=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,Ot=Math.min($.instanceCount,Ue);le.renderInstances(Ht,Pe,Ot)}else le.render(Ht,Pe)};function bn(w,O,$,X){U!==null&&w.isNodeMaterial&&U.setObject(X,w),xt===!0&&et.setState(w,$,!1),w.transparent===!0&&w.side===Pn&&w.forceSinglePass===!1?(w.side=cn,w.needsUpdate=!0,un(w,O,X),w.side=Ni,w.needsUpdate=!0,un(w,O,X),w.side=Pn):un(w,O,X)}this.compile=function(w,O,$=null){$===null&&($=w),U!==null&&U.renderStart(w,O,$),b=Q.get($),b.init(O),E.push(b),$.traverseVisible(function(Y){Y.isLight&&Y.layers.test(O.layers)&&(b.pushLight(Y),Y.castShadow&&b.pushShadow(Y))}),w!==$&&w.traverseVisible(function(Y){Y.isLight&&Y.layers.test(O.layers)&&(b.pushLight(Y),Y.castShadow&&b.pushShadow(Y))}),b.setupLights(),U!==null&&U.updateLights(b.state.lightsArray),At=this.localClippingEnabled,xt=et.init(this.clippingPlanes,At),xt===!0&&et.setGlobalState(this.clippingPlanes,O),U!==null&&Mt.render(b.state.shadowsArray,$,O);const X=new Set;return w.traverse(function(Y){if(!(Y.isMesh||Y.isPoints||Y.isLine||Y.isSprite))return;const wt=Y.material;if(wt)if(Array.isArray(wt))for(let Ft=0;Ft<wt.length;Ft++){const Tt=wt[Ft];bn(Tt,$,O,Y),X.add(Tt)}else bn(wt,$,O,Y),X.add(wt)}),b=E.pop(),U!==null&&U.renderEnd(),X},this.compileAsync=function(w,O,$=null){const X=this.compile(w,O,$);return new Promise(Y=>{function wt(){if(X.forEach(function(Ft){const Rt=at.get(Ft).currentProgram;(Rt===void 0||Rt.isReady())&&X.delete(Ft)}),X.size===0){Y(w);return}setTimeout(wt,10)}oe.get("KHR_parallel_shader_compile")!==null?wt():setTimeout(wt,10)})};let an=null;function ci(w){an&&an(w)}function kt(){Kt.stop()}function Gt(){Kt.start()}const Kt=new Mu;Kt.setAnimationLoop(ci),typeof self<"u"&&Kt.setContext(self),this.setAnimationLoop=function(w){an=w,gt.setAnimationLoop(w),w===null?Kt.stop():Kt.start()},gt.addEventListener("sessionstart",kt),gt.addEventListener("sessionend",Gt),this.render=function(w,O){if(O!==void 0&&O.isCamera!==!0){Ee("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;U!==null&&U.renderStart(w,O);const $=gt.enabled===!0&&gt.isPresenting===!0,X=D!==null&&(st===null||$)&&D.begin(P,st);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),gt.enabled===!0&&gt.isPresenting===!0&&(D===null||D.isCompositing()===!1)&&(gt.cameraAutoUpdate===!0&&gt.updateCamera(O),O=gt.getCamera()),w.isScene===!0&&w.onBeforeRender(P,w,O,st),b=Q.get(w,E.length),b.init(O),b.state.textureUnits=Dt.getTextureUnits(),E.push(b),Et.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),O.isArrayCamera?dt.setFromArrayCamera(O):tt.setFromProjectionMatrix(Et,In,O.reversedDepth),At=this.localClippingEnabled,xt=et.init(this.clippingPlanes,At),A=vt.get(w,v.length),A.init(),v.push(A),this.info.render.frame++,gt.enabled===!0&&gt.isPresenting===!0){const Ft=P.xr.getDepthSensingMesh();Ft!==null&&Ae(Ft,O,-1/0,P.sortObjects)}Ae(w,O,0,P.sortObjects),A.finish(),U!==null&&U.updateLights(b.state.lightsArray),P.sortObjects===!0&&A.sort(Ct,Vt),he=gt.enabled===!1||gt.isPresenting===!1||gt.hasDepthSensing()===!1,he&&I.addToRenderList(A,w),this.info.autoReset===!0&&this.info.reset(),xt===!0&&et.beginShadows();const Y=b.state.shadowsArray;if(Mt.render(Y,w,O),xt===!0&&et.endShadows(),(X&&D.hasRenderPass())===!1){const Ft=A.opaque,Tt=A.transmissive;if(b.setupLights(),O.isArrayCamera){const Rt=O.cameras;if(Tt.length>0)for(let Wt=0,ee=Rt.length;Wt<ee;Wt++){const ae=Rt[Wt];Ne(Ft,Tt,w,ae)}he&&I.render(w);for(let Wt=0,ee=Rt.length;Wt<ee;Wt++){const ae=Rt[Wt];ge(A,w,ae,ae.viewport)}}else Tt.length>0&&Ne(Ft,Tt,w,O),he&&I.render(w),ge(A,w,O)}st!==null&&G===0&&(Dt.updateMultisampleRenderTarget(st),Dt.updateRenderTargetMipmap(st)),X&&D.end(P),w.isScene===!0&&w.onAfterRender(P,w,O),St.resetDefaultState(),C=-1,B=null,E.pop(),E.length>0?(b=E[E.length-1],Dt.setTextureUnits(b.state.textureUnits),xt===!0&&et.setGlobalState(P.clippingPlanes,b.state.camera)):b=null,v.pop(),v.length>0?A=v[v.length-1]:A=null,U!==null&&U.renderEnd()};function Ae(w,O,$,X){if(w.visible===!1)return;if(w.layers.test(O.layers)){if(w.isGroup)$=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(O);else if(w.isLight)b.pushLight(w),w.castShadow&&b.pushShadow(w);else if(w.isSprite){const Ft=O.isArrayCamera?dt:tt;if(!w.frustumCulled||w.intersectsFrustum(Ft)){X&&zt.setFromMatrixPosition(w.matrixWorld).applyMatrix4(Et);const Tt=nt.update(w),Rt=w.material;Rt.visible&&A.push(w,Tt,Rt,$,zt.z,null,O)}}else if(w.isMesh||w.isLine||w.isPoints){const Ft=O.isArrayCamera?dt:tt;if(!w.frustumCulled||w.intersectsFrustum(Ft)){const Tt=nt.update(w),Rt=w.material;if(X&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),zt.copy(w.boundingSphere.center)):(Tt.boundingSphere===null&&Tt.computeBoundingSphere(),zt.copy(Tt.boundingSphere.center)),zt.applyMatrix4(w.matrixWorld).applyMatrix4(Et)),Array.isArray(Rt)){const Wt=Tt.groups;for(let ee=0,ae=Wt.length;ee<ae;ee++){const Ht=Wt[ee],ie=Rt[Ht.materialIndex];ie&&ie.visible&&A.push(w,Tt,ie,$,zt.z,Ht,O)}}else Rt.visible&&A.push(w,Tt,Rt,$,zt.z,null,O)}}}const wt=w.children;for(let Ft=0,Tt=wt.length;Ft<Tt;Ft++)Ae(wt[Ft],O,$,X)}function ge(w,O,$,X){const{opaque:Y,transmissive:wt,transparent:Ft}=w;b.setupLightsView($),xt===!0&&et.setGlobalState(P.clippingPlanes,$),X&&Z.viewport(W.copy(X)),Y.length>0&&_e(Y,O,$),wt.length>0&&_e(wt,O,$),Ft.length>0&&_e(Ft,O,$),Z.buffers.depth.setTest(!0),Z.buffers.depth.setMask(!0),Z.buffers.color.setMask(!0),Z.setPolygonOffset(!1)}function Ne(w,O,$,X){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[X.id]===void 0){const Ht=oe.has("EXT_color_buffer_half_float")||oe.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[X.id]=new Wn(1,1,{generateMipmaps:!0,type:Ht?Yn:Mn,minFilter:vi,samples:Math.max(4,we.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Me.workingColorSpace})}const wt=b.state.transmissionRenderTarget[X.id],Ft=X.viewport||W;wt.setSize(Ft.z*P.transmissionResolutionScale,Ft.w*P.transmissionResolutionScale);const Tt=P.getRenderTarget(),Rt=P.getActiveCubeFace(),Wt=P.getActiveMipmapLevel();P.setRenderTarget(wt),P.getClearColor(J),rt=P.getClearAlpha(),rt<1&&P.setClearColor(16777215,.5),P.clear(),he&&I.render($);const ee=P.toneMapping;P.toneMapping=ri;const ae=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),b.setupLightsView(X),xt===!0&&et.setGlobalState(P.clippingPlanes,X),_e(w,$,X),Dt.updateMultisampleRenderTarget(wt),Dt.updateRenderTargetMipmap(wt),oe.has("WEBGL_multisampled_render_to_texture")===!1){let Ht=!1;for(let ie=0,Pe=O.length;ie<Pe;ie++){const ve=O[ie],{object:le,geometry:Ue,material:Ot,group:Je}=ve;if(Ot.side===Pn&&le.layers.test(X.layers)){const Se=Ot.side;Ot.side=cn,Ot.needsUpdate=!0,te(le,$,X,Ue,Ot,Je),Ot.side=Se,Ot.needsUpdate=!0,Ht=!0}}Ht===!0&&(Dt.updateMultisampleRenderTarget(wt),Dt.updateRenderTargetMipmap(wt))}P.setRenderTarget(Tt,Rt,Wt),P.setClearColor(J,rt),ae!==void 0&&(X.viewport=ae),P.toneMapping=ee}function _e(w,O,$){const X=O.isScene===!0?O.overrideMaterial:null;for(let Y=0,wt=w.length;Y<wt;Y++){const Ft=w[Y],{object:Tt,geometry:Rt,group:Wt}=Ft;let ee=Ft.material;ee.allowOverride===!0&&X!==null&&(ee=X),Tt.layers.test($.layers)&&te(Tt,O,$,Rt,ee,Wt)}}function te(w,O,$,X,Y,wt){U!==null&&Y.isNodeMaterial&&U.setObject(w,Y),w.onBeforeRender(P,O,$,X,Y,wt),w.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),Y.onBeforeRender(P,O,$,X,w,wt),Y.transparent===!0&&Y.side===Pn&&Y.forceSinglePass===!1?(Y.side=cn,Y.needsUpdate=!0,P.renderBufferDirect($,O,X,Y,w,wt),Y.side=Ni,Y.needsUpdate=!0,P.renderBufferDirect($,O,X,Y,w,wt),Y.side=Pn):P.renderBufferDirect($,O,X,Y,w,wt),w.onAfterRender(P,O,$,X,Y,wt)}function We(w){let O=0;for(const $ of w)$.texture!==null&&O++;return O}function un(w,O,$){O.isScene!==!0&&(O=Qt);const X=at.get(w),Y=b.state.lights,wt=b.state.shadowsArray,Ft=Y.state.version,Tt=q.getParameters(w,Y.state,wt,O,$,b.state.lightProbeGridArray),Rt=q.getProgramCacheKey(Tt);let Wt=X.programs;X.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?O.environment:null,X.fog=O.fog;const ee=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;X.envMap=R.get(w.envMap||X.environment,ee),X.envMapRotation=X.environment!==null&&w.envMap===null?O.environmentRotation:w.envMapRotation,Wt===void 0&&(w.addEventListener("dispose",qt),Wt=new Map,X.programs=Wt,X.programVariants=new Map);let ae=Wt.get(Rt);if(ae!==void 0){if(X.currentProgram===ae&&X.lightsStateVersion===Ft)return He(w,Tt),ae}else Tt.uniforms=q.getUniforms(w),U!==null&&w.isNodeMaterial&&U.build(w,$,Tt),w.onBeforeCompile(Tt,P),ae=q.acquireProgram(Tt,Rt),Wt.set(Rt,ae),X.uniforms=Tt.uniforms;const Ht=X.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Ht.clippingPlanes=et.uniform),He(w,Tt),X.needsLights=hi(w),X.lightsStateVersion=Ft,X.needsLights&&(Ht.ambientLightColor.value=Y.state.ambient,Ht.lightProbe.value=Y.state.probe,Ht.sunLights.value=Y.state.sun,Ht.sunLightShadows.value=Y.state.sunShadow,Ht.directionalLights.value=Y.state.directional,Ht.directionalLightShadows.value=Y.state.directionalShadow,Ht.spotLights.value=Y.state.spot,Ht.spotLightShadows.value=Y.state.spotShadow,Ht.rectAreaLights.value=Y.state.rectArea,Ht.ltc_1.value=Y.state.rectAreaLTC1,Ht.ltc_2.value=Y.state.rectAreaLTC2,Ht.pointLights.value=Y.state.point,Ht.pointLightShadows.value=Y.state.pointShadow,Ht.hemisphereLights.value=Y.state.hemi,Ht.sunShadowMatrix.value=Y.state.sunShadowMatrix,Ht.sunShadowCascade.value=Y.state.sunShadowCascade,Ht.directionalShadowMatrix.value=Y.state.directionalShadowMatrix,Ht.spotLightMatrix.value=Y.state.spotLightMatrix,Ht.spotLightMap.value=Y.state.spotLightMap,Ht.pointShadowMatrix.value=Y.state.pointShadowMatrix),X.numLightProbeGrids=We(b.state.lightProbeGridArray),X.currentProgram=ae,X.uniformsList=null,ae}function fn(w,O,$,X,Y){const wt=at.get(w),Ft=wt.currentProgram.id+","+X+","+Y;let Tt=wt.programVariants.get(Ft);return Tt===void 0?(Tt=un(w,O,$),wt.programVariants.set(Ft,Tt)):(wt.currentProgram=Tt,wt.uniformsList=null,wt.outputColorSpace=X,wt.toneMapping=Y),Tt}function Kn(w){if(w.uniformsList===null){const O=w.currentProgram.getUniforms();w.uniformsList=Fr.seqWithValue(O.seq,w.uniforms)}return w.uniformsList}function He(w,O){const $=at.get(w);$.outputColorSpace=O.outputColorSpace,$.batching=O.batching,$.batchingColor=O.batchingColor,$.instancing=O.instancing,$.instancingColor=O.instancingColor,$.instancingMorph=O.instancingMorph,$.skinning=O.skinning,$.morphTargets=O.morphTargets,$.morphNormals=O.morphNormals,$.morphColors=O.morphColors,$.morphTargetsCount=O.morphTargetsCount,$.numClippingPlanes=O.numClippingPlanes,$.numIntersection=O.numClipIntersection,$.vertexAlphas=O.vertexAlphas,$.vertexTangents=O.vertexTangents,$.toneMapping=O.toneMapping}function Xe(w,O,$,X,Y){O.isScene!==!0&&(O=Qt),Dt.resetTextureUnits();const wt=O.fog,Ft=X.isMeshStandardMaterial||X.isMeshLambertMaterial||X.isMeshPhongMaterial?O.environment:null,Tt=st===null?P.outputColorSpace:st.isXRRenderTarget===!0?st.texture.colorSpace:Me.workingColorSpace,Rt=X.isMeshStandardMaterial||X.isMeshLambertMaterial&&!X.envMap||X.isMeshPhongMaterial&&!X.envMap,Wt=R.get(X.envMap||Ft,Rt),ee=X.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,ae=!!$.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),Ht=!!$.morphAttributes.position,ie=!!$.morphAttributes.normal,Pe=!!$.morphAttributes.color;let ve=ri;X.toneMapped&&(st===null||st.isXRRenderTarget===!0)&&(ve=P.toneMapping);const le=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,Ue=le!==void 0?le.length:0,Ot=at.get(X),Je=b.state.lights;if(xt===!0&&(At===!0||w!==B)){const Oe=w===B&&X.id===C;et.setState(X,w,Oe)}let Se=!1,Nn=!1;X.version===Ot.__version?Ot.needsLights&&Ot.lightsStateVersion!==Je.state.version||Y.isBatchedMesh&&Ot.batching===!1||!Y.isBatchedMesh&&Ot.batching===!0||Y.isBatchedMesh&&Ot.batchingColor===!0&&Y._colorsTexture===null||Y.isBatchedMesh&&Ot.batchingColor===!1&&Y._colorsTexture!==null||Y.isInstancedMesh&&Ot.instancing===!1||!Y.isInstancedMesh&&Ot.instancing===!0||Y.isSkinnedMesh&&Ot.skinning===!1||!Y.isSkinnedMesh&&Ot.skinning===!0||Y.isInstancedMesh&&Ot.instancingColor===!0&&Y.instanceColor===null||Y.isInstancedMesh&&Ot.instancingColor===!1&&Y.instanceColor!==null||Y.isInstancedMesh&&Ot.instancingMorph===!0&&Y.morphTexture===null||Y.isInstancedMesh&&Ot.instancingMorph===!1&&Y.morphTexture!==null||Ot.envMap!==Wt||X.fog===!0&&Ot.fog!==wt||Ot.numClippingPlanes!==void 0&&(Ot.numClippingPlanes!==et.numPlanes||Ot.numIntersection!==et.numIntersection)||Ot.vertexAlphas!==ee||Ot.vertexTangents!==ae||Ot.morphTargets!==Ht||Ot.morphNormals!==ie||Ot.morphColors!==Pe||Ot.morphTargetsCount!==Ue||Ot.numLightProbeGrids!==We(b.state.lightProbeGridArray)?Se=!0:(Ot.outputColorSpace!==Tt||Ot.toneMapping!==ve)&&(Nn=!0):(Se=!0,Ot.__version=X.version);let sn=Ot.currentProgram;(Se===!0||Nn===!0)&&(sn=Nn===!0?fn(X,O,Y,Tt,ve):un(X,O,Y),U&&X.isNodeMaterial&&U.onUpdateProgram(X,sn,Ot));let tr=!1,ui=!1,wi=!1;const ye=sn.getUniforms(),tn=Ot.uniforms;if(Z.useProgram(sn.program)&&(tr=!0,ui=!0,wi=!0),X.id!==C&&(C=X.id,ui=!0),tr||B!==w){Z.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),ye.setValue(F,"projectionMatrix",w.projectionMatrix),ye.setValue(F,"viewMatrix",w.matrixWorldInverse);const $e=ye.map.cameraPosition;$e!==void 0&&$e.setValue(F,Jt.setFromMatrixPosition(w.matrixWorld)),we.logarithmicDepthBuffer&&ye.setValue(F,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&ye.setValue(F,"isOrthographic",w.isOrthographicCamera===!0),B!==w&&(B=w,ui=!0,wi=!0)}if(Ot.needsLights&&(Je.state.sunShadowMap.length>0&&ye.setValue(F,"sunShadowMap",Je.state.sunShadowMap,Dt),Je.state.directionalShadowMap.length>0&&ye.setValue(F,"directionalShadowMap",Je.state.directionalShadowMap,Dt),Je.state.spotShadowMap.length>0&&ye.setValue(F,"spotShadowMap",Je.state.spotShadowMap,Dt),Je.state.pointShadowMap.length>0&&ye.setValue(F,"pointShadowMap",Je.state.pointShadowMap,Dt)),Y.isSkinnedMesh){ye.setOptional(F,Y,"bindMatrix"),ye.setOptional(F,Y,"bindMatrixInverse");const Oe=Y.skeleton;Oe&&(Oe.boneTexture===null&&Oe.computeBoneTexture(),ye.setValue(F,"boneTexture",Oe.boneTexture,Dt))}Y.isBatchedMesh&&(ye.setOptional(F,Y,"batchingTexture"),ye.setValue(F,"batchingTexture",Y._matricesTexture,Dt),ye.setOptional(F,Y,"batchingIdTexture"),ye.setValue(F,"batchingIdTexture",Y._indirectTexture,Dt),ye.setOptional(F,Y,"batchingColorTexture"),Y._colorsTexture!==null&&ye.setValue(F,"batchingColorTexture",Y._colorsTexture,Dt));const wn=$.morphAttributes;if((wn.position!==void 0||wn.normal!==void 0||wn.color!==void 0)&&j.update(Y,$,sn),(ui||Ot.receiveShadow!==Y.receiveShadow)&&(Ot.receiveShadow=Y.receiveShadow,ye.setValue(F,"receiveShadow",Y.receiveShadow)),(X.isMeshStandardMaterial||X.isMeshLambertMaterial||X.isMeshPhongMaterial)&&X.envMap===null&&O.environment!==null&&(tn.envMapIntensity.value=O.environmentIntensity),tn.dfgLUT!==void 0&&(tn.dfgLUT.value=ux()),ui){if(ye.setValue(F,"toneMappingExposure",P.toneMappingExposure),Ot.needsLights&&Ke(tn,wi),wt&&X.fog===!0&&ht.refreshFogUniforms(tn,wt),ht.refreshMaterialUniforms(tn,X,ct,Nt,b.state.transmissionRenderTarget[w.id]),Ot.needsLights&&Ot.numLightProbeGrids>0){const Oe=M;let $e=0;for(const Jn of b.state.lightProbeGridArray)Jn.texture!==null&&(Oe.textures[$e]=Jn.texture,Oe.min[$e]=Jn.boundingBox.min,Oe.max[$e]=Jn.boundingBox.max,Oe.resolution[$e]=Jn.resolution,$e++);for(const Jn in Oe)Oe[Jn].length=$e;tn.probesSH.value=Oe.textures,tn.probesMin.value=Oe.min,tn.probesMax.value=Oe.max,tn.probesResolution.value=Oe.resolution}Fr.upload(F,Kn(Ot),tn,Dt)}if(X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(Fr.upload(F,Kn(Ot),tn,Dt),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&ye.setValue(F,"center",Y.center),ye.setValue(F,"modelViewMatrix",Y.modelViewMatrix),ye.setValue(F,"normalMatrix",Y.normalMatrix),ye.setValue(F,"modelMatrix",Y.matrixWorld),X.uniformsGroups!==void 0){const Oe=X.uniformsGroups;for(let $e=0,Jn=Oe.length;$e<Jn;$e++){const kl=Oe[$e];Ut.update(kl,sn),Ut.bind(kl,sn)}}return sn}function Ke(w,O){w.ambientLightColor.needsUpdate=O,w.lightProbe.needsUpdate=O,w.sunLights.needsUpdate=O,w.sunLightShadows.needsUpdate=O,w.directionalLights.needsUpdate=O,w.directionalLightShadows.needsUpdate=O,w.pointLights.needsUpdate=O,w.pointLightShadows.needsUpdate=O,w.spotLights.needsUpdate=O,w.spotLightShadows.needsUpdate=O,w.rectAreaLights.needsUpdate=O,w.hemisphereLights.needsUpdate=O}function hi(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return G},this.getRenderTarget=function(){return st},this.setRenderTargetTextures=function(w,O,$){const X=at.get(w);X.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,X.__autoAllocateDepthBuffer===!1&&(X.__useRenderToTexture=!1),at.get(w.texture).__webglTexture=O,at.get(w.depthTexture).__webglTexture=X.__autoAllocateDepthBuffer?void 0:$,X.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,O){const $=at.get(w);$.__webglFramebuffer=O,$.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(w,O=0,$=0){st=w,k=O,G=$;let X=null,Y=!1,wt=!1;if(w){const Tt=at.get(w);if(Tt.__useDefaultFramebuffer!==void 0){Z.bindFramebuffer(F.FRAMEBUFFER,Tt.__webglFramebuffer),W.copy(w.viewport),ot.copy(w.scissor),yt=w.scissorTest,Z.viewport(W),Z.scissor(ot),Z.setScissorTest(yt),C=-1;return}else if(Tt.__webglFramebuffer===void 0)Dt.setupRenderTarget(w);else if(Tt.__hasExternalTextures)Dt.rebindTextures(w,at.get(w.texture).__webglTexture,at.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const ee=w.depthTexture;if(Tt.__boundDepthTexture!==ee){if(ee!==null&&at.has(ee)&&(w.width!==ee.image.width||w.height!==ee.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Dt.setupDepthRenderbuffer(w)}}const Rt=w.texture;(Rt.isData3DTexture||Rt.isDataArrayTexture||Rt.isCompressedArrayTexture)&&(wt=!0);const Wt=at.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Wt[O])?X=Wt[O][$]:X=Wt[O],Y=!0):w.samples>0&&Dt.useMultisampledRTT(w)===!1?X=at.get(w).__webglMultisampledFramebuffer:Array.isArray(Wt)?X=Wt[$]:X=Wt,W.copy(w.viewport),ot.copy(w.scissor),yt=w.scissorTest}else W.copy(Bt).multiplyScalar(ct).floor(),ot.copy(Xt).multiplyScalar(ct).floor(),yt=Zt;if($!==0&&(X=V),Z.bindFramebuffer(F.FRAMEBUFFER,X)&&Z.drawBuffers(w,X),Z.viewport(W),Z.scissor(ot),Z.setScissorTest(yt),Y){const Tt=at.get(w.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+O,Tt.__webglTexture,$)}else if(wt){const Tt=O;for(let Rt=0;Rt<w.textures.length;Rt++){const Wt=at.get(w.textures[Rt]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+Rt,Wt.__webglTexture,$,Tt)}}else if(w!==null&&$!==0){const Tt=at.get(w.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Tt.__webglTexture,$)}C=-1};function nn(w){const O=at.get(w);return(O.__readFormat!==w.format||O.__readType!==w.type)&&(O.__readFormat=w.format,O.__readType=w.type,O.__formatReadable=we.textureFormatReadable(w.format),O.__typeReadable=we.textureTypeReadable(w.type)),O}this.readRenderTargetPixels=function(w,O,$,X,Y,wt,Ft,Tt=0){if(!(w&&w.isWebGLRenderTarget)){Ee("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Rt=at.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ft!==void 0&&(Rt=Rt[Ft],Array.isArray(Rt)&&(Rt=Rt[0])),Rt){Z.bindFramebuffer(F.FRAMEBUFFER,Rt);try{const Wt=w.textures[Tt],ee=Wt.format,ae=Wt.type;w.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Tt);const Ht=nn(Wt);if(Ht.__formatReadable===!1){Ee("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ht.__typeReadable===!1){Ee("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=w.width-X&&$>=0&&$<=w.height-Y&&F.readPixels(O,$,X,Y,pt.convert(ee),pt.convert(ae),wt)}finally{const Wt=st!==null?at.get(st).__webglFramebuffer:null;Z.bindFramebuffer(F.FRAMEBUFFER,Wt)}}},this.readRenderTargetPixelsAsync=async function(w,O,$,X,Y,wt,Ft,Tt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Rt=at.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ft!==void 0&&(Rt=Rt[Ft],Array.isArray(Rt)&&(Rt=Rt[0])),Rt)if(O>=0&&O<=w.width-X&&$>=0&&$<=w.height-Y){Z.bindFramebuffer(F.FRAMEBUFFER,Rt);const Wt=w.textures[Tt],ee=Wt.format,ae=Wt.type;w.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Tt);const Ht=nn(Wt);if(Ht.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ht.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ie=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,ie),F.bufferData(F.PIXEL_PACK_BUFFER,wt.byteLength,F.STREAM_READ),F.readPixels(O,$,X,Y,pt.convert(ee),pt.convert(ae),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);const Pe=st!==null?at.get(st).__webglFramebuffer:null;Z.bindFramebuffer(F.FRAMEBUFFER,Pe);const ve=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await Zf(F,ve,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,ie),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,wt),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(ie),F.deleteSync(ve),wt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,O=null,$=0){const X=Math.pow(2,-$),Y=Math.floor(w.image.width*X),wt=Math.floor(w.image.height*X),Ft=O!==null?O.x:0,Tt=O!==null?O.y:0;Dt.setTexture2D(w,0),F.copyTexSubImage2D(F.TEXTURE_2D,$,0,0,Ft,Tt,Y,wt),Z.unbindTexture()},this.copyTextureToTexture=function(w,O,$=null,X=null,Y=0,wt=0){let Ft,Tt,Rt,Wt,ee,ae,Ht,ie,Pe;const ve=w.isCompressedTexture?w.mipmaps[wt]:w.image;if($!==null)Ft=$.max.x-$.min.x,Tt=$.max.y-$.min.y,Rt=$.isBox3?$.max.z-$.min.z:1,Wt=$.min.x,ee=$.min.y,ae=$.isBox3?$.min.z:0;else{const ye=Math.pow(2,-Y);Ft=Math.floor(ve.width*ye),Tt=Math.floor(ve.height*ye),w.isDataArrayTexture?Rt=ve.depth:w.isData3DTexture?Rt=Math.floor(ve.depth*ye):Rt=1,Wt=0,ee=0,ae=0}X!==null?(Ht=X.x,ie=X.y,Pe=X.z):(Ht=0,ie=0,Pe=0);const le=pt.convert(O.format),Ue=pt.convert(O.type);let Ot;O.isData3DTexture?(Dt.setTexture3D(O,0),Ot=F.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(Dt.setTexture2DArray(O,0),Ot=F.TEXTURE_2D_ARRAY):(Dt.setTexture2D(O,0),Ot=F.TEXTURE_2D),Z.activeTexture(F.TEXTURE0),Z.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,O.flipY),Z.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),Z.pixelStorei(F.UNPACK_ALIGNMENT,O.unpackAlignment);const Je=Z.getParameter(F.UNPACK_ROW_LENGTH),Se=Z.getParameter(F.UNPACK_IMAGE_HEIGHT),Nn=Z.getParameter(F.UNPACK_SKIP_PIXELS),sn=Z.getParameter(F.UNPACK_SKIP_ROWS),tr=Z.getParameter(F.UNPACK_SKIP_IMAGES);Z.pixelStorei(F.UNPACK_ROW_LENGTH,ve.width),Z.pixelStorei(F.UNPACK_IMAGE_HEIGHT,ve.height),Z.pixelStorei(F.UNPACK_SKIP_PIXELS,Wt),Z.pixelStorei(F.UNPACK_SKIP_ROWS,ee),Z.pixelStorei(F.UNPACK_SKIP_IMAGES,ae);const ui=w.isDataArrayTexture||w.isData3DTexture,wi=O.isDataArrayTexture||O.isData3DTexture;if(w.isDepthTexture){const ye=at.get(w),tn=at.get(O),wn=at.get(ye.__renderTarget),Oe=at.get(tn.__renderTarget);Z.bindFramebuffer(F.READ_FRAMEBUFFER,wn.__webglFramebuffer),Z.bindFramebuffer(F.DRAW_FRAMEBUFFER,Oe.__webglFramebuffer);for(let $e=0;$e<Rt;$e++)ui&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,at.get(w).__webglTexture,Y,ae+$e),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,at.get(O).__webglTexture,wt,Pe+$e)),F.blitFramebuffer(Wt,ee,Wt+Ft,ee+Tt,Ht,ie,Ht+Ft,ie+Tt,F.DEPTH_BUFFER_BIT,F.NEAREST);Z.bindFramebuffer(F.READ_FRAMEBUFFER,null),Z.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(Y!==0||w.isRenderTargetTexture||at.has(w)){const ye=at.get(w),tn=at.get(O);Z.bindFramebuffer(F.READ_FRAMEBUFFER,N),Z.bindFramebuffer(F.DRAW_FRAMEBUFFER,z);for(let wn=0;wn<Rt;wn++)ui?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,ye.__webglTexture,Y,ae+wn):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,ye.__webglTexture,Y),wi?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,tn.__webglTexture,wt,Pe+wn):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,tn.__webglTexture,wt),Y!==0?F.blitFramebuffer(Wt,ee,Wt+Ft,ee+Tt,Ht,ie,Ht+Ft,ie+Tt,F.COLOR_BUFFER_BIT,F.NEAREST):wi?F.copyTexSubImage3D(Ot,wt,Ht,ie,Pe+wn,Wt,ee,Ft,Tt):F.copyTexSubImage2D(Ot,wt,Ht,ie,Wt,ee,Ft,Tt);Z.bindFramebuffer(F.READ_FRAMEBUFFER,null),Z.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else wi?w.isDataTexture||w.isData3DTexture?F.texSubImage3D(Ot,wt,Ht,ie,Pe,Ft,Tt,Rt,le,Ue,ve.data):O.isCompressedArrayTexture?F.compressedTexSubImage3D(Ot,wt,Ht,ie,Pe,Ft,Tt,Rt,le,ve.data):F.texSubImage3D(Ot,wt,Ht,ie,Pe,Ft,Tt,Rt,le,Ue,ve):w.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,wt,Ht,ie,Ft,Tt,le,Ue,ve.data):w.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,wt,Ht,ie,ve.width,ve.height,le,ve.data):F.texSubImage2D(F.TEXTURE_2D,wt,Ht,ie,Ft,Tt,le,Ue,ve);Z.pixelStorei(F.UNPACK_ROW_LENGTH,Je),Z.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Se),Z.pixelStorei(F.UNPACK_SKIP_PIXELS,Nn),Z.pixelStorei(F.UNPACK_SKIP_ROWS,sn),Z.pixelStorei(F.UNPACK_SKIP_IMAGES,tr),wt===0&&O.generateMipmaps===!0&&O.mipmapsAutoUpdate===!0&&F.generateMipmap(Ot),Z.unbindTexture()},this.initRenderTarget=function(w){at.get(w).__webglFramebuffer===void 0&&Dt.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?Dt.setTextureCube(w,0):w.isData3DTexture?Dt.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?Dt.setTexture2DArray(w,0):Dt.setTexture2D(w,0),Z.unbindTexture()},this.resetState=function(){k=0,G=0,st=null,Z.reset(),St.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return In}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=Me._getDrawingBufferColorSpace(t),e.unpackColorSpace=Me._getUnpackColorSpace()}}const rh={type:"change"},Pl={type:"start"},Lu={type:"end"},Cr=new Js,oh=new Bn,dx=Math.cos(70*td.DEG2RAD),Ye=new T,dn=2*Math.PI,be={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Wo=1e-6;class px extends xp{constructor(t,e=null){super(t,e),this.state=be.NONE,this.target=new T,this.cursor=new T,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:os.ROTATE,MIDDLE:os.DOLLY,RIGHT:os.PAN},this.touches={ONE:rs.ROTATE,TWO:rs.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new T,this._lastQuaternion=new ze,this._lastTargetPosition=new T,this._quat=new ze().setFromUnitVectors(t.up,new T(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Oc,this._sphericalDelta=new Oc,this._scale=1,this._panOffset=new T,this._rotateStart=new _t,this._rotateEnd=new _t,this._rotateDelta=new _t,this._panStart=new _t,this._panEnd=new _t,this._panDelta=new _t,this._dollyStart=new _t,this._dollyEnd=new _t,this._dollyDelta=new _t,this._dollyDirection=new T,this._mouse=new _t,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=gx.bind(this),this._onPointerDown=mx.bind(this),this._onPointerUp=_x.bind(this),this._onContextMenu=bx.bind(this),this._onMouseWheel=Mx.bind(this),this._onKeyDown=Sx.bind(this),this._onTouchStart=yx.bind(this),this._onTouchMove=Ex.bind(this),this._onMouseDown=xx.bind(this),this._onMouseMove=vx.bind(this),this._interceptControlDown=wx.bind(this),this._interceptControlUp=Tx.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=be.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(rh),this.update(),this.state=be.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){const e=this.object.position;Ye.copy(e).sub(this.target),Ye.applyQuaternion(this._quat),this._spherical.setFromVector3(Ye),this.autoRotate&&this.state===be.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=dn:n>Math.PI&&(n-=dn),s<-Math.PI?s+=dn:s>Math.PI&&(s-=dn),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Ye.setFromSpherical(this._spherical),Ye.applyQuaternion(this._quatInverse),e.copy(this.target).add(Ye),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=Ye.length();o=this._clampDistance(a*this._scale);const l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const a=new T(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const h=new T(this._mouse.x,this._mouse.y,0);h.unproject(this.object),this.object.position.sub(h).add(a),this.object.updateMatrixWorld(),o=Ye.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Cr.origin.copy(this.object.position),Cr.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Cr.direction))<dx?this.object.lookAt(this.target):(oh.setFromNormalAndCoplanarPoint(this.object.up,this.target),Cr.intersectPlane(oh,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Wo||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Wo||this._lastTargetPosition.distanceToSquared(this.target)>Wo?(this.dispatchEvent(rh),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?dn/60*this.autoRotateSpeed*t:dn/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Ye.setFromMatrixColumn(e,0),Ye.multiplyScalar(-t),this._panOffset.add(Ye)}_panUp(t,e){this.screenSpacePanning===!0?Ye.setFromMatrixColumn(e,1):(Ye.setFromMatrixColumn(e,0),Ye.crossVectors(this.object.up,Ye)),Ye.multiplyScalar(t),this._panOffset.add(Ye)}_pan(t,e){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;Ye.copy(s).sub(this.target);let r=Ye.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientY),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(dn*this._rotateDelta.x/e.clientHeight),this._rotateUp(dn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(dn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-dn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(dn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-dn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(dn*this._rotateDelta.x/e.clientHeight),this._rotateUp(dn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new _t,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function mx(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function gx(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function _x(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Lu),this.state=be.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function xx(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case os.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=be.DOLLY;break;case os.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=be.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=be.ROTATE}break;case os.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=be.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=be.PAN}break;default:this.state=be.NONE}this.state!==be.NONE&&this.dispatchEvent(Pl)}function vx(i){switch(this.state){case be.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case be.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case be.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Mx(i){this.enabled===!1||this.enableZoom===!1||this.state!==be.NONE||(i.preventDefault(),this.dispatchEvent(Pl),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Lu))}function Sx(i){this.enabled!==!1&&this._handleKeyDown(i)}function yx(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case rs.ROTATE:if(this.enableRotate===!1){this.state=be.NONE;break}this._handleTouchStartRotate(i),this.state=be.TOUCH_ROTATE;break;case rs.PAN:if(this.enablePan===!1){this.state=be.NONE;break}this._handleTouchStartPan(i),this.state=be.TOUCH_PAN;break;default:this.state=be.NONE}break;case 2:switch(this.touches.TWO){case rs.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=be.TOUCH_DOLLY_PAN;break;case rs.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=be.TOUCH_DOLLY_ROTATE;break;default:this.state=be.NONE}break;default:this.state=be.NONE}this.state!==be.NONE&&this.dispatchEvent(Pl)}function Ex(i){switch(this._trackPointer(i),this.state){case be.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case be.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case be.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case be.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=be.NONE}}function bx(i){this.enabled!==!1&&i.preventDefault()}function wx(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Tx(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class Ax extends tu{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;const t=new qn;t.deleteAttribute("uv");const e=new hs({side:cn}),n=new hs,s=new pp(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);const r=new Ce(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const o=new yd(t,n,6),a=new Ge;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);const l=new Ce(t,ts(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);const h=new Ce(t,ts(50));h.position.set(-16.109,18.021,-8.207),h.scale.set(.1,2.425,2.751),this.add(h);const d=new Ce(t,ts(17));d.position.set(14.904,12.198,-1.832),d.scale.set(.15,4.265,6.331),this.add(d);const f=new Ce(t,ts(43));f.position.set(-.462,8.89,14.52),f.scale.set(4.38,5.441,.088),this.add(f);const c=new Ce(t,ts(20));c.position.set(3.235,11.486,-12.541),c.scale.set(2.5,2,.1),this.add(c);const u=new Ce(t,ts(100));u.position.set(0,20,0),u.scale.set(1,.1,1),this.add(u)}dispose(){const t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(const e of t)e.dispose()}}function ts(i){return new cp({color:0,emissive:16777215,emissiveIntensity:i})}class Rx extends Ge{constructor(t=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=t,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new _t(.5,.5),this.rotation2D=0,this.addEventListener("removed",function(){this.traverse(function(e){e.element&&e.element instanceof e.element.ownerDocument.defaultView.Element&&e.element.parentNode!==null&&e.element.remove()})})}copy(t,e){return super.copy(t,e),this.element=t.element.cloneNode(!0),this.center=t.center,this.rotation2D=t.rotation2D,this}}const es=new T,ah=new re,lh=new re,ch=new T,hh=new T;class Cx{constructor(t={}){const e=this;let n,s,r,o;const a={objects:new WeakMap},l=t.element!==void 0?t.element:document.createElement("div");l.style.overflow="hidden",this.domElement=l,this.sortObjects=!0,this.getSize=function(){return{width:n,height:s}},this.render=function(p,_){p.matrixWorldAutoUpdate===!0&&p.updateMatrixWorld(),_.parent===null&&_.matrixWorldAutoUpdate===!0&&_.updateMatrixWorld(),ah.copy(_.matrixWorldInverse),lh.multiplyMatrices(_.projectionMatrix,ah),d(p,p,_),this.sortObjects&&u(p)},this.setSize=function(p,_){n=p,s=_,r=n/2,o=s/2,l.style.width=p+"px",l.style.height=_+"px"};function h(p){p.isCSS2DObject&&(p.element.style.display="none");for(let _=0,m=p.children.length;_<m;_++)h(p.children[_])}function d(p,_,m){if(p.visible===!1){h(p);return}if(p.isCSS2DObject){es.setFromMatrixPosition(p.matrixWorld),es.applyMatrix4(lh);const g=es.z>=-1&&es.z<=1&&p.layers.test(m.layers)===!0,x=p.element;if(x.style.display=g===!0?"":"none",g===!0){p.onBeforeRender(e,_,m);const M=100*p.center.x,A=100*p.center.y;x.style.transformOrigin=`${M}% ${A}%`;const b=-p.rotation2D,v=es.x*r+r,E=-es.y*o+o;x.style.transform=`translate(${-M}%, ${-A}%) translate(${v}px, ${E}px) rotate(${b}rad)`,x.parentNode!==l&&l.appendChild(x),p.onAfterRender(e,_,m)}const y={distanceToCameraSquared:f(m,p)};a.objects.set(p,y)}for(let g=0,x=p.children.length;g<x;g++)d(p.children[g],_,m)}function f(p,_){return ch.setFromMatrixPosition(p.matrixWorld),hh.setFromMatrixPosition(_.matrixWorld),ch.distanceToSquared(hh)}function c(p){const _=[];return p.traverseVisible(function(m){m.isCSS2DObject&&_.push(m)}),_}function u(p){const _=c(p).sort(function(g,x){if(g.renderOrder!==x.renderOrder)return x.renderOrder-g.renderOrder;const y=a.objects.get(g).distanceToCameraSquared,M=a.objects.get(x).distanceToCameraSquared;return y-M}),m=_.length;for(let g=0,x=_.length;g<x;g++)_[g].element.style.zIndex=m-g}}}function ao(i,t=!1){const e=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},o={},a=i[0].morphTargetsRelative,l=new Le;l.morphTargetsRelative=a;let h=0;for(let d=0;d<i.length;++d){const f=i[d];let c=0,u=0;if(e!==(f.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+d+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const p in f.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+d+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;r[p]===void 0&&(r[p]=[]),r[p].push(f.attributes[p]),c++}if(c!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+d+". Make sure all geometries have the same number of attributes."),null;if(a!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+d+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const p in f.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+d+".  .morphAttributes must be consistent throughout all geometries."),null;if(f.morphAttributes[p].length!==i[0].morphAttributes[p].length)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+d+'. All geometries must have the same number of morph targets for the "'+p+'" morph attribute.'),null;o[p]===void 0&&(o[p]=[]),o[p].push(f.morphAttributes[p]),u++}if(u!==s.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+d+". Make sure all geometries have the same number of morph attributes."),null;if(t){let p;if(e)p=f.index.count;else if(f.attributes.position!==void 0)p=f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+d+". The geometry must have either an index or a position attribute"),null;l.addGroup(h,p,d),h+=p}}if(e){let d=0;const f=[];for(let c=0;c<i.length;++c){const u=i[c].index;for(let p=0;p<u.count;++p)f.push(u.getX(p)+d);d+=i[c].attributes.position.count}l.setIndex(f)}for(const d in r){const f=uh(r[d]);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+d+" attribute."),null;l.setAttribute(d,f)}for(const d in o){const f=o[d][0].length;if(f!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[d]=[];for(let c=0;c<f;++c){const u=[];for(let _=0;_<o[d].length;++_)u.push(o[d][_][c]);const p=uh(u);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+d+" morphAttribute."),null;l.morphAttributes[d].push(p)}}}return l}function uh(i){let t,e,n,s=-1,r=0;for(let h=0;h<i.length;++h){const d=i[h];if(t===void 0&&(t=d.array.constructor),t!==d.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=d.itemSize),e!==d.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=d.normalized),n!==d.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=d.gpuType),s!==d.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=d.count*e}const o=new t(r),a=new En(o,e,n);let l=0;for(let h=0;h<i.length;++h){const d=i[h];if(d.isInterleavedBufferAttribute){const f=l/e;for(let c=0,u=d.count;c<u;c++)for(let p=0;p<e;p++){const _=d.getComponent(c,p);a.setComponent(c+f,p,_)}}else o.set(d.array,l);l+=d.count*e}return s!==void 0&&(a.gpuType=s),a}function Px(i,t=Math.PI/3){const e=i.index?i.toNonIndexed():i,n=e.attributes.position,s=n.count;let r;if(n.isBufferAttribute===!0&&n.itemSize===3&&n.normalized===!1)r=n.array;else{r=new Float64Array(s*3);for(let M=0;M<s;M++)r[3*M+0]=n.getX(M),r[3*M+1]=n.getY(M),r[3*M+2]=n.getZ(M)}const o=Math.cos(t),a=(1+1e-10)*100,l=s/3,h=new Float64Array(l*3);for(let M=0;M<l;M++){const A=9*M,b=r[A+0],v=r[A+1],E=r[A+2],D=r[A+3],P=r[A+4],L=r[A+5],U=r[A+6],V=r[A+7],N=r[A+8],z=U-D,k=V-P,G=N-L,st=b-D,C=v-P,B=E-L,W=k*B-G*C,ot=G*st-z*B,yt=z*C-k*st,J=1/(Math.sqrt(W*W+ot*ot+yt*yt)||1);h[3*M+0]=W*J,h[3*M+1]=ot*J,h[3*M+2]=yt*J}const d=new Int32Array(s),f=new Float64Array(s*3);let c=1;for(;c<s*2;)c<<=1;const u=c-1,p=new Int32Array(c);let _=0;for(let M=0;M<s;M++){const A=3*M,b=Math.trunc(r[A+0]*a),v=Math.trunc(r[A+1]*a),E=Math.trunc(r[A+2]*a);let D=(Math.imul(b,73856093)^Math.imul(v,19349663)^Math.imul(E,83492791))&u;for(;;){const P=p[D];if(P===0){const U=3*_;f[U+0]=b,f[U+1]=v,f[U+2]=E,p[D]=_+1,d[M]=_++;break}const L=3*(P-1);if(f[L+0]===b&&f[L+1]===v&&f[L+2]===E){d[M]=P-1;break}D=D+1&u}}const m=new Int32Array(_+1);for(let M=0;M<s;M++)m[d[M]+1]++;for(let M=0;M<_;M++)m[M+1]+=m[M];const g=new Int32Array(s),x=m.slice(0,_);for(let M=0;M<l;M++){const A=3*M;g[x[d[A+0]]++]=M,g[x[d[A+1]]++]=M,g[x[d[A+2]]++]=M}const y=new Float32Array(s*3);for(let M=0;M<l;M++){const A=3*M,b=h[A+0],v=h[A+1],E=h[A+2];for(let D=0;D<3;D++){const P=A+D,L=d[P];let U=0,V=0,N=0;for(let k=m[L],G=m[L+1];k<G;k++){const st=3*g[k],C=h[st+0],B=h[st+1],W=h[st+2];b*C+v*B+E*W>o&&(U+=C,V+=B,N+=W)}const z=1/(Math.sqrt(U*U+V*V+N*N)||1);y[3*P+0]=U*z,y[3*P+1]=V*z,y[3*P+2]=N*z}}return e.setAttribute("normal",new En(y,3,!1)),e}const it=(i,t,e)=>new T(i,t,e),It=(i,t)=>({...i,name:t});function Xa(i,t){for(const e of i)e.geometry.applyMatrix4(t);return i}function Lx(i){const t=i.plan;return t.kind==="humanoid"?Fx(i,t):t.kind==="animal"?Bx(i,t):Dx(i)}function Dx(i){const t=i.height,e=i.footprint?Math.min(i.footprint.width,i.footprint.depth):.36*(t/1.75),n=Math.max(.02,Math.min(e*.45,t/4));return[It(Re(it(0,0,n),it(0,0,Math.max(n*1.01,t-n)),n,i.colours.skin),"placeholder")]}const fh=[.8,.4,.1,-.25,.6,-.1,.25];function Ix(i,t){const e=i.geometry.index?i.geometry.toNonIndexed():i.geometry;e!==i.geometry&&i.geometry.dispose();const n=e.getAttribute("position").count;e.setIndex([...Array(n).keys()]),e.computeVertexNormals();const s=new Float32Array(n);for(let r=0;r<n/3;r++)s.fill(fh[r*3%fh.length],r*3,r*3+3);return{...i,geometry:e,shade:s,tone:t}}const Xo=new T(.85,1.35,.85);function Nx(i,t,e,n){const s=i.colours,r=t.headColour??s.skin,o=s.eyes??Fn,a=[],l=h=>[-1,1].map(h);switch(t.head){case"wolf":{a.push(It(ne(it(0,0,0),e,r,it(.92,.95,.9),12),"skull")),a.push(It(ne(it(0,e*.95,-e*.28),e*.5,t.accent,it(.72,1.55,.68),10),"muzzle")),a.push(It(ne(it(0,e*.8,-e*.58),e*.36,t.accent,it(.66,1.3,.45),8),"jaw")),a.push(It(ne(it(0,e*1.7,-e*.18),e*.15,Fn,void 0,8),"nose")),a.push(...l(h=>It(ai(it(h*e*.5,-e*.1,e*.6),it(h*.32,-.1,1).normalize(),e*.28,e*.85,r,4),"ear"))),a.push(...l(h=>It(ne(it(h*e*.36,e*.74,e*.16),e*.11,o,void 0,8),"eye")));break}case"slack":{a.push(It(ne(it(0,0,0),e,r,it(.84,.95,1),12),"skull")),a.push(...l(h=>It(ne(it(h*e*.32,e*.84,e*(h<0?.14:.06)),e*.11,o,void 0,8),"eye"))),a.push(...l(h=>It(ne(it(h*e*.32,e*.93,e*(h<0?.14:.06)),e*.04,Fn,void 0,6),"pupil"))),a.push(It(je(new Si(e*.13,e*.3,6),r,it(0,e*.98,-e*.08)),"nose")),a.push(It(ne(it(0,e*.84,-e*.48),e*.16,t.accent,it(1.2,.5,1),8),"mouth")),a.push(...l(h=>It(ne(it(h*e*.84,0,0),e*.22,r,it(.5,1,1.3),8),"ear")));break}case"ghoul":{a.push(It(ne(it(0,0,e*.08),e,r,it(.8,.92,1),12),"skull")),a.push(It(ne(it(0,e*.32,-e*.55),e*.62,t.accent,it(1.08,.95,.72),10),"jaw")),a.push(It(li(it(0,e*.92,-e*.58),it(e*.7,e*.06,e*.07),Fn),"mouth")),a.push(...l(h=>It(ne(it(h*e*.3,e*.78,e*.18),e*.09,o,void 0,8),"eye"))),a.push(...l(h=>It(ai(it(h*e*.74,0,e*.1),it(h,-.3,.5).normalize(),e*.16,e*.4,r,4),"ear")));break}case"primate":{a.push(It(ne(it(0,0,0),e,r,it(.95,.9,.95),12),"skull")),a.push(It(ne(it(0,e*.42,-e*.08),e*.7,t.accent,it(.85,.75,.95),10),"face")),a.push(It(Re(it(-e*.46,e*.82,e*.26),it(e*.46,e*.82,e*.26),e*.14,r,!1),"brow")),a.push(It(ne(it(0,e*.86,-e*.36),e*.38,t.accent,it(1.1,.8,.75),8),"muzzle")),a.push(...l(h=>It(ne(it(h*e*.12,e*1.15,-e*.3),e*.05,Fn,void 0,6),"nostril"))),a.push(...l(h=>It(ne(it(h*e*.3,e*.92,e*.1),e*.09,o,void 0,8),"eye"))),a.push(...l(h=>It(ne(it(h*e*.95,0,0),e*.26,t.accent,it(.5,1,1.1),8),"ear")));break}case"crystal":{a.push(It(je(new El(e,0),r,it(0,0,0),void 0,it(.86,.95,1.05)),"skull")),a.push(...l(h=>It(je(new wl(e*.12,0),o,it(h*e*.32,e*.82,e*.12)),"eye"))),a.push(It(ai(it(e*.15,-e*.2,e*.75),it(.25,-.35,1).normalize(),e*.2,e*.7,t.accent,4),"spur"));break}case"shark":{a.push(It(ne(it(0,e*.25,0),e,r,Xo,12),"snout")),a.push(It(ne(it(0,e*.32,-e*.3),e,t.accent,it(.78,1.25,.58),10),"underside"));const h=1.9,d=new si(1,.06,3,16,h);d.rotateZ(Math.PI/2-h/2),d.scale(e*.8,e*1.27,e),d.translate(0,e*.32,-e*.36),a.push(It({geometry:d,colour:Fn},"mouth"));for(const _ of[-1,1]){const m=48*Math.PI/180;a.push(It(ne(it(_*e*Xo.x*Math.sin(m),e*.25+e*Xo.y*Math.cos(m),e*.08),e*.12,o,void 0,8),"eye")),a.push(It(ne(it(_*e*.17,e*1.54,-e*.1),e*.045,Fn,void 0,6),"nostril"));for(let g=0;g<3;g++)a.push(It(li(it(_*e*.5,-e*(.05+g*.14),-e*.82),it(e*.05,e*.035,e*.3),kr(r,Fn,.55)),"gill"))}const f=-e*.45,c=-e*1.2,u=new Gn(e*.6,n*1.05,f-c,12,1);u.rotateX(Math.PI/2),u.translate(0,e*.05,(f+c)/2),a.push(It({geometry:u,colour:r},"taper"));const p=new Si(e*.42,e*.95,4);p.scale(.22,1,1),p.rotateX(Math.PI/2-.45),a.push(It(je(p,r,it(0,-e*.2,e*.95)),"fin"));break}}if(i.headCovered){const h=new Vn(e*1.08,12,5,0,Math.PI*2,0,Math.PI/2);h.rotateX(-.5),a.push(It({geometry:h,colour:s.head},"hood"))}return a}const Ux=new T(0,.04,.62),Ox=new T(0,-.05,.14);function Fx(i,t){const e=i.colours,n=i.height,s=n/1.75,r=t.covering==="crystal",o=i.posture==="sitting",a=n*i.legShare,l=.26*n,h=o?a-l:0,d=a-h,f=i.headHeight/2,c=i.limbRadius*1.15,u=i.hipHalf*.55,p=.06*s,_=[];for(const z of[-1,1]){const k=z*u;if(o){const G=it(k,.24*n,l);_.push(Re(it(k,0,d),G,c,e.legs,!r)),_.push(Re(G,it(k,.24*n,p+c),c*.9,e.legs,!r)),_.push(li(it(k,.24*n+.04*s,p/2),it(c*2.2,.16*s,p),e.feet))}else if(t.digitigrade){const G=Ux.clone().multiply(it(1,n,d)).setX(k),st=Ox.clone().multiplyScalar(n).setX(k);_.push(It(Re(it(k,0,d),G,c*1.15,e.legs,!r),"thigh")),_.push(It(Re(G,st,c*.85,e.legs,!r),"shin")),_.push(It(Re(st,it(k,.03*n,p),c*.65,e.feet,!r),"heel")),_.push(It(ne(it(k,.06*n,p*.6),c*1.05,e.feet,it(1,1.7,.6),8),"paw"))}else _.push(Re(it(k,0,p+c),it(k,0,d-c*.5),c,e.legs,!r)),_.push(li(it(k,.04*s,p/2),it(c*2.2,.16*s,p),e.feet))}const m=new re().makeRotationX(-t.hunch),g=new re().makeTranslation(0,0,d).multiply(m),x=(n-h-d)/Math.cos(t.hunch),y=.045*n,M=x-i.headHeight-y,A=.05*n,b=M-i.limbRadius*1.2,v=.045*s*t.shape.limbs*(t.neckScale??1),E=r?6:void 0,D=[fs(-.07*n,A,i.hipHalf,i.waistHalf,.62,e.hips,0,E),fs(A,M,i.waistHalf,i.shoulderHalf*.92,.55,e.torso,0,E),Re(it(-i.shoulderHalf*.9,0,b),it(i.shoulderHalf*.9,0,b),i.limbRadius*1.35,e.torso,!r),fs(M-.01,x-f*1.6,v,v,1,e.neck,0,E)];if(t.chest&&e.torso===e.skin){const z=M-A;D.push(It(ne(it(0,i.shoulderHalf*.1,A+z*.7),1,t.accent,it(i.shoulderHalf*.72,i.shoulderHalf*.42,z*.24),12),"chest")),D.push(It(ne(it(0,i.waistHalf*.12,A+z*.35),1,t.accent,it(i.waistHalf*.6,i.waistHalf*.45,z*.3),12),"chest"))}if(r)for(const[z,k,G,st,C]of[[-.75,-.1,-.5,-.3,1],[.7,-.15,.45,-.4,.8],[.25,-.45,.2,-.8,.9],[-.3,-.4,-.3,-.7,.7]])D.push(It(ai(it(z*i.shoulderHalf,k*i.shoulderHalf,b+i.limbRadius*.4),it(G,st,1).normalize(),.035*s*C,.16*s*C,t.accent,4),"shard"));_.push(...Xa(D,g));const P=it(0,0,x-f).applyMatrix4(g),L=new re().makeRotationFromEuler(new ke(-t.droop,t.droop*.6,0));_.push(...Xa(Nx(i,t,f,v),new re().makeTranslation(P.x,P.y,P.z).multiply(L)));const U=o?d+.02*n:Math.max(.05*n,t.wristShare*n);for(const z of[-1,1]){const k=it(z*i.shoulderHalf,0,b).applyMatrix4(g),G=Math.max(.12*n,k.z-U),st=it(z*(i.hipHalf+i.limbRadius*1.6),k.y+Math.tan(t.reach)*G+(o?.08*s:0),k.z-G);_.push(It(Re(k,st,i.limbRadius,e.arms,!r),"arm"));const C=st.clone().sub(k).normalize();_.push(It(ne(st.clone().addScaledVector(C,i.limbRadius*1.3),i.limbRadius*1.25,e.hands,void 0,8),"hand"))}const V=e.skin,N=P.z+f*.8;for(const z of i.extras)if(z==="tail"){const k=it(0,-i.hipHalf*.6,d),G=it(0,k.y-.3*s,o?.04:d-.16*n);_.push(It(Re(k,G,i.limbRadius*(t.covering==="fur"?.85:.6),V,!1),"tail"))}else if(z==="horns"||z==="antlers")for(const k of[-1,1]){const G=it(P.x+k*f*.45,P.y,N);z==="horns"?_.push(It(ai(G,it(k*.35,.2,1).normalize(),f*.16,f*.7,Ns,6),"horn")):_.push(It(Re(G,G.clone().add(it(k*f,-f*.2,f*1.4)),f*.07,Ns,!1),"antler"))}else if(z==="wings")for(const k of[-1,1])_.push(It(Iu(k,s,it(k*i.shoulderHalf*.45,-.1*s,b-.04*n).applyMatrix4(g),V),"wing"));return r?_.map(z=>Ix(z,t.accent)):_}function Bx(i,t){var f,c,u,p;const e=i.height,n=t.animal==="snake",s=n?Wx(t,((f=i.footprint)==null?void 0:f.width)??e*2,((c=i.footprint)==null?void 0:c.depth)??e*8,e):t.animal==="duck"?zx(t):Hx(t),r=new mn;for(const _ of s)_.geometry.computeBoundingBox(),_.geometry.boundingBox&&r.union(_.geometry.boundingBox);const o=r.getSize(new T),a=r.getCenter(new T),l=((u=i.footprint)==null?void 0:u.width)??e*(o.x/o.z),h=((p=i.footprint)==null?void 0:p.depth)??e*(o.y/o.z),d=n?1:t.animal==="songbird"?Math.min(l/o.x,e/o.z):Math.min(l/o.x,h/o.y,e/o.z);return Xa(s,new re().makeScale(d,d,d).multiply(new re().makeTranslation(-a.x,-a.y,-r.min.z)))}function zx(i){const t=kr(i.skin,Fn,.65),e=[It(ne(it(0,-.02,.32),.2,i.skin,it(1.1,2.05,.95),12),"body"),It(ne(it(0,.24,.3),.17,i.accent,it(1.05,1,1.05),10),"breast"),...[-1,1].map(n=>It(ne(it(n*.16,-.08,.38),.13,i.wing,it(.55,2.1,.75),10),"wing")),It(ai(it(0,-.38,.37),it(0,-1,.4).normalize(),.09,.17,t,5),"tail"),It(Re(it(0,.3,.42),it(0,.36,.6),.065,i.head,!1),"neck"),It(je(new si(.068,.014,3,10),"#f2f0ea",it(0,.31,.45)),"ring"),It(ne(it(0,.38,.65),.1,i.head,it(.9,1.15,.95),10),"head"),It(ne(it(0,.53,.61),.06,i.beak,it(.9,1.6,.38),8),"bill"),...[-1,1].map(n=>It(ne(it(n*.072,.42,.68),.013,i.eyes,void 0,6),"eye"))];for(const n of[-1,1])e.push(It(Re(it(n*.07,.02,.15),it(n*.07,.04,.02),.018,i.feet,!1),"leg")),e.push(It(li(it(n*.07,.08,.008),it(.08,.1,.016),i.feet),"foot"));return e}function Hx(i){const t=[It(ne(it(0,0,.33),.2,i.skin,it(.9,1.35,1),12),"body"),It(ne(it(0,.17,.31),.15,i.accent,it(.9,.95,1),10),"breast"),It(ne(it(0,.2,.57),.12,i.head,void 0,10),"head"),It(ai(it(0,.29,.57),it(0,1,-.15).normalize(),.045,.13,i.beak,5),"beak"),It(li(it(0,-.4,.41),it(.16,.26,.025),i.wing,new ke(-.5,0,0)),"tail"),...[-1,1].map(e=>It(ne(it(e*.085,.28,.61),.02,i.eyes,void 0,6),"eye")),...[-1,1].map(e=>It(ne(it(e*.15,-.1,.39),.12,i.wing,it(.35,2,.75),8),"wing"))];for(const e of[-1,1])t.push(It(Re(it(e*.05,.03,.16),it(e*.05,.05,.02),.012,i.feet,!1),"leg")),t.push(It(li(it(e*.05,.08,.006),it(.03,.08,.012),i.feet),"foot"));return t}const kx=.03,Gx=.6,Vx=.022;function Wx(i,t,e,n){const s=Math.max(Gx,t,e,n),r=Math.max(kx,s*Vx),o=r*1.3,a=Math.max(s*.1,Math.min(s*.15,n-2*r-o)),l=[];if(e>=s*.8){const x=e*.85,y=Math.max(r*1.5,Math.min(t/2-r*1.2,s*.12));for(let M=0;M<=14;M++)l.push(it(y*Math.sin(M/14*Math.PI*2.5),-x/2+M/14*x*.9,r))}else{const x=r*2.3,y=r*2.2,A=(Math.sqrt(s*.85*x/Math.PI+y*y)-y)/x,b=Math.max(16,Math.min(40,Math.round(A*14)));for(let v=0;v<=b;v++){const E=A*Math.PI*2*(1-v/b),D=y+x*E/(Math.PI*2);l.push(it(D*Math.sin(E),D*Math.cos(E),r))}}const h=l[l.length-1],d=it(0,1,0),f=x=>h.clone().addScaledVector(d,s*.06*Math.sin(x*Math.PI/2)).setZ(r+a*(1-Math.cos(x*Math.PI/2))),c=[1,2,3,4].map(x=>f(x/4)),u=[...l,...c],p=[];for(let x=0;x<u.length-1;x++){const y=(x+.5)/(u.length-1),M=x>=l.length-1,A=r*(.3+.7*Math.min(1,y/.3))*(M?.85:1);p.push(It(Re(u[x],u[x+1],A,!M&&Math.floor(x/2)%2?i.accent:i.skin,!1),"segment"))}const _=u[u.length-1].clone().addScaledVector(d,o*.9),m=new ke(0,0,0);p.push(It(je(new Vn(o,10,8),i.head,_,m,it(1,1.5,.7)),"head"));for(const x of[-1,1]){const y=it(x*o*.75,o*.45,o*.3).applyEuler(m).add(_);p.push(It(ne(y,o*.2,i.eyes,void 0,6),"eye"))}const g=_.clone().addScaledVector(d,o*1.45);return p.push(It(Re(g,g.clone().addScaledVector(d,o*1.1),o*.08,i.beak,!1),"tongue")),p}const de=(i,t)=>({...i,name:t}),lo=10,Yo="#ece8e0",Xx=1.3,Yx=Fn,Ya=.006,ns=1.03,qo=.005,qx=.66;function je(i,t,e,n,s){const r=new re().compose(e,new ze().setFromEuler(n??new ke),s??new T(1,1,1));return i.applyMatrix4(r),{geometry:i,colour:t}}const Du=.05,Zx=14,Kx=1.45,Jx=.15,$x=1.8;function Br(i,t,e,n,s=1,r,o=()=>1,a=0,l={swing:1.6,lobes:5,strands:0}){if(e==="straight")return;const h=new Float32Array(i.getAttribute("position").count),d=i.getAttribute("position"),f=new T,c=new T,u=new T;for(let p=0;p<d.count;p++){f.fromBufferAttribute(d,p),c.subVectors(f,t(f)),u.copy(f);const _=Math.atan2(u.y-t(f).y,u.x-t(f).x),m=((u.z-a)*s+a)/n,[g,x]=e==="wavy"?[Du,Math.sin(m*7+l.swing*Math.sin(_*l.lobes)+l.strands*Math.sin(_*17))]:e==="curly"?[.09,Math.sin(_*7)*Math.sin(m*9)]:[.1,Math.sin(_*11)*Math.sin(m*14)];h[p]=.5+.5*x;const y=n*g*h[p]*o(f,p)/Math.max(1e-6,c.length());f.addScaledVector(c,y),d.setXYZ(p,f.x,f.y,f.z)}return d.needsUpdate=!0,i.computeVertexNormals(),h}function Qx(i,t,e,n,s,r,o,a){const l=i.getAttribute("position"),h=l.count/2,d=h/(t+1)-1,f=new Float32Array(l.count),c=new T,u=new T;for(let p=0;p<l.count;p++){const _=p%h,[m,g]=[_%(t+1),Math.floor(_/(t+1))],x=Math.floor(m/2),y=m%2===1,M=U=>{const V=Math.sin(x*12.9898+U*78.233)*43758.5453;return V-Math.floor(V)},A=2*Math.PI*g/(e*(.67+.83*M(1)))+2*Math.PI*M(2),b=Math.min(1,Math.min(m,t-m)/2),v=(y?.45+.3*M(3)+.3*Math.sin(A):.12)*b,E=y?(.2+.15*M(4))*Math.cos(A)*b:0;c.fromBufferAttribute(l,p),u.subVectors(c,n(c));const D=Math.max(1e-6,Math.hypot(u.x,u.y)),P=a(c,m),L=E*D*s/t;c.x+=(u.x/D*r*.12*v+-u.y/D*L)*P,c.y+=(u.y/D*r*.12*v+u.x/D*L)*P,g===d&&y&&(c.z-=o*M(5)),l.setXYZ(p,c.x,c.y,c.z),f[p]=v}return l.needsUpdate=!0,i.computeVertexNormals(),f}const us=.75,Zo={straight:0,wavy:us*.375,curly:us*.3125,coily:us*.3125};function jx(i,t,e){return!t||!e?i:{...i,shade:t.map(n=>us*n*n),tone:e}}function qa(i,t){const e=new Float32Array(i);for(let n=0;n<i;n++)e[n]=n%t%2?1:.15;return e}const dh=16,ph=4,ce=i=>{const t=Math.min(1,Math.max(0,i));return t*t*(3-2*t)};function Pr(i){const t=Math.abs(i-Math.PI/2);return .96+.79*ce((t-.25)/.9)-.79*ce((t-1.5)/.5)}function mh(i,t,e,n,s,r,o){const a=[],l=[];for(let f=0;f<=e;f++)for(let c=0;c<=t;c++){const u=n+s*c/t,p=r(u)+(o(u)-r(u))*f/e;a.push(-i*Math.cos(u)*Math.sin(p),i*Math.cos(p),i*Math.sin(u)*Math.sin(p))}const h=(f,c)=>c*(t+1)+f;for(let f=0;f<e;f++)for(let c=0;c<t;c++){const u=h(c+1,f),p=h(c,f),_=h(c,f+1),m=h(c+1,f+1);l.push(u,p,m,p,_,m)}const d=new Le;return d.setAttribute("position",new ue(a,3)),d.setIndex(l),d.computeVertexNormals(),d}function tv(i,t){const e=i.getIndex();if(e){for(let n=0;n<e.count;n++){const s=e.getX(n),[r,o]=[s%(t+1),Math.floor(s/(t+1))];o===0?e.setX(n,0):r===t&&e.setX(n,o*(t+1))}e.needsUpdate=!0,i.computeVertexNormals(),Za(i,t)}}function Za(i,t){const e=i.getAttribute("normal");for(let n=0;n<e.count;n++){const[s,r]=[n%(t+1),Math.floor(n/(t+1))],o=r===0?0:s===t?r*(t+1):n;o!==n&&e.setXYZ(n,e.getX(o),e.getY(o),e.getZ(o))}e.needsUpdate=!0}function Ka(i){const t=i.clone(),e=t.getIndex();if(e){const r=e.array,o=new Uint32Array(r.length);for(let a=0;a<r.length;a+=3)o[a]=r[a],o[a+1]=r[a+2],o[a+2]=r[a+1];t.setIndex(new En(o,1))}const n=t.getAttribute("normal");for(let r=0;r<n.count;r++)n.setXYZ(r,-n.getX(r),-n.getY(r),-n.getZ(r));const s=ao([i,t],!1);if(i.dispose(),t.dispose(),!s)throw new Error("hair could not be made two-sided");return s}function ev(i,t,e,n,s){const r=i.getAttribute("position"),o=[],a=new T;for(let u=0;u<=t;u++)o.push(r.getX(e*(t+1)+u),r.getY(e*(t+1)+u),r.getZ(e*(t+1)+u));for(let u=0;u<=t;u++){a.set(o[u*3],o[u*3+1],o[u*3+2]).sub(n);const p=Math.min(a.length(),s(a.clone().normalize()));a.setLength(p).add(n),o.push(a.x,a.y,a.z)}const l=[];for(let u=0;u<t;u++){const p=u+1===t?0:u+1,[_,m,g,x]=[u,p,t+1+u,t+1+p];l.push(_,g,m,m,g,x)}const h=new Le;h.setAttribute("position",new ue(o,3)),h.setIndex(l),h.computeVertexNormals();const d=Ka(h),f=d.getAttribute("normal"),c=i.getAttribute("normal");for(let u=0;u<f.count;u++){const p=e*(t+1)+u%(t+1);f.setXYZ(u,c.getX(p),c.getY(p),c.getZ(p))}return d}function Iu(i,t,e,n){const s=new uu;s.moveTo(0,0),s.quadraticCurveTo(.15,.32,.62,.44),s.quadraticCurveTo(.56,.26,.5,.2),s.quadraticCurveTo(.46,.05,.37,.08),s.quadraticCurveTo(.33,-.1,.23,-.05),s.quadraticCurveTo(.18,-.26,.08,-.22),s.quadraticCurveTo(.04,-.1,0,-.08),s.closePath();const r=new yl(s,{depth:.015,bevelEnabled:!1,curveSegments:4});return r.setIndex([...Array(r.getAttribute("position").count).keys()]),r.translate(0,0,-.0075),r.rotateX(Math.PI/2),i<0&&r.rotateZ(Math.PI),r.rotateZ(-i*.5),r.scale(t,t,t),r.translate(e.x,e.y,e.z),{geometry:r,colour:n}}const Li=(i,t,e,n)=>Re(i,t,e,n,!1);function Re(i,t,e,n,s=!0){const r=i.distanceTo(t),o=new xl(e,Math.max(.001,r),s?2:1,s?lo:6),a=new T().subVectors(t,i).normalize(),l=new ze().setFromUnitVectors(new T(0,1,0),a);return o.applyMatrix4(new re().compose(i.clone().add(t).multiplyScalar(.5),l,new T(1,1,1))),{geometry:o,colour:n}}function fs(i,t,e,n,s,r,o=0,a=lo*2){const l=new Gn(n,e,Math.max(.001,t-i),a);return je(l,r,new T(0,o,(i+t)/2),new ke(Math.PI/2,0,0),new T(1,1,s))}function ne(i,t,e,n,s=lo){return je(new Vn(t,s,Math.max(4,s-2)),e,i,void 0,n)}function li(i,t,e,n){return je(new qn(t.x,t.y,t.z),e,i,n)}function is(i,t,e,n,s,r){const o=new Gn(n,n,Ya,lo*2,1,!0);return je(o,r,new T(i,t,e),new ke(Math.PI/2,0,0),new T(1,1,s))}function ai(i,t,e,n,s,r=5){const o=new Si(e,n,r,1,!0);return o.applyMatrix4(new re().compose(i.clone().addScaledVector(t,n/2),new ze().setFromUnitVectors(new T(0,1,0),t),new T(1,1,1))),{geometry:o,colour:s}}function nv(i,t,e,n){const[s,r]=[1.25,-2.3],o=14,a=[],l=[];for(let f=0;f<=o;f++){const c=f/o,u=s+(r-s)*c,p=Math.min(1,c/.12,(1-c)/.12),_=1+n*Math.sqrt(Math.max(0,p)),[m,g]=[Math.sin(u),Math.cos(u)];for(const[x,y]of[[1,.1],[_,.055]])for(const M of[-1,1])a.push(M*y*i,m*x*i*t.y,e+g*x*i*t.z)}const h=(f,c)=>f*4+c;for(let f=0;f<o;f++)for(const[c,u]of[[1,3],[2,0],[3,2]])l.push(h(f,c),h(f+1,u),h(f+1,c),h(f,c),h(f,u),h(f+1,u));l.push(h(0,0),h(0,3),h(0,1),h(0,0),h(0,2),h(0,3)),l.push(h(o,0),h(o,1),h(o,3),h(o,0),h(o,3),h(o,2));const d=new Le;return d.setAttribute("position",new ue(a,3)),d.setIndex(l),d.computeVertexNormals(),d}const Nu=8;function iv(i,t,e){const n=Nu,s=2,r=[];for(let h=0;h<=s;h++)for(let d=0;d<=n;d++){const f=d/n,c=-.45+1.55*f,u=.95-.5*Math.min(1,f/.6)+.45*h/s,p=new T(Math.cos(u)*Math.sin(c)*i.x,Math.cos(u)*Math.cos(c)*i.y,Math.sin(u)*i.z).normalize(),_=e(p).multiplyScalar(1.03);r.push(_.x,_.y,t+_.z)}const o=[],a=(h,d)=>d*(n+1)+h;for(let h=0;h<s;h++)for(let d=0;d<n;d++)o.push(a(d,h),a(d+1,h+1),a(d+1,h),a(d,h),a(d,h+1),a(d+1,h+1));const l=new Le;return l.setAttribute("position",new ue(r,3)),l.setIndex(o),l.computeVertexNormals(),l}function sv(i,t,e,n,s,r,o){const a=i.height/1.75,l=i.colours.head,h=i.colours.hairSheen,d={none:0,shaved:0,cropped:.04,short:.08,"chin-length":.18,"shoulder-length":.28,long:.42,"waist-length":.58}[i.hair]*a,f=(u,p,_,m=1.08)=>{const g=new T(u,p,_).normalize();return new T(g.x*n*s.x*m,g.y*n*s.y*m,e+g.z*n*s.z*m)},c=[];switch(t){case"ponytail":{const u=f(0,-1,.25,1.05),p=new T(0,u.y-n*.35,u.z-Math.max(d,.1*a));c.push(de(Re(u,p,n*.2,l),"ponytail")),c.push(de(ne(u,n*.14,i.colours.ink,void 0,6),"ponytail"));break}case"braided":for(const u of[-1,1]){const p=f(u*.75,-.55,-.35,1.02),_=new T(u*n*.85,-n*.95,p.z-Math.max(d,.12*a));c.push(de(Re(p,_,n*.13,l),"braid"));const m=7;for(let g=0;g<m;g++)c.push(de(ne(p.clone().lerp(_,g/(m-1)),n*.17,l,void 0,6),"braid"))}break;case"bun":{const u=n*.46,p=f(0,-.65,.76,r+.36),_=de(ne(p,u,l,void 0,12),"bun"),m=Br(_.geometry,()=>p,i.hairTexture,n*.6),g=_.geometry.getAttribute("normal"),x=new T(0,-.35,1).normalize(),y=new Float32Array(g.count);for(let b=0;b<g.count;b++){const v=Math.max(0,g.getX(b)*x.x+g.getY(b)*x.y+g.getZ(b)*x.z);y[b]=Math.min(1,.55*v*v+(m?.4*m[b]*m[b]:0))}c.push(h?{..._,shade:y,tone:h}:_);const M=f(0,-.65,.76,r+.02),A=new si(u*.62,n*.06,4,14);A.applyQuaternion(new ze().setFromUnitVectors(new T(0,0,1),p.clone().sub(M).normalize())),A.translate(...M.clone().lerp(p,.45).toArray()),c.push(de({geometry:A,colour:h??i.colours.ink},"bun"));break}case"topknot":{const u=f(0,-.1,1,1.22);c.push(de(ne(u,n*.26,l,void 0,8),"topknot")),c.push(de(ne(f(0,-.1,1,1.05),n*.14,i.colours.ink,void 0,6),"topknot"));break}case"dreadlocks":for(let u=0;u<11;u++){const p=Math.PI*(.9+1.2*u/10),_=f(Math.cos(p),Math.sin(p),.15,1.02),m=new T(_.x*1.2,_.y*1.2,_.z-Math.max(d,.1*a)*(u%2?.85:1));c.push(de(Li(_,m,n*.11,l),"lock"))}break;case"spiky":for(let u=0;u<9;u++){const p=u*Math.PI*2/8,_=u===8?new T(0,0,1):new T(Math.cos(p)*.7,Math.sin(p)*.7,.75).normalize();c.push(de(ai(f(_.x,_.y,_.z,1),_,n*.14,n*.55,l),"spike"))}break;case"mohawk":c.push(de({geometry:nv(n,s,e,i.hair==="cropped"?.5:.65),colour:l},"crest"));break;case"brushed":{c.push(de(Li(f(-.32,.45,.85,1.07),f(-.32,-.45,.85,1.07),n*.035,i.colours.skin),"parting"));const u=iv(s,e,o),p=h?{shade:qa(u.getAttribute("position").count,Nu+1).map(_=>_*.5),tone:h}:{};c.push(de({geometry:u,colour:l,...p},"fringe"));break}}return c}const rv={average:{half:.26,depth:.16},small:{half:.19,depth:.12},large:{half:.34,depth:.2},pointed:{half:.26,depth:.15}};function ov(i){const t=i.colours,e=i.height,n=e/1.75,s=[],r=i.posture==="sitting",o=e*i.legShare,a=.26*e,l=r?o-a:0,h=o-l,d=e-i.headHeight-.045*e-l,f=e-i.headHeight/2-l,c=i.headHeight/2,u=i.limbRadius*1.15,p=i.hipHalf*.55,_=.06*n,m=new Set(i.outlined);for(const Z of[-1,1]){const lt=Z*p;if(r){const at=new T(lt,.24*e,a);s.push(Re(new T(lt,0,h),at,u,t.legs)),s.push(Re(at,new T(lt,.24*e,_+u),u*.9,t.legs)),s.push(li(new T(lt,.24*e+.04*n,_/2),new T(u*2.2,.16*n,_),t.feet)),m.has("ankles")&&s.push(de(is(lt,.24*e,_+.02*n,u*ns,1,t.ink),"band"))}else s.push(Re(new T(lt,0,_+u),new T(lt,0,h-u*.5),u,t.legs)),s.push(li(new T(lt,.04*n,_/2),new T(u*2.2,.16*n,_),t.feet)),m.has("ankles")&&s.push(de(is(lt,0,_+.02*n,u*ns,1,t.ink),"band"));m.has("hips")&&s.push(de(is(lt,r?.06*n:0,h-.07*e-Ya,u*ns,1,t.ink),"band"))}const g=h+.05*e;s.push(fs(h-.07*e,g,i.hipHalf,i.waistHalf,.62,t.hips)),s.push(fs(g,d,i.waistHalf,i.shoulderHalf*.92,.55,t.torso));const x=d-i.limbRadius*1.2;s.push(Re(new T(-i.shoulderHalf*.9,0,x),new T(i.shoulderHalf*.9,0,x),i.limbRadius*1.35,t.torso)),m.has("waist")&&s.push(de(is(0,0,g,i.waistHalf*ns,.62,t.ink),"band"));const y=h-.02*e;for(const Z of[-1,1]){const lt=new T(Z*i.shoulderHalf,0,x),at=new T(Z*(i.hipHalf+i.limbRadius*1.6),r?.08*n:0,y);s.push(Re(lt,at,i.limbRadius,t.arms)),s.push(ne(new T(at.x,at.y,at.z-i.limbRadius*1.3),i.limbRadius*1.25,t.hands,void 0,8)),m.has("wrists")&&s.push(de(is(at.x,at.y,at.z,i.limbRadius*ns,1,t.ink),"band"))}const M=.045*n;s.push(fs(d-.01,f-c*.6,M,M,1,t.neck));const A=d+i.limbRadius*.15+Ya;m.has("neck")&&s.push(de(is(0,0,A,M*ns,1,t.collarEdge),"band"));const b=new T(.84,.95,1);s.push(ne(new T(0,0,f),c,t.skin,b,14)),s.push(je(new Si(c*.13,c*.3,6),t.skin,new T(0,c*.98,f-c*.08),new ke(0,0,0)));const v=(Z,lt)=>c*b.y*Math.sqrt(Math.max(0,1-(Z/(c*b.x))**2-(lt/(c*b.z))**2));if(i.described&&!i.faceHidden){const Z=c*.1,lt=Ju(t.skin,Yo)<Xx?$u(t.skin,Yo):void 0;for(const S of[-1,1]){const H=S*c*.32,nt=c*.12,q=new T(H,v(H,nt),f+nt),ht=new T(S*.47,1,.12).normalize(),vt=new ze().setFromUnitVectors(new T(0,1,0),ht),Q=.6,et=Z/Math.sin(Q),Mt=q.clone().addScaledVector(ht,-et*Math.cos(Q)+Z*.05),I=(Yt,gt,ut,Pt)=>{const ft=new Vn(Yt,Pt,gt>.4?2:1,0,Math.PI*2,0,gt);return ft.applyQuaternion(vt),ft.translate(Mt.x,Mt.y,Mt.z),de({geometry:ft,colour:ut},"eye")};if(s.push(I(et,Q,Yo,12)),s.push(I(et*1.015,Math.asin(Math.min(1,Z*.6/(et*1.015))),t.eyes??Yx,10)),lt){const Yt=new si(Z*1.1,Z*.2,3,12);Yt.applyQuaternion(new ze().setFromUnitVectors(new T(0,0,1),ht)),Yt.translate(q.x,q.y+Z*.06,q.z),s.push(de({geometry:Yt,colour:lt},"eyelid"))}const j=S*c*.16,K=S*c*.48,mt=c*.285,pt=t.brow,St=new T(j,v(j,mt),f+mt),Ut=new T(K,v(K,mt-c*.015),f+mt-c*.015);s.push(de(Li(St,Ut,c*.045,pt),"brow"))}const at=-c*.45,Dt=c*.24,R=new T(0,v(0,at-c*.04),f+at-c*.04);for(const S of[-1,1]){const H=new T(S*Dt,v(Dt,at),f+at);s.push(de(Li(R,H,c*.04,t.faceInk),"mouth"))}}const E=i.headCovered?"loose":i.hairStyle,D=!i.headCovered&&(E==="mohawk"||i.hair==="shaved"),P=D||E==="brushed"||E==="swept_back"?"straight":i.hairTexture,L=!i.headCovered&&!D&&E!=="voluminous"&&(i.hair==="cropped"||i.hair==="short"),U=i.headCovered?1.06:D?1.04:L?i.hair==="cropped"?1.035:1.05:1.05*i.hairVolume*(E==="voluminous"?1.25:1),V=i.hairTexture==="straight"||i.hairTexture==="wavy",N=L?i.hair==="short"?U*(V?1.32:i.hairVolume*1.065):U*i.hairVolume:U,z=Z=>ce((Z.z/Z.length()-.1)/.8),k=Z=>1+(N/U-1)*z(Z);let G=Z=>Z.clone().multiplyScalar(c),st=(Z,lt,at)=>0,C=Z=>Z.clone().normalize(),B=Z=>0,W=(Z,lt)=>Number.NEGATIVE_INFINITY,ot=(Z,lt,at)=>{};const yt=Qu.includes(E),rt={"chin-length":f-c*(i.hairTexture==="coily"?.85:i.hairTexture==="curly"?.95:1.15),"shoulder-length":x-.03*e,long:x-.12*e,"waist-length":g+.02*e}[i.hair],bt=!i.headCovered&&yt&&rt!==void 0,Nt=f+c*.1,ct=bt&&i.hair==="chin-length"&&(i.hairTexture==="curly"||i.hairTexture==="coily"),Ct=bt&&!ct&&P===i.hairTexture&&i.hairTexture!=="straight",Vt=bt&&i.hair!=="chin-length"&&(i.hairTexture==="curly"||i.hairTexture==="coily"),Bt=Z=>Vt?c*Jx*ce((Z-.5)/.5)*(1-ce((Z-1.8)/.3)):0,Xt=(Z,lt)=>{const at=Math.abs(Math.atan2(Z,-lt));return i.hair!=="chin-length"?Nt-c*.25*ce((at-1.6)/.3)+Bt(at):Nt},Zt=(Z,lt)=>1-ce((Math.abs(Math.atan2(Z,-lt))-(Vt?$x:.8))/.4),tt=(Z,lt)=>{if(ct&&i.hairTexture==="curly")return 1-ce((Nt-(Z.z+f))/(c*.1));if(!bt||ct)return 1;const at=1-ce((Nt+c*lt-(Z.z+f))/(c*lt))*ce((.45-Z.y/c)/.3);return Ct?at+(1-ce((Xt(Z.x,Z.y)+c*.03-(Z.z+f))/(c*.08))-at)*Zt(Z.x,Z.y):at},dt=Z=>tt(Z,.15),xt=Z=>tt(Z,.3);if(i.headCovered||i.hair!=="none"){const Z=!i.headCovered&&P!=="straight",lt=Z&&P==="coily",at=m.has("hairline")&&!D&&!i.headCovered,Dt=Math.PI*(at&&!Z?.53:.55),R=lt?28:Z?24:at?32:16,S=Z?12:9,H=new Vn(c,R,S,0,Math.PI*2,0,Dt);tv(H,R);const nt=new T(0,0,f),q=new ke(Math.PI/2+qx+(E==="swept_back"||E==="brushed"?.3:0),0,0),ht=new T(0,0,1).applyEuler(q),vt=1/Math.hypot(ht.x/b.x,ht.y/b.y,ht.z/b.z),Q=new T(b.x*U,U,vt*U),et=new ze().setFromEuler(q).invert();G=ut=>{const Pt=ut.clone().applyQuaternion(et);return ut.clone().multiplyScalar(c/Math.hypot(Pt.x/Q.x,Pt.y/Q.y,Pt.z/Q.z)*k(ut))};const Mt=ut=>{if(N===U)return;const Pt=ut.getAttribute("position"),ft=new T;for(let qt=0;qt<Pt.count;qt++)ft.fromBufferAttribute(Pt,qt).sub(nt),ft.multiplyScalar(k(ft)).add(nt),Pt.setXYZ(qt,ft.x,ft.y,ft.z);Pt.needsUpdate=!0,ut.computeVertexNormals()},I=ut=>{if(!L)return 1;const Pt=ut.clone().sub(nt);return ce((Pt.z/Pt.length()-.05)/.45)},j=D?kr(t.skin,t.head,Gl):t.head,K=de(je(H,j,nt,q,Q),"cap");Mt(K.geometry);const mt=ut=>{const Pt=ut.clone().sub(nt).applyQuaternion(et).divide(Q);return Math.acos(Math.max(-1,Math.min(1,Pt.y/(Pt.length()||1))))/Dt},pt=ut=>i.headCovered?0:ce((mt(ut)-.6)/.4),St=ut=>{if(!Ct||i.hairTexture!=="wavy")return 0;const Pt=Math.abs(Math.atan2(ut.x,-ut.y));return .5*ce((Xt(ut.x,ut.y)-c*.06-ut.z)/(c*.2))*(1-ce((Pt-1.6)/.35))};B=ut=>I(ut)*(1-.7*pt(ut));const Ut=ut=>{const Pt=Math.max(pt(ut),St(ut));if(Pt<=0)return 1;const ft=ut.clone().sub(nt),qt=ft.length(),xe=c*1.03/Math.hypot(ft.x/(qt*b.x),ft.y/(qt*b.y),ft.z/(qt*b.z));return xe>=qt?1:(qt+(xe-qt)*Pt)/qt};{const ut=K.geometry.getAttribute("position"),Pt=new T;for(let ft=0;ft<ut.count;ft++){const qt=Ut(Pt.fromBufferAttribute(ut,ft));qt!==1&&ut.setXYZ(ft,nt.x+(Pt.x-nt.x)*qt,nt.y+(Pt.y-nt.y)*qt,Pt.z)}ut.needsUpdate=!0,K.geometry.computeVertexNormals()}const Yt=new ze().setFromEuler(q).invert();st=(ut,Pt,ft)=>{const qt=Math.hypot(ut,Pt)||1,xe=new T(ut/qt,Pt/qt,0).applyQuaternion(Yt).divide(Q),De=new T(0,0,ft-nt.z).applyQuaternion(Yt).divide(Q),[bn,an,ci]=[xe.dot(xe),2*xe.dot(De),De.dot(De)-c*c],kt=an*an-4*bn*ci;if(kt<0)return 0;const Gt=(-an+Math.sqrt(kt))/(2*bn);return Gt*Ut(new T(ut/qt*Gt,Pt/qt*Gt,ft))};const gt=new ze().setFromEuler(q);if(C=ut=>ut.clone().sub(nt).applyQuaternion(Yt).divide(Q).divide(Q).applyQuaternion(gt).normalize(),Za(K.geometry,R),i.headCovered)s.push(K);else{const ut=K.geometry.getAttribute("position"),Pt=new T,ft=Array.from({length:ut.count},(Gt,Kt)=>dt(Pt.fromBufferAttribute(ut,Kt).sub(nt))),qt=Ct?K.geometry.clone():void 0,xe=Br(K.geometry,()=>nt,P,c,1,void 0,Gt=>I(Gt)*xt(Gt.clone().sub(nt))*(1-.7*pt(Gt)));Za(K.geometry,R);const De=new Float32Array(ut.count);if(xe)for(let Gt=0;Gt<ut.count;Gt++)De[Gt]=us*xe[Gt]*xe[Gt]*ft[Gt]+Zo[P]*(1-ft[Gt]);const bn=qt?Br(qt,()=>nt,P,c,1,void 0,Gt=>B(Gt)):void 0;if(qt&&bn&&xe){const Gt=(ge,Ne)=>{const _e=ge.getIndex(),te=ge.getAttribute("position"),We=w=>te.getZ(w)>Nt-c*.5&&te.getZ(w)<Nt+c*.35&&te.getY(w)<c*(Vt?.7:.2),un=[];for(let w=0;w<_e.count;w+=3){const[O,$,X]=[_e.getX(w),_e.getX(w+1),_e.getX(w+2)];(We(O)||We($)||We(X))&&un.push(O,$,X)}const fn=new Le;fn.setAttribute("position",te),fn.setAttribute("normal",ge.getAttribute("normal")),fn.setIndex(un);const Kn=new Ce(fn,new no({side:Pn})),He=new Jr,Xe=new yn,Ke=new T,hi=ge.getAttribute("position"),nn=ge.getAttribute("normal");return(w,O,$)=>{const X=Math.hypot(w,O)||1;He.set(new T(0,0,$),new T(w/X,O/X,0));const Y=He.intersectObject(Kn,!1).at(-1);if(!(Y!=null&&Y.face))return;const{a:wt,b:Ft,c:Tt}=Y.face;Xe.setFromAttributeAndIndices(hi,wt,Ft,Tt).getBarycoord(Y.point,Ke);const Rt=new T().addScaledVector(new T().fromBufferAttribute(nn,wt),Ke.x).addScaledVector(new T().fromBufferAttribute(nn,Ft),Ke.y).addScaledVector(new T().fromBufferAttribute(nn,Tt),Ke.z).normalize();return{r:Y.distance,shade:Ke.x*Ne(wt)+Ke.y*Ne(Ft)+Ke.z*Ne(Tt),normal:Rt}}},Kt=Gt(K.geometry,ge=>De[ge]),Ae=Gt(qt,ge=>us*bn[ge]*bn[ge]);ot=(ge,Ne,_e)=>{const[te,We]=[Kt(ge,Ne,_e),Ae(ge,Ne,_e)];return te&&We?{r:te.r,shade:te.shade,normal:te.normal,fullR:We.r,fullShade:We.shade}:void 0}}if(at)for(let Gt=0;Gt<=S;Gt++)for(let Kt=0;Kt<=R;Kt++){const Ae=(Kt>>1)*3%4/3,ge=ce((Gt/S-(.79+.12*Ae))/.1),Ne=Gt*(R+1)+Kt,_e=ce(((ut.getY(Ne)-nt.y)/c-.05)/.3);De[Ne]=Math.max(De[Ne],.9*ge*_e*(Kt%2?1:.15))}const an=at?t.hairEdge:t.hairSheen;s.push(xe||at?{...K,shade:De,tone:an}:K);{const Gt=Array.from({length:R},(Kt,Ae)=>{const ge=S*(R+1)+Ae;return[Math.atan2(ut.getX(ge),-ut.getY(ge)),ut.getZ(ge)]}).sort((Kt,Ae)=>Kt[0]-Ae[0]);W=(Kt,Ae)=>{const ge=Math.atan2(Kt,-Ae),Ne=Gt.findIndex(fn=>fn[0]>=ge),[_e,te]=Ne<=0?[Gt[Gt.length-1],Gt[0]]:[Gt[Ne-1],Gt[Ne]],We=(te[0]-_e[0]+2*Math.PI)%(2*Math.PI)||1,un=(ge-_e[0]+2*Math.PI)%(2*Math.PI)/We;return _e[1]+(te[1]-_e[1])*Math.min(1,Math.max(0,un))}}const ci=ev(K.geometry,R,S,nt,Gt=>c*.97/Math.hypot(Gt.x/b.x,Gt.y/b.y,Gt.z/b.z)),kt=new Float32Array(4*(R+1));for(let Gt=0;Gt<4;Gt++)for(let Kt=0;Kt<=R;Kt++)kt[Gt*(R+1)+Kt]=De[S*(R+1)+Kt];s.push(de(xe||at?{geometry:ci,colour:j,shade:kt,tone:an}:{geometry:ci,colour:j},"rim"))}}if(bt&&rt!==void 0){const Z=1.04*i.hairVolume*(E==="voluminous"?1.2:1),lt=Nt,at=i.hair!=="chin-length",Dt=3.8,R=i.hairTexture!=="straight",S=at&&(i.hairTexture==="curly"||i.hairTexture==="coily"),H=at&&i.hairTexture==="wavy",nt=S?i.hairTexture==="coily"?12:14:ct?10:Ct&&i.hairTexture==="wavy"?Zx:R?12:8,q=S&&i.hairTexture==="curly"?16:20,ht=new Gn(c,c,lt-rt,q,nt,!0,-Dt/2,Dt);if(ht.rotateX(Math.PI/2),ht.translate(0,0,(lt+rt)/2),at){const kt=ht.getAttribute("position"),Gt=Ct&&i.hairTexture==="wavy"?Kx:R?1.25:1.6;for(let Kt=0;Kt<kt.count;Kt++)kt.setZ(Kt,lt-(lt-rt)*((lt-kt.getZ(Kt))/(lt-rt))**Gt)}const vt=Math.max(f-c*1.05,rt+.35*(lt-rt)),Q=at?1.3:1.12,et=at?0:{coily:.3,curly:.2}[i.hairTexture]??0,Mt=kt=>kt>=vt?1-.1*ce((lt-kt)/(lt-vt)):.9+(Q-.9)*ce((vt-kt)/(vt-rt)),I=kt=>at?-c*.25*ce((vt-kt)/(.5*(vt-rt))):0,j=ht.getAttribute("position"),K=kt=>{const Gt=Math.floor(Math.min(kt,q-1)/2),Kt=Math.sin(Gt*12.9898+7*78.233)*43758.5453;return c*(.05+.25*(Kt-Math.floor(Kt)))},mt=new Float64Array(q+1),pt=new Float32Array(j.count).fill(1),St=new Float32Array(j.count).fill(Zo[i.hairTexture]),Ut=new Array(j.count);for(let kt=0;kt<j.count;kt++){const Gt=Math.abs(Math.atan2(j.getX(kt),-j.getY(kt))),Kt=Ct&&i.hairTexture==="wavy"?ce((Gt-.9)/.5):0,Ae=kt%(q+1),ge=Math.sin(Math.floor(Math.min(Ae,q-1)/2)*12.9898+13*78.233)*43758.5453,Ne=Ct?c*(Ae%2===1?.05+.1*(ge-Math.floor(ge)):.015)*(1-ce((Gt-.4)/.4)):0,_e=(at?Math.max(lt-c*.25*ce((Gt-1.6)/.3),R?Number.NEGATIVE_INFINITY:Math.min(lt,W(j.getX(kt),j.getY(kt))-c*.03)):lt)+Ne+Bt(Gt);mt[kt%(q+1)]=_e;const te=_e-(_e-rt)*(lt-j.getZ(kt))/(lt-rt),We=Mt(te),un=!R&&Math.abs(te-rt)<1e-5&&kt%(q+1)%2?-.012*n:0;let[fn,Kn]=[j.getX(kt),j.getY(kt)];if(at){const ie=Math.min(kt%(q+1),q-kt%(q+1)),Pe=Math.max(0,1-ie/3)*(.8+.2*Math.sin(ie*2.3+(kt%(q+1)>q/2?1:0))),[ve,le]=S?[1.1,.25]:[.85,.45],Ue=ce((f-c*.05-te)/(c*.35))*(1-ce((f-c*ve-te)/(c*le))),Ot=.3*Pe*Ue*Math.sign(fn);[fn,Kn]=[fn*Math.cos(Ot)-Kn*Math.sin(Ot),fn*Math.sin(Ot)+Kn*Math.cos(Ot)]}let[He,Xe]=[fn*b.x*Z*We,Kn*b.y*Z*We+I(te)];const Ke=Math.hypot(He,Xe),hi=1.012+.013*ce(((Vt?_e:lt)-te)/(c*.06));let nn=st(He,Xe,te)*hi,w=0;if(Ct&&nn>0){const ie=kt%(q+1),Pe=Math.floor(Math.min(ie,q-1)/2),ve=Math.sin(Pe*12.9898+11*78.233)*43758.5453;pt[kt]=ce((_e-te)/(c*(.08+.14*(ve-Math.floor(ve)))*(1+2*Kt)));const le=te>_e-c*.3&&Zt(He,Xe)>0?ot(He,Xe,te):void 0;if(le&&te>Math.min(_e,lt)-c*.01){const Ue=Dt/q;for(const Ot of[-.5,-.25,.25,.5]){const[Je,Se]=[Math.cos(Ot*Ue),Math.sin(Ot*Ue)],Nn=ot(He*Je-Xe*Se,He*Se+Xe*Je,te);Nn&&(le.r=Math.max(le.r,Nn.r))}}if(le){const Ue=Vt?1:Zt(He,Xe),Ot=ce((_e-te)/(c*.06))*(1-pt[kt]);nn=Math.max(nn,nn+(Math.max(le.r,le.r+(le.fullR-le.r)*Ot)*hi-nn)*Ue),St[kt]=le.shade+(le.fullShade-le.shade)*ce((_e-te)/(c*.06)),Ut[kt]=le.normal,w=le.r*hi}}const O=kt%(q+1),$=Math.min(1,Math.min(O,q-O)/2)+(1-Math.min(1,Math.min(O,q-O)/2))*ce((f-c*.2-te)/(c*.5)),X=ce((lt-te)/(c*.6))*$,Y=(lt-te)/(lt-rt),wt=(te-f)/(c*b.z),Ft=Ke>0&&Math.abs(wt)<1?c*1.02*Math.sqrt(1-wt*wt)/Math.hypot(He/Ke/b.x,Xe/Ke/b.y):0,Tt=1-Math.min(1,Math.min(O,q-O)/2),Rt=nn>0?nn*(1-.06*Tt*ce((te-(_e-c*.2))/(c*.15))):Ft,Wt=nn>0&&i.hairTexture!=="curly"?c*.06*ce((lt-te)/(c*.12)):0,ee=i.hairTexture==="curly"?Y:Y*Y,ae=et?Rt+Wt+(Math.max(Rt+Wt,st(He,Xe,lt)*1.012*(1-et*ee))-Rt-Wt)*$:Rt>0?Rt+(Math.max(Ke,Rt)-Rt)*X:Ke;let Ht=ae;if(Ct&&i.hairTexture==="wavy"){let ie=0;for(let ve=0;ve<=6;ve++)ie=Math.max(ie,st(He,Xe,te+(_e+c*.25-te)*ve/6));const Pe=pt[kt]*ce((Xt(He,Xe)-c*.06-te)/(c*.1))*(1-ce((_e-c*.45-te)/(c*.3)));Ht=Math.max(ae-(ae-Math.min(ae,ie*1.012)+c*Du*.5)*Pe,nn>0?Math.max(st(He,Xe,te)*hi,w):Ft)}Ke>0&&([He,Xe]=[He*Math.min(ae,Ht)/Ke,Xe*Math.min(ae,Ht)/Ke]),j.setXYZ(kt,He,Xe,te+un)}ht.computeVertexNormals();const Yt={geometry:Ka(ht),colour:t.head},gt=kt=>ce((lt-kt)/(c*(S?.1:.2))),ut=ct?i.hairTexture==="coily"?1.3:1.6:i.hairTexture==="wavy"&&at?Math.max(.4,Math.min(1.6,24*Math.PI/(21*((lt-rt)/c)))):.4,Pt=kt=>new T(0,I(kt.z),kt.z),ft=Yt.geometry.getAttribute("position").count/2,qt=Float32Array.from({length:ft*2},(kt,Gt)=>pt[Gt%ft]),xe=S?Qx(Yt.geometry,q,i.hairTexture==="coily"?2:2.5,Pt,Dt,c,.03*n,(kt,Gt)=>ce((mt[Gt]-kt.z)/(c*.45))):Br(Yt.geometry,Pt,i.hairTexture,c,ut,void 0,(kt,Gt)=>ct?ce((lt-kt.z)/(c*.12)):Ct?qt[Gt]:gt(kt.z),ct||H?lt:0,H?{swing:1.3,lobes:2,strands:.3}:void 0);{const kt=Yt.geometry.getAttribute("position"),Gt=Yt.geometry.getAttribute("normal"),Kt=new T,Ae=new T;for(let ge=0;ge<kt.count;ge++){Kt.fromBufferAttribute(kt,ge);const Ne=ge%(kt.count/2)%(q+1),_e=(1-Math.min(1,Math.min(Ne,q-Ne)/2))*(1-ce((f-c*.2-Kt.z)/(c*.5))),te=Ct?Ut[ge%(kt.count/2)]:void 0,We=te?Math.max(1-ce((mt[Ne]-Kt.z)/(c*.12)),_e):Ct?_e:Math.max(1-ce((lt-Kt.z)/(c*.35)),_e);if(We<=0)continue;const un=(te&&We>_e?te.clone():C(Kt)).multiplyScalar(ge<kt.count/2?1:-1);Ae.fromBufferAttribute(Gt,ge).lerp(un,We).normalize(),Gt.setXYZ(ge,Ae.x,Ae.y,Ae.z)}}const De=Yt.geometry.getAttribute("position"),bn=!R&&t.hairSheen?{shade:qa(De.count,q+1).map((kt,Gt)=>kt*.45*ce((lt-De.getZ(Gt))/c)),tone:t.hairSheen}:{},an=jx(de({...Yt,...bn},"hair"),xe,t.hairSheen),ci=S?.55:H?.7:1;if(xe&&an.shade&&!ct){const kt=Kt=>{if(Ct)return qt[Kt];const Ae=Kt%ft%(q+1);return S?ce((mt[Ae]-De.getZ(Kt))/K(Ae)):gt(De.getZ(Kt))},Gt=Kt=>Ct?St[Kt%ft]:Zo[i.hairTexture];an.shade=an.shade.map((Kt,Ae)=>Kt*ci*kt(Ae)+Gt(Ae)*(1-kt(Ae)))}s.push(an)}!i.headCovered&&i.hair!=="none"&&s.push(...sv(i,E,f,c,b,U,G));const At=f+c*.02,Et=c*.07,Jt=Z=>{const lt=Z.geometry.getAttribute("normal"),at=new Float32Array(lt.count);for(let Dt=0;Dt<lt.count;Dt++)at[Dt]=.9*Math.min(1,Math.max(0,lt.getY(Dt)*1.2));return{...Z,shade:at,tone:t.earEdge}};if(i.described&&!i.earsHidden){const Z=rv[i.ears];for(const lt of[-1,1]){const at=new T(lt*(c*b.x+Et*.6),-c*.08,At);if(s.push(Jt(de(je(new Vn(1,8,6),t.skin,at,new ke(.15,0,lt*.3),new T(Et,c*Z.depth,c*Z.half)),"ear"))),i.ears==="pointed"){const Dt=at.clone().add(new T(0,-c*.05,c*Z.half*.8));s.push(Jt(de(ai(Dt,new T(lt*.25,-.35,1).normalize(),c*.06,c*.38,t.skin,4),"ear")))}}}if(t.facialHair&&i.facialHair!=="none"){const Z=t.facialHair,lt=(H,nt,q=1)=>(H.rotateX(-Math.PI/2),H.scale(b.x*nt,b.y*nt,b.z*nt*q),H.translate(0,0,f),H),at=(H,nt,q,ht,vt,Q=1,et=16)=>({geometry:lt(new Vn(c,et,6,nt-q/2,q,0,H),ht,Q),colour:vt}),Dt=(H,nt,q,ht,vt=1)=>{const Q=H-qo/c/2,et=c*Math.sin(Q)*1.006,Mt=new Gn(et,et,qo,16,1,!0,nt-q/2-Math.PI/2,q);return Mt.translate(0,c*Math.cos(Q),0),{geometry:lt(Mt,ht,vt),colour:t.facialHairEdge??t.ink}},R=Math.PI/2,S=4;if(i.facialHair==="beard"||i.facialHair==="stubble"){const H=i.facialHair==="beard",nt=i.beardReach===void 0?.12:.06+.06*Math.min(1,i.beardReach*4),q=H?1+nt:1.012,ht=H?1+nt:1,vt=H?Z:kr(t.skin,Z,Gl),Q=20,et=lt(mh(c,Q,6,R-S/2,S,()=>0,Pr),q,ht),Mt=(I,j)=>t.facialHairEdge?{shade:qa(I.getAttribute("position").count,j),tone:t.facialHairEdge}:{};if(s.push(de({geometry:et,colour:vt,...H?Mt(et,Q+1):{}},H?"beard":"stubble")),H&&m.has("jawline")){const I=qo/c,j=mh(c*1.006,20,1,R-S/2,S,K=>Pr(K)-I,Pr);s.push(de({geometry:lt(j,q,ht),colour:t.facialHairEdge??t.ink},"jawline"))}if(!H){const I=t.facialHairEdge??Z,j=c*.028;for(let K=0;K<dh;K++)for(let mt=0;mt<ph;mt++){const pt=Math.sin(K*12.9898+mt*78.233)*43758.5453,St=(K+.5+.35*Math.sin(pt))/dh,Ut=R-S/2+S*St;if(Math.abs(Ut-R)>1.45)continue;const Yt=Pr(Ut)*(mt+.5+.3*Math.cos(pt))/(ph+.3),gt=new T(-Math.cos(Ut)*Math.sin(Yt),Math.cos(Yt),Math.sin(Ut)*Math.sin(Yt)).multiplyScalar(c*1.02),ut=new Al(j*1.2,0);ut.setIndex([...Array(ut.getAttribute("position").count).keys()]),ut.translate(gt.x,gt.y,gt.z),s.push(de({geometry:lt(ut,1,1),colour:I},"stubble-dot"))}}if(H&&i.beardLength!==void 0&&i.beardLength>10){const I=Math.min((i.beardLength-10)/100,e/3),j=f-c*q*ht,K=new T(0,c*.75,j+c*.6),mt=new T(0,i.shoulderHalf*.92*.55+c*.3,j-I),pt=10,St=new Si(c*.62,K.distanceTo(mt),pt,1,!0);St.scale(1,1,.4),St.applyMatrix4(new re().compose(K.clone().add(mt).multiplyScalar(.5),new ze().setFromUnitVectors(new T(0,1,0),new T().subVectors(mt,K).normalize()),new T(1,1,1)));const Ut=Ka(St);s.push(de({geometry:Ut,colour:Z,...Mt(Ut,pt+1)},"beard"))}}else i.facialHair==="goatee"&&(s.push(de(at(.75,R,.9,1.1,Z,1.08),"beard")),m.has("jawline")&&s.push(de(Dt(.75,R,.9,1.1,1.08),"jawline")));if(i.facialHair==="moustache"||i.facialHair==="beard"||i.facialHair==="goatee"){const H=-c*.32,nt=new T(0,v(0,H)+c*.02,f+H);for(const q of[-1,1]){const ht=new T(q*c*.28,v(c*.28,-c*.43)+c*.02,f-c*.43);s.push(de(Li(nt,ht,c*.06,Z),"moustache"))}}}const zt=t.faceInk,Qt=f+c*.12,he=c*1,fe=c*.2,F=c*.04,Ie=Z=>c*b.x*Math.sqrt(Math.max(0,1-((Z-f)/(c*b.z))**2));for(const Z of i.features)if(Z==="glasses"||Z==="sunglasses"){for(const lt of[-1,1]){const at=new T(lt*c*.32,he,Qt);Z==="glasses"?s.push(je(new si(fe,F,4,12),zt,at,new ke(Math.PI/2,0,0))):s.push(je(new Gn(fe*1.1,fe*1.1,F*1.5,12),zt,at)),s.push(Li(new T(lt*(c*.32+fe),he-F,Qt),new T(lt*Ie(Qt),0,Qt),F*.8,zt))}s.push(Li(new T(-c*.32+fe,he,Qt),new T(c*.32-fe,he,Qt),F*.8,zt))}else if(Z==="eyepatch"){const lt=new T(-c*.32,he,Qt);s.push(je(new Gn(fe*1.15,fe*1.15,F*1.5,12),zt,lt));const at=new T(lt.x/b.x,lt.y/b.y,(lt.z-f)/b.z).normalize(),Dt=new T(1,0,.5).normalize(),R=new T().crossVectors(at,Dt).normalize(),S=new si(1,F*.8/c,3,24);S.applyQuaternion(new ze().setFromUnitVectors(new T(0,0,1),R)),S.scale(c*b.x*1.03,c*b.y*1.03,c*b.z*1.03),S.translate(0,0,f),s.push(de({geometry:S,colour:zt},"strap"))}else if(Z==="earrings")for(const lt of[-1,1]){const at=f-c*.35,Dt=new T(lt*(Ie(at)+F),0,at);s.push(de(je(new si(c*.12,F*.9,3,8),zt,Dt,new ke(0,Math.PI/2,0)),"earring"))}const oe=f+c*.8,we=t.hair??t.skin;for(const Z of i.extras)if(Z==="tail")s.push(Re(new T(0,-i.hipHalf*.55,h-.02*e),new T(0,-i.hipHalf*.55-.35*n,r?.03:h-.3*e),i.limbRadius*.6,we,!1));else if(Z==="wings")for(const lt of[-1,1])s.push(de(Iu(lt,n,new T(lt*i.shoulderHalf*.45,-.1*n,x-.04*e),we),"wing"));else if(Z==="antlers")for(const lt of[-1,1]){const at=new T(lt*c*.45,0,oe),Dt=new T(lt*c*1.5,-c*.2,oe+c*1.4);s.push(de(Re(at,Dt,c*.07,Ns,!1),"antler")),s.push(de(Re(at.clone().lerp(Dt,.5),new T(lt*c*.7,c*.3,oe+c*1.2),c*.06,Ns,!1),"antler"))}else if(Z==="horns")for(const lt of[-1,1]){const at=je(new Si(c*.16,c*.7,6),Ns,new T(lt*c*.45,c*.15,oe+c*.2),new ke(Math.PI/2,0,-lt*.35));s.push(de(at,"horn"))}return s}function Uu(i){const t=new jt,e=new jt,n=(i.plan.kind==="human"?ov(i):Lx(i)).map(({geometry:r,colour:o,shade:a,tone:l})=>{r.deleteAttribute("uv"),t.set(o),l&&e.set(l);const h=r.getAttribute("position").count,d=new Float32Array(h*3);for(let f=0;f<h;f++){const c=a&&l?a[f]:0,u=(p,_)=>Math.min(1,Math.max(0,p+(_-p)*c));d.set([u(t.r,e.r),u(t.g,e.g),u(t.b,e.b)],f*3)}return r.setAttribute("color",new En(d,3)),r}),s=ao(n,!1);for(const r of n)r.dispose();if(!s)throw new Error("figure parts could not be merged");return i.posture==="reclining"&&(s.applyMatrix4(new re().makeRotationX(Math.PI/2)),s.translate(0,i.height/2,.13*(i.height/1.75))),s.computeBoundingBox(),s.computeBoundingSphere(),s}class av{constructor(){fi(this,"geometries",new Map);fi(this,"used",new Set)}geometry(t){const e=JSON.stringify(t);let n=this.geometries.get(e);return n||(n=Uu(t),this.geometries.set(e,n)),this.used.add(e),n}sweep(){for(const[t,e]of this.geometries)this.used.has(t)||(e.dispose(),this.geometries.delete(t));this.used.clear()}get size(){return this.geometries.size}dispose(){for(const t of this.geometries.values())t.dispose();this.geometries.clear(),this.used.clear()}}function Ou(i,t){if(i.userData.headOutline)return i.userData.headOutline;const e=i.getAttribute("position"),n=[];let s=Number.NEGATIVE_INFINITY;for(let a=0;a<e.count;a++){const l=e.getZ(a);l<t||(n.push(e.getX(a),e.getY(a),l),s=Math.max(s,l))}if(n.length===0&&e.count>0)return Ou(i,Number.NEGATIVE_INFINITY);const r=new Set;for(const a of[-60,-40,-20,0,10,20,30,40,50,60,70,80,90]){const l=a*Math.PI/180;for(let h=0;h<24;h++){const d=h/24*2*Math.PI,f=-Math.sin(l)*Math.cos(d),c=-Math.sin(l)*Math.sin(d),u=Math.cos(l);let p=0,_=Number.NEGATIVE_INFINITY;for(let m=0;m<n.length;m+=3){const g=n[m]*f+n[m+1]*c+n[m+2]*u;g>_&&(_=g,p=m)}n.length&&r.add(p)}}const o=[new T(0,0,s),...[...r].map(a=>new T(n[a],n[a+1],n[a+2]))];return i.userData.headOutline=o,o}function lv(i,t,e,n,s,r,o){const a=new Ce(o?o.geometry(i):Uu(i),r);o&&(a.userData.keptGeometry=!0);const l=0,h=0;return a.rotation.z=Math.hypot(l,h)>1e-6?Math.atan2(-l,h):Math.PI,a.position.set(t,e,n),a.userData.part="body",a}const Fu=40,gh=24,Lr=6,_h=6,Bu=8;class js{constructor(){fi(this,"points",[]);fi(this,"triangles",[])}add(t){return this.points.push(t),this.points.length-1}band(t,e){for(let n=0;n+1<t.length;n++){const s=t[n].length;for(let r=0;r<s;r++){if(e!=null&&e(n,r))continue;const o=t[n][r],a=t[n][(r+1)%s],l=t[n+1][(r+1)%s],h=t[n+1][r];this.triangles.push(o,a,l,o,l,h)}}}cap(t,e){const n=t.filter((r,o)=>{const a=this.points[r],l=this.points[t[(o+1)%t.length]];return Math.hypot(a[0]-l[0],a[1]-l[1])>1e-9});if(n.length<3)return;const s=n.map(r=>new _t(this.points[r][0],this.points[r][1]));for(const[r,o,a]of ii.triangulateShape(s,[])){const l=ii.area([s[r],s[o],s[a]])>0;this.triangles.push(...l===e?[n[r],n[o],n[a]]:[n[r],n[a],n[o]])}}ring(t){return t.map(e=>this.add(e))}}function Bi(i,t,e){const n=new Le;n.setAttribute("position",new ue(i.points.flatMap(([l,h,d])=>[l*1e3,h*1e3,d*1e3]),3)),n.setIndex(i.triangles);const s=Px(n,Fu*Math.PI/180);n.dispose();const r=s.getAttribute("position"),o=s.getAttribute("normal"),a=new T;for(let l=0;l<r.count;l++)r.setXYZ(l,r.getX(l)/(1e3*t[0]),r.getY(l)/(1e3*t[1]),r.getZ(l)/(1e3*t[2])),a.set(o.getX(l)*t[0],o.getY(l)*t[1],o.getZ(l)*t[2]).normalize(),o.setXYZ(l,a.x,a.y,a.z);return s.userData.open=e,s}const Ii=(i,t)=>[i[0]-t[0],i[1]-t[1],i[2]-t[2]],zr=(i,t)=>[i[0]+t[0],i[1]+t[1],i[2]+t[2]],Pi=(i,t)=>[i[0]*t,i[1]*t,i[2]*t],$r=(i,t)=>i[0]*t[0]+i[1]*t[1]+i[2]*t[2],Hr=(i,t)=>[i[1]*t[2]-i[2]*t[1],i[2]*t[0]-i[0]*t[2],i[0]*t[1]-i[1]*t[0]],Qr=i=>Math.hypot(i[0],i[1],i[2]),Di=i=>Pi(i,1/(Qr(i)||1)),Ll=i=>(t,e)=>(t-.5)*i[e];function Ja(i,t){const e=i.length;return i.map(([n,s],r)=>{const[o,a]=i[(r+e-1)%e],[l,h]=i[(r+1)%e],d=[n-o,s-a],f=[l-n,h-s],c=Math.hypot(d[0],d[1])||1,u=Math.hypot(f[0],f[1])||1,p=[-d[1]/c,d[0]/c],_=[-f[1]/u,f[0]/u],m=[p[0]+_[0],p[1]+_[1]],g=1+p[0]*_[0]+p[1]*_[1],x=Math.min(t/Math.max(g,1e-9),4*t/(Math.hypot(m[0],m[1])||1));return[n+m[0]*x,s+m[1]*x]})}function cv(i,t){const e=r=>{const o=Ja(i,r);return ju(o)<=0||!tf(o)?!1:o.every(([a,l],h)=>{const[d,f]=o[(h+1)%o.length],[c,u]=i[h],[p,_]=i[(h+1)%i.length];return(d-a)*(p-c)+(f-l)*(_-u)>0})};if(e(t))return t;let n=0,s=t;for(let r=0;r<30;r++){const o=(n+s)/2;e(o)?n=o:s=o}return n}function hv(i){const t=i.size,e=Ll(t),n=(i.outline??[]).map(([c,u])=>[e(c,0),e(u,1)]),s=t[2]/2,[r,o]=i.bevel??[0,0],a=Math.min(o,s),l=r>0&&a>0?cv(n,r):0,h=new js,d=(c,u)=>h.ring(c.map(([p,_])=>[p,_,u])),f=l>0?[d(Ja(n,l),-s),d(n,-s+a),d(n,s-a),d(Ja(n,l),s)]:[d(n,-s),d(n,s)];return h.band(f),h.cap(f[0],!1),h.cap(f[f.length-1],!0),Bi(h,t,!1)}function uv(i,t,e){const n=i.map((r,o)=>({p:r,r:t[o]})).filter(({p:r},o)=>o===0||Qr(Ii(r,i[o-1]))>1e-9);if(n.length<2)return[];if(e&&n.length>2){const r=new Sl(n.map(({p:a})=>new T(...a)),!1,"centripetal"),o=(n.length-1)*Bu;return Array.from({length:o+1},(a,l)=>{const h=l/o,d=r.getTangent(h),f=h*(n.length-1),c=Math.min(Math.floor(f),n.length-2),u=f-c;return{at:r.getPoint(h).toArray(),along:d.toArray(),r:n[c].r+(n[c+1].r-n[c].r)*u}})}const s=[];for(let r=0;r+1<n.length;r++){const o=Di(Ii(n[r+1].p,n[r].p));if(r>0){const a=s[s.length-1].along,l=Math.acos(Math.max(-1,Math.min(1,$r(a,o)))),h=Math.ceil(l/(15*Math.PI/180)),d=new T(...a),f=new T(...o),c=new ze().setFromUnitVectors(d,f);for(let u=1;u<h;u++){const p=d.clone().applyQuaternion(new ze().slerp(c,u/h));s.push({at:n[r].p,along:p.toArray(),r:n[r].r})}}s.push({at:n[r].p,along:o,r:n[r].r},{at:n[r+1].p,along:o,r:n[r+1].r})}return s}function fv(i){const t=i.size,e=Ll(t),n=(i.path??[]).map(u=>[e(u[0],0),e(u[1],1),e(u[2],2)]),s=uv(n,i.radius??[],i.smooth===!0),r=i.aspect??1,o=new js;if(!s.length)return Bi(o,t,!1);let a;const l=s.map(({along:u})=>{const p=Hr([0,0,1],u);let _=Qr(p)>1e-6?Di(p):Di(a?Ii(a,Pi(u,$r(a,u))):Ii([1,0,0],Pi(u,u[0])));return Qr(_)<1e-6&&(_=Di(Hr(u,[0,1,0]))),a&&$r(_,a)<0&&(_=Pi(_,-1)),a=_,{w:_,h:Hr(u,_)}}),h=(u,p,_,m)=>o.ring(Array.from({length:gh},(g,x)=>{const y=2*Math.PI*x/gh;return zr(u,zr(Pi(p,m*r*Math.cos(y)),Pi(_,m*Math.sin(y))))})),d=(u,p)=>Array.from({length:_h},(_,m)=>{const g=Math.PI/2*(1-m/_h),{at:x,along:y,r:M}=s[u];return h(zr(x,Pi(y,p*M*Math.sin(g))),l[u].w,l[u].h,M*Math.cos(g))}),f=s.length-1,c=[...d(0,-1),...s.map(({at:u,r:p},_)=>h(u,l[_].w,l[_].h,p)),...d(f,1).reverse()];return o.band(c),Bi(o,t,!1)}function dv(i){var u;const t=i.size,e=Ll(t),n=i.sections??[],s=((u=n[0])==null?void 0:u.outline.length)??0,r=i.smooth&&n.length>2?Bu:1,o=r>1?Array.from({length:s},(p,_)=>new Sl(n.map(({z:m,outline:g})=>new T(e(g[_][0],0),e(g[_][1],1),e(m,2))),!1,"centripetal")):[],a=[];for(let p=0;p<=(n.length-1)*r;p++)a.push(Array.from({length:s},(_,m)=>{if(r>1)return o[m].getPoint(p/((n.length-1)*r)).toArray();const{z:g,outline:x}=n[p];return[e(x[m][0],0),e(x[m][1],1),e(g,2)]}));const l=i.holes??[],h=(p,_)=>{const m=Math.floor(p/r);return l.some(([g,x,y,M])=>m>=g&&m<x&&(y<M?_>=y&&_<M:_>=y||_<M))},d=i.caps??"both",f=new js,c=a.map(p=>f.ring(p));return f.band(c,h),(d==="both"||d==="bottom")&&f.cap(c[0],!1),(d==="both"||d==="top")&&f.cap(c[c.length-1],!0),i.wall?Bi(pv(f,i.wall),t,!1):Bi(f,t,l.length>0||d!=="both")}function pv(i,t){const e=i.points.length,n=Array.from({length:e},()=>[0,0,0]),s=[],r=i.triangles;for(let c=0;c<r.length;c+=3){const[u,p,_]=[i.points[r[c]],i.points[r[c+1]],i.points[r[c+2]]],m=Hr(Ii(p,u),Ii(_,u));s.push(Di(m));for(const g of[r[c],r[c+1],r[c+2]])n[g]=zr(n[g],m)}const o=new Array(e).fill(1),a=n.map(Di);for(let c=0;c<r.length;c+=3)for(const u of[r[c],r[c+1],r[c+2]])o[u]=Math.min(o[u],$r(a[u],s[c/3]));const l=new js;l.points=[...i.points],l.triangles=[...r];const h=i.points.map((c,u)=>{const p=a[u],_=1/Math.max(.35,o[u]);return l.add(Ii(c,[p[0]*t[0]*_,p[1]*t[1]*_,p[2]*t[2]*_]))});for(let c=0;c<r.length;c+=3)l.triangles.push(h[r[c]],h[r[c+2]],h[r[c+1]]);const d=new Map,f=(c,u)=>c<u?`${c}:${u}`:`${u}:${c}`;for(let c=0;c<r.length;c+=3)for(let u=0;u<3;u++){const p=f(r[c+u],r[c+(u+1)%3]);d.set(p,(d.get(p)??0)+1)}for(let c=0;c<r.length;c+=3)for(let u=0;u<3;u++){const p=r[c+u],_=r[c+(u+1)%3];d.get(f(p,_))===1&&l.triangles.push(_,p,h[p],_,h[p],h[_])}return l}function mv(i){const t=i.size,[e,n,s]=t,r=Math.min(i.round??0,e/2,n/2,s/2),o=new js,a=(y,M,A,b)=>o.ring([[1,1],[-1,1],[-1,-1],[1,-1]].flatMap(([v,E],D)=>Array.from({length:Lr+1},(P,L)=>{const U=Math.PI/2*(D+L/Lr);return[v*y+A*Math.cos(U),E*M+A*Math.sin(U),b]}))),l=(y,M)=>Array.from({length:Lr+1},(A,b)=>y+(M-y)*b/Lr),h=e/2-r,d=n/2-r,f=l(0,Math.PI/2).map(y=>a(h,d,r*Math.sin(y),-s/2+r*(1-Math.cos(y))));if(!i.wall)return f.push(...l(Math.PI/2,Math.PI).map(y=>a(h,d,r*Math.sin(y),s/2-r*(1+Math.cos(y))))),o.band(f),o.cap(f[0],!1),o.cap(f[f.length-1],!0),Bi(o,t,!1);const[c,u,p]=i.wall,_=Math.max(0,Math.min(r-Math.max(c,u),e/2-c,n/2-u,(s-p)/2)),m=e/2-c-_,g=n/2-u-_,x=-s/2+p;return f.push(a(h,d,r,s/2),a(m,g,_,s/2)),f.push(..._>0?l(Math.PI/2,0).map(y=>a(m,g,_*Math.sin(y),x+_*(1-Math.cos(y)))):[a(m,g,0,x)]),o.band(f),o.cap(f[0],!1),o.cap(f[f.length-1],!0),Bi(o,t,!1)}const $a=32,gv=Math.cos(Fu*Math.PI/180);function _v(i){if(i.shape==="extrude")return hv(i);if(i.shape==="sweep")return fv(i);if(i.shape==="loft")return dv(i);if(i.shape==="box"&&i.round)return mv(i);const t=rf(i);if(t)return Sv(t,i.arc);if(!i.wall)return new qn(1,1,1);const e=i.wall[0]/i.size[0],n=i.wall[1]/i.size[1],s=i.wall[2]/i.size[2],r=[[-.5,.5,-.5,.5,-.5,-.5+s],[-.5,-.5+e,-.5,.5,-.5+s,.5],[.5-e,.5,-.5,.5,-.5+s,.5],[-.5+e,.5-e,-.5,-.5+n,-.5+s,.5],[-.5+e,.5-e,.5-n,.5,-.5+s,.5]].filter(([a,l,h,d,f,c])=>l>a&&d>h&&c>f).map(([a,l,h,d,f,c])=>new qn(l-a,d-h,c-f).translate((a+l)/2,(h+d)/2,(f+c)/2)),o=ao(r);for(const a of r)a.dispose();return o}function Qa(i,t,e=(n=>(n=t.joint)==null?void 0:n.position)()??0){const{center:s,basis:r}=of(t,e);i.matrix.makeBasis(new T(...r[0]),new T(...r[1]),new T(...r[2])).scale(new T(...t.size)).setPosition(...s),i.userData.jointAt=e}const zu=250;function xv(i){return i!=null&&i("(prefers-reduced-motion: reduce)").matches?0:zu}function vv(i){const t=new Map;return i.root.traverse(e=>{e.userData.joint&&t.set(e.userData.joint.key,e.userData.jointAt)}),t}function Mv(i,t,e,n=zu,s=requestAnimationFrame,r=cancelAnimationFrame){const o=[];if(i.root.traverse(d=>{var p;const f=d.userData.joint,c=f&&t.get(f.key);if(!f||c===void 0||n<=0||!(d instanceof Ce))return;const u=((p=f.part.joint)==null?void 0:p.position)??0;c!==u&&o.push({mesh:d,part:f.part,from:c,to:u})}),!o.length)return()=>{};let a,l=0;const h=d=>{a??(a=d);const f=Math.min(1,(d-a)/n),c=f*f*(3-2*f);for(const{mesh:u,part:p,from:_,to:m}of o)Qa(u,p,_+(m-_)*c),u.updateMatrixWorld(!0);e(),f<1&&(l=s(h))};for(const{mesh:d,part:f,from:c}of o)Qa(d,f,c),d.updateMatrixWorld(!0);return l=s(h),()=>r(l)}function Sv(i,t){if(!t)return yv(i);const[e,n]=t,s=Math.max(2,Math.ceil($a*n/(2*Math.PI))),r=ku(Hu(i),s,e,n);r.deleteAttribute("uv");const o=[r,xh(i,e,-1),xh(i,e+n,1)],a=ao(o);for(const l of o)l.dispose();return a}function Hu(i){const t=[];return i.forEach((e,n)=>{t.push(e);const s=i[n-1],r=i[n+1];if(!s||!r)return;const o=[e[0]-s[0],e[2]-s[2]],a=[r[0]-e[0],r[2]-e[2]],l=Math.hypot(o[0],o[1]),h=Math.hypot(a[0],a[1]);l>0&&h>0&&(o[0]*a[0]+o[1]*a[1])/(l*h)<gv&&t.push(e)}),t}function ku(i,t,e=0,n=2*Math.PI){const s=new bl(i.map(([o,,a])=>new _t(o/2,a)),t,e+Math.PI/2,n).rotateX(Math.PI/2),r=s.getAttribute("position");for(let o=0;o<r.count;o++){const[a,l]=i[o%i.length];a>0&&r.setY(o,r.getY(o)*l/a)}return s.computeVertexNormals(),s}function xh(i,t,e){const n=Math.cos(t),s=Math.sin(t),r=i.map(([u,p,_])=>({at:new T(u/2*n,p/2*s,_),flat:new _t(Math.hypot(u*n,p*s)/2,_)})).filter((u,p,_)=>u.flat.distanceTo(_[(p+1)%_.length].flat)>1e-9),o=new T(-s,n,0).multiplyScalar(e),a=[],l=[],h=new T,d=new T,f=new T;for(const u of ii.triangulateShape(r.map(p=>p.flat),[])){let[p,_,m]=u.map(g=>r[g].at);f.crossVectors(h.subVectors(_,p),d.subVectors(m,p)),f.dot(o)<0&&([_,m]=[m,_]),f.crossVectors(h.subVectors(_,p),d.subVectors(m,p)).normalize();for(const g of[p,_,m])a.push(g.x,g.y,g.z),l.push(f.x,f.y,f.z)}const c=new Le;return c.setAttribute("position",new ue(a,3)),c.setAttribute("normal",new ue(l,3)),c.setIndex(a.map((u,p)=>p).slice(0,a.length/3)),c}function yv(i){const t=Hu(i),e=ku(t,$a,-Math.PI/2),n=e.getAttribute("normal"),s=new T,r=new T;for(let o=0;o<t.length;o++){const a=$a*t.length+o;s.fromBufferAttribute(n,o).add(r.fromBufferAttribute(n,a)).normalize(),n.setXYZ(o,s.x,s.y,s.z),n.setXYZ(a,s.x,s.y,s.z)}return e}const ja={wood:{colour:9132587,family:"wood"},pine:{colour:9132587,family:"wood"},oak:{colour:10514495,family:"wood"},lcd:{colour:1447450,family:"glass"},glass:{colour:13624298,family:"glass"},paper:{colour:15722184,family:"cloth"},cotton:{colour:7306652,family:"cloth"},linen:{colour:14274488,family:"cloth"},wool:{colour:10194814,family:"cloth"},silk:{colour:15260872,family:"cloth"},nylon:{colour:5923952,family:"cloth"},polyester:{colour:5924984,family:"cloth"},kevlar:{colour:13153370,family:"cloth"},leather:{colour:5910556,family:"leather"},foam:{colour:7306652,family:"plastic"},plastic:{colour:10132126,family:"plastic"},rubber:{colour:2763308,family:"plastic"},vinyl:{colour:3816e3,family:"plastic"},plexiglas:{colour:14215408,family:"plastic"},metal:{colour:9411238,family:"metal"},steel:{colour:9411238,family:"metal"},durasteel:{colour:9081500,family:"metal"},Fe:{colour:7237234,family:"metal"},Al:{colour:12106946,family:"metal"},Ti:{colour:10133670,family:"metal"},Cu:{colour:12088115,family:"metal"},brass:{colour:13215304,family:"metal"},bronze:{colour:11039802,family:"metal"},Au:{colour:13938487,family:"metal"},Ag:{colour:13158604,family:"metal"},stone:{colour:9210501,family:"stone"},granite:{colour:7302250,family:"stone"},limestone:{colour:13616816,family:"stone"},concrete:{colour:10131603,family:"stone"},ceramic:{colour:15262940,family:"ceramic"},clay:{colour:10771002,family:"ceramic"},brick:{colour:10242610,family:"ceramic"},plaster:{colour:15131094,family:"ceramic"},bone:{colour:14932681,family:"flesh"},H2O:{colour:4882344,family:"liquid"},dirt:{colour:6046768,family:"earth"},sand:{colour:13810058,family:"earth"}},Ev=12104358,vh={metal:9411238,glass:13624298,wood:9132587,leather:5910556,cloth:7306652,stone:9210501,ceramic:15262940,plastic:10132126,flesh:13208442,plant:7049018,earth:6046768,liquid:4882344,ice:14478580,"energy field":6737151,fungal_ingredient:12101258,grain_meal:14207136},bv={roughness:.8,metalness:.05},Mh={metal:{roughness:.25,metalness:1,reflection:2.6},glass:{roughness:.04,metalness:0,opacity:.3,clearcoat:1,clearcoatRoughness:.02},ceramic:{roughness:.35,metalness:0,clearcoat:1,clearcoatRoughness:.08},wood:{roughness:.6,metalness:0,clearcoat:.5,clearcoatRoughness:.3},leather:{roughness:.55,metalness:0,sheen:.6},cloth:{roughness:.95,metalness:0,sheen:1},stone:{roughness:.88,metalness:0},earth:{roughness:1,metalness:0},plastic:{roughness:.32,metalness:0},flesh:{roughness:.6,metalness:0},plant:{roughness:.7,metalness:0},liquid:{roughness:.05,metalness:0,opacity:.75,clearcoat:1,clearcoatRoughness:.02},ice:{roughness:.12,metalness:0,opacity:.7,clearcoat:1,clearcoatRoughness:.05},"energy field":{roughness:.2,metalness:0,opacity:.45,glow:.9},fungal_ingredient:{roughness:.8,metalness:0},grain_meal:{roughness:.95,metalness:0}};function wv(i){return i!==void 0&&Object.hasOwn(Mh,i)?Mh[i]:bv}const Dl=i=>i!==void 0&&Object.hasOwn(ja,i)?ja[i]:void 0,Tv=4906624,Av=6004991,tl=16486972,Rv=3421247,Cv=14275786,Pv=13157563,Lv=3811866,Dv=1052692,Ds=.08,Iv=.3,Sh=1.6,Ei=50,Il=70;function jr(i){var t;return((t=Dl(Dh(i)))==null?void 0:t.colour)??Ev}function co(i){var t;return(t=Dl(Dh(i)))==null?void 0:t.family}function Nv(i,t,e){var a;const n=nf(i),s=Lh(i.colour),r=(n==null?void 0:n.family)??co(t);return{colour:s?sf(s):n?((a=Dl(n.species))==null?void 0:a.colour)??(Object.hasOwn(vh,n.family)?vh[n.family]:e):e,family:r}}const Uv=i=>`#${i.toString(16).padStart(6,"0")}`;function Ov(i,t){const e=i.userData.headBox;if(e&&e.chin===t)return e.box;const n=new mn,s=i.getAttribute("position"),r=new T;for(let o=0;o<s.count;o++)r.fromBufferAttribute(s,o),r.z>=t&&n.expandByPoint(r);return n.isEmpty()&&s.count>0&&n.setFromBufferAttribute(s),i.userData.headBox={chin:t,box:n},n}const to=i=>[0,1,2,3,4,5,6,7].map(t=>new T(t&1?i.max.x:i.min.x,t&2?i.max.y:i.min.y,t&4?i.max.z:i.min.z)),Fv=.35,Bv=1844787;class zv{constructor(t,e){fi(this,"materials",new Map);this.figures=t,this.environment=e}material(t,e={}){const n=wv(e.family),s=e.opacity??n.opacity,r=`${t}:${s??1}:${e.emissive??0}:${e.family??""}:${e.doubleSided?2:1}`;let o=this.materials.get(r);if(!o){const a={color:t,roughness:n.roughness,metalness:n.metalness,transparent:s!==void 0,opacity:s??1,emissive:e.emissive??(n.glow?new jt(t).multiplyScalar(n.glow):0),depthWrite:s===void 0,envMap:this.environment??null,envMapIntensity:Eh*(n.reflection??1)};o=n.clearcoat||n.sheen?new lp({...a,clearcoat:n.clearcoat??0,clearcoatRoughness:n.clearcoatRoughness??0,sheen:n.sheen??0,sheenRoughness:.8,sheenColor:new jt(t).lerp(new jt(16777215),.3)}):new hs(a),(e.doubleSided||n.opacity!==void 0&&e.opacity===void 0)&&(o.side=Pn,o.polygonOffset=!0,o.polygonOffsetFactor=-1,o.polygonOffsetUnits=-1),o.userData.castsShadow=s===void 0,this.materials.set(r,o)}return o}box(t,e,n){const s=(o,a)=>Math.max(.01,a-o),r=new Ce(new qn(s(t.x0,t.x1),s(t.y0,t.y1),s(t.z0,t.z1)),e);return r.position.set((t.x0+t.x1)/2,(t.y0+t.y1)/2,(t.z0+t.z1)/2),r.userData.part=n,r}sphere(t,e,n,s){const r=new Ce(new Vn(Math.max(.01,e),24,16),n);return r.position.set(t[0],t[1],t[2]),r.userData.part=s,r}figureMaterial(t=!1){const e=t?"figure-crystal":"figure";let n=this.materials.get(e);if(!n){const s={envMap:this.environment??null,envMapIntensity:Eh};n=t?new hs({color:16777215,vertexColors:!0,roughness:Fv,metalness:0,flatShading:!0,emissive:Bv,...s}):new hs({color:16777215,vertexColors:!0,roughness:.8,metalness:.05,...s}),this.materials.set(e,n)}return n}person(t,e,n,s,r,o,a,l){const h=a!=null&&a.posture?{...typeof t=="object"&&t!==null&&!Array.isArray(t)?t:{},posture:a.posture}:t,d=a?{width:a.dimensions_m[0],depth:a.dimensions_m[1]}:l,f=ef(h,{height:(a==null?void 0:a.figure_height_m)??(a==null?void 0:a.dimensions_m[2])??r-s,base:Uv(o),footprint:d}),c=f.plan.kind==="humanoid"&&f.plan.covering==="crystal",u=lv(f,e,n,s,void 0,this.figureMaterial(c),this.figures);if(a){const g=Nl(a);u.quaternion.premultiply(g);const x=new T(0,0,-a.dimensions_m[2]/2).applyQuaternion(g);u.position.fromArray(a.centre_m).add(x)}u.updateMatrixWorld();const p=f.top-f.headHeight*1.05,_=Ou(u.geometry,p),m=g=>g.clone().applyMatrix4(u.matrixWorld);return{mesh:u,label:_.map(m),head:to(Ov(u.geometry,p)).map(m),animal:f.plan.kind==="animal"}}}function Nl(i){const[t,e,n,s]=i.body_quaternion;return new ze(e,n,s,t).normalize()}const Ul=i=>[(i.x0+i.x1)/2,(i.y0+i.y1)/2];function yh(i,t){var d,f;const{thing:e,bounds:n}=t,s=jr(e),r=co(e),o=i.material(s,{family:r}),a=n.x1-n.x0,l=n.y1-n.y0,h=n.z1-n.z0;switch(Qo(e)){case"table":{const c=Math.min(.05,h*.15),u=Math.min(.06,Math.min(a,l)/5),p=Math.min(a*.08,.05),_=Math.min(l*.08,.05),m=[[n.x0+p,n.y0+_],[n.x1-p-u,n.y0+_],[n.x0+p,n.y1-_-u],[n.x1-p-u,n.y1-_-u]].map(([g,x])=>i.box({x0:g,x1:g+u,y0:x,y1:x+u,z0:n.z0,z1:n.z1-c},o,"leg"));return[i.box({...n,z0:n.z1-c},o,"top"),...m]}case"seat":{const c=i.box({...n,z1:n.z0+h*.45},o,"seat"),u=(d=e.front)==null?void 0:d.axis;if(!u||Math.hypot(u[0],u[1])<1e-6)return[c];const p=Math.hypot(u[0],u[1]),_=u[0]/p,m=u[1]/p,g=Math.min(a,l)*.22,x=(Math.abs(_)*a+Math.abs(m)*l)/2-g/2,y=Math.abs(m)*a+Math.abs(_)*l,M=i.box({x0:-y/2,x1:y/2,y0:-g/2,y1:g/2,z0:n.z0,z1:n.z1},o,"back");return M.rotation.z=Math.atan2(-_,m),M.position.x=(n.x0+n.x1)/2-_*x,M.position.y=(n.y0+n.y1)/2-m*x,[c,M]}case"shelf":{const c=[i.box(n,o,"body")],u=i.material(new jt(s).multiplyScalar(.55).getHex(),{family:r});for(let p=n.z0+.35;p<n.z1-.1;p+=.35)c.push(i.box({x0:n.x0-.008,x1:n.x1+.008,y0:n.y0-.008,y1:n.y1+.008,z0:p,z1:p+.02},u,"shelf"));return c}case"picture":{const c=a<=l,u=c?-.006:a*.12,p=c?l*.12:-.006,_=h*.12;return[i.box(n,i.material(Lv,{family:"wood"}),"frame"),i.box({x0:n.x0+u,x1:n.x1-u,y0:n.y0+p,y1:n.y1-p,z0:n.z0+_,z1:n.z1-_},o,"picture")]}case"screen":return[i.box(n,i.material(Dv,{emissive:((f=e.state)==null?void 0:f.mode)==="running"?659488:0}),"screen")];case"door":{const c=a>=l,[u,p]=Ul(n),_=Math.min(n.z0+.95,n.z1-.05),m=c?[n.x0+a*.85,p+(p>0?-1:1)*(l/2+.03),_]:[u+(u>0?-1:1)*(a/2+.03),n.y0+l*.85,_];return[i.box(n,o,"leaf"),i.sphere(m,.03,i.material(ja.brass.colour,{family:"metal"}),"knob")]}case"flat":return[i.box({...n,z1:n.z0+Math.min(h,.05)},o,"block")];case"box":return Gu(i,t)}}function Gu(i,t){const e=i.material(jr(t.thing),{family:co(t.thing)});return t.footprints.map(n=>n.type==="circle"?i.sphere([n.cx,n.cy,(n.bounds.z0+n.bounds.z1)/2],n.r,e,"sphere"):i.box(n.bounds,e,"box"))}function Hv(i,t,e,n){var y;const[s,r,o]=t.size,a=Ds,l=Math.min(2.05,o*.85),h=e==="north"||e==="south",[d,f]=h?[-s/2-a,s/2+a]:[-r/2,r/2],c=(M,A,b,v)=>e==="north"?{x0:M,x1:A,y0:r/2,y1:r/2+a,z0:b,z1:v}:e==="south"?{x0:M,x1:A,y0:-r/2-a,y1:-r/2,z0:b,z1:v}:e==="east"?{x0:s/2,x1:s/2+a,y0:M,y1:A,z0:b,z1:v}:{x0:-s/2-a,x1:-s/2,y0:M,y1:A,z0:b,z1:v},u=new kn;u.name=`${e} wall`,u.userData.wall=e,u.userData.finish=(y=t.finishes)==null?void 0:y.wall;const p=i.material(Cv),_=i.material(tl,{opacity:.55,emissive:6958600}),m=i.material(tl,{emissive:9059338}),g=t.exits.filter(M=>Ph(M,t.size)===e).map(M=>{const A=h?M.at[0]:M.at[1];return{exit:M,a:Math.max(d,A-M.width/2),b:Math.min(f,A+M.width/2)}}).sort((M,A)=>M.a-A.a);let x=d;for(const{exit:M,a:A,b}of g){A>x&&u.add(i.box(c(x,A,0,o),p,"wall")),o>l&&u.add(i.box(c(A,b,l,o),p,"lintel"));const v=i.box(c(A,b,0,l),_,"doorway");v.userData.exit=M.name,u.add(v),n.push(v);const E=c(A,b,0,.012),D=.15;e==="north"&&(E.y0-=D),e==="south"&&(E.y1+=D),e==="east"&&(E.x0-=D),e==="west"&&(E.x1+=D);const P=i.box(E,m,"threshold");P.userData.exit=M.name,u.add(P),n.push(P),x=Math.max(x,b)}return f>x&&u.add(i.box(c(x,f,0,o),p,"wall")),u}function kv({layout:i,placed:t,youId:e,figures:n,environment:s}){var v,E,D,P;const r=new zv(n,s),[o,a]=i.size,l=new kn,h=[];l.add(new fp(16777215,4473936,Gv)),l.add(Xv(i.size));const d=r.box({x0:-o/2,x1:o/2,y0:-a/2,y1:a/2,z0:-.02,z1:0},r.material(Rv),"floor");d.userData.finish=(v=i.finishes)==null?void 0:v.floor,l.add(d);const f=r.box({x0:-o/2-Ds,x1:o/2+Ds,y0:-a/2-Ds,y1:a/2+Ds,z0:i.size[2],z1:i.size[2]+.02},r.material(Pv),"ceiling");f.userData.finish=(E=i.finishes)==null?void 0:E.ceiling,l.add(f);const c=af(o),u=[];for(let L=Math.ceil(-o/2/c)*c;L<o/2;L+=c)L>-o/2&&u.push(L,-a/2,.002,L,a/2,.002);for(let L=Math.ceil(-a/2/c)*c;L<a/2;L+=c)L>-a/2&&u.push(-o/2,L,.002,o/2,L,.002);const p=new Le;p.setAttribute("position",new ue(u,3));const _=new io(p,new _l({color:10066346,transparent:!0,opacity:.18}));_.userData.part="grid",l.add(_);const m={};for(const L of["north","south","east","west"])m[L]=Hv(r,i,L,h),l.add(m[L]);for(const L of i.exits){if(Ph(L,i.size))continue;const U=Math.max(L.width,.4)/2,[V,N,z]=L.at,k=r.box({x0:V-U,x1:V+U,y0:N-U,y1:N+U,z0:z,z1:z+.02},r.material(tl,{opacity:.6}),"hatch");k.userData.exit=L.name,l.add(k),h.push(k)}const g=new Map,x=new Map,y=new Map;for(const L of t){const U=new kn;U.name=L.thing.id,U.userData.thingId=L.thing.id;const[V,N]=Ul(L.bounds);if(Hs(L.thing)){U.userData.form="person";const z=L.thing.id===e?Av:Tv,{mesh:k,label:G,head:st,animal:C}=r.person(L.thing.appearance,V,N,L.bounds.z0,L.bounds.z1,z,Us(L.thing.pose)?L.thing.pose:void 0,{width:L.bounds.x1-L.bounds.x0,depth:L.bounds.y1-L.bounds.y0});U.add(k),U.userData.animal=C,x.set(L.thing.id,G),y.set(L.thing.id,st)}else{U.userData.form=Qo(L.thing);const z=L.thing.pose;if(Us(z)&&(z.box||(D=L.thing.form_parts)!=null&&D.length)){const[k,G,st]=z.dimensions_m,C={...L,bounds:{x0:-k/2,x1:k/2,y0:-G/2,y1:G/2,z0:-st/2,z1:st/2}};if((P=L.thing.form_parts)!=null&&P.length){const B=jr(L.thing);for(const W of L.thing.form_parts){const{role:ot,fitting:yt}=W,J=Nv(W,L.thing,B),rt=yt&&!Lh(W.colour)?new jt(J.colour).multiplyScalar(.78).getHex():J.colour,bt=_v(W),Nt=r.material(rt,{family:J.family,doubleSided:bt.userData.open===!0}),ct=new Ce(bt,Nt);ct.userData.part=(yt==null?void 0:yt.name)??ot??"form",ct.matrixAutoUpdate=!1,Qa(ct,W);const Ct=ot??(yt==null?void 0:yt.lifetime);W.joint&&Ct&&(ct.userData.joint={key:JSON.stringify([L.thing.id,Ct]),part:W}),yt&&(ct.userData.fitting=yt.lifetime),ot&&L.thing.lifetime&&(ct.userData.inspect=[L.thing.id,L.thing.lifetime,ot]),U.add(ct)}}else if(Qo(L.thing)==="box")U.add(r.box(C.bounds,r.material(jr(L.thing),{family:co(L.thing)}),"box"));else for(const B of yh(r,C))U.add(B);U.quaternion.copy(Nl(z)),U.position.fromArray(z.centre_m)}else if(Us(z))for(const k of Gu(r,L))U.add(k);else for(const k of yh(r,L))U.add(k);x.set(L.thing.id,[new T(V,N,L.bounds.z1)])}l.add(U),g.set(L.thing.id,U)}n==null||n.sweep();const M=new Map,A=new kn;A.name="tiny figure markers";const b=new Tl(Zv,1,40);for(const[L,U]of g){if(U.userData.form!=="person")continue;const V=new Ce(b,new no({color:Kv,transparent:!0,opacity:0,depthWrite:!1}));V.name=`marker ${L}`,V.visible=!1,A.add(V),M.set(L,V)}l.add(A),d.receiveShadow=!0;for(const L of Object.values(m))L.traverse(U=>{U.receiveShadow=!0});for(const L of g.values())L.traverse(U=>{U instanceof Ce&&(U.receiveShadow=!0,U.castShadow=U.material.userData.castsShadow!==!1)});return l.updateMatrixWorld(!0),{root:l,walls:m,ceiling:f,exits:h,things:g,labelPoints:x,heads:y,markers:M}}const Gv=.35,Vv=1.6,Eh=.5,Ko=2048,Wv=3;function Xv(i){const[t,e,n]=i,s=new gp(16777215,Vv);s.position.set(t*.4,-e*.6,Math.max(6,n+2)),s.castShadow=!0;const r=new re().lookAt(s.position,new T,Ge.DEFAULT_UP).setPosition(s.position).invert(),o=new mn;for(const d of[-t/2,t/2])for(const f of[-e/2,e/2])for(const c of[0,n])o.expandByPoint(new T(d,f,c).applyMatrix4(r));const a=.1,l=s.shadow.camera;l.left=o.min.x-a,l.right=o.max.x+a,l.bottom=o.min.y-a,l.top=o.max.y+a,l.near=Math.max(.05,-o.max.z-a),l.far=-o.min.z+a,l.updateProjectionMatrix(),s.shadow.mapSize.set(Ko,Ko),s.shadow.radius=Wv;const h=Math.max(l.right-l.left,l.top-l.bottom)/Ko;return s.shadow.normalBias=h*1.5,s.shadow.bias=-2e-4,s}const bh=16,Yv=10,qv=11,Zv=.86,Kv=15263981;function Jv(i){return Math.min(1,Math.max(0,(bh-i)/(bh-Yv)))}function $v(i,t,e,n,s){const r=new mn,o=new T;for(const[a,l]of i.markers){const h=i.things.get(a);if(l.visible=!1,s!=="dollhouse"||!(h!=null&&h.visible)||(r.setFromObject(h),r.isEmpty()))continue;const d=Ol(to(r),t,e,n);if(!d)continue;const f=Jv(d.y1-d.y0);if(f===0)continue;r.getCenter(o);const c=2*t.position.distanceTo(o)*Math.tan(t.fov/2*Math.PI/180)/n,u=Math.hypot(r.max.x-r.min.x,r.max.y-r.min.y)/2;l.scale.setScalar(Math.max(qv*c,u*1.3)),l.position.set(o.x,o.y,r.min.z+.003),l.material.opacity=f,l.visible=!0}}function Qv(i,t,e){var s,r;if(t.length!==e.length)return!1;const n=[];for(let o=0;o<t.length;o++){const a=t[o],l=e[o];if(a.thing===l.thing)continue;const h=a.thing.pose,d=l.thing.pose;if(a.thing.id!==l.thing.id||!i.things.has(l.thing.id)||!Us(h)||!Us(d)||!d.box&&!Hs(l.thing)||h.box!==d.box||h.figure_height_m!==d.figure_height_m||h.posture!==d.posture||h.dimensions_m.some((c,u)=>c!==d.dimensions_m[u])||a.thing.appearance!==l.thing.appearance||a.thing.state!==l.thing.state||a.thing.form_parts!==l.thing.form_parts||a.thing.material!==l.thing.material||a.thing.classes!==l.thing.classes||JSON.stringify((s=a.thing.front)==null?void 0:s.axis)!==JSON.stringify((r=l.thing.front)==null?void 0:r.axis))return!1;const f=c=>new re().compose(new T(...c.centre_m),Nl(c),new T(1,1,1));n.push({old:a,next:l,delta:f(d).multiply(f(h).invert())})}for(const{next:o,delta:a}of n){const l=i.things.get(o.thing.id);if(!l)return!1;if(l.applyMatrix4(a),Hs(o.thing)){for(const h of i.heads.get(o.thing.id)??[])h.applyMatrix4(a);for(const h of i.labelPoints.get(o.thing.id)??[])h.applyMatrix4(a)}else{const[h,d]=Ul(o.bounds);i.labelPoints.set(o.thing.id,[new T(h,d,o.bounds.z1)])}}return i.root.updateMatrixWorld(!0),!0}function Ol(i,t,e,n){const s=new T,r={x0:Number.POSITIVE_INFINITY,x1:Number.NEGATIVE_INFINITY,y0:Number.POSITIVE_INFINITY,y1:Number.NEGATIVE_INFINITY};for(const o of i){if(s.copy(o).project(t),s.z<-1||s.z>1)return;const a=(s.x+1)/2*e,l=(1-s.y)/2*n;r.x0=Math.min(r.x0,a),r.x1=Math.max(r.x1,a),r.y0=Math.min(r.y0,l),r.y1=Math.max(r.y1,l)}return r}function jv(i,t,e,n){const s=new T().copy(i[0]).project(t);if(s.z<-1||s.z>1)return;const r=s.x;let o=i.length===1?s.y:Number.NEGATIVE_INFINITY;for(let a=1;a<i.length;a++)s.copy(i[a]).project(t),s.z>=-1&&s.z<=1&&(o=Math.max(o,s.y));return{x:(r+1)/2*e,top:(1-o)/2*n}}function tM(i,t,e,n){const[s,r,o]=t.size,a={north:e.y>r/2,south:e.y<-r/2,east:e.x>s/2,west:e.x<-s/2},l=Math.min(1,Iv/o);for(const h of["north","south","east","west"])i.walls[h].scale.z=n==="dollhouse"&&a[h]?l:1;i.ceiling.visible=n==="eyes"}function xs(i,t=Ei){const[e,n,s]=i.size,r=[0,0,Math.min(s,2)*.25],a=Math.hypot(e,n)/2/Math.sin(t/2*Math.PI/180)*1.05,l=new T(.45,-1,1.05).normalize().multiplyScalar(a);return{position:[r[0]+l.x,r[1]+l.y,r[2]+l.z],target:r}}const Is=.87,eM=10;function wh(i,t=Ei){const e=xs(i,t),n=Math.hypot(...e.position.map((s,r)=>s-e.target[r]));return Math.max(60,n*1.5)}function nM(i,t,e){const n=new T().subVectors(e,t);i.position.add(n),t.add(n)}function Vu(i,t){return i?new T((i.x0+i.x1)/2,(i.y0+i.y1)/2,i.z0+(i.z1-i.z0)*.9):new T(...xs(t).target)}function Wu(i,t,e,n=Ei){const s=t.bounds,r=i.things.get(t.thing.id);if(!(r!=null&&r.userData.animal))return{point:Vu(s,e),frame:0,box:to(new mn(new T(s.x0,s.y0,s.z0),new T(s.x1,s.y1,s.z1)))};const o=new mn().setFromObject(r),a=o.getBoundingSphere(new zi).radius,l=Math.max(a/Math.sin(n/2*Math.PI/180)*1.1,a+Xu*2);return{point:o.getCenter(new T),frame:l,box:to(o)}}const iM=20,el=1.5;function sM(i,t=Ei){const e=xs(i,t),n=Math.hypot(...e.position.map((s,r)=>s-e.target[r]));return Math.min(.95,(el/n)**(1/iM))}function rM(i,t){return Math.min(1,Math.abs(i)/(t===1?3:t===2?1:100))}const Th=12,Ln=.5,Xu=.05,oM=.15;function aM(i,t,e=Ei){if(i>=Ln)return 1;const n=xs(t,e),s=Math.hypot(...n.position.map((r,o)=>r-n.target[o]));return s>el?Math.max(1,Math.log(i/s)/Math.log(el/s)):1}function lM(i){return Math.min(Ln,(i==null?void 0:i.nearest)??Ln)}const Yu=i=>{for(;i&&i.userData.thingId===void 0;)i=i.parent;return i==null?void 0:i.userData.thingId};function cM(i){return[...Array.from(i.things.values()).filter(t=>t.visible),...Object.values(i.walls),...i.exits.filter(t=>t.parent===i.root)]}function hM(i){if(!i)return;if(i.userData.fitting)return{kind:"fitting",lifetime:i.userData.fitting};if(i.userData.inspect){const[e,n,s]=i.userData.inspect;return{kind:"inspect",id:e,lifetime:n,role:s}}if(i.userData.exit)return{kind:"exit",name:i.userData.exit};const t=Yu(i);return t===void 0?void 0:{kind:"thing",id:t}}const Ah=16777215,uM=.55,fM=.2;function dM(i,t){const e=new T(i.x1-i.x0,i.y1-i.y0,i.z1-i.z0),n=Math.min(.04,Math.max(.01,Math.max(e.x,e.y,e.z)*.02));e.addScalar(n*2);const s=new kn;s.name="selection";const r=new kn;r.position.set((i.x0+i.x1)/2,(i.y0+i.y1)/2,(i.z0+i.z1)/2);const o=e.clone().multiplyScalar(fM),a=[];for(const h of[-1,1])for(const d of[-1,1])for(const f of[-1,1]){const c=new T(h*e.x/2,d*e.y/2,f*e.z/2);a.push(c,c.clone().setX(c.x-h*o.x)),a.push(c,c.clone().setY(c.y-d*o.y)),a.push(c,c.clone().setZ(c.z-f*o.z))}const l=new io(new Le().setFromPoints(a),new _l({color:Ah,depthTest:!1,transparent:!0}));if(l.renderOrder=1e3,r.add(l),s.add(r),t&&t.userData.form!=="person"){const h=new no({color:Ah,transparent:!0,opacity:uM,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-4});t.updateWorldMatrix(!0,!0),t.traverse(d=>{if(!(d instanceof Ce)||!d.visible)return;const f=new Ce(d.geometry,h);f.name="selection glow",f.matrixAutoUpdate=!1,f.matrixWorldAutoUpdate=!1,f.matrixWorld.copy(d.matrixWorld),f.onBeforeRender=()=>f.matrixWorld.copy(d.matrixWorld),f.renderOrder=999,s.add(f)})}return r.updateMatrixWorld(!0),s}function qu(i){i.removeFromParent();const t=new Set;i.traverse(e=>{(e instanceof Ce||e instanceof io)&&(e.name!=="selection glow"&&t.add(e.geometry),t.add(e.material))});for(const e of t)e.dispose()}const Rh=(i,t)=>Math.hypot(Math.max(t.x0-i.x,0,i.x-t.x1),Math.max(t.y0-i.y,0,i.y-t.y1));function pM(i,t,e,n,s,r,o=[]){var m,g;const a=new Jr;a.setFromCamera(new _t(t.x/e.width*2-1,-(t.y/e.height)*2+1),i);const l=[...n.things.values()].filter(x=>x.visible),h=i.getWorldPosition(new T),d=i instanceof vn?i.fov:Ei,f=[];for(const x of s){if(((m=n.things.get(x.thing.id))==null?void 0:m.userData.form)!=="person"||!((g=n.things.get(x.thing.id))!=null&&g.visible))continue;const y=Wu(n,x,r,d),M=h.distanceTo(y.point),A=o.find(D=>D.id===x.thing.id),b=A?Rh(t,A):Number.POSITIVE_INFINITY;if(b<=Th){f.push({person:x,focus:y,byLabel:!0,off:b,depth:M});continue}const v=Ol(y.box,i,e.width,e.height);if(!v)continue;const E=Rh(t,v);E<=Th&&f.push({person:x,focus:y,byLabel:!1,off:E,depth:M})}f.sort((x,y)=>Number(y.byLabel)-Number(x.byLabel)||x.off-y.off||x.depth-y.depth);for(const{person:x,focus:y,depth:M}of f){const A=y.point,v=new Jr(h,A.clone().sub(h).normalize(),0,M).intersectObjects(l,!0)[0];if(v&&Yu(v.object)!==x.thing.id)continue;const E=y.frame>0?y.frame:Math.max(Ln,mM(A,h,x.bounds,oM));return{point:A,nearest:E,pace:aM(E,r,d)}}const c=a.intersectObjects([...l,...Object.values(n.walls)],!0)[0];if(c)return{point:c.point.clone(),nearest:Ln,pace:1};const u=a.ray.intersectPlane(new Bn(new T(0,0,1),0),new T),[p,_]=r.size;return u&&Math.abs(u.x)<=p/2&&Math.abs(u.y)<=_/2?{point:u,nearest:Ln,pace:1}:void 0}function mM(i,t,e,n){const s=new mn(new T(e.x0-n,e.y0-n,e.z0),new T(e.x1+n,e.y1+n,e.z1+n)),r=t.clone().sub(i).normalize(),o=i.clone().addScaledVector(r,1e3),a=new Js(o,r.clone().negate()).intersectBox(s,new T);return a?i.distanceTo(a):0}class gM{constructor(){fi(this,"fingers",new Map);fi(this,"start",null)}down(t,e,n){this.fingers.set(t,{x:e,y:n}),this.start=this.fingers.size===2?this.midpoint():null}move(t,e,n){if(!this.fingers.has(t))return;const s=this.spacing();this.fingers.set(t,{x:e,y:n});const r=this.spacing();if(!(this.fingers.size!==2||!this.start||s===0||r===0||s===r))return{scale:s/r,at:this.start}}up(t){this.fingers.delete(t),this.start=null}get pinching(){return this.start!==null}spacing(){const[t,e]=[...this.fingers.values()];return t&&e?Math.hypot(t.x-e.x,t.y-e.y):0}midpoint(){const[t,e]=[...this.fingers.values()];return{x:(t.x+e.x)/2,y:(t.y+e.y)/2}}}function _M(i,t,e,n,s=0,r=1){const o=n**r;if(o<1){const a=i.distanceTo(e),l=a>s?Math.max(o,s/a):1;i.sub(e).multiplyScalar(l).add(e),t.sub(e).multiplyScalar(o*o).add(e)}else i.sub(t).multiplyScalar(o).add(t)}function xM(i,t){if(t==="+"||t==="=")return nl(i,1);if(t==="-"||t==="_")return nl(i,-1);if(t==="0")return Il}function nl(i,t){return Math.min(Il,Math.max(eM,i*Is**t))}function vM(i,t,e,n){const s=t?[t[0],t[1],t[2]>.8?t[2]:Sh]:n?[(n.x0+n.x1)/2,(n.y0+n.y1)/2,Math.max(n.z1-.1,.8)]:[0,0,Math.min(Sh,i.size[2]*.8)],r=e?Math.hypot(e[0],e[1],e[2]):0,[o,a,l]=e&&r>1e-6?e.map(h=>h/r):[0,1,0];return{position:s,target:[s[0]+o,s[1]+a,s[2]+l]}}function Ch(i){const t=new Set;i.root.traverse(e=>{if(e instanceof Ce||e instanceof io){e.userData.keptGeometry||e.geometry.dispose();const n=e.material;for(const s of Array.isArray(n)?n:[n])t.add(s)}});for(const e of t)e.dispose()}const MM=3,SM=4;function yM(i,t){const e=`${i.className}
${i.textContent}`;let n=t.get(e);if(!n){const s=getComputedStyle(i),r=Number.parseFloat(s.fontSize),o=document.createElement("canvas").getContext("2d");if(!o||!(r>0))return{width:0,height:0};o.font=`${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;const a=Number.parseFloat(s.lineHeight);n={width:o.measureText(i.textContent??"").width,height:a>0?a:r*1.2},t.set(e,n)}return n}function Jo(i,t){var s;i.selection&&qu(i.selection),i.selection=null;for(const[r,o]of i.labelObjects)o.element.classList.toggle("rl3d-label-selected",r===t);const e=t===null?void 0:i.placed.find(r=>r.thing.id===t),n=e&&((s=i.room)==null?void 0:s.things.get(e.thing.id));!e||!(n!=null&&n.visible)||(i.selection=dM(e.bounds,n),i.scene.add(i.selection))}function EM(){const i=document.createElement("canvas");return!!(i.getContext("webgl2")??i.getContext("webgl"))}function $o(i,t){i.camera.position.set(...t.position),i.controls.target.set(...t.target),i.camera.lookAt(i.controls.target)}const AM=({layout:i,placed:t,youId:e,label:n,mode:s,selectedId:r,onSelect:o,onExit:a,onFitting:l,onInspect:h})=>{var st;const d=Tn(null),f=Tn(null),c=Tn(s),u=Tn(a);u.current=a;const p=Tn(r);p.current=r;const[_]=lf(EM),m=Vl(C=>C.listenerPosition),g=Vl(C=>C.listenerOrientation.forward),x=Tn([]);cf(()=>{const C=d.current;if(!C||!_)return;const B=new fx({antialias:!0});B.setPixelRatio(window.devicePixelRatio),B.setClearColor(1315866),B.outputColorSpace=xn,B.toneMapping=rl,B.shadowMap.enabled=!0,B.shadowMap.type=Os,B.shadowMap.autoUpdate=!1,B.domElement.setAttribute("aria-hidden","true"),C.appendChild(B.domElement);const W=new Cx;W.domElement.className="room-layout-3d-labels",W.domElement.setAttribute("aria-hidden","true"),C.appendChild(W.domElement);const ot=new vn(Ei,4/3,Xu,200);ot.up.set(0,0,1);const yt=new px(ot,B.domElement);yt.maxPolarAngle=Math.PI/2-.05,yt.minDistance=Ln,yt.touches.TWO=null;const J=new tu,rt=new Ks(B),bt=new Ax,Nt=rt.fromScene(bt,.04).texture;bt.dispose(),rt.dispose();const ct={renderer:B,labels:W,camera:ot,controls:yt,scene:J,room:null,stopJoints:()=>{},layout:null,placed:[],figures:new av,environment:Nt,labelObjects:new Map,labelSizes:new Map,personLabels:[],selection:null,render:()=>{ct.room&&(tM(ct.room,y.current,ot.position,c.current),$v(ct.room,ot,C.clientWidth,C.clientHeight,c.current)),B.render(J,ot),M(ct),W.render(J,ot)}};f.current=ct,yt.addEventListener("change",ct.render);const Ct=()=>{const Xt=C.clientWidth,Zt=C.clientHeight;Xt===0||Zt===0||(B.setSize(Xt,Zt,!1),B.domElement.style.width="100%",B.domElement.style.height="100%",W.setSize(Xt,Zt),ot.aspect=Xt/Zt,ot.updateProjectionMatrix(),ct.render())},Vt=typeof ResizeObserver>"u"?null:new ResizeObserver(Ct);Vt==null||Vt.observe(C),Ct();const Bt=Xt=>U.current(Xt);return C.addEventListener("wheel",Bt,{capture:!0,passive:!1}),()=>{C.removeEventListener("wheel",Bt,{capture:!0}),Vt==null||Vt.disconnect(),yt.removeEventListener("change",ct.render),yt.dispose(),ct.stopJoints(),ct.selection&&qu(ct.selection),ct.room&&Ch(ct.room),ct.figures.dispose(),Nt.dispose(),B.dispose(),B.domElement.remove(),W.domElement.remove(),f.current=null}},[_]);const y=Tn(i);y.current=i;function M(C){var Ct,Vt,Bt,Xt,Zt;const B=C.labels.domElement.clientWidth||C.renderer.domElement.clientWidth,W=C.labels.domElement.clientHeight||C.renderer.domElement.clientHeight,ot=[],yt=new Map,J=new T;for(const{id:tt,text:dt}of hf(x.current,p.current)){const xt=(Ct=C.room)==null?void 0:Ct.labelPoints.get(tt),At=C.labelObjects.get(tt);if(!xt||!At||(At.visible=!1,!((Vt=At.parent)!=null&&Vt.visible)))continue;const Et=jv(xt,C.camera,B,W);if(!Et)continue;At.getWorldPosition(J).project(C.camera),yt.set(tt,[(J.x+1)/2*B,(1-J.y)/2*W]);const Jt=yM(At.element,C.labelSizes);if(Jt.width===0)continue;const zt=tt===p.current?SM*2:0,Qt={width:Jt.width+zt,height:Jt.height+zt};ot.push({id:tt,text:dt,x:Et.x,top:Et.top,...Qt})}const rt=[];for(const[tt,dt]of((Bt=C.room)==null?void 0:Bt.heads)??[]){if(!((Zt=(Xt=C.room)==null?void 0:Xt.things.get(tt))!=null&&Zt.visible))continue;const xt=Ol(dt,C.camera,B,W);xt&&rt.push({id:tt,...xt})}const bt=4,Nt=uf(ot,MM,{x0:bt,x1:B-bt,y0:bt,y1:W-bt},rt),ct=new Set(x.current.filter(tt=>tt.person).map(tt=>tt.id));C.personLabels=[];for(const tt of Nt){const dt=C.labelObjects.get(tt.id),xt=yt.get(tt.id);if(!dt||!xt)continue;dt.visible=!0,dt.element.style.translate=`${tt.x-xt[0]}px ${tt.y-xt[1]}px`;const At=ot.find(Et=>Et.id===tt.id);At&&ct.has(tt.id)&&C.personLabels.push({id:tt.id,x0:tt.x-At.width/2,x1:tt.x+At.width/2,y0:tt.y-At.height/2,y1:tt.y+At.height/2})}}er(()=>{var Nt,ct,Ct;const C=f.current;if(!C)return;if(s==="dollhouse"&&(C.controls.maxDistance=wh(i)),C.room&&((Nt=C.layout)==null?void 0:Nt.size)===i.size&&C.layout.exits===i.exits&&C.layout.finishes===i.finishes&&Qv(C.room,C.placed,t)){C.layout=i,C.placed=t;for(const[Bt,Xt]of C.labelObjects){const Zt=(ct=C.room.labelPoints.get(Bt))==null?void 0:ct[0];Zt&&Xt.parent&&Xt.position.copy(Xt.parent.worldToLocal(Zt.clone()))}const Vt=C.room.things.get(e);Vt&&(Vt.visible=s!=="eyes"),Jo(C,p.current),C.renderer.shadowMap.needsUpdate=!0,C.render();return}const B=C.room;B&&C.scene.remove(B.root);for(const Vt of C.labelObjects.values())Vt.removeFromParent();C.labelObjects.clear(),C.stopJoints();const W=B?vv(B):new Map,ot=kv({layout:i,placed:t,youId:e,figures:C.figures,environment:C.environment});C.room=ot,C.layout=i,C.placed=t,C.scene.add(ot.root);const yt=ot.things.get(e);yt&&(yt.visible=s!=="eyes");const J=ff(t,e),rt=[...J.filter(Vt=>Hs(Vt.thing)).map(Vt=>({id:Vt.thing.id,text:ho(Wl(Vt.thing,e)),person:!0})),...J.filter(Vt=>!Hs(Vt.thing)).map(({thing:Vt})=>{var tt;const Bt=((tt=Vt.form_parts)==null?void 0:tt.flatMap(({fitting:dt})=>dt!=null&&dt.opened?dt.contents:[]))??[],Xt=ho(Wl(Vt,e)),Zt=Bt.length?`${Xt} · ${ho(Bt[0].name)}${Bt.length>1?` (+${Bt.length-1})`:""}`:Xt;return{id:Vt.id,text:Zt,person:!1}})];x.current=rt;for(const{id:Vt,text:Bt,person:Xt}of rt){const Zt=ot.labelPoints.get(Vt),tt=ot.things.get(Vt);if(!Zt||!tt)continue;const dt=document.createElement("div");dt.className=Vt===e?"rl3d-label rl3d-label-you":Xt?"rl3d-label rl3d-label-person":"rl3d-label",dt.textContent=Bt,dt.style.display="none",C.labels.domElement.appendChild(dt);const xt=(Ct=ot.markers.get(Vt))==null?void 0:Ct.material,At=xt?getComputedStyle(dt).color:"";xt&&At&&xt.color.setStyle(At);const Et=new Rx(dt);tt.updateWorldMatrix(!0,!1),Et.position.copy(tt.worldToLocal(Zt[0].clone())),Et.visible=!1,tt.add(Et),C.labelObjects.set(Vt,Et)}Jo(C,p.current);const bt=()=>{C.renderer.shadowMap.needsUpdate=!0,C.render()};C.stopJoints=Mv(ot,W,bt,xv(typeof window.matchMedia=="function"?Vt=>window.matchMedia(Vt):void 0)),bt(),B&&Ch(B)},[i,t,e,s]),er(()=>{const C=f.current;C&&(Jo(C,r),C.render())},[r]);const A=(st=t.find(C=>C.thing.id===e))==null?void 0:st.bounds;er(()=>{const C=f.current;c.current=s,C&&(C.controls.enabled=s==="dollhouse",C.camera.fov=s==="eyes"?Il:Ei,C.camera.updateProjectionMatrix(),P.current=null,s==="dollhouse"&&(C.controls.maxDistance=wh(i),$o(C,xs(i)),C.controls.update(),C.render()))},[s,i.num]),er(()=>{const C=f.current;if(!C||s!=="eyes")return;const B=m?Xl(m):null,W=g?Xl(g):null;$o(C,vM(i,B,W,A)),C.render()},[s,i,m,g,A==null?void 0:A.x0,A==null?void 0:A.y0,A==null?void 0:A.z1]);const b=Tn(null),v=C=>{z(C),b.current=C.isPrimary&&C.button===0?{id:C.pointerId,x:C.clientX,y:C.clientY}:null},E=C=>{var bt;z(C);const B=b.current;b.current=null;const W=f.current;if(!(W!=null&&W.room)||!B||B.id!==C.pointerId||Math.hypot(C.clientX-B.x,C.clientY-B.y)>4)return;const ot=W.renderer.domElement.getBoundingClientRect();if(ot.width===0||ot.height===0)return;const yt=new _t((C.clientX-ot.left)/ot.width*2-1,-((C.clientY-ot.top)/ot.height)*2+1),J=new Jr;J.setFromCamera(yt,W.camera);const rt=hM((bt=J.intersectObjects(cM(W.room),!0)[0])==null?void 0:bt.object);(rt==null?void 0:rt.kind)==="fitting"?l(rt.lifetime):(rt==null?void 0:rt.kind)==="inspect"?h(rt.id,rt.lifetime,rt.role):(rt==null?void 0:rt.kind)==="exit"?u.current(rt.name):(rt==null?void 0:rt.kind)==="thing"&&o(rt.id)},D=C=>{const B=f.current,W=B?xM(B.camera.fov,C):void 0;return!B||W===void 0?!1:(B.camera.fov=W,B.camera.updateProjectionMatrix(),B.render(),!0)},P=Tn(null),L=C=>{const B=f.current;if(!B)return;C.preventDefault(),C.stopPropagation();const W=C.deltaMode,ot=C.deltaY;if(ot===0)return;const yt=rM(ot,W)*(ot<0?1:-1);if(s==="eyes"){B.camera.fov=nl(B.camera.fov,yt),B.camera.updateProjectionMatrix(),B.render();return}V(B,C.clientX,C.clientY,sM(i)**yt)},U=Tn(L);U.current=L;const V=(C,B,W,ot)=>{var rt;const yt=P.current;if(!yt||Math.hypot(B-yt.x,W-yt.y)>4){const bt=C.renderer.domElement.getBoundingClientRect(),Nt=C.room?pM(C.camera,{x:B-bt.left,y:W-bt.top},bt,C.room,t,i,C.personLabels):void 0;P.current={x:B,y:W,pick:Nt}}const J=(rt=P.current)==null?void 0:rt.pick;_M(C.camera.position,C.controls.target,(J==null?void 0:J.point)??C.controls.target.clone(),ot,(J==null?void 0:J.nearest)??Ln,J==null?void 0:J.pace),C.controls.minDistance=lM(J),C.controls.update(),C.render()},N=Tn(new gM),z=C=>{const B=f.current;if(!(!B||C.pointerType!=="touch"||s!=="dollhouse"))if(C.type==="pointerdown")N.current.down(C.pointerId,C.clientX,C.clientY);else if(C.type==="pointerup"||C.type==="pointercancel")N.current.up(C.pointerId);else{const W=N.current.move(C.pointerId,C.clientX,C.clientY);W&&V(B,W.at.x,W.at.y,W.scale)}},k=(C,B)=>{P.current=null;const W=t.find(yt=>yt.thing.id===e),ot=W&&C.room?Wu(C.room,W,i):void 0;nM(C.camera,C.controls.target,ot?ot.point:Vu(A,i)),C.controls.minDistance=ot&&ot.frame>0?Math.min(Ln,ot.frame):Ln,C.controls.dollyIn(B)},G=C=>{const B=f.current;if(!B||C.altKey||C.ctrlKey||C.metaKey)return;if(s==="eyes"){D(C.key)&&C.preventDefault();return}const W=Math.PI/18,yt={ArrowLeft:()=>B.controls.rotateLeft(-W),ArrowRight:()=>B.controls.rotateLeft(W),ArrowUp:()=>B.controls.rotateUp(W/2),ArrowDown:()=>B.controls.rotateUp(-W/2),"+":()=>k(B,Is),"=":()=>k(B,Is),"-":()=>k(B,1/Is),_:()=>k(B,1/Is),0:()=>{P.current=null,B.controls.minDistance=Ln,$o(B,xs(i)),B.controls.update()}}[C.key];yt&&(C.preventDefault(),yt(),B.render())};return _?Yl("div",{ref:d,className:"room-layout-3d",role:"img","aria-label":n,tabIndex:0,"data-mode":s,onPointerDown:v,onPointerUp:E,onPointerMove:z,onPointerCancel:C=>{b.current=null,z(C)},onKeyDown:G}):Yl("p",{role:"status",children:"This browser cannot draw 3D (it offers no WebGL). The Plan view and the lists below show the room."})};export{AM as default};
