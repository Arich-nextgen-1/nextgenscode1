"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockSubstitutionRequest, mockScheduleSlots } from "@/data"
import { CalendarDays, AlertCircle, ArrowRight, UserCheck, Sparkles, CheckCircle2, Clock } from "lucide-react"

export default function SchedulePage() {
  const req = mockSubstitutionRequest
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule & Substitutions</h1>
          <p className="text-slate-500 mt-1">AI-powered teacher replacement recommendations</p>
        </div>
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          <CalendarDays className="mr-2 h-4 w-4" /> View Full Schedule
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Col - Required Action */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" /> Action Required Today
          </h2>
          
          <Card className="border-red-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-red-500"></div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-slate-900">Absent Teacher</CardTitle>
                  <CardDescription className="text-red-600 font-medium mt-1">Sick Leave</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
                  {req.absent_teacher_name.charAt(0)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold mb-4">{req.absent_teacher_name}</h3>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Affected Lessons Today</p>
                {req.affected_slots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-white">{slot.period} period</Badge>
                      <span className="text-sm font-medium">{slot.subject}</span>
                    </div>
                    <span className="text-sm text-slate-500 font-medium">{slot.class_name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col - AI Recommendation */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-600">
            <Sparkles className="h-5 w-5" /> AI Recommendation
          </h2>

          <Card className="border-indigo-200 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/30">
            <div className="absolute top-0 right-0 p-6">
              <Badge variant="success" className="bg-indigo-100 text-indigo-800 border-none px-3 py-1 text-sm">
                {req.qualification_match}% Match Score
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Suggested Replacement</CardTitle>
              <CardDescription>Based on subject qualification and free time slots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl border-4 border-white shadow-sm">
                  {req.recommended_substitute_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{req.recommended_substitute_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-white text-slate-600 border-slate-200">No category</Badge>
                    <span className="text-sm text-slate-500">Teacher</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm relative">
                <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  <Sparkles className="h-3 w-3" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  "{req.ai_recommendation}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Qualifications</p>
                  <p className="text-sm font-medium pl-5">Primary School Teacher</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Availability</p>
                  <p className="text-sm font-medium pl-5">Free periods 3 & 4 today</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-6">
              {req.status === 'applied' ? (
                <div className="w-full flex items-center justify-center p-3 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-200 gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Substitution Applied & Schedule Updated
                </div>
              ) : (
                <Button className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700 shadow-md">
                  <UserCheck className="mr-2 h-5 w-5" /> Apply Substitution
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
