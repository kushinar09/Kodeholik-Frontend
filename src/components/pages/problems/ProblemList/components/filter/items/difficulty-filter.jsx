import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
export function DifficultyFilter({ difficulty, setDifficulty, onDifficultyChange }) {
  const handleDifficultyChange = (level, checked) => {
    const newDifficulty = checked ? [...difficulty, level] : difficulty.filter((d) => d !== level)

    setDifficulty(newDifficulty)
    onDifficultyChange(newDifficulty)
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <h4 className="text-sm font-medium text-gray-400">Difficulty</h4>
      <div className="flex flex-wrap gap-2 md:gap-4">
        <div className="flex items-center space-x-2 rounded-lg p-1.5 md:p-2 transition-colors hover:bg-gray-800/50">
          <Checkbox
            id="easy"
            checked={difficulty.includes("EASY")}
            onCheckedChange={(checked) => handleDifficultyChange("EASY", !!checked)}
          />
          <Label htmlFor="easy" className="text-text-difficultEasy cursor-pointer text-sm md:text-base">
            Easy
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg p-1.5 md:p-2 transition-colors hover:bg-gray-800/50">
          <Checkbox
            id="medium"
            checked={difficulty.includes("MEDIUM")}
            onCheckedChange={(checked) => handleDifficultyChange("MEDIUM", !!checked)}
          />
          <Label htmlFor="medium" className="text-text-difficultMedium cursor-pointer text-sm md:text-base">
            Medium
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg p-1.5 md:p-2 transition-colors hover:bg-gray-800/50">
          <Checkbox
            id="hard"
            checked={difficulty.includes("HARD")}
            onCheckedChange={(checked) => handleDifficultyChange("HARD", !!checked)}
          />
          <Label htmlFor="hard" className="text-text-difficultHard cursor-pointer text-sm md:text-base">
            Hard
          </Label>
        </div>
      </div>
    </div>
  )
}
