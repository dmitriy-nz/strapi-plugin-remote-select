import { Strapi } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { RemoteSelectFetchOptions } from "../../types/RemoteSelectFetchOptions";
import OptionsProxyService from "../services/OptionsProxy.service";
import { RemoteSelectFetchOptionsSchema } from "../validation/RemoteSelectFetchOptions.schema";

const { ValidationError } = errors;
export default ({ strapi }: { strapi: Strapi }) => ({
  async index(ctx: any): Promise<void> {
    try {
      /**
       * Represents the configuration for a flexible select options fetch.
       */
      const flexibleSelectConfig =
        (await RemoteSelectFetchOptionsSchema.validate(ctx.request.body, {
          strict: true,
          stripUnknown: true, // Removing unknown fields
          abortEarly: false, // Returning all errors
        })) as any as RemoteSelectFetchOptions;

      ctx.body = await (
        strapi
          .plugin("remote-select")
          .service("OptionsProxyService") as ReturnType<
          typeof OptionsProxyService
        >
      ).getOptionsByConfig(flexibleSelectConfig);
    } catch (error) {
      // Handling error
      if (error.name === "ValidationError")
        throw new ValidationError("Validation error", error.errors); // Throwing validation error
      throw error; // Throwing error
    }
  },
});
