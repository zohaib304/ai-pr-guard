import * as core from '@actions/core'
import * as github from '@actions/github'

export async function run() {
  try {
    // Must match action.yml input id exactly
    const token = core.getInput('github_token', { required: true }) // or 'github-token'
    const octokit = github.getOctokit(token)

    const { owner, repo } = github.context.repo

    // pull_request is an object; .number is the PR number
    const prNumber = github.context.payload.pull_request?.number ?? github.context.payload.number

    if (!prNumber) {
      core.setFailed('This action must run on pull_request events.')
      return
    }

    const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100
    })

    const body = [
      '## AI PR Guard',
      '',
      `PR: #${prNumber}`,
      `Changed files: ${files.length}`
    ].join('\n')

    core.setOutput('comment_body', body)
    core.info(`Computed report for ${owner}/${repo}#${prNumber}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
