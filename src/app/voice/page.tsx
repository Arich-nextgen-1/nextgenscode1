"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getAIInsights, getAIActions, getAIActivity, getRecentQueries,
  processVoiceCommand, processTextCommand,
} from "@/services/ai"
import type {
  AIInsight, AIAction, AIActivity, AIActionStatus,
  VoiceParsedResult, VoiceResultTask
} from "@/types"
import {
  Mic, Square, Loader2, Send, CheckCircle2, BrainCircuit, Clock,
  ChevronRight, AlertTriangle, Info, TrendingDown, RotateCcw,
  MessageCircle, ListChecks, ArrowRight, Bell
} from "lucide-react"
import { FormattedDate } from "@/components/ui/formatted-date"

const QUICK_PROMPTS = [
  "Покажи риски по школе",
  "Создай задачи по инцидентам",
  "Проверь замены на завтра",
  "Сделай сводку по посещаемости",
]

// TODO: connect backend / LLM here — POST /api/ai/voice-parse
const MOCK_PARSE_RESULT: VoiceParsedResult = {
  raw_command: 'Мы делаем хакатон на следующей неделе. Айгерим, подготовь актовый зал до пятницы. Назкен, закажи воду и бейджи до четверга.',
  parsed_at: new Date().toISOString(),
  tasks: [
    {
      id: 'vt1',
      title: 'Подготовить актовый зал к хакатону',
      assignee_name: 'Айгерим Нурланова',
      deadline: new Date(Date.now() + 432000000).toISOString(),
      priority: 'medium',
      notificationSent: true,
      notificationChannel: 'telegram',
    },
    {
      id: 'vt2',
      title: 'Заказать воду и бейджи для хакатона',
      assignee_name: 'Назкен Сейткалиева',
      deadline: new Date(Date.now() + 345600000).toISOString(),
      priority: 'medium',
      notificationSent: true,
      notificationChannel: 'telegram',
    },
  ],
}

export default function AIZavuchPage() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [actions, setActions] = useState<AIAction[]>([])
  const [activity, setActivity] = useState<AIActivity[]>([])
  const [recentQueries, setRecentQueries] = useState<{ id: string; text: string; time: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [actionStates, setActionStates] = useState<Record<string, AIActionStatus>>({})

  // Command panel state
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [isProcessingText, setIsProcessingText] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [parsedResult, setParsedResult] = useState<VoiceParsedResult | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      const [ins, acts, act, rq] = await Promise.all([
        getAIInsights(),
        getAIActions(),
        getAIActivity(),
        getRecentQueries(),
      ])
      setInsights(ins)
      setActions(acts)
      setActivity(act)
      setRecentQueries(rq)
      setLoading(false)
    }
    fetchAll()
  }, [])

  const handleActionClick = async (actionId: string) => {
    setActionStates(s => ({ ...s, [actionId]: "loading" }))
    await new Promise(r => setTimeout(r, 1400))
    setActionStates(s => ({ ...s, [actionId]: "success" }))
    setTimeout(() => setActionStates(s => ({ ...s, [actionId]: "idle" })), 3500)
  }

  const handleMicClick = async () => {
    if (isRecording) {
      setIsRecording(false)
      setIsProcessingVoice(true)
      setAiResponse(null)
      setParsedResult(null)
      // TODO: connect STT here — send audio to /api/ai/voice
      const transcript = await processVoiceCommand()
      setInputText(transcript)
      setIsProcessingVoice(false)
      // Show parse result for voice
      await new Promise(r => setTimeout(r, 200))
      setParsedResult(MOCK_PARSE_RESULT)
      setTimeout(() => textareaRef.current?.focus(), 100)
    } else {
      setIsRecording(true)
      setAiResponse(null)
      setParsedResult(null)
    }
  }

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text) return
    setIsProcessingText(true)
    setAiResponse(null)
    setParsedResult(null)
    // TODO: connect LLM here — POST /api/ai/chat
    const response = await processTextCommand(text)
    setAiResponse(response)
    setIsProcessingText(false)
    setInputText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!isProcessingText && inputText.trim()) handleSend()
    }
  }

  const handleQuickPrompt = (p: string) => {
    setInputText(p)
    setAiResponse(null)
    setParsedResult(null)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const insightIcon = (severity: string) => {
    if (severity === "critical") return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
    if (severity === "warning") return <TrendingDown className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
    return <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
  }
  const insightBg: Record<string, string> = {
    critical: "border-red-200 bg-red-50/50",
    warning: "border-amber-200 bg-amber-50/40",
    info: "border-blue-200 bg-blue-50/30",
  }
  const severityBadge: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  }
  const severityLabel: Record<string, string> = {
    critical: "Критично",
    warning: "Внимание",
    info: "Инфо",
  }
  const priorityLabel: Record<string, string> = {
    critical: "Критический",
    high: "Высокий",
    medium: "Средний",
    low: "Низкий",
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-slate-600" />
            AI Завуч
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Интеллектуальный центр управления школой — анализ, решения и автоматизация
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1 px-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block mr-2 animate-pulse" />
            Активен
          </Badge>
          <FormattedDate 
            date={new Date()} 
            type="date" 
            options={{ day: "numeric", month: "long" }} 
            className="text-xs text-slate-400 font-medium" 
          />
        </div>
      </div>

      {/* COMMAND PANEL */}
      <Card className="border-slate-300 shadow-sm bg-white">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Командная строка AI</p>
            {(isRecording || isProcessingVoice || isProcessingText) && (
              <span className="text-xs text-slate-400">
                {isRecording && "Запись..."}
                {isProcessingVoice && "Распознавание речи..."}
                {isProcessingText && "Обработка команды..."}
              </span>
            )}
          </div>

          {isRecording && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-md border border-red-200 bg-red-50">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span className="text-sm font-medium text-red-700">Идёт запись — говорите чётко</span>
              <div className="ml-auto flex gap-0.5 items-center h-4">
                {[2, 4, 3, 5, 2, 4, 3].map((h, i) => (
                  <span key={i} className="w-0.5 bg-red-400 rounded-full animate-bounce"
                    style={{ height: `${h * 3}px`, animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            </div>
          )}

          {aiResponse && !isProcessingText && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-md border border-slate-200 bg-slate-50">
              <BrainCircuit className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-800 leading-relaxed">{aiResponse}</p>
              <button onClick={() => setAiResponse(null)} className="ml-auto text-slate-300 hover:text-slate-500 transition-colors shrink-0">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите команду или вопрос... (Enter — отправить, Shift+Enter — перенос)"
              rows={3}
              className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
              disabled={isRecording || isProcessingVoice || isProcessingText}
            />

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.slice(0, 3).map(p => (
                  <button
                    key={p}
                    onClick={() => handleQuickPrompt(p)}
                    className="text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-colors font-medium"
                    disabled={isRecording || isProcessingVoice || isProcessingText}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleMicClick}
                  variant="outline"
                  size="sm"
                  disabled={isProcessingVoice || isProcessingText}
                  className={`h-9 px-3 border-slate-200 transition-colors ${isRecording ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {isProcessingVoice ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    : isRecording ? <Square className="h-3.5 w-3.5 fill-current mr-1.5" />
                    : <Mic className="h-3.5 w-3.5 mr-1.5" />}
                  {isRecording ? "Стоп" : "Голос"}
                </Button>
                <Button
                  onClick={handleSend}
                  size="sm"
                  disabled={!inputText.trim() || isRecording || isProcessingVoice || isProcessingText}
                  className="h-9 px-4 bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                >
                  {isProcessingText ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                  Отправить
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* VOICE/COMMAND RESULT PANEL */}
      {parsedResult && (
        <div className="grid md:grid-cols-3 gap-5">
          {/* Parse result */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/60">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-indigo-500" />
                Результат разбора
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Исходная команда</p>
                <div className="text-xs text-slate-600 bg-slate-100 p-3 rounded-md border-l-2 border-indigo-300 italic leading-relaxed">
                  «{parsedResult.raw_command}»
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">AI разбил на задачи</p>
                <div className="space-y-2">
                  {parsedResult.tasks.map((t, i) => (
                    <div key={t.id} className="flex items-start gap-2 text-xs">
                      <span className="shrink-0 h-4 w-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                      <div>
                        <span className="font-medium text-slate-800">{t.assignee_name}</span>
                        <span className="text-slate-500 mx-1">→</span>
                        <span className="text-slate-700">{t.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Created tasks */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/60">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-emerald-500" />
                Созданные задачи
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {parsedResult.tasks.map(t => (
                <div key={t.id} className="p-3 border border-slate-100 rounded-md bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 leading-snug">{t.title}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                      {priorityLabel[t.priority] || t.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    {t.assignee_name}
                  </p>
                    {t.deadline && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        До <FormattedDate date={t.deadline} type="date" />
                      </p>
                    )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications sent */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/60">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                Уведомления отправлены
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {parsedResult.tasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-md bg-slate-50/50">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{t.assignee_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.title}</p>
                  </div>
                  {t.notificationSent ? (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-medium">
                        <MessageCircle className="h-3 w-3 mr-1" /> Telegram
                      </Badge>
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Доставлено
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Ожидает</Badge>
                  )}
                </div>
              ))}
              <p className="text-[10px] text-slate-400 text-center pt-1">
                {/* TODO: connect Telegram delivery status here */}
                Уведомления отправлены через Telegram Bot
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid xl:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="xl:col-span-1 space-y-5">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/60">
              <CardTitle className="text-sm font-semibold text-slate-700">Быстрые сценарии</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1.5">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => handleQuickPrompt(p)}
                  className="w-full text-left text-sm px-3 py-2.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between group"
                >
                  <span>{p}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/60">
              <CardTitle className="text-sm font-semibold text-slate-700">Последние запросы</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-4 text-xs text-slate-400">Загрузка...</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentQueries.map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleQuickPrompt(q.text)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{q.text}</span>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-3">{q.time}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-2 space-y-5">

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">AI инсайты за сегодня</CardTitle>
                {!loading && (
                  <Badge variant="outline" className="bg-white text-slate-500 font-normal text-xs">{insights.length} сигнала</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" /> Анализируем данные школы...
                </div>
              ) : (
                insights.map(insight => (
                  <div key={insight.id} className={`flex items-start gap-3 px-4 py-3 rounded-md border ${insightBg[insight.severity]}`}>
                    {insightIcon(insight.severity)}
                    <p className="text-sm text-slate-800 flex-1 leading-snug">{insight.text}</p>
                    <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0 font-semibold uppercase tracking-wider border ${severityBadge[insight.severity]}`}>
                      {severityLabel[insight.severity]}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/60">
              <CardTitle className="text-sm font-semibold text-slate-700">Действия AI</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <p className="text-sm text-slate-400">Загрузка...</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {actions.map(action => {
                    const state = actionStates[action.id] || "idle"
                    return (
                      <button
                        key={action.id}
                        disabled={state === "loading" || state === "success"}
                        onClick={() => handleActionClick(action.id)}
                        className={`group text-left p-4 rounded-md border transition-all ${
                          state === "success"
                            ? "border-emerald-200 bg-emerald-50 cursor-default"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
                        } ${state === "loading" ? "opacity-70 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {state === "loading" && <Loader2 className="h-3.5 w-3.5 text-slate-500 animate-spin shrink-0" />}
                          {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                          <span className={`text-sm font-semibold ${state === "success" ? "text-emerald-700" : "text-slate-800"}`}>
                            {state === "loading" ? "Выполняется..." : state === "success" ? "Выполнено" : action.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-snug">{action.description}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">Что AI сделал сегодня</CardTitle>
                <Badge variant="outline" className="bg-white text-slate-500 font-normal text-xs">
                  {!loading ? `${activity.length} операций` : "..."}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="px-4 py-5 text-sm text-slate-400">Загрузка...</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activity.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50/60 transition-colors">
                      <span className="text-base leading-none shrink-0 w-5 text-center">{item.icon}</span>
                      <p className="text-sm text-slate-700 flex-1 leading-snug">{item.text}</p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium shrink-0">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
