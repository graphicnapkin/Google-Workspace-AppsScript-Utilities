/*
    Replace the empty strings with your values for the spreadsheet ID's you will
    be using as your "Database" as well as an optional vendor name.

    This project uses lowDash "_" so you'll need to enable this library. Follow instructions here:
    https://github.com/contributorpw/lodashgs under "Adding the library to your project"
*/
const MAIN_SHEET_ID = ''
const SHARED_VENDOR_SHEET_ID = ''
const VENDOR_NAME = ''

const mainSheet = SpreadsheetApp.openById(MAIN_SHEET_ID)
const ordersSheet = mainSheet.getSheetByName('orders')
const failedOrdersSheet = mainSheet.getSheetByName('failed_orders')

const vendorShippingDB = SpreadsheetApp.openById(
    SHARED_VENDOR_SHEET_ID
).getSheetByName('YubiKey Shipping - ' + VENDOR_NAME)

const logOrder = (order) => {
    ordersSheet
        .getRange(ordersSheet.getLastRow() + 1, 1, 1, 3)
        .setValues([[order.shipment_id, order.recipient_email, new Date()]])
}

const logFailure = (recipient, error) => {
    failedOrdersSheet
        .getRange(failedOrdersSheet.getLastRow() + 1, 1, 1, 3)
        .setValues([[recipient, error, new Date()]])
}

const logVendorOrder = (order) => {
    order = [
        [
            order['Country'],
            order['Legal First Name'],
            order['Legal Last Name'],
            order['Address Line 1'][0],
            _.get(order, 'Address Line 2[0]') || '',
            _.get(order, 'Address Line 3[0]') || '',
            order['City / Locality / Postal Town'][0],
            order['State or Province'][0],
            order['ZIP or Postal Code'][0],
            order['Email Address'][0],
            order['Contact Phone Number'][0],
            order['USB Type:'][0] == 'USB-A' ? 2 : '',
            order['USB Type:'][0] == 'USB-C' ? 2 : '',
        ],
    ]

    vendorShippingDB
        .getRange(vendorShippingDB.getLastRow() + 1, 1, 1, 13)
        .setValues(order)

    return encodeURIComponent(order[0].join('**'))
}
