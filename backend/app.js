const ejs = require("ejs");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const express = require("express");
const session = require("express-session");
const { Keyboard } = require("puppeteer");
const BodyParser = require("body-parser");
const puppeteer = require("puppeteer-extra");
const { sub, add, format } = require("date-fns");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const user_router = require("./Routes/UserRoutes");
const email_router = require("./Routes/EmailRoutes");
const website_router = require("./Routes/websiteRoutes");
const Map_Data = require("./Models/MapDataModels");
const WithdrawList = require("./Models/WithdrawModels");
const Users_Data = require("./Models/LinkedinModles");
const linkedin_router = require("./Routes/LinkedinRoutes");

const map_router = require("./Routes/MapRoutes");

require("dotenv").config();
require("./config/databaseConnection");

const app = express();
const PORT = process.env.PORT || 4001;
jwtSecretKey = "loveee";

// const googleUsername = "arpityadav114697@gmail.com";
// const googlePassword = "arpit114@aims";

// const googleUsername = "roameramit2001@gmail.com";
// const googlePassword = "@mit12345678";

// const googleUsername = "yogesh1pqr@gmail.com";
// const googlePassword = "@mit12345678";

// ****************************************************************Middlee ware for the run the code Start****************************//
puppeteer.use(StealthPlugin());

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY || "sectionSecretKey",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cors());
app.use(express.json());
app.use(BodyParser.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(BodyParser.urlencoded({ extended: true }));
app.use(
  "/css",
  express.static(path.join(__dirname, "../frontend/template/css"))
);
app.use(
  "/fonts",
  express.static(path.join(__dirname, "../frontend/template/fonts"))
);
app.use(
  "/images",
  express.static(path.join(__dirname, "../frontend/template/images"))
);
app.use("/js", express.static(path.join(__dirname, "../frontend/template/js")));
app.use(
  "/pages",
  express.static(path.join(__dirname, "../frontend/template/pages"))
);
app.use(
  "/partials",
  express.static(path.join(__dirname, "../frontend/template/partials"))
);
app.use(
  "/scss",
  express.static(path.join(__dirname, "../frontend/template/scss"))
);
app.use(
  "/vendors",
  express.static(path.join(__dirname, "../frontend/template/vendors"))
);
app.use(
  "/plugins",
  express.static(path.join(__dirname, "../frontend/plugins"))
);

app.use(user_router);
app.use(email_router);
app.use(website_router);
app.use(linkedin_router);
app.use(map_router);
// ****************************************************************Middlee ware for the run the code End ****************************//

// Set Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/template"));

let array_of_profile_urls = [];
let array_of_profile_urls_is_connection = [];

// ****************************************************************Function For utiles Start****************************//

function getCurrentAndSixMonthsAgo(month_number) {
  try {
    const currentDateTime = new Date();
    const sixMonthsAgo = new Date(currentDateTime);

    sixMonthsAgo.setMonth(currentDateTime.getMonth() - month_number);

    const currentDateTimeStr = formatDateTime(currentDateTime);
    const sixMonthsAgoStr = formatDateTime(sixMonthsAgo);

    return {
      sixMonthsAgoStr,
    };
  } catch (error) {
    console.log(error);
  }
}

function formatDateTime(dateTime) {
  try {
    const day = padZero(dateTime.getDate());
    const month = padZero(dateTime.getMonth() + 1);
    const year = dateTime.getFullYear();
    const hours = padZero(dateTime.getHours());
    const minutes = padZero(dateTime.getMinutes());
    const seconds = padZero(dateTime.getSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.log(error);
  }
}

function padZero(value) {
  try {
    return value < 10 ? `0${value}` : value;
  } catch (error) {
    console.log(error);
  }
}
const result = getCurrentAndSixMonthsAgo(6);

async function getProfileUrls() {
  try {
    let profiles = await Users_Data.find(
      {
        $or: [{ is_visited: "0" }, { status: "0" }],
      },
      { profile_url: 1, _id: 0 }
    ).lean();

    // Extract profile URLs and save them in the global array
    array_of_profile_urls = profiles.map((profile) => profile.profile_url);

    return array_of_profile_urls; // If you want to return the array
  } catch (error) {
    console.error(error);
    return [];
  }
}

//
async function getNullEmailAndMobileProfiles() {
  try {
    let profiles = await Users_Data.find(
      { is_connection_send: 0 },
      { profile_url: 1, _id: 0 }
    ).lean();

    array_of_profile_urls_is_connection = profiles.map(
      (profile) => profile.profile_url
    );

    return array_of_profile_urls_is_connection; // If you want to return the array
  } catch (error) {
    console.error(error);
    return [];
  }
}

(async () => {
  await getProfileUrls();
})();

(async () => {
  await getNullEmailAndMobileProfiles();
})();

// ****************************************************************Function For utiles End****************************//
//
//
//
//
//
//
// ****************************************************************Email and Password for linkedin Start****************************//
// const email = "ramruhela413@gmail.com";
// const password = "Ruhela@#$1";

// const email = "amitcarpenter199@gmail.com";
// const password = "@mit9302394128";

// const email = "arpityadav114697@gmail.com";
// const password = "arpit114@aims";

const email = "amitamalva123@gmail.com";
const password = "@mit93023";

// const email = "amitcarpenter198@gmail.com";
// const password = "@mit9302394";

// ****************************************************************Email and Password for linkedin End****************************//
//
//
//
//
//
//
//
//
// ****************************************************************LinkedIn Automation Start ****************************//
let browser;
//only linkedin work here
(async () => {
  browser = await puppeteer.launch({ headless: false, defaultViewport: false });
  let page = await browser.newPage();
  await page.goto("https://www.linkedin.com/uas/login");
  await page.waitForSelector("#username");
  await page.type("#username", email);
  await page.type("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ timeout: 60000 });

  // Geet Data from the Comments
  try {
    app.post("/find_user_detail_from_comment", async (req, res) => {
      try {
        let linkedin_find_url = req.body.linkedin_comment_url;
        let category_from_body = req.body.user_category;
        console.log(category_from_body);

        // scroll page by inches
        const scrollPageByInches = async (inches) => {
          try {
            const pixelsPerInch = 96;
            const scrollDistance = inches * pixelsPerInch;

            await page.evaluate((distance) => {
              window.scrollBy(0, distance);
            }, scrollDistance);

            await page.waitForTimeout(2000);
          } catch (error) {
            console.log(error);
          }
        };

        // click comment Show
        async function clickCommentCounts() {
          try {
            const comment_count_elements = await page.$$(
              "li.social-details-social-counts__comments"
            );
            const numberOfComments_count = comment_count_elements.length;
            console.log(
              `Post comment Fount in page  : ${numberOfComments_count}`
            );

            for (let i = 0; i < numberOfComments_count; i++) {
              // if ((i = numberOfComments_count - 1)) {
              //   await page.waitForTimeout(3000);
              //   await page.$("button.scaffold-finite-scroll__load-button");
              //   await page.click("button.scaffold-finite-scroll__load-button");
              //   await page.waitForTimeout(3000);
              // }
              await comment_count_elements[i].click();
              console.log(`click comment post number ${i}`);
              await page.waitForTimeout(3000);
              await scrollPageByInches(5);
              console.log("scroll 5");
              // await page.waitForTimeout(3000);
              // await scrollPageByInches(2);
              await page.waitForTimeout(3000);
              console.log("waiting 3");

              const Load_more_Selector =
                "button.comments-comments-list__load-more-comments-button";
              let Load_More_Button;
              let load_more_button_if = await page.$(Load_more_Selector);
              if (load_more_button_if) {
                console.log("if load found 3");

                while (
                  (Load_More_Button = await page.$(Load_more_Selector)) !== null
                ) {
                  if (Load_More_Button) {
                    await Load_More_Button.click();
                    console.log("loadmore button click");
                    await page.waitForTimeout(2000);
                    await scrollPageByInches(3);
                    console.log("scroll in load 3");
                  }
                  // await scrollPageByInches(9);
                  await page.waitForTimeout(2000);
                }
              }

              const commentElements = await page.$$(".comments-comment-item");
              const numberOfComments = commentElements.length;
              console.log(`Number of comments Post ${i}: ${numberOfComments}`);
              await page.waitForTimeout(3000);

              async function saveToDatabase(commentInfo, category_from_body) {
                try {
                  console.log("Received commentInfo:", commentInfo);
                  console.log(
                    "Received category_from_body:",
                    category_from_body
                  );

                  if (commentInfo) {
                    commentInfo.category = category_from_body;
                  }

                  const existingUser = await Users_Data.findOne({
                    profile_url: commentInfo.profile_url,
                  });

                  if (!existingUser) {
                    const user = new Users_Data(commentInfo);
                    await user.save();
                    console.log("Saving data");
                  } else {
                    console.log("Duplicate data here");
                  }
                } catch (error) {
                  console.error("Error saving data to the database:", error);
                }
              }

              const { sub, add, format } = require("date-fns");
              async function extract_comment_data(category_from_body) {
                try {
                  let skipNext = false;
                  for (const commentElement of commentElements) {
                    if (skipNext) {
                      console.log("Skipping entire comment");
                      skipNext = false;
                      continue;
                    }
                    const nestedComment = await commentElement.$(
                      "article.comments-comment-item > .comment-social-activity > .comments-comment-item__nested-items > div"
                    );
                    if (nestedComment) {
                      console.log("if nested comment");
                      const data = await page.$eval(
                        "a.app-aware-link",
                        (element) => {
                          let name;
                          const rawName = element.querySelector(
                            ".comments-post-meta__name-text"
                          );
                          if (rawName) {
                            const rawNameText = rawName.textContent.trim();
                            name = rawNameText
                              .replace(/View.*profile/i, "")
                              .trim();
                          }
                          const link = element.getAttribute("href");
                          return { name, link };
                        }
                      );
                      await saveToDatabase(data, category_from_body);
                      console.log("Skipping nested comment save data");
                      // skipNext = true;
                      continue;
                    } else {
                      // Extract information from each comment element
                      console.log("continue process with the other code ");
                      const commentInfo = await page.evaluate((comment) => {
                        try {
                          const rawName = comment.querySelector(
                            ".comments-post-meta__name-text"
                          );
                          const profileLink = comment.querySelector(
                            ".comments-post-meta__actor-link"
                          );
                          const commentTextElement = comment.querySelector(
                            ".comments-comment-item-content-body"
                          );
                          const technologyElement = comment.querySelector(
                            ".comments-post-meta__headline"
                          );
                          const timestampElement = comment.querySelector(
                            ".comments-comment-item__timestamp"
                          );

                          if (
                            rawName &&
                            profileLink &&
                            commentTextElement &&
                            technologyElement &&
                            timestampElement
                          ) {
                            const rawNameText = rawName.innerText.trim();
                            const name = rawNameText
                              .replace(/View.*profile/i, "")
                              .trim();
                            const profileUrl = profileLink.getAttribute("href");
                            const commentText =
                              commentTextElement.innerText.trim();
                            const technology =
                              technologyElement.innerText.trim();
                            const timestamp = timestampElement.innerText.trim();
                            console.log("timestamp_commeent_time", timestamp);

                            function padZero(value) {
                              try {
                                return value < 10 ? `0${value}` : value;
                              } catch (error) {
                                console.log(error);
                              }
                            }

                            function formatDateTime(dateTime) {
                              try {
                                const day = padZero(dateTime.getDate());
                                const month = padZero(dateTime.getMonth() + 1);
                                const year = dateTime.getFullYear();
                                const hours = padZero(dateTime.getHours());
                                const minutes = padZero(dateTime.getMinutes());
                                const seconds = padZero(dateTime.getSeconds());

                                return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
                              } catch (error) {
                                console.log(error);
                              }
                            }

                            function calculateUpdatedDateTime(timeInterval) {
                              try {
                                const units = {
                                  m: "minutes",
                                  d: "days",
                                  w: "weeks",
                                  mo: "months",
                                };

                                // Parse the time interval
                                const match = timeInterval.match(
                                  /([+-]?\d+)(\[?[mdw]+\]?)/
                                );
                                if (!match) {
                                  throw new Error(
                                    "Invalid time interval format"
                                  );
                                }

                                const value = parseInt(match[1]);
                                const unit = match[2];
                                if (!units[unit]) {
                                  throw new Error("Invalid time unit");
                                }
                                let currentDate = new Date();

                                if (unit !== "mo") {
                                  currentDate =
                                    value >= 0
                                      ? sub(currentDate, {
                                          [units[unit]]: value,
                                        })
                                      : add(currentDate, {
                                          [units[unit]]: Math.abs(value),
                                        });
                                } else {
                                  const currentMonth = currentDate.getMonth();
                                  const targetMonth = currentMonth + value;

                                  // Adjust the year if necessary
                                  const targetYear =
                                    currentDate.getFullYear() +
                                    Math.floor(targetMonth / 12);

                                  // Adjust the target month to the correct range (0 to 11)
                                  const adjustedTargetMonth = targetMonth % 12;

                                  currentDate = new Date(
                                    targetYear,
                                    adjustedTargetMonth,
                                    currentDate.getDate()
                                  );
                                }

                                // Format the updated date and time as strings
                                const updatedDateString = format(
                                  currentDate,
                                  "dd-MM-yyyy"
                                );
                                console.log(updatedDateString);
                                const updatedTimeString = format(
                                  currentDate,
                                  "hh:mm:ss a"
                                );
                                // const Full_data_here =
                                //   updatedDateString + " " + updatedTimeString;

                                return {
                                  updatedDateString,
                                };
                              } catch (error) {
                                console.log(error);
                              }
                            }

                            function getCurrentAndSixMonthsAgo(month_number) {
                              try {
                                const currentDateTime = new Date();
                                const sixMonthsAgo = new Date(currentDateTime);

                                sixMonthsAgo.setMonth(
                                  currentDateTime.getMonth() - month_number
                                );

                                const currentDateTimeStr =
                                  formatDateTime(currentDateTime);
                                const sixMonthsAgoStr =
                                  formatDateTime(sixMonthsAgo);

                                return {
                                  sixMonthsAgoStr,
                                };
                              } catch (error) {
                                console.log(error);
                              }
                            }

                            let firstCharacter = timestamp.charAt(0);
                            let numericValue = parseInt(firstCharacter);

                            let comment_date;
                            if (timestamp.length > 2) {
                              console.log("if length 2 more");
                              let result =
                                getCurrentAndSixMonthsAgo(numericValue);
                              comment_date = result.sixMonthsAgoStr;
                            } else {
                              console.log("else calculate");
                              let result = calculateUpdatedDateTime(timestamp);
                              console.log(result);
                              comment_date = result;
                            }

                            return {
                              name: name,
                              profile_image_link: null,
                              commentText: commentText,
                              comment_date: comment_date,
                              technology: technology,
                              profile_url: profileUrl,
                              location: null,
                            };
                          }
                        } catch (error) {
                          console.log(error);
                        }
                      }, commentElement);
                      console.log("save in the databse");
                      await saveToDatabase(commentInfo, category_from_body);
                    }
                  }
                } catch (error) {
                  console.log(error);
                }
              }

              await extract_comment_data(category_from_body);
              await page.waitForTimeout(3000);
            }
          } catch (error) {
            console.log(error);
          }
        }
        await page.waitForTimeout(2000);
        await page.goto(linkedin_find_url);
        await page.waitForTimeout(6000);
        await clickCommentCounts();
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }

  // Get Data fromm the people
  try {
    app.post("/find_user_detail_from_people", async (req, res) => {
      try {
        let linkedin_find_user_from_people = req.body.linkedin_people_url;
        let category = req.body.user_category;

        async function searchResultsFunctionForWithdraw() {
          try {
            // Increase the timeout if needed
            await page.waitForTimeout(5000);

            const searchResults = await page.$$(".entity-result__title-text");
            console.log(searchResults.length, "searchResults.length");

            for (let i = 0; i < searchResults.length; i++) {
              const result = searchResults[i];
              const link = await result.$("a.app-aware-link");

              if (link) {
                const linkText = await link.getProperty("href");
                const href = await linkText.jsonValue();

                if (
                  !href.includes(
                    "https://www.linkedin.com/search/results/people/headless"
                  )
                ) {
                  const existingLink = await Users_Data.findOne({
                    profile_url: href,
                  });

                  if (!existingLink) {
                    const newLink = new Users_Data({
                      profile_url: href,
                      category: category,
                    });

                    await newLink.save();
                  } else {
                    console.log("data already exist");
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error:", error);
          }
        }

        // Scroll the Page
        const scrollPage = async () => {
          try {
            await page.evaluate(() => {
              window.scrollBy(0, window.innerHeight + 100000);
            });

            await page.waitForTimeout(2000);
            const MoreFeedButton = await page.$(
              "div.display-flex > button.scaffold-finite-scroll__load-button  > span.artdeco-button__text"
            );
            if (MoreFeedButton) {
              await MoreFeedButton.click();
            }
          } catch (error) {
            console.log("e");
          }
        };

        //Function for the connection Withdraw links
        const scrollAndPushLinksForConnetionWithdraw = async () => {
          try {
            await page.waitForTimeout(3000);
            await scrollPage();
            let whileLoop = true;
            while (whileLoop) {
              await searchResultsFunctionForWithdraw();
              const nextButton = await page.$(
                ".artdeco-pagination__button--next > .artdeco-button__text"
              );
              if (nextButton) {
                await nextButton.click();
                await page.waitForNavigation();
                await scrollPage();
                const breaktheWhileLoop = await page.$(
                  ".artdeco-button--disabled"
                );
                if (breaktheWhileLoop) {
                  await scrollPage();
                  await searchResultsFunctionForWithdraw();
                  whileLoop = false;
                  return whileLoop;
                }
              } else {
                break;
              }
            }
          } catch (error) {
            console.log("e");
          }
        };

        await page.goto(linkedin_find_user_from_people, {
          waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(3000);
        await scrollAndPushLinksForConnetionWithdraw();
        await page.waitForTimeout(4000);

        const apiUrl = "http://localhost:5001/get_detail_from_profile_url";
        const apiResponse = await axios.post(apiUrl, { data: "your data" });
        console.log("API Response:", apiResponse.data);
        return res.status(200).json({ message: "success" });
      } catch (error) {
        console.log("e");
      }
    });
  } catch (error) {
    console.log(error);
  }

  // Get detail from the profile
  try {
    app.post("/get_detail_from_profile_url", async (req, res) => {
      try {
        const page = await browser.newPage();
        let imageSrc;
        let location;
        let email;
        let uiUxDesignerText;
        let name;
        for (const link of array_of_profile_urls) {
          await page.goto(link, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(3000);

          // Profile Image of user
          const imgElement = await page.$(
            ".pv-top-card-profile-picture__image"
          );
          if (imgElement) {
            imageSrc = imgElement
              ? await imgElement.evaluate((node) => node.src)
              : null;

            console.log(imageSrc, "imagescr");
          }

          try {
            name = await page.$eval(".text-heading-xlarge", (element) => {
              return element ? element.innerText.trim() : null;
            });

            if (name) {
              console.log("Name:", name);
            }
          } catch (error) {
            console.error("Error:", error);
          }

          try {
            uiUxDesignerText = await page.$eval(
              ".text-body-medium.break-words",
              (element) => {
                return element ? element.innerText.trim() : null;
              }
            );

            if (uiUxDesignerText) {
              console.log("UI/UX Designer Text:", uiUxDesignerText);
            }
          } catch (error) {
            console.error("Error:", error);
          }

          // Find Location
          const spanElement_location = await page.$(
            "div.mt2 > .text-body-small"
          );

          // Check if the element exists
          if (spanElement_location) {
            location = await page.evaluate(
              (spanElement_location) => spanElement_location.textContent.trim(),
              spanElement_location
            );

            console.log(location);
          } else {
          }

          const fourthButtonInnerText = await page.evaluate(() => {
            const buttonElements = document.querySelectorAll(
              ".artdeco-button--secondary .artdeco-button__text"
            );
            console.log("Number of matching elements:", buttonElements.length);

            if (buttonElements.length >= 4) {
              const fourthButtonElement = buttonElements[3];

              console.log(
                "Inner text of the 4th element:",
                fourthButtonElement.innerText.trim()
              );
              if (fourthButtonElement.innerText.trim() === "Pending") {
                console.log("Update the database!");
              }
              return fourthButtonElement.innerText.trim();
            } else {
              return null;
            }
          });

          console.log("Inner text of the 4th button:", fourthButtonInnerText);

          const contactInfoButton = await page.$(
            "#top-card-text-details-contact-info"
          );
          if (contactInfoButton) {
            await contactInfoButton.click();
            console.log("Clicked on the contact info button");
          } else {
            console.log("Contact info button not found");
          }

          await page.waitForTimeout(3000);
          const htmlContent = await page.content();

          // const emailRegex = /[\w]*[\w\.]*(?!\.)@gmail.com/g;
          const emailRegex = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;
          const matches = htmlContent.match(emailRegex);

          email = matches ? matches[0] : null;

          if (email) {
            console.log(email);
            await Users_Data.findOneAndUpdate(
              { profile_url: link },
              {
                status: 1,
              },
              { new: true }
            );
          } else {
            await Users_Data.findOneAndUpdate(
              { profile_url: link },
              {
                status: 0,
              },
              { new: true }
            );
            console.log("Email not found");
          }

          // update in database
          await Users_Data.findOneAndUpdate(
            { profile_url: link },
            {
              profile_image_link: imageSrc,
              location: location,
              user_email: email,
              is_visited: 1,
              technology: uiUxDesignerText,
              name: name,
            },
            { new: true }
          );
        }
        await page.close();
        return res.status(200).json({ array_of_profile_urls });
      } catch (error) {
        console.log(error);
        await page.close();
      }
    });
  } catch (error) {
    console.log("catch");
    console.log(error);
  }

  // Send Connection to user
  try {
    app.post("/send_connection_request", async (req, res) => {
      try {
        let note_for_user = req.body.note_for_user;
        const page = await browser.newPage();
        let count_For_Connection = 0;
        let imageSrc;
        let location;
        let email;
        for (const link of array_of_profile_urls_is_connection) {
          await page.goto(link, { waitUntil: "domcontentloaded" });

          await page.waitForTimeout(3000);
          await page.waitForSelector(
            ".artdeco-button--secondary .artdeco-button__text",
            { timeout: 15000 }
          );
          const fourthButtonInnerText = await page.evaluate(() => {
            const buttonElements = document.querySelectorAll(
              ".artdeco-button--secondary .artdeco-button__text"
            );

            console.log("Number of matching elements:", buttonElements.length);

            if (buttonElements.length >= 4) {
              const fourthButtonElement = buttonElements[3];

              console.log(
                "Inner text of the 4th element:",
                fourthButtonElement.innerText.trim()
              );

              if (fourthButtonElement.innerText.trim() === "Pending") {
                console.log("Update the database!");
              }

              return fourthButtonElement.innerText.trim();
            } else {
              return null;
            }
          });
          console.log("Inner text of the 4th button:", fourthButtonInnerText);

          await page.waitForSelector(".artdeco-button--primary", {
            timeout: 15000,
          });

          if (
            fourthButtonInnerText !== "Pending" &&
            fourthButtonInnerText !== null
          ) {
            const buttonText = await page.evaluate(() => {
              const connectButton = document.getElementsByClassName(
                "artdeco-button--primary"
              )[1];
              return connectButton ? connectButton.innerText.trim() : null;
            });

            if (buttonText === "Connect") {
              await page.evaluate(() => {
                const connectButton = document.getElementsByClassName(
                  "artdeco-button--primary"
                )[1];
                connectButton.click();
              });
            } else {
              console.log('Button inner text is not "Connect"');
              const MoreButton = await page.$(
                "div.pvs-profile-actions >.artdeco-dropdown > button"
              );
              if (MoreButton) {
                console.log("morebutton Clicked");
                await MoreButton.click();
              }
              // await page.waitForTimeout(2000);
              const ConnectButtonOn3 = await page.$$(
                ".artdeco-dropdown__content-inner > ul > li > div.artdeco-dropdown__item--is-dropdown > span.flex-1"
              );
              if (
                ConnectButtonOn3.length > 10 &&
                ConnectButtonOn3.length < 10
              ) {
                console.log("connect length uper niche");
                continue;
              }
              if (ConnectButtonOn3.length == 10) {
                const innerHTML = await page.evaluate((element) => {
                  return element ? element.innerHTML.trim() : null;
                }, ConnectButtonOn3[7]);
                console.log(innerHTML, "amit test");

                if (innerHTML === "Connect") {
                  // Inner HTML is "Connect", proceed to click
                  await ConnectButtonOn3[7].click();
                  console.log("Clicked the Connect button");
                } else {
                  console.log('Inner HTML is not "Connect". Skipping click.');
                }
              }
            }

            await page.waitForTimeout(2000);
            const NoteWriteButton = await page.$(
              "div.artdeco-modal__actionbar > button.artdeco-button--2 >span"
            );
            if (note_for_user) {
              if (NoteWriteButton) {
                await NoteWriteButton.click();
                await page.waitForTimeout(2000);
                console.log("note Click");
                const textareaSelector = "textarea#custom-message";
                await page.waitForTimeout(1000);
                if (!(await page.$(textareaSelector))) {
                  console.log("Textarea not found. Skipping this profile.");
                  continue;
                }
                if (textareaSelector) {
                  // Type the text into the input box
                  await page.type(textareaSelector, note_for_user);
                  await page.waitForTimeout(1000);
                  const NoteWriteButtons = await page.$$(
                    "div.artdeco-modal__actionbar > button.artdeco-button--2 > span"
                  );
                  if (NoteWriteButtons.length >= 2) {
                    await NoteWriteButtons[1].click();
                  }
                }
              }
            } else {
              const sendWithoutNoteButton = await page.$$(
                "div.artdeco-modal__actionbar > button.artdeco-button--2 > span"
              );

              if (sendWithoutNoteButton.length > 1) {
                const innerText = await page.evaluate((element) => {
                  return element ? element.innerText.trim() : null;
                }, sendWithoutNoteButton[1]);

                if (innerText === "Send without a note") {
                  await sendWithoutNoteButton[1].click();
                  console.log('Clicked the "Send without a note" button');
                  await page.waitForTimeout(3000);
                  await Users_Data.findOneAndUpdate(
                    { profile_url: link },
                    {
                      is_connection_send: 1,
                    },
                    { new: true }
                  );
                } else {
                  console.log(
                    'Inner text is not "Send without a note". Skipping click.'
                  );
                }
              } else {
                console.log("Button not found");
                continue;
              }
            }
          }

          await page.waitForTimeout(3000);

          // update in database
          await Users_Data.findOneAndUpdate(
            { profile_url: link },
            {
              is_connection_send: 1,
            },
            { new: true }
          );
        }
        res.status(200).json({ array_of_profile_urls });
        await page.close();
      } catch (error) {
        console.log(error);
        await page.close();
      }
    });
  } catch (error) {
    console.log(error);
  }

  // Withdraw Connection
  try {
    app.post("/connection_withdrawal", async (req, res) => {
      try {
        let links = [];
        let last30Links = [];
        const page = await browser.newPage();
        let lastlinkByuser = req.body.numberLinksWithdraw;
        const ConntionWithSent =
          "https://www.linkedin.com/mynetwork/invitation-manager/sent/";
        //
        //
        // Function for search result For the Withdraw Connection
        async function searchResultsFunctionForWithdraw() {
          await page.waitForTimeout(3000);
          const searchResults = await page.$$(".invitation-card__details");
          let countForWithdrawLength = 0;
          for (let i = 0; i < searchResults.length; i++) {
            const result = searchResults[i];
            const link = await result.$("a[data-test-app-aware-link]");
            if (link) {
              const linkText = await link.getProperty("href");
              const href = await linkText.jsonValue();
              const existingLink = await WithdrawList.findOne({
                profile_link: href,
              });

              if (!existingLink) {
                const newLink = new WithdrawList({ profile_link: href });
                await newLink.save();
                console.log(`New link added: ${href}`);
              } else {
                console.log(`Link already exists: ${href}`);
              }
              countForWithdrawLength++;
              links.push(href);
            }
          }
        }

        // Scroll the Page
        const scrollPage = async () => {
          await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight + 100000);
          });
          await page.waitForTimeout(2000);
          const MoreFeedButton = await page.$(
            "div.display-flex > button.scaffold-finite-scroll__load-button  > span.artdeco-button__text"
          );
          if (MoreFeedButton) {
            await MoreFeedButton.click();
          }
        };

        //Function for the connection Withdraw links
        const scrollAndPushLinksForConnetionWithdraw = async () => {
          await page.waitForTimeout(3000);
          await scrollPage();
          let whileLoop = true;
          while (whileLoop) {
            await searchResultsFunctionForWithdraw();
            const nextButton = await page.$(
              ".artdeco-pagination__button--next > .artdeco-button__text"
            );
            if (nextButton) {
              await nextButton.click();
              await page.waitForTimeout(3000);
              await scrollPage();
              const breaktheWhileLoop = await page.$(
                ".artdeco-button--disabled"
              );
              if (breaktheWhileLoop) {
                await scrollPage();
                await searchResultsFunctionForWithdraw();
                whileLoop = false;
                return whileLoop;
              }
            } else {
              break;
            }
          }
        };

        await page.goto(ConntionWithSent, { waitUntil: "domcontentloaded" });

        await scrollAndPushLinksForConnetionWithdraw();
        fs.appendFileSync("links2.txt", links.join("\n") + "\n");
        last30Links.push(...links);
        if (last30Links.length > 10) {
          last30Links.splice(0, last30Links.length - lastlinkByuser);
        }

        // Generate the dynamic file name

        fs.writeFileSync("withdraw_links_txt", last30Links.join("\n"));

        let countForWithdraw = 0;
        for (const link of last30Links) {
          await page.goto(link, { waitUntil: "domcontentloaded" });

          // Search for elements by their IDs and click them
          await page.waitForTimeout(2000);
          await page.waitForSelector(".pvs-profile-actions__action");

          const spanElements = await page.$$(
            ".pvs-profile-actions__action > .artdeco-button__text"
          );

          if (!spanElements) {
            continue;
          } else {
            if (spanElements.length >= 2) {
              await spanElements[1].click();
              try {
                await page.waitForTimeout(2000);
                const ConfirmButton = await page.$(".artdeco-button--primary");
                if (ConfirmButton) {
                  await ConfirmButton.click();
                  await page.waitForTimeout(2000);
                } else {
                }
              } catch (error) {
                console.log("Error:", error.message);
              }
            }
          }

          countForWithdraw++;

          try {
            await WithdrawList.findOneAndUpdate(
              { profile_link: link },
              {
                $set: {
                  is_visited: 1,
                },
              },
              { new: true, upsert: true }
            );
          } catch (error) {
            console.error("Error updating limitConnection:", error);
          }
        }
        res.status(200).json({ last30Links });
        await page.close();
      } catch (error) {
        console.log(error);
        await page.close();
      }
    });
  } catch (error) {
    console.log(error);
  }

  //linkedin profile from website
  try {
    app.post("/website_data_for_linkedin", async (req, res) => {
      const links = [];
      const Website_URL = req.body.url;
      const limitOfSearch = req.body.limitsearch;
      const Categroy = req.body.category;
      const page = await browser.newPage();

      // Go to Provided Link
      await page.goto(Website_URL);

      // Function to scroll the page and load more search results
      const Scroll_Page = async () => {
        try {
          await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight + 8000);
          });
          await page.waitForTimeout(2000);
          const ScrollClick = await page.$(".kQdGHd");
          if (ScrollClick) {
            await ScrollClick.click();
          }
        } catch (error) {
          console.log(error);
        }
      };

      const Add_Links_To_Array = async () => {
        try {
          await page.waitForSelector(".tF2Cxc");
          const searchResults = await page.$$(".tF2Cxc a");
          for (let i = 0; i < searchResults.length; i++) {
            const result = searchResults[i];
            const link = await result.getProperty("href");
            const linkText = await link.jsonValue();
            if (linkText.startsWith("https://www.linkedin.com/in")) {
              if (!links.includes(linkText)) {
                links.push(linkText);
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      };

      let Links_Length = links.length;
      let countForScroll = 0;
      while (limitOfSearch > Links_Length && countForScroll < 30) {
        await Scroll_Page();
        await Add_Links_To_Array();
        Links_Length = links.length;
        console.log("Links_Length =>", Links_Length);
        countForScroll++;
        console.log(countForScroll);
        console.log("links For the Array =>", links.length);
      }
      console.log(links.length, "LInkks Length -<");

      // Function For Scrape The Email
      const scrapeEmails = async (link) => {
        const newPage = await browser.newPage();

        let imageSrc;
        let location;
        let email;
        let uiUxDesignerText;
        let name;
        await page.goto(link, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(3000);
        const imgElement = await page.$(".pv-top-card-profile-picture__image");
        if (imgElement) {
          imageSrc = imgElement
            ? await imgElement.evaluate((node) => node.src)
            : null;

          console.log(imageSrc, "imagescr");
        }
        try {
          name = await page.$eval(".text-heading-xlarge", (element) => {
            return element ? element.innerText.trim() : null;
          });

          if (name) {
            console.log("Name:", name);
          }
        } catch (error) {
          console.error("Error:", error);
        }

        try {
          uiUxDesignerText = await page.$eval(
            ".text-body-medium.break-words",
            (element) => {
              return element ? element.innerText.trim() : null;
            }
          );

          if (uiUxDesignerText) {
            console.log("UI/UX Designer Text:", uiUxDesignerText);
          }
        } catch (error) {
          console.error("Error:", error);
        }

        // Find Location
        const spanElement_location = await page.$("div.mt2 > .text-body-small");

        // Check if the element exists
        if (spanElement_location) {
          location = await page.evaluate(
            (spanElement_location) => spanElement_location.textContent.trim(),
            spanElement_location
          );

          console.log(location);
        } else {
        }

        const fourthButtonInnerText = await page.evaluate(() => {
          const buttonElements = document.querySelectorAll(
            ".artdeco-button--secondary .artdeco-button__text"
          );
          if (buttonElements.length >= 4) {
            const fourthButtonElement = buttonElements[3];
            if (fourthButtonElement.innerText.trim() === "Pending") {
              console.log("Update the database!");
            }
            return fourthButtonElement.innerText.trim();
          } else {
            return null;
          }
        });
        const contactInfoButton = await page.$(
          "#top-card-text-details-contact-info"
        );
        if (contactInfoButton) {
          await contactInfoButton.click();
          console.log("Clicked on the contact info button");
        } else {
          console.log("Contact info button not found");
        }

        await page.waitForTimeout(3000);
        const htmlContent = await page.content();
        const emailRegex = /[\w]*[\w\.]*(?!\.)@gmail.com/g;
        const matches = htmlContent.match(emailRegex);

        // Extract the first match
        email = matches ? matches[0] : null;

        if (email) {
          console.log(email);
          await Users_Data.findOneAndUpdate(
            { profile_url: link },
            {
              status: 1,
            },
            { new: true }
          );
        } else {
          await Users_Data.findOneAndUpdate(
            { profile_url: link },
            {
              status: 0,
            },
            { new: true }
          );
          console.log("Email not found");
        }
        const filter = { profile_url: link };
        const update = {
          profile_url: link,
          profile_image_link: imageSrc,
          location: location,
          user_email: email,
          is_visited: 1,
          technology: uiUxDesignerText,
          name: name,
        };

        // Use the upsert option to create a new record if it doesn't exist
        const options = { upsert: true, new: true };

        await Users_Data.findOneAndUpdate(filter, update, options);
        // }
        res.status(200).json({ array_of_profile_urls });
      };
      console.log(links);
      for (const link of links) {
        await Users_Data.create({ profile_url: link });
      }
      for (const link of links) {
        await Users_Data.create({ profile_url: link });
        await scrapeEmails(link);
      }
      await browser.close();
      console.log("End The Browser");
    });
  } catch (error) {
    console.log(error);
  }
})();

// ****************************************************************LinkedIn Autommation End****************************//
//
//
//
//
//
//
//
//
// From google site
// ****************************************************************Google Automation Start****************************//
(async () => {
  try {
    try {
      app.post("/companies_data_from_map", async (req, res) => {
        try {
          const Map_URL = req.body.map_url;
          const limitOfSearch = req.body.limitsearch;
          let Categroy_for_normal_map = req.body.map_category;
          const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: false,
          });

          const page = await browser.newPage();
          await page.goto(Map_URL, { waitUntil: "domcontentloaded" });

          // Function for click next button
          const NextButtonClickFunction = async () => {
            try {
              await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight + 10000);
              });
              await page.waitForTimeout(2000);
              const nextButtonSelector = "#pnnext";
              const nextButton = await page.$(nextButtonSelector);

              if (nextButton) {
                try {
                  await nextButton.click();
                  await page.waitForNavigation({
                    waitUntil: "domcontentloaded",
                  });
                } catch (error) {
                  console.error(
                    'Error clicking the "Next" button:',
                    error.message
                  );
                }
              } else {
              }
            } catch (error) {
              console.log("e");
            }
          };

          // function scrape data
          async function scrapeDataFromElement(element) {
            try {
              const data = await element.evaluate((element) => {
                const companyElement = element.querySelector(
                  ".rllt__details span.OSrXXb"
                );
                const ratingElement = element.querySelector(
                  ".rllt__details span.yi40Hd"
                );
                const ratedByElement = element.querySelector(
                  ".rllt__details span.RDApEe"
                );
                const addressElement = element.querySelector(
                  ".rllt__details div:nth-child(3)"
                );
                const openHoursElement = element.querySelector(
                  ".rllt__details div:nth-child(4)"
                );
                const phoneNumberElement = element.querySelector(
                  ".rllt__details div:nth-child(5)"
                );
                const websiteLinkElement = element.querySelector("a.L48Cpd");
                const directionsLinkElement = element.querySelector(
                  ".yYlJEf.VByer.Q7PwXb.VDgVie.brKmxb"
                );

                const companyName = companyElement
                  ? companyElement.innerText.trim()
                  : "";
                const rating = ratingElement
                  ? ratingElement.innerText.trim()
                  : "";
                const ratedBy = ratedByElement
                  ? ratedByElement.innerText.trim()
                  : "";
                const address = addressElement
                  ? addressElement.innerText.trim()
                  : "";
                const openHoursText = openHoursElement
                  ? openHoursElement.innerText.trim()
                  : "";

                // Extract only the phone number part
                const phoneNumberMatch = phoneNumberElement
                  ? phoneNumberElement.innerText.match(/\d+/)
                  : null;
                const phoneNumber = phoneNumberMatch ? phoneNumberMatch[0] : "";

                const websiteLink = websiteLinkElement
                  ? websiteLinkElement.getAttribute("href")
                  : "";
                const directionsLink = directionsLinkElement
                  ? directionsLinkElement.getAttribute("href")
                  : "";

                return {
                  companyName,
                  rating,
                  ratedBy,
                  address,
                  MobileNumber: openHoursText,
                  phoneNumber,
                  websiteLink,
                  directionsLink,
                };
              }, element);

              const existingData = await Map_Data.findOne({
                companyName: data.companyName,
              });

              if (!existingData) {
                await Map_Data.create(data);
                await Map_Data.findOneAndUpdate(
                  { companyName: data.companyName },
                  {
                    $set: {
                      category: Categroy_for_normal_map,
                    },
                  },
                  { new: true, upsert: true }
                );
                // console.log(data.companyName);
              } else {
                // console.log("Duplicate data. Skipping:");
              }
            } catch (error) {
              console.log("e");
            }
          }

          const PushLinkSForWebsiteFunction = async () => {
            try {
              const searchResults = await page.$$(".VkpGBb");
              // console.log(searchResults.length, "searchResults");

              const limitOfSearch =
                req.body.limitsearch || searchResults.length;

              for (
                let i = 0;
                i < limitOfSearch && i < searchResults.length;
                i++
              ) {
                const result = searchResults[i];
                await scrapeDataFromElement(result);
                // console.log(i);
              }
            } catch (error) {
              console.log("e");
            }
          };

          const tdLength = await page.evaluate(() => {
            const table = document.querySelector("table.AaVjTc");
            if (!table) {
              // console.log("table Not Fount");
              return 0;
            }
            const tdElements = table.querySelectorAll("td");
            // console.log(tdElements.length);
            return tdElements.length;
          });

          // console.log("tdlength  ", tdLength);
          const NextButtonClick = await page.$(".d6cvqb > a");
          let countForwhile = 3;

          do {
            await page.waitForTimeout(3000);
            await PushLinkSForWebsiteFunction();
            await page.waitForTimeout(3000);
            await NextButtonClickFunction();
            await page.waitForTimeout(3000);
            countForwhile++;
            // console.log(countForwhile);
          } while (countForwhile < tdLength);
          await page.close();
          console.log("Process Done");
          await browser.close();
          return res.status(200).json({ message: "success" });
        } catch (error) {
          console.log("e");
        }
      });
    } catch (error) {
      console.log("e");
    }

    try {
      app.post("/companies_data_from_map_usa", async (req, res) => {
        try {
          countError = 0;
          const Map_URL_USA = req.body.map_url;
          const limitOfSearch = req.body.limitsearch || 100;
          let categoryString = req.body.map_category;
          const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: false,
          });
          const page = await browser.newPage();
          await page.goto(Map_URL_USA, { waitUntil: "domcontentloaded" });
          let count_click_next_button = 0;
          const waitForTimeout = async (milliseconds) => {
            await page.waitForTimeout(milliseconds);
          };
          const NextButtonClickFunction = async () => {
            try {
              await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight * 10);
              });

              await page.waitForTimeout(2000);
              const nextButtonSelector =
                "#yDmH0d > c-wiz > div > div:nth-child(3) > div > div > div.XJInM > div.YhtaGd.aQOEkf > div.jq95K > c-wiz > div > div > div.LOBMz > div > div > button";
              const nextButtonIndex = count_click_next_button % 2;
              const nextButtons = await page.$$(nextButtonSelector);

              if (nextButtons && count_click_next_button == 0) {
                try {
                  await nextButtons[nextButtonIndex].click();

                  // console.log(
                  //   `Clicked the ${
                  //     nextButtonIndex === 0 ? "first" : "second"
                  //   } "Next" button`
                  // );
                  count_click_next_button++;
                } catch (error) {
                  console.error('Error clicking the "Next" button:');
                }
              }
              if (nextButtons && count_click_next_button > 0) {
                try {
                  await nextButtons[1].click();
                } catch (error) {
                  countError++;
                  console.error('Error clicking the "Next" button:');
                }
              }
            } catch (error) {
              console.log("e");
            }
          };

          async function scrapeDataFromElement(element) {
            try {
              const data = await element.evaluate((element) => {
                const companyElement = element.querySelector(".rgnuSb");
                const ratingElement = element.querySelector(".rGaJuf");
                const ratedByElement = element.querySelector(".leIgTe");
                let address;
                const addressElements = element.querySelectorAll(
                  ".hGz87c:nth-last-child(2)"
                );
                if (addressElements.length >= 2) {
                  const secondAddressElement =
                    addressElements[addressElements.length - 1];
                  address = secondAddressElement
                    ? secondAddressElement.innerText.trim()
                    : "";
                  // console.log("Second Address:", address);
                } else {
                  // console.log("Not enough elements matching the selector");
                }

                let phoneNumber;
                const phoneNumberElement = element.querySelector(
                  "[data-phone-number]"
                );
                if (phoneNumberElement) {
                  phoneNumber =
                    phoneNumberElement.getAttribute("data-phone-number");
                } else {
                }
                let websiteLink;
                const linkElement = element.querySelector(
                  "div.fQqZ2e > div.SJyhnc > .xbmkib >.zuotBc >a"
                );
                if (linkElement) {
                  websiteLink = linkElement.getAttribute("href");
                  // console.log("Website Link:", websiteLink);
                } else {
                  // console.log("Website link element not found");
                }

                const directionsLinkElement = element.querySelector(
                  "div.zuotBc > div > a"
                );

                const companyName = companyElement
                  ? companyElement.innerText.trim()
                  : "";
                const rating = ratingElement
                  ? ratingElement.innerText.trim()
                  : "";
                const ratedBy = ratedByElement
                  ? ratedByElement.innerText.trim().replace(/\D/g, "")
                  : "";

                const directionsLink = directionsLinkElement
                  ? directionsLinkElement.getAttribute("href")
                  : "";
                return {
                  companyName,
                  rating,
                  ratedBy,
                  address,
                  MobileNumber: phoneNumber,
                  websiteLink,
                  directionsLink,
                };
              }, element);

              const existingData = await Map_Data.findOne({
                companyName: data.companyName,
              });

              if (!existingData) {
                await Map_Data.create(data);
                await Map_Data.findOneAndUpdate(
                  { companyName: data.companyName },
                  {
                    $set: {
                      category: categoryString,
                    },
                  },
                  { new: true, upsert: true }
                );
              } else {
              }
            } catch (error) {
              console.log("e");
            }
          }

          const PushLinkSForWebsiteFunction = async () => {
            try {
              const searchResults = await page.$$(`div[jsname="gam5T"]`);
              // console.log(searchResults.length, "searchResults");
              const limitOfSearch =
                req.body.limitsearch || searchResults.length;
              for (
                let i = 0;
                i < limitOfSearch && i < searchResults.length;
                i++
              ) {
                const result = searchResults[i];
                await scrapeDataFromElement(result);
              }
            } catch (error) {
              // console.log(error);
            }
          };

          for (
            let countForwhile = 0;
            countForwhile < limitOfSearch && countError < 3;
            countForwhile++
          ) {
            try {
              await waitForTimeout(3000);
              await PushLinkSForWebsiteFunction(limitOfSearch);
              // console.log("push links");

              await waitForTimeout(3000);
              await NextButtonClickFunction();
              // console.log("next button");
              await waitForTimeout(3000);
              // console.log(countForwhile);
            } catch (error) {
              console.log("e");
            }
          }
          await page.close();
          await browser.close();
          console.log("Process Done");
          return res.status(200).json({ message: "success" });
        } catch (error) {
          console.log("e");
        }
      });
    } catch (error) {
      console.log("e");
    }

    // Website Email Extractor
    try {
      app.post("/website_data", async (req, res) => {
        const links = [];
        const Website_URL = req.body.url;
        const limitOfSearch = req.body.limitsearch;
        const Categroy = req.body.category;

        console.log(Categroy);
        console.log(limitOfSearch);
        console.log("Scraping URL:", Website_URL);

        // Lunch The Browser
        const browser = await puppeteer.launch({
          headless: false,
          defaultViewport: false,
        });

        // Create New Page
        const page = await browser.newPage();

        // Go to Provided Link
        await page.goto(Website_URL);

        // Function to scroll the page and load more search results
        const Scroll_Page = async () => {
          try {
            await page.evaluate(() => {
              window.scrollBy(0, window.innerHeight + 8000);
            });
            await page.waitForTimeout(2000);
            const ScrollClick = await page.$(".kQdGHd");
            if (ScrollClick) {
              await ScrollClick.click();
            }
          } catch (error) {
            console.log(error);
          }
        };

        const Add_Links_To_Array = async () => {
          try {
            await page.waitForSelector(".tF2Cxc");
            const searchResults = await page.$$(".tF2Cxc a");

            for (let i = 0; i < searchResults.length; i++) {
              const result = searchResults[i];
              const link = await result.getProperty("href");
              const linkText = await link.jsonValue();
              if (!links.includes(linkText)) {
                links.push(linkText);
              }
            }
          } catch (error) {
            console.log(error);
          }
        };
        let Links_Length = links.length;
        let countForScroll = 0;
        while (limitOfSearch > Links_Length && countForScroll < 30) {
          await Scroll_Page();
          await Add_Links_To_Array();
          Links_Length = links.length;
          console.log("Links_Length =>", Links_Length);
          countForScroll++;
          console.log(countForScroll);
          console.log("links For the Array =>", links.length);
        }
        console.log(links.length, "LInkks Length -<");

        // Function For Scrape The Email
        const scrapeEmails = async (link) => {
          const newPage = await browser.newPage();
          try {
            let match;
            let preferredMatches = [];
            await newPage.goto(link, { timeout: 200000 });
            const pageContent = await newPage.content();
            const emailRegex = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;
            const emails = pageContent.match(emailRegex) || [];
            const extractDomain = (url) => {
              let match;
              if (url.startsWith("http://www.")) {
                match = url.match(/http:\/\/www\.([^/]+)/);
              } else if (url.startsWith("https://www.")) {
                match = url.match(/https:\/\/www\.([^/]+)/);
              } else if (url.startsWith("http://")) {
                match = url.match(/http:\/\/([^/]+)/);
              } else if (url.startsWith("https://")) {
                match = url.match(/https:\/\/([^/]+)/);
              } else {
                return null;
              }
              if (match) {
                return match[1];
              }
              return null;
            };

            const currentURL = newPage.url();
            console.log(currentURL, "=> current URL");
            const currentDomain = await extractDomain(currentURL);
            console.log(`Current Domain: ${currentDomain}`);
            const extensionsToFilter = [".png", ".jpg"];
            const filteredEmails = emails.filter(
              (email) =>
                !extensionsToFilter.some((extension) =>
                  email.endsWith(extension)
                )
            );
            const uniqueEmails = new Set(filteredEmails);

            for (const email of uniqueEmails) {
              const existingProfile = await DomainEmail.findOne({
                Email: email,
              });
              if (!existingProfile) {
                const EmailsSaveInDatabase = new DomainEmail({
                  DomainName: currentDomain,
                  Email: email,
                  category: Categroy,
                });

                await EmailsSaveInDatabase.save();
              } else {
                console.log("Skip the Dublicate Email Amit");
              }
            }
            const uniqueEmailsArray = Array.from(uniqueEmails);
            console.log(uniqueEmailsArray);
            await newPage.close();
            return uniqueEmailsArray;
          } catch (error) {
            console.log("catch =>", error);
          }
        };

        // Create a Set to store unique emails
        const uniqueEmails = new Set();

        console.log(links);
        for (const link of links) {
          const emails = await scrapeEmails(link);
          emails.forEach((email) => uniqueEmails.add(email));
        }

        const uniqueEmailsArray = Array.from(uniqueEmails);

        fs.writeFileSync("unique_emails.txt", uniqueEmailsArray.join("\n"));

        await browser.close();
        console.log("End The Browser");
      });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
})();
// ****************************************************************Google Automation End****************************//

// Listning The Server
app.listen(PORT, () => {
  console.log(`Server Is On the work ${PORT}`);
});
