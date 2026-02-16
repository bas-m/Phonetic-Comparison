langVowels = {};
soundFiles = {};
async function loadData() {
  try {
    // fetch ipa data from data.json file
    const response = await fetch("data.json");
    const data = await response.json();

    // populate langVowels with key value pairs, language:vowels
    for (langId in data.languages) {
      langVowels[langId] = data.languages[langId].vowels || [];
    }

    // fetch sound files, and load as a dict, segment:sound = key:value
    soundFiles = data.soundFiles || {};

    // populate both lang-select elements with all languages in the JSON file
    addLangsToSelect(data.languages, "lang1");
    addLangsToSelect(data.languages, "lang2");

    // initialize colors
    updateColors();
  } catch (error) {
    console.log("Error loading data from data.json:", error);
  }
}

// add options (i.e., langs) to a given select element
function addLangsToSelect(langs, selectId) {
    const selectElement = document.getElementById(selectId);

    for (langId in langs) {
        const option = document.createElement("option");
        // value is the key you feed updateColors() (e.g. "english")
        option.value = langId;
        // label is the display name the user sees (e.g. "English")
        option.textContent = langs[langId].name;
        selectElement.appendChild(option);
    }
}

// makes language searches not case-sensitive
//! searches are not yet implemented, so this is not yet needed
function lowercase(searchTerm) {
  return searchTerm.trim().toLowerCase();
}

// highlight IPA characters based on selected languages
//! pick a naming convention for segments/letters/phonemes/characters
function updateColors() {
  const lang1 = lowercase(document.getElementById("lang1").value);
  const lang2 = lowercase(document.getElementById("lang2").value);

  // Get segments (i.e., phonemes) for each language
  const segments1 = langVowels[lang1] || [];
  const segments2 = langVowels[lang2] || [];

  // filter will only include segments from segment1 that pass the condition
  // that they are included in segment2
  const sharedSegments = segments1.filter(function(segment) {
    return segments2.includes(segment);
  });

  // Reset all colors first
  const allCircles = document.querySelectorAll(".vowel-circle");
  allCircles.forEach(function(circle) {
    circle.classList.remove("color1");
    circle.classList.remove("color2"); 
    circle.classList.remove("colorMatch");
  });

  // Color segments green for language 1
  segments1.forEach(function(segment) {
    const letter = document.querySelector(`.ipa.${segment}`);
    if (letter) {
      // add segment/letter to class colored green
      letter.querySelector(".vowel-circle").classList.add("color1"); 
    }
  });

  // Color segments red for language 2
  segments2.forEach(function(segment) {
    const letter = document.querySelector(`.ipa.${segment}`);
    if (letter) {
      letter.querySelector(".vowel-circle").classList.add("color2");
    }
  });

  sharedSegments.forEach(function(segment) {
    const letter = document.querySelector(`.ipa.${segment}`);
    if (letter) {
      const circle = letter.querySelector(".vowel-circle");
      circle.classList.remove("color1");
      circle.classList.remove("color2");
      circle.classList.add("colorMatch");
    }
  }); 
}

// plays phoneme sound from file
function playSound(ipaChar) {
  // Create an audio element
  const audio = new Audio();

  const filename = soundFiles[ipaChar];
  if (!filename) {
    alert("No soundfile mapping for ${ipaChar}");
    return;
  }

  // set src to folder where recordings are
  audio.src = `sounds/${filename}`;

  audio.play().catch(function(error) {
    console.log("Error playing sound:", error);
    alert("Soundfile for ${vowel} not found.");
  });
}

// Adds event listeners.  Calls playSound on click, and highlights IPA
// characters when new language is selected.
document.addEventListener("DOMContentLoaded", function() {

  // querySelectorAll finds all HTML elements of the class "ipa", and returns
  // them as a list (aka NodeList)
  const ipaChars = document.querySelectorAll(".ipa");

  ipaChars.forEach(function(element) {
    // change graphic of cursor to a pointer when hovering over IPA character
    element.style.cursor = "pointer";

    // textContent returns the ipa character
    // trim removes whitespace
    const ipaChar = element.querySelector(".ipa-letter").textContent.trim();

    // on click, call playSound
    element.addEventListener('click', function() {
      playSound(ipaChar);
    });
  });

  // Event listeners for language select menus
  const lang1Select = document.getElementById("lang1");
  const lang2Select = document.getElementById("lang2");

  lang1Select.addEventListener("change", updateColors);
  lang2Select.addEventListener("change", updateColors);

  // this triggers everything, basically __main()__
  loadData();
});
