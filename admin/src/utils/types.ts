import { StrapiApp } from '@strapi/strapi/admin';

type ExtractSingleType<T> = T extends (infer U)[] ? U : T;

export type CustomField = ExtractSingleType<Parameters<StrapiApp['customFields']['register']>[0]>;

export type CustomFieldOptions = CustomField['options'];

export type CustomFieldOption = ExtractSingleType<NonNullable<CustomField['options']>['base']>;
