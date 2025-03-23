"use client"

import { useAuth } from "@/providers/AuthProvider"

import hljs from "highlight.js"
import "highlight.js/styles/default.css"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ENDPOINTS } from "@/lib/constants"
import RenderMarkdown from "@/components/common/markdown/RenderMarkdown"
import DiscussionSection from "../../description/problem-comments"
import { Button } from "@/components/ui/button"
import { unupvoteSolution, upvoteSolution } from "@/lib/api/problem_api"
import { toast } from "@/hooks/use-toast"
import ShareSolution from "@/components/pages/problems/ShareSolution"

export default function SolutionDetail({ solutionId, handleBack, setIsEditMode, setCurrentSolution }) {
  const [solution, setSolution] = useState(null)
  const { apiCall } = useAuth()

  const editSolution = () => {
    setIsEditMode(true);
  }

  useEffect(() => {
    const fakedata = {
      "id": 100,
      "problem": {
        "id": 96,
        "title": "Multiply Strings",
        "description": "Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2, also represented as a string. Note: You must not use any built-in BigInteger library or convert the inputs to integer directly.",
        "difficulty": "MEDIUM",
        "acceptanceRate": 100.0,
        "noSubmission": 4,
        "status": "PUBLIC"
      },
      "title": "Easy Java solution",
      "textSolution": "Complexity\nTime complexity:\nThe time complexity of the provided code is O(n * m), where n is the length of the num1 string and m is the length of the num2 string. This complexity arises from the nested loops iterating over each digit of both input strings to calculate the products.\n\nSpace complexity:\nThe space complexity is O(n + m), primarily due to the products array, which holds the intermediate results of the multiplication. The length of this array is equal to the sum of the lengths of the two input strings. Additionally, the StringBuilder sb also contributes to the space complexity, but its size is proportional to the number of digits in the final result, which can be at most n + m. Therefore, the dominant factor is the size of the products array.",
      "skills": [
        "Math",
        "Brute Force",
        "Array"
      ],
      "solutionCodes": [
        {
          "solutionLanguage": "Java",
          "solutionCode": "public static String multiply(String num1, String num2) {\n" +
            "\tint[] num = new int[num1.length() + num2.length()];\n" +
            "\tint len1 = num1.length(), len2 = num2.length();\n" +
            "\tfor (int i = len1 - 1; i >= 0; i--) {\n" +
            "\t\tfor (int j = len2 - 1; j >= 0; j--) {\n" +
            "\t\t\tint temp = (num1.charAt(i) - '0') * (num2.charAt(j) - '0');\n" +
            "\t\t\tnum[i + j] += (temp + num[i + j + 1]) / 10;\n" +
            "\t\t\tnum[i + j + 1] = (num[i + j + 1] + temp) % 10;\n" +
            "\t\t}\n" +
            "\t}\n" +
            "\tStringBuilder sb = new StringBuilder();\n" +
            "\tfor (int i : num)\n" +
            "\t\tif (sb.length() > 0 || i > 0)\n" +
            "\t\t\tsb.append(i);\n" +
            "\treturn (sb.length() == 0) ? \"0\" : sb.toString();\n" +
            "}"

        }
      ],
      "problemImplementation": false
    }
    fetchSolutionDetail(solutionId)
  }, [])

  async function fetchSolutionDetail(id) {
    const response = await apiCall(ENDPOINTS.GET_SOLUTION_DETAIL.replace(":id", id))
    const data = await response.json()
    setSolution(data)
    setCurrentSolution(data);

  }

  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      if (!(block.hasAttribute("data-highlighted") && block.getAttribute("data-highlighted") == "yes"))
        hljs.highlightBlock(block)
    })
  }, [solution])

  const toggleUpvote = async (id) => {
    try {
      if (!solution.currentUserVoted) {
        const response = await upvoteSolution(apiCall, id);
        if (response.status) {
          toast({
            title: "Upvote Solution",
            description: "Upvote solution successful",
            variant: "default" // destructive
          })
          setSolution((prevSolution) => ({
            ...prevSolution,  // Giữ nguyên các thuộc tính cũ
            noUpvote: prevSolution.noUpvote + 1, // Tăng giá trị
            currentUserVoted: true, // Cập nhật giá trị mới
          }));

        }
      }
      else {
        const response = await unupvoteSolution(apiCall, id);
        if (response.status) {
          toast({
            title: "Unupvote Solution",
            description: "Unupvote solution successful",
            variant: "default" // destructive
          })
          setSolution((prevSolution) => ({
            ...prevSolution,  // Giữ nguyên các thuộc tính cũ
            noUpvote: prevSolution.noUpvote - 1 > 0 ? prevSolution.noUpvote - 1 : 0, // Tăng giá trị
            currentUserVoted: false, // Cập nhật giá trị mới
          }));

        }
      }

    } catch (error) {
      console.log(error);
    }
  }

  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="text-gray-500 flex items-center gap-2 justify-center mt-10">
        <svg
          className="h-8 w-8"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <circle cx="12" cy="16" r="1" />
          <path d="M8 11v-4a4 4 0 0 1 8 0v4" />
        </svg>
        Please login to view this content
      </div>
    )
  }

  return (
    <>
      <div>
        <div className="flex gap-2 items-center text-gray-500 cursor-pointer hover:underline" onClick={handleBack}>
          <span>
            <ArrowLeft className="w-4 h-4" />
          </span>
          All Solutions
        </div>
        <Separator className="my-2" />
        {solution ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold mb-4">{solution.title}</h2>
              {solution.currentUserCreated && <Button onClick={() => editSolution()} className="h-12 font-bold ml-4 hover:bg-green-400">
                <svg
                  className="!h-6 !w-6 text-black mr-1"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />{" "}
                  <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />{" "}
                  <line x1="16" y1="5" x2="19" y2="8" />
                </svg>
                Edit
              </Button>}
            </div>
            <div>
              <Button variant="ghost" size="icon" onClick={() => toggleUpvote(solution.id)} className="h-3 w-3">
                {solution.currentUserVoted ? <svg className="h-4 w-4 text-yellow-500" fill="currentColor" aria-hidden="true" focusable="false" data-prefix="far" data-icon="up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M192 82.4L334.7 232.3c.8 .8 1.3 2 1.3 3.2c0 2.5-2 4.6-4.6 4.6H248c-13.3 0-24 10.7-24 24V432H160V264c0-13.3-10.7-24-24-24H52.6c-2.5 0-4.6-2-4.6-4.6c0-1.2 .5-2.3 1.3-3.2L192 82.4zm192 153c0-13.5-5.2-26.5-14.5-36.3L222.9 45.2C214.8 36.8 203.7 32 192 32s-22.8 4.8-30.9 13.2L14.5 199.2C5.2 208.9 0 221.9 0 235.4c0 29 23.5 52.6 52.6 52.6H112V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V288h59.4c29 0 52.6-23.5 52.6-52.6z"></path></svg>
                  : <svg className="h-4 w-4 text-black" aria-hidden="true" focusable="false" data-prefix="far" data-icon="up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M192 82.4L334.7 232.3c.8 .8 1.3 2 1.3 3.2c0 2.5-2 4.6-4.6 4.6H248c-13.3 0-24 10.7-24 24V432H160V264c0-13.3-10.7-24-24-24H52.6c-2.5 0-4.6-2-4.6-4.6c0-1.2 .5-2.3 1.3-3.2L192 82.4zm192 153c0-13.5-5.2-26.5-14.5-36.3L222.9 45.2C214.8 36.8 203.7 32 192 32s-22.8 4.8-30.9 13.2L14.5 199.2C5.2 208.9 0 221.9 0 235.4c0 29 23.5 52.6 52.6 52.6H112V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V288h59.4c29 0 52.6-23.5 52.6-52.6z"></path></svg>}
              </Button>
              <span className="ml-2">

                {solution.noUpvote}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4 mt-4">
              {solution.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-100"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div>
              <RenderMarkdown content={solution.textSolution} />
            </div>
            {solution.solutionCodes && solution.solutionCodes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Solution Code</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex border-b">
                    {solution.solutionCodes.map((s, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 text-sm font-medium text-gray-500 ${index == 0 ? "bg-gray-100 dark:bg-gray-800 font-semibold text-gray-800" : ""}`}
                        onClick={(e) => {
                          // Set all tabs to inactive
                          e.currentTarget.parentElement
                            .querySelectorAll("button")
                            .forEach((btn) => btn.classList.remove("bg-gray-100", "dark:bg-gray-800", "font-semibold", "text-gray-800"))
                          // Set clicked tab to active
                          e.currentTarget.classList.add("bg-gray-100", "dark:bg-gray-800", "font-semibold", "text-gray-800")

                          // Hide all code blocks
                          const codeBlocks = e.currentTarget.closest(".border").querySelectorAll(".code-block")
                          codeBlocks.forEach((block) => block.classList.add("hidden"))

                          // Show selected code block
                          codeBlocks[index].classList.remove("hidden")
                        }}
                      >
                        {s.solutionLanguage}
                      </button>
                    ))}
                  </div>
                  {solution.solutionCodes.map((s, index) => (
                    <div
                      key={index}
                      className={`code-block bg-gray-50 dark:bg-gray-900 overflow-auto ${index === 0 ? "" : "hidden"}`}
                    >
                      <pre className="text-sm">
                        <code className="font-code">{s.solutionCode}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Separator className="my-4" />
            {/* <DiscussionSection solutionId={solutionId} /> */}
            <DiscussionSection locationId={solutionId} type={"SOLUTION"} activeTab={"SOLUTION"} />

          </>
        ) : (
          <div className="text-gray-500">Solution not found</div>
        )}
      </div>
    </>
  )
}

