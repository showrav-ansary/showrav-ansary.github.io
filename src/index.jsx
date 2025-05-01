import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import ReactDOM from 'react-dom/client';
import './style.css';
import Page from './page.jsx';

// Rotating 3D model component
const RotatingModel = () => {
	const { scene } = useGLTF('/assets/model.gltf'); // Load the GLTF model
	const modelRef = useRef();

	// Rotate the model continuously
	useFrame(() => {
		if (modelRef.current) {
			modelRef.current.rotation.x += 0.002;
			modelRef.current.rotation.y += 0.0025;
			modelRef.current.rotation.z += 0.0015;
		}
	});

	return (
		<primitive
			ref={modelRef}
			object={scene}
			position={[0, 0, 0]}
			scale={1} // Adjust scale to fit your scene
		/>
	);
};

const App = () => {
	const [isPortrait, setIsPortrait] = useState(
		window.innerHeight > window.innerWidth
	);

	useEffect(() => {
		const handleResize = () => {
			setIsPortrait(window.innerHeight > window.innerWidth);
		};

		// Listen for resize events
		window.addEventListener('resize', handleResize);

		// Listen for orientation changes and reload the page
		const handleOrientationChange = () => {
			window.location.reload(); // Reload the page on orientation change
		};
		window.addEventListener('orientationchange', handleOrientationChange);

		// Cleanup listeners when component unmounts
		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener(
				'orientationchange',
				handleOrientationChange
			);
		};
	}, []);

	// Portrait mode - show rotating model with message
	if (isPortrait) {
		return (
			<div
				className="portrait-container"
				style={{ position: 'relative', height: '100vh' }}>
				<Canvas
					camera={{
						fov: 45,
						near: 0.1,
						far: 2000,
						position: [6, 5, 8], // Adjust camera position for the model
					}}>
					<ambientLight intensity={0.5} />
					<pointLight position={[10, 10, 10]} />
					<RotatingModel />
				</Canvas>
				<div
					className="overlay-text"
					style={overlayTextStyle}>
					Change orientation to landscape. 
				</div>
			</div>
		);
	}

	// Landscape mode - show your page component
	return (
		<Canvas
			camera={{
				fov: 45,
				near: 0.1,
				far: 2000,
				position: [-3, 1.5, 4],
			}}>
			<ambientLight intensity={0.5} />
			<pointLight position={[10, 10, 10]} />
			<Page />
		</Canvas>
	);
};

// Style for the overlay text
const overlayTextStyle = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)', // Center the text
	fontSize: '30px',
	color: 'white',
	textShadow: '2px 2px 5px rgba(0, 0, 0, 0.7)', // Shadow for text readability
	zIndex: 2, // Ensure it's above the model
	padding: '10px 20px',
	borderRadius: '10px',
	backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
};

const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(<App />);
