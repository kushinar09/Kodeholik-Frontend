"use client"

import { Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { useSocket } from "@/providers/SocketNotificationProvider"
import { useAuth } from "@/providers/AuthProvider"

export default function Notification() {
  const { isAuthenticated } = useAuth()
  const { notifications, markAsRead, markAllAsRead } = useSocket()

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length
  }, [notifications])

  if (!isAuthenticated) return <></>

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative text-primary size-10">
          <Bell className="!size-5" />
          {/* {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount}
            </span>
          )} */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-medium">Notifications</h3>
          {/* {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )} */}
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={markAllAsRead}>
            Show all
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-4 px-4 py-3 border-b last:border-0"
                  )}
                  // onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{notification.type}</p>
                      <p className="text-xs text-muted-foreground">{notification.date}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.content}</p>
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="text-xs text-primary hover:underline"
                      >
                        View details
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <p className="text-muted-foreground mb-2">No notifications</p>
              <p className="text-xs text-muted-foreground">When you receive notifications, they&apos;ll appear here</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

