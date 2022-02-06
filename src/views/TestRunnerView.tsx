import { Component, h } from "preact";
import { LoadWamTestSuite } from "../suites/LoadWamTestSuite";
import { TestRunner } from "../runner/TestRunner";
import { TestSuite } from "../runner/TestSuite";
import { TestResultView } from "./TestResultView";

export interface TestRunnerProps {
    wamUrl: string
}

export class TestRunnerView extends Component<TestRunnerProps, any> {
    output?: HTMLDivElement
    running: boolean
    hostGroupKey?: string
    audioContext: AudioContext
    runner?: TestRunner

    constructor() {
        super()
        this.running = false
        this.audioContext = new window.AudioContext()
    }

    async componentDidMount() {
        let runner = new TestRunner(this.props.wamUrl, this.audioContext)
        await runner.initializeWamEnvironment()

        runner.enqueue(LoadWamTestSuite)
        runner.renderCallback = () => {
            this.forceUpdate()
        }

        this.runner = runner
        runner.run()
    }

    renderSuite(suite: TestSuite) {
        let results = suite.tests.map(t => <TestResultView test={t}></TestResultView>)

        return <div>
            Suite: {suite.name}
            <div>
             {results}
            </div>
        </div>
    }

    renderSuites() {
        return this.runner?.suites.map(suite => this.renderSuite(suite))
    }

    render() {
        return <div>
            <div>Testing {this.props.wamUrl}</div>
            {this.renderSuites()}
        </div>
    }
}