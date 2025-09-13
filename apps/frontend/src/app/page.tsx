import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, User } from "lucide-react"

// Datos dummy para artículos
const articulos = [
  {
    id: 1,
    titulo: "Mecánica Cuántica: Interpretaciones y Paradojas",
    resumen: "Un análisis profundo de las diferentes interpretaciones de la mecánica cuántica y sus implicaciones filosóficas.",
    autor: "Dr. María González",
    fecha: "2024-01-15",
    tiempoLectura: "12 min",
    categoria: "Física",
    etiquetas: ["mecánica cuántica", "física teórica", "filosofía de la ciencia"]
  },
  {
    id: 2,
    titulo: "Topología Algebraica en la Física Moderna",
    resumen: "Cómo los conceptos de topología algebraica han revolucionado nuestra comprensión de la materia condensada.",
    autor: "Prof. Carlos Rodríguez",
    fecha: "2024-01-10",
    tiempoLectura: "15 min",
    categoria: "Matemáticas",
    etiquetas: ["topología", "física de la materia condensada", "matemáticas aplicadas"]
  },
  {
    id: 3,
    titulo: "Inteligencia Artificial y Teoría de la Información",
    resumen: "Explorando las bases matemáticas de la IA moderna desde la perspectiva de la teoría de la información.",
    autor: "Dra. Ana Martín",
    fecha: "2024-01-05",
    tiempoLectura: "10 min",
    categoria: "Ingeniería",
    etiquetas: ["IA", "teoría de la información", "machine learning"]
  }
]

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Bienvenido a Mindraxia
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Divulgación científica técnica de alta calidad. Artículos profundos sobre física, 
            matemáticas, ingeniería y otras ciencias duras.
          </p>
          <Button size="lg" className="mt-4">
            Explorar Artículos
          </Button>
        </div>

        {/* Artículos Recientes */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Artículos Recientes</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articulos.map((articulo) => (
              <Card key={articulo.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{articulo.categoria}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {articulo.tiempoLectura}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{articulo.titulo}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {articulo.resumen}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {articulo.etiquetas.map((etiqueta) => (
                        <Badge key={etiqueta} variant="outline" className="text-xs">
                          {etiqueta}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        {articulo.autor}
                      </div>
                      <div className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        {new Date(articulo.fecha).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categorías Destacadas */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Explora por Categorías</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {["Física", "Matemáticas", "Ingeniería", "Ciencias de la Computación"].map((categoria) => (
              <Card key={categoria} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{categoria}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
