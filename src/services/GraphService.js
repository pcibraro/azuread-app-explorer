
const graphApiUrl = "https://graph.microsoft.com/v1.0/";

export const getApps = async (accessToken, top, name) => {
  let url = graphApiUrl + "applications?$top=" + top;
  if (name) url = url + `&$filter=startswith(displayName, '${name}')`;



  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    }
  }
  );

  const apps = await response.json();

  return {
    nextLink: apps['@odata.nextLink'],
    apps: apps.value
  };
}

export const getAppsNext = async (accessToken, nextUrl) => {
  const response = await fetch(nextUrl, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    }
  }
  );

  const apps = await response.json();

  return {
    nextLink: apps['@odata.nextLink'],
    apps: apps.value
  };
}

export const getServicePrincipal = async (accessToken, appId) => {
  const url = graphApiUrl + `servicePrincipals?$filter=appId eq '${appId}'`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    }
  }
  );

  const sp = await response.json();

  return sp.value;
}

export const getAppWithPermissions = async (accessToken, id) => {
  const url = graphApiUrl + `applications/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    }
  });

  const app = await response.json();

  const sp = await getServicePrincipal(accessToken, app.appId);

  const permissionsApis = app.requiredResourceAccess
    .filter(ro => !ro.resourceAppId.startsWith("00000003"));

  const permissions = async () => Promise.all(
    permissionsApis.map(async ro => {
      const api = await getAppByAppId(accessToken, ro.resourceAppId);

      return ro.resourceAccess.map(ra => {

        if (ra.type === "Scope") {
          const scope = api[0].api.oauth2PermissionScopes.find(p => p.id === ra.id);
          return `${api[0].identifierUris[0]} (${api[0].displayName}) - Scope: ${scope.userConsentDisplayName}`
        } else if (ra.type === "Role") {
          const role = api[0].appRoles.find(r => r.id === ra.id);
          return `${api[0].identifierUris[0]} (${api[0].displayName}) - Role: ${role.displayName}`;
        }

        return "";
      });
    }));

  return {
    app,
    sp,
    permissions: await permissions()
  };
}

export const getAppByAppId = async (accessToken, appId) => {
  const url = graphApiUrl + `applications/?$filter=appId eq '${appId}'`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    }
  }
  );

  const app = await response.json();

  return app.value;
}

