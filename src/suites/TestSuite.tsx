import { TestContext } from "../runner/TestContext";
import { TestRunner } from "../runner/TestRunner";
import { VERSION } from "@webaudiomodules/api"
import { addFunctionModule, initializeWamEnv, initializeWamGroup } from "@webaudiomodules/sdk"
import { addTestBridge, TestBridgeNode } from "../helpers/AudioThreadTestBridge";

export type TestSuiteConstructor = { 
    new (wamUrl: string): any 
    prototype: any
};

export class TestSuite {
    audioContext!: AudioContext
    tests: TestContext[]
    runner: TestRunner
    name: string
    renderCallback?: () => void
    bridge!: TestBridgeNode

    constructor(runner: TestRunner, klass: TestSuiteConstructor) {
        this.runner = runner
        this.tests = []
        this.name = klass.name
        this.enqueue(klass)
    }

    async initializeWamEnvironment() {
        await addFunctionModule(this.audioContext!.audioWorklet, initializeWamEnv, VERSION);
        await addFunctionModule(this.audioContext!.audioWorklet, initializeWamGroup, this.runner.hostGroupId, this.runner.hostGroupKey);
        await addFunctionModule(this.audioContext!.audioWorklet, addTestBridge);
        this.bridge = new TestBridgeNode(this.audioContext!)
        
        await this.bridge.initialize()
    }

    enqueue(klass: TestSuiteConstructor) {
        let tests = Object.getOwnPropertyNames(klass.prototype).filter(n => n.startsWith("test"))

        let instance = new klass(this.runner.wamUrl)

        for (let name of tests) {
            this.tests.push(new TestContext(this, name, instance[name].bind(instance)))
        }
    }

    async run() {
        this.audioContext = new window.AudioContext()
        await this.initializeWamEnvironment()

        for (let test of this.tests) {
            console.log("Running ", test.testName)
            await test.run()

            if (this.renderCallback) {
                this.renderCallback()
            }
        }
    }
}