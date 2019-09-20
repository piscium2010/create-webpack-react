#!/usr/bin/env node
var projectName;
var program = require('commander');

program
    .arguments('<name>')
    .action(function (name) {
        projectName = name;
    })
    .parse(process.argv);

if (typeof projectName === 'undefined') {
    console.error('Please specify the project naem');
    process.exit(1);
}

const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn');

const targetDir = projectName;
const targetPublicDir = path.join(projectName, 'public');
const targetSrcDir = path.join(projectName, 'src');

const templatesDir = path.join(__dirname, 'templates');
const templateSrcDir = path.join(templatesDir, 'src');

mkDir(projectName);
mkDir(targetSrcDir);
mkDir(targetPublicDir);

copyFile(path.join(templatesDir, 'webpack.common.js'), path.join(targetDir, 'webpack.common.js'));
copyFile(path.join(templatesDir, 'webpack.dev.js'), path.join(targetDir, 'webpack.dev.js'));
copyFile(path.join(templatesDir, 'webpack.prod.js'), path.join(targetDir, 'webpack.prod.js'));
copyFile(path.join(templatesDir, 'index.html'), path.join(targetDir, 'index.html'));
copyFile(path.join(templatesDir, '.babelrc'), path.join(targetDir, '.babelrc'));
// copyFile(path.join(templateSrcDir, 'app.jsx'), path.join(targetSrcDir, 'app.jsx'));
// copyFile(path.join(templateSrcDir, 'app.less'), path.join(targetSrcDir, 'app.less'));
try {
    fs.copySync(templateSrcDir, targetSrcDir)
    console.log('success!')
} catch (err) {
    console.error(err)
}


process.chdir(projectName);

const packages = ['react', 'react-dom', 'react-router-dom'];
const devPackages = [
    "@babel/cli",
    "@babel/core",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-syntax-object-rest-spread",
    "@babel/plugin-proposal-decorators",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/preset-react",
    "babel-loader",
    "clean-webpack-plugin",
    "css-loader",
    "file-loader",
    "html-loader",
    "html-webpack-plugin",
    "less",
    "less-loader",
    "less-plugin-clean-css",
    "mini-css-extract-plugin",
    "optimize-css-assets-webpack-plugin",
    "style-loader",
    "terser-webpack-plugin",
    "url-loader",
    "webpack",
    "webpack-cli",
    "webpack-dev-server",
    "webpack-merge"
];

init().then(function () {
    return install(packages, '-S');
}).then(function () {
    return install(devPackages, '-D');
}).then(function () {
    editPackageJson();
}).catch(err => {
    console.log(err);
    process.exit(1);
});

function copyFile(source, target) {
    fs.createReadStream(source).pipe(fs.createWriteStream(target, { flags: 'w+' }));
}

function editPackageJson() {
    let f = fs.readFileSync('package.json');
    let json = JSON.parse(f);
    json.scripts.start = 'webpack-dev-server --config webpack.dev.js --open';
    json.scripts.build = 'webpack --config webpack.prod.js';
    delete json.main
    fs.writeFileSync('package.json', JSON.stringify(json, null, '\t'));
}

function init() {
    return new Promise((resolve, reject) => {
        var child = spawn('npm', ['init', '-y'], { stdio: 'inherit' });
        child.on('close', function (code) {
            code === 0 ? resolve() : reject();
        })
    });
}

function install(packages, option) {
    return new Promise((resolve, reject) => {
        let add = option ? ['install', option] : ['install'];
        let args = add.concat(packages);
        var child = spawn('npm', args, { stdio: 'inherit' });
        child.on('close', function (code) {
            code === 0 ? resolve() : reject();
        })
    });
}

function mkDir(dir) { if (!fs.existsSync(dir)) { fs.mkdirSync(dir) } }
