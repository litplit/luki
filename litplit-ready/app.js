// Финальный бесшовный ИИ-конфигуратор LitPlit для Vercel (БЕЗ лимитов и БЕЗ Python)
const GEMINI_API_KEY = "AIzaSyDBKd1aMTHgxNEs2HcRSLm4nZ_P5uXOrCc"; // Вставьте сюда ваш API-ключ Gemini
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

let currentBackgroundBase64 = null;
let selectedHatchUrl = null;

// Настройки масштаба люка по умолчанию
let hatchScale = 0.14;

document.addEventListener("DOMContentLoaded", () => {
    initVisualizer();
});

function initVisualizer() {
    console.log("Конфигуратор LitPlit успешно перенесен на Vercel!");
    
    // ПРИНУДИТЕЛЬНО разблокируем кнопку генерации и убираем любые ошибки
    const genButton = document.getElementById("generateButton");
    const errorMsg = document.getElementById("creditsErrorMessage") || document.querySelector(".error-message");
    
    if (genButton) {
        genButton.disabled = false;
        genButton.textContent = "Сгенерировать с ИИ →";
        // Привязываем клик к нашей новой функции
        genButton.onclick = startAiGeneration;
    }
    
    if (errorMsg) {
        errorMsg.style.display = "none"; // Навсегда прячем плашку "Закончились кредиты"
    }
}

// Эмуляция ИИ-врезки (Фронтенд-отправка напрямую в Google API)
async function startAiGeneration() {
    const statusNotification = document.getElementById("statusNotification") || alert;
    
    if (!currentBackgroundBase64) {
        alert("Пожалуйста, загрузите сначала фоновое фото объекта.");
        return;
    }
    if (!selectedHatchUrl) {
        alert("Выберите модель художественного люка из каталога.");
        return;
    }

    console.log("Отправка запроса в Gemini 2.5 Flash...");
    if (typeof statusNotification === "function") {
        statusNotification("ИИ адаптирует края люка под ландшафт...");
    } else {
        statusNotification.textContent = "ИИ встраивает чугунный люк в текстуру...";
    }

    try {
        const hatchBase64 = await convertUrlToBase64(selectedHatchUrl);
        
        // Формируем четкое ТЗ для нейросети
        const promptText = `
            You are an expert architectural photo editor. Take this background photo and seamlessly embed the provided circular cast iron manhole cover into it.
            The manhole cover must look like a solid metallic object installed flush with the ground.
            Carefully blend the outer edges with the environment. If there is snow, mud, or gravel around, add realistic overlaps, highlights, and ambient occlusion shadows around the rim.
            Maintain the exact design details of the manhole cover. Output ONLY the final edited image.
        `;

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: promptText },
                        { inlineData: { mimeType: "image/jpeg", data: currentBackgroundBase64.split(",")[1] } },
                        { inlineData: { mimeType: "image/png", data: hatchBase64 } }
                    ]
                }]
            })
        });

        const data = await response.json();
        const base64Result = data.candidates[0].content.parts[0].inlineData.data;
        
        // Выводим результат работы ИИ на экран
        document.getElementById("mainVisualizerView").src = `data:image/jpeg;base64,${base64Result}`;
        if (statusNotification.textContent) statusNotification.textContent = "Готово! Люк установлен.";

    } catch (err) {
        console.error("Ошибка ИИ-генерации:", err);
        alert("Произошла ошибка при связи с ИИ. Проверьте правильность API-ключа в коде.");
    }
}

// Вспомогательная функция для конвертации картинок люков
function convertUrlToBase64(url) {
    return fetch(url)
        .then(res => res.blob())
        .then(blob => new Promise((resolve) => {
            let reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.readAsDataURL(blob);
        }));
}

