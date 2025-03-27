"use client"

import { Separator } from "@/components/ui/separator"
import DiscussionSection from "./problem-comments"
import SkillSection from "./problem-skill"
import TopicSection from "./problem-topic"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/providers/AuthProvider"
import { tagFavourite, untagFavourite } from "@/lib/api/user_api"
import RenderMarkdown from "@/components/common/markdown/RenderMarkdown"

export default function ProblemDescription({ description, setDescription, id, problemId, isLoadingDescription }) {
  const { apiCall } = useAuth()
  if (!description) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading problem description...</div>
      </div>
    )
  }

  const handleTagOrUnTag = async () => {
    if (description.favourite) {
      untagFavouriteProblem()
    } else {
      tagFavouriteProblem()
    }
  }

  const tagFavouriteProblem = async () => {
    try {
      await tagFavourite(apiCall, description.link)
      const newDescription = { ...description, favourite: true }
      setDescription(newDescription)
    } catch (error) {
      console.log(error)
    }
  }

  const untagFavouriteProblem = async () => {
    try {
      await untagFavourite(apiCall, description.link)
      const newDescription = { ...description, favourite: false }
      setDescription(newDescription)
    } catch (error) {
      console.log(error)
    }
  }

  return isLoadingDescription ? (
    <div className="space-y-4">
      {/* Title and favorite skeleton */}
      <div className="flex justify-between">
        <div className="flex items-center">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mr-2"></div>
          <div className="h-6 w-6 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
        <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
      </div>

      {/* Difficulty badge skeleton */}
      <div className="flex items-center mb-4">
        <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-full"></div>
      </div>

      {/* Problem description skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
      </div>

      {/* Stats skeleton */}
      <div className="my-4 flex">
        <div className="mr-4">
          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div>
          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Skills section skeleton */}
      <div className="space-y-2">
        <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
          ))}
        </div>
      </div>

      <Separator className="my-2" />

      {/* Topics section skeleton */}
      <div className="space-y-2">
        <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
        <div className="flex flex-wrap gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
          ))}
        </div>
      </div>

      <Separator className="my-2" />

      {/* Discussion section skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between">
                <div className="h-5 w-40 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="h-16 w-full bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <>
      <div className="flex justify-between">
        <div className="flex items-center mb-2">
          <h2 className="text-xl font-bold mr-2 mb-2">
            {description.id}. {description.title}
          </h2>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleTagOrUnTag()}>
                    {description.favourite ? (
                      <Star className="h-6 w-6 text-amber-500" fill="currentColor" />
                    ) : (
                      <>
                        <Star className="h-6 w-6 text-amber-400 hover:fill-amber-400" />
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-100 p-4 text-sm bg-white text-black" side="bottom">
                  <p>
                    {description.favourite
                      ? "This problem is in your favourite list. Click to untag it"
                      : "This problem is not in your favourite list. Click to tag it into your favourite list"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {description.solved && (
          <div className="text-green-500 flex items-center">
            <svg
              className="h-5 w-5 text-green-500 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {" "}
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /> <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Solved
          </div>
        )}
      </div>
      <div className="flex items-center mb-4 text-sm">
        <div>
          {description.difficulty == "EASY" && (
            <Badge
              variant="outline"
              className="bg-gray-200 rounded-full py-1 px-3 text-green-500 font-semibold mr-2 text-base"
            >
              Easy
            </Badge>
          )}
          {description.difficulty == "MEDIUM" && (
            <Badge
              variant="outline"
              className="bg-gray-300 rounded-full py-1 px-3 text-yellow-500 font-semibold mr-2 text-base"
            >
              Medium
            </Badge>
          )}
          {description.difficulty == "HARD" && (
            <Badge
              variant="outline"
              className="bg-gray-300 rounded-full py-1 px-3 text-red-500 font-semibold mr-2 text-base"
            >
              Hard
            </Badge>
          )}
        </div>
      </div>
      <div>
        <RenderMarkdown content={description.description} />
      </div>
      <div className="my-4 flex">
        <div className="mr-4">
          Acceptance Rate: <span className="font-bold">{description.acceptanceRate + "%"}</span>
        </div>
        <div>
          No Submission: <span className="font-bold">{description.noSubmission}</span>
        </div>
      </div>

      <Separator className="my-2" />
      <SkillSection skills={description.skillList}></SkillSection>
      <Separator className="my-2" />
      <TopicSection topics={description.topicList}></TopicSection>
      <Separator className="my-2" />
      <DiscussionSection id={id} locationId={problemId} type={"PROBLEM"} activeTab={"DETAIL"} />
    </>
  )
}

