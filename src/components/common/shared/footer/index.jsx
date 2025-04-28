import { Facebook, Mail } from "lucide-react"
import { LOGO } from "@/lib/constants"
import { Github } from "lucide-react"

export default function FooterSection() {
  return (
    <footer className="w-full bg-primary-card px-24 mt-8">
      <div className="w-full mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a href="/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <LOGO className="text-primary size-8" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-primary dark:text-white">Kodeholik</span>
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <a href="https://www.facebook.com/duyphong109" target="_blank" rel="noopener noreferrer" className="hover:underline me-4 md:me-6">Facebook</a>
            </li>
            <li>
              <a href="mailto:phongpd109.work@gmail.com" className="hover:underline me-4 md:me-6">Email</a>
            </li>
            <li>
              <a href="https://github.com/kushinar09" target="_blank" rel="noopener noreferrer" className="hover:underline">Github</a>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2025 Kodeholik. All rights reserved.
        </span>
      </div>
    </footer>
  )
}
