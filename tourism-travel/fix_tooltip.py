import re

with open('src/pages/business/BusinessAnalytics.jsx', 'r') as f:
    content = f.read()

# We need to find the <ResponsiveContainer> block and the <div className="absolute inset-0 ..."> block
# and swap their order or just add z-index to Tooltip.
# Adding z-index to Tooltip is simplest and safest.

replacement = '<Tooltip content={<CustomPieTooltip />} wrapperStyle={{ zIndex: 50 }} />'
content = content.replace('<Tooltip content={<CustomPieTooltip />} />', replacement)

# To be absolutely sure, let's also add zIndex: 0 to the absolute div, or z-0
content = content.replace(
    'className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"',
    'className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0"'
)

with open('src/pages/business/BusinessAnalytics.jsx', 'w') as f:
    f.write(content)
