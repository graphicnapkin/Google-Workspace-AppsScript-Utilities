const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const compiledFile = process.argv[2] || 'apps-script/index.html'
const files = ['src/App.tsx', compiledFile]
for (const file of files) {
    const contents = fs.readFileSync(path.join(root, file), 'utf8')
    assert.doesNotMatch(contents, /getToken\s*\(|getOAuthToken\s*\(|oAuthToken/, `${file} must not interpolate a raw token into the client`)
    assert.match(contents, /Authorization: Managed by Apps Script\./)
}
console.log(`PASS: source and ${compiledFile} use nonsensitive authorization text and contain no token interpolation`)
