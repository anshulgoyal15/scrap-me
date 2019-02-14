const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

function getFull(id, callback) {
  request.get(`https://www.imdb.com/title/${id}/?ref_=fn_al_tt_1`, function(
    error,
    response,
    data
  ) {
    const $ = cheerio.load(data);
    callback(error, {
      story: $("div.inline:nth-child(3) > p:nth-child(1) > span:nth-child(1)")
        .text()
        .trim(),
      genre: $("#titleStoryLine > div:nth-child(10)")
        .find("a")
        .text()
        .trim()
        .split(" "),
      poster:
        $(".poster > a:nth-child(1) > img:nth-child(1)")[0].attribs.src.split(
          "@._"
        )[0] + "@._V1_QL50.jpg",
      realted: Array.from(
        $(".rec_poster").map(function(index, element) {
          const id = $(this)
            .find("a")[0]
            .attribs.href.split("/")[2];
          const _data = $(this).find(".rec_poster_img")[0].attribs;
          return {
            id,
            poster: _data.loadlate.trim(),
            name: _data.title.trim()
          };
        })
      )
    });
  });
}

function getCast(id, n, callback) {
  request(
    `https://m.imdb.com/title/${id}/fullcredits/cast?ref_=m_ttfc_3`,
    (error, response, data) => {
      const $ = cheerio.load(data);
      let cast = [];
      let i = 0;
      while (i < n) {
        try {
          cast.push({
            name: $(`h4`)
              .slice(i, i + 1)
              .text(),
            image:
              $(".media-object")[i + 1].attribs.src.split("@._")[0] +
              "@._V1_QL50.jpg",
            role: $(".h4")
              .slice(i + 1, i + 2)
              .text()
              .split("\n")
              .join("")
          });
          i++;
        } catch (e) {
          i++;
        }
      }
      // console.log(cast)
      callback(null, { cast });
    }
  );
}

function getEpisode(id, season, callback) {
  request(
    `https://www.imdb.com/title/${id}/episodes/_ajax?season=${season}`,
    function(error, response, data) {
      const episodes = [];
      const $ = cheerio.load(data);
      $(".eplist > .list_item").each(function(i) {
        const story = $(
          `.eplist > div:nth-child(${i + 1}) > .info > .item_description`
        )
          .text()
          .trim();
        const posterElement = $(
          `div.list_item:nth-child(${i +
            1}) > div:nth-child(1) > a:nth-child(1) > div:nth-child(1) > img:nth-child(1)`
        )[0];
        episodes.push({
          poster: posterElement
            ? posterElement.attribs.src.split("@._")[0] + "@._V1_QL50.jpg"
            : null,
          name: $(
            `.eplist > div:nth-child(${i + 1}) > div.info > strong > a`
          ).text(),
          story: story.includes("about?") ? "N/A" : story,
          airDate: $(`.eplist > div:nth-child(${i + 1}) > .info > .airdate`)
            .text()
            .trim(),
          rating: $(
            `.eplist > div:nth-child(${i +
              1}) > .info > .ipl-rating-widget > .ipl-rating-star > .ipl-rating-star__rating`
          )
            .text()
            .trim()
        });
      });
      callback(error, episodes);
    }
  );
}
module.exports = { getCast, getFull, getEpisode };
