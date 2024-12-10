import pluginPkg from '../../package.json';

export const PLUGIN_ID = pluginPkg.name.replace(/^(@[^-,.][\w,-]+\/|strapi-)plugin-/i, '');
export default PLUGIN_ID;
