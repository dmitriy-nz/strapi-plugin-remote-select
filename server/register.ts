import { Strapi } from "@strapi/strapi";
import pluginId from "../admin/src/pluginId";

export default ({ strapi }: { strapi: Strapi }) => {
  strapi.customFields.register({
    name: "remote-select",
    plugin: pluginId,
    type: "text",
  });

  strapi.customFields.register({
    name: "searchable-remote-select",
    plugin: pluginId,
    type: "text",
  });
};
