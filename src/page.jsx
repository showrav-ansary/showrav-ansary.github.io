import { Text, Html, ContactShadows, PresentationControls, Float, Environment, useGLTF } from '@react-three/drei';

export default function Page() {
    const computer = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf');

    return <>

        <color args={['#2A2F4F']} attach="background" />

        <Environment preset="city" />

        <PresentationControls
            global
            rotation={[0.13, 0.1, 0]}
            polar={[- 0.4, 0.2]}
            azimuth={[- 1, 0.75]}
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 400 }}
        >
            <Float rotationIntensity={0.4} >
                <rectAreaLight
                    width={2.5}
                    height={1.65}
                    intensity={50}
                    color={'#0000FF'}
                    rotation={[- 0.1, Math.PI, 0]}
                    position={[0, 0.55, - 1.15]}
                />

                <primitive
                    object={computer.scene}
                    position-y={- 1.2}
                    rotation-x={0.13}
                >
                    <Html
                        transform
                        wrapperClass="htmlScreen"
                        distanceFactor={1.17}
                        position={[0, 1.56, - 1.4]}
                        rotation-x={- 0.256}
                    >
                        <iframe src="https://showrav-ansary.github.io/" />
                    </Html>
                </primitive>

                <Text
                    font="./ShareTechMono-Regular.woff"
                    fontSize={.5}
                    position={[2, 0.75, 0.75]}
                    rotation-y={- 1.25}
                    maxWidth={2}
                    color={'#718eec'}
                >
                    Ansary Showrav
                </Text>
            </Float>
        </PresentationControls>

        <ContactShadows
            position-y={- 1.4}
            opacity={0.4}
            scale={5}
            blur={2.4}
        />

    </>
}