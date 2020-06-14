// const request = require('request-promise')
// const cheerio = require('cheerio')
//
// async function query({url}) {
//   const html = await request(url)
//   const $ = cheerio.load(html)

//   const recordsTable = $('table')[0]
//   const records = $('td:first-child', recordsTable)

//   return records
//     .map((i, elem) => {
//       const text = $(elem).text()
//       const v = text.match(/\d\.\d+/)[0]
//       return parseFloat(v)
//     })
//     .get()
// }

const puppeteer = require(`puppeteer`)

async function query({url}) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const list = await page.$$eval('table tr td:first-child', (tds) =>
    tds
      .map((td) => {
        return parseFloat(td.innerText)
      })
      .filter((v) => v)
  )

  await browser.close()

  return list
}

function normalize({list}) {
  return list.map((value, key) => ({key, value}))
}

const d3nBar = require(`d3node-barchart`)
const output = require(`d3node-output`)

async function draw({dst = `output`, data}) {
  const options = {width: 800, height: 600, jpeg: true, quality: 70}
  output(dst, d3nBar({data}), options)
}

async function main() {
  const [, , url] = process.argv

  if (!url) {
    console.log(`Usage: node plot.js URL`)
    process.exit(1)
  }

  const list = await query({url})
  const data = normalize({list})
  draw({data})
}

main()
