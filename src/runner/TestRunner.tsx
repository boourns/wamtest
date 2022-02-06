import { VERSION } from "@webaudiomodules/api"
import { addFunctionModule, initializeWamEnv, initializeWamGroup } from "@webaudiomodules/sdk"
import { TestSuite, TestSuiteConstructor } from "./TestSuite"

export class TestRunner {
    audioContext: BaseAudioContext
    wamUrl: string
    suites: TestSuite[]
    renderCallback?: () => void
    hostGroupKey: string
    hostGroupId = "wamtester"

    constructor(wamUrl: string, audioContext: BaseAudioContext) {
        this.wamUrl = wamUrl
        this.audioContext = audioContext

        this.suites = []
        this.hostGroupKey = performance.now().toString()
    }

    async initializeWamEnvironment() {
        await addFunctionModule(this.audioContext.audioWorklet, initializeWamEnv, VERSION);
        await addFunctionModule(this.audioContext.audioWorklet, initializeWamGroup, this.hostGroupId, this.hostGroupKey);
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