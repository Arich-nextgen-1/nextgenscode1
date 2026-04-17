"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAttendanceRecords, mockCanteenReport, mockTelegramMessages } from "@/data"
import { CheckCircle2, MessageSquare, Utensils, AlertCircle, RefreshCw, Send, Check } from "lucide-react"

export default function AttendancePage() {
  const [canteenSent, setCanteenSent] = useState(false)
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance & Canteen</h1>
          <p className="text-slate-500 mt-1">Automated attendance parsing from teacher chats</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Sync Messages
          </Button>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setCanteenSent(true)} disabled={canteenSent}>
            {canteenSent ? <Check className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
            {canteenSent ? 'Report Sent' : 'Send to Canteen'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Telegram Stream */}
        <Card className="md:col-span-1 h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b pb-4 shrink-0 bg-slate-50/50">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-500" /> 
              Teacher Chat Stream
            </CardTitle>
            <CardDescription>Live messages from WhatsApp/Telegram</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockTelegramMessages.filter(m => m.type === 'attendance').map((msg) => (
              <div key={msg.id} className="bg-slate-50 rounded-lg p-3 text-sm relative group border border-slate-100">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="font-semibold text-slate-900">{msg.from_name}</span>
                  <span className="text-xs text-slate-500">{new Date(msg.sent_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-700">{msg.message}</p>
                {msg.processed && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-700 border-none">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> AI Parsed
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Column - Parsed Results */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="parsed" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-sm mb-4">
              <TabsTrigger value="parsed">Parsed Records</TabsTrigger>
              <TabsTrigger value="canteen">Canteen Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="parsed" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockAttendanceRecords.map((record) => (
                  <Card key={record.id} className={`transition-all ${record.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                    <CardHeader className="pb-2 p-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-bold">{record.class_name}</CardTitle>
                        {record.status === 'parsed' ? (
                          <Badge variant="success" className="bg-emerald-100 text-emerald-800">
                            {record.confidence}%
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="bg-amber-100 text-amber-800">
                            Pending
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">{record.teacher_name}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Present</span>
                        <span className="font-medium text-emerald-600">{record.present} / {record.total_students}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-slate-500">Absent</span>
                        <span className="font-medium text-red-600">{record.absent}</span>
                      </div>
                      
                      {record.status === 'parsed' && (
                        <div className="text-[10px] text-slate-400 bg-slate-50 p-1.5 rounded border border-slate-100 truncate">
                          "{record.raw_message}"
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="canteen" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-emerald-600" />
                    Daily Canteen Report
                  </CardTitle>
                  <CardDescription>Automatically generated from parsed attendance records</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div className="text-3xl font-bold text-slate-900">{mockCanteenReport.total_students}</div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Total Students</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                      <div className="text-3xl font-bold text-emerald-700">{mockCanteenReport.present_count}</div>
                      <div className="text-xs text-emerald-600 font-medium uppercase tracking-wider mt-1">Present Today</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                      <div className="text-3xl font-bold text-red-600">{mockCanteenReport.absent_count}</div>
                      <div className="text-xs text-red-500 font-medium uppercase tracking-wider mt-1">Absent</div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-emerald-600 text-white rounded-xl shadow-inner flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium opacity-90">Total Portions Required</h3>
                      <p className="text-sm opacity-80 mt-1">For primary school (1st - 4th grade)</p>
                    </div>
                    <div className="text-5xl font-black">{mockCanteenReport.portions_needed}</div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t flex justify-between items-center rounded-b-xl">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> AI verified calculations
                  </span>
                  <span className="text-xs text-slate-500">
                    Generated at {new Date(mockCanteenReport.generated_at).toLocaleTimeString('ru-RU')}
                  </span>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
