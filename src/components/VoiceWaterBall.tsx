'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface VoiceWaterBallProps {
  isActive: boolean
  audioContext?: AudioContext | null
  analyser?: AnalyserNode | null
  isSpeaking?: boolean
}

export default function VoiceWaterBall({
  isActive,
  analyser,
  isSpeaking = false,
}: Omit<VoiceWaterBallProps, 'audioContext'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  // Keep frequency data in state for potential external use
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(
    new Uint8Array(256)
  )

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let currentFrequencyData = new Uint8Array(256)

    const animate = () => {
      if (analyser && isActive) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        currentFrequencyData = dataArray
        setFrequencyData(dataArray)
      }

      // Use the current frequency data directly in drawWaterBall
      const drawWaterBallWithCurrentData = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number
      ) => {
        ctx.clearRect(0, 0, width, height)

        const centerX = width / 2
        const centerY = height / 2
        const baseRadius = Math.min(width, height) / 4

        // Calculate average frequency for overall size
        const average =
          currentFrequencyData.reduce((sum, value) => sum + value, 0) /
          currentFrequencyData.length
        const intensity = (average / 255) * (isSpeaking ? 2 : 0.5)

        // Create water ball effect
        const time = Date.now() * 0.002
        const points = 64
        const angleStep = (Math.PI * 2) / points

        ctx.save()

        // Create gradient for water effect
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          baseRadius * (1 + intensity)
        )
        if (isSpeaking) {
          gradient.addColorStop(0, 'rgba(64, 164, 223, 0.9)')
          gradient.addColorStop(0.5, 'rgba(93, 188, 210, 0.7)')
          gradient.addColorStop(1, 'rgba(144, 205, 244, 0.3)')
        } else if (isActive) {
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)')
          gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)')
          gradient.addColorStop(1, 'rgba(147, 197, 253, 0.2)')
        } else {
          gradient.addColorStop(0, 'rgba(156, 163, 175, 0.6)')
          gradient.addColorStop(0.5, 'rgba(209, 213, 219, 0.4)')
          gradient.addColorStop(1, 'rgba(243, 244, 246, 0.2)')
        }

        ctx.fillStyle = gradient

        // Draw organic water ball shape
        ctx.beginPath()
        for (let i = 0; i <= points; i++) {
          const angle = i * angleStep

          // Use frequency data to create organic movement
          const freqIndex = Math.floor(
            (i / points) * currentFrequencyData.length
          )
          const freqValue = currentFrequencyData[freqIndex] || 0
          const freqIntensity = (freqValue / 255) * 0.3

          // Create multiple wave layers for organic effect
          const wave1 = Math.sin(time + angle * 3) * 0.15
          const wave2 = Math.sin(time * 1.5 + angle * 5) * 0.1
          const wave3 = Math.sin(time * 0.8 + angle * 7) * 0.05

          const radiusVariation = wave1 + wave2 + wave3 + freqIntensity
          const radius = baseRadius * (1 + intensity + radiusVariation)

          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.fill()

        // Add inner glow effect when speaking
        if (isSpeaking && intensity > 0.1) {
          const innerGradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            baseRadius * 0.5
          )
          innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
          innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

          ctx.fillStyle = innerGradient
          ctx.beginPath()
          ctx.arc(
            centerX,
            centerY,
            baseRadius * 0.3 * (1 + intensity),
            0,
            Math.PI * 2
          )
          ctx.fill()
        }

        // Add ripple effects for active states
        if (isActive || isSpeaking) {
          const rippleTime = time * 2
          for (let r = 0; r < 3; r++) {
            const rippleRadius =
              baseRadius *
              (1.5 + r * 0.3) *
              (1 + Math.sin(rippleTime - r) * 0.1)
            const rippleAlpha =
              Math.max(0, 0.3 - r * 0.1) * (isSpeaking ? intensity : 0.5)

            ctx.strokeStyle = `rgba(59, 130, 246, ${rippleAlpha})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2)
            ctx.stroke()
          }
        }

        ctx.restore()
      }

      drawWaterBallWithCurrentData(ctx, canvas.width, canvas.height)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, analyser, isSpeaking])

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="max-w-full h-auto"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(59, 130, 246, 0.3))' }}
      />
    </div>
  )
}
