const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const exec = require('child_process').exec;

const app = express();
const PORT = 3333;

// GitHub sends the payload as JSON
app.use(bodyParser.json());

// Secret for GitHub webhook
const WEBHOOK_SECRET = 'NutMilk!';

function computeSignature(body) {
    const hmac = crypto.createHmac('sha1', WEBHOOK_SECRET);
    return `sha1=${hmac.update(JSON.stringify(body)).digest('hex')}`;
}

app.post('/webhook', (req, res) => {
    console.log('Received webhook request');

    // Verify the signature
    const theirSignature = req.headers['x-hub-signature'];
    const ourSignature = computeSignature(req.body);

    if (theirSignature !== ourSignature) {
        console.error('Invalid signature.');
        return res.status(403).send('Invalid signature.');
    }

    // Check if the push is from the main branch (adapt as necessary)
    if (req.body.ref === 'refs/heads/main') {
        console.log('Deploying new version of the app...');

        exec('echo "----- Run started at $(date) -----" >> log.txt && ansible-playbook -i host.ini update_website.yml >> log.txt 2>&1', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).send('Failed to execute Ansible playbook.');
            }
	  console.log(`Ansible Output: ${stdout}`);
            return res.sendStatus(200);
        });

        // Respond to GitHub
        res.sendStatus(200);
    } else {
        console.log('Not main branch, no action taken');
        res.sendStatus(200);
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
