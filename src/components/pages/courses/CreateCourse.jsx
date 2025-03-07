import { useEffect } from "react"
import CourseForm from "../../common/CourseForm"
import { GLOBALS } from "@/lib/constants"
import Header from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"


function CreateCourse() {
  useEffect(() => {
    document.title = `Create Course - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header/>
        <div className="container mx-auto p-6">
            <h1 className="text-2xl text-text-primary font-bold mb-4">Create New Course</h1>
            <CourseForm />
        </div>
        <FooterSection/>
    </div>
  )
}

export default CreateCourse