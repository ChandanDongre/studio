'use client'
import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
import { cn } from '@/lib/utils';

interface Point {
  x: number;
  y: number;
}

interface PatternGridProps {
  onPatternComplete: (pattern: number[]) => Promise<boolean> | boolean;
  disabled?: boolean;
}

const ROWS = 3;
const COLS = 3;
const TOTAL_DOTS = ROWS * COLS;

const PatternGrid: React.FC<PatternGridProps> = ({ onPatternComplete, disabled=false }) => {
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [lines, setLines] = useState<{ start: Point; end: Point }[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shake, setShake] = useState(false);
  const gridRef = useRef<SVGSVGElement>(null);
  const [dotPositions, setDotPositions] = useState<Point[]>([]);

  useEffect(() => {
    const calculateDotPositions = () => {
      if (gridRef.current) {
        const { width, height } = gridRef.current.getBoundingClientRect();
        const newDotPositions: Point[] = [];
        const xOffset = width * 0.2;
        const yOffset = height * 0.2;
        const xSpacing = width * 0.6 / (COLS - 1);
        const ySpacing = height * 0.6 / (ROWS - 1);

        for (let i = 0; i < TOTAL_DOTS; i++) {
          newDotPositions.push({
            x: (i % COLS) * xSpacing + xOffset,
            y: Math.floor(i / COLS) * ySpacing + yOffset,
          });
        }
        setDotPositions(newDotPositions);
      }
    };
    
    calculateDotPositions();
    const resizeObserver = new ResizeObserver(calculateDotPositions);
    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }
    
    window.addEventListener('resize', calculateDotPositions);
    return () => {
        window.removeEventListener('resize', calculateDotPositions);
        if(gridRef.current) {
            resizeObserver.unobserve(gridRef.current);
        }
    };
  }, []);

  const getDotFromPosition = (pos: Point): number | null => {
    if (!gridRef.current || dotPositions.length === 0) return null;
    const { width } = gridRef.current.getBoundingClientRect();
    const dotRadius = width / 12; // A slightly larger touch area

    for (let i = 0; i < dotPositions.length; i++) {
      const dot = dotPositions[i];
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
    const touch = 'touches' in e ? e.touches[0] : null;
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (e: MouseEvent | TouchEvent) => {
    if(disabled) return;
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
    if(disabled || !isDrawing) return;
    e.preventDefault();

    const pos = getEventPosition(e);
    if (!pos) return;

    setMousePos(pos);

    const dotIndex = getDotFromPosition(pos);
    if (dotIndex !== null && !activeDots.includes(dotIndex)) {
      const lastDotIndex = activeDots[activeDots.length - 1];
      const lastDotPos = dotPositions[lastDotIndex];
      const newDotPos = dotPositions[dotIndex];

      setActiveDots(prev => [...prev, dotIndex]);
      setLines(prev => [...prev, { start: lastDotPos, end: newDotPos }]);
    }
  };

  const handleEnd = async (e: MouseEvent | TouchEvent) => {
    if(disabled || !isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    setMousePos(null);

    const result = await onPatternComplete(activeDots);
    if(!result){
        // Failure
        setShake(true);
        setTimeout(() => {
            setShake(false);
        }, 820)
    }

    // Reset visually after a short delay
    setTimeout(() => {
        setActiveDots([]);
        setLines([]);
    }, 200);
  };

  const lastDotPos = activeDots.length > 0 && dotPositions.length > 0 ? dotPositions[activeDots[activeDots.length - 1]] : null;

  return (
    <div className={cn("relative w-64 h-64", disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')} onMouseLeave={e => isDrawing && handleEnd(e)}>
      <svg
        ref={gridRef}
        className={cn("w-full h-full", shake && 'shake')}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {dotPositions.length > 0 && (
          <>
            {/* Lines */}
            {lines.map((line, i) => (
              <line
                key={i}
                x1={line.start.x * 100/256} y1={line.start.y * 100/256}
                x2={line.end.x * 100/256} y2={line.end.y * 100/256}
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
              />
            ))}
            {isDrawing && lastDotPos && mousePos && (
              <line
                x1={lastDotPos.x * 100/256} y1={lastDotPos.y * 100/256}
                x2={mousePos.x * 100/256} y2={mousePos.y * 100/256}
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}

            {/* Dots */}
            {dotPositions.map((dot, i) => (
              <circle
                key={i}
                cx={dot.x * 100/256} cy={dot.y * 100/256}
                r="6"
                fill={activeDots.includes(i) ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                stroke={activeDots.includes(i) ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                strokeWidth="0.5"
              />
            ))}

             {/* Larger transparent circles for easier interaction */}
            {dotPositions.map((dot, i) => (
              <circle
                key={`touch-${i}`}
                cx={dot.x * 100/256} cy={dot.y * 100/256}
                r="10"
                fill="transparent"
              />
            ))}
          </>
        )}
      </svg>
    </div>
  );
};

export default PatternGrid;
