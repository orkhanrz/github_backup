const {exec} = require('child_process');
const axios = require('axios');
const CronJob = require('cron').CronJob;
require('dotenv/config');
const fs = require("fs");
const path = require('path');
const {GIT_TOKEN} = process.env;

//Options to request data from github.
const options = {
    host: 'http://api.github.com',
    path: `/user/repos?type=all`,
    method: 'GET',
    headers: {'user-agent': 'node.js', 'Authorization': `Bearer ${GIT_TOKEN}`}
};

//Get list of user's repositories.
function fetchData(){
    return axios({
        method: options.method,
        url: options.host + options.path,
        headers: options.headers
    })
    .then(res => res.data.map(d => d.clone_url))
    .then(repos => {
        console.log(repos);
        checkIfRepoExists(repos);
    });
};

//Clone repositories to repos directory.
function checkIfRepoExists(repos){
    let reposDir = path.join(__dirname,"./repos");

    if (!fs.existsSync(reposDir)) {
        fs.mkdirSync(reposDir);
    } else {
        fs.rmdirSync(reposDir, {recursive: true, force: true});
        fs.mkdirSync(reposDir);
    }
    
    cloneRepos(repos);
};

function cloneRepos(repos){
    repos.forEach(async repo => {
        let repoSplitted = repo.split('/');
        let repoName = repoSplitted[repoSplitted.length - 1].replace('.git', '');

   
        exec(`git clone ${repo} ./repos/${repoName}`, (error, stdout, stderr) => {
            if(error){
                console.log('Error: ', error);
            };
            

            if(stderr){
                console.log('StdError: ', stderr);
            };

            console.log('stdout: ', + stdout);
        });
    });
};

//Run function every 24 hours.
var job = new CronJob('0 12 00 * * *', function() {
    fetchData();
});

job.start();