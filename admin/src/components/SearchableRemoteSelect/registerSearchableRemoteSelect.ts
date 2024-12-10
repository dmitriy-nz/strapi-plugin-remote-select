import type { StrapiApp } from '@strapi/strapi/admin';
import pluginId from '../../pluginId';
import { getRemoteSelectRegisterOptions } from '../../utils/getRemoteSelectRegisterOptions';
import getTrad from '../../utils/getTrad';
import SearchableRemoteSelectInputIcon from '../SearchableRemoteSelectInputIcon';

export function registerSearchableRemoteSelect(app: StrapiApp): void {
  app.customFields.register({
    name: 'searchable-remote-select',
    pluginId: pluginId,
    type: 'json',
    intlLabel: {
      id: getTrad('searchable-remote-select.label'),
      defaultMessage: 'Searchable remote select',
    },
    intlDescription: {
      id: getTrad('remote-select.description'),
      defaultMessage: 'Select options from the remote source with search support',
    },
    icon: SearchableRemoteSelectInputIcon,
    components: {
      Input: async () => import(/* webpackChunkName: "RemoteSelect" */ './SearchableRemoteSelect'),
    },
    options: getRemoteSelectRegisterOptions('searchable'),
  });
}
