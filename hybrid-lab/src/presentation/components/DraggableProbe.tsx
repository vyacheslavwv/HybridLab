import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface TestPointCoord {
  x: number;   // SVG coordinate
  y: number;   // SVG coordinate
  label: string;
}

export interface DraggableProbeProps {
  /** Ref to the container div wrapping the SVG */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** SVG viewBox dimensions — used for coordinate scaling */
  svgViewBox: { width: number; height: number };
  /** Test point positions in SVG coordinates */
  testPoints: Record<string, TestPointCoord>;
  /** Currently connected test point ID */
  connectedPoint: string | null;
  onConnect: (pointId: string) => void;
  onDisconnect: () => void;
}

/** Proximity snap radius in SVG coordinate units */
const SNAP_RADIUS_SVG = 45;

/**
 * DraggableProbe — a draggable measurement probe that snaps to test points.
 *
 * Key bug fix from Newtask.md:
 * During drag, `pointer-events: none` is applied to the probe element so that
 * mouse events pass through to the SVG test point circles underneath.
 */
const DraggableProbe: React.FC<DraggableProbeProps> = ({
  containerRef,
  svgViewBox,
  testPoints,
  connectedPoint,
  onConnect,
  onDisconnect,
}) => {
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [closestPoint, setClosestPoint] = useState<string | null>(null);
  const probeRef = useRef<HTMLDivElement>(null);

  /** Convert DOM client coords to SVG viewBox coords */
  const toSvgCoords = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left) * (svgViewBox.width / rect.width),
        y: (clientY - rect.top) * (svgViewBox.height / rect.height),
      };
    },
    [containerRef, svgViewBox]
  );

  /** Find the nearest test point within SNAP_RADIUS_SVG */
  const findClosest = useCallback(
    (svgX: number, svgY: number): string | null => {
      let closest: string | null = null;
      let minDist = SNAP_RADIUS_SVG;
      for (const [key, pt] of Object.entries(testPoints)) {
        const dist = Math.sqrt((svgX - pt.x) ** 2 + (svgY - pt.y) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closest = key;
        }
      }
      return closest;
    },
    [testPoints]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // DOM pixel position of probe center within container
      setPosition({
        x: e.clientX - rect.left - 8,
        y: e.clientY - rect.top - 8,
      });

      // SVG-space proximity check
      const svg = toSvgCoords(e.clientX, e.clientY);
      setClosestPoint(findClosest(svg.x, svg.y));
    };

    const onUp = (e: MouseEvent) => {
      setIsDragging(false);

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const svg = toSvgCoords(e.clientX, e.clientY);
      const closest = findClosest(svg.x, svg.y);

      if (closest) {
        // Snap probe to the test point position
        const tp = testPoints[closest];
        setPosition({
          x: (tp.x / svgViewBox.width) * rect.width - 8,
          y: (tp.y / svgViewBox.height) * rect.height - 8,
        });
        onConnect(closest);
      } else {
        onDisconnect();
      }
      setClosestPoint(null);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, containerRef, testPoints, svgViewBox, toSvgCoords, findClosest, onConnect, onDisconnect]);

  // Determine probe color
  const isConnected = connectedPoint !== null;
  const isNearPoint = closestPoint !== null;
  const bgColor = isConnected ? '#ef4444' : isNearPoint ? '#fbbf24' : '#64748b';
  const borderColor = isNearPoint ? '#fbbf24' : isConnected ? '#ef4444' : '#475569';

  return (
    <div
      ref={probeRef}
      onMouseDown={handleMouseDown}
      title={isConnected ? `Подключен: ${connectedPoint}` : 'Перетащите щуп к точке измерения'}
      className={`absolute rounded-full w-4 h-4 z-50 select-none box-border transition-colors ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderStyle: 'solid',
        borderWidth: 2,
        pointerEvents: isDragging ? 'none' : 'auto',
      }}
    />
  );
};

export default DraggableProbe;
