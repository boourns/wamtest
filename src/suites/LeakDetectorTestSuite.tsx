
import { WamNode, WebAudioModule } from "@webaudiomodules/api";
import { TestContext } from "../runner/TestContext";

export class LeakDetectorTestSuite {
    wamUrl: string

    constructor(url: string) {
        this.wamUrl = url
    }

    async testLoadingWamDoesNotAddToWindowState(t: TestContext) {
        try {
            let leaks = await this.windowLeakCheck(async () => {
                await t.loadPlugin()
            })

            if (leaks.length > 0) {
               t.warn(`Loading plugin adds the following to window: ${leaks.join(", ")}`)
            }

            let instance: WebAudioModule<WamNode>
            leaks = await this.windowLeakCheck(async () => {
               instance = await t.createInstance()
            })

            if (leaks.length > 0) {
                t.warn(`creating WAM instance adds the following to window: ${leaks.join(", ")}`)
            }

            leaks = await this.windowLeakCheck(async () => {
               await instance.createGui()
            })

            if (leaks.length > 0) {
                t.warn(`Loading plugin GUI adds the following to window: ${leaks.join(", ")}`)
             }
        }
        catch (e) {
            throw e
        }
    }

    async windowLeakCheck(fun: () => Promise<any>): Promise<string[]> {
        let initialWindowState = Object.keys(Object.getOwnPropertyDescriptors(window))

        await fun()

        let postWindowState = Object.keys(Object.getOwnPropertyDescriptors(window))
        return postWindowState.filter(x => !initialWindowState.includes(x));
    }

}