// Compiled using undefined undefined (TypeScript 4.9.5)
var __spreadArray =
    (this && this.__spreadArray) ||
    function (to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar) ar = Array.prototype.slice.call(from, 0, i)
                    ar[i] = from[i]
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from))
    }
/**
 * useSecret provides a callback function a secret fetched from GCP Secrets Manager.
 * The desired secret is found by the secretPath argument.
 * The structure of secretPath is:
 * `projects/${projectId}/secrets/${secretName}/versions/${versionNumber}`
 * *
 * The first argument of the callback function should be the fetched secret, followed
 * by any additional arguments you pass in as normal.
 * `(secret: string, ...args: any[]) => any)`
 *
 * For more details see:
 * https://github.com/graphicnapkin/Google-Workspace-AppsScript-Utilities/blob/main/GASM/README.md
 *
 * @param {string} secretPath SecretPath is the path to the secret including version number.
 * @param {function(string, ...any): any} callbackFunction Callback function that will use secret.
 * @param {...any} callbackArguments Arguments to pass to callback function.
 * @return {any}
 **/
function useSecret(secretPath, callbackFunction) {
    var callbackArguments = []
    for (var _i = 2; _i < arguments.length; _i++) {
        callbackArguments[_i - 2] = arguments[_i]
    }
    var secret = getSecret(secretPath)
    var response = callbackFunction.apply(
        void 0,
        __spreadArray([secret], callbackArguments, false)
    )
    /*
        This is a naive attempt to make this function more secure and encourage safer patterns.
    */
    if (JSON.stringify(response).includes(secret)) {
        throw new Error(
            "Unsafe usage of useSecret's function. Response included the secrets content which " +
                'should be avoided. If raw secret value is needed use the getSecret function.'
        )
    }
    return response
}
/**
 * Returns secret value from GCP Secret Manager. This is UNSAFE and should be avoided where possible in favor of the useSecrets function.
 * The structure of secretPath is:
 * `projects/${projectId}/secrets/${secretName}/versions/${versionNumber}`
 * For more details see:
 * https://github.com/graphicnapkin/Google-Workspace-AppsScript-Utilities/blob/main/GASM/README.md
 * @param {string} secretPath
 * @return {string} Requested Secret
 **/
function getSecret(secretPath) {
    var _a
    if (!secretPath) {
        throw new Error('A secretPath is required for this function.')
    }
    var baseUrl = 'https://secretmanager.googleapis.com/v1/'
    /*
        Get's an auth token for the effective user which is the account used
        to start the script that is leveraging this library.
    */
    var token
    try {
        token = ScriptApp.getOAuthToken()
    } catch (err) {
        throw new Error('Error generating OAuth Token: ' + err.toString())
    }
    var headers = { Authorization: 'Bearer ' + token }
    var url = ''.concat(baseUrl).concat(secretPath, ':access')
    var data
    try {
        var response = UrlFetchApp.fetch(url, { headers: headers })
        data = JSON.parse(response.getContentText())
    } catch (err) {
        var errorString = err.toString()
        var message = errorString
        if (errorString.includes('code 403')) {
            message = ''
                .concat(Session.getEffectiveUser(), ' does not have access to ')
                .concat(secretPath, ' or secret does not exist.')
        }
        if (errorString.includes('code 404')) {
            message = 'Secret not found. secretPath provided: '.concat(
                secretPath
            )
        }
        throw new Error(message)
    }
    var encodedSecret =
        (_a = data === null || data === void 0 ? void 0 : data.payload) ===
            null || _a === void 0
            ? void 0
            : _a.data
    if (!encodedSecret) {
        throw new Error(
            'Invalid secrets contents. Response from secrets manager: \n            '.concat(
                JSON.stringify(data)
            )
        )
    }
    var secretBytes = Utilities.base64Decode(encodedSecret)
    return _byteToString(secretBytes)
}
function _byteToString(bytes) {
    var result = ''
    for (var i = 0; i < bytes.length; ++i) {
        var byte = bytes[i]
        var text = byte.toString(15)
        result += (byte < 15 ? '%0' : '%') + text
    }
    return decodeURIComponent(result)
}
