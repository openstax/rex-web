Steps to create a map of book modules:
1. Copy the data from mapping spreadsheet. Expected column order: 2e Module, 2e UUID, 3e Module, 3e UUID

2. Paste the copied data into template literal
    const data = `PASTED DATA`

3. Convert the string into array
    const mappingList = data.split('\n').map((line) => line.split('\t'))

4. Create the map of modules as a string (Modify the moduleMapComment if necessay)
    const modulesMapStr = mappingList.reduce((prev, current) => {
        const moduleMapComment = current[0] === current[2] ? `${current[0]} to the same module in 3e` : `${current[0]} to the ${current[2]}`
        const moduleMap = `'${current[1]}': '${current[3]}'`
        const newLine = `/* ${moduleMapComment} */\n${moduleMap},\n`
        return prev + newLine
    }, '')
