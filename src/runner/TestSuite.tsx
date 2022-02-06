import { TestContext } from "./TestContext";
import { TestRunner } from "./TestRunner";

export type TestSuiteConstructor = { 
    new (wamUrl: string): any 
    prototype: any
};

export class TestSuite {
    tests: TestContext[]
    runner: TestRunner

    constructor(runner: TestRunner, klass: TestSuiteConstructor) {
        this.runner = runner
        this.tests = []
        this.enqueue(klass)
    }

    enqueue(klass: TestSuiteConstructor) {
        let tests = Object.getOwnPropertyNames(klass.prototype).filter(n => n.startsWith("test"))

        let instance = new klass(this.runner.wamUrl)

        for (let name of tests) {
            this.tests.push(new TestContext(this.runner, name, instance[name]))
        }
    }

    async run() {
        for (let test of this.tests) {
            console.log("Running ", test.testName)
            await test.run()
        }
    }
}