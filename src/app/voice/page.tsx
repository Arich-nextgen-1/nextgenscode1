"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockVoiceTranscription } from "@/data"
import { Mic, Square, Play, CheckCircle2, AlertTriangle, ArrowRight, Save, Loader2, Sparkles, Wand2 } from "lucide-react"

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold tracking-tight">Voice to Task AI</h1>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
          Just speak your orders. The AI will automatically transcribe your voice, extract multiple tasks, assign them to the right staff, and set deadlines.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className={`border-2 transition-all duration-500 ${isRecording ? 'border-red-400 shadow-[0_0_30px_rgba(248,113,113,0.3)]' : isProcessing ? 'border-indigo-400' : 'border-emerald-200'}`}>
            <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
              <button 
                onClick={handleRecordClick}
                className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl ${
                  isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isRecording ? (
                  <>
                    <span className="absolute w-full h-full rounded-full border-4 border-red-500 opacity-20 animate-ping"></span>
                    <Square className="h-8 w-8 text-white fill-current" />
                  </>
                ) : (
                  <Mic className="h-10 w-10 text-white" />
                )}
              </button>
              
              <div className="mt-8 space-y-2 h-16">
                {isRecording ? (
                  <>
                    <h3 className="text-xl font-bold text-red-500">Recording...</h3>
                    <p className="text-slate-500 flex items-center justify-center gap-2">
                      <span className="flex gap-1 h-3 items-center">
                        <span className="w-1 h-2 bg-red-400 rounded-full animate-bounce"></span>
                        <span className="w-1 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-1 h-4 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        <span className="w-1 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </span>
                      Speak your command
                    </p>
                  </>
                ) : isProcessing ? (
                  <>
                    <h3 className="text-xl font-bold text-indigo-600 flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> Processing AI
                    </h3>
                    <p className="text-slate-500">Transcribing and extracting tasks...</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-900">Tap to speak</h3>
                    <p className="text-slate-500">Example: "Айгерим, подготовь зал..."</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {showResult && (
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4" /> Original Transcription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-slate-800 leading-relaxed font-medium">
                  "{mockVoiceTranscription.transcript}"
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Play className="h-3 w-3" /> {mockVoiceTranscription.duration_seconds} sec</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Whisper AI Confirmed</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {showResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-indigo-500" /> Extracted Tasks
                </h2>
                <Badge variant="success" className="bg-indigo-100 text-indigo-800 border-none px-2 py-0.5">
                  2 Tasks Found
                </Badge>
              </div>

              {mockVoiceTranscription.parsed_tasks.map((task, idx) => (
                <Card key={idx} className="relative overflow-hidden border-l-4 border-l-emerald-500">
                  <div className="absolute top-0 right-0 p-4">
                    <Badge variant="success" className="bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {task.confidence}% Match
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="pr-20">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">{task.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Assignee</p>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                            {task.assignee_name?.charAt(0)}
                          </span>
                          {task.assignee_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Deadline</p>
                        <p className="text-sm font-medium">{task.deadline ? new Date(task.deadline).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }) : 'ASAP'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="pt-4 flex gap-3">
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm & Assign All
                </Button>
                <Button variant="outline" className="flex-1">
                  Edit Details
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Sparkles className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-500">Waiting for voice input</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs">
                The AI will break down your voice command into actionable tasks here.
              </p>
            </div>
          )}
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
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
