import React, { useEffect, useRef } from 'react';

export default function LiquidBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let app: any = null;
        let isMounted = true;

        const init = async () => {
            try {
                // @ts-ignore
                const module = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.27/build/backgrounds/liquid1.min.js');
                const LiquidBg = module.default;

                if (canvasRef.current && isMounted) {
                    app = LiquidBg(canvasRef.current);

                    app.liquidPlane.material.metalness = 0.75;
                    app.liquidPlane.material.roughness = 0.25;
                    app.liquidPlane.uniforms.displacementScale.value = 5;
                    app.setRain(false);
                }
            } catch (err) {
                console.error("Failed to load liquid background module:", err);
            }
        };

        init();

        return () => {
            isMounted = false;
            if (app && typeof app.destroy === 'function') {
                app.destroy();
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -10,
                opacity: 0.3,
                mixBlendMode: 'screen',
                pointerEvents: 'none',
                display: 'block'
            }}
        />
    );
}
