import { Component, h } from "preact";
import { LoadWamTestSuite } from "../suites/LoadWamTestSuite";
import { DescriptorTestSuite } from "../suites/DescriptorTestSuite";

import { TestRunner } from "../runner/TestRunner";
import { TestSuite } from "../suites/TestSuite";
import { TestResultView } from "./TestResultView";
import { LeakDetectorTestSuite } from "../suites/LeakDetectorTestSuite";

export interface TestRunnerProps {
    wamUrl: string
    runId: number
}

type TestRunnerState = {
    expanded: boolean
    wamUrl: string
    runId: number
}

export class TestRunnerView extends Component<TestRunnerProps, any> {
    output?: HTMLDivElement
    running: boolean
    hostGroupKey?: string
    audioContext!: AudioContext
    runner?: TestRunner

    constructor() {
        super()
        this.running = false
        this.state = {
            expanded: true,
            runId: -1,
            wamUrl: ""
        }
    }

    async componentDidMount() {
        if (this.props.wamUrl != this.state.wamUrl || this.props.runId != this.state.runId) {
           await this.startTests()
        }
    }

    async startTests() {
        this.audioContext = new window.AudioContext()

        let runner = new TestRunner(this.props.wamUrl, this.audioContext)

        runner.enqueue(LeakDetectorTestSuite)
        runner.enqueue(LoadWamTestSuite)
        runner.enqueue(DescriptorTestSuite)

        runner.renderCallback = () => {
            this.forceUpdate()
        }

        this.runner = runner
        runner.run()

        this.setState({
            runId: this.props.runId,
            wamUrl: this.props.wamUrl
        })
    }

    renderSuite(suite: TestSuite) {
        let results = suite.tests.map(t => <TestResultView test={t}></TestResultView>)

        return <div>
            <b>Suite: {suite.name}</b>
            <div style="padding-left: 20px; padding-top: 5px;">
             {this.state.expanded && results}
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