import { addFunctionModule, initializeWamEnv, initializeWamGroup } from "@webaudiomodules/sdk";
import { WebAudioModule } from "@webaudiomodules/api";
import { VERSION } from "@webaudiomodules/api";

import { Tester } from "../runner/Tester";

const hostGroupId = "wamtest.info"

export class LoadWamTestSuite {
    wamUrl: string
    tester: Tester
    hostGroupKey?: string
    wam: WebAudioModule

    constructor(url: string, tester: Tester) {
        this.wamUrl = url
        this.tester = tester
    }

    async initializeWamEnvironment() {
        this.hostGroupKey = performance.now().toString();

        await addFunctionModule(this.tester.audioContext.audioWorklet, initializeWamEnv, VERSION);
        await addFunctionModule(this.tester.audioContext.audioWorklet, initializeWamGroup, hostGroupId, this.hostGroupKey);
    }

    async testLoadsWithoutError() {
        try {
            let wam = await this.tester.loadPlugin(this.wamUrl);

            if (!wam.isWebAudioModuleConstructor) {
                this.tester.fail("wam.isWebAudioModuleConstructor should equal true")
            }

            let instance = await wam.createInstance(hostGroupId, this.tester.audioContext)
            if (!instance.isWebAudioModule) {
                this.tester.fail("instance.isWebAudioModule should equal true")
            }
            let descriptor = instance.descriptor
            this.tester.info(`Descriptor: ${JSON.stringify(descriptor)}`)

        }
        catch (e) {
            throw e
        }
    }

    async run() {
        try {
            await this.tester.run("initializeWamEnvironment", this.initializeWamEnvironment.bind(this))
            await this.tester.run("testLoadsWithoutError", this.testLoadsWithoutError.bind(this))
        }
        catch (e) {
            this.tester.fail("Error: " + e)
        }
    }
}