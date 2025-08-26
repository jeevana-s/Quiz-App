const homeContainer = document.querySelector(".home-container");
const nameModalOverlay = document.querySelector(".name-modal-overlay");
const userNameInput = document.getElementById("userNameInput");
const startQuizAfterNameBtn = document.getElementById("startQuizAfterName");
const dashboardContainer = document.querySelector(".dashboard-container");
const sidebarMenuItems = document.querySelectorAll(".sidebar-menu .menu-item");
const contentContainer = document.getElementById("content-container");
const contentSections = document.querySelectorAll(".content-section");
const quizContainer = document.getElementById("content-quiz");
const answerOptions = quizContainer.querySelector(".answer-options");
const nextQuestionBtn = quizContainer.querySelector(".next-question-btn");
const questionStatus = quizContainer.querySelector(".question-status");
const timerDisplay = quizContainer.querySelector(".time-duration");
const configStep1Container = document.getElementById("content-config-step1");
const configStep2Container = document.getElementById("content-config-step2");
const resultContainer = document.getElementById("content-result");
const visualScorecardContainer = document.getElementById("visual-scorecard-container");
const scorecardCategory = document.getElementById("scorecard-category");
const scorecardTotal = document.getElementById("scorecard-total");
const scorecardCorrect = document.getElementById("scorecard-correct");
const scorecardFinal = document.getElementById("scorecard-final");
const scorecardEmoji = document.getElementById("scorecard-emoji");
const scorecardSuggestionsList = document.getElementById("scorecard-suggestions-list");
const progressFill = document.querySelector(".progress-fill");
const welcomeMessage = document.getElementById("welcome-message");
const feedbackForm = document.getElementById("feedback-form");
const starRating = document.querySelector(".stars");
const feedbackComment = document.getElementById("feedback-comment");
const nextStepBtn = document.querySelector(".next-step-btn");
const startQuizBtn = document.querySelector(".start-quiz-btn");
const tryAgainBtn = document.querySelector(".try-again-btn");

const QUIZ_TIME_LIMIT = 15;
let currentTime = QUIZ_TIME_LIMIT;
let timer = null;
let quizCategory = "Programming";
let numberOfQuestions = 5;
let currentQuestion = null;
const questionsIndexHistory = [];
let correctAnswersCount = 0;
const userAnswers = [];
let quizCompleted = false;
let userName = "";

const showContent = (contentId) => {
    contentSections.forEach(section => {
        section.classList.remove("active");
    });
    const activeSection = document.getElementById(`content-${contentId}`);
    if (activeSection) {
        activeSection.classList.add("active");
    }
};

const activateMenuItem = (menuItem) => {
    sidebarMenuItems.forEach(item => item.classList.remove("active"));
    menuItem.classList.add("active");
    const contentId = menuItem.getAttribute("data-content");
    showContent(contentId);
};

const showNameModal = () => {
    nameModalOverlay.style.display = "flex";
};

const showDashboard = (inputName) => {
    nameModalOverlay.style.display = "none";
    homeContainer.style.display = "none";
    dashboardContainer.style.display = "flex";
    userName = inputName;
    welcomeMessage.textContent = `Hello, ${userName}!`;
    const dashboardMenuItem = document.querySelector('.menu-item[data-content="dashboard"]');
    activateMenuItem(dashboardMenuItem);
};

const showQuizResult = () => {
    quizCompleted = true;
    showContent("result");
    const resultText = `You answered <b>${correctAnswersCount}</b> out of <b>${numberOfQuestions}</b> questions correctly. Great effort!`;
    resultContainer.querySelector(".result-message").innerHTML = resultText;
    scorecardCategory.textContent = quizCategory;
    scorecardTotal.textContent = numberOfQuestions;
    scorecardCorrect.textContent = correctAnswersCount;
    scorecardFinal.textContent = `${correctAnswersCount}/${numberOfQuestions}`;
    let emoji = "";
    if (correctAnswersCount / numberOfQuestions >= 0.8) {
        emoji = "🎉";
    } else if (correctAnswersCount / numberOfQuestions >= 0.6) {
        emoji = "👍";
    } else if (correctAnswersCount / numberOfQuestions >= 0.4) {
        emoji = "🤔";
    } else {
        emoji = "😟";
    }
    scorecardEmoji.textContent = emoji;
    let suggestions = [];
    const percentage = correctAnswersCount / numberOfQuestions;
    if (percentage >= 0.8) {
        suggestions = ["Fantastic job! Keep up the great work!", "Consider trying more challenging quizzes."];
    } else if (percentage >= 0.6) {
        suggestions = ["Well done! You have a good understanding.", "Review areas where you had incorrect answers."];
    } else if (percentage >= 0.4) {
        suggestions = ["Not bad! You're on the right track.", "Practice more questions in this category."];
    } else {
        suggestions = ["Keep practicing! Every attempt is a learning opportunity.", "Review the fundamentals of this topic."];
    }
    scorecardSuggestionsList.innerHTML = "";
    suggestions.forEach(suggestion => {
        const li = document.createElement("li");
        li.classList.add("visual-scorecard-suggestions-item");
        li.textContent = suggestion;
        scorecardSuggestionsList.appendChild(li);
    });
};

const resetTimer = () => {
    clearInterval(timer);
    currentTime = QUIZ_TIME_LIMIT;
    timerDisplay.textContent = `${currentTime}s`;
};

const startTimer = () => {
    timer = setInterval(() => {
        currentTime--;
        timerDisplay.textContent = `${currentTime}s`;
        if (currentTime <= 0) {
            clearInterval(timer);
            highlightCorrectAnswer();
            nextQuestionBtn.style.visibility = "visible";
            quizContainer.querySelector(".quiz-timer").style.background = "#c31402";
            answerOptions.querySelectorAll(".answer-option").forEach(option => option.style.pointerEvents = "none");
        }
    }, 1000);
};

const getRandomQuestion = () => {
    const categoryQuestions = questions.find(cat => cat.category.toLowerCase() === quizCategory.toLowerCase()).questions || [];
    if (questionsIndexHistory.length >= Math.min(categoryQuestions.length, numberOfQuestions)) {
        showQuizResult();
        return;
    }
    const availableQuestion = categoryQuestions.filter((_, index) => !questionsIndexHistory.includes(index));
    const randomQuestion = availableQuestion[Math.floor(Math.random() * availableQuestion.length)];
    questionsIndexHistory.push(categoryQuestions.indexOf(randomQuestion));
    return randomQuestion;
};

const highlightCorrectAnswer = () => {
    const correctOption = answerOptions.querySelectorAll(".answer-option")[currentQuestion.correctAnswer];
    correctOption.classList.add("correct");
    const iconHTML = `<span class="material-symbols-rounded">check_circle</span>`;
    correctOption.insertAdjacentHTML("beforeend", iconHTML);
};

const handleAnswer = (option, answerIndex) => {
    clearInterval(timer);
    const isCorrect = currentQuestion.correctAnswer === answerIndex;
    option.classList.add(isCorrect ? 'correct' : 'incorrect');
    !isCorrect ? highlightCorrectAnswer() : correctAnswersCount++;
    const iconHTML = `<span class="material-symbols-rounded">${isCorrect ? 'check_circle' : 'cancel'}</span>`;
    option.insertAdjacentHTML("beforeend", iconHTML);
    answerOptions.querySelectorAll(".answer-option").forEach(option => option.style.pointerEvents = "none");
    nextQuestionBtn.style.visibility = "visible";
    userAnswers.push({
        ...currentQuestion,
        userAnswerIndex: answerIndex,
        isCorrect: isCorrect
    });
};

const updateProgressBar = () => {
    const progress = (questionsIndexHistory.length / numberOfQuestions) * 100;
    progressFill.style.width = `${progress}%`;
};

const renderQuestion = () => {
    currentQuestion = getRandomQuestion();
    if (!currentQuestion) {
        return;
    }
    updateProgressBar();
    resetTimer();
    startTimer();
    answerOptions.innerHTML = "";
    nextQuestionBtn.style.visibility = "hidden";
    quizContainer.querySelector(".quiz-timer").style.background = "#32313C";
    quizContainer.querySelector(".question-text").textContent = currentQuestion.question;
    questionStatus.innerHTML = `<b>${questionsIndexHistory.length}</b> of <b>${numberOfQuestions}</b> Questions`;
    currentQuestion.options.forEach((option, index) => {
        const li = document.createElement("li");
        li.classList.add("answer-option");
        li.textContent = option;
        answerOptions.appendChild(li);
        li.addEventListener("click", () => handleAnswer(li, index));
    });
};

const startQuiz = () => {
    showContent("quiz");
    numberOfQuestions = parseInt(configStep2Container.querySelector(".question-option.active").textContent);
    progressFill.style.width = '0%';
    renderQuestion();
};

const startConfigStep1 = () => {
    resetQuiz();
    showContent("config-step1");
};

const startConfigStep2 = () => {
    quizCategory = configStep1Container.querySelector(".category-option.active").textContent;
    showContent("config-step2");
};

const downloadScorecard = () => {
    if (!quizCompleted) {
        alert("Please complete the quiz first.");
        return;
    }
    visualScorecardContainer.style.display = "block";
    html2canvas(visualScorecardContainer).then(canvas => {
        const link = document.createElement('a');
        link.download = 'quiz_scorecard.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        visualScorecardContainer.style.display = "none";
    });
};

const openAnswerReviewTab = () => {
    if (!quizCompleted) {
        alert("Please complete the quiz first.");
        return;
    }
    let answersHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quiz Answers Review</title>
            <style>
                body {
                    font-family: 'Montserrat', sans-serif;
                    background-color: #f4f7f9;
                    color: #333;
                    padding: 20px;
                }
                .container {
                    max-width: 800px;
                    margin: auto;
                    background: #fff;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                h1 {
                    text-align: center;
                    color: #5145BA;
                    margin-bottom: 30px;
                }
                .question-item {
                    border: 1px solid #ddd;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .question-item h3 {
                    font-size: 1.2rem;
                    color: #2c3e50;
                    margin-bottom: 15px;
                }
                .options-list {
                    list-style-type: none;
                    padding: 0;
                }
                .options-list li {
                    padding: 12px;
                    margin-bottom: 8px;
                    border-radius: 6px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: 1px solid #e0e0e0;
                    background-color: #f9f9f9;
                }
                .options-list li .option-text {
                    flex-grow: 1;
                }
                .options-list li .answer-label {
                    font-weight: 600;
                    font-size: 0.9em;
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin-left: 10px;
                    white-space: nowrap;
                }
                .correct-label {
                    background-color: #d4edda;
                    color: #155724;
                }
                .incorrect-your-answer-label {
                    background-color: #f8d7da;
                    color: #721c24;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Quiz Answers Review</h1>
                ${userAnswers.map((answer, index) => {
                    return `
                        <div class="question-item">
                            <h3>Question ${index + 1}: ${answer.question}</h3>
                            <ul class="options-list">
                                ${answer.options.map((option, i) => {
                                    let labels = [];
                                    if (i === answer.userAnswerIndex && i === answer.correctAnswer) {
                                        labels.push('<span class="answer-label correct-label">Your Answer & Correct Answer</span>');
                                    } else {
                                        if (i === answer.userAnswerIndex) {
                                            labels.push('<span class="answer-label incorrect-your-answer-label">Your Answer</span>');
                                        }
                                        if (i === answer.correctAnswer) {
                                            labels.push('<span class="answer-label correct-label">Correct Answer</span>');
                                        }
                                    }
                                    return `
                                        <li>
                                            <span class="option-text">${option}</span>
                                            <div class="labels">${labels.join('')}</div>
                                        </li>
                                    `;
                                }).join('')}
                            </ul>
                        </div>
                    `;
                }).join('')}
            </div>
        </body>
        </html>
    `;
    const newTab = window.open();
    newTab.document.write(answersHtml);
    newTab.document.close();
};

const downloadQuestions = () => {
    if (!quizCompleted) {
        alert("Please complete the quiz first.");
        return;
    }
    const doc = new window.jspdf.jsPDF();
    doc.setFontSize(18);
    doc.text(`Quiz Questions for Category: ${quizCategory}`, 10, 15);
    doc.setFontSize(12);
    let y = 30;

    userAnswers.forEach((answer, index) => {
        const questionText = `Question ${index + 1}: ${answer.question}`;
        
        const questionLines = doc.splitTextToSize(questionText, 180);
        doc.text(questionLines, 10, y);
        y += (questionLines.length * 7) + 5;

        answer.options.forEach((option, i) => {
            const isCorrect = i === answer.correctAnswer;
            const optionPrefix = isCorrect ? `(Correct) ` : `      `;
            const optionText = `${i + 1}. ${option}`;
            
            const optionLines = doc.splitTextToSize(optionPrefix + optionText, 180);
            doc.text(optionLines, 10, y);
            y += (optionLines.length * 7) + 2;

            if (y > 280) {
                doc.addPage();
                y = 20;
            }
        });
        y += 5;
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    });

    doc.save(`${quizCategory}_questions.pdf`);
};

const resetQuiz = () => {
    resetTimer();
    correctAnswersCount = 0;
    questionsIndexHistory.length = 0;
    userAnswers.length = 0;
    quizCompleted = false;
};

const logout = () => {
    if (confirm("Are you sure you want to log out?")) {
        resetQuiz();
        dashboardContainer.style.display = "none";
        homeContainer.style.display = "flex";
    }
};

const submitFeedback = (e) => {
    e.preventDefault();
    const selectedRating = starRating.querySelectorAll(".star.active").length;
    const comment = feedbackComment.value.trim();

    if (selectedRating === 0 || comment === "") {
        alert("Please provide a rating and a comment before submitting.");
        return;
    }

    alert(`Thank you for your feedback, ${userName}! \nRating: ${selectedRating} stars\nComment: ${comment}`);
    
    // Reset the form
    starRating.querySelectorAll(".star").forEach(star => star.classList.remove("active"));
    feedbackComment.value = "";
};

// Event Listeners
document.querySelector(".home-prepare-btn").addEventListener("click", showNameModal);

startQuizAfterNameBtn.addEventListener("click", () => {
    const inputName = userNameInput.value.trim();
    if (inputName) {
        showDashboard(inputName);
    } else {
        alert("Please enter your name to continue.");
    }
});

sidebarMenuItems.forEach(item => {
    item.addEventListener("click", () => {
        const action = item.getAttribute("data-content");
        if (action === "download-scorecard") {
            if (quizCompleted) {
                downloadScorecard();
            } else {
                alert("Please complete the quiz first.");
            }
        } else if (action === "download-questions") {
            if (quizCompleted) {
                downloadQuestions();
            } else {
                alert("Please complete the quiz first.");
            }
        } else if (action === "check-answers") {
            if (quizCompleted) {
                openAnswerReviewTab();
            } else {
                alert("Please complete the quiz first.");
            }
        } else if (action === "logout") {
            logout();
        } else {
            activateMenuItem(item);
        }
    });
});

document.querySelectorAll(".category-option, .question-option").forEach(option => {
    option.addEventListener("click", () => {
        option.parentNode.querySelector(".active").classList.remove("active");
        option.classList.add("active");
    });
});

nextStepBtn.addEventListener("click", startConfigStep2);
startQuizBtn.addEventListener("click", startQuiz);
tryAgainBtn.addEventListener("click", () => {
    if (confirm("Do you want to try again?")) {
        resetQuiz();
        showContent("config-step1");
    }
});

quizContainer.querySelector(".next-question-btn").addEventListener("click", renderQuestion);

// Feedback Form Listeners
starRating.addEventListener("click", (e) => {
    const clickedStar = e.target.closest(".star");
    if (!clickedStar) return;
    const rating = parseInt(clickedStar.dataset.rating);
    const stars = starRating.querySelectorAll(".star");
    stars.forEach(star => {
        if (parseInt(star.dataset.rating) <= rating) {
            star.classList.add("active");
        } else {
            star.classList.remove("active");
        }
    });
});

feedbackForm.addEventListener("submit", submitFeedback);

// Initial state
dashboardContainer.style.display = "none";
homeContainer.style.display = "flex";