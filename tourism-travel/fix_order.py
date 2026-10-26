import re

with open('src/pages/business/BusinessAnalytics.jsx', 'r') as f:
    content = f.read()

# Make ResponsiveContainer have relative z-10
content = content.replace(
    '<ResponsiveContainer width="100%" height="100%">',
    '<ResponsiveContainer width="100%" height="100%" className="relative z-10">'
)

with open('src/pages/business/BusinessAnalytics.jsx', 'w') as f:
    f.write(content)
