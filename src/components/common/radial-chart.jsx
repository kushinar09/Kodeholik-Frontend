"use client"

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

/**
 * @typedef {Object} StatItem
 * @property {string} label - The label for the stat
 * @property {number} count - The current count
 * @property {number} total - The total possible count
 * @property {string} color - The color for the stat
 */

/**
 * RadialStats Component
 * @param {Object} props
 * @param {string} props.mainLabel - The main label for the radial chart
 * @param {number} props.mainCount - The main count value
 * @param {number} props.mainTotal - The main total value
 * @param {string} props.mainColor - The main color for the radial chart
 * @param {StatItem[]} props.sideStats - Array of side statistics
 * @param {string} [props.className] - Optional className for styling
 */
export function RadialChart({
  mainLabel,
  mainCount,
  mainTotal,
  mainColor,
  sideStats,
  className
}) {
  // Format the chart data
  const chartData = [
    {
      name: mainLabel,
      value: (mainCount / mainTotal) * 100,
      fill: mainColor
    }
  ]

  return (
    <div className={`h-full flex items-center gap-8 bg-none text-foreground ${className}`}>
      <ChartContainer
        config={{
          value: {
            color: mainColor
          }
        }}
        className="h-full aspect-square"
      >
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={90 + mainCount / mainTotal * 360}
          innerRadius={70}
          outerRadius={90}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="bg-primary-card first:fill-[#cbccc466] last:fill-primary-card"
            polarRadius={[74, 64]}
          />
          <RadialBar
            dataKey="value"
            background
            cornerRadius={10}
            fill={mainColor}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 12}
                        className="text-4xl font-bold"
                        style={{ fill: mainColor }}
                      >
                        {mainCount}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 12}
                        className="fill-muted-foreground text-sm"
                      >
                        {mainLabel}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 28}
                        className="fill-muted-foreground text-xs"
                      >
                        / {mainTotal}
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
      <div className="space-y-3">
        {sideStats.map((stat, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
            <div className="text-sm font-medium text-primary-text">
              {stat.label}
            </div>
            <div className="text-sm text-muted-foreground">
              {stat.count}/{stat.total}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

