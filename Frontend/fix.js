const fs = require('fs');
const path = require('path');
const folders = ['src/features/patient', 'src/features/admin'];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            content = content.replace(/(className=[\`\"'][^\`\"']*)bg-white([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:bg-')) return m;
                return p1 + 'bg-white dark:bg-[#111827]' + p2;
            });
            content = content.replace(/(className=[\`\"'][^\`\"']*)bg-\[#F6F7F8\]([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:bg-')) return m;
                return p1 + 'bg-[#F6F7F8] dark:bg-[#0B1120]' + p2;
            });
            content = content.replace(/(className=[\`\"'][^\`\"']*)bg-\[#F8F9FB\]([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:bg-')) return m;
                return p1 + 'bg-[#F8F9FB] dark:bg-[#0B1120]' + p2;
            });

            content = content.replace(/(className=[\`\"'][^\`\"']*)text-\[#101828\]([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:text-')) return m;
                return p1 + 'text-[#101828] dark:text-[#E2E8F0]' + p2;
            });
            content = content.replace(/(className=[\`\"'][^\`\"']*)text-black-main-text([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:text-')) return m;
                return p1 + 'text-black-main-text dark:text-[#E2E8F0]' + p2;
            });
            content = content.replace(/(className=[\`\"'][^\`\"']*)text-\[#757575\]([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:text-')) return m;
                return p1 + 'text-[#757575] dark:text-[#9CA3AF]' + p2;
            });
            content = content.replace(/(className=[\`\"'][^\`\"']*)text-gray-600([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:text-')) return m;
                return p1 + 'text-gray-600 dark:text-[#D1D5DB]' + p2;
            });
            content = content.replace(/(className=[\`\"'][^\`\"']*)text-[gG]ray-800([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:text-')) return m;
                return p1 + 'text-gray-800 dark:text-[#E2E8F0]' + p2;
            });
            content = content.replace(/(className=[\`\"'][^\`\"']*)text-\[#2D3748\]([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:text-')) return m;
                return p1 + 'text-[#2D3748] dark:text-[#E2E8F0]' + p2;
            });

            content = content.replace(/(className=[\`\"'][^\`\"']*)border-[gG]ray-100([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:border-')) return m;
                return p1 + 'border-gray-100 dark:border-gray-800' + p2;
            });
            content = content.replace(/(className=[\`\"'][^\`\"']*)border-[gG]ray-200([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
                if (m.includes('dark:border-')) return m;
                return p1 + 'border-gray-200 dark:border-gray-700' + p2;
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

folders.forEach(f => {
    if (fs.existsSync(f)) {
        processDir(f);
    }
});
console.log('Dark mode classes injected securely!');