"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface GlobePin {
  lng: number;
  lat: number;
  label?: string;
  color?: string;
}

interface RotatingEarthProps {
  width?: number;
  height?: number;
  className?: string;
  pins?: GlobePin[];
}

// Bengaluru hosts Empresario 2026; IIT Kharagpur is the organizing home.
const DEFAULT_PINS: GlobePin[] = [
  { lng: 77.5946, lat: 12.9716, label: "Empresario 2026 · Bengaluru", color: "#f59e0b" },
  { lng: 87.3105, lat: 22.3149, label: "E-Cell IIT Kharagpur", color: "#ffffff" },
];

export default function RotatingEarth({
  width = 800,
  height = 600,
  className = "",
  pins = DEFAULT_PINS,
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const containerWidth = Math.min(width, window.innerWidth - 40);
    const containerHeight = Math.min(height, window.innerHeight - 100);
    const radius = Math.min(containerWidth, containerHeight) / 2.5;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    context.scale(dpr, dpr);

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90);

    const path = d3.geoPath().projection(projection).context(context);

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    };

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry;
      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates;
        if (!pointInPolygon(point, coordinates[0])) return false;
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) return false;
        }
        return true;
      } else if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false;
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true;
                break;
              }
            }
            if (!inHole) return true;
          }
        }
        return false;
      }
      return false;
    };

    const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
      const dots: [number, number][] = [];
      const bounds = d3.geoBounds(feature);
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;
      const stepSize = dotSpacing * 0.08;
      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat];
          if (pointInFeature(point, feature)) dots.push(point);
        }
      }
      return dots;
    };

    interface DotData { lng: number; lat: number; visible: boolean }
    const allDots: DotData[] = [];
    let landFeatures: any;

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight);
      const currentScale = projection.scale();
      const scaleFactor = currentScale / radius;

      // Ocean / globe background
      context.beginPath();
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI);
      context.fillStyle = "#000000";
      context.fill();
      context.strokeStyle = "#ffffff";
      context.lineWidth = 2 * scaleFactor;
      context.stroke();

      if (landFeatures) {
        const graticule = d3.geoGraticule();
        context.beginPath();
        path(graticule());
        context.strokeStyle = "#ffffff";
        context.lineWidth = 1 * scaleFactor;
        context.globalAlpha = 0.25;
        context.stroke();
        context.globalAlpha = 1;

        context.beginPath();
        landFeatures.features.forEach((feature: any) => path(feature));
        context.strokeStyle = "#ffffff";
        context.lineWidth = 1 * scaleFactor;
        context.stroke();

        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat]);
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            context.beginPath();
            context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI);
            context.fillStyle = "#999999";
            context.fill();
          }
        });

        // Pins — only render those on the visible hemisphere. Orthographic
        // projection returns coordinates for points behind the globe too, so
        // we gate with a great-circle distance check.
        const rot = projection.rotate();
        const visibleCenter: [number, number] = [-rot[0], -rot[1]];
        const pulsePhase = (performance.now() % 1600) / 1600;
        const pulseScale = 1 + 0.6 * Math.sin(pulsePhase * Math.PI * 2);
        const pulseAlpha = 0.55 * (1 - pulsePhase);

        pins.forEach((pin) => {
          if (d3.geoDistance(visibleCenter, [pin.lng, pin.lat]) > Math.PI / 2) return;
          const projected = projection([pin.lng, pin.lat]);
          if (!projected) return;

          const [px, py] = projected;
          const color = pin.color ?? "#f59e0b";
          const dotRadius = 4 * scaleFactor;
          const ringRadius = dotRadius * (1.8 + pulseScale);

          // Pulse ring
          context.beginPath();
          context.arc(px, py, ringRadius, 0, 2 * Math.PI);
          context.strokeStyle = color;
          context.globalAlpha = pulseAlpha;
          context.lineWidth = 2 * scaleFactor;
          context.stroke();
          context.globalAlpha = 1;

          // Inner dot
          context.beginPath();
          context.arc(px, py, dotRadius, 0, 2 * Math.PI);
          context.fillStyle = color;
          context.fill();
          context.strokeStyle = "#ffffff";
          context.lineWidth = 1.5 * scaleFactor;
          context.stroke();

          if (pin.label) {
            const fontSize = Math.max(10, 12 * scaleFactor);
            context.font = `600 ${fontSize}px Arial, sans-serif`;
            context.textBaseline = "middle";
            const labelX = px + dotRadius + 8;
            const labelY = py;
            // Outline for legibility on any background
            context.lineWidth = 3;
            context.strokeStyle = "rgba(0,0,0,0.85)";
            context.strokeText(pin.label, labelX, labelY);
            context.fillStyle = "#ffffff";
            context.fillText(pin.label, labelX, labelY);
          }
        });
      }
    };

    const loadWorldData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        );
        if (!response.ok) throw new Error("Failed to load land data");
        landFeatures = await response.json();

        landFeatures.features.forEach((feature: any) => {
          const dots = generateDotsInPolygon(feature, 16);
          dots.forEach(([lng, lat]) => allDots.push({ lng, lat, visible: true }));
        });

        render();
      } catch {
        setError("Failed to load land map data");
      }
    };

    const rotation: [number, number, number] = [0, 0, 0];
    let autoRotate = true;
    const rotationSpeed = 0.5;

    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed;
        projection.rotate(rotation);
        render();
      }
    };

    const rotationTimer = d3.timer(rotate);

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false;
      const startX = event.clientX;
      const startY = event.clientY;
      const startRotation: [number, number, number] = [...rotation];

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.5;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        rotation[0] = startRotation[0] + dx * sensitivity;
        rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * sensitivity));
        projection.rotate(rotation);
        render();
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        setTimeout(() => { autoRotate = true; }, 10);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY > 0 ? 0.9 : 1.1;
      const newRadius = Math.max(radius * 0.5, Math.min(radius * 3, projection.scale() * factor));
      projection.scale(newRadius);
      render();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("wheel", handleWheel);

    loadWorldData();

    return () => {
      rotationTimer.stop();
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [width, height]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Error loading Earth visualization</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-2xl bg-black"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <div className="absolute bottom-4 left-4 text-xs text-slate-400 px-2 py-1 rounded-md bg-neutral-900/80">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
