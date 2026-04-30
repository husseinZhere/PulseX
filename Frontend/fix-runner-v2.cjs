const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, 'src/features/patient'),
    path.join(__dirname, 'src/features/admin')
];

function walkSync(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            walkSync(p, callback);
        } else if (p.endsWith('.jsx')) {
            callback(p);
        }
    }
}

targetDirs.forEach(dir => {
    walkSync(dir, (filePath) => {
        let content = fs.readFileSync(filePath, 'utf-8');
        let original = content;

        // Fix SVGs fill
        content = content.replace(/fill=["']#010218["']/g, 'className="fill-black-main-text dark:fill-white"');
        content = content.replace(/stroke=["']#010218["']/g, 'className="stroke-black-main-text dark:stroke-white"');

        // Fix hardcoded dark texts that look bad
        content = content.replace(/text-\[#1E293B\]/g, 'text-[#1E293B] dark:text-[#E2E8F0]');
        content = content.replace(/text-\[#010218\]/g, 'text-black-main-text dark:text-white');

        // Fix backgrounds that might be missing
        content = content.replace(/(className=[\`\"'][^\`\"']*)bg-[#FAFBFF]([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
            if (m.includes('dark:bg-')) return m;
            return p1 + 'bg-[#FAFBFF] dark:bg-[#0B1120]' + p2;
        });

        content = content.replace(/(className=[\`\"'][^\`\"']*)bg-white([^\`\"']*[\`\"'])/g, (m, p1, p2) => {
            if (m.includes('dark:bg-') || m.includes('bg-white/')) return m;
            return p1 + 'bg-white dark:bg-[#111827]' + p2;
        });

        if (original !== content) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log('Fixed:', filePath);
        }
    });
});
console.log('Done polishing dark colors!');