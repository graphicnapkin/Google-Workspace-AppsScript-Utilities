function doGet() {
    return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
}

function getPerson() {
    return AdminDirectory.Users?.get('jc@graphicnapkin.com').name
}

function getToken() {
    return ScriptApp.getOAuthToken()
}

function getSessionUser() {
    return Session.getEffectiveUser().getEmail()
}

function addNumbers(num: number) {
    console.log(num)
    return num * 2
}
