import type { Core } from '@strapi/strapi';
import pluginId from '../../admin/src/pluginId';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: 'remote-select',
    plugin: pluginId,
    type: 'text',
  });

  strapi.customFields.register({
    name: 'remote-select-multi',
    plugin: pluginId,
    type: 'json',
  });

  strapi.customFields.register({
    name: 'searchable-remote-select',
    plugin: pluginId,
    type: 'text',
  });

  strapi.customFields.register({
    name: 'searchable-remote-select-multi',
    plugin: pluginId,
    type: 'json',
  });
};

export default register;
