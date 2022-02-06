
import { TestContext } from "../runner/TestContext";

const hostGroupId = "wamtest.info"

export class LoadWamTestSuite {
    wamUrl: string
    hostGroupKey?: string

    constructor(url: string) {
        this.wamUrl = url
    }

    async testLoadsWithoutError(t: TestContext) {
        try {
            let wam = await t.loadPlugin(this.wamUrl);

            if (!wam.isWebAudioModuleConstructor) {
                t.fail("wam.isWebAudioModuleConstructor should equal true")
            }

            let instance = await wam.createInstance(t.runner.hostGroupId, t.runner.audioContext)
            if (!instance.isWebAudioModule) {
                t.fail("instance.isWebAudioModule should equal true")
            }
            let descriptor = instance.descriptor
            t.info(`Descriptor: ${JSON.stringify(descriptor)}`)

        }
        catch (e) {
            throw e
        }
    }
}