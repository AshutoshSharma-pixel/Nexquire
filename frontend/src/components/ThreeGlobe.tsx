"use client"

import React, { useRef, useEffect } from "react"
import * as THREE from "three"

export default function ThreeGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    
    const size = 500
    renderer.setSize(size, size)
    containerRef.current.appendChild(renderer.domElement)

    // Sphere
    const geometry = new THREE.SphereGeometry(2, 64, 64)
    const material = new THREE.MeshPhongMaterial({
      color: 0x060D1A,
      transparent: true,
      opacity: 1,
      shininess: 100,
    })
    const globe = new THREE.Mesh(geometry, material)
    scene.add(globe)

    // Wireframe grid
    const wireframe = new THREE.WireframeGeometry(geometry)
    const line = new THREE.LineSegments(wireframe)
    line.material.transparent = true
    line.material.opacity = 0.15
    line.material.color.setHex(0x2D6FF7)
    scene.add(line)

    // Points/Nodes
    const pointsGeometry = new THREE.BufferGeometry()
    const pointsCount = 1000
    const coords = []
    for (let i = 0; i < pointsCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / pointsCount)
      const theta = Math.sqrt(pointsCount * Math.PI) * phi
      const r = 2.05
      coords.push(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi)
      )
    }
    pointsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3))
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x2D6FF7,
      transparent: true,
      opacity: 0.8,
    })
    const points = new THREE.Points(pointsGeometry, pointsMaterial)
    scene.add(points)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0x2D6FF7, 2)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    camera.position.z = 5

    const animate = () => {
      requestAnimationFrame(animate)
      globe.rotation.y += 0.002
      line.rotation.y += 0.002
      points.rotation.y += 0.002
      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
        // Since we have a fixed container size for the globe widget
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="w-[500px] h-[500px] relative">
      <div className="absolute inset-0 bg-radial-gradient from-primary/20 to-transparent blur-3xl rounded-full" />
    </div>
  )
}
