const fs = require('fs')
const path = require('path')
const glob = require('glob')
const pify = require('pify')

const jsGlobPattern = '../build/static/**/*.js'
const sourcemapString = '//# sourceMappingURL='

const toRelPath = (file) => path.relative(process.cwd(), file)

async function run() {
    const files = await pify(glob)(path.join(__dirname, jsGlobPattern))

    for (const filename of files) {
        const contents = fs.readFileSync(filename, 'utf-8')
        const index = contents.search(sourcemapString)
        if (index < 0) {
            throw new Error(`BUG: Sourcemap not found! file='${toRelPath(filename)}'`)
        }
        const mapFilename = contents.substring(index + sourcemapString.length).split('\n')[0]
        const mapPath = path.join(path.dirname(filename), mapFilename)
        const mapSource = JSON.parse(fs.readFileSync(mapPath))
        // const sm = new SourceMapConsumer(mapSource)
        mapSource.sources.forEach((sourceFilename, index) => {
            const sourcePath = path.join(path.dirname(mapPath), sourceFilename)
            if (!fs.existsSync(sourcePath)) {
                if (mapSource.sourcesContent[index]) {
                    console.warn(`WARN: In '${toRelPath(mapPath)}': Unable to find source file but found sourceContent for '${toRelPath(sourceFilename)}'`)
                } else {
                    console.error(`Unable to find source='${toRelPath(sourcePath)}' from '${toRelPath(mapPath)} from '${toRelPath(filename)}`)
                    console.error(`Here are the relative paths: '${sourceFilenameRel}' from '${mapFilename}' from '${filename}'`)
                    throw new Error(`BUG: Could not find source file`)
                }
            }

        })
    }

    if (files.length === 0) {
        throw new Error(`BUG: Could not find js files`)
    }
}


run().then(null, (err) => { throw err })