// Application Controller
class AppController {
    constructor() {
        this.quizEngine = new window.QuizEngine();
        this.currentView = 'home-view';
        this.currentLessonCategory = null;
        this.currentSlideIndex = 0;
        
        this.init();
    }

    init() {
        // Nav Links Event Listeners
        document.querySelectorAll('[data-target]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                this.switchView(target);
            });
        });

        // Logo click goes home
        document.getElementById('header-logo').addEventListener('click', () => {
            this.switchView('home-view');
        });

        // Initialize progress
        this.loadProgress();

        // Level cards click listener
        document.getElementById('card-vocab').addEventListener('click', () => this.openLesson('vocabulary'));
        document.getElementById('card-sentence').addEventListener('click', () => this.openLesson('sentence'));
        document.getElementById('card-story').addEventListener('click', () => this.openLesson('story'));

        // Quiz control buttons
        document.getElementById('quiz-next-btn').addEventListener('click', () => {
            this.quizEngine.nextQuestion();
        });

        document.getElementById('quiz-restart-btn').addEventListener('click', () => {
            this.quizEngine.startQuiz(this.quizEngine.currentCategory);
        });

        document.getElementById('quiz-back-home-btn').addEventListener('click', () => {
            this.switchView('home-view');
        });

        // Certificate modal action
        document.getElementById('btn-show-cert').addEventListener('click', () => {
            this.showCertificateModal();
        });

        document.getElementById('modal-close').addEventListener('click', () => {
            document.getElementById('cert-modal').classList.remove('active');
        });

        document.getElementById('btn-download-cert').addEventListener('click', () => {
            const name = document.getElementById('student-name-input').value.trim();
            let scoreText = document.getElementById('result-score-num').innerText;
            let displayCategoryName = "";
            if (this.quizEngine.currentCategory === 'vocabulary') displayCategoryName = "การเขียนคำศัพท์ ป.3";
            else if (this.quizEngine.currentCategory === 'sentence') displayCategoryName = "การแต่งประโยค ป.3";
            else if (this.quizEngine.currentCategory === 'story') displayCategoryName = "การเขียนเรื่อง ป.3";

            window.generateCertificate(name, scoreText, displayCategoryName);
            document.getElementById('cert-modal').classList.remove('active');
        });
    }

    switchView(viewId) {
        // Update navbar active link
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-target') === viewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Hide all views and show target view
        document.querySelectorAll('.view-section').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewId;
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('thai_learning_progress')) || {};
        
        let totalStars = 0;
        
        // Vocab Progress
        const vocabProg = progress['vocabulary'] || { score: 0, total: 6, completed: false };
        const vocabPercent = Math.round((vocabProg.score / vocabProg.total) * 100);
        document.getElementById('progress-fill-vocab').style.width = `${vocabPercent}%`;
        document.getElementById('progress-text-vocab').innerText = `${vocabProg.score}/${vocabProg.total} ข้อ`;
        if (vocabProg.completed) totalStars++;

        // Sentence Progress
        const sentenceProg = progress['sentence'] || { score: 0, total: 6, completed: false };
        const sentencePercent = Math.round((sentenceProg.score / sentenceProg.total) * 100);
        document.getElementById('progress-fill-sentence').style.width = `${sentencePercent}%`;
        document.getElementById('progress-text-sentence').innerText = `${sentenceProg.score}/${sentenceProg.total} ข้อ`;
        if (sentenceProg.completed) totalStars++;

        // Story Progress
        const storyProg = progress['story'] || { score: 0, total: 6, completed: false };
        const storyPercent = Math.round((storyProg.score / storyProg.total) * 100);
        document.getElementById('progress-fill-story').style.width = `${storyPercent}%`;
        document.getElementById('progress-text-story').innerText = `${storyProg.score}/${storyProg.total} ข้อ`;
        if (storyProg.completed) totalStars++;

        // Header stars
        document.getElementById('header-star-count').innerText = `⭐ ${totalStars} ดวง`;
    }

    openLesson(category) {
        this.currentLessonCategory = category;
        this.currentSlideIndex = 0;
        
        // Show lesson panel, hide other views
        this.switchView('lesson-view');
        document.getElementById('lesson-panel').style.display = 'block';
        document.getElementById('quiz-panel').style.display = 'none';
        document.getElementById('quiz-result-panel').style.display = 'none';

        // Title and syllabus loading
        let title = "";
        let themeClass = "";
        if (category === 'vocabulary') {
            title = "ระดับที่ 1: การเขียนคำศัพท์";
            themeClass = "lvl-1";
        } else if (category === 'sentence') {
            title = "ระดับที่ 2: การแต่งประโยค";
            themeClass = "lvl-2";
        } else if (category === 'story') {
            title = "ระดับที่ 3: การเขียนเรื่อง";
            themeClass = "lvl-3";
        }

        const titleBadge = document.getElementById('lesson-title-badge');
        titleBadge.innerHTML = `📚 ${title}`;
        
        // Render lesson tabs (slides)
        const slideData = window.thaiLearningContent.lessons[category];
        const tabNav = document.getElementById('lesson-tab-nav');
        tabNav.innerHTML = '';

        slideData.forEach((slide, idx) => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${idx === 0 ? 'active' : ''}`;
            btn.innerText = slide.title;
            btn.addEventListener('click', () => this.switchSlide(idx));
            tabNav.appendChild(btn);
        });

        // Add special tab for Playground (การทดลองฝึกเขียนสร้างสรรค์)
        const playgroundBtn = document.createElement('button');
        playgroundBtn.className = 'tab-btn';
        playgroundBtn.style.backgroundColor = 'var(--secondary-light)';
        playgroundBtn.style.color = 'var(--secondary-color)';
        playgroundBtn.innerHTML = '🎨 กิจกรรมฝึกเขียน';
        playgroundBtn.addEventListener('click', () => this.openPlayground(category));
        tabNav.appendChild(playgroundBtn);

        // Load first slide content
        this.switchSlide(0);
    }

    switchSlide(index) {
        this.currentSlideIndex = index;
        
        // Highlight active tab button
        const tabButtons = document.querySelectorAll('#lesson-tab-nav .tab-btn');
        tabButtons.forEach((btn, idx) => {
            if (idx === index) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        const slideData = window.thaiLearningContent.lessons[this.currentLessonCategory][index];
        const contentDiv = document.getElementById('lesson-pane-content');
        contentDiv.innerHTML = '';
        
        // Render slide cards
        slideData.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = card.type === 'example' ? 'example-box' : 'lesson-card';
            
            if (card.type === 'example') {
                cardElement.innerHTML = `
                    <div class="example-title">💡 ${card.title}</div>
                    <div>${card.content}</div>
                `;
            } else {
                cardElement.style.backgroundColor = '#FFFFFF';
                cardElement.style.border = '1px solid var(--border-color)';
                cardElement.style.padding = '1.5rem';
                cardElement.style.borderRadius = 'var(--radius-md)';
                cardElement.style.marginBottom = '1.5rem';
                cardElement.innerHTML = `
                    <h3 style="margin-bottom:0.75rem; color:var(--primary-dark); font-family:var(--font-heading);">${card.title}</h3>
                    <div>${card.content}</div>
                `;
            }
            contentDiv.appendChild(cardElement);
        });

        // Add Action Button at the bottom
        const actionArea = document.createElement('div');
        actionArea.style.marginTop = '2rem';
        actionArea.style.display = 'flex';
        actionArea.style.justifyContent = 'space-between';
        
        // Next slide or go to playground button
        const slidesCount = window.thaiLearningContent.lessons[this.currentLessonCategory].length;
        
        actionArea.innerHTML = `
            <button class="btn btn-outline" id="btn-lesson-back">🏠 กลับไปเมนูหลัก</button>
            <button class="btn btn-primary" id="btn-lesson-next">หน้าถัดไป ➔</button>
        `;
        contentDiv.appendChild(actionArea);

        document.getElementById('btn-lesson-back').addEventListener('click', () => {
            this.switchView('home-view');
        });

        document.getElementById('btn-lesson-next').addEventListener('click', () => {
            if (index < slidesCount - 1) {
                this.switchSlide(index + 1);
            } else {
                this.openPlayground(this.currentLessonCategory);
            }
        });
    }

    openPlayground(category) {
        // Set all tab buttons inactive except the last one (Playground)
        const tabButtons = document.querySelectorAll('#lesson-tab-nav .tab-btn');
        tabButtons.forEach((btn, idx) => {
            if (idx === tabButtons.length - 1) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        const contentDiv = document.getElementById('lesson-pane-content');
        contentDiv.innerHTML = '';

        // Render Title
        const pgHeader = document.createElement('div');
        pgHeader.innerHTML = `
            <h2 style="font-family:var(--font-heading); color:var(--secondary-color); margin-bottom:1rem;">🎨 กิจกรรมฝึกทักษะสร้างสรรค์</h2>
            <p style="color:var(--text-muted); margin-bottom:1.5rem;">มาทบทวนสิ่งที่เรียนรู้ด้วยกิจกรรมสนุก ๆ ก่อนลงมือทำแบบทดสอบจริงกันครับ!</p>
        `;
        contentDiv.appendChild(pgHeader);

        // Render Playground Content based on Category
        if (category === 'vocabulary') {
            this.renderVocabPlayground(contentDiv);
        } else if (category === 'sentence') {
            this.renderSentencePlayground(contentDiv);
        } else if (category === 'story') {
            this.renderStoryPlayground(contentDiv);
        }

        // Add Next Button to start real quiz
        const actionArea = document.createElement('div');
        actionArea.style.marginTop = '2rem';
        actionArea.style.display = 'flex';
        actionArea.style.justifyContent = 'space-between';
        actionArea.innerHTML = `
            <button class="btn btn-outline" id="btn-pg-back">🏠 กลับเมนูหลัก</button>
            <button class="btn btn-secondary" id="btn-start-quiz" style="animation: pulseSecondary 2s infinite;">เริ่มทำแบบทดสอบจริง 🏆</button>
        `;
        contentDiv.appendChild(actionArea);

        document.getElementById('btn-pg-back').addEventListener('click', () => {
            this.switchView('home-view');
        });

        document.getElementById('btn-start-quiz').addEventListener('click', () => {
            this.quizEngine.startQuiz(category);
        });
    }

    renderVocabPlayground(container) {
        const div = document.createElement('div');
        div.className = 'lesson-card';
        div.style.backgroundColor = '#FFFFFF';
        div.style.padding = '1.5rem';
        div.style.border = '2px solid var(--primary-light)';
        div.innerHTML = `
            <h3 style="margin-bottom:0.75rem; color:var(--primary-color);">เกมฝึกสะกดคำศัพท์</h3>
            <p style="margin-bottom:1rem;">ให้น้อง ๆ สะกดคำศัพท์ภาษาไทยให้ตรงกับเสียงอ่านต่อไปนี้:</p>
            <div style="background-color:var(--primary-light); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1.5rem; text-align:center;">
                <strong style="font-size:1.3rem;">คำอ่าน: "ความ-จิง"</strong>
            </div>
            <div style="display:flex; gap:1rem; margin-bottom:1.5rem;">
                <input type="text" id="vocab-pg-input" class="story-textarea" style="height:50px; font-size:1.2rem; text-align:center;" placeholder="พิมพ์คำศัพท์สะกดที่นี่..." autocomplete="off">
                <button class="btn btn-accent" id="vocab-pg-check-btn">ตรวจคำตอบ</button>
            </div>
            <div id="vocab-pg-feedback" style="display:none; padding:0.75rem; border-radius:var(--radius-sm); text-align:center; font-weight:bold;"></div>
        `;
        container.appendChild(div);

        const checkBtn = document.getElementById('vocab-pg-check-btn');
        const input = document.getElementById('vocab-pg-input');
        const feedback = document.getElementById('vocab-pg-feedback');

        checkBtn.addEventListener('click', () => {
            const val = input.value.trim();
            if (val === 'ความจริง') {
                feedback.style.display = 'block';
                feedback.style.backgroundColor = 'var(--accent-light)';
                feedback.style.color = 'var(--accent-color)';
                feedback.innerText = 'ถูกต้องเก่งมาก! คำควบไม่แท้ "จริง" (มี ร แต่ไม่ออกเสียง ร) 🎉';
                this.quizEngine.triggerConfetti();
            } else {
                feedback.style.display = 'block';
                feedback.style.backgroundColor = 'var(--danger-light)';
                feedback.style.color = 'var(--danger-color)';
                feedback.innerText = 'ยังไม่ถูกน้า ลองพยายามพิมพ์สะกดใหม่ เช่น "ความ..." (สะกดด้วย ร ควบไม่แท้)';
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 500);
            }
        });
    }

    renderSentencePlayground(container) {
        const div = document.createElement('div');
        div.className = 'lesson-card';
        div.style.backgroundColor = '#FFFFFF';
        div.style.padding = '1.5rem';
        div.style.border = '2px solid var(--primary-light)';
        div.innerHTML = `
            <h3 style="margin-bottom:0.75rem; color:var(--primary-color);">เกมบล็อกสร้างประโยค (Drag & Drop / Click to Sort)</h3>
            <p style="margin-bottom:1.5rem;">จงเรียงลำดับบล็อกคำศัพท์ต่อไปนี้ให้ได้ประโยคบอกเล่าที่มีใจความสมบูรณ์:</p>
            
            <div class="draggable-container" id="blocks-source">
                <div class="word-block" data-word="สุนัขสีขาว">สุนัขสีขาว</div>
                <div class="word-block" data-word="กระโดด">กระโดด</div>
                <div class="word-block" data-word="คาบลูกบอล">คาบลูกบอล</div>
                <div class="word-block" data-word="อย่างสนุกสนาน">อย่างสนุกสนาน</div>
            </div>
            
            <p style="margin-top:1.5rem; margin-bottom:0.5rem; font-weight:bold;">ประโยคของน้อง ๆ:</p>
            <div class="draggable-container" id="blocks-target" style="border-style: solid; border-color:var(--accent-color); background-color:#FFFFFF;">
                <p id="pg-placeholder" style="color:var(--text-muted); font-style:italic;">คลิกที่บล็อกด้านบนเพื่อจัดเรียงประโยคที่นี่</p>
            </div>
            
            <div style="display:flex; gap:1rem; justify-content:center; margin-top:1rem;">
                <button class="btn btn-outline" id="sentence-pg-reset-btn">เริ่มใหม่</button>
                <button class="btn btn-accent" id="sentence-pg-check-btn">ตรวจประโยค</button>
            </div>
            <div id="sentence-pg-feedback" style="display:none; margin-top:1.5rem; padding:0.75rem; border-radius:var(--radius-sm); text-align:center; font-weight:bold;"></div>
        `;
        container.appendChild(div);

        const sourceContainer = document.getElementById('blocks-source');
        const targetContainer = document.getElementById('blocks-target');
        const placeholder = document.getElementById('pg-placeholder');
        const resetBtn = document.getElementById('sentence-pg-reset-btn');
        const checkBtn = document.getElementById('sentence-pg-check-btn');
        const feedback = document.getElementById('sentence-pg-feedback');

        // Simple click-to-move logic
        sourceContainer.addEventListener('click', (e) => {
            const block = e.target.closest('.word-block');
            if (block) {
                if (placeholder) placeholder.style.display = 'none';
                targetContainer.appendChild(block);
            }
        });

        targetContainer.addEventListener('click', (e) => {
            const block = e.target.closest('.word-block');
            if (block) {
                sourceContainer.appendChild(block);
                if (targetContainer.children.length === 1 && targetContainer.children[0].id === 'pg-placeholder') {
                    placeholder.style.display = 'block';
                } else if (targetContainer.querySelectorAll('.word-block').length === 0) {
                    if (placeholder) placeholder.style.display = 'block';
                }
            }
        });

        resetBtn.addEventListener('click', () => {
            const blocks = targetContainer.querySelectorAll('.word-block');
            blocks.forEach(block => sourceContainer.appendChild(block));
            if (placeholder) placeholder.style.display = 'block';
            feedback.style.display = 'none';
        });

        checkBtn.addEventListener('click', () => {
            const blocks = targetContainer.querySelectorAll('.word-block');
            const resultWords = Array.from(blocks).map(b => b.getAttribute('data-word'));
            const sentence = resultWords.join(' ');
            
            // Expected sentence
            const correctSentence = "สุนัขสีขาว กระโดด คาบลูกบอล อย่างสนุกสนาน";
            
            if (sentence === correctSentence) {
                feedback.style.display = 'block';
                feedback.style.backgroundColor = 'var(--accent-light)';
                feedback.style.color = 'var(--accent-color)';
                feedback.innerText = 'เรียงประโยคได้ถูกต้องสมบูรณ์! เก่งยอดเยี่ยมเลยครับ 🎉';
                this.quizEngine.triggerConfetti();
            } else {
                feedback.style.display = 'block';
                feedback.style.backgroundColor = 'var(--danger-light)';
                feedback.style.color = 'var(--danger-color)';
                feedback.innerText = 'ประโยคยังไม่สอดคล้องน้า ลองเรียงใหม่ในแบบ: [ประธาน] [กริยา] [กรรม] [ขยายกริยา]';
            }
        });
    }

    renderStoryPlayground(container) {
        const div = document.createElement('div');
        div.className = 'lesson-card';
        div.style.backgroundColor = '#FFFFFF';
        div.style.padding = '1.5rem';
        div.style.border = '2px solid var(--primary-light)';
        
        div.innerHTML = `
            <h3 style="margin-bottom:0.75rem; color:var(--primary-color);">ห้องเขียนเรื่องตามจินตนาการ</h3>
            <p style="margin-bottom:1rem;">ให้น้อง ๆ ฝึกแต่งเรื่องสั้น (ความยาว 3-4 ประโยค) เกี่ยวกับภาพ "วันปิกนิกแสนสนุกในสวนธารณะ" โดยมีคีย์เวิร์ดช่วยแนะนำ</p>
            
            <div class="story-writing-area">
                <div class="story-pic-card">
                    <!-- Render a simulated cute canvas icon for picnic to look rich -->
                    <div style="font-size:5rem; margin-bottom:10px;">🧺🌳🥪</div>
                    <div class="story-pic-prompt">ภาพ: ครอบครัวสุขสันต์กำลังปิกนิกริมบึงน้ำใต้ร่มไม้ใหญ่</div>
                </div>
                <div class="story-input-card">
                    <textarea id="story-pg-input" class="story-textarea" placeholder="พิมพ์เรื่องเล่าของน้อง ๆ ที่นี่ (อย่างน้อย 30 ตัวอักษร)..."></textarea>
                    
                    <div class="story-keywords">
                        <strong>คำเชื่อมแนะนำ:</strong>
                        <span class="keyword-tag">และ</span>
                        <span class="keyword-tag">เพราะ</span>
                        <span class="keyword-tag">แต่</span>
                        <span class="keyword-tag">ดังนั้น...จึง</span>
                    </div>

                    <div class="checklist-title">รายการตรวจสอบส่วนตัว:</div>
                    <div class="checklist-grid">
                        <label class="checklist-item"><input type="checkbox" id="chk-title"> มีการตั้งชื่อเรื่อง</label>
                        <label class="checklist-item"><input type="checkbox" id="chk-length"> ความยาวพอเหมาะ (3 ประโยคขึ้นไป)</label>
                        <label class="checklist-item"><input type="checkbox" id="chk-words"> มีการใช้คำเชื่อมประโยค</label>
                        <label class="checklist-item"><input type="checkbox" id="chk-clean"> ตรวจคำสะกดแล้ว</label>
                    </div>
                </div>
            </div>

            <div style="display:flex; justify-content:center; gap:1rem;">
                <button class="btn btn-accent" id="story-pg-check-btn">ส่งผลงานให้พี่ปันดีวิจารณ์</button>
            </div>
            <div id="story-pg-feedback" style="display:none; margin-top:1.5rem; padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--primary-color); background-color:var(--primary-light);"></div>
        `;
        container.appendChild(div);

        const checkBtn = document.getElementById('story-pg-check-btn');
        const input = document.getElementById('story-pg-input');
        const feedback = document.getElementById('story-pg-feedback');
        
        // Checkboxes auto-updater (mock check)
        input.addEventListener('input', () => {
            const val = input.value.trim();
            document.getElementById('chk-length').checked = val.length >= 30;
            document.getElementById('chk-words').checked = (val.includes('และ') || val.includes('เพราะ') || val.includes('แต่') || val.includes('ดังนั้น') || val.includes('จึง'));
            document.getElementById('chk-title').checked = val.includes('เรื่อง') || val.split('\n')[0].length < 15 && val.split('\n')[0].length > 2;
        });

        checkBtn.addEventListener('click', () => {
            const val = input.value.trim();
            if (val.length < 15) {
                alert("ลองเขียนอีกสักนิดนะครับ เรื่องสั้นเกินไปนิดนึงน้า 📝");
                return;
            }
            
            feedback.style.display = 'block';
            feedback.innerHTML = `
                <div style="display:flex; gap:1rem; align-items:center;">
                    <div style="font-size:2rem;">🐘</div>
                    <div>
                        <strong style="color:var(--primary-dark);">พี่ปันดีวิจารณ์ผลงาน:</strong>
                        <p style="margin-top:0.25rem;">"ว้าว! แต่งเรื่องได้มีความคิดสร้างสรรค์มากเลยครับ โครงเรื่องดูสนุกและมีจินตนาการที่ดีเยี่ยม ภาษาที่ใช้เหมาะสมดีมาก ขอให้เก่งแบบนี้ตลอดไปน้า คนเก่ง!"</p>
                    </div>
                </div>
            `;
            this.quizEngine.triggerConfetti();
        });
    }

    showCertificateModal() {
        document.getElementById('cert-modal').classList.add('active');
        document.getElementById('student-name-input').focus();
    }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
    window.appController = new AppController();
});
