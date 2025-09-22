document.addEventListener("DOMContentLoaded", () => {
  showLoading();
  setTimeout(hideLoading, 4000); // Simulate loading for 4 seconds
  // Loading animation control
  function showLoading() {
    document.querySelector(".animation").style.display = "flex";
    document.querySelector(".today>div:last-of-type").style.visibility =
      "hidden";
    document.querySelector(".today").style.backgroundColor =
      "var(--Neutral800)";
    document
      .querySelectorAll(".result")
      .forEach((el) => el.classList.add("loading"));
    document
      .querySelectorAll(".dash")
      .forEach((el) => el.classList.add("loading"));
    document
      .querySelectorAll(".days")
      .forEach((el) => el.classList.add("loading"));
    document
      .querySelectorAll(".hour-item")
      .forEach((el) => el.classList.add("loading"));
  }
  function hideLoading() {
    document.querySelector(".animation").style.display = "none";
    document.querySelector(".today>div:last-of-type").style.visibility =
      "visible";
    document.querySelector(".today").style.backgroundColor = "transparent";
    document
      .querySelectorAll("days")
      .forEach((el) => el.classList.remove("loading"));
    document.querySelectorAll(".result").forEach((el) => {
      el.classList.remove("loading");
    });
    document
      .querySelectorAll(".dash")
      .forEach((el) => el.classList.remove("loading"));
    document
      .querySelectorAll(".days")
      .forEach((el) => el.classList.remove("loading"));
    suggestionBox.style.display = "none";
    document
      .querySelectorAll(".hour-item")
      .forEach((el) => el.classList.remove("loading"));
  }
  const unitBtn = document.querySelector(".unit-btn");
  unitBtn.addEventListener("click", () => {
    unitBtn.classList.toggle("unit");
  });
  const switchBtn = document.querySelector(".switch-btn");
  switchBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const imperial = document.querySelectorAll(".imperial");
    const metric = document.querySelectorAll(".metric");
    imperial.forEach((el) => el.classList.toggle("active"));
    metric.forEach((el) => el.classList.toggle("active"));
  });
  const inputField = document.querySelector(".input>input");
  const suggestionBox = document.querySelector(".suggestion");
  // Set default city to London on load
  fetchWeather("London");

  // Get current time in the user's timezone and display it in an element with class .local-time
  function displayLocalTime(timeZone) {
    const now = new Date();
    // Use Intl.DateTimeFormat for proper formatting in the given timezone
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone,
    };
    const timeString = new Intl.DateTimeFormat("en-US", options).format(now);
    const timeOutput = document.querySelector(".local-time");
    if (timeOutput) {
      timeOutput.textContent = timeString;
    }
  }
  displayLocalTime(Intl.DateTimeFormat().resolvedOptions().timeZone);
  // Example usage: displayLocalTime(Intl.DateTimeFormat().resolvedOptions().timeZone);
  // You can call this after loading or after fetching weather data for a specific city/timezone.
  // Today's date
  function getFormattedDate(d) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayIndex = d.getDay();
    // Output the next 7 days, starting from today
    const weekDayNames = [];
    for (let i = 0; i < 7; i++) {
      weekDayNames.push(dayNames[(todayIndex + i) % 7]);
    }
    // Output to elements with class .day-name, assuming you have 7 of them in your HTML
    const dayOutputs = document.querySelectorAll(".day-name");
    const dayOutputs2 = document.querySelectorAll(".hourly-date");
    dayOutputs2.forEach((el, idx) => {
      el.textContent = days[(todayIndex + idx) % 7];
    });
    const dateOutput = document.querySelector(".date001");
    const todayDay = days[d.getDay()];
    // Get the CSS variable value for --Neutral700
    const neutral700 = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--Neutral700");
    if (todayDay === "Monday") {
      document.getElementById("mon").style.backgroundColor = 'var(--Neutral600)';
    } else if (todayDay === "Tuesday") {
      document.getElementById("tue").style.backgroundColor = 'var(--Neutral600)';
    } else if (todayDay === "Wednesday") {
      document.getElementById("wed").style.backgroundColor = 'var(--Neutral600)';
    } else if (todayDay === "Thursday") {
      document.getElementById("thu").style.backgroundColor = 'var(--Neutral600)';
    } else if (todayDay === "Friday") {
      document.getElementById("fri").style.backgroundColor = 'var(--Neutral600)';
    } else if (todayDay === "Saturday") {
      document.getElementById("sat").style.backgroundColor = 'var(--Neutral600)';
    } else if (todayDay === "Sunday") {
      document.getElementById("sun").style.backgroundColor = 'var(--Neutral600)';
    }
    dateOutput.textContent = `${todayDay}`;
    dayOutputs.forEach((el, idx) => {
      el.textContent = weekDayNames[idx];
    });
    const day = d.getDate();
    const suffix =
      day % 10 == 1 && day % 100 != 11
        ? "st"
        : day % 10 == 2 && day % 100 != 12
        ? "nd"
        : day % 10 == 3 && day % 100 != 13
        ? "rd"
        : "th";

    return `${days[d.getDay()]} ${day}${suffix} ${
      months[d.getMonth()]
    } ${d.getFullYear()}`;
  }

  const today = new Date();
  const dateString = getFormattedDate(today); // Formatted date string
  const dateOutput = document.querySelector(".full-date");
  dateOutput.textContent = `${dateString}`;

  const button = document.querySelector("button");
  button.addEventListener("click", () => {
    suggestionBox.style.display = "block";
    suggestionBox.innerHTML = `
    <li class="search-in-progress flex">
    <img src="./assets/images/icon-loading.svg" alt="Search icon">
    <p>Search in progress</p>
            </li>
    `;
    showLoading();
    setTimeout(hideLoading, 4000);
    let city = inputField.value.trim();
    if (city) {
      fetchWeather(city);
    }
  });

  // Autocomplete suggestions (register ONCE)
  inputField.addEventListener("input", async function () {
    const city = inputField.value.trim();
    if (city.length < 2) {
      suggestionBox.innerHTML = "";
      return;
    }
    try {
      // Call OWM Geocoding API
      const API_KEY = "a34e48205c544af80edf9a5ab98449b2"; // Use your actual API key
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`
      );
      const data = await response.json();
      // Render suggestions
      suggestionBox.style.display = "block";
      suggestionBox.innerHTML = data
        .map(
          (city) => `
          <li class="suggestion-item">
              ${city.name}, ${city.state ? city.state + ", " : ""}${
            city.country
          }
          </li>`
        )
        .join("");
    } catch (err) {
      suggestionBox.innerHTML = "<li>Error fetching suggestions</li>";
    }
    setTimeout(() => {
      suggestionBox.style.display = "none";
    }, 3000);
  });

  // Weather API call function
  function fetchWeather(city) {
    // Step 1: Get lat/lon for the city (using OpenWeatherMap Geocoding API)
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      city
    )}&limit=1&appid=a34e48205c544af80edf9a5ab98449b2`;
    fetch(geoUrl)
      .then((response) => response.json())
      .then((geoData) => {
        if (!geoData.length) {
          console.error("City not found");
          return;
        }
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        // Step 2: Get forecast from Open-Meteo
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,windspeed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
        fetch(openMeteoUrl)
          .then((response) => response.json())
          .then((data) => {
            // --- Display remaining hourly forecast for today in the UI ---
            if (data.hourly && data.hourly.time && data.hourly.temperature_2m) {
              const now = new Date();
              const todayStr = now.toISOString().slice(0, 10); // e.g. '2025-09-17'
              const hours = [];
              for (let i = 0; i < data.hourly.time.length; i++) {
                const timeISO = data.hourly.time[i];
                if (timeISO.startsWith(todayStr)) {
                  const hour = new Date(timeISO).getHours();
                  if (new Date(timeISO) >= now) {
                    hours.push({
                      time: timeISO,
                      hour,
                      temp: data.hourly.temperature_2m[i],
                      humidity: data.hourly.relative_humidity_2m
                        ? data.hourly.relative_humidity_2m[i]
                        : undefined,
                      wind: data.hourly.windspeed_10m
                        ? data.hourly.windspeed_10m[i]
                        : undefined,
                      precipitation: data.hourly.precipitation
                        ? data.hourly.precipitation[i]
                        : undefined,
                    });
                  }
                }
              }
              // --- Log hourly forecast for the next 7 days, grouped by day ---
              const daysMap = {};
              for (let i = 0; i < data.hourly.time.length; i++) {
                const timeISO = data.hourly.time[i];
                const dateStr = timeISO.slice(0, 10);
                if (!daysMap[dateStr]) daysMap[dateStr] = [];
                daysMap[dateStr].push({
                  time: timeISO,
                  hour: new Date(timeISO).getHours(),
                  temp: data.hourly.temperature_2m[i],
                  humidity: data.hourly.relative_humidity_2m
                    ? data.hourly.relative_humidity_2m[i]
                    : undefined,
                  wind: data.hourly.windspeed_10m
                    ? data.hourly.windspeed_10m[i]
                    : undefined,
                  precipitation: data.hourly.precipitation
                    ? data.hourly.precipitation[i]
                    : undefined,
                });
              }
              // Get the next 7 days (including today)
              const allDates = Object.keys(daysMap).sort();
              const next7 = allDates.slice(0, 7);
              next7.forEach((date) => {
                console.log(`Hourly forecast for ${date}:`, daysMap[date]);
              });
              // Display in the UI
              const hourlyForecast = document.querySelector(".hourlyforecast");

              if (hourlyForecast) {
                hourlyForecast.innerHTML = "";
                hours.forEach((hourObj) => {
                  const li = document.createElement("li");
                  li.className = "hour-item loading";
                  // Convert hour to 12-hour format with AM/PM
                  const hour24 = hourObj.hour;
                  const hour12 = ((hour24 + 11) % 12) + 1;
                  const ampm = hour24 >= 12 ? "PM" : "AM";
                  li.innerHTML = `<img class="hourlyforecastimg" src="" alt=""><span class="hour">${hour12} ${ampm}</span> <span class="temp">${Math.round(
                    hourObj.temp
                  )}°</span>`;
                  hourlyForecast.appendChild(li);
                  const img = li.querySelector(".hourlyforecastimg");
                  if (hourObj.temp > 25) {
                    img.src = "./assets/images/icon-sunny.webp";
                  } else if (hourObj.temp > 15) {
                    img.src = "./assets/images/icon-partly-cloudy.webp";
                  } else if (hourObj.temp > 5) {
                    img.src = "./assets/images/icon-overcast.webp";
                  } else {
                    img.src = "./assets/images/icon-snow.webp";
                  }
                });
              }
            }
            // --- Pull and log forecast for remaining hours of the day ---
            if (data.hourly && data.hourly.time && data.hourly.temperature_2m) {
              const now = new Date();
              const todayStr = now.toISOString().slice(0, 10); // e.g. '2025-09-17'
              const hours = [];
              for (let i = 0; i < data.hourly.time.length; i++) {
                const timeISO = data.hourly.time[i];
                if (timeISO.startsWith(todayStr)) {
                  const hour = new Date(timeISO).getHours();
                  if (new Date(timeISO) >= now) {
                    hours.push({
                      time: timeISO,
                      hour,
                      temp: data.hourly.temperature_2m[i],
                      humidity: data.hourly.relative_humidity_2m
                        ? data.hourly.relative_humidity_2m[i]
                        : undefined,
                      wind: data.hourly.windspeed_10m
                        ? data.hourly.windspeed_10m[i]
                        : undefined,
                      precipitation: data.hourly.precipitation
                        ? data.hourly.precipitation[i]
                        : undefined,
                    });
                  }
                }
              }
              console.log("Remaining hourly forecast for today:", hours);
            }
            if (!data.daily) {
              console.error("No daily data in Open-Meteo response:", data);
              return;
            }

            // Store each day's forecast in its own variable
            const maxTemps = data.daily.temperature_2m_max;
            const minTemps = data.daily.temperature_2m_min;
            // Display local time for the user's city using Open-Meteo timezone
            if (data.timezone) {
              displayLocalTime(data.timezone);
            }
            // Update all daily max temperature elements in the weekly forecast
            const maxTempElements = document.querySelectorAll(
              ".weeklyforecast .max, .weeklyforecast .max-temperarture"
            );
            maxTempElements.forEach((el, i) => {
              if (maxTemps[i] !== undefined) {
                el.textContent = Math.round(maxTemps[i]) + "°";
              }
            });
            // Optionally update min temps as well
            const minTempElements = document.querySelectorAll(
              ".weeklyforecast .min"
            );
            minTempElements.forEach((el, i) => {
              if (minTemps[i] !== undefined) {
                el.textContent = Math.round(minTemps[i]) + "°";
              }
            });
            // Find the index in hourly.time closest to now
            let now = new Date();
            let bestIdx = 0;
            if (data.hourly && data.hourly.time) {
              let minDiff = Infinity;
              for (let i = 0; i < data.hourly.time.length; i++) {
                let t = new Date(data.hourly.time[i]);
                let diff = Math.abs(t - now);
                if (diff < minDiff) {
                  minDiff = diff;
                  bestIdx = i;
                }
              }
              // Store each day's forecast in its own variable
              const maxTemps = data.daily.temperature_2m_max;
              const minTemps = data.daily.temperature_2m_min;
              // Log daily max and min temperatures
              console.log("Daily max temperatures:", maxTemps);
              console.log("Daily min temperatures:", minTemps);
              const maxTempElements =
                document.querySelectorAll(".max-temperature");
              maxTempElements.forEach((el, i) => {
                if (maxTemps[i] !== undefined) {
                  el.textContent = Math.round(maxTemps[i]);
                }
              });
              const minTempElements =
                document.querySelectorAll(".min-temperature");
              minTempElements.forEach((el, i) => {
                if (minTemps[i] !== undefined) {
                  el.textContent = Math.round(minTemps[i]);
                }
              });
            }
            // Get values closest to current hour
            let temp =
              data.hourly && data.hourly.temperature_2m
                ? data.hourly.temperature_2m[bestIdx]
                : null;
            let humidity =
              data.hourly && data.hourly.relative_humidity_2m
                ? data.hourly.relative_humidity_2m[bestIdx]
                : null;
            let windSpeed =
              data.hourly && data.hourly.windspeed_10m
                ? data.hourly.windspeed_10m[bestIdx]
                : null;
            let precipitation =
              data.hourly && data.hourly.precipitation
                ? data.hourly.precipitation[bestIdx]
                : null;

            // Update UI with city name and current values
            document.querySelector(".location").textContent = `${
              geoData[0].name
            }${geoData[0].country ? ", " + geoData[0].country : ""}`;
            document.querySelectorAll("#temperature").forEach((el) => {
              if (temp !== null) el.textContent = Math.round(temp);
            });
            // If you have elements for min temp, update them too
            const minTempElement = document.getElementById("min-temperature");
            if (minTempElement)
              minTempElement.textContent = Math.round(minTemps[0]);

            // Update UI if elements exist
            const humidityElement = document.getElementById("humidity");
            if (humidityElement && humidity !== null)
              humidityElement.textContent = humidity;
            const windElement = document.getElementById("wind");
            if (windElement && windSpeed !== null)
              windElement.textContent = windSpeed;
            const precipitationElement =
              document.getElementById("precipitation");
            if (precipitationElement && precipitation !== null)
              precipitationElement.textContent = precipitation;

            // Optionally, update weather icon based on temperature or other logic
            const bigImg = document.querySelector(".temperature>img");
            if (bigImg && temp !== null) {
              if (temp > 25) bigImg.src = "./assets/images/icon-sunny.webp";
              else if (temp > 15)
                bigImg.src = "./assets/images/icon-partly-cloudy.webp";
              else if (temp > 5)
                bigImg.src = "./assets/images/icon-overcast.webp";
              else bigImg.src = "./assets/images/icon-snow.webp";
            }
            const smallImgs = document.querySelectorAll(".days img");
            smallImgs.forEach((img) => {
              if (temp > 25) img.src = "./assets/images/icon-sunny.webp";
              else if (temp > 15)
                img.src = "./assets/images/icon-partly-cloudy.webp";
              else if (temp > 5) img.src = "./assets/images/icon-overcast.webp";
              else img.src = "./assets/images/icon-snow.webp";
            });
          })
          .catch((error) => {
            console.error("Error fetching Open-Meteo forecast:", error);
            const main = document.querySelector("main");
            main.remove();
          });
      })
      .catch((error) => {
        console.error("Error fetching city coordinates:", error);
        const flexBox = document.querySelector(".flexbox");
        flexBox.remove();
        const errorDiv = document.querySelector(".error.no-result");
        errorDiv.style.display = "block";
      });
  }

  // media queries
  const image = document.querySelector(".loading img");
  if (window.matchMedia("(max-width: 600px)").matches) {
    image.src = "./assets/images/bg-today-small.svg";
  } else {
    image.src = "./assets/images/bg-today-large.svg";
  }
});
