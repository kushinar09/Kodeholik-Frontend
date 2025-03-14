"use client"

import { Separator } from "@/components/ui/separator"
import DiscussionSection from "./problem-comments"
import SkillSection from "./problem-skill";
import TopicSection from "./problem-topic";
import { Badge } from "@/components/ui/badge";
import { Check, CheckIcon, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/AuthProvider";
import { tagFavourite, untagFavourite } from "@/lib/api/user_api";
import RenderMarkdown from "@/components/common/markdown/RenderMarkdown"

/**
 * Component to display problem description
 * @param {Object} props - Component props
 * @param {Object} props.description - Problem description data
 */
export default function ProblemDescription({ description, setDescription, id, problemId }) {
  const { apiCall } = useAuth();
  if (!description) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading problem description...</div>
      </div>
    )
  }

  const handleTagOrUnTag = async () => {
    if (description.favourite) {
      untagFavouriteProblem();
    }
    else {
      tagFavouriteProblem();
    }
  }

  const tagFavouriteProblem = async () => {
    try {
      await tagFavourite(apiCall, description.link);
      const newDescription = { ...description, "favourite": true }
      setDescription(newDescription)
    } catch (error) {
      console.log(error);
    }
  }

  const untagFavouriteProblem = async () => {
    try {
      await untagFavourite(apiCall, description.link);
      const newDescription = { ...description, "favourite": false }
      setDescription(newDescription)
    } catch (error) {
      console.log(error);
    }
  }

  return (
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
                    {description.favourite ? <Star className="h-6 w-6 text-yellow-500" fill="currentColor" /> : <Star className="h-6 w-6 text-yellow-500" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-100 p-4 text-sm bg-white text-black" side="bottom">
                  <p>{description.favourite ? "This problem is in your favourite list. Click to untag it" : "This problem is not in your favourite list. Click to tag it into your favourite list"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {description.solved && <div className="text-green-500 flex items-center">
          <svg class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />  <polyline points="22 4 12 14.01 9 11.01" /></svg>
          Solved
        </div >}
      </div>
      <div className="flex items-center mb-4">
        <div>
          {description.difficulty == "EASY" && <Badge variant="outline" className="bg-gray-200 rounded-xl py-1.5 text-green-500 font-bold mr-2 text-base">Easy</Badge>}
          {description.difficulty == "MEDIUM" && <Badge variant="outline" className="bg-gray-300 py-1.5 text-yellow-500 font-bold mr-2 text-base">Medium</Badge>}
          {description.difficulty == "HARD" && <Badge variant="outline" className="bg-gray-300 py-1.5 text-red-500 font-bold mr-2 text-base">Hard</Badge>}
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

      <Separator className="my-4" />
      <SkillSection skills={description.skillList}></SkillSection>
      <Separator className="my-2" />
      <TopicSection topics={description.topicList}></TopicSection>
      <Separator className="my-2" />
      <DiscussionSection id={id} problemId={problemId} />
    </>
  )
}

