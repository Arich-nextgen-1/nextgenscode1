"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockTasks, mockIncidents } from "@/data"
import { AlertTriangle, Clock, CheckCircle2, MessageSquare, Plus, ArrowRight, User } from "lucide-react"
import { formatTime } from "@/lib/utils"

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks & Incidents</h1>
          <p className="text-slate-500 mt-1">AI-extracted tasks and issue tracking</p>
        </div>
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Kanban Board Layout */}
        
        {/* NEW Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> New
            </h3>
            <Badge variant="outline" className="bg-white">{mockTasks.filter(t => t.status === 'new').length}</Badge>
          </div>
          <div className="space-y-3">
            {mockTasks.filter(t => t.status === 'new').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> In Progress
            </h3>
            <Badge variant="outline" className="bg-white">{mockTasks.filter(t => t.status === 'in_progress').length}</Badge>
          </div>
          <div className="space-y-3">
            {mockTasks.filter(t => t.status === 'in_progress').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* WAITING Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Waiting
            </h3>
            <Badge variant="outline" className="bg-white">{mockTasks.filter(t => t.status === 'waiting').length}</Badge>
          </div>
          <div className="space-y-3">
            {mockTasks.filter(t => t.status === 'waiting').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* DONE Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Done
            </h3>
            <Badge variant="outline" className="bg-white">{mockTasks.filter(t => t.status === 'done').length}</Badge>
          </div>
          <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
            {mockTasks.filter(t => t.status === 'done').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task }: { task: any }) {
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'critical': return <Badge variant="destructive" className="h-5 text-[10px] px-1.5">Critical</Badge>
      case 'high': return <Badge variant="warning" className="bg-orange-100 text-orange-800 h-5 text-[10px] px-1.5 hover:bg-orange-200 border-none">High</Badge>
      case 'medium': return <Badge variant="secondary" className="bg-blue-50 text-blue-700 h-5 text-[10px] px-1.5 hover:bg-blue-100 border-none">Medium</Badge>
      case 'low': return <Badge variant="outline" className="h-5 text-[10px] px-1.5">Low</Badge>
      default: return null
    }
  }

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'voice': return <span className="flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium"><MessageSquare className="h-3 w-3" /> Voice AI</span>
      case 'message': return <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium"><MessageSquare className="h-3 w-3" /> Chat AI</span>
      case 'ai_generated': return <span className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium"><AlertTriangle className="h-3 w-3" /> System AI</span>
      default: return null
    }
  }

  return (
    <Card className="hover:border-slate-300 transition-colors shadow-sm cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          {getPriorityBadge(task.priority)}
          {getSourceIcon(task.source)}
        </div>
        <h4 className="font-medium text-sm text-slate-900 leading-tight mb-1.5 group-hover:text-emerald-700 transition-colors">{task.title}</h4>
        {task.source_message && (
          <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded mb-2 border border-slate-100 italic line-clamp-1">
            "{task.source_message}"
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags?.map((tag: string) => (
            <span key={tag} className="text-[9px] uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold">
              {task.assignee_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
            </div>
          </div>
          {task.deadline && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock className="h-3 w-3" />
              {new Date(task.deadline).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
