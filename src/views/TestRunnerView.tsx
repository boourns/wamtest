import { Component, h } from "preact";
import { LoadWamTestSuite } from "../suites/LoadWamTestSuite";
import { TestRunner } from "../runner/TestRunner";


export interface TestRunnerProps {
    wamUrl: string
}

export class TestRunnerView extends Component<TestRunnerProps, any> {
    output?: HTMLDivElement
    running: boolean
    hostGroupKey?: string
    audioContext: AudioContext

    constructor() {
        super()
        this.running = false
        this.audioContext = new window.AudioContext()
    }

    async setup(e: HTMLDivElement | null) {
        if (!e) {
            return
        }
        this.output = e

        let tester = new TestRunner(this.props.wamUrl, this.audioContext)
        tester.enqueue(LoadWamTestSuite)
        tester.renderCallback = () => {
            this.forceUpdate()
        }

        await tester.run()
    }

    render() {
        return <div>
            <div>Testing {this.props.wamUrl}</div>
            <div ref={(e) => this.setup(e)}></div>
            
        </div>
    }
}