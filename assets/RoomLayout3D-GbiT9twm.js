var eu=Object.defineProperty;var nu=(i,t,e)=>t in i?eu(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var Ni=(i,t,e)=>nu(i,typeof t!="symbol"?t+"":t,e);import{bn as Es,bo as In,bp as Tr,bq as iu,br as su,bs as cl,bt as ru,aw as bs,ai as Rs,an as kc,at as Po,bu as ou,bv as au,bw as lu,bx as cu,ax as hu,A as Ln,d as uu,aA as hl,_ as fu,by as du,h as kr,aj as pu,al as Vr,am as ul,bz as fl,u as dl}from"./index-C63SrhxM.js";/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Da="187",Qi={ROTATE:0,DOLLY:1,PAN:2},Ji={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},mu=0,pl=1,gu=2,gr=1,_u=2,xs=3,Ri=0,dn=1,Fn=2,ji=0,Ts=1,ml=2,gl=3,_l=4,xu=5,Ki=100,vu=101,Mu=102,Su=103,yu=104,Eu=200,bu=201,Tu=202,Au=203,Vc=204,Wc=205,wu=206,Ru=207,Cu=208,Pu=209,Lu=210,Du=211,Nu=212,Iu=213,Uu=214,Lo=0,Do=1,No=2,Cs=3,Io=4,Uo=5,Oo=6,Fo=7,Xc=0,Ou=1,Fu=2,ni=0,Yc=1,qc=2,Zc=3,Kc=4,Jc=5,$c=6,Qc=7,jc=300,is=301,Ps=302,Wr=303,Xr=304,Bo=1e3,ti=1001,zo=1002,tn=1003,Bu=1004,ks=1005,fn=1006,Yr=1007,mi=1008,gn=1009,th=1010,eh=1011,Ls=1012,Na=1013,Wn=1014,Bn=1015,Xn=1016,Ia=1017,Ua=1018,ss=1020,nh=35902,ih=35899,sh=1021,rh=1022,zn=1023,vi=1026,gi=1027,oh=1028,Oa=1029,Ci=1030,Fa=1031,Ba=1033,_r=33776,xr=33777,vr=33778,Mr=33779,Ho=35840,Go=35841,ko=35842,Vo=35843,Wo=36196,Xo=37492,Yo=37496,qo=37488,Zo=37489,Ar=37490,Ko=37491,Jo=37808,$o=37809,Qo=37810,jo=37811,ta=37812,ea=37813,na=37814,ia=37815,sa=37816,ra=37817,oa=37818,aa=37819,la=37820,ca=37821,ha=36492,ua=36494,fa=36495,da=36283,pa=36284,wr=36285,ma=36286,zu=3200,ga=0,Hu=1,pi="",vn="srgb",Rr="srgb-linear",Cr="linear",Ae="srgb",qr=7680,Gu=519,ku=512,Vu=513,Wu=514,ah=515,Xu=516,Yu=517,lh=518,ch=519,qu=35044,xl="300 es",Rn=2e3,Ds=2001;function Zu(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Pr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Ku(){const i=Pr("canvas");return i.style.display="block",i}const vl={};function Ml(...i){const t="THREE."+i.shift();console.log(t,...i)}function hh(i){const t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){const e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Jt(...i){i=hh(i);const t="THREE."+i.shift();{const e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Ee(...i){i=hh(i);const t="THREE."+i.shift();{const e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Sr(...i){const t=i.join(" ");t in vl||(vl[t]=!0,Jt(...i))}function Ju(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}const $u={[Lo]:Lo,[No]:Oo,[Io]:Io,[Cs]:Uo,[Do]:Do,[Oo]:No,[Fo]:Fo,[Uo]:Cs};class Si{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){const n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){const n=this._listeners;if(n===void 0)return;const s=n[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){const e=this._listeners;if(e===void 0)return;const n=e[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],yr=Math.PI/180,_a=180/Math.PI;function cs(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(sn[i&255]+sn[i>>8&255]+sn[i>>16&255]+sn[i>>24&255]+"-"+sn[t&255]+sn[t>>8&255]+"-"+sn[t>>16&15|64]+sn[t>>24&255]+"-"+sn[e&63|128]+sn[e>>8&255]+"-"+sn[e>>16&255]+sn[e>>24&255]+sn[n&255]+sn[n>>8&255]+sn[n>>16&255]+sn[n>>24&255]).toLowerCase()}function de(i,t,e){return Math.max(t,Math.min(e,i))}function Qu(i,t){return(i%t+t)%t}function Zr(i,t,e){return(1-e)*i+e*t}function ju(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function za(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function tf(i,t){if(t.constructor===Float32Array)return i;const e=za(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/e,-1)}function ef(i,t){if(t.constructor===Float32Array)return i;const e=za(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*e)}const nf={DEG2RAD:yr},sl=class sl{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(de(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(de(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};sl.prototype.isVector2=!0;let St=sl;class He{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let h=n[s+0],l=n[s+1],f=n[s+2],d=n[s+3],c=r[o+0],u=r[o+1],p=r[o+2],x=r[o+3];if(d!==x||h!==c||l!==u||f!==p){let g=h*c+l*u+f*p+d*x;g<0&&(c=-c,u=-u,p=-p,x=-x,g=-g);let m=1-a;if(g<.9995){const v=Math.acos(g),b=Math.sin(v);m=Math.sin(m*v)/b,a=Math.sin(a*v)/b,h=h*m+c*a,l=l*m+u*a,f=f*m+p*a,d=d*m+x*a}else{h=h*m+c*a,l=l*m+u*a,f=f*m+p*a,d=d*m+x*a;const v=1/Math.sqrt(h*h+l*l+f*f+d*d);h*=v,l*=v,f*=v,d*=v}}t[e]=h,t[e+1]=l,t[e+2]=f,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,r,o){const a=n[s],h=n[s+1],l=n[s+2],f=n[s+3],d=r[o],c=r[o+1],u=r[o+2],p=r[o+3];return t[e]=a*p+f*d+h*u-l*c,t[e+1]=h*p+f*c+l*d-a*u,t[e+2]=l*p+f*u+a*c-h*d,t[e+3]=f*p-a*d-h*c-l*u,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,h=Math.sin,l=a(n/2),f=a(s/2),d=a(r/2),c=h(n/2),u=h(s/2),p=h(r/2);switch(o){case"XYZ":this._x=c*f*d+l*u*p,this._y=l*u*d-c*f*p,this._z=l*f*p+c*u*d,this._w=l*f*d-c*u*p;break;case"YXZ":this._x=c*f*d+l*u*p,this._y=l*u*d-c*f*p,this._z=l*f*p-c*u*d,this._w=l*f*d+c*u*p;break;case"ZXY":this._x=c*f*d-l*u*p,this._y=l*u*d+c*f*p,this._z=l*f*p+c*u*d,this._w=l*f*d-c*u*p;break;case"ZYX":this._x=c*f*d-l*u*p,this._y=l*u*d+c*f*p,this._z=l*f*p-c*u*d,this._w=l*f*d+c*u*p;break;case"YZX":this._x=c*f*d+l*u*p,this._y=l*u*d+c*f*p,this._z=l*f*p-c*u*d,this._w=l*f*d-c*u*p;break;case"XZY":this._x=c*f*d-l*u*p,this._y=l*u*d-c*f*p,this._z=l*f*p+c*u*d,this._w=l*f*d+c*u*p;break;default:Jt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],h=e[9],l=e[2],f=e[6],d=e[10],c=n+a+d;if(c>0){const u=.5/Math.sqrt(c+1);this._w=.25/u,this._x=(f-h)*u,this._y=(r-l)*u,this._z=(o-s)*u}else if(n>a&&n>d){const u=2*Math.sqrt(1+n-a-d);this._w=(f-h)/u,this._x=.25*u,this._y=(s+o)/u,this._z=(r+l)/u}else if(a>d){const u=2*Math.sqrt(1+a-n-d);this._w=(r-l)/u,this._x=(s+o)/u,this._y=.25*u,this._z=(h+f)/u}else{const u=2*Math.sqrt(1+d-n-a);this._w=(o-s)/u,this._x=(r+l)/u,this._y=(h+f)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(de(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,h=e._y,l=e._z,f=e._w;return this._x=n*f+o*a+s*l-r*h,this._y=s*f+o*h+r*a-n*l,this._z=r*f+o*l+n*h-s*a,this._w=o*f-n*a-s*h-r*l,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let h=1-e;if(a<.9995){const l=Math.acos(a),f=Math.sin(l);h=Math.sin(h*l)/f,e=Math.sin(e*l)/f,this._x=this._x*h+n*e,this._y=this._y*h+s*e,this._z=this._z*h+r*e,this._w=this._w*h+o*e,this._onChangeCallback()}else this._x=this._x*h+n*e,this._y=this._y*h+s*e,this._z=this._z*h+r*e,this._w=this._w*h+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const rl=class rl{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Sl.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Sl.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,h=t.w,l=2*(o*s-a*n),f=2*(a*e-r*s),d=2*(r*n-o*e);return this.x=e+h*l+o*d-a*f,this.y=n+h*f+a*l-r*d,this.z=s+h*d+r*f-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this.z=de(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this.z=de(this.z,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(de(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,h=e.z;return this.x=s*h-r*a,this.y=r*o-n*h,this.z=n*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Kr.copy(this).projectOnVector(t),this.sub(Kr)}reflect(t){return this.sub(Kr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(de(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};rl.prototype.isVector3=!0;let A=rl;const Kr=new A,Sl=new He,ol=class ol{constructor(t,e,n,s,r,o,a,h,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,h,l)}set(t,e,n,s,r,o,a,h,l){const f=this.elements;return f[0]=t,f[1]=s,f[2]=a,f[3]=e,f[4]=r,f[5]=h,f[6]=n,f[7]=o,f[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],h=n[6],l=n[1],f=n[4],d=n[7],c=n[2],u=n[5],p=n[8],x=s[0],g=s[3],m=s[6],v=s[1],b=s[4],S=s[7],C=s[2],T=s[5],_=s[8];return r[0]=o*x+a*v+h*C,r[3]=o*g+a*b+h*T,r[6]=o*m+a*S+h*_,r[1]=l*x+f*v+d*C,r[4]=l*g+f*b+d*T,r[7]=l*m+f*S+d*_,r[2]=c*x+u*v+p*C,r[5]=c*g+u*b+p*T,r[8]=c*m+u*S+p*_,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],h=t[6],l=t[7],f=t[8];return e*o*f-e*a*l-n*r*f+n*a*h+s*r*l-s*o*h}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],h=t[6],l=t[7],f=t[8],d=f*o-a*l,c=a*h-f*r,u=l*r-o*h,p=e*d+n*c+s*u;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/p;return t[0]=d*x,t[1]=(s*l-f*n)*x,t[2]=(a*n-s*o)*x,t[3]=c*x,t[4]=(f*e-s*h)*x,t[5]=(s*r-a*e)*x,t[6]=u*x,t[7]=(n*h-l*e)*x,t[8]=(o*e-n*r)*x,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){const h=Math.cos(r),l=Math.sin(r);return this.set(n*h,n*l,-n*(h*o+l*a)+o+t,-s*l,s*h,-s*(-l*o+h*a)+a+e,0,0,1),this}scale(t,e){return Sr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Jr.makeScale(t,e)),this}rotate(t){return Sr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Jr.makeRotation(-t)),this}translate(t,e){return Sr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Jr.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};ol.prototype.isMatrix3=!0;let ie=ol;const Jr=new ie,yl=new ie().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),El=new ie().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function sf(){const i={enabled:!0,workingColorSpace:Rr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Ae&&(s.r=ii(s.r),s.g=ii(s.g),s.b=ii(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Ae&&(s.r=ts(s.r),s.g=ts(s.g),s.b=ts(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===pi?Cr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Rr]:{primaries:t,whitePoint:n,transfer:Cr,toXYZ:yl,fromXYZ:El,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:vn},outputColorSpaceConfig:{drawingBufferColorSpace:vn}},[vn]:{primaries:t,whitePoint:n,transfer:Ae,toXYZ:yl,fromXYZ:El,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:vn}}}),i}const Me=sf();function ii(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ts(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Ii;class rf{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Ii===void 0&&(Ii=Pr("canvas")),Ii.width=t.width,Ii.height=t.height;const s=Ii.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=Ii}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Pr("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=ii(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ii(e[n]/255)*255):e[n]=ii(e[n]);return{data:e,width:t.width,height:t.height}}else return Jt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let of=0;class Ha{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:of++}),this.uuid=cs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width||0,e.height||0,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push($r(s[o].image)):r.push($r(s[o]))}else r=$r(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function $r(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?rf.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Jt("Texture: Unable to serialize Texture."),{})}let af=0;const Qr=new A;class ln extends Si{constructor(t=ln.DEFAULT_IMAGE,e=ln.DEFAULT_MAPPING,n=ti,s=ti,r=fn,o=mi,a=zn,h=gn,l=ln.DEFAULT_ANISOTROPY,f=pi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:af++}),this.uuid=cs(),this.name="",this.source=new Ha(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=h,this.offset=new St(0,0),this.repeat=new St(1,1),this.center=new St(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ie,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Qr).x}get height(){return this.source.getSize(Qr).y}get depth(){return this.source.getSize(Qr).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const e in t){const n=t[e];if(n===void 0){Jt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){Jt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==jc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Bo:t.x=t.x-Math.floor(t.x);break;case ti:t.x=t.x<0?0:1;break;case zo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Bo:t.y=t.y-Math.floor(t.y);break;case ti:t.y=t.y<0?0:1;break;case zo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}ln.DEFAULT_IMAGE=null;ln.DEFAULT_MAPPING=jc;ln.DEFAULT_ANISOTROPY=1;const al=class al{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const h=t.elements,l=h[0],f=h[4],d=h[8],c=h[1],u=h[5],p=h[9],x=h[2],g=h[6],m=h[10];if(Math.abs(f-c)<.01&&Math.abs(d-x)<.01&&Math.abs(p-g)<.01){if(Math.abs(f+c)<.1&&Math.abs(d+x)<.1&&Math.abs(p+g)<.1&&Math.abs(l+u+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const b=(l+1)/2,S=(u+1)/2,C=(m+1)/2,T=(f+c)/4,_=(d+x)/4,E=(p+g)/4;return b>S&&b>C?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=T/n,r=_/n):S>C?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=T/s,r=E/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=_/r,s=E/r),this.set(n,s,r,e),this}let v=Math.sqrt((g-p)*(g-p)+(d-x)*(d-x)+(c-f)*(c-f));return Math.abs(v)<.001&&(v=1),this.x=(g-p)/v,this.y=(d-x)/v,this.z=(c-f)/v,this.w=Math.acos((l+u+m-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this.z=de(this.z,t.z,e.z),this.w=de(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this.z=de(this.z,t,e),this.w=de(this.w,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(de(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};al.prototype.isVector4=!0;let Ue=al;class lf extends Si{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:fn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Ue(0,0,t,e),this.scissorTest=!1,this.viewport=new Ue(0,0,t,e),this.textures=[];const s=n.count;for(let r=0;r<s;r++)this.textures[r]=new ln({width:t,height:e,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){const e={minFilter:fn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.mipmapsAutoUpdate!==void 0&&(e.mipmapsAutoUpdate=t.mipmapsAutoUpdate),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;const s=Object.assign({},t.textures[e].image);this.textures[e].source=new Ha(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){const e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class kn extends lf{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class uh extends ln{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=tn,this.minFilter=tn,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class cf extends ln{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=tn,this.minFilter=tn,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}const Fr=class Fr{constructor(t,e,n,s,r,o,a,h,l,f,d,c,u,p,x,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,h,l,f,d,c,u,p,x,g)}set(t,e,n,s,r,o,a,h,l,f,d,c,u,p,x,g){const m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=h,m[2]=l,m[6]=f,m[10]=d,m[14]=c,m[3]=u,m[7]=p,m[11]=x,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Fr().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const e=this.elements,n=t.elements,s=1/Ui.setFromMatrixColumn(t,0).length(),r=1/Ui.setFromMatrixColumn(t,1).length(),o=1/Ui.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),h=Math.cos(s),l=Math.sin(s),f=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){const c=o*f,u=o*d,p=a*f,x=a*d;e[0]=h*f,e[4]=-h*d,e[8]=l,e[1]=u+p*l,e[5]=c-x*l,e[9]=-a*h,e[2]=x-c*l,e[6]=p+u*l,e[10]=o*h}else if(t.order==="YXZ"){const c=h*f,u=h*d,p=l*f,x=l*d;e[0]=c+x*a,e[4]=p*a-u,e[8]=o*l,e[1]=o*d,e[5]=o*f,e[9]=-a,e[2]=u*a-p,e[6]=x+c*a,e[10]=o*h}else if(t.order==="ZXY"){const c=h*f,u=h*d,p=l*f,x=l*d;e[0]=c-x*a,e[4]=-o*d,e[8]=p+u*a,e[1]=u+p*a,e[5]=o*f,e[9]=x-c*a,e[2]=-o*l,e[6]=a,e[10]=o*h}else if(t.order==="ZYX"){const c=o*f,u=o*d,p=a*f,x=a*d;e[0]=h*f,e[4]=p*l-u,e[8]=c*l+x,e[1]=h*d,e[5]=x*l+c,e[9]=u*l-p,e[2]=-l,e[6]=a*h,e[10]=o*h}else if(t.order==="YZX"){const c=o*h,u=o*l,p=a*h,x=a*l;e[0]=h*f,e[4]=x-c*d,e[8]=p*d+u,e[1]=d,e[5]=o*f,e[9]=-a*f,e[2]=-l*f,e[6]=u*d+p,e[10]=c-x*d}else if(t.order==="XZY"){const c=o*h,u=o*l,p=a*h,x=a*l;e[0]=h*f,e[4]=-d,e[8]=l*f,e[1]=c*d+x,e[5]=o*f,e[9]=u*d-p,e[2]=p*d-u,e[6]=a*f,e[10]=x*d+c}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(hf,t,uf)}lookAt(t,e,n){const s=this.elements;return pn.subVectors(t,e),pn.lengthSq()===0&&(pn.z=1),pn.normalize(),ci.crossVectors(n,pn),ci.lengthSq()===0&&(Math.abs(n.z)===1?pn.x+=1e-4:pn.z+=1e-4,pn.normalize(),ci.crossVectors(n,pn)),ci.normalize(),Vs.crossVectors(pn,ci),s[0]=ci.x,s[4]=Vs.x,s[8]=pn.x,s[1]=ci.y,s[5]=Vs.y,s[9]=pn.y,s[2]=ci.z,s[6]=Vs.z,s[10]=pn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],h=n[8],l=n[12],f=n[1],d=n[5],c=n[9],u=n[13],p=n[2],x=n[6],g=n[10],m=n[14],v=n[3],b=n[7],S=n[11],C=n[15],T=s[0],_=s[4],E=s[8],N=s[12],P=s[1],L=s[5],F=s[9],W=s[13],U=s[2],G=s[6],w=s[10],I=s[14],X=s[3],H=s[7],j=s[11],et=s[15];return r[0]=o*T+a*P+h*U+l*X,r[4]=o*_+a*L+h*G+l*H,r[8]=o*E+a*F+h*w+l*j,r[12]=o*N+a*W+h*I+l*et,r[1]=f*T+d*P+c*U+u*X,r[5]=f*_+d*L+c*G+u*H,r[9]=f*E+d*F+c*w+u*j,r[13]=f*N+d*W+c*I+u*et,r[2]=p*T+x*P+g*U+m*X,r[6]=p*_+x*L+g*G+m*H,r[10]=p*E+x*F+g*w+m*j,r[14]=p*N+x*W+g*I+m*et,r[3]=v*T+b*P+S*U+C*X,r[7]=v*_+b*L+S*G+C*H,r[11]=v*E+b*F+S*w+C*j,r[15]=v*N+b*W+S*I+C*et,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],h=t[9],l=t[13],f=t[2],d=t[6],c=t[10],u=t[14],p=t[3],x=t[7],g=t[11],m=t[15],v=h*u-l*c,b=a*u-l*d,S=a*c-h*d,C=o*u-l*f,T=o*c-h*f,_=o*d-a*f;return e*(x*v-g*b+m*S)-n*(p*v-g*C+m*T)+s*(p*b-x*C+m*_)-r*(p*S-x*T+g*_)}determinantAffine(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],o=t[5],a=t[9],h=t[2],l=t[6],f=t[10];return e*(o*f-a*l)-n*(r*f-a*h)+s*(r*l-o*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],h=t[6],l=t[7],f=t[8],d=t[9],c=t[10],u=t[11],p=t[12],x=t[13],g=t[14],m=t[15],v=e*a-n*o,b=e*h-s*o,S=e*l-r*o,C=n*h-s*a,T=n*l-r*a,_=s*l-r*h,E=f*x-d*p,N=f*g-c*p,P=f*m-u*p,L=d*g-c*x,F=d*m-u*x,W=c*m-u*g,U=v*W-b*F+S*L+C*P-T*N+_*E;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const G=1/U;return t[0]=(a*W-h*F+l*L)*G,t[1]=(s*F-n*W-r*L)*G,t[2]=(x*_-g*T+m*C)*G,t[3]=(c*T-d*_-u*C)*G,t[4]=(h*P-o*W-l*N)*G,t[5]=(e*W-s*P+r*N)*G,t[6]=(g*S-p*_-m*b)*G,t[7]=(f*_-c*S+u*b)*G,t[8]=(o*F-a*P+l*E)*G,t[9]=(n*P-e*F-r*E)*G,t[10]=(p*T-x*S+m*v)*G,t[11]=(d*S-f*T-u*v)*G,t[12]=(a*N-o*L-h*E)*G,t[13]=(e*L-n*N+s*E)*G,t[14]=(x*b-p*C-g*v)*G,t[15]=(f*C-d*b+c*v)*G,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,h=t.z,l=r*o,f=r*a;return this.set(l*o+n,l*a-s*h,l*h+s*a,0,l*a+s*h,f*a+n,f*h-s*o,0,l*h-s*a,f*h+s*o,r*h*h+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,o=e._y,a=e._z,h=e._w,l=r+r,f=o+o,d=a+a,c=r*l,u=r*f,p=r*d,x=o*f,g=o*d,m=a*d,v=h*l,b=h*f,S=h*d,C=n.x,T=n.y,_=n.z;return s[0]=(1-(x+m))*C,s[1]=(u+S)*C,s[2]=(p-b)*C,s[3]=0,s[4]=(u-S)*T,s[5]=(1-(c+m))*T,s[6]=(g+v)*T,s[7]=0,s[8]=(p+b)*_,s[9]=(g-v)*_,s[10]=(1-(c+x))*_,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=Ui.set(s[0],s[1],s[2]).length();const a=Ui.set(s[4],s[5],s[6]).length(),h=Ui.set(s[8],s[9],s[10]).length();r<0&&(o=-o),bn.copy(this);const l=1/o,f=1/a,d=1/h;return bn.elements[0]*=l,bn.elements[1]*=l,bn.elements[2]*=l,bn.elements[4]*=f,bn.elements[5]*=f,bn.elements[6]*=f,bn.elements[8]*=d,bn.elements[9]*=d,bn.elements[10]*=d,e.setFromRotationMatrix(bn),n.x=o,n.y=a,n.z=h,this}makePerspective(t,e,n,s,r,o,a=Rn,h=!1){const l=this.elements,f=2*r/(e-t),d=2*r/(n-s),c=(e+t)/(e-t),u=(n+s)/(n-s);let p,x;if(h)p=r/(o-r),x=o*r/(o-r);else if(a===Rn)p=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===Ds)p=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=f,l[4]=0,l[8]=c,l[12]=0,l[1]=0,l[5]=d,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=Rn,h=!1){const l=this.elements,f=2/(e-t),d=2/(n-s),c=-(e+t)/(e-t),u=-(n+s)/(n-s);let p,x;if(h)p=1/(o-r),x=o/(o-r);else if(a===Rn)p=-2/(o-r),x=-(o+r)/(o-r);else if(a===Ds)p=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=f,l[4]=0,l[8]=0,l[12]=c,l[1]=0,l[5]=d,l[9]=0,l[13]=u,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};Fr.prototype.isMatrix4=!0;let fe=Fr;const Ui=new A,bn=new fe,hf=new A(0,0,0),uf=new A(1,1,1),ci=new A,Vs=new A,pn=new A,bl=new fe,Tl=new He;class Ge{constructor(t=0,e=0,n=0,s=Ge.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],h=s[1],l=s[5],f=s[9],d=s[2],c=s[6],u=s[10];switch(e){case"XYZ":this._y=Math.asin(de(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-f,u),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(c,l),this._z=0);break;case"YXZ":this._x=Math.asin(-de(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(a,u),this._z=Math.atan2(h,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(de(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(-d,u),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(h,r));break;case"ZYX":this._y=Math.asin(-de(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(c,u),this._z=Math.atan2(h,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(de(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-f,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,u));break;case"XZY":this._z=Math.asin(-de(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(c,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-f,u),this._y=0);break;default:Jt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return bl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(bl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Tl.setFromEuler(this),this.setFromQuaternion(Tl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ge.DEFAULT_ORDER="XYZ";class Ga{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let ff=0;const Al=new A,Oi=new He,Kn=new fe,Ws=new A,fs=new A,df=new A,pf=new He,wl=new A(1,0,0),Rl=new A(0,1,0),Cl=new A(0,0,1),Pl={type:"added"},mf={type:"removed"},Fi={type:"childadded",child:null},jr={type:"childremoved",child:null};class Xe extends Si{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ff++}),this.uuid=cs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Xe.DEFAULT_UP.clone();const t=new A,e=new Ge,n=new He,s=new A(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new fe},normalMatrix:{value:new ie}}),this.matrix=new fe,this.matrixWorld=new fe,this.matrixAutoUpdate=Xe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ga,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Oi.setFromAxisAngle(t,e),this.quaternion.multiply(Oi),this}rotateOnWorldAxis(t,e){return Oi.setFromAxisAngle(t,e),this.quaternion.premultiply(Oi),this}rotateX(t){return this.rotateOnAxis(wl,t)}rotateY(t){return this.rotateOnAxis(Rl,t)}rotateZ(t){return this.rotateOnAxis(Cl,t)}translateOnAxis(t,e){return Al.copy(t).applyQuaternion(this.quaternion),this.position.add(Al.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(wl,t)}translateY(t){return this.translateOnAxis(Rl,t)}translateZ(t){return this.translateOnAxis(Cl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Kn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ws.copy(t):Ws.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),fs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Kn.lookAt(fs,Ws,this.up):Kn.lookAt(Ws,fs,this.up),this.quaternion.setFromRotationMatrix(Kn),s&&(Kn.extractRotation(s.matrixWorld),Oi.setFromRotationMatrix(Kn),this.quaternion.premultiply(Oi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Ee("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Pl),Fi.child=t,this.dispatchEvent(Fi),Fi.child=null):Ee("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(mf),jr.child=t,this.dispatchEvent(jr),jr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Kn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Kn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Kn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Pl),Fi.child=t,this.dispatchEvent(Fi),Fi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,t,df),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,pf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){const s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,h){return a[h.uuid]===void 0&&(a[h.uuid]=h.toJSON(t)),h.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const h=a.shapes;if(Array.isArray(h))for(let l=0,f=h.length;l<f;l++){const d=h[l];r(t.shapes,d)}else r(t.shapes,h)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let h=0,l=this.material.length;h<l;h++)a.push(r(t.materials,this.material[h]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const h=this.animations[a];s.animations.push(r(t.animations,h))}}if(e){const a=o(t.geometries),h=o(t.materials),l=o(t.textures),f=o(t.images),d=o(t.shapes),c=o(t.skeletons),u=o(t.animations),p=o(t.nodes);a.length>0&&(n.geometries=a),h.length>0&&(n.materials=h),l.length>0&&(n.textures=l),f.length>0&&(n.images=f),d.length>0&&(n.shapes=d),c.length>0&&(n.skeletons=c),u.length>0&&(n.animations=u),p.length>0&&(n.nodes=p)}return n.object=s,n;function o(a){const h=[];for(const l in a){const f=a[l];delete f.metadata,h.push(f)}return h}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Xe.DEFAULT_UP=new A(0,1,0);Xe.DEFAULT_MATRIX_AUTO_UPDATE=!0;Xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class _i extends Xe{constructor(){super(),this.isGroup=!0,this.type="Group"}}const gf={type:"move"};class to{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new _i,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new _i,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new A,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new A),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new _i,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new A,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new A,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null;const a=this._targetRay,h=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(const x of t.hand.values()){const g=e.getJointPose(x,n),m=this._getHandJoint(l,x);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}const f=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],c=f.position.distanceTo(d.position),u=.02,p=.005;l.inputState.pinching&&c>u+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&c<=u-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else h!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(h.matrix.fromArray(r.transform.matrix),h.matrix.decompose(h.position,h.quaternion,h.scale),h.matrixWorldNeedsUpdate=!0,r.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(r.linearVelocity)):h.hasLinearVelocity=!1,r.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(r.angularVelocity)):h.hasAngularVelocity=!1,h.eventsEnabled&&h.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(gf)))}return a!==null&&(a.visible=s!==null),h!==null&&(h.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new _i;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const fh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},hi={h:0,s:0,l:0},Xs={h:0,s:0,l:0};function eo(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class pe{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=vn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Me.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=Me.workingColorSpace){return this.r=t,this.g=e,this.b=n,Me.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=Me.workingColorSpace){if(t=Qu(t,1),e=de(e,0,1),n=de(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=eo(o,r,t+1/3),this.g=eo(o,r,t),this.b=eo(o,r,t-1/3)}return Me.colorSpaceToWorking(this,s),this}setStyle(t,e=vn){function n(r){r!==void 0&&parseFloat(r)<1&&Jt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Jt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Jt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=vn){const n=fh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Jt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ii(t.r),this.g=ii(t.g),this.b=ii(t.b),this}copyLinearToSRGB(t){return this.r=ts(t.r),this.g=ts(t.g),this.b=ts(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=vn){return Me.workingToColorSpace(rn.copy(this),t),Math.round(de(rn.r*255,0,255))*65536+Math.round(de(rn.g*255,0,255))*256+Math.round(de(rn.b*255,0,255))}getHexString(t=vn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Me.workingColorSpace){Me.workingToColorSpace(rn.copy(this),e);const n=rn.r,s=rn.g,r=rn.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let h,l;const f=(a+o)/2;if(a===o)h=0,l=0;else{const d=o-a;switch(l=f<=.5?d/(o+a):d/(2-o-a),o){case n:h=(s-r)/d+(s<r?6:0);break;case s:h=(r-n)/d+2;break;case r:h=(n-s)/d+4;break}h/=6}return t.h=h,t.s=l,t.l=f,t}getRGB(t,e=Me.workingColorSpace){return Me.workingToColorSpace(rn.copy(this),e),t.r=rn.r,t.g=rn.g,t.b=rn.b,t}getStyle(t=vn){Me.workingToColorSpace(rn.copy(this),t);const e=rn.r,n=rn.g,s=rn.b;return t!==vn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(hi),this.setHSL(hi.h+t,hi.s+e,hi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(hi),t.getHSL(Xs);const n=Zr(hi.h,Xs.h,e),s=Zr(hi.s,Xs.s,e),r=Zr(hi.l,Xs.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const rn=new pe;pe.NAMES=fh;class _f extends Xe{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ge,this.environmentIntensity=1,this.environmentRotation=new Ge,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}}const Tn=new A,Jn=new A,no=new A,$n=new A,Bi=new A,zi=new A,Ll=new A,io=new A,so=new A,ro=new A,oo=new Ue,ao=new Ue,lo=new Ue;class Sn{constructor(t=new A,e=new A,n=new A){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Tn.subVectors(t,e),s.cross(Tn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Tn.subVectors(s,e),Jn.subVectors(n,e),no.subVectors(t,e);const o=Tn.dot(Tn),a=Tn.dot(Jn),h=Tn.dot(no),l=Jn.dot(Jn),f=Jn.dot(no),d=o*l-a*a;if(d===0)return r.set(0,0,0),null;const c=1/d,u=(l*h-a*f)*c,p=(o*f-a*h)*c;return r.set(1-u-p,p,u)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,$n)===null?!1:$n.x>=0&&$n.y>=0&&$n.x+$n.y<=1}static getInterpolation(t,e,n,s,r,o,a,h){return this.getBarycoord(t,e,n,s,$n)===null?(h.x=0,h.y=0,"z"in h&&(h.z=0),"w"in h&&(h.w=0),null):(h.setScalar(0),h.addScaledVector(r,$n.x),h.addScaledVector(o,$n.y),h.addScaledVector(a,$n.z),h)}static getInterpolatedAttribute(t,e,n,s,r,o){return oo.setScalar(0),ao.setScalar(0),lo.setScalar(0),oo.fromBufferAttribute(t,e),ao.fromBufferAttribute(t,n),lo.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(oo,r.x),o.addScaledVector(ao,r.y),o.addScaledVector(lo,r.z),o}static isFrontFacing(t,e,n,s){return Tn.subVectors(n,e),Jn.subVectors(t,e),Tn.cross(Jn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Tn.subVectors(this.c,this.b),Jn.subVectors(this.a,this.b),Tn.cross(Jn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Sn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Sn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return Sn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return Sn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Sn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let o,a;Bi.subVectors(s,n),zi.subVectors(r,n),io.subVectors(t,n);const h=Bi.dot(io),l=zi.dot(io);if(h<=0&&l<=0)return e.copy(n);so.subVectors(t,s);const f=Bi.dot(so),d=zi.dot(so);if(f>=0&&d<=f)return e.copy(s);const c=h*d-f*l;if(c<=0&&h>=0&&f<=0&&h-f>0)return o=h/(h-f),e.copy(n).addScaledVector(Bi,o);ro.subVectors(t,r);const u=Bi.dot(ro),p=zi.dot(ro);if(p>=0&&u<=p)return e.copy(r);const x=u*l-h*p;if(x<=0&&l>=0&&p<=0)return a=l/(l-p),e.copy(n).addScaledVector(zi,a);const g=f*p-u*d;if(g<=0&&d-f>=0&&u-p>=0)return Ll.subVectors(r,s),a=(d-f)/(d-f+(u-p)),e.copy(s).addScaledVector(Ll,a);const m=1/(g+x+c);return o=x*m,a=c*m,e.copy(n).addScaledVector(Bi,o).addScaledVector(zi,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class Cn{constructor(t=new A(1/0,1/0,1/0),e=new A(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(An.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(An.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=An.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,An):An.fromBufferAttribute(r,o),An.applyMatrix4(t.matrixWorld),this.expandByPoint(An);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ys.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ys.copy(n.boundingBox)),Ys.applyMatrix4(t.matrixWorld),this.union(Ys)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,An),An.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(ds),qs.subVectors(this.max,ds),Hi.subVectors(t.a,ds),Gi.subVectors(t.b,ds),ki.subVectors(t.c,ds),ui.subVectors(Gi,Hi),fi.subVectors(ki,Gi),Ei.subVectors(Hi,ki);let e=[0,-ui.z,ui.y,0,-fi.z,fi.y,0,-Ei.z,Ei.y,ui.z,0,-ui.x,fi.z,0,-fi.x,Ei.z,0,-Ei.x,-ui.y,ui.x,0,-fi.y,fi.x,0,-Ei.y,Ei.x,0];return!co(e,Hi,Gi,ki,qs)||(e=[1,0,0,0,1,0,0,0,1],!co(e,Hi,Gi,ki,qs))?!1:(Zs.crossVectors(ui,fi),e=[Zs.x,Zs.y,Zs.z],co(e,Hi,Gi,ki,qs))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,An).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(An).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Qn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const Qn=[new A,new A,new A,new A,new A,new A,new A,new A],An=new A,Ys=new Cn,Hi=new A,Gi=new A,ki=new A,ui=new A,fi=new A,Ei=new A,ds=new A,qs=new A,Zs=new A,bi=new A;function co(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){bi.fromArray(i,r);const a=s.x*Math.abs(bi.x)+s.y*Math.abs(bi.y)+s.z*Math.abs(bi.z),h=t.dot(bi),l=e.dot(bi),f=n.dot(bi);if(Math.max(-Math.max(h,l,f),Math.min(h,l,f))>a)return!1}return!0}const ze=new A,Ks=new St;let xf=0;class Vn extends Si{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:xf++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=qu,this.updateRanges=[],this.gpuType=Bn,this.version=0,this._normalizationScale=t!==void 0?za(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Ks.fromBufferAttribute(this,e),Ks.applyMatrix3(t),this.setXY(e,Ks.x,Ks.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.applyMatrix3(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.applyMatrix4(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.applyNormalMatrix(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.transformDirection(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=this._denormalize(n)),n}setComponent(t,e,n){return this.normalized&&(n=this._normalize(n)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=this._denormalize(e)),e}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=this._denormalize(e)),e}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=this._denormalize(e)),e}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=this._denormalize(e)),e}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){const e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):tf(t,this.array)}_normalize(t){const e=this._normalizationScale;return e!==void 0?Math.round(t*e):ef(t,this.array)}}class dh extends Vn{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class ph extends Vn{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class _e extends Vn{constructor(t,e,n){super(new Float32Array(t),e,n)}}const vf=new Cn,ps=new A,ho=new A;class Fs{constructor(t=new A,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):vf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ps.subVectors(t,this.center);const e=ps.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(ps,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ho.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ps.copy(t.center).add(ho)),this.expandByPoint(ps.copy(t.center).sub(ho))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}let Mf=0;const xn=new fe,uo=new Xe,Vi=new A,mn=new Cn,ms=new Cn,$e=new A;class Fe extends Si{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Mf++}),this.uuid=cs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Zu(t)?ph:dh)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new ie().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return xn.makeRotationFromQuaternion(t),this.applyMatrix4(xn),this}rotateX(t){return xn.makeRotationX(t),this.applyMatrix4(xn),this}rotateY(t){return xn.makeRotationY(t),this.applyMatrix4(xn),this}rotateZ(t){return xn.makeRotationZ(t),this.applyMatrix4(xn),this}translate(t,e,n){return xn.makeTranslation(t,e,n),this.applyMatrix4(xn),this}scale(t,e,n){return xn.makeScale(t,e,n),this.applyMatrix4(xn),this}lookAt(t){return uo.lookAt(t),uo.updateMatrix(),this.applyMatrix4(uo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vi).negate(),this.translate(Vi.x,Vi.y,Vi.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new _e(n,3))}else{const n=Math.min(t.length,e.count);for(let s=0;s<n;s++){const r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Jt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Cn);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ee("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new A(-1/0,-1/0,-1/0),new A(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];mn.setFromBufferAttribute(r),this.morphTargetsRelative?($e.addVectors(this.boundingBox.min,mn.min),this.boundingBox.expandByPoint($e),$e.addVectors(this.boundingBox.max,mn.max),this.boundingBox.expandByPoint($e)):(this.boundingBox.expandByPoint(mn.min),this.boundingBox.expandByPoint(mn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ee('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Fs);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ee("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new A,1/0);return}if(t){const n=this.boundingSphere.center;if(mn.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];ms.setFromBufferAttribute(a),this.morphTargetsRelative?($e.addVectors(mn.min,ms.min),mn.expandByPoint($e),$e.addVectors(mn.max,ms.max),mn.expandByPoint($e)):(mn.expandByPoint(ms.min),mn.expandByPoint(ms.max))}mn.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)$e.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared($e));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],h=this.morphTargetsRelative;for(let l=0,f=a.count;l<f;l++)$e.fromBufferAttribute(a,l),h&&(Vi.fromBufferAttribute(t,l),$e.add(Vi)),s=Math.max(s,n.distanceToSquared($e))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ee('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Ee("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;let o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Vn(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));const a=[],h=[],l=new Uint8Array(n.count);for(let N=0;N<n.count;N++)a[N]=new A,h[N]=new A;const f=new A,d=new A,c=new A,u=new St,p=new St,x=new St,g=new A,m=new A;function v(N,P,L){l[N]=l[P]=l[L]=1,f.fromBufferAttribute(n,N),d.fromBufferAttribute(n,P),c.fromBufferAttribute(n,L),u.fromBufferAttribute(r,N),p.fromBufferAttribute(r,P),x.fromBufferAttribute(r,L),d.sub(f),c.sub(f),p.sub(u),x.sub(u);const F=1/(p.x*x.y-x.x*p.y);isFinite(F)&&(g.copy(d).multiplyScalar(x.y).addScaledVector(c,-p.y).multiplyScalar(F),m.copy(c).multiplyScalar(p.x).addScaledVector(d,-x.x).multiplyScalar(F),a[N].add(g),a[P].add(g),a[L].add(g),h[N].add(m),h[P].add(m),h[L].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let N=0,P=b.length;N<P;++N){const L=b[N],F=L.start,W=L.count;for(let U=F,G=F+W;U<G;U+=3)v(t.getX(U+0),t.getX(U+1),t.getX(U+2))}const S=new A,C=new A,T=new A,_=new A;function E(N){T.fromBufferAttribute(s,N),_.copy(T);const P=a[N];S.copy(P),S.sub(T.multiplyScalar(T.dot(P))).normalize(),C.crossVectors(_,P);const F=C.dot(h[N])<0?-1:1;o.setXYZW(N,S.x,S.y,S.z,F)}for(let N=0,P=n.count;N<P;++N)l[N]&&E(N);this._transformed=!0}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new Vn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let c=0,u=n.count;c<u;c++)n.setXYZ(c,0,0,0);const s=new A,r=new A,o=new A,a=new A,h=new A,l=new A,f=new A,d=new A;if(t)for(let c=0,u=t.count;c<u;c+=3){const p=t.getX(c+0),x=t.getX(c+1),g=t.getX(c+2);s.fromBufferAttribute(e,p),r.fromBufferAttribute(e,x),o.fromBufferAttribute(e,g),f.subVectors(o,r),d.subVectors(s,r),f.cross(d),a.fromBufferAttribute(n,p),h.fromBufferAttribute(n,x),l.fromBufferAttribute(n,g),a.add(f),h.add(f),l.add(f),n.setXYZ(p,a.x,a.y,a.z),n.setXYZ(x,h.x,h.y,h.z),n.setXYZ(g,l.x,l.y,l.z)}else for(let c=0,u=e.count;c<u;c+=3)s.fromBufferAttribute(e,c+0),r.fromBufferAttribute(e,c+1),o.fromBufferAttribute(e,c+2),f.subVectors(o,r),d.subVectors(s,r),f.cross(d),n.setXYZ(c+0,f.x,f.y,f.z),n.setXYZ(c+1,f.x,f.y,f.z),n.setXYZ(c+2,f.x,f.y,f.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)$e.fromBufferAttribute(t,e),$e.normalize(),t.setXYZ(e,$e.x,$e.y,$e.z)}toNonIndexed(){function t(a,h){const l=a.array,f=a.itemSize,d=a.normalized,c=new l.constructor(h.length*f);let u=0,p=0;for(let x=0,g=h.length;x<g;x++){a.isInterleavedBufferAttribute?u=h[x]*a.data.stride+a.offset:u=h[x]*f;for(let m=0;m<f;m++)c[p++]=l[u++]}return new Vn(c,f,d)}if(this.index===null)return Jt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Fe,n=this.index.array,s=this.attributes;for(const a in s){const h=s[a],l=t(h,n);e.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const h=[],l=r[a];for(let f=0,d=l.length;f<d;f++){const c=l[f],u=t(c,n);h.push(u)}e.morphAttributes[a]=h}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,h=o.length;a<h;a++){const l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const h=this.parameters;for(const l in h)h[l]!==void 0&&(t[l]=h[l]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const h in n){const l=n[h];t.data.attributes[h]=l.toJSON(t.data)}const s={};let r=!1;for(const h in this.morphAttributes){const l=this.morphAttributes[h],f=[];for(let d=0,c=l.length;d<c;d++){const u=l[d];f.push(u.toJSON(t.data))}f.length>0&&(s[h]=f,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone());const s=t.attributes;for(const l in s){const f=s[l];this.setAttribute(l,f.clone(e))}const r=t.morphAttributes;for(const l in r){const f=[],d=r[l];for(let c=0,u=d.length;c<u;c++)f.push(d[c].clone(e));this.morphAttributes[l]=f}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let l=0,f=o.length;l<f;l++){const d=o[l];this.addGroup(d.start,d.count,d.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const h=t.boundingSphere;return h!==null&&(this.boundingSphere=h.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const fo=new A,Sf=new A,yf=new ie;class Un{constructor(t=new A(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=fo.subVectors(n,e).cross(Sf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){const s=t.delta(fo),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(s,o)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||yf.getNormalMatrix(t),s=this.coplanarPoint(fo).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}let Ef=0;class hs extends Si{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ef++}),this.uuid=cs(),this.name="",this.type="Material",this.blending=Ts,this.side=Ri,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Vc,this.blendDst=Wc,this.blendEquation=Ki,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new pe(0,0,0),this.blendAlpha=0,this.depthFunc=Cs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Gu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=qr,this.stencilZFail=qr,this.stencilZPass=qr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){Jt(`Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){Jt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const h=r[a];delete h.metadata,o.push(h)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new pe().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.diffuseRoughness!==void 0&&(this.diffuseRoughness=t.diffuseRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum),t.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1]),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new Un().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new St().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new St().fromArray(t.clearcoatNormalScale)),t.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}const jn=new A,po=new A,Js=new A,$s=new A;class Bs{constructor(t=new A,e=new A(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,jn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=jn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(jn.copy(this.origin).addScaledVector(this.direction,e),jn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){po.copy(t).add(e).multiplyScalar(.5),Js.copy(e).sub(t).normalize(),$s.copy(this.origin).sub(po);const r=t.distanceTo(e)*.5,o=-this.direction.dot(Js),a=$s.dot(this.direction),h=-$s.dot(Js),l=$s.lengthSq(),f=Math.abs(1-o*o);let d,c,u,p;if(f>0)if(d=o*h-a,c=o*a-h,p=r*f,d>=0)if(c>=-p)if(c<=p){const x=1/f;d*=x,c*=x,u=d*(d+o*c+2*a)+c*(o*d+c+2*h)+l}else c=r,d=Math.max(0,-(o*c+a)),u=-d*d+c*(c+2*h)+l;else c=-r,d=Math.max(0,-(o*c+a)),u=-d*d+c*(c+2*h)+l;else c<=-p?(d=Math.max(0,-(-o*r+a)),c=d>0?-r:Math.min(Math.max(-r,-h),r),u=-d*d+c*(c+2*h)+l):c<=p?(d=0,c=Math.min(Math.max(-r,-h),r),u=c*(c+2*h)+l):(d=Math.max(0,-(o*r+a)),c=d>0?r:Math.min(Math.max(-r,-h),r),u=-d*d+c*(c+2*h)+l);else c=o>0?-r:r,d=Math.max(0,-(o*c+a)),u=-d*d+c*(c+2*h)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(po).addScaledVector(Js,c),u}intersectSphere(t,e){if(t.radius<0)return null;jn.subVectors(t.center,this.origin);const n=jn.dot(this.direction),s=jn.dot(jn)-n*n,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,h=n+o;return h<0?null:a<0?this.at(h,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,h;const l=1/this.direction.x,f=1/this.direction.y,d=1/this.direction.z,c=this.origin;return l>=0?(n=(t.min.x-c.x)*l,s=(t.max.x-c.x)*l):(n=(t.max.x-c.x)*l,s=(t.min.x-c.x)*l),f>=0?(r=(t.min.y-c.y)*f,o=(t.max.y-c.y)*f):(r=(t.max.y-c.y)*f,o=(t.min.y-c.y)*f),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(t.min.z-c.z)*d,h=(t.max.z-c.z)*d):(a=(t.max.z-c.z)*d,h=(t.min.z-c.z)*d),n>h||a>s)||((a>n||n!==n)&&(n=a),(h<s||s!==s)&&(s=h),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,jn)!==null}intersectTriangle(t,e,n,s,r){const o=this.origin,a=this.direction,h=a.x,l=a.y,f=a.z,d=t.x-o.x,c=t.y-o.y,u=t.z-o.z,p=e.x-o.x,x=e.y-o.y,g=e.z-o.z,m=n.x-o.x,v=n.y-o.y,b=n.z-o.z,S=Math.abs(h),C=Math.abs(l),T=Math.abs(f);let _,E,N,P,L,F,W,U,G,w,I,X;if(S>=C&&S>=T?(N=h,F=d,G=p,X=m,h>=0?(_=l,E=f,P=c,L=u,W=x,U=g,w=v,I=b):(_=f,E=l,P=u,L=c,W=g,U=x,w=b,I=v)):C>=T?(N=l,F=c,G=x,X=v,l>=0?(_=f,E=h,P=u,L=d,W=g,U=p,w=b,I=m):(_=h,E=f,P=d,L=u,W=p,U=g,w=m,I=b)):(N=f,F=u,G=g,X=b,f>=0?(_=h,E=l,P=d,L=c,W=p,U=x,w=m,I=v):(_=l,E=h,P=c,L=d,W=x,U=p,w=v,I=m)),N===0)return null;const H=_/N,j=E/N,et=1/N,mt=P-H*F,It=L-j*F,K=W-H*G,st=U-j*G,xt=w-H*X,Rt=I-j*X,gt=xt*st-Rt*K,At=mt*Rt-It*xt,Kt=K*It-st*mt;if(s){if(gt<0||At<0||Kt<0)return null}else if((gt<0||At<0||Kt<0)&&(gt>0||At>0||Kt>0))return null;const yt=gt+At+Kt;if(yt===0)return null;const qt=et*(gt*F+At*G+Kt*X);return(yt>0?qt<0:qt>0)?null:this.at(qt/yt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ka extends hs{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new pe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ge,this.combine=Xc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Dl=new fe,Ti=new Bs,Qs=new Fs,Nl=new A,js=new A,tr=new A,er=new A,mo=new A,nr=new A,Il=new A,ir=new A;class _n extends Xe{constructor(t=new Fe,e=new ka){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){nr.set(0,0,0);for(let h=0,l=r.length;h<l;h++){const f=a[h],d=r[h];f!==0&&(mo.fromBufferAttribute(d,t),o?nr.addScaledVector(mo,f):nr.addScaledVector(mo.sub(e),f))}e.add(nr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Qs.copy(n.boundingSphere),Qs.applyMatrix4(r),Ti.copy(t.ray).recast(t.near),!(Qs.containsPoint(Ti.origin)===!1&&(Ti.intersectSphere(Qs,Nl)===null||Ti.origin.distanceToSquared(Nl)>(t.far-t.near)**2))&&(Dl.copy(r).invert(),Ti.copy(t.ray).applyMatrix4(Dl),!(n.boundingBox!==null&&Ti.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Ti)))}_computeIntersections(t,e,n){let s;const r=this.geometry,o=this.material,a=r.index,h=r.attributes.position,l=r.attributes.uv,f=r.attributes.uv1,d=r.attributes.normal,c=r.groups,u=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,x=c.length;p<x;p++){const g=c[p],m=o[g.materialIndex],v=Math.max(g.start,u.start),b=Math.min(a.count,Math.min(g.start+g.count,u.start+u.count));for(let S=v,C=b;S<C;S+=3){const T=a.getX(S),_=a.getX(S+1),E=a.getX(S+2);s=sr(this,m,t,n,l,f,d,T,_,E),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{const p=Math.max(0,u.start),x=Math.min(a.count,u.start+u.count);for(let g=p,m=x;g<m;g+=3){const v=a.getX(g),b=a.getX(g+1),S=a.getX(g+2);s=sr(this,o,t,n,l,f,d,v,b,S),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}else if(h!==void 0)if(Array.isArray(o))for(let p=0,x=c.length;p<x;p++){const g=c[p],m=o[g.materialIndex],v=Math.max(g.start,u.start),b=Math.min(h.count,Math.min(g.start+g.count,u.start+u.count));for(let S=v,C=b;S<C;S+=3){const T=S,_=S+1,E=S+2;s=sr(this,m,t,n,l,f,d,T,_,E),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{const p=Math.max(0,u.start),x=Math.min(h.count,u.start+u.count);for(let g=p,m=x;g<m;g+=3){const v=g,b=g+1,S=g+2;s=sr(this,o,t,n,l,f,d,v,b,S),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}}}function bf(i,t,e,n,s,r,o,a){let h;if(t.side===dn?h=n.intersectTriangle(o,r,s,!0,a):h=n.intersectTriangle(s,r,o,t.side===Ri,a),h===null)return null;ir.copy(a),ir.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(ir);return l<e.near||l>e.far?null:{distance:l,point:ir.clone(),object:i}}function sr(i,t,e,n,s,r,o,a,h,l){i.getVertexPosition(a,js),i.getVertexPosition(h,tr),i.getVertexPosition(l,er);const f=bf(i,t,e,n,js,tr,er,Il);if(f){const d=new A;Sn.getBarycoord(Il,js,tr,er,d),s&&(f.uv=Sn.getInterpolatedAttribute(s,a,h,l,d,new St)),r&&(f.uv1=Sn.getInterpolatedAttribute(r,a,h,l,d,new St)),o&&(f.normal=Sn.getInterpolatedAttribute(o,a,h,l,d,new A),f.normal.dot(n.direction)>0&&f.normal.multiplyScalar(-1));const c={a,b:h,c:l,normal:new A,materialIndex:0};Sn.getNormal(js,tr,er,c.normal),f.face=c,f.barycoord=d}return f}class Tf extends ln{constructor(t=null,e=1,n=1,s,r,o,a,h,l=tn,f=tn,d,c){super(null,o,a,h,l,f,s,r,d,c),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Ai=new Fs,Af=new St(.5,.5),rr=new A;class Ns{constructor(t=new Un,e=new Un,n=new Un,s=new Un,r=new Un,o=new Un){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Rn,n=!1){const s=this.planes,r=t.elements,o=r[0],a=r[1],h=r[2],l=r[3],f=r[4],d=r[5],c=r[6],u=r[7],p=r[8],x=r[9],g=r[10],m=r[11],v=r[12],b=r[13],S=r[14],C=r[15];if(s[0].setComponents(l-o,u-f,m-p,C-v).normalize(),s[1].setComponents(l+o,u+f,m+p,C+v).normalize(),s[2].setComponents(l+a,u+d,m+x,C+b).normalize(),s[3].setComponents(l-a,u-d,m-x,C-b).normalize(),n)s[4].setComponents(h,c,g,S).normalize(),s[5].setComponents(l-h,u-c,m-g,C-S).normalize();else if(s[4].setComponents(l-h,u-c,m-g,C-S).normalize(),e===Rn)s[5].setComponents(l+h,u+c,m+g,C+S).normalize();else if(e===Ds)s[5].setComponents(h,c,g,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ai.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ai.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ai)}intersectsSprite(t){Ai.center.set(0,0,0);const e=Af.distanceTo(t.center);return Ai.radius=.7071067811865476+e,Ai.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ai)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(rr.x=s.normal.x>0?t.max.x:t.min.x,rr.y=s.normal.y>0?t.max.y:t.min.y,rr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(rr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const Ul=new fe;class Va{constructor(){this.coordinateSystem=Rn,this._frustums=[],this._count=0}setFromArrayCamera(t){const e=t.cameras,n=this._frustums;for(let s=0;s<e.length;s++){const r=e[s];Ul.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new Ns),n[s].setFromProjectionMatrix(Ul,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsObject(t))return!0;return!1}intersectsSprite(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSprite(t))return!0;return!1}intersectsSphere(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSphere(t))return!0;return!1}intersectsBox(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsBox(t))return!0;return!1}containsPoint(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;const e=this._frustums,n=t._frustums;for(let s=0;s<t._count;s++)e[s]===void 0&&(e[s]=new Ns),e[s].copy(n[s]);return this._count=t._count,this}clone(){return new Va().copy(this)}}class mh extends hs{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new pe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Lr=new A,Dr=new A,Ol=new fe,gs=new Bs,or=new Fs,go=new A,Fl=new A;class wf extends Xe{constructor(t=new Fe,e=new mh){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Lr.fromBufferAttribute(e,s-1),Dr.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Lr.distanceTo(Dr);t.setAttribute("lineDistance",new _e(n,1))}else Jt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),or.copy(n.boundingSphere),or.applyMatrix4(s),or.radius+=r,t.ray.intersectsSphere(or)===!1)return;Ol.copy(s).invert(),gs.copy(t.ray).applyMatrix4(Ol);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),h=a*a,l=this.isLineSegments?2:1,f=n.index,c=n.attributes.position;if(f!==null){const u=Math.max(0,o.start),p=Math.min(f.count,o.start+o.count);for(let x=u,g=p-1;x<g;x+=l){const m=f.getX(x),v=f.getX(x+1),b=ar(this,t,gs,h,m,v,x);b&&e.push(b)}if(this.isLineLoop){const x=f.getX(p-1),g=f.getX(u),m=ar(this,t,gs,h,x,g,p-1);m&&e.push(m)}}else{const u=Math.max(0,o.start),p=Math.min(c.count,o.start+o.count);for(let x=u,g=p-1;x<g;x+=l){const m=ar(this,t,gs,h,x,x+1,x);m&&e.push(m)}if(this.isLineLoop){const x=ar(this,t,gs,h,p-1,u,p-1);x&&e.push(x)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function ar(i,t,e,n,s,r,o){const a=i.geometry.attributes.position;if(Lr.fromBufferAttribute(a,s),Dr.fromBufferAttribute(a,r),e.distanceSqToSegment(Lr,Dr,go,Fl)>n)return;go.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(go);if(!(l<t.near||l>t.far))return{distance:l,point:Fl.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}const Bl=new A,zl=new A;class gh extends wf{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Bl.fromBufferAttribute(e,s),zl.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Bl.distanceTo(zl);t.setAttribute("lineDistance",new _e(n,1))}else Jt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class _h extends ln{constructor(t=[],e=is,n,s,r,o,a,h,l,f){super(t,e,n,s,r,o,a,h,l,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class rs extends ln{constructor(t,e,n=Wn,s,r,o,a=tn,h=tn,l,f=vi,d=1){if(f!==vi&&f!==gi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const c={width:t,height:e,depth:d};super(c,s,r,o,a,h,f,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Ha(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}}class xh extends rs{constructor(t,e=Wn,n=is,s,r,o=tn,a=tn,h,l=vi){const f={width:t,height:t,depth:1},d=[f,f,f,f,f,f];super(t,t,e,n,s,r,o,a,h,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class vh extends ln{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class Di extends Fe{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const h=[],l=[],f=[],d=[];let c=0,u=0;p("z","y","x",-1,-1,n,e,t,o,r,0),p("z","y","x",1,-1,n,e,-t,o,r,1),p("x","z","y",1,1,t,n,e,s,o,2),p("x","z","y",1,-1,t,n,-e,s,o,3),p("x","y","z",1,-1,t,e,n,s,r,4),p("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(h),this.setAttribute("position",new _e(l,3)),this.setAttribute("normal",new _e(f,3)),this.setAttribute("uv",new _e(d,2));function p(x,g,m,v,b,S,C,T,_,E,N){const P=S/_,L=C/E,F=S/2,W=C/2,U=T/2,G=_+1,w=E+1;let I=0,X=0;const H=new A;for(let j=0;j<w;j++){const et=j*L-W;for(let mt=0;mt<G;mt++){const It=mt*P-F;H[x]=It*v,H[g]=et*b,H[m]=U,l.push(H.x,H.y,H.z),H[x]=0,H[g]=0,H[m]=T>0?1:-1,f.push(H.x,H.y,H.z),d.push(mt/_),d.push(1-j/E),I+=1}}for(let j=0;j<E;j++)for(let et=0;et<_;et++){const mt=c+et+G*j,It=c+et+G*(j+1),K=c+(et+1)+G*(j+1),st=c+(et+1)+G*j;h.push(mt,It,st),h.push(It,K,st),X+=6}a.addGroup(u,X,N),u+=X,c+=I}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Di(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class Wa extends Fe{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const o=[],a=[],h=[],l=[],f=e/2,d=Math.PI/2*t,c=e,u=2*d+c,p=n*2+r,x=s+1,g=new A,m=new A;for(let v=0;v<=p;v++){let b=0,S=0,C=0,T=0;if(v<=n){const N=v/n,P=N*Math.PI/2;S=-f-t*Math.cos(P),C=t*Math.sin(P),T=-t*Math.cos(P),b=N*d}else if(v<=n+r){const N=(v-n)/r;S=-f+N*e,C=t,T=0,b=d+N*c}else{const N=(v-n-r)/n,P=N*Math.PI/2;S=f+t*Math.sin(P),C=t*Math.cos(P),T=t*Math.sin(P),b=d+c+N*d}const _=Math.max(0,Math.min(1,b/u));let E=0;v===0?E=.5/s:v===p&&(E=-.5/s);for(let N=0;N<=s;N++){const P=N/s,L=P*Math.PI*2,F=Math.sin(L),W=Math.cos(L);m.x=-C*W,m.y=S,m.z=C*F,a.push(m.x,m.y,m.z),g.set(-C*W,T,C*F),g.normalize(),h.push(g.x,g.y,g.z),l.push(P+E,_)}if(v>0){const N=(v-1)*x;for(let P=0;P<s;P++){const L=N+P,F=N+P+1,W=v*x+P,U=v*x+P+1;o.push(L,F,W),o.push(F,U,W)}}}this.setIndex(o),this.setAttribute("position",new _e(a,3)),this.setAttribute("normal",new _e(h,3)),this.setAttribute("uv",new _e(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Wa(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}}class Hn extends Fe{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,h=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:h};const l=this;s=Math.floor(s),r=Math.floor(r);const f=[],d=[],c=[],u=[];let p=0;const x=[],g=n/2;let m=0;v(),o===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(f),this.setAttribute("position",new _e(d,3)),this.setAttribute("normal",new _e(c,3)),this.setAttribute("uv",new _e(u,2));function v(){const S=new A,C=new A;let T=0;const _=(e-t)/n;for(let E=0;E<=r;E++){const N=[],P=E/r,L=P*(e-t)+t;for(let F=0;F<=s;F++){const W=F/s,U=W*h+a,G=Math.sin(U),w=Math.cos(U);C.x=L*G,C.y=-P*n+g,C.z=L*w,d.push(C.x,C.y,C.z),S.set(G,_,w).normalize(),c.push(S.x,S.y,S.z),u.push(W,1-P),N.push(p++)}x.push(N)}for(let E=0;E<s;E++)for(let N=0;N<r;N++){const P=x[N][E],L=x[N+1][E],F=x[N+1][E+1],W=x[N][E+1];(t>0||N!==0)&&(f.push(P,L,W),T+=3),(e>0||N!==r-1)&&(f.push(L,F,W),T+=3)}l.addGroup(m,T,0),m+=T}function b(S){const C=p,T=new St,_=new A;let E=0;const N=S===!0?t:e,P=S===!0?1:-1;for(let F=1;F<=s;F++)d.push(0,g*P,0),c.push(0,P,0),u.push(.5,.5),p++;const L=p;for(let F=0;F<=s;F++){const U=F/s*h+a,G=Math.cos(U),w=Math.sin(U);_.x=N*w,_.y=g*P,_.z=N*G,d.push(_.x,_.y,_.z),c.push(0,P,0),T.x=G*.5+.5,T.y=w*.5*P+.5,u.push(T.x,T.y),p++}for(let F=0;F<s;F++){const W=C+F,U=L+F;S===!0?f.push(U,U+1,W):f.push(U+1,U,W),E+=3}l.addGroup(m,E,S===!0?1:2),m+=E}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Hn(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class xi extends Hn{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new xi(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class zs extends Fe{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};const r=[],o=[];a(s),l(n),f(),this.setAttribute("position",new _e(r,3)),this.setAttribute("normal",new _e(r.slice(),3)),this.setAttribute("uv",new _e(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(v){const b=new A,S=new A,C=new A;for(let T=0;T<e.length;T+=3)u(e[T+0],b),u(e[T+1],S),u(e[T+2],C),h(b,S,C,v)}function h(v,b,S,C){const T=C+1,_=[];for(let E=0;E<=T;E++){_[E]=[];const N=v.clone().lerp(S,E/T),P=b.clone().lerp(S,E/T),L=T-E;for(let F=0;F<=L;F++)F===0&&E===T?_[E][F]=N:_[E][F]=N.clone().lerp(P,F/L)}for(let E=0;E<T;E++)for(let N=0;N<2*(T-E)-1;N++){const P=Math.floor(N/2);N%2===0?(c(_[E][P+1]),c(_[E+1][P]),c(_[E][P])):(c(_[E][P+1]),c(_[E+1][P+1]),c(_[E+1][P]))}}function l(v){const b=new A;for(let S=0;S<r.length;S+=3)b.x=r[S+0],b.y=r[S+1],b.z=r[S+2],b.normalize().multiplyScalar(v),r[S+0]=b.x,r[S+1]=b.y,r[S+2]=b.z}function f(){const v=new A;for(let b=0;b<r.length;b+=3){v.x=r[b+0],v.y=r[b+1],v.z=r[b+2];const S=g(v)/2/Math.PI+.5,C=m(v)/Math.PI+.5;o.push(S,1-C)}p(),d()}function d(){for(let v=0;v<o.length;v+=6){const b=o[v+0],S=o[v+2],C=o[v+4],T=Math.max(b,S,C),_=Math.min(b,S,C);T>.9&&_<.1&&(b<.2&&(o[v+0]+=1),S<.2&&(o[v+2]+=1),C<.2&&(o[v+4]+=1))}}function c(v){r.push(v.x,v.y,v.z)}function u(v,b){const S=v*3;b.x=t[S+0],b.y=t[S+1],b.z=t[S+2]}function p(){const v=new A,b=new A,S=new A,C=new A,T=new St,_=new St,E=new St;for(let N=0,P=0;N<r.length;N+=9,P+=6){v.set(r[N+0],r[N+1],r[N+2]),b.set(r[N+3],r[N+4],r[N+5]),S.set(r[N+6],r[N+7],r[N+8]),T.set(o[P+0],o[P+1]),_.set(o[P+2],o[P+3]),E.set(o[P+4],o[P+5]),C.copy(v).add(b).add(S).divideScalar(3);const L=g(C);x(T,P+0,v,L),x(_,P+2,b,L),x(E,P+4,S,L)}}function x(v,b,S,C){C<0&&v.x===1&&(o[b]=v.x-1),S.x===0&&S.z===0&&(o[b]=C/2/Math.PI+.5)}function g(v){return Math.atan2(v.z,-v.x)}function m(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new zs(t.vertices,t.indices,t.radius,t.detail)}}class Yn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Jt("Curve: .getPoint() not implemented.")}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){const n=this.getLengths();let s=0;const r=n.length;let o;e?o=e:o=t*n[r-1];let a=0,h=r-1,l;for(;a<=h;)if(s=Math.floor(a+(h-a)/2),l=n[s]-o,l<0)a=s+1;else if(l>0)h=s-1;else{h=s;break}if(s=h,n[s]===o)return s/(r-1);const f=n[s],c=n[s+1]-f,u=(o-f)/c;return(s+u)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),h=e||(o.isVector2?new St:new A);return h.copy(a).sub(o).normalize(),h}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){const n=new A,s=[],r=[],o=[],a=new A,h=new fe;for(let u=0;u<=t;u++){const p=u/t;s[u]=this.getTangentAt(p,new A)}r[0]=new A,o[0]=new A;let l=Number.MAX_VALUE;const f=Math.abs(s[0].x),d=Math.abs(s[0].y),c=Math.abs(s[0].z);f<=l&&(l=f,n.set(1,0,0)),d<=l&&(l=d,n.set(0,1,0)),c<=l&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let u=1;u<=t;u++){if(r[u]=r[u-1].clone(),o[u]=o[u-1].clone(),a.crossVectors(s[u-1],s[u]),a.length()>Number.EPSILON){a.normalize();const p=Math.acos(de(s[u-1].dot(s[u]),-1,1));r[u].applyMatrix4(h.makeRotationAxis(a,p))}o[u].crossVectors(s[u],r[u])}if(e===!0){let u=Math.acos(de(r[0].dot(r[t]),-1,1));u/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(u=-u);for(let p=1;p<=t;p++)r[p].applyMatrix4(h.makeRotationAxis(s[p],u*p)),o[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}}class Xa extends Yn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,h=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=h}getPoint(t,e=new St){const n=e,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+t*r;let h=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const f=Math.cos(this.aRotation),d=Math.sin(this.aRotation),c=h-this.aX,u=l-this.aY;h=c*f-u*d+this.aX,l=c*d+u*f+this.aY}return n.set(h,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class Rf extends Xa{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Ya(){let i=0,t=0,e=0,n=0;function s(r,o,a,h){i=r,t=a,e=-3*r+3*o-2*a-h,n=2*r-2*o+a+h}return{initCatmullRom:function(r,o,a,h,l){s(o,a,l*(a-r),l*(h-o))},initNonuniformCatmullRom:function(r,o,a,h,l,f,d){let c=(o-r)/l-(a-r)/(l+f)+(a-o)/f,u=(a-o)/f-(h-o)/(f+d)+(h-a)/d;c*=f,u*=f,s(o,a,c,u)},calc:function(r){const o=r*r,a=o*r;return i+t*r+e*o+n*a}}}const Hl=new A,Gl=new A,_o=new Ya,xo=new Ya,vo=new Ya;class Cf extends Yn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new A){const n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t;let a=Math.floor(o),h=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:h===0&&a===r-1&&(a=r-2,h=1);let l,f;this.closed||a>0?l=s[(a-1)%r]:(Gl.subVectors(s[0],s[1]).add(s[0]),l=Gl);const d=s[a%r],c=s[(a+1)%r];if(this.closed||a+2<r?f=s[(a+2)%r]:(Hl.subVectors(s[r-1],s[r-2]).add(s[r-1]),f=Hl),this.curveType==="centripetal"||this.curveType==="chordal"){const u=this.curveType==="chordal"?.5:.25;let p=Math.pow(l.distanceToSquared(d),u),x=Math.pow(d.distanceToSquared(c),u),g=Math.pow(c.distanceToSquared(f),u);x<1e-4&&(x=1),p<1e-4&&(p=x),g<1e-4&&(g=x),_o.initNonuniformCatmullRom(l.x,d.x,c.x,f.x,p,x,g),xo.initNonuniformCatmullRom(l.y,d.y,c.y,f.y,p,x,g),vo.initNonuniformCatmullRom(l.z,d.z,c.z,f.z,p,x,g)}else this.curveType==="catmullrom"&&(_o.initCatmullRom(l.x,d.x,c.x,f.x,this.tension),xo.initCatmullRom(l.y,d.y,c.y,f.y,this.tension),vo.initCatmullRom(l.z,d.z,c.z,f.z,this.tension));return n.set(_o.calc(h),xo.calc(h),vo.calc(h)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new A().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function kl(i,t,e,n,s){const r=(n-t)*.5,o=(s-e)*.5,a=i*i,h=i*a;return(2*e-2*n+r+o)*h+(-3*e+3*n-2*r-o)*a+r*i+e}function Pf(i,t){const e=1-i;return e*e*t}function Lf(i,t){return 2*(1-i)*i*t}function Df(i,t){return i*i*t}function As(i,t,e,n){return Pf(i,t)+Lf(i,e)+Df(i,n)}function Nf(i,t){const e=1-i;return e*e*e*t}function If(i,t){const e=1-i;return 3*e*e*i*t}function Uf(i,t){return 3*(1-i)*i*i*t}function Of(i,t){return i*i*i*t}function ws(i,t,e,n,s){return Nf(i,t)+If(i,e)+Uf(i,n)+Of(i,s)}class Mh extends Yn{constructor(t=new St,e=new St,n=new St,s=new St){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new St){const n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ws(t,s.x,r.x,o.x,a.x),ws(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Ff extends Yn{constructor(t=new A,e=new A,n=new A,s=new A){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new A){const n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ws(t,s.x,r.x,o.x,a.x),ws(t,s.y,r.y,o.y,a.y),ws(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Sh extends Yn{constructor(t=new St,e=new St){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new St){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new St){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Bf extends Yn{constructor(t=new A,e=new A){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new A){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new A){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class yh extends Yn{constructor(t=new St,e=new St,n=new St){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new St){const n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(As(t,s.x,r.x,o.x),As(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class zf extends Yn{constructor(t=new A,e=new A,n=new A){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new A){const n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(As(t,s.x,r.x,o.x),As(t,s.y,r.y,o.y),As(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Eh extends Yn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new St){const n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,h=s[o===0?o:o-1],l=s[o],f=s[o>s.length-2?s.length-1:o+1],d=s[o>s.length-3?s.length-1:o+2];return n.set(kl(a,h.x,l.x,f.x,d.x),kl(a,h.y,l.y,f.y,d.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new St().fromArray(s))}return this}}var xa=Object.freeze({__proto__:null,ArcCurve:Rf,CatmullRomCurve3:Cf,CubicBezierCurve:Mh,CubicBezierCurve3:Ff,EllipseCurve:Xa,LineCurve:Sh,LineCurve3:Bf,QuadraticBezierCurve:yh,QuadraticBezierCurve3:zf,SplineCurve:Eh});class Hf extends Yn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new xa[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const o=s[r]-n,a=this.curves[r],h=a.getLength(),l=h===0?0:1-o/h;return a.getPointAt(l,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,h=o.getPoints(a);for(let l=0;l<h.length;l++){const f=h[l];n&&n.equals(f)||(e.push(f),n=f)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this.cacheLengths=null,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(new xa[s.type]().fromJSON(s))}return this.cacheLengths=null,this}}class Vl extends Hf{constructor(t){super(),this.type="Path",this.currentPoint=new St,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new Sh(this.currentPoint.clone(),new St(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){const r=new yh(this.currentPoint.clone(),new St(t,e),new St(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){const a=new Mh(this.currentPoint.clone(),new St(t,e),new St(n,s),new St(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new Eh(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){const a=this.currentPoint.x,h=this.currentPoint.y;return this.absarc(t+a,e+h,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,h){const l=this.currentPoint.x,f=this.currentPoint.y;return this.absellipse(t+l,e+f,n,s,r,o,a,h),this}absellipse(t,e,n,s,r,o,a,h){const l=new Xa(t,e,n,s,r,o,a,h);if(this.curves.length>0){const d=l.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(l);const f=l.getPoint(1);return this.currentPoint.copy(f),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class bh extends Vl{constructor(t){super(t),this.uuid=cs(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(new Vl().fromJSON(s))}return this}}function Gf(i,t,e=2){const n=t&&t.length,s=n?t[0]*e:i.length;let r=Th(i,0,s,e,!0);const o=[];if(!r||r.next===r.prev)return o;let a,h,l;if(n&&(r=Yf(i,t,r,e)),i.length>80*e){a=i[0],h=i[1];let f=a,d=h;for(let c=e;c<s;c+=e){const u=i[c],p=i[c+1];u<a&&(a=u),p<h&&(h=p),u>f&&(f=u),p>d&&(d=p)}l=Math.max(f-a,d-h),l=l!==0?32767/l:0}return Is(r,o,e,a,h,l,0),o}function Th(i,t,e,n,s){let r;if(s===id(i,t,e,n)>0)for(let o=t;o<e;o+=n)r=Wl(o/n|0,i[o],i[o+1],r);else for(let o=e-n;o>=t;o-=n)r=Wl(o/n|0,i[o],i[o+1],r);return r&&os(r,r.next)&&(Os(r),r=r.next),r}function Pi(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(os(e,e.next)||Oe(e.prev,e,e.next)===0)){if(Os(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Is(i,t,e,n,s,r,o){if(!i)return;!o&&r&&$f(i,n,s,r);let a=i;for(;i.prev!==i.next;){const h=i.prev,l=i.next;if(r?Vf(i,n,s,r):kf(i)){t.push(h.i,i.i,l.i),Os(i),i=l.next,a=l.next;continue}if(i=l,i===a){o?o===1?(i=Wf(Pi(i),t),Is(i,t,e,n,s,r,2)):o===2&&Xf(i,t,e,n,s,r):Is(Pi(i),t,e,n,s,r,1);break}}}function kf(i){const t=i.prev,e=i,n=i.next;if(Oe(t,e,n)>=0)return!1;const s=t.x,r=e.x,o=n.x,a=t.y,h=e.y,l=n.y,f=Math.min(s,r,o),d=Math.min(a,h,l),c=Math.max(s,r,o),u=Math.max(a,h,l);let p=n.next;for(;p!==t;){if(p.x>=f&&p.x<=c&&p.y>=d&&p.y<=u&&vs(s,a,r,h,o,l,p.x,p.y)&&Oe(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function Vf(i,t,e,n){const s=i.prev,r=i,o=i.next;if(Oe(s,r,o)>=0)return!1;const a=s.x,h=r.x,l=o.x,f=s.y,d=r.y,c=o.y,u=Math.min(a,h,l),p=Math.min(f,d,c),x=Math.max(a,h,l),g=Math.max(f,d,c),m=va(u,p,t,e,n),v=va(x,g,t,e,n);let b=i.prevZ,S=i.nextZ;for(;b&&b.z>=m&&S&&S.z<=v;){if(b.x>=u&&b.x<=x&&b.y>=p&&b.y<=g&&b!==s&&b!==o&&vs(a,f,h,d,l,c,b.x,b.y)&&Oe(b.prev,b,b.next)>=0||(b=b.prevZ,S.x>=u&&S.x<=x&&S.y>=p&&S.y<=g&&S!==s&&S!==o&&vs(a,f,h,d,l,c,S.x,S.y)&&Oe(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;b&&b.z>=m;){if(b.x>=u&&b.x<=x&&b.y>=p&&b.y<=g&&b!==s&&b!==o&&vs(a,f,h,d,l,c,b.x,b.y)&&Oe(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;S&&S.z<=v;){if(S.x>=u&&S.x<=x&&S.y>=p&&S.y<=g&&S!==s&&S!==o&&vs(a,f,h,d,l,c,S.x,S.y)&&Oe(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function Wf(i,t){let e=i;do{const n=e.prev,s=e.next.next;!os(n,s)&&wh(n,e,e.next,s)&&Us(n,s)&&Us(s,n)&&(t.push(n.i,e.i,s.i),Os(e),Os(e.next),e=i=s),e=e.next}while(e!==i);return Pi(e)}function Xf(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&td(o,a)){let h=Rh(o,a);o=Pi(o,o.next),h=Pi(h,h.next),Is(o,t,e,n,s,r,0),Is(h,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Yf(i,t,e,n){const s=[];for(let r=0,o=t.length;r<o;r++){const a=t[r]*n,h=r<o-1?t[r+1]*n:i.length,l=Th(i,a,h,n,!1);l===l.next&&(l.steiner=!0),s.push(jf(l))}s.sort(qf);for(let r=0;r<s.length;r++)e=Zf(s[r],e);return e}function qf(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function Zf(i,t){const e=Kf(i,t);if(!e)return t;const n=Rh(e,i);return Pi(n,n.next),Pi(e,e.next)}function Kf(i,t){let e=t;const n=i.x,s=i.y;let r=-1/0,o;if(os(i,e))return e;do{if(os(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){const d=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=n&&d>r&&(r=d,o=e.x<e.next.x?e:e.next,d===n))return o}e=e.next}while(e!==t);if(!o)return null;const a=o,h=o.x,l=o.y;let f=1/0;e=o;do{if(n>=e.x&&e.x>=h&&n!==e.x&&Ah(s<l?n:r,s,h,l,s<l?r:n,s,e.x,e.y)){const d=Math.abs(s-e.y)/(n-e.x);Us(e,i)&&(d<f||d===f&&(e.x>o.x||e.x===o.x&&Jf(o,e)))&&(o=e,f=d)}e=e.next}while(e!==a);return o}function Jf(i,t){return Oe(i.prev,i,t.prev)<0&&Oe(t.next,i,i.next)<0}function $f(i,t,e,n){let s=i;do s.z===0&&(s.z=va(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Qf(s)}function Qf(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let o=n,a=0;for(let l=0;l<e&&(a++,o=o.nextZ,!!o);l++);let h=e;for(;a>0||h>0&&o;)a!==0&&(h===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,h--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,e*=2}while(t>1);return i}function va(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function jf(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Ah(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function vs(i,t,e,n,s,r,o,a){return!(i===o&&t===a)&&Ah(i,t,e,n,s,r,o,a)}function td(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!ed(i,t)&&(Us(i,t)&&Us(t,i)&&nd(i,t)&&(Oe(i.prev,i,t.prev)||Oe(i,t.prev,t))||os(i,t)&&Oe(i.prev,i,i.next)>0&&Oe(t.prev,t,t.next)>0)}function Oe(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function os(i,t){return i.x===t.x&&i.y===t.y}function wh(i,t,e,n){const s=cr(Oe(i,t,e)),r=cr(Oe(i,t,n)),o=cr(Oe(e,n,i)),a=cr(Oe(e,n,t));return!!(s!==r&&o!==a||s===0&&lr(i,e,t)||r===0&&lr(i,n,t)||o===0&&lr(e,i,n)||a===0&&lr(e,t,n))}function lr(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function cr(i){return i>0?1:i<0?-1:0}function ed(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&wh(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Us(i,t){return Oe(i.prev,i,i.next)<0?Oe(i,t,i.next)>=0&&Oe(i,i.prev,t)>=0:Oe(i,t,i.prev)<0||Oe(i,i.next,t)<0}function nd(i,t){let e=i,n=!1;const s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Rh(i,t){const e=Ma(i.i,i.x,i.y),n=Ma(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Wl(i,t,e,n){const s=Ma(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Os(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Ma(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function id(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}class sd{static triangulate(t,e,n=2){return Gf(t,e,n)}}class $i{static area(t){const e=t.length;let n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return $i.area(t)<0}static triangulateShape(t,e){const n=[],s=[],r=[];Xl(t),Yl(n,t);let o=t.length;e.forEach(Xl);for(let h=0;h<e.length;h++)s.push(o),o+=e[h].length,Yl(n,e[h]);const a=sd.triangulate(n,s);for(let h=0;h<a.length;h+=3)r.push(a.slice(h,h+3));return r}}function Xl(i){const t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function Yl(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}class qa extends Fe{constructor(t=new bh([new St(.5,.5),new St(-.5,.5),new St(-.5,-.5),new St(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,s=[],r=[];for(let a=0,h=t.length;a<h;a++){const l=t[a];o(l)}this.setAttribute("position",new _e(s,3)),this.setAttribute("uv",new _e(r,2)),this.computeVertexNormals();function o(a){const h=[],l=e.curveSegments!==void 0?e.curveSegments:12,f=e.steps!==void 0?e.steps:1,d=e.depth!==void 0?e.depth:1;let c=e.bevelEnabled!==void 0?e.bevelEnabled:!0,u=e.bevelThickness!==void 0?e.bevelThickness:.2,p=e.bevelSize!==void 0?e.bevelSize:u-.1,x=e.bevelOffset!==void 0?e.bevelOffset:0,g=e.bevelSegments!==void 0?e.bevelSegments:3;const m=e.extrudePath,v=e.UVGenerator!==void 0?e.UVGenerator:rd;let b,S=!1,C,T,_,E;if(m){b=m.getSpacedPoints(f),S=!0,c=!1;const it=m.isCatmullRomCurve3?m.closed:!1;C=m.computeFrenetFrames(f,it),T=new A,_=new A,E=new A}c||(g=0,u=0,p=0,x=0);const N=a.extractPoints(l);let P=N.shape;const L=N.holes;if(!$i.isClockWise(P)){P=P.reverse();for(let it=0,pt=L.length;it<pt;it++){const Et=L[it];$i.isClockWise(Et)&&(L[it]=Et.reverse())}}function W(it){const Et=10000000000000001e-36;let Bt=it[0];for(let Ct=1;Ct<=it.length;Ct++){const $t=Ct%it.length,Ht=it[$t],ee=Ht.x-Bt.x,le=Ht.y-Bt.y,ce=ee*ee+le*le,B=Math.max(Math.abs(Ht.x),Math.abs(Ht.y),Math.abs(Bt.x),Math.abs(Bt.y)),Le=Et*B*B;if(ce<=Le){it.splice($t,1),Ct--;continue}Bt=Ht}}W(P),L.forEach(W);const U=L.length,G=P;for(let it=0;it<U;it++){const pt=L[it];P=P.concat(pt)}function w(it,pt,Et){return pt||Ee("ExtrudeGeometry: vec does not exist"),it.clone().addScaledVector(pt,Et)}const I=P.length;function X(it,pt,Et){let Bt,Ct,$t;const Ht=it.x-pt.x,ee=it.y-pt.y,le=Et.x-it.x,ce=Et.y-it.y,B=Ht*Ht+ee*ee,Le=Ht*ce-ee*le;if(Math.abs(Le)>Number.EPSILON){const se=Math.sqrt(B),Te=Math.sqrt(le*le+ce*ce),q=pt.x-ee/se,at=pt.y+Ht/se,ot=Et.x-ce/Te,Dt=Et.y+le/Te,R=((ot-q)*ce-(Dt-at)*le)/(Ht*ce-ee*le);Bt=q+Ht*R-it.x,Ct=at+ee*R-it.y;const M=Bt*Bt+Ct*Ct;if(M<=2)return new St(Bt,Ct);$t=Math.sqrt(M/2)}else{let se=!1;Ht>Number.EPSILON?le>Number.EPSILON&&(se=!0):Ht<-Number.EPSILON?le<-Number.EPSILON&&(se=!0):Math.sign(ee)===Math.sign(ce)&&(se=!0),se?(Bt=-ee,Ct=Ht,$t=Math.sqrt(B)):(Bt=Ht,Ct=ee,$t=Math.sqrt(B/2))}return new St(Bt/$t,Ct/$t)}const H=[];for(let it=0,pt=G.length,Et=pt-1,Bt=it+1;it<pt;it++,Et++,Bt++)Et===pt&&(Et=0),Bt===pt&&(Bt=0),H[it]=X(G[it],G[Et],G[Bt]);const j=[];let et,mt=H.concat();for(let it=0,pt=U;it<pt;it++){const Et=L[it];et=[];for(let Bt=0,Ct=Et.length,$t=Ct-1,Ht=Bt+1;Bt<Ct;Bt++,$t++,Ht++)$t===Ct&&($t=0),Ht===Ct&&(Ht=0),et[Bt]=X(Et[Bt],Et[$t],Et[Ht]);j.push(et),mt=mt.concat(et)}let It;if(g===0)It=$i.triangulateShape(G,L);else{const it=[],pt=[];for(let Et=0;Et<g;Et++){const Bt=Et/g,Ct=u*Math.cos(Bt*Math.PI/2),$t=p*Math.sin(Bt*Math.PI/2)+x;for(let Ht=0,ee=G.length;Ht<ee;Ht++){const le=w(G[Ht],H[Ht],$t);At(le.x,le.y,-Ct),Bt===0&&it.push(le)}for(let Ht=0,ee=U;Ht<ee;Ht++){const le=L[Ht];et=j[Ht];const ce=[];for(let B=0,Le=le.length;B<Le;B++){const se=w(le[B],et[B],$t);At(se.x,se.y,-Ct),Bt===0&&ce.push(se)}Bt===0&&pt.push(ce)}}It=$i.triangulateShape(it,pt)}const K=It.length,st=p+x;for(let it=0;it<I;it++){const pt=c?w(P[it],mt[it],st):P[it];S?(_.copy(C.normals[0]).multiplyScalar(pt.x),T.copy(C.binormals[0]).multiplyScalar(pt.y),E.copy(b[0]).add(_).add(T),At(E.x,E.y,E.z)):At(pt.x,pt.y,0)}for(let it=1;it<=f;it++)for(let pt=0;pt<I;pt++){const Et=c?w(P[pt],mt[pt],st):P[pt];S?(_.copy(C.normals[it]).multiplyScalar(Et.x),T.copy(C.binormals[it]).multiplyScalar(Et.y),E.copy(b[it]).add(_).add(T),At(E.x,E.y,E.z)):At(Et.x,Et.y,d/f*it)}for(let it=g-1;it>=0;it--){const pt=it/g,Et=u*Math.cos(pt*Math.PI/2),Bt=p*Math.sin(pt*Math.PI/2)+x;for(let Ct=0,$t=G.length;Ct<$t;Ct++){const Ht=w(G[Ct],H[Ct],Bt);At(Ht.x,Ht.y,d+Et)}for(let Ct=0,$t=L.length;Ct<$t;Ct++){const Ht=L[Ct];et=j[Ct];for(let ee=0,le=Ht.length;ee<le;ee++){const ce=w(Ht[ee],et[ee],Bt);S?At(ce.x,ce.y+b[f-1].y,b[f-1].x+Et):At(ce.x,ce.y,d+Et)}}}xt(),Rt();function xt(){const it=s.length/3;if(c){let pt=0,Et=I*pt;for(let Bt=0;Bt<K;Bt++){const Ct=It[Bt];Kt(Ct[2]+Et,Ct[1]+Et,Ct[0]+Et)}pt=f+g*2,Et=I*pt;for(let Bt=0;Bt<K;Bt++){const Ct=It[Bt];Kt(Ct[0]+Et,Ct[1]+Et,Ct[2]+Et)}}else{for(let pt=0;pt<K;pt++){const Et=It[pt];Kt(Et[2],Et[1],Et[0])}for(let pt=0;pt<K;pt++){const Et=It[pt];Kt(Et[0]+I*f,Et[1]+I*f,Et[2]+I*f)}}n.addGroup(it,s.length/3-it,0)}function Rt(){const it=s.length/3;let pt=0;gt(G,pt),pt+=G.length;for(let Et=0,Bt=L.length;Et<Bt;Et++){const Ct=L[Et];gt(Ct,pt),pt+=Ct.length}n.addGroup(it,s.length/3-it,1)}function gt(it,pt){let Et=it.length;for(;--Et>=0;){const Bt=Et;let Ct=Et-1;Ct<0&&(Ct=it.length-1);for(let $t=0,Ht=f+g*2;$t<Ht;$t++){const ee=I*$t,le=I*($t+1),ce=pt+Bt+ee,B=pt+Ct+ee,Le=pt+Ct+le,se=pt+Bt+le;yt(ce,B,Le,se)}}}function At(it,pt,Et){h.push(it),h.push(pt),h.push(Et)}function Kt(it,pt,Et){qt(it),qt(pt),qt(Et);const Bt=s.length/3,Ct=v.generateTopUV(n,s,Bt-3,Bt-2,Bt-1);Xt(Ct[0]),Xt(Ct[1]),Xt(Ct[2])}function yt(it,pt,Et,Bt){qt(it),qt(pt),qt(Bt),qt(pt),qt(Et),qt(Bt);const Ct=s.length/3,$t=v.generateSideWallUV(n,s,Ct-6,Ct-3,Ct-2,Ct-1);Xt($t[0]),Xt($t[1]),Xt($t[3]),Xt($t[1]),Xt($t[2]),Xt($t[3])}function qt(it){s.push(h[it*3+0]),s.push(h[it*3+1]),s.push(h[it*3+2])}function Xt(it){r.push(it.x),r.push(it.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return od(e,n,t)}static fromJSON(t,e){const n=[];for(let r=0,o=t.shapes.length;r<o;r++){const a=e[t.shapes[r]];n.push(a)}const s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new xa[s.type]().fromJSON(s)),new qa(n,t.options)}}const rd={generateTopUV:function(i,t,e,n,s){const r=t[e*3],o=t[e*3+1],a=t[n*3],h=t[n*3+1],l=t[s*3],f=t[s*3+1];return[new St(r,o),new St(a,h),new St(l,f)]},generateSideWallUV:function(i,t,e,n,s,r){const o=t[e*3],a=t[e*3+1],h=t[e*3+2],l=t[n*3],f=t[n*3+1],d=t[n*3+2],c=t[s*3],u=t[s*3+1],p=t[s*3+2],x=t[r*3],g=t[r*3+1],m=t[r*3+2];return Math.abs(a-f)<Math.abs(o-l)?[new St(o,1-h),new St(l,1-d),new St(c,1-p),new St(x,1-m)]:[new St(a,1-h),new St(f,1-d),new St(u,1-p),new St(g,1-m)]}};function od(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class Za extends zs{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Za(t.radius,t.detail)}}class Ka extends zs{constructor(t=1,e=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Ka(t.radius,t.detail)}}class Br extends Fe{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(n),h=Math.floor(s),l=a+1,f=h+1,d=t/a,c=e/h,u=[],p=[],x=[],g=[];for(let m=0;m<f;m++){const v=m*c-o;for(let b=0;b<l;b++){const S=b*d-r;p.push(S,-v,0),x.push(0,0,1),g.push(b/a),g.push(1-m/h)}}for(let m=0;m<h;m++)for(let v=0;v<a;v++){const b=v+l*m,S=v+l*(m+1),C=v+1+l*(m+1),T=v+1+l*m;u.push(b,S,T),u.push(S,C,T)}this.setIndex(u),this.setAttribute("position",new _e(p,3)),this.setAttribute("normal",new _e(x,3)),this.setAttribute("uv",new _e(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Br(t.width,t.height,t.widthSegments,t.heightSegments)}}class Ja extends Fe{constructor(t=.5,e=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],h=[],l=[],f=[];let d=t;const c=(e-t)/s,u=new A,p=new St;for(let x=0;x<=s;x++){for(let g=0;g<=n;g++){const m=r+g/n*o;u.x=d*Math.cos(m),u.y=d*Math.sin(m),h.push(u.x,u.y,u.z),l.push(0,0,1),p.x=(u.x/e+1)/2,p.y=(u.y/e+1)/2,f.push(p.x,p.y)}d+=c}for(let x=0;x<s;x++){const g=x*(n+1);for(let m=0;m<n;m++){const v=m+g,b=v,S=v+n+1,C=v+n+2,T=v+1;a.push(b,S,T),a.push(S,C,T)}}this.setIndex(a),this.setAttribute("position",new _e(h,3)),this.setAttribute("normal",new _e(l,3)),this.setAttribute("uv",new _e(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ja(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class Gn extends Fe{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const h=Math.min(o+a,Math.PI);let l=0;const f=[],d=new A,c=new A,u=[],p=[],x=[],g=[];for(let m=0;m<=n;m++){const v=[],b=m/n,S=o+b*a,C=t*Math.cos(S),T=Math.sqrt(t*t-C*C);let _=0;m===0&&o===0?_=.5/e:m===n&&h===Math.PI&&(_=-.5/e);for(let E=0;E<=e;E++){const N=E/e,P=s+N*r;d.x=-T*Math.cos(P),d.y=C,d.z=T*Math.sin(P),p.push(d.x,d.y,d.z),c.copy(d).normalize(),x.push(c.x,c.y,c.z),g.push(N+_,1-b),v.push(l++)}f.push(v)}for(let m=0;m<n;m++)for(let v=0;v<e;v++){const b=f[m][v+1],S=f[m][v],C=f[m+1][v],T=f[m+1][v+1];(m!==0||o>0)&&u.push(b,S,T),(m!==n-1||h<Math.PI)&&u.push(S,C,T)}this.setIndex(u),this.setAttribute("position",new _e(p,3)),this.setAttribute("normal",new _e(x,3)),this.setAttribute("uv",new _e(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Gn(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class $a extends zs{constructor(t=1,e=0){const n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],s=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,s,t,e),this.type="TetrahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new $a(t.radius,t.detail)}}class ei extends Fe{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),s=Math.floor(s);const h=[],l=[],f=[],d=[],c=new A,u=new A,p=new A;for(let x=0;x<=n;x++){const g=o+x/n*a;for(let m=0;m<=s;m++){const v=m/s*r;u.x=(t+e*Math.cos(g))*Math.cos(v),u.y=(t+e*Math.cos(g))*Math.sin(v),u.z=e*Math.sin(g),l.push(u.x,u.y,u.z),c.x=t*Math.cos(v),c.y=t*Math.sin(v),p.subVectors(u,c).normalize(),f.push(p.x,p.y,p.z),d.push(m/s),d.push(x/n)}}for(let x=1;x<=n;x++)for(let g=1;g<=s;g++){const m=(s+1)*x+g-1,v=(s+1)*(x-1)+g-1,b=(s+1)*(x-1)+g,S=(s+1)*x+g;h.push(m,v,S),h.push(v,b,S)}this.setIndex(h),this.setAttribute("position",new _e(l,3)),this.setAttribute("normal",new _e(f,3)),this.setAttribute("uv",new _e(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ei(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}}function as(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];if(ql(s))s.isRenderTargetTexture?(Jt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(ql(s[0])){const r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function an(i){const t={};for(let e=0;e<i.length;e++){const n=as(i[e]);for(const s in n)t[s]=n[s]}return t}function ql(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function ad(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Ch(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Me.workingColorSpace}const ld={clone:as,merge:an};var cd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,hd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Li extends hs{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=cd,this.fragmentShader=hd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=as(t.uniforms),this.uniformsGroups=ad(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(const n in t.uniforms){const s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new pe().setHex(s.value);break;case"v2":this.uniforms[n].value=new St().fromArray(s.value);break;case"v3":this.uniforms[n].value=new A().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Ue().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ie().fromArray(s.value);break;case"m4":this.uniforms[n].value=new fe().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(const n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}}class ud extends Li{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Mo extends hs{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new pe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new pe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ga,this.normalScale=new St(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ge,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class fd extends hs{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=zu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class dd extends hs{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class Ph extends Xe{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new pe(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}}class pd extends Ph{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Xe.DEFAULT_UP),this.updateMatrix(),this.groundColor=new pe(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){const e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}}const So=new fe,Zl=new A,Kl=new A;class md{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new St(512,512),this.mapType=gn,this.map=null,this.mapPass=null,this.matrix=new fe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ns,this._frameExtents=new St(1,1),this._viewportCount=1,this._viewports=[new Ue(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera;Zl.setFromMatrixPosition(t.matrixWorld),e.position.copy(Zl),Kl.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Kl),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){So.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(So,t.coordinateSystem,t.reversedDepth);const r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,h=s?s.x/r.x:0,l=s?s.y/r.y:0;t.coordinateSystem===Ds||t.reversedDepth?e.set(.5*o,0,0,.5*o+h,0,.5*a,0,.5*a+l,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+h,0,.5*a,0,.5*a+l,0,0,.5,.5,0,0,0,1),e.multiply(So)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const hr=new A,ur=new He,Dn=new A;class Lh extends Xe{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new fe,this.projectionMatrix=new fe,this.projectionMatrixInverse=new fe,this.coordinateSystem=Rn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(hr,ur,Dn),Dn.x===1&&Dn.y===1&&Dn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(hr,ur,Dn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(hr,ur,Dn),Dn.x===1&&Dn.y===1&&Dn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(hr,ur,Dn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const di=new A,Jl=new St,$l=new St;class Mn extends Lh{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=_a*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(yr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return _a*2*Math.atan(Math.tan(yr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){di.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(di.x,di.y).multiplyScalar(-t/di.z),di.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(di.x,di.y).multiplyScalar(-t/di.z)}getViewSize(t,e){return this.getViewBounds(t,Jl,$l),e.subVectors($l,Jl)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(yr*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const h=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/h,e-=o.offsetY*n/l,s*=o.width/h,n*=o.height/l}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}class Dh extends Lh{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=s+e,h=s-e;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=f*this.view.offsetY,h=a-f*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,h,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class gd extends md{constructor(){super(new Dh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class _d extends Ph{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Xe.DEFAULT_UP),this.updateMatrix(),this.target=new Xe,this.shadow=new gd}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){const e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}}const Wi=-90,Xi=1;class Sa extends Xe{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Mn(Wi,Xi,t,e);s.layers=this.layers,this.add(s);const r=new Mn(Wi,Xi,t,e);r.layers=this.layers,this.add(r);const o=new Mn(Wi,Xi,t,e);o.layers=this.layers,this.add(o);const a=new Mn(Wi,Xi,t,e);a.layers=this.layers,this.add(a);const h=new Mn(Wi,Xi,t,e);h.layers=this.layers,this.add(h);const l=new Mn(Wi,Xi,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,h]=e;for(const l of e)this.remove(l);if(t===Rn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),h.up.set(0,1,0),h.lookAt(0,0,-1);else if(t===Ds)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),h.up.set(0,-1,0),h.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,h,l,f]=this.children,d=t.getRenderTarget(),c=t.getActiveCubeFace(),u=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;const x=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let g=!1;t.isWebGLRenderer===!0?g=t.state.buffers.depth.getReversed():g=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(n,4,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),n.texture.mipmapsAutoUpdate=x,t.setRenderTarget(n,5,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,f),t.setRenderTarget(d,c,u),t.xr.enabled=p,n.texture.needsPMREMUpdate=!0}}class xd extends Mn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}}const Ql=new fe;class Nr{constructor(t,e,n=0,s=1/0){this.ray=new Bs(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new Ga,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Ee("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Ql.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ql),this}intersectObject(t,e=!0,n=[]){return ya(t,this,n,e),n.sort(jl),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)ya(t[s],this,n,e);return n.sort(jl),n}}function jl(i,t){return i.distance-t.distance}function ya(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)ya(r[o],t,e,!0)}}class tc{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=de(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(de(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class vd extends Si{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}}function ec(i,t,e,n){const s=Md(n);switch(e){case sh:return i*t;case oh:return i*t/s.components*s.byteLength;case Oa:return i*t/s.components*s.byteLength;case Ci:return i*t*2/s.components*s.byteLength;case Fa:return i*t*2/s.components*s.byteLength;case rh:return i*t*3/s.components*s.byteLength;case zn:return i*t*4/s.components*s.byteLength;case Ba:return i*t*4/s.components*s.byteLength;case _r:case xr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case vr:case Mr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Go:case Vo:return Math.max(i,16)*Math.max(t,8)/4;case Ho:case ko:return Math.max(i,8)*Math.max(t,8)/2;case Wo:case Xo:case qo:case Zo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Yo:case Ar:case Ko:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Jo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case $o:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Qo:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case jo:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case ta:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case ea:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case na:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case ia:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case sa:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case ra:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case oa:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case aa:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case la:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case ca:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case ha:case ua:case fa:return Math.ceil(i/4)*Math.ceil(t/4)*16;case da:case pa:return Math.ceil(i/4)*Math.ceil(t/4)*8;case wr:case ma:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Md(i){switch(i){case gn:case th:return{byteLength:1,components:1};case Ls:case eh:case Xn:return{byteLength:2,components:1};case Ia:case Ua:return{byteLength:2,components:4};case Wn:case Na:case Bn:return{byteLength:4,components:1};case nh:case ih:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Da}}));typeof window<"u"&&(window.__THREE__?Jt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Da);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Nh(){let i=null,t=!1,e=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),e(r,o)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Sd(i){const t=new WeakMap;function e(a,h){const l=a.array,f=a.usage,d=l.byteLength,c=i.createBuffer();i.bindBuffer(h,c),i.bufferData(h,l,f),a.onUploadCallback();let u;if(l instanceof Float32Array)u=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)u=i.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?u=i.HALF_FLOAT:u=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)u=i.SHORT;else if(l instanceof Uint32Array)u=i.UNSIGNED_INT;else if(l instanceof Int32Array)u=i.INT;else if(l instanceof Int8Array)u=i.BYTE;else if(l instanceof Uint8Array)u=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)u=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:c,type:u,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,h,l){const f=h.array,d=h.updateRanges;if(i.bindBuffer(l,a),d.length===0)i.bufferSubData(l,0,f);else{d.sort((u,p)=>u.start-p.start);let c=0;for(let u=1;u<d.length;u++){const p=d[c],x=d[u];x.start<=p.start+p.count+1?p.count=Math.max(p.count,x.start+x.count-p.start):(++c,d[c]=x)}d.length=c+1;for(let u=0,p=d.length;u<p;u++){const x=d[u];i.bufferSubData(l,x.start*f.BYTES_PER_ELEMENT,f,x.start,x.count)}h.clearUpdateRanges()}h.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const h=t.get(a);h&&(i.deleteBuffer(h.buffer),t.delete(a))}function o(a,h){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const f=t.get(a);(!f||f.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=t.get(a);if(l===void 0)t.set(a,e(a,h));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,h),l.version=a.version}}return{get:s,remove:r,update:o}}var yd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ed=`#ifdef USE_ALPHAHASH
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
#endif`,bd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Td=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ad=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,wd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Rd=`#ifdef USE_AOMAP
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
#endif`,Cd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Pd=`#ifdef USE_BATCHING
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
#endif`,Ld=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Dd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Nd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Id=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Ud=`#ifdef USE_IRIDESCENCE
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
#endif`,Od=`#ifdef USE_BUMPMAP
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
#endif`,Fd=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Bd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,zd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Hd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Gd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,kd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Vd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Wd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Xd=`#define PI 3.141592653589793
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
} // validated`,Yd=`vec3 transformedNormal = objectNormal;
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
#endif`,qd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Zd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Kd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Jd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,$d="gl_FragColor = linearToOutputTexel( gl_FragColor );",Qd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,jd=`#ifdef USE_ENVMAP
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
#endif`,tp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,ep=`#ifdef USE_ENVMAP
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
#endif`,np=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ip=`#ifdef USE_ENVMAP
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
#endif`,sp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,rp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,op=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ap=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,lp=`#ifdef USE_GRADIENTMAP
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
}`,cp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,hp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,up=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,fp=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,dp=`#ifdef USE_ENVMAP
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
#endif`,pp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,mp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,gp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,_p=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,xp=`PhysicalMaterial material;
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
#endif`,vp=`uniform sampler2D dfgLUT;
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
}`,Mp=`
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
#endif`,Sp=`#if defined( RE_IndirectDiffuse )
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
#endif`,yp=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ep=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,bp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Tp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ap=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,wp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Rp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Cp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Pp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Lp=`#if defined( USE_POINTS_UV )
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
#endif`,Dp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Np=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ip=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Up=`#if defined( USE_MORPHCOLORS )
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
#endif`,Op=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fp=`#ifdef USE_MORPHTARGETS
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
#endif`,Bp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,zp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Hp=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Gp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,kp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Wp=`#ifdef USE_NORMALMAP
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
#endif`,Xp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Yp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,qp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Zp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Kp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Jp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,$p=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Qp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,jp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,tm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,em=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,nm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,im=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,sm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,rm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,om=`float getShadowMask() {
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
}`,am=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,lm=`#ifdef USE_SKINNING
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
#endif`,cm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,hm=`#ifdef USE_SKINNING
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
#endif`,um=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,fm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,dm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,pm=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,mm=`#ifdef USE_TRANSMISSION
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
#endif`,gm=`#ifdef USE_TRANSMISSION
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
#endif`,_m=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,xm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,vm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Mm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Sm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ym=`uniform sampler2D t2D;
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
}`,Em=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bm=`uniform float backgroundBlurriness;
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
}`,Tm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Am=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wm=`#include <common>
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
}`,Rm=`#if DEPTH_PACKING == 3200
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
}`,Cm=`#define DISTANCE
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
}`,Pm=`#define DISTANCE
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
}`,Lm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Dm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Nm=`uniform float scale;
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
}`,Im=`uniform vec3 diffuse;
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
}`,Um=`#include <common>
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
}`,Om=`uniform vec3 diffuse;
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
}`,Fm=`#define LAMBERT
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
}`,Bm=`#define LAMBERT
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
}`,zm=`#define MATCAP
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
}`,Hm=`#define MATCAP
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
}`,Gm=`#define NORMAL
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
}`,km=`#define NORMAL
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
}`,Vm=`#define PHONG
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
}`,Wm=`#define PHONG
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
}`,Xm=`#define STANDARD
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
}`,Ym=`#define STANDARD
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
}`,qm=`#define TOON
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
}`,Zm=`#define TOON
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
}`,Km=`uniform float size;
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
}`,Jm=`uniform vec3 diffuse;
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
}`,$m=`#include <common>
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
}`,Qm=`uniform vec3 color;
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
}`,jm=`uniform float rotation;
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
}`,t0=`uniform vec3 diffuse;
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
}`,ue={alphahash_fragment:yd,alphahash_pars_fragment:Ed,alphamap_fragment:bd,alphamap_pars_fragment:Td,alphatest_fragment:Ad,alphatest_pars_fragment:wd,aomap_fragment:Rd,aomap_pars_fragment:Cd,batching_pars_vertex:Pd,batching_vertex:Ld,begin_vertex:Dd,beginnormal_vertex:Nd,bsdfs:Id,iridescence_fragment:Ud,bumpmap_pars_fragment:Od,clipping_planes_fragment:Fd,clipping_planes_pars_fragment:Bd,clipping_planes_pars_vertex:zd,clipping_planes_vertex:Hd,color_fragment:Gd,color_pars_fragment:kd,color_pars_vertex:Vd,color_vertex:Wd,common:Xd,defaultnormal_vertex:Yd,displacementmap_pars_vertex:qd,displacementmap_vertex:Zd,emissivemap_fragment:Kd,emissivemap_pars_fragment:Jd,colorspace_fragment:$d,colorspace_pars_fragment:Qd,envmap_fragment:jd,envmap_common_pars_fragment:tp,envmap_pars_fragment:ep,envmap_pars_vertex:np,envmap_physical_pars_fragment:dp,envmap_vertex:ip,fog_vertex:sp,fog_pars_vertex:rp,fog_fragment:op,fog_pars_fragment:ap,gradientmap_pars_fragment:lp,lightmap_pars_fragment:cp,lights_lambert_fragment:hp,lights_lambert_pars_fragment:up,lights_pars_begin:fp,lights_toon_fragment:pp,lights_toon_pars_fragment:mp,lights_phong_fragment:gp,lights_phong_pars_fragment:_p,lights_physical_fragment:xp,lights_physical_pars_fragment:vp,lights_fragment_begin:Mp,lights_fragment_maps:Sp,lights_fragment_end:yp,lightprobes_pars_fragment:Ep,logdepthbuf_fragment:bp,logdepthbuf_pars_fragment:Tp,logdepthbuf_pars_vertex:Ap,logdepthbuf_vertex:wp,map_fragment:Rp,map_pars_fragment:Cp,map_particle_fragment:Pp,map_particle_pars_fragment:Lp,metalnessmap_fragment:Dp,metalnessmap_pars_fragment:Np,morphinstance_vertex:Ip,morphcolor_vertex:Up,morphnormal_vertex:Op,morphtarget_pars_vertex:Fp,morphtarget_vertex:Bp,normal_fragment_begin:zp,normal_fragment_maps:Hp,normal_pars_fragment:Gp,normal_pars_vertex:kp,normal_vertex:Vp,normalmap_pars_fragment:Wp,clearcoat_normal_fragment_begin:Xp,clearcoat_normal_fragment_maps:Yp,clearcoat_pars_fragment:qp,iridescence_pars_fragment:Zp,opaque_fragment:Kp,packing:Jp,premultiplied_alpha_fragment:$p,project_vertex:Qp,dithering_fragment:jp,dithering_pars_fragment:tm,roughnessmap_fragment:em,roughnessmap_pars_fragment:nm,shadowmap_pars_fragment:im,shadowmap_pars_vertex:sm,shadowmap_vertex:rm,shadowmask_pars_fragment:om,skinbase_vertex:am,skinning_pars_vertex:lm,skinning_vertex:cm,skinnormal_vertex:hm,specularmap_fragment:um,specularmap_pars_fragment:fm,tonemapping_fragment:dm,tonemapping_pars_fragment:pm,transmission_fragment:mm,transmission_pars_fragment:gm,uv_pars_fragment:_m,uv_pars_vertex:xm,uv_vertex:vm,worldpos_vertex:Mm,background_vert:Sm,background_frag:ym,backgroundCube_vert:Em,backgroundCube_frag:bm,cube_vert:Tm,cube_frag:Am,depth_vert:wm,depth_frag:Rm,distance_vert:Cm,distance_frag:Pm,equirect_vert:Lm,equirect_frag:Dm,linedashed_vert:Nm,linedashed_frag:Im,meshbasic_vert:Um,meshbasic_frag:Om,meshlambert_vert:Fm,meshlambert_frag:Bm,meshmatcap_vert:zm,meshmatcap_frag:Hm,meshnormal_vert:Gm,meshnormal_frag:km,meshphong_vert:Vm,meshphong_frag:Wm,meshphysical_vert:Xm,meshphysical_frag:Ym,meshtoon_vert:qm,meshtoon_frag:Zm,points_vert:Km,points_frag:Jm,shadow_vert:$m,shadow_frag:Qm,sprite_vert:jm,sprite_frag:t0},Lt={common:{diffuse:{value:new pe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ie},alphaMap:{value:null},alphaMapTransform:{value:new ie},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ie}},envmap:{envMap:{value:null},envMapRotation:{value:new ie},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ie}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ie}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ie},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ie},normalScale:{value:new St(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ie},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ie}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ie}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ie}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new pe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new pe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ie},alphaTest:{value:0},uvTransform:{value:new ie}},sprite:{diffuse:{value:new pe(16777215)},opacity:{value:1},center:{value:new St(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ie},alphaMap:{value:null},alphaMapTransform:{value:new ie},alphaTest:{value:0}}},On={basic:{uniforms:an([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.fog]),vertexShader:ue.meshbasic_vert,fragmentShader:ue.meshbasic_frag},lambert:{uniforms:an([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new pe(0)},envMapIntensity:{value:1}}]),vertexShader:ue.meshlambert_vert,fragmentShader:ue.meshlambert_frag},phong:{uniforms:an([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new pe(0)},specular:{value:new pe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ue.meshphong_vert,fragmentShader:ue.meshphong_frag},standard:{uniforms:an([Lt.common,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.roughnessmap,Lt.metalnessmap,Lt.fog,Lt.lights,{emissive:{value:new pe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ue.meshphysical_vert,fragmentShader:ue.meshphysical_frag},toon:{uniforms:an([Lt.common,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.gradientmap,Lt.fog,Lt.lights,{emissive:{value:new pe(0)}}]),vertexShader:ue.meshtoon_vert,fragmentShader:ue.meshtoon_frag},matcap:{uniforms:an([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,{matcap:{value:null}}]),vertexShader:ue.meshmatcap_vert,fragmentShader:ue.meshmatcap_frag},points:{uniforms:an([Lt.points,Lt.fog]),vertexShader:ue.points_vert,fragmentShader:ue.points_frag},dashed:{uniforms:an([Lt.common,Lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ue.linedashed_vert,fragmentShader:ue.linedashed_frag},depth:{uniforms:an([Lt.common,Lt.displacementmap]),vertexShader:ue.depth_vert,fragmentShader:ue.depth_frag},normal:{uniforms:an([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,{opacity:{value:1}}]),vertexShader:ue.meshnormal_vert,fragmentShader:ue.meshnormal_frag},sprite:{uniforms:an([Lt.sprite,Lt.fog]),vertexShader:ue.sprite_vert,fragmentShader:ue.sprite_frag},background:{uniforms:{uvTransform:{value:new ie},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ue.background_vert,fragmentShader:ue.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ie}},vertexShader:ue.backgroundCube_vert,fragmentShader:ue.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ue.cube_vert,fragmentShader:ue.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ue.equirect_vert,fragmentShader:ue.equirect_frag},distance:{uniforms:an([Lt.common,Lt.displacementmap,{referencePosition:{value:new A},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ue.distance_vert,fragmentShader:ue.distance_frag},shadow:{uniforms:an([Lt.lights,Lt.fog,{color:{value:new pe(0)},opacity:{value:1}}]),vertexShader:ue.shadow_vert,fragmentShader:ue.shadow_frag}};On.physical={uniforms:an([On.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ie},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ie},clearcoatNormalScale:{value:new St(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ie},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new ie},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ie},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ie},sheen:{value:0},sheenColor:{value:new pe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ie},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ie},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ie},transmissionSamplerSize:{value:new St},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ie},attenuationDistance:{value:0},attenuationColor:{value:new pe(0)},specularColor:{value:new pe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ie},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ie},anisotropyVector:{value:new St},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ie}}]),vertexShader:ue.meshphysical_vert,fragmentShader:ue.meshphysical_frag};const fr={r:0,b:0,g:0},e0=new fe,Ih=new ie;Ih.set(-1,0,0,0,1,0,0,0,1);function n0(i,t,e,n,s,r){const o=new pe(0);let a=s===!0?0:1,h,l,f=null,d=0,c=null;function u(v){let b=v.isScene===!0?v.background:null;if(b&&b.isTexture){const S=v.backgroundBlurriness>0;b=t.get(b,S)}return b}function p(v){let b=!1;const S=u(v);S===null?g(o,a):S&&S.isColor&&(g(S,1),b=!0);const C=i.xr.getEnvironmentBlendMode();C==="additive"?e.buffers.color.setClear(0,0,0,1,r):C==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||b)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(v,b){const S=u(b);S&&S.isCubeTexture?(l===void 0&&(l=new _n(new Di(1,1,1),new Li({name:"BackgroundCubeMaterial",uniforms:as(On.backgroundCube.uniforms),vertexShader:On.backgroundCube.vertexShader,fragmentShader:On.backgroundCube.fragmentShader,side:dn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(C,T,_){this.matrixWorld.copyPosition(_.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=S,l.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(e0.makeRotationFromEuler(b.backgroundRotation)).transpose(),S.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Ih),l.material.toneMapped=Me.getTransfer(S.colorSpace)!==Ae,(f!==S||d!==S.version||c!==i.toneMapping)&&(l.material.needsUpdate=!0,f=S,d=S.version,c=i.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null)):S&&S.isTexture&&(h===void 0&&(h=new _n(new Br(2,2),new Li({name:"BackgroundMaterial",uniforms:as(On.background.uniforms),vertexShader:On.background.vertexShader,fragmentShader:On.background.fragmentShader,side:Ri,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),Object.defineProperty(h.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(h)),h.material.uniforms.t2D.value=S,h.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,h.material.toneMapped=Me.getTransfer(S.colorSpace)!==Ae,S.matrixAutoUpdate===!0&&S.updateMatrix(),h.material.uniforms.uvTransform.value.copy(S.matrix),(f!==S||d!==S.version||c!==i.toneMapping)&&(h.material.needsUpdate=!0,f=S,d=S.version,c=i.toneMapping),h.layers.enableAll(),v.unshift(h,h.geometry,h.material,0,0,null))}function g(v,b){v.getRGB(fr,Ch(i)),e.buffers.color.setClear(fr.r,fr.g,fr.b,b,r)}function m(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0)}return{getClearColor:function(){return o},setClearColor:function(v,b=1){o.set(v),a=b,g(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(v){a=v,g(o,a)},render:p,addToRenderList:x,dispose:m}}function i0(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=c(null);let r=s,o=!1;function a(L,F,W,U,G){let w=!1;const I=d(L,U,W,F);r!==I&&(r=I,l(r.object)),w=u(L,U,W,G),w&&p(L,U,W,G),G!==null&&t.update(G,i.ELEMENT_ARRAY_BUFFER),(w||o)&&(o=!1,S(L,F,W,U),G!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(G).buffer))}function h(){return i.createVertexArray()}function l(L){return i.bindVertexArray(L)}function f(L){return i.deleteVertexArray(L)}function d(L,F,W,U){const G=U.wireframe===!0;let w=n[F.id];w===void 0&&(w={},n[F.id]=w);const I=L.isInstancedMesh===!0?L.id:0;let X=w[I];X===void 0&&(X={},w[I]=X);let H=X[W.id];H===void 0&&(H={},X[W.id]=H);let j=H[G];return j===void 0&&(j=c(h()),H[G]=j),j}function c(L){const F=[],W=[],U=[];for(let G=0;G<e;G++)F[G]=0,W[G]=0,U[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:W,attributeDivisors:U,object:L,attributes:{},index:null}}function u(L,F,W,U){const G=r.attributes,w=F.attributes;let I=0;const X=W.getAttributes();for(const H in X)if(X[H].location>=0){const et=G[H];let mt=w[H];if(mt===void 0&&(H==="instanceMatrix"&&L.instanceMatrix&&(mt=L.instanceMatrix),H==="instanceColor"&&L.instanceColor&&(mt=L.instanceColor)),et===void 0||et.attribute!==mt||mt&&et.data!==mt.data)return!0;I++}return r.attributesNum!==I||r.index!==U}function p(L,F,W,U){const G={},w=F.attributes;let I=0;const X=W.getAttributes();for(const H in X)if(X[H].location>=0){let et=w[H];et===void 0&&(H==="instanceMatrix"&&L.instanceMatrix&&(et=L.instanceMatrix),H==="instanceColor"&&L.instanceColor&&(et=L.instanceColor));const mt={};mt.attribute=et,et&&et.data&&(mt.data=et.data),G[H]=mt,I++}r.attributes=G,r.attributesNum=I,r.index=U}function x(){const L=r.newAttributes;for(let F=0,W=L.length;F<W;F++)L[F]=0}function g(L){m(L,0)}function m(L,F){const W=r.newAttributes,U=r.enabledAttributes,G=r.attributeDivisors;W[L]=1,U[L]===0&&(i.enableVertexAttribArray(L),U[L]=1),G[L]!==F&&(i.vertexAttribDivisor(L,F),G[L]=F)}function v(){const L=r.newAttributes,F=r.enabledAttributes;for(let W=0,U=F.length;W<U;W++)F[W]!==L[W]&&(i.disableVertexAttribArray(W),F[W]=0)}function b(L,F,W,U,G,w,I){I===!0?i.vertexAttribIPointer(L,F,W,G,w):i.vertexAttribPointer(L,F,W,U,G,w)}function S(L,F,W,U){x();const G=U.attributes,w=W.getAttributes(),I=F.defaultAttributeValues;for(const X in w){const H=w[X];if(H.location>=0){let j=G[X];if(j===void 0&&(X==="instanceMatrix"&&L.instanceMatrix&&(j=L.instanceMatrix),X==="instanceColor"&&L.instanceColor&&(j=L.instanceColor)),j!==void 0){const et=j.normalized,mt=j.itemSize,It=t.get(j);if(It===void 0)continue;const K=It.buffer,st=It.type,xt=It.bytesPerElement,Rt=st===i.INT||st===i.UNSIGNED_INT||j.gpuType===Na;if(j.isInterleavedBufferAttribute){const gt=j.data,At=gt.isInterleavedBuffer===!0?gt.stride:gt.itemSize,Kt=j.offset;if(gt.isInstancedInterleavedBuffer||gt.isInstancedBufferAttribute){for(let yt=0;yt<H.locationSize;yt++)m(H.location+yt,gt.meshPerAttribute);L.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=gt.meshPerAttribute*gt.count)}else for(let yt=0;yt<H.locationSize;yt++)g(H.location+yt);i.bindBuffer(i.ARRAY_BUFFER,K);for(let yt=0;yt<H.locationSize;yt++)b(H.location+yt,mt/H.locationSize,st,et,At*xt,(Kt+mt/H.locationSize*yt)*xt,Rt)}else{if(j.isInstancedBufferAttribute){for(let gt=0;gt<H.locationSize;gt++)m(H.location+gt,j.meshPerAttribute);L.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let gt=0;gt<H.locationSize;gt++)g(H.location+gt);i.bindBuffer(i.ARRAY_BUFFER,K);for(let gt=0;gt<H.locationSize;gt++)b(H.location+gt,mt/H.locationSize,st,et,mt*xt,mt/H.locationSize*gt*xt,Rt)}}else if(I!==void 0){const et=I[X];if(et!==void 0)switch(et.length){case 2:i.vertexAttrib2fv(H.location,et);break;case 3:i.vertexAttrib3fv(H.location,et);break;case 4:i.vertexAttrib4fv(H.location,et);break;default:i.vertexAttrib1fv(H.location,et)}}}}v()}function C(){N();for(const L in n){const F=n[L];for(const W in F){const U=F[W];for(const G in U){const w=U[G];for(const I in w)f(w[I].object),delete w[I];delete U[G]}}delete n[L]}}function T(L){if(n[L.id]===void 0)return;const F=n[L.id];for(const W in F){const U=F[W];for(const G in U){const w=U[G];for(const I in w)f(w[I].object),delete w[I];delete U[G]}}delete n[L.id]}function _(L){for(const F in n){const W=n[F];for(const U in W){const G=W[U];if(G[L.id]===void 0)continue;const w=G[L.id];for(const I in w)f(w[I].object),delete w[I];delete G[L.id]}}}function E(L){for(const F in n){const W=n[F],U=L.isInstancedMesh===!0?L.id:0,G=W[U];if(G!==void 0){for(const w in G){const I=G[w];for(const X in I)f(I[X].object),delete I[X];delete G[w]}delete W[U],Object.keys(W).length===0&&delete n[F]}}}function N(){P(),o=!0,r!==s&&(r=s,l(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:N,resetDefaultState:P,dispose:C,releaseStatesOfGeometry:T,releaseStatesOfObject:E,releaseStatesOfProgram:_,initAttributes:x,enableAttribute:g,disableUnusedAttributes:v}}function s0(i,t,e){let n;function s(h){n=h}function r(h,l){i.drawArrays(n,h,l),e.update(l,n,1)}function o(h,l,f){f!==0&&(i.drawArraysInstanced(n,h,l,f),e.update(l,n,f))}function a(h,l,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,h,0,l,0,f);let c=0;for(let u=0;u<f;u++)c+=l[u];e.update(c,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function r0(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const _=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(_.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(_){return!(_!==zn&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(_){const E=_===Xn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(_!==gn&&_!==Bn&&!E&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function h(_){if(_==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";_="mediump"}return _==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp";const f=h(l);f!==l&&(Jt("WebGLRenderer:",l,"not supported, using",f,"instead."),l=f);const d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),c=e.logarithmicDepthBuffer===!0&&d===!1;e.reversedDepthBuffer===!0&&d===!1&&Jt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),e.logarithmicDepthBuffer===!0&&d===!0&&Jt("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const u=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),v=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=i.getParameter(i.MAX_SAMPLES),T=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:h,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:c,reversedDepthBuffer:d,maxTextures:u,maxVertexTextures:p,maxTextureSize:x,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:v,maxVaryings:b,maxFragmentUniforms:S,maxSamples:C,samples:T}}function o0(i){const t=this;let e=null,n=0,s=!1,r=!1;const o=new Un,a=new ie,h={value:null,needsUpdate:!1};this.uniform=h,this.numPlanes=0,this.numIntersection=0,this.init=function(d,c){const u=d.length!==0||c||n!==0||s;return s=c,n=d.length,u},this.beginShadows=function(){r=!0,f(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,c){e=f(d,c,0)},this.setState=function(d,c,u){const p=d.clippingPlanes,x=d.clipIntersection,g=d.clipShadows,m=i.get(d);if(!s||p===null||p.length===0||r&&!g)r?f(null):l();else{const v=r?0:n,b=v*4;let S=m.clippingState||null;h.value=S,S=f(p,c,b,u);for(let C=0;C!==b;++C)S[C]=e[C];m.clippingState=S,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=v}};function l(){h.value!==e&&(h.value=e,h.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function f(d,c,u,p){const x=d!==null?d.length:0;let g=null;if(x!==0){if(g=h.value,p!==!0||g===null){const m=u+x*4,v=c.matrixWorldInverse;a.getNormalMatrix(v),(g===null||g.length<m)&&(g=new Float32Array(m));for(let b=0,S=u;b!==x;++b,S+=4)o.copy(d[b]).applyMatrix4(v,a),o.normal.toArray(g,S),g[S+3]=o.constant}h.value=g,h.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,g}}class Qa extends kn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new _h(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Di(5,5,5),r=new Li({name:"CubemapFromEquirect",uniforms:as(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:dn,blending:ji});r.uniforms.tEquirect.value=e;const o=new _n(s,r),a=e.minFilter;return e.minFilter===mi&&(e.minFilter=fn),new Sa(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}}const nc=256,a0=3,l0=20,Uh=256,Oh=16,c0=3,h0=new A,u0=new pe;class Ir{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Sa(1,10,null),this._boxMesh=new _n(new Di(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){const{size:o=256,position:a=h0}=r,h=this._renderer;this._setSize(o);const l=this._allocateTarget(),f=this._getSourceTarget(!0);e>0&&(f.texture.mipmapsAutoUpdate=!1);const d=h.autoClear,c=h.autoClearColor,u=h.autoClearDepth,p=h.autoClearStencil,x=t.background;h.autoClear=!0,h.autoClearColor=!0,h.autoClearDepth=!0,h.autoClearStencil=!0,x===null&&(t.background=h.getClearColor(u0));const g=new Sa(n,s,f);return g.position.copy(a),g.update(h,t),h.autoClear=d,h.autoClearColor=c,h.autoClearDepth=u,h.autoClearStencil=p,t.background=x,e>0&&(f.texture.mipmapsAutoUpdate=!0,this._blur(l,e)),this._applyPMREM(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=rc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=sc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(nc,ju(t))}_fromTexture(t,e){t.mapping===is||t.mapping===Ps?this._setSize(t.image.length===0?nc:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4);const n=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(n),n}_allocateTarget(){const t=this._cubeSize,e=ic(t,!1,!1),n=Math.log2(t)-a0;for(let s=0;s<=n;s++)e.texture.mipmaps.push({width:t>>s,height:t>>s});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){const e=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==e||t&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=ic(e,!0,t)),this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,n){const s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=t,r.activeMipmapLevel=e;const o=t.width>>e;t.viewport.set(0,0,o,o),r.update(this._renderer,s),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;t.mapping===is||t.mapping===Ps?(this._cubemapMaterial===null&&(this._cubemapMaterial=rc()),e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=sc()),e=this._equirectMaterial),e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=f0(),this._integrationMaterial=d0());const e=this._cubeSize,n=t.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;const r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(e/Oh);for(let o=0;o<=n;o++){const a=Ir.lodToRoughness(o,n);if(o>n-c0)r.roughness.value=a,this._renderCube(t,o,this._integrationMaterial);else{const h=a>0?Math.log2(e)+.5*Math.log2(6/(Uh*Math.pow(a,4)))+.5:0;s.roughness.value=a,s.lodBias.value=h,this._renderCube(t,o,this._ggxMaterial)}}}_blur(t,e){this._blurMaterial===null&&(this._blurMaterial=p0());const n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(t,0,n),s.envMap.value=t.texture,this._renderCube(r,0,n)}}function ic(i,t,e){return new Qa(i,{minFilter:mi,generateMipmaps:t,type:Xn,colorSpace:Rr,depthBuffer:e})}function Hs(i,t,e){return new Li({name:i,uniforms:t,vertexShader:ue.cube_vert,fragmentShader:e,side:dn,blending:ji,depthTest:!1,depthWrite:!1})}function f0(){return Hs("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Uh}u

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
	`)}function d0(){return Hs("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Oh}},`

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
	`)}function p0(){return Hs("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${l0}
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
	`)}function sc(){return Hs("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function rc(){return Hs("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function m0(i){let t=new WeakMap,e=new WeakMap,n=null;function s(c,u=!1){return c==null?null:u?o(c):r(c)}function r(c){if(c&&c.isTexture){const u=c.mapping;if(u===Wr||u===Xr)if(t.has(c)){const p=t.get(c).texture;return a(p,c.mapping)}else{const p=c.image;if(p&&p.height>0){const x=new Qa(p.height);return x.fromEquirectangularTexture(i,c),t.set(c,x),c.addEventListener("dispose",l),a(x.texture,c.mapping)}else return null}}return c}function o(c){if(c&&c.isTexture&&c.isPMREMTexture!==!0){const u=c.mapping,p=u===Wr||u===Xr,x=u===is||u===Ps;if(p||x){let g=e.get(c);const m=g!==void 0?g.texture.pmremVersion:0;if(c.isRenderTargetTexture&&c.pmremVersion!==m)return n===null&&(n=new Ir(i)),g=p?n.fromEquirectangular(c,g):n.fromCubemap(c,g),g.texture.pmremVersion=c.pmremVersion,e.set(c,g),g.texture;if(g!==void 0)return g.texture;{const v=c.image;return p&&v&&v.height>0||x&&v&&h(v)?(n===null&&(n=new Ir(i)),g=p?n.fromEquirectangular(c):n.fromCubemap(c),g.texture.pmremVersion=c.pmremVersion,e.set(c,g),c.addEventListener("dispose",f),g.texture):null}}}return c}function a(c,u){return u===Wr?c.mapping=is:u===Xr&&(c.mapping=Ps),c}function h(c){let u=0;const p=6;for(let x=0;x<p;x++)c[x]!==void 0&&u++;return u===p}function l(c){const u=c.target;u.removeEventListener("dispose",l);const p=t.get(u);p!==void 0&&(t.delete(u),p.dispose())}function f(c){const u=c.target;u.removeEventListener("dispose",f);const p=e.get(u);p!==void 0&&(e.delete(u),p.dispose())}function d(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function g0(i){const t={};function e(n){if(t[n]!==void 0)return t[n];const s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&Sr("WebGLRenderer: "+n+" extension not supported."),s}}}function _0(i,t,e,n){const s={},r=new WeakMap,o=new FinalizationRegistry(p=>delete s[p]);function a(p){h(p.target)}function h(p){p.index!==null&&t.remove(p.index);for(const g in p.attributes)t.remove(p.attributes[g]);p.removeEventListener("dispose",a),delete s[p.id],o.unregister(p);const x=r.get(p);x&&(t.remove(x),r.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,e.memory.geometries--}function l(p,x){return s[x.id]!==void 0||(x.addEventListener("dispose",a),s[x.id]=new WeakRef(x),o.register(x,x.id,x),e.memory.geometries++),x}function f(p){const x=p.attributes;for(const g in x)t.update(x[g],i.ARRAY_BUFFER)}function d(p){const x=p.index,g=p.attributes.position;let m=0;if(g===void 0)return;const v=x!==null?x.array.length:g.array.length/3-1,b=g.count>=65535?ph:dh,S=new b(Math.ceil(v/3)*6,1),C=S.array;if(x!==null){const _=x.array;m=x.version;for(let E=0,N=0;E<v;E+=3){const P=_[E+0],L=_[E+1],F=_[E+2];C[N++]=P,C[N++]=L,C[N++]=L,C[N++]=F,C[N++]=F,C[N++]=P}}else{m=g.version;for(let _=0,E=0;_<v;_+=3){const N=_+0,P=_+1,L=_+2;C[E++]=N,C[E++]=P,C[E++]=P,C[E++]=L,C[E++]=L,C[E++]=N}}S.version=m;const T=r.get(p);T&&t.remove(T),r.set(p,S)}function c(p){const x=r.get(p);if(x){const g=p.index;g!==null&&x.version<g.version&&d(p)}else d(p);return r.get(p)}function u(){for(const p in s){const x=s[p].deref();x!==void 0&&h(x)}}return{get:l,update:f,getWireframeAttribute:c,dispose:u}}function x0(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function h(d,c){i.drawElements(n,c,r,d*o),e.update(c,n,1)}function l(d,c,u){u!==0&&(i.drawElementsInstanced(n,c,r,d*o,u),e.update(c,n,u))}function f(d,c,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,c,0,r,d,0,u);let x=0;for(let g=0;g<u;g++)x+=c[g];e.update(x,n,1)}this.setMode=s,this.setIndex=a,this.render=h,this.renderInstances=l,this.renderMultiDraw=f}function v0(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:Ee("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function M0(i,t,e){const n=new WeakMap,s=new Ue;function r(o,a,h){const l=o.morphTargetInfluences,f=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=f!==void 0?f.length:0;let c=n.get(a);if(c===void 0||c.count!==d){let N=function(){_.dispose(),n.delete(a),a.removeEventListener("dispose",N)};c!==void 0&&c.texture.dispose();const u=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],v=a.morphAttributes.color||[];let b=0;u===!0&&(b=1),p===!0&&(b=2),x===!0&&(b=3);let S=a.attributes.position.count*b,C=1;S>t.maxTextureSize&&(C=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);const T=new Float32Array(S*C*4*d),_=new uh(T,S,C,d);_.type=Bn,_.needsUpdate=!0;const E=b*4;for(let P=0;P<d;P++){const L=g[P],F=m[P],W=v[P],U=S*C*4*P;for(let G=0;G<L.count;G++){const w=G*E;u===!0&&(s.fromBufferAttribute(L,G),T[U+w+0]=s.x,T[U+w+1]=s.y,T[U+w+2]=s.z,T[U+w+3]=0),p===!0&&(s.fromBufferAttribute(F,G),T[U+w+4]=s.x,T[U+w+5]=s.y,T[U+w+6]=s.z,T[U+w+7]=0),x===!0&&(s.fromBufferAttribute(W,G),T[U+w+8]=s.x,T[U+w+9]=s.y,T[U+w+10]=s.z,T[U+w+11]=W.itemSize===4?s.w:1)}}c={count:d,texture:_,size:new St(S,C)},n.set(a,c),a.addEventListener("dispose",N)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)h.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let u=0;for(let x=0;x<l.length;x++)u+=l[x];const p=a.morphTargetsRelative?1:1-u;h.getUniforms().setValue(i,"morphTargetBaseInfluence",p),h.getUniforms().setValue(i,"morphTargetInfluences",l)}h.getUniforms().setValue(i,"morphTargetsTexture",c.texture,e),h.getUniforms().setValue(i,"morphTargetsTextureSize",c.size)}return{update:r}}function S0(i,t,e,n,s){let r=new WeakMap;function o(l){const f=s.render.frame,d=l.geometry,c=t.get(l,d);if(r.get(c)!==f&&(t.update(c),r.set(c,f)),l.isInstancedMesh&&(l.hasEventListener("dispose",h)===!1&&l.addEventListener("dispose",h),r.get(l)!==f&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,f))),l.isSkinnedMesh){const u=l.skeleton;r.get(u)!==f&&(u.update(),r.set(u,f))}return c}function a(){r=new WeakMap}function h(l){const f=l.target;f.removeEventListener("dispose",h),n.releaseStatesOfObject(f),e.remove(f.instanceMatrix),f.instanceColor!==null&&e.remove(f.instanceColor)}return{update:o,dispose:a}}const y0={[Yc]:"LINEAR_TONE_MAPPING",[qc]:"REINHARD_TONE_MAPPING",[Zc]:"CINEON_TONE_MAPPING",[Kc]:"ACES_FILMIC_TONE_MAPPING",[$c]:"AGX_TONE_MAPPING",[Qc]:"NEUTRAL_TONE_MAPPING",[Jc]:"CUSTOM_TONE_MAPPING"};function E0(i,t,e,n,s,r){const o=new kn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let a=null,h=null,l=null;const f=new Fe;f.setAttribute("position",new _e([-1,3,0,-1,-1,0,3,-1,0],3)),f.setAttribute("uv",new _e([0,2,0,0,2,0],2));const d=new ud({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),c=new _n(f,d),u=new Dh(-1,1,1,-1,0,1);let p=null,x=null,g=!1,m,v=null,b=[],S=!1;this.setSize=function(C,T){o.setSize(C,T),a!==null&&a.setSize(C,T),h!==null&&h.setSize(C,T);for(let _=0;_<b.length;_++){const E=b[_];E.setSize&&E.setSize(C,T)}},this.setEffects=function(C){b=C,S=b.length>0&&b[0].isRenderPass===!0;const T=o.width,_=o.height;b.length>0&&a===null&&(a=new kn(T,_,{type:Xn,depthBuffer:!1,stencilBuffer:!1}),h=new kn(T,_,{type:Xn,depthBuffer:!1,stencilBuffer:!1}));const E=s===!0&&b.some(N=>N.needsDepthTexture===!0);E!==(o.depthTexture!==null)&&(E===!0&&l===null&&(l=new rs(T,_),r===!0&&(l.format=gi,l.type=ss)),o.dispose(),o.depthTexture=E?l:null,o.resolveDepthBuffer=E,o.storeMultisampledDepthBuffer=E);for(let N=0;N<b.length;N++){const P=b[N];P.setSize&&P.setSize(T,_),E&&P.needsDepthTexture===!0&&P.setDepthTexture&&P.setDepthTexture(l)}},this.begin=function(C,T){if(g||C.toneMapping===ni&&b.length===0)return!1;if(v=T,T!==null){const _=T.width,E=T.height;(o.width!==_||o.height!==E)&&this.setSize(_,E)}return S===!1&&C.setRenderTarget(o),m=C.toneMapping,C.toneMapping=ni,!0},this.hasRenderPass=function(){return S},this.end=function(C,T){C.toneMapping=m,g=!0;let _=o,E=a;for(let N=0;N<b.length;N++){const P=b[N];P.enabled!==!1&&(P.render(C,E,_,T),P.needsSwap!==!1&&(_=E,E=E===a?h:a))}if(p!==C.outputColorSpace||x!==C.toneMapping){p=C.outputColorSpace,x=C.toneMapping,d.defines={},Me.getTransfer(p)===Ae&&(d.defines.SRGB_TRANSFER="");const N=y0[x];N&&(d.defines[N]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=_.texture,C.setRenderTarget(v),C.render(c,u),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),h!==null&&h.dispose(),f.dispose(),d.dispose()}}const Fh=new ln,Bh=new rs(1,1),zh=new xh(1),Hh=new uh,Gh=new cf,kh=new _h,oc=[],ac=[],lc=new Float32Array(16),cc=new Float32Array(9),hc=new Float32Array(4);function us(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=oc[s];if(r===void 0&&(r=new Float32Array(s),oc[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Ye(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function qe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function zr(i,t){let e=ac[t];e===void 0&&(e=new Int32Array(t),ac[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function b0(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function T0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ye(e,t))return;i.uniform2fv(this.addr,t),qe(e,t)}}function A0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ye(e,t))return;i.uniform3fv(this.addr,t),qe(e,t)}}function w0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ye(e,t))return;i.uniform4fv(this.addr,t),qe(e,t)}}function R0(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ye(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),qe(e,t)}else{if(Ye(e,n))return;hc.set(n),i.uniformMatrix2fv(this.addr,!1,hc),qe(e,n)}}function C0(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ye(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),qe(e,t)}else{if(Ye(e,n))return;cc.set(n),i.uniformMatrix3fv(this.addr,!1,cc),qe(e,n)}}function P0(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ye(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),qe(e,t)}else{if(Ye(e,n))return;lc.set(n),i.uniformMatrix4fv(this.addr,!1,lc),qe(e,n)}}function L0(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function D0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ye(e,t))return;i.uniform2iv(this.addr,t),qe(e,t)}}function N0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ye(e,t))return;i.uniform3iv(this.addr,t),qe(e,t)}}function I0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ye(e,t))return;i.uniform4iv(this.addr,t),qe(e,t)}}function U0(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function O0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ye(e,t))return;i.uniform2uiv(this.addr,t),qe(e,t)}}function F0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ye(e,t))return;i.uniform3uiv(this.addr,t),qe(e,t)}}function B0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ye(e,t))return;i.uniform4uiv(this.addr,t),qe(e,t)}}function Hr(i){return i.version===0&&(i.compareFunction=ch,i.needsUpdate=!0),i}function z0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=Hr(Bh):r=Fh,e.setTexture2D(t||r,s)}function H0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Gh,s)}function G0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=Hr(zh):r=kh,e.setTextureCube(t||r,s)}function k0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Hh,s)}function V0(i){switch(i){case 5126:return b0;case 35664:return T0;case 35665:return A0;case 35666:return w0;case 35674:return R0;case 35675:return C0;case 35676:return P0;case 5124:case 35670:return L0;case 35667:case 35671:return D0;case 35668:case 35672:return N0;case 35669:case 35673:return I0;case 5125:return U0;case 36294:return O0;case 36295:return F0;case 36296:return B0;case 35678:case 36198:case 36298:case 36306:case 35682:return z0;case 35679:case 36299:case 36307:return H0;case 35680:case 36300:case 36308:case 36293:return G0;case 36289:case 36303:case 36311:case 36292:return k0}}function W0(i,t){i.uniform1fv(this.addr,t)}function X0(i,t){const e=us(t,this.size,2);i.uniform2fv(this.addr,e)}function Y0(i,t){const e=us(t,this.size,3);i.uniform3fv(this.addr,e)}function q0(i,t){const e=us(t,this.size,4);i.uniform4fv(this.addr,e)}function Z0(i,t){const e=us(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function K0(i,t){const e=us(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function J0(i,t){const e=us(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function $0(i,t){i.uniform1iv(this.addr,t)}function Q0(i,t){i.uniform2iv(this.addr,t)}function j0(i,t){i.uniform3iv(this.addr,t)}function tg(i,t){i.uniform4iv(this.addr,t)}function eg(i,t){i.uniform1uiv(this.addr,t)}function ng(i,t){i.uniform2uiv(this.addr,t)}function ig(i,t){i.uniform3uiv(this.addr,t)}function sg(i,t){i.uniform4uiv(this.addr,t)}function rg(i,t,e){const n=this.cache,s=t.length,r=zr(e,s);Ye(n,r)||(i.uniform1iv(this.addr,r),qe(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=Hr(Bh):o=Fh;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function og(i,t,e){const n=this.cache,s=t.length,r=zr(e,s);Ye(n,r)||(i.uniform1iv(this.addr,r),qe(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Gh,r[o])}function ag(i,t,e){const n=this.cache,s=t.length,r=zr(e,s);Ye(n,r)||(i.uniform1iv(this.addr,r),qe(n,r));let o;this.type===i.SAMPLER_CUBE_SHADOW?o=Hr(zh):o=kh;for(let a=0;a!==s;++a)e.setTextureCube(t[a]||o,r[a])}function lg(i,t,e){const n=this.cache,s=t.length,r=zr(e,s);Ye(n,r)||(i.uniform1iv(this.addr,r),qe(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Hh,r[o])}function cg(i){switch(i){case 5126:return W0;case 35664:return X0;case 35665:return Y0;case 35666:return q0;case 35674:return Z0;case 35675:return K0;case 35676:return J0;case 5124:case 35670:return $0;case 35667:case 35671:return Q0;case 35668:case 35672:return j0;case 35669:case 35673:return tg;case 5125:return eg;case 36294:return ng;case 36295:return ig;case 36296:return sg;case 35678:case 36198:case 36298:case 36306:case 35682:return rg;case 35679:case 36299:case 36307:return og;case 35680:case 36300:case 36308:case 36293:return ag;case 36289:case 36303:case 36311:case 36292:return lg}}class hg{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=V0(e.type)}}class ug{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=cg(e.type)}}class fg{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],n)}}}const yo=/(\w+)(\])?(\[|\.)?/g;function uc(i,t){i.seq.push(t),i.map[t.id]=t}function dg(i,t,e){const n=i.name,s=n.length;for(yo.lastIndex=0;;){const r=yo.exec(n),o=yo.lastIndex;let a=r[1];const h=r[2]==="]",l=r[3];if(h&&(a=a|0),l===void 0||l==="["&&o+2===s){uc(e,l===void 0?new hg(a,i,t):new ug(a,i,t));break}else{let d=e.map[a];d===void 0&&(d=new fg(a),uc(e,d)),e=d}}}class Er{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){const a=t.getActiveUniform(e,o),h=t.getUniformLocation(e,a.name);dg(a,h,this)}const s=[],r=[];for(const o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],h=n[a.id];h.needsUpdate!==!1&&a.setValue(t,h.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&n.push(o)}return n}}function fc(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const pg=37297;let mg=0;function gg(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}const dc=new ie;function _g(i){Me._getMatrix(dc,Me.workingColorSpace,i);const t=`mat3( ${dc.elements.map(e=>e.toFixed(4))} )`;switch(Me.getTransfer(i)){case Cr:return[t,"LinearTransferOETF"];case Ae:return[t,"sRGBTransferOETF"];default:return Jt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function pc(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+gg(i.getShaderSource(t),a)}else return r}function xg(i,t){const e=_g(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( ${e[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const vg={[Yc]:"Linear",[qc]:"Reinhard",[Zc]:"Cineon",[Kc]:"ACESFilmic",[$c]:"AgX",[Qc]:"Neutral",[Jc]:"Custom"};function Mg(i,t){const e=vg[t];return e===void 0?(Jt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const dr=new A;function Sg(){Me.getLuminanceCoefficients(dr);const i=dr.x.toFixed(4),t=dr.y.toFixed(4),e=dr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function yg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ms).join(`
`)}function Eg(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function bg(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Ms(i){return i!==""}function mc(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function gc(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Tg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ea(i){return i.replace(Tg,Ag)}function Ag(i,t){const e=ue[t];if(e===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">");return Ea(e)}const wg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function _c(i){return i.replace(wg,Rg)}function Rg(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function xc(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}const Cg={[gr]:"SHADOWMAP_TYPE_PCF",[xs]:"SHADOWMAP_TYPE_VSM"};function Pg(i){return Cg[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Lg={[Ps]:"ENVMAP_MODE_REFRACTION"};function Dg(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Lg[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Ng={[Xc]:"ENVMAP_BLENDING_MULTIPLY",[Ou]:"ENVMAP_BLENDING_MIX",[Fu]:"ENVMAP_BLENDING_ADD"};function Ig(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Ng[i.combine]||"ENVMAP_BLENDING_NONE"}function Ug(i,t,e,n){const s=i.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const h=Pg(e),l=e.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",f=Dg(e),d=Ig(e),c=yg(e),u=Eg(r),p=s.createProgram();let x,g,m=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(x=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u].filter(Ms).join(`
`),x.length>0&&(x+=`
`),g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u].filter(Ms).join(`
`),g.length>0&&(g+=`
`)):(x=[xc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+f:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+e.diffuseRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+h:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ms).join(`
`),g=[xc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,u,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+f:"",e.envMap?"#define "+d:"",e.envMapPMREM?"#define ENVMAP_MAX_LOD "+e.envMapMaxLod+".0":"",e.envMapPMREM?"#define ENVMAP_SIZE "+e.envMapSize+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+h:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ni?"#define TONE_MAPPING":"",e.toneMapping!==ni?ue.tonemapping_pars_fragment:"",e.toneMapping!==ni?Mg("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ue.colorspace_pars_fragment,xg("linearToOutputTexel",e.outputColorSpace),Sg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ms).join(`
`)),o=Ea(o),o=mc(o,e),o=gc(o,e),a=Ea(a),a=mc(a,e),a=gc(a,e),o=_c(o),a=_c(a),e.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,x=[c,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,g=["#define varying in",e.glslVersion===xl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===xl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const v=m+x+o,b=m+g+a,S=fc(s,s.VERTEX_SHADER,v),C=fc(s,s.FRAGMENT_SHADER,b);s.attachShader(p,S),s.attachShader(p,C),e.index0AttributeName!==void 0?s.bindAttribLocation(p,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(p,0,"position"),s.linkProgram(p);function T(P){if(i.debug.checkShaderErrors){const L=s.getProgramInfoLog(p)||"",F=s.getShaderInfoLog(S)||"",W=s.getShaderInfoLog(C)||"",U=L.trim(),G=F.trim(),w=W.trim();let I=!0,X=!0;if(s.getProgramParameter(p,s.LINK_STATUS)===!1)if(I=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,p,S,C);else{const H=pc(s,S,"vertex"),j=pc(s,C,"fragment");Ee("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(p,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+U+`
`+H+`
`+j)}else U!==""?Jt("WebGLProgram: Program Info Log:",U):(G===""||w==="")&&(X=!1);X&&(P.diagnostics={runnable:I,programLog:U,vertexShader:{log:G,prefix:x},fragmentShader:{log:w,prefix:g}})}s.deleteShader(S),s.deleteShader(C),_=new Er(s,p),E=bg(s,p)}let _;this.getUniforms=function(){return _===void 0&&T(this),_};let E;this.getAttributes=function(){return E===void 0&&T(this),E};let N=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return N===!1&&(N=s.getProgramParameter(p,pg)),N},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(p),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=mg++,this.cacheKey=t,this.usedTimes=1,this.program=p,this.vertexShader=S,this.fragmentShader=C,this}let Og=0;class Fg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){const s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Bg(t),e.set(t,n)),n}}class Bg{constructor(t){this.id=Og++,this.code=t,this.usedTimes=0}}function zg(i){return i===Ci||i===Ar||i===wr}function Hg(i,t,e,n,s,r){const o=new Ga,a=new Fg,h=new Set,l=[],f=new Map,d=n.logarithmicDepthBuffer,c={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function u(_){return h.add(_),_===0?"uv":`uv${_}`}function p(_,E,N,P,L,F){const W=P.fog,U=L.geometry,G=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?P.environment:null,w=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,I=t.get(_.envMap||G,w),X=c[_.type];let H=n.precision;_.precision!==null&&(H=n.getMaxPrecision(_.precision),H!==_.precision&&Jt("WebGLProgram.getParameters:",_.precision,"not supported, using",H,"instead."));const j=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,et=j!==void 0?j.length:0;let mt=0;U.morphAttributes.position!==void 0&&(mt=1),U.morphAttributes.normal!==void 0&&(mt=2),U.morphAttributes.color!==void 0&&(mt=3);let It,K,st,xt;if(X){const ht=On[X];It=ht.vertexShader,K=ht.fragmentShader}else{It=_.vertexShader,K=_.fragmentShader;const ht=a.getVertexShaderStage(_),Yt=a.getFragmentShaderStage(_);a.update(_,ht,Yt),st=ht.id,xt=Yt.id}const Rt=i.getRenderTarget(),gt=i.state.buffers.depth.getReversed(),At=L.isInstancedMesh===!0,Kt=L.isBatchedMesh===!0,yt=!!_.map,qt=!!_.matcap,Xt=!!I,it=Xt&&I.isPMREMTexture===!0,pt=!!_.aoMap,Et=!!_.lightMap,Bt=!!_.bumpMap&&_.wireframe===!1,Ct=!!_.normalMap,$t=!!_.displacementMap,Ht=!!_.emissiveMap,ee=!!_.metalnessMap,le=!!_.roughnessMap,ce=_.anisotropy>0,B=_.clearcoat>0,Le=_.diffuseRoughness>0,se=_.dispersion>0,Te=_.retroreflectivity>0,q=_.iridescence>0,at=_.sheen>0,ot=_.transmission>0,Dt=ce&&!!_.anisotropyMap,R=B&&!!_.clearcoatMap,M=B&&!!_.clearcoatNormalMap,z=B&&!!_.clearcoatRoughnessMap,nt=Le&&!!_.diffuseRoughnessMap,Y=q&&!!_.iridescenceMap,lt=q&&!!_.iridescenceThicknessMap,_t=at&&!!_.sheenColorMap,$=at&&!!_.sheenRoughnessMap,tt=!!_.specularMap,vt=!!_.specularColorMap,D=!!_.specularIntensityMap,Q=ot&&!!_.transmissionMap,Z=ot&&!!_.thicknessMap,ft=!!_.gradientMap,ut=!!_.alphaMap,Mt=_.alphaTest>0,Ut=!!_.alphaHash,Wt=!!_.extensions;let dt=ni;_.toneMapped&&(Rt===null||Rt.isXRRenderTarget===!0)&&(dt=i.toneMapping);const ct=it?I.isCompressedCubeTexture?I.image[0].mipmaps:I.mipmaps:null,Pt={shaderID:X,shaderType:_.type,shaderName:_.name,vertexShader:It,fragmentShader:K,defines:_.defines,customVertexShaderID:st,customFragmentShaderID:xt,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:H,batching:Kt,batchingColor:Kt&&L._colorsTexture!==null,instancing:At,instancingColor:At&&L.instanceColor!==null,instancingMorph:At&&L.morphTexture!==null,outputColorSpace:Rt===null?i.outputColorSpace:Rt.isXRRenderTarget===!0?Rt.texture.colorSpace:Me.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:yt,matcap:qt,envMap:Xt,envMapMode:Xt&&I.mapping,envMapPMREM:it,envMapMaxLod:it?ct.length-1:null,envMapSize:it?ct[0].width:null,aoMap:pt,lightMap:Et,bumpMap:Bt,normalMap:Ct,displacementMap:$t,emissiveMap:Ht,normalMapObjectSpace:Ct&&_.normalMapType===Hu,normalMapTangentSpace:Ct&&_.normalMapType===ga,packedNormalMap:Ct&&_.normalMapType===ga&&zg(_.normalMap.format),metalnessMap:ee,roughnessMap:le,anisotropy:ce,anisotropyMap:Dt,clearcoat:B,clearcoatMap:R,clearcoatNormalMap:M,clearcoatRoughnessMap:z,diffuseRoughness:Le,diffuseRoughnessMap:nt,dispersion:se,retroreflection:Te,iridescence:q,iridescenceMap:Y,iridescenceThicknessMap:lt,sheen:at,sheenColorMap:_t,sheenRoughnessMap:$,specularMap:tt,specularColorMap:vt,specularIntensityMap:D,transmission:ot,transmissionMap:Q,thicknessMap:Z,gradientMap:ft,opaque:_.transparent===!1&&_.blending===Ts&&_.alphaToCoverage===!1,alphaMap:ut,alphaTest:Mt,alphaHash:Ut,combine:_.combine,mapUv:yt&&u(_.map.channel),aoMapUv:pt&&u(_.aoMap.channel),lightMapUv:Et&&u(_.lightMap.channel),bumpMapUv:Bt&&u(_.bumpMap.channel),normalMapUv:Ct&&u(_.normalMap.channel),displacementMapUv:$t&&u(_.displacementMap.channel),emissiveMapUv:Ht&&u(_.emissiveMap.channel),metalnessMapUv:ee&&u(_.metalnessMap.channel),roughnessMapUv:le&&u(_.roughnessMap.channel),anisotropyMapUv:Dt&&u(_.anisotropyMap.channel),clearcoatMapUv:R&&u(_.clearcoatMap.channel),clearcoatNormalMapUv:M&&u(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:z&&u(_.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:nt&&u(_.diffuseRoughnessMap.channel),iridescenceMapUv:Y&&u(_.iridescenceMap.channel),iridescenceThicknessMapUv:lt&&u(_.iridescenceThicknessMap.channel),sheenColorMapUv:_t&&u(_.sheenColorMap.channel),sheenRoughnessMapUv:$&&u(_.sheenRoughnessMap.channel),specularMapUv:tt&&u(_.specularMap.channel),specularColorMapUv:vt&&u(_.specularColorMap.channel),specularIntensityMapUv:D&&u(_.specularIntensityMap.channel),transmissionMapUv:Q&&u(_.transmissionMap.channel),thicknessMapUv:Z&&u(_.thicknessMap.channel),alphaMapUv:ut&&u(_.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(Ct||ce),vertexNormals:!!U.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!U.attributes.uv&&(yt||ut),fog:!!W,useFog:_.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||U.attributes.normal===void 0&&Ct===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:gt,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:et,morphTextureStride:mt,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:F.filter(ht=>ht.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&N.length>0,shadowMapType:i.shadowMap.type,toneMapping:dt,decodeVideoTexture:yt&&_.map.isVideoTexture===!0&&Me.getTransfer(_.map.colorSpace)===Ae,decodeVideoTextureEmissive:Ht&&_.emissiveMap.isVideoTexture===!0&&Me.getTransfer(_.emissiveMap.colorSpace)===Ae,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Fn,flipSided:_.side===dn,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Wt&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Wt&&_.extensions.multiDraw===!0||Kt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Pt.vertexUv1s=h.has(1),Pt.vertexUv2s=h.has(2),Pt.vertexUv3s=h.has(3),h.clear(),Pt}function x(_){const E=[];if(_.shaderID?E.push(_.shaderID):(E.push(_.customVertexShaderID),E.push(_.customFragmentShaderID)),_.defines!==void 0)for(const N in _.defines)E.push(N),E.push(_.defines[N]);return _.isRawShaderMaterial===!1&&(g(E,_),m(E,_),E.push(i.outputColorSpace)),E.push(_.customProgramCacheKey),E.join()}function g(_,E){_.push(E.precision),_.push(E.outputColorSpace),_.push(E.envMapMode),_.push(E.envMapPMREM),_.push(E.envMapMaxLod),_.push(E.envMapSize),_.push(E.mapUv),_.push(E.alphaMapUv),_.push(E.lightMapUv),_.push(E.aoMapUv),_.push(E.bumpMapUv),_.push(E.normalMapUv),_.push(E.displacementMapUv),_.push(E.emissiveMapUv),_.push(E.metalnessMapUv),_.push(E.roughnessMapUv),_.push(E.anisotropyMapUv),_.push(E.clearcoatMapUv),_.push(E.clearcoatNormalMapUv),_.push(E.clearcoatRoughnessMapUv),_.push(E.diffuseRoughnessMapUv),_.push(E.iridescenceMapUv),_.push(E.iridescenceThicknessMapUv),_.push(E.sheenColorMapUv),_.push(E.sheenRoughnessMapUv),_.push(E.specularMapUv),_.push(E.specularColorMapUv),_.push(E.specularIntensityMapUv),_.push(E.transmissionMapUv),_.push(E.thicknessMapUv),_.push(E.combine),_.push(E.fogExp2),_.push(E.sizeAttenuation),_.push(E.morphTargetsCount),_.push(E.numSunLights),_.push(E.numDirLights),_.push(E.numPointLights),_.push(E.numSpotLights),_.push(E.numSpotLightMaps),_.push(E.numHemiLights),_.push(E.numRectAreaLights),_.push(E.numSunLightShadows),_.push(E.numDirLightShadows),_.push(E.numPointLightShadows),_.push(E.numSpotLightShadows),_.push(E.numSpotLightShadowsWithMaps),_.push(E.numLightProbes),_.push(E.numLightProbeGrids),_.push(E.shadowMapType),_.push(E.toneMapping),_.push(E.numClippingPlanes),_.push(E.numClipIntersection),_.push(E.depthPacking)}function m(_,E){o.disableAll(),E.instancing&&o.enable(0),E.instancingColor&&o.enable(1),E.instancingMorph&&o.enable(2),E.matcap&&o.enable(3),E.envMap&&o.enable(4),E.normalMapObjectSpace&&o.enable(5),E.normalMapTangentSpace&&o.enable(6),E.clearcoat&&o.enable(7),E.iridescence&&o.enable(8),E.alphaTest&&o.enable(9),E.vertexColors&&o.enable(10),E.vertexAlphas&&o.enable(11),E.vertexUv1s&&o.enable(12),E.vertexUv2s&&o.enable(13),E.vertexUv3s&&o.enable(14),E.vertexTangents&&o.enable(15),E.anisotropy&&o.enable(16),E.alphaHash&&o.enable(17),E.batching&&o.enable(18),E.dispersion&&o.enable(19),E.retroreflection&&o.enable(24),E.diffuseRoughness&&o.enable(25),E.batchingColor&&o.enable(20),E.gradientMap&&o.enable(21),E.packedNormalMap&&o.enable(22),E.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reversedDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),E.numLightProbeGrids>0&&o.enable(22),E.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function v(_){const E=c[_.type];let N;if(E){const P=On[E];N=ld.clone(P.uniforms)}else N=_.uniforms;return N}function b(_,E){let N=f.get(E);return N!==void 0?++N.usedTimes:(N=new Ug(i,E,_,s),l.push(N),f.set(E,N)),N}function S(_){if(--_.usedTimes===0){const E=l.indexOf(_);l[E]=l[l.length-1],l.pop(),f.delete(_.cacheKey),_.destroy()}}function C(_){a.remove(_)}function T(){a.dispose()}return{getParameters:p,getProgramCacheKey:x,getUniforms:v,acquireProgram:b,releaseProgram:S,releaseShaderCache:C,programs:l,dispose:T}}function Gg(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,h){i.get(o)[a]=h}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function kg(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function vc(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Mc(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(c){let u=0;return c.isInstancedMesh&&(u+=2),c.isSkinnedMesh&&(u+=1),u}function a(c,u,p,x,g,m){let v=i[t];return v===void 0?(v={id:c.id,object:c,geometry:u,material:p,materialVariant:o(c),groupOrder:x,renderOrder:c.renderOrder,z:g,group:m},i[t]=v):(v.id=c.id,v.object=c,v.geometry=u,v.material=p,v.materialVariant=o(c),v.groupOrder=x,v.renderOrder=c.renderOrder,v.z=g,v.group=m),t++,v}function h(c,u,p,x,g,m,v){v.reversedDepth===!0&&(g=-g);const b=a(c,u,p,x,g,m);p.transmission>0?n.push(b):p.transparent===!0?s.push(b):e.push(b)}function l(c,u,p,x,g,m){const v=a(c,u,p,x,g,m);p.transmission>0?n.unshift(v):p.transparent===!0?s.unshift(v):e.unshift(v)}function f(c,u){e.length>1&&e.sort(c||kg),n.length>1&&n.sort(u||vc),s.length>1&&s.sort(u||vc)}function d(){for(let c=t,u=i.length;c<u;c++){const p=i[c];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:h,unshift:l,finish:d,sort:f}}function Vg(){let i=new WeakMap;function t(n,s){const r=i.get(n);let o;return r===void 0?(o=new Mc,i.set(n,[o])):s>=r.length?(o=new Mc,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function Wg(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new A,color:new pe};break;case"SpotLight":e={position:new A,direction:new A,color:new pe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new A,color:new pe,distance:0,decay:0};break;case"HemisphereLight":e={direction:new A,skyColor:new pe,groundColor:new pe};break;case"RectAreaLight":e={color:new pe,position:new A,halfWidth:new A,halfHeight:new A};break}return i[t.id]=e,e}}}function Xg(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new St};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new St};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new St,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let Yg=0;function qg(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Zg(i){const t=new Wg,e=Xg(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new A);const s=new A,r=new fe,o=new fe;function a(l){let f=0,d=0,c=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let u=0,p=0,x=0,g=0,m=0,v=0,b=0,S=0,C=0,T=0,_=0,E=0,N=0,P=0;l.sort(qg);for(let F=0,W=l.length;F<W;F++){const U=l[F],G=U.color,w=U.intensity,I=U.distance;let X=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===Ci?X=U.shadow.map.texture:X=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)f+=G.r*w,d+=G.g*w,c+=G.b*w;else if(U.isLightProbe){for(let H=0;H<9;H++)n.probe[H].addScaledVector(U.sh.coefficients[H],w);P++}else if(U.isSunLight){const H=t.get(U);if(H.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const j=U.shadow,et=e.get(U);et.shadowIntensity=j.intensity,et.shadowBias=j.bias,et.shadowNormalBias=j.normalBias,et.shadowRadius=j.radius,et.shadowMapSize.copy(j.mapSize).multiply(j.getFrameExtents()),n.sunShadow[p]=et,n.sunShadowMap[p]=X;const mt=j.getViewportCount();for(let It=0;It<mt;It++)n.sunShadowMatrix[x+It]=j.getMatrix(It),n.sunShadowCascade[x+It]=j._cascadeData[It];x+=mt,p++}n.sun[u]=H,u++}else if(U.isDirectionalLight){const H=t.get(U);if(H.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const j=U.shadow,et=e.get(U);et.shadowIntensity=j.intensity,et.shadowBias=j.bias,et.shadowNormalBias=j.normalBias,et.shadowRadius=j.radius,et.shadowMapSize=j.mapSize,n.directionalShadow[g]=et,n.directionalShadowMap[g]=X,n.directionalShadowMatrix[g]=U.shadow.matrix,C++}n.directional[g]=H,g++}else if(U.isSpotLight){const H=t.get(U);H.position.setFromMatrixPosition(U.matrixWorld),H.color.copy(G).multiplyScalar(w),H.distance=I,H.coneCos=Math.cos(U.angle),H.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),H.decay=U.decay,n.spot[v]=H;const j=U.shadow;if(U.map&&(n.spotLightMap[E]=U.map,E++,j.updateMatrices(U),U.castShadow&&N++),n.spotLightMatrix[v]=j.matrix,U.castShadow){const et=e.get(U);et.shadowIntensity=j.intensity,et.shadowBias=j.bias,et.shadowNormalBias=j.normalBias,et.shadowRadius=j.radius,et.shadowMapSize=j.mapSize,n.spotShadow[v]=et,n.spotShadowMap[v]=X,_++}v++}else if(U.isRectAreaLight){const H=t.get(U);H.color.copy(G).multiplyScalar(w),H.halfWidth.set(U.width*.5,0,0),H.halfHeight.set(0,U.height*.5,0),n.rectArea[b]=H,b++}else if(U.isPointLight){const H=t.get(U);if(H.color.copy(U.color).multiplyScalar(U.intensity),H.distance=U.distance,H.decay=U.decay,U.castShadow){const j=U.shadow,et=e.get(U);et.shadowIntensity=j.intensity,et.shadowBias=j.bias,et.shadowNormalBias=j.normalBias,et.shadowRadius=j.radius,et.shadowMapSize=j.mapSize,et.shadowCameraNear=j.camera.near,et.shadowCameraFar=j.camera.far,n.pointShadow[m]=et,n.pointShadowMap[m]=X,n.pointShadowMatrix[m]=U.shadow.matrix,T++}n.point[m]=H,m++}else if(U.isHemisphereLight){const H=t.get(U);H.skyColor.copy(U.color).multiplyScalar(w),H.groundColor.copy(U.groundColor).multiplyScalar(w),n.hemi[S]=H,S++}}b>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Lt.LTC_FLOAT_1,n.rectAreaLTC2=Lt.LTC_FLOAT_2):(n.rectAreaLTC1=Lt.LTC_HALF_1,n.rectAreaLTC2=Lt.LTC_HALF_2)),n.ambient[0]=f,n.ambient[1]=d,n.ambient[2]=c;const L=n.hash;(L.sunLength!==u||L.directionalLength!==g||L.pointLength!==m||L.spotLength!==v||L.rectAreaLength!==b||L.hemiLength!==S||L.numSunShadows!==p||L.numDirectionalShadows!==C||L.numPointShadows!==T||L.numSpotShadows!==_||L.numSpotMaps!==E||L.numLightProbes!==P)&&(n.sun.length=u,n.directional.length=g,n.spot.length=v,n.rectArea.length=b,n.point.length=m,n.hemi.length=S,n.sunShadow.length=p,n.sunShadowMap.length=p,n.sunShadowMatrix.length=x,n.sunShadowCascade.length=x,n.directionalShadow.length=C,n.directionalShadowMap.length=C,n.directionalShadowMatrix.length=C,n.pointShadow.length=T,n.pointShadowMap.length=T,n.pointShadowMatrix.length=T,n.spotShadow.length=_,n.spotShadowMap.length=_,n.spotLightMatrix.length=_+E-N,n.spotLightMap.length=E,n.numSpotLightShadowsWithMaps=N,n.numLightProbes=P,L.sunLength=u,L.directionalLength=g,L.pointLength=m,L.spotLength=v,L.rectAreaLength=b,L.hemiLength=S,L.numSunShadows=p,L.numDirectionalShadows=C,L.numPointShadows=T,L.numSpotShadows=_,L.numSpotMaps=E,L.numLightProbes=P,n.version=Yg++)}function h(l,f){let d=0,c=0,u=0,p=0,x=0,g=0;const m=f.matrixWorldInverse;for(let v=0,b=l.length;v<b;v++){const S=l[v];if(S.isSunLight){const C=n.sun[d];C.direction.setFromMatrixPosition(S.matrixWorld),C.direction.transformDirection(m),d++}else if(S.isDirectionalLight){const C=n.directional[c];C.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),C.direction.sub(s),C.direction.transformDirection(m),c++}else if(S.isSpotLight){const C=n.spot[p];C.position.setFromMatrixPosition(S.matrixWorld),C.position.applyMatrix4(m),C.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),C.direction.sub(s),C.direction.transformDirection(m),p++}else if(S.isRectAreaLight){const C=n.rectArea[x];C.position.setFromMatrixPosition(S.matrixWorld),C.position.applyMatrix4(m),o.identity(),r.copy(S.matrixWorld),r.premultiply(m),o.extractRotation(r),C.halfWidth.set(S.width*.5,0,0),C.halfHeight.set(0,S.height*.5,0),C.halfWidth.applyMatrix4(o),C.halfHeight.applyMatrix4(o),x++}else if(S.isPointLight){const C=n.point[u];C.position.setFromMatrixPosition(S.matrixWorld),C.position.applyMatrix4(m),u++}else if(S.isHemisphereLight){const C=n.hemi[g];C.direction.setFromMatrixPosition(S.matrixWorld),C.direction.transformDirection(m),g++}}}return{setup:a,setupView:h,state:n}}function Sc(i){const t=new Zg(i),e=[],n=[],s=[];function r(d){f.camera=d,e.length=0,n.length=0,s.length=0}function o(d){d.isLightProbeGrid?s.push(d):e.push(d)}function a(d){n.push(d)}function h(){t.setup(e),s.sort((d,c)=>d.priority-c.priority||d.id-c.id)}function l(d){t.setupView(e,d)}const f={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:f,setupLights:h,setupLightsView:l,pushLight:o,pushShadow:a}}function Kg(i){let t=new WeakMap;function e(s,r=0){const o=t.get(s);let a;return o===void 0?(a=new Sc(i),t.set(s,[a])):r>=o.length?(a=new Sc(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}const Jg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,$g=`uniform sampler2D shadow_pass;
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
}`,Qg=[new A(1,0,0),new A(-1,0,0),new A(0,1,0),new A(0,-1,0),new A(0,0,1),new A(0,0,-1)],jg=[new A(0,-1,0),new A(0,-1,0),new A(0,0,1),new A(0,0,-1),new A(0,-1,0),new A(0,-1,0)],yc=new fe,_s=new A,Eo=new A;function t_(i,t,e){let n=new Ns;const s=new St,r=new St,o=new Ue,a=new fd,h=new dd,l={},f=e.maxTextureSize,d={[Ri]:dn,[dn]:Ri,[Fn]:Fn},c=new Li({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new St},radius:{value:4}},vertexShader:Jg,fragmentShader:$g}),u=c.clone();u.defines.HORIZONTAL_PASS=1;const p=new Fe;p.setAttribute("position",new Vn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new _n(p,c),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=gr;let m=this.type;this.render=function(T,_,E){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||T.length===0)return;this.type===_u&&(Jt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=gr);const N=i.getRenderTarget(),P=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),F=i.state;F.setBlending(ji),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const W=m!==this.type;W&&_.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(G=>G.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,G=T.length;U<G;U++){const w=T[U],I=w.shadow;if(I===void 0){Jt("WebGLShadowMap:",w,"has no shadow.");continue}if(I.autoUpdate===!1&&I.needsUpdate===!1)continue;s.copy(I.mapSize);const X=I.getFrameExtents();s.multiply(X),r.copy(I.mapSize),(s.x>f||s.y>f)&&(s.x>f&&(r.x=Math.floor(f/X.x),s.x=r.x*X.x,I.mapSize.x=r.x),s.y>f&&(r.y=Math.floor(f/X.y),s.y=r.y*X.y,I.mapSize.y=r.y));const H=i.state.buffers.depth.getReversed();if(I.camera._reversedDepth=H,I.map===null||W===!0){if(I.map!==null&&(I.map.depthTexture!==null&&(I.map.depthTexture.dispose(),I.map.depthTexture=null),I.map.dispose()),this.type===xs){if(w.isPointLight){Jt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}I.map=new kn(s.x,s.y,{format:Ci,type:Xn,minFilter:fn,magFilter:fn,generateMipmaps:!1}),I.map.texture.name=w.name+".shadowMap",I.map.depthTexture=new rs(s.x,s.y,Bn),I.map.depthTexture.name=w.name+".shadowMapDepth",I.map.depthTexture.format=vi,I.map.depthTexture.compareFunction=null,I.map.depthTexture.minFilter=tn,I.map.depthTexture.magFilter=tn}else w.isPointLight?(I.map=new Qa(s.x),I.map.depthTexture=new xh(s.x,Wn)):(I.map=new kn(s.x,s.y),I.map.depthTexture=new rs(s.x,s.y,Wn)),I.map.depthTexture.name=w.name+".shadowMap",I.map.depthTexture.format=vi,this.type===gr?(I.map.depthTexture.compareFunction=H?lh:ah,I.map.depthTexture.minFilter=fn,I.map.depthTexture.magFilter=fn):(I.map.depthTexture.compareFunction=null,I.map.depthTexture.minFilter=tn,I.map.depthTexture.magFilter=tn);I.camera.updateProjectionMatrix()}I.map.isWebGLCubeRenderTarget!==!0&&(I.map.width!==s.x||I.map.height!==s.y)&&I.map.setSize(s.x,s.y);const j=I.map.isWebGLCubeRenderTarget?6:I.getViewportCount();w.isPointLight!==!0&&I.updateMatrices(w,E);const et=(I.camera.layers.mask&4294967294)!==0?I.camera.layers:E.layers;for(let mt=0;mt<j;mt++){const It=I.getCamera(mt);if(w.isPointLight){const K=I.camera,st=I.matrix,xt=w.distance||K.far;xt!==K.far&&(K.far=xt,K.updateProjectionMatrix()),_s.setFromMatrixPosition(w.matrixWorld),K.position.copy(_s),Eo.copy(K.position),Eo.add(Qg[mt]),K.up.copy(jg[mt]),K.lookAt(Eo),K.updateMatrixWorld(),st.makeTranslation(-_s.x,-_s.y,-_s.z),yc.multiplyMatrices(K.projectionMatrix,K.matrixWorldInverse),I._frustum.setFromProjectionMatrix(yc,K.coordinateSystem,K.reversedDepth)}if(I.map.isWebGLCubeRenderTarget)i.setRenderTarget(I.map,mt),i.clear();else{mt===0&&(i.setRenderTarget(I.map),i.clear());const K=I.getViewport(mt);o.set(r.x*K.x,r.y*K.y,r.x*K.z,r.y*K.w),F.viewport(o)}n=I.getFrustum(mt),S(_,E,It,w,et,this.type)}I.isPointLightShadow!==!0&&this.type===xs&&v(I,E),I.needsUpdate=!1}m=this.type,g.needsUpdate=!1,i.setRenderTarget(N,P,L)};function v(T,_){const E=t.update(x);c.defines.VSM_SAMPLES!==T.blurSamples&&(c.defines.VSM_SAMPLES=T.blurSamples,u.defines.VSM_SAMPLES=T.blurSamples,c.needsUpdate=!0,u.needsUpdate=!0),T.mapPass===null?T.mapPass=new kn(s.x,s.y,{format:Ci,type:Xn}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),c.uniforms.shadow_pass.value=T.map.depthTexture,c.uniforms.resolution.value.set(T.map.width,T.map.height),c.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(_,null,E,c,x,null),u.uniforms.shadow_pass.value=T.mapPass.texture,u.uniforms.resolution.value.set(T.map.width,T.map.height),u.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(_,null,E,u,x,null)}function b(T,_,E,N){let P=null;const L=E.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(L!==void 0)P=L;else if(P=E.isPointLight===!0?h:a,i.localClippingEnabled&&_.clipShadows===!0&&Array.isArray(_.clippingPlanes)&&_.clippingPlanes.length!==0||_.displacementMap&&_.displacementScale!==0||_.alphaMap&&_.alphaTest>0||_.map&&_.alphaTest>0||_.alphaToCoverage===!0){const F=P.uuid,W=_.uuid;let U=l[F];U===void 0&&(U={},l[F]=U);let G=U[W];G===void 0&&(G=P.clone(),U[W]=G,_.addEventListener("dispose",C)),P=G}if(P.visible=_.visible,P.wireframe=_.wireframe,N===xs?P.side=_.shadowSide!==null?_.shadowSide:_.side:P.side=_.shadowSide!==null?_.shadowSide:d[_.side],P.alphaMap=_.alphaMap,P.alphaTest=_.alphaToCoverage===!0?.5:_.alphaTest,P.map=_.map,P.clipShadows=_.clipShadows,P.clippingPlanes=_.clippingPlanes,P.clipIntersection=_.clipIntersection,P.displacementMap=_.displacementMap,P.displacementScale=_.displacementScale,P.displacementBias=_.displacementBias,P.wireframeLinewidth=_.wireframeLinewidth,P.linewidth=_.linewidth,E.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const F=i.properties.get(P);F.light=E}return P}function S(T,_,E,N,P,L){if(T.visible===!1)return;if(T.layers.test(P)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&L===xs)&&(!T.frustumCulled||T.intersectsFrustum(n))){T.modelViewMatrix.multiplyMatrices(E.matrixWorldInverse,T.matrixWorld);const U=t.update(T),G=T.material;if(Array.isArray(G)){const w=U.groups;for(let I=0,X=w.length;I<X;I++){const H=w[I],j=G[H.materialIndex];if(j&&j.visible){const et=b(T,j,N,L);T.onBeforeShadow(i,T,_,E,U,et,H),i.renderBufferDirect(E,null,U,et,T,H),T.onAfterShadow(i,T,_,E,U,et,H)}}}else if(G.visible){const w=b(T,G,N,L);T.onBeforeShadow(i,T,_,E,U,w,null),i.renderBufferDirect(E,null,U,w,T,null),T.onAfterShadow(i,T,_,E,U,w,null)}}const W=T.children;for(let U=0,G=W.length;U<G;U++)S(W[U],_,E,N,P,L)}function C(T){T.target.removeEventListener("dispose",C);for(const E in l){const N=l[E],P=T.target.uuid;P in N&&(N[P].dispose(),delete N[P])}}}function e_(i,t){function e(){let D=!1;const Q=new Ue;let Z=null;const ft=new Ue(0,0,0,0);return{setMask:function(ut){Z!==ut&&!D&&(i.colorMask(ut,ut,ut,ut),Z=ut)},setLocked:function(ut){D=ut},setClear:function(ut,Mt,Ut,Wt,dt){dt===!0&&(ut*=Wt,Mt*=Wt,Ut*=Wt),Q.set(ut,Mt,Ut,Wt),ft.equals(Q)===!1&&(i.clearColor(ut,Mt,Ut,Wt),ft.copy(Q))},reset:function(){D=!1,Z=null,ft.set(-1,0,0,0)}}}function n(){let D=!1,Q=!1,Z=null,ft=null,ut=null;return{setReversed:function(Mt){if(Q!==Mt){const Ut=t.get("EXT_clip_control");Mt?Ut.clipControlEXT(Ut.LOWER_LEFT_EXT,Ut.ZERO_TO_ONE_EXT):Ut.clipControlEXT(Ut.LOWER_LEFT_EXT,Ut.NEGATIVE_ONE_TO_ONE_EXT),Q=Mt;const Wt=ut;ut=null,this.setClear(Wt)}},getReversed:function(){return Q},setTest:function(Mt){Mt?gt(i.DEPTH_TEST):At(i.DEPTH_TEST)},setMask:function(Mt){Z!==Mt&&!D&&(i.depthMask(Mt),Z=Mt)},setFunc:function(Mt){if(Q&&(Mt=$u[Mt]),ft!==Mt){switch(Mt){case Lo:i.depthFunc(i.NEVER);break;case Do:i.depthFunc(i.ALWAYS);break;case No:i.depthFunc(i.LESS);break;case Cs:i.depthFunc(i.LEQUAL);break;case Io:i.depthFunc(i.EQUAL);break;case Uo:i.depthFunc(i.GEQUAL);break;case Oo:i.depthFunc(i.GREATER);break;case Fo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ft=Mt}},setLocked:function(Mt){D=Mt},setClear:function(Mt){ut!==Mt&&(ut=Mt,Q&&(Mt=1-Mt),i.clearDepth(Mt))},reset:function(){D=!1,Z=null,ft=null,ut=null,Q=!1}}}function s(){let D=!1,Q=null,Z=null,ft=null,ut=null,Mt=null,Ut=null,Wt=null,dt=null;return{setTest:function(ct){D||(ct?gt(i.STENCIL_TEST):At(i.STENCIL_TEST))},setMask:function(ct){Q!==ct&&!D&&(i.stencilMask(ct),Q=ct)},setFunc:function(ct,Pt,ht){(Z!==ct||ft!==Pt||ut!==ht)&&(i.stencilFunc(ct,Pt,ht),Z=ct,ft=Pt,ut=ht)},setOp:function(ct,Pt,ht){(Mt!==ct||Ut!==Pt||Wt!==ht)&&(i.stencilOp(ct,Pt,ht),Mt=ct,Ut=Pt,Wt=ht)},setLocked:function(ct){D=ct},setClear:function(ct){dt!==ct&&(i.clearStencil(ct),dt=ct)},reset:function(){D=!1,Q=null,Z=null,ft=null,ut=null,Mt=null,Ut=null,Wt=null,dt=null}}}const r=new e,o=new n,a=new s;let h={};const l=new WeakMap;let f={},d={},c={},u=new WeakMap,p=[],x=null,g=!1,m=null,v=null,b=null,S=null,C=null,T=null,_=null,E=new pe(0,0,0),N=0,P=!1,L=null,F=null,W=null,U=null,G=null;const w=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let I=!1,X=0;const H=i.getParameter(i.VERSION);H.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(H)[1]),I=X>=1):H.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),I=X>=2);let j=null,et={};const mt=i.getParameter(i.SCISSOR_BOX),It=i.getParameter(i.VIEWPORT),K=new Ue().fromArray(mt),st=new Ue().fromArray(It);function xt(D,Q,Z,ft){const ut=new Uint8Array(4),Mt=i.createTexture();i.bindTexture(D,Mt),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ut=0;Ut<Z;Ut++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(Q,0,i.RGBA,1,1,ft,0,i.RGBA,i.UNSIGNED_BYTE,ut):i.texImage2D(Q+Ut,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ut);return Mt}const Rt={};Rt[i.TEXTURE_2D]=xt(i.TEXTURE_2D,i.TEXTURE_2D,1),Rt[i.TEXTURE_CUBE_MAP]=xt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Rt[i.TEXTURE_2D_ARRAY]=xt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Rt[i.TEXTURE_3D]=xt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),gt(i.DEPTH_TEST),o.setFunc(Cs),Bt(!1),Ct(pl),gt(i.CULL_FACE),pt(ji);function gt(D){f[D]!==!0&&(i.enable(D),f[D]=!0)}function At(D){f[D]!==!1&&(i.disable(D),f[D]=!1)}function Kt(D,Q){return c[D]!==Q?(i.bindFramebuffer(D,Q),c[D]=Q,D===i.DRAW_FRAMEBUFFER&&(c[i.FRAMEBUFFER]=Q),D===i.FRAMEBUFFER&&(c[i.DRAW_FRAMEBUFFER]=Q),!0):!1}function yt(D,Q){let Z=p,ft=!1;if(D){Z=u.get(Q),Z===void 0&&(Z=[],u.set(Q,Z));const ut=D.textures;if(Z.length!==ut.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let Mt=0,Ut=ut.length;Mt<Ut;Mt++)Z[Mt]=i.COLOR_ATTACHMENT0+Mt;Z.length=ut.length,ft=!0}}else Z[0]!==i.BACK&&(Z[0]=i.BACK,ft=!0);ft&&i.drawBuffers(Z)}function qt(D){return x!==D?(i.useProgram(D),x=D,!0):!1}const Xt={[Ki]:i.FUNC_ADD,[vu]:i.FUNC_SUBTRACT,[Mu]:i.FUNC_REVERSE_SUBTRACT};Xt[Su]=i.MIN,Xt[yu]=i.MAX;const it={[Eu]:i.ZERO,[bu]:i.ONE,[Tu]:i.SRC_COLOR,[Vc]:i.SRC_ALPHA,[Lu]:i.SRC_ALPHA_SATURATE,[Cu]:i.DST_COLOR,[wu]:i.DST_ALPHA,[Au]:i.ONE_MINUS_SRC_COLOR,[Wc]:i.ONE_MINUS_SRC_ALPHA,[Pu]:i.ONE_MINUS_DST_COLOR,[Ru]:i.ONE_MINUS_DST_ALPHA,[Du]:i.CONSTANT_COLOR,[Nu]:i.ONE_MINUS_CONSTANT_COLOR,[Iu]:i.CONSTANT_ALPHA,[Uu]:i.ONE_MINUS_CONSTANT_ALPHA};function pt(D,Q,Z,ft,ut,Mt,Ut,Wt,dt,ct){if(D===ji){g===!0&&(At(i.BLEND),g=!1);return}if(g===!1&&(gt(i.BLEND),g=!0),D!==xu){if(D!==m||ct!==P){if((v!==Ki||C!==Ki)&&(i.blendEquation(i.FUNC_ADD),v=Ki,C=Ki),ct)switch(D){case Ts:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ml:i.blendFunc(i.ONE,i.ONE);break;case gl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case _l:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ee("WebGLState: Invalid blending: ",D);break}else switch(D){case Ts:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ml:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case gl:Ee("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case _l:Ee("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ee("WebGLState: Invalid blending: ",D);break}b=null,S=null,T=null,_=null,E.set(0,0,0),N=0,m=D,P=ct}return}ut=ut||Q,Mt=Mt||Z,Ut=Ut||ft,(Q!==v||ut!==C)&&(i.blendEquationSeparate(Xt[Q],Xt[ut]),v=Q,C=ut),(Z!==b||ft!==S||Mt!==T||Ut!==_)&&(i.blendFuncSeparate(it[Z],it[ft],it[Mt],it[Ut]),b=Z,S=ft,T=Mt,_=Ut),(Wt.equals(E)===!1||dt!==N)&&(i.blendColor(Wt.r,Wt.g,Wt.b,dt),E.copy(Wt),N=dt),m=D,P=!1}function Et(D,Q){D.side===Fn?At(i.CULL_FACE):gt(i.CULL_FACE);let Z=D.side===dn;Q&&(Z=!Z),Bt(Z),D.blending===Ts&&D.transparent===!1?pt(ji):pt(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);const ft=D.stencilWrite;a.setTest(ft),ft&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Ht(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?gt(i.SAMPLE_ALPHA_TO_COVERAGE):At(i.SAMPLE_ALPHA_TO_COVERAGE)}function Bt(D){L!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),L=D)}function Ct(D){D!==mu?(gt(i.CULL_FACE),D!==F&&(D===pl?i.cullFace(i.BACK):D===gu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):At(i.CULL_FACE),F=D}function $t(D){D!==W&&(I&&i.lineWidth(D),W=D)}function Ht(D,Q,Z){D?(gt(i.POLYGON_OFFSET_FILL),(U!==Q||G!==Z)&&(U=Q,G=Z,o.getReversed()&&(Q=-Q,Z=-Z),i.polygonOffset(Q,Z))):At(i.POLYGON_OFFSET_FILL)}function ee(D){D?gt(i.SCISSOR_TEST):At(i.SCISSOR_TEST)}function le(D){D===void 0&&(D=i.TEXTURE0+w-1),j!==D&&(i.activeTexture(D),j=D)}function ce(D,Q,Z){Z===void 0&&(j===null?Z=i.TEXTURE0+w-1:Z=j);let ft=et[Z];ft===void 0&&(ft={type:void 0,texture:void 0},et[Z]=ft),(ft.type!==D||ft.texture!==Q)&&(j!==Z&&(i.activeTexture(Z),j=Z),i.bindTexture(D,Q||Rt[D]),ft.type=D,ft.texture=Q)}function B(){const D=et[j];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function Le(){try{i.compressedTexImage2D(...arguments)}catch(D){Ee("WebGLState:",D)}}function se(){try{i.compressedTexImage3D(...arguments)}catch(D){Ee("WebGLState:",D)}}function Te(){try{i.texSubImage2D(...arguments)}catch(D){Ee("WebGLState:",D)}}function q(){try{i.texSubImage3D(...arguments)}catch(D){Ee("WebGLState:",D)}}function at(){try{i.compressedTexSubImage2D(...arguments)}catch(D){Ee("WebGLState:",D)}}function ot(){try{i.compressedTexSubImage3D(...arguments)}catch(D){Ee("WebGLState:",D)}}function Dt(){try{i.texStorage2D(...arguments)}catch(D){Ee("WebGLState:",D)}}function R(){try{i.texStorage3D(...arguments)}catch(D){Ee("WebGLState:",D)}}function M(){try{i.texImage2D(...arguments)}catch(D){Ee("WebGLState:",D)}}function z(){try{i.texImage3D(...arguments)}catch(D){Ee("WebGLState:",D)}}function nt(D){return d[D]!==void 0?d[D]:i.getParameter(D)}function Y(D,Q){d[D]!==Q&&(i.pixelStorei(D,Q),d[D]=Q)}function lt(D){K.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),K.copy(D))}function _t(D){st.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),st.copy(D))}function $(D,Q){let Z=l.get(Q);Z===void 0&&(Z=new WeakMap,l.set(Q,Z));let ft=Z.get(D);ft===void 0&&(ft=i.getUniformBlockIndex(Q,D.name),i.uniformBlockBinding(Q,ft,ft),Z.set(D,ft))}function tt(D,Q,Z){const ut=l.get(Q).get(D);h[ut]!==Z&&(i.bindBufferBase(i.UNIFORM_BUFFER,ut,Z),h[ut]=Z)}function vt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),f={},d={},j=null,et={},c={},h={},u=new WeakMap,p=[],x=null,g=!1,m=null,v=null,b=null,S=null,C=null,T=null,_=null,E=new pe(0,0,0),N=0,P=!1,L=null,F=null,W=null,U=null,G=null,K.set(0,0,i.canvas.width,i.canvas.height),st.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:gt,disable:At,bindFramebuffer:Kt,drawBuffers:yt,useProgram:qt,setBlending:pt,setMaterial:Et,setFlipSided:Bt,setCullFace:Ct,setLineWidth:$t,setPolygonOffset:Ht,setScissorTest:ee,activeTexture:le,bindTexture:ce,unbindTexture:B,compressedTexImage2D:Le,compressedTexImage3D:se,texImage2D:M,texImage3D:z,pixelStorei:Y,getParameter:nt,updateUBOMapping:$,uniformBlockBinding:tt,texStorage2D:Dt,texStorage3D:R,texSubImage2D:Te,texSubImage3D:q,compressedTexSubImage2D:at,compressedTexSubImage3D:ot,scissor:lt,viewport:_t,reset:vt}}function n_(i,t,e,n,s,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,h=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new St,f=new WeakMap,d=new Set;let c;const u=new WeakMap,p=new Set,x=new FinalizationRegistry(R=>p.delete(R));let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(R,M){return g?new OffscreenCanvas(R,M):Pr("canvas")}function v(R,M,z){let nt=1;const Y=Dt(R);if((Y.width>z||Y.height>z)&&(nt=z/Math.max(Y.width,Y.height)),nt<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const lt=Math.floor(nt*Y.width),_t=Math.floor(nt*Y.height);c===void 0&&(c=m(lt,_t));const $=M?m(lt,_t):c;return $.width=lt,$.height=_t,$.getContext("2d").drawImage(R,0,0,lt,_t),Jt("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+lt+"x"+_t+")."),$}else return"data"in R&&Jt("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),R;return R}function b(R){return R.generateMipmaps}function S(R){i.generateMipmap(R)}function C(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(R,M,z,nt,Y,lt=!1){if(R!==null){if(i[R]!==void 0)return i[R];Jt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let _t;nt&&(_t=t.get("EXT_texture_norm16"),_t||Jt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let $=M;if(M===i.RED&&(z===i.FLOAT&&($=i.R32F),z===i.HALF_FLOAT&&($=i.R16F),z===i.UNSIGNED_BYTE&&($=i.R8),z===i.UNSIGNED_SHORT&&_t&&($=_t.R16_EXT),z===i.SHORT&&_t&&($=_t.R16_SNORM_EXT)),M===i.RED_INTEGER&&(z===i.UNSIGNED_BYTE&&($=i.R8UI),z===i.UNSIGNED_SHORT&&($=i.R16UI),z===i.UNSIGNED_INT&&($=i.R32UI),z===i.BYTE&&($=i.R8I),z===i.SHORT&&($=i.R16I),z===i.INT&&($=i.R32I)),M===i.RG&&(z===i.FLOAT&&($=i.RG32F),z===i.HALF_FLOAT&&($=i.RG16F),z===i.UNSIGNED_BYTE&&($=i.RG8),z===i.UNSIGNED_SHORT&&_t&&($=_t.RG16_EXT),z===i.SHORT&&_t&&($=_t.RG16_SNORM_EXT)),M===i.RG_INTEGER&&(z===i.UNSIGNED_BYTE&&($=i.RG8UI),z===i.UNSIGNED_SHORT&&($=i.RG16UI),z===i.UNSIGNED_INT&&($=i.RG32UI),z===i.BYTE&&($=i.RG8I),z===i.SHORT&&($=i.RG16I),z===i.INT&&($=i.RG32I)),M===i.RGB_INTEGER&&(z===i.UNSIGNED_BYTE&&($=i.RGB8UI),z===i.UNSIGNED_SHORT&&($=i.RGB16UI),z===i.UNSIGNED_INT&&($=i.RGB32UI),z===i.BYTE&&($=i.RGB8I),z===i.SHORT&&($=i.RGB16I),z===i.INT&&($=i.RGB32I)),M===i.RGBA_INTEGER&&(z===i.UNSIGNED_BYTE&&($=i.RGBA8UI),z===i.UNSIGNED_SHORT&&($=i.RGBA16UI),z===i.UNSIGNED_INT&&($=i.RGBA32UI),z===i.BYTE&&($=i.RGBA8I),z===i.SHORT&&($=i.RGBA16I),z===i.INT&&($=i.RGBA32I)),M===i.RGB&&(z===i.UNSIGNED_SHORT&&_t&&($=_t.RGB16_EXT),z===i.SHORT&&_t&&($=_t.RGB16_SNORM_EXT),z===i.UNSIGNED_INT_5_9_9_9_REV&&($=i.RGB9_E5),z===i.UNSIGNED_INT_10F_11F_11F_REV&&($=i.R11F_G11F_B10F)),M===i.RGBA){const tt=lt?Cr:Me.getTransfer(Y);z===i.FLOAT&&($=i.RGBA32F),z===i.HALF_FLOAT&&($=i.RGBA16F),z===i.UNSIGNED_BYTE&&($=tt===Ae?i.SRGB8_ALPHA8:i.RGBA8),z===i.UNSIGNED_SHORT&&_t&&($=_t.RGBA16_EXT),z===i.SHORT&&_t&&($=_t.RGBA16_SNORM_EXT),z===i.UNSIGNED_SHORT_4_4_4_4&&($=i.RGBA4),z===i.UNSIGNED_SHORT_5_5_5_1&&($=i.RGB5_A1)}return($===i.R16F||$===i.R32F||$===i.RG16F||$===i.RG32F||$===i.RGBA16F||$===i.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function _(R,M){let z;return R?M===null||M===Wn||M===ss?z=i.DEPTH24_STENCIL8:M===Bn?z=i.DEPTH32F_STENCIL8:M===Ls&&(z=i.DEPTH24_STENCIL8,Jt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Wn||M===ss?z=i.DEPTH_COMPONENT24:M===Bn?z=i.DEPTH_COMPONENT32F:M===Ls&&(z=i.DEPTH_COMPONENT16),z}function E(R,M){return b(R)===!0||R.isFramebufferTexture&&R.minFilter!==tn&&R.minFilter!==fn?Math.log2(Math.max(M.width,M.height))+1:R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?M.mipmaps.length:1}function N(R){const M=new WeakRef(R);n.get(R).__ref=M,p.add(M),x.register(R,M,M)}function P(R){const M=n.get(R).__ref;M!==void 0&&(p.delete(M),x.unregister(M))}function L(R){W(R.target)}function F(R){U(R.target)}function W(R){R.removeEventListener("dispose",L),P(R),w(R),R.isVideoTexture&&f.delete(R),R.isHTMLTexture&&d.delete(R)}function U(R){R.removeEventListener("dispose",F),P(R),X(R)}function G(){for(const R of p){const M=R.deref();M!==void 0&&(M.isRenderTarget===!0?U(M):W(M))}p.clear(),d.clear()}function w(R){const M=n.get(R);if(M.__webglInit===void 0)return;const z=R.source,nt=u.get(z);if(nt){const Y=nt[M.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&I(R),Object.keys(nt).length===0&&u.delete(z)}n.remove(R)}function I(R){const M=n.get(R);i.deleteTexture(M.__webglTexture);const z=R.source,nt=u.get(z);delete nt[M.__cacheKey],o.memory.textures--}function X(R){const M=n.get(R);M.__depthDisposeCallback&&M.__depthDisposeCallback();const z=R.depthTexture;if(z&&z.renderTarget===R&&W(z),R.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(M.__webglFramebuffer[Y]))for(let lt=0;lt<M.__webglFramebuffer[Y].length;lt++)i.deleteFramebuffer(M.__webglFramebuffer[Y][lt]);else i.deleteFramebuffer(M.__webglFramebuffer[Y]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[Y])}else{if(Array.isArray(M.__webglFramebuffer))for(let Y=0;Y<M.__webglFramebuffer.length;Y++)i.deleteFramebuffer(M.__webglFramebuffer[Y]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let Y=0;Y<M.__webglColorRenderbuffer.length;Y++)M.__webglColorRenderbuffer[Y]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[Y]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const nt=R.textures;for(let Y=0,lt=nt.length;Y<lt;Y++){const _t=n.get(nt[Y]);_t.__webglTexture&&(i.deleteTexture(_t.__webglTexture),o.memory.textures--),n.remove(nt[Y])}n.remove(R)}let H=0;function j(){H=0}function et(){return H}function mt(R){H=R}function It(){const R=H;return R>=s.maxTextures&&Jt("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),H+=1,R}function K(R){const M=[];return M.push(R.wrapS),M.push(R.wrapT),M.push(R.wrapR||0),M.push(R.magFilter),M.push(R.minFilter),M.push(R.anisotropy),M.push(R.internalFormat),M.push(R.format),M.push(R.type),M.push(R.generateMipmaps),M.push(R.mipmapsAutoUpdate),M.push(R.premultiplyAlpha),M.push(R.flipY),M.push(R.unpackAlignment),M.push(R.colorSpace),M.join()}function st(R,M){const z=n.get(R);if(R.isVideoTexture&&at(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&z.__version!==R.version){const nt=R.image;if(nt===null)Jt("WebGLRenderer: Texture marked for update but no image data found.");else if(nt.complete===!1)Jt("WebGLRenderer: Texture marked for update but image is incomplete");else{Et(z,R,M);return}}else R.isExternalTexture&&(z.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,z.__webglTexture,i.TEXTURE0+M)}function xt(R,M){const z=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&z.__version!==R.version){Et(z,R,M);return}else R.isExternalTexture&&(z.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,z.__webglTexture,i.TEXTURE0+M)}function Rt(R,M){const z=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&z.__version!==R.version){Et(z,R,M);return}e.bindTexture(i.TEXTURE_3D,z.__webglTexture,i.TEXTURE0+M)}function gt(R,M){const z=n.get(R);if(R.version>0&&z.__version!==R.version){Bt(z,R,M);return}e.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+M)}const At={[Bo]:i.REPEAT,[ti]:i.CLAMP_TO_EDGE,[zo]:i.MIRRORED_REPEAT},Kt={[tn]:i.NEAREST,[Bu]:i.NEAREST_MIPMAP_NEAREST,[ks]:i.NEAREST_MIPMAP_LINEAR,[fn]:i.LINEAR,[Yr]:i.LINEAR_MIPMAP_NEAREST,[mi]:i.LINEAR_MIPMAP_LINEAR},yt={[ku]:i.NEVER,[ch]:i.ALWAYS,[Vu]:i.LESS,[ah]:i.LEQUAL,[Wu]:i.EQUAL,[lh]:i.GEQUAL,[Xu]:i.GREATER,[Yu]:i.NOTEQUAL};function qt(R,M){if(M.type===Bn&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===fn||M.magFilter===Yr||M.magFilter===ks||M.magFilter===mi||M.minFilter===fn||M.minFilter===Yr||M.minFilter===ks||M.minFilter===mi)&&Jt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,At[M.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,At[M.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,At[M.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,Kt[M.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,Kt[M.minFilter]),M.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,yt[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===tn||M.minFilter!==ks&&M.minFilter!==mi||M.type===Bn&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){const z=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function Xt(R,M){let z=!1;R.__webglInit===void 0&&(R.__webglInit=!0,M.addEventListener("dispose",L),N(M));const nt=M.source;let Y=u.get(nt);Y===void 0&&(Y={},u.set(nt,Y));const lt=K(M);if(lt!==R.__cacheKey){Y[lt]===void 0&&(Y[lt]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,z=!0),Y[lt].usedTimes++;const _t=Y[R.__cacheKey];_t!==void 0&&(Y[R.__cacheKey].usedTimes--,_t.usedTimes===0&&I(M)),R.__cacheKey=lt,R.__webglTexture=Y[lt].texture}return z}function it(R,M,z){return Math.floor(Math.floor(R/z)/M)}function pt(R,M,z,nt){const lt=R.updateRanges;if(lt.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,M.width,M.height,z,nt,M.data);else{lt.sort((D,Q)=>D.start-Q.start);let _t=0;for(let D=1;D<lt.length;D++){const Q=lt[_t],Z=lt[D],ft=Q.start+Q.count,ut=it(Z.start,M.width,4),Mt=it(Q.start,M.width,4);Z.start<=ft+1&&ut===Mt&&it(Z.start+Z.count-1,M.width,4)===ut?Q.count=Math.max(Q.count,Z.start+Z.count-Q.start):(++_t,lt[_t]=Z)}lt.length=_t+1;const $=e.getParameter(i.UNPACK_ROW_LENGTH),tt=e.getParameter(i.UNPACK_SKIP_PIXELS),vt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,M.width);for(let D=0,Q=lt.length;D<Q;D++){const Z=lt[D],ft=Math.floor(Z.start/4),ut=Math.ceil(Z.count/4),Mt=ft%M.width,Ut=Math.floor(ft/M.width),Wt=ut,dt=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,Mt),e.pixelStorei(i.UNPACK_SKIP_ROWS,Ut),e.texSubImage2D(i.TEXTURE_2D,0,Mt,Ut,Wt,dt,z,nt,M.data)}R.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,$),e.pixelStorei(i.UNPACK_SKIP_PIXELS,tt),e.pixelStorei(i.UNPACK_SKIP_ROWS,vt)}}function Et(R,M,z){let nt=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(nt=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(nt=i.TEXTURE_3D);const Y=Xt(R,M),lt=M.source;e.bindTexture(nt,R.__webglTexture,i.TEXTURE0+z);const _t=n.get(lt);if(lt.version!==_t.__version||Y===!0){if(e.activeTexture(i.TEXTURE0+z),(typeof ImageBitmap<"u"&&M.image instanceof ImageBitmap)===!1){const dt=Me.getPrimaries(Me.workingColorSpace),ct=M.colorSpace===pi?null:Me.getPrimaries(M.colorSpace),Pt=M.colorSpace===pi||dt===ct?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pt)}e.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment);let tt=v(M.image,!1,s.maxTextureSize);tt=ot(M,tt);const vt=r.convert(M.format,M.colorSpace),D=r.convert(M.type);let Q=T(M.internalFormat,vt,D,M.normalized,M.colorSpace,M.isVideoTexture);qt(nt,M);let Z;const ft=M.mipmaps,ut=M.isVideoTexture!==!0,Mt=_t.__version===void 0||Y===!0,Ut=lt.dataReady,Wt=E(M,tt);if(M.isDepthTexture)Q=_(M.format===gi,M.type),Mt&&(ut?e.texStorage2D(i.TEXTURE_2D,1,Q,tt.width,tt.height):e.texImage2D(i.TEXTURE_2D,0,Q,tt.width,tt.height,0,vt,D,null));else if(M.isDataTexture)if(ft.length>0){ut&&Mt&&e.texStorage2D(i.TEXTURE_2D,Wt,Q,ft[0].width,ft[0].height);for(let dt=0,ct=ft.length;dt<ct;dt++)Z=ft[dt],ut?Ut&&e.texSubImage2D(i.TEXTURE_2D,dt,0,0,Z.width,Z.height,vt,D,Z.data):e.texImage2D(i.TEXTURE_2D,dt,Q,Z.width,Z.height,0,vt,D,Z.data);M.generateMipmaps=!1}else ut?(Mt&&e.texStorage2D(i.TEXTURE_2D,Wt,Q,tt.width,tt.height),Ut&&pt(M,tt,vt,D)):e.texImage2D(i.TEXTURE_2D,0,Q,tt.width,tt.height,0,vt,D,tt.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){ut&&Mt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Wt,Q,ft[0].width,ft[0].height,tt.depth);for(let dt=0,ct=ft.length;dt<ct;dt++)if(Z=ft[dt],M.format!==zn)if(vt!==null)if(ut){if(Ut)if(M.layerUpdates.size>0){const Pt=ec(Z.width,Z.height,M.format,M.type);for(const ht of M.layerUpdates){const Yt=Z.data.subarray(ht*Pt/Z.data.BYTES_PER_ELEMENT,(ht+1)*Pt/Z.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,dt,0,0,ht,Z.width,Z.height,1,vt,Yt)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,dt,0,0,0,Z.width,Z.height,tt.depth,vt,Z.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,dt,Q,Z.width,Z.height,tt.depth,0,Z.data,0,0);else Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ut?Ut&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,dt,0,0,0,Z.width,Z.height,tt.depth,vt,D,Z.data):e.texImage3D(i.TEXTURE_2D_ARRAY,dt,Q,Z.width,Z.height,tt.depth,0,vt,D,Z.data);M.layerUpdates.size>0&&M.clearLayerUpdates()}else{ut&&Mt&&e.texStorage2D(i.TEXTURE_2D,Wt,Q,ft[0].width,ft[0].height);for(let dt=0,ct=ft.length;dt<ct;dt++)Z=ft[dt],M.format!==zn?vt!==null?ut?Ut&&e.compressedTexSubImage2D(i.TEXTURE_2D,dt,0,0,Z.width,Z.height,vt,Z.data):e.compressedTexImage2D(i.TEXTURE_2D,dt,Q,Z.width,Z.height,0,Z.data):Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ut?Ut&&e.texSubImage2D(i.TEXTURE_2D,dt,0,0,Z.width,Z.height,vt,D,Z.data):e.texImage2D(i.TEXTURE_2D,dt,Q,Z.width,Z.height,0,vt,D,Z.data)}else if(M.isDataArrayTexture)if(ut){if(Mt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Wt,Q,tt.width,tt.height,tt.depth),Ut)if(M.layerUpdates.size>0){const dt=ec(tt.width,tt.height,M.format,M.type);for(const ct of M.layerUpdates){const Pt=tt.data.subarray(ct*dt/tt.data.BYTES_PER_ELEMENT,(ct+1)*dt/tt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ct,tt.width,tt.height,1,vt,D,Pt)}M.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,tt.width,tt.height,tt.depth,vt,D,tt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Q,tt.width,tt.height,tt.depth,0,vt,D,tt.data);else if(M.isData3DTexture)ut?(Mt&&e.texStorage3D(i.TEXTURE_3D,Wt,Q,tt.width,tt.height,tt.depth),Ut&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,tt.width,tt.height,tt.depth,vt,D,tt.data)):e.texImage3D(i.TEXTURE_3D,0,Q,tt.width,tt.height,tt.depth,0,vt,D,tt.data);else if(M.isFramebufferTexture){if(Mt)if(ut)e.texStorage2D(i.TEXTURE_2D,Wt,Q,tt.width,tt.height);else{let dt=tt.width,ct=tt.height;for(let Pt=0;Pt<Wt;Pt++)e.texImage2D(i.TEXTURE_2D,Pt,Q,dt,ct,0,vt,D,null),dt>>=1,ct>>=1}}else if(M.isHTMLTexture){if("texElementImage2D"in i){const dt=i.canvas;if(dt.hasAttribute("layoutsubtree")||dt.setAttribute("layoutsubtree","true"),tt.parentNode!==dt){dt.appendChild(tt),d.add(M),dt.onpaint=ct=>{const Pt=ct.changedElements;for(const ht of d)Pt.includes(ht.image)&&(ht.needsUpdate=!0)},dt.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,tt);else{const Pt=i.RGBA,ht=i.RGBA,Yt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Pt,ht,Yt,tt)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(ft.length>0){if(ut&&Mt){const dt=Dt(ft[0]);e.texStorage2D(i.TEXTURE_2D,Wt,Q,dt.width,dt.height)}for(let dt=0,ct=ft.length;dt<ct;dt++)Z=ft[dt],ut?Ut&&e.texSubImage2D(i.TEXTURE_2D,dt,0,0,vt,D,Z):e.texImage2D(i.TEXTURE_2D,dt,Q,vt,D,Z);M.generateMipmaps=!1}else if(ut){if(Mt){const dt=Dt(tt);e.texStorage2D(i.TEXTURE_2D,Wt,Q,dt.width,dt.height)}Ut&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,vt,D,tt)}else e.texImage2D(i.TEXTURE_2D,0,Q,vt,D,tt);b(M)&&M.mipmapsAutoUpdate===!0&&S(nt),_t.__version=lt.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function Bt(R,M,z){if(M.image.length!==6)return;const nt=Xt(R,M),Y=M.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+z);const lt=n.get(Y);if(Y.version!==lt.__version||nt===!0){e.activeTexture(i.TEXTURE0+z);const _t=Me.getPrimaries(Me.workingColorSpace),$=M.colorSpace===pi?null:Me.getPrimaries(M.colorSpace),tt=M.colorSpace===pi||_t===$?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,tt);const vt=M.isCompressedTexture||M.image[0].isCompressedTexture,D=M.image[0]&&M.image[0].isDataTexture,Q=[];for(let ht=0;ht<6;ht++)!vt&&!D?Q[ht]=v(M.image[ht],!0,s.maxCubemapSize):Q[ht]=D?M.image[ht].image:M.image[ht],Q[ht]=ot(M,Q[ht]);const Z=Q[0],ft=r.convert(M.format,M.colorSpace),ut=r.convert(M.type);let Mt=T(M.internalFormat,ft,ut,M.normalized,M.colorSpace);const Ut=M.isVideoTexture!==!0,Wt=lt.__version===void 0||nt===!0,dt=Y.dataReady;let ct=E(M,Z);qt(i.TEXTURE_CUBE_MAP,M);let Pt;if(M.isDepthTexture){if(Mt=_(M.format===gi,M.type),Wt)if(Ut)e.texStorage2D(i.TEXTURE_CUBE_MAP,1,Mt,Z.width,Z.height);else for(let ht=0;ht<6;ht++)e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,Mt,Z.width,Z.height,0,ft,ut,null)}else if(vt){Ut&&Wt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ct,Mt,Z.width,Z.height);for(let ht=0;ht<6;ht++){Pt=Q[ht].mipmaps;for(let Yt=0;Yt<Pt.length;Yt++){const xe=Pt[Yt];M.format!==zn?ft!==null?Ut?dt&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Yt,0,0,xe.width,xe.height,ft,xe.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Yt,Mt,xe.width,xe.height,0,xe.data):Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ut?dt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Yt,0,0,xe.width,xe.height,ft,ut,xe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Yt,Mt,xe.width,xe.height,0,ft,ut,xe.data)}}}else{if(Pt=M.mipmaps,Ut&&Wt){Pt.length>0&&ct++;const ht=Dt(Q[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,ct,Mt,ht.width,ht.height)}for(let ht=0;ht<6;ht++)if(D){Ut?dt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,0,0,Q[ht].width,Q[ht].height,ft,ut,Q[ht].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,Mt,Q[ht].width,Q[ht].height,0,ft,ut,Q[ht].data);for(let Yt=0;Yt<Pt.length;Yt++){const Pe=Pt[Yt].image[ht].image;Ut?dt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Yt+1,0,0,Pe.width,Pe.height,ft,ut,Pe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Yt+1,Mt,Pe.width,Pe.height,0,ft,ut,Pe.data)}}else{Ut?dt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,0,0,ft,ut,Q[ht]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,Mt,ft,ut,Q[ht]);for(let Yt=0;Yt<Pt.length;Yt++){const xe=Pt[Yt];Ut?dt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Yt+1,0,0,ft,ut,xe.image[ht]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Yt+1,Mt,ft,ut,xe.image[ht])}}}b(M)&&M.mipmapsAutoUpdate===!0&&S(i.TEXTURE_CUBE_MAP),lt.__version=Y.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function Ct(R,M,z,nt,Y,lt){const _t=r.convert(z.format,z.colorSpace),$=r.convert(z.type),tt=T(z.internalFormat,_t,$,z.normalized,z.colorSpace),vt=n.get(M),D=n.get(z);if(D.__renderTarget=M,!vt.__hasExternalTextures){const Q=Math.max(1,M.width>>lt),Z=Math.max(1,M.height>>lt);Y===i.TEXTURE_3D||Y===i.TEXTURE_2D_ARRAY?e.texImage3D(Y,lt,tt,Q,Z,M.depth,0,_t,$,null):e.texImage2D(Y,lt,tt,Q,Z,0,_t,$,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),q(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,nt,Y,D.__webglTexture,0,Te(M)):(Y===i.TEXTURE_2D||Y>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,nt,Y,D.__webglTexture,lt),e.bindFramebuffer(i.FRAMEBUFFER,null)}function $t(R,M,z){if(i.bindRenderbuffer(i.RENDERBUFFER,R),M.depthBuffer){const nt=M.depthTexture,Y=nt&&nt.isDepthTexture?nt.type:null,lt=_(M.stencilBuffer,Y),_t=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;q(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Te(M),lt,M.width,M.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,Te(M),lt,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,lt,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,_t,i.RENDERBUFFER,R)}else{const nt=M.textures;for(let Y=0;Y<nt.length;Y++){const lt=nt[Y],_t=r.convert(lt.format,lt.colorSpace),$=r.convert(lt.type),tt=T(lt.internalFormat,_t,$,lt.normalized,lt.colorSpace);q(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Te(M),tt,M.width,M.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,Te(M),tt,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,tt,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ht(R,M,z){const nt=M.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const Y=n.get(M.depthTexture);Y.__renderTarget=M;const lt=nt?M.depthTexture.image[0]:M.depthTexture.image;(!Y.__webglTexture||lt.width!==M.width||lt.height!==M.height)&&(lt.width=M.width,lt.height=M.height,M.depthTexture.needsUpdate=!0),nt?gt(M.depthTexture,0):st(M.depthTexture,0);const _t=Y.__webglTexture,$=Te(M),tt=nt?i.TEXTURE_CUBE_MAP_POSITIVE_X+z:i.TEXTURE_2D,vt=M.depthTexture.format===gi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(M.depthTexture.format===vi)q(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,vt,tt,_t,0,$):i.framebufferTexture2D(i.FRAMEBUFFER,vt,tt,_t,0);else if(M.depthTexture.format===gi)q(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,vt,tt,_t,0,$):i.framebufferTexture2D(i.FRAMEBUFFER,vt,tt,_t,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ee(R){const M=n.get(R),z=R.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==R.depthTexture){const nt=R.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),nt){const Y=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,nt.removeEventListener("dispose",Y)};nt.addEventListener("dispose",Y),M.__depthDisposeCallback=Y}M.__boundDepthTexture=nt}if(R.depthTexture&&!M.__autoAllocateDepthBuffer)if(z)for(let nt=0;nt<6;nt++)Ht(M.__webglFramebuffer[nt],R,nt);else R.texture.mipmaps.length>0?Ht(M.__webglFramebuffer[0],R,0):Ht(M.__webglFramebuffer,R,0);else if(z){M.__webglDepthbuffer=[];for(let nt=0;nt<6;nt++)if(e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[nt]),M.__webglDepthbuffer[nt]===void 0)M.__webglDepthbuffer[nt]=i.createRenderbuffer(),$t(M.__webglDepthbuffer[nt],R,!1);else{const Y=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,lt=M.__webglDepthbuffer[nt];i.bindRenderbuffer(i.RENDERBUFFER,lt),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,lt)}}else if(R.texture.mipmaps.length>0?e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),$t(M.__webglDepthbuffer,R,!1);else{const Y=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,lt=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,lt),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,lt)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function le(R,M,z){const nt=n.get(R);M!==void 0&&Ct(nt.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),z!==void 0&&ee(R)}function ce(R){const M=R.texture,z=n.get(R),nt=n.get(M);R.addEventListener("dispose",F),N(R);const Y=R.textures,lt=R.isWebGLCubeRenderTarget===!0,_t=Y.length>1;if(_t||(nt.__webglTexture===void 0&&(nt.__webglTexture=i.createTexture()),nt.__version=M.version,o.memory.textures++),lt){z.__webglFramebuffer=[];for(let $=0;$<6;$++)if(M.mipmaps.length>0){z.__webglFramebuffer[$]=[];for(let tt=0;tt<M.mipmaps.length;tt++)z.__webglFramebuffer[$][tt]=i.createFramebuffer()}else z.__webglFramebuffer[$]=i.createFramebuffer()}else{if(M.mipmaps.length>0){z.__webglFramebuffer=[];for(let $=0;$<M.mipmaps.length;$++)z.__webglFramebuffer[$]=i.createFramebuffer()}else z.__webglFramebuffer=i.createFramebuffer();if(_t)for(let $=0,tt=Y.length;$<tt;$++){const vt=n.get(Y[$]);vt.__webglTexture===void 0&&(vt.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&q(R)===!1){z.__webglMultisampledFramebuffer=i.createFramebuffer(),z.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let $=0;$<Y.length;$++){const tt=Y[$];z.__webglColorRenderbuffer[$]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,z.__webglColorRenderbuffer[$]);const vt=r.convert(tt.format,tt.colorSpace),D=r.convert(tt.type),Q=T(tt.internalFormat,vt,D,tt.normalized,tt.colorSpace,R.isXRRenderTarget===!0),Z=Te(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,Z,Q,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+$,i.RENDERBUFFER,z.__webglColorRenderbuffer[$])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(z.__webglDepthRenderbuffer=i.createRenderbuffer(),$t(z.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(lt){e.bindTexture(i.TEXTURE_CUBE_MAP,nt.__webglTexture),qt(i.TEXTURE_CUBE_MAP,M);for(let $=0;$<6;$++)if(M.mipmaps.length>0)for(let tt=0;tt<M.mipmaps.length;tt++)Ct(z.__webglFramebuffer[$][tt],R,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+$,tt);else Ct(z.__webglFramebuffer[$],R,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0);b(M)?S(i.TEXTURE_CUBE_MAP):M.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,M.mipmaps.length-1),e.unbindTexture()}else if(_t){for(let $=0,tt=Y.length;$<tt;$++){const vt=Y[$],D=n.get(vt);let Q=i.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Q=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Q,D.__webglTexture),qt(Q,vt),Ct(z.__webglFramebuffer,R,vt,i.COLOR_ATTACHMENT0+$,Q,0),b(vt)&&S(Q)}e.unbindTexture()}else{let $=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&($=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture($,nt.__webglTexture),qt($,M),M.mipmaps.length>0)for(let tt=0;tt<M.mipmaps.length;tt++)Ct(z.__webglFramebuffer[tt],R,M,i.COLOR_ATTACHMENT0,$,tt);else Ct(z.__webglFramebuffer,R,M,i.COLOR_ATTACHMENT0,$,0);b(M)?S($):M.mipmaps.length>0&&i.texParameteri($,i.TEXTURE_MAX_LEVEL,M.mipmaps.length-1),e.unbindTexture()}R.depthBuffer&&ee(R)}function B(R){const M=R.textures;for(let z=0,nt=M.length;z<nt;z++){const Y=M[z];if(b(Y)&&Y.mipmapsAutoUpdate===!0){const lt=C(R),_t=n.get(Y).__webglTexture;e.bindTexture(lt,_t),S(lt),e.unbindTexture()}}}const Le=[];function se(R){if(R.samples>0){if(q(R)===!1){const M=R.textures,z=R.width,nt=R.height;let Y=i.COLOR_BUFFER_BIT;const lt=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_t=n.get(R),$=M.length>1;if($)for(let vt=0;vt<M.length;vt++)e.bindFramebuffer(i.FRAMEBUFFER,_t.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,_t.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,_t.__webglMultisampledFramebuffer),R.texture.mipmaps.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,_t.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,_t.__webglFramebuffer);for(let vt=0;vt<M.length;vt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(Y|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(Y|=i.STENCIL_BUFFER_BIT)),$){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,_t.__webglColorRenderbuffer[vt]);const D=n.get(M[vt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,D,0)}i.blitFramebuffer(0,0,z,nt,0,0,z,nt,Y,i.NEAREST),h===!0&&(Le.length=0,Le.push(i.COLOR_ATTACHMENT0+vt),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&Le.push(lt),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Le))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),$)for(let vt=0;vt<M.length;vt++){e.bindFramebuffer(i.FRAMEBUFFER,_t.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.RENDERBUFFER,_t.__webglColorRenderbuffer[vt]);const D=n.get(M[vt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,_t.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.TEXTURE_2D,D,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,_t.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&h){const M=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function Te(R){return Math.min(s.maxSamples,R.samples)}function q(R){const M=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function at(R){const M=o.render.frame;f.get(R)!==M&&(f.set(R,M),R.update())}function ot(R,M){const z=R.colorSpace,nt=R.format,Y=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||z!==Rr&&z!==pi&&(Me.getTransfer(z)===Ae?(nt!==zn||Y!==gn)&&Jt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ee("WebGLTextures: Unsupported texture color space:",z)),M}function Dt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=It,this.resetTextureUnits=j,this.getTextureUnits=et,this.setTextureUnits=mt,this.setTexture2D=st,this.setTexture2DArray=xt,this.setTexture3D=Rt,this.setTextureCube=gt,this.rebindTextures=le,this.setupRenderTarget=ce,this.updateRenderTargetMipmap=B,this.updateMultisampleRenderTarget=se,this.setupDepthRenderbuffer=ee,this.setupFrameBufferTexture=Ct,this.useMultisampledRTT=q,this.dispose=G}function i_(i,t){function e(n,s=pi){let r;const o=Me.getTransfer(s);if(n===gn)return i.UNSIGNED_BYTE;if(n===Ia)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ua)return i.UNSIGNED_SHORT_5_5_5_1;if(n===nh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===ih)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===th)return i.BYTE;if(n===eh)return i.SHORT;if(n===Ls)return i.UNSIGNED_SHORT;if(n===Na)return i.INT;if(n===Wn)return i.UNSIGNED_INT;if(n===Bn)return i.FLOAT;if(n===Xn)return i.HALF_FLOAT;if(n===sh)return i.ALPHA;if(n===rh)return i.RGB;if(n===zn)return i.RGBA;if(n===vi)return i.DEPTH_COMPONENT;if(n===gi)return i.DEPTH_STENCIL;if(n===oh)return i.RED;if(n===Oa)return i.RED_INTEGER;if(n===Ci)return i.RG;if(n===Fa)return i.RG_INTEGER;if(n===Ba)return i.RGBA_INTEGER;if(n===_r||n===xr||n===vr||n===Mr)if(o===Ae)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===_r)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===xr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===vr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Mr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===_r)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===xr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===vr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Mr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ho||n===Go||n===ko||n===Vo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ho)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Go)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ko)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Vo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Wo||n===Xo||n===Yo||n===qo||n===Zo||n===Ar||n===Ko)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Wo||n===Xo)return o===Ae?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Yo)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===qo)return r.COMPRESSED_R11_EAC;if(n===Zo)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Ar)return r.COMPRESSED_RG11_EAC;if(n===Ko)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Jo||n===$o||n===Qo||n===jo||n===ta||n===ea||n===na||n===ia||n===sa||n===ra||n===oa||n===aa||n===la||n===ca)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Jo)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===$o)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Qo)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===jo)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ta)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ea)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===na)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ia)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===sa)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ra)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===oa)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===aa)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===la)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ca)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ha||n===ua||n===fa)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===ha)return o===Ae?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ua)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===fa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===da||n===pa||n===wr||n===ma)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===da)return r.COMPRESSED_RED_RGTC1_EXT;if(n===pa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===wr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ma)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ss?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}const s_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,r_=`
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

}`;class o_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){const n=new vh(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Li({vertexShader:s_,fragmentShader:r_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new _n(new Br(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class a_ extends Si{constructor(t,e){super();const n=this;let s=null,r=1,o=null,a="local-floor",h=1,l=null,f=null,d=null,c=null,u=null,p=null;const x=typeof XRWebGLBinding<"u",g=new o_,m={},v=e.getContextAttributes();let b=null,S=null;const C=[],T=[],_=new St;let E=null,N=null;const P=new Mn;P.viewport=new Ue;const L=new Mn;L.viewport=new Ue;const F=[P,L],W=new xd;let U=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let st=C[K];return st===void 0&&(st=new to,C[K]=st),st.getTargetRaySpace()},this.getControllerGrip=function(K){let st=C[K];return st===void 0&&(st=new to,C[K]=st),st.getGripSpace()},this.getHand=function(K){let st=C[K];return st===void 0&&(st=new to,C[K]=st),st.getHandSpace()};function w(K){const st=T.indexOf(K.inputSource);if(st===-1)return;const xt=C[st];xt!==void 0&&(xt.update(K.inputSource,K.frame,l||o),xt.dispatchEvent({type:K.type,data:K.inputSource}))}function I(){s.removeEventListener("select",w),s.removeEventListener("selectstart",w),s.removeEventListener("selectend",w),s.removeEventListener("squeeze",w),s.removeEventListener("squeezestart",w),s.removeEventListener("squeezeend",w),s.removeEventListener("end",I),s.removeEventListener("inputsourceschange",X);for(let K=0;K<C.length;K++){const st=T[K];st!==null&&(T[K]=null,C[K].disconnect(st))}U=null,G=null,g.reset();for(const K in m)delete m[K];if(t.setRenderTarget(b),u=null,c=null,d=null,s=null,S=null,It.stop(),n.isPresenting=!1,t.setPixelRatio(E),t.setSize(_.width,_.height,!1),N!==null){const K=N.camera;K.fov=N.fov,K.zoom=N.zoom,K.updateProjectionMatrix(),N=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,n.isPresenting===!0&&Jt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){a=K,n.isPresenting===!0&&Jt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(K){l=K},this.getBaseLayer=function(){return c!==null?c:u},this.getBinding=function(){return d===null&&x&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(b=t.getRenderTarget(),s.addEventListener("select",w),s.addEventListener("selectstart",w),s.addEventListener("selectend",w),s.addEventListener("squeeze",w),s.addEventListener("squeezestart",w),s.addEventListener("squeezeend",w),s.addEventListener("end",I),s.addEventListener("inputsourceschange",X),v.xrCompatible!==!0&&await e.makeXRCompatible(),E=t.getPixelRatio(),t.getSize(_),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let xt=null,Rt=null,gt=null;v.depth&&(gt=v.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,xt=v.stencil?gi:vi,Rt=v.stencil?ss:Wn);const At={colorFormat:e.RGBA8,depthFormat:gt,scaleFactor:r};d=this.getBinding(),c=d.createProjectionLayer(At),s.updateRenderState({layers:[c]}),t.setPixelRatio(1),t.setSize(c.textureWidth,c.textureHeight,!1),S=new kn(c.textureWidth,c.textureHeight,{format:zn,type:gn,depthTexture:new rs(c.textureWidth,c.textureHeight,Rt,void 0,void 0,void 0,void 0,void 0,void 0,xt),stencilBuffer:v.stencil,colorSpace:t.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:c.ignoreDepthValues===!1,resolveStencilBuffer:c.ignoreDepthValues===!1,storeMultisampledDepthBuffer:c.ignoreDepthValues===!1,storeMultisampledStencilBuffer:c.ignoreDepthValues===!1})}else{const xt={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:r};u=new XRWebGLLayer(s,e,xt),s.updateRenderState({baseLayer:u}),t.setPixelRatio(1),t.setSize(u.framebufferWidth,u.framebufferHeight,!1),S=new kn(u.framebufferWidth,u.framebufferHeight,{format:zn,type:gn,colorSpace:t.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(h),l=null,o=await s.requestReferenceSpace(a),It.setContext(s),It.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function X(K){for(let st=0;st<K.removed.length;st++){const xt=K.removed[st],Rt=T.indexOf(xt);Rt>=0&&(T[Rt]=null,C[Rt].disconnect(xt))}for(let st=0;st<K.added.length;st++){const xt=K.added[st];let Rt=T.indexOf(xt);if(Rt===-1){for(let At=0;At<C.length;At++)if(At>=T.length){T.push(xt),Rt=At;break}else if(T[At]===null){T[At]=xt,Rt=At;break}if(Rt===-1)break}const gt=C[Rt];gt&&gt.connect(xt)}}function H(K,st){st===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(st.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let st=K.near,xt=K.far;g.texture!==null&&(g.depthNear>0&&(st=g.depthNear),g.depthFar>0&&(xt=g.depthFar)),W.near=L.near=P.near=st,W.far=L.far=P.far=xt,(U!==W.near||G!==W.far)&&(s.updateRenderState({depthNear:W.near,depthFar:W.far}),U=W.near,G=W.far),W.layers.mask=K.layers.mask|6,P.layers.mask=W.layers.mask&-5,L.layers.mask=W.layers.mask&-3;const Rt=K.parent,gt=W.cameras;H(W,Rt);for(let At=0;At<gt.length;At++)H(gt[At],Rt);W.projectionMatrix.copy(P.projectionMatrix),W.projectionMatrixInverse.copy(P.projectionMatrixInverse),N===null&&K.isPerspectiveCamera&&(N={camera:K,fov:K.fov,zoom:K.zoom}),j(K,W,Rt)};function j(K,st,xt){xt===null?K.matrix.copy(st.matrixWorld):(K.matrix.copy(xt.matrixWorld),K.matrix.invert(),K.matrix.multiply(st.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(st.projectionMatrix),K.projectionMatrixInverse.copy(st.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=_a*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return W},this.getFoveation=function(){if(!(c===null&&u===null))return h},this.setFoveation=function(K){h=K,c!==null&&(c.fixedFoveation=K),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=K)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(W)},this.getCameraTexture=function(K){return m[K]};let et=null;function mt(K,st){if(f=st.getViewerPose(l||o),p=st,f!==null){const xt=f.views;u!==null&&(t.setRenderTargetFramebuffer(S,u.framebuffer),t.setRenderTarget(S));let Rt=!1;xt.length!==W.cameras.length&&(W.cameras.length=0,Rt=!0);for(let yt=0;yt<xt.length;yt++){const qt=xt[yt];let Xt=null;if(u!==null)Xt=u.getViewport(qt);else{const pt=d.getViewSubImage(c,qt);Xt=pt.viewport,yt===0&&(t.setRenderTargetTextures(S,pt.colorTexture,pt.depthStencilTexture),t.setRenderTarget(S))}let it=F[yt];it===void 0&&(it=new Mn,it.layers.enable(yt),it.viewport=new Ue,F[yt]=it),it.matrix.fromArray(qt.transform.matrix),it.matrix.decompose(it.position,it.quaternion,it.scale),it.projectionMatrix.fromArray(qt.projectionMatrix),it.projectionMatrixInverse.copy(it.projectionMatrix).invert(),it.viewport.set(Xt.x,Xt.y,Xt.width,Xt.height),yt===0&&(W.matrix.copy(it.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale)),Rt===!0&&W.cameras.push(it)}const gt=s.enabledFeatures;if(gt&&gt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){d=n.getBinding();const yt=d.getDepthInformation(xt[0]);yt&&yt.isValid&&yt.texture&&g.init(yt,s.renderState)}if(gt&&gt.includes("camera-access")&&x){t.state.unbindTexture(),d=n.getBinding();for(let yt=0;yt<xt.length;yt++){const qt=xt[yt].camera;if(qt){let Xt=m[qt];Xt||(Xt=new vh,m[qt]=Xt);const it=d.getCameraImage(qt);Xt.sourceTexture=it}}}}for(let xt=0;xt<C.length;xt++){const Rt=T[xt],gt=C[xt];Rt!==null&&gt!==void 0&&gt.update(Rt,st,l||o)}et&&et(K,st),st.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:st}),p=null}const It=new Nh;It.setAnimationLoop(mt),this.setAnimationLoop=function(K){et=K},this.dispose=function(){}}}const l_=new fe,Vh=new ie;Vh.set(-1,0,0,0,1,0,0,0,1);function c_(i,t){function e(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function n(g,m){m.color.getRGB(g.fogColor.value,Ch(i)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function s(g,m,v,b,S){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(g,m):m.isMeshLambertMaterial?(r(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(g,m),d(g,m)):m.isMeshPhongMaterial?(r(g,m),f(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(g,m),c(g,m),m.isMeshPhysicalMaterial&&u(g,m,S)):m.isMeshMatcapMaterial?(r(g,m),p(g,m)):m.isMeshDepthMaterial?r(g,m):m.isMeshDistanceMaterial?(r(g,m),x(g,m)):m.isMeshNormalMaterial?r(g,m):m.isLineBasicMaterial?(o(g,m),m.isLineDashedMaterial&&a(g,m)):m.isPointsMaterial?h(g,m,v,b):m.isSpriteMaterial?l(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,e(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,e(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===dn&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,e(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===dn&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,e(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,e(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);const v=t.get(m),b=v.envMap,S=v.envMapRotation;b&&(g.envMap.value=b,g.envMapRotation.value.setFromMatrix4(l_.makeRotationFromEuler(S)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(Vh),g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,g.aoMapTransform))}function o(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,e(m.map,g.mapTransform))}function a(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function h(g,m,v,b){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*v,g.scale.value=b*.5,m.map&&(g.map.value=m.map,e(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function l(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,e(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function f(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function d(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function c(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function u(g,m,v){g.ior.value=m.ior,m.diffuseRoughness>0&&(g.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(g.diffuseRoughnessMap.value=m.diffuseRoughnessMap,e(m.diffuseRoughnessMap,g.diffuseRoughnessMapTransform))),m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===dn&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.retroreflectivity>0&&(g.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,g.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=v.texture,g.transmissionSamplerSize.value.set(v.width,v.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,g.specularIntensityMapTransform))}function p(g,m){m.matcap&&(g.matcap.value=m.matcap)}function x(g,m){const v=t.get(m).light;g.referencePosition.value.setFromMatrixPosition(v.matrixWorld),g.nearDistance.value=v.shadow.camera.near,g.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function h_(i,t,e,n){let s={},r={};function o(v,b){const S=b.program;n.uniformBlockBinding(v,S,s[v.id])}function a(v,b){let S=s[v.id];S===void 0&&(p(v),S=h(v),s[v.id]=S,v.addEventListener("dispose",g));const C=b.program;n.updateUBOMapping(v,C);const T=t.render.frame;r[v.id]!==T&&(l(v),r[v.id]=T)}function h(v){const b=i.createBuffer(),S=v.__size,C=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,b),i.bufferData(i.UNIFORM_BUFFER,S,C),i.bindBuffer(i.UNIFORM_BUFFER,null),b}function l(v){const b=s[v.id],S=v.uniforms,C=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let T=0,_=S.length;T<_;T++){const E=S[T];if(Array.isArray(E))for(let N=0,P=E.length;N<P;N++)f(E[N],T,N,C);else f(E,T,0,C)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(v,b,S,C){if(c(v,b,S,C)===!0){const T=v.__offset,_=v.value;if(Array.isArray(_)){let E=0;for(let N=0;N<_.length;N++){const P=_[N],L=x(P,!0);d(P,v.__data,E),E+=L.storage/Float32Array.BYTES_PER_ELEMENT}}else d(_,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,T,v.__data)}}function d(v,b,S){typeof v=="number"||typeof v=="boolean"?b[S]=v:v.isMatrix3?(b[S]=v.elements[0],b[S+1]=v.elements[1],b[S+2]=v.elements[2],b[S+3]=0,b[S+4]=v.elements[3],b[S+5]=v.elements[4],b[S+6]=v.elements[5],b[S+7]=0,b[S+8]=v.elements[6],b[S+9]=v.elements[7],b[S+10]=v.elements[8],b[S+11]=0):ArrayBuffer.isView(v)?b.set(v.subarray(0,b.length-S),S):v.toArray(b,S)}function c(v,b,S,C){const T=v.value,_=b+"_"+S;if(Array.isArray(T)){C[_]===void 0&&(C[_]=[]);const E=C[_];let N=!1;for(let P=0;P<T.length;P++)u(T[P],E,P)===!0&&(N=!0);return N}return u(T,C,_)}function u(v,b,S){if(b[S]===void 0)return typeof v=="number"||typeof v=="boolean"?b[S]=v:ArrayBuffer.isView(v)?b[S]=v.slice():b[S]=v.clone(),!0;{const C=b[S];if(typeof v=="number"||typeof v=="boolean"){if(C!==v)return b[S]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(C.equals(v)===!1)return C.copy(v),!0}}return!1}function p(v){const b=v.uniforms;let S=0;const C=16;for(let _=0,E=b.length;_<E;_++){const N=Array.isArray(b[_])?b[_]:[b[_]];for(let P=0,L=N.length;P<L;P++){const F=N[P],W=Array.isArray(F.value)?F.value:[F.value],U=Array.isArray(b[_])||Array.isArray(F.value);let G=S;for(let I=0,X=W.length;I<X;I++){const H=W[I],j=x(H,U),et=S%C,mt=et%j.boundary,It=et+mt;S+=mt,It!==0&&C-It<j.storage&&(S+=C-It),I===0&&(G=S),S+=j.storage}const w=F.type==="int"?Int32Array:F.type==="uint"?Uint32Array:Float32Array;F.__data=new w((S-G)/Float32Array.BYTES_PER_ELEMENT),F.__offset=G}}const T=S%C;return T>0&&(S+=C-T),v.__size=S,v.__cache={},this}function x(v,b){const S={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(S.boundary=4,S.storage=4):v.isVector2?(S.boundary=8,S.storage=8):v.isVector3||v.isColor?(S.boundary=16,S.storage=12):v.isVector4?(S.boundary=16,S.storage=16):v.isMatrix3?(S.boundary=16,S.storage=48):v.isMatrix4?(S.boundary=16,S.storage=64):v.isTexture?Jt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(S.boundary=16,S.storage=v.byteLength):Jt("WebGLRenderer: Unsupported uniform value type.",v),b===!0&&(S.boundary=16,S.storage=Math.ceil(S.storage/16)*16),S}function g(v){const b=v.target;b.removeEventListener("dispose",g),i.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function m(){for(const v in s)i.deleteBuffer(s[v]);s={},r={}}return{bind:o,update:a,dispose:m}}const u_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Nn=null;function f_(){return Nn===null&&(Nn=new Tf(u_,16,16,Ci,Xn),Nn.name="DFG_LUT",Nn.minFilter=fn,Nn.magFilter=fn,Nn.wrapS=ti,Nn.wrapT=ti,Nn.generateMipmaps=!1,Nn.needsUpdate=!0),Nn}class d_{constructor(t={}){const{canvas:e=Ku(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:h=!0,preserveDrawingBuffer:l=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:c=!1,outputBufferType:u=gn}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;const x=u,g=new Set([Ba,Fa,Oa]),m=new Set([gn,Wn,Ls,ss,Ia,Ua]),v=new Uint32Array(4),b=new Int32Array(4),S={textures:[],min:[],max:[],resolution:[]};let C=null,T=null;const _=[],E=[];let N=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ni,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let L=!1,F=null,W=null,U=null,G=null;this._outputColorSpace=vn;let w=0,I=0,X=null,H=-1,j=null;const et=new Ue,mt=new Ue;let It=null;const K=new pe(0);let st=0,xt=e.width,Rt=e.height,gt=1,At=null,Kt=null;const yt=new Ue(0,0,xt,Rt),qt=new Ue(0,0,xt,Rt);let Xt=!1;const it=new Ns,pt=new Va;let Et=!1,Bt=!1;const Ct=new fe,$t=new A,Ht=new Ue,ee={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let le=!1;function ce(){return X===null?gt:1}let B=n;function Le(y,O){return e.getContext(y,O)}let se,Te,q,at,ot,Dt,R,M,z,nt,Y,lt,_t,$,tt,vt,D,Q,Z,ft,ut,Mt,Ut;try{const y={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:h,preserveDrawingBuffer:l,powerPreference:f,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Da}`),e.addEventListener("webglcontextlost",ct,!1),e.addEventListener("webglcontextrestored",Pt,!1),e.addEventListener("webglcontextcreationerror",ht,!1),B===null){const O="webgl2";if(B=Le(O,y),B===null)throw Le(O)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Wt()}catch(y){throw e.removeEventListener("webglcontextlost",ct,!1),e.removeEventListener("webglcontextrestored",Pt,!1),e.removeEventListener("webglcontextcreationerror",ht,!1),Ee("WebGLRenderer: "+y.message),y}function Wt(){se=new g0(B),se.init(),ut=new i_(B,se),Te=new r0(B,se,t,ut),q=new e_(B,se),Te.reversedDepthBuffer&&c&&q.buffers.depth.setReversed(!0),W=B.createFramebuffer(),U=B.createFramebuffer(),G=B.createFramebuffer(),at=new v0(B),ot=new Gg,Dt=new n_(B,se,q,ot,Te,ut,at),R=new m0(P),M=new Sd(B),Mt=new i0(B,M),z=new _0(B,M,at,Mt),nt=new S0(B,z,M,Mt,at),Q=new M0(B,Te,Dt),tt=new o0(ot),Y=new Hg(P,R,se,Te,Mt,tt),lt=new c_(P,ot),_t=new Vg,$=new Kg(se),D=new n0(P,R,q,nt,p,h),vt=new t_(P,nt,Te),Ut=new h_(B,at,Te,q),Z=new s0(B,se,at),ft=new x0(B,se,at),at.programs=Y.programs,P.capabilities=Te,P.extensions=se,P.properties=ot,P.renderLists=_t,P.shadowMap=vt,P.state=q,P.info=at}x!==gn&&(N=new E0(x,e.width,e.height,a,s,r));const dt=new a_(P,B);this.xr=dt,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){const y=se.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=se.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return gt},this.setPixelRatio=function(y){y!==void 0&&(gt=y,this.setSize(xt,Rt,!1))},this.getSize=function(y){return y.set(xt,Rt)},this.setSize=function(y,O,J=!0){if(dt.isPresenting){Jt("WebGLRenderer: Can't change size while VR device is presenting.");return}xt=y,Rt=O,e.width=Math.floor(y*gt),e.height=Math.floor(O*gt),J===!0&&(e.style.width=y+"px",e.style.height=O+"px"),N!==null&&N.setSize(e.width,e.height),this.setViewport(0,0,y,O)},this.getDrawingBufferSize=function(y){return y.set(xt*gt,Rt*gt).floor()},this.setDrawingBufferSize=function(y,O,J){xt=y,Rt=O,gt=J,e.width=Math.floor(y*J),e.height=Math.floor(O*J),this.setViewport(0,0,y,O)},this.setEffects=function(y){if(x===gn){Ee("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let O=0;O<y.length;O++)if(y[O].isOutputPass===!0){Jt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}N.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(et)},this.getViewport=function(y){return y.copy(yt)},this.setViewport=function(y,O,J,k){y.isVector4?yt.set(y.x,y.y,y.z,y.w):yt.set(y,O,J,k),q.viewport(et.copy(yt).multiplyScalar(ce()).round())},this.getScissor=function(y){return y.copy(qt)},this.setScissor=function(y,O,J,k){y.isVector4?qt.set(y.x,y.y,y.z,y.w):qt.set(y,O,J,k),q.scissor(mt.copy(qt).multiplyScalar(ce()).round())},this.getScissorTest=function(){return Xt},this.setScissorTest=function(y){q.setScissorTest(Xt=y)},this.setOpaqueSort=function(y){At=y},this.setTransparentSort=function(y){Kt=y},this.getClearColor=function(y){return y.copy(D.getClearColor())},this.setClearColor=function(){D.setClearColor(...arguments)},this.getClearAlpha=function(){return D.getClearAlpha()},this.setClearAlpha=function(){D.setClearAlpha(...arguments)},this.clear=function(y=!0,O=!0,J=!0){let k=0;if(y){let V=!1;if(X!==null){const bt=X.texture.format;V=g.has(bt)}if(V){const bt=X.texture.type,Ft=m.has(bt),Tt=D.getClearColor(),wt=D.getClearAlpha(),Vt=Tt.r,jt=Tt.g,re=Tt.b;Ft?(v[0]=Vt,v[1]=jt,v[2]=re,v[3]=wt,B.clearBufferuiv(B.COLOR,0,v)):(b[0]=Vt,b[1]=jt,b[2]=re,b[3]=wt,B.clearBufferiv(B.COLOR,0,b))}else k|=B.COLOR_BUFFER_BIT}O&&(k|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),J&&(k|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&B.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),F=y},this.dispose=function(){e.removeEventListener("webglcontextlost",ct,!1),e.removeEventListener("webglcontextrestored",Pt,!1),e.removeEventListener("webglcontextcreationerror",ht,!1),D.dispose(),_t.dispose(),$.dispose(),Dt.dispose(),ot.dispose(),R.dispose(),nt.dispose(),z.dispose(),Mt.dispose(),Ut.dispose(),Y.dispose(),dt.dispose(),dt.removeEventListener("sessionstart",Gt),dt.removeEventListener("sessionend",kt),Zt.stop()};function ct(y){y.preventDefault(),Ml("WebGLRenderer: Context Lost."),L=!0}function Pt(){Ml("WebGLRenderer: Context Restored."),L=!1;const y=at.autoReset,O=vt.enabled,J=vt.autoUpdate,k=vt.needsUpdate,V=vt.type;Wt(),at.autoReset=y,vt.enabled=O,vt.autoUpdate=J,vt.needsUpdate=k,vt.type=V}function ht(y){Ee("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function Yt(y){const O=y.target;O.removeEventListener("dispose",Yt),xe(O)}function xe(y){Pe(y),ot.remove(y)}function Pe(y){const O=ot.get(y).programs;O!==void 0&&(O.forEach(function(J){Y.releaseProgram(J)}),y.isShaderMaterial&&Y.releaseShaderCache(y))}this.renderBufferDirect=function(y,O,J,k,V,bt){O===null&&(O=ee);const Ft=V.isMesh&&V.matrixWorld.determinantAffine()<0,Tt=Ve(y,O,J,k,V);q.setMaterial(k,Ft);let wt=J.index,Vt=1;if(k.wireframe===!0){if(wt=z.getWireframeAttribute(J),wt===void 0)return;Vt=2}const jt=J.drawRange,re=J.attributes.position;let zt=jt.start*Vt,ne=(jt.start+jt.count)*Vt;bt!==null&&(zt=Math.max(zt,bt.start*Vt),ne=Math.min(ne,(bt.start+bt.count)*Vt)),wt!==null?(zt=Math.max(zt,0),ne=Math.min(ne,wt.count)):re!=null&&(zt=Math.max(zt,0),ne=Math.min(ne,re.count));const Ce=ne-zt;if(Ce<0||Ce===1/0)return;Mt.setup(V,k,Tt,J,wt);let ve,oe=Z;if(wt!==null&&(ve=M.get(wt),oe=ft,oe.setIndex(ve)),V.isMesh)k.wireframe===!0?(q.setLineWidth(k.wireframeLinewidth*ce()),oe.setMode(B.LINES)):oe.setMode(B.TRIANGLES);else if(V.isLine){let Ne=k.linewidth;Ne===void 0&&(Ne=1),q.setLineWidth(Ne*ce()),V.isLineSegments?oe.setMode(B.LINES):V.isLineLoop?oe.setMode(B.LINE_LOOP):oe.setMode(B.LINE_STRIP)}else V.isPoints?oe.setMode(B.POINTS):V.isSprite&&oe.setMode(B.TRIANGLES);if(V.isBatchedMesh)if(se.get("WEBGL_multi_draw"))oe.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{const Ne=V._multiDrawStarts,Ot=V._multiDrawCounts,Ke=V._multiDrawCount,Se=wt?M.get(wt).bytesPerElement:1,Pn=ot.get(k).currentProgram.getUniforms();for(let nn=0;nn<Ke;nn++)Pn.setValue(B,"_gl_DrawID",nn),oe.render(Ne[nn]/Se,Ot[nn])}else if(V.isInstancedMesh)oe.renderInstances(zt,Ce,V.count);else if(J.isInstancedBufferGeometry){const Ne=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,Ot=Math.min(J.instanceCount,Ne);oe.renderInstances(zt,Ce,Ot)}else oe.render(zt,Ce)};function yn(y,O,J,k){F!==null&&y.isNodeMaterial&&F.setObject(k,y),Et===!0&&tt.setState(y,J,!1),y.transparent===!0&&y.side===Fn&&y.forceSinglePass===!1?(y.side=dn,y.needsUpdate=!0,cn(y,O,k),y.side=Ri,y.needsUpdate=!0,cn(y,O,k),y.side=Fn):cn(y,O,k)}this.compile=function(y,O,J=null){J===null&&(J=y),F!==null&&F.renderStart(y,O,J),T=$.get(J),T.init(O),E.push(T),J.traverseVisible(function(V){V.isLight&&V.layers.test(O.layers)&&(T.pushLight(V),V.castShadow&&T.pushShadow(V))}),y!==J&&y.traverseVisible(function(V){V.isLight&&V.layers.test(O.layers)&&(T.pushLight(V),V.castShadow&&T.pushShadow(V))}),T.setupLights(),F!==null&&F.updateLights(T.state.lightsArray),Bt=this.localClippingEnabled,Et=tt.init(this.clippingPlanes,Bt),Et===!0&&tt.setGlobalState(this.clippingPlanes,O),F!==null&&vt.render(T.state.shadowsArray,J,O);const k=new Set;return y.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;const bt=V.material;if(bt)if(Array.isArray(bt))for(let Ft=0;Ft<bt.length;Ft++){const Tt=bt[Ft];yn(Tt,J,O,V),k.add(Tt)}else yn(bt,J,O,V),k.add(bt)}),T=E.pop(),F!==null&&F.renderEnd(),k},this.compileAsync=function(y,O,J=null){const k=this.compile(y,O,J);return new Promise(V=>{function bt(){if(k.forEach(function(Ft){const wt=ot.get(Ft).currentProgram;(wt===void 0||wt.isReady())&&k.delete(Ft)}),k.size===0){V(y);return}setTimeout(bt,10)}se.get("KHR_parallel_shader_compile")!==null?bt():setTimeout(bt,10)})};let on=null;function oi(y){on&&on(y)}function Gt(){Zt.stop()}function kt(){Zt.start()}const Zt=new Nh;Zt.setAnimationLoop(oi),typeof self<"u"&&Zt.setContext(self),this.setAnimationLoop=function(y){on=y,dt.setAnimationLoop(y),y===null?Zt.stop():Zt.start()},dt.addEventListener("sessionstart",Gt),dt.addEventListener("sessionend",kt),this.render=function(y,O){if(O!==void 0&&O.isCamera!==!0){Ee("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;F!==null&&F.renderStart(y,O);const J=dt.enabled===!0&&dt.isPresenting===!0,k=N!==null&&(X===null||J)&&N.begin(P,X);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),dt.enabled===!0&&dt.isPresenting===!0&&(N===null||N.isCompositing()===!1)&&(dt.cameraAutoUpdate===!0&&dt.updateCamera(O),O=dt.getCamera()),y.isScene===!0&&y.onBeforeRender(P,y,O,X),T=$.get(y,E.length),T.init(O),T.state.textureUnits=Dt.getTextureUnits(),E.push(T),Ct.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),O.isArrayCamera?pt.setFromArrayCamera(O):it.setFromProjectionMatrix(Ct,Rn,O.reversedDepth),Bt=this.localClippingEnabled,Et=tt.init(this.clippingPlanes,Bt),C=_t.get(y,_.length),C.init(),_.push(C),this.info.render.frame++,dt.enabled===!0&&dt.isPresenting===!0){const Ft=P.xr.getDepthSensingMesh();Ft!==null&&we(Ft,O,-1/0,P.sortObjects)}we(y,O,0,P.sortObjects),C.finish(),F!==null&&F.updateLights(T.state.lightsArray),P.sortObjects===!0&&C.sort(At,Kt),le=dt.enabled===!1||dt.isPresenting===!1||dt.hasDepthSensing()===!1,le&&D.addToRenderList(C,y),this.info.autoReset===!0&&this.info.reset(),Et===!0&&tt.beginShadows();const V=T.state.shadowsArray;if(vt.render(V,y,O),Et===!0&&tt.endShadows(),(k&&N.hasRenderPass())===!1){const Ft=C.opaque,Tt=C.transmissive;if(T.setupLights(),O.isArrayCamera){const wt=O.cameras;if(Tt.length>0)for(let Vt=0,jt=wt.length;Vt<jt;Vt++){const re=wt[Vt];De(Ft,Tt,y,re)}le&&D.render(y);for(let Vt=0,jt=wt.length;Vt<jt;Vt++){const re=wt[Vt];me(C,y,re,re.viewport)}}else Tt.length>0&&De(Ft,Tt,y,O),le&&D.render(y),me(C,y,O)}X!==null&&I===0&&(Dt.updateMultisampleRenderTarget(X),Dt.updateRenderTargetMipmap(X)),k&&N.end(P),y.isScene===!0&&y.onAfterRender(P,y,O),Mt.resetDefaultState(),H=-1,j=null,E.pop(),E.length>0?(T=E[E.length-1],Dt.setTextureUnits(T.state.textureUnits),Et===!0&&tt.setGlobalState(P.clippingPlanes,T.state.camera)):T=null,_.pop(),_.length>0?C=_[_.length-1]:C=null,F!==null&&F.renderEnd()};function we(y,O,J,k){if(y.visible===!1)return;if(y.layers.test(O.layers)){if(y.isGroup)J=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(O);else if(y.isLight)T.pushLight(y),y.castShadow&&T.pushShadow(y);else if(y.isSprite){const Ft=O.isArrayCamera?pt:it;if(!y.frustumCulled||y.intersectsFrustum(Ft)){k&&Ht.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Ct);const Tt=nt.update(y),wt=y.material;wt.visible&&C.push(y,Tt,wt,J,Ht.z,null,O)}}else if(y.isMesh||y.isLine||y.isPoints){const Ft=O.isArrayCamera?pt:it;if(!y.frustumCulled||y.intersectsFrustum(Ft)){const Tt=nt.update(y),wt=y.material;if(k&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Ht.copy(y.boundingSphere.center)):(Tt.boundingSphere===null&&Tt.computeBoundingSphere(),Ht.copy(Tt.boundingSphere.center)),Ht.applyMatrix4(y.matrixWorld).applyMatrix4(Ct)),Array.isArray(wt)){const Vt=Tt.groups;for(let jt=0,re=Vt.length;jt<re;jt++){const zt=Vt[jt],ne=wt[zt.materialIndex];ne&&ne.visible&&C.push(y,Tt,ne,J,Ht.z,zt,O)}}else wt.visible&&C.push(y,Tt,wt,J,Ht.z,null,O)}}}const bt=y.children;for(let Ft=0,Tt=bt.length;Ft<Tt;Ft++)we(bt[Ft],O,J,k)}function me(y,O,J,k){const{opaque:V,transmissive:bt,transparent:Ft}=y;T.setupLightsView(J),Et===!0&&tt.setGlobalState(P.clippingPlanes,J),k&&q.viewport(et.copy(k)),V.length>0&&ge(V,O,J),bt.length>0&&ge(bt,O,J),Ft.length>0&&ge(Ft,O,J),q.buffers.depth.setTest(!0),q.buffers.depth.setMask(!0),q.buffers.color.setMask(!0),q.setPolygonOffset(!1)}function De(y,O,J,k){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[k.id]===void 0){const zt=se.has("EXT_color_buffer_half_float")||se.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[k.id]=new kn(1,1,{generateMipmaps:!0,type:zt?Xn:gn,minFilter:mi,samples:Math.max(4,Te.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Me.workingColorSpace})}const bt=T.state.transmissionRenderTarget[k.id],Ft=k.viewport||et;bt.setSize(Ft.z*P.transmissionResolutionScale,Ft.w*P.transmissionResolutionScale);const Tt=P.getRenderTarget(),wt=P.getActiveCubeFace(),Vt=P.getActiveMipmapLevel();P.setRenderTarget(bt),P.getClearColor(K),st=P.getClearAlpha(),st<1&&P.setClearColor(16777215,.5),P.clear(),le&&D.render(J);const jt=P.toneMapping;P.toneMapping=ni;const re=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),T.setupLightsView(k),Et===!0&&tt.setGlobalState(P.clippingPlanes,k),ge(y,J,k),Dt.updateMultisampleRenderTarget(bt),Dt.updateRenderTargetMipmap(bt),se.has("WEBGL_multisampled_render_to_texture")===!1){let zt=!1;for(let ne=0,Ce=O.length;ne<Ce;ne++){const ve=O[ne],{object:oe,geometry:Ne,material:Ot,group:Ke}=ve;if(Ot.side===Fn&&oe.layers.test(k.layers)){const Se=Ot.side;Ot.side=dn,Ot.needsUpdate=!0,Qt(oe,J,k,Ne,Ot,Ke),Ot.side=Se,Ot.needsUpdate=!0,zt=!0}}zt===!0&&(Dt.updateMultisampleRenderTarget(bt),Dt.updateRenderTargetMipmap(bt))}P.setRenderTarget(Tt,wt,Vt),P.setClearColor(K,st),re!==void 0&&(k.viewport=re),P.toneMapping=jt}function ge(y,O,J){const k=O.isScene===!0?O.overrideMaterial:null;for(let V=0,bt=y.length;V<bt;V++){const Ft=y[V],{object:Tt,geometry:wt,group:Vt}=Ft;let jt=Ft.material;jt.allowOverride===!0&&k!==null&&(jt=k),Tt.layers.test(J.layers)&&Qt(Tt,O,J,wt,jt,Vt)}}function Qt(y,O,J,k,V,bt){F!==null&&V.isNodeMaterial&&F.setObject(y,V),y.onBeforeRender(P,O,J,k,V,bt),y.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),V.onBeforeRender(P,O,J,k,y,bt),V.transparent===!0&&V.side===Fn&&V.forceSinglePass===!1?(V.side=dn,V.needsUpdate=!0,P.renderBufferDirect(J,O,k,V,y,bt),V.side=Ri,V.needsUpdate=!0,P.renderBufferDirect(J,O,k,V,y,bt),V.side=Fn):P.renderBufferDirect(J,O,k,V,y,bt),y.onAfterRender(P,O,J,k,V,bt)}function ke(y){let O=0;for(const J of y)J.texture!==null&&O++;return O}function cn(y,O,J){O.isScene!==!0&&(O=ee);const k=ot.get(y),V=T.state.lights,bt=T.state.shadowsArray,Ft=V.state.version,Tt=Y.getParameters(y,V.state,bt,O,J,T.state.lightProbeGridArray),wt=Y.getProgramCacheKey(Tt);let Vt=k.programs;k.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?O.environment:null,k.fog=O.fog;const jt=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;k.envMap=R.get(y.envMap||k.environment,jt),k.envMapRotation=k.environment!==null&&y.envMap===null?O.environmentRotation:y.envMapRotation,Vt===void 0&&(y.addEventListener("dispose",Yt),Vt=new Map,k.programs=Vt,k.programVariants=new Map);let re=Vt.get(wt);if(re!==void 0){if(k.currentProgram===re&&k.lightsStateVersion===Ft)return Be(y,Tt),re}else Tt.uniforms=Y.getUniforms(y),F!==null&&y.isNodeMaterial&&F.build(y,J,Tt),y.onBeforeCompile(Tt,P),re=Y.acquireProgram(Tt,wt),Vt.set(wt,re),k.uniforms=Tt.uniforms;const zt=k.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(zt.clippingPlanes=tt.uniform),Be(y,Tt),k.needsLights=ai(y),k.lightsStateVersion=Ft,k.needsLights&&(zt.ambientLightColor.value=V.state.ambient,zt.lightProbe.value=V.state.probe,zt.sunLights.value=V.state.sun,zt.sunLightShadows.value=V.state.sunShadow,zt.directionalLights.value=V.state.directional,zt.directionalLightShadows.value=V.state.directionalShadow,zt.spotLights.value=V.state.spot,zt.spotLightShadows.value=V.state.spotShadow,zt.rectAreaLights.value=V.state.rectArea,zt.ltc_1.value=V.state.rectAreaLTC1,zt.ltc_2.value=V.state.rectAreaLTC2,zt.pointLights.value=V.state.point,zt.pointLightShadows.value=V.state.pointShadow,zt.hemisphereLights.value=V.state.hemi,zt.sunShadowMatrix.value=V.state.sunShadowMatrix,zt.sunShadowCascade.value=V.state.sunShadowCascade,zt.directionalShadowMatrix.value=V.state.directionalShadowMatrix,zt.spotLightMatrix.value=V.state.spotLightMatrix,zt.spotLightMap.value=V.state.spotLightMap,zt.pointShadowMatrix.value=V.state.pointShadowMatrix),k.numLightProbeGrids=ke(T.state.lightProbeGridArray),k.currentProgram=re,k.uniformsList=null,re}function hn(y,O,J,k,V){const bt=ot.get(y),Ft=bt.currentProgram.id+","+k+","+V;let Tt=bt.programVariants.get(Ft);return Tt===void 0?(Tt=cn(y,O,J),bt.programVariants.set(Ft,Tt)):(bt.currentProgram=Tt,bt.uniformsList=null,bt.outputColorSpace=k,bt.toneMapping=V),Tt}function qn(y){if(y.uniformsList===null){const O=y.currentProgram.getUniforms();y.uniformsList=Er.seqWithValue(O.seq,y.uniforms)}return y.uniformsList}function Be(y,O){const J=ot.get(y);J.outputColorSpace=O.outputColorSpace,J.batching=O.batching,J.batchingColor=O.batchingColor,J.instancing=O.instancing,J.instancingColor=O.instancingColor,J.instancingMorph=O.instancingMorph,J.skinning=O.skinning,J.morphTargets=O.morphTargets,J.morphNormals=O.morphNormals,J.morphColors=O.morphColors,J.morphTargetsCount=O.morphTargetsCount,J.numClippingPlanes=O.numClippingPlanes,J.numIntersection=O.numClipIntersection,J.vertexAlphas=O.vertexAlphas,J.vertexTangents=O.vertexTangents,J.toneMapping=O.toneMapping}function Ve(y,O,J,k,V){O.isScene!==!0&&(O=ee),Dt.resetTextureUnits();const bt=O.fog,Ft=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?O.environment:null,Tt=X===null?P.outputColorSpace:X.isXRRenderTarget===!0?X.texture.colorSpace:Me.workingColorSpace,wt=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,Vt=R.get(k.envMap||Ft,wt),jt=k.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,re=!!J.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),zt=!!J.morphAttributes.position,ne=!!J.morphAttributes.normal,Ce=!!J.morphAttributes.color;let ve=ni;k.toneMapped&&(X===null||X.isXRRenderTarget===!0)&&(ve=P.toneMapping);const oe=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,Ne=oe!==void 0?oe.length:0,Ot=ot.get(k),Ke=T.state.lights;if(Et===!0&&(Bt===!0||y!==j)){const Ie=y===j&&k.id===H;tt.setState(k,y,Ie)}let Se=!1,Pn=!1;k.version===Ot.__version?Ot.needsLights&&Ot.lightsStateVersion!==Ke.state.version||V.isBatchedMesh&&Ot.batching===!1||!V.isBatchedMesh&&Ot.batching===!0||V.isBatchedMesh&&Ot.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&Ot.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&Ot.instancing===!1||!V.isInstancedMesh&&Ot.instancing===!0||V.isSkinnedMesh&&Ot.skinning===!1||!V.isSkinnedMesh&&Ot.skinning===!0||V.isInstancedMesh&&Ot.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&Ot.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&Ot.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&Ot.instancingMorph===!1&&V.morphTexture!==null||Ot.envMap!==Vt||k.fog===!0&&Ot.fog!==bt||Ot.numClippingPlanes!==void 0&&(Ot.numClippingPlanes!==tt.numPlanes||Ot.numIntersection!==tt.numIntersection)||Ot.vertexAlphas!==jt||Ot.vertexTangents!==re||Ot.morphTargets!==zt||Ot.morphNormals!==ne||Ot.morphColors!==Ce||Ot.morphTargetsCount!==Ne||Ot.numLightProbeGrids!==ke(T.state.lightProbeGridArray)?Se=!0:(Ot.outputColorSpace!==Tt||Ot.toneMapping!==ve)&&(Pn=!0):(Se=!0,Ot.__version=k.version);let nn=Ot.currentProgram;(Se===!0||Pn===!0)&&(nn=Pn===!0?hn(k,O,V,Tt,ve):cn(k,O,V),F&&k.isNodeMaterial&&F.onUpdateProgram(k,nn,Ot));let Gs=!1,li=!1,yi=!1;const ye=nn.getUniforms(),je=Ot.uniforms;if(q.useProgram(nn.program)&&(Gs=!0,li=!0,yi=!0),k.id!==H&&(H=k.id,li=!0),Gs||j!==y){q.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),ye.setValue(B,"projectionMatrix",y.projectionMatrix),ye.setValue(B,"viewMatrix",y.matrixWorldInverse);const Je=ye.map.cameraPosition;Je!==void 0&&Je.setValue(B,$t.setFromMatrixPosition(y.matrixWorld)),Te.logarithmicDepthBuffer&&ye.setValue(B,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&ye.setValue(B,"isOrthographic",y.isOrthographicCamera===!0),j!==y&&(j=y,li=!0,yi=!0)}if(Ot.needsLights&&(Ke.state.sunShadowMap.length>0&&ye.setValue(B,"sunShadowMap",Ke.state.sunShadowMap,Dt),Ke.state.directionalShadowMap.length>0&&ye.setValue(B,"directionalShadowMap",Ke.state.directionalShadowMap,Dt),Ke.state.spotShadowMap.length>0&&ye.setValue(B,"spotShadowMap",Ke.state.spotShadowMap,Dt),Ke.state.pointShadowMap.length>0&&ye.setValue(B,"pointShadowMap",Ke.state.pointShadowMap,Dt)),V.isSkinnedMesh){ye.setOptional(B,V,"bindMatrix"),ye.setOptional(B,V,"bindMatrixInverse");const Ie=V.skeleton;Ie&&(Ie.boneTexture===null&&Ie.computeBoneTexture(),ye.setValue(B,"boneTexture",Ie.boneTexture,Dt))}V.isBatchedMesh&&(ye.setOptional(B,V,"batchingTexture"),ye.setValue(B,"batchingTexture",V._matricesTexture,Dt),ye.setOptional(B,V,"batchingIdTexture"),ye.setValue(B,"batchingIdTexture",V._indirectTexture,Dt),ye.setOptional(B,V,"batchingColorTexture"),V._colorsTexture!==null&&ye.setValue(B,"batchingColorTexture",V._colorsTexture,Dt));const En=J.morphAttributes;if((En.position!==void 0||En.normal!==void 0||En.color!==void 0)&&Q.update(V,J,nn),(li||Ot.receiveShadow!==V.receiveShadow)&&(Ot.receiveShadow=V.receiveShadow,ye.setValue(B,"receiveShadow",V.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&O.environment!==null&&(je.envMapIntensity.value=O.environmentIntensity),je.dfgLUT!==void 0&&(je.dfgLUT.value=f_()),li){if(ye.setValue(B,"toneMappingExposure",P.toneMappingExposure),Ot.needsLights&&Ze(je,yi),bt&&k.fog===!0&&lt.refreshFogUniforms(je,bt),lt.refreshMaterialUniforms(je,k,gt,Rt,T.state.transmissionRenderTarget[y.id]),Ot.needsLights&&Ot.numLightProbeGrids>0){const Ie=S;let Je=0;for(const Zn of T.state.lightProbeGridArray)Zn.texture!==null&&(Ie.textures[Je]=Zn.texture,Ie.min[Je]=Zn.boundingBox.min,Ie.max[Je]=Zn.boundingBox.max,Ie.resolution[Je]=Zn.resolution,Je++);for(const Zn in Ie)Ie[Zn].length=Je;je.probesSH.value=Ie.textures,je.probesMin.value=Ie.min,je.probesMax.value=Ie.max,je.probesResolution.value=Ie.resolution}Er.upload(B,qn(Ot),je,Dt)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Er.upload(B,qn(Ot),je,Dt),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&ye.setValue(B,"center",V.center),ye.setValue(B,"modelViewMatrix",V.modelViewMatrix),ye.setValue(B,"normalMatrix",V.normalMatrix),ye.setValue(B,"modelMatrix",V.matrixWorld),k.uniformsGroups!==void 0){const Ie=k.uniformsGroups;for(let Je=0,Zn=Ie.length;Je<Zn;Je++){const ll=Ie[Je];Ut.update(ll,nn),Ut.bind(ll,nn)}}return nn}function Ze(y,O){y.ambientLightColor.needsUpdate=O,y.lightProbe.needsUpdate=O,y.sunLights.needsUpdate=O,y.sunLightShadows.needsUpdate=O,y.directionalLights.needsUpdate=O,y.directionalLightShadows.needsUpdate=O,y.pointLights.needsUpdate=O,y.pointLightShadows.needsUpdate=O,y.spotLights.needsUpdate=O,y.spotLightShadows.needsUpdate=O,y.rectAreaLights.needsUpdate=O,y.hemisphereLights.needsUpdate=O}function ai(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return X},this.setRenderTargetTextures=function(y,O,J){const k=ot.get(y);k.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),ot.get(y.texture).__webglTexture=O,ot.get(y.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:J,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,O){const J=ot.get(y);J.__webglFramebuffer=O,J.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(y,O=0,J=0){X=y,w=O,I=J;let k=null,V=!1,bt=!1;if(y){const Tt=ot.get(y);if(Tt.__useDefaultFramebuffer!==void 0){q.bindFramebuffer(B.FRAMEBUFFER,Tt.__webglFramebuffer),et.copy(y.viewport),mt.copy(y.scissor),It=y.scissorTest,q.viewport(et),q.scissor(mt),q.setScissorTest(It),H=-1;return}else if(Tt.__webglFramebuffer===void 0)Dt.setupRenderTarget(y);else if(Tt.__hasExternalTextures)Dt.rebindTextures(y,ot.get(y.texture).__webglTexture,ot.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){const jt=y.depthTexture;if(Tt.__boundDepthTexture!==jt){if(jt!==null&&ot.has(jt)&&(y.width!==jt.image.width||y.height!==jt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Dt.setupDepthRenderbuffer(y)}}const wt=y.texture;(wt.isData3DTexture||wt.isDataArrayTexture||wt.isCompressedArrayTexture)&&(bt=!0);const Vt=ot.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Vt[O])?k=Vt[O][J]:k=Vt[O],V=!0):y.samples>0&&Dt.useMultisampledRTT(y)===!1?k=ot.get(y).__webglMultisampledFramebuffer:Array.isArray(Vt)?k=Vt[J]:k=Vt,et.copy(y.viewport),mt.copy(y.scissor),It=y.scissorTest}else et.copy(yt).multiplyScalar(gt).floor(),mt.copy(qt).multiplyScalar(gt).floor(),It=Xt;if(J!==0&&(k=W),q.bindFramebuffer(B.FRAMEBUFFER,k)&&q.drawBuffers(y,k),q.viewport(et),q.scissor(mt),q.setScissorTest(It),V){const Tt=ot.get(y.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+O,Tt.__webglTexture,J)}else if(bt){const Tt=O;for(let wt=0;wt<y.textures.length;wt++){const Vt=ot.get(y.textures[wt]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+wt,Vt.__webglTexture,J,Tt)}}else if(y!==null&&J!==0){const Tt=ot.get(y.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Tt.__webglTexture,J)}H=-1};function en(y){const O=ot.get(y);return(O.__readFormat!==y.format||O.__readType!==y.type)&&(O.__readFormat=y.format,O.__readType=y.type,O.__formatReadable=Te.textureFormatReadable(y.format),O.__typeReadable=Te.textureTypeReadable(y.type)),O}this.readRenderTargetPixels=function(y,O,J,k,V,bt,Ft,Tt=0){if(!(y&&y.isWebGLRenderTarget)){Ee("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let wt=ot.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Ft!==void 0&&(wt=wt[Ft],Array.isArray(wt)&&(wt=wt[0])),wt){q.bindFramebuffer(B.FRAMEBUFFER,wt);try{const Vt=y.textures[Tt],jt=Vt.format,re=Vt.type;y.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Tt);const zt=en(Vt);if(zt.__formatReadable===!1){Ee("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(zt.__typeReadable===!1){Ee("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=y.width-k&&J>=0&&J<=y.height-V&&B.readPixels(O,J,k,V,ut.convert(jt),ut.convert(re),bt)}finally{const Vt=X!==null?ot.get(X).__webglFramebuffer:null;q.bindFramebuffer(B.FRAMEBUFFER,Vt)}}},this.readRenderTargetPixelsAsync=async function(y,O,J,k,V,bt,Ft,Tt=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let wt=ot.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Ft!==void 0&&(wt=wt[Ft],Array.isArray(wt)&&(wt=wt[0])),wt)if(O>=0&&O<=y.width-k&&J>=0&&J<=y.height-V){q.bindFramebuffer(B.FRAMEBUFFER,wt);const Vt=y.textures[Tt],jt=Vt.format,re=Vt.type;y.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Tt);const zt=en(Vt);if(zt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(zt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ne=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,ne),B.bufferData(B.PIXEL_PACK_BUFFER,bt.byteLength,B.STREAM_READ),B.readPixels(O,J,k,V,ut.convert(jt),ut.convert(re),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);const Ce=X!==null?ot.get(X).__webglFramebuffer:null;q.bindFramebuffer(B.FRAMEBUFFER,Ce);const ve=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await Ju(B,ve,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,ne),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,bt),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(ne),B.deleteSync(ve),bt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,O=null,J=0){const k=Math.pow(2,-J),V=Math.floor(y.image.width*k),bt=Math.floor(y.image.height*k),Ft=O!==null?O.x:0,Tt=O!==null?O.y:0;Dt.setTexture2D(y,0),B.copyTexSubImage2D(B.TEXTURE_2D,J,0,0,Ft,Tt,V,bt),q.unbindTexture()},this.copyTextureToTexture=function(y,O,J=null,k=null,V=0,bt=0){let Ft,Tt,wt,Vt,jt,re,zt,ne,Ce;const ve=y.isCompressedTexture?y.mipmaps[bt]:y.image;if(J!==null)Ft=J.max.x-J.min.x,Tt=J.max.y-J.min.y,wt=J.isBox3?J.max.z-J.min.z:1,Vt=J.min.x,jt=J.min.y,re=J.isBox3?J.min.z:0;else{const ye=Math.pow(2,-V);Ft=Math.floor(ve.width*ye),Tt=Math.floor(ve.height*ye),y.isDataArrayTexture?wt=ve.depth:y.isData3DTexture?wt=Math.floor(ve.depth*ye):wt=1,Vt=0,jt=0,re=0}k!==null?(zt=k.x,ne=k.y,Ce=k.z):(zt=0,ne=0,Ce=0);const oe=ut.convert(O.format),Ne=ut.convert(O.type);let Ot;O.isData3DTexture?(Dt.setTexture3D(O,0),Ot=B.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(Dt.setTexture2DArray(O,0),Ot=B.TEXTURE_2D_ARRAY):(Dt.setTexture2D(O,0),Ot=B.TEXTURE_2D),q.activeTexture(B.TEXTURE0),q.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,O.flipY),q.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),q.pixelStorei(B.UNPACK_ALIGNMENT,O.unpackAlignment);const Ke=q.getParameter(B.UNPACK_ROW_LENGTH),Se=q.getParameter(B.UNPACK_IMAGE_HEIGHT),Pn=q.getParameter(B.UNPACK_SKIP_PIXELS),nn=q.getParameter(B.UNPACK_SKIP_ROWS),Gs=q.getParameter(B.UNPACK_SKIP_IMAGES);q.pixelStorei(B.UNPACK_ROW_LENGTH,ve.width),q.pixelStorei(B.UNPACK_IMAGE_HEIGHT,ve.height),q.pixelStorei(B.UNPACK_SKIP_PIXELS,Vt),q.pixelStorei(B.UNPACK_SKIP_ROWS,jt),q.pixelStorei(B.UNPACK_SKIP_IMAGES,re);const li=y.isDataArrayTexture||y.isData3DTexture,yi=O.isDataArrayTexture||O.isData3DTexture;if(y.isDepthTexture){const ye=ot.get(y),je=ot.get(O),En=ot.get(ye.__renderTarget),Ie=ot.get(je.__renderTarget);q.bindFramebuffer(B.READ_FRAMEBUFFER,En.__webglFramebuffer),q.bindFramebuffer(B.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer);for(let Je=0;Je<wt;Je++)li&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,ot.get(y).__webglTexture,V,re+Je),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,ot.get(O).__webglTexture,bt,Ce+Je)),B.blitFramebuffer(Vt,jt,Vt+Ft,jt+Tt,zt,ne,zt+Ft,ne+Tt,B.DEPTH_BUFFER_BIT,B.NEAREST);q.bindFramebuffer(B.READ_FRAMEBUFFER,null),q.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(V!==0||y.isRenderTargetTexture||ot.has(y)){const ye=ot.get(y),je=ot.get(O);q.bindFramebuffer(B.READ_FRAMEBUFFER,U),q.bindFramebuffer(B.DRAW_FRAMEBUFFER,G);for(let En=0;En<wt;En++)li?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,ye.__webglTexture,V,re+En):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,ye.__webglTexture,V),yi?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,je.__webglTexture,bt,Ce+En):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,je.__webglTexture,bt),V!==0?B.blitFramebuffer(Vt,jt,Vt+Ft,jt+Tt,zt,ne,zt+Ft,ne+Tt,B.COLOR_BUFFER_BIT,B.NEAREST):yi?B.copyTexSubImage3D(Ot,bt,zt,ne,Ce+En,Vt,jt,Ft,Tt):B.copyTexSubImage2D(Ot,bt,zt,ne,Vt,jt,Ft,Tt);q.bindFramebuffer(B.READ_FRAMEBUFFER,null),q.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else yi?y.isDataTexture||y.isData3DTexture?B.texSubImage3D(Ot,bt,zt,ne,Ce,Ft,Tt,wt,oe,Ne,ve.data):O.isCompressedArrayTexture?B.compressedTexSubImage3D(Ot,bt,zt,ne,Ce,Ft,Tt,wt,oe,ve.data):B.texSubImage3D(Ot,bt,zt,ne,Ce,Ft,Tt,wt,oe,Ne,ve):y.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,bt,zt,ne,Ft,Tt,oe,Ne,ve.data):y.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,bt,zt,ne,ve.width,ve.height,oe,ve.data):B.texSubImage2D(B.TEXTURE_2D,bt,zt,ne,Ft,Tt,oe,Ne,ve);q.pixelStorei(B.UNPACK_ROW_LENGTH,Ke),q.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Se),q.pixelStorei(B.UNPACK_SKIP_PIXELS,Pn),q.pixelStorei(B.UNPACK_SKIP_ROWS,nn),q.pixelStorei(B.UNPACK_SKIP_IMAGES,Gs),bt===0&&O.generateMipmaps===!0&&O.mipmapsAutoUpdate===!0&&B.generateMipmap(Ot),q.unbindTexture()},this.initRenderTarget=function(y){ot.get(y).__webglFramebuffer===void 0&&Dt.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?Dt.setTextureCube(y,0):y.isData3DTexture?Dt.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?Dt.setTexture2DArray(y,0):Dt.setTexture2D(y,0),q.unbindTexture()},this.resetState=function(){w=0,I=0,X=null,q.reset(),Mt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Rn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=Me._getDrawingBufferColorSpace(t),e.unpackColorSpace=Me._getUnpackColorSpace()}}const Ec={type:"change"},ja={type:"start"},Wh={type:"end"},pr=new Bs,bc=new Un,p_=Math.cos(70*nf.DEG2RAD),We=new A,un=2*Math.PI,be={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},bo=1e-6;class m_ extends vd{constructor(t,e=null){super(t,e),this.state=be.NONE,this.target=new A,this.cursor=new A,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Qi.ROTATE,MIDDLE:Qi.DOLLY,RIGHT:Qi.PAN},this.touches={ONE:Ji.ROTATE,TWO:Ji.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new A,this._lastQuaternion=new He,this._lastTargetPosition=new A,this._quat=new He().setFromUnitVectors(t.up,new A(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new tc,this._sphericalDelta=new tc,this._scale=1,this._panOffset=new A,this._rotateStart=new St,this._rotateEnd=new St,this._rotateDelta=new St,this._panStart=new St,this._panEnd=new St,this._panDelta=new St,this._dollyStart=new St,this._dollyEnd=new St,this._dollyDelta=new St,this._dollyDirection=new A,this._mouse=new St,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=__.bind(this),this._onPointerDown=g_.bind(this),this._onPointerUp=x_.bind(this),this._onContextMenu=T_.bind(this),this._onMouseWheel=S_.bind(this),this._onKeyDown=y_.bind(this),this._onTouchStart=E_.bind(this),this._onTouchMove=b_.bind(this),this._onMouseDown=v_.bind(this),this._onMouseMove=M_.bind(this),this._interceptControlDown=A_.bind(this),this._interceptControlUp=w_.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=be.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Ec),this.update(),this.state=be.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){const e=this.object.position;We.copy(e).sub(this.target),We.applyQuaternion(this._quat),this._spherical.setFromVector3(We),this.autoRotate&&this.state===be.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=un:n>Math.PI&&(n-=un),s<-Math.PI?s+=un:s>Math.PI&&(s-=un),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(We.setFromSpherical(this._spherical),We.applyQuaternion(this._quatInverse),e.copy(this.target).add(We),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=We.length();o=this._clampDistance(a*this._scale);const h=a-o;this.object.position.addScaledVector(this._dollyDirection,h),this.object.updateMatrixWorld(),r=!!h}else if(this.object.isOrthographicCamera){const a=new A(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const h=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=h!==this.object.zoom;const l=new A(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=We.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(pr.origin.copy(this.object.position),pr.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(pr.direction))<p_?this.object.lookAt(this.target):(bc.setFromNormalAndCoplanarPoint(this.object.up,this.target),pr.intersectPlane(bc,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>bo||8*(1-this._lastQuaternion.dot(this.object.quaternion))>bo||this._lastTargetPosition.distanceToSquared(this.target)>bo?(this.dispatchEvent(Ec),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?un/60*this.autoRotateSpeed*t:un/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){We.setFromMatrixColumn(e,0),We.multiplyScalar(-t),this._panOffset.add(We)}_panUp(t,e){this.screenSpacePanning===!0?We.setFromMatrixColumn(e,1):(We.setFromMatrixColumn(e,0),We.crossVectors(this.object.up,We)),We.multiplyScalar(t),this._panOffset.add(We)}_pan(t,e){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;We.copy(s).sub(this.target);let r=We.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientY),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(un*this._rotateDelta.x/e.clientHeight),this._rotateUp(un*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(un*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-un*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(un*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-un*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(un*this._rotateDelta.x/e.clientHeight),this._rotateUp(un*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new St,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function g_(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function __(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function x_(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Wh),this.state=be.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function v_(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Qi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=be.DOLLY;break;case Qi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=be.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=be.ROTATE}break;case Qi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=be.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=be.PAN}break;default:this.state=be.NONE}this.state!==be.NONE&&this.dispatchEvent(ja)}function M_(i){switch(this.state){case be.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case be.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case be.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function S_(i){this.enabled===!1||this.enableZoom===!1||this.state!==be.NONE||(i.preventDefault(),this.dispatchEvent(ja),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Wh))}function y_(i){this.enabled!==!1&&this._handleKeyDown(i)}function E_(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Ji.ROTATE:if(this.enableRotate===!1){this.state=be.NONE;break}this._handleTouchStartRotate(i),this.state=be.TOUCH_ROTATE;break;case Ji.PAN:if(this.enablePan===!1){this.state=be.NONE;break}this._handleTouchStartPan(i),this.state=be.TOUCH_PAN;break;default:this.state=be.NONE}break;case 2:switch(this.touches.TWO){case Ji.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=be.TOUCH_DOLLY_PAN;break;case Ji.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=be.TOUCH_DOLLY_ROTATE;break;default:this.state=be.NONE}break;default:this.state=be.NONE}this.state!==be.NONE&&this.dispatchEvent(ja)}function b_(i){switch(this._trackPointer(i),this.state){case be.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case be.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case be.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case be.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=be.NONE}}function T_(i){this.enabled!==!1&&i.preventDefault()}function A_(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function w_(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class R_ extends Xe{constructor(t=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=t,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new St(.5,.5),this.rotation2D=0,this.addEventListener("removed",function(){this.traverse(function(e){e.element&&e.element instanceof e.element.ownerDocument.defaultView.Element&&e.element.parentNode!==null&&e.element.remove()})})}copy(t,e){return super.copy(t,e),this.element=t.element.cloneNode(!0),this.center=t.center,this.rotation2D=t.rotation2D,this}}const Yi=new A,Tc=new fe,Ac=new fe,wc=new A,Rc=new A;class C_{constructor(t={}){const e=this;let n,s,r,o;const a={objects:new WeakMap},h=t.element!==void 0?t.element:document.createElement("div");h.style.overflow="hidden",this.domElement=h,this.sortObjects=!0,this.getSize=function(){return{width:n,height:s}},this.render=function(p,x){p.matrixWorldAutoUpdate===!0&&p.updateMatrixWorld(),x.parent===null&&x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),Tc.copy(x.matrixWorldInverse),Ac.multiplyMatrices(x.projectionMatrix,Tc),f(p,p,x),this.sortObjects&&u(p)},this.setSize=function(p,x){n=p,s=x,r=n/2,o=s/2,h.style.width=p+"px",h.style.height=x+"px"};function l(p){p.isCSS2DObject&&(p.element.style.display="none");for(let x=0,g=p.children.length;x<g;x++)l(p.children[x])}function f(p,x,g){if(p.visible===!1){l(p);return}if(p.isCSS2DObject){Yi.setFromMatrixPosition(p.matrixWorld),Yi.applyMatrix4(Ac);const m=Yi.z>=-1&&Yi.z<=1&&p.layers.test(g.layers)===!0,v=p.element;if(v.style.display=m===!0?"":"none",m===!0){p.onBeforeRender(e,x,g);const S=100*p.center.x,C=100*p.center.y;v.style.transformOrigin=`${S}% ${C}%`;const T=-p.rotation2D,_=Yi.x*r+r,E=-Yi.y*o+o;v.style.transform=`translate(${-S}%, ${-C}%) translate(${_}px, ${E}px) rotate(${T}rad)`,v.parentNode!==h&&h.appendChild(v),p.onAfterRender(e,x,g)}const b={distanceToCameraSquared:d(g,p)};a.objects.set(p,b)}for(let m=0,v=p.children.length;m<v;m++)f(p.children[m],x,g)}function d(p,x){return wc.setFromMatrixPosition(p.matrixWorld),Rc.setFromMatrixPosition(x.matrixWorld),wc.distanceToSquared(Rc)}function c(p){const x=[];return p.traverseVisible(function(g){g.isCSS2DObject&&x.push(g)}),x}function u(p){const x=c(p).sort(function(m,v){if(m.renderOrder!==v.renderOrder)return v.renderOrder-m.renderOrder;const b=a.objects.get(m).distanceToCameraSquared,S=a.objects.get(v).distanceToCameraSquared;return b-S}),g=x.length;for(let m=0,v=x.length;m<v;m++)x[m].element.style.zIndex=g-m}}}function Xh(i,t=!1){const e=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},o={},a=i[0].morphTargetsRelative,h=new Fe;h.morphTargetsRelative=a;let l=0;for(let f=0;f<i.length;++f){const d=i[f];let c=0,u=0;if(e!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const p in d.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;r[p]===void 0&&(r[p]=[]),r[p].push(d.attributes[p]),c++}if(c!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". Make sure all geometries have the same number of attributes."),null;if(a!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const p in d.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+".  .morphAttributes must be consistent throughout all geometries."),null;if(d.morphAttributes[p].length!==i[0].morphAttributes[p].length)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+'. All geometries must have the same number of morph targets for the "'+p+'" morph attribute.'),null;o[p]===void 0&&(o[p]=[]),o[p].push(d.morphAttributes[p]),u++}if(u!==s.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". Make sure all geometries have the same number of morph attributes."),null;if(t){let p;if(e)p=d.index.count;else if(d.attributes.position!==void 0)p=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". The geometry must have either an index or a position attribute"),null;h.addGroup(l,p,f),l+=p}}if(e){let f=0;const d=[];for(let c=0;c<i.length;++c){const u=i[c].index;for(let p=0;p<u.count;++p)d.push(u.getX(p)+f);f+=i[c].attributes.position.count}h.setIndex(d)}for(const f in r){const d=Cc(r[f]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+f+" attribute."),null;h.setAttribute(f,d)}for(const f in o){const d=o[f][0].length;if(d!==0){h.morphAttributes=h.morphAttributes||{},h.morphAttributes[f]=[];for(let c=0;c<d;++c){const u=[];for(let x=0;x<o[f].length;++x)u.push(o[f][x][c]);const p=Cc(u);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+f+" morphAttribute."),null;h.morphAttributes[f].push(p)}}}return h}function Cc(i){let t,e,n,s=-1,r=0;for(let l=0;l<i.length;++l){const f=i[l];if(t===void 0&&(t=f.array.constructor),t!==f.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=f.itemSize),e!==f.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=f.normalized),n!==f.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=f.gpuType),s!==f.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=f.count*e}const o=new t(r),a=new Vn(o,e,n);let h=0;for(let l=0;l<i.length;++l){const f=i[l];if(f.isInterleavedBufferAttribute){const d=h/e;for(let c=0,u=f.count;c<u;c++)for(let p=0;p<e;p++){const x=f.getComponent(c,p);a.setComponent(c+d,p,x)}}else o.set(f.array,h);h+=f.count*e}return s!==void 0&&(a.gpuType=s),a}const rt=(i,t,e)=>new A(i,t,e),Nt=(i,t)=>({...i,name:t});function ba(i,t){for(const e of i)e.geometry.applyMatrix4(t);return i}function P_(i){const t=i.plan;return t.kind==="humanoid"?O_(i,t):t.kind==="animal"?F_(i,t):L_(i)}function L_(i){const t=i.height,e=i.footprint?Math.min(i.footprint.width,i.footprint.depth):.36*(t/1.75),n=Math.max(.02,Math.min(e*.45,t/4));return[Nt(Re(rt(0,0,n),rt(0,0,Math.max(n*1.01,t-n)),n,i.colours.skin),"placeholder")]}const Pc=[.8,.4,.1,-.25,.6,-.1,.25];function D_(i,t){const e=i.geometry.index?i.geometry.toNonIndexed():i.geometry;e!==i.geometry&&i.geometry.dispose();const n=e.getAttribute("position").count;e.setIndex([...Array(n).keys()]),e.computeVertexNormals();const s=new Float32Array(n);for(let r=0;r<n/3;r++)s.fill(Pc[r*3%Pc.length],r*3,r*3+3);return{...i,geometry:e,shade:s,tone:t}}const To=new A(.85,1.35,.85);function N_(i,t,e,n){const s=i.colours,r=t.headColour??s.skin,o=s.eyes??In,a=[],h=l=>[-1,1].map(l);switch(t.head){case"wolf":{a.push(Nt(te(rt(0,0,0),e,r,rt(.92,.95,.9),12),"skull")),a.push(Nt(te(rt(0,e*.95,-e*.28),e*.5,t.accent,rt(.72,1.55,.68),10),"muzzle")),a.push(Nt(te(rt(0,e*.8,-e*.58),e*.36,t.accent,rt(.66,1.3,.45),8),"jaw")),a.push(Nt(te(rt(0,e*1.7,-e*.18),e*.15,In,void 0,8),"nose")),a.push(...h(l=>Nt(si(rt(l*e*.5,-e*.1,e*.6),rt(l*.32,-.1,1).normalize(),e*.28,e*.85,r,4),"ear"))),a.push(...h(l=>Nt(te(rt(l*e*.36,e*.74,e*.16),e*.11,o,void 0,8),"eye")));break}case"slack":{a.push(Nt(te(rt(0,0,0),e,r,rt(.84,.95,1),12),"skull")),a.push(...h(l=>Nt(te(rt(l*e*.32,e*.84,e*(l<0?.14:.06)),e*.11,o,void 0,8),"eye"))),a.push(...h(l=>Nt(te(rt(l*e*.32,e*.93,e*(l<0?.14:.06)),e*.04,In,void 0,6),"pupil"))),a.push(Nt(Qe(new xi(e*.13,e*.3,6),r,rt(0,e*.98,-e*.08)),"nose")),a.push(Nt(te(rt(0,e*.84,-e*.48),e*.16,t.accent,rt(1.2,.5,1),8),"mouth")),a.push(...h(l=>Nt(te(rt(l*e*.84,0,0),e*.22,r,rt(.5,1,1.3),8),"ear")));break}case"ghoul":{a.push(Nt(te(rt(0,0,e*.08),e,r,rt(.8,.92,1),12),"skull")),a.push(Nt(te(rt(0,e*.32,-e*.55),e*.62,t.accent,rt(1.08,.95,.72),10),"jaw")),a.push(Nt(ri(rt(0,e*.92,-e*.58),rt(e*.7,e*.06,e*.07),In),"mouth")),a.push(...h(l=>Nt(te(rt(l*e*.3,e*.78,e*.18),e*.09,o,void 0,8),"eye"))),a.push(...h(l=>Nt(si(rt(l*e*.74,0,e*.1),rt(l,-.3,.5).normalize(),e*.16,e*.4,r,4),"ear")));break}case"primate":{a.push(Nt(te(rt(0,0,0),e,r,rt(.95,.9,.95),12),"skull")),a.push(Nt(te(rt(0,e*.42,-e*.08),e*.7,t.accent,rt(.85,.75,.95),10),"face")),a.push(Nt(Re(rt(-e*.46,e*.82,e*.26),rt(e*.46,e*.82,e*.26),e*.14,r,!1),"brow")),a.push(Nt(te(rt(0,e*.86,-e*.36),e*.38,t.accent,rt(1.1,.8,.75),8),"muzzle")),a.push(...h(l=>Nt(te(rt(l*e*.12,e*1.15,-e*.3),e*.05,In,void 0,6),"nostril"))),a.push(...h(l=>Nt(te(rt(l*e*.3,e*.92,e*.1),e*.09,o,void 0,8),"eye"))),a.push(...h(l=>Nt(te(rt(l*e*.95,0,0),e*.26,t.accent,rt(.5,1,1.1),8),"ear")));break}case"crystal":{a.push(Nt(Qe(new Za(e,0),r,rt(0,0,0),void 0,rt(.86,.95,1.05)),"skull")),a.push(...h(l=>Nt(Qe(new Ka(e*.12,0),o,rt(l*e*.32,e*.82,e*.12)),"eye"))),a.push(Nt(si(rt(e*.15,-e*.2,e*.75),rt(.25,-.35,1).normalize(),e*.2,e*.7,t.accent,4),"spur"));break}case"shark":{a.push(Nt(te(rt(0,e*.25,0),e,r,To,12),"snout")),a.push(Nt(te(rt(0,e*.32,-e*.3),e,t.accent,rt(.78,1.25,.58),10),"underside"));const l=1.9,f=new ei(1,.06,3,16,l);f.rotateZ(Math.PI/2-l/2),f.scale(e*.8,e*1.27,e),f.translate(0,e*.32,-e*.36),a.push(Nt({geometry:f,colour:In},"mouth"));for(const x of[-1,1]){const g=48*Math.PI/180;a.push(Nt(te(rt(x*e*To.x*Math.sin(g),e*.25+e*To.y*Math.cos(g),e*.08),e*.12,o,void 0,8),"eye")),a.push(Nt(te(rt(x*e*.17,e*1.54,-e*.1),e*.045,In,void 0,6),"nostril"));for(let m=0;m<3;m++)a.push(Nt(ri(rt(x*e*.5,-e*(.05+m*.14),-e*.82),rt(e*.05,e*.035,e*.3),Tr(r,In,.55)),"gill"))}const d=-e*.45,c=-e*1.2,u=new Hn(e*.6,n*1.05,d-c,12,1);u.rotateX(Math.PI/2),u.translate(0,e*.05,(d+c)/2),a.push(Nt({geometry:u,colour:r},"taper"));const p=new xi(e*.42,e*.95,4);p.scale(.22,1,1),p.rotateX(Math.PI/2-.45),a.push(Nt(Qe(p,r,rt(0,-e*.2,e*.95)),"fin"));break}}if(i.headCovered){const l=new Gn(e*1.08,12,5,0,Math.PI*2,0,Math.PI/2);l.rotateX(-.5),a.push(Nt({geometry:l,colour:s.head},"hood"))}return a}const I_=new A(0,.04,.62),U_=new A(0,-.05,.14);function O_(i,t){const e=i.colours,n=i.height,s=n/1.75,r=t.covering==="crystal",o=i.posture==="sitting",a=n*i.legShare,h=.26*n,l=o?a-h:0,f=a-l,d=i.headHeight/2,c=i.limbRadius*1.15,u=i.hipHalf*.55,p=.06*s,x=[];for(const G of[-1,1]){const w=G*u;if(o){const I=rt(w,.24*n,h);x.push(Re(rt(w,0,f),I,c,e.legs,!r)),x.push(Re(I,rt(w,.24*n,p+c),c*.9,e.legs,!r)),x.push(ri(rt(w,.24*n+.04*s,p/2),rt(c*2.2,.16*s,p),e.feet))}else if(t.digitigrade){const I=I_.clone().multiply(rt(1,n,f)).setX(w),X=U_.clone().multiplyScalar(n).setX(w);x.push(Nt(Re(rt(w,0,f),I,c*1.15,e.legs,!r),"thigh")),x.push(Nt(Re(I,X,c*.85,e.legs,!r),"shin")),x.push(Nt(Re(X,rt(w,.03*n,p),c*.65,e.feet,!r),"heel")),x.push(Nt(te(rt(w,.06*n,p*.6),c*1.05,e.feet,rt(1,1.7,.6),8),"paw"))}else x.push(Re(rt(w,0,p+c),rt(w,0,f-c*.5),c,e.legs,!r)),x.push(ri(rt(w,.04*s,p/2),rt(c*2.2,.16*s,p),e.feet))}const g=new fe().makeRotationX(-t.hunch),m=new fe().makeTranslation(0,0,f).multiply(g),v=(n-l-f)/Math.cos(t.hunch),b=.045*n,S=v-i.headHeight-b,C=.05*n,T=S-i.limbRadius*1.2,_=.045*s*t.shape.limbs*(t.neckScale??1),E=r?6:void 0,N=[ns(-.07*n,C,i.hipHalf,i.waistHalf,.62,e.hips,0,E),ns(C,S,i.waistHalf,i.shoulderHalf*.92,.55,e.torso,0,E),Re(rt(-i.shoulderHalf*.9,0,T),rt(i.shoulderHalf*.9,0,T),i.limbRadius*1.35,e.torso,!r),ns(S-.01,v-d*1.6,_,_,1,e.neck,0,E)];if(t.chest&&e.torso===e.skin){const G=S-C;N.push(Nt(te(rt(0,i.shoulderHalf*.1,C+G*.7),1,t.accent,rt(i.shoulderHalf*.72,i.shoulderHalf*.42,G*.24),12),"chest")),N.push(Nt(te(rt(0,i.waistHalf*.12,C+G*.35),1,t.accent,rt(i.waistHalf*.6,i.waistHalf*.45,G*.3),12),"chest"))}if(r)for(const[G,w,I,X,H]of[[-.75,-.1,-.5,-.3,1],[.7,-.15,.45,-.4,.8],[.25,-.45,.2,-.8,.9],[-.3,-.4,-.3,-.7,.7]])N.push(Nt(si(rt(G*i.shoulderHalf,w*i.shoulderHalf,T+i.limbRadius*.4),rt(I,X,1).normalize(),.035*s*H,.16*s*H,t.accent,4),"shard"));x.push(...ba(N,m));const P=rt(0,0,v-d).applyMatrix4(m),L=new fe().makeRotationFromEuler(new Ge(-t.droop,t.droop*.6,0));x.push(...ba(N_(i,t,d,_),new fe().makeTranslation(P.x,P.y,P.z).multiply(L)));const F=o?f+.02*n:Math.max(.05*n,t.wristShare*n);for(const G of[-1,1]){const w=rt(G*i.shoulderHalf,0,T).applyMatrix4(m),I=Math.max(.12*n,w.z-F),X=rt(G*(i.hipHalf+i.limbRadius*1.6),w.y+Math.tan(t.reach)*I+(o?.08*s:0),w.z-I);x.push(Nt(Re(w,X,i.limbRadius,e.arms,!r),"arm"));const H=X.clone().sub(w).normalize();x.push(Nt(te(X.clone().addScaledVector(H,i.limbRadius*1.3),i.limbRadius*1.25,e.hands,void 0,8),"hand"))}const W=e.skin,U=P.z+d*.8;for(const G of i.extras)if(G==="tail"){const w=rt(0,-i.hipHalf*.6,f),I=rt(0,w.y-.3*s,o?.04:f-.16*n);x.push(Nt(Re(w,I,i.limbRadius*(t.covering==="fur"?.85:.6),W,!1),"tail"))}else if(G==="horns"||G==="antlers")for(const w of[-1,1]){const I=rt(P.x+w*d*.45,P.y,U);G==="horns"?x.push(Nt(si(I,rt(w*.35,.2,1).normalize(),d*.16,d*.7,Es,6),"horn")):x.push(Nt(Re(I,I.clone().add(rt(w*d,-d*.2,d*1.4)),d*.07,Es,!1),"antler"))}else if(G==="wings")for(const w of[-1,1])x.push(Nt(qh(w,s,rt(w*i.shoulderHalf*.45,-.1*s,T-.04*n).applyMatrix4(m),W),"wing"));return r?x.map(G=>D_(G,t.accent)):x}function F_(i,t){var d,c,u,p;const e=i.height,n=t.animal==="snake",s=n?V_(t,((d=i.footprint)==null?void 0:d.width)??e*2,((c=i.footprint)==null?void 0:c.depth)??e*8,e):t.animal==="duck"?B_(t):z_(t),r=new Cn;for(const x of s)x.geometry.computeBoundingBox(),x.geometry.boundingBox&&r.union(x.geometry.boundingBox);const o=r.getSize(new A),a=r.getCenter(new A),h=((u=i.footprint)==null?void 0:u.width)??e*(o.x/o.z),l=((p=i.footprint)==null?void 0:p.depth)??e*(o.y/o.z),f=n?1:t.animal==="songbird"?Math.min(h/o.x,e/o.z):Math.min(h/o.x,l/o.y,e/o.z);return ba(s,new fe().makeScale(f,f,f).multiply(new fe().makeTranslation(-a.x,-a.y,-r.min.z)))}function B_(i){const t=Tr(i.skin,In,.65),e=[Nt(te(rt(0,-.02,.32),.2,i.skin,rt(1.1,2.05,.95),12),"body"),Nt(te(rt(0,.24,.3),.17,i.accent,rt(1.05,1,1.05),10),"breast"),...[-1,1].map(n=>Nt(te(rt(n*.16,-.08,.38),.13,i.wing,rt(.55,2.1,.75),10),"wing")),Nt(si(rt(0,-.38,.37),rt(0,-1,.4).normalize(),.09,.17,t,5),"tail"),Nt(Re(rt(0,.3,.42),rt(0,.36,.6),.065,i.head,!1),"neck"),Nt(Qe(new ei(.068,.014,3,10),"#f2f0ea",rt(0,.31,.45)),"ring"),Nt(te(rt(0,.38,.65),.1,i.head,rt(.9,1.15,.95),10),"head"),Nt(te(rt(0,.53,.61),.06,i.beak,rt(.9,1.6,.38),8),"bill"),...[-1,1].map(n=>Nt(te(rt(n*.072,.42,.68),.013,i.eyes,void 0,6),"eye"))];for(const n of[-1,1])e.push(Nt(Re(rt(n*.07,.02,.15),rt(n*.07,.04,.02),.018,i.feet,!1),"leg")),e.push(Nt(ri(rt(n*.07,.08,.008),rt(.08,.1,.016),i.feet),"foot"));return e}function z_(i){const t=[Nt(te(rt(0,0,.33),.2,i.skin,rt(.9,1.35,1),12),"body"),Nt(te(rt(0,.17,.31),.15,i.accent,rt(.9,.95,1),10),"breast"),Nt(te(rt(0,.2,.57),.12,i.head,void 0,10),"head"),Nt(si(rt(0,.29,.57),rt(0,1,-.15).normalize(),.045,.13,i.beak,5),"beak"),Nt(ri(rt(0,-.4,.41),rt(.16,.26,.025),i.wing,new Ge(-.5,0,0)),"tail"),...[-1,1].map(e=>Nt(te(rt(e*.085,.28,.61),.02,i.eyes,void 0,6),"eye")),...[-1,1].map(e=>Nt(te(rt(e*.15,-.1,.39),.12,i.wing,rt(.35,2,.75),8),"wing"))];for(const e of[-1,1])t.push(Nt(Re(rt(e*.05,.03,.16),rt(e*.05,.05,.02),.012,i.feet,!1),"leg")),t.push(Nt(ri(rt(e*.05,.08,.006),rt(.03,.08,.012),i.feet),"foot"));return t}const H_=.03,G_=.6,k_=.022;function V_(i,t,e,n){const s=Math.max(G_,t,e,n),r=Math.max(H_,s*k_),o=r*1.3,a=Math.max(s*.1,Math.min(s*.15,n-2*r-o)),h=[];if(e>=s*.8){const v=e*.85,b=Math.max(r*1.5,Math.min(t/2-r*1.2,s*.12));for(let S=0;S<=14;S++)h.push(rt(b*Math.sin(S/14*Math.PI*2.5),-v/2+S/14*v*.9,r))}else{const v=r*2.3,b=r*2.2,C=(Math.sqrt(s*.85*v/Math.PI+b*b)-b)/v,T=Math.max(16,Math.min(40,Math.round(C*14)));for(let _=0;_<=T;_++){const E=C*Math.PI*2*(1-_/T),N=b+v*E/(Math.PI*2);h.push(rt(N*Math.sin(E),N*Math.cos(E),r))}}const l=h[h.length-1],f=rt(0,1,0),d=v=>l.clone().addScaledVector(f,s*.06*Math.sin(v*Math.PI/2)).setZ(r+a*(1-Math.cos(v*Math.PI/2))),c=[1,2,3,4].map(v=>d(v/4)),u=[...h,...c],p=[];for(let v=0;v<u.length-1;v++){const b=(v+.5)/(u.length-1),S=v>=h.length-1,C=r*(.3+.7*Math.min(1,b/.3))*(S?.85:1);p.push(Nt(Re(u[v],u[v+1],C,!S&&Math.floor(v/2)%2?i.accent:i.skin,!1),"segment"))}const x=u[u.length-1].clone().addScaledVector(f,o*.9),g=new Ge(0,0,0);p.push(Nt(Qe(new Gn(o,10,8),i.head,x,g,rt(1,1.5,.7)),"head"));for(const v of[-1,1]){const b=rt(v*o*.75,o*.45,o*.3).applyEuler(g).add(x);p.push(Nt(te(b,o*.2,i.eyes,void 0,6),"eye"))}const m=x.clone().addScaledVector(f,o*1.45);return p.push(Nt(Re(m,m.clone().addScaledVector(f,o*1.1),o*.08,i.beak,!1),"tongue")),p}const he=(i,t)=>({...i,name:t}),Gr=10,Ao="#ece8e0",W_=1.3,X_=In,Ta=.006,qi=1.03,wo=.005,Y_=.66;function Qe(i,t,e,n,s){const r=new fe().compose(e,new He().setFromEuler(n??new Ge),s??new A(1,1,1));return i.applyMatrix4(r),{geometry:i,colour:t}}const Yh=.05,q_=14,Z_=1.45,K_=.15,J_=1.8;function br(i,t,e,n,s=1,r,o=()=>1,a=0,h={swing:1.6,lobes:5,strands:0}){if(e==="straight")return;const l=new Float32Array(i.getAttribute("position").count),f=i.getAttribute("position"),d=new A,c=new A,u=new A;for(let p=0;p<f.count;p++){d.fromBufferAttribute(f,p),c.subVectors(d,t(d)),u.copy(d);const x=Math.atan2(u.y-t(d).y,u.x-t(d).x),g=((u.z-a)*s+a)/n,[m,v]=e==="wavy"?[Yh,Math.sin(g*7+h.swing*Math.sin(x*h.lobes)+h.strands*Math.sin(x*17))]:e==="curly"?[.09,Math.sin(x*7)*Math.sin(g*9)]:[.1,Math.sin(x*11)*Math.sin(g*14)];l[p]=.5+.5*v;const b=n*m*l[p]*o(d,p)/Math.max(1e-6,c.length());d.addScaledVector(c,b),f.setXYZ(p,d.x,d.y,d.z)}return f.needsUpdate=!0,i.computeVertexNormals(),l}function $_(i,t,e,n,s,r,o,a){const h=i.getAttribute("position"),l=h.count/2,f=l/(t+1)-1,d=new Float32Array(h.count),c=new A,u=new A;for(let p=0;p<h.count;p++){const x=p%l,[g,m]=[x%(t+1),Math.floor(x/(t+1))],v=Math.floor(g/2),b=g%2===1,S=F=>{const W=Math.sin(v*12.9898+F*78.233)*43758.5453;return W-Math.floor(W)},C=2*Math.PI*m/(e*(.67+.83*S(1)))+2*Math.PI*S(2),T=Math.min(1,Math.min(g,t-g)/2),_=(b?.45+.3*S(3)+.3*Math.sin(C):.12)*T,E=b?(.2+.15*S(4))*Math.cos(C)*T:0;c.fromBufferAttribute(h,p),u.subVectors(c,n(c));const N=Math.max(1e-6,Math.hypot(u.x,u.y)),P=a(c,g),L=E*N*s/t;c.x+=(u.x/N*r*.12*_+-u.y/N*L)*P,c.y+=(u.y/N*r*.12*_+u.x/N*L)*P,m===f&&b&&(c.z-=o*S(5)),h.setXYZ(p,c.x,c.y,c.z),d[p]=_}return h.needsUpdate=!0,i.computeVertexNormals(),d}const es=.75,Ro={straight:0,wavy:es*.375,curly:es*.3125,coily:es*.3125};function Q_(i,t,e){return!t||!e?i:{...i,shade:t.map(n=>es*n*n),tone:e}}function Aa(i,t){const e=new Float32Array(i);for(let n=0;n<i;n++)e[n]=n%t%2?1:.15;return e}const Lc=16,Dc=4,ae=i=>{const t=Math.min(1,Math.max(0,i));return t*t*(3-2*t)};function mr(i){const t=Math.abs(i-Math.PI/2);return .96+.79*ae((t-.25)/.9)-.79*ae((t-1.5)/.5)}function Nc(i,t,e,n,s,r,o){const a=[],h=[];for(let d=0;d<=e;d++)for(let c=0;c<=t;c++){const u=n+s*c/t,p=r(u)+(o(u)-r(u))*d/e;a.push(-i*Math.cos(u)*Math.sin(p),i*Math.cos(p),i*Math.sin(u)*Math.sin(p))}const l=(d,c)=>c*(t+1)+d;for(let d=0;d<e;d++)for(let c=0;c<t;c++){const u=l(c+1,d),p=l(c,d),x=l(c,d+1),g=l(c+1,d+1);h.push(u,p,g,p,x,g)}const f=new Fe;return f.setAttribute("position",new _e(a,3)),f.setIndex(h),f.computeVertexNormals(),f}function j_(i,t){const e=i.getIndex();if(e){for(let n=0;n<e.count;n++){const s=e.getX(n),[r,o]=[s%(t+1),Math.floor(s/(t+1))];o===0?e.setX(n,0):r===t&&e.setX(n,o*(t+1))}e.needsUpdate=!0,i.computeVertexNormals(),wa(i,t)}}function wa(i,t){const e=i.getAttribute("normal");for(let n=0;n<e.count;n++){const[s,r]=[n%(t+1),Math.floor(n/(t+1))],o=r===0?0:s===t?r*(t+1):n;o!==n&&e.setXYZ(n,e.getX(o),e.getY(o),e.getZ(o))}e.needsUpdate=!0}function Ra(i){const t=i.clone(),e=t.getIndex();if(e){const r=e.array,o=new Uint32Array(r.length);for(let a=0;a<r.length;a+=3)o[a]=r[a],o[a+1]=r[a+2],o[a+2]=r[a+1];t.setIndex(new Vn(o,1))}const n=t.getAttribute("normal");for(let r=0;r<n.count;r++)n.setXYZ(r,-n.getX(r),-n.getY(r),-n.getZ(r));const s=Xh([i,t],!1);if(i.dispose(),t.dispose(),!s)throw new Error("hair could not be made two-sided");return s}function tx(i,t,e,n,s){const r=i.getAttribute("position"),o=[],a=new A;for(let u=0;u<=t;u++)o.push(r.getX(e*(t+1)+u),r.getY(e*(t+1)+u),r.getZ(e*(t+1)+u));for(let u=0;u<=t;u++){a.set(o[u*3],o[u*3+1],o[u*3+2]).sub(n);const p=Math.min(a.length(),s(a.clone().normalize()));a.setLength(p).add(n),o.push(a.x,a.y,a.z)}const h=[];for(let u=0;u<t;u++){const p=u+1===t?0:u+1,[x,g,m,v]=[u,p,t+1+u,t+1+p];h.push(x,m,g,g,m,v)}const l=new Fe;l.setAttribute("position",new _e(o,3)),l.setIndex(h),l.computeVertexNormals();const f=Ra(l),d=f.getAttribute("normal"),c=i.getAttribute("normal");for(let u=0;u<d.count;u++){const p=e*(t+1)+u%(t+1);d.setXYZ(u,c.getX(p),c.getY(p),c.getZ(p))}return f}function qh(i,t,e,n){const s=new bh;s.moveTo(0,0),s.quadraticCurveTo(.15,.32,.62,.44),s.quadraticCurveTo(.56,.26,.5,.2),s.quadraticCurveTo(.46,.05,.37,.08),s.quadraticCurveTo(.33,-.1,.23,-.05),s.quadraticCurveTo(.18,-.26,.08,-.22),s.quadraticCurveTo(.04,-.1,0,-.08),s.closePath();const r=new qa(s,{depth:.015,bevelEnabled:!1,curveSegments:4});return r.setIndex([...Array(r.getAttribute("position").count).keys()]),r.translate(0,0,-.0075),r.rotateX(Math.PI/2),i<0&&r.rotateZ(Math.PI),r.rotateZ(-i*.5),r.scale(t,t,t),r.translate(e.x,e.y,e.z),{geometry:r,colour:n}}const wi=(i,t,e,n)=>Re(i,t,e,n,!1);function Re(i,t,e,n,s=!0){const r=i.distanceTo(t),o=new Wa(e,Math.max(.001,r),s?2:1,s?Gr:6),a=new A().subVectors(t,i).normalize(),h=new He().setFromUnitVectors(new A(0,1,0),a);return o.applyMatrix4(new fe().compose(i.clone().add(t).multiplyScalar(.5),h,new A(1,1,1))),{geometry:o,colour:n}}function ns(i,t,e,n,s,r,o=0,a=Gr*2){const h=new Hn(n,e,Math.max(.001,t-i),a);return Qe(h,r,new A(0,o,(i+t)/2),new Ge(Math.PI/2,0,0),new A(1,1,s))}function te(i,t,e,n,s=Gr){return Qe(new Gn(t,s,Math.max(4,s-2)),e,i,void 0,n)}function ri(i,t,e,n){return Qe(new Di(t.x,t.y,t.z),e,i,n)}function Zi(i,t,e,n,s,r){const o=new Hn(n,n,Ta,Gr*2,1,!0);return Qe(o,r,new A(i,t,e),new Ge(Math.PI/2,0,0),new A(1,1,s))}function si(i,t,e,n,s,r=5){const o=new xi(e,n,r,1,!0);return o.applyMatrix4(new fe().compose(i.clone().addScaledVector(t,n/2),new He().setFromUnitVectors(new A(0,1,0),t),new A(1,1,1))),{geometry:o,colour:s}}function ex(i,t,e,n){const[s,r]=[1.25,-2.3],o=14,a=[],h=[];for(let d=0;d<=o;d++){const c=d/o,u=s+(r-s)*c,p=Math.min(1,c/.12,(1-c)/.12),x=1+n*Math.sqrt(Math.max(0,p)),[g,m]=[Math.sin(u),Math.cos(u)];for(const[v,b]of[[1,.1],[x,.055]])for(const S of[-1,1])a.push(S*b*i,g*v*i*t.y,e+m*v*i*t.z)}const l=(d,c)=>d*4+c;for(let d=0;d<o;d++)for(const[c,u]of[[1,3],[2,0],[3,2]])h.push(l(d,c),l(d+1,u),l(d+1,c),l(d,c),l(d,u),l(d+1,u));h.push(l(0,0),l(0,3),l(0,1),l(0,0),l(0,2),l(0,3)),h.push(l(o,0),l(o,1),l(o,3),l(o,0),l(o,3),l(o,2));const f=new Fe;return f.setAttribute("position",new _e(a,3)),f.setIndex(h),f.computeVertexNormals(),f}const Zh=8;function nx(i,t,e){const n=Zh,s=2,r=[];for(let l=0;l<=s;l++)for(let f=0;f<=n;f++){const d=f/n,c=-.45+1.55*d,u=.95-.5*Math.min(1,d/.6)+.45*l/s,p=new A(Math.cos(u)*Math.sin(c)*i.x,Math.cos(u)*Math.cos(c)*i.y,Math.sin(u)*i.z).normalize(),x=e(p).multiplyScalar(1.03);r.push(x.x,x.y,t+x.z)}const o=[],a=(l,f)=>f*(n+1)+l;for(let l=0;l<s;l++)for(let f=0;f<n;f++)o.push(a(f,l),a(f+1,l+1),a(f+1,l),a(f,l),a(f,l+1),a(f+1,l+1));const h=new Fe;return h.setAttribute("position",new _e(r,3)),h.setIndex(o),h.computeVertexNormals(),h}function ix(i,t,e,n,s,r,o){const a=i.height/1.75,h=i.colours.head,l=i.colours.hairSheen,f={none:0,shaved:0,cropped:.04,short:.08,"chin-length":.18,"shoulder-length":.28,long:.42,"waist-length":.58}[i.hair]*a,d=(u,p,x,g=1.08)=>{const m=new A(u,p,x).normalize();return new A(m.x*n*s.x*g,m.y*n*s.y*g,e+m.z*n*s.z*g)},c=[];switch(t){case"ponytail":{const u=d(0,-1,.25,1.05),p=new A(0,u.y-n*.35,u.z-Math.max(f,.1*a));c.push(he(Re(u,p,n*.2,h),"ponytail")),c.push(he(te(u,n*.14,i.colours.ink,void 0,6),"ponytail"));break}case"braided":for(const u of[-1,1]){const p=d(u*.75,-.55,-.35,1.02),x=new A(u*n*.85,-n*.95,p.z-Math.max(f,.12*a));c.push(he(Re(p,x,n*.13,h),"braid"));const g=7;for(let m=0;m<g;m++)c.push(he(te(p.clone().lerp(x,m/(g-1)),n*.17,h,void 0,6),"braid"))}break;case"bun":{const u=n*.46,p=d(0,-.65,.76,r+.36),x=he(te(p,u,h,void 0,12),"bun"),g=br(x.geometry,()=>p,i.hairTexture,n*.6),m=x.geometry.getAttribute("normal"),v=new A(0,-.35,1).normalize(),b=new Float32Array(m.count);for(let T=0;T<m.count;T++){const _=Math.max(0,m.getX(T)*v.x+m.getY(T)*v.y+m.getZ(T)*v.z);b[T]=Math.min(1,.55*_*_+(g?.4*g[T]*g[T]:0))}c.push(l?{...x,shade:b,tone:l}:x);const S=d(0,-.65,.76,r+.02),C=new ei(u*.62,n*.06,4,14);C.applyQuaternion(new He().setFromUnitVectors(new A(0,0,1),p.clone().sub(S).normalize())),C.translate(...S.clone().lerp(p,.45).toArray()),c.push(he({geometry:C,colour:l??i.colours.ink},"bun"));break}case"topknot":{const u=d(0,-.1,1,1.22);c.push(he(te(u,n*.26,h,void 0,8),"topknot")),c.push(he(te(d(0,-.1,1,1.05),n*.14,i.colours.ink,void 0,6),"topknot"));break}case"dreadlocks":for(let u=0;u<11;u++){const p=Math.PI*(.9+1.2*u/10),x=d(Math.cos(p),Math.sin(p),.15,1.02),g=new A(x.x*1.2,x.y*1.2,x.z-Math.max(f,.1*a)*(u%2?.85:1));c.push(he(wi(x,g,n*.11,h),"lock"))}break;case"spiky":for(let u=0;u<9;u++){const p=u*Math.PI*2/8,x=u===8?new A(0,0,1):new A(Math.cos(p)*.7,Math.sin(p)*.7,.75).normalize();c.push(he(si(d(x.x,x.y,x.z,1),x,n*.14,n*.55,h),"spike"))}break;case"mohawk":c.push(he({geometry:ex(n,s,e,i.hair==="cropped"?.5:.65),colour:h},"crest"));break;case"brushed":{c.push(he(wi(d(-.32,.45,.85,1.07),d(-.32,-.45,.85,1.07),n*.035,i.colours.skin),"parting"));const u=nx(s,e,o),p=l?{shade:Aa(u.getAttribute("position").count,Zh+1).map(x=>x*.5),tone:l}:{};c.push(he({geometry:u,colour:h,...p},"fringe"));break}}return c}const sx={average:{half:.26,depth:.16},small:{half:.19,depth:.12},large:{half:.34,depth:.2},pointed:{half:.26,depth:.15}};function rx(i){const t=i.colours,e=i.height,n=e/1.75,s=[],r=i.posture==="sitting",o=e*i.legShare,a=.26*e,h=r?o-a:0,l=o-h,f=e-i.headHeight-.045*e-h,d=e-i.headHeight/2-h,c=i.headHeight/2,u=i.limbRadius*1.15,p=i.hipHalf*.55,x=.06*n,g=new Set(i.outlined);for(const q of[-1,1]){const at=q*p;if(r){const ot=new A(at,.24*e,a);s.push(Re(new A(at,0,l),ot,u,t.legs)),s.push(Re(ot,new A(at,.24*e,x+u),u*.9,t.legs)),s.push(ri(new A(at,.24*e+.04*n,x/2),new A(u*2.2,.16*n,x),t.feet)),g.has("ankles")&&s.push(he(Zi(at,.24*e,x+.02*n,u*qi,1,t.ink),"band"))}else s.push(Re(new A(at,0,x+u),new A(at,0,l-u*.5),u,t.legs)),s.push(ri(new A(at,.04*n,x/2),new A(u*2.2,.16*n,x),t.feet)),g.has("ankles")&&s.push(he(Zi(at,0,x+.02*n,u*qi,1,t.ink),"band"));g.has("hips")&&s.push(he(Zi(at,r?.06*n:0,l-.07*e-Ta,u*qi,1,t.ink),"band"))}const m=l+.05*e;s.push(ns(l-.07*e,m,i.hipHalf,i.waistHalf,.62,t.hips)),s.push(ns(m,f,i.waistHalf,i.shoulderHalf*.92,.55,t.torso));const v=f-i.limbRadius*1.2;s.push(Re(new A(-i.shoulderHalf*.9,0,v),new A(i.shoulderHalf*.9,0,v),i.limbRadius*1.35,t.torso)),g.has("waist")&&s.push(he(Zi(0,0,m,i.waistHalf*qi,.62,t.ink),"band"));const b=l-.02*e;for(const q of[-1,1]){const at=new A(q*i.shoulderHalf,0,v),ot=new A(q*(i.hipHalf+i.limbRadius*1.6),r?.08*n:0,b);s.push(Re(at,ot,i.limbRadius,t.arms)),s.push(te(new A(ot.x,ot.y,ot.z-i.limbRadius*1.3),i.limbRadius*1.25,t.hands,void 0,8)),g.has("wrists")&&s.push(he(Zi(ot.x,ot.y,ot.z,i.limbRadius*qi,1,t.ink),"band"))}const S=.045*n;s.push(ns(f-.01,d-c*.6,S,S,1,t.neck));const C=f+i.limbRadius*.15+Ta;g.has("neck")&&s.push(he(Zi(0,0,C,S*qi,1,t.collarEdge),"band"));const T=new A(.84,.95,1);s.push(te(new A(0,0,d),c,t.skin,T,14)),s.push(Qe(new xi(c*.13,c*.3,6),t.skin,new A(0,c*.98,d-c*.08),new Ge(0,0,0)));const _=(q,at)=>c*T.y*Math.sqrt(Math.max(0,1-(q/(c*T.x))**2-(at/(c*T.z))**2));if(i.described&&!i.faceHidden){const q=c*.1,at=iu(t.skin,Ao)<W_?su(t.skin,Ao):void 0;for(const M of[-1,1]){const z=M*c*.32,nt=c*.12,Y=new A(z,_(z,nt),d+nt),lt=new A(M*.47,1,.12).normalize(),_t=new He().setFromUnitVectors(new A(0,1,0),lt),$=.6,tt=q/Math.sin($),vt=Y.clone().addScaledVector(lt,-tt*Math.cos($)+q*.05),D=(Wt,dt,ct,Pt)=>{const ht=new Gn(Wt,Pt,dt>.4?2:1,0,Math.PI*2,0,dt);return ht.applyQuaternion(_t),ht.translate(vt.x,vt.y,vt.z),he({geometry:ht,colour:ct},"eye")};if(s.push(D(tt,$,Ao,12)),s.push(D(tt*1.015,Math.asin(Math.min(1,q*.6/(tt*1.015))),t.eyes??X_,10)),at){const Wt=new ei(q*1.1,q*.2,3,12);Wt.applyQuaternion(new He().setFromUnitVectors(new A(0,0,1),lt)),Wt.translate(Y.x,Y.y+q*.06,Y.z),s.push(he({geometry:Wt,colour:at},"eyelid"))}const Q=M*c*.16,Z=M*c*.48,ft=c*.285,ut=t.brow,Mt=new A(Q,_(Q,ft),d+ft),Ut=new A(Z,_(Z,ft-c*.015),d+ft-c*.015);s.push(he(wi(Mt,Ut,c*.045,ut),"brow"))}const ot=-c*.45,Dt=c*.24,R=new A(0,_(0,ot-c*.04),d+ot-c*.04);for(const M of[-1,1]){const z=new A(M*Dt,_(Dt,ot),d+ot);s.push(he(wi(R,z,c*.04,t.faceInk),"mouth"))}}const E=i.headCovered?"loose":i.hairStyle,N=!i.headCovered&&(E==="mohawk"||i.hair==="shaved"),P=N||E==="brushed"||E==="swept_back"?"straight":i.hairTexture,L=!i.headCovered&&!N&&E!=="voluminous"&&(i.hair==="cropped"||i.hair==="short"),F=i.headCovered?1.06:N?1.04:L?i.hair==="cropped"?1.035:1.05:1.05*i.hairVolume*(E==="voluminous"?1.25:1),W=i.hairTexture==="straight"||i.hairTexture==="wavy",U=L?i.hair==="short"?F*(W?1.32:i.hairVolume*1.065):F*i.hairVolume:F,G=q=>ae((q.z/q.length()-.1)/.8),w=q=>1+(U/F-1)*G(q);let I=q=>q.clone().multiplyScalar(c),X=(q,at,ot)=>0,H=q=>q.clone().normalize(),j=q=>0,et=(q,at)=>Number.NEGATIVE_INFINITY,mt=(q,at,ot)=>{};const It=ru.includes(E),st={"chin-length":d-c*(i.hairTexture==="coily"?.85:i.hairTexture==="curly"?.95:1.15),"shoulder-length":v-.03*e,long:v-.12*e,"waist-length":m+.02*e}[i.hair],xt=!i.headCovered&&It&&st!==void 0,Rt=d+c*.1,gt=xt&&i.hair==="chin-length"&&(i.hairTexture==="curly"||i.hairTexture==="coily"),At=xt&&!gt&&P===i.hairTexture&&i.hairTexture!=="straight",Kt=xt&&i.hair!=="chin-length"&&(i.hairTexture==="curly"||i.hairTexture==="coily"),yt=q=>Kt?c*K_*ae((q-.5)/.5)*(1-ae((q-1.8)/.3)):0,qt=(q,at)=>{const ot=Math.abs(Math.atan2(q,-at));return i.hair!=="chin-length"?Rt-c*.25*ae((ot-1.6)/.3)+yt(ot):Rt},Xt=(q,at)=>1-ae((Math.abs(Math.atan2(q,-at))-(Kt?J_:.8))/.4),it=(q,at)=>{if(gt&&i.hairTexture==="curly")return 1-ae((Rt-(q.z+d))/(c*.1));if(!xt||gt)return 1;const ot=1-ae((Rt+c*at-(q.z+d))/(c*at))*ae((.45-q.y/c)/.3);return At?ot+(1-ae((qt(q.x,q.y)+c*.03-(q.z+d))/(c*.08))-ot)*Xt(q.x,q.y):ot},pt=q=>it(q,.15),Et=q=>it(q,.3);if(i.headCovered||i.hair!=="none"){const q=!i.headCovered&&P!=="straight",at=q&&P==="coily",ot=g.has("hairline")&&!N&&!i.headCovered,Dt=Math.PI*(ot&&!q?.53:.55),R=at?28:q?24:ot?32:16,M=q?12:9,z=new Gn(c,R,M,0,Math.PI*2,0,Dt);j_(z,R);const nt=new A(0,0,d),Y=new Ge(Math.PI/2+Y_+(E==="swept_back"||E==="brushed"?.3:0),0,0),lt=new A(0,0,1).applyEuler(Y),_t=1/Math.hypot(lt.x/T.x,lt.y/T.y,lt.z/T.z),$=new A(T.x*F,F,_t*F),tt=new He().setFromEuler(Y).invert();I=ct=>{const Pt=ct.clone().applyQuaternion(tt);return ct.clone().multiplyScalar(c/Math.hypot(Pt.x/$.x,Pt.y/$.y,Pt.z/$.z)*w(ct))};const vt=ct=>{if(U===F)return;const Pt=ct.getAttribute("position"),ht=new A;for(let Yt=0;Yt<Pt.count;Yt++)ht.fromBufferAttribute(Pt,Yt).sub(nt),ht.multiplyScalar(w(ht)).add(nt),Pt.setXYZ(Yt,ht.x,ht.y,ht.z);Pt.needsUpdate=!0,ct.computeVertexNormals()},D=ct=>{if(!L)return 1;const Pt=ct.clone().sub(nt);return ae((Pt.z/Pt.length()-.05)/.45)},Q=N?Tr(t.skin,t.head,cl):t.head,Z=he(Qe(z,Q,nt,Y,$),"cap");vt(Z.geometry);const ft=ct=>{const Pt=ct.clone().sub(nt).applyQuaternion(tt).divide($);return Math.acos(Math.max(-1,Math.min(1,Pt.y/(Pt.length()||1))))/Dt},ut=ct=>i.headCovered?0:ae((ft(ct)-.6)/.4),Mt=ct=>{if(!At||i.hairTexture!=="wavy")return 0;const Pt=Math.abs(Math.atan2(ct.x,-ct.y));return .5*ae((qt(ct.x,ct.y)-c*.06-ct.z)/(c*.2))*(1-ae((Pt-1.6)/.35))};j=ct=>D(ct)*(1-.7*ut(ct));const Ut=ct=>{const Pt=Math.max(ut(ct),Mt(ct));if(Pt<=0)return 1;const ht=ct.clone().sub(nt),Yt=ht.length(),xe=c*1.03/Math.hypot(ht.x/(Yt*T.x),ht.y/(Yt*T.y),ht.z/(Yt*T.z));return xe>=Yt?1:(Yt+(xe-Yt)*Pt)/Yt};{const ct=Z.geometry.getAttribute("position"),Pt=new A;for(let ht=0;ht<ct.count;ht++){const Yt=Ut(Pt.fromBufferAttribute(ct,ht));Yt!==1&&ct.setXYZ(ht,nt.x+(Pt.x-nt.x)*Yt,nt.y+(Pt.y-nt.y)*Yt,Pt.z)}ct.needsUpdate=!0,Z.geometry.computeVertexNormals()}const Wt=new He().setFromEuler(Y).invert();X=(ct,Pt,ht)=>{const Yt=Math.hypot(ct,Pt)||1,xe=new A(ct/Yt,Pt/Yt,0).applyQuaternion(Wt).divide($),Pe=new A(0,0,ht-nt.z).applyQuaternion(Wt).divide($),[yn,on,oi]=[xe.dot(xe),2*xe.dot(Pe),Pe.dot(Pe)-c*c],Gt=on*on-4*yn*oi;if(Gt<0)return 0;const kt=(-on+Math.sqrt(Gt))/(2*yn);return kt*Ut(new A(ct/Yt*kt,Pt/Yt*kt,ht))};const dt=new He().setFromEuler(Y);if(H=ct=>ct.clone().sub(nt).applyQuaternion(Wt).divide($).divide($).applyQuaternion(dt).normalize(),wa(Z.geometry,R),i.headCovered)s.push(Z);else{const ct=Z.geometry.getAttribute("position"),Pt=new A,ht=Array.from({length:ct.count},(kt,Zt)=>pt(Pt.fromBufferAttribute(ct,Zt).sub(nt))),Yt=At?Z.geometry.clone():void 0,xe=br(Z.geometry,()=>nt,P,c,1,void 0,kt=>D(kt)*Et(kt.clone().sub(nt))*(1-.7*ut(kt)));wa(Z.geometry,R);const Pe=new Float32Array(ct.count);if(xe)for(let kt=0;kt<ct.count;kt++)Pe[kt]=es*xe[kt]*xe[kt]*ht[kt]+Ro[P]*(1-ht[kt]);const yn=Yt?br(Yt,()=>nt,P,c,1,void 0,kt=>j(kt)):void 0;if(Yt&&yn&&xe){const kt=(me,De)=>{const ge=me.getIndex(),Qt=me.getAttribute("position"),ke=y=>Qt.getZ(y)>Rt-c*.5&&Qt.getZ(y)<Rt+c*.35&&Qt.getY(y)<c*(Kt?.7:.2),cn=[];for(let y=0;y<ge.count;y+=3){const[O,J,k]=[ge.getX(y),ge.getX(y+1),ge.getX(y+2)];(ke(O)||ke(J)||ke(k))&&cn.push(O,J,k)}const hn=new Fe;hn.setAttribute("position",Qt),hn.setAttribute("normal",me.getAttribute("normal")),hn.setIndex(cn);const qn=new _n(hn,new ka({side:Fn})),Be=new Nr,Ve=new Sn,Ze=new A,ai=me.getAttribute("position"),en=me.getAttribute("normal");return(y,O,J)=>{const k=Math.hypot(y,O)||1;Be.set(new A(0,0,J),new A(y/k,O/k,0));const V=Be.intersectObject(qn,!1).at(-1);if(!(V!=null&&V.face))return;const{a:bt,b:Ft,c:Tt}=V.face;Ve.setFromAttributeAndIndices(ai,bt,Ft,Tt).getBarycoord(V.point,Ze);const wt=new A().addScaledVector(new A().fromBufferAttribute(en,bt),Ze.x).addScaledVector(new A().fromBufferAttribute(en,Ft),Ze.y).addScaledVector(new A().fromBufferAttribute(en,Tt),Ze.z).normalize();return{r:V.distance,shade:Ze.x*De(bt)+Ze.y*De(Ft)+Ze.z*De(Tt),normal:wt}}},Zt=kt(Z.geometry,me=>Pe[me]),we=kt(Yt,me=>es*yn[me]*yn[me]);mt=(me,De,ge)=>{const[Qt,ke]=[Zt(me,De,ge),we(me,De,ge)];return Qt&&ke?{r:Qt.r,shade:Qt.shade,normal:Qt.normal,fullR:ke.r,fullShade:ke.shade}:void 0}}if(ot)for(let kt=0;kt<=M;kt++)for(let Zt=0;Zt<=R;Zt++){const we=(Zt>>1)*3%4/3,me=ae((kt/M-(.79+.12*we))/.1),De=kt*(R+1)+Zt,ge=ae(((ct.getY(De)-nt.y)/c-.05)/.3);Pe[De]=Math.max(Pe[De],.9*me*ge*(Zt%2?1:.15))}const on=ot?t.hairEdge:t.hairSheen;s.push(xe||ot?{...Z,shade:Pe,tone:on}:Z);{const kt=Array.from({length:R},(Zt,we)=>{const me=M*(R+1)+we;return[Math.atan2(ct.getX(me),-ct.getY(me)),ct.getZ(me)]}).sort((Zt,we)=>Zt[0]-we[0]);et=(Zt,we)=>{const me=Math.atan2(Zt,-we),De=kt.findIndex(hn=>hn[0]>=me),[ge,Qt]=De<=0?[kt[kt.length-1],kt[0]]:[kt[De-1],kt[De]],ke=(Qt[0]-ge[0]+2*Math.PI)%(2*Math.PI)||1,cn=(me-ge[0]+2*Math.PI)%(2*Math.PI)/ke;return ge[1]+(Qt[1]-ge[1])*Math.min(1,Math.max(0,cn))}}const oi=tx(Z.geometry,R,M,nt,kt=>c*.97/Math.hypot(kt.x/T.x,kt.y/T.y,kt.z/T.z)),Gt=new Float32Array(4*(R+1));for(let kt=0;kt<4;kt++)for(let Zt=0;Zt<=R;Zt++)Gt[kt*(R+1)+Zt]=Pe[M*(R+1)+Zt];s.push(he(xe||ot?{geometry:oi,colour:Q,shade:Gt,tone:on}:{geometry:oi,colour:Q},"rim"))}}if(xt&&st!==void 0){const q=1.04*i.hairVolume*(E==="voluminous"?1.2:1),at=Rt,ot=i.hair!=="chin-length",Dt=3.8,R=i.hairTexture!=="straight",M=ot&&(i.hairTexture==="curly"||i.hairTexture==="coily"),z=ot&&i.hairTexture==="wavy",nt=M?i.hairTexture==="coily"?12:14:gt?10:At&&i.hairTexture==="wavy"?q_:R?12:8,Y=M&&i.hairTexture==="curly"?16:20,lt=new Hn(c,c,at-st,Y,nt,!0,-Dt/2,Dt);if(lt.rotateX(Math.PI/2),lt.translate(0,0,(at+st)/2),ot){const Gt=lt.getAttribute("position"),kt=At&&i.hairTexture==="wavy"?Z_:R?1.25:1.6;for(let Zt=0;Zt<Gt.count;Zt++)Gt.setZ(Zt,at-(at-st)*((at-Gt.getZ(Zt))/(at-st))**kt)}const _t=Math.max(d-c*1.05,st+.35*(at-st)),$=ot?1.3:1.12,tt=ot?0:{coily:.3,curly:.2}[i.hairTexture]??0,vt=Gt=>Gt>=_t?1-.1*ae((at-Gt)/(at-_t)):.9+($-.9)*ae((_t-Gt)/(_t-st)),D=Gt=>ot?-c*.25*ae((_t-Gt)/(.5*(_t-st))):0,Q=lt.getAttribute("position"),Z=Gt=>{const kt=Math.floor(Math.min(Gt,Y-1)/2),Zt=Math.sin(kt*12.9898+7*78.233)*43758.5453;return c*(.05+.25*(Zt-Math.floor(Zt)))},ft=new Float64Array(Y+1),ut=new Float32Array(Q.count).fill(1),Mt=new Float32Array(Q.count).fill(Ro[i.hairTexture]),Ut=new Array(Q.count);for(let Gt=0;Gt<Q.count;Gt++){const kt=Math.abs(Math.atan2(Q.getX(Gt),-Q.getY(Gt))),Zt=At&&i.hairTexture==="wavy"?ae((kt-.9)/.5):0,we=Gt%(Y+1),me=Math.sin(Math.floor(Math.min(we,Y-1)/2)*12.9898+13*78.233)*43758.5453,De=At?c*(we%2===1?.05+.1*(me-Math.floor(me)):.015)*(1-ae((kt-.4)/.4)):0,ge=(ot?Math.max(at-c*.25*ae((kt-1.6)/.3),R?Number.NEGATIVE_INFINITY:Math.min(at,et(Q.getX(Gt),Q.getY(Gt))-c*.03)):at)+De+yt(kt);ft[Gt%(Y+1)]=ge;const Qt=ge-(ge-st)*(at-Q.getZ(Gt))/(at-st),ke=vt(Qt),cn=!R&&Math.abs(Qt-st)<1e-5&&Gt%(Y+1)%2?-.012*n:0;let[hn,qn]=[Q.getX(Gt),Q.getY(Gt)];if(ot){const ne=Math.min(Gt%(Y+1),Y-Gt%(Y+1)),Ce=Math.max(0,1-ne/3)*(.8+.2*Math.sin(ne*2.3+(Gt%(Y+1)>Y/2?1:0))),[ve,oe]=M?[1.1,.25]:[.85,.45],Ne=ae((d-c*.05-Qt)/(c*.35))*(1-ae((d-c*ve-Qt)/(c*oe))),Ot=.3*Ce*Ne*Math.sign(hn);[hn,qn]=[hn*Math.cos(Ot)-qn*Math.sin(Ot),hn*Math.sin(Ot)+qn*Math.cos(Ot)]}let[Be,Ve]=[hn*T.x*q*ke,qn*T.y*q*ke+D(Qt)];const Ze=Math.hypot(Be,Ve),ai=1.012+.013*ae(((Kt?ge:at)-Qt)/(c*.06));let en=X(Be,Ve,Qt)*ai,y=0;if(At&&en>0){const ne=Gt%(Y+1),Ce=Math.floor(Math.min(ne,Y-1)/2),ve=Math.sin(Ce*12.9898+11*78.233)*43758.5453;ut[Gt]=ae((ge-Qt)/(c*(.08+.14*(ve-Math.floor(ve)))*(1+2*Zt)));const oe=Qt>ge-c*.3&&Xt(Be,Ve)>0?mt(Be,Ve,Qt):void 0;if(oe&&Qt>Math.min(ge,at)-c*.01){const Ne=Dt/Y;for(const Ot of[-.5,-.25,.25,.5]){const[Ke,Se]=[Math.cos(Ot*Ne),Math.sin(Ot*Ne)],Pn=mt(Be*Ke-Ve*Se,Be*Se+Ve*Ke,Qt);Pn&&(oe.r=Math.max(oe.r,Pn.r))}}if(oe){const Ne=Kt?1:Xt(Be,Ve),Ot=ae((ge-Qt)/(c*.06))*(1-ut[Gt]);en=Math.max(en,en+(Math.max(oe.r,oe.r+(oe.fullR-oe.r)*Ot)*ai-en)*Ne),Mt[Gt]=oe.shade+(oe.fullShade-oe.shade)*ae((ge-Qt)/(c*.06)),Ut[Gt]=oe.normal,y=oe.r*ai}}const O=Gt%(Y+1),J=Math.min(1,Math.min(O,Y-O)/2)+(1-Math.min(1,Math.min(O,Y-O)/2))*ae((d-c*.2-Qt)/(c*.5)),k=ae((at-Qt)/(c*.6))*J,V=(at-Qt)/(at-st),bt=(Qt-d)/(c*T.z),Ft=Ze>0&&Math.abs(bt)<1?c*1.02*Math.sqrt(1-bt*bt)/Math.hypot(Be/Ze/T.x,Ve/Ze/T.y):0,Tt=1-Math.min(1,Math.min(O,Y-O)/2),wt=en>0?en*(1-.06*Tt*ae((Qt-(ge-c*.2))/(c*.15))):Ft,Vt=en>0&&i.hairTexture!=="curly"?c*.06*ae((at-Qt)/(c*.12)):0,jt=i.hairTexture==="curly"?V:V*V,re=tt?wt+Vt+(Math.max(wt+Vt,X(Be,Ve,at)*1.012*(1-tt*jt))-wt-Vt)*J:wt>0?wt+(Math.max(Ze,wt)-wt)*k:Ze;let zt=re;if(At&&i.hairTexture==="wavy"){let ne=0;for(let ve=0;ve<=6;ve++)ne=Math.max(ne,X(Be,Ve,Qt+(ge+c*.25-Qt)*ve/6));const Ce=ut[Gt]*ae((qt(Be,Ve)-c*.06-Qt)/(c*.1))*(1-ae((ge-c*.45-Qt)/(c*.3)));zt=Math.max(re-(re-Math.min(re,ne*1.012)+c*Yh*.5)*Ce,en>0?Math.max(X(Be,Ve,Qt)*ai,y):Ft)}Ze>0&&([Be,Ve]=[Be*Math.min(re,zt)/Ze,Ve*Math.min(re,zt)/Ze]),Q.setXYZ(Gt,Be,Ve,Qt+cn)}lt.computeVertexNormals();const Wt={geometry:Ra(lt),colour:t.head},dt=Gt=>ae((at-Gt)/(c*(M?.1:.2))),ct=gt?i.hairTexture==="coily"?1.3:1.6:i.hairTexture==="wavy"&&ot?Math.max(.4,Math.min(1.6,24*Math.PI/(21*((at-st)/c)))):.4,Pt=Gt=>new A(0,D(Gt.z),Gt.z),ht=Wt.geometry.getAttribute("position").count/2,Yt=Float32Array.from({length:ht*2},(Gt,kt)=>ut[kt%ht]),xe=M?$_(Wt.geometry,Y,i.hairTexture==="coily"?2:2.5,Pt,Dt,c,.03*n,(Gt,kt)=>ae((ft[kt]-Gt.z)/(c*.45))):br(Wt.geometry,Pt,i.hairTexture,c,ct,void 0,(Gt,kt)=>gt?ae((at-Gt.z)/(c*.12)):At?Yt[kt]:dt(Gt.z),gt||z?at:0,z?{swing:1.3,lobes:2,strands:.3}:void 0);{const Gt=Wt.geometry.getAttribute("position"),kt=Wt.geometry.getAttribute("normal"),Zt=new A,we=new A;for(let me=0;me<Gt.count;me++){Zt.fromBufferAttribute(Gt,me);const De=me%(Gt.count/2)%(Y+1),ge=(1-Math.min(1,Math.min(De,Y-De)/2))*(1-ae((d-c*.2-Zt.z)/(c*.5))),Qt=At?Ut[me%(Gt.count/2)]:void 0,ke=Qt?Math.max(1-ae((ft[De]-Zt.z)/(c*.12)),ge):At?ge:Math.max(1-ae((at-Zt.z)/(c*.35)),ge);if(ke<=0)continue;const cn=(Qt&&ke>ge?Qt.clone():H(Zt)).multiplyScalar(me<Gt.count/2?1:-1);we.fromBufferAttribute(kt,me).lerp(cn,ke).normalize(),kt.setXYZ(me,we.x,we.y,we.z)}}const Pe=Wt.geometry.getAttribute("position"),yn=!R&&t.hairSheen?{shade:Aa(Pe.count,Y+1).map((Gt,kt)=>Gt*.45*ae((at-Pe.getZ(kt))/c)),tone:t.hairSheen}:{},on=Q_(he({...Wt,...yn},"hair"),xe,t.hairSheen),oi=M?.55:z?.7:1;if(xe&&on.shade&&!gt){const Gt=Zt=>{if(At)return Yt[Zt];const we=Zt%ht%(Y+1);return M?ae((ft[we]-Pe.getZ(Zt))/Z(we)):dt(Pe.getZ(Zt))},kt=Zt=>At?Mt[Zt%ht]:Ro[i.hairTexture];on.shade=on.shade.map((Zt,we)=>Zt*oi*Gt(we)+kt(we)*(1-Gt(we)))}s.push(on)}!i.headCovered&&i.hair!=="none"&&s.push(...ix(i,E,d,c,T,F,I));const Bt=d+c*.02,Ct=c*.07,$t=q=>{const at=q.geometry.getAttribute("normal"),ot=new Float32Array(at.count);for(let Dt=0;Dt<at.count;Dt++)ot[Dt]=.9*Math.min(1,Math.max(0,at.getY(Dt)*1.2));return{...q,shade:ot,tone:t.earEdge}};if(i.described&&!i.earsHidden){const q=sx[i.ears];for(const at of[-1,1]){const ot=new A(at*(c*T.x+Ct*.6),-c*.08,Bt);if(s.push($t(he(Qe(new Gn(1,8,6),t.skin,ot,new Ge(.15,0,at*.3),new A(Ct,c*q.depth,c*q.half)),"ear"))),i.ears==="pointed"){const Dt=ot.clone().add(new A(0,-c*.05,c*q.half*.8));s.push($t(he(si(Dt,new A(at*.25,-.35,1).normalize(),c*.06,c*.38,t.skin,4),"ear")))}}}if(t.facialHair&&i.facialHair!=="none"){const q=t.facialHair,at=(z,nt,Y=1)=>(z.rotateX(-Math.PI/2),z.scale(T.x*nt,T.y*nt,T.z*nt*Y),z.translate(0,0,d),z),ot=(z,nt,Y,lt,_t,$=1,tt=16)=>({geometry:at(new Gn(c,tt,6,nt-Y/2,Y,0,z),lt,$),colour:_t}),Dt=(z,nt,Y,lt,_t=1)=>{const $=z-wo/c/2,tt=c*Math.sin($)*1.006,vt=new Hn(tt,tt,wo,16,1,!0,nt-Y/2-Math.PI/2,Y);return vt.translate(0,c*Math.cos($),0),{geometry:at(vt,lt,_t),colour:t.facialHairEdge??t.ink}},R=Math.PI/2,M=4;if(i.facialHair==="beard"||i.facialHair==="stubble"){const z=i.facialHair==="beard",nt=i.beardReach===void 0?.12:.06+.06*Math.min(1,i.beardReach*4),Y=z?1+nt:1.012,lt=z?1+nt:1,_t=z?q:Tr(t.skin,q,cl),$=20,tt=at(Nc(c,$,6,R-M/2,M,()=>0,mr),Y,lt),vt=(D,Q)=>t.facialHairEdge?{shade:Aa(D.getAttribute("position").count,Q),tone:t.facialHairEdge}:{};if(s.push(he({geometry:tt,colour:_t,...z?vt(tt,$+1):{}},z?"beard":"stubble")),z&&g.has("jawline")){const D=wo/c,Q=Nc(c*1.006,20,1,R-M/2,M,Z=>mr(Z)-D,mr);s.push(he({geometry:at(Q,Y,lt),colour:t.facialHairEdge??t.ink},"jawline"))}if(!z){const D=t.facialHairEdge??q,Q=c*.028;for(let Z=0;Z<Lc;Z++)for(let ft=0;ft<Dc;ft++){const ut=Math.sin(Z*12.9898+ft*78.233)*43758.5453,Mt=(Z+.5+.35*Math.sin(ut))/Lc,Ut=R-M/2+M*Mt;if(Math.abs(Ut-R)>1.45)continue;const Wt=mr(Ut)*(ft+.5+.3*Math.cos(ut))/(Dc+.3),dt=new A(-Math.cos(Ut)*Math.sin(Wt),Math.cos(Wt),Math.sin(Ut)*Math.sin(Wt)).multiplyScalar(c*1.02),ct=new $a(Q*1.2,0);ct.setIndex([...Array(ct.getAttribute("position").count).keys()]),ct.translate(dt.x,dt.y,dt.z),s.push(he({geometry:at(ct,1,1),colour:D},"stubble-dot"))}}if(z&&i.beardLength!==void 0&&i.beardLength>10){const D=Math.min((i.beardLength-10)/100,e/3),Q=d-c*Y*lt,Z=new A(0,c*.75,Q+c*.6),ft=new A(0,i.shoulderHalf*.92*.55+c*.3,Q-D),ut=10,Mt=new xi(c*.62,Z.distanceTo(ft),ut,1,!0);Mt.scale(1,1,.4),Mt.applyMatrix4(new fe().compose(Z.clone().add(ft).multiplyScalar(.5),new He().setFromUnitVectors(new A(0,1,0),new A().subVectors(ft,Z).normalize()),new A(1,1,1)));const Ut=Ra(Mt);s.push(he({geometry:Ut,colour:q,...vt(Ut,ut+1)},"beard"))}}else i.facialHair==="goatee"&&(s.push(he(ot(.75,R,.9,1.1,q,1.08),"beard")),g.has("jawline")&&s.push(he(Dt(.75,R,.9,1.1,1.08),"jawline")));if(i.facialHair==="moustache"||i.facialHair==="beard"||i.facialHair==="goatee"){const z=-c*.32,nt=new A(0,_(0,z)+c*.02,d+z);for(const Y of[-1,1]){const lt=new A(Y*c*.28,_(c*.28,-c*.43)+c*.02,d-c*.43);s.push(he(wi(nt,lt,c*.06,q),"moustache"))}}}const Ht=t.faceInk,ee=d+c*.12,le=c*1,ce=c*.2,B=c*.04,Le=q=>c*T.x*Math.sqrt(Math.max(0,1-((q-d)/(c*T.z))**2));for(const q of i.features)if(q==="glasses"||q==="sunglasses"){for(const at of[-1,1]){const ot=new A(at*c*.32,le,ee);q==="glasses"?s.push(Qe(new ei(ce,B,4,12),Ht,ot,new Ge(Math.PI/2,0,0))):s.push(Qe(new Hn(ce*1.1,ce*1.1,B*1.5,12),Ht,ot)),s.push(wi(new A(at*(c*.32+ce),le-B,ee),new A(at*Le(ee),0,ee),B*.8,Ht))}s.push(wi(new A(-c*.32+ce,le,ee),new A(c*.32-ce,le,ee),B*.8,Ht))}else if(q==="eyepatch"){const at=new A(-c*.32,le,ee);s.push(Qe(new Hn(ce*1.15,ce*1.15,B*1.5,12),Ht,at));const ot=new A(at.x/T.x,at.y/T.y,(at.z-d)/T.z).normalize(),Dt=new A(1,0,.5).normalize(),R=new A().crossVectors(ot,Dt).normalize(),M=new ei(1,B*.8/c,3,24);M.applyQuaternion(new He().setFromUnitVectors(new A(0,0,1),R)),M.scale(c*T.x*1.03,c*T.y*1.03,c*T.z*1.03),M.translate(0,0,d),s.push(he({geometry:M,colour:Ht},"strap"))}else if(q==="earrings")for(const at of[-1,1]){const ot=d-c*.35,Dt=new A(at*(Le(ot)+B),0,ot);s.push(he(Qe(new ei(c*.12,B*.9,3,8),Ht,Dt,new Ge(0,Math.PI/2,0)),"earring"))}const se=d+c*.8,Te=t.hair??t.skin;for(const q of i.extras)if(q==="tail")s.push(Re(new A(0,-i.hipHalf*.55,l-.02*e),new A(0,-i.hipHalf*.55-.35*n,r?.03:l-.3*e),i.limbRadius*.6,Te,!1));else if(q==="wings")for(const at of[-1,1])s.push(he(qh(at,n,new A(at*i.shoulderHalf*.45,-.1*n,v-.04*e),Te),"wing"));else if(q==="antlers")for(const at of[-1,1]){const ot=new A(at*c*.45,0,se),Dt=new A(at*c*1.5,-c*.2,se+c*1.4);s.push(he(Re(ot,Dt,c*.07,Es,!1),"antler")),s.push(he(Re(ot.clone().lerp(Dt,.5),new A(at*c*.7,c*.3,se+c*1.2),c*.06,Es,!1),"antler"))}else if(q==="horns")for(const at of[-1,1]){const ot=Qe(new xi(c*.16,c*.7,6),Es,new A(at*c*.45,c*.15,se+c*.2),new Ge(Math.PI/2,0,-at*.35));s.push(he(ot,"horn"))}return s}function Kh(i){const t=new pe,e=new pe,n=(i.plan.kind==="human"?rx(i):P_(i)).map(({geometry:r,colour:o,shade:a,tone:h})=>{r.deleteAttribute("uv"),t.set(o),h&&e.set(h);const l=r.getAttribute("position").count,f=new Float32Array(l*3);for(let d=0;d<l;d++){const c=a&&h?a[d]:0,u=(p,x)=>Math.min(1,Math.max(0,p+(x-p)*c));f.set([u(t.r,e.r),u(t.g,e.g),u(t.b,e.b)],d*3)}return r.setAttribute("color",new Vn(f,3)),r}),s=Xh(n,!1);for(const r of n)r.dispose();if(!s)throw new Error("figure parts could not be merged");return i.posture==="reclining"&&(s.applyMatrix4(new fe().makeRotationX(Math.PI/2)),s.translate(0,i.height/2,.13*(i.height/1.75))),s.computeBoundingBox(),s.computeBoundingSphere(),s}class ox{constructor(){Ni(this,"geometries",new Map);Ni(this,"used",new Set)}geometry(t){const e=JSON.stringify(t);let n=this.geometries.get(e);return n||(n=Kh(t),this.geometries.set(e,n)),this.used.add(e),n}sweep(){for(const[t,e]of this.geometries)this.used.has(t)||(e.dispose(),this.geometries.delete(t));this.used.clear()}get size(){return this.geometries.size}dispose(){for(const t of this.geometries.values())t.dispose();this.geometries.clear(),this.used.clear()}}function Jh(i,t){if(i.userData.headOutline)return i.userData.headOutline;const e=i.getAttribute("position"),n=[];let s=Number.NEGATIVE_INFINITY;for(let a=0;a<e.count;a++){const h=e.getZ(a);h<t||(n.push(e.getX(a),e.getY(a),h),s=Math.max(s,h))}if(n.length===0&&e.count>0)return Jh(i,Number.NEGATIVE_INFINITY);const r=new Set;for(const a of[-60,-40,-20,0,10,20,30,40,50,60,70,80,90]){const h=a*Math.PI/180;for(let l=0;l<24;l++){const f=l/24*2*Math.PI,d=-Math.sin(h)*Math.cos(f),c=-Math.sin(h)*Math.sin(f),u=Math.cos(h);let p=0,x=Number.NEGATIVE_INFINITY;for(let g=0;g<n.length;g+=3){const m=n[g]*d+n[g+1]*c+n[g+2]*u;m>x&&(x=m,p=g)}n.length&&r.add(p)}}const o=[new A(0,0,s),...[...r].map(a=>new A(n[a],n[a+1],n[a+2]))];return i.userData.headOutline=o,o}function ax(i,t,e,n,s,r,o){const a=new _n(o?o.geometry(i):Kh(i),r);o&&(a.userData.keptGeometry=!0);const h=0,l=0;return a.rotation.z=Math.hypot(h,l)>1e-6?Math.atan2(-h,l):Math.PI,a.position.set(t,e,n),a.userData.part="body",a}const Ic={wood:9132587,pine:9132587,lcd:1447450,paper:15722184,foam:7306652,cotton:7306652,plastic:10132126,metal:9411238,steel:9411238},lx=12104358,cx=4906624,hx=6004991,Ca=16486972,ux=3421247,fx=14275786,dx=13157563,px=3811866,mx=1052692,Ss=.08,gx=.3,Uc=1.6,Mi=50,tl=70;function Ur(i){const t=cu(i);return t!==void 0&&Object.hasOwn(Ic,t)?Ic[t]:lx}const _x=i=>`#${i.toString(16).padStart(6,"0")}`;function xx(i,t){const e=i.userData.headBox;if(e&&e.chin===t)return e.box;const n=new Cn,s=i.getAttribute("position"),r=new A;for(let o=0;o<s.count;o++)r.fromBufferAttribute(s,o),r.z>=t&&n.expandByPoint(r);return n.isEmpty()&&s.count>0&&n.setFromBufferAttribute(s),i.userData.headBox={chin:t,box:n},n}const Or=i=>[0,1,2,3,4,5,6,7].map(t=>new A(t&1?i.max.x:i.min.x,t&2?i.max.y:i.min.y,t&4?i.max.z:i.min.z)),vx=.35,Mx=1844787;class Sx{constructor(t){Ni(this,"materials",new Map);this.figures=t}material(t,e={}){const n=`${t}:${e.opacity??1}:${e.emissive??0}`;let s=this.materials.get(n);return s||(s=new Mo({color:t,roughness:.8,metalness:.05,transparent:e.opacity!==void 0,opacity:e.opacity??1,emissive:e.emissive??0,depthWrite:e.opacity===void 0}),this.materials.set(n,s)),s}box(t,e,n){const s=(o,a)=>Math.max(.01,a-o),r=new _n(new Di(s(t.x0,t.x1),s(t.y0,t.y1),s(t.z0,t.z1)),e);return r.position.set((t.x0+t.x1)/2,(t.y0+t.y1)/2,(t.z0+t.z1)/2),r.userData.part=n,r}sphere(t,e,n,s){const r=new _n(new Gn(Math.max(.01,e),24,16),n);return r.position.set(t[0],t[1],t[2]),r.userData.part=s,r}figureMaterial(t=!1){const e=t?"figure-crystal":"figure";let n=this.materials.get(e);return n||(n=t?new Mo({color:16777215,vertexColors:!0,roughness:vx,metalness:0,flatShading:!0,emissive:Mx}):new Mo({color:16777215,vertexColors:!0,roughness:.8,metalness:.05}),this.materials.set(e,n)),n}person(t,e,n,s,r,o,a,h){const l=a!=null&&a.posture?{...typeof t=="object"&&t!==null&&!Array.isArray(t)?t:{},posture:a.posture}:t,f=a?{width:a.dimensions_m[0],depth:a.dimensions_m[1]}:h,d=lu(l,{height:(a==null?void 0:a.figure_height_m)??(a==null?void 0:a.dimensions_m[2])??r-s,base:_x(o),footprint:f}),c=d.plan.kind==="humanoid"&&d.plan.covering==="crystal",u=ax(d,e,n,s,void 0,this.figureMaterial(c),this.figures);if(a){const m=el(a);u.quaternion.premultiply(m);const v=new A(0,0,-a.dimensions_m[2]/2).applyQuaternion(m);u.position.fromArray(a.centre_m).add(v)}u.updateMatrixWorld();const p=d.top-d.headHeight*1.05,x=Jh(u.geometry,p),g=m=>m.clone().applyMatrix4(u.matrixWorld);return{mesh:u,label:x.map(g),head:Or(xx(u.geometry,p)).map(g),animal:d.plan.kind==="animal"}}}function el(i){const[t,e,n,s]=i.body_quaternion;return new He(e,n,s,t).normalize()}const nl=i=>[(i.x0+i.x1)/2,(i.y0+i.y1)/2];function Oc(i,t){var l,f;const{thing:e,bounds:n}=t,s=Ur(e),r=i.material(s),o=n.x1-n.x0,a=n.y1-n.y0,h=n.z1-n.z0;switch(Po(e)){case"table":{const d=Math.min(.05,h*.15),c=Math.min(.06,Math.min(o,a)/5),u=Math.min(o*.08,.05),p=Math.min(a*.08,.05),x=[[n.x0+u,n.y0+p],[n.x1-u-c,n.y0+p],[n.x0+u,n.y1-p-c],[n.x1-u-c,n.y1-p-c]].map(([g,m])=>i.box({x0:g,x1:g+c,y0:m,y1:m+c,z0:n.z0,z1:n.z1-d},r,"leg"));return[i.box({...n,z0:n.z1-d},r,"top"),...x]}case"seat":{const d=i.box({...n,z1:n.z0+h*.45},r,"seat"),c=(l=e.front)==null?void 0:l.axis;if(!c||Math.hypot(c[0],c[1])<1e-6)return[d];const u=Math.hypot(c[0],c[1]),p=c[0]/u,x=c[1]/u,g=Math.min(o,a)*.22,m=(Math.abs(p)*o+Math.abs(x)*a)/2-g/2,v=Math.abs(x)*o+Math.abs(p)*a,b=i.box({x0:-v/2,x1:v/2,y0:-g/2,y1:g/2,z0:n.z0,z1:n.z1},r,"back");return b.rotation.z=Math.atan2(-p,x),b.position.x=(n.x0+n.x1)/2-p*m,b.position.y=(n.y0+n.y1)/2-x*m,[d,b]}case"shelf":{const d=[i.box(n,r,"body")],c=i.material(new pe(s).multiplyScalar(.55).getHex());for(let u=n.z0+.35;u<n.z1-.1;u+=.35)d.push(i.box({x0:n.x0-.008,x1:n.x1+.008,y0:n.y0-.008,y1:n.y1+.008,z0:u,z1:u+.02},c,"shelf"));return d}case"picture":{const d=o<=a,c=d?-.006:o*.12,u=d?a*.12:-.006,p=h*.12;return[i.box(n,i.material(px),"frame"),i.box({x0:n.x0+c,x1:n.x1-c,y0:n.y0+u,y1:n.y1-u,z0:n.z0+p,z1:n.z1-p},r,"picture")]}case"screen":return[i.box(n,i.material(mx,{emissive:((f=e.state)==null?void 0:f.mode)==="running"?659488:0}),"screen")];case"door":{const d=o>=a,[c,u]=nl(n),p=Math.min(n.z0+.95,n.z1-.05),x=d?[n.x0+o*.85,u+(u>0?-1:1)*(a/2+.03),p]:[c+(c>0?-1:1)*(o/2+.03),n.y0+a*.85,p];return[i.box(n,r,"leaf"),i.sphere(x,.03,i.material(12628096),"knob")]}case"flat":return[i.box({...n,z1:n.z0+Math.min(h,.05)},r,"block")];case"box":return $h(i,t)}}function $h(i,t){const e=i.material(Ur(t.thing));return t.footprints.map(n=>n.type==="circle"?i.sphere([n.cx,n.cy,(n.bounds.z0+n.bounds.z1)/2],n.r,e,"sphere"):i.box(n.bounds,e,"box"))}function yx(i,t,e,n){var b;const[s,r,o]=t.size,a=Ss,h=Math.min(2.05,o*.85),l=e==="north"||e==="south",[f,d]=l?[-s/2-a,s/2+a]:[-r/2,r/2],c=(S,C,T,_)=>e==="north"?{x0:S,x1:C,y0:r/2,y1:r/2+a,z0:T,z1:_}:e==="south"?{x0:S,x1:C,y0:-r/2-a,y1:-r/2,z0:T,z1:_}:e==="east"?{x0:s/2,x1:s/2+a,y0:S,y1:C,z0:T,z1:_}:{x0:-s/2-a,x1:-s/2,y0:S,y1:C,z0:T,z1:_},u=new _i;u.name=`${e} wall`,u.userData.wall=e,u.userData.finish=(b=t.finishes)==null?void 0:b.wall;const p=i.material(fx),x=i.material(Ca,{opacity:.55,emissive:6958600}),g=i.material(Ca,{emissive:9059338}),m=t.exits.filter(S=>kc(S,t.size)===e).map(S=>{const C=l?S.at[0]:S.at[1];return{exit:S,a:Math.max(f,C-S.width/2),b:Math.min(d,C+S.width/2)}}).sort((S,C)=>S.a-C.a);let v=f;for(const{exit:S,a:C,b:T}of m){C>v&&u.add(i.box(c(v,C,0,o),p,"wall")),o>h&&u.add(i.box(c(C,T,h,o),p,"lintel"));const _=i.box(c(C,T,0,h),x,"doorway");_.userData.exit=S.name,u.add(_),n.push(_);const E=c(C,T,0,.012),N=.15;e==="north"&&(E.y0-=N),e==="south"&&(E.y1+=N),e==="east"&&(E.x0-=N),e==="west"&&(E.x1+=N);const P=i.box(E,g,"threshold");P.userData.exit=S.name,u.add(P),n.push(P),v=Math.max(v,T)}return d>v&&u.add(i.box(c(v,d,0,o),p,"wall")),u}function Ex({layout:i,placed:t,youId:e,figures:n}){var _,E,N,P;const s=new Sx(n),[r,o]=i.size,a=new _i,h=[];a.add(new pd(16777215,4473936,1.6));const l=new _d(16777215,1.4);l.position.set(r*.4,-o*.6,6),a.add(l);const f=s.box({x0:-r/2,x1:r/2,y0:-o/2,y1:o/2,z0:-.02,z1:0},s.material(ux),"floor");f.userData.finish=(_=i.finishes)==null?void 0:_.floor,a.add(f);const d=s.box({x0:-r/2-Ss,x1:r/2+Ss,y0:-o/2-Ss,y1:o/2+Ss,z0:i.size[2],z1:i.size[2]+.02},s.material(dx),"ceiling");d.userData.finish=(E=i.finishes)==null?void 0:E.ceiling,a.add(d);const c=hu(r),u=[];for(let L=Math.ceil(-r/2/c)*c;L<r/2;L+=c)L>-r/2&&u.push(L,-o/2,.002,L,o/2,.002);for(let L=Math.ceil(-o/2/c)*c;L<o/2;L+=c)L>-o/2&&u.push(-r/2,L,.002,r/2,L,.002);const p=new Fe;p.setAttribute("position",new _e(u,3));const x=new gh(p,new mh({color:10066346,transparent:!0,opacity:.18}));x.userData.part="grid",a.add(x);const g={};for(const L of["north","south","east","west"])g[L]=yx(s,i,L,h),a.add(g[L]);for(const L of i.exits){if(kc(L,i.size))continue;const F=Math.max(L.width,.4)/2,[W,U,G]=L.at,w=s.box({x0:W-F,x1:W+F,y0:U-F,y1:U+F,z0:G,z1:G+.02},s.material(Ca,{opacity:.6}),"hatch");w.userData.exit=L.name,a.add(w),h.push(w)}const m=new Map,v=new Map,b=new Map;for(const L of t){const F=new _i;F.name=L.thing.id,F.userData.thingId=L.thing.id;const[W,U]=nl(L.bounds);if(Rs(L.thing)){F.userData.form="person";const G=L.thing.id===e?hx:cx,{mesh:w,label:I,head:X,animal:H}=s.person(L.thing.appearance,W,U,L.bounds.z0,L.bounds.z1,G,bs(L.thing.pose)?L.thing.pose:void 0,{width:L.bounds.x1-L.bounds.x0,depth:L.bounds.y1-L.bounds.y0});F.add(w),F.userData.animal=H,v.set(L.thing.id,I),b.set(L.thing.id,X)}else{F.userData.form=Po(L.thing);const G=L.thing.pose;if(bs(G)&&(G.box||(N=L.thing.form_boxes)!=null&&N.length)){const[w,I,X]=G.dimensions_m,H={...L,bounds:{x0:-w/2,x1:w/2,y0:-I/2,y1:I/2,z0:-X/2,z1:X/2}};if((P=L.thing.form_boxes)!=null&&P.length){const j=Ur(L.thing),et=s.material(j),mt=s.material(new pe(j).multiplyScalar(.78).getHex());for(const{center:[It,K,st],size:[xt,Rt,gt],basis:At,role:Kt,fitting:yt,colour:qt}of L.thing.form_boxes){const Xt=ou(qt),it=Xt?s.material(au(Xt)):yt?mt:et,pt=s.box({x0:-.5,x1:.5,y0:-.5,y1:.5,z0:-.5,z1:.5},it,(yt==null?void 0:yt.name)??Kt??"form");pt.position.set(It,K,st),At&&pt.matrix.makeBasis(new A(...At[0]),new A(...At[1]),new A(...At[2])),pt.matrix.scale(new A(xt,Rt,gt)).setPosition(pt.position),pt.matrixAutoUpdate=!1,yt&&(pt.userData.fitting=yt.lifetime),Kt&&L.thing.lifetime&&(pt.userData.inspect=[L.thing.id,L.thing.lifetime,Kt]),F.add(pt)}}else if(Po(L.thing)==="box")F.add(s.box(H.bounds,s.material(Ur(L.thing)),"box"));else for(const j of Oc(s,H))F.add(j);F.quaternion.copy(el(G)),F.position.fromArray(G.centre_m)}else if(bs(G))for(const w of $h(s,L))F.add(w);else for(const w of Oc(s,L))F.add(w);v.set(L.thing.id,[new A(W,U,L.bounds.z1)])}a.add(F),m.set(L.thing.id,F)}n==null||n.sweep();const S=new Map,C=new _i;C.name="tiny figure markers";const T=new Ja(Ax,1,40);for(const[L,F]of m){if(F.userData.form!=="person")continue;const W=new _n(T,new ka({color:wx,transparent:!0,opacity:0,depthWrite:!1}));W.name=`marker ${L}`,W.visible=!1,C.add(W),S.set(L,W)}return a.add(C),a.updateMatrixWorld(!0),{root:a,walls:g,ceiling:d,exits:h,things:m,labelPoints:v,heads:b,markers:S}}const Fc=16,bx=10,Tx=11,Ax=.86,wx=15263981;function Rx(i){return Math.min(1,Math.max(0,(Fc-i)/(Fc-bx)))}function Cx(i,t,e,n,s){const r=new Cn,o=new A;for(const[a,h]of i.markers){const l=i.things.get(a);if(h.visible=!1,s!=="dollhouse"||!(l!=null&&l.visible)||(r.setFromObject(l),r.isEmpty()))continue;const f=il(Or(r),t,e,n);if(!f)continue;const d=Rx(f.y1-f.y0);if(d===0)continue;r.getCenter(o);const c=2*t.position.distanceTo(o)*Math.tan(t.fov/2*Math.PI/180)/n,u=Math.hypot(r.max.x-r.min.x,r.max.y-r.min.y)/2;h.scale.setScalar(Math.max(Tx*c,u*1.3)),h.position.set(o.x,o.y,r.min.z+.003),h.material.opacity=d,h.visible=!0}}function Px(i,t,e){var s,r;if(t.length!==e.length)return!1;const n=[];for(let o=0;o<t.length;o++){const a=t[o],h=e[o];if(a.thing===h.thing)continue;const l=a.thing.pose,f=h.thing.pose;if(a.thing.id!==h.thing.id||!i.things.has(h.thing.id)||!bs(l)||!bs(f)||!f.box&&!Rs(h.thing)||l.box!==f.box||l.figure_height_m!==f.figure_height_m||l.posture!==f.posture||l.dimensions_m.some((c,u)=>c!==f.dimensions_m[u])||a.thing.appearance!==h.thing.appearance||a.thing.state!==h.thing.state||a.thing.form_boxes!==h.thing.form_boxes||a.thing.material!==h.thing.material||a.thing.classes!==h.thing.classes||JSON.stringify((s=a.thing.front)==null?void 0:s.axis)!==JSON.stringify((r=h.thing.front)==null?void 0:r.axis))return!1;const d=c=>new fe().compose(new A(...c.centre_m),el(c),new A(1,1,1));n.push({old:a,next:h,delta:d(f).multiply(d(l).invert())})}for(const{next:o,delta:a}of n){const h=i.things.get(o.thing.id);if(!h)return!1;if(h.applyMatrix4(a),Rs(o.thing)){for(const l of i.heads.get(o.thing.id)??[])l.applyMatrix4(a);for(const l of i.labelPoints.get(o.thing.id)??[])l.applyMatrix4(a)}else{const[l,f]=nl(o.bounds);i.labelPoints.set(o.thing.id,[new A(l,f,o.bounds.z1)])}}return i.root.updateMatrixWorld(!0),!0}function il(i,t,e,n){const s=new A,r={x0:Number.POSITIVE_INFINITY,x1:Number.NEGATIVE_INFINITY,y0:Number.POSITIVE_INFINITY,y1:Number.NEGATIVE_INFINITY};for(const o of i){if(s.copy(o).project(t),s.z<-1||s.z>1)return;const a=(s.x+1)/2*e,h=(1-s.y)/2*n;r.x0=Math.min(r.x0,a),r.x1=Math.max(r.x1,a),r.y0=Math.min(r.y0,h),r.y1=Math.max(r.y1,h)}return r}function Lx(i,t,e,n){const s=new A().copy(i[0]).project(t);if(s.z<-1||s.z>1)return;const r=s.x;let o=i.length===1?s.y:Number.NEGATIVE_INFINITY;for(let a=1;a<i.length;a++)s.copy(i[a]).project(t),s.z>=-1&&s.z<=1&&(o=Math.max(o,s.y));return{x:(r+1)/2*e,top:(1-o)/2*n}}function Dx(i,t,e,n){const[s,r,o]=t.size,a={north:e.y>r/2,south:e.y<-r/2,east:e.x>s/2,west:e.x<-s/2},h=Math.min(1,gx/o);for(const l of["north","south","east","west"])i.walls[l].scale.z=n==="dollhouse"&&a[l]?h:1;i.ceiling.visible=n==="eyes"}function ls(i,t=Mi){const[e,n,s]=i.size,r=[0,0,Math.min(s,2)*.25],a=Math.hypot(e,n)/2/Math.sin(t/2*Math.PI/180)*1.05,h=new A(.45,-1,1.05).normalize().multiplyScalar(a);return{position:[r[0]+h.x,r[1]+h.y,r[2]+h.z],target:r}}const ys=.87,Nx=10;function Bc(i,t=Mi){const e=ls(i,t),n=Math.hypot(...e.position.map((s,r)=>s-e.target[r]));return Math.max(60,n*1.5)}function Ix(i,t,e){const n=new A().subVectors(e,t);i.position.add(n),t.add(n)}function Qh(i,t){return i?new A((i.x0+i.x1)/2,(i.y0+i.y1)/2,i.z0+(i.z1-i.z0)*.9):new A(...ls(t).target)}function jh(i,t,e,n=Mi){const s=t.bounds,r=i.things.get(t.thing.id);if(!(r!=null&&r.userData.animal))return{point:Qh(s,e),frame:0,box:Or(new Cn(new A(s.x0,s.y0,s.z0),new A(s.x1,s.y1,s.z1)))};const o=new Cn().setFromObject(r),a=o.getBoundingSphere(new Fs).radius,h=Math.max(a/Math.sin(n/2*Math.PI/180)*1.1,a+tu*2);return{point:o.getCenter(new A),frame:h,box:Or(o)}}const Ux=20,Pa=1.5;function Ox(i,t=Mi){const e=ls(i,t),n=Math.hypot(...e.position.map((s,r)=>s-e.target[r]));return Math.min(.95,(Pa/n)**(1/Ux))}function Fx(i,t){return Math.min(1,Math.abs(i)/(t===1?3:t===2?1:100))}const zc=12,wn=.5,tu=.05,Bx=.15;function zx(i,t,e=Mi){if(i>=wn)return 1;const n=ls(t,e),s=Math.hypot(...n.position.map((r,o)=>r-n.target[o]));return s>Pa?Math.max(1,Math.log(i/s)/Math.log(Pa/s)):1}function Hx(i){return Math.min(wn,(i==null?void 0:i.nearest)??wn)}const Gx=i=>{for(;i&&i.userData.thingId===void 0;)i=i.parent;return i==null?void 0:i.userData.thingId},Hc=(i,t)=>Math.hypot(Math.max(t.x0-i.x,0,i.x-t.x1),Math.max(t.y0-i.y,0,i.y-t.y1));function kx(i,t,e,n,s,r,o=[]){var g,m;const a=new Nr;a.setFromCamera(new St(t.x/e.width*2-1,-(t.y/e.height)*2+1),i);const h=[...n.things.values()].filter(v=>v.visible),l=i.getWorldPosition(new A),f=i instanceof Mn?i.fov:Mi,d=[];for(const v of s){if(((g=n.things.get(v.thing.id))==null?void 0:g.userData.form)!=="person"||!((m=n.things.get(v.thing.id))!=null&&m.visible))continue;const b=jh(n,v,r,f),S=l.distanceTo(b.point),C=o.find(N=>N.id===v.thing.id),T=C?Hc(t,C):Number.POSITIVE_INFINITY;if(T<=zc){d.push({person:v,focus:b,byLabel:!0,off:T,depth:S});continue}const _=il(b.box,i,e.width,e.height);if(!_)continue;const E=Hc(t,_);E<=zc&&d.push({person:v,focus:b,byLabel:!1,off:E,depth:S})}d.sort((v,b)=>Number(b.byLabel)-Number(v.byLabel)||v.off-b.off||v.depth-b.depth);for(const{person:v,focus:b,depth:S}of d){const C=b.point,_=new Nr(l,C.clone().sub(l).normalize(),0,S).intersectObjects(h,!0)[0];if(_&&Gx(_.object)!==v.thing.id)continue;const E=b.frame>0?b.frame:Math.max(wn,Vx(C,l,v.bounds,Bx));return{point:C,nearest:E,pace:zx(E,r,f)}}const c=a.intersectObjects([...h,...Object.values(n.walls)],!0)[0];if(c)return{point:c.point.clone(),nearest:wn,pace:1};const u=a.ray.intersectPlane(new Un(new A(0,0,1),0),new A),[p,x]=r.size;return u&&Math.abs(u.x)<=p/2&&Math.abs(u.y)<=x/2?{point:u,nearest:wn,pace:1}:void 0}function Vx(i,t,e,n){const s=new Cn(new A(e.x0-n,e.y0-n,e.z0),new A(e.x1+n,e.y1+n,e.z1+n)),r=t.clone().sub(i).normalize(),o=i.clone().addScaledVector(r,1e3),a=new Bs(o,r.clone().negate()).intersectBox(s,new A);return a?i.distanceTo(a):0}class Wx{constructor(){Ni(this,"fingers",new Map);Ni(this,"start",null)}down(t,e,n){this.fingers.set(t,{x:e,y:n}),this.start=this.fingers.size===2?this.midpoint():null}move(t,e,n){if(!this.fingers.has(t))return;const s=this.spacing();this.fingers.set(t,{x:e,y:n});const r=this.spacing();if(!(this.fingers.size!==2||!this.start||s===0||r===0||s===r))return{scale:s/r,at:this.start}}up(t){this.fingers.delete(t),this.start=null}get pinching(){return this.start!==null}spacing(){const[t,e]=[...this.fingers.values()];return t&&e?Math.hypot(t.x-e.x,t.y-e.y):0}midpoint(){const[t,e]=[...this.fingers.values()];return{x:(t.x+e.x)/2,y:(t.y+e.y)/2}}}function Xx(i,t,e,n,s=0,r=1){const o=n**r;if(o<1){const a=i.distanceTo(e),h=a>s?Math.max(o,s/a):1;i.sub(e).multiplyScalar(h).add(e),t.sub(e).multiplyScalar(o*o).add(e)}else i.sub(t).multiplyScalar(o).add(t)}function Yx(i,t){if(t==="+"||t==="=")return La(i,1);if(t==="-"||t==="_")return La(i,-1);if(t==="0")return tl}function La(i,t){return Math.min(tl,Math.max(Nx,i*ys**t))}function qx(i,t,e,n){const s=t?[t[0],t[1],t[2]>.8?t[2]:Uc]:n?[(n.x0+n.x1)/2,(n.y0+n.y1)/2,Math.max(n.z1-.1,.8)]:[0,0,Math.min(Uc,i.size[2]*.8)],r=e?Math.hypot(e[0],e[1],e[2]):0,[o,a,h]=e&&r>1e-6?e.map(l=>l/r):[0,1,0];return{position:s,target:[s[0]+o,s[1]+a,s[2]+h]}}function Gc(i){const t=new Set;i.root.traverse(e=>{if(e instanceof _n||e instanceof gh){e.userData.keptGeometry||e.geometry.dispose();const n=e.material;for(const s of Array.isArray(n)?n:[n])t.add(s)}});for(const e of t)e.dispose()}const Zx=3;function Kx(i,t){const e=`${i.className}
${i.textContent}`;let n=t.get(e);if(!n){const s=getComputedStyle(i),r=Number.parseFloat(s.fontSize),o=document.createElement("canvas").getContext("2d");if(!o||!(r>0))return{width:0,height:0};o.font=`${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;const a=Number.parseFloat(s.lineHeight);n={width:o.measureText(i.textContent??"").width,height:a>0?a:r*1.2},t.set(e,n)}return n}function Jx(){const i=document.createElement("canvas");return!!(i.getContext("webgl2")??i.getContext("webgl"))}function Co(i,t){i.camera.position.set(...t.position),i.controls.target.set(...t.target),i.camera.lookAt(i.controls.target)}const jx=({layout:i,placed:t,youId:e,label:n,mode:s,onExit:r,onFitting:o,onInspect:a})=>{var G;const h=Ln(null),l=Ln(null),f=Ln(s),d=Ln(r);d.current=r;const[c]=uu(Jx),u=hl(w=>w.listenerPosition),p=hl(w=>w.listenerOrientation.forward),x=Ln([]);fu(()=>{const w=h.current;if(!w||!c)return;const I=new d_({antialias:!0});I.setPixelRatio(window.devicePixelRatio),I.setClearColor(1315866),I.domElement.setAttribute("aria-hidden","true"),w.appendChild(I.domElement);const X=new C_;X.domElement.className="room-layout-3d-labels",X.domElement.setAttribute("aria-hidden","true"),w.appendChild(X.domElement);const H=new Mn(Mi,4/3,tu,200);H.up.set(0,0,1);const j=new m_(H,I.domElement);j.maxPolarAngle=Math.PI/2-.05,j.minDistance=wn,j.touches.TWO=null;const et=new _f,mt={renderer:I,labels:X,camera:H,controls:j,scene:et,room:null,layout:null,placed:[],figures:new ox,labelObjects:new Map,labelSizes:new Map,personLabels:[],render:()=>{mt.room&&(Dx(mt.room,g.current,H.position,f.current),Cx(mt.room,H,w.clientWidth,w.clientHeight,f.current)),I.render(et,H),m(mt),X.render(et,H)}};l.current=mt,j.addEventListener("change",mt.render);const It=()=>{const xt=w.clientWidth,Rt=w.clientHeight;xt===0||Rt===0||(I.setSize(xt,Rt,!1),I.domElement.style.width="100%",I.domElement.style.height="100%",X.setSize(xt,Rt),H.aspect=xt/Rt,H.updateProjectionMatrix(),mt.render())},K=typeof ResizeObserver>"u"?null:new ResizeObserver(It);K==null||K.observe(w),It();const st=xt=>N.current(xt);return w.addEventListener("wheel",st,{capture:!0,passive:!1}),()=>{w.removeEventListener("wheel",st,{capture:!0}),K==null||K.disconnect(),j.removeEventListener("change",mt.render),j.dispose(),mt.room&&Gc(mt.room),mt.figures.dispose(),I.dispose(),I.domElement.remove(),X.domElement.remove(),l.current=null}},[c]);const g=Ln(i);g.current=i;function m(w){var xt,Rt,gt,At,Kt;const I=w.labels.domElement.clientWidth||w.renderer.domElement.clientWidth,X=w.labels.domElement.clientHeight||w.renderer.domElement.clientHeight,H=[],j=new Map,et=new A;for(const{id:yt,text:qt}of x.current){const Xt=(xt=w.room)==null?void 0:xt.labelPoints.get(yt),it=w.labelObjects.get(yt);if(!Xt||!it||(it.visible=!1,!((Rt=it.parent)!=null&&Rt.visible)))continue;const pt=Lx(Xt,w.camera,I,X);if(!pt)continue;it.getWorldPosition(et).project(w.camera),j.set(yt,[(et.x+1)/2*I,(1-et.y)/2*X]);const Et=Kx(it.element,w.labelSizes);Et.width!==0&&H.push({id:yt,text:qt,x:pt.x,top:pt.top,...Et})}const mt=[];for(const[yt,qt]of((gt=w.room)==null?void 0:gt.heads)??[]){if(!((Kt=(At=w.room)==null?void 0:At.things.get(yt))!=null&&Kt.visible))continue;const Xt=il(qt,w.camera,I,X);Xt&&mt.push({id:yt,...Xt})}const It=4,K=du(H,Zx,{x0:It,x1:I-It,y0:It,y1:X-It},mt),st=new Set(x.current.filter(yt=>yt.person).map(yt=>yt.id));w.personLabels=[];for(const yt of K){const qt=w.labelObjects.get(yt.id),Xt=j.get(yt.id);if(!qt||!Xt)continue;qt.visible=!0,qt.element.style.translate=`${yt.x-Xt[0]}px ${yt.y-Xt[1]}px`;const it=H.find(pt=>pt.id===yt.id);it&&st.has(yt.id)&&w.personLabels.push({id:yt.id,x0:yt.x-it.width/2,x1:yt.x+it.width/2,y0:yt.y-it.height/2,y1:yt.y+it.height/2})}}kr(()=>{var mt,It,K;const w=l.current;if(!w)return;if(s==="dollhouse"&&(w.controls.maxDistance=Bc(i)),w.room&&((mt=w.layout)==null?void 0:mt.size)===i.size&&w.layout.exits===i.exits&&w.layout.finishes===i.finishes&&Px(w.room,w.placed,t)){w.layout=i,w.placed=t;for(const[xt,Rt]of w.labelObjects){const gt=(It=w.room.labelPoints.get(xt))==null?void 0:It[0];gt&&Rt.parent&&Rt.position.copy(Rt.parent.worldToLocal(gt.clone()))}const st=w.room.things.get(e);st&&(st.visible=s!=="eyes"),w.render();return}const I=w.room;I&&w.scene.remove(I.root);for(const st of w.labelObjects.values())st.removeFromParent();w.labelObjects.clear();const X=Ex({layout:i,placed:t,youId:e,figures:w.figures});w.room=X,w.layout=i,w.placed=t,w.scene.add(X.root);const H=X.things.get(e);H&&(H.visible=s!=="eyes");const j=pu(t,e),et=[...j.filter(st=>Rs(st.thing)).map(st=>({id:st.thing.id,text:Vr(ul(st.thing,e)),person:!0})),...j.filter(st=>!Rs(st.thing)).map(({thing:st})=>{var At;const xt=((At=st.form_boxes)==null?void 0:At.flatMap(({fitting:Kt})=>Kt!=null&&Kt.opened?Kt.contents:[]))??[],Rt=Vr(ul(st,e)),gt=xt.length?`${Rt} · ${Vr(xt[0].name)}${xt.length>1?` (+${xt.length-1})`:""}`:Rt;return{id:st.id,text:gt,person:!1}})];x.current=et;for(const{id:st,text:xt,person:Rt}of et){const gt=X.labelPoints.get(st),At=X.things.get(st);if(!gt||!At)continue;const Kt=document.createElement("div");Kt.className=st===e?"rl3d-label rl3d-label-you":Rt?"rl3d-label rl3d-label-person":"rl3d-label",Kt.textContent=xt,Kt.style.display="none",w.labels.domElement.appendChild(Kt);const yt=(K=X.markers.get(st))==null?void 0:K.material,qt=yt?getComputedStyle(Kt).color:"";yt&&qt&&yt.color.setStyle(qt);const Xt=new R_(Kt);At.updateWorldMatrix(!0,!1),Xt.position.copy(At.worldToLocal(gt[0].clone())),Xt.visible=!1,At.add(Xt),w.labelObjects.set(st,Xt)}w.render(),I&&Gc(I)},[i,t,e,s]);const v=(G=t.find(w=>w.thing.id===e))==null?void 0:G.bounds;kr(()=>{const w=l.current;f.current=s,w&&(w.controls.enabled=s==="dollhouse",w.camera.fov=s==="eyes"?tl:Mi,w.camera.updateProjectionMatrix(),_.current=null,s==="dollhouse"&&(w.controls.maxDistance=Bc(i),Co(w,ls(i)),w.controls.update(),w.render()))},[s,i.num]),kr(()=>{const w=l.current;if(!w||s!=="eyes")return;const I=u?fl(u):null,X=p?fl(p):null;Co(w,qx(i,I,X,v)),w.render()},[s,i,u,p,v==null?void 0:v.x0,v==null?void 0:v.y0,v==null?void 0:v.z1]);const b=Ln(null),S=w=>{F(w),b.current=w.isPrimary&&w.button===0?{id:w.pointerId,x:w.clientX,y:w.clientY}:null},C=w=>{F(w);const I=b.current;b.current=null;const X=l.current;if(!(X!=null&&X.room)||!I||I.id!==w.pointerId||Math.hypot(w.clientX-I.x,w.clientY-I.y)>4)return;const H=X.renderer.domElement.getBoundingClientRect();if(H.width===0||H.height===0)return;const j=new St((w.clientX-H.left)/H.width*2-1,-((w.clientY-H.top)/H.height)*2+1),et=new Nr;et.setFromCamera(j,X.camera);const mt=X.room,It=i.things.some(st=>{var xt;return(xt=st.form_boxes)==null?void 0:xt.length})?[...Array.from(mt.things.values()).filter(st=>st.visible),...Object.values(mt.walls),...mt.exits.filter(st=>st.parent===mt.root)]:mt.exits,K=et.intersectObjects(It,!0)[0];if(K!=null&&K.object.userData.fitting)o(K.object.userData.fitting);else if(K!=null&&K.object.userData.inspect){const[st,xt,Rt]=K.object.userData.inspect;a==null||a(st,xt,Rt)}else K!=null&&K.object.userData.exit&&d.current(K.object.userData.exit)},T=w=>{const I=l.current,X=I?Yx(I.camera.fov,w):void 0;return!I||X===void 0?!1:(I.camera.fov=X,I.camera.updateProjectionMatrix(),I.render(),!0)},_=Ln(null),E=w=>{const I=l.current;if(!I)return;w.preventDefault(),w.stopPropagation();const X=w.deltaMode,H=w.deltaY;if(H===0)return;const j=Fx(H,X)*(H<0?1:-1);if(s==="eyes"){I.camera.fov=La(I.camera.fov,j),I.camera.updateProjectionMatrix(),I.render();return}P(I,w.clientX,w.clientY,Ox(i)**j)},N=Ln(E);N.current=E;const P=(w,I,X,H)=>{var mt;const j=_.current;if(!j||Math.hypot(I-j.x,X-j.y)>4){const It=w.renderer.domElement.getBoundingClientRect(),K=w.room?kx(w.camera,{x:I-It.left,y:X-It.top},It,w.room,t,i,w.personLabels):void 0;_.current={x:I,y:X,pick:K}}const et=(mt=_.current)==null?void 0:mt.pick;Xx(w.camera.position,w.controls.target,(et==null?void 0:et.point)??w.controls.target.clone(),H,(et==null?void 0:et.nearest)??wn,et==null?void 0:et.pace),w.controls.minDistance=Hx(et),w.controls.update(),w.render()},L=Ln(new Wx),F=w=>{const I=l.current;if(!(!I||w.pointerType!=="touch"||s!=="dollhouse"))if(w.type==="pointerdown")L.current.down(w.pointerId,w.clientX,w.clientY);else if(w.type==="pointerup"||w.type==="pointercancel")L.current.up(w.pointerId);else{const X=L.current.move(w.pointerId,w.clientX,w.clientY);X&&P(I,X.at.x,X.at.y,X.scale)}},W=(w,I)=>{_.current=null;const X=t.find(j=>j.thing.id===e),H=X&&w.room?jh(w.room,X,i):void 0;Ix(w.camera,w.controls.target,H?H.point:Qh(v,i)),w.controls.minDistance=H&&H.frame>0?Math.min(wn,H.frame):wn,w.controls.dollyIn(I)},U=w=>{const I=l.current;if(!I||w.altKey||w.ctrlKey||w.metaKey)return;if(s==="eyes"){T(w.key)&&w.preventDefault();return}const X=Math.PI/18,j={ArrowLeft:()=>I.controls.rotateLeft(-X),ArrowRight:()=>I.controls.rotateLeft(X),ArrowUp:()=>I.controls.rotateUp(X/2),ArrowDown:()=>I.controls.rotateUp(-X/2),"+":()=>W(I,ys),"=":()=>W(I,ys),"-":()=>W(I,1/ys),_:()=>W(I,1/ys),0:()=>{_.current=null,I.controls.minDistance=wn,Co(I,ls(i)),I.controls.update()}}[w.key];j&&(w.preventDefault(),j(),I.render())};return c?dl("div",{ref:h,className:"room-layout-3d",role:"img","aria-label":n,tabIndex:0,"data-mode":s,onPointerDown:S,onPointerUp:C,onPointerMove:F,onPointerCancel:w=>{b.current=null,F(w)},onKeyDown:U}):dl("p",{role:"status",children:"This browser cannot draw 3D (it offers no WebGL). The Plan view and the lists below show the room."})};export{jx as default};
