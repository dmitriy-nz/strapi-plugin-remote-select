import * as yup from 'yup';

export const RemoteSelectFetchOptionsSchema = yup.object().shape({
  fetch: yup.object().shape({
    url: yup.string().required(),
    headers: yup.string().optional(),
    body: yup.string().optional(),
  }),
  mapping: yup.object().shape({
    sourceJsonPath: yup.string().required(),
    valueJsonPath: yup.string().optional(),
  }),
});
