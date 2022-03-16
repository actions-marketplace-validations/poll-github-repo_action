import { pollFileChangesWithCore } from "../src/pollFileChanges"
import { GH_TOKEN } from "../.env.json"
import DummyGithubCore from "./dummyGithubCore"
const OWNER = "poll-github-repo"
const REPO = "dummy-repo"
const PATH = "data.txt"
import { COMMIT1, COMMIT2, COMMIT3 } from "./commits"

function setup() {
    const core = new DummyGithubCore()
    const pollFileChanges = pollFileChangesWithCore(core)
    return { core, pollFileChanges }
}

describe("when no options given", () => {
    it.concurrent("it returns all commits", async () => {
        const { core, pollFileChanges } = setup()

        const commits = await pollFileChanges({
            token: GH_TOKEN,
            owner: OWNER,
            repo: REPO,
            path: PATH
        })

        expect(commits).toEqual([COMMIT3, COMMIT2, COMMIT1])

        expect(core.messages).toEqual([
            `startGroup: Pulling commits from poll-github-repo/dummy-repo since="undefined", path="data.txt"`,
            `debug: Pulled a page with 3 commits`,
            `debug: Extracted commit {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-repo/commit/a52684431a3fda35c2ac4cde291071a3430f2268","sha":"a52684431a3fda35c2ac4cde291071a3430f2268","message":"update data.txt (three)","date":"2022-03-14T16:23:55Z"}`,
            `debug: Extracted commit {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-repo/commit/b6138d0ac3cf8fe1edc6fb48e46fefb990137746","sha":"b6138d0ac3cf8fe1edc6fb48e46fefb990137746","message":"update data.txt (two)","date":"2022-03-14T16:23:29Z"}`,
            `debug: Extracted commit {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-repo/commit/3a84a578463d2b0e7f8abf4bd7a131a4ab59adaa","sha":"3a84a578463d2b0e7f8abf4bd7a131a4ab59adaa","message":"update data.txt","date":"2022-03-14T16:23:17Z"}`,
            `endGroup`,
        ])
    })
})

describe("when SINCE specified", () => {
    it.concurrent("it returns a subset", async () => {
        const { core, pollFileChanges } = setup()

        const commits = await pollFileChanges({
            token: GH_TOKEN,
            owner: OWNER,
            repo: REPO,
            path: PATH,
            since: COMMIT2.date
        })

        expect(commits).toEqual([COMMIT3, COMMIT2])
    })
})

describe("when there are multiple pages", () => {
    it.concurrent("it still returns all commits", async () => {
        const { core, pollFileChanges } = setup()

        const commits = await pollFileChanges({
            token: GH_TOKEN,
            owner: OWNER,
            repo: REPO,
            path: PATH,
            per_page: 1
        })

        expect(commits).toEqual([COMMIT3, COMMIT2, COMMIT1])
        expect(core.messages).toEqual([
            `startGroup: Pulling commits from poll-github-repo/dummy-repo since="undefined", path="data.txt"`,
            `debug: Pulled a page with 1 commits`,
            `debug: Extracted commit {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-repo/commit/a52684431a3fda35c2ac4cde291071a3430f2268","sha":"a52684431a3fda35c2ac4cde291071a3430f2268","message":"update data.txt (three)","date":"2022-03-14T16:23:55Z"}`,
            `debug: Pulled a page with 1 commits`,
            `debug: Extracted commit {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-repo/commit/b6138d0ac3cf8fe1edc6fb48e46fefb990137746","sha":"b6138d0ac3cf8fe1edc6fb48e46fefb990137746","message":"update data.txt (two)","date":"2022-03-14T16:23:29Z"}`,
            `debug: Pulled a page with 1 commits`,
            `debug: Extracted commit {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-repo/commit/3a84a578463d2b0e7f8abf4bd7a131a4ab59adaa","sha":"3a84a578463d2b0e7f8abf4bd7a131a4ab59adaa","message":"update data.txt","date":"2022-03-14T16:23:17Z"}`,
            `debug: Pulled a page with 0 commits`,
            `endGroup`,
        ])
    })
})

describe("failures", () => {
    describe("when unknown owner given", () => {
        it.concurrent("it returns an empty commit list", async () => {
            const { core, pollFileChanges } = setup()

            const commits = await pollFileChanges({
                token: GH_TOKEN,
                owner: "definitely-unknown-user-42",
                repo: REPO,
                path: PATH
            })

            expect(commits).toEqual([])

            expect(core.messages).toEqual([
                `startGroup: Pulling commits from definitely-unknown-user-42/dummy-repo since="undefined", path="data.txt"`,
                `setFaled: Failed to pull data from GitHub: HttpError: Not Found`,
                `endGroup`,
            ])
        })
    })

    describe("when unknown repo given", () => {
        it.concurrent("it returns an empty commit list", async () => {
            const { core, pollFileChanges } = setup()

            const commits = await pollFileChanges({
                token: GH_TOKEN,
                owner: OWNER,
                repo: "unknown-repo",
                path: PATH
            })

            expect(commits).toEqual([])

            expect(core.messages).toEqual([
                `startGroup: Pulling commits from poll-github-repo/unknown-repo since="undefined", path="data.txt"`,
                `setFaled: Failed to pull data from GitHub: HttpError: Not Found`,
                `endGroup`,
            ])
        })
    })

    describe("when unknown path given", () => {
        it.concurrent("it returns an empty list of commits", async () => {
            const { core, pollFileChanges } = setup()

            const commits = await pollFileChanges({
                token: GH_TOKEN,
                owner: OWNER,
                repo: REPO,
                path: "missing.txt"
            })

            expect(commits).toEqual([])

            expect(core.messages).toEqual([
                `startGroup: Pulling commits from poll-github-repo/dummy-repo since="undefined", path="missing.txt"`,
                `debug: Pulled a page with 0 commits`,
                `endGroup`,
            ])
        })
    })

    describe("when invalid token given", () => {
        it.concurrent("it returns an empty commit list ", async () => {
            const { core, pollFileChanges } = setup()

            const commits = await pollFileChanges({
                token: "invalid-token",
                owner: OWNER,
                repo: REPO,
                path: PATH,
            })

            expect(commits).toEqual([])
            expect(core.messages).toEqual([
                `startGroup: Pulling commits from poll-github-repo/dummy-repo since="undefined", path="data.txt"`,
                `setFaled: Failed to pull data from GitHub: HttpError: Bad credentials`,
                `endGroup`,
            ])
        })
    })
})