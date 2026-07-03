const TIMEOUT = 30000;

let tokenGetter: (() => string | null) | null = null;

export const setTokenGetter = (getter: () => string | null) => {
  tokenGetter = getter;
};

const get = async (
  url: string,
  queryParams?: Record<string, unknown>,
  controller?: AbortController,
  noTimeout: boolean = false,
) => {
  let queryString;

  if (queryParams) {
    queryString = Object.entries(queryParams)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      )
      .join("&");
  }

  const fullUrl = `${url}${queryString ? `?${queryString}` : ""}`;

  if (!controller) {
    controller = new AbortController();
  }

  const method = "GET";
  const headers = await getHeaders();
  const options: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  const fetchPromise = fetch(fullUrl, options).then(__handleResponse);

  if (noTimeout) {
    return fetchPromise;
  }

  return Promise.race([fetchPromise, __timeoutPromise(controller)]).catch(
    __handleError,
  );
};

const post = async (
  url: string,
  body: unknown,
  type?: "multipart",
  controller?: AbortController,
  noTimeout: boolean = false,
) => {
  if (!controller) {
    controller = new AbortController();
  }

  const method = "POST";
  const headers = await getHeaders(type);
  const options: RequestInit = {
    method,
    headers,
    signal: controller.signal,
    body: type === "multipart" ? (body as BodyInit) : JSON.stringify(body),
  };

  const fetchPromise = fetch(url, options).then(__handleResponse);

  if (noTimeout) {
    return fetchPromise;
  }

  return Promise.race([fetchPromise, __timeoutPromise(controller)]).catch(
    __handleError,
  );
};

const patch = async (
  url: string,
  body: unknown,
  controller?: AbortController,
  noTimeout: boolean = false,
) => {
  if (!controller) {
    controller = new AbortController();
  }

  const method = "PATCH";
  const headers = await getHeaders();
  const options: RequestInit = {
    method,
    headers,
    signal: controller.signal,
    body: JSON.stringify(body),
  };

  const fetchPromise = fetch(url, options).then(__handleResponse);

  if (noTimeout) {
    return fetchPromise;
  }

  return Promise.race([fetchPromise, __timeoutPromise(controller)]).catch(
    __handleError,
  );
};

const del = async (
  url: string,
  controller?: AbortController,
  noTimeout: boolean = false,
) => {
  if (!controller) {
    controller = new AbortController();
  }

  const method = "DELETE";
  const headers = await getHeaders(undefined, method);
  const options: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  const fetchPromise = fetch(url, options).then((response) => {
    if (!response.ok) {
      return response.json().then((errorBody) => {
        return Promise.reject({
          status: response.status,
          message:
            errorBody.error ?? errorBody.message ?? "Unknown error occurred",
          code: errorBody.code,
          isKO: errorBody.isKO,
        });
      });
    }
    if (response.status === 204) return undefined;
    return response.json();
  });

  if (noTimeout) {
    return fetchPromise;
  }

  return Promise.race([fetchPromise, __timeoutPromise(controller)]).catch(
    __handleError,
  );
};

const getHeaders = async (
  type?: "multipart",
  method?: string,
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};

  if (method !== "DELETE" && type !== "multipart") {
    headers["Content-Type"] = "application/json";
  }

  const token = tokenGetter?.();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const __timeoutPromise = (controller: AbortController) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error("No hay conexión a internet"));
    }, TIMEOUT);
  });
};

const __handleResponse = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    let errorMsg = "Unknown error occurred";
    let errorCode;
    let errorIsKO;

    try {
      const errorBody = await response.json();

      if (errorBody.error) {
        errorMsg = errorBody.error;
      } else if (errorBody.message) {
        errorMsg = errorBody.message;
      }

      if (errorBody.code) {
        errorCode = errorBody.code;
      }

      if (errorBody.isKO) {
        errorIsKO = errorBody.isKO;
      }
    } catch {
      errorMsg = "Error processing response";
    }

    return Promise.reject({
      status: response.status,
      message: errorMsg,
      code: errorCode,
      isKO: errorIsKO,
    });
  }

  return response.json();
};

const __handleError = async (error: {
  status?: number;
  message?: string;
  name?: string;
  isKO?: boolean;
}) => {
  if (
    !error.status &&
    (error.name === "TypeError" || error.message === "Failed to fetch")
  ) {
    return Promise.reject({
      status: 503,
      message: "There is no internet connection",
    });
  }

  return Promise.reject(error);
};

const postBlob = async (
  url: string,
  body: unknown,
  controller?: AbortController,
  noTimeout: boolean = false,
): Promise<Response> => {
  if (!controller) {
    controller = new AbortController();
  }

  const method = "POST";
  const headers = await getHeaders();
  const options: RequestInit = {
    method,
    headers,
    signal: controller.signal,
    body: JSON.stringify(body),
  };

  const fetchPromise = fetch(url, options).then((response) => {
    if (!response.ok) {
      return response.json().then((errorBody) => {
        return Promise.reject({
          status: response.status,
          message:
            errorBody.error ?? errorBody.message ?? "Unknown error occurred",
          code: errorBody.code,
          isKO: errorBody.isKO,
        });
      });
    }
    return response;
  });

  if (noTimeout) {
    return fetchPromise;
  }

  return Promise.race([fetchPromise, __timeoutPromise(controller)]).catch(
    __handleError,
  ) as Promise<Response>;
};

export const HttpService = {
  get,
  post,
  patch,
  delete: del,
  postBlob,
};

export default HttpService;
