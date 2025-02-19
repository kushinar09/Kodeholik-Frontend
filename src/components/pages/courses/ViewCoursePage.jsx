import { Card } from "@/components/ui/card"
import Header from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils";
import { useState } from "react"
import { useNavigate } from "react-router-dom";

const courses = [
    { id: 1, title: "C Tutorial 1", image: "/c.png", language: "C" },
    { id: 2, title: "Java Tutorial 1", image: "/java.png", language: "Java" },
    { id: 3, title: "C Tutorial 2", image: "/c.png", language: "C" },
    { id: 4, title: "Java Tutorial 2", image: "/java.png", language: "Java" },
    { id: 5, title: "C Tutorial 3", image: "/c.png", language: "C" },
    { id: 6, title: "Java Tutorial 3", image: "/java.png", language: "Java" },
    { id: 7, title: "C Tutorial 4", image: "/c.png", language: "C" },
    { id: 8, title: "Java Tutorial 4", image: "/java.png", language: "Java" }
  ];
  
  const ITEMS_PER_PAGE = 8;
  
  export default function CoursePage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("All");
    const navigate = useNavigate();
    const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };
    
    const filteredCourses = courses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedLanguage === "All" || course.language === selectedLanguage)
    );
  
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold text-white mb-6">COURSES</h1>
          <div className="flex gap-4 mb-4">
            <Input 
              type="text" 
              placeholder="Search courses..." 
              className="p-2 flex-grow" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <Button onClick={() => setSelectedLanguage("All")}>All</Button>
            <Button onClick={() => setSelectedLanguage("C")}>C</Button>
            <Button onClick={() => setSelectedLanguage("Java")}>Java</Button>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((course) => (
              <Card 
                key={course.id} 
                className="p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer" 
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <img src={course.image} alt={course.title} className="w-full h-40 object-cover rounded-lg" />
                <p className="mt-2 text-center text-lg font-semibold">{course.title}</p>
                <Button className="mt-2 w-full">Enroll</Button>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-6 gap-2">
            <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </Button>
            {[...Array(totalPages)].map((_, index) => (
              <Button key={index} onClick={() => handlePageChange(index + 1)} className={cn(currentPage === index + 1 && "bg-green-500")}> 
                {index + 1}
              </Button>
            ))}
            <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
        <FooterSection />
      </div>
    );
}