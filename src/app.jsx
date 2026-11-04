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
	// Mobile / tablet / narrow screen threshold
	const isCompact = dimensions.width < 1080 || aspect < 1.35;

	return { ...dimensions, aspect, isCompact };
}

// Adjusts the camera position & frustum smoothly for mobile, tablets, and desktop
function CameraRig({ isCompact, aspect }) {
	const camera = useThree((state) => state.camera);

	useLayoutEffect(() => {
		if (isCompact) {
			// On mobile & tablets: center the laptop model.
			// Distance scales inversely with aspect ratio so the entire laptop
			// is framed with comfortable margins on any screen width.
			const distance = Math.max(5.0, 5.2 / (0.8284 * Math.max(0.35, aspect)));
			const targetY = aspect < 1 ? -0.85 : -0.3;
			camera.position.set(0, targetY + 1.2, distance);
			camera.lookAt(0, targetY, 0);
		} else {
			// On desktop: comfortable angled view with room for 3D typography
			camera.position.set(-1.8, 1.25, 4.7);
			camera.lookAt(0, 0, 0);
		}
		camera.updateProjectionMatrix();
	}, [camera, isCompact, aspect]);

	return null;
}

// Fires once everything inside the surrounding <Suspense> has resolved:
// shaders are pre-compiled and a couple of frames are rendered before the
// loading screen fades away, so the reveal is jank-free.
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
	const { isCompact, aspect } = useResponsiveLayout();

	return (
		<Canvas
			dpr={[1, 2]}
			gl={{ powerPreference: 'high-performance' }}
			camera={{
				fov: 45,
				near: 0.1,
				far: 2000,
				position: [-1.8, 1.25, 4.7],
			}}>
			<ambientLight intensity={0.5} />
			<pointLight position={[10, 10, 10]} />
			<CameraRig isCompact={isCompact} aspect={aspect} />
			<Suspense fallback={null}>
				<Page fontUrl={fontUrl} isCompact={isCompact} />
				<Ready onReady={onReady} />
			</Suspense>
		</Canvas>
	);
}

/**
 * Mounts the 3D scene using assets that were already downloaded by the
 * loading screen. Files are served to three.js loaders from memory via
 * THREE.Cache, so no asset is requested twice.
 */
export function mount(container, files, { onReady, onError }) {
	Cache.enabled = true;
	Cache.add(MODEL.url, files.get(MODEL.url));
	Cache.add(ENVIRONMENT.url, files.get(ENVIRONMENT.url));
	Cache.add(DRACO_WASM.url, files.get(DRACO_WASM.url));
	Cache.add(DRACO_WRAPPER.url, new TextDecoder().decode(files.get(DRACO_WRAPPER.url)));

	// troika-three-text loads fonts itself, so hand it an in-memory URL.
	const fontUrl = URL.createObjectURL(
		new Blob([files.get(FONT.url)], { type: 'font/woff' })
	);

	// Start parsing / decoding the model right away.
	useGLTF.preload(MODEL.url, DRACO_PATH);

	ReactDOM.createRoot(container).render(
		<ErrorBoundary onError={onError}>
			<App fontUrl={fontUrl} onReady={onReady} />
		</ErrorBoundary>
	);
}

