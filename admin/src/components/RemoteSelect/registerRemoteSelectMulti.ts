import type { StrapiApp } from '@strapi/strapi/admin';
import pluginId from '../../pluginId';
import { getRemoteSelectRegisterOptions } from '../../utils/getRemoteSelectRegisterOptions';
import getTrad from '../../utils/getTrad';
import RemoteSelectInputIcon from '../RemoteSelectInputIcon';

export function registerRemoteSelectMulti(app: StrapiApp): void {
  app.customFields.register({
    name: 'remote-select-multi',
    pluginId: pluginId,
    type: 'json',
    intlLabel: {
      id: getTrad('remote-select-multi.label'),
      defaultMessage: 'Remote select (Multi)',
    },
    intlDescription: {
      id: getTrad('remote-select.description'),
      defaultMessage: 'Select multiple options from the remote source',
    },
    icon: RemoteSelectInputIcon,
    components: {
      Input: async () => import(/* webpackChunkName: "RemoteSelect" */ './RemoteSelect'),
    },
    options: getRemoteSelectRegisterOptions('base'),
  });
}
