import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, ArrowBigUp } from "lucide-react"

export default function SolutionCard({ infor, handleClickSolution }) {
  const initials = infor.createdBy.username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  // Format the date
  const formattedDate = new Date(infor.createdAt).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })

  return (
    <Card className="w-full cursor-pointer" onClick={() => handleClickSolution(infor.id)}>
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
              <span className="font-medium">{infor.createdBy.username}</span>
              <span className="text-muted-foreground text-sm">· {formattedDate}</span>
            </div>
            <p className="text-lg font-semibold mb-3">{infor.title}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">Java</Badge>
              <Badge variant="secondary">Easy</Badge>
              <Badge variant="secondary">Solution</Badge>
            </div>
            <div className="flex items-center gap-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <ArrowBigUp className="w-4 h-4" />
                <span>{infor.noUpvote}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{infor.noComment}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

