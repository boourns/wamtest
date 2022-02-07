
import { TestSuite, TestSuiteConstructor } from "../suites/TestSuite"

export class TestRunner {
    wamUrl: string
    suites: TestSuite[]
    renderCallback?: () => void
    hostGroupKey: string
    hostGroupId = "wamtester"

    constructor(wamUrl: string, audioContext: BaseAudioContext) {
        this.wamUrl = wamUrl

        this.suites = []
        this.hostGroupKey = performance.now().toString()
    }

    enqueue(klass: TestSuiteConstructor) {
        this.suites.push(new TestSuite(this, klass))
    }

    async run() {

        for (let suite of this.suites) {
            suite.renderCallback = () => {
                if (this.renderCallback) {
                    this.renderCallback()
                }
            }
            await suite.run()
        }
    }
}