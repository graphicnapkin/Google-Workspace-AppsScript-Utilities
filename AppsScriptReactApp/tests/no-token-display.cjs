const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const files = ['src/App.tsx', 'apps-script/index.html']
for (const file of files) {
    const contents = fs.readFileSync(path.join(root, file), 'utf8')
    assert.doesNotMatch(contents, /getToken\s*\(|getOAuthToken\s*\(|oAuthToken/, `${file} must not interpolate a raw token into the client`)
    assert.match(contents, /Authorization: Managed by Apps Script\./)
}
console.log('PASS: source and compiled UI use nonsensitive authorization text and contain no token interpolation')
