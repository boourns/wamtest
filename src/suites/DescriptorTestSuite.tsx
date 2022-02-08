
import { TestContext } from "../runner/TestContext";
import Joi from "joi"

const validApiVersions = [
    "2.0.0-alpha.3"
]

export class DescriptorTestSuite {
    wamUrl: string

    constructor(url: string) {
        this.wamUrl = url
    }

    async testDescriptorSchema(t: TestContext) {
        try {
            let instance = await t.createInstance()
            let descriptor = instance.descriptor

            let schema = this.descriptorSchema()

            const { error, value } = schema.validate(descriptor);
            if (error != undefined) {
                t.fail(error.message)
                return
            }
        }
        catch (e) {
            throw e
        }
    }

    async testDescriptorVersion(t: TestContext) {
        let instance = await t.createInstance()
        let descriptor = instance.descriptor

        if (!validApiVersions.some(v => v === descriptor.apiVersion)) {
            t.fail(`descriptor.apiVersion value ${descriptor.apiVersion} must be one of: ${validApiVersions.join(",")}`)
        }

        // TODO: read back API version from WAM instance and confirm it's valid as well.
    }

    async testThumbnail(t: TestContext) {
        let instance = await t.createInstance()
        let descriptor = instance.descriptor

        if (!descriptor.thumbnail || descriptor.thumbnail === "") {
            t.info("descriptor.thumbnail not set, skipping thumbnail check")
            return
        }

        let thumbnailUrl = new URL(descriptor.thumbnail, this.wamUrl)
        let thumbnailLoads = await this.checkImage(thumbnailUrl.toString())

        if (!thumbnailLoads) {
            t.fail(`Thumbnail URL ${thumbnailUrl} failed to load`)
        }
    }

    checkImage(url: string): Promise<boolean> {
        if (!url || typeof url !== 'string') return Promise.resolve(false);
        return new Promise((resolve) => {
          const imgElement = new Image();
          imgElement.addEventListener('load', () => resolve(true));
          imgElement.addEventListener('error', () => resolve(false));
          imgElement.src = url;
        });
      }

    descriptorSchema() {
        // updated to match 2.0.0-alpha.3

        return Joi.object({
            hasAudioInput: Joi.boolean(),
            hasAudioOutput: Joi.boolean(),
            hasMidiInput: Joi.boolean(),
            hasMidiOutput: Joi.boolean(),
            hasSysexInput: Joi.boolean(),
            hasSysexOutput: Joi.boolean(),
            hasOscInput: Joi.boolean(),
            hasOscOutput: Joi.boolean(),
            hasMpeInput: Joi.boolean(),
            hasMpeOutput: Joi.boolean(),
            hasAutomationInput: Joi.boolean(),
            hasAutomationOutput: Joi.boolean(),
            name: Joi.string().required(),
            vendor: Joi.string().required(),
            version: Joi.string().required(),
            apiVersion: Joi.string().required(),
            thumbnail: Joi.string().required(),
            keywords: Joi.array().items(Joi.string()),
            isInstrument: Joi.boolean(),
            description: Joi.string().required(),
            website: Joi.string(),
        })
    }
}