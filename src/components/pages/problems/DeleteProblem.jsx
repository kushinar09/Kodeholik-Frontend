import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { deleteProblem } from "@/lib/api"

function DeleteProblem({ id, onDelete }) {
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    await deleteProblem(id)
    setOpen(false)
    onDelete()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this problem?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the problem.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteProblem

