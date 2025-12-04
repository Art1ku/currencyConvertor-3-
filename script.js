const API_URL = "https://open.er-api.com/v6/latest/USD";

const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const resultEl = document.getElementById("result");
const indicativeEl = document.getElementById("indicative");
const swapBtn = document.getElementById("swap");

let rates = {};

function getFlagCode(currency) {
    const map = {
        EUR: "EU",
        USD: "US",
        GBP: "GB",
        AUD: "AU",
        CAD: "CA",
        SGD: "SG",
        JPY: "JP",
        CNY: "CN",
        CHF: "CH",
        NZD: "NZ"
    };
    return map[currency] || currency.slice(0, 2);
}

function createCustomSelect(customId, selectEl) {
    const container = document.getElementById(customId);
    container.innerHTML = `
        <div class="selected">${selectEl.value || "Select"}</div>
        <div class="options"></div>
    `;
    const selected = container.querySelector(".selected");
    const optionsContainer = container.querySelector(".options");

    Object.keys(rates).sort().forEach(cur => {
        const flag = getFlagCode(cur);
        const option = document.createElement("div");
        option.className = "option";
        option.innerHTML = `<img src="https://flagsapi.com/${flag}/flat/64.png" /> <span>${cur}</span>`;
        option.addEventListener("click", () => {
            selected.textContent = cur;
            selectEl.value = cur;
            container.classList.remove("open");   
            updateFlag(selectEl, selectEl.id === "from" ? "flag-from" : "flag-to");
            convert();
            updateIndicativeRate();
        });
        optionsContainer.appendChild(option);
    });

    selected.addEventListener("click", e => {
        e.stopPropagation();
        container.classList.toggle("open");
    });


    document.addEventListener("click", () => {
        container.classList.remove("open");
    });
}

async function loadCurrencies() {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (data.result !== "success") return;

    rates = data.rates;

    const currencies = Object.keys(rates).sort();
    currencies.forEach(cur => {
        const opt1 = document.createElement("option");
        opt1.value = cur;
        opt1.textContent = cur;
        fromSelect.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = cur;
        opt2.textContent = cur;
        toSelect.appendChild(opt2);
    });

    fromSelect.value = "USD";
    toSelect.value = "KGS";

    createCustomSelect("from-custom", fromSelect);
    createCustomSelect("to-custom", toSelect);

    updateFlag(fromSelect, "flag-from");
    updateFlag(toSelect, "flag-to");

    updateIndicativeRate();
}

loadCurrencies();

function updateFlag(select, imgId) {
    const currency = select.value;
    const flag = getFlagCode(currency);
    document.getElementById(imgId).src = `https://flagsapi.com/${flag}/flat/64.png`;
}

function updateIndicativeRate() {
    const from = fromSelect.value;
    const to = toSelect.value;

    if (!rates[from] || !rates[to]) return;

    const rate = (rates[to] / rates[from]).toFixed(4);

    indicativeEl.innerHTML = `
    Indicative Exchange Rate:
    <br>
    <span style="margin-top:20px; display:inline-block; color:#000; font-size: 18px;">
        1 ${from} = ${rate} ${to}
    </span>`;
}

async function convert() {
    const amount = parseFloat(amountInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;

    if (!amount || amount <= 0) {
        resultEl.textContent = "Введите сумму";
        return;
    }
    if (from === to) {
        resultEl.textContent = "Выберите разные валюты";
        return;
    }

    resultEl.textContent = "Считаем...";
    try {
        const usdValue = amount / rates[from];
        const converted = usdValue * rates[to];
        resultEl.textContent = converted.toFixed(2) + " " + to;

        updateIndicativeRate();
    } catch (e) {
        resultEl.textContent = "Ошибка!";
    }
}

amountInput.addEventListener("input", convert);
fromSelect.addEventListener("change", () => {
    convert();
    updateIndicativeRate();
});
toSelect.addEventListener("change", () => {
    convert();
    updateIndicativeRate();
});

swapBtn.addEventListener("click", () => {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;

    updateFlag(fromSelect, "flag-from");
    updateFlag(toSelect, "flag-to");

    document.querySelector("#from-custom .selected").textContent = fromSelect.value;
    document.querySelector("#to-custom .selected").textContent = toSelect.value;

    convert();
    updateIndicativeRate();

    const swapImg = document.querySelector(".swapImg");
    swapImg.classList.toggle("rotate");
});


