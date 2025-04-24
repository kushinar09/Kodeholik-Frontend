"use client"

import MarkdownEditor from "@/components/common/markdown/MarkdownEditor"
import ProblemHeader from "../ProblemDetail/components/problem-header-option"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Plus, Send, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import { editSolution, getAllSkills, getSuccessSubmissionList, postSolution } from "@/lib/api/problem_api"
import { useAuth } from "@/providers/AuthProvider"
import { Badge } from "@/components/ui/badge"
import Select from "react-select"
import { toast } from "sonner"

const requestData = {
  link: "",
  title: "",
  textSolution: "",
  skills: [],
  submissionId: []
}

export default function ShareSolution({ solution, setIsEditMode }) {

  const { link } = useParams()
  const { submission } = useParams()
  const navigate = useNavigate()

  const { apiCall } = useAuth()
  const [canDelete, setCanDelete] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownItems, setDropdownItems] = useState()
  const [markdownValue, setMarkdownValue] = useState("")
  const [selectedSubmissionId, setSelectedSubmissionId] = useState([Number(submission)])
  const [firstSubmission, setFirstSubmission] = useState({})
  const [deletedId, setDeletedId] = useState(0)
  const [skills, setSkills] = useState(null)
  const [solutionSkills, setSolutionSkills] = useState([])
  const [isSkillOpen, setIsSkillOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [title, setTitle] = useState("")
  const [canSubmit, setCanSubmit] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentSolutionId, setCurrentSolutionId] = useState(0)
  const [problemLink, setProblemLink] = useState("")
  const fetchSuccessSubmissionList = async () => {
    try {
      const response = await getSuccessSubmissionList(apiCall, (link || solution.problem.link))
      let arr = []
      for (let i = 0; i < response.length; i++) {
        if (response[i].id == submission) {
          setFirstSubmission(response[i])
          setMarkdownValue(" # Intuition \n <!-- Describe your first thoughts on how to solve this problem. --> \n # Approach \n <!-- Describe your approach to solving the problem. --> \n # Complexity \n - Time complexity: \n <!-- Add your time complexity here, e.g. $$O(n)$$ --> \n - Space complexity: \n <!-- Add your space complexity here, e.g. $$O(n)$$ -->\n # Code \n <!--\nPlease select a code for your solution by clicking the 'Add Submission' button. \nIf you want to remove a selected code, click the 'X' icon in the button have id that you want to removed. \nYou cannot delete or edit the selected code here. \nPlease choose at least one code.\n--> \n" + "\nLOCKED-CODE \n//Submission " + response[i].id + " \n " + response[i].code + "\nLOCKED-CODE")
        }
        else {
          arr.push(response[i])
        }
      }
      setDropdownItems(arr)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchSuccessSubmissionListByLink = async (problemLink) => {
    try {
      const response = await getSuccessSubmissionList(apiCall, problemLink)
      let arr = []
      for (let i = 0; i < response.length; i++) {
        if (response[i].id == submission) {
          setFirstSubmission(response[i])
          setMarkdownValue(" # Intuition \n <!-- Describe your first thoughts on how to solve this problem. --> \n # Approach \n <!-- Describe your approach to solving the problem. --> \n # Complexity \n - Time complexity: \n <!-- Add your time complexity here, e.g. $$O(n)$$ --> \n - Space complexity: \n <!-- Add your space complexity here, e.g. $$O(n)$$ -->\n # Code \n <!--\nPlease select a code for your solution by clicking the 'Add Submission' button. \nIf you want to remove a selected code, click the 'X' icon in the button have id that you want to removed. \nYou cannot delete or edit the selected code here. \nPlease choose at least one code.\n--> \n" + "\nLOCKED-CODE \n//Submission " + response[i].id + " \n " + response[i].code + "\nLOCKED-CODE")
        }
        else {
          arr.push(response[i])
        }
      }
      setDropdownItems(arr)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAllSkills = async () => {
    try {
      const response = await getAllSkills(apiCall)
      setSkills(response?.map((skill) => ({ value: skill, label: skill })) || [])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    console.log(submission, link, solution)
    fetchAllSkills()
    if (solution == null) {
      fetchSuccessSubmissionList()
      setIsEdit(false)
    }
    else if (solution != null) {
      setIsEdit(true)
      setCurrentSolutionId(solution?.id)
      fetchSuccessSubmissionListByLink(solution?.problem.link)
      setProblemLink(solution?.problem.link)
      setTitle(solution?.title)
      setSolutionSkills(solution?.skills.map((skill) => skill) || [])
      setSelectedSubmissionId(
        solution?.solutionCodes.map((solution) => solution.submissionId) || []
      )
      let value = solution.textSolution
      for (let i = 0; i < solution?.solutionCodes.length; i++) {
        value += "\nLOCKED-CODE \n//Submission " + solution?.solutionCodes[i].submissionId + " \n " + solution?.solutionCodes[i].solutionCode + "\nLOCKED-CODE"
      }
      setMarkdownValue(value)
    }
  }, [])

  const handleOnChange = (value) => {
    // Handle markdown change
    setMarkdownValue(value)
    setDescription(value)
  }

  const handleSelectItem = (item) => {
    setShowDropdown(false)

    setMarkdownValue(markdownValue + "\nLOCKED-CODE \n //Submission " + item.id + " \n " + item.code + "\nLOCKED-CODE")

    setSelectedSubmissionId([...selectedSubmissionId, item.id])
  }

  const handleSelectSkill = (item) => {
    setSolutionSkills([...skills, item])
  }

  useEffect(() => {
    if (canDelete) {
      setMarkdownValue(removeSubmissionText(markdownValue, deletedId))
    }
  }, [canDelete])

  const handleDeleteSubmission = (submission) => {
    setSelectedSubmissionId((prev) =>
      prev.includes(submission)
        ? prev.filter((id) => id !== submission)
        : [...prev, submission]
    )
    setDeletedId(submission)
    setCanDelete(true)
    if (submission == firstSubmission.id && !dropdownItems.includes(firstSubmission)) {
      setDropdownItems((prev) => [...prev, firstSubmission])
    }
  }

  const handleDeleteSkill = (skill) => {
    setSolutionSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((item) => item !== skill)
        : [...prev, skill]
    )
  }

  const removeSubmissionText = (text, submissionId) => {
    const regex = new RegExp(`LOCKED-CODE\\s*//Submission\\s*${submissionId}[\\s\\S]*?LOCKED-CODE`, "g")
    return text.replace(regex, "").trim()
  }

  const handleChange = (selectedOption) => {
    setSolutionSkills([...solutionSkills, selectedOption.value])
    setIsSkillOpen(false)
  }

  useEffect(() => {
    if (title.length < 10 || selectedSubmissionId.length == 0) {
      setCanSubmit(false)
    }
    else {
      setCanSubmit(true)
    }
  }, [title, selectedSubmissionId])

  const submitSolution = () => {
    requestData.link = (link || solution.problem.link)
    requestData.title = title
    requestData.textSolution = getValueRemoveLockedCode(markdownValue)
    requestData.skills = solutionSkills
    requestData.submissionId = selectedSubmissionId
    handlePostSolution()
  }

  const handlePostSolution = async () => {
    try {
      if (!isEdit) {
        const response = await postSolution(apiCall, requestData)
        if (response.status == true) {
          toast.success("Post solution successful", { duration: 2000 })
          navigate("/problem-solution/" + (link || solution.problem.link) + "/" + response.data.id)
        }
      }
      else {
        const response = await editSolution(apiCall, requestData, currentSolutionId)
        if (response.status == true) {
          toast.success("Edit solution successful", { duration: 2000 })
          window.location.href = ("/problem-solution/" + problemLink + "/" + response.data.id)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getValueRemoveLockedCode = (value) => {
    const regex = new RegExp("LOCKED-CODE\\s*//Submission\\s*[\\s\\S]*?LOCKED-CODE", "g")
    // .replace("# Code \n <!--Please select a code for your solution by clicking the 'Add Submission' button. If you want to remove a selected code, click the 'X' icon in the Selected Submissions section. You cannot delete or edit the selected code here. Please choose at least one code.--> ", "")
    return value.replace(regex, "").trim()
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <ProblemHeader />
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Card className="shadow-lg border-0">

          <CardHeader className="pb-3 border-b">
            <div className="flex gap-2 items-center text-gray-500 cursor-pointer hover:underline" onClick={() => {
              setIsEditMode?.(false) || navigate("/problem-submission/" + (link || solution.problem.link) + "/" + submission)
            }}
            >
              <span>
                <ArrowLeft className="w-4 h-4" />
              </span>
              Back
            </div>
            <h1 className="text-2xl font-bold text-green-500">{!isEdit ? "Share Your Solution" : "Edit Your Solution"}</h1>
            <p className="text-muted-foreground">Share your approach to solving this problem with the community</p>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="title" className="text-base font-semibold">
                  Solution Title
                </label>
                <span className="text-xs text-red-500 font-bold text-muted-foreground">Required</span>
              </div>
              <Input
                id="title"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
                className="bg-card text-card-foreground"
                placeholder="E.g., 'Optimized Dynamic Programming Approach'"
              />
            </div>

            <div style={{ marginTop: "8px" }}>
              <div className="relative">
                <div className="flex items-center">
                  <Button onClick={() => setIsSkillOpen(!isSkillOpen)} variant="outline" size="sm" className="h-8 gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Add Skill</span>
                  </Button>
                  <div>
                    {solutionSkills.length > 0 &&
                      <div>
                        {solutionSkills.map((skill) => (
                          <Badge key={skill} variant="outline" className="bg-gray-300 py-1.5 mb-2 mt-2 text-black ml-2">
                            {skill}
                            <X className="h-3 w-3 ml-2 mt-1 cursor-pointer" onClick={() => handleDeleteSkill(skill)} />
                          </Badge>
                        ))}
                      </div>}
                  </div>
                </div>
                {/* Dropdown Menu */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: isSkillOpen ? 1 : 0, height: isSkillOpen ? "auto" : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="absolute left-0 mt-1 w-64 bg-card rounded-md shadow-lg border z-10">
                    {skills && <Select options={skills} onChange={handleChange} isOptionDisabled={(option) => solutionSkills.includes(option.value)} />}

                  </div>
                </motion.div>
              </div>
            </div>

            {/* Detail Section */}
            <div style={{ marginTop: "8px" }} className="space-y-3">
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="text-base font-semibold">Solution Details</label>
                  <span className="text-xs text-red-500 font-bold text-muted-foreground">Required</span>

                </div>
                <div className="relative">
                  <div className="flex items-center mt-1">
                    <Button onClick={() => setShowDropdown(!showDropdown)} variant="outline" size="sm" className="h-8 gap-1">
                      <Plus className="h-4 w-4" />
                      <span>Add Submission</span>
                    </Button>
                    <div>
                      {selectedSubmissionId.length > 0 &&
                        <div>
                          {selectedSubmissionId.map((submission) => (
                            <Badge key={submission} variant="outline" className="bg-gray-300 py-1.5 mb-2 mt-2 text-black ml-2">
                              {submission}
                              <X className="h-3 w-3 ml-2 mt-1 cursor-pointer" onClick={() => handleDeleteSubmission(submission)} />
                            </Badge>
                          ))}
                        </div>}
                    </div>
                  </div>
                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: showDropdown ? 1 : 0, height: showDropdown ? "auto" : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className={`absolute left-0 mt-1 w-64 bg-card rounded-md shadow-lg border ${showDropdown ? "z-10 block" : "z-0 hidden"}`}>
                      <ul className="py-1 max-h-60 overflow-y-auto">
                        {dropdownItems && dropdownItems
                          .filter(item => !selectedSubmissionId.includes(Number(item.id)))
                          .map((item) => (
                            <li
                              key={item.id}
                              className="px-3 py-2 hover:bg-muted flex items-center gap-2 cursor-pointer"
                              onClick={() => handleSelectItem(item)}
                            >
                              <span>{item.id}, {item.languageName}, {item.createdAt}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-1">
                <div className="bg-muted/40 rounded-md p-2 mb-2 flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  <span>Explain your approach</span>
                </div>
                {markdownValue != null &&
                  <div className="h-[400px]">
                    <MarkdownEditor value={markdownValue} setCanDelete={setCanDelete} canDelete={canDelete} onChange={handleOnChange} />
                  </div>
                }
              </div>

              <p className="text-xs text-muted-foreground">
                Use markdown to format your solution. You can add code blocks, lists, and more.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={() => {
              setIsEditMode?.(false) || navigate("/problem-submission/" + (link || solution.problem.link) + "/" + submission)
            }}
            >
              Cancel
            </Button>
            <Button type="button" className={`gap-2 bg-primary ${canSubmit ? "" : "disabled"}`} disabled={!canSubmit} onClick={() => submitSolution()}>
              <Send className="h-4 w-4" />
              Post
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}