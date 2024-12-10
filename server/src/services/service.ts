import type { Core } from '@strapi/strapi';
import { query } from 'jsonpath';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return query({}, '$', 1)?.[0];
  },
});

export default service;
