"use client"

import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { name: "Small Cap", value: 70 },
  { name: "Mid Cap", value: 30 }
]

const COLORS = ["#2D6FF7", "#10B981"]

export default function PortfolioChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "#0A1628", border: "1px solid #1E293B", borderRadius: "8px" }}
            itemStyle={{ color: "#F1F5F9" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
