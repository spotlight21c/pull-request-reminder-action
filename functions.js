const REVIEW_REQUESTED_URL = 'https://github.com/pulls/review-requested';

/**
 * Get Pull Requests To Review(Pull requests that have requested reviewers or requested teams)
 * @param {array} prs
 * @returns {array}
 */
function getPullRequestsToReview(prs) {
    return prs.filter(
        (pr) => pr.requested_reviewers?.length || pr.requested_teams?.length
    );
}

/**
 * create pull request map by user
 * ('User1', [pr, pr, pr])
 * ('User2', [pr])
 * ('User3', [pr, pr])
 * ('Team1', [pr, pr])
 */
function createPullRequestMapByUser(prs) {
    const map = new Map();

    prs.forEach((pr) => {
        if (pr.requested_reviewers) {
            pr.requested_reviewers.forEach((reviewer) => {
                if (map.has(reviewer.login)) {
                    const prs = map.get(reviewer.login);
                    prs.push(pr);
                } else {
                    map.set(reviewer.login, [pr]);
                }
            });
        }

        if (pr.requested_teams) {
            pr.requested_teams.forEach((reviewer) => {
                if (map.has(reviewer.slug)) {
                    const prs = map.get(reviewer.slug);
                    prs.push(pr);
                } else {
                    map.set(reviewer.slug, [pr]);
                }
            });
        }
    });

    return map;
}

/**
 *
 * @param {string} reviewer
 * @param {number} prCount
 * @returns {object}
 */
function buildReviewerBlock(reviewer, prCount) {
    const fireEmoji = Array(prCount).fill(':fire:').join('');

    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `*${reviewer}*\n${fireEmoji}`,
        },
        accessory: {
            type: 'button',
            text: {
                type: 'plain_text',
                emoji: true,
                text: `${prCount}건`,
            },
        },
    };
}

/**
 * build slack message
 */
function buildMessage(prMap, githubSlackUserMap) {
    const headerBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `*리뷰부탁드립니다* :man-bowing: <${REVIEW_REQUESTED_URL}|리뷰하러가기>`,
        },
    };

    const dividerBlock = {
        type: 'divider',
    };

    const reviewerPrCountObj = {};
    for (const [githubUserName, prs] of prMap) {
        reviewerPrCountObj[
            githubSlackUserMap[githubUserName]
                ? `<@${githubSlackUserMap[githubUserName]}>`
                : `@${githubUserName}`
        ] = prs.length;
    }

    const reviewerBlocks = [];
    for (const reviewer in reviewerPrCountObj) {
        reviewerBlocks.push(
            buildReviewerBlock(reviewer, reviewerPrCountObj[reviewer])
        );
    }

    const blocks = {
        blocks: [headerBlock, dividerBlock, ...reviewerBlocks, dividerBlock],
    };

    return blocks;
}

/**
 * githubusername:slackmemberid map string to object
 * @param {string} str
 * @returns {object}
 */
function userMapStringToObject(str) {
    const obj = {};

    if (!str) {
        return obj;
    }

    const users = str.split(',');
    users.forEach((user) => {
        const [githubUserName, slackUserId] = user.split(':');
        obj[githubUserName] = slackUserId;
    });

    return obj;
}

module.exports = {
    getPullRequestsToReview,
    createPullRequestMapByUser,
    buildReviewerBlock,
    buildMessage,
    userMapStringToObject,
};
