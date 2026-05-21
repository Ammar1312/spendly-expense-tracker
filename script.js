"use strict";

const STORAGE_KEY = "expense-tracker-transactions-v2";
const THEME_KEY = "expense-tracker-theme";
const BUDGET_KEY = "expense-tracker-budget-goal";
const CATEGORY_BUDGET_KEY = "expense-tracker-category-budgets";
const BACKUP_VERSION = 1;
const DEFAULT_BUDGET_GOAL = 1200;
const TOAST_DURATION_MS = 2600;
const REPORT_PERIODS = ["today", "month", "all", "custom"];
const CHART_MODES = ["flow", "categories", "annual"];
const SORT_OPTIONS = ["newest", "oldest", "highest", "lowest", "category", "type"];
const SAVINGS_GOALS = {
  emergency: 3000,
  travel: 1800,
  education: 2500
};

const CATEGORY_OPTIONS = {
  income: ["Salary", "Freelance", "Investments", "Sales", "Gift", "Other"],
  expense: ["Food", "Housing", "Transport", "Bills", "Health", "Entertainment", "Shopping", "Other"]
};

const DEFAULT_CATEGORY_BUDGETS = {
  Food: 350,
  Housing: 800,
  Transport: 180,
  Bills: 220,
  Health: 120,
  Entertainment: 150,
  Shopping: 250,
  Other: 100
};

const TYPE_LABELS = {
  income: "Income",
  expense: "Expense"
};

const CSV_HEADERS = ["Date", "Type", "Category", "Description", "Amount EUR"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR"
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const elements = {
  themeToggle: document.querySelector("#themeToggle"),
  importCsvButton: document.querySelector("#importCsvButton"),
  csvFileInput: document.querySelector("#csvFileInput"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  restoreBackupButton: document.querySelector("#restoreBackupButton"),
  jsonFileInput: document.querySelector("#jsonFileInput"),
  exportBackupButton: document.querySelector("#exportBackupButton"),
  clearAllButton: document.querySelector("#clearAllButton"),
  navLinks: document.querySelectorAll("[data-nav-link]"),
  reportRangeLabel: document.querySelector("#reportRangeLabel"),
  periodButtons: document.querySelectorAll("[data-report-period]"),
  dateChip: document.querySelector(".date-chip"),
  customDateInput: document.querySelector("#customDateInput"),
  kpiMonthIncome: document.querySelector("#kpiMonthIncome"),
  kpiIncomeMeta: document.querySelector("#kpiIncomeMeta"),
  kpiIncomeBars: document.querySelector("#kpiIncomeBars"),
  kpiMonthExpense: document.querySelector("#kpiMonthExpense"),
  kpiExpenseMeta: document.querySelector("#kpiExpenseMeta"),
  kpiExpenseBars: document.querySelector("#kpiExpenseBars"),
  kpiSavingsRate: document.querySelector("#kpiSavingsRate"),
  kpiSavingsMeta: document.querySelector("#kpiSavingsMeta"),
  kpiSavingsBars: document.querySelector("#kpiSavingsBars"),
  kpiAverageTransaction: document.querySelector("#kpiAverageTransaction"),
  kpiAverageMeta: document.querySelector("#kpiAverageMeta"),
  kpiAverageBars: document.querySelector("#kpiAverageBars"),
  goalEmergencyValue: document.querySelector("#goalEmergencyValue"),
  goalEmergencyProgress: document.querySelector("#goalEmergencyProgress"),
  goalTravelValue: document.querySelector("#goalTravelValue"),
  goalTravelProgress: document.querySelector("#goalTravelProgress"),
  goalEducationValue: document.querySelector("#goalEducationValue"),
  goalEducationProgress: document.querySelector("#goalEducationProgress"),
  quickActionButtons: document.querySelectorAll("[data-quick-action]"),
  averageExpense: document.querySelector("#averageExpense"),
  averageExpenseMeta: document.querySelector("#averageExpenseMeta"),
  highestExpense: document.querySelector("#highestExpense"),
  highestExpenseMeta: document.querySelector("#highestExpenseMeta"),
  reportTransactionCount: document.querySelector("#reportTransactionCount"),
  reportTransactionMeta: document.querySelector("#reportTransactionMeta"),
  balanceAmount: document.querySelector("#balanceAmount"),
  balanceMeta: document.querySelector("#balanceMeta"),
  incomeAmount: document.querySelector("#incomeAmount"),
  incomeMeta: document.querySelector("#incomeMeta"),
  expenseAmount: document.querySelector("#expenseAmount"),
  expenseMeta: document.querySelector("#expenseMeta"),
  form: document.querySelector("#transactionForm"),
  formTitle: document.querySelector("#formTitle"),
  submitButton: document.querySelector("#submitButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  amountInput: document.querySelector("#amountInput"),
  categoryInput: document.querySelector("#categoryInput"),
  descriptionInput: document.querySelector("#descriptionInput"),
  dateInput: document.querySelector("#dateInput"),
  chartTitle: document.querySelector("#chartTitle"),
  chartModeButtons: document.querySelectorAll("[data-chart-mode]"),
  monthInput: document.querySelector("#monthInput"),
  monthIncome: document.querySelector("#monthIncome"),
  monthExpense: document.querySelector("#monthExpense"),
  monthNet: document.querySelector("#monthNet"),
  budgetInput: document.querySelector("#budgetInput"),
  budgetProgress: document.querySelector("#budgetProgress"),
  budgetSpent: document.querySelector("#budgetSpent"),
  budgetRemaining: document.querySelector("#budgetRemaining"),
  budgetStatus: document.querySelector("#budgetStatus"),
  categoryBudgetControls: document.querySelector("#categoryBudgetControls"),
  categoryBreakdownTotal: document.querySelector("#categoryBreakdownTotal"),
  categoryBreakdownList: document.querySelector("#categoryBreakdownList"),
  categoryBreakdownEmpty: document.querySelector("#categoryBreakdownEmpty"),
  topCategory: document.querySelector("#topCategory"),
  chartCanvas: document.querySelector("#financeChart"),
  chartEmpty: document.querySelector("#chartEmpty"),
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  sortInput: document.querySelector("#sortInput"),
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  transactionsList: document.querySelector("#transactionsList"),
  emptyState: document.querySelector("#emptyState"),
  noResultsState: document.querySelector("#noResultsState"),
  seedDemoButton: document.querySelector("#seedDemoButton"),
  confirmModal: document.querySelector("#confirmModal"),
  confirmModalTitle: document.querySelector("#confirmModalTitle"),
  confirmModalMessage: document.querySelector("#confirmModalMessage"),
  confirmCancelButton: document.querySelector("#confirmCancelButton"),
  confirmActionButton: document.querySelector("#confirmActionButton"),
  toast: document.querySelector("#toast")
};

let transactions = loadTransactions();
let editingId = null;
let financeChart = null;
let toastTimeout = null;
let confirmResolver = null;
let chartMode = "flow";
let reportPeriod = "month";
let budgetGoal = loadBudgetGoal();
let categoryBudgets = loadCategoryBudgets();

initializeApp();

function initializeApp() {
  applyStoredTheme();
  elements.dateInput.value = getTodayValue();
  elements.customDateInput.value = getTodayValue();
  elements.monthInput.value = getCurrentMonthValue();
  elements.budgetInput.value = budgetGoal;
  populateCategoryInput();
  renderCategoryBudgetControls();
  syncThemeButton();
  bindEvents();
  setupNavigationObserver();
  renderApp();
}

function bindEvents() {
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.importCsvButton.addEventListener("click", () => triggerFileInput(elements.csvFileInput));
  elements.csvFileInput.addEventListener("change", handleCsvImport);
  elements.exportCsvButton.addEventListener("click", exportTransactionsToCsv);
  elements.restoreBackupButton.addEventListener("click", () => triggerFileInput(elements.jsonFileInput));
  elements.jsonFileInput.addEventListener("change", handleJsonRestore);
  elements.exportBackupButton.addEventListener("click", exportJsonBackup);
  elements.clearAllButton.addEventListener("click", clearAllTransactions);
  elements.confirmCancelButton.addEventListener("click", () => closeConfirmDialog(false));
  elements.confirmActionButton.addEventListener("click", () => closeConfirmDialog(true));
  elements.confirmModal.addEventListener("click", (event) => {
    if (event.target === elements.confirmModal) {
      closeConfirmDialog(false);
    }
  });
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.cancelEditButton.addEventListener("click", resetForm);
  elements.monthInput.addEventListener("change", renderApp);
  elements.customDateInput.addEventListener("change", () => {
    setReportPeriod("custom");
  });
  elements.budgetInput.addEventListener("change", handleBudgetChange);
  elements.categoryBudgetControls.addEventListener("change", handleCategoryBudgetChange);
  elements.searchInput.addEventListener("input", renderTransactionsSection);
  elements.typeFilter.addEventListener("change", renderTransactionsSection);
  elements.categoryFilter.addEventListener("change", renderTransactionsSection);
  elements.sortInput.addEventListener("change", renderTransactionsSection);
  elements.resetFiltersButton.addEventListener("click", resetFilters);
  elements.seedDemoButton.addEventListener("click", seedDemoData);
  elements.transactionsList.addEventListener("click", handleTransactionAction);
  elements.chartModeButtons.forEach((button) => {
    button.addEventListener("click", () => setChartMode(button.dataset.chartMode));
  });
  elements.periodButtons.forEach((button) => {
    button.addEventListener("click", () => setReportPeriod(button.dataset.reportPeriod));
  });
  elements.quickActionButtons.forEach((button) => {
    button.addEventListener("click", () => handleQuickAction(button.dataset.quickAction));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.confirmModal.classList.contains("is-hidden")) {
      closeConfirmDialog(false);
    }
  });

  [
    elements.amountInput,
    elements.categoryInput,
    elements.descriptionInput,
    elements.dateInput
  ].forEach((input) => {
    input.addEventListener("input", () => clearFieldError(input));
    input.addEventListener("change", () => clearFieldError(input));
  });

  document.querySelectorAll('input[name="type"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      populateCategoryInput();
      clearFieldError(elements.categoryInput);
    });
  });
}

function setupNavigationObserver() {
  const navTargets = [...new Set(
    [...elements.navLinks]
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean)
  )];

  elements.navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveNavigationLink(link.getAttribute("href"));
    });
  });

  if (!("IntersectionObserver" in window) || !navTargets.length) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const activeEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (activeEntry) {
      setActiveNavigationLink(`#${activeEntry.target.id}`);
    }
  }, {
    rootMargin: "-30% 0px -58% 0px",
    threshold: [0.12, 0.32, 0.56]
  });

  navTargets.forEach((target) => observer.observe(target));
}

function setActiveNavigationLink(targetHash) {
  elements.navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === targetHash;

    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = readFormData();
  const validation = validateTransaction(formData);

  if (!validation.isValid) {
    showValidationErrors(validation.errors);
    showToast("Please check the highlighted form fields.", "danger");
    return;
  }

  clearValidationErrors();
  const wasEditing = Boolean(editingId);

  if (editingId) {
    updateTransaction(editingId, formData);
  } else {
    createTransaction(formData);
  }

  saveTransactions();
  resetForm();
  renderApp();
  showToast(wasEditing ? "Transaction updated successfully." : "Transaction added.");
}

function readFormData() {
  return {
    type: document.querySelector('input[name="type"]:checked').value,
    amount: Number(elements.amountInput.value),
    category: elements.categoryInput.value.trim(),
    description: elements.descriptionInput.value.trim(),
    date: elements.dateInput.value
  };
}

function validateTransaction(data) {
  const errors = {};

  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    errors.amount = "Enter an amount greater than 0.";
  }

  if (!data.category) {
    errors.category = "Choose a category.";
  }

  if (data.description.length < 2) {
    errors.description = "Description must be at least 2 characters.";
  }

  if (!isValidDateValue(data.date)) {
    errors.date = "Choose a valid date.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function showValidationErrors(errors) {
  clearValidationErrors();

  setFieldError(elements.amountInput, errors.amount);
  setFieldError(elements.categoryInput, errors.category);
  setFieldError(elements.descriptionInput, errors.description);
  setFieldError(elements.dateInput, errors.date);
}

function setFieldError(input, message) {
  if (!message) {
    return;
  }

  const field = input.closest(".field");
  const errorMessage = field.querySelector(".error-message");

  field.classList.add("has-error");
  errorMessage.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearFieldError(input) {
  const field = input.closest(".field");
  const errorMessage = field.querySelector(".error-message");

  field.classList.remove("has-error");
  errorMessage.textContent = "";
  input.setAttribute("aria-invalid", "false");
}

function clearValidationErrors() {
  [
    elements.amountInput,
    elements.categoryInput,
    elements.descriptionInput,
    elements.dateInput
  ].forEach(clearFieldError);
}

function createTransaction(data) {
  transactions.unshift({
    id: createId(),
    ...data,
    createdAt: new Date().toISOString()
  });
}

function updateTransaction(id, data) {
  transactions = transactions.map((transaction) => {
    if (transaction.id !== id) {
      return transaction;
    }

    return {
      ...transaction,
      ...data,
      updatedAt: new Date().toISOString()
    };
  });
}

async function deleteTransaction(id) {
  const transaction = transactions.find((item) => item.id === id);

  if (!transaction) {
    return;
  }

  const confirmed = await showConfirmDialog({
    title: "Delete transaction?",
    message: `This will permanently remove "${transaction.description}" from your saved transactions.`,
    confirmLabel: "Delete",
    danger: true
  });

  if (!confirmed) {
    return;
  }

  transactions = transactions.filter((item) => item.id !== id);

  if (editingId === id) {
    resetForm();
  }

  saveTransactions();
  renderApp();
  showToast("Transaction deleted.", "danger");
}

async function clearAllTransactions() {
  if (!transactions.length) {
    return;
  }

  const confirmed = await showConfirmDialog({
    title: "Clear all transactions?",
    message: "This will remove every saved transaction from LocalStorage. This action cannot be undone.",
    confirmLabel: "Clear all",
    danger: true
  });

  if (!confirmed) {
    return;
  }

  transactions = [];
  resetForm();
  resetFilters(false);
  saveTransactions();
  renderApp();
  showToast("All transactions have been deleted.", "danger");
}

function showConfirmDialog({ title, message, confirmLabel = "Confirm", danger = false }) {
  elements.confirmModalTitle.textContent = title;
  elements.confirmModalMessage.textContent = message;
  elements.confirmActionButton.textContent = confirmLabel;
  elements.confirmActionButton.classList.toggle("is-danger", danger);
  elements.confirmModal.classList.remove("is-hidden");
  elements.confirmActionButton.focus();

  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}

function closeConfirmDialog(result) {
  if (elements.confirmModal.classList.contains("is-hidden")) {
    return;
  }

  elements.confirmModal.classList.add("is-hidden");

  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
}

function handleTransactionAction(event) {
  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const row = button.closest("[data-id]");
  const id = row.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    startEditing(id);
  }

  if (action === "delete") {
    deleteTransaction(id);
  }
}

function handleQuickAction(action) {
  if (action === "export") {
    exportTransactionsToCsv();
    return;
  }

  if (action === "import") {
    triggerFileInput(elements.csvFileInput);
    return;
  }

  if (action === "backup") {
    exportJsonBackup();
    return;
  }

  if (action === "restore") {
    triggerFileInput(elements.jsonFileInput);
    return;
  }

  if (!["income", "expense"].includes(action)) {
    return;
  }

  resetForm();
  prepareTransactionType(action);
  elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.amountInput.focus();
  showToast(action === "income" ? "The form is ready for income." : "The form is ready for an expense.");
}

function triggerFileInput(input) {
  input.value = "";
  input.click();
}

function prepareTransactionType(type) {
  const typeInput = document.querySelector(`input[name="type"][value="${type}"]`);

  if (!typeInput) {
    return;
  }

  typeInput.checked = true;
  populateCategoryInput();
  clearValidationErrors();
}

function startEditing(id) {
  const transaction = transactions.find((item) => item.id === id);

  if (!transaction) {
    return;
  }

  editingId = id;
  document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
  populateCategoryInput(transaction.category);

  elements.amountInput.value = transaction.amount;
  elements.descriptionInput.value = transaction.description;
  elements.dateInput.value = transaction.date;
  elements.formTitle.textContent = "Edit transaction";
  elements.submitButton.textContent = "Save changes";
  elements.cancelEditButton.classList.remove("is-hidden");
  clearValidationErrors();
  elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.amountInput.focus();
}

function resetForm() {
  editingId = null;
  elements.form.reset();
  elements.dateInput.value = getTodayValue();
  populateCategoryInput();
  elements.formTitle.textContent = "Add transaction";
  elements.submitButton.textContent = "Add transaction";
  elements.cancelEditButton.classList.add("is-hidden");
  clearValidationErrors();
}

function renderApp() {
  renderSummary();
  renderMonthlyOverview();
  renderReportInsights();
  renderTransactionsSection();
}

function renderSummary() {
  const incomeTotal = sumByType("income", transactions);
  const expenseTotal = sumByType("expense", transactions);
  const balance = incomeTotal - expenseTotal;
  const incomeCount = countByType("income", transactions);
  const expenseCount = countByType("expense", transactions);

  elements.balanceAmount.textContent = formatMoney(balance);
  elements.incomeAmount.textContent = formatMoney(incomeTotal);
  elements.expenseAmount.textContent = formatMoney(expenseTotal);
  elements.balanceMeta.textContent = transactions.length
    ? `${transactions.length} total transactions`
    : "No transactions yet";
  elements.incomeMeta.textContent = formatTransactionCount(incomeCount);
  elements.expenseMeta.textContent = formatTransactionCount(expenseCount);
  elements.clearAllButton.classList.toggle("is-hidden", transactions.length === 0);
  elements.exportCsvButton.classList.toggle("is-hidden", transactions.length === 0);
  renderSavingsGoals(balance);
}

function renderSavingsGoals(balance) {
  const savingsPool = Math.max(balance, 0);

  updateGoalProgress(
    elements.goalEmergencyValue,
    elements.goalEmergencyProgress,
    savingsPool,
    SAVINGS_GOALS.emergency
  );
  updateGoalProgress(
    elements.goalTravelValue,
    elements.goalTravelProgress,
    savingsPool,
    SAVINGS_GOALS.travel
  );
  updateGoalProgress(
    elements.goalEducationValue,
    elements.goalEducationProgress,
    savingsPool,
    SAVINGS_GOALS.education
  );
}

function updateGoalProgress(valueElement, progressElement, currentAmount, targetAmount) {
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);

  valueElement.textContent = `${formatPercent(progress)}%`;
  progressElement.style.width = `${progress}%`;
}

function renderMonthlyOverview() {
  const selectedMonth = elements.monthInput.value || getCurrentMonthValue();
  const monthlyTransactions = transactions.filter((transaction) => transaction.date.startsWith(selectedMonth));
  const monthlyIncome = sumByType("income", monthlyTransactions);
  const monthlyExpense = sumByType("expense", monthlyTransactions);
  const monthlyNet = monthlyIncome - monthlyExpense;

  elements.monthIncome.textContent = formatMoney(monthlyIncome);
  elements.monthExpense.textContent = formatMoney(monthlyExpense);
  elements.monthNet.textContent = formatMoney(monthlyNet);
  elements.monthNet.className = monthlyNet >= 0 ? "income-text" : "expense-text";
  elements.topCategory.textContent = getTopExpenseCategory(monthlyTransactions);
  renderMonthlyKpis(monthlyTransactions, monthlyIncome, monthlyExpense, monthlyNet);
  renderBudgetGoal(monthlyExpense);
  renderExpenseCategoryBreakdown(monthlyTransactions, monthlyExpense);
  updateChart(selectedMonth, monthlyTransactions);
}

function renderMonthlyKpis(monthlyTransactions, monthlyIncome, monthlyExpense, monthlyNet) {
  const incomeTransactions = monthlyTransactions.filter((transaction) => transaction.type === "income");
  const expenseTransactions = monthlyTransactions.filter((transaction) => transaction.type === "expense");
  const averageTransaction = monthlyTransactions.length
    ? monthlyTransactions.reduce((total, transaction) => total + transaction.amount, 0) / monthlyTransactions.length
    : 0;
  const savingsRate = monthlyIncome ? (monthlyNet / monthlyIncome) * 100 : 0;

  elements.kpiMonthIncome.textContent = formatMoney(monthlyIncome);
  elements.kpiIncomeMeta.textContent = formatTransactionCount(incomeTransactions.length);
  elements.kpiMonthExpense.textContent = formatMoney(monthlyExpense);
  elements.kpiExpenseMeta.textContent = formatTransactionCount(expenseTransactions.length);
  elements.kpiSavingsRate.textContent = `${formatPercent(savingsRate)}%`;
  elements.kpiSavingsRate.className = savingsRate >= 0 ? "income-text" : "expense-text";
  elements.kpiSavingsMeta.textContent = monthlyIncome ? "Net income ratio" : "No income this month";
  elements.kpiAverageTransaction.textContent = formatMoney(averageTransaction);
  elements.kpiAverageMeta.textContent = monthlyTransactions.length
    ? `${monthlyTransactions.length} monthly entries`
    : "No transaction data";

  renderMiniBars(elements.kpiIncomeBars, getRecentAmounts(incomeTransactions));
  renderMiniBars(elements.kpiExpenseBars, getRecentAmounts(expenseTransactions));
  renderMiniBars(elements.kpiSavingsBars, buildSavingsBars(monthlyIncome, monthlyExpense, monthlyNet));
  renderMiniBars(elements.kpiAverageBars, getRecentAmounts(monthlyTransactions));
}

function renderReportInsights() {
  const reportTransactions = getReportTransactions();
  const reportExpenses = reportTransactions.filter((transaction) => transaction.type === "expense");
  const totalExpense = sumByType("expense", reportTransactions);
  const averageExpense = reportExpenses.length ? totalExpense / reportExpenses.length : 0;
  const highestExpense = [...reportExpenses].sort((first, second) => second.amount - first.amount)[0];

  syncReportPeriodButtons();
  elements.reportRangeLabel.textContent = getReportRangeLabel();
  elements.averageExpense.textContent = formatMoney(averageExpense);
  elements.averageExpenseMeta.textContent = reportExpenses.length
    ? `${reportExpenses.length} expense entries`
    : "No expense data";
  elements.highestExpense.textContent = highestExpense ? formatMoney(highestExpense.amount) : formatMoney(0);
  elements.highestExpenseMeta.textContent = highestExpense
    ? `${highestExpense.category} - ${highestExpense.description}`
    : "No expense data";
  elements.reportTransactionCount.textContent = String(reportTransactions.length);
  elements.reportTransactionMeta.textContent = reportTransactions.length === 1
    ? "1 transaction in period"
    : "Transactions in period";
}

function renderBudgetGoal(monthlyExpense) {
  const safeBudget = Math.max(Number(budgetGoal) || DEFAULT_BUDGET_GOAL, 1);
  const progress = Math.min((monthlyExpense / safeBudget) * 100, 100);
  const remaining = safeBudget - monthlyExpense;

  elements.budgetProgress.style.width = `${progress}%`;
  elements.budgetSpent.textContent = `Spent ${formatMoney(monthlyExpense)}`;
  elements.budgetRemaining.textContent = remaining >= 0
    ? `Left ${formatMoney(remaining)}`
    : `Over ${formatMoney(Math.abs(remaining))}`;
  elements.budgetStatus.textContent = remaining >= 0 ? "On track" : "Over budget";
  elements.budgetStatus.className = remaining >= 0 ? "income-text" : "expense-text";
}

function renderCategoryBudgetControls() {
  elements.categoryBudgetControls.innerHTML = "";

  CATEGORY_OPTIONS.expense.forEach((category) => {
    const label = document.createElement("label");
    const name = document.createElement("span");
    const input = document.createElement("input");
    const currentLimit = getCategoryBudget(category);

    label.className = "category-budget-field";
    name.textContent = category;
    input.type = "number";
    input.min = "0";
    input.step = "10";
    input.placeholder = "No limit";
    input.value = currentLimit || "";
    input.dataset.categoryBudget = category;
    input.setAttribute("aria-label", `${category} monthly budget limit`);

    label.append(name, input);
    elements.categoryBudgetControls.appendChild(label);
  });
}

function renderExpenseCategoryBreakdown(monthlyTransactions, monthlyExpense) {
  const categoryData = buildExpenseCategoryBreakdown(monthlyTransactions);

  elements.categoryBreakdownTotal.textContent = formatMoney(monthlyExpense);
  elements.categoryBreakdownList.innerHTML = "";
  elements.categoryBreakdownEmpty.classList.toggle("is-hidden", categoryData.length > 0);

  categoryData.forEach((item, index) => {
    elements.categoryBreakdownList.appendChild(createCategoryBreakdownRow(item, monthlyExpense, index));
  });
}

function createCategoryBreakdownRow(item, monthlyExpense, index) {
  const percentage = monthlyExpense ? (item.amount / monthlyExpense) * 100 : 0;
  const budgetLimit = getCategoryBudget(item.category);
  const budgetPercentage = budgetLimit ? (item.amount / budgetLimit) * 100 : 0;
  const trackPercentage = budgetLimit ? budgetPercentage : percentage;
  const row = document.createElement("article");
  const meta = document.createElement("div");
  const name = document.createElement("span");
  const amount = document.createElement("span");
  const percent = document.createElement("span");
  const track = document.createElement("div");
  const progress = document.createElement("span");

  row.className = "category-row";
  row.classList.toggle("is-over-budget", Boolean(budgetLimit && item.amount > budgetLimit));
  row.style.setProperty("--category-color", getCategoryColor(item.category, index));

  meta.className = "category-row__meta";
  name.className = "category-row__name";
  amount.className = "category-row__amount";
  percent.className = "category-row__percent";
  track.className = "category-row__track";

  name.textContent = item.category;
  amount.textContent = formatMoney(item.amount);
  percent.textContent = budgetLimit
    ? `${formatPercent(budgetPercentage)}% of limit`
    : `${formatPercent(percentage)}%`;
  progress.style.width = `${Math.min(trackPercentage, 100)}%`;

  track.appendChild(progress);
  meta.append(name, amount, percent);
  row.append(meta, track);

  return row;
}

function handleBudgetChange() {
  const nextBudget = Number(elements.budgetInput.value);

  if (!Number.isFinite(nextBudget) || nextBudget <= 0) {
    elements.budgetInput.value = budgetGoal;
    showToast("Budget goal must be greater than 0.", "danger");
    return;
  }

  budgetGoal = nextBudget;
  saveBudgetGoal();
  renderMonthlyOverview();
  showToast("Budget goal saved.");
}

function handleCategoryBudgetChange(event) {
  const input = event.target.closest("[data-category-budget]");

  if (!input) {
    return;
  }

  const category = input.dataset.categoryBudget;
  const nextLimit = input.value === "" ? 0 : Number(input.value);

  if (!Number.isFinite(nextLimit) || nextLimit < 0) {
    input.value = getCategoryBudget(category) || "";
    showToast("Category limit cannot be negative.", "danger");
    return;
  }

  categoryBudgets = {
    ...categoryBudgets,
    [category]: nextLimit
  };
  saveCategoryBudgets();
  renderMonthlyOverview();
  showToast(nextLimit ? `${category} limit saved.` : `${category} limit removed.`);
}

function setReportPeriod(nextPeriod) {
  if (!REPORT_PERIODS.includes(nextPeriod)) {
    return;
  }

  reportPeriod = nextPeriod;
  renderReportInsights();
  renderTransactionsSection();
}

function syncReportPeriodButtons() {
  elements.periodButtons.forEach((button) => {
    const isActive = button.dataset.reportPeriod === reportPeriod;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  elements.dateChip.classList.toggle("is-active", reportPeriod === "custom");
}

function getReportTransactions() {
  const today = getTodayValue();
  const currentMonth = getCurrentMonthValue();
  const customDate = elements.customDateInput.value || today;

  return transactions.filter((transaction) => {
    if (reportPeriod === "today") {
      return transaction.date === today;
    }

    if (reportPeriod === "month") {
      return transaction.date.startsWith(currentMonth);
    }

    if (reportPeriod === "custom") {
      return transaction.date === customDate;
    }

    return true;
  });
}

function getReportRangeLabel() {
  if (reportPeriod === "today") {
    return `Today - ${formatDate(getTodayValue())}`;
  }

  if (reportPeriod === "custom") {
    return `Selected date - ${formatDate(elements.customDateInput.value || getTodayValue())}`;
  }

  if (reportPeriod === "all") {
    return "All saved transactions";
  }

  return `This month - ${elements.monthInput.value || getCurrentMonthValue()}`;
}

function renderMiniBars(container, values) {
  const normalizedValues = values.length ? values : [18, 30, 22, 38, 28, 44, 34, 48];
  const maxValue = Math.max(...normalizedValues, 1);

  container.innerHTML = "";

  normalizedValues.slice(-8).forEach((value) => {
    const bar = document.createElement("span");
    const height = Math.max((value / maxValue) * 100, 16);

    bar.style.height = `${height}%`;
    container.appendChild(bar);
  });
}

function getRecentAmounts(collection) {
  return [...collection]
    .sort((first, second) => new Date(first.date) - new Date(second.date))
    .map((transaction) => transaction.amount);
}

function buildSavingsBars(monthlyIncome, monthlyExpense, monthlyNet) {
  if (!monthlyIncome && !monthlyExpense) {
    return [];
  }

  const safeIncome = Math.max(monthlyIncome, 1);
  const expenseLoad = Math.min((monthlyExpense / safeIncome) * 100, 100);
  const savingsLoad = Math.max((monthlyNet / safeIncome) * 100, 0);

  return [
    safeIncome * 0.18,
    monthlyExpense * 0.35,
    savingsLoad,
    monthlyExpense * 0.55,
    safeIncome * 0.72,
    expenseLoad,
    Math.max(monthlyNet, 0),
    safeIncome
  ];
}

function updateChart(selectedMonth, monthlyTransactions) {
  if (!window.Chart) {
    elements.chartEmpty.textContent = "Chart.js could not be loaded.";
    elements.chartEmpty.classList.remove("is-hidden");
    return;
  }

  syncChartModeButtons();

  if (chartMode === "categories") {
    renderCategoryChart(monthlyTransactions);
    return;
  }

  if (chartMode === "annual") {
    renderAnnualChart(selectedMonth);
    return;
  }

  renderFlowChart(selectedMonth, monthlyTransactions);
}

function setChartMode(nextMode) {
  if (!CHART_MODES.includes(nextMode) || chartMode === nextMode) {
    return;
  }

  chartMode = nextMode;
  renderMonthlyOverview();
}

function syncChartModeButtons() {
  elements.chartModeButtons.forEach((button) => {
    const isActive = button.dataset.chartMode === chartMode;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderFlowChart(selectedMonth, monthlyTransactions) {
  const { labels, income, expense } = buildMonthlyChartData(selectedMonth, monthlyTransactions);
  const colors = getChartColors();
  const hasData = monthlyTransactions.length > 0;

  elements.chartTitle.textContent = "Income and expenses";
  elements.chartEmpty.textContent = "No data for the selected month.";
  elements.chartEmpty.classList.toggle("is-hidden", hasData);

  if (!hasData) {
    clearChart();
    return;
  }

  replaceChart({
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Income",
          data: income,
          backgroundColor: colors.income,
          borderRadius: 8,
          maxBarThickness: 18
        },
        {
          label: "Expenses",
          data: expense,
          backgroundColor: colors.expense,
          borderRadius: 8,
          maxBarThickness: 18
        }
      ]
    },
    options: getBarChartOptions(colors)
  });
}

function renderCategoryChart(monthlyTransactions) {
  const colors = getChartColors();
  const { labels, values } = buildExpenseCategoryChartData(monthlyTransactions);
  const hasData = values.length > 0;

  elements.chartTitle.textContent = "Expenses by category";
  elements.chartEmpty.textContent = "No expenses for the selected month.";
  elements.chartEmpty.classList.toggle("is-hidden", hasData);

  if (!hasData) {
    clearChart();
    return;
  }

  replaceChart({
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Expenses",
          data: values,
          backgroundColor: getCategoryPalette(labels.length),
          borderColor: colors.surface,
          borderWidth: 3,
          hoverOffset: 8
        }
      ]
    },
    options: getDoughnutChartOptions(colors)
  });
}

function renderAnnualChart(selectedMonth) {
  const selectedYear = Number((selectedMonth || getCurrentMonthValue()).slice(0, 4));
  const yearlyTransactions = transactions.filter((transaction) => {
    return Number(transaction.date.slice(0, 4)) === selectedYear;
  });
  const { income, expense } = buildAnnualChartData(yearlyTransactions);
  const colors = getChartColors();
  const hasData = yearlyTransactions.length > 0;

  elements.chartTitle.textContent = `${selectedYear} annual overview`;
  elements.chartEmpty.textContent = `No data for ${selectedYear}.`;
  elements.chartEmpty.classList.toggle("is-hidden", hasData);

  if (!hasData) {
    clearChart();
    return;
  }

  replaceChart({
    type: "bar",
    data: {
      labels: MONTH_LABELS,
      datasets: [
        {
          label: "Income",
          data: income,
          backgroundColor: colors.income,
          borderRadius: 8,
          maxBarThickness: 24
        },
        {
          label: "Expenses",
          data: expense,
          backgroundColor: colors.expense,
          borderRadius: 8,
          maxBarThickness: 24
        }
      ]
    },
    options: getBarChartOptions(colors)
  });
}

function replaceChart(config) {
  clearChart();
  financeChart = new Chart(elements.chartCanvas, config);
}

function clearChart() {
  if (!financeChart) {
    return;
  }

  financeChart.destroy();
  financeChart = null;
}

function buildMonthlyChartData(selectedMonth, monthlyTransactions) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const labels = Array.from({ length: daysInMonth }, (_, index) => String(index + 1));
  const income = Array(daysInMonth).fill(0);
  const expense = Array(daysInMonth).fill(0);

  monthlyTransactions.forEach((transaction) => {
    const dayIndex = Number(transaction.date.slice(-2)) - 1;

    if (transaction.type === "income") {
      income[dayIndex] += transaction.amount;
    } else {
      expense[dayIndex] += transaction.amount;
    }
  });

  return { labels, income, expense };
}

function buildExpenseCategoryChartData(monthlyTransactions) {
  const entries = buildExpenseCategoryBreakdown(monthlyTransactions)
    .map((item) => [item.category, item.amount]);

  return {
    labels: entries.map(([category]) => category),
    values: entries.map(([, amount]) => amount)
  };
}

function buildAnnualChartData(yearlyTransactions) {
  const income = Array(12).fill(0);
  const expense = Array(12).fill(0);

  yearlyTransactions.forEach((transaction) => {
    const monthIndex = Number(transaction.date.slice(5, 7)) - 1;

    if (transaction.type === "income") {
      income[monthIndex] += transaction.amount;
    } else {
      expense[monthIndex] += transaction.amount;
    }
  });

  return { income, expense };
}

function buildExpenseCategoryBreakdown(monthlyTransactions) {
  const totalsByCategory = monthlyTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
      return totals;
    }, {});

  return Object.entries(totalsByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((first, second) => second.amount - first.amount);
}

function getBarChartOptions(colors) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index"
    },
    plugins: {
      legend: {
        labels: {
          color: colors.text,
          boxWidth: 12,
          boxHeight: 12,
          useBorderRadius: true
        }
      },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${formatMoney(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: colors.muted,
          maxRotation: 0,
          autoSkip: true
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: colors.grid
        },
        ticks: {
          color: colors.muted,
          callback(value) {
            return formatCompactMoney(value);
          }
        }
      }
    }
  };
}

function getDoughnutChartOptions(colors) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: colors.text,
          boxWidth: 12,
          boxHeight: 12,
          useBorderRadius: true
        }
      },
      tooltip: {
        callbacks: {
          label(context) {
            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            const percentage = total ? Math.round((context.raw / total) * 100) : 0;
            return `${context.label}: ${formatMoney(context.raw)} (${percentage}%)`;
          }
        }
      }
    }
  };
}

function getChartColors() {
  const styles = getComputedStyle(document.documentElement);

  return {
    income: styles.getPropertyValue("--income").trim(),
    expense: styles.getPropertyValue("--expense").trim(),
    surface: styles.getPropertyValue("--panel").trim() || "#191a26",
    text: styles.getPropertyValue("--text").trim(),
    muted: styles.getPropertyValue("--muted").trim(),
    grid: styles.getPropertyValue("--border").trim()
  };
}

function getCategoryPalette(count) {
  const palette = [
    "#2563eb",
    "#12805c",
    "#c2414b",
    "#b45309",
    "#7c3aed",
    "#0891b2",
    "#db2777",
    "#64748b"
  ];

  return Array.from({ length: count }, (_, index) => palette[index % palette.length]);
}

function getCategoryColor(category, index = 0) {
  const categoryColors = {
    Food: "#a3ff37",
    Housing: "#5db7ff",
    Transport: "#ff875f",
    Bills: "#ffc15f",
    Health: "#62e9a8",
    Entertainment: "#ff58df",
    Shopping: "#8b5cf6",
    Other: "#94a3b8"
  };

  return categoryColors[category] || getCategoryPalette(index + 1)[index];
}

function getCategoryBudget(category) {
  const budget = Number(categoryBudgets[category]);

  return Number.isFinite(budget) && budget > 0 ? budget : 0;
}

function renderTransactionsSection() {
  populateCategoryFilter();

  const filteredTransactions = getFilteredTransactions();
  const hasTransactions = transactions.length > 0;
  const hasFilteredResults = filteredTransactions.length > 0;
  const hasActiveFilters = elements.searchInput.value.trim()
    || elements.typeFilter.value !== "all"
    || elements.categoryFilter.value !== "all"
    || elements.sortInput.value !== "newest"
    || reportPeriod !== "month";

  elements.transactionsList.innerHTML = "";
  filteredTransactions.forEach((transaction) => {
    elements.transactionsList.appendChild(createTransactionRow(transaction));
  });

  elements.emptyState.classList.toggle("is-hidden", hasTransactions);
  elements.noResultsState.classList.toggle("is-hidden", !hasTransactions || hasFilteredResults);
  elements.resetFiltersButton.disabled = !hasActiveFilters;
}

function resetFilters(showFeedback = true) {
  elements.searchInput.value = "";
  elements.typeFilter.value = "all";
  elements.categoryFilter.value = "all";
  elements.sortInput.value = "newest";
  reportPeriod = "month";
  elements.customDateInput.value = getTodayValue();
  renderReportInsights();
  renderTransactionsSection();

  if (showFeedback) {
    showToast("Filters reset.");
  }
}

function seedDemoData() {
  transactions = buildDemoTransactions();
  saveTransactions();
  resetFilters(false);
  renderApp();
  showToast("Demo data loaded.");
}

function exportTransactionsToCsv() {
  if (!transactions.length) {
    showToast("There are no transactions to export.", "danger");
    return;
  }

  const csvContent = buildCsvContent(transactions);
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;"
  });

  downloadBlob(blob, `expense-tracker-${getTodayValue()}.csv`);
  showToast("CSV export is ready.");
}

function exportJsonBackup() {
  const blob = new Blob([JSON.stringify(createBackupData(), null, 2)], {
    type: "application/json;charset=utf-8;"
  });

  downloadBlob(blob, `spendly-backup-${getTodayValue()}.json`);
  showToast("JSON backup is ready.");
}

function createBackupData() {
  return {
    app: "Spendly Expense Tracker",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    budgetGoal,
    categoryBudgets,
    transactions
  };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function handleCsvImport(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  await importTransactionsFromCsv(file);
  event.target.value = "";
}

async function handleJsonRestore(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  await restoreJsonBackup(file);
  event.target.value = "";
}

async function restoreJsonBackup(file) {
  let content = "";

  try {
    content = await readFileAsText(file);
  } catch (error) {
    showToast("JSON backup could not be read.", "danger");
    return;
  }

  const result = parseJsonBackup(content);

  if (result.error) {
    showToast(result.error, "danger");
    return;
  }

  const confirmed = await showConfirmDialog({
    title: "Restore backup?",
    message: `This will replace your current data with ${formatTransactionCount(result.transactions.length)} and saved budget settings.`,
    confirmLabel: "Restore"
  });

  if (!confirmed) {
    return;
  }

  transactions = result.transactions;
  budgetGoal = result.budgetGoal;
  categoryBudgets = result.categoryBudgets;

  elements.budgetInput.value = budgetGoal;
  saveTransactions();
  saveBudgetGoal();
  saveCategoryBudgets();
  resetForm();
  resetFilters(false);
  renderCategoryBudgetControls();
  renderApp();
  showToast("JSON backup restored.");
}

async function importTransactionsFromCsv(file) {
  let content = "";

  try {
    content = await readFileAsText(file);
  } catch (error) {
    showToast("CSV file could not be read.", "danger");
    return;
  }

  const result = parseTransactionsFromCsv(content);

  if (result.error) {
    showToast(result.error, "danger");
    return;
  }

  if (!result.transactions.length) {
    showToast("No valid transactions were found in this CSV file.", "danger");
    return;
  }

  if (transactions.length) {
    const confirmed = await showConfirmDialog({
      title: "Import transactions?",
      message: `This will add ${formatTransactionCount(result.transactions.length)} to your current list.`,
      confirmLabel: "Import"
    });

    if (!confirmed) {
      return;
    }
  }

  transactions = [...result.transactions, ...transactions];
  saveTransactions();
  resetFilters(false);
  renderApp();
  showToast(buildImportToastMessage(result.transactions.length, result.skipped));
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(String(reader.result || ""));
    });

    reader.addEventListener("error", () => {
      reject(new Error("File could not be read."));
    });

    reader.readAsText(file);
  });
}

function buildCsvContent(collection) {
  const rows = [...collection]
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .map((transaction) => [
      transaction.date,
      TYPE_LABELS[transaction.type],
      transaction.category,
      transaction.description,
      transaction.amount.toFixed(2)
    ]);

  return [CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}

function parseJsonBackup(content) {
  let parsedBackup;

  try {
    parsedBackup = JSON.parse(content);
  } catch (error) {
    return {
      error: "Backup file is not valid JSON."
    };
  }

  const sourceTransactions = Array.isArray(parsedBackup)
    ? parsedBackup
    : parsedBackup.transactions;

  if (!Array.isArray(sourceTransactions)) {
    return {
      error: "Backup file does not include a transactions array."
    };
  }

  const restoredTransactions = sourceTransactions
    .map(normalizeTransaction)
    .filter(Boolean);
  const restoredBudgetGoal = Number(parsedBackup.budgetGoal);

  return {
    transactions: restoredTransactions,
    budgetGoal: Number.isFinite(restoredBudgetGoal) && restoredBudgetGoal > 0
      ? restoredBudgetGoal
      : DEFAULT_BUDGET_GOAL,
    categoryBudgets: normalizeCategoryBudgets(parsedBackup.categoryBudgets),
    error: ""
  };
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  const escaped = text.replace(/"/g, '""');

  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function parseTransactionsFromCsv(content) {
  const rows = parseCsvRows(content.replace(/^\uFEFF/, ""))
    .filter((row) => row.some((cell) => cell.trim()));

  if (rows.length < 2) {
    return {
      transactions: [],
      skipped: 0,
      error: "CSV file needs a header row and at least one transaction."
    };
  }

  const headers = rows[0].map(normalizeCsvHeader);
  const indexes = {
    date: findCsvColumn(headers, ["date"]),
    type: findCsvColumn(headers, ["type"]),
    category: findCsvColumn(headers, ["category"]),
    description: findCsvColumn(headers, ["description", "details", "note"]),
    amount: findCsvColumn(headers, ["amount eur", "amount", "value", "total"])
  };
  const missingColumn = Object.entries(indexes).find(([, index]) => index === -1);

  if (missingColumn) {
    return {
      transactions: [],
      skipped: 0,
      error: `Missing CSV column: ${missingColumn[0]}.`
    };
  }

  let skipped = 0;
  const importedTransactions = rows.slice(1).reduce((items, row) => {
    const transaction = normalizeImportedTransaction(row, indexes);

    if (!transaction) {
      skipped += 1;
      return items;
    }

    items.push(transaction);
    return items;
  }, []);

  return {
    transactions: importedTransactions,
    skipped,
    error: ""
  };
}

function parseCsvRows(content) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(value.trim());
      value = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(value.trim());
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += character;
  }

  row.push(value.trim());
  rows.push(row);

  return rows;
}

function normalizeCsvHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function findCsvColumn(headers, aliases) {
  return headers.findIndex((header) => aliases.includes(header));
}

function normalizeImportedTransaction(row, indexes) {
  const type = parseCsvType(row[indexes.type]);
  const amount = parseCsvAmount(row[indexes.amount]);
  const date = String(row[indexes.date] || "").trim().slice(0, 10);
  const category = String(row[indexes.category] || "Other").trim() || "Other";
  const description = String(row[indexes.description] || "Imported transaction").trim() || "Imported transaction";

  if (!type || !Number.isFinite(amount) || amount <= 0 || !isValidDateValue(date)) {
    return null;
  }

  return {
    id: createId(),
    type,
    amount,
    category,
    description: description.slice(0, 80),
    date,
    createdAt: new Date().toISOString(),
    updatedAt: null
  };
}

function parseCsvType(value) {
  const type = String(value || "").trim().toLowerCase();

  if (["income", "incomes", "credit", "+"].includes(type)) {
    return "income";
  }

  if (["expense", "expenses", "debit", "cost", "-"].includes(type)) {
    return "expense";
  }

  return "";
}

function parseCsvAmount(value) {
  const cleanedValue = String(value || "").replace(/[^0-9,.-]/g, "");

  if (!cleanedValue) {
    return Number.NaN;
  }

  const commaIndex = cleanedValue.lastIndexOf(",");
  const dotIndex = cleanedValue.lastIndexOf(".");
  let normalizedValue = cleanedValue;

  if (commaIndex > -1 && dotIndex > -1) {
    normalizedValue = commaIndex > dotIndex
      ? cleanedValue.replace(/\./g, "").replace(",", ".")
      : cleanedValue.replace(/,/g, "");
  } else if (commaIndex > -1) {
    normalizedValue = cleanedValue.replace(",", ".");
  }

  return Number(normalizedValue);
}

function buildImportToastMessage(importedCount, skippedCount) {
  const importedMessage = `${formatTransactionCount(importedCount)} imported.`;

  if (!skippedCount) {
    return importedMessage;
  }

  return `${importedMessage} ${skippedCount} invalid rows skipped.`;
}

function getFilteredTransactions() {
  const searchTerm = elements.searchInput.value.trim().toLowerCase();
  const type = elements.typeFilter.value;
  const category = elements.categoryFilter.value;

  const filteredTransactions = getReportTransactions()
    .filter((transaction) => type === "all" || transaction.type === type)
    .filter((transaction) => category === "all" || transaction.category === category)
    .filter((transaction) => {
      if (!searchTerm) {
        return true;
      }

      const searchableValue = [
        transaction.description,
        transaction.category,
        TYPE_LABELS[transaction.type],
        transaction.amount,
        formatDate(transaction.date)
      ].join(" ").toLowerCase();

      return searchableValue.includes(searchTerm);
    });

  return sortTransactions(filteredTransactions);
}

function sortTransactions(collection) {
  const sortMode = elements.sortInput.value;
  const activeSortMode = SORT_OPTIONS.includes(sortMode) ? sortMode : "newest";
  const sortedTransactions = [...collection];

  if (activeSortMode === "oldest") {
    return sortedTransactions.sort(compareTransactionsByOldest);
  }

  if (activeSortMode === "highest") {
    return sortedTransactions.sort((first, second) => second.amount - first.amount || compareTransactionsByNewest(first, second));
  }

  if (activeSortMode === "lowest") {
    return sortedTransactions.sort((first, second) => first.amount - second.amount || compareTransactionsByNewest(first, second));
  }

  if (activeSortMode === "category") {
    return sortedTransactions.sort((first, second) => {
      return first.category.localeCompare(second.category, "en") || compareTransactionsByNewest(first, second);
    });
  }

  if (activeSortMode === "type") {
    return sortedTransactions.sort((first, second) => {
      return TYPE_LABELS[first.type].localeCompare(TYPE_LABELS[second.type], "en")
        || compareTransactionsByNewest(first, second);
    });
  }

  return sortedTransactions.sort(compareTransactionsByNewest);
}

function compareTransactionsByNewest(first, second) {
  const dateDifference = new Date(second.date) - new Date(first.date);

  if (dateDifference !== 0) {
    return dateDifference;
  }

  return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
}

function compareTransactionsByOldest(first, second) {
  const dateDifference = new Date(first.date) - new Date(second.date);

  if (dateDifference !== 0) {
    return dateDifference;
  }

  return new Date(first.createdAt || 0) - new Date(second.createdAt || 0);
}

function createTransactionRow(transaction) {
  const row = document.createElement("article");
  const isIncome = transaction.type === "income";
  const amountPrefix = isIncome ? "+" : "-";

  row.className = "transaction-row";
  row.dataset.id = transaction.id;

  const typeMark = document.createElement("div");
  typeMark.className = `transaction-type transaction-type--${transaction.type}`;
  typeMark.textContent = getCategoryMark(transaction);
  typeMark.setAttribute("aria-label", TYPE_LABELS[transaction.type]);

  const main = document.createElement("div");
  main.className = "transaction-main";

  const copy = document.createElement("div");
  copy.className = "transaction-copy";

  const title = document.createElement("div");
  title.className = "transaction-title";
  title.textContent = transaction.description;

  const subtitle = document.createElement("div");
  subtitle.className = "transaction-subtitle";
  subtitle.textContent = TYPE_LABELS[transaction.type];

  copy.append(title, subtitle);
  main.append(typeMark, copy);

  const category = document.createElement("div");
  category.className = "transaction-category";
  category.textContent = transaction.category;

  const date = document.createElement("div");
  date.className = "transaction-date";
  date.textContent = formatDate(transaction.date);

  const amount = document.createElement("div");
  amount.className = `transaction-amount ${isIncome ? "income-text" : "expense-text"}`;
  amount.textContent = `${amountPrefix}${formatMoney(transaction.amount)}`;

  const actions = document.createElement("div");
  actions.className = "row-actions";

  const editButton = document.createElement("button");
  editButton.className = "icon-button";
  editButton.type = "button";
  editButton.dataset.action = "edit";
  editButton.textContent = "Edit";

  const deleteButton = document.createElement("button");
  deleteButton.className = "icon-button icon-button--danger";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.textContent = "Delete";

  actions.append(editButton, deleteButton);
  row.append(main, amount, date, category, actions);

  return row;
}

function populateCategoryInput(selectedCategory = "") {
  const selectedType = document.querySelector('input[name="type"]:checked').value;
  const categories = [...CATEGORY_OPTIONS[selectedType]];

  if (selectedCategory && !categories.includes(selectedCategory)) {
    categories.push(selectedCategory);
  }

  elements.categoryInput.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a category";
  elements.categoryInput.appendChild(placeholder);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryInput.appendChild(option);
  });

  elements.categoryInput.value = selectedCategory && categories.includes(selectedCategory)
    ? selectedCategory
    : "";
}

function populateCategoryFilter() {
  const selectedValue = elements.categoryFilter.value;
  const categories = [...new Set(transactions.map((transaction) => transaction.category))]
    .sort((first, second) => first.localeCompare(second, "en"));

  elements.categoryFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All categories";
  elements.categoryFilter.appendChild(allOption);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.appendChild(option);
  });

  elements.categoryFilter.value = categories.includes(selectedValue) ? selectedValue : "all";
}

function getTopExpenseCategory(monthlyTransactions) {
  const totalsByCategory = monthlyTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
      return totals;
    }, {});

  const topCategory = Object.entries(totalsByCategory)
    .sort((first, second) => second[1] - first[1])[0];

  return topCategory ? `${topCategory[0]} (${formatMoney(topCategory[1])})` : "-";
}

function getCategoryMark(transaction) {
  const marks = {
    Salary: "SA",
    Freelance: "FR",
    Investments: "IN",
    Sales: "SL",
    Gift: "GI",
    Food: "FO",
    Housing: "HO",
    Transport: "TR",
    Bills: "BI",
    Health: "HE",
    Entertainment: "EN",
    Shopping: "SH",
    Other: "OT"
  };

  return marks[transaction.category] || transaction.category.slice(0, 2).toUpperCase();
}

function sumByType(type, collection) {
  return collection
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

function countByType(type, collection) {
  return collection.filter((transaction) => transaction.type === type).length;
}

function formatTransactionCount(count) {
  if (count === 1) {
    return "1 transaction";
  }

  return `${count} transactions`;
}

function formatMoney(amount) {
  return moneyFormatter.format(amount);
}

function formatCompactMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(amount);
}

function formatPercent(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1
  }).format(value);
}

function formatDate(dateValue) {
  return dateFormatter.format(new Date(`${dateValue}T00:00:00`));
}

function isValidDateValue(dateValue) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return false;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}

function getTodayValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function getCurrentMonthValue() {
  return getTodayValue().slice(0, 7);
}

function buildDemoTransactions() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const toDateValue = (day) => {
    const safeDay = Math.min(day, daysInMonth);
    const date = new Date(year, month, safeDay);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
  };

  const demoItems = [
    { type: "income", amount: 2100, category: "Salary", description: "Monthly salary", date: toDateValue(1) },
    { type: "income", amount: 420, category: "Freelance", description: "Web landing page project", date: toDateValue(9) },
    { type: "expense", amount: 690, category: "Housing", description: "Apartment rent", date: toDateValue(2) },
    { type: "expense", amount: 156.45, category: "Food", description: "Weekly groceries", date: toDateValue(5) },
    { type: "expense", amount: 48.9, category: "Transport", description: "Fuel and parking", date: toDateValue(8) },
    { type: "expense", amount: 83.2, category: "Bills", description: "Internet and mobile plan", date: toDateValue(11) },
    { type: "expense", amount: 64.5, category: "Entertainment", description: "Cinema and dinner", date: toDateValue(16) },
    { type: "expense", amount: 112.99, category: "Shopping", description: "Work headphones", date: toDateValue(19) },
    { type: "income", amount: 75, category: "Sales", description: "Sold an old monitor", date: toDateValue(22) }
  ];

  return demoItems.map((item, index) => ({
    id: createId(),
    ...item,
    createdAt: new Date(Date.now() - index * 120000).toISOString(),
    updatedAt: null
  }));
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `transaction-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTransactions() {
  try {
    const storedTransactions = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(storedTransactions)) {
      return [];
    }

    return storedTransactions
      .map(normalizeTransaction)
      .filter(Boolean);
  } catch (error) {
    console.warn("Transactions could not be loaded from LocalStorage.", error);
    return [];
  }
}

function loadBudgetGoal() {
  const storedBudget = Number(localStorage.getItem(BUDGET_KEY));

  if (!Number.isFinite(storedBudget) || storedBudget <= 0) {
    return DEFAULT_BUDGET_GOAL;
  }

  return storedBudget;
}

function loadCategoryBudgets() {
  try {
    const storedBudgets = JSON.parse(localStorage.getItem(CATEGORY_BUDGET_KEY));
    return normalizeCategoryBudgets(storedBudgets);
  } catch (error) {
    console.warn("Category budgets could not be loaded from LocalStorage.", error);
    return normalizeCategoryBudgets();
  }
}

function saveBudgetGoal() {
  localStorage.setItem(BUDGET_KEY, String(budgetGoal));
}

function saveCategoryBudgets() {
  localStorage.setItem(CATEGORY_BUDGET_KEY, JSON.stringify(categoryBudgets));
}

function normalizeCategoryBudgets(source = {}) {
  const sourceBudgets = source && typeof source === "object" ? source : {};

  return CATEGORY_OPTIONS.expense.reduce((budgets, category) => {
    const fallbackBudget = DEFAULT_CATEGORY_BUDGETS[category] || 0;
    const rawBudget = Object.prototype.hasOwnProperty.call(sourceBudgets, category)
      ? sourceBudgets[category]
      : fallbackBudget;
    const normalizedBudget = Number(rawBudget);

    budgets[category] = Number.isFinite(normalizedBudget) && normalizedBudget >= 0
      ? normalizedBudget
      : fallbackBudget;

    return budgets;
  }, {});
}

function normalizeTransaction(transaction) {
  if (!transaction || typeof transaction !== "object") {
    return null;
  }

  const type = transaction.type === "expense" ? "expense" : "income";
  const amount = Number(transaction.amount);
  const date = typeof transaction.date === "string" ? transaction.date : "";

  if (!Number.isFinite(amount) || amount <= 0 || !isValidDateValue(date)) {
    return null;
  }

  return {
    id: String(transaction.id || createId()),
    type,
    amount,
    category: String(transaction.category || "Other"),
    description: String(transaction.description || "Transaction"),
    date,
    createdAt: transaction.createdAt || new Date().toISOString(),
    updatedAt: transaction.updatedAt || null
  };
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.warn("Transactions could not be saved to LocalStorage.", error);
  }
}

function applyStoredTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme || (prefersDark ? "dark" : "light");

  document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";

  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);
  syncThemeButton();
  renderMonthlyOverview();
  showToast(nextTheme === "dark" ? "Dark mode is on." : "Light mode is on.");
}

function syncThemeButton() {
  const isDark = document.documentElement.dataset.theme === "dark";
  elements.themeToggle.setAttribute("aria-pressed", String(isDark));
  elements.themeToggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
}

function showToast(message, tone = "success") {
  window.clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.className = `toast toast--${tone}`;

  toastTimeout = window.setTimeout(() => {
    elements.toast.classList.add("is-hidden");
  }, TOAST_DURATION_MS);
}
