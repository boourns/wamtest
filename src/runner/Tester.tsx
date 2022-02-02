import { WebAudioModule } from "@webaudiomodules/api"
import {h} from "preact"

import styles from "./Tester.scss"

export type TestResult = {
    name: string
    result: "PENDING" | "SUCCESS" | "FAIL" | "ERROR" | "WARN"
    message?: string
}

export class Tester {
    output: HTMLDivElement
    audioContext: AudioContext
    results: TestResult[]

    active?: TestResult

    constructor(output: HTMLDivElement, audioContext: AudioContext) {
        this.audioContext = audioContext
        this.output = output
        this.results = []
    }

    fail(msg: string) {
        let line = document.createElement("div")
        line.setAttribute("class", styles.fail)
        line.innerText = msg
        this.active!.result = "FAIL"
        this.active!.message = msg

        this.output.appendChild(line)
    }

    success(msg: string) {
        let line = document.createElement("div")
        line.setAttribute("class", styles.success)
        line.innerText = msg

        this.output.appendChild(line)
    }

    info(msg: string) {
        let line = document.createElement("div")
        line.innerText = msg

        this.output.appendChild(line)
    }

    async run(name: string, test: () => Promise<void>) {
        try {
            this.info(`Running ${name}...`)
            let result: TestResult = {
                name: name,
                result: "PENDING",
            }
            this.active = result
            await test()
        }
        catch(e) {
            this.fail(e as string)
        }
        finally {
            if (this.active!.result == "PENDING") {
                this.active!.result = "SUCCESS"
            }
            this.logTestResult(this.active!)

            this.results.push(this.active!)
            this.active = undefined
        }
    }

    async loadPlugin(pluginUrl: string): Promise<typeof WebAudioModule> {
        try {
            // CACHEBUSTING
            let url = `${pluginUrl}?v=${Math.random().toString(16).substr(2)}`

            const { default: WAM } = await import(
                /* webpackIgnore: true */
                url
                );

            return WAM as typeof WebAudioModule
        }
        catch (e) {
            this.fail(e as string)
            throw e
        }
        
    }

    logTestResult(result: TestResult) {
        switch(result.result) {
            case "SUCCESS":
                this.success(`${result.name}: Success`)
                break
            case "FAIL":
            case "ERROR": 
                this.fail(`${result.name}: Fail`)
                break
        }
    }
}