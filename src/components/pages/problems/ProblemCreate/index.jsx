"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ProblemDetails } from "./components/problem-details"
import { InputParameters } from "./components/input-parameters"
import { Editorial } from "./components/editorial"
import { TestCases } from "./components/test-cases"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/context/AuthProvider"

export default function ProblemCreator() {
  const { apiCall } = useAuth()

  const [activeStep, setActiveStep] = useState("testcases")
  const [formData, setFormData] = useState({
    // Problem Details
    details: {
      title: "",
      difficulty: "EASY",
      description: "",
      status: "PRIVATE",
      topics: [],
      skills: [],
      isActive: true,
      languageSupport: []
    },
    inputParameter: [],
    editorial: {
      editorialTitle: "",
      editorialTextSolution: "",
      editorialSkills: [],
      solutionCode: []
    },
    testCases: {
      excelFile: null
    }
  })

  useEffect(() => {
    // console.log("Form data updated:", formData)
    // console.log("Problem Details:", formData.details)
    // console.log("Input Parameters:", formData.inputParameter)
    // console.log("Editorial:", formData.editorial)
    // console.log("Test Cases:", formData.testCases)
  }, [formData])

  const [completedSteps, setCompletedSteps] = useState({
    details: false,
    parameters: false,
    editorial: false,
    testcases: false
  })

  const updateFormData = (stepData, step) => {
    setFormData((prev) => {
      const newData = { ...prev }

      // Update the appropriate section based on the step
      if (step === "details") {
        newData.details = { ...prev.details, ...stepData }
      } else if (step === "parameters") {
        newData.inputParameter = stepData
      } else if (step === "editorial") {
        newData.editorial = { ...prev.editorial, ...stepData }
      } else if (step === "testcases") {
        newData.testCases = { ...prev.testCases, ...stepData }
      }

      console.log(`Updated ${step}:`, newData)
      return newData
    })
    setCompletedSteps((prev) => ({ ...prev, [step]: true }))
  }

  const handleNext = () => {
    if (activeStep === "details") setActiveStep("parameters")
    else if (activeStep === "parameters") setActiveStep("editorial")
    else if (activeStep === "editorial") setActiveStep("testcases")
  }

  const handlePrevious = () => {
    if (activeStep === "parameters") setActiveStep("details")
    else if (activeStep === "editorial") setActiveStep("parameters")
    else if (activeStep === "testcases") setActiveStep("editorial")
  }

  const handleSubmit = async () => {
    try {
      const problemBasicAddDto = {
        title: formData.details.title,
        difficulty: formData.details.difficulty,
        description: formData.details.description,
        status: formData.details.status,
        topics: formData.details.topics,
        skills: formData.details.skills,
        isActive: formData.details.isActive,
        languageSupport: formData.details.languageSupport
      }

      const problemEditorialDto = {
        editorialDtos: {
          editorialTitle: formData.editorial.editorialTitle,
          editorialTextSolution: formData.editorial.editorialTextSolution,
          editorialSkills: formData.editorial.editorialSkills,
          solutionCodes: formData.editorial.solutionCode.map((solution) => ({
            solutionLanguage: solution.solutionLanguage,
            solutionCode: solution.solutionCode
          }))
        }
      }

      const problemInputParameterDto = formData.inputParameter.map((param) => ({
        templateCode: {
          code: param.templateCodes,
          language: param.language
        },
        functionSignature: param.functionSignature,
        returnType: param.returnType,
        language: param.language,
        parameters: param.parameters.map((p) => ({
          inputName: p.inputName,
          inputType: p.inputType
        }))
      }))

      // const formDataObj = new FormData()

      // formDataObj.append("problemBasicAddDto", JSON.stringify(problemBasicAddDto));
      // formDataObj.append("problemEditorialDto", JSON.stringify(problemEditorialDto));
      // formDataObj.append("problemInputParameterDto", JSON.stringify(problemInputParameterDto));
      // formDataObj.append("testCaseFile", formData.testCases.excelFile)

      // const response = await apiCall(ENDPOINTS.POST_CREATE_PROBLEM, {
      //   method: "POST",
      //   body: formDataObj
      // })

      // if (!response.ok) {
      //   const errorData = await response.json()
      //   throw new Error(errorData.message || "Failed to create problem")
      // }

      const problemBasicAddDtoText = "{\"title\":\"Two sum 3 - leetcode\",\"difficulty\":\"EASY\",\"description\":\"# Heading\\n# Heading\\n# Heading\\n# Heading\\n# Heading\",\"status\":\"PRIVATE\",\"topics\":[\"Array\"],\"skills\":[\"String\"],\"isActive\":true,\"languageSupport\":[\"Java\"]}"
      const problemEditorialDtoText = "{\"editorialDtos\":{\"editorialTitle\":\"asdasdasdsadasasd\",\"editorialTextSolution\":\"**Bold**\\n**Bold**\\n**Bold**\\n**Bold**\",\"editorialSkills\":[\"String\"],\"solutionCodes\":[{\"solutionLanguage\":\"Java\",\"solutionCode\":\"public static String twoSum(String num1, String num2) {\\n    return Integer.parseInt(num1) + Integer.parseInt(num2) + \\\"\\\";\\n}\"}]}}"
      const problemInputParameterDtoText = "[{\"templateCode\":{\"code\":\"abc\",\"language\":\"Java\"},\"functionSignature\":\"twoSum\",\"returnType\":\"STRING\",\"language\":\"Java\",\"parameters\":[{\"inputName\":\"num1\",\"inputType\":\"STRING\"},{\"inputName\":\"num2\",\"inputType\":\"STRING\"}]}]"

      const formdataT = new FormData()

      // Append JSON data as Blob
      formdataT.append(
        "problemBasicAddDto",
        new Blob([JSON.stringify(problemBasicAddDtoText)], { type: "application/json" })
      )
      formdataT.append(
        "problemEditorialDto",
        new Blob([JSON.stringify(problemEditorialDtoText)], { type: "application/json" })
      )
      formdataT.append(
        "problemInputParameterDto",
        new Blob([JSON.stringify(problemInputParameterDtoText)], { type: "application/json" })
      )

      // Append file
      formdataT.append("testCaseFile", formData.testCases.excelFile)

      const requestOptions = {
        method: "POST",
        body: formdataT,
        credentials: "include"
      }

      fetch("http://localhost:8080/api/v1/problem/add-problem", requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error(error))


      toast({
        title: "Success",
        description: "Problem created successfully!",
        variant: "success"
      })

    } catch (error) {
      console.error("Error creating problem:", error)

      if (error.response) {
        const errorMessage = await error.response.text()
        console.error("Server Error Message:", errorMessage)
      }

      toast({
        title: "Error",
        description: error.message || "Error creating problem. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Problem</h1>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <StepIndicator
            step="details"
            label="Problem Details"
            active={activeStep === "details"}
            completed={completedSteps.details}
            onClick={() => setActiveStep("details")}
          />
          <StepDivider />
          <StepIndicator
            step="parameters"
            label="Input Parameters"
            active={activeStep === "parameters"}
            completed={completedSteps.parameters}
            onClick={() => (completedSteps.details ? setActiveStep("parameters") : null)}
            disabled={!completedSteps.details}
          />
          <StepDivider />
          <StepIndicator
            step="editorial"
            label="Editorial"
            active={activeStep === "editorial"}
            completed={completedSteps.editorial}
            onClick={() => (completedSteps.parameters ? setActiveStep("editorial") : null)}
            disabled={!completedSteps.parameters}
          />
          <StepDivider />
          <StepIndicator
            step="testcases"
            label="Test Cases"
            active={activeStep === "testcases"}
            completed={completedSteps.testcases}
            onClick={() => (completedSteps.editorial ? setActiveStep("testcases") : null)}
            disabled={!completedSteps.editorial}
          />
        </div>
      </div>

      <Card className="mb-8 mx-20">
        <CardContent className="pt-6">
          <Tabs value={activeStep} onValueChange={setActiveStep}>
            <TabsContent value="details">
              <ProblemDetails
                formData={formData}
                updateFormData={(data) => updateFormData(data, "details")}
                onNext={handleNext}
              />
            </TabsContent>
            <TabsContent value="parameters">
              <InputParameters
                formData={formData}
                updateFormData={(data) => updateFormData(data, "parameters")}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </TabsContent>
            <TabsContent value="editorial">
              <Editorial
                formData={formData}
                updateFormData={(data) => updateFormData(data, "editorial")}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </TabsContent>
            <TabsContent value="testcases">
              <TestCases
                formData={formData}
                updateFormData={(data) => updateFormData(data, "testcases")}
                onPrevious={handlePrevious}
                onSubmit={handleSubmit}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function StepIndicator({ step, label, active, completed, onClick, disabled = false }) {
  return (
    <div
      className={`flex flex-col items-center cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={disabled ? null : onClick}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
          ${active
      ? "bg-primary text-primary-foreground"
      : completed
        ? "bg-green-500 text-white"
        : "bg-muted text-muted-foreground"
    }`}
      >
        {completed ? <Check className="h-5 w-5" /> : step.charAt(0).toUpperCase()}
      </div>
      <span className={`text-sm ${active ? "font-medium" : ""}`}>{label}</span>
    </div>
  )
}

function StepDivider() {
  return <div className="flex-1 h-0.5 bg-muted mx-2" />
}

