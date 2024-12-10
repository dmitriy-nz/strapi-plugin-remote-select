export default [
  {
    method: 'POST',
    path: '/options-proxy',
    handler: 'FetchOptionsProxyController.index',
    config: {
      policies: [],
      auth: false,
    },
  },
];
