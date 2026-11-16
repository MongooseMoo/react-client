var Lh=Object.defineProperty;var Dh=(i,t,e)=>t in i?Lh(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var si=(i,t,e)=>Dh(i,typeof t!="symbol"?t+"":t,e);import{bn as Uo,bo as Oo,bp as pr,aw as Ki,ai as ts,an as xc,at as $r,bq as Nh,br as Ih,ax as Uh,A as an,d as Oh,aA as Fo,_ as Fh,bs as Bh,h as mr,aj as zh,am as Bo,al as Hh,bt as zo,u as Ho}from"./index-CZhCKyF4.js";/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ja="187",Ei={ROTATE:0,DOLLY:1,PAN:2},Si={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Gh=0,Go=1,kh=2,Ws=1,Vh=2,Wi=3,jn=0,Ve=1,An=2,bi=0,Ji=1,ko=2,Vo=3,Wo=4,Wh=5,Mi=100,Xh=101,Yh=102,qh=103,Zh=104,Kh=200,Jh=201,$h=202,Qh=203,vc=204,Mc=205,jh=206,tu=207,eu=208,nu=209,iu=210,su=211,ru=212,au=213,ou=214,Qr=0,jr=1,ta=2,es=3,ea=4,na=5,ia=6,sa=7,Sc=0,lu=1,cu=2,Rn=0,yc=1,Ec=2,bc=3,Tc=4,Ac=5,wc=6,Rc=7,Cc=300,wi=301,ns=302,gr=303,_r=304,ra=1e3,wn=1001,aa=1002,Le=1003,hu=1004,gs=1005,ke=1006,xr=1007,Bn=1008,qe=1009,Pc=1010,Lc=1011,is=1012,$a=1013,_n=1014,dn=1015,xn=1016,Qa=1017,ja=1018,Ri=1020,Dc=35902,Nc=35899,Ic=1021,Uc=1022,pn=1023,Hn=1026,zn=1027,Oc=1028,to=1029,ti=1030,eo=1031,no=1033,Xs=33776,Ys=33777,qs=33778,Zs=33779,oa=35840,la=35841,ca=35842,ha=35843,ua=36196,fa=37492,da=37496,pa=37488,ma=37489,js=37490,ga=37491,_a=37808,xa=37809,va=37810,Ma=37811,Sa=37812,ya=37813,Ea=37814,ba=37815,Ta=37816,Aa=37817,wa=37818,Ra=37819,Ca=37820,Pa=37821,La=36492,Da=36494,Na=36495,Ia=36283,Ua=36284,tr=36285,Oa=36286,uu=3200,Fa=0,fu=1,Fn="",Ke="srgb",er="srgb-linear",nr="linear",ue="srgb",vr=7680,du=519,pu=512,mu=513,gu=514,Fc=515,_u=516,xu=517,Bc=518,zc=519,vu=35044,Xo="300 es",sn=2e3,ss=2001;function Mu(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function ir(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Su(){const i=ir("canvas");return i.style.display="block",i}const Yo={};function qo(...i){const t="THREE."+i.shift();console.log(t,...i)}function Hc(i){const t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){const e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Ht(...i){i=Hc(i);const t="THREE."+i.shift();{const e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function ae(...i){i=Hc(i);const t="THREE."+i.shift();{const e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Ks(...i){const t=i.join(" ");t in Yo||(Yo[t]=!0,Ht(...i))}function yu(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}const Eu={[Qr]:Qr,[ta]:ia,[ea]:ea,[es]:na,[jr]:jr,[ia]:ta,[sa]:sa,[na]:es};class Gn{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){const n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){const n=this._listeners;if(n===void 0)return;const s=n[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){const e=this._listeners;if(e===void 0)return;const n=e[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}const Ue=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Js=Math.PI/180,Ba=180/Math.PI;function Ni(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ue[i&255]+Ue[i>>8&255]+Ue[i>>16&255]+Ue[i>>24&255]+"-"+Ue[t&255]+Ue[t>>8&255]+"-"+Ue[t>>16&15|64]+Ue[t>>24&255]+"-"+Ue[e&63|128]+Ue[e>>8&255]+"-"+Ue[e>>16&255]+Ue[e>>24&255]+Ue[n&255]+Ue[n>>8&255]+Ue[n>>16&255]+Ue[n>>24&255]).toLowerCase()}function Jt(i,t,e){return Math.max(t,Math.min(e,i))}function bu(i,t){return(i%t+t)%t}function Mr(i,t,e){return(1-e)*i+e*t}function Tu(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function io(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Au(i,t){if(t.constructor===Float32Array)return i;const e=io(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/e,-1)}function wu(i,t){if(t.constructor===Float32Array)return i;const e=io(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*e)}const Ru={DEG2RAD:Js},Mo=class Mo{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Jt(this.x,t.x,e.x),this.y=Jt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Jt(this.x,t,e),this.y=Jt(this.y,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Jt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Mo.prototype.isVector2=!0;let ht=Mo;class He{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],f=n[s+3],h=r[a+0],d=r[a+1],p=r[a+2],x=r[a+3];if(f!==x||l!==h||c!==d||u!==p){let m=l*h+c*d+u*p+f*x;m<0&&(h=-h,d=-d,p=-p,x=-x,m=-m);let g=1-o;if(m<.9995){const v=Math.acos(m),A=Math.sin(v);g=Math.sin(g*v)/A,o=Math.sin(o*v)/A,l=l*g+h*o,c=c*g+d*o,u=u*g+p*o,f=f*g+x*o}else{l=l*g+h*o,c=c*g+d*o,u=u*g+p*o,f=f*g+x*o;const v=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=v,c*=v,u*=v,f*=v}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],f=r[a],h=r[a+1],d=r[a+2],p=r[a+3];return t[e]=o*p+u*f+l*d-c*h,t[e+1]=l*p+u*h+c*f-o*d,t[e+2]=c*p+u*d+o*h-l*f,t[e+3]=u*p-o*f-l*h-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),f=o(r/2),h=l(n/2),d=l(s/2),p=l(r/2);switch(a){case"XYZ":this._x=h*u*f+c*d*p,this._y=c*d*f-h*u*p,this._z=c*u*p+h*d*f,this._w=c*u*f-h*d*p;break;case"YXZ":this._x=h*u*f+c*d*p,this._y=c*d*f-h*u*p,this._z=c*u*p-h*d*f,this._w=c*u*f+h*d*p;break;case"ZXY":this._x=h*u*f-c*d*p,this._y=c*d*f+h*u*p,this._z=c*u*p+h*d*f,this._w=c*u*f-h*d*p;break;case"ZYX":this._x=h*u*f-c*d*p,this._y=c*d*f+h*u*p,this._z=c*u*p-h*d*f,this._w=c*u*f+h*d*p;break;case"YZX":this._x=h*u*f+c*d*p,this._y=c*d*f+h*u*p,this._z=c*u*p-h*d*f,this._w=c*u*f-h*d*p;break;case"XZY":this._x=h*u*f-c*d*p,this._y=c*d*f-h*u*p,this._z=c*u*p+h*d*f,this._w=c*u*f+h*d*p;break;default:Ht("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],u=e[6],f=e[10],h=n+o+f;if(h>0){const d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(n>o&&n>f){const d=2*Math.sqrt(1+n-o-f);this._w=(u-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>f){const d=2*Math.sqrt(1+o-n-f);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+u)/d}else{const d=2*Math.sqrt(1+f-n-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Jt(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,e=Math.sin(e*c)/u,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const So=class So{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Zo.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Zo.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),u=2*(o*e-r*s),f=2*(r*n-a*e);return this.x=e+l*c+a*f-o*u,this.y=n+l*u+o*c-r*f,this.z=s+l*f+r*u-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Jt(this.x,t.x,e.x),this.y=Jt(this.y,t.y,e.y),this.z=Jt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Jt(this.x,t,e),this.y=Jt(this.y,t,e),this.z=Jt(this.z,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Sr.copy(this).projectOnVector(t),this.sub(Sr)}reflect(t){return this.sub(Sr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Jt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};So.prototype.isVector3=!0;let w=So;const Sr=new w,Zo=new He,yo=class yo{constructor(t,e,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){const u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],f=n[7],h=n[2],d=n[5],p=n[8],x=s[0],m=s[3],g=s[6],v=s[1],A=s[4],M=s[7],R=s[2],y=s[5],_=s[8];return r[0]=a*x+o*v+l*R,r[3]=a*m+o*A+l*y,r[6]=a*g+o*M+l*_,r[1]=c*x+u*v+f*R,r[4]=c*m+u*A+f*y,r[7]=c*g+u*M+f*_,r[2]=h*x+d*v+p*R,r[5]=h*m+d*A+p*y,r[8]=h*g+d*M+p*_,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8];return e*a*u-e*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],f=u*a-o*c,h=o*l-u*r,d=c*r-a*l,p=e*f+n*h+s*d;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/p;return t[0]=f*x,t[1]=(s*c-u*n)*x,t[2]=(o*n-s*a)*x,t[3]=h*x,t[4]=(u*e-s*l)*x,t[5]=(s*r-o*e)*x,t[6]=d*x,t[7]=(n*l-c*e)*x,t[8]=(a*e-n*r)*x,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Ks("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(yr.makeScale(t,e)),this}rotate(t){return Ks("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(yr.makeRotation(-t)),this}translate(t,e){return Ks("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(yr.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};yo.prototype.isMatrix3=!0;let Vt=yo;const yr=new Vt,Ko=new Vt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Jo=new Vt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Cu(){const i={enabled:!0,workingColorSpace:er,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ue&&(s.r=Cn(s.r),s.g=Cn(s.g),s.b=Cn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ue&&(s.r=Ti(s.r),s.g=Ti(s.g),s.b=Ti(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Fn?nr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[er]:{primaries:t,whitePoint:n,transfer:nr,toXYZ:Ko,fromXYZ:Jo,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Ke},outputColorSpaceConfig:{drawingBufferColorSpace:Ke}},[Ke]:{primaries:t,whitePoint:n,transfer:ue,toXYZ:Ko,fromXYZ:Jo,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Ke}}}),i}const ie=Cu();function Cn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ti(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let ri;class Pu{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{ri===void 0&&(ri=ir("canvas")),ri.width=t.width,ri.height=t.height;const s=ri.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=ri}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=ir("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Cn(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Cn(e[n]/255)*255):e[n]=Cn(e[n]);return{data:e,width:t.width,height:t.height}}else return Ht("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Lu=0;class so{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Lu++}),this.uuid=Ni(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width||0,e.height||0,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Er(s[a].image)):r.push(Er(s[a]))}else r=Er(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function Er(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Pu.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Ht("Texture: Unable to serialize Texture."),{})}let Du=0;const br=new w;class ze extends Gn{constructor(t=ze.DEFAULT_IMAGE,e=ze.DEFAULT_MAPPING,n=wn,s=wn,r=ke,a=Bn,o=pn,l=qe,c=ze.DEFAULT_ANISOTROPY,u=Fn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Du++}),this.uuid=Ni(),this.name="",this.source=new so(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ht(0,0),this.repeat=new ht(1,1),this.center=new ht(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Vt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(br).x}get height(){return this.source.getSize(br).y}get depth(){return this.source.getSize(br).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const e in t){const n=t[e];if(n===void 0){Ht(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){Ht(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Cc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ra:t.x=t.x-Math.floor(t.x);break;case wn:t.x=t.x<0?0:1;break;case aa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ra:t.y=t.y-Math.floor(t.y);break;case wn:t.y=t.y<0?0:1;break;case aa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}ze.DEFAULT_IMAGE=null;ze.DEFAULT_MAPPING=Cc;ze.DEFAULT_ANISOTROPY=1;const Eo=class Eo{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],u=l[4],f=l[8],h=l[1],d=l[5],p=l[9],x=l[2],m=l[6],g=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-x)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+x)<.1&&Math.abs(p+m)<.1&&Math.abs(c+d+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const A=(c+1)/2,M=(d+1)/2,R=(g+1)/2,y=(u+h)/4,_=(f+x)/4,E=(p+m)/4;return A>M&&A>R?A<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(A),s=y/n,r=_/n):M>R?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=y/s,r=E/s):R<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),n=_/r,s=E/r),this.set(n,s,r,e),this}let v=Math.sqrt((m-p)*(m-p)+(f-x)*(f-x)+(h-u)*(h-u));return Math.abs(v)<.001&&(v=1),this.x=(m-p)/v,this.y=(f-x)/v,this.z=(h-u)/v,this.w=Math.acos((c+d+g-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Jt(this.x,t.x,e.x),this.y=Jt(this.y,t.y,e.y),this.z=Jt(this.z,t.z,e.z),this.w=Jt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Jt(this.x,t,e),this.y=Jt(this.y,t,e),this.z=Jt(this.z,t,e),this.w=Jt(this.w,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Eo.prototype.isVector4=!0;let ge=Eo;class Nu extends Gn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ke,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new ge(0,0,t,e),this.scissorTest=!1,this.viewport=new ge(0,0,t,e),this.textures=[];const s=n.count;for(let r=0;r<s;r++)this.textures[r]=new ze({width:t,height:e,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){const e={minFilter:ke,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.mipmapsAutoUpdate!==void 0&&(e.mipmapsAutoUpdate=t.mipmapsAutoUpdate),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;const s=Object.assign({},t.textures[e].image);this.textures[e].source=new so(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){const e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class mn extends Nu{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Gc extends ze{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Le,this.minFilter=Le,this.wrapR=wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Iu extends ze{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Le,this.minFilter=Le,this.wrapR=wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}const or=class or{constructor(t,e,n,s,r,a,o,l,c,u,f,h,d,p,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,u,f,h,d,p,x,m)}set(t,e,n,s,r,a,o,l,c,u,f,h,d,p,x,m){const g=this.elements;return g[0]=t,g[4]=e,g[8]=n,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=u,g[10]=f,g[14]=h,g[3]=d,g[7]=p,g[11]=x,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new or().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const e=this.elements,n=t.elements,s=1/ai.setFromMatrixColumn(t,0).length(),r=1/ai.setFromMatrixColumn(t,1).length(),a=1/ai.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){const h=a*u,d=a*f,p=o*u,x=o*f;e[0]=l*u,e[4]=-l*f,e[8]=c,e[1]=d+p*c,e[5]=h-x*c,e[9]=-o*l,e[2]=x-h*c,e[6]=p+d*c,e[10]=a*l}else if(t.order==="YXZ"){const h=l*u,d=l*f,p=c*u,x=c*f;e[0]=h+x*o,e[4]=p*o-d,e[8]=a*c,e[1]=a*f,e[5]=a*u,e[9]=-o,e[2]=d*o-p,e[6]=x+h*o,e[10]=a*l}else if(t.order==="ZXY"){const h=l*u,d=l*f,p=c*u,x=c*f;e[0]=h-x*o,e[4]=-a*f,e[8]=p+d*o,e[1]=d+p*o,e[5]=a*u,e[9]=x-h*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const h=a*u,d=a*f,p=o*u,x=o*f;e[0]=l*u,e[4]=p*c-d,e[8]=h*c+x,e[1]=l*f,e[5]=x*c+h,e[9]=d*c-p,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const h=a*l,d=a*c,p=o*l,x=o*c;e[0]=l*u,e[4]=x-h*f,e[8]=p*f+d,e[1]=f,e[5]=a*u,e[9]=-o*u,e[2]=-c*u,e[6]=d*f+p,e[10]=h-x*f}else if(t.order==="XZY"){const h=a*l,d=a*c,p=o*l,x=o*c;e[0]=l*u,e[4]=-f,e[8]=c*u,e[1]=h*f+x,e[5]=a*u,e[9]=d*f-p,e[2]=p*f-d,e[6]=o*u,e[10]=x*f+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Uu,t,Ou)}lookAt(t,e,n){const s=this.elements;return We.subVectors(t,e),We.lengthSq()===0&&(We.z=1),We.normalize(),Dn.crossVectors(n,We),Dn.lengthSq()===0&&(Math.abs(n.z)===1?We.x+=1e-4:We.z+=1e-4,We.normalize(),Dn.crossVectors(n,We)),Dn.normalize(),_s.crossVectors(We,Dn),s[0]=Dn.x,s[4]=_s.x,s[8]=We.x,s[1]=Dn.y,s[5]=_s.y,s[9]=We.y,s[2]=Dn.z,s[6]=_s.z,s[10]=We.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],f=n[5],h=n[9],d=n[13],p=n[2],x=n[6],m=n[10],g=n[14],v=n[3],A=n[7],M=n[11],R=n[15],y=s[0],_=s[4],E=s[8],L=s[12],P=s[1],D=s[5],H=s[9],X=s[13],T=s[2],I=s[6],B=s[10],z=s[14],J=s[3],G=s[7],q=s[11],$=s[15];return r[0]=a*y+o*P+l*T+c*J,r[4]=a*_+o*D+l*I+c*G,r[8]=a*E+o*H+l*B+c*q,r[12]=a*L+o*X+l*z+c*$,r[1]=u*y+f*P+h*T+d*J,r[5]=u*_+f*D+h*I+d*G,r[9]=u*E+f*H+h*B+d*q,r[13]=u*L+f*X+h*z+d*$,r[2]=p*y+x*P+m*T+g*J,r[6]=p*_+x*D+m*I+g*G,r[10]=p*E+x*H+m*B+g*q,r[14]=p*L+x*X+m*z+g*$,r[3]=v*y+A*P+M*T+R*J,r[7]=v*_+A*D+M*I+R*G,r[11]=v*E+A*H+M*B+R*q,r[15]=v*L+A*X+M*z+R*$,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],u=t[2],f=t[6],h=t[10],d=t[14],p=t[3],x=t[7],m=t[11],g=t[15],v=l*d-c*h,A=o*d-c*f,M=o*h-l*f,R=a*d-c*u,y=a*h-l*u,_=a*f-o*u;return e*(x*v-m*A+g*M)-n*(p*v-m*R+g*y)+s*(p*A-x*R+g*_)-r*(p*M-x*y+m*_)}determinantAffine(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],u=t[10];return e*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],f=t[9],h=t[10],d=t[11],p=t[12],x=t[13],m=t[14],g=t[15],v=e*o-n*a,A=e*l-s*a,M=e*c-r*a,R=n*l-s*o,y=n*c-r*o,_=s*c-r*l,E=u*x-f*p,L=u*m-h*p,P=u*g-d*p,D=f*m-h*x,H=f*g-d*x,X=h*g-d*m,T=v*X-A*H+M*D+R*P-y*L+_*E;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const I=1/T;return t[0]=(o*X-l*H+c*D)*I,t[1]=(s*H-n*X-r*D)*I,t[2]=(x*_-m*y+g*R)*I,t[3]=(h*y-f*_-d*R)*I,t[4]=(l*P-a*X-c*L)*I,t[5]=(e*X-s*P+r*L)*I,t[6]=(m*M-p*_-g*A)*I,t[7]=(u*_-h*M+d*A)*I,t[8]=(a*H-o*P+c*E)*I,t[9]=(n*P-e*H-r*E)*I,t[10]=(p*y-x*M+g*v)*I,t[11]=(f*M-u*y-d*v)*I,t[12]=(o*L-a*D-l*E)*I,t[13]=(e*D-n*L+s*E)*I,t[14]=(x*A-p*R-m*v)*I,t[15]=(u*R-f*A+h*v)*I,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,u=a+a,f=o+o,h=r*c,d=r*u,p=r*f,x=a*u,m=a*f,g=o*f,v=l*c,A=l*u,M=l*f,R=n.x,y=n.y,_=n.z;return s[0]=(1-(x+g))*R,s[1]=(d+M)*R,s[2]=(p-A)*R,s[3]=0,s[4]=(d-M)*y,s[5]=(1-(h+g))*y,s[6]=(m+v)*y,s[7]=0,s[8]=(p+A)*_,s[9]=(m-v)*_,s[10]=(1-(h+x))*_,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=ai.set(s[0],s[1],s[2]).length();const o=ai.set(s[4],s[5],s[6]).length(),l=ai.set(s[8],s[9],s[10]).length();r<0&&(a=-a),$e.copy(this);const c=1/a,u=1/o,f=1/l;return $e.elements[0]*=c,$e.elements[1]*=c,$e.elements[2]*=c,$e.elements[4]*=u,$e.elements[5]*=u,$e.elements[6]*=u,$e.elements[8]*=f,$e.elements[9]*=f,$e.elements[10]*=f,e.setFromRotationMatrix($e),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,s,r,a,o=sn,l=!1){const c=this.elements,u=2*r/(e-t),f=2*r/(n-s),h=(e+t)/(e-t),d=(n+s)/(n-s);let p,x;if(l)p=r/(a-r),x=a*r/(a-r);else if(o===sn)p=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===ss)p=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=sn,l=!1){const c=this.elements,u=2/(e-t),f=2/(n-s),h=-(e+t)/(e-t),d=-(n+s)/(n-s);let p,x;if(l)p=1/(a-r),x=a/(a-r);else if(o===sn)p=-2/(a-r),x=-(a+r)/(a-r);else if(o===ss)p=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=p,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};or.prototype.isMatrix4=!0;let se=or;const ai=new w,$e=new se,Uu=new w(0,0,0),Ou=new w(1,1,1),Dn=new w,_s=new w,We=new w,$o=new se,Qo=new He;class Pe{constructor(t=0,e=0,n=0,s=Pe.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],f=s[2],h=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(Jt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Jt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Jt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Jt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Jt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Jt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:Ht("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return $o.makeRotationFromQuaternion(t),this.setFromRotationMatrix($o,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Qo.setFromEuler(this),this.setFromQuaternion(Qo,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Pe.DEFAULT_ORDER="XYZ";class ro{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Fu=0;const jo=new w,oi=new He,Sn=new se,xs=new w,Fi=new w,Bu=new w,zu=new He,tl=new w(1,0,0),el=new w(0,1,0),nl=new w(0,0,1),il={type:"added"},Hu={type:"removed"},li={type:"childadded",child:null},Tr={type:"childremoved",child:null};class Ee extends Gn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Fu++}),this.uuid=Ni(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ee.DEFAULT_UP.clone();const t=new w,e=new Pe,n=new He,s=new w(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new se},normalMatrix:{value:new Vt}}),this.matrix=new se,this.matrixWorld=new se,this.matrixAutoUpdate=Ee.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ee.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ro,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return oi.setFromAxisAngle(t,e),this.quaternion.multiply(oi),this}rotateOnWorldAxis(t,e){return oi.setFromAxisAngle(t,e),this.quaternion.premultiply(oi),this}rotateX(t){return this.rotateOnAxis(tl,t)}rotateY(t){return this.rotateOnAxis(el,t)}rotateZ(t){return this.rotateOnAxis(nl,t)}translateOnAxis(t,e){return jo.copy(t).applyQuaternion(this.quaternion),this.position.add(jo.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(tl,t)}translateY(t){return this.translateOnAxis(el,t)}translateZ(t){return this.translateOnAxis(nl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Sn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?xs.copy(t):xs.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Fi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Sn.lookAt(Fi,xs,this.up):Sn.lookAt(xs,Fi,this.up),this.quaternion.setFromRotationMatrix(Sn),s&&(Sn.extractRotation(s.matrixWorld),oi.setFromRotationMatrix(Sn),this.quaternion.premultiply(oi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(ae("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(il),li.child=t,this.dispatchEvent(li),li.child=null):ae("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Hu),Tr.child=t,this.dispatchEvent(Tr),Tr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Sn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Sn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Sn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(il),li.child=t,this.dispatchEvent(li),li.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fi,t,Bu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fi,zu,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){const s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const f=l[c];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),u=a(t.images),f=a(t.shapes),h=a(t.skeletons),d=a(t.animations),p=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),d.length>0&&(n.animations=d),p.length>0&&(n.nodes=p)}return n.object=s,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Ee.DEFAULT_UP=new w(0,1,0);Ee.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ee.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class $n extends Ee{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Gu={type:"move"};class Ar{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new $n,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new $n,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new $n,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const x of t.hand.values()){const m=e.getJointPose(x,n),g=this._getHandJoint(c,x);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}const u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=u.position.distanceTo(f.position),d=.02,p=.005;c.inputState.pinching&&h>d+p?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&h<=d-p&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Gu)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new $n;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const kc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Nn={h:0,s:0,l:0},vs={h:0,s:0,l:0};function wr(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class jt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ke){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ie.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=ie.workingColorSpace){return this.r=t,this.g=e,this.b=n,ie.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=ie.workingColorSpace){if(t=bu(t,1),e=Jt(e,0,1),n=Jt(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=wr(a,r,t+1/3),this.g=wr(a,r,t),this.b=wr(a,r,t-1/3)}return ie.colorSpaceToWorking(this,s),this}setStyle(t,e=Ke){function n(r){r!==void 0&&parseFloat(r)<1&&Ht("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Ht("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Ht("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ke){const n=kc[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Ht("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Cn(t.r),this.g=Cn(t.g),this.b=Cn(t.b),this}copyLinearToSRGB(t){return this.r=Ti(t.r),this.g=Ti(t.g),this.b=Ti(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ke){return ie.workingToColorSpace(Oe.copy(this),t),Math.round(Jt(Oe.r*255,0,255))*65536+Math.round(Jt(Oe.g*255,0,255))*256+Math.round(Jt(Oe.b*255,0,255))}getHexString(t=Ke){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ie.workingColorSpace){ie.workingToColorSpace(Oe.copy(this),e);const n=Oe.r,s=Oe.g,r=Oe.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const f=a-o;switch(c=u<=.5?f/(a+o):f/(2-a-o),a){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=ie.workingColorSpace){return ie.workingToColorSpace(Oe.copy(this),e),t.r=Oe.r,t.g=Oe.g,t.b=Oe.b,t}getStyle(t=Ke){ie.workingToColorSpace(Oe.copy(this),t);const e=Oe.r,n=Oe.g,s=Oe.b;return t!==Ke?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Nn),this.setHSL(Nn.h+t,Nn.s+e,Nn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Nn),t.getHSL(vs);const n=Mr(Nn.h,vs.h,e),s=Mr(Nn.s,vs.s,e),r=Mr(Nn.l,vs.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Oe=new jt;jt.NAMES=kc;class ku extends Ee{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Pe,this.environmentIntensity=1,this.environmentRotation=new Pe,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}}const Qe=new w,yn=new w,Rr=new w,En=new w,ci=new w,hi=new w,sl=new w,Cr=new w,Pr=new w,Lr=new w,Dr=new ge,Nr=new ge,Ir=new ge;class nn{constructor(t=new w,e=new w,n=new w){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Qe.subVectors(t,e),s.cross(Qe);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Qe.subVectors(s,e),yn.subVectors(n,e),Rr.subVectors(t,e);const a=Qe.dot(Qe),o=Qe.dot(yn),l=Qe.dot(Rr),c=yn.dot(yn),u=yn.dot(Rr),f=a*c-o*o;if(f===0)return r.set(0,0,0),null;const h=1/f,d=(c*l-o*u)*h,p=(a*u-o*l)*h;return r.set(1-d-p,p,d)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,En)===null?!1:En.x>=0&&En.y>=0&&En.x+En.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,En)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,En.x),l.addScaledVector(a,En.y),l.addScaledVector(o,En.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Dr.setScalar(0),Nr.setScalar(0),Ir.setScalar(0),Dr.fromBufferAttribute(t,e),Nr.fromBufferAttribute(t,n),Ir.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Dr,r.x),a.addScaledVector(Nr,r.y),a.addScaledVector(Ir,r.z),a}static isFrontFacing(t,e,n,s){return Qe.subVectors(n,e),yn.subVectors(t,e),Qe.cross(yn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Qe.subVectors(this.c,this.b),yn.subVectors(this.a,this.b),Qe.cross(yn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return nn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return nn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return nn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return nn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return nn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let a,o;ci.subVectors(s,n),hi.subVectors(r,n),Cr.subVectors(t,n);const l=ci.dot(Cr),c=hi.dot(Cr);if(l<=0&&c<=0)return e.copy(n);Pr.subVectors(t,s);const u=ci.dot(Pr),f=hi.dot(Pr);if(u>=0&&f<=u)return e.copy(s);const h=l*f-u*c;if(h<=0&&l>=0&&u<=0&&l-u>0)return a=l/(l-u),e.copy(n).addScaledVector(ci,a);Lr.subVectors(t,r);const d=ci.dot(Lr),p=hi.dot(Lr);if(p>=0&&d<=p)return e.copy(r);const x=d*c-l*p;if(x<=0&&c>=0&&p<=0)return o=c/(c-p),e.copy(n).addScaledVector(hi,o);const m=u*p-d*f;if(m<=0&&f-u>=0&&d-p>=0)return sl.subVectors(r,s),o=(f-u)/(f-u+(d-p)),e.copy(s).addScaledVector(sl,o);const g=1/(m+x+h);return a=x*g,o=h*g,e.copy(n).addScaledVector(ci,a).addScaledVector(hi,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class kn{constructor(t=new w(1/0,1/0,1/0),e=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(je.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(je.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=je.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,je):je.fromBufferAttribute(r,a),je.applyMatrix4(t.matrixWorld),this.expandByPoint(je);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ms.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ms.copy(n.boundingBox)),Ms.applyMatrix4(t.matrixWorld),this.union(Ms)}const s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,je),je.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Bi),Ss.subVectors(this.max,Bi),ui.subVectors(t.a,Bi),fi.subVectors(t.b,Bi),di.subVectors(t.c,Bi),In.subVectors(fi,ui),Un.subVectors(di,fi),Yn.subVectors(ui,di);let e=[0,-In.z,In.y,0,-Un.z,Un.y,0,-Yn.z,Yn.y,In.z,0,-In.x,Un.z,0,-Un.x,Yn.z,0,-Yn.x,-In.y,In.x,0,-Un.y,Un.x,0,-Yn.y,Yn.x,0];return!Ur(e,ui,fi,di,Ss)||(e=[1,0,0,0,1,0,0,0,1],!Ur(e,ui,fi,di,Ss))?!1:(ys.crossVectors(In,Un),e=[ys.x,ys.y,ys.z],Ur(e,ui,fi,di,Ss))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,je).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(je).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(bn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),bn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),bn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),bn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),bn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),bn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),bn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),bn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(bn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const bn=[new w,new w,new w,new w,new w,new w,new w,new w],je=new w,Ms=new kn,ui=new w,fi=new w,di=new w,In=new w,Un=new w,Yn=new w,Bi=new w,Ss=new w,ys=new w,qn=new w;function Ur(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){qn.fromArray(i,r);const o=s.x*Math.abs(qn.x)+s.y*Math.abs(qn.y)+s.z*Math.abs(qn.z),l=t.dot(qn),c=e.dot(qn),u=n.dot(qn);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const Se=new w,Es=new ht;let Vu=0;class gn extends Gn{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Vu++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=vu,this.updateRanges=[],this.gpuType=dn,this.version=0,this._normalizationScale=t!==void 0?io(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Es.fromBufferAttribute(this,e),Es.applyMatrix3(t),this.setXY(e,Es.x,Es.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyMatrix3(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyMatrix4(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyNormalMatrix(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.transformDirection(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=this._denormalize(n)),n}setComponent(t,e,n){return this.normalized&&(n=this._normalize(n)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=this._denormalize(e)),e}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=this._denormalize(e)),e}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=this._denormalize(e)),e}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=this._denormalize(e)),e}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){const e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Au(t,this.array)}_normalize(t){const e=this._normalizationScale;return e!==void 0?Math.round(t*e):wu(t,this.array)}}class Vc extends gn{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Wc extends gn{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class ce extends gn{constructor(t,e,n){super(new Float32Array(t),e,n)}}const Wu=new kn,zi=new w,Or=new w;class lr{constructor(t=new w,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Wu.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;zi.subVectors(t,this.center);const e=zi.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(zi,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Or.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(zi.copy(t.center).add(Or)),this.expandByPoint(zi.copy(t.center).sub(Or))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}let Xu=0;const Ze=new se,Fr=new Ee,pi=new w,Xe=new kn,Hi=new kn,Re=new w;class De extends Gn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Xu++}),this.uuid=Ni(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Mu(t)?Wc:Vc)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Vt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Ze.makeRotationFromQuaternion(t),this.applyMatrix4(Ze),this}rotateX(t){return Ze.makeRotationX(t),this.applyMatrix4(Ze),this}rotateY(t){return Ze.makeRotationY(t),this.applyMatrix4(Ze),this}rotateZ(t){return Ze.makeRotationZ(t),this.applyMatrix4(Ze),this}translate(t,e,n){return Ze.makeTranslation(t,e,n),this.applyMatrix4(Ze),this}scale(t,e,n){return Ze.makeScale(t,e,n),this.applyMatrix4(Ze),this}lookAt(t){return Fr.lookAt(t),Fr.updateMatrix(),this.applyMatrix4(Fr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(pi).negate(),this.translate(pi.x,pi.y,pi.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ce(n,3))}else{const n=Math.min(t.length,e.count);for(let s=0;s<n;s++){const r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Ht("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new kn);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){ae("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];Xe.setFromBufferAttribute(r),this.morphTargetsRelative?(Re.addVectors(this.boundingBox.min,Xe.min),this.boundingBox.expandByPoint(Re),Re.addVectors(this.boundingBox.max,Xe.max),this.boundingBox.expandByPoint(Re)):(this.boundingBox.expandByPoint(Xe.min),this.boundingBox.expandByPoint(Xe.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ae('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new lr);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){ae("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new w,1/0);return}if(t){const n=this.boundingSphere.center;if(Xe.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];Hi.setFromBufferAttribute(o),this.morphTargetsRelative?(Re.addVectors(Xe.min,Hi.min),Xe.expandByPoint(Re),Re.addVectors(Xe.max,Hi.max),Xe.expandByPoint(Re)):(Xe.expandByPoint(Hi.min),Xe.expandByPoint(Hi.max))}Xe.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Re.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Re));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Re.fromBufferAttribute(o,c),l&&(pi.fromBufferAttribute(t,c),Re.add(pi)),s=Math.max(s,n.distanceToSquared(Re))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ae('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){ae("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new gn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],l=[],c=new Uint8Array(n.count);for(let L=0;L<n.count;L++)o[L]=new w,l[L]=new w;const u=new w,f=new w,h=new w,d=new ht,p=new ht,x=new ht,m=new w,g=new w;function v(L,P,D){c[L]=c[P]=c[D]=1,u.fromBufferAttribute(n,L),f.fromBufferAttribute(n,P),h.fromBufferAttribute(n,D),d.fromBufferAttribute(r,L),p.fromBufferAttribute(r,P),x.fromBufferAttribute(r,D),f.sub(u),h.sub(u),p.sub(d),x.sub(d);const H=1/(p.x*x.y-x.x*p.y);isFinite(H)&&(m.copy(f).multiplyScalar(x.y).addScaledVector(h,-p.y).multiplyScalar(H),g.copy(h).multiplyScalar(p.x).addScaledVector(f,-x.x).multiplyScalar(H),o[L].add(m),o[P].add(m),o[D].add(m),l[L].add(g),l[P].add(g),l[D].add(g))}let A=this.groups;A.length===0&&(A=[{start:0,count:t.count}]);for(let L=0,P=A.length;L<P;++L){const D=A[L],H=D.start,X=D.count;for(let T=H,I=H+X;T<I;T+=3)v(t.getX(T+0),t.getX(T+1),t.getX(T+2))}const M=new w,R=new w,y=new w,_=new w;function E(L){y.fromBufferAttribute(s,L),_.copy(y);const P=o[L];M.copy(P),M.sub(y.multiplyScalar(y.dot(P))).normalize(),R.crossVectors(_,P);const H=R.dot(l[L])<0?-1:1;a.setXYZW(L,M.x,M.y,M.z,H)}for(let L=0,P=n.count;L<P;++L)c[L]&&E(L);this._transformed=!0}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new gn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,d=n.count;h<d;h++)n.setXYZ(h,0,0,0);const s=new w,r=new w,a=new w,o=new w,l=new w,c=new w,u=new w,f=new w;if(t)for(let h=0,d=t.count;h<d;h+=3){const p=t.getX(h+0),x=t.getX(h+1),m=t.getX(h+2);s.fromBufferAttribute(e,p),r.fromBufferAttribute(e,x),a.fromBufferAttribute(e,m),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),o.fromBufferAttribute(n,p),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(p,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,d=e.count;h<d;h+=3)s.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),a.fromBufferAttribute(e,h+2),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Re.fromBufferAttribute(t,e),Re.normalize(),t.setXYZ(e,Re.x,Re.y,Re.z)}toNonIndexed(){function t(o,l){const c=o.array,u=o.itemSize,f=o.normalized,h=new c.constructor(l.length*u);let d=0,p=0;for(let x=0,m=l.length;x<m;x++){o.isInterleavedBufferAttribute?d=l[x]*o.data.stride+o.offset:d=l[x]*u;for(let g=0;g<u;g++)h[p++]=c[d++]}return new gn(h,u,f)}if(this.index===null)return Ht("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new De,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,f=c.length;u<f;u++){const h=c[u],d=t(h,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){const d=c[f];u.push(d.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone());const s=t.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(e))}const r=t.morphAttributes;for(const c in r){const u=[],f=r[c];for(let h=0,d=f.length;h<d;h++)u.push(f[h].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,u=a.length;c<u;c++){const f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Br=new w,Yu=new w,qu=new Vt;class cn{constructor(t=new w(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=Br.subVectors(n,e).cross(Yu.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){const s=t.delta(Br),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||qu.getNormalMatrix(t),s=this.coplanarPoint(Br).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}let Zu=0;class Ii extends Gn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Zu++}),this.uuid=Ni(),this.name="",this.type="Material",this.blending=Ji,this.side=jn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=vc,this.blendDst=Mc,this.blendEquation=Mi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new jt(0,0,0),this.blendAlpha=0,this.depthFunc=es,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=du,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=vr,this.stencilZFail=vr,this.stencilZPass=vr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){Ht(`Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){Ht(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new jt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.diffuseRoughness!==void 0&&(this.diffuseRoughness=t.diffuseRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum),t.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1]),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new cn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new ht().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ht().fromArray(t.clearcoatNormalScale)),t.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}const Tn=new w,zr=new w,bs=new w,Ts=new w;class us{constructor(t=new w,e=new w(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Tn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Tn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Tn.copy(this.origin).addScaledVector(this.direction,e),Tn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){zr.copy(t).add(e).multiplyScalar(.5),bs.copy(e).sub(t).normalize(),Ts.copy(this.origin).sub(zr);const r=t.distanceTo(e)*.5,a=-this.direction.dot(bs),o=Ts.dot(this.direction),l=-Ts.dot(bs),c=Ts.lengthSq(),u=Math.abs(1-a*a);let f,h,d,p;if(u>0)if(f=a*l-o,h=a*o-l,p=r*u,f>=0)if(h>=-p)if(h<=p){const x=1/u;f*=x,h*=x,d=f*(f+a*h+2*o)+h*(a*f+h+2*l)+c}else h=r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*l)+c;else h<=-p?(f=Math.max(0,-(-a*r+o)),h=f>0?-r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c):h<=p?(f=0,h=Math.min(Math.max(-r,-l),r),d=h*(h+2*l)+c):(f=Math.max(0,-(a*r+o)),h=f>0?r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c);else h=a>0?-r:r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(zr).addScaledVector(bs,h),d}intersectSphere(t,e){if(t.radius<0)return null;Tn.subVectors(t.center,this.origin);const n=Tn.dot(this.direction),s=Tn.dot(Tn)-n*n,r=t.radius*t.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(n=(t.min.x-h.x)*c,s=(t.max.x-h.x)*c):(n=(t.max.x-h.x)*c,s=(t.min.x-h.x)*c),u>=0?(r=(t.min.y-h.y)*u,a=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,a=(t.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(t.min.z-h.z)*f,l=(t.max.z-h.z)*f):(o=(t.max.z-h.z)*f,l=(t.min.z-h.z)*f),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Tn)!==null}intersectTriangle(t,e,n,s,r){const a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,f=t.x-a.x,h=t.y-a.y,d=t.z-a.z,p=e.x-a.x,x=e.y-a.y,m=e.z-a.z,g=n.x-a.x,v=n.y-a.y,A=n.z-a.z,M=Math.abs(l),R=Math.abs(c),y=Math.abs(u);let _,E,L,P,D,H,X,T,I,B,z,J;if(M>=R&&M>=y?(L=l,H=f,I=p,J=g,l>=0?(_=c,E=u,P=h,D=d,X=x,T=m,B=v,z=A):(_=u,E=c,P=d,D=h,X=m,T=x,B=A,z=v)):R>=y?(L=c,H=h,I=x,J=v,c>=0?(_=u,E=l,P=d,D=f,X=m,T=p,B=A,z=g):(_=l,E=u,P=f,D=d,X=p,T=m,B=g,z=A)):(L=u,H=d,I=m,J=A,u>=0?(_=l,E=c,P=f,D=h,X=p,T=x,B=g,z=v):(_=c,E=l,P=h,D=f,X=x,T=p,B=v,z=g)),L===0)return null;const G=_/L,q=E/L,$=1/L,lt=P-G*H,at=D-q*H,F=X-G*I,j=T-q*I,ft=B-G*J,mt=z-q*J,it=ft*j-mt*F,st=lt*mt-at*ft,Bt=F*at-j*lt;if(s){if(it<0||st<0||Bt<0)return null}else if((it<0||st<0||Bt<0)&&(it>0||st>0||Bt>0))return null;const gt=it+st+Bt;if(gt===0)return null;const Ct=$*(it*H+st*I+Bt*J);return(gt>0?Ct<0:Ct>0)?null:this.at(Ct/gt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ku extends Ii{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pe,this.combine=Sc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const rl=new se,Zn=new us,As=new lr,al=new w,ws=new w,Rs=new w,Cs=new w,Hr=new w,Ps=new w,ol=new w,Ls=new w;class rn extends Ee{constructor(t=new De,e=new Ku){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(r&&o){Ps.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],f=r[l];u!==0&&(Hr.fromBufferAttribute(f,t),a?Ps.addScaledVector(Hr,u):Ps.addScaledVector(Hr.sub(e),u))}e.add(Ps)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),As.copy(n.boundingSphere),As.applyMatrix4(r),Zn.copy(t.ray).recast(t.near),!(As.containsPoint(Zn.origin)===!1&&(Zn.intersectSphere(As,al)===null||Zn.origin.distanceToSquared(al)>(t.far-t.near)**2))&&(rl.copy(r).invert(),Zn.copy(t.ray).applyMatrix4(rl),!(n.boundingBox!==null&&Zn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Zn)))}_computeIntersections(t,e,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,x=h.length;p<x;p++){const m=h[p],g=a[m.materialIndex],v=Math.max(m.start,d.start),A=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let M=v,R=A;M<R;M+=3){const y=o.getX(M),_=o.getX(M+1),E=o.getX(M+2);s=Ds(this,g,t,n,c,u,f,y,_,E),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const p=Math.max(0,d.start),x=Math.min(o.count,d.start+d.count);for(let m=p,g=x;m<g;m+=3){const v=o.getX(m),A=o.getX(m+1),M=o.getX(m+2);s=Ds(this,a,t,n,c,u,f,v,A,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let p=0,x=h.length;p<x;p++){const m=h[p],g=a[m.materialIndex],v=Math.max(m.start,d.start),A=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let M=v,R=A;M<R;M+=3){const y=M,_=M+1,E=M+2;s=Ds(this,g,t,n,c,u,f,y,_,E),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const p=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let m=p,g=x;m<g;m+=3){const v=m,A=m+1,M=m+2;s=Ds(this,a,t,n,c,u,f,v,A,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function Ju(i,t,e,n,s,r,a,o){let l;if(t.side===Ve?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===jn,o),l===null)return null;Ls.copy(o),Ls.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Ls);return c<e.near||c>e.far?null:{distance:c,point:Ls.clone(),object:i}}function Ds(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,ws),i.getVertexPosition(l,Rs),i.getVertexPosition(c,Cs);const u=Ju(i,t,e,n,ws,Rs,Cs,ol);if(u){const f=new w;nn.getBarycoord(ol,ws,Rs,Cs,f),s&&(u.uv=nn.getInterpolatedAttribute(s,o,l,c,f,new ht)),r&&(u.uv1=nn.getInterpolatedAttribute(r,o,l,c,f,new ht)),a&&(u.normal=nn.getInterpolatedAttribute(a,o,l,c,f,new w),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:l,c,normal:new w,materialIndex:0};nn.getNormal(ws,Rs,Cs,h.normal),u.face=h,u.barycoord=f}return u}class $u extends ze{constructor(t=null,e=1,n=1,s,r,a,o,l,c=Le,u=Le,f,h){super(null,a,o,l,c,u,s,r,f,h),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Kn=new lr,Qu=new ht(.5,.5),Ns=new w;class rs{constructor(t=new cn,e=new cn,n=new cn,s=new cn,r=new cn,a=new cn){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=sn,n=!1){const s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],f=r[5],h=r[6],d=r[7],p=r[8],x=r[9],m=r[10],g=r[11],v=r[12],A=r[13],M=r[14],R=r[15];if(s[0].setComponents(c-a,d-u,g-p,R-v).normalize(),s[1].setComponents(c+a,d+u,g+p,R+v).normalize(),s[2].setComponents(c+o,d+f,g+x,R+A).normalize(),s[3].setComponents(c-o,d-f,g-x,R-A).normalize(),n)s[4].setComponents(l,h,m,M).normalize(),s[5].setComponents(c-l,d-h,g-m,R-M).normalize();else if(s[4].setComponents(c-l,d-h,g-m,R-M).normalize(),e===sn)s[5].setComponents(c+l,d+h,g+m,R+M).normalize();else if(e===ss)s[5].setComponents(l,h,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Kn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Kn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Kn)}intersectsSprite(t){Kn.center.set(0,0,0);const e=Qu.distanceTo(t.center);return Kn.radius=.7071067811865476+e,Kn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Kn)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(Ns.x=s.normal.x>0?t.max.x:t.min.x,Ns.y=s.normal.y>0?t.max.y:t.min.y,Ns.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Ns)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const ll=new se;class ao{constructor(){this.coordinateSystem=sn,this._frustums=[],this._count=0}setFromArrayCamera(t){const e=t.cameras,n=this._frustums;for(let s=0;s<e.length;s++){const r=e[s];ll.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new rs),n[s].setFromProjectionMatrix(ll,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsObject(t))return!0;return!1}intersectsSprite(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSprite(t))return!0;return!1}intersectsSphere(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSphere(t))return!0;return!1}intersectsBox(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsBox(t))return!0;return!1}containsPoint(t){const e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;const e=this._frustums,n=t._frustums;for(let s=0;s<t._count;s++)e[s]===void 0&&(e[s]=new rs),e[s].copy(n[s]);return this._count=t._count,this}clone(){return new ao().copy(this)}}class Xc extends Ii{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new jt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const sr=new w,rr=new w,cl=new se,Gi=new us,Is=new lr,Gr=new w,hl=new w;class ju extends Ee{constructor(t=new De,e=new Xc){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)sr.fromBufferAttribute(e,s-1),rr.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=sr.distanceTo(rr);t.setAttribute("lineDistance",new ce(n,1))}else Ht("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Is.copy(n.boundingSphere),Is.applyMatrix4(s),Is.radius+=r,t.ray.intersectsSphere(Is)===!1)return;cl.copy(s).invert(),Gi.copy(t.ray).applyMatrix4(cl);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){const d=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let x=d,m=p-1;x<m;x+=c){const g=u.getX(x),v=u.getX(x+1),A=Us(this,t,Gi,l,g,v,x);A&&e.push(A)}if(this.isLineLoop){const x=u.getX(p-1),m=u.getX(d),g=Us(this,t,Gi,l,x,m,p-1);g&&e.push(g)}}else{const d=Math.max(0,a.start),p=Math.min(h.count,a.start+a.count);for(let x=d,m=p-1;x<m;x+=c){const g=Us(this,t,Gi,l,x,x+1,x);g&&e.push(g)}if(this.isLineLoop){const x=Us(this,t,Gi,l,p-1,d,p-1);x&&e.push(x)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Us(i,t,e,n,s,r,a){const o=i.geometry.attributes.position;if(sr.fromBufferAttribute(o,s),rr.fromBufferAttribute(o,r),e.distanceSqToSegment(sr,rr,Gr,hl)>n)return;Gr.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Gr);if(!(c<t.near||c>t.far))return{distance:c,point:hl.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}const ul=new w,fl=new w;class Yc extends ju{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)ul.fromBufferAttribute(e,s),fl.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+ul.distanceTo(fl);t.setAttribute("lineDistance",new ce(n,1))}else Ht("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class qc extends ze{constructor(t=[],e=wi,n,s,r,a,o,l,c,u){super(t,e,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Ci extends ze{constructor(t,e,n=_n,s,r,a,o=Le,l=Le,c,u=Hn,f=1){if(u!==Hn&&u!==zn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:t,height:e,depth:f};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new so(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}}class Zc extends Ci{constructor(t,e=_n,n=wi,s,r,a=Le,o=Le,l,c=Hn){const u={width:t,height:t,depth:1},f=[u,u,u,u,u,u];super(t,t,e,n,s,r,a,o,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class Kc extends ze{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class ii extends De{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],f=[];let h=0,d=0;p("z","y","x",-1,-1,n,e,t,a,r,0),p("z","y","x",1,-1,n,e,-t,a,r,1),p("x","z","y",1,1,t,n,e,s,a,2),p("x","z","y",1,-1,t,n,-e,s,a,3),p("x","y","z",1,-1,t,e,n,s,r,4),p("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ce(c,3)),this.setAttribute("normal",new ce(u,3)),this.setAttribute("uv",new ce(f,2));function p(x,m,g,v,A,M,R,y,_,E,L){const P=M/_,D=R/E,H=M/2,X=R/2,T=y/2,I=_+1,B=E+1;let z=0,J=0;const G=new w;for(let q=0;q<B;q++){const $=q*D-X;for(let lt=0;lt<I;lt++){const at=lt*P-H;G[x]=at*v,G[m]=$*A,G[g]=T,c.push(G.x,G.y,G.z),G[x]=0,G[m]=0,G[g]=y>0?1:-1,u.push(G.x,G.y,G.z),f.push(lt/_),f.push(1-q/E),z+=1}}for(let q=0;q<E;q++)for(let $=0;$<_;$++){const lt=h+$+I*q,at=h+$+I*(q+1),F=h+($+1)+I*(q+1),j=h+($+1)+I*q;l.push(lt,at,j),l.push(at,F,j),J+=6}o.addGroup(d,J,L),d+=J,h+=z}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ii(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class oo extends De{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const a=[],o=[],l=[],c=[],u=e/2,f=Math.PI/2*t,h=e,d=2*f+h,p=n*2+r,x=s+1,m=new w,g=new w;for(let v=0;v<=p;v++){let A=0,M=0,R=0,y=0;if(v<=n){const L=v/n,P=L*Math.PI/2;M=-u-t*Math.cos(P),R=t*Math.sin(P),y=-t*Math.cos(P),A=L*f}else if(v<=n+r){const L=(v-n)/r;M=-u+L*e,R=t,y=0,A=f+L*h}else{const L=(v-n-r)/n,P=L*Math.PI/2;M=u+t*Math.sin(P),R=t*Math.cos(P),y=t*Math.sin(P),A=f+h+L*f}const _=Math.max(0,Math.min(1,A/d));let E=0;v===0?E=.5/s:v===p&&(E=-.5/s);for(let L=0;L<=s;L++){const P=L/s,D=P*Math.PI*2,H=Math.sin(D),X=Math.cos(D);g.x=-R*X,g.y=M,g.z=R*H,o.push(g.x,g.y,g.z),m.set(-R*X,y,R*H),m.normalize(),l.push(m.x,m.y,m.z),c.push(P+E,_)}if(v>0){const L=(v-1)*x;for(let P=0;P<s;P++){const D=L+P,H=L+P+1,X=v*x+P,T=v*x+P+1;a.push(D,H,X),a.push(H,T,X)}}}this.setIndex(a),this.setAttribute("position",new ce(o,3)),this.setAttribute("normal",new ce(l,3)),this.setAttribute("uv",new ce(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new oo(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}}class fn extends De{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],f=[],h=[],d=[];let p=0;const x=[],m=n/2;let g=0;v(),a===!1&&(t>0&&A(!0),e>0&&A(!1)),this.setIndex(u),this.setAttribute("position",new ce(f,3)),this.setAttribute("normal",new ce(h,3)),this.setAttribute("uv",new ce(d,2));function v(){const M=new w,R=new w;let y=0;const _=(e-t)/n;for(let E=0;E<=r;E++){const L=[],P=E/r,D=P*(e-t)+t;for(let H=0;H<=s;H++){const X=H/s,T=X*l+o,I=Math.sin(T),B=Math.cos(T);R.x=D*I,R.y=-P*n+m,R.z=D*B,f.push(R.x,R.y,R.z),M.set(I,_,B).normalize(),h.push(M.x,M.y,M.z),d.push(X,1-P),L.push(p++)}x.push(L)}for(let E=0;E<s;E++)for(let L=0;L<r;L++){const P=x[L][E],D=x[L+1][E],H=x[L+1][E+1],X=x[L][E+1];(t>0||L!==0)&&(u.push(P,D,X),y+=3),(e>0||L!==r-1)&&(u.push(D,H,X),y+=3)}c.addGroup(g,y,0),g+=y}function A(M){const R=p,y=new ht,_=new w;let E=0;const L=M===!0?t:e,P=M===!0?1:-1;for(let H=1;H<=s;H++)f.push(0,m*P,0),h.push(0,P,0),d.push(.5,.5),p++;const D=p;for(let H=0;H<=s;H++){const T=H/s*l+o,I=Math.cos(T),B=Math.sin(T);_.x=L*B,_.y=m*P,_.z=L*I,f.push(_.x,_.y,_.z),h.push(0,P,0),y.x=I*.5+.5,y.y=B*.5*P+.5,d.push(y.x,y.y),p++}for(let H=0;H<s;H++){const X=R+H,T=D+H;M===!0?u.push(T,T+1,X):u.push(T+1,T,X),E+=3}c.addGroup(g,E,M===!0?1:2),g+=E}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new fn(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Qn extends fn{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new Qn(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class lo extends De{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};const r=[],a=[];o(s),c(n),u(),this.setAttribute("position",new ce(r,3)),this.setAttribute("normal",new ce(r.slice(),3)),this.setAttribute("uv",new ce(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(v){const A=new w,M=new w,R=new w;for(let y=0;y<e.length;y+=3)d(e[y+0],A),d(e[y+1],M),d(e[y+2],R),l(A,M,R,v)}function l(v,A,M,R){const y=R+1,_=[];for(let E=0;E<=y;E++){_[E]=[];const L=v.clone().lerp(M,E/y),P=A.clone().lerp(M,E/y),D=y-E;for(let H=0;H<=D;H++)H===0&&E===y?_[E][H]=L:_[E][H]=L.clone().lerp(P,H/D)}for(let E=0;E<y;E++)for(let L=0;L<2*(y-E)-1;L++){const P=Math.floor(L/2);L%2===0?(h(_[E][P+1]),h(_[E+1][P]),h(_[E][P])):(h(_[E][P+1]),h(_[E+1][P+1]),h(_[E+1][P]))}}function c(v){const A=new w;for(let M=0;M<r.length;M+=3)A.x=r[M+0],A.y=r[M+1],A.z=r[M+2],A.normalize().multiplyScalar(v),r[M+0]=A.x,r[M+1]=A.y,r[M+2]=A.z}function u(){const v=new w;for(let A=0;A<r.length;A+=3){v.x=r[A+0],v.y=r[A+1],v.z=r[A+2];const M=m(v)/2/Math.PI+.5,R=g(v)/Math.PI+.5;a.push(M,1-R)}p(),f()}function f(){for(let v=0;v<a.length;v+=6){const A=a[v+0],M=a[v+2],R=a[v+4],y=Math.max(A,M,R),_=Math.min(A,M,R);y>.9&&_<.1&&(A<.2&&(a[v+0]+=1),M<.2&&(a[v+2]+=1),R<.2&&(a[v+4]+=1))}}function h(v){r.push(v.x,v.y,v.z)}function d(v,A){const M=v*3;A.x=t[M+0],A.y=t[M+1],A.z=t[M+2]}function p(){const v=new w,A=new w,M=new w,R=new w,y=new ht,_=new ht,E=new ht;for(let L=0,P=0;L<r.length;L+=9,P+=6){v.set(r[L+0],r[L+1],r[L+2]),A.set(r[L+3],r[L+4],r[L+5]),M.set(r[L+6],r[L+7],r[L+8]),y.set(a[P+0],a[P+1]),_.set(a[P+2],a[P+3]),E.set(a[P+4],a[P+5]),R.copy(v).add(A).add(M).divideScalar(3);const D=m(R);x(y,P+0,v,D),x(_,P+2,A,D),x(E,P+4,M,D)}}function x(v,A,M,R){R<0&&v.x===1&&(a[A]=v.x-1),M.x===0&&M.z===0&&(a[A]=R/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function g(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new lo(t.vertices,t.indices,t.radius,t.detail)}}class vn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ht("Curve: .getPoint() not implemented.")}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){const n=this.getLengths();let s=0;const r=n.length;let a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);const u=n[s],h=n[s+1]-u,d=(a-u)/h;return(s+d)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new ht:new w);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){const n=new w,s=[],r=[],a=[],o=new w,l=new se;for(let d=0;d<=t;d++){const p=d/t;s[d]=this.getTangentAt(p,new w)}r[0]=new w,a[0]=new w;let c=Number.MAX_VALUE;const u=Math.abs(s[0].x),f=Math.abs(s[0].y),h=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),f<=c&&(c=f,n.set(0,1,0)),h<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();const p=Math.acos(Jt(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(o,p))}a[d].crossVectors(s[d],r[d])}if(e===!0){let d=Math.acos(Jt(r[0].dot(r[t]),-1,1));d/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(d=-d);for(let p=1;p<=t;p++)r[p].applyMatrix4(l.makeRotationAxis(s[p],d*p)),a[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}}class co extends vn{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new ht){const n=e,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const u=Math.cos(this.aRotation),f=Math.sin(this.aRotation),h=l-this.aX,d=c-this.aY;l=h*u-d*f+this.aX,c=h*f+d*u+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class tf extends co{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function ho(){let i=0,t=0,e=0,n=0;function s(r,a,o,l){i=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,f){let h=(a-r)/c-(o-r)/(c+u)+(o-a)/u,d=(o-a)/u-(l-a)/(u+f)+(l-o)/f;h*=u,d*=u,s(a,o,h,d)},calc:function(r){const a=r*r,o=a*r;return i+t*r+e*a+n*o}}}const dl=new w,pl=new w,kr=new ho,Vr=new ho,Wr=new ho;class ef extends vn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new w){const n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(pl.subVectors(s[0],s[1]).add(s[0]),c=pl);const f=s[o%r],h=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(dl.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=dl),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let p=Math.pow(c.distanceToSquared(f),d),x=Math.pow(f.distanceToSquared(h),d),m=Math.pow(h.distanceToSquared(u),d);x<1e-4&&(x=1),p<1e-4&&(p=x),m<1e-4&&(m=x),kr.initNonuniformCatmullRom(c.x,f.x,h.x,u.x,p,x,m),Vr.initNonuniformCatmullRom(c.y,f.y,h.y,u.y,p,x,m),Wr.initNonuniformCatmullRom(c.z,f.z,h.z,u.z,p,x,m)}else this.curveType==="catmullrom"&&(kr.initCatmullRom(c.x,f.x,h.x,u.x,this.tension),Vr.initCatmullRom(c.y,f.y,h.y,u.y,this.tension),Wr.initCatmullRom(c.z,f.z,h.z,u.z,this.tension));return n.set(kr.calc(l),Vr.calc(l),Wr.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new w().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function ml(i,t,e,n,s){const r=(n-t)*.5,a=(s-e)*.5,o=i*i,l=i*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*i+e}function nf(i,t){const e=1-i;return e*e*t}function sf(i,t){return 2*(1-i)*i*t}function rf(i,t){return i*i*t}function $i(i,t,e,n){return nf(i,t)+sf(i,e)+rf(i,n)}function af(i,t){const e=1-i;return e*e*e*t}function of(i,t){const e=1-i;return 3*e*e*i*t}function lf(i,t){return 3*(1-i)*i*i*t}function cf(i,t){return i*i*i*t}function Qi(i,t,e,n,s){return af(i,t)+of(i,e)+lf(i,n)+cf(i,s)}class Jc extends vn{constructor(t=new ht,e=new ht,n=new ht,s=new ht){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new ht){const n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Qi(t,s.x,r.x,a.x,o.x),Qi(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class hf extends vn{constructor(t=new w,e=new w,n=new w,s=new w){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new w){const n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Qi(t,s.x,r.x,a.x,o.x),Qi(t,s.y,r.y,a.y,o.y),Qi(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class $c extends vn{constructor(t=new ht,e=new ht){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new ht){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new ht){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class uf extends vn{constructor(t=new w,e=new w){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new w){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new w){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Qc extends vn{constructor(t=new ht,e=new ht,n=new ht){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new ht){const n=e,s=this.v0,r=this.v1,a=this.v2;return n.set($i(t,s.x,r.x,a.x),$i(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class ff extends vn{constructor(t=new w,e=new w,n=new w){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new w){const n=e,s=this.v0,r=this.v1,a=this.v2;return n.set($i(t,s.x,r.x,a.x),$i(t,s.y,r.y,a.y),$i(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class jc extends vn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new ht){const n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],f=s[a>s.length-3?s.length-1:a+2];return n.set(ml(o,l.x,c.x,u.x,f.x),ml(o,l.y,c.y,u.y,f.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new ht().fromArray(s))}return this}}var za=Object.freeze({__proto__:null,ArcCurve:tf,CatmullRomCurve3:ef,CubicBezierCurve:Jc,CubicBezierCurve3:hf,EllipseCurve:co,LineCurve:$c,LineCurve3:uf,QuadraticBezierCurve:Qc,QuadraticBezierCurve3:ff,SplineCurve:jc});class df extends vn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new za[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){const u=l[c];n&&n.equals(u)||(e.push(u),n=u)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this.cacheLengths=null,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const s=t.curves[e];this.curves.push(new za[s.type]().fromJSON(s))}return this.cacheLengths=null,this}}class gl extends df{constructor(t){super(),this.type="Path",this.currentPoint=new ht,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new $c(this.currentPoint.clone(),new ht(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){const r=new Qc(this.currentPoint.clone(),new ht(t,e),new ht(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,a){const o=new Jc(this.currentPoint.clone(),new ht(t,e),new ht(n,s),new ht(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new jc(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,s,r,a),this}absarc(t,e,n,s,r,a){return this.absellipse(t,e,n,n,s,r,a),this}ellipse(t,e,n,s,r,a,o,l){const c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(t+c,e+u,n,s,r,a,o,l),this}absellipse(t,e,n,s,r,a,o,l){const c=new co(t,e,n,s,r,a,o,l);if(this.curves.length>0){const f=c.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(c);const u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class th extends gl{constructor(t){super(t),this.uuid=Ni(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const s=t.holes[e];this.holes.push(new gl().fromJSON(s))}return this}}function pf(i,t,e=2){const n=t&&t.length,s=n?t[0]*e:i.length;let r=eh(i,0,s,e,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=vf(i,t,r,e)),i.length>80*e){o=i[0],l=i[1];let u=o,f=l;for(let h=e;h<s;h+=e){const d=i[h],p=i[h+1];d<o&&(o=d),p<l&&(l=p),d>u&&(u=d),p>f&&(f=p)}c=Math.max(u-o,f-l),c=c!==0?32767/c:0}return as(r,a,e,o,l,c,0),a}function eh(i,t,e,n,s){let r;if(s===Pf(i,t,e,n)>0)for(let a=t;a<e;a+=n)r=_l(a/n|0,i[a],i[a+1],r);else for(let a=e-n;a>=t;a-=n)r=_l(a/n|0,i[a],i[a+1],r);return r&&Pi(r,r.next)&&(ls(r),r=r.next),r}function ei(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(Pi(e,e.next)||_e(e.prev,e,e.next)===0)){if(ls(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function as(i,t,e,n,s,r,a){if(!i)return;!a&&r&&bf(i,n,s,r);let o=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(r?gf(i,n,s,r):mf(i)){t.push(l.i,i.i,c.i),ls(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=_f(ei(i),t),as(i,t,e,n,s,r,2)):a===2&&xf(i,t,e,n,s,r):as(ei(i),t,e,n,s,r,1);break}}}function mf(i){const t=i.prev,e=i,n=i.next;if(_e(t,e,n)>=0)return!1;const s=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,u=Math.min(s,r,a),f=Math.min(o,l,c),h=Math.max(s,r,a),d=Math.max(o,l,c);let p=n.next;for(;p!==t;){if(p.x>=u&&p.x<=h&&p.y>=f&&p.y<=d&&Xi(s,o,r,l,a,c,p.x,p.y)&&_e(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function gf(i,t,e,n){const s=i.prev,r=i,a=i.next;if(_e(s,r,a)>=0)return!1;const o=s.x,l=r.x,c=a.x,u=s.y,f=r.y,h=a.y,d=Math.min(o,l,c),p=Math.min(u,f,h),x=Math.max(o,l,c),m=Math.max(u,f,h),g=Ha(d,p,t,e,n),v=Ha(x,m,t,e,n);let A=i.prevZ,M=i.nextZ;for(;A&&A.z>=g&&M&&M.z<=v;){if(A.x>=d&&A.x<=x&&A.y>=p&&A.y<=m&&A!==s&&A!==a&&Xi(o,u,l,f,c,h,A.x,A.y)&&_e(A.prev,A,A.next)>=0||(A=A.prevZ,M.x>=d&&M.x<=x&&M.y>=p&&M.y<=m&&M!==s&&M!==a&&Xi(o,u,l,f,c,h,M.x,M.y)&&_e(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;A&&A.z>=g;){if(A.x>=d&&A.x<=x&&A.y>=p&&A.y<=m&&A!==s&&A!==a&&Xi(o,u,l,f,c,h,A.x,A.y)&&_e(A.prev,A,A.next)>=0)return!1;A=A.prevZ}for(;M&&M.z<=v;){if(M.x>=d&&M.x<=x&&M.y>=p&&M.y<=m&&M!==s&&M!==a&&Xi(o,u,l,f,c,h,M.x,M.y)&&_e(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function _f(i,t){let e=i;do{const n=e.prev,s=e.next.next;!Pi(n,s)&&ih(n,e,e.next,s)&&os(n,s)&&os(s,n)&&(t.push(n.i,e.i,s.i),ls(e),ls(e.next),e=i=s),e=e.next}while(e!==i);return ei(e)}function xf(i,t,e,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&wf(a,o)){let l=sh(a,o);a=ei(a,a.next),l=ei(l,l.next),as(a,t,e,n,s,r,0),as(l,t,e,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function vf(i,t,e,n){const s=[];for(let r=0,a=t.length;r<a;r++){const o=t[r]*n,l=r<a-1?t[r+1]*n:i.length,c=eh(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Af(c))}s.sort(Mf);for(let r=0;r<s.length;r++)e=Sf(s[r],e);return e}function Mf(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function Sf(i,t){const e=yf(i,t);if(!e)return t;const n=sh(e,i);return ei(n,n.next),ei(e,e.next)}function yf(i,t){let e=t;const n=i.x,s=i.y;let r=-1/0,a;if(Pi(i,e))return e;do{if(Pi(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){const f=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(f<=n&&f>r&&(r=f,a=e.x<e.next.x?e:e.next,f===n))return a}e=e.next}while(e!==t);if(!a)return null;const o=a,l=a.x,c=a.y;let u=1/0;e=a;do{if(n>=e.x&&e.x>=l&&n!==e.x&&nh(s<c?n:r,s,l,c,s<c?r:n,s,e.x,e.y)){const f=Math.abs(s-e.y)/(n-e.x);os(e,i)&&(f<u||f===u&&(e.x>a.x||e.x===a.x&&Ef(a,e)))&&(a=e,u=f)}e=e.next}while(e!==o);return a}function Ef(i,t){return _e(i.prev,i,t.prev)<0&&_e(t.next,i,i.next)<0}function bf(i,t,e,n){let s=i;do s.z===0&&(s.z=Ha(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Tf(s)}function Tf(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let a=n,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,e*=2}while(t>1);return i}function Ha(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function Af(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function nh(i,t,e,n,s,r,a,o){return(s-a)*(t-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(n-o)}function Xi(i,t,e,n,s,r,a,o){return!(i===a&&t===o)&&nh(i,t,e,n,s,r,a,o)}function wf(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!Rf(i,t)&&(os(i,t)&&os(t,i)&&Cf(i,t)&&(_e(i.prev,i,t.prev)||_e(i,t.prev,t))||Pi(i,t)&&_e(i.prev,i,i.next)>0&&_e(t.prev,t,t.next)>0)}function _e(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function Pi(i,t){return i.x===t.x&&i.y===t.y}function ih(i,t,e,n){const s=Fs(_e(i,t,e)),r=Fs(_e(i,t,n)),a=Fs(_e(e,n,i)),o=Fs(_e(e,n,t));return!!(s!==r&&a!==o||s===0&&Os(i,e,t)||r===0&&Os(i,n,t)||a===0&&Os(e,i,n)||o===0&&Os(e,t,n))}function Os(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Fs(i){return i>0?1:i<0?-1:0}function Rf(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&ih(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function os(i,t){return _e(i.prev,i,i.next)<0?_e(i,t,i.next)>=0&&_e(i,i.prev,t)>=0:_e(i,t,i.prev)<0||_e(i,i.next,t)<0}function Cf(i,t){let e=i,n=!1;const s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function sh(i,t){const e=Ga(i.i,i.x,i.y),n=Ga(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function _l(i,t,e,n){const s=Ga(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function ls(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Ga(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Pf(i,t,e,n){let s=0;for(let r=t,a=e-n;r<e;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}class Lf{static triangulate(t,e,n=2){return pf(t,e,n)}}class yi{static area(t){const e=t.length;let n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return yi.area(t)<0}static triangulateShape(t,e){const n=[],s=[],r=[];xl(t),vl(n,t);let a=t.length;e.forEach(xl);for(let l=0;l<e.length;l++)s.push(a),a+=e[l].length,vl(n,e[l]);const o=Lf.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function xl(i){const t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function vl(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}class uo extends De{constructor(t=new th([new ht(.5,.5),new ht(-.5,.5),new ht(-.5,-.5),new ht(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,s=[],r=[];for(let o=0,l=t.length;o<l;o++){const c=t[o];a(c)}this.setAttribute("position",new ce(s,3)),this.setAttribute("uv",new ce(r,2)),this.computeVertexNormals();function a(o){const l=[],c=e.curveSegments!==void 0?e.curveSegments:12,u=e.steps!==void 0?e.steps:1,f=e.depth!==void 0?e.depth:1;let h=e.bevelEnabled!==void 0?e.bevelEnabled:!0,d=e.bevelThickness!==void 0?e.bevelThickness:.2,p=e.bevelSize!==void 0?e.bevelSize:d-.1,x=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3;const g=e.extrudePath,v=e.UVGenerator!==void 0?e.UVGenerator:Df;let A,M=!1,R,y,_,E;if(g){A=g.getSpacedPoints(u),M=!0,h=!1;const Z=g.isCatmullRomCurve3?g.closed:!1;R=g.computeFrenetFrames(u,Z),y=new w,_=new w,E=new w}h||(m=0,d=0,p=0,x=0);const L=o.extractPoints(c);let P=L.shape;const D=L.holes;if(!yi.isClockWise(P)){P=P.reverse();for(let Z=0,ot=D.length;Z<ot;Z++){const rt=D[Z];yi.isClockWise(rt)&&(D[Z]=rt.reverse())}}function X(Z){const rt=10000000000000001e-36;let Tt=Z[0];for(let pt=1;pt<=Z.length;pt++){const kt=pt%Z.length,Lt=Z[kt],Xt=Lt.x-Tt.x,qt=Lt.y-Tt.y,te=Xt*Xt+qt*qt,O=Math.max(Math.abs(Lt.x),Math.abs(Lt.y),Math.abs(Tt.x),Math.abs(Tt.y)),ve=rt*O*O;if(te<=ve){Z.splice(kt,1),pt--;continue}Tt=Lt}}X(P),D.forEach(X);const T=D.length,I=P;for(let Z=0;Z<T;Z++){const ot=D[Z];P=P.concat(ot)}function B(Z,ot,rt){return ot||ae("ExtrudeGeometry: vec does not exist"),Z.clone().addScaledVector(ot,rt)}const z=P.length;function J(Z,ot,rt){let Tt,pt,kt;const Lt=Z.x-ot.x,Xt=Z.y-ot.y,qt=rt.x-Z.x,te=rt.y-Z.y,O=Lt*Lt+Xt*Xt,ve=Lt*te-Xt*qt;if(Math.abs(ve)>Number.EPSILON){const $t=Math.sqrt(O),fe=Math.sqrt(qt*qt+te*te),yt=ot.x-Xt/$t,xe=ot.y+Lt/$t,zt=rt.x-te/fe,Gt=rt.y+qt/fe,C=((zt-yt)*te-(Gt-xe)*qt)/(Lt*te-Xt*qt);Tt=yt+Lt*C-Z.x,pt=xe+Xt*C-Z.y;const S=Tt*Tt+pt*pt;if(S<=2)return new ht(Tt,pt);kt=Math.sqrt(S/2)}else{let $t=!1;Lt>Number.EPSILON?qt>Number.EPSILON&&($t=!0):Lt<-Number.EPSILON?qt<-Number.EPSILON&&($t=!0):Math.sign(Xt)===Math.sign(te)&&($t=!0),$t?(Tt=-Xt,pt=Lt,kt=Math.sqrt(O)):(Tt=Lt,pt=Xt,kt=Math.sqrt(O/2))}return new ht(Tt/kt,pt/kt)}const G=[];for(let Z=0,ot=I.length,rt=ot-1,Tt=Z+1;Z<ot;Z++,rt++,Tt++)rt===ot&&(rt=0),Tt===ot&&(Tt=0),G[Z]=J(I[Z],I[rt],I[Tt]);const q=[];let $,lt=G.concat();for(let Z=0,ot=T;Z<ot;Z++){const rt=D[Z];$=[];for(let Tt=0,pt=rt.length,kt=pt-1,Lt=Tt+1;Tt<pt;Tt++,kt++,Lt++)kt===pt&&(kt=0),Lt===pt&&(Lt=0),$[Tt]=J(rt[Tt],rt[kt],rt[Lt]);q.push($),lt=lt.concat($)}let at;if(m===0)at=yi.triangulateShape(I,D);else{const Z=[],ot=[];for(let rt=0;rt<m;rt++){const Tt=rt/m,pt=d*Math.cos(Tt*Math.PI/2),kt=p*Math.sin(Tt*Math.PI/2)+x;for(let Lt=0,Xt=I.length;Lt<Xt;Lt++){const qt=B(I[Lt],G[Lt],kt);st(qt.x,qt.y,-pt),Tt===0&&Z.push(qt)}for(let Lt=0,Xt=T;Lt<Xt;Lt++){const qt=D[Lt];$=q[Lt];const te=[];for(let O=0,ve=qt.length;O<ve;O++){const $t=B(qt[O],$[O],kt);st($t.x,$t.y,-pt),Tt===0&&te.push($t)}Tt===0&&ot.push(te)}}at=yi.triangulateShape(Z,ot)}const F=at.length,j=p+x;for(let Z=0;Z<z;Z++){const ot=h?B(P[Z],lt[Z],j):P[Z];M?(_.copy(R.normals[0]).multiplyScalar(ot.x),y.copy(R.binormals[0]).multiplyScalar(ot.y),E.copy(A[0]).add(_).add(y),st(E.x,E.y,E.z)):st(ot.x,ot.y,0)}for(let Z=1;Z<=u;Z++)for(let ot=0;ot<z;ot++){const rt=h?B(P[ot],lt[ot],j):P[ot];M?(_.copy(R.normals[Z]).multiplyScalar(rt.x),y.copy(R.binormals[Z]).multiplyScalar(rt.y),E.copy(A[Z]).add(_).add(y),st(E.x,E.y,E.z)):st(rt.x,rt.y,f/u*Z)}for(let Z=m-1;Z>=0;Z--){const ot=Z/m,rt=d*Math.cos(ot*Math.PI/2),Tt=p*Math.sin(ot*Math.PI/2)+x;for(let pt=0,kt=I.length;pt<kt;pt++){const Lt=B(I[pt],G[pt],Tt);st(Lt.x,Lt.y,f+rt)}for(let pt=0,kt=D.length;pt<kt;pt++){const Lt=D[pt];$=q[pt];for(let Xt=0,qt=Lt.length;Xt<qt;Xt++){const te=B(Lt[Xt],$[Xt],Tt);M?st(te.x,te.y+A[u-1].y,A[u-1].x+rt):st(te.x,te.y,f+rt)}}}ft(),mt();function ft(){const Z=s.length/3;if(h){let ot=0,rt=z*ot;for(let Tt=0;Tt<F;Tt++){const pt=at[Tt];Bt(pt[2]+rt,pt[1]+rt,pt[0]+rt)}ot=u+m*2,rt=z*ot;for(let Tt=0;Tt<F;Tt++){const pt=at[Tt];Bt(pt[0]+rt,pt[1]+rt,pt[2]+rt)}}else{for(let ot=0;ot<F;ot++){const rt=at[ot];Bt(rt[2],rt[1],rt[0])}for(let ot=0;ot<F;ot++){const rt=at[ot];Bt(rt[0]+z*u,rt[1]+z*u,rt[2]+z*u)}}n.addGroup(Z,s.length/3-Z,0)}function mt(){const Z=s.length/3;let ot=0;it(I,ot),ot+=I.length;for(let rt=0,Tt=D.length;rt<Tt;rt++){const pt=D[rt];it(pt,ot),ot+=pt.length}n.addGroup(Z,s.length/3-Z,1)}function it(Z,ot){let rt=Z.length;for(;--rt>=0;){const Tt=rt;let pt=rt-1;pt<0&&(pt=Z.length-1);for(let kt=0,Lt=u+m*2;kt<Lt;kt++){const Xt=z*kt,qt=z*(kt+1),te=ot+Tt+Xt,O=ot+pt+Xt,ve=ot+pt+qt,$t=ot+Tt+qt;gt(te,O,ve,$t)}}}function st(Z,ot,rt){l.push(Z),l.push(ot),l.push(rt)}function Bt(Z,ot,rt){Ct(Z),Ct(ot),Ct(rt);const Tt=s.length/3,pt=v.generateTopUV(n,s,Tt-3,Tt-2,Tt-1);Ot(pt[0]),Ot(pt[1]),Ot(pt[2])}function gt(Z,ot,rt,Tt){Ct(Z),Ct(ot),Ct(Tt),Ct(ot),Ct(rt),Ct(Tt);const pt=s.length/3,kt=v.generateSideWallUV(n,s,pt-6,pt-3,pt-2,pt-1);Ot(kt[0]),Ot(kt[1]),Ot(kt[3]),Ot(kt[1]),Ot(kt[2]),Ot(kt[3])}function Ct(Z){s.push(l[Z*3+0]),s.push(l[Z*3+1]),s.push(l[Z*3+2])}function Ot(Z){r.push(Z.x),r.push(Z.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return Nf(e,n,t)}static fromJSON(t,e){const n=[];for(let r=0,a=t.shapes.length;r<a;r++){const o=e[t.shapes[r]];n.push(o)}const s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new za[s.type]().fromJSON(s)),new uo(n,t.options)}}const Df={generateTopUV:function(i,t,e,n,s){const r=t[e*3],a=t[e*3+1],o=t[n*3],l=t[n*3+1],c=t[s*3],u=t[s*3+1];return[new ht(r,a),new ht(o,l),new ht(c,u)]},generateSideWallUV:function(i,t,e,n,s,r){const a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[n*3],u=t[n*3+1],f=t[n*3+2],h=t[s*3],d=t[s*3+1],p=t[s*3+2],x=t[r*3],m=t[r*3+1],g=t[r*3+2];return Math.abs(o-u)<Math.abs(a-c)?[new ht(a,1-l),new ht(c,1-f),new ht(h,1-p),new ht(x,1-g)]:[new ht(o,1-l),new ht(u,1-f),new ht(d,1-p),new ht(m,1-g)]}};function Nf(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class cr extends De{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,f=t/o,h=e/l,d=[],p=[],x=[],m=[];for(let g=0;g<u;g++){const v=g*h-a;for(let A=0;A<c;A++){const M=A*f-r;p.push(M,-v,0),x.push(0,0,1),m.push(A/o),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let v=0;v<o;v++){const A=v+c*g,M=v+c*(g+1),R=v+1+c*(g+1),y=v+1+c*g;d.push(A,M,y),d.push(M,R,y)}this.setIndex(d),this.setAttribute("position",new ce(p,3)),this.setAttribute("normal",new ce(x,3)),this.setAttribute("uv",new ce(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new cr(t.width,t.height,t.widthSegments,t.heightSegments)}}class Li extends De{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const u=[],f=new w,h=new w,d=[],p=[],x=[],m=[];for(let g=0;g<=n;g++){const v=[],A=g/n,M=a+A*o,R=t*Math.cos(M),y=Math.sqrt(t*t-R*R);let _=0;g===0&&a===0?_=.5/e:g===n&&l===Math.PI&&(_=-.5/e);for(let E=0;E<=e;E++){const L=E/e,P=s+L*r;f.x=-y*Math.cos(P),f.y=R,f.z=y*Math.sin(P),p.push(f.x,f.y,f.z),h.copy(f).normalize(),x.push(h.x,h.y,h.z),m.push(L+_,1-A),v.push(c++)}u.push(v)}for(let g=0;g<n;g++)for(let v=0;v<e;v++){const A=u[g][v+1],M=u[g][v],R=u[g+1][v],y=u[g+1][v+1];(g!==0||a>0)&&d.push(A,M,y),(g!==n-1||l<Math.PI)&&d.push(M,R,y)}this.setIndex(d),this.setAttribute("position",new ce(p,3)),this.setAttribute("normal",new ce(x,3)),this.setAttribute("uv",new ce(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Li(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class fo extends lo{constructor(t=1,e=0){const n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],s=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,s,t,e),this.type="TetrahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new fo(t.radius,t.detail)}}class Ai extends De{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);const l=[],c=[],u=[],f=[],h=new w,d=new w,p=new w;for(let x=0;x<=n;x++){const m=a+x/n*o;for(let g=0;g<=s;g++){const v=g/s*r;d.x=(t+e*Math.cos(m))*Math.cos(v),d.y=(t+e*Math.cos(m))*Math.sin(v),d.z=e*Math.sin(m),c.push(d.x,d.y,d.z),h.x=t*Math.cos(v),h.y=t*Math.sin(v),p.subVectors(d,h).normalize(),u.push(p.x,p.y,p.z),f.push(g/s),f.push(x/n)}}for(let x=1;x<=n;x++)for(let m=1;m<=s;m++){const g=(s+1)*x+m-1,v=(s+1)*(x-1)+m-1,A=(s+1)*(x-1)+m,M=(s+1)*x+m;l.push(g,v,M),l.push(v,A,M)}this.setIndex(l),this.setAttribute("position",new ce(c,3)),this.setAttribute("normal",new ce(u,3)),this.setAttribute("uv",new ce(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ai(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}}function Di(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];if(Ml(s))s.isRenderTargetTexture?(Ht("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(Ml(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function Be(i){const t={};for(let e=0;e<i.length;e++){const n=Di(i[e]);for(const s in n)t[s]=n[s]}return t}function Ml(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function If(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function rh(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ie.workingColorSpace}const Uf={clone:Di,merge:Be};var Of=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ff=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ni extends Ii{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Of,this.fragmentShader=Ff,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Di(t.uniforms),this.uniformsGroups=If(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(const n in t.uniforms){const s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new jt().setHex(s.value);break;case"v2":this.uniforms[n].value=new ht().fromArray(s.value);break;case"v3":this.uniforms[n].value=new w().fromArray(s.value);break;case"v4":this.uniforms[n].value=new ge().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Vt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new se().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(const n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}}class Bf extends ni{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Sl extends Ii{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new jt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new jt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fa,this.normalScale=new ht(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pe,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class zf extends Ii{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=uu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Hf extends Ii{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class ah extends Ee{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new jt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}}class Gf extends ah{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ee.DEFAULT_UP),this.updateMatrix(),this.groundColor=new jt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){const e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}}const Xr=new se,yl=new w,El=new w;class kf{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ht(512,512),this.mapType=qe,this.map=null,this.mapPass=null,this.matrix=new se,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new rs,this._frameExtents=new ht(1,1),this._viewportCount=1,this._viewports=[new ge(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera;yl.setFromMatrixPosition(t.matrixWorld),e.position.copy(yl),El.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(El),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){Xr.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Xr,t.coordinateSystem,t.reversedDepth);const r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===ss||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(Xr)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Bs=new w,zs=new He,on=new w;class oh extends Ee{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new se,this.projectionMatrix=new se,this.projectionMatrixInverse=new se,this.coordinateSystem=sn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Bs,zs,on),on.x===1&&on.y===1&&on.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Bs,zs,on.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Bs,zs,on),on.x===1&&on.y===1&&on.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Bs,zs,on.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const On=new w,bl=new ht,Tl=new ht;class en extends oh{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Ba*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Js*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ba*2*Math.atan(Math.tan(Js*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){On.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(On.x,On.y).multiplyScalar(-t/On.z),On.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(On.x,On.y).multiplyScalar(-t/On.z)}getViewSize(t,e){return this.getViewBounds(t,bl,Tl),e.subVectors(Tl,bl)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Js*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}class lh extends oh{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class Vf extends kf{constructor(){super(new lh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Wf extends ah{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ee.DEFAULT_UP),this.updateMatrix(),this.target=new Ee,this.shadow=new Vf}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){const e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}}const mi=-90,gi=1;class ka extends Ee{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new en(mi,gi,t,e);s.layers=this.layers,this.add(s);const r=new en(mi,gi,t,e);r.layers=this.layers,this.add(r);const a=new en(mi,gi,t,e);a.layers=this.layers,this.add(a);const o=new en(mi,gi,t,e);o.layers=this.layers,this.add(o);const l=new en(mi,gi,t,e);l.layers=this.layers,this.add(l);const c=new en(mi,gi,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===sn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ss)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,f=t.getRenderTarget(),h=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;const x=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.mipmapsAutoUpdate=x,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(f,h,d),t.xr.enabled=p,n.texture.needsPMREMUpdate=!0}}class Xf extends en{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}}const Al=new se;class Va{constructor(t,e,n=0,s=1/0){this.ray=new us(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new ro,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):ae("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Al.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Al),this}intersectObject(t,e=!0,n=[]){return Wa(t,this,n,e),n.sort(wl),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Wa(t[s],this,n,e);return n.sort(wl),n}}function wl(i,t){return i.distance-t.distance}function Wa(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let a=0,o=r.length;a<o;a++)Wa(r[a],t,e,!0)}}class Rl{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Jt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(Jt(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class Yf extends Gn{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}}function Cl(i,t,e,n){const s=qf(n);switch(e){case Ic:return i*t;case Oc:return i*t/s.components*s.byteLength;case to:return i*t/s.components*s.byteLength;case ti:return i*t*2/s.components*s.byteLength;case eo:return i*t*2/s.components*s.byteLength;case Uc:return i*t*3/s.components*s.byteLength;case pn:return i*t*4/s.components*s.byteLength;case no:return i*t*4/s.components*s.byteLength;case Xs:case Ys:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case qs:case Zs:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case la:case ha:return Math.max(i,16)*Math.max(t,8)/4;case oa:case ca:return Math.max(i,8)*Math.max(t,8)/2;case ua:case fa:case pa:case ma:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case da:case js:case ga:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case _a:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case xa:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case va:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ma:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Sa:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case ya:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Ea:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case ba:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Ta:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Aa:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case wa:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Ra:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Ca:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Pa:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case La:case Da:case Na:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Ia:case Ua:return Math.ceil(i/4)*Math.ceil(t/4)*8;case tr:case Oa:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function qf(i){switch(i){case qe:case Pc:return{byteLength:1,components:1};case is:case Lc:case xn:return{byteLength:2,components:1};case Qa:case ja:return{byteLength:2,components:4};case _n:case $a:case dn:return{byteLength:4,components:1};case Dc:case Nc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ja}}));typeof window<"u"&&(window.__THREE__?Ht("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ja);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function ch(){let i=null,t=!1,e=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Zf(i){const t=new WeakMap;function e(o,l){const c=o.array,u=o.usage,f=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,l,c){const u=l.array,f=l.updateRanges;if(i.bindBuffer(c,o),f.length===0)i.bufferSubData(c,0,u);else{f.sort((d,p)=>d.start-p.start);let h=0;for(let d=1;d<f.length;d++){const p=f[h],x=f[d];x.start<=p.start+p.count+1?p.count=Math.max(p.count,x.start+x.count-p.start):(++h,f[h]=x)}f.length=h+1;for(let d=0,p=f.length;d<p;d++){const x=f[d];i.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Kf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Jf=`#ifdef USE_ALPHAHASH
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
#endif`,$f=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Qf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,jf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,td=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ed=`#ifdef USE_AOMAP
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
#endif`,nd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,id=`#ifdef USE_BATCHING
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
#endif`,sd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,rd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ad=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,od=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,ld=`#ifdef USE_IRIDESCENCE
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
#endif`,cd=`#ifdef USE_BUMPMAP
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
#endif`,hd=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,ud=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,fd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,dd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,pd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,md=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,gd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,_d=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,xd=`#define PI 3.141592653589793
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
} // validated`,vd=`vec3 transformedNormal = objectNormal;
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
#endif`,Md=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Sd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,yd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ed=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,bd="gl_FragColor = linearToOutputTexel( gl_FragColor );",Td=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Ad=`#ifdef USE_ENVMAP
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
#endif`,wd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Rd=`#ifdef USE_ENVMAP
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
#endif`,Cd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Pd=`#ifdef USE_ENVMAP
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
#endif`,Ld=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Dd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Nd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Id=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ud=`#ifdef USE_GRADIENTMAP
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
}`,Od=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Fd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Bd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,zd=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Hd=`#ifdef USE_ENVMAP
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
#endif`,Gd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,kd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Vd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Wd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Xd=`PhysicalMaterial material;
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
#endif`,Yd=`uniform sampler2D dfgLUT;
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
}`,qd=`
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
#endif`,Zd=`#if defined( RE_IndirectDiffuse )
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
#endif`,Kd=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Jd=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,$d=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Qd=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,jd=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,tp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,ep=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,np=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ip=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,sp=`#if defined( USE_POINTS_UV )
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
#endif`,rp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ap=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,op=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,lp=`#if defined( USE_MORPHCOLORS )
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
#endif`,cp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hp=`#ifdef USE_MORPHTARGETS
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
#endif`,up=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,fp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,dp=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,pp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,mp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,_p=`#ifdef USE_NORMALMAP
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
#endif`,xp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,vp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Mp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Sp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,yp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ep=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,bp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Tp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ap=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,wp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Rp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Cp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Pp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Lp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Dp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Np=`float getShadowMask() {
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
}`,Ip=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Up=`#ifdef USE_SKINNING
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
#endif`,Op=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Fp=`#ifdef USE_SKINNING
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
#endif`,Bp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,zp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Hp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Gp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,kp=`#ifdef USE_TRANSMISSION
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
#endif`,Vp=`#ifdef USE_TRANSMISSION
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
#endif`,Wp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Xp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Yp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,qp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Zp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Kp=`uniform sampler2D t2D;
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
}`,Jp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,$p=`uniform float backgroundBlurriness;
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
}`,Qp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,jp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tm=`#include <common>
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
}`,em=`#if DEPTH_PACKING == 3200
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
}`,nm=`#define DISTANCE
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
}`,im=`#define DISTANCE
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
}`,sm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,rm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,am=`uniform float scale;
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
}`,om=`uniform vec3 diffuse;
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
}`,lm=`#include <common>
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
}`,cm=`uniform vec3 diffuse;
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
}`,hm=`#define LAMBERT
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
}`,um=`#define LAMBERT
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
}`,fm=`#define MATCAP
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
}`,dm=`#define MATCAP
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
}`,pm=`#define NORMAL
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
}`,mm=`#define NORMAL
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
}`,gm=`#define PHONG
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
}`,_m=`#define PHONG
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
}`,xm=`#define STANDARD
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
}`,vm=`#define STANDARD
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
}`,Mm=`#define TOON
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
}`,Sm=`#define TOON
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
}`,ym=`uniform float size;
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
}`,Em=`uniform vec3 diffuse;
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
}`,bm=`#include <common>
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
}`,Tm=`uniform vec3 color;
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
}`,Am=`uniform float rotation;
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
}`,wm=`uniform vec3 diffuse;
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
}`,Kt={alphahash_fragment:Kf,alphahash_pars_fragment:Jf,alphamap_fragment:$f,alphamap_pars_fragment:Qf,alphatest_fragment:jf,alphatest_pars_fragment:td,aomap_fragment:ed,aomap_pars_fragment:nd,batching_pars_vertex:id,batching_vertex:sd,begin_vertex:rd,beginnormal_vertex:ad,bsdfs:od,iridescence_fragment:ld,bumpmap_pars_fragment:cd,clipping_planes_fragment:hd,clipping_planes_pars_fragment:ud,clipping_planes_pars_vertex:fd,clipping_planes_vertex:dd,color_fragment:pd,color_pars_fragment:md,color_pars_vertex:gd,color_vertex:_d,common:xd,defaultnormal_vertex:vd,displacementmap_pars_vertex:Md,displacementmap_vertex:Sd,emissivemap_fragment:yd,emissivemap_pars_fragment:Ed,colorspace_fragment:bd,colorspace_pars_fragment:Td,envmap_fragment:Ad,envmap_common_pars_fragment:wd,envmap_pars_fragment:Rd,envmap_pars_vertex:Cd,envmap_physical_pars_fragment:Hd,envmap_vertex:Pd,fog_vertex:Ld,fog_pars_vertex:Dd,fog_fragment:Nd,fog_pars_fragment:Id,gradientmap_pars_fragment:Ud,lightmap_pars_fragment:Od,lights_lambert_fragment:Fd,lights_lambert_pars_fragment:Bd,lights_pars_begin:zd,lights_toon_fragment:Gd,lights_toon_pars_fragment:kd,lights_phong_fragment:Vd,lights_phong_pars_fragment:Wd,lights_physical_fragment:Xd,lights_physical_pars_fragment:Yd,lights_fragment_begin:qd,lights_fragment_maps:Zd,lights_fragment_end:Kd,lightprobes_pars_fragment:Jd,logdepthbuf_fragment:$d,logdepthbuf_pars_fragment:Qd,logdepthbuf_pars_vertex:jd,logdepthbuf_vertex:tp,map_fragment:ep,map_pars_fragment:np,map_particle_fragment:ip,map_particle_pars_fragment:sp,metalnessmap_fragment:rp,metalnessmap_pars_fragment:ap,morphinstance_vertex:op,morphcolor_vertex:lp,morphnormal_vertex:cp,morphtarget_pars_vertex:hp,morphtarget_vertex:up,normal_fragment_begin:fp,normal_fragment_maps:dp,normal_pars_fragment:pp,normal_pars_vertex:mp,normal_vertex:gp,normalmap_pars_fragment:_p,clearcoat_normal_fragment_begin:xp,clearcoat_normal_fragment_maps:vp,clearcoat_pars_fragment:Mp,iridescence_pars_fragment:Sp,opaque_fragment:yp,packing:Ep,premultiplied_alpha_fragment:bp,project_vertex:Tp,dithering_fragment:Ap,dithering_pars_fragment:wp,roughnessmap_fragment:Rp,roughnessmap_pars_fragment:Cp,shadowmap_pars_fragment:Pp,shadowmap_pars_vertex:Lp,shadowmap_vertex:Dp,shadowmask_pars_fragment:Np,skinbase_vertex:Ip,skinning_pars_vertex:Up,skinning_vertex:Op,skinnormal_vertex:Fp,specularmap_fragment:Bp,specularmap_pars_fragment:zp,tonemapping_fragment:Hp,tonemapping_pars_fragment:Gp,transmission_fragment:kp,transmission_pars_fragment:Vp,uv_pars_fragment:Wp,uv_pars_vertex:Xp,uv_vertex:Yp,worldpos_vertex:qp,background_vert:Zp,background_frag:Kp,backgroundCube_vert:Jp,backgroundCube_frag:$p,cube_vert:Qp,cube_frag:jp,depth_vert:tm,depth_frag:em,distance_vert:nm,distance_frag:im,equirect_vert:sm,equirect_frag:rm,linedashed_vert:am,linedashed_frag:om,meshbasic_vert:lm,meshbasic_frag:cm,meshlambert_vert:hm,meshlambert_frag:um,meshmatcap_vert:fm,meshmatcap_frag:dm,meshnormal_vert:pm,meshnormal_frag:mm,meshphong_vert:gm,meshphong_frag:_m,meshphysical_vert:xm,meshphysical_frag:vm,meshtoon_vert:Mm,meshtoon_frag:Sm,points_vert:ym,points_frag:Em,shadow_vert:bm,shadow_frag:Tm,sprite_vert:Am,sprite_frag:wm},wt={common:{diffuse:{value:new jt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Vt}},envmap:{envMap:{value:null},envMapRotation:{value:new Vt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Vt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Vt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Vt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Vt},normalScale:{value:new ht(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Vt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Vt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Vt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Vt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new jt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new jt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0},uvTransform:{value:new Vt}},sprite:{diffuse:{value:new jt(16777215)},opacity:{value:1},center:{value:new ht(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}}},hn={basic:{uniforms:Be([wt.common,wt.specularmap,wt.envmap,wt.aomap,wt.lightmap,wt.fog]),vertexShader:Kt.meshbasic_vert,fragmentShader:Kt.meshbasic_frag},lambert:{uniforms:Be([wt.common,wt.specularmap,wt.envmap,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.fog,wt.lights,{emissive:{value:new jt(0)},envMapIntensity:{value:1}}]),vertexShader:Kt.meshlambert_vert,fragmentShader:Kt.meshlambert_frag},phong:{uniforms:Be([wt.common,wt.specularmap,wt.envmap,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.fog,wt.lights,{emissive:{value:new jt(0)},specular:{value:new jt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Kt.meshphong_vert,fragmentShader:Kt.meshphong_frag},standard:{uniforms:Be([wt.common,wt.envmap,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.roughnessmap,wt.metalnessmap,wt.fog,wt.lights,{emissive:{value:new jt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Kt.meshphysical_vert,fragmentShader:Kt.meshphysical_frag},toon:{uniforms:Be([wt.common,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.gradientmap,wt.fog,wt.lights,{emissive:{value:new jt(0)}}]),vertexShader:Kt.meshtoon_vert,fragmentShader:Kt.meshtoon_frag},matcap:{uniforms:Be([wt.common,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.fog,{matcap:{value:null}}]),vertexShader:Kt.meshmatcap_vert,fragmentShader:Kt.meshmatcap_frag},points:{uniforms:Be([wt.points,wt.fog]),vertexShader:Kt.points_vert,fragmentShader:Kt.points_frag},dashed:{uniforms:Be([wt.common,wt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Kt.linedashed_vert,fragmentShader:Kt.linedashed_frag},depth:{uniforms:Be([wt.common,wt.displacementmap]),vertexShader:Kt.depth_vert,fragmentShader:Kt.depth_frag},normal:{uniforms:Be([wt.common,wt.bumpmap,wt.normalmap,wt.displacementmap,{opacity:{value:1}}]),vertexShader:Kt.meshnormal_vert,fragmentShader:Kt.meshnormal_frag},sprite:{uniforms:Be([wt.sprite,wt.fog]),vertexShader:Kt.sprite_vert,fragmentShader:Kt.sprite_frag},background:{uniforms:{uvTransform:{value:new Vt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Kt.background_vert,fragmentShader:Kt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Vt}},vertexShader:Kt.backgroundCube_vert,fragmentShader:Kt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Kt.cube_vert,fragmentShader:Kt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Kt.equirect_vert,fragmentShader:Kt.equirect_frag},distance:{uniforms:Be([wt.common,wt.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Kt.distance_vert,fragmentShader:Kt.distance_frag},shadow:{uniforms:Be([wt.lights,wt.fog,{color:{value:new jt(0)},opacity:{value:1}}]),vertexShader:Kt.shadow_vert,fragmentShader:Kt.shadow_frag}};hn.physical={uniforms:Be([hn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Vt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Vt},clearcoatNormalScale:{value:new ht(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Vt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Vt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Vt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Vt},sheen:{value:0},sheenColor:{value:new jt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Vt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Vt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Vt},transmissionSamplerSize:{value:new ht},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Vt},attenuationDistance:{value:0},attenuationColor:{value:new jt(0)},specularColor:{value:new jt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Vt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Vt},anisotropyVector:{value:new ht},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Vt}}]),vertexShader:Kt.meshphysical_vert,fragmentShader:Kt.meshphysical_frag};const Hs={r:0,b:0,g:0},Rm=new se,hh=new Vt;hh.set(-1,0,0,0,1,0,0,0,1);function Cm(i,t,e,n,s,r){const a=new jt(0);let o=s===!0?0:1,l,c,u=null,f=0,h=null;function d(v){let A=v.isScene===!0?v.background:null;if(A&&A.isTexture){const M=v.backgroundBlurriness>0;A=t.get(A,M)}return A}function p(v){let A=!1;const M=d(v);M===null?m(a,o):M&&M.isColor&&(m(M,1),A=!0);const R=i.xr.getEnvironmentBlendMode();R==="additive"?e.buffers.color.setClear(0,0,0,1,r):R==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||A)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(v,A){const M=d(A);M&&M.isCubeTexture?(c===void 0&&(c=new rn(new ii(1,1,1),new ni({name:"BackgroundCubeMaterial",uniforms:Di(hn.backgroundCube.uniforms),vertexShader:hn.backgroundCube.vertexShader,fragmentShader:hn.backgroundCube.fragmentShader,side:Ve,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(R,y,_){this.matrixWorld.copyPosition(_.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=M,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Rm.makeRotationFromEuler(A.backgroundRotation)).transpose(),M.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(hh),c.material.toneMapped=ie.getTransfer(M.colorSpace)!==ue,(u!==M||f!==M.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=M,f=M.version,h=i.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new rn(new cr(2,2),new ni({name:"BackgroundMaterial",uniforms:Di(hn.background.uniforms),vertexShader:hn.background.vertexShader,fragmentShader:hn.background.fragmentShader,side:jn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=ie.getTransfer(M.colorSpace)!==ue,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||f!==M.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=M,f=M.version,h=i.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null))}function m(v,A){v.getRGB(Hs,rh(i)),e.buffers.color.setClear(Hs.r,Hs.g,Hs.b,A,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(v,A=1){a.set(v),o=A,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(v){o=v,m(a,o)},render:p,addToRenderList:x,dispose:g}}function Pm(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null);let r=s,a=!1;function o(D,H,X,T,I){let B=!1;const z=f(D,T,X,H);r!==z&&(r=z,c(r.object)),B=d(D,T,X,I),B&&p(D,T,X,I),I!==null&&t.update(I,i.ELEMENT_ARRAY_BUFFER),(B||a)&&(a=!1,M(D,H,X,T),I!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(I).buffer))}function l(){return i.createVertexArray()}function c(D){return i.bindVertexArray(D)}function u(D){return i.deleteVertexArray(D)}function f(D,H,X,T){const I=T.wireframe===!0;let B=n[H.id];B===void 0&&(B={},n[H.id]=B);const z=D.isInstancedMesh===!0?D.id:0;let J=B[z];J===void 0&&(J={},B[z]=J);let G=J[X.id];G===void 0&&(G={},J[X.id]=G);let q=G[I];return q===void 0&&(q=h(l()),G[I]=q),q}function h(D){const H=[],X=[],T=[];for(let I=0;I<e;I++)H[I]=0,X[I]=0,T[I]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:H,enabledAttributes:X,attributeDivisors:T,object:D,attributes:{},index:null}}function d(D,H,X,T){const I=r.attributes,B=H.attributes;let z=0;const J=X.getAttributes();for(const G in J)if(J[G].location>=0){const $=I[G];let lt=B[G];if(lt===void 0&&(G==="instanceMatrix"&&D.instanceMatrix&&(lt=D.instanceMatrix),G==="instanceColor"&&D.instanceColor&&(lt=D.instanceColor)),$===void 0||$.attribute!==lt||lt&&$.data!==lt.data)return!0;z++}return r.attributesNum!==z||r.index!==T}function p(D,H,X,T){const I={},B=H.attributes;let z=0;const J=X.getAttributes();for(const G in J)if(J[G].location>=0){let $=B[G];$===void 0&&(G==="instanceMatrix"&&D.instanceMatrix&&($=D.instanceMatrix),G==="instanceColor"&&D.instanceColor&&($=D.instanceColor));const lt={};lt.attribute=$,$&&$.data&&(lt.data=$.data),I[G]=lt,z++}r.attributes=I,r.attributesNum=z,r.index=T}function x(){const D=r.newAttributes;for(let H=0,X=D.length;H<X;H++)D[H]=0}function m(D){g(D,0)}function g(D,H){const X=r.newAttributes,T=r.enabledAttributes,I=r.attributeDivisors;X[D]=1,T[D]===0&&(i.enableVertexAttribArray(D),T[D]=1),I[D]!==H&&(i.vertexAttribDivisor(D,H),I[D]=H)}function v(){const D=r.newAttributes,H=r.enabledAttributes;for(let X=0,T=H.length;X<T;X++)H[X]!==D[X]&&(i.disableVertexAttribArray(X),H[X]=0)}function A(D,H,X,T,I,B,z){z===!0?i.vertexAttribIPointer(D,H,X,I,B):i.vertexAttribPointer(D,H,X,T,I,B)}function M(D,H,X,T){x();const I=T.attributes,B=X.getAttributes(),z=H.defaultAttributeValues;for(const J in B){const G=B[J];if(G.location>=0){let q=I[J];if(q===void 0&&(J==="instanceMatrix"&&D.instanceMatrix&&(q=D.instanceMatrix),J==="instanceColor"&&D.instanceColor&&(q=D.instanceColor)),q!==void 0){const $=q.normalized,lt=q.itemSize,at=t.get(q);if(at===void 0)continue;const F=at.buffer,j=at.type,ft=at.bytesPerElement,mt=j===i.INT||j===i.UNSIGNED_INT||q.gpuType===$a;if(q.isInterleavedBufferAttribute){const it=q.data,st=it.isInterleavedBuffer===!0?it.stride:it.itemSize,Bt=q.offset;if(it.isInstancedInterleavedBuffer||it.isInstancedBufferAttribute){for(let gt=0;gt<G.locationSize;gt++)g(G.location+gt,it.meshPerAttribute);D.isInstancedMesh!==!0&&T._maxInstanceCount===void 0&&(T._maxInstanceCount=it.meshPerAttribute*it.count)}else for(let gt=0;gt<G.locationSize;gt++)m(G.location+gt);i.bindBuffer(i.ARRAY_BUFFER,F);for(let gt=0;gt<G.locationSize;gt++)A(G.location+gt,lt/G.locationSize,j,$,st*ft,(Bt+lt/G.locationSize*gt)*ft,mt)}else{if(q.isInstancedBufferAttribute){for(let it=0;it<G.locationSize;it++)g(G.location+it,q.meshPerAttribute);D.isInstancedMesh!==!0&&T._maxInstanceCount===void 0&&(T._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let it=0;it<G.locationSize;it++)m(G.location+it);i.bindBuffer(i.ARRAY_BUFFER,F);for(let it=0;it<G.locationSize;it++)A(G.location+it,lt/G.locationSize,j,$,lt*ft,lt/G.locationSize*it*ft,mt)}}else if(z!==void 0){const $=z[J];if($!==void 0)switch($.length){case 2:i.vertexAttrib2fv(G.location,$);break;case 3:i.vertexAttrib3fv(G.location,$);break;case 4:i.vertexAttrib4fv(G.location,$);break;default:i.vertexAttrib1fv(G.location,$)}}}}v()}function R(){L();for(const D in n){const H=n[D];for(const X in H){const T=H[X];for(const I in T){const B=T[I];for(const z in B)u(B[z].object),delete B[z];delete T[I]}}delete n[D]}}function y(D){if(n[D.id]===void 0)return;const H=n[D.id];for(const X in H){const T=H[X];for(const I in T){const B=T[I];for(const z in B)u(B[z].object),delete B[z];delete T[I]}}delete n[D.id]}function _(D){for(const H in n){const X=n[H];for(const T in X){const I=X[T];if(I[D.id]===void 0)continue;const B=I[D.id];for(const z in B)u(B[z].object),delete B[z];delete I[D.id]}}}function E(D){for(const H in n){const X=n[H],T=D.isInstancedMesh===!0?D.id:0,I=X[T];if(I!==void 0){for(const B in I){const z=I[B];for(const J in z)u(z[J].object),delete z[J];delete I[B]}delete X[T],Object.keys(X).length===0&&delete n[H]}}}function L(){P(),a=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:L,resetDefaultState:P,dispose:R,releaseStatesOfGeometry:y,releaseStatesOfObject:E,releaseStatesOfProgram:_,initAttributes:x,enableAttribute:m,disableUnusedAttributes:v}}function Lm(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),e.update(c,n,u))}function o(l,c,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let d=0;d<u;d++)h+=c[d];e.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Dm(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const _=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(_.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(_){return!(_!==pn&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(_){const E=_===xn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(_!==qe&&_!==dn&&!E&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(_){if(_==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";_="mediump"}return _==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const u=l(c);u!==c&&(Ht("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const f=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),h=e.logarithmicDepthBuffer===!0&&f===!1;e.reversedDepthBuffer===!0&&f===!1&&Ht("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),e.logarithmicDepthBuffer===!0&&f===!0&&Ht("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),v=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=i.getParameter(i.MAX_SAMPLES),y=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:p,maxTextureSize:x,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:v,maxVaryings:A,maxFragmentUniforms:M,maxSamples:R,samples:y}}function Nm(i){const t=this;let e=null,n=0,s=!1,r=!1;const a=new cn,o=new Vt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){const d=f.length!==0||h||n!==0||s;return s=h,n=f.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){e=u(f,h,0)},this.setState=function(f,h,d){const p=f.clippingPlanes,x=f.clipIntersection,m=f.clipShadows,g=i.get(f);if(!s||p===null||p.length===0||r&&!m)r?u(null):c();else{const v=r?0:n,A=v*4;let M=g.clippingState||null;l.value=M,M=u(p,h,A,d);for(let R=0;R!==A;++R)M[R]=e[R];g.clippingState=M,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(f,h,d,p){const x=f!==null?f.length:0;let m=null;if(x!==0){if(m=l.value,p!==!0||m===null){const g=d+x*4,v=h.matrixWorldInverse;o.getNormalMatrix(v),(m===null||m.length<g)&&(m=new Float32Array(g));for(let A=0,M=d;A!==x;++A,M+=4)a.copy(f[A]).applyMatrix4(v,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,m}}class po extends mn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new qc(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ii(5,5,5),r=new ni({name:"CubemapFromEquirect",uniforms:Di(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ve,blending:bi});r.uniforms.tEquirect.value=e;const a=new rn(s,r),o=e.minFilter;return e.minFilter===Bn&&(e.minFilter=ke),new ka(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}}const Pl=256,Im=3,Um=20,uh=256,fh=16,Om=3,Fm=new w,Bm=new jt;class ar{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new ka(1,10,null),this._boxMesh=new rn(new ii(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){const{size:a=256,position:o=Fm}=r,l=this._renderer;this._setSize(a);const c=this._allocateTarget(),u=this._getSourceTarget(!0);e>0&&(u.texture.mipmapsAutoUpdate=!1);const f=l.autoClear,h=l.autoClearColor,d=l.autoClearDepth,p=l.autoClearStencil,x=t.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,x===null&&(t.background=l.getClearColor(Bm));const m=new ka(n,s,u);return m.position.copy(o),m.update(l,t),l.autoClear=f,l.autoClearColor=h,l.autoClearDepth=d,l.autoClearStencil=p,t.background=x,e>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,e)),this._applyPMREM(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Nl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Dl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(Pl,Tu(t))}_fromTexture(t,e){t.mapping===wi||t.mapping===ns?this._setSize(t.image.length===0?Pl:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4);const n=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(n),n}_allocateTarget(){const t=this._cubeSize,e=Ll(t,!1,!1),n=Math.log2(t)-Im;for(let s=0;s<=n;s++)e.texture.mipmaps.push({width:t>>s,height:t>>s});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){const e=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==e||t&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Ll(e,!0,t)),this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,n){const s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=t,r.activeMipmapLevel=e;const a=t.width>>e;t.viewport.set(0,0,a,a),r.update(this._renderer,s),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;t.mapping===wi||t.mapping===ns?(this._cubemapMaterial===null&&(this._cubemapMaterial=Nl()),e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Dl()),e=this._equirectMaterial),e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=zm(),this._integrationMaterial=Hm());const e=this._cubeSize,n=t.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;const r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(e/fh);for(let a=0;a<=n;a++){const o=ar.lodToRoughness(a,n);if(a>n-Om)r.roughness.value=o,this._renderCube(t,a,this._integrationMaterial);else{const l=o>0?Math.log2(e)+.5*Math.log2(6/(uh*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(t,a,this._ggxMaterial)}}}_blur(t,e){this._blurMaterial===null&&(this._blurMaterial=Gm());const n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(t,0,n),s.envMap.value=t.texture,this._renderCube(r,0,n)}}function Ll(i,t,e){return new po(i,{minFilter:Bn,generateMipmaps:t,type:xn,colorSpace:er,depthBuffer:e})}function fs(i,t,e){return new ni({name:i,uniforms:t,vertexShader:Kt.cube_vert,fragmentShader:e,side:Ve,blending:bi,depthTest:!1,depthWrite:!1})}function zm(){return fs("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${uh}u

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
	`)}function Hm(){return fs("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:fh}},`

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
	`)}function Gm(){return fs("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Um}
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
	`)}function Dl(){return fs("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function Nl(){return fs("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function km(i){let t=new WeakMap,e=new WeakMap,n=null;function s(h,d=!1){return h==null?null:d?a(h):r(h)}function r(h){if(h&&h.isTexture){const d=h.mapping;if(d===gr||d===_r)if(t.has(h)){const p=t.get(h).texture;return o(p,h.mapping)}else{const p=h.image;if(p&&p.height>0){const x=new po(p.height);return x.fromEquirectangularTexture(i,h),t.set(h,x),h.addEventListener("dispose",c),o(x.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){const d=h.mapping,p=d===gr||d===_r,x=d===wi||d===ns;if(p||x){let m=e.get(h);const g=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==g)return n===null&&(n=new ar(i)),m=p?n.fromEquirectangular(h,m):n.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,e.set(h,m),m.texture;if(m!==void 0)return m.texture;{const v=h.image;return p&&v&&v.height>0||x&&v&&l(v)?(n===null&&(n=new ar(i)),m=p?n.fromEquirectangular(h):n.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,e.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function o(h,d){return d===gr?h.mapping=wi:d===_r&&(h.mapping=ns),h}function l(h){let d=0;const p=6;for(let x=0;x<p;x++)h[x]!==void 0&&d++;return d===p}function c(h){const d=h.target;d.removeEventListener("dispose",c);const p=t.get(d);p!==void 0&&(t.delete(d),p.dispose())}function u(h){const d=h.target;d.removeEventListener("dispose",u);const p=e.get(d);p!==void 0&&(e.delete(d),p.dispose())}function f(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function Vm(i){const t={};function e(n){if(t[n]!==void 0)return t[n];const s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&Ks("WebGLRenderer: "+n+" extension not supported."),s}}}function Wm(i,t,e,n){const s={},r=new WeakMap,a=new FinalizationRegistry(p=>delete s[p]);function o(p){l(p.target)}function l(p){p.index!==null&&t.remove(p.index);for(const m in p.attributes)t.remove(p.attributes[m]);p.removeEventListener("dispose",o),delete s[p.id],a.unregister(p);const x=r.get(p);x&&(t.remove(x),r.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,e.memory.geometries--}function c(p,x){return s[x.id]!==void 0||(x.addEventListener("dispose",o),s[x.id]=new WeakRef(x),a.register(x,x.id,x),e.memory.geometries++),x}function u(p){const x=p.attributes;for(const m in x)t.update(x[m],i.ARRAY_BUFFER)}function f(p){const x=p.index,m=p.attributes.position;let g=0;if(m===void 0)return;const v=x!==null?x.array.length:m.array.length/3-1,A=m.count>=65535?Wc:Vc,M=new A(Math.ceil(v/3)*6,1),R=M.array;if(x!==null){const _=x.array;g=x.version;for(let E=0,L=0;E<v;E+=3){const P=_[E+0],D=_[E+1],H=_[E+2];R[L++]=P,R[L++]=D,R[L++]=D,R[L++]=H,R[L++]=H,R[L++]=P}}else{g=m.version;for(let _=0,E=0;_<v;_+=3){const L=_+0,P=_+1,D=_+2;R[E++]=L,R[E++]=P,R[E++]=P,R[E++]=D,R[E++]=D,R[E++]=L}}M.version=g;const y=r.get(p);y&&t.remove(y),r.set(p,M)}function h(p){const x=r.get(p);if(x){const m=p.index;m!==null&&x.version<m.version&&f(p)}else f(p);return r.get(p)}function d(){for(const p in s){const x=s[p].deref();x!==void 0&&l(x)}}return{get:c,update:u,getWireframeAttribute:h,dispose:d}}function Xm(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,h){i.drawElements(n,h,r,f*a),e.update(h,n,1)}function c(f,h,d){d!==0&&(i.drawElementsInstanced(n,h,r,f*a,d),e.update(h,n,d))}function u(f,h,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,f,0,d);let x=0;for(let m=0;m<d;m++)x+=h[m];e.update(x,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Ym(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:ae("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function qm(i,t,e){const n=new WeakMap,s=new ge;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0;let h=n.get(o);if(h===void 0||h.count!==f){let L=function(){_.dispose(),n.delete(o),o.removeEventListener("dispose",L)};h!==void 0&&h.texture.dispose();const d=o.morphAttributes.position!==void 0,p=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],v=o.morphAttributes.color||[];let A=0;d===!0&&(A=1),p===!0&&(A=2),x===!0&&(A=3);let M=o.attributes.position.count*A,R=1;M>t.maxTextureSize&&(R=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);const y=new Float32Array(M*R*4*f),_=new Gc(y,M,R,f);_.type=dn,_.needsUpdate=!0;const E=A*4;for(let P=0;P<f;P++){const D=m[P],H=g[P],X=v[P],T=M*R*4*P;for(let I=0;I<D.count;I++){const B=I*E;d===!0&&(s.fromBufferAttribute(D,I),y[T+B+0]=s.x,y[T+B+1]=s.y,y[T+B+2]=s.z,y[T+B+3]=0),p===!0&&(s.fromBufferAttribute(H,I),y[T+B+4]=s.x,y[T+B+5]=s.y,y[T+B+6]=s.z,y[T+B+7]=0),x===!0&&(s.fromBufferAttribute(X,I),y[T+B+8]=s.x,y[T+B+9]=s.y,y[T+B+10]=s.z,y[T+B+11]=X.itemSize===4?s.w:1)}}h={count:f,texture:_,size:new ht(M,R)},n.set(o,h),o.addEventListener("dispose",L)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let d=0;for(let x=0;x<c.length;x++)d+=c[x];const p=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",p),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function Zm(i,t,e,n,s){let r=new WeakMap;function a(c){const u=s.render.frame,f=c.geometry,h=t.get(c,f);if(r.get(h)!==u&&(t.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){const d=c.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return h}function o(){r=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),e.remove(u.instanceMatrix),u.instanceColor!==null&&e.remove(u.instanceColor)}return{update:a,dispose:o}}const Km={[yc]:"LINEAR_TONE_MAPPING",[Ec]:"REINHARD_TONE_MAPPING",[bc]:"CINEON_TONE_MAPPING",[Tc]:"ACES_FILMIC_TONE_MAPPING",[wc]:"AGX_TONE_MAPPING",[Rc]:"NEUTRAL_TONE_MAPPING",[Ac]:"CUSTOM_TONE_MAPPING"};function Jm(i,t,e,n,s,r){const a=new mn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,l=null,c=null;const u=new De;u.setAttribute("position",new ce([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new ce([0,2,0,0,2,0],2));const f=new Bf({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new rn(u,f),d=new lh(-1,1,1,-1,0,1);let p=null,x=null,m=!1,g,v=null,A=[],M=!1;this.setSize=function(R,y){a.setSize(R,y),o!==null&&o.setSize(R,y),l!==null&&l.setSize(R,y);for(let _=0;_<A.length;_++){const E=A[_];E.setSize&&E.setSize(R,y)}},this.setEffects=function(R){A=R,M=A.length>0&&A[0].isRenderPass===!0;const y=a.width,_=a.height;A.length>0&&o===null&&(o=new mn(y,_,{type:xn,depthBuffer:!1,stencilBuffer:!1}),l=new mn(y,_,{type:xn,depthBuffer:!1,stencilBuffer:!1}));const E=s===!0&&A.some(L=>L.needsDepthTexture===!0);E!==(a.depthTexture!==null)&&(E===!0&&c===null&&(c=new Ci(y,_),r===!0&&(c.format=zn,c.type=Ri)),a.dispose(),a.depthTexture=E?c:null,a.resolveDepthBuffer=E,a.storeMultisampledDepthBuffer=E);for(let L=0;L<A.length;L++){const P=A[L];P.setSize&&P.setSize(y,_),E&&P.needsDepthTexture===!0&&P.setDepthTexture&&P.setDepthTexture(c)}},this.begin=function(R,y){if(m||R.toneMapping===Rn&&A.length===0)return!1;if(v=y,y!==null){const _=y.width,E=y.height;(a.width!==_||a.height!==E)&&this.setSize(_,E)}return M===!1&&R.setRenderTarget(a),g=R.toneMapping,R.toneMapping=Rn,!0},this.hasRenderPass=function(){return M},this.end=function(R,y){R.toneMapping=g,m=!0;let _=a,E=o;for(let L=0;L<A.length;L++){const P=A[L];P.enabled!==!1&&(P.render(R,E,_,y),P.needsSwap!==!1&&(_=E,E=E===o?l:o))}if(p!==R.outputColorSpace||x!==R.toneMapping){p=R.outputColorSpace,x=R.toneMapping,f.defines={},ie.getTransfer(p)===ue&&(f.defines.SRGB_TRANSFER="");const L=Km[x];L&&(f.defines[L]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=_.texture,R.setRenderTarget(v),R.render(h,d),v=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),u.dispose(),f.dispose()}}const dh=new ze,ph=new Ci(1,1),mh=new Zc(1),gh=new Gc,_h=new Iu,xh=new qc,Il=[],Ul=[],Ol=new Float32Array(16),Fl=new Float32Array(9),Bl=new Float32Array(4);function Ui(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=Il[s];if(r===void 0&&(r=new Float32Array(s),Il[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function be(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Te(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function hr(i,t){let e=Ul[t];e===void 0&&(e=new Int32Array(t),Ul[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function $m(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Qm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(be(e,t))return;i.uniform2fv(this.addr,t),Te(e,t)}}function jm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(be(e,t))return;i.uniform3fv(this.addr,t),Te(e,t)}}function tg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(be(e,t))return;i.uniform4fv(this.addr,t),Te(e,t)}}function eg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(be(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Te(e,t)}else{if(be(e,n))return;Bl.set(n),i.uniformMatrix2fv(this.addr,!1,Bl),Te(e,n)}}function ng(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(be(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Te(e,t)}else{if(be(e,n))return;Fl.set(n),i.uniformMatrix3fv(this.addr,!1,Fl),Te(e,n)}}function ig(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(be(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Te(e,t)}else{if(be(e,n))return;Ol.set(n),i.uniformMatrix4fv(this.addr,!1,Ol),Te(e,n)}}function sg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function rg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(be(e,t))return;i.uniform2iv(this.addr,t),Te(e,t)}}function ag(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(be(e,t))return;i.uniform3iv(this.addr,t),Te(e,t)}}function og(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(be(e,t))return;i.uniform4iv(this.addr,t),Te(e,t)}}function lg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function cg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(be(e,t))return;i.uniform2uiv(this.addr,t),Te(e,t)}}function hg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(be(e,t))return;i.uniform3uiv(this.addr,t),Te(e,t)}}function ug(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(be(e,t))return;i.uniform4uiv(this.addr,t),Te(e,t)}}function ur(i){return i.version===0&&(i.compareFunction=zc,i.needsUpdate=!0),i}function fg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=ur(ph):r=dh,e.setTexture2D(t||r,s)}function dg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||_h,s)}function pg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=ur(mh):r=xh,e.setTextureCube(t||r,s)}function mg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||gh,s)}function gg(i){switch(i){case 5126:return $m;case 35664:return Qm;case 35665:return jm;case 35666:return tg;case 35674:return eg;case 35675:return ng;case 35676:return ig;case 5124:case 35670:return sg;case 35667:case 35671:return rg;case 35668:case 35672:return ag;case 35669:case 35673:return og;case 5125:return lg;case 36294:return cg;case 36295:return hg;case 36296:return ug;case 35678:case 36198:case 36298:case 36306:case 35682:return fg;case 35679:case 36299:case 36307:return dg;case 35680:case 36300:case 36308:case 36293:return pg;case 36289:case 36303:case 36311:case 36292:return mg}}function _g(i,t){i.uniform1fv(this.addr,t)}function xg(i,t){const e=Ui(t,this.size,2);i.uniform2fv(this.addr,e)}function vg(i,t){const e=Ui(t,this.size,3);i.uniform3fv(this.addr,e)}function Mg(i,t){const e=Ui(t,this.size,4);i.uniform4fv(this.addr,e)}function Sg(i,t){const e=Ui(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function yg(i,t){const e=Ui(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Eg(i,t){const e=Ui(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function bg(i,t){i.uniform1iv(this.addr,t)}function Tg(i,t){i.uniform2iv(this.addr,t)}function Ag(i,t){i.uniform3iv(this.addr,t)}function wg(i,t){i.uniform4iv(this.addr,t)}function Rg(i,t){i.uniform1uiv(this.addr,t)}function Cg(i,t){i.uniform2uiv(this.addr,t)}function Pg(i,t){i.uniform3uiv(this.addr,t)}function Lg(i,t){i.uniform4uiv(this.addr,t)}function Dg(i,t,e){const n=this.cache,s=t.length,r=hr(e,s);be(n,r)||(i.uniform1iv(this.addr,r),Te(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=ur(ph):a=dh;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function Ng(i,t,e){const n=this.cache,s=t.length,r=hr(e,s);be(n,r)||(i.uniform1iv(this.addr,r),Te(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||_h,r[a])}function Ig(i,t,e){const n=this.cache,s=t.length,r=hr(e,s);be(n,r)||(i.uniform1iv(this.addr,r),Te(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=ur(mh):a=xh;for(let o=0;o!==s;++o)e.setTextureCube(t[o]||a,r[o])}function Ug(i,t,e){const n=this.cache,s=t.length,r=hr(e,s);be(n,r)||(i.uniform1iv(this.addr,r),Te(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||gh,r[a])}function Og(i){switch(i){case 5126:return _g;case 35664:return xg;case 35665:return vg;case 35666:return Mg;case 35674:return Sg;case 35675:return yg;case 35676:return Eg;case 5124:case 35670:return bg;case 35667:case 35671:return Tg;case 35668:case 35672:return Ag;case 35669:case 35673:return wg;case 5125:return Rg;case 36294:return Cg;case 36295:return Pg;case 36296:return Lg;case 35678:case 36198:case 36298:case 36306:case 35682:return Dg;case 35679:case 36299:case 36307:return Ng;case 35680:case 36300:case 36308:case 36293:return Ig;case 36289:case 36303:case 36311:case 36292:return Ug}}class Fg{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=gg(e.type)}}class Bg{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Og(e.type)}}class zg{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(t,e[o.id],n)}}}const Yr=/(\w+)(\])?(\[|\.)?/g;function zl(i,t){i.seq.push(t),i.map[t.id]=t}function Hg(i,t,e){const n=i.name,s=n.length;for(Yr.lastIndex=0;;){const r=Yr.exec(n),a=Yr.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){zl(e,c===void 0?new Fg(o,i,t):new Bg(o,i,t));break}else{let f=e.map[o];f===void 0&&(f=new zg(o),zl(e,f)),e=f}}}class $s{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);Hg(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const a=t[s];a.id in e&&n.push(a)}return n}}function Hl(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const Gg=37297;let kg=0;function Vg(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const Gl=new Vt;function Wg(i){ie._getMatrix(Gl,ie.workingColorSpace,i);const t=`mat3( ${Gl.elements.map(e=>e.toFixed(4))} )`;switch(ie.getTransfer(i)){case nr:return[t,"LinearTransferOETF"];case ue:return[t,"sRGBTransferOETF"];default:return Ht("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function kl(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+Vg(i.getShaderSource(t),o)}else return r}function Xg(i,t){const e=Wg(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( ${e[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const Yg={[yc]:"Linear",[Ec]:"Reinhard",[bc]:"Cineon",[Tc]:"ACESFilmic",[wc]:"AgX",[Rc]:"Neutral",[Ac]:"Custom"};function qg(i,t){const e=Yg[t];return e===void 0?(Ht("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Gs=new w;function Zg(){ie.getLuminanceCoefficients(Gs);const i=Gs.x.toFixed(4),t=Gs.y.toFixed(4),e=Gs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Kg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Yi).join(`
`)}function Jg(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function $g(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Yi(i){return i!==""}function Vl(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function Wl(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Qg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Xa(i){return i.replace(Qg,jg)}function jg(i,t){const e=Kt[t];if(e===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">");return Xa(e)}const t0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Xl(i){return i.replace(t0,e0)}function e0(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Yl(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}const n0={[Ws]:"SHADOWMAP_TYPE_PCF",[Wi]:"SHADOWMAP_TYPE_VSM"};function i0(i){return n0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const s0={[ns]:"ENVMAP_MODE_REFRACTION"};function r0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":s0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const a0={[Sc]:"ENVMAP_BLENDING_MULTIPLY",[lu]:"ENVMAP_BLENDING_MIX",[cu]:"ENVMAP_BLENDING_ADD"};function o0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":a0[i.combine]||"ENVMAP_BLENDING_NONE"}function l0(i,t,e,n){const s=i.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=i0(e),c=e.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=r0(e),f=o0(e),h=Kg(e),d=Jg(r),p=s.createProgram();let x,m,g=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(x=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,d].filter(Yi).join(`
`),x.length>0&&(x+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,d].filter(Yi).join(`
`),m.length>0&&(m+=`
`)):(x=[Yl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,d,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+e.diffuseRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Yi).join(`
`),m=[Yl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,d,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+f:"",e.envMapPMREM?"#define ENVMAP_MAX_LOD "+e.envMapMaxLod+".0":"",e.envMapPMREM?"#define ENVMAP_SIZE "+e.envMapSize+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Rn?"#define TONE_MAPPING":"",e.toneMapping!==Rn?Kt.tonemapping_pars_fragment:"",e.toneMapping!==Rn?qg("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Kt.colorspace_pars_fragment,Xg("linearToOutputTexel",e.outputColorSpace),Zg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Yi).join(`
`)),a=Xa(a),a=Vl(a,e),a=Wl(a,e),o=Xa(o),o=Vl(o,e),o=Wl(o,e),a=Xl(a),o=Xl(o),e.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,x=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,m=["#define varying in",e.glslVersion===Xo?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Xo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const v=g+x+a,A=g+m+o,M=Hl(s,s.VERTEX_SHADER,v),R=Hl(s,s.FRAGMENT_SHADER,A);s.attachShader(p,M),s.attachShader(p,R),e.index0AttributeName!==void 0?s.bindAttribLocation(p,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(p,0,"position"),s.linkProgram(p);function y(P){if(i.debug.checkShaderErrors){const D=s.getProgramInfoLog(p)||"",H=s.getShaderInfoLog(M)||"",X=s.getShaderInfoLog(R)||"",T=D.trim(),I=H.trim(),B=X.trim();let z=!0,J=!0;if(s.getProgramParameter(p,s.LINK_STATUS)===!1)if(z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,p,M,R);else{const G=kl(s,M,"vertex"),q=kl(s,R,"fragment");ae("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(p,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+T+`
`+G+`
`+q)}else T!==""?Ht("WebGLProgram: Program Info Log:",T):(I===""||B==="")&&(J=!1);J&&(P.diagnostics={runnable:z,programLog:T,vertexShader:{log:I,prefix:x},fragmentShader:{log:B,prefix:m}})}s.deleteShader(M),s.deleteShader(R),_=new $s(s,p),E=$g(s,p)}let _;this.getUniforms=function(){return _===void 0&&y(this),_};let E;this.getAttributes=function(){return E===void 0&&y(this),E};let L=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=s.getProgramParameter(p,Gg)),L},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(p),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=kg++,this.cacheKey=t,this.usedTimes=1,this.program=p,this.vertexShader=M,this.fragmentShader=R,this}let c0=0;class h0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){const s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new u0(t),e.set(t,n)),n}}class u0{constructor(t){this.id=c0++,this.code=t,this.usedTimes=0}}function f0(i){return i===ti||i===js||i===tr}function d0(i,t,e,n,s,r){const a=new ro,o=new h0,l=new Set,c=[],u=new Map,f=n.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function d(_){return l.add(_),_===0?"uv":`uv${_}`}function p(_,E,L,P,D,H){const X=P.fog,T=D.geometry,I=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?P.environment:null,B=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,z=t.get(_.envMap||I,B),J=h[_.type];let G=n.precision;_.precision!==null&&(G=n.getMaxPrecision(_.precision),G!==_.precision&&Ht("WebGLProgram.getParameters:",_.precision,"not supported, using",G,"instead."));const q=T.morphAttributes.position||T.morphAttributes.normal||T.morphAttributes.color,$=q!==void 0?q.length:0;let lt=0;T.morphAttributes.position!==void 0&&(lt=1),T.morphAttributes.normal!==void 0&&(lt=2),T.morphAttributes.color!==void 0&&(lt=3);let at,F,j,ft;if(J){const At=hn[J];at=At.vertexShader,F=At.fragmentShader}else{at=_.vertexShader,F=_.fragmentShader;const At=o.getVertexShaderStage(_),he=o.getFragmentShaderStage(_);o.update(_,At,he),j=At.id,ft=he.id}const mt=i.getRenderTarget(),it=i.state.buffers.depth.getReversed(),st=D.isInstancedMesh===!0,Bt=D.isBatchedMesh===!0,gt=!!_.map,Ct=!!_.matcap,Ot=!!z,Z=Ot&&z.isPMREMTexture===!0,ot=!!_.aoMap,rt=!!_.lightMap,Tt=!!_.bumpMap&&_.wireframe===!1,pt=!!_.normalMap,kt=!!_.displacementMap,Lt=!!_.emissiveMap,Xt=!!_.metalnessMap,qt=!!_.roughnessMap,te=_.anisotropy>0,O=_.clearcoat>0,ve=_.diffuseRoughness>0,$t=_.dispersion>0,fe=_.retroreflectivity>0,yt=_.iridescence>0,xe=_.sheen>0,zt=_.transmission>0,Gt=te&&!!_.anisotropyMap,C=O&&!!_.clearcoatMap,S=O&&!!_.clearcoatNormalMap,V=O&&!!_.clearcoatRoughnessMap,ct=ve&&!!_.diffuseRoughnessMap,nt=yt&&!!_.iridescenceMap,_t=yt&&!!_.iridescenceThicknessMap,Et=xe&&!!_.sheenColorMap,Q=xe&&!!_.sheenRoughnessMap,tt=!!_.specularMap,vt=!!_.specularColorMap,N=!!_.specularIntensityMap,et=zt&&!!_.transmissionMap,K=zt&&!!_.thicknessMap,Mt=!!_.gradientMap,dt=!!_.alphaMap,xt=_.alphaTest>0,Ut=!!_.alphaHash,Zt=!!_.extensions;let ut=Rn;_.toneMapped&&(mt===null||mt.isXRRenderTarget===!0)&&(ut=i.toneMapping);const Ft=Z?z.isCompressedCubeTexture?z.image[0].mipmaps:z.mipmaps:null,Yt={shaderID:J,shaderType:_.type,shaderName:_.name,vertexShader:at,fragmentShader:F,defines:_.defines,customVertexShaderID:j,customFragmentShaderID:ft,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:G,batching:Bt,batchingColor:Bt&&D._colorsTexture!==null,instancing:st,instancingColor:st&&D.instanceColor!==null,instancingMorph:st&&D.morphTexture!==null,outputColorSpace:mt===null?i.outputColorSpace:mt.isXRRenderTarget===!0?mt.texture.colorSpace:ie.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:gt,matcap:Ct,envMap:Ot,envMapMode:Ot&&z.mapping,envMapPMREM:Z,envMapMaxLod:Z?Ft.length-1:null,envMapSize:Z?Ft[0].width:null,aoMap:ot,lightMap:rt,bumpMap:Tt,normalMap:pt,displacementMap:kt,emissiveMap:Lt,normalMapObjectSpace:pt&&_.normalMapType===fu,normalMapTangentSpace:pt&&_.normalMapType===Fa,packedNormalMap:pt&&_.normalMapType===Fa&&f0(_.normalMap.format),metalnessMap:Xt,roughnessMap:qt,anisotropy:te,anisotropyMap:Gt,clearcoat:O,clearcoatMap:C,clearcoatNormalMap:S,clearcoatRoughnessMap:V,diffuseRoughness:ve,diffuseRoughnessMap:ct,dispersion:$t,retroreflection:fe,iridescence:yt,iridescenceMap:nt,iridescenceThicknessMap:_t,sheen:xe,sheenColorMap:Et,sheenRoughnessMap:Q,specularMap:tt,specularColorMap:vt,specularIntensityMap:N,transmission:zt,transmissionMap:et,thicknessMap:K,gradientMap:Mt,opaque:_.transparent===!1&&_.blending===Ji&&_.alphaToCoverage===!1,alphaMap:dt,alphaTest:xt,alphaHash:Ut,combine:_.combine,mapUv:gt&&d(_.map.channel),aoMapUv:ot&&d(_.aoMap.channel),lightMapUv:rt&&d(_.lightMap.channel),bumpMapUv:Tt&&d(_.bumpMap.channel),normalMapUv:pt&&d(_.normalMap.channel),displacementMapUv:kt&&d(_.displacementMap.channel),emissiveMapUv:Lt&&d(_.emissiveMap.channel),metalnessMapUv:Xt&&d(_.metalnessMap.channel),roughnessMapUv:qt&&d(_.roughnessMap.channel),anisotropyMapUv:Gt&&d(_.anisotropyMap.channel),clearcoatMapUv:C&&d(_.clearcoatMap.channel),clearcoatNormalMapUv:S&&d(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:V&&d(_.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ct&&d(_.diffuseRoughnessMap.channel),iridescenceMapUv:nt&&d(_.iridescenceMap.channel),iridescenceThicknessMapUv:_t&&d(_.iridescenceThicknessMap.channel),sheenColorMapUv:Et&&d(_.sheenColorMap.channel),sheenRoughnessMapUv:Q&&d(_.sheenRoughnessMap.channel),specularMapUv:tt&&d(_.specularMap.channel),specularColorMapUv:vt&&d(_.specularColorMap.channel),specularIntensityMapUv:N&&d(_.specularIntensityMap.channel),transmissionMapUv:et&&d(_.transmissionMap.channel),thicknessMapUv:K&&d(_.thicknessMap.channel),alphaMapUv:dt&&d(_.alphaMap.channel),vertexTangents:!!T.attributes.tangent&&(pt||te),vertexNormals:!!T.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!T.attributes.color&&T.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!T.attributes.uv&&(gt||dt),fog:!!X,useFog:_.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||T.attributes.normal===void 0&&pt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:it,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:T.attributes.position!==void 0,morphTargets:T.morphAttributes.position!==void 0,morphNormals:T.morphAttributes.normal!==void 0,morphColors:T.morphAttributes.color!==void 0,morphTargetsCount:$,morphTextureStride:lt,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:H.filter(At=>At.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:ut,decodeVideoTexture:gt&&_.map.isVideoTexture===!0&&ie.getTransfer(_.map.colorSpace)===ue,decodeVideoTextureEmissive:Lt&&_.emissiveMap.isVideoTexture===!0&&ie.getTransfer(_.emissiveMap.colorSpace)===ue,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===An,flipSided:_.side===Ve,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Zt&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Zt&&_.extensions.multiDraw===!0||Bt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Yt.vertexUv1s=l.has(1),Yt.vertexUv2s=l.has(2),Yt.vertexUv3s=l.has(3),l.clear(),Yt}function x(_){const E=[];if(_.shaderID?E.push(_.shaderID):(E.push(_.customVertexShaderID),E.push(_.customFragmentShaderID)),_.defines!==void 0)for(const L in _.defines)E.push(L),E.push(_.defines[L]);return _.isRawShaderMaterial===!1&&(m(E,_),g(E,_),E.push(i.outputColorSpace)),E.push(_.customProgramCacheKey),E.join()}function m(_,E){_.push(E.precision),_.push(E.outputColorSpace),_.push(E.envMapMode),_.push(E.envMapPMREM),_.push(E.envMapMaxLod),_.push(E.envMapSize),_.push(E.mapUv),_.push(E.alphaMapUv),_.push(E.lightMapUv),_.push(E.aoMapUv),_.push(E.bumpMapUv),_.push(E.normalMapUv),_.push(E.displacementMapUv),_.push(E.emissiveMapUv),_.push(E.metalnessMapUv),_.push(E.roughnessMapUv),_.push(E.anisotropyMapUv),_.push(E.clearcoatMapUv),_.push(E.clearcoatNormalMapUv),_.push(E.clearcoatRoughnessMapUv),_.push(E.diffuseRoughnessMapUv),_.push(E.iridescenceMapUv),_.push(E.iridescenceThicknessMapUv),_.push(E.sheenColorMapUv),_.push(E.sheenRoughnessMapUv),_.push(E.specularMapUv),_.push(E.specularColorMapUv),_.push(E.specularIntensityMapUv),_.push(E.transmissionMapUv),_.push(E.thicknessMapUv),_.push(E.combine),_.push(E.fogExp2),_.push(E.sizeAttenuation),_.push(E.morphTargetsCount),_.push(E.numSunLights),_.push(E.numDirLights),_.push(E.numPointLights),_.push(E.numSpotLights),_.push(E.numSpotLightMaps),_.push(E.numHemiLights),_.push(E.numRectAreaLights),_.push(E.numSunLightShadows),_.push(E.numDirLightShadows),_.push(E.numPointLightShadows),_.push(E.numSpotLightShadows),_.push(E.numSpotLightShadowsWithMaps),_.push(E.numLightProbes),_.push(E.numLightProbeGrids),_.push(E.shadowMapType),_.push(E.toneMapping),_.push(E.numClippingPlanes),_.push(E.numClipIntersection),_.push(E.depthPacking)}function g(_,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.retroreflection&&a.enable(24),E.diffuseRoughness&&a.enable(25),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),E.packedNormalMap&&a.enable(22),E.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),E.numLightProbeGrids>0&&a.enable(22),E.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function v(_){const E=h[_.type];let L;if(E){const P=hn[E];L=Uf.clone(P.uniforms)}else L=_.uniforms;return L}function A(_,E){let L=u.get(E);return L!==void 0?++L.usedTimes:(L=new l0(i,E,_,s),c.push(L),u.set(E,L)),L}function M(_){if(--_.usedTimes===0){const E=c.indexOf(_);c[E]=c[c.length-1],c.pop(),u.delete(_.cacheKey),_.destroy()}}function R(_){o.remove(_)}function y(){o.dispose()}return{getParameters:p,getProgramCacheKey:x,getUniforms:v,acquireProgram:A,releaseProgram:M,releaseShaderCache:R,programs:c,dispose:y}}function p0(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function m0(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function ql(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Zl(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(h){let d=0;return h.isInstancedMesh&&(d+=2),h.isSkinnedMesh&&(d+=1),d}function o(h,d,p,x,m,g){let v=i[t];return v===void 0?(v={id:h.id,object:h,geometry:d,material:p,materialVariant:a(h),groupOrder:x,renderOrder:h.renderOrder,z:m,group:g},i[t]=v):(v.id=h.id,v.object=h,v.geometry=d,v.material=p,v.materialVariant=a(h),v.groupOrder=x,v.renderOrder=h.renderOrder,v.z=m,v.group=g),t++,v}function l(h,d,p,x,m,g,v){v.reversedDepth===!0&&(m=-m);const A=o(h,d,p,x,m,g);p.transmission>0?n.push(A):p.transparent===!0?s.push(A):e.push(A)}function c(h,d,p,x,m,g){const v=o(h,d,p,x,m,g);p.transmission>0?n.unshift(v):p.transparent===!0?s.unshift(v):e.unshift(v)}function u(h,d){e.length>1&&e.sort(h||m0),n.length>1&&n.sort(d||ql),s.length>1&&s.sort(d||ql)}function f(){for(let h=t,d=i.length;h<d;h++){const p=i[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:f,sort:u}}function g0(){let i=new WeakMap;function t(n,s){const r=i.get(n);let a;return r===void 0?(a=new Zl,i.set(n,[a])):s>=r.length?(a=new Zl,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function _0(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new w,color:new jt};break;case"SpotLight":e={position:new w,direction:new w,color:new jt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new w,color:new jt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new w,skyColor:new jt,groundColor:new jt};break;case"RectAreaLight":e={color:new jt,position:new w,halfWidth:new w,halfHeight:new w};break}return i[t.id]=e,e}}}function x0(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let v0=0;function M0(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function S0(i){const t=new _0,e=x0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new w);const s=new w,r=new se,a=new se;function o(c){let u=0,f=0,h=0;for(let H=0;H<9;H++)n.probe[H].set(0,0,0);let d=0,p=0,x=0,m=0,g=0,v=0,A=0,M=0,R=0,y=0,_=0,E=0,L=0,P=0;c.sort(M0);for(let H=0,X=c.length;H<X;H++){const T=c[H],I=T.color,B=T.intensity,z=T.distance;let J=null;if(T.shadow&&T.shadow.map&&(T.shadow.map.texture.format===ti?J=T.shadow.map.texture:J=T.shadow.map.depthTexture||T.shadow.map.texture),T.isAmbientLight)u+=I.r*B,f+=I.g*B,h+=I.b*B;else if(T.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(T.sh.coefficients[G],B);P++}else if(T.isSunLight){const G=t.get(T);if(G.color.copy(T.color).multiplyScalar(T.intensity),T.castShadow){const q=T.shadow,$=e.get(T);$.shadowIntensity=q.intensity,$.shadowBias=q.bias,$.shadowNormalBias=q.normalBias,$.shadowRadius=q.radius,$.shadowMapSize.copy(q.mapSize).multiply(q.getFrameExtents()),n.sunShadow[p]=$,n.sunShadowMap[p]=J;const lt=q.getViewportCount();for(let at=0;at<lt;at++)n.sunShadowMatrix[x+at]=q.getMatrix(at),n.sunShadowCascade[x+at]=q._cascadeData[at];x+=lt,p++}n.sun[d]=G,d++}else if(T.isDirectionalLight){const G=t.get(T);if(G.color.copy(T.color).multiplyScalar(T.intensity),T.castShadow){const q=T.shadow,$=e.get(T);$.shadowIntensity=q.intensity,$.shadowBias=q.bias,$.shadowNormalBias=q.normalBias,$.shadowRadius=q.radius,$.shadowMapSize=q.mapSize,n.directionalShadow[m]=$,n.directionalShadowMap[m]=J,n.directionalShadowMatrix[m]=T.shadow.matrix,R++}n.directional[m]=G,m++}else if(T.isSpotLight){const G=t.get(T);G.position.setFromMatrixPosition(T.matrixWorld),G.color.copy(I).multiplyScalar(B),G.distance=z,G.coneCos=Math.cos(T.angle),G.penumbraCos=Math.cos(T.angle*(1-T.penumbra)),G.decay=T.decay,n.spot[v]=G;const q=T.shadow;if(T.map&&(n.spotLightMap[E]=T.map,E++,q.updateMatrices(T),T.castShadow&&L++),n.spotLightMatrix[v]=q.matrix,T.castShadow){const $=e.get(T);$.shadowIntensity=q.intensity,$.shadowBias=q.bias,$.shadowNormalBias=q.normalBias,$.shadowRadius=q.radius,$.shadowMapSize=q.mapSize,n.spotShadow[v]=$,n.spotShadowMap[v]=J,_++}v++}else if(T.isRectAreaLight){const G=t.get(T);G.color.copy(I).multiplyScalar(B),G.halfWidth.set(T.width*.5,0,0),G.halfHeight.set(0,T.height*.5,0),n.rectArea[A]=G,A++}else if(T.isPointLight){const G=t.get(T);if(G.color.copy(T.color).multiplyScalar(T.intensity),G.distance=T.distance,G.decay=T.decay,T.castShadow){const q=T.shadow,$=e.get(T);$.shadowIntensity=q.intensity,$.shadowBias=q.bias,$.shadowNormalBias=q.normalBias,$.shadowRadius=q.radius,$.shadowMapSize=q.mapSize,$.shadowCameraNear=q.camera.near,$.shadowCameraFar=q.camera.far,n.pointShadow[g]=$,n.pointShadowMap[g]=J,n.pointShadowMatrix[g]=T.shadow.matrix,y++}n.point[g]=G,g++}else if(T.isHemisphereLight){const G=t.get(T);G.skyColor.copy(T.color).multiplyScalar(B),G.groundColor.copy(T.groundColor).multiplyScalar(B),n.hemi[M]=G,M++}}A>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=wt.LTC_FLOAT_1,n.rectAreaLTC2=wt.LTC_FLOAT_2):(n.rectAreaLTC1=wt.LTC_HALF_1,n.rectAreaLTC2=wt.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=h;const D=n.hash;(D.sunLength!==d||D.directionalLength!==m||D.pointLength!==g||D.spotLength!==v||D.rectAreaLength!==A||D.hemiLength!==M||D.numSunShadows!==p||D.numDirectionalShadows!==R||D.numPointShadows!==y||D.numSpotShadows!==_||D.numSpotMaps!==E||D.numLightProbes!==P)&&(n.sun.length=d,n.directional.length=m,n.spot.length=v,n.rectArea.length=A,n.point.length=g,n.hemi.length=M,n.sunShadow.length=p,n.sunShadowMap.length=p,n.sunShadowMatrix.length=x,n.sunShadowCascade.length=x,n.directionalShadow.length=R,n.directionalShadowMap.length=R,n.directionalShadowMatrix.length=R,n.pointShadow.length=y,n.pointShadowMap.length=y,n.pointShadowMatrix.length=y,n.spotShadow.length=_,n.spotShadowMap.length=_,n.spotLightMatrix.length=_+E-L,n.spotLightMap.length=E,n.numSpotLightShadowsWithMaps=L,n.numLightProbes=P,D.sunLength=d,D.directionalLength=m,D.pointLength=g,D.spotLength=v,D.rectAreaLength=A,D.hemiLength=M,D.numSunShadows=p,D.numDirectionalShadows=R,D.numPointShadows=y,D.numSpotShadows=_,D.numSpotMaps=E,D.numLightProbes=P,n.version=v0++)}function l(c,u){let f=0,h=0,d=0,p=0,x=0,m=0;const g=u.matrixWorldInverse;for(let v=0,A=c.length;v<A;v++){const M=c[v];if(M.isSunLight){const R=n.sun[f];R.direction.setFromMatrixPosition(M.matrixWorld),R.direction.transformDirection(g),f++}else if(M.isDirectionalLight){const R=n.directional[h];R.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),R.direction.sub(s),R.direction.transformDirection(g),h++}else if(M.isSpotLight){const R=n.spot[p];R.position.setFromMatrixPosition(M.matrixWorld),R.position.applyMatrix4(g),R.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),R.direction.sub(s),R.direction.transformDirection(g),p++}else if(M.isRectAreaLight){const R=n.rectArea[x];R.position.setFromMatrixPosition(M.matrixWorld),R.position.applyMatrix4(g),a.identity(),r.copy(M.matrixWorld),r.premultiply(g),a.extractRotation(r),R.halfWidth.set(M.width*.5,0,0),R.halfHeight.set(0,M.height*.5,0),R.halfWidth.applyMatrix4(a),R.halfHeight.applyMatrix4(a),x++}else if(M.isPointLight){const R=n.point[d];R.position.setFromMatrixPosition(M.matrixWorld),R.position.applyMatrix4(g),d++}else if(M.isHemisphereLight){const R=n.hemi[m];R.direction.setFromMatrixPosition(M.matrixWorld),R.direction.transformDirection(g),m++}}}return{setup:o,setupView:l,state:n}}function Kl(i){const t=new S0(i),e=[],n=[],s=[];function r(f){u.camera=f,e.length=0,n.length=0,s.length=0}function a(f){f.isLightProbeGrid?s.push(f):e.push(f)}function o(f){n.push(f)}function l(){t.setup(e),s.sort((f,h)=>f.priority-h.priority||f.id-h.id)}function c(f){t.setupView(e,f)}const u={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function y0(i){let t=new WeakMap;function e(s,r=0){const a=t.get(s);let o;return a===void 0?(o=new Kl(i),t.set(s,[o])):r>=a.length?(o=new Kl(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}const E0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,b0=`uniform sampler2D shadow_pass;
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
}`,T0=[new w(1,0,0),new w(-1,0,0),new w(0,1,0),new w(0,-1,0),new w(0,0,1),new w(0,0,-1)],A0=[new w(0,-1,0),new w(0,-1,0),new w(0,0,1),new w(0,0,-1),new w(0,-1,0),new w(0,-1,0)],Jl=new se,ki=new w,qr=new w;function w0(i,t,e){let n=new rs;const s=new ht,r=new ht,a=new ge,o=new zf,l=new Hf,c={},u=e.maxTextureSize,f={[jn]:Ve,[Ve]:jn,[An]:An},h=new ni({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ht},radius:{value:4}},vertexShader:E0,fragmentShader:b0}),d=h.clone();d.defines.HORIZONTAL_PASS=1;const p=new De;p.setAttribute("position",new gn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new rn(p,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ws;let g=this.type;this.render=function(y,_,E){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||y.length===0)return;this.type===Vh&&(Ht("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ws);const L=i.getRenderTarget(),P=i.getActiveCubeFace(),D=i.getActiveMipmapLevel(),H=i.state;H.setBlending(bi),H.buffers.depth.getReversed()===!0?H.buffers.color.setClear(0,0,0,0):H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);const X=g!==this.type;X&&_.traverse(function(T){T.material&&(Array.isArray(T.material)?T.material.forEach(I=>I.needsUpdate=!0):T.material.needsUpdate=!0)});for(let T=0,I=y.length;T<I;T++){const B=y[T],z=B.shadow;if(z===void 0){Ht("WebGLShadowMap:",B,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);const J=z.getFrameExtents();s.multiply(J),r.copy(z.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/J.x),s.x=r.x*J.x,z.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/J.y),s.y=r.y*J.y,z.mapSize.y=r.y));const G=i.state.buffers.depth.getReversed();if(z.camera._reversedDepth=G,z.map===null||X===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===Wi){if(B.isPointLight){Ht("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new mn(s.x,s.y,{format:ti,type:xn,minFilter:ke,magFilter:ke,generateMipmaps:!1}),z.map.texture.name=B.name+".shadowMap",z.map.depthTexture=new Ci(s.x,s.y,dn),z.map.depthTexture.name=B.name+".shadowMapDepth",z.map.depthTexture.format=Hn,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Le,z.map.depthTexture.magFilter=Le}else B.isPointLight?(z.map=new po(s.x),z.map.depthTexture=new Zc(s.x,_n)):(z.map=new mn(s.x,s.y),z.map.depthTexture=new Ci(s.x,s.y,_n)),z.map.depthTexture.name=B.name+".shadowMap",z.map.depthTexture.format=Hn,this.type===Ws?(z.map.depthTexture.compareFunction=G?Bc:Fc,z.map.depthTexture.minFilter=ke,z.map.depthTexture.magFilter=ke):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Le,z.map.depthTexture.magFilter=Le);z.camera.updateProjectionMatrix()}z.map.isWebGLCubeRenderTarget!==!0&&(z.map.width!==s.x||z.map.height!==s.y)&&z.map.setSize(s.x,s.y);const q=z.map.isWebGLCubeRenderTarget?6:z.getViewportCount();B.isPointLight!==!0&&z.updateMatrices(B,E);const $=(z.camera.layers.mask&4294967294)!==0?z.camera.layers:E.layers;for(let lt=0;lt<q;lt++){const at=z.getCamera(lt);if(B.isPointLight){const F=z.camera,j=z.matrix,ft=B.distance||F.far;ft!==F.far&&(F.far=ft,F.updateProjectionMatrix()),ki.setFromMatrixPosition(B.matrixWorld),F.position.copy(ki),qr.copy(F.position),qr.add(T0[lt]),F.up.copy(A0[lt]),F.lookAt(qr),F.updateMatrixWorld(),j.makeTranslation(-ki.x,-ki.y,-ki.z),Jl.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),z._frustum.setFromProjectionMatrix(Jl,F.coordinateSystem,F.reversedDepth)}if(z.map.isWebGLCubeRenderTarget)i.setRenderTarget(z.map,lt),i.clear();else{lt===0&&(i.setRenderTarget(z.map),i.clear());const F=z.getViewport(lt);a.set(r.x*F.x,r.y*F.y,r.x*F.z,r.y*F.w),H.viewport(a)}n=z.getFrustum(lt),M(_,E,at,B,$,this.type)}z.isPointLightShadow!==!0&&this.type===Wi&&v(z,E),z.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(L,P,D)};function v(y,_){const E=t.update(x);h.defines.VSM_SAMPLES!==y.blurSamples&&(h.defines.VSM_SAMPLES=y.blurSamples,d.defines.VSM_SAMPLES=y.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),y.mapPass===null?y.mapPass=new mn(s.x,s.y,{format:ti,type:xn}):(y.mapPass.width!==y.map.width||y.mapPass.height!==y.map.height)&&y.mapPass.setSize(y.map.width,y.map.height),h.uniforms.shadow_pass.value=y.map.depthTexture,h.uniforms.resolution.value.set(y.map.width,y.map.height),h.uniforms.radius.value=y.radius,i.setRenderTarget(y.mapPass),i.clear(),i.renderBufferDirect(_,null,E,h,x,null),d.uniforms.shadow_pass.value=y.mapPass.texture,d.uniforms.resolution.value.set(y.map.width,y.map.height),d.uniforms.radius.value=y.radius,i.setRenderTarget(y.map),i.clear(),i.renderBufferDirect(_,null,E,d,x,null)}function A(y,_,E,L){let P=null;const D=E.isPointLight===!0?y.customDistanceMaterial:y.customDepthMaterial;if(D!==void 0)P=D;else if(P=E.isPointLight===!0?l:o,i.localClippingEnabled&&_.clipShadows===!0&&Array.isArray(_.clippingPlanes)&&_.clippingPlanes.length!==0||_.displacementMap&&_.displacementScale!==0||_.alphaMap&&_.alphaTest>0||_.map&&_.alphaTest>0||_.alphaToCoverage===!0){const H=P.uuid,X=_.uuid;let T=c[H];T===void 0&&(T={},c[H]=T);let I=T[X];I===void 0&&(I=P.clone(),T[X]=I,_.addEventListener("dispose",R)),P=I}if(P.visible=_.visible,P.wireframe=_.wireframe,L===Wi?P.side=_.shadowSide!==null?_.shadowSide:_.side:P.side=_.shadowSide!==null?_.shadowSide:f[_.side],P.alphaMap=_.alphaMap,P.alphaTest=_.alphaToCoverage===!0?.5:_.alphaTest,P.map=_.map,P.clipShadows=_.clipShadows,P.clippingPlanes=_.clippingPlanes,P.clipIntersection=_.clipIntersection,P.displacementMap=_.displacementMap,P.displacementScale=_.displacementScale,P.displacementBias=_.displacementBias,P.wireframeLinewidth=_.wireframeLinewidth,P.linewidth=_.linewidth,E.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const H=i.properties.get(P);H.light=E}return P}function M(y,_,E,L,P,D){if(y.visible===!1)return;if(y.layers.test(P)&&(y.isMesh||y.isLine||y.isPoints)&&(y.castShadow||y.receiveShadow&&D===Wi)&&(!y.frustumCulled||y.intersectsFrustum(n))){y.modelViewMatrix.multiplyMatrices(E.matrixWorldInverse,y.matrixWorld);const T=t.update(y),I=y.material;if(Array.isArray(I)){const B=T.groups;for(let z=0,J=B.length;z<J;z++){const G=B[z],q=I[G.materialIndex];if(q&&q.visible){const $=A(y,q,L,D);y.onBeforeShadow(i,y,_,E,T,$,G),i.renderBufferDirect(E,null,T,$,y,G),y.onAfterShadow(i,y,_,E,T,$,G)}}}else if(I.visible){const B=A(y,I,L,D);y.onBeforeShadow(i,y,_,E,T,B,null),i.renderBufferDirect(E,null,T,B,y,null),y.onAfterShadow(i,y,_,E,T,B,null)}}const X=y.children;for(let T=0,I=X.length;T<I;T++)M(X[T],_,E,L,P,D)}function R(y){y.target.removeEventListener("dispose",R);for(const E in c){const L=c[E],P=y.target.uuid;P in L&&(L[P].dispose(),delete L[P])}}}function R0(i,t){function e(){let N=!1;const et=new ge;let K=null;const Mt=new ge(0,0,0,0);return{setMask:function(dt){K!==dt&&!N&&(i.colorMask(dt,dt,dt,dt),K=dt)},setLocked:function(dt){N=dt},setClear:function(dt,xt,Ut,Zt,ut){ut===!0&&(dt*=Zt,xt*=Zt,Ut*=Zt),et.set(dt,xt,Ut,Zt),Mt.equals(et)===!1&&(i.clearColor(dt,xt,Ut,Zt),Mt.copy(et))},reset:function(){N=!1,K=null,Mt.set(-1,0,0,0)}}}function n(){let N=!1,et=!1,K=null,Mt=null,dt=null;return{setReversed:function(xt){if(et!==xt){const Ut=t.get("EXT_clip_control");xt?Ut.clipControlEXT(Ut.LOWER_LEFT_EXT,Ut.ZERO_TO_ONE_EXT):Ut.clipControlEXT(Ut.LOWER_LEFT_EXT,Ut.NEGATIVE_ONE_TO_ONE_EXT),et=xt;const Zt=dt;dt=null,this.setClear(Zt)}},getReversed:function(){return et},setTest:function(xt){xt?it(i.DEPTH_TEST):st(i.DEPTH_TEST)},setMask:function(xt){K!==xt&&!N&&(i.depthMask(xt),K=xt)},setFunc:function(xt){if(et&&(xt=Eu[xt]),Mt!==xt){switch(xt){case Qr:i.depthFunc(i.NEVER);break;case jr:i.depthFunc(i.ALWAYS);break;case ta:i.depthFunc(i.LESS);break;case es:i.depthFunc(i.LEQUAL);break;case ea:i.depthFunc(i.EQUAL);break;case na:i.depthFunc(i.GEQUAL);break;case ia:i.depthFunc(i.GREATER);break;case sa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Mt=xt}},setLocked:function(xt){N=xt},setClear:function(xt){dt!==xt&&(dt=xt,et&&(xt=1-xt),i.clearDepth(xt))},reset:function(){N=!1,K=null,Mt=null,dt=null,et=!1}}}function s(){let N=!1,et=null,K=null,Mt=null,dt=null,xt=null,Ut=null,Zt=null,ut=null;return{setTest:function(Ft){N||(Ft?it(i.STENCIL_TEST):st(i.STENCIL_TEST))},setMask:function(Ft){et!==Ft&&!N&&(i.stencilMask(Ft),et=Ft)},setFunc:function(Ft,Yt,At){(K!==Ft||Mt!==Yt||dt!==At)&&(i.stencilFunc(Ft,Yt,At),K=Ft,Mt=Yt,dt=At)},setOp:function(Ft,Yt,At){(xt!==Ft||Ut!==Yt||Zt!==At)&&(i.stencilOp(Ft,Yt,At),xt=Ft,Ut=Yt,Zt=At)},setLocked:function(Ft){N=Ft},setClear:function(Ft){ut!==Ft&&(i.clearStencil(Ft),ut=Ft)},reset:function(){N=!1,et=null,K=null,Mt=null,dt=null,xt=null,Ut=null,Zt=null,ut=null}}}const r=new e,a=new n,o=new s;let l={};const c=new WeakMap;let u={},f={},h={},d=new WeakMap,p=[],x=null,m=!1,g=null,v=null,A=null,M=null,R=null,y=null,_=null,E=new jt(0,0,0),L=0,P=!1,D=null,H=null,X=null,T=null,I=null;const B=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,J=0;const G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(J=parseFloat(/^WebGL (\d)/.exec(G)[1]),z=J>=1):G.indexOf("OpenGL ES")!==-1&&(J=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),z=J>=2);let q=null,$={};const lt=i.getParameter(i.SCISSOR_BOX),at=i.getParameter(i.VIEWPORT),F=new ge().fromArray(lt),j=new ge().fromArray(at);function ft(N,et,K,Mt){const dt=new Uint8Array(4),xt=i.createTexture();i.bindTexture(N,xt),i.texParameteri(N,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(N,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ut=0;Ut<K;Ut++)N===i.TEXTURE_3D||N===i.TEXTURE_2D_ARRAY?i.texImage3D(et,0,i.RGBA,1,1,Mt,0,i.RGBA,i.UNSIGNED_BYTE,dt):i.texImage2D(et+Ut,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,dt);return xt}const mt={};mt[i.TEXTURE_2D]=ft(i.TEXTURE_2D,i.TEXTURE_2D,1),mt[i.TEXTURE_CUBE_MAP]=ft(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),mt[i.TEXTURE_2D_ARRAY]=ft(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),mt[i.TEXTURE_3D]=ft(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),it(i.DEPTH_TEST),a.setFunc(es),Tt(!1),pt(Go),it(i.CULL_FACE),ot(bi);function it(N){u[N]!==!0&&(i.enable(N),u[N]=!0)}function st(N){u[N]!==!1&&(i.disable(N),u[N]=!1)}function Bt(N,et){return h[N]!==et?(i.bindFramebuffer(N,et),h[N]=et,N===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=et),N===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=et),!0):!1}function gt(N,et){let K=p,Mt=!1;if(N){K=d.get(et),K===void 0&&(K=[],d.set(et,K));const dt=N.textures;if(K.length!==dt.length||K[0]!==i.COLOR_ATTACHMENT0){for(let xt=0,Ut=dt.length;xt<Ut;xt++)K[xt]=i.COLOR_ATTACHMENT0+xt;K.length=dt.length,Mt=!0}}else K[0]!==i.BACK&&(K[0]=i.BACK,Mt=!0);Mt&&i.drawBuffers(K)}function Ct(N){return x!==N?(i.useProgram(N),x=N,!0):!1}const Ot={[Mi]:i.FUNC_ADD,[Xh]:i.FUNC_SUBTRACT,[Yh]:i.FUNC_REVERSE_SUBTRACT};Ot[qh]=i.MIN,Ot[Zh]=i.MAX;const Z={[Kh]:i.ZERO,[Jh]:i.ONE,[$h]:i.SRC_COLOR,[vc]:i.SRC_ALPHA,[iu]:i.SRC_ALPHA_SATURATE,[eu]:i.DST_COLOR,[jh]:i.DST_ALPHA,[Qh]:i.ONE_MINUS_SRC_COLOR,[Mc]:i.ONE_MINUS_SRC_ALPHA,[nu]:i.ONE_MINUS_DST_COLOR,[tu]:i.ONE_MINUS_DST_ALPHA,[su]:i.CONSTANT_COLOR,[ru]:i.ONE_MINUS_CONSTANT_COLOR,[au]:i.CONSTANT_ALPHA,[ou]:i.ONE_MINUS_CONSTANT_ALPHA};function ot(N,et,K,Mt,dt,xt,Ut,Zt,ut,Ft){if(N===bi){m===!0&&(st(i.BLEND),m=!1);return}if(m===!1&&(it(i.BLEND),m=!0),N!==Wh){if(N!==g||Ft!==P){if((v!==Mi||R!==Mi)&&(i.blendEquation(i.FUNC_ADD),v=Mi,R=Mi),Ft)switch(N){case Ji:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ko:i.blendFunc(i.ONE,i.ONE);break;case Vo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Wo:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:ae("WebGLState: Invalid blending: ",N);break}else switch(N){case Ji:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ko:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Vo:ae("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Wo:ae("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ae("WebGLState: Invalid blending: ",N);break}A=null,M=null,y=null,_=null,E.set(0,0,0),L=0,g=N,P=Ft}return}dt=dt||et,xt=xt||K,Ut=Ut||Mt,(et!==v||dt!==R)&&(i.blendEquationSeparate(Ot[et],Ot[dt]),v=et,R=dt),(K!==A||Mt!==M||xt!==y||Ut!==_)&&(i.blendFuncSeparate(Z[K],Z[Mt],Z[xt],Z[Ut]),A=K,M=Mt,y=xt,_=Ut),(Zt.equals(E)===!1||ut!==L)&&(i.blendColor(Zt.r,Zt.g,Zt.b,ut),E.copy(Zt),L=ut),g=N,P=!1}function rt(N,et){N.side===An?st(i.CULL_FACE):it(i.CULL_FACE);let K=N.side===Ve;et&&(K=!K),Tt(K),N.blending===Ji&&N.transparent===!1?ot(bi):ot(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);const Mt=N.stencilWrite;o.setTest(Mt),Mt&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),Lt(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?it(i.SAMPLE_ALPHA_TO_COVERAGE):st(i.SAMPLE_ALPHA_TO_COVERAGE)}function Tt(N){D!==N&&(N?i.frontFace(i.CW):i.frontFace(i.CCW),D=N)}function pt(N){N!==Gh?(it(i.CULL_FACE),N!==H&&(N===Go?i.cullFace(i.BACK):N===kh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):st(i.CULL_FACE),H=N}function kt(N){N!==X&&(z&&i.lineWidth(N),X=N)}function Lt(N,et,K){N?(it(i.POLYGON_OFFSET_FILL),(T!==et||I!==K)&&(T=et,I=K,a.getReversed()&&(et=-et,K=-K),i.polygonOffset(et,K))):st(i.POLYGON_OFFSET_FILL)}function Xt(N){N?it(i.SCISSOR_TEST):st(i.SCISSOR_TEST)}function qt(N){N===void 0&&(N=i.TEXTURE0+B-1),q!==N&&(i.activeTexture(N),q=N)}function te(N,et,K){K===void 0&&(q===null?K=i.TEXTURE0+B-1:K=q);let Mt=$[K];Mt===void 0&&(Mt={type:void 0,texture:void 0},$[K]=Mt),(Mt.type!==N||Mt.texture!==et)&&(q!==K&&(i.activeTexture(K),q=K),i.bindTexture(N,et||mt[N]),Mt.type=N,Mt.texture=et)}function O(){const N=$[q];N!==void 0&&N.type!==void 0&&(i.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function ve(){try{i.compressedTexImage2D(...arguments)}catch(N){ae("WebGLState:",N)}}function $t(){try{i.compressedTexImage3D(...arguments)}catch(N){ae("WebGLState:",N)}}function fe(){try{i.texSubImage2D(...arguments)}catch(N){ae("WebGLState:",N)}}function yt(){try{i.texSubImage3D(...arguments)}catch(N){ae("WebGLState:",N)}}function xe(){try{i.compressedTexSubImage2D(...arguments)}catch(N){ae("WebGLState:",N)}}function zt(){try{i.compressedTexSubImage3D(...arguments)}catch(N){ae("WebGLState:",N)}}function Gt(){try{i.texStorage2D(...arguments)}catch(N){ae("WebGLState:",N)}}function C(){try{i.texStorage3D(...arguments)}catch(N){ae("WebGLState:",N)}}function S(){try{i.texImage2D(...arguments)}catch(N){ae("WebGLState:",N)}}function V(){try{i.texImage3D(...arguments)}catch(N){ae("WebGLState:",N)}}function ct(N){return f[N]!==void 0?f[N]:i.getParameter(N)}function nt(N,et){f[N]!==et&&(i.pixelStorei(N,et),f[N]=et)}function _t(N){F.equals(N)===!1&&(i.scissor(N.x,N.y,N.z,N.w),F.copy(N))}function Et(N){j.equals(N)===!1&&(i.viewport(N.x,N.y,N.z,N.w),j.copy(N))}function Q(N,et){let K=c.get(et);K===void 0&&(K=new WeakMap,c.set(et,K));let Mt=K.get(N);Mt===void 0&&(Mt=i.getUniformBlockIndex(et,N.name),i.uniformBlockBinding(et,Mt,Mt),K.set(N,Mt))}function tt(N,et,K){const dt=c.get(et).get(N);l[dt]!==K&&(i.bindBufferBase(i.UNIFORM_BUFFER,dt,K),l[dt]=K)}function vt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},f={},q=null,$={},h={},l={},d=new WeakMap,p=[],x=null,m=!1,g=null,v=null,A=null,M=null,R=null,y=null,_=null,E=new jt(0,0,0),L=0,P=!1,D=null,H=null,X=null,T=null,I=null,F.set(0,0,i.canvas.width,i.canvas.height),j.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:it,disable:st,bindFramebuffer:Bt,drawBuffers:gt,useProgram:Ct,setBlending:ot,setMaterial:rt,setFlipSided:Tt,setCullFace:pt,setLineWidth:kt,setPolygonOffset:Lt,setScissorTest:Xt,activeTexture:qt,bindTexture:te,unbindTexture:O,compressedTexImage2D:ve,compressedTexImage3D:$t,texImage2D:S,texImage3D:V,pixelStorei:nt,getParameter:ct,updateUBOMapping:Q,uniformBlockBinding:tt,texStorage2D:Gt,texStorage3D:C,texSubImage2D:fe,texSubImage3D:yt,compressedTexSubImage2D:xe,compressedTexSubImage3D:zt,scissor:_t,viewport:Et,reset:vt}}function C0(i,t,e,n,s,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ht,u=new WeakMap,f=new Set;let h;const d=new WeakMap,p=new Set,x=new FinalizationRegistry(C=>p.delete(C));let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(C,S){return m?new OffscreenCanvas(C,S):ir("canvas")}function v(C,S,V){let ct=1;const nt=Gt(C);if((nt.width>V||nt.height>V)&&(ct=V/Math.max(nt.width,nt.height)),ct<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const _t=Math.floor(ct*nt.width),Et=Math.floor(ct*nt.height);h===void 0&&(h=g(_t,Et));const Q=S?g(_t,Et):h;return Q.width=_t,Q.height=Et,Q.getContext("2d").drawImage(C,0,0,_t,Et),Ht("WebGLRenderer: Texture has been resized from ("+nt.width+"x"+nt.height+") to ("+_t+"x"+Et+")."),Q}else return"data"in C&&Ht("WebGLRenderer: Image in DataTexture is too big ("+nt.width+"x"+nt.height+")."),C;return C}function A(C){return C.generateMipmaps}function M(C){i.generateMipmap(C)}function R(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(C,S,V,ct,nt,_t=!1){if(C!==null){if(i[C]!==void 0)return i[C];Ht("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let Et;ct&&(Et=t.get("EXT_texture_norm16"),Et||Ht("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=S;if(S===i.RED&&(V===i.FLOAT&&(Q=i.R32F),V===i.HALF_FLOAT&&(Q=i.R16F),V===i.UNSIGNED_BYTE&&(Q=i.R8),V===i.UNSIGNED_SHORT&&Et&&(Q=Et.R16_EXT),V===i.SHORT&&Et&&(Q=Et.R16_SNORM_EXT)),S===i.RED_INTEGER&&(V===i.UNSIGNED_BYTE&&(Q=i.R8UI),V===i.UNSIGNED_SHORT&&(Q=i.R16UI),V===i.UNSIGNED_INT&&(Q=i.R32UI),V===i.BYTE&&(Q=i.R8I),V===i.SHORT&&(Q=i.R16I),V===i.INT&&(Q=i.R32I)),S===i.RG&&(V===i.FLOAT&&(Q=i.RG32F),V===i.HALF_FLOAT&&(Q=i.RG16F),V===i.UNSIGNED_BYTE&&(Q=i.RG8),V===i.UNSIGNED_SHORT&&Et&&(Q=Et.RG16_EXT),V===i.SHORT&&Et&&(Q=Et.RG16_SNORM_EXT)),S===i.RG_INTEGER&&(V===i.UNSIGNED_BYTE&&(Q=i.RG8UI),V===i.UNSIGNED_SHORT&&(Q=i.RG16UI),V===i.UNSIGNED_INT&&(Q=i.RG32UI),V===i.BYTE&&(Q=i.RG8I),V===i.SHORT&&(Q=i.RG16I),V===i.INT&&(Q=i.RG32I)),S===i.RGB_INTEGER&&(V===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),V===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),V===i.UNSIGNED_INT&&(Q=i.RGB32UI),V===i.BYTE&&(Q=i.RGB8I),V===i.SHORT&&(Q=i.RGB16I),V===i.INT&&(Q=i.RGB32I)),S===i.RGBA_INTEGER&&(V===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),V===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),V===i.UNSIGNED_INT&&(Q=i.RGBA32UI),V===i.BYTE&&(Q=i.RGBA8I),V===i.SHORT&&(Q=i.RGBA16I),V===i.INT&&(Q=i.RGBA32I)),S===i.RGB&&(V===i.UNSIGNED_SHORT&&Et&&(Q=Et.RGB16_EXT),V===i.SHORT&&Et&&(Q=Et.RGB16_SNORM_EXT),V===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),V===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),S===i.RGBA){const tt=_t?nr:ie.getTransfer(nt);V===i.FLOAT&&(Q=i.RGBA32F),V===i.HALF_FLOAT&&(Q=i.RGBA16F),V===i.UNSIGNED_BYTE&&(Q=tt===ue?i.SRGB8_ALPHA8:i.RGBA8),V===i.UNSIGNED_SHORT&&Et&&(Q=Et.RGBA16_EXT),V===i.SHORT&&Et&&(Q=Et.RGBA16_SNORM_EXT),V===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),V===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Q}function _(C,S){let V;return C?S===null||S===_n||S===Ri?V=i.DEPTH24_STENCIL8:S===dn?V=i.DEPTH32F_STENCIL8:S===is&&(V=i.DEPTH24_STENCIL8,Ht("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===_n||S===Ri?V=i.DEPTH_COMPONENT24:S===dn?V=i.DEPTH_COMPONENT32F:S===is&&(V=i.DEPTH_COMPONENT16),V}function E(C,S){return A(C)===!0||C.isFramebufferTexture&&C.minFilter!==Le&&C.minFilter!==ke?Math.log2(Math.max(S.width,S.height))+1:C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?S.mipmaps.length:1}function L(C){const S=new WeakRef(C);n.get(C).__ref=S,p.add(S),x.register(C,S,S)}function P(C){const S=n.get(C).__ref;S!==void 0&&(p.delete(S),x.unregister(S))}function D(C){X(C.target)}function H(C){T(C.target)}function X(C){C.removeEventListener("dispose",D),P(C),B(C),C.isVideoTexture&&u.delete(C),C.isHTMLTexture&&f.delete(C)}function T(C){C.removeEventListener("dispose",H),P(C),J(C)}function I(){for(const C of p){const S=C.deref();S!==void 0&&(S.isRenderTarget===!0?T(S):X(S))}p.clear(),f.clear()}function B(C){const S=n.get(C);if(S.__webglInit===void 0)return;const V=C.source,ct=d.get(V);if(ct){const nt=ct[S.__cacheKey];nt.usedTimes--,nt.usedTimes===0&&z(C),Object.keys(ct).length===0&&d.delete(V)}n.remove(C)}function z(C){const S=n.get(C);i.deleteTexture(S.__webglTexture);const V=C.source,ct=d.get(V);delete ct[S.__cacheKey],a.memory.textures--}function J(C){const S=n.get(C);S.__depthDisposeCallback&&S.__depthDisposeCallback();const V=C.depthTexture;if(V&&V.renderTarget===C&&X(V),C.isWebGLCubeRenderTarget)for(let nt=0;nt<6;nt++){if(Array.isArray(S.__webglFramebuffer[nt]))for(let _t=0;_t<S.__webglFramebuffer[nt].length;_t++)i.deleteFramebuffer(S.__webglFramebuffer[nt][_t]);else i.deleteFramebuffer(S.__webglFramebuffer[nt]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[nt])}else{if(Array.isArray(S.__webglFramebuffer))for(let nt=0;nt<S.__webglFramebuffer.length;nt++)i.deleteFramebuffer(S.__webglFramebuffer[nt]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let nt=0;nt<S.__webglColorRenderbuffer.length;nt++)S.__webglColorRenderbuffer[nt]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[nt]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const ct=C.textures;for(let nt=0,_t=ct.length;nt<_t;nt++){const Et=n.get(ct[nt]);Et.__webglTexture&&(i.deleteTexture(Et.__webglTexture),a.memory.textures--),n.remove(ct[nt])}n.remove(C)}let G=0;function q(){G=0}function $(){return G}function lt(C){G=C}function at(){const C=G;return C>=s.maxTextures&&Ht("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),G+=1,C}function F(C){const S=[];return S.push(C.wrapS),S.push(C.wrapT),S.push(C.wrapR||0),S.push(C.magFilter),S.push(C.minFilter),S.push(C.anisotropy),S.push(C.internalFormat),S.push(C.format),S.push(C.type),S.push(C.generateMipmaps),S.push(C.mipmapsAutoUpdate),S.push(C.premultiplyAlpha),S.push(C.flipY),S.push(C.unpackAlignment),S.push(C.colorSpace),S.join()}function j(C,S){const V=n.get(C);if(C.isVideoTexture&&xe(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&V.__version!==C.version){const ct=C.image;if(ct===null)Ht("WebGLRenderer: Texture marked for update but no image data found.");else if(ct.complete===!1)Ht("WebGLRenderer: Texture marked for update but image is incomplete");else{rt(V,C,S);return}}else C.isExternalTexture&&(V.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,V.__webglTexture,i.TEXTURE0+S)}function ft(C,S){const V=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&V.__version!==C.version){rt(V,C,S);return}else C.isExternalTexture&&(V.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,V.__webglTexture,i.TEXTURE0+S)}function mt(C,S){const V=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&V.__version!==C.version){rt(V,C,S);return}e.bindTexture(i.TEXTURE_3D,V.__webglTexture,i.TEXTURE0+S)}function it(C,S){const V=n.get(C);if(C.version>0&&V.__version!==C.version){Tt(V,C,S);return}e.bindTexture(i.TEXTURE_CUBE_MAP,V.__webglTexture,i.TEXTURE0+S)}const st={[ra]:i.REPEAT,[wn]:i.CLAMP_TO_EDGE,[aa]:i.MIRRORED_REPEAT},Bt={[Le]:i.NEAREST,[hu]:i.NEAREST_MIPMAP_NEAREST,[gs]:i.NEAREST_MIPMAP_LINEAR,[ke]:i.LINEAR,[xr]:i.LINEAR_MIPMAP_NEAREST,[Bn]:i.LINEAR_MIPMAP_LINEAR},gt={[pu]:i.NEVER,[zc]:i.ALWAYS,[mu]:i.LESS,[Fc]:i.LEQUAL,[gu]:i.EQUAL,[Bc]:i.GEQUAL,[_u]:i.GREATER,[xu]:i.NOTEQUAL};function Ct(C,S){if(S.type===dn&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===ke||S.magFilter===xr||S.magFilter===gs||S.magFilter===Bn||S.minFilter===ke||S.minFilter===xr||S.minFilter===gs||S.minFilter===Bn)&&Ht("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,st[S.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,st[S.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,st[S.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,Bt[S.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,Bt[S.minFilter]),S.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,gt[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Le||S.minFilter!==gs&&S.minFilter!==Bn||S.type===dn&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const V=t.get("EXT_texture_filter_anisotropic");i.texParameterf(C,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function Ot(C,S){let V=!1;C.__webglInit===void 0&&(C.__webglInit=!0,S.addEventListener("dispose",D),L(S));const ct=S.source;let nt=d.get(ct);nt===void 0&&(nt={},d.set(ct,nt));const _t=F(S);if(_t!==C.__cacheKey){nt[_t]===void 0&&(nt[_t]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,V=!0),nt[_t].usedTimes++;const Et=nt[C.__cacheKey];Et!==void 0&&(nt[C.__cacheKey].usedTimes--,Et.usedTimes===0&&z(S)),C.__cacheKey=_t,C.__webglTexture=nt[_t].texture}return V}function Z(C,S,V){return Math.floor(Math.floor(C/V)/S)}function ot(C,S,V,ct){const _t=C.updateRanges;if(_t.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,S.width,S.height,V,ct,S.data);else{_t.sort((N,et)=>N.start-et.start);let Et=0;for(let N=1;N<_t.length;N++){const et=_t[Et],K=_t[N],Mt=et.start+et.count,dt=Z(K.start,S.width,4),xt=Z(et.start,S.width,4);K.start<=Mt+1&&dt===xt&&Z(K.start+K.count-1,S.width,4)===dt?et.count=Math.max(et.count,K.start+K.count-et.start):(++Et,_t[Et]=K)}_t.length=Et+1;const Q=e.getParameter(i.UNPACK_ROW_LENGTH),tt=e.getParameter(i.UNPACK_SKIP_PIXELS),vt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,S.width);for(let N=0,et=_t.length;N<et;N++){const K=_t[N],Mt=Math.floor(K.start/4),dt=Math.ceil(K.count/4),xt=Mt%S.width,Ut=Math.floor(Mt/S.width),Zt=dt,ut=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,xt),e.pixelStorei(i.UNPACK_SKIP_ROWS,Ut),e.texSubImage2D(i.TEXTURE_2D,0,xt,Ut,Zt,ut,V,ct,S.data)}C.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,Q),e.pixelStorei(i.UNPACK_SKIP_PIXELS,tt),e.pixelStorei(i.UNPACK_SKIP_ROWS,vt)}}function rt(C,S,V){let ct=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(ct=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(ct=i.TEXTURE_3D);const nt=Ot(C,S),_t=S.source;e.bindTexture(ct,C.__webglTexture,i.TEXTURE0+V);const Et=n.get(_t);if(_t.version!==Et.__version||nt===!0){if(e.activeTexture(i.TEXTURE0+V),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){const ut=ie.getPrimaries(ie.workingColorSpace),Ft=S.colorSpace===Fn?null:ie.getPrimaries(S.colorSpace),Yt=S.colorSpace===Fn||ut===Ft?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Yt)}e.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment);let tt=v(S.image,!1,s.maxTextureSize);tt=zt(S,tt);const vt=r.convert(S.format,S.colorSpace),N=r.convert(S.type);let et=y(S.internalFormat,vt,N,S.normalized,S.colorSpace,S.isVideoTexture);Ct(ct,S);let K;const Mt=S.mipmaps,dt=S.isVideoTexture!==!0,xt=Et.__version===void 0||nt===!0,Ut=_t.dataReady,Zt=E(S,tt);if(S.isDepthTexture)et=_(S.format===zn,S.type),xt&&(dt?e.texStorage2D(i.TEXTURE_2D,1,et,tt.width,tt.height):e.texImage2D(i.TEXTURE_2D,0,et,tt.width,tt.height,0,vt,N,null));else if(S.isDataTexture)if(Mt.length>0){dt&&xt&&e.texStorage2D(i.TEXTURE_2D,Zt,et,Mt[0].width,Mt[0].height);for(let ut=0,Ft=Mt.length;ut<Ft;ut++)K=Mt[ut],dt?Ut&&e.texSubImage2D(i.TEXTURE_2D,ut,0,0,K.width,K.height,vt,N,K.data):e.texImage2D(i.TEXTURE_2D,ut,et,K.width,K.height,0,vt,N,K.data);S.generateMipmaps=!1}else dt?(xt&&e.texStorage2D(i.TEXTURE_2D,Zt,et,tt.width,tt.height),Ut&&ot(S,tt,vt,N)):e.texImage2D(i.TEXTURE_2D,0,et,tt.width,tt.height,0,vt,N,tt.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){dt&&xt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Zt,et,Mt[0].width,Mt[0].height,tt.depth);for(let ut=0,Ft=Mt.length;ut<Ft;ut++)if(K=Mt[ut],S.format!==pn)if(vt!==null)if(dt){if(Ut)if(S.layerUpdates.size>0){const Yt=Cl(K.width,K.height,S.format,S.type);for(const At of S.layerUpdates){const he=K.data.subarray(At*Yt/K.data.BYTES_PER_ELEMENT,(At+1)*Yt/K.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ut,0,0,At,K.width,K.height,1,vt,he)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ut,0,0,0,K.width,K.height,tt.depth,vt,K.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ut,et,K.width,K.height,tt.depth,0,K.data,0,0);else Ht("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else dt?Ut&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,ut,0,0,0,K.width,K.height,tt.depth,vt,N,K.data):e.texImage3D(i.TEXTURE_2D_ARRAY,ut,et,K.width,K.height,tt.depth,0,vt,N,K.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{dt&&xt&&e.texStorage2D(i.TEXTURE_2D,Zt,et,Mt[0].width,Mt[0].height);for(let ut=0,Ft=Mt.length;ut<Ft;ut++)K=Mt[ut],S.format!==pn?vt!==null?dt?Ut&&e.compressedTexSubImage2D(i.TEXTURE_2D,ut,0,0,K.width,K.height,vt,K.data):e.compressedTexImage2D(i.TEXTURE_2D,ut,et,K.width,K.height,0,K.data):Ht("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):dt?Ut&&e.texSubImage2D(i.TEXTURE_2D,ut,0,0,K.width,K.height,vt,N,K.data):e.texImage2D(i.TEXTURE_2D,ut,et,K.width,K.height,0,vt,N,K.data)}else if(S.isDataArrayTexture)if(dt){if(xt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Zt,et,tt.width,tt.height,tt.depth),Ut)if(S.layerUpdates.size>0){const ut=Cl(tt.width,tt.height,S.format,S.type);for(const Ft of S.layerUpdates){const Yt=tt.data.subarray(Ft*ut/tt.data.BYTES_PER_ELEMENT,(Ft+1)*ut/tt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ft,tt.width,tt.height,1,vt,N,Yt)}S.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,tt.width,tt.height,tt.depth,vt,N,tt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,et,tt.width,tt.height,tt.depth,0,vt,N,tt.data);else if(S.isData3DTexture)dt?(xt&&e.texStorage3D(i.TEXTURE_3D,Zt,et,tt.width,tt.height,tt.depth),Ut&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,tt.width,tt.height,tt.depth,vt,N,tt.data)):e.texImage3D(i.TEXTURE_3D,0,et,tt.width,tt.height,tt.depth,0,vt,N,tt.data);else if(S.isFramebufferTexture){if(xt)if(dt)e.texStorage2D(i.TEXTURE_2D,Zt,et,tt.width,tt.height);else{let ut=tt.width,Ft=tt.height;for(let Yt=0;Yt<Zt;Yt++)e.texImage2D(i.TEXTURE_2D,Yt,et,ut,Ft,0,vt,N,null),ut>>=1,Ft>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in i){const ut=i.canvas;if(ut.hasAttribute("layoutsubtree")||ut.setAttribute("layoutsubtree","true"),tt.parentNode!==ut){ut.appendChild(tt),f.add(S),ut.onpaint=Ft=>{const Yt=Ft.changedElements;for(const At of f)Yt.includes(At.image)&&(At.needsUpdate=!0)},ut.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,tt);else{const Yt=i.RGBA,At=i.RGBA,he=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Yt,At,he,tt)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Mt.length>0){if(dt&&xt){const ut=Gt(Mt[0]);e.texStorage2D(i.TEXTURE_2D,Zt,et,ut.width,ut.height)}for(let ut=0,Ft=Mt.length;ut<Ft;ut++)K=Mt[ut],dt?Ut&&e.texSubImage2D(i.TEXTURE_2D,ut,0,0,vt,N,K):e.texImage2D(i.TEXTURE_2D,ut,et,vt,N,K);S.generateMipmaps=!1}else if(dt){if(xt){const ut=Gt(tt);e.texStorage2D(i.TEXTURE_2D,Zt,et,ut.width,ut.height)}Ut&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,vt,N,tt)}else e.texImage2D(i.TEXTURE_2D,0,et,vt,N,tt);A(S)&&S.mipmapsAutoUpdate===!0&&M(ct),Et.__version=_t.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function Tt(C,S,V){if(S.image.length!==6)return;const ct=Ot(C,S),nt=S.source;e.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+V);const _t=n.get(nt);if(nt.version!==_t.__version||ct===!0){e.activeTexture(i.TEXTURE0+V);const Et=ie.getPrimaries(ie.workingColorSpace),Q=S.colorSpace===Fn?null:ie.getPrimaries(S.colorSpace),tt=S.colorSpace===Fn||Et===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,tt);const vt=S.isCompressedTexture||S.image[0].isCompressedTexture,N=S.image[0]&&S.image[0].isDataTexture,et=[];for(let At=0;At<6;At++)!vt&&!N?et[At]=v(S.image[At],!0,s.maxCubemapSize):et[At]=N?S.image[At].image:S.image[At],et[At]=zt(S,et[At]);const K=et[0],Mt=r.convert(S.format,S.colorSpace),dt=r.convert(S.type);let xt=y(S.internalFormat,Mt,dt,S.normalized,S.colorSpace);const Ut=S.isVideoTexture!==!0,Zt=_t.__version===void 0||ct===!0,ut=nt.dataReady;let Ft=E(S,K);Ct(i.TEXTURE_CUBE_MAP,S);let Yt;if(S.isDepthTexture){if(xt=_(S.format===zn,S.type),Zt)if(Ut)e.texStorage2D(i.TEXTURE_CUBE_MAP,1,xt,K.width,K.height);else for(let At=0;At<6;At++)e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,0,xt,K.width,K.height,0,Mt,dt,null)}else if(vt){Ut&&Zt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,Ft,xt,K.width,K.height);for(let At=0;At<6;At++){Yt=et[At].mipmaps;for(let he=0;he<Yt.length;he++){const Ae=Yt[he];S.format!==pn?Mt!==null?Ut?ut&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,he,0,0,Ae.width,Ae.height,Mt,Ae.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,he,xt,Ae.width,Ae.height,0,Ae.data):Ht("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ut?ut&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,he,0,0,Ae.width,Ae.height,Mt,dt,Ae.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,he,xt,Ae.width,Ae.height,0,Mt,dt,Ae.data)}}}else{if(Yt=S.mipmaps,Ut&&Zt){Yt.length>0&&Ft++;const At=Gt(et[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,Ft,xt,At.width,At.height)}for(let At=0;At<6;At++)if(N){Ut?ut&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,0,0,0,et[At].width,et[At].height,Mt,dt,et[At].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,0,xt,et[At].width,et[At].height,0,Mt,dt,et[At].data);for(let he=0;he<Yt.length;he++){const Pn=Yt[he].image[At].image;Ut?ut&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,he+1,0,0,Pn.width,Pn.height,Mt,dt,Pn.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,he+1,xt,Pn.width,Pn.height,0,Mt,dt,Pn.data)}}else{Ut?ut&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,0,0,0,Mt,dt,et[At]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,0,xt,Mt,dt,et[At]);for(let he=0;he<Yt.length;he++){const Ae=Yt[he];Ut?ut&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,he+1,0,0,Mt,dt,Ae.image[At]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+At,he+1,xt,Mt,dt,Ae.image[At])}}}A(S)&&S.mipmapsAutoUpdate===!0&&M(i.TEXTURE_CUBE_MAP),_t.__version=nt.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function pt(C,S,V,ct,nt,_t){const Et=r.convert(V.format,V.colorSpace),Q=r.convert(V.type),tt=y(V.internalFormat,Et,Q,V.normalized,V.colorSpace),vt=n.get(S),N=n.get(V);if(N.__renderTarget=S,!vt.__hasExternalTextures){const et=Math.max(1,S.width>>_t),K=Math.max(1,S.height>>_t);nt===i.TEXTURE_3D||nt===i.TEXTURE_2D_ARRAY?e.texImage3D(nt,_t,tt,et,K,S.depth,0,Et,Q,null):e.texImage2D(nt,_t,tt,et,K,0,Et,Q,null)}e.bindFramebuffer(i.FRAMEBUFFER,C),yt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ct,nt,N.__webglTexture,0,fe(S)):(nt===i.TEXTURE_2D||nt>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&nt<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,ct,nt,N.__webglTexture,_t),e.bindFramebuffer(i.FRAMEBUFFER,null)}function kt(C,S,V){if(i.bindRenderbuffer(i.RENDERBUFFER,C),S.depthBuffer){const ct=S.depthTexture,nt=ct&&ct.isDepthTexture?ct.type:null,_t=_(S.stencilBuffer,nt),Et=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;yt(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,fe(S),_t,S.width,S.height):V?i.renderbufferStorageMultisample(i.RENDERBUFFER,fe(S),_t,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,_t,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Et,i.RENDERBUFFER,C)}else{const ct=S.textures;for(let nt=0;nt<ct.length;nt++){const _t=ct[nt],Et=r.convert(_t.format,_t.colorSpace),Q=r.convert(_t.type),tt=y(_t.internalFormat,Et,Q,_t.normalized,_t.colorSpace);yt(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,fe(S),tt,S.width,S.height):V?i.renderbufferStorageMultisample(i.RENDERBUFFER,fe(S),tt,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,tt,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Lt(C,S,V){const ct=S.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,C),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const nt=n.get(S.depthTexture);nt.__renderTarget=S;const _t=ct?S.depthTexture.image[0]:S.depthTexture.image;(!nt.__webglTexture||_t.width!==S.width||_t.height!==S.height)&&(_t.width=S.width,_t.height=S.height,S.depthTexture.needsUpdate=!0),ct?it(S.depthTexture,0):j(S.depthTexture,0);const Et=nt.__webglTexture,Q=fe(S),tt=ct?i.TEXTURE_CUBE_MAP_POSITIVE_X+V:i.TEXTURE_2D,vt=S.depthTexture.format===zn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(S.depthTexture.format===Hn)yt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,vt,tt,Et,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,vt,tt,Et,0);else if(S.depthTexture.format===zn)yt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,vt,tt,Et,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,vt,tt,Et,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Xt(C){const S=n.get(C),V=C.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==C.depthTexture){const ct=C.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),ct){const nt=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,ct.removeEventListener("dispose",nt)};ct.addEventListener("dispose",nt),S.__depthDisposeCallback=nt}S.__boundDepthTexture=ct}if(C.depthTexture&&!S.__autoAllocateDepthBuffer)if(V)for(let ct=0;ct<6;ct++)Lt(S.__webglFramebuffer[ct],C,ct);else C.texture.mipmaps.length>0?Lt(S.__webglFramebuffer[0],C,0):Lt(S.__webglFramebuffer,C,0);else if(V){S.__webglDepthbuffer=[];for(let ct=0;ct<6;ct++)if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[ct]),S.__webglDepthbuffer[ct]===void 0)S.__webglDepthbuffer[ct]=i.createRenderbuffer(),kt(S.__webglDepthbuffer[ct],C,!1);else{const nt=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_t=S.__webglDepthbuffer[ct];i.bindRenderbuffer(i.RENDERBUFFER,_t),i.framebufferRenderbuffer(i.FRAMEBUFFER,nt,i.RENDERBUFFER,_t)}}else if(C.texture.mipmaps.length>0?e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),kt(S.__webglDepthbuffer,C,!1);else{const nt=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_t=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,_t),i.framebufferRenderbuffer(i.FRAMEBUFFER,nt,i.RENDERBUFFER,_t)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function qt(C,S,V){const ct=n.get(C);S!==void 0&&pt(ct.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),V!==void 0&&Xt(C)}function te(C){const S=C.texture,V=n.get(C),ct=n.get(S);C.addEventListener("dispose",H),L(C);const nt=C.textures,_t=C.isWebGLCubeRenderTarget===!0,Et=nt.length>1;if(Et||(ct.__webglTexture===void 0&&(ct.__webglTexture=i.createTexture()),ct.__version=S.version,a.memory.textures++),_t){V.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(S.mipmaps.length>0){V.__webglFramebuffer[Q]=[];for(let tt=0;tt<S.mipmaps.length;tt++)V.__webglFramebuffer[Q][tt]=i.createFramebuffer()}else V.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(S.mipmaps.length>0){V.__webglFramebuffer=[];for(let Q=0;Q<S.mipmaps.length;Q++)V.__webglFramebuffer[Q]=i.createFramebuffer()}else V.__webglFramebuffer=i.createFramebuffer();if(Et)for(let Q=0,tt=nt.length;Q<tt;Q++){const vt=n.get(nt[Q]);vt.__webglTexture===void 0&&(vt.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&yt(C)===!1){V.__webglMultisampledFramebuffer=i.createFramebuffer(),V.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let Q=0;Q<nt.length;Q++){const tt=nt[Q];V.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,V.__webglColorRenderbuffer[Q]);const vt=r.convert(tt.format,tt.colorSpace),N=r.convert(tt.type),et=y(tt.internalFormat,vt,N,tt.normalized,tt.colorSpace,C.isXRRenderTarget===!0),K=fe(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,K,et,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,V.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(V.__webglDepthRenderbuffer=i.createRenderbuffer(),kt(V.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(_t){e.bindTexture(i.TEXTURE_CUBE_MAP,ct.__webglTexture),Ct(i.TEXTURE_CUBE_MAP,S);for(let Q=0;Q<6;Q++)if(S.mipmaps.length>0)for(let tt=0;tt<S.mipmaps.length;tt++)pt(V.__webglFramebuffer[Q][tt],C,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,tt);else pt(V.__webglFramebuffer[Q],C,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);A(S)?M(i.TEXTURE_CUBE_MAP):S.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),e.unbindTexture()}else if(Et){for(let Q=0,tt=nt.length;Q<tt;Q++){const vt=nt[Q],N=n.get(vt);let et=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(et=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(et,N.__webglTexture),Ct(et,vt),pt(V.__webglFramebuffer,C,vt,i.COLOR_ATTACHMENT0+Q,et,0),A(vt)&&M(et)}e.unbindTexture()}else{let Q=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Q=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Q,ct.__webglTexture),Ct(Q,S),S.mipmaps.length>0)for(let tt=0;tt<S.mipmaps.length;tt++)pt(V.__webglFramebuffer[tt],C,S,i.COLOR_ATTACHMENT0,Q,tt);else pt(V.__webglFramebuffer,C,S,i.COLOR_ATTACHMENT0,Q,0);A(S)?M(Q):S.mipmaps.length>0&&i.texParameteri(Q,i.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),e.unbindTexture()}C.depthBuffer&&Xt(C)}function O(C){const S=C.textures;for(let V=0,ct=S.length;V<ct;V++){const nt=S[V];if(A(nt)&&nt.mipmapsAutoUpdate===!0){const _t=R(C),Et=n.get(nt).__webglTexture;e.bindTexture(_t,Et),M(_t),e.unbindTexture()}}}const ve=[];function $t(C){if(C.samples>0){if(yt(C)===!1){const S=C.textures,V=C.width,ct=C.height;let nt=i.COLOR_BUFFER_BIT;const _t=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Et=n.get(C),Q=S.length>1;if(Q)for(let vt=0;vt<S.length;vt++)e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Et.__webglMultisampledFramebuffer),C.texture.mipmaps.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Et.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Et.__webglFramebuffer);for(let vt=0;vt<S.length;vt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(nt|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(nt|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Et.__webglColorRenderbuffer[vt]);const N=n.get(S[vt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,N,0)}i.blitFramebuffer(0,0,V,ct,0,0,V,ct,nt,i.NEAREST),l===!0&&(ve.length=0,ve.push(i.COLOR_ATTACHMENT0+vt),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&ve.push(_t),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ve))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let vt=0;vt<S.length;vt++){e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.RENDERBUFFER,Et.__webglColorRenderbuffer[vt]);const N=n.get(S[vt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.TEXTURE_2D,N,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Et.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){const S=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function fe(C){return Math.min(s.maxSamples,C.samples)}function yt(C){const S=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function xe(C){const S=a.render.frame;u.get(C)!==S&&(u.set(C,S),C.update())}function zt(C,S){const V=C.colorSpace,ct=C.format,nt=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||V!==er&&V!==Fn&&(ie.getTransfer(V)===ue?(ct!==pn||nt!==qe)&&Ht("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ae("WebGLTextures: Unsupported texture color space:",V)),S}function Gt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=at,this.resetTextureUnits=q,this.getTextureUnits=$,this.setTextureUnits=lt,this.setTexture2D=j,this.setTexture2DArray=ft,this.setTexture3D=mt,this.setTextureCube=it,this.rebindTextures=qt,this.setupRenderTarget=te,this.updateRenderTargetMipmap=O,this.updateMultisampleRenderTarget=$t,this.setupDepthRenderbuffer=Xt,this.setupFrameBufferTexture=pt,this.useMultisampledRTT=yt,this.dispose=I}function P0(i,t){function e(n,s=Fn){let r;const a=ie.getTransfer(s);if(n===qe)return i.UNSIGNED_BYTE;if(n===Qa)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ja)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Dc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Nc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Pc)return i.BYTE;if(n===Lc)return i.SHORT;if(n===is)return i.UNSIGNED_SHORT;if(n===$a)return i.INT;if(n===_n)return i.UNSIGNED_INT;if(n===dn)return i.FLOAT;if(n===xn)return i.HALF_FLOAT;if(n===Ic)return i.ALPHA;if(n===Uc)return i.RGB;if(n===pn)return i.RGBA;if(n===Hn)return i.DEPTH_COMPONENT;if(n===zn)return i.DEPTH_STENCIL;if(n===Oc)return i.RED;if(n===to)return i.RED_INTEGER;if(n===ti)return i.RG;if(n===eo)return i.RG_INTEGER;if(n===no)return i.RGBA_INTEGER;if(n===Xs||n===Ys||n===qs||n===Zs)if(a===ue)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Xs)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ys)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===qs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Zs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Xs)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ys)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===qs)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Zs)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===oa||n===la||n===ca||n===ha)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===oa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===la)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ca)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ha)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ua||n===fa||n===da||n===pa||n===ma||n===js||n===ga)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ua||n===fa)return a===ue?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===da)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===pa)return r.COMPRESSED_R11_EAC;if(n===ma)return r.COMPRESSED_SIGNED_R11_EAC;if(n===js)return r.COMPRESSED_RG11_EAC;if(n===ga)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===_a||n===xa||n===va||n===Ma||n===Sa||n===ya||n===Ea||n===ba||n===Ta||n===Aa||n===wa||n===Ra||n===Ca||n===Pa)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===_a)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===xa)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===va)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ma)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Sa)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ya)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ea)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ba)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ta)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Aa)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===wa)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ra)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ca)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Pa)return a===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===La||n===Da||n===Na)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===La)return a===ue?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Da)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Na)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ia||n===Ua||n===tr||n===Oa)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ia)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ua)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===tr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Oa)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ri?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}const L0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,D0=`
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

}`;class N0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){const n=new Kc(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new ni({vertexShader:L0,fragmentShader:D0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new rn(new cr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class I0 extends Gn{constructor(t,e){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,f=null,h=null,d=null,p=null;const x=typeof XRWebGLBinding<"u",m=new N0,g={},v=e.getContextAttributes();let A=null,M=null;const R=[],y=[],_=new ht;let E=null,L=null;const P=new en;P.viewport=new ge;const D=new en;D.viewport=new ge;const H=[P,D],X=new Xf;let T=null,I=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(F){let j=R[F];return j===void 0&&(j=new Ar,R[F]=j),j.getTargetRaySpace()},this.getControllerGrip=function(F){let j=R[F];return j===void 0&&(j=new Ar,R[F]=j),j.getGripSpace()},this.getHand=function(F){let j=R[F];return j===void 0&&(j=new Ar,R[F]=j),j.getHandSpace()};function B(F){const j=y.indexOf(F.inputSource);if(j===-1)return;const ft=R[j];ft!==void 0&&(ft.update(F.inputSource,F.frame,c||a),ft.dispatchEvent({type:F.type,data:F.inputSource}))}function z(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",J);for(let F=0;F<R.length;F++){const j=y[F];j!==null&&(y[F]=null,R[F].disconnect(j))}T=null,I=null,m.reset();for(const F in g)delete g[F];if(t.setRenderTarget(A),d=null,h=null,f=null,s=null,M=null,at.stop(),n.isPresenting=!1,t.setPixelRatio(E),t.setSize(_.width,_.height,!1),L!==null){const F=L.camera;F.fov=L.fov,F.zoom=L.zoom,F.updateProjectionMatrix(),L=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(F){r=F,n.isPresenting===!0&&Ht("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(F){o=F,n.isPresenting===!0&&Ht("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(F){c=F},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return f===null&&x&&(f=new XRWebGLBinding(s,e)),f},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(F){if(s=F,s!==null){if(A=t.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",z),s.addEventListener("inputsourceschange",J),v.xrCompatible!==!0&&await e.makeXRCompatible(),E=t.getPixelRatio(),t.getSize(_),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let ft=null,mt=null,it=null;v.depth&&(it=v.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,ft=v.stencil?zn:Hn,mt=v.stencil?Ri:_n);const st={colorFormat:e.RGBA8,depthFormat:it,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(st),s.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),M=new mn(h.textureWidth,h.textureHeight,{format:pn,type:qe,depthTexture:new Ci(h.textureWidth,h.textureHeight,mt,void 0,void 0,void 0,void 0,void 0,void 0,ft),stencilBuffer:v.stencil,colorSpace:t.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{const ft={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,ft),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),M=new mn(d.framebufferWidth,d.framebufferHeight,{format:pn,type:qe,colorSpace:t.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),at.setContext(s),at.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function J(F){for(let j=0;j<F.removed.length;j++){const ft=F.removed[j],mt=y.indexOf(ft);mt>=0&&(y[mt]=null,R[mt].disconnect(ft))}for(let j=0;j<F.added.length;j++){const ft=F.added[j];let mt=y.indexOf(ft);if(mt===-1){for(let st=0;st<R.length;st++)if(st>=y.length){y.push(ft),mt=st;break}else if(y[st]===null){y[st]=ft,mt=st;break}if(mt===-1)break}const it=R[mt];it&&it.connect(ft)}}function G(F,j){j===null?F.matrixWorld.copy(F.matrix):F.matrixWorld.multiplyMatrices(j.matrixWorld,F.matrix),F.matrixWorldInverse.copy(F.matrixWorld).invert()}this.updateCamera=function(F){if(s===null)return;let j=F.near,ft=F.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(ft=m.depthFar)),X.near=D.near=P.near=j,X.far=D.far=P.far=ft,(T!==X.near||I!==X.far)&&(s.updateRenderState({depthNear:X.near,depthFar:X.far}),T=X.near,I=X.far),X.layers.mask=F.layers.mask|6,P.layers.mask=X.layers.mask&-5,D.layers.mask=X.layers.mask&-3;const mt=F.parent,it=X.cameras;G(X,mt);for(let st=0;st<it.length;st++)G(it[st],mt);X.projectionMatrix.copy(P.projectionMatrix),X.projectionMatrixInverse.copy(P.projectionMatrixInverse),L===null&&F.isPerspectiveCamera&&(L={camera:F,fov:F.fov,zoom:F.zoom}),q(F,X,mt)};function q(F,j,ft){ft===null?F.matrix.copy(j.matrixWorld):(F.matrix.copy(ft.matrixWorld),F.matrix.invert(),F.matrix.multiply(j.matrixWorld)),F.matrix.decompose(F.position,F.quaternion,F.scale),F.updateMatrixWorld(!0),F.projectionMatrix.copy(j.projectionMatrix),F.projectionMatrixInverse.copy(j.projectionMatrixInverse),F.isPerspectiveCamera&&(F.fov=Ba*2*Math.atan(1/F.projectionMatrix.elements[5]),F.zoom=1)}this.getCamera=function(){return X},this.getFoveation=function(){if(!(h===null&&d===null))return l},this.setFoveation=function(F){l=F,h!==null&&(h.fixedFoveation=F),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=F)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(X)},this.getCameraTexture=function(F){return g[F]};let $=null;function lt(F,j){if(u=j.getViewerPose(c||a),p=j,u!==null){const ft=u.views;d!==null&&(t.setRenderTargetFramebuffer(M,d.framebuffer),t.setRenderTarget(M));let mt=!1;ft.length!==X.cameras.length&&(X.cameras.length=0,mt=!0);for(let gt=0;gt<ft.length;gt++){const Ct=ft[gt];let Ot=null;if(d!==null)Ot=d.getViewport(Ct);else{const ot=f.getViewSubImage(h,Ct);Ot=ot.viewport,gt===0&&(t.setRenderTargetTextures(M,ot.colorTexture,ot.depthStencilTexture),t.setRenderTarget(M))}let Z=H[gt];Z===void 0&&(Z=new en,Z.layers.enable(gt),Z.viewport=new ge,H[gt]=Z),Z.matrix.fromArray(Ct.transform.matrix),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.projectionMatrix.fromArray(Ct.projectionMatrix),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert(),Z.viewport.set(Ot.x,Ot.y,Ot.width,Ot.height),gt===0&&(X.matrix.copy(Z.matrix),X.matrix.decompose(X.position,X.quaternion,X.scale)),mt===!0&&X.cameras.push(Z)}const it=s.enabledFeatures;if(it&&it.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){f=n.getBinding();const gt=f.getDepthInformation(ft[0]);gt&&gt.isValid&&gt.texture&&m.init(gt,s.renderState)}if(it&&it.includes("camera-access")&&x){t.state.unbindTexture(),f=n.getBinding();for(let gt=0;gt<ft.length;gt++){const Ct=ft[gt].camera;if(Ct){let Ot=g[Ct];Ot||(Ot=new Kc,g[Ct]=Ot);const Z=f.getCameraImage(Ct);Ot.sourceTexture=Z}}}}for(let ft=0;ft<R.length;ft++){const mt=y[ft],it=R[ft];mt!==null&&it!==void 0&&it.update(mt,j,c||a)}$&&$(F,j),j.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:j}),p=null}const at=new ch;at.setAnimationLoop(lt),this.setAnimationLoop=function(F){$=F},this.dispose=function(){}}}const U0=new se,vh=new Vt;vh.set(-1,0,0,0,1,0,0,0,1);function O0(i,t){function e(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,rh(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,v,A,M){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),f(m,g)):g.isMeshPhongMaterial?(r(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),h(m,g),g.isMeshPhysicalMaterial&&d(m,g,M)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),x(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(a(m,g),g.isLineDashedMaterial&&o(m,g)):g.isPointsMaterial?l(m,g,v,A):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,e(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===Ve&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,e(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===Ve&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,e(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,e(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);const v=t.get(g),A=v.envMap,M=v.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(U0.makeRotationFromEuler(M)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(vh),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,m.aoMapTransform))}function a(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform))}function o(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,v,A){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*v,m.scale.value=A*.5,g.map&&(m.map.value=g.map,e(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function f(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function h(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function d(m,g,v){m.ior.value=g.ior,g.diffuseRoughness>0&&(m.diffuseRoughness.value=g.diffuseRoughness,g.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=g.diffuseRoughnessMap,e(g.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Ve&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=g.iridescenceThicknessMaximum,g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function x(m,g){const v=t.get(g).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function F0(i,t,e,n){let s={},r={};function a(v,A){const M=A.program;n.uniformBlockBinding(v,M,s[v.id])}function o(v,A){let M=s[v.id];M===void 0&&(p(v),M=l(v),s[v.id]=M,v.addEventListener("dispose",m));const R=A.program;n.updateUBOMapping(v,R);const y=t.render.frame;r[v.id]!==y&&(c(v),r[v.id]=y)}function l(v){const A=i.createBuffer(),M=v.__size,R=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,A),i.bufferData(i.UNIFORM_BUFFER,M,R),i.bindBuffer(i.UNIFORM_BUFFER,null),A}function c(v){const A=s[v.id],M=v.uniforms,R=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,A);for(let y=0,_=M.length;y<_;y++){const E=M[y];if(Array.isArray(E))for(let L=0,P=E.length;L<P;L++)u(E[L],y,L,R);else u(E,y,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(v,A,M,R){if(h(v,A,M,R)===!0){const y=v.__offset,_=v.value;if(Array.isArray(_)){let E=0;for(let L=0;L<_.length;L++){const P=_[L],D=x(P,!0);f(P,v.__data,E),E+=D.storage/Float32Array.BYTES_PER_ELEMENT}}else f(_,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,y,v.__data)}}function f(v,A,M){typeof v=="number"||typeof v=="boolean"?A[M]=v:v.isMatrix3?(A[M]=v.elements[0],A[M+1]=v.elements[1],A[M+2]=v.elements[2],A[M+3]=0,A[M+4]=v.elements[3],A[M+5]=v.elements[4],A[M+6]=v.elements[5],A[M+7]=0,A[M+8]=v.elements[6],A[M+9]=v.elements[7],A[M+10]=v.elements[8],A[M+11]=0):ArrayBuffer.isView(v)?A.set(v.subarray(0,A.length-M),M):v.toArray(A,M)}function h(v,A,M,R){const y=v.value,_=A+"_"+M;if(Array.isArray(y)){R[_]===void 0&&(R[_]=[]);const E=R[_];let L=!1;for(let P=0;P<y.length;P++)d(y[P],E,P)===!0&&(L=!0);return L}return d(y,R,_)}function d(v,A,M){if(A[M]===void 0)return typeof v=="number"||typeof v=="boolean"?A[M]=v:ArrayBuffer.isView(v)?A[M]=v.slice():A[M]=v.clone(),!0;{const R=A[M];if(typeof v=="number"||typeof v=="boolean"){if(R!==v)return A[M]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(R.equals(v)===!1)return R.copy(v),!0}}return!1}function p(v){const A=v.uniforms;let M=0;const R=16;for(let _=0,E=A.length;_<E;_++){const L=Array.isArray(A[_])?A[_]:[A[_]];for(let P=0,D=L.length;P<D;P++){const H=L[P],X=Array.isArray(H.value)?H.value:[H.value],T=Array.isArray(A[_])||Array.isArray(H.value);let I=M;for(let z=0,J=X.length;z<J;z++){const G=X[z],q=x(G,T),$=M%R,lt=$%q.boundary,at=$+lt;M+=lt,at!==0&&R-at<q.storage&&(M+=R-at),z===0&&(I=M),M+=q.storage}const B=H.type==="int"?Int32Array:H.type==="uint"?Uint32Array:Float32Array;H.__data=new B((M-I)/Float32Array.BYTES_PER_ELEMENT),H.__offset=I}}const y=M%R;return y>0&&(M+=R-y),v.__size=M,v.__cache={},this}function x(v,A){const M={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(M.boundary=4,M.storage=4):v.isVector2?(M.boundary=8,M.storage=8):v.isVector3||v.isColor?(M.boundary=16,M.storage=12):v.isVector4?(M.boundary=16,M.storage=16):v.isMatrix3?(M.boundary=16,M.storage=48):v.isMatrix4?(M.boundary=16,M.storage=64):v.isTexture?Ht("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(M.boundary=16,M.storage=v.byteLength):Ht("WebGLRenderer: Unsupported uniform value type.",v),A===!0&&(M.boundary=16,M.storage=Math.ceil(M.storage/16)*16),M}function m(v){const A=v.target;A.removeEventListener("dispose",m),i.deleteBuffer(s[A.id]),delete s[A.id],delete r[A.id]}function g(){for(const v in s)i.deleteBuffer(s[v]);s={},r={}}return{bind:a,update:o,dispose:g}}const B0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let ln=null;function z0(){return ln===null&&(ln=new $u(B0,16,16,ti,xn),ln.name="DFG_LUT",ln.minFilter=ke,ln.magFilter=ke,ln.wrapS=wn,ln.wrapT=wn,ln.generateMipmaps=!1,ln.needsUpdate=!0),ln}class H0{constructor(t={}){const{canvas:e=Su(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:d=qe}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;const x=d,m=new Set([no,eo,to]),g=new Set([qe,_n,is,Ri,Qa,ja]),v=new Uint32Array(4),A=new Int32Array(4),M={textures:[],min:[],max:[],resolution:[]};let R=null,y=null;const _=[],E=[];let L=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Rn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let D=!1,H=null,X=null,T=null,I=null;this._outputColorSpace=Ke;let B=0,z=0,J=null,G=-1,q=null;const $=new ge,lt=new ge;let at=null;const F=new jt(0);let j=0,ft=e.width,mt=e.height,it=1,st=null,Bt=null;const gt=new ge(0,0,ft,mt),Ct=new ge(0,0,ft,mt);let Ot=!1;const Z=new rs,ot=new ao;let rt=!1,Tt=!1;const pt=new se,kt=new w,Lt=new ge,Xt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let qt=!1;function te(){return J===null?it:1}let O=n;function ve(b,U){return e.getContext(b,U)}let $t,fe,yt,xe,zt,Gt,C,S,V,ct,nt,_t,Et,Q,tt,vt,N,et,K,Mt,dt,xt,Ut;try{const b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Ja}`),e.addEventListener("webglcontextlost",Ft,!1),e.addEventListener("webglcontextrestored",Yt,!1),e.addEventListener("webglcontextcreationerror",At,!1),O===null){const U="webgl2";if(O=ve(U,b),O===null)throw ve(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Zt()}catch(b){throw e.removeEventListener("webglcontextlost",Ft,!1),e.removeEventListener("webglcontextrestored",Yt,!1),e.removeEventListener("webglcontextcreationerror",At,!1),ae("WebGLRenderer: "+b.message),b}function Zt(){$t=new Vm(O),$t.init(),dt=new P0(O,$t),fe=new Dm(O,$t,t,dt),yt=new R0(O,$t),fe.reversedDepthBuffer&&h&&yt.buffers.depth.setReversed(!0),X=O.createFramebuffer(),T=O.createFramebuffer(),I=O.createFramebuffer(),xe=new Ym(O),zt=new p0,Gt=new C0(O,$t,yt,zt,fe,dt,xe),C=new km(P),S=new Zf(O),xt=new Pm(O,S),V=new Wm(O,S,xe,xt),ct=new Zm(O,V,S,xt,xe),et=new qm(O,fe,Gt),tt=new Nm(zt),nt=new d0(P,C,$t,fe,xt,tt),_t=new O0(P,zt),Et=new g0,Q=new y0($t),N=new Cm(P,C,yt,ct,p,l),vt=new w0(P,ct,fe),Ut=new F0(O,xe,fe,yt),K=new Lm(O,$t,xe),Mt=new Xm(O,$t,xe),xe.programs=nt.programs,P.capabilities=fe,P.extensions=$t,P.properties=zt,P.renderLists=Et,P.shadowMap=vt,P.state=yt,P.info=xe}x!==qe&&(L=new Jm(x,e.width,e.height,o,s,r));const ut=new I0(P,O);this.xr=ut,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){const b=$t.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=$t.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return it},this.setPixelRatio=function(b){b!==void 0&&(it=b,this.setSize(ft,mt,!1))},this.getSize=function(b){return b.set(ft,mt)},this.setSize=function(b,U,Y=!0){if(ut.isPresenting){Ht("WebGLRenderer: Can't change size while VR device is presenting.");return}ft=b,mt=U,e.width=Math.floor(b*it),e.height=Math.floor(U*it),Y===!0&&(e.style.width=b+"px",e.style.height=U+"px"),L!==null&&L.setSize(e.width,e.height),this.setViewport(0,0,b,U)},this.getDrawingBufferSize=function(b){return b.set(ft*it,mt*it).floor()},this.setDrawingBufferSize=function(b,U,Y){ft=b,mt=U,it=Y,e.width=Math.floor(b*Y),e.height=Math.floor(U*Y),this.setViewport(0,0,b,U)},this.setEffects=function(b){if(x===qe){ae("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let U=0;U<b.length;U++)if(b[U].isOutputPass===!0){Ht("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}L.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy($)},this.getViewport=function(b){return b.copy(gt)},this.setViewport=function(b,U,Y,k){b.isVector4?gt.set(b.x,b.y,b.z,b.w):gt.set(b,U,Y,k),yt.viewport($.copy(gt).multiplyScalar(te()).round())},this.getScissor=function(b){return b.copy(Ct)},this.setScissor=function(b,U,Y,k){b.isVector4?Ct.set(b.x,b.y,b.z,b.w):Ct.set(b,U,Y,k),yt.scissor(lt.copy(Ct).multiplyScalar(te()).round())},this.getScissorTest=function(){return Ot},this.setScissorTest=function(b){yt.setScissorTest(Ot=b)},this.setOpaqueSort=function(b){st=b},this.setTransparentSort=function(b){Bt=b},this.getClearColor=function(b){return b.copy(N.getClearColor())},this.setClearColor=function(){N.setClearColor(...arguments)},this.getClearAlpha=function(){return N.getClearAlpha()},this.setClearAlpha=function(){N.setClearAlpha(...arguments)},this.clear=function(b=!0,U=!0,Y=!0){let k=0;if(b){let W=!1;if(J!==null){const bt=J.texture.format;W=m.has(bt)}if(W){const bt=J.texture.type,Pt=g.has(bt),St=N.getClearColor(),Rt=N.getClearAlpha(),It=St.r,Wt=St.g,ee=St.b;Pt?(v[0]=It,v[1]=Wt,v[2]=ee,v[3]=Rt,O.clearBufferuiv(O.COLOR,0,v)):(A[0]=It,A[1]=Wt,A[2]=ee,A[3]=Rt,O.clearBufferiv(O.COLOR,0,A))}else k|=O.COLOR_BUFFER_BIT}U&&(k|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(k|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&O.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),H=b},this.dispose=function(){e.removeEventListener("webglcontextlost",Ft,!1),e.removeEventListener("webglcontextrestored",Yt,!1),e.removeEventListener("webglcontextcreationerror",At,!1),N.dispose(),Et.dispose(),Q.dispose(),Gt.dispose(),zt.dispose(),C.dispose(),ct.dispose(),V.dispose(),xt.dispose(),Ut.dispose(),nt.dispose(),ut.dispose(),ut.removeEventListener("sessionstart",To),ut.removeEventListener("sessionend",Ao),Vn.stop()};function Ft(b){b.preventDefault(),qo("WebGLRenderer: Context Lost."),D=!0}function Yt(){qo("WebGLRenderer: Context Restored."),D=!1;const b=xe.autoReset,U=vt.enabled,Y=vt.autoUpdate,k=vt.needsUpdate,W=vt.type;Zt(),xe.autoReset=b,vt.enabled=U,vt.autoUpdate=Y,vt.needsUpdate=k,vt.type=W}function At(b){ae("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function he(b){const U=b.target;U.removeEventListener("dispose",he),Ae(U)}function Ae(b){Pn(b),zt.remove(b)}function Pn(b){const U=zt.get(b).programs;U!==void 0&&(U.forEach(function(Y){nt.releaseProgram(Y)}),b.isShaderMaterial&&nt.releaseShaderCache(b))}this.renderBufferDirect=function(b,U,Y,k,W,bt){U===null&&(U=Xt);const Pt=W.isMesh&&W.matrixWorld.determinantAffine()<0,St=Rh(b,U,Y,k,W);yt.setMaterial(k,Pt);let Rt=Y.index,It=1;if(k.wireframe===!0){if(Rt=V.getWireframeAttribute(Y),Rt===void 0)return;It=2}const Wt=Y.drawRange,ee=Y.attributes.position;let Dt=Wt.start*It,ne=(Wt.start+Wt.count)*It;bt!==null&&(Dt=Math.max(Dt,bt.start*It),ne=Math.min(ne,(bt.start+bt.count)*It)),Rt!==null?(Dt=Math.max(Dt,0),ne=Math.min(ne,Rt.count)):ee!=null&&(Dt=Math.max(Dt,0),ne=Math.min(ne,ee.count));const Me=ne-Dt;if(Me<0||Me===1/0)return;xt.setup(W,k,St,Y,Rt);let pe,de=K;if(Rt!==null&&(pe=S.get(Rt),de=Mt,de.setIndex(pe)),W.isMesh)k.wireframe===!0?(yt.setLineWidth(k.wireframeLinewidth*te()),de.setMode(O.LINES)):de.setMode(O.TRIANGLES);else if(W.isLine){let Ne=k.linewidth;Ne===void 0&&(Ne=1),yt.setLineWidth(Ne*te()),W.isLineSegments?de.setMode(O.LINES):W.isLineLoop?de.setMode(O.LINE_LOOP):de.setMode(O.LINE_STRIP)}else W.isPoints?de.setMode(O.POINTS):W.isSprite&&de.setMode(O.TRIANGLES);if(W.isBatchedMesh)if($t.get("WEBGL_multi_draw"))de.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{const Ne=W._multiDrawStarts,Nt=W._multiDrawCounts,Fe=W._multiDrawCount,oe=Rt?S.get(Rt).bytesPerElement:1,Wn=zt.get(k).currentProgram.getUniforms();for(let Ie=0;Ie<Fe;Ie++)Wn.setValue(O,"_gl_DrawID",Ie),de.render(Ne[Ie]/oe,Nt[Ie])}else if(W.isInstancedMesh)de.renderInstances(Dt,Me,W.count);else if(Y.isInstancedBufferGeometry){const Ne=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Nt=Math.min(Y.instanceCount,Ne);de.renderInstances(Dt,Me,Nt)}else de.render(Dt,Me)};function bo(b,U,Y,k){H!==null&&b.isNodeMaterial&&H.setObject(k,b),rt===!0&&tt.setState(b,Y,!1),b.transparent===!0&&b.side===An&&b.forceSinglePass===!1?(b.side=Ve,b.needsUpdate=!0,Oi(b,U,k),b.side=jn,b.needsUpdate=!0,Oi(b,U,k),b.side=An):Oi(b,U,k)}this.compile=function(b,U,Y=null){Y===null&&(Y=b),H!==null&&H.renderStart(b,U,Y),y=Q.get(Y),y.init(U),E.push(y),Y.traverseVisible(function(W){W.isLight&&W.layers.test(U.layers)&&(y.pushLight(W),W.castShadow&&y.pushShadow(W))}),b!==Y&&b.traverseVisible(function(W){W.isLight&&W.layers.test(U.layers)&&(y.pushLight(W),W.castShadow&&y.pushShadow(W))}),y.setupLights(),H!==null&&H.updateLights(y.state.lightsArray),Tt=this.localClippingEnabled,rt=tt.init(this.clippingPlanes,Tt),rt===!0&&tt.setGlobalState(this.clippingPlanes,U),H!==null&&vt.render(y.state.shadowsArray,Y,U);const k=new Set;return b.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;const bt=W.material;if(bt)if(Array.isArray(bt))for(let Pt=0;Pt<bt.length;Pt++){const St=bt[Pt];bo(St,Y,U,W),k.add(St)}else bo(bt,Y,U,W),k.add(bt)}),y=E.pop(),H!==null&&H.renderEnd(),k},this.compileAsync=function(b,U,Y=null){const k=this.compile(b,U,Y);return new Promise(W=>{function bt(){if(k.forEach(function(Pt){const Rt=zt.get(Pt).currentProgram;(Rt===void 0||Rt.isReady())&&k.delete(Pt)}),k.size===0){W(b);return}setTimeout(bt,10)}$t.get("KHR_parallel_shader_compile")!==null?bt():setTimeout(bt,10)})};let fr=null;function Ah(b){fr&&fr(b)}function To(){Vn.stop()}function Ao(){Vn.start()}const Vn=new ch;Vn.setAnimationLoop(Ah),typeof self<"u"&&Vn.setContext(self),this.setAnimationLoop=function(b){fr=b,ut.setAnimationLoop(b),b===null?Vn.stop():Vn.start()},ut.addEventListener("sessionstart",To),ut.addEventListener("sessionend",Ao),this.render=function(b,U){if(U!==void 0&&U.isCamera!==!0){ae("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;H!==null&&H.renderStart(b,U);const Y=ut.enabled===!0&&ut.isPresenting===!0,k=L!==null&&(J===null||Y)&&L.begin(P,J);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),ut.enabled===!0&&ut.isPresenting===!0&&(L===null||L.isCompositing()===!1)&&(ut.cameraAutoUpdate===!0&&ut.updateCamera(U),U=ut.getCamera()),b.isScene===!0&&b.onBeforeRender(P,b,U,J),y=Q.get(b,E.length),y.init(U),y.state.textureUnits=Gt.getTextureUnits(),E.push(y),pt.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),U.isArrayCamera?ot.setFromArrayCamera(U):Z.setFromProjectionMatrix(pt,sn,U.reversedDepth),Tt=this.localClippingEnabled,rt=tt.init(this.clippingPlanes,Tt),R=Et.get(b,_.length),R.init(),_.push(R),this.info.render.frame++,ut.enabled===!0&&ut.isPresenting===!0){const Pt=P.xr.getDepthSensingMesh();Pt!==null&&dr(Pt,U,-1/0,P.sortObjects)}dr(b,U,0,P.sortObjects),R.finish(),H!==null&&H.updateLights(y.state.lightsArray),P.sortObjects===!0&&R.sort(st,Bt),qt=ut.enabled===!1||ut.isPresenting===!1||ut.hasDepthSensing()===!1,qt&&N.addToRenderList(R,b),this.info.autoReset===!0&&this.info.reset(),rt===!0&&tt.beginShadows();const W=y.state.shadowsArray;if(vt.render(W,b,U),rt===!0&&tt.endShadows(),(k&&L.hasRenderPass())===!1){const Pt=R.opaque,St=R.transmissive;if(y.setupLights(),U.isArrayCamera){const Rt=U.cameras;if(St.length>0)for(let It=0,Wt=Rt.length;It<Wt;It++){const ee=Rt[It];Ro(Pt,St,b,ee)}qt&&N.render(b);for(let It=0,Wt=Rt.length;It<Wt;It++){const ee=Rt[It];wo(R,b,ee,ee.viewport)}}else St.length>0&&Ro(Pt,St,b,U),qt&&N.render(b),wo(R,b,U)}J!==null&&z===0&&(Gt.updateMultisampleRenderTarget(J),Gt.updateRenderTargetMipmap(J)),k&&L.end(P),b.isScene===!0&&b.onAfterRender(P,b,U),xt.resetDefaultState(),G=-1,q=null,E.pop(),E.length>0?(y=E[E.length-1],Gt.setTextureUnits(y.state.textureUnits),rt===!0&&tt.setGlobalState(P.clippingPlanes,y.state.camera)):y=null,_.pop(),_.length>0?R=_[_.length-1]:R=null,H!==null&&H.renderEnd()};function dr(b,U,Y,k){if(b.visible===!1)return;if(b.layers.test(U.layers)){if(b.isGroup)Y=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(U);else if(b.isLight)y.pushLight(b),b.castShadow&&y.pushShadow(b);else if(b.isSprite){const Pt=U.isArrayCamera?ot:Z;if(!b.frustumCulled||b.intersectsFrustum(Pt)){k&&Lt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(pt);const St=ct.update(b),Rt=b.material;Rt.visible&&R.push(b,St,Rt,Y,Lt.z,null,U)}}else if(b.isMesh||b.isLine||b.isPoints){const Pt=U.isArrayCamera?ot:Z;if(!b.frustumCulled||b.intersectsFrustum(Pt)){const St=ct.update(b),Rt=b.material;if(k&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Lt.copy(b.boundingSphere.center)):(St.boundingSphere===null&&St.computeBoundingSphere(),Lt.copy(St.boundingSphere.center)),Lt.applyMatrix4(b.matrixWorld).applyMatrix4(pt)),Array.isArray(Rt)){const It=St.groups;for(let Wt=0,ee=It.length;Wt<ee;Wt++){const Dt=It[Wt],ne=Rt[Dt.materialIndex];ne&&ne.visible&&R.push(b,St,ne,Y,Lt.z,Dt,U)}}else Rt.visible&&R.push(b,St,Rt,Y,Lt.z,null,U)}}}const bt=b.children;for(let Pt=0,St=bt.length;Pt<St;Pt++)dr(bt[Pt],U,Y,k)}function wo(b,U,Y,k){const{opaque:W,transmissive:bt,transparent:Pt}=b;y.setupLightsView(Y),rt===!0&&tt.setGlobalState(P.clippingPlanes,Y),k&&yt.viewport($.copy(k)),W.length>0&&ps(W,U,Y),bt.length>0&&ps(bt,U,Y),Pt.length>0&&ps(Pt,U,Y),yt.buffers.depth.setTest(!0),yt.buffers.depth.setMask(!0),yt.buffers.color.setMask(!0),yt.setPolygonOffset(!1)}function Ro(b,U,Y,k){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(y.state.transmissionRenderTarget[k.id]===void 0){const Dt=$t.has("EXT_color_buffer_half_float")||$t.has("EXT_color_buffer_float");y.state.transmissionRenderTarget[k.id]=new mn(1,1,{generateMipmaps:!0,type:Dt?xn:qe,minFilter:Bn,samples:Math.max(4,fe.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ie.workingColorSpace})}const bt=y.state.transmissionRenderTarget[k.id],Pt=k.viewport||$;bt.setSize(Pt.z*P.transmissionResolutionScale,Pt.w*P.transmissionResolutionScale);const St=P.getRenderTarget(),Rt=P.getActiveCubeFace(),It=P.getActiveMipmapLevel();P.setRenderTarget(bt),P.getClearColor(F),j=P.getClearAlpha(),j<1&&P.setClearColor(16777215,.5),P.clear(),qt&&N.render(Y);const Wt=P.toneMapping;P.toneMapping=Rn;const ee=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),y.setupLightsView(k),rt===!0&&tt.setGlobalState(P.clippingPlanes,k),ps(b,Y,k),Gt.updateMultisampleRenderTarget(bt),Gt.updateRenderTargetMipmap(bt),$t.has("WEBGL_multisampled_render_to_texture")===!1){let Dt=!1;for(let ne=0,Me=U.length;ne<Me;ne++){const pe=U[ne],{object:de,geometry:Ne,material:Nt,group:Fe}=pe;if(Nt.side===An&&de.layers.test(k.layers)){const oe=Nt.side;Nt.side=Ve,Nt.needsUpdate=!0,Co(de,Y,k,Ne,Nt,Fe),Nt.side=oe,Nt.needsUpdate=!0,Dt=!0}}Dt===!0&&(Gt.updateMultisampleRenderTarget(bt),Gt.updateRenderTargetMipmap(bt))}P.setRenderTarget(St,Rt,It),P.setClearColor(F,j),ee!==void 0&&(k.viewport=ee),P.toneMapping=Wt}function ps(b,U,Y){const k=U.isScene===!0?U.overrideMaterial:null;for(let W=0,bt=b.length;W<bt;W++){const Pt=b[W],{object:St,geometry:Rt,group:It}=Pt;let Wt=Pt.material;Wt.allowOverride===!0&&k!==null&&(Wt=k),St.layers.test(Y.layers)&&Co(St,U,Y,Rt,Wt,It)}}function Co(b,U,Y,k,W,bt){H!==null&&W.isNodeMaterial&&H.setObject(b,W),b.onBeforeRender(P,U,Y,k,W,bt),b.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),W.onBeforeRender(P,U,Y,k,b,bt),W.transparent===!0&&W.side===An&&W.forceSinglePass===!1?(W.side=Ve,W.needsUpdate=!0,P.renderBufferDirect(Y,U,k,W,b,bt),W.side=jn,W.needsUpdate=!0,P.renderBufferDirect(Y,U,k,W,b,bt),W.side=An):P.renderBufferDirect(Y,U,k,W,b,bt),b.onAfterRender(P,U,Y,k,W,bt)}function Po(b){let U=0;for(const Y of b)Y.texture!==null&&U++;return U}function Oi(b,U,Y){U.isScene!==!0&&(U=Xt);const k=zt.get(b),W=y.state.lights,bt=y.state.shadowsArray,Pt=W.state.version,St=nt.getParameters(b,W.state,bt,U,Y,y.state.lightProbeGridArray),Rt=nt.getProgramCacheKey(St);let It=k.programs;k.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?U.environment:null,k.fog=U.fog;const Wt=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;k.envMap=C.get(b.envMap||k.environment,Wt),k.envMapRotation=k.environment!==null&&b.envMap===null?U.environmentRotation:b.envMapRotation,It===void 0&&(b.addEventListener("dispose",he),It=new Map,k.programs=It,k.programVariants=new Map);let ee=It.get(Rt);if(ee!==void 0){if(k.currentProgram===ee&&k.lightsStateVersion===Pt)return Do(b,St),ee}else St.uniforms=nt.getUniforms(b),H!==null&&b.isNodeMaterial&&H.build(b,Y,St),b.onBeforeCompile(St,P),ee=nt.acquireProgram(St,Rt),It.set(Rt,ee),k.uniforms=St.uniforms;const Dt=k.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Dt.clippingPlanes=tt.uniform),Do(b,St),k.needsLights=Ph(b),k.lightsStateVersion=Pt,k.needsLights&&(Dt.ambientLightColor.value=W.state.ambient,Dt.lightProbe.value=W.state.probe,Dt.sunLights.value=W.state.sun,Dt.sunLightShadows.value=W.state.sunShadow,Dt.directionalLights.value=W.state.directional,Dt.directionalLightShadows.value=W.state.directionalShadow,Dt.spotLights.value=W.state.spot,Dt.spotLightShadows.value=W.state.spotShadow,Dt.rectAreaLights.value=W.state.rectArea,Dt.ltc_1.value=W.state.rectAreaLTC1,Dt.ltc_2.value=W.state.rectAreaLTC2,Dt.pointLights.value=W.state.point,Dt.pointLightShadows.value=W.state.pointShadow,Dt.hemisphereLights.value=W.state.hemi,Dt.sunShadowMatrix.value=W.state.sunShadowMatrix,Dt.sunShadowCascade.value=W.state.sunShadowCascade,Dt.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Dt.spotLightMatrix.value=W.state.spotLightMatrix,Dt.spotLightMap.value=W.state.spotLightMap,Dt.pointShadowMatrix.value=W.state.pointShadowMatrix),k.numLightProbeGrids=Po(y.state.lightProbeGridArray),k.currentProgram=ee,k.uniformsList=null,ee}function wh(b,U,Y,k,W){const bt=zt.get(b),Pt=bt.currentProgram.id+","+k+","+W;let St=bt.programVariants.get(Pt);return St===void 0?(St=Oi(b,U,Y),bt.programVariants.set(Pt,St)):(bt.currentProgram=St,bt.uniformsList=null,bt.outputColorSpace=k,bt.toneMapping=W),St}function Lo(b){if(b.uniformsList===null){const U=b.currentProgram.getUniforms();b.uniformsList=$s.seqWithValue(U.seq,b.uniforms)}return b.uniformsList}function Do(b,U){const Y=zt.get(b);Y.outputColorSpace=U.outputColorSpace,Y.batching=U.batching,Y.batchingColor=U.batchingColor,Y.instancing=U.instancing,Y.instancingColor=U.instancingColor,Y.instancingMorph=U.instancingMorph,Y.skinning=U.skinning,Y.morphTargets=U.morphTargets,Y.morphNormals=U.morphNormals,Y.morphColors=U.morphColors,Y.morphTargetsCount=U.morphTargetsCount,Y.numClippingPlanes=U.numClippingPlanes,Y.numIntersection=U.numClipIntersection,Y.vertexAlphas=U.vertexAlphas,Y.vertexTangents=U.vertexTangents,Y.toneMapping=U.toneMapping}function Rh(b,U,Y,k,W){U.isScene!==!0&&(U=Xt),Gt.resetTextureUnits();const bt=U.fog,Pt=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?U.environment:null,St=J===null?P.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:ie.workingColorSpace,Rt=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,It=C.get(k.envMap||Pt,Rt),Wt=k.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,ee=!!Y.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Dt=!!Y.morphAttributes.position,ne=!!Y.morphAttributes.normal,Me=!!Y.morphAttributes.color;let pe=Rn;k.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(pe=P.toneMapping);const de=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Ne=de!==void 0?de.length:0,Nt=zt.get(k),Fe=y.state.lights;if(rt===!0&&(Tt===!0||b!==q)){const me=b===q&&k.id===G;tt.setState(k,b,me)}let oe=!1,Wn=!1;k.version===Nt.__version?Nt.needsLights&&Nt.lightsStateVersion!==Fe.state.version||W.isBatchedMesh&&Nt.batching===!1||!W.isBatchedMesh&&Nt.batching===!0||W.isBatchedMesh&&Nt.batchingColor===!0&&W._colorsTexture===null||W.isBatchedMesh&&Nt.batchingColor===!1&&W._colorsTexture!==null||W.isInstancedMesh&&Nt.instancing===!1||!W.isInstancedMesh&&Nt.instancing===!0||W.isSkinnedMesh&&Nt.skinning===!1||!W.isSkinnedMesh&&Nt.skinning===!0||W.isInstancedMesh&&Nt.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Nt.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Nt.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Nt.instancingMorph===!1&&W.morphTexture!==null||Nt.envMap!==It||k.fog===!0&&Nt.fog!==bt||Nt.numClippingPlanes!==void 0&&(Nt.numClippingPlanes!==tt.numPlanes||Nt.numIntersection!==tt.numIntersection)||Nt.vertexAlphas!==Wt||Nt.vertexTangents!==ee||Nt.morphTargets!==Dt||Nt.morphNormals!==ne||Nt.morphColors!==Me||Nt.morphTargetsCount!==Ne||Nt.numLightProbeGrids!==Po(y.state.lightProbeGridArray)?oe=!0:(Nt.outputColorSpace!==St||Nt.toneMapping!==pe)&&(Wn=!0):(oe=!0,Nt.__version=k.version);let Ie=Nt.currentProgram;(oe===!0||Wn===!0)&&(Ie=Wn===!0?wh(k,U,W,St,pe):Oi(k,U,W),H&&k.isNodeMaterial&&H.onUpdateProgram(k,Ie,Nt));let ms=!1,Ln=!1,Xn=!1;const re=Ie.getUniforms(),Ce=Nt.uniforms;if(yt.useProgram(Ie.program)&&(ms=!0,Ln=!0,Xn=!0),k.id!==G&&(G=k.id,Ln=!0),ms||q!==b){yt.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),re.setValue(O,"projectionMatrix",b.projectionMatrix),re.setValue(O,"viewMatrix",b.matrixWorldInverse);const we=re.map.cameraPosition;we!==void 0&&we.setValue(O,kt.setFromMatrixPosition(b.matrixWorld)),fe.logarithmicDepthBuffer&&re.setValue(O,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&re.setValue(O,"isOrthographic",b.isOrthographicCamera===!0),q!==b&&(q=b,Ln=!0,Xn=!0)}if(Nt.needsLights&&(Fe.state.sunShadowMap.length>0&&re.setValue(O,"sunShadowMap",Fe.state.sunShadowMap,Gt),Fe.state.directionalShadowMap.length>0&&re.setValue(O,"directionalShadowMap",Fe.state.directionalShadowMap,Gt),Fe.state.spotShadowMap.length>0&&re.setValue(O,"spotShadowMap",Fe.state.spotShadowMap,Gt),Fe.state.pointShadowMap.length>0&&re.setValue(O,"pointShadowMap",Fe.state.pointShadowMap,Gt)),W.isSkinnedMesh){re.setOptional(O,W,"bindMatrix"),re.setOptional(O,W,"bindMatrixInverse");const me=W.skeleton;me&&(me.boneTexture===null&&me.computeBoneTexture(),re.setValue(O,"boneTexture",me.boneTexture,Gt))}W.isBatchedMesh&&(re.setOptional(O,W,"batchingTexture"),re.setValue(O,"batchingTexture",W._matricesTexture,Gt),re.setOptional(O,W,"batchingIdTexture"),re.setValue(O,"batchingIdTexture",W._indirectTexture,Gt),re.setOptional(O,W,"batchingColorTexture"),W._colorsTexture!==null&&re.setValue(O,"batchingColorTexture",W._colorsTexture,Gt));const Je=Y.morphAttributes;if((Je.position!==void 0||Je.normal!==void 0||Je.color!==void 0)&&et.update(W,Y,Ie),(Ln||Nt.receiveShadow!==W.receiveShadow)&&(Nt.receiveShadow=W.receiveShadow,re.setValue(O,"receiveShadow",W.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&U.environment!==null&&(Ce.envMapIntensity.value=U.environmentIntensity),Ce.dfgLUT!==void 0&&(Ce.dfgLUT.value=z0()),Ln){if(re.setValue(O,"toneMappingExposure",P.toneMappingExposure),Nt.needsLights&&Ch(Ce,Xn),bt&&k.fog===!0&&_t.refreshFogUniforms(Ce,bt),_t.refreshMaterialUniforms(Ce,k,it,mt,y.state.transmissionRenderTarget[b.id]),Nt.needsLights&&Nt.numLightProbeGrids>0){const me=M;let we=0;for(const Mn of y.state.lightProbeGridArray)Mn.texture!==null&&(me.textures[we]=Mn.texture,me.min[we]=Mn.boundingBox.min,me.max[we]=Mn.boundingBox.max,me.resolution[we]=Mn.resolution,we++);for(const Mn in me)me[Mn].length=we;Ce.probesSH.value=me.textures,Ce.probesMin.value=me.min,Ce.probesMax.value=me.max,Ce.probesResolution.value=me.resolution}$s.upload(O,Lo(Nt),Ce,Gt)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&($s.upload(O,Lo(Nt),Ce,Gt),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&re.setValue(O,"center",W.center),re.setValue(O,"modelViewMatrix",W.modelViewMatrix),re.setValue(O,"normalMatrix",W.normalMatrix),re.setValue(O,"modelMatrix",W.matrixWorld),k.uniformsGroups!==void 0){const me=k.uniformsGroups;for(let we=0,Mn=me.length;we<Mn;we++){const Io=me[we];Ut.update(Io,Ie),Ut.bind(Io,Ie)}}return Ie}function Ch(b,U){b.ambientLightColor.needsUpdate=U,b.lightProbe.needsUpdate=U,b.sunLights.needsUpdate=U,b.sunLightShadows.needsUpdate=U,b.directionalLights.needsUpdate=U,b.directionalLightShadows.needsUpdate=U,b.pointLights.needsUpdate=U,b.pointLightShadows.needsUpdate=U,b.spotLights.needsUpdate=U,b.spotLightShadows.needsUpdate=U,b.rectAreaLights.needsUpdate=U,b.hemisphereLights.needsUpdate=U}function Ph(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return B},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return J},this.setRenderTargetTextures=function(b,U,Y){const k=zt.get(b);k.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),zt.get(b.texture).__webglTexture=U,zt.get(b.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:Y,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,U){const Y=zt.get(b);Y.__webglFramebuffer=U,Y.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(b,U=0,Y=0){J=b,B=U,z=Y;let k=null,W=!1,bt=!1;if(b){const St=zt.get(b);if(St.__useDefaultFramebuffer!==void 0){yt.bindFramebuffer(O.FRAMEBUFFER,St.__webglFramebuffer),$.copy(b.viewport),lt.copy(b.scissor),at=b.scissorTest,yt.viewport($),yt.scissor(lt),yt.setScissorTest(at),G=-1;return}else if(St.__webglFramebuffer===void 0)Gt.setupRenderTarget(b);else if(St.__hasExternalTextures)Gt.rebindTextures(b,zt.get(b.texture).__webglTexture,zt.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const Wt=b.depthTexture;if(St.__boundDepthTexture!==Wt){if(Wt!==null&&zt.has(Wt)&&(b.width!==Wt.image.width||b.height!==Wt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Gt.setupDepthRenderbuffer(b)}}const Rt=b.texture;(Rt.isData3DTexture||Rt.isDataArrayTexture||Rt.isCompressedArrayTexture)&&(bt=!0);const It=zt.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(It[U])?k=It[U][Y]:k=It[U],W=!0):b.samples>0&&Gt.useMultisampledRTT(b)===!1?k=zt.get(b).__webglMultisampledFramebuffer:Array.isArray(It)?k=It[Y]:k=It,$.copy(b.viewport),lt.copy(b.scissor),at=b.scissorTest}else $.copy(gt).multiplyScalar(it).floor(),lt.copy(Ct).multiplyScalar(it).floor(),at=Ot;if(Y!==0&&(k=X),yt.bindFramebuffer(O.FRAMEBUFFER,k)&&yt.drawBuffers(b,k),yt.viewport($),yt.scissor(lt),yt.setScissorTest(at),W){const St=zt.get(b.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+U,St.__webglTexture,Y)}else if(bt){const St=U;for(let Rt=0;Rt<b.textures.length;Rt++){const It=zt.get(b.textures[Rt]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+Rt,It.__webglTexture,Y,St)}}else if(b!==null&&Y!==0){const St=zt.get(b.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,St.__webglTexture,Y)}G=-1};function No(b){const U=zt.get(b);return(U.__readFormat!==b.format||U.__readType!==b.type)&&(U.__readFormat=b.format,U.__readType=b.type,U.__formatReadable=fe.textureFormatReadable(b.format),U.__typeReadable=fe.textureTypeReadable(b.type)),U}this.readRenderTargetPixels=function(b,U,Y,k,W,bt,Pt,St=0){if(!(b&&b.isWebGLRenderTarget)){ae("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Rt=zt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Pt!==void 0&&(Rt=Rt[Pt],Array.isArray(Rt)&&(Rt=Rt[0])),Rt){yt.bindFramebuffer(O.FRAMEBUFFER,Rt);try{const It=b.textures[St],Wt=It.format,ee=It.type;b.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+St);const Dt=No(It);if(Dt.__formatReadable===!1){ae("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Dt.__typeReadable===!1){ae("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=b.width-k&&Y>=0&&Y<=b.height-W&&O.readPixels(U,Y,k,W,dt.convert(Wt),dt.convert(ee),bt)}finally{const It=J!==null?zt.get(J).__webglFramebuffer:null;yt.bindFramebuffer(O.FRAMEBUFFER,It)}}},this.readRenderTargetPixelsAsync=async function(b,U,Y,k,W,bt,Pt,St=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Rt=zt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Pt!==void 0&&(Rt=Rt[Pt],Array.isArray(Rt)&&(Rt=Rt[0])),Rt)if(U>=0&&U<=b.width-k&&Y>=0&&Y<=b.height-W){yt.bindFramebuffer(O.FRAMEBUFFER,Rt);const It=b.textures[St],Wt=It.format,ee=It.type;b.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+St);const Dt=No(It);if(Dt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Dt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ne=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,ne),O.bufferData(O.PIXEL_PACK_BUFFER,bt.byteLength,O.STREAM_READ),O.readPixels(U,Y,k,W,dt.convert(Wt),dt.convert(ee),0),O.bindBuffer(O.PIXEL_PACK_BUFFER,null);const Me=J!==null?zt.get(J).__webglFramebuffer:null;yt.bindFramebuffer(O.FRAMEBUFFER,Me);const pe=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await yu(O,pe,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,ne),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,bt),O.bindBuffer(O.PIXEL_PACK_BUFFER,null),O.deleteBuffer(ne),O.deleteSync(pe),bt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,U=null,Y=0){const k=Math.pow(2,-Y),W=Math.floor(b.image.width*k),bt=Math.floor(b.image.height*k),Pt=U!==null?U.x:0,St=U!==null?U.y:0;Gt.setTexture2D(b,0),O.copyTexSubImage2D(O.TEXTURE_2D,Y,0,0,Pt,St,W,bt),yt.unbindTexture()},this.copyTextureToTexture=function(b,U,Y=null,k=null,W=0,bt=0){let Pt,St,Rt,It,Wt,ee,Dt,ne,Me;const pe=b.isCompressedTexture?b.mipmaps[bt]:b.image;if(Y!==null)Pt=Y.max.x-Y.min.x,St=Y.max.y-Y.min.y,Rt=Y.isBox3?Y.max.z-Y.min.z:1,It=Y.min.x,Wt=Y.min.y,ee=Y.isBox3?Y.min.z:0;else{const re=Math.pow(2,-W);Pt=Math.floor(pe.width*re),St=Math.floor(pe.height*re),b.isDataArrayTexture?Rt=pe.depth:b.isData3DTexture?Rt=Math.floor(pe.depth*re):Rt=1,It=0,Wt=0,ee=0}k!==null?(Dt=k.x,ne=k.y,Me=k.z):(Dt=0,ne=0,Me=0);const de=dt.convert(U.format),Ne=dt.convert(U.type);let Nt;U.isData3DTexture?(Gt.setTexture3D(U,0),Nt=O.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Gt.setTexture2DArray(U,0),Nt=O.TEXTURE_2D_ARRAY):(Gt.setTexture2D(U,0),Nt=O.TEXTURE_2D),yt.activeTexture(O.TEXTURE0),yt.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,U.flipY),yt.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),yt.pixelStorei(O.UNPACK_ALIGNMENT,U.unpackAlignment);const Fe=yt.getParameter(O.UNPACK_ROW_LENGTH),oe=yt.getParameter(O.UNPACK_IMAGE_HEIGHT),Wn=yt.getParameter(O.UNPACK_SKIP_PIXELS),Ie=yt.getParameter(O.UNPACK_SKIP_ROWS),ms=yt.getParameter(O.UNPACK_SKIP_IMAGES);yt.pixelStorei(O.UNPACK_ROW_LENGTH,pe.width),yt.pixelStorei(O.UNPACK_IMAGE_HEIGHT,pe.height),yt.pixelStorei(O.UNPACK_SKIP_PIXELS,It),yt.pixelStorei(O.UNPACK_SKIP_ROWS,Wt),yt.pixelStorei(O.UNPACK_SKIP_IMAGES,ee);const Ln=b.isDataArrayTexture||b.isData3DTexture,Xn=U.isDataArrayTexture||U.isData3DTexture;if(b.isDepthTexture){const re=zt.get(b),Ce=zt.get(U),Je=zt.get(re.__renderTarget),me=zt.get(Ce.__renderTarget);yt.bindFramebuffer(O.READ_FRAMEBUFFER,Je.__webglFramebuffer),yt.bindFramebuffer(O.DRAW_FRAMEBUFFER,me.__webglFramebuffer);for(let we=0;we<Rt;we++)Ln&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,zt.get(b).__webglTexture,W,ee+we),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,zt.get(U).__webglTexture,bt,Me+we)),O.blitFramebuffer(It,Wt,It+Pt,Wt+St,Dt,ne,Dt+Pt,ne+St,O.DEPTH_BUFFER_BIT,O.NEAREST);yt.bindFramebuffer(O.READ_FRAMEBUFFER,null),yt.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(W!==0||b.isRenderTargetTexture||zt.has(b)){const re=zt.get(b),Ce=zt.get(U);yt.bindFramebuffer(O.READ_FRAMEBUFFER,T),yt.bindFramebuffer(O.DRAW_FRAMEBUFFER,I);for(let Je=0;Je<Rt;Je++)Ln?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,re.__webglTexture,W,ee+Je):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,re.__webglTexture,W),Xn?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ce.__webglTexture,bt,Me+Je):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Ce.__webglTexture,bt),W!==0?O.blitFramebuffer(It,Wt,It+Pt,Wt+St,Dt,ne,Dt+Pt,ne+St,O.COLOR_BUFFER_BIT,O.NEAREST):Xn?O.copyTexSubImage3D(Nt,bt,Dt,ne,Me+Je,It,Wt,Pt,St):O.copyTexSubImage2D(Nt,bt,Dt,ne,It,Wt,Pt,St);yt.bindFramebuffer(O.READ_FRAMEBUFFER,null),yt.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else Xn?b.isDataTexture||b.isData3DTexture?O.texSubImage3D(Nt,bt,Dt,ne,Me,Pt,St,Rt,de,Ne,pe.data):U.isCompressedArrayTexture?O.compressedTexSubImage3D(Nt,bt,Dt,ne,Me,Pt,St,Rt,de,pe.data):O.texSubImage3D(Nt,bt,Dt,ne,Me,Pt,St,Rt,de,Ne,pe):b.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,bt,Dt,ne,Pt,St,de,Ne,pe.data):b.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,bt,Dt,ne,pe.width,pe.height,de,pe.data):O.texSubImage2D(O.TEXTURE_2D,bt,Dt,ne,Pt,St,de,Ne,pe);yt.pixelStorei(O.UNPACK_ROW_LENGTH,Fe),yt.pixelStorei(O.UNPACK_IMAGE_HEIGHT,oe),yt.pixelStorei(O.UNPACK_SKIP_PIXELS,Wn),yt.pixelStorei(O.UNPACK_SKIP_ROWS,Ie),yt.pixelStorei(O.UNPACK_SKIP_IMAGES,ms),bt===0&&U.generateMipmaps===!0&&U.mipmapsAutoUpdate===!0&&O.generateMipmap(Nt),yt.unbindTexture()},this.initRenderTarget=function(b){zt.get(b).__webglFramebuffer===void 0&&Gt.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?Gt.setTextureCube(b,0):b.isData3DTexture?Gt.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?Gt.setTexture2DArray(b,0):Gt.setTexture2D(b,0),yt.unbindTexture()},this.resetState=function(){B=0,z=0,J=null,yt.reset(),xt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return sn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=ie._getDrawingBufferColorSpace(t),e.unpackColorSpace=ie._getUnpackColorSpace()}}const $l={type:"change"},mo={type:"start"},Mh={type:"end"},ks=new us,Ql=new cn,G0=Math.cos(70*Ru.DEG2RAD),ye=new w,Ge=2*Math.PI,le={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Zr=1e-6;class k0 extends Yf{constructor(t,e=null){super(t,e),this.state=le.NONE,this.target=new w,this.cursor=new w,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ei.ROTATE,MIDDLE:Ei.DOLLY,RIGHT:Ei.PAN},this.touches={ONE:Si.ROTATE,TWO:Si.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new w,this._lastQuaternion=new He,this._lastTargetPosition=new w,this._quat=new He().setFromUnitVectors(t.up,new w(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Rl,this._sphericalDelta=new Rl,this._scale=1,this._panOffset=new w,this._rotateStart=new ht,this._rotateEnd=new ht,this._rotateDelta=new ht,this._panStart=new ht,this._panEnd=new ht,this._panDelta=new ht,this._dollyStart=new ht,this._dollyEnd=new ht,this._dollyDelta=new ht,this._dollyDirection=new w,this._mouse=new ht,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=W0.bind(this),this._onPointerDown=V0.bind(this),this._onPointerUp=X0.bind(this),this._onContextMenu=Q0.bind(this),this._onMouseWheel=Z0.bind(this),this._onKeyDown=K0.bind(this),this._onTouchStart=J0.bind(this),this._onTouchMove=$0.bind(this),this._onMouseDown=Y0.bind(this),this._onMouseMove=q0.bind(this),this._interceptControlDown=j0.bind(this),this._interceptControlUp=t_.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=le.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent($l),this.update(),this.state=le.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){const e=this.object.position;ye.copy(e).sub(this.target),ye.applyQuaternion(this._quat),this._spherical.setFromVector3(ye),this.autoRotate&&this.state===le.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=Ge:n>Math.PI&&(n-=Ge),s<-Math.PI?s+=Ge:s>Math.PI&&(s-=Ge),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(ye.setFromSpherical(this._spherical),ye.applyQuaternion(this._quatInverse),e.copy(this.target).add(ye),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=ye.length();a=this._clampDistance(o*this._scale);const l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const o=new w(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new w(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=ye.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(ks.origin.copy(this.object.position),ks.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ks.direction))<G0?this.object.lookAt(this.target):(Ql.setFromNormalAndCoplanarPoint(this.object.up,this.target),ks.intersectPlane(Ql,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Zr||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Zr||this._lastTargetPosition.distanceToSquared(this.target)>Zr?(this.dispatchEvent($l),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?Ge/60*this.autoRotateSpeed*t:Ge/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){ye.setFromMatrixColumn(e,0),ye.multiplyScalar(-t),this._panOffset.add(ye)}_panUp(t,e){this.screenSpacePanning===!0?ye.setFromMatrixColumn(e,1):(ye.setFromMatrixColumn(e,0),ye.crossVectors(this.object.up,ye)),ye.multiplyScalar(t),this._panOffset.add(ye)}_pan(t,e){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;ye.copy(s).sub(this.target);let r=ye.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientY),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(Ge*this._rotateDelta.x/e.clientHeight),this._rotateUp(Ge*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(Ge*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-Ge*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(Ge*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-Ge*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(Ge*this._rotateDelta.x/e.clientHeight),this._rotateUp(Ge*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(t.pageX+e.x)*.5,o=(t.pageY+e.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new ht,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function V0(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function W0(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function X0(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Mh),this.state=le.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function Y0(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Ei.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=le.DOLLY;break;case Ei.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=le.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=le.ROTATE}break;case Ei.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=le.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=le.PAN}break;default:this.state=le.NONE}this.state!==le.NONE&&this.dispatchEvent(mo)}function q0(i){switch(this.state){case le.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case le.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case le.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Z0(i){this.enabled===!1||this.enableZoom===!1||this.state!==le.NONE||(i.preventDefault(),this.dispatchEvent(mo),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Mh))}function K0(i){this.enabled!==!1&&this._handleKeyDown(i)}function J0(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Si.ROTATE:if(this.enableRotate===!1){this.state=le.NONE;break}this._handleTouchStartRotate(i),this.state=le.TOUCH_ROTATE;break;case Si.PAN:if(this.enablePan===!1){this.state=le.NONE;break}this._handleTouchStartPan(i),this.state=le.TOUCH_PAN;break;default:this.state=le.NONE}break;case 2:switch(this.touches.TWO){case Si.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=le.TOUCH_DOLLY_PAN;break;case Si.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=le.TOUCH_DOLLY_ROTATE;break;default:this.state=le.NONE}break;default:this.state=le.NONE}this.state!==le.NONE&&this.dispatchEvent(mo)}function $0(i){switch(this._trackPointer(i),this.state){case le.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case le.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case le.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case le.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=le.NONE}}function Q0(i){this.enabled!==!1&&i.preventDefault()}function j0(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function t_(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class e_ extends Ee{constructor(t=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=t,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new ht(.5,.5),this.rotation2D=0,this.addEventListener("removed",function(){this.traverse(function(e){e.element&&e.element instanceof e.element.ownerDocument.defaultView.Element&&e.element.parentNode!==null&&e.element.remove()})})}copy(t,e){return super.copy(t,e),this.element=t.element.cloneNode(!0),this.center=t.center,this.rotation2D=t.rotation2D,this}}const _i=new w,jl=new se,tc=new se,ec=new w,nc=new w;class n_{constructor(t={}){const e=this;let n,s,r,a;const o={objects:new WeakMap},l=t.element!==void 0?t.element:document.createElement("div");l.style.overflow="hidden",this.domElement=l,this.sortObjects=!0,this.getSize=function(){return{width:n,height:s}},this.render=function(p,x){p.matrixWorldAutoUpdate===!0&&p.updateMatrixWorld(),x.parent===null&&x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),jl.copy(x.matrixWorldInverse),tc.multiplyMatrices(x.projectionMatrix,jl),u(p,p,x),this.sortObjects&&d(p)},this.setSize=function(p,x){n=p,s=x,r=n/2,a=s/2,l.style.width=p+"px",l.style.height=x+"px"};function c(p){p.isCSS2DObject&&(p.element.style.display="none");for(let x=0,m=p.children.length;x<m;x++)c(p.children[x])}function u(p,x,m){if(p.visible===!1){c(p);return}if(p.isCSS2DObject){_i.setFromMatrixPosition(p.matrixWorld),_i.applyMatrix4(tc);const g=_i.z>=-1&&_i.z<=1&&p.layers.test(m.layers)===!0,v=p.element;if(v.style.display=g===!0?"":"none",g===!0){p.onBeforeRender(e,x,m);const M=100*p.center.x,R=100*p.center.y;v.style.transformOrigin=`${M}% ${R}%`;const y=-p.rotation2D,_=_i.x*r+r,E=-_i.y*a+a;v.style.transform=`translate(${-M}%, ${-R}%) translate(${_}px, ${E}px) rotate(${y}rad)`,v.parentNode!==l&&l.appendChild(v),p.onAfterRender(e,x,m)}const A={distanceToCameraSquared:f(m,p)};o.objects.set(p,A)}for(let g=0,v=p.children.length;g<v;g++)u(p.children[g],x,m)}function f(p,x){return ec.setFromMatrixPosition(p.matrixWorld),nc.setFromMatrixPosition(x.matrixWorld),ec.distanceToSquared(nc)}function h(p){const x=[];return p.traverseVisible(function(m){m.isCSS2DObject&&x.push(m)}),x}function d(p){const x=h(p).sort(function(g,v){if(g.renderOrder!==v.renderOrder)return v.renderOrder-g.renderOrder;const A=o.objects.get(g).distanceToCameraSquared,M=o.objects.get(v).distanceToCameraSquared;return A-M}),m=x.length;for(let g=0,v=x.length;g<v;g++)x[g].element.style.zIndex=m-g}}}function Sh(i,t=!1){const e=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},a={},o=i[0].morphTargetsRelative,l=new De;l.morphTargetsRelative=o;let c=0;for(let u=0;u<i.length;++u){const f=i[u];let h=0,d=0;if(e!==(f.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const p in f.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;r[p]===void 0&&(r[p]=[]),r[p].push(f.attributes[p]),h++}if(h!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(o!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const p in f.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;if(f.morphAttributes[p].length!==i[0].morphAttributes[p].length)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have the same number of morph targets for the "'+p+'" morph attribute.'),null;a[p]===void 0&&(a[p]=[]),a[p].push(f.morphAttributes[p]),d++}if(d!==s.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of morph attributes."),null;if(t){let p;if(e)p=f.index.count;else if(f.attributes.position!==void 0)p=f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,u),c+=p}}if(e){let u=0;const f=[];for(let h=0;h<i.length;++h){const d=i[h].index;for(let p=0;p<d.count;++p)f.push(d.getX(p)+u);u+=i[h].attributes.position.count}l.setIndex(f)}for(const u in r){const f=ic(r[u]);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,f)}for(const u in a){const f=a[u][0].length;if(f!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let h=0;h<f;++h){const d=[];for(let x=0;x<a[u].length;++x)d.push(a[u][x][h]);const p=ic(d);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(p)}}}return l}function ic(i){let t,e,n,s=-1,r=0;for(let c=0;c<i.length;++c){const u=i[c];if(t===void 0&&(t=u.array.constructor),t!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=u.itemSize),e!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=u.count*e}const a=new t(r),o=new gn(a,e,n);let l=0;for(let c=0;c<i.length;++c){const u=i[c];if(u.isInterleavedBufferAttribute){const f=l/e;for(let h=0,d=u.count;h<d;h++)for(let p=0;p<e;p++){const x=u.getComponent(h,p);o.setComponent(h+f,p,x)}}else a.set(u.array,l);l+=u.count*e}return s!==void 0&&(o.gpuType=s),o}const Qt=(i,t)=>({...i,name:t}),ds=10,i_="#ece8e0",Ya=.006,xi=1.03,Vi=.005,s_=.5;function Ye(i,t,e,n,s){const r=new se().compose(e,new He().setFromEuler(n??new Pe),s??new w(1,1,1));return i.applyMatrix4(r),{geometry:i,colour:t}}function Qs(i,t,e,n,s=1,r){if(e==="straight")return;const a=new Float32Array(i.getAttribute("position").count),o=i.getAttribute("position"),l=new w,c=new w,u=new w;let f=0;if(r){for(let h=0;h<o.count;h++)f+=l.fromBufferAttribute(o,h).sub(t(l)).dot(r);f/=o.count}for(let h=0;h<o.count;h++){l.fromBufferAttribute(o,h),c.subVectors(l,t(l)),u.copy(l),r&&u.addScaledVector(r,f-c.dot(r));const d=Math.atan2(u.y-t(l).y,u.x-t(l).x),p=u.z/n*s,[x,m]=e==="wavy"?[.05,Math.sin(p*7)]:e==="curly"?[.09,Math.sin(d*7)*Math.sin(p*9)]:[.1,Math.sin(d*11)*Math.sin(p*14)];a[h]=.5+.5*m;const g=n*x*a[h]/Math.max(1e-6,c.length());l.addScaledVector(c,g),o.setXYZ(h,l.x,l.y,l.z)}return o.needsUpdate=!0,i.computeVertexNormals(),a}const r_=.75;function sc(i,t,e){return!t||!e?i:{...i,shade:t.map(n=>r_*n*n),tone:e}}const rc=16,ac=4,oc=i=>{const t=Math.min(1,Math.max(0,i));return t*t*(3-2*t)};function Vs(i){const t=Math.abs(i-Math.PI/2);return .96+.79*oc((t-.25)/.9)-.79*oc((t-1.5)/.5)}function lc(i,t,e,n,s,r,a){const o=[],l=[];for(let f=0;f<=e;f++)for(let h=0;h<=t;h++){const d=n+s*h/t,p=r(d)+(a(d)-r(d))*f/e;o.push(-i*Math.cos(d)*Math.sin(p),i*Math.cos(p),i*Math.sin(d)*Math.sin(p))}const c=(f,h)=>h*(t+1)+f;for(let f=0;f<e;f++)for(let h=0;h<t;h++){const d=c(h+1,f),p=c(h,f),x=c(h,f+1),m=c(h+1,f+1);l.push(d,p,m,p,x,m)}const u=new De;return u.setAttribute("position",new ce(o,3)),u.setIndex(l),u.computeVertexNormals(),u}function cc(i){const t=i.clone(),e=t.getIndex();if(e){const r=e.array,a=new Uint32Array(r.length);for(let o=0;o<r.length;o+=3)a[o]=r[o],a[o+1]=r[o+2],a[o+2]=r[o+1];t.setIndex(new gn(a,1))}const n=t.getAttribute("normal");for(let r=0;r<n.count;r++)n.setXYZ(r,-n.getX(r),-n.getY(r),-n.getZ(r));const s=Sh([i,t],!1);if(i.dispose(),t.dispose(),!s)throw new Error("hair could not be made two-sided");return s}function a_(i,t,e,n){const s=new th;s.moveTo(0,0),s.quadraticCurveTo(.15,.32,.62,.44),s.quadraticCurveTo(.56,.26,.5,.2),s.quadraticCurveTo(.46,.05,.37,.08),s.quadraticCurveTo(.33,-.1,.23,-.05),s.quadraticCurveTo(.18,-.26,.08,-.22),s.quadraticCurveTo(.04,-.1,0,-.08),s.closePath();const r=new uo(s,{depth:.015,bevelEnabled:!1,curveSegments:4});return r.setIndex([...Array(r.getAttribute("position").count).keys()]),r.translate(0,0,-.0075),r.rotateX(Math.PI/2),i<0&&r.rotateZ(Math.PI),r.rotateZ(-i*.5),r.scale(t,t,t),r.translate(e.x,e.y,e.z),{geometry:r,colour:n}}const Jn=(i,t,e,n)=>tn(i,t,e,n,!1);function tn(i,t,e,n,s=!0){const r=i.distanceTo(t),a=new oo(e,Math.max(.001,r),s?3:1,s?ds:6),o=new w().subVectors(t,i).normalize(),l=new He().setFromUnitVectors(new w(0,1,0),o);return a.applyMatrix4(new se().compose(i.clone().add(t).multiplyScalar(.5),l,new w(1,1,1))),{geometry:a,colour:n}}function Kr(i,t,e,n,s,r,a=0){const o=new fn(n,e,Math.max(.001,t-i),ds*2);return Ye(o,r,new w(0,a,(i+t)/2),new Pe(Math.PI/2,0,0),new w(1,1,s))}function un(i,t,e,n,s=ds){return Ye(new Li(t,s,Math.max(4,s-2)),e,i,void 0,n)}function hc(i,t,e,n){return Ye(new ii(t.x,t.y,t.z),e,i,n)}function vi(i,t,e,n,s,r){const a=new fn(n,n,Ya,ds*2,1,!0);return Ye(a,r,new w(i,t,e),new Pe(Math.PI/2,0,0),new w(1,1,s))}function o_(i,t,e,n,s,r=5){const a=new Qn(e,n,r,1,!0);return a.applyMatrix4(new se().compose(i.clone().addScaledVector(t,n/2),new He().setFromUnitVectors(new w(0,1,0),t),new w(1,1,1))),{geometry:a,colour:s}}function l_(i,t,e,n,s,r){const a=i.height/1.75,o=i.colours.head,l=i.colours.hairSheen,c={none:0,shaved:0,cropped:.04,short:.08,"chin-length":.18,"shoulder-length":.28,long:.42,"waist-length":.58}[i.hair]*a,u=(h,d,p,x=1.08)=>{const m=new w(h,d,p).normalize();return new w(m.x*n*s.x*x,m.y*n*s.y*x,e+m.z*n*s.z*x)},f=[];switch(t){case"ponytail":{const h=u(0,-1,.25,1.05),d=new w(0,h.y-n*.35,h.z-Math.max(c,.1*a));f.push(Qt(tn(h,d,n*.2,o),"ponytail")),f.push(Qt(un(h,n*.14,i.colours.ink,void 0,6),"ponytail"));break}case"braided":for(const h of[-1,1]){const d=u(h*.75,-.55,-.35,1.02),p=new w(h*n*.85,-n*.95,d.z-Math.max(c,.12*a));f.push(Qt(tn(d,p,n*.13,o),"braid"));const x=7;for(let m=0;m<x;m++)f.push(Qt(un(d.clone().lerp(p,m/(x-1)),n*.17,o,void 0,6),"braid"))}break;case"bun":{const h=n*.46,d=u(0,-.65,.76,r+.36),p=Qt(un(d,h,o,void 0,12),"bun"),x=Qs(p.geometry,()=>d,i.hairTexture,n*.6),m=p.geometry.getAttribute("normal"),g=new w(0,-.35,1).normalize(),v=new Float32Array(m.count);for(let R=0;R<m.count;R++){const y=Math.max(0,m.getX(R)*g.x+m.getY(R)*g.y+m.getZ(R)*g.z);v[R]=Math.min(1,.55*y*y+(x?.4*x[R]*x[R]:0))}f.push(l?{...p,shade:v,tone:l}:p);const A=u(0,-.65,.76,r+.02),M=new Ai(h*.62,n*.06,4,14);M.applyQuaternion(new He().setFromUnitVectors(new w(0,0,1),d.clone().sub(A).normalize())),M.translate(...A.clone().lerp(d,.45).toArray()),f.push(Qt({geometry:M,colour:l??i.colours.ink},"bun"));break}case"topknot":{const h=u(0,-.1,1,1.22);f.push(Qt(un(h,n*.26,o,void 0,8),"topknot")),f.push(Qt(un(u(0,-.1,1,1.05),n*.14,i.colours.ink,void 0,6),"topknot"));break}case"dreadlocks":for(let h=0;h<11;h++){const d=Math.PI*(.9+1.2*h/10),p=u(Math.cos(d),Math.sin(d),.15,1.02),x=new w(p.x*1.2,p.y*1.2,p.z-Math.max(c,.1*a)*(h%2?.85:1));f.push(Qt(Jn(p,x,n*.11,o),"lock"))}break;case"spiky":for(let h=0;h<9;h++){const d=h*Math.PI*2/8,p=h===8?new w(0,0,1):new w(Math.cos(d)*.7,Math.sin(d)*.7,.75).normalize();f.push(Qt(o_(u(p.x,p.y,p.z,1),p,n*.14,n*.55,o),"spike"))}break;case"mohawk":f.push(Qt(un(new w(0,-n*.1,e+n*.72),n,o,new w(.16,1.02,.62),10),"crest"));break;case"brushed":f.push(Qt(Jn(u(-.35,.25,.9,1.07),u(-.35,-.5,.8,1.07),n*.03,i.colours.ink),"parting"));break}return f}function c_(i){const t=i.colours,e=i.height,n=e/1.75,s=[],r=i.posture==="sitting",a=e*i.legShare,o=.26*e,l=r?a-o:0,c=a-l,u=e-i.headHeight-.045*e-l,f=e-i.headHeight/2-l,h=i.headHeight/2,d=i.limbRadius*1.15,p=i.hipHalf*.55,x=.06*n,m=new Set(i.outlined);for(const at of[-1,1]){const F=at*p;if(r){const j=new w(F,.24*e,o);s.push(tn(new w(F,0,c),j,d,t.legs)),s.push(tn(j,new w(F,.24*e,x+d),d*.9,t.legs)),s.push(hc(new w(F,.24*e+.04*n,x/2),new w(d*2.2,.16*n,x),t.feet)),m.has("ankles")&&s.push(Qt(vi(F,.24*e,x+.02*n,d*xi,1,t.ink),"band"))}else s.push(tn(new w(F,0,x+d),new w(F,0,c-d*.5),d,t.legs)),s.push(hc(new w(F,.04*n,x/2),new w(d*2.2,.16*n,x),t.feet)),m.has("ankles")&&s.push(Qt(vi(F,0,x+.02*n,d*xi,1,t.ink),"band"));m.has("hips")&&s.push(Qt(vi(F,r?.06*n:0,c-.07*e-Ya,d*xi,1,t.ink),"band"))}const g=c+.05*e;s.push(Kr(c-.07*e,g,i.hipHalf,i.waistHalf,.62,t.hips)),s.push(Kr(g,u,i.waistHalf,i.shoulderHalf*.92,.55,t.torso));const v=u-i.limbRadius*1.2;s.push(tn(new w(-i.shoulderHalf*.9,0,v),new w(i.shoulderHalf*.9,0,v),i.limbRadius*1.35,t.torso)),m.has("waist")&&s.push(Qt(vi(0,0,g,i.waistHalf*xi,.62,t.ink),"band"));const A=c-.02*e;for(const at of[-1,1]){const F=new w(at*i.shoulderHalf,0,v),j=new w(at*(i.hipHalf+i.limbRadius*1.6),r?.08*n:0,A);s.push(tn(F,j,i.limbRadius,t.arms)),s.push(un(new w(j.x,j.y,j.z-i.limbRadius*1.3),i.limbRadius*1.25,t.hands)),m.has("wrists")&&s.push(Qt(vi(j.x,j.y,j.z,i.limbRadius*xi,1,t.ink),"band"))}const M=.045*n;s.push(Kr(u-.01,f-h*.6,M,M,1,t.neck));const R=u+i.limbRadius*.15+Ya;m.has("neck")&&s.push(Qt(vi(0,0,R,M*xi,1,t.ink),"band"));const y=new w(.84,.95,1);s.push(un(new w(0,0,f),h,t.skin,y,14)),s.push(Ye(new Qn(h*.13,h*.3,6),t.skin,new w(0,h*.98,f-h*.08),new Pe(0,0,0)));const _=(at,F)=>h*y.y*Math.sqrt(Math.max(0,1-(at/(h*y.x))**2-(F/(h*y.z))**2));if(i.described&&!i.faceHidden){const at=h*.1;for(const mt of[-1,1]){const it=mt*h*.32,st=h*.12;if(t.eyes){const rt=new w(it,_(it,st)-at*.7,f+st);s.push(Qt(un(rt,at,i_,void 0,8),"eye")),s.push(Qt(un(rt.clone().add(new w(0,at*.45,0)),at*.65,t.eyes,void 0,8),"eye"))}const Bt=mt*h*.16,gt=mt*h*.48,Ct=h*.3,Ot=t.brow,Z=new w(Bt,_(Bt,Ct),f+Ct),ot=new w(gt,_(gt,Ct-h*.03),f+Ct-h*.03);s.push(Qt(Jn(Z,ot,h*.045,Ot),"brow"))}const F=-h*.45,j=h*.24,ft=new w(0,_(0,F-h*.04),f+F-h*.04);for(const mt of[-1,1]){const it=new w(mt*j,_(j,F),f+F);s.push(Qt(Jn(ft,it,h*.04,t.faceInk),"mouth"))}}const E=i.headCovered?"loose":i.hairStyle,L=!i.headCovered&&(E==="mohawk"||i.hair==="shaved"),P=L||E==="brushed"||E==="swept_back"?"straight":i.hairTexture,D=i.headCovered?1.06:L?1.04:(i.hair==="cropped"?1.035:1.05)*i.hairVolume*(E==="voluminous"?1.25:1);if(i.headCovered||i.hair!=="none"){const at=Math.PI*.55,F=!i.headCovered&&P!=="straight",j=F&&P==="coily",ft=new Li(h,j?28:F?24:16,F?12:9,0,Math.PI*2,0,at),mt=new w(0,0,f),it=new Pe(Math.PI/2+s_+(E==="swept_back"?.3:0),0,0),st=new w(y.x*D,D,y.y*D),Bt=L?Uo(t.skin,t.head,Oo):t.head,gt=Qt(Ye(ft,Bt,mt,it,st),"cap");if(i.headCovered?s.push(gt):s.push(sc(gt,Qs(gt.geometry,()=>mt,P,h),t.hairSheen)),m.has("hairline")&&!L){const Ct=at-Vi/h/2,Ot=h*Math.sin(Ct)*1.006,Z=new fn(Ot,Ot,Vi,ds*2,1,!0);Z.translate(0,h*Math.cos(Ct),0);const ot=Qt(Ye(Z,t.hairEdge,mt,it,st),"hairline"),rt=new w(0,1,0).applyEuler(it);i.headCovered||Qs(ot.geometry,()=>mt,P,h,1,rt),s.push(ot)}}const H=E==="loose"||E==="voluminous"||E==="brushed"||E==="swept_back",T={"chin-length":f-h*1.15,"shoulder-length":v-.03*e,long:v-.12*e,"waist-length":g+.02*e}[i.hair];if(!i.headCovered&&H&&T!==void 0){const at=1.04*i.hairVolume*(E==="voluminous"?1.2:1),F=f+h*.1,j=i.hair!=="chin-length",ft=3.8,mt=i.hairTexture!=="straight",it=new fn(h,h*(j?1.25:1.12),F-T,20,mt?10:3,!0,-ft/2,ft);it.rotateX(Math.PI/2),it.scale(y.x*at,y.y*at,1),it.translate(0,j?-h*.25:0,(F+T)/2);const st={geometry:cc(it),colour:t.head},Bt=Qs(st.geometry,gt=>new w(0,j?-h*.25:0,gt.z),i.hairTexture,h,.4);s.push(sc(Qt(st,"hair"),Bt,t.hairSheen))}if(!i.headCovered&&i.hair!=="none"&&s.push(...l_(i,E,f,h,y,D)),t.facialHair&&i.facialHair!=="none"){const at=t.facialHair,F=(st,Bt,gt=1)=>(st.rotateX(-Math.PI/2),st.scale(y.x*Bt,y.y*Bt,y.z*Bt*gt),st.translate(0,0,f),st),j=(st,Bt,gt,Ct,Ot,Z=1,ot=16)=>({geometry:F(new Li(h,ot,6,Bt-gt/2,gt,0,st),Ct,Z),colour:Ot}),ft=(st,Bt,gt,Ct,Ot=1)=>{const Z=st-Vi/h/2,ot=h*Math.sin(Z)*1.006,rt=new fn(ot,ot,Vi,16,1,!0,Bt-gt/2-Math.PI/2,gt);return rt.translate(0,h*Math.cos(Z),0),{geometry:F(rt,Ct,Ot),colour:t.facialHairEdge??t.ink}},mt=Math.PI/2,it=4;if(i.facialHair==="beard"||i.facialHair==="stubble"){const st=i.facialHair==="beard",Bt=i.beardReach===void 0?.12:.06+.06*Math.min(1,i.beardReach*4),gt=st?1+Bt:1.012,Ct=st?1+Bt:1,Ot=st?at:Uo(t.skin,at,Oo);if(s.push(Qt({geometry:F(lc(h,20,6,mt-it/2,it,()=>0,Vs),gt,Ct),colour:Ot},st?"beard":"stubble")),st&&m.has("jawline")){const Z=Vi/h,ot=lc(h*1.006,20,1,mt-it/2,it,rt=>Vs(rt)-Z,Vs);s.push(Qt({geometry:F(ot,gt,Ct),colour:t.facialHairEdge??t.ink},"jawline"))}if(!st){const Z=t.facialHairEdge??at,ot=h*.028;for(let rt=0;rt<rc;rt++)for(let Tt=0;Tt<ac;Tt++){const pt=Math.sin(rt*12.9898+Tt*78.233)*43758.5453,kt=(rt+.5+.35*Math.sin(pt))/rc,Lt=mt-it/2+it*kt;if(Math.abs(Lt-mt)>1.45)continue;const Xt=Vs(Lt)*(Tt+.5+.3*Math.cos(pt))/(ac+.3),qt=new w(-Math.cos(Lt)*Math.sin(Xt),Math.cos(Xt),Math.sin(Lt)*Math.sin(Xt)).multiplyScalar(h*1.02),te=new fo(ot*1.2,0);te.setIndex([...Array(te.getAttribute("position").count).keys()]),te.translate(qt.x,qt.y,qt.z),s.push(Qt({geometry:F(te,1,1),colour:Z},"stubble-dot"))}}if(st&&i.beardLength!==void 0&&i.beardLength>10){const Z=Math.min((i.beardLength-10)/100,e/3),ot=f-h*gt*Ct,rt=new w(0,h*.75,ot+h*.6),Tt=new w(0,i.shoulderHalf*.92*.55+h*.3,ot-Z),pt=new Qn(h*.62,rt.distanceTo(Tt),10,1,!0);pt.scale(1,1,.4),pt.applyMatrix4(new se().compose(rt.clone().add(Tt).multiplyScalar(.5),new He().setFromUnitVectors(new w(0,1,0),new w().subVectors(Tt,rt).normalize()),new w(1,1,1))),s.push(Qt({geometry:cc(pt),colour:at},"beard"))}}else i.facialHair==="goatee"&&(s.push(Qt(j(.75,mt,.9,1.1,at,1.08),"beard")),m.has("jawline")&&s.push(Qt(ft(.75,mt,.9,1.1,1.08),"jawline")));if(i.facialHair==="moustache"||i.facialHair==="beard"||i.facialHair==="goatee"){const st=-h*.32,Bt=new w(0,_(0,st)+h*.02,f+st);for(const gt of[-1,1]){const Ct=new w(gt*h*.28,_(h*.28,-h*.43)+h*.02,f-h*.43);s.push(Qt(Jn(Bt,Ct,h*.06,at),"moustache"))}}}const I=t.faceInk,B=f+h*.12,z=h*1,J=h*.2,G=h*.04,q=at=>h*y.x*Math.sqrt(Math.max(0,1-((at-f)/(h*y.z))**2));for(const at of i.features)if(at==="glasses"||at==="sunglasses"){for(const F of[-1,1]){const j=new w(F*h*.32,z,B);at==="glasses"?s.push(Ye(new Ai(J,G,4,12),I,j,new Pe(Math.PI/2,0,0))):s.push(Ye(new fn(J*1.1,J*1.1,G*1.5,12),I,j)),s.push(Jn(new w(F*(h*.32+J),z-G,B),new w(F*q(B),0,B),G*.8,I))}s.push(Jn(new w(-h*.32+J,z,B),new w(h*.32-J,z,B),G*.8,I))}else if(at==="eyepatch"){const F=new w(-h*.32,z,B);s.push(Ye(new fn(J*1.15,J*1.15,G*1.5,12),I,F));const j=new w(F.x/y.x,F.y/y.y,(F.z-f)/y.z).normalize(),ft=new w(1,0,.5).normalize(),mt=new w().crossVectors(j,ft).normalize(),it=new Ai(1,G*.8/h,4,40);it.applyQuaternion(new He().setFromUnitVectors(new w(0,0,1),mt)),it.scale(h*y.x*1.03,h*y.y*1.03,h*y.z*1.03),it.translate(0,0,f),s.push(Qt({geometry:it,colour:I},"strap"))}else if(at==="earrings")for(const F of[-1,1]){const j=f-h*.35,ft=new w(F*(q(j)+G),0,j);s.push(Qt(Ye(new Ai(h*.12,G*.9,4,10),I,ft,new Pe(0,Math.PI/2,0)),"earring"))}const $=f+h*.8,lt=t.hair??t.skin;for(const at of i.extras)if(at==="tail")s.push(tn(new w(0,-i.hipHalf*.55,c-.02*e),new w(0,-i.hipHalf*.55-.35*n,r?.03:c-.3*e),i.limbRadius*.6,lt));else if(at==="wings")for(const F of[-1,1])s.push(Qt(a_(F,n,new w(F*i.shoulderHalf*.45,-.1*n,v-.04*e),lt),"wing"));else if(at==="antlers")for(const F of[-1,1]){const j=new w(F*h*.45,0,$),ft=new w(F*h*1.5,-h*.2,$+h*1.4);s.push(Qt(tn(j,ft,h*.07,pr),"antler")),s.push(Qt(tn(j.clone().lerp(ft,.5),new w(F*h*.7,h*.3,$+h*1.2),h*.06,pr),"antler"))}else if(at==="horns")for(const F of[-1,1]){const j=Ye(new Qn(h*.16,h*.7,6),pr,new w(F*h*.45,h*.15,$+h*.2),new Pe(Math.PI/2,0,-F*.35));s.push(Qt(j,"horn"))}else if(at==="pointed_ears")for(const F of[-1,1])s.push(Ye(new Qn(h*.14,h*.6,4),t.skin,new w(F*h*.95,-h*.05,f+h*.25),new Pe(Math.PI/2,0,-F*1)));return s}function yh(i){const t=new jt,e=new jt,n=c_(i).map(({geometry:r,colour:a,shade:o,tone:l})=>{r.deleteAttribute("uv"),t.set(a),l&&e.set(l);const c=r.getAttribute("position").count,u=new Float32Array(c*3);for(let f=0;f<c;f++){const h=o&&l?o[f]:0;u.set([t.r+(e.r-t.r)*h,t.g+(e.g-t.g)*h,t.b+(e.b-t.b)*h],f*3)}return r.setAttribute("color",new gn(u,3)),r}),s=Sh(n,!1);for(const r of n)r.dispose();if(!s)throw new Error("figure parts could not be merged");return i.posture==="reclining"&&(s.applyMatrix4(new se().makeRotationX(Math.PI/2)),s.translate(0,i.height/2,.13*(i.height/1.75))),s.computeBoundingBox(),s.computeBoundingSphere(),s}class h_{constructor(){si(this,"geometries",new Map);si(this,"used",new Set)}geometry(t){const e=JSON.stringify(t);let n=this.geometries.get(e);return n||(n=yh(t),this.geometries.set(e,n)),this.used.add(e),n}sweep(){for(const[t,e]of this.geometries)this.used.has(t)||(e.dispose(),this.geometries.delete(t));this.used.clear()}get size(){return this.geometries.size}dispose(){for(const t of this.geometries.values())t.dispose();this.geometries.clear(),this.used.clear()}}function u_(i,t){if(i.userData.headOutline)return i.userData.headOutline;const e=i.getAttribute("position"),n=[];let s=Number.NEGATIVE_INFINITY;for(let o=0;o<e.count;o++){const l=e.getZ(o);l<t||(n.push(e.getX(o),e.getY(o),l),s=Math.max(s,l))}const r=new Set;for(const o of[-60,-40,-20,0,10,20,30,40,50,60,70,80,90]){const l=o*Math.PI/180;for(let c=0;c<24;c++){const u=c/24*2*Math.PI,f=-Math.sin(l)*Math.cos(u),h=-Math.sin(l)*Math.sin(u),d=Math.cos(l);let p=0,x=Number.NEGATIVE_INFINITY;for(let m=0;m<n.length;m+=3){const g=n[m]*f+n[m+1]*h+n[m+2]*d;g>x&&(x=g,p=m)}n.length&&r.add(p)}}const a=[new w(0,0,s),...[...r].map(o=>new w(n[o],n[o+1],n[o+2]))];return i.userData.headOutline=a,a}function f_(i,t,e,n,s,r,a){const o=new rn(a?a.geometry(i):yh(i),r);a&&(o.userData.keptGeometry=!0);const l=0,c=0;return o.rotation.z=Math.hypot(l,c)>1e-6?Math.atan2(-l,c):Math.PI,o.position.set(t,e,n),o.userData.part="body",o}const uc={wood:9132587,pine:9132587,lcd:1447450,paper:15722184,foam:7306652,cotton:7306652,plastic:10132126,metal:9411238,steel:9411238},d_=12104358,p_=4906624,m_=6004991,qa=16486972,g_=3421247,__=14275786,x_=13157563,v_=3811866,M_=1052692,qi=.08,S_=.3,fc=1.6,cs=50,go=70;function _o(i){const t=Ih(i);return t!==void 0&&Object.hasOwn(uc,t)?uc[t]:d_}const y_=i=>`#${i.toString(16).padStart(6,"0")}`;function E_(i,t){const e=i.userData.headBox;if(e&&e.chin===t)return e.box;const n=new kn,s=i.getAttribute("position"),r=new w;for(let a=0;a<s.count;a++)r.fromBufferAttribute(s,a),r.z>=t&&n.expandByPoint(r);return i.userData.headBox={chin:t,box:n},n}const Eh=i=>[0,1,2,3,4,5,6,7].map(t=>new w(t&1?i.max.x:i.min.x,t&2?i.max.y:i.min.y,t&4?i.max.z:i.min.z));class b_{constructor(t){si(this,"materials",new Map);this.figures=t}material(t,e={}){const n=`${t}:${e.opacity??1}:${e.emissive??0}`;let s=this.materials.get(n);return s||(s=new Sl({color:t,roughness:.8,metalness:.05,transparent:e.opacity!==void 0,opacity:e.opacity??1,emissive:e.emissive??0,depthWrite:e.opacity===void 0}),this.materials.set(n,s)),s}box(t,e,n){const s=(a,o)=>Math.max(.01,o-a),r=new rn(new ii(s(t.x0,t.x1),s(t.y0,t.y1),s(t.z0,t.z1)),e);return r.position.set((t.x0+t.x1)/2,(t.y0+t.y1)/2,(t.z0+t.z1)/2),r.userData.part=n,r}sphere(t,e,n,s){const r=new rn(new Li(Math.max(.01,e),24,16),n);return r.position.set(t[0],t[1],t[2]),r.userData.part=s,r}figureMaterial(){let t=this.materials.get("figure");return t||(t=new Sl({color:16777215,vertexColors:!0,roughness:.8,metalness:.05}),this.materials.set("figure",t)),t}person(t,e,n,s,r,a,o){const l=o!=null&&o.posture?{...typeof t=="object"&&t!==null&&!Array.isArray(t)?t:{},posture:o.posture}:t,c=Nh(l,{height:(o==null?void 0:o.figure_height_m)??(o==null?void 0:o.dimensions_m[2])??r-s,base:y_(a)}),u=f_(c,e,n,s,void 0,this.figureMaterial(),this.figures);if(o){const p=xo(o);u.quaternion.premultiply(p);const x=new w(0,0,-o.dimensions_m[2]/2).applyQuaternion(p);u.position.fromArray(o.centre_m).add(x)}u.updateMatrixWorld();const f=c.top-c.headHeight*1.05,h=u_(u.geometry,f),d=p=>p.clone().applyMatrix4(u.matrixWorld);return{mesh:u,label:h.map(d),head:Eh(E_(u.geometry,f)).map(d)}}}function xo(i){const[t,e,n,s]=i.body_quaternion;return new He(e,n,s,t).normalize()}const vo=i=>[(i.x0+i.x1)/2,(i.y0+i.y1)/2];function dc(i,t){var c,u;const{thing:e,bounds:n}=t,s=_o(e),r=i.material(s),a=n.x1-n.x0,o=n.y1-n.y0,l=n.z1-n.z0;switch($r(e)){case"table":{const f=Math.min(.05,l*.15),h=Math.min(.06,Math.min(a,o)/5),d=Math.min(a*.08,.05),p=Math.min(o*.08,.05),x=[[n.x0+d,n.y0+p],[n.x1-d-h,n.y0+p],[n.x0+d,n.y1-p-h],[n.x1-d-h,n.y1-p-h]].map(([m,g])=>i.box({x0:m,x1:m+h,y0:g,y1:g+h,z0:n.z0,z1:n.z1-f},r,"leg"));return[i.box({...n,z0:n.z1-f},r,"top"),...x]}case"seat":{const f=i.box({...n,z1:n.z0+l*.45},r,"seat"),h=(c=e.front)==null?void 0:c.axis;if(!h||Math.hypot(h[0],h[1])<1e-6)return[f];const d=Math.hypot(h[0],h[1]),p=h[0]/d,x=h[1]/d,m=Math.min(a,o)*.22,g=(Math.abs(p)*a+Math.abs(x)*o)/2-m/2,v=Math.abs(x)*a+Math.abs(p)*o,A=i.box({x0:-v/2,x1:v/2,y0:-m/2,y1:m/2,z0:n.z0,z1:n.z1},r,"back");return A.rotation.z=Math.atan2(-p,x),A.position.x=(n.x0+n.x1)/2-p*g,A.position.y=(n.y0+n.y1)/2-x*g,[f,A]}case"shelf":{const f=[i.box(n,r,"body")],h=i.material(new jt(s).multiplyScalar(.55).getHex());for(let d=n.z0+.35;d<n.z1-.1;d+=.35)f.push(i.box({x0:n.x0-.008,x1:n.x1+.008,y0:n.y0-.008,y1:n.y1+.008,z0:d,z1:d+.02},h,"shelf"));return f}case"picture":{const f=a<=o,h=f?-.006:a*.12,d=f?o*.12:-.006,p=l*.12;return[i.box(n,i.material(v_),"frame"),i.box({x0:n.x0+h,x1:n.x1-h,y0:n.y0+d,y1:n.y1-d,z0:n.z0+p,z1:n.z1-p},r,"picture")]}case"screen":return[i.box(n,i.material(M_,{emissive:((u=e.state)==null?void 0:u.mode)==="running"?659488:0}),"screen")];case"door":{const f=a>=o,[h,d]=vo(n),p=Math.min(n.z0+.95,n.z1-.05),x=f?[n.x0+a*.85,d+(d>0?-1:1)*(o/2+.03),p]:[h+(h>0?-1:1)*(a/2+.03),n.y0+o*.85,p];return[i.box(n,r,"leaf"),i.sphere(x,.03,i.material(12628096),"knob")]}case"flat":return[i.box({...n,z1:n.z0+Math.min(l,.05)},r,"block")];case"box":return bh(i,t)}}function bh(i,t){const e=i.material(_o(t.thing));return t.footprints.map(n=>n.type==="circle"?i.sphere([n.cx,n.cy,(n.bounds.z0+n.bounds.z1)/2],n.r,e,"sphere"):i.box(n.bounds,e,"box"))}function T_(i,t,e,n){var A;const[s,r,a]=t.size,o=qi,l=Math.min(2.05,a*.85),c=e==="north"||e==="south",[u,f]=c?[-s/2-o,s/2+o]:[-r/2,r/2],h=(M,R,y,_)=>e==="north"?{x0:M,x1:R,y0:r/2,y1:r/2+o,z0:y,z1:_}:e==="south"?{x0:M,x1:R,y0:-r/2-o,y1:-r/2,z0:y,z1:_}:e==="east"?{x0:s/2,x1:s/2+o,y0:M,y1:R,z0:y,z1:_}:{x0:-s/2-o,x1:-s/2,y0:M,y1:R,z0:y,z1:_},d=new $n;d.name=`${e} wall`,d.userData.wall=e,d.userData.finish=(A=t.finishes)==null?void 0:A.wall;const p=i.material(__),x=i.material(qa,{opacity:.55,emissive:6958600}),m=i.material(qa,{emissive:9059338}),g=t.exits.filter(M=>xc(M,t.size)===e).map(M=>{const R=c?M.at[0]:M.at[1];return{exit:M,a:Math.max(u,R-M.width/2),b:Math.min(f,R+M.width/2)}}).sort((M,R)=>M.a-R.a);let v=u;for(const{exit:M,a:R,b:y}of g){R>v&&d.add(i.box(h(v,R,0,a),p,"wall")),a>l&&d.add(i.box(h(R,y,l,a),p,"lintel"));const _=i.box(h(R,y,0,l),x,"doorway");_.userData.exit=M.name,d.add(_),n.push(_);const E=h(R,y,0,.012),L=.15;e==="north"&&(E.y0-=L),e==="south"&&(E.y1+=L),e==="east"&&(E.x0-=L),e==="west"&&(E.x1+=L);const P=i.box(E,m,"threshold");P.userData.exit=M.name,d.add(P),n.push(P),v=Math.max(v,y)}return f>v&&d.add(i.box(h(v,f,0,a),p,"wall")),d}function A_({layout:i,placed:t,youId:e,figures:n}){var M,R;const s=new b_(n),[r,a]=i.size,o=new $n,l=[];o.add(new Gf(16777215,4473936,1.6));const c=new Wf(16777215,1.4);c.position.set(r*.4,-a*.6,6),o.add(c);const u=s.box({x0:-r/2,x1:r/2,y0:-a/2,y1:a/2,z0:-.02,z1:0},s.material(g_),"floor");u.userData.finish=(M=i.finishes)==null?void 0:M.floor,o.add(u);const f=s.box({x0:-r/2-qi,x1:r/2+qi,y0:-a/2-qi,y1:a/2+qi,z0:i.size[2],z1:i.size[2]+.02},s.material(x_),"ceiling");f.userData.finish=(R=i.finishes)==null?void 0:R.ceiling,o.add(f);const h=Uh(r),d=[];for(let y=Math.ceil(-r/2/h)*h;y<r/2;y+=h)y>-r/2&&d.push(y,-a/2,.002,y,a/2,.002);for(let y=Math.ceil(-a/2/h)*h;y<a/2;y+=h)y>-a/2&&d.push(-r/2,y,.002,r/2,y,.002);const p=new De;p.setAttribute("position",new ce(d,3));const x=new Yc(p,new Xc({color:10066346,transparent:!0,opacity:.18}));x.userData.part="grid",o.add(x);const m={};for(const y of["north","south","east","west"])m[y]=T_(s,i,y,l),o.add(m[y]);for(const y of i.exits){if(xc(y,i.size))continue;const _=Math.max(y.width,.4)/2,[E,L,P]=y.at,D=s.box({x0:E-_,x1:E+_,y0:L-_,y1:L+_,z0:P,z1:P+.02},s.material(qa,{opacity:.6}),"hatch");D.userData.exit=y.name,o.add(D),l.push(D)}const g=new Map,v=new Map,A=new Map;for(const y of t){const _=new $n;_.name=y.thing.id,_.userData.thingId=y.thing.id;const[E,L]=vo(y.bounds);if(ts(y.thing)){_.userData.form="person";const P=y.thing.id===e?m_:p_,{mesh:D,label:H,head:X}=s.person(y.thing.appearance,E,L,y.bounds.z0,y.bounds.z1,P,Ki(y.thing.pose)?y.thing.pose:void 0);_.add(D),v.set(y.thing.id,H),A.set(y.thing.id,X)}else{_.userData.form=$r(y.thing);const P=y.thing.pose;if(Ki(P)&&P.box){const[D,H,X]=P.dimensions_m,T={...y,bounds:{x0:-D/2,x1:D/2,y0:-H/2,y1:H/2,z0:-X/2,z1:X/2}};if($r(y.thing)==="box")_.add(s.box(T.bounds,s.material(_o(y.thing)),"box"));else for(const I of dc(s,T))_.add(I);_.quaternion.copy(xo(P)),_.position.fromArray(P.centre_m)}else if(Ki(P))for(const D of bh(s,y))_.add(D);else for(const D of dc(s,y))_.add(D);v.set(y.thing.id,[new w(E,L,y.bounds.z1)])}o.add(_),g.set(y.thing.id,_)}return n==null||n.sweep(),o.updateMatrixWorld(!0),{root:o,walls:m,ceiling:f,exits:l,things:g,labelPoints:v,heads:A}}function w_(i,t,e){var s,r;if(t.length!==e.length)return!1;const n=[];for(let a=0;a<t.length;a++){const o=t[a],l=e[a];if(o.thing===l.thing)continue;const c=o.thing.pose,u=l.thing.pose;if(o.thing.id!==l.thing.id||!i.things.has(l.thing.id)||!Ki(c)||!Ki(u)||!u.box&&!ts(l.thing)||c.box!==u.box||c.figure_height_m!==u.figure_height_m||c.posture!==u.posture||c.dimensions_m.some((h,d)=>h!==u.dimensions_m[d])||o.thing.appearance!==l.thing.appearance||o.thing.state!==l.thing.state||o.thing.material!==l.thing.material||o.thing.classes!==l.thing.classes||JSON.stringify((s=o.thing.front)==null?void 0:s.axis)!==JSON.stringify((r=l.thing.front)==null?void 0:r.axis))return!1;const f=h=>new se().compose(new w(...h.centre_m),xo(h),new w(1,1,1));n.push({old:o,next:l,delta:f(u).multiply(f(c).invert())})}for(const{next:a,delta:o}of n){const l=i.things.get(a.thing.id);if(!l)return!1;if(l.applyMatrix4(o),ts(a.thing)){for(const c of i.heads.get(a.thing.id)??[])c.applyMatrix4(o);for(const c of i.labelPoints.get(a.thing.id)??[])c.applyMatrix4(o)}else{const[c,u]=vo(a.bounds);i.labelPoints.set(a.thing.id,[new w(c,u,a.bounds.z1)])}}return i.root.updateMatrixWorld(!0),!0}function Th(i,t,e,n){const s=new w,r={x0:Number.POSITIVE_INFINITY,x1:Number.NEGATIVE_INFINITY,y0:Number.POSITIVE_INFINITY,y1:Number.NEGATIVE_INFINITY};for(const a of i){if(s.copy(a).project(t),s.z<-1||s.z>1)return;const o=(s.x+1)/2*e,l=(1-s.y)/2*n;r.x0=Math.min(r.x0,o),r.x1=Math.max(r.x1,o),r.y0=Math.min(r.y0,l),r.y1=Math.max(r.y1,l)}return r}function R_(i,t,e,n){const s=new w().copy(i[0]).project(t);if(s.z<-1||s.z>1)return;const r=s.x;let a=i.length===1?s.y:Number.NEGATIVE_INFINITY;for(let o=1;o<i.length;o++)s.copy(i[o]).project(t),s.z>=-1&&s.z<=1&&(a=Math.max(a,s.y));return{x:(r+1)/2*e,top:(1-a)/2*n}}function C_(i,t,e,n){const[s,r,a]=t.size,o={north:e.y>r/2,south:e.y<-r/2,east:e.x>s/2,west:e.x<-s/2},l=Math.min(1,S_/a);for(const c of["north","south","east","west"])i.walls[c].scale.z=n==="dollhouse"&&o[c]?l:1;i.ceiling.visible=n==="eyes"}function hs(i,t=cs){const[e,n,s]=i.size,r=[0,0,Math.min(s,2)*.25],o=Math.hypot(e,n)/2/Math.sin(t/2*Math.PI/180)*1.05,l=new w(.45,-1,1.05).normalize().multiplyScalar(o);return{position:[r[0]+l.x,r[1]+l.y,r[2]+l.z],target:r}}const Zi=.87,P_=10;function pc(i,t=cs){const e=hs(i,t),n=Math.hypot(...e.position.map((s,r)=>s-e.target[r]));return Math.max(60,n*1.5)}function L_(i,t,e){const n=new w().subVectors(e,t);i.position.add(n),t.add(n)}function Za(i,t){return i?new w((i.x0+i.x1)/2,(i.y0+i.y1)/2,i.z0+(i.z1-i.z0)*.9):new w(...hs(t).target)}const D_=20,N_=1.5;function I_(i,t=cs){const e=hs(i,t),n=Math.hypot(...e.position.map((s,r)=>s-e.target[r]));return Math.min(.95,(N_/n)**(1/D_))}function U_(i,t){return Math.min(1,Math.abs(i)/(t===1?3:t===2?1:100))}const mc=12,ji=.5,O_=.15,F_=i=>{for(;i&&i.userData.thingId===void 0;)i=i.parent;return i==null?void 0:i.userData.thingId},gc=(i,t)=>Math.hypot(Math.max(t.x0-i.x,0,i.x-t.x1),Math.max(t.y0-i.y,0,i.y-t.y1));function B_(i,t,e,n,s,r,a=[]){var x,m;const o=new Va;o.setFromCamera(new ht(t.x/e.width*2-1,-(t.y/e.height)*2+1),i);const l=[...n.things.values()].filter(g=>g.visible),c=i.getWorldPosition(new w),u=[];for(const g of s){if(((x=n.things.get(g.thing.id))==null?void 0:x.userData.form)!=="person"||!((m=n.things.get(g.thing.id))!=null&&m.visible))continue;const v=g.bounds,A=c.distanceTo(Za(v,r)),M=a.find(L=>L.id===g.thing.id),R=M?gc(t,M):Number.POSITIVE_INFINITY;if(R<=mc){u.push({person:g,byLabel:!0,off:R,depth:A});continue}const y=Eh(new kn(new w(v.x0,v.y0,v.z0),new w(v.x1,v.y1,v.z1))),_=Th(y,i,e.width,e.height);if(!_)continue;const E=gc(t,_);E<=mc&&u.push({person:g,byLabel:!1,off:E,depth:A})}u.sort((g,v)=>Number(v.byLabel)-Number(g.byLabel)||g.off-v.off||g.depth-v.depth);for(const{person:g,depth:v}of u){const A=Za(g.bounds,r),R=new Va(c,A.clone().sub(c).normalize(),0,v).intersectObjects(l,!0)[0];if(!(R&&F_(R.object)!==g.thing.id))return{point:A,nearest:Math.max(ji,z_(A,c,g.bounds,O_))}}const f=o.intersectObjects([...l,...Object.values(n.walls)],!0)[0];if(f)return{point:f.point.clone(),nearest:ji};const h=o.ray.intersectPlane(new cn(new w(0,0,1),0),new w),[d,p]=r.size;return h&&Math.abs(h.x)<=d/2&&Math.abs(h.y)<=p/2?{point:h,nearest:ji}:void 0}function z_(i,t,e,n){const s=new kn(new w(e.x0-n,e.y0-n,e.z0),new w(e.x1+n,e.y1+n,e.z1+n)),r=t.clone().sub(i).normalize(),a=i.clone().addScaledVector(r,1e3),o=new us(a,r.clone().negate()).intersectBox(s,new w);return o?i.distanceTo(o):0}class H_{constructor(){si(this,"fingers",new Map);si(this,"start",null)}down(t,e,n){this.fingers.set(t,{x:e,y:n}),this.start=this.fingers.size===2?this.midpoint():null}move(t,e,n){if(!this.fingers.has(t))return;const s=this.spacing();this.fingers.set(t,{x:e,y:n});const r=this.spacing();if(!(this.fingers.size!==2||!this.start||s===0||r===0||s===r))return{scale:s/r,at:this.start}}up(t){this.fingers.delete(t),this.start=null}get pinching(){return this.start!==null}spacing(){const[t,e]=[...this.fingers.values()];return t&&e?Math.hypot(t.x-e.x,t.y-e.y):0}midpoint(){const[t,e]=[...this.fingers.values()];return{x:(t.x+e.x)/2,y:(t.y+e.y)/2}}}function G_(i,t,e,n,s=0){if(n<1){const r=i.distanceTo(e),a=r>s?Math.max(n,s/r):1;i.sub(e).multiplyScalar(a).add(e),t.sub(e).multiplyScalar(n*n).add(e)}else i.sub(t).multiplyScalar(n).add(t)}function k_(i,t){if(t==="+"||t==="=")return Ka(i,1);if(t==="-"||t==="_")return Ka(i,-1);if(t==="0")return go}function Ka(i,t){return Math.min(go,Math.max(P_,i*Zi**t))}function V_(i,t,e,n){const s=t?[t[0],t[1],t[2]>.8?t[2]:fc]:n?[(n.x0+n.x1)/2,(n.y0+n.y1)/2,Math.max(n.z1-.1,.8)]:[0,0,Math.min(fc,i.size[2]*.8)],r=e?Math.hypot(e[0],e[1],e[2]):0,[a,o,l]=e&&r>1e-6?e.map(c=>c/r):[0,1,0];return{position:s,target:[s[0]+a,s[1]+o,s[2]+l]}}function _c(i){const t=new Set;i.root.traverse(e=>{if(e instanceof rn||e instanceof Yc){e.userData.keptGeometry||e.geometry.dispose();const n=e.material;for(const s of Array.isArray(n)?n:[n])t.add(s)}});for(const e of t)e.dispose()}const W_=3;function X_(i,t){const e=`${i.className}
${i.textContent}`;let n=t.get(e);if(!n){const s=getComputedStyle(i),r=Number.parseFloat(s.fontSize),a=document.createElement("canvas").getContext("2d");if(!a||!(r>0))return{width:0,height:0};a.font=`${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;const o=Number.parseFloat(s.lineHeight);n={width:a.measureText(i.textContent??"").width,height:o>0?o:r*1.2},t.set(e,n)}return n}function Y_(){const i=document.createElement("canvas");return!!(i.getContext("webgl2")??i.getContext("webgl"))}function Jr(i,t){i.camera.position.set(...t.position),i.controls.target.set(...t.target),i.camera.lookAt(i.controls.target)}const K_=({layout:i,placed:t,youId:e,label:n,mode:s,onExit:r})=>{var X;const a=an(null),o=an(null),l=an(s),c=an(r);c.current=r;const[u]=Oh(Y_),f=Fo(T=>T.listenerPosition),h=Fo(T=>T.listenerOrientation.forward),d=an([]);Fh(()=>{const T=a.current;if(!T||!u)return;const I=new H0({antialias:!0});I.setPixelRatio(window.devicePixelRatio),I.setClearColor(1315866),I.domElement.setAttribute("aria-hidden","true"),T.appendChild(I.domElement);const B=new n_;B.domElement.className="room-layout-3d-labels",B.domElement.setAttribute("aria-hidden","true"),T.appendChild(B.domElement);const z=new en(cs,4/3,.05,200);z.up.set(0,0,1);const J=new k0(z,I.domElement);J.maxPolarAngle=Math.PI/2-.05,J.minDistance=ji,J.touches.TWO=null;const G=new ku,q={renderer:I,labels:B,camera:z,controls:J,scene:G,room:null,layout:null,placed:[],figures:new h_,labelObjects:new Map,labelSizes:new Map,personLabels:[],render:()=>{q.room&&C_(q.room,p.current,z.position,l.current),I.render(G,z),x(q),B.render(G,z)}};o.current=q,J.addEventListener("change",q.render);const $=()=>{const F=T.clientWidth,j=T.clientHeight;F===0||j===0||(I.setSize(F,j,!1),I.domElement.style.width="100%",I.domElement.style.height="100%",B.setSize(F,j),z.aspect=F/j,z.updateProjectionMatrix(),q.render())},lt=typeof ResizeObserver>"u"?null:new ResizeObserver($);lt==null||lt.observe(T),$();const at=F=>_.current(F);return T.addEventListener("wheel",at,{capture:!0,passive:!1}),()=>{T.removeEventListener("wheel",at,{capture:!0}),lt==null||lt.disconnect(),J.removeEventListener("change",q.render),J.dispose(),q.room&&_c(q.room),q.figures.dispose(),I.dispose(),I.domElement.remove(),B.domElement.remove(),o.current=null}},[u]);const p=an(i);p.current=i;function x(T){var F,j,ft,mt,it;const I=T.labels.domElement.clientWidth||T.renderer.domElement.clientWidth,B=T.labels.domElement.clientHeight||T.renderer.domElement.clientHeight,z=[],J=new Map,G=new w;for(const{id:st,text:Bt}of d.current){const gt=(F=T.room)==null?void 0:F.labelPoints.get(st),Ct=T.labelObjects.get(st);if(!gt||!Ct||(Ct.visible=!1,!((j=Ct.parent)!=null&&j.visible)))continue;const Ot=R_(gt,T.camera,I,B);if(!Ot)continue;Ct.getWorldPosition(G).project(T.camera),J.set(st,[(G.x+1)/2*I,(1-G.y)/2*B]);const Z=X_(Ct.element,T.labelSizes);Z.width!==0&&z.push({id:st,text:Bt,x:Ot.x,top:Ot.top,...Z})}const q=[];for(const[st,Bt]of((ft=T.room)==null?void 0:ft.heads)??[]){if(!((it=(mt=T.room)==null?void 0:mt.things.get(st))!=null&&it.visible))continue;const gt=Th(Bt,T.camera,I,B);gt&&q.push({id:st,...gt})}const $=4,lt=Bh(z,W_,{x0:$,x1:I-$,y0:$,y1:B-$},q),at=new Set(d.current.filter(st=>st.person).map(st=>st.id));T.personLabels=[];for(const st of lt){const Bt=T.labelObjects.get(st.id),gt=J.get(st.id);if(!Bt||!gt)continue;Bt.visible=!0,Bt.element.style.translate=`${st.x-gt[0]}px ${st.y-gt[1]}px`;const Ct=z.find(Ot=>Ot.id===st.id);Ct&&at.has(st.id)&&T.personLabels.push({id:st.id,x0:st.x-Ct.width/2,x1:st.x+Ct.width/2,y0:st.y-Ct.height/2,y1:st.y+Ct.height/2})}}mr(()=>{var q,$;const T=o.current;if(!T)return;if(s==="dollhouse"&&(T.controls.maxDistance=pc(i)),T.room&&((q=T.layout)==null?void 0:q.size)===i.size&&T.layout.exits===i.exits&&T.layout.finishes===i.finishes&&w_(T.room,T.placed,t)){T.layout=i,T.placed=t;for(const[at,F]of T.labelObjects){const j=($=T.room.labelPoints.get(at))==null?void 0:$[0];j&&F.parent&&F.position.copy(F.parent.worldToLocal(j.clone()))}const lt=T.room.things.get(e);lt&&(lt.visible=s!=="eyes"),T.render();return}const I=T.room;I&&T.scene.remove(I.root);for(const lt of T.labelObjects.values())lt.removeFromParent();T.labelObjects.clear();const B=A_({layout:i,placed:t,youId:e,figures:T.figures});T.room=B,T.layout=i,T.placed=t,T.scene.add(B.root);const z=B.things.get(e);z&&(z.visible=s!=="eyes");const J=zh(t,e),G=[...J.filter(lt=>ts(lt.thing)).map(lt=>({id:lt.thing.id,text:Bo(lt.thing,e),person:!0})),...J.filter(lt=>!ts(lt.thing)).map(lt=>({id:lt.thing.id,text:Bo(lt.thing,e),person:!1}))];d.current=G;for(const{id:lt,text:at,person:F}of G){const j=B.labelPoints.get(lt),ft=B.things.get(lt);if(!j||!ft)continue;const mt=document.createElement("div");mt.className=lt===e?"rl3d-label rl3d-label-you":F?"rl3d-label rl3d-label-person":"rl3d-label",mt.textContent=Hh(at),mt.style.display="none",T.labels.domElement.appendChild(mt);const it=new e_(mt);ft.updateWorldMatrix(!0,!1),it.position.copy(ft.worldToLocal(j[0].clone())),it.visible=!1,ft.add(it),T.labelObjects.set(lt,it)}T.render(),I&&_c(I)},[i,t,e,s]);const m=(X=t.find(T=>T.thing.id===e))==null?void 0:X.bounds;mr(()=>{const T=o.current;l.current=s,T&&(T.controls.enabled=s==="dollhouse",T.camera.fov=s==="eyes"?go:cs,T.camera.updateProjectionMatrix(),R.current=null,s==="dollhouse"&&(T.controls.maxDistance=pc(i),Jr(T,hs(i)),T.controls.update(),T.render()))},[s,i.num]),mr(()=>{const T=o.current;if(!T||s!=="eyes")return;const I=f?zo(f):null,B=h?zo(h):null;Jr(T,V_(i,I,B,m)),T.render()},[s,i,f,h,m==null?void 0:m.x0,m==null?void 0:m.y0,m==null?void 0:m.z1]);const g=an(null),v=T=>{P(T),g.current={x:T.clientX,y:T.clientY}},A=T=>{P(T);const I=g.current;g.current=null;const B=o.current;if(!(B!=null&&B.room)||!I||Math.hypot(T.clientX-I.x,T.clientY-I.y)>4)return;const z=B.renderer.domElement.getBoundingClientRect();if(z.width===0||z.height===0)return;const J=new ht((T.clientX-z.left)/z.width*2-1,-((T.clientY-z.top)/z.height)*2+1),G=new Va;G.setFromCamera(J,B.camera);const q=G.intersectObjects(B.room.exits,!1)[0];q&&c.current(q.object.userData.exit)},M=T=>{const I=o.current,B=I?k_(I.camera.fov,T):void 0;return!I||B===void 0?!1:(I.camera.fov=B,I.camera.updateProjectionMatrix(),I.render(),!0)},R=an(null),y=T=>{const I=o.current;if(!I)return;T.preventDefault(),T.stopPropagation();const B=T.deltaMode,z=T.deltaY;if(z===0)return;const J=U_(z,B)*(z<0?1:-1);if(s==="eyes"){I.camera.fov=Ka(I.camera.fov,J),I.camera.updateProjectionMatrix(),I.render();return}E(I,T.clientX,T.clientY,I_(i)**J)},_=an(y);_.current=y;const E=(T,I,B,z)=>{var q;const J=R.current;if(!J||Math.hypot(I-J.x,B-J.y)>4){const $=T.renderer.domElement.getBoundingClientRect(),lt=T.room?B_(T.camera,{x:I-$.left,y:B-$.top},$,T.room,t,i,T.personLabels):void 0;R.current={x:I,y:B,pick:lt}}const G=(q=R.current)==null?void 0:q.pick;G_(T.camera.position,T.controls.target,(G==null?void 0:G.point)??T.controls.target.clone(),z,(G==null?void 0:G.nearest)??ji),T.controls.update(),T.render()},L=an(new H_),P=T=>{const I=o.current;if(!(!I||T.pointerType!=="touch"||s!=="dollhouse"))if(T.type==="pointerdown")L.current.down(T.pointerId,T.clientX,T.clientY);else if(T.type==="pointerup"||T.type==="pointercancel")L.current.up(T.pointerId);else{const B=L.current.move(T.pointerId,T.clientX,T.clientY);B&&E(I,B.at.x,B.at.y,B.scale)}},D=(T,I)=>{R.current=null,L_(T.camera,T.controls.target,Za(m,i)),T.controls.dollyIn(I)},H=T=>{const I=o.current;if(!I||T.altKey||T.ctrlKey||T.metaKey)return;if(s==="eyes"){M(T.key)&&T.preventDefault();return}const B=Math.PI/18,J={ArrowLeft:()=>I.controls.rotateLeft(-B),ArrowRight:()=>I.controls.rotateLeft(B),ArrowUp:()=>I.controls.rotateUp(B/2),ArrowDown:()=>I.controls.rotateUp(-B/2),"+":()=>D(I,Zi),"=":()=>D(I,Zi),"-":()=>D(I,1/Zi),_:()=>D(I,1/Zi),0:()=>{R.current=null,Jr(I,hs(i)),I.controls.update()}}[T.key];J&&(T.preventDefault(),J(),I.render())};return u?Ho("div",{ref:a,className:"room-layout-3d",role:"img","aria-label":n,tabIndex:0,"data-mode":s,onPointerDown:v,onPointerUp:A,onPointerMove:P,onPointerCancel:P,onKeyDown:H}):Ho("p",{role:"status",children:"This browser cannot draw 3D (it offers no WebGL). The Plan view and the lists below show the room."})};export{K_ as default};
