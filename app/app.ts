import * as fs from "fs";
import * as path from "path";
import {execSync} from "child_process"

const argv = process.argv.slice(2)
if (argv.length <= 0) {
  console.error('You need to specify a file input')
  process.exit(-1)
}

argv.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`File: "${file}" does not exist`)
    process.exit(-1)
  }
})

function removeExisting(dest, format: Array<string>) {
  format.forEach(ext => {
    if (fs.existsSync(`${dest}.${ext}`)) {
      fs.unlinkSync(`${dest}.${ext}`)
    }
  })
}

async function convertVideo(file) {
  try {
    
    const name = path.parse(file)
    const out = path.join(process.cwd(), 'out')
    const dest = path.join(out, name.name)
    //Creating output directories
    if (!fs.existsSync(out)) {
      console.log('Creating output directory')
      fs.mkdirSync(out)
    }
    // Remove duplicates
    console.log('Remove existing')
    removeExisting(dest, ['mp4', 'mp3', 'wav'])
    
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
  
    //Converting to wav
    console.log(`Converting: ${name.name}${name.ext} -> ${dest}.wav`)
    execSync(`ffmpeg -i ${file} ${dest}.wav`, {
      stdio: "pipe",
    })
    
    
  } catch (e) {
    console.error(e)
    process.exit(-1)
  }
}

argv.forEach(convertVideo)

