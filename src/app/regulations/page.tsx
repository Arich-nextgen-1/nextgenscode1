"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockRegulations, mockRAGQueries } from "@/data"
import { FileText, Search, UploadCloud, BookOpen, AlertCircle, CheckCircle2, ShieldCheck, Database } from "lucide-react"

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RAG & Compliance</h1>
          <p className="text-slate-500 mt-1">Vector search through school regulations and orders</p>
        </div>
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          <UploadCloud className="mr-2 h-4 w-4" /> Upload Order PDF
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-indigo-100 shadow-sm bg-indigo-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" /> Ask AI Compliance Assistant
              </CardTitle>
              <CardDescription>Get simple answers and compliance checks based on uploaded documents</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Как часто нужно проводить инструктаж по пожарной безопасности?" 
                    className="pl-10 h-12 text-base bg-white border-slate-200 shadow-sm rounded-xl focus-visible:ring-indigo-500"
                  />
                </div>
                <Button type="submit" disabled={isSearching || !query.trim()} className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                  {isSearching ? "Searching..." : "Ask AI"}
                </Button>
              </form>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                <Badge variant="outline" className="cursor-pointer bg-white hover:bg-slate-50 shrink-0" onClick={() => setQuery("Как часто нужно проводить инструктаж по пожарной безопасности?")}>
                  Инструктаж по ПБ
                </Badge>
                <Badge variant="outline" className="cursor-pointer bg-white hover:bg-slate-50 shrink-0" onClick={() => setQuery("Кто может замещать уроки при отсутствии учителя?")}>
                  Правила замены учителей
                </Badge>
                <Badge variant="outline" className="cursor-pointer bg-white hover:bg-slate-50 shrink-0" onClick={() => setQuery("Сроки сдачи журнала посещаемости")}>
                  Сроки сдачи журналов
                </Badge>
              </div>
            </CardContent>
          </Card>

          {showResult && (
            <Card className="border-indigo-200 shadow-md">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-lg flex items-center justify-between">
                  AI Answer
                  <Badge variant="outline" className="text-xs font-normal border-indigo-200 bg-indigo-50 text-indigo-700">
                    <Database className="h-3 w-3 mr-1" /> Vector Searched
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="prose prose-sm prose-slate max-w-none">
                  <p className="text-base leading-relaxed" dangerouslySetInnerHTML={{__html: result.answer?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || ''}}></p>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertCircle className={`h-4 w-4 ${result.compliance_check?.risk_level === 'high' ? 'text-red-500' : 'text-emerald-500'}`} /> 
                    Compliance Checklist
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
                    {result.compliance_check?.checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {item.status === 'done' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : item.status === 'failed' ? (
                          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                        )}
                        <span className={`text-sm ${item.status === 'failed' ? 'text-red-700 font-medium' : item.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                  {result.compliance_check?.notes && (
                    <div className="mt-3 p-3 bg-red-50 text-red-800 text-sm rounded-lg border border-red-100">
                      <strong>AI Warning:</strong> {result.compliance_check.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Indexed Documents</CardTitle>
              <CardDescription>Knowledge base for RAG</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRegulations.map(reg => (
                <div key={reg.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate" title={reg.title}>
                      Order #{reg.order_number}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1">{reg.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="success" className="text-[9px] px-1.5 py-0 h-4 border-none bg-emerald-100 text-emerald-700">Indexed</Badge>
                      <span className="text-[10px] text-slate-400">{reg.chunk_count} chunks</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
