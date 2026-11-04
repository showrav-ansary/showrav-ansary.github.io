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

export default function Page({ fontUrl }) {
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
				rotation={[0.13, 0.1, 0]}
				polar={[-0.4, 0.2]}
				azimuth={[-0.75, 0.75]}
				config={{ mass: 2, tension: 400 }}
				snap={{ mass: 4, tension: 400 }}>
				<Float rotationIntensity={0.25}>
					<rectAreaLight
						width={2.5}
						height={1.65}
						intensity={50}
						color={'#0000FF'}
						rotation={[-0.1, Math.PI, 0]}
						position={[0, 0.55, -1.15]}
					/>

					{/* Transforms live on a wrapper group so the shared GLTF scene
					    is never mutated (it is reused by the portrait view). */}
					<group
						position={[-1.15, -3.9, 0]}
						rotation-x={0.13}
						rotation-y={0.03}
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

					{/* Floating Typography — positioned in the background behind the laptop (z = -3.2)
					    so the MacBook is always in front during presentation rotations */}
					<Text
						font={fontUrl}
						anchorX="left"
						fontSize={0.42}
						position={[2.35, 0.85, -3.2]}
						rotation-y={-0.38}
						maxWidth={4.2}
						color={'#818cf8'}>
						Ansary Showrav
					</Text>
					<Text
						font={fontUrl}
						anchorX="left"
						fontSize={0.21}
						position={[2.35, 0.35, -3.2]}
						rotation-y={-0.38}
						maxWidth={4.2}
						color={'#f7b267'}>
						Data Scientist &amp; ML Engineer
					</Text>
					<Text
						font={fontUrl}
						anchorX="left"
						fontSize={0.16}
						position={[2.35, -0.10, -3.2]}
						rotation-y={-0.38}
						maxWidth={3.2}
						lineHeight={1.45}
						color={'#94a3b8'}>
						Scroll and interact directly with the virtual laptop display. Click any demo to run 3D projects in-screen.
					</Text>
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
