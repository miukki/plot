const rp = require('request-promise')
const cheerio = require('cheerio')
const Chart = require('chart.js')

// node canvas init
// https://github.com/Automattic/node-canvas
// requirement for OSX
// brew install pkg-config cairo pango libpng jpeg giflib librsvg

// const {createCanvas, loadImage} = require('canvas')
// const canvas = createCanvas(500, 500)
// const ctx = canvas.getContext('2d')

const jsdom = require('jsdom') // import works identically
const {JSDOM} = jsdom
const {window = {}} = new JSDOM(``, {pretendToBeVisual: false})

//canvas init
const myCanvas = window.document.createElement('canvas') // Throws error
myCanvas.width = 300
myCanvas.height = 300

const URL = process.env.URL || ''

const getJumpRecords = async () => {
  const html = await rp(URL)
  const $ = cheerio.load(html)

  const recordsTable = $('table')[0]

  const records = $('td:first-child', recordsTable)
  const data = []

  records.each((i, elem) => {
    const text = $(elem).text()
    const v = text.match(/\d\.\d+/)[0]

    data.push(parseFloat(v))
  })

  return data
}

function drawPieSlice(
  ctx,
  centerX,
  centerY,
  radius,
  startAngle,
  endAngle,
  color
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(centerX, centerY)
  ctx.arc(centerX, centerY, radius, startAngle, endAngle)
  ctx.closePath()
  ctx.fill()
}
const Piechart = function (options) {
  this.options = options
  this.canvas = options.canvas
  this.ctx = this.canvas.getContext('2d')
  this.colors = options.colors

  this.draw = function () {
    let total_value = 0
    let color_index = 0
    for (const categ in this.options.data) {
      const val = this.options.data[categ]
      total_value += val
    }

    let start_angle = 0
    for (categ in this.options.data) {
      val = this.options.data[categ]
      const slice_angle = (2 * Math.PI * val) / total_value

      drawPieSlice(
        this.ctx,
        this.canvas.width / 2,
        this.canvas.height / 2,
        Math.min(this.canvas.width / 2, this.canvas.height / 2),
        start_angle,
        start_angle + slice_angle,
        this.colors[color_index % this.colors.length]
      )

      start_angle += slice_angle
      color_index++
    }
  }
}

const getRandomColor = () => {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const makeChartCanvas = async (data = []) => {
  const colors = data.map((i) => getRandomColor())
  const myPiechart = new Piechart({
    canvas: myCanvas,
    data: data,
    colors: colors,
    doughnutHoleSize: 0.5
  })

  return {cart: await myPiechart, colors} //.draw()
}
;(async () => {
  const data = await getJumpRecords()
  const {chart, colors} = await makeChartCanvas(data)
  console.log(`output`, chart, colors)
})()
