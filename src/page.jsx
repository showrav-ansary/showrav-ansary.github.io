import {
	Text,
	Html,
	ContactShadows,
	PresentationControls,
	Float,
	Environment,
	useGLTF,
} from '@react-three/drei';
import { DRACO_PATH, ENVIRONMENT, MODEL } from './assets.js';

export default function Page({ fontUrl, isMobile = false }) {
	const computer = useGLTF(MODEL.url, DRACO_PATH);

	return (
		<>
			<color
				args={['#2A2F4F']}
				attach="background"
			/>

			<Environment files={ENVIRONMENT.url} />

			<PresentationControls
				global
				rotation={[0.08, 0, 0]}
				polar={[-0.35, 0.2]}
				azimuth={[-0.6, 0.6]}
				config={{ mass: 2, tension: 400 }}
				snap={{ mass: 4, tension: 400 }}>
				<Float rotationIntensity={0.2}>
					<rectAreaLight
						width={2.5}
						height={1.65}
						intensity={50}
						color={'#0000FF'}
						rotation={[-0.1, Math.PI, 0]}
						position={[0, 0.55, -1.15]}
					/>

					{/* MacBook Model — squarely centered so the screen is fully in the main view */}
					<group
						position={[0, -3.9, 0]}
						rotation-x={0.13}
						rotation-y={0}
						scale={2}>
						<primitive object={computer.scene} />
						<Html
							transform
							wrapperClass="htmlScreen"
							distanceFactor={1.17}
							position={[0, 1.56, -1.4]}
							rotation-x={-0.256}>
							<iframe
								src={`${import.meta.env.BASE_URL}portfolio/index.html`}
								title="A. A. Noman Ansary — portfolio"
							/>
						</Html>
					</group>

					{/* Floating Typography — anchored in the background behind the laptop (z = -3.5),
					    rising gracefully behind the top screen bezel. Hidden on mobile per user request. */}
					{!isMobile && (
						<Text
							font={fontUrl}
							anchorX="center"
							anchorY="bottom"
							fontSize={0.48}
							position={[0, 1.25, -3.5]}
							color={'#818cf8'}>
							Ansary Showrav
						</Text>
					)}
				</Float>
			</PresentationControls>

			<ContactShadows
				position-y={-1.4}
				opacity={0.4}
				scale={5}
				blur={2.4}
				resolution={256}
			/>
		</>
	);
}
