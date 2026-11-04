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
				azimuth={[-1, 0.75]}
				config={{ mass: 2, tension: 400 }}
				snap={{ mass: 4, tension: 400 }}>
				<Float rotationIntensity={0.4}>
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
						position={[1, -4, 0]}
						rotation-x={0.13}
						scale={2}>
						<primitive object={computer.scene} />
						<Html
							transform
							wrapperClass="htmlScreen"
							distanceFactor={1.17}
							position={[0, 1.56, -1.4]}
							rotation-x={-0.256}>
							<iframe
								src="https://showrav-ansary.github.io/"
								title="A. A. Noman Ansary — portfolio"
							/>
						</Html>
					</group>

					<Text
						font={fontUrl}
						fontSize={0.5}
						position={[2, 0.55, 0.75]}
						rotation-y={-1.25}
						maxWidth={2}
						color={'#718eec'}>
						Ansary Showrav
					</Text>
					<Text
						font={fontUrl}
						fontSize={0.3}
						position={[5, -2, 0.75]}
						rotation-y={-1.25}
						maxWidth={3}
						color={'#718eec'}>
						Please scroll and click on the links on the display of
						the virtual laptop to see more.
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
