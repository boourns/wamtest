
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
            let wam = await t.loadPlugin();

            if (!wam.isWebAudioModuleConstructor) {
                t.fail("wam.isWebAudioModuleConstructor should equal true")
            }

            let instance = await wam.createInstance(t.suite.runner.hostGroupId, t.suite.audioContext)
            if (!instance.isWebAudioModule) {
                t.fail("instance.isWebAudioModule should equal true")
            }
            let descriptor = instance.descriptor
            t.info(`Descriptor: ${JSON.stringify(descriptor, undefined, 4)}`)

        }
        catch (e) {
            throw e
        }
    }

    async guiLoadsWithoutError(t: TestContext) {
        try {
            let instance = await t.createInstance()
            let gui = await instance.createGui()
            if (!!gui) {
                t.fail("gui failed to load")
            }
        }
        catch (e) {
            throw e
        }
    }
}