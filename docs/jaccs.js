const priceInput = document.getElementById('price');
const depositInput = document.getElementById('deposit');
const installmentSelect = document.getElementById('installment');
const bonusAmountInput = document.getElementById('bonusAmount');
const splitAmountInput = document.getElementById('splitAmount');

const firstPaymentInput = document.getElementById('firstPayment');
const otherPaymentInput = document.getElementById('otherPayment');
const bonusPaymentInput = document.getElementById('bonusPayment');
const bonusWarning = document.getElementById('bonusWarning');
const calculateButton = document.getElementById('calculate');
const clearButton = document.getElementById('clear');
const taxOperationSelect = document.getElementById('taxOperation');

const bonusTimesMap = {24:4, 36:6, 48:8, 60:10};

// --- 数字をカンマ区切り ---
function formatNumber(num){
    return num.toLocaleString();
}

// --- 入力値を数値に変換 ---
function parseNumber(str) {
    return Number(str.replace(/,/g, '')) || 0;
}

// --- 入力時に自動カンマ ---
function addCommaInput(inputElement) {
    inputElement.addEventListener('input', (e) => {
        let value = e.target.value.replace(/,/g, '');
        if (!isNaN(value) && value !== "") {
            e.target.value = Number(value).toLocaleString();
        }
    });
}
addCommaInput(priceInput);
addCommaInput(depositInput);
addCommaInput(bonusAmountInput);

// --- 分割対象金額更新 ---
function updateSplitAmount() {
    const price = parseNumber(priceInput.value);
    const deposit = parseNumber(depositInput.value);
    const bonusAmount = parseNumber(bonusAmountInput.value);

    if (!price) {
        splitAmountInput.value = '';
        return { calcSplitAmount: 0, baseSplitAmount: 0, totalBonus: 0 };
    }

    const baseSplitAmount = Math.max(price - deposit, 0);
    const installmentCountCurrent = Number(installmentSelect.value) || 24;
    const totalBonus = bonusAmount * (bonusTimesMap[installmentCountCurrent] || 0);
    const calcSplitAmount = Math.max(baseSplitAmount - totalBonus, 0);

    splitAmountInput.value = formatNumber(baseSplitAmount);

    let availableOptions = [];
    if (calcSplitAmount < 300000) availableOptions = [24];
    else if (baseSplitAmount >= 300000 && baseSplitAmount < 500000) availableOptions = [24];
    else if (baseSplitAmount >= 500000 && baseSplitAmount < 1000000) availableOptions = [24,36,48];
    else if (baseSplitAmount >= 1000000) availableOptions = [24,36,48,60];
    else availableOptions = [24];

    const currentValue = Number(installmentSelect.value);
    installmentSelect.innerHTML = '';
    availableOptions.forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = `${val}回`;
        installmentSelect.appendChild(option);
    });
    installmentSelect.value = availableOptions.includes(currentValue) ? currentValue : availableOptions[0];

    return { calcSplitAmount, baseSplitAmount, totalBonus };
}

// --- 計算 ---
calculateButton.addEventListener('click', () => {
    const price = parseNumber(priceInput.value);
    if (!price) { alert("本体価格を入力してください"); return; }

    const deposit = parseNumber(depositInput.value);
    const bonusAmount = parseNumber(bonusAmountInput.value);
    const installmentCount = Number(installmentSelect.value) || 1;
    const interestRate = Number(taxOperationSelect.value) || 0;

    const { calcSplitAmount, baseSplitAmount, totalBonus } = updateSplitAmount();

    if (calcSplitAmount < 300000) {
        bonusWarning.textContent = '分割対象金額が30万円未満です。分割回数は24回のみ可能です。';
        firstPaymentInput.value = '';
        otherPaymentInput.value = '';
        bonusPaymentInput.value = '';
        return;
    } else if (totalBonus > baseSplitAmount*0.5) {
        bonusWarning.textContent = 'ボーナス金額が分割対象金額の半分を超えています。';
    } else bonusWarning.textContent = '';

    const totalPaymentCalc = calcSplitAmount * (1 + interestRate * installmentCount / 100);
    const otherPayment = Math.floor(totalPaymentCalc / installmentCount / 100) * 100;
    const firstPayment = totalPaymentCalc - otherPayment * (installmentCount - 1);

    firstPaymentInput.value = formatNumber(Math.floor(firstPayment));
    otherPaymentInput.value = formatNumber(otherPayment);

    if (bonusAmount > 0) {
        bonusPaymentInput.value = formatNumber(otherPayment + bonusAmount);
        bonusPaymentInput.classList.add('result-highlight');
    } else {
        bonusPaymentInput.value = '';
        bonusPaymentInput.classList.remove('result-highlight');
    }

    firstPaymentInput.classList.add('result-highlight');
    otherPaymentInput.classList.add('result-highlight');
});

// --- クリア ---
clearButton.addEventListener('click', () => {
    priceInput.value = '';
    depositInput.value = '';
    bonusAmountInput.value = '';
    splitAmountInput.value = '';
    firstPaymentInput.value = '';
    otherPaymentInput.value = '';
    bonusPaymentInput.value = '';
    taxOperationSelect.value = '0';
    installmentSelect.innerHTML = '<option value="24">24回</option>';
    installmentSelect.value = '24';
    bonusWarning.textContent = '';
    firstPaymentInput.classList.remove('result-highlight');
    otherPaymentInput.classList.remove('result-highlight');
    bonusPaymentInput.classList.remove('result-highlight');
});

priceInput.addEventListener('input', updateSplitAmount);
depositInput.addEventListener('input', updateSplitAmount);
bonusAmountInput.addEventListener('input', updateSplitAmount);
installmentSelect.addEventListener('change', updateSplitAmount);
taxOperationSelect.addEventListener('change', updateSplitAmount);

updateSplitAmount();

