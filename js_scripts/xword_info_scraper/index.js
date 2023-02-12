const fs = require("fs");
const path = require("path");
const axios = require("axios");
const htmlParser = require("node-html-parser");

async function scrapeCrosswordClues(url, filePath) {
  let htmlString;

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
      .querySelector(".nywrap")
      .querySelectorAll("ul")
      .forEach((ulNode) => {
        ulNode.childNodes.forEach((node) =>
          data.push({
            clue: node.childNodes[0].text,
            answer: node.childNodes[1].text,
          })
        );
      });
  } catch (err) {
    return;
  }

  fs.writeFileSync(filePath, JSON.stringify(data));
}

function mkDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

async function scrapeALot() {
  for (let year = 2022; year >= 2017; year--) {
    mkDir(`./scraped_xwords/${year}`);
    for (let month = 1; month <= 12; month++) {
      const monthString = String(month).padStart(2, "0");
      mkDir(`./scraped_xwords/${year}/${monthString}`);
      for (let day = 1; day <= 31; day++) {
        const yearString = String(year % 100).padStart(2, "0");
        const dayString = String(day).padStart(2, "0");

        await scrapeCrosswordClues(
          `https://nytcrosswordanswers.org/nyt-crossword-answers-${monthString}-${dayString}-${yearString}`,
          `./scraped_xwords/${year}/${monthString}/${dayString}.json`
        );
      }
    }
  }
}

scrapeALot();

// module.exports = { getDataFromHtml };
