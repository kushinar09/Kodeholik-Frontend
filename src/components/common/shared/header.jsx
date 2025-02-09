import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Header() {
  return (
    <nav className="flex items-center justify-between p-4 bg-primary-card mx-36 rounded-2xl mb-4">
      <div className="flex items-center space-x-6">
        <Link href="#" className="text-primary hover:text-white">
        Explore
        </Link>
        <Link href="#" className="text-primary hover:text-white">
        Problems
        </Link>
        <Link href="#" className="text-primary hover:text-white">
        Contest
        </Link>
        <Link href="#" className="text-primary hover:text-white">
        Discuss
        </Link>
        <Link href="#" className="text-primary hover:text-white">
        Courses
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" className="text-primary hover:bg-primary hover:text-black">
        Sign in
        </Button>
        <Button className="bg-primary hover:bg-primary-hover text-black">Sign up</Button>
      </div>
    </nav>
  )
}