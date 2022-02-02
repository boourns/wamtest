import { Component, h } from "preact";
import { LoadWamTestSuite } from "../suites/LoadWamTestSuite";
import { Tester } from "./Tester";

export interface TestRunnerProps {
    wamUrl: string
}

export class TestRunner extends Component<TestRunnerProps, any> {
    output?: HTMLDivElement
    running: boolean

    constructor() {
        super()
        this.running = false
    }

    async setup(e: HTMLDivElement | null) {
        if (!e) {
            return
        }
        this.output = e
        let audioContext = new window.AudioContext()

        let tester = new Tester(this.output, audioContext)
        
        let suite = new LoadWamTestSuite(this.props.wamUrl, tester)
        
        await suite.run()

    }

    render() {
        return <div>
            <div>Testing {this.props.wamUrl}</div>
            <div ref={(e) => this.setup(e)}></div>
            
        </div>
    }
}