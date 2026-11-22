var If=Object.defineProperty;var Nf=(n,t,e)=>t in n?If(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e;var pi=(n,t,e)=>Nf(n,typeof t!="symbol"?t+"":t,e);import{aT as Us,aU as kn,aV as $r,aW as Uf,aX as Of,aY as Ff,aZ as uc,a_ as zf,a$ as Bf,b0 as cu,b1 as hu,b2 as uu,b3 as Hf,b4 as fc,b5 as kf,b6 as rs,b7 as ks,b8 as Gf,b9 as Vf,ba as Wf,bb as Jr,bc as fu,bd as pa,be as du,bf as dc,bg as Xf,bh as Yf,bi as Sl,bj as pu,bk as qf,bl as Zf,bm as Kf,bn as $f,bo as Jf,bp as Qf,bq as jf,A as Rn,d as td,aL as pc,_ as ed,br as nd,bs as id,h as cr,bt as sd,bu as bo,bv as mc,bw as gc,u as _c,bx as rd}from"./index-Qrhv0Mxk.js";/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const yl="187",ls={ROTATE:0,DOLLY:1,PAN:2},os={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},od=0,xc=1,ad=2,Os=1,ld=2,Ps=3,Bi=0,un=1,Dn=2,Fi=0,Fs=1,vc=2,Mc=3,Sc=4,cd=5,ss=100,hd=101,ud=102,fd=103,dd=104,pd=200,md=201,gd=202,_d=203,mu=204,gu=205,xd=206,vd=207,Md=208,Sd=209,yd=210,Ed=211,bd=212,wd=213,Td=214,ma=0,ga=1,_a=2,Gs=3,xa=4,va=5,Ma=6,Sa=7,_u=0,Ad=1,Rd=2,ci=0,El=1,bl=2,wl=3,Tl=4,Al=5,go=6,Rl=7,xu=300,fs=301,Vs=302,wo=303,To=304,ya=1e3,oi=1001,Ea=1002,nn=1003,Cd=1004,hr=1005,gn=1006,Ao=1007,Si=1008,Sn=1009,vu=1010,Mu=1011,Ws=1012,Cl=1013,Zn=1014,Wn=1015,wn=1016,Pl=1017,Ll=1018,ds=1020,Su=35902,yu=35899,Eu=1021,bu=1022,Xn=1023,wi=1026,yi=1027,wu=1028,Dl=1029,Hi=1030,Il=1031,Nl=1033,kr=33776,Gr=33777,Vr=33778,Wr=33779,ba=35840,wa=35841,Ta=35842,Aa=35843,Ra=36196,Ca=37492,Pa=37496,La=37488,Da=37489,Qr=37490,Ia=37491,Na=37808,Ua=37809,Oa=37810,Fa=37811,za=37812,Ba=37813,Ha=37814,ka=37815,Ga=37816,Va=37817,Wa=37818,Xa=37819,Ya=37820,qa=37821,Za=36492,Ka=36494,$a=36495,Ja=36283,Qa=36284,jr=36285,ja=36286,Pd=3200,tl=0,Ld=1,Mi="",Mn="srgb",ps="srgb-linear",to="linear",Te="srgb",Ro=7680,Dd=519,Id=512,Nd=513,Ud=514,Tu=515,Od=516,Fd=517,Au=518,Ru=519,zd=35044,yc="300 es",Nn=2e3,Xs=2001;function Bd(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}function eo(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Hd(){const n=eo("canvas");return n.style.display="block",n}const Ec={};function bc(...n){const t="THREE."+n.shift();console.log(t,...n)}function Cu(n){const t=n[0];if(typeof t=="string"&&t.startsWith("TSL:")){const e=n[1];e&&e.isStackTrace?n[0]+=" "+e.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function te(...n){n=Cu(n);const t="THREE."+n.shift();{const e=n[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...n)}}function Se(...n){n=Cu(n);const t="THREE."+n.shift();{const e=n[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...n)}}function cs(...n){const t=n.join(" ");t in Ec||(Ec[t]=!0,te(...n))}function kd(n,t,e){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(t,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}const Gd={[ma]:ma,[_a]:Ma,[xa]:xa,[Gs]:va,[ga]:ga,[Ma]:_a,[Sa]:Sa,[va]:Gs};class Ai{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){const i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){const i=this._listeners;if(i===void 0)return;const s=i[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){const e=this._listeners;if(e===void 0)return;const i=e[t.type];if(i!==void 0){t.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const on=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Xr=Math.PI/180,no=180/Math.PI;function vs(){const n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(on[n&255]+on[n>>8&255]+on[n>>16&255]+on[n>>24&255]+"-"+on[t&255]+on[t>>8&255]+"-"+on[t>>16&15|64]+on[t>>24&255]+"-"+on[e&63|128]+on[e>>8&255]+"-"+on[e>>16&255]+on[e>>24&255]+on[i&255]+on[i>>8&255]+on[i>>16&255]+on[i>>24&255]).toLowerCase()}function pe(n,t,e){return Math.max(t,Math.min(e,n))}function Vd(n,t){return(n%t+t)%t}function Co(n,t,e){return(1-e)*n+e*t}function Wd(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Ul(n){switch(n.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Xd(n,t){if(t.constructor===Float32Array)return n;const e=Ul(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(n/e,-1)}function Yd(n,t){if(t.constructor===Float32Array)return n;const e=Ul(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(n*e)}const qd={DEG2RAD:Xr},oc=class oc{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(pe(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(pe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*i-o*s+t.x,this.y=r*s+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};oc.prototype.isVector2=!0;let ut=oc;class Ne{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,o,a){let c=i[s+0],l=i[s+1],h=i[s+2],d=i[s+3],f=r[o+0],u=r[o+1],p=r[o+2],_=r[o+3];if(d!==_||c!==f||l!==u||h!==p){let m=c*f+l*u+h*p+d*_;m<0&&(f=-f,u=-u,p=-p,_=-_,m=-m);let g=1-a;if(m<.9995){const x=Math.acos(m),S=Math.sin(x);g=Math.sin(g*x)/S,a=Math.sin(a*x)/S,c=c*g+f*a,l=l*g+u*a,h=h*g+p*a,d=d*g+_*a}else{c=c*g+f*a,l=l*g+u*a,h=h*g+p*a,d=d*g+_*a;const x=1/Math.sqrt(c*c+l*l+h*h+d*d);c*=x,l*=x,h*=x,d*=x}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,i,s,r,o){const a=i[s],c=i[s+1],l=i[s+2],h=i[s+3],d=r[o],f=r[o+1],u=r[o+2],p=r[o+3];return t[e]=a*p+h*d+c*u-l*f,t[e+1]=c*p+h*f+l*d-a*u,t[e+2]=l*p+h*u+a*f-c*d,t[e+3]=h*p-a*d-c*f-l*u,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const i=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(i/2),h=a(s/2),d=a(r/2),f=c(i/2),u=c(s/2),p=c(r/2);switch(o){case"XYZ":this._x=f*h*d+l*u*p,this._y=l*u*d-f*h*p,this._z=l*h*p+f*u*d,this._w=l*h*d-f*u*p;break;case"YXZ":this._x=f*h*d+l*u*p,this._y=l*u*d-f*h*p,this._z=l*h*p-f*u*d,this._w=l*h*d+f*u*p;break;case"ZXY":this._x=f*h*d-l*u*p,this._y=l*u*d+f*h*p,this._z=l*h*p+f*u*d,this._w=l*h*d-f*u*p;break;case"ZYX":this._x=f*h*d-l*u*p,this._y=l*u*d+f*h*p,this._z=l*h*p-f*u*d,this._w=l*h*d+f*u*p;break;case"YZX":this._x=f*h*d+l*u*p,this._y=l*u*d+f*h*p,this._z=l*h*p-f*u*d,this._w=l*h*d-f*u*p;break;case"XZY":this._x=f*h*d-l*u*p,this._y=l*u*d-f*h*p,this._z=l*h*p+f*u*d,this._w=l*h*d+f*u*p;break;default:te("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,i=e[0],s=e[4],r=e[8],o=e[1],a=e[5],c=e[9],l=e[2],h=e[6],d=e[10],f=i+a+d;if(f>0){const u=.5/Math.sqrt(f+1);this._w=.25/u,this._x=(h-c)*u,this._y=(r-l)*u,this._z=(o-s)*u}else if(i>a&&i>d){const u=2*Math.sqrt(1+i-a-d);this._w=(h-c)/u,this._x=.25*u,this._y=(s+o)/u,this._z=(r+l)/u}else if(a>d){const u=2*Math.sqrt(1+a-i-d);this._w=(r-l)/u,this._x=(s+o)/u,this._y=.25*u,this._z=(c+h)/u}else{const u=2*Math.sqrt(1+d-i-a);this._w=(o-s)/u,this._x=(r+l)/u,this._y=(c+h)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(pe(this.dot(t),-1,1)))}rotateTowards(t,e){const i=this.angleTo(t);if(i===0)return this;const s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const i=t._x,s=t._y,r=t._z,o=t._w,a=e._x,c=e._y,l=e._z,h=e._w;return this._x=i*h+o*a+s*l-r*c,this._y=s*h+o*c+r*a-i*l,this._z=r*h+o*l+i*c-s*a,this._w=o*h-i*a-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){let i=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(i=-i,s=-s,r=-r,o=-o,a=-a);let c=1-e;if(a<.9995){const l=Math.acos(a),h=Math.sin(l);c=Math.sin(c*l)/h,e=Math.sin(e*l)/h,this._x=this._x*c+i*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this._onChangeCallback()}else this._x=this._x*c+i*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const ac=class ac{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(wc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(wc.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,i=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,i=this.y,s=this.z,r=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*s-a*i),h=2*(a*e-r*s),d=2*(r*i-o*e);return this.x=e+c*l+o*d-a*h,this.y=i+c*h+a*l-r*d,this.z=s+c*d+r*h-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this.z=pe(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this.z=pe(this.z,t,e),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(pe(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const i=t.x,s=t.y,r=t.z,o=e.x,a=e.y,c=e.z;return this.x=s*c-r*a,this.y=r*o-i*c,this.z=i*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Po.copy(this).projectOnVector(t),this.sub(Po)}reflect(t){return this.sub(Po.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(pe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){const s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};ac.prototype.isVector3=!0;let b=ac;const Po=new b,wc=new Ne,lc=class lc{constructor(t,e,i,s,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,o,a,c,l)}set(t,e,i,s,r,o,a,c,l){const h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=c,h[6]=i,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,s=e.elements,r=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],h=i[4],d=i[7],f=i[2],u=i[5],p=i[8],_=s[0],m=s[3],g=s[6],x=s[1],S=s[4],v=s[7],A=s[2],T=s[5],M=s[8];return r[0]=o*_+a*x+c*A,r[3]=o*m+a*S+c*T,r[6]=o*g+a*v+c*M,r[1]=l*_+h*x+d*A,r[4]=l*m+h*S+d*T,r[7]=l*g+h*v+d*M,r[2]=f*_+u*x+p*A,r[5]=f*m+u*S+p*T,r[8]=f*g+u*v+p*M,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8];return e*o*h-e*a*l-i*r*h+i*a*c+s*r*l-s*o*c}invert(){const t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],d=h*o-a*l,f=a*c-h*r,u=l*r-o*c,p=e*d+i*f+s*u;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/p;return t[0]=d*_,t[1]=(s*l-h*i)*_,t[2]=(a*i-s*o)*_,t[3]=f*_,t[4]=(h*e-s*c)*_,t[5]=(s*r-a*e)*_,t[6]=u*_,t[7]=(i*c-l*e)*_,t[8]=(o*e-i*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,o,a){const c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*o+l*a)+o+t,-s*l,s*c,-s*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return cs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Lo.makeScale(t,e)),this}rotate(t){return cs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Lo.makeRotation(-t)),this}translate(t,e){return cs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Lo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};lc.prototype.isMatrix3=!0;let re=lc;const Lo=new re,Tc=new re().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ac=new re().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Zd(){const n={enabled:!0,workingColorSpace:ps,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Te&&(s.r=hi(s.r),s.g=hi(s.g),s.b=hi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Te&&(s.r=hs(s.r),s.g=hs(s.g),s.b=hs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Mi?to:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[ps]:{primaries:t,whitePoint:i,transfer:to,toXYZ:Tc,fromXYZ:Ac,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Mn},outputColorSpaceConfig:{drawingBufferColorSpace:Mn}},[Mn]:{primaries:t,whitePoint:i,transfer:Te,toXYZ:Tc,fromXYZ:Ac,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Mn}}}),n}const xe=Zd();function hi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function hs(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Wi;class Kd{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Wi===void 0&&(Wi=eo("canvas")),Wi.width=t.width,Wi.height=t.height;const s=Wi.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=Wi}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=eo("canvas");e.width=t.width,e.height=t.height;const i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);const s=i.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=hi(r[o]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(hi(e[i]/255)*255):e[i]=hi(e[i]);return{data:e,width:t.width,height:t.height}}else return te("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let $d=0;class Ol{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:$d++}),this.uuid=vs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width||0,e.height||0,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Do(s[o].image)):r.push(Do(s[o]))}else r=Do(s);i.url=r}return e||(t.images[this.uuid]=i),i}}function Do(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Kd.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(te("Texture: Unable to serialize Texture."),{})}let Jd=0;const Io=new b;class fn extends Ai{constructor(t=fn.DEFAULT_IMAGE,e=fn.DEFAULT_MAPPING,i=oi,s=oi,r=gn,o=Si,a=Xn,c=Sn,l=fn.DEFAULT_ANISOTROPY,h=Mi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Jd++}),this.uuid=vs(),this.name="",this.source=new Ol(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ut(0,0),this.repeat=new ut(1,1),this.center=new ut(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new re,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Io).x}get height(){return this.source.getSize(Io).y}get depth(){return this.source.getSize(Io).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const e in t){const i=t[e];if(i===void 0){te(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){te(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[e]=i}}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==xu)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ya:t.x=t.x-Math.floor(t.x);break;case oi:t.x=t.x<0?0:1;break;case Ea:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ya:t.y=t.y-Math.floor(t.y);break;case oi:t.y=t.y<0?0:1;break;case Ea:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}fn.DEFAULT_IMAGE=null;fn.DEFAULT_MAPPING=xu;fn.DEFAULT_ANISOTROPY=1;const cc=class cc{constructor(t=0,e=0,i=0,s=1){this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,i=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*i+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,r;const c=t.elements,l=c[0],h=c[4],d=c[8],f=c[1],u=c[5],p=c[9],_=c[2],m=c[6],g=c[10];if(Math.abs(h-f)<.01&&Math.abs(d-_)<.01&&Math.abs(p-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(d+_)<.1&&Math.abs(p+m)<.1&&Math.abs(l+u+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const S=(l+1)/2,v=(u+1)/2,A=(g+1)/2,T=(h+f)/4,M=(d+_)/4,E=(p+m)/4;return S>v&&S>A?S<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(S),s=T/i,r=M/i):v>A?v<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),i=T/s,r=E/s):A<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),i=M/r,s=E/r),this.set(i,s,r,e),this}let x=Math.sqrt((m-p)*(m-p)+(d-_)*(d-_)+(f-h)*(f-h));return Math.abs(x)<.001&&(x=1),this.x=(m-p)/x,this.y=(d-_)/x,this.z=(f-h)/x,this.w=Math.acos((l+u+g-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this.z=pe(this.z,t.z,e.z),this.w=pe(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this.z=pe(this.z,t,e),this.w=pe(this.w,t,e),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(pe(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};cc.prototype.isVector4=!0;let ze=cc;class Qd extends Ai{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:gn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new ze(0,0,t,e),this.scissorTest=!1,this.viewport=new ze(0,0,t,e),this.textures=[];const s=i.count;for(let r=0;r<s;r++)this.textures[r]=new fn({width:t,height:e,depth:i.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){const e={minFilter:gn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.mipmapsAutoUpdate!==void 0&&(e.mipmapsAutoUpdate=t.mipmapsAutoUpdate),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;const s=Object.assign({},t.textures[e].image);this.textures[e].source=new Ol(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){const e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class bn extends Qd{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}}class Pu extends fn{constructor(t=null,e=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=nn,this.minFilter=nn,this.wrapR=oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class jd extends fn{constructor(t=null,e=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=nn,this.minFilter=nn,this.wrapR=oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}const mo=class mo{constructor(t,e,i,s,r,o,a,c,l,h,d,f,u,p,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,o,a,c,l,h,d,f,u,p,_,m)}set(t,e,i,s,r,o,a,c,l,h,d,f,u,p,_,m){const g=this.elements;return g[0]=t,g[4]=e,g[8]=i,g[12]=s,g[1]=r,g[5]=o,g[9]=a,g[13]=c,g[2]=l,g[6]=h,g[10]=d,g[14]=f,g[3]=u,g[7]=p,g[11]=_,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new mo().fromArray(this.elements)}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){const e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const e=this.elements,i=t.elements,s=1/Xi.setFromMatrixColumn(t,0).length(),r=1/Xi.setFromMatrixColumn(t,1).length(),o=1/Xi.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,i=t.x,s=t.y,r=t.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){const f=o*h,u=o*d,p=a*h,_=a*d;e[0]=c*h,e[4]=-c*d,e[8]=l,e[1]=u+p*l,e[5]=f-_*l,e[9]=-a*c,e[2]=_-f*l,e[6]=p+u*l,e[10]=o*c}else if(t.order==="YXZ"){const f=c*h,u=c*d,p=l*h,_=l*d;e[0]=f+_*a,e[4]=p*a-u,e[8]=o*l,e[1]=o*d,e[5]=o*h,e[9]=-a,e[2]=u*a-p,e[6]=_+f*a,e[10]=o*c}else if(t.order==="ZXY"){const f=c*h,u=c*d,p=l*h,_=l*d;e[0]=f-_*a,e[4]=-o*d,e[8]=p+u*a,e[1]=u+p*a,e[5]=o*h,e[9]=_-f*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){const f=o*h,u=o*d,p=a*h,_=a*d;e[0]=c*h,e[4]=p*l-u,e[8]=f*l+_,e[1]=c*d,e[5]=_*l+f,e[9]=u*l-p,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){const f=o*c,u=o*l,p=a*c,_=a*l;e[0]=c*h,e[4]=_-f*d,e[8]=p*d+u,e[1]=d,e[5]=o*h,e[9]=-a*h,e[2]=-l*h,e[6]=u*d+p,e[10]=f-_*d}else if(t.order==="XZY"){const f=o*c,u=o*l,p=a*c,_=a*l;e[0]=c*h,e[4]=-d,e[8]=l*h,e[1]=f*d+_,e[5]=o*h,e[9]=u*d-p,e[2]=p*d-u,e[6]=a*h,e[10]=_*d+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(t0,t,e0)}lookAt(t,e,i){const s=this.elements;return xn.subVectors(t,e),xn.lengthSq()===0&&(xn.z=1),xn.normalize(),mi.crossVectors(i,xn),mi.lengthSq()===0&&(Math.abs(i.z)===1?xn.x+=1e-4:xn.z+=1e-4,xn.normalize(),mi.crossVectors(i,xn)),mi.normalize(),ur.crossVectors(xn,mi),s[0]=mi.x,s[4]=ur.x,s[8]=xn.x,s[1]=mi.y,s[5]=ur.y,s[9]=xn.y,s[2]=mi.z,s[6]=ur.z,s[10]=xn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,s=e.elements,r=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],h=i[1],d=i[5],f=i[9],u=i[13],p=i[2],_=i[6],m=i[10],g=i[14],x=i[3],S=i[7],v=i[11],A=i[15],T=s[0],M=s[4],E=s[8],D=s[12],C=s[1],I=s[5],F=s[9],G=s[13],U=s[2],N=s[6],H=s[10],k=s[14],it=s[3],P=s[7],B=s[11],V=s[15];return r[0]=o*T+a*C+c*U+l*it,r[4]=o*M+a*I+c*N+l*P,r[8]=o*E+a*F+c*H+l*B,r[12]=o*D+a*G+c*k+l*V,r[1]=h*T+d*C+f*U+u*it,r[5]=h*M+d*I+f*N+u*P,r[9]=h*E+d*F+f*H+u*B,r[13]=h*D+d*G+f*k+u*V,r[2]=p*T+_*C+m*U+g*it,r[6]=p*M+_*I+m*N+g*P,r[10]=p*E+_*F+m*H+g*B,r[14]=p*D+_*G+m*k+g*V,r[3]=x*T+S*C+v*U+A*it,r[7]=x*M+S*I+v*N+A*P,r[11]=x*E+S*F+v*H+A*B,r[15]=x*D+S*G+v*k+A*V,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],o=t[1],a=t[5],c=t[9],l=t[13],h=t[2],d=t[6],f=t[10],u=t[14],p=t[3],_=t[7],m=t[11],g=t[15],x=c*u-l*f,S=a*u-l*d,v=a*f-c*d,A=o*u-l*h,T=o*f-c*h,M=o*d-a*h;return e*(_*x-m*S+g*v)-i*(p*x-m*A+g*T)+s*(p*S-_*A+g*M)-r*(p*v-_*T+m*M)}determinantAffine(){const t=this.elements,e=t[0],i=t[4],s=t[8],r=t[1],o=t[5],a=t[9],c=t[2],l=t[6],h=t[10];return e*(o*h-a*l)-i*(r*h-a*c)+s*(r*l-o*c)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){const t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],d=t[9],f=t[10],u=t[11],p=t[12],_=t[13],m=t[14],g=t[15],x=e*a-i*o,S=e*c-s*o,v=e*l-r*o,A=i*c-s*a,T=i*l-r*a,M=s*l-r*c,E=h*_-d*p,D=h*m-f*p,C=h*g-u*p,I=d*m-f*_,F=d*g-u*_,G=f*g-u*m,U=x*G-S*F+v*I+A*C-T*D+M*E;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const N=1/U;return t[0]=(a*G-c*F+l*I)*N,t[1]=(s*F-i*G-r*I)*N,t[2]=(_*M-m*T+g*A)*N,t[3]=(f*T-d*M-u*A)*N,t[4]=(c*C-o*G-l*D)*N,t[5]=(e*G-s*C+r*D)*N,t[6]=(m*v-p*M-g*S)*N,t[7]=(h*M-f*v+u*S)*N,t[8]=(o*F-a*C+l*E)*N,t[9]=(i*C-e*F-r*E)*N,t[10]=(p*T-_*v+g*x)*N,t[11]=(d*v-h*T-u*x)*N,t[12]=(a*D-o*I-c*E)*N,t[13]=(e*I-i*D+s*E)*N,t[14]=(_*S-p*A-m*x)*N,t[15]=(h*A-d*S+f*x)*N,this}scale(t){const e=this.elements,i=t.x,s=t.y,r=t.z;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const i=Math.cos(e),s=Math.sin(e),r=1-i,o=t.x,a=t.y,c=t.z,l=r*o,h=r*a;return this.set(l*o+i,l*a-s*c,l*c+s*a,0,l*a+s*c,h*a+i,h*c-s*o,0,l*c-s*a,h*c+s*o,r*c*c+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,o){return this.set(1,i,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){const s=this.elements,r=e._x,o=e._y,a=e._z,c=e._w,l=r+r,h=o+o,d=a+a,f=r*l,u=r*h,p=r*d,_=o*h,m=o*d,g=a*d,x=c*l,S=c*h,v=c*d,A=i.x,T=i.y,M=i.z;return s[0]=(1-(_+g))*A,s[1]=(u+v)*A,s[2]=(p-S)*A,s[3]=0,s[4]=(u-v)*T,s[5]=(1-(f+g))*T,s[6]=(m+x)*T,s[7]=0,s[8]=(p+S)*M,s[9]=(m-x)*M,s[10]=(1-(f+_))*M,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){const s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];const r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let o=Xi.set(s[0],s[1],s[2]).length();const a=Xi.set(s[4],s[5],s[6]).length(),c=Xi.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Cn.copy(this);const l=1/o,h=1/a,d=1/c;return Cn.elements[0]*=l,Cn.elements[1]*=l,Cn.elements[2]*=l,Cn.elements[4]*=h,Cn.elements[5]*=h,Cn.elements[6]*=h,Cn.elements[8]*=d,Cn.elements[9]*=d,Cn.elements[10]*=d,e.setFromRotationMatrix(Cn),i.x=o,i.y=a,i.z=c,this}makePerspective(t,e,i,s,r,o,a=Nn,c=!1){const l=this.elements,h=2*r/(e-t),d=2*r/(i-s),f=(e+t)/(e-t),u=(i+s)/(i-s);let p,_;if(c)p=r/(o-r),_=o*r/(o-r);else if(a===Nn)p=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Xs)p=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=d,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,i,s,r,o,a=Nn,c=!1){const l=this.elements,h=2/(e-t),d=2/(i-s),f=-(e+t)/(e-t),u=-(i+s)/(i-s);let p,_;if(c)p=1/(o-r),_=o/(o-r);else if(a===Nn)p=-2/(o-r),_=-(o+r)/(o-r);else if(a===Xs)p=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=d,l[9]=0,l[13]=u,l[2]=0,l[6]=0,l[10]=p,l[14]=_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};mo.prototype.isMatrix4=!0;let Kt=mo;const Xi=new b,Cn=new Kt,t0=new b(0,0,0),e0=new b(1,1,1),mi=new b,ur=new b,xn=new b,Rc=new Kt,Cc=new Ne;class Ve{constructor(t=0,e=0,i=0,s=Ve.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],h=s[9],d=s[2],f=s[6],u=s[10];switch(e){case"XYZ":this._y=Math.asin(pe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,u),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-pe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,u),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(pe(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-d,u),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-pe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(f,u),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(pe(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,u));break;case"XZY":this._z=Math.asin(-pe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,u),this._y=0);break;default:te("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Rc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Rc,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Cc.setFromEuler(this),this.setFromQuaternion(Cc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ve.DEFAULT_ORDER="XYZ";class Fl{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let n0=0;const Pc=new b,Yi=new Ne,ei=new Kt,fr=new b,ys=new b,i0=new b,s0=new Ne,Lc=new b(1,0,0),Dc=new b(0,1,0),Ic=new b(0,0,1),Nc={type:"added"},r0={type:"removed"},qi={type:"childadded",child:null},No={type:"childremoved",child:null};class He extends Ai{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:n0++}),this.uuid=vs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=He.DEFAULT_UP.clone();const t=new b,e=new Ve,i=new Ne,s=new b(1,1,1);function r(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Kt},normalMatrix:{value:new re}}),this.matrix=new Kt,this.matrixWorld=new Kt,this.matrixAutoUpdate=He.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=He.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Fl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Yi.setFromAxisAngle(t,e),this.quaternion.multiply(Yi),this}rotateOnWorldAxis(t,e){return Yi.setFromAxisAngle(t,e),this.quaternion.premultiply(Yi),this}rotateX(t){return this.rotateOnAxis(Lc,t)}rotateY(t){return this.rotateOnAxis(Dc,t)}rotateZ(t){return this.rotateOnAxis(Ic,t)}translateOnAxis(t,e){return Pc.copy(t).applyQuaternion(this.quaternion),this.position.add(Pc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Lc,t)}translateY(t){return this.translateOnAxis(Dc,t)}translateZ(t){return this.translateOnAxis(Ic,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ei.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?fr.copy(t):fr.set(t,e,i);const s=this.parent;this.updateWorldMatrix(!0,!1),ys.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ei.lookAt(ys,fr,this.up):ei.lookAt(fr,ys,this.up),this.quaternion.setFromRotationMatrix(ei),s&&(ei.extractRotation(s.matrixWorld),Yi.setFromRotationMatrix(ei),this.quaternion.premultiply(Yi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Se("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Nc),qi.child=t,this.dispatchEvent(qi),qi.child=null):Se("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(r0),No.child=t,this.dispatchEvent(No),No.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ei.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ei.multiply(t.parent.matrixWorld)),t.applyMatrix4(ei),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Nc),qi.child=t,this.dispatchEvent(qi),qi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,t,i0),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,s0,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);const e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const e=t.x,i=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*s,r[13]+=i-r[1]*e-r[5]*i-r[9]*s,r[14]+=s-r[2]*e-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){const s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,i)}}toJSON(t){const e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const d=c[l];r(t.shapes,d)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(t.materials,this.material[c]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];s.animations.push(r(t.animations,c))}}if(e){const a=o(t.geometries),c=o(t.materials),l=o(t.textures),h=o(t.images),d=o(t.shapes),f=o(t.skeletons),u=o(t.animations),p=o(t.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),f.length>0&&(i.skeletons=f),u.length>0&&(i.animations=u),p.length>0&&(i.nodes=p)}return i.object=s,i;function o(a){const c=[];for(const l in a){const h=a[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){const s=t.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}He.DEFAULT_UP=new b(0,1,0);He.DEFAULT_MATRIX_AUTO_UPDATE=!0;He.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Un extends He{constructor(){super(),this.isGroup=!0,this.type="Group"}}const o0={type:"move"};class Uo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Un,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Un,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new b,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new b),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Un,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new b,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new b,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let s=null,r=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,i),g=this._getHandJoint(l,_);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}const h=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],f=h.position.distanceTo(d.position),u=.02,p=.005;l.inputState.pinching&&f>u+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&f<=u-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.quaternion,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(s=e.getPose(t.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(o0)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const i=new Un;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}}const Lu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},gi={h:0,s:0,l:0},dr={h:0,s:0,l:0};function Oo(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}class ee{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Mn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,xe.colorSpaceToWorking(this,e),this}setRGB(t,e,i,s=xe.workingColorSpace){return this.r=t,this.g=e,this.b=i,xe.colorSpaceToWorking(this,s),this}setHSL(t,e,i,s=xe.workingColorSpace){if(t=Vd(t,1),e=pe(e,0,1),i=pe(i,0,1),e===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+e):i+e-i*e,o=2*i-r;this.r=Oo(o,r,t+1/3),this.g=Oo(o,r,t),this.b=Oo(o,r,t-1/3)}return xe.colorSpaceToWorking(this,s),this}setStyle(t,e=Mn){function i(r){r!==void 0&&parseFloat(r)<1&&te("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:te("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);te("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Mn){const i=Lu[t.toLowerCase()];return i!==void 0?this.setHex(i,e):te("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=hi(t.r),this.g=hi(t.g),this.b=hi(t.b),this}copyLinearToSRGB(t){return this.r=hs(t.r),this.g=hs(t.g),this.b=hs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Mn){return xe.workingToColorSpace(an.copy(this),t),Math.round(pe(an.r*255,0,255))*65536+Math.round(pe(an.g*255,0,255))*256+Math.round(pe(an.b*255,0,255))}getHexString(t=Mn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=xe.workingColorSpace){xe.workingToColorSpace(an.copy(this),e);const i=an.r,s=an.g,r=an.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let c,l;const h=(a+o)/2;if(a===o)c=0,l=0;else{const d=o-a;switch(l=h<=.5?d/(o+a):d/(2-o-a),o){case i:c=(s-r)/d+(s<r?6:0);break;case s:c=(r-i)/d+2;break;case r:c=(i-s)/d+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=xe.workingColorSpace){return xe.workingToColorSpace(an.copy(this),e),t.r=an.r,t.g=an.g,t.b=an.b,t}getStyle(t=Mn){xe.workingToColorSpace(an.copy(this),t);const e=an.r,i=an.g,s=an.b;return t!==Mn?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL(gi),this.setHSL(gi.h+t,gi.s+e,gi.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(gi),t.getHSL(dr);const i=Co(gi.h,dr.h,e),s=Co(gi.s,dr.s,e),r=Co(gi.l,dr.l,e);return this.setHSL(i,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,i=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*s,this.g=r[1]*e+r[4]*i+r[7]*s,this.b=r[2]*e+r[5]*i+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const an=new ee;ee.NAMES=Lu;class a0 extends He{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ve,this.environmentIntensity=1,this.environmentRotation=new Ve,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}}const Pn=new b,ni=new b,Fo=new b,ii=new b,Zi=new b,Ki=new b,Uc=new b,zo=new b,Bo=new b,Ho=new b,ko=new ze,Go=new ze,Vo=new ze;class En{constructor(t=new b,e=new b,i=new b){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),Pn.subVectors(t,e),s.cross(Pn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,i,s,r){Pn.subVectors(s,e),ni.subVectors(i,e),Fo.subVectors(t,e);const o=Pn.dot(Pn),a=Pn.dot(ni),c=Pn.dot(Fo),l=ni.dot(ni),h=ni.dot(Fo),d=o*l-a*a;if(d===0)return r.set(0,0,0),null;const f=1/d,u=(l*c-a*h)*f,p=(o*h-a*c)*f;return r.set(1-u-p,p,u)}static containsPoint(t,e,i,s){return this.getBarycoord(t,e,i,s,ii)===null?!1:ii.x>=0&&ii.y>=0&&ii.x+ii.y<=1}static getInterpolation(t,e,i,s,r,o,a,c){return this.getBarycoord(t,e,i,s,ii)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,ii.x),c.addScaledVector(o,ii.y),c.addScaledVector(a,ii.z),c)}static getInterpolatedAttribute(t,e,i,s,r,o){return ko.setScalar(0),Go.setScalar(0),Vo.setScalar(0),ko.fromBufferAttribute(t,e),Go.fromBufferAttribute(t,i),Vo.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(ko,r.x),o.addScaledVector(Go,r.y),o.addScaledVector(Vo,r.z),o}static isFrontFacing(t,e,i,s){return Pn.subVectors(i,e),ni.subVectors(t,e),Pn.cross(ni).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Pn.subVectors(this.c,this.b),ni.subVectors(this.a,this.b),Pn.cross(ni).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return En.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return En.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,r){return En.getInterpolation(t,this.a,this.b,this.c,e,i,s,r)}containsPoint(t){return En.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return En.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const i=this.a,s=this.b,r=this.c;let o,a;Zi.subVectors(s,i),Ki.subVectors(r,i),zo.subVectors(t,i);const c=Zi.dot(zo),l=Ki.dot(zo);if(c<=0&&l<=0)return e.copy(i);Bo.subVectors(t,s);const h=Zi.dot(Bo),d=Ki.dot(Bo);if(h>=0&&d<=h)return e.copy(s);const f=c*d-h*l;if(f<=0&&c>=0&&h<=0&&c-h>0)return o=c/(c-h),e.copy(i).addScaledVector(Zi,o);Ho.subVectors(t,r);const u=Zi.dot(Ho),p=Ki.dot(Ho);if(p>=0&&u<=p)return e.copy(r);const _=u*l-c*p;if(_<=0&&l>=0&&p<=0)return a=l/(l-p),e.copy(i).addScaledVector(Ki,a);const m=h*p-u*d;if(m<=0&&d-h>=0&&u-p>=0)return Uc.subVectors(r,s),a=(d-h)/(d-h+(u-p)),e.copy(s).addScaledVector(Uc,a);const g=1/(m+_+f);return o=_*g,a=f*g,e.copy(i).addScaledVector(Zi,o).addScaledVector(Ki,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class _n{constructor(t=new b(1/0,1/0,1/0),e=new b(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Ln.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Ln.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const i=Ln.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const i=t.geometry;if(i!==void 0){const r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Ln):Ln.fromBufferAttribute(r,o),Ln.applyMatrix4(t.matrixWorld),this.expandByPoint(Ln);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),pr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),pr.copy(i.boundingBox)),pr.applyMatrix4(t.matrixWorld),this.union(pr)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Ln),Ln.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Es),mr.subVectors(this.max,Es),$i.subVectors(t.a,Es),Ji.subVectors(t.b,Es),Qi.subVectors(t.c,Es),_i.subVectors(Ji,$i),xi.subVectors(Qi,Ji),Pi.subVectors($i,Qi);let e=[0,-_i.z,_i.y,0,-xi.z,xi.y,0,-Pi.z,Pi.y,_i.z,0,-_i.x,xi.z,0,-xi.x,Pi.z,0,-Pi.x,-_i.y,_i.x,0,-xi.y,xi.x,0,-Pi.y,Pi.x,0];return!Wo(e,$i,Ji,Qi,mr)||(e=[1,0,0,0,1,0,0,0,1],!Wo(e,$i,Ji,Qi,mr))?!1:(gr.crossVectors(_i,xi),e=[gr.x,gr.y,gr.z],Wo(e,$i,Ji,Qi,mr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Ln).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Ln).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(si),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const si=[new b,new b,new b,new b,new b,new b,new b,new b],Ln=new b,pr=new _n,$i=new b,Ji=new b,Qi=new b,_i=new b,xi=new b,Pi=new b,Es=new b,mr=new b,gr=new b,Li=new b;function Wo(n,t,e,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){Li.fromArray(n,r);const a=s.x*Math.abs(Li.x)+s.y*Math.abs(Li.y)+s.z*Math.abs(Li.z),c=t.dot(Li),l=e.dot(Li),h=i.dot(Li);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}const Ge=new b,_r=new ut;let l0=0;class Fn extends Ai{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:l0++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=zd,this.updateRanges=[],this.gpuType=Wn,this.version=0,this._normalizationScale=t!==void 0?Ul(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)_r.fromBufferAttribute(this,e),_r.applyMatrix3(t),this.setXY(e,_r.x,_r.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Ge.fromBufferAttribute(this,e),Ge.applyMatrix3(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Ge.fromBufferAttribute(this,e),Ge.applyMatrix4(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Ge.fromBufferAttribute(this,e),Ge.applyNormalMatrix(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Ge.fromBufferAttribute(this,e),Ge.transformDirection(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=this._denormalize(i)),i}setComponent(t,e,i){return this.normalized&&(i=this._normalize(i)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=this._denormalize(e)),e}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=this._denormalize(e)),e}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=this._denormalize(e)),e}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=this._denormalize(e)),e}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),i=this._normalize(i)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),i=this._normalize(i),s=this._normalize(s)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),i=this._normalize(i),s=this._normalize(s),r=this._normalize(r)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){const e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Xd(t,this.array)}_normalize(t){const e=this._normalizationScale;return e!==void 0?Math.round(t*e):Yd(t,this.array)}}class Du extends Fn{constructor(t,e,i){super(new Uint16Array(t),e,i)}}class Iu extends Fn{constructor(t,e,i){super(new Uint32Array(t),e,i)}}class ae extends Fn{constructor(t,e,i){super(new Float32Array(t),e,i)}}const c0=new _n,bs=new b,Xo=new b;class Qs{constructor(t=new b,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const i=this.center;e!==void 0?i.copy(e):c0.setFromPoints(t).getCenter(i);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;bs.subVectors(t,this.center);const e=bs.lengthSq();if(e>this.radius*this.radius){const i=Math.sqrt(e),s=(i-this.radius)*.5;this.center.addScaledVector(bs,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Xo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(bs.copy(t.center).add(Xo)),this.expandByPoint(bs.copy(t.center).sub(Xo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}let h0=0;const yn=new Kt,Yo=new He,ji=new b,vn=new _n,ws=new _n,Je=new b;class Ce extends Ai{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:h0++}),this.uuid=vs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Bd(t)?Iu:Du)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new re().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return yn.makeRotationFromQuaternion(t),this.applyMatrix4(yn),this}rotateX(t){return yn.makeRotationX(t),this.applyMatrix4(yn),this}rotateY(t){return yn.makeRotationY(t),this.applyMatrix4(yn),this}rotateZ(t){return yn.makeRotationZ(t),this.applyMatrix4(yn),this}translate(t,e,i){return yn.makeTranslation(t,e,i),this.applyMatrix4(yn),this}scale(t,e,i){return yn.makeScale(t,e,i),this.applyMatrix4(yn),this}lookAt(t){return Yo.lookAt(t),Yo.updateMatrix(),this.applyMatrix4(Yo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ji).negate(),this.translate(ji.x,ji.y,ji.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const i=[];for(let s=0,r=t.length;s<r;s++){const o=t[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ae(i,3))}else{const i=Math.min(t.length,e.count);for(let s=0;s<i;s++){const r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&te("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new _n);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Se("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new b(-1/0,-1/0,-1/0),new b(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){const r=e[i];vn.setFromBufferAttribute(r),this.morphTargetsRelative?(Je.addVectors(this.boundingBox.min,vn.min),this.boundingBox.expandByPoint(Je),Je.addVectors(this.boundingBox.max,vn.max),this.boundingBox.expandByPoint(Je)):(this.boundingBox.expandByPoint(vn.min),this.boundingBox.expandByPoint(vn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Se('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Qs);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Se("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new b,1/0);return}if(t){const i=this.boundingSphere.center;if(vn.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];ws.setFromBufferAttribute(a),this.morphTargetsRelative?(Je.addVectors(vn.min,ws.min),vn.expandByPoint(Je),Je.addVectors(vn.max,ws.max),vn.expandByPoint(Je)):(vn.expandByPoint(ws.min),vn.expandByPoint(ws.max))}vn.getCenter(i);let s=0;for(let r=0,o=t.count;r<o;r++)Je.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(Je));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Je.fromBufferAttribute(a,l),c&&(ji.fromBufferAttribute(t,l),Je.add(ji)),s=Math.max(s,i.distanceToSquared(Je))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Se('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Se("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.position,s=e.normal,r=e.uv;let o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new Fn(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));const a=[],c=[],l=new Uint8Array(i.count);for(let D=0;D<i.count;D++)a[D]=new b,c[D]=new b;const h=new b,d=new b,f=new b,u=new ut,p=new ut,_=new ut,m=new b,g=new b;function x(D,C,I){l[D]=l[C]=l[I]=1,h.fromBufferAttribute(i,D),d.fromBufferAttribute(i,C),f.fromBufferAttribute(i,I),u.fromBufferAttribute(r,D),p.fromBufferAttribute(r,C),_.fromBufferAttribute(r,I),d.sub(h),f.sub(h),p.sub(u),_.sub(u);const F=1/(p.x*_.y-_.x*p.y);isFinite(F)&&(m.copy(d).multiplyScalar(_.y).addScaledVector(f,-p.y).multiplyScalar(F),g.copy(f).multiplyScalar(p.x).addScaledVector(d,-_.x).multiplyScalar(F),a[D].add(m),a[C].add(m),a[I].add(m),c[D].add(g),c[C].add(g),c[I].add(g))}let S=this.groups;S.length===0&&(S=[{start:0,count:t.count}]);for(let D=0,C=S.length;D<C;++D){const I=S[D],F=I.start,G=I.count;for(let U=F,N=F+G;U<N;U+=3)x(t.getX(U+0),t.getX(U+1),t.getX(U+2))}const v=new b,A=new b,T=new b,M=new b;function E(D){T.fromBufferAttribute(s,D),M.copy(T);const C=a[D];v.copy(C),v.sub(T.multiplyScalar(T.dot(C))).normalize(),A.crossVectors(M,C);const F=A.dot(c[D])<0?-1:1;o.setXYZW(D,v.x,v.y,v.z,F)}for(let D=0,C=i.count;D<C;++D)l[D]&&E(D);this._transformed=!0}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new Fn(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let f=0,u=i.count;f<u;f++)i.setXYZ(f,0,0,0);const s=new b,r=new b,o=new b,a=new b,c=new b,l=new b,h=new b,d=new b;if(t)for(let f=0,u=t.count;f<u;f+=3){const p=t.getX(f+0),_=t.getX(f+1),m=t.getX(f+2);s.fromBufferAttribute(e,p),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),a.fromBufferAttribute(i,p),c.fromBufferAttribute(i,_),l.fromBufferAttribute(i,m),a.add(h),c.add(h),l.add(h),i.setXYZ(p,a.x,a.y,a.z),i.setXYZ(_,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,u=e.count;f<u;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),o.fromBufferAttribute(e,f+2),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),i.setXYZ(f+0,h.x,h.y,h.z),i.setXYZ(f+1,h.x,h.y,h.z),i.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Je.fromBufferAttribute(t,e),Je.normalize(),t.setXYZ(e,Je.x,Je.y,Je.z)}toNonIndexed(){function t(a,c){const l=a.array,h=a.itemSize,d=a.normalized,f=new l.constructor(c.length*h);let u=0,p=0;for(let _=0,m=c.length;_<m;_++){a.isInterleavedBufferAttribute?u=c[_]*a.data.stride+a.offset:u=c[_]*h;for(let g=0;g<h;g++)f[p++]=l[u++]}return new Fn(f,h,d)}if(this.index===null)return te("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Ce,i=this.index.array,s=this.attributes;for(const a in s){const c=s[a],l=t(c,i);e.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const c=[],l=r[a];for(let h=0,d=l.length;h<d;h++){const f=l[h],u=t(f,i);c.push(u)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const i=this.attributes;for(const c in i){const l=i[c];t.data.attributes[c]=l.toJSON(t.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let d=0,f=l.length;d<f;d++){const u=l[d];h.push(u.toJSON(t.data))}h.length>0&&(s[c]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const i=t.index;i!==null&&this.setIndex(i.clone());const s=t.attributes;for(const l in s){const h=s[l];this.setAttribute(l,h.clone(e))}const r=t.morphAttributes;for(const l in r){const h=[],d=r[l];for(let f=0,u=d.length;f<u;f++)h.push(d[f].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let l=0,h=o.length;l<h;l++){const d=o[l];this.addGroup(d.start,d.count,d.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const qo=new b,u0=new b,f0=new re;class Gn{constructor(t=new b(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){const s=qo.subVectors(i,e).cross(u0.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){const s=t.delta(qo),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const o=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(s,o)}intersectsLine(t){const e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const i=e||f0.getNormalMatrix(t),s=this.coplanarPoint(qo).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}let d0=0;class Ms extends Ai{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:d0++}),this.uuid=vs(),this.name="",this.type="Material",this.blending=Fs,this.side=Bi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=mu,this.blendDst=gu,this.blendEquation=ss,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ee(0,0,0),this.blendAlpha=0,this.depthFunc=Gs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Dd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ro,this.stencilZFail=Ro,this.stencilZPass=Ro,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const i=t[e];if(i===void 0){te(`Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){te(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[e]=i}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(i.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(i.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(i.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(i.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new ee().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.diffuseRoughness!==void 0&&(this.diffuseRoughness=t.diffuseRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum),t.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1]),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new Gn().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new ut().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ut().fromArray(t.clearcoatNormalScale)),t.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let i=null;if(e!==null){const s=e.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}const ri=new b,Zo=new b,xr=new b,vr=new b;class js{constructor(t=new b,e=new b(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ri)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=ri.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ri.copy(this.origin).addScaledVector(this.direction,e),ri.distanceToSquared(t))}distanceSqToSegment(t,e,i,s){Zo.copy(t).add(e).multiplyScalar(.5),xr.copy(e).sub(t).normalize(),vr.copy(this.origin).sub(Zo);const r=t.distanceTo(e)*.5,o=-this.direction.dot(xr),a=vr.dot(this.direction),c=-vr.dot(xr),l=vr.lengthSq(),h=Math.abs(1-o*o);let d,f,u,p;if(h>0)if(d=o*c-a,f=o*a-c,p=r*h,d>=0)if(f>=-p)if(f<=p){const _=1/h;d*=_,f*=_,u=d*(d+o*f+2*a)+f*(o*d+f+2*c)+l}else f=r,d=Math.max(0,-(o*f+a)),u=-d*d+f*(f+2*c)+l;else f=-r,d=Math.max(0,-(o*f+a)),u=-d*d+f*(f+2*c)+l;else f<=-p?(d=Math.max(0,-(-o*r+a)),f=d>0?-r:Math.min(Math.max(-r,-c),r),u=-d*d+f*(f+2*c)+l):f<=p?(d=0,f=Math.min(Math.max(-r,-c),r),u=f*(f+2*c)+l):(d=Math.max(0,-(o*r+a)),f=d>0?r:Math.min(Math.max(-r,-c),r),u=-d*d+f*(f+2*c)+l);else f=o>0?-r:r,d=Math.max(0,-(o*f+a)),u=-d*d+f*(f+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Zo).addScaledVector(xr,f),u}intersectSphere(t,e){if(t.radius<0)return null;ri.subVectors(t.center,this.origin);const i=ri.dot(this.direction),s=ri.dot(ri)-i*i,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){const i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,s,r,o,a,c;const l=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,f=this.origin;return l>=0?(i=(t.min.x-f.x)*l,s=(t.max.x-f.x)*l):(i=(t.max.x-f.x)*l,s=(t.min.x-f.x)*l),h>=0?(r=(t.min.y-f.y)*h,o=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,o=(t.min.y-f.y)*h),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(t.min.z-f.z)*d,c=(t.max.z-f.z)*d):(a=(t.max.z-f.z)*d,c=(t.min.z-f.z)*d),i>c||a>s)||((a>i||i!==i)&&(i=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,ri)!==null}intersectTriangle(t,e,i,s,r){const o=this.origin,a=this.direction,c=a.x,l=a.y,h=a.z,d=t.x-o.x,f=t.y-o.y,u=t.z-o.z,p=e.x-o.x,_=e.y-o.y,m=e.z-o.z,g=i.x-o.x,x=i.y-o.y,S=i.z-o.z,v=Math.abs(c),A=Math.abs(l),T=Math.abs(h);let M,E,D,C,I,F,G,U,N,H,k,it;if(v>=A&&v>=T?(D=c,F=d,N=p,it=g,c>=0?(M=l,E=h,C=f,I=u,G=_,U=m,H=x,k=S):(M=h,E=l,C=u,I=f,G=m,U=_,H=S,k=x)):A>=T?(D=l,F=f,N=_,it=x,l>=0?(M=h,E=c,C=u,I=d,G=m,U=p,H=S,k=g):(M=c,E=h,C=d,I=u,G=p,U=m,H=g,k=S)):(D=h,F=u,N=m,it=S,h>=0?(M=c,E=l,C=d,I=f,G=p,U=_,H=g,k=x):(M=l,E=c,C=f,I=d,G=_,U=p,H=x,k=g)),D===0)return null;const P=M/D,B=E/D,V=1/D,st=C-P*F,gt=I-B*F,X=G-P*N,nt=U-B*N,lt=H-P*it,Dt=k-B*it,St=lt*nt-Dt*X,Gt=st*Dt-gt*lt,Ht=X*gt-nt*st;if(s){if(St<0||Gt<0||Ht<0)return null}else if((St<0||Gt<0||Ht<0)&&(St>0||Gt>0||Ht>0))return null;const It=St+Gt+Ht;if(It===0)return null;const Xt=V*(St*F+Gt*N+Ht*it);return(It>0?Xt<0:Xt>0)?null:this.at(Xt/It,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class tr extends Ms{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ee(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ve,this.combine=_u,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Oc=new Kt,Di=new js,Mr=new Qs,Fc=new b,Sr=new b,yr=new b,Er=new b,Ko=new b,br=new b,zc=new b,wr=new b;let De=class extends He{constructor(t=new Ce,e=new tr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){br.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=a[c],d=r[c];h!==0&&(Ko.fromBufferAttribute(d,t),o?br.addScaledVector(Ko,h):br.addScaledVector(Ko.sub(e),h))}e.add(br)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Mr.copy(i.boundingSphere),Mr.applyMatrix4(r),Di.copy(t.ray).recast(t.near),!(Mr.containsPoint(Di.origin)===!1&&(Di.intersectSphere(Mr,Fc)===null||Di.origin.distanceToSquared(Fc)>(t.far-t.near)**2))&&(Oc.copy(r).invert(),Di.copy(t.ray).applyMatrix4(Oc),!(i.boundingBox!==null&&Di.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,Di)))}_computeIntersections(t,e,i){let s;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,f=r.groups,u=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,_=f.length;p<_;p++){const m=f[p],g=o[m.materialIndex],x=Math.max(m.start,u.start),S=Math.min(a.count,Math.min(m.start+m.count,u.start+u.count));for(let v=x,A=S;v<A;v+=3){const T=a.getX(v),M=a.getX(v+1),E=a.getX(v+2);s=Tr(this,g,t,i,l,h,d,T,M,E),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const p=Math.max(0,u.start),_=Math.min(a.count,u.start+u.count);for(let m=p,g=_;m<g;m+=3){const x=a.getX(m),S=a.getX(m+1),v=a.getX(m+2);s=Tr(this,o,t,i,l,h,d,x,S,v),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let p=0,_=f.length;p<_;p++){const m=f[p],g=o[m.materialIndex],x=Math.max(m.start,u.start),S=Math.min(c.count,Math.min(m.start+m.count,u.start+u.count));for(let v=x,A=S;v<A;v+=3){const T=v,M=v+1,E=v+2;s=Tr(this,g,t,i,l,h,d,T,M,E),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const p=Math.max(0,u.start),_=Math.min(c.count,u.start+u.count);for(let m=p,g=_;m<g;m+=3){const x=m,S=m+1,v=m+2;s=Tr(this,o,t,i,l,h,d,x,S,v),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function p0(n,t,e,i,s,r,o,a){let c;if(t.side===un?c=i.intersectTriangle(o,r,s,!0,a):c=i.intersectTriangle(s,r,o,t.side===Bi,a),c===null)return null;wr.copy(a),wr.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(wr);return l<e.near||l>e.far?null:{distance:l,point:wr.clone(),object:n}}function Tr(n,t,e,i,s,r,o,a,c,l){n.getVertexPosition(a,Sr),n.getVertexPosition(c,yr),n.getVertexPosition(l,Er);const h=p0(n,t,e,i,Sr,yr,Er,zc);if(h){const d=new b;En.getBarycoord(zc,Sr,yr,Er,d),s&&(h.uv=En.getInterpolatedAttribute(s,a,c,l,d,new ut)),r&&(h.uv1=En.getInterpolatedAttribute(r,a,c,l,d,new ut)),o&&(h.normal=En.getInterpolatedAttribute(o,a,c,l,d,new b),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const f={a,b:c,c:l,normal:new b,materialIndex:0};En.getNormal(Sr,yr,Er,f.normal),h.face=f,h.barycoord=d}return h}class m0 extends fn{constructor(t=null,e=1,i=1,s,r,o,a,c,l=nn,h=nn,d,f){super(null,o,a,c,l,h,s,r,d,f),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Ii=new Qs,g0=new ut(.5,.5),Ar=new b;class Ys{constructor(t=new Gn,e=new Gn,i=new Gn,s=new Gn,r=new Gn,o=new Gn){this.planes=[t,e,i,s,r,o]}set(t,e,i,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Nn,i=!1){const s=this.planes,r=t.elements,o=r[0],a=r[1],c=r[2],l=r[3],h=r[4],d=r[5],f=r[6],u=r[7],p=r[8],_=r[9],m=r[10],g=r[11],x=r[12],S=r[13],v=r[14],A=r[15];if(s[0].setComponents(l-o,u-h,g-p,A-x).normalize(),s[1].setComponents(l+o,u+h,g+p,A+x).normalize(),s[2].setComponents(l+a,u+d,g+_,A+S).normalize(),s[3].setComponents(l-a,u-d,g-_,A-S).normalize(),i)s[4].setComponents(c,f,m,v).normalize(),s[5].setComponents(l-c,u-f,g-m,A-v).normalize();else if(s[4].setComponents(l-c,u-f,g-m,A-v).normalize(),e===Nn)s[5].setComponents(l+c,u+f,g+m,A+v).normalize();else if(e===Xs)s[5].setComponents(c,f,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ii.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ii.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ii)}intersectsSprite(t){Ii.center.set(0,0,0);const e=g0.distanceTo(t.center);return Ii.radius=.7071067811865476+e,Ii.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ii)}intersectsSphere(t){const e=this.planes,i=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let i=0;i<6;i++){const s=e[i];if(Ar.x=s.normal.x>0?t.max.x:t.min.x,Ar.y=s.normal.y>0?t.max.y:t.min.y,Ar.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Ar)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const Bc=new Kt;class zl{constructor(){this.coordinateSystem=Nn,this._frustums=[],this._count=0}setFromArrayCamera(t){const e=t.cameras,i=this._frustums;for(let s=0;s<e.length;s++){const r=e[s];Bc.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),i[s]===void 0&&(i[s]=new Ys),i[s].setFromProjectionMatrix(Bc,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){const e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsObject(t))return!0;return!1}intersectsSprite(t){const e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSprite(t))return!0;return!1}intersectsSphere(t){const e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSphere(t))return!0;return!1}intersectsBox(t){const e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsBox(t))return!0;return!1}containsPoint(t){const e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;const e=this._frustums,i=t._frustums;for(let s=0;s<t._count;s++)e[s]===void 0&&(e[s]=new Ys),e[s].copy(i[s]);return this._count=t._count,this}clone(){return new zl().copy(this)}}class _o extends Ms{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ee(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const io=new b,so=new b,Hc=new Kt,Ts=new js,Rr=new Qs,$o=new b,kc=new b;class _0 extends He{constructor(t=new Ce,e=new _o){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,i=[0];for(let s=1,r=e.count;s<r;s++)io.fromBufferAttribute(e,s-1),so.fromBufferAttribute(e,s),i[s]=i[s-1],i[s]+=io.distanceTo(so);t.setAttribute("lineDistance",new ae(i,1))}else te("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){const i=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Rr.copy(i.boundingSphere),Rr.applyMatrix4(s),Rr.radius+=r,t.ray.intersectsSphere(Rr)===!1)return;Hc.copy(s).invert(),Ts.copy(t.ray).applyMatrix4(Hc);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,h=i.index,f=i.attributes.position;if(h!==null){const u=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let _=u,m=p-1;_<m;_+=l){const g=h.getX(_),x=h.getX(_+1),S=Cr(this,t,Ts,c,g,x,_);S&&e.push(S)}if(this.isLineLoop){const _=h.getX(p-1),m=h.getX(u),g=Cr(this,t,Ts,c,_,m,p-1);g&&e.push(g)}}else{const u=Math.max(0,o.start),p=Math.min(f.count,o.start+o.count);for(let _=u,m=p-1;_<m;_+=l){const g=Cr(this,t,Ts,c,_,_+1,_);g&&e.push(g)}if(this.isLineLoop){const _=Cr(this,t,Ts,c,p-1,u,p-1);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Cr(n,t,e,i,s,r,o){const a=n.geometry.attributes.position;if(io.fromBufferAttribute(a,s),so.fromBufferAttribute(a,r),e.distanceSqToSegment(io,so,$o,kc)>i)return;$o.applyMatrix4(n.matrixWorld);const l=t.ray.origin.distanceTo($o);if(!(l<t.near||l>t.far))return{distance:l,point:kc.clone().applyMatrix4(n.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:n}}const Gc=new b,Vc=new b;class er extends _0{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,i=[];for(let s=0,r=e.count;s<r;s+=2)Gc.fromBufferAttribute(e,s),Vc.fromBufferAttribute(e,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+Gc.distanceTo(Vc);t.setAttribute("lineDistance",new ae(i,1))}else te("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Nu extends fn{constructor(t=[],e=fs,i,s,r,o,a,c,l,h){super(t,e,i,s,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class ms extends fn{constructor(t,e,i=Zn,s,r,o,a=nn,c=nn,l,h=wi,d=1){if(h!==wi&&h!==yi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:t,height:e,depth:d};super(f,s,r,o,a,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Ol(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}}class Uu extends ms{constructor(t,e=Zn,i=fs,s,r,o=nn,a=nn,c,l=wi){const h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,i,s,r,o,a,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class Ou extends fn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class fi extends Ce{constructor(t=1,e=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const c=[],l=[],h=[],d=[];let f=0,u=0;p("z","y","x",-1,-1,i,e,t,o,r,0),p("z","y","x",1,-1,i,e,-t,o,r,1),p("x","z","y",1,1,t,i,e,s,o,2),p("x","z","y",1,-1,t,i,-e,s,o,3),p("x","y","z",1,-1,t,e,i,s,r,4),p("x","y","z",-1,-1,t,e,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new ae(l,3)),this.setAttribute("normal",new ae(h,3)),this.setAttribute("uv",new ae(d,2));function p(_,m,g,x,S,v,A,T,M,E,D){const C=v/M,I=A/E,F=v/2,G=A/2,U=T/2,N=M+1,H=E+1;let k=0,it=0;const P=new b;for(let B=0;B<H;B++){const V=B*I-G;for(let st=0;st<N;st++){const gt=st*C-F;P[_]=gt*x,P[m]=V*S,P[g]=U,l.push(P.x,P.y,P.z),P[_]=0,P[m]=0,P[g]=T>0?1:-1,h.push(P.x,P.y,P.z),d.push(st/M),d.push(1-B/E),k+=1}}for(let B=0;B<E;B++)for(let V=0;V<M;V++){const st=f+V+N*B,gt=f+V+N*(B+1),X=f+(V+1)+N*(B+1),nt=f+(V+1)+N*B;c.push(st,gt,nt),c.push(gt,X,nt),it+=6}a.addGroup(u,it,D),u+=it,f+=k}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new fi(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class Bl extends Ce{constructor(t=1,e=1,i=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:i,radialSegments:s,heightSegments:r},e=Math.max(0,e),i=Math.max(1,Math.floor(i)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const o=[],a=[],c=[],l=[],h=e/2,d=Math.PI/2*t,f=e,u=2*d+f,p=i*2+r,_=s+1,m=new b,g=new b;for(let x=0;x<=p;x++){let S=0,v=0,A=0,T=0;if(x<=i){const D=x/i,C=D*Math.PI/2;v=-h-t*Math.cos(C),A=t*Math.sin(C),T=-t*Math.cos(C),S=D*d}else if(x<=i+r){const D=(x-i)/r;v=-h+D*e,A=t,T=0,S=d+D*f}else{const D=(x-i-r)/i,C=D*Math.PI/2;v=h+t*Math.sin(C),A=t*Math.cos(C),T=t*Math.sin(C),S=d+f+D*d}const M=Math.max(0,Math.min(1,S/u));let E=0;x===0?E=.5/s:x===p&&(E=-.5/s);for(let D=0;D<=s;D++){const C=D/s,I=C*Math.PI*2,F=Math.sin(I),G=Math.cos(I);g.x=-A*G,g.y=v,g.z=A*F,a.push(g.x,g.y,g.z),m.set(-A*G,T,A*F),m.normalize(),c.push(m.x,m.y,m.z),l.push(C+E,M)}if(x>0){const D=(x-1)*_;for(let C=0;C<s;C++){const I=D+C,F=D+C+1,G=x*_+C,U=x*_+C+1;o.push(I,F,G),o.push(F,U,G)}}}this.setIndex(o),this.setAttribute("position",new ae(a,3)),this.setAttribute("normal",new ae(c,3)),this.setAttribute("uv",new ae(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Bl(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}}class Yn extends Ce{constructor(t=1,e=1,i=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};const l=this;s=Math.floor(s),r=Math.floor(r);const h=[],d=[],f=[],u=[];let p=0;const _=[],m=i/2;let g=0;x(),o===!1&&(t>0&&S(!0),e>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new ae(d,3)),this.setAttribute("normal",new ae(f,3)),this.setAttribute("uv",new ae(u,2));function x(){const v=new b,A=new b;let T=0;const M=(e-t)/i;for(let E=0;E<=r;E++){const D=[],C=E/r,I=C*(e-t)+t;for(let F=0;F<=s;F++){const G=F/s,U=G*c+a,N=Math.sin(U),H=Math.cos(U);A.x=I*N,A.y=-C*i+m,A.z=I*H,d.push(A.x,A.y,A.z),v.set(N,M,H).normalize(),f.push(v.x,v.y,v.z),u.push(G,1-C),D.push(p++)}_.push(D)}for(let E=0;E<s;E++)for(let D=0;D<r;D++){const C=_[D][E],I=_[D+1][E],F=_[D+1][E+1],G=_[D][E+1];(t>0||D!==0)&&(h.push(C,I,G),T+=3),(e>0||D!==r-1)&&(h.push(I,F,G),T+=3)}l.addGroup(g,T,0),g+=T}function S(v){const A=p,T=new ut,M=new b;let E=0;const D=v===!0?t:e,C=v===!0?1:-1;for(let F=1;F<=s;F++)d.push(0,m*C,0),f.push(0,C,0),u.push(.5,.5),p++;const I=p;for(let F=0;F<=s;F++){const U=F/s*c+a,N=Math.cos(U),H=Math.sin(U);M.x=D*H,M.y=m*C,M.z=D*N,d.push(M.x,M.y,M.z),f.push(0,C,0),T.x=N*.5+.5,T.y=H*.5*C+.5,u.push(T.x,T.y),p++}for(let F=0;F<s;F++){const G=A+F,U=I+F;v===!0?h.push(U,U+1,G):h.push(U+1,U,G),E+=3}l.addGroup(g,E,v===!0?1:2),g+=E}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Yn(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Ei extends Yn{constructor(t=1,e=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new Ei(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class nr extends Ce{constructor(t=[],e=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:s};const r=[],o=[];a(s),l(i),h(),this.setAttribute("position",new ae(r,3)),this.setAttribute("normal",new ae(r.slice(),3)),this.setAttribute("uv",new ae(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(x){const S=new b,v=new b,A=new b;for(let T=0;T<e.length;T+=3)u(e[T+0],S),u(e[T+1],v),u(e[T+2],A),c(S,v,A,x)}function c(x,S,v,A){const T=A+1,M=[];for(let E=0;E<=T;E++){M[E]=[];const D=x.clone().lerp(v,E/T),C=S.clone().lerp(v,E/T),I=T-E;for(let F=0;F<=I;F++)F===0&&E===T?M[E][F]=D:M[E][F]=D.clone().lerp(C,F/I)}for(let E=0;E<T;E++)for(let D=0;D<2*(T-E)-1;D++){const C=Math.floor(D/2);D%2===0?(f(M[E][C+1]),f(M[E+1][C]),f(M[E][C])):(f(M[E][C+1]),f(M[E+1][C+1]),f(M[E+1][C]))}}function l(x){const S=new b;for(let v=0;v<r.length;v+=3)S.x=r[v+0],S.y=r[v+1],S.z=r[v+2],S.normalize().multiplyScalar(x),r[v+0]=S.x,r[v+1]=S.y,r[v+2]=S.z}function h(){const x=new b;for(let S=0;S<r.length;S+=3){x.x=r[S+0],x.y=r[S+1],x.z=r[S+2];const v=m(x)/2/Math.PI+.5,A=g(x)/Math.PI+.5;o.push(v,1-A)}p(),d()}function d(){for(let x=0;x<o.length;x+=6){const S=o[x+0],v=o[x+2],A=o[x+4],T=Math.max(S,v,A),M=Math.min(S,v,A);T>.9&&M<.1&&(S<.2&&(o[x+0]+=1),v<.2&&(o[x+2]+=1),A<.2&&(o[x+4]+=1))}}function f(x){r.push(x.x,x.y,x.z)}function u(x,S){const v=x*3;S.x=t[v+0],S.y=t[v+1],S.z=t[v+2]}function p(){const x=new b,S=new b,v=new b,A=new b,T=new ut,M=new ut,E=new ut;for(let D=0,C=0;D<r.length;D+=9,C+=6){x.set(r[D+0],r[D+1],r[D+2]),S.set(r[D+3],r[D+4],r[D+5]),v.set(r[D+6],r[D+7],r[D+8]),T.set(o[C+0],o[C+1]),M.set(o[C+2],o[C+3]),E.set(o[C+4],o[C+5]),A.copy(x).add(S).add(v).divideScalar(3);const I=m(A);_(T,C+0,x,I),_(M,C+2,S,I),_(E,C+4,v,I)}}function _(x,S,v,A){A<0&&x.x===1&&(o[S]=x.x-1),v.x===0&&v.z===0&&(o[S]=A/2/Math.PI+.5)}function m(x){return Math.atan2(x.z,-x.x)}function g(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new nr(t.vertices,t.indices,t.radius,t.detail)}}class $n{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){te("Curve: .getPoint() not implemented.")}getPointAt(t,e){const i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){const e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){const e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let i,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)i=this.getPoint(o/t),r+=i.distanceTo(s),e.push(r),s=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){const i=this.getLengths();let s=0;const r=i.length;let o;e?o=e:o=t*i[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=i[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,i[s]===o)return s/(r-1);const h=i[s],f=i[s+1]-h,u=(o-h)/f;return(s+u)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),c=e||(o.isVector2?new ut:new b);return c.copy(a).sub(o).normalize(),c}getTangentAt(t,e){const i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e=!1){const i=new b,s=[],r=[],o=[],a=new b,c=new Kt;for(let u=0;u<=t;u++){const p=u/t;s[u]=this.getTangentAt(p,new b)}r[0]=new b,o[0]=new b;let l=Number.MAX_VALUE;const h=Math.abs(s[0].x),d=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=l&&(l=h,i.set(1,0,0)),d<=l&&(l=d,i.set(0,1,0)),f<=l&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let u=1;u<=t;u++){if(r[u]=r[u-1].clone(),o[u]=o[u-1].clone(),a.crossVectors(s[u-1],s[u]),a.length()>Number.EPSILON){a.normalize();const p=Math.acos(pe(s[u-1].dot(s[u]),-1,1));r[u].applyMatrix4(c.makeRotationAxis(a,p))}o[u].crossVectors(s[u],r[u])}if(e===!0){let u=Math.acos(pe(r[0].dot(r[t]),-1,1));u/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(u=-u);for(let p=1;p<=t;p++)r[p].applyMatrix4(c.makeRotationAxis(s[p],u*p)),o[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}}class Hl extends $n{constructor(t=0,e=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(t,e=new ut){const i=e,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+t*r;let c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),f=c-this.aX,u=l-this.aY;c=f*h-u*d+this.aX,l=f*d+u*h+this.aY}return i.set(c,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class x0 extends Hl{constructor(t,e,i,s,r,o){super(t,e,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function kl(){let n=0,t=0,e=0,i=0;function s(r,o,a,c){n=r,t=a,e=-3*r+3*o-2*a-c,i=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){s(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,h,d){let f=(o-r)/l-(a-r)/(l+h)+(a-o)/h,u=(a-o)/h-(c-o)/(h+d)+(c-a)/d;f*=h,u*=h,s(o,a,f,u)},calc:function(r){const o=r*r,a=o*r;return n+t*r+e*o+i*a}}}const Wc=new b,Xc=new b,Jo=new kl,Qo=new kl,jo=new kl;class Gl extends $n{constructor(t=[],e=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=s}getPoint(t,e=new b){const i=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t;let a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,h;this.closed||a>0?l=s[(a-1)%r]:(Xc.subVectors(s[0],s[1]).add(s[0]),l=Xc);const d=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Wc.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Wc),this.curveType==="centripetal"||this.curveType==="chordal"){const u=this.curveType==="chordal"?.5:.25;let p=Math.pow(l.distanceToSquared(d),u),_=Math.pow(d.distanceToSquared(f),u),m=Math.pow(f.distanceToSquared(h),u);_<1e-4&&(_=1),p<1e-4&&(p=_),m<1e-4&&(m=_),Jo.initNonuniformCatmullRom(l.x,d.x,f.x,h.x,p,_,m),Qo.initNonuniformCatmullRom(l.y,d.y,f.y,h.y,p,_,m),jo.initNonuniformCatmullRom(l.z,d.z,f.z,h.z,p,_,m)}else this.curveType==="catmullrom"&&(Jo.initCatmullRom(l.x,d.x,f.x,h.x,this.tension),Qo.initCatmullRom(l.y,d.y,f.y,h.y,this.tension),jo.initCatmullRom(l.z,d.z,f.z,h.z,this.tension));return i.set(Jo.calc(c),Qo.calc(c),jo.calc(c)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){const s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){const s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){const s=t.points[e];this.points.push(new b().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function Yc(n,t,e,i,s){const r=(i-t)*.5,o=(s-e)*.5,a=n*n,c=n*a;return(2*e-2*i+r+o)*c+(-3*e+3*i-2*r-o)*a+r*n+e}function v0(n,t){const e=1-n;return e*e*t}function M0(n,t){return 2*(1-n)*n*t}function S0(n,t){return n*n*t}function zs(n,t,e,i){return v0(n,t)+M0(n,e)+S0(n,i)}function y0(n,t){const e=1-n;return e*e*e*t}function E0(n,t){const e=1-n;return 3*e*e*n*t}function b0(n,t){return 3*(1-n)*n*n*t}function w0(n,t){return n*n*n*t}function Bs(n,t,e,i,s){return y0(n,t)+E0(n,e)+b0(n,i)+w0(n,s)}class Fu extends $n{constructor(t=new ut,e=new ut,i=new ut,s=new ut){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new ut){const i=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Bs(t,s.x,r.x,o.x,a.x),Bs(t,s.y,r.y,o.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class T0 extends $n{constructor(t=new b,e=new b,i=new b,s=new b){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new b){const i=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Bs(t,s.x,r.x,o.x,a.x),Bs(t,s.y,r.y,o.y,a.y),Bs(t,s.z,r.z,o.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class zu extends $n{constructor(t=new ut,e=new ut){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new ut){const i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new ut){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class A0 extends $n{constructor(t=new b,e=new b){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new b){const i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new b){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Bu extends $n{constructor(t=new ut,e=new ut,i=new ut){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new ut){const i=e,s=this.v0,r=this.v1,o=this.v2;return i.set(zs(t,s.x,r.x,o.x),zs(t,s.y,r.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class R0 extends $n{constructor(t=new b,e=new b,i=new b){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new b){const i=e,s=this.v0,r=this.v1,o=this.v2;return i.set(zs(t,s.x,r.x,o.x),zs(t,s.y,r.y,o.y),zs(t,s.z,r.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Hu extends $n{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new ut){const i=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],l=s[o],h=s[o>s.length-2?s.length-1:o+1],d=s[o>s.length-3?s.length-1:o+2];return i.set(Yc(a,c.x,l.x,h.x,d.x),Yc(a,c.y,l.y,h.y,d.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){const s=t.points[e];this.points.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){const s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){const s=t.points[e];this.points.push(new ut().fromArray(s))}return this}}var el=Object.freeze({__proto__:null,ArcCurve:x0,CatmullRomCurve3:Gl,CubicBezierCurve:Fu,CubicBezierCurve3:T0,EllipseCurve:Hl,LineCurve:zu,LineCurve3:A0,QuadraticBezierCurve:Bu,QuadraticBezierCurve3:R0,SplineCurve:Hu});class C0 extends $n{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new el[i](e,t))}return this}getPoint(t,e){const i=t*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=i){const o=s[r]-i,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let i=0,s=this.curves.length;i<s;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let i;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,c=o.getPoints(a);for(let l=0;l<c.length;l++){const h=c[l];i&&i.equals(h)||(e.push(h),i=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){const s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this.cacheLengths=null,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){const s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){const s=t.curves[e];this.curves.push(new el[s.type]().fromJSON(s))}return this.cacheLengths=null,this}}class qc extends C0{constructor(t){super(),this.type="Path",this.currentPoint=new ut,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const i=new zu(this.currentPoint.clone(),new ut(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,s){const r=new Bu(this.currentPoint.clone(),new ut(t,e),new ut(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(t,e,i,s,r,o){const a=new Fu(this.currentPoint.clone(),new ut(t,e),new ut(i,s),new ut(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),i=new Hu(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,s,r,o){const a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(t+a,e+c,i,s,r,o),this}absarc(t,e,i,s,r,o){return this.absellipse(t,e,i,i,s,r,o),this}ellipse(t,e,i,s,r,o,a,c){const l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+l,e+h,i,s,r,o,a,c),this}absellipse(t,e,i,s,r,o,a,c){const l=new Hl(t,e,i,s,r,o,a,c);if(this.curves.length>0){const d=l.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(l);const h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class ku extends qc{constructor(t){super(t),this.uuid=vs(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let i=0,s=this.holes.length;i<s;i++)e[i]=this.holes[i].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){const s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,i=this.holes.length;e<i;e++){const s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){const s=t.holes[e];this.holes.push(new qc().fromJSON(s))}return this}}function P0(n,t,e=2){const i=t&&t.length,s=i?t[0]*e:n.length;let r=Gu(n,0,s,e,!0);const o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(i&&(r=U0(n,t,r,e)),n.length>80*e){a=n[0],c=n[1];let h=a,d=c;for(let f=e;f<s;f+=e){const u=n[f],p=n[f+1];u<a&&(a=u),p<c&&(c=p),u>h&&(h=u),p>d&&(d=p)}l=Math.max(h-a,d-c),l=l!==0?32767/l:0}return qs(r,o,e,a,c,l,0),o}function Gu(n,t,e,i,s){let r;if(s===Y0(n,t,e,i)>0)for(let o=t;o<e;o+=i)r=Zc(o/i|0,n[o],n[o+1],r);else for(let o=e-i;o>=t;o-=i)r=Zc(o/i|0,n[o],n[o+1],r);return r&&gs(r,r.next)&&(Ks(r),r=r.next),r}function ki(n,t){if(!n)return n;t||(t=n);let e=n,i;do if(i=!1,!e.steiner&&(gs(e,e.next)||Be(e.prev,e,e.next)===0)){if(Ks(e),e=t=e.prev,e===e.next)break;i=!0}else e=e.next;while(i||e!==t);return t}function qs(n,t,e,i,s,r,o){if(!n)return;!o&&r&&H0(n,i,s,r);let a=n;for(;n.prev!==n.next;){const c=n.prev,l=n.next;if(r?D0(n,i,s,r):L0(n)){t.push(c.i,n.i,l.i),Ks(n),n=l.next,a=l.next;continue}if(n=l,n===a){o?o===1?(n=I0(ki(n),t),qs(n,t,e,i,s,r,2)):o===2&&N0(n,t,e,i,s,r):qs(ki(n),t,e,i,s,r,1);break}}}function L0(n){const t=n.prev,e=n,i=n.next;if(Be(t,e,i)>=0)return!1;const s=t.x,r=e.x,o=i.x,a=t.y,c=e.y,l=i.y,h=Math.min(s,r,o),d=Math.min(a,c,l),f=Math.max(s,r,o),u=Math.max(a,c,l);let p=i.next;for(;p!==t;){if(p.x>=h&&p.x<=f&&p.y>=d&&p.y<=u&&Ls(s,a,r,c,o,l,p.x,p.y)&&Be(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function D0(n,t,e,i){const s=n.prev,r=n,o=n.next;if(Be(s,r,o)>=0)return!1;const a=s.x,c=r.x,l=o.x,h=s.y,d=r.y,f=o.y,u=Math.min(a,c,l),p=Math.min(h,d,f),_=Math.max(a,c,l),m=Math.max(h,d,f),g=nl(u,p,t,e,i),x=nl(_,m,t,e,i);let S=n.prevZ,v=n.nextZ;for(;S&&S.z>=g&&v&&v.z<=x;){if(S.x>=u&&S.x<=_&&S.y>=p&&S.y<=m&&S!==s&&S!==o&&Ls(a,h,c,d,l,f,S.x,S.y)&&Be(S.prev,S,S.next)>=0||(S=S.prevZ,v.x>=u&&v.x<=_&&v.y>=p&&v.y<=m&&v!==s&&v!==o&&Ls(a,h,c,d,l,f,v.x,v.y)&&Be(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;S&&S.z>=g;){if(S.x>=u&&S.x<=_&&S.y>=p&&S.y<=m&&S!==s&&S!==o&&Ls(a,h,c,d,l,f,S.x,S.y)&&Be(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;v&&v.z<=x;){if(v.x>=u&&v.x<=_&&v.y>=p&&v.y<=m&&v!==s&&v!==o&&Ls(a,h,c,d,l,f,v.x,v.y)&&Be(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function I0(n,t){let e=n;do{const i=e.prev,s=e.next.next;!gs(i,s)&&Wu(i,e,e.next,s)&&Zs(i,s)&&Zs(s,i)&&(t.push(i.i,e.i,s.i),Ks(e),Ks(e.next),e=n=s),e=e.next}while(e!==n);return ki(e)}function N0(n,t,e,i,s,r){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&V0(o,a)){let c=Xu(o,a);o=ki(o,o.next),c=ki(c,c.next),qs(o,t,e,i,s,r,0),qs(c,t,e,i,s,r,0);return}a=a.next}o=o.next}while(o!==n)}function U0(n,t,e,i){const s=[];for(let r=0,o=t.length;r<o;r++){const a=t[r]*i,c=r<o-1?t[r+1]*i:n.length,l=Gu(n,a,c,i,!1);l===l.next&&(l.steiner=!0),s.push(G0(l))}s.sort(O0);for(let r=0;r<s.length;r++)e=F0(s[r],e);return e}function O0(n,t){let e=n.x-t.x;if(e===0&&(e=n.y-t.y,e===0)){const i=(n.next.y-n.y)/(n.next.x-n.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=i-s}return e}function F0(n,t){const e=z0(n,t);if(!e)return t;const i=Xu(e,n);return ki(i,i.next),ki(e,e.next)}function z0(n,t){let e=t;const i=n.x,s=n.y;let r=-1/0,o;if(gs(n,e))return e;do{if(gs(n,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){const d=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=i&&d>r&&(r=d,o=e.x<e.next.x?e:e.next,d===i))return o}e=e.next}while(e!==t);if(!o)return null;const a=o,c=o.x,l=o.y;let h=1/0;e=o;do{if(i>=e.x&&e.x>=c&&i!==e.x&&Vu(s<l?i:r,s,c,l,s<l?r:i,s,e.x,e.y)){const d=Math.abs(s-e.y)/(i-e.x);Zs(e,n)&&(d<h||d===h&&(e.x>o.x||e.x===o.x&&B0(o,e)))&&(o=e,h=d)}e=e.next}while(e!==a);return o}function B0(n,t){return Be(n.prev,n,t.prev)<0&&Be(t.next,n,n.next)<0}function H0(n,t,e,i){let s=n;do s.z===0&&(s.z=nl(s.x,s.y,t,e,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,k0(s)}function k0(n){let t,e=1;do{let i=n,s;n=null;let r=null;for(t=0;i;){t++;let o=i,a=0;for(let l=0;l<e&&(a++,o=o.nextZ,!!o);l++);let c=e;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||i.z<=o.z)?(s=i,i=i.nextZ,a--):(s=o,o=o.nextZ,c--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=o}r.nextZ=null,e*=2}while(t>1);return n}function nl(n,t,e,i,s){return n=(n-e)*s|0,t=(t-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,n|t<<1}function G0(n){let t=n,e=n;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==n);return e}function Vu(n,t,e,i,s,r,o,a){return(s-o)*(t-a)>=(n-o)*(r-a)&&(n-o)*(i-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(i-a)}function Ls(n,t,e,i,s,r,o,a){return!(n===o&&t===a)&&Vu(n,t,e,i,s,r,o,a)}function V0(n,t){return n.next.i!==t.i&&n.prev.i!==t.i&&!W0(n,t)&&(Zs(n,t)&&Zs(t,n)&&X0(n,t)&&(Be(n.prev,n,t.prev)||Be(n,t.prev,t))||gs(n,t)&&Be(n.prev,n,n.next)>0&&Be(t.prev,t,t.next)>0)}function Be(n,t,e){return(t.y-n.y)*(e.x-t.x)-(t.x-n.x)*(e.y-t.y)}function gs(n,t){return n.x===t.x&&n.y===t.y}function Wu(n,t,e,i){const s=Lr(Be(n,t,e)),r=Lr(Be(n,t,i)),o=Lr(Be(e,i,n)),a=Lr(Be(e,i,t));return!!(s!==r&&o!==a||s===0&&Pr(n,e,t)||r===0&&Pr(n,i,t)||o===0&&Pr(e,n,i)||a===0&&Pr(e,t,i))}function Pr(n,t,e){return t.x<=Math.max(n.x,e.x)&&t.x>=Math.min(n.x,e.x)&&t.y<=Math.max(n.y,e.y)&&t.y>=Math.min(n.y,e.y)}function Lr(n){return n>0?1:n<0?-1:0}function W0(n,t){let e=n;do{if(e.i!==n.i&&e.next.i!==n.i&&e.i!==t.i&&e.next.i!==t.i&&Wu(e,e.next,n,t))return!0;e=e.next}while(e!==n);return!1}function Zs(n,t){return Be(n.prev,n,n.next)<0?Be(n,t,n.next)>=0&&Be(n,n.prev,t)>=0:Be(n,t,n.prev)<0||Be(n,n.next,t)<0}function X0(n,t){let e=n,i=!1;const s=(n.x+t.x)/2,r=(n.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(i=!i),e=e.next;while(e!==n);return i}function Xu(n,t){const e=il(n.i,n.x,n.y),i=il(t.i,t.x,t.y),s=n.next,r=t.prev;return n.next=t,t.prev=n,e.next=s,s.prev=e,i.next=e,e.prev=i,r.next=i,i.prev=r,i}function Zc(n,t,e,i){const s=il(n,t,e);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function Ks(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function il(n,t,e){return{i:n,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Y0(n,t,e,i){let s=0;for(let r=t,o=e-i;r<e;r+=i)s+=(n[o]-n[r])*(n[r+1]+n[o+1]),o=r;return s}class q0{static triangulate(t,e,i=2){return P0(t,e,i)}}class ai{static area(t){const e=t.length;let i=0;for(let s=e-1,r=0;r<e;s=r++)i+=t[s].x*t[r].y-t[r].x*t[s].y;return i*.5}static isClockWise(t){return ai.area(t)<0}static triangulateShape(t,e){const i=[],s=[],r=[];Kc(t),$c(i,t);let o=t.length;e.forEach(Kc);for(let c=0;c<e.length;c++)s.push(o),o+=e[c].length,$c(i,e[c]);const a=q0.triangulate(i,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}}function Kc(n){const t=n.length;t>2&&n[t-1].equals(n[0])&&n.pop()}function $c(n,t){for(let e=0;e<t.length;e++)n.push(t[e].x),n.push(t[e].y)}class Vl extends Ce{constructor(t=new ku([new ut(.5,.5),new ut(-.5,.5),new ut(-.5,-.5),new ut(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const i=this,s=[],r=[];for(let a=0,c=t.length;a<c;a++){const l=t[a];o(l)}this.setAttribute("position",new ae(s,3)),this.setAttribute("uv",new ae(r,2)),this.computeVertexNormals();function o(a){const c=[],l=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,d=e.depth!==void 0?e.depth:1;let f=e.bevelEnabled!==void 0?e.bevelEnabled:!0,u=e.bevelThickness!==void 0?e.bevelThickness:.2,p=e.bevelSize!==void 0?e.bevelSize:u-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3;const g=e.extrudePath,x=e.UVGenerator!==void 0?e.UVGenerator:Z0;let S,v=!1,A,T,M,E;if(g){S=g.getSpacedPoints(h),v=!0,f=!1;const J=g.isCatmullRomCurve3?g.closed:!1;A=g.computeFrenetFrames(h,J),T=new b,M=new b,E=new b}f||(m=0,u=0,p=0,_=0);const D=a.extractPoints(l);let C=D.shape;const I=D.holes;if(!ai.isClockWise(C)){C=C.reverse();for(let J=0,ft=I.length;J<ft;J++){const dt=I[J];ai.isClockWise(dt)&&(I[J]=dt.reverse())}}function G(J){const dt=10000000000000001e-36;let bt=J[0];for(let yt=1;yt<=J.length;yt++){const $t=yt%J.length,zt=J[$t],ue=zt.x-bt.x,fe=zt.y-bt.y,ve=ue*ue+fe*fe,L=Math.max(Math.abs(zt.x),Math.abs(zt.y),Math.abs(bt.x),Math.abs(bt.y)),ht=dt*L*L;if(ve<=ht){J.splice($t,1),yt--;continue}bt=zt}}G(C),I.forEach(G);const U=I.length,N=C;for(let J=0;J<U;J++){const ft=I[J];C=C.concat(ft)}function H(J,ft,dt){return ft||Se("ExtrudeGeometry: vec does not exist"),J.clone().addScaledVector(ft,dt)}const k=C.length;function it(J,ft,dt){let bt,yt,$t;const zt=J.x-ft.x,ue=J.y-ft.y,fe=dt.x-J.x,ve=dt.y-J.y,L=zt*zt+ue*ue,ht=zt*ve-ue*fe;if(Math.abs(ht)>Number.EPSILON){const Mt=Math.sqrt(L),qt=Math.sqrt(fe*fe+ve*ve),ot=ft.x-ue/Mt,Jt=ft.y+zt/Mt,Tt=dt.x-ve/qt,Rt=dt.y+fe/qt,R=((Tt-ot)*ve-(Rt-Jt)*fe)/(zt*ve-ue*fe);bt=ot+zt*R-J.x,yt=Jt+ue*R-J.y;const y=bt*bt+yt*yt;if(y<=2)return new ut(bt,yt);$t=Math.sqrt(y/2)}else{let Mt=!1;zt>Number.EPSILON?fe>Number.EPSILON&&(Mt=!0):zt<-Number.EPSILON?fe<-Number.EPSILON&&(Mt=!0):Math.sign(ue)===Math.sign(ve)&&(Mt=!0),Mt?(bt=-ue,yt=zt,$t=Math.sqrt(L)):(bt=zt,yt=ue,$t=Math.sqrt(L/2))}return new ut(bt/$t,yt/$t)}const P=[];for(let J=0,ft=N.length,dt=ft-1,bt=J+1;J<ft;J++,dt++,bt++)dt===ft&&(dt=0),bt===ft&&(bt=0),P[J]=it(N[J],N[dt],N[bt]);const B=[];let V,st=P.concat();for(let J=0,ft=U;J<ft;J++){const dt=I[J];V=[];for(let bt=0,yt=dt.length,$t=yt-1,zt=bt+1;bt<yt;bt++,$t++,zt++)$t===yt&&($t=0),zt===yt&&(zt=0),V[bt]=it(dt[bt],dt[$t],dt[zt]);B.push(V),st=st.concat(V)}let gt;if(m===0)gt=ai.triangulateShape(N,I);else{const J=[],ft=[];for(let dt=0;dt<m;dt++){const bt=dt/m,yt=u*Math.cos(bt*Math.PI/2),$t=p*Math.sin(bt*Math.PI/2)+_;for(let zt=0,ue=N.length;zt<ue;zt++){const fe=H(N[zt],P[zt],$t);Gt(fe.x,fe.y,-yt),bt===0&&J.push(fe)}for(let zt=0,ue=U;zt<ue;zt++){const fe=I[zt];V=B[zt];const ve=[];for(let L=0,ht=fe.length;L<ht;L++){const Mt=H(fe[L],V[L],$t);Gt(Mt.x,Mt.y,-yt),bt===0&&ve.push(Mt)}bt===0&&ft.push(ve)}}gt=ai.triangulateShape(J,ft)}const X=gt.length,nt=p+_;for(let J=0;J<k;J++){const ft=f?H(C[J],st[J],nt):C[J];v?(M.copy(A.normals[0]).multiplyScalar(ft.x),T.copy(A.binormals[0]).multiplyScalar(ft.y),E.copy(S[0]).add(M).add(T),Gt(E.x,E.y,E.z)):Gt(ft.x,ft.y,0)}for(let J=1;J<=h;J++)for(let ft=0;ft<k;ft++){const dt=f?H(C[ft],st[ft],nt):C[ft];v?(M.copy(A.normals[J]).multiplyScalar(dt.x),T.copy(A.binormals[J]).multiplyScalar(dt.y),E.copy(S[J]).add(M).add(T),Gt(E.x,E.y,E.z)):Gt(dt.x,dt.y,d/h*J)}for(let J=m-1;J>=0;J--){const ft=J/m,dt=u*Math.cos(ft*Math.PI/2),bt=p*Math.sin(ft*Math.PI/2)+_;for(let yt=0,$t=N.length;yt<$t;yt++){const zt=H(N[yt],P[yt],bt);Gt(zt.x,zt.y,d+dt)}for(let yt=0,$t=I.length;yt<$t;yt++){const zt=I[yt];V=B[yt];for(let ue=0,fe=zt.length;ue<fe;ue++){const ve=H(zt[ue],V[ue],bt);v?Gt(ve.x,ve.y+S[h-1].y,S[h-1].x+dt):Gt(ve.x,ve.y,d+dt)}}}lt(),Dt();function lt(){const J=s.length/3;if(f){let ft=0,dt=k*ft;for(let bt=0;bt<X;bt++){const yt=gt[bt];Ht(yt[2]+dt,yt[1]+dt,yt[0]+dt)}ft=h+m*2,dt=k*ft;for(let bt=0;bt<X;bt++){const yt=gt[bt];Ht(yt[0]+dt,yt[1]+dt,yt[2]+dt)}}else{for(let ft=0;ft<X;ft++){const dt=gt[ft];Ht(dt[2],dt[1],dt[0])}for(let ft=0;ft<X;ft++){const dt=gt[ft];Ht(dt[0]+k*h,dt[1]+k*h,dt[2]+k*h)}}i.addGroup(J,s.length/3-J,0)}function Dt(){const J=s.length/3;let ft=0;St(N,ft),ft+=N.length;for(let dt=0,bt=I.length;dt<bt;dt++){const yt=I[dt];St(yt,ft),ft+=yt.length}i.addGroup(J,s.length/3-J,1)}function St(J,ft){let dt=J.length;for(;--dt>=0;){const bt=dt;let yt=dt-1;yt<0&&(yt=J.length-1);for(let $t=0,zt=h+m*2;$t<zt;$t++){const ue=k*$t,fe=k*($t+1),ve=ft+bt+ue,L=ft+yt+ue,ht=ft+yt+fe,Mt=ft+bt+fe;It(ve,L,ht,Mt)}}}function Gt(J,ft,dt){c.push(J),c.push(ft),c.push(dt)}function Ht(J,ft,dt){Xt(J),Xt(ft),Xt(dt);const bt=s.length/3,yt=x.generateTopUV(i,s,bt-3,bt-2,bt-1);Qt(yt[0]),Qt(yt[1]),Qt(yt[2])}function It(J,ft,dt,bt){Xt(J),Xt(ft),Xt(bt),Xt(ft),Xt(dt),Xt(bt);const yt=s.length/3,$t=x.generateSideWallUV(i,s,yt-6,yt-3,yt-2,yt-1);Qt($t[0]),Qt($t[1]),Qt($t[3]),Qt($t[1]),Qt($t[2]),Qt($t[3])}function Xt(J){s.push(c[J*3+0]),s.push(c[J*3+1]),s.push(c[J*3+2])}function Qt(J){r.push(J.x),r.push(J.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,i=this.parameters.options;return K0(e,i,t)}static fromJSON(t,e){const i=[];for(let r=0,o=t.shapes.length;r<o;r++){const a=e[t.shapes[r]];i.push(a)}const s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new el[s.type]().fromJSON(s)),new Vl(i,t.options)}}const Z0={generateTopUV:function(n,t,e,i,s){const r=t[e*3],o=t[e*3+1],a=t[i*3],c=t[i*3+1],l=t[s*3],h=t[s*3+1];return[new ut(r,o),new ut(a,c),new ut(l,h)]},generateSideWallUV:function(n,t,e,i,s,r){const o=t[e*3],a=t[e*3+1],c=t[e*3+2],l=t[i*3],h=t[i*3+1],d=t[i*3+2],f=t[s*3],u=t[s*3+1],p=t[s*3+2],_=t[r*3],m=t[r*3+1],g=t[r*3+2];return Math.abs(a-h)<Math.abs(o-l)?[new ut(o,1-c),new ut(l,1-d),new ut(f,1-p),new ut(_,1-g)]:[new ut(a,1-c),new ut(h,1-d),new ut(u,1-p),new ut(m,1-g)]}};function K0(n,t,e){if(e.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){const r=n[i];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class Wl extends nr{constructor(t=1,e=0){const i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Wl(t.radius,t.detail)}}class xo extends Ce{constructor(t=[new ut(0,-.5),new ut(.5,0),new ut(0,.5)],e=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:s},e=Math.floor(e),s=pe(s,0,Math.PI*2);const r=[],o=[],a=[],c=[],l=[],h=1/e,d=new b,f=new ut,u=new b,p=new b,_=new b;let m=0,g=0;for(let x=0;x<=t.length-1;x++)switch(x){case 0:m=t[x+1].x-t[x].x,g=t[x+1].y-t[x].y,u.x=g*1,u.y=-m,u.z=g*0,_.copy(u),u.normalize(),c.push(u.x,u.y,u.z);break;case t.length-1:_.normalize(),c.push(_.x,_.y,_.z);break;default:m=t[x+1].x-t[x].x,g=t[x+1].y-t[x].y,u.x=g*1,u.y=-m,u.z=g*0,p.copy(u),u.x+=_.x,u.y+=_.y,u.z+=_.z,u.normalize(),c.push(u.x,u.y,u.z),_.copy(p)}for(let x=0;x<=e;x++){const S=i+x*h*s,v=Math.sin(S),A=Math.cos(S);for(let T=0;T<=t.length-1;T++){d.x=t[T].x*v,d.y=t[T].y,d.z=t[T].x*A,o.push(d.x,d.y,d.z),f.x=x/e,f.y=T/(t.length-1),a.push(f.x,f.y);const M=c[3*T+0]*v,E=c[3*T+1],D=c[3*T+0]*A;l.push(M,E,D)}}for(let x=0;x<e;x++)for(let S=0;S<t.length-1;S++){const v=S+x*t.length,A=v,T=v+t.length,M=v+t.length+1,E=v+1;r.push(A,T,E),r.push(M,E,T)}this.setIndex(r),this.setAttribute("position",new ae(o,3)),this.setAttribute("uv",new ae(a,2)),this.setAttribute("normal",new ae(l,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new xo(t.points,t.segments,t.phiStart,t.phiLength)}}class Xl extends nr{constructor(t=1,e=0){const i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Xl(t.radius,t.detail)}}class vo extends Ce{constructor(t=1,e=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(i),c=Math.floor(s),l=a+1,h=c+1,d=t/a,f=e/c,u=[],p=[],_=[],m=[];for(let g=0;g<h;g++){const x=g*f-o;for(let S=0;S<l;S++){const v=S*d-r;p.push(v,-x,0),_.push(0,0,1),m.push(S/a),m.push(1-g/c)}}for(let g=0;g<c;g++)for(let x=0;x<a;x++){const S=x+l*g,v=x+l*(g+1),A=x+1+l*(g+1),T=x+1+l*g;u.push(S,v,T),u.push(v,A,T)}this.setIndex(u),this.setAttribute("position",new ae(p,3)),this.setAttribute("normal",new ae(_,3)),this.setAttribute("uv",new ae(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new vo(t.width,t.height,t.widthSegments,t.heightSegments)}}class Yl extends Ce{constructor(t=.5,e=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);const a=[],c=[],l=[],h=[];let d=t;const f=(e-t)/s,u=new b,p=new ut;for(let _=0;_<=s;_++){for(let m=0;m<=i;m++){const g=r+m/i*o;u.x=d*Math.cos(g),u.y=d*Math.sin(g),c.push(u.x,u.y,u.z),l.push(0,0,1),p.x=(u.x/e+1)/2,p.y=(u.y/e+1)/2,h.push(p.x,p.y)}d+=f}for(let _=0;_<s;_++){const m=_*(i+1);for(let g=0;g<i;g++){const x=g+m,S=x,v=x+i+1,A=x+i+2,T=x+1;a.push(S,v,T),a.push(v,A,T)}}this.setIndex(a),this.setAttribute("position",new ae(c,3)),this.setAttribute("normal",new ae(l,3)),this.setAttribute("uv",new ae(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Yl(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class On extends Ce{constructor(t=1,e=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));const c=Math.min(o+a,Math.PI);let l=0;const h=[],d=new b,f=new b,u=[],p=[],_=[],m=[];for(let g=0;g<=i;g++){const x=[],S=g/i,v=o+S*a,A=t*Math.cos(v),T=Math.sqrt(t*t-A*A);let M=0;g===0&&o===0?M=.5/e:g===i&&c===Math.PI&&(M=-.5/e);for(let E=0;E<=e;E++){const D=E/e,C=s+D*r;d.x=-T*Math.cos(C),d.y=A,d.z=T*Math.sin(C),p.push(d.x,d.y,d.z),f.copy(d).normalize(),_.push(f.x,f.y,f.z),m.push(D+M,1-S),x.push(l++)}h.push(x)}for(let g=0;g<i;g++)for(let x=0;x<e;x++){const S=h[g][x+1],v=h[g][x],A=h[g+1][x],T=h[g+1][x+1];(g!==0||o>0)&&u.push(S,v,T),(g!==i-1||c<Math.PI)&&u.push(v,A,T)}this.setIndex(u),this.setAttribute("position",new ae(p,3)),this.setAttribute("normal",new ae(_,3)),this.setAttribute("uv",new ae(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new On(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class ql extends nr{constructor(t=1,e=0){const i=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],s=[2,1,0,0,3,2,1,3,0,2,3,1];super(i,s,t,e),this.type="TetrahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new ql(t.radius,t.detail)}}class li extends Ce{constructor(t=1,e=.4,i=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},i=Math.floor(i),s=Math.floor(s);const c=[],l=[],h=[],d=[],f=new b,u=new b,p=new b;for(let _=0;_<=i;_++){const m=o+_/i*a;for(let g=0;g<=s;g++){const x=g/s*r;u.x=(t+e*Math.cos(m))*Math.cos(x),u.y=(t+e*Math.cos(m))*Math.sin(x),u.z=e*Math.sin(m),l.push(u.x,u.y,u.z),f.x=t*Math.cos(x),f.y=t*Math.sin(x),p.subVectors(u,f).normalize(),h.push(p.x,p.y,p.z),d.push(g/s),d.push(_/i)}}for(let _=1;_<=i;_++)for(let m=1;m<=s;m++){const g=(s+1)*_+m-1,x=(s+1)*(_-1)+m-1,S=(s+1)*(_-1)+m,v=(s+1)*_+m;c.push(g,x,v),c.push(x,S,v)}this.setIndex(c),this.setAttribute("position",new ae(l,3)),this.setAttribute("normal",new ae(h,3)),this.setAttribute("uv",new ae(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new li(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}}function _s(n){const t={};for(const e in n){t[e]={};for(const i in n[e]){const s=n[e][i];if(Jc(s))s.isRenderTargetTexture?(te("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=s.clone();else if(Array.isArray(s))if(Jc(s[0])){const r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();t[e][i]=r}else t[e][i]=s.slice();else t[e][i]=s}}return t}function cn(n){const t={};for(let e=0;e<n.length;e++){const i=_s(n[e]);for(const s in i)t[s]=i[s]}return t}function Jc(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function $0(n){const t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function Yu(n){const t=n.getRenderTarget();return t===null?n.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:xe.workingColorSpace}const Zl={clone:_s,merge:cn};var J0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Q0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Kn extends Ms{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=J0,this.fragmentShader=Q0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=_s(t.uniforms),this.uniformsGroups=$0(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(const i in t.uniforms){const s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=e[s.value]||null;break;case"c":this.uniforms[i].value=new ee().setHex(s.value);break;case"v2":this.uniforms[i].value=new ut().fromArray(s.value);break;case"v3":this.uniforms[i].value=new b().fromArray(s.value);break;case"v4":this.uniforms[i].value=new ze().fromArray(s.value);break;case"m3":this.uniforms[i].value=new re().fromArray(s.value);break;case"m4":this.uniforms[i].value=new Kt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(const i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}}class qu extends Kn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Hs extends Ms{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ee(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ee(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=tl,this.normalScale=new ut(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ve,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class j0 extends Hs{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ut(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return pe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new ee(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ee(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ee(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(t){this._diffuseRoughness>0!=t>0&&this.version++,this._diffuseRoughness=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}get iridescenceThicknessRange(){return cs('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(t){cs('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=t[0],this.iridescenceThicknessMaximum=t[1]}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.diffuseRoughness=t.diffuseRoughness,this.diffuseRoughnessMap=t.diffuseRoughnessMap,this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum,this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class tp extends Ms{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Pd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class ep extends Ms{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class ir extends He{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new ee(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}}class Qc extends ir{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(He.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ee(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){const e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}}const ta=new Kt,jc=new b,th=new b;class Kl{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ut(512,512),this.mapType=Sn,this.map=null,this.mapPass=null,this.matrix=new Kt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ys,this._frameExtents=new ut(1,1),this._viewportCount=1,this._viewports=[new ze(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera;jc.setFromMatrixPosition(t.matrixWorld),e.position.copy(jc),th.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(th),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,s){ta.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(ta,t.coordinateSystem,t.reversedDepth);const r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,c=s?s.x/r.x:0,l=s?s.y/r.y:0;t.coordinateSystem===Xs||t.reversedDepth?e.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,.5,.5,0,0,0,1),e.multiply(ta)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Dr=new b,Ir=new Ne,Bn=new b;class Zu extends He{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Kt,this.projectionMatrix=new Kt,this.projectionMatrixInverse=new Kt,this.coordinateSystem=Nn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Dr,Ir,Bn),Bn.x===1&&Bn.y===1&&Bn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Dr,Ir,Bn.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(Dr,Ir,Bn),Bn.x===1&&Bn.y===1&&Bn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Dr,Ir,Bn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const vi=new b,eh=new ut,nh=new ut;class mn extends Zu{constructor(t=50,e=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=no*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Xr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return no*2*Math.atan(Math.tan(Xr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){vi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(vi.x,vi.y).multiplyScalar(-t/vi.z),vi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(vi.x,vi.y).multiplyScalar(-t/vi.z)}getViewSize(t,e){return this.getViewBounds(t,eh,nh),e.subVectors(nh,eh)}setViewOffset(t,e,i,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Xr*.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,e-=o.offsetY*i/l,s*=o.width/c,i*=o.height/l}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}class np extends Kl{constructor(){super(new mn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){const e=this.camera,i=no*2*t.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=t.distance||e.far;(i!==e.fov||s!==e.aspect||r!==e.far)&&(e.fov=i,e.aspect=s,e.far=r,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){const t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}}class $l extends ir{constructor(t,e,i=0,s=Math.PI/3,r=0,o=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(He.DEFAULT_UP),this.updateMatrix(),this.target=new He,this.distance=i,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new np}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){const e=super.toJSON(t);return e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture&&(e.object.map=this.map.toJSON(t).uuid),e.object.shadow=this.shadow.toJSON(),e}}class ip extends Kl{constructor(){super(new mn(90,1,.5,500)),this.isPointLightShadow=!0}}class sp extends ir{constructor(t,e,i=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new ip}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){const e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}}class Jl extends Zu{constructor(t=-1,e=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-t,o=i+t,a=s+e,c=s-e;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class rp extends Kl{constructor(){super(new Jl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class op extends ir{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(He.DEFAULT_UP),this.updateMatrix(),this.target=new He,this.shadow=new rp}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){const e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}}const ts=-90,es=1;class sl extends He{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new mn(ts,es,t,e);s.layers=this.layers,this.add(s);const r=new mn(ts,es,t,e);r.layers=this.layers,this.add(r);const o=new mn(ts,es,t,e);o.layers=this.layers,this.add(o);const a=new mn(ts,es,t,e);a.layers=this.layers,this.add(a);const c=new mn(ts,es,t,e);c.layers=this.layers,this.add(c);const l=new mn(ts,es,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[i,s,r,o,a,c]=e;for(const l of e)this.remove(l);if(t===Nn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Xs)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,l,h]=this.children,d=t.getRenderTarget(),f=t.getActiveCubeFace(),u=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;const _=i.texture.mipmapsAutoUpdate;i.texture.mipmapsAutoUpdate=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(i,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),i.texture.mipmapsAutoUpdate=_,t.setRenderTarget(i,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(d,f,u),t.xr.enabled=p,i.texture.needsPMREMUpdate=!0}}class ap extends mn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}}class lp{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(t){this._document=t,t.hidden!==void 0&&(this._pageVisibilityHandler=cp.bind(this),t.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(t){return this._timescale=t,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(t){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(t!==void 0?t:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}}function cp(){this._document.hidden===!1&&this.reset()}const ih=new Kt;class ro{constructor(t,e,i=0,s=1/0){this.ray=new js(t,e),this.near=i,this.far=s,this.camera=null,this.layers=new Fl,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Se("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return ih.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ih),this}intersectObject(t,e=!0,i=[]){return rl(t,this,i,e),i.sort(sh),i}intersectObjects(t,e=!0,i=[]){for(let s=0,r=t.length;s<r;s++)rl(t[s],this,i,e);return i.sort(sh),i}}function sh(n,t){return n.distance-t.distance}function rl(n,t,e,i){let s=!0;if(n.layers.test(t.layers)&&n.raycast(t,e)===!1&&(s=!1),s===!0&&i===!0){const r=n.children;for(let o=0,a=r.length;o<a;o++)rl(r[o],t,e,!0)}}class rh{constructor(t=1,e=0,i=0){this.radius=t,this.phi=e,this.theta=i}set(t,e,i){return this.radius=t,this.phi=e,this.theta=i,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=pe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,i){return this.radius=Math.sqrt(t*t+e*e+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,i),this.phi=Math.acos(pe(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class hp extends Ai{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}}function oh(n,t,e,i){const s=up(i);switch(e){case Eu:return n*t;case wu:return n*t/s.components*s.byteLength;case Dl:return n*t/s.components*s.byteLength;case Hi:return n*t*2/s.components*s.byteLength;case Il:return n*t*2/s.components*s.byteLength;case bu:return n*t*3/s.components*s.byteLength;case Xn:return n*t*4/s.components*s.byteLength;case Nl:return n*t*4/s.components*s.byteLength;case kr:case Gr:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case Vr:case Wr:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case wa:case Aa:return Math.max(n,16)*Math.max(t,8)/4;case ba:case Ta:return Math.max(n,8)*Math.max(t,8)/2;case Ra:case Ca:case La:case Da:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case Pa:case Qr:case Ia:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case Na:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case Ua:return Math.floor((n+4)/5)*Math.floor((t+3)/4)*16;case Oa:return Math.floor((n+4)/5)*Math.floor((t+4)/5)*16;case Fa:return Math.floor((n+5)/6)*Math.floor((t+4)/5)*16;case za:return Math.floor((n+5)/6)*Math.floor((t+5)/6)*16;case Ba:return Math.floor((n+7)/8)*Math.floor((t+4)/5)*16;case Ha:return Math.floor((n+7)/8)*Math.floor((t+5)/6)*16;case ka:return Math.floor((n+7)/8)*Math.floor((t+7)/8)*16;case Ga:return Math.floor((n+9)/10)*Math.floor((t+4)/5)*16;case Va:return Math.floor((n+9)/10)*Math.floor((t+5)/6)*16;case Wa:return Math.floor((n+9)/10)*Math.floor((t+7)/8)*16;case Xa:return Math.floor((n+9)/10)*Math.floor((t+9)/10)*16;case Ya:return Math.floor((n+11)/12)*Math.floor((t+9)/10)*16;case qa:return Math.floor((n+11)/12)*Math.floor((t+11)/12)*16;case Za:case Ka:case $a:return Math.ceil(n/4)*Math.ceil(t/4)*16;case Ja:case Qa:return Math.ceil(n/4)*Math.ceil(t/4)*8;case jr:case ja:return Math.ceil(n/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function up(n){switch(n){case Sn:case vu:return{byteLength:1,components:1};case Ws:case Mu:case wn:return{byteLength:2,components:1};case Pl:case Ll:return{byteLength:2,components:4};case Zn:case Cl:case Wn:return{byteLength:4,components:1};case Su:case yu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:yl}}));typeof window<"u"&&(window.__THREE__?te("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=yl);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Ku(){let n=null,t=!1,e=null,i=null;function s(r,o){i=n.requestAnimationFrame(s),e(r,o)}return{start:function(){t!==!0&&e!==null&&n!==null&&(i=n.requestAnimationFrame(s),t=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){n=r}}}function fp(n){const t=new WeakMap;function e(a,c){const l=a.array,h=a.usage,d=l.byteLength,f=n.createBuffer();n.bindBuffer(c,f),n.bufferData(c,l,h),a.onUploadCallback();let u;if(l instanceof Float32Array)u=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)u=n.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?u=n.HALF_FLOAT:u=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)u=n.SHORT;else if(l instanceof Uint32Array)u=n.UNSIGNED_INT;else if(l instanceof Int32Array)u=n.INT;else if(l instanceof Int8Array)u=n.BYTE;else if(l instanceof Uint8Array)u=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)u=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:u,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:d}}function i(a,c,l){const h=c.array,d=c.updateRanges;if(n.bindBuffer(l,a),d.length===0)n.bufferSubData(l,0,h);else{d.sort((u,p)=>u.start-p.start);let f=0;for(let u=1;u<d.length;u++){const p=d[f],_=d[u];_.start<=p.start+p.count+1?p.count=Math.max(p.count,_.start+_.count-p.start):(++f,d[f]=_)}d.length=f+1;for(let u=0,p=d.length;u<p;u++){const _=d[u];n.bufferSubData(l,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=t.get(a);c&&(n.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var dp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,pp=`#ifdef USE_ALPHAHASH
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
#endif`,mp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,gp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,_p=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,xp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,vp=`#ifdef USE_AOMAP
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
#endif`,Mp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Sp=`#ifdef USE_BATCHING
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
#endif`,yp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ep=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,bp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,wp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Tp=`#ifdef USE_IRIDESCENCE
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
#endif`,Ap=`#ifdef USE_BUMPMAP
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
#endif`,Rp=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Cp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Pp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Lp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Dp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Ip=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Np=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Up=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Op=`#define PI 3.141592653589793
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
} // validated`,Fp=`vec3 transformedNormal = objectNormal;
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
#endif`,zp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Bp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Hp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,kp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Gp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Vp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Wp=`#ifdef USE_ENVMAP
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
#endif`,Xp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Yp=`#ifdef USE_ENVMAP
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
#endif`,qp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Zp=`#ifdef USE_ENVMAP
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
#endif`,Kp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,$p=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Jp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Qp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,jp=`#ifdef USE_GRADIENTMAP
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
}`,tm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,em=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,nm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,im=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,sm=`#ifdef USE_ENVMAP
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
#endif`,rm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,om=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,am=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,cm=`PhysicalMaterial material;
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
#endif`,hm=`uniform sampler2D dfgLUT;
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
}`,um=`
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
#endif`,fm=`#if defined( RE_IndirectDiffuse )
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
#endif`,dm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,pm=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,mm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,gm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_m=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,xm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,vm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Mm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Sm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,ym=`#if defined( USE_POINTS_UV )
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
#endif`,Em=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,bm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,wm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Tm=`#if defined( USE_MORPHCOLORS )
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
#endif`,Am=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Rm=`#ifdef USE_MORPHTARGETS
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
#endif`,Cm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Pm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Lm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Dm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Im=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Nm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Um=`#ifdef USE_NORMALMAP
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
#endif`,Om=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Fm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Bm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Hm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,km=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Gm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Vm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Wm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Xm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ym=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,qm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Zm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Km=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,$m=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Jm=`float getShadowMask() {
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
}`,Qm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,jm=`#ifdef USE_SKINNING
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
#endif`,t1=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,e1=`#ifdef USE_SKINNING
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
#endif`,n1=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,i1=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,s1=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,r1=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,o1=`#ifdef USE_TRANSMISSION
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
#endif`,a1=`#ifdef USE_TRANSMISSION
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
#endif`,l1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,c1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,h1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,u1=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const f1=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,d1=`uniform sampler2D t2D;
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
}`,p1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,m1=`uniform float backgroundBlurriness;
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
}`,g1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_1=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,x1=`#include <common>
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
}`,v1=`#if DEPTH_PACKING == 3200
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
}`,M1=`#define DISTANCE
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
}`,S1=`#define DISTANCE
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
}`,y1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,E1=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,b1=`uniform float scale;
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
}`,w1=`uniform vec3 diffuse;
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
}`,T1=`#include <common>
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
}`,A1=`uniform vec3 diffuse;
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
}`,R1=`#define LAMBERT
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
}`,C1=`#define LAMBERT
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
}`,P1=`#define MATCAP
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
}`,L1=`#define MATCAP
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
}`,D1=`#define NORMAL
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
}`,I1=`#define NORMAL
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
}`,N1=`#define PHONG
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
}`,U1=`#define PHONG
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
}`,O1=`#define STANDARD
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
}`,F1=`#define STANDARD
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
}`,z1=`#define TOON
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
}`,B1=`#define TOON
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
}`,H1=`uniform float size;
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
}`,k1=`uniform vec3 diffuse;
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
}`,G1=`#include <common>
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
}`,V1=`uniform vec3 color;
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
}`,W1=`uniform float rotation;
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
}`,X1=`uniform vec3 diffuse;
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
}`,ge={alphahash_fragment:dp,alphahash_pars_fragment:pp,alphamap_fragment:mp,alphamap_pars_fragment:gp,alphatest_fragment:_p,alphatest_pars_fragment:xp,aomap_fragment:vp,aomap_pars_fragment:Mp,batching_pars_vertex:Sp,batching_vertex:yp,begin_vertex:Ep,beginnormal_vertex:bp,bsdfs:wp,iridescence_fragment:Tp,bumpmap_pars_fragment:Ap,clipping_planes_fragment:Rp,clipping_planes_pars_fragment:Cp,clipping_planes_pars_vertex:Pp,clipping_planes_vertex:Lp,color_fragment:Dp,color_pars_fragment:Ip,color_pars_vertex:Np,color_vertex:Up,common:Op,defaultnormal_vertex:Fp,displacementmap_pars_vertex:zp,displacementmap_vertex:Bp,emissivemap_fragment:Hp,emissivemap_pars_fragment:kp,colorspace_fragment:Gp,colorspace_pars_fragment:Vp,envmap_fragment:Wp,envmap_common_pars_fragment:Xp,envmap_pars_fragment:Yp,envmap_pars_vertex:qp,envmap_physical_pars_fragment:sm,envmap_vertex:Zp,fog_vertex:Kp,fog_pars_vertex:$p,fog_fragment:Jp,fog_pars_fragment:Qp,gradientmap_pars_fragment:jp,lightmap_pars_fragment:tm,lights_lambert_fragment:em,lights_lambert_pars_fragment:nm,lights_pars_begin:im,lights_toon_fragment:rm,lights_toon_pars_fragment:om,lights_phong_fragment:am,lights_phong_pars_fragment:lm,lights_physical_fragment:cm,lights_physical_pars_fragment:hm,lights_fragment_begin:um,lights_fragment_maps:fm,lights_fragment_end:dm,lightprobes_pars_fragment:pm,logdepthbuf_fragment:mm,logdepthbuf_pars_fragment:gm,logdepthbuf_pars_vertex:_m,logdepthbuf_vertex:xm,map_fragment:vm,map_pars_fragment:Mm,map_particle_fragment:Sm,map_particle_pars_fragment:ym,metalnessmap_fragment:Em,metalnessmap_pars_fragment:bm,morphinstance_vertex:wm,morphcolor_vertex:Tm,morphnormal_vertex:Am,morphtarget_pars_vertex:Rm,morphtarget_vertex:Cm,normal_fragment_begin:Pm,normal_fragment_maps:Lm,normal_pars_fragment:Dm,normal_pars_vertex:Im,normal_vertex:Nm,normalmap_pars_fragment:Um,clearcoat_normal_fragment_begin:Om,clearcoat_normal_fragment_maps:Fm,clearcoat_pars_fragment:zm,iridescence_pars_fragment:Bm,opaque_fragment:Hm,packing:km,premultiplied_alpha_fragment:Gm,project_vertex:Vm,dithering_fragment:Wm,dithering_pars_fragment:Xm,roughnessmap_fragment:Ym,roughnessmap_pars_fragment:qm,shadowmap_pars_fragment:Zm,shadowmap_pars_vertex:Km,shadowmap_vertex:$m,shadowmask_pars_fragment:Jm,skinbase_vertex:Qm,skinning_pars_vertex:jm,skinning_vertex:t1,skinnormal_vertex:e1,specularmap_fragment:n1,specularmap_pars_fragment:i1,tonemapping_fragment:s1,tonemapping_pars_fragment:r1,transmission_fragment:o1,transmission_pars_fragment:a1,uv_pars_fragment:l1,uv_pars_vertex:c1,uv_vertex:h1,worldpos_vertex:u1,background_vert:f1,background_frag:d1,backgroundCube_vert:p1,backgroundCube_frag:m1,cube_vert:g1,cube_frag:_1,depth_vert:x1,depth_frag:v1,distance_vert:M1,distance_frag:S1,equirect_vert:y1,equirect_frag:E1,linedashed_vert:b1,linedashed_frag:w1,meshbasic_vert:T1,meshbasic_frag:A1,meshlambert_vert:R1,meshlambert_frag:C1,meshmatcap_vert:P1,meshmatcap_frag:L1,meshnormal_vert:D1,meshnormal_frag:I1,meshphong_vert:N1,meshphong_frag:U1,meshphysical_vert:O1,meshphysical_frag:F1,meshtoon_vert:z1,meshtoon_frag:B1,points_vert:H1,points_frag:k1,shadow_vert:G1,shadow_frag:V1,sprite_vert:W1,sprite_frag:X1},Nt={common:{diffuse:{value:new ee(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new re},alphaMap:{value:null},alphaMapTransform:{value:new re},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new re}},envmap:{envMap:{value:null},envMapRotation:{value:new re},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new re}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new re}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new re},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new re},normalScale:{value:new ut(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new re},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new re}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new re}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new re}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ee(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new ee(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new re},alphaTest:{value:0},uvTransform:{value:new re}},sprite:{diffuse:{value:new ee(16777215)},opacity:{value:1},center:{value:new ut(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new re},alphaMap:{value:null},alphaMapTransform:{value:new re},alphaTest:{value:0}}},Vn={basic:{uniforms:cn([Nt.common,Nt.specularmap,Nt.envmap,Nt.aomap,Nt.lightmap,Nt.fog]),vertexShader:ge.meshbasic_vert,fragmentShader:ge.meshbasic_frag},lambert:{uniforms:cn([Nt.common,Nt.specularmap,Nt.envmap,Nt.aomap,Nt.lightmap,Nt.emissivemap,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,Nt.fog,Nt.lights,{emissive:{value:new ee(0)},envMapIntensity:{value:1}}]),vertexShader:ge.meshlambert_vert,fragmentShader:ge.meshlambert_frag},phong:{uniforms:cn([Nt.common,Nt.specularmap,Nt.envmap,Nt.aomap,Nt.lightmap,Nt.emissivemap,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,Nt.fog,Nt.lights,{emissive:{value:new ee(0)},specular:{value:new ee(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ge.meshphong_vert,fragmentShader:ge.meshphong_frag},standard:{uniforms:cn([Nt.common,Nt.envmap,Nt.aomap,Nt.lightmap,Nt.emissivemap,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,Nt.roughnessmap,Nt.metalnessmap,Nt.fog,Nt.lights,{emissive:{value:new ee(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ge.meshphysical_vert,fragmentShader:ge.meshphysical_frag},toon:{uniforms:cn([Nt.common,Nt.aomap,Nt.lightmap,Nt.emissivemap,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,Nt.gradientmap,Nt.fog,Nt.lights,{emissive:{value:new ee(0)}}]),vertexShader:ge.meshtoon_vert,fragmentShader:ge.meshtoon_frag},matcap:{uniforms:cn([Nt.common,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,Nt.fog,{matcap:{value:null}}]),vertexShader:ge.meshmatcap_vert,fragmentShader:ge.meshmatcap_frag},points:{uniforms:cn([Nt.points,Nt.fog]),vertexShader:ge.points_vert,fragmentShader:ge.points_frag},dashed:{uniforms:cn([Nt.common,Nt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ge.linedashed_vert,fragmentShader:ge.linedashed_frag},depth:{uniforms:cn([Nt.common,Nt.displacementmap]),vertexShader:ge.depth_vert,fragmentShader:ge.depth_frag},normal:{uniforms:cn([Nt.common,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,{opacity:{value:1}}]),vertexShader:ge.meshnormal_vert,fragmentShader:ge.meshnormal_frag},sprite:{uniforms:cn([Nt.sprite,Nt.fog]),vertexShader:ge.sprite_vert,fragmentShader:ge.sprite_frag},background:{uniforms:{uvTransform:{value:new re},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ge.background_vert,fragmentShader:ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new re}},vertexShader:ge.backgroundCube_vert,fragmentShader:ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ge.cube_vert,fragmentShader:ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ge.equirect_vert,fragmentShader:ge.equirect_frag},distance:{uniforms:cn([Nt.common,Nt.displacementmap,{referencePosition:{value:new b},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ge.distance_vert,fragmentShader:ge.distance_frag},shadow:{uniforms:cn([Nt.lights,Nt.fog,{color:{value:new ee(0)},opacity:{value:1}}]),vertexShader:ge.shadow_vert,fragmentShader:ge.shadow_frag}};Vn.physical={uniforms:cn([Vn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new re},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new re},clearcoatNormalScale:{value:new ut(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new re},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new re},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new re},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new re},sheen:{value:0},sheenColor:{value:new ee(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new re},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new re},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new re},transmissionSamplerSize:{value:new ut},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new re},attenuationDistance:{value:0},attenuationColor:{value:new ee(0)},specularColor:{value:new ee(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new re},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new re},anisotropyVector:{value:new ut},anisotropyMap:{value:null},anisotropyMapTransform:{value:new re}}]),vertexShader:ge.meshphysical_vert,fragmentShader:ge.meshphysical_frag};const Nr={r:0,b:0,g:0},Y1=new Kt,$u=new re;$u.set(-1,0,0,0,1,0,0,0,1);function q1(n,t,e,i,s,r){const o=new ee(0);let a=s===!0?0:1,c,l,h=null,d=0,f=null;function u(x){let S=x.isScene===!0?x.background:null;if(S&&S.isTexture){const v=x.backgroundBlurriness>0;S=t.get(S,v)}return S}function p(x){let S=!1;const v=u(x);v===null?m(o,a):v&&v.isColor&&(m(v,1),S=!0);const A=n.xr.getEnvironmentBlendMode();A==="additive"?e.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(n.autoClear||S)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function _(x,S){const v=u(S);v&&v.isCubeTexture?(l===void 0&&(l=new De(new fi(1,1,1),new Kn({name:"BackgroundCubeMaterial",uniforms:_s(Vn.backgroundCube.uniforms),vertexShader:Vn.backgroundCube.vertexShader,fragmentShader:Vn.backgroundCube.fragmentShader,side:un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(A,T,M){this.matrixWorld.copyPosition(M.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=v,l.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Y1.makeRotationFromEuler(S.backgroundRotation)).transpose(),v.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply($u),l.material.toneMapped=xe.getTransfer(v.colorSpace)!==Te,(h!==v||d!==v.version||f!==n.toneMapping)&&(l.material.needsUpdate=!0,h=v,d=v.version,f=n.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new De(new vo(2,2),new Kn({name:"BackgroundMaterial",uniforms:_s(Vn.background.uniforms),vertexShader:Vn.background.vertexShader,fragmentShader:Vn.background.fragmentShader,side:Bi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.toneMapped=xe.getTransfer(v.colorSpace)!==Te,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||d!==v.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,h=v,d=v.version,f=n.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function m(x,S){x.getRGB(Nr,Yu(n)),e.buffers.color.setClear(Nr.r,Nr.g,Nr.b,S,r)}function g(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,S=1){o.set(x),a=S,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,m(o,a)},render:p,addToRenderList:_,dispose:g}}function Z1(n,t){const e=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=f(null);let r=s,o=!1;function a(I,F,G,U,N){let H=!1;const k=d(I,U,G,F);r!==k&&(r=k,l(r.object)),H=u(I,U,G,N),H&&p(I,U,G,N),N!==null&&t.update(N,n.ELEMENT_ARRAY_BUFFER),(H||o)&&(o=!1,v(I,F,G,U),N!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(N).buffer))}function c(){return n.createVertexArray()}function l(I){return n.bindVertexArray(I)}function h(I){return n.deleteVertexArray(I)}function d(I,F,G,U){const N=U.wireframe===!0;let H=i[F.id];H===void 0&&(H={},i[F.id]=H);const k=I.isInstancedMesh===!0?I.id:0;let it=H[k];it===void 0&&(it={},H[k]=it);let P=it[G.id];P===void 0&&(P={},it[G.id]=P);let B=P[N];return B===void 0&&(B=f(c()),P[N]=B),B}function f(I){const F=[],G=[],U=[];for(let N=0;N<e;N++)F[N]=0,G[N]=0,U[N]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:G,attributeDivisors:U,object:I,attributes:{},index:null}}function u(I,F,G,U){const N=r.attributes,H=F.attributes;let k=0;const it=G.getAttributes();for(const P in it)if(it[P].location>=0){const V=N[P];let st=H[P];if(st===void 0&&(P==="instanceMatrix"&&I.instanceMatrix&&(st=I.instanceMatrix),P==="instanceColor"&&I.instanceColor&&(st=I.instanceColor)),V===void 0||V.attribute!==st||st&&V.data!==st.data)return!0;k++}return r.attributesNum!==k||r.index!==U}function p(I,F,G,U){const N={},H=F.attributes;let k=0;const it=G.getAttributes();for(const P in it)if(it[P].location>=0){let V=H[P];V===void 0&&(P==="instanceMatrix"&&I.instanceMatrix&&(V=I.instanceMatrix),P==="instanceColor"&&I.instanceColor&&(V=I.instanceColor));const st={};st.attribute=V,V&&V.data&&(st.data=V.data),N[P]=st,k++}r.attributes=N,r.attributesNum=k,r.index=U}function _(){const I=r.newAttributes;for(let F=0,G=I.length;F<G;F++)I[F]=0}function m(I){g(I,0)}function g(I,F){const G=r.newAttributes,U=r.enabledAttributes,N=r.attributeDivisors;G[I]=1,U[I]===0&&(n.enableVertexAttribArray(I),U[I]=1),N[I]!==F&&(n.vertexAttribDivisor(I,F),N[I]=F)}function x(){const I=r.newAttributes,F=r.enabledAttributes;for(let G=0,U=F.length;G<U;G++)F[G]!==I[G]&&(n.disableVertexAttribArray(G),F[G]=0)}function S(I,F,G,U,N,H,k){k===!0?n.vertexAttribIPointer(I,F,G,N,H):n.vertexAttribPointer(I,F,G,U,N,H)}function v(I,F,G,U){_();const N=U.attributes,H=G.getAttributes(),k=F.defaultAttributeValues;for(const it in H){const P=H[it];if(P.location>=0){let B=N[it];if(B===void 0&&(it==="instanceMatrix"&&I.instanceMatrix&&(B=I.instanceMatrix),it==="instanceColor"&&I.instanceColor&&(B=I.instanceColor)),B!==void 0){const V=B.normalized,st=B.itemSize,gt=t.get(B);if(gt===void 0)continue;const X=gt.buffer,nt=gt.type,lt=gt.bytesPerElement,Dt=nt===n.INT||nt===n.UNSIGNED_INT||B.gpuType===Cl;if(B.isInterleavedBufferAttribute){const St=B.data,Gt=St.isInterleavedBuffer===!0?St.stride:St.itemSize,Ht=B.offset;if(St.isInstancedInterleavedBuffer||St.isInstancedBufferAttribute){for(let It=0;It<P.locationSize;It++)g(P.location+It,St.meshPerAttribute);I.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=St.meshPerAttribute*St.count)}else for(let It=0;It<P.locationSize;It++)m(P.location+It);n.bindBuffer(n.ARRAY_BUFFER,X);for(let It=0;It<P.locationSize;It++)S(P.location+It,st/P.locationSize,nt,V,Gt*lt,(Ht+st/P.locationSize*It)*lt,Dt)}else{if(B.isInstancedBufferAttribute){for(let St=0;St<P.locationSize;St++)g(P.location+St,B.meshPerAttribute);I.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=B.meshPerAttribute*B.count)}else for(let St=0;St<P.locationSize;St++)m(P.location+St);n.bindBuffer(n.ARRAY_BUFFER,X);for(let St=0;St<P.locationSize;St++)S(P.location+St,st/P.locationSize,nt,V,st*lt,st/P.locationSize*St*lt,Dt)}}else if(k!==void 0){const V=k[it];if(V!==void 0)switch(V.length){case 2:n.vertexAttrib2fv(P.location,V);break;case 3:n.vertexAttrib3fv(P.location,V);break;case 4:n.vertexAttrib4fv(P.location,V);break;default:n.vertexAttrib1fv(P.location,V)}}}}x()}function A(){D();for(const I in i){const F=i[I];for(const G in F){const U=F[G];for(const N in U){const H=U[N];for(const k in H)h(H[k].object),delete H[k];delete U[N]}}delete i[I]}}function T(I){if(i[I.id]===void 0)return;const F=i[I.id];for(const G in F){const U=F[G];for(const N in U){const H=U[N];for(const k in H)h(H[k].object),delete H[k];delete U[N]}}delete i[I.id]}function M(I){for(const F in i){const G=i[F];for(const U in G){const N=G[U];if(N[I.id]===void 0)continue;const H=N[I.id];for(const k in H)h(H[k].object),delete H[k];delete N[I.id]}}}function E(I){for(const F in i){const G=i[F],U=I.isInstancedMesh===!0?I.id:0,N=G[U];if(N!==void 0){for(const H in N){const k=N[H];for(const it in k)h(k[it].object),delete k[it];delete N[H]}delete G[U],Object.keys(G).length===0&&delete i[F]}}}function D(){C(),o=!0,r!==s&&(r=s,l(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:D,resetDefaultState:C,dispose:A,releaseStatesOfGeometry:T,releaseStatesOfObject:E,releaseStatesOfProgram:M,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function K1(n,t,e){let i;function s(c){i=c}function r(c,l){n.drawArrays(i,c,l),e.update(l,i,1)}function o(c,l,h){h!==0&&(n.drawArraysInstanced(i,c,l,h),e.update(l,i,h))}function a(c,l,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,h);let f=0;for(let u=0;u<h;u++)f+=l[u];e.update(f,i,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function $1(n,t,e,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const M=t.get("EXT_texture_filter_anisotropic");s=n.getParameter(M.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(M){return!(M!==Xn&&i.convert(M)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(M){const E=M===wn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(M!==Sn&&M!==Wn&&!E&&i.convert(M)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function c(M){if(M==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";M="mediump"}return M==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp";const h=c(l);h!==l&&(te("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),f=e.logarithmicDepthBuffer===!0&&d===!1;e.reversedDepthBuffer===!0&&d===!1&&te("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),e.logarithmicDepthBuffer===!0&&d===!0&&te("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const u=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),p=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),g=n.getParameter(n.MAX_VERTEX_ATTRIBS),x=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),S=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),A=n.getParameter(n.MAX_SAMPLES),T=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:u,maxVertexTextures:p,maxTextureSize:_,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:x,maxVaryings:S,maxFragmentUniforms:v,maxSamples:A,samples:T}}function J1(n){const t=this;let e=null,i=0,s=!1,r=!1;const o=new Gn,a=new re,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,f){const u=d.length!==0||f||i!==0||s;return s=f,i=d.length,u},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,f){e=h(d,f,0)},this.setState=function(d,f,u){const p=d.clippingPlanes,_=d.clipIntersection,m=d.clipShadows,g=n.get(d);if(!s||p===null||p.length===0||r&&!m)r?h(null):l();else{const x=r?0:i,S=x*4;let v=g.clippingState||null;c.value=v,v=h(p,f,S,u);for(let A=0;A!==S;++A)v[A]=e[A];g.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(d,f,u,p){const _=d!==null?d.length:0;let m=null;if(_!==0){if(m=c.value,p!==!0||m===null){const g=u+_*4,x=f.matrixWorldInverse;a.getNormalMatrix(x),(m===null||m.length<g)&&(m=new Float32Array(g));for(let S=0,v=u;S!==_;++S,v+=4)o.copy(d[S]).applyMatrix4(x,a),o.normal.toArray(m,v),m[v+3]=o.constant}c.value=m,c.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}class Ql extends bn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Nu(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new fi(5,5,5),r=new Kn({name:"CubemapFromEquirect",uniforms:_s(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:un,blending:Fi});r.uniforms.tEquirect.value=e;const o=new De(s,r),a=e.minFilter;return e.minFilter===Si&&(e.minFilter=gn),new sl(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,i=!0,s=!0){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,s);t.setRenderTarget(r)}}const ah=256,Q1=3,j1=20,Ju=256,Qu=16,tg=3,eg=new b,ng=new ee;class $s{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new sl(1,10,null),this._boxMesh=new De(new fi(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,i=.1,s=100,r={}){const{size:o=256,position:a=eg}=r,c=this._renderer;this._setSize(o);const l=this._allocateTarget(),h=this._getSourceTarget(!0);e>0&&(h.texture.mipmapsAutoUpdate=!1);const d=c.autoClear,f=c.autoClearColor,u=c.autoClearDepth,p=c.autoClearStencil,_=t.background;c.autoClear=!0,c.autoClearColor=!0,c.autoClearDepth=!0,c.autoClearStencil=!0,_===null&&(t.background=c.getClearColor(ng));const m=new sl(i,s,h);return m.position.copy(a),m.update(c,t),c.autoClear=d,c.autoClearColor=f,c.autoClearDepth=u,c.autoClearStencil=p,t.background=_,e>0&&(h.texture.mipmapsAutoUpdate=!0,this._blur(l,e)),this._applyPMREM(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=hh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ch(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(ah,Wd(t))}_fromTexture(t,e){t.mapping===fs||t.mapping===Vs?this._setSize(t.image.length===0?ah:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4);const i=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(i),i}_allocateTarget(){const t=this._cubeSize,e=lh(t,!1,!1),i=Math.log2(t)-Q1;for(let s=0;s<=i;s++)e.texture.mipmaps.push({width:t>>s,height:t>>s});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){const e=this._cubeSize,i=this._sourceTarget;return(i===null||i.width!==e||t&&i.depthBuffer===!1)&&(i!==null&&i.dispose(),this._sourceTarget=lh(e,!0,t)),this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,i){const s=this._boxMesh,r=this._cubeCamera;s.material=i,r.renderTarget=t,r.activeMipmapLevel=e;const o=t.width>>e;t.viewport.set(0,0,o,o),r.update(this._renderer,s),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;t.mapping===fs||t.mapping===Vs?(this._cubemapMaterial===null&&(this._cubemapMaterial=hh()),e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=ch()),e=this._equirectMaterial),e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=ig(),this._integrationMaterial=sg());const e=this._cubeSize,i=t.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;const r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(e/Qu);for(let o=0;o<=i;o++){const a=$s.lodToRoughness(o,i);if(o>i-tg)r.roughness.value=a,this._renderCube(t,o,this._integrationMaterial);else{const c=a>0?Math.log2(e)+.5*Math.log2(6/(Ju*Math.pow(a,4)))+.5:0;s.roughness.value=a,s.lodBias.value=c,this._renderCube(t,o,this._ggxMaterial)}}}_blur(t,e){this._blurMaterial===null&&(this._blurMaterial=rg());const i=this._blurMaterial,s=i.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(t,0,i),s.envMap.value=t.texture,this._renderCube(r,0,i)}}function lh(n,t,e){return new Ql(n,{minFilter:Si,generateMipmaps:t,type:wn,colorSpace:ps,depthBuffer:e})}function sr(n,t,e){return new Kn({name:n,uniforms:t,vertexShader:ge.cube_vert,fragmentShader:e,side:un,blending:Fi,depthTest:!1,depthWrite:!1})}function ig(){return sr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Ju}u

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
	`)}function sg(){return sr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Qu}},`

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
	`)}function rg(){return sr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${j1}
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
	`)}function ch(){return sr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function hh(){return sr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function og(n){let t=new WeakMap,e=new WeakMap,i=null;function s(f,u=!1){return f==null?null:u?o(f):r(f)}function r(f){if(f&&f.isTexture){const u=f.mapping;if(u===wo||u===To)if(t.has(f)){const p=t.get(f).texture;return a(p,f.mapping)}else{const p=f.image;if(p&&p.height>0){const _=new Ql(p.height);return _.fromEquirectangularTexture(n,f),t.set(f,_),f.addEventListener("dispose",l),a(_.texture,f.mapping)}else return null}}return f}function o(f){if(f&&f.isTexture&&f.isPMREMTexture!==!0){const u=f.mapping,p=u===wo||u===To,_=u===fs||u===Vs;if(p||_){let m=e.get(f);const g=m!==void 0?m.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==g)return i===null&&(i=new $s(n)),m=p?i.fromEquirectangular(f,m):i.fromCubemap(f,m),m.texture.pmremVersion=f.pmremVersion,e.set(f,m),m.texture;if(m!==void 0)return m.texture;{const x=f.image;return p&&x&&x.height>0||_&&x&&c(x)?(i===null&&(i=new $s(n)),m=p?i.fromEquirectangular(f):i.fromCubemap(f),m.texture.pmremVersion=f.pmremVersion,e.set(f,m),f.addEventListener("dispose",h),m.texture):null}}}return f}function a(f,u){return u===wo?f.mapping=fs:u===To&&(f.mapping=Vs),f}function c(f){let u=0;const p=6;for(let _=0;_<p;_++)f[_]!==void 0&&u++;return u===p}function l(f){const u=f.target;u.removeEventListener("dispose",l);const p=t.get(u);p!==void 0&&(t.delete(u),p.dispose())}function h(f){const u=f.target;u.removeEventListener("dispose",h);const p=e.get(u);p!==void 0&&(e.delete(u),p.dispose())}function d(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:d}}function ag(n){const t={};function e(i){if(t[i]!==void 0)return t[i];const s=n.getExtension(i);return t[i]=s,s}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){const s=e(i);return s===null&&cs("WebGLRenderer: "+i+" extension not supported."),s}}}function lg(n,t,e,i){const s={},r=new WeakMap,o=new FinalizationRegistry(p=>delete s[p]);function a(p){c(p.target)}function c(p){p.index!==null&&t.remove(p.index);for(const m in p.attributes)t.remove(p.attributes[m]);p.removeEventListener("dispose",a),delete s[p.id],o.unregister(p);const _=r.get(p);_&&(t.remove(_),r.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,e.memory.geometries--}function l(p,_){return s[_.id]!==void 0||(_.addEventListener("dispose",a),s[_.id]=new WeakRef(_),o.register(_,_.id,_),e.memory.geometries++),_}function h(p){const _=p.attributes;for(const m in _)t.update(_[m],n.ARRAY_BUFFER)}function d(p){const _=p.index,m=p.attributes.position;let g=0;if(m===void 0)return;const x=_!==null?_.array.length:m.array.length/3-1,S=m.count>=65535?Iu:Du,v=new S(Math.ceil(x/3)*6,1),A=v.array;if(_!==null){const M=_.array;g=_.version;for(let E=0,D=0;E<x;E+=3){const C=M[E+0],I=M[E+1],F=M[E+2];A[D++]=C,A[D++]=I,A[D++]=I,A[D++]=F,A[D++]=F,A[D++]=C}}else{g=m.version;for(let M=0,E=0;M<x;M+=3){const D=M+0,C=M+1,I=M+2;A[E++]=D,A[E++]=C,A[E++]=C,A[E++]=I,A[E++]=I,A[E++]=D}}v.version=g;const T=r.get(p);T&&t.remove(T),r.set(p,v)}function f(p){const _=r.get(p);if(_){const m=p.index;m!==null&&_.version<m.version&&d(p)}else d(p);return r.get(p)}function u(){for(const p in s){const _=s[p].deref();_!==void 0&&c(_)}}return{get:l,update:h,getWireframeAttribute:f,dispose:u}}function cg(n,t,e){let i;function s(d){i=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function c(d,f){n.drawElements(i,f,r,d*o),e.update(f,i,1)}function l(d,f,u){u!==0&&(n.drawElementsInstanced(i,f,r,d*o,u),e.update(f,i,u))}function h(d,f,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,r,d,0,u);let _=0;for(let m=0;m<u;m++)_+=f[m];e.update(_,i,1)}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function hg(n){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(e.calls++,o){case n.TRIANGLES:e.triangles+=a*(r/3);break;case n.LINES:e.lines+=a*(r/2);break;case n.LINE_STRIP:e.lines+=a*(r-1);break;case n.LINE_LOOP:e.lines+=a*r;break;case n.POINTS:e.points+=a*r;break;default:Se("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:i}}function ug(n,t,e){const i=new WeakMap,s=new ze;function r(o,a,c){const l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0;let f=i.get(a);if(f===void 0||f.count!==d){let D=function(){M.dispose(),i.delete(a),a.removeEventListener("dispose",D)};f!==void 0&&f.texture.dispose();const u=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],x=a.morphAttributes.color||[];let S=0;u===!0&&(S=1),p===!0&&(S=2),_===!0&&(S=3);let v=a.attributes.position.count*S,A=1;v>t.maxTextureSize&&(A=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);const T=new Float32Array(v*A*4*d),M=new Pu(T,v,A,d);M.type=Wn,M.needsUpdate=!0;const E=S*4;for(let C=0;C<d;C++){const I=m[C],F=g[C],G=x[C],U=v*A*4*C;for(let N=0;N<I.count;N++){const H=N*E;u===!0&&(s.fromBufferAttribute(I,N),T[U+H+0]=s.x,T[U+H+1]=s.y,T[U+H+2]=s.z,T[U+H+3]=0),p===!0&&(s.fromBufferAttribute(F,N),T[U+H+4]=s.x,T[U+H+5]=s.y,T[U+H+6]=s.z,T[U+H+7]=0),_===!0&&(s.fromBufferAttribute(G,N),T[U+H+8]=s.x,T[U+H+9]=s.y,T[U+H+10]=s.z,T[U+H+11]=G.itemSize===4?s.w:1)}}f={count:d,texture:M,size:new ut(v,A)},i.set(a,f),a.addEventListener("dispose",D)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",o.morphTexture,e);else{let u=0;for(let _=0;_<l.length;_++)u+=l[_];const p=a.morphTargetsRelative?1:1-u;c.getUniforms().setValue(n,"morphTargetBaseInfluence",p),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",f.texture,e),c.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:r}}function fg(n,t,e,i,s){let r=new WeakMap;function o(l){const h=s.render.frame,d=l.geometry,f=t.get(l,d);if(r.get(f)!==h&&(t.update(f),r.set(f,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(e.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){const u=l.skeleton;r.get(u)!==h&&(u.update(),r.set(u,h))}return f}function a(){r=new WeakMap}function c(l){const h=l.target;h.removeEventListener("dispose",c),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}const dg={[El]:"LINEAR_TONE_MAPPING",[bl]:"REINHARD_TONE_MAPPING",[wl]:"CINEON_TONE_MAPPING",[Tl]:"ACES_FILMIC_TONE_MAPPING",[go]:"AGX_TONE_MAPPING",[Rl]:"NEUTRAL_TONE_MAPPING",[Al]:"CUSTOM_TONE_MAPPING"};function pg(n,t,e,i,s,r){const o=new bn(t,e,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let a=null,c=null,l=null;const h=new Ce;h.setAttribute("position",new ae([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new ae([0,2,0,0,2,0],2));const d=new qu({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),f=new De(h,d),u=new Jl(-1,1,1,-1,0,1);let p=null,_=null,m=!1,g,x=null,S=[],v=!1;this.setSize=function(A,T){o.setSize(A,T),a!==null&&a.setSize(A,T),c!==null&&c.setSize(A,T);for(let M=0;M<S.length;M++){const E=S[M];E.setSize&&E.setSize(A,T)}},this.setEffects=function(A){S=A,v=S.length>0&&S[0].isRenderPass===!0;const T=o.width,M=o.height;S.length>0&&a===null&&(a=new bn(T,M,{type:wn,depthBuffer:!1,stencilBuffer:!1}),c=new bn(T,M,{type:wn,depthBuffer:!1,stencilBuffer:!1}));const E=s===!0&&S.some(D=>D.needsDepthTexture===!0);E!==(o.depthTexture!==null)&&(E===!0&&l===null&&(l=new ms(T,M),r===!0&&(l.format=yi,l.type=ds)),o.dispose(),o.depthTexture=E?l:null,o.resolveDepthBuffer=E,o.storeMultisampledDepthBuffer=E);for(let D=0;D<S.length;D++){const C=S[D];C.setSize&&C.setSize(T,M),E&&C.needsDepthTexture===!0&&C.setDepthTexture&&C.setDepthTexture(l)}},this.begin=function(A,T){if(m||A.toneMapping===ci&&S.length===0)return!1;if(x=T,T!==null){const M=T.width,E=T.height;(o.width!==M||o.height!==E)&&this.setSize(M,E)}return v===!1&&A.setRenderTarget(o),g=A.toneMapping,A.toneMapping=ci,!0},this.hasRenderPass=function(){return v},this.end=function(A,T){A.toneMapping=g,m=!0;let M=o,E=a;for(let D=0;D<S.length;D++){const C=S[D];C.enabled!==!1&&(C.render(A,E,M,T),C.needsSwap!==!1&&(M=E,E=E===a?c:a))}if(p!==A.outputColorSpace||_!==A.toneMapping){p=A.outputColorSpace,_=A.toneMapping,d.defines={},xe.getTransfer(p)===Te&&(d.defines.SRGB_TRANSFER="");const D=dg[_];D&&(d.defines[D]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=M.texture,A.setRenderTarget(x),A.render(f,u),x=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),c!==null&&c.dispose(),h.dispose(),d.dispose()}}const ju=new fn,tf=new ms(1,1),ef=new Uu(1),nf=new Pu,sf=new jd,rf=new Nu,uh=[],fh=[],dh=new Float32Array(16),ph=new Float32Array(9),mh=new Float32Array(4);function Ss(n,t,e){const i=n[0];if(i<=0||i>0)return n;const s=t*e;let r=uh[s];if(r===void 0&&(r=new Float32Array(s),uh[s]=r),t!==0){i.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,n[o].toArray(r,a)}return r}function qe(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function Ze(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function Mo(n,t){let e=fh[t];e===void 0&&(e=new Int32Array(t),fh[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function mg(n,t){const e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function gg(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(qe(e,t))return;n.uniform2fv(this.addr,t),Ze(e,t)}}function _g(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(qe(e,t))return;n.uniform3fv(this.addr,t),Ze(e,t)}}function xg(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(qe(e,t))return;n.uniform4fv(this.addr,t),Ze(e,t)}}function vg(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(qe(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),Ze(e,t)}else{if(qe(e,i))return;mh.set(i),n.uniformMatrix2fv(this.addr,!1,mh),Ze(e,i)}}function Mg(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(qe(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),Ze(e,t)}else{if(qe(e,i))return;ph.set(i),n.uniformMatrix3fv(this.addr,!1,ph),Ze(e,i)}}function Sg(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(qe(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),Ze(e,t)}else{if(qe(e,i))return;dh.set(i),n.uniformMatrix4fv(this.addr,!1,dh),Ze(e,i)}}function yg(n,t){const e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function Eg(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(qe(e,t))return;n.uniform2iv(this.addr,t),Ze(e,t)}}function bg(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(qe(e,t))return;n.uniform3iv(this.addr,t),Ze(e,t)}}function wg(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(qe(e,t))return;n.uniform4iv(this.addr,t),Ze(e,t)}}function Tg(n,t){const e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function Ag(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(qe(e,t))return;n.uniform2uiv(this.addr,t),Ze(e,t)}}function Rg(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(qe(e,t))return;n.uniform3uiv(this.addr,t),Ze(e,t)}}function Cg(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(qe(e,t))return;n.uniform4uiv(this.addr,t),Ze(e,t)}}function So(n){return n.version===0&&(n.compareFunction=Ru,n.needsUpdate=!0),n}function Pg(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?r=So(tf):r=ju,e.setTexture2D(t||r,s)}function Lg(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture3D(t||sf,s)}function Dg(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_CUBE_SHADOW?r=So(ef):r=rf,e.setTextureCube(t||r,s)}function Ig(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture2DArray(t||nf,s)}function Ng(n){switch(n){case 5126:return mg;case 35664:return gg;case 35665:return _g;case 35666:return xg;case 35674:return vg;case 35675:return Mg;case 35676:return Sg;case 5124:case 35670:return yg;case 35667:case 35671:return Eg;case 35668:case 35672:return bg;case 35669:case 35673:return wg;case 5125:return Tg;case 36294:return Ag;case 36295:return Rg;case 36296:return Cg;case 35678:case 36198:case 36298:case 36306:case 35682:return Pg;case 35679:case 36299:case 36307:return Lg;case 35680:case 36300:case 36308:case 36293:return Dg;case 36289:case 36303:case 36311:case 36292:return Ig}}function Ug(n,t){n.uniform1fv(this.addr,t)}function Og(n,t){const e=Ss(t,this.size,2);n.uniform2fv(this.addr,e)}function Fg(n,t){const e=Ss(t,this.size,3);n.uniform3fv(this.addr,e)}function zg(n,t){const e=Ss(t,this.size,4);n.uniform4fv(this.addr,e)}function Bg(n,t){const e=Ss(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function Hg(n,t){const e=Ss(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function kg(n,t){const e=Ss(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function Gg(n,t){n.uniform1iv(this.addr,t)}function Vg(n,t){n.uniform2iv(this.addr,t)}function Wg(n,t){n.uniform3iv(this.addr,t)}function Xg(n,t){n.uniform4iv(this.addr,t)}function Yg(n,t){n.uniform1uiv(this.addr,t)}function qg(n,t){n.uniform2uiv(this.addr,t)}function Zg(n,t){n.uniform3uiv(this.addr,t)}function Kg(n,t){n.uniform4uiv(this.addr,t)}function $g(n,t,e){const i=this.cache,s=t.length,r=Mo(e,s);qe(i,r)||(n.uniform1iv(this.addr,r),Ze(i,r));let o;this.type===n.SAMPLER_2D_SHADOW?o=So(tf):o=ju;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function Jg(n,t,e){const i=this.cache,s=t.length,r=Mo(e,s);qe(i,r)||(n.uniform1iv(this.addr,r),Ze(i,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||sf,r[o])}function Qg(n,t,e){const i=this.cache,s=t.length,r=Mo(e,s);qe(i,r)||(n.uniform1iv(this.addr,r),Ze(i,r));let o;this.type===n.SAMPLER_CUBE_SHADOW?o=So(ef):o=rf;for(let a=0;a!==s;++a)e.setTextureCube(t[a]||o,r[a])}function jg(n,t,e){const i=this.cache,s=t.length,r=Mo(e,s);qe(i,r)||(n.uniform1iv(this.addr,r),Ze(i,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||nf,r[o])}function t_(n){switch(n){case 5126:return Ug;case 35664:return Og;case 35665:return Fg;case 35666:return zg;case 35674:return Bg;case 35675:return Hg;case 35676:return kg;case 5124:case 35670:return Gg;case 35667:case 35671:return Vg;case 35668:case 35672:return Wg;case 35669:case 35673:return Xg;case 5125:return Yg;case 36294:return qg;case 36295:return Zg;case 36296:return Kg;case 35678:case 36198:case 36298:case 36306:case 35682:return $g;case 35679:case 36299:case 36307:return Jg;case 35680:case 36300:case 36308:case 36293:return Qg;case 36289:case 36303:case 36311:case 36292:return jg}}class e_{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=Ng(e.type)}}class n_{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=t_(e.type)}}class i_{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],i)}}}const ea=/(\w+)(\])?(\[|\.)?/g;function gh(n,t){n.seq.push(t),n.map[t.id]=t}function s_(n,t,e){const i=n.name,s=i.length;for(ea.lastIndex=0;;){const r=ea.exec(i),o=ea.lastIndex;let a=r[1];const c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){gh(e,l===void 0?new e_(a,n,t):new n_(a,n,t));break}else{let d=e.map[a];d===void 0&&(d=new i_(a),gh(e,d)),e=d}}}class Yr{constructor(t,e){this.seq=[],this.map={};const i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=t.getActiveUniform(e,o),c=t.getUniformLocation(e,a.name);s_(a,c,this)}const s=[],r=[];for(const o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,i,s){const r=this.map[e];r!==void 0&&r.setValue(t,i,s)}setOptional(t,e,i){const s=e[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,e,i,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],c=i[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,s)}}static seqWithValue(t,e){const i=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&i.push(o)}return i}}function _h(n,t,e){const i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}const r_=37297;let o_=0;function a_(n,t){const e=n.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}const xh=new re;function l_(n){xe._getMatrix(xh,xe.workingColorSpace,n);const t=`mat3( ${xh.elements.map(e=>e.toFixed(4))} )`;switch(xe.getTransfer(n)){case to:return[t,"LinearTransferOETF"];case Te:return[t,"sRGBTransferOETF"];default:return te("WebGLProgram: Unsupported color space: ",n),[t,"LinearTransferOETF"]}}function vh(n,t,e){const i=n.getShaderParameter(t,n.COMPILE_STATUS),r=(n.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+a_(n.getShaderSource(t),a)}else return r}function c_(n,t){const e=l_(t);return[`vec4 ${n}( vec4 value ) {`,`	return ${e[1]}( vec4( ${e[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const h_={[El]:"Linear",[bl]:"Reinhard",[wl]:"Cineon",[Tl]:"ACESFilmic",[go]:"AgX",[Rl]:"Neutral",[Al]:"Custom"};function u_(n,t){const e=h_[t];return e===void 0?(te("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Ur=new b;function f_(){xe.getLuminanceCoefficients(Ur);const n=Ur.x.toFixed(4),t=Ur.y.toFixed(4),e=Ur.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function d_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ds).join(`
`)}function p_(n){const t=[];for(const e in n){const i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function m_(n,t){const e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(t,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:n.getAttribLocation(t,o),locationSize:a}}return e}function Ds(n){return n!==""}function Mh(n,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function Sh(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const g_=/^[ \t]*#include +<([\w\d./]+)>/gm;function ol(n){return n.replace(g_,__)}function __(n,t){const e=ge[t];if(e===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">");return ol(e)}const x_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function yh(n){return n.replace(x_,v_)}function v_(n,t,e,i){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Eh(n){let t=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}const M_={[Os]:"SHADOWMAP_TYPE_PCF",[Ps]:"SHADOWMAP_TYPE_VSM"};function S_(n){return M_[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const y_={[Vs]:"ENVMAP_MODE_REFRACTION"};function E_(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":y_[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const b_={[_u]:"ENVMAP_BLENDING_MULTIPLY",[Ad]:"ENVMAP_BLENDING_MIX",[Rd]:"ENVMAP_BLENDING_ADD"};function w_(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":b_[n.combine]||"ENVMAP_BLENDING_NONE"}function T_(n,t,e,i){const s=n.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const c=S_(e),l=e.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",h=E_(e),d=w_(e),f=d_(e),u=p_(r),p=s.createProgram();let _,m,g=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(_=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u].filter(Ds).join(`
`),_.length>0&&(_+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u].filter(Ds).join(`
`),m.length>0&&(m+=`
`)):(_=[Eh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+e.diffuseRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ds).join(`
`),m=[Eh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",e.envMapPMREM?"#define ENVMAP_MAX_LOD "+e.envMapMaxLod+".0":"",e.envMapPMREM?"#define ENVMAP_SIZE "+e.envMapSize+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ci?"#define TONE_MAPPING":"",e.toneMapping!==ci?ge.tonemapping_pars_fragment:"",e.toneMapping!==ci?u_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ge.colorspace_pars_fragment,c_("linearToOutputTexel",e.outputColorSpace),f_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ds).join(`
`)),o=ol(o),o=Mh(o,e),o=Sh(o,e),a=ol(a),a=Mh(a,e),a=Sh(a,e),o=yh(o),a=yh(a),e.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,_=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,m=["#define varying in",e.glslVersion===yc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===yc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const x=g+_+o,S=g+m+a,v=_h(s,s.VERTEX_SHADER,x),A=_h(s,s.FRAGMENT_SHADER,S);s.attachShader(p,v),s.attachShader(p,A),e.index0AttributeName!==void 0?s.bindAttribLocation(p,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(p,0,"position"),s.linkProgram(p);function T(C){if(n.debug.checkShaderErrors){const I=s.getProgramInfoLog(p)||"",F=s.getShaderInfoLog(v)||"",G=s.getShaderInfoLog(A)||"",U=I.trim(),N=F.trim(),H=G.trim();let k=!0,it=!0;if(s.getProgramParameter(p,s.LINK_STATUS)===!1)if(k=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,p,v,A);else{const P=vh(s,v,"vertex"),B=vh(s,A,"fragment");Se("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(p,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+U+`
`+P+`
`+B)}else U!==""?te("WebGLProgram: Program Info Log:",U):(N===""||H==="")&&(it=!1);it&&(C.diagnostics={runnable:k,programLog:U,vertexShader:{log:N,prefix:_},fragmentShader:{log:H,prefix:m}})}s.deleteShader(v),s.deleteShader(A),M=new Yr(s,p),E=m_(s,p)}let M;this.getUniforms=function(){return M===void 0&&T(this),M};let E;this.getAttributes=function(){return E===void 0&&T(this),E};let D=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=s.getProgramParameter(p,r_)),D},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(p),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=o_++,this.cacheKey=t,this.usedTimes=1,this.program=p,this.vertexShader=v,this.fragmentShader=A,this}let A_=0;class R_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){const s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){const e=this.shaderCache;let i=e.get(t);return i===void 0&&(i=new C_(t),e.set(t,i)),i}}class C_{constructor(t){this.id=A_++,this.code=t,this.usedTimes=0}}function P_(n){return n===Hi||n===Qr||n===jr}function L_(n,t,e,i,s,r){const o=new Fl,a=new R_,c=new Set,l=[],h=new Map,d=i.logarithmicDepthBuffer,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function u(M){return c.add(M),M===0?"uv":`uv${M}`}function p(M,E,D,C,I,F){const G=C.fog,U=I.geometry,N=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?C.environment:null,H=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap,k=t.get(M.envMap||N,H),it=f[M.type];let P=i.precision;M.precision!==null&&(P=i.getMaxPrecision(M.precision),P!==M.precision&&te("WebGLProgram.getParameters:",M.precision,"not supported, using",P,"instead."));const B=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,V=B!==void 0?B.length:0;let st=0;U.morphAttributes.position!==void 0&&(st=1),U.morphAttributes.normal!==void 0&&(st=2),U.morphAttributes.color!==void 0&&(st=3);let gt,X,nt,lt;if(it){const Ct=Vn[it];gt=Ct.vertexShader,X=Ct.fragmentShader}else{gt=M.vertexShader,X=M.fragmentShader;const Ct=a.getVertexShaderStage(M),de=a.getFragmentShaderStage(M);a.update(M,Ct,de),nt=Ct.id,lt=de.id}const Dt=n.getRenderTarget(),St=n.state.buffers.depth.getReversed(),Gt=I.isInstancedMesh===!0,Ht=I.isBatchedMesh===!0,It=!!M.map,Xt=!!M.matcap,Qt=!!k,J=Qt&&k.isPMREMTexture===!0,ft=!!M.aoMap,dt=!!M.lightMap,bt=!!M.bumpMap&&M.wireframe===!1,yt=!!M.normalMap,$t=!!M.displacementMap,zt=!!M.emissiveMap,ue=!!M.metalnessMap,fe=!!M.roughnessMap,ve=M.anisotropy>0,L=M.clearcoat>0,ht=M.diffuseRoughness>0,Mt=M.dispersion>0,qt=M.retroreflectivity>0,ot=M.iridescence>0,Jt=M.sheen>0,Tt=M.transmission>0,Rt=ve&&!!M.anisotropyMap,R=L&&!!M.clearcoatMap,y=L&&!!M.clearcoatNormalMap,W=L&&!!M.clearcoatRoughnessMap,at=ht&&!!M.diffuseRoughnessMap,tt=ot&&!!M.iridescenceMap,xt=ot&&!!M.iridescenceThicknessMap,vt=Jt&&!!M.sheenColorMap,Z=Jt&&!!M.sheenRoughnessMap,K=!!M.specularMap,mt=!!M.specularColorMap,O=!!M.specularIntensityMap,et=Tt&&!!M.transmissionMap,Q=Tt&&!!M.thicknessMap,pt=!!M.gradientMap,_t=!!M.alphaMap,j=M.alphaTest>0,Et=!!M.alphaHash,Ot=!!M.extensions;let rt=ci;M.toneMapped&&(Dt===null||Dt.isXRRenderTarget===!0)&&(rt=n.toneMapping);const Bt=J?k.isCompressedCubeTexture?k.image[0].mipmaps:k.mipmaps:null,Zt={shaderID:it,shaderType:M.type,shaderName:M.name,vertexShader:gt,fragmentShader:X,defines:M.defines,customVertexShaderID:nt,customFragmentShaderID:lt,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:P,batching:Ht,batchingColor:Ht&&I._colorsTexture!==null,instancing:Gt,instancingColor:Gt&&I.instanceColor!==null,instancingMorph:Gt&&I.morphTexture!==null,outputColorSpace:Dt===null?n.outputColorSpace:Dt.isXRRenderTarget===!0?Dt.texture.colorSpace:xe.workingColorSpace,alphaToCoverage:!!M.alphaToCoverage,map:It,matcap:Xt,envMap:Qt,envMapMode:Qt&&k.mapping,envMapPMREM:J,envMapMaxLod:J?Bt.length-1:null,envMapSize:J?Bt[0].width:null,aoMap:ft,lightMap:dt,bumpMap:bt,normalMap:yt,displacementMap:$t,emissiveMap:zt,normalMapObjectSpace:yt&&M.normalMapType===Ld,normalMapTangentSpace:yt&&M.normalMapType===tl,packedNormalMap:yt&&M.normalMapType===tl&&P_(M.normalMap.format),metalnessMap:ue,roughnessMap:fe,anisotropy:ve,anisotropyMap:Rt,clearcoat:L,clearcoatMap:R,clearcoatNormalMap:y,clearcoatRoughnessMap:W,diffuseRoughness:ht,diffuseRoughnessMap:at,dispersion:Mt,retroreflection:qt,iridescence:ot,iridescenceMap:tt,iridescenceThicknessMap:xt,sheen:Jt,sheenColorMap:vt,sheenRoughnessMap:Z,specularMap:K,specularColorMap:mt,specularIntensityMap:O,transmission:Tt,transmissionMap:et,thicknessMap:Q,gradientMap:pt,opaque:M.transparent===!1&&M.blending===Fs&&M.alphaToCoverage===!1,alphaMap:_t,alphaTest:j,alphaHash:Et,combine:M.combine,mapUv:It&&u(M.map.channel),aoMapUv:ft&&u(M.aoMap.channel),lightMapUv:dt&&u(M.lightMap.channel),bumpMapUv:bt&&u(M.bumpMap.channel),normalMapUv:yt&&u(M.normalMap.channel),displacementMapUv:$t&&u(M.displacementMap.channel),emissiveMapUv:zt&&u(M.emissiveMap.channel),metalnessMapUv:ue&&u(M.metalnessMap.channel),roughnessMapUv:fe&&u(M.roughnessMap.channel),anisotropyMapUv:Rt&&u(M.anisotropyMap.channel),clearcoatMapUv:R&&u(M.clearcoatMap.channel),clearcoatNormalMapUv:y&&u(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:W&&u(M.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:at&&u(M.diffuseRoughnessMap.channel),iridescenceMapUv:tt&&u(M.iridescenceMap.channel),iridescenceThicknessMapUv:xt&&u(M.iridescenceThicknessMap.channel),sheenColorMapUv:vt&&u(M.sheenColorMap.channel),sheenRoughnessMapUv:Z&&u(M.sheenRoughnessMap.channel),specularMapUv:K&&u(M.specularMap.channel),specularColorMapUv:mt&&u(M.specularColorMap.channel),specularIntensityMapUv:O&&u(M.specularIntensityMap.channel),transmissionMapUv:et&&u(M.transmissionMap.channel),thicknessMapUv:Q&&u(M.thicknessMap.channel),alphaMapUv:_t&&u(M.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(yt||ve),vertexNormals:!!U.attributes.normal,vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!U.attributes.uv&&(It||_t),fog:!!G,useFog:M.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:M.wireframe===!1&&(M.flatShading===!0||U.attributes.normal===void 0&&yt===!1&&(M.isMeshLambertMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isMeshPhysicalMaterial)),sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:St,skinning:I.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:V,morphTextureStride:st,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:F.filter(Ct=>Ct.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:M.dithering,shadowMapEnabled:n.shadowMap.enabled&&D.length>0,shadowMapType:n.shadowMap.type,toneMapping:rt,decodeVideoTexture:It&&M.map.isVideoTexture===!0&&xe.getTransfer(M.map.colorSpace)===Te,decodeVideoTextureEmissive:zt&&M.emissiveMap.isVideoTexture===!0&&xe.getTransfer(M.emissiveMap.colorSpace)===Te,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Dn,flipSided:M.side===un,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Ot&&M.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ot&&M.extensions.multiDraw===!0||Ht)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return Zt.vertexUv1s=c.has(1),Zt.vertexUv2s=c.has(2),Zt.vertexUv3s=c.has(3),c.clear(),Zt}function _(M){const E=[];if(M.shaderID?E.push(M.shaderID):(E.push(M.customVertexShaderID),E.push(M.customFragmentShaderID)),M.defines!==void 0)for(const D in M.defines)E.push(D),E.push(M.defines[D]);return M.isRawShaderMaterial===!1&&(m(E,M),g(E,M),E.push(n.outputColorSpace)),E.push(M.customProgramCacheKey),E.join()}function m(M,E){M.push(E.precision),M.push(E.outputColorSpace),M.push(E.envMapMode),M.push(E.envMapPMREM),M.push(E.envMapMaxLod),M.push(E.envMapSize),M.push(E.mapUv),M.push(E.alphaMapUv),M.push(E.lightMapUv),M.push(E.aoMapUv),M.push(E.bumpMapUv),M.push(E.normalMapUv),M.push(E.displacementMapUv),M.push(E.emissiveMapUv),M.push(E.metalnessMapUv),M.push(E.roughnessMapUv),M.push(E.anisotropyMapUv),M.push(E.clearcoatMapUv),M.push(E.clearcoatNormalMapUv),M.push(E.clearcoatRoughnessMapUv),M.push(E.diffuseRoughnessMapUv),M.push(E.iridescenceMapUv),M.push(E.iridescenceThicknessMapUv),M.push(E.sheenColorMapUv),M.push(E.sheenRoughnessMapUv),M.push(E.specularMapUv),M.push(E.specularColorMapUv),M.push(E.specularIntensityMapUv),M.push(E.transmissionMapUv),M.push(E.thicknessMapUv),M.push(E.combine),M.push(E.fogExp2),M.push(E.sizeAttenuation),M.push(E.morphTargetsCount),M.push(E.numSunLights),M.push(E.numDirLights),M.push(E.numPointLights),M.push(E.numSpotLights),M.push(E.numSpotLightMaps),M.push(E.numHemiLights),M.push(E.numRectAreaLights),M.push(E.numSunLightShadows),M.push(E.numDirLightShadows),M.push(E.numPointLightShadows),M.push(E.numSpotLightShadows),M.push(E.numSpotLightShadowsWithMaps),M.push(E.numLightProbes),M.push(E.numLightProbeGrids),M.push(E.shadowMapType),M.push(E.toneMapping),M.push(E.numClippingPlanes),M.push(E.numClipIntersection),M.push(E.depthPacking)}function g(M,E){o.disableAll(),E.instancing&&o.enable(0),E.instancingColor&&o.enable(1),E.instancingMorph&&o.enable(2),E.matcap&&o.enable(3),E.envMap&&o.enable(4),E.normalMapObjectSpace&&o.enable(5),E.normalMapTangentSpace&&o.enable(6),E.clearcoat&&o.enable(7),E.iridescence&&o.enable(8),E.alphaTest&&o.enable(9),E.vertexColors&&o.enable(10),E.vertexAlphas&&o.enable(11),E.vertexUv1s&&o.enable(12),E.vertexUv2s&&o.enable(13),E.vertexUv3s&&o.enable(14),E.vertexTangents&&o.enable(15),E.anisotropy&&o.enable(16),E.alphaHash&&o.enable(17),E.batching&&o.enable(18),E.dispersion&&o.enable(19),E.retroreflection&&o.enable(24),E.diffuseRoughness&&o.enable(25),E.batchingColor&&o.enable(20),E.gradientMap&&o.enable(21),E.packedNormalMap&&o.enable(22),E.vertexNormals&&o.enable(23),M.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reversedDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),E.numLightProbeGrids>0&&o.enable(22),E.hasPositionAttribute&&o.enable(23),M.push(o.mask)}function x(M){const E=f[M.type];let D;if(E){const C=Vn[E];D=Zl.clone(C.uniforms)}else D=M.uniforms;return D}function S(M,E){let D=h.get(E);return D!==void 0?++D.usedTimes:(D=new T_(n,E,M,s),l.push(D),h.set(E,D)),D}function v(M){if(--M.usedTimes===0){const E=l.indexOf(M);l[E]=l[l.length-1],l.pop(),h.delete(M.cacheKey),M.destroy()}}function A(M){a.remove(M)}function T(){a.dispose()}return{getParameters:p,getProgramCacheKey:_,getUniforms:x,acquireProgram:S,releaseProgram:v,releaseShaderCache:A,programs:l,dispose:T}}function D_(){let n=new WeakMap;function t(o){return n.has(o)}function e(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,c){n.get(o)[a]=c}function r(){n=new WeakMap}return{has:t,get:e,remove:i,update:s,dispose:r}}function I_(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.materialVariant!==t.materialVariant?n.materialVariant-t.materialVariant:n.z!==t.z?n.z-t.z:n.id-t.id}function bh(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function wh(){const n=[];let t=0;const e=[],i=[],s=[];function r(){t=0,e.length=0,i.length=0,s.length=0}function o(f){let u=0;return f.isInstancedMesh&&(u+=2),f.isSkinnedMesh&&(u+=1),u}function a(f,u,p,_,m,g){let x=n[t];return x===void 0?(x={id:f.id,object:f,geometry:u,material:p,materialVariant:o(f),groupOrder:_,renderOrder:f.renderOrder,z:m,group:g},n[t]=x):(x.id=f.id,x.object=f,x.geometry=u,x.material=p,x.materialVariant=o(f),x.groupOrder=_,x.renderOrder=f.renderOrder,x.z=m,x.group=g),t++,x}function c(f,u,p,_,m,g,x){x.reversedDepth===!0&&(m=-m);const S=a(f,u,p,_,m,g);p.transmission>0?i.push(S):p.transparent===!0?s.push(S):e.push(S)}function l(f,u,p,_,m,g){const x=a(f,u,p,_,m,g);p.transmission>0?i.unshift(x):p.transparent===!0?s.unshift(x):e.unshift(x)}function h(f,u){e.length>1&&e.sort(f||I_),i.length>1&&i.sort(u||bh),s.length>1&&s.sort(u||bh)}function d(){for(let f=t,u=n.length;f<u;f++){const p=n[f];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:i,transparent:s,init:r,push:c,unshift:l,finish:d,sort:h}}function N_(){let n=new WeakMap;function t(i,s){const r=n.get(i);let o;return r===void 0?(o=new wh,n.set(i,[o])):s>=r.length?(o=new wh,r.push(o)):o=r[s],o}function e(){n=new WeakMap}return{get:t,dispose:e}}function U_(){const n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new b,color:new ee};break;case"SpotLight":e={position:new b,direction:new b,color:new ee,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new b,color:new ee,distance:0,decay:0};break;case"HemisphereLight":e={direction:new b,skyColor:new ee,groundColor:new ee};break;case"RectAreaLight":e={color:new ee,position:new b,halfWidth:new b,halfHeight:new b};break}return n[t.id]=e,e}}}function O_(){const n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ut};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ut};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ut,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}let F_=0;function z_(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function B_(n){const t=new U_,e=O_(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new b);const s=new b,r=new Kt,o=new Kt;function a(l){let h=0,d=0,f=0;for(let F=0;F<9;F++)i.probe[F].set(0,0,0);let u=0,p=0,_=0,m=0,g=0,x=0,S=0,v=0,A=0,T=0,M=0,E=0,D=0,C=0;l.sort(z_);for(let F=0,G=l.length;F<G;F++){const U=l[F],N=U.color,H=U.intensity,k=U.distance;let it=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===Hi?it=U.shadow.map.texture:it=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)h+=N.r*H,d+=N.g*H,f+=N.b*H;else if(U.isLightProbe){for(let P=0;P<9;P++)i.probe[P].addScaledVector(U.sh.coefficients[P],H);C++}else if(U.isSunLight){const P=t.get(U);if(P.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const B=U.shadow,V=e.get(U);V.shadowIntensity=B.intensity,V.shadowBias=B.bias,V.shadowNormalBias=B.normalBias,V.shadowRadius=B.radius,V.shadowMapSize.copy(B.mapSize).multiply(B.getFrameExtents()),i.sunShadow[p]=V,i.sunShadowMap[p]=it;const st=B.getViewportCount();for(let gt=0;gt<st;gt++)i.sunShadowMatrix[_+gt]=B.getMatrix(gt),i.sunShadowCascade[_+gt]=B._cascadeData[gt];_+=st,p++}i.sun[u]=P,u++}else if(U.isDirectionalLight){const P=t.get(U);if(P.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const B=U.shadow,V=e.get(U);V.shadowIntensity=B.intensity,V.shadowBias=B.bias,V.shadowNormalBias=B.normalBias,V.shadowRadius=B.radius,V.shadowMapSize=B.mapSize,i.directionalShadow[m]=V,i.directionalShadowMap[m]=it,i.directionalShadowMatrix[m]=U.shadow.matrix,A++}i.directional[m]=P,m++}else if(U.isSpotLight){const P=t.get(U);P.position.setFromMatrixPosition(U.matrixWorld),P.color.copy(N).multiplyScalar(H),P.distance=k,P.coneCos=Math.cos(U.angle),P.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),P.decay=U.decay,i.spot[x]=P;const B=U.shadow;if(U.map&&(i.spotLightMap[E]=U.map,E++,B.updateMatrices(U),U.castShadow&&D++),i.spotLightMatrix[x]=B.matrix,U.castShadow){const V=e.get(U);V.shadowIntensity=B.intensity,V.shadowBias=B.bias,V.shadowNormalBias=B.normalBias,V.shadowRadius=B.radius,V.shadowMapSize=B.mapSize,i.spotShadow[x]=V,i.spotShadowMap[x]=it,M++}x++}else if(U.isRectAreaLight){const P=t.get(U);P.color.copy(N).multiplyScalar(H),P.halfWidth.set(U.width*.5,0,0),P.halfHeight.set(0,U.height*.5,0),i.rectArea[S]=P,S++}else if(U.isPointLight){const P=t.get(U);if(P.color.copy(U.color).multiplyScalar(U.intensity),P.distance=U.distance,P.decay=U.decay,U.castShadow){const B=U.shadow,V=e.get(U);V.shadowIntensity=B.intensity,V.shadowBias=B.bias,V.shadowNormalBias=B.normalBias,V.shadowRadius=B.radius,V.shadowMapSize=B.mapSize,V.shadowCameraNear=B.camera.near,V.shadowCameraFar=B.camera.far,i.pointShadow[g]=V,i.pointShadowMap[g]=it,i.pointShadowMatrix[g]=U.shadow.matrix,T++}i.point[g]=P,g++}else if(U.isHemisphereLight){const P=t.get(U);P.skyColor.copy(U.color).multiplyScalar(H),P.groundColor.copy(U.groundColor).multiplyScalar(H),i.hemi[v]=P,v++}}S>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Nt.LTC_FLOAT_1,i.rectAreaLTC2=Nt.LTC_FLOAT_2):(i.rectAreaLTC1=Nt.LTC_HALF_1,i.rectAreaLTC2=Nt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=f;const I=i.hash;(I.sunLength!==u||I.directionalLength!==m||I.pointLength!==g||I.spotLength!==x||I.rectAreaLength!==S||I.hemiLength!==v||I.numSunShadows!==p||I.numDirectionalShadows!==A||I.numPointShadows!==T||I.numSpotShadows!==M||I.numSpotMaps!==E||I.numLightProbes!==C)&&(i.sun.length=u,i.directional.length=m,i.spot.length=x,i.rectArea.length=S,i.point.length=g,i.hemi.length=v,i.sunShadow.length=p,i.sunShadowMap.length=p,i.sunShadowMatrix.length=_,i.sunShadowCascade.length=_,i.directionalShadow.length=A,i.directionalShadowMap.length=A,i.directionalShadowMatrix.length=A,i.pointShadow.length=T,i.pointShadowMap.length=T,i.pointShadowMatrix.length=T,i.spotShadow.length=M,i.spotShadowMap.length=M,i.spotLightMatrix.length=M+E-D,i.spotLightMap.length=E,i.numSpotLightShadowsWithMaps=D,i.numLightProbes=C,I.sunLength=u,I.directionalLength=m,I.pointLength=g,I.spotLength=x,I.rectAreaLength=S,I.hemiLength=v,I.numSunShadows=p,I.numDirectionalShadows=A,I.numPointShadows=T,I.numSpotShadows=M,I.numSpotMaps=E,I.numLightProbes=C,i.version=F_++)}function c(l,h){let d=0,f=0,u=0,p=0,_=0,m=0;const g=h.matrixWorldInverse;for(let x=0,S=l.length;x<S;x++){const v=l[x];if(v.isSunLight){const A=i.sun[d];A.direction.setFromMatrixPosition(v.matrixWorld),A.direction.transformDirection(g),d++}else if(v.isDirectionalLight){const A=i.directional[f];A.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(g),f++}else if(v.isSpotLight){const A=i.spot[p];A.position.setFromMatrixPosition(v.matrixWorld),A.position.applyMatrix4(g),A.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(g),p++}else if(v.isRectAreaLight){const A=i.rectArea[_];A.position.setFromMatrixPosition(v.matrixWorld),A.position.applyMatrix4(g),o.identity(),r.copy(v.matrixWorld),r.premultiply(g),o.extractRotation(r),A.halfWidth.set(v.width*.5,0,0),A.halfHeight.set(0,v.height*.5,0),A.halfWidth.applyMatrix4(o),A.halfHeight.applyMatrix4(o),_++}else if(v.isPointLight){const A=i.point[u];A.position.setFromMatrixPosition(v.matrixWorld),A.position.applyMatrix4(g),u++}else if(v.isHemisphereLight){const A=i.hemi[m];A.direction.setFromMatrixPosition(v.matrixWorld),A.direction.transformDirection(g),m++}}}return{setup:a,setupView:c,state:i}}function Th(n){const t=new B_(n),e=[],i=[],s=[];function r(d){h.camera=d,e.length=0,i.length=0,s.length=0}function o(d){d.isLightProbeGrid?s.push(d):e.push(d)}function a(d){i.push(d)}function c(){t.setup(e),s.sort((d,f)=>d.priority-f.priority||d.id-f.id)}function l(d){t.setupView(e,d)}const h={lightsArray:e,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:a}}function H_(n){let t=new WeakMap;function e(s,r=0){const o=t.get(s);let a;return o===void 0?(a=new Th(n),t.set(s,[a])):r>=o.length?(a=new Th(n),o.push(a)):a=o[r],a}function i(){t=new WeakMap}return{get:e,dispose:i}}const k_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,G_=`uniform sampler2D shadow_pass;
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
}`,V_=[new b(1,0,0),new b(-1,0,0),new b(0,1,0),new b(0,-1,0),new b(0,0,1),new b(0,0,-1)],W_=[new b(0,-1,0),new b(0,-1,0),new b(0,0,1),new b(0,0,-1),new b(0,-1,0),new b(0,-1,0)],Ah=new Kt,As=new b,na=new b;function X_(n,t,e){let i=new Ys;const s=new ut,r=new ut,o=new ze,a=new tp,c=new ep,l={},h=e.maxTextureSize,d={[Bi]:un,[un]:Bi,[Dn]:Dn},f=new Kn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ut},radius:{value:4}},vertexShader:k_,fragmentShader:G_}),u=f.clone();u.defines.HORIZONTAL_PASS=1;const p=new Ce;p.setAttribute("position",new Fn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new De(p,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Os;let g=this.type;this.render=function(T,M,E){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===ld&&(te("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Os);const D=n.getRenderTarget(),C=n.getActiveCubeFace(),I=n.getActiveMipmapLevel(),F=n.state;F.setBlending(Fi),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const G=g!==this.type;G&&M.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(N=>N.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,N=T.length;U<N;U++){const H=T[U],k=H.shadow;if(k===void 0){te("WebGLShadowMap:",H,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;s.copy(k.mapSize);const it=k.getFrameExtents();s.multiply(it),r.copy(k.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/it.x),s.x=r.x*it.x,k.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/it.y),s.y=r.y*it.y,k.mapSize.y=r.y));const P=n.state.buffers.depth.getReversed();if(k.camera._reversedDepth=P,k.map===null||G===!0){if(k.map!==null&&(k.map.depthTexture!==null&&(k.map.depthTexture.dispose(),k.map.depthTexture=null),k.map.dispose()),this.type===Ps){if(H.isPointLight){te("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new bn(s.x,s.y,{format:Hi,type:wn,minFilter:gn,magFilter:gn,generateMipmaps:!1}),k.map.texture.name=H.name+".shadowMap",k.map.depthTexture=new ms(s.x,s.y,Wn),k.map.depthTexture.name=H.name+".shadowMapDepth",k.map.depthTexture.format=wi,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=nn,k.map.depthTexture.magFilter=nn}else H.isPointLight?(k.map=new Ql(s.x),k.map.depthTexture=new Uu(s.x,Zn)):(k.map=new bn(s.x,s.y),k.map.depthTexture=new ms(s.x,s.y,Zn)),k.map.depthTexture.name=H.name+".shadowMap",k.map.depthTexture.format=wi,this.type===Os?(k.map.depthTexture.compareFunction=P?Au:Tu,k.map.depthTexture.minFilter=gn,k.map.depthTexture.magFilter=gn):(k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=nn,k.map.depthTexture.magFilter=nn);k.camera.updateProjectionMatrix()}k.map.isWebGLCubeRenderTarget!==!0&&(k.map.width!==s.x||k.map.height!==s.y)&&k.map.setSize(s.x,s.y);const B=k.map.isWebGLCubeRenderTarget?6:k.getViewportCount();H.isPointLight!==!0&&k.updateMatrices(H,E);const V=(k.camera.layers.mask&4294967294)!==0?k.camera.layers:E.layers;for(let st=0;st<B;st++){const gt=k.getCamera(st);if(H.isPointLight){const X=k.camera,nt=k.matrix,lt=H.distance||X.far;lt!==X.far&&(X.far=lt,X.updateProjectionMatrix()),As.setFromMatrixPosition(H.matrixWorld),X.position.copy(As),na.copy(X.position),na.add(V_[st]),X.up.copy(W_[st]),X.lookAt(na),X.updateMatrixWorld(),nt.makeTranslation(-As.x,-As.y,-As.z),Ah.multiplyMatrices(X.projectionMatrix,X.matrixWorldInverse),k._frustum.setFromProjectionMatrix(Ah,X.coordinateSystem,X.reversedDepth)}if(k.map.isWebGLCubeRenderTarget)n.setRenderTarget(k.map,st),n.clear();else{st===0&&(n.setRenderTarget(k.map),n.clear());const X=k.getViewport(st);o.set(r.x*X.x,r.y*X.y,r.x*X.z,r.y*X.w),F.viewport(o)}i=k.getFrustum(st),v(M,E,gt,H,V,this.type)}k.isPointLightShadow!==!0&&this.type===Ps&&x(k,E),k.needsUpdate=!1}g=this.type,m.needsUpdate=!1,n.setRenderTarget(D,C,I)};function x(T,M){const E=t.update(_);f.defines.VSM_SAMPLES!==T.blurSamples&&(f.defines.VSM_SAMPLES=T.blurSamples,u.defines.VSM_SAMPLES=T.blurSamples,f.needsUpdate=!0,u.needsUpdate=!0),T.mapPass===null?T.mapPass=new bn(s.x,s.y,{format:Hi,type:wn}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),f.uniforms.shadow_pass.value=T.map.depthTexture,f.uniforms.resolution.value.set(T.map.width,T.map.height),f.uniforms.radius.value=T.radius,n.setRenderTarget(T.mapPass),n.clear(),n.renderBufferDirect(M,null,E,f,_,null),u.uniforms.shadow_pass.value=T.mapPass.texture,u.uniforms.resolution.value.set(T.map.width,T.map.height),u.uniforms.radius.value=T.radius,n.setRenderTarget(T.map),n.clear(),n.renderBufferDirect(M,null,E,u,_,null)}function S(T,M,E,D){let C=null;const I=E.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(I!==void 0)C=I;else if(C=E.isPointLight===!0?c:a,n.localClippingEnabled&&M.clipShadows===!0&&Array.isArray(M.clippingPlanes)&&M.clippingPlanes.length!==0||M.displacementMap&&M.displacementScale!==0||M.alphaMap&&M.alphaTest>0||M.map&&M.alphaTest>0||M.alphaToCoverage===!0){const F=C.uuid,G=M.uuid;let U=l[F];U===void 0&&(U={},l[F]=U);let N=U[G];N===void 0&&(N=C.clone(),U[G]=N,M.addEventListener("dispose",A)),C=N}if(C.visible=M.visible,C.wireframe=M.wireframe,D===Ps?C.side=M.shadowSide!==null?M.shadowSide:M.side:C.side=M.shadowSide!==null?M.shadowSide:d[M.side],C.alphaMap=M.alphaMap,C.alphaTest=M.alphaToCoverage===!0?.5:M.alphaTest,C.map=M.map,C.clipShadows=M.clipShadows,C.clippingPlanes=M.clippingPlanes,C.clipIntersection=M.clipIntersection,C.displacementMap=M.displacementMap,C.displacementScale=M.displacementScale,C.displacementBias=M.displacementBias,C.wireframeLinewidth=M.wireframeLinewidth,C.linewidth=M.linewidth,E.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const F=n.properties.get(C);F.light=E}return C}function v(T,M,E,D,C,I){if(T.visible===!1)return;if(T.layers.test(C)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&I===Ps)&&(!T.frustumCulled||T.intersectsFrustum(i))){T.modelViewMatrix.multiplyMatrices(E.matrixWorldInverse,T.matrixWorld);const U=t.update(T),N=T.material;if(Array.isArray(N)){const H=U.groups;for(let k=0,it=H.length;k<it;k++){const P=H[k],B=N[P.materialIndex];if(B&&B.visible){const V=S(T,B,D,I);T.onBeforeShadow(n,T,M,E,U,V,P),n.renderBufferDirect(E,null,U,V,T,P),T.onAfterShadow(n,T,M,E,U,V,P)}}}else if(N.visible){const H=S(T,N,D,I);T.onBeforeShadow(n,T,M,E,U,H,null),n.renderBufferDirect(E,null,U,H,T,null),T.onAfterShadow(n,T,M,E,U,H,null)}}const G=T.children;for(let U=0,N=G.length;U<N;U++)v(G[U],M,E,D,C,I)}function A(T){T.target.removeEventListener("dispose",A);for(const E in l){const D=l[E],C=T.target.uuid;C in D&&(D[C].dispose(),delete D[C])}}}function Y_(n,t){function e(){let O=!1;const et=new ze;let Q=null;const pt=new ze(0,0,0,0);return{setMask:function(_t){Q!==_t&&!O&&(n.colorMask(_t,_t,_t,_t),Q=_t)},setLocked:function(_t){O=_t},setClear:function(_t,j,Et,Ot,rt){rt===!0&&(_t*=Ot,j*=Ot,Et*=Ot),et.set(_t,j,Et,Ot),pt.equals(et)===!1&&(n.clearColor(_t,j,Et,Ot),pt.copy(et))},reset:function(){O=!1,Q=null,pt.set(-1,0,0,0)}}}function i(){let O=!1,et=!1,Q=null,pt=null,_t=null;return{setReversed:function(j){if(et!==j){const Et=t.get("EXT_clip_control");j?Et.clipControlEXT(Et.LOWER_LEFT_EXT,Et.ZERO_TO_ONE_EXT):Et.clipControlEXT(Et.LOWER_LEFT_EXT,Et.NEGATIVE_ONE_TO_ONE_EXT),et=j;const Ot=_t;_t=null,this.setClear(Ot)}},getReversed:function(){return et},setTest:function(j){j?St(n.DEPTH_TEST):Gt(n.DEPTH_TEST)},setMask:function(j){Q!==j&&!O&&(n.depthMask(j),Q=j)},setFunc:function(j){if(et&&(j=Gd[j]),pt!==j){switch(j){case ma:n.depthFunc(n.NEVER);break;case ga:n.depthFunc(n.ALWAYS);break;case _a:n.depthFunc(n.LESS);break;case Gs:n.depthFunc(n.LEQUAL);break;case xa:n.depthFunc(n.EQUAL);break;case va:n.depthFunc(n.GEQUAL);break;case Ma:n.depthFunc(n.GREATER);break;case Sa:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}pt=j}},setLocked:function(j){O=j},setClear:function(j){_t!==j&&(_t=j,et&&(j=1-j),n.clearDepth(j))},reset:function(){O=!1,Q=null,pt=null,_t=null,et=!1}}}function s(){let O=!1,et=null,Q=null,pt=null,_t=null,j=null,Et=null,Ot=null,rt=null;return{setTest:function(Bt){O||(Bt?St(n.STENCIL_TEST):Gt(n.STENCIL_TEST))},setMask:function(Bt){et!==Bt&&!O&&(n.stencilMask(Bt),et=Bt)},setFunc:function(Bt,Zt,Ct){(Q!==Bt||pt!==Zt||_t!==Ct)&&(n.stencilFunc(Bt,Zt,Ct),Q=Bt,pt=Zt,_t=Ct)},setOp:function(Bt,Zt,Ct){(j!==Bt||Et!==Zt||Ot!==Ct)&&(n.stencilOp(Bt,Zt,Ct),j=Bt,Et=Zt,Ot=Ct)},setLocked:function(Bt){O=Bt},setClear:function(Bt){rt!==Bt&&(n.clearStencil(Bt),rt=Bt)},reset:function(){O=!1,et=null,Q=null,pt=null,_t=null,j=null,Et=null,Ot=null,rt=null}}}const r=new e,o=new i,a=new s;let c={};const l=new WeakMap;let h={},d={},f={},u=new WeakMap,p=[],_=null,m=!1,g=null,x=null,S=null,v=null,A=null,T=null,M=null,E=new ee(0,0,0),D=0,C=!1,I=null,F=null,G=null,U=null,N=null;const H=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let k=!1,it=0;const P=n.getParameter(n.VERSION);P.indexOf("WebGL")!==-1?(it=parseFloat(/^WebGL (\d)/.exec(P)[1]),k=it>=1):P.indexOf("OpenGL ES")!==-1&&(it=parseFloat(/^OpenGL ES (\d)/.exec(P)[1]),k=it>=2);let B=null,V={};const st=n.getParameter(n.SCISSOR_BOX),gt=n.getParameter(n.VIEWPORT),X=new ze().fromArray(st),nt=new ze().fromArray(gt);function lt(O,et,Q,pt){const _t=new Uint8Array(4),j=n.createTexture();n.bindTexture(O,j),n.texParameteri(O,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(O,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Et=0;Et<Q;Et++)O===n.TEXTURE_3D||O===n.TEXTURE_2D_ARRAY?n.texImage3D(et,0,n.RGBA,1,1,pt,0,n.RGBA,n.UNSIGNED_BYTE,_t):n.texImage2D(et+Et,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,_t);return j}const Dt={};Dt[n.TEXTURE_2D]=lt(n.TEXTURE_2D,n.TEXTURE_2D,1),Dt[n.TEXTURE_CUBE_MAP]=lt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Dt[n.TEXTURE_2D_ARRAY]=lt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Dt[n.TEXTURE_3D]=lt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),St(n.DEPTH_TEST),o.setFunc(Gs),bt(!1),yt(xc),St(n.CULL_FACE),ft(Fi);function St(O){h[O]!==!0&&(n.enable(O),h[O]=!0)}function Gt(O){h[O]!==!1&&(n.disable(O),h[O]=!1)}function Ht(O,et){return f[O]!==et?(n.bindFramebuffer(O,et),f[O]=et,O===n.DRAW_FRAMEBUFFER&&(f[n.FRAMEBUFFER]=et),O===n.FRAMEBUFFER&&(f[n.DRAW_FRAMEBUFFER]=et),!0):!1}function It(O,et){let Q=p,pt=!1;if(O){Q=u.get(et),Q===void 0&&(Q=[],u.set(et,Q));const _t=O.textures;if(Q.length!==_t.length||Q[0]!==n.COLOR_ATTACHMENT0){for(let j=0,Et=_t.length;j<Et;j++)Q[j]=n.COLOR_ATTACHMENT0+j;Q.length=_t.length,pt=!0}}else Q[0]!==n.BACK&&(Q[0]=n.BACK,pt=!0);pt&&n.drawBuffers(Q)}function Xt(O){return _!==O?(n.useProgram(O),_=O,!0):!1}const Qt={[ss]:n.FUNC_ADD,[hd]:n.FUNC_SUBTRACT,[ud]:n.FUNC_REVERSE_SUBTRACT};Qt[fd]=n.MIN,Qt[dd]=n.MAX;const J={[pd]:n.ZERO,[md]:n.ONE,[gd]:n.SRC_COLOR,[mu]:n.SRC_ALPHA,[yd]:n.SRC_ALPHA_SATURATE,[Md]:n.DST_COLOR,[xd]:n.DST_ALPHA,[_d]:n.ONE_MINUS_SRC_COLOR,[gu]:n.ONE_MINUS_SRC_ALPHA,[Sd]:n.ONE_MINUS_DST_COLOR,[vd]:n.ONE_MINUS_DST_ALPHA,[Ed]:n.CONSTANT_COLOR,[bd]:n.ONE_MINUS_CONSTANT_COLOR,[wd]:n.CONSTANT_ALPHA,[Td]:n.ONE_MINUS_CONSTANT_ALPHA};function ft(O,et,Q,pt,_t,j,Et,Ot,rt,Bt){if(O===Fi){m===!0&&(Gt(n.BLEND),m=!1);return}if(m===!1&&(St(n.BLEND),m=!0),O!==cd){if(O!==g||Bt!==C){if((x!==ss||A!==ss)&&(n.blendEquation(n.FUNC_ADD),x=ss,A=ss),Bt)switch(O){case Fs:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case vc:n.blendFunc(n.ONE,n.ONE);break;case Mc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Sc:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Se("WebGLState: Invalid blending: ",O);break}else switch(O){case Fs:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case vc:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Mc:Se("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Sc:Se("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Se("WebGLState: Invalid blending: ",O);break}S=null,v=null,T=null,M=null,E.set(0,0,0),D=0,g=O,C=Bt}return}_t=_t||et,j=j||Q,Et=Et||pt,(et!==x||_t!==A)&&(n.blendEquationSeparate(Qt[et],Qt[_t]),x=et,A=_t),(Q!==S||pt!==v||j!==T||Et!==M)&&(n.blendFuncSeparate(J[Q],J[pt],J[j],J[Et]),S=Q,v=pt,T=j,M=Et),(Ot.equals(E)===!1||rt!==D)&&(n.blendColor(Ot.r,Ot.g,Ot.b,rt),E.copy(Ot),D=rt),g=O,C=!1}function dt(O,et){O.side===Dn?Gt(n.CULL_FACE):St(n.CULL_FACE);let Q=O.side===un;et&&(Q=!Q),bt(Q),O.blending===Fs&&O.transparent===!1?ft(Fi):ft(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),o.setFunc(O.depthFunc),o.setTest(O.depthTest),o.setMask(O.depthWrite),r.setMask(O.colorWrite);const pt=O.stencilWrite;a.setTest(pt),pt&&(a.setMask(O.stencilWriteMask),a.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),a.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),zt(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?St(n.SAMPLE_ALPHA_TO_COVERAGE):Gt(n.SAMPLE_ALPHA_TO_COVERAGE)}function bt(O){I!==O&&(O?n.frontFace(n.CW):n.frontFace(n.CCW),I=O)}function yt(O){O!==od?(St(n.CULL_FACE),O!==F&&(O===xc?n.cullFace(n.BACK):O===ad?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Gt(n.CULL_FACE),F=O}function $t(O){O!==G&&(k&&n.lineWidth(O),G=O)}function zt(O,et,Q){O?(St(n.POLYGON_OFFSET_FILL),(U!==et||N!==Q)&&(U=et,N=Q,o.getReversed()&&(et=-et,Q=-Q),n.polygonOffset(et,Q))):Gt(n.POLYGON_OFFSET_FILL)}function ue(O){O?St(n.SCISSOR_TEST):Gt(n.SCISSOR_TEST)}function fe(O){O===void 0&&(O=n.TEXTURE0+H-1),B!==O&&(n.activeTexture(O),B=O)}function ve(O,et,Q){Q===void 0&&(B===null?Q=n.TEXTURE0+H-1:Q=B);let pt=V[Q];pt===void 0&&(pt={type:void 0,texture:void 0},V[Q]=pt),(pt.type!==O||pt.texture!==et)&&(B!==Q&&(n.activeTexture(Q),B=Q),n.bindTexture(O,et||Dt[O]),pt.type=O,pt.texture=et)}function L(){const O=V[B];O!==void 0&&O.type!==void 0&&(n.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function ht(){try{n.compressedTexImage2D(...arguments)}catch(O){Se("WebGLState:",O)}}function Mt(){try{n.compressedTexImage3D(...arguments)}catch(O){Se("WebGLState:",O)}}function qt(){try{n.texSubImage2D(...arguments)}catch(O){Se("WebGLState:",O)}}function ot(){try{n.texSubImage3D(...arguments)}catch(O){Se("WebGLState:",O)}}function Jt(){try{n.compressedTexSubImage2D(...arguments)}catch(O){Se("WebGLState:",O)}}function Tt(){try{n.compressedTexSubImage3D(...arguments)}catch(O){Se("WebGLState:",O)}}function Rt(){try{n.texStorage2D(...arguments)}catch(O){Se("WebGLState:",O)}}function R(){try{n.texStorage3D(...arguments)}catch(O){Se("WebGLState:",O)}}function y(){try{n.texImage2D(...arguments)}catch(O){Se("WebGLState:",O)}}function W(){try{n.texImage3D(...arguments)}catch(O){Se("WebGLState:",O)}}function at(O){return d[O]!==void 0?d[O]:n.getParameter(O)}function tt(O,et){d[O]!==et&&(n.pixelStorei(O,et),d[O]=et)}function xt(O){X.equals(O)===!1&&(n.scissor(O.x,O.y,O.z,O.w),X.copy(O))}function vt(O){nt.equals(O)===!1&&(n.viewport(O.x,O.y,O.z,O.w),nt.copy(O))}function Z(O,et){let Q=l.get(et);Q===void 0&&(Q=new WeakMap,l.set(et,Q));let pt=Q.get(O);pt===void 0&&(pt=n.getUniformBlockIndex(et,O.name),n.uniformBlockBinding(et,pt,pt),Q.set(O,pt))}function K(O,et,Q){const _t=l.get(et).get(O);c[_t]!==Q&&(n.bindBufferBase(n.UNIFORM_BUFFER,_t,Q),c[_t]=Q)}function mt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),h={},d={},B=null,V={},f={},c={},u=new WeakMap,p=[],_=null,m=!1,g=null,x=null,S=null,v=null,A=null,T=null,M=null,E=new ee(0,0,0),D=0,C=!1,I=null,F=null,G=null,U=null,N=null,X.set(0,0,n.canvas.width,n.canvas.height),nt.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:St,disable:Gt,bindFramebuffer:Ht,drawBuffers:It,useProgram:Xt,setBlending:ft,setMaterial:dt,setFlipSided:bt,setCullFace:yt,setLineWidth:$t,setPolygonOffset:zt,setScissorTest:ue,activeTexture:fe,bindTexture:ve,unbindTexture:L,compressedTexImage2D:ht,compressedTexImage3D:Mt,texImage2D:y,texImage3D:W,pixelStorei:tt,getParameter:at,updateUBOMapping:Z,uniformBlockBinding:K,texStorage2D:Rt,texStorage3D:R,texSubImage2D:qt,texSubImage3D:ot,compressedTexSubImage2D:Jt,compressedTexSubImage3D:Tt,scissor:xt,viewport:vt,reset:mt}}function q_(n,t,e,i,s,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ut,h=new WeakMap,d=new Set;let f;const u=new WeakMap,p=new Set,_=new FinalizationRegistry(R=>p.delete(R));let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,y){return m?new OffscreenCanvas(R,y):eo("canvas")}function x(R,y,W){let at=1;const tt=Rt(R);if((tt.width>W||tt.height>W)&&(at=W/Math.max(tt.width,tt.height)),at<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const xt=Math.floor(at*tt.width),vt=Math.floor(at*tt.height);f===void 0&&(f=g(xt,vt));const Z=y?g(xt,vt):f;return Z.width=xt,Z.height=vt,Z.getContext("2d").drawImage(R,0,0,xt,vt),te("WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+xt+"x"+vt+")."),Z}else return"data"in R&&te("WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),R;return R}function S(R){return R.generateMipmaps}function v(R){n.generateMipmap(R)}function A(R){return R.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?n.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function T(R,y,W,at,tt,xt=!1){if(R!==null){if(n[R]!==void 0)return n[R];te("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let vt;at&&(vt=t.get("EXT_texture_norm16"),vt||te("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=y;if(y===n.RED&&(W===n.FLOAT&&(Z=n.R32F),W===n.HALF_FLOAT&&(Z=n.R16F),W===n.UNSIGNED_BYTE&&(Z=n.R8),W===n.UNSIGNED_SHORT&&vt&&(Z=vt.R16_EXT),W===n.SHORT&&vt&&(Z=vt.R16_SNORM_EXT)),y===n.RED_INTEGER&&(W===n.UNSIGNED_BYTE&&(Z=n.R8UI),W===n.UNSIGNED_SHORT&&(Z=n.R16UI),W===n.UNSIGNED_INT&&(Z=n.R32UI),W===n.BYTE&&(Z=n.R8I),W===n.SHORT&&(Z=n.R16I),W===n.INT&&(Z=n.R32I)),y===n.RG&&(W===n.FLOAT&&(Z=n.RG32F),W===n.HALF_FLOAT&&(Z=n.RG16F),W===n.UNSIGNED_BYTE&&(Z=n.RG8),W===n.UNSIGNED_SHORT&&vt&&(Z=vt.RG16_EXT),W===n.SHORT&&vt&&(Z=vt.RG16_SNORM_EXT)),y===n.RG_INTEGER&&(W===n.UNSIGNED_BYTE&&(Z=n.RG8UI),W===n.UNSIGNED_SHORT&&(Z=n.RG16UI),W===n.UNSIGNED_INT&&(Z=n.RG32UI),W===n.BYTE&&(Z=n.RG8I),W===n.SHORT&&(Z=n.RG16I),W===n.INT&&(Z=n.RG32I)),y===n.RGB_INTEGER&&(W===n.UNSIGNED_BYTE&&(Z=n.RGB8UI),W===n.UNSIGNED_SHORT&&(Z=n.RGB16UI),W===n.UNSIGNED_INT&&(Z=n.RGB32UI),W===n.BYTE&&(Z=n.RGB8I),W===n.SHORT&&(Z=n.RGB16I),W===n.INT&&(Z=n.RGB32I)),y===n.RGBA_INTEGER&&(W===n.UNSIGNED_BYTE&&(Z=n.RGBA8UI),W===n.UNSIGNED_SHORT&&(Z=n.RGBA16UI),W===n.UNSIGNED_INT&&(Z=n.RGBA32UI),W===n.BYTE&&(Z=n.RGBA8I),W===n.SHORT&&(Z=n.RGBA16I),W===n.INT&&(Z=n.RGBA32I)),y===n.RGB&&(W===n.UNSIGNED_SHORT&&vt&&(Z=vt.RGB16_EXT),W===n.SHORT&&vt&&(Z=vt.RGB16_SNORM_EXT),W===n.UNSIGNED_INT_5_9_9_9_REV&&(Z=n.RGB9_E5),W===n.UNSIGNED_INT_10F_11F_11F_REV&&(Z=n.R11F_G11F_B10F)),y===n.RGBA){const K=xt?to:xe.getTransfer(tt);W===n.FLOAT&&(Z=n.RGBA32F),W===n.HALF_FLOAT&&(Z=n.RGBA16F),W===n.UNSIGNED_BYTE&&(Z=K===Te?n.SRGB8_ALPHA8:n.RGBA8),W===n.UNSIGNED_SHORT&&vt&&(Z=vt.RGBA16_EXT),W===n.SHORT&&vt&&(Z=vt.RGBA16_SNORM_EXT),W===n.UNSIGNED_SHORT_4_4_4_4&&(Z=n.RGBA4),W===n.UNSIGNED_SHORT_5_5_5_1&&(Z=n.RGB5_A1)}return(Z===n.R16F||Z===n.R32F||Z===n.RG16F||Z===n.RG32F||Z===n.RGBA16F||Z===n.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function M(R,y){let W;return R?y===null||y===Zn||y===ds?W=n.DEPTH24_STENCIL8:y===Wn?W=n.DEPTH32F_STENCIL8:y===Ws&&(W=n.DEPTH24_STENCIL8,te("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===Zn||y===ds?W=n.DEPTH_COMPONENT24:y===Wn?W=n.DEPTH_COMPONENT32F:y===Ws&&(W=n.DEPTH_COMPONENT16),W}function E(R,y){return S(R)===!0||R.isFramebufferTexture&&R.minFilter!==nn&&R.minFilter!==gn?Math.log2(Math.max(y.width,y.height))+1:R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?y.mipmaps.length:1}function D(R){const y=new WeakRef(R);i.get(R).__ref=y,p.add(y),_.register(R,y,y)}function C(R){const y=i.get(R).__ref;y!==void 0&&(p.delete(y),_.unregister(y))}function I(R){G(R.target)}function F(R){U(R.target)}function G(R){R.removeEventListener("dispose",I),C(R),H(R),R.isVideoTexture&&h.delete(R),R.isHTMLTexture&&d.delete(R)}function U(R){R.removeEventListener("dispose",F),C(R),it(R)}function N(){for(const R of p){const y=R.deref();y!==void 0&&(y.isRenderTarget===!0?U(y):G(y))}p.clear(),d.clear()}function H(R){const y=i.get(R);if(y.__webglInit===void 0)return;const W=R.source,at=u.get(W);if(at){const tt=at[y.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&k(R),Object.keys(at).length===0&&u.delete(W)}i.remove(R)}function k(R){const y=i.get(R);n.deleteTexture(y.__webglTexture);const W=R.source,at=u.get(W);delete at[y.__cacheKey],o.memory.textures--}function it(R){const y=i.get(R);y.__depthDisposeCallback&&y.__depthDisposeCallback();const W=R.depthTexture;if(W&&W.renderTarget===R&&G(W),R.isWebGLCubeRenderTarget)for(let tt=0;tt<6;tt++){if(Array.isArray(y.__webglFramebuffer[tt]))for(let xt=0;xt<y.__webglFramebuffer[tt].length;xt++)n.deleteFramebuffer(y.__webglFramebuffer[tt][xt]);else n.deleteFramebuffer(y.__webglFramebuffer[tt]);y.__webglDepthbuffer&&n.deleteRenderbuffer(y.__webglDepthbuffer[tt])}else{if(Array.isArray(y.__webglFramebuffer))for(let tt=0;tt<y.__webglFramebuffer.length;tt++)n.deleteFramebuffer(y.__webglFramebuffer[tt]);else n.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&n.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&n.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let tt=0;tt<y.__webglColorRenderbuffer.length;tt++)y.__webglColorRenderbuffer[tt]&&n.deleteRenderbuffer(y.__webglColorRenderbuffer[tt]);y.__webglDepthRenderbuffer&&n.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const at=R.textures;for(let tt=0,xt=at.length;tt<xt;tt++){const vt=i.get(at[tt]);vt.__webglTexture&&(n.deleteTexture(vt.__webglTexture),o.memory.textures--),i.remove(at[tt])}i.remove(R)}let P=0;function B(){P=0}function V(){return P}function st(R){P=R}function gt(){const R=P;return R>=s.maxTextures&&te("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),P+=1,R}function X(R){const y=[];return y.push(R.wrapS),y.push(R.wrapT),y.push(R.wrapR||0),y.push(R.magFilter),y.push(R.minFilter),y.push(R.anisotropy),y.push(R.internalFormat),y.push(R.format),y.push(R.type),y.push(R.generateMipmaps),y.push(R.mipmapsAutoUpdate),y.push(R.premultiplyAlpha),y.push(R.flipY),y.push(R.unpackAlignment),y.push(R.colorSpace),y.join()}function nt(R,y){const W=i.get(R);if(R.isVideoTexture&&Jt(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&W.__version!==R.version){const at=R.image;if(at===null)te("WebGLRenderer: Texture marked for update but no image data found.");else if(at.complete===!1)te("WebGLRenderer: Texture marked for update but image is incomplete");else{dt(W,R,y);return}}else R.isExternalTexture&&(W.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(n.TEXTURE_2D,W.__webglTexture,n.TEXTURE0+y)}function lt(R,y){const W=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&W.__version!==R.version){dt(W,R,y);return}else R.isExternalTexture&&(W.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(n.TEXTURE_2D_ARRAY,W.__webglTexture,n.TEXTURE0+y)}function Dt(R,y){const W=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&W.__version!==R.version){dt(W,R,y);return}e.bindTexture(n.TEXTURE_3D,W.__webglTexture,n.TEXTURE0+y)}function St(R,y){const W=i.get(R);if(R.version>0&&W.__version!==R.version){bt(W,R,y);return}e.bindTexture(n.TEXTURE_CUBE_MAP,W.__webglTexture,n.TEXTURE0+y)}const Gt={[ya]:n.REPEAT,[oi]:n.CLAMP_TO_EDGE,[Ea]:n.MIRRORED_REPEAT},Ht={[nn]:n.NEAREST,[Cd]:n.NEAREST_MIPMAP_NEAREST,[hr]:n.NEAREST_MIPMAP_LINEAR,[gn]:n.LINEAR,[Ao]:n.LINEAR_MIPMAP_NEAREST,[Si]:n.LINEAR_MIPMAP_LINEAR},It={[Id]:n.NEVER,[Ru]:n.ALWAYS,[Nd]:n.LESS,[Tu]:n.LEQUAL,[Ud]:n.EQUAL,[Au]:n.GEQUAL,[Od]:n.GREATER,[Fd]:n.NOTEQUAL};function Xt(R,y){if(y.type===Wn&&t.has("OES_texture_float_linear")===!1&&(y.magFilter===gn||y.magFilter===Ao||y.magFilter===hr||y.magFilter===Si||y.minFilter===gn||y.minFilter===Ao||y.minFilter===hr||y.minFilter===Si)&&te("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(R,n.TEXTURE_WRAP_S,Gt[y.wrapS]),n.texParameteri(R,n.TEXTURE_WRAP_T,Gt[y.wrapT]),(R===n.TEXTURE_3D||R===n.TEXTURE_2D_ARRAY)&&n.texParameteri(R,n.TEXTURE_WRAP_R,Gt[y.wrapR]),n.texParameteri(R,n.TEXTURE_MAG_FILTER,Ht[y.magFilter]),n.texParameteri(R,n.TEXTURE_MIN_FILTER,Ht[y.minFilter]),y.compareFunction&&(n.texParameteri(R,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(R,n.TEXTURE_COMPARE_FUNC,It[y.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===nn||y.minFilter!==hr&&y.minFilter!==Si||y.type===Wn&&t.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||i.get(y).__currentAnisotropy){const W=t.get("EXT_texture_filter_anisotropic");n.texParameterf(R,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),i.get(y).__currentAnisotropy=y.anisotropy}}}function Qt(R,y){let W=!1;R.__webglInit===void 0&&(R.__webglInit=!0,y.addEventListener("dispose",I),D(y));const at=y.source;let tt=u.get(at);tt===void 0&&(tt={},u.set(at,tt));const xt=X(y);if(xt!==R.__cacheKey){tt[xt]===void 0&&(tt[xt]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,W=!0),tt[xt].usedTimes++;const vt=tt[R.__cacheKey];vt!==void 0&&(tt[R.__cacheKey].usedTimes--,vt.usedTimes===0&&k(y)),R.__cacheKey=xt,R.__webglTexture=tt[xt].texture}return W}function J(R,y,W){return Math.floor(Math.floor(R/W)/y)}function ft(R,y,W,at){const xt=R.updateRanges;if(xt.length===0)e.texSubImage2D(n.TEXTURE_2D,0,0,0,y.width,y.height,W,at,y.data);else{xt.sort((O,et)=>O.start-et.start);let vt=0;for(let O=1;O<xt.length;O++){const et=xt[vt],Q=xt[O],pt=et.start+et.count,_t=J(Q.start,y.width,4),j=J(et.start,y.width,4);Q.start<=pt+1&&_t===j&&J(Q.start+Q.count-1,y.width,4)===_t?et.count=Math.max(et.count,Q.start+Q.count-et.start):(++vt,xt[vt]=Q)}xt.length=vt+1;const Z=e.getParameter(n.UNPACK_ROW_LENGTH),K=e.getParameter(n.UNPACK_SKIP_PIXELS),mt=e.getParameter(n.UNPACK_SKIP_ROWS);e.pixelStorei(n.UNPACK_ROW_LENGTH,y.width);for(let O=0,et=xt.length;O<et;O++){const Q=xt[O],pt=Math.floor(Q.start/4),_t=Math.ceil(Q.count/4),j=pt%y.width,Et=Math.floor(pt/y.width),Ot=_t,rt=1;e.pixelStorei(n.UNPACK_SKIP_PIXELS,j),e.pixelStorei(n.UNPACK_SKIP_ROWS,Et),e.texSubImage2D(n.TEXTURE_2D,0,j,Et,Ot,rt,W,at,y.data)}R.clearUpdateRanges(),e.pixelStorei(n.UNPACK_ROW_LENGTH,Z),e.pixelStorei(n.UNPACK_SKIP_PIXELS,K),e.pixelStorei(n.UNPACK_SKIP_ROWS,mt)}}function dt(R,y,W){let at=n.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(at=n.TEXTURE_2D_ARRAY),y.isData3DTexture&&(at=n.TEXTURE_3D);const tt=Qt(R,y),xt=y.source;e.bindTexture(at,R.__webglTexture,n.TEXTURE0+W);const vt=i.get(xt);if(xt.version!==vt.__version||tt===!0){if(e.activeTexture(n.TEXTURE0+W),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){const rt=xe.getPrimaries(xe.workingColorSpace),Bt=y.colorSpace===Mi?null:xe.getPrimaries(y.colorSpace),Zt=y.colorSpace===Mi||rt===Bt?n.NONE:n.BROWSER_DEFAULT_WEBGL;e.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,y.flipY),e.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),e.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Zt)}e.pixelStorei(n.UNPACK_ALIGNMENT,y.unpackAlignment);let K=x(y.image,!1,s.maxTextureSize);K=Tt(y,K);const mt=r.convert(y.format,y.colorSpace),O=r.convert(y.type);let et=T(y.internalFormat,mt,O,y.normalized,y.colorSpace,y.isVideoTexture);Xt(at,y);let Q;const pt=y.mipmaps,_t=y.isVideoTexture!==!0,j=vt.__version===void 0||tt===!0,Et=xt.dataReady,Ot=E(y,K);if(y.isDepthTexture)et=M(y.format===yi,y.type),j&&(_t?e.texStorage2D(n.TEXTURE_2D,1,et,K.width,K.height):e.texImage2D(n.TEXTURE_2D,0,et,K.width,K.height,0,mt,O,null));else if(y.isDataTexture)if(pt.length>0){_t&&j&&e.texStorage2D(n.TEXTURE_2D,Ot,et,pt[0].width,pt[0].height);for(let rt=0,Bt=pt.length;rt<Bt;rt++)Q=pt[rt],_t?Et&&e.texSubImage2D(n.TEXTURE_2D,rt,0,0,Q.width,Q.height,mt,O,Q.data):e.texImage2D(n.TEXTURE_2D,rt,et,Q.width,Q.height,0,mt,O,Q.data);y.generateMipmaps=!1}else _t?(j&&e.texStorage2D(n.TEXTURE_2D,Ot,et,K.width,K.height),Et&&ft(y,K,mt,O)):e.texImage2D(n.TEXTURE_2D,0,et,K.width,K.height,0,mt,O,K.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){_t&&j&&e.texStorage3D(n.TEXTURE_2D_ARRAY,Ot,et,pt[0].width,pt[0].height,K.depth);for(let rt=0,Bt=pt.length;rt<Bt;rt++)if(Q=pt[rt],y.format!==Xn)if(mt!==null)if(_t){if(Et)if(y.layerUpdates.size>0){const Zt=oh(Q.width,Q.height,y.format,y.type);for(const Ct of y.layerUpdates){const de=Q.data.subarray(Ct*Zt/Q.data.BYTES_PER_ELEMENT,(Ct+1)*Zt/Q.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,rt,0,0,Ct,Q.width,Q.height,1,mt,de)}}else e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,rt,0,0,0,Q.width,Q.height,K.depth,mt,Q.data)}else e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,rt,et,Q.width,Q.height,K.depth,0,Q.data,0,0);else te("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else _t?Et&&e.texSubImage3D(n.TEXTURE_2D_ARRAY,rt,0,0,0,Q.width,Q.height,K.depth,mt,O,Q.data):e.texImage3D(n.TEXTURE_2D_ARRAY,rt,et,Q.width,Q.height,K.depth,0,mt,O,Q.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{_t&&j&&e.texStorage2D(n.TEXTURE_2D,Ot,et,pt[0].width,pt[0].height);for(let rt=0,Bt=pt.length;rt<Bt;rt++)Q=pt[rt],y.format!==Xn?mt!==null?_t?Et&&e.compressedTexSubImage2D(n.TEXTURE_2D,rt,0,0,Q.width,Q.height,mt,Q.data):e.compressedTexImage2D(n.TEXTURE_2D,rt,et,Q.width,Q.height,0,Q.data):te("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):_t?Et&&e.texSubImage2D(n.TEXTURE_2D,rt,0,0,Q.width,Q.height,mt,O,Q.data):e.texImage2D(n.TEXTURE_2D,rt,et,Q.width,Q.height,0,mt,O,Q.data)}else if(y.isDataArrayTexture)if(_t){if(j&&e.texStorage3D(n.TEXTURE_2D_ARRAY,Ot,et,K.width,K.height,K.depth),Et)if(y.layerUpdates.size>0){const rt=oh(K.width,K.height,y.format,y.type);for(const Bt of y.layerUpdates){const Zt=K.data.subarray(Bt*rt/K.data.BYTES_PER_ELEMENT,(Bt+1)*rt/K.data.BYTES_PER_ELEMENT);e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,Bt,K.width,K.height,1,mt,O,Zt)}y.clearLayerUpdates()}else e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,mt,O,K.data)}else e.texImage3D(n.TEXTURE_2D_ARRAY,0,et,K.width,K.height,K.depth,0,mt,O,K.data);else if(y.isData3DTexture)_t?(j&&e.texStorage3D(n.TEXTURE_3D,Ot,et,K.width,K.height,K.depth),Et&&e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,mt,O,K.data)):e.texImage3D(n.TEXTURE_3D,0,et,K.width,K.height,K.depth,0,mt,O,K.data);else if(y.isFramebufferTexture){if(j)if(_t)e.texStorage2D(n.TEXTURE_2D,Ot,et,K.width,K.height);else{let rt=K.width,Bt=K.height;for(let Zt=0;Zt<Ot;Zt++)e.texImage2D(n.TEXTURE_2D,Zt,et,rt,Bt,0,mt,O,null),rt>>=1,Bt>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in n){const rt=n.canvas;if(rt.hasAttribute("layoutsubtree")||rt.setAttribute("layoutsubtree","true"),K.parentNode!==rt){rt.appendChild(K),d.add(y),rt.onpaint=Bt=>{const Zt=Bt.changedElements;for(const Ct of d)Zt.includes(Ct.image)&&(Ct.needsUpdate=!0)},rt.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,K);else{const Zt=n.RGBA,Ct=n.RGBA,de=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Zt,Ct,de,K)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(pt.length>0){if(_t&&j){const rt=Rt(pt[0]);e.texStorage2D(n.TEXTURE_2D,Ot,et,rt.width,rt.height)}for(let rt=0,Bt=pt.length;rt<Bt;rt++)Q=pt[rt],_t?Et&&e.texSubImage2D(n.TEXTURE_2D,rt,0,0,mt,O,Q):e.texImage2D(n.TEXTURE_2D,rt,et,mt,O,Q);y.generateMipmaps=!1}else if(_t){if(j){const rt=Rt(K);e.texStorage2D(n.TEXTURE_2D,Ot,et,rt.width,rt.height)}Et&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,mt,O,K)}else e.texImage2D(n.TEXTURE_2D,0,et,mt,O,K);S(y)&&y.mipmapsAutoUpdate===!0&&v(at),vt.__version=xt.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function bt(R,y,W){if(y.image.length!==6)return;const at=Qt(R,y),tt=y.source;e.bindTexture(n.TEXTURE_CUBE_MAP,R.__webglTexture,n.TEXTURE0+W);const xt=i.get(tt);if(tt.version!==xt.__version||at===!0){e.activeTexture(n.TEXTURE0+W);const vt=xe.getPrimaries(xe.workingColorSpace),Z=y.colorSpace===Mi?null:xe.getPrimaries(y.colorSpace),K=y.colorSpace===Mi||vt===Z?n.NONE:n.BROWSER_DEFAULT_WEBGL;e.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,y.flipY),e.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),e.pixelStorei(n.UNPACK_ALIGNMENT,y.unpackAlignment),e.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);const mt=y.isCompressedTexture||y.image[0].isCompressedTexture,O=y.image[0]&&y.image[0].isDataTexture,et=[];for(let Ct=0;Ct<6;Ct++)!mt&&!O?et[Ct]=x(y.image[Ct],!0,s.maxCubemapSize):et[Ct]=O?y.image[Ct].image:y.image[Ct],et[Ct]=Tt(y,et[Ct]);const Q=et[0],pt=r.convert(y.format,y.colorSpace),_t=r.convert(y.type);let j=T(y.internalFormat,pt,_t,y.normalized,y.colorSpace);const Et=y.isVideoTexture!==!0,Ot=xt.__version===void 0||at===!0,rt=tt.dataReady;let Bt=E(y,Q);Xt(n.TEXTURE_CUBE_MAP,y);let Zt;if(y.isDepthTexture){if(j=M(y.format===yi,y.type),Ot)if(Et)e.texStorage2D(n.TEXTURE_CUBE_MAP,1,j,Q.width,Q.height);else for(let Ct=0;Ct<6;Ct++)e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0,j,Q.width,Q.height,0,pt,_t,null)}else if(mt){Et&&Ot&&e.texStorage2D(n.TEXTURE_CUBE_MAP,Bt,j,Q.width,Q.height);for(let Ct=0;Ct<6;Ct++){Zt=et[Ct].mipmaps;for(let de=0;de<Zt.length;de++){const Ie=Zt[de];y.format!==Xn?pt!==null?Et?rt&&e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de,0,0,Ie.width,Ie.height,pt,Ie.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de,j,Ie.width,Ie.height,0,Ie.data):te("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Et?rt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de,0,0,Ie.width,Ie.height,pt,_t,Ie.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de,j,Ie.width,Ie.height,0,pt,_t,Ie.data)}}}else{if(Zt=y.mipmaps,Et&&Ot){Zt.length>0&&Bt++;const Ct=Rt(et[0]);e.texStorage2D(n.TEXTURE_CUBE_MAP,Bt,j,Ct.width,Ct.height)}for(let Ct=0;Ct<6;Ct++)if(O){Et?rt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0,0,0,et[Ct].width,et[Ct].height,pt,_t,et[Ct].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0,j,et[Ct].width,et[Ct].height,0,pt,_t,et[Ct].data);for(let de=0;de<Zt.length;de++){const Ft=Zt[de].image[Ct].image;Et?rt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de+1,0,0,Ft.width,Ft.height,pt,_t,Ft.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de+1,j,Ft.width,Ft.height,0,pt,_t,Ft.data)}}else{Et?rt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0,0,0,pt,_t,et[Ct]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0,j,pt,_t,et[Ct]);for(let de=0;de<Zt.length;de++){const Ie=Zt[de];Et?rt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de+1,0,0,pt,_t,Ie.image[Ct]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,de+1,j,pt,_t,Ie.image[Ct])}}}S(y)&&y.mipmapsAutoUpdate===!0&&v(n.TEXTURE_CUBE_MAP),xt.__version=tt.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function yt(R,y,W,at,tt,xt){const vt=r.convert(W.format,W.colorSpace),Z=r.convert(W.type),K=T(W.internalFormat,vt,Z,W.normalized,W.colorSpace),mt=i.get(y),O=i.get(W);if(O.__renderTarget=y,!mt.__hasExternalTextures){const et=Math.max(1,y.width>>xt),Q=Math.max(1,y.height>>xt);tt===n.TEXTURE_3D||tt===n.TEXTURE_2D_ARRAY?e.texImage3D(tt,xt,K,et,Q,y.depth,0,vt,Z,null):e.texImage2D(tt,xt,K,et,Q,0,vt,Z,null)}e.bindFramebuffer(n.FRAMEBUFFER,R),ot(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,at,tt,O.__webglTexture,0,qt(y)):(tt===n.TEXTURE_2D||tt>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,at,tt,O.__webglTexture,xt),e.bindFramebuffer(n.FRAMEBUFFER,null)}function $t(R,y,W){if(n.bindRenderbuffer(n.RENDERBUFFER,R),y.depthBuffer){const at=y.depthTexture,tt=at&&at.isDepthTexture?at.type:null,xt=M(y.stencilBuffer,tt),vt=y.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;ot(y)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,qt(y),xt,y.width,y.height):W?n.renderbufferStorageMultisample(n.RENDERBUFFER,qt(y),xt,y.width,y.height):n.renderbufferStorage(n.RENDERBUFFER,xt,y.width,y.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,vt,n.RENDERBUFFER,R)}else{const at=y.textures;for(let tt=0;tt<at.length;tt++){const xt=at[tt],vt=r.convert(xt.format,xt.colorSpace),Z=r.convert(xt.type),K=T(xt.internalFormat,vt,Z,xt.normalized,xt.colorSpace);ot(y)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,qt(y),K,y.width,y.height):W?n.renderbufferStorageMultisample(n.RENDERBUFFER,qt(y),K,y.width,y.height):n.renderbufferStorage(n.RENDERBUFFER,K,y.width,y.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function zt(R,y,W){const at=y.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(n.FRAMEBUFFER,R),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const tt=i.get(y.depthTexture);tt.__renderTarget=y;const xt=at?y.depthTexture.image[0]:y.depthTexture.image;(!tt.__webglTexture||xt.width!==y.width||xt.height!==y.height)&&(xt.width=y.width,xt.height=y.height,y.depthTexture.needsUpdate=!0),at?St(y.depthTexture,0):nt(y.depthTexture,0);const vt=tt.__webglTexture,Z=qt(y),K=at?n.TEXTURE_CUBE_MAP_POSITIVE_X+W:n.TEXTURE_2D,mt=y.depthTexture.format===yi?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(y.depthTexture.format===wi)ot(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,mt,K,vt,0,Z):n.framebufferTexture2D(n.FRAMEBUFFER,mt,K,vt,0);else if(y.depthTexture.format===yi)ot(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,mt,K,vt,0,Z):n.framebufferTexture2D(n.FRAMEBUFFER,mt,K,vt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ue(R){const y=i.get(R),W=R.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==R.depthTexture){const at=R.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),at){const tt=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,at.removeEventListener("dispose",tt)};at.addEventListener("dispose",tt),y.__depthDisposeCallback=tt}y.__boundDepthTexture=at}if(R.depthTexture&&!y.__autoAllocateDepthBuffer)if(W)for(let at=0;at<6;at++)zt(y.__webglFramebuffer[at],R,at);else R.texture.mipmaps.length>0?zt(y.__webglFramebuffer[0],R,0):zt(y.__webglFramebuffer,R,0);else if(W){y.__webglDepthbuffer=[];for(let at=0;at<6;at++)if(e.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer[at]),y.__webglDepthbuffer[at]===void 0)y.__webglDepthbuffer[at]=n.createRenderbuffer(),$t(y.__webglDepthbuffer[at],R,!1);else{const tt=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,xt=y.__webglDepthbuffer[at];n.bindRenderbuffer(n.RENDERBUFFER,xt),n.framebufferRenderbuffer(n.FRAMEBUFFER,tt,n.RENDERBUFFER,xt)}}else if(R.texture.mipmaps.length>0?e.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer[0]):e.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=n.createRenderbuffer(),$t(y.__webglDepthbuffer,R,!1);else{const tt=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,xt=y.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,xt),n.framebufferRenderbuffer(n.FRAMEBUFFER,tt,n.RENDERBUFFER,xt)}e.bindFramebuffer(n.FRAMEBUFFER,null)}function fe(R,y,W){const at=i.get(R);y!==void 0&&yt(at.__webglFramebuffer,R,R.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),W!==void 0&&ue(R)}function ve(R){const y=R.texture,W=i.get(R),at=i.get(y);R.addEventListener("dispose",F),D(R);const tt=R.textures,xt=R.isWebGLCubeRenderTarget===!0,vt=tt.length>1;if(vt||(at.__webglTexture===void 0&&(at.__webglTexture=n.createTexture()),at.__version=y.version,o.memory.textures++),xt){W.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(y.mipmaps.length>0){W.__webglFramebuffer[Z]=[];for(let K=0;K<y.mipmaps.length;K++)W.__webglFramebuffer[Z][K]=n.createFramebuffer()}else W.__webglFramebuffer[Z]=n.createFramebuffer()}else{if(y.mipmaps.length>0){W.__webglFramebuffer=[];for(let Z=0;Z<y.mipmaps.length;Z++)W.__webglFramebuffer[Z]=n.createFramebuffer()}else W.__webglFramebuffer=n.createFramebuffer();if(vt)for(let Z=0,K=tt.length;Z<K;Z++){const mt=i.get(tt[Z]);mt.__webglTexture===void 0&&(mt.__webglTexture=n.createTexture(),o.memory.textures++)}if(R.samples>0&&ot(R)===!1){W.__webglMultisampledFramebuffer=n.createFramebuffer(),W.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,W.__webglMultisampledFramebuffer);for(let Z=0;Z<tt.length;Z++){const K=tt[Z];W.__webglColorRenderbuffer[Z]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,W.__webglColorRenderbuffer[Z]);const mt=r.convert(K.format,K.colorSpace),O=r.convert(K.type),et=T(K.internalFormat,mt,O,K.normalized,K.colorSpace,R.isXRRenderTarget===!0),Q=qt(R);n.renderbufferStorageMultisample(n.RENDERBUFFER,Q,et,R.width,R.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Z,n.RENDERBUFFER,W.__webglColorRenderbuffer[Z])}n.bindRenderbuffer(n.RENDERBUFFER,null),R.depthBuffer&&(W.__webglDepthRenderbuffer=n.createRenderbuffer(),$t(W.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(xt){e.bindTexture(n.TEXTURE_CUBE_MAP,at.__webglTexture),Xt(n.TEXTURE_CUBE_MAP,y);for(let Z=0;Z<6;Z++)if(y.mipmaps.length>0)for(let K=0;K<y.mipmaps.length;K++)yt(W.__webglFramebuffer[Z][K],R,y,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,K);else yt(W.__webglFramebuffer[Z],R,y,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);S(y)?v(n.TEXTURE_CUBE_MAP):y.mipmaps.length>0&&n.texParameteri(n.TEXTURE_CUBE_MAP,n.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),e.unbindTexture()}else if(vt){for(let Z=0,K=tt.length;Z<K;Z++){const mt=tt[Z],O=i.get(mt);let et=n.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(et=R.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(et,O.__webglTexture),Xt(et,mt),yt(W.__webglFramebuffer,R,mt,n.COLOR_ATTACHMENT0+Z,et,0),S(mt)&&v(et)}e.unbindTexture()}else{let Z=n.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Z=R.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(Z,at.__webglTexture),Xt(Z,y),y.mipmaps.length>0)for(let K=0;K<y.mipmaps.length;K++)yt(W.__webglFramebuffer[K],R,y,n.COLOR_ATTACHMENT0,Z,K);else yt(W.__webglFramebuffer,R,y,n.COLOR_ATTACHMENT0,Z,0);S(y)?v(Z):y.mipmaps.length>0&&n.texParameteri(Z,n.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),e.unbindTexture()}R.depthBuffer&&ue(R)}function L(R){const y=R.textures;for(let W=0,at=y.length;W<at;W++){const tt=y[W];if(S(tt)&&tt.mipmapsAutoUpdate===!0){const xt=A(R),vt=i.get(tt).__webglTexture;e.bindTexture(xt,vt),v(xt),e.unbindTexture()}}}const ht=[];function Mt(R){if(R.samples>0){if(ot(R)===!1){const y=R.textures,W=R.width,at=R.height;let tt=n.COLOR_BUFFER_BIT;const xt=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,vt=i.get(R),Z=y.length>1;if(Z)for(let mt=0;mt<y.length;mt++)e.bindFramebuffer(n.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+mt,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,vt.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+mt,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,vt.__webglMultisampledFramebuffer),R.texture.mipmaps.length>0?e.bindFramebuffer(n.DRAW_FRAMEBUFFER,vt.__webglFramebuffer[0]):e.bindFramebuffer(n.DRAW_FRAMEBUFFER,vt.__webglFramebuffer);for(let mt=0;mt<y.length;mt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(tt|=n.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(tt|=n.STENCIL_BUFFER_BIT)),Z){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,vt.__webglColorRenderbuffer[mt]);const O=i.get(y[mt]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,O,0)}n.blitFramebuffer(0,0,W,at,0,0,W,at,tt,n.NEAREST),c===!0&&(ht.length=0,ht.push(n.COLOR_ATTACHMENT0+mt),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&ht.push(xt),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ht))}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Z)for(let mt=0;mt<y.length;mt++){e.bindFramebuffer(n.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+mt,n.RENDERBUFFER,vt.__webglColorRenderbuffer[mt]);const O=i.get(y[mt]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,vt.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+mt,n.TEXTURE_2D,O,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,vt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&c){const y=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[y])}}}function qt(R){return Math.min(s.maxSamples,R.samples)}function ot(R){const y=i.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function Jt(R){const y=o.render.frame;h.get(R)!==y&&(h.set(R,y),R.update())}function Tt(R,y){const W=R.colorSpace,at=R.format,tt=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||W!==ps&&W!==Mi&&(xe.getTransfer(W)===Te?(at!==Xn||tt!==Sn)&&te("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Se("WebGLTextures: Unsupported texture color space:",W)),y}function Rt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=gt,this.resetTextureUnits=B,this.getTextureUnits=V,this.setTextureUnits=st,this.setTexture2D=nt,this.setTexture2DArray=lt,this.setTexture3D=Dt,this.setTextureCube=St,this.rebindTextures=fe,this.setupRenderTarget=ve,this.updateRenderTargetMipmap=L,this.updateMultisampleRenderTarget=Mt,this.setupDepthRenderbuffer=ue,this.setupFrameBufferTexture=yt,this.useMultisampledRTT=ot,this.dispose=N}function Z_(n,t){function e(i,s=Mi){let r;const o=xe.getTransfer(s);if(i===Sn)return n.UNSIGNED_BYTE;if(i===Pl)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Ll)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Su)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===yu)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===vu)return n.BYTE;if(i===Mu)return n.SHORT;if(i===Ws)return n.UNSIGNED_SHORT;if(i===Cl)return n.INT;if(i===Zn)return n.UNSIGNED_INT;if(i===Wn)return n.FLOAT;if(i===wn)return n.HALF_FLOAT;if(i===Eu)return n.ALPHA;if(i===bu)return n.RGB;if(i===Xn)return n.RGBA;if(i===wi)return n.DEPTH_COMPONENT;if(i===yi)return n.DEPTH_STENCIL;if(i===wu)return n.RED;if(i===Dl)return n.RED_INTEGER;if(i===Hi)return n.RG;if(i===Il)return n.RG_INTEGER;if(i===Nl)return n.RGBA_INTEGER;if(i===kr||i===Gr||i===Vr||i===Wr)if(o===Te)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===kr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Gr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Vr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Wr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===kr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Gr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Vr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Wr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===ba||i===wa||i===Ta||i===Aa)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===ba)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===wa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ta)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Aa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ra||i===Ca||i===Pa||i===La||i===Da||i===Qr||i===Ia)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ra||i===Ca)return o===Te?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Pa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===La)return r.COMPRESSED_R11_EAC;if(i===Da)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Qr)return r.COMPRESSED_RG11_EAC;if(i===Ia)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Na||i===Ua||i===Oa||i===Fa||i===za||i===Ba||i===Ha||i===ka||i===Ga||i===Va||i===Wa||i===Xa||i===Ya||i===qa)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Na)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Ua)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Oa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Fa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===za)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ba)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ha)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===ka)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ga)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Va)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Wa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Xa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Ya)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===qa)return o===Te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Za||i===Ka||i===$a)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===Za)return o===Te?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Ka)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===$a)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Ja||i===Qa||i===jr||i===ja)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===Ja)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Qa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===jr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ja)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ds?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:e}}const K_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,$_=`
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

}`;class J_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){const i=new Ou(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,i=new Kn({vertexShader:K_,fragmentShader:$_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new De(new vo(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Q_ extends Ai{constructor(t,e){super();const i=this;let s=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,d=null,f=null,u=null,p=null;const _=typeof XRWebGLBinding<"u",m=new J_,g={},x=e.getContextAttributes();let S=null,v=null;const A=[],T=[],M=new ut;let E=null,D=null;const C=new mn;C.viewport=new ze;const I=new mn;I.viewport=new ze;const F=[C,I],G=new ap;let U=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let nt=A[X];return nt===void 0&&(nt=new Uo,A[X]=nt),nt.getTargetRaySpace()},this.getControllerGrip=function(X){let nt=A[X];return nt===void 0&&(nt=new Uo,A[X]=nt),nt.getGripSpace()},this.getHand=function(X){let nt=A[X];return nt===void 0&&(nt=new Uo,A[X]=nt),nt.getHandSpace()};function H(X){const nt=T.indexOf(X.inputSource);if(nt===-1)return;const lt=A[nt];lt!==void 0&&(lt.update(X.inputSource,X.frame,l||o),lt.dispatchEvent({type:X.type,data:X.inputSource}))}function k(){s.removeEventListener("select",H),s.removeEventListener("selectstart",H),s.removeEventListener("selectend",H),s.removeEventListener("squeeze",H),s.removeEventListener("squeezestart",H),s.removeEventListener("squeezeend",H),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",it);for(let X=0;X<A.length;X++){const nt=T[X];nt!==null&&(T[X]=null,A[X].disconnect(nt))}U=null,N=null,m.reset();for(const X in g)delete g[X];if(t.setRenderTarget(S),u=null,f=null,d=null,s=null,v=null,gt.stop(),i.isPresenting=!1,t.setPixelRatio(E),t.setSize(M.width,M.height,!1),D!==null){const X=D.camera;X.fov=D.fov,X.zoom=D.zoom,X.updateProjectionMatrix(),D=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,i.isPresenting===!0&&te("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,i.isPresenting===!0&&te("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(X){l=X},this.getBaseLayer=function(){return f!==null?f:u},this.getBinding=function(){return d===null&&_&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(X){if(s=X,s!==null){if(S=t.getRenderTarget(),s.addEventListener("select",H),s.addEventListener("selectstart",H),s.addEventListener("selectend",H),s.addEventListener("squeeze",H),s.addEventListener("squeezestart",H),s.addEventListener("squeezeend",H),s.addEventListener("end",k),s.addEventListener("inputsourceschange",it),x.xrCompatible!==!0&&await e.makeXRCompatible(),E=t.getPixelRatio(),t.getSize(M),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let lt=null,Dt=null,St=null;x.depth&&(St=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,lt=x.stencil?yi:wi,Dt=x.stencil?ds:Zn);const Gt={colorFormat:e.RGBA8,depthFormat:St,scaleFactor:r};d=this.getBinding(),f=d.createProjectionLayer(Gt),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),v=new bn(f.textureWidth,f.textureHeight,{format:Xn,type:Sn,depthTexture:new ms(f.textureWidth,f.textureHeight,Dt,void 0,void 0,void 0,void 0,void 0,void 0,lt),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{const lt={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};u=new XRWebGLLayer(s,e,lt),s.updateRenderState({baseLayer:u}),t.setPixelRatio(1),t.setSize(u.framebufferWidth,u.framebufferHeight,!1),v=new bn(u.framebufferWidth,u.framebufferHeight,{format:Xn,type:Sn,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),gt.setContext(s),gt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function it(X){for(let nt=0;nt<X.removed.length;nt++){const lt=X.removed[nt],Dt=T.indexOf(lt);Dt>=0&&(T[Dt]=null,A[Dt].disconnect(lt))}for(let nt=0;nt<X.added.length;nt++){const lt=X.added[nt];let Dt=T.indexOf(lt);if(Dt===-1){for(let Gt=0;Gt<A.length;Gt++)if(Gt>=T.length){T.push(lt),Dt=Gt;break}else if(T[Gt]===null){T[Gt]=lt,Dt=Gt;break}if(Dt===-1)break}const St=A[Dt];St&&St.connect(lt)}}function P(X,nt){nt===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(nt.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(s===null)return;let nt=X.near,lt=X.far;m.texture!==null&&(m.depthNear>0&&(nt=m.depthNear),m.depthFar>0&&(lt=m.depthFar)),G.near=I.near=C.near=nt,G.far=I.far=C.far=lt,(U!==G.near||N!==G.far)&&(s.updateRenderState({depthNear:G.near,depthFar:G.far}),U=G.near,N=G.far),G.layers.mask=X.layers.mask|6,C.layers.mask=G.layers.mask&-5,I.layers.mask=G.layers.mask&-3;const Dt=X.parent,St=G.cameras;P(G,Dt);for(let Gt=0;Gt<St.length;Gt++)P(St[Gt],Dt);G.projectionMatrix.copy(C.projectionMatrix),G.projectionMatrixInverse.copy(C.projectionMatrixInverse),D===null&&X.isPerspectiveCamera&&(D={camera:X,fov:X.fov,zoom:X.zoom}),B(X,G,Dt)};function B(X,nt,lt){lt===null?X.matrix.copy(nt.matrixWorld):(X.matrix.copy(lt.matrixWorld),X.matrix.invert(),X.matrix.multiply(nt.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(nt.projectionMatrix),X.projectionMatrixInverse.copy(nt.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=no*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return G},this.getFoveation=function(){if(!(f===null&&u===null))return c},this.setFoveation=function(X){c=X,f!==null&&(f.fixedFoveation=X),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=X)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(G)},this.getCameraTexture=function(X){return g[X]};let V=null;function st(X,nt){if(h=nt.getViewerPose(l||o),p=nt,h!==null){const lt=h.views;u!==null&&(t.setRenderTargetFramebuffer(v,u.framebuffer),t.setRenderTarget(v));let Dt=!1;lt.length!==G.cameras.length&&(G.cameras.length=0,Dt=!0);for(let It=0;It<lt.length;It++){const Xt=lt[It];let Qt=null;if(u!==null)Qt=u.getViewport(Xt);else{const ft=d.getViewSubImage(f,Xt);Qt=ft.viewport,It===0&&(t.setRenderTargetTextures(v,ft.colorTexture,ft.depthStencilTexture),t.setRenderTarget(v))}let J=F[It];J===void 0&&(J=new mn,J.layers.enable(It),J.viewport=new ze,F[It]=J),J.matrix.fromArray(Xt.transform.matrix),J.matrix.decompose(J.position,J.quaternion,J.scale),J.projectionMatrix.fromArray(Xt.projectionMatrix),J.projectionMatrixInverse.copy(J.projectionMatrix).invert(),J.viewport.set(Qt.x,Qt.y,Qt.width,Qt.height),It===0&&(G.matrix.copy(J.matrix),G.matrix.decompose(G.position,G.quaternion,G.scale)),Dt===!0&&G.cameras.push(J)}const St=s.enabledFeatures;if(St&&St.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){d=i.getBinding();const It=d.getDepthInformation(lt[0]);It&&It.isValid&&It.texture&&m.init(It,s.renderState)}if(St&&St.includes("camera-access")&&_){t.state.unbindTexture(),d=i.getBinding();for(let It=0;It<lt.length;It++){const Xt=lt[It].camera;if(Xt){let Qt=g[Xt];Qt||(Qt=new Ou,g[Xt]=Qt);const J=d.getCameraImage(Xt);Qt.sourceTexture=J}}}}for(let lt=0;lt<A.length;lt++){const Dt=T[lt],St=A[lt];Dt!==null&&St!==void 0&&St.update(Dt,nt,l||o)}V&&V(X,nt),nt.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:nt}),p=null}const gt=new Ku;gt.setAnimationLoop(st),this.setAnimationLoop=function(X){V=X},this.dispose=function(){}}}const j_=new Kt,of=new re;of.set(-1,0,0,0,1,0,0,0,1);function t2(n,t){function e(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function i(m,g){g.color.getRGB(m.fogColor.value,Yu(n)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,x,S,v){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),d(m,g)):g.isMeshPhongMaterial?(r(m,g),h(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),f(m,g),g.isMeshPhysicalMaterial&&u(m,g,v)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),_(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?c(m,g,x,S):g.isSpriteMaterial?l(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,e(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===un&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,e(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===un&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,e(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,e(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);const x=t.get(g),S=x.envMap,v=x.envMapRotation;S&&(m.envMap.value=S,m.envMapRotation.value.setFromMatrix4(j_.makeRotationFromEuler(v)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(of),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function c(m,g,x,S){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*x,m.scale.value=S*.5,g.map&&(m.map.value=g.map,e(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function l(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function h(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function d(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function f(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function u(m,g,x){m.ior.value=g.ior,g.diffuseRoughness>0&&(m.diffuseRoughness.value=g.diffuseRoughness,g.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=g.diffuseRoughnessMap,e(g.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===un&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=g.iridescenceThicknessMaximum,g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function _(m,g){const x=t.get(g).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function e2(n,t,e,i){let s={},r={};function o(x,S){const v=S.program;i.uniformBlockBinding(x,v,s[x.id])}function a(x,S){let v=s[x.id];v===void 0&&(p(x),v=c(x),s[x.id]=v,x.addEventListener("dispose",m));const A=S.program;i.updateUBOMapping(x,A);const T=t.render.frame;r[x.id]!==T&&(l(x),r[x.id]=T)}function c(x){const S=n.createBuffer(),v=x.__size,A=x.usage;return n.bindBuffer(n.UNIFORM_BUFFER,S),n.bufferData(n.UNIFORM_BUFFER,v,A),n.bindBuffer(n.UNIFORM_BUFFER,null),S}function l(x){const S=s[x.id],v=x.uniforms,A=x.__cache;n.bindBuffer(n.UNIFORM_BUFFER,S);for(let T=0,M=v.length;T<M;T++){const E=v[T];if(Array.isArray(E))for(let D=0,C=E.length;D<C;D++)h(E[D],T,D,A);else h(E,T,0,A)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function h(x,S,v,A){if(f(x,S,v,A)===!0){const T=x.__offset,M=x.value;if(Array.isArray(M)){let E=0;for(let D=0;D<M.length;D++){const C=M[D],I=_(C,!0);d(C,x.__data,E),E+=I.storage/Float32Array.BYTES_PER_ELEMENT}}else d(M,x.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,T,x.__data)}}function d(x,S,v){typeof x=="number"||typeof x=="boolean"?S[v]=x:x.isMatrix3?(S[v]=x.elements[0],S[v+1]=x.elements[1],S[v+2]=x.elements[2],S[v+3]=0,S[v+4]=x.elements[3],S[v+5]=x.elements[4],S[v+6]=x.elements[5],S[v+7]=0,S[v+8]=x.elements[6],S[v+9]=x.elements[7],S[v+10]=x.elements[8],S[v+11]=0):ArrayBuffer.isView(x)?S.set(x.subarray(0,S.length-v),v):x.toArray(S,v)}function f(x,S,v,A){const T=x.value,M=S+"_"+v;if(Array.isArray(T)){A[M]===void 0&&(A[M]=[]);const E=A[M];let D=!1;for(let C=0;C<T.length;C++)u(T[C],E,C)===!0&&(D=!0);return D}return u(T,A,M)}function u(x,S,v){if(S[v]===void 0)return typeof x=="number"||typeof x=="boolean"?S[v]=x:ArrayBuffer.isView(x)?S[v]=x.slice():S[v]=x.clone(),!0;{const A=S[v];if(typeof x=="number"||typeof x=="boolean"){if(A!==x)return S[v]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(A.equals(x)===!1)return A.copy(x),!0}}return!1}function p(x){const S=x.uniforms;let v=0;const A=16;for(let M=0,E=S.length;M<E;M++){const D=Array.isArray(S[M])?S[M]:[S[M]];for(let C=0,I=D.length;C<I;C++){const F=D[C],G=Array.isArray(F.value)?F.value:[F.value],U=Array.isArray(S[M])||Array.isArray(F.value);let N=v;for(let k=0,it=G.length;k<it;k++){const P=G[k],B=_(P,U),V=v%A,st=V%B.boundary,gt=V+st;v+=st,gt!==0&&A-gt<B.storage&&(v+=A-gt),k===0&&(N=v),v+=B.storage}const H=F.type==="int"?Int32Array:F.type==="uint"?Uint32Array:Float32Array;F.__data=new H((v-N)/Float32Array.BYTES_PER_ELEMENT),F.__offset=N}}const T=v%A;return T>0&&(v+=A-T),x.__size=v,x.__cache={},this}function _(x,S){const v={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(v.boundary=4,v.storage=4):x.isVector2?(v.boundary=8,v.storage=8):x.isVector3||x.isColor?(v.boundary=16,v.storage=12):x.isVector4?(v.boundary=16,v.storage=16):x.isMatrix3?(v.boundary=16,v.storage=48):x.isMatrix4?(v.boundary=16,v.storage=64):x.isTexture?te("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(v.boundary=16,v.storage=x.byteLength):te("WebGLRenderer: Unsupported uniform value type.",x),S===!0&&(v.boundary=16,v.storage=Math.ceil(v.storage/16)*16),v}function m(x){const S=x.target;S.removeEventListener("dispose",m),n.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function g(){for(const x in s)n.deleteBuffer(s[x]);s={},r={}}return{bind:o,update:a,dispose:g}}const n2=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Hn=null;function i2(){return Hn===null&&(Hn=new m0(n2,16,16,Hi,wn),Hn.name="DFG_LUT",Hn.minFilter=gn,Hn.magFilter=gn,Hn.wrapS=oi,Hn.wrapT=oi,Hn.generateMipmaps=!1,Hn.needsUpdate=!0),Hn}class s2{constructor(t={}){const{canvas:e=Hd(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:f=!1,outputBufferType:u=Sn}=t;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=o;const _=u,m=new Set([Nl,Il,Dl]),g=new Set([Sn,Zn,Ws,ds,Pl,Ll]),x=new Uint32Array(4),S=new Int32Array(4),v={textures:[],min:[],max:[],resolution:[]};let A=null,T=null;const M=[],E=[];let D=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ci,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const C=this;let I=!1,F=null,G=null,U=null,N=null;this._outputColorSpace=Mn;let H=0,k=0,it=null,P=-1,B=null;const V=new ze,st=new ze;let gt=null;const X=new ee(0);let nt=0,lt=e.width,Dt=e.height,St=1,Gt=null,Ht=null;const It=new ze(0,0,lt,Dt),Xt=new ze(0,0,lt,Dt);let Qt=!1;const J=new Ys,ft=new zl;let dt=!1,bt=!1;const yt=new Kt,$t=new b,zt=new ze,ue={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let fe=!1;function ve(){return it===null?St:1}let L=i;function ht(w,z){return e.getContext(w,z)}let Mt,qt,ot,Jt,Tt,Rt,R,y,W,at,tt,xt,vt,Z,K,mt,O,et,Q,pt,_t,j,Et;try{const w={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${yl}`),e.addEventListener("webglcontextlost",Bt,!1),e.addEventListener("webglcontextrestored",Zt,!1),e.addEventListener("webglcontextcreationerror",Ct,!1),L===null){const z="webgl2";if(L=ht(z,w),L===null)throw ht(z)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ot()}catch(w){throw e.removeEventListener("webglcontextlost",Bt,!1),e.removeEventListener("webglcontextrestored",Zt,!1),e.removeEventListener("webglcontextcreationerror",Ct,!1),Se("WebGLRenderer: "+w.message),w}function Ot(){Mt=new ag(L),Mt.init(),_t=new Z_(L,Mt),qt=new $1(L,Mt,t,_t),ot=new Y_(L,Mt),qt.reversedDepthBuffer&&f&&ot.buffers.depth.setReversed(!0),G=L.createFramebuffer(),U=L.createFramebuffer(),N=L.createFramebuffer(),Jt=new hg(L),Tt=new D_,Rt=new q_(L,Mt,ot,Tt,qt,_t,Jt),R=new og(C),y=new fp(L),j=new Z1(L,y),W=new lg(L,y,Jt,j),at=new fg(L,W,y,j,Jt),et=new ug(L,qt,Rt),K=new J1(Tt),tt=new L_(C,R,Mt,qt,j,K),xt=new t2(C,Tt),vt=new N_,Z=new H_(Mt),O=new q1(C,R,ot,at,p,c),mt=new X_(C,at,qt),Et=new e2(L,Jt,qt,ot),Q=new K1(L,Mt,Jt),pt=new cg(L,Mt,Jt),Jt.programs=tt.programs,C.capabilities=qt,C.extensions=Mt,C.properties=Tt,C.renderLists=vt,C.shadowMap=mt,C.state=ot,C.info=Jt}_!==Sn&&(D=new pg(_,e.width,e.height,a,s,r));const rt=new Q_(C,L);this.xr=rt,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const w=Mt.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=Mt.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return St},this.setPixelRatio=function(w){w!==void 0&&(St=w,this.setSize(lt,Dt,!1))},this.getSize=function(w){return w.set(lt,Dt)},this.setSize=function(w,z,$=!0){if(rt.isPresenting){te("WebGLRenderer: Can't change size while VR device is presenting.");return}lt=w,Dt=z,e.width=Math.floor(w*St),e.height=Math.floor(z*St),$===!0&&(e.style.width=w+"px",e.style.height=z+"px"),D!==null&&D.setSize(e.width,e.height),this.setViewport(0,0,w,z)},this.getDrawingBufferSize=function(w){return w.set(lt*St,Dt*St).floor()},this.setDrawingBufferSize=function(w,z,$){lt=w,Dt=z,St=$,e.width=Math.floor(w*$),e.height=Math.floor(z*$),this.setViewport(0,0,w,z)},this.setEffects=function(w){if(_===Sn){Se("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let z=0;z<w.length;z++)if(w[z].isOutputPass===!0){te("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}D.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(V)},this.getViewport=function(w){return w.copy(It)},this.setViewport=function(w,z,$,Y){w.isVector4?It.set(w.x,w.y,w.z,w.w):It.set(w,z,$,Y),ot.viewport(V.copy(It).multiplyScalar(ve()).round())},this.getScissor=function(w){return w.copy(Xt)},this.setScissor=function(w,z,$,Y){w.isVector4?Xt.set(w.x,w.y,w.z,w.w):Xt.set(w,z,$,Y),ot.scissor(st.copy(Xt).multiplyScalar(ve()).round())},this.getScissorTest=function(){return Qt},this.setScissorTest=function(w){ot.setScissorTest(Qt=w)},this.setOpaqueSort=function(w){Gt=w},this.setTransparentSort=function(w){Ht=w},this.getClearColor=function(w){return w.copy(O.getClearColor())},this.setClearColor=function(){O.setClearColor(...arguments)},this.getClearAlpha=function(){return O.getClearAlpha()},this.setClearAlpha=function(){O.setClearAlpha(...arguments)},this.clear=function(w=!0,z=!0,$=!0){let Y=0;if(w){let q=!1;if(it!==null){const At=it.texture.format;q=m.has(At)}if(q){const At=it.texture.type,Wt=g.has(At),wt=O.getClearColor(),Lt=O.getClearAlpha(),kt=wt.r,jt=wt.g,oe=wt.b;Wt?(x[0]=kt,x[1]=jt,x[2]=oe,x[3]=Lt,L.clearBufferuiv(L.COLOR,0,x)):(S[0]=kt,S[1]=jt,S[2]=oe,S[3]=Lt,L.clearBufferiv(L.COLOR,0,S))}else Y|=L.COLOR_BUFFER_BIT}z&&(Y|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),$&&(Y|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Y!==0&&L.clear(Y)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),F=w},this.dispose=function(){e.removeEventListener("webglcontextlost",Bt,!1),e.removeEventListener("webglcontextrestored",Zt,!1),e.removeEventListener("webglcontextcreationerror",Ct,!1),O.dispose(),vt.dispose(),Z.dispose(),Rt.dispose(),Tt.dispose(),R.dispose(),at.dispose(),W.dispose(),j.dispose(),Et.dispose(),tt.dispose(),rt.dispose(),rt.removeEventListener("sessionstart",_e),rt.removeEventListener("sessionend",Ue),me.stop()};function Bt(w){w.preventDefault(),bc("WebGLRenderer: Context Lost."),I=!0}function Zt(){bc("WebGLRenderer: Context Restored."),I=!1;const w=Jt.autoReset,z=mt.enabled,$=mt.autoUpdate,Y=mt.needsUpdate,q=mt.type;Ot(),Jt.autoReset=w,mt.enabled=z,mt.autoUpdate=$,mt.needsUpdate=Y,mt.type=q}function Ct(w){Se("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function de(w){const z=w.target;z.removeEventListener("dispose",de),Ie(z)}function Ie(w){Ft(w),Tt.remove(w)}function Ft(w){const z=Tt.get(w).programs;z!==void 0&&(z.forEach(function($){tt.releaseProgram($)}),w.isShaderMaterial&&tt.releaseShaderCache(w))}this.renderBufferDirect=function(w,z,$,Y,q,At){z===null&&(z=ue);const Wt=q.isMesh&&q.matrixWorld.determinantAffine()<0,wt=tn(w,z,$,Y,q);ot.setMaterial(Y,Wt);let Lt=$.index,kt=1;if(Y.wireframe===!0){if(Lt=W.getWireframeAttribute($),Lt===void 0)return;kt=2}const jt=$.drawRange,oe=$.attributes.position;let Pt=jt.start*kt,le=(jt.start+jt.count)*kt;At!==null&&(Pt=Math.max(Pt,At.start*kt),le=Math.min(le,(At.start+At.count)*kt)),Lt!==null?(Pt=Math.max(Pt,0),le=Math.min(le,Lt.count)):oe!=null&&(Pt=Math.max(Pt,0),le=Math.min(le,oe.count));const be=le-Pt;if(be<0||be===1/0)return;j.setup(q,Y,wt,$,Lt);let Ae,we=Q;if(Lt!==null&&(Ae=y.get(Lt),we=pt,we.setIndex(Ae)),q.isMesh)Y.wireframe===!0?(ot.setLineWidth(Y.wireframeLinewidth*ve()),we.setMode(L.LINES)):we.setMode(L.TRIANGLES);else if(q.isLine){let Xe=Y.linewidth;Xe===void 0&&(Xe=1),ot.setLineWidth(Xe*ve()),q.isLineSegments?we.setMode(L.LINES):q.isLineLoop?we.setMode(L.LINE_LOOP):we.setMode(L.LINE_STRIP)}else q.isPoints?we.setMode(L.POINTS):q.isSprite&&we.setMode(L.TRIANGLES);if(q.isBatchedMesh)if(Mt.get("WEBGL_multi_draw"))we.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{const Xe=q._multiDrawStarts,Yt=q._multiDrawCounts,ln=q._multiDrawCount,ye=Lt?y.get(Lt).bytesPerElement:1,Ri=Tt.get(Y).currentProgram.getUniforms();for(let rn=0;rn<ln;rn++)Ri.setValue(L,"_gl_DrawID",rn),we.render(Xe[rn]/ye,Yt[rn])}else if(q.isInstancedMesh)we.renderInstances(Pt,be,q.count);else if($.isInstancedBufferGeometry){const Xe=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,Yt=Math.min($.instanceCount,Xe);we.renderInstances(Pt,be,Yt)}else we.render(Pt,be)};function Vt(w,z,$,Y){F!==null&&w.isNodeMaterial&&F.setObject(Y,w),dt===!0&&K.setState(w,$,!1),w.transparent===!0&&w.side===Dn&&w.forceSinglePass===!1?(w.side=un,w.needsUpdate=!0,Oe(w,z,Y),w.side=Bi,w.needsUpdate=!0,Oe(w,z,Y),w.side=Dn):Oe(w,z,Y)}this.compile=function(w,z,$=null){$===null&&($=w),F!==null&&F.renderStart(w,z,$),T=Z.get($),T.init(z),E.push(T),$.traverseVisible(function(q){q.isLight&&q.layers.test(z.layers)&&(T.pushLight(q),q.castShadow&&T.pushShadow(q))}),w!==$&&w.traverseVisible(function(q){q.isLight&&q.layers.test(z.layers)&&(T.pushLight(q),q.castShadow&&T.pushShadow(q))}),T.setupLights(),F!==null&&F.updateLights(T.state.lightsArray),bt=this.localClippingEnabled,dt=K.init(this.clippingPlanes,bt),dt===!0&&K.setGlobalState(this.clippingPlanes,z),F!==null&&mt.render(T.state.shadowsArray,$,z);const Y=new Set;return w.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;const At=q.material;if(At)if(Array.isArray(At))for(let Wt=0;Wt<At.length;Wt++){const wt=At[Wt];Vt(wt,$,z,q),Y.add(wt)}else Vt(At,$,z,q),Y.add(At)}),T=E.pop(),F!==null&&F.renderEnd(),Y},this.compileAsync=function(w,z,$=null){const Y=this.compile(w,z,$);return new Promise(q=>{function At(){if(Y.forEach(function(Wt){const Lt=Tt.get(Wt).currentProgram;(Lt===void 0||Lt.isReady())&&Y.delete(Wt)}),Y.size===0){q(w);return}setTimeout(At,10)}Mt.get("KHR_parallel_shader_compile")!==null?At():setTimeout(At,10)})};let ne=null;function Pe(w){ne&&ne(w)}function _e(){me.stop()}function Ue(){me.start()}const me=new Ku;me.setAnimationLoop(Pe),typeof self<"u"&&me.setContext(self),this.setAnimationLoop=function(w){ne=w,rt.setAnimationLoop(w),w===null?me.stop():me.start()},rt.addEventListener("sessionstart",_e),rt.addEventListener("sessionend",Ue),this.render=function(w,z){if(z!==void 0&&z.isCamera!==!0){Se("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;F!==null&&F.renderStart(w,z);const $=rt.enabled===!0&&rt.isPresenting===!0,Y=D!==null&&(it===null||$)&&D.begin(C,it);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),rt.enabled===!0&&rt.isPresenting===!0&&(D===null||D.isCompositing()===!1)&&(rt.cameraAutoUpdate===!0&&rt.updateCamera(z),z=rt.getCamera()),w.isScene===!0&&w.onBeforeRender(C,w,z,it),T=Z.get(w,E.length),T.init(z),T.state.textureUnits=Rt.getTextureUnits(),E.push(T),yt.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),z.isArrayCamera?ft.setFromArrayCamera(z):J.setFromProjectionMatrix(yt,Nn,z.reversedDepth),bt=this.localClippingEnabled,dt=K.init(this.clippingPlanes,bt),A=vt.get(w,M.length),A.init(),M.push(A),this.info.render.frame++,rt.enabled===!0&&rt.isPresenting===!0){const Wt=C.xr.getDepthSensingMesh();Wt!==null&&ie(Wt,z,-1/0,C.sortObjects)}ie(w,z,0,C.sortObjects),A.finish(),F!==null&&F.updateLights(T.state.lightsArray),C.sortObjects===!0&&A.sort(Gt,Ht),fe=rt.enabled===!1||rt.isPresenting===!1||rt.hasDepthSensing()===!1,fe&&O.addToRenderList(A,w),this.info.autoReset===!0&&this.info.reset(),dt===!0&&K.beginShadows();const q=T.state.shadowsArray;if(mt.render(q,w,z),dt===!0&&K.endShadows(),(Y&&D.hasRenderPass())===!1){const Wt=A.opaque,wt=A.transmissive;if(T.setupLights(),z.isArrayCamera){const Lt=z.cameras;if(wt.length>0)for(let kt=0,jt=Lt.length;kt<jt;kt++){const oe=Lt[kt];Tn(Wt,wt,w,oe)}fe&&O.render(w);for(let kt=0,jt=Lt.length;kt<jt;kt++){const oe=Lt[kt];We(A,w,oe,oe.viewport)}}else wt.length>0&&Tn(Wt,wt,w,z),fe&&O.render(w),We(A,w,z)}it!==null&&k===0&&(Rt.updateMultisampleRenderTarget(it),Rt.updateRenderTargetMipmap(it)),Y&&D.end(C),w.isScene===!0&&w.onAfterRender(C,w,z),j.resetDefaultState(),P=-1,B=null,E.pop(),E.length>0?(T=E[E.length-1],Rt.setTextureUnits(T.state.textureUnits),dt===!0&&K.setGlobalState(C.clippingPlanes,T.state.camera)):T=null,M.pop(),M.length>0?A=M[M.length-1]:A=null,F!==null&&F.renderEnd()};function ie(w,z,$,Y){if(w.visible===!1)return;if(w.layers.test(z.layers)){if(w.isGroup)$=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(z);else if(w.isLight)T.pushLight(w),w.castShadow&&T.pushShadow(w);else if(w.isSprite){const Wt=z.isArrayCamera?ft:J;if(!w.frustumCulled||w.intersectsFrustum(Wt)){Y&&zt.setFromMatrixPosition(w.matrixWorld).applyMatrix4(yt);const wt=at.update(w),Lt=w.material;Lt.visible&&A.push(w,wt,Lt,$,zt.z,null,z)}}else if(w.isMesh||w.isLine||w.isPoints){const Wt=z.isArrayCamera?ft:J;if(!w.frustumCulled||w.intersectsFrustum(Wt)){const wt=at.update(w),Lt=w.material;if(Y&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),zt.copy(w.boundingSphere.center)):(wt.boundingSphere===null&&wt.computeBoundingSphere(),zt.copy(wt.boundingSphere.center)),zt.applyMatrix4(w.matrixWorld).applyMatrix4(yt)),Array.isArray(Lt)){const kt=wt.groups;for(let jt=0,oe=kt.length;jt<oe;jt++){const Pt=kt[jt],le=Lt[Pt.materialIndex];le&&le.visible&&A.push(w,wt,le,$,zt.z,Pt,z)}}else Lt.visible&&A.push(w,wt,Lt,$,zt.z,null,z)}}}const At=w.children;for(let Wt=0,wt=At.length;Wt<wt;Wt++)ie(At[Wt],z,$,Y)}function We(w,z,$,Y){const{opaque:q,transmissive:At,transparent:Wt}=w;T.setupLightsView($),dt===!0&&K.setGlobalState(C.clippingPlanes,$),Y&&ot.viewport(V.copy(Y)),q.length>0&&je(q,z,$),At.length>0&&je(At,z,$),Wt.length>0&&je(Wt,z,$),ot.buffers.depth.setTest(!0),ot.buffers.depth.setMask(!0),ot.buffers.color.setMask(!0),ot.setPolygonOffset(!1)}function Tn(w,z,$,Y){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[Y.id]===void 0){const Pt=Mt.has("EXT_color_buffer_half_float")||Mt.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[Y.id]=new bn(1,1,{generateMipmaps:!0,type:Pt?wn:Sn,minFilter:Si,samples:Math.max(4,qt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:xe.workingColorSpace})}const At=T.state.transmissionRenderTarget[Y.id],Wt=Y.viewport||V;At.setSize(Wt.z*C.transmissionResolutionScale,Wt.w*C.transmissionResolutionScale);const wt=C.getRenderTarget(),Lt=C.getActiveCubeFace(),kt=C.getActiveMipmapLevel();C.setRenderTarget(At),C.getClearColor(X),nt=C.getClearAlpha(),nt<1&&C.setClearColor(16777215,.5),C.clear(),fe&&O.render($);const jt=C.toneMapping;C.toneMapping=ci;const oe=Y.viewport;if(Y.viewport!==void 0&&(Y.viewport=void 0),T.setupLightsView(Y),dt===!0&&K.setGlobalState(C.clippingPlanes,Y),je(w,$,Y),Rt.updateMultisampleRenderTarget(At),Rt.updateRenderTargetMipmap(At),Mt.has("WEBGL_multisampled_render_to_texture")===!1){let Pt=!1;for(let le=0,be=z.length;le<be;le++){const Ae=z[le],{object:we,geometry:Xe,material:Yt,group:ln}=Ae;if(Yt.side===Dn&&we.layers.test(Y.layers)){const ye=Yt.side;Yt.side=un,Yt.needsUpdate=!0,Jn(we,$,Y,Xe,Yt,ln),Yt.side=ye,Yt.needsUpdate=!0,Pt=!0}}Pt===!0&&(Rt.updateMultisampleRenderTarget(At),Rt.updateRenderTargetMipmap(At))}C.setRenderTarget(wt,Lt,kt),C.setClearColor(X,nt),oe!==void 0&&(Y.viewport=oe),C.toneMapping=jt}function je(w,z,$){const Y=z.isScene===!0?z.overrideMaterial:null;for(let q=0,At=w.length;q<At;q++){const Wt=w[q],{object:wt,geometry:Lt,group:kt}=Wt;let jt=Wt.material;jt.allowOverride===!0&&Y!==null&&(jt=Y),wt.layers.test($.layers)&&Jn(wt,z,$,Lt,jt,kt)}}function Jn(w,z,$,Y,q,At){F!==null&&q.isNodeMaterial&&F.setObject(w,q),w.onBeforeRender(C,z,$,Y,q,At),w.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),q.onBeforeRender(C,z,$,Y,w,At),q.transparent===!0&&q.side===Dn&&q.forceSinglePass===!1?(q.side=un,q.needsUpdate=!0,C.renderBufferDirect($,z,Y,q,w,At),q.side=Bi,q.needsUpdate=!0,C.renderBufferDirect($,z,Y,q,w,At),q.side=Dn):C.renderBufferDirect($,z,Y,q,w,At),w.onAfterRender(C,z,$,Y,q,At)}function ke(w){let z=0;for(const $ of w)$.texture!==null&&z++;return z}function Oe(w,z,$){z.isScene!==!0&&(z=ue);const Y=Tt.get(w),q=T.state.lights,At=T.state.shadowsArray,Wt=q.state.version,wt=tt.getParameters(w,q.state,At,z,$,T.state.lightProbeGridArray),Lt=tt.getProgramCacheKey(wt);let kt=Y.programs;Y.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?z.environment:null,Y.fog=z.fog;const jt=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;Y.envMap=R.get(w.envMap||Y.environment,jt),Y.envMapRotation=Y.environment!==null&&w.envMap===null?z.environmentRotation:w.envMapRotation,kt===void 0&&(w.addEventListener("dispose",de),kt=new Map,Y.programs=kt,Y.programVariants=new Map);let oe=kt.get(Lt);if(oe!==void 0){if(Y.currentProgram===oe&&Y.lightsStateVersion===Wt)return sn(w,wt),oe}else wt.uniforms=tt.getUniforms(w),F!==null&&w.isNodeMaterial&&F.build(w,$,wt),w.onBeforeCompile(wt,C),oe=tt.acquireProgram(wt,Lt),kt.set(Lt,oe),Y.uniforms=wt.uniforms;const Pt=Y.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Pt.clippingPlanes=K.uniform),sn(w,wt),Y.needsLights=jn(w),Y.lightsStateVersion=Wt,Y.needsLights&&(Pt.ambientLightColor.value=q.state.ambient,Pt.lightProbe.value=q.state.probe,Pt.sunLights.value=q.state.sun,Pt.sunLightShadows.value=q.state.sunShadow,Pt.directionalLights.value=q.state.directional,Pt.directionalLightShadows.value=q.state.directionalShadow,Pt.spotLights.value=q.state.spot,Pt.spotLightShadows.value=q.state.spotShadow,Pt.rectAreaLights.value=q.state.rectArea,Pt.ltc_1.value=q.state.rectAreaLTC1,Pt.ltc_2.value=q.state.rectAreaLTC2,Pt.pointLights.value=q.state.point,Pt.pointLightShadows.value=q.state.pointShadow,Pt.hemisphereLights.value=q.state.hemi,Pt.sunShadowMatrix.value=q.state.sunShadowMatrix,Pt.sunShadowCascade.value=q.state.sunShadowCascade,Pt.directionalShadowMatrix.value=q.state.directionalShadowMatrix,Pt.spotLightMatrix.value=q.state.spotLightMatrix,Pt.spotLightMap.value=q.state.spotLightMap,Pt.pointShadowMatrix.value=q.state.pointShadowMatrix),Y.numLightProbeGrids=ke(T.state.lightProbeGridArray),Y.currentProgram=oe,Y.uniformsList=null,oe}function Ke(w,z,$,Y,q){const At=Tt.get(w),Wt=At.currentProgram.id+","+Y+","+q;let wt=At.programVariants.get(Wt);return wt===void 0?(wt=Oe(w,z,$),At.programVariants.set(Wt,wt)):(At.currentProgram=wt,At.uniformsList=null,At.outputColorSpace=Y,At.toneMapping=q),wt}function Qn(w){if(w.uniformsList===null){const z=w.currentProgram.getUniforms();w.uniformsList=Yr.seqWithValue(z.seq,w.uniforms)}return w.uniformsList}function sn(w,z){const $=Tt.get(w);$.outputColorSpace=z.outputColorSpace,$.batching=z.batching,$.batchingColor=z.batchingColor,$.instancing=z.instancing,$.instancingColor=z.instancingColor,$.instancingMorph=z.instancingMorph,$.skinning=z.skinning,$.morphTargets=z.morphTargets,$.morphNormals=z.morphNormals,$.morphColors=z.morphColors,$.morphTargetsCount=z.morphTargetsCount,$.numClippingPlanes=z.numClippingPlanes,$.numIntersection=z.numClipIntersection,$.vertexAlphas=z.vertexAlphas,$.vertexTangents=z.vertexTangents,$.toneMapping=z.toneMapping}function tn(w,z,$,Y,q){z.isScene!==!0&&(z=ue),Rt.resetTextureUnits();const At=z.fog,Wt=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial?z.environment:null,wt=it===null?C.outputColorSpace:it.isXRRenderTarget===!0?it.texture.colorSpace:xe.workingColorSpace,Lt=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial&&!Y.envMap||Y.isMeshPhongMaterial&&!Y.envMap,kt=R.get(Y.envMap||Wt,Lt),jt=Y.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,oe=!!$.attributes.tangent&&(!!Y.normalMap||Y.anisotropy>0),Pt=!!$.morphAttributes.position,le=!!$.morphAttributes.normal,be=!!$.morphAttributes.color;let Ae=ci;Y.toneMapped&&(it===null||it.isXRRenderTarget===!0)&&(Ae=C.toneMapping);const we=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,Xe=we!==void 0?we.length:0,Yt=Tt.get(Y),ln=T.state.lights;if(dt===!0&&(bt===!0||w!==B)){const Fe=w===B&&Y.id===P;K.setState(Y,w,Fe)}let ye=!1,Ri=!1;Y.version===Yt.__version?Yt.needsLights&&Yt.lightsStateVersion!==ln.state.version||q.isBatchedMesh&&Yt.batching===!1||!q.isBatchedMesh&&Yt.batching===!0||q.isBatchedMesh&&Yt.batchingColor===!0&&q._colorsTexture===null||q.isBatchedMesh&&Yt.batchingColor===!1&&q._colorsTexture!==null||q.isInstancedMesh&&Yt.instancing===!1||!q.isInstancedMesh&&Yt.instancing===!0||q.isSkinnedMesh&&Yt.skinning===!1||!q.isSkinnedMesh&&Yt.skinning===!0||q.isInstancedMesh&&Yt.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&Yt.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&Yt.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&Yt.instancingMorph===!1&&q.morphTexture!==null||Yt.envMap!==kt||Y.fog===!0&&Yt.fog!==At||Yt.numClippingPlanes!==void 0&&(Yt.numClippingPlanes!==K.numPlanes||Yt.numIntersection!==K.numIntersection)||Yt.vertexAlphas!==jt||Yt.vertexTangents!==oe||Yt.morphTargets!==Pt||Yt.morphNormals!==le||Yt.morphColors!==be||Yt.morphTargetsCount!==Xe||Yt.numLightProbeGrids!==ke(T.state.lightProbeGridArray)?ye=!0:(Yt.outputColorSpace!==wt||Yt.toneMapping!==Ae)&&(Ri=!0):(ye=!0,Yt.__version=Y.version);let rn=Yt.currentProgram;(ye===!0||Ri===!0)&&(rn=Ri===!0?Ke(Y,z,q,wt,Ae):Oe(Y,z,q),F&&Y.isNodeMaterial&&F.onUpdateProgram(Y,rn,Yt));let lr=!1,di=!1,Ci=!1;const Me=rn.getUniforms(),en=Yt.uniforms;if(ot.useProgram(rn.program)&&(lr=!0,di=!0,Ci=!0),Y.id!==P&&(P=Y.id,di=!0),lr||B!==w){ot.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),Me.setValue(L,"projectionMatrix",w.projectionMatrix),Me.setValue(L,"viewMatrix",w.matrixWorldInverse);const $e=Me.map.cameraPosition;$e!==void 0&&$e.setValue(L,$t.setFromMatrixPosition(w.matrixWorld)),qt.logarithmicDepthBuffer&&Me.setValue(L,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(Y.isMeshPhongMaterial||Y.isMeshToonMaterial||Y.isMeshLambertMaterial||Y.isMeshBasicMaterial||Y.isMeshStandardMaterial||Y.isShaderMaterial)&&Me.setValue(L,"isOrthographic",w.isOrthographicCamera===!0),B!==w&&(B=w,di=!0,Ci=!0)}if(Yt.needsLights&&(ln.state.sunShadowMap.length>0&&Me.setValue(L,"sunShadowMap",ln.state.sunShadowMap,Rt),ln.state.directionalShadowMap.length>0&&Me.setValue(L,"directionalShadowMap",ln.state.directionalShadowMap,Rt),ln.state.spotShadowMap.length>0&&Me.setValue(L,"spotShadowMap",ln.state.spotShadowMap,Rt),ln.state.pointShadowMap.length>0&&Me.setValue(L,"pointShadowMap",ln.state.pointShadowMap,Rt)),q.isSkinnedMesh){Me.setOptional(L,q,"bindMatrix"),Me.setOptional(L,q,"bindMatrixInverse");const Fe=q.skeleton;Fe&&(Fe.boneTexture===null&&Fe.computeBoneTexture(),Me.setValue(L,"boneTexture",Fe.boneTexture,Rt))}q.isBatchedMesh&&(Me.setOptional(L,q,"batchingTexture"),Me.setValue(L,"batchingTexture",q._matricesTexture,Rt),Me.setOptional(L,q,"batchingIdTexture"),Me.setValue(L,"batchingIdTexture",q._indirectTexture,Rt),Me.setOptional(L,q,"batchingColorTexture"),q._colorsTexture!==null&&Me.setValue(L,"batchingColorTexture",q._colorsTexture,Rt));const An=$.morphAttributes;if((An.position!==void 0||An.normal!==void 0||An.color!==void 0)&&et.update(q,$,rn),(di||Yt.receiveShadow!==q.receiveShadow)&&(Yt.receiveShadow=q.receiveShadow,Me.setValue(L,"receiveShadow",q.receiveShadow)),(Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial)&&Y.envMap===null&&z.environment!==null&&(en.envMapIntensity.value=z.environmentIntensity),en.dfgLUT!==void 0&&(en.dfgLUT.value=i2()),di){if(Me.setValue(L,"toneMappingExposure",C.toneMappingExposure),Yt.needsLights&&dn(en,Ci),At&&Y.fog===!0&&xt.refreshFogUniforms(en,At),xt.refreshMaterialUniforms(en,Y,St,Dt,T.state.transmissionRenderTarget[w.id]),Yt.needsLights&&Yt.numLightProbeGrids>0){const Fe=v;let $e=0;for(const ti of T.state.lightProbeGridArray)ti.texture!==null&&(Fe.textures[$e]=ti.texture,Fe.min[$e]=ti.boundingBox.min,Fe.max[$e]=ti.boundingBox.max,Fe.resolution[$e]=ti.resolution,$e++);for(const ti in Fe)Fe[ti].length=$e;en.probesSH.value=Fe.textures,en.probesMin.value=Fe.min,en.probesMax.value=Fe.max,en.probesResolution.value=Fe.resolution}Yr.upload(L,Qn(Yt),en,Rt)}if(Y.isShaderMaterial&&Y.uniformsNeedUpdate===!0&&(Yr.upload(L,Qn(Yt),en,Rt),Y.uniformsNeedUpdate=!1),Y.isSpriteMaterial&&Me.setValue(L,"center",q.center),Me.setValue(L,"modelViewMatrix",q.modelViewMatrix),Me.setValue(L,"normalMatrix",q.normalMatrix),Me.setValue(L,"modelMatrix",q.matrixWorld),Y.uniformsGroups!==void 0){const Fe=Y.uniformsGroups;for(let $e=0,ti=Fe.length;$e<ti;$e++){const hc=Fe[$e];Et.update(hc,rn),Et.bind(hc,rn)}}return rn}function dn(w,z){w.ambientLightColor.needsUpdate=z,w.lightProbe.needsUpdate=z,w.sunLights.needsUpdate=z,w.sunLightShadows.needsUpdate=z,w.directionalLights.needsUpdate=z,w.directionalLightShadows.needsUpdate=z,w.pointLights.needsUpdate=z,w.pointLightShadows.needsUpdate=z,w.spotLights.needsUpdate=z,w.spotLightShadows.needsUpdate=z,w.rectAreaLights.needsUpdate=z,w.hemisphereLights.needsUpdate=z}function jn(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return it},this.setRenderTargetTextures=function(w,z,$){const Y=Tt.get(w);Y.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,Y.__autoAllocateDepthBuffer===!1&&(Y.__useRenderToTexture=!1),Tt.get(w.texture).__webglTexture=z,Tt.get(w.depthTexture).__webglTexture=Y.__autoAllocateDepthBuffer?void 0:$,Y.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,z){const $=Tt.get(w);$.__webglFramebuffer=z,$.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(w,z=0,$=0){it=w,H=z,k=$;let Y=null,q=!1,At=!1;if(w){const wt=Tt.get(w);if(wt.__useDefaultFramebuffer!==void 0){ot.bindFramebuffer(L.FRAMEBUFFER,wt.__webglFramebuffer),V.copy(w.viewport),st.copy(w.scissor),gt=w.scissorTest,ot.viewport(V),ot.scissor(st),ot.setScissorTest(gt),P=-1;return}else if(wt.__webglFramebuffer===void 0)Rt.setupRenderTarget(w);else if(wt.__hasExternalTextures)Rt.rebindTextures(w,Tt.get(w.texture).__webglTexture,Tt.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const jt=w.depthTexture;if(wt.__boundDepthTexture!==jt){if(jt!==null&&Tt.has(jt)&&(w.width!==jt.image.width||w.height!==jt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Rt.setupDepthRenderbuffer(w)}}const Lt=w.texture;(Lt.isData3DTexture||Lt.isDataArrayTexture||Lt.isCompressedArrayTexture)&&(At=!0);const kt=Tt.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(kt[z])?Y=kt[z][$]:Y=kt[z],q=!0):w.samples>0&&Rt.useMultisampledRTT(w)===!1?Y=Tt.get(w).__webglMultisampledFramebuffer:Array.isArray(kt)?Y=kt[$]:Y=kt,V.copy(w.viewport),st.copy(w.scissor),gt=w.scissorTest}else V.copy(It).multiplyScalar(St).floor(),st.copy(Xt).multiplyScalar(St).floor(),gt=Qt;if($!==0&&(Y=G),ot.bindFramebuffer(L.FRAMEBUFFER,Y)&&ot.drawBuffers(w,Y),ot.viewport(V),ot.scissor(st),ot.setScissorTest(gt),q){const wt=Tt.get(w.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+z,wt.__webglTexture,$)}else if(At){const wt=z;for(let Lt=0;Lt<w.textures.length;Lt++){const kt=Tt.get(w.textures[Lt]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Lt,kt.__webglTexture,$,wt)}}else if(w!==null&&$!==0){const wt=Tt.get(w.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,wt.__webglTexture,$)}P=-1};function zn(w){const z=Tt.get(w);return(z.__readFormat!==w.format||z.__readType!==w.type)&&(z.__readFormat=w.format,z.__readType=w.type,z.__formatReadable=qt.textureFormatReadable(w.format),z.__typeReadable=qt.textureTypeReadable(w.type)),z}this.readRenderTargetPixels=function(w,z,$,Y,q,At,Wt,wt=0){if(!(w&&w.isWebGLRenderTarget)){Se("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Lt=Tt.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Wt!==void 0&&(Lt=Lt[Wt],Array.isArray(Lt)&&(Lt=Lt[0])),Lt){ot.bindFramebuffer(L.FRAMEBUFFER,Lt);try{const kt=w.textures[wt],jt=kt.format,oe=kt.type;w.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+wt);const Pt=zn(kt);if(Pt.__formatReadable===!1){Se("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pt.__typeReadable===!1){Se("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=w.width-Y&&$>=0&&$<=w.height-q&&L.readPixels(z,$,Y,q,_t.convert(jt),_t.convert(oe),At)}finally{const kt=it!==null?Tt.get(it).__webglFramebuffer:null;ot.bindFramebuffer(L.FRAMEBUFFER,kt)}}},this.readRenderTargetPixelsAsync=async function(w,z,$,Y,q,At,Wt,wt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Lt=Tt.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Wt!==void 0&&(Lt=Lt[Wt],Array.isArray(Lt)&&(Lt=Lt[0])),Lt)if(z>=0&&z<=w.width-Y&&$>=0&&$<=w.height-q){ot.bindFramebuffer(L.FRAMEBUFFER,Lt);const kt=w.textures[wt],jt=kt.format,oe=kt.type;w.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+wt);const Pt=zn(kt);if(Pt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const le=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,le),L.bufferData(L.PIXEL_PACK_BUFFER,At.byteLength,L.STREAM_READ),L.readPixels(z,$,Y,q,_t.convert(jt),_t.convert(oe),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);const be=it!==null?Tt.get(it).__webglFramebuffer:null;ot.bindFramebuffer(L.FRAMEBUFFER,be);const Ae=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await kd(L,Ae,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,le),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,At),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(le),L.deleteSync(Ae),At}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,z=null,$=0){const Y=Math.pow(2,-$),q=Math.floor(w.image.width*Y),At=Math.floor(w.image.height*Y),Wt=z!==null?z.x:0,wt=z!==null?z.y:0;Rt.setTexture2D(w,0),L.copyTexSubImage2D(L.TEXTURE_2D,$,0,0,Wt,wt,q,At),ot.unbindTexture()},this.copyTextureToTexture=function(w,z,$=null,Y=null,q=0,At=0){let Wt,wt,Lt,kt,jt,oe,Pt,le,be;const Ae=w.isCompressedTexture?w.mipmaps[At]:w.image;if($!==null)Wt=$.max.x-$.min.x,wt=$.max.y-$.min.y,Lt=$.isBox3?$.max.z-$.min.z:1,kt=$.min.x,jt=$.min.y,oe=$.isBox3?$.min.z:0;else{const Me=Math.pow(2,-q);Wt=Math.floor(Ae.width*Me),wt=Math.floor(Ae.height*Me),w.isDataArrayTexture?Lt=Ae.depth:w.isData3DTexture?Lt=Math.floor(Ae.depth*Me):Lt=1,kt=0,jt=0,oe=0}Y!==null?(Pt=Y.x,le=Y.y,be=Y.z):(Pt=0,le=0,be=0);const we=_t.convert(z.format),Xe=_t.convert(z.type);let Yt;z.isData3DTexture?(Rt.setTexture3D(z,0),Yt=L.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(Rt.setTexture2DArray(z,0),Yt=L.TEXTURE_2D_ARRAY):(Rt.setTexture2D(z,0),Yt=L.TEXTURE_2D),ot.activeTexture(L.TEXTURE0),ot.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,z.flipY),ot.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),ot.pixelStorei(L.UNPACK_ALIGNMENT,z.unpackAlignment);const ln=ot.getParameter(L.UNPACK_ROW_LENGTH),ye=ot.getParameter(L.UNPACK_IMAGE_HEIGHT),Ri=ot.getParameter(L.UNPACK_SKIP_PIXELS),rn=ot.getParameter(L.UNPACK_SKIP_ROWS),lr=ot.getParameter(L.UNPACK_SKIP_IMAGES);ot.pixelStorei(L.UNPACK_ROW_LENGTH,Ae.width),ot.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Ae.height),ot.pixelStorei(L.UNPACK_SKIP_PIXELS,kt),ot.pixelStorei(L.UNPACK_SKIP_ROWS,jt),ot.pixelStorei(L.UNPACK_SKIP_IMAGES,oe);const di=w.isDataArrayTexture||w.isData3DTexture,Ci=z.isDataArrayTexture||z.isData3DTexture;if(w.isDepthTexture){const Me=Tt.get(w),en=Tt.get(z),An=Tt.get(Me.__renderTarget),Fe=Tt.get(en.__renderTarget);ot.bindFramebuffer(L.READ_FRAMEBUFFER,An.__webglFramebuffer),ot.bindFramebuffer(L.DRAW_FRAMEBUFFER,Fe.__webglFramebuffer);for(let $e=0;$e<Lt;$e++)di&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Tt.get(w).__webglTexture,q,oe+$e),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Tt.get(z).__webglTexture,At,be+$e)),L.blitFramebuffer(kt,jt,kt+Wt,jt+wt,Pt,le,Pt+Wt,le+wt,L.DEPTH_BUFFER_BIT,L.NEAREST);ot.bindFramebuffer(L.READ_FRAMEBUFFER,null),ot.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(q!==0||w.isRenderTargetTexture||Tt.has(w)){const Me=Tt.get(w),en=Tt.get(z);ot.bindFramebuffer(L.READ_FRAMEBUFFER,U),ot.bindFramebuffer(L.DRAW_FRAMEBUFFER,N);for(let An=0;An<Lt;An++)di?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Me.__webglTexture,q,oe+An):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Me.__webglTexture,q),Ci?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,en.__webglTexture,At,be+An):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,en.__webglTexture,At),q!==0?L.blitFramebuffer(kt,jt,kt+Wt,jt+wt,Pt,le,Pt+Wt,le+wt,L.COLOR_BUFFER_BIT,L.NEAREST):Ci?L.copyTexSubImage3D(Yt,At,Pt,le,be+An,kt,jt,Wt,wt):L.copyTexSubImage2D(Yt,At,Pt,le,kt,jt,Wt,wt);ot.bindFramebuffer(L.READ_FRAMEBUFFER,null),ot.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else Ci?w.isDataTexture||w.isData3DTexture?L.texSubImage3D(Yt,At,Pt,le,be,Wt,wt,Lt,we,Xe,Ae.data):z.isCompressedArrayTexture?L.compressedTexSubImage3D(Yt,At,Pt,le,be,Wt,wt,Lt,we,Ae.data):L.texSubImage3D(Yt,At,Pt,le,be,Wt,wt,Lt,we,Xe,Ae):w.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,At,Pt,le,Wt,wt,we,Xe,Ae.data):w.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,At,Pt,le,Ae.width,Ae.height,we,Ae.data):L.texSubImage2D(L.TEXTURE_2D,At,Pt,le,Wt,wt,we,Xe,Ae);ot.pixelStorei(L.UNPACK_ROW_LENGTH,ln),ot.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ye),ot.pixelStorei(L.UNPACK_SKIP_PIXELS,Ri),ot.pixelStorei(L.UNPACK_SKIP_ROWS,rn),ot.pixelStorei(L.UNPACK_SKIP_IMAGES,lr),At===0&&z.generateMipmaps===!0&&z.mipmapsAutoUpdate===!0&&L.generateMipmap(Yt),ot.unbindTexture()},this.initRenderTarget=function(w){Tt.get(w).__webglFramebuffer===void 0&&Rt.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?Rt.setTextureCube(w,0):w.isData3DTexture?Rt.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?Rt.setTexture2DArray(w,0):Rt.setTexture2D(w,0),ot.unbindTexture()},this.resetState=function(){H=0,k=0,it=null,ot.reset(),j.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=xe._getDrawingBufferColorSpace(t),e.unpackColorSpace=xe._getUnpackColorSpace()}}const Rh={type:"change"},jl={type:"start"},af={type:"end"},Or=new js,Ch=new Gn,r2=Math.cos(70*qd.DEG2RAD),Ye=new b,pn=2*Math.PI,Ee={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},ia=1e-6;class o2 extends hp{constructor(t,e=null){super(t,e),this.state=Ee.NONE,this.target=new b,this.cursor=new b,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:ls.ROTATE,MIDDLE:ls.DOLLY,RIGHT:ls.PAN},this.touches={ONE:os.ROTATE,TWO:os.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new b,this._lastQuaternion=new Ne,this._lastTargetPosition=new b,this._quat=new Ne().setFromUnitVectors(t.up,new b(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new rh,this._sphericalDelta=new rh,this._scale=1,this._panOffset=new b,this._rotateStart=new ut,this._rotateEnd=new ut,this._rotateDelta=new ut,this._panStart=new ut,this._panEnd=new ut,this._panDelta=new ut,this._dollyStart=new ut,this._dollyEnd=new ut,this._dollyDelta=new ut,this._dollyDirection=new b,this._mouse=new ut,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=l2.bind(this),this._onPointerDown=a2.bind(this),this._onPointerUp=c2.bind(this),this._onContextMenu=g2.bind(this),this._onMouseWheel=f2.bind(this),this._onKeyDown=d2.bind(this),this._onTouchStart=p2.bind(this),this._onTouchMove=m2.bind(this),this._onMouseDown=h2.bind(this),this._onMouseMove=u2.bind(this),this._interceptControlDown=_2.bind(this),this._interceptControlUp=x2.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=Ee.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Rh),this.update(),this.state=Ee.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){const e=this.object.position;Ye.copy(e).sub(this.target),Ye.applyQuaternion(this._quat),this._spherical.setFromVector3(Ye),this.autoRotate&&this.state===Ee.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=pn:i>Math.PI&&(i-=pn),s<-Math.PI?s+=pn:s>Math.PI&&(s-=pn),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Ye.setFromSpherical(this._spherical),Ye.applyQuaternion(this._quatInverse),e.copy(this.target).add(Ye),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=Ye.length();o=this._clampDistance(a*this._scale);const c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){const a=new b(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;const l=new b(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=Ye.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Or.origin.copy(this.object.position),Or.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Or.direction))<r2?this.object.lookAt(this.target):(Ch.setFromNormalAndCoplanarPoint(this.object.up,this.target),Or.intersectPlane(Ch,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>ia||8*(1-this._lastQuaternion.dot(this.object.quaternion))>ia||this._lastTargetPosition.distanceToSquared(this.target)>ia?(this.dispatchEvent(Rh),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?pn/60*this.autoRotateSpeed*t:pn/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Ye.setFromMatrixColumn(e,0),Ye.multiplyScalar(-t),this._panOffset.add(Ye)}_panUp(t,e){this.screenSpacePanning===!0?Ye.setFromMatrixColumn(e,1):(Ye.setFromMatrixColumn(e,0),Ye.crossVectors(this.object.up,Ye)),Ye.multiplyScalar(t),this._panOffset.add(Ye)}_pan(t,e){const i=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;Ye.copy(s).sub(this.target);let r=Ye.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/i.clientHeight,this.object.matrix),this._panUp(2*e*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),s=t-i.left,r=e-i.top,o=i.width,a=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientY),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(pn*this._rotateDelta.x/e.clientHeight),this._rotateUp(pn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(pn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-pn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(pn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-pn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(i,s)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const i=this._getSecondPointerPosition(t),s=.5*(t.pageX+i.x),r=.5*(t.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(pn*this._rotateDelta.x/e.clientHeight),this._rotateUp(pn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new ut,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,i={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function a2(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function l2(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function c2(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(af),this.state=Ee.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function h2(n){let t;switch(n.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case ls.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=Ee.DOLLY;break;case ls.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=Ee.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=Ee.ROTATE}break;case ls.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=Ee.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=Ee.PAN}break;default:this.state=Ee.NONE}this.state!==Ee.NONE&&this.dispatchEvent(jl)}function u2(n){switch(this.state){case Ee.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case Ee.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case Ee.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function f2(n){this.enabled===!1||this.enableZoom===!1||this.state!==Ee.NONE||(n.preventDefault(),this.dispatchEvent(jl),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(af))}function d2(n){this.enabled!==!1&&this._handleKeyDown(n)}function p2(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case os.ROTATE:if(this.enableRotate===!1){this.state=Ee.NONE;break}this._handleTouchStartRotate(n),this.state=Ee.TOUCH_ROTATE;break;case os.PAN:if(this.enablePan===!1){this.state=Ee.NONE;break}this._handleTouchStartPan(n),this.state=Ee.TOUCH_PAN;break;default:this.state=Ee.NONE}break;case 2:switch(this.touches.TWO){case os.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=Ee.TOUCH_DOLLY_PAN;break;case os.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=Ee.TOUCH_DOLLY_ROTATE;break;default:this.state=Ee.NONE}break;default:this.state=Ee.NONE}this.state!==Ee.NONE&&this.dispatchEvent(jl)}function m2(n){switch(this._trackPointer(n),this.state){case Ee.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case Ee.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case Ee.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case Ee.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=Ee.NONE}}function g2(n){this.enabled!==!1&&n.preventDefault()}function _2(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function x2(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const v2={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class rr{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const M2=new Jl(-1,1,1,-1,0,1);class S2 extends Ce{constructor(){super(),this.setAttribute("position",new ae([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new ae([0,2,0,0,2,0],2))}}const y2=new S2;class lf{constructor(t){this._mesh=new De(y2,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,M2)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class cf extends rr{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof Kn?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Zl.clone(t.uniforms),this.material=new Kn({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new lf(this.material)}render(t,e,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Ph extends rr{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,i){const s=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),t.setRenderTarget(i),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class E2 extends rr{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class b2{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const i=t.getSize(new ut);this._width=i.width,this._height=i.height,e=new bn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:wn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new cf(v2),this.copyPass.material.blending=Fi,this.timer=new lp}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){this.timer.update(),t===void 0&&(t=this.timer.getDelta());const e=this.renderer.getRenderTarget();let i=!1;for(let s=0,r=this.passes.length;s<r;s++){const o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,i),o.needsSwap){if(i){const a=this.renderer.getContext(),c=this.renderer.state.buffers.stencil;c.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),c.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Ph!==void 0&&(o instanceof Ph?i=!0:o instanceof E2&&(i=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new ut);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}const Fr={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

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

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class w2 extends rr{constructor(){super(),this.isOutputPass=!0,this.uniforms=Zl.clone(Fr.uniforms),this.material=new qu({name:Fr.name,uniforms:this.uniforms,vertexShader:Fr.vertexShader,fragmentShader:Fr.fragmentShader}),this._fsQuad=new lf(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},xe.getTransfer(this._outputColorSpace)===Te&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===El?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===bl?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===wl?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Tl?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===go?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Rl?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Al&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class T2 extends rr{constructor(t,e,i=null,s=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new ee}render(t,e,i){const s=t.autoClear;t.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),t.autoClear=s}}class A2 extends He{constructor(t=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=t,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new ut(.5,.5),this.rotation2D=0,this.addEventListener("removed",function(){this.traverse(function(e){e.element&&e.element instanceof e.element.ownerDocument.defaultView.Element&&e.element.parentNode!==null&&e.element.remove()})})}copy(t,e){return super.copy(t,e),this.element=t.element.cloneNode(!0),this.center=t.center,this.rotation2D=t.rotation2D,this}}const ns=new b,Lh=new Kt,Dh=new Kt,Ih=new b,Nh=new b;class R2{constructor(t={}){const e=this;let i,s,r,o;const a={objects:new WeakMap},c=t.element!==void 0?t.element:document.createElement("div");c.style.overflow="hidden",this.domElement=c,this.sortObjects=!0,this.getSize=function(){return{width:i,height:s}},this.render=function(p,_){p.matrixWorldAutoUpdate===!0&&p.updateMatrixWorld(),_.parent===null&&_.matrixWorldAutoUpdate===!0&&_.updateMatrixWorld(),Lh.copy(_.matrixWorldInverse),Dh.multiplyMatrices(_.projectionMatrix,Lh),h(p,p,_),this.sortObjects&&u(p)},this.setSize=function(p,_){i=p,s=_,r=i/2,o=s/2,c.style.width=p+"px",c.style.height=_+"px"};function l(p){p.isCSS2DObject&&(p.element.style.display="none");for(let _=0,m=p.children.length;_<m;_++)l(p.children[_])}function h(p,_,m){if(p.visible===!1){l(p);return}if(p.isCSS2DObject){ns.setFromMatrixPosition(p.matrixWorld),ns.applyMatrix4(Dh);const g=ns.z>=-1&&ns.z<=1&&p.layers.test(m.layers)===!0,x=p.element;if(x.style.display=g===!0?"":"none",g===!0){p.onBeforeRender(e,_,m);const v=100*p.center.x,A=100*p.center.y;x.style.transformOrigin=`${v}% ${A}%`;const T=-p.rotation2D,M=ns.x*r+r,E=-ns.y*o+o;x.style.transform=`translate(${-v}%, ${-A}%) translate(${M}px, ${E}px) rotate(${T}rad)`,x.parentNode!==c&&c.appendChild(x),p.onAfterRender(e,_,m)}const S={distanceToCameraSquared:d(m,p)};a.objects.set(p,S)}for(let g=0,x=p.children.length;g<x;g++)h(p.children[g],_,m)}function d(p,_){return Ih.setFromMatrixPosition(p.matrixWorld),Nh.setFromMatrixPosition(_.matrixWorld),Ih.distanceToSquared(Nh)}function f(p){const _=[];return p.traverseVisible(function(m){m.isCSS2DObject&&_.push(m)}),_}function u(p){const _=f(p).sort(function(g,x){if(g.renderOrder!==x.renderOrder)return x.renderOrder-g.renderOrder;const S=a.objects.get(g).distanceToCameraSquared,v=a.objects.get(x).distanceToCameraSquared;return S-v}),m=_.length;for(let g=0,x=_.length;g<x;g++)_[g].element.style.zIndex=m-g}}}function yo(n,t=!1){const e=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},o={},a=n[0].morphTargetsRelative,c=new Ce;c.morphTargetsRelative=a;let l=0;for(let h=0;h<n.length;++h){const d=n[h];let f=0,u=0;if(e!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const p in d.attributes){if(!i.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;r[p]===void 0&&(r[p]=[]),r[p].push(d.attributes[p]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const p in d.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;if(d.morphAttributes[p].length!==n[0].morphAttributes[p].length)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have the same number of morph targets for the "'+p+'" morph attribute.'),null;o[p]===void 0&&(o[p]=[]),o[p].push(d.morphAttributes[p]),u++}if(u!==s.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of morph attributes."),null;if(t){let p;if(e)p=d.index.count;else if(d.attributes.position!==void 0)p=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;c.addGroup(l,p,h),l+=p}}if(e){let h=0;const d=[];for(let f=0;f<n.length;++f){const u=n[f].index;for(let p=0;p<u.count;++p)d.push(u.getX(p)+h);h+=n[f].attributes.position.count}c.setIndex(d)}for(const h in r){const d=Uh(r[h]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;c.setAttribute(h,d)}for(const h in o){const d=o[h][0].length;if(d!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[h]=[];for(let f=0;f<d;++f){const u=[];for(let _=0;_<o[h].length;++_)u.push(o[h][_][f]);const p=Uh(u);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;c.morphAttributes[h].push(p)}}}return c}function Uh(n){let t,e,i,s=-1,r=0;for(let l=0;l<n.length;++l){const h=n[l];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}const o=new t(r),a=new Fn(o,e,i);let c=0;for(let l=0;l<n.length;++l){const h=n[l];if(h.isInterleavedBufferAttribute){const d=c/e;for(let f=0,u=h.count;f<u;f++)for(let p=0;p<e;p++){const _=h.getComponent(f,p);a.setComponent(f+d,p,_)}}else o.set(h.array,c);c+=h.count*e}return s!==void 0&&(a.gpuType=s),a}function C2(n,t=Math.PI/3){const e=n.index?n.toNonIndexed():n,i=e.attributes.position,s=i.count;let r;if(i.isBufferAttribute===!0&&i.itemSize===3&&i.normalized===!1)r=i.array;else{r=new Float64Array(s*3);for(let v=0;v<s;v++)r[3*v+0]=i.getX(v),r[3*v+1]=i.getY(v),r[3*v+2]=i.getZ(v)}const o=Math.cos(t),a=(1+1e-10)*100,c=s/3,l=new Float64Array(c*3);for(let v=0;v<c;v++){const A=9*v,T=r[A+0],M=r[A+1],E=r[A+2],D=r[A+3],C=r[A+4],I=r[A+5],F=r[A+6],G=r[A+7],U=r[A+8],N=F-D,H=G-C,k=U-I,it=T-D,P=M-C,B=E-I,V=H*B-k*P,st=k*it-N*B,gt=N*P-H*it,X=1/(Math.sqrt(V*V+st*st+gt*gt)||1);l[3*v+0]=V*X,l[3*v+1]=st*X,l[3*v+2]=gt*X}const h=new Int32Array(s),d=new Float64Array(s*3);let f=1;for(;f<s*2;)f<<=1;const u=f-1,p=new Int32Array(f);let _=0;for(let v=0;v<s;v++){const A=3*v,T=Math.trunc(r[A+0]*a),M=Math.trunc(r[A+1]*a),E=Math.trunc(r[A+2]*a);let D=(Math.imul(T,73856093)^Math.imul(M,19349663)^Math.imul(E,83492791))&u;for(;;){const C=p[D];if(C===0){const F=3*_;d[F+0]=T,d[F+1]=M,d[F+2]=E,p[D]=_+1,h[v]=_++;break}const I=3*(C-1);if(d[I+0]===T&&d[I+1]===M&&d[I+2]===E){h[v]=C-1;break}D=D+1&u}}const m=new Int32Array(_+1);for(let v=0;v<s;v++)m[h[v]+1]++;for(let v=0;v<_;v++)m[v+1]+=m[v];const g=new Int32Array(s),x=m.slice(0,_);for(let v=0;v<c;v++){const A=3*v;g[x[h[A+0]]++]=v,g[x[h[A+1]]++]=v,g[x[h[A+2]]++]=v}const S=new Float32Array(s*3);for(let v=0;v<c;v++){const A=3*v,T=l[A+0],M=l[A+1],E=l[A+2];for(let D=0;D<3;D++){const C=A+D,I=h[C];let F=0,G=0,U=0;for(let H=m[I],k=m[I+1];H<k;H++){const it=3*g[H],P=l[it+0],B=l[it+1],V=l[it+2];T*P+M*B+E*V>o&&(F+=P,G+=B,U+=V)}const N=1/(Math.sqrt(F*F+G*G+U*U)||1);S[3*C+0]=F*N,S[3*C+1]=G*N,S[3*C+2]=U*N}}return e.setAttribute("normal",new Fn(S,3,!1)),e}const P2=new b(0,.04,.62),L2=new b(0,-.05,.14),Re=(n,t,e)=>new b(n,t,e),al=Re(-1,0,0),D2=Re(0,-1,0),hn=n=>n.origin.clone().addScaledVector(n.z,n.size.z);function is(n,t,e,i){const s=t.clone().sub(n),r=s.length();s.normalize();const o=al.clone().addScaledVector(s,-al.dot(s)).normalize();return{origin:n.clone(),x:o,y:s.clone().cross(o),z:s,size:Re(e,i,r)}}function zr(n,t,e){const i=s=>e?s.clone().transformDirection(e):s.clone();return{origin:n,x:i(al),y:i(D2),z:i(Re(0,0,1)),size:t}}function Eo(n){const t=n.plan.kind==="humanoid"?n.plan:n.plan.kind==="human"?void 0:null;if(t===null)return;const e=n.height,i=e/1.75,s=n.posture==="sitting",r=e*n.legShare,o=.26*e,a=s?r-o:0,c=r-a,l=n.headHeight/2,h=n.limbRadius*1.15,d=n.hipHalf*.55,f=.06*i,u={};for(const[C,I]of[[-1,"left"],[1,"right"]]){const F=C*d,G=Re(F,0,c);let U,N,H=h,k=h,it;s?(U=Re(F,.24*e,o),N=Re(F,.24*e,f+h),H=h*.9,it=zr(Re(F,.24*e+.04*i,0),Re(h*2.2,.16*i,f))):t!=null&&t.digitigrade?(U=P2.clone().multiply(Re(1,e,c)).setX(F),N=L2.clone().multiplyScalar(e).setX(F),k=h*1.15,H=h*.85,it=zr(Re(F,.06*e,0),Re(h*2.1,h*3.57,f))):(N=Re(F,0,f+h),U=N.clone().lerp(Re(F,0,c-h*.5),.5),it=zr(Re(F,.04*i,0),Re(h*2.2,.16*i,f))),u[`${I}_thigh`]=is(U,G,k*2,k*2),u[`${I}_shin`]=is(N,U,H*2,H*2),u[`${I}_foot`]=it}const p=(t==null?void 0:t.hunch)??0,_=new Kt().makeTranslation(0,0,c).multiply(new Kt().makeRotationX(-p)),m=(C,I,F)=>Re(C,I,F).applyMatrix4(_),g=(e-a-c)/Math.cos(p),x=g-n.headHeight-.045*e,S=.05*e,v=x-n.limbRadius*1.2,A=.045*i*(t?t.shape.limbs*(t.neckScale??1):1),T=(C,I,F,G)=>is(m(C.x,C.y,C.z),m(I.x,I.y,I.z),F,G);u.waist=T(Re(0,0,-.07*e),Re(0,0,S),n.hipHalf*2,Math.max(n.hipHalf,n.waistHalf)*2*.62),u.torso=T(Re(0,0,S),Re(0,0,x),n.shoulderHalf*2,Math.max(n.waistHalf,n.shoulderHalf*.92)*2*.55),u.neck=T(Re(0,0,x-.01),Re(0,0,g-l*1.6),A*2,A*2);const M=m(0,0,g-l),E=t?new Kt().makeRotationFromEuler(new Ve(-t.droop,t.droop*.6,0)):void 0,D=Re(0,0,1).transformDirection(E??new Kt);u.head=zr(M.clone().addScaledVector(D,-l),Re(2*.84*l,2*.95*l,n.headHeight),E);for(const[C,I]of[[-1,"left"],[1,"right"]]){const F=m(C*n.shoulderHalf,0,v);let G;if(t){const k=s?c+.02*e:Math.max(.05*e,t.wristShare*e),it=Math.max(.12*e,F.z-k);G=Re(C*(n.hipHalf+n.limbRadius*1.6),F.y+Math.tan(t.reach)*it+(s?.08*i:0),F.z-it)}else G=Re(C*(n.hipHalf+n.limbRadius*1.6),s?.08*i:0,c-.02*e);const U=F.clone().lerp(G,.5),N=n.limbRadius;u[`${I}_upper_arm`]=is(U,F,N*2,N*2),u[`${I}_forearm`]=is(G,U,N*2,N*2);const H=t?G.clone().sub(F).normalize():Re(0,0,-1);u[`${I}_hand`]=is(G.clone().addScaledVector(H,N*2.55),G,N*2.5,N*2.5)}return u}function hf(n){return new Kt().makeTranslation(0,n.height/2,.13*(n.height/1.75)).multiply(new Kt().makeRotationX(Math.PI/2))}function I2(n){const t=Eo(n);if(!t||n.posture!=="reclining")return t;const e=hf(n);for(const i of Object.values(t)){i.origin.applyMatrix4(e);for(const s of[i.x,i.y,i.z])s.transformDirection(e)}return t}function N2(n){return new Kt().makeBasis(n.x.clone().multiplyScalar(n.size.x),n.y.clone().multiplyScalar(n.size.y),n.z.clone().multiplyScalar(n.size.z)).setPosition(n.origin)}const ct=(n,t,e)=>new b(n,t,e),Ut=(n,t)=>({...n,name:t});function ll(n,t){for(const e of n)e.geometry.applyMatrix4(t);return n}function U2(n){const t=n.plan;return t.kind==="humanoid"?B2(n,t):t.kind==="animal"?H2(n,t):O2(n)}function O2(n){const t=n.height,e=n.footprint?Math.min(n.footprint.width,n.footprint.depth):.36*(t/1.75),i=Math.max(.02,Math.min(e*.45,t/4));return[Ut(Le(ct(0,0,i),ct(0,0,Math.max(i*1.01,t-i)),i,n.colours.skin),"placeholder")]}const Oh=[.8,.4,.1,-.25,.6,-.1,.25];function F2(n,t){const e=n.geometry.index?n.geometry.toNonIndexed():n.geometry;e!==n.geometry&&n.geometry.dispose();const i=e.getAttribute("position").count;e.setIndex([...Array(i).keys()]),e.computeVertexNormals();const s=new Float32Array(i);for(let r=0;r<i/3;r++)s.fill(Oh[r*3%Oh.length],r*3,r*3+3);return{...n,geometry:e,shade:s,tone:t}}const sa=new b(.85,1.35,.85);function z2(n,t,e,i){const s=n.colours,r=t.headColour??s.skin,o=s.eyes??kn,a=[],c=l=>[-1,1].map(l);switch(t.head){case"wolf":{a.push(Ut(se(ct(0,0,0),e,r,ct(.92,.95,.9),12),"skull")),a.push(Ut(se(ct(0,e*.95,-e*.28),e*.5,t.accent,ct(.72,1.55,.68),10),"muzzle")),a.push(Ut(se(ct(0,e*.8,-e*.58),e*.36,t.accent,ct(.66,1.3,.45),8),"jaw")),a.push(Ut(se(ct(0,e*1.7,-e*.18),e*.15,kn,void 0,8),"nose")),a.push(...c(l=>Ut(ui(ct(l*e*.5,-e*.1,e*.6),ct(l*.32,-.1,1).normalize(),e*.28,e*.85,r,4),"ear"))),a.push(...c(l=>Ut(se(ct(l*e*.36,e*.74,e*.16),e*.11,o,void 0,8),"eye")));break}case"slack":{a.push(Ut(se(ct(0,0,0),e,r,ct(.84,.95,1),12),"skull")),a.push(...c(l=>Ut(se(ct(l*e*.32,e*.84,e*(l<0?.14:.06)),e*.11,o,void 0,8),"eye"))),a.push(...c(l=>Ut(se(ct(l*e*.32,e*.93,e*(l<0?.14:.06)),e*.04,kn,void 0,6),"pupil"))),a.push(Ut(Qe(new Ei(e*.13,e*.3,6),r,ct(0,e*.98,-e*.08)),"nose")),a.push(Ut(se(ct(0,e*.84,-e*.48),e*.16,t.accent,ct(1.2,.5,1),8),"mouth")),a.push(...c(l=>Ut(se(ct(l*e*.84,0,0),e*.22,r,ct(.5,1,1.3),8),"ear")));break}case"ghoul":{a.push(Ut(se(ct(0,0,e*.08),e,r,ct(.8,.92,1),12),"skull")),a.push(Ut(se(ct(0,e*.32,-e*.55),e*.62,t.accent,ct(1.08,.95,.72),10),"jaw")),a.push(Ut(Gi(ct(0,e*.92,-e*.58),ct(e*.7,e*.06,e*.07),kn),"mouth")),a.push(...c(l=>Ut(se(ct(l*e*.3,e*.78,e*.18),e*.09,o,void 0,8),"eye"))),a.push(...c(l=>Ut(ui(ct(l*e*.74,0,e*.1),ct(l,-.3,.5).normalize(),e*.16,e*.4,r,4),"ear")));break}case"primate":{a.push(Ut(se(ct(0,0,0),e,r,ct(.95,.9,.95),12),"skull")),a.push(Ut(se(ct(0,e*.42,-e*.08),e*.7,t.accent,ct(.85,.75,.95),10),"face")),a.push(Ut(Le(ct(-e*.46,e*.82,e*.26),ct(e*.46,e*.82,e*.26),e*.14,r,!1),"brow")),a.push(Ut(se(ct(0,e*.86,-e*.36),e*.38,t.accent,ct(1.1,.8,.75),8),"muzzle")),a.push(...c(l=>Ut(se(ct(l*e*.12,e*1.15,-e*.3),e*.05,kn,void 0,6),"nostril"))),a.push(...c(l=>Ut(se(ct(l*e*.3,e*.92,e*.1),e*.09,o,void 0,8),"eye"))),a.push(...c(l=>Ut(se(ct(l*e*.95,0,0),e*.26,t.accent,ct(.5,1,1.1),8),"ear")));break}case"crystal":{a.push(Ut(Qe(new Wl(e,0),r,ct(0,0,0),void 0,ct(.86,.95,1.05)),"skull")),a.push(...c(l=>Ut(Qe(new Xl(e*.12,0),o,ct(l*e*.32,e*.82,e*.12)),"eye"))),a.push(Ut(ui(ct(e*.15,-e*.2,e*.75),ct(.25,-.35,1).normalize(),e*.2,e*.7,t.accent,4),"spur"));break}case"shark":{a.push(Ut(se(ct(0,e*.25,0),e,r,sa,12),"snout")),a.push(Ut(se(ct(0,e*.32,-e*.3),e,t.accent,ct(.78,1.25,.58),10),"underside"));const l=1.9,h=new li(1,.06,3,16,l);h.rotateZ(Math.PI/2-l/2),h.scale(e*.8,e*1.27,e),h.translate(0,e*.32,-e*.36),a.push(Ut({geometry:h,colour:kn},"mouth"));for(const _ of[-1,1]){const m=48*Math.PI/180;a.push(Ut(se(ct(_*e*sa.x*Math.sin(m),e*.25+e*sa.y*Math.cos(m),e*.08),e*.12,o,void 0,8),"eye")),a.push(Ut(se(ct(_*e*.17,e*1.54,-e*.1),e*.045,kn,void 0,6),"nostril"));for(let g=0;g<3;g++)a.push(Ut(Gi(ct(_*e*.5,-e*(.05+g*.14),-e*.82),ct(e*.05,e*.035,e*.3),$r(r,kn,.55)),"gill"))}const d=-e*.45,f=-e*1.2,u=new Yn(e*.6,i*1.05,d-f,12,1);u.rotateX(Math.PI/2),u.translate(0,e*.05,(d+f)/2),a.push(Ut({geometry:u,colour:r},"taper"));const p=new Ei(e*.42,e*.95,4);p.scale(.22,1,1),p.rotateX(Math.PI/2-.45),a.push(Ut(Qe(p,r,ct(0,-e*.2,e*.95)),"fin"));break}}if(n.headCovered){const l=new On(e*1.08,12,5,0,Math.PI*2,0,Math.PI/2);l.rotateX(-.5),a.push(Ut({geometry:l,colour:s.head},"hood"))}return a}function B2(n,t){const e=n.colours,i=n.height,s=i/1.75,r=t.covering==="crystal",o=n.posture==="sitting",a=Eo(n),c=hn(a.left_thigh).z,l=a.head.size.z/2,h=n.limbRadius*1.15,d=a.left_foot.size.z,f=[];for(const D of["left","right"]){const C=a[`${D}_thigh`],I=a[`${D}_shin`],F=a[`${D}_foot`],G=F.origin.x;o||!t.digitigrade?(o?(f.push(Ut(Le(hn(C),C.origin,h,e.legs,!r),"thigh")),f.push(Ut(Le(C.origin,I.origin,I.size.x/2,e.legs,!r),"shin"))):f.push(...oo(hn(C).addScaledVector(C.z,-h*.5),C.origin,I.origin,h,e.legs,["thigh","shin"],!r)),f.push(Gi(ct(G,F.origin.y,d/2),F.size.clone(),e.feet))):(f.push(Ut(Le(hn(C),C.origin,C.size.x/2,e.legs,!r),"thigh")),f.push(Ut(Le(C.origin,I.origin,I.size.x/2,e.legs,!r),"shin")),f.push(Ut(Le(I.origin,ct(G,.03*i,d),h*.65,e.feet,!r),"heel")),f.push(Ut(se(F.origin.clone().setZ(d*.6),h*1.05,e.feet,ct(1,1.7,.6),8),"paw")))}const u=new Kt().makeBasis(a.waist.x.clone().negate(),a.waist.y.clone().negate(),a.waist.z).setPosition(0,0,c),p=a.waist.origin.clone().sub(ct(0,0,c)).dot(a.waist.z),_=p+a.waist.size.z,m=_+a.torso.size.z,g=m-n.limbRadius*1.2,x=a.neck.size.x/2,S=r?6:void 0,v=[qn(p,_,n.hipHalf,n.waistHalf,.62,e.hips,0,S),qn(_,m,n.waistHalf,n.shoulderHalf*.92,.55,e.torso,0,S),Le(ct(-n.shoulderHalf*.9,0,g),ct(n.shoulderHalf*.9,0,g),n.limbRadius*1.35,e.torso,!r),qn(m-.01,m-.01+a.neck.size.z,x,x,1,e.neck,0,S)];if(t.chest&&e.torso===e.skin){const D=m-_;v.push(Ut(se(ct(0,n.shoulderHalf*.1,_+D*.7),1,t.accent,ct(n.shoulderHalf*.72,n.shoulderHalf*.42,D*.24),12),"chest")),v.push(Ut(se(ct(0,n.waistHalf*.12,_+D*.35),1,t.accent,ct(n.waistHalf*.6,n.waistHalf*.45,D*.3),12),"chest"))}if(r)for(const[D,C,I,F,G]of[[-.75,-.1,-.5,-.3,1],[.7,-.15,.45,-.4,.8],[.25,-.45,.2,-.8,.9],[-.3,-.4,-.3,-.7,.7]])v.push(Ut(ui(ct(D*n.shoulderHalf,C*n.shoulderHalf,g+n.limbRadius*.4),ct(I,F,1).normalize(),.035*s*G,.16*s*G,t.accent,4),"shard"));f.push(...ll(v,u));const A=a.head,T=A.origin.clone().addScaledVector(A.z,l);f.push(...ll(z2(n,t,l,x),new Kt().makeBasis(A.x.clone().negate(),A.y.clone().negate(),A.z).setPosition(T)));for(const D of["left","right"]){const C=a[`${D}_upper_arm`],I=a[`${D}_hand`];f.push(...oo(hn(C),C.origin,a[`${D}_forearm`].origin,n.limbRadius,e.arms,["upper arm","forearm"],!r)),f.push(Ut(se(I.origin.clone().addScaledVector(I.z,n.limbRadius*1.25),n.limbRadius*1.25,e.hands,void 0,8),"hand"))}const M=e.skin,E=T.z+l*.8;for(const D of n.extras)if(D==="tail"){const C=ct(0,-n.hipHalf*.6,c),I=ct(0,C.y-.3*s,o?.04:c-.16*i);f.push(Ut(Le(C,I,n.limbRadius*(t.covering==="fur"?.85:.6),M,!1),"tail"))}else if(D==="horns"||D==="antlers")for(const C of[-1,1]){const I=ct(T.x+C*l*.45,T.y,E);D==="horns"?f.push(Ut(ui(I,ct(C*.35,.2,1).normalize(),l*.16,l*.7,Us,6),"horn")):f.push(Ut(Le(I,I.clone().add(ct(C*l,-l*.2,l*1.4)),l*.07,Us,!1),"antler"))}else if(D==="wings")for(const C of[-1,1])f.push(Ut(ff(C,s,ct(C*n.shoulderHalf*.45,-.1*s,g-.04*i).applyMatrix4(u),M),"wing"));return r?f.map(D=>F2(D,t.accent)):f}function H2(n,t){var d,f,u,p;const e=n.height,i=t.animal==="snake",s=i?Y2(t,((d=n.footprint)==null?void 0:d.width)??e*2,((f=n.footprint)==null?void 0:f.depth)??e*8,e):t.animal==="duck"?k2(t):G2(t),r=new _n;for(const _ of s)_.geometry.computeBoundingBox(),_.geometry.boundingBox&&r.union(_.geometry.boundingBox);const o=r.getSize(new b),a=r.getCenter(new b),c=((u=n.footprint)==null?void 0:u.width)??e*(o.x/o.z),l=((p=n.footprint)==null?void 0:p.depth)??e*(o.y/o.z),h=i?1:t.animal==="songbird"?Math.min(c/o.x,e/o.z):Math.min(c/o.x,l/o.y,e/o.z);return ll(s,new Kt().makeScale(h,h,h).multiply(new Kt().makeTranslation(-a.x,-a.y,-r.min.z)))}function k2(n){const t=$r(n.skin,kn,.65),e=[Ut(se(ct(0,-.02,.32),.2,n.skin,ct(1.1,2.05,.95),12),"body"),Ut(se(ct(0,.24,.3),.17,n.accent,ct(1.05,1,1.05),10),"breast"),...[-1,1].map(i=>Ut(se(ct(i*.16,-.08,.38),.13,n.wing,ct(.55,2.1,.75),10),"wing")),Ut(ui(ct(0,-.38,.37),ct(0,-1,.4).normalize(),.09,.17,t,5),"tail"),Ut(Le(ct(0,.3,.42),ct(0,.36,.6),.065,n.head,!1),"neck"),Ut(Qe(new li(.068,.014,3,10),"#f2f0ea",ct(0,.31,.45)),"ring"),Ut(se(ct(0,.38,.65),.1,n.head,ct(.9,1.15,.95),10),"head"),Ut(se(ct(0,.53,.61),.06,n.beak,ct(.9,1.6,.38),8),"bill"),...[-1,1].map(i=>Ut(se(ct(i*.072,.42,.68),.013,n.eyes,void 0,6),"eye"))];for(const i of[-1,1])e.push(Ut(Le(ct(i*.07,.02,.15),ct(i*.07,.04,.02),.018,n.feet,!1),"leg")),e.push(Ut(Gi(ct(i*.07,.08,.008),ct(.08,.1,.016),n.feet),"foot"));return e}function G2(n){const t=[Ut(se(ct(0,0,.33),.2,n.skin,ct(.9,1.35,1),12),"body"),Ut(se(ct(0,.17,.31),.15,n.accent,ct(.9,.95,1),10),"breast"),Ut(se(ct(0,.2,.57),.12,n.head,void 0,10),"head"),Ut(ui(ct(0,.29,.57),ct(0,1,-.15).normalize(),.045,.13,n.beak,5),"beak"),Ut(Gi(ct(0,-.4,.41),ct(.16,.26,.025),n.wing,new Ve(-.5,0,0)),"tail"),...[-1,1].map(e=>Ut(se(ct(e*.085,.28,.61),.02,n.eyes,void 0,6),"eye")),...[-1,1].map(e=>Ut(se(ct(e*.15,-.1,.39),.12,n.wing,ct(.35,2,.75),8),"wing"))];for(const e of[-1,1])t.push(Ut(Le(ct(e*.05,.03,.16),ct(e*.05,.05,.02),.012,n.feet,!1),"leg")),t.push(Ut(Gi(ct(e*.05,.08,.006),ct(.03,.08,.012),n.feet),"foot"));return t}const V2=.03,W2=.6,X2=.022;function Y2(n,t,e,i){const s=Math.max(W2,t,e,i),r=Math.max(V2,s*X2),o=r*1.3,a=Math.max(s*.1,Math.min(s*.15,i-2*r-o)),c=[];if(e>=s*.8){const x=e*.85,S=Math.max(r*1.5,Math.min(t/2-r*1.2,s*.12));for(let v=0;v<=14;v++)c.push(ct(S*Math.sin(v/14*Math.PI*2.5),-x/2+v/14*x*.9,r))}else{const x=r*2.3,S=r*2.2,A=(Math.sqrt(s*.85*x/Math.PI+S*S)-S)/x,T=Math.max(16,Math.min(40,Math.round(A*14)));for(let M=0;M<=T;M++){const E=A*Math.PI*2*(1-M/T),D=S+x*E/(Math.PI*2);c.push(ct(D*Math.sin(E),D*Math.cos(E),r))}}const l=c[c.length-1],h=ct(0,1,0),d=x=>l.clone().addScaledVector(h,s*.06*Math.sin(x*Math.PI/2)).setZ(r+a*(1-Math.cos(x*Math.PI/2))),f=[1,2,3,4].map(x=>d(x/4)),u=[...c,...f],p=[];for(let x=0;x<u.length-1;x++){const S=(x+.5)/(u.length-1),v=x>=c.length-1,A=r*(.3+.7*Math.min(1,S/.3))*(v?.85:1);p.push(Ut(Le(u[x],u[x+1],A,!v&&Math.floor(x/2)%2?n.accent:n.skin,!1),"segment"))}const _=u[u.length-1].clone().addScaledVector(h,o*.9),m=new Ve(0,0,0);p.push(Ut(Qe(new On(o,10,8),n.head,_,m,ct(1,1.5,.7)),"head"));for(const x of[-1,1]){const S=ct(x*o*.75,o*.45,o*.3).applyEuler(m).add(_);p.push(Ut(se(S,o*.2,n.eyes,void 0,6),"eye"))}const g=_.clone().addScaledVector(h,o*1.45);return p.push(Ut(Le(g,g.clone().addScaledVector(h,o*1.1),o*.08,n.beak,!1),"tongue")),p}const he=(n,t)=>({...n,name:t}),or=10,ra="#ece8e0",q2=1.3,Z2=kn,cl=.006,Rs=1.03,oa=.005,K2=.66;function Qe(n,t,e,i,s){const r=new Kt().compose(e,new Ne().setFromEuler(i??new Ve),s??new b(1,1,1));return n.applyMatrix4(r),{geometry:n,colour:t}}const uf=.05,$2=14,J2=1.45,Q2=.15,j2=1.8;function qr(n,t,e,i,s=1,r,o=()=>1,a=0,c={swing:1.6,lobes:5,strands:0}){if(e==="straight")return;const l=new Float32Array(n.getAttribute("position").count),h=n.getAttribute("position"),d=new b,f=new b,u=new b;for(let p=0;p<h.count;p++){d.fromBufferAttribute(h,p),f.subVectors(d,t(d)),u.copy(d);const _=Math.atan2(u.y-t(d).y,u.x-t(d).x),m=((u.z-a)*s+a)/i,[g,x]=e==="wavy"?[uf,Math.sin(m*7+c.swing*Math.sin(_*c.lobes)+c.strands*Math.sin(_*17))]:e==="curly"?[.09,Math.sin(_*7)*Math.sin(m*9)]:[.1,Math.sin(_*11)*Math.sin(m*14)];l[p]=.5+.5*x;const S=i*g*l[p]*o(d,p)/Math.max(1e-6,f.length());d.addScaledVector(f,S),h.setXYZ(p,d.x,d.y,d.z)}return h.needsUpdate=!0,n.computeVertexNormals(),l}function tx(n,t,e,i,s,r,o,a){const c=n.getAttribute("position"),l=c.count/2,h=l/(t+1)-1,d=new Float32Array(c.count),f=new b,u=new b;for(let p=0;p<c.count;p++){const _=p%l,[m,g]=[_%(t+1),Math.floor(_/(t+1))],x=Math.floor(m/2),S=m%2===1,v=F=>{const G=Math.sin(x*12.9898+F*78.233)*43758.5453;return G-Math.floor(G)},A=2*Math.PI*g/(e*(.67+.83*v(1)))+2*Math.PI*v(2),T=Math.min(1,Math.min(m,t-m)/2),M=(S?.45+.3*v(3)+.3*Math.sin(A):.12)*T,E=S?(.2+.15*v(4))*Math.cos(A)*T:0;f.fromBufferAttribute(c,p),u.subVectors(f,i(f));const D=Math.max(1e-6,Math.hypot(u.x,u.y)),C=a(f,m),I=E*D*s/t;f.x+=(u.x/D*r*.12*M+-u.y/D*I)*C,f.y+=(u.y/D*r*.12*M+u.x/D*I)*C,g===h&&S&&(f.z-=o*v(5)),c.setXYZ(p,f.x,f.y,f.z),d[p]=M}return c.needsUpdate=!0,n.computeVertexNormals(),d}const us=.75,aa={straight:0,wavy:us*.375,curly:us*.3125,coily:us*.3125};function ex(n,t,e){return!t||!e?n:{...n,shade:t.map(i=>us*i*i),tone:e}}function hl(n,t){const e=new Float32Array(n);for(let i=0;i<n;i++)e[i]=i%t%2?1:.15;return e}const Fh=16,zh=4,ce=n=>{const t=Math.min(1,Math.max(0,n));return t*t*(3-2*t)};function Br(n){const t=Math.abs(n-Math.PI/2);return .96+.79*ce((t-.25)/.9)-.79*ce((t-1.5)/.5)}function Bh(n,t,e,i,s,r,o){const a=[],c=[];for(let d=0;d<=e;d++)for(let f=0;f<=t;f++){const u=i+s*f/t,p=r(u)+(o(u)-r(u))*d/e;a.push(-n*Math.cos(u)*Math.sin(p),n*Math.cos(p),n*Math.sin(u)*Math.sin(p))}const l=(d,f)=>f*(t+1)+d;for(let d=0;d<e;d++)for(let f=0;f<t;f++){const u=l(f+1,d),p=l(f,d),_=l(f,d+1),m=l(f+1,d+1);c.push(u,p,m,p,_,m)}const h=new Ce;return h.setAttribute("position",new ae(a,3)),h.setIndex(c),h.computeVertexNormals(),h}function nx(n,t){const e=n.getIndex();if(e){for(let i=0;i<e.count;i++){const s=e.getX(i),[r,o]=[s%(t+1),Math.floor(s/(t+1))];o===0?e.setX(i,0):r===t&&e.setX(i,o*(t+1))}e.needsUpdate=!0,n.computeVertexNormals(),ul(n,t)}}function ul(n,t){const e=n.getAttribute("normal");for(let i=0;i<e.count;i++){const[s,r]=[i%(t+1),Math.floor(i/(t+1))],o=r===0?0:s===t?r*(t+1):i;o!==i&&e.setXYZ(i,e.getX(o),e.getY(o),e.getZ(o))}e.needsUpdate=!0}function fl(n){const t=n.clone(),e=t.getIndex();if(e){const r=e.array,o=new Uint32Array(r.length);for(let a=0;a<r.length;a+=3)o[a]=r[a],o[a+1]=r[a+2],o[a+2]=r[a+1];t.setIndex(new Fn(o,1))}const i=t.getAttribute("normal");for(let r=0;r<i.count;r++)i.setXYZ(r,-i.getX(r),-i.getY(r),-i.getZ(r));const s=yo([n,t],!1);if(n.dispose(),t.dispose(),!s)throw new Error("hair could not be made two-sided");return s}function ix(n,t,e,i,s){const r=n.getAttribute("position"),o=[],a=new b;for(let u=0;u<=t;u++)o.push(r.getX(e*(t+1)+u),r.getY(e*(t+1)+u),r.getZ(e*(t+1)+u));for(let u=0;u<=t;u++){a.set(o[u*3],o[u*3+1],o[u*3+2]).sub(i);const p=Math.min(a.length(),s(a.clone().normalize()));a.setLength(p).add(i),o.push(a.x,a.y,a.z)}const c=[];for(let u=0;u<t;u++){const p=u+1===t?0:u+1,[_,m,g,x]=[u,p,t+1+u,t+1+p];c.push(_,g,m,m,g,x)}const l=new Ce;l.setAttribute("position",new ae(o,3)),l.setIndex(c),l.computeVertexNormals();const h=fl(l),d=h.getAttribute("normal"),f=n.getAttribute("normal");for(let u=0;u<d.count;u++){const p=e*(t+1)+u%(t+1);d.setXYZ(u,f.getX(p),f.getY(p),f.getZ(p))}return h}function ff(n,t,e,i){const s=new ku;s.moveTo(0,0),s.quadraticCurveTo(.15,.32,.62,.44),s.quadraticCurveTo(.56,.26,.5,.2),s.quadraticCurveTo(.46,.05,.37,.08),s.quadraticCurveTo(.33,-.1,.23,-.05),s.quadraticCurveTo(.18,-.26,.08,-.22),s.quadraticCurveTo(.04,-.1,0,-.08),s.closePath();const r=new Vl(s,{depth:.015,bevelEnabled:!1,curveSegments:4});return r.setIndex([...Array(r.getAttribute("position").count).keys()]),r.translate(0,0,-.0075),r.rotateX(Math.PI/2),n<0&&r.rotateZ(Math.PI),r.rotateZ(-n*.5),r.scale(t,t,t),r.translate(e.x,e.y,e.z),{geometry:r,colour:i}}const Ui=(n,t,e,i)=>Le(n,t,e,i,!1);function Le(n,t,e,i,s=!0){const r=n.distanceTo(t),o=new Bl(e,Math.max(.001,r),s?2:1,s?or:6),a=new b().subVectors(t,n).normalize(),c=new Ne().setFromUnitVectors(new b(0,1,0),a);return o.applyMatrix4(new Kt().compose(n.clone().add(t).multiplyScalar(.5),c,new b(1,1,1))),{geometry:o,colour:i}}function oo(n,t,e,i,s,r,o=!0){const a=o?2:1,c=(l,h)=>{const d=t.distanceTo(l),f=[new ut(i,0),new ut(i,d)];for(let _=1;_<=a;_++){const m=_/a*(Math.PI/2);f.push(new ut(_===a?0:i*Math.cos(m),d+i*Math.sin(m)))}const u=new xo(f,o?or:6),p=new b().subVectors(l,t).normalize();return u.applyMatrix4(new Kt().compose(t,new Ne().setFromUnitVectors(new b(0,1,0),p),new b(1,1,1))),he({geometry:u,colour:s},h)};return[c(n,r[0]),c(e,r[1])]}function qn(n,t,e,i,s,r,o=0,a=or*2){const c=new Yn(i,e,Math.max(.001,t-n),a);return Qe(c,r,new b(0,o,(n+t)/2),new Ve(Math.PI/2,0,0),new b(1,1,s))}function se(n,t,e,i,s=or){return Qe(new On(t,s,Math.max(4,s-2)),e,n,void 0,i)}function Gi(n,t,e,i){return Qe(new fi(t.x,t.y,t.z),e,n,i)}function Cs(n,t,e,i,s,r){const o=new Yn(i,i,cl,or*2,1,!0);return Qe(o,r,new b(n,t,e),new Ve(Math.PI/2,0,0),new b(1,1,s))}function ui(n,t,e,i,s,r=5){const o=new Ei(e,i,r,1,!0);return o.applyMatrix4(new Kt().compose(n.clone().addScaledVector(t,i/2),new Ne().setFromUnitVectors(new b(0,1,0),t),new b(1,1,1))),{geometry:o,colour:s}}function sx(n,t,e,i){const[s,r]=[1.25,-2.3],o=14,a=[],c=[];for(let d=0;d<=o;d++){const f=d/o,u=s+(r-s)*f,p=Math.min(1,f/.12,(1-f)/.12),_=1+i*Math.sqrt(Math.max(0,p)),[m,g]=[Math.sin(u),Math.cos(u)];for(const[x,S]of[[1,.1],[_,.055]])for(const v of[-1,1])a.push(v*S*n,m*x*n*t.y,e+g*x*n*t.z)}const l=(d,f)=>d*4+f;for(let d=0;d<o;d++)for(const[f,u]of[[1,3],[2,0],[3,2]])c.push(l(d,f),l(d+1,u),l(d+1,f),l(d,f),l(d,u),l(d+1,u));c.push(l(0,0),l(0,3),l(0,1),l(0,0),l(0,2),l(0,3)),c.push(l(o,0),l(o,1),l(o,3),l(o,0),l(o,3),l(o,2));const h=new Ce;return h.setAttribute("position",new ae(a,3)),h.setIndex(c),h.computeVertexNormals(),h}const df=8;function rx(n,t,e){const i=df,s=2,r=[];for(let l=0;l<=s;l++)for(let h=0;h<=i;h++){const d=h/i,f=-.45+1.55*d,u=.95-.5*Math.min(1,d/.6)+.45*l/s,p=new b(Math.cos(u)*Math.sin(f)*n.x,Math.cos(u)*Math.cos(f)*n.y,Math.sin(u)*n.z).normalize(),_=e(p).multiplyScalar(1.03);r.push(_.x,_.y,t+_.z)}const o=[],a=(l,h)=>h*(i+1)+l;for(let l=0;l<s;l++)for(let h=0;h<i;h++)o.push(a(h,l),a(h+1,l+1),a(h+1,l),a(h,l),a(h,l+1),a(h+1,l+1));const c=new Ce;return c.setAttribute("position",new ae(r,3)),c.setIndex(o),c.computeVertexNormals(),c}function ox(n,t,e,i,s,r,o){const a=n.height/1.75,c=n.colours.head,l=n.colours.hairSheen,h={none:0,shaved:0,cropped:.04,short:.08,"chin-length":.18,"shoulder-length":.28,long:.42,"waist-length":.58}[n.hair]*a,d=(u,p,_,m=1.08)=>{const g=new b(u,p,_).normalize();return new b(g.x*i*s.x*m,g.y*i*s.y*m,e+g.z*i*s.z*m)},f=[];switch(t){case"ponytail":{const u=d(0,-1,.25,1.05),p=new b(0,u.y-i*.35,u.z-Math.max(h,.1*a));f.push(he(Le(u,p,i*.2,c),"ponytail")),f.push(he(se(u,i*.14,n.colours.ink,void 0,6),"ponytail"));break}case"braided":for(const u of[-1,1]){const p=d(u*.75,-.55,-.35,1.02),_=new b(u*i*.85,-i*.95,p.z-Math.max(h,.12*a));f.push(he(Le(p,_,i*.13,c),"braid"));const m=7;for(let g=0;g<m;g++)f.push(he(se(p.clone().lerp(_,g/(m-1)),i*.17,c,void 0,6),"braid"))}break;case"bun":{const u=i*.46,p=d(0,-.65,.76,r+.36),_=he(se(p,u,c,void 0,12),"bun"),m=qr(_.geometry,()=>p,n.hairTexture,i*.6),g=_.geometry.getAttribute("normal"),x=new b(0,-.35,1).normalize(),S=new Float32Array(g.count);for(let T=0;T<g.count;T++){const M=Math.max(0,g.getX(T)*x.x+g.getY(T)*x.y+g.getZ(T)*x.z);S[T]=Math.min(1,.55*M*M+(m?.4*m[T]*m[T]:0))}f.push(l?{..._,shade:S,tone:l}:_);const v=d(0,-.65,.76,r+.02),A=new li(u*.62,i*.06,4,14);A.applyQuaternion(new Ne().setFromUnitVectors(new b(0,0,1),p.clone().sub(v).normalize())),A.translate(...v.clone().lerp(p,.45).toArray()),f.push(he({geometry:A,colour:l??n.colours.ink},"bun"));break}case"topknot":{const u=d(0,-.1,1,1.22);f.push(he(se(u,i*.26,c,void 0,8),"topknot")),f.push(he(se(d(0,-.1,1,1.05),i*.14,n.colours.ink,void 0,6),"topknot"));break}case"dreadlocks":for(let u=0;u<11;u++){const p=Math.PI*(.9+1.2*u/10),_=d(Math.cos(p),Math.sin(p),.15,1.02),m=new b(_.x*1.2,_.y*1.2,_.z-Math.max(h,.1*a)*(u%2?.85:1));f.push(he(Ui(_,m,i*.11,c),"lock"))}break;case"spiky":for(let u=0;u<9;u++){const p=u*Math.PI*2/8,_=u===8?new b(0,0,1):new b(Math.cos(p)*.7,Math.sin(p)*.7,.75).normalize();f.push(he(ui(d(_.x,_.y,_.z,1),_,i*.14,i*.55,c),"spike"))}break;case"mohawk":f.push(he({geometry:sx(i,s,e,n.hair==="cropped"?.5:.65),colour:c},"crest"));break;case"brushed":{f.push(he(Ui(d(-.32,.45,.85,1.07),d(-.32,-.45,.85,1.07),i*.035,n.colours.skin),"parting"));const u=rx(s,e,o),p=l?{shade:hl(u.getAttribute("position").count,df+1).map(_=>_*.5),tone:l}:{};f.push(he({geometry:u,colour:c,...p},"fringe"));break}}return f}const ax={average:{half:.26,depth:.16},small:{half:.19,depth:.12},large:{half:.34,depth:.2},pointed:{half:.26,depth:.15}};function lx(n){const t=n.colours,e=n.height,i=e/1.75,s=[],r=n.posture==="sitting",o=Eo(n),a=hn(o.left_thigh).z,c=hn(o.torso).z,l=o.head.size.z/2,h=o.head.origin.z+l,d=o.left_thigh.size.x/2,f=o.left_foot.size.z,u=new Set(n.outlined);for(const L of["left","right"]){const ht=o[`${L}_thigh`],Mt=o[`${L}_shin`],qt=o[`${L}_foot`],ot=qt.origin.x;r?(s.push(he(Le(hn(ht),ht.origin,d,t.legs),"thigh")),s.push(he(Le(ht.origin,Mt.origin,Mt.size.x/2,t.legs),"shin"))):s.push(...oo(hn(ht).addScaledVector(ht.z,-d*.5),ht.origin,Mt.origin,d,t.legs,["thigh","shin"])),s.push(Gi(new b(ot,qt.origin.y,f/2),qt.size.clone(),t.feet)),u.has("ankles")&&s.push(he(Cs(ot,Mt.origin.y,f+.02*i,d*Rs,1,t.ink),"band")),u.has("hips")&&s.push(he(Cs(ot,r?.06*i:0,o.waist.origin.z-cl,d*Rs,1,t.ink),"band"))}const p=o.torso.origin.z;s.push(qn(o.waist.origin.z,p,n.hipHalf,n.waistHalf,.62,t.hips)),s.push(qn(p,c,n.waistHalf,n.shoulderHalf*.92,.55,t.torso));const _=hn(o.left_upper_arm).z;s.push(Le(new b(-n.shoulderHalf*.9,0,_),new b(n.shoulderHalf*.9,0,_),n.limbRadius*1.35,t.torso)),u.has("waist")&&s.push(he(Cs(0,0,p,n.waistHalf*Rs,.62,t.ink),"band"));for(const L of["left","right"]){const ht=o[`${L}_upper_arm`],Mt=o[`${L}_forearm`],qt=o[`${L}_hand`],ot=Mt.origin;s.push(...oo(hn(ht),ht.origin,ot,n.limbRadius,t.arms,["upper arm","forearm"])),s.push(se(qt.origin.clone().addScaledVector(qt.z,n.limbRadius*1.25),n.limbRadius*1.25,t.hands,void 0,8)),u.has("wrists")&&s.push(he(Cs(ot.x,ot.y,ot.z,n.limbRadius*Rs,1,t.ink),"band"))}const m=o.neck.size.x/2;s.push(qn(o.neck.origin.z,hn(o.neck).z,m,m,1,t.neck));const g=c+n.limbRadius*.15+cl;u.has("neck")&&s.push(he(Cs(0,0,g,m*Rs,1,t.collarEdge),"band"));const x=new b(.84,.95,1);s.push(se(new b(0,0,h),l,t.skin,x,14)),s.push(Qe(new Ei(l*.13,l*.3,6),t.skin,new b(0,l*.98,h-l*.08),new Ve(0,0,0)));const S=(L,ht)=>l*x.y*Math.sqrt(Math.max(0,1-(L/(l*x.x))**2-(ht/(l*x.z))**2));if(n.described&&!n.faceHidden){const L=l*.1,ht=Uf(t.skin,ra)<q2?Of(t.skin,ra):void 0;for(const Jt of[-1,1]){const Tt=Jt*l*.32,Rt=l*.12,R=new b(Tt,S(Tt,Rt),h+Rt),y=new b(Jt*.47,1,.12).normalize(),W=new Ne().setFromUnitVectors(new b(0,1,0),y),at=.6,tt=L/Math.sin(at),xt=R.clone().addScaledVector(y,-tt*Math.cos(at)+L*.05),vt=(pt,_t,j,Et)=>{const Ot=new On(pt,Et,_t>.4?2:1,0,Math.PI*2,0,_t);return Ot.applyQuaternion(W),Ot.translate(xt.x,xt.y,xt.z),he({geometry:Ot,colour:j},"eye")};if(s.push(vt(tt,at,ra,12)),s.push(vt(tt*1.015,Math.asin(Math.min(1,L*.6/(tt*1.015))),t.eyes??Z2,10)),ht){const pt=new li(L*1.1,L*.2,3,12);pt.applyQuaternion(new Ne().setFromUnitVectors(new b(0,0,1),y)),pt.translate(R.x,R.y+L*.06,R.z),s.push(he({geometry:pt,colour:ht},"eyelid"))}const Z=Jt*l*.16,K=Jt*l*.48,mt=l*.285,O=t.brow,et=new b(Z,S(Z,mt),h+mt),Q=new b(K,S(K,mt-l*.015),h+mt-l*.015);s.push(he(Ui(et,Q,l*.045,O),"brow"))}const Mt=-l*.45,qt=l*.24,ot=new b(0,S(0,Mt-l*.04),h+Mt-l*.04);for(const Jt of[-1,1]){const Tt=new b(Jt*qt,S(qt,Mt),h+Mt);s.push(he(Ui(ot,Tt,l*.04,t.faceInk),"mouth"))}}const v=n.headCovered?"loose":n.hairStyle,A=!n.headCovered&&(v==="mohawk"||n.hair==="shaved"),T=A||v==="brushed"||v==="swept_back"?"straight":n.hairTexture,M=!n.headCovered&&!A&&v!=="voluminous"&&(n.hair==="cropped"||n.hair==="short"),E=n.headCovered?1.06:A?1.04:M?n.hair==="cropped"?1.035:1.05:1.05*n.hairVolume*(v==="voluminous"?1.25:1),D=n.hairTexture==="straight"||n.hairTexture==="wavy",C=M?n.hair==="short"?E*(D?1.32:n.hairVolume*1.065):E*n.hairVolume:E,I=L=>ce((L.z/L.length()-.1)/.8),F=L=>1+(C/E-1)*I(L);let G=L=>L.clone().multiplyScalar(l),U=(L,ht,Mt)=>0,N=L=>L.clone().normalize(),H=L=>0,k=(L,ht)=>Number.NEGATIVE_INFINITY,it=(L,ht,Mt)=>{};const P=Ff.includes(v),V={"chin-length":h-l*(n.hairTexture==="coily"?.85:n.hairTexture==="curly"?.95:1.15),"shoulder-length":_-.03*e,long:_-.12*e,"waist-length":p+.02*e}[n.hair],st=!n.headCovered&&P&&V!==void 0,gt=h+l*.1,X=st&&n.hair==="chin-length"&&(n.hairTexture==="curly"||n.hairTexture==="coily"),nt=st&&!X&&T===n.hairTexture&&n.hairTexture!=="straight",lt=st&&n.hair!=="chin-length"&&(n.hairTexture==="curly"||n.hairTexture==="coily"),Dt=L=>lt?l*Q2*ce((L-.5)/.5)*(1-ce((L-1.8)/.3)):0,St=(L,ht)=>{const Mt=Math.abs(Math.atan2(L,-ht));return n.hair!=="chin-length"?gt-l*.25*ce((Mt-1.6)/.3)+Dt(Mt):gt},Gt=(L,ht)=>1-ce((Math.abs(Math.atan2(L,-ht))-(lt?j2:.8))/.4),Ht=(L,ht)=>{if(X&&n.hairTexture==="curly")return 1-ce((gt-(L.z+h))/(l*.1));if(!st||X)return 1;const Mt=1-ce((gt+l*ht-(L.z+h))/(l*ht))*ce((.45-L.y/l)/.3);return nt?Mt+(1-ce((St(L.x,L.y)+l*.03-(L.z+h))/(l*.08))-Mt)*Gt(L.x,L.y):Mt},It=L=>Ht(L,.15),Xt=L=>Ht(L,.3);if(n.headCovered||n.hair!=="none"){const L=!n.headCovered&&T!=="straight",ht=L&&T==="coily",Mt=u.has("hairline")&&!A&&!n.headCovered,qt=Math.PI*(Mt&&!L?.53:.55),ot=ht?28:L?24:Mt?32:16,Jt=L?12:9,Tt=new On(l,ot,Jt,0,Math.PI*2,0,qt);nx(Tt,ot);const Rt=new b(0,0,h),R=new Ve(Math.PI/2+K2+(v==="swept_back"||v==="brushed"?.3:0),0,0),y=new b(0,0,1).applyEuler(R),W=1/Math.hypot(y.x/x.x,y.y/x.y,y.z/x.z),at=new b(x.x*E,E,W*E),tt=new Ne().setFromEuler(R).invert();G=j=>{const Et=j.clone().applyQuaternion(tt);return j.clone().multiplyScalar(l/Math.hypot(Et.x/at.x,Et.y/at.y,Et.z/at.z)*F(j))};const xt=j=>{if(C===E)return;const Et=j.getAttribute("position"),Ot=new b;for(let rt=0;rt<Et.count;rt++)Ot.fromBufferAttribute(Et,rt).sub(Rt),Ot.multiplyScalar(F(Ot)).add(Rt),Et.setXYZ(rt,Ot.x,Ot.y,Ot.z);Et.needsUpdate=!0,j.computeVertexNormals()},vt=j=>{if(!M)return 1;const Et=j.clone().sub(Rt);return ce((Et.z/Et.length()-.05)/.45)},Z=A?$r(t.skin,t.head,uc):t.head,K=he(Qe(Tt,Z,Rt,R,at),"cap");xt(K.geometry);const mt=j=>{const Et=j.clone().sub(Rt).applyQuaternion(tt).divide(at);return Math.acos(Math.max(-1,Math.min(1,Et.y/(Et.length()||1))))/qt},O=j=>n.headCovered?0:ce((mt(j)-.6)/.4),et=j=>{if(!nt||n.hairTexture!=="wavy")return 0;const Et=Math.abs(Math.atan2(j.x,-j.y));return .5*ce((St(j.x,j.y)-l*.06-j.z)/(l*.2))*(1-ce((Et-1.6)/.35))};H=j=>vt(j)*(1-.7*O(j));const Q=j=>{const Et=Math.max(O(j),et(j));if(Et<=0)return 1;const Ot=j.clone().sub(Rt),rt=Ot.length(),Bt=l*1.03/Math.hypot(Ot.x/(rt*x.x),Ot.y/(rt*x.y),Ot.z/(rt*x.z));return Bt>=rt?1:(rt+(Bt-rt)*Et)/rt};{const j=K.geometry.getAttribute("position"),Et=new b;for(let Ot=0;Ot<j.count;Ot++){const rt=Q(Et.fromBufferAttribute(j,Ot));rt!==1&&j.setXYZ(Ot,Rt.x+(Et.x-Rt.x)*rt,Rt.y+(Et.y-Rt.y)*rt,Et.z)}j.needsUpdate=!0,K.geometry.computeVertexNormals()}const pt=new Ne().setFromEuler(R).invert();U=(j,Et,Ot)=>{const rt=Math.hypot(j,Et)||1,Bt=new b(j/rt,Et/rt,0).applyQuaternion(pt).divide(at),Zt=new b(0,0,Ot-Rt.z).applyQuaternion(pt).divide(at),[Ct,de,Ie]=[Bt.dot(Bt),2*Bt.dot(Zt),Zt.dot(Zt)-l*l],Ft=de*de-4*Ct*Ie;if(Ft<0)return 0;const Vt=(-de+Math.sqrt(Ft))/(2*Ct);return Vt*Q(new b(j/rt*Vt,Et/rt*Vt,Ot))};const _t=new Ne().setFromEuler(R);if(N=j=>j.clone().sub(Rt).applyQuaternion(pt).divide(at).divide(at).applyQuaternion(_t).normalize(),ul(K.geometry,ot),n.headCovered)s.push(K);else{const j=K.geometry.getAttribute("position"),Et=new b,Ot=Array.from({length:j.count},(Vt,ne)=>It(Et.fromBufferAttribute(j,ne).sub(Rt))),rt=nt?K.geometry.clone():void 0,Bt=qr(K.geometry,()=>Rt,T,l,1,void 0,Vt=>vt(Vt)*Xt(Vt.clone().sub(Rt))*(1-.7*O(Vt)));ul(K.geometry,ot);const Zt=new Float32Array(j.count);if(Bt)for(let Vt=0;Vt<j.count;Vt++)Zt[Vt]=us*Bt[Vt]*Bt[Vt]*Ot[Vt]+aa[T]*(1-Ot[Vt]);const Ct=rt?qr(rt,()=>Rt,T,l,1,void 0,Vt=>H(Vt)):void 0;if(rt&&Ct&&Bt){const Vt=(_e,Ue)=>{const me=_e.getIndex(),ie=_e.getAttribute("position"),We=tn=>ie.getZ(tn)>gt-l*.5&&ie.getZ(tn)<gt+l*.35&&ie.getY(tn)<l*(lt?.7:.2),Tn=[];for(let tn=0;tn<me.count;tn+=3){const[dn,jn,zn]=[me.getX(tn),me.getX(tn+1),me.getX(tn+2)];(We(dn)||We(jn)||We(zn))&&Tn.push(dn,jn,zn)}const je=new Ce;je.setAttribute("position",ie),je.setAttribute("normal",_e.getAttribute("normal")),je.setIndex(Tn);const Jn=new De(je,new tr({side:Dn})),ke=new ro,Oe=new En,Ke=new b,Qn=_e.getAttribute("position"),sn=_e.getAttribute("normal");return(tn,dn,jn)=>{const zn=Math.hypot(tn,dn)||1;ke.set(new b(0,0,jn),new b(tn/zn,dn/zn,0));const w=ke.intersectObject(Jn,!1).at(-1);if(!(w!=null&&w.face))return;const{a:z,b:$,c:Y}=w.face;Oe.setFromAttributeAndIndices(Qn,z,$,Y).getBarycoord(w.point,Ke);const q=new b().addScaledVector(new b().fromBufferAttribute(sn,z),Ke.x).addScaledVector(new b().fromBufferAttribute(sn,$),Ke.y).addScaledVector(new b().fromBufferAttribute(sn,Y),Ke.z).normalize();return{r:w.distance,shade:Ke.x*Ue(z)+Ke.y*Ue($)+Ke.z*Ue(Y),normal:q}}},ne=Vt(K.geometry,_e=>Zt[_e]),Pe=Vt(rt,_e=>us*Ct[_e]*Ct[_e]);it=(_e,Ue,me)=>{const[ie,We]=[ne(_e,Ue,me),Pe(_e,Ue,me)];return ie&&We?{r:ie.r,shade:ie.shade,normal:ie.normal,fullR:We.r,fullShade:We.shade}:void 0}}if(Mt)for(let Vt=0;Vt<=Jt;Vt++)for(let ne=0;ne<=ot;ne++){const Pe=(ne>>1)*3%4/3,_e=ce((Vt/Jt-(.79+.12*Pe))/.1),Ue=Vt*(ot+1)+ne,me=ce(((j.getY(Ue)-Rt.y)/l-.05)/.3);Zt[Ue]=Math.max(Zt[Ue],.9*_e*me*(ne%2?1:.15))}const de=Mt?t.hairEdge:t.hairSheen;s.push(Bt||Mt?{...K,shade:Zt,tone:de}:K);{const Vt=Array.from({length:ot},(ne,Pe)=>{const _e=Jt*(ot+1)+Pe;return[Math.atan2(j.getX(_e),-j.getY(_e)),j.getZ(_e)]}).sort((ne,Pe)=>ne[0]-Pe[0]);k=(ne,Pe)=>{const _e=Math.atan2(ne,-Pe),Ue=Vt.findIndex(je=>je[0]>=_e),[me,ie]=Ue<=0?[Vt[Vt.length-1],Vt[0]]:[Vt[Ue-1],Vt[Ue]],We=(ie[0]-me[0]+2*Math.PI)%(2*Math.PI)||1,Tn=(_e-me[0]+2*Math.PI)%(2*Math.PI)/We;return me[1]+(ie[1]-me[1])*Math.min(1,Math.max(0,Tn))}}const Ie=ix(K.geometry,ot,Jt,Rt,Vt=>l*.97/Math.hypot(Vt.x/x.x,Vt.y/x.y,Vt.z/x.z)),Ft=new Float32Array(4*(ot+1));for(let Vt=0;Vt<4;Vt++)for(let ne=0;ne<=ot;ne++)Ft[Vt*(ot+1)+ne]=Zt[Jt*(ot+1)+ne];s.push(he(Bt||Mt?{geometry:Ie,colour:Z,shade:Ft,tone:de}:{geometry:Ie,colour:Z},"rim"))}}if(st&&V!==void 0){const L=1.04*n.hairVolume*(v==="voluminous"?1.2:1),ht=gt,Mt=n.hair!=="chin-length",qt=3.8,ot=n.hairTexture!=="straight",Jt=Mt&&(n.hairTexture==="curly"||n.hairTexture==="coily"),Tt=Mt&&n.hairTexture==="wavy",Rt=Jt?n.hairTexture==="coily"?12:14:X?10:nt&&n.hairTexture==="wavy"?$2:ot?12:8,R=Jt&&n.hairTexture==="curly"?16:20,y=new Yn(l,l,ht-V,R,Rt,!0,-qt/2,qt);if(y.rotateX(Math.PI/2),y.translate(0,0,(ht+V)/2),Mt){const Ft=y.getAttribute("position"),Vt=nt&&n.hairTexture==="wavy"?J2:ot?1.25:1.6;for(let ne=0;ne<Ft.count;ne++)Ft.setZ(ne,ht-(ht-V)*Math.max(0,(ht-Ft.getZ(ne))/(ht-V))**Vt)}const W=Math.max(h-l*1.05,V+.35*(ht-V)),at=Mt?1.3:1.12,tt=Mt?0:{coily:.3,curly:.2}[n.hairTexture]??0,xt=Ft=>Ft>=W?1-.1*ce((ht-Ft)/(ht-W)):.9+(at-.9)*ce((W-Ft)/(W-V)),vt=Ft=>Mt?-l*.25*ce((W-Ft)/(.5*(W-V))):0,Z=y.getAttribute("position"),K=Ft=>{const Vt=Math.floor(Math.min(Ft,R-1)/2),ne=Math.sin(Vt*12.9898+7*78.233)*43758.5453;return l*(.05+.25*(ne-Math.floor(ne)))},mt=new Float64Array(R+1),O=new Float32Array(Z.count).fill(1),et=new Float32Array(Z.count).fill(aa[n.hairTexture]),Q=new Array(Z.count);for(let Ft=0;Ft<Z.count;Ft++){const Vt=Math.abs(Math.atan2(Z.getX(Ft),-Z.getY(Ft))),ne=nt&&n.hairTexture==="wavy"?ce((Vt-.9)/.5):0,Pe=Ft%(R+1),_e=Math.sin(Math.floor(Math.min(Pe,R-1)/2)*12.9898+13*78.233)*43758.5453,Ue=nt?l*(Pe%2===1?.05+.1*(_e-Math.floor(_e)):.015)*(1-ce((Vt-.4)/.4)):0,me=(Mt?Math.max(ht-l*.25*ce((Vt-1.6)/.3),ot?Number.NEGATIVE_INFINITY:Math.min(ht,k(Z.getX(Ft),Z.getY(Ft))-l*.03)):ht)+Ue+Dt(Vt);mt[Ft%(R+1)]=me;const ie=me-(me-V)*(ht-Z.getZ(Ft))/(ht-V),We=xt(ie),Tn=!ot&&Math.abs(ie-V)<1e-5&&Ft%(R+1)%2?-.012*i:0;let[je,Jn]=[Z.getX(Ft),Z.getY(Ft)];if(Mt){const kt=Math.min(Ft%(R+1),R-Ft%(R+1)),jt=Math.max(0,1-kt/3)*(.8+.2*Math.sin(kt*2.3+(Ft%(R+1)>R/2?1:0))),[oe,Pt]=Jt?[1.1,.25]:[.85,.45],le=ce((h-l*.05-ie)/(l*.35))*(1-ce((h-l*oe-ie)/(l*Pt))),be=.3*jt*le*Math.sign(je);[je,Jn]=[je*Math.cos(be)-Jn*Math.sin(be),je*Math.sin(be)+Jn*Math.cos(be)]}let[ke,Oe]=[je*x.x*L*We,Jn*x.y*L*We+vt(ie)];const Ke=Math.hypot(ke,Oe),Qn=1.012+.013*ce(((lt?me:ht)-ie)/(l*.06));let sn=U(ke,Oe,ie)*Qn,tn=0;if(nt&&sn>0){const kt=Ft%(R+1),jt=Math.floor(Math.min(kt,R-1)/2),oe=Math.sin(jt*12.9898+11*78.233)*43758.5453;O[Ft]=ce((me-ie)/(l*(.08+.14*(oe-Math.floor(oe)))*(1+2*ne)));const Pt=ie>me-l*.3&&Gt(ke,Oe)>0?it(ke,Oe,ie):void 0;if(Pt&&ie>Math.min(me,ht)-l*.01){const le=qt/R;for(const be of[-.5,-.25,.25,.5]){const[Ae,we]=[Math.cos(be*le),Math.sin(be*le)],Xe=it(ke*Ae-Oe*we,ke*we+Oe*Ae,ie);Xe&&(Pt.r=Math.max(Pt.r,Xe.r))}}if(Pt){const le=lt?1:Gt(ke,Oe),be=ce((me-ie)/(l*.06))*(1-O[Ft]);sn=Math.max(sn,sn+(Math.max(Pt.r,Pt.r+(Pt.fullR-Pt.r)*be)*Qn-sn)*le),et[Ft]=Pt.shade+(Pt.fullShade-Pt.shade)*ce((me-ie)/(l*.06)),Q[Ft]=Pt.normal,tn=Pt.r*Qn}}const dn=Ft%(R+1),jn=Math.min(1,Math.min(dn,R-dn)/2)+(1-Math.min(1,Math.min(dn,R-dn)/2))*ce((h-l*.2-ie)/(l*.5)),zn=ce((ht-ie)/(l*.6))*jn,w=(ht-ie)/(ht-V),z=(ie-h)/(l*x.z),$=Ke>0&&Math.abs(z)<1?l*1.02*Math.sqrt(1-z*z)/Math.hypot(ke/Ke/x.x,Oe/Ke/x.y):0,Y=1-Math.min(1,Math.min(dn,R-dn)/2),q=sn>0?sn*(1-.06*Y*ce((ie-(me-l*.2))/(l*.15))):$,At=sn>0&&n.hairTexture!=="curly"?l*.06*ce((ht-ie)/(l*.12)):0,Wt=n.hairTexture==="curly"?w:w*w,wt=tt?q+At+(Math.max(q+At,U(ke,Oe,ht)*1.012*(1-tt*Wt))-q-At)*jn:q>0?q+(Math.max(Ke,q)-q)*zn:Ke;let Lt=wt;if(nt&&n.hairTexture==="wavy"){let kt=0;for(let oe=0;oe<=6;oe++)kt=Math.max(kt,U(ke,Oe,ie+(me+l*.25-ie)*oe/6));const jt=O[Ft]*ce((St(ke,Oe)-l*.06-ie)/(l*.1))*(1-ce((me-l*.45-ie)/(l*.3)));Lt=Math.max(wt-(wt-Math.min(wt,kt*1.012)+l*uf*.5)*jt,sn>0?Math.max(U(ke,Oe,ie)*Qn,tn):$)}Ke>0&&([ke,Oe]=[ke*Math.min(wt,Lt)/Ke,Oe*Math.min(wt,Lt)/Ke]),Z.setXYZ(Ft,ke,Oe,ie+Tn)}y.computeVertexNormals();const pt={geometry:fl(y),colour:t.head},_t=Ft=>ce((ht-Ft)/(l*(Jt?.1:.2))),j=X?n.hairTexture==="coily"?1.3:1.6:n.hairTexture==="wavy"&&Mt?Math.max(.4,Math.min(1.6,24*Math.PI/(21*((ht-V)/l)))):.4,Et=Ft=>new b(0,vt(Ft.z),Ft.z),Ot=pt.geometry.getAttribute("position").count/2,rt=Float32Array.from({length:Ot*2},(Ft,Vt)=>O[Vt%Ot]),Bt=Jt?tx(pt.geometry,R,n.hairTexture==="coily"?2:2.5,Et,qt,l,.03*i,(Ft,Vt)=>ce((mt[Vt]-Ft.z)/(l*.45))):qr(pt.geometry,Et,n.hairTexture,l,j,void 0,(Ft,Vt)=>X?ce((ht-Ft.z)/(l*.12)):nt?rt[Vt]:_t(Ft.z),X||Tt?ht:0,Tt?{swing:1.3,lobes:2,strands:.3}:void 0);{const Ft=pt.geometry.getAttribute("position"),Vt=pt.geometry.getAttribute("normal"),ne=new b,Pe=new b;for(let _e=0;_e<Ft.count;_e++){ne.fromBufferAttribute(Ft,_e);const Ue=_e%(Ft.count/2)%(R+1),me=(1-Math.min(1,Math.min(Ue,R-Ue)/2))*(1-ce((h-l*.2-ne.z)/(l*.5))),ie=nt?Q[_e%(Ft.count/2)]:void 0,We=ie?Math.max(1-ce((mt[Ue]-ne.z)/(l*.12)),me):nt?me:Math.max(1-ce((ht-ne.z)/(l*.35)),me);if(We<=0)continue;const Tn=(ie&&We>me?ie.clone():N(ne)).multiplyScalar(_e<Ft.count/2?1:-1);Pe.fromBufferAttribute(Vt,_e).lerp(Tn,We).normalize(),Vt.setXYZ(_e,Pe.x,Pe.y,Pe.z)}}const Zt=pt.geometry.getAttribute("position"),Ct=!ot&&t.hairSheen?{shade:hl(Zt.count,R+1).map((Ft,Vt)=>Ft*.45*ce((ht-Zt.getZ(Vt))/l)),tone:t.hairSheen}:{},de=ex(he({...pt,...Ct},"hair"),Bt,t.hairSheen),Ie=Jt?.55:Tt?.7:1;if(Bt&&de.shade&&!X){const Ft=ne=>{if(nt)return rt[ne];const Pe=ne%Ot%(R+1);return Jt?ce((mt[Pe]-Zt.getZ(ne))/K(Pe)):_t(Zt.getZ(ne))},Vt=ne=>nt?et[ne%Ot]:aa[n.hairTexture];de.shade=de.shade.map((ne,Pe)=>ne*Ie*Ft(Pe)+Vt(Pe)*(1-Ft(Pe)))}s.push(de)}!n.headCovered&&n.hair!=="none"&&s.push(...ox(n,v,h,l,x,E,G));const Qt=h+l*.02,J=l*.07,ft=L=>{const ht=L.geometry.getAttribute("normal"),Mt=new Float32Array(ht.count);for(let qt=0;qt<ht.count;qt++)Mt[qt]=.9*Math.min(1,Math.max(0,ht.getY(qt)*1.2));return{...L,shade:Mt,tone:t.earEdge}};if(n.described&&!n.earsHidden){const L=ax[n.ears];for(const ht of[-1,1]){const Mt=new b(ht*(l*x.x+J*.6),-l*.08,Qt);if(s.push(ft(he(Qe(new On(1,8,6),t.skin,Mt,new Ve(.15,0,ht*.3),new b(J,l*L.depth,l*L.half)),"ear"))),n.ears==="pointed"){const qt=Mt.clone().add(new b(0,-l*.05,l*L.half*.8));s.push(ft(he(ui(qt,new b(ht*.25,-.35,1).normalize(),l*.06,l*.38,t.skin,4),"ear")))}}}if(t.facialHair&&n.facialHair!=="none"){const L=t.facialHair,ht=(Tt,Rt,R=1)=>(Tt.rotateX(-Math.PI/2),Tt.scale(x.x*Rt,x.y*Rt,x.z*Rt*R),Tt.translate(0,0,h),Tt),Mt=(Tt,Rt,R,y,W,at=1,tt=16)=>({geometry:ht(new On(l,tt,6,Rt-R/2,R,0,Tt),y,at),colour:W}),qt=(Tt,Rt,R,y,W=1)=>{const at=Tt-oa/l/2,tt=l*Math.sin(at)*1.006,xt=new Yn(tt,tt,oa,16,1,!0,Rt-R/2-Math.PI/2,R);return xt.translate(0,l*Math.cos(at),0),{geometry:ht(xt,y,W),colour:t.facialHairEdge??t.ink}},ot=Math.PI/2,Jt=4;if(n.facialHair==="beard"||n.facialHair==="stubble"){const Tt=n.facialHair==="beard",Rt=n.beardReach===void 0?.12:.06+.06*Math.min(1,n.beardReach*4),R=Tt?1+Rt:1.012,y=Tt?1+Rt:1,W=Tt?L:$r(t.skin,L,uc),at=20,tt=ht(Bh(l,at,6,ot-Jt/2,Jt,()=>0,Br),R,y),xt=(vt,Z)=>t.facialHairEdge?{shade:hl(vt.getAttribute("position").count,Z),tone:t.facialHairEdge}:{};if(s.push(he({geometry:tt,colour:W,...Tt?xt(tt,at+1):{}},Tt?"beard":"stubble")),Tt&&u.has("jawline")){const vt=oa/l,Z=Bh(l*1.006,20,1,ot-Jt/2,Jt,K=>Br(K)-vt,Br);s.push(he({geometry:ht(Z,R,y),colour:t.facialHairEdge??t.ink},"jawline"))}if(!Tt){const vt=t.facialHairEdge??L,Z=l*.028;for(let K=0;K<Fh;K++)for(let mt=0;mt<zh;mt++){const O=Math.sin(K*12.9898+mt*78.233)*43758.5453,et=(K+.5+.35*Math.sin(O))/Fh,Q=ot-Jt/2+Jt*et;if(Math.abs(Q-ot)>1.45)continue;const pt=Br(Q)*(mt+.5+.3*Math.cos(O))/(zh+.3),_t=new b(-Math.cos(Q)*Math.sin(pt),Math.cos(pt),Math.sin(Q)*Math.sin(pt)).multiplyScalar(l*1.02),j=new ql(Z*1.2,0);j.setIndex([...Array(j.getAttribute("position").count).keys()]),j.translate(_t.x,_t.y,_t.z),s.push(he({geometry:ht(j,1,1),colour:vt},"stubble-dot"))}}if(Tt&&n.beardLength!==void 0&&n.beardLength>10){const vt=Math.min((n.beardLength-10)/100,e/3),Z=h-l*R*y,K=new b(0,l*.75,Z+l*.6),mt=new b(0,n.shoulderHalf*.92*.55+l*.3,Z-vt),O=10,et=new Ei(l*.62,K.distanceTo(mt),O,1,!0);et.scale(1,1,.4),et.applyMatrix4(new Kt().compose(K.clone().add(mt).multiplyScalar(.5),new Ne().setFromUnitVectors(new b(0,1,0),new b().subVectors(mt,K).normalize()),new b(1,1,1)));const Q=fl(et);s.push(he({geometry:Q,colour:L,...xt(Q,O+1)},"beard"))}}else n.facialHair==="goatee"&&(s.push(he(Mt(.75,ot,.9,1.1,L,1.08),"beard")),u.has("jawline")&&s.push(he(qt(.75,ot,.9,1.1,1.08),"jawline")));if(n.facialHair==="moustache"||n.facialHair==="beard"||n.facialHair==="goatee"){const Tt=-l*.32,Rt=new b(0,S(0,Tt)+l*.02,h+Tt);for(const R of[-1,1]){const y=new b(R*l*.28,S(l*.28,-l*.43)+l*.02,h-l*.43);s.push(he(Ui(Rt,y,l*.06,L),"moustache"))}}}const dt=t.faceInk,bt=h+l*.12,yt=l*1,$t=l*.2,zt=l*.04,ue=L=>l*x.x*Math.sqrt(Math.max(0,1-((L-h)/(l*x.z))**2));for(const L of n.features)if(L==="glasses"||L==="sunglasses"){for(const ht of[-1,1]){const Mt=new b(ht*l*.32,yt,bt);L==="glasses"?s.push(Qe(new li($t,zt,4,12),dt,Mt,new Ve(Math.PI/2,0,0))):s.push(Qe(new Yn($t*1.1,$t*1.1,zt*1.5,12),dt,Mt)),s.push(Ui(new b(ht*(l*.32+$t),yt-zt,bt),new b(ht*ue(bt),0,bt),zt*.8,dt))}s.push(Ui(new b(-l*.32+$t,yt,bt),new b(l*.32-$t,yt,bt),zt*.8,dt))}else if(L==="eyepatch"){const ht=new b(-l*.32,yt,bt);s.push(Qe(new Yn($t*1.15,$t*1.15,zt*1.5,12),dt,ht));const Mt=new b(ht.x/x.x,ht.y/x.y,(ht.z-h)/x.z).normalize(),qt=new b(1,0,.5).normalize(),ot=new b().crossVectors(Mt,qt).normalize(),Jt=new li(1,zt*.8/l,3,24);Jt.applyQuaternion(new Ne().setFromUnitVectors(new b(0,0,1),ot)),Jt.scale(l*x.x*1.03,l*x.y*1.03,l*x.z*1.03),Jt.translate(0,0,h),s.push(he({geometry:Jt,colour:dt},"strap"))}else if(L==="earrings")for(const ht of[-1,1]){const Mt=h-l*.35,qt=new b(ht*(ue(Mt)+zt),0,Mt);s.push(he(Qe(new li(l*.12,zt*.9,3,8),dt,qt,new Ve(0,Math.PI/2,0)),"earring"))}const fe=h+l*.8,ve=t.hair??t.skin;for(const L of n.extras)if(L==="tail")s.push(Le(new b(0,-n.hipHalf*.55,a-.02*e),new b(0,-n.hipHalf*.55-.35*i,r?.03:a-.3*e),n.limbRadius*.6,ve,!1));else if(L==="wings")for(const ht of[-1,1])s.push(he(ff(ht,i,new b(ht*n.shoulderHalf*.45,-.1*i,_-.04*e),ve),"wing"));else if(L==="antlers")for(const ht of[-1,1]){const Mt=new b(ht*l*.45,0,fe),qt=new b(ht*l*1.5,-l*.2,fe+l*1.4);s.push(he(Le(Mt,qt,l*.07,Us,!1),"antler")),s.push(he(Le(Mt.clone().lerp(qt,.5),new b(ht*l*.7,l*.3,fe+l*1.2),l*.06,Us,!1),"antler"))}else if(L==="horns")for(const ht of[-1,1]){const Mt=Qe(new Ei(l*.16,l*.7,6),Us,new b(ht*l*.45,l*.15,fe+l*.2),new Ve(Math.PI/2,0,-ht*.35));s.push(he(Mt,"horn"))}return s}function cx(n){const t=Eo(n),e=n.height/1.75,i=hn(t.torso).z,s=t.head.size.z/2,r=hn(t.left_upper_arm).z,o=t.neck.size.x/2;return[qn(0,.03*e,.17*e,.19*e,1,""),Le(new b(0,0,.03*e),new b(0,0,t.waist.origin.z+.02*e),.025*e,""),qn(t.waist.origin.z,t.torso.origin.z,n.hipHalf,n.waistHalf,.62,""),qn(t.torso.origin.z,i,n.waistHalf,n.shoulderHalf*.92,.55,""),Le(new b(-n.shoulderHalf*.9,0,r),new b(n.shoulderHalf*.9,0,r),n.limbRadius*1.35,""),qn(t.neck.origin.z,hn(t.neck).z,o,o,1,""),se(new b(0,0,t.head.origin.z+s),s,"",new b(.84,.95,1),14)]}function pf(n){const t=new ee,e=new ee,i=(n.plan.kind==="human"?lx(n):U2(n)).map(({geometry:r,colour:o,shade:a,tone:c})=>{r.deleteAttribute("uv"),t.set(o),c&&e.set(c);const l=r.getAttribute("position").count,h=new Float32Array(l*3);for(let d=0;d<l;d++){const f=a&&c?a[d]:0,u=(p,_)=>Math.min(1,Math.max(0,p+(_-p)*f));h.set([u(t.r,e.r),u(t.g,e.g),u(t.b,e.b)],d*3)}return r.setAttribute("color",new Fn(h,3)),r}),s=yo(i,!1);for(const r of i)r.dispose();if(!s)throw new Error("figure parts could not be merged");return n.posture==="reclining"&&s.applyMatrix4(hf(n)),s.computeBoundingBox(),s.computeBoundingSphere(),s}class hx{constructor(){pi(this,"geometries",new Map);pi(this,"used",new Set)}geometry(t){const e=JSON.stringify(t);let i=this.geometries.get(e);return i||(i=pf(t),this.geometries.set(e,i)),this.used.add(e),i}sweep(){for(const[t,e]of this.geometries)this.used.has(t)||(e.dispose(),this.geometries.delete(t));this.used.clear()}get size(){return this.geometries.size}dispose(){for(const t of this.geometries.values())t.dispose();this.geometries.clear(),this.used.clear()}}function mf(n,t){if(n.userData.headOutline)return n.userData.headOutline;const e=n.getAttribute("position"),i=[];let s=Number.NEGATIVE_INFINITY;for(let a=0;a<e.count;a++){const c=e.getZ(a);c<t||(i.push(e.getX(a),e.getY(a),c),s=Math.max(s,c))}if(i.length===0&&e.count>0)return mf(n,Number.NEGATIVE_INFINITY);const r=new Set;for(const a of[-60,-40,-20,0,10,20,30,40,50,60,70,80,90]){const c=a*Math.PI/180;for(let l=0;l<24;l++){const h=l/24*2*Math.PI,d=-Math.sin(c)*Math.cos(h),f=-Math.sin(c)*Math.sin(h),u=Math.cos(c);let p=0,_=Number.NEGATIVE_INFINITY;for(let m=0;m<i.length;m+=3){const g=i[m]*d+i[m+1]*f+i[m+2]*u;g>_&&(_=g,p=m)}i.length&&r.add(p)}}const o=[new b(0,0,s),...[...r].map(a=>new b(i[a],i[a+1],i[a+2]))];return n.userData.headOutline=o,o}function ux(n,t,e,i,s,r,o){const a=new De(o?o.geometry(n):pf(n),r);o&&(a.userData.keptGeometry=!0);const c=0,l=0;return a.rotation.z=Math.hypot(c,l)>1e-6?Math.atan2(-c,l):Math.PI,a.position.set(t,e,i),a.userData.part="body",a}const gf=40,Hh=24,Hr=6,kh=6,_f=8;class ar{constructor(){pi(this,"points",[]);pi(this,"triangles",[])}add(t){return this.points.push(t),this.points.length-1}band(t,e){for(let i=0;i+1<t.length;i++){const s=t[i].length;for(let r=0;r<s;r++){if(e!=null&&e(i,r))continue;const o=t[i][r],a=t[i][(r+1)%s],c=t[i+1][(r+1)%s],l=t[i+1][r];this.triangles.push(o,a,c,o,c,l)}}}cap(t,e){const i=t.filter((r,o)=>{const a=this.points[r],c=this.points[t[(o+1)%t.length]];return Math.hypot(a[0]-c[0],a[1]-c[1])>1e-9});if(i.length<3)return;const s=i.map(r=>new ut(this.points[r][0],this.points[r][1]));for(const[r,o,a]of ai.triangulateShape(s,[])){const c=ai.area([s[r],s[o],s[a]])>0;this.triangles.push(...c===e?[i[r],i[o],i[a]]:[i[r],i[a],i[o]])}}ring(t){return t.map(e=>this.add(e))}}function Vi(n,t,e){const i=new Ce;i.setAttribute("position",new ae(n.points.flatMap(([c,l,h])=>[c*1e3,l*1e3,h*1e3]),3)),i.setIndex(n.triangles);const s=C2(i,gf*Math.PI/180);i.dispose();const r=s.getAttribute("position"),o=s.getAttribute("normal"),a=new b;for(let c=0;c<r.count;c++)r.setXYZ(c,r.getX(c)/(1e3*t[0]),r.getY(c)/(1e3*t[1]),r.getZ(c)/(1e3*t[2])),a.set(o.getX(c)*t[0],o.getY(c)*t[1],o.getZ(c)*t[2]).normalize(),o.setXYZ(c,a.x,a.y,a.z);return s.userData.open=e,s}const zi=(n,t)=>[n[0]-t[0],n[1]-t[1],n[2]-t[2]],Zr=(n,t)=>[n[0]+t[0],n[1]+t[1],n[2]+t[2]],Ni=(n,t)=>[n[0]*t,n[1]*t,n[2]*t],ao=(n,t)=>n[0]*t[0]+n[1]*t[1]+n[2]*t[2],Kr=(n,t)=>[n[1]*t[2]-n[2]*t[1],n[2]*t[0]-n[0]*t[2],n[0]*t[1]-n[1]*t[0]],lo=n=>Math.hypot(n[0],n[1],n[2]),Oi=n=>Ni(n,1/(lo(n)||1)),tc=n=>(t,e)=>(t-.5)*n[e];function dl(n,t){const e=n.length;return n.map(([i,s],r)=>{const[o,a]=n[(r+e-1)%e],[c,l]=n[(r+1)%e],h=[i-o,s-a],d=[c-i,l-s],f=Math.hypot(h[0],h[1])||1,u=Math.hypot(d[0],d[1])||1,p=[-h[1]/f,h[0]/f],_=[-d[1]/u,d[0]/u],m=[p[0]+_[0],p[1]+_[1]],g=1+p[0]*_[0]+p[1]*_[1],x=Math.min(t/Math.max(g,1e-9),4*t/(Math.hypot(m[0],m[1])||1));return[i+m[0]*x,s+m[1]*x]})}function fx(n,t){const e=r=>{const o=dl(n,r);return zf(o)<=0||!Bf(o)?!1:o.every(([a,c],l)=>{const[h,d]=o[(l+1)%o.length],[f,u]=n[l],[p,_]=n[(l+1)%n.length];return(h-a)*(p-f)+(d-c)*(_-u)>0})};if(e(t))return t;let i=0,s=t;for(let r=0;r<30;r++){const o=(i+s)/2;e(o)?i=o:s=o}return i}function dx(n){const t=n.size,e=tc(t),i=(n.outline??[]).map(([f,u])=>[e(f,0),e(u,1)]),s=t[2]/2,[r,o]=n.bevel??[0,0],a=Math.min(o,s),c=r>0&&a>0?fx(i,r):0,l=new ar,h=(f,u)=>l.ring(f.map(([p,_])=>[p,_,u])),d=c>0?[h(dl(i,c),-s),h(i,-s+a),h(i,s-a),h(dl(i,c),s)]:[h(i,-s),h(i,s)];return l.band(d),l.cap(d[0],!1),l.cap(d[d.length-1],!0),Vi(l,t,!1)}function px(n,t,e){const i=n.map((r,o)=>({p:r,r:t[o]})).filter(({p:r},o)=>o===0||lo(zi(r,n[o-1]))>1e-9);if(i.length<2)return[];if(e&&i.length>2){const r=new Gl(i.map(({p:a})=>new b(...a)),!1,"centripetal"),o=(i.length-1)*_f;return Array.from({length:o+1},(a,c)=>{const l=c/o,h=r.getTangent(l),d=l*(i.length-1),f=Math.min(Math.floor(d),i.length-2),u=d-f;return{at:r.getPoint(l).toArray(),along:h.toArray(),r:i[f].r+(i[f+1].r-i[f].r)*u}})}const s=[];for(let r=0;r+1<i.length;r++){const o=Oi(zi(i[r+1].p,i[r].p));if(r>0){const a=s[s.length-1].along,c=Math.acos(Math.max(-1,Math.min(1,ao(a,o)))),l=Math.ceil(c/(15*Math.PI/180)),h=new b(...a),d=new b(...o),f=new Ne().setFromUnitVectors(h,d);for(let u=1;u<l;u++){const p=h.clone().applyQuaternion(new Ne().slerp(f,u/l));s.push({at:i[r].p,along:p.toArray(),r:i[r].r})}}s.push({at:i[r].p,along:o,r:i[r].r},{at:i[r+1].p,along:o,r:i[r+1].r})}return s}function mx(n){const t=n.size,e=tc(t),i=(n.path??[]).map(u=>[e(u[0],0),e(u[1],1),e(u[2],2)]),s=px(i,n.radius??[],n.smooth===!0),r=n.aspect??1,o=new ar;if(!s.length)return Vi(o,t,!1);let a;const c=s.map(({along:u})=>{const p=Kr([0,0,1],u);let _=lo(p)>1e-6?Oi(p):Oi(a?zi(a,Ni(u,ao(a,u))):zi([1,0,0],Ni(u,u[0])));return lo(_)<1e-6&&(_=Oi(Kr(u,[0,1,0]))),a&&ao(_,a)<0&&(_=Ni(_,-1)),a=_,{w:_,h:Kr(u,_)}}),l=(u,p,_,m)=>o.ring(Array.from({length:Hh},(g,x)=>{const S=2*Math.PI*x/Hh;return Zr(u,Zr(Ni(p,m*r*Math.cos(S)),Ni(_,m*Math.sin(S))))})),h=(u,p)=>Array.from({length:kh},(_,m)=>{const g=Math.PI/2*(1-m/kh),{at:x,along:S,r:v}=s[u];return l(Zr(x,Ni(S,p*v*Math.sin(g))),c[u].w,c[u].h,v*Math.cos(g))}),d=s.length-1,f=[...h(0,-1),...s.map(({at:u,r:p},_)=>l(u,c[_].w,c[_].h,p)),...h(d,1).reverse()];return o.band(f),Vi(o,t,!1)}function gx(n){var u;const t=n.size,e=tc(t),i=n.sections??[],s=((u=i[0])==null?void 0:u.outline.length)??0,r=n.smooth&&i.length>2?_f:1,o=r>1?Array.from({length:s},(p,_)=>new Gl(i.map(({z:m,outline:g})=>new b(e(g[_][0],0),e(g[_][1],1),e(m,2))),!1,"centripetal")):[],a=[];for(let p=0;p<=(i.length-1)*r;p++)a.push(Array.from({length:s},(_,m)=>{if(r>1)return o[m].getPoint(p/((i.length-1)*r)).toArray();const{z:g,outline:x}=i[p];return[e(x[m][0],0),e(x[m][1],1),e(g,2)]}));const c=n.holes??[],l=(p,_)=>{const m=Math.floor(p/r);return c.some(([g,x,S,v])=>m>=g&&m<x&&(S<v?_>=S&&_<v:_>=S||_<v))},h=n.caps??"both",d=new ar,f=a.map(p=>d.ring(p));return d.band(f,l),(h==="both"||h==="bottom")&&d.cap(f[0],!1),(h==="both"||h==="top")&&d.cap(f[f.length-1],!0),n.wall?Vi(_x(d,n.wall),t,!1):Vi(d,t,c.length>0||h!=="both")}function _x(n,t){const e=n.points.length,i=Array.from({length:e},()=>[0,0,0]),s=[],r=n.triangles;for(let f=0;f<r.length;f+=3){const[u,p,_]=[n.points[r[f]],n.points[r[f+1]],n.points[r[f+2]]],m=Kr(zi(p,u),zi(_,u));s.push(Oi(m));for(const g of[r[f],r[f+1],r[f+2]])i[g]=Zr(i[g],m)}const o=new Array(e).fill(1),a=i.map(Oi);for(let f=0;f<r.length;f+=3)for(const u of[r[f],r[f+1],r[f+2]])o[u]=Math.min(o[u],ao(a[u],s[f/3]));const c=new ar;c.points=[...n.points],c.triangles=[...r];const l=n.points.map((f,u)=>{const p=a[u],_=1/Math.max(.35,o[u]);return c.add(zi(f,[p[0]*t[0]*_,p[1]*t[1]*_,p[2]*t[2]*_]))});for(let f=0;f<r.length;f+=3)c.triangles.push(l[r[f]],l[r[f+2]],l[r[f+1]]);const h=new Map,d=(f,u)=>f<u?`${f}:${u}`:`${u}:${f}`;for(let f=0;f<r.length;f+=3)for(let u=0;u<3;u++){const p=d(r[f+u],r[f+(u+1)%3]);h.set(p,(h.get(p)??0)+1)}for(let f=0;f<r.length;f+=3)for(let u=0;u<3;u++){const p=r[f+u],_=r[f+(u+1)%3];h.get(d(p,_))===1&&c.triangles.push(_,p,l[p],_,l[p],l[_])}return c}function xx(n){const t=n.size,[e,i,s]=t,r=Math.min(n.round??0,e/2,i/2,s/2),o=new ar,a=(S,v,A,T)=>o.ring([[1,1],[-1,1],[-1,-1],[1,-1]].flatMap(([M,E],D)=>Array.from({length:Hr+1},(C,I)=>{const F=Math.PI/2*(D+I/Hr);return[M*S+A*Math.cos(F),E*v+A*Math.sin(F),T]}))),c=(S,v)=>Array.from({length:Hr+1},(A,T)=>S+(v-S)*T/Hr),l=e/2-r,h=i/2-r,d=c(0,Math.PI/2).map(S=>a(l,h,r*Math.sin(S),-s/2+r*(1-Math.cos(S))));if(!n.wall)return d.push(...c(Math.PI/2,Math.PI).map(S=>a(l,h,r*Math.sin(S),s/2-r*(1+Math.cos(S))))),o.band(d),o.cap(d[0],!1),o.cap(d[d.length-1],!0),Vi(o,t,!1);const[f,u,p]=n.wall,_=Math.max(0,Math.min(r-Math.max(f,u),e/2-f,i/2-u,(s-p)/2)),m=e/2-f-_,g=i/2-u-_,x=-s/2+p;return d.push(a(l,h,r,s/2),a(m,g,_,s/2)),d.push(..._>0?c(Math.PI/2,0).map(S=>a(m,g,_*Math.sin(S),x+_*(1-Math.cos(S)))):[a(m,g,0,x)]),o.band(d),o.cap(d[0],!1),o.cap(d[d.length-1],!0),Vi(o,t,!1)}const la=1e3,Gh=25e3,Vh=100,Wh=[4.57048,.03934,0,4.23541,.13897,0,3.94041,.22668,0,3.68075,.30388,0,3.45185,.37194,0,3.24949,.43211,0,3.07001,.48548,0,2.91022,.53298,0,2.76743,.57544,0,2.63933,.61353,0,2.52027,.64686,.02042,2.41238,.67674,.04228,2.31429,.70358,.0653,2.22482,.72776,.08929,2.14298,.74959,.11408,2.06789,.76935,.13951,1.99881,.78727,.16546,1.9351,.80355,.1918,1.8762,.81838,.21841,1.82162,.8319,.24519,1.77093,.84426,.27207,1.72377,.85557,.29897,1.67979,.86593,.32582,1.63872,.87545,.35256,1.6003,.88419,.37915,1.56428,.89223,.40554,1.53048,.89964,.4317,1.49871,.90647,.45759,1.4688,.91278,.48319,1.44061,.91861,.50847,1.414,.92401,.53342,1.38886,.929,.55802,1.36507,.93362,.58226,1.34255,.93791,.60612,1.32119,.94189,.62961,1.30092,.94558,.65271,1.28167,.94902,.67542,1.26336,.95221,.69774,1.24594,.95517,.71967,1.22934,.95793,.74121,1.21352,.96051,.76235,1.19842,.9629,.7831,1.184,.96513,.80346,1.17023,.96721,.82344,1.15705,.96915,.84304,1.14445,.97096,.86227,1.13237,.97264,.88112,1.1208,.97422,.8996,1.10971,.97568,.91773,1.09907,.97706,.9355,1.08885,.97834,.95291,1.07903,.97953,.96999,1.0696,.98065,.98673,1.06052,.98169,1.00313,1.05179,.98266,1.01921,1.04338,.98357,1.03497,1.03529,.98442,1.05042,1.02748,.98521,1.06556,1.01996,.98595,1.08041,1.0127,.98664,1.09496,1.00569,.98728,1.10922,.99893,.98788,1.1232,.99239,.98844,1.1369,.98607,.98897,1.15034,.97997,.98945,1.16351,.97406,.9899,1.17642,.96835,.99032,1.18908,.96281,.99072,1.2015,.95745,.99108,1.21368,.95226,.99142,1.22562,.94723,.99173,1.23733,.94235,.99202,1.24882,.93762,.99229,1.26009,.93303,.99254,1.27114,.92858,.99277,1.28198,.92425,.99298,1.29262,.92005,.99318,1.30307,.91597,.99336,1.31331,.91201,.99352,1.32337,.90815,.99367,1.33323,.9044,.99381,1.34292,.90076,.99393,1.35243,.89721,.99404,1.36177,.89376,.99415,1.37093,.89039,.99424,1.37994,.88712,.99432,1.38877,.88393,.99439,1.39746,.88082,.99445,1.40598,.87779,.99451,1.41436,.87484,.99456,1.42259,.87196,.9946,1.43067,.86915,.99463,1.43862,.86641,.99466,1.44642,.86374,.99468,1.45409,.86113,.99469,1.46163,.85858,.9947,1.46905,.85609,.99471,1.47633,.85366,.9947,1.4835,.85128,.9947,1.49054,.84896,.99469,1.49746,.84669,.99468,1.50428,.84448,.99466,1.51097,.84231,.99464,1.51756,.84019,.99462,1.52404,.83811,.99459,1.53042,.83608,.99456,1.5367,.8341,.99453,1.54287,.83215,.99449,1.54894,.83025,.99446,1.55492,.82838,.99442,1.56081,.82656,.99437,1.5666,.82477,.99433,1.5723,.82302,.99428,1.57791,.8213,.99424,1.58344,.81962,.99419,1.58888,.81797,.99414,1.59424,.81635,.99409,1.59952,.81476,.99403,1.60472,.81321,.99398,1.60984,.81168,.99392,1.61489,.81019,.99387,1.61986,.80872,.99381,1.62475,.80728,.99375,1.62958,.80587,.99369,1.63433,.80448,.99363,1.63902,.80311,.99357,1.64364,.80178,.99351,1.64819,.80046,.99344,1.65268,.79917,.99338,1.6571,.7979,.99332,1.66146,.79666,.99325,1.66576,.79543,.99319,1.67,.79423,.99313,1.67419,.79305,.99306,1.67831,.79189,.993,1.68238,.79074,.99293,1.68639,.78962,.99286,1.69035,.78852,.9928,1.69425,.78743,.99273,1.6981,.78636,.99267,1.7019,.78531,.9926,1.70565,.78428,.99254,1.70936,.78326,.99247,1.71301,.78226,.9924,1.71661,.78127,.99234,1.72017,.7803,.99227,1.72368,.77935,.9922,1.72715,.77841,.99214,1.73057,.77748,.99207,1.73395,.77657,.99201,1.73729,.77567,.99194,1.74058,.77479,.99188,1.74383,.77392,.99181,1.74705,.77306,.99175,1.75022,.77221,.99168,1.75335,.77138,.99162,1.75645,.77056,.99155,1.7595,.76975,.99149,1.76252,.76895,.99142,1.76551,.76817,.99136,1.76846,.76739,.99129,1.77137,.76663,.99123,1.77425,.76588,.99117,1.77709,.76514,.9911,1.7799,.7644,.99104,1.78268,.76368,.99098,1.78543,.76297,.99092,1.78814,.76227,.99086,1.79082,.76158,.99079,1.79347,.76089,.99073,1.79609,.76022,.99067,1.79868,.75955,.99061,1.80125,.7589,.99055,1.80378,.75825,.99049,1.80628,.75761,.99043,1.80876,.75698,.99037,1.81121,.75635,.99031,1.81363,.75574,.99025,1.81603,.75513,.99019,1.8184,.75453,.99014,1.82074,.75394,.99008,1.82306,.75335,.99002,1.82535,.75278,.98996,1.82762,.75221,.98991,1.82987,.75164,.98985,1.83209,.75109,.98979,1.83428,.75054,.98974,1.83646,.74999,.98968,1.83861,.74946,.98963,1.84074,.74893,.98957,1.84285,.7484,.98952,1.84493,.74789,.98946,1.84699,.74738,.98941,1.84904,.74687,.98935,1.85106,.74637,.9893,1.85306,.74588,.98925,1.85504,.74539,.98919,1.857,.74491,.98914,1.85894,.74443,.98909,1.86086,.74396,.98904,1.86276,.74349,.98899,1.86465,.74303,.98893,1.86651,.74257,.98888,1.86836,.74212,.98883,1.87019,.74168,.98878,1.872,.74124,.98873,1.87379,.7408,.98868,1.87557,.74037,.98863,1.87733,.73994,.98858,1.87907,.73952,.98854,1.8808,.7391,.98849,1.88251,.73869,.98844,1.8842,.73828,.98839,1.88588,.73788,.98834,1.88754,.73748,.9883,1.88919,.73708,.98825,1.89082,.73669,.9882,1.89244,.7363,.98816,1.89404,.73592,.98811,1.89562,.73554,.98806,1.8972,.73516,.98802,1.89875,.73479,.98797,1.9003,.73442,.98793,1.90183,.73406,.98788,1.90334,.7337,.98784,1.90485,.73334,.9878,1.90634,.73298,.98775,1.90781,.73263,.98771,1.90927,.73229,.98767,1.91072,.73194,.98762,1.91216,.7316,.98758,1.91359,.73127,.98754,1.915,.73093,.9875,1.9164,.7306,.98745,1.91779,.73027,.98741,1.91917,.72995,.98737,1.92053,.72963,.98733,1.92188,.72931,.98729,1.92322,.729,.98725,1.92456,.72868,.98721,1.92587,.72837,.98717,1.92718],vx=[.05821,1.25048,1.05382],Mx=.4423;function bi(n){const e=(Math.min(Gh,Math.max(la,n))-la)/Vh,i=Math.min(Math.floor(e),(Gh-la)/Vh-1),s=e-i,r=c=>Wh[i*3+c]*(1-s)+Wh[(i+1)*3+c]*s,o=[r(0),r(1),r(2)],a=xf(o);return[o[0]/a,o[1]/a,o[2]/a]}const xf=([n,t,e])=>.212639*n+.7151687*t+.0721923*e,Sx=[[-1.099459,-.1335146,-4.083223,5.919603,-.1104166,1.600158,-1326538e-12,4.917807,.5127716,-1.169858,-.1832793,.9694744,.09495762,-.04738918,.2194171,.1095749,3.603604,.3815119,-.9665225,-.1403888,5.194457,-1.107607,-.8135181,4.969661,-.2300508,-2.48935,1.279158,-1.292508,-.1299552,-2.071404,-.04752482,1.215598,-1.904179,.3027985,8.707768,.06332446,-.9264666,-.169678,4.57407,-.4232936,-7.575833,5.079755,-.2576343,-4.506805,.6908129,-1.139072,-.1796056,1.923311,6.788529,-2.364389,-1.064041,.171701,1.534681,.501581,-1.107257,-.1384411,-4.285744,5.713157,-.1015992,1.372638,.06555893,5.127514,.6550471,-1.187337,-.1969013,.8551048,.05289708,-.07626406,.01733153,.1779454,3.801038,.4742709,-.9685321,-.1553308,4.732492,-1.178935,-.7852791,4.604492,-.2666518,-2.367663,1.177527,-1.252817,-.05129949,-2.800433,-.01295992,1.308964,-2.204331,.7276011,8.699265,.1188388,-.9459509,-.2322133,4.375041,-.1712018,-7.451681,5.078019,-.4223538,-4.595561,1.074719,-1.125092,-.179675,1.626399,6.989743,-2.406382,-.9060383,.2961611,1.337715,.543814,-1.135338,-.171616,-1.499253,2.373491,-.1654023,.9566404,.1113453,4.528473,.6579439,-1.13278,-.1456214,-1.736672,1.756589,-.1087003,.3757927,.252507,7.178513,.5003814,-1.167176,-.2927225,5.727667,-3.139244,-.6425204,2.822634,-.1457812,-6.78708,1.017072,-1.042529,.04110823,-4.000629,4.362364,1.09054,-1.338674,.8246964,10.95249,.2912211,-1.061598,-.2096143,3.803155,-7.977069,-3.63788,3.707671,-.1903128,-3.397953,.99715,-1.07356,-.2077964,1.492052,16.26322,-5.015304,-.4059889,.2659782,.639538,.5634436,-1.172794,-.2111186,-1.360013,1.60408,-.08473723,.7217312,.154803,4.25701,.6328974,-1.238374,-.2670827,.3247678,.5466311,-.7425952,.527644,.02678026,5.484169,.6814734,-1.176923,-.2574586,2.304045,-2.797678,1.464405,1.998552,.2550559,-4.199772,.7544892,-1.003284,.01943984,-2.145066,10.30924,-15.25413,-2.02301,.5448699,8.159497,.5539148,-1.060017,-.2037206,2.483018,-4.595459,6.526991,4.031804,.1206513,-2.586527,.7875752,-1.081141,-.2123302,1.092275,2.683841,-4.166938,-1.396582,.4371205,1.030233,.6664862,-1.222392,-.2651924,-.4625037,.3521964,.02148855,.5078494,.179159,3.852516,.5998216,-1.42461,-.4710155,-.1826815,1.786277,-1.952442,.5277612,-.01773629,2.415874,.6701272,-1.130655,-.1358609,.9171203,-4.660394,6.251162,1.904529,.2639668,1.85613,.822844,-.9739015,-.06674749,-.4768897,12.48589,-19.94688,-2.353043,.5885575,1.287251,.4830135,-1.082178,-.1974495,1.050245,-4.792855,8.663406,3.246969,.1556731,.8117442,.8050376,-1.063354,-.1727108,.9681592,2.736077,-4.969269,-.836057,.5994612,1.024039,.6786935,-1.261936,-.3053676,-.4262222,.4000196,-.02059388,.4721802,.1480028,3.505343,.6121337,-1.681088,-.6971919,-.1105652,.7437426,-.6594399,.2254221,.08710195,1.263913,.5681865,-.9453001,.03460388,.6067038,-1.985128,3.457236,2.655483,-.01162354,3.304716,1.00195,-1.086609,-.2029011,-.639917,6.926885,-15.12189,-3.793051,.945612,.2222222,.2893725,-1.041259,-.138879,1.147331,6.282086,3.679836,4.398314,-.1355232,1.031134,.9273509,-1.063473,-.1916051,.6556979,-.003371891,-3.699664,-1.926783,.7371154,1.179975,.6367068,-1.33639,-.3778927,-.7259477,.2270247,.4627513,.1366459,.2637347,3.292059,.4998211,-2.119878,-1.055472,.5422052,.7826648,-1.286065,.9517905,-.1432358,-.2379816,.5910513,-.7761432,.2124336,-.6845184,-.9812342,4.347257,.967198,.377315,5.789529,.9646598,-1.118734,-.3513815,.5500918,.9449627,-12.6207,-1.82528,.473126,-3.326892,.3568768,-1.026437,-.08257946,.3221701,11.98372,1.55513,2.560304,.1406465,2.912858,.8643181,-1.069949,-.2029607,.5825042,-.002398595,-3.278335,-1.349882,.7208433,.8505164,.6625391,-1.392309,-.4454945,-.5664,.6283393,-.3761727,.6949802,.07748178,3.192797,.5968661,-2.713405,-1.395112,.202923,.1877272,-.3715859,-.1652929,.2385861,-.4150768,.1375467,-.9588644,.024339,-1.527493,-.9632874,5.496269,1.094931,.2004044,6.084554,1.369604,-.8028546,-.2473563,1.617898,2.073591,-11.49446,-.8394131,.2726847,-4.634538,.1367293,-1.198326,-.1804865,-.3565414,4.0732,1.662086,1.23977,.3367978,2.997402,.9360383,-1.013531,-.185906,.5799857,13.31883,-4.346873,-1.11382,.5275714,.8045177,.6496373,-1.530103,-.6107468,-.3841771,1.881508,-1.464807,.665469,-5950797e-12,2.738912,.8101012,-2.415469,-1.057499,-.4161968,-2.357548,.6300296,.6224915,.01545048,2.038561,-.1339415,-3.096796,-1.465688,-1.199232,4.567061,3.26098,-.9794907,.8950491,2.049235,1.331015,.2713904,.2852852,1.20209,-8.206784,-5.805762,1.804431,-.6090648,-1.990902,.3288858,-1.45658,-.345596,-.06409257,16.67697,-2.311094,-.9771104,.6759863,1.245136,.7911932,-.9860389,-.2099564,.294665,-.0035478,-2.268313,-.06205647,.4705185,.8657995,.6856284,-1.971736,-.9414047,-.3400557,1.468763,-1.474284,.5501062,-110975e-10,2.35637,.9001702,-1.589845,-.7797079,-.558224,-.8137376,.5846617,.1129459,-.02658005,2.707248,-.2112486,-6.940173,-2.823963,-1.620848,1.090696,2.39173,1.370047,.5890462,1.7284,1.331253,1.293144,-.001919778,1.644206,-.8666967,-7.161953,-1.385018,-.1505374,-1.388643,.2530122,-1.48888,-.2495496,-.2377137,11.67714,-.8617124,1.053828,.1992744,.3633564,.8553304,-1.060891,-.4035829,.2823207,-.002369798,-1.876577,-.5950265,.4241017,.3140802,.6631669,-1.101204,-.1351353,-4.030882,6.096353,-.1148599,1.606507,-1555474e-12,4.436084,.5973715,-1.154597,-.1923378,.8512132,.2934895,-.06522777,.1389077,.09091469,3.133307,.2108541,-1.031588,-.1546804,5.266214,-.949139,-.7184867,4.875626,-.1911907,-2.865642,1.087895,-1.159454,-.09546699,-1.508146,-.02031411,1.040653,-2.333508,.2540592,8.594981,.0931677,-1.03594,-.2021151,4.719343,-.9019318,-7.858046,3.901234,-.2233137,-4.344739,.6550733,-1.096669,-.1558196,2.057553,6.274495,-2.678352,-1.814927,.1550676,1.903276,.4998989,-1.114209,-.1473531,-7.602914,8.973685,-.04980074,1.289198,.08366906,4.557987,.6118757,-1.149397,-.1981628,4.914096,-3.498986,-.0625709,.1667401,.104898,2.284689,.5935965,-1.056121,-.1456172,.4272656,2.912649,-.5501745,4.406542,-.138768,1.245555,.9733011,-1.125047,-.04003662,1.058457,-3.462236,.4395278,-2.395805,.5177589,4.866247,.4253189,-1.051444,-.2804541,3.364668,3.293787,-10.15741,3.807407,-.3592377,-3.367415,.7900825,-1.093847,-.1436965,2.38478,5.78707,-2.445987,-1.311171,.2326563,1.158439,.5555416,-1.134824,-.1680468,-3.32562,4.458596,-.1135063,1.1045,.07794544,4.609952,.6854854,-1.143017,-.1565926,.3014687,-.1763027,-.03557925,-.2342406,.2528705,5.884085,.4750602,-1.136801,-.2907502,3.682423,-.4061202,-.8728159,4.00151,-.1522202,-5.528713,1.044847,-1.063652,.07808107,-1.983678,.3648078,2.102276,-3.06505,.8431951,10.3883,.2662834,-1.061015,-.2859814,4.223615,-2.290138,-8.31401,4.405718,-.4613627,-4.50291,1.008383,-1.106302,-.1697123,2.087196,8.238929,-2.992416,-1.821776,.3434859,.7755179,.534119,-1.17111,-.2106304,-1.614361,2.378103,-.1625969,.8504483,.1059312,4.046256,.6618227,-1.20048,-.2235733,1.01439,-1.174074,-.444018,.2262406,.1665868,5.461829,.567631,-1.223587,-.3502622,1.699106,.6724266,1.268567,2.135102,.0008039374,-5.221111,.944569,-.9452673,.1468459,-1.335034,4.346628,-12.85652,-1.807046,.8175243,9.301065,.3656798,-1.134681,-.3310951,3.571244,-2.208948,6.04158,3.107577,-.3112127,-4.186351,.9188333,-1.083237,-.1831394,2.062654,1.385424,-5.00495,-1.332669,.3627352,.332315,.6191181,-1.211527,-.2590617,-.1660874,.3627905,-.1039258,.4697924,.1671653,3.507497,.6022506,-1.433017,-.4733592,.1724445,.9953236,-1.874457,.4432099,.0171581,2.339272,.644147,-1.08492,-.1587903,.8999585,-2.537516,5.877859,2.014554,.09689141,.3177242,.9030399,-1.008242,.00279303,-.3507469,10.283,-20.80454,-2.781026,.899509,3.366951,.3473867,-1.103151,-.2799598,2.525791,-4.255704,9.903388,3.722668,-.3603941,-1.303292,.9369454,-1.102235,-.2025061,2.08566,1.686787,-5.010957,-1.656458,.4584029,-.2751759,.6184162,-1.25613,-.3104904,.163935,.1315502,-.7297583,.477848,.1259265,3.012108,.6202728,-1.620114,-.655267,-.2877157,1.094371,.2818914,.369683,.09428521,1.450951,.5681308,-.9686204,-.03755647,1.46998,-3.103414,2.856583,1.883209,-.05746099,1.286383,1.001751,-1.089377,-.1023062,-1.498891,10.66455,-17.20184,-2.759314,1.061258,2.910211,.2624701,-1.044681,-.2156857,3.230136,-.5863862,6.09664,3.550019,-.4255773,-1.500033,.9687696,-1.133658,-.2505101,1.71784,.008480428,-5.011789,-1.740989,.498343,-.2081829,.6088641,-1.335366,-.3863319,-.5279971,.3638324,.3230699,.08339707,.2483293,2.678646,.4998346,-2.004511,-.9957121,1.250807,.01625025,-.3410754,.7858244,-.09506757,.02651876,.5788643,-.8714157,.1192051,-.8486879,-.3702497,1.818277,1.103427,.2454866,3.841575,.984735,-1.042618,-.2285793,.3620175,2.983368,-9.776844,-1.971587,.6691674,-.7901947,.32132,-1.099112,-.1869868,2.044065,2.062964,1.265668,2.71013,-.1099443,.2179353,.9024108,-1.106985,-.2396881,1.809807,8.523319,-5.011788,-1.590086,.3248449,-.1003187,.6550606,-1.421285,-.4767024,-.3885004,.827459,-.3644229,.6999513,.0519671,2.578431,.624631,-2.611217,-1.398846,.4527425,-.5932142,.2224617,-.5593581,.3389633,-.7767112,.06536004,-.9881543,.04684782,-.8616613,.8799807,4.00313,1.739543,-.08098378,5.524802,1.499673,-.7544759,-.2314808,.812577,-.7724135,-9.577645,-1.629433,.6790832,-4.193895,-.02526624,-1.273719,-.218703,1.401798,5.231832,.7405093,1.775166,-.07269476,1.996087,1.05745,-1.046864,-.2247559,1.679449,11.40057,-4.948829,-1.182664,.3241038,-.2470012,.61159,-1.514607,-.598543,-.187761,1.75693,-1.314206,.611581,-597046e-11,2.412975,.8124304,-2.308414,-1.083797,-.1179959,-1.728246,.7784742,.5494505,.006203168,.9326251,-.1419518,-3.230837,-1.43867,-.9868286,2.974393,1.949339,-.6337857,.8160271,3.278606,1.354373,.5149378,.2754789,1.040965,-4.501186,-3.399057,.9661861,-.4736173,-4.037574,.2794847,-1.62187,-.3192763,.8786242,9.785565,-2.727652,.01903691,.5521261,2.138764,.8419871,-.9951701,-.2550607,1.498952,-.002737197,-3.101832,-.5921329,.2864422,-.4405218,.663141,-1.902954,-.9056918,-.206957,1.191499,-1.092577,.5849556,-9649602e-12,2.048407,.9001527,-1.271627,-.7193923,-.01136606,-.1167951,.003286175,-.05262827,-.02473874,1.716125,-.2187133,-7.647175,-3.114129,-1.490128,-.5266488,3.06309,1.474262,.5481458,2.052174,1.353089,2.191403,.342112,1.44651,2.170943,-7.768187,-1.471207,-.1456708,-1.753574,.2310576,-1.932296,-.3814739,.6245422,6.748294,-.3060171,1.067747,.2500671,-.1252596,.8614611,-.9471101,-.405264,1.300174,-.003951536,-1.908284,-.5385721,.2133578,-.6250292,.6658012],[-1.14053,-.1982747,-7.51273,8.403899,-.05699038,.9015907,.03392161,4.772522,.5111184,-1.165117,-.1852955,2.963684,-2.262274,-.1571683,.6339974,.04977879,7.243307,.4220053,-1.169936,-.3357429,1.911291,-.2391074,-.4791643,1.446113,-.09178108,-4.700239,.8096219,-1.060246,-.1051633,.5013829,2.832309,-.3707855,1.523131,.09163749,5.604183,.7208566,-1.089753,-.2382167,2.360312,-5.902562,-8.799894,1.377692,-.06131633,-1.415472,.6124057,-1.075481,-.1242391,1.425781,8.810319,-2.922646,1.48652,.0327058,3.889783,.4999482,-1.149342,-.2076337,-7.446587,8.014559,-.04866227,.8203043,.06386483,4.894198,.5452051,-1.120531,-.1513311,2.735504,-2.417591,-.1361114,.4296342,.09427488,8.171403,.4102448,-1.226964,-.3516378,1.308298,-.05097487,-.4846783,1.654619,-.113494,-3.347854,1.131147,-.9664377,.02767589,.1658235,2.407439,-.1300304,.9170958,.2742895,6.642633,.2550064,-1.153358,-.3126223,2.078934,-5.857733,-8.659848,1.758505,-.09616094,-1.230863,.9663832,-1.05385,-.1330743,1.481738,10.49485,-3.528854,.9142363,.124488,2.644615,.5001048,-1.173687,-.2360362,-3.741454,4.088507,-.07528205,.6645237,.07718265,4.65122,.5586318,-1.213757,-.2589561,.7132551,-.4259327,-.1980821,.3627815,.0466656,5.807984,.5847377,-1.108794,-.225987,1.574179,-.3753731,-.5984743,1.659414,-.01681021,.6785219,.8647325,-1.060896,-.0134669,-.7529656,1.711319,-.9792435,.2022433,.3826487,5.725157,.5290714,-1.085145,-.2840715,2.088029,-4.935097,-9.056542,1.976149,-.03912485,-.8636064,.7452125,-1.077983,-.1416633,1.100848,10.15875,-2.943712,.5255135,.2164224,2.941143,.6699937,-1.223293,-.2867444,-1.624136,1.668299,-.09537589,.5015947,.1130741,4.244812,.5082152,-1.325342,-.4280991,.470549,.06926592,-.4572587,.5344144,-.02554192,3.093939,.6639401,-1.113581,-.1192133,.4011536,.7011889,.2052842,.9880724,.01807533,4.69016,.857624,-1.016063,-.1038138,-.2280391,.7898918,-11.27333,.2074545,.5388182,1.364263,.4660455,-1.099582,-.2228607,1.332648,5.135188,1.653152,1.41702,-.1087532,1.809275,.8080874,-1.064357,-.1520775,.8207368,-.001323565,-5.009523,.3946298,.4337902,2.593198,.6719172,-1.278702,-.3512866,-.4511055,.389576,-.2429672,.4270577,.1135348,3.71913,.4998867,-1.580069,-.7095475,-.3198904,1.715748,-1.185915,.4523161,-.01026159,.7927188,.553835,-.9474023,.1173703,.4881381,-2.618684,3.251661,1.213931,-.01736274,8.000768,1.025998,-1.129091,-.3287694,-.3524077,3.352892,-14.16073,-.8485617,.6560766,-2.820937,.3111303,-1.030884,-.1137581,1.109855,8.082276,1.519214,2.112433,-.1592299,3.675905,.8703367,-1.075192,-.1627166,.351491,1.168164,-4.255822,-.6015348,.6265776,2.884818,.6548384,-1.316017,-.3889652,-.5030854,.4488704,-.31868,.4570763,.08909201,3.659274,.5011746,-1.731876,-.8493806,.1194871,2.002781,-2.006547,.4872233,-.02854606,.2662137,.4611629,-.927368,.1380954,-.3302179,-3.553265,4.633345,.9696729,.08799775,8.291129,1.094451,-1.099377,-.3325392,.2501063,2.613712,-13.28142,-.5579527,.4992081,-3.504402,.3022924,-1.04842,-.1227773,.5845373,11.05869,.03813151,1.330409,.01978131,3.95943,.8396439,-1.063233,-.1560639,.2840033,.8751565,-3.41182,-.1436564,.584658,2.899292,.6799095,-1.376715,-.4541567,-1.445491,1.569898,-.1390627,.555827,.04109877,3.349451,.5516123,-1.953391,-1.035869,1.690563,-.196469,-.7787096,.5799605,.02945626,.04217906,.2451373,-1.012422,.07136451,-1.862534,-.7228653,.1947997,.2091805,.06399233,7.928994,1.290733,-.9706708,-.288095,1.107797,-2.731734,-8.445995,.4296774,.5117648,-3.824277,.1761207,-1.110611,-.1789409,.2108488,20.7143,-1.763174,.09554695,-.02943103,3.422079,.8815496,-1.048334,-.1614087,.2475184,.02146938,-2.983901,.2538224,.560137,2.461925,.6777394,-1.393719,-.5002724,-2.40894,2.680983,-.1362825,.7395067,-3300343e-12,3.260889,.8132057,-2.128663,-1.151182,2.923026,-1.931838,-.442617,.2309983,-.00548589,.3279529,-.2229467,-1.618022,-.376649,-3.163544,1.611608,-.3967476,.393368,.3006742,6.835177,1.613765,-.5669064,-.1481749,2.071817,-8.157422,-5.988088,.2387202,.1447191,-4.296385,.05011258,-1.241724,-.2519348,-.1908609,29.52235,-3.33366,-.01837651,.1022249,2.92932,.8867262,-1.02167,-.1667327,.1789771,-.002178108,-2.641572,-.05641484,.5303758,2.138196,.678035,-1.669332,-.7588708,-2.993557,3.17876,-.08066442,.6544672,-808988e-11,2.628924,.9001272,-1.755806,-.8735348,3.258881,-2.504785,-.3300791,.1180565,-.009315982,1.785154,-.3205824,-3.720277,-1.73335,-3.332272,1.515869,.1734218,.8011956,.199544,3.817666,1.638502,.4724641,.3209828,2.051443,-5.105574,-6.509139,-.4232041,.2598931,-2.151756,-.00349391,-1.5256,-.4897606,-.09891121,23.46818,-2.278152,.1681219,-.04469389,1.051,.9294666,-.9908649,-.2008182,.1605143,-.002463113,-2.477349,-.1218647,.4750121,1.460813,.6661364,-2.122119,-1.125475,-3.066599,3.145078,-.05411593,.5133628,-7823408e-12,2.268448,.9001416,-1.528158,-.9370249,2.567559,-1.591439,-.363446,.1763256,.001119624,1.811848,-.2637929,-6.524387,-2.673507,-2.940472,-.6025609,.7852067,1.073499,-.03540435,3.517416,1.490466,.8886026,-.09681828,1.430554,4.993717,-6.071355,-.6053986,.5092997,-1.27301,.07491329,-1.481997,-.5897282,.2659264,1.267239,-.5741291,.05983011,-.2217312,-.3016452,.926083,-1.010943,-.2075134,.05066749,14.70708,-3.780501,.07253223,.4045458,1.320164,.6559925,-1.129907,-.1884011,-8.04767,9.035776,-.05539419,.8823349,.03197135,4.839388,.5042822,-1.133821,-.1510781,3.362822,-2.453381,-.1463925,.4728708,.0595814,7.6363,.4805162,-1.176518,-.3549902,1.729044,-.2160966,-.5075865,1.675584,-.08906902,-5.386842,.5452218,-1.043563,-.07520975,.8750644,2.510518,.007584882,.936125,.07889083,6.066644,.5813108,-1.081304,-.2222253,2.517638,-4.45382,-8.663691,.8662558,-.04802657,-.8965449,.4886656,-1.083774,-.1375469,1.685818,5.63112,-3.100752,.4045941,.02346895,3.390321,.5008309,-1.143158,-.2058334,-9.660198,10.62394,-.04434119,.8607615,.03177325,4.416481,.5918162,-1.146773,-.1727385,4.626048,-4.684602,-.08307137,.1619616,.1484866,7.572868,.2681126,-1.151324,-.3099303,.4125596,2.340752,-.4214444,1.987375,-.191341,-3.845978,1.337311,-1.034258,-.007778759,.7050094,-.8036369,.313857,.2469452,.355997,7.485917,.04790329,-1.096568,-.2673169,2.575654,-.8057121,-8.884928,1.41617,-.2091315,-1.543494,1.065445,-1.083304,-.1528265,1.697727,2.503702,-2.885296,-.12985,.154887,2.479652,.5066496,-1.165736,-.2329945,-5.967964,6.705959,-.05931355,.7485638,.03913878,4.221591,.6183926,-1.212422,-.254591,2.418626,-2.266104,-.1102014,.01363887,.1055411,5.648062,.4557412,-1.070436,-.2163341,.7098718,.7843075,-.432393,2.109823,-.095897,-.1985193,1.060428,-1.104879,-.03013622,.02976276,1.069707,.141,-.488002,.4452288,6.41859,.3195986,-1.048969,-.2655317,2.689426,-3.941038,-9.506461,1.837119,-.1892124,-1.562146,.9043414,-1.106145,-.1601642,1.544544,7.388492,-2.9246,-.4328453,.1763161,2.523111,.5851902,-1.203666,-.2776587,-2.084286,2.45084,-.08746613,.5258507,.07983316,3.860055,.5486167,-1.340448,-.423059,.3462849,.4707607,-.2512626,.1530746,.02724218,3.035216,.5876133,-1.014554,-.116879,.9477794,-1.061218,-.419673,2.058832,-.05989624,3.058168,.9763861,-1.137388,-.0985403,-.2984893,3.64782,-.6585571,-1.47918,.6102932,3.265914,.3480333,-1.021816,-.2344957,2.463671,-7.240685,-8.862697,2.514058,-.2122768,-.03313968,.9028136,-1.126581,-.1874347,1.454154,10.34398,-3.237393,-.8654927,.2457248,1.845769,.6002482,-1.263727,-.3439354,-.1786388,.3980166,-.3349517,.3825166,.1029225,3.331096,.4998955,-1.53001,-.6879698,.2380415,1.608216,-1.682679,.354636,-.00391522,.4517655,.5128605,-.9685659,.09480403,.06076844,-3.217561,4.568074,1.069299,.02083638,7.301088,1.072165,-1.113925,-.3112382,.3954133,5.105907,-14.56866,-.4917378,.5289909,-2.678374,.3014709,-1.046864,-.1215754,1.778308,4.661489,.2565583,1.35368,-.1175767,3.415972,.8457746,-1.10448,-.1940913,1.343668,-.001759206,-5.009204,-.4186951,.312571,1.628183,.6720408,-1.286902,-.3781238,-.08977253,.3545393,-.4866515,.3843664,.08281675,3.122231,.5046991,-1.712597,-.8549112,.4809286,1.515398,-2.212211,.2539029,.02335997,-.06089466,.4268444,-.8807283,.1646097,-.4437898,-3.188247,5.984417,1.334779,-.04026975,7.546431,1.175751,-1.147253,-.3538199,.6101836,4.43778,-15.59813,-1.103222,.6242039,-3.091472,.217429,-1.03823,-.1213475,1.547505,5.893176,1.368738,1.663127,-.137713,3.185279,.8736453,-1.101026,-.1874907,1.272667,3.596524,-5.007243,-.6352483,.3048985,1.931613,.6788844,-1.342753,-.4384971,-1.213491,1.621399,-.1551441,.5614218,.02591739,2.958967,.5782132,-1.937684,-1.066019,1.913336,-.7347719,-.5916167,.158759,.1092568,-.6275002,.1599071,-.9302391,.1486187,-1.603835,.1783713,1.100461,1.174181,-.1602361,7.868331,1.468971,-1.053631,-.372705,1.114117,-.9603286,-10.62469,-1.16214,.7952797,-4.478765,-.04440862,-1.083629,-.1261405,1.229344,11.27825,.131901,1.624729,-.2825898,3.661082,1.036911,-1.09395,-.2067455,1.258035,7.548645,-4.598387,-.8944932,.3292634,1.311304,.6291871,-1.385867,-.5068139,-1.48649,1.969049,-.1698025,.6629167,-5289365e-12,2.760315,.8644368,-2.107367,-1.175639,2.313241,-1.001653,-.4843139,.1124485,3901494e-11,-.3502469,-.320478,-1.475244,-.2833055,-2.085824,1.192563,-.76452,.8380081,.220358,7.157885,1.753702,-.6644372,-.2549735,1.600273,-8.589034,-6.144718,-.7599731,.289837,-5.770923,-.09656242,-1.211687,-.1653494,.83934,27.92988,-3.395461,.9933752,-.03976877,3.776659,.9546526,-1.063757,-.2037563,1.117207,-.001252806,-3.33233,-.6971409,.3388719,1.311398,.6635171,-1.678889,-.7992295,-2.421687,2.871029,-.07662842,.6046208,-7598099e-12,2.002314,.9001307,-1.692144,-.880425,3.060895,-2.000009,-.3183563,.08385862,-.006326713,1.206639,-.3369967,-3.676795,-1.719207,-2.534697,1.005285,.1550407,1.07291,.1318094,3.717018,1.689191,.5424542,.3263528,1.551055,-3.841058,-6.598996,-1.201779,.3530669,-2.542945,-.06482523,-1.553849,-.457686,.9324676,19.50982,-2.344516,1.12102,-.1221537,.7285496,.9582816,-1.02065,-.2215797,1.009774,-.002056855,-2.740338,-.8122355,.3328967,.8982766,.6594676,-2.24736,-1.221267,-3.072346,3.385139,-.04387559,.5084887,-7418833e-12,1.750107,.9001401,-1.248499,-.8442718,3.062611,-2.020314,-.2815341,.05254745,.003345008,1.433225,-.2835911,-7.004119,-2.927978,-2.649852,.7971894,.5466893,1.442667,-.06063912,2.806194,1.547429,1.434882,.09114639,1.170089,.03512808,-5.861915,-1.411843,.5400486,-.7746522,.02386984,-1.559053,-.5502302,1.200396,13.47741,-2.344397,.8868907,-.3292661,-1.362105,.9217826,-1.044436,-.2360719,.7054471,-.002904518,-2.092829,-.5119668,.4174861,.9687435,.6588427],[-1.372629,-.4905585,-41.00789,41.22169,-.00738936,.4839359,.006474757,3.471755,.5092936,-1.523025,-.6497084,6.249857,-5.662543,-.01908402,.551281,-2181049e-11,2.507663,.4339598,-1.035567,-.0747874,.922103,-2.140047,-.02374146,.3795517,-.01769134,7.479831,.7729303,-1.271086,-.558819,.6908023,2.096832,-.2453967,1.410648,.04475036,-4.719115,.5741186,-.9712598,-.07033926,.9167274,-.9502097,.3004684,.4547054,-.05929017,5.266196,.7204135,-1.087457,-.1888896,.8156686,.3101712,-2.155419,1.422205,.09692261,3.122404,.499943,-1.42528,-.5413508,-34.54883,34.81142,-.008686975,.4914268,-2479243e-12,3.239879,.6094201,-1.688557,-.8070865,7.018459,-6.244574,-.02149341,.3993971,.01252502,1.630662,.109786,-.8664152,.07869125,-.5236535,-1.21896,-.02059093,.6684898,-.05584112,8.602299,1.410496,-1.319763,-.5985323,1.253918,1.914706,-.3216739,.9011213,.1324845,-5.252749,.06231252,-.9706008,-.05914059,.569315,-1.175362,.5221644,.7518213,-.08247655,5.875635,.9850863,-1.08533,-.1956105,.8019605,.5338101,-3.423464,1.110444,.1507923,2.864942,.4999481,-1.431967,-.5478935,-32.86288,33.05288,-.008380797,.477205,-3044274e-12,3.289973,.5976303,-1.801361,-.9315889,5.391756,-4.588592,-.02040076,.4144684,.01814534,1.051795,.1145651,-.7905357,.1451332,-.1605661,-1.592174,.0004561348,.3380323,-.07770275,8.775384,1.489512,-1.308575,-.5539232,.9184133,2.011479,-.3842472,1.432274,.1637153,-4.408856,.05272957,-.9829872,-.08183048,.4464556,-1.442716,1.029641,-.06991617,.008702356,5.706417,.9116452,-1.08713,-.2038013,.7260801,.9164376,-5.006183,1.511271,.1257134,2.715439,.6201652,-1.448662,-.5799075,-28.33268,28.58023,-.009134061,.4404783,-2709026e-12,3.029357,.5540071,-2.061772,-1.14519,7.918478,-7.212525,-.0202076,.2962715,.0468967,.8517209,.2334587,-.6413755,.1780425,-2.412919,1.064484,-.01949986,.6769741,-.175276,7.262714,1.325869,-1.304871,-.3975581,1.219002,.7285178,-.2710105,.7779727,.3247139,-.8818168,.1839517,-1.001104,-.1994801,.3676742,-1.409737,.2901555,.250694,.002468899,3.398923,.8584645,-1.111552,-.2487204,.7410842,1.703749,-5.007855,1.057763,.1354511,2.088715,.6600013,-1.547227,-.6679466,-18.61465,18.84045,-.0124221,.4157339,-2432805e-12,2.812423,.5446957,-2.04389,-1.149081,2.304118,-1.715757,-.02433628,.2816836,.07185458,1.06486,.2706789,-.904072,-.08274472,-.2555676,-.6326215,-.0277088,.6676024,-.2513532,5.903839,1.241452,-1.000013,-.1010774,.3699166,.8774526,-.3042007,.6951053,.4361813,.6793421,.2573892,-1.171332,-.3768188,.3701377,-1.470757,.5525942,.02991456,.01581823,2.365233,.8214514,-1.068667,-.232633,.6725059,2.243733,-4.61437,1.033677,.1376291,2.013334,.6865304,-1.592991,-.7246948,-25.98204,26.2196,-.008365176,.4207571,-2742772e-12,2.623735,.587319,-2.271349,-1.280884,6.308739,-5.75835,-.01977049,.3671835,.06698038,1.150597,.1759218,-.636862,-.007436052,-2.230026,1.640997,-.01548497,.3145331,-.2492644,5.083843,1.260215,-1.177925,-.09628114,.3051152,-.03749544,-.2713209,1.164226,.4559969,2.175429,.2874284,-1.0785,-.3801779,.4788906,-.4795969,.5977621,-.4488535,.03386874,1.538143,.8062054,-1.108028,-.2596892,.5162202,1.557081,-4.265039,1.182535,.1563762,2.095084,.6883383,-1.668427,-.7908511,-27.7969,27.99746,-.007186935,.3757766,-3326858e-12,2.563421,.5439687,-2.156175,-1.220004,3.585732,-3.235988,-.01086239,.1846143,.1046017,1.234427,.2842191,-1.117051,-.4101627,-.846373,.7671472,-.02226609,.8574943,-.3434124,4.475715,1.154824,-.744484,.2312078,-.5393724,.1574213,-.1763914,.2751692,.55642,2.217672,.3483932,-1.273036,-.5275562,.4902512,-.04498436,.4339366,.2386682,.02380879,1.413444,.7855923,-1.084192,-.2936753,.4719432,1.384436,-3.257789,.6119543,.1681884,1.650441,.6936631,-1.84849,-.951267,-30.05251,30.24315,-.005635304,.344778,-2782999e-12,2.309422,.5643559,-2.300008,-1.252335,-1.218876,1.49373,-.0061071,.0797486,.1023449,1.505934,.2360948,-1.483705,-.8547575,-.7797146,.6447971,-.02678052,1.091263,-.3344889,3.830416,1.189425,-.5348005,.3982733,-.4071573,.3265569,-.08658789,-.2370892,.5369097,1.478279,.3143303,-1.320401,-.6043247,.3019196,-.07732911,.4768381,.6745764,.03694098,1.158234,.8169056,-1.10104,-.3420019,.3775661,1.769338,-2.990515,.1649529,.1970125,1.453355,.6759757,-2.251946,-1.229349,-32.71808,32.83114,-.004252027,.3372289,-3001937e-12,2.154046,.5842674,-1.867834,-.9531252,-12.29365,12.69149,-.006844772,.1185107,.07539587,1.846381,.1899412,-3.398629,-2.180862,2.335213,-3.382823,-.008613985,.8431602,-.2393567,3.11246,1.218556,.5708381,.940603,-.6890113,2.746233,-.05772068,.1096005,.3491978,.7281453,.3212049,-1.705909,-.8517224,.113116,-2.141434,.4274043,.33976,.178649,.9026101,.78828,-1.012865,-.3495551,.3369038,3.724205,-3.089586,.1266964,.146179,1.170199,.6931052,-2.890318,-1.665573,-34.93756,35.00369,-.002984251,.2622419,-425936e-11,1.947681,.6905752,-1.956022,-1.0629,-19.19714,19.75164,-.008865396,.216554,.05475637,1.761134,.003164249,-5.612198,-3.101371,4.098034,-6.144001,.009944958,.2905472,-.170711,3.199107,1.33766,.8353756,.4855943,-1.243589,5.147385,-.07013963,.938041,.2335714,.1727744,.2802696,-1.524329,-.7388547,.3259025,-4.050634,.4058549,-.2591384,.1898299,.3556071,.7884126,-1.070371,-.4207858,.1739862,5.29341,-3.136757,.2323856,.1673706,1.007227,.6844287,-1.34172,-.4834889,-46.33447,46.82148,-.006137296,.4599216,.007047323,2.895798,.4999398,-1.529104,-.6498631,15.34103,-14.50675,-.01531439,.3280082,.01682926,1.901587,.5013227,-1.014776,-.1454495,-4.071085,2.954982,-.02630348,.5681531,-.03016505,6.773854,.5003504,-1.172413,-.402632,2.960428,.202071,-.2004947,.9375572,.05998168,-4.945934,.4502898,-.9898161,-.05772814,.4470024,-.5786656,.1158168,.346804,-.0504336,6.867947,.8012363,-1.085111,-.1882675,1.223748,.3565495,-3.688357,.5653723,.06727646,2.69013,.49994,-1.389119,-.529025,-40.55774,41.05972,-.007062577,.456006,-1736334e-12,2.775512,.6671455,-1.584641,-.7200619,12.48067,-11.56028,-.01659568,.3050029,.01099895,1.438927,-.02138015,-.9826068,-.08887254,-2.960031,1.808816,-.02478159,.6035733,-.04868441,7.347705,1.584739,-1.150423,-.4073793,2.412991,.487084,-.2337902,.8295114,.1129914,-5.150045,-.09016643,-1.016933,-.06311501,.5218937,-.571643,.1250993,.3601524,-.05497586,7.060139,1.018333,-1.073151,-.1845444,1.155394,.3004486,-3.431711,.4657031,.09401223,2.68862,.4999544,-1.391257,-.5365815,-42.55881,42.99132,-.005838466,.4229134,-2760038e-12,2.775531,.6234597,-1.780062,-.922888,13.76172,-12.60946,-.01507526,.3117435,.02205045,.6093731,.03463446,-.7388169,.127567,-3.999528,2.223993,-.01856853,.543931,-.08834054,8.037139,1.645951,-1.322387,-.5320143,2.659359,1.086712,-.2129712,.8704649,.1800315,-4.967241,-.138372,-.9378288,-.01599895,.3607555,-1.980561,.3791456,.1212268,-.02845992,6.825542,1.059139,-1.100832,-.2172313,1.211561,2.002721,-5.010011,.5717583,.06777702,2.160006,.5676392,-1.409373,-.5708751,-30.34974,30.79809,-.007280715,.3723304,-2436279e-12,2.577348,.5913377,-1.954312,-1.11651,5.399148,-4.299553,-.01724739,.3742824,.04187077,.1044883,.1232727,-.6772215,.2001396,-.3670523,-1.014628,-.003497152,.4099858,-.1584633,7.7504,1.514559,-1.2916,-.4977437,.9641914,1.56242,-.3227782,.9055427,.3046444,-3.385619,.009546291,-.9750857,-.0877056,.9054256,-1.429236,.8974777,-.1217961,-.05194608,4.909409,.9589153,-1.088007,-.1959301,.9745799,1.260761,-5.008864,.7271248,.1096661,2.717295,.6340731,-1.45605,-.6223072,-22.28088,22.69604,-.009340812,.4118308,-2418083e-12,2.442117,.5589638,-2.176449,-1.302416,2.222836,-1.22273,-.01728051,.1323513,.07027731,.04835745,.2093351,-.5789641,.2215407,.2142291,-1.201725,-.01185728,.8122982,-.238042,6.706841,1.404146,-1.307463,-.4515174,.6447827,1.223841,-.2902391,.4986588,.4073652,-1.706696,.1060885,-.9698678,-.1307094,.9389347,-1.522852,.7768797,-.1368595,-.03857426,3.676935,.8980966,-1.104349,-.2380323,1.047043,1.865421,-5.011664,.7014954,.09622701,1.89136,.6687354,-1.502249,-.6724523,-28.88092,29.3036,-.006685766,.3685464,-2469442e-12,2.310797,.5566754,-2.217125,-1.364924,4.048243,-3.111333,-.01317747,.1921948,.08627702,.001981769,.2213689,-.6215757,.1687995,-.5949131,-.1551293,.0003356129,.6897657,-.2855053,6.271042,1.363084,-1.216317,-.3489429,.7566226,.5409809,-.2830843,.6191825,.4755163,-.9131387,.1383909,-1.030437,-.2034064,.8335995,-1.050947,.8689093,-.367231,-.04056183,3.111269,.8856842,-1.078984,-.2070549,.9683145,1.497022,-5.007653,.7702541,.1285822,2.225188,.6587911,-1.559291,-.7374039,-35.96311,36.3447,-.004667132,.3277964,-2487945e-12,2.215652,.5764681,-2.356929,-1.444755,6.244526,-5.540162,-.00879451,.17921,.09578517,.3737676,.1922194,-.6589752,-.0292691,-1.831779,1.869962,-.002030095,.7552089,-.3168157,4.632196,1.294054,-1.161046,-.1472506,.6494138,-.8327174,-.2320724,.3391212,.5269637,.9376341,.2458573,-1.034427,-.3062504,.8975634,.3203531,.8565142,-.1250162,-.04094017,1.861304,.8223468,-1.109954,-.2740277,1.063811,.7077398,-4.695734,.5621696,.1248956,1.297723,.678972,-1.788293,-.9368751,-43.8298,44.24963,-.00365253,.3094331,-2810503e-12,1.904402,.5861599,-2.268206,-1.312676,2.863082,-2.373727,-.00514498,.1711072,.09316041,.9309598,.1791683,-1.376966,-.7418582,-1.349589,1.563419,-.003124219,.6967139,-.3061887,3.602731,1.255669,-.601754,.2815928,.5424052,-.688545,-.1620001,.2980046,.4995571,.7371203,.2812466,-1.278853,-.5245326,.787052,.3125067,.7748105,-.07788581,.003490956,1.283748,.813019,-1.05093,-.2786331,1.056344,1.053002,-4.047789,.4432174,.1169077,.9532621,.6806764,-2.084927,-1.203954,-48.81638,49.2016,-.002896045,.2882977,-3073517e-12,1.702211,.637418,-2.328567,-1.238023,-1.891019,2.45152,-.005847581,.2084702,.0784813,1.211048,.08095008,-2.634632,-1.78946,-.1370558,-.3326435,.002783737,.5239451,-.2548881,2.896327,1.324116,.06882616,.5997821,.1535398,1.375209,-.1267285,.4239743,.4013122,.1794675,.2395382,-1.430918,-.6439041,.832598,-1.705612,.7236426,-.05567593,.06408718,.6836524,.8388887,-1.037956,-.3215402,.9457349,3.178114,-4.152156,.2230992,.1156198,.7606223,.6656923,-2.967314,-1.728778,-37.30988,37.55578,-.002588835,.2927966,-3935038e-12,1.592161,.6868694,-2.123311,-1.175148,-13.14988,13.86882,-.007828537,.1852026,.05481038,1.294309,.02428177,-5.443597,-3.156344,2.110838,-3.421556,.0118189,.1196951,-.1742902,2.404353,1.272805,1.029898,.5912521,-.3983531,3.286069,-.09252065,1.331381,.2560642,.8001754,.3624178,-1.547574,-.7881604,1.020902,-2.897069,.521347,-.9242315,.1185594,-1.150721,.7317211,-.9621043,-.1991406,.6531287,3.925839,-3.596904,.6317332,.1531334,1.457846,.6966285]],yx=[[1.962684,1.159831,4.450588,5.079633,4.437388,4.324573,1.946487,1.287515,3.703696,8.782833,3.440437,5.160333,1.88217,1.335878,2.648641,13.58368,3.105473,5.907387,1.738159,1.624289,-.008786695,21.18253,2.770255,7.055672,1.571896,2.301786,-4.028545,29.66806,1.630876,8.711031,1.475048,2.679086,-6.311315,33.77896,2.140975,9.385283,1.326174,3.378759,-9.831444,39.42061,2.852702,10.82542,1.153344,3.967771,-12.65181,41.95016,7.468239,12.2135,.9746081,4.051626,-12.98454,37.54964,17.49232,14.20619,.8448016,3.181809,-8.757338,21.97962,35.24033,16.39549,2.029623,1.364434,4.201529,5.415099,9.825839,10.63328,2.023126,1.494728,3.420413,9.072178,9.205157,11.86639,1.956307,1.648665,2.039712,14.30239,9.039526,13.30453,1.825053,1.985022,-.8036307,22.02493,9.415361,15.17659,1.650367,2.593201,-4.469328,29.69817,9.410977,17.4485,1.555202,2.962925,-6.60817,33.29887,10.64559,18.50816,1.412478,3.439403,-9.196616,36.85077,13.45341,20.03128,1.25299,3.820805,-11.15338,37.21593,20.14916,21.8232,1.091952,3.663027,-10.3133,29.78985,32.96835,23.7545,.9501691,2.664579,-5.545167,12.81159,51.54768,25.74284],[1.59033,1.355401,1.151412,13.59116,5.857714,8.090833,1.55254,1.51004,.1276413,16.04643,5.912162,8.350009,1.470871,1.880464,-1.865398,20.30808,5.471461,9.109834,1.356563,2.373866,-4.653245,25.70922,5.686009,10.0948,1.244232,2.851519,-7.130942,29.93449,6.38212,11.14578,1.173693,3.120604,-8.491886,31.87393,7.290615,11.80066,1.091845,3.368888,-9.722083,32.68508,10.32424,12.36508,.9858985,3.500541,-10.26328,30.92956,16.10881,13.31222,.8864993,3.172888,-8.68755,23.62161,26.21851,14.74967,.7946973,2.189355,-4.207953,9.399091,40.62849,16.81753,1.711696,1.657311,.9328021,13.1788,15.06751,18.63556,1.666968,1.849993,-.2088601,15.86653,14.8688,19.40719,1.584846,2.170022,-2.019597,19.70826,14.90684,20.45055,1.469412,2.524017,-4.197267,23.65249,16.64588,21.34477,1.369714,2.843548,-6.059031,26.34993,18.81361,22.32186,1.310477,2.984444,-6.831686,26.8234,21.23267,22.59755,1.222552,3.176523,-7.731496,26.7176,24.84358,23.36863,1.115781,3.130635,-7.581744,23.36531,31.71048,24.13859,1.013181,2.699342,-5.602709,15.00158,42.17613,25.15957,.8976323,1.726948,-1.29612,1.183675,55.03215,26.43066],[.9926518,1.999494,-4.136109,18.5627,13.51028,13.90238,.9634366,2.119694,-4.614523,19.19701,13.76644,14.18731,.9446537,2.17161,-4.915556,19.1824,15.37135,14.0053,.9073074,2.330536,-5.577596,19.61615,16.88365,14.46955,.8739124,2.388682,-5.842995,19.23265,18.87735,14.85698,.8563688,2.391534,-5.769133,18.28709,20.97209,14.69587,.8270533,2.34279,-5.558071,16.84993,23.56498,15.05975,.7908339,2.190341,-4.852571,13.74862,28.06846,15.48444,.7403619,1.783998,-2.983854,7.622563,35.0761,16.15805,.6840111,1.154457,-.239383,-.7896893,42.82765,17.79469,1.1683,1.860993,-2.129074,12.51952,30.32499,29.38716,1.150338,1.918813,-2.413527,12.74862,30.87134,29.51432,1.114719,1.964689,-2.625423,12.47837,32.37949,29.43596,1.077948,2.006292,-2.846934,11.90195,34.59293,29.37492,1.035143,1.986681,-2.752584,10.60972,37.22185,29.18594,1.015992,1.992054,-2.812626,10.01416,38.473,29.24624,.9756887,1.939897,-2.533281,8.319176,40.83907,29.25586,.9264164,1.716454,-1.597044,4.739725,45.07683,28.78915,.8595191,1.346034,-.02801895,-.6582906,50.17523,28.52953,.7754116,.7709245,2.200201,-7.487661,54.36622,28.93432]],Ex=3,ca=.1,vf=68e-6,Xh=(n,t,e,i)=>(1-i)**5*n[t]+5*(1-i)**4*i*n[t+e]+10*(1-i)**3*i**2*n[t+2*e]+10*(1-i)**2*i**3*n[t+3*e]+5*(1-i)*i**4*n[t+4*e]+i**5*n[t+5*e];function bx(n,t,e,i){const s=Math.min(10,Math.max(1,t)),r=Math.min(1,Math.max(0,e)),o=(Math.min(Math.PI/2,Math.max(0,i))/(Math.PI/2))**(1/3),a=Math.floor(s),c=s-a,l=Sx[n],h=yx[n],d=new Array(9).fill(0);let f=0;const u=[[0,a,(1-r)*(1-c)],[1,a,r*(1-c)]];a<10&&u.push([0,a+1,(1-r)*c],[1,a+1,r*c]);for(const[p,_,m]of u){const g=540*p+54*(_-1);for(let x=0;x<9;x++)d[x]+=m*Xh(l,g+x,9,o);f+=m*Xh(h,60*p+6*(_-1),1,o)}return{config:d,radiance:f}}function wx({config:n,radiance:t},e,i){const s=Math.cos(i),r=Math.exp(n[4]*i),o=s*s,a=(1+s*s)/(1+n[8]*n[8]-2*n[8]*s)**1.5,c=Math.sqrt(Math.max(0,Math.cos(e)));return(1+n[0]*Math.exp(n[1]/(Math.cos(e)+.01)))*(n[2]+n[3]*r+n[5]*o+n[6]*a+n[7]*c)*t}function Tx(n,t){const e=Math.asin(Math.max(-1,Math.min(1,n[2])));return[0,1,2].map(i=>bx(i,Ex,t[i],e))}function Ax(n,t,e=48){const i=new b(t[0],t[1],Math.max(0,t[2])).normalize(),s=[0,0,0],r=Math.PI/2/e,o=2*Math.PI/(e*2),a=new b;for(let c=0;c<e;c++){const l=(c+.5)*r,h=Math.cos(l)*Math.sin(l)*r*o;for(let d=0;d<e*2;d++){const f=(d+.5)*o;a.set(Math.sin(l)*Math.cos(f),Math.sin(l)*Math.sin(f),Math.cos(l));const u=Math.acos(Math.max(-1,Math.min(1,a.dot(i))));for(let p=0;p<3;p++)s[p]+=wx(n[p],l,u)*h}}return s}const pl=(n,t)=>[n[0]*t,n[1]*t,n[2]*t],Yh=n=>n&&n.lux>0&&n.dir[2]>-.02?{dir:new b(...n.dir).normalize(),radiance:pl(bi(n.cct),n.lux/vf)}:void 0;function Rx(n,t=[ca,ca,ca]){const e=bi(n.cct),i=pl(e,n.diffuse_lux);let s=[],r=[0,0,0],o;if(n.sun){s=Tx(n.sun.dir,t);const f=Ax(s,n.sun.dir);r=[0,1,2].map(u=>f[u]>0?i[u]/f[u]:0),o=new b(n.sun.dir[0],n.sun.dir[1],Math.max(0,n.sun.dir[2])).normalize()}const a=pl(i,1/Math.PI),c=n.sun?n.sun.lux*Math.max(0,n.sun.dir[2]):0,l=n.moon?n.moon.lux*Math.max(0,n.moon.dir[2]):0,h=[0,1,2].map(f=>i[f]+(n.sun?bi(n.sun.cct)[f]*c:0)+(n.moon?bi(n.moon.cct)[f]*l:0)),d=[0,1,2].map(f=>t[f]*h[f]/Math.PI);return{channels:s,scale:r,patternSun:o,uniform:a,sun:Yh(n.sun),moon:Yh(n.moon),ground:d}}const Cx=`
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Px=`
#include <common>
uniform float config[27];
uniform vec3 scale;
uniform vec3 patternSun;
uniform bool hasPattern;
uniform vec3 uniformSky;
uniform vec3 ground;
uniform vec3 sunDir;
uniform vec3 sunRadiance;
uniform vec3 moonDir;
uniform vec3 moonRadiance;
uniform float discCos;
varying vec3 vWorld;

float channel(int c, float theta, float gamma) {
  int o = c * 9;
  float cosG = cos(gamma);
  float expM = exp(config[o + 4] * gamma);
  float rayM = cosG * cosG;
  float g = config[o + 8];
  float mieM = (1.0 + cosG * cosG) / pow(1.0 + g * g - 2.0 * g * cosG, 1.5);
  float zenith = sqrt(max(0.0, cos(theta)));
  return (1.0 + config[o] * exp(config[o + 1] / (cos(theta) + 0.01))) *
    (config[o + 2] + config[o + 3] * expM + config[o + 5] * rayM + config[o + 6] * mieM + config[o + 7] * zenith);
}

void main() {
  vec3 dir = normalize(vWorld - cameraPosition);
  vec3 radiance;
  if (dir.z < 0.0) {
    radiance = ground;
  } else if (hasPattern) {
    float theta = acos(clamp(dir.z, 0.0, 1.0));
    float gamma = acos(clamp(dot(dir, patternSun), -1.0, 1.0));
    radiance = vec3(channel(0, theta, gamma), channel(1, theta, gamma), channel(2, theta, gamma)) * scale;
    if (dot(dir, sunDir) > discCos) radiance += sunRadiance;
  } else {
    radiance = uniformSky;
  }
  if (dir.z >= 0.0 && dot(dir, moonDir) > discCos) radiance += moonRadiance;
  gl_FragColor = vec4(radiance, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function Lx(n,t){var a,c,l,h;const e=n.channels.length?n.channels.flatMap(d=>d.config):new Array(27).fill(0),i=n.channels.length?n.channels.map((d,f)=>d.radiance*n.scale[f]):[0,0,0],s=d=>new b(...d??[0,0,0]),r=new Kn({vertexShader:Cx,fragmentShader:Px,side:un,depthWrite:!1,uniforms:{config:{value:e},scale:{value:s(i)},patternSun:{value:n.patternSun??new b(0,0,1)},hasPattern:{value:n.patternSun!==void 0},uniformSky:{value:s(n.uniform)},ground:{value:s(n.ground)},sunDir:{value:((a=n.sun)==null?void 0:a.dir)??new b(0,0,-1)},sunRadiance:{value:s((c=n.sun)==null?void 0:c.radiance)},moonDir:{value:((l=n.moon)==null?void 0:l.dir)??new b(0,0,-1)},moonRadiance:{value:s((h=n.moon)==null?void 0:h.radiance)},discCos:{value:1-vf/(2*Math.PI)}}}),o=new De(new On(t,64,32),r);return o.name="sky",o.renderOrder=-1,o.frustumCulled=!1,o.userData.part="sky",o}const ha=.3,Dx=4,ua=2048,qh=512,Mf=3,ec=n=>new ee().setRGB(n[0],n[1],n[2],ps);function Ix(n,t,e,i){const[s,r,o]=n,a=new op(ec(bi(i)),e),c=Math.hypot(s,r,o)+2;a.position.set(t[0]*c,t[1]*c,o/2+t[2]*c),a.target.position.set(0,0,o/2);const l=new Kt().lookAt(a.position,a.target.position,He.DEFAULT_UP).setPosition(a.position).invert(),h=new _n;for(const p of[-s/2,s/2])for(const _ of[-r/2,r/2])for(const m of[0,o])h.expandByPoint(new b(p,_,m).applyMatrix4(l));const d=.1,f=a.shadow.camera;f.left=h.min.x-d,f.right=h.max.x+d,f.bottom=h.min.y-d,f.top=h.max.y+d,f.near=Math.max(.05,-h.max.z-d),f.far=-h.min.z+d,f.updateProjectionMatrix(),a.shadow.mapSize.set(ua,ua),a.shadow.radius=Mf;const u=Math.max(f.right-f.left,f.top-f.bottom)/ua;return a.shadow.normalBias=u*1.5,a.shadow.bias=-2e-4,a}function Nx({light:n,at:t,thingId:e},i){const s=ec(bi(n.cct)),r=Math.hypot(...i);let o;if(n.shape==="spot"&&n.dir&&n.cone_deg!==void 0&&n.cone_deg<=180){const a=new $l(s,fc(n.lumens,n.cone_deg),0,n.cone_deg*Math.PI/360,0,2);a.target.position.set(t[0]+n.dir[0],t[1]+n.dir[1],t[2]+n.dir[2]),o=a}else{const a=n.shape==="spot"&&n.cone_deg!==void 0?fc(n.lumens,n.cone_deg):kf(n.lumens);o=new sp(s,a,0,2)}return o.position.set(...t),o.shadow.mapSize.set(qh,qh),o.shadow.camera.near=Math.max(.02,n.radius??.02),o.shadow.camera.far=r,o.shadow.bias=-5e-4,o.shadow.normalBias=.01,o.shadow.radius=Mf,o.userData.thingId=e,o.name=`light of ${e}`,o}function Ux(n,t){const e=cu(n),i=[],s=[];if(!e){const c=new Qc(16777215,new ee(ha,ha,ha),hu);c.position.set(0,0,1),c.name="fill (no light sent)",i.push(c)}for(const c of uu(t)){if(!c.light.on||c.light.lumens<=0)continue;const l=Nx(c,n.size);i.push(l),l instanceof $l&&i.push(l.target),s.push({light:l,lux:Hf(c.light,c.at)||c.light.lumens*1e-6})}let r;const o=e==null?void 0:e.sky;if(o){const c=Rx(o);r=Lx(c,150),i.push(r);const l=(d,f)=>{if(!d||d.lux<=0||d.dir[2]<=0)return;const u=Ix(n.size,d.dir,d.lux,d.cct);u.name=f,i.push(u,u.target),s.push({light:u,lux:d.lux*d.dir[2]})};l(o.sun,"sun"),l(o.moon,"moon");const h=new Qc(ec(bi(o.cct).map(d=>d*o.diffuse_lux)),0,1);h.position.set(0,0,1),h.name="sky light",i.push(h)}s.sort((c,l)=>l.lux-c.lux);const a=s.slice(0,Dx).map(c=>c.light);for(const c of a)c.castShadow=!0;return{objects:i,sky:r,shadowed:a,light:e}}function Ox(n,t,e){for(const i of n.children)i.userData.thingId!==t||!(i instanceof ir)||(i.position.applyMatrix4(e),i instanceof $l&&i.target.position.applyMatrix4(e))}const Fx=n=>{const t=new Set;return n.traverse(e=>{var i;e instanceof De&&((i=e.material.userData)!=null&&i.emitter)&&t.add(e.material)}),t},zx=2;function Bx(n,t,e,i,s){const r=s.map(_=>_.visible);for(const _ of s)_.visible=!1;const o=[...Fx(e)],a=o.map(_=>_.emissiveIntensity);for(const _ of o)_.emissiveIntensity=0;const c=e.getObjectByName("sky"),l=c==null?void 0:c.material,h=l?[l.uniforms.sunRadiance.value.clone(),l.uniforms.moonRadiance.value.clone()]:[];l&&(l.uniforms.sunRadiance.value.set(0,0,0),l.uniforms.moonRadiance.value.set(0,0,0));const d=new Set;e.traverse(_=>{_ instanceof De&&_.material instanceof Hs&&d.add(_.material)});const f=new $s(n),u=new b(0,0,Math.min(i[2]/2,1.2));let p=null;for(let _=0;_<zx;_++){for(const g of d)g.envMap=p,g.envMapIntensity=1,g.needsUpdate=!0;n.shadowMap.needsUpdate=!0;const m=f.fromScene(t,0,.02,400,{position:u,size:256}).texture;p==null||p.dispose(),p=m}f.dispose();for(const _ of d)_.envMap=p,_.envMapIntensity=1,_.needsUpdate=!0;return o.forEach((_,m)=>{_.emissiveIntensity=a[m]}),l&&(l.uniforms.sunRadiance.value.copy(h[0]),l.uniforms.moonRadiance.value.copy(h[1])),s.forEach((_,m)=>{_.visible=r[m]}),n.shadowMap.needsUpdate=!0,p}const ml=32,Hx=Math.cos(gf*Math.PI/180);function Sf(n){if(n.shape==="extrude")return dx(n);if(n.shape==="sweep")return mx(n);if(n.shape==="loft")return gx(n);if(n.shape==="box"&&n.round)return xx(n);const t=Zf(n);if(t)return Wx(t,n.arc);if(!n.wall)return new fi(1,1,1);const e=n.wall[0]/n.size[0],i=n.wall[1]/n.size[1],s=n.wall[2]/n.size[2],r=[[-.5,.5,-.5,.5,-.5,-.5+s],[-.5,-.5+e,-.5,.5,-.5+s,.5],[.5-e,.5,-.5,.5,-.5+s,.5],[-.5+e,.5-e,-.5,-.5+i,-.5+s,.5],[-.5+e,.5-e,.5-i,.5,-.5+s,.5]].filter(([a,c,l,h,d,f])=>c>a&&h>l&&f>d).map(([a,c,l,h,d,f])=>new fi(c-a,h-l,f-d).translate((a+c)/2,(l+h)/2,(d+f)/2)),o=yo(r);for(const a of r)a.dispose();return o}function co(n,t,e=(i=>(i=t.joint)==null?void 0:i.position)()??0){const{center:s,basis:r}=Jf(t,e);n.matrix.makeBasis(new b(...r[0]),new b(...r[1]),new b(...r[2])).scale(new b(...t.size)).setPosition(...s),n.userData.jointAt=e}const yf=250;function kx(n){return n!=null&&n("(prefers-reduced-motion: reduce)").matches?0:yf}function Gx(n){const t=new Map;return n.root.traverse(e=>{e.userData.joint&&t.set(e.userData.joint.key,e.userData.jointAt)}),t}function Vx(n,t,e,i=yf,s=requestAnimationFrame,r=cancelAnimationFrame){const o=[];if(n.root.traverse(h=>{var p;const d=h.userData.joint,f=d&&t.get(d.key);if(!d||f===void 0||i<=0||!(h instanceof De))return;const u=((p=d.part.joint)==null?void 0:p.position)??0;f!==u&&o.push({mesh:h,part:d.part,from:f,to:u})}),!o.length)return()=>{};let a,c=0;const l=h=>{a??(a=h);const d=Math.min(1,(h-a)/i),f=d*d*(3-2*d);for(const{mesh:u,part:p,from:_,to:m}of o)co(u,p,_+(m-_)*f),u.updateMatrixWorld(!0);e(),d<1&&(c=s(l))};for(const{mesh:h,part:d,from:f}of o)co(h,d,f),h.updateMatrixWorld(!0);return c=s(l),()=>r(c)}function Wx(n,t){if(!t)return Xx(n);const[e,i]=t,s=Math.max(2,Math.ceil(ml*i/(2*Math.PI))),r=bf(Ef(n),s,e,i);r.deleteAttribute("uv");const o=[r,Zh(n,e,-1),Zh(n,e+i,1)],a=yo(o);for(const c of o)c.dispose();return a}function Ef(n){const t=[];return n.forEach((e,i)=>{t.push(e);const s=n[i-1],r=n[i+1];if(!s||!r)return;const o=[e[0]-s[0],e[2]-s[2]],a=[r[0]-e[0],r[2]-e[2]],c=Math.hypot(o[0],o[1]),l=Math.hypot(a[0],a[1]);c>0&&l>0&&(o[0]*a[0]+o[1]*a[1])/(c*l)<Hx&&t.push(e)}),t}function bf(n,t,e=0,i=2*Math.PI){const s=new xo(n.map(([o,,a])=>new ut(o/2,a)),t,e+Math.PI/2,i).rotateX(Math.PI/2),r=s.getAttribute("position");for(let o=0;o<r.count;o++){const[a,c]=n[o%n.length];a>0&&r.setY(o,r.getY(o)*c/a)}return s.computeVertexNormals(),s}function Zh(n,t,e){const i=Math.cos(t),s=Math.sin(t),r=n.map(([u,p,_])=>({at:new b(u/2*i,p/2*s,_),flat:new ut(Math.hypot(u*i,p*s)/2,_)})).filter((u,p,_)=>u.flat.distanceTo(_[(p+1)%_.length].flat)>1e-9),o=new b(-s,i,0).multiplyScalar(e),a=[],c=[],l=new b,h=new b,d=new b;for(const u of ai.triangulateShape(r.map(p=>p.flat),[])){let[p,_,m]=u.map(g=>r[g].at);d.crossVectors(l.subVectors(_,p),h.subVectors(m,p)),d.dot(o)<0&&([_,m]=[m,_]),d.crossVectors(l.subVectors(_,p),h.subVectors(m,p)).normalize();for(const g of[p,_,m])a.push(g.x,g.y,g.z),c.push(d.x,d.y,d.z)}const f=new Ce;return f.setAttribute("position",new ae(a,3)),f.setAttribute("normal",new ae(c,3)),f.setIndex(a.map((u,p)=>p).slice(0,a.length/3)),f}function Xx(n){const t=Ef(n),e=bf(t,ml,-Math.PI/2),i=e.getAttribute("normal"),s=new b,r=new b;for(let o=0;o<t.length;o++){const a=ml*t.length+o;s.fromBufferAttribute(i,o).add(r.fromBufferAttribute(i,a)).normalize(),i.setXYZ(o,s.x,s.y,s.z),i.setXYZ(a,s.x,s.y,s.z)}return e}const gl={wood:{colour:9132587,family:"wood"},pine:{colour:9132587,family:"wood"},oak:{colour:10514495,family:"wood"},lcd:{colour:1447450,family:"glass"},glass:{colour:13624298,family:"glass"},paper:{colour:15722184,family:"cloth"},cotton:{colour:7306652,family:"cloth"},linen:{colour:14274488,family:"cloth"},wool:{colour:10194814,family:"cloth"},silk:{colour:15260872,family:"cloth"},nylon:{colour:5923952,family:"cloth"},polyester:{colour:5924984,family:"cloth"},kevlar:{colour:13153370,family:"cloth"},leather:{colour:5910556,family:"leather"},foam:{colour:7306652,family:"plastic"},plastic:{colour:10132126,family:"plastic"},rubber:{colour:2763308,family:"plastic"},vinyl:{colour:3816e3,family:"plastic"},plexiglas:{colour:14215408,family:"plastic"},metal:{colour:9411238,family:"metal"},steel:{colour:9411238,family:"metal"},durasteel:{colour:9081500,family:"metal"},Fe:{colour:7237234,family:"metal"},Al:{colour:12106946,family:"metal"},Ti:{colour:10133670,family:"metal"},Cu:{colour:12088115,family:"metal"},brass:{colour:13215304,family:"metal"},bronze:{colour:11039802,family:"metal"},Au:{colour:13938487,family:"metal"},Ag:{colour:13158604,family:"metal"},stone:{colour:9210501,family:"stone"},granite:{colour:7302250,family:"stone"},limestone:{colour:13616816,family:"stone"},concrete:{colour:10131603,family:"stone"},ceramic:{colour:15262940,family:"ceramic"},clay:{colour:10771002,family:"ceramic"},brick:{colour:10242610,family:"ceramic"},plaster:{colour:15131094,family:"ceramic"},bone:{colour:14932681,family:"flesh"},H2O:{colour:4882344,family:"liquid"},dirt:{colour:6046768,family:"earth"},sand:{colour:13810058,family:"earth"}},Yx=12104358,Kh={metal:9411238,glass:13624298,wood:9132587,leather:5910556,cloth:7306652,stone:9210501,ceramic:15262940,plastic:10132126,flesh:13208442,plant:7049018,earth:6046768,liquid:4882344,ice:14478580,"energy field":6737151,fungal_ingredient:12101258,grain_meal:14207136},qx={roughness:.8,metalness:.05},$h={metal:{roughness:.25,metalness:1},glass:{roughness:.02,metalness:0,transmission:1,ior:1.5},ceramic:{roughness:.35,metalness:0,clearcoat:1,clearcoatRoughness:.08},wood:{roughness:.6,metalness:0,clearcoat:.5,clearcoatRoughness:.3},leather:{roughness:.55,metalness:0,sheen:.6},cloth:{roughness:.95,metalness:0,sheen:1},stone:{roughness:.88,metalness:0},earth:{roughness:1,metalness:0},plastic:{roughness:.32,metalness:0},flesh:{roughness:.6,metalness:0},plant:{roughness:.7,metalness:0},liquid:{roughness:.03,metalness:0,transmission:.9,ior:1.33},ice:{roughness:.12,metalness:0,transmission:.85,ior:1.31},"energy field":{roughness:.2,metalness:0,opacity:.45},fungal_ingredient:{roughness:.8,metalness:0},grain_meal:{roughness:.95,metalness:0}},Zx={matte:{roughness:.9,metalness:0},satin:{roughness:.5,metalness:0},gloss:{roughness:.15,metalness:0,clearcoat:1,clearcoatRoughness:.05},metal:{roughness:.3,metalness:1},glass:{roughness:.02,metalness:0,transmission:1,ior:1.5}};function Kx(n){return n!==void 0&&Object.hasOwn($h,n)?$h[n]:qx}const nc=n=>n!==void 0&&Object.hasOwn(gl,n)?gl[n]:void 0,$x=4906624,Jx=6004991,_l=16486972,Qx=3421247,jx=14275786,t3=13157563,e3=3811866,n3=1052692,Is=.08,i3=.3,Jh=1.6,Ti=50,ic=70;function ho(n){var t;return((t=nc(pu(n)))==null?void 0:t.colour)??Yx}function uo(n){var t;return(t=nc(pu(n)))==null?void 0:t.family}function wf(n,t,e){var a;const i=qf(n),s=du(n.colour),r=(i==null?void 0:i.family)??t;return{colour:s?Sl(s):i?((a=nc(i.species))==null?void 0:a.colour)??(Object.hasOwn(Kh,i.family)?Kh[i.family]:e):e,family:r}}const s3=n=>`#${n.toString(16).padStart(6,"0")}`;function r3(n,t){const e=n.userData.headBox;if(e&&e.chin===t)return e.box;const i=new _n,s=n.getAttribute("position"),r=new b;for(let o=0;o<s.count;o++)r.fromBufferAttribute(s,o),r.z>=t&&i.expandByPoint(r);return i.isEmpty()&&s.count>0&&i.setFromBufferAttribute(s),n.userData.headBox={chin:t,box:i},i}const Js=n=>[0,1,2,3,4,5,6,7].map(t=>new b(t&1?n.max.x:n.min.x,t&2?n.max.y:n.min.y,t&4?n.max.z:n.min.z)),o3=.35;class a3{constructor(t){pi(this,"materials",new Map);this.figures=t}material(t,e={}){const i=e.surface??Kx(e.family),s=e.opacity??i.opacity,r=e.glow,o=`${t}:${s??1}:${e.family??""}:${JSON.stringify(e.surface??null)}:${r?`${r.colour}:${r.luminance}:${r.emitter}`:""}:${e.doubleSided?2:1}`;let a=this.materials.get(o);if(!a){const c={color:t,roughness:i.roughness,metalness:i.metalness,transparent:s!==void 0,opacity:s??1,emissive:r?new ee().setRGB(...r.colour,ps):0,emissiveIntensity:r?r.luminance:1,depthWrite:s===void 0};a=i.clearcoat||i.sheen||i.transmission?new j0({...c,clearcoat:i.clearcoat??0,clearcoatRoughness:i.clearcoatRoughness??0,sheen:i.sheen??0,sheenRoughness:.8,sheenColor:new ee(t).lerp(new ee(16777215),.3),transmission:i.transmission??0,ior:i.ior??1.5,thickness:i.transmission?.01:0}):new Hs(c),r!=null&&r.emitter&&(a.userData.emitter=!0),(e.doubleSided||(i.opacity!==void 0||i.transmission)&&e.opacity===void 0)&&(a.side=Dn,a.polygonOffset=!0,a.polygonOffsetFactor=-1,a.polygonOffsetUnits=-1),a.userData.castsShadow=s===void 0&&!i.transmission,this.materials.set(o,a)}return a}box(t,e,i){const s=(o,a)=>Math.max(.01,a-o),r=new De(new fi(s(t.x0,t.x1),s(t.y0,t.y1),s(t.z0,t.z1)),e);return r.position.set((t.x0+t.x1)/2,(t.y0+t.y1)/2,(t.z0+t.z1)/2),r.userData.part=i,r}sphere(t,e,i,s){const r=new De(new On(Math.max(.01,e),24,16),i);return r.position.set(t[0],t[1],t[2]),r.userData.part=s,r}figureMaterial(t=!1){const e=t?"figure-crystal":"figure";let i=this.materials.get(e);return i||(i=t?new Hs({color:16777215,vertexColors:!0,roughness:o3,metalness:0,flatShading:!0}):new Hs({color:16777215,vertexColors:!0,roughness:.8,metalness:.05}),this.materials.set(e,i)),i}person(t,e,i,s,r,o,a,c){const l=a!=null&&a.posture?{...typeof t=="object"&&t!==null&&!Array.isArray(t)?t:{},posture:a.posture}:t,h=a?{width:a.dimensions_m[0],depth:a.dimensions_m[1]}:c,d=dc(l,{height:(a==null?void 0:a.figure_height_m)??(a==null?void 0:a.dimensions_m[2])??r-s,base:s3(o),footprint:h}),f=d.plan.kind==="humanoid"&&d.plan.covering==="crystal",u=ux(d,e,i,s,void 0,this.figureMaterial(f),this.figures);if(a){const v=fo(a);u.quaternion.premultiply(v);const A=new b(0,0,-a.dimensions_m[2]/2).applyQuaternion(v);u.position.fromArray(a.centre_m).add(A)}const p=this.wear(u,d,l);u.updateMatrixWorld(!0);const _=d.top-d.headHeight*1.05,m=mf(u.geometry,_),g=v=>v.clone().applyMatrix4(u.matrixWorld),x=r3(u.geometry,_).clone(),S=[];for(const v of p){const A=new _n().setFromBufferAttribute(v.geometry.getAttribute("position")).applyMatrix4(v.matrix);A.max.z<_||(x.union(A),S.push(...Js(A).filter(T=>T.z>=_)))}return{mesh:u,label:[...m,...S].map(g),head:Js(x).map(g),animal:d.plan.kind==="animal"}}wear(t,e,i){const s=I2(e);if(!s)return[];const r=[];Xf(i).forEach((o,a)=>{const c=1+l3*a,l=new Map;for(const h of o.parts){const d=s[h.frame],f=N2({...d,size:d.size.clone().multiply(new b(c,c,1))}),u=this.wornPart(t,h,f,o.colour,`worn ${o.name}`);l.set(h.frame,[...l.get(h.frame)??[],u]),r.push(u)}for(const[h,d]of l)p3(d,s[h],u3.has(h))});for(const o of g3(i)){const a=s[o.hand==="main"?"right_hand":"left_hand"],c=o.form_parts.map(l=>this.wornPart(t,l,new Kt,Yf,`held ${o.name}`));m3(c,o,a,e.posture==="reclining"),r.push(...c)}return r}wornPart(t,e,i,s,r){const o=wf(e,void 0,Sl(s)),a=new De(Sf(e),this.material(o.colour,{family:o.family}));return a.userData.part=r,a.matrixAutoUpdate=!1,co(a,e),a.matrix.premultiply(i),t.add(a),a}stand(t){const e=dc({build:"average"},{height:c3}),i=new Un;i.rotation.z=Math.PI,i.userData.part="stand";const s=this.material(h3);for(const r of cx(e)){const o=new De(r.geometry,s);o.userData.part="stand",i.add(o)}return this.wear(i,e,t),i}}const l3=.03,c3=1.75,h3=11901554,u3=new Set(Qf.filter(n=>/_(upper_arm|forearm|hand|thigh|shin|foot)$/.test(n))),f3=.02,d3=Math.PI/4;function as(n,t=1){const e=new b;let i=Number.POSITIVE_INFINITY;for(const s of n){const r=s.geometry.getAttribute("position");for(let o=0;o<r.count;o++)i=Math.min(i,t*e.fromBufferAttribute(r,o).applyMatrix4(s.matrix).z)}return t*i}function p3(n,t,e){if(as(n)>=-1e-9)return;const i=n.map(a=>a.matrix.clone()),s=a=>{n.forEach((c,l)=>{c.matrix.multiplyMatrices(a,i[l])})};if(e){const a=new Kt().makeTranslation(t.origin.x,t.origin.y,t.origin.z),c=new Kt().makeTranslation(-t.origin.x,-t.origin.y,-t.origin.z);for(let l=2;l<=180;l+=2)for(const h of[1,-1])if(s(a.clone().multiply(new Kt().makeRotationAxis(t.z,h*l*Math.PI/180)).multiply(c)),as(n)>=-1e-9)return;s(new Kt)}const r=as(n,-1),o=as(n);if(r<=0){s(new Kt().makeScale(1,1,0).setPosition(0,0,.001));return}s(new Kt().makeTranslation(0,0,r).multiply(new Kt().makeScale(1,1,r/(r-o))).multiply(new Kt().makeTranslation(0,0,-r)))}function m3(n,t,e,i){const s=n.map(_=>_.matrix.clone()),r=new b(...t.grip.center),o=new b(...t.grip.axis).normalize();let a=0,c=0;const l=new b;n.forEach((_,m)=>{const g=_.geometry.getAttribute("position");for(let x=0;x<g.count;x++){const S=l.fromBufferAttribute(g,x).applyMatrix4(s[m]).sub(r).dot(o);a=Math.max(a,S),c=Math.max(c,-S)}}),c>a&&o.negate();const[h]=[new b(1,0,0),new b(0,1,0),new b(0,0,1)].map((_,m)=>({side:_,size:t.size[m]})).filter(({side:_})=>Math.abs(_.dot(o))<.9).sort((_,m)=>_.size-m.size),d=h.side.clone().addScaledVector(o,-h.side.dot(o)).normalize(),f=e.origin.clone().addScaledVector(e.z,e.size.z/2),u=(_,m)=>{const g=new Ne().setFromUnitVectors(o,_),x=d.clone().applyQuaternion(g),S=m.clone().addScaledVector(_,-m.dot(_)).normalize(),v=Math.atan2(x.clone().cross(S).dot(_),x.dot(S));return new Ne().setFromAxisAngle(_,v).multiply(g)},p=(_,m)=>{const g=new Kt().compose(_,m,new b(1,1,1)).multiply(new Kt().makeTranslation(-r.x,-r.y,-r.z));n.forEach((x,S)=>{x.matrix.multiplyMatrices(g,s[S])})};if(i){const _=u(new b(0,1,0),new b(0,0,1)),m=f.clone().setX(f.x+Math.sign(f.x)*e.size.x);p(m,_),m.z-=as(n)-.001,p(m,_);return}for(let _=d3;;_=Math.max(0,_-Math.PI/180))if(p(f,u(new b(0,Math.cos(_),-Math.sin(_)),new b(1,0,0))),_===0||as(n)>=f3)return}function g3(n){const t=typeof n=="object"&&n!==null?n.held:void 0;return Array.isArray(t)?t:[]}function fo(n){const[t,e,i,s]=n.body_quaternion;return new Ne(e,i,s,t).normalize()}const sc=n=>[(n.x0+n.x1)/2,(n.y0+n.y1)/2];function po(n){const t=Kf(n);if(!(!(t!=null&&t.on)||t.lumens<=0))return{colour:bi(t.cct),luminance:$f(t),emitter:!0}}function Qh(n,t,e){var f,u;const{thing:i,bounds:s}=t,r=ho(i),o=uo(i),a=po(i),c=n.material(r,{family:o,glow:a}),l=s.x1-s.x0,h=s.y1-s.y0,d=s.z1-s.z0;switch(pa(i)){case"table":{const p=Math.min(.05,d*.15),_=Math.min(.06,Math.min(l,h)/5),m=Math.min(l*.08,.05),g=Math.min(h*.08,.05),x=[[s.x0+m,s.y0+g],[s.x1-m-_,s.y0+g],[s.x0+m,s.y1-g-_],[s.x1-m-_,s.y1-g-_]].map(([S,v])=>n.box({x0:S,x1:S+_,y0:v,y1:v+_,z0:s.z0,z1:s.z1-p},c,"leg"));return[n.box({...s,z0:s.z1-p},c,"top"),...x]}case"seat":{const p=n.box({...s,z1:s.z0+d*.45},c,"seat"),_=(f=i.front)==null?void 0:f.axis;if(!_||Math.hypot(_[0],_[1])<1e-6)return[p];const m=Math.hypot(_[0],_[1]),g=_[0]/m,x=_[1]/m,S=Math.min(l,h)*.22,v=(Math.abs(g)*l+Math.abs(x)*h)/2-S/2,A=Math.abs(x)*l+Math.abs(g)*h,T=n.box({x0:-A/2,x1:A/2,y0:-S/2,y1:S/2,z0:s.z0,z1:s.z1},c,"back");return T.rotation.z=Math.atan2(-g,x),T.position.x=(s.x0+s.x1)/2-g*v,T.position.y=(s.y0+s.y1)/2-x*v,[p,T]}case"shelf":{const p=[n.box(s,c,"body")],_=n.material(new ee(r).multiplyScalar(.55).getHex(),{family:o});for(let m=s.z0+.35;m<s.z1-.1;m+=.35)p.push(n.box({x0:s.x0-.008,x1:s.x1+.008,y0:s.y0-.008,y1:s.y1+.008,z0:m,z1:m+.02},_,"shelf"));return p}case"picture":{const p=l<=h,_=p?-.006:l*.12,m=p?h*.12:-.006,g=d*.12;return[n.box(s,n.material(e3,{family:"wood"}),"frame"),n.box({x0:s.x0+_,x1:s.x1-_,y0:s.y0+m,y1:s.y1-m,z0:s.z0+g,z1:s.z1-g},c,"picture")]}case"screen":return[n.box(s,n.material(n3,{glow:a??(((u=i.state)==null?void 0:u.mode)==="running"?{colour:x3,luminance:e,emitter:!1}:void 0)}),"screen")];case"door":{const p=l>=h,[_,m]=sc(s),g=Math.min(s.z0+.95,s.z1-.05),x=p?[s.x0+l*.85,m+(m>0?-1:1)*(h/2+.03),g]:[_+(_>0?-1:1)*(l/2+.03),s.y0+h*.85,g];return[n.box(s,c,"leaf"),n.sphere(x,.03,n.material(gl.brass.colour,{family:"metal"}),"knob")]}case"flat":return[n.box({...s,z1:s.z0+Math.min(d,.05)},c,"block")];case"box":return Tf(n,t)}}function Tf(n,t){const e=n.material(ho(t.thing),{family:uo(t.thing),glow:po(t.thing)});return t.footprints.map(i=>i.type==="circle"?n.sphere([i.cx,i.cy,(i.bounds.z0+i.bounds.z1)/2],i.r,e,"sphere"):n.box(i.bounds,e,"box"))}function _3(n,t,e,i){var S;const[s,r,o]=t.size,a=Is,c=Math.min(2.05,o*.85),l=e==="north"||e==="south",[h,d]=l?[-s/2-a,s/2+a]:[-r/2,r/2],f=(v,A,T,M)=>e==="north"?{x0:v,x1:A,y0:r/2,y1:r/2+a,z0:T,z1:M}:e==="south"?{x0:v,x1:A,y0:-r/2-a,y1:-r/2,z0:T,z1:M}:e==="east"?{x0:s/2,x1:s/2+a,y0:v,y1:A,z0:T,z1:M}:{x0:-s/2-a,x1:-s/2,y0:v,y1:A,z0:T,z1:M},u=new Un;u.name=`${e} wall`,u.userData.wall=e,u.userData.finish=(S=Jr(t,"wall"))==null?void 0:S.name;const p=xl(n,t,"wall",jx),_=n.material(_l,{opacity:.55}),m=n.material(_l),g=t.exits.filter(v=>fu(v,t.size)===e).map(v=>{const A=l?v.at[0]:v.at[1];return{exit:v,a:Math.max(h,A-v.width/2),b:Math.min(d,A+v.width/2)}}).sort((v,A)=>v.a-A.a);let x=h;for(const{exit:v,a:A,b:T}of g){A>x&&u.add(n.box(f(x,A,0,o),p,"wall")),o>c&&u.add(n.box(f(A,T,c,o),p,"lintel"));const M=n.box(f(A,T,0,c),_,"doorway");M.userData.exit=v.name,u.add(M),i.push(M);const E=f(A,T,0,.012),D=.15;e==="north"&&(E.y0-=D),e==="south"&&(E.y1+=D),e==="east"&&(E.x0-=D),e==="west"&&(E.x1+=D);const C=n.box(E,m,"threshold");C.userData.exit=v.name,u.add(C),i.push(C),x=Math.max(x,T)}return d>x&&u.add(n.box(f(x,d,0,o),p,"wall")),u}function xl(n,t,e,i){const s=Jr(t,e);return n.material(s!=null&&s.colour?Sl(s.colour):i,s!=null&&s.response?{surface:Zx[s.response]}:{})}const x3=(()=>{const n=new ee(659488),t=xf([n.r,n.g,n.b]);return[n.r/t,n.g/t,n.b/t]})();function v3({layout:n,placed:t,youId:e,figures:i}){var C,I,F,G,U;const s=new a3(i),[r,o]=n.size,a=new Un,c=[],l=Ux(n,t);for(const N of l.objects)a.add(N);const h=Gf(l.light),d=2**(Vf(Wf(((C=l.light)==null?void 0:C.lux)??hu))-3),f=s.box({x0:-r/2,x1:r/2,y0:-o/2,y1:o/2,z0:-.02,z1:0},xl(s,n,"floor",Qx),"floor");f.userData.finish=(I=Jr(n,"floor"))==null?void 0:I.name,a.add(f);const u=s.box({x0:-r/2-Is,x1:r/2+Is,y0:-o/2-Is,y1:o/2+Is,z0:n.size[2],z1:n.size[2]+.02},xl(s,n,"ceiling",t3),"ceiling");u.userData.finish=(F=Jr(n,"ceiling"))==null?void 0:F.name,a.add(u);const p=jf(r),_=[];for(let N=Math.ceil(-r/2/p)*p;N<r/2;N+=p)N>-r/2&&_.push(N,-o/2,.002,N,o/2,.002);for(let N=Math.ceil(-o/2/p)*p;N<o/2;N+=p)N>-o/2&&_.push(-r/2,N,.002,r/2,N,.002);const m=new Ce;m.setAttribute("position",new ae(_,3));const g=new er(m,new _o({color:10066346,transparent:!0,opacity:.18}));g.userData.part="grid",a.add(g);const x={};for(const N of["north","south","east","west"])x[N]=_3(s,n,N,c),a.add(x[N]);for(const N of n.exits){if(fu(N,n.size))continue;const H=Math.max(N.width,.4)/2,[k,it,P]=N.at,B=s.box({x0:k-H,x1:k+H,y0:it-H,y1:it+H,z0:P,z1:P+.02},s.material(_l,{opacity:.6}),"hatch");B.userData.exit=N.name,a.add(B),c.push(B)}const S=new Map,v=new Map,A=new Map;for(const N of t){const H=new Un;H.name=N.thing.id,H.userData.thingId=N.thing.id;const[k,it]=sc(N.bounds);if(ks(N.thing)){H.userData.form="person";const P=N.thing.id===e?Jx:$x,{mesh:B,label:V,head:st,animal:gt}=s.person(N.thing.appearance,k,it,N.bounds.z0,N.bounds.z1,P,rs(N.thing.pose)?N.thing.pose:void 0,{width:N.bounds.x1-N.bounds.x0,depth:N.bounds.y1-N.bounds.y0});H.add(B),H.userData.animal=gt,v.set(N.thing.id,V),A.set(N.thing.id,st)}else{H.userData.form=pa(N.thing);const P=N.thing.pose;if(N.thing.stand){H.userData.form="stand";const B=s.stand(N.thing.stand);H.add(B),rs(P)?(B.position.z=-P.dimensions_m[2]/2,H.quaternion.copy(fo(P)),H.position.fromArray(P.centre_m)):B.position.set(k,it,N.bounds.z0),H.updateMatrixWorld(!0);const V=new _n().setFromObject(H);v.set(N.thing.id,[new b(k,it,Math.max(N.bounds.z1,V.max.z))]),a.add(H),S.set(N.thing.id,H);continue}if(rs(P)&&(P.box||(G=N.thing.form_parts)!=null&&G.length)){const[B,V,st]=P.dimensions_m,gt={...N,bounds:{x0:-B/2,x1:B/2,y0:-V/2,y1:V/2,z0:-st/2,z1:st/2}};if((U=N.thing.form_parts)!=null&&U.length){const X=ho(N.thing);for(const nt of N.thing.form_parts){const{role:lt,fitting:Dt}=nt,St=wf(nt,uo(N.thing),X),Gt=Dt&&!du(nt.colour)?new ee(St.colour).multiplyScalar(.78).getHex():St.colour,Ht=Sf(nt),It=s.material(Gt,{family:St.family,doubleSided:Ht.userData.open===!0,glow:po(N.thing)}),Xt=new De(Ht,It);Xt.userData.part=(Dt==null?void 0:Dt.name)??lt??"form",Xt.matrixAutoUpdate=!1,co(Xt,nt);const Qt=lt??(Dt==null?void 0:Dt.lifetime);nt.joint&&Qt&&(Xt.userData.joint={key:JSON.stringify([N.thing.id,Qt]),part:nt}),Dt&&(Xt.userData.fitting=Dt.lifetime),lt&&N.thing.lifetime&&(Xt.userData.inspect=[N.thing.id,N.thing.lifetime,lt]),H.add(Xt)}}else if(pa(N.thing)==="box")H.add(s.box(gt.bounds,s.material(ho(N.thing),{family:uo(N.thing),glow:po(N.thing)}),"box"));else for(const X of Qh(s,gt,d))H.add(X);H.quaternion.copy(fo(P)),H.position.fromArray(P.centre_m)}else if(rs(P))for(const B of Tf(s,N))H.add(B);else for(const B of Qh(s,N,d))H.add(B);v.set(N.thing.id,[new b(k,it,N.bounds.z1)])}a.add(H),S.set(N.thing.id,H)}i==null||i.sweep();const T=new Map,M=new Un;M.name="tiny figure markers";const E=new Yl(y3,1,40);for(const[N,H]of S){if(H.userData.form!=="person")continue;const k=new De(E,new tr({color:E3,transparent:!0,opacity:0,depthWrite:!1}));k.name=`marker ${N}`,k.visible=!1,M.add(k),T.set(N,k)}a.add(M),f.receiveShadow=!0;for(const N of[u,...Object.values(x)])N.traverse(H=>{H.receiveShadow=!0});const D=new Set(uu(t).filter(N=>N.light.on).map(N=>N.thingId));for(const[N,H]of S)H.traverse(k=>{k instanceof De&&(k.receiveShadow=!0,k.castShadow=!D.has(N)&&k.material.userData.castsShadow!==!1)});return a.updateMatrixWorld(!0),{root:a,walls:x,ceiling:u,exits:c,things:S,labelPoints:v,heads:A,markers:T,lights:l,exposure:h}}function Af(n,t){n.traverse(e=>{if(!(e instanceof De||e instanceof er))return;const i=e.material;if(!(i instanceof tr||i instanceof _o))return;const s=i.userData.overlayColour??i.color.clone();i.userData.overlayColour=s,i.color.copy(s).multiplyScalar(1/t)})}const jh=16,M3=10,S3=11,y3=.86,E3=15263981;function b3(n){return Math.min(1,Math.max(0,(jh-n)/(jh-M3)))}function w3(n,t,e,i,s){const r=new _n,o=new b;for(const[a,c]of n.markers){const l=n.things.get(a);if(c.visible=!1,s!=="dollhouse"||!(l!=null&&l.visible)||(r.setFromObject(l),r.isEmpty()))continue;const h=rc(Js(r),t,e,i);if(!h)continue;const d=b3(h.y1-h.y0);if(d===0)continue;r.getCenter(o);const f=2*t.position.distanceTo(o)*Math.tan(t.fov/2*Math.PI/180)/i,u=Math.hypot(r.max.x-r.min.x,r.max.y-r.min.y)/2;c.scale.setScalar(Math.max(S3*f,u*1.3)),c.position.set(o.x,o.y,r.min.z+.003),c.material.opacity=d,c.visible=!0}}function T3(n,t,e){var s,r;if(t.length!==e.length)return!1;const i=[];for(let o=0;o<t.length;o++){const a=t[o],c=e[o];if(a.thing===c.thing)continue;const l=a.thing.pose,h=c.thing.pose;if(a.thing.id!==c.thing.id||!n.things.has(c.thing.id)||!rs(l)||!rs(h)||!h.box&&!ks(c.thing)||l.box!==h.box||l.figure_height_m!==h.figure_height_m||l.posture!==h.posture||l.dimensions_m.some((f,u)=>f!==h.dimensions_m[u])||a.thing.appearance!==c.thing.appearance||a.thing.stand!==c.thing.stand||a.thing.state!==c.thing.state||a.thing.form_parts!==c.thing.form_parts||a.thing.light!==c.thing.light||a.thing.material!==c.thing.material||a.thing.classes!==c.thing.classes||JSON.stringify((s=a.thing.front)==null?void 0:s.axis)!==JSON.stringify((r=c.thing.front)==null?void 0:r.axis))return!1;const d=f=>new Kt().compose(new b(...f.centre_m),fo(f),new b(1,1,1));i.push({old:a,next:c,delta:d(h).multiply(d(l).invert())})}for(const{next:o,delta:a}of i){const c=n.things.get(o.thing.id);if(!c)return!1;if(c.applyMatrix4(a),Ox(n.root,o.thing.id,a),ks(o.thing)){for(const l of n.heads.get(o.thing.id)??[])l.applyMatrix4(a);for(const l of n.labelPoints.get(o.thing.id)??[])l.applyMatrix4(a)}else{const[l,h]=sc(o.bounds);n.labelPoints.set(o.thing.id,[new b(l,h,o.bounds.z1)])}}return n.root.updateMatrixWorld(!0),!0}function rc(n,t,e,i){const s=new b,r={x0:Number.POSITIVE_INFINITY,x1:Number.NEGATIVE_INFINITY,y0:Number.POSITIVE_INFINITY,y1:Number.NEGATIVE_INFINITY};for(const o of n){if(s.copy(o).project(t),s.z<-1||s.z>1)return;const a=(s.x+1)/2*e,c=(1-s.y)/2*i;r.x0=Math.min(r.x0,a),r.x1=Math.max(r.x1,a),r.y0=Math.min(r.y0,c),r.y1=Math.max(r.y1,c)}return r}function A3(n,t,e,i){const s=new b().copy(n[0]).project(t);if(s.z<-1||s.z>1)return;const r=s.x;let o=n.length===1?s.y:Number.NEGATIVE_INFINITY;for(let a=1;a<n.length;a++)s.copy(n[a]).project(t),s.z>=-1&&s.z<=1&&(o=Math.max(o,s.y));return{x:(r+1)/2*e,top:(1-o)/2*i}}function R3(n,t,e,i){const[s,r,o]=t.size,a={north:e.y>r/2,south:e.y<-r/2,east:e.x>s/2,west:e.x<-s/2},c=Math.min(1,i3/o);for(const l of["north","south","east","west"])n.walls[l].scale.z=i==="dollhouse"&&a[l]?c:1;n.ceiling.visible=i==="eyes"}function xs(n,t=Ti){const[e,i,s]=n.size,r=[0,0,Math.min(s,2)*.25],a=Math.hypot(e,i)/2/Math.sin(t/2*Math.PI/180)*1.05,c=new b(.45,-1,1.05).normalize().multiplyScalar(a);return{position:[r[0]+c.x,r[1]+c.y,r[2]+c.z],target:r}}const Ns=.87,C3=10;function tu(n,t=Ti){const e=xs(n,t),i=Math.hypot(...e.position.map((s,r)=>s-e.target[r]));return Math.max(60,i*1.5)}function P3(n,t,e){const i=new b().subVectors(e,t);n.position.add(i),t.add(i)}function Rf(n,t){return n?new b((n.x0+n.x1)/2,(n.y0+n.y1)/2,n.z0+(n.z1-n.z0)*.9):new b(...xs(t).target)}function Cf(n,t,e,i=Ti){const s=t.bounds,r=n.things.get(t.thing.id);if(!(r!=null&&r.userData.animal))return{point:Rf(s,e),frame:0,box:Js(new _n(new b(s.x0,s.y0,s.z0),new b(s.x1,s.y1,s.z1)))};const o=new _n().setFromObject(r),a=o.getBoundingSphere(new Qs).radius,c=Math.max(a/Math.sin(i/2*Math.PI/180)*1.1,a+Pf*2);return{point:o.getCenter(new b),frame:c,box:Js(o)}}const L3=20,vl=1.5;function D3(n,t=Ti){const e=xs(n,t),i=Math.hypot(...e.position.map((s,r)=>s-e.target[r]));return Math.min(.95,(vl/i)**(1/L3))}function I3(n,t){return Math.min(1,Math.abs(n)/(t===1?3:t===2?1:100))}const eu=12,In=.5,Pf=.05,N3=.15;function U3(n,t,e=Ti){if(n>=In)return 1;const i=xs(t,e),s=Math.hypot(...i.position.map((r,o)=>r-i.target[o]));return s>vl?Math.max(1,Math.log(n/s)/Math.log(vl/s)):1}function O3(n){return Math.min(In,(n==null?void 0:n.nearest)??In)}const Lf=n=>{for(;n&&n.userData.thingId===void 0;)n=n.parent;return n==null?void 0:n.userData.thingId};function F3(n){return[...Array.from(n.things.values()).filter(t=>t.visible),...Object.values(n.walls),...n.exits.filter(t=>t.parent===n.root)]}function z3(n){if(!n)return;if(n.userData.fitting)return{kind:"fitting",lifetime:n.userData.fitting};if(n.userData.inspect){const[e,i,s]=n.userData.inspect;return{kind:"inspect",id:e,lifetime:i,role:s}}if(n.userData.exit)return{kind:"exit",name:n.userData.exit};const t=Lf(n);return t===void 0?void 0:{kind:"thing",id:t}}const nu=16777215,B3=.55,H3=.2;function k3(n,t){const e=new b(n.x1-n.x0,n.y1-n.y0,n.z1-n.z0),i=Math.min(.04,Math.max(.01,Math.max(e.x,e.y,e.z)*.02));e.addScalar(i*2);const s=new Un;s.name="selection";const r=new Un;r.position.set((n.x0+n.x1)/2,(n.y0+n.y1)/2,(n.z0+n.z1)/2);const o=e.clone().multiplyScalar(H3),a=[];for(const l of[-1,1])for(const h of[-1,1])for(const d of[-1,1]){const f=new b(l*e.x/2,h*e.y/2,d*e.z/2);a.push(f,f.clone().setX(f.x-l*o.x)),a.push(f,f.clone().setY(f.y-h*o.y)),a.push(f,f.clone().setZ(f.z-d*o.z))}const c=new er(new Ce().setFromPoints(a),new _o({color:nu,depthTest:!1,transparent:!0}));if(c.renderOrder=1e3,r.add(c),s.add(r),t&&t.userData.form!=="person"){const l=new tr({color:nu,transparent:!0,opacity:B3,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-4});t.updateWorldMatrix(!0,!0),t.traverse(h=>{if(!(h instanceof De)||!h.visible)return;const d=new De(h.geometry,l);d.name="selection glow",d.matrixAutoUpdate=!1,d.matrixWorldAutoUpdate=!1,d.matrixWorld.copy(h.matrixWorld),d.onBeforeRender=()=>d.matrixWorld.copy(h.matrixWorld),d.renderOrder=999,s.add(d)})}return r.updateMatrixWorld(!0),s}function Df(n){n.removeFromParent();const t=new Set;n.traverse(e=>{(e instanceof De||e instanceof er)&&(e.name!=="selection glow"&&t.add(e.geometry),t.add(e.material))});for(const e of t)e.dispose()}const iu=(n,t)=>Math.hypot(Math.max(t.x0-n.x,0,n.x-t.x1),Math.max(t.y0-n.y,0,n.y-t.y1));function G3(n,t,e,i,s,r,o=[]){var m,g;const a=new ro;a.setFromCamera(new ut(t.x/e.width*2-1,-(t.y/e.height)*2+1),n);const c=[...i.things.values()].filter(x=>x.visible),l=n.getWorldPosition(new b),h=n instanceof mn?n.fov:Ti,d=[];for(const x of s){if(((m=i.things.get(x.thing.id))==null?void 0:m.userData.form)!=="person"||!((g=i.things.get(x.thing.id))!=null&&g.visible))continue;const S=Cf(i,x,r,h),v=l.distanceTo(S.point),A=o.find(D=>D.id===x.thing.id),T=A?iu(t,A):Number.POSITIVE_INFINITY;if(T<=eu){d.push({person:x,focus:S,byLabel:!0,off:T,depth:v});continue}const M=rc(S.box,n,e.width,e.height);if(!M)continue;const E=iu(t,M);E<=eu&&d.push({person:x,focus:S,byLabel:!1,off:E,depth:v})}d.sort((x,S)=>Number(S.byLabel)-Number(x.byLabel)||x.off-S.off||x.depth-S.depth);for(const{person:x,focus:S,depth:v}of d){const A=S.point,M=new ro(l,A.clone().sub(l).normalize(),0,v).intersectObjects(c,!0)[0];if(M&&Lf(M.object)!==x.thing.id)continue;const E=S.frame>0?S.frame:Math.max(In,V3(A,l,x.bounds,N3));return{point:A,nearest:E,pace:U3(E,r,h)}}const f=a.intersectObjects([...c,...Object.values(i.walls)],!0)[0];if(f)return{point:f.point.clone(),nearest:In,pace:1};const u=a.ray.intersectPlane(new Gn(new b(0,0,1),0),new b),[p,_]=r.size;return u&&Math.abs(u.x)<=p/2&&Math.abs(u.y)<=_/2?{point:u,nearest:In,pace:1}:void 0}function V3(n,t,e,i){const s=new _n(new b(e.x0-i,e.y0-i,e.z0),new b(e.x1+i,e.y1+i,e.z1+i)),r=t.clone().sub(n).normalize(),o=n.clone().addScaledVector(r,1e3),a=new js(o,r.clone().negate()).intersectBox(s,new b);return a?n.distanceTo(a):0}class W3{constructor(){pi(this,"fingers",new Map);pi(this,"start",null)}down(t,e,i){this.fingers.set(t,{x:e,y:i}),this.start=this.fingers.size===2?this.midpoint():null}move(t,e,i){if(!this.fingers.has(t))return;const s=this.spacing();this.fingers.set(t,{x:e,y:i});const r=this.spacing();if(!(this.fingers.size!==2||!this.start||s===0||r===0||s===r))return{scale:s/r,at:this.start}}up(t){this.fingers.delete(t),this.start=null}get pinching(){return this.start!==null}spacing(){const[t,e]=[...this.fingers.values()];return t&&e?Math.hypot(t.x-e.x,t.y-e.y):0}midpoint(){const[t,e]=[...this.fingers.values()];return{x:(t.x+e.x)/2,y:(t.y+e.y)/2}}}function X3(n,t,e,i,s=0,r=1){const o=i**r;if(o<1){const a=n.distanceTo(e),c=a>s?Math.max(o,s/a):1;n.sub(e).multiplyScalar(c).add(e),t.sub(e).multiplyScalar(o*o).add(e)}else n.sub(t).multiplyScalar(o).add(t)}function Y3(n,t){if(t==="+"||t==="=")return Ml(n,1);if(t==="-"||t==="_")return Ml(n,-1);if(t==="0")return ic}function Ml(n,t){return Math.min(ic,Math.max(C3,n*Ns**t))}function q3(n,t,e,i){const s=t?[t[0],t[1],t[2]>.8?t[2]:Jh]:i?[(i.x0+i.x1)/2,(i.y0+i.y1)/2,Math.max(i.z1-.1,.8)]:[0,0,Math.min(Jh,n.size[2]*.8)],r=e?Math.hypot(e[0],e[1],e[2]):0,[o,a,c]=e&&r>1e-6?e.map(l=>l/r):[0,1,0];return{position:s,target:[s[0]+o,s[1]+a,s[2]+c]}}function su(n){const t=new Set;n.root.traverse(e=>{if(e instanceof De||e instanceof er){e.userData.keptGeometry||e.geometry.dispose();const i=e.material;for(const s of Array.isArray(i)?i:[i])t.add(s)}});for(const e of t)e.dispose()}function Z3(){const n=new s2({antialias:!0});return n.setPixelRatio(window.devicePixelRatio),n.setClearColor(0),n.outputColorSpace=Mn,n.toneMapping=go,n.shadowMap.enabled=!0,n.shadowMap.type=Os,n.shadowMap.autoUpdate=!1,{renderer:n,dispose:()=>n.dispose()}}const ru=[.25,.25],K3=4,$3=.01,ou=.3,au=new re().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),lu=n=>n.elements.map(t=>t.toFixed(7)).join(", ");function J3(n,t){return t/n/K3*Math.sqrt(Math.log(1/$3)/(2*Math.PI*Math.PI))}const Q3={name:"NightVisionShader",uniforms:{tDiffuse:{value:null},texel:{value:new ut(1,1)},sigma0:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform vec2 texel;
    uniform float sigma0;
    varying vec2 vUv;
    const vec3 LUM = vec3(0.212639, 0.7151687, 0.0721923);
    const vec3 SCOT = vec3(${vx.map(n=>n.toFixed(5)).join(", ")});
    const mat3 TO_XYZ = mat3(${lu(au)});
    const mat3 FROM_XYZ = mat3(${lu(au.clone().invert())});

    vec3 at(vec2 uv) { return min(texture2D(tDiffuse, uv).rgb, vec3(65504.0)); }
    float logLum(vec2 uv) { return log(max(dot(at(uv), LUM), 1e-6)) / log(10.0); }
    float rodSaturation(float y) {
      float l = log(max(y, 1e-12)) / log(10.0);
      float t = clamp((l + 2.0) / 2.6, 0.0, 1.0);
      return t * t * (3.0 - 2.0 * t);
    }

    void main() {
      vec3 c = at(vUv);
      float s = rodSaturation(dot(c, LUM));
      // Loss of detail: blur width falls with edge strength (gradient of log10 luminance, central differences).
      float gx = (logLum(vUv + vec2(texel.x, 0.0)) - logLum(vUv - vec2(texel.x, 0.0))) * 0.5;
      float gy = (logLum(vUv + vec2(0.0, texel.y)) - logLum(vUv - vec2(0.0, texel.y))) * 0.5;
      float g = length(vec2(gx, gy));
      float sigma = sigma0 * (1.0 - s) * max(0.0, (${ou.toFixed(3)} - g) / ${ou.toFixed(3)});
      if (sigma > 0.3) {
        vec3 sum = c;
        float weight = 1.0;
        for (int ring = 1; ring <= 2; ring++) {
          float r = sigma * float(ring);
          float w = exp(-0.5 * float(ring * ring));
          for (int k = 0; k < 8; k++) {
            float a = 6.2831853 * (float(k) + 0.5 * float(ring - 1)) / 8.0;
            sum += at(vUv + vec2(cos(a), sin(a)) * r * texel) * w;
            weight += w;
          }
        }
        c = sum / weight;
      }
      // Blue shift and rod luminance (p.6).
      vec3 xyz = TO_XYZ * c;
      float total = xyz.x + xyz.y + xyz.z;
      if (total > 0.0 && s < 1.0) {
        vec2 xy = vec2(xyz.x, xyz.y) / total;
        vec2 shifted = mix(vec2(${ru[0]}, ${ru[1]}), xy, s);
        float y = ${Mx.toFixed(4)} * (1.0 - s) * dot(c, SCOT) + s * xyz.y;
        float x = shifted.x * y / shifted.y;
        float z = (1.0 - shifted.x - shifted.y) * y / shifted.y;
        c = max(FROM_XYZ * vec3(x, y, z), vec3(0.0));
      }
      gl_FragColor = vec4(c, 1.0);
    }`},j3=3,tv=4;function ev(n,t){const e=`${n.className}
${n.textContent}`;let i=t.get(e);if(!i){const s=getComputedStyle(n),r=Number.parseFloat(s.fontSize),o=document.createElement("canvas").getContext("2d");if(!o||!(r>0))return{width:0,height:0};o.font=`${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;const a=Number.parseFloat(s.lineHeight);i={width:o.measureText(n.textContent??"").width,height:a>0?a:r*1.2},t.set(e,i)}return i}function nv(n,t,e){if(n.renderer.toneMappingExposure=t.exposure,n.nightVision=rd(cu(e)),n.nightVision&&!n.night){const c=n.renderer.getDrawingBufferSize(new ut),l=new bn(c.x,c.y,{type:wn,samples:4}),h=new b2(n.renderer,l);h.addPass(new T2(n.scene,n.camera));const d=new cf(Q3);h.addPass(d),h.addPass(new w2),h.setSize(n.renderer.domElement.clientWidth||c.x,n.renderer.domElement.clientHeight||c.y),n.night={composer:h,pass:d}}const i=Object.values(t.walls),s=i.map(c=>c.scale.z),r=t.ceiling.visible;for(const c of i)c.scale.z=1;t.ceiling.visible=!0,t.root.updateMatrixWorld(!0);const o=[...t.exits,...t.markers.values()];t.root.traverse(c=>{c.userData.part==="grid"&&o.push(c)}),n.selection&&o.push(n.selection);const a=n.environment;n.environment=Bx(n.renderer,n.scene,t.root,e.size,o),a==null||a.dispose(),i.forEach((c,l)=>{c.scale.z=s[l]}),t.ceiling.visible=r,t.root.updateMatrixWorld(!0)}function fa(n,t){var s;n.selection&&Df(n.selection),n.selection=null;for(const[r,o]of n.labelObjects)o.element.classList.toggle("rl3d-label-selected",r===t);const e=t===null?void 0:n.placed.find(r=>r.thing.id===t),i=e&&((s=n.room)==null?void 0:s.things.get(e.thing.id));!e||!(i!=null&&i.visible)||(n.selection=k3(e.bounds,i),n.room&&Af(n.selection,n.room.exposure),n.scene.add(n.selection))}function iv(){const n=document.createElement("canvas");return!!(n.getContext("webgl2")??n.getContext("webgl"))}function da(n,t){n.camera.position.set(...t.position),n.controls.target.set(...t.target),n.camera.lookAt(n.controls.target)}const av=({layout:n,placed:t,youId:e,label:i,mode:s,selectedId:r,onSelect:o,onExit:a,onFitting:c,onInspect:l})=>{var it;const h=Rn(null),d=Rn(null),f=Rn(s),u=Rn(a);u.current=a;const p=Rn(r);p.current=r;const[_]=td(iv),m=pc(P=>P.listenerPosition),g=pc(P=>P.listenerOrientation.forward),x=Rn([]);ed(()=>{const P=h.current;if(!P||!_)return;const{renderer:B,dispose:V}=Z3();B.domElement.setAttribute("aria-hidden","true"),P.appendChild(B.domElement);const st=new R2;st.domElement.className="room-layout-3d-labels",st.domElement.setAttribute("aria-hidden","true"),P.appendChild(st.domElement);const gt=new mn(Ti,4/3,Pf,200);gt.up.set(0,0,1);const X=new o2(gt,B.domElement);X.maxPolarAngle=Math.PI/2-.05,X.minDistance=In,X.touches.TWO=null;const nt=new a0,lt={renderer:B,labels:st,camera:gt,controls:X,scene:nt,room:null,stopJoints:()=>{},layout:null,placed:[],figures:new hx,environment:null,night:null,nightVision:!1,labelObjects:new Map,labelSizes:new Map,personLabels:[],selection:null,render:()=>{lt.room&&(R3(lt.room,S.current,gt.position,f.current),w3(lt.room,gt,P.clientWidth,P.clientHeight,f.current)),lt.nightVision&&lt.night?(lt.night.pass.uniforms.sigma0.value=J3(gt.fov,B.domElement.height),lt.night.pass.uniforms.texel.value.set(1/B.domElement.width,1/B.domElement.height),lt.night.composer.render()):B.render(nt,gt),v(lt),st.render(nt,gt)}};d.current=lt,X.addEventListener("change",lt.render);const Dt=()=>{var Xt;const Ht=P.clientWidth,It=P.clientHeight;Ht===0||It===0||(B.setSize(Ht,It,!1),(Xt=lt.night)==null||Xt.composer.setSize(Ht,It),B.domElement.style.width="100%",B.domElement.style.height="100%",st.setSize(Ht,It),gt.aspect=Ht/It,gt.updateProjectionMatrix(),lt.render())},St=typeof ResizeObserver>"u"?null:new ResizeObserver(Dt);St==null||St.observe(P),Dt();const Gt=Ht=>F.current(Ht);return P.addEventListener("wheel",Gt,{capture:!0,passive:!1}),()=>{var Ht,It;P.removeEventListener("wheel",Gt,{capture:!0}),St==null||St.disconnect(),X.removeEventListener("change",lt.render),X.dispose(),lt.stopJoints(),lt.selection&&Df(lt.selection),lt.room&&su(lt.room),lt.figures.dispose(),(Ht=lt.environment)==null||Ht.dispose(),(It=lt.night)==null||It.composer.dispose(),V(),B.domElement.remove(),st.domElement.remove(),d.current=null}},[_]);const S=Rn(n);S.current=n;function v(P){var Gt,Ht,It,Xt,Qt;const B=P.labels.domElement.clientWidth||P.renderer.domElement.clientWidth,V=P.labels.domElement.clientHeight||P.renderer.domElement.clientHeight,st=[],gt=new Map,X=new b;for(const{id:J,text:ft}of nd(x.current,p.current)){const dt=(Gt=P.room)==null?void 0:Gt.labelPoints.get(J),bt=P.labelObjects.get(J);if(!dt||!bt||(bt.visible=!1,!((Ht=bt.parent)!=null&&Ht.visible)))continue;const yt=A3(dt,P.camera,B,V);if(!yt)continue;bt.getWorldPosition(X).project(P.camera),gt.set(J,[(X.x+1)/2*B,(1-X.y)/2*V]);const $t=ev(bt.element,P.labelSizes);if($t.width===0)continue;const zt=J===p.current?tv*2:0,ue={width:$t.width+zt,height:$t.height+zt};st.push({id:J,text:ft,x:yt.x,top:yt.top,...ue})}const nt=[];for(const[J,ft]of((It=P.room)==null?void 0:It.heads)??[]){if(!((Qt=(Xt=P.room)==null?void 0:Xt.things.get(J))!=null&&Qt.visible))continue;const dt=rc(ft,P.camera,B,V);dt&&nt.push({id:J,...dt})}const lt=4,Dt=id(st,j3,{x0:lt,x1:B-lt,y0:lt,y1:V-lt},nt),St=new Set(x.current.filter(J=>J.person).map(J=>J.id));P.personLabels=[];for(const J of Dt){const ft=P.labelObjects.get(J.id),dt=gt.get(J.id);if(!ft||!dt)continue;ft.visible=!0,ft.element.style.translate=`${J.x-dt[0]}px ${J.y-dt[1]}px`;const bt=st.find(yt=>yt.id===J.id);bt&&St.has(J.id)&&P.personLabels.push({id:J.id,x0:J.x-bt.width/2,x1:J.x+bt.width/2,y0:J.y-bt.height/2,y1:J.y+bt.height/2})}}cr(()=>{var Dt,St,Gt;const P=d.current;if(!P)return;if(s==="dollhouse"&&(P.controls.maxDistance=tu(n)),P.room&&((Dt=P.layout)==null?void 0:Dt.size)===n.size&&P.layout.exits===n.exits&&P.layout.finishes===n.finishes&&P.layout.light===n.light&&T3(P.room,P.placed,t)){P.layout=n,P.placed=t;for(const[It,Xt]of P.labelObjects){const Qt=(St=P.room.labelPoints.get(It))==null?void 0:St[0];Qt&&Xt.parent&&Xt.position.copy(Xt.parent.worldToLocal(Qt.clone()))}const Ht=P.room.things.get(e);Ht&&(Ht.visible=s!=="eyes"),fa(P,p.current),P.renderer.shadowMap.needsUpdate=!0,P.render();return}const B=P.room;B&&P.scene.remove(B.root);for(const Ht of P.labelObjects.values())Ht.removeFromParent();P.labelObjects.clear(),P.stopJoints();const V=B?Gx(B):new Map,st=v3({layout:n,placed:t,youId:e,figures:P.figures});P.room=st,P.layout=n,P.placed=t,P.scene.add(st.root),nv(P,st,n);const gt=st.things.get(e);gt&&(gt.visible=s!=="eyes");const X=sd(t,e),nt=[...X.filter(Ht=>ks(Ht.thing)).map(Ht=>({id:Ht.thing.id,text:bo(mc(Ht.thing,e)),person:!0})),...X.filter(Ht=>!ks(Ht.thing)).map(({thing:Ht})=>{var J;const It=((J=Ht.form_parts)==null?void 0:J.flatMap(({fitting:ft})=>ft!=null&&ft.opened?ft.contents:[]))??[],Xt=bo(mc(Ht,e)),Qt=It.length?`${Xt} · ${bo(It[0].name)}${It.length>1?` (+${It.length-1})`:""}`:Xt;return{id:Ht.id,text:Qt,person:!1}})];x.current=nt;for(const{id:Ht,text:It,person:Xt}of nt){const Qt=st.labelPoints.get(Ht),J=st.things.get(Ht);if(!Qt||!J)continue;const ft=document.createElement("div");ft.className=Ht===e?"rl3d-label rl3d-label-you":Xt?"rl3d-label rl3d-label-person":"rl3d-label",ft.textContent=It,ft.style.display="none",P.labels.domElement.appendChild(ft);const dt=(Gt=st.markers.get(Ht))==null?void 0:Gt.material,bt=dt?getComputedStyle(ft).color:"";dt&&bt&&dt.color.setStyle(bt);const yt=new A2(ft);J.updateWorldMatrix(!0,!1),yt.position.copy(J.worldToLocal(Qt[0].clone())),yt.visible=!1,J.add(yt),P.labelObjects.set(Ht,yt)}Af(st.root,st.exposure),fa(P,p.current);const lt=()=>{P.renderer.shadowMap.needsUpdate=!0,P.render()};P.stopJoints=Vx(st,V,lt,kx(typeof window.matchMedia=="function"?Ht=>window.matchMedia(Ht):void 0)),lt(),B&&su(B)},[n,t,e,s]),cr(()=>{const P=d.current;P&&(fa(P,r),P.render())},[r]);const A=(it=t.find(P=>P.thing.id===e))==null?void 0:it.bounds;cr(()=>{const P=d.current;f.current=s,P&&(P.controls.enabled=s==="dollhouse",P.camera.fov=s==="eyes"?ic:Ti,P.camera.updateProjectionMatrix(),C.current=null,s==="dollhouse"&&(P.controls.maxDistance=tu(n),da(P,xs(n)),P.controls.update(),P.render()))},[s,n.num]),cr(()=>{const P=d.current;if(!P||s!=="eyes")return;const B=m?gc(m):null,V=g?gc(g):null;da(P,q3(n,B,V,A)),P.render()},[s,n,m,g,A==null?void 0:A.x0,A==null?void 0:A.y0,A==null?void 0:A.z1]);const T=Rn(null),M=P=>{N(P),T.current=P.isPrimary&&P.button===0?{id:P.pointerId,x:P.clientX,y:P.clientY}:null},E=P=>{var lt;N(P);const B=T.current;T.current=null;const V=d.current;if(!(V!=null&&V.room)||!B||B.id!==P.pointerId||Math.hypot(P.clientX-B.x,P.clientY-B.y)>4)return;const st=V.renderer.domElement.getBoundingClientRect();if(st.width===0||st.height===0)return;const gt=new ut((P.clientX-st.left)/st.width*2-1,-((P.clientY-st.top)/st.height)*2+1),X=new ro;X.setFromCamera(gt,V.camera);const nt=z3((lt=X.intersectObjects(F3(V.room),!0)[0])==null?void 0:lt.object);(nt==null?void 0:nt.kind)==="fitting"?c(nt.lifetime):(nt==null?void 0:nt.kind)==="inspect"?l(nt.id,nt.lifetime,nt.role):(nt==null?void 0:nt.kind)==="exit"?u.current(nt.name):(nt==null?void 0:nt.kind)==="thing"&&o(nt.id)},D=P=>{const B=d.current,V=B?Y3(B.camera.fov,P):void 0;return!B||V===void 0?!1:(B.camera.fov=V,B.camera.updateProjectionMatrix(),B.render(),!0)},C=Rn(null),I=P=>{const B=d.current;if(!B)return;P.preventDefault(),P.stopPropagation();const V=P.deltaMode,st=P.deltaY;if(st===0)return;const gt=I3(st,V)*(st<0?1:-1);if(s==="eyes"){B.camera.fov=Ml(B.camera.fov,gt),B.camera.updateProjectionMatrix(),B.render();return}G(B,P.clientX,P.clientY,D3(n)**gt)},F=Rn(I);F.current=I;const G=(P,B,V,st)=>{var nt;const gt=C.current;if(!gt||Math.hypot(B-gt.x,V-gt.y)>4){const lt=P.renderer.domElement.getBoundingClientRect(),Dt=P.room?G3(P.camera,{x:B-lt.left,y:V-lt.top},lt,P.room,t,n,P.personLabels):void 0;C.current={x:B,y:V,pick:Dt}}const X=(nt=C.current)==null?void 0:nt.pick;X3(P.camera.position,P.controls.target,(X==null?void 0:X.point)??P.controls.target.clone(),st,(X==null?void 0:X.nearest)??In,X==null?void 0:X.pace),P.controls.minDistance=O3(X),P.controls.update(),P.render()},U=Rn(new W3),N=P=>{const B=d.current;if(!(!B||P.pointerType!=="touch"||s!=="dollhouse"))if(P.type==="pointerdown")U.current.down(P.pointerId,P.clientX,P.clientY);else if(P.type==="pointerup"||P.type==="pointercancel")U.current.up(P.pointerId);else{const V=U.current.move(P.pointerId,P.clientX,P.clientY);V&&G(B,V.at.x,V.at.y,V.scale)}},H=(P,B)=>{C.current=null;const V=t.find(gt=>gt.thing.id===e),st=V&&P.room?Cf(P.room,V,n):void 0;P3(P.camera,P.controls.target,st?st.point:Rf(A,n)),P.controls.minDistance=st&&st.frame>0?Math.min(In,st.frame):In,P.controls.dollyIn(B)},k=P=>{const B=d.current;if(!B||P.altKey||P.ctrlKey||P.metaKey)return;if(s==="eyes"){D(P.key)&&P.preventDefault();return}const V=Math.PI/18,gt={ArrowLeft:()=>B.controls.rotateLeft(-V),ArrowRight:()=>B.controls.rotateLeft(V),ArrowUp:()=>B.controls.rotateUp(V/2),ArrowDown:()=>B.controls.rotateUp(-V/2),"+":()=>H(B,Ns),"=":()=>H(B,Ns),"-":()=>H(B,1/Ns),_:()=>H(B,1/Ns),0:()=>{C.current=null,B.controls.minDistance=In,da(B,xs(n)),B.controls.update()}}[P.key];gt&&(P.preventDefault(),gt(),B.render())};return _?_c("div",{ref:h,className:"room-layout-3d",role:"img","aria-label":i,tabIndex:0,"data-mode":s,onPointerDown:M,onPointerUp:E,onPointerMove:N,onPointerCancel:P=>{T.current=null,N(P)},onKeyDown:k}):_c("p",{role:"status",children:"This browser cannot draw 3D (it offers no WebGL). The Plan view and the lists below show the room."})};export{av as default};
