'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    title: 'Moda con raíces',
    subtitle: 'Artesanías wayuu y diseño local, directo desde La Guajira',
    gradient: 'from-[#C76B3F] via-[#D98A4F] to-[#E8B05F]',
  },
  {
    title: 'Hecho a mano, vendido con orgullo',
    subtitle: 'Cada compra apoya directamente a un emprendedor de tu región',
    gradient: 'from-[#1B6E73] via-[#23878D] to-[#3FA8AE]',
  },
  {
    title: 'Nuevas tiendas cada semana',
    subtitle:
      'Descubre boutiques y talleres que recién se unieron a ModaGuajira',
    gradient: 'from-[#7A4419] via-[#9C5B22] to-[#C76B3F]',
  },
]

export default function HeroSlider() {
  const [index, setIndex] = useState(0)
  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), [])
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length),
    []
  )

  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [next])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '250px' }}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Texto centrado */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <h2
              className="text-white font-bold leading-tight"
              style={{ fontSize: '24px' }}
            >
              {slide.title}
            </h2>
            <p
              className="text-white mt-2"
              style={{ fontSize: '16px', opacity: 0.9 }}
            >
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Flechas pegadas a los bordes */}
      <button
        onClick={prev}
        aria-label="Anterior"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-10"
        style={{ background: 'rgba(255,255,255,0.22)' }}
      >
        <ChevronLeft size={18} color="white" />
      </button>
      <button
        onClick={next}
        aria-label="Siguiente"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-10"
        style={{ background: 'rgba(255,255,255,0.22)' }}
      >
        <ChevronRight size={18} color="white" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === index ? '22px' : '6px',
              background: i === index ? 'white' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
