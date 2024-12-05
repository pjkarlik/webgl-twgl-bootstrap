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
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
  
#define R           u_resolution
#define T           u_time
#define M           u_mouse

#define PI  3.14159265359
#define PI2 6.28318530718

#define MIN_DIST 1e-4
#define MAX_DIST 90.

vec3 hit,hp;
float speed,glow = 0.;
const float size = 4.;
const float hlf = size/2.;
  
mat2 rot (float a) { return mat2(cos(a),sin(a),-sin(a),cos(a)); }
float hash21( vec2 p ) { return fract(sin(dot(p,vec2(23.43,84.21))) *4832.3234); }
float box(vec2 p, vec2 b) {vec2 d = abs(p)-b; return length(max(d,0.)) + min(max(d.x,d.y),0.);}

//@iq hsv
vec3 hsv( in vec3 c ) {
    vec3 rgb = clamp( abs(mod(c.x*2.+vec3(0,4,2),6.)-3.)-1., 0., 1.0 );
    return c.z * mix( vec3(1), rgb, c.y);
}
//@iq extrude sdf 
float opx(in float d, in float z, in float h){
    vec2 w = vec2( d, abs(z) - h );
  	return min(max(w.x, w.y), 0.) + length(max(w, 0.));
}

vec3 pattern(vec2 p, float sc) {
    vec2 uv = p,
         id = floor(p*sc);
          p = fract(p*sc)-.5;

    float rnd = hash21(id);
    float ck = mod(id.x+id.x,2.)*2.-1.;

    float cv=.15;
    float d = box(abs(p)-vec2(0,.65),vec2(.10,.25))-cv;
    float l = box(abs(p)-vec2(.5,0),vec2(.10,.10))-cv;

    if (rnd<.22) d = min(d,length(p)-(cv*.7));
  
    if(rnd>.4) {
        d = box(abs(p)+vec2(.5,-.65),vec2(.10,.25))-cv;
        l = box(abs(p)-vec2(.5,.65),vec2(.10,.25))-cv;
    }
    if (rnd>.75) d = rnd<.9?min(d,length(p)-(1.-rnd)):min(d,box(p,vec2(.1))-cv);

    d=min(d,l);
    if(rnd>.4^^ck>.5)d=-d;
    return vec3(d,ck,rnd);
}

// the scene
vec2 map(vec3 p) {
    vec2 res = vec2(1e5,0);

    vec3 q = p;
    vec3 d = pattern(q.xz,.35);
    
    float fw = .35+.25*sin(p.x*.5);
         fw += .35+.25*cos(p.z*.4);
        
    float k = opx(d.x,q.y,fw);
    if(k<res.x) {
        res=vec2(k,1);
        hit=p;
    }
    
    float j = opx(abs(d.x-.01)-.01,q.y-(fw+.35),.1);
    if(j<res.x) {
        res=vec2(j,3);
        hit=p;
    }
    float tx=.05;//+.05*sin(p.z*.95);
    float m = opx(abs(abs(d.x+tx)-.02)-.01,q.y-(fw+.4),.15);
    if(m<res.x) {
        res=vec2(m,4);
        hit=p;
    }
    
    float f = p.y;
    if(f<res.x) {
        res=vec2(f,2);
        hit=p;
    }
    return res;
}
// get surface normal
vec3 normal(vec3 p, float t)
{
    float e = MIN_DIST*t;
    vec2 h =vec2(1,-1)*.5773;
    vec3 n = h.xyy * map(p+h.xyy*e).x+
             h.yyx * map(p+h.yyx*e).x+
             h.yxy * map(p+h.yxy*e).x+
             h.xxx * map(p+h.xxx*e).x;
    return normalize(n);
}

vec4 FC = vec4(0.306,0.337,0.353,0.);

vec4 render(inout vec3 ro, inout vec3 rd, inout vec3 ref, bool last, inout float d) {

    vec3 C = vec3(0);
    float m = 0.;
    vec3 p = ro;
  
    //ray marcher
    for(int i=0;i<164;i++) {
        p = ro + rd * d;
        vec2 ray = map(p);
        if(ray.x<MIN_DIST*d||d>MAX_DIST)break;
        d += i<32? ray.x*.25: ray.x*.9;
        m  = ray.y;
    } 
    hp = hit;
    
    float alpha = 0.;
    if(d<MAX_DIST)
    {
        vec3 n = normal(p,d);
        vec3 lpos =  vec3(8,8,-5);
             lpos.xz += speed;
        vec3 l = normalize(lpos-p);
        
        float diff = clamp(dot(n,l),0.,1.), shdw = 1.;
        for( float t=.01; t < 18.; ) {
            float h = map(p + l*t).x;
            if( h<MIN_DIST ) { shdw = 0.; break; }
            shdw = min(shdw, 18.*h/t);
            t += h;
            if( shdw<MIN_DIST || t>32. ) break;
        }
        diff = mix(diff,diff*shdw,.75);

        vec3 h = hsv(vec3(hp.x*.1,.8,.65));

        if(m==1.) h=vec3(.1);
        if(m==2.) {
            vec2 f = fract(hp.xz*1.5)-.5;
            if(f.x*f.y>0.) h*=.2;
         }
        if(m==3.) h=h;
        if(m==4.) h=vec3(.05);

        ref=h;
        C = h*diff;

        ro = p+n*.001;
        rd = reflect(rd,n);
    
    }else{
        C = FC.rgb;
    } 
    return vec4(C,alpha);
}

void main()
{
    vec2 F = gl_FragCoord.xy;
    speed=T*.23;
    vec2 uv = (2.*F.xy-R.xy)/max(R.x,R.y);

    vec3 ro = vec3(0,0,8);
    vec3 rd = normalize(vec3(uv, -1.0));
    
    // mouse - camera
    float x = M.xy==vec2(0) || M.z<0. ? 0. : -(M.y/R.y * .3-.15)*PI;
    float y = M.xy==vec2(0) || M.z<0. ? 0. : -(M.x/R.x * 1.-.5 )*PI;
    mat2 rx =rot(-1.2-x), ry =rot(.68-y);
    
    ro.zy*=rx, ro.xz*=ry;
    rd.zy*=rx, rd.xz*=ry;
    ro.xz += speed;
    
    vec3 C = vec3(0),ref=vec3(0),fil=vec3(1);
    
    float d = 0., a = 0., numBounces = 2.;
    // reflection loop
    for(float i=0.; i<numBounces; i++) {
        d =0.;
        vec4 pass = render(ro, rd, ref, i==numBounces-1., d);
        C += pass.rgb*fil;
        fil*=ref;
        if(i==0.) a = d;
    }

    C = mix(FC.rgb,C,  exp(-.00008*a*a*a));
    C=clamp(C,vec3(.03),vec3(.9));
    
    // gamma / output
    C = pow(C, vec3(.4545));
    fragColor = vec4(C,1.);
}
`;

export default fragmentShader;