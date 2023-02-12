const fs = require("fs");
const path = require("path");
const axios = require("axios");
const htmlParser = require("node-html-parser");

async function scrapeCrosswordClues(url, filePath) {
  let htmlString;

  console.log(url);

  try {
    htmlString = await axios.get(url).then((response) => response.data);
  } catch (err) {
    return;
  }

  const root = htmlParser.parse(htmlString);
  root.removeWhitespace();

  const data = [];

  try {
    root
      .querySelector(".cluebox")
      .querySelectorAll("a")
      .forEach((aNode) => {
        const splitData = aNode.parentNode.text.split(":");

        const answer = splitData.pop();
        const clue = splitData.join(":");

        data.push({ clue, answer });
      });
  } catch (err) {
    console.log(err);
    return err;
  }

  fs.writeFileSync(filePath, JSON.stringify(data));
}

function mkDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

async function scrapeALot() {
  for (let year = 2023; year >= 2023; year--) {
    mkDir(__dirname + `/scraped_xwords/${year}`);
    for (let month = 1; month <= 2; month++) {
      const monthString = String(month).padStart(2, "0");
      mkDir(__dirname + `/scraped_xwords/${year}/${monthString}`);
      for (let day = 1; day <= 31; day++) {
        const yearString = String(year % 100).padStart(2, "0");
        const dayString = String(day).padStart(2, "0");

        await scrapeCrosswordClues(
          `https://www.xwordinfo.com/Crossword?date=${month}/${day}/${year}`,
          __dirname + `/scraped_xwords/${year}/${monthString}/${dayString}.json`
        );
      }
    }
  }
}

scrapeALot();

// scrapeCrosswordClues(
//   `https://www.xwordinfo.com/Crossword?date=2/12/2023`,
//   `./scraped_xwords/2023/02/12.json`
// );

// module.exports = { getDataFromHtml };
