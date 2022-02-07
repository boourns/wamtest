import { Component, h } from "preact";
import { TestContext } from "../runner/TestContext";

export interface TestResultViewProps {
    test: TestContext
}

export class TestResultView extends Component<TestResultViewProps, any> {
    icon() {
        let style = "display: inline-block; width: 20px; height: 20px; "
        switch(this.props.test.runState) {
            case "WAITING":
                style += "background-color: grey; "
                break
            case "SUCCESS":
                style += "background-color: green; "
                break
            case "WARN":
                style += "background-color: yellow; "
                break
            case "FAIL":
                style += "background-color: red; "
                break
        }
        return <div style={style}>&nbsp;</div>
    }

    render() {
        return <div>
            <div>
                {this.icon()}{this.props.test.testName}: {this.props.test.runState}
            </div>
            <pre>
                {this.props.test.messages.map(m => <div>{m.level}: {m.message ?? ""}</div>)}
            </pre>
        </div>
    }
}