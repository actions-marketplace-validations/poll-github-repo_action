import * as github from "@actions/github"

export interface Core {
    startGroup(message: string): void
    debug(message: string): void
    setFailed(message: string): void
    endGroup(): void
}

interface Params {
    token: string
    owner: string
    repo: string
    path: string
    since?: string
    per_page?: number
}

export interface Commit {
    path: string
    url: string
    sha: string
    message: string
    date: string
}

export function pollFileChangesWithCore(core: Core) {
    return async function pollFileChanges(params: Params): Promise<Commit[]> {
        const { token, owner, repo, path, since, per_page } = params
        const octokit = github.getOctokit(token)

        const iterator = octokit.paginate.iterator(
            octokit.rest.repos.listCommits,
            {
                owner,
                repo,
                since,
                path,
                per_page
            }
        )
        const result: Commit[] = []

        core.startGroup(`Pulling commits from ${owner}/${repo} since="${since}", path="${path}"`)
        try {
            for await (const { data } of iterator) {
                core.debug(`Pulled a page with ${data.length} commits`)
                for (const commitData of data) {
                    let commit: Commit = {
                        path,
                        url: commitData.html_url,
                        sha: commitData.sha,
                        message: commitData.commit.message,
                        date: commitData.commit.author.date
                    }
                    core.debug(`Extracted commit ${JSON.stringify(commit)}`)
                    result.push(commit)
                }
            }
        } catch (err) {
            core.setFailed(`Failed to pull data from GitHub: ${err}`)
        }
        core.endGroup()
        return result
    }
}