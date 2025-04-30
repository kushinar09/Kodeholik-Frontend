import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
export function SkillsFilter({ skills, selectedSkills, setSelectedSkills, onSkillsChange }) {
  const handleSkillChange = (skill, checked) => {
    const newSkills = checked ? [...selectedSkills, skill] : selectedSkills.filter((s) => s !== skill)

    setSelectedSkills(newSkills)
    onSkillsChange(newSkills)
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <h4 className="text-sm font-medium text-gray-400">Skills</h4>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        {skills.map((skill) => (
          <div
            key={skill}
            className="flex items-center space-x-2 rounded-lg p-1.5 md:p-2 transition-colors hover:bg-gray-800/50"
          >
            <Checkbox
              id={skill}
              checked={selectedSkills.includes(skill)}
              onCheckedChange={(checked) => handleSkillChange(skill, !!checked)}
            />
            <Label htmlFor={skill} className="text-gray-300 cursor-pointer text-sm md:text-base">
              {skill}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
