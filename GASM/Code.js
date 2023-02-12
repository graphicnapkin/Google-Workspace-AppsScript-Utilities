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
    let headers, response

    if (!secretPath) {
        throw new Error('A secretPath is required for this function.')
    }

    /*  
        Get's an auth token for the effective user which is the account used
        to start the script that is leveraging this library.
    */
    try {
        headers = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
    } catch (err) {
        throw new Error('Error generating OAuth Token: ' + err.toString())
    }

    try {
        const url = `${baseUrl}${secretPath}:access`
        response = JSON.parse(UrlFetchApp.fetch(url, { headers }))
    } catch (err) {
        const errorString = err.toString()
        let message = errorString

        if (errorString.includes('code 403')) {
            message = `${Session.getEffectiveUser()} does not have access to ${secretPath} or secret does not exist.`
        }

        if (errorString.includes('code 404')) {
            message = `Secret not found. secretPath provided: ${secretPath}`
        }

        throw new Error(message)
    }

    if (!response?.payload?.data) {
        throw new Error(
            `Invalid secrets contents. Response from secrets manager: ${JSON.stringify(
                response
            )}`
        )
    }

    const secretBytes = Utilities.base64Decode(response.payload.data)
    return _byteToString(secretBytes)
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
