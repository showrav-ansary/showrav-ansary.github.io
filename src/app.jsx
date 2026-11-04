import React, { Component, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import { Cache } from 'three';
import { DRACO_PATH, DRACO_WASM, DRACO_WRAPPER, ENVIRONMENT, FONT, MODEL } from './assets.js';
import Page from './page.jsx';
import './style.css';

const PORTRAIT_QUERY = '(orientation: portrait)';

const CAMERAS = {
	landscape: [-3, 1.5, 4],
	portrait: [6, 5, 8],
};

// Moves the shared camera when switching between the two scenes.
function CameraRig({ position }) {
	const camera = useThree((state) => state.camera);
	useLayoutEffect(() => {
		camera.position.set(...position);
		camera.lookAt(0, 0, 0);
		camera.updateProjectionMatrix();
	}, [camera, position]);
	return null;
}

// Rotating 3D model shown in portrait orientation
function RotatingModel() {
	const { scene } = useGLTF(MODEL.url, DRACO_PATH);
	const group = useRef();

	// Rotate a wrapper group (never the shared GLTF scene itself), scaled by
	// frame delta so the speed is identical on 60 Hz and 120 Hz displays.
	useFrame((_, delta) => {
		const g = group.current;
		const step = delta * 60;
		g.rotation.x += 0.002 * step;
		g.rotation.y += 0.0025 * step;
		g.rotation.z += 0.0015 * step;
	});

	return (
		<group ref={group}>
			<primitive object={scene} />
		</group>
	);
}

function PortraitScene() {
	return (
		<>
			<color args={['#2A2F4F']} attach="background" />
			<Environment files={ENVIRONMENT.url} />
			<RotatingModel />
		</>
	);
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

function usePortrait() {
	const [isPortrait, setIsPortrait] = useState(
		() => window.matchMedia(PORTRAIT_QUERY).matches
	);
	useEffect(() => {
		const query = window.matchMedia(PORTRAIT_QUERY);
		const onChange = (e) => setIsPortrait(e.matches);
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	}, []);
	return isPortrait;
}

function App({ fontUrl, onReady }) {
	const isPortrait = usePortrait();

	return (
		<>
			<Canvas
				dpr={[1, 2]}
				gl={{ powerPreference: 'high-performance' }}
				camera={{
					fov: 45,
					near: 0.1,
					far: 2000,
					position: CAMERAS.landscape,
				}}>
				<ambientLight intensity={0.5} />
				<pointLight position={[10, 10, 10]} />
				<CameraRig position={isPortrait ? CAMERAS.portrait : CAMERAS.landscape} />
				<Suspense fallback={null}>
					{isPortrait ? <PortraitScene /> : <Page fontUrl={fontUrl} />}
					<Ready onReady={onReady} />
				</Suspense>
			</Canvas>
			{isPortrait && (
				<div className="portrait-message" role="status">
					Change orientation to landscape.
				</div>
			)}
		</>
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

