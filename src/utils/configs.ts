type Environment = "prod" | "stage" | "dev";

type ConfigEntry = {
  key: string;
  value: string;
};

type ConfigResponse = {
  data: ConfigEntry[];
  ":expiry"?: number;
};

type HeaderScope = string;

const ALLOWED_CONFIGS: Environment[] = ["prod", "stage", "dev"];

export const calcEnvironment = (): Environment => {
  const { host, href } = window.location;

  let environment: Environment = "prod";

  if (
    href.includes(".aem.page") ||
    host.includes("staging") ||
    href.includes("hvt-eds-qa")
  ) {
    environment = "stage";
  }

  if (href.includes("localhost") || href.includes("hvt-eds-dev")) {
    environment = "dev";
  }

  const environmentFromConfig = window.sessionStorage.getItem("environment");

  if (
    environmentFromConfig &&
    ALLOWED_CONFIGS.includes(environmentFromConfig as Environment) &&
    environment !== "prod"
  ) {
    return environmentFromConfig as Environment;
  }

  return environment;
};

function buildConfigURL(): URL {
  const fileName = "configs.json";

  return new URL(`${window.location.origin}/${fileName}`);
}

const getConfigForEnvironment = async (
  environment?: Environment,
): Promise<ConfigResponse> => {
  const env = environment || calcEnvironment();

  try {
    const configJSON = window.sessionStorage.getItem(`config:${env}`);

    if (!configJSON) {
      throw new Error("No config in session storage");
    }

    const parsedConfig = JSON.parse(configJSON) as ConfigResponse;

    if (
      !parsedConfig[":expiry"] ||
      parsedConfig[":expiry"] < Math.round(Date.now() / 1000)
    ) {
      throw new Error("Config expired");
    }

    return parsedConfig;
  } catch {
    const response = await fetch(buildConfigURL());

    if (!response.ok) {
      throw new Error(`Failed to fetch config for ${env}`);
    }

    const configJSON = (await response.json()) as ConfigResponse;
    configJSON[":expiry"] = Math.round(Date.now() / 1000) + 7200;

    window.sessionStorage.setItem(`config:${env}`, JSON.stringify(configJSON));

    return configJSON;
  }
};

export const getConfigValue = async (
  configParam: string,
  environment?: Environment,
): Promise<string | undefined> => {
  const devGraphqlUrlBase = "http://localhost:3002";

  if (
    configParam === "commerce-core-endpoint" &&
    window.location.href.includes(devGraphqlUrlBase)
  ) {
    console.log("overriding graphql endpoint to use dev:proxy");
    return `${devGraphqlUrlBase}/api/graphql`;
  }

  const env = environment || calcEnvironment();
  const config = await getConfigForEnvironment(env);

  return config.data.find((configEntry) => configEntry.key === configParam)
    ?.value;
};

export const getHeaders = async (
  scope: HeaderScope,
  environment?: Environment,
): Promise<Record<string, string>> => {
  const env = environment || calcEnvironment();
  const config = await getConfigForEnvironment(env);

  const configElements = config.data.filter((entry) =>
    entry.key.includes(`headers.${scope}`),
  );

  return configElements.reduce<Record<string, string>>((headers, item) => {
    let { key } = item;

    if (key.includes(`commerce.headers.${scope}.`)) {
      key = key.replace(`commerce.headers.${scope}.`, "");
    }

    headers[key] = item.value;
    return headers;
  }, {});
};

export const getCookie = (cookieName: string): string | undefined => {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");

    if (name === cookieName) {
      return decodeURIComponent(value ?? "");
    }
  }

  return undefined;
};

export const checkIsAuthenticated = (): boolean =>
  Boolean(getCookie("auth_dropin_user_token"));

export const setCookie = (
  name: string,
  value: string,
  days = 30,
  path = "/",
): void => {
  let expires = "";

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=${path}`;
};

export function deleteCookie(cookieName: string): void {
  document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}
