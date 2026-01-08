const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Try to resolve exclusionList from metro-config, handling different paths
let exclusionList;
try {
    exclusionList = require('metro-config/src/defaults/exclusionList');
} catch (e) {
    try {
        exclusionList = require('metro-config/src/defaults/blacklist');
    } catch (e2) {
        // Fallback if not found
        exclusionList = (items) => new RegExp(items.join('|'));
    }
}

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// Robustly escape path for Regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
}

const gestureHandlerPath = path.resolve(projectRoot, 'node_modules', 'react-native-gesture-handler');
const safeAreaContextPath = path.resolve(projectRoot, 'node_modules', 'react-native-safe-area-context');

// We can block them if they match the *project* node_modules path
// Note: windows paths use backslashes, so we need to be careful with regex
config.resolver.blockList = exclusionList([
    new RegExp(`${escapeRegExp(gestureHandlerPath)}.*`),
    new RegExp(`${escapeRegExp(safeAreaContextPath)}.*`),
]);

config.resolver.extraNodeModules = {
    'react': path.resolve(workspaceRoot, 'node_modules/react'),
    'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
    'react-native-url-polyfill': path.resolve(workspaceRoot, 'node_modules/react-native-url-polyfill'),
    '@supabase/supabase-js': path.resolve(workspaceRoot, 'node_modules/@supabase/supabase-js'),
    'react-native-gifted-chat': path.resolve(workspaceRoot, 'node_modules/react-native-gifted-chat'),
    'react-native-gesture-handler': path.resolve(workspaceRoot, 'node_modules/react-native-gesture-handler'),
    'react-native-reanimated': path.resolve(workspaceRoot, 'node_modules/react-native-reanimated'),
    'react-native-safe-area-context': path.resolve(workspaceRoot, 'node_modules/react-native-safe-area-context'),
};

module.exports = config;
