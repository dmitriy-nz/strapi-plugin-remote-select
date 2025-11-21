import { StrapiApp } from '@strapi/strapi/admin';
import { Initializer } from './components/Initializer';
import { registerRemoteSelect } from './components/RemoteSelect/registerRemoteSelect';
import { registerRemoteSelectMulti } from './components/RemoteSelect/registerRemoteSelectMulti';
import { registerSearchableRemoteSelect } from './components/SearchableRemoteSelect/registerSearchableRemoteSelect';
import { registerSearchableRemoteSelectMulti } from './components/SearchableRemoteSelect/registerSearchableRemoteSelectMulti';
import { PLUGIN_ID } from './pluginId';
import { getTranslation } from './utils/getTranslation';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    registerRemoteSelect(app);
    registerRemoteSelectMulti(app);
    registerSearchableRemoteSelect(app);
    registerSearchableRemoteSelectMulti(app);
  },

  async registerTrads(app: any) {
    const { locales } = app;

    const importedTranslations = await Promise.all(
      (locales as string[]).map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: getTranslation(data),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return importedTranslations;
  },
};
