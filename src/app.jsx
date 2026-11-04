import React, { Component, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Cache } from 'three';
import { DRACO_PATH, DRACO_WASM, DRACO_WRAPPER, ENVIRONMENT, FONT, MODEL } from './assets.js';
import Page from './page.jsx';
import './style.css';

// Responsive layout hook for mobile, tablets, and desktop
function useResponsiveLayout() {
	const [dimensions, setDimensions] = useState(() => ({
		width: typeof window !== 'undefined' ? window.innerWidth : 1280,
		height: typeof window !== 'undefined' ? window.innerHeight : 720,
	}));

	useEffect(() => {
		const handleResize = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
		window.addEventListener('resize', handleResize);
		window.addEventListener('orientationchange', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('orientationchange', handleResize);
		};
	}, []);

	const aspect = dimensions.width / Math.max(1, dimensions.height);
	const isMobile = dimensions.width < 768 || aspect < 1.15;

	return { ...dimensions, aspect, isMobile };
}

// Adjusts camera position so the MacBook screen is always fully in the main view
function CameraRig({ isMobile, aspect }) {
	const camera = useThree((state) => state.camera);

	useLayoutEffect(() => {
		// Laptop is centered at x = 0, facing squarely forward.
		// Camera looks directly at the MacBook screen so it is fully in the main view.
		if (isMobile) {
			// On narrow mobile screens, back up distance according to aspect ratio
			const distance = Math.max(5.0, 4.8 / (0.8284 * Math.max(0.35, aspect)));
			const targetY = -0.8;
			camera.position.set(0, targetY + 1.2, distance);
			camera.lookAt(0, targetY, 0);
		} else {
			// On desktop & tablets: straight-on main view of the MacBook screen
			camera.position.set(0, 0.7, 5.2);
			camera.lookAt(0, -0.1, 0);
		}
		camera.updateProjectionMatrix();
	}, [camera, isMobile, aspect]);

	return null;
}

// Fires once everything inside the surrounding <Suspense> has resolved:
function Ready({ onReady }) {
	const { gl, scene, camera } = useThree();
	useEffect(() => {
		gl.compile(scene, camera);
		let id = requestAnimationFrame(() => {
			id = requestAnimationFrame(onReady);
		});
		return () => cancelAnimationFrame(id);
	}, [gl, scene, camera, onReady]);
	return null;
}

class ErrorBoundary extends Component {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	componentDidCatch(error) {
		this.props.onError(error);
	}
	render() {
		return this.state.failed ? null : this.props.children;
	}
}

function App({ fontUrl, onReady }) {
	const { isMobile, aspect } = useResponsiveLayout();

	return (
		<Canvas
			dpr={[1, 2]}
			gl={{ powerPreference: 'high-performance' }}
			camera={{
				fov: 45,
				near: 0.1,
				far: 2000,
				position: [0, 0.45, 4.85],
			}}>
			<ambientLight intensity={0.5} />
			<pointLight position={[10, 10, 10]} />
			<CameraRig isMobile={isMobile} aspect={aspect} />
			<Suspense fallback={null}>
				<Page fontUrl={fontUrl} isMobile={isMobile} />
				<Ready onReady={onReady} />
			</Suspense>
		</Canvas>
	);
}

export function mount(container, files, { onReady, onError }) {
	Cache.enabled = true;
	Cache.add(MODEL.url, files.get(MODEL.url));
	Cache.add(ENVIRONMENT.url, files.get(ENVIRONMENT.url));
	Cache.add(DRACO_WASM.url, files.get(DRACO_WASM.url));
	Cache.add(DRACO_WRAPPER.url, new TextDecoder().decode(files.get(DRACO_WRAPPER.url)));

	const fontUrl = URL.createObjectURL(
		new Blob([files.get(FONT.url)], { type: 'font/woff' })
	);

	useGLTF.preload(MODEL.url, DRACO_PATH);

	ReactDOM.createRoot(container).render(
		<ErrorBoundary onError={onError}>
			<App fontUrl={fontUrl} onReady={onReady} />
		</ErrorBoundary>
	);
}
