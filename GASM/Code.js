const baseUrl = 'https://secretmanager.googleapis.com/v1/'

/**
 * Returns secret from GCP Secret Manager. 
 * The structure of secretPath is:
 * `projects/${projectId}/secrets/${secretName}/versions/${versionNumber}`
 * For more details see: 
 * https://github.com/graphicnapkin/Google-Workspace-AppsScript-Utilities/blob/main/GASM/README.md
 * @param {string}
 * @return {string} Requested Secret
**/
function getSecret(secretPath) {
    let authHeader, response, secret

    // Get's an auth token for the effective user (the account used to start the script that is leveraging this library)
    try {
        authHeader = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
    } catch (err) {
        throw new Error('Error generating OAuth Token: ' + err.toString())
    }

    try {
        const url = `${baseUrl}${secretsPath}:access`
        const params = { headers: authHeader }
        response = JSON.parse(UrlFetchApp.fetch(url, params))
    } catch (err) {
        throw new Error(
            'Error fetching secret from GCP Secrets Manager: ' + err.toString()
        )
    }

    try {
        const secretBytes = Utilities.base64Decode(response.payload.data)
        secret = _byteToString(secretBytes)
    } catch (err) {
        throw new Error('Error decoding secrets payload: ' + err.toString())
    }

    return secret
}

function _byteToString(bytes) {
    let result = ''
    for (let i = 0; i < bytes.length; ++i) {
        const byte = bytes[i]
        const text = byte.toString(16)
        result += (byte < 16 ? '%0' : '%') + text
    }

    return decodeURIComponent(result)
}

