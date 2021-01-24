import * as fs from "fs";
import * as path from "path";
import {execSync} from "child_process"

const argv = process.argv.slice(2)
if (argv.length <= 0) {
  console.error('You need to specify a file input')
  process.exit(-1)
}

const file = argv[0]

if (!fs.existsSync(file)) {
  console.error(`File: "${file}" does not exist`)
  process.exit(-1)
}

async function convertVideo() {
  try {
    
    const name = path.parse(file)
    const out = path.join(process.cwd(), 'out')
    const dest = path.join(out, name.name)
    //Creating output directories
    console.log('Removing duplicates')
    fs.rmdirSync(out, {
      recursive: true
    })
    console.log('Creating out directories')
    fs.mkdirSync(out)
    
    //Converting to ogg
    console.log(`Converting: ${name.name}${name.ext} -> ${dest}.ogg`)
    execSync(`ffmpeg -i ${file} ${dest}.ogg`, {
      stdio: "pipe",
    })
    
    //Converting to mp3
    console.log(`Converting: ${name.name}${name.ext} -> ${dest}.mp3`)
    execSync(`ffmpeg -i ${file} ${dest}.mp3`, {
      stdio: "pipe",
    })
  
    //Converting to mp4
    console.log(`Converting: ${name.name}${name.ext} -> ${dest}.mp4`)
    execSync(`ffmpeg -i ${file} ${dest}.mp4`, {
      stdio: "pipe",
    })
    
    
  } catch (e) {
    console.error(e)
    process.exit(-1)
  }
}

convertVideo()

