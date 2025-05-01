import {
	Text,
	Html,
	ContactShadows,
	PresentationControls,
	Float,
	Environment,
	useGLTF,
} from '@react-three/drei';

export default function Page() {
	const computer = useGLTF('/assets/model.gltf');

	return (
		<>
			<color
				args={['#2A2F4F']}
				attach="background"
			/>

			<Environment preset="city" />

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

					<primitive
						object={computer.scene}
						position-y={-4}
						position-x={1}
						rotation-x={0.13}
						scale={2}>
						<Html
							transform
							wrapperClass="htmlScreen"
							distanceFactor={1.17}
							position={[0, 1.56, -1.4]}
							rotation-x={-0.256}>
							<iframe src="https://showrav-ansary.github.io/" />
						</Html>
					</primitive>

					<Text
						font="./ShareTechMono-Regular.woff"
						fontSize={0.5}
						position={[2, 0.55, 0.75]}
						rotation-y={-1.25}
						maxWidth={2}
						color={'#718eec'}>
						Ansary Showrav
					</Text>
					<Text
						font="./ShareTechMono-Regular.woff"
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
			/>
		</>
	);
}
