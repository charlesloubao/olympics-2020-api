const port = process.env.PORT || 3000
const moment = require("moment")
const express = require("express")
const app = express()

let lastUpdated = null
let cacheData = {}

const {getSchedule} = require("./olympics")

app.get("/api/schedule", (async (req, res, next) => {
    try {
        const now = moment()
        if (cacheData != null && lastUpdated != null && now.isBefore(lastUpdated.add(1, "hour"))) {
            console.log("Loading cached data")
            return res.send(cacheData)
        }
        cacheData = await getSchedule()
        lastUpdated = moment()
        res.send({
            lastUpdated,
            data: cacheData
        })

    } catch (e) {
        next(e)
    }
}))

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})