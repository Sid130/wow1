const express = require('express')
const app = express()
const port = 1337;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

let commitAmount = 12;

async function getCommitAmount() {
	const { stdout } = await exec('git rev-list --count HEAD');
	return stdout;
}

async function goToGitIndex(index) {
	const target = commitAmount - index
	const gitCheckoutMaster = 'git checkout master'
	let command
	if(target > -1)
		command = `${gitCheckoutMaster} && git checkout HEAD~${target}`
	else
		command = `${gitCheckoutMaster}`

	console.log('going to git index ', target)
	const { stdout, stderr } = await exec(command);
	return { stdout, stderr};
}

app.use(express.static('public'))
app.get('/goto/:index', (req, res) => {
	goToGitIndex(req.params.index * 1)
		.then(result => res.json(result))
		.catch(error => res.json(error))
})

console.log('Resetting to `initial commit`..')
getCommitAmount().then(cAmount => {
	commitAmount = cAmount - 1;
	goToGitIndex(0)
	.then(() => {
		app.listen(port, () => console.log(`Example app listening on port ${port}!`))
	})
	.catch(error => console.error(error))
})


process.on('exit', function() {
	exec('git checkout master');
});