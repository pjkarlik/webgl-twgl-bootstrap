const fragmentShader = `#version 300 es
#if __VERSION__ < 130
#define TEXTURE2D texture2D
#else
#define TEXTURE2D texture
#endif
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform vec4 u_mouse;
uniform float u_time;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
    
#define R           u_resolution
#define T           u_time
#define M           u_mouse

#define PI          3.14159265
#define PI2         6.28318530

#define MIN_DIST    1e-4
#define MAX_DIST    20.

// globals
vec4 FC = vec4(0.059,0.078,0.141,0);
vec3 hp,hit;
vec2 gid, sid, shx, ghx, speed;
mat2 r2;

// constants
const float thrs = .75;
const float s4 = .577350;
const float s3 = .288683;
const float s2 = .866025;
const vec2 s = vec2(1.732,1);
    
float hash21(vec2 p) { return fract(sin(dot(p,vec2(26.37,32.93)))*4374.23); }
mat2 rot(float a){ return mat2(cos(a),sin(a),-sin(a),cos(a)); }
vec3 hue(float t) { return .35 + .35*cos(PI2*t*(vec3(1.,.85,.75)+vec3(.94,.67,.28)));}

// @IQ extrude 2D sdf
float opx(in float d, in float z, in float h){
    vec2 w = vec2( d, abs(z) - h );
  	return min(max(w.x, w.y), 0.) + length(max(w, 0.));
}

// @Shane tile grid and functions
// https://www.shadertoy.com/view/4td3zj
vec4 hexGrid(vec2 uv) {
    vec4 hC = floor(vec4(uv, uv - vec2(1,.5))/s.xyxy) + .5;
    vec4 h4 = vec4(uv - hC.xy*s, uv - (hC.zw + .5)*s);
    return dot(h4.xy, h4.xy) < dot(h4.zw, h4.zw) ? vec4(h4.xy, hC.xy) : vec4(h4.zw, hC.zw + .5);
}

vec2 map(vec3 pos) {
    vec2 res = vec2(1e5,0);
    
    //@mla inversion
    float kk = 7.5/dot(pos,pos); 
    pos *= kk;
    
    pos.xy += vec2(25,1.75);
    pos.xz += speed;
    
    vec2 uv = pos.xz;
    vec4 hex = hexGrid(uv/1.325);//3.65//1.325//0.6625
    vec2 id = hex.zw, p = hex.xy;

    id=mod(id,48.);
    sid = id, shx = p;

    float rnd = hash21(id);

    if(rnd<.5) {
        p *= r2;
        p.y = -p.y;
    } 

    vec2 p0 = p - vec2(-s3, .5),
         p1 = p - vec2( s4,  0),
         p2 = p - vec2(-s3,-.5);

    vec3 d3 = vec3(length(p0), length(p1), length(p2));
    vec2 pp = vec2(0);

    if(d3.x>d3.y) pp = p1;
    if(d3.y>d3.z) pp = p2;
    if(d3.z>d3.x && d3.y>d3.x) pp = p0;

    float circle = length(pp)-s3;
    
    rnd = fract(rnd*4334.343);
    if(rnd<.4) {    
        float c1 = 1e5, c2 = 1e5;
        circle = length(p.x);
        c2 = length(p1)-s3;
        c1 = length(p1+vec2(1.155,0))-s3;
        c1 = min(c2,c1);
        circle = min(circle,c1);
    }
    float circle2 = circle;
    
    rnd = fract(rnd*4334.343);

    circle  = abs(abs(circle )-.06)-.02;
    circle2 = abs(abs(circle2)-.25)-.075;
    
    float pat = opx(circle ,pos.y-.175, .02),
         pat2 = opx(circle2,pos.y-.075,.015);
   
    float tile = max(abs(hex.x)*s2 + abs(hex.y)*.5, abs(hex.y))-.46;

    pat = max(pat,opx(tile,pos.y-.15,2.))-.01;
    if(pat<res.x) {
        res=vec2(pat,1.);
        hit=pos;
    }

    pat2 = max(pat2,opx(tile,pos.y-.15,2.))-.004;
    if(pat2<res.x) {
        res=vec2(pat2,2.);
        hit=pos;
    }
    
    float flr = min(opx(tile+.01,pos.y,.05),pos.y+.01)-.03;
    if(flr<res.x) {
        res=vec2(flr,3.);
        hit=pos;
    }
        
    // compensate for the scaling that's been applied
    float mul = 1./kk;
    res.x = res.x* mul / 1.5;
    return res;
}

vec3 normal(vec3 p, float t) {
    float e = MIN_DIST*t;
    vec2 h =vec2(1,-1)*.5773;
    vec3 n = h.xyy * map(p+h.xyy*e).x+
             h.yyx * map(p+h.yyx*e).x+
             h.yxy * map(p+h.yxy*e).x+
             h.xxx * map(p+h.xxx*e).x;
    return normalize(n);
}

// @Shane based on the original by @IQ.
float calcAO(in vec3 p, in vec3 n) {
	float sca = 4., occ = 0.;
    for( int i=1; i<5; i++ ) {
        float hr = float(i)*.125/5.;        
        float dd = map(p + hr*n).x;
        occ += (hr - dd)*sca;
        sca *= .8;
    }
    return clamp(1.-occ,0.,1.);   
}

vec4 render(inout vec3 ro, inout vec3 rd, inout vec3 ref, inout float d) {

    vec3 C = FC.rgb, p = ro;
    float m = 0.;
    
    // marcher
    for(int i=0;i<128;i++) {
        p = ro + rd * d;
        vec2 ray = map(p);
        if(ray.x<MIN_DIST*d||d>MAX_DIST)break;
        d += i<32?ray.x*.35:ray.x;
        m  = ray.y;
    } 
    
    gid=sid, ghx=shx, hp=hit;
    
    if(d<MAX_DIST)
    {
        vec3 n = normal(p,d),
             l = normalize(vec3(-5,10,5)),
             h = vec3(.001);
             
        float diff = clamp(dot(n,l),0.,1.),
              shdw = 1.;
              
        for( float t=.01;t<10.; ) {
            float h = map(p + l*t).x;
            if( h<MIN_DIST ) { shdw = 0.; break; }
            shdw = min(shdw, 12.*h/t);
            t += h;
            if( shdw<MIN_DIST || t>10. ) break;
        }

        diff = mix(diff,diff*shdw,.75)*calcAO(p, n);

        if(m==1.) {
            float hs = hash21(gid);
            float a = T*.01 +((hs+gid.x+gid.y)*.045);
            h = hue(a);
            ref = mix(vec3(.5),h,.5);
        }
        if(m==2.) {
            h = vec3(.01);
            ref = vec3(.2);
        }
        if(m==3.) {
            float px = fwidth(p.x);
            float hs = hash21(gid);
            hp.xz *= rot(hs*PI2);
            
            float tile = max(abs(ghx.x)*s2 + abs(ghx.y)/2., abs(ghx.y))-.465;
            
            h = mix(vec3(.02),texture(iChannel1,hp.xz*.5).rgb*vec3(.82,.37,.08),smoothstep(px,-px,tile));
            h = mix(h,h*.15,smoothstep(px,-px,abs(tile+.015)-.01));

            ref = mix(vec3(.5),h,.5);
        }

        C = h * diff;
        ro = p+n*.001;
        rd = reflect(rd,n);
    } 
    return vec4(C,1.);
}

void main() {

    r2 = rot(1.047197);
    vec2 F = gl_FragCoord.xy;
    vec2 uv = (2.*F.xy-R.xy)/max(R.x,R.y);
    vec3 ro = vec3(0,-2.4,5),
         rd = normalize(vec3(uv, -1));

    mat2 rx =rot(-.157);
    ro.zy*=rx, rd.zy*=rx;
        
    // mouse //
    float y = M.xy==vec2(0) || M.z < 0. ? 0. :  (M.x/R.x*.1-.05);
    speed = (T+50.)*vec2(-(y+.1),.25);

    vec3 C = vec3(0), ref = vec3(0), fil = vec3(1);
    
    float d = 0.,a = 0., bounces = 2.;
    
    // main reflective loop
    for(float i=0.; i<bounces; i++) {
        d =0.;
        vec4 pass = render(ro, rd, ref, d);
        C += pass.rgb*fil;
        fil*=ref;
        if(i==0.) {a = d; };
    }
   
    C = mix(FC.rgb,C,  exp(-.0035*a*a*a));

    // some overlay things
    float ck = length(uv)-.8;
    float px = fwidth(uv.x);
    C = mix(C,texture(iChannel0,uv).rgb*vec3(.82,.37,.08),smoothstep(-px,px,ck)*.5);
    C = mix(C,vec3(.95),smoothstep(px,-px,abs(ck)-.005));
    C = mix(C,vec3(.95),smoothstep(px,-px,abs(ck-.05)-.03));
    // gamma and output
    C = pow(C, vec3(.4545));
    fragColor = vec4(C,1.);
}
`;


export default fragmentShader;
