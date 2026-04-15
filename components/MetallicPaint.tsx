import React, { useEffect, useRef, useState } from 'react';

export type ShaderParams = {
    patternScale: number;
    refraction: number;
    edge: number;
    patternBlur: number;
    liquid: number;
    speed: number;
};

export const defaultParams: ShaderParams = {
    patternScale: 2,
    refraction: 0.015,
    edge: 0.0,
    patternBlur: 0.01,
    liquid: 0.1,
    speed: 0.3
};

/**
 * Pre-processes the image to generate a height map for the fluid simulation.
 */
export function parseLogoImage(file: File): Promise<{ imageData: ImageData }> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!file || !ctx) {
            reject(new Error('Invalid file or context'));
            return;
        }

        const img = new Image();
        // Important for loading external URLs if CORS allows
        img.crossOrigin = 'anonymous';

        img.onload = function () {
            URL.revokeObjectURL(img.src);

            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            // Fallback for SVGs without intrinsic dimensions
            if (width === 0 || height === 0) {
                width = 800;
                height = 800;
            }

            // Constrain size for performance
            const MAX_SIZE = 400;
            const MIN_SIZE = 200;

            if (width > MAX_SIZE || height > MAX_SIZE || width < MIN_SIZE || height < MIN_SIZE) {
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    } else if (width < MIN_SIZE) {
                        height = Math.round((height * MIN_SIZE) / width);
                        width = MIN_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    } else if (height < MIN_SIZE) {
                        width = Math.round((width * MIN_SIZE) / height);
                        height = MIN_SIZE;
                    }
                }
            }

            width = Math.floor(width);
            height = Math.floor(height);

            canvas.width = width;
            canvas.height = height;

            // Draw original image
            const shapeCanvas = document.createElement('canvas');
            shapeCanvas.width = width;
            shapeCanvas.height = height;
            const shapeCtx = shapeCanvas.getContext('2d', { willReadFrequently: true })!;
            shapeCtx.drawImage(img, 0, 0, width, height);

            const shapeImageData = shapeCtx.getImageData(0, 0, width, height);
            const data = shapeImageData.data;
            const shapeMask = new Array(width * height).fill(false);

            // Create mask: true if pixel is NOT white and NOT transparent (assuming black/colored logo on transparent/white bg)
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx4 = (y * width + x) * 4;
                    const r = data[idx4];
                    const g = data[idx4 + 1];
                    const b = data[idx4 + 2];
                    const a = data[idx4 + 3];
                    shapeMask[y * width + x] = !((r > 240 && g > 240 && b > 240) || a < 10);
                }
            }

            function inside(x: number, y: number) {
                if (x < 0 || x >= width || y < 0 || y >= height) return false;
                return shapeMask[y * width + x];
            }

            // Identify boundaries for heat source
            const boundaryMask = new Array(width * height).fill(false);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = y * width + x;
                    if (!shapeMask[idx]) continue;
                    let isBoundary = false;
                    // 4-neighbor check for speed
                    if (!inside(x + 1, y) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x, y - 1)) {
                        boundaryMask[idx] = true;
                    }
                }
            }

            // Heat equation solver
            const u = new Float32Array(width * height).fill(0);
            const newU = new Float32Array(width * height).fill(0);
            const C = 0.01;
            // Reduced iterations for performance
            const ITERATIONS = 40;

            function getU(x: number, y: number, arr: Float32Array) {
                if (x < 0 || x >= width || y < 0 || y >= height) return 0;
                if (!shapeMask[y * width + x]) return 0;
                return arr[y * width + x];
            }

            for (let iter = 0; iter < ITERATIONS; iter++) {
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const idx = y * width + x;
                        if (!shapeMask[idx] || boundaryMask[idx]) {
                            newU[idx] = 0; // Boundary/Outside is 0 (heat sink)
                            continue;
                        }
                        // Simple Laplacian
                        const sumN = getU(x + 1, y, u) + getU(x - 1, y, u) + getU(x, y + 1, u) + getU(x, y - 1, u);
                        newU[idx] = (C + sumN) / 4;
                    }
                }
                u.set(newU);
            }

            let maxVal = 0;
            for (let i = 0; i < width * height; i++) {
                if (u[i] > maxVal) maxVal = u[i];
            }

            const alpha = 2.0;
            const outImg = ctx.createImageData(width, height);

            // Generate height map texture
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = y * width + x;
                    const px = idx * 4;
                    if (!shapeMask[idx]) {
                        // CRITICAL FIX: Set background color to 255 (Edge) instead of 0 (Center)
                        // This ensures that interpolation at edges doesn't pass through the "solid" value (0)
                        outImg.data[px] = 255;
                        outImg.data[px + 1] = 255;
                        outImg.data[px + 2] = 255;
                        outImg.data[px + 3] = 0; // Transparent alpha
                    } else {
                        const raw = maxVal > 0 ? u[idx] / maxVal : 0;
                        const remapped = Math.pow(raw, alpha);
                        const gray = Math.floor(255 * (1 - remapped));
                        outImg.data[px] = gray;
                        outImg.data[px + 1] = gray;
                        outImg.data[px + 2] = gray;
                        outImg.data[px + 3] = 255;
                    }
                }
            }
            resolve({ imageData: outImg });
        };

        img.onerror = (e) => reject(new Error('Failed to load image'));

        // Create object URL from File object
        img.src = URL.createObjectURL(file);
    });
}

const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 a_position;
out vec2 vUv;
void main() {
    vUv = .5 * (a_position + 1.);
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const liquidFragSource = `#version 300 es
precision mediump float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_patternScale;
uniform float u_refraction;
uniform float u_edge;
uniform float u_patternBlur;
uniform float u_liquid;

#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }
float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
    m = m*m;
    m = m*m;
    vec3 x = 2. * fract(p * C.www) - 1.;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130. * dot(m, g);
}

vec2 get_img_uv() {
    vec2 img_uv = vUv;
    img_uv -= .5;
    if (u_ratio > u_img_ratio) {
        img_uv.x = img_uv.x * u_ratio / u_img_ratio;
    } else {
        img_uv.y = img_uv.y * u_img_ratio / u_ratio;
    }
    img_uv += .5;
    img_uv.y = 1. - img_uv.y;
    return img_uv;
}
vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
    float ch = c2;
    float border = 0.;
    float blur = u_patternBlur + extra_blur;
    ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));
    border = w[0];
    ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
    b = smoothstep(.2, .8, b);
    border = w[0] + .4 * (1. - b) * w[1];
    ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
    border = w[0] + .5 * (1. - b) * w[1];
    ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
    border = w[0] + w[1];
    ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
    float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
    float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
    ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));
    return ch;
}
float get_img_frame_alpha(vec2 uv, float img_frame_width) {
    float img_frame_alpha = smoothstep(0., img_frame_width, uv.x) * smoothstep(1., 1. - img_frame_width, uv.x);
    img_frame_alpha *= smoothstep(0., img_frame_width, uv.y) * smoothstep(1., 1. - img_frame_width, uv.y);
    return img_frame_alpha;
}
void main() {
    vec2 uv = vUv;
    uv.y = 1. - uv.y;
    uv.x *= u_ratio;
    float diagonal = uv.x - uv.y;
    float t = .001 * u_time;
    vec2 img_uv = get_img_uv();
    vec4 img = texture(u_image_texture, img_uv);
    vec3 color = vec3(0.);
    float opacity = 1.;
    vec3 color1 = vec3(.98, 0.98, 1.);
    vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, uv.x + uv.y));
    float edge = img.r;
    vec2 grad_uv = uv;
    grad_uv -= .5;
    float dist = length(grad_uv + vec2(0., .2 * diagonal));
    grad_uv = rotate(grad_uv, (.25 - .2 * diagonal) * PI);
    float bulge = pow(1.8 * dist, 1.2);
    bulge = 1. - bulge;
    bulge *= pow(uv.y, .3);
    float cycle_width = u_patternScale;
    float thin_strip_1_ratio = .12 / cycle_width * (1. - .4 * bulge);
    float thin_strip_2_ratio = .07 / cycle_width * (1. + .4 * bulge);
    float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);
    float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
    float thin_strip_2_width = cycle_width * thin_strip_2_ratio;
    opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);
    opacity *= get_img_frame_alpha(img_uv, 0.01);
    
    // CRITICAL FIX: Multiply final opacity by the texture's alpha channel
    // This respects the transparent parts of the original image
    opacity *= img.a;

    float noise = snoise(uv - t);
    edge += (1. - edge) * u_liquid * noise;
    float refr = 0.;
    refr += (1. - bulge);
    refr = clamp(refr, 0., 1.);
    float dir = grad_uv.x;
    dir += diagonal;
    dir -= 2. * noise * diagonal * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));
    bulge *= clamp(pow(uv.y, .1), .3, 1.);
    dir *= (.1 + (1.1 - edge) * bulge);
    dir *= smoothstep(1., .7, edge);
    dir += .18 * (smoothstep(.1, .2, uv.y) * smoothstep(.4, .2, uv.y));
    dir += .03 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));
    dir *= (.5 + .5 * pow(uv.y, 2.));
    dir *= cycle_width;
    dir -= t;
    float refr_r = refr;
    refr_r += .03 * bulge * noise;
    float refr_b = 1.3 * refr;
    refr_r += 5. * (smoothstep(-.1, .2, uv.y) * smoothstep(.5, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(.6, .4, bulge));
    refr_r -= diagonal;
    refr_b += (smoothstep(0., .4, uv.y) * smoothstep(.8, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(.6, .4, bulge));
    refr_b -= .2 * edge;
    refr_r *= u_refraction;
    refr_b *= u_refraction;
    vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
    w[1] -= .02 * smoothstep(.0, 1., edge + bulge);
    float stripe_r = mod(dir + refr_r, 1.);
    float r = get_color_channel(color1.r, color2.r, stripe_r, w, 0.02 + .03 * u_refraction * bulge, bulge);
    float stripe_g = mod(dir, 1.);
    float g = get_color_channel(color1.g, color2.g, stripe_g, w, 0.01 / (1. - diagonal), bulge);
    float stripe_b = mod(dir - refr_b, 1.);
    float b = get_color_channel(color1.b, color2.b, stripe_b, w, .01, bulge);
    color = vec3(r, g, b);
    color *= opacity;
    fragColor = vec4(color, opacity);
}`;

interface MetallicPaintProps {
    src: string;
    params?: Partial<ShaderParams>;
    className?: string;
}

export default function MetallicPaint({
    src,
    params: userParams,
    className = ""
}: MetallicPaintProps) {
    const params = { ...defaultParams, ...userParams };
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [loading, setLoading] = useState(false);
    const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);
    const [uniforms, setUniforms] = useState<Record<string, WebGLUniformLocation>>({});

    // Fix: State independent time tracking
    const totalAnimationTime = useRef(0);
    const lastRenderTime = useRef(-1);

    useEffect(() => {
        let active = true;
        async function processImage() {
            try {
                setLoading(true);
                const response = await fetch(src);
                if (!response.ok) throw new Error("Failed to fetch image");
                const blob = await response.blob();

                // Detect MIME type, assume SVG if unknown or if extension matches
                let type = blob.type;
                if (!type || type === 'application/octet-stream') {
                    if (src.endsWith('.svg')) type = 'image/svg+xml';
                }

                const file = new File([blob], "image", { type });
                const result = await parseLogoImage(file);

                if (active) {
                    setImageData(result.imageData);
                    setLoading(false);
                }
            } catch (e) {
                console.error("MetallicPaint load error:", e);
                if (active) setLoading(false);
            }
        }

        if (src) {
            processImage();
        } else {
            setImageData(null);
        }

        return () => { active = false; };
    }, [src]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageData) return;

        // Use high resolution for quality
        const SIDE = 800;
        canvas.width = SIDE;
        canvas.height = SIDE;

        const glContext = canvas.getContext('webgl2', {
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: false
        });

        if (!glContext) return;

        function createShader(gl: WebGL2RenderingContext, sourceCode: string, type: number) {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, sourceCode);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = createShader(glContext, vertexShaderSource, glContext.VERTEX_SHADER);
        const fragmentShader = createShader(glContext, liquidFragSource, glContext.FRAGMENT_SHADER);
        const program = glContext.createProgram();

        if (!program || !vertexShader || !fragmentShader) return;

        glContext.attachShader(program, vertexShader);
        glContext.attachShader(program, fragmentShader);
        glContext.linkProgram(program);

        if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) return;

        function getUniforms(program: WebGLProgram, gl: WebGL2RenderingContext) {
            let uniforms: Record<string, WebGLUniformLocation> = {};
            let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                let info = gl.getActiveUniform(program, i);
                if (!info) continue;
                const loc = gl.getUniformLocation(program, info.name);
                if (loc) uniforms[info.name] = loc;
            }
            return uniforms;
        }
        const uniformsData = getUniforms(program, glContext);
        if (uniformsData) setUniforms(uniformsData);

        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const vertexBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);

        glContext.useProgram(program);

        const positionLocation = glContext.getAttribLocation(program, 'a_position');
        glContext.enableVertexAttribArray(positionLocation);
        glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
        glContext.vertexAttribPointer(positionLocation, 2, glContext.FLOAT, false, 0, 0);

        const imageTexture = glContext.createTexture();
        glContext.activeTexture(glContext.TEXTURE0);
        glContext.bindTexture(glContext.TEXTURE_2D, imageTexture);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.LINEAR);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);
        glContext.pixelStorei(glContext.UNPACK_ALIGNMENT, 1);
        glContext.texImage2D(
            glContext.TEXTURE_2D,
            0,
            glContext.RGBA,
            imageData.width,
            imageData.height,
            0,
            glContext.RGBA,
            glContext.UNSIGNED_BYTE,
            imageData.data
        );

        setGl(glContext);

        if (uniformsData?.u_img_ratio) glContext.uniform1f(uniformsData.u_img_ratio, imageData.width / imageData.height);
        if (uniformsData?.u_ratio) glContext.uniform1f(uniformsData.u_ratio, 1);
        if (uniformsData?.u_image_texture) glContext.uniform1i(uniformsData.u_image_texture, 0);

        return () => {
            glContext.deleteProgram(program);
            glContext.deleteTexture(imageTexture);
        };
    }, [imageData]);

    useEffect(() => {
        if (!gl || !uniforms || Object.keys(uniforms).length === 0) return;
        try {
            gl.useProgram(gl.getParameter(gl.CURRENT_PROGRAM));
            if (uniforms.u_edge) gl.uniform1f(uniforms.u_edge, params.edge);
            if (uniforms.u_patternBlur) gl.uniform1f(uniforms.u_patternBlur, params.patternBlur);
            if (uniforms.u_patternScale) gl.uniform1f(uniforms.u_patternScale, params.patternScale);
            if (uniforms.u_refraction) gl.uniform1f(uniforms.u_refraction, params.refraction);
            if (uniforms.u_liquid) gl.uniform1f(uniforms.u_liquid, params.liquid);
        } catch (e) {
            console.warn("MetallicPaint uniform update error:", e);
        }
    }, [gl, params, uniforms]);

    useEffect(() => {
        if (!gl || !uniforms || Object.keys(uniforms).length === 0) return;
        let renderId: number;
        let isMounted = true;

        // Reset timing relative to this render cycle
        totalAnimationTime.current = 0;
        lastRenderTime.current = -1;

        function render(timestamp: number) {
            if (!isMounted) return;

            try {
                // Initialize on first frame
                if (lastRenderTime.current === -1) {
                    lastRenderTime.current = timestamp;
                }

                const deltaTime = timestamp - lastRenderTime.current;
                lastRenderTime.current = timestamp;

                // Cap delta time to prevent massive jumps (e.g. background tab)
                // 100ms max allowed delta
                const safeDelta = Math.min(deltaTime, 100);

                if (uniforms.u_time) {
                    totalAnimationTime.current += safeDelta * params.speed;
                    gl!.uniform1f(uniforms.u_time, totalAnimationTime.current);
                }
                gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
            } catch (e) {
                console.warn("MetallicPaint render error:", e);
            }
            renderId = requestAnimationFrame(render);
        }

        renderId = requestAnimationFrame(render);
        return () => { isMounted = false; cancelAnimationFrame(renderId); };
    }, [gl, params.speed, uniforms]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => {
            if (!gl || !uniforms?.u_img_ratio || !imageData) return;
            try {
                const imgRatio = imageData.width / imageData.height;
                gl.uniform1f(uniforms.u_img_ratio, imgRatio);
            } catch (e) {
                console.warn("MetallicPaint resize error:", e);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [gl, uniforms, imageData]);

    return (
        <div ref={containerRef} className={`relative w-full h-full ${className}`}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-neutral-700 border-t-white rounded-full animate-spin"></div>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="block w-full h-full object-cover"
                style={{ opacity: imageData ? 1 : 0, transition: 'opacity 0.5s ease' }}
            />
        </div>
    );
}