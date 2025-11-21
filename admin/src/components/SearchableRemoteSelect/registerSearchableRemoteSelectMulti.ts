import type { StrapiApp } from '@strapi/strapi/admin';
import pluginId from '../../pluginId';
import { getRemoteSelectRegisterOptions } from '../../utils/getRemoteSelectRegisterOptions';
import getTrad from '../../utils/getTrad';
import SearchableRemoteSelectInputIcon from '../SearchableRemoteSelectInputIcon';

export function registerSearchableRemoteSelectMulti(app: StrapiApp): void {
  app.customFields.register({
    name: 'searchable-remote-select-multi',
    pluginId: pluginId,
    type: 'json',
    intlLabel: {
      id: getTrad('searchable-remote-select-multi.label'),
      defaultMessage: 'Searchable remote select (Multi)',
    },
    intlDescription: {
      id: getTrad('remote-select.description'),
      defaultMessage: 'Select multiple options from the remote source with search support',
    },
    icon: SearchableRemoteSelectInputIcon,
    components: {
      Input: async () => import(/* webpackChunkName: "SearchableRemoteSelect" */ './SearchableRemoteSelect'),
    },
    options: getRemoteSelectRegisterOptions('searchable'),
  });
}
