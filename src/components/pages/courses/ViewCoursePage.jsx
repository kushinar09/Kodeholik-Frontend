import { Card } from "@/components/ui/card"
import Header from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { GLOBALS } from "@/lib/constants"

const courses = [
    { id: 1, title: "C Tutorial 1",instructor: "A",rate: "5", image: "/c.png", language: "C" },
    { id: 2, title: "Java Tutorial 1",instructor: "B",rate: "1", image: "/java.png", language: "Java" },
    { id: 3, title: "C Tutorial 2",instructor: "C",rate: "3", image: "/c.png", language: "C" },
    { id: 4, title: "Java Tutorial 2",instructor: "E",rate: "4", image: "/java.png", language: "Java" },
    { id: 5, title: "C Tutorial 3",instructor: "F",rate: "2", image: "/c.png", language: "C" },
    { id: 6, title: "Java Tutorial 3",instructor: "G",rate: "5", image: "/java.png", language: "Java" },
    { id: 7, title: "C Tutorial 4",instructor: "H",rate: "2", image: "/c.png", language: "C" },
    { id: 8, title: "Java Tutorial 4",instructor: "I",rate: "4", image: "/java.png", language: "Java" }
  ];

  const languages = [
    { name: "All", count: courses.length },
    { name: "C", count: courses.filter(c => c.language === "C").length },
    { name: "Java", count: courses.filter(c => c.language === "Java").length },
  ];
  
  const ITEMS_PER_PAGE = 4;
  
  export default function CoursePage() {
    useEffect(() => {
        document.title = `CoursesPage - ${GLOBALS.APPLICATION_NAME}`
      }, [])

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("All");
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const navigate = useNavigate();
    const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    const handleFilterClick = () => {
      setIsFilterExpanded(!isFilterExpanded);
    };
  
    const handleLanguageClick = (language) => {
      setSelectedLanguage(language.name);
      setCurrentPage(1);
      setIsFilterExpanded(false); // Close filter after selection
    };
    
    const filteredCourses = courses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedLanguage === "All" || course.language === selectedLanguage)
    );
  
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-white mb-6">COURSES</h1>
          <div className="mb-4">
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              placeholder="Search courses..."
              className="p-2 flex-grow bg-input-bg text-input-text placeholder-input-placeholder border-input-border focus:border-input-borderFocus focus:ring-input-focusRing"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              onClick={handleFilterClick}
              className={cn(
                "text-primary font-bold hover:bg-primary transition hover:text-black",
                isFilterExpanded && "bg-button-primary text-bg-primary hover:bg-button-hover"
              )}
            >
              Filter
              <span className="ml-2 text-sm">{isFilterExpanded ? '▲' : '▼'}</span>
            </Button>
          </div>
          {isFilterExpanded && (
            <div className="mt-4 flex gap-4 flex-wrap bg-bg-card border border-border-muted rounded-lg p-4 shadow-medium">
              {languages.map((language) => (
                <Button
                  key={language.name}
                  variant="ghost"
                  onClick={() => handleLanguageClick(language)}
                  className={cn(
                    "text-primary font-bold hover:bg-primary transition hover:text-black",
                    selectedLanguage === language.name && "bg-button-primary text-bg-primary hover:bg-button-hover"
                  )}
                >
                  {language.name} ({language.count})
                </Button>
              ))}
            </div>
          )}
          </div>
          <div className="grid grid-cols-4 gap-6">
            {filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((course) => (
              <Card 
                key={course.id} 
                className="p-4 bg-bg-card rounded-lg shadow-lg cursor-pointer" 
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <img src={course.image} alt={course.title} className="w-full h-40 object-cover rounded-lg" />
                <p className="mt-2 text-text-primary font-semibold">{course.title}</p>
                <p className="text-sm text-text-primary">Instructor: {course.instructor}</p>
                <p className="text-sm text-yellow-400">Rating: {course.rate} ⭐</p>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-6 gap-2">
            <Button variant="ghost" className="text-primary font-bold hover:bg-primary transition hover:text-black" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </Button>
            {[...Array(totalPages)].map((_, index) => (
              <Button variant="ghost" key={index} onClick={() => handlePageChange(index + 1)}  className={cn("text-primary font-bold hover:bg-primary transition hover:text-black",
                currentPage === index + 1 && "bg-button-primary text-bg-primary hover:bg-button-hover",)}> 
                {index + 1}
              </Button>
            ))}
            <Button variant="ghost" className="text-primary font-bold hover:bg-primary transition hover:text-black" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
        <FooterSection />
      </div>
    );
}