import Header from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { useParams, useNavigate, Link } from "react-router-dom";


const courses = [
    { id: 1, title: "C Tutorial", image: "/c.png", language: "C",instructor: "A",rate: "5", description: "Learn C programming from scratch." },
    { id: 2, title: "Java Tutorial", image: "/java.png", language: "Java",instructor: "B",rate: "1", description: "Master Java programming with hands-on examples." },
    { id: 3, title: "C Tutorial", image: "/c.png", language: "C",instructor: "C",rate: "3", description: "Learn C programming from scratch." },
    { id: 4, title: "Java Tutorial", image: "/java.png", language: "Java",instructor: "E",rate: "4", description: "Master Java programming with hands-on examples." },
    { id: 5, title: "C Tutorial 3", image: "/c.png", language: "C",instructor: "F",rate: "5", description: "Learn C programming from scratch." },
    { id: 6, title: "Java Tutorial 3", image: "/java.png", language: "Java",instructor: "G",rate: "2", description: "Master Java programming with hands-on examples."  },
    { id: 7, title: "C Tutorial 4", image: "/c.png", language: "C",instructor: "H",rate: "4", description: "Learn C programming from scratch."  },
    { id: 8, title: "Java Tutorial 4", image: "/java.png", language: "Java",instructor: "I",rate: "5", description: "Master Java programming with hands-on examples."  }
];
const lesson = [
    { id: 1, title: "Introduction to C", type: "Video", status: "Completed" },
    { id: 2, title: "Variables and Data Types", type: "Article", status: "In Progress" },
    { id: 3, title: "Control Flow in C", type: "Video", status: "Not Started" },
    { id: 4, title: "Functions and Pointers", type: "Quiz", status: "Completed" }
];

export default function CourseDetail() {
    const [open, setOpen] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const course = courses.find(course => course.id === parseInt(id));
    const handleEnroll = () => {
        // Your enrollment logic here (e.g., API call)
        alert("You have successfully enrolled!"); 
        setOpen(false);
    };


    if (!course) {
        return <div className="text-center text-white mt-10">Course not found!</div>;
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <Header />
            <div className="container mx-auto px-24 p-6">
                <div className="flex gap-6 ">
                    <div className="w-2/3">
                        <h1 className="text-3xl font-bold text-white mb-4">Course Title: {course.title}</h1>
                        <p className="text-text-primary text-lg"><b>Instructor:</b> {course.instructor}</p>
                        <p className="text-lg text-yellow-400">Rating: {course.rate}⭐</p>
                        <p className="text-text-primary text-lg"> <b>Description:</b> {course.description}</p>
                    </div>
                    <div className="w-1/3 items-center">
                        <img src="https://banner2.cleanpng.com/20180805/iot/8db265e00790702392f413b6d2f71637.webp" alt={course.title} className="w-60 h-60 object-cover mx-auto mb-4 rounded-full" />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white mb-4">Course Modules</h1>
                    <Table >
                        <TableHeader >
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Lesson Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-text-primary">
                            {lesson.map((lesson) => (
                                <TableRow key={lesson.id} >
                                <TableCell>{lesson.id}</TableCell>
                                <TableCell>{lesson.title}</TableCell>
                                <TableCell>{lesson.type}</TableCell>
                                <TableCell>{lesson.status}</TableCell>
                                <TableCell>
                                    <Link to={`/viewLessonDetail/${lesson.id}`}>
                                    <Button variant="ghost" className="text-primary font-bold hover:bg-primary transition hover:text-black">View</Button>
                                    </Link>
                                </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-center mt-6 gap-2 font-bold">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Enroll</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Confirm Enrollment</DialogTitle>
                        <DialogDescription>
                            Do you want to enroll in this course?
                        </DialogDescription>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleEnroll}>Yes, Enroll</Button>
                        </div>
                    </DialogContent>
                </Dialog>
                    <Button onClick={() => navigate(-1)}>Back</Button>
                </div>
            </div>
            <FooterSection />
        </div>
    );
}