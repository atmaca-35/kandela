document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('searchBox');
    const resultDiv = document.getElementById('result');
    const ghostText = document.getElementById('ghostText');
    const searchContainer = document.querySelector('.search-box');
    const wordCountElement = document.getElementById('wordCount');
    const errorContainer = document.getElementById('errorContainer'); 

    const errorIcon = document.createElement('img');
    errorIcon.src = 'error.png';
    errorIcon.alt = 'Hata';
    errorIcon.classList.add('error-icon');
    errorIcon.style.display = 'none'; 
    errorContainer.appendChild(errorIcon); 

    let dictionaryData = {};
    let lastQuery = '';
    let hasError = false;

    try {
        const response = await fetch('semantic.json');
        dictionaryData = await response.json();

        const wordCount = Object.keys(dictionaryData).length;
        wordCountElement.innerHTML = `Türk dilinin <span class="highlight">${wordCount}</span> maddelik arkeolojisi.`;
    } catch (error) {
        console.error('Sözlük yüklenirken bir hata oluştu:', error);
        hasError = true;
        errorIcon.style.display = 'block'; 

        // Hide all elements except the error icon
        searchContainer.classList.add('hidden'); 
        wordCountElement.classList.add('hidden'); 
        resultDiv.classList.add('hidden'); 
        ghostText.classList.add('hidden'); 
    }

    // Refresh the page when the error icon is clicked
    errorIcon.addEventListener('click', () => {
        location.reload();
    });

    function searchWord(query) {
        if (query === lastQuery) {
            return;
        }
        lastQuery = query;

        resultDiv.innerHTML = '';

        if (query.length === 0) {
            ghostText.textContent = "";
            if (!hasError) {
                errorIcon.style.display = 'none'; 
                searchContainer.classList.remove('error'); 
            }
            return;
        }

        const normalizedQuery = normalizeTurkish(query);

        const filteredWords = Object.keys(dictionaryData)
            .filter(word => {
                const normalizedWord = normalizeTurkish(word);
                return normalizedWord.startsWith(normalizedQuery);
            })
            .sort();

        if (filteredWords.length === 0) {
            ghostText.textContent = "";
            searchContainer.classList.add('error'); 
            return;
        }

        filteredWords.forEach(word => {
            const wordDetails = dictionaryData[word];
            const description = wordDetails.description.replace(/<br>/g, "");
            resultDiv.innerHTML += `
                <p class="description">${highlightWords(sanitizeHTML(description))}</p>
            `;
        });

        resultDiv.style.animation = 'none';
        resultDiv.offsetHeight;
        resultDiv.style.animation = 'fadeIn 1s ease-in-out';
        searchContainer.classList.remove('error'); 
    }

    function normalizeTurkish(text) {
        return text.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
    }

    function sanitizeHTML(htmlString) {
        return DOMPurify.sanitize(htmlString, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
            ALLOWED_ATTR: ['href', 'class'],
        });
    }

    function highlightWords(text) {
        const specialWords = {
            '01': 'Ön Türkçe',
            '02': 'Moğolca',
            '03': 'Eski Anadolu Türkçesi',
            '04': 'Osmanlı Türkçesi',
            '05': 'Türkiye Türkçesi',
            '06': 'Azerbaycan Türkçesi',
            '07': 'Kırgız Türkçesi',
            '08': 'Başkurt Türkçesi',
            '09': 'Kazak Türkçesi',
            '10': 'Kırgız Türkçesi',
            '11': 'Özbek Türkçesi',
            '12': 'Tatar Türkçesi',
            '13': 'Türkmen Türkçesi',
            '14': 'Uygur Türkçesi',
            '15': 'Çuvaş Türkçesi'
        };

        for (const [key, value] of Object.entries(specialWords)) {
            const regex = new RegExp(`\\b${key}\\b(\\s+\\w+)`, 'gi');
            text = text.replace(regex, `<b>${value}</b> <i>$1</i>`);
        }

        return text;
    }

    function updateSearchBoxPlaceholder(query) {
        const queryLower = normalizeTurkish(query);
        const matchingWord = Object.keys(dictionaryData)
            .find(word => {
                const normalizedWord = normalizeTurkish(word);
                return normalizedWord.startsWith(queryLower);
            });

        if (matchingWord) {
            const remainingPart = matchingWord.substring(query.length);
            ghostText.textContent = remainingPart;

            const inputRect = searchBox.getBoundingClientRect();
            const inputStyle = window.getComputedStyle(searchBox);
            const paddingLeft = parseFloat(inputStyle.paddingLeft);
            const fontSize = parseFloat(inputStyle.fontSize);

            const firstCharWidth = getTextWidth(query, fontSize);
            ghostText.style.left = `${paddingLeft + firstCharWidth}px`;
        } else {
            ghostText.textContent = "";
        }
    }

    function getTextWidth(text, fontSize) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = `${fontSize}px 'Arial', sans-serif`;
        return context.measureText(text).width;
    }

    searchBox.addEventListener('input', () => {
        const query = searchBox.value.trim();
        updateSearchBoxPlaceholder(query);
        searchWord(query);
    });
});
