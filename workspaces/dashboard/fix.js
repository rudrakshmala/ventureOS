const fs = require('fs');

const files = [
  'src/app/page.tsx',
  'src/components/AgentGrid.tsx',
  'src/components/LiveFeed.tsx',
  'src/components/MemoryViewer.tsx',
  'src/components/OutreachPanel.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
}

console.log('Fixed backticks!');
