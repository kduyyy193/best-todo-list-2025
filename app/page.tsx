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

  useEffect(() => {
    audioRef.current = new Audio("/sound-effect-alert.mp3")
    audioRef.current.load()

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
      setTodos(JSON.parse(savedTodos))
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
            hasChanges = true
            if (countdownTodo && countdownTodo.id === todo.id) {
              setShowCountdownPopup(false)
              setCountdownTodo(null)
            }
            if (audioEnabled && audioRef.current) {
              audioRef.current.currentTime = 0
              audioRef.current.play().catch(() => {
                toast({
                  title: "Không thể phát âm thanh",
                  description: "Vui lòng bật âm thanh để nhận thông báo khi hết giờ",
                  variant: "destructive",
                })
              })
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
    if (showCountdownPopup && countdownTodo && countdownTodo.endTime) {
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

    if (minutes === 0 && seconds === 0) {
      toast({
        title: "Lỗi",
        description: "Thời gian thực hiện phải lớn hơn 0",
        variant: "destructive",
      })
      return
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      name: newTodoName.trim(),
      minutes,
      seconds,
      completed: false,
      isRunning: false,
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
          const totalSeconds = todo.minutes * 60 + todo.seconds
          const updatedTodo = {
            ...todo,
            isRunning: true,
            endTime: now + totalSeconds * 1000,
          }
          setCurrentTime(now)
          setCountdownTodo(updatedTodo)
          setShowCountdownPopup(true)
          return updatedTodo
        }
        return { ...todo, isRunning: false, endTime: undefined }
      })
      return updated
    })
  }

  const handleStopTodo = (todoId: string) => {
    if (countdownTodo && countdownTodo.id === todoId) {
      setShowCountdownPopup(false)
      setCountdownTodo(null)
    }
    setTodos((prev) => {
      const updated = { ...prev }
      updated[today] = updated[today].map((todo) =>
        todo.id === todoId ? { ...todo, isRunning: false, endTime: undefined } : todo,
      )
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
        const timeStr = `${todo.minutes}:${todo.seconds.toString().padStart(2, "0")}`
        content += `${index + 1}. ${todo.name}\n`
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
            <Button variant="outline" size="sm" onClick={() => setAudioEnabled(!audioEnabled)}>
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
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
                      <p className="text-sm text-muted-foreground">
                        {todo.minutes}:{todo.seconds.toString().padStart(2, "0")}
                      </p>
                    </div>

                    {todo.isRunning && todo.endTime && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeRemaining(todo.endTime)}
                      </Badge>
                    )}

                    <div className="flex items-center gap-2">
                      {!todo.completed && (
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

        <Dialog open={showCountdownPopup} onOpenChange={setShowCountdownPopup}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold">Đang thực hiện</DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCountdownPopup(false)
                    setCountdownTodo(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {countdownTodo && countdownTodo.endTime && (
              <div className="py-8 text-center">
                <h3 className="text-lg font-semibold mb-6 text-foreground">{countdownTodo.name}</h3>

                <div className="mb-8">
                  <div className="text-6xl font-mono font-bold text-primary mb-2">
                    {(() => {
                      const remaining = getTimeRemaining(countdownTodo.endTime!)
                      const minutes = Math.floor(remaining / 60000)
                      const seconds = Math.floor((remaining % 60000) / 1000)
                      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                    })()}
                  </div>
                  <p className="text-sm text-muted-foreground">phút:giây</p>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleStopTodo(countdownTodo.id)
                      setShowCountdownPopup(false)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Dừng
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
