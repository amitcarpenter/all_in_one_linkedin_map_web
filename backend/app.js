const ejs = require("ejs");
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
const Users_Data = require("./Models/LinkedinModles");
const linkedin_router = require("./Routes/LinkedinRoutes");

const map_router = require("./Routes/MapRoutes");

require("dotenv").config();
require("./config/databaseConnection");

const app = express();
const PORT = process.env.PORT || 4001;
jwtSecretKey = "loveee";
const googleUsername = "arpityadav114697@gmail.com";
const googlePassword = "arpit114@aims";
// const googleUsername = "roameramit2001@gmail.com";
// const googlePassword = "@mit12345678";
// const googleUsername = "yogesh1pqr@gmail.com";
// const googlePassword = "@mit12345678";

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

// Set Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/template"));

let browser;
// const email = "ramruhela413@gmail.com";
// const password = "Ruhela@#$1";

// const email = "amitcarpenter199@gmail.com";
// const password = "@mit9302394128";

const email = "arpityadav114697@gmail.com";
const password = "arpit114@aims";

// const email = "amitcarpenter198@gmail.com";
// const password = "@mit9302394";
let array_of_profile_urls = [];
let array_of_profile_urls_is_connection = [];

function getCurrentAndSixMonthsAgo(month_number) {
  const currentDateTime = new Date();
  const sixMonthsAgo = new Date(currentDateTime);

  sixMonthsAgo.setMonth(currentDateTime.getMonth() - month_number);

  const currentDateTimeStr = formatDateTime(currentDateTime);
  const sixMonthsAgoStr = formatDateTime(sixMonthsAgo);

  return {
    sixMonthsAgoStr,
  };
}

function formatDateTime(dateTime) {
  const day = padZero(dateTime.getDate());
  const month = padZero(dateTime.getMonth() + 1);
  const year = dateTime.getFullYear();
  const hours = padZero(dateTime.getHours());
  const minutes = padZero(dateTime.getMinutes());
  const seconds = padZero(dateTime.getSeconds());

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

function padZero(value) {
  return value < 10 ? `0${value}` : value;
}

// Example usage
const result = getCurrentAndSixMonthsAgo(6);
console.log(result.sixMonthsAgoStr);

async function getProfileUrls() {
  try {
    // Use lean() to get plain JavaScript objects instead of Mongoose documents
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
    // Handle the error
    return [];
  }
}

async function getNullEmailAndMobileProfiles() {
  try {
    // Use lean() to get plain JavaScript objects instead of Mongoose documents
    let profiles = await Users_Data.find(
      { is_connection_send: 0 },
      { profile_url: 1, _id: 0 }
    ).lean();

    // Extract profile URLs and save them in the global array
    array_of_profile_urls_is_connection = profiles.map(
      (profile) => profile.profile_url
    );

    return array_of_profile_urls_is_connection; // If you want to return the array
  } catch (error) {
    console.error(error);
    // Handle the error
    return [];
  }
}
// async function getNullEmailAndMobileProfiles() {
//   try {
//     // Use lean() to get plain JavaScript objects instead of Mongoose documents
//     let profiles = await Users_Data.find(
//       { user_email: null, user_mobile: null },
//       { profile_url: 1, _id: 0 }
//     ).lean();

//     // Extract profile URLs and save them in the global array
//     array_of_profile_urls_is_connection = profiles.map(
//       (profile) => profile.profile_url
//     );

//     return array_of_profile_urls_is_connection; // If you want to return the array
//   } catch (error) {
//     console.error(error);
//     // Handle the error
//     return [];
//   }
// }

// Example usage
(async () => {
  await getProfileUrls(); // Wait for the array to be populated
  console.log(array_of_profile_urls.length);
})();

(async () => {
  await getNullEmailAndMobileProfiles(); // Wait for the array to be populated

  // Now you can use array_of_profile_urls globally
  console.log(array_of_profile_urls_is_connection.length);
})();

(async () => {
  browser = await puppeteer.launch({ headless: false, defaultViewport: false });
  let page = await browser.newPage();
  await page.goto("https://www.linkedin.com/uas/login");
  await page.waitForSelector("#username");
  await page.type("#username", email);
  await page.type("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

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

          // Assuming you have already navigated to the page and have a reference to the page object
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

          // Assuming you have already navigated to the page and have a reference to the page object
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
            console.log("Element not found");
          }

          // Assuming you have already navigated to the page and have a reference to the page object
          const fourthButtonInnerText = await page.evaluate(() => {
            const buttonElements = document.querySelectorAll(
              ".artdeco-button--secondary .artdeco-button__text"
            );

            console.log("Number of matching elements:", buttonElements.length);

            // Check if the NodeList has at least 4 elements
            if (buttonElements.length >= 4) {
              const fourthButtonElement = buttonElements[3]; // Get the 4th element (0-indexed)

              console.log(
                "Inner text of the 4th element:",
                fourthButtonElement.innerText.trim()
              );

              // Check if the inner text of the 4th element is "Pending"
              if (fourthButtonElement.innerText.trim() === "Pending") {
                // Update your database here or perform any other actions
                console.log("Update the database!");
              }

              return fourthButtonElement.innerText.trim();
            } else {
              return null; // Return null if there are not enough elements
            }
          });

          console.log("Inner text of the 4th button:", fourthButtonInnerText);

          // Click contactInfobutton
          const contactInfoButton = await page.$(
            "#top-card-text-details-contact-info"
          );
          if (contactInfoButton) {
            await contactInfoButton.click();
            console.log("Clicked on the contact info button");
            // Now, you can extract and update more details related to contact info
          } else {
            console.log("Contact info button not found");
          }

          await page.waitForTimeout(3000);
          // Find the section with the email information
          const htmlContent = await page.content();

          // Use a regular expression to find the email
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
        res.status(200).json({ array_of_profile_urls });
        await page.close();
      } catch (error) {
        console.log(error);
        await page.close();
      }
    });
  } catch (error) {
    console.log("catch");
    console.log(error);
  }

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
          // Assuming you have already navigated to the page and have a reference to the page object
          const fourthButtonInnerText = await page.evaluate(() => {
            const buttonElements = document.querySelectorAll(
              ".artdeco-button--secondary .artdeco-button__text"
            );

            console.log("Number of matching elements:", buttonElements.length);

            // Check if the NodeList has at least 4 elements
            if (buttonElements.length >= 4) {
              const fourthButtonElement = buttonElements[3]; // Get the 4th element (0-indexed)

              console.log(
                "Inner text of the 4th element:",
                fourthButtonElement.innerText.trim()
              );

              // Check if the inner text of the 4th element is "Pending"
              if (fourthButtonElement.innerText.trim() === "Pending") {
                // Update your database here or perform any other actions
                console.log("Update the database!");
              }

              return fourthButtonElement.innerText.trim();
            } else {
              return null; // Return null if there are not enough elements
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

  try {
    // Api for the extract Comment Data
    app.post("/find_user_detail_from_comment", async (req, res) => {
      try {
        let linkedin_find_url = req.body.linkedin_comment_url;
        let category = req.body.user_category;

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

            console.log(`Number of comment counts: ${numberOfComments_count}`);

            for (let i = 0; i < numberOfComments_count; i++) {
              await comment_count_elements[i].click();
              await page.waitForTimeout(3000);
              await scrollPageByInches(3);
              await page.waitForTimeout(3000);
              await page.waitForTimeout(3000);
              await scrollPageByInches(2);
              await page.waitForTimeout(3000);
              const Load_more_Selector =
                "button.comments-comments-list__load-more-comments-button";
              let Load_More_Button;
              while (
                (Load_More_Button = await page.$(Load_more_Selector)) !== null
              ) {
                await Load_More_Button.click();
                await page.waitForTimeout(2000);
                await scrollPageByInches(9);
                await page.waitForTimeout(2000);
              }

              const commentElements = await page.$$(".comments-comment-item");
              const numberOfComments = commentElements.length;
              console.log(`Number of comments profile 1: ${numberOfComments}`);
              await page.waitForTimeout(3000);

              async function saveToDatabase(commentInfo) {
                try {
                  const existingUser = await Users_Data.findOne({
                    profile_url: commentInfo.profile_url,
                  });

                  if (!existingUser) {
                    const user = new Users_Data(commentInfo);
                    await user.save();
                    console.log("Data saved to the database");
                  } else {
                    console.log(
                      "Duplicate data. Skipped saving to the database."
                    );
                  }
                } catch (error) {
                  console.error("Error saving data to the database:", error);
                }
              }

              const { sub, add, format } = require("date-fns");
              async function extract_comment_data(category, reqBody) {
                try {
                  let skipNext = false;

                  for (const commentElement of commentElements) {
                    if (skipNext) {
                      console.log("Skipping entire comment");
                      skipNext = false;
                      continue;
                    }

                    // Check if the comment matches the specific selector to skip
                    const nestedComment = await commentElement.$(
                      "article.comments-comment-item > .comment-social-activity > .comments-comment-item__nested-items > div"
                    );

                    if (nestedComment) {
                      console.log("Skipping nested comment");
                      skipNext = true;
                      continue;
                    }

                    // Extract information from each comment element
                    const commentInfo = await page.evaluate(
                      (comment, reqBody) => {
                        try {
                          const rawName = comment
                            .querySelector(".comments-post-meta__name-text")
                            .innerText.trim();

                          // Remove the unwanted part if it exists
                          const name = rawName
                            .replace(/View.*profile/i, "")
                            .trim();
                          const profileUrl = comment
                            .querySelector(".comments-post-meta__actor-link")
                            .getAttribute("href");
                          const commentText = comment
                            .querySelector(
                              ".comments-comment-item-content-body"
                            )
                            .innerText.trim();
                          const technology = comment
                            .querySelector(".comments-post-meta__headline")
                            .innerText.trim();
                          const timestamp = comment
                            .querySelector(".comments-comment-item__timestamp")
                            .innerText.trim();

                          // Extract the link from the anchor tag
                          const linkElement = comment.querySelector(
                            "a[data-test-app-aware-link]"
                          );
                          const linkUrl = linkElement
                            ? linkElement.getAttribute("href")
                            : null;

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
                                throw new Error("Invalid time interval format");
                              }

                              const value = parseInt(match[1]);
                              const unit = match[2];

                              console.log(value);
                              console.log(unit);
                              if (!units[unit]) {
                                throw new Error("Invalid time unit");
                              }
                              let currentDate = new Date();

                              if (unit !== "mo") {
                                currentDate =
                                  value >= 0
                                    ? sub(currentDate, { [units[unit]]: value })
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
                              const updatedTimeString = format(
                                currentDate,
                                "hh:mm:ss a"
                              );
                              // const Full_data_here =
                              //   updatedDateString + " " + updatedTimeString;

                              // return {
                              //   Full_data_here: 1,
                              // };
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
                          console.log(timestamp);
                          console.log(firstCharacter);
                          let numericValue = parseInt(firstCharacter);
                          console.log(numericValue);
                          let comment_date;
                          console.log("length", timestamp.length);
                          if (timestamp.length > 2) {
                            let result =
                              getCurrentAndSixMonthsAgo(numericValue);
                            comment_date = result.sixMonthsAgoStr;
                          } else {
                            let result = calculateUpdatedDateTime(timestamp);
                            comment_date = 1;
                          }

                          return {
                            name: name,
                            profile_image_link: null, 
                            commentText: commentText,
                            comment_date: comment_date,
                            technology: technology,
                            profile_url: profileUrl,
                            location: null,
                            category: reqBody.category,
                          };
                        } catch (error) {
                          console.log(error);
                        }
                      },
                      commentElement,
                      reqBody
                    );
                    await saveToDatabase(commentInfo);
                  }
                } catch (error) {
                  console.log(error);
                }
              }

              await extract_comment_data(category, req.body);

              await page.waitForTimeout(3000);
            }
          } catch (error) {
            console.log(error);
          }
        }

        await page.waitForTimeout(2000);
        await page.goto(linkedin_find_url);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await clickCommentCounts();
        await page.waitForTimeout(3000);
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }

  try {
    // Api for the extract Comment Data
    app.post("/find_user_detail_from_people", async (req, res) => {
      try {
        let linkedin_find_user_from_people = req.body.linkedin_people_url;
        let category = req.body.user_category;
        console.log(req.body);
        // Function for search result For the Withdraw Connection
        async function searchResultsFunctionForWithdraw() {
          try {
            console.log("third3");
            await page.waitForTimeout(3000);
            const searchResults = await page.$$(".entity-result__title-text");

            for (let i = 0; i < searchResults.length; i++) {
              const result = searchResults[i];
              const link = await result.$("a.app-aware-link");

              if (link) {
                const linkText = await link.getProperty("href");
                const href = await linkText.jsonValue();

                // Check if the link matches the undesired pattern
                if (
                  !href.includes(
                    "https://www.linkedin.com/search/results/people/headless"
                  )
                ) {
                  // Check if the link already exists in the database
                  const existingLink = await Users_Data.findOne({
                    profile_url: href,
                  });

                  if (!existingLink) {
                    // If the link does not exist, save it to the database
                    const newLink = new Users_Data({
                      profile_url: href,
                      category: category,
                    });
                    await newLink.save();
                    console.log(`New link added: ${href}`);
                  } else {
                    console.log(`Link already exists: ${href}`);
                  }
                } else {
                  console.log(`Skipping undesired link: ${href}`);
                }
              }
            }
          } catch (error) {
            console.log(error);
          }
        }

        // Scroll the Page
        const scrollPage = async () => {
          try {
            console.log("scroll 2");
            await page.evaluate(() => {
              window.scrollBy(0, window.innerHeight + 100000);
            });

            await page.waitForTimeout(2000);
            const MoreFeedButton = await page.$(
              "div.display-flex > button.scaffold-finite-scroll__load-button  > span.artdeco-button__text"
            );
            if (MoreFeedButton) {
              console.log("button fount for the more feeds");
              await MoreFeedButton.click();
            }
          } catch (error) {
            console.log(error);
          }
        };

        //Function for the connection Withdraw links
        const scrollAndPushLinksForConnetionWithdraw = async () => {
          try {
            console.log("first1");
            await page.waitForTimeout(3000);
            await scrollPage();
            let whileLoop = true;
            while (whileLoop) {
              await searchResultsFunctionForWithdraw();
              const nextButton = await page.$(
                ".artdeco-pagination__button--next > .artdeco-button__text"
              );
              if (nextButton) {
                console.log("next Button Clicked");
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
            console.log(error);
          }
        };

        await page.goto(linkedin_find_user_from_people, {
          waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(3000);
        await scrollAndPushLinksForConnetionWithdraw();
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }

  try {
    app.post("/companies_data_from_map", async (req, res) => {
      try {
        const Map_URL = req.body.map_url;
        const limitOfSearch = req.body.limitsearch;
        let Categroy = req.body.map_category;

        console.log(Categroy);
        console.log(limitOfSearch);
        console.log("Scraping URL:", Map_URL);

        const browser = await puppeteer.launch({
          headless: false,
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

            await page.waitForTimeout(2000); // Adjust this timeout if needed

            // Check if the "Next" button exists
            const nextButtonSelector = "#pnnext";
            const nextButton = await page.$(nextButtonSelector);

            if (nextButton) {
              try {
                // Click the "Next" button
                await nextButton.click();

                // Wait for the page navigation to complete (adjust the timeout if needed)
                await page.waitForNavigation({ waitUntil: "domcontentloaded" });

                console.log('Clicked the "Next" button');
              } catch (error) {
                console.error(
                  'Error clicking the "Next" button:',
                  error.message
                );
              }
            } else {
              console.log('No "Next" button found');
            }
          } catch (error) {
            console.log(error);
          }
        };

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
                openHours_MobileNumber: openHoursText,
                phoneNumber,
                websiteLink,
                directionsLink,
                // category: Categroy,
              };
            }, element);

            const existingData = await Map_Data.findOne({
              companyName: data.companyName,
            });

            if (!existingData) {
              await Map_Data.create(data);
              console.log(data.companyName);
            } else {
              console.log("Duplicate data. Skipping:");
            }
          } catch (error) {
            console.log(error);
          }
        }

        const PushLinkSForWebsiteFunction = async () => {
          try {
            const searchResults = await page.$$(".VkpGBb");
            console.log(searchResults.length, "searchResults");

            const limitOfSearch = req.body.limitsearch || searchResults.length;

            for (
              let i = 0;
              i < limitOfSearch && i < searchResults.length;
              i++
            ) {
              const result = searchResults[i];
              await scrapeDataFromElement(result);
              console.log(i);
            }
          } catch (error) {
            console.log(error);
          }
        };

        const tdLength = await page.evaluate(() => {
          const table = document.querySelector("table.AaVjTc");
          if (!table) {
            console.log("table Not Fount");
            return 0;
          }
          const tdElements = table.querySelectorAll("td");
          console.log(tdElements.length);
          return tdElements.length;
        });

        console.log("tdlength  ", tdLength);
        const NextButtonClick = await page.$(".d6cvqb > a");
        let countForwhile = 3;

        do {
          await page.waitForTimeout(3000);
          await PushLinkSForWebsiteFunction();
          await page.waitForTimeout(3000);
          await NextButtonClickFunction();
          await page.waitForTimeout(3000);
          countForwhile++;
          console.log(countForwhile);
        } while (countForwhile < tdLength);
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }

  try {
    app.post("/companies_data_from_map_usa", async (req, res) => {
      try {
        const Map_URL_USA = req.body.map_url;
        const limitOfSearch = req.body.limitsearch || 100;
        let categoryString = req.body.map_category;

        console.log(limitOfSearch);
        console.log("Scraping URL:", Map_URL_USA);

        const browser = await puppeteer.launch({
          headless: false,
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
            const nextButtonIndex = count_click_next_button % 2; // Alternate between 0 and 1
            const nextButtons = await page.$$(nextButtonSelector);

            if (nextButtons && count_click_next_button == 0) {
              try {
                // Click the appropriate "Next" button based on the counter
                await nextButtons[nextButtonIndex].click();

                console.log(
                  `Clicked the ${
                    nextButtonIndex === 0 ? "first" : "second"
                  } "Next" button`
                );
                count_click_next_button++;
              } catch (error) {
                console.error(
                  'Error clicking the "Next" button:',
                  error.message
                );
              }
            }
            if (nextButtons && count_click_next_button > 0) {
              try {
                // Click the appropriate "Next" button based on the counter
                await nextButtons[1].click();
              } catch (error) {
                console.error(
                  'Error clicking the "Next" button:',
                  error.message
                );
              }
            }
          } catch (error) {
            console.log(error);
          }
        };

        async function scrapeDataFromElement(element) {
          try {
            const data = await element.evaluate((element) => {
              const companyElement = element.querySelector(".rgnuSb");
              const ratingElement = element.querySelector(".rGaJuf");
              const ratedByElement = element.querySelector(".leIgTe");

              let address;
              // Assume 'element' is the HTML element you provided
              const addressElements = element.querySelectorAll(
                ".hGz87c:nth-last-child(2)"
              );

              // Check if there are at least two elements
              if (addressElements.length >= 2) {
                // Get the second-to-last element
                const secondAddressElement =
                  addressElements[addressElements.length - 1];

                // Extract text content from the element
                address = secondAddressElement
                  ? secondAddressElement.innerText.trim()
                  : "";

                // Log the extracted information
                console.log("Second Address:", address);
              } else {
                console.log("Not enough elements matching the selector");
              }

              let phoneNumber;
              const phoneNumberElement = element.querySelector(
                "[data-phone-number]"
              );

              // Check if the phone number element exists
              if (phoneNumberElement) {
                // Get the phone number from the 'data-phone-number' attribute
                phoneNumber =
                  phoneNumberElement.getAttribute("data-phone-number");

                // Log the extracted phone number
                console.log("Phone Number:", phoneNumber);
              } else {
                console.log("Phone number element not found");
              }
              let websiteLink;
              const linkElement = element.querySelector(
                "div.fQqZ2e > div.SJyhnc > .xbmkib >.zuotBc >a"
              );

              if (linkElement) {
                // Get the website link from the 'data-website-url' attribute
                websiteLink = linkElement.getAttribute("href");

                // Log the extracted website link
                console.log("Website Link:", websiteLink);
              } else {
                console.log("Website link element not found");
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
            } else {
              // console.log("Duplicate data. Skipping:");
            }
          } catch (error) {
            console.log(error);
          }
        }

        const PushLinkSForWebsiteFunction = async () => {
          try {
            const searchResults = await page.$$(`div[jsname="gam5T"]`);
            console.log(searchResults.length, "searchResults");
            const limitOfSearch = req.body.limitsearch || searchResults.length;
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
            console.log(error);
          }
        };

        for (
          let countForwhile = 0;
          countForwhile < limitOfSearch;
          countForwhile++
        ) {
          try {
            await waitForTimeout(3000);
            await PushLinkSForWebsiteFunction(limitOfSearch);
            console.log("push links");

            await waitForTimeout(3000);
            await NextButtonClickFunction();
            console.log("next button");
            await waitForTimeout(3000);

            console.log(countForwhile);
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
})();

// Listning The Server
app.listen(PORT, () => {
  console.log(`Server Is On the work ${PORT}`);
});
