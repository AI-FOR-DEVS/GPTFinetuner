import { createReadStream, createWriteStream } from 'fs'
import stream from 'stream'
import csv from 'csv-parser'
import util from 'util'

const inquiriesCsvPath = './data/inquiries.csv' // Input CSV file path
const outputPath = './data/output.json' // Output JSONL file path

const pipeline = util.promisify(stream.pipeline)

async function readCSV(filePath) {
  const rows = []
  await pipeline(
    createReadStream(filePath),
    csv(),
    stream.Writable({
      objectMode: true,
      write(row, _, done) {
        rows.push(row)
        done()
      },
    }),
  )
  return rows
}

export function transformRowToJSON(row) {
  const customerQuery = row['Customer Query']
  const response = row['Catering Service Response']
  return {
    messages: [
      {
        role: 'system',
        content:
          'As a seasoned customer support agent, you have a knack for addressing client inquiries based on past successful interactions.',
      },
      {
        role: 'user',
        content: `Here's a message we received from a client: ${customerQuery}`,
      },
      {
        role: 'assistant',
        content: response,
      },
    ],
  }
}

async function main() {
  try {
    const rows = await readCSV(inquiriesCsvPath)
    const outputData = rows.map(transformRowToJSON)

    const writeStream = createWriteStream(outputPath)
    for (const obj of outputData) {
      writeStream.write(JSON.stringify(obj) + '\n')
    }
    writeStream.end()

    writeStream.on('finish', () => {
      console.log(`Data has been written to ${outputPath}`)
    })
  } catch (error) {
    console.error('Error occurred:', error)
  }
}

main()