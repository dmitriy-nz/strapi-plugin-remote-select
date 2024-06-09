import type { StrapiApp } from "@strapi/admin/dist/admin/src/StrapiApp";
import { prefixPluginTranslations } from "@strapi/helper-plugin";
import pluginPkg from "../../package.json";
import Initializer from "./components/Initializer";
import { registerRemoteSelect } from "./components/RemoteSelect/registerRemoteSelect";
import { registerSearchableRemoteSelect } from "./components/SearchableRemoteSelect/registerSearchableRemoteSelect";
import pluginId from "./pluginId";

const name = pluginPkg.strapi.name;

export default {
  register(app: StrapiApp) {
    const plugin = {
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    };

    app.registerPlugin(plugin);
    registerRemoteSelect(app);
    registerSearchableRemoteSelect(app);
  },

  bootstrap(app: any) {},

  async registerTrads(app: any) {
    const { locales } = app;

    const importedTrads = await Promise.all(
      (locales as any[]).map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      }),
    );

    return Promise.resolve(importedTrads);
  },
};
