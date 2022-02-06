import { Component, h } from "preact";
import { TestContext } from "../runner/TestContext";

export interface TestResultViewProps {
    test: TestContext
}

export class TestResultView extends Component<TestResultViewProps, any> {
    render() {
        return <div>
            <div>{this.props.test.testName}: {this.props.test.runState}</div>
            <div>
                {this.props.test.messages.map(m => <div>{m.level}: {m.message ?? ""}</div>)}
            </div>
        </div>
    }
}