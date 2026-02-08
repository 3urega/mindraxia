'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Lazy load Plotly para reducir el bundle inicial
const Plot = dynamic(
  () => import('react-plotly.js'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-muted text-sm">Cargando gráfico...</p>
      </div>
    ),
  }
);

interface PlotlyDiagramProps {
  config: string; // JSON string del bloque de código
  anchorId?: string; // Opcional, para referencias
  description?: string; // Opcional, descripción del gráfico
}

export default function PlotlyDiagram({
  config,
  anchorId,
  description,
}: PlotlyDiagramProps) {
  const [error, setError] = useState<string | null>(null);
  const [plotData, setPlotData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsear y validar JSON
  useEffect(() => {
    try {
      const parsed = JSON.parse(config);
      
      // Validar estructura básica de Plotly
      if (!parsed.data && !parsed.layout) {
        throw new Error('Configuración inválida: debe contener "data" o "layout"');
      }

      // Aplicar tema oscuro/claro según el tema actual
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      
      const defaultLayout = {
        paper_bgcolor: isDark ? 'rgba(26, 26, 46, 0.5)' : 'rgba(248, 250, 252, 0.5)',
        plot_bgcolor: isDark ? 'rgba(26, 26, 46, 0.3)' : 'rgba(248, 250, 252, 0.3)',
        font: {
          color: isDark ? '#cbd5e1' : '#475569',
          family: 'inherit',
        },
        ...(parsed.layout || {}),
      };

      // Aplicar tema a los ejes si existen
      if (defaultLayout.scene) {
        defaultLayout.scene = {
          xaxis: {
            gridcolor: isDark ? 'rgba(100, 255, 218, 0.2)' : 'rgba(6, 182, 212, 0.15)',
            linecolor: isDark ? 'rgba(100, 255, 218, 0.4)' : 'rgba(6, 182, 212, 0.3)',
            ...defaultLayout.scene.xaxis,
          },
          yaxis: {
            gridcolor: isDark ? 'rgba(100, 255, 218, 0.2)' : 'rgba(6, 182, 212, 0.15)',
            linecolor: isDark ? 'rgba(100, 255, 218, 0.4)' : 'rgba(6, 182, 212, 0.3)',
            ...defaultLayout.scene.yaxis,
          },
          zaxis: {
            gridcolor: isDark ? 'rgba(100, 255, 218, 0.2)' : 'rgba(6, 182, 212, 0.15)',
            linecolor: isDark ? 'rgba(100, 255, 218, 0.4)' : 'rgba(6, 182, 212, 0.3)',
            ...defaultLayout.scene.zaxis,
          },
          bgcolor: isDark ? 'rgba(26, 26, 46, 0.3)' : 'rgba(248, 250, 252, 0.3)',
          ...defaultLayout.scene,
        };
      }

      // Aplicar tema a ejes 2D si existen
      ['xaxis', 'yaxis', 'zaxis'].forEach((axis) => {
        if (defaultLayout[axis]) {
          defaultLayout[axis] = {
            gridcolor: isDark ? 'rgba(100, 255, 218, 0.2)' : 'rgba(6, 182, 212, 0.15)',
            linecolor: isDark ? 'rgba(100, 255, 218, 0.4)' : 'rgba(6, 182, 212, 0.3)',
            ...defaultLayout[axis],
          };
        }
      });

      setPlotData({
        data: parsed.data || [],
        layout: defaultLayout,
        config: {
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          responsive: true,
          ...parsed.config,
        },
      });
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al parsear la configuración JSON';
      setError(errorMessage);
      setPlotData(null);
      console.error('Error parsing Plotly config:', err);
    }
  }, [config]);

  // Memoizar el gráfico para evitar re-renderizados innecesarios
  const plotComponent = useMemo(() => {
    if (!plotData || error) return null;

    return (
      <Plot
        data={plotData.data}
        layout={plotData.layout}
        config={plotData.config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    );
  }, [plotData, error]);

  if (error) {
    return (
      <div
        className="my-4 rounded-lg border p-4"
        style={{
          borderColor: 'rgba(239, 68, 68, 0.5)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
        }}
      >
        <p className="text-red-400 font-semibold mb-2">Error en el gráfico Plotly</p>
        <p className="text-red-300 text-sm">{error}</p>
        <details className="mt-2">
          <summary className="text-red-300 text-xs cursor-pointer">Ver configuración JSON</summary>
          <pre className="mt-2 text-xs text-red-200 overflow-x-auto bg-red-900/20 p-2 rounded">
            {config}
          </pre>
        </details>
      </div>
    );
  }

  if (!plotData) {
    return (
      <div className="my-4 rounded-lg border p-4" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
        <p className="text-text-muted text-sm">Cargando gráfico...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 rounded-lg border overflow-hidden"
      style={{
        borderColor: 'var(--border-glow)',
        backgroundColor: 'rgba(26, 26, 46, 0.3)',
        minHeight: '400px',
      }}
    >
      {description && (
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm text-text-muted italic">{description}</p>
        </div>
      )}
      <div style={{ width: '100%', height: '500px', position: 'relative' }}>
        {plotComponent}
      </div>
    </div>
  );
}

