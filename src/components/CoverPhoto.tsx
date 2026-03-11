import Grainient from './reactbits/Grainient'
import CircularText from './reactbits/CircularText'

// Will will be used as the default cover for posts without images
function CoverPhoto({textScale}:CoverPhotoProps) {

  // Randomized attributes for dynamic covers
  const rand = (min: number, max: number) => Math.random() * (max - min) + min

  const randomProps = {
    timeSpeed: rand(0.3, 0.8),
    colorBalance: rand(0.2, 0.6),
    warpStrength: rand(0.8, 1.6),
    warpFrequency: rand(3, 7),
    warpSpeed: rand(1.5, 3),
    warpAmplitude: rand(30, 70),
    blendAngle: rand(0, 360),
    rotationAmount: rand(200, 800),
    noiseScale: rand(1.5, 3),
    grainAmount: rand(0.05, 0.2),
    contrast: rand(1.2, 1.8),
    saturation: rand(0.9, 1.2),
    zoom: rand(0.9, 1.2)
  }

  return (
    <>
      {/* Animated Background */}
      <div className="absolute inset-0">
          <Grainient
            color1="#27b1fc"
            color2="#222c36"
            color3="#8b5cf6"
            timeSpeed={randomProps.timeSpeed}
            colorBalance={randomProps.colorBalance}
            warpStrength={randomProps.warpStrength}
            warpFrequency={randomProps.warpFrequency}
            warpSpeed={randomProps.warpSpeed}
            warpAmplitude={randomProps.warpAmplitude}
            blendAngle={randomProps.blendAngle}
            blendSoftness={0.05}
            rotationAmount={randomProps.rotationAmount}
            noiseScale={randomProps.noiseScale}
            grainAmount={randomProps.grainAmount}
            grainScale={2}
            grainAnimated={false}
            contrast={randomProps.contrast}
            gamma={1}
            saturation={randomProps.saturation}
            centerX={0}
            centerY={0}
            zoom={randomProps.zoom}
          />
        </div>

      {/* Circular Logo Text */}
      <div className="absolute inset-0 flex items-center justify-center">
          <CircularText
            text="NODE*POINT*"
            onHover="speedUp"
            spinDuration={20}
            className={textScale}
          />
      </div>
    </>
  )
}

export default CoverPhoto