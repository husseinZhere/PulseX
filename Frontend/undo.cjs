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

        // Undo the accidental replacements from earlier script
        content = content.replace(/text-\[#1E293B\] dark:text-\[#E2E8F0\]ase/g, 'text-base');
        content = content.replace(/text-\[#1E293B\] dark:text-\[#E2E8F0\]xl/g, 'text-xl');
        content = content.replace(/text-\[#1E293B\] dark:text-\[#E2E8F0\]rand-main/g, 'text-brand-main');
        content = content.replace(/text-\[#1E293B\] dark:text-\[#E2E8F0\]lue-/g, 'text-blue-');
        content = content.replace(/text-\[#1E293B\] dark:text-\[#E2E8F0\]lack/g, 'text-black');
        content = content.replace(/text-\[#1E293B\] dark:text-\[#E2E8F0\]/g, 'text-[#1E293B] dark:text-[#E2E8F0]');

        // Convert remaining hardcoded texts
        content = content.replace(/text-\[#010218\]/g, 'text-black-main-text');
        content = content.replace(/text-\[#1E293B\]/g, 'text-[#1E293B] dark:text-[#E2E8F0]');

        // Also SVG fixes
        content = content.replace(/fill=["']#010218["']/g, 'className="fill-black-main-text"');

        if (original !== content) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log('Undid errors and fixed:', filePath);
        }
    });
});
