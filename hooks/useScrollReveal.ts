'use client'

import { useEffect, useRef } from 'react'

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      el.classList.add('visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    // Observe the container and all children with .reveal class
    const revealEls = el.querySelectorAll('.reveal')
    revealEls.forEach((child) => observer.observe(child))

    // Also observe the container itself if it has .reveal
    if (el.classList.contains('reveal')) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return ref
}
