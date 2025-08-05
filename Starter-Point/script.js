document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const questionText = document.getElementById('question-text');
    const answersContainer = document.getElementById('answers-container');
    const currentQuestionEl = document.getElementById('current-question');
    const scoreEl = document.getElementById('score');
    const finalScoreEl = document.getElementById('final-score');
    const resultMessageEl = document.getElementById('result-message');
    const progressBar = document.getElementById('progress');

    // Quiz data
    const quizQuestions = [
        {
            question: "What is the capital of France?",
            answers: ["London", "Berlin", "Paris", "Madrid"],
            correct: 2
        },
        {
            question: "Which planet is known as the Red Planet?",
            answers: ["Venus", "Mars", "Jupiter", "Saturn"],
            correct: 1
        },
        {
            question: "What is the largest mammal?",
            answers: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
            correct: 1
        },
        {
            question: "Which language runs in a web browser?",
            answers: ["Java", "C", "Python", "JavaScript"],
            correct: 3
        },
        {
            question: "What year was JavaScript launched?",
            answers: ["1996", "1995", "1994", "None of the above"],
            correct: 1
        }
    ];

    // Quiz state
    let currentQuestionIndex = 0;
    let score = 0;
    const totalQuestions = quizQuestions.length;

    // Initialize the quiz
    function initQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        scoreEl.textContent = score;
        showQuestion();
    }

    // Show question
    function showQuestion() {
        const question = quizQuestions[currentQuestionIndex];
        questionText.textContent = question.question;
        answersContainer.innerHTML = '';
        
        // Update progress
        currentQuestionEl.textContent = currentQuestionIndex + 1;
        progressBar.style.width = `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`;

        // Create answer buttons
        question.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.classList.add('answer-btn');
            button.addEventListener('click', () => selectAnswer(index));
            answersContainer.appendChild(button);
        });
    }

    // Handle answer selection
    function selectAnswer(selectedIndex) {
        const question = quizQuestions[currentQuestionIndex];
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        // Disable all buttons after selection
        answerButtons.forEach(button => {
            button.disabled = true;
        });

        // Check if answer is correct
        if (selectedIndex === question.correct) {
            answerButtons[selectedIndex].classList.add('correct');
            score++;
            scoreEl.textContent = score;
        } else {
            answerButtons[selectedIndex].classList.add('incorrect');
            answerButtons[question.correct].classList.add('correct');
        }

        // Move to next question or show results
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < totalQuestions) {
                showQuestion();
            } else {
                showResults();
            }
        }, 1000);
    }

    // Show results
    function showResults() {
        finalScoreEl.textContent = score;
        
        // Set result message based on score
        const percentage = (score / totalQuestions) * 100;
        if (percentage >= 80) {
            resultMessageEl.textContent = "Excellent! You're a quiz master!";
        } else if (percentage >= 50) {
            resultMessageEl.textContent = "Good job! You know your stuff!";
        } else {
            resultMessageEl.textContent = "Keep learning! You'll do better next time!";
        }

        // Switch to results screen
        quizScreen.classList.remove('screen-active');
        resultScreen.classList.add('screen-active');
    }

    // Event listeners
    startBtn.addEventListener('click', () => {
        startScreen.classList.remove('screen-active');
        quizScreen.classList.add('screen-active');
        initQuiz();
    });

    restartBtn.addEventListener('click', () => {
        resultScreen.classList.remove('screen-active');
        quizScreen.classList.add('screen-active');
        initQuiz();
    });

    // Add some CSS classes for correct/incorrect answers (add to your CSS)
    const style = document.createElement('style');
    style.textContent = `
        .correct {
            background-color: #2ecc71 !important;
            color: white !important;
        }
        .incorrect {
            background-color: #e74c3c !important;
            color: white !important;
        }
    `;
    document.head.appendChild(style);
});