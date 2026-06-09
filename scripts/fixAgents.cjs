const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, '..', 'src', 'mastra', 'agents');
const files = fs.readdirSync(agentsDir);

files.forEach(f => {
  const filePath = path.join(agentsDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('name: ') && !content.includes('id: ')) {
    content = content.replace(/name:\s*['"](.*?)['"],/, "name: '$1',\n  id: '$1',");
    fs.writeFileSync(filePath, content);
    console.log('Fixed ' + f);
  }
});
