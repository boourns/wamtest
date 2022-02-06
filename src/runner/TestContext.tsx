import { WebAudioModule } from "@webaudiomodules/api"
import { TestRunner } from "./TestRunner"

export type TestResultMessage = {
    level: TestMessageLevel
    message?: string
}

type RunState = "WAITING" | "RUNNING" | "RAN"
type TestMessageLevel = "INFO" | "FAIL" | "ERROR" | "WARN"

export class TestContext {
    testName: string

    messages: TestResultMessage[]
    test: (t: TestContext) => Promise<void>
    runState: RunState
    renderCallback?: () => void
    runner: TestRunner

    constructor(runner: TestRunner, testName: string, test: (t: TestContext) => Promise<void>) {
        this.runner = runner
        this.testName = testName
        this.messages = []
        this.test = test
        this.runState = "WAITING"
    }

    info(message: string) {
        console.log(message)
        this.msg("INFO", message)
    }

    fail(message: string) {
        console.error(message)

        this.msg("FAIL", message)
    }

    msg(level: TestMessageLevel, message?: string) {
        this.messages.push({level, message})
        if (this.renderCallback) {
            this.renderCallback()
        }
    }

    async run() {
        try {
            this.runState = "RUNNING"

            await this.test(this)
        }
        catch(e) {
            this.fail(e as string)
        }
        finally {
            this.runState = "RAN"
        }
    }

    setRunState(state: RunState) {
        this.runState = state
        if (this.renderCallback) {
            this.renderCallback()
        }
    }

    async loadPlugin(pluginUrl: string): Promise<typeof WebAudioModule> {
        try {
            // CACHEBUSTING
            let url = `${pluginUrl}?v=${Math.random().toString(16).substr(2)}`

            const { default: WAM } = await import(
                /* webpackIgnore: true */
                url
                );

            return WAM as typeof WebAudioModule
        }
        catch (e) {
            this.fail(e as string)
            throw e
        }
    }
}

