const FORM_ID = ''

const deleteShipment = (e) => {
    deleteResponse(e.email)

    if (e.vendororder) return deleteNetUniverseShipment(e)

    let deleted
    const params = { ...getOptions, method: 'delete' }
    const url = `${baseUrl}/shipments/${e.shipment_id}`

    try {
        const response = UrlFetchApp.fetch(url, params)
        console.log(response.getResponseCode())

        if (response.getResponseCode() == 200) {
            deleted = true
        } else {
            deleted = false
        }
    } catch (error) {
        deleted = false
    }

    if (deleted) {
        const temp = HtmlService.createTemplateFromFile('successfulDelete')
        return temp.evaluate()
    } else {
        const temp = HtmlService.createTemplateFromFile('unsuccessfulDelete')
        return temp.evaluate()
    }
}

const deleteNetUniverseShipment = (e) => {
    const temp = HtmlService.createTemplateFromFile('successfulDelete')
    return temp.evaluate()
}

const deleteResponse = (email) => {
    const form = FormApp.openById(FORM_ID)
    const formResponses = form.getResponses()

    /*
    Look for the form response in responses and delete this. This is only needed
    if you only let people submit one form per person and enables them do delete their
    response if there was an error with the shipment.
    */
    for (let i = 0; i < formResponses.length; i++) {
        const formResponse = formResponses[i]
        if (formResponse.getRespondentEmail() == email) {
            form.deleteResponse(formResponse.getId())
        }
    }
}
