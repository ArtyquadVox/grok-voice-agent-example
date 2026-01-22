const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

// ---------------------------
// Check required environment variables
// ---------------------------
if (!process.env.VOX_CI_CREDENTIALS || !process.env.VOX_CI_ROOT_PATH) {
    console.error('Please set VOX_CI_CREDENTIALS and VOX_CI_ROOT_PATH in your .env file');
    process.exit(1);
}

// ---------------------------
// Define project paths
// ---------------------------
const projectRoot = __dirname;
const ciRootDir = process.env.VOX_CI_ROOT_PATH; // Root folder for Voximplant CI source files
const sourceApplicationDir = path.join(projectRoot, 'application'); // Folder with app configs
const sourceScenariosDir = path.join(projectRoot, 'scenarios'); // Folder with scenario scripts
const sourceVoiceAIDir = path.join(projectRoot, 'modules'); // Folder with ai script

// ---------------------------
// Create CI root folder if it doesn't exist
// ---------------------------
if (!fs.existsSync(ciRootDir)) fs.mkdirSync(ciRootDir, { recursive: true });
console.log(`CI root folder ready: ${ciRootDir}`);

// ---------------------------
// Install Voximplant CI package
// ---------------------------
console.log('Installing @voximplant/voxengine-ci');
try {
    execSync('npm install @voximplant/voxengine-ci', { stdio: 'inherit' });
    console.log('Voximplant CI package installed');
} catch (err) {
    console.error('Failed to install Voximplant CI:', err);
    process.exit(1);
}

// ---------------------------
// Initialize CI
// ---------------------------
console.log('Initializing Voximplant CI');
try {
    execSync(`npx voxengine-ci init`, {
        stdio: 'inherit'
    });
    console.log('Voximplant CI initialized successfully');
} catch (err) {
    console.error('Voximplant CI initialization failed:', err);
    process.exit(1);
}

// ---------------------------
// Copy application config files
// ---------------------------
const ciApplicationsDir = path.join(ciRootDir, 'applications');
const ciAppName = process.env.VOX_NEW_APP_NAME; // Application name
const accountName = process.env.VOX_ACCOUNT_NAME;   // Account name
const ciApplicationDir = path.join(ciApplicationsDir, `${ciAppName}.${accountName}.voximplant.com`);

// Create application folder if it doesn't exist
if (!fs.existsSync(ciApplicationDir)) fs.mkdirSync(ciApplicationDir, { recursive: true });

// Copy configs
['application.config.json', 'rules.config.json'].forEach(file => {
    const src = path.join(sourceApplicationDir, file);
    const dest = path.join(ciApplicationDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Config copied to CI folder: ${file}`);
});

// ---------------------------
// Copy scenario scripts
// ---------------------------
const ciScenariosDir = path.join(ciRootDir, 'scenarios', 'src');
if (!fs.existsSync(ciScenariosDir)) fs.mkdirSync(ciScenariosDir, { recursive: true });

fs.readdirSync(sourceScenariosDir).forEach(file => {
    const src = path.join(sourceScenariosDir, file);
    const dest = path.join(ciScenariosDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Scenario copied: ${file}`);
});

// ---------------------------
// Copy modules scripts
// ---------------------------
fs.readdirSync(sourceVoiceAIDir).forEach(file => {
    const src = path.join(sourceVoiceAIDir, file);
    const dest = path.join(ciScenariosDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Scenario copied: ${file}`);
});

// ---------------------------
// Upload application to Voximplant
// ---------------------------
console.log('Uploading application to Voximplant');
try {
    execSync(`npx voxengine-ci upload --application-name ${ciAppName}`, {
        stdio: 'inherit'
    });
    console.log('Application, rules, and scenarios uploaded successfully!');
} catch (err) {
    console.error('Upload failed:', err);
    process.exit(1);
}

console.log('Deployment completed successfully!');
