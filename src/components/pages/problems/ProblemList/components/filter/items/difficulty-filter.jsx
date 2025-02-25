import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function DifficultyFilter({ difficulty, setDifficulty, onDifficultyChange }) {
  const handleDifficultyChange = (level, checked) => {
    const newDifficulty = checked ? [...difficulty, level] : difficulty.filter((d) => d !== level)

    setDifficulty(newDifficulty)
    onDifficultyChange(newDifficulty)
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-400">Difficulty</h4>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-gray-800/50">
          <Checkbox
            id="easy"
            checked={difficulty.includes("easy")}
            onCheckedChange={(checked) => handleDifficultyChange("easy", !!checked)}
          />
          <Label htmlFor="easy" className="text-text-difficultEasy cursor-pointer">
            Easy
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-gray-800/50">
          <Checkbox
            id="medium"
            checked={difficulty.includes("medium")}
            onCheckedChange={(checked) => handleDifficultyChange("medium", !!checked)}
          />
          <Label htmlFor="medium" className="text-text-difficultMedium cursor-pointer">
            Medium
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-gray-800/50">
          <Checkbox
            id="hard"
            checked={difficulty.includes("hard")}
            onCheckedChange={(checked) => handleDifficultyChange("hard", !!checked)}
          />
          <Label htmlFor="hard" className="text-text-difficultHard cursor-pointer">
            Hard
          </Label>
        </div>
      </div>
    </div>
  )
}

