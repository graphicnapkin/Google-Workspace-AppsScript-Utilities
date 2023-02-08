const postShipment = (e) => {
    const address = {
        Country: [e.country],
        'Legal First Name': [e.firstName],
        'Legal Last Name': [e.lastName],
        'Address Line 1': [e.address1],
        'Address Line 2': [e.address2 || ''],
        'Address Line 3': [e.address3 || ''],
        'City / Locality / Postal Town': [e.city],
        'State or Province': [e.state],
        'ZIP or Postal Code': [e.zipcode],
        'Email Address': [e.email],
        'Contact Phone Number': [e.phone],
        'USB Type:': [e.usb],
    }
    logVendorOrder(address)
    let temp = HtmlService.createTemplateFromFile('manualProcessing')
    return temp.evaluate()
}
