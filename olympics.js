'use strict'
const puppeteer = require('puppeteer');

const sport = 'all-sports'
const date = '2021-07-21'
const timeOffset = "+9"

const url = `https://olympics.com/tokyo-2020/olympic-games/en/results/${sport}/olympic-schedule-and-results-date=${date}.htm`;

function getScheduleUrl(sport, date) {
    return `https://olympics.com/tokyo-2020/olympic-games/en/results/${sport}/olympic-schedule-and-results-date=${date}.htm`
}

async function getSchedule() {
    const result = {
        timeOffset,
        dates: [],
        sports: [],
        schedule: []
    }

    const browser = await puppeteer.launch({headless: false, args: ["--no-sandbox"]});
    const page = await browser.newPage();
    await page.goto(url);

    result.dates = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[aria-labelledby="daySelectorId"] [datevalue]')).map(el => el.getAttribute("datevalue"))
    })

    result.sports = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[aria-labelledby="sportSelectorId"] > li > a'))
            .map(el => {
                const title = el.innerText.trim()
                const icon = el.querySelector("img").src
                const id = icon.split("/").pop().split(".")[0]
                return ({
                    id,
                    title,
                    icon
                })
            })
    })

    for (let date of result.dates) {
        await page.goto(getScheduleUrl(sport, date))
        result.schedule = result.schedule.concat(await page.evaluate((date) => {
            return Array.from(document.querySelectorAll(".schedule-container  .clickable-schedule-row")).map(el => {
                const result = Array.from(el.querySelectorAll(".schedule-result .row"))
                    .map(el => {
                        const [country, player] = el.children[0].innerText.split("\n")
                        return ({
                            countryFlag: el.querySelector("img.flag")?.src,
                            country,
                            player,
                            result: el.children[1]?.innerText
                        })
                    })

                return ({
                    sportId: el.getAttribute("sport"),
                    date,
                    time: el.querySelector(".schedule-time").innerText,
                    event: el.querySelector(".schedule-event  .flex-grow-1").innerText,
                    venue: el.querySelector(".schedule-venue").innerText,
                    status: el.querySelector(".schedule-status").innerText,
                    result
                })
            })
        },date))
    }
    await browser.close();
    return result
}

exports.getSchedule = getSchedule