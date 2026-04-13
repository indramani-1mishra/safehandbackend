const fs = require('fs');
const path = require('path');

// Read the background image and convert it to base64 (same as existing templates)
const imagePath = path.join(__dirname, '..', 'important_assest', 'companywatermark.jpeg');
let backgroundImage = '';
try {
    const imageBase64 = fs.readFileSync(imagePath).toString('base64');
    backgroundImage = `data:image/jpeg;base64,${imageBase64}`;
} catch (error) {
    console.error("Error loading background image for GK PDF:", error.message);
}

/**
 * Generates a beautifully styled HTML template for GK Questions PDF
 * @param {Object} data - The GK question data from Gemini API
 * @param {Array} data.questions - Array of 5 question objects
 * @param {string} data.message - Greeting message with date and motivational quote
 * @returns {string} - HTML string for PDF generation
 */
const generateGKQuestionPdfTemplate = (data) => {
    const { questions, message } = data;

    // Map option labels
    const optionLabels = ['A', 'B', 'C', 'D'];

    // Generate question cards HTML
    const questionsHtml = questions.map((q, index) => {
        const options = [q.option1, q.option2, q.option3, q.option4];
        const optionsHtml = options.map((opt, i) => {
            const isAnswer = opt === q.answer;
            return `
                <div class="option ${isAnswer ? 'correct' : ''}">
                    <span class="option-label ${isAnswer ? 'correct-label' : ''}">${optionLabels[i]}</span>
                    <span class="option-text">${opt}</span>
                    ${isAnswer ? '<span class="check-icon">✔</span>' : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="question-card">
                <div class="question-header">
                    <span class="question-number">प्रश्न ${index + 1}</span>
                </div>
                <div class="question-text">${q.question}</div>
                <div class="options-grid">
                    ${optionsHtml}
                </div>
                <div class="explanation">
                    <span class="explanation-icon">💡</span>
                    <span class="explanation-text"><strong>व्याख्या:</strong> ${q.explanation}</span>
                </div>
            </div>
        `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            @page {
                size: A4;
                margin: 0;
            }
            body { 
                font-family: 'Noto Sans Devanagari', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                margin: 0; 
                padding: 0;
                width: 210mm;
                min-height: 297mm;
                position: relative;
                color: #1e293b;
            }
            .letterhead {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
            }
            .letterhead img {
                width: 100%;
                height: 100%;
                display: block;
            }
            .content-wrapper {
                position: relative;
                z-index: 10;
                padding-top: 140px;
                padding-bottom: 80px;
                padding-left: 40px;
                padding-right: 40px;
                box-sizing: border-box;
            }

            /* Header Section */
            .pdf-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #0369a1;
            }
            .pdf-title {
                font-size: 22px;
                font-weight: 800;
                color: #0369a1;
                margin: 0 0 5px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .pdf-subtitle {
                font-size: 11px;
                color: #64748b;
                margin: 0;
            }
            .pdf-badge {
                display: inline-block;
                background: linear-gradient(135deg, #0369a1, #0ea5e9);
                color: white;
                padding: 4px 16px;
                border-radius: 20px;
                font-size: 10px;
                font-weight: 600;
                margin-top: 8px;
                letter-spacing: 0.5px;
            }

            /* Message Section */
            .message-box {
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border: 1px solid #bae6fd;
                border-left: 4px solid #0369a1;
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 20px;
                font-size: 12px;
                color: #0c4a6e;
                line-height: 1.6;
                white-space: pre-line;
            }
            .message-box .greeting-icon {
                font-size: 16px;
                margin-right: 6px;
            }

            /* Question Card */
            .question-card {
                background: rgba(255, 255, 255, 0.85);
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                padding: 14px 16px;
                margin-bottom: 14px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
                page-break-inside: avoid;
            }
            .question-header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }
            .question-number {
                background: linear-gradient(135deg, #0369a1, #0284c7);
                color: white;
                padding: 3px 12px;
                border-radius: 15px;
                font-size: 11px;
                font-weight: 700;
            }
            .question-text {
                font-size: 13px;
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 10px;
                line-height: 1.5;
                padding-left: 2px;
            }

            /* Options Grid */
            .options-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 6px;
                margin-bottom: 10px;
            }
            .option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 10px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
                background: #f8fafc;
                font-size: 11px;
                position: relative;
            }
            .option.correct {
                background: #dcfce7;
                border-color: #86efac;
            }
            .option-label {
                background: #e2e8f0;
                color: #475569;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 10px;
                flex-shrink: 0;
            }
            .option-label.correct-label {
                background: #16a34a;
                color: white;
            }
            .option-text {
                flex: 1;
                color: #334155;
            }
            .check-icon {
                color: #16a34a;
                font-weight: 700;
                font-size: 14px;
            }

            /* Explanation */
            .explanation {
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 10px;
                color: #92400e;
                display: flex;
                align-items: flex-start;
                gap: 6px;
                line-height: 1.5;
            }
            .explanation-icon {
                font-size: 14px;
                flex-shrink: 0;
                margin-top: -1px;
            }
            .explanation-text {
                flex: 1;
            }

            /* Footer */
            .pdf-footer {
                text-align: center;
                margin-top: 15px;
                padding-top: 12px;
                border-top: 1px solid #e2e8f0;
                font-size: 10px;
                color: #94a3b8;
            }
            .pdf-footer .brand {
                color: #0369a1;
                font-weight: 700;
            }
        </style>
    </head>
    <body>
        <div class="letterhead">
            <img src="${backgroundImage}" alt="Letterhead">
        </div>
        <div class="content-wrapper">
            
            <!-- Header -->
            <div class="pdf-header">
                <div class="pdf-title">📝 दैनिक GK प्रश्नोत्तरी</div>
                <div class="pdf-subtitle">UP Police Constable | UP SI | PCS Exam Preparation</div>
                <div class="pdf-badge">SafeHand Lifecare — Daily Knowledge Booster</div>
            </div>

            <!-- Greeting / Message -->
            <div class="message-box">
                <span class="greeting-icon">🙏</span>${message || ''}
            </div>

            <!-- Questions -->
            ${questionsHtml}

            <!-- Footer -->
            <div class="pdf-footer">
                Powered by <span class="brand">SafeHand Lifecare</span> | प्रतिदिन अभ्यास करें, सफलता अवश्य मिलेगी! 🚀
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    generateGKQuestionPdfTemplate
};
