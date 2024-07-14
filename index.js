document.addEventListener('DOMContentLoaded', () => {
    const topics = document.querySelectorAll('.sidebar ul li');
    const infoDisplay = document.getElementById('infoDisplay');
    const questionDisplay = document.getElementById('questionDisplay');
    const quizResult = document.getElementById('quizResult');
    const addNoteForm = document.getElementById('addNoteForm');
    const answerQuestionForm = document.getElementById('answerQuestionForm');

    topics.forEach(topic => {
        topic.addEventListener('click', () => {
            const topicName = topic.getAttribute('data-topic');
            fetch(`http://localhost:3001/${topicName}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    displayTopicInfo(topicName, data);
                })
                .catch(error => {
                    console.error('Error fetching topic info:', error);
                    infoDisplay.innerHTML = 'Error fetching topic information. Please try again later.';
                });
        });
    });

    function displayTopicInfo(topicName, data) {
        let content = `<h2>Notes</h2><ul>`;
        data.notes.forEach(note => {
            content += `<li>${note}</li>`;
        });
        content += `</ul><h2>Questions</h2><ul>`;
        data.questions.forEach(question => {
            content += `<li>${question.question}</li>`;
        });
        content += `</ul>`;
        infoDisplay.innerHTML = content;
    }

    addNoteForm.addEventListener('submit', event => {
        event.preventDefault();
        const notes = document.getElementById('notes').value;
        const question = document.getElementById('question').value;
        const answers = [
            document.getElementById('answer1').value,
            document.getElementById('answer2').value,
            document.getElementById('answer3').value,
            document.getElementById('answer4').value
        ];
        const correctAnswer = answers[0]; // Assuming the first answer is correct

        const formData = {
            notes: notes,
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        };

        fetch('http://localhost:3001/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add question. Please try again.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Question added successfully:', data);
                alert('Notes and question added successfully!');
                // Optionally update UI or perform further actions
            })
            .catch(error => {
                console.error('Error adding question:', error);
                alert('Failed to add question. Please try again.');
            });
    });

    answerQuestionForm.addEventListener('submit', event => {
        event.preventDefault();
        const studentAnswer = document.getElementById('studentAnswer').value;

        // Fetch the question from the server for validation
        fetch('http://localhost:3001/questions/1') // Assuming question id 1 for demo purposes
            .then(response => response.json())
            .then(question => {
                const result = question.correctAnswer === studentAnswer ? 'Pass' : 'Fail';

                const response = {
                    studentId: 1, // Assuming student id 1 for demo purposes
                    questionId: question.id,
                    studentAnswer: studentAnswer,
                    result: result
                };

                // Store the student's response on the server
                return fetch('http://localhost:3001/studentResponses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(response)
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit answer. Please try again.');
                }
                return response.json();
            })
            .then(data => {
                quizResult.innerHTML = data.result === 'Pass' ? 'Congrats! You passed.' : 'Try again.';
            })
            .catch(error => {
                console.error('Error submitting answer:', error);
                alert('Failed to submit answer. Please try again.');
            });
    });
});
