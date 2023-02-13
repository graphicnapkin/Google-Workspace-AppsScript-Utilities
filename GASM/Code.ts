const baseUrl = 'https://secretmanager.googleapis.com/v1/'

/**
 * Returns secret from GCP Secret Manager.
 * The structure of secretPath is:
 * `projects/${projectId}/secrets/${secretName}/versions/${versionNumber}`
 * For more details see:
 * https://github.com/graphicnapkin/Google-Workspace-AppsScript-Utilities/blob/main/GASM/README.md
 * @param {string} secretPath
 * @return {string} Requested Secret
 **/
function getSecret(secretPath: string): string {
    if (!secretPath) {
        throw new Error('A secretPath is required for this function.')
    }

    /*  
        Get's an auth token for the effective user which is the account used
        to start the script that is leveraging this library.
    */
    let token: string
    try {
        token = ScriptApp.getOAuthToken()
    } catch (err) {
        throw new Error('Error generating OAuth Token: ' + err.toString())
    }

    const headers = { Authorization: 'Bearer ' + token }
    const url = `${baseUrl}${secretPath}:access`

    let data: { payload?: { data?: string } }
    try {
        const response = UrlFetchApp.fetch(url, { headers })
        data = JSON.parse(response.getContentText())
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

    const encodedSecret = data?.payload?.data
    if (!encodedSecret) {
        throw new Error(
            `Invalid secrets contents. Response from secrets manager: 
            ${JSON.stringify(data)}`
        )
    }

    const secretBytes = Utilities.base64Decode(encodedSecret)
    return _byteToString(secretBytes)
}

function _byteToString(bytes: number[]): string {
    let result = ''
    for (let i = 0; i < bytes.length; ++i) {
        const byte = bytes[i]
        const text = byte.toString(16)
        result += (byte < 16 ? '%0' : '%') + text
    }

    return decodeURIComponent(result)
}

/**
 * Uses secret stored in GCP Secrets Manager with provided callback function.
 * Secret is referenced by the secretPath
 * The structure of secretPath is:
 * `projects/${projectId}/secrets/${secretName}/versions/${versionNumber}`
 * *
 * The callbacks first argument should be the secret that will be used.
 * For more details see:
 * https://github.com/graphicnapkin/Google-Workspace-AppsScript-Utilities/blob/main/GASM/README.md
 * @param {string} secretPath
 * @param {Function} callbackFunction
 * @param {any[]} callbackArguments
 * @return {*}
 **/
function useSecret(
    secretPath: string,
    callbackFunction: (secret: string, ...args: any) => any,
    callbackArguments: any[]
): any {
    const secret = getSecret(secretPath)
    const response = callbackFunction(secret, ...callbackArguments)

    if (JSON.stringify(response).includes(secret)) {
        throw new Error('Function response included the secrets content')
    }
    return response
}
