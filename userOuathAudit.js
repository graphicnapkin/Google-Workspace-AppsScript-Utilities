function reset() {
  ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger))
  PropertiesService.getScriptProperties().deleteAllProperties()
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Applications")
  sheet.getRange(2,1,sheet.getLastRow(), sheet.getLastColumn()).clear()
  main()
}


function main(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Applications")
  const scriptProperties = PropertiesService.getScriptProperties()
  ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger))

  // pageToken be null if not set
  let pageToken = scriptProperties.getProperty("pageToken")
  let output = []

  try {
    do {
      const response = AdminDirectory.Users.list({domain:"my_customer", pageToken});

      response.users.forEach(user => {
        //skip over suspended users
        if (user.suspended) return

        const userData = getAppRows(user)
        if(userData)  output = [...output, ...userData]
      })
      
      pageToken = response.nextPageToken

      // Keep working through groups of users until the rows to be written is over 20k & there is a next page (about 2 mins per run)
    } while(output.length < 20000 && pageToken)
  } catch(err) {
    console.log(err)
    return
  }

  // Write the data starting in the first empty row
  sheet.getRange(sheet.getLastRow() + 1,1,output.length,output[0].length).setValues(output)

  // Clear out script properties if there is no next page
  if (!pageToken) {
    scriptProperties.deleteProperty("pageToken")
    return
  }
  // If there is a next page token then set the page token in script properties and queue up another instance of this script
  scriptProperties.setProperty("pageToken",pageToken)
  ScriptApp.newTrigger('main').timeBased().after(1).create()
}

function getAppRows(user) {
  const apps = AdminDirectory.Tokens.list(user.primaryEmail).items;
  if(apps == null) return;

  // setup an Application dictionary to handle multiple application entries
  const appMap = {}
  const output = []

  apps.forEach(app => {
    //create key for app if it doesn't exist. Store all data about the app and all of the scopes over every instance
    if(!appMap[app.displayText]) appMap[app.displayText] = {scopesList: [], app}

    //Since we can come across the same application we add all scopes from every instance to the scopes list
    app.scopes.forEach(scope => appMap[app.displayText].scopesList.push(scope))
  })

  //itterate through each app
  Object.keys(appMap).forEach(appName => {
    const {app, scopesList} = appMap[appName]

    //filter down to unique list then itterate through each scope
    scopesList
    .filter(onlyUnique)
    .forEach(scope => {
      output.push([
        user.primaryEmail,
        user.suspended,
        user.orgUnitPath,
        appName,
        app.userKey,
        scope,
        app.clientId,
        app.anonymous,
        app.kind,
        app.nativeApp,
        app.etag
      ])
    })
  })
  return output
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

function onOpen() {
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('OAuth Audit')
      .addItem('Audit Apps', 'reset')
      .addToUi()
}

