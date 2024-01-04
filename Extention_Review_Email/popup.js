
// For get the category and create the Category
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("categoryDropdown");
  const secretCodeInput = document.getElementById("secretCode");

  function fetchCategories() {
    fetch("http://localhost:4000/api/categories")
      .then((response) => response.json())
      .then((categories) => {
        const previouslySelectedCategory = localStorage.getItem("category");
        categories.forEach((category) => {
          const optionElement = document.createElement("option");
          optionElement.value = category._id;
          optionElement.innerText = category.category;

          if (category.category === previouslySelectedCategory) {
            optionElement.setAttribute("selected", "selected");
          }
          dropdown.appendChild(optionElement);
        });
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }

  fetchCategories();

});

document.getElementById("ApplyId").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    var currentUrl = currentTab.url;
    const limitsearchlist = document.getElementById("number").value;
    const dropdown = document.getElementById("categoryDropdown");
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    // const selectedCategory = selectedOption.value;
    const category = selectedOption.textContent;

    localStorage.setItem("category", category);
    fetch("http://localhost:4000/scrape", {
      // Replace with your server URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: currentUrl,
        limitsearch: limitsearchlist,
        category: category,
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  });
});
