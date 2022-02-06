import { Component, h } from "preact";

import styles from "./Site.scss"
import { TestRunnerView } from "./TestRunnerView";

export type HTMLInputEvent = Event & {target: HTMLInputElement | null}

type SiteState = {
    state: "WAITING" | "RUNNING"
    url: string
}

export class Site extends Component<any, any> {
    constructor() {
        super()
        this.state = {

        }
    }

    urlChanged(e: HTMLInputEvent) {
        this.setState({url: e.target?.value})
    }

    runTests() {
        this.setState({state: "RUNNING"})
    }

    renderWaiting() {
        return ""
    }
    
    renderRunner() {        
        return <TestRunnerView wamUrl={this.state.url}></TestRunnerView>;
    }

    render() {
        let results
        switch(this.state.state) {
            case "WAITING":
                results = this.renderWaiting()
                break
            case "RUNNING":
                results = this.renderRunner()
                break
        }

        return <div class={styles.background}>
            <div class={styles.page}>
                <h1>WAM Tester</h1>
                <p>
                    Enter a URL for a Web Audio Module to run a test suite that checks for common problems.
                </p>
                <div class="wrapper">
                    <input type="text" class={styles.input} value={this.state.url} onChange={(e: any) => this.urlChanged(e)}></input>
                    <button class={styles.button} onClick={() => this.runTests()}>Run Tests</button>
                </div>
            </div>

            <div class={styles.results}>
                {results}
            </div>
            
        </div>
    }
}