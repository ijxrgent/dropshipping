'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  title: string
  subtitle: string
  gradient: string
}

// Por ahora son slides de bienvenida con datos estáticos.
// Cuando el admin construya el panel de Banners, esto se alimenta de la BD.
const SLIDES: Slide[] = [
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
    const timer = setInterval(next, 5500)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative w-full h-56 sm:h-72 lg:h-80 rounded-2xl overflow-hidden">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="h-full flex flex-col items-start justify-center px-6 sm:px-12 max-w-xl">
            <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              {slide.title}
            </h2>
            <p className="text-white/90 text-sm sm:text-base mt-2">
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Controles */}
      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
      >
        <ChevronLeft size={18} className="text-white" />
      </button>
      <button
        onClick={next}
        aria-label="Siguiente slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
      >
        <ChevronRight size={18} className="text-white" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            onClick={() => setIndex(i)}
            aria-label={`Ir al slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
