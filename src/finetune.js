import fs from 'fs'
import OpenAI from 'openai'

const openai = new OpenAI()

const response = await openai.files.create({
  file: fs.createReadStream('./data/sebastian.json'),
  purpose: 'fine-tune',
})

console.log('Job ID', response.id)

const fineTuneResponse = await openai.fineTuning.jobs.create({
  training_file: response.id,
  model: 'gpt-3.5-turbo',
})

console.log(fineTuneResponse)
