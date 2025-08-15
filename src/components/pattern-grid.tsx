'use client'
import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
import { cn } from '@/lib/utils';

interface Point {
  x: number;
  y: number;
}

interface PatternGridProps {
  onPatternComplete: (pattern: number[]) => Promise<boolean> | boolean;
}

const ROWS = 3;
const COLS = 2;
const TOTAL_DOTS = ROWS * COLS;

const PatternGrid: React.FC<PatternGridProps> = ({ onPatternComplete }) => {
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [lines, setLines] = useState<{ start: Point; end: Point }[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shake, setShake] = useState(false);
  const gridRef = useRef<SVGSVGElement>(null);
  const dotPositions = useRef<Point[]>([]);

  useEffect(() => {
    if (gridRef.current) {
      const { width, height } = gridRef.current.getBoundingClientRect();
      const newDotPositions: Point[] = [];
       for (let i = 0; i < TOTAL_DOTS; i++) {
        newDotPositions.push({
          x: (i % COLS) * (width / (COLS - 1) * 0.6) + (width * 0.2),
          y: Math.floor(i / COLS) * (height / (ROWS - 1) * 0.6) + (height * 0.2),
        });
      }
      dotPositions.current = newDotPositions;
    }
  }, []);

  const getDotFromPosition = (pos: Point): number | null => {
    if (!gridRef.current) return null;
    const { width } = gridRef.current.getBoundingClientRect();
    const dotRadius = width / 10;

    for (let i = 0; i < dotPositions.current.length; i++) {
      const dot = dotPositions.current[i];
      const distance = Math.sqrt(Math.pow(pos.x - dot.x, 2) + Math.pow(pos.y - dot.y, 2));
      if (distance < dotRadius) {
        return i;
      }
    }
    return null;
  };
  
  const getEventPosition = (e: MouseEvent | TouchEvent): Point | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    if ('touches' in e) {
      if(e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleStart = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const pos = getEventPosition(e);
    if (!pos) return;
    
    const dotIndex = getDotFromPosition(pos);
    if (dotIndex !== null) {
      setIsDrawing(true);
      setActiveDots([dotIndex]);
    }
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const pos = getEventPosition(e);
    if (!pos) return;

    setMousePos(pos);

    const dotIndex = getDotFromPosition(pos);
    if (dotIndex !== null && !activeDots.includes(dotIndex)) {
      const lastDotIndex = activeDots[activeDots.length - 1];
      const lastDotPos = dotPositions.current[lastDotIndex];
      const newDotPos = dotPositions.current[dotIndex];

      setActiveDots(prev => [...prev, dotIndex]);
      setLines(prev => [...prev, { start: lastDotPos, end: newDotPos }]);
    }
  };

  const handleEnd = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setMousePos(null);

    const result = await onPatternComplete(activeDots);
    if(result){
        // Success
    } else {
        // Failure
        setShake(true);
        setTimeout(() => {
            setShake(false);
        }, 820)
    }

    setTimeout(() => {
        setActiveDots([]);
        setLines([]);
    }, 200);
  };


  const lastDotPos = activeDots.length > 0 ? dotPositions.current[activeDots[activeDots.length - 1]] : null;

  return (
    <div className="relative w-48 h-64 cursor-pointer" onMouseLeave={handleEnd}>
      <svg
        ref={gridRef}
        className={cn("w-full h-full", shake && 'shake')}
        viewBox="0 0 100 133"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Lines */}
        {lines.map((line, i) => (
          <line
            key={i}
            x1={line.start.x * 100/192} y1={line.start.y * 133/256}
            x2={line.end.x * 100/192} y2={line.end.y * 133/256}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        ))}
        {isDrawing && lastDotPos && mousePos && (
          <line
            x1={lastDotPos.x * 100/192} y1={lastDotPos.y * 133/256}
            x2={mousePos.x * 100/192} y2={mousePos.y * 133/256}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="2 2"
          />
        )}

        {/* Dots */}
        {dotPositions.current.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x * 100/192} cy={dot.y * 133/256}
            r="8"
            fill={activeDots.includes(i) ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
            stroke={activeDots.includes(i) ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            strokeWidth="1"
          />
        ))}

         {/* Larger transparent circles for easier interaction */}
        {dotPositions.current.map((dot, i) => (
          <circle
            key={`touch-${i}`}
            cx={dot.x * 100/192} cy={dot.y * 133/256}
            r="12"
            fill="transparent"
          />
        ))}
      </svg>
    </div>
  );
};

export default PatternGrid;
