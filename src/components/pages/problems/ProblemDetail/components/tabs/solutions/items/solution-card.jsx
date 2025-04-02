import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle} from "lucide-react"
import { Button } from "@/components/ui/button"
import { unupvoteSolution, upvoteSolution } from "@/lib/api/problem_api"
import { useAuth } from "@/providers/AuthProvider"
import { toast } from "sonner"

export default function SolutionCard({ infor, solutions, setSolutions, handleClickSolution }) {
  const { apiCall } = useAuth()
  const initials = infor.createdBy.username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  const toggleUpvote = async (id) => {
    try {
      if (!infor.currentUserVoted) {
        const response = await upvoteSolution(apiCall, infor.id)
        if (response.status) {
          toast.success("Upvote Solution", {
            description: "Upvote solution successful"
          })
          setSolutions((prevSolution) => ({
            ...prevSolution,
            content: prevSolution.content.map((item) =>
              item.id === infor.id ? { ...item, noUpvote: item.noUpvote + 1, currentUserVoted: true } : item
            )
          }))

        }
      }
      else {
        const response = await unupvoteSolution(apiCall, infor.id)
        if (response.status) {
          toast.success("Unupvote Solution", {
            description: "Unupvote solution successful"
          })
          setSolutions((prevSolution) => ({
            ...prevSolution,
            content: prevSolution.content.map((item) =>
              item.id === infor.id ? { ...item, noUpvote: item.noUpvote - 1 > 0 ? item.noUpvote - 1 : 0, currentUserVoted: false } : item
            )
          }))

        }
      }

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            {infor.createdBy.avatar ? (
              <AvatarImage src={infor.createdBy.avatar} alt={`${infor.createdBy.username}'s avatar`} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <a href={`/profile/${infor.createdBy.username}`} target="_blank" className="font-medium">{infor.createdBy.username}</a>
              <span className="text-muted-foreground text-sm">· {infor.createdAt}</span>
            </div>
            <div className="cursor-pointer">
              <p className="text-lg font-semibold mb-3" onClick={() => handleClickSolution(infor.id)}>{infor.title}</p>
              <div className="flex items-center gap-6 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Button onClick={() => toggleUpvote(infor.id)} variant="ghost" size="icon" className="h-3 w-3">
                    {infor.currentUserVoted ? <svg className="h-4 w-4 text-yellow-500" fill="currentColor" aria-hidden="true" focusable="false" data-prefix="far" data-icon="up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M192 82.4L334.7 232.3c.8 .8 1.3 2 1.3 3.2c0 2.5-2 4.6-4.6 4.6H248c-13.3 0-24 10.7-24 24V432H160V264c0-13.3-10.7-24-24-24H52.6c-2.5 0-4.6-2-4.6-4.6c0-1.2 .5-2.3 1.3-3.2L192 82.4zm192 153c0-13.5-5.2-26.5-14.5-36.3L222.9 45.2C214.8 36.8 203.7 32 192 32s-22.8 4.8-30.9 13.2L14.5 199.2C5.2 208.9 0 221.9 0 235.4c0 29 23.5 52.6 52.6 52.6H112V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V288h59.4c29 0 52.6-23.5 52.6-52.6z"></path></svg>
                      : <svg className="h-4 w-4 text-black" aria-hidden="true" focusable="false" data-prefix="far" data-icon="up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M192 82.4L334.7 232.3c.8 .8 1.3 2 1.3 3.2c0 2.5-2 4.6-4.6 4.6H248c-13.3 0-24 10.7-24 24V432H160V264c0-13.3-10.7-24-24-24H52.6c-2.5 0-4.6-2-4.6-4.6c0-1.2 .5-2.3 1.3-3.2L192 82.4zm192 153c0-13.5-5.2-26.5-14.5-36.3L222.9 45.2C214.8 36.8 203.7 32 192 32s-22.8 4.8-30.9 13.2L14.5 199.2C5.2 208.9 0 221.9 0 235.4c0 29 23.5 52.6 52.6 52.6H112V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V288h59.4c29 0 52.6-23.5 52.6-52.6z"></path></svg>}
                  </Button>
                  <span>{infor.noUpvote}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{infor.noComment}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

