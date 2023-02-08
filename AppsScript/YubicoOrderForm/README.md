# Yubico Order Form

This project uses yubico's shipment API's to place orders for your users using a Google Form. To start, create your google form and click the three dots ont he top right and then select "script editor".

Recreate each file in this project, inside that apps script project. You will not include the .js extensions when creating the files, and when recreating the HTML files you will need to use the extension or click the + then new HTML file.

The form questions used in this example were:

-   Country
-   Legal First Name
-   Legal Last Name
-   Email Address
-   Contact Phone Number
-   Address Line 1
-   Address Line 2
-   Address Line 3
-   City / Locality / Postal Town
-   State or Province
-   USB Type

Most of the HTML files need to have "<PUBLIC_URL_TO_LOGO>" replaced with a link to the logo of your choice, or remove the image tag. The unsucessful shipment html file also needs "<FORM_ID>" repalce with the formID you want to send your users back to.

Several of the forms have ID's to specific Google Sheets, Forms etc. The scripts use variables at the top of each file where you should place the ID's in a string. You will also need to "deploy" your apps script as a web app (https://developers.google.com/apps-script/guides/web) in order for the post and delete routes to work properly.

Lastly you will need to create your own config.js script where you will create two objects, options & getOptions. options should have your Authorization header with 'Bearer APIKEY' from Yubico, as well as a METHOD: POST (look up the urlFetchApp docs for the exact syntax). The get call is only the auth header.
