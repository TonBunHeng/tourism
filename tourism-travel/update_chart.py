import re

with open('src/pages/business/BusinessAnalytics.jsx', 'r') as f:
    content = f.read()

# Replace ComposedChart imports with LineChart
content = content.replace('ComposedChart,', 'LineChart,')
content = content.replace('Bar,', '')

# Replace the ComposedChart component with LineChart
chart_pattern = r'<ComposedChart.*?<\/ComposedChart>'

replacement = """<LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#D1D5DB' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                        ticks={[0, 1500, 3000, 4500, 6000]}
                        domain={[0, 6000]}
                      />
                      <Tooltip content={<CustomMonthlyTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="plainline"
                        wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="unitsSold"
                        name="New Traveler Engagements"
                        stroke="#4472C4"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalTransaction"
                        name="Monthly Profile Visits"
                        stroke="#ED7D31"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>"""

content = re.sub(chart_pattern, replacement, content, flags=re.DOTALL)

with open('src/pages/business/BusinessAnalytics.jsx', 'w') as f:
    f.write(content)
