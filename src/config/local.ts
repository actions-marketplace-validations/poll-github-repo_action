import { join } from "path"
import * as fs from "fs"
import { Config } from "."

export async function load(): Promise<Config> {
    const configPath = join(__dirname, "..", "..", ".env.json")

    const configContent = await fs.promises.readFile(configPath)
    const maybeConfig = JSON.parse(configContent.toString())
    return validations.validateConfig(maybeConfig)
}

namespace validations {
    export function validateConfig(config: any): Config {
        if (typeof (config) !== "object") {
            formatErr("expected JSON to contain an object")
        }

        const {
            token,
            currentRepoOwner,
            currentRepo,
            currentRepoCachePath,
            currentRepoLabelToAdd,
            repoToSyncOwner,
            repoToSync,
            repoToSyncPath,
            trackingIssueTemplateTitle,
            trackingIssueTemplateBody,
        } = config

        if (!isString(token)) stringErr("token")
        if (!isString(currentRepoOwner)) stringErr("currentRepoOwner")
        if (!isString(currentRepo)) stringErr("currentRepo")
        if (!isString(currentRepoCachePath)) stringErr("currentRepoCachePath")
        if (!isString(currentRepoLabelToAdd)) stringErr("currentRepoLabelToAdd")
        if (!isString(repoToSyncOwner)) stringErr("repoToSyncOwner")
        if (!isString(repoToSync)) stringErr("repoToSync")
        if (!isString(repoToSyncPath)) stringErr("repoToSyncPath")
        if (!isString(trackingIssueTemplateTitle)) stringErr("trackingIssueTemplateTitle")
        if (!isString(trackingIssueTemplateBody)) stringErr("trackingIssueTemplateBody")

        return {
            token,
            currentRepoOwner,
            currentRepo,
            currentRepoCachePath,
            currentRepoLabelToAdd,
            repoToSyncOwner,
            repoToSync,
            repoToSyncPath,
            trackingIssueTemplateTitle,
            trackingIssueTemplateBody,
        }
    }

    function isString(value: any): value is string {
        return typeof (value) === "string"
    }

    function formatErr(message: string): never {
        throw new Error(`Your .json.env file is malformed: ${message}`)
    }

    function stringErr(...path: string[]): never {
        const jsonPath = path.map(part => `["${part}"]`).join("")
        formatErr(`${jsonPath} must be a string`)
    }
}