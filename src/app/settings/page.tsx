"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockIntegrations } from "@/data"
import { Settings2, Database, MessageCircle, Bot, Mic, Layers, Calendar, Bell, CheckCircle2, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const getIcon = (type: string) => {
    switch(type) {
      case 'supabase': return <Database className="h-6 w-6 text-emerald-600" />
      case 'telegram': return <MessageCircle className="h-6 w-6 text-blue-500" />
      case 'openai': return <Bot className="h-6 w-6 text-purple-600" />
      case 'claude': return <Bot className="h-6 w-6 text-orange-600" />
      case 'stt': return <Mic className="h-6 w-6 text-slate-600" />
      case 'rag': return <Layers className="h-6 w-6 text-indigo-600" />
      case 'calendar': return <Calendar className="h-6 w-6 text-amber-500" />
      case 'push': return <Bell className="h-6 w-6 text-rose-500" />
      default: return <Settings2 className="h-6 w-6" />
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Интеграции системы</h1>
          <p className="text-slate-500 mt-1">Подключите backend-сервисы и провайдеров AI для запуска в production</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockIntegrations.map(integration => (
          <Card key={integration.id} className="relative overflow-hidden hover:border-slate-300 transition-colors">
            {integration.status === 'connected' && (
              <div className="absolute top-0 w-full h-1 bg-emerald-500"></div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    {getIcon(integration.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wider mt-0.5">{integration.type}</CardDescription>
                  </div>
                </div>
                {integration.status === 'connected' ? (
                  <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-none">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Подключено
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200">
                    Отключено
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integration.type === 'supabase' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">URL проекта</label>
                      <Input type="password" value="https://xxxxxx.supabase.co" readOnly className="bg-slate-50 font-mono text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Anon Key</label>
                      <Input type="password" value="ey..." readOnly className="bg-slate-50 font-mono text-xs" />
                    </div>
                  </>
                )}
                {integration.type === 'telegram' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Токен бота</label>
                    <Input type="password" placeholder="Введите токен бота Telegram" className="font-mono text-xs" />
                  </div>
                )}
                {integration.type === 'openai' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">API Ключ</label>
                    <Input type="password" placeholder="sk-..." className="font-mono text-xs" />
                  </div>
                )}
                {integration.type === 'rag' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Векторное хранилище</label>
                    <Input value="Supabase pgvector" readOnly className="bg-slate-50 text-sm" />
                  </div>
                )}
                {!['supabase', 'telegram', 'openai', 'rag'].includes(integration.type) && (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <p className="text-sm text-slate-500 text-center">Требуется настройка в переменных окружения</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t pt-4 pb-4">
              <Button variant={integration.status === 'connected' ? 'outline' : 'default'} className="w-full">
                {integration.status === 'connected' ? 'Настроить' : 'Подключить'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
        <h3 className="text-amber-800 font-bold flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5" /> Включен режим фиктивных данных (Mock Data)
        </h3>
        <p className="text-sm text-amber-700 max-w-3xl">
          Приложение в настоящее время работает в демонстрационном режиме с использованием фиктивных данных. Чтобы подключиться к реальной базе данных и сервисам AI, настройте учетные данные выше и обновите конечные точки API в каталоге <code>src/services</code>.
        </p>
      </div>
    </div>
  )
}
