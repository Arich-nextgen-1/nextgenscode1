"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockVoiceTranscription } from "@/data"
import { Mic, Square, Play, CheckCircle2, Loader2, Calendar } from "lucide-react"

export default function VoicePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResult, setShowResult] = useState(true)

  const handleRecordClick = () => {
    if (isRecording) {
      setIsRecording(false)
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        setShowResult(true)
      }, 2000)
    } else {
      setIsRecording(true)
      setShowResult(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Голосовые команды</h1>
          <p className="text-slate-500 mt-1">Создание задач через голосовой ввод</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Input and Transcription */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                <Mic className="h-4 w-4 text-slate-500" />
                Ввод команды
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                {!isRecording && !isProcessing && (
                  <>
                    <Button 
                      onClick={handleRecordClick} 
                      size="lg" 
                      className="bg-slate-900 text-white hover:bg-slate-800 rounded-full h-14 w-14 p-0 shadow-sm transition-transform hover:scale-105"
                    >
                      <Mic className="h-6 w-6" />
                    </Button>
                    <p className="text-sm font-medium text-slate-700 mt-4">Нажмите для записи</p>
                    <p className="text-xs text-slate-500 mt-1 text-center max-w-xs">
                      Пример: "Подготовьте актовый зал к завтрашнему мероприятию"
                    </p>
                  </>
                )}
                
                {isRecording && (
                  <>
                    <Button 
                      onClick={handleRecordClick} 
                      size="lg" 
                      variant="destructive"
                      className="rounded-full h-14 w-14 p-0 shadow-sm animate-pulse"
                    >
                      <Square className="h-5 w-5 fill-current" />
                    </Button>
                    <p className="text-sm font-medium text-red-600 mt-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                      Идет запись...
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Говорите четко</p>
                  </>
                )}
                
                {isProcessing && (
                  <>
                    <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 mt-4">Обработка...</p>
                    <p className="text-xs text-slate-500 mt-1">Распознавание речи и извлечение задач</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {showResult && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-medium text-slate-800 flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4 text-slate-500" /> 
                  Распознанный текст
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-700 leading-relaxed bg-white">
                  "{mockVoiceTranscription.transcript}"
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><Play className="h-3 w-3" /> {mockVoiceTranscription.duration_seconds} сек</span>
                  <span className="flex items-center gap-1.5 text-slate-600"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Проверено AI</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Generated Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-slate-500" />
                  Результат: Созданные задачи
                </CardTitle>
                {showResult && (
                  <Badge variant="outline" className="bg-white text-slate-600 font-medium">
                    Найдено: {mockVoiceTranscription.parsed_tasks.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 bg-slate-50/30">
              {showResult ? (
                <div className="space-y-4">
                  {mockVoiceTranscription.parsed_tasks.map((task, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 hover:border-slate-300 transition-colors">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900 text-sm">{task.title}</h4>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-1.5 text-[10px]">
                            {task.priority === 'critical' ? 'Крит.' : task.priority === 'high' ? 'Высок.' : task.priority === 'medium' ? 'Сред.' : 'Низк.'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{task.description}</p>
                        
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-medium">
                              {task.assignee_name?.charAt(0)}
                            </div>
                            <span className="text-xs text-slate-700 font-medium">{task.assignee_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {task.deadline ? new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : 'Без срока'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
                    <Button variant="outline" className="bg-white text-slate-700 border-slate-200">
                      Отменить
                    </Button>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800">
                      Сохранить задачи
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <FileTextIcon className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">Ожидание ввода</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Задачи появятся здесь после завершения распознавания голосовой команды.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
