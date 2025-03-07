import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, ArrowBigUp } from "lucide-react"
import { Button } from "@/components/ui/button"

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
              <span className="text-muted-foreground text-sm">· {formattedDate}</span>
            </div>
            <div className="cursor-pointer" onClick={() => handleClickSolution(infor.id)}>
              <p className="text-lg font-semibold mb-3">{infor.title}</p>
              {/* <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">Java</Badge>
                <Badge variant="secondary">Easy</Badge>
                <Badge variant="secondary">Solution</Badge>
              </div> */}
              <div className="flex items-center gap-6 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-3 w-3">
                    <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 429.658 429.658">
                      <g>
                        <g>
                          <path d="M235.252,13.406l-0.447-0.998c-3.417-7.622-11.603-12.854-19.677-12.375l-0.3,0.016l-0.302-0.016    C214.194,0.011,213.856,0,213.524,0c-7.706,0-15.386,5.104-18.674,12.413l-0.452,0.998L13.662,176.079    c-6.871,6.183-6.495,12.657-4.971,16.999c2.661,7.559,10.361,13.373,18.313,13.82l1.592,0.297c0.68,0.168,1.356,0.348,2.095,0.427    c23.036,2.381,45.519,2.876,64.472,3.042l5.154,0.048V407.93c0,11.023,7.221,15.152,11.522,16.635l0.967,0.33l0.77,0.671    c3.105,2.717,7.02,4.093,11.644,4.093h179.215c4.626,0,8.541-1.376,11.639-4.093l0.771-0.671l0.965-0.33    c4.307-1.482,11.532-5.611,11.532-16.635V210.706l5.149-0.048c18.961-0.17,41.446-0.666,64.475-3.042    c0.731-0.079,1.407-0.254,2.082-0.422l1.604-0.302c7.952-0.447,15.65-6.262,18.312-13.82c1.528-4.336,1.899-10.811-4.972-16.998    L235.252,13.406z M344.114,173.365c-11.105,0.18-22.216,0.254-33.337,0.254c-5.153,0-9.363,1.607-12.507,4.768    c-3.372,3.4-5.296,8.48-5.266,13.932l0.005,0.65l-0.157,0.629c-0.437,1.767-0.64,3.336-0.64,4.928v194.001H137.458V198.526    c0-1.597-0.201-3.161-0.638-4.928l-0.157-0.629l0.005-0.65c0.031-5.456-1.892-10.537-5.271-13.937    c-3.141-3.161-7.353-4.763-12.507-4.768c-11.124,0-22.224-0.074-33.337-0.254l-13.223-0.218L214.834,44.897l142.503,128.249    L344.114,173.365z" />
                        </g>
                      </g>
                    </svg>
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

