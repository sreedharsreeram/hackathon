'use client'

import { deleteProject } from '@/server/actions'
import { Trash, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Props = {
  id: number
  name?: string
  onDelete?: () => void
  size?: 'sm' | 'default'
}

const TrashButton = ({ id, name = 'project', onDelete, size = 'default' }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteProject(id)
      
      if (res) {
        // Show themed success toast
        toast.success("Project deleted", {
          description: `"${res.name}" has been permanently deleted`,
          className: "bg-background border-border",
          descriptionClassName: "text-muted-foreground",
        })
        
        // Callback to update UI immediately
        if (onDelete) {
          onDelete()
        }
        
        // Force a router refresh to update all data
        router.refresh()
        
        // Navigate to dashboard if we're on a project page
        if (window.location.pathname.includes(`/${id}`)) {
          router.push('/search')
        }
      } else {
        // Show themed error toast
        toast.error("Failed to delete", {
          description: "There was an error deleting this project",
          className: "bg-background border-destructive/50",
          descriptionClassName: "text-muted-foreground",
        })
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("An error occurred", {
        description: "There was a problem with your request",
        className: "bg-background border-destructive/50",
        descriptionClassName: "text-muted-foreground",
      })
    } finally {
      setIsDeleting(false)
      setIsConfirming(false)
    }
  }

  // Reset confirmation state when mouse leaves
  const handleMouseLeave = () => {
    if (!isDeleting) {
      setIsConfirming(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <div onMouseLeave={handleMouseLeave} className="inline-flex">
          {!isConfirming ? (
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={size === 'sm' ? 'icon' : 'sm'}
                onClick={() => setIsConfirming(true)}
                disabled={isDeleting}
                className={`${size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'} text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors`}
                aria-label="Delete project"
              >
                <Trash size={size === 'sm' ? 14 : 16} />
              </Button>
            </TooltipTrigger>
          ) : (
            <Button
              variant="destructive"
              size={size === 'sm' ? 'icon' : 'sm'}
              onClick={handleDelete}
              disabled={isDeleting}
              className={`${size === 'sm' ? 'h-7 w-7' : 'h-8'} animate-pulse`}
            >
              {isDeleting ? (
                <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
              ) : (
                "Delete?"
              )}
            </Button>
          )}
        </div>
        <TooltipContent side="bottom">
          {isConfirming ? "Click to confirm deletion" : "Delete project"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default TrashButton