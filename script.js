document.getElementById("startGame").addEventListener("click", startGame);
document.getElementById("tryAgain").addEventListener("click", resetGame);

let timerInterval;
let mistakes = 0;
let isGameOver = false;
let currentWordIndex = 0;
let correctChars = 0;
let wordMistake = false;
let paragraphsData = [];

function startGame() {
    // Load paragraphs from the JSON file
    fetch('paragraphs.json')
        .then(response => response.json())
        .then(data => {
            paragraphsData = data.paragraphs; // Store the paragraphs from JSON

            clearInterval(timerInterval);
            resetStats();

            let timeLimit = parseInt(document.getElementById("timeLimit").value) || 60;
            document.getElementById("stimer").innerText = timeLimit;

            // Select a random paragraph from JSON data
            const randomParagraph = paragraphsData[Math.floor(Math.random() * paragraphsData.length)];
            displayParagraph(randomParagraph);

            timerInterval = setInterval(() => {
                if (timeLimit > 0) {
                    timeLimit--;
                    document.getElementById("timer").innerText = timeLimit;
                } else {
                    endGame();
                }
            }, 1000);

            document.getElementById("inputBox").addEventListener("input", checkInput);
            document.getElementById("inputBox").addEventListener("keydown", preventWordSkip);
        })
        .catch(error => {
            console.error("Error loading paragraphs:", error);
        });
}

function displayParagraph(paragraph) {
    const container = document.getElementById("paragraph");
    container.innerHTML = "";

    const words = paragraph.split(" ");
    words.forEach((word, index) => {
        const wordSpan = document.createElement("span");
        wordSpan.classList.add("word");
        wordSpan.id = `word-${index}`;

        word.split("").forEach((letter) => {
            const letterSpan = document.createElement("span");
            letterSpan.innerText = letter;
            letterSpan.classList.add("letter");
            wordSpan.appendChild(letterSpan);
        });

        container.appendChild(wordSpan);
        container.appendChild(document.createTextNode(" ")); // Space between words
    });
}

function checkInput() {
    if (isGameOver) return;

    const words = document.getElementById("paragraph").children;
    const typedText = document.getElementById("inputBox").value.trim();
    const currentWord = words[currentWordIndex];
    const currentWordText = Array.from(currentWord.children).map(span => span.innerText).join("");

    if (typedText === currentWordText) {
        currentWord.classList.remove("incorrect");
        Array.from(currentWord.children).forEach(span => span.classList.add("correct-letter"));
        currentWordIndex++;
        correctChars += typedText.length;
        document.getElementById("inputBox").value = "";
        wordMistake = false;
    } else {
        const typedChars = typedText.split("");

        let isMistake = false;
        Array.from(currentWord.children).forEach((span, index) => {
            if (typedChars[index] === span.innerText) {
                span.classList.add("correct-letter");
                span.classList.remove("incorrect-letter");
            } else if (typedChars[index] !== undefined) {
                span.classList.add("incorrect-letter");
                isMistake = true;
            } else {
                span.classList.remove("correct-letter", "incorrect-letter");
            }
        });

        if (isMistake && !wordMistake) {
            mistakes++;
            document.getElementById("mistakes").innerText = mistakes;
            wordMistake = true;
        } else if (!isMistake) {
            wordMistake = false;
        }

        currentWord.classList.toggle("incorrect", isMistake);
    }

    if (currentWordIndex === words.length) {
        endGame();
    }
}

function preventWordSkip(event) {
    if (event.key === " ") {
        const typedText = document.getElementById("inputBox").value.trim();
        const words = document.getElementById("paragraph").children;
        const currentWord = words[currentWordIndex];
        const currentWordText = Array.from(currentWord.children).map(span => span.innerText).join("");

        if (typedText !== currentWordText) {
            event.preventDefault();
        }
    }
}

function calculateWPM() {
    const wordsTypedCorrectly = correctChars / 5;
    const timeElapsed = parseInt(document.getElementById("timeLimit").value) - parseInt(document.getElementById("timer").innerText);

    if (timeElapsed > 0) {
        const wpm = ((wordsTypedCorrectly / timeElapsed) * 60).toFixed(2);
        document.getElementById("wpm").innerText = wpm;
    } else {
        document.getElementById("wpm").innerText = 0;
    }
}

function endGame() {
    clearInterval(timerInterval);
    isGameOver = true;
    calculateWPM();
    document.getElementById("inputBox").removeEventListener("input", checkInput);
    document.getElementById("inputBox").removeEventListener("keydown", preventWordSkip);
    document.getElementById("inputBox").disabled = true;
}

function resetGame() {
    clearInterval(timerInterval);
    document.getElementById("inputBox").value = "";
    document.getElementById("inputBox").disabled = false;
    isGameOver = false;
    currentWordIndex = 0;
    correctChars = 0;
    wordMistake = false;
    resetStats();
}

function resetStats() {
    mistakes = 0;
    document.getElementById("mistakes").innerText = 0;
    document.getElementById("wpm").innerText = 0;
    document.getElementById("timer").innerText = parseInt(document.getElementById("timeLimit").value) || 60;
}
document.addEventListener('keydown', () => {
    const inputBox = document.getElementById('inputBox');
    if (document.activeElement !== inputBox) {
        inputBox.focus();
    }
});
