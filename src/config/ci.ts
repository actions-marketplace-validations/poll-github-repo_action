import * as core from "@actions/core"
import { Config } from "."

export function load(): Config {
    const [currentRepoOwner, currentRepo] = process.env["GITHUB_REPOSITORY"]!.split("/")
    if (!currentRepoOwner || !currentRepo) {
        core.setFailed(`$GITHUB_REPOSITORY is invalid: ${process.env["GITHUB_REPOSITORY"]}. GitHub bug?`)
        throw new Error() // core.setFailed throws an error, but TS doesn't understand it
    }
    const [repoToSyncOwner, repoToSync] = core.getInput("repo-to-sync", { required: true }).split("/")
    if (!repoToSyncOwner || !repoToSync) {
        core.setFailed(`"repo-to-sync" input must have a "owner/repo" format, got ${repoToSyncOwner}/${repoToSync}`)
        throw new Error() // core.setFailed throws an error, but TS doesn't understand it
    }

    return {
        token: core.getInput("token", { required: true }),
        currentRepoOwner,
        currentRepo,
        currentRepoCachePath: core.getInput("cache-path", { required: true }),
        currentRepoLabelToAdd: core.getInput("issue-label", { required: true }),
        repoToSyncOwner: repoToSyncOwner,
        repoToSync: repoToSync,
        repoToSyncPath: core.getInput("path-to-sync", { required: true }),
        trackingIssueTemplateTitle: core.getInput("tracking-issue-title", { required: true }),
        trackingIssueTemplateBody: core.getInput("tracking-issue-body", { required: true })
    }
}