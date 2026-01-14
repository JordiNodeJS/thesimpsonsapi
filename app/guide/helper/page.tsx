"use client";

import { useState, useRef, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Home, Upload, Trash2, Copy, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Marker {
  id: number;
  x: number;
  y: number;
}

export default function HelperPage() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [markerCounter, setMarkerCounter] = useState(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedMarkerId, setDraggedMarkerId] = useState<number | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        clearMarkers();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || isDragging) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCursorPos({ x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) });
  };

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageUrl || isDragging) return;

    const target = e.target as HTMLElement;
    if (target.classList.contains("marker")) return;

    const rect = imageContainerRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    addMarker(parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1)));
  };

  const addMarker = (x: number, y: number) => {
    const newMarker: Marker = {
      id: markerCounter,
      x,
      y,
    };

    setMarkers([...markers, newMarker]);
    setMarkerCounter(markerCounter + 1);
  };

  const deleteMarker = (id: number) => {
    setMarkers(markers.filter((m) => m.id !== id));
  };

  const clearMarkers = () => {
    setMarkers([]);
    setMarkerCounter(1);
    setGeneratedCode("");
  };

  const handleMarkerMouseDown = (id: number) => {
    setIsDragging(true);
    setDraggedMarkerId(id);
  };

  const handleMarkerDrag = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || draggedMarkerId === null || !imageContainerRef.current)
      return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setMarkers(
      markers.map((m) =>
        m.id === draggedMarkerId
          ? { ...m, x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) }
          : m
      )
    );
  };

  const handleMarkerMouseUp = () => {
    setIsDragging(false);
    setDraggedMarkerId(null);
  };

  const generateCode = () => {
    if (markers.length === 0) {
      alert("⚠️ Primero añade algunos marcadores en la imagen");
      return;
    }

    let html = "<!-- Indicadores generados automáticamente -->\n\n";

    markers.forEach((marker) => {
      html += `<!-- Indicador ${marker.id} -->\n`;
      html += `<div class="indicator indicator-number" style="top: ${marker.y}%; left: ${marker.x}%;">\n`;
      html += `  ${marker.id}\n`;
      html += `</div>\n`;
      html += `<div class="indicator indicator-tooltip" style="top: ${
        marker.y - 4
      }%; left: ${marker.x - 8}%;">\n`;
      html += `  Descripción del indicador ${marker.id}\n`;
      html += `</div>\n\n`;
    });

    setGeneratedCode(html);

    // Copy to clipboard
    navigator.clipboard
      .writeText(html)
      .then(() => {
        alert("✅ Código HTML copiado al portapapeles!");
      })
      .catch(() => {
        alert(
          "⚠️ No se pudo copiar automáticamente. Copia manualmente el código."
        );
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b-4 border-yellow-500 shadow-xl shadow-yellow-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                🎯 <span className="text-yellow-500">Indicator Helper</span>
              </h1>
              <p className="text-zinc-400 text-sm">
                Herramienta de posicionamiento de indicadores para screenshots
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/guide">
                <Button variant="outline" size="sm">
                  Volver a la Guía
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,350px] gap-8">
          {/* Image Area */}
          <div className="space-y-4">
            {/* Upload Button */}
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold"
              >
                <Upload className="mr-2 h-5 w-5" />
                Cargar Screenshot
              </Button>
            </div>

            {/* Image Container */}
            {imageUrl && (
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-yellow-500/20">
                <div
                  ref={imageContainerRef}
                  className="relative inline-block cursor-crosshair w-full"
                  onClick={handleImageClick}
                  onMouseMove={(e) => {
                    handleMouseMove(e);
                    handleMarkerDrag(e);
                  }}
                  onMouseUp={handleMarkerMouseUp}
                >
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    width={1200}
                    height={800}
                    className="rounded-lg w-full h-auto"
                    priority
                  />

                  {/* Markers */}
                  {markers.map((marker) => (
                    <div
                      key={marker.id}
                      className="marker absolute w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-white rounded-full flex items-center justify-center font-bold text-black shadow-xl shadow-yellow-500/60 cursor-move animate-pulse hover:animate-none hover:bg-orange-500 transition-all"
                      style={{
                        top: `${marker.y}%`,
                        left: `${marker.x}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMarkerMouseDown(marker.id);
                      }}
                    >
                      {marker.id}
                    </div>
                  ))}
                </div>

                {/* Coordinates Display */}
                <div className="mt-4 bg-black/90 p-4 rounded-lg border border-yellow-500/30 font-mono text-sm text-green-400">
                  <strong className="text-yellow-500">
                    Posición del cursor:
                  </strong>
                  <br />
                  X: {cursorPos.x}% | Y: {cursorPos.y}%
                  <br />
                  <strong className="text-yellow-500">
                    Haz clic para añadir marcador
                  </strong>
                </div>
              </div>
            )}

            {!imageUrl && (
              <div className="bg-zinc-900/50 p-12 rounded-xl border-2 border-dashed border-zinc-700 text-center">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-zinc-400">
                  No hay imagen cargada. Sube un screenshot para comenzar.
                </p>
              </div>
            )}
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30">
              <h3 className="text-yellow-500 font-bold mb-3">
                📋 Instrucciones:
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>1. Carga un screenshot</li>
                <li>2. Haz clic donde quieras indicadores</li>
                <li>3. Arrastra marcadores para ajustar</li>
                <li>4. Copia el código HTML generado</li>
              </ul>
            </div>

            {/* Markers List */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-yellow-500/20">
              <h3 className="text-yellow-500 font-bold mb-3">Marcadores:</h3>
              {markers.length === 0 ? (
                <p className="text-zinc-500 text-sm">
                  No hay marcadores. Haz clic en la imagen para añadir.
                </p>
              ) : (
                <div className="space-y-2">
                  {markers.map((marker) => (
                    <div
                      key={marker.id}
                      className="bg-zinc-800/50 p-3 rounded-lg border-l-4 border-yellow-500 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-full flex items-center justify-center font-bold text-sm">
                          {marker.id}
                        </div>
                        <div className="text-xs text-zinc-400">
                          top: {marker.y}%
                          <br />
                          left: {marker.x}%
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMarker(marker.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={generateCode}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold"
                disabled={markers.length === 0}
              >
                <Copy className="mr-2 h-4 w-4" />
                Generar Código HTML
              </Button>
              <Button
                onClick={clearMarkers}
                variant="outline"
                className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
                disabled={markers.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar Todo
              </Button>
            </div>

            {/* Generated Code */}
            {generatedCode && (
              <div className="bg-black/90 p-4 rounded-lg border border-green-500/30 max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-green-500 font-bold text-sm">
                    Código Generado:
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      alert("✅ Código copiado!");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words">
                  {generatedCode}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
