/**
 * Returns secret from GCP Secret Manager. To use this, you will need to create a GCP project, then a secret in Secrets Manager
 * The first part of the secrets path will be visible under the secret name and is found by creating the secret, clicking on the name of the secret.
 * On the same page you will see which version number you would like to access. The end result should be:
 * projects/\<project_id\>/secrets/\<secret_name\>/versions/\<version_number\>
 *
 * Access to each secret is granted by ensuring the account using this script has the "Secret Manager Secret Accessor"
 * permission for this secret in the GCP console.
 * @param {string}
 * @return {string} Requested Secret
 */
function getSecret(secretsPath) {
    let authHeader, response, secret

    // Get's an auth token for the effective user (the account used to start the script that is leveraging this library)
    try {
        authHeader = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
    } catch (err) {
        throw new Error('Error generating OAuth Token: ' + err.toString())
    }

    try {
        const url = `${baseUrl}${secretsPath}:access`
        const params = { headers: authHeader, muteHttpExceptions: true }
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

const baseUrl = 'https://secretmanager.googleapis.com/v2beta1/'
