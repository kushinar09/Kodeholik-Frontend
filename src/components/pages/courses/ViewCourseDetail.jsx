import Header from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { useParams, useNavigate } from "react-router-dom";

const courses = [
    { id: 1, title: "C Tutorial", image: "/c.png", language: "C", description: "Learn C programming from scratch." },
    { id: 2, title: "Java Tutorial", image: "/java.png", language: "Java", description: "Master Java programming with hands-on examples." },
    { id: 3, title: "C Tutorial", image: "/c.png", language: "C", description: "Learn C programming from scratch." },
    { id: 4, title: "Java Tutorial", image: "/java.png", language: "Java", description: "Master Java programming with hands-on examples." },
    { id: 5, title: "C Tutorial 3", image: "/c.png", language: "C", description: "Learn C programming from scratch." },
    { id: 6, title: "Java Tutorial 3", image: "/java.png", language: "Java", description: "Master Java programming with hands-on examples."  },
    { id: 7, title: "C Tutorial 4", image: "/c.png", language: "C", description: "Learn C programming from scratch."  },
    { id: 8, title: "Java Tutorial 4", image: "/java.png", language: "Java", description: "Master Java programming with hands-on examples."  }
];

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const course = courses.find(course => course.id === parseInt(id));

    if (!course) {
        return <div className="text-center text-white mt-10">Course not found!</div>;
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold text-white mb-4">{course.title}</h1>
                <img src={course.image} alt={course.title} className="w-64 h-40 object-cover mx-auto mb-4 rounded-lg" />
                <p className="text-white text-lg">{course.description}</p>
                <div className="flex justify-center mt-6">
                    <Button onClick={() => navigate(-1)}>Back</Button>
                </div>
            </div>
            <FooterSection />
        </div>
    );
}