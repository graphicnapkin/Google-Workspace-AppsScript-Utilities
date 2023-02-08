const EMAIL_FOR_LOGS = ''

const getYubiProducts = () => {
    const url = `${baseUrl}/products`
    try {
        console.log(JSON.parse(UrlFetchApp.fetch(url, getOptions), null, 2))
    } catch (error) {
        console.log(JSON.parse(error, null, 2))
    }
}

const emailLog = (data) => {
    MailApp.sendEmail(
        EMAIL_FOR_LOGS,
        'email log',
        JSON.stringify(data, null, 2)
    )
}
