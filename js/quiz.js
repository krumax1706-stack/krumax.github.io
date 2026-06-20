// Quiz Controller
class QuizEngine {
    constructor() {
        this.currentCategory = null;
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.answers = []; // Array of { questionIdx, selectedIdx, isCorrect, bloom }
        this.score = 0;
    }

    startQuiz(category) {
        this.currentCategory = category;
        this.currentQuestions = window.thaiLearningContent.quizzes[category];
        this.currentIndex = 0;
        this.answers = [];
        this.score = 0;
        
        // Hide lesson content, show quiz interface
        document.getElementById('lesson-panel').style.display = 'none';
        document.getElementById('quiz-panel').style.display = 'block';
        document.getElementById('quiz-result-panel').style.display = 'none';
        
        // Set category title
        let categoryTitleText = "แบบทดสอบ";
        if (category === 'vocabulary') categoryTitleText += " - การเขียนคำศัพท์";
        else if (category === 'sentence') categoryTitleText += " - การแต่งประโยค";
        else if (category === 'story') categoryTitleText += " - การเขียนเรื่อง";
        
        document.getElementById('quiz-category-title').innerText = categoryTitleText;
        
        this.loadQuestion();
    }

    loadQuestion() {
        const question = this.currentQuestions[this.currentIndex];
        
        // Update progress indicators
        document.getElementById('quiz-progress-text').innerText = `ข้อที่ ${this.currentIndex + 1} จาก ${this.currentQuestions.length}`;
        document.getElementById('bloom-level-badge').innerText = `ระดับ: ${question.bloomName}`;
        
        // Render question text
        const questionTextElement = document.getElementById('quiz-question-text');
        questionTextElement.innerHTML = question.question;
        
        // Render options
        const optionsGrid = document.getElementById('quiz-options-grid');
        optionsGrid.innerHTML = '';
        
        question.options.forEach((option, idx) => {
            const prefix = String.fromCharCode(65 + idx); // A, B, C, D
            const optionCard = document.createElement('div');
            optionCard.className = 'option-card';
            optionCard.innerHTML = `
                <div class="option-prefix">${prefix}</div>
                <div class="option-text">${option}</div>
            `;
            optionCard.addEventListener('click', () => this.selectOption(idx, optionCard));
            optionsGrid.appendChild(optionCard);
        });

        // Hide mascot feedback initially
        document.getElementById('mascot-feedback').style.display = 'none';
        document.getElementById('quiz-next-btn').style.display = 'none';
        
        // Slide animation
        optionsGrid.classList.remove('slide-in');
        void optionsGrid.offsetWidth; // Trigger reflow
        optionsGrid.classList.add('slide-in');
    }

    selectOption(selectedIdx, selectedCard) {
        // Prevent double selecting
        const question = this.currentQuestions[this.currentIndex];
        const allCards = document.querySelectorAll('.option-card');
        
        // If already answered, don't do anything
        if (document.getElementById('quiz-next-btn').style.display === 'block') {
            return;
        }

        const isCorrect = selectedIdx === question.correct;
        if (isCorrect) {
            this.score++;
            selectedCard.classList.add('correct');
            this.triggerConfetti();
        } else {
            selectedCard.classList.add('incorrect');
            // Show the correct answer as well
            allCards[question.correct].classList.add('correct');
            // Shake the incorrect option
            selectedCard.classList.add('shake');
            setTimeout(() => selectedCard.classList.remove('shake'), 500);
        }

        // Save answer info
        this.answers.push({
            questionIdx: this.currentIndex,
            selectedIdx: selectedIdx,
            isCorrect: isCorrect,
            bloom: question.bloom
        });

        // Disable other interactions
        allCards.forEach(card => card.style.cursor = 'default');

        // Show explanation and mascot feedback
        const mascotFeedback = document.getElementById('mascot-feedback');
        const feedbackTitle = document.getElementById('feedback-title');
        const feedbackExplanation = document.getElementById('feedback-explanation');
        
        if (isCorrect) {
            feedbackTitle.innerText = "เก่งมากเลยครับ! 🎉";
            feedbackTitle.className = "explanation-title correct-text";
        } else {
            feedbackTitle.innerText = "ไม่เป็นไรนะ ลองดูคำอธิบายกันครับ 💡";
            feedbackTitle.className = "explanation-title incorrect-text";
        }
        
        feedbackExplanation.innerHTML = question.explanation;
        mascotFeedback.style.display = 'flex';
        
        // Show next button (or finish button)
        const nextBtn = document.getElementById('quiz-next-btn');
        if (this.currentIndex === this.currentQuestions.length - 1) {
            nextBtn.innerHTML = `ดูผลการประเมิน 🏆`;
        } else {
            nextBtn.innerHTML = `ข้อถัดไป ➔`;
        }
        nextBtn.style.display = 'block';
    }

    nextQuestion() {
        if (this.currentIndex < this.currentQuestions.length - 1) {
            this.currentIndex++;
            this.loadQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        document.getElementById('quiz-panel').style.display = 'none';
        document.getElementById('quiz-result-panel').style.display = 'block';

        const percent = Math.round((this.score / this.currentQuestions.length) * 100);
        
        // Update Score UI
        const circle = document.getElementById('circular-score-box');
        circle.style.setProperty('--score-percent', percent);
        document.getElementById('result-score-num').innerText = `${this.score}/${this.currentQuestions.length}`;
        
        // Set summary message based on score
        let ratingTitle = "";
        let ratingDesc = "";
        if (percent === 100) {
            ratingTitle = "สุดยอดอัจฉริยะภาษาไทย! 👑";
            ratingDesc = "น้อง ๆ ตอบถูกครบทุกข้อเลย เก่งมากๆ เลยครับ พี่ปันดีขอยกนิ้วให้เลย!";
            this.triggerConfettiLong();
        } else if (percent >= 70) {
            ratingTitle = "ผ่านเกณฑ์ระดับยอดเยี่ยม! 🌟";
            ratingDesc = "ทำคะแนนได้ดีมากครับ แสดงว่าเข้าใจบทเรียนนี้เป็นอย่างดีเลย!";
        } else if (percent >= 50) {
            ratingTitle = "ผ่านเกณฑ์การเรียนรู้! 👍";
            ratingDesc = "ผ่านแล้วครับ! แต่สามารถทบทวนเนื้อหาเพื่อทำคะแนนให้เต็มได้อีกนะ";
        } else {
            ratingTitle = "พยายามอีกนิดนะคนเก่ง 📚";
            ratingDesc = "ยังไม่ผ่านเกณฑ์ครึ่งหนึ่ง ไม่เป็นไรนะ ลองกลับไปทบทวนเนื้อหาและกลับมาทำใหม่อีกครั้งครับ";
        }
        
        document.getElementById('result-rating-title').innerText = ratingTitle;
        document.getElementById('result-rating-desc').innerText = ratingDesc;

        // Render Bloom's Taxonomy Report
        const bloomReportGrid = document.getElementById('result-bloom-grid');
        bloomReportGrid.innerHTML = '';

        this.answers.forEach(ans => {
            const q = this.currentQuestions[ans.questionIdx];
            const row = document.createElement('div');
            row.className = 'bloom-score-row';
            row.innerHTML = `
                <div class="bloom-name">
                    <strong>${q.bloomName}</strong>
                </div>
                <div class="bloom-status ${ans.isCorrect ? 'pass' : 'fail'}">
                    ${ans.isCorrect ? '✓ ผ่าน' : '✗ ปรับปรุง'}
                </div>
            `;
            bloomReportGrid.appendChild(row);
        });

        // Save progress to LocalStorage
        this.saveProgress(this.currentCategory, this.score, this.currentQuestions.length);
    }

    saveProgress(category, score, total) {
        let progress = JSON.parse(localStorage.getItem('thai_learning_progress')) || {};
        
        // Save highest score
        if (!progress[category] || progress[category].score < score) {
            progress[category] = {
                score: score,
                total: total,
                completed: score >= (total / 2) // Pass threshold is 50%
            };
            localStorage.setItem('thai_learning_progress', JSON.stringify(progress));
        }
        
        // Update progress display on header and dashboard
        if (window.appController) {
            window.appController.loadProgress();
        }
    }

    triggerConfetti() {
        const container = document.body;
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 65%)`;
            confetti.style.animationDuration = Math.random() * 1.5 + 1 + 's';
            confetti.style.transform = `scale(${Math.random() * 0.8 + 0.5})`;
            
            container.appendChild(confetti);
            setTimeout(() => confetti.remove(), 2500);
        }
    }

    triggerConfettiLong() {
        let count = 0;
        const interval = setInterval(() => {
            this.triggerConfetti();
            count++;
            if (count > 4) clearInterval(interval);
        }, 400);
    }
}

// Certificate Generator
function generateCertificate(studentName, scoreText, categoryName) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 560;
    const ctx = canvas.getContext('2d');

    // Background Cream
    ctx.fillStyle = '#FFFDF6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Borders
    ctx.strokeStyle = '#4A90E2';
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = '#FF8C42';
    ctx.lineWidth = 4;
    ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);

    // Header Thai Text
    ctx.fillStyle = '#2A6CBF';
    ctx.textAlign = 'center';
    
    ctx.font = 'bold 36px Mitr, Sarabun, sans-serif';
    ctx.fillText('เกียรติบัตรการเรียนรู้ภาษาไทย', canvas.width / 2, 100);
    
    ctx.font = '20px Sarabun, sans-serif';
    ctx.fillStyle = '#718096';
    ctx.fillText('สื่อการเรียนรู้ภาษาไทย ชั้นประถมศึกษาปีที่ 3', canvas.width / 2, 135);

    // Certificate text
    ctx.fillStyle = '#2D3748';
    ctx.font = 'italic 22px Sarabun, sans-serif';
    ctx.fillText('เกียรติบัตรฉบับนี้มอบให้เพื่อแสดงว่า', canvas.width / 2, 200);

    // Student Name
    ctx.fillStyle = '#FF8C42';
    ctx.font = 'bold 38px Mitr, Sarabun, sans-serif';
    ctx.fillText(studentName || 'น้องคนเก่ง', canvas.width / 2, 260);

    // Draw line under name
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 180, 280);
    ctx.lineTo(canvas.width / 2 + 180, 280);
    ctx.stroke();

    // Achievement text
    ctx.fillStyle = '#2D3748';
    ctx.font = '22px Sarabun, sans-serif';
    ctx.fillText(`ได้เรียนรู้และผ่านการทดสอบเรื่อง "${categoryName}"`, canvas.width / 2, 330);
    
    ctx.font = 'bold 24px Mitr, Sarabun, sans-serif';
    ctx.fillStyle = '#00C9A7';
    ctx.fillText(`ทำคะแนนประเมินได้ ${scoreText}`, canvas.width / 2, 375);

    ctx.fillStyle = '#718096';
    ctx.font = '18px Sarabun, sans-serif';
    ctx.fillText('อ้างอิงระดับการเรียนรู้ตาม Bloom\'s Taxonomy ทั้ง 6 ระดับ', canvas.width / 2, 420);

    // Mascot representation (Draw a cute circle badge)
    ctx.fillStyle = '#EBF3FC';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 480, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#4A90E2';
    ctx.font = '28px Mitr, sans-serif';
    ctx.fillText('🐘', canvas.width / 2, 490);

    ctx.font = '12px Sarabun, sans-serif';
    ctx.fillStyle = '#718096';
    ctx.fillText('พี่ปันดี - ผู้มอบความรู้', canvas.width / 2, 525);

    // Trigger download
    const link = document.createElement('a');
    link.download = `เกียรติบัตร_${studentName || 'น้องคนเก่ง'}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

window.QuizEngine = QuizEngine;
window.generateCertificate = generateCertificate;
