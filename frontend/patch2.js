const fs = require('fs');
const file = '/home/user/Documents/monad/upwork/frontend/src/components/views/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("};\n\nexport default DashboardView;", "  );\n};\n\nexport default DashboardView;");

fs.writeFileSync(file, content);
