#!/usr/bin/env node

var projectName;
var program = require('commander');

program
.arguments('<name>')
.action(function(name) {
    projectName = name;
})
.parse(process.argv);

if(typeof projectName === 'undefined') {
    console.error('Please specify the project naem');
    process.exit(1);
}

const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;
const spawn = require('cross-spawn');

const targetDir = projectName;
const targetPublicDir = path.join(projectName,'public');
const targetSrcDir = path.join(projectName,'src');

const templatesDir = path.join(__dirname,'templates');
const templateSrcDir = path.join(templatesDir,'src');

mkDir(projectName);
mkDir(targetSrcDir);
mkDir(targetPublicDir);

copyFile(path.join(templatesDir,'webpack.config.js'),path.join(targetDir,'webpack.config.js'));
copyFile(path.join(templatesDir,'.babelrc'),path.join(targetDir,'.babelrc'));
copyFile(path.join(templateSrcDir,'app.jsx'),path.join(targetSrcDir,'app.jsx'));
copyFile(path.join(templateSrcDir,'index.jsx'),path.join(targetSrcDir,'index.jsx'));

function mkDir(dir) {
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir)
    }   
}

function copyFile(source,target) {
    fs.createReadStream(source).pipe(fs.createWriteStream(target));
}

const originalWorkingDir = process.cwd();
process.chdir(projectName);

const packages = ['react','react-dom','prop-types'];
const devPackages = ['@babel/core','babel-loader','@babel/preset-react','webpack','webpack-cli','webpack-dev-server','file-loader','style-loader','css-loader','less','less-loader','html-webpack-plugin'];
const command = shouldUseYarn()? 'yarn':'npm';

init().then(function(){
    return install(packages);
}).then(function(){
    return install(devPackages,'-D');
}).then(function(){
    editPackageJson();
}).catch(err=>{
    console.log(err);
    process.exit(1);
});

function init() {
    return new Promise((resolve,reject)=>{
        var child = spawn('npm', ['init','-y'], { stdio: 'inherit' });
        child.on('close', function (code) {
            code === 0 ? resolve() : reject();
        })
    });
}

function install(packages, option) {
    return new Promise((resolve, reject) => {
        let add = option? ['add',option] : ['add'];
        let args = add.concat(packages);
        var child = spawn('yarn', args, { stdio: 'inherit' });
        child.on('close', function (code) {
            code === 0 ? resolve() : reject();
        })
    });
}

function editPackageJson() {
    let f = fs.readFileSync('package.json');  
    let json = JSON.parse(f);
    json.scripts.start = 'webpack && webpack-dev-server --open';
    fs.writeFileSync('package.json',JSON.stringify(json));
}

function shouldUseYarn() {
    try {
      exec('yarnpkg --version', { stdio: 'ignore' });
      return true;
    } catch (e) {
      return false;
    }
  }