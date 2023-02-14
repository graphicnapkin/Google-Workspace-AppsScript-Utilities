# AppsScript Hosted Webapp

## "Your scientists were so preoccupied with whether they could, they didn't stop to think if they should" - Dr. Ian Malcolm

This is the results of following the amazing tutorial from @get\_\_itdone7958 https://www.youtube.com/watch?v=aq2B02DuCs0

You likely know his videos if you were trying to remember how to do a vlookup in Google Sheets.

Workflow is ruin `npm start` followed by `npm run gstart`. It will watch files and automatically push changes up to your apps script project. There are other nuances, like needing to setup a deployment in the UI etc.
If this idea is interesting to you I would highly recommend watching the video and following along.
Two additional thoughts / tips.:

-   1. Parcel seems rad and what simpler than webpack. I've heard that create react app is dead (thanks Theo) but I still used it for my hobby projects, but setting up and using parcel briefly, I totally understand how bloated create react app is.
-   2. You can just use typescript. Like, you don't need to do anything like tsc init, or setting up any other options etc that are mentioned if you follow instructions on using typescript with clasp (required for this workflow). I actually find it works _better_ not creating a tsconfig. One small example is it properly calls out my project name in the .js file thats generated on AppsScript instead of "this was complied with undefined undefined".
-   3. The presenter covers this at the end of the video but using this pattern the src folder is your react front end and the apps-script folder is your backend. If you want to do interesting things using AppsScript native libraries like AdminDirectory, you will need to make apps script routes that you make available in the html file. An example of this can be found here: https://codewithcurt.com/how-to-call-google-apps-script-function-from-web-app/ . But I'm not sure how this would work with how the front end html is complied and the apps-script/index.html is replaced. I would assume you could add an extra script tag to the src/index.html to define your apps script functions with the `google.script.run.withSuccessHandler` pattern, but I haven't yet tested this.
