import { WebAudioModule } from "@webaudiomodules/api"
import { TestSuite } from "../suites/TestSuite"

export type TestResultMessage = {
    level: TestMessageLevel
    message?: string
}

type RunState = "WAITING" | "RUNNING" | "SUCCESS" | "FAIL" | "WARN"
type TestMessageLevel = "INFO" | "FAIL" | "ERROR" | "WARN"

export class TestContext {
    testName: string

    messages: TestResultMessage[]
    test: (t: TestContext) => Promise<void>
    runState: RunState
    renderCallback?: () => void
    suite: TestSuite

    constructor(suite: TestSuite, testName: string, test: (t: TestContext) => Promise<void>) {
        this.suite = suite
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

    setRunState(state: RunState) {
        this.runState = state
        if (this.renderCallback) {
            this.renderCallback()
        }
    }

    async run() {
        try {
            this.setRunState("RUNNING")

            await this.test(this)
        }
        catch(e) {
            this.fail(e as string)
        }
        finally {
            if (this.messages.some((m => m.level == "FAIL" || m.level == "ERROR"))) {
                this.setRunState("FAIL")
            } else if (this.messages.some((m => m.level == "WARN"))) {
                this.setRunState("WARN")
            } else {
                this.setRunState("SUCCESS")
            }
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

    async createInstance(): Promise<WebAudioModule> {
        let wam = await this.loadPlugin(this.suite.runner.wamUrl);

        if (!wam.isWebAudioModuleConstructor) {
            this.fail("wam.isWebAudioModuleConstructor should equal true")
            throw new Error("wam.isWebAudioModuleConstructor should equal true")
        }

        let instance = await wam.createInstance(this.suite.runner.hostGroupId, this.suite.audioContext)
        if (!instance.isWebAudioModule) {
            this.fail("instance.isWebAudioModule should equal true")
            throw new Error("instance.isWebAudioModule should equal true")
        }
        return instance
    }
}

