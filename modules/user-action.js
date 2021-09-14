const inquirer = require('inquirer')

const questions = [
    {
        type: 'input',
        name: 'source_file',
        message: 'Please copy complete path to html traktor file.'
    }

]

function selectHTMLFile() {
    return new Promise((resolve, reject) => {
        inquirer.prompt(questions)
            .then(answer => {

                return resolve(answer.source_file)
            })
            .catch(e => {
                return reject(e)
            })
    })
}




module.exports = {
    selectHTMLFile
}