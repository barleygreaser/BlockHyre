const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies from the `node_modules`
//    that was installed for the current project context, to avoid duplicate versions.
//    (In a hoisted pnpm setup, this helps point to the root primarily)
//    We explicitly block duplicate React instances by aliasing them.
config.resolver.extraNodeModules = {
    'react': path.resolve(workspaceRoot, 'node_modules/react'),
    'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
};

module.exports = config;
