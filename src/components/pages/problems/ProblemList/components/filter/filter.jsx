import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { DifficultyFilter } from "./items/difficulty-filter"
import { TopicsFilter } from "./items/topics-filter"
import { SkillsFilter } from "./items/skills-filter"

export function FilterPanel({
  isFiltersOpen,
  setIsFiltersOpen,
  difficulty,
  setDifficulty,
  topics,
  selectedTopics,
  toggleTopic,
  removeAllTopic,
  skills,
  selectedSkills,
  setSelectedSkills,
  clearAllFilter,
  onDifficultyChange,
  onSkillsChange
}) {
  return (
    <Card className={`border-primary bg-bg-card backdrop-blur-sm mb-4 ${isFiltersOpen ? "" : "hidden"}`}>
      <CardContent className="p-6 space-y-6">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleContent className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Filters</h3>
              <span
                onClick={() => clearAllFilter()}
                className="cursor-pointer text-sm text-gray-400 bg-unset hover:bg-unset hover:underline transition"
              >
                Clear All
              </span>
            </div>

            {/* Difficulty Filter */}
            <DifficultyFilter
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              onDifficultyChange={onDifficultyChange}
            />

            {/* Topics Filter */}
            <TopicsFilter
              topics={topics}
              selectedTopics={selectedTopics}
              toggleTopic={toggleTopic}
              removeAllTopic={removeAllTopic}
            />

            {/* Skills Filter */}
            <SkillsFilter
              skills={skills}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
              onSkillsChange={onSkillsChange}
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

