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
import { Trash2, Play, Pause, Settings, Volume2, VolumeX, Clock, CheckCircle2, Circle, Plus, X } from "lucide-react"
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vietnamese Todo App</h1>
            <p className="text-muted-foreground">Xin chào, {userName}!</p>
          </div>
          <div className="flex items-center gap-2">
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
              <Settings className="h-4 w-4 mr-2" />
              Đổi tên
            </Button>
            <Button variant="outline" size="sm" onClick={exportOldTodosToText} disabled={!hasOldTodos}>
              📄 Xuất báo cáo
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteOldTodos} disabled={!hasOldTodos}>
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa todo cũ
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Thêm công việc mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium">Tên công việc</label>
                <Input
                  value={newTodoName}
                  onChange={(e) => setNewTodoName(e.target.value)}
                  placeholder="Nhập tên công việc..."
                />
              </div>
              <div className="w-20">
                <label className="text-sm font-medium">Phút</label>
                <Input
                  type="number"
                  min="0"
                  value={newTodoMinutes}
                  onChange={(e) => setNewTodoMinutes(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="w-20">
                <label className="text-sm font-medium">Giây</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={newTodoSeconds}
                  onChange={(e) => setNewTodoSeconds(e.target.value)}
                  placeholder="0"
                />
              </div>
              <Button onClick={handleAddTodo}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Công việc hôm nay ({new Date().toLocaleDateString("vi-VN")})</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTodos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Chưa có công việc nào cho hôm nay</p>
            ) : (
              <div className="space-y-4">
                {todayTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      todo.completed ? "bg-muted/50" : "bg-card"
                    }`}
                  >
                    <Button variant="ghost" size="sm" onClick={() => handleToggleComplete(todo.id)}>
                      {todo.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </Button>

                    <div className="flex-1">
                      <h3 className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                        {todo.name}
                      </h3>
                      {todo.hasTimer ? (
                        <p className="text-sm text-muted-foreground">
                          ⏱️ {(() => {
                            const minutes = todo.pausedMinutes !== undefined ? todo.pausedMinutes : todo.minutes
                            const seconds = todo.pausedSeconds !== undefined ? todo.pausedSeconds : todo.seconds
                            return `${minutes}:${seconds.toString().padStart(2, "0")}`
                          })()}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          📝 Task đơn giản
                        </p>
                      )}
                    </div>

                    {todo.isRunning && todo.endTime && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeRemaining(todo.endTime)}
                      </Badge>
                    )}

                    <div className="flex items-center gap-2">
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

        <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chào mừng bạn đến với Todo List!</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium">Tên của bạn</label>
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                onKeyPress={(e) => e.key === "Enter" && handleSaveName()}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSaveName}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showChangeNameDialog} onOpenChange={setShowChangeNameDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đổi tên</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium">Tên mới</label>
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Nhập tên mới..."
                onKeyPress={(e) => e.key === "Enter" && handleSaveName()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowChangeNameDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveName}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteOldDialog} onOpenChange={setShowDeleteOldDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa todo cũ</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa todo cũ không? 
                <br />
                <br />
                <strong>Lưu ý:</strong> Hệ thống sẽ tự động xuất báo cáo chi tiết ra file text trước khi xóa.
                <br />
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={deleteOldTodos}>Xóa và xuất báo cáo</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showStopCurrentDialog} onOpenChange={setShowStopCurrentDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Dừng todo hiện tại?</AlertDialogTitle>
              <AlertDialogDescription>Dừng todo hiện tại để bắt đầu todo mới?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  pendingAction()
                  setShowStopCurrentDialog(false)
                }}
              >
                Đồng ý
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDeleteRunningDialog} onOpenChange={setShowDeleteRunningDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa todo đang chạy?</AlertDialogTitle>
              <AlertDialogDescription>Todo này đang chạy countdown. Bạn có chắc muốn xóa không?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTodoToDelete(null)}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (todoToDelete) {
                    deleteTodo(todoToDelete)
                    setTodoToDelete(null)
                  }
                  setShowDeleteRunningDialog(false)
                }}
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
          <DialogContent  className="sm:max-w-md">

            {countdownTodo && (
              <div className="py-8 text-center">
                <h3 className="text-lg font-semibold mb-6 text-foreground">{countdownTodo.name}</h3>

                <div className="mb-8">
                  <div className="text-6xl font-mono font-bold text-primary mb-2">
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
                  <p className="text-sm text-muted-foreground">
                    {countdownTodo.isRunning ? "phút:giây" : "thời gian ban đầu"}
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant={countdownTodo.isRunning ? "destructive" : "default"}
                    onClick={() => {
                      if (countdownTodo.isRunning) {
                        handleStopTodo(countdownTodo.id)
                      } else {
                        handleStartTodo(countdownTodo.id)
                      }
                    }}
                    className="flex items-center gap-2"
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
                    className="flex items-center gap-2"
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
