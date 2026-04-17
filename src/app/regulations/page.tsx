"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockRegulations, mockRAGQueries } from "@/data"
import { Search, UploadCloud, AlertCircle, CheckCircle2, ShieldCheck, Database, Calendar, Loader2 } from "lucide-react"

export default function RegulationsPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const result = mockRAGQueries[0]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      setShowResult(true)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Приказы и нормативы</h1>
          <p className="text-slate-500 mt-1">Реестр нормативных документов и проверка соответствия</p>
        </div>
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          <UploadCloud className="mr-2 h-4 w-4" /> Добавить документ
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 p-4 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            Умный поиск по базе документов
          </h2>
        </div>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Введите запрос (например: Как часто проводить инструктаж по ПБ?)" 
                className="pl-4 h-11 text-sm bg-white border-slate-200 shadow-sm"
              />
            </div>
            <Button type="submit" disabled={isSearching || !query.trim()} className="h-11 px-8 bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isSearching ? "Анализ..." : "Найти"}
            </Button>
          </form>

          {!showResult && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="cursor-pointer font-normal text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" onClick={() => setQuery("Как часто нужно проводить инструктаж по пожарной безопасности?")}>
                Инструктаж по ПБ
              </Badge>
              <Badge variant="secondary" className="cursor-pointer font-normal text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" onClick={() => setQuery("Кто может замещать уроки при отсутствии учителя?")}>
                Правила замены учителей
              </Badge>
              <Badge variant="secondary" className="cursor-pointer font-normal text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" onClick={() => setQuery("Сроки сдачи журнала посещаемости")}>
                Сроки сдачи журналов
              </Badge>
            </div>
          )}

          {showResult && (
            <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-500" />
                    Справка на основе документов
                  </h3>
                  <Badge variant="outline" className="bg-white text-xs font-normal text-slate-500">
                    Источник: Приказ №{mockRegulations.find(r => r.id === result.documents_used[0])?.order_number || 'Неизвестно'}
                  </Badge>
                </div>
                <div className="p-5 space-y-6">
                  <div className="prose prose-sm prose-slate max-w-none">
                    <p className="text-sm leading-relaxed text-slate-700" dangerouslySetInnerHTML={{__html: result.answer?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || ''}}></p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                    <h4 className="text-sm font-medium text-slate-800 mb-4 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-slate-500" />
                      Статус контроля
                    </h4>
                    <div className="space-y-3">
                      {result.compliance_check?.checklist.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          {item.status === 'done' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : item.status === 'failed' ? (
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                          )}
                          <span className={`text-sm ${item.status === 'failed' ? 'text-red-600 font-medium' : item.status === 'done' ? 'text-slate-500' : 'text-slate-700'}`}>
                            {item.item}
                          </span>
                        </div>
                      ))}
                    </div>
                    {result.compliance_check?.notes && (
                      <div className="mt-4 p-3 bg-red-50/50 text-red-700 text-xs rounded border border-red-100 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                        <p className="leading-relaxed">{result.compliance_check.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Реестр документов</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockRegulations.map(reg => (
            <Card key={reg.id} className="border-slate-200 shadow-sm hover:border-slate-300 transition-colors flex flex-col group cursor-pointer">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="outline" className="bg-white font-medium text-slate-700 border-slate-200 shadow-sm">
                    Приказ №{reg.order_number}
                  </Badge>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none text-[10px] px-2 uppercase tracking-wider font-semibold">
                    Активен
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold text-slate-900 leading-snug mt-3 line-clamp-2 group-hover:text-slate-700 transition-colors" title={reg.title}>
                  {reg.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4 flex-1">
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {reg.description}
                </p>
              </CardContent>
              <CardFooter className="pt-3 pb-3 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-slate-400" />
                  <span>{reg.chunk_count} блоков данных</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(reg.uploaded_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
