const core = require('@actions/core');
const { IncomingWebhook } = require('@slack/webhook');
const { default: axios } = require('axios');

const {
    getPullRequestsToReview,
    createPullRequestMapByUser,
    userMapStringToObject,
    buildMessage,
} = require('./functions');

const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_API_URL } = process.env;
const AUTH_HEADER = {
    Authorization: `token ${GITHUB_TOKEN}`,
};
const PULLS_ENDPOINT = `${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}/pulls`;

/**
 * Get pull requests from github
 */
function getPullRequests() {
    return axios.get(PULLS_ENDPOINT, {
        headers: AUTH_HEADER,
    });
}

async function main() {
    try {
        const prs = await getPullRequests();
        console.info(`${prs.data.length} prs`);

        const prsToReview = getPullRequestsToReview(prs.data);
        console.info(`${prsToReview.length} prs to review`);

        if (!prsToReview.length) {
            console.info('no pr to review');
            return;
        }

        const prByUserMap = createPullRequestMapByUser(prsToReview);

        const githubSlackUserMapString = core.getInput('github-slack-map');
        const githubSlackUserMap = userMapStringToObject(
            githubSlackUserMapString
        );

        const webhookUrl = core.getInput('webhook-url');
        const webhook = new IncomingWebhook(webhookUrl);

        const message = buildMessage(prByUserMap, githubSlackUserMap);
        console.info(JSON.stringify(message));

        const sendResult = await webhook.send(message);
        console.info(sendResult);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
