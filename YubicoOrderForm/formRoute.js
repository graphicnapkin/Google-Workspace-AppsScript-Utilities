/**

Create a script that is tied to your Google Form by clicking the three dots on the top right then down to "script editor"

Overview:
Form submissions from will run the onSubmit function below. If the submission is for a country outide of Yubico's shipping capabilty
then execution will stop and the submission will simply be tracked on the form responses. If it is inside Yubico shipping, validate the 
address using their validation endpoint and then place an order using the shipments endpoint. For successfull and unsuccessful submissions
emails are sent to the user. Shipment ID's are logged to the responses sheet as well as failures of any kind.

--------------------

Helpful links

Data Sources:
Form: FORM_URL
Form Responses: FORM_URL_RESPONSES_SHEET (Make sure to force responses to go to a sheet)

Yubico Resources:
Yubico's API getting started: https://console.yubico.com/help/API_Onboarding_Playbook.html
Yubico Enterprise console: https://console.yubico.com/dashboard
Shipment endpoint: https://app.swaggerhub.com/apis-docs/yubico/yubi-enterprise-delivery-public/v1-oas3#/shipments/CreateShipment
Validation endpoint: https://app.swaggerhub.com/apis-docs/yubico/yubi-enterprise-delivery-public/v1-oas3#/addresses/AddressValidation
Delete Shipment endpoint: https://console.yubico.com/apidocs/#operation/DeleteShipmentById

Google Libary Resources:
GmailApp library documentation: https://developers.google.com/apps-script/reference/gmail/gmail-app
Form Submit (Event Objects) documentation: https://developers.google.com/apps-script/guides/triggers/events
Apps Script HTMLService documentation: https://developers.google.com/apps-script/reference/html/html-service#createTemplateFromFile(String)

Other Libraries: 
LodashGS: https://github.com/contributorpw/lodashgs

**/

const SCRIPT_ID = 'replace with ID of your Apps script file'
const REPLY_TO_EMAIL =
    'replace with the email address you want replies to be forwarded to'
const FROM_EMAIL_ADDRESS =
    'replace with the email address that will be sending this email, this should be the account that is running the script'
const GOOGLE_WORKSPACE_DOMAIN =
    'Replace with your Google Workspace domain (example.com)'

// Make sure this script was created from the Google Form, then setup a Trigger on form submit, targeting this onSubmit function.
const onSubmit = ({ namedValues: submission } = testSubmission) => {
    try {
        console.log(submission)
        // filter out countries that need to be handled by your Vendor
        if (!countryCode[_.get(submission, 'Country[0]')])
            return vendorOrder(submission)
        //validate and transform address
        const address = parseAddress(submission)
        // validateAddress returns boolean and will pass error to error handler on it's own. don't move forward
        if (!validateAddress(address, submission)) return
        //pass to shipments API
        shipIt(address)
    } catch (error) {
        deleteResponse(submission['Email Address'][0])
        emailLog({ ...submission, error })
    }
}

const vendorOrder = (order) => {
    let recipient = order['Email Address'][0]
    const orderId = logVendorOrder(order)

    const vendorTemplate = HtmlService.createTemplateFromFile('vendorShipping')
    vendorTemplate.shipmentInfo = order
    vendorTemplate.cancelLink =
        'https://script.google.com/a/' +
        GOOGLE_WORKSPACE_DOMAIN +
        '/macros/s/' +
        SCRIPT_ID +
        '/exec?method=delete&vendororder=' +
        orderId +
        '&email=' +
        recipient

    const body = vendorTemplate.evaluate().getContent()

    GmailApp.sendEmail(recipient, 'YubiKey Order Processing', null, {
        htmlBody: body,
        replyTo: REPLY_TO_EMAIL,
        from: FROM_EMAIL_ADDRESS,
    })
}

const shipIt = (address) => {
    const url = `${baseUrl}/shipments`
    // You'll need to setup an options object that contains your yubikey API data in an auth header.
    // see https://console.yubico.com/help/API_Onboarding_Playbook.html for instructions on getting an API key
    const params = { ...options, payload: JSON.stringify(address) }

    try {
        let response = UrlFetchApp.fetch(url, params)
        delete params.Authorization

        if (response.getResponseCode() != '200') {
            //some bad response shipments endpoint
            return submissionError(
                `Submission Error: ${response.getResponseCode()}, ${response.getContentText()}`,
                submission
            )
        }

        address.shipment_id = JSON.parse(response).shipment_id
        logOrder(address.shipment_id, address.recipient_email) //import from 2_orderTracking
        successEmailSubmission(address) //response will be 200 at this point and order will be placed
    } catch (error) {
        return errorEmailSubmission(`Server Error: ${error}`, submission) // error thrown when making API call
    }
}

const parseAddress = (submission) => {
    const address = {
        delivery_type: 1,
        country_code_2: countryCode[_.get(submission, 'Country[0]')], //countryCode import from 4_helper
        recipient: `${_.get(submission, 'Legal First Name[0]')} ${_.get(
            submission,
            'Legal Last Name[0]'
        )}`,
        recipient_email: _.get(submission, 'Email Address[0]'),
        recipient_telephone: _.get(submission, 'Contact Phone Number[0]'),
        street_line1: _.get(submission, 'Address Line 1[0]'),
        city: _.get(submission, 'City / Locality / Postal Town[0]'),
        region: _.get(submission, 'State or Province[0]'),
        shipment_items: [
            {
                product_id: productId[_.get(submission, 'USB Type:[0]')], //product_id import from 4_helper
                shipment_product_quantity: 2,
            },
        ],
    }

    // Set zip_code if US or postal_code outside US
    if (address.country_code_2 == 'US') {
        address.zip_code = _.get(submission, 'ZIP or Postal Code[0]')
    } else {
        address.postal_code = _.get(submission, 'ZIP or Postal Code[0]')
    }

    if (_.get(submission, 'Address Line 2[0]'))
        address.street_line2 = submission['Address Line 2'][0]
    if (_.get(submission, 'Address Line 3[0]'))
        address.street_line3 = submission['Address Line 3'][0]

    return address
}

const validateAddress = (address, submission) => {
    const url = `${baseUrl}/address-validation`

    // Validation data structure is slightly different form shipment endpoint to have to transform body slightly
    const payload = {
        primary_line: address.street_line1,
        city: address.city,
        state: address.region,
    }

    // Validation endpoint will fail if it's a US address and it's passed a country key value pair so exclude that
    if (address.country_code_2 != 'US') payload.country = address.country_code_2

    // Validation endpoint will fail if it's a US address and it's passed a country key value pair so exclude that
    if (address.street_line2) payload.secondary_line = address.street_line2

    if (address.street_line3) {
        if (!address.street_line2) {
            payload.secondary_line = address.street_line3
        } else {
            payload.secondary_line += ' ' + address.street_line3
        }
    }

    // Setting either postal code or zip-code if they are present
    if (address.postal_code) payload.postal_code = address.postal_code
    if (address.zip_code) payload.zip_code = address.zip_code

    const params = { ...options, payload: JSON.stringify(payload) } //import options from config script you created

    try {
        let response = UrlFetchApp.fetch(url, params)
        if (response.getResponseCode() == '200') {
            return true
        } else {
            //anything other than a 200 will be a validation error, pass it to the error handler
            errorEmailSubmission(
                `Validation Error: ${
                    JSON.parse(response.getContentText()).message
                }`,
                submission
            )
            return false
        }
    } catch (error) {
        return errorEmailSubmission(`Submission Error: ${error}`, submission)
    }
}

// Email requestor the error and log it for later followup
const errorEmailSubmission = (error, shipmentInfo) => {
    // Error may or may not have been parsed, if recipient_email is not passwed then it will be
    // Email address directly from form response
    const recipient =
        shipmentInfo.recipient_email || _.get(shipmentInfo, 'Email Address[0]')
    logFailure(recipient, error) // Import from orderTracking script
    deleteResponse(recipient)

    // Generate HTML template and pass in some values then evaluate
    const errorTemplate = HtmlService.createTemplateFromFile('errorShipment')
    errorTemplate.shipmentInfo = shipmentInfo
    errorTemplate.error = error
    errorTemplate.reSubmitLink =
        'https://script.google.com/a/' +
        GOOGLE_WORKSPACE_DOMAIN +
        '.com/macros/s/' +
        SCRIPT_ID +
        '/exec?method=post&' +
        `country=${encodeURIComponent(shipmentInfo['Country'])}&` +
        `firstName=${encodeURIComponent(shipmentInfo['Legal First Name'])}&` +
        `lastName=${encodeURIComponent(shipmentInfo['Legal Last Name'])}&` +
        `address1=${encodeURIComponent(shipmentInfo['Address Line 1'])}&` +
        `address2=${encodeURIComponent(
            _.get(shipmentInfo, 'Address Line 2[0]')
        )}&` +
        `address3=${encodeURIComponent(
            _.get(shipmentInfo, 'Address Line 3[0]')
        )}&` +
        `city=${encodeURIComponent(
            shipmentInfo['City / Locality / Postal Town'][0]
        )}&` +
        `state=${encodeURIComponent(shipmentInfo['State or Province'][0])}&` +
        `zipcode=${encodeURIComponent(
            shipmentInfo['ZIP or Postal Code'][0]
        )}&` +
        `email=${encodeURIComponent(shipmentInfo['Email Address'][0])}&` +
        `phone=${encodeURIComponent(
            shipmentInfo['Contact Phone Number'][0]
        )}&` +
        `usb=${encodeURIComponent(shipmentInfo['USB Type:'][0])}`

    const body = errorTemplate.evaluate().getContent()

    // Send email from service account
    GmailApp.sendEmail(recipient, 'YubiKey Order Error', null, {
        htmlBody: body,
        replyTo: REPLY_TO_EMAIL,
        from: FROM_EMAIL_ADDRESS,
    })
}

// Email requestor the error and shipmentID for later tracking
const successEmailSubmission = (shipmentInfo) => {
    const recipient = shipmentInfo.recipient_email
    const successTemplate = HtmlService.createTemplateFromFile(
        'successfullShipment'
    )
    successTemplate.shipmentInfo = shipmentInfo

    successTemplate.deleteLink =
        'https://script.google.com/a/' +
        GOOGLE_WORKSPACE_DOMAIN +
        '/macros/s/' +
        SCRIPT_ID +
        '/exec?method=delete&shipment_id=' +
        shipmentInfo.shipment_id +
        '&email=' +
        recipient

    const body = successTemplate.evaluate().getContent()

    // Send email from service account
    GmailApp.sendEmail(recipient, 'YubiKey Order Processing', null, {
        htmlBody: body,
        replyTo: REPLY_TO_EMAIL,
        from: FROM_EMAIL_ADDRESS,
    })
}
