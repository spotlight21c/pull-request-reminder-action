# pull-request-reminder-action

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Github Action for Pull request remind.
Send slack messages to remind reviewing pull requests.

## Inputs

### webhook-url

**Required** [slack webhook url](https://api.slack.com/messaging/webhooks)

### github-slack-map

A string like this "githubusername1:slackmemberid1,githubusername2:slackmemberid2,..." to define the mapping between GitHub usernames and Slack member IDs (optional). Example: "spotlight21c:UBCDEFGHI,DavideViolante:UABCDEFGH". Slack member id is not email account to login slack. [How to find slack member id?](https://www.google.com/search?q=how+to+find+slack+member+id)

## Example usage

```
on:
  schedule:
    # Every weekday every hour during working hours, send notification
    - cron: "0 10-18/1 * * 1-5"

jobs:
  pull_request_reminder_action:
    runs-on: ubuntu-latest
    steps:
      - uses: spotlight21c/pull-request-reminder-action@v1.0.1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          webhook-url: 'https://hooks.slack.com/services/...'
          github-slack-map: 'githubusername1:slackmemberid1,githubusername2:slackmemberid2'
```

This project is inspired by [DavideViolante/pr-reviews-reminder-action](https://github.com/DavideViolante/pr-reviews-reminder-action)
