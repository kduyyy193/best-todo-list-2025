"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Play, Pause, Settings, Volume2, VolumeX, Clock, CheckCircle2, Circle, Plus, X, Menu, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Todo {
  id: string
  name: string
  minutes: number
  seconds: number
  completed: boolean
  isRunning: boolean
  endTime?: number
  hasTimer: boolean
  pausedMinutes?: number
  pausedSeconds?: number
}

interface DailyTodos {
  [date: string]: Todo[]
}

export default function TodoApp() {
  const [userName, setUserName] = useState("")
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [showChangeNameDialog, setShowChangeNameDialog] = useState(false)
  const [tempName, setTempName] = useState("")
  const [todos, setTodos] = useState<DailyTodos>({})
  const [newTodoName, setNewTodoName] = useState("")
  const [newTodoMinutes, setNewTodoMinutes] = useState("")
  const [newTodoSeconds, setNewTodoSeconds] = useState("")
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showDeleteOldDialog, setShowDeleteOldDialog] = useState(false)
  const [showStopCurrentDialog, setShowStopCurrentDialog] = useState(false)
  const [showDeleteRunningDialog, setShowDeleteRunningDialog] = useState(false)
  const [showCountdownPopup, setShowCountdownPopup] = useState(false)
  const [countdownTodo, setCountdownTodo] = useState<Todo | null>(null)
  const [pendingAction, setPendingAction] = useState<() => void>(() => {})
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()
  
  const today = new Date().toISOString().split("T")[0]
  const todayTodos = todos[today] || []

  const playAlertSound = async () => {
    if (audioEnabled && audioRef.current) {
      try {
        audioRef.current.currentTime = 0
        audioRef.current.volume = 1.0
        await audioRef.current.play()
        console.log("Âm thanh đã phát thành công")
      } catch (error) {
        console.error("Lỗi phát âm thanh:", error)
        toast({
          title: "Không thể phát âm thanh",
          description: "Vui lòng bật âm thanh để nhận thông báo khi hết giờ",
          variant: "destructive",
        })
      }
    } else {
      console.log("Âm thanh bị tắt hoặc audioRef không tồn tại")
    }
  }

  useEffect(() => {
    audioRef.current = new Audio("/sound-effect-alert.mp3")
    audioRef.current.load()
    audioRef.current.volume = 1.0

    const savedAudioEnabled = localStorage.getItem("todoAudioEnabled")
    if (savedAudioEnabled !== null) {
      setAudioEnabled(JSON.parse(savedAudioEnabled))
    }
  }, [])

  useEffect(() => {
    const savedUserName = localStorage.getItem("todoUserName")
    if (savedUserName) {
      setUserName(savedUserName)
    } else {
      setShowNameDialog(true)
    }

    const savedTodos = localStorage.getItem("todoData")
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos)
      const updatedTodos: DailyTodos = {}
      Object.keys(parsedTodos).forEach((date) => {
        updatedTodos[date] = parsedTodos[date].map((todo: any) => ({
          ...todo,
          hasTimer: todo.hasTimer !== undefined ? todo.hasTimer : (todo.minutes > 0 || todo.seconds > 0),
          pausedMinutes: todo.pausedMinutes !== undefined ? todo.pausedMinutes : undefined,
          pausedSeconds: todo.pausedSeconds !== undefined ? todo.pausedSeconds : undefined
        }))
      })
      setTodos(updatedTodos)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("todoData", JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setCurrentTime(now)

      const updatedTodos = { ...todos }
      let hasChanges = false

      Object.keys(updatedTodos).forEach((date) => {
        updatedTodos[date] = updatedTodos[date].map((todo) => {
          if (todo.isRunning && todo.endTime && now >= todo.endTime) {
            console.log("Todo hết thời gian:", todo.name, "End time:", todo.endTime, "Now:", now)
            hasChanges = true
            if (countdownTodo && countdownTodo.id === todo.id) {
              setShowCountdownPopup(false)
              setCountdownTodo(null)
            }
            if (audioEnabled && audioRef.current) {
              console.log("Phát âm thanh khi hết giờ")
              audioRef.current.currentTime = 0
              audioRef.current.volume = 1.0
              audioRef.current.play().then(() => {
                console.log("Âm thanh đã phát thành công")
              }).catch((error) => {
                console.error("Lỗi phát âm thanh:", error)
                toast({
                  title: "Không thể phát âm thanh",
                  description: "Vui lòng bật âm thanh để nhận thông báo khi hết giờ",
                  variant: "destructive",
                })
              })
            } else {
              console.log("Âm thanh bị tắt hoặc audioRef không tồn tại")
            }
            toast({
              title: "Hết giờ!",
              description: `Todo "${todo.name}" đã hoàn thành`,
            })
            return { ...todo, isRunning: false, completed: true, endTime: undefined }
          }
          return todo
        })
      })

      if (hasChanges) {
        setTodos(updatedTodos)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [todos, audioEnabled, toast, countdownTodo])

  useEffect(() => {
    if (showCountdownPopup && countdownTodo) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now())
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [showCountdownPopup, countdownTodo])

  const handleSaveName = () => {
    if (!tempName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên",
        variant: "destructive",
      })
      return
    }
    setUserName(tempName.trim())
    localStorage.setItem("todoUserName", tempName.trim())
    setShowNameDialog(false)
    setShowChangeNameDialog(false)
    setTempName("")
  }

  const handleAddTodo = () => {
    if (!newTodoName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên công việc",
        variant: "destructive",
      })
      return
    }

    const minutes = Number.parseInt(newTodoMinutes) || 0
    const seconds = Number.parseInt(newTodoSeconds) || 0

    const newTodo: Todo = {
      id: Date.now().toString(),
      name: newTodoName.trim(),
      minutes,
      seconds,
      completed: false,
      isRunning: false,
      hasTimer: minutes > 0 || seconds > 0,
      pausedMinutes: undefined,
      pausedSeconds: undefined,
    }

    setTodos((prev) => ({
      ...prev,
      [today]: [...(prev[today] || []), newTodo],
    }))

    setNewTodoName("")
    setNewTodoMinutes("")
    setNewTodoSeconds("")
  }

  const handleStartTodo = (todoId: string) => {
    const runningTodo = todayTodos.find((t) => t.isRunning)

    if (runningTodo && runningTodo.id !== todoId) {
      setPendingAction(() => () => startTodoTimer(todoId))
      setShowStopCurrentDialog(true)
      return
    }

    startTodoTimer(todoId)
  }

  const startTodoTimer = (todoId: string) => {
    const now = Date.now()
    setTodos((prev) => {
      const updated = { ...prev }
      updated[today] = updated[today].map((todo) => {
        if (todo.id === todoId) {
          const minutes = todo.pausedMinutes !== undefined ? todo.pausedMinutes : todo.minutes
          const seconds = todo.pausedSeconds !== undefined ? todo.pausedSeconds : todo.seconds
          const totalSeconds = minutes * 60 + seconds
          
          const updatedTodo = {
            ...todo,
            isRunning: true,
            endTime: now + totalSeconds * 1000,
            pausedMinutes: undefined,
            pausedSeconds: undefined
          }
          setCurrentTime(now)
          
          if (!countdownTodo || countdownTodo.id !== todoId) {
            setCountdownTodo(updatedTodo)
            setShowCountdownPopup(true)
          } else {
            setCountdownTodo(updatedTodo)
          }
          return updatedTodo
        }
        return { ...todo, isRunning: false, endTime: undefined }
      })
      return updated
    })
  }

  const handleStopTodo = (todoId: string) => {
    setTodos((prev) => {
      const updated = { ...prev }
      updated[today] = updated[today].map((todo) => {
        if (todo.id === todoId) {
          let pausedMinutes = todo.minutes
          let pausedSeconds = todo.seconds
          
          if (todo.isRunning && todo.endTime) {
            const remaining = Math.max(0, todo.endTime - Date.now())
            pausedMinutes = Math.floor(remaining / 60000)
            pausedSeconds = Math.floor((remaining % 60000) / 1000)
          }
          
          const stoppedTodo = { 
            ...todo, 
            isRunning: false, 
            endTime: undefined,
            pausedMinutes,
            pausedSeconds
          }
          
          if (countdownTodo && countdownTodo.id === todoId) {
            setCountdownTodo(stoppedTodo)
          }
          return stoppedTodo
        }
        return todo
      })
      return updated
    })
  }

  const handleDeleteTodo = (todoId: string) => {
    const todo = todayTodos.find((t) => t.id === todoId)

    if (todo?.isRunning) {
      setTodoToDelete(todoId)
      setShowDeleteRunningDialog(true)
      return
    }

    deleteTodo(todoId)
  }

  const deleteTodo = (todoId: string) => {
    setTodos((prev) => {
      const updated = { ...prev }
      updated[today] = updated[today].filter((todo) => todo.id !== todoId)
      return updated
    })
  }

  const handleToggleComplete = (todoId: string) => {
    setTodos((prev) => {
      const updated = { ...prev }
      updated[today] = updated[today].map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed, isRunning: false, endTime: undefined } : todo,
      )
      return updated
    })
  }

  const handleDeleteOldTodos = () => {
    const hasOldTodos = Object.keys(todos).some((date) => date < today && todos[date].length > 0)

    if (!hasOldTodos) {
      toast({
        title: "Không có todo cũ",
        description: "Không có todo nào từ những ngày trước",
        variant: "destructive",
      })
      return
    }

    let totalTodos = 0
    let completedTodos = 0
    let totalDays = 0
    
    Object.keys(todos).forEach((date) => {
      if (date < today && todos[date].length > 0) {
        totalDays++
        totalTodos += todos[date].length
        completedTodos += todos[date].filter(todo => todo.completed).length
      }
    })

    toast({
      title: "Thông tin todo cũ",
      description: `${totalDays} ngày, ${totalTodos} todo (${completedTodos} hoàn thành)`,
    })

    setShowDeleteOldDialog(true)
  }

  const exportOldTodosToText = () => {
    const oldTodos: { [date: string]: Todo[] } = {}
    let hasOldTodos = false

    Object.keys(todos).forEach((date) => {
      if (date < today && todos[date].length > 0) {
        oldTodos[date] = todos[date]
        hasOldTodos = true
      }
    })

    if (!hasOldTodos) {
      toast({
        title: "Không có todo cũ",
        description: "Không có todo nào từ những ngày trước",
        variant: "destructive",
      })
      return
    }

    let content = `BÁO CÁO TODO CŨ - ${new Date().toLocaleDateString("vi-VN")}\n`
    content += `Người dùng: ${userName}\n`
    content += `Ngày xuất báo cáo: ${new Date().toLocaleString("vi-VN")}\n\n`
    content += "=".repeat(50) + "\n\n"

    Object.keys(oldTodos).sort().forEach((date) => {
      const dateObj = new Date(date)
      const formattedDate = dateObj.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      
      content += `📅 ${formattedDate}\n`
      content += "-".repeat(30) + "\n"
      
      oldTodos[date].forEach((todo, index) => {
        const status = todo.completed ? "✅ Hoàn thành" : "❌ Chưa hoàn thành"
        const timeStr = todo.hasTimer ? `${todo.minutes}:${todo.seconds.toString().padStart(2, "0")}` : "Không có"
        const typeStr = todo.hasTimer ? "⏱️ Có timer" : "📝 Task đơn giản"
        content += `${index + 1}. ${todo.name}\n`
        content += `   ${typeStr}\n`
        content += `   ⏱️ Thời gian: ${timeStr}\n`
        content += `   📊 Trạng thái: ${status}\n\n`
      })
      content += "\n"
    })

    let totalTodos = 0
    let completedTodos = 0
    Object.values(oldTodos).forEach((dayTodos) => {
      totalTodos += dayTodos.length
      completedTodos += dayTodos.filter(todo => todo.completed).length
    })

    content += "📊 THỐNG KÊ TỔNG QUAN\n"
    content += "=".repeat(30) + "\n"
    content += `Tổng số todo: ${totalTodos}\n`
    content += `Đã hoàn thành: ${completedTodos}\n`
    content += `Chưa hoàn thành: ${totalTodos - completedTodos}\n`
    content += `Tỷ lệ hoàn thành: ${totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0}%\n`

    const BOM = "\uFEFF"
    const blob = new Blob([BOM + content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `todo-cu-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Xuất báo cáo thành công",
      description: `Đã xuất ${Object.keys(oldTodos).length} ngày với ${totalTodos} todo`,
    })
  }

  const deleteOldTodos = () => {
    exportOldTodosToText()
    
    setTodos((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((date) => {
        if (date < today) {
          delete updated[date]
        }
      })
      return updated
    })
    setShowDeleteOldDialog(false)
  }

  const formatTimeRemaining = (endTime: number) => {
    const remaining = Math.max(0, endTime - currentTime)
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const formatTimeRemainingLarge = (endTime: number) => {
    const remaining = Math.max(0, endTime - currentTime)
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return { minutes, seconds }
  }

  const getTimeRemaining = (endTime: number) => {
    const now = Date.now()
    return Math.max(0, endTime - now)
  }

  const hasOldTodos = Object.keys(todos).some((date) => date < today && todos[date].length > 0)

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">The best Todo App 2025</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Xin chào, {userName}!</p>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const newAudioEnabled = !audioEnabled
              setAudioEnabled(newAudioEnabled)
              localStorage.setItem("todoAudioEnabled", JSON.stringify(newAudioEnabled))
            }}>
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                if (audioRef.current) {
                  console.log("Test âm thanh")
                  playAlertSound()
                    console.log("Test âm thanh thành công")
                    toast({
                      title: "Test âm thanh",
                      description: "Âm thanh hoạt động bình thường",
                    })
                    toast({
                      title: "Test âm thanh thất bại",
                    })
                  }
              }}
            >
              Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTempName(userName)
                setShowChangeNameDialog(true)
              }}
            >
              <Settings className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Đổi tên</span>
            </Button>
            <Button variant="outline" size="sm" onClick={exportOldTodosToText} disabled={!hasOldTodos}>
              <FileText className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Xuất báo cáo</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteOldTodos} disabled={!hasOldTodos}>
              <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Xóa todo cũ</span>
            </Button>
          </div>
        </div>

        {/* Add Todo Form - Responsive */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Thêm công việc mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
              <div className="flex-1">
                <label className="text-sm font-medium">Tên công việc</label>
                <Input
                  value={newTodoName}
                  onChange={(e) => setNewTodoName(e.target.value)}
                  placeholder="Nhập tên công việc..."
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 sm:gap-4">
                <div className="w-20 sm:w-24">
                  <label className="text-sm font-medium">Phút</label>
                  <Input
                    type="number"
                    min="0"
                    value={newTodoMinutes}
                    onChange={(e) => setNewTodoMinutes(e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div className="w-20 sm:w-24">
                  <label className="text-sm font-medium">Giây</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={newTodoSeconds}
                    onChange={(e) => setNewTodoSeconds(e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>
              <Button onClick={handleAddTodo} className="mt-2 sm:mt-0">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="sm:inline">Thêm</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Todo List - Responsive */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Công việc hôm nay ({new Date().toLocaleDateString("vi-VN")})</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTodos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Chưa có công việc nào cho hôm nay</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {todayTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border ${
                      todo.completed ? "bg-muted/50" : "bg-card"
                    }`}
                  >
                    {/* Todo Info */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleComplete(todo.id)} className="mt-0.5">
                        {todo.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-sm sm:text-base break-words ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                          {todo.name}
                        </h3>
                        {todo.hasTimer ? (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            ⏱️ {(() => {
                              const minutes = todo.pausedMinutes !== undefined ? todo.pausedMinutes : todo.minutes
                              const seconds = todo.pausedSeconds !== undefined ? todo.pausedSeconds : todo.seconds
                              return `${minutes}:${seconds.toString().padStart(2, "0")}`
                            })()}
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            📝 Task đơn giản
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Timer Badge */}
                    {todo.isRunning && todo.endTime && (
                      <Badge variant="secondary" className="flex items-center gap-1 self-start sm:self-center">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs sm:text-sm">{formatTimeRemaining(todo.endTime)}</span>
                      </Badge>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {!todo.completed && todo.hasTimer && (
                        <Button
                          variant={todo.isRunning ? "destructive" : "default"}
                          size="sm"
                          onClick={() => (todo.isRunning ? handleStopTodo(todo.id) : handleStartTodo(todo.id))}
                        >
                          {todo.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      )}

                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTodo(todo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs - Responsive */}
        <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Chào mừng bạn đến với Todo List!</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium">Tên của bạn</label>
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                onKeyPress={(e) => e.key === "Enter" && handleSaveName()}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSaveName} className="w-full sm:w-auto">Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showChangeNameDialog} onOpenChange={setShowChangeNameDialog}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Đổi tên</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium">Tên mới</label>
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Nhập tên mới..."
                onKeyPress={(e) => e.key === "Enter" && handleSaveName()}
                className="mt-2"
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowChangeNameDialog(false)} className="w-full sm:w-auto">
                Hủy
              </Button>
              <Button onClick={handleSaveName} className="w-full sm:w-auto">Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteOldDialog} onOpenChange={setShowDeleteOldDialog}>
          <AlertDialogContent className="mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg sm:text-xl">Xác nhận xóa todo cũ</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">
                Bạn có chắc muốn xóa todo cũ không? 
                <br />
                <br />
                <strong>Lưu ý:</strong> Hệ thống sẽ tự động xuất báo cáo chi tiết ra file text trước khi xóa.
                <br />
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={deleteOldTodos} className="w-full sm:w-auto">Xóa và xuất báo cáo</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showStopCurrentDialog} onOpenChange={setShowStopCurrentDialog}>
          <AlertDialogContent className="mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg sm:text-xl">Dừng todo hiện tại?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">Dừng todo hiện tại để bắt đầu todo mới?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  pendingAction()
                  setShowStopCurrentDialog(false)
                }}
                className="w-full sm:w-auto"
              >
                Đồng ý
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDeleteRunningDialog} onOpenChange={setShowDeleteRunningDialog}>
          <AlertDialogContent className="mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg sm:text-xl">Xóa todo đang chạy?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">Todo này đang chạy countdown. Bạn có chắc muốn xóa không?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel onClick={() => setTodoToDelete(null)} className="w-full sm:w-auto">Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (todoToDelete) {
                    deleteTodo(todoToDelete)
                    setTodoToDelete(null)
                  }
                  setShowDeleteRunningDialog(false)
                }}
                className="w-full sm:w-auto"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Countdown Popup - Responsive */}
        <Dialog  open={showCountdownPopup} onOpenChange={(open) => {
          if (!open) {
            if (countdownTodo) {
              setTodos((prev) => {
                const updated = { ...prev }
                updated[today] = updated[today].map((todo) => {
                  if (todo.id === countdownTodo.id) {
                    return {
                      ...todo,
                      isRunning: false,
                      endTime: undefined,
                      pausedMinutes: undefined,
                      pausedSeconds: undefined
                    }
                  }
                  return todo
                })
                return updated
              })
              setCountdownTodo(null)
            }
          }
          setShowCountdownPopup(open)
        }}>
          <DialogContent className="sm:max-w-md mx-4">
            {countdownTodo && (
              <div className="py-6 sm:py-8 text-center">
                <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-foreground break-words">{countdownTodo.name}</h3>

                <div className="mb-6 sm:mb-8">
                  <div className="text-4xl sm:text-6xl font-mono font-bold text-primary mb-2">
                    {(() => {
                      if (countdownTodo.isRunning && countdownTodo.endTime) {
                        const remaining = getTimeRemaining(countdownTodo.endTime)
                        const minutes = Math.floor(remaining / 60000)
                        const seconds = Math.floor((remaining % 60000) / 1000)
                        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                      } else {
                        const minutes = countdownTodo.pausedMinutes !== undefined ? countdownTodo.pausedMinutes : countdownTodo.minutes
                        const seconds = countdownTodo.pausedSeconds !== undefined ? countdownTodo.pausedSeconds : countdownTodo.seconds
                        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                      }
                    })()}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {countdownTodo.isRunning ? "phút:giây" : "thời gian ban đầu"}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <Button
                    variant={countdownTodo.isRunning ? "destructive" : "default"}
                    onClick={() => {
                      if (countdownTodo.isRunning) {
                        handleStopTodo(countdownTodo.id)
                      } else {
                        handleStartTodo(countdownTodo.id)
                      }
                    }}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    {countdownTodo.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {countdownTodo.isRunning ? "Dừng" : "Tiếp tục"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      handleToggleComplete(countdownTodo.id)
                      setShowCountdownPopup(false)
                      setCountdownTodo(null)
                    }}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Hoàn thành
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
