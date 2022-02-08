
import { WamNode, WebAudioModule } from "@webaudiomodules/api";
import { TestContext } from "../runner/TestContext";

export class LeakDetectorTestSuite {
    wamUrl: string

    constructor(url: string) {
        this.wamUrl = url
    }

    async testLoadingWamDoesNotAddToGlobalState(t: TestContext) {
        try {
            let leaks = await this.leakCheck(t, async () => {
                await t.loadPlugin()
            })

            if (leaks.main.length > 0) {
               t.warn(`Loading plugin adds the following to main thread: ${leaks.main.join(", ")}`)
            }

            if (leaks.audio.length > 0) {
                t.warn(`Loading plugin adds the following to audio thread: ${leaks.audio.join(", ")}`)
             }


            let instance: WebAudioModule<WamNode>
            leaks = await this.leakCheck(t, async () => {
                instance = await t.createInstance()
            })

            if (leaks.main.length > 0) {
                t.warn(`creating instance adds the following to main thread: ${leaks.main.join(", ")}`)
            }

            if (leaks.audio.length > 0) {
                t.warn(`creating instance adds the following to audio thread: ${leaks.audio.join(", ")}`)
            }

            leaks = await this.leakCheck(t, async () => {
                await instance.createGui()
            })

            if (leaks.main.length > 0) {
                t.warn(`creating GUI adds the following to main thread: ${leaks.main.join(", ")}`)
            }

            if (leaks.audio.length > 0) {
                t.warn(`creating GUI adds the following to audio thread: ${leaks.audio.join(", ")}`)
            }
        }
        catch (e) {
            throw e
        }
    }

    async leakCheck(t: TestContext, fun: () => Promise<any>): Promise<{main:string[], audio: string[]}> {
        let initialWindowState = Object.keys(Object.getOwnPropertyDescriptors(window))

        let initialAudioThreadState: string[] = await t.runOnAudioThread(() => {
            return Object.keys(Object.getOwnPropertyDescriptors(globalThis))
        })
        console.log(initialAudioThreadState)

        await fun()

        let postWindowState = Object.keys(Object.getOwnPropertyDescriptors(window))

        let postAudioThreadState: string[] = await t.runOnAudioThread(() => {
            return Object.keys(Object.getOwnPropertyDescriptors(globalThis))
        })

        return {
            main: postWindowState.filter(x => !initialWindowState.includes(x)),
            audio: postAudioThreadState.filter(x => !initialAudioThreadState.includes(x))
        }
    }
    
}