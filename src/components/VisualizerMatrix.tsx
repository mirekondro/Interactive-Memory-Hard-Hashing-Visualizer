import React, { useEffect, useRef } from 'react';
import type { MatrixCell, SimulationState } from '../types';
import { CellState } from '../types';

interface VisualizerMatrixProps {
  grid: MatrixCell[][];
  simState: SimulationState;
}

const CELL_SIZE = 40;
const CELL_GAP = 10;
const LANE_LABEL_WIDTH = 60;
const CANVAS_PADDING = 20;

export const VisualizerMatrix: React.FC<VisualizerMatrixProps> = ({ grid, simState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = grid.length;
    const cols = grid[0].length;

    const contentWidth = LANE_LABEL_WIDTH + cols * (CELL_SIZE + CELL_GAP);
    const contentHeight = rows * (CELL_SIZE + CELL_GAP);

    const canvasWidth = contentWidth + CANVAS_PADDING * 2;
    const canvasHeight = contentHeight + CANVAS_PADDING * 2 + 50; // extra height for arc overhead

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const render = (time: number) => {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const pulseFactor = (Math.sin(time / 150) + 1) / 2; // 0 to 1 smooth pulse

      let writeCellCoords: {x: number, y: number} | null = null;
      let readCellCoords: {x: number, y: number} | null = null;

      // Draw all cells
      for (let r = 0; r < rows; r++) {
        // Draw Lane label
        ctx.fillStyle = '#6b7280'; // text-gray-500
        ctx.font = 'bold 14px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        const yOffset = CANVAS_PADDING + 50; // shift down to leave room for arc
        const labelY = yOffset + r * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
        ctx.fillText(`Lane ${r}`, LANE_LABEL_WIDTH - 15 + CANVAS_PADDING, labelY);

        for (let c = 0; c < cols; c++) {
          const cell = grid[r][c];
          const x = CANVAS_PADDING + LANE_LABEL_WIDTH + c * (CELL_SIZE + CELL_GAP);
          const y = yOffset + r * (CELL_SIZE + CELL_GAP);

          let fillColor = '#1f2937'; // Gray (Uninitialized)
          let strokeColor = '#374151';
          let shadowColor = 'transparent';
          let shadowBlur = 0;
          
          switch (cell.state) {
            case CellState.UNINITIALIZED:
              fillColor = '#1f2937';
              break;
            case CellState.COMPLETED:
              fillColor = '#0d9488'; // Bright Teal
              strokeColor = '#14b8a6';
              break;
            case CellState.WRITING:
              // Pulsing Amber
              fillColor = `rgba(245, 158, 11, ${0.6 + 0.4 * pulseFactor})`;
              strokeColor = '#f59e0b';
              shadowColor = '#f59e0b';
              shadowBlur = 10 + 10 * pulseFactor;
              
              writeCellCoords = {x: x + CELL_SIZE/2, y: y + CELL_SIZE/2};
              
              if (cell.referencePointer) {
                 const rx = CANVAS_PADDING + LANE_LABEL_WIDTH + cell.referencePointer.col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
                 const ry = yOffset + cell.referencePointer.lane * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
                 readCellCoords = {x: rx, y: ry};
              }
              break;
            case CellState.READING:
              fillColor = '#991b1b'; // Deep Red
              strokeColor = '#ef4444';
              shadowColor = '#dc2626';
              shadowBlur = 15;
              break;
          }

          ctx.save();
          if (shadowBlur > 0) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
          }
          ctx.fillStyle = fillColor;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          
          ctx.beginPath();
          ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, 6);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Draw value mockup inside
          if (cell.value) {
            ctx.fillStyle = (cell.state === CellState.WRITING) ? '#000000' : '#ffffff';
            ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cell.value, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
          }
        }
      }

      // Draw Laser Arc
      if (writeCellCoords && readCellCoords) {
         ctx.save();
         ctx.beginPath();
         ctx.moveTo(writeCellCoords.x, writeCellCoords.y);
         
         const cpX = (writeCellCoords.x + readCellCoords.x) / 2;
         // Arc bends upwards.
         const cpY = Math.min(writeCellCoords.y, readCellCoords.y) - 80 - Math.abs(writeCellCoords.x - readCellCoords.x) * 0.1; 

         ctx.quadraticCurveTo(cpX, cpY, readCellCoords.x, readCellCoords.y);
         
         // Animate dashed line
         ctx.setLineDash([12, 8]);
         ctx.lineDashOffset = -time / 15; // Flow from Writing back to Reading

         ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)'; // Laser Red
         ctx.lineWidth = 3;
         ctx.shadowColor = '#ef4444';
         ctx.shadowBlur = 12 + 5 * pulseFactor;
         
         ctx.stroke();
         ctx.restore();

         // Draw pulsing endpoint node at the read cell
         ctx.save();
         ctx.beginPath();
         ctx.arc(readCellCoords.x, readCellCoords.y, 4 + 2 * pulseFactor, 0, Math.PI * 2);
         ctx.fillStyle = '#ef4444';
         ctx.shadowColor = '#ef4444';
         ctx.shadowBlur = 10;
         ctx.fill();
         ctx.restore();
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [grid, simState]);

  return (
    <div className="w-full h-full overflow-auto bg-gray-900/80 rounded-xl shadow-inner border border-gray-800 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      <canvas ref={canvasRef} className="block mx-auto min-w-max" />
    </div>
  );
};