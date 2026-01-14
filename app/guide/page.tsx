"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Step {
  number: number;
  title: string;
  description: string;
  screenshot?: string;
  indicators?: Array<{
    type: "circle" | "arrow" | "box" | "label" | "number";
    top: number;
    left: number;
    text?: string;
    number?: number;
  }>;
  content: React.ReactNode;
}

export default function GuidePage() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps: Step[] = [
    {
      number: 1,
      title: "Bienvenido a Springfield Life",
      description:
        "Tu compañero definitivo para explorar el universo de Los Simpson",
      screenshot: "/guide/screenshots/01-home-page.png",
      content: (
        <div className="text-center space-y-6">
          <div className="text-8xl mb-4 animate-bounce">🍩</div>
          <h3 className="text-2xl font-bold text-yellow-500">
            ¡D&apos;oh! Comencemos
          </h3>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            Esta guía te ayudará a descubrir todas las características de
            Springfield Life, desde explorar episodios hasta crear tu propio
            diario de Los Simpson.
          </p>
        </div>
      ),
    },
    {
      number: 2,
      title: "Navegación Principal",
      description: "Aprende a moverte por Springfield Life",
      screenshot: "/guide/screenshots/01-home-page.png",
      indicators: [
        { type: "box", top: 8, left: 20, text: "Menú de navegación" },
        { type: "number", top: 8, left: 50, number: 1 },
      ],
      content: (
        <div className="space-y-8">
          <div className="bg-zinc-800/50 p-8 rounded-xl border border-yellow-500/20">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">
              Menú de Navegación
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <span className="text-2xl">📺</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Episodes</h4>
                  <p className="text-sm text-zinc-400">
                    Explora todos los episodios organizados por temporada
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Characters</h4>
                  <p className="text-sm text-zinc-400">
                    Conoce a todos los habitantes de Springfield
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 3,
      title: "Explora Personajes",
      description:
        "Descubre información detallada de los habitantes de Springfield",
      screenshot: "/guide/screenshots/02-characters-page.png",
      indicators: [
        { type: "circle", top: 35, left: 25 },
        { type: "circle", top: 35, left: 50 },
        { type: "circle", top: 35, left: 75 },
      ],
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 p-6 rounded-xl border border-yellow-500/20">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">
              Galería de Personajes
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">👤</span>
                <div>
                  <strong>Explora la galería:</strong> Imágenes de alta calidad
                  de todos los personajes
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">🔍</span>
                <div>
                  <strong>Haz clic en un personaje:</strong> Para ver su perfil
                  detallado
                </div>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: "Detalles de Personaje",
      description: "Perfiles completos con información y estadísticas",
      screenshot: "/guide/screenshots/03-character-detail.png",
      indicators: [
        { type: "label", top: 20, left: 50, text: "Información del Personaje" },
        { type: "arrow", top: 60, left: 30 },
      ],
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 p-6 rounded-xl border border-yellow-500/20">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">
              Vista Detallada
            </h3>
            <div className="space-y-4">
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">📸 Imagen Principal</h4>
                <p className="text-sm text-zinc-400">
                  Vista de alta calidad del personaje
                </p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">📝 Biografía</h4>
                <p className="text-sm text-zinc-400">
                  Información detallada sobre el personaje
                </p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">💬 Comentarios</h4>
                <p className="text-sm text-zinc-400">
                  Comparte tus pensamientos con la comunidad
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 5,
      title: "Explorando Episodios",
      description: "Navega por todas las temporadas y episodios",
      screenshot: "/guide/screenshots/04-episodes-page.png",
      indicators: [
        { type: "number", top: 30, left: 20, number: 1 },
        { type: "number", top: 30, left: 50, number: 2 },
        { type: "number", top: 30, left: 80, number: 3 },
      ],
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 p-6 rounded-xl border border-yellow-500/20">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">
              Catálogo de Episodios
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">✓</span>
                <div>
                  <strong>Vista de Grid:</strong> Explora episodios con
                  miniaturas visuales
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">✓</span>
                <div>
                  <strong>Información Rápida:</strong> Número de episodio,
                  temporada y título
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">✓</span>
                <div>
                  <strong>Haz clic:</strong> Para ver detalles completos del
                  episodio
                </div>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      number: 6,
      title: "Detalles de Episodio",
      description: "Información completa, trivia y comentarios",
      screenshot: "/guide/screenshots/05-episode-detail.png",
      indicators: [
        { type: "box", top: 25, left: 50 },
        { type: "label", top: 65, left: 50, text: "Sección de Trivia" },
      ],
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 p-6 rounded-xl border border-yellow-500/20">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">
              Vista Completa del Episodio
            </h3>
            <div className="space-y-4">
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">📺 Información del Episodio</h4>
                <p className="text-sm text-zinc-400">
                  Título, temporada, número, sinopsis y más
                </p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">🎯 Trivia Interactiva</h4>
                <p className="text-sm text-zinc-400">
                  Descubre datos curiosos sobre el episodio
                </p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">📊 Tracker de Episodios</h4>
                <p className="text-sm text-zinc-400">
                  Marca los episodios que ya has visto
                </p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">💬 Comentarios</h4>
                <p className="text-sm text-zinc-400">
                  Comparte opiniones con otros fans
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 7,
      title: "Colecciones Personalizadas",
      description: "Organiza tus episodios favoritos",
      screenshot: "/guide/screenshots/06-collections-page.png",
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 p-6 rounded-xl border border-yellow-500/20">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">
              Crea tu Biblioteca
            </h3>
            <div className="space-y-4">
              <p className="text-zinc-300">
                Agrupa episodios según tus criterios:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500">⭐</span>
                  <div>
                    <strong>Colecciones Temáticas:</strong> &quot;Mejores
                    Halloween&quot;, &quot;Episodios de Lisa&quot;, etc.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500">📋</span>
                  <div>
                    <strong>Gestión Flexible:</strong> Crea, edita y elimina
                    colecciones fácilmente
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500">✏️</span>
                  <div>
                    <strong>Formulario Simple:</strong> Añade nombre y
                    descripción a cada colección
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 rounded-xl border border-yellow-500/30">
            <p className="text-sm">
              <strong className="text-yellow-500">💡 Idea:</strong> Crea una
              colección &quot;Para Ver&quot; con episodios que quieres revisitar
            </p>
          </div>
        </div>
      ),
    },
    {
      number: 8,
      title: "Tu Diario Personal",
      description: "Documenta tus reflexiones sobre Los Simpson",
      screenshot: "/guide/screenshots/07-diary-page.png",
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 p-6 rounded-xl border border-yellow-500/20">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">
              Sistema de Diario
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="bg-zinc-900/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">📝 Crear Entradas</h4>
                  <p className="text-sm text-zinc-400">
                    Escribe sobre episodios, personajes o pensamientos generales
                  </p>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">🏷️ Categorizar</h4>
                  <p className="text-sm text-zinc-400">
                    Organiza por tipo: episodio, personaje o general
                  </p>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">🗑️ Gestionar</h4>
                  <p className="text-sm text-zinc-400">
                    Edita o elimina tus entradas cuando quieras
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 9,
      title: "¡Listo para Comenzar!",
      description: "Comienza tu aventura en Springfield",
      content: (
        <div className="text-center space-y-6">
          <div className="text-8xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-yellow-500">
            ¡Todo Listo para Springfield!
          </h3>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            Ahora conoces todas las características principales de Springfield
            Life. ¡Es hora de explorar!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold"
              >
                <Home className="mr-2 h-5 w-5" />
                Ir a la Página Principal
              </Button>
            </Link>
            <Link href="/episodes">
              <Button
                size="lg"
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
              >
                Explorar Episodios
              </Button>
            </Link>
          </div>
          <div className="mt-12 bg-zinc-800/50 p-6 rounded-xl border border-yellow-500/20">
            <p className="text-sm text-zinc-400">
              <strong className="text-yellow-500">💡 Recuerda:</strong> Puedes
              volver a esta guía en cualquier momento haciendo clic en el botón
              de ayuda (?) en la esquina inferior derecha
            </p>
          </div>
          <div className="mt-6">
            <Link href="/guide/helper">
              <Button variant="outline" className="border-yellow-500/50">
                🎯 Ir a la Herramienta Helper
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const totalSteps = steps.length;
  const progressPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b-4 border-yellow-500 shadow-xl shadow-yellow-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Springfield Life{" "}
              <span className="text-yellow-500">Guía Interactiva</span>
            </h1>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-yellow-500 hover:text-yellow-400"
              >
                <Home className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
          </div>
          <p className="text-zinc-400">
            Tu compañero definitivo para explorar Los Simpson{" "}
            <span className="inline-block animate-spin">🍩</span>
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-400">
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="text-sm font-medium text-yellow-500">
              {Math.round(progressPercentage)}% Completado
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500 ease-out shadow-lg shadow-yellow-500/50"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Step Header */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-block bg-gradient-to-br from-yellow-400 to-yellow-600 text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-xl shadow-yellow-500/40">
              {currentStepData.number}
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-yellow-500">
              {currentStepData.title}
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Screenshot with Indicators */}
          {currentStepData.screenshot && (
            <div className="mb-12 relative text-center">
              <div className="relative inline-block">
                <Image
                  src={currentStepData.screenshot}
                  alt={currentStepData.title}
                  width={1200}
                  height={800}
                  className="rounded-2xl shadow-2xl border border-zinc-800"
                  priority
                />
                {/* Indicators */}
                {currentStepData.indicators?.map((indicator, idx) => (
                  <div
                    key={idx}
                    className="absolute animate-pulse"
                    style={{
                      top: `${indicator.top}%`,
                      left: `${indicator.left}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {indicator.type === "circle" && (
                      <div className="w-12 h-12 border-4 border-yellow-500 rounded-full bg-yellow-500/20 shadow-lg shadow-yellow-500/50" />
                    )}
                    {indicator.type === "arrow" && (
                      <div className="text-4xl text-yellow-500 drop-shadow-[0_0_10px_rgba(255,217,15,0.8)]">
                        ↓
                      </div>
                    )}
                    {indicator.type === "box" && indicator.text && (
                      <div className="border-4 border-dashed border-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-lg backdrop-blur-sm min-w-[150px]">
                        <span className="text-yellow-500 font-bold text-sm whitespace-nowrap">
                          {indicator.text}
                        </span>
                      </div>
                    )}
                    {indicator.type === "label" && indicator.text && (
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-xl font-bold text-sm shadow-xl shadow-yellow-500/60 whitespace-nowrap">
                        {indicator.text}
                      </div>
                    )}
                    {indicator.type === "number" && indicator.number && (
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-full flex items-center justify-center font-bold shadow-xl shadow-yellow-500/60 border-2 border-white">
                        {indicator.number}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-zinc-800">
            <Button
              onClick={goToPreviousStep}
              disabled={currentStep === 1}
              variant="outline"
              size="lg"
              className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i + 1)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i + 1 === currentStep
                      ? "bg-yellow-500 scale-125"
                      : i + 1 < currentStep
                      ? "bg-yellow-500/50"
                      : "bg-zinc-700"
                  }`}
                  aria-label={`Ir al paso ${i + 1}`}
                />
              ))}
            </div>

            {currentStep < totalSteps ? (
              <Button
                onClick={goToNextStep}
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold"
              >
                Siguiente
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Link href="/">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold"
                >
                  <Home className="mr-2 h-5 w-5" />
                  ¡Comenzar!
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
