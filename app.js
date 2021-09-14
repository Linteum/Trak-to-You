const fs = require('fs')
const promFs = require('fs').promises
const { JSDOM } = require('jsdom')
const { selectHTMLFile } = require('./modules/user-action')
const path = require('path')
const open = require('open')
const signale = require('signale')

// lire fichier html avec fs (file to string)
async function extractTabFromPage(filePath = "") {
    filePath = "C:/Users/Admin/Documents/HISTORY.html"
    const txtFromPage = await promFs.readFile(filePath, { encoding: "utf-8" })
    // console.log(txtFromPage)
    return txtFromPage
}

// isoler la partie représentant le tableau
function pageToJson(htmlTxtPage) {
    const dom = new JSDOM(htmlTxtPage)
    const window = dom.window
    const rows = window._document.querySelectorAll("tr")
    const headRowCells = rows[0].getElementsByTagName("th")
    const usedRows = {}
    for (let index in headRowCells) {
        let item = headRowCells[index]
        if (item.textContent) {
            switch (item.textContent.trim()) {
                case "Title":
                case "Artist":
                case "Release":
                case "Start Time":
                case "Duration":
                    const key = item.textContent.trim()
                    usedRows[key] = parseInt(index)
                    break;
            }
        }
    }

    console.log(usedRows)
    let playedSongs = []
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td")
        const track = {}
        for (key in usedRows) {
            // console.log(key)
            track[key] = cells[usedRows[key]].textContent
        }
        playedSongs.push(track)
    }

    playedSongs = playedSongs.map(item => {
        item['Start Time'] = (new Date(item['Start Time'])).getTime()
        return item
    })
    const firstSong = playedSongs[0]['Start Time']
    playedSongs = playedSongs.map(item => {
        item['Start Time'] = millisToMinutesAndSeconds(item['Start Time'] - firstSong)
        return item
    })

    for (let song of playedSongs) {
        console.log(`${song['Start Time']} - ${song.Title} - ${song.Artist} - ${song.Release}`)
    }
    return playedSongs
}

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function validFilePath(filePath) {

    if (filePath.includes('"')) {
        filePath = filePath.split('"').join('')
    }
    filePath = filePath.trim()
    if (!fs.existsSync(filePath)) return false

    if (path.extname(filePath) != '.html') return false

    return filePath

}

async function writeTxtFile(sourceFile, content) {
    sourceFile = path.parse(sourceFile)
    const date = new Date()
    const fileName = (`${sourceFile.name}-${date.toJSON()}.txt`).split(':').join('-')
    const destFile = path.join(sourceFile.dir, fileName)

    await promFs.writeFile(destFile, content)
    S
    open(destFile)
}

const main = async () => {

    const source_file = await selectHTMLFile()
    if (!validFilePath(source_file)) return console.error("File not valid !")
    const txtPage = await extractTabFromPage()
    const playedSongs = pageToJson(txtPage)
    let tracklist = ''
    for (let song of playedSongs) {
        tracklist += `${song['Start Time']} - ${song.Title} - ${song.Artist} - ${song.Release}\n`
    }
    await writeTxtFile(source_file, tracklist)

}

main()