import type { StrapiApp } from '@strapi/strapi/admin';
import pluginId from '../../pluginId';
import { getRemoteSelectRegisterOptions } from '../../utils/getRemoteSelectRegisterOptions';
import getTrad from '../../utils/getTrad';
import RemoteSelectInputIcon from '../RemoteSelectInputIcon';

export function registerRemoteSelect(app: StrapiApp): void {
  app.customFields.register({
    name: 'remote-select',
    pluginId: pluginId,
    type: "text",
    intlLabel: {
      id: getTrad('remote-select.label'),
      defaultMessage: 'Remote select',
    },
    intlDescription: {
      id: getTrad('remote-select.description'),
      defaultMessage: 'Select with remote options fetching',
    },
    icon: RemoteSelectInputIcon,
    components: {
      Input: async () => import(/* webpackChunkName: "RemoteSelect" */ './RemoteSelect'),
    },
    options: getRemoteSelectRegisterOptions('base'),
  });
}
