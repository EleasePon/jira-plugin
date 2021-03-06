const cleanOptions = (options: any): void => {
  if (!!options.headers && Object.keys(options.headers).length === 0) {
    delete options.header;
  }
  if (!!options.body && Object.keys(options.body).length === 0) {
    delete options.body;
  }
  if (!!options.qs && Object.keys(options.qs).length === 0) {
    delete options.qs;
  }
};

export const patchJiraInstance = (jiraInstance: any) => {
  // custom event
  // solve this issue -> https://github.com/floralvikings/jira-connector/issues/115
  const customGetAllProjects = (opts: any, callback: any) => {
    const options = jiraInstance.project.buildRequestOptions(opts, '', 'GET');
    cleanOptions(options);
    return jiraInstance.makeRequest(options, callback);
  };
  jiraInstance.project.getAllProjects = customGetAllProjects;

  const customRequest = (method: 'GET' | 'POST', uri: string, headers?: {}, body?: {}) => {
    const options = jiraInstance.project.buildRequestOptions({}, '', method, body || {});
    for (const key of Object.keys(headers || {})) {
      if (!options.headers) {
        options.headers = {};
      }
      options.headers[key] = (<any>headers)[key];
    }
    options.uri = uri;
    cleanOptions(options);
    return jiraInstance.makeRequest(options, undefined);
  };
  jiraInstance.project.customRequest = customRequest;

  const originalRequestLib = jiraInstance.requestLib;
  const customRequestLib = (options: any) => {
    if (!!options && !!options.headers && options.headers.deleteAuth) {
      delete options.auth;
      delete options.headers.deleteAuth;
    }
    return originalRequestLib(options);
  };
  jiraInstance.requestLib = customRequestLib;
};
