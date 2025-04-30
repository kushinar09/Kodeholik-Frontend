"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import UserActionMenu from "../other/user-action-menu"
import Notification from "../other/notification"
import { Menu, X } from "lucide-react"

export default function HeaderSection({ currentActive = "Problems" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="z-20 w-full sticky top-0 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-36 pt-4 pb-2 bg-primary-bg">
      <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-b from-primary-bg to-transparent pointer-events-none" />
      <nav className="relative flex items-center justify-between p-2 sm:p-4 bg-bg-card rounded-xl sm:rounded-2xl">
        {/* Mobile menu button */}
        <button
          className="md:hidden text-primary hover:text-white p-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
          <Link
            to="/"
            className={`rounded-md px-2 py-1.5 lg:px-4 lg:py-2 text-sm lg:text-base transition-colors ${
              currentActive === "problems" ? "bg-primary text-black font-bold" : "hover:text-white text-primary"
            }`}
          >
            Problems
          </Link>
          <Link
            to="/exam"
            className={`rounded-md px-2 py-1.5 lg:px-4 lg:py-2 text-sm lg:text-base transition-colors ${
              currentActive === "exams" ? "bg-primary text-black font-bold" : "hover:text-white text-primary"
            }`}
          >
            Examination
          </Link>
          <Link
            to="/courses"
            className={`rounded-md px-2 py-1.5 lg:px-4 lg:py-2 text-sm lg:text-base transition-colors ${
              currentActive === "courses" ? "bg-primary text-black font-bold" : "hover:text-white text-primary"
            }`}
          >
            Courses
          </Link>
        </div>

        {/* Mobile navigation - shown when menu is open */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-bg-card rounded-xl shadow-lg md:hidden z-30">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`rounded-md px-4 py-2 ${
                  currentActive === "problems" ? "bg-primary text-black font-bold" : "hover:text-white text-primary"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Problems
              </Link>
              <Link
                to="/exam"
                className={`rounded-md px-4 py-2 ${
                  currentActive === "exams" ? "bg-primary text-black font-bold" : "hover:text-white text-primary"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Examination
              </Link>
              <Link
                to="/courses"
                className={`rounded-md px-4 py-2 ${
                  currentActive === "courses" ? "bg-primary text-black font-bold" : "hover:text-white text-primary"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
            </div>
          </div>
        )}

        {/* Logo or site name for mobile - optional */}
        <div className="md:hidden flex-1 text-center">
          <span className="text-primary font-bold">Kodeholik</span>
        </div>

        {/* User actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Notification />
          <UserActionMenu />
        </div>
      </nav>
    </div>
  )
}
