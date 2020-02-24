const cheerio = require("cheerio");
const axios = require("axios").default;

const fethHtml = async url => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch {
    console.error(
      `ERROR: An error occurred while trying to fetch the URL: ${url}`
    );
  }
};

const extractDeal = selector => {
  const title = selector
    .find(".responsive_search_name_combined")
    .find("div[class='col search_name ellipsis'] > span[class='title']")
    .text()
    .trim();

  const releaseDate = selector
    .find(".responsive_search_name_combined")
    .find("div[class='col search_released responsive_secondrow']")
    .text()
    .trim();

  const link = selector.attr("href").trim();

  const priceSelector = selector
    .find(
      "div[class='col search_price_discount_combined responsive_secondrow']"
    )
    .find("div[class='col search_price discounted responsive_secondrow']");

  const originalPrice = priceSelector
    .find("span > strike")
    .text()
    .trim();

  const pricesHtml = priceSelector.html().trim();
  const matched = pricesHtml.match(/(<br>(.+\s[0-9].+.\d+))/);

  const discountedPrice = matched[matched.length - 1];

  return {
    title,
    releaseDate,
    originalPrice,
    discountedPrice,
    link
  };
};

const scrapSteam = async () => {
  const steamUrl =
    "https://store.steampowered.com/search/?filter=weeklongdeals";

  const html = await fethHtml(steamUrl);

  const selector = cheerio.load(html);

  const searchResults = selector("body").find(
    "#search_result_container > #search_resultsRows > a"
  );

  const deals = searchResults
    .map((idx, el) => {
      const elementSelector = selector(el);
      return extractDeal(elementSelector);
    })
    .get();

  return deals;
};

module.exports = scrapSteam;
