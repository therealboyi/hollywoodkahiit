document.addEventListener('DOMContentLoaded', () => {
    const tokenUrl = 'https://opentdb.com/api_token.php?command=request';
    let apiUrl = 'https://opentdb.com/api.php?amount=10&type=multiple';
    const questionContainer = document.getElementById('question-container');
    const questionImage = document.getElementById('question-image');
    const questionElement = document.getElementById('question');
    const optionsContainer = document.getElementById('options');
    const lifelineButton = document.getElementById('lifeline');
    const resetButton = document.getElementById('reset');
    const currentCountElement = document.getElementById('current-count');
    const lifelineCountElement = document.getElementById('lifeline-count');

    let questions = [];
    let currentQuestionIndex = 0;
    let correctAnswer;
    let lifelineUsed = false;
    let currentCount = 0;
    let lifelinesRemaining = 3;

    async function initializeGame() {
        try {
            const tokenResponse = await fetch(tokenUrl);
            const tokenData = await tokenResponse.json();
            const token = tokenData.token;
            apiUrl += `&token=${token}`;
            await fetchQuestions();
        } catch (error) {
            console.error('Error fetching token:', error);
        }
    }

    async function fetchQuestions() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            questions = data.results;
            displayQuestion(questions[currentQuestionIndex]);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }

    function displayQuestion(questionData) {
        questionElement.innerHTML = questionData.question;
        optionsContainer.innerHTML = '';
        questionImage.style.display = 'none';

        correctAnswer = questionData.correct_answer;
        const options = [...questionData.incorrect_answers, questionData.correct_answer];
        shuffleArray(options);

        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('option');
            button.addEventListener('click', () => selectOption(option));
            optionsContainer.appendChild(button);
        });

        lifelineUsed = false;

        fetchImageForQuestion(questionData.question);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function selectOption(selectedOption) {
        if (selectedOption === correctAnswer) {
            currentCount += 1000000;
            currentCountElement.textContent = `Amount Won: $${currentCount.toLocaleString()}`;
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion(questions[currentQuestionIndex]);
            } else {
                alert('Congratulations! You are now a Millionaire!!! $' + currentCount.toLocaleString());
                showFinalScore();
            }
        } else {
            alert('Wrong! The correct answer was ' + correctAnswer + '. You walked away with $' + currentCount.toLocaleString());
            showFinalScore();
        }
    }

    function showFinalScore() {
        questionContainer.classList.add('hidden');
        lifelineButton.classList.add('hidden');
        resetButton.classList.remove('hidden');
        currentCountElement.textContent = `You Walked Away With: $${currentCount.toLocaleString()}`;
    }

    function resetGame() {
        currentQuestionIndex = 0;
        currentCount = 0;
        lifelinesRemaining = 3;
        currentCountElement.textContent = 'Amount Won: $0';
        lifelineCountElement.textContent = 'Lifelines Remaining: 3';
        questionContainer.classList.remove('hidden');
        lifelineButton.classList.remove('hidden');
        resetButton.classList.add('hidden');
        initializeGame();
    }

    function useLifeline() {
        if (lifelineUsed || lifelinesRemaining === 0) return;

        const options = Array.from(document.getElementsByClassName('option'));
        let incorrectOptions = options.filter(option => option.textContent !== correctAnswer);
        shuffleArray(incorrectOptions);

        incorrectOptions.slice(0, 2).forEach(option => option.style.display = 'none');
        lifelineUsed = true;
        lifelinesRemaining--;
        lifelineCountElement.textContent = `Lifelines Remaining: ${lifelinesRemaining}`;
    }

    async function fetchImageForQuestion(questionText) {
        const response = await fetch('https://api.example.com/getImageForQuestion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: questionText })
        });

        if (response.ok) {
            const data = await response.json();
            questionImage.src = data.imageUrl;
            questionImage.style.display = 'block';
        } else {
            console.error('Error fetching image for question');
        }
    }

    lifelineButton.addEventListener('click', useLifeline);
    resetButton.addEventListener('click', resetGame);

    initializeGame();
});
