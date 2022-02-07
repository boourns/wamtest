import { Component, h } from "preact";
import { LoadWamTestSuite } from "../suites/LoadWamTestSuite";
import { DescriptorTestSuite } from "../suites/DescriptorTestSuite";

import { TestRunner } from "../runner/TestRunner";
import { TestSuite } from "../suites/TestSuite";
import { TestResultView } from "./TestResultView";

export interface TestRunnerProps {
    wamUrl: string
}

type TestRunnerState = {
    expanded: boolean
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
        this.state = {
            expanded: true
        }
    }

    async componentDidMount() {
        let runner = new TestRunner(this.props.wamUrl, this.audioContext)

        runner.enqueue(LoadWamTestSuite)
        runner.enqueue(DescriptorTestSuite)

        runner.renderCallback = () => {
            this.forceUpdate()
        }

        this.runner = runner
        runner.run()
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