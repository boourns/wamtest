import type AudioWorkletProcessor from "@webaudiomodules/api";
import initializeWamEnv from "@webaudiomodules/api/src/AbstractWamEnv";

export const addTestBridge = () => {

    // @ts-ignore
    class TestBridgeProcessor extends AudioWorkletProcessor {
        constructor() {
            super({});

            this.port.onmessage = (ev) => {
                let message = ev.data as TestBridgeRequest

                switch(message.request) {
                    case "init":
                        this.port.postMessage({
                            response: "response",
                            id: message.id,
                            params: []
                        })
                        break
                    case "exec":
                        let code = message.params[0]
                        console.log(`(${code})()`)

                        let result = new Function(`return (${code})()`)()

                        this.port.postMessage({
                            response: "response",
                            id: message.id,
                            params: [result]
                        })
                        break

                }

            }

            this.port.postMessage({response:"hello"})
        }
    
        process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>) {
            return true
        }
    }
  
    // @ts-ignore
    registerProcessor('wamtest-TestBridgeProcessor', TestBridgeProcessor);
}

export type TestBridgeRequest = {
    id: number
    params: any[]
    request: "init" | "exec"
}

export type TestBridgeResponse = {
    id: number
    params: any[]
    response: "response" | "hello"
}

export class TestBridgeNode extends AudioWorkletNode {
    initialized: boolean
    pendingResponses: Record<number, (...args: any[]) => any>
    messageId: number

    constructor(context: AudioContext) {
        super(context, 'wamtest-TestBridgeProcessor');
        this.pendingResponses = {}
        this.messageId = 0
        this.initialized = false

        this.port.onmessage = (ev) => {
            let message = ev.data as TestBridgeResponse

            switch(message.response) {
                case "hello":
                    this.initialized = true
                    break
                case "response":
                    let response = this.pendingResponses[message.id]
                    delete this.pendingResponses[message.id]
                    response(...message.params)
                    break
            }
        }
    
    }

    async initialize() {
        if (this.initialized) {
            return true
        }

        const id = this.generateMessageId();

        return new Promise((resolve) => {
			this.pendingResponses[id] = resolve;
			this.port.postMessage({
				id,
				request: "init",
				params: [],
			});
		})

    }

    async runCodeOnAudioThread(code: () => any): Promise<any> {
        const request = 'exec';
		const id = this.generateMessageId();

		return new Promise((resolve) => {
			this.pendingResponses[id] = resolve;
			this.port.postMessage({
				id,
				request,
				params: [code.toString()],
			});
		})
    }

    generateMessageId(): number {
		return this.messageId++;
    }
}
