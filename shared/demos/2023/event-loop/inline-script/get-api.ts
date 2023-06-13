const registeredAPIs = new Map<string, unknown>();

interface PendingAPI {
  resolve: (api: unknown) => void;
  promise: Promise<unknown>;
}

const pendingAPIs = new Map<string, PendingAPI>();

function getAPI(apiName: string): Promise<unknown> {
  if (registeredAPIs.has(apiName)) {
    return Promise.resolve(registeredAPIs.get(apiName));
  }

  if (!pendingAPIs.has(apiName)) {
    let resolve: (api: unknown) => void;
    const promise = new Promise<unknown>((r) => {
      resolve = r;
    });
    pendingAPIs.set(apiName, { resolve: resolve!, promise });
  }

  return pendingAPIs.get(apiName)!.promise;
}

function setAPI(apiName: string, api: unknown) {
  registeredAPIs.set(apiName, api);
  if (pendingAPIs.has(apiName)) {
    pendingAPIs.get(apiName)!.resolve(api);
    pendingAPIs.delete(apiName);
  }
}

self.getAPI = getAPI;
self.setAPI = setAPI;
