var lf=Object.defineProperty;var cf=(i,t,e)=>t in i?lf(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var di=(i,t,e)=>cf(i,typeof t!="symbol"?t+"":t,e);import{aT as Bs,aU as Bn,aV as Zr,aW as hf,aX as uf,aY as ff,aZ as Jl,a_ as df,a$ as pf,b0 as as,b1 as Ws,b2 as Bh,b3 as la,b4 as Hh,b5 as $l,b6 as mf,b7 as gf,b8 as kh,b9 as Gh,ba as _f,bb as xf,bc as vf,bd as Mf,be as yf,A as An,d as Sf,aL as Ql,_ as Ef,bf,bg as wf,h as ar,bh as Tf,bi as yo,bj as jl,bk as tc,u as ec}from"./index-B8v_38-b.js";/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const dl="187",hs={ROTATE:0,DOLLY:1,PAN:2},ls={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Af=0,nc=1,Rf=2,Hs=1,Cf=2,Ns=3,Oi=0,fn=1,Ln=2,us=0,ks=1,ic=2,sc=3,rc=4,Pf=5,os=100,Lf=101,Df=102,If=103,Nf=104,Uf=200,Of=201,Ff=202,zf=203,Vh=204,Wh=205,Bf=206,Hf=207,kf=208,Gf=209,Vf=210,Wf=211,Xf=212,Yf=213,qf=214,ca=0,ha=1,ua=2,Xs=3,fa=4,da=5,pa=6,ma=7,pl=0,Zf=1,Kf=2,ci=0,Xh=1,Yh=2,qh=3,Zh=4,Kh=5,Jh=6,ml=7,$h=300,gs=301,Ys=302,So=303,Eo=304,ga=1e3,oi=1001,_a=1002,nn=1003,Jf=1004,lr=1005,gn=1006,bo=1007,Mi=1008,yn=1009,Qh=1010,jh=1011,qs=1012,gl=1013,qn=1014,In=1015,Zn=1016,_l=1017,xl=1018,_s=1020,tu=35902,eu=35899,nu=1021,iu=1022,Gn=1023,Ei=1026,yi=1027,vl=1028,Ml=1029,Fi=1030,yl=1031,Sl=1033,Br=33776,Hr=33777,kr=33778,Gr=33779,xa=35840,va=35841,Ma=35842,ya=35843,Sa=36196,Ea=37492,ba=37496,wa=37488,Ta=37489,Kr=37490,Aa=37491,Ra=37808,Ca=37809,Pa=37810,La=37811,Da=37812,Ia=37813,Na=37814,Ua=37815,Oa=37816,Fa=37817,za=37818,Ba=37819,Ha=37820,ka=37821,Ga=36492,Va=36494,Wa=36495,Xa=36283,Ya=36284,Jr=36285,qa=36286,$f=3200,$r=0,Qf=1,vi="",vn="srgb",Qr="srgb-linear",jr="linear",Re="srgb",wo=7680,jf=519,td=512,ed=513,nd=514,su=515,id=516,sd=517,ru=518,ou=519,rd=35044,oc="300 es",Nn=2e3,Zs=2001;function od(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function to(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ad(){const i=to("canvas");return i.style.display="block",i}const ac={};function lc(...i){const t="THREE."+i.shift();console.log(t,...i)}function au(i){const t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){const e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function te(...i){i=au(i);const t="THREE."+i.shift();{const e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function ye(...i){i=au(i);const t="THREE."+i.shift();{const e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function fs(...i){const t=i.join(" ");t in ac||(ac[t]=!0,te(...i))}function ld(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}const cd={[ca]:ca,[ua]:pa,[fa]:fa,[Xs]:da,[ha]:ha,[pa]:ua,[ma]:ma,[da]:Xs};class wi{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){const n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){const n=this._listeners;if(n===void 0)return;const s=n[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){const e=this._listeners;if(e===void 0)return;const n=e[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const on=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Vr=Math.PI/180,Za=180/Math.PI;function Ss(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(on[i&255]+on[i>>8&255]+on[i>>16&255]+on[i>>24&255]+"-"+on[t&255]+on[t>>8&255]+"-"+on[t>>16&15|64]+on[t>>24&255]+"-"+on[e&63|128]+on[e>>8&255]+"-"+on[e>>16&255]+on[e>>24&255]+on[n&255]+on[n>>8&255]+on[n>>16&255]+on[n>>24&255]).toLowerCase()}function pe(i,t,e){return Math.max(t,Math.min(e,i))}function hd(i,t){return(i%t+t)%t}function To(i,t,e){return(1-e)*i+e*t}function ud(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function El(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function fd(i,t){if(t.constructor===Float32Array)return i;const e=El(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/e,-1)}function dd(i,t){if(t.constructor===Float32Array)return i;const e=El(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*e)}const pd={DEG2RAD:Vr},Xl=class Xl{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(pe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(pe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Xl.prototype.isVector2=!0;let ft=Xl;class Ne{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let c=n[s+0],l=n[s+1],u=n[s+2],d=n[s+3],f=r[o+0],h=r[o+1],p=r[o+2],_=r[o+3];if(d!==_||c!==f||l!==h||u!==p){let m=c*f+l*h+u*p+d*_;m<0&&(f=-f,h=-h,p=-p,_=-_,m=-m);let g=1-a;if(m<.9995){const x=Math.acos(m),y=Math.sin(x);g=Math.sin(g*x)/y,a=Math.sin(a*x)/y,c=c*g+f*a,l=l*g+h*a,u=u*g+p*a,d=d*g+_*a}else{c=c*g+f*a,l=l*g+h*a,u=u*g+p*a,d=d*g+_*a;const x=1/Math.sqrt(c*c+l*l+u*u+d*d);c*=x,l*=x,u*=x,d*=x}}t[e]=c,t[e+1]=l,t[e+2]=u,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,r,o){const a=n[s],c=n[s+1],l=n[s+2],u=n[s+3],d=r[o],f=r[o+1],h=r[o+2],p=r[o+3];return t[e]=a*p+u*d+c*h-l*f,t[e+1]=c*p+u*f+l*d-a*h,t[e+2]=l*p+u*h+a*f-c*d,t[e+3]=u*p-a*d-c*f-l*h,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(n/2),u=a(s/2),d=a(r/2),f=c(n/2),h=c(s/2),p=c(r/2);switch(o){case"XYZ":this._x=f*u*d+l*h*p,this._y=l*h*d-f*u*p,this._z=l*u*p+f*h*d,this._w=l*u*d-f*h*p;break;case"YXZ":this._x=f*u*d+l*h*p,this._y=l*h*d-f*u*p,this._z=l*u*p-f*h*d,this._w=l*u*d+f*h*p;break;case"ZXY":this._x=f*u*d-l*h*p,this._y=l*h*d+f*u*p,this._z=l*u*p+f*h*d,this._w=l*u*d-f*h*p;break;case"ZYX":this._x=f*u*d-l*h*p,this._y=l*h*d+f*u*p,this._z=l*u*p-f*h*d,this._w=l*u*d+f*h*p;break;case"YZX":this._x=f*u*d+l*h*p,this._y=l*h*d+f*u*p,this._z=l*u*p-f*h*d,this._w=l*u*d-f*h*p;break;case"XZY":this._x=f*u*d-l*h*p,this._y=l*h*d-f*u*p,this._z=l*u*p+f*h*d,this._w=l*u*d+f*h*p;break;default:te("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],c=e[9],l=e[2],u=e[6],d=e[10],f=n+a+d;if(f>0){const h=.5/Math.sqrt(f+1);this._w=.25/h,this._x=(u-c)*h,this._y=(r-l)*h,this._z=(o-s)*h}else if(n>a&&n>d){const h=2*Math.sqrt(1+n-a-d);this._w=(u-c)/h,this._x=.25*h,this._y=(s+o)/h,this._z=(r+l)/h}else if(a>d){const h=2*Math.sqrt(1+a-n-d);this._w=(r-l)/h,this._x=(s+o)/h,this._y=.25*h,this._z=(c+u)/h}else{const h=2*Math.sqrt(1+d-n-a);this._w=(o-s)/h,this._x=(r+l)/h,this._y=(c+u)/h,this._z=.25*h}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(pe(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,c=e._y,l=e._z,u=e._w;return this._x=n*u+o*a+s*l-r*c,this._y=s*u+o*c+r*a-n*l,this._z=r*u+o*l+n*c-s*a,this._w=o*u-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let c=1-e;if(a<.9995){const l=Math.acos(a),u=Math.sin(l);c=Math.sin(c*l)/u,e=Math.sin(e*l)/u,this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this._onChangeCallback()}else this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Yl=class Yl{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(cc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(cc.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*s-a*n),u=2*(a*e-r*s),d=2*(r*n-o*e);return this.x=e+c*l+o*d-a*u,this.y=n+c*u+a*l-r*d,this.z=s+c*d+r*u-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this.z=pe(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this.z=pe(this.z,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(pe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,c=e.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Ao.copy(this).projectOnVector(t),this.sub(Ao)}reflect(t){return this.sub(Ao.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(pe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Yl.prototype.isVector3=!0;let b=Yl;const Ao=new b,cc=new Ne,ql=class ql{constructor(t,e,n,s,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,l)}set(t,e,n,s,r,o,a,c,l){const u=this.elements;return u[0]=t,u[1]=s,u[2]=a,u[3]=e,u[4]=r,u[5]=c,u[6]=n,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],u=n[4],d=n[7],f=n[2],h=n[5],p=n[8],_=s[0],m=s[3],g=s[6],x=s[1],y=s[4],v=s[7],T=s[2],A=s[5],M=s[8];return r[0]=o*_+a*x+c*T,r[3]=o*m+a*y+c*A,r[6]=o*g+a*v+c*M,r[1]=l*_+u*x+d*T,r[4]=l*m+u*y+d*A,r[7]=l*g+u*v+d*M,r[2]=f*_+h*x+p*T,r[5]=f*m+h*y+p*A,r[8]=f*g+h*v+p*M,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],u=t[8];return e*o*u-e*a*l-n*r*u+n*a*c+s*r*l-s*o*c}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],u=t[8],d=u*o-a*l,f=a*c-u*r,h=l*r-o*c,p=e*d+n*f+s*h;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/p;return t[0]=d*_,t[1]=(s*l-u*n)*_,t[2]=(a*n-s*o)*_,t[3]=f*_,t[4]=(u*e-s*c)*_,t[5]=(s*r-a*e)*_,t[6]=h*_,t[7]=(n*c-l*e)*_,t[8]=(o*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+t,-s*l,s*c,-s*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return fs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ro.makeScale(t,e)),this}rotate(t){return fs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ro.makeRotation(-t)),this}translate(t,e){return fs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ro.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};ql.prototype.isMatrix3=!0;let oe=ql;const Ro=new oe,hc=new oe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),uc=new oe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function md(){const i={enabled:!0,workingColorSpace:Qr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Re&&(s.r=hi(s.r),s.g=hi(s.g),s.b=hi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Re&&(s.r=ds(s.r),s.g=ds(s.g),s.b=ds(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===vi?jr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Qr]:{primaries:t,whitePoint:n,transfer:jr,toXYZ:hc,fromXYZ:uc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:vn},outputColorSpaceConfig:{drawingBufferColorSpace:vn}},[vn]:{primaries:t,whitePoint:n,transfer:Re,toXYZ:hc,fromXYZ:uc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:vn}}}),i}const ve=md();function hi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ds(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Wi;class gd{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Wi===void 0&&(Wi=to("canvas")),Wi.width=t.width,Wi.height=t.height;const s=Wi.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=Wi}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=to("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=hi(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(hi(e[n]/255)*255):e[n]=hi(e[n]);return{data:e,width:t.width,height:t.height}}else return te("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let _d=0;class bl{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:_d++}),this.uuid=Ss(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width||0,e.height||0,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Co(s[o].image)):r.push(Co(s[o]))}else r=Co(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function Co(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?gd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(te("Texture: Unable to serialize Texture."),{})}let xd=0;const Po=new b;class dn extends wi{constructor(t=dn.DEFAULT_IMAGE,e=dn.DEFAULT_MAPPING,n=oi,s=oi,r=gn,o=Mi,a=Gn,c=yn,l=dn.DEFAULT_ANISOTROPY,u=vi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:xd++}),this.uuid=Ss(),this.name="",this.source=new bl(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ft(0,0),this.repeat=new ft(1,1),this.center=new ft(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new oe,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Po).x}get height(){return this.source.getSize(Po).y}get depth(){return this.source.getSize(Po).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const e in t){const n=t[e];if(n===void 0){te(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){te(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==$h)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ga:t.x=t.x-Math.floor(t.x);break;case oi:t.x=t.x<0?0:1;break;case _a:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ga:t.y=t.y-Math.floor(t.y);break;case oi:t.y=t.y<0?0:1;break;case _a:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}dn.DEFAULT_IMAGE=null;dn.DEFAULT_MAPPING=$h;dn.DEFAULT_ANISOTROPY=1;const Zl=class Zl{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const c=t.elements,l=c[0],u=c[4],d=c[8],f=c[1],h=c[5],p=c[9],_=c[2],m=c[6],g=c[10];if(Math.abs(u-f)<.01&&Math.abs(d-_)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+f)<.1&&Math.abs(d+_)<.1&&Math.abs(p+m)<.1&&Math.abs(l+h+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(l+1)/2,v=(h+1)/2,T=(g+1)/2,A=(u+f)/4,M=(d+_)/4,E=(p+m)/4;return y>v&&y>T?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=A/n,r=M/n):v>T?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=A/s,r=E/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=M/r,s=E/r),this.set(n,s,r,e),this}let x=Math.sqrt((m-p)*(m-p)+(d-_)*(d-_)+(f-u)*(f-u));return Math.abs(x)<.001&&(x=1),this.x=(m-p)/x,this.y=(d-_)/x,this.z=(f-u)/x,this.w=Math.acos((l+h+g-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this.z=pe(this.z,t.z,e.z),this.w=pe(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this.z=pe(this.z,t,e),this.w=pe(this.w,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(pe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Zl.prototype.isVector4=!0;let ze=Zl;class vd extends wi{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:gn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new ze(0,0,t,e),this.scissorTest=!1,this.viewport=new ze(0,0,t,e),this.textures=[];const s=n.count;for(let r=0;r<s;r++)this.textures[r]=new dn({width:t,height:e,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){const e={minFilter:gn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.mipmapsAutoUpdate!==void 0&&(e.mipmapsAutoUpdate=t.mipmapsAutoUpdate),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;const s=Object.assign({},t.textures[e].image);this.textures[e].source=new bl(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){const e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Yn extends vd{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class lu extends dn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=nn,this.minFilter=nn,this.wrapR=oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Md extends dn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=nn,this.minFilter=nn,this.wrapR=oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}const uo=class uo{constructor(t,e,n,s,r,o,a,c,l,u,d,f,h,p,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,l,u,d,f,h,p,_,m)}set(t,e,n,s,r,o,a,c,l,u,d,f,h,p,_,m){const g=this.elements;return g[0]=t,g[4]=e,g[8]=n,g[12]=s,g[1]=r,g[5]=o,g[9]=a,g[13]=c,g[2]=l,g[6]=u,g[10]=d,g[14]=f,g[3]=h,g[7]=p,g[11]=_,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new uo().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const e=this.elements,n=t.elements,s=1/Xi.setFromMatrixColumn(t,0).length(),r=1/Xi.setFromMatrixColumn(t,1).length(),o=1/Xi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){const f=o*u,h=o*d,p=a*u,_=a*d;e[0]=c*u,e[4]=-c*d,e[8]=l,e[1]=h+p*l,e[5]=f-_*l,e[9]=-a*c,e[2]=_-f*l,e[6]=p+h*l,e[10]=o*c}else if(t.order==="YXZ"){const f=c*u,h=c*d,p=l*u,_=l*d;e[0]=f+_*a,e[4]=p*a-h,e[8]=o*l,e[1]=o*d,e[5]=o*u,e[9]=-a,e[2]=h*a-p,e[6]=_+f*a,e[10]=o*c}else if(t.order==="ZXY"){const f=c*u,h=c*d,p=l*u,_=l*d;e[0]=f-_*a,e[4]=-o*d,e[8]=p+h*a,e[1]=h+p*a,e[5]=o*u,e[9]=_-f*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){const f=o*u,h=o*d,p=a*u,_=a*d;e[0]=c*u,e[4]=p*l-h,e[8]=f*l+_,e[1]=c*d,e[5]=_*l+f,e[9]=h*l-p,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){const f=o*c,h=o*l,p=a*c,_=a*l;e[0]=c*u,e[4]=_-f*d,e[8]=p*d+h,e[1]=d,e[5]=o*u,e[9]=-a*u,e[2]=-l*u,e[6]=h*d+p,e[10]=f-_*d}else if(t.order==="XZY"){const f=o*c,h=o*l,p=a*c,_=a*l;e[0]=c*u,e[4]=-d,e[8]=l*u,e[1]=f*d+_,e[5]=o*u,e[9]=h*d-p,e[2]=p*d-h,e[6]=a*u,e[10]=_*d+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(yd,t,Sd)}lookAt(t,e,n){const s=this.elements;return _n.subVectors(t,e),_n.lengthSq()===0&&(_n.z=1),_n.normalize(),pi.crossVectors(n,_n),pi.lengthSq()===0&&(Math.abs(n.z)===1?_n.x+=1e-4:_n.z+=1e-4,_n.normalize(),pi.crossVectors(n,_n)),pi.normalize(),cr.crossVectors(_n,pi),s[0]=pi.x,s[4]=cr.x,s[8]=_n.x,s[1]=pi.y,s[5]=cr.y,s[9]=_n.y,s[2]=pi.z,s[6]=cr.z,s[10]=_n.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],u=n[1],d=n[5],f=n[9],h=n[13],p=n[2],_=n[6],m=n[10],g=n[14],x=n[3],y=n[7],v=n[11],T=n[15],A=s[0],M=s[4],E=s[8],I=s[12],P=s[1],C=s[5],N=s[9],B=s[13],U=s[2],z=s[6],W=s[10],X=s[14],it=s[3],L=s[7],H=s[11],k=s[15];return r[0]=o*A+a*P+c*U+l*it,r[4]=o*M+a*C+c*z+l*L,r[8]=o*E+a*N+c*W+l*H,r[12]=o*I+a*B+c*X+l*k,r[1]=u*A+d*P+f*U+h*it,r[5]=u*M+d*C+f*z+h*L,r[9]=u*E+d*N+f*W+h*H,r[13]=u*I+d*B+f*X+h*k,r[2]=p*A+_*P+m*U+g*it,r[6]=p*M+_*C+m*z+g*L,r[10]=p*E+_*N+m*W+g*H,r[14]=p*I+_*B+m*X+g*k,r[3]=x*A+y*P+v*U+T*it,r[7]=x*M+y*C+v*z+T*L,r[11]=x*E+y*N+v*W+T*H,r[15]=x*I+y*B+v*X+T*k,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],c=t[9],l=t[13],u=t[2],d=t[6],f=t[10],h=t[14],p=t[3],_=t[7],m=t[11],g=t[15],x=c*h-l*f,y=a*h-l*d,v=a*f-c*d,T=o*h-l*u,A=o*f-c*u,M=o*d-a*u;return e*(_*x-m*y+g*v)-n*(p*x-m*T+g*A)+s*(p*y-_*T+g*M)-r*(p*v-_*A+m*M)}determinantAffine(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],o=t[5],a=t[9],c=t[2],l=t[6],u=t[10];return e*(o*u-a*l)-n*(r*u-a*c)+s*(r*l-o*c)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],u=t[8],d=t[9],f=t[10],h=t[11],p=t[12],_=t[13],m=t[14],g=t[15],x=e*a-n*o,y=e*c-s*o,v=e*l-r*o,T=n*c-s*a,A=n*l-r*a,M=s*l-r*c,E=u*_-d*p,I=u*m-f*p,P=u*g-h*p,C=d*m-f*_,N=d*g-h*_,B=f*g-h*m,U=x*B-y*N+v*C+T*P-A*I+M*E;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const z=1/U;return t[0]=(a*B-c*N+l*C)*z,t[1]=(s*N-n*B-r*C)*z,t[2]=(_*M-m*A+g*T)*z,t[3]=(f*A-d*M-h*T)*z,t[4]=(c*P-o*B-l*I)*z,t[5]=(e*B-s*P+r*I)*z,t[6]=(m*v-p*M-g*y)*z,t[7]=(u*M-f*v+h*y)*z,t[8]=(o*N-a*P+l*E)*z,t[9]=(n*P-e*N-r*E)*z,t[10]=(p*A-_*v+g*x)*z,t[11]=(d*v-u*A-h*x)*z,t[12]=(a*I-o*C-c*E)*z,t[13]=(e*C-n*I+s*E)*z,t[14]=(_*y-p*T-m*x)*z,t[15]=(u*T-d*y+f*x)*z,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,c=t.z,l=r*o,u=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,u*a+n,u*c-s*o,0,l*c-s*a,u*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,o=e._y,a=e._z,c=e._w,l=r+r,u=o+o,d=a+a,f=r*l,h=r*u,p=r*d,_=o*u,m=o*d,g=a*d,x=c*l,y=c*u,v=c*d,T=n.x,A=n.y,M=n.z;return s[0]=(1-(_+g))*T,s[1]=(h+v)*T,s[2]=(p-y)*T,s[3]=0,s[4]=(h-v)*A,s[5]=(1-(f+g))*A,s[6]=(m+x)*A,s[7]=0,s[8]=(p+y)*M,s[9]=(m-x)*M,s[10]=(1-(f+_))*M,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=Xi.set(s[0],s[1],s[2]).length();const a=Xi.set(s[4],s[5],s[6]).length(),c=Xi.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Rn.copy(this);const l=1/o,u=1/a,d=1/c;return Rn.elements[0]*=l,Rn.elements[1]*=l,Rn.elements[2]*=l,Rn.elements[4]*=u,Rn.elements[5]*=u,Rn.elements[6]*=u,Rn.elements[8]*=d,Rn.elements[9]*=d,Rn.elements[10]*=d,e.setFromRotationMatrix(Rn),n.x=o,n.y=a,n.z=c,this}makePerspective(t,e,n,s,r,o,a=Nn,c=!1){const l=this.elements,u=2*r/(e-t),d=2*r/(n-s),f=(e+t)/(e-t),h=(n+s)/(n-s);let p,_;if(c)p=r/(o-r),_=o*r/(o-r);else if(a===Nn)p=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Zs)p=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=d,l[9]=h,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=Nn,c=!1){const l=this.elements,u=2/(e-t),d=2/(n-s),f=-(e+t)/(e-t),h=-(n+s)/(n-s);let p,_;if(c)p=1/(o-r),_=o/(o-r);else if(a===Nn)p=-2/(o-r),_=-(o+r)/(o-r);else if(a===Zs)p=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=d,l[9]=0,l[13]=h,l[2]=0,l[6]=0,l[10]=p,l[14]=_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};uo.prototype.isMatrix4=!0;let Yt=uo;const Xi=new b,Rn=new Yt,yd=new b(0,0,0),Sd=new b(1,1,1),pi=new b,cr=new b,_n=new b,fc=new Yt,dc=new Ne;class ke{constructor(t=0,e=0,n=0,s=ke.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],u=s[9],d=s[2],f=s[6],h=s[10];switch(e){case"XYZ":this._y=Math.asin(pe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,h),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-pe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,h),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(pe(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-d,h),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-pe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(f,h),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(pe(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,h));break;case"XZY":this._z=Math.asin(-pe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,h),this._y=0);break;default:te("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return fc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(fc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return dc.setFromEuler(this),this.setFromQuaternion(dc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ke.DEFAULT_ORDER="XYZ";class wl{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Ed=0;const pc=new b,Yi=new Ne,ei=new Yt,hr=new b,bs=new b,bd=new b,wd=new Ne,mc=new b(1,0,0),gc=new b(0,1,0),_c=new b(0,0,1),xc={type:"added"},Td={type:"removed"},qi={type:"childadded",child:null},Lo={type:"childremoved",child:null};class Ge extends wi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ed++}),this.uuid=Ss(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ge.DEFAULT_UP.clone();const t=new b,e=new ke,n=new Ne,s=new b(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Yt},normalMatrix:{value:new oe}}),this.matrix=new Yt,this.matrixWorld=new Yt,this.matrixAutoUpdate=Ge.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new wl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Yi.setFromAxisAngle(t,e),this.quaternion.multiply(Yi),this}rotateOnWorldAxis(t,e){return Yi.setFromAxisAngle(t,e),this.quaternion.premultiply(Yi),this}rotateX(t){return this.rotateOnAxis(mc,t)}rotateY(t){return this.rotateOnAxis(gc,t)}rotateZ(t){return this.rotateOnAxis(_c,t)}translateOnAxis(t,e){return pc.copy(t).applyQuaternion(this.quaternion),this.position.add(pc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(mc,t)}translateY(t){return this.translateOnAxis(gc,t)}translateZ(t){return this.translateOnAxis(_c,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ei.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?hr.copy(t):hr.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),bs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ei.lookAt(bs,hr,this.up):ei.lookAt(hr,bs,this.up),this.quaternion.setFromRotationMatrix(ei),s&&(ei.extractRotation(s.matrixWorld),Yi.setFromRotationMatrix(ei),this.quaternion.premultiply(Yi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(ye("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(xc),qi.child=t,this.dispatchEvent(qi),qi.child=null):ye("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Td),Lo.child=t,this.dispatchEvent(Lo),Lo.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ei.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ei.multiply(t.parent.matrixWorld)),t.applyMatrix4(ei),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(xc),qi.child=t,this.dispatchEvent(qi),qi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bs,t,bd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bs,wd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){const s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const d=c[l];r(t.shapes,d)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(t.materials,this.material[c]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];s.animations.push(r(t.animations,c))}}if(e){const a=o(t.geometries),c=o(t.materials),l=o(t.textures),u=o(t.images),d=o(t.shapes),f=o(t.skeletons),h=o(t.animations),p=o(t.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),f.length>0&&(n.skeletons=f),h.length>0&&(n.animations=h),p.length>0&&(n.nodes=p)}return n.object=s,n;function o(a){const c=[];for(const l in a){const u=a[l];delete u.metadata,c.push(u)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Ge.DEFAULT_UP=new b(0,1,0);Ge.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Un extends Ge{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Ad={type:"move"};class Do{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Un,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Un,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new b,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new b),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Un,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new b,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new b,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,n),g=this._getHandJoint(l,_);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}const u=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],f=u.position.distanceTo(d.position),h=.02,p=.005;l.inputState.pinching&&f>h+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&f<=h-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.quaternion,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Ad)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Un;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const cu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},mi={h:0,s:0,l:0},ur={h:0,s:0,l:0};function Io(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class se{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=vn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ve.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=ve.workingColorSpace){return this.r=t,this.g=e,this.b=n,ve.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=ve.workingColorSpace){if(t=hd(t,1),e=pe(e,0,1),n=pe(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Io(o,r,t+1/3),this.g=Io(o,r,t),this.b=Io(o,r,t-1/3)}return ve.colorSpaceToWorking(this,s),this}setStyle(t,e=vn){function n(r){r!==void 0&&parseFloat(r)<1&&te("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:te("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);te("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=vn){const n=cu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):te("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=hi(t.r),this.g=hi(t.g),this.b=hi(t.b),this}copyLinearToSRGB(t){return this.r=ds(t.r),this.g=ds(t.g),this.b=ds(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=vn){return ve.workingToColorSpace(an.copy(this),t),Math.round(pe(an.r*255,0,255))*65536+Math.round(pe(an.g*255,0,255))*256+Math.round(pe(an.b*255,0,255))}getHexString(t=vn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ve.workingColorSpace){ve.workingToColorSpace(an.copy(this),e);const n=an.r,s=an.g,r=an.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let c,l;const u=(a+o)/2;if(a===o)c=0,l=0;else{const d=o-a;switch(l=u<=.5?d/(o+a):d/(2-o-a),o){case n:c=(s-r)/d+(s<r?6:0);break;case s:c=(r-n)/d+2;break;case r:c=(n-s)/d+4;break}c/=6}return t.h=c,t.s=l,t.l=u,t}getRGB(t,e=ve.workingColorSpace){return ve.workingToColorSpace(an.copy(this),e),t.r=an.r,t.g=an.g,t.b=an.b,t}getStyle(t=vn){ve.workingToColorSpace(an.copy(this),t);const e=an.r,n=an.g,s=an.b;return t!==vn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(mi),this.setHSL(mi.h+t,mi.s+e,mi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(mi),t.getHSL(ur);const n=To(mi.h,ur.h,e),s=To(mi.s,ur.s,e),r=To(mi.l,ur.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const an=new se;se.NAMES=cu;class hu extends Ge{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ke,this.environmentIntensity=1,this.environmentRotation=new ke,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}}const Cn=new b,ni=new b,No=new b,ii=new b,Zi=new b,Ki=new b,vc=new b,Uo=new b,Oo=new b,Fo=new b,zo=new ze,Bo=new ze,Ho=new ze;class En{constructor(t=new b,e=new b,n=new b){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Cn.subVectors(t,e),s.cross(Cn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Cn.subVectors(s,e),ni.subVectors(n,e),No.subVectors(t,e);const o=Cn.dot(Cn),a=Cn.dot(ni),c=Cn.dot(No),l=ni.dot(ni),u=ni.dot(No),d=o*l-a*a;if(d===0)return r.set(0,0,0),null;const f=1/d,h=(l*c-a*u)*f,p=(o*u-a*c)*f;return r.set(1-h-p,p,h)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,ii)===null?!1:ii.x>=0&&ii.y>=0&&ii.x+ii.y<=1}static getInterpolation(t,e,n,s,r,o,a,c){return this.getBarycoord(t,e,n,s,ii)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,ii.x),c.addScaledVector(o,ii.y),c.addScaledVector(a,ii.z),c)}static getInterpolatedAttribute(t,e,n,s,r,o){return zo.setScalar(0),Bo.setScalar(0),Ho.setScalar(0),zo.fromBufferAttribute(t,e),Bo.fromBufferAttribute(t,n),Ho.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(zo,r.x),o.addScaledVector(Bo,r.y),o.addScaledVector(Ho,r.z),o}static isFrontFacing(t,e,n,s){return Cn.subVectors(n,e),ni.subVectors(t,e),Cn.cross(ni).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Cn.subVectors(this.c,this.b),ni.subVectors(this.a,this.b),Cn.cross(ni).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return En.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return En.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return En.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return En.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return En.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let o,a;Zi.subVectors(s,n),Ki.subVectors(r,n),Uo.subVectors(t,n);const c=Zi.dot(Uo),l=Ki.dot(Uo);if(c<=0&&l<=0)return e.copy(n);Oo.subVectors(t,s);const u=Zi.dot(Oo),d=Ki.dot(Oo);if(u>=0&&d<=u)return e.copy(s);const f=c*d-u*l;if(f<=0&&c>=0&&u<=0&&c-u>0)return o=c/(c-u),e.copy(n).addScaledVector(Zi,o);Fo.subVectors(t,r);const h=Zi.dot(Fo),p=Ki.dot(Fo);if(p>=0&&h<=p)return e.copy(r);const _=h*l-c*p;if(_<=0&&l>=0&&p<=0)return a=l/(l-p),e.copy(n).addScaledVector(Ki,a);const m=u*p-h*d;if(m<=0&&d-u>=0&&h-p>=0)return vc.subVectors(r,s),a=(d-u)/(d-u+(h-p)),e.copy(s).addScaledVector(vc,a);const g=1/(m+_+f);return o=_*g,a=f*g,e.copy(n).addScaledVector(Zi,o).addScaledVector(Ki,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class ln{constructor(t=new b(1/0,1/0,1/0),e=new b(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Pn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Pn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Pn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Pn):Pn.fromBufferAttribute(r,o),Pn.applyMatrix4(t.matrixWorld),this.expandByPoint(Pn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),fr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),fr.copy(n.boundingBox)),fr.applyMatrix4(t.matrixWorld),this.union(fr)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Pn),Pn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(ws),dr.subVectors(this.max,ws),Ji.subVectors(t.a,ws),$i.subVectors(t.b,ws),Qi.subVectors(t.c,ws),gi.subVectors($i,Ji),_i.subVectors(Qi,$i),Ri.subVectors(Ji,Qi);let e=[0,-gi.z,gi.y,0,-_i.z,_i.y,0,-Ri.z,Ri.y,gi.z,0,-gi.x,_i.z,0,-_i.x,Ri.z,0,-Ri.x,-gi.y,gi.x,0,-_i.y,_i.x,0,-Ri.y,Ri.x,0];return!ko(e,Ji,$i,Qi,dr)||(e=[1,0,0,0,1,0,0,0,1],!ko(e,Ji,$i,Qi,dr))?!1:(pr.crossVectors(gi,_i),e=[pr.x,pr.y,pr.z],ko(e,Ji,$i,Qi,dr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Pn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Pn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(si),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const si=[new b,new b,new b,new b,new b,new b,new b,new b],Pn=new b,fr=new ln,Ji=new b,$i=new b,Qi=new b,gi=new b,_i=new b,Ri=new b,ws=new b,dr=new b,pr=new b,Ci=new b;function ko(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Ci.fromArray(i,r);const a=s.x*Math.abs(Ci.x)+s.y*Math.abs(Ci.y)+s.z*Math.abs(Ci.z),c=t.dot(Ci),l=e.dot(Ci),u=n.dot(Ci);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}const Ve=new b,mr=new ft;let Rd=0;class bn extends wi{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Rd++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=rd,this.updateRanges=[],this.gpuType=In,this.version=0,this._normalizationScale=t!==void 0?El(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)mr.fromBufferAttribute(this,e),mr.applyMatrix3(t),this.setXY(e,mr.x,mr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.applyMatrix3(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.applyMatrix4(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.applyNormalMatrix(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.transformDirection(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=this._denormalize(n)),n}setComponent(t,e,n){return this.normalized&&(n=this._normalize(n)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=this._denormalize(e)),e}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=this._denormalize(e)),e}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=this._denormalize(e)),e}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=this._denormalize(e)),e}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){const e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):fd(t,this.array)}_normalize(t){const e=this._normalizationScale;return e!==void 0?Math.round(t*e):dd(t,this.array)}}class uu extends bn{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class fu extends bn{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class ue extends bn{constructor(t,e,n){super(new Float32Array(t),e,n)}}const Cd=new ln,Ts=new b,Go=new b;class Gi{constructor(t=new b,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Cd.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ts.subVectors(t,this.center);const e=Ts.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Ts,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Go.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ts.copy(t.center).add(Go)),this.expandByPoint(Ts.copy(t.center).sub(Go))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}let Pd=0;const Sn=new Yt,Vo=new Ge,ji=new b,xn=new ln,As=new ln,$e=new b;class De extends wi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Pd++}),this.uuid=Ss(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(od(t)?fu:uu)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new oe().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Sn.makeRotationFromQuaternion(t),this.applyMatrix4(Sn),this}rotateX(t){return Sn.makeRotationX(t),this.applyMatrix4(Sn),this}rotateY(t){return Sn.makeRotationY(t),this.applyMatrix4(Sn),this}rotateZ(t){return Sn.makeRotationZ(t),this.applyMatrix4(Sn),this}translate(t,e,n){return Sn.makeTranslation(t,e,n),this.applyMatrix4(Sn),this}scale(t,e,n){return Sn.makeScale(t,e,n),this.applyMatrix4(Sn),this}lookAt(t){return Vo.lookAt(t),Vo.updateMatrix(),this.applyMatrix4(Vo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ji).negate(),this.translate(ji.x,ji.y,ji.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ue(n,3))}else{const n=Math.min(t.length,e.count);for(let s=0;s<n;s++){const r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&te("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ln);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){ye("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new b(-1/0,-1/0,-1/0),new b(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];xn.setFromBufferAttribute(r),this.morphTargetsRelative?($e.addVectors(this.boundingBox.min,xn.min),this.boundingBox.expandByPoint($e),$e.addVectors(this.boundingBox.max,xn.max),this.boundingBox.expandByPoint($e)):(this.boundingBox.expandByPoint(xn.min),this.boundingBox.expandByPoint(xn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ye('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Gi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){ye("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new b,1/0);return}if(t){const n=this.boundingSphere.center;if(xn.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];As.setFromBufferAttribute(a),this.morphTargetsRelative?($e.addVectors(xn.min,As.min),xn.expandByPoint($e),$e.addVectors(xn.max,As.max),xn.expandByPoint($e)):(xn.expandByPoint(As.min),xn.expandByPoint(As.max))}xn.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)$e.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared($e));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)$e.fromBufferAttribute(a,l),c&&(ji.fromBufferAttribute(t,l),$e.add(ji)),s=Math.max(s,n.distanceToSquared($e))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ye('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){ye("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;let o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new bn(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));const a=[],c=[],l=new Uint8Array(n.count);for(let I=0;I<n.count;I++)a[I]=new b,c[I]=new b;const u=new b,d=new b,f=new b,h=new ft,p=new ft,_=new ft,m=new b,g=new b;function x(I,P,C){l[I]=l[P]=l[C]=1,u.fromBufferAttribute(n,I),d.fromBufferAttribute(n,P),f.fromBufferAttribute(n,C),h.fromBufferAttribute(r,I),p.fromBufferAttribute(r,P),_.fromBufferAttribute(r,C),d.sub(u),f.sub(u),p.sub(h),_.sub(h);const N=1/(p.x*_.y-_.x*p.y);isFinite(N)&&(m.copy(d).multiplyScalar(_.y).addScaledVector(f,-p.y).multiplyScalar(N),g.copy(f).multiplyScalar(p.x).addScaledVector(d,-_.x).multiplyScalar(N),a[I].add(m),a[P].add(m),a[C].add(m),c[I].add(g),c[P].add(g),c[C].add(g))}let y=this.groups;y.length===0&&(y=[{start:0,count:t.count}]);for(let I=0,P=y.length;I<P;++I){const C=y[I],N=C.start,B=C.count;for(let U=N,z=N+B;U<z;U+=3)x(t.getX(U+0),t.getX(U+1),t.getX(U+2))}const v=new b,T=new b,A=new b,M=new b;function E(I){A.fromBufferAttribute(s,I),M.copy(A);const P=a[I];v.copy(P),v.sub(A.multiplyScalar(A.dot(P))).normalize(),T.crossVectors(M,P);const N=T.dot(c[I])<0?-1:1;o.setXYZW(I,v.x,v.y,v.z,N)}for(let I=0,P=n.count;I<P;++I)l[I]&&E(I);this._transformed=!0}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new bn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,h=n.count;f<h;f++)n.setXYZ(f,0,0,0);const s=new b,r=new b,o=new b,a=new b,c=new b,l=new b,u=new b,d=new b;if(t)for(let f=0,h=t.count;f<h;f+=3){const p=t.getX(f+0),_=t.getX(f+1),m=t.getX(f+2);s.fromBufferAttribute(e,p),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),u.subVectors(o,r),d.subVectors(s,r),u.cross(d),a.fromBufferAttribute(n,p),c.fromBufferAttribute(n,_),l.fromBufferAttribute(n,m),a.add(u),c.add(u),l.add(u),n.setXYZ(p,a.x,a.y,a.z),n.setXYZ(_,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,h=e.count;f<h;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),o.fromBufferAttribute(e,f+2),u.subVectors(o,r),d.subVectors(s,r),u.cross(d),n.setXYZ(f+0,u.x,u.y,u.z),n.setXYZ(f+1,u.x,u.y,u.z),n.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)$e.fromBufferAttribute(t,e),$e.normalize(),t.setXYZ(e,$e.x,$e.y,$e.z)}toNonIndexed(){function t(a,c){const l=a.array,u=a.itemSize,d=a.normalized,f=new l.constructor(c.length*u);let h=0,p=0;for(let _=0,m=c.length;_<m;_++){a.isInterleavedBufferAttribute?h=c[_]*a.data.stride+a.offset:h=c[_]*u;for(let g=0;g<u;g++)f[p++]=l[h++]}return new bn(f,u,d)}if(this.index===null)return te("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new De,n=this.index.array,s=this.attributes;for(const a in s){const c=s[a],l=t(c,n);e.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const c=[],l=r[a];for(let u=0,d=l.length;u<d;u++){const f=l[u],h=t(f,n);c.push(h)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const c in n){const l=n[c];t.data.attributes[c]=l.toJSON(t.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let d=0,f=l.length;d<f;d++){const h=l[d];u.push(h.toJSON(t.data))}u.length>0&&(s[c]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone());const s=t.attributes;for(const l in s){const u=s[l];this.setAttribute(l,u.clone(e))}const r=t.morphAttributes;for(const l in r){const u=[],d=r[l];for(let f=0,h=d.length;f<h;f++)u.push(d[f].clone(e));this.morphAttributes[l]=u}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let l=0,u=o.length;l<u;l++){const d=o[l];this.addGroup(d.start,d.count,d.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Wo=new b,Ld=new b,Dd=new oe;class Hn{constructor(t=new b(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=Wo.subVectors(n,e).cross(Ld.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){const s=t.delta(Wo),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(s,o)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Dd.getNormalMatrix(t),s=this.coplanarPoint(Wo).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}let Id=0;class Vi extends wi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Id++}),this.uuid=Ss(),this.name="",this.type="Material",this.blending=ks,this.side=Oi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Vh,this.blendDst=Wh,this.blendEquation=os,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new se(0,0,0),this.blendAlpha=0,this.depthFunc=Xs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=wo,this.stencilZFail=wo,this.stencilZPass=wo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){te(`Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){te(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new se().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.diffuseRoughness!==void 0&&(this.diffuseRoughness=t.diffuseRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum),t.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1]),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new Hn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new ft().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ft().fromArray(t.clearcoatNormalScale)),t.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}const ri=new b,Xo=new b,gr=new b,_r=new b;class er{constructor(t=new b,e=new b(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ri)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=ri.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ri.copy(this.origin).addScaledVector(this.direction,e),ri.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Xo.copy(t).add(e).multiplyScalar(.5),gr.copy(e).sub(t).normalize(),_r.copy(this.origin).sub(Xo);const r=t.distanceTo(e)*.5,o=-this.direction.dot(gr),a=_r.dot(this.direction),c=-_r.dot(gr),l=_r.lengthSq(),u=Math.abs(1-o*o);let d,f,h,p;if(u>0)if(d=o*c-a,f=o*a-c,p=r*u,d>=0)if(f>=-p)if(f<=p){const _=1/u;d*=_,f*=_,h=d*(d+o*f+2*a)+f*(o*d+f+2*c)+l}else f=r,d=Math.max(0,-(o*f+a)),h=-d*d+f*(f+2*c)+l;else f=-r,d=Math.max(0,-(o*f+a)),h=-d*d+f*(f+2*c)+l;else f<=-p?(d=Math.max(0,-(-o*r+a)),f=d>0?-r:Math.min(Math.max(-r,-c),r),h=-d*d+f*(f+2*c)+l):f<=p?(d=0,f=Math.min(Math.max(-r,-c),r),h=f*(f+2*c)+l):(d=Math.max(0,-(o*r+a)),f=d>0?r:Math.min(Math.max(-r,-c),r),h=-d*d+f*(f+2*c)+l);else f=o>0?-r:r,d=Math.max(0,-(o*f+a)),h=-d*d+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Xo).addScaledVector(gr,f),h}intersectSphere(t,e){if(t.radius<0)return null;ri.subVectors(t.center,this.origin);const n=ri.dot(this.direction),s=ri.dot(ri)-n*n,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,c;const l=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,f=this.origin;return l>=0?(n=(t.min.x-f.x)*l,s=(t.max.x-f.x)*l):(n=(t.max.x-f.x)*l,s=(t.min.x-f.x)*l),u>=0?(r=(t.min.y-f.y)*u,o=(t.max.y-f.y)*u):(r=(t.max.y-f.y)*u,o=(t.min.y-f.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(t.min.z-f.z)*d,c=(t.max.z-f.z)*d):(a=(t.max.z-f.z)*d,c=(t.min.z-f.z)*d),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ri)!==null}intersectTriangle(t,e,n,s,r){const o=this.origin,a=this.direction,c=a.x,l=a.y,u=a.z,d=t.x-o.x,f=t.y-o.y,h=t.z-o.z,p=e.x-o.x,_=e.y-o.y,m=e.z-o.z,g=n.x-o.x,x=n.y-o.y,y=n.z-o.z,v=Math.abs(c),T=Math.abs(l),A=Math.abs(u);let M,E,I,P,C,N,B,U,z,W,X,it;if(v>=T&&v>=A?(I=c,N=d,z=p,it=g,c>=0?(M=l,E=u,P=f,C=h,B=_,U=m,W=x,X=y):(M=u,E=l,P=h,C=f,B=m,U=_,W=y,X=x)):T>=A?(I=l,N=f,z=_,it=x,l>=0?(M=u,E=c,P=h,C=d,B=m,U=p,W=y,X=g):(M=c,E=u,P=d,C=h,B=p,U=m,W=g,X=y)):(I=u,N=h,z=m,it=y,u>=0?(M=c,E=l,P=d,C=f,B=p,U=_,W=g,X=x):(M=l,E=c,P=f,C=d,B=_,U=p,W=x,X=g)),I===0)return null;const L=M/I,H=E/I,k=1/I,at=P-L*N,mt=C-H*N,V=B-L*z,nt=U-H*z,Et=W-L*it,Pt=X-H*it,Mt=Et*nt-Pt*V,Ut=at*Pt-mt*Et,qt=V*mt-nt*at;if(s){if(Mt<0||Ut<0||qt<0)return null}else if((Mt<0||Ut<0||qt<0)&&(Mt>0||Ut>0||qt>0))return null;const Ot=Mt+Ut+qt;if(Ot===0)return null;const Zt=k*(Mt*N+Ut*z+qt*it);return(Ot>0?Zt<0:Zt>0)?null:this.at(Zt/Ot,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class fo extends Vi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ke,this.combine=pl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Mc=new Yt,Pi=new er,xr=new Gi,yc=new b,vr=new b,Mr=new b,yr=new b,Yo=new b,Sr=new b,Sc=new b,Er=new b;let Te=class extends Ge{constructor(t=new De,e=new fo){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){Sr.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const u=a[c],d=r[c];u!==0&&(Yo.fromBufferAttribute(d,t),o?Sr.addScaledVector(Yo,u):Sr.addScaledVector(Yo.sub(e),u))}e.add(Sr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),xr.copy(n.boundingSphere),xr.applyMatrix4(r),Pi.copy(t.ray).recast(t.near),!(xr.containsPoint(Pi.origin)===!1&&(Pi.intersectSphere(xr,yc)===null||Pi.origin.distanceToSquared(yc)>(t.far-t.near)**2))&&(Mc.copy(r).invert(),Pi.copy(t.ray).applyMatrix4(Mc),!(n.boundingBox!==null&&Pi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Pi)))}_computeIntersections(t,e,n){let s;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,f=r.groups,h=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,_=f.length;p<_;p++){const m=f[p],g=o[m.materialIndex],x=Math.max(m.start,h.start),y=Math.min(a.count,Math.min(m.start+m.count,h.start+h.count));for(let v=x,T=y;v<T;v+=3){const A=a.getX(v),M=a.getX(v+1),E=a.getX(v+2);s=br(this,g,t,n,l,u,d,A,M,E),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const p=Math.max(0,h.start),_=Math.min(a.count,h.start+h.count);for(let m=p,g=_;m<g;m+=3){const x=a.getX(m),y=a.getX(m+1),v=a.getX(m+2);s=br(this,o,t,n,l,u,d,x,y,v),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let p=0,_=f.length;p<_;p++){const m=f[p],g=o[m.materialIndex],x=Math.max(m.start,h.start),y=Math.min(c.count,Math.min(m.start+m.count,h.start+h.count));for(let v=x,T=y;v<T;v+=3){const A=v,M=v+1,E=v+2;s=br(this,g,t,n,l,u,d,A,M,E),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const p=Math.max(0,h.start),_=Math.min(c.count,h.start+h.count);for(let m=p,g=_;m<g;m+=3){const x=m,y=m+1,v=m+2;s=br(this,o,t,n,l,u,d,x,y,v),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function Nd(i,t,e,n,s,r,o,a){let c;if(t.side===fn?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,t.side===Oi,a),c===null)return null;Er.copy(a),Er.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(Er);return l<e.near||l>e.far?null:{distance:l,point:Er.clone(),object:i}}function br(i,t,e,n,s,r,o,a,c,l){i.getVertexPosition(a,vr),i.getVertexPosition(c,Mr),i.getVertexPosition(l,yr);const u=Nd(i,t,e,n,vr,Mr,yr,Sc);if(u){const d=new b;En.getBarycoord(Sc,vr,Mr,yr,d),s&&(u.uv=En.getInterpolatedAttribute(s,a,c,l,d,new ft)),r&&(u.uv1=En.getInterpolatedAttribute(r,a,c,l,d,new ft)),o&&(u.normal=En.getInterpolatedAttribute(o,a,c,l,d,new b),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const f={a,b:c,c:l,normal:new b,materialIndex:0};En.getNormal(vr,Mr,yr,f.normal),u.face=f,u.barycoord=d}return u}class du extends dn{constructor(t=null,e=1,n=1,s,r,o,a,c,l=nn,u=nn,d,f){super(null,o,a,c,l,u,s,r,d,f),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ec extends bn{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const ts=new Yt,bc=new Yt,wr=[],wc=new ln,Ud=new Yt,Rs=new Te,Cs=new Gi;class Od extends Te{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Ec(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Ud)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new ln),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ts),wc.copy(t.boundingBox).applyMatrix4(ts),this.boundingBox.union(wc)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Gi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ts),Cs.copy(t.boundingSphere).applyMatrix4(ts),this.boundingSphere.union(Cs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),this.morphTexture=t.morphTexture!==null?t.morphTexture.clone():null,this.instanceColor=t.instanceColor!==null?t.instanceColor.clone():null,this.count=t.count,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(Rs.geometry=this.geometry,Rs.material=this.material,Rs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Cs.copy(this.boundingSphere),Cs.applyMatrix4(n),t.ray.intersectsSphere(Cs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ts),bc.multiplyMatrices(n,ts),Rs.matrixWorld=bc,Rs.raycast(t,wr);for(let o=0,a=wr.length;o<a;o++){const c=wr[o];c.instanceId=r,c.object=this,e.push(c)}wr.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Ec(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new du(new Float32Array(s*this.count),s,this.count,vl,In));const r=this.morphTexture.source.data.data;let o=0;for(let l=0;l<n.length;l++)o+=n[l];const a=this.geometry.morphTargetsRelative?1:1-o,c=s*t;return r[c]=a,r.set(n,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Li=new Gi,Fd=new ft(.5,.5),Tr=new b;class Ks{constructor(t=new Hn,e=new Hn,n=new Hn,s=new Hn,r=new Hn,o=new Hn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Nn,n=!1){const s=this.planes,r=t.elements,o=r[0],a=r[1],c=r[2],l=r[3],u=r[4],d=r[5],f=r[6],h=r[7],p=r[8],_=r[9],m=r[10],g=r[11],x=r[12],y=r[13],v=r[14],T=r[15];if(s[0].setComponents(l-o,h-u,g-p,T-x).normalize(),s[1].setComponents(l+o,h+u,g+p,T+x).normalize(),s[2].setComponents(l+a,h+d,g+_,T+y).normalize(),s[3].setComponents(l-a,h-d,g-_,T-y).normalize(),n)s[4].setComponents(c,f,m,v).normalize(),s[5].setComponents(l-c,h-f,g-m,T-v).normalize();else if(s[4].setComponents(l-c,h-f,g-m,T-v).normalize(),e===Nn)s[5].setComponents(l+c,h+f,g+m,T+v).normalize();else if(e===Zs)s[5].setComponents(c,f,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Li.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Li.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Li)}intersectsSprite(t){Li.center.set(0,0,0);const e=Fd.distanceTo(t.center);return Li.radius=.7071067811865476+e,Li.applyMatrix4(t.matrixWorld),this.intersectsSphere(Li)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(Tr.x=s.normal.x>0?t.max.x:t.min.x,Tr.y=s.normal.y>0?t.max.y:t.min.y,Tr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Tr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const Tc=new Yt;class Tl{constructor(){this.coordinateSystem=Nn,this._frustums=[],this._count=0}setFromArrayCamera(t){const e=t.cameras,n=this._frustums;for(let s=0;s<e.length;s++){const r=e[s];Tc.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new Ks),n[s].setFromProjectionMatrix(Tc,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsObject(t))return!0;return!1}intersectsSprite(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSprite(t))return!0;return!1}intersectsSphere(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSphere(t))return!0;return!1}intersectsBox(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsBox(t))return!0;return!1}containsPoint(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;const e=this._frustums,n=t._frustums;for(let s=0;s<t._count;s++)e[s]===void 0&&(e[s]=new Ks),e[s].copy(n[s]);return this._count=t._count,this}clone(){return new Tl().copy(this)}}class Al extends Vi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new se(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const eo=new b,no=new b,Ac=new Yt,Ps=new er,Ar=new Gi,qo=new b,Rc=new b;class zd extends Ge{constructor(t=new De,e=new Al){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)eo.fromBufferAttribute(e,s-1),no.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=eo.distanceTo(no);t.setAttribute("lineDistance",new ue(n,1))}else te("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ar.copy(n.boundingSphere),Ar.applyMatrix4(s),Ar.radius+=r,t.ray.intersectsSphere(Ar)===!1)return;Ac.copy(s).invert(),Ps.copy(t.ray).applyMatrix4(Ac);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=n.index,f=n.attributes.position;if(u!==null){const h=Math.max(0,o.start),p=Math.min(u.count,o.start+o.count);for(let _=h,m=p-1;_<m;_+=l){const g=u.getX(_),x=u.getX(_+1),y=Rr(this,t,Ps,c,g,x,_);y&&e.push(y)}if(this.isLineLoop){const _=u.getX(p-1),m=u.getX(h),g=Rr(this,t,Ps,c,_,m,p-1);g&&e.push(g)}}else{const h=Math.max(0,o.start),p=Math.min(f.count,o.start+o.count);for(let _=h,m=p-1;_<m;_+=l){const g=Rr(this,t,Ps,c,_,_+1,_);g&&e.push(g)}if(this.isLineLoop){const _=Rr(this,t,Ps,c,p-1,h,p-1);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Rr(i,t,e,n,s,r,o){const a=i.geometry.attributes.position;if(eo.fromBufferAttribute(a,s),no.fromBufferAttribute(a,r),e.distanceSqToSegment(eo,no,qo,Rc)>n)return;qo.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(qo);if(!(l<t.near||l>t.far))return{distance:l,point:Rc.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}const Cc=new b,Pc=new b;class po extends zd{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Cc.fromBufferAttribute(e,s),Pc.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Cc.distanceTo(Pc);t.setAttribute("lineDistance",new ue(n,1))}else te("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class pu extends dn{constructor(t=[],e=gs,n,s,r,o,a,c,l,u){super(t,e,n,s,r,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class xs extends dn{constructor(t,e,n=qn,s,r,o,a=nn,c=nn,l,u=Ei,d=1){if(u!==Ei&&u!==yi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:t,height:e,depth:d};super(f,s,r,o,a,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new bl(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}}class mu extends xs{constructor(t,e=qn,n=gs,s,r,o=nn,a=nn,c,l=Ei){const u={width:t,height:t,depth:1},d=[u,u,u,u,u,u];super(t,t,e,n,s,r,o,a,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class gu extends dn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class Kn extends De{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const c=[],l=[],u=[],d=[];let f=0,h=0;p("z","y","x",-1,-1,n,e,t,o,r,0),p("z","y","x",1,-1,n,e,-t,o,r,1),p("x","z","y",1,1,t,n,e,s,o,2),p("x","z","y",1,-1,t,n,-e,s,o,3),p("x","y","z",1,-1,t,e,n,s,r,4),p("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new ue(l,3)),this.setAttribute("normal",new ue(u,3)),this.setAttribute("uv",new ue(d,2));function p(_,m,g,x,y,v,T,A,M,E,I){const P=v/M,C=T/E,N=v/2,B=T/2,U=A/2,z=M+1,W=E+1;let X=0,it=0;const L=new b;for(let H=0;H<W;H++){const k=H*C-B;for(let at=0;at<z;at++){const mt=at*P-N;L[_]=mt*x,L[m]=k*y,L[g]=U,l.push(L.x,L.y,L.z),L[_]=0,L[m]=0,L[g]=A>0?1:-1,u.push(L.x,L.y,L.z),d.push(at/M),d.push(1-H/E),X+=1}}for(let H=0;H<E;H++)for(let k=0;k<M;k++){const at=f+k+z*H,mt=f+k+z*(H+1),V=f+(k+1)+z*(H+1),nt=f+(k+1)+z*H;c.push(at,mt,nt),c.push(mt,V,nt),it+=6}a.addGroup(h,it,I),h+=it,f+=X}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Kn(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class Rl extends De{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const o=[],a=[],c=[],l=[],u=e/2,d=Math.PI/2*t,f=e,h=2*d+f,p=n*2+r,_=s+1,m=new b,g=new b;for(let x=0;x<=p;x++){let y=0,v=0,T=0,A=0;if(x<=n){const I=x/n,P=I*Math.PI/2;v=-u-t*Math.cos(P),T=t*Math.sin(P),A=-t*Math.cos(P),y=I*d}else if(x<=n+r){const I=(x-n)/r;v=-u+I*e,T=t,A=0,y=d+I*f}else{const I=(x-n-r)/n,P=I*Math.PI/2;v=u+t*Math.sin(P),T=t*Math.cos(P),A=t*Math.sin(P),y=d+f+I*d}const M=Math.max(0,Math.min(1,y/h));let E=0;x===0?E=.5/s:x===p&&(E=-.5/s);for(let I=0;I<=s;I++){const P=I/s,C=P*Math.PI*2,N=Math.sin(C),B=Math.cos(C);g.x=-T*B,g.y=v,g.z=T*N,a.push(g.x,g.y,g.z),m.set(-T*B,A,T*N),m.normalize(),c.push(m.x,m.y,m.z),l.push(P+E,M)}if(x>0){const I=(x-1)*_;for(let P=0;P<s;P++){const C=I+P,N=I+P+1,B=x*_+P,U=x*_+P+1;o.push(C,N,B),o.push(N,U,B)}}}this.setIndex(o),this.setAttribute("position",new ue(a,3)),this.setAttribute("normal",new ue(c,3)),this.setAttribute("uv",new ue(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Rl(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}}class Vn extends De{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};const l=this;s=Math.floor(s),r=Math.floor(r);const u=[],d=[],f=[],h=[];let p=0;const _=[],m=n/2;let g=0;x(),o===!1&&(t>0&&y(!0),e>0&&y(!1)),this.setIndex(u),this.setAttribute("position",new ue(d,3)),this.setAttribute("normal",new ue(f,3)),this.setAttribute("uv",new ue(h,2));function x(){const v=new b,T=new b;let A=0;const M=(e-t)/n;for(let E=0;E<=r;E++){const I=[],P=E/r,C=P*(e-t)+t;for(let N=0;N<=s;N++){const B=N/s,U=B*c+a,z=Math.sin(U),W=Math.cos(U);T.x=C*z,T.y=-P*n+m,T.z=C*W,d.push(T.x,T.y,T.z),v.set(z,M,W).normalize(),f.push(v.x,v.y,v.z),h.push(B,1-P),I.push(p++)}_.push(I)}for(let E=0;E<s;E++)for(let I=0;I<r;I++){const P=_[I][E],C=_[I+1][E],N=_[I+1][E+1],B=_[I][E+1];(t>0||I!==0)&&(u.push(P,C,B),A+=3),(e>0||I!==r-1)&&(u.push(C,N,B),A+=3)}l.addGroup(g,A,0),g+=A}function y(v){const T=p,A=new ft,M=new b;let E=0;const I=v===!0?t:e,P=v===!0?1:-1;for(let N=1;N<=s;N++)d.push(0,m*P,0),f.push(0,P,0),h.push(.5,.5),p++;const C=p;for(let N=0;N<=s;N++){const U=N/s*c+a,z=Math.cos(U),W=Math.sin(U);M.x=I*W,M.y=m*P,M.z=I*z,d.push(M.x,M.y,M.z),f.push(0,P,0),A.x=z*.5+.5,A.y=W*.5*P+.5,h.push(A.x,A.y),p++}for(let N=0;N<s;N++){const B=T+N,U=C+N;v===!0?u.push(U,U+1,B):u.push(U+1,U,B),E+=3}l.addGroup(g,E,v===!0?1:2),g+=E}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Vn(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Si extends Vn{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new Si(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class nr extends De{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};const r=[],o=[];a(s),l(n),u(),this.setAttribute("position",new ue(r,3)),this.setAttribute("normal",new ue(r.slice(),3)),this.setAttribute("uv",new ue(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(x){const y=new b,v=new b,T=new b;for(let A=0;A<e.length;A+=3)h(e[A+0],y),h(e[A+1],v),h(e[A+2],T),c(y,v,T,x)}function c(x,y,v,T){const A=T+1,M=[];for(let E=0;E<=A;E++){M[E]=[];const I=x.clone().lerp(v,E/A),P=y.clone().lerp(v,E/A),C=A-E;for(let N=0;N<=C;N++)N===0&&E===A?M[E][N]=I:M[E][N]=I.clone().lerp(P,N/C)}for(let E=0;E<A;E++)for(let I=0;I<2*(A-E)-1;I++){const P=Math.floor(I/2);I%2===0?(f(M[E][P+1]),f(M[E+1][P]),f(M[E][P])):(f(M[E][P+1]),f(M[E+1][P+1]),f(M[E+1][P]))}}function l(x){const y=new b;for(let v=0;v<r.length;v+=3)y.x=r[v+0],y.y=r[v+1],y.z=r[v+2],y.normalize().multiplyScalar(x),r[v+0]=y.x,r[v+1]=y.y,r[v+2]=y.z}function u(){const x=new b;for(let y=0;y<r.length;y+=3){x.x=r[y+0],x.y=r[y+1],x.z=r[y+2];const v=m(x)/2/Math.PI+.5,T=g(x)/Math.PI+.5;o.push(v,1-T)}p(),d()}function d(){for(let x=0;x<o.length;x+=6){const y=o[x+0],v=o[x+2],T=o[x+4],A=Math.max(y,v,T),M=Math.min(y,v,T);A>.9&&M<.1&&(y<.2&&(o[x+0]+=1),v<.2&&(o[x+2]+=1),T<.2&&(o[x+4]+=1))}}function f(x){r.push(x.x,x.y,x.z)}function h(x,y){const v=x*3;y.x=t[v+0],y.y=t[v+1],y.z=t[v+2]}function p(){const x=new b,y=new b,v=new b,T=new b,A=new ft,M=new ft,E=new ft;for(let I=0,P=0;I<r.length;I+=9,P+=6){x.set(r[I+0],r[I+1],r[I+2]),y.set(r[I+3],r[I+4],r[I+5]),v.set(r[I+6],r[I+7],r[I+8]),A.set(o[P+0],o[P+1]),M.set(o[P+2],o[P+3]),E.set(o[P+4],o[P+5]),T.copy(x).add(y).add(v).divideScalar(3);const C=m(T);_(A,P+0,x,C),_(M,P+2,y,C),_(E,P+4,v,C)}}function _(x,y,v,T){T<0&&x.x===1&&(o[y]=x.x-1),v.x===0&&v.z===0&&(o[y]=T/2/Math.PI+.5)}function m(x){return Math.atan2(x.z,-x.x)}function g(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new nr(t.vertices,t.indices,t.radius,t.detail)}}class Jn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){te("Curve: .getPoint() not implemented.")}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){const n=this.getLengths();let s=0;const r=n.length;let o;e?o=e:o=t*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=n[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===o)return s/(r-1);const u=n[s],f=n[s+1]-u,h=(o-u)/f;return(s+h)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),c=e||(o.isVector2?new ft:new b);return c.copy(a).sub(o).normalize(),c}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){const n=new b,s=[],r=[],o=[],a=new b,c=new Yt;for(let h=0;h<=t;h++){const p=h/t;s[h]=this.getTangentAt(p,new b)}r[0]=new b,o[0]=new b;let l=Number.MAX_VALUE;const u=Math.abs(s[0].x),d=Math.abs(s[0].y),f=Math.abs(s[0].z);u<=l&&(l=u,n.set(1,0,0)),d<=l&&(l=d,n.set(0,1,0)),f<=l&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let h=1;h<=t;h++){if(r[h]=r[h-1].clone(),o[h]=o[h-1].clone(),a.crossVectors(s[h-1],s[h]),a.length()>Number.EPSILON){a.normalize();const p=Math.acos(pe(s[h-1].dot(s[h]),-1,1));r[h].applyMatrix4(c.makeRotationAxis(a,p))}o[h].crossVectors(s[h],r[h])}if(e===!0){let h=Math.acos(pe(r[0].dot(r[t]),-1,1));h/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(h=-h);for(let p=1;p<=t;p++)r[p].applyMatrix4(c.makeRotationAxis(s[p],h*p)),o[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}}class Cl extends Jn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(t,e=new ft){const n=e,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+t*r;let c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const u=Math.cos(this.aRotation),d=Math.sin(this.aRotation),f=c-this.aX,h=l-this.aY;c=f*u-h*d+this.aX,l=f*d+h*u+this.aY}return n.set(c,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class Bd extends Cl{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Pl(){let i=0,t=0,e=0,n=0;function s(r,o,a,c){i=r,t=a,e=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){s(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,u,d){let f=(o-r)/l-(a-r)/(l+u)+(a-o)/u,h=(a-o)/u-(c-o)/(u+d)+(c-a)/d;f*=u,h*=u,s(o,a,f,h)},calc:function(r){const o=r*r,a=o*r;return i+t*r+e*o+n*a}}}const Lc=new b,Dc=new b,Zo=new Pl,Ko=new Pl,Jo=new Pl;class Ll extends Jn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new b){const n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t;let a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,u;this.closed||a>0?l=s[(a-1)%r]:(Dc.subVectors(s[0],s[1]).add(s[0]),l=Dc);const d=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(Lc.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Lc),this.curveType==="centripetal"||this.curveType==="chordal"){const h=this.curveType==="chordal"?.5:.25;let p=Math.pow(l.distanceToSquared(d),h),_=Math.pow(d.distanceToSquared(f),h),m=Math.pow(f.distanceToSquared(u),h);_<1e-4&&(_=1),p<1e-4&&(p=_),m<1e-4&&(m=_),Zo.initNonuniformCatmullRom(l.x,d.x,f.x,u.x,p,_,m),Ko.initNonuniformCatmullRom(l.y,d.y,f.y,u.y,p,_,m),Jo.initNonuniformCatmullRom(l.z,d.z,f.z,u.z,p,_,m)}else this.curveType==="catmullrom"&&(Zo.initCatmullRom(l.x,d.x,f.x,u.x,this.tension),Ko.initCatmullRom(l.y,d.y,f.y,u.y,this.tension),Jo.initCatmullRom(l.z,d.z,f.z,u.z,this.tension));return n.set(Zo.calc(c),Ko.calc(c),Jo.calc(c)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new b().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function Ic(i,t,e,n,s){const r=(n-t)*.5,o=(s-e)*.5,a=i*i,c=i*a;return(2*e-2*n+r+o)*c+(-3*e+3*n-2*r-o)*a+r*i+e}function Hd(i,t){const e=1-i;return e*e*t}function kd(i,t){return 2*(1-i)*i*t}function Gd(i,t){return i*i*t}function Gs(i,t,e,n){return Hd(i,t)+kd(i,e)+Gd(i,n)}function Vd(i,t){const e=1-i;return e*e*e*t}function Wd(i,t){const e=1-i;return 3*e*e*i*t}function Xd(i,t){return 3*(1-i)*i*i*t}function Yd(i,t){return i*i*i*t}function Vs(i,t,e,n,s){return Vd(i,t)+Wd(i,e)+Xd(i,n)+Yd(i,s)}class _u extends Jn{constructor(t=new ft,e=new ft,n=new ft,s=new ft){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new ft){const n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Vs(t,s.x,r.x,o.x,a.x),Vs(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class qd extends Jn{constructor(t=new b,e=new b,n=new b,s=new b){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new b){const n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Vs(t,s.x,r.x,o.x,a.x),Vs(t,s.y,r.y,o.y,a.y),Vs(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class xu extends Jn{constructor(t=new ft,e=new ft){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new ft){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new ft){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Zd extends Jn{constructor(t=new b,e=new b){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new b){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new b){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class vu extends Jn{constructor(t=new ft,e=new ft,n=new ft){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new ft){const n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Gs(t,s.x,r.x,o.x),Gs(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Kd extends Jn{constructor(t=new b,e=new b,n=new b){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new b){const n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Gs(t,s.x,r.x,o.x),Gs(t,s.y,r.y,o.y),Gs(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Mu extends Jn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new ft){const n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],l=s[o],u=s[o>s.length-2?s.length-1:o+1],d=s[o>s.length-3?s.length-1:o+2];return n.set(Ic(a,c.x,l.x,u.x,d.x),Ic(a,c.y,l.y,u.y,d.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new ft().fromArray(s))}return this}}var Ka=Object.freeze({__proto__:null,ArcCurve:Bd,CatmullRomCurve3:Ll,CubicBezierCurve:_u,CubicBezierCurve3:qd,EllipseCurve:Cl,LineCurve:xu,LineCurve3:Zd,QuadraticBezierCurve:vu,QuadraticBezierCurve3:Kd,SplineCurve:Mu});class Jd extends Jn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ka[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const o=s[r]-n,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,c=o.getPoints(a);for(let l=0;l<c.length;l++){const u=c[l];n&&n.equals(u)||(e.push(u),n=u)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this.cacheLengths=null,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(new Ka[s.type]().fromJSON(s))}return this.cacheLengths=null,this}}class Nc extends Jd{constructor(t){super(),this.type="Path",this.currentPoint=new ft,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new xu(this.currentPoint.clone(),new ft(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){const r=new vu(this.currentPoint.clone(),new ft(t,e),new ft(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){const a=new _u(this.currentPoint.clone(),new ft(t,e),new ft(n,s),new ft(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new Mu(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){const a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(t+a,e+c,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,c){const l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(t+l,e+u,n,s,r,o,a,c),this}absellipse(t,e,n,s,r,o,a,c){const l=new Cl(t,e,n,s,r,o,a,c);if(this.curves.length>0){const d=l.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(l);const u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class yu extends Nc{constructor(t){super(t),this.uuid=Ss(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(new Nc().fromJSON(s))}return this}}function $d(i,t,e=2){const n=t&&t.length,s=n?t[0]*e:i.length;let r=Su(i,0,s,e,!0);const o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(n&&(r=np(i,t,r,e)),i.length>80*e){a=i[0],c=i[1];let u=a,d=c;for(let f=e;f<s;f+=e){const h=i[f],p=i[f+1];h<a&&(a=h),p<c&&(c=p),h>u&&(u=h),p>d&&(d=p)}l=Math.max(u-a,d-c),l=l!==0?32767/l:0}return Js(r,o,e,a,c,l,0),o}function Su(i,t,e,n,s){let r;if(s===dp(i,t,e,n)>0)for(let o=t;o<e;o+=n)r=Uc(o/n|0,i[o],i[o+1],r);else for(let o=e-n;o>=t;o-=n)r=Uc(o/n|0,i[o],i[o+1],r);return r&&vs(r,r.next)&&(Qs(r),r=r.next),r}function zi(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(vs(e,e.next)||Be(e.prev,e,e.next)===0)){if(Qs(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Js(i,t,e,n,s,r,o){if(!i)return;!o&&r&&ap(i,n,s,r);let a=i;for(;i.prev!==i.next;){const c=i.prev,l=i.next;if(r?jd(i,n,s,r):Qd(i)){t.push(c.i,i.i,l.i),Qs(i),i=l.next,a=l.next;continue}if(i=l,i===a){o?o===1?(i=tp(zi(i),t),Js(i,t,e,n,s,r,2)):o===2&&ep(i,t,e,n,s,r):Js(zi(i),t,e,n,s,r,1);break}}}function Qd(i){const t=i.prev,e=i,n=i.next;if(Be(t,e,n)>=0)return!1;const s=t.x,r=e.x,o=n.x,a=t.y,c=e.y,l=n.y,u=Math.min(s,r,o),d=Math.min(a,c,l),f=Math.max(s,r,o),h=Math.max(a,c,l);let p=n.next;for(;p!==t;){if(p.x>=u&&p.x<=f&&p.y>=d&&p.y<=h&&Us(s,a,r,c,o,l,p.x,p.y)&&Be(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function jd(i,t,e,n){const s=i.prev,r=i,o=i.next;if(Be(s,r,o)>=0)return!1;const a=s.x,c=r.x,l=o.x,u=s.y,d=r.y,f=o.y,h=Math.min(a,c,l),p=Math.min(u,d,f),_=Math.max(a,c,l),m=Math.max(u,d,f),g=Ja(h,p,t,e,n),x=Ja(_,m,t,e,n);let y=i.prevZ,v=i.nextZ;for(;y&&y.z>=g&&v&&v.z<=x;){if(y.x>=h&&y.x<=_&&y.y>=p&&y.y<=m&&y!==s&&y!==o&&Us(a,u,c,d,l,f,y.x,y.y)&&Be(y.prev,y,y.next)>=0||(y=y.prevZ,v.x>=h&&v.x<=_&&v.y>=p&&v.y<=m&&v!==s&&v!==o&&Us(a,u,c,d,l,f,v.x,v.y)&&Be(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;y&&y.z>=g;){if(y.x>=h&&y.x<=_&&y.y>=p&&y.y<=m&&y!==s&&y!==o&&Us(a,u,c,d,l,f,y.x,y.y)&&Be(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;v&&v.z<=x;){if(v.x>=h&&v.x<=_&&v.y>=p&&v.y<=m&&v!==s&&v!==o&&Us(a,u,c,d,l,f,v.x,v.y)&&Be(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function tp(i,t){let e=i;do{const n=e.prev,s=e.next.next;!vs(n,s)&&bu(n,e,e.next,s)&&$s(n,s)&&$s(s,n)&&(t.push(n.i,e.i,s.i),Qs(e),Qs(e.next),e=i=s),e=e.next}while(e!==i);return zi(e)}function ep(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&hp(o,a)){let c=wu(o,a);o=zi(o,o.next),c=zi(c,c.next),Js(o,t,e,n,s,r,0),Js(c,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function np(i,t,e,n){const s=[];for(let r=0,o=t.length;r<o;r++){const a=t[r]*n,c=r<o-1?t[r+1]*n:i.length,l=Su(i,a,c,n,!1);l===l.next&&(l.steiner=!0),s.push(cp(l))}s.sort(ip);for(let r=0;r<s.length;r++)e=sp(s[r],e);return e}function ip(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function sp(i,t){const e=rp(i,t);if(!e)return t;const n=wu(e,i);return zi(n,n.next),zi(e,e.next)}function rp(i,t){let e=t;const n=i.x,s=i.y;let r=-1/0,o;if(vs(i,e))return e;do{if(vs(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){const d=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=n&&d>r&&(r=d,o=e.x<e.next.x?e:e.next,d===n))return o}e=e.next}while(e!==t);if(!o)return null;const a=o,c=o.x,l=o.y;let u=1/0;e=o;do{if(n>=e.x&&e.x>=c&&n!==e.x&&Eu(s<l?n:r,s,c,l,s<l?r:n,s,e.x,e.y)){const d=Math.abs(s-e.y)/(n-e.x);$s(e,i)&&(d<u||d===u&&(e.x>o.x||e.x===o.x&&op(o,e)))&&(o=e,u=d)}e=e.next}while(e!==a);return o}function op(i,t){return Be(i.prev,i,t.prev)<0&&Be(t.next,i,i.next)<0}function ap(i,t,e,n){let s=i;do s.z===0&&(s.z=Ja(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,lp(s)}function lp(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let o=n,a=0;for(let l=0;l<e&&(a++,o=o.nextZ,!!o);l++);let c=e;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,c--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,e*=2}while(t>1);return i}function Ja(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function cp(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Eu(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function Us(i,t,e,n,s,r,o,a){return!(i===o&&t===a)&&Eu(i,t,e,n,s,r,o,a)}function hp(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!up(i,t)&&($s(i,t)&&$s(t,i)&&fp(i,t)&&(Be(i.prev,i,t.prev)||Be(i,t.prev,t))||vs(i,t)&&Be(i.prev,i,i.next)>0&&Be(t.prev,t,t.next)>0)}function Be(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function vs(i,t){return i.x===t.x&&i.y===t.y}function bu(i,t,e,n){const s=Pr(Be(i,t,e)),r=Pr(Be(i,t,n)),o=Pr(Be(e,n,i)),a=Pr(Be(e,n,t));return!!(s!==r&&o!==a||s===0&&Cr(i,e,t)||r===0&&Cr(i,n,t)||o===0&&Cr(e,i,n)||a===0&&Cr(e,t,n))}function Cr(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Pr(i){return i>0?1:i<0?-1:0}function up(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&bu(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function $s(i,t){return Be(i.prev,i,i.next)<0?Be(i,t,i.next)>=0&&Be(i,i.prev,t)>=0:Be(i,t,i.prev)<0||Be(i,i.next,t)<0}function fp(i,t){let e=i,n=!1;const s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function wu(i,t){const e=$a(i.i,i.x,i.y),n=$a(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Uc(i,t,e,n){const s=$a(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Qs(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function $a(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function dp(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}class pp{static triangulate(t,e,n=2){return $d(t,e,n)}}class ai{static area(t){const e=t.length;let n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return ai.area(t)<0}static triangulateShape(t,e){const n=[],s=[],r=[];Oc(t),Fc(n,t);let o=t.length;e.forEach(Oc);for(let c=0;c<e.length;c++)s.push(o),o+=e[c].length,Fc(n,e[c]);const a=pp.triangulate(n,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}}function Oc(i){const t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function Fc(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}class Dl extends De{constructor(t=new yu([new ft(.5,.5),new ft(-.5,.5),new ft(-.5,-.5),new ft(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,s=[],r=[];for(let a=0,c=t.length;a<c;a++){const l=t[a];o(l)}this.setAttribute("position",new ue(s,3)),this.setAttribute("uv",new ue(r,2)),this.computeVertexNormals();function o(a){const c=[],l=e.curveSegments!==void 0?e.curveSegments:12,u=e.steps!==void 0?e.steps:1,d=e.depth!==void 0?e.depth:1;let f=e.bevelEnabled!==void 0?e.bevelEnabled:!0,h=e.bevelThickness!==void 0?e.bevelThickness:.2,p=e.bevelSize!==void 0?e.bevelSize:h-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3;const g=e.extrudePath,x=e.UVGenerator!==void 0?e.UVGenerator:mp;let y,v=!1,T,A,M,E;if(g){y=g.getSpacedPoints(u),v=!0,f=!1;const $=g.isCatmullRomCurve3?g.closed:!1;T=g.computeFrenetFrames(u,$),A=new b,M=new b,E=new b}f||(m=0,h=0,p=0,_=0);const I=a.extractPoints(l);let P=I.shape;const C=I.holes;if(!ai.isClockWise(P)){P=P.reverse();for(let $=0,ht=C.length;$<ht;$++){const ut=C[$];ai.isClockWise(ut)&&(C[$]=ut.reverse())}}function B($){const ut=10000000000000001e-36;let bt=$[0];for(let yt=1;yt<=$.length;yt++){const Jt=yt%$.length,Bt=$[Jt],he=Bt.x-bt.x,fe=Bt.y-bt.y,xe=he*he+fe*fe,D=Math.max(Math.abs(Bt.x),Math.abs(Bt.y),Math.abs(bt.x),Math.abs(bt.y)),ct=ut*D*D;if(xe<=ct){$.splice(Jt,1),yt--;continue}bt=Bt}}B(P),C.forEach(B);const U=C.length,z=P;for(let $=0;$<U;$++){const ht=C[$];P=P.concat(ht)}function W($,ht,ut){return ht||ye("ExtrudeGeometry: vec does not exist"),$.clone().addScaledVector(ht,ut)}const X=P.length;function it($,ht,ut){let bt,yt,Jt;const Bt=$.x-ht.x,he=$.y-ht.y,fe=ut.x-$.x,xe=ut.y-$.y,D=Bt*Bt+he*he,ct=Bt*xe-he*fe;if(Math.abs(ct)>Number.EPSILON){const vt=Math.sqrt(D),Xt=Math.sqrt(fe*fe+xe*xe),rt=ht.x-he/vt,$t=ht.y+Bt/vt,Tt=ut.x-xe/Xt,Rt=ut.y+fe/Xt,R=((Tt-rt)*xe-(Rt-$t)*fe)/(Bt*xe-he*fe);bt=rt+Bt*R-$.x,yt=$t+he*R-$.y;const S=bt*bt+yt*yt;if(S<=2)return new ft(bt,yt);Jt=Math.sqrt(S/2)}else{let vt=!1;Bt>Number.EPSILON?fe>Number.EPSILON&&(vt=!0):Bt<-Number.EPSILON?fe<-Number.EPSILON&&(vt=!0):Math.sign(he)===Math.sign(xe)&&(vt=!0),vt?(bt=-he,yt=Bt,Jt=Math.sqrt(D)):(bt=Bt,yt=he,Jt=Math.sqrt(D/2))}return new ft(bt/Jt,yt/Jt)}const L=[];for(let $=0,ht=z.length,ut=ht-1,bt=$+1;$<ht;$++,ut++,bt++)ut===ht&&(ut=0),bt===ht&&(bt=0),L[$]=it(z[$],z[ut],z[bt]);const H=[];let k,at=L.concat();for(let $=0,ht=U;$<ht;$++){const ut=C[$];k=[];for(let bt=0,yt=ut.length,Jt=yt-1,Bt=bt+1;bt<yt;bt++,Jt++,Bt++)Jt===yt&&(Jt=0),Bt===yt&&(Bt=0),k[bt]=it(ut[bt],ut[Jt],ut[Bt]);H.push(k),at=at.concat(k)}let mt;if(m===0)mt=ai.triangulateShape(z,C);else{const $=[],ht=[];for(let ut=0;ut<m;ut++){const bt=ut/m,yt=h*Math.cos(bt*Math.PI/2),Jt=p*Math.sin(bt*Math.PI/2)+_;for(let Bt=0,he=z.length;Bt<he;Bt++){const fe=W(z[Bt],L[Bt],Jt);Ut(fe.x,fe.y,-yt),bt===0&&$.push(fe)}for(let Bt=0,he=U;Bt<he;Bt++){const fe=C[Bt];k=H[Bt];const xe=[];for(let D=0,ct=fe.length;D<ct;D++){const vt=W(fe[D],k[D],Jt);Ut(vt.x,vt.y,-yt),bt===0&&xe.push(vt)}bt===0&&ht.push(xe)}}mt=ai.triangulateShape($,ht)}const V=mt.length,nt=p+_;for(let $=0;$<X;$++){const ht=f?W(P[$],at[$],nt):P[$];v?(M.copy(T.normals[0]).multiplyScalar(ht.x),A.copy(T.binormals[0]).multiplyScalar(ht.y),E.copy(y[0]).add(M).add(A),Ut(E.x,E.y,E.z)):Ut(ht.x,ht.y,0)}for(let $=1;$<=u;$++)for(let ht=0;ht<X;ht++){const ut=f?W(P[ht],at[ht],nt):P[ht];v?(M.copy(T.normals[$]).multiplyScalar(ut.x),A.copy(T.binormals[$]).multiplyScalar(ut.y),E.copy(y[$]).add(M).add(A),Ut(E.x,E.y,E.z)):Ut(ut.x,ut.y,d/u*$)}for(let $=m-1;$>=0;$--){const ht=$/m,ut=h*Math.cos(ht*Math.PI/2),bt=p*Math.sin(ht*Math.PI/2)+_;for(let yt=0,Jt=z.length;yt<Jt;yt++){const Bt=W(z[yt],L[yt],bt);Ut(Bt.x,Bt.y,d+ut)}for(let yt=0,Jt=C.length;yt<Jt;yt++){const Bt=C[yt];k=H[yt];for(let he=0,fe=Bt.length;he<fe;he++){const xe=W(Bt[he],k[he],bt);v?Ut(xe.x,xe.y+y[u-1].y,y[u-1].x+ut):Ut(xe.x,xe.y,d+ut)}}}Et(),Pt();function Et(){const $=s.length/3;if(f){let ht=0,ut=X*ht;for(let bt=0;bt<V;bt++){const yt=mt[bt];qt(yt[2]+ut,yt[1]+ut,yt[0]+ut)}ht=u+m*2,ut=X*ht;for(let bt=0;bt<V;bt++){const yt=mt[bt];qt(yt[0]+ut,yt[1]+ut,yt[2]+ut)}}else{for(let ht=0;ht<V;ht++){const ut=mt[ht];qt(ut[2],ut[1],ut[0])}for(let ht=0;ht<V;ht++){const ut=mt[ht];qt(ut[0]+X*u,ut[1]+X*u,ut[2]+X*u)}}n.addGroup($,s.length/3-$,0)}function Pt(){const $=s.length/3;let ht=0;Mt(z,ht),ht+=z.length;for(let ut=0,bt=C.length;ut<bt;ut++){const yt=C[ut];Mt(yt,ht),ht+=yt.length}n.addGroup($,s.length/3-$,1)}function Mt($,ht){let ut=$.length;for(;--ut>=0;){const bt=ut;let yt=ut-1;yt<0&&(yt=$.length-1);for(let Jt=0,Bt=u+m*2;Jt<Bt;Jt++){const he=X*Jt,fe=X*(Jt+1),xe=ht+bt+he,D=ht+yt+he,ct=ht+yt+fe,vt=ht+bt+fe;Ot(xe,D,ct,vt)}}}function Ut($,ht,ut){c.push($),c.push(ht),c.push(ut)}function qt($,ht,ut){Zt($),Zt(ht),Zt(ut);const bt=s.length/3,yt=x.generateTopUV(n,s,bt-3,bt-2,bt-1);Qt(yt[0]),Qt(yt[1]),Qt(yt[2])}function Ot($,ht,ut,bt){Zt($),Zt(ht),Zt(bt),Zt(ht),Zt(ut),Zt(bt);const yt=s.length/3,Jt=x.generateSideWallUV(n,s,yt-6,yt-3,yt-2,yt-1);Qt(Jt[0]),Qt(Jt[1]),Qt(Jt[3]),Qt(Jt[1]),Qt(Jt[2]),Qt(Jt[3])}function Zt($){s.push(c[$*3+0]),s.push(c[$*3+1]),s.push(c[$*3+2])}function Qt($){r.push($.x),r.push($.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return gp(e,n,t)}static fromJSON(t,e){const n=[];for(let r=0,o=t.shapes.length;r<o;r++){const a=e[t.shapes[r]];n.push(a)}const s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new Ka[s.type]().fromJSON(s)),new Dl(n,t.options)}}const mp={generateTopUV:function(i,t,e,n,s){const r=t[e*3],o=t[e*3+1],a=t[n*3],c=t[n*3+1],l=t[s*3],u=t[s*3+1];return[new ft(r,o),new ft(a,c),new ft(l,u)]},generateSideWallUV:function(i,t,e,n,s,r){const o=t[e*3],a=t[e*3+1],c=t[e*3+2],l=t[n*3],u=t[n*3+1],d=t[n*3+2],f=t[s*3],h=t[s*3+1],p=t[s*3+2],_=t[r*3],m=t[r*3+1],g=t[r*3+2];return Math.abs(a-u)<Math.abs(o-l)?[new ft(o,1-c),new ft(l,1-d),new ft(f,1-p),new ft(_,1-g)]:[new ft(a,1-c),new ft(u,1-d),new ft(h,1-p),new ft(m,1-g)]}};function gp(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class Il extends nr{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Il(t.radius,t.detail)}}class mo extends De{constructor(t=[new ft(0,-.5),new ft(.5,0),new ft(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=pe(s,0,Math.PI*2);const r=[],o=[],a=[],c=[],l=[],u=1/e,d=new b,f=new ft,h=new b,p=new b,_=new b;let m=0,g=0;for(let x=0;x<=t.length-1;x++)switch(x){case 0:m=t[x+1].x-t[x].x,g=t[x+1].y-t[x].y,h.x=g*1,h.y=-m,h.z=g*0,_.copy(h),h.normalize(),c.push(h.x,h.y,h.z);break;case t.length-1:_.normalize(),c.push(_.x,_.y,_.z);break;default:m=t[x+1].x-t[x].x,g=t[x+1].y-t[x].y,h.x=g*1,h.y=-m,h.z=g*0,p.copy(h),h.x+=_.x,h.y+=_.y,h.z+=_.z,h.normalize(),c.push(h.x,h.y,h.z),_.copy(p)}for(let x=0;x<=e;x++){const y=n+x*u*s,v=Math.sin(y),T=Math.cos(y);for(let A=0;A<=t.length-1;A++){d.x=t[A].x*v,d.y=t[A].y,d.z=t[A].x*T,o.push(d.x,d.y,d.z),f.x=x/e,f.y=A/(t.length-1),a.push(f.x,f.y);const M=c[3*A+0]*v,E=c[3*A+1],I=c[3*A+0]*T;l.push(M,E,I)}}for(let x=0;x<e;x++)for(let y=0;y<t.length-1;y++){const v=y+x*t.length,T=v,A=v+t.length,M=v+t.length+1,E=v+1;r.push(T,A,E),r.push(M,E,A)}this.setIndex(r),this.setAttribute("position",new ue(o,3)),this.setAttribute("uv",new ue(a,2)),this.setAttribute("normal",new ue(l,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new mo(t.points,t.segments,t.phiStart,t.phiLength)}}class Nl extends nr{constructor(t=1,e=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Nl(t.radius,t.detail)}}class go extends De{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(n),c=Math.floor(s),l=a+1,u=c+1,d=t/a,f=e/c,h=[],p=[],_=[],m=[];for(let g=0;g<u;g++){const x=g*f-o;for(let y=0;y<l;y++){const v=y*d-r;p.push(v,-x,0),_.push(0,0,1),m.push(y/a),m.push(1-g/c)}}for(let g=0;g<c;g++)for(let x=0;x<a;x++){const y=x+l*g,v=x+l*(g+1),T=x+1+l*(g+1),A=x+1+l*g;h.push(y,v,A),h.push(v,T,A)}this.setIndex(h),this.setAttribute("position",new ue(p,3)),this.setAttribute("normal",new ue(_,3)),this.setAttribute("uv",new ue(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new go(t.width,t.height,t.widthSegments,t.heightSegments)}}class Ul extends De{constructor(t=.5,e=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],c=[],l=[],u=[];let d=t;const f=(e-t)/s,h=new b,p=new ft;for(let _=0;_<=s;_++){for(let m=0;m<=n;m++){const g=r+m/n*o;h.x=d*Math.cos(g),h.y=d*Math.sin(g),c.push(h.x,h.y,h.z),l.push(0,0,1),p.x=(h.x/e+1)/2,p.y=(h.y/e+1)/2,u.push(p.x,p.y)}d+=f}for(let _=0;_<s;_++){const m=_*(n+1);for(let g=0;g<n;g++){const x=g+m,y=x,v=x+n+1,T=x+n+2,A=x+1;a.push(y,v,A),a.push(v,T,A)}}this.setIndex(a),this.setAttribute("position",new ue(c,3)),this.setAttribute("normal",new ue(l,3)),this.setAttribute("uv",new ue(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ul(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class Wn extends De{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const c=Math.min(o+a,Math.PI);let l=0;const u=[],d=new b,f=new b,h=[],p=[],_=[],m=[];for(let g=0;g<=n;g++){const x=[],y=g/n,v=o+y*a,T=t*Math.cos(v),A=Math.sqrt(t*t-T*T);let M=0;g===0&&o===0?M=.5/e:g===n&&c===Math.PI&&(M=-.5/e);for(let E=0;E<=e;E++){const I=E/e,P=s+I*r;d.x=-A*Math.cos(P),d.y=T,d.z=A*Math.sin(P),p.push(d.x,d.y,d.z),f.copy(d).normalize(),_.push(f.x,f.y,f.z),m.push(I+M,1-y),x.push(l++)}u.push(x)}for(let g=0;g<n;g++)for(let x=0;x<e;x++){const y=u[g][x+1],v=u[g][x],T=u[g+1][x],A=u[g+1][x+1];(g!==0||o>0)&&h.push(y,v,A),(g!==n-1||c<Math.PI)&&h.push(v,T,A)}this.setIndex(h),this.setAttribute("position",new ue(p,3)),this.setAttribute("normal",new ue(_,3)),this.setAttribute("uv",new ue(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Wn(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Ol extends nr{constructor(t=1,e=0){const n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],s=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,s,t,e),this.type="TetrahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Ol(t.radius,t.detail)}}class li extends De{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),s=Math.floor(s);const c=[],l=[],u=[],d=[],f=new b,h=new b,p=new b;for(let _=0;_<=n;_++){const m=o+_/n*a;for(let g=0;g<=s;g++){const x=g/s*r;h.x=(t+e*Math.cos(m))*Math.cos(x),h.y=(t+e*Math.cos(m))*Math.sin(x),h.z=e*Math.sin(m),l.push(h.x,h.y,h.z),f.x=t*Math.cos(x),f.y=t*Math.sin(x),p.subVectors(h,f).normalize(),u.push(p.x,p.y,p.z),d.push(g/s),d.push(_/n)}}for(let _=1;_<=n;_++)for(let m=1;m<=s;m++){const g=(s+1)*_+m-1,x=(s+1)*(_-1)+m-1,y=(s+1)*(_-1)+m,v=(s+1)*_+m;c.push(g,x,v),c.push(x,y,v)}this.setIndex(c),this.setAttribute("position",new ue(l,3)),this.setAttribute("normal",new ue(u,3)),this.setAttribute("uv",new ue(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new li(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}}function Ms(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];if(zc(s))s.isRenderTargetTexture?(te("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(zc(s[0])){const r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function hn(i){const t={};for(let e=0;e<i.length;e++){const n=Ms(i[e]);for(const s in n)t[s]=n[s]}return t}function zc(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function _p(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Tu(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ve.workingColorSpace}const xp={clone:Ms,merge:hn};var vp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Mp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Bi extends Vi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=vp,this.fragmentShader=Mp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ms(t.uniforms),this.uniformsGroups=_p(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(const n in t.uniforms){const s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new se().setHex(s.value);break;case"v2":this.uniforms[n].value=new ft().fromArray(s.value);break;case"v3":this.uniforms[n].value=new b().fromArray(s.value);break;case"v4":this.uniforms[n].value=new ze().fromArray(s.value);break;case"m3":this.uniforms[n].value=new oe().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Yt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(const n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}}class yp extends Bi{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class ps extends Vi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new se(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=$r,this.normalScale=new ft(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ke,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Sp extends ps{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ft(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return pe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new se(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new se(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new se(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(t){this._diffuseRoughness>0!=t>0&&this.version++,this._diffuseRoughness=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}get iridescenceThicknessRange(){return fs('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(t){fs('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=t[0],this.iridescenceThicknessMaximum=t[1]}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.diffuseRoughness=t.diffuseRoughness,this.diffuseRoughnessMap=t.diffuseRoughnessMap,this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum,this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class Ep extends Vi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=$r,this.normalScale=new ft(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ke,this.combine=pl,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class bp extends Vi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=$f,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class wp extends Vi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class Fl extends Ge{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new se(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}}class Tp extends Fl{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ge.DEFAULT_UP),this.updateMatrix(),this.groundColor=new se(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){const e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}}const $o=new Yt,Bc=new b,Hc=new b;class Au{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ft(512,512),this.mapType=yn,this.map=null,this.mapPass=null,this.matrix=new Yt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ks,this._frameExtents=new ft(1,1),this._viewportCount=1,this._viewports=[new ze(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera;Bc.setFromMatrixPosition(t.matrixWorld),e.position.copy(Bc),Hc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Hc),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){$o.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix($o,t.coordinateSystem,t.reversedDepth);const r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,c=s?s.x/r.x:0,l=s?s.y/r.y:0;t.coordinateSystem===Zs||t.reversedDepth?e.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,.5,.5,0,0,0,1),e.multiply($o)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Lr=new b,Dr=new Ne,Fn=new b;class Ru extends Ge{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Yt,this.projectionMatrix=new Yt,this.projectionMatrixInverse=new Yt,this.coordinateSystem=Nn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Lr,Dr,Fn),Fn.x===1&&Fn.y===1&&Fn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lr,Dr,Fn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Lr,Dr,Fn),Fn.x===1&&Fn.y===1&&Fn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lr,Dr,Fn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const xi=new b,kc=new ft,Gc=new ft;class Mn extends Ru{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Za*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Vr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Za*2*Math.atan(Math.tan(Vr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){xi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(xi.x,xi.y).multiplyScalar(-t/xi.z),xi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(xi.x,xi.y).multiplyScalar(-t/xi.z)}getViewSize(t,e){return this.getViewBounds(t,kc,Gc),e.subVectors(Gc,kc)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Vr*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,e-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}class Ap extends Au{constructor(){super(new Mn(90,1,.5,500)),this.isPointLightShadow=!0}}class Rp extends Fl{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Ap}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){const e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}}class Cu extends Ru{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=s+e,c=s-e;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class Cp extends Au{constructor(){super(new Cu(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Pp extends Fl{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ge.DEFAULT_UP),this.updateMatrix(),this.target=new Ge,this.shadow=new Cp}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){const e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}}const es=-90,ns=1;class Qa extends Ge{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Mn(es,ns,t,e);s.layers=this.layers,this.add(s);const r=new Mn(es,ns,t,e);r.layers=this.layers,this.add(r);const o=new Mn(es,ns,t,e);o.layers=this.layers,this.add(o);const a=new Mn(es,ns,t,e);a.layers=this.layers,this.add(a);const c=new Mn(es,ns,t,e);c.layers=this.layers,this.add(c);const l=new Mn(es,ns,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,c]=e;for(const l of e)this.remove(l);if(t===Nn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Zs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,l,u]=this.children,d=t.getRenderTarget(),f=t.getActiveCubeFace(),h=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),n.texture.mipmapsAutoUpdate=_,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(d,f,h),t.xr.enabled=p,n.texture.needsPMREMUpdate=!0}}class Lp extends Mn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}}const Vc=new Yt;class io{constructor(t,e,n=0,s=1/0){this.ray=new er(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new wl,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):ye("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Vc.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Vc),this}intersectObject(t,e=!0,n=[]){return ja(t,this,n,e),n.sort(Wc),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)ja(t[s],this,n,e);return n.sort(Wc),n}}function Wc(i,t){return i.distance-t.distance}function ja(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)ja(r[o],t,e,!0)}}class Xc{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=pe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(pe(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class Dp extends wi{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}}function Yc(i,t,e,n){const s=Ip(n);switch(e){case nu:return i*t;case vl:return i*t/s.components*s.byteLength;case Ml:return i*t/s.components*s.byteLength;case Fi:return i*t*2/s.components*s.byteLength;case yl:return i*t*2/s.components*s.byteLength;case iu:return i*t*3/s.components*s.byteLength;case Gn:return i*t*4/s.components*s.byteLength;case Sl:return i*t*4/s.components*s.byteLength;case Br:case Hr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case kr:case Gr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case va:case ya:return Math.max(i,16)*Math.max(t,8)/4;case xa:case Ma:return Math.max(i,8)*Math.max(t,8)/2;case Sa:case Ea:case wa:case Ta:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case ba:case Kr:case Aa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ra:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ca:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Pa:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case La:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Da:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Ia:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Na:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Ua:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Oa:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Fa:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case za:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Ba:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Ha:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case ka:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Ga:case Va:case Wa:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Xa:case Ya:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Jr:case qa:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Ip(i){switch(i){case yn:case Qh:return{byteLength:1,components:1};case qs:case jh:case Zn:return{byteLength:2,components:1};case _l:case xl:return{byteLength:2,components:4};case qn:case gl:case In:return{byteLength:4,components:1};case tu:case eu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:dl}}));typeof window<"u"&&(window.__THREE__?te("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=dl);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Pu(){let i=null,t=!1,e=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),e(r,o)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Np(i){const t=new WeakMap;function e(a,c){const l=a.array,u=a.usage,d=l.byteLength,f=i.createBuffer();i.bindBuffer(c,f),i.bufferData(c,l,u),a.onUploadCallback();let h;if(l instanceof Float32Array)h=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)h=i.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?h=i.HALF_FLOAT:h=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)h=i.SHORT;else if(l instanceof Uint32Array)h=i.UNSIGNED_INT;else if(l instanceof Int32Array)h=i.INT;else if(l instanceof Int8Array)h=i.BYTE;else if(l instanceof Uint8Array)h=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)h=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:h,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,c,l){const u=c.array,d=c.updateRanges;if(i.bindBuffer(l,a),d.length===0)i.bufferSubData(l,0,u);else{d.sort((h,p)=>h.start-p.start);let f=0;for(let h=1;h<d.length;h++){const p=d[f],_=d[h];_.start<=p.start+p.count+1?p.count=Math.max(p.count,_.start+_.count-p.start):(++f,d[f]=_)}d.length=f+1;for(let h=0,p=d.length;h<p;h++){const _=d[h];i.bufferSubData(l,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=t.get(a);c&&(i.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=t.get(a);(!u||u.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var Up=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Op=`#ifdef USE_ALPHAHASH
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
#endif`,Fp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,zp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Bp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Hp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,kp=`#ifdef USE_AOMAP
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
#endif`,Gp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Vp=`#ifdef USE_BATCHING
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
#endif`,Wp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Xp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Yp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,qp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Zp=`#ifdef USE_IRIDESCENCE
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
#endif`,Kp=`#ifdef USE_BUMPMAP
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
#endif`,Jp=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,$p=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Qp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,jp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,tm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,em=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,nm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,im=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,sm=`#define PI 3.141592653589793
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
} // validated`,rm=`vec3 transformedNormal = objectNormal;
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
#endif`,om=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,am=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,lm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,cm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,hm="gl_FragColor = linearToOutputTexel( gl_FragColor );",um=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,fm=`#ifdef USE_ENVMAP
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
#endif`,dm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,pm=`#ifdef USE_ENVMAP
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
#endif`,mm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,gm=`#ifdef USE_ENVMAP
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
#endif`,_m=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,xm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,vm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Mm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ym=`#ifdef USE_GRADIENTMAP
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
}`,Sm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Em=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,bm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,wm=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Tm=`#ifdef USE_ENVMAP
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
#endif`,Am=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Rm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Cm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Pm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Lm=`PhysicalMaterial material;
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
#endif`,Dm=`uniform sampler2D dfgLUT;
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
}`,Im=`
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
#endif`,Nm=`#if defined( RE_IndirectDiffuse )
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
#endif`,Um=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Om=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,Fm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,zm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Bm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Hm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,km=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Gm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Vm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Wm=`#if defined( USE_POINTS_UV )
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
#endif`,Xm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ym=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,qm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Zm=`#if defined( USE_MORPHCOLORS )
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
#endif`,Km=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jm=`#ifdef USE_MORPHTARGETS
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
#endif`,$m=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Qm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,jm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,t0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,e0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,n0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,i0=`#ifdef USE_NORMALMAP
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
#endif`,s0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,r0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,o0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,a0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,l0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,c0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,h0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,u0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,f0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,d0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,p0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,m0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,g0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,_0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,x0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,v0=`float getShadowMask() {
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
}`,M0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,y0=`#ifdef USE_SKINNING
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
#endif`,S0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,E0=`#ifdef USE_SKINNING
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
#endif`,b0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,w0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,T0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,A0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,R0=`#ifdef USE_TRANSMISSION
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
#endif`,C0=`#ifdef USE_TRANSMISSION
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
#endif`,P0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,L0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,D0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,I0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const N0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,U0=`uniform sampler2D t2D;
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
}`,O0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,F0=`uniform float backgroundBlurriness;
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
}`,z0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,B0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,H0=`#include <common>
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
}`,k0=`#if DEPTH_PACKING == 3200
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
}`,G0=`#define DISTANCE
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
}`,V0=`#define DISTANCE
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
}`,W0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,X0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Y0=`uniform float scale;
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
}`,q0=`uniform vec3 diffuse;
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
}`,Z0=`#include <common>
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
}`,K0=`uniform vec3 diffuse;
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
}`,J0=`#define LAMBERT
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
}`,$0=`#define LAMBERT
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
}`,Q0=`#define MATCAP
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
}`,j0=`#define MATCAP
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
}`,tg=`#define NORMAL
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
}`,eg=`#define NORMAL
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
}`,ng=`#define PHONG
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
}`,ig=`#define PHONG
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
}`,sg=`#define STANDARD
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
}`,rg=`#define STANDARD
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
}`,og=`#define TOON
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
}`,ag=`#define TOON
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
}`,lg=`uniform float size;
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
}`,cg=`uniform vec3 diffuse;
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
}`,hg=`#include <common>
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
}`,ug=`uniform vec3 color;
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
}`,fg=`uniform float rotation;
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
}`,dg=`uniform vec3 diffuse;
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
}`,ge={alphahash_fragment:Up,alphahash_pars_fragment:Op,alphamap_fragment:Fp,alphamap_pars_fragment:zp,alphatest_fragment:Bp,alphatest_pars_fragment:Hp,aomap_fragment:kp,aomap_pars_fragment:Gp,batching_pars_vertex:Vp,batching_vertex:Wp,begin_vertex:Xp,beginnormal_vertex:Yp,bsdfs:qp,iridescence_fragment:Zp,bumpmap_pars_fragment:Kp,clipping_planes_fragment:Jp,clipping_planes_pars_fragment:$p,clipping_planes_pars_vertex:Qp,clipping_planes_vertex:jp,color_fragment:tm,color_pars_fragment:em,color_pars_vertex:nm,color_vertex:im,common:sm,defaultnormal_vertex:rm,displacementmap_pars_vertex:om,displacementmap_vertex:am,emissivemap_fragment:lm,emissivemap_pars_fragment:cm,colorspace_fragment:hm,colorspace_pars_fragment:um,envmap_fragment:fm,envmap_common_pars_fragment:dm,envmap_pars_fragment:pm,envmap_pars_vertex:mm,envmap_physical_pars_fragment:Tm,envmap_vertex:gm,fog_vertex:_m,fog_pars_vertex:xm,fog_fragment:vm,fog_pars_fragment:Mm,gradientmap_pars_fragment:ym,lightmap_pars_fragment:Sm,lights_lambert_fragment:Em,lights_lambert_pars_fragment:bm,lights_pars_begin:wm,lights_toon_fragment:Am,lights_toon_pars_fragment:Rm,lights_phong_fragment:Cm,lights_phong_pars_fragment:Pm,lights_physical_fragment:Lm,lights_physical_pars_fragment:Dm,lights_fragment_begin:Im,lights_fragment_maps:Nm,lights_fragment_end:Um,lightprobes_pars_fragment:Om,logdepthbuf_fragment:Fm,logdepthbuf_pars_fragment:zm,logdepthbuf_pars_vertex:Bm,logdepthbuf_vertex:Hm,map_fragment:km,map_pars_fragment:Gm,map_particle_fragment:Vm,map_particle_pars_fragment:Wm,metalnessmap_fragment:Xm,metalnessmap_pars_fragment:Ym,morphinstance_vertex:qm,morphcolor_vertex:Zm,morphnormal_vertex:Km,morphtarget_pars_vertex:Jm,morphtarget_vertex:$m,normal_fragment_begin:Qm,normal_fragment_maps:jm,normal_pars_fragment:t0,normal_pars_vertex:e0,normal_vertex:n0,normalmap_pars_fragment:i0,clearcoat_normal_fragment_begin:s0,clearcoat_normal_fragment_maps:r0,clearcoat_pars_fragment:o0,iridescence_pars_fragment:a0,opaque_fragment:l0,packing:c0,premultiplied_alpha_fragment:h0,project_vertex:u0,dithering_fragment:f0,dithering_pars_fragment:d0,roughnessmap_fragment:p0,roughnessmap_pars_fragment:m0,shadowmap_pars_fragment:g0,shadowmap_pars_vertex:_0,shadowmap_vertex:x0,shadowmask_pars_fragment:v0,skinbase_vertex:M0,skinning_pars_vertex:y0,skinning_vertex:S0,skinnormal_vertex:E0,specularmap_fragment:b0,specularmap_pars_fragment:w0,tonemapping_fragment:T0,tonemapping_pars_fragment:A0,transmission_fragment:R0,transmission_pars_fragment:C0,uv_pars_fragment:P0,uv_pars_vertex:L0,uv_vertex:D0,worldpos_vertex:I0,background_vert:N0,background_frag:U0,backgroundCube_vert:O0,backgroundCube_frag:F0,cube_vert:z0,cube_frag:B0,depth_vert:H0,depth_frag:k0,distance_vert:G0,distance_frag:V0,equirect_vert:W0,equirect_frag:X0,linedashed_vert:Y0,linedashed_frag:q0,meshbasic_vert:Z0,meshbasic_frag:K0,meshlambert_vert:J0,meshlambert_frag:$0,meshmatcap_vert:Q0,meshmatcap_frag:j0,meshnormal_vert:tg,meshnormal_frag:eg,meshphong_vert:ng,meshphong_frag:ig,meshphysical_vert:sg,meshphysical_frag:rg,meshtoon_vert:og,meshtoon_frag:ag,points_vert:lg,points_frag:cg,shadow_vert:hg,shadow_frag:ug,sprite_vert:fg,sprite_frag:dg},It={common:{diffuse:{value:new se(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new oe},alphaMap:{value:null},alphaMapTransform:{value:new oe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new oe}},envmap:{envMap:{value:null},envMapRotation:{value:new oe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new oe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new oe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new oe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new oe},normalScale:{value:new ft(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new oe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new oe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new oe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new oe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new se(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new se(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new oe},alphaTest:{value:0},uvTransform:{value:new oe}},sprite:{diffuse:{value:new se(16777215)},opacity:{value:1},center:{value:new ft(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new oe},alphaMap:{value:null},alphaMapTransform:{value:new oe},alphaTest:{value:0}}},kn={basic:{uniforms:hn([It.common,It.specularmap,It.envmap,It.aomap,It.lightmap,It.fog]),vertexShader:ge.meshbasic_vert,fragmentShader:ge.meshbasic_frag},lambert:{uniforms:hn([It.common,It.specularmap,It.envmap,It.aomap,It.lightmap,It.emissivemap,It.bumpmap,It.normalmap,It.displacementmap,It.fog,It.lights,{emissive:{value:new se(0)},envMapIntensity:{value:1}}]),vertexShader:ge.meshlambert_vert,fragmentShader:ge.meshlambert_frag},phong:{uniforms:hn([It.common,It.specularmap,It.envmap,It.aomap,It.lightmap,It.emissivemap,It.bumpmap,It.normalmap,It.displacementmap,It.fog,It.lights,{emissive:{value:new se(0)},specular:{value:new se(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ge.meshphong_vert,fragmentShader:ge.meshphong_frag},standard:{uniforms:hn([It.common,It.envmap,It.aomap,It.lightmap,It.emissivemap,It.bumpmap,It.normalmap,It.displacementmap,It.roughnessmap,It.metalnessmap,It.fog,It.lights,{emissive:{value:new se(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ge.meshphysical_vert,fragmentShader:ge.meshphysical_frag},toon:{uniforms:hn([It.common,It.aomap,It.lightmap,It.emissivemap,It.bumpmap,It.normalmap,It.displacementmap,It.gradientmap,It.fog,It.lights,{emissive:{value:new se(0)}}]),vertexShader:ge.meshtoon_vert,fragmentShader:ge.meshtoon_frag},matcap:{uniforms:hn([It.common,It.bumpmap,It.normalmap,It.displacementmap,It.fog,{matcap:{value:null}}]),vertexShader:ge.meshmatcap_vert,fragmentShader:ge.meshmatcap_frag},points:{uniforms:hn([It.points,It.fog]),vertexShader:ge.points_vert,fragmentShader:ge.points_frag},dashed:{uniforms:hn([It.common,It.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ge.linedashed_vert,fragmentShader:ge.linedashed_frag},depth:{uniforms:hn([It.common,It.displacementmap]),vertexShader:ge.depth_vert,fragmentShader:ge.depth_frag},normal:{uniforms:hn([It.common,It.bumpmap,It.normalmap,It.displacementmap,{opacity:{value:1}}]),vertexShader:ge.meshnormal_vert,fragmentShader:ge.meshnormal_frag},sprite:{uniforms:hn([It.sprite,It.fog]),vertexShader:ge.sprite_vert,fragmentShader:ge.sprite_frag},background:{uniforms:{uvTransform:{value:new oe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ge.background_vert,fragmentShader:ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new oe}},vertexShader:ge.backgroundCube_vert,fragmentShader:ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ge.cube_vert,fragmentShader:ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ge.equirect_vert,fragmentShader:ge.equirect_frag},distance:{uniforms:hn([It.common,It.displacementmap,{referencePosition:{value:new b},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ge.distance_vert,fragmentShader:ge.distance_frag},shadow:{uniforms:hn([It.lights,It.fog,{color:{value:new se(0)},opacity:{value:1}}]),vertexShader:ge.shadow_vert,fragmentShader:ge.shadow_frag}};kn.physical={uniforms:hn([kn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new oe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new oe},clearcoatNormalScale:{value:new ft(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new oe},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new oe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new oe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new oe},sheen:{value:0},sheenColor:{value:new se(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new oe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new oe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new oe},transmissionSamplerSize:{value:new ft},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new oe},attenuationDistance:{value:0},attenuationColor:{value:new se(0)},specularColor:{value:new se(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new oe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new oe},anisotropyVector:{value:new ft},anisotropyMap:{value:null},anisotropyMapTransform:{value:new oe}}]),vertexShader:ge.meshphysical_vert,fragmentShader:ge.meshphysical_frag};const Ir={r:0,b:0,g:0},pg=new Yt,Lu=new oe;Lu.set(-1,0,0,0,1,0,0,0,1);function mg(i,t,e,n,s,r){const o=new se(0);let a=s===!0?0:1,c,l,u=null,d=0,f=null;function h(x){let y=x.isScene===!0?x.background:null;if(y&&y.isTexture){const v=x.backgroundBlurriness>0;y=t.get(y,v)}return y}function p(x){let y=!1;const v=h(x);v===null?m(o,a):v&&v.isColor&&(m(v,1),y=!0);const T=i.xr.getEnvironmentBlendMode();T==="additive"?e.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||y)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function _(x,y){const v=h(y);v&&v.isCubeTexture?(l===void 0&&(l=new Te(new Kn(1,1,1),new Bi({name:"BackgroundCubeMaterial",uniforms:Ms(kn.backgroundCube.uniforms),vertexShader:kn.backgroundCube.vertexShader,fragmentShader:kn.backgroundCube.fragmentShader,side:fn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,A,M){this.matrixWorld.copyPosition(M.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=v,l.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(pg.makeRotationFromEuler(y.backgroundRotation)).transpose(),v.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Lu),l.material.toneMapped=ve.getTransfer(v.colorSpace)!==Re,(u!==v||d!==v.version||f!==i.toneMapping)&&(l.material.needsUpdate=!0,u=v,d=v.version,f=i.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new Te(new go(2,2),new Bi({name:"BackgroundMaterial",uniforms:Ms(kn.background.uniforms),vertexShader:kn.background.vertexShader,fragmentShader:kn.background.fragmentShader,side:Oi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=ve.getTransfer(v.colorSpace)!==Re,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||d!==v.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,u=v,d=v.version,f=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function m(x,y){x.getRGB(Ir,Tu(i)),e.buffers.color.setClear(Ir.r,Ir.g,Ir.b,y,r)}function g(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,y=1){o.set(x),a=y,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,m(o,a)},render:p,addToRenderList:_,dispose:g}}function gg(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,o=!1;function a(C,N,B,U,z){let W=!1;const X=d(C,U,B,N);r!==X&&(r=X,l(r.object)),W=h(C,U,B,z),W&&p(C,U,B,z),z!==null&&t.update(z,i.ELEMENT_ARRAY_BUFFER),(W||o)&&(o=!1,v(C,N,B,U),z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(z).buffer))}function c(){return i.createVertexArray()}function l(C){return i.bindVertexArray(C)}function u(C){return i.deleteVertexArray(C)}function d(C,N,B,U){const z=U.wireframe===!0;let W=n[N.id];W===void 0&&(W={},n[N.id]=W);const X=C.isInstancedMesh===!0?C.id:0;let it=W[X];it===void 0&&(it={},W[X]=it);let L=it[B.id];L===void 0&&(L={},it[B.id]=L);let H=L[z];return H===void 0&&(H=f(c()),L[z]=H),H}function f(C){const N=[],B=[],U=[];for(let z=0;z<e;z++)N[z]=0,B[z]=0,U[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:B,attributeDivisors:U,object:C,attributes:{},index:null}}function h(C,N,B,U){const z=r.attributes,W=N.attributes;let X=0;const it=B.getAttributes();for(const L in it)if(it[L].location>=0){const k=z[L];let at=W[L];if(at===void 0&&(L==="instanceMatrix"&&C.instanceMatrix&&(at=C.instanceMatrix),L==="instanceColor"&&C.instanceColor&&(at=C.instanceColor)),k===void 0||k.attribute!==at||at&&k.data!==at.data)return!0;X++}return r.attributesNum!==X||r.index!==U}function p(C,N,B,U){const z={},W=N.attributes;let X=0;const it=B.getAttributes();for(const L in it)if(it[L].location>=0){let k=W[L];k===void 0&&(L==="instanceMatrix"&&C.instanceMatrix&&(k=C.instanceMatrix),L==="instanceColor"&&C.instanceColor&&(k=C.instanceColor));const at={};at.attribute=k,k&&k.data&&(at.data=k.data),z[L]=at,X++}r.attributes=z,r.attributesNum=X,r.index=U}function _(){const C=r.newAttributes;for(let N=0,B=C.length;N<B;N++)C[N]=0}function m(C){g(C,0)}function g(C,N){const B=r.newAttributes,U=r.enabledAttributes,z=r.attributeDivisors;B[C]=1,U[C]===0&&(i.enableVertexAttribArray(C),U[C]=1),z[C]!==N&&(i.vertexAttribDivisor(C,N),z[C]=N)}function x(){const C=r.newAttributes,N=r.enabledAttributes;for(let B=0,U=N.length;B<U;B++)N[B]!==C[B]&&(i.disableVertexAttribArray(B),N[B]=0)}function y(C,N,B,U,z,W,X){X===!0?i.vertexAttribIPointer(C,N,B,z,W):i.vertexAttribPointer(C,N,B,U,z,W)}function v(C,N,B,U){_();const z=U.attributes,W=B.getAttributes(),X=N.defaultAttributeValues;for(const it in W){const L=W[it];if(L.location>=0){let H=z[it];if(H===void 0&&(it==="instanceMatrix"&&C.instanceMatrix&&(H=C.instanceMatrix),it==="instanceColor"&&C.instanceColor&&(H=C.instanceColor)),H!==void 0){const k=H.normalized,at=H.itemSize,mt=t.get(H);if(mt===void 0)continue;const V=mt.buffer,nt=mt.type,Et=mt.bytesPerElement,Pt=nt===i.INT||nt===i.UNSIGNED_INT||H.gpuType===gl;if(H.isInterleavedBufferAttribute){const Mt=H.data,Ut=Mt.isInterleavedBuffer===!0?Mt.stride:Mt.itemSize,qt=H.offset;if(Mt.isInstancedInterleavedBuffer||Mt.isInstancedBufferAttribute){for(let Ot=0;Ot<L.locationSize;Ot++)g(L.location+Ot,Mt.meshPerAttribute);C.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=Mt.meshPerAttribute*Mt.count)}else for(let Ot=0;Ot<L.locationSize;Ot++)m(L.location+Ot);i.bindBuffer(i.ARRAY_BUFFER,V);for(let Ot=0;Ot<L.locationSize;Ot++)y(L.location+Ot,at/L.locationSize,nt,k,Ut*Et,(qt+at/L.locationSize*Ot)*Et,Pt)}else{if(H.isInstancedBufferAttribute){for(let Mt=0;Mt<L.locationSize;Mt++)g(L.location+Mt,H.meshPerAttribute);C.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=H.meshPerAttribute*H.count)}else for(let Mt=0;Mt<L.locationSize;Mt++)m(L.location+Mt);i.bindBuffer(i.ARRAY_BUFFER,V);for(let Mt=0;Mt<L.locationSize;Mt++)y(L.location+Mt,at/L.locationSize,nt,k,at*Et,at/L.locationSize*Mt*Et,Pt)}}else if(X!==void 0){const k=X[it];if(k!==void 0)switch(k.length){case 2:i.vertexAttrib2fv(L.location,k);break;case 3:i.vertexAttrib3fv(L.location,k);break;case 4:i.vertexAttrib4fv(L.location,k);break;default:i.vertexAttrib1fv(L.location,k)}}}}x()}function T(){I();for(const C in n){const N=n[C];for(const B in N){const U=N[B];for(const z in U){const W=U[z];for(const X in W)u(W[X].object),delete W[X];delete U[z]}}delete n[C]}}function A(C){if(n[C.id]===void 0)return;const N=n[C.id];for(const B in N){const U=N[B];for(const z in U){const W=U[z];for(const X in W)u(W[X].object),delete W[X];delete U[z]}}delete n[C.id]}function M(C){for(const N in n){const B=n[N];for(const U in B){const z=B[U];if(z[C.id]===void 0)continue;const W=z[C.id];for(const X in W)u(W[X].object),delete W[X];delete z[C.id]}}}function E(C){for(const N in n){const B=n[N],U=C.isInstancedMesh===!0?C.id:0,z=B[U];if(z!==void 0){for(const W in z){const X=z[W];for(const it in X)u(X[it].object),delete X[it];delete z[W]}delete B[U],Object.keys(B).length===0&&delete n[N]}}}function I(){P(),o=!0,r!==s&&(r=s,l(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:I,resetDefaultState:P,dispose:T,releaseStatesOfGeometry:A,releaseStatesOfObject:E,releaseStatesOfProgram:M,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function _g(i,t,e){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),e.update(l,n,1)}function o(c,l,u){u!==0&&(i.drawArraysInstanced(n,c,l,u),e.update(l,n,u))}function a(c,l,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,u);let f=0;for(let h=0;h<u;h++)f+=l[h];e.update(f,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function xg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const M=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(M.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(M){return!(M!==Gn&&n.convert(M)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(M){const E=M===Zn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(M!==yn&&M!==In&&!E&&n.convert(M)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(M){if(M==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";M="mediump"}return M==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp";const u=c(l);u!==l&&(te("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);const d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),f=e.logarithmicDepthBuffer===!0&&d===!1;e.reversedDepthBuffer===!0&&d===!1&&te("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),e.logarithmicDepthBuffer===!0&&d===!0&&te("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const h=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),A=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:h,maxVertexTextures:p,maxTextureSize:_,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:x,maxVaryings:y,maxFragmentUniforms:v,maxSamples:T,samples:A}}function vg(i){const t=this;let e=null,n=0,s=!1,r=!1;const o=new Hn,a=new oe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,f){const h=d.length!==0||f||n!==0||s;return s=f,n=d.length,h},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,f){e=u(d,f,0)},this.setState=function(d,f,h){const p=d.clippingPlanes,_=d.clipIntersection,m=d.clipShadows,g=i.get(d);if(!s||p===null||p.length===0||r&&!m)r?u(null):l();else{const x=r?0:n,y=x*4;let v=g.clippingState||null;c.value=v,v=u(p,f,y,h);for(let T=0;T!==y;++T)v[T]=e[T];g.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(d,f,h,p){const _=d!==null?d.length:0;let m=null;if(_!==0){if(m=c.value,p!==!0||m===null){const g=h+_*4,x=f.matrixWorldInverse;a.getNormalMatrix(x),(m===null||m.length<g)&&(m=new Float32Array(g));for(let y=0,v=h;y!==_;++y,v+=4)o.copy(d[y]).applyMatrix4(x,a),o.normal.toArray(m,v),m[v+3]=o.constant}c.value=m,c.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}class zl extends Yn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new pu(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Kn(5,5,5),r=new Bi({name:"CubemapFromEquirect",uniforms:Ms(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:fn,blending:us});r.uniforms.tEquirect.value=e;const o=new Te(s,r),a=e.minFilter;return e.minFilter===Mi&&(e.minFilter=gn),new Qa(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}}const qc=256,Mg=3,yg=20,Du=256,Iu=16,Sg=3,Eg=new b,bg=new se;class js{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Qa(1,10,null),this._boxMesh=new Te(new Kn(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){const{size:o=256,position:a=Eg}=r,c=this._renderer;this._setSize(o);const l=this._allocateTarget(),u=this._getSourceTarget(!0);e>0&&(u.texture.mipmapsAutoUpdate=!1);const d=c.autoClear,f=c.autoClearColor,h=c.autoClearDepth,p=c.autoClearStencil,_=t.background;c.autoClear=!0,c.autoClearColor=!0,c.autoClearDepth=!0,c.autoClearStencil=!0,_===null&&(t.background=c.getClearColor(bg));const m=new Qa(n,s,u);return m.position.copy(a),m.update(c,t),c.autoClear=d,c.autoClearColor=f,c.autoClearDepth=h,c.autoClearStencil=p,t.background=_,e>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(l,e)),this._applyPMREM(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Jc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Kc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(qc,ud(t))}_fromTexture(t,e){t.mapping===gs||t.mapping===Ys?this._setSize(t.image.length===0?qc:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4);const n=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(n),n}_allocateTarget(){const t=this._cubeSize,e=Zc(t,!1,!1),n=Math.log2(t)-Mg;for(let s=0;s<=n;s++)e.texture.mipmaps.push({width:t>>s,height:t>>s});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){const e=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==e||t&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Zc(e,!0,t)),this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,n){const s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=t,r.activeMipmapLevel=e;const o=t.width>>e;t.viewport.set(0,0,o,o),r.update(this._renderer,s),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;t.mapping===gs||t.mapping===Ys?(this._cubemapMaterial===null&&(this._cubemapMaterial=Jc()),e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Kc()),e=this._equirectMaterial),e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=wg(),this._integrationMaterial=Tg());const e=this._cubeSize,n=t.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;const r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(e/Iu);for(let o=0;o<=n;o++){const a=js.lodToRoughness(o,n);if(o>n-Sg)r.roughness.value=a,this._renderCube(t,o,this._integrationMaterial);else{const c=a>0?Math.log2(e)+.5*Math.log2(6/(Du*Math.pow(a,4)))+.5:0;s.roughness.value=a,s.lodBias.value=c,this._renderCube(t,o,this._ggxMaterial)}}}_blur(t,e){this._blurMaterial===null&&(this._blurMaterial=Ag());const n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(t,0,n),s.envMap.value=t.texture,this._renderCube(r,0,n)}}function Zc(i,t,e){return new zl(i,{minFilter:Mi,generateMipmaps:t,type:Zn,colorSpace:Qr,depthBuffer:e})}function ir(i,t,e){return new Bi({name:i,uniforms:t,vertexShader:ge.cube_vert,fragmentShader:e,side:fn,blending:us,depthTest:!1,depthWrite:!1})}function wg(){return ir("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Du}u

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
	`)}function Tg(){return ir("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Iu}},`

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
	`)}function Ag(){return ir("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${yg}
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
	`)}function Kc(){return ir("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function Jc(){return ir("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Rg(i){let t=new WeakMap,e=new WeakMap,n=null;function s(f,h=!1){return f==null?null:h?o(f):r(f)}function r(f){if(f&&f.isTexture){const h=f.mapping;if(h===So||h===Eo)if(t.has(f)){const p=t.get(f).texture;return a(p,f.mapping)}else{const p=f.image;if(p&&p.height>0){const _=new zl(p.height);return _.fromEquirectangularTexture(i,f),t.set(f,_),f.addEventListener("dispose",l),a(_.texture,f.mapping)}else return null}}return f}function o(f){if(f&&f.isTexture&&f.isPMREMTexture!==!0){const h=f.mapping,p=h===So||h===Eo,_=h===gs||h===Ys;if(p||_){let m=e.get(f);const g=m!==void 0?m.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==g)return n===null&&(n=new js(i)),m=p?n.fromEquirectangular(f,m):n.fromCubemap(f,m),m.texture.pmremVersion=f.pmremVersion,e.set(f,m),m.texture;if(m!==void 0)return m.texture;{const x=f.image;return p&&x&&x.height>0||_&&x&&c(x)?(n===null&&(n=new js(i)),m=p?n.fromEquirectangular(f):n.fromCubemap(f),m.texture.pmremVersion=f.pmremVersion,e.set(f,m),f.addEventListener("dispose",u),m.texture):null}}}return f}function a(f,h){return h===So?f.mapping=gs:h===Eo&&(f.mapping=Ys),f}function c(f){let h=0;const p=6;for(let _=0;_<p;_++)f[_]!==void 0&&h++;return h===p}function l(f){const h=f.target;h.removeEventListener("dispose",l);const p=t.get(h);p!==void 0&&(t.delete(h),p.dispose())}function u(f){const h=f.target;h.removeEventListener("dispose",u);const p=e.get(h);p!==void 0&&(e.delete(h),p.dispose())}function d(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function Cg(i){const t={};function e(n){if(t[n]!==void 0)return t[n];const s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&fs("WebGLRenderer: "+n+" extension not supported."),s}}}function Pg(i,t,e,n){const s={},r=new WeakMap,o=new FinalizationRegistry(p=>delete s[p]);function a(p){c(p.target)}function c(p){p.index!==null&&t.remove(p.index);for(const m in p.attributes)t.remove(p.attributes[m]);p.removeEventListener("dispose",a),delete s[p.id],o.unregister(p);const _=r.get(p);_&&(t.remove(_),r.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,e.memory.geometries--}function l(p,_){return s[_.id]!==void 0||(_.addEventListener("dispose",a),s[_.id]=new WeakRef(_),o.register(_,_.id,_),e.memory.geometries++),_}function u(p){const _=p.attributes;for(const m in _)t.update(_[m],i.ARRAY_BUFFER)}function d(p){const _=p.index,m=p.attributes.position;let g=0;if(m===void 0)return;const x=_!==null?_.array.length:m.array.length/3-1,y=m.count>=65535?fu:uu,v=new y(Math.ceil(x/3)*6,1),T=v.array;if(_!==null){const M=_.array;g=_.version;for(let E=0,I=0;E<x;E+=3){const P=M[E+0],C=M[E+1],N=M[E+2];T[I++]=P,T[I++]=C,T[I++]=C,T[I++]=N,T[I++]=N,T[I++]=P}}else{g=m.version;for(let M=0,E=0;M<x;M+=3){const I=M+0,P=M+1,C=M+2;T[E++]=I,T[E++]=P,T[E++]=P,T[E++]=C,T[E++]=C,T[E++]=I}}v.version=g;const A=r.get(p);A&&t.remove(A),r.set(p,v)}function f(p){const _=r.get(p);if(_){const m=p.index;m!==null&&_.version<m.version&&d(p)}else d(p);return r.get(p)}function h(){for(const p in s){const _=s[p].deref();_!==void 0&&c(_)}}return{get:l,update:u,getWireframeAttribute:f,dispose:h}}function Lg(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function c(d,f){i.drawElements(n,f,r,d*o),e.update(f,n,1)}function l(d,f,h){h!==0&&(i.drawElementsInstanced(n,f,r,d*o,h),e.update(f,n,h))}function u(d,f,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,h);let _=0;for(let m=0;m<h;m++)_+=f[m];e.update(_,n,1)}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Dg(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:ye("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Ig(i,t,e){const n=new WeakMap,s=new ze;function r(o,a,c){const l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0;let f=n.get(a);if(f===void 0||f.count!==d){let I=function(){M.dispose(),n.delete(a),a.removeEventListener("dispose",I)};f!==void 0&&f.texture.dispose();const h=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],x=a.morphAttributes.color||[];let y=0;h===!0&&(y=1),p===!0&&(y=2),_===!0&&(y=3);let v=a.attributes.position.count*y,T=1;v>t.maxTextureSize&&(T=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);const A=new Float32Array(v*T*4*d),M=new lu(A,v,T,d);M.type=In,M.needsUpdate=!0;const E=y*4;for(let P=0;P<d;P++){const C=m[P],N=g[P],B=x[P],U=v*T*4*P;for(let z=0;z<C.count;z++){const W=z*E;h===!0&&(s.fromBufferAttribute(C,z),A[U+W+0]=s.x,A[U+W+1]=s.y,A[U+W+2]=s.z,A[U+W+3]=0),p===!0&&(s.fromBufferAttribute(N,z),A[U+W+4]=s.x,A[U+W+5]=s.y,A[U+W+6]=s.z,A[U+W+7]=0),_===!0&&(s.fromBufferAttribute(B,z),A[U+W+8]=s.x,A[U+W+9]=s.y,A[U+W+10]=s.z,A[U+W+11]=B.itemSize===4?s.w:1)}}f={count:d,texture:M,size:new ft(v,T)},n.set(a,f),a.addEventListener("dispose",I)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let h=0;for(let _=0;_<l.length;_++)h+=l[_];const p=a.morphTargetsRelative?1:1-h;c.getUniforms().setValue(i,"morphTargetBaseInfluence",p),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",f.texture,e),c.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function Ng(i,t,e,n,s){let r=new WeakMap;function o(l){const u=s.render.frame,d=l.geometry,f=t.get(l,d);if(r.get(f)!==u&&(t.update(f),r.set(f,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){const h=l.skeleton;r.get(h)!==u&&(h.update(),r.set(h,u))}return f}function a(){r=new WeakMap}function c(l){const u=l.target;u.removeEventListener("dispose",c),n.releaseStatesOfObject(u),e.remove(u.instanceMatrix),u.instanceColor!==null&&e.remove(u.instanceColor)}return{update:o,dispose:a}}const Ug={[Xh]:"LINEAR_TONE_MAPPING",[Yh]:"REINHARD_TONE_MAPPING",[qh]:"CINEON_TONE_MAPPING",[Zh]:"ACES_FILMIC_TONE_MAPPING",[Jh]:"AGX_TONE_MAPPING",[ml]:"NEUTRAL_TONE_MAPPING",[Kh]:"CUSTOM_TONE_MAPPING"};function Og(i,t,e,n,s,r){const o=new Yn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let a=null,c=null,l=null;const u=new De;u.setAttribute("position",new ue([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new ue([0,2,0,0,2,0],2));const d=new yp({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),f=new Te(u,d),h=new Cu(-1,1,1,-1,0,1);let p=null,_=null,m=!1,g,x=null,y=[],v=!1;this.setSize=function(T,A){o.setSize(T,A),a!==null&&a.setSize(T,A),c!==null&&c.setSize(T,A);for(let M=0;M<y.length;M++){const E=y[M];E.setSize&&E.setSize(T,A)}},this.setEffects=function(T){y=T,v=y.length>0&&y[0].isRenderPass===!0;const A=o.width,M=o.height;y.length>0&&a===null&&(a=new Yn(A,M,{type:Zn,depthBuffer:!1,stencilBuffer:!1}),c=new Yn(A,M,{type:Zn,depthBuffer:!1,stencilBuffer:!1}));const E=s===!0&&y.some(I=>I.needsDepthTexture===!0);E!==(o.depthTexture!==null)&&(E===!0&&l===null&&(l=new xs(A,M),r===!0&&(l.format=yi,l.type=_s)),o.dispose(),o.depthTexture=E?l:null,o.resolveDepthBuffer=E,o.storeMultisampledDepthBuffer=E);for(let I=0;I<y.length;I++){const P=y[I];P.setSize&&P.setSize(A,M),E&&P.needsDepthTexture===!0&&P.setDepthTexture&&P.setDepthTexture(l)}},this.begin=function(T,A){if(m||T.toneMapping===ci&&y.length===0)return!1;if(x=A,A!==null){const M=A.width,E=A.height;(o.width!==M||o.height!==E)&&this.setSize(M,E)}return v===!1&&T.setRenderTarget(o),g=T.toneMapping,T.toneMapping=ci,!0},this.hasRenderPass=function(){return v},this.end=function(T,A){T.toneMapping=g,m=!0;let M=o,E=a;for(let I=0;I<y.length;I++){const P=y[I];P.enabled!==!1&&(P.render(T,E,M,A),P.needsSwap!==!1&&(M=E,E=E===a?c:a))}if(p!==T.outputColorSpace||_!==T.toneMapping){p=T.outputColorSpace,_=T.toneMapping,d.defines={},ve.getTransfer(p)===Re&&(d.defines.SRGB_TRANSFER="");const I=Ug[_];I&&(d.defines[I]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=M.texture,T.setRenderTarget(x),T.render(f,h),x=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}const Nu=new dn,Uu=new xs(1,1),Ou=new mu(1),Fu=new lu,zu=new Md,Bu=new pu,$c=[],Qc=[],jc=new Float32Array(16),th=new Float32Array(9),eh=new Float32Array(4);function Es(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=$c[s];if(r===void 0&&(r=new Float32Array(s),$c[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function qe(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ze(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function _o(i,t){let e=Qc[t];e===void 0&&(e=new Int32Array(t),Qc[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Fg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function zg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(qe(e,t))return;i.uniform2fv(this.addr,t),Ze(e,t)}}function Bg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(qe(e,t))return;i.uniform3fv(this.addr,t),Ze(e,t)}}function Hg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(qe(e,t))return;i.uniform4fv(this.addr,t),Ze(e,t)}}function kg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(qe(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ze(e,t)}else{if(qe(e,n))return;eh.set(n),i.uniformMatrix2fv(this.addr,!1,eh),Ze(e,n)}}function Gg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(qe(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ze(e,t)}else{if(qe(e,n))return;th.set(n),i.uniformMatrix3fv(this.addr,!1,th),Ze(e,n)}}function Vg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(qe(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ze(e,t)}else{if(qe(e,n))return;jc.set(n),i.uniformMatrix4fv(this.addr,!1,jc),Ze(e,n)}}function Wg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Xg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(qe(e,t))return;i.uniform2iv(this.addr,t),Ze(e,t)}}function Yg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(qe(e,t))return;i.uniform3iv(this.addr,t),Ze(e,t)}}function qg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(qe(e,t))return;i.uniform4iv(this.addr,t),Ze(e,t)}}function Zg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Kg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(qe(e,t))return;i.uniform2uiv(this.addr,t),Ze(e,t)}}function Jg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(qe(e,t))return;i.uniform3uiv(this.addr,t),Ze(e,t)}}function $g(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(qe(e,t))return;i.uniform4uiv(this.addr,t),Ze(e,t)}}function xo(i){return i.version===0&&(i.compareFunction=ou,i.needsUpdate=!0),i}function Qg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=xo(Uu):r=Nu,e.setTexture2D(t||r,s)}function jg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||zu,s)}function t_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=xo(Ou):r=Bu,e.setTextureCube(t||r,s)}function e_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Fu,s)}function n_(i){switch(i){case 5126:return Fg;case 35664:return zg;case 35665:return Bg;case 35666:return Hg;case 35674:return kg;case 35675:return Gg;case 35676:return Vg;case 5124:case 35670:return Wg;case 35667:case 35671:return Xg;case 35668:case 35672:return Yg;case 35669:case 35673:return qg;case 5125:return Zg;case 36294:return Kg;case 36295:return Jg;case 36296:return $g;case 35678:case 36198:case 36298:case 36306:case 35682:return Qg;case 35679:case 36299:case 36307:return jg;case 35680:case 36300:case 36308:case 36293:return t_;case 36289:case 36303:case 36311:case 36292:return e_}}function i_(i,t){i.uniform1fv(this.addr,t)}function s_(i,t){const e=Es(t,this.size,2);i.uniform2fv(this.addr,e)}function r_(i,t){const e=Es(t,this.size,3);i.uniform3fv(this.addr,e)}function o_(i,t){const e=Es(t,this.size,4);i.uniform4fv(this.addr,e)}function a_(i,t){const e=Es(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function l_(i,t){const e=Es(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function c_(i,t){const e=Es(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function h_(i,t){i.uniform1iv(this.addr,t)}function u_(i,t){i.uniform2iv(this.addr,t)}function f_(i,t){i.uniform3iv(this.addr,t)}function d_(i,t){i.uniform4iv(this.addr,t)}function p_(i,t){i.uniform1uiv(this.addr,t)}function m_(i,t){i.uniform2uiv(this.addr,t)}function g_(i,t){i.uniform3uiv(this.addr,t)}function __(i,t){i.uniform4uiv(this.addr,t)}function x_(i,t,e){const n=this.cache,s=t.length,r=_o(e,s);qe(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=xo(Uu):o=Nu;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function v_(i,t,e){const n=this.cache,s=t.length,r=_o(e,s);qe(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||zu,r[o])}function M_(i,t,e){const n=this.cache,s=t.length,r=_o(e,s);qe(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));let o;this.type===i.SAMPLER_CUBE_SHADOW?o=xo(Ou):o=Bu;for(let a=0;a!==s;++a)e.setTextureCube(t[a]||o,r[a])}function y_(i,t,e){const n=this.cache,s=t.length,r=_o(e,s);qe(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Fu,r[o])}function S_(i){switch(i){case 5126:return i_;case 35664:return s_;case 35665:return r_;case 35666:return o_;case 35674:return a_;case 35675:return l_;case 35676:return c_;case 5124:case 35670:return h_;case 35667:case 35671:return u_;case 35668:case 35672:return f_;case 35669:case 35673:return d_;case 5125:return p_;case 36294:return m_;case 36295:return g_;case 36296:return __;case 35678:case 36198:case 36298:case 36306:case 35682:return x_;case 35679:case 36299:case 36307:return v_;case 35680:case 36300:case 36308:case 36293:return M_;case 36289:case 36303:case 36311:case 36292:return y_}}class E_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=n_(e.type)}}class b_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=S_(e.type)}}class w_{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],n)}}}const Qo=/(\w+)(\])?(\[|\.)?/g;function nh(i,t){i.seq.push(t),i.map[t.id]=t}function T_(i,t,e){const n=i.name,s=n.length;for(Qo.lastIndex=0;;){const r=Qo.exec(n),o=Qo.lastIndex;let a=r[1];const c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){nh(e,l===void 0?new E_(a,i,t):new b_(a,i,t));break}else{let d=e.map[a];d===void 0&&(d=new w_(a),nh(e,d)),e=d}}}class Wr{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){const a=t.getActiveUniform(e,o),c=t.getUniformLocation(e,a.name);T_(a,c,this)}const s=[],r=[];for(const o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&n.push(o)}return n}}function ih(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const A_=37297;let R_=0;function C_(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}const sh=new oe;function P_(i){ve._getMatrix(sh,ve.workingColorSpace,i);const t=`mat3( ${sh.elements.map(e=>e.toFixed(4))} )`;switch(ve.getTransfer(i)){case jr:return[t,"LinearTransferOETF"];case Re:return[t,"sRGBTransferOETF"];default:return te("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function rh(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+C_(i.getShaderSource(t),a)}else return r}function L_(i,t){const e=P_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( ${e[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const D_={[Xh]:"Linear",[Yh]:"Reinhard",[qh]:"Cineon",[Zh]:"ACESFilmic",[Jh]:"AgX",[ml]:"Neutral",[Kh]:"Custom"};function I_(i,t){const e=D_[t];return e===void 0?(te("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Nr=new b;function N_(){ve.getLuminanceCoefficients(Nr);const i=Nr.x.toFixed(4),t=Nr.y.toFixed(4),e=Nr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function U_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Os).join(`
`)}function O_(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function F_(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Os(i){return i!==""}function oh(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function ah(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const z_=/^[ \t]*#include +<([\w\d./]+)>/gm;function tl(i){return i.replace(z_,B_)}function B_(i,t){const e=ge[t];if(e===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">");return tl(e)}const H_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function lh(i){return i.replace(H_,k_)}function k_(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function ch(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}const G_={[Hs]:"SHADOWMAP_TYPE_PCF",[Ns]:"SHADOWMAP_TYPE_VSM"};function V_(i){return G_[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const W_={[Ys]:"ENVMAP_MODE_REFRACTION"};function X_(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":W_[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Y_={[pl]:"ENVMAP_BLENDING_MULTIPLY",[Zf]:"ENVMAP_BLENDING_MIX",[Kf]:"ENVMAP_BLENDING_ADD"};function q_(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Y_[i.combine]||"ENVMAP_BLENDING_NONE"}function Z_(i,t,e,n){const s=i.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const c=V_(e),l=e.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=X_(e),d=q_(e),f=U_(e),h=O_(r),p=s.createProgram();let _,m,g=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(_=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,h].filter(Os).join(`
`),_.length>0&&(_+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,h].filter(Os).join(`
`),m.length>0&&(m+=`
`)):(_=[ch(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,h,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+e.diffuseRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Os).join(`
`),m=[ch(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,h,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+u:"",e.envMap?"#define "+d:"",e.envMapPMREM?"#define ENVMAP_MAX_LOD "+e.envMapMaxLod+".0":"",e.envMapPMREM?"#define ENVMAP_SIZE "+e.envMapSize+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ci?"#define TONE_MAPPING":"",e.toneMapping!==ci?ge.tonemapping_pars_fragment:"",e.toneMapping!==ci?I_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ge.colorspace_pars_fragment,L_("linearToOutputTexel",e.outputColorSpace),N_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Os).join(`
`)),o=tl(o),o=oh(o,e),o=ah(o,e),a=tl(a),a=oh(a,e),a=ah(a,e),o=lh(o),a=lh(a),e.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,_=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,m=["#define varying in",e.glslVersion===oc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===oc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const x=g+_+o,y=g+m+a,v=ih(s,s.VERTEX_SHADER,x),T=ih(s,s.FRAGMENT_SHADER,y);s.attachShader(p,v),s.attachShader(p,T),e.index0AttributeName!==void 0?s.bindAttribLocation(p,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(p,0,"position"),s.linkProgram(p);function A(P){if(i.debug.checkShaderErrors){const C=s.getProgramInfoLog(p)||"",N=s.getShaderInfoLog(v)||"",B=s.getShaderInfoLog(T)||"",U=C.trim(),z=N.trim(),W=B.trim();let X=!0,it=!0;if(s.getProgramParameter(p,s.LINK_STATUS)===!1)if(X=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,p,v,T);else{const L=rh(s,v,"vertex"),H=rh(s,T,"fragment");ye("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(p,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+U+`
`+L+`
`+H)}else U!==""?te("WebGLProgram: Program Info Log:",U):(z===""||W==="")&&(it=!1);it&&(P.diagnostics={runnable:X,programLog:U,vertexShader:{log:z,prefix:_},fragmentShader:{log:W,prefix:m}})}s.deleteShader(v),s.deleteShader(T),M=new Wr(s,p),E=F_(s,p)}let M;this.getUniforms=function(){return M===void 0&&A(this),M};let E;this.getAttributes=function(){return E===void 0&&A(this),E};let I=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return I===!1&&(I=s.getProgramParameter(p,A_)),I},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(p),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=R_++,this.cacheKey=t,this.usedTimes=1,this.program=p,this.vertexShader=v,this.fragmentShader=T,this}let K_=0;class J_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){const s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new $_(t),e.set(t,n)),n}}class $_{constructor(t){this.id=K_++,this.code=t,this.usedTimes=0}}function Q_(i){return i===Fi||i===Kr||i===Jr}function j_(i,t,e,n,s,r){const o=new wl,a=new J_,c=new Set,l=[],u=new Map,d=n.logarithmicDepthBuffer,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function h(M){return c.add(M),M===0?"uv":`uv${M}`}function p(M,E,I,P,C,N){const B=P.fog,U=C.geometry,z=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?P.environment:null,W=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap,X=t.get(M.envMap||z,W),it=f[M.type];let L=n.precision;M.precision!==null&&(L=n.getMaxPrecision(M.precision),L!==M.precision&&te("WebGLProgram.getParameters:",M.precision,"not supported, using",L,"instead."));const H=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,k=H!==void 0?H.length:0;let at=0;U.morphAttributes.position!==void 0&&(at=1),U.morphAttributes.normal!==void 0&&(at=2),U.morphAttributes.color!==void 0&&(at=3);let mt,V,nt,Et;if(it){const Ct=kn[it];mt=Ct.vertexShader,V=Ct.fragmentShader}else{mt=M.vertexShader,V=M.fragmentShader;const Ct=a.getVertexShaderStage(M),de=a.getFragmentShaderStage(M);a.update(M,Ct,de),nt=Ct.id,Et=de.id}const Pt=i.getRenderTarget(),Mt=i.state.buffers.depth.getReversed(),Ut=C.isInstancedMesh===!0,qt=C.isBatchedMesh===!0,Ot=!!M.map,Zt=!!M.matcap,Qt=!!X,$=Qt&&X.isPMREMTexture===!0,ht=!!M.aoMap,ut=!!M.lightMap,bt=!!M.bumpMap&&M.wireframe===!1,yt=!!M.normalMap,Jt=!!M.displacementMap,Bt=!!M.emissiveMap,he=!!M.metalnessMap,fe=!!M.roughnessMap,xe=M.anisotropy>0,D=M.clearcoat>0,ct=M.diffuseRoughness>0,vt=M.dispersion>0,Xt=M.retroreflectivity>0,rt=M.iridescence>0,$t=M.sheen>0,Tt=M.transmission>0,Rt=xe&&!!M.anisotropyMap,R=D&&!!M.clearcoatMap,S=D&&!!M.clearcoatNormalMap,G=D&&!!M.clearcoatRoughnessMap,ot=ct&&!!M.diffuseRoughnessMap,tt=rt&&!!M.iridescenceMap,_t=rt&&!!M.iridescenceThicknessMap,xt=$t&&!!M.sheenColorMap,Z=$t&&!!M.sheenRoughnessMap,K=!!M.specularMap,pt=!!M.specularColorMap,O=!!M.specularIntensityMap,et=Tt&&!!M.transmissionMap,Q=Tt&&!!M.thicknessMap,dt=!!M.gradientMap,gt=!!M.alphaMap,j=M.alphaTest>0,St=!!M.alphaHash,Ft=!!M.extensions;let st=ci;M.toneMapped&&(Pt===null||Pt.isXRRenderTarget===!0)&&(st=i.toneMapping);const Ht=$?X.isCompressedCubeTexture?X.image[0].mipmaps:X.mipmaps:null,Kt={shaderID:it,shaderType:M.type,shaderName:M.name,vertexShader:mt,fragmentShader:V,defines:M.defines,customVertexShaderID:nt,customFragmentShaderID:Et,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:L,batching:qt,batchingColor:qt&&C._colorsTexture!==null,instancing:Ut,instancingColor:Ut&&C.instanceColor!==null,instancingMorph:Ut&&C.morphTexture!==null,outputColorSpace:Pt===null?i.outputColorSpace:Pt.isXRRenderTarget===!0?Pt.texture.colorSpace:ve.workingColorSpace,alphaToCoverage:!!M.alphaToCoverage,map:Ot,matcap:Zt,envMap:Qt,envMapMode:Qt&&X.mapping,envMapPMREM:$,envMapMaxLod:$?Ht.length-1:null,envMapSize:$?Ht[0].width:null,aoMap:ht,lightMap:ut,bumpMap:bt,normalMap:yt,displacementMap:Jt,emissiveMap:Bt,normalMapObjectSpace:yt&&M.normalMapType===Qf,normalMapTangentSpace:yt&&M.normalMapType===$r,packedNormalMap:yt&&M.normalMapType===$r&&Q_(M.normalMap.format),metalnessMap:he,roughnessMap:fe,anisotropy:xe,anisotropyMap:Rt,clearcoat:D,clearcoatMap:R,clearcoatNormalMap:S,clearcoatRoughnessMap:G,diffuseRoughness:ct,diffuseRoughnessMap:ot,dispersion:vt,retroreflection:Xt,iridescence:rt,iridescenceMap:tt,iridescenceThicknessMap:_t,sheen:$t,sheenColorMap:xt,sheenRoughnessMap:Z,specularMap:K,specularColorMap:pt,specularIntensityMap:O,transmission:Tt,transmissionMap:et,thicknessMap:Q,gradientMap:dt,opaque:M.transparent===!1&&M.blending===ks&&M.alphaToCoverage===!1,alphaMap:gt,alphaTest:j,alphaHash:St,combine:M.combine,mapUv:Ot&&h(M.map.channel),aoMapUv:ht&&h(M.aoMap.channel),lightMapUv:ut&&h(M.lightMap.channel),bumpMapUv:bt&&h(M.bumpMap.channel),normalMapUv:yt&&h(M.normalMap.channel),displacementMapUv:Jt&&h(M.displacementMap.channel),emissiveMapUv:Bt&&h(M.emissiveMap.channel),metalnessMapUv:he&&h(M.metalnessMap.channel),roughnessMapUv:fe&&h(M.roughnessMap.channel),anisotropyMapUv:Rt&&h(M.anisotropyMap.channel),clearcoatMapUv:R&&h(M.clearcoatMap.channel),clearcoatNormalMapUv:S&&h(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:G&&h(M.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ot&&h(M.diffuseRoughnessMap.channel),iridescenceMapUv:tt&&h(M.iridescenceMap.channel),iridescenceThicknessMapUv:_t&&h(M.iridescenceThicknessMap.channel),sheenColorMapUv:xt&&h(M.sheenColorMap.channel),sheenRoughnessMapUv:Z&&h(M.sheenRoughnessMap.channel),specularMapUv:K&&h(M.specularMap.channel),specularColorMapUv:pt&&h(M.specularColorMap.channel),specularIntensityMapUv:O&&h(M.specularIntensityMap.channel),transmissionMapUv:et&&h(M.transmissionMap.channel),thicknessMapUv:Q&&h(M.thicknessMap.channel),alphaMapUv:gt&&h(M.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(yt||xe),vertexNormals:!!U.attributes.normal,vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:C.isPoints===!0&&!!U.attributes.uv&&(Ot||gt),fog:!!B,useFog:M.fog===!0,fogExp2:!!B&&B.isFogExp2,flatShading:M.wireframe===!1&&(M.flatShading===!0||U.attributes.normal===void 0&&yt===!1&&(M.isMeshLambertMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isMeshPhysicalMaterial)),sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Mt,skinning:C.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:k,morphTextureStride:at,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:N.filter(Ct=>Ct.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:st,decodeVideoTexture:Ot&&M.map.isVideoTexture===!0&&ve.getTransfer(M.map.colorSpace)===Re,decodeVideoTextureEmissive:Bt&&M.emissiveMap.isVideoTexture===!0&&ve.getTransfer(M.emissiveMap.colorSpace)===Re,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Ln,flipSided:M.side===fn,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Ft&&M.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ft&&M.extensions.multiDraw===!0||qt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return Kt.vertexUv1s=c.has(1),Kt.vertexUv2s=c.has(2),Kt.vertexUv3s=c.has(3),c.clear(),Kt}function _(M){const E=[];if(M.shaderID?E.push(M.shaderID):(E.push(M.customVertexShaderID),E.push(M.customFragmentShaderID)),M.defines!==void 0)for(const I in M.defines)E.push(I),E.push(M.defines[I]);return M.isRawShaderMaterial===!1&&(m(E,M),g(E,M),E.push(i.outputColorSpace)),E.push(M.customProgramCacheKey),E.join()}function m(M,E){M.push(E.precision),M.push(E.outputColorSpace),M.push(E.envMapMode),M.push(E.envMapPMREM),M.push(E.envMapMaxLod),M.push(E.envMapSize),M.push(E.mapUv),M.push(E.alphaMapUv),M.push(E.lightMapUv),M.push(E.aoMapUv),M.push(E.bumpMapUv),M.push(E.normalMapUv),M.push(E.displacementMapUv),M.push(E.emissiveMapUv),M.push(E.metalnessMapUv),M.push(E.roughnessMapUv),M.push(E.anisotropyMapUv),M.push(E.clearcoatMapUv),M.push(E.clearcoatNormalMapUv),M.push(E.clearcoatRoughnessMapUv),M.push(E.diffuseRoughnessMapUv),M.push(E.iridescenceMapUv),M.push(E.iridescenceThicknessMapUv),M.push(E.sheenColorMapUv),M.push(E.sheenRoughnessMapUv),M.push(E.specularMapUv),M.push(E.specularColorMapUv),M.push(E.specularIntensityMapUv),M.push(E.transmissionMapUv),M.push(E.thicknessMapUv),M.push(E.combine),M.push(E.fogExp2),M.push(E.sizeAttenuation),M.push(E.morphTargetsCount),M.push(E.numSunLights),M.push(E.numDirLights),M.push(E.numPointLights),M.push(E.numSpotLights),M.push(E.numSpotLightMaps),M.push(E.numHemiLights),M.push(E.numRectAreaLights),M.push(E.numSunLightShadows),M.push(E.numDirLightShadows),M.push(E.numPointLightShadows),M.push(E.numSpotLightShadows),M.push(E.numSpotLightShadowsWithMaps),M.push(E.numLightProbes),M.push(E.numLightProbeGrids),M.push(E.shadowMapType),M.push(E.toneMapping),M.push(E.numClippingPlanes),M.push(E.numClipIntersection),M.push(E.depthPacking)}function g(M,E){o.disableAll(),E.instancing&&o.enable(0),E.instancingColor&&o.enable(1),E.instancingMorph&&o.enable(2),E.matcap&&o.enable(3),E.envMap&&o.enable(4),E.normalMapObjectSpace&&o.enable(5),E.normalMapTangentSpace&&o.enable(6),E.clearcoat&&o.enable(7),E.iridescence&&o.enable(8),E.alphaTest&&o.enable(9),E.vertexColors&&o.enable(10),E.vertexAlphas&&o.enable(11),E.vertexUv1s&&o.enable(12),E.vertexUv2s&&o.enable(13),E.vertexUv3s&&o.enable(14),E.vertexTangents&&o.enable(15),E.anisotropy&&o.enable(16),E.alphaHash&&o.enable(17),E.batching&&o.enable(18),E.dispersion&&o.enable(19),E.retroreflection&&o.enable(24),E.diffuseRoughness&&o.enable(25),E.batchingColor&&o.enable(20),E.gradientMap&&o.enable(21),E.packedNormalMap&&o.enable(22),E.vertexNormals&&o.enable(23),M.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reversedDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),E.numLightProbeGrids>0&&o.enable(22),E.hasPositionAttribute&&o.enable(23),M.push(o.mask)}function x(M){const E=f[M.type];let I;if(E){const P=kn[E];I=xp.clone(P.uniforms)}else I=M.uniforms;return I}function y(M,E){let I=u.get(E);return I!==void 0?++I.usedTimes:(I=new Z_(i,E,M,s),l.push(I),u.set(E,I)),I}function v(M){if(--M.usedTimes===0){const E=l.indexOf(M);l[E]=l[l.length-1],l.pop(),u.delete(M.cacheKey),M.destroy()}}function T(M){a.remove(M)}function A(){a.dispose()}return{getParameters:p,getProgramCacheKey:_,getUniforms:x,acquireProgram:y,releaseProgram:v,releaseShaderCache:T,programs:l,dispose:A}}function tx(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function ex(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function hh(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function uh(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(f){let h=0;return f.isInstancedMesh&&(h+=2),f.isSkinnedMesh&&(h+=1),h}function a(f,h,p,_,m,g){let x=i[t];return x===void 0?(x={id:f.id,object:f,geometry:h,material:p,materialVariant:o(f),groupOrder:_,renderOrder:f.renderOrder,z:m,group:g},i[t]=x):(x.id=f.id,x.object=f,x.geometry=h,x.material=p,x.materialVariant=o(f),x.groupOrder=_,x.renderOrder=f.renderOrder,x.z=m,x.group=g),t++,x}function c(f,h,p,_,m,g,x){x.reversedDepth===!0&&(m=-m);const y=a(f,h,p,_,m,g);p.transmission>0?n.push(y):p.transparent===!0?s.push(y):e.push(y)}function l(f,h,p,_,m,g){const x=a(f,h,p,_,m,g);p.transmission>0?n.unshift(x):p.transparent===!0?s.unshift(x):e.unshift(x)}function u(f,h){e.length>1&&e.sort(f||ex),n.length>1&&n.sort(h||hh),s.length>1&&s.sort(h||hh)}function d(){for(let f=t,h=i.length;f<h;f++){const p=i[f];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:d,sort:u}}function nx(){let i=new WeakMap;function t(n,s){const r=i.get(n);let o;return r===void 0?(o=new uh,i.set(n,[o])):s>=r.length?(o=new uh,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function ix(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new b,color:new se};break;case"SpotLight":e={position:new b,direction:new b,color:new se,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new b,color:new se,distance:0,decay:0};break;case"HemisphereLight":e={direction:new b,skyColor:new se,groundColor:new se};break;case"RectAreaLight":e={color:new se,position:new b,halfWidth:new b,halfHeight:new b};break}return i[t.id]=e,e}}}function sx(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let rx=0;function ox(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function ax(i){const t=new ix,e=sx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new b);const s=new b,r=new Yt,o=new Yt;function a(l){let u=0,d=0,f=0;for(let N=0;N<9;N++)n.probe[N].set(0,0,0);let h=0,p=0,_=0,m=0,g=0,x=0,y=0,v=0,T=0,A=0,M=0,E=0,I=0,P=0;l.sort(ox);for(let N=0,B=l.length;N<B;N++){const U=l[N],z=U.color,W=U.intensity,X=U.distance;let it=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===Fi?it=U.shadow.map.texture:it=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)u+=z.r*W,d+=z.g*W,f+=z.b*W;else if(U.isLightProbe){for(let L=0;L<9;L++)n.probe[L].addScaledVector(U.sh.coefficients[L],W);P++}else if(U.isSunLight){const L=t.get(U);if(L.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const H=U.shadow,k=e.get(U);k.shadowIntensity=H.intensity,k.shadowBias=H.bias,k.shadowNormalBias=H.normalBias,k.shadowRadius=H.radius,k.shadowMapSize.copy(H.mapSize).multiply(H.getFrameExtents()),n.sunShadow[p]=k,n.sunShadowMap[p]=it;const at=H.getViewportCount();for(let mt=0;mt<at;mt++)n.sunShadowMatrix[_+mt]=H.getMatrix(mt),n.sunShadowCascade[_+mt]=H._cascadeData[mt];_+=at,p++}n.sun[h]=L,h++}else if(U.isDirectionalLight){const L=t.get(U);if(L.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const H=U.shadow,k=e.get(U);k.shadowIntensity=H.intensity,k.shadowBias=H.bias,k.shadowNormalBias=H.normalBias,k.shadowRadius=H.radius,k.shadowMapSize=H.mapSize,n.directionalShadow[m]=k,n.directionalShadowMap[m]=it,n.directionalShadowMatrix[m]=U.shadow.matrix,T++}n.directional[m]=L,m++}else if(U.isSpotLight){const L=t.get(U);L.position.setFromMatrixPosition(U.matrixWorld),L.color.copy(z).multiplyScalar(W),L.distance=X,L.coneCos=Math.cos(U.angle),L.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),L.decay=U.decay,n.spot[x]=L;const H=U.shadow;if(U.map&&(n.spotLightMap[E]=U.map,E++,H.updateMatrices(U),U.castShadow&&I++),n.spotLightMatrix[x]=H.matrix,U.castShadow){const k=e.get(U);k.shadowIntensity=H.intensity,k.shadowBias=H.bias,k.shadowNormalBias=H.normalBias,k.shadowRadius=H.radius,k.shadowMapSize=H.mapSize,n.spotShadow[x]=k,n.spotShadowMap[x]=it,M++}x++}else if(U.isRectAreaLight){const L=t.get(U);L.color.copy(z).multiplyScalar(W),L.halfWidth.set(U.width*.5,0,0),L.halfHeight.set(0,U.height*.5,0),n.rectArea[y]=L,y++}else if(U.isPointLight){const L=t.get(U);if(L.color.copy(U.color).multiplyScalar(U.intensity),L.distance=U.distance,L.decay=U.decay,U.castShadow){const H=U.shadow,k=e.get(U);k.shadowIntensity=H.intensity,k.shadowBias=H.bias,k.shadowNormalBias=H.normalBias,k.shadowRadius=H.radius,k.shadowMapSize=H.mapSize,k.shadowCameraNear=H.camera.near,k.shadowCameraFar=H.camera.far,n.pointShadow[g]=k,n.pointShadowMap[g]=it,n.pointShadowMatrix[g]=U.shadow.matrix,A++}n.point[g]=L,g++}else if(U.isHemisphereLight){const L=t.get(U);L.skyColor.copy(U.color).multiplyScalar(W),L.groundColor.copy(U.groundColor).multiplyScalar(W),n.hemi[v]=L,v++}}y>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=It.LTC_FLOAT_1,n.rectAreaLTC2=It.LTC_FLOAT_2):(n.rectAreaLTC1=It.LTC_HALF_1,n.rectAreaLTC2=It.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=f;const C=n.hash;(C.sunLength!==h||C.directionalLength!==m||C.pointLength!==g||C.spotLength!==x||C.rectAreaLength!==y||C.hemiLength!==v||C.numSunShadows!==p||C.numDirectionalShadows!==T||C.numPointShadows!==A||C.numSpotShadows!==M||C.numSpotMaps!==E||C.numLightProbes!==P)&&(n.sun.length=h,n.directional.length=m,n.spot.length=x,n.rectArea.length=y,n.point.length=g,n.hemi.length=v,n.sunShadow.length=p,n.sunShadowMap.length=p,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.directionalShadowMatrix.length=T,n.pointShadow.length=A,n.pointShadowMap.length=A,n.pointShadowMatrix.length=A,n.spotShadow.length=M,n.spotShadowMap.length=M,n.spotLightMatrix.length=M+E-I,n.spotLightMap.length=E,n.numSpotLightShadowsWithMaps=I,n.numLightProbes=P,C.sunLength=h,C.directionalLength=m,C.pointLength=g,C.spotLength=x,C.rectAreaLength=y,C.hemiLength=v,C.numSunShadows=p,C.numDirectionalShadows=T,C.numPointShadows=A,C.numSpotShadows=M,C.numSpotMaps=E,C.numLightProbes=P,n.version=rx++)}function c(l,u){let d=0,f=0,h=0,p=0,_=0,m=0;const g=u.matrixWorldInverse;for(let x=0,y=l.length;x<y;x++){const v=l[x];if(v.isSunLight){const T=n.sun[d];T.direction.setFromMatrixPosition(v.matrixWorld),T.direction.transformDirection(g),d++}else if(v.isDirectionalLight){const T=n.directional[f];T.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(g),f++}else if(v.isSpotLight){const T=n.spot[p];T.position.setFromMatrixPosition(v.matrixWorld),T.position.applyMatrix4(g),T.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(g),p++}else if(v.isRectAreaLight){const T=n.rectArea[_];T.position.setFromMatrixPosition(v.matrixWorld),T.position.applyMatrix4(g),o.identity(),r.copy(v.matrixWorld),r.premultiply(g),o.extractRotation(r),T.halfWidth.set(v.width*.5,0,0),T.halfHeight.set(0,v.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),_++}else if(v.isPointLight){const T=n.point[h];T.position.setFromMatrixPosition(v.matrixWorld),T.position.applyMatrix4(g),h++}else if(v.isHemisphereLight){const T=n.hemi[m];T.direction.setFromMatrixPosition(v.matrixWorld),T.direction.transformDirection(g),m++}}}return{setup:a,setupView:c,state:n}}function fh(i){const t=new ax(i),e=[],n=[],s=[];function r(d){u.camera=d,e.length=0,n.length=0,s.length=0}function o(d){d.isLightProbeGrid?s.push(d):e.push(d)}function a(d){n.push(d)}function c(){t.setup(e),s.sort((d,f)=>d.priority-f.priority||d.id-f.id)}function l(d){t.setupView(e,d)}const u={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:a}}function lx(i){let t=new WeakMap;function e(s,r=0){const o=t.get(s);let a;return o===void 0?(a=new fh(i),t.set(s,[a])):r>=o.length?(a=new fh(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}const cx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,hx=`uniform sampler2D shadow_pass;
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
}`,ux=[new b(1,0,0),new b(-1,0,0),new b(0,1,0),new b(0,-1,0),new b(0,0,1),new b(0,0,-1)],fx=[new b(0,-1,0),new b(0,-1,0),new b(0,0,1),new b(0,0,-1),new b(0,-1,0),new b(0,-1,0)],dh=new Yt,Ls=new b,jo=new b;function dx(i,t,e){let n=new Ks;const s=new ft,r=new ft,o=new ze,a=new bp,c=new wp,l={},u=e.maxTextureSize,d={[Oi]:fn,[fn]:Oi,[Ln]:Ln},f=new Bi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ft},radius:{value:4}},vertexShader:cx,fragmentShader:hx}),h=f.clone();h.defines.HORIZONTAL_PASS=1;const p=new De;p.setAttribute("position",new bn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Te(p,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Hs;let g=this.type;this.render=function(A,M,E){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;this.type===Cf&&(te("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Hs);const I=i.getRenderTarget(),P=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),N=i.state;N.setBlending(us),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const B=g!==this.type;B&&M.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(z=>z.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,z=A.length;U<z;U++){const W=A[U],X=W.shadow;if(X===void 0){te("WebGLShadowMap:",W,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);const it=X.getFrameExtents();s.multiply(it),r.copy(X.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/it.x),s.x=r.x*it.x,X.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/it.y),s.y=r.y*it.y,X.mapSize.y=r.y));const L=i.state.buffers.depth.getReversed();if(X.camera._reversedDepth=L,X.map===null||B===!0){if(X.map!==null&&(X.map.depthTexture!==null&&(X.map.depthTexture.dispose(),X.map.depthTexture=null),X.map.dispose()),this.type===Ns){if(W.isPointLight){te("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}X.map=new Yn(s.x,s.y,{format:Fi,type:Zn,minFilter:gn,magFilter:gn,generateMipmaps:!1}),X.map.texture.name=W.name+".shadowMap",X.map.depthTexture=new xs(s.x,s.y,In),X.map.depthTexture.name=W.name+".shadowMapDepth",X.map.depthTexture.format=Ei,X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=nn,X.map.depthTexture.magFilter=nn}else W.isPointLight?(X.map=new zl(s.x),X.map.depthTexture=new mu(s.x,qn)):(X.map=new Yn(s.x,s.y),X.map.depthTexture=new xs(s.x,s.y,qn)),X.map.depthTexture.name=W.name+".shadowMap",X.map.depthTexture.format=Ei,this.type===Hs?(X.map.depthTexture.compareFunction=L?ru:su,X.map.depthTexture.minFilter=gn,X.map.depthTexture.magFilter=gn):(X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=nn,X.map.depthTexture.magFilter=nn);X.camera.updateProjectionMatrix()}X.map.isWebGLCubeRenderTarget!==!0&&(X.map.width!==s.x||X.map.height!==s.y)&&X.map.setSize(s.x,s.y);const H=X.map.isWebGLCubeRenderTarget?6:X.getViewportCount();W.isPointLight!==!0&&X.updateMatrices(W,E);const k=(X.camera.layers.mask&4294967294)!==0?X.camera.layers:E.layers;for(let at=0;at<H;at++){const mt=X.getCamera(at);if(W.isPointLight){const V=X.camera,nt=X.matrix,Et=W.distance||V.far;Et!==V.far&&(V.far=Et,V.updateProjectionMatrix()),Ls.setFromMatrixPosition(W.matrixWorld),V.position.copy(Ls),jo.copy(V.position),jo.add(ux[at]),V.up.copy(fx[at]),V.lookAt(jo),V.updateMatrixWorld(),nt.makeTranslation(-Ls.x,-Ls.y,-Ls.z),dh.multiplyMatrices(V.projectionMatrix,V.matrixWorldInverse),X._frustum.setFromProjectionMatrix(dh,V.coordinateSystem,V.reversedDepth)}if(X.map.isWebGLCubeRenderTarget)i.setRenderTarget(X.map,at),i.clear();else{at===0&&(i.setRenderTarget(X.map),i.clear());const V=X.getViewport(at);o.set(r.x*V.x,r.y*V.y,r.x*V.z,r.y*V.w),N.viewport(o)}n=X.getFrustum(at),v(M,E,mt,W,k,this.type)}X.isPointLightShadow!==!0&&this.type===Ns&&x(X,E),X.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(I,P,C)};function x(A,M){const E=t.update(_);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,h.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,h.needsUpdate=!0),A.mapPass===null?A.mapPass=new Yn(s.x,s.y,{format:Fi,type:Zn}):(A.mapPass.width!==A.map.width||A.mapPass.height!==A.map.height)&&A.mapPass.setSize(A.map.width,A.map.height),f.uniforms.shadow_pass.value=A.map.depthTexture,f.uniforms.resolution.value.set(A.map.width,A.map.height),f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(M,null,E,f,_,null),h.uniforms.shadow_pass.value=A.mapPass.texture,h.uniforms.resolution.value.set(A.map.width,A.map.height),h.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(M,null,E,h,_,null)}function y(A,M,E,I){let P=null;const C=E.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(C!==void 0)P=C;else if(P=E.isPointLight===!0?c:a,i.localClippingEnabled&&M.clipShadows===!0&&Array.isArray(M.clippingPlanes)&&M.clippingPlanes.length!==0||M.displacementMap&&M.displacementScale!==0||M.alphaMap&&M.alphaTest>0||M.map&&M.alphaTest>0||M.alphaToCoverage===!0){const N=P.uuid,B=M.uuid;let U=l[N];U===void 0&&(U={},l[N]=U);let z=U[B];z===void 0&&(z=P.clone(),U[B]=z,M.addEventListener("dispose",T)),P=z}if(P.visible=M.visible,P.wireframe=M.wireframe,I===Ns?P.side=M.shadowSide!==null?M.shadowSide:M.side:P.side=M.shadowSide!==null?M.shadowSide:d[M.side],P.alphaMap=M.alphaMap,P.alphaTest=M.alphaToCoverage===!0?.5:M.alphaTest,P.map=M.map,P.clipShadows=M.clipShadows,P.clippingPlanes=M.clippingPlanes,P.clipIntersection=M.clipIntersection,P.displacementMap=M.displacementMap,P.displacementScale=M.displacementScale,P.displacementBias=M.displacementBias,P.wireframeLinewidth=M.wireframeLinewidth,P.linewidth=M.linewidth,E.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const N=i.properties.get(P);N.light=E}return P}function v(A,M,E,I,P,C){if(A.visible===!1)return;if(A.layers.test(P)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&C===Ns)&&(!A.frustumCulled||A.intersectsFrustum(n))){A.modelViewMatrix.multiplyMatrices(E.matrixWorldInverse,A.matrixWorld);const U=t.update(A),z=A.material;if(Array.isArray(z)){const W=U.groups;for(let X=0,it=W.length;X<it;X++){const L=W[X],H=z[L.materialIndex];if(H&&H.visible){const k=y(A,H,I,C);A.onBeforeShadow(i,A,M,E,U,k,L),i.renderBufferDirect(E,null,U,k,A,L),A.onAfterShadow(i,A,M,E,U,k,L)}}}else if(z.visible){const W=y(A,z,I,C);A.onBeforeShadow(i,A,M,E,U,W,null),i.renderBufferDirect(E,null,U,W,A,null),A.onAfterShadow(i,A,M,E,U,W,null)}}const B=A.children;for(let U=0,z=B.length;U<z;U++)v(B[U],M,E,I,P,C)}function T(A){A.target.removeEventListener("dispose",T);for(const E in l){const I=l[E],P=A.target.uuid;P in I&&(I[P].dispose(),delete I[P])}}}function px(i,t){function e(){let O=!1;const et=new ze;let Q=null;const dt=new ze(0,0,0,0);return{setMask:function(gt){Q!==gt&&!O&&(i.colorMask(gt,gt,gt,gt),Q=gt)},setLocked:function(gt){O=gt},setClear:function(gt,j,St,Ft,st){st===!0&&(gt*=Ft,j*=Ft,St*=Ft),et.set(gt,j,St,Ft),dt.equals(et)===!1&&(i.clearColor(gt,j,St,Ft),dt.copy(et))},reset:function(){O=!1,Q=null,dt.set(-1,0,0,0)}}}function n(){let O=!1,et=!1,Q=null,dt=null,gt=null;return{setReversed:function(j){if(et!==j){const St=t.get("EXT_clip_control");j?St.clipControlEXT(St.LOWER_LEFT_EXT,St.ZERO_TO_ONE_EXT):St.clipControlEXT(St.LOWER_LEFT_EXT,St.NEGATIVE_ONE_TO_ONE_EXT),et=j;const Ft=gt;gt=null,this.setClear(Ft)}},getReversed:function(){return et},setTest:function(j){j?Mt(i.DEPTH_TEST):Ut(i.DEPTH_TEST)},setMask:function(j){Q!==j&&!O&&(i.depthMask(j),Q=j)},setFunc:function(j){if(et&&(j=cd[j]),dt!==j){switch(j){case ca:i.depthFunc(i.NEVER);break;case ha:i.depthFunc(i.ALWAYS);break;case ua:i.depthFunc(i.LESS);break;case Xs:i.depthFunc(i.LEQUAL);break;case fa:i.depthFunc(i.EQUAL);break;case da:i.depthFunc(i.GEQUAL);break;case pa:i.depthFunc(i.GREATER);break;case ma:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}dt=j}},setLocked:function(j){O=j},setClear:function(j){gt!==j&&(gt=j,et&&(j=1-j),i.clearDepth(j))},reset:function(){O=!1,Q=null,dt=null,gt=null,et=!1}}}function s(){let O=!1,et=null,Q=null,dt=null,gt=null,j=null,St=null,Ft=null,st=null;return{setTest:function(Ht){O||(Ht?Mt(i.STENCIL_TEST):Ut(i.STENCIL_TEST))},setMask:function(Ht){et!==Ht&&!O&&(i.stencilMask(Ht),et=Ht)},setFunc:function(Ht,Kt,Ct){(Q!==Ht||dt!==Kt||gt!==Ct)&&(i.stencilFunc(Ht,Kt,Ct),Q=Ht,dt=Kt,gt=Ct)},setOp:function(Ht,Kt,Ct){(j!==Ht||St!==Kt||Ft!==Ct)&&(i.stencilOp(Ht,Kt,Ct),j=Ht,St=Kt,Ft=Ct)},setLocked:function(Ht){O=Ht},setClear:function(Ht){st!==Ht&&(i.clearStencil(Ht),st=Ht)},reset:function(){O=!1,et=null,Q=null,dt=null,gt=null,j=null,St=null,Ft=null,st=null}}}const r=new e,o=new n,a=new s;let c={};const l=new WeakMap;let u={},d={},f={},h=new WeakMap,p=[],_=null,m=!1,g=null,x=null,y=null,v=null,T=null,A=null,M=null,E=new se(0,0,0),I=0,P=!1,C=null,N=null,B=null,U=null,z=null;const W=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,it=0;const L=i.getParameter(i.VERSION);L.indexOf("WebGL")!==-1?(it=parseFloat(/^WebGL (\d)/.exec(L)[1]),X=it>=1):L.indexOf("OpenGL ES")!==-1&&(it=parseFloat(/^OpenGL ES (\d)/.exec(L)[1]),X=it>=2);let H=null,k={};const at=i.getParameter(i.SCISSOR_BOX),mt=i.getParameter(i.VIEWPORT),V=new ze().fromArray(at),nt=new ze().fromArray(mt);function Et(O,et,Q,dt){const gt=new Uint8Array(4),j=i.createTexture();i.bindTexture(O,j),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let St=0;St<Q;St++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(et,0,i.RGBA,1,1,dt,0,i.RGBA,i.UNSIGNED_BYTE,gt):i.texImage2D(et+St,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,gt);return j}const Pt={};Pt[i.TEXTURE_2D]=Et(i.TEXTURE_2D,i.TEXTURE_2D,1),Pt[i.TEXTURE_CUBE_MAP]=Et(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Pt[i.TEXTURE_2D_ARRAY]=Et(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Pt[i.TEXTURE_3D]=Et(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Mt(i.DEPTH_TEST),o.setFunc(Xs),bt(!1),yt(nc),Mt(i.CULL_FACE),ht(us);function Mt(O){u[O]!==!0&&(i.enable(O),u[O]=!0)}function Ut(O){u[O]!==!1&&(i.disable(O),u[O]=!1)}function qt(O,et){return f[O]!==et?(i.bindFramebuffer(O,et),f[O]=et,O===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=et),O===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=et),!0):!1}function Ot(O,et){let Q=p,dt=!1;if(O){Q=h.get(et),Q===void 0&&(Q=[],h.set(et,Q));const gt=O.textures;if(Q.length!==gt.length||Q[0]!==i.COLOR_ATTACHMENT0){for(let j=0,St=gt.length;j<St;j++)Q[j]=i.COLOR_ATTACHMENT0+j;Q.length=gt.length,dt=!0}}else Q[0]!==i.BACK&&(Q[0]=i.BACK,dt=!0);dt&&i.drawBuffers(Q)}function Zt(O){return _!==O?(i.useProgram(O),_=O,!0):!1}const Qt={[os]:i.FUNC_ADD,[Lf]:i.FUNC_SUBTRACT,[Df]:i.FUNC_REVERSE_SUBTRACT};Qt[If]=i.MIN,Qt[Nf]=i.MAX;const $={[Uf]:i.ZERO,[Of]:i.ONE,[Ff]:i.SRC_COLOR,[Vh]:i.SRC_ALPHA,[Vf]:i.SRC_ALPHA_SATURATE,[kf]:i.DST_COLOR,[Bf]:i.DST_ALPHA,[zf]:i.ONE_MINUS_SRC_COLOR,[Wh]:i.ONE_MINUS_SRC_ALPHA,[Gf]:i.ONE_MINUS_DST_COLOR,[Hf]:i.ONE_MINUS_DST_ALPHA,[Wf]:i.CONSTANT_COLOR,[Xf]:i.ONE_MINUS_CONSTANT_COLOR,[Yf]:i.CONSTANT_ALPHA,[qf]:i.ONE_MINUS_CONSTANT_ALPHA};function ht(O,et,Q,dt,gt,j,St,Ft,st,Ht){if(O===us){m===!0&&(Ut(i.BLEND),m=!1);return}if(m===!1&&(Mt(i.BLEND),m=!0),O!==Pf){if(O!==g||Ht!==P){if((x!==os||T!==os)&&(i.blendEquation(i.FUNC_ADD),x=os,T=os),Ht)switch(O){case ks:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ic:i.blendFunc(i.ONE,i.ONE);break;case sc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case rc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:ye("WebGLState: Invalid blending: ",O);break}else switch(O){case ks:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ic:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case sc:ye("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case rc:ye("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ye("WebGLState: Invalid blending: ",O);break}y=null,v=null,A=null,M=null,E.set(0,0,0),I=0,g=O,P=Ht}return}gt=gt||et,j=j||Q,St=St||dt,(et!==x||gt!==T)&&(i.blendEquationSeparate(Qt[et],Qt[gt]),x=et,T=gt),(Q!==y||dt!==v||j!==A||St!==M)&&(i.blendFuncSeparate($[Q],$[dt],$[j],$[St]),y=Q,v=dt,A=j,M=St),(Ft.equals(E)===!1||st!==I)&&(i.blendColor(Ft.r,Ft.g,Ft.b,st),E.copy(Ft),I=st),g=O,P=!1}function ut(O,et){O.side===Ln?Ut(i.CULL_FACE):Mt(i.CULL_FACE);let Q=O.side===fn;et&&(Q=!Q),bt(Q),O.blending===ks&&O.transparent===!1?ht(us):ht(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),o.setFunc(O.depthFunc),o.setTest(O.depthTest),o.setMask(O.depthWrite),r.setMask(O.colorWrite);const dt=O.stencilWrite;a.setTest(dt),dt&&(a.setMask(O.stencilWriteMask),a.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),a.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),Bt(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?Mt(i.SAMPLE_ALPHA_TO_COVERAGE):Ut(i.SAMPLE_ALPHA_TO_COVERAGE)}function bt(O){C!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),C=O)}function yt(O){O!==Af?(Mt(i.CULL_FACE),O!==N&&(O===nc?i.cullFace(i.BACK):O===Rf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ut(i.CULL_FACE),N=O}function Jt(O){O!==B&&(X&&i.lineWidth(O),B=O)}function Bt(O,et,Q){O?(Mt(i.POLYGON_OFFSET_FILL),(U!==et||z!==Q)&&(U=et,z=Q,o.getReversed()&&(et=-et,Q=-Q),i.polygonOffset(et,Q))):Ut(i.POLYGON_OFFSET_FILL)}function he(O){O?Mt(i.SCISSOR_TEST):Ut(i.SCISSOR_TEST)}function fe(O){O===void 0&&(O=i.TEXTURE0+W-1),H!==O&&(i.activeTexture(O),H=O)}function xe(O,et,Q){Q===void 0&&(H===null?Q=i.TEXTURE0+W-1:Q=H);let dt=k[Q];dt===void 0&&(dt={type:void 0,texture:void 0},k[Q]=dt),(dt.type!==O||dt.texture!==et)&&(H!==Q&&(i.activeTexture(Q),H=Q),i.bindTexture(O,et||Pt[O]),dt.type=O,dt.texture=et)}function D(){const O=k[H];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function ct(){try{i.compressedTexImage2D(...arguments)}catch(O){ye("WebGLState:",O)}}function vt(){try{i.compressedTexImage3D(...arguments)}catch(O){ye("WebGLState:",O)}}function Xt(){try{i.texSubImage2D(...arguments)}catch(O){ye("WebGLState:",O)}}function rt(){try{i.texSubImage3D(...arguments)}catch(O){ye("WebGLState:",O)}}function $t(){try{i.compressedTexSubImage2D(...arguments)}catch(O){ye("WebGLState:",O)}}function Tt(){try{i.compressedTexSubImage3D(...arguments)}catch(O){ye("WebGLState:",O)}}function Rt(){try{i.texStorage2D(...arguments)}catch(O){ye("WebGLState:",O)}}function R(){try{i.texStorage3D(...arguments)}catch(O){ye("WebGLState:",O)}}function S(){try{i.texImage2D(...arguments)}catch(O){ye("WebGLState:",O)}}function G(){try{i.texImage3D(...arguments)}catch(O){ye("WebGLState:",O)}}function ot(O){return d[O]!==void 0?d[O]:i.getParameter(O)}function tt(O,et){d[O]!==et&&(i.pixelStorei(O,et),d[O]=et)}function _t(O){V.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),V.copy(O))}function xt(O){nt.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),nt.copy(O))}function Z(O,et){let Q=l.get(et);Q===void 0&&(Q=new WeakMap,l.set(et,Q));let dt=Q.get(O);dt===void 0&&(dt=i.getUniformBlockIndex(et,O.name),i.uniformBlockBinding(et,dt,dt),Q.set(O,dt))}function K(O,et,Q){const gt=l.get(et).get(O);c[gt]!==Q&&(i.bindBufferBase(i.UNIFORM_BUFFER,gt,Q),c[gt]=Q)}function pt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},d={},H=null,k={},f={},c={},h=new WeakMap,p=[],_=null,m=!1,g=null,x=null,y=null,v=null,T=null,A=null,M=null,E=new se(0,0,0),I=0,P=!1,C=null,N=null,B=null,U=null,z=null,V.set(0,0,i.canvas.width,i.canvas.height),nt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:Mt,disable:Ut,bindFramebuffer:qt,drawBuffers:Ot,useProgram:Zt,setBlending:ht,setMaterial:ut,setFlipSided:bt,setCullFace:yt,setLineWidth:Jt,setPolygonOffset:Bt,setScissorTest:he,activeTexture:fe,bindTexture:xe,unbindTexture:D,compressedTexImage2D:ct,compressedTexImage3D:vt,texImage2D:S,texImage3D:G,pixelStorei:tt,getParameter:ot,updateUBOMapping:Z,uniformBlockBinding:K,texStorage2D:Rt,texStorage3D:R,texSubImage2D:Xt,texSubImage3D:rt,compressedTexSubImage2D:$t,compressedTexSubImage3D:Tt,scissor:_t,viewport:xt,reset:pt}}function mx(i,t,e,n,s,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ft,u=new WeakMap,d=new Set;let f;const h=new WeakMap,p=new Set,_=new FinalizationRegistry(R=>p.delete(R));let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,S){return m?new OffscreenCanvas(R,S):to("canvas")}function x(R,S,G){let ot=1;const tt=Rt(R);if((tt.width>G||tt.height>G)&&(ot=G/Math.max(tt.width,tt.height)),ot<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const _t=Math.floor(ot*tt.width),xt=Math.floor(ot*tt.height);f===void 0&&(f=g(_t,xt));const Z=S?g(_t,xt):f;return Z.width=_t,Z.height=xt,Z.getContext("2d").drawImage(R,0,0,_t,xt),te("WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+_t+"x"+xt+")."),Z}else return"data"in R&&te("WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),R;return R}function y(R){return R.generateMipmaps}function v(R){i.generateMipmap(R)}function T(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function A(R,S,G,ot,tt,_t=!1){if(R!==null){if(i[R]!==void 0)return i[R];te("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let xt;ot&&(xt=t.get("EXT_texture_norm16"),xt||te("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=S;if(S===i.RED&&(G===i.FLOAT&&(Z=i.R32F),G===i.HALF_FLOAT&&(Z=i.R16F),G===i.UNSIGNED_BYTE&&(Z=i.R8),G===i.UNSIGNED_SHORT&&xt&&(Z=xt.R16_EXT),G===i.SHORT&&xt&&(Z=xt.R16_SNORM_EXT)),S===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(Z=i.R8UI),G===i.UNSIGNED_SHORT&&(Z=i.R16UI),G===i.UNSIGNED_INT&&(Z=i.R32UI),G===i.BYTE&&(Z=i.R8I),G===i.SHORT&&(Z=i.R16I),G===i.INT&&(Z=i.R32I)),S===i.RG&&(G===i.FLOAT&&(Z=i.RG32F),G===i.HALF_FLOAT&&(Z=i.RG16F),G===i.UNSIGNED_BYTE&&(Z=i.RG8),G===i.UNSIGNED_SHORT&&xt&&(Z=xt.RG16_EXT),G===i.SHORT&&xt&&(Z=xt.RG16_SNORM_EXT)),S===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(Z=i.RG8UI),G===i.UNSIGNED_SHORT&&(Z=i.RG16UI),G===i.UNSIGNED_INT&&(Z=i.RG32UI),G===i.BYTE&&(Z=i.RG8I),G===i.SHORT&&(Z=i.RG16I),G===i.INT&&(Z=i.RG32I)),S===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&(Z=i.RGB8UI),G===i.UNSIGNED_SHORT&&(Z=i.RGB16UI),G===i.UNSIGNED_INT&&(Z=i.RGB32UI),G===i.BYTE&&(Z=i.RGB8I),G===i.SHORT&&(Z=i.RGB16I),G===i.INT&&(Z=i.RGB32I)),S===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&(Z=i.RGBA8UI),G===i.UNSIGNED_SHORT&&(Z=i.RGBA16UI),G===i.UNSIGNED_INT&&(Z=i.RGBA32UI),G===i.BYTE&&(Z=i.RGBA8I),G===i.SHORT&&(Z=i.RGBA16I),G===i.INT&&(Z=i.RGBA32I)),S===i.RGB&&(G===i.UNSIGNED_SHORT&&xt&&(Z=xt.RGB16_EXT),G===i.SHORT&&xt&&(Z=xt.RGB16_SNORM_EXT),G===i.UNSIGNED_INT_5_9_9_9_REV&&(Z=i.RGB9_E5),G===i.UNSIGNED_INT_10F_11F_11F_REV&&(Z=i.R11F_G11F_B10F)),S===i.RGBA){const K=_t?jr:ve.getTransfer(tt);G===i.FLOAT&&(Z=i.RGBA32F),G===i.HALF_FLOAT&&(Z=i.RGBA16F),G===i.UNSIGNED_BYTE&&(Z=K===Re?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT&&xt&&(Z=xt.RGBA16_EXT),G===i.SHORT&&xt&&(Z=xt.RGBA16_SNORM_EXT),G===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function M(R,S){let G;return R?S===null||S===qn||S===_s?G=i.DEPTH24_STENCIL8:S===In?G=i.DEPTH32F_STENCIL8:S===qs&&(G=i.DEPTH24_STENCIL8,te("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===qn||S===_s?G=i.DEPTH_COMPONENT24:S===In?G=i.DEPTH_COMPONENT32F:S===qs&&(G=i.DEPTH_COMPONENT16),G}function E(R,S){return y(R)===!0||R.isFramebufferTexture&&R.minFilter!==nn&&R.minFilter!==gn?Math.log2(Math.max(S.width,S.height))+1:R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?S.mipmaps.length:1}function I(R){const S=new WeakRef(R);n.get(R).__ref=S,p.add(S),_.register(R,S,S)}function P(R){const S=n.get(R).__ref;S!==void 0&&(p.delete(S),_.unregister(S))}function C(R){B(R.target)}function N(R){U(R.target)}function B(R){R.removeEventListener("dispose",C),P(R),W(R),R.isVideoTexture&&u.delete(R),R.isHTMLTexture&&d.delete(R)}function U(R){R.removeEventListener("dispose",N),P(R),it(R)}function z(){for(const R of p){const S=R.deref();S!==void 0&&(S.isRenderTarget===!0?U(S):B(S))}p.clear(),d.clear()}function W(R){const S=n.get(R);if(S.__webglInit===void 0)return;const G=R.source,ot=h.get(G);if(ot){const tt=ot[S.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&X(R),Object.keys(ot).length===0&&h.delete(G)}n.remove(R)}function X(R){const S=n.get(R);i.deleteTexture(S.__webglTexture);const G=R.source,ot=h.get(G);delete ot[S.__cacheKey],o.memory.textures--}function it(R){const S=n.get(R);S.__depthDisposeCallback&&S.__depthDisposeCallback();const G=R.depthTexture;if(G&&G.renderTarget===R&&B(G),R.isWebGLCubeRenderTarget)for(let tt=0;tt<6;tt++){if(Array.isArray(S.__webglFramebuffer[tt]))for(let _t=0;_t<S.__webglFramebuffer[tt].length;_t++)i.deleteFramebuffer(S.__webglFramebuffer[tt][_t]);else i.deleteFramebuffer(S.__webglFramebuffer[tt]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[tt])}else{if(Array.isArray(S.__webglFramebuffer))for(let tt=0;tt<S.__webglFramebuffer.length;tt++)i.deleteFramebuffer(S.__webglFramebuffer[tt]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let tt=0;tt<S.__webglColorRenderbuffer.length;tt++)S.__webglColorRenderbuffer[tt]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[tt]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const ot=R.textures;for(let tt=0,_t=ot.length;tt<_t;tt++){const xt=n.get(ot[tt]);xt.__webglTexture&&(i.deleteTexture(xt.__webglTexture),o.memory.textures--),n.remove(ot[tt])}n.remove(R)}let L=0;function H(){L=0}function k(){return L}function at(R){L=R}function mt(){const R=L;return R>=s.maxTextures&&te("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),L+=1,R}function V(R){const S=[];return S.push(R.wrapS),S.push(R.wrapT),S.push(R.wrapR||0),S.push(R.magFilter),S.push(R.minFilter),S.push(R.anisotropy),S.push(R.internalFormat),S.push(R.format),S.push(R.type),S.push(R.generateMipmaps),S.push(R.mipmapsAutoUpdate),S.push(R.premultiplyAlpha),S.push(R.flipY),S.push(R.unpackAlignment),S.push(R.colorSpace),S.join()}function nt(R,S){const G=n.get(R);if(R.isVideoTexture&&$t(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&G.__version!==R.version){const ot=R.image;if(ot===null)te("WebGLRenderer: Texture marked for update but no image data found.");else if(ot.complete===!1)te("WebGLRenderer: Texture marked for update but image is incomplete");else{ut(G,R,S);return}}else R.isExternalTexture&&(G.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+S)}function Et(R,S){const G=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){ut(G,R,S);return}else R.isExternalTexture&&(G.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+S)}function Pt(R,S){const G=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){ut(G,R,S);return}e.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+S)}function Mt(R,S){const G=n.get(R);if(R.version>0&&G.__version!==R.version){bt(G,R,S);return}e.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+S)}const Ut={[ga]:i.REPEAT,[oi]:i.CLAMP_TO_EDGE,[_a]:i.MIRRORED_REPEAT},qt={[nn]:i.NEAREST,[Jf]:i.NEAREST_MIPMAP_NEAREST,[lr]:i.NEAREST_MIPMAP_LINEAR,[gn]:i.LINEAR,[bo]:i.LINEAR_MIPMAP_NEAREST,[Mi]:i.LINEAR_MIPMAP_LINEAR},Ot={[td]:i.NEVER,[ou]:i.ALWAYS,[ed]:i.LESS,[su]:i.LEQUAL,[nd]:i.EQUAL,[ru]:i.GEQUAL,[id]:i.GREATER,[sd]:i.NOTEQUAL};function Zt(R,S){if(S.type===In&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===gn||S.magFilter===bo||S.magFilter===lr||S.magFilter===Mi||S.minFilter===gn||S.minFilter===bo||S.minFilter===lr||S.minFilter===Mi)&&te("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,Ut[S.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,Ut[S.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,Ut[S.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,qt[S.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,qt[S.minFilter]),S.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,Ot[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===nn||S.minFilter!==lr&&S.minFilter!==Mi||S.type===In&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const G=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function Qt(R,S){let G=!1;R.__webglInit===void 0&&(R.__webglInit=!0,S.addEventListener("dispose",C),I(S));const ot=S.source;let tt=h.get(ot);tt===void 0&&(tt={},h.set(ot,tt));const _t=V(S);if(_t!==R.__cacheKey){tt[_t]===void 0&&(tt[_t]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,G=!0),tt[_t].usedTimes++;const xt=tt[R.__cacheKey];xt!==void 0&&(tt[R.__cacheKey].usedTimes--,xt.usedTimes===0&&X(S)),R.__cacheKey=_t,R.__webglTexture=tt[_t].texture}return G}function $(R,S,G){return Math.floor(Math.floor(R/G)/S)}function ht(R,S,G,ot){const _t=R.updateRanges;if(_t.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,S.width,S.height,G,ot,S.data);else{_t.sort((O,et)=>O.start-et.start);let xt=0;for(let O=1;O<_t.length;O++){const et=_t[xt],Q=_t[O],dt=et.start+et.count,gt=$(Q.start,S.width,4),j=$(et.start,S.width,4);Q.start<=dt+1&&gt===j&&$(Q.start+Q.count-1,S.width,4)===gt?et.count=Math.max(et.count,Q.start+Q.count-et.start):(++xt,_t[xt]=Q)}_t.length=xt+1;const Z=e.getParameter(i.UNPACK_ROW_LENGTH),K=e.getParameter(i.UNPACK_SKIP_PIXELS),pt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,S.width);for(let O=0,et=_t.length;O<et;O++){const Q=_t[O],dt=Math.floor(Q.start/4),gt=Math.ceil(Q.count/4),j=dt%S.width,St=Math.floor(dt/S.width),Ft=gt,st=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,j),e.pixelStorei(i.UNPACK_SKIP_ROWS,St),e.texSubImage2D(i.TEXTURE_2D,0,j,St,Ft,st,G,ot,S.data)}R.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,Z),e.pixelStorei(i.UNPACK_SKIP_PIXELS,K),e.pixelStorei(i.UNPACK_SKIP_ROWS,pt)}}function ut(R,S,G){let ot=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(ot=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(ot=i.TEXTURE_3D);const tt=Qt(R,S),_t=S.source;e.bindTexture(ot,R.__webglTexture,i.TEXTURE0+G);const xt=n.get(_t);if(_t.version!==xt.__version||tt===!0){if(e.activeTexture(i.TEXTURE0+G),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){const st=ve.getPrimaries(ve.workingColorSpace),Ht=S.colorSpace===vi?null:ve.getPrimaries(S.colorSpace),Kt=S.colorSpace===vi||st===Ht?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Kt)}e.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment);let K=x(S.image,!1,s.maxTextureSize);K=Tt(S,K);const pt=r.convert(S.format,S.colorSpace),O=r.convert(S.type);let et=A(S.internalFormat,pt,O,S.normalized,S.colorSpace,S.isVideoTexture);Zt(ot,S);let Q;const dt=S.mipmaps,gt=S.isVideoTexture!==!0,j=xt.__version===void 0||tt===!0,St=_t.dataReady,Ft=E(S,K);if(S.isDepthTexture)et=M(S.format===yi,S.type),j&&(gt?e.texStorage2D(i.TEXTURE_2D,1,et,K.width,K.height):e.texImage2D(i.TEXTURE_2D,0,et,K.width,K.height,0,pt,O,null));else if(S.isDataTexture)if(dt.length>0){gt&&j&&e.texStorage2D(i.TEXTURE_2D,Ft,et,dt[0].width,dt[0].height);for(let st=0,Ht=dt.length;st<Ht;st++)Q=dt[st],gt?St&&e.texSubImage2D(i.TEXTURE_2D,st,0,0,Q.width,Q.height,pt,O,Q.data):e.texImage2D(i.TEXTURE_2D,st,et,Q.width,Q.height,0,pt,O,Q.data);S.generateMipmaps=!1}else gt?(j&&e.texStorage2D(i.TEXTURE_2D,Ft,et,K.width,K.height),St&&ht(S,K,pt,O)):e.texImage2D(i.TEXTURE_2D,0,et,K.width,K.height,0,pt,O,K.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){gt&&j&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Ft,et,dt[0].width,dt[0].height,K.depth);for(let st=0,Ht=dt.length;st<Ht;st++)if(Q=dt[st],S.format!==Gn)if(pt!==null)if(gt){if(St)if(S.layerUpdates.size>0){const Kt=Yc(Q.width,Q.height,S.format,S.type);for(const Ct of S.layerUpdates){const de=Q.data.subarray(Ct*Kt/Q.data.BYTES_PER_ELEMENT,(Ct+1)*Kt/Q.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,Ct,Q.width,Q.height,1,pt,de)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,0,Q.width,Q.height,K.depth,pt,Q.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,st,et,Q.width,Q.height,K.depth,0,Q.data,0,0);else te("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else gt?St&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,0,Q.width,Q.height,K.depth,pt,O,Q.data):e.texImage3D(i.TEXTURE_2D_ARRAY,st,et,Q.width,Q.height,K.depth,0,pt,O,Q.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{gt&&j&&e.texStorage2D(i.TEXTURE_2D,Ft,et,dt[0].width,dt[0].height);for(let st=0,Ht=dt.length;st<Ht;st++)Q=dt[st],S.format!==Gn?pt!==null?gt?St&&e.compressedTexSubImage2D(i.TEXTURE_2D,st,0,0,Q.width,Q.height,pt,Q.data):e.compressedTexImage2D(i.TEXTURE_2D,st,et,Q.width,Q.height,0,Q.data):te("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):gt?St&&e.texSubImage2D(i.TEXTURE_2D,st,0,0,Q.width,Q.height,pt,O,Q.data):e.texImage2D(i.TEXTURE_2D,st,et,Q.width,Q.height,0,pt,O,Q.data)}else if(S.isDataArrayTexture)if(gt){if(j&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Ft,et,K.width,K.height,K.depth),St)if(S.layerUpdates.size>0){const st=Yc(K.width,K.height,S.format,S.type);for(const Ht of S.layerUpdates){const Kt=K.data.subarray(Ht*st/K.data.BYTES_PER_ELEMENT,(Ht+1)*st/K.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ht,K.width,K.height,1,pt,O,Kt)}S.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,pt,O,K.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,et,K.width,K.height,K.depth,0,pt,O,K.data);else if(S.isData3DTexture)gt?(j&&e.texStorage3D(i.TEXTURE_3D,Ft,et,K.width,K.height,K.depth),St&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,pt,O,K.data)):e.texImage3D(i.TEXTURE_3D,0,et,K.width,K.height,K.depth,0,pt,O,K.data);else if(S.isFramebufferTexture){if(j)if(gt)e.texStorage2D(i.TEXTURE_2D,Ft,et,K.width,K.height);else{let st=K.width,Ht=K.height;for(let Kt=0;Kt<Ft;Kt++)e.texImage2D(i.TEXTURE_2D,Kt,et,st,Ht,0,pt,O,null),st>>=1,Ht>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in i){const st=i.canvas;if(st.hasAttribute("layoutsubtree")||st.setAttribute("layoutsubtree","true"),K.parentNode!==st){st.appendChild(K),d.add(S),st.onpaint=Ht=>{const Kt=Ht.changedElements;for(const Ct of d)Kt.includes(Ct.image)&&(Ct.needsUpdate=!0)},st.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,K);else{const Kt=i.RGBA,Ct=i.RGBA,de=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Kt,Ct,de,K)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(dt.length>0){if(gt&&j){const st=Rt(dt[0]);e.texStorage2D(i.TEXTURE_2D,Ft,et,st.width,st.height)}for(let st=0,Ht=dt.length;st<Ht;st++)Q=dt[st],gt?St&&e.texSubImage2D(i.TEXTURE_2D,st,0,0,pt,O,Q):e.texImage2D(i.TEXTURE_2D,st,et,pt,O,Q);S.generateMipmaps=!1}else if(gt){if(j){const st=Rt(K);e.texStorage2D(i.TEXTURE_2D,Ft,et,st.width,st.height)}St&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,pt,O,K)}else e.texImage2D(i.TEXTURE_2D,0,et,pt,O,K);y(S)&&S.mipmapsAutoUpdate===!0&&v(ot),xt.__version=_t.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function bt(R,S,G){if(S.image.length!==6)return;const ot=Qt(R,S),tt=S.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+G);const _t=n.get(tt);if(tt.version!==_t.__version||ot===!0){e.activeTexture(i.TEXTURE0+G);const xt=ve.getPrimaries(ve.workingColorSpace),Z=S.colorSpace===vi?null:ve.getPrimaries(S.colorSpace),K=S.colorSpace===vi||xt===Z?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);const pt=S.isCompressedTexture||S.image[0].isCompressedTexture,O=S.image[0]&&S.image[0].isDataTexture,et=[];for(let Ct=0;Ct<6;Ct++)!pt&&!O?et[Ct]=x(S.image[Ct],!0,s.maxCubemapSize):et[Ct]=O?S.image[Ct].image:S.image[Ct],et[Ct]=Tt(S,et[Ct]);const Q=et[0],dt=r.convert(S.format,S.colorSpace),gt=r.convert(S.type);let j=A(S.internalFormat,dt,gt,S.normalized,S.colorSpace);const St=S.isVideoTexture!==!0,Ft=_t.__version===void 0||ot===!0,st=tt.dataReady;let Ht=E(S,Q);Zt(i.TEXTURE_CUBE_MAP,S);let Kt;if(S.isDepthTexture){if(j=M(S.format===yi,S.type),Ft)if(St)e.texStorage2D(i.TEXTURE_CUBE_MAP,1,j,Q.width,Q.height);else for(let Ct=0;Ct<6;Ct++)e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0,j,Q.width,Q.height,0,dt,gt,null)}else if(pt){St&&Ft&&e.texStorage2D(i.TEXTURE_CUBE_MAP,Ht,j,Q.width,Q.height);for(let Ct=0;Ct<6;Ct++){Kt=et[Ct].mipmaps;for(let de=0;de<Kt.length;de++){const Ie=Kt[de];S.format!==Gn?dt!==null?St?st&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de,0,0,Ie.width,Ie.height,dt,Ie.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de,j,Ie.width,Ie.height,0,Ie.data):te("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):St?st&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de,0,0,Ie.width,Ie.height,dt,gt,Ie.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de,j,Ie.width,Ie.height,0,dt,gt,Ie.data)}}}else{if(Kt=S.mipmaps,St&&Ft){Kt.length>0&&Ht++;const Ct=Rt(et[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,Ht,j,Ct.width,Ct.height)}for(let Ct=0;Ct<6;Ct++)if(O){St?st&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0,0,0,et[Ct].width,et[Ct].height,dt,gt,et[Ct].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0,j,et[Ct].width,et[Ct].height,0,dt,gt,et[Ct].data);for(let de=0;de<Kt.length;de++){const zt=Kt[de].image[Ct].image;St?st&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de+1,0,0,zt.width,zt.height,dt,gt,zt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de+1,j,zt.width,zt.height,0,dt,gt,zt.data)}}else{St?st&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0,0,0,dt,gt,et[Ct]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0,j,dt,gt,et[Ct]);for(let de=0;de<Kt.length;de++){const Ie=Kt[de];St?st&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de+1,0,0,dt,gt,Ie.image[Ct]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de+1,j,dt,gt,Ie.image[Ct])}}}y(S)&&S.mipmapsAutoUpdate===!0&&v(i.TEXTURE_CUBE_MAP),_t.__version=tt.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function yt(R,S,G,ot,tt,_t){const xt=r.convert(G.format,G.colorSpace),Z=r.convert(G.type),K=A(G.internalFormat,xt,Z,G.normalized,G.colorSpace),pt=n.get(S),O=n.get(G);if(O.__renderTarget=S,!pt.__hasExternalTextures){const et=Math.max(1,S.width>>_t),Q=Math.max(1,S.height>>_t);tt===i.TEXTURE_3D||tt===i.TEXTURE_2D_ARRAY?e.texImage3D(tt,_t,K,et,Q,S.depth,0,xt,Z,null):e.texImage2D(tt,_t,K,et,Q,0,xt,Z,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),rt(S)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ot,tt,O.__webglTexture,0,Xt(S)):(tt===i.TEXTURE_2D||tt>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,ot,tt,O.__webglTexture,_t),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Jt(R,S,G){if(i.bindRenderbuffer(i.RENDERBUFFER,R),S.depthBuffer){const ot=S.depthTexture,tt=ot&&ot.isDepthTexture?ot.type:null,_t=M(S.stencilBuffer,tt),xt=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;rt(S)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Xt(S),_t,S.width,S.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Xt(S),_t,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,_t,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,xt,i.RENDERBUFFER,R)}else{const ot=S.textures;for(let tt=0;tt<ot.length;tt++){const _t=ot[tt],xt=r.convert(_t.format,_t.colorSpace),Z=r.convert(_t.type),K=A(_t.internalFormat,xt,Z,_t.normalized,_t.colorSpace);rt(S)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Xt(S),K,S.width,S.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Xt(S),K,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,K,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Bt(R,S,G){const ot=S.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const tt=n.get(S.depthTexture);tt.__renderTarget=S;const _t=ot?S.depthTexture.image[0]:S.depthTexture.image;(!tt.__webglTexture||_t.width!==S.width||_t.height!==S.height)&&(_t.width=S.width,_t.height=S.height,S.depthTexture.needsUpdate=!0),ot?Mt(S.depthTexture,0):nt(S.depthTexture,0);const xt=tt.__webglTexture,Z=Xt(S),K=ot?i.TEXTURE_CUBE_MAP_POSITIVE_X+G:i.TEXTURE_2D,pt=S.depthTexture.format===yi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(S.depthTexture.format===Ei)rt(S)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,pt,K,xt,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,pt,K,xt,0);else if(S.depthTexture.format===yi)rt(S)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,pt,K,xt,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,pt,K,xt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function he(R){const S=n.get(R),G=R.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==R.depthTexture){const ot=R.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),ot){const tt=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,ot.removeEventListener("dispose",tt)};ot.addEventListener("dispose",tt),S.__depthDisposeCallback=tt}S.__boundDepthTexture=ot}if(R.depthTexture&&!S.__autoAllocateDepthBuffer)if(G)for(let ot=0;ot<6;ot++)Bt(S.__webglFramebuffer[ot],R,ot);else R.texture.mipmaps.length>0?Bt(S.__webglFramebuffer[0],R,0):Bt(S.__webglFramebuffer,R,0);else if(G){S.__webglDepthbuffer=[];for(let ot=0;ot<6;ot++)if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[ot]),S.__webglDepthbuffer[ot]===void 0)S.__webglDepthbuffer[ot]=i.createRenderbuffer(),Jt(S.__webglDepthbuffer[ot],R,!1);else{const tt=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_t=S.__webglDepthbuffer[ot];i.bindRenderbuffer(i.RENDERBUFFER,_t),i.framebufferRenderbuffer(i.FRAMEBUFFER,tt,i.RENDERBUFFER,_t)}}else if(R.texture.mipmaps.length>0?e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),Jt(S.__webglDepthbuffer,R,!1);else{const tt=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_t=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,_t),i.framebufferRenderbuffer(i.FRAMEBUFFER,tt,i.RENDERBUFFER,_t)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function fe(R,S,G){const ot=n.get(R);S!==void 0&&yt(ot.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&he(R)}function xe(R){const S=R.texture,G=n.get(R),ot=n.get(S);R.addEventListener("dispose",N),I(R);const tt=R.textures,_t=R.isWebGLCubeRenderTarget===!0,xt=tt.length>1;if(xt||(ot.__webglTexture===void 0&&(ot.__webglTexture=i.createTexture()),ot.__version=S.version,o.memory.textures++),_t){G.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(S.mipmaps.length>0){G.__webglFramebuffer[Z]=[];for(let K=0;K<S.mipmaps.length;K++)G.__webglFramebuffer[Z][K]=i.createFramebuffer()}else G.__webglFramebuffer[Z]=i.createFramebuffer()}else{if(S.mipmaps.length>0){G.__webglFramebuffer=[];for(let Z=0;Z<S.mipmaps.length;Z++)G.__webglFramebuffer[Z]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(xt)for(let Z=0,K=tt.length;Z<K;Z++){const pt=n.get(tt[Z]);pt.__webglTexture===void 0&&(pt.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&rt(R)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let Z=0;Z<tt.length;Z++){const K=tt[Z];G.__webglColorRenderbuffer[Z]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[Z]);const pt=r.convert(K.format,K.colorSpace),O=r.convert(K.type),et=A(K.internalFormat,pt,O,K.normalized,K.colorSpace,R.isXRRenderTarget===!0),Q=Xt(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,Q,et,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Z,i.RENDERBUFFER,G.__webglColorRenderbuffer[Z])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),Jt(G.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(_t){e.bindTexture(i.TEXTURE_CUBE_MAP,ot.__webglTexture),Zt(i.TEXTURE_CUBE_MAP,S);for(let Z=0;Z<6;Z++)if(S.mipmaps.length>0)for(let K=0;K<S.mipmaps.length;K++)yt(G.__webglFramebuffer[Z][K],R,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,K);else yt(G.__webglFramebuffer[Z],R,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);y(S)?v(i.TEXTURE_CUBE_MAP):S.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),e.unbindTexture()}else if(xt){for(let Z=0,K=tt.length;Z<K;Z++){const pt=tt[Z],O=n.get(pt);let et=i.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(et=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(et,O.__webglTexture),Zt(et,pt),yt(G.__webglFramebuffer,R,pt,i.COLOR_ATTACHMENT0+Z,et,0),y(pt)&&v(et)}e.unbindTexture()}else{let Z=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Z=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Z,ot.__webglTexture),Zt(Z,S),S.mipmaps.length>0)for(let K=0;K<S.mipmaps.length;K++)yt(G.__webglFramebuffer[K],R,S,i.COLOR_ATTACHMENT0,Z,K);else yt(G.__webglFramebuffer,R,S,i.COLOR_ATTACHMENT0,Z,0);y(S)?v(Z):S.mipmaps.length>0&&i.texParameteri(Z,i.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),e.unbindTexture()}R.depthBuffer&&he(R)}function D(R){const S=R.textures;for(let G=0,ot=S.length;G<ot;G++){const tt=S[G];if(y(tt)&&tt.mipmapsAutoUpdate===!0){const _t=T(R),xt=n.get(tt).__webglTexture;e.bindTexture(_t,xt),v(_t),e.unbindTexture()}}}const ct=[];function vt(R){if(R.samples>0){if(rt(R)===!1){const S=R.textures,G=R.width,ot=R.height;let tt=i.COLOR_BUFFER_BIT;const _t=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xt=n.get(R),Z=S.length>1;if(Z)for(let pt=0;pt<S.length;pt++)e.bindFramebuffer(i.FRAMEBUFFER,xt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,xt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,xt.__webglMultisampledFramebuffer),R.texture.mipmaps.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,xt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,xt.__webglFramebuffer);for(let pt=0;pt<S.length;pt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(tt|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(tt|=i.STENCIL_BUFFER_BIT)),Z){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,xt.__webglColorRenderbuffer[pt]);const O=n.get(S[pt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,O,0)}i.blitFramebuffer(0,0,G,ot,0,0,G,ot,tt,i.NEAREST),c===!0&&(ct.length=0,ct.push(i.COLOR_ATTACHMENT0+pt),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&ct.push(_t),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ct))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Z)for(let pt=0;pt<S.length;pt++){e.bindFramebuffer(i.FRAMEBUFFER,xt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.RENDERBUFFER,xt.__webglColorRenderbuffer[pt]);const O=n.get(S[pt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,xt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.TEXTURE_2D,O,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,xt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&c){const S=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function Xt(R){return Math.min(s.maxSamples,R.samples)}function rt(R){const S=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function $t(R){const S=o.render.frame;u.get(R)!==S&&(u.set(R,S),R.update())}function Tt(R,S){const G=R.colorSpace,ot=R.format,tt=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||G!==Qr&&G!==vi&&(ve.getTransfer(G)===Re?(ot!==Gn||tt!==yn)&&te("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ye("WebGLTextures: Unsupported texture color space:",G)),S}function Rt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=mt,this.resetTextureUnits=H,this.getTextureUnits=k,this.setTextureUnits=at,this.setTexture2D=nt,this.setTexture2DArray=Et,this.setTexture3D=Pt,this.setTextureCube=Mt,this.rebindTextures=fe,this.setupRenderTarget=xe,this.updateRenderTargetMipmap=D,this.updateMultisampleRenderTarget=vt,this.setupDepthRenderbuffer=he,this.setupFrameBufferTexture=yt,this.useMultisampledRTT=rt,this.dispose=z}function gx(i,t){function e(n,s=vi){let r;const o=ve.getTransfer(s);if(n===yn)return i.UNSIGNED_BYTE;if(n===_l)return i.UNSIGNED_SHORT_4_4_4_4;if(n===xl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===tu)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===eu)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Qh)return i.BYTE;if(n===jh)return i.SHORT;if(n===qs)return i.UNSIGNED_SHORT;if(n===gl)return i.INT;if(n===qn)return i.UNSIGNED_INT;if(n===In)return i.FLOAT;if(n===Zn)return i.HALF_FLOAT;if(n===nu)return i.ALPHA;if(n===iu)return i.RGB;if(n===Gn)return i.RGBA;if(n===Ei)return i.DEPTH_COMPONENT;if(n===yi)return i.DEPTH_STENCIL;if(n===vl)return i.RED;if(n===Ml)return i.RED_INTEGER;if(n===Fi)return i.RG;if(n===yl)return i.RG_INTEGER;if(n===Sl)return i.RGBA_INTEGER;if(n===Br||n===Hr||n===kr||n===Gr)if(o===Re)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Br)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Hr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Gr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Br)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Hr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===kr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Gr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===xa||n===va||n===Ma||n===ya)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===xa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===va)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ma)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ya)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Sa||n===Ea||n===ba||n===wa||n===Ta||n===Kr||n===Aa)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Sa||n===Ea)return o===Re?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ba)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===wa)return r.COMPRESSED_R11_EAC;if(n===Ta)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Kr)return r.COMPRESSED_RG11_EAC;if(n===Aa)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ra||n===Ca||n===Pa||n===La||n===Da||n===Ia||n===Na||n===Ua||n===Oa||n===Fa||n===za||n===Ba||n===Ha||n===ka)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ra)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ca)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Pa)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===La)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Da)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ia)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Na)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ua)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Oa)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Fa)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===za)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ba)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ha)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ka)return o===Re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ga||n===Va||n===Wa)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Ga)return o===Re?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Va)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Wa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Xa||n===Ya||n===Jr||n===qa)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Xa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ya)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Jr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===qa)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===_s?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}const _x=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,xx=`
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

}`;class vx{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){const n=new gu(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Bi({vertexShader:_x,fragmentShader:xx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Te(new go(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Mx extends wi{constructor(t,e){super();const n=this;let s=null,r=1,o=null,a="local-floor",c=1,l=null,u=null,d=null,f=null,h=null,p=null;const _=typeof XRWebGLBinding<"u",m=new vx,g={},x=e.getContextAttributes();let y=null,v=null;const T=[],A=[],M=new ft;let E=null,I=null;const P=new Mn;P.viewport=new ze;const C=new Mn;C.viewport=new ze;const N=[P,C],B=new Lp;let U=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(V){let nt=T[V];return nt===void 0&&(nt=new Do,T[V]=nt),nt.getTargetRaySpace()},this.getControllerGrip=function(V){let nt=T[V];return nt===void 0&&(nt=new Do,T[V]=nt),nt.getGripSpace()},this.getHand=function(V){let nt=T[V];return nt===void 0&&(nt=new Do,T[V]=nt),nt.getHandSpace()};function W(V){const nt=A.indexOf(V.inputSource);if(nt===-1)return;const Et=T[nt];Et!==void 0&&(Et.update(V.inputSource,V.frame,l||o),Et.dispatchEvent({type:V.type,data:V.inputSource}))}function X(){s.removeEventListener("select",W),s.removeEventListener("selectstart",W),s.removeEventListener("selectend",W),s.removeEventListener("squeeze",W),s.removeEventListener("squeezestart",W),s.removeEventListener("squeezeend",W),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",it);for(let V=0;V<T.length;V++){const nt=A[V];nt!==null&&(A[V]=null,T[V].disconnect(nt))}U=null,z=null,m.reset();for(const V in g)delete g[V];if(t.setRenderTarget(y),h=null,f=null,d=null,s=null,v=null,mt.stop(),n.isPresenting=!1,t.setPixelRatio(E),t.setSize(M.width,M.height,!1),I!==null){const V=I.camera;V.fov=I.fov,V.zoom=I.zoom,V.updateProjectionMatrix(),I=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(V){r=V,n.isPresenting===!0&&te("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(V){a=V,n.isPresenting===!0&&te("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(V){l=V},this.getBaseLayer=function(){return f!==null?f:h},this.getBinding=function(){return d===null&&_&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(V){if(s=V,s!==null){if(y=t.getRenderTarget(),s.addEventListener("select",W),s.addEventListener("selectstart",W),s.addEventListener("selectend",W),s.addEventListener("squeeze",W),s.addEventListener("squeezestart",W),s.addEventListener("squeezeend",W),s.addEventListener("end",X),s.addEventListener("inputsourceschange",it),x.xrCompatible!==!0&&await e.makeXRCompatible(),E=t.getPixelRatio(),t.getSize(M),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Et=null,Pt=null,Mt=null;x.depth&&(Mt=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Et=x.stencil?yi:Ei,Pt=x.stencil?_s:qn);const Ut={colorFormat:e.RGBA8,depthFormat:Mt,scaleFactor:r};d=this.getBinding(),f=d.createProjectionLayer(Ut),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),v=new Yn(f.textureWidth,f.textureHeight,{format:Gn,type:yn,depthTexture:new xs(f.textureWidth,f.textureHeight,Pt,void 0,void 0,void 0,void 0,void 0,void 0,Et),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{const Et={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};h=new XRWebGLLayer(s,e,Et),s.updateRenderState({baseLayer:h}),t.setPixelRatio(1),t.setSize(h.framebufferWidth,h.framebufferHeight,!1),v=new Yn(h.framebufferWidth,h.framebufferHeight,{format:Gn,type:yn,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),mt.setContext(s),mt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function it(V){for(let nt=0;nt<V.removed.length;nt++){const Et=V.removed[nt],Pt=A.indexOf(Et);Pt>=0&&(A[Pt]=null,T[Pt].disconnect(Et))}for(let nt=0;nt<V.added.length;nt++){const Et=V.added[nt];let Pt=A.indexOf(Et);if(Pt===-1){for(let Ut=0;Ut<T.length;Ut++)if(Ut>=A.length){A.push(Et),Pt=Ut;break}else if(A[Ut]===null){A[Ut]=Et,Pt=Ut;break}if(Pt===-1)break}const Mt=T[Pt];Mt&&Mt.connect(Et)}}function L(V,nt){nt===null?V.matrixWorld.copy(V.matrix):V.matrixWorld.multiplyMatrices(nt.matrixWorld,V.matrix),V.matrixWorldInverse.copy(V.matrixWorld).invert()}this.updateCamera=function(V){if(s===null)return;let nt=V.near,Et=V.far;m.texture!==null&&(m.depthNear>0&&(nt=m.depthNear),m.depthFar>0&&(Et=m.depthFar)),B.near=C.near=P.near=nt,B.far=C.far=P.far=Et,(U!==B.near||z!==B.far)&&(s.updateRenderState({depthNear:B.near,depthFar:B.far}),U=B.near,z=B.far),B.layers.mask=V.layers.mask|6,P.layers.mask=B.layers.mask&-5,C.layers.mask=B.layers.mask&-3;const Pt=V.parent,Mt=B.cameras;L(B,Pt);for(let Ut=0;Ut<Mt.length;Ut++)L(Mt[Ut],Pt);B.projectionMatrix.copy(P.projectionMatrix),B.projectionMatrixInverse.copy(P.projectionMatrixInverse),I===null&&V.isPerspectiveCamera&&(I={camera:V,fov:V.fov,zoom:V.zoom}),H(V,B,Pt)};function H(V,nt,Et){Et===null?V.matrix.copy(nt.matrixWorld):(V.matrix.copy(Et.matrixWorld),V.matrix.invert(),V.matrix.multiply(nt.matrixWorld)),V.matrix.decompose(V.position,V.quaternion,V.scale),V.updateMatrixWorld(!0),V.projectionMatrix.copy(nt.projectionMatrix),V.projectionMatrixInverse.copy(nt.projectionMatrixInverse),V.isPerspectiveCamera&&(V.fov=Za*2*Math.atan(1/V.projectionMatrix.elements[5]),V.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(f===null&&h===null))return c},this.setFoveation=function(V){c=V,f!==null&&(f.fixedFoveation=V),h!==null&&h.fixedFoveation!==void 0&&(h.fixedFoveation=V)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(B)},this.getCameraTexture=function(V){return g[V]};let k=null;function at(V,nt){if(u=nt.getViewerPose(l||o),p=nt,u!==null){const Et=u.views;h!==null&&(t.setRenderTargetFramebuffer(v,h.framebuffer),t.setRenderTarget(v));let Pt=!1;Et.length!==B.cameras.length&&(B.cameras.length=0,Pt=!0);for(let Ot=0;Ot<Et.length;Ot++){const Zt=Et[Ot];let Qt=null;if(h!==null)Qt=h.getViewport(Zt);else{const ht=d.getViewSubImage(f,Zt);Qt=ht.viewport,Ot===0&&(t.setRenderTargetTextures(v,ht.colorTexture,ht.depthStencilTexture),t.setRenderTarget(v))}let $=N[Ot];$===void 0&&($=new Mn,$.layers.enable(Ot),$.viewport=new ze,N[Ot]=$),$.matrix.fromArray(Zt.transform.matrix),$.matrix.decompose($.position,$.quaternion,$.scale),$.projectionMatrix.fromArray(Zt.projectionMatrix),$.projectionMatrixInverse.copy($.projectionMatrix).invert(),$.viewport.set(Qt.x,Qt.y,Qt.width,Qt.height),Ot===0&&(B.matrix.copy($.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Pt===!0&&B.cameras.push($)}const Mt=s.enabledFeatures;if(Mt&&Mt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){d=n.getBinding();const Ot=d.getDepthInformation(Et[0]);Ot&&Ot.isValid&&Ot.texture&&m.init(Ot,s.renderState)}if(Mt&&Mt.includes("camera-access")&&_){t.state.unbindTexture(),d=n.getBinding();for(let Ot=0;Ot<Et.length;Ot++){const Zt=Et[Ot].camera;if(Zt){let Qt=g[Zt];Qt||(Qt=new gu,g[Zt]=Qt);const $=d.getCameraImage(Zt);Qt.sourceTexture=$}}}}for(let Et=0;Et<T.length;Et++){const Pt=A[Et],Mt=T[Et];Pt!==null&&Mt!==void 0&&Mt.update(Pt,nt,l||o)}k&&k(V,nt),nt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:nt}),p=null}const mt=new Pu;mt.setAnimationLoop(at),this.setAnimationLoop=function(V){k=V},this.dispose=function(){}}}const yx=new Yt,Hu=new oe;Hu.set(-1,0,0,0,1,0,0,0,1);function Sx(i,t){function e(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,Tu(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,x,y,v){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),d(m,g)):g.isMeshPhongMaterial?(r(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),f(m,g),g.isMeshPhysicalMaterial&&h(m,g,v)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),_(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?c(m,g,x,y):g.isSpriteMaterial?l(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,e(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===fn&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,e(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===fn&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,e(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,e(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);const x=t.get(g),y=x.envMap,v=x.envMapRotation;y&&(m.envMap.value=y,m.envMapRotation.value.setFromMatrix4(yx.makeRotationFromEuler(v)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Hu),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function c(m,g,x,y){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*x,m.scale.value=y*.5,g.map&&(m.map.value=g.map,e(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function l(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function d(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function f(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function h(m,g,x){m.ior.value=g.ior,g.diffuseRoughness>0&&(m.diffuseRoughness.value=g.diffuseRoughness,g.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=g.diffuseRoughnessMap,e(g.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===fn&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=g.iridescenceThicknessMaximum,g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function _(m,g){const x=t.get(g).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Ex(i,t,e,n){let s={},r={};function o(x,y){const v=y.program;n.uniformBlockBinding(x,v,s[x.id])}function a(x,y){let v=s[x.id];v===void 0&&(p(x),v=c(x),s[x.id]=v,x.addEventListener("dispose",m));const T=y.program;n.updateUBOMapping(x,T);const A=t.render.frame;r[x.id]!==A&&(l(x),r[x.id]=A)}function c(x){const y=i.createBuffer(),v=x.__size,T=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,v,T),i.bindBuffer(i.UNIFORM_BUFFER,null),y}function l(x){const y=s[x.id],v=x.uniforms,T=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let A=0,M=v.length;A<M;A++){const E=v[A];if(Array.isArray(E))for(let I=0,P=E.length;I<P;I++)u(E[I],A,I,T);else u(E,A,0,T)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(x,y,v,T){if(f(x,y,v,T)===!0){const A=x.__offset,M=x.value;if(Array.isArray(M)){let E=0;for(let I=0;I<M.length;I++){const P=M[I],C=_(P,!0);d(P,x.__data,E),E+=C.storage/Float32Array.BYTES_PER_ELEMENT}}else d(M,x.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,A,x.__data)}}function d(x,y,v){typeof x=="number"||typeof x=="boolean"?y[v]=x:x.isMatrix3?(y[v]=x.elements[0],y[v+1]=x.elements[1],y[v+2]=x.elements[2],y[v+3]=0,y[v+4]=x.elements[3],y[v+5]=x.elements[4],y[v+6]=x.elements[5],y[v+7]=0,y[v+8]=x.elements[6],y[v+9]=x.elements[7],y[v+10]=x.elements[8],y[v+11]=0):ArrayBuffer.isView(x)?y.set(x.subarray(0,y.length-v),v):x.toArray(y,v)}function f(x,y,v,T){const A=x.value,M=y+"_"+v;if(Array.isArray(A)){T[M]===void 0&&(T[M]=[]);const E=T[M];let I=!1;for(let P=0;P<A.length;P++)h(A[P],E,P)===!0&&(I=!0);return I}return h(A,T,M)}function h(x,y,v){if(y[v]===void 0)return typeof x=="number"||typeof x=="boolean"?y[v]=x:ArrayBuffer.isView(x)?y[v]=x.slice():y[v]=x.clone(),!0;{const T=y[v];if(typeof x=="number"||typeof x=="boolean"){if(T!==x)return y[v]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(T.equals(x)===!1)return T.copy(x),!0}}return!1}function p(x){const y=x.uniforms;let v=0;const T=16;for(let M=0,E=y.length;M<E;M++){const I=Array.isArray(y[M])?y[M]:[y[M]];for(let P=0,C=I.length;P<C;P++){const N=I[P],B=Array.isArray(N.value)?N.value:[N.value],U=Array.isArray(y[M])||Array.isArray(N.value);let z=v;for(let X=0,it=B.length;X<it;X++){const L=B[X],H=_(L,U),k=v%T,at=k%H.boundary,mt=k+at;v+=at,mt!==0&&T-mt<H.storage&&(v+=T-mt),X===0&&(z=v),v+=H.storage}const W=N.type==="int"?Int32Array:N.type==="uint"?Uint32Array:Float32Array;N.__data=new W((v-z)/Float32Array.BYTES_PER_ELEMENT),N.__offset=z}}const A=v%T;return A>0&&(v+=T-A),x.__size=v,x.__cache={},this}function _(x,y){const v={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(v.boundary=4,v.storage=4):x.isVector2?(v.boundary=8,v.storage=8):x.isVector3||x.isColor?(v.boundary=16,v.storage=12):x.isVector4?(v.boundary=16,v.storage=16):x.isMatrix3?(v.boundary=16,v.storage=48):x.isMatrix4?(v.boundary=16,v.storage=64):x.isTexture?te("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(v.boundary=16,v.storage=x.byteLength):te("WebGLRenderer: Unsupported uniform value type.",x),y===!0&&(v.boundary=16,v.storage=Math.ceil(v.storage/16)*16),v}function m(x){const y=x.target;y.removeEventListener("dispose",m),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function g(){for(const x in s)i.deleteBuffer(s[x]);s={},r={}}return{bind:o,update:a,dispose:g}}const bx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let zn=null;function wx(){return zn===null&&(zn=new du(bx,16,16,Fi,Zn),zn.name="DFG_LUT",zn.minFilter=gn,zn.magFilter=gn,zn.wrapS=oi,zn.wrapT=oi,zn.generateMipmaps=!1,zn.needsUpdate=!0),zn}class Tx{constructor(t={}){const{canvas:e=ad(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:f=!1,outputBufferType:h=yn}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;const _=h,m=new Set([Sl,yl,Ml]),g=new Set([yn,qn,qs,_s,_l,xl]),x=new Uint32Array(4),y=new Int32Array(4),v={textures:[],min:[],max:[],resolution:[]};let T=null,A=null;const M=[],E=[];let I=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ci,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let C=!1,N=null,B=null,U=null,z=null;this._outputColorSpace=vn;let W=0,X=0,it=null,L=-1,H=null;const k=new ze,at=new ze;let mt=null;const V=new se(0);let nt=0,Et=e.width,Pt=e.height,Mt=1,Ut=null,qt=null;const Ot=new ze(0,0,Et,Pt),Zt=new ze(0,0,Et,Pt);let Qt=!1;const $=new Ks,ht=new Tl;let ut=!1,bt=!1;const yt=new Yt,Jt=new b,Bt=new ze,he={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let fe=!1;function xe(){return it===null?Mt:1}let D=n;function ct(w,F){return e.getContext(w,F)}let vt,Xt,rt,$t,Tt,Rt,R,S,G,ot,tt,_t,xt,Z,K,pt,O,et,Q,dt,gt,j,St;try{const w={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${dl}`),e.addEventListener("webglcontextlost",Ht,!1),e.addEventListener("webglcontextrestored",Kt,!1),e.addEventListener("webglcontextcreationerror",Ct,!1),D===null){const F="webgl2";if(D=ct(F,w),D===null)throw ct(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ft()}catch(w){throw e.removeEventListener("webglcontextlost",Ht,!1),e.removeEventListener("webglcontextrestored",Kt,!1),e.removeEventListener("webglcontextcreationerror",Ct,!1),ye("WebGLRenderer: "+w.message),w}function Ft(){vt=new Cg(D),vt.init(),gt=new gx(D,vt),Xt=new xg(D,vt,t,gt),rt=new px(D,vt),Xt.reversedDepthBuffer&&f&&rt.buffers.depth.setReversed(!0),B=D.createFramebuffer(),U=D.createFramebuffer(),z=D.createFramebuffer(),$t=new Dg(D),Tt=new tx,Rt=new mx(D,vt,rt,Tt,Xt,gt,$t),R=new Rg(P),S=new Np(D),j=new gg(D,S),G=new Pg(D,S,$t,j),ot=new Ng(D,G,S,j,$t),et=new Ig(D,Xt,Rt),K=new vg(Tt),tt=new j_(P,R,vt,Xt,j,K),_t=new Sx(P,Tt),xt=new nx,Z=new lx(vt),O=new mg(P,R,rt,ot,p,c),pt=new dx(P,ot,Xt),St=new Ex(D,$t,Xt,rt),Q=new _g(D,vt,$t),dt=new Lg(D,vt,$t),$t.programs=tt.programs,P.capabilities=Xt,P.extensions=vt,P.properties=Tt,P.renderLists=xt,P.shadowMap=pt,P.state=rt,P.info=$t}_!==yn&&(I=new Og(_,e.width,e.height,a,s,r));const st=new Mx(P,D);this.xr=st,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const w=vt.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=vt.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return Mt},this.setPixelRatio=function(w){w!==void 0&&(Mt=w,this.setSize(Et,Pt,!1))},this.getSize=function(w){return w.set(Et,Pt)},this.setSize=function(w,F,J=!0){if(st.isPresenting){te("WebGLRenderer: Can't change size while VR device is presenting.");return}Et=w,Pt=F,e.width=Math.floor(w*Mt),e.height=Math.floor(F*Mt),J===!0&&(e.style.width=w+"px",e.style.height=F+"px"),I!==null&&I.setSize(e.width,e.height),this.setViewport(0,0,w,F)},this.getDrawingBufferSize=function(w){return w.set(Et*Mt,Pt*Mt).floor()},this.setDrawingBufferSize=function(w,F,J){Et=w,Pt=F,Mt=J,e.width=Math.floor(w*J),e.height=Math.floor(F*J),this.setViewport(0,0,w,F)},this.setEffects=function(w){if(_===yn){ye("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let F=0;F<w.length;F++)if(w[F].isOutputPass===!0){te("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}I.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(k)},this.getViewport=function(w){return w.copy(Ot)},this.setViewport=function(w,F,J,Y){w.isVector4?Ot.set(w.x,w.y,w.z,w.w):Ot.set(w,F,J,Y),rt.viewport(k.copy(Ot).multiplyScalar(xe()).round())},this.getScissor=function(w){return w.copy(Zt)},this.setScissor=function(w,F,J,Y){w.isVector4?Zt.set(w.x,w.y,w.z,w.w):Zt.set(w,F,J,Y),rt.scissor(at.copy(Zt).multiplyScalar(xe()).round())},this.getScissorTest=function(){return Qt},this.setScissorTest=function(w){rt.setScissorTest(Qt=w)},this.setOpaqueSort=function(w){Ut=w},this.setTransparentSort=function(w){qt=w},this.getClearColor=function(w){return w.copy(O.getClearColor())},this.setClearColor=function(){O.setClearColor(...arguments)},this.getClearAlpha=function(){return O.getClearAlpha()},this.setClearAlpha=function(){O.setClearAlpha(...arguments)},this.clear=function(w=!0,F=!0,J=!0){let Y=0;if(w){let q=!1;if(it!==null){const At=it.texture.format;q=m.has(At)}if(q){const At=it.texture.type,Vt=g.has(At),wt=O.getClearColor(),Dt=O.getClearAlpha(),kt=wt.r,jt=wt.g,re=wt.b;Vt?(x[0]=kt,x[1]=jt,x[2]=re,x[3]=Dt,D.clearBufferuiv(D.COLOR,0,x)):(y[0]=kt,y[1]=jt,y[2]=re,y[3]=Dt,D.clearBufferiv(D.COLOR,0,y))}else Y|=D.COLOR_BUFFER_BIT}F&&(Y|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),J&&(Y|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Y!==0&&D.clear(Y)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),N=w},this.dispose=function(){e.removeEventListener("webglcontextlost",Ht,!1),e.removeEventListener("webglcontextrestored",Kt,!1),e.removeEventListener("webglcontextcreationerror",Ct,!1),O.dispose(),xt.dispose(),Z.dispose(),Rt.dispose(),Tt.dispose(),R.dispose(),ot.dispose(),G.dispose(),j.dispose(),St.dispose(),tt.dispose(),st.dispose(),st.removeEventListener("sessionstart",_e),st.removeEventListener("sessionend",Ue),me.stop()};function Ht(w){w.preventDefault(),lc("WebGLRenderer: Context Lost."),C=!0}function Kt(){lc("WebGLRenderer: Context Restored."),C=!1;const w=$t.autoReset,F=pt.enabled,J=pt.autoUpdate,Y=pt.needsUpdate,q=pt.type;Ft(),$t.autoReset=w,pt.enabled=F,pt.autoUpdate=J,pt.needsUpdate=Y,pt.type=q}function Ct(w){ye("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function de(w){const F=w.target;F.removeEventListener("dispose",de),Ie(F)}function Ie(w){zt(w),Tt.remove(w)}function zt(w){const F=Tt.get(w).programs;F!==void 0&&(F.forEach(function(J){tt.releaseProgram(J)}),w.isShaderMaterial&&tt.releaseShaderCache(w))}this.renderBufferDirect=function(w,F,J,Y,q,At){F===null&&(F=he);const Vt=q.isMesh&&q.matrixWorld.determinantAffine()<0,wt=tn(w,F,J,Y,q);rt.setMaterial(Y,Vt);let Dt=J.index,kt=1;if(Y.wireframe===!0){if(Dt=G.getWireframeAttribute(J),Dt===void 0)return;kt=2}const jt=J.drawRange,re=J.attributes.position;let Lt=jt.start*kt,ae=(jt.start+jt.count)*kt;At!==null&&(Lt=Math.max(Lt,At.start*kt),ae=Math.min(ae,(At.start+At.count)*kt)),Dt!==null?(Lt=Math.max(Lt,0),ae=Math.min(ae,Dt.count)):re!=null&&(Lt=Math.max(Lt,0),ae=Math.min(ae,re.count));const be=ae-Lt;if(be<0||be===1/0)return;j.setup(q,Y,wt,J,Dt);let Ae,we=Q;if(Dt!==null&&(Ae=S.get(Dt),we=dt,we.setIndex(Ae)),q.isMesh)Y.wireframe===!0?(rt.setLineWidth(Y.wireframeLinewidth*xe()),we.setMode(D.LINES)):we.setMode(D.TRIANGLES);else if(q.isLine){let Xe=Y.linewidth;Xe===void 0&&(Xe=1),rt.setLineWidth(Xe*xe()),q.isLineSegments?we.setMode(D.LINES):q.isLineLoop?we.setMode(D.LINE_LOOP):we.setMode(D.LINE_STRIP)}else q.isPoints?we.setMode(D.POINTS):q.isSprite&&we.setMode(D.TRIANGLES);if(q.isBatchedMesh)if(vt.get("WEBGL_multi_draw"))we.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{const Xe=q._multiDrawStarts,Wt=q._multiDrawCounts,cn=q._multiDrawCount,Se=Dt?S.get(Dt).bytesPerElement:1,Ti=Tt.get(Y).currentProgram.getUniforms();for(let rn=0;rn<cn;rn++)Ti.setValue(D,"_gl_DrawID",rn),we.render(Xe[rn]/Se,Wt[rn])}else if(q.isInstancedMesh)we.renderInstances(Lt,be,q.count);else if(J.isInstancedBufferGeometry){const Xe=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,Wt=Math.min(J.instanceCount,Xe);we.renderInstances(Lt,be,Wt)}else we.render(Lt,be)};function Gt(w,F,J,Y){N!==null&&w.isNodeMaterial&&N.setObject(Y,w),ut===!0&&K.setState(w,J,!1),w.transparent===!0&&w.side===Ln&&w.forceSinglePass===!1?(w.side=fn,w.needsUpdate=!0,Oe(w,F,Y),w.side=Oi,w.needsUpdate=!0,Oe(w,F,Y),w.side=Ln):Oe(w,F,Y)}this.compile=function(w,F,J=null){J===null&&(J=w),N!==null&&N.renderStart(w,F,J),A=Z.get(J),A.init(F),E.push(A),J.traverseVisible(function(q){q.isLight&&q.layers.test(F.layers)&&(A.pushLight(q),q.castShadow&&A.pushShadow(q))}),w!==J&&w.traverseVisible(function(q){q.isLight&&q.layers.test(F.layers)&&(A.pushLight(q),q.castShadow&&A.pushShadow(q))}),A.setupLights(),N!==null&&N.updateLights(A.state.lightsArray),bt=this.localClippingEnabled,ut=K.init(this.clippingPlanes,bt),ut===!0&&K.setGlobalState(this.clippingPlanes,F),N!==null&&pt.render(A.state.shadowsArray,J,F);const Y=new Set;return w.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;const At=q.material;if(At)if(Array.isArray(At))for(let Vt=0;Vt<At.length;Vt++){const wt=At[Vt];Gt(wt,J,F,q),Y.add(wt)}else Gt(At,J,F,q),Y.add(At)}),A=E.pop(),N!==null&&N.renderEnd(),Y},this.compileAsync=function(w,F,J=null){const Y=this.compile(w,F,J);return new Promise(q=>{function At(){if(Y.forEach(function(Vt){const Dt=Tt.get(Vt).currentProgram;(Dt===void 0||Dt.isReady())&&Y.delete(Vt)}),Y.size===0){q(w);return}setTimeout(At,10)}vt.get("KHR_parallel_shader_compile")!==null?At():setTimeout(At,10)})};let ee=null;function Pe(w){ee&&ee(w)}function _e(){me.stop()}function Ue(){me.start()}const me=new Pu;me.setAnimationLoop(Pe),typeof self<"u"&&me.setContext(self),this.setAnimationLoop=function(w){ee=w,st.setAnimationLoop(w),w===null?me.stop():me.start()},st.addEventListener("sessionstart",_e),st.addEventListener("sessionend",Ue),this.render=function(w,F){if(F!==void 0&&F.isCamera!==!0){ye("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;N!==null&&N.renderStart(w,F);const J=st.enabled===!0&&st.isPresenting===!0,Y=I!==null&&(it===null||J)&&I.begin(P,it);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),st.enabled===!0&&st.isPresenting===!0&&(I===null||I.isCompositing()===!1)&&(st.cameraAutoUpdate===!0&&st.updateCamera(F),F=st.getCamera()),w.isScene===!0&&w.onBeforeRender(P,w,F,it),A=Z.get(w,E.length),A.init(F),A.state.textureUnits=Rt.getTextureUnits(),E.push(A),yt.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),F.isArrayCamera?ht.setFromArrayCamera(F):$.setFromProjectionMatrix(yt,Nn,F.reversedDepth),bt=this.localClippingEnabled,ut=K.init(this.clippingPlanes,bt),T=xt.get(w,M.length),T.init(),M.push(T),this.info.render.frame++,st.enabled===!0&&st.isPresenting===!0){const Vt=P.xr.getDepthSensingMesh();Vt!==null&&ne(Vt,F,-1/0,P.sortObjects)}ne(w,F,0,P.sortObjects),T.finish(),N!==null&&N.updateLights(A.state.lightsArray),P.sortObjects===!0&&T.sort(Ut,qt),fe=st.enabled===!1||st.isPresenting===!1||st.hasDepthSensing()===!1,fe&&O.addToRenderList(T,w),this.info.autoReset===!0&&this.info.reset(),ut===!0&&K.beginShadows();const q=A.state.shadowsArray;if(pt.render(q,w,F),ut===!0&&K.endShadows(),(Y&&I.hasRenderPass())===!1){const Vt=T.opaque,wt=T.transmissive;if(A.setupLights(),F.isArrayCamera){const Dt=F.cameras;if(wt.length>0)for(let kt=0,jt=Dt.length;kt<jt;kt++){const re=Dt[kt];wn(Vt,wt,w,re)}fe&&O.render(w);for(let kt=0,jt=Dt.length;kt<jt;kt++){const re=Dt[kt];We(T,w,re,re.viewport)}}else wt.length>0&&wn(Vt,wt,w,F),fe&&O.render(w),We(T,w,F)}it!==null&&X===0&&(Rt.updateMultisampleRenderTarget(it),Rt.updateRenderTargetMipmap(it)),Y&&I.end(P),w.isScene===!0&&w.onAfterRender(P,w,F),j.resetDefaultState(),L=-1,H=null,E.pop(),E.length>0?(A=E[E.length-1],Rt.setTextureUnits(A.state.textureUnits),ut===!0&&K.setGlobalState(P.clippingPlanes,A.state.camera)):A=null,M.pop(),M.length>0?T=M[M.length-1]:T=null,N!==null&&N.renderEnd()};function ne(w,F,J,Y){if(w.visible===!1)return;if(w.layers.test(F.layers)){if(w.isGroup)J=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(F);else if(w.isLight)A.pushLight(w),w.castShadow&&A.pushShadow(w);else if(w.isSprite){const Vt=F.isArrayCamera?ht:$;if(!w.frustumCulled||w.intersectsFrustum(Vt)){Y&&Bt.setFromMatrixPosition(w.matrixWorld).applyMatrix4(yt);const wt=ot.update(w),Dt=w.material;Dt.visible&&T.push(w,wt,Dt,J,Bt.z,null,F)}}else if(w.isMesh||w.isLine||w.isPoints){const Vt=F.isArrayCamera?ht:$;if(!w.frustumCulled||w.intersectsFrustum(Vt)){const wt=ot.update(w),Dt=w.material;if(Y&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Bt.copy(w.boundingSphere.center)):(wt.boundingSphere===null&&wt.computeBoundingSphere(),Bt.copy(wt.boundingSphere.center)),Bt.applyMatrix4(w.matrixWorld).applyMatrix4(yt)),Array.isArray(Dt)){const kt=wt.groups;for(let jt=0,re=kt.length;jt<re;jt++){const Lt=kt[jt],ae=Dt[Lt.materialIndex];ae&&ae.visible&&T.push(w,wt,ae,J,Bt.z,Lt,F)}}else Dt.visible&&T.push(w,wt,Dt,J,Bt.z,null,F)}}}const At=w.children;for(let Vt=0,wt=At.length;Vt<wt;Vt++)ne(At[Vt],F,J,Y)}function We(w,F,J,Y){const{opaque:q,transmissive:At,transparent:Vt}=w;A.setupLightsView(J),ut===!0&&K.setGlobalState(P.clippingPlanes,J),Y&&rt.viewport(k.copy(Y)),q.length>0&&je(q,F,J),At.length>0&&je(At,F,J),Vt.length>0&&je(Vt,F,J),rt.buffers.depth.setTest(!0),rt.buffers.depth.setMask(!0),rt.buffers.color.setMask(!0),rt.setPolygonOffset(!1)}function wn(w,F,J,Y){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[Y.id]===void 0){const Lt=vt.has("EXT_color_buffer_half_float")||vt.has("EXT_color_buffer_float");A.state.transmissionRenderTarget[Y.id]=new Yn(1,1,{generateMipmaps:!0,type:Lt?Zn:yn,minFilter:Mi,samples:Math.max(4,Xt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ve.workingColorSpace})}const At=A.state.transmissionRenderTarget[Y.id],Vt=Y.viewport||k;At.setSize(Vt.z*P.transmissionResolutionScale,Vt.w*P.transmissionResolutionScale);const wt=P.getRenderTarget(),Dt=P.getActiveCubeFace(),kt=P.getActiveMipmapLevel();P.setRenderTarget(At),P.getClearColor(V),nt=P.getClearAlpha(),nt<1&&P.setClearColor(16777215,.5),P.clear(),fe&&O.render(J);const jt=P.toneMapping;P.toneMapping=ci;const re=Y.viewport;if(Y.viewport!==void 0&&(Y.viewport=void 0),A.setupLightsView(Y),ut===!0&&K.setGlobalState(P.clippingPlanes,Y),je(w,J,Y),Rt.updateMultisampleRenderTarget(At),Rt.updateRenderTargetMipmap(At),vt.has("WEBGL_multisampled_render_to_texture")===!1){let Lt=!1;for(let ae=0,be=F.length;ae<be;ae++){const Ae=F[ae],{object:we,geometry:Xe,material:Wt,group:cn}=Ae;if(Wt.side===Ln&&we.layers.test(Y.layers)){const Se=Wt.side;Wt.side=fn,Wt.needsUpdate=!0,$n(we,J,Y,Xe,Wt,cn),Wt.side=Se,Wt.needsUpdate=!0,Lt=!0}}Lt===!0&&(Rt.updateMultisampleRenderTarget(At),Rt.updateRenderTargetMipmap(At))}P.setRenderTarget(wt,Dt,kt),P.setClearColor(V,nt),re!==void 0&&(Y.viewport=re),P.toneMapping=jt}function je(w,F,J){const Y=F.isScene===!0?F.overrideMaterial:null;for(let q=0,At=w.length;q<At;q++){const Vt=w[q],{object:wt,geometry:Dt,group:kt}=Vt;let jt=Vt.material;jt.allowOverride===!0&&Y!==null&&(jt=Y),wt.layers.test(J.layers)&&$n(wt,F,J,Dt,jt,kt)}}function $n(w,F,J,Y,q,At){N!==null&&q.isNodeMaterial&&N.setObject(w,q),w.onBeforeRender(P,F,J,Y,q,At),w.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),q.onBeforeRender(P,F,J,Y,w,At),q.transparent===!0&&q.side===Ln&&q.forceSinglePass===!1?(q.side=fn,q.needsUpdate=!0,P.renderBufferDirect(J,F,Y,q,w,At),q.side=Oi,q.needsUpdate=!0,P.renderBufferDirect(J,F,Y,q,w,At),q.side=Ln):P.renderBufferDirect(J,F,Y,q,w,At),w.onAfterRender(P,F,J,Y,q,At)}function He(w){let F=0;for(const J of w)J.texture!==null&&F++;return F}function Oe(w,F,J){F.isScene!==!0&&(F=he);const Y=Tt.get(w),q=A.state.lights,At=A.state.shadowsArray,Vt=q.state.version,wt=tt.getParameters(w,q.state,At,F,J,A.state.lightProbeGridArray),Dt=tt.getProgramCacheKey(wt);let kt=Y.programs;Y.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?F.environment:null,Y.fog=F.fog;const jt=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;Y.envMap=R.get(w.envMap||Y.environment,jt),Y.envMapRotation=Y.environment!==null&&w.envMap===null?F.environmentRotation:w.envMapRotation,kt===void 0&&(w.addEventListener("dispose",de),kt=new Map,Y.programs=kt,Y.programVariants=new Map);let re=kt.get(Dt);if(re!==void 0){if(Y.currentProgram===re&&Y.lightsStateVersion===Vt)return sn(w,wt),re}else wt.uniforms=tt.getUniforms(w),N!==null&&w.isNodeMaterial&&N.build(w,J,wt),w.onBeforeCompile(wt,P),re=tt.acquireProgram(wt,Dt),kt.set(Dt,re),Y.uniforms=wt.uniforms;const Lt=Y.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Lt.clippingPlanes=K.uniform),sn(w,wt),Y.needsLights=jn(w),Y.lightsStateVersion=Vt,Y.needsLights&&(Lt.ambientLightColor.value=q.state.ambient,Lt.lightProbe.value=q.state.probe,Lt.sunLights.value=q.state.sun,Lt.sunLightShadows.value=q.state.sunShadow,Lt.directionalLights.value=q.state.directional,Lt.directionalLightShadows.value=q.state.directionalShadow,Lt.spotLights.value=q.state.spot,Lt.spotLightShadows.value=q.state.spotShadow,Lt.rectAreaLights.value=q.state.rectArea,Lt.ltc_1.value=q.state.rectAreaLTC1,Lt.ltc_2.value=q.state.rectAreaLTC2,Lt.pointLights.value=q.state.point,Lt.pointLightShadows.value=q.state.pointShadow,Lt.hemisphereLights.value=q.state.hemi,Lt.sunShadowMatrix.value=q.state.sunShadowMatrix,Lt.sunShadowCascade.value=q.state.sunShadowCascade,Lt.directionalShadowMatrix.value=q.state.directionalShadowMatrix,Lt.spotLightMatrix.value=q.state.spotLightMatrix,Lt.spotLightMap.value=q.state.spotLightMap,Lt.pointShadowMatrix.value=q.state.pointShadowMatrix),Y.numLightProbeGrids=He(A.state.lightProbeGridArray),Y.currentProgram=re,Y.uniformsList=null,re}function Ke(w,F,J,Y,q){const At=Tt.get(w),Vt=At.currentProgram.id+","+Y+","+q;let wt=At.programVariants.get(Vt);return wt===void 0?(wt=Oe(w,F,J),At.programVariants.set(Vt,wt)):(At.currentProgram=wt,At.uniformsList=null,At.outputColorSpace=Y,At.toneMapping=q),wt}function Qn(w){if(w.uniformsList===null){const F=w.currentProgram.getUniforms();w.uniformsList=Wr.seqWithValue(F.seq,w.uniforms)}return w.uniformsList}function sn(w,F){const J=Tt.get(w);J.outputColorSpace=F.outputColorSpace,J.batching=F.batching,J.batchingColor=F.batchingColor,J.instancing=F.instancing,J.instancingColor=F.instancingColor,J.instancingMorph=F.instancingMorph,J.skinning=F.skinning,J.morphTargets=F.morphTargets,J.morphNormals=F.morphNormals,J.morphColors=F.morphColors,J.morphTargetsCount=F.morphTargetsCount,J.numClippingPlanes=F.numClippingPlanes,J.numIntersection=F.numClipIntersection,J.vertexAlphas=F.vertexAlphas,J.vertexTangents=F.vertexTangents,J.toneMapping=F.toneMapping}function tn(w,F,J,Y,q){F.isScene!==!0&&(F=he),Rt.resetTextureUnits();const At=F.fog,Vt=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial?F.environment:null,wt=it===null?P.outputColorSpace:it.isXRRenderTarget===!0?it.texture.colorSpace:ve.workingColorSpace,Dt=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial&&!Y.envMap||Y.isMeshPhongMaterial&&!Y.envMap,kt=R.get(Y.envMap||Vt,Dt),jt=Y.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,re=!!J.attributes.tangent&&(!!Y.normalMap||Y.anisotropy>0),Lt=!!J.morphAttributes.position,ae=!!J.morphAttributes.normal,be=!!J.morphAttributes.color;let Ae=ci;Y.toneMapped&&(it===null||it.isXRRenderTarget===!0)&&(Ae=P.toneMapping);const we=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,Xe=we!==void 0?we.length:0,Wt=Tt.get(Y),cn=A.state.lights;if(ut===!0&&(bt===!0||w!==H)){const Fe=w===H&&Y.id===L;K.setState(Y,w,Fe)}let Se=!1,Ti=!1;Y.version===Wt.__version?Wt.needsLights&&Wt.lightsStateVersion!==cn.state.version||q.isBatchedMesh&&Wt.batching===!1||!q.isBatchedMesh&&Wt.batching===!0||q.isBatchedMesh&&Wt.batchingColor===!0&&q._colorsTexture===null||q.isBatchedMesh&&Wt.batchingColor===!1&&q._colorsTexture!==null||q.isInstancedMesh&&Wt.instancing===!1||!q.isInstancedMesh&&Wt.instancing===!0||q.isSkinnedMesh&&Wt.skinning===!1||!q.isSkinnedMesh&&Wt.skinning===!0||q.isInstancedMesh&&Wt.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&Wt.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&Wt.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&Wt.instancingMorph===!1&&q.morphTexture!==null||Wt.envMap!==kt||Y.fog===!0&&Wt.fog!==At||Wt.numClippingPlanes!==void 0&&(Wt.numClippingPlanes!==K.numPlanes||Wt.numIntersection!==K.numIntersection)||Wt.vertexAlphas!==jt||Wt.vertexTangents!==re||Wt.morphTargets!==Lt||Wt.morphNormals!==ae||Wt.morphColors!==be||Wt.morphTargetsCount!==Xe||Wt.numLightProbeGrids!==He(A.state.lightProbeGridArray)?Se=!0:(Wt.outputColorSpace!==wt||Wt.toneMapping!==Ae)&&(Ti=!0):(Se=!0,Wt.__version=Y.version);let rn=Wt.currentProgram;(Se===!0||Ti===!0)&&(rn=Ti===!0?Ke(Y,F,q,wt,Ae):Oe(Y,F,q),N&&Y.isNodeMaterial&&N.onUpdateProgram(Y,rn,Wt));let or=!1,fi=!1,Ai=!1;const Me=rn.getUniforms(),en=Wt.uniforms;if(rt.useProgram(rn.program)&&(or=!0,fi=!0,Ai=!0),Y.id!==L&&(L=Y.id,fi=!0),or||H!==w){rt.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),Me.setValue(D,"projectionMatrix",w.projectionMatrix),Me.setValue(D,"viewMatrix",w.matrixWorldInverse);const Je=Me.map.cameraPosition;Je!==void 0&&Je.setValue(D,Jt.setFromMatrixPosition(w.matrixWorld)),Xt.logarithmicDepthBuffer&&Me.setValue(D,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(Y.isMeshPhongMaterial||Y.isMeshToonMaterial||Y.isMeshLambertMaterial||Y.isMeshBasicMaterial||Y.isMeshStandardMaterial||Y.isShaderMaterial)&&Me.setValue(D,"isOrthographic",w.isOrthographicCamera===!0),H!==w&&(H=w,fi=!0,Ai=!0)}if(Wt.needsLights&&(cn.state.sunShadowMap.length>0&&Me.setValue(D,"sunShadowMap",cn.state.sunShadowMap,Rt),cn.state.directionalShadowMap.length>0&&Me.setValue(D,"directionalShadowMap",cn.state.directionalShadowMap,Rt),cn.state.spotShadowMap.length>0&&Me.setValue(D,"spotShadowMap",cn.state.spotShadowMap,Rt),cn.state.pointShadowMap.length>0&&Me.setValue(D,"pointShadowMap",cn.state.pointShadowMap,Rt)),q.isSkinnedMesh){Me.setOptional(D,q,"bindMatrix"),Me.setOptional(D,q,"bindMatrixInverse");const Fe=q.skeleton;Fe&&(Fe.boneTexture===null&&Fe.computeBoneTexture(),Me.setValue(D,"boneTexture",Fe.boneTexture,Rt))}q.isBatchedMesh&&(Me.setOptional(D,q,"batchingTexture"),Me.setValue(D,"batchingTexture",q._matricesTexture,Rt),Me.setOptional(D,q,"batchingIdTexture"),Me.setValue(D,"batchingIdTexture",q._indirectTexture,Rt),Me.setOptional(D,q,"batchingColorTexture"),q._colorsTexture!==null&&Me.setValue(D,"batchingColorTexture",q._colorsTexture,Rt));const Tn=J.morphAttributes;if((Tn.position!==void 0||Tn.normal!==void 0||Tn.color!==void 0)&&et.update(q,J,rn),(fi||Wt.receiveShadow!==q.receiveShadow)&&(Wt.receiveShadow=q.receiveShadow,Me.setValue(D,"receiveShadow",q.receiveShadow)),(Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial)&&Y.envMap===null&&F.environment!==null&&(en.envMapIntensity.value=F.environmentIntensity),en.dfgLUT!==void 0&&(en.dfgLUT.value=wx()),fi){if(Me.setValue(D,"toneMappingExposure",P.toneMappingExposure),Wt.needsLights&&pn(en,Ai),At&&Y.fog===!0&&_t.refreshFogUniforms(en,At),_t.refreshMaterialUniforms(en,Y,Mt,Pt,A.state.transmissionRenderTarget[w.id]),Wt.needsLights&&Wt.numLightProbeGrids>0){const Fe=v;let Je=0;for(const ti of A.state.lightProbeGridArray)ti.texture!==null&&(Fe.textures[Je]=ti.texture,Fe.min[Je]=ti.boundingBox.min,Fe.max[Je]=ti.boundingBox.max,Fe.resolution[Je]=ti.resolution,Je++);for(const ti in Fe)Fe[ti].length=Je;en.probesSH.value=Fe.textures,en.probesMin.value=Fe.min,en.probesMax.value=Fe.max,en.probesResolution.value=Fe.resolution}Wr.upload(D,Qn(Wt),en,Rt)}if(Y.isShaderMaterial&&Y.uniformsNeedUpdate===!0&&(Wr.upload(D,Qn(Wt),en,Rt),Y.uniformsNeedUpdate=!1),Y.isSpriteMaterial&&Me.setValue(D,"center",q.center),Me.setValue(D,"modelViewMatrix",q.modelViewMatrix),Me.setValue(D,"normalMatrix",q.normalMatrix),Me.setValue(D,"modelMatrix",q.matrixWorld),Y.uniformsGroups!==void 0){const Fe=Y.uniformsGroups;for(let Je=0,ti=Fe.length;Je<ti;Je++){const Kl=Fe[Je];St.update(Kl,rn),St.bind(Kl,rn)}}return rn}function pn(w,F){w.ambientLightColor.needsUpdate=F,w.lightProbe.needsUpdate=F,w.sunLights.needsUpdate=F,w.sunLightShadows.needsUpdate=F,w.directionalLights.needsUpdate=F,w.directionalLightShadows.needsUpdate=F,w.pointLights.needsUpdate=F,w.pointLightShadows.needsUpdate=F,w.spotLights.needsUpdate=F,w.spotLightShadows.needsUpdate=F,w.rectAreaLights.needsUpdate=F,w.hemisphereLights.needsUpdate=F}function jn(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return W},this.getActiveMipmapLevel=function(){return X},this.getRenderTarget=function(){return it},this.setRenderTargetTextures=function(w,F,J){const Y=Tt.get(w);Y.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,Y.__autoAllocateDepthBuffer===!1&&(Y.__useRenderToTexture=!1),Tt.get(w.texture).__webglTexture=F,Tt.get(w.depthTexture).__webglTexture=Y.__autoAllocateDepthBuffer?void 0:J,Y.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,F){const J=Tt.get(w);J.__webglFramebuffer=F,J.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(w,F=0,J=0){it=w,W=F,X=J;let Y=null,q=!1,At=!1;if(w){const wt=Tt.get(w);if(wt.__useDefaultFramebuffer!==void 0){rt.bindFramebuffer(D.FRAMEBUFFER,wt.__webglFramebuffer),k.copy(w.viewport),at.copy(w.scissor),mt=w.scissorTest,rt.viewport(k),rt.scissor(at),rt.setScissorTest(mt),L=-1;return}else if(wt.__webglFramebuffer===void 0)Rt.setupRenderTarget(w);else if(wt.__hasExternalTextures)Rt.rebindTextures(w,Tt.get(w.texture).__webglTexture,Tt.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const jt=w.depthTexture;if(wt.__boundDepthTexture!==jt){if(jt!==null&&Tt.has(jt)&&(w.width!==jt.image.width||w.height!==jt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Rt.setupDepthRenderbuffer(w)}}const Dt=w.texture;(Dt.isData3DTexture||Dt.isDataArrayTexture||Dt.isCompressedArrayTexture)&&(At=!0);const kt=Tt.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(kt[F])?Y=kt[F][J]:Y=kt[F],q=!0):w.samples>0&&Rt.useMultisampledRTT(w)===!1?Y=Tt.get(w).__webglMultisampledFramebuffer:Array.isArray(kt)?Y=kt[J]:Y=kt,k.copy(w.viewport),at.copy(w.scissor),mt=w.scissorTest}else k.copy(Ot).multiplyScalar(Mt).floor(),at.copy(Zt).multiplyScalar(Mt).floor(),mt=Qt;if(J!==0&&(Y=B),rt.bindFramebuffer(D.FRAMEBUFFER,Y)&&rt.drawBuffers(w,Y),rt.viewport(k),rt.scissor(at),rt.setScissorTest(mt),q){const wt=Tt.get(w.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+F,wt.__webglTexture,J)}else if(At){const wt=F;for(let Dt=0;Dt<w.textures.length;Dt++){const kt=Tt.get(w.textures[Dt]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Dt,kt.__webglTexture,J,wt)}}else if(w!==null&&J!==0){const wt=Tt.get(w.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,wt.__webglTexture,J)}L=-1};function On(w){const F=Tt.get(w);return(F.__readFormat!==w.format||F.__readType!==w.type)&&(F.__readFormat=w.format,F.__readType=w.type,F.__formatReadable=Xt.textureFormatReadable(w.format),F.__typeReadable=Xt.textureTypeReadable(w.type)),F}this.readRenderTargetPixels=function(w,F,J,Y,q,At,Vt,wt=0){if(!(w&&w.isWebGLRenderTarget)){ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Dt=Tt.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Vt!==void 0&&(Dt=Dt[Vt],Array.isArray(Dt)&&(Dt=Dt[0])),Dt){rt.bindFramebuffer(D.FRAMEBUFFER,Dt);try{const kt=w.textures[wt],jt=kt.format,re=kt.type;w.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+wt);const Lt=On(kt);if(Lt.__formatReadable===!1){ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Lt.__typeReadable===!1){ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=w.width-Y&&J>=0&&J<=w.height-q&&D.readPixels(F,J,Y,q,gt.convert(jt),gt.convert(re),At)}finally{const kt=it!==null?Tt.get(it).__webglFramebuffer:null;rt.bindFramebuffer(D.FRAMEBUFFER,kt)}}},this.readRenderTargetPixelsAsync=async function(w,F,J,Y,q,At,Vt,wt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Dt=Tt.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Vt!==void 0&&(Dt=Dt[Vt],Array.isArray(Dt)&&(Dt=Dt[0])),Dt)if(F>=0&&F<=w.width-Y&&J>=0&&J<=w.height-q){rt.bindFramebuffer(D.FRAMEBUFFER,Dt);const kt=w.textures[wt],jt=kt.format,re=kt.type;w.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+wt);const Lt=On(kt);if(Lt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Lt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ae=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,ae),D.bufferData(D.PIXEL_PACK_BUFFER,At.byteLength,D.STREAM_READ),D.readPixels(F,J,Y,q,gt.convert(jt),gt.convert(re),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);const be=it!==null?Tt.get(it).__webglFramebuffer:null;rt.bindFramebuffer(D.FRAMEBUFFER,be);const Ae=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await ld(D,Ae,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,ae),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,At),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(ae),D.deleteSync(Ae),At}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,F=null,J=0){const Y=Math.pow(2,-J),q=Math.floor(w.image.width*Y),At=Math.floor(w.image.height*Y),Vt=F!==null?F.x:0,wt=F!==null?F.y:0;Rt.setTexture2D(w,0),D.copyTexSubImage2D(D.TEXTURE_2D,J,0,0,Vt,wt,q,At),rt.unbindTexture()},this.copyTextureToTexture=function(w,F,J=null,Y=null,q=0,At=0){let Vt,wt,Dt,kt,jt,re,Lt,ae,be;const Ae=w.isCompressedTexture?w.mipmaps[At]:w.image;if(J!==null)Vt=J.max.x-J.min.x,wt=J.max.y-J.min.y,Dt=J.isBox3?J.max.z-J.min.z:1,kt=J.min.x,jt=J.min.y,re=J.isBox3?J.min.z:0;else{const Me=Math.pow(2,-q);Vt=Math.floor(Ae.width*Me),wt=Math.floor(Ae.height*Me),w.isDataArrayTexture?Dt=Ae.depth:w.isData3DTexture?Dt=Math.floor(Ae.depth*Me):Dt=1,kt=0,jt=0,re=0}Y!==null?(Lt=Y.x,ae=Y.y,be=Y.z):(Lt=0,ae=0,be=0);const we=gt.convert(F.format),Xe=gt.convert(F.type);let Wt;F.isData3DTexture?(Rt.setTexture3D(F,0),Wt=D.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(Rt.setTexture2DArray(F,0),Wt=D.TEXTURE_2D_ARRAY):(Rt.setTexture2D(F,0),Wt=D.TEXTURE_2D),rt.activeTexture(D.TEXTURE0),rt.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,F.flipY),rt.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),rt.pixelStorei(D.UNPACK_ALIGNMENT,F.unpackAlignment);const cn=rt.getParameter(D.UNPACK_ROW_LENGTH),Se=rt.getParameter(D.UNPACK_IMAGE_HEIGHT),Ti=rt.getParameter(D.UNPACK_SKIP_PIXELS),rn=rt.getParameter(D.UNPACK_SKIP_ROWS),or=rt.getParameter(D.UNPACK_SKIP_IMAGES);rt.pixelStorei(D.UNPACK_ROW_LENGTH,Ae.width),rt.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Ae.height),rt.pixelStorei(D.UNPACK_SKIP_PIXELS,kt),rt.pixelStorei(D.UNPACK_SKIP_ROWS,jt),rt.pixelStorei(D.UNPACK_SKIP_IMAGES,re);const fi=w.isDataArrayTexture||w.isData3DTexture,Ai=F.isDataArrayTexture||F.isData3DTexture;if(w.isDepthTexture){const Me=Tt.get(w),en=Tt.get(F),Tn=Tt.get(Me.__renderTarget),Fe=Tt.get(en.__renderTarget);rt.bindFramebuffer(D.READ_FRAMEBUFFER,Tn.__webglFramebuffer),rt.bindFramebuffer(D.DRAW_FRAMEBUFFER,Fe.__webglFramebuffer);for(let Je=0;Je<Dt;Je++)fi&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Tt.get(w).__webglTexture,q,re+Je),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Tt.get(F).__webglTexture,At,be+Je)),D.blitFramebuffer(kt,jt,kt+Vt,jt+wt,Lt,ae,Lt+Vt,ae+wt,D.DEPTH_BUFFER_BIT,D.NEAREST);rt.bindFramebuffer(D.READ_FRAMEBUFFER,null),rt.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(q!==0||w.isRenderTargetTexture||Tt.has(w)){const Me=Tt.get(w),en=Tt.get(F);rt.bindFramebuffer(D.READ_FRAMEBUFFER,U),rt.bindFramebuffer(D.DRAW_FRAMEBUFFER,z);for(let Tn=0;Tn<Dt;Tn++)fi?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Me.__webglTexture,q,re+Tn):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Me.__webglTexture,q),Ai?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,en.__webglTexture,At,be+Tn):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,en.__webglTexture,At),q!==0?D.blitFramebuffer(kt,jt,kt+Vt,jt+wt,Lt,ae,Lt+Vt,ae+wt,D.COLOR_BUFFER_BIT,D.NEAREST):Ai?D.copyTexSubImage3D(Wt,At,Lt,ae,be+Tn,kt,jt,Vt,wt):D.copyTexSubImage2D(Wt,At,Lt,ae,kt,jt,Vt,wt);rt.bindFramebuffer(D.READ_FRAMEBUFFER,null),rt.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else Ai?w.isDataTexture||w.isData3DTexture?D.texSubImage3D(Wt,At,Lt,ae,be,Vt,wt,Dt,we,Xe,Ae.data):F.isCompressedArrayTexture?D.compressedTexSubImage3D(Wt,At,Lt,ae,be,Vt,wt,Dt,we,Ae.data):D.texSubImage3D(Wt,At,Lt,ae,be,Vt,wt,Dt,we,Xe,Ae):w.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,At,Lt,ae,Vt,wt,we,Xe,Ae.data):w.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,At,Lt,ae,Ae.width,Ae.height,we,Ae.data):D.texSubImage2D(D.TEXTURE_2D,At,Lt,ae,Vt,wt,we,Xe,Ae);rt.pixelStorei(D.UNPACK_ROW_LENGTH,cn),rt.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Se),rt.pixelStorei(D.UNPACK_SKIP_PIXELS,Ti),rt.pixelStorei(D.UNPACK_SKIP_ROWS,rn),rt.pixelStorei(D.UNPACK_SKIP_IMAGES,or),At===0&&F.generateMipmaps===!0&&F.mipmapsAutoUpdate===!0&&D.generateMipmap(Wt),rt.unbindTexture()},this.initRenderTarget=function(w){Tt.get(w).__webglFramebuffer===void 0&&Rt.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?Rt.setTextureCube(w,0):w.isData3DTexture?Rt.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?Rt.setTexture2DArray(w,0):Rt.setTexture2D(w,0),rt.unbindTexture()},this.resetState=function(){W=0,X=0,it=null,rt.reset(),j.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=ve._getDrawingBufferColorSpace(t),e.unpackColorSpace=ve._getUnpackColorSpace()}}const ph={type:"change"},Bl={type:"start"},ku={type:"end"},Ur=new er,mh=new Hn,Ax=Math.cos(70*pd.DEG2RAD),Ye=new b,mn=2*Math.PI,Ee={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},ta=1e-6;class Rx extends Dp{constructor(t,e=null){super(t,e),this.state=Ee.NONE,this.target=new b,this.cursor=new b,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:hs.ROTATE,MIDDLE:hs.DOLLY,RIGHT:hs.PAN},this.touches={ONE:ls.ROTATE,TWO:ls.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new b,this._lastQuaternion=new Ne,this._lastTargetPosition=new b,this._quat=new Ne().setFromUnitVectors(t.up,new b(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Xc,this._sphericalDelta=new Xc,this._scale=1,this._panOffset=new b,this._rotateStart=new ft,this._rotateEnd=new ft,this._rotateDelta=new ft,this._panStart=new ft,this._panEnd=new ft,this._panDelta=new ft,this._dollyStart=new ft,this._dollyEnd=new ft,this._dollyDelta=new ft,this._dollyDirection=new b,this._mouse=new ft,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Px.bind(this),this._onPointerDown=Cx.bind(this),this._onPointerUp=Lx.bind(this),this._onContextMenu=zx.bind(this),this._onMouseWheel=Nx.bind(this),this._onKeyDown=Ux.bind(this),this._onTouchStart=Ox.bind(this),this._onTouchMove=Fx.bind(this),this._onMouseDown=Dx.bind(this),this._onMouseMove=Ix.bind(this),this._interceptControlDown=Bx.bind(this),this._interceptControlUp=Hx.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=Ee.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ph),this.update(),this.state=Ee.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){const e=this.object.position;Ye.copy(e).sub(this.target),Ye.applyQuaternion(this._quat),this._spherical.setFromVector3(Ye),this.autoRotate&&this.state===Ee.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=mn:n>Math.PI&&(n-=mn),s<-Math.PI?s+=mn:s>Math.PI&&(s-=mn),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Ye.setFromSpherical(this._spherical),Ye.applyQuaternion(this._quatInverse),e.copy(this.target).add(Ye),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=Ye.length();o=this._clampDistance(a*this._scale);const c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){const a=new b(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;const l=new b(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=Ye.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Ur.origin.copy(this.object.position),Ur.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ur.direction))<Ax?this.object.lookAt(this.target):(mh.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ur.intersectPlane(mh,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>ta||8*(1-this._lastQuaternion.dot(this.object.quaternion))>ta||this._lastTargetPosition.distanceToSquared(this.target)>ta?(this.dispatchEvent(ph),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?mn/60*this.autoRotateSpeed*t:mn/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Ye.setFromMatrixColumn(e,0),Ye.multiplyScalar(-t),this._panOffset.add(Ye)}_panUp(t,e){this.screenSpacePanning===!0?Ye.setFromMatrixColumn(e,1):(Ye.setFromMatrixColumn(e,0),Ye.crossVectors(this.object.up,Ye)),Ye.multiplyScalar(t),this._panOffset.add(Ye)}_pan(t,e){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;Ye.copy(s).sub(this.target);let r=Ye.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientY),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(mn*this._rotateDelta.x/e.clientHeight),this._rotateUp(mn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(mn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-mn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(mn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-mn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(mn*this._rotateDelta.x/e.clientHeight),this._rotateUp(mn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new ft,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function Cx(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Px(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Lx(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(ku),this.state=Ee.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function Dx(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case hs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=Ee.DOLLY;break;case hs.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Ee.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Ee.ROTATE}break;case hs.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Ee.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Ee.PAN}break;default:this.state=Ee.NONE}this.state!==Ee.NONE&&this.dispatchEvent(Bl)}function Ix(i){switch(this.state){case Ee.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case Ee.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case Ee.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Nx(i){this.enabled===!1||this.enableZoom===!1||this.state!==Ee.NONE||(i.preventDefault(),this.dispatchEvent(Bl),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(ku))}function Ux(i){this.enabled!==!1&&this._handleKeyDown(i)}function Ox(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case ls.ROTATE:if(this.enableRotate===!1){this.state=Ee.NONE;break}this._handleTouchStartRotate(i),this.state=Ee.TOUCH_ROTATE;break;case ls.PAN:if(this.enablePan===!1){this.state=Ee.NONE;break}this._handleTouchStartPan(i),this.state=Ee.TOUCH_PAN;break;default:this.state=Ee.NONE}break;case 2:switch(this.touches.TWO){case ls.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=Ee.TOUCH_DOLLY_PAN;break;case ls.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=Ee.TOUCH_DOLLY_ROTATE;break;default:this.state=Ee.NONE}break;default:this.state=Ee.NONE}this.state!==Ee.NONE&&this.dispatchEvent(Bl)}function Fx(i){switch(this._trackPointer(i),this.state){case Ee.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case Ee.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case Ee.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case Ee.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=Ee.NONE}}function zx(i){this.enabled!==!1&&i.preventDefault()}function Bx(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Hx(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class kx extends Ge{constructor(t=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=t,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new ft(.5,.5),this.rotation2D=0,this.addEventListener("removed",function(){this.traverse(function(e){e.element&&e.element instanceof e.element.ownerDocument.defaultView.Element&&e.element.parentNode!==null&&e.element.remove()})})}copy(t,e){return super.copy(t,e),this.element=t.element.cloneNode(!0),this.center=t.center,this.rotation2D=t.rotation2D,this}}const is=new b,gh=new Yt,_h=new Yt,xh=new b,vh=new b;class Gx{constructor(t={}){const e=this;let n,s,r,o;const a={objects:new WeakMap},c=t.element!==void 0?t.element:document.createElement("div");c.style.overflow="hidden",this.domElement=c,this.sortObjects=!0,this.getSize=function(){return{width:n,height:s}},this.render=function(p,_){p.matrixWorldAutoUpdate===!0&&p.updateMatrixWorld(),_.parent===null&&_.matrixWorldAutoUpdate===!0&&_.updateMatrixWorld(),gh.copy(_.matrixWorldInverse),_h.multiplyMatrices(_.projectionMatrix,gh),u(p,p,_),this.sortObjects&&h(p)},this.setSize=function(p,_){n=p,s=_,r=n/2,o=s/2,c.style.width=p+"px",c.style.height=_+"px"};function l(p){p.isCSS2DObject&&(p.element.style.display="none");for(let _=0,m=p.children.length;_<m;_++)l(p.children[_])}function u(p,_,m){if(p.visible===!1){l(p);return}if(p.isCSS2DObject){is.setFromMatrixPosition(p.matrixWorld),is.applyMatrix4(_h);const g=is.z>=-1&&is.z<=1&&p.layers.test(m.layers)===!0,x=p.element;if(x.style.display=g===!0?"":"none",g===!0){p.onBeforeRender(e,_,m);const v=100*p.center.x,T=100*p.center.y;x.style.transformOrigin=`${v}% ${T}%`;const A=-p.rotation2D,M=is.x*r+r,E=-is.y*o+o;x.style.transform=`translate(${-v}%, ${-T}%) translate(${M}px, ${E}px) rotate(${A}rad)`,x.parentNode!==c&&c.appendChild(x),p.onAfterRender(e,_,m)}const y={distanceToCameraSquared:d(m,p)};a.objects.set(p,y)}for(let g=0,x=p.children.length;g<x;g++)u(p.children[g],_,m)}function d(p,_){return xh.setFromMatrixPosition(p.matrixWorld),vh.setFromMatrixPosition(_.matrixWorld),xh.distanceToSquared(vh)}function f(p){const _=[];return p.traverseVisible(function(m){m.isCSS2DObject&&_.push(m)}),_}function h(p){const _=f(p).sort(function(g,x){if(g.renderOrder!==x.renderOrder)return x.renderOrder-g.renderOrder;const y=a.objects.get(g).distanceToCameraSquared,v=a.objects.get(x).distanceToCameraSquared;return y-v}),m=_.length;for(let g=0,x=_.length;g<x;g++)_[g].element.style.zIndex=m-g}}}function vo(i,t=!1){const e=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},o={},a=i[0].morphTargetsRelative,c=new De;c.morphTargetsRelative=a;let l=0;for(let u=0;u<i.length;++u){const d=i[u];let f=0,h=0;if(e!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const p in d.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;r[p]===void 0&&(r[p]=[]),r[p].push(d.attributes[p]),f++}if(f!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const p in d.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;if(d.morphAttributes[p].length!==i[0].morphAttributes[p].length)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have the same number of morph targets for the "'+p+'" morph attribute.'),null;o[p]===void 0&&(o[p]=[]),o[p].push(d.morphAttributes[p]),h++}if(h!==s.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of morph attributes."),null;if(t){let p;if(e)p=d.index.count;else if(d.attributes.position!==void 0)p=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;c.addGroup(l,p,u),l+=p}}if(e){let u=0;const d=[];for(let f=0;f<i.length;++f){const h=i[f].index;for(let p=0;p<h.count;++p)d.push(h.getX(p)+u);u+=i[f].attributes.position.count}c.setIndex(d)}for(const u in r){const d=Mh(r[u]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;c.setAttribute(u,d)}for(const u in o){const d=o[u][0].length;if(d!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[u]=[];for(let f=0;f<d;++f){const h=[];for(let _=0;_<o[u].length;++_)h.push(o[u][_][f]);const p=Mh(h);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;c.morphAttributes[u].push(p)}}}return c}function Mh(i){let t,e,n,s=-1,r=0;for(let l=0;l<i.length;++l){const u=i[l];if(t===void 0&&(t=u.array.constructor),t!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=u.itemSize),e!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=u.count*e}const o=new t(r),a=new bn(o,e,n);let c=0;for(let l=0;l<i.length;++l){const u=i[l];if(u.isInterleavedBufferAttribute){const d=c/e;for(let f=0,h=u.count;f<h;f++)for(let p=0;p<e;p++){const _=u.getComponent(f,p);a.setComponent(f+d,p,_)}}else o.set(u.array,c);c+=u.count*e}return s!==void 0&&(a.gpuType=s),a}function Vx(i,t=Math.PI/3){const e=i.index?i.toNonIndexed():i,n=e.attributes.position,s=n.count;let r;if(n.isBufferAttribute===!0&&n.itemSize===3&&n.normalized===!1)r=n.array;else{r=new Float64Array(s*3);for(let v=0;v<s;v++)r[3*v+0]=n.getX(v),r[3*v+1]=n.getY(v),r[3*v+2]=n.getZ(v)}const o=Math.cos(t),a=(1+1e-10)*100,c=s/3,l=new Float64Array(c*3);for(let v=0;v<c;v++){const T=9*v,A=r[T+0],M=r[T+1],E=r[T+2],I=r[T+3],P=r[T+4],C=r[T+5],N=r[T+6],B=r[T+7],U=r[T+8],z=N-I,W=B-P,X=U-C,it=A-I,L=M-P,H=E-C,k=W*H-X*L,at=X*it-z*H,mt=z*L-W*it,V=1/(Math.sqrt(k*k+at*at+mt*mt)||1);l[3*v+0]=k*V,l[3*v+1]=at*V,l[3*v+2]=mt*V}const u=new Int32Array(s),d=new Float64Array(s*3);let f=1;for(;f<s*2;)f<<=1;const h=f-1,p=new Int32Array(f);let _=0;for(let v=0;v<s;v++){const T=3*v,A=Math.trunc(r[T+0]*a),M=Math.trunc(r[T+1]*a),E=Math.trunc(r[T+2]*a);let I=(Math.imul(A,73856093)^Math.imul(M,19349663)^Math.imul(E,83492791))&h;for(;;){const P=p[I];if(P===0){const N=3*_;d[N+0]=A,d[N+1]=M,d[N+2]=E,p[I]=_+1,u[v]=_++;break}const C=3*(P-1);if(d[C+0]===A&&d[C+1]===M&&d[C+2]===E){u[v]=P-1;break}I=I+1&h}}const m=new Int32Array(_+1);for(let v=0;v<s;v++)m[u[v]+1]++;for(let v=0;v<_;v++)m[v+1]+=m[v];const g=new Int32Array(s),x=m.slice(0,_);for(let v=0;v<c;v++){const T=3*v;g[x[u[T+0]]++]=v,g[x[u[T+1]]++]=v,g[x[u[T+2]]++]=v}const y=new Float32Array(s*3);for(let v=0;v<c;v++){const T=3*v,A=l[T+0],M=l[T+1],E=l[T+2];for(let I=0;I<3;I++){const P=T+I,C=u[P];let N=0,B=0,U=0;for(let W=m[C],X=m[C+1];W<X;W++){const it=3*g[W],L=l[it+0],H=l[it+1],k=l[it+2];A*L+M*H+E*k>o&&(N+=L,B+=H,U+=k)}const z=1/(Math.sqrt(N*N+B*B+U*U)||1);y[3*P+0]=N*z,y[3*P+1]=B*z,y[3*P+2]=U*z}}return e.setAttribute("normal",new bn(y,3,!1)),e}const Wx=new b(0,.04,.62),Xx=new b(0,-.05,.14),Ce=(i,t,e)=>new b(i,t,e),el=Ce(-1,0,0),Yx=Ce(0,-1,0),un=i=>i.origin.clone().addScaledVector(i.z,i.size.z);function ss(i,t,e,n){const s=t.clone().sub(i),r=s.length();s.normalize();const o=el.clone().addScaledVector(s,-el.dot(s)).normalize();return{origin:i.clone(),x:o,y:s.clone().cross(o),z:s,size:Ce(e,n,r)}}function Or(i,t,e){const n=s=>e?s.clone().transformDirection(e):s.clone();return{origin:i,x:n(el),y:n(Yx),z:n(Ce(0,0,1)),size:t}}function Mo(i){const t=i.plan.kind==="humanoid"?i.plan:i.plan.kind==="human"?void 0:null;if(t===null)return;const e=i.height,n=e/1.75,s=i.posture==="sitting",r=e*i.legShare,o=.26*e,a=s?r-o:0,c=r-a,l=i.headHeight/2,u=i.limbRadius*1.15,d=i.hipHalf*.55,f=.06*n,h={};for(const[P,C]of[[-1,"left"],[1,"right"]]){const N=P*d,B=Ce(N,0,c);let U,z,W=u,X=u,it;s?(U=Ce(N,.24*e,o),z=Ce(N,.24*e,f+u),W=u*.9,it=Or(Ce(N,.24*e+.04*n,0),Ce(u*2.2,.16*n,f))):t!=null&&t.digitigrade?(U=Wx.clone().multiply(Ce(1,e,c)).setX(N),z=Xx.clone().multiplyScalar(e).setX(N),X=u*1.15,W=u*.85,it=Or(Ce(N,.06*e,0),Ce(u*2.1,u*3.57,f))):(z=Ce(N,0,f+u),U=z.clone().lerp(Ce(N,0,c-u*.5),.5),it=Or(Ce(N,.04*n,0),Ce(u*2.2,.16*n,f))),h[`${C}_thigh`]=ss(U,B,X*2,X*2),h[`${C}_shin`]=ss(z,U,W*2,W*2),h[`${C}_foot`]=it}const p=(t==null?void 0:t.hunch)??0,_=new Yt().makeTranslation(0,0,c).multiply(new Yt().makeRotationX(-p)),m=(P,C,N)=>Ce(P,C,N).applyMatrix4(_),g=(e-a-c)/Math.cos(p),x=g-i.headHeight-.045*e,y=.05*e,v=x-i.limbRadius*1.2,T=.045*n*(t?t.shape.limbs*(t.neckScale??1):1),A=(P,C,N,B)=>ss(m(P.x,P.y,P.z),m(C.x,C.y,C.z),N,B);h.waist=A(Ce(0,0,-.07*e),Ce(0,0,y),i.hipHalf*2,Math.max(i.hipHalf,i.waistHalf)*2*.62),h.torso=A(Ce(0,0,y),Ce(0,0,x),i.shoulderHalf*2,Math.max(i.waistHalf,i.shoulderHalf*.92)*2*.55),h.neck=A(Ce(0,0,x-.01),Ce(0,0,g-l*1.6),T*2,T*2);const M=m(0,0,g-l),E=t?new Yt().makeRotationFromEuler(new ke(-t.droop,t.droop*.6,0)):void 0,I=Ce(0,0,1).transformDirection(E??new Yt);h.head=Or(M.clone().addScaledVector(I,-l),Ce(2*.84*l,2*.95*l,i.headHeight),E);for(const[P,C]of[[-1,"left"],[1,"right"]]){const N=m(P*i.shoulderHalf,0,v);let B;if(t){const X=s?c+.02*e:Math.max(.05*e,t.wristShare*e),it=Math.max(.12*e,N.z-X);B=Ce(P*(i.hipHalf+i.limbRadius*1.6),N.y+Math.tan(t.reach)*it+(s?.08*n:0),N.z-it)}else B=Ce(P*(i.hipHalf+i.limbRadius*1.6),s?.08*n:0,c-.02*e);const U=N.clone().lerp(B,.5),z=i.limbRadius;h[`${C}_upper_arm`]=ss(U,N,z*2,z*2),h[`${C}_forearm`]=ss(B,U,z*2,z*2);const W=t?B.clone().sub(N).normalize():Ce(0,0,-1);h[`${C}_hand`]=ss(B.clone().addScaledVector(W,z*2.55),B,z*2.5,z*2.5)}return h}function Gu(i){return new Yt().makeTranslation(0,i.height/2,.13*(i.height/1.75)).multiply(new Yt().makeRotationX(Math.PI/2))}function qx(i){const t=Mo(i);if(!t||i.posture!=="reclining")return t;const e=Gu(i);for(const n of Object.values(t)){n.origin.applyMatrix4(e);for(const s of[n.x,n.y,n.z])s.transformDirection(e)}return t}function Zx(i){return new Yt().makeBasis(i.x.clone().multiplyScalar(i.size.x),i.y.clone().multiplyScalar(i.size.y),i.z.clone().multiplyScalar(i.size.z)).setPosition(i.origin)}const lt=(i,t,e)=>new b(i,t,e),Nt=(i,t)=>({...i,name:t});function nl(i,t){for(const e of i)e.geometry.applyMatrix4(t);return i}function Kx(i){const t=i.plan;return t.kind==="humanoid"?jx(i,t):t.kind==="animal"?tv(i,t):Jx(i)}function Jx(i){const t=i.height,e=i.footprint?Math.min(i.footprint.width,i.footprint.depth):.36*(t/1.75),n=Math.max(.02,Math.min(e*.45,t/4));return[Nt(Le(lt(0,0,n),lt(0,0,Math.max(n*1.01,t-n)),n,i.colours.skin),"placeholder")]}const yh=[.8,.4,.1,-.25,.6,-.1,.25];function $x(i,t){const e=i.geometry.index?i.geometry.toNonIndexed():i.geometry;e!==i.geometry&&i.geometry.dispose();const n=e.getAttribute("position").count;e.setIndex([...Array(n).keys()]),e.computeVertexNormals();const s=new Float32Array(n);for(let r=0;r<n/3;r++)s.fill(yh[r*3%yh.length],r*3,r*3+3);return{...i,geometry:e,shade:s,tone:t}}const ea=new b(.85,1.35,.85);function Qx(i,t,e,n){const s=i.colours,r=t.headColour??s.skin,o=s.eyes??Bn,a=[],c=l=>[-1,1].map(l);switch(t.head){case"wolf":{a.push(Nt(ie(lt(0,0,0),e,r,lt(.92,.95,.9),12),"skull")),a.push(Nt(ie(lt(0,e*.95,-e*.28),e*.5,t.accent,lt(.72,1.55,.68),10),"muzzle")),a.push(Nt(ie(lt(0,e*.8,-e*.58),e*.36,t.accent,lt(.66,1.3,.45),8),"jaw")),a.push(Nt(ie(lt(0,e*1.7,-e*.18),e*.15,Bn,void 0,8),"nose")),a.push(...c(l=>Nt(ui(lt(l*e*.5,-e*.1,e*.6),lt(l*.32,-.1,1).normalize(),e*.28,e*.85,r,4),"ear"))),a.push(...c(l=>Nt(ie(lt(l*e*.36,e*.74,e*.16),e*.11,o,void 0,8),"eye")));break}case"slack":{a.push(Nt(ie(lt(0,0,0),e,r,lt(.84,.95,1),12),"skull")),a.push(...c(l=>Nt(ie(lt(l*e*.32,e*.84,e*(l<0?.14:.06)),e*.11,o,void 0,8),"eye"))),a.push(...c(l=>Nt(ie(lt(l*e*.32,e*.93,e*(l<0?.14:.06)),e*.04,Bn,void 0,6),"pupil"))),a.push(Nt(Qe(new Si(e*.13,e*.3,6),r,lt(0,e*.98,-e*.08)),"nose")),a.push(Nt(ie(lt(0,e*.84,-e*.48),e*.16,t.accent,lt(1.2,.5,1),8),"mouth")),a.push(...c(l=>Nt(ie(lt(l*e*.84,0,0),e*.22,r,lt(.5,1,1.3),8),"ear")));break}case"ghoul":{a.push(Nt(ie(lt(0,0,e*.08),e,r,lt(.8,.92,1),12),"skull")),a.push(Nt(ie(lt(0,e*.32,-e*.55),e*.62,t.accent,lt(1.08,.95,.72),10),"jaw")),a.push(Nt(Hi(lt(0,e*.92,-e*.58),lt(e*.7,e*.06,e*.07),Bn),"mouth")),a.push(...c(l=>Nt(ie(lt(l*e*.3,e*.78,e*.18),e*.09,o,void 0,8),"eye"))),a.push(...c(l=>Nt(ui(lt(l*e*.74,0,e*.1),lt(l,-.3,.5).normalize(),e*.16,e*.4,r,4),"ear")));break}case"primate":{a.push(Nt(ie(lt(0,0,0),e,r,lt(.95,.9,.95),12),"skull")),a.push(Nt(ie(lt(0,e*.42,-e*.08),e*.7,t.accent,lt(.85,.75,.95),10),"face")),a.push(Nt(Le(lt(-e*.46,e*.82,e*.26),lt(e*.46,e*.82,e*.26),e*.14,r,!1),"brow")),a.push(Nt(ie(lt(0,e*.86,-e*.36),e*.38,t.accent,lt(1.1,.8,.75),8),"muzzle")),a.push(...c(l=>Nt(ie(lt(l*e*.12,e*1.15,-e*.3),e*.05,Bn,void 0,6),"nostril"))),a.push(...c(l=>Nt(ie(lt(l*e*.3,e*.92,e*.1),e*.09,o,void 0,8),"eye"))),a.push(...c(l=>Nt(ie(lt(l*e*.95,0,0),e*.26,t.accent,lt(.5,1,1.1),8),"ear")));break}case"crystal":{a.push(Nt(Qe(new Il(e,0),r,lt(0,0,0),void 0,lt(.86,.95,1.05)),"skull")),a.push(...c(l=>Nt(Qe(new Nl(e*.12,0),o,lt(l*e*.32,e*.82,e*.12)),"eye"))),a.push(Nt(ui(lt(e*.15,-e*.2,e*.75),lt(.25,-.35,1).normalize(),e*.2,e*.7,t.accent,4),"spur"));break}case"shark":{a.push(Nt(ie(lt(0,e*.25,0),e,r,ea,12),"snout")),a.push(Nt(ie(lt(0,e*.32,-e*.3),e,t.accent,lt(.78,1.25,.58),10),"underside"));const l=1.9,u=new li(1,.06,3,16,l);u.rotateZ(Math.PI/2-l/2),u.scale(e*.8,e*1.27,e),u.translate(0,e*.32,-e*.36),a.push(Nt({geometry:u,colour:Bn},"mouth"));for(const _ of[-1,1]){const m=48*Math.PI/180;a.push(Nt(ie(lt(_*e*ea.x*Math.sin(m),e*.25+e*ea.y*Math.cos(m),e*.08),e*.12,o,void 0,8),"eye")),a.push(Nt(ie(lt(_*e*.17,e*1.54,-e*.1),e*.045,Bn,void 0,6),"nostril"));for(let g=0;g<3;g++)a.push(Nt(Hi(lt(_*e*.5,-e*(.05+g*.14),-e*.82),lt(e*.05,e*.035,e*.3),Zr(r,Bn,.55)),"gill"))}const d=-e*.45,f=-e*1.2,h=new Vn(e*.6,n*1.05,d-f,12,1);h.rotateX(Math.PI/2),h.translate(0,e*.05,(d+f)/2),a.push(Nt({geometry:h,colour:r},"taper"));const p=new Si(e*.42,e*.95,4);p.scale(.22,1,1),p.rotateX(Math.PI/2-.45),a.push(Nt(Qe(p,r,lt(0,-e*.2,e*.95)),"fin"));break}}if(i.headCovered){const l=new Wn(e*1.08,12,5,0,Math.PI*2,0,Math.PI/2);l.rotateX(-.5),a.push(Nt({geometry:l,colour:s.head},"hood"))}return a}function jx(i,t){const e=i.colours,n=i.height,s=n/1.75,r=t.covering==="crystal",o=i.posture==="sitting",a=Mo(i),c=un(a.left_thigh).z,l=a.head.size.z/2,u=i.limbRadius*1.15,d=a.left_foot.size.z,f=[];for(const I of["left","right"]){const P=a[`${I}_thigh`],C=a[`${I}_shin`],N=a[`${I}_foot`],B=N.origin.x;o||!t.digitigrade?(o?(f.push(Nt(Le(un(P),P.origin,u,e.legs,!r),"thigh")),f.push(Nt(Le(P.origin,C.origin,C.size.x/2,e.legs,!r),"shin"))):f.push(...so(un(P).addScaledVector(P.z,-u*.5),P.origin,C.origin,u,e.legs,["thigh","shin"],!r)),f.push(Hi(lt(B,N.origin.y,d/2),N.size.clone(),e.feet))):(f.push(Nt(Le(un(P),P.origin,P.size.x/2,e.legs,!r),"thigh")),f.push(Nt(Le(P.origin,C.origin,C.size.x/2,e.legs,!r),"shin")),f.push(Nt(Le(C.origin,lt(B,.03*n,d),u*.65,e.feet,!r),"heel")),f.push(Nt(ie(N.origin.clone().setZ(d*.6),u*1.05,e.feet,lt(1,1.7,.6),8),"paw")))}const h=new Yt().makeBasis(a.waist.x.clone().negate(),a.waist.y.clone().negate(),a.waist.z).setPosition(0,0,c),p=a.waist.origin.clone().sub(lt(0,0,c)).dot(a.waist.z),_=p+a.waist.size.z,m=_+a.torso.size.z,g=m-i.limbRadius*1.2,x=a.neck.size.x/2,y=r?6:void 0,v=[Xn(p,_,i.hipHalf,i.waistHalf,.62,e.hips,0,y),Xn(_,m,i.waistHalf,i.shoulderHalf*.92,.55,e.torso,0,y),Le(lt(-i.shoulderHalf*.9,0,g),lt(i.shoulderHalf*.9,0,g),i.limbRadius*1.35,e.torso,!r),Xn(m-.01,m-.01+a.neck.size.z,x,x,1,e.neck,0,y)];if(t.chest&&e.torso===e.skin){const I=m-_;v.push(Nt(ie(lt(0,i.shoulderHalf*.1,_+I*.7),1,t.accent,lt(i.shoulderHalf*.72,i.shoulderHalf*.42,I*.24),12),"chest")),v.push(Nt(ie(lt(0,i.waistHalf*.12,_+I*.35),1,t.accent,lt(i.waistHalf*.6,i.waistHalf*.45,I*.3),12),"chest"))}if(r)for(const[I,P,C,N,B]of[[-.75,-.1,-.5,-.3,1],[.7,-.15,.45,-.4,.8],[.25,-.45,.2,-.8,.9],[-.3,-.4,-.3,-.7,.7]])v.push(Nt(ui(lt(I*i.shoulderHalf,P*i.shoulderHalf,g+i.limbRadius*.4),lt(C,N,1).normalize(),.035*s*B,.16*s*B,t.accent,4),"shard"));f.push(...nl(v,h));const T=a.head,A=T.origin.clone().addScaledVector(T.z,l);f.push(...nl(Qx(i,t,l,x),new Yt().makeBasis(T.x.clone().negate(),T.y.clone().negate(),T.z).setPosition(A)));for(const I of["left","right"]){const P=a[`${I}_upper_arm`],C=a[`${I}_hand`];f.push(...so(un(P),P.origin,a[`${I}_forearm`].origin,i.limbRadius,e.arms,["upper arm","forearm"],!r)),f.push(Nt(ie(C.origin.clone().addScaledVector(C.z,i.limbRadius*1.25),i.limbRadius*1.25,e.hands,void 0,8),"hand"))}const M=e.skin,E=A.z+l*.8;for(const I of i.extras)if(I==="tail"){const P=lt(0,-i.hipHalf*.6,c),C=lt(0,P.y-.3*s,o?.04:c-.16*n);f.push(Nt(Le(P,C,i.limbRadius*(t.covering==="fur"?.85:.6),M,!1),"tail"))}else if(I==="horns"||I==="antlers")for(const P of[-1,1]){const C=lt(A.x+P*l*.45,A.y,E);I==="horns"?f.push(Nt(ui(C,lt(P*.35,.2,1).normalize(),l*.16,l*.7,Bs,6),"horn")):f.push(Nt(Le(C,C.clone().add(lt(P*l,-l*.2,l*1.4)),l*.07,Bs,!1),"antler"))}else if(I==="wings")for(const P of[-1,1])f.push(Nt(Wu(P,s,lt(P*i.shoulderHalf*.45,-.1*s,g-.04*n).applyMatrix4(h),M),"wing"));return r?f.map(I=>$x(I,t.accent)):f}function tv(i,t){var d,f,h,p;const e=i.height,n=t.animal==="snake",s=n?ov(t,((d=i.footprint)==null?void 0:d.width)??e*2,((f=i.footprint)==null?void 0:f.depth)??e*8,e):t.animal==="duck"?ev(t):nv(t),r=new ln;for(const _ of s)_.geometry.computeBoundingBox(),_.geometry.boundingBox&&r.union(_.geometry.boundingBox);const o=r.getSize(new b),a=r.getCenter(new b),c=((h=i.footprint)==null?void 0:h.width)??e*(o.x/o.z),l=((p=i.footprint)==null?void 0:p.depth)??e*(o.y/o.z),u=n?1:t.animal==="songbird"?Math.min(c/o.x,e/o.z):Math.min(c/o.x,l/o.y,e/o.z);return nl(s,new Yt().makeScale(u,u,u).multiply(new Yt().makeTranslation(-a.x,-a.y,-r.min.z)))}function ev(i){const t=Zr(i.skin,Bn,.65),e=[Nt(ie(lt(0,-.02,.32),.2,i.skin,lt(1.1,2.05,.95),12),"body"),Nt(ie(lt(0,.24,.3),.17,i.accent,lt(1.05,1,1.05),10),"breast"),...[-1,1].map(n=>Nt(ie(lt(n*.16,-.08,.38),.13,i.wing,lt(.55,2.1,.75),10),"wing")),Nt(ui(lt(0,-.38,.37),lt(0,-1,.4).normalize(),.09,.17,t,5),"tail"),Nt(Le(lt(0,.3,.42),lt(0,.36,.6),.065,i.head,!1),"neck"),Nt(Qe(new li(.068,.014,3,10),"#f2f0ea",lt(0,.31,.45)),"ring"),Nt(ie(lt(0,.38,.65),.1,i.head,lt(.9,1.15,.95),10),"head"),Nt(ie(lt(0,.53,.61),.06,i.beak,lt(.9,1.6,.38),8),"bill"),...[-1,1].map(n=>Nt(ie(lt(n*.072,.42,.68),.013,i.eyes,void 0,6),"eye"))];for(const n of[-1,1])e.push(Nt(Le(lt(n*.07,.02,.15),lt(n*.07,.04,.02),.018,i.feet,!1),"leg")),e.push(Nt(Hi(lt(n*.07,.08,.008),lt(.08,.1,.016),i.feet),"foot"));return e}function nv(i){const t=[Nt(ie(lt(0,0,.33),.2,i.skin,lt(.9,1.35,1),12),"body"),Nt(ie(lt(0,.17,.31),.15,i.accent,lt(.9,.95,1),10),"breast"),Nt(ie(lt(0,.2,.57),.12,i.head,void 0,10),"head"),Nt(ui(lt(0,.29,.57),lt(0,1,-.15).normalize(),.045,.13,i.beak,5),"beak"),Nt(Hi(lt(0,-.4,.41),lt(.16,.26,.025),i.wing,new ke(-.5,0,0)),"tail"),...[-1,1].map(e=>Nt(ie(lt(e*.085,.28,.61),.02,i.eyes,void 0,6),"eye")),...[-1,1].map(e=>Nt(ie(lt(e*.15,-.1,.39),.12,i.wing,lt(.35,2,.75),8),"wing"))];for(const e of[-1,1])t.push(Nt(Le(lt(e*.05,.03,.16),lt(e*.05,.05,.02),.012,i.feet,!1),"leg")),t.push(Nt(Hi(lt(e*.05,.08,.006),lt(.03,.08,.012),i.feet),"foot"));return t}const iv=.03,sv=.6,rv=.022;function ov(i,t,e,n){const s=Math.max(sv,t,e,n),r=Math.max(iv,s*rv),o=r*1.3,a=Math.max(s*.1,Math.min(s*.15,n-2*r-o)),c=[];if(e>=s*.8){const x=e*.85,y=Math.max(r*1.5,Math.min(t/2-r*1.2,s*.12));for(let v=0;v<=14;v++)c.push(lt(y*Math.sin(v/14*Math.PI*2.5),-x/2+v/14*x*.9,r))}else{const x=r*2.3,y=r*2.2,T=(Math.sqrt(s*.85*x/Math.PI+y*y)-y)/x,A=Math.max(16,Math.min(40,Math.round(T*14)));for(let M=0;M<=A;M++){const E=T*Math.PI*2*(1-M/A),I=y+x*E/(Math.PI*2);c.push(lt(I*Math.sin(E),I*Math.cos(E),r))}}const l=c[c.length-1],u=lt(0,1,0),d=x=>l.clone().addScaledVector(u,s*.06*Math.sin(x*Math.PI/2)).setZ(r+a*(1-Math.cos(x*Math.PI/2))),f=[1,2,3,4].map(x=>d(x/4)),h=[...c,...f],p=[];for(let x=0;x<h.length-1;x++){const y=(x+.5)/(h.length-1),v=x>=c.length-1,T=r*(.3+.7*Math.min(1,y/.3))*(v?.85:1);p.push(Nt(Le(h[x],h[x+1],T,!v&&Math.floor(x/2)%2?i.accent:i.skin,!1),"segment"))}const _=h[h.length-1].clone().addScaledVector(u,o*.9),m=new ke(0,0,0);p.push(Nt(Qe(new Wn(o,10,8),i.head,_,m,lt(1,1.5,.7)),"head"));for(const x of[-1,1]){const y=lt(x*o*.75,o*.45,o*.3).applyEuler(m).add(_);p.push(Nt(ie(y,o*.2,i.eyes,void 0,6),"eye"))}const g=_.clone().addScaledVector(u,o*1.45);return p.push(Nt(Le(g,g.clone().addScaledVector(u,o*1.1),o*.08,i.beak,!1),"tongue")),p}const ce=(i,t)=>({...i,name:t}),sr=10,na="#ece8e0",av=1.3,lv=Bn,il=.006,Ds=1.03,ia=.005,cv=.66;function Qe(i,t,e,n,s){const r=new Yt().compose(e,new Ne().setFromEuler(n??new ke),s??new b(1,1,1));return i.applyMatrix4(r),{geometry:i,colour:t}}const Vu=.05,hv=14,uv=1.45,fv=.15,dv=1.8;function Xr(i,t,e,n,s=1,r,o=()=>1,a=0,c={swing:1.6,lobes:5,strands:0}){if(e==="straight")return;const l=new Float32Array(i.getAttribute("position").count),u=i.getAttribute("position"),d=new b,f=new b,h=new b;for(let p=0;p<u.count;p++){d.fromBufferAttribute(u,p),f.subVectors(d,t(d)),h.copy(d);const _=Math.atan2(h.y-t(d).y,h.x-t(d).x),m=((h.z-a)*s+a)/n,[g,x]=e==="wavy"?[Vu,Math.sin(m*7+c.swing*Math.sin(_*c.lobes)+c.strands*Math.sin(_*17))]:e==="curly"?[.09,Math.sin(_*7)*Math.sin(m*9)]:[.1,Math.sin(_*11)*Math.sin(m*14)];l[p]=.5+.5*x;const y=n*g*l[p]*o(d,p)/Math.max(1e-6,f.length());d.addScaledVector(f,y),u.setXYZ(p,d.x,d.y,d.z)}return u.needsUpdate=!0,i.computeVertexNormals(),l}function pv(i,t,e,n,s,r,o,a){const c=i.getAttribute("position"),l=c.count/2,u=l/(t+1)-1,d=new Float32Array(c.count),f=new b,h=new b;for(let p=0;p<c.count;p++){const _=p%l,[m,g]=[_%(t+1),Math.floor(_/(t+1))],x=Math.floor(m/2),y=m%2===1,v=N=>{const B=Math.sin(x*12.9898+N*78.233)*43758.5453;return B-Math.floor(B)},T=2*Math.PI*g/(e*(.67+.83*v(1)))+2*Math.PI*v(2),A=Math.min(1,Math.min(m,t-m)/2),M=(y?.45+.3*v(3)+.3*Math.sin(T):.12)*A,E=y?(.2+.15*v(4))*Math.cos(T)*A:0;f.fromBufferAttribute(c,p),h.subVectors(f,n(f));const I=Math.max(1e-6,Math.hypot(h.x,h.y)),P=a(f,m),C=E*I*s/t;f.x+=(h.x/I*r*.12*M+-h.y/I*C)*P,f.y+=(h.y/I*r*.12*M+h.x/I*C)*P,g===u&&y&&(f.z-=o*v(5)),c.setXYZ(p,f.x,f.y,f.z),d[p]=M}return c.needsUpdate=!0,i.computeVertexNormals(),d}const ms=.75,sa={straight:0,wavy:ms*.375,curly:ms*.3125,coily:ms*.3125};function mv(i,t,e){return!t||!e?i:{...i,shade:t.map(n=>ms*n*n),tone:e}}function sl(i,t){const e=new Float32Array(i);for(let n=0;n<i;n++)e[n]=n%t%2?1:.15;return e}const Sh=16,Eh=4,le=i=>{const t=Math.min(1,Math.max(0,i));return t*t*(3-2*t)};function Fr(i){const t=Math.abs(i-Math.PI/2);return .96+.79*le((t-.25)/.9)-.79*le((t-1.5)/.5)}function bh(i,t,e,n,s,r,o){const a=[],c=[];for(let d=0;d<=e;d++)for(let f=0;f<=t;f++){const h=n+s*f/t,p=r(h)+(o(h)-r(h))*d/e;a.push(-i*Math.cos(h)*Math.sin(p),i*Math.cos(p),i*Math.sin(h)*Math.sin(p))}const l=(d,f)=>f*(t+1)+d;for(let d=0;d<e;d++)for(let f=0;f<t;f++){const h=l(f+1,d),p=l(f,d),_=l(f,d+1),m=l(f+1,d+1);c.push(h,p,m,p,_,m)}const u=new De;return u.setAttribute("position",new ue(a,3)),u.setIndex(c),u.computeVertexNormals(),u}function gv(i,t){const e=i.getIndex();if(e){for(let n=0;n<e.count;n++){const s=e.getX(n),[r,o]=[s%(t+1),Math.floor(s/(t+1))];o===0?e.setX(n,0):r===t&&e.setX(n,o*(t+1))}e.needsUpdate=!0,i.computeVertexNormals(),rl(i,t)}}function rl(i,t){const e=i.getAttribute("normal");for(let n=0;n<e.count;n++){const[s,r]=[n%(t+1),Math.floor(n/(t+1))],o=r===0?0:s===t?r*(t+1):n;o!==n&&e.setXYZ(n,e.getX(o),e.getY(o),e.getZ(o))}e.needsUpdate=!0}function ol(i){const t=i.clone(),e=t.getIndex();if(e){const r=e.array,o=new Uint32Array(r.length);for(let a=0;a<r.length;a+=3)o[a]=r[a],o[a+1]=r[a+2],o[a+2]=r[a+1];t.setIndex(new bn(o,1))}const n=t.getAttribute("normal");for(let r=0;r<n.count;r++)n.setXYZ(r,-n.getX(r),-n.getY(r),-n.getZ(r));const s=vo([i,t],!1);if(i.dispose(),t.dispose(),!s)throw new Error("hair could not be made two-sided");return s}function _v(i,t,e,n,s){const r=i.getAttribute("position"),o=[],a=new b;for(let h=0;h<=t;h++)o.push(r.getX(e*(t+1)+h),r.getY(e*(t+1)+h),r.getZ(e*(t+1)+h));for(let h=0;h<=t;h++){a.set(o[h*3],o[h*3+1],o[h*3+2]).sub(n);const p=Math.min(a.length(),s(a.clone().normalize()));a.setLength(p).add(n),o.push(a.x,a.y,a.z)}const c=[];for(let h=0;h<t;h++){const p=h+1===t?0:h+1,[_,m,g,x]=[h,p,t+1+h,t+1+p];c.push(_,g,m,m,g,x)}const l=new De;l.setAttribute("position",new ue(o,3)),l.setIndex(c),l.computeVertexNormals();const u=ol(l),d=u.getAttribute("normal"),f=i.getAttribute("normal");for(let h=0;h<d.count;h++){const p=e*(t+1)+h%(t+1);d.setXYZ(h,f.getX(p),f.getY(p),f.getZ(p))}return u}function Wu(i,t,e,n){const s=new yu;s.moveTo(0,0),s.quadraticCurveTo(.15,.32,.62,.44),s.quadraticCurveTo(.56,.26,.5,.2),s.quadraticCurveTo(.46,.05,.37,.08),s.quadraticCurveTo(.33,-.1,.23,-.05),s.quadraticCurveTo(.18,-.26,.08,-.22),s.quadraticCurveTo(.04,-.1,0,-.08),s.closePath();const r=new Dl(s,{depth:.015,bevelEnabled:!1,curveSegments:4});return r.setIndex([...Array(r.getAttribute("position").count).keys()]),r.translate(0,0,-.0075),r.rotateX(Math.PI/2),i<0&&r.rotateZ(Math.PI),r.rotateZ(-i*.5),r.scale(t,t,t),r.translate(e.x,e.y,e.z),{geometry:r,colour:n}}const Ii=(i,t,e,n)=>Le(i,t,e,n,!1);function Le(i,t,e,n,s=!0){const r=i.distanceTo(t),o=new Rl(e,Math.max(.001,r),s?2:1,s?sr:6),a=new b().subVectors(t,i).normalize(),c=new Ne().setFromUnitVectors(new b(0,1,0),a);return o.applyMatrix4(new Yt().compose(i.clone().add(t).multiplyScalar(.5),c,new b(1,1,1))),{geometry:o,colour:n}}function so(i,t,e,n,s,r,o=!0){const a=o?2:1,c=(l,u)=>{const d=t.distanceTo(l),f=[new ft(n,0),new ft(n,d)];for(let _=1;_<=a;_++){const m=_/a*(Math.PI/2);f.push(new ft(_===a?0:n*Math.cos(m),d+n*Math.sin(m)))}const h=new mo(f,o?sr:6),p=new b().subVectors(l,t).normalize();return h.applyMatrix4(new Yt().compose(t,new Ne().setFromUnitVectors(new b(0,1,0),p),new b(1,1,1))),ce({geometry:h,colour:s},u)};return[c(i,r[0]),c(e,r[1])]}function Xn(i,t,e,n,s,r,o=0,a=sr*2){const c=new Vn(n,e,Math.max(.001,t-i),a);return Qe(c,r,new b(0,o,(i+t)/2),new ke(Math.PI/2,0,0),new b(1,1,s))}function ie(i,t,e,n,s=sr){return Qe(new Wn(t,s,Math.max(4,s-2)),e,i,void 0,n)}function Hi(i,t,e,n){return Qe(new Kn(t.x,t.y,t.z),e,i,n)}function Is(i,t,e,n,s,r){const o=new Vn(n,n,il,sr*2,1,!0);return Qe(o,r,new b(i,t,e),new ke(Math.PI/2,0,0),new b(1,1,s))}function ui(i,t,e,n,s,r=5){const o=new Si(e,n,r,1,!0);return o.applyMatrix4(new Yt().compose(i.clone().addScaledVector(t,n/2),new Ne().setFromUnitVectors(new b(0,1,0),t),new b(1,1,1))),{geometry:o,colour:s}}function xv(i,t,e,n){const[s,r]=[1.25,-2.3],o=14,a=[],c=[];for(let d=0;d<=o;d++){const f=d/o,h=s+(r-s)*f,p=Math.min(1,f/.12,(1-f)/.12),_=1+n*Math.sqrt(Math.max(0,p)),[m,g]=[Math.sin(h),Math.cos(h)];for(const[x,y]of[[1,.1],[_,.055]])for(const v of[-1,1])a.push(v*y*i,m*x*i*t.y,e+g*x*i*t.z)}const l=(d,f)=>d*4+f;for(let d=0;d<o;d++)for(const[f,h]of[[1,3],[2,0],[3,2]])c.push(l(d,f),l(d+1,h),l(d+1,f),l(d,f),l(d,h),l(d+1,h));c.push(l(0,0),l(0,3),l(0,1),l(0,0),l(0,2),l(0,3)),c.push(l(o,0),l(o,1),l(o,3),l(o,0),l(o,3),l(o,2));const u=new De;return u.setAttribute("position",new ue(a,3)),u.setIndex(c),u.computeVertexNormals(),u}const Xu=8;function vv(i,t,e){const n=Xu,s=2,r=[];for(let l=0;l<=s;l++)for(let u=0;u<=n;u++){const d=u/n,f=-.45+1.55*d,h=.95-.5*Math.min(1,d/.6)+.45*l/s,p=new b(Math.cos(h)*Math.sin(f)*i.x,Math.cos(h)*Math.cos(f)*i.y,Math.sin(h)*i.z).normalize(),_=e(p).multiplyScalar(1.03);r.push(_.x,_.y,t+_.z)}const o=[],a=(l,u)=>u*(n+1)+l;for(let l=0;l<s;l++)for(let u=0;u<n;u++)o.push(a(u,l),a(u+1,l+1),a(u+1,l),a(u,l),a(u,l+1),a(u+1,l+1));const c=new De;return c.setAttribute("position",new ue(r,3)),c.setIndex(o),c.computeVertexNormals(),c}function Mv(i,t,e,n,s,r,o){const a=i.height/1.75,c=i.colours.head,l=i.colours.hairSheen,u={none:0,shaved:0,cropped:.04,short:.08,"chin-length":.18,"shoulder-length":.28,long:.42,"waist-length":.58}[i.hair]*a,d=(h,p,_,m=1.08)=>{const g=new b(h,p,_).normalize();return new b(g.x*n*s.x*m,g.y*n*s.y*m,e+g.z*n*s.z*m)},f=[];switch(t){case"ponytail":{const h=d(0,-1,.25,1.05),p=new b(0,h.y-n*.35,h.z-Math.max(u,.1*a));f.push(ce(Le(h,p,n*.2,c),"ponytail")),f.push(ce(ie(h,n*.14,i.colours.ink,void 0,6),"ponytail"));break}case"braided":for(const h of[-1,1]){const p=d(h*.75,-.55,-.35,1.02),_=new b(h*n*.85,-n*.95,p.z-Math.max(u,.12*a));f.push(ce(Le(p,_,n*.13,c),"braid"));const m=7;for(let g=0;g<m;g++)f.push(ce(ie(p.clone().lerp(_,g/(m-1)),n*.17,c,void 0,6),"braid"))}break;case"bun":{const h=n*.46,p=d(0,-.65,.76,r+.36),_=ce(ie(p,h,c,void 0,12),"bun"),m=Xr(_.geometry,()=>p,i.hairTexture,n*.6),g=_.geometry.getAttribute("normal"),x=new b(0,-.35,1).normalize(),y=new Float32Array(g.count);for(let A=0;A<g.count;A++){const M=Math.max(0,g.getX(A)*x.x+g.getY(A)*x.y+g.getZ(A)*x.z);y[A]=Math.min(1,.55*M*M+(m?.4*m[A]*m[A]:0))}f.push(l?{..._,shade:y,tone:l}:_);const v=d(0,-.65,.76,r+.02),T=new li(h*.62,n*.06,4,14);T.applyQuaternion(new Ne().setFromUnitVectors(new b(0,0,1),p.clone().sub(v).normalize())),T.translate(...v.clone().lerp(p,.45).toArray()),f.push(ce({geometry:T,colour:l??i.colours.ink},"bun"));break}case"topknot":{const h=d(0,-.1,1,1.22);f.push(ce(ie(h,n*.26,c,void 0,8),"topknot")),f.push(ce(ie(d(0,-.1,1,1.05),n*.14,i.colours.ink,void 0,6),"topknot"));break}case"dreadlocks":for(let h=0;h<11;h++){const p=Math.PI*(.9+1.2*h/10),_=d(Math.cos(p),Math.sin(p),.15,1.02),m=new b(_.x*1.2,_.y*1.2,_.z-Math.max(u,.1*a)*(h%2?.85:1));f.push(ce(Ii(_,m,n*.11,c),"lock"))}break;case"spiky":for(let h=0;h<9;h++){const p=h*Math.PI*2/8,_=h===8?new b(0,0,1):new b(Math.cos(p)*.7,Math.sin(p)*.7,.75).normalize();f.push(ce(ui(d(_.x,_.y,_.z,1),_,n*.14,n*.55,c),"spike"))}break;case"mohawk":f.push(ce({geometry:xv(n,s,e,i.hair==="cropped"?.5:.65),colour:c},"crest"));break;case"brushed":{f.push(ce(Ii(d(-.32,.45,.85,1.07),d(-.32,-.45,.85,1.07),n*.035,i.colours.skin),"parting"));const h=vv(s,e,o),p=l?{shade:sl(h.getAttribute("position").count,Xu+1).map(_=>_*.5),tone:l}:{};f.push(ce({geometry:h,colour:c,...p},"fringe"));break}}return f}const yv={average:{half:.26,depth:.16},small:{half:.19,depth:.12},large:{half:.34,depth:.2},pointed:{half:.26,depth:.15}};function Sv(i){const t=i.colours,e=i.height,n=e/1.75,s=[],r=i.posture==="sitting",o=Mo(i),a=un(o.left_thigh).z,c=un(o.torso).z,l=o.head.size.z/2,u=o.head.origin.z+l,d=o.left_thigh.size.x/2,f=o.left_foot.size.z,h=new Set(i.outlined);for(const D of["left","right"]){const ct=o[`${D}_thigh`],vt=o[`${D}_shin`],Xt=o[`${D}_foot`],rt=Xt.origin.x;r?(s.push(ce(Le(un(ct),ct.origin,d,t.legs),"thigh")),s.push(ce(Le(ct.origin,vt.origin,vt.size.x/2,t.legs),"shin"))):s.push(...so(un(ct).addScaledVector(ct.z,-d*.5),ct.origin,vt.origin,d,t.legs,["thigh","shin"])),s.push(Hi(new b(rt,Xt.origin.y,f/2),Xt.size.clone(),t.feet)),h.has("ankles")&&s.push(ce(Is(rt,vt.origin.y,f+.02*n,d*Ds,1,t.ink),"band")),h.has("hips")&&s.push(ce(Is(rt,r?.06*n:0,o.waist.origin.z-il,d*Ds,1,t.ink),"band"))}const p=o.torso.origin.z;s.push(Xn(o.waist.origin.z,p,i.hipHalf,i.waistHalf,.62,t.hips)),s.push(Xn(p,c,i.waistHalf,i.shoulderHalf*.92,.55,t.torso));const _=un(o.left_upper_arm).z;s.push(Le(new b(-i.shoulderHalf*.9,0,_),new b(i.shoulderHalf*.9,0,_),i.limbRadius*1.35,t.torso)),h.has("waist")&&s.push(ce(Is(0,0,p,i.waistHalf*Ds,.62,t.ink),"band"));for(const D of["left","right"]){const ct=o[`${D}_upper_arm`],vt=o[`${D}_forearm`],Xt=o[`${D}_hand`],rt=vt.origin;s.push(...so(un(ct),ct.origin,rt,i.limbRadius,t.arms,["upper arm","forearm"])),s.push(ie(Xt.origin.clone().addScaledVector(Xt.z,i.limbRadius*1.25),i.limbRadius*1.25,t.hands,void 0,8)),h.has("wrists")&&s.push(ce(Is(rt.x,rt.y,rt.z,i.limbRadius*Ds,1,t.ink),"band"))}const m=o.neck.size.x/2;s.push(Xn(o.neck.origin.z,un(o.neck).z,m,m,1,t.neck));const g=c+i.limbRadius*.15+il;h.has("neck")&&s.push(ce(Is(0,0,g,m*Ds,1,t.collarEdge),"band"));const x=new b(.84,.95,1);s.push(ie(new b(0,0,u),l,t.skin,x,14)),s.push(Qe(new Si(l*.13,l*.3,6),t.skin,new b(0,l*.98,u-l*.08),new ke(0,0,0)));const y=(D,ct)=>l*x.y*Math.sqrt(Math.max(0,1-(D/(l*x.x))**2-(ct/(l*x.z))**2));if(i.described&&!i.faceHidden){const D=l*.1,ct=hf(t.skin,na)<av?uf(t.skin,na):void 0;for(const $t of[-1,1]){const Tt=$t*l*.32,Rt=l*.12,R=new b(Tt,y(Tt,Rt),u+Rt),S=new b($t*.47,1,.12).normalize(),G=new Ne().setFromUnitVectors(new b(0,1,0),S),ot=.6,tt=D/Math.sin(ot),_t=R.clone().addScaledVector(S,-tt*Math.cos(ot)+D*.05),xt=(dt,gt,j,St)=>{const Ft=new Wn(dt,St,gt>.4?2:1,0,Math.PI*2,0,gt);return Ft.applyQuaternion(G),Ft.translate(_t.x,_t.y,_t.z),ce({geometry:Ft,colour:j},"eye")};if(s.push(xt(tt,ot,na,12)),s.push(xt(tt*1.015,Math.asin(Math.min(1,D*.6/(tt*1.015))),t.eyes??lv,10)),ct){const dt=new li(D*1.1,D*.2,3,12);dt.applyQuaternion(new Ne().setFromUnitVectors(new b(0,0,1),S)),dt.translate(R.x,R.y+D*.06,R.z),s.push(ce({geometry:dt,colour:ct},"eyelid"))}const Z=$t*l*.16,K=$t*l*.48,pt=l*.285,O=t.brow,et=new b(Z,y(Z,pt),u+pt),Q=new b(K,y(K,pt-l*.015),u+pt-l*.015);s.push(ce(Ii(et,Q,l*.045,O),"brow"))}const vt=-l*.45,Xt=l*.24,rt=new b(0,y(0,vt-l*.04),u+vt-l*.04);for(const $t of[-1,1]){const Tt=new b($t*Xt,y(Xt,vt),u+vt);s.push(ce(Ii(rt,Tt,l*.04,t.faceInk),"mouth"))}}const v=i.headCovered?"loose":i.hairStyle,T=!i.headCovered&&(v==="mohawk"||i.hair==="shaved"),A=T||v==="brushed"||v==="swept_back"?"straight":i.hairTexture,M=!i.headCovered&&!T&&v!=="voluminous"&&(i.hair==="cropped"||i.hair==="short"),E=i.headCovered?1.06:T?1.04:M?i.hair==="cropped"?1.035:1.05:1.05*i.hairVolume*(v==="voluminous"?1.25:1),I=i.hairTexture==="straight"||i.hairTexture==="wavy",P=M?i.hair==="short"?E*(I?1.32:i.hairVolume*1.065):E*i.hairVolume:E,C=D=>le((D.z/D.length()-.1)/.8),N=D=>1+(P/E-1)*C(D);let B=D=>D.clone().multiplyScalar(l),U=(D,ct,vt)=>0,z=D=>D.clone().normalize(),W=D=>0,X=(D,ct)=>Number.NEGATIVE_INFINITY,it=(D,ct,vt)=>{};const L=ff.includes(v),k={"chin-length":u-l*(i.hairTexture==="coily"?.85:i.hairTexture==="curly"?.95:1.15),"shoulder-length":_-.03*e,long:_-.12*e,"waist-length":p+.02*e}[i.hair],at=!i.headCovered&&L&&k!==void 0,mt=u+l*.1,V=at&&i.hair==="chin-length"&&(i.hairTexture==="curly"||i.hairTexture==="coily"),nt=at&&!V&&A===i.hairTexture&&i.hairTexture!=="straight",Et=at&&i.hair!=="chin-length"&&(i.hairTexture==="curly"||i.hairTexture==="coily"),Pt=D=>Et?l*fv*le((D-.5)/.5)*(1-le((D-1.8)/.3)):0,Mt=(D,ct)=>{const vt=Math.abs(Math.atan2(D,-ct));return i.hair!=="chin-length"?mt-l*.25*le((vt-1.6)/.3)+Pt(vt):mt},Ut=(D,ct)=>1-le((Math.abs(Math.atan2(D,-ct))-(Et?dv:.8))/.4),qt=(D,ct)=>{if(V&&i.hairTexture==="curly")return 1-le((mt-(D.z+u))/(l*.1));if(!at||V)return 1;const vt=1-le((mt+l*ct-(D.z+u))/(l*ct))*le((.45-D.y/l)/.3);return nt?vt+(1-le((Mt(D.x,D.y)+l*.03-(D.z+u))/(l*.08))-vt)*Ut(D.x,D.y):vt},Ot=D=>qt(D,.15),Zt=D=>qt(D,.3);if(i.headCovered||i.hair!=="none"){const D=!i.headCovered&&A!=="straight",ct=D&&A==="coily",vt=h.has("hairline")&&!T&&!i.headCovered,Xt=Math.PI*(vt&&!D?.53:.55),rt=ct?28:D?24:vt?32:16,$t=D?12:9,Tt=new Wn(l,rt,$t,0,Math.PI*2,0,Xt);gv(Tt,rt);const Rt=new b(0,0,u),R=new ke(Math.PI/2+cv+(v==="swept_back"||v==="brushed"?.3:0),0,0),S=new b(0,0,1).applyEuler(R),G=1/Math.hypot(S.x/x.x,S.y/x.y,S.z/x.z),ot=new b(x.x*E,E,G*E),tt=new Ne().setFromEuler(R).invert();B=j=>{const St=j.clone().applyQuaternion(tt);return j.clone().multiplyScalar(l/Math.hypot(St.x/ot.x,St.y/ot.y,St.z/ot.z)*N(j))};const _t=j=>{if(P===E)return;const St=j.getAttribute("position"),Ft=new b;for(let st=0;st<St.count;st++)Ft.fromBufferAttribute(St,st).sub(Rt),Ft.multiplyScalar(N(Ft)).add(Rt),St.setXYZ(st,Ft.x,Ft.y,Ft.z);St.needsUpdate=!0,j.computeVertexNormals()},xt=j=>{if(!M)return 1;const St=j.clone().sub(Rt);return le((St.z/St.length()-.05)/.45)},Z=T?Zr(t.skin,t.head,Jl):t.head,K=ce(Qe(Tt,Z,Rt,R,ot),"cap");_t(K.geometry);const pt=j=>{const St=j.clone().sub(Rt).applyQuaternion(tt).divide(ot);return Math.acos(Math.max(-1,Math.min(1,St.y/(St.length()||1))))/Xt},O=j=>i.headCovered?0:le((pt(j)-.6)/.4),et=j=>{if(!nt||i.hairTexture!=="wavy")return 0;const St=Math.abs(Math.atan2(j.x,-j.y));return .5*le((Mt(j.x,j.y)-l*.06-j.z)/(l*.2))*(1-le((St-1.6)/.35))};W=j=>xt(j)*(1-.7*O(j));const Q=j=>{const St=Math.max(O(j),et(j));if(St<=0)return 1;const Ft=j.clone().sub(Rt),st=Ft.length(),Ht=l*1.03/Math.hypot(Ft.x/(st*x.x),Ft.y/(st*x.y),Ft.z/(st*x.z));return Ht>=st?1:(st+(Ht-st)*St)/st};{const j=K.geometry.getAttribute("position"),St=new b;for(let Ft=0;Ft<j.count;Ft++){const st=Q(St.fromBufferAttribute(j,Ft));st!==1&&j.setXYZ(Ft,Rt.x+(St.x-Rt.x)*st,Rt.y+(St.y-Rt.y)*st,St.z)}j.needsUpdate=!0,K.geometry.computeVertexNormals()}const dt=new Ne().setFromEuler(R).invert();U=(j,St,Ft)=>{const st=Math.hypot(j,St)||1,Ht=new b(j/st,St/st,0).applyQuaternion(dt).divide(ot),Kt=new b(0,0,Ft-Rt.z).applyQuaternion(dt).divide(ot),[Ct,de,Ie]=[Ht.dot(Ht),2*Ht.dot(Kt),Kt.dot(Kt)-l*l],zt=de*de-4*Ct*Ie;if(zt<0)return 0;const Gt=(-de+Math.sqrt(zt))/(2*Ct);return Gt*Q(new b(j/st*Gt,St/st*Gt,Ft))};const gt=new Ne().setFromEuler(R);if(z=j=>j.clone().sub(Rt).applyQuaternion(dt).divide(ot).divide(ot).applyQuaternion(gt).normalize(),rl(K.geometry,rt),i.headCovered)s.push(K);else{const j=K.geometry.getAttribute("position"),St=new b,Ft=Array.from({length:j.count},(Gt,ee)=>Ot(St.fromBufferAttribute(j,ee).sub(Rt))),st=nt?K.geometry.clone():void 0,Ht=Xr(K.geometry,()=>Rt,A,l,1,void 0,Gt=>xt(Gt)*Zt(Gt.clone().sub(Rt))*(1-.7*O(Gt)));rl(K.geometry,rt);const Kt=new Float32Array(j.count);if(Ht)for(let Gt=0;Gt<j.count;Gt++)Kt[Gt]=ms*Ht[Gt]*Ht[Gt]*Ft[Gt]+sa[A]*(1-Ft[Gt]);const Ct=st?Xr(st,()=>Rt,A,l,1,void 0,Gt=>W(Gt)):void 0;if(st&&Ct&&Ht){const Gt=(_e,Ue)=>{const me=_e.getIndex(),ne=_e.getAttribute("position"),We=tn=>ne.getZ(tn)>mt-l*.5&&ne.getZ(tn)<mt+l*.35&&ne.getY(tn)<l*(Et?.7:.2),wn=[];for(let tn=0;tn<me.count;tn+=3){const[pn,jn,On]=[me.getX(tn),me.getX(tn+1),me.getX(tn+2)];(We(pn)||We(jn)||We(On))&&wn.push(pn,jn,On)}const je=new De;je.setAttribute("position",ne),je.setAttribute("normal",_e.getAttribute("normal")),je.setIndex(wn);const $n=new Te(je,new fo({side:Ln})),He=new io,Oe=new En,Ke=new b,Qn=_e.getAttribute("position"),sn=_e.getAttribute("normal");return(tn,pn,jn)=>{const On=Math.hypot(tn,pn)||1;He.set(new b(0,0,jn),new b(tn/On,pn/On,0));const w=He.intersectObject($n,!1).at(-1);if(!(w!=null&&w.face))return;const{a:F,b:J,c:Y}=w.face;Oe.setFromAttributeAndIndices(Qn,F,J,Y).getBarycoord(w.point,Ke);const q=new b().addScaledVector(new b().fromBufferAttribute(sn,F),Ke.x).addScaledVector(new b().fromBufferAttribute(sn,J),Ke.y).addScaledVector(new b().fromBufferAttribute(sn,Y),Ke.z).normalize();return{r:w.distance,shade:Ke.x*Ue(F)+Ke.y*Ue(J)+Ke.z*Ue(Y),normal:q}}},ee=Gt(K.geometry,_e=>Kt[_e]),Pe=Gt(st,_e=>ms*Ct[_e]*Ct[_e]);it=(_e,Ue,me)=>{const[ne,We]=[ee(_e,Ue,me),Pe(_e,Ue,me)];return ne&&We?{r:ne.r,shade:ne.shade,normal:ne.normal,fullR:We.r,fullShade:We.shade}:void 0}}if(vt)for(let Gt=0;Gt<=$t;Gt++)for(let ee=0;ee<=rt;ee++){const Pe=(ee>>1)*3%4/3,_e=le((Gt/$t-(.79+.12*Pe))/.1),Ue=Gt*(rt+1)+ee,me=le(((j.getY(Ue)-Rt.y)/l-.05)/.3);Kt[Ue]=Math.max(Kt[Ue],.9*_e*me*(ee%2?1:.15))}const de=vt?t.hairEdge:t.hairSheen;s.push(Ht||vt?{...K,shade:Kt,tone:de}:K);{const Gt=Array.from({length:rt},(ee,Pe)=>{const _e=$t*(rt+1)+Pe;return[Math.atan2(j.getX(_e),-j.getY(_e)),j.getZ(_e)]}).sort((ee,Pe)=>ee[0]-Pe[0]);X=(ee,Pe)=>{const _e=Math.atan2(ee,-Pe),Ue=Gt.findIndex(je=>je[0]>=_e),[me,ne]=Ue<=0?[Gt[Gt.length-1],Gt[0]]:[Gt[Ue-1],Gt[Ue]],We=(ne[0]-me[0]+2*Math.PI)%(2*Math.PI)||1,wn=(_e-me[0]+2*Math.PI)%(2*Math.PI)/We;return me[1]+(ne[1]-me[1])*Math.min(1,Math.max(0,wn))}}const Ie=_v(K.geometry,rt,$t,Rt,Gt=>l*.97/Math.hypot(Gt.x/x.x,Gt.y/x.y,Gt.z/x.z)),zt=new Float32Array(4*(rt+1));for(let Gt=0;Gt<4;Gt++)for(let ee=0;ee<=rt;ee++)zt[Gt*(rt+1)+ee]=Kt[$t*(rt+1)+ee];s.push(ce(Ht||vt?{geometry:Ie,colour:Z,shade:zt,tone:de}:{geometry:Ie,colour:Z},"rim"))}}if(at&&k!==void 0){const D=1.04*i.hairVolume*(v==="voluminous"?1.2:1),ct=mt,vt=i.hair!=="chin-length",Xt=3.8,rt=i.hairTexture!=="straight",$t=vt&&(i.hairTexture==="curly"||i.hairTexture==="coily"),Tt=vt&&i.hairTexture==="wavy",Rt=$t?i.hairTexture==="coily"?12:14:V?10:nt&&i.hairTexture==="wavy"?hv:rt?12:8,R=$t&&i.hairTexture==="curly"?16:20,S=new Vn(l,l,ct-k,R,Rt,!0,-Xt/2,Xt);if(S.rotateX(Math.PI/2),S.translate(0,0,(ct+k)/2),vt){const zt=S.getAttribute("position"),Gt=nt&&i.hairTexture==="wavy"?uv:rt?1.25:1.6;for(let ee=0;ee<zt.count;ee++)zt.setZ(ee,ct-(ct-k)*Math.max(0,(ct-zt.getZ(ee))/(ct-k))**Gt)}const G=Math.max(u-l*1.05,k+.35*(ct-k)),ot=vt?1.3:1.12,tt=vt?0:{coily:.3,curly:.2}[i.hairTexture]??0,_t=zt=>zt>=G?1-.1*le((ct-zt)/(ct-G)):.9+(ot-.9)*le((G-zt)/(G-k)),xt=zt=>vt?-l*.25*le((G-zt)/(.5*(G-k))):0,Z=S.getAttribute("position"),K=zt=>{const Gt=Math.floor(Math.min(zt,R-1)/2),ee=Math.sin(Gt*12.9898+7*78.233)*43758.5453;return l*(.05+.25*(ee-Math.floor(ee)))},pt=new Float64Array(R+1),O=new Float32Array(Z.count).fill(1),et=new Float32Array(Z.count).fill(sa[i.hairTexture]),Q=new Array(Z.count);for(let zt=0;zt<Z.count;zt++){const Gt=Math.abs(Math.atan2(Z.getX(zt),-Z.getY(zt))),ee=nt&&i.hairTexture==="wavy"?le((Gt-.9)/.5):0,Pe=zt%(R+1),_e=Math.sin(Math.floor(Math.min(Pe,R-1)/2)*12.9898+13*78.233)*43758.5453,Ue=nt?l*(Pe%2===1?.05+.1*(_e-Math.floor(_e)):.015)*(1-le((Gt-.4)/.4)):0,me=(vt?Math.max(ct-l*.25*le((Gt-1.6)/.3),rt?Number.NEGATIVE_INFINITY:Math.min(ct,X(Z.getX(zt),Z.getY(zt))-l*.03)):ct)+Ue+Pt(Gt);pt[zt%(R+1)]=me;const ne=me-(me-k)*(ct-Z.getZ(zt))/(ct-k),We=_t(ne),wn=!rt&&Math.abs(ne-k)<1e-5&&zt%(R+1)%2?-.012*n:0;let[je,$n]=[Z.getX(zt),Z.getY(zt)];if(vt){const kt=Math.min(zt%(R+1),R-zt%(R+1)),jt=Math.max(0,1-kt/3)*(.8+.2*Math.sin(kt*2.3+(zt%(R+1)>R/2?1:0))),[re,Lt]=$t?[1.1,.25]:[.85,.45],ae=le((u-l*.05-ne)/(l*.35))*(1-le((u-l*re-ne)/(l*Lt))),be=.3*jt*ae*Math.sign(je);[je,$n]=[je*Math.cos(be)-$n*Math.sin(be),je*Math.sin(be)+$n*Math.cos(be)]}let[He,Oe]=[je*x.x*D*We,$n*x.y*D*We+xt(ne)];const Ke=Math.hypot(He,Oe),Qn=1.012+.013*le(((Et?me:ct)-ne)/(l*.06));let sn=U(He,Oe,ne)*Qn,tn=0;if(nt&&sn>0){const kt=zt%(R+1),jt=Math.floor(Math.min(kt,R-1)/2),re=Math.sin(jt*12.9898+11*78.233)*43758.5453;O[zt]=le((me-ne)/(l*(.08+.14*(re-Math.floor(re)))*(1+2*ee)));const Lt=ne>me-l*.3&&Ut(He,Oe)>0?it(He,Oe,ne):void 0;if(Lt&&ne>Math.min(me,ct)-l*.01){const ae=Xt/R;for(const be of[-.5,-.25,.25,.5]){const[Ae,we]=[Math.cos(be*ae),Math.sin(be*ae)],Xe=it(He*Ae-Oe*we,He*we+Oe*Ae,ne);Xe&&(Lt.r=Math.max(Lt.r,Xe.r))}}if(Lt){const ae=Et?1:Ut(He,Oe),be=le((me-ne)/(l*.06))*(1-O[zt]);sn=Math.max(sn,sn+(Math.max(Lt.r,Lt.r+(Lt.fullR-Lt.r)*be)*Qn-sn)*ae),et[zt]=Lt.shade+(Lt.fullShade-Lt.shade)*le((me-ne)/(l*.06)),Q[zt]=Lt.normal,tn=Lt.r*Qn}}const pn=zt%(R+1),jn=Math.min(1,Math.min(pn,R-pn)/2)+(1-Math.min(1,Math.min(pn,R-pn)/2))*le((u-l*.2-ne)/(l*.5)),On=le((ct-ne)/(l*.6))*jn,w=(ct-ne)/(ct-k),F=(ne-u)/(l*x.z),J=Ke>0&&Math.abs(F)<1?l*1.02*Math.sqrt(1-F*F)/Math.hypot(He/Ke/x.x,Oe/Ke/x.y):0,Y=1-Math.min(1,Math.min(pn,R-pn)/2),q=sn>0?sn*(1-.06*Y*le((ne-(me-l*.2))/(l*.15))):J,At=sn>0&&i.hairTexture!=="curly"?l*.06*le((ct-ne)/(l*.12)):0,Vt=i.hairTexture==="curly"?w:w*w,wt=tt?q+At+(Math.max(q+At,U(He,Oe,ct)*1.012*(1-tt*Vt))-q-At)*jn:q>0?q+(Math.max(Ke,q)-q)*On:Ke;let Dt=wt;if(nt&&i.hairTexture==="wavy"){let kt=0;for(let re=0;re<=6;re++)kt=Math.max(kt,U(He,Oe,ne+(me+l*.25-ne)*re/6));const jt=O[zt]*le((Mt(He,Oe)-l*.06-ne)/(l*.1))*(1-le((me-l*.45-ne)/(l*.3)));Dt=Math.max(wt-(wt-Math.min(wt,kt*1.012)+l*Vu*.5)*jt,sn>0?Math.max(U(He,Oe,ne)*Qn,tn):J)}Ke>0&&([He,Oe]=[He*Math.min(wt,Dt)/Ke,Oe*Math.min(wt,Dt)/Ke]),Z.setXYZ(zt,He,Oe,ne+wn)}S.computeVertexNormals();const dt={geometry:ol(S),colour:t.head},gt=zt=>le((ct-zt)/(l*($t?.1:.2))),j=V?i.hairTexture==="coily"?1.3:1.6:i.hairTexture==="wavy"&&vt?Math.max(.4,Math.min(1.6,24*Math.PI/(21*((ct-k)/l)))):.4,St=zt=>new b(0,xt(zt.z),zt.z),Ft=dt.geometry.getAttribute("position").count/2,st=Float32Array.from({length:Ft*2},(zt,Gt)=>O[Gt%Ft]),Ht=$t?pv(dt.geometry,R,i.hairTexture==="coily"?2:2.5,St,Xt,l,.03*n,(zt,Gt)=>le((pt[Gt]-zt.z)/(l*.45))):Xr(dt.geometry,St,i.hairTexture,l,j,void 0,(zt,Gt)=>V?le((ct-zt.z)/(l*.12)):nt?st[Gt]:gt(zt.z),V||Tt?ct:0,Tt?{swing:1.3,lobes:2,strands:.3}:void 0);{const zt=dt.geometry.getAttribute("position"),Gt=dt.geometry.getAttribute("normal"),ee=new b,Pe=new b;for(let _e=0;_e<zt.count;_e++){ee.fromBufferAttribute(zt,_e);const Ue=_e%(zt.count/2)%(R+1),me=(1-Math.min(1,Math.min(Ue,R-Ue)/2))*(1-le((u-l*.2-ee.z)/(l*.5))),ne=nt?Q[_e%(zt.count/2)]:void 0,We=ne?Math.max(1-le((pt[Ue]-ee.z)/(l*.12)),me):nt?me:Math.max(1-le((ct-ee.z)/(l*.35)),me);if(We<=0)continue;const wn=(ne&&We>me?ne.clone():z(ee)).multiplyScalar(_e<zt.count/2?1:-1);Pe.fromBufferAttribute(Gt,_e).lerp(wn,We).normalize(),Gt.setXYZ(_e,Pe.x,Pe.y,Pe.z)}}const Kt=dt.geometry.getAttribute("position"),Ct=!rt&&t.hairSheen?{shade:sl(Kt.count,R+1).map((zt,Gt)=>zt*.45*le((ct-Kt.getZ(Gt))/l)),tone:t.hairSheen}:{},de=mv(ce({...dt,...Ct},"hair"),Ht,t.hairSheen),Ie=$t?.55:Tt?.7:1;if(Ht&&de.shade&&!V){const zt=ee=>{if(nt)return st[ee];const Pe=ee%Ft%(R+1);return $t?le((pt[Pe]-Kt.getZ(ee))/K(Pe)):gt(Kt.getZ(ee))},Gt=ee=>nt?et[ee%Ft]:sa[i.hairTexture];de.shade=de.shade.map((ee,Pe)=>ee*Ie*zt(Pe)+Gt(Pe)*(1-zt(Pe)))}s.push(de)}!i.headCovered&&i.hair!=="none"&&s.push(...Mv(i,v,u,l,x,E,B));const Qt=u+l*.02,$=l*.07,ht=D=>{const ct=D.geometry.getAttribute("normal"),vt=new Float32Array(ct.count);for(let Xt=0;Xt<ct.count;Xt++)vt[Xt]=.9*Math.min(1,Math.max(0,ct.getY(Xt)*1.2));return{...D,shade:vt,tone:t.earEdge}};if(i.described&&!i.earsHidden){const D=yv[i.ears];for(const ct of[-1,1]){const vt=new b(ct*(l*x.x+$*.6),-l*.08,Qt);if(s.push(ht(ce(Qe(new Wn(1,8,6),t.skin,vt,new ke(.15,0,ct*.3),new b($,l*D.depth,l*D.half)),"ear"))),i.ears==="pointed"){const Xt=vt.clone().add(new b(0,-l*.05,l*D.half*.8));s.push(ht(ce(ui(Xt,new b(ct*.25,-.35,1).normalize(),l*.06,l*.38,t.skin,4),"ear")))}}}if(t.facialHair&&i.facialHair!=="none"){const D=t.facialHair,ct=(Tt,Rt,R=1)=>(Tt.rotateX(-Math.PI/2),Tt.scale(x.x*Rt,x.y*Rt,x.z*Rt*R),Tt.translate(0,0,u),Tt),vt=(Tt,Rt,R,S,G,ot=1,tt=16)=>({geometry:ct(new Wn(l,tt,6,Rt-R/2,R,0,Tt),S,ot),colour:G}),Xt=(Tt,Rt,R,S,G=1)=>{const ot=Tt-ia/l/2,tt=l*Math.sin(ot)*1.006,_t=new Vn(tt,tt,ia,16,1,!0,Rt-R/2-Math.PI/2,R);return _t.translate(0,l*Math.cos(ot),0),{geometry:ct(_t,S,G),colour:t.facialHairEdge??t.ink}},rt=Math.PI/2,$t=4;if(i.facialHair==="beard"||i.facialHair==="stubble"){const Tt=i.facialHair==="beard",Rt=i.beardReach===void 0?.12:.06+.06*Math.min(1,i.beardReach*4),R=Tt?1+Rt:1.012,S=Tt?1+Rt:1,G=Tt?D:Zr(t.skin,D,Jl),ot=20,tt=ct(bh(l,ot,6,rt-$t/2,$t,()=>0,Fr),R,S),_t=(xt,Z)=>t.facialHairEdge?{shade:sl(xt.getAttribute("position").count,Z),tone:t.facialHairEdge}:{};if(s.push(ce({geometry:tt,colour:G,...Tt?_t(tt,ot+1):{}},Tt?"beard":"stubble")),Tt&&h.has("jawline")){const xt=ia/l,Z=bh(l*1.006,20,1,rt-$t/2,$t,K=>Fr(K)-xt,Fr);s.push(ce({geometry:ct(Z,R,S),colour:t.facialHairEdge??t.ink},"jawline"))}if(!Tt){const xt=t.facialHairEdge??D,Z=l*.028;for(let K=0;K<Sh;K++)for(let pt=0;pt<Eh;pt++){const O=Math.sin(K*12.9898+pt*78.233)*43758.5453,et=(K+.5+.35*Math.sin(O))/Sh,Q=rt-$t/2+$t*et;if(Math.abs(Q-rt)>1.45)continue;const dt=Fr(Q)*(pt+.5+.3*Math.cos(O))/(Eh+.3),gt=new b(-Math.cos(Q)*Math.sin(dt),Math.cos(dt),Math.sin(Q)*Math.sin(dt)).multiplyScalar(l*1.02),j=new Ol(Z*1.2,0);j.setIndex([...Array(j.getAttribute("position").count).keys()]),j.translate(gt.x,gt.y,gt.z),s.push(ce({geometry:ct(j,1,1),colour:xt},"stubble-dot"))}}if(Tt&&i.beardLength!==void 0&&i.beardLength>10){const xt=Math.min((i.beardLength-10)/100,e/3),Z=u-l*R*S,K=new b(0,l*.75,Z+l*.6),pt=new b(0,i.shoulderHalf*.92*.55+l*.3,Z-xt),O=10,et=new Si(l*.62,K.distanceTo(pt),O,1,!0);et.scale(1,1,.4),et.applyMatrix4(new Yt().compose(K.clone().add(pt).multiplyScalar(.5),new Ne().setFromUnitVectors(new b(0,1,0),new b().subVectors(pt,K).normalize()),new b(1,1,1)));const Q=ol(et);s.push(ce({geometry:Q,colour:D,..._t(Q,O+1)},"beard"))}}else i.facialHair==="goatee"&&(s.push(ce(vt(.75,rt,.9,1.1,D,1.08),"beard")),h.has("jawline")&&s.push(ce(Xt(.75,rt,.9,1.1,1.08),"jawline")));if(i.facialHair==="moustache"||i.facialHair==="beard"||i.facialHair==="goatee"){const Tt=-l*.32,Rt=new b(0,y(0,Tt)+l*.02,u+Tt);for(const R of[-1,1]){const S=new b(R*l*.28,y(l*.28,-l*.43)+l*.02,u-l*.43);s.push(ce(Ii(Rt,S,l*.06,D),"moustache"))}}}const ut=t.faceInk,bt=u+l*.12,yt=l*1,Jt=l*.2,Bt=l*.04,he=D=>l*x.x*Math.sqrt(Math.max(0,1-((D-u)/(l*x.z))**2));for(const D of i.features)if(D==="glasses"||D==="sunglasses"){for(const ct of[-1,1]){const vt=new b(ct*l*.32,yt,bt);D==="glasses"?s.push(Qe(new li(Jt,Bt,4,12),ut,vt,new ke(Math.PI/2,0,0))):s.push(Qe(new Vn(Jt*1.1,Jt*1.1,Bt*1.5,12),ut,vt)),s.push(Ii(new b(ct*(l*.32+Jt),yt-Bt,bt),new b(ct*he(bt),0,bt),Bt*.8,ut))}s.push(Ii(new b(-l*.32+Jt,yt,bt),new b(l*.32-Jt,yt,bt),Bt*.8,ut))}else if(D==="eyepatch"){const ct=new b(-l*.32,yt,bt);s.push(Qe(new Vn(Jt*1.15,Jt*1.15,Bt*1.5,12),ut,ct));const vt=new b(ct.x/x.x,ct.y/x.y,(ct.z-u)/x.z).normalize(),Xt=new b(1,0,.5).normalize(),rt=new b().crossVectors(vt,Xt).normalize(),$t=new li(1,Bt*.8/l,3,24);$t.applyQuaternion(new Ne().setFromUnitVectors(new b(0,0,1),rt)),$t.scale(l*x.x*1.03,l*x.y*1.03,l*x.z*1.03),$t.translate(0,0,u),s.push(ce({geometry:$t,colour:ut},"strap"))}else if(D==="earrings")for(const ct of[-1,1]){const vt=u-l*.35,Xt=new b(ct*(he(vt)+Bt),0,vt);s.push(ce(Qe(new li(l*.12,Bt*.9,3,8),ut,Xt,new ke(0,Math.PI/2,0)),"earring"))}const fe=u+l*.8,xe=t.hair??t.skin;for(const D of i.extras)if(D==="tail")s.push(Le(new b(0,-i.hipHalf*.55,a-.02*e),new b(0,-i.hipHalf*.55-.35*n,r?.03:a-.3*e),i.limbRadius*.6,xe,!1));else if(D==="wings")for(const ct of[-1,1])s.push(ce(Wu(ct,n,new b(ct*i.shoulderHalf*.45,-.1*n,_-.04*e),xe),"wing"));else if(D==="antlers")for(const ct of[-1,1]){const vt=new b(ct*l*.45,0,fe),Xt=new b(ct*l*1.5,-l*.2,fe+l*1.4);s.push(ce(Le(vt,Xt,l*.07,Bs,!1),"antler")),s.push(ce(Le(vt.clone().lerp(Xt,.5),new b(ct*l*.7,l*.3,fe+l*1.2),l*.06,Bs,!1),"antler"))}else if(D==="horns")for(const ct of[-1,1]){const vt=Qe(new Si(l*.16,l*.7,6),Bs,new b(ct*l*.45,l*.15,fe+l*.2),new ke(Math.PI/2,0,-ct*.35));s.push(ce(vt,"horn"))}return s}function Ev(i){const t=Mo(i),e=i.height/1.75,n=un(t.torso).z,s=t.head.size.z/2,r=un(t.left_upper_arm).z,o=t.neck.size.x/2;return[Xn(0,.03*e,.17*e,.19*e,1,""),Le(new b(0,0,.03*e),new b(0,0,t.waist.origin.z+.02*e),.025*e,""),Xn(t.waist.origin.z,t.torso.origin.z,i.hipHalf,i.waistHalf,.62,""),Xn(t.torso.origin.z,n,i.waistHalf,i.shoulderHalf*.92,.55,""),Le(new b(-i.shoulderHalf*.9,0,r),new b(i.shoulderHalf*.9,0,r),i.limbRadius*1.35,""),Xn(t.neck.origin.z,un(t.neck).z,o,o,1,""),ie(new b(0,0,t.head.origin.z+s),s,"",new b(.84,.95,1),14)]}function Yu(i){const t=new se,e=new se,n=(i.plan.kind==="human"?Sv(i):Kx(i)).map(({geometry:r,colour:o,shade:a,tone:c})=>{r.deleteAttribute("uv"),t.set(o),c&&e.set(c);const l=r.getAttribute("position").count,u=new Float32Array(l*3);for(let d=0;d<l;d++){const f=a&&c?a[d]:0,h=(p,_)=>Math.min(1,Math.max(0,p+(_-p)*f));u.set([h(t.r,e.r),h(t.g,e.g),h(t.b,e.b)],d*3)}return r.setAttribute("color",new bn(u,3)),r}),s=vo(n,!1);for(const r of n)r.dispose();if(!s)throw new Error("figure parts could not be merged");return i.posture==="reclining"&&s.applyMatrix4(Gu(i)),s.computeBoundingBox(),s.computeBoundingSphere(),s}class bv{constructor(){di(this,"geometries",new Map);di(this,"used",new Set)}geometry(t){const e=JSON.stringify(t);let n=this.geometries.get(e);return n||(n=Yu(t),this.geometries.set(e,n)),this.used.add(e),n}sweep(){for(const[t,e]of this.geometries)this.used.has(t)||(e.dispose(),this.geometries.delete(t));this.used.clear()}get size(){return this.geometries.size}dispose(){for(const t of this.geometries.values())t.dispose();this.geometries.clear(),this.used.clear()}}function qu(i,t){if(i.userData.headOutline)return i.userData.headOutline;const e=i.getAttribute("position"),n=[];let s=Number.NEGATIVE_INFINITY;for(let a=0;a<e.count;a++){const c=e.getZ(a);c<t||(n.push(e.getX(a),e.getY(a),c),s=Math.max(s,c))}if(n.length===0&&e.count>0)return qu(i,Number.NEGATIVE_INFINITY);const r=new Set;for(const a of[-60,-40,-20,0,10,20,30,40,50,60,70,80,90]){const c=a*Math.PI/180;for(let l=0;l<24;l++){const u=l/24*2*Math.PI,d=-Math.sin(c)*Math.cos(u),f=-Math.sin(c)*Math.sin(u),h=Math.cos(c);let p=0,_=Number.NEGATIVE_INFINITY;for(let m=0;m<n.length;m+=3){const g=n[m]*d+n[m+1]*f+n[m+2]*h;g>_&&(_=g,p=m)}n.length&&r.add(p)}}const o=[new b(0,0,s),...[...r].map(a=>new b(n[a],n[a+1],n[a+2]))];return i.userData.headOutline=o,o}function wv(i,t,e,n,s,r,o){const a=new Te(o?o.geometry(i):Yu(i),r);o&&(a.userData.keptGeometry=!0);const c=0,l=0;return a.rotation.z=Math.hypot(c,l)>1e-6?Math.atan2(-c,l):Math.PI,a.position.set(t,e,n),a.userData.part="body",a}const Zu=40,wh=24,zr=6,Th=6,Ku=8;class rr{constructor(){di(this,"points",[]);di(this,"triangles",[])}add(t){return this.points.push(t),this.points.length-1}band(t,e){for(let n=0;n+1<t.length;n++){const s=t[n].length;for(let r=0;r<s;r++){if(e!=null&&e(n,r))continue;const o=t[n][r],a=t[n][(r+1)%s],c=t[n+1][(r+1)%s],l=t[n+1][r];this.triangles.push(o,a,c,o,c,l)}}}cap(t,e){const n=t.filter((r,o)=>{const a=this.points[r],c=this.points[t[(o+1)%t.length]];return Math.hypot(a[0]-c[0],a[1]-c[1])>1e-9});if(n.length<3)return;const s=n.map(r=>new ft(this.points[r][0],this.points[r][1]));for(const[r,o,a]of ai.triangulateShape(s,[])){const c=ai.area([s[r],s[o],s[a]])>0;this.triangles.push(...c===e?[n[r],n[o],n[a]]:[n[r],n[a],n[o]])}}ring(t){return t.map(e=>this.add(e))}}function ki(i,t,e){const n=new De;n.setAttribute("position",new ue(i.points.flatMap(([c,l,u])=>[c*1e3,l*1e3,u*1e3]),3)),n.setIndex(i.triangles);const s=Vx(n,Zu*Math.PI/180);n.dispose();const r=s.getAttribute("position"),o=s.getAttribute("normal"),a=new b;for(let c=0;c<r.count;c++)r.setXYZ(c,r.getX(c)/(1e3*t[0]),r.getY(c)/(1e3*t[1]),r.getZ(c)/(1e3*t[2])),a.set(o.getX(c)*t[0],o.getY(c)*t[1],o.getZ(c)*t[2]).normalize(),o.setXYZ(c,a.x,a.y,a.z);return s.userData.open=e,s}const Ui=(i,t)=>[i[0]-t[0],i[1]-t[1],i[2]-t[2]],Yr=(i,t)=>[i[0]+t[0],i[1]+t[1],i[2]+t[2]],Di=(i,t)=>[i[0]*t,i[1]*t,i[2]*t],ro=(i,t)=>i[0]*t[0]+i[1]*t[1]+i[2]*t[2],qr=(i,t)=>[i[1]*t[2]-i[2]*t[1],i[2]*t[0]-i[0]*t[2],i[0]*t[1]-i[1]*t[0]],oo=i=>Math.hypot(i[0],i[1],i[2]),Ni=i=>Di(i,1/(oo(i)||1)),Hl=i=>(t,e)=>(t-.5)*i[e];function al(i,t){const e=i.length;return i.map(([n,s],r)=>{const[o,a]=i[(r+e-1)%e],[c,l]=i[(r+1)%e],u=[n-o,s-a],d=[c-n,l-s],f=Math.hypot(u[0],u[1])||1,h=Math.hypot(d[0],d[1])||1,p=[-u[1]/f,u[0]/f],_=[-d[1]/h,d[0]/h],m=[p[0]+_[0],p[1]+_[1]],g=1+p[0]*_[0]+p[1]*_[1],x=Math.min(t/Math.max(g,1e-9),4*t/(Math.hypot(m[0],m[1])||1));return[n+m[0]*x,s+m[1]*x]})}function Tv(i,t){const e=r=>{const o=al(i,r);return df(o)<=0||!pf(o)?!1:o.every(([a,c],l)=>{const[u,d]=o[(l+1)%o.length],[f,h]=i[l],[p,_]=i[(l+1)%i.length];return(u-a)*(p-f)+(d-c)*(_-h)>0})};if(e(t))return t;let n=0,s=t;for(let r=0;r<30;r++){const o=(n+s)/2;e(o)?n=o:s=o}return n}function Av(i){const t=i.size,e=Hl(t),n=(i.outline??[]).map(([f,h])=>[e(f,0),e(h,1)]),s=t[2]/2,[r,o]=i.bevel??[0,0],a=Math.min(o,s),c=r>0&&a>0?Tv(n,r):0,l=new rr,u=(f,h)=>l.ring(f.map(([p,_])=>[p,_,h])),d=c>0?[u(al(n,c),-s),u(n,-s+a),u(n,s-a),u(al(n,c),s)]:[u(n,-s),u(n,s)];return l.band(d),l.cap(d[0],!1),l.cap(d[d.length-1],!0),ki(l,t,!1)}function Rv(i,t,e){const n=i.map((r,o)=>({p:r,r:t[o]})).filter(({p:r},o)=>o===0||oo(Ui(r,i[o-1]))>1e-9);if(n.length<2)return[];if(e&&n.length>2){const r=new Ll(n.map(({p:a})=>new b(...a)),!1,"centripetal"),o=(n.length-1)*Ku;return Array.from({length:o+1},(a,c)=>{const l=c/o,u=r.getTangent(l),d=l*(n.length-1),f=Math.min(Math.floor(d),n.length-2),h=d-f;return{at:r.getPoint(l).toArray(),along:u.toArray(),r:n[f].r+(n[f+1].r-n[f].r)*h}})}const s=[];for(let r=0;r+1<n.length;r++){const o=Ni(Ui(n[r+1].p,n[r].p));if(r>0){const a=s[s.length-1].along,c=Math.acos(Math.max(-1,Math.min(1,ro(a,o)))),l=Math.ceil(c/(15*Math.PI/180)),u=new b(...a),d=new b(...o),f=new Ne().setFromUnitVectors(u,d);for(let h=1;h<l;h++){const p=u.clone().applyQuaternion(new Ne().slerp(f,h/l));s.push({at:n[r].p,along:p.toArray(),r:n[r].r})}}s.push({at:n[r].p,along:o,r:n[r].r},{at:n[r+1].p,along:o,r:n[r+1].r})}return s}function Cv(i){const t=i.size,e=Hl(t),n=(i.path??[]).map(h=>[e(h[0],0),e(h[1],1),e(h[2],2)]),s=Rv(n,i.radius??[],i.smooth===!0),r=i.aspect??1,o=new rr;if(!s.length)return ki(o,t,!1);let a;const c=s.map(({along:h})=>{const p=qr([0,0,1],h);let _=oo(p)>1e-6?Ni(p):Ni(a?Ui(a,Di(h,ro(a,h))):Ui([1,0,0],Di(h,h[0])));return oo(_)<1e-6&&(_=Ni(qr(h,[0,1,0]))),a&&ro(_,a)<0&&(_=Di(_,-1)),a=_,{w:_,h:qr(h,_)}}),l=(h,p,_,m)=>o.ring(Array.from({length:wh},(g,x)=>{const y=2*Math.PI*x/wh;return Yr(h,Yr(Di(p,m*r*Math.cos(y)),Di(_,m*Math.sin(y))))})),u=(h,p)=>Array.from({length:Th},(_,m)=>{const g=Math.PI/2*(1-m/Th),{at:x,along:y,r:v}=s[h];return l(Yr(x,Di(y,p*v*Math.sin(g))),c[h].w,c[h].h,v*Math.cos(g))}),d=s.length-1,f=[...u(0,-1),...s.map(({at:h,r:p},_)=>l(h,c[_].w,c[_].h,p)),...u(d,1).reverse()];return o.band(f),ki(o,t,!1)}function Pv(i){var h;const t=i.size,e=Hl(t),n=i.sections??[],s=((h=n[0])==null?void 0:h.outline.length)??0,r=i.smooth&&n.length>2?Ku:1,o=r>1?Array.from({length:s},(p,_)=>new Ll(n.map(({z:m,outline:g})=>new b(e(g[_][0],0),e(g[_][1],1),e(m,2))),!1,"centripetal")):[],a=[];for(let p=0;p<=(n.length-1)*r;p++)a.push(Array.from({length:s},(_,m)=>{if(r>1)return o[m].getPoint(p/((n.length-1)*r)).toArray();const{z:g,outline:x}=n[p];return[e(x[m][0],0),e(x[m][1],1),e(g,2)]}));const c=i.holes??[],l=(p,_)=>{const m=Math.floor(p/r);return c.some(([g,x,y,v])=>m>=g&&m<x&&(y<v?_>=y&&_<v:_>=y||_<v))},u=i.caps??"both",d=new rr,f=a.map(p=>d.ring(p));return d.band(f,l),(u==="both"||u==="bottom")&&d.cap(f[0],!1),(u==="both"||u==="top")&&d.cap(f[f.length-1],!0),i.wall?ki(Lv(d,i.wall),t,!1):ki(d,t,c.length>0||u!=="both")}function Lv(i,t){const e=i.points.length,n=Array.from({length:e},()=>[0,0,0]),s=[],r=i.triangles;for(let f=0;f<r.length;f+=3){const[h,p,_]=[i.points[r[f]],i.points[r[f+1]],i.points[r[f+2]]],m=qr(Ui(p,h),Ui(_,h));s.push(Ni(m));for(const g of[r[f],r[f+1],r[f+2]])n[g]=Yr(n[g],m)}const o=new Array(e).fill(1),a=n.map(Ni);for(let f=0;f<r.length;f+=3)for(const h of[r[f],r[f+1],r[f+2]])o[h]=Math.min(o[h],ro(a[h],s[f/3]));const c=new rr;c.points=[...i.points],c.triangles=[...r];const l=i.points.map((f,h)=>{const p=a[h],_=1/Math.max(.35,o[h]);return c.add(Ui(f,[p[0]*t[0]*_,p[1]*t[1]*_,p[2]*t[2]*_]))});for(let f=0;f<r.length;f+=3)c.triangles.push(l[r[f]],l[r[f+2]],l[r[f+1]]);const u=new Map,d=(f,h)=>f<h?`${f}:${h}`:`${h}:${f}`;for(let f=0;f<r.length;f+=3)for(let h=0;h<3;h++){const p=d(r[f+h],r[f+(h+1)%3]);u.set(p,(u.get(p)??0)+1)}for(let f=0;f<r.length;f+=3)for(let h=0;h<3;h++){const p=r[f+h],_=r[f+(h+1)%3];u.get(d(p,_))===1&&c.triangles.push(_,p,l[p],_,l[p],l[_])}return c}function Dv(i){const t=i.size,[e,n,s]=t,r=Math.min(i.round??0,e/2,n/2,s/2),o=new rr,a=(y,v,T,A)=>o.ring([[1,1],[-1,1],[-1,-1],[1,-1]].flatMap(([M,E],I)=>Array.from({length:zr+1},(P,C)=>{const N=Math.PI/2*(I+C/zr);return[M*y+T*Math.cos(N),E*v+T*Math.sin(N),A]}))),c=(y,v)=>Array.from({length:zr+1},(T,A)=>y+(v-y)*A/zr),l=e/2-r,u=n/2-r,d=c(0,Math.PI/2).map(y=>a(l,u,r*Math.sin(y),-s/2+r*(1-Math.cos(y))));if(!i.wall)return d.push(...c(Math.PI/2,Math.PI).map(y=>a(l,u,r*Math.sin(y),s/2-r*(1+Math.cos(y))))),o.band(d),o.cap(d[0],!1),o.cap(d[d.length-1],!0),ki(o,t,!1);const[f,h,p]=i.wall,_=Math.max(0,Math.min(r-Math.max(f,h),e/2-f,n/2-h,(s-p)/2)),m=e/2-f-_,g=n/2-h-_,x=-s/2+p;return d.push(a(l,u,r,s/2),a(m,g,_,s/2)),d.push(..._>0?c(Math.PI/2,0).map(y=>a(m,g,_*Math.sin(y),x+_*(1-Math.cos(y)))):[a(m,g,0,x)]),o.band(d),o.cap(d[0],!1),o.cap(d[d.length-1],!0),ki(o,t,!1)}const ll=32,Iv=Math.cos(Zu*Math.PI/180);function Ju(i){if(i.shape==="extrude")return Av(i);if(i.shape==="sweep")return Cv(i);if(i.shape==="loft")return Pv(i);if(i.shape==="box"&&i.round)return Dv(i);const t=xf(i);if(t)return Fv(t,i.arc);if(!i.wall)return new Kn(1,1,1);const e=i.wall[0]/i.size[0],n=i.wall[1]/i.size[1],s=i.wall[2]/i.size[2],r=[[-.5,.5,-.5,.5,-.5,-.5+s],[-.5,-.5+e,-.5,.5,-.5+s,.5],[.5-e,.5,-.5,.5,-.5+s,.5],[-.5+e,.5-e,-.5,-.5+n,-.5+s,.5],[-.5+e,.5-e,.5-n,.5,-.5+s,.5]].filter(([a,c,l,u,d,f])=>c>a&&u>l&&f>d).map(([a,c,l,u,d,f])=>new Kn(c-a,u-l,f-d).translate((a+c)/2,(l+u)/2,(d+f)/2)),o=vo(r);for(const a of r)a.dispose();return o}function ao(i,t,e=(n=>(n=t.joint)==null?void 0:n.position)()??0){const{center:s,basis:r}=vf(t,e);i.matrix.makeBasis(new b(...r[0]),new b(...r[1]),new b(...r[2])).scale(new b(...t.size)).setPosition(...s),i.userData.jointAt=e}const $u=250;function Nv(i){return i!=null&&i("(prefers-reduced-motion: reduce)").matches?0:$u}function Uv(i){const t=new Map;return i.root.traverse(e=>{e.userData.joint&&t.set(e.userData.joint.key,e.userData.jointAt)}),t}function Ov(i,t,e,n=$u,s=requestAnimationFrame,r=cancelAnimationFrame){const o=[];if(i.root.traverse(u=>{var p;const d=u.userData.joint,f=d&&t.get(d.key);if(!d||f===void 0||n<=0||!(u instanceof Te))return;const h=((p=d.part.joint)==null?void 0:p.position)??0;f!==h&&o.push({mesh:u,part:d.part,from:f,to:h})}),!o.length)return()=>{};let a,c=0;const l=u=>{a??(a=u);const d=Math.min(1,(u-a)/n),f=d*d*(3-2*d);for(const{mesh:h,part:p,from:_,to:m}of o)ao(h,p,_+(m-_)*f),h.updateMatrixWorld(!0);e(),d<1&&(c=s(l))};for(const{mesh:u,part:d,from:f}of o)ao(u,d,f),u.updateMatrixWorld(!0);return c=s(l),()=>r(c)}function Fv(i,t){if(!t)return zv(i);const[e,n]=t,s=Math.max(2,Math.ceil(ll*n/(2*Math.PI))),r=ju(Qu(i),s,e,n);r.deleteAttribute("uv");const o=[r,Ah(i,e,-1),Ah(i,e+n,1)],a=vo(o);for(const c of o)c.dispose();return a}function Qu(i){const t=[];return i.forEach((e,n)=>{t.push(e);const s=i[n-1],r=i[n+1];if(!s||!r)return;const o=[e[0]-s[0],e[2]-s[2]],a=[r[0]-e[0],r[2]-e[2]],c=Math.hypot(o[0],o[1]),l=Math.hypot(a[0],a[1]);c>0&&l>0&&(o[0]*a[0]+o[1]*a[1])/(c*l)<Iv&&t.push(e)}),t}function ju(i,t,e=0,n=2*Math.PI){const s=new mo(i.map(([o,,a])=>new ft(o/2,a)),t,e+Math.PI/2,n).rotateX(Math.PI/2),r=s.getAttribute("position");for(let o=0;o<r.count;o++){const[a,c]=i[o%i.length];a>0&&r.setY(o,r.getY(o)*c/a)}return s.computeVertexNormals(),s}function Ah(i,t,e){const n=Math.cos(t),s=Math.sin(t),r=i.map(([h,p,_])=>({at:new b(h/2*n,p/2*s,_),flat:new ft(Math.hypot(h*n,p*s)/2,_)})).filter((h,p,_)=>h.flat.distanceTo(_[(p+1)%_.length].flat)>1e-9),o=new b(-s,n,0).multiplyScalar(e),a=[],c=[],l=new b,u=new b,d=new b;for(const h of ai.triangulateShape(r.map(p=>p.flat),[])){let[p,_,m]=h.map(g=>r[g].at);d.crossVectors(l.subVectors(_,p),u.subVectors(m,p)),d.dot(o)<0&&([_,m]=[m,_]),d.crossVectors(l.subVectors(_,p),u.subVectors(m,p)).normalize();for(const g of[p,_,m])a.push(g.x,g.y,g.z),c.push(d.x,d.y,d.z)}const f=new De;return f.setAttribute("position",new ue(a,3)),f.setAttribute("normal",new ue(c,3)),f.setIndex(a.map((h,p)=>p).slice(0,a.length/3)),f}function zv(i){const t=Qu(i),e=ju(t,ll,-Math.PI/2),n=e.getAttribute("normal"),s=new b,r=new b;for(let o=0;o<t.length;o++){const a=ll*t.length+o;s.fromBufferAttribute(n,o).add(r.fromBufferAttribute(n,a)).normalize(),n.setXYZ(o,s.x,s.y,s.z),n.setXYZ(a,s.x,s.y,s.z)}return e}const cl={wood:{colour:9132587,family:"wood"},pine:{colour:9132587,family:"wood"},oak:{colour:10514495,family:"wood"},lcd:{colour:1447450,family:"glass"},glass:{colour:13624298,family:"glass"},paper:{colour:15722184,family:"cloth"},cotton:{colour:7306652,family:"cloth"},linen:{colour:14274488,family:"cloth"},wool:{colour:10194814,family:"cloth"},silk:{colour:15260872,family:"cloth"},nylon:{colour:5923952,family:"cloth"},polyester:{colour:5924984,family:"cloth"},kevlar:{colour:13153370,family:"cloth"},leather:{colour:5910556,family:"leather"},foam:{colour:7306652,family:"plastic"},plastic:{colour:10132126,family:"plastic"},rubber:{colour:2763308,family:"plastic"},vinyl:{colour:3816e3,family:"plastic"},plexiglas:{colour:14215408,family:"plastic"},metal:{colour:9411238,family:"metal"},steel:{colour:9411238,family:"metal"},durasteel:{colour:9081500,family:"metal"},Fe:{colour:7237234,family:"metal"},Al:{colour:12106946,family:"metal"},Ti:{colour:10133670,family:"metal"},Cu:{colour:12088115,family:"metal"},brass:{colour:13215304,family:"metal"},bronze:{colour:11039802,family:"metal"},Au:{colour:13938487,family:"metal"},Ag:{colour:13158604,family:"metal"},stone:{colour:9210501,family:"stone"},granite:{colour:7302250,family:"stone"},limestone:{colour:13616816,family:"stone"},concrete:{colour:10131603,family:"stone"},ceramic:{colour:15262940,family:"ceramic"},clay:{colour:10771002,family:"ceramic"},brick:{colour:10242610,family:"ceramic"},plaster:{colour:15131094,family:"ceramic"},bone:{colour:14932681,family:"flesh"},H2O:{colour:4882344,family:"liquid"},dirt:{colour:6046768,family:"earth"},sand:{colour:13810058,family:"earth"}},Bv=12104358,Rh={metal:9411238,glass:13624298,wood:9132587,leather:5910556,cloth:7306652,stone:9210501,ceramic:15262940,plastic:10132126,flesh:13208442,plant:7049018,earth:6046768,liquid:4882344,ice:14478580,"energy field":6737151,fungal_ingredient:12101258,grain_meal:14207136},Hv={roughness:.8,metalness:.05},Ch={metal:{roughness:.25,metalness:1,reflection:2.6},glass:{roughness:.04,metalness:0,opacity:.3,clearcoat:1,clearcoatRoughness:.02},ceramic:{roughness:.35,metalness:0,clearcoat:1,clearcoatRoughness:.08},wood:{roughness:.6,metalness:0,clearcoat:.5,clearcoatRoughness:.3},leather:{roughness:.55,metalness:0,sheen:.6},cloth:{roughness:.95,metalness:0,sheen:1},stone:{roughness:.88,metalness:0},earth:{roughness:1,metalness:0},plastic:{roughness:.32,metalness:0},flesh:{roughness:.6,metalness:0},plant:{roughness:.7,metalness:0},liquid:{roughness:.05,metalness:0,opacity:.75,clearcoat:1,clearcoatRoughness:.02},ice:{roughness:.12,metalness:0,opacity:.7,clearcoat:1,clearcoatRoughness:.05},"energy field":{roughness:.2,metalness:0,opacity:.45,glow:.9},fungal_ingredient:{roughness:.8,metalness:0},grain_meal:{roughness:.95,metalness:0}};function kv(i){return i!==void 0&&Object.hasOwn(Ch,i)?Ch[i]:Hv}const kl=i=>i!==void 0&&Object.hasOwn(cl,i)?cl[i]:void 0,Gv=4906624,Vv=6004991,hl=16486972,Wv=3421247,Xv=14275786,Yv=13157563,qv=3811866,Zv=1052692,Fs=.08,Kv=.3,Ph=1.6,bi=50,Gl=70;function lo(i){var t;return((t=kl(Gh(i)))==null?void 0:t.colour)??Bv}function co(i){var t;return(t=kl(Gh(i)))==null?void 0:t.family}function tf(i,t,e){var a;const n=_f(i),s=Hh(i.colour),r=(n==null?void 0:n.family)??t;return{colour:s?kh(s):n?((a=kl(n.species))==null?void 0:a.colour)??(Object.hasOwn(Rh,n.family)?Rh[n.family]:e):e,family:r}}const Jv=i=>`#${i.toString(16).padStart(6,"0")}`;function $v(i,t){const e=i.userData.headBox;if(e&&e.chin===t)return e.box;const n=new ln,s=i.getAttribute("position"),r=new b;for(let o=0;o<s.count;o++)r.fromBufferAttribute(s,o),r.z>=t&&n.expandByPoint(r);return n.isEmpty()&&s.count>0&&n.setFromBufferAttribute(s),i.userData.headBox={chin:t,box:n},n}const tr=i=>[0,1,2,3,4,5,6,7].map(t=>new b(t&1?i.max.x:i.min.x,t&2?i.max.y:i.min.y,t&4?i.max.z:i.min.z)),Qv=.35,jv=1844787;class tM{constructor(t,e){di(this,"materials",new Map);this.figures=t,this.environment=e}material(t,e={}){const n=kv(e.family),s=e.opacity??n.opacity,r=`${t}:${s??1}:${e.emissive??0}:${e.family??""}:${e.doubleSided?2:1}`;let o=this.materials.get(r);if(!o){const a={color:t,roughness:n.roughness,metalness:n.metalness,transparent:s!==void 0,opacity:s??1,emissive:e.emissive??(n.glow?new se(t).multiplyScalar(n.glow):0),depthWrite:s===void 0,envMap:this.environment??null,envMapIntensity:Dh*(n.reflection??1)};o=n.clearcoat||n.sheen?new Sp({...a,clearcoat:n.clearcoat??0,clearcoatRoughness:n.clearcoatRoughness??0,sheen:n.sheen??0,sheenRoughness:.8,sheenColor:new se(t).lerp(new se(16777215),.3)}):new ps(a),(e.doubleSided||n.opacity!==void 0&&e.opacity===void 0)&&(o.side=Ln,o.polygonOffset=!0,o.polygonOffsetFactor=-1,o.polygonOffsetUnits=-1),o.userData.castsShadow=s===void 0,this.materials.set(r,o)}return o}box(t,e,n){const s=(o,a)=>Math.max(.01,a-o),r=new Te(new Kn(s(t.x0,t.x1),s(t.y0,t.y1),s(t.z0,t.z1)),e);return r.position.set((t.x0+t.x1)/2,(t.y0+t.y1)/2,(t.z0+t.z1)/2),r.userData.part=n,r}sphere(t,e,n,s){const r=new Te(new Wn(Math.max(.01,e),24,16),n);return r.position.set(t[0],t[1],t[2]),r.userData.part=s,r}figureMaterial(t=!1){const e=t?"figure-crystal":"figure";let n=this.materials.get(e);if(!n){const s={envMap:this.environment??null,envMapIntensity:Dh};n=t?new ps({color:16777215,vertexColors:!0,roughness:Qv,metalness:0,flatShading:!0,emissive:jv,...s}):new ps({color:16777215,vertexColors:!0,roughness:.8,metalness:.05,...s}),this.materials.set(e,n)}return n}person(t,e,n,s,r,o,a,c){const l=a!=null&&a.posture?{...typeof t=="object"&&t!==null&&!Array.isArray(t)?t:{},posture:a.posture}:t,u=a?{width:a.dimensions_m[0],depth:a.dimensions_m[1]}:c,d=$l(l,{height:(a==null?void 0:a.figure_height_m)??(a==null?void 0:a.dimensions_m[2])??r-s,base:Jv(o),footprint:u}),f=d.plan.kind==="humanoid"&&d.plan.covering==="crystal",h=wv(d,e,n,s,void 0,this.figureMaterial(f),this.figures);if(a){const v=ho(a);h.quaternion.premultiply(v);const T=new b(0,0,-a.dimensions_m[2]/2).applyQuaternion(v);h.position.fromArray(a.centre_m).add(T)}const p=this.wear(h,d,l);h.updateMatrixWorld(!0);const _=d.top-d.headHeight*1.05,m=qu(h.geometry,_),g=v=>v.clone().applyMatrix4(h.matrixWorld),x=$v(h.geometry,_).clone(),y=[];for(const v of p){const T=new ln().setFromBufferAttribute(v.geometry.getAttribute("position")).applyMatrix4(v.matrix);T.max.z<_||(x.union(T),y.push(...tr(T).filter(A=>A.z>=_)))}return{mesh:h,label:[...m,...y].map(g),head:tr(x).map(g),animal:d.plan.kind==="animal"}}wear(t,e,n){const s=qx(e);if(!s)return[];const r=[];mf(n).forEach((o,a)=>{const c=1+eM*a,l=new Map;for(const u of o.parts){const d=s[u.frame],f=Zx({...d,size:d.size.clone().multiply(new b(c,c,1))}),h=this.wornPart(t,u,f,o.colour,`worn ${o.name}`);l.set(u.frame,[...l.get(u.frame)??[],h]),r.push(h)}for(const[u,d]of l)aM(d,s[u],sM.has(u))});for(const o of cM(n)){const a=s[o.hand==="main"?"right_hand":"left_hand"],c=o.form_parts.map(l=>this.wornPart(t,l,new Yt,gf,`held ${o.name}`));lM(c,o,a,e.posture==="reclining"),r.push(...c)}return r}wornPart(t,e,n,s,r){const o=tf(e,void 0,kh(s)),a=new Te(Ju(e),this.material(o.colour,{family:o.family}));return a.userData.part=r,a.matrixAutoUpdate=!1,ao(a,e),a.matrix.premultiply(n),t.add(a),a}stand(t){const e=$l({build:"average"},{height:nM}),n=new Un;n.rotation.z=Math.PI,n.userData.part="stand";const s=this.material(iM);for(const r of Ev(e)){const o=new Te(r.geometry,s);o.userData.part="stand",n.add(o)}return this.wear(n,e,t),n}}const eM=.03,nM=1.75,iM=11901554,sM=new Set(Mf.filter(i=>/_(upper_arm|forearm|hand|thigh|shin|foot)$/.test(i))),rM=.02,oM=Math.PI/4;function cs(i,t=1){const e=new b;let n=Number.POSITIVE_INFINITY;for(const s of i){const r=s.geometry.getAttribute("position");for(let o=0;o<r.count;o++)n=Math.min(n,t*e.fromBufferAttribute(r,o).applyMatrix4(s.matrix).z)}return t*n}function aM(i,t,e){if(cs(i)>=-1e-9)return;const n=i.map(a=>a.matrix.clone()),s=a=>{i.forEach((c,l)=>{c.matrix.multiplyMatrices(a,n[l])})};if(e){const a=new Yt().makeTranslation(t.origin.x,t.origin.y,t.origin.z),c=new Yt().makeTranslation(-t.origin.x,-t.origin.y,-t.origin.z);for(let l=2;l<=180;l+=2)for(const u of[1,-1])if(s(a.clone().multiply(new Yt().makeRotationAxis(t.z,u*l*Math.PI/180)).multiply(c)),cs(i)>=-1e-9)return;s(new Yt)}const r=cs(i,-1),o=cs(i);if(r<=0){s(new Yt().makeScale(1,1,0).setPosition(0,0,.001));return}s(new Yt().makeTranslation(0,0,r).multiply(new Yt().makeScale(1,1,r/(r-o))).multiply(new Yt().makeTranslation(0,0,-r)))}function lM(i,t,e,n){const s=i.map(_=>_.matrix.clone()),r=new b(...t.grip.center),o=new b(...t.grip.axis).normalize();let a=0,c=0;const l=new b;i.forEach((_,m)=>{const g=_.geometry.getAttribute("position");for(let x=0;x<g.count;x++){const y=l.fromBufferAttribute(g,x).applyMatrix4(s[m]).sub(r).dot(o);a=Math.max(a,y),c=Math.max(c,-y)}}),c>a&&o.negate();const[u]=[new b(1,0,0),new b(0,1,0),new b(0,0,1)].map((_,m)=>({side:_,size:t.size[m]})).filter(({side:_})=>Math.abs(_.dot(o))<.9).sort((_,m)=>_.size-m.size),d=u.side.clone().addScaledVector(o,-u.side.dot(o)).normalize(),f=e.origin.clone().addScaledVector(e.z,e.size.z/2),h=(_,m)=>{const g=new Ne().setFromUnitVectors(o,_),x=d.clone().applyQuaternion(g),y=m.clone().addScaledVector(_,-m.dot(_)).normalize(),v=Math.atan2(x.clone().cross(y).dot(_),x.dot(y));return new Ne().setFromAxisAngle(_,v).multiply(g)},p=(_,m)=>{const g=new Yt().compose(_,m,new b(1,1,1)).multiply(new Yt().makeTranslation(-r.x,-r.y,-r.z));i.forEach((x,y)=>{x.matrix.multiplyMatrices(g,s[y])})};if(n){const _=h(new b(0,1,0),new b(0,0,1)),m=f.clone().setX(f.x+Math.sign(f.x)*e.size.x);p(m,_),m.z-=cs(i)-.001,p(m,_);return}for(let _=oM;;_=Math.max(0,_-Math.PI/180))if(p(f,h(new b(0,Math.cos(_),-Math.sin(_)),new b(1,0,0))),_===0||cs(i)>=rM)return}function cM(i){const t=typeof i=="object"&&i!==null?i.held:void 0;return Array.isArray(t)?t:[]}function ho(i){const[t,e,n,s]=i.body_quaternion;return new Ne(e,n,s,t).normalize()}const Vl=i=>[(i.x0+i.x1)/2,(i.y0+i.y1)/2];function Lh(i,t){var u,d;const{thing:e,bounds:n}=t,s=lo(e),r=co(e),o=i.material(s,{family:r}),a=n.x1-n.x0,c=n.y1-n.y0,l=n.z1-n.z0;switch(la(e)){case"table":{const f=Math.min(.05,l*.15),h=Math.min(.06,Math.min(a,c)/5),p=Math.min(a*.08,.05),_=Math.min(c*.08,.05),m=[[n.x0+p,n.y0+_],[n.x1-p-h,n.y0+_],[n.x0+p,n.y1-_-h],[n.x1-p-h,n.y1-_-h]].map(([g,x])=>i.box({x0:g,x1:g+h,y0:x,y1:x+h,z0:n.z0,z1:n.z1-f},o,"leg"));return[i.box({...n,z0:n.z1-f},o,"top"),...m]}case"seat":{const f=i.box({...n,z1:n.z0+l*.45},o,"seat"),h=(u=e.front)==null?void 0:u.axis;if(!h||Math.hypot(h[0],h[1])<1e-6)return[f];const p=Math.hypot(h[0],h[1]),_=h[0]/p,m=h[1]/p,g=Math.min(a,c)*.22,x=(Math.abs(_)*a+Math.abs(m)*c)/2-g/2,y=Math.abs(m)*a+Math.abs(_)*c,v=i.box({x0:-y/2,x1:y/2,y0:-g/2,y1:g/2,z0:n.z0,z1:n.z1},o,"back");return v.rotation.z=Math.atan2(-_,m),v.position.x=(n.x0+n.x1)/2-_*x,v.position.y=(n.y0+n.y1)/2-m*x,[f,v]}case"shelf":{const f=[i.box(n,o,"body")],h=i.material(new se(s).multiplyScalar(.55).getHex(),{family:r});for(let p=n.z0+.35;p<n.z1-.1;p+=.35)f.push(i.box({x0:n.x0-.008,x1:n.x1+.008,y0:n.y0-.008,y1:n.y1+.008,z0:p,z1:p+.02},h,"shelf"));return f}case"picture":{const f=a<=c,h=f?-.006:a*.12,p=f?c*.12:-.006,_=l*.12;return[i.box(n,i.material(qv,{family:"wood"}),"frame"),i.box({x0:n.x0+h,x1:n.x1-h,y0:n.y0+p,y1:n.y1-p,z0:n.z0+_,z1:n.z1-_},o,"picture")]}case"screen":return[i.box(n,i.material(Zv,{emissive:((d=e.state)==null?void 0:d.mode)==="running"?659488:0}),"screen")];case"door":{const f=a>=c,[h,p]=Vl(n),_=Math.min(n.z0+.95,n.z1-.05),m=f?[n.x0+a*.85,p+(p>0?-1:1)*(c/2+.03),_]:[h+(h>0?-1:1)*(a/2+.03),n.y0+c*.85,_];return[i.box(n,o,"leaf"),i.sphere(m,.03,i.material(cl.brass.colour,{family:"metal"}),"knob")]}case"flat":return[i.box({...n,z1:n.z0+Math.min(l,.05)},o,"block")];case"box":return ef(i,t)}}function ef(i,t){const e=i.material(lo(t.thing),{family:co(t.thing)});return t.footprints.map(n=>n.type==="circle"?i.sphere([n.cx,n.cy,(n.bounds.z0+n.bounds.z1)/2],n.r,e,"sphere"):i.box(n.bounds,e,"box"))}function hM(i,t,e,n){var y;const[s,r,o]=t.size,a=Fs,c=Math.min(2.05,o*.85),l=e==="north"||e==="south",[u,d]=l?[-s/2-a,s/2+a]:[-r/2,r/2],f=(v,T,A,M)=>e==="north"?{x0:v,x1:T,y0:r/2,y1:r/2+a,z0:A,z1:M}:e==="south"?{x0:v,x1:T,y0:-r/2-a,y1:-r/2,z0:A,z1:M}:e==="east"?{x0:s/2,x1:s/2+a,y0:v,y1:T,z0:A,z1:M}:{x0:-s/2-a,x1:-s/2,y0:v,y1:T,z0:A,z1:M},h=new Un;h.name=`${e} wall`,h.userData.wall=e,h.userData.finish=(y=t.finishes)==null?void 0:y.wall;const p=i.material(Xv),_=i.material(hl,{opacity:.55,emissive:6958600}),m=i.material(hl,{emissive:9059338}),g=t.exits.filter(v=>Bh(v,t.size)===e).map(v=>{const T=l?v.at[0]:v.at[1];return{exit:v,a:Math.max(u,T-v.width/2),b:Math.min(d,T+v.width/2)}}).sort((v,T)=>v.a-T.a);let x=u;for(const{exit:v,a:T,b:A}of g){T>x&&h.add(i.box(f(x,T,0,o),p,"wall")),o>c&&h.add(i.box(f(T,A,c,o),p,"lintel"));const M=i.box(f(T,A,0,c),_,"doorway");M.userData.exit=v.name,h.add(M),n.push(M);const E=f(T,A,0,.012),I=.15;e==="north"&&(E.y0-=I),e==="south"&&(E.y1+=I),e==="east"&&(E.x0-=I),e==="west"&&(E.x1+=I);const P=i.box(E,m,"threshold");P.userData.exit=v.name,h.add(P),n.push(P),x=Math.max(x,A)}return d>x&&h.add(i.box(f(x,d,0,o),p,"wall")),h}function uM({layout:i,placed:t,youId:e,figures:n,environment:s}){var M,E,I,P;const r=new tM(n,s),[o,a]=i.size,c=new Un,l=[];c.add(new Tp(16777215,4473936,fM)),c.add(mM(i.size));const u=r.box({x0:-o/2,x1:o/2,y0:-a/2,y1:a/2,z0:-.02,z1:0},r.material(Wv),"floor");u.userData.finish=(M=i.finishes)==null?void 0:M.floor,c.add(u);const d=r.box({x0:-o/2-Fs,x1:o/2+Fs,y0:-a/2-Fs,y1:a/2+Fs,z0:i.size[2],z1:i.size[2]+.02},r.material(Yv),"ceiling");d.userData.finish=(E=i.finishes)==null?void 0:E.ceiling,c.add(d);const f=yf(o),h=[];for(let C=Math.ceil(-o/2/f)*f;C<o/2;C+=f)C>-o/2&&h.push(C,-a/2,.002,C,a/2,.002);for(let C=Math.ceil(-a/2/f)*f;C<a/2;C+=f)C>-a/2&&h.push(-o/2,C,.002,o/2,C,.002);const p=new De;p.setAttribute("position",new ue(h,3));const _=new po(p,new Al({color:10066346,transparent:!0,opacity:.18}));_.userData.part="grid",c.add(_);const m={};for(const C of["north","south","east","west"])m[C]=hM(r,i,C,l),c.add(m[C]);for(const C of i.exits){if(Bh(C,i.size))continue;const N=Math.max(C.width,.4)/2,[B,U,z]=C.at,W=r.box({x0:B-N,x1:B+N,y0:U-N,y1:U+N,z0:z,z1:z+.02},r.material(hl,{opacity:.6}),"hatch");W.userData.exit=C.name,c.add(W),l.push(W)}const g=new Map,x=new Map,y=new Map;for(const C of t){const N=new Un;N.name=C.thing.id,N.userData.thingId=C.thing.id;const[B,U]=Vl(C.bounds);if(Ws(C.thing)){N.userData.form="person";const z=C.thing.id===e?Vv:Gv,{mesh:W,label:X,head:it,animal:L}=r.person(C.thing.appearance,B,U,C.bounds.z0,C.bounds.z1,z,as(C.thing.pose)?C.thing.pose:void 0,{width:C.bounds.x1-C.bounds.x0,depth:C.bounds.y1-C.bounds.y0});N.add(W),N.userData.animal=L,x.set(C.thing.id,X),y.set(C.thing.id,it)}else{N.userData.form=la(C.thing);const z=C.thing.pose;if(C.thing.stand){N.userData.form="stand";const W=r.stand(C.thing.stand);N.add(W),as(z)?(W.position.z=-z.dimensions_m[2]/2,N.quaternion.copy(ho(z)),N.position.fromArray(z.centre_m)):W.position.set(B,U,C.bounds.z0),N.updateMatrixWorld(!0);const X=new ln().setFromObject(N);x.set(C.thing.id,[new b(B,U,Math.max(C.bounds.z1,X.max.z))]),c.add(N),g.set(C.thing.id,N);continue}if(as(z)&&(z.box||(I=C.thing.form_parts)!=null&&I.length)){const[W,X,it]=z.dimensions_m,L={...C,bounds:{x0:-W/2,x1:W/2,y0:-X/2,y1:X/2,z0:-it/2,z1:it/2}};if((P=C.thing.form_parts)!=null&&P.length){const H=lo(C.thing);for(const k of C.thing.form_parts){const{role:at,fitting:mt}=k,V=tf(k,co(C.thing),H),nt=mt&&!Hh(k.colour)?new se(V.colour).multiplyScalar(.78).getHex():V.colour,Et=Ju(k),Pt=r.material(nt,{family:V.family,doubleSided:Et.userData.open===!0}),Mt=new Te(Et,Pt);Mt.userData.part=(mt==null?void 0:mt.name)??at??"form",Mt.matrixAutoUpdate=!1,ao(Mt,k);const Ut=at??(mt==null?void 0:mt.lifetime);k.joint&&Ut&&(Mt.userData.joint={key:JSON.stringify([C.thing.id,Ut]),part:k}),mt&&(Mt.userData.fitting=mt.lifetime),at&&C.thing.lifetime&&(Mt.userData.inspect=[C.thing.id,C.thing.lifetime,at]),N.add(Mt)}}else if(la(C.thing)==="box")N.add(r.box(L.bounds,r.material(lo(C.thing),{family:co(C.thing)}),"box"));else for(const H of Lh(r,L))N.add(H);N.quaternion.copy(ho(z)),N.position.fromArray(z.centre_m)}else if(as(z))for(const W of ef(r,C))N.add(W);else for(const W of Lh(r,C))N.add(W);x.set(C.thing.id,[new b(B,U,C.bounds.z1)])}c.add(N),g.set(C.thing.id,N)}n==null||n.sweep();const v=new Map,T=new Un;T.name="tiny figure markers";const A=new Ul(xM,1,40);for(const[C,N]of g){if(N.userData.form!=="person")continue;const B=new Te(A,new fo({color:vM,transparent:!0,opacity:0,depthWrite:!1}));B.name=`marker ${C}`,B.visible=!1,T.add(B),v.set(C,B)}c.add(T),u.receiveShadow=!0;for(const C of Object.values(m))C.traverse(N=>{N.receiveShadow=!0});for(const C of g.values())C.traverse(N=>{N instanceof Te&&(N.receiveShadow=!0,N.castShadow=N.material.userData.castsShadow!==!1)});return c.updateMatrixWorld(!0),{root:c,walls:m,ceiling:d,exits:l,things:g,labelPoints:x,heads:y,markers:v}}const fM=.35,dM=1.6,Dh=.5,ra=2048,pM=3;function mM(i){const[t,e,n]=i,s=new Pp(16777215,dM);s.position.set(t*.4,-e*.6,Math.max(6,n+2)),s.castShadow=!0;const r=new Yt().lookAt(s.position,new b,Ge.DEFAULT_UP).setPosition(s.position).invert(),o=new ln;for(const u of[-t/2,t/2])for(const d of[-e/2,e/2])for(const f of[0,n])o.expandByPoint(new b(u,d,f).applyMatrix4(r));const a=.1,c=s.shadow.camera;c.left=o.min.x-a,c.right=o.max.x+a,c.bottom=o.min.y-a,c.top=o.max.y+a,c.near=Math.max(.05,-o.max.z-a),c.far=-o.min.z+a,c.updateProjectionMatrix(),s.shadow.mapSize.set(ra,ra),s.shadow.radius=pM;const l=Math.max(c.right-c.left,c.top-c.bottom)/ra;return s.shadow.normalBias=l*1.5,s.shadow.bias=-2e-4,s}const Ih=16,gM=10,_M=11,xM=.86,vM=15263981;function MM(i){return Math.min(1,Math.max(0,(Ih-i)/(Ih-gM)))}function yM(i,t,e,n,s){const r=new ln,o=new b;for(const[a,c]of i.markers){const l=i.things.get(a);if(c.visible=!1,s!=="dollhouse"||!(l!=null&&l.visible)||(r.setFromObject(l),r.isEmpty()))continue;const u=Wl(tr(r),t,e,n);if(!u)continue;const d=MM(u.y1-u.y0);if(d===0)continue;r.getCenter(o);const f=2*t.position.distanceTo(o)*Math.tan(t.fov/2*Math.PI/180)/n,h=Math.hypot(r.max.x-r.min.x,r.max.y-r.min.y)/2;c.scale.setScalar(Math.max(_M*f,h*1.3)),c.position.set(o.x,o.y,r.min.z+.003),c.material.opacity=d,c.visible=!0}}function SM(i,t,e){var s,r;if(t.length!==e.length)return!1;const n=[];for(let o=0;o<t.length;o++){const a=t[o],c=e[o];if(a.thing===c.thing)continue;const l=a.thing.pose,u=c.thing.pose;if(a.thing.id!==c.thing.id||!i.things.has(c.thing.id)||!as(l)||!as(u)||!u.box&&!Ws(c.thing)||l.box!==u.box||l.figure_height_m!==u.figure_height_m||l.posture!==u.posture||l.dimensions_m.some((f,h)=>f!==u.dimensions_m[h])||a.thing.appearance!==c.thing.appearance||a.thing.stand!==c.thing.stand||a.thing.state!==c.thing.state||a.thing.form_parts!==c.thing.form_parts||a.thing.material!==c.thing.material||a.thing.classes!==c.thing.classes||JSON.stringify((s=a.thing.front)==null?void 0:s.axis)!==JSON.stringify((r=c.thing.front)==null?void 0:r.axis))return!1;const d=f=>new Yt().compose(new b(...f.centre_m),ho(f),new b(1,1,1));n.push({old:a,next:c,delta:d(u).multiply(d(l).invert())})}for(const{next:o,delta:a}of n){const c=i.things.get(o.thing.id);if(!c)return!1;if(c.applyMatrix4(a),Ws(o.thing)){for(const l of i.heads.get(o.thing.id)??[])l.applyMatrix4(a);for(const l of i.labelPoints.get(o.thing.id)??[])l.applyMatrix4(a)}else{const[l,u]=Vl(o.bounds);i.labelPoints.set(o.thing.id,[new b(l,u,o.bounds.z1)])}}return i.root.updateMatrixWorld(!0),!0}function Wl(i,t,e,n){const s=new b,r={x0:Number.POSITIVE_INFINITY,x1:Number.NEGATIVE_INFINITY,y0:Number.POSITIVE_INFINITY,y1:Number.NEGATIVE_INFINITY};for(const o of i){if(s.copy(o).project(t),s.z<-1||s.z>1)return;const a=(s.x+1)/2*e,c=(1-s.y)/2*n;r.x0=Math.min(r.x0,a),r.x1=Math.max(r.x1,a),r.y0=Math.min(r.y0,c),r.y1=Math.max(r.y1,c)}return r}function EM(i,t,e,n){const s=new b().copy(i[0]).project(t);if(s.z<-1||s.z>1)return;const r=s.x;let o=i.length===1?s.y:Number.NEGATIVE_INFINITY;for(let a=1;a<i.length;a++)s.copy(i[a]).project(t),s.z>=-1&&s.z<=1&&(o=Math.max(o,s.y));return{x:(r+1)/2*e,top:(1-o)/2*n}}function bM(i,t,e,n){const[s,r,o]=t.size,a={north:e.y>r/2,south:e.y<-r/2,east:e.x>s/2,west:e.x<-s/2},c=Math.min(1,Kv/o);for(const l of["north","south","east","west"])i.walls[l].scale.z=n==="dollhouse"&&a[l]?c:1;i.ceiling.visible=n==="eyes"}function ys(i,t=bi){const[e,n,s]=i.size,r=[0,0,Math.min(s,2)*.25],a=Math.hypot(e,n)/2/Math.sin(t/2*Math.PI/180)*1.05,c=new b(.45,-1,1.05).normalize().multiplyScalar(a);return{position:[r[0]+c.x,r[1]+c.y,r[2]+c.z],target:r}}const zs=.87,wM=10;function Nh(i,t=bi){const e=ys(i,t),n=Math.hypot(...e.position.map((s,r)=>s-e.target[r]));return Math.max(60,n*1.5)}function TM(i,t,e){const n=new b().subVectors(e,t);i.position.add(n),t.add(n)}function nf(i,t){return i?new b((i.x0+i.x1)/2,(i.y0+i.y1)/2,i.z0+(i.z1-i.z0)*.9):new b(...ys(t).target)}function sf(i,t,e,n=bi){const s=t.bounds,r=i.things.get(t.thing.id);if(!(r!=null&&r.userData.animal))return{point:nf(s,e),frame:0,box:tr(new ln(new b(s.x0,s.y0,s.z0),new b(s.x1,s.y1,s.z1)))};const o=new ln().setFromObject(r),a=o.getBoundingSphere(new Gi).radius,c=Math.max(a/Math.sin(n/2*Math.PI/180)*1.1,a+rf*2);return{point:o.getCenter(new b),frame:c,box:tr(o)}}const AM=20,ul=1.5;function RM(i,t=bi){const e=ys(i,t),n=Math.hypot(...e.position.map((s,r)=>s-e.target[r]));return Math.min(.95,(ul/n)**(1/AM))}function CM(i,t){return Math.min(1,Math.abs(i)/(t===1?3:t===2?1:100))}const Uh=12,Dn=.5,rf=.05,PM=.15;function LM(i,t,e=bi){if(i>=Dn)return 1;const n=ys(t,e),s=Math.hypot(...n.position.map((r,o)=>r-n.target[o]));return s>ul?Math.max(1,Math.log(i/s)/Math.log(ul/s)):1}function DM(i){return Math.min(Dn,(i==null?void 0:i.nearest)??Dn)}const of=i=>{for(;i&&i.userData.thingId===void 0;)i=i.parent;return i==null?void 0:i.userData.thingId};function IM(i){return[...Array.from(i.things.values()).filter(t=>t.visible),...Object.values(i.walls),...i.exits.filter(t=>t.parent===i.root)]}function NM(i){if(!i)return;if(i.userData.fitting)return{kind:"fitting",lifetime:i.userData.fitting};if(i.userData.inspect){const[e,n,s]=i.userData.inspect;return{kind:"inspect",id:e,lifetime:n,role:s}}if(i.userData.exit)return{kind:"exit",name:i.userData.exit};const t=of(i);return t===void 0?void 0:{kind:"thing",id:t}}const Oh=16777215,UM=.55,OM=.2;function FM(i,t){const e=new b(i.x1-i.x0,i.y1-i.y0,i.z1-i.z0),n=Math.min(.04,Math.max(.01,Math.max(e.x,e.y,e.z)*.02));e.addScalar(n*2);const s=new Un;s.name="selection";const r=new Un;r.position.set((i.x0+i.x1)/2,(i.y0+i.y1)/2,(i.z0+i.z1)/2);const o=e.clone().multiplyScalar(OM),a=[];for(const l of[-1,1])for(const u of[-1,1])for(const d of[-1,1]){const f=new b(l*e.x/2,u*e.y/2,d*e.z/2);a.push(f,f.clone().setX(f.x-l*o.x)),a.push(f,f.clone().setY(f.y-u*o.y)),a.push(f,f.clone().setZ(f.z-d*o.z))}const c=new po(new De().setFromPoints(a),new Al({color:Oh,depthTest:!1,transparent:!0}));if(c.renderOrder=1e3,r.add(c),s.add(r),t&&t.userData.form!=="person"){const l=new fo({color:Oh,transparent:!0,opacity:UM,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-4});t.updateWorldMatrix(!0,!0),t.traverse(u=>{if(!(u instanceof Te)||!u.visible)return;const d=new Te(u.geometry,l);d.name="selection glow",d.matrixAutoUpdate=!1,d.matrixWorldAutoUpdate=!1,d.matrixWorld.copy(u.matrixWorld),d.onBeforeRender=()=>d.matrixWorld.copy(u.matrixWorld),d.renderOrder=999,s.add(d)})}return r.updateMatrixWorld(!0),s}function af(i){i.removeFromParent();const t=new Set;i.traverse(e=>{(e instanceof Te||e instanceof po)&&(e.name!=="selection glow"&&t.add(e.geometry),t.add(e.material))});for(const e of t)e.dispose()}const Fh=(i,t)=>Math.hypot(Math.max(t.x0-i.x,0,i.x-t.x1),Math.max(t.y0-i.y,0,i.y-t.y1));function zM(i,t,e,n,s,r,o=[]){var m,g;const a=new io;a.setFromCamera(new ft(t.x/e.width*2-1,-(t.y/e.height)*2+1),i);const c=[...n.things.values()].filter(x=>x.visible),l=i.getWorldPosition(new b),u=i instanceof Mn?i.fov:bi,d=[];for(const x of s){if(((m=n.things.get(x.thing.id))==null?void 0:m.userData.form)!=="person"||!((g=n.things.get(x.thing.id))!=null&&g.visible))continue;const y=sf(n,x,r,u),v=l.distanceTo(y.point),T=o.find(I=>I.id===x.thing.id),A=T?Fh(t,T):Number.POSITIVE_INFINITY;if(A<=Uh){d.push({person:x,focus:y,byLabel:!0,off:A,depth:v});continue}const M=Wl(y.box,i,e.width,e.height);if(!M)continue;const E=Fh(t,M);E<=Uh&&d.push({person:x,focus:y,byLabel:!1,off:E,depth:v})}d.sort((x,y)=>Number(y.byLabel)-Number(x.byLabel)||x.off-y.off||x.depth-y.depth);for(const{person:x,focus:y,depth:v}of d){const T=y.point,M=new io(l,T.clone().sub(l).normalize(),0,v).intersectObjects(c,!0)[0];if(M&&of(M.object)!==x.thing.id)continue;const E=y.frame>0?y.frame:Math.max(Dn,BM(T,l,x.bounds,PM));return{point:T,nearest:E,pace:LM(E,r,u)}}const f=a.intersectObjects([...c,...Object.values(n.walls)],!0)[0];if(f)return{point:f.point.clone(),nearest:Dn,pace:1};const h=a.ray.intersectPlane(new Hn(new b(0,0,1),0),new b),[p,_]=r.size;return h&&Math.abs(h.x)<=p/2&&Math.abs(h.y)<=_/2?{point:h,nearest:Dn,pace:1}:void 0}function BM(i,t,e,n){const s=new ln(new b(e.x0-n,e.y0-n,e.z0),new b(e.x1+n,e.y1+n,e.z1+n)),r=t.clone().sub(i).normalize(),o=i.clone().addScaledVector(r,1e3),a=new er(o,r.clone().negate()).intersectBox(s,new b);return a?i.distanceTo(a):0}class HM{constructor(){di(this,"fingers",new Map);di(this,"start",null)}down(t,e,n){this.fingers.set(t,{x:e,y:n}),this.start=this.fingers.size===2?this.midpoint():null}move(t,e,n){if(!this.fingers.has(t))return;const s=this.spacing();this.fingers.set(t,{x:e,y:n});const r=this.spacing();if(!(this.fingers.size!==2||!this.start||s===0||r===0||s===r))return{scale:s/r,at:this.start}}up(t){this.fingers.delete(t),this.start=null}get pinching(){return this.start!==null}spacing(){const[t,e]=[...this.fingers.values()];return t&&e?Math.hypot(t.x-e.x,t.y-e.y):0}midpoint(){const[t,e]=[...this.fingers.values()];return{x:(t.x+e.x)/2,y:(t.y+e.y)/2}}}function kM(i,t,e,n,s=0,r=1){const o=n**r;if(o<1){const a=i.distanceTo(e),c=a>s?Math.max(o,s/a):1;i.sub(e).multiplyScalar(c).add(e),t.sub(e).multiplyScalar(o*o).add(e)}else i.sub(t).multiplyScalar(o).add(t)}function GM(i,t){if(t==="+"||t==="=")return fl(i,1);if(t==="-"||t==="_")return fl(i,-1);if(t==="0")return Gl}function fl(i,t){return Math.min(Gl,Math.max(wM,i*zs**t))}function VM(i,t,e,n){const s=t?[t[0],t[1],t[2]>.8?t[2]:Ph]:n?[(n.x0+n.x1)/2,(n.y0+n.y1)/2,Math.max(n.z1-.1,.8)]:[0,0,Math.min(Ph,i.size[2]*.8)],r=e?Math.hypot(e[0],e[1],e[2]):0,[o,a,c]=e&&r>1e-6?e.map(l=>l/r):[0,1,0];return{position:s,target:[s[0]+o,s[1]+a,s[2]+c]}}function zh(i){const t=new Set;i.root.traverse(e=>{if(e instanceof Te||e instanceof po){e.userData.keptGeometry||e.geometry.dispose();const n=e.material;for(const s of Array.isArray(n)?n:[n])t.add(s)}});for(const e of t)e.dispose()}class WM extends hu{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;const t=new Kn;t.deleteAttribute("uv");const e=new ps({side:fn}),n=new ps,s=new Rp(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);const r=new Te(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const o=new Od(t,n,6),a=new Ge;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);const c=new Te(t,rs(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);const l=new Te(t,rs(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);const u=new Te(t,rs(17));u.position.set(14.904,12.198,-1.832),u.scale.set(.15,4.265,6.331),this.add(u);const d=new Te(t,rs(43));d.position.set(-.462,8.89,14.52),d.scale.set(4.38,5.441,.088),this.add(d);const f=new Te(t,rs(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);const h=new Te(t,rs(100));h.position.set(0,20,0),h.scale.set(1,.1,1),this.add(h)}dispose(){const t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(const e of t)e.dispose()}}function rs(i){return new Ep({color:0,emissive:16777215,emissiveIntensity:i})}function XM(){const i=new Tx({antialias:!0});i.setPixelRatio(window.devicePixelRatio),i.setClearColor(1315866),i.outputColorSpace=vn,i.toneMapping=ml,i.shadowMap.enabled=!0,i.shadowMap.type=Hs,i.shadowMap.autoUpdate=!1;const t=new js(i),e=new WM,n=t.fromScene(e,.04).texture;return e.dispose(),t.dispose(),{renderer:i,environment:n,dispose:()=>{n.dispose(),i.dispose()}}}const YM=3,qM=4;function ZM(i,t){const e=`${i.className}
${i.textContent}`;let n=t.get(e);if(!n){const s=getComputedStyle(i),r=Number.parseFloat(s.fontSize),o=document.createElement("canvas").getContext("2d");if(!o||!(r>0))return{width:0,height:0};o.font=`${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;const a=Number.parseFloat(s.lineHeight);n={width:o.measureText(i.textContent??"").width,height:a>0?a:r*1.2},t.set(e,n)}return n}function oa(i,t){var s;i.selection&&af(i.selection),i.selection=null;for(const[r,o]of i.labelObjects)o.element.classList.toggle("rl3d-label-selected",r===t);const e=t===null?void 0:i.placed.find(r=>r.thing.id===t),n=e&&((s=i.room)==null?void 0:s.things.get(e.thing.id));!e||!(n!=null&&n.visible)||(i.selection=FM(e.bounds,n),i.scene.add(i.selection))}function KM(){const i=document.createElement("canvas");return!!(i.getContext("webgl2")??i.getContext("webgl"))}function aa(i,t){i.camera.position.set(...t.position),i.controls.target.set(...t.target),i.camera.lookAt(i.controls.target)}const jM=({layout:i,placed:t,youId:e,label:n,mode:s,selectedId:r,onSelect:o,onExit:a,onFitting:c,onInspect:l})=>{var it;const u=An(null),d=An(null),f=An(s),h=An(a);h.current=a;const p=An(r);p.current=r;const[_]=Sf(KM),m=Ql(L=>L.listenerPosition),g=Ql(L=>L.listenerOrientation.forward),x=An([]);Ef(()=>{const L=u.current;if(!L||!_)return;const{renderer:H,environment:k,dispose:at}=XM();H.domElement.setAttribute("aria-hidden","true"),L.appendChild(H.domElement);const mt=new Gx;mt.domElement.className="room-layout-3d-labels",mt.domElement.setAttribute("aria-hidden","true"),L.appendChild(mt.domElement);const V=new Mn(bi,4/3,rf,200);V.up.set(0,0,1);const nt=new Rx(V,H.domElement);nt.maxPolarAngle=Math.PI/2-.05,nt.minDistance=Dn,nt.touches.TWO=null;const Et=new hu,Pt={renderer:H,labels:mt,camera:V,controls:nt,scene:Et,room:null,stopJoints:()=>{},layout:null,placed:[],figures:new bv,environment:k,labelObjects:new Map,labelSizes:new Map,personLabels:[],selection:null,render:()=>{Pt.room&&(bM(Pt.room,y.current,V.position,f.current),yM(Pt.room,V,L.clientWidth,L.clientHeight,f.current)),H.render(Et,V),v(Pt),mt.render(Et,V)}};d.current=Pt,nt.addEventListener("change",Pt.render);const Mt=()=>{const Ot=L.clientWidth,Zt=L.clientHeight;Ot===0||Zt===0||(H.setSize(Ot,Zt,!1),H.domElement.style.width="100%",H.domElement.style.height="100%",mt.setSize(Ot,Zt),V.aspect=Ot/Zt,V.updateProjectionMatrix(),Pt.render())},Ut=typeof ResizeObserver>"u"?null:new ResizeObserver(Mt);Ut==null||Ut.observe(L),Mt();const qt=Ot=>N.current(Ot);return L.addEventListener("wheel",qt,{capture:!0,passive:!1}),()=>{L.removeEventListener("wheel",qt,{capture:!0}),Ut==null||Ut.disconnect(),nt.removeEventListener("change",Pt.render),nt.dispose(),Pt.stopJoints(),Pt.selection&&af(Pt.selection),Pt.room&&zh(Pt.room),Pt.figures.dispose(),at(),H.domElement.remove(),mt.domElement.remove(),d.current=null}},[_]);const y=An(i);y.current=i;function v(L){var Ut,qt,Ot,Zt,Qt;const H=L.labels.domElement.clientWidth||L.renderer.domElement.clientWidth,k=L.labels.domElement.clientHeight||L.renderer.domElement.clientHeight,at=[],mt=new Map,V=new b;for(const{id:$,text:ht}of bf(x.current,p.current)){const ut=(Ut=L.room)==null?void 0:Ut.labelPoints.get($),bt=L.labelObjects.get($);if(!ut||!bt||(bt.visible=!1,!((qt=bt.parent)!=null&&qt.visible)))continue;const yt=EM(ut,L.camera,H,k);if(!yt)continue;bt.getWorldPosition(V).project(L.camera),mt.set($,[(V.x+1)/2*H,(1-V.y)/2*k]);const Jt=ZM(bt.element,L.labelSizes);if(Jt.width===0)continue;const Bt=$===p.current?qM*2:0,he={width:Jt.width+Bt,height:Jt.height+Bt};at.push({id:$,text:ht,x:yt.x,top:yt.top,...he})}const nt=[];for(const[$,ht]of((Ot=L.room)==null?void 0:Ot.heads)??[]){if(!((Qt=(Zt=L.room)==null?void 0:Zt.things.get($))!=null&&Qt.visible))continue;const ut=Wl(ht,L.camera,H,k);ut&&nt.push({id:$,...ut})}const Et=4,Pt=wf(at,YM,{x0:Et,x1:H-Et,y0:Et,y1:k-Et},nt),Mt=new Set(x.current.filter($=>$.person).map($=>$.id));L.personLabels=[];for(const $ of Pt){const ht=L.labelObjects.get($.id),ut=mt.get($.id);if(!ht||!ut)continue;ht.visible=!0,ht.element.style.translate=`${$.x-ut[0]}px ${$.y-ut[1]}px`;const bt=at.find(yt=>yt.id===$.id);bt&&Mt.has($.id)&&L.personLabels.push({id:$.id,x0:$.x-bt.width/2,x1:$.x+bt.width/2,y0:$.y-bt.height/2,y1:$.y+bt.height/2})}}ar(()=>{var Pt,Mt,Ut;const L=d.current;if(!L)return;if(s==="dollhouse"&&(L.controls.maxDistance=Nh(i)),L.room&&((Pt=L.layout)==null?void 0:Pt.size)===i.size&&L.layout.exits===i.exits&&L.layout.finishes===i.finishes&&SM(L.room,L.placed,t)){L.layout=i,L.placed=t;for(const[Ot,Zt]of L.labelObjects){const Qt=(Mt=L.room.labelPoints.get(Ot))==null?void 0:Mt[0];Qt&&Zt.parent&&Zt.position.copy(Zt.parent.worldToLocal(Qt.clone()))}const qt=L.room.things.get(e);qt&&(qt.visible=s!=="eyes"),oa(L,p.current),L.renderer.shadowMap.needsUpdate=!0,L.render();return}const H=L.room;H&&L.scene.remove(H.root);for(const qt of L.labelObjects.values())qt.removeFromParent();L.labelObjects.clear(),L.stopJoints();const k=H?Uv(H):new Map,at=uM({layout:i,placed:t,youId:e,figures:L.figures,environment:L.environment});L.room=at,L.layout=i,L.placed=t,L.scene.add(at.root);const mt=at.things.get(e);mt&&(mt.visible=s!=="eyes");const V=Tf(t,e),nt=[...V.filter(qt=>Ws(qt.thing)).map(qt=>({id:qt.thing.id,text:yo(jl(qt.thing,e)),person:!0})),...V.filter(qt=>!Ws(qt.thing)).map(({thing:qt})=>{var $;const Ot=(($=qt.form_parts)==null?void 0:$.flatMap(({fitting:ht})=>ht!=null&&ht.opened?ht.contents:[]))??[],Zt=yo(jl(qt,e)),Qt=Ot.length?`${Zt} · ${yo(Ot[0].name)}${Ot.length>1?` (+${Ot.length-1})`:""}`:Zt;return{id:qt.id,text:Qt,person:!1}})];x.current=nt;for(const{id:qt,text:Ot,person:Zt}of nt){const Qt=at.labelPoints.get(qt),$=at.things.get(qt);if(!Qt||!$)continue;const ht=document.createElement("div");ht.className=qt===e?"rl3d-label rl3d-label-you":Zt?"rl3d-label rl3d-label-person":"rl3d-label",ht.textContent=Ot,ht.style.display="none",L.labels.domElement.appendChild(ht);const ut=(Ut=at.markers.get(qt))==null?void 0:Ut.material,bt=ut?getComputedStyle(ht).color:"";ut&&bt&&ut.color.setStyle(bt);const yt=new kx(ht);$.updateWorldMatrix(!0,!1),yt.position.copy($.worldToLocal(Qt[0].clone())),yt.visible=!1,$.add(yt),L.labelObjects.set(qt,yt)}oa(L,p.current);const Et=()=>{L.renderer.shadowMap.needsUpdate=!0,L.render()};L.stopJoints=Ov(at,k,Et,Nv(typeof window.matchMedia=="function"?qt=>window.matchMedia(qt):void 0)),Et(),H&&zh(H)},[i,t,e,s]),ar(()=>{const L=d.current;L&&(oa(L,r),L.render())},[r]);const T=(it=t.find(L=>L.thing.id===e))==null?void 0:it.bounds;ar(()=>{const L=d.current;f.current=s,L&&(L.controls.enabled=s==="dollhouse",L.camera.fov=s==="eyes"?Gl:bi,L.camera.updateProjectionMatrix(),P.current=null,s==="dollhouse"&&(L.controls.maxDistance=Nh(i),aa(L,ys(i)),L.controls.update(),L.render()))},[s,i.num]),ar(()=>{const L=d.current;if(!L||s!=="eyes")return;const H=m?tc(m):null,k=g?tc(g):null;aa(L,VM(i,H,k,T)),L.render()},[s,i,m,g,T==null?void 0:T.x0,T==null?void 0:T.y0,T==null?void 0:T.z1]);const A=An(null),M=L=>{z(L),A.current=L.isPrimary&&L.button===0?{id:L.pointerId,x:L.clientX,y:L.clientY}:null},E=L=>{var Et;z(L);const H=A.current;A.current=null;const k=d.current;if(!(k!=null&&k.room)||!H||H.id!==L.pointerId||Math.hypot(L.clientX-H.x,L.clientY-H.y)>4)return;const at=k.renderer.domElement.getBoundingClientRect();if(at.width===0||at.height===0)return;const mt=new ft((L.clientX-at.left)/at.width*2-1,-((L.clientY-at.top)/at.height)*2+1),V=new io;V.setFromCamera(mt,k.camera);const nt=NM((Et=V.intersectObjects(IM(k.room),!0)[0])==null?void 0:Et.object);(nt==null?void 0:nt.kind)==="fitting"?c(nt.lifetime):(nt==null?void 0:nt.kind)==="inspect"?l(nt.id,nt.lifetime,nt.role):(nt==null?void 0:nt.kind)==="exit"?h.current(nt.name):(nt==null?void 0:nt.kind)==="thing"&&o(nt.id)},I=L=>{const H=d.current,k=H?GM(H.camera.fov,L):void 0;return!H||k===void 0?!1:(H.camera.fov=k,H.camera.updateProjectionMatrix(),H.render(),!0)},P=An(null),C=L=>{const H=d.current;if(!H)return;L.preventDefault(),L.stopPropagation();const k=L.deltaMode,at=L.deltaY;if(at===0)return;const mt=CM(at,k)*(at<0?1:-1);if(s==="eyes"){H.camera.fov=fl(H.camera.fov,mt),H.camera.updateProjectionMatrix(),H.render();return}B(H,L.clientX,L.clientY,RM(i)**mt)},N=An(C);N.current=C;const B=(L,H,k,at)=>{var nt;const mt=P.current;if(!mt||Math.hypot(H-mt.x,k-mt.y)>4){const Et=L.renderer.domElement.getBoundingClientRect(),Pt=L.room?zM(L.camera,{x:H-Et.left,y:k-Et.top},Et,L.room,t,i,L.personLabels):void 0;P.current={x:H,y:k,pick:Pt}}const V=(nt=P.current)==null?void 0:nt.pick;kM(L.camera.position,L.controls.target,(V==null?void 0:V.point)??L.controls.target.clone(),at,(V==null?void 0:V.nearest)??Dn,V==null?void 0:V.pace),L.controls.minDistance=DM(V),L.controls.update(),L.render()},U=An(new HM),z=L=>{const H=d.current;if(!(!H||L.pointerType!=="touch"||s!=="dollhouse"))if(L.type==="pointerdown")U.current.down(L.pointerId,L.clientX,L.clientY);else if(L.type==="pointerup"||L.type==="pointercancel")U.current.up(L.pointerId);else{const k=U.current.move(L.pointerId,L.clientX,L.clientY);k&&B(H,k.at.x,k.at.y,k.scale)}},W=(L,H)=>{P.current=null;const k=t.find(mt=>mt.thing.id===e),at=k&&L.room?sf(L.room,k,i):void 0;TM(L.camera,L.controls.target,at?at.point:nf(T,i)),L.controls.minDistance=at&&at.frame>0?Math.min(Dn,at.frame):Dn,L.controls.dollyIn(H)},X=L=>{const H=d.current;if(!H||L.altKey||L.ctrlKey||L.metaKey)return;if(s==="eyes"){I(L.key)&&L.preventDefault();return}const k=Math.PI/18,mt={ArrowLeft:()=>H.controls.rotateLeft(-k),ArrowRight:()=>H.controls.rotateLeft(k),ArrowUp:()=>H.controls.rotateUp(k/2),ArrowDown:()=>H.controls.rotateUp(-k/2),"+":()=>W(H,zs),"=":()=>W(H,zs),"-":()=>W(H,1/zs),_:()=>W(H,1/zs),0:()=>{P.current=null,H.controls.minDistance=Dn,aa(H,ys(i)),H.controls.update()}}[L.key];mt&&(L.preventDefault(),mt(),H.render())};return _?ec("div",{ref:u,className:"room-layout-3d",role:"img","aria-label":n,tabIndex:0,"data-mode":s,onPointerDown:M,onPointerUp:E,onPointerMove:z,onPointerCancel:L=>{A.current=null,z(L)},onKeyDown:X}):ec("p",{role:"status",children:"This browser cannot draw 3D (it offers no WebGL). The Plan view and the lists below show the room."})};export{jM as default};
