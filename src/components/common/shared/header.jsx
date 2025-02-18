import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Header() {
  return (
    <div className="z-10 w-full sticky top-0 px-24 pt-4 pb-2 bg-primary-bg">
      <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-b from-primary-bg to-transparent pointer-events-none" />
      <nav className="relative flex items-center justify-between p-4 bg-bg-card rounded-2xl">
        <div className="flex items-center space-x-6">
          <Link href="#" className="text-primary px-4 py-2 hover:text-white">
            Explore
          </Link>
          <Link href="#" className="rounded-md px-4 py-2 bg-primary text-black font-bold">
            Problems
          </Link>
          <Link href="#" className="text-primary px-4 py-2 hover:text-white">
            Contest
          </Link>
          <Link href="#" className="text-primary px-4 py-2 hover:text-white">
            Discuss
          </Link>
          <Link href="#" className="text-primary px-4 py-2 hover:text-white">
            Courses
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-primary font-bold hover:bg-primary transition hover:text-black">
            Sign in
          </Button>
          <Button className="bg-primary text-black font-bold hover:bg-primary-button-hover">Sign up</Button>
        </div>
      </nav>
    </div>
  )
}

