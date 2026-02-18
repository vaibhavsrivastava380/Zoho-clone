const leaves = [];

const defaultBalances = {
    compOff: { available: 24, booked: 0 },
    pto: { available: 15, booked: 0 },
    mDay: { available: 1, booked: 0 }
};

const SPECIAL_DATES = [
    { name: "Birthday", date: "2026-03-08" },
    { name: "Anniversary", date: "2026-04-01" }
];

const HOLIDAYS_DATA = [
    { tag: "holiday", name: "New Year's Day", date: "2026-01-01" },
    { tag: "holiday", name: "Republic Day", date: "2026-01-26" },
    { tag: "holiday", name: "Holi", date: "2026-03-14" },
    { tag: "holiday", name: "Good Friday", date: "2026-04-03" },
    { tag: "holiday", name: "Eid al-Fitr", date: "2026-04-21" },
    { tag: "holiday", name: "Labour Day", date: "2026-05-01" },
    { tag: "holiday", name: "Independence Day", date: "2026-08-15" },
    { tag: "holiday", name: "Janmashtami", date: "2026-08-29" },
    { tag: "holiday", name: "Gandhi Jayanti", date: "2026-10-02" },
    { tag: "holiday", name: "Dussehra", date: "2026-10-22" },
    { tag: "holiday", name: "Diwali", date: "2026-11-10" },
    { tag: "holiday", name: "Christmas", date: "2026-12-25" }
];

function initBalances() {
    if (!localStorage.getItem('leaveBalances')) {
        localStorage.setItem('leaveBalances', JSON.stringify(defaultBalances));
    } else {
        const balances = JSON.parse(localStorage.getItem('leaveBalances'));
        const appliedDates = JSON.parse(localStorage.getItem('appliedLeaveDates')) || [];
        const mDayAppliedCount = appliedDates.filter(d => d.type === "My day").length;

        balances.mDay.available = SPECIAL_DATES.length - mDayAppliedCount;
        balances.mDay.booked = mDayAppliedCount;
        localStorage.setItem('leaveBalances', JSON.stringify(balances));
    }

    if (!localStorage.getItem('appliedLeaveDates')) {
        localStorage.setItem('appliedLeaveDates', JSON.stringify([]));
    }
    if (!localStorage.getItem('specialDates')) {
        localStorage.setItem('specialDates', JSON.stringify(SPECIAL_DATES));
    }
    if (!localStorage.getItem('localHolidays')) {
        localStorage.setItem('localHolidays', JSON.stringify(HOLIDAYS_DATA));
    }
    updateBalanceUI();
    renderAllData();
}

function updateBalanceUI() {
    const balances = JSON.parse(localStorage.getItem('leaveBalances'));
    const appliedDates = JSON.parse(localStorage.getItem('appliedLeaveDates')) || [];
    const updates = [
        { id: 'compOffAvailable', val: balances.compOff.available },
        { id: 'compOffBooked', val: balances.compOff.booked },
        { id: 'ptoAvailable', val: balances.pto.available },
        { id: 'ptoBooked', val: balances.pto.booked },
        { id: 'mDayAvailable', val: balances.mDay.available },
        { id: 'mDayBooked', val: balances.mDay.booked }
    ];

    updates.forEach(u => {
        const el = document.getElementById(u.id);
        el.innerText = u.val;
    });

    const totalBooked = appliedDates.reduce((acc, curr) => {
        if (curr.halfDay) return acc + 0.5;
        const start = new Date(curr.start);
        const end = new Date(curr.end);
        const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return acc + days;
    }, 0);

    const totalBookedEl = document.getElementById('totalLeaveBooked');
    totalBookedEl.innerText = totalBooked;
}

function updateBalance(leaveType, days, startDate, endDate) {
    const balances = JSON.parse(localStorage.getItem('leaveBalances'));
    let key = '';
    if (leaveType === "Compensatory off") key = 'compOff';
    else if (leaveType === "Personal Time Off") key = 'pto';
    else if (leaveType === "My day") key = 'mDay';

    if (key && balances[key]) {
        balances[key].available -= days;
        balances[key].booked += days;
        localStorage.setItem('leaveBalances', JSON.stringify(balances));
        updateBalanceUI();
    }

    const appliedDates = JSON.parse(localStorage.getItem('appliedLeaveDates')) || [];
    appliedDates.push({
        start: startDate,
        end: endDate,
        type: leaveType,
        halfDay: window.currentIsHalfDay || false
    });
    localStorage.setItem('appliedLeaveDates', JSON.stringify(appliedDates));
    renderAllData();
}

initBalances();

const applyLeaveBtn = document.getElementById("applyLeaveBtn");
const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const leaveForm = document.getElementById("leaveForm");


applyLeaveBtn.addEventListener("click", () => {
    modalOverlay.classList.add("active");
    setupDateConstraints();
});


function setupDateConstraints() {
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");

    const today = new Date();

    const minDate = new Date(today);
    minDate.setMonth(today.getMonth() - 2);
    const minStr = minDate.toISOString().split('T')[0];

    const maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 5);
    const maxStr = maxDate.toISOString().split('T')[0];

    startDateInput.setAttribute("min", minStr);
    startDateInput.setAttribute("max", maxStr);
    endDateInput.setAttribute("min", minStr);
    endDateInput.setAttribute("max", maxStr);
}
function hideModal() { modalOverlay.classList.remove("active"); }
closeModal.addEventListener("click", hideModal);
cancelModal.addEventListener("click", hideModal);
window.addEventListener("click", (e) => { if (e.target === modalOverlay) hideModal(); });


    leaveForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const leaveType = document.getElementById("leaveType").value;
        const startDateVal = document.getElementById("startDate").value;
        const endDateVal = document.getElementById("endDate").value;
        const isHalfDay = document.getElementById("halfDay").checked;
        const teamEmail = document.getElementById("teamEmail").value;
        const reason = document.getElementById("reason").value;

        if (isHalfDay && startDateVal !== endDateVal) {
            alert("How can you apply half day for so many days ???.");
            return;
        }

        window.currentIsHalfDay = isHalfDay;

        if (window.validateLeave) {
            const appliedDates = JSON.parse(localStorage.getItem('appliedLeaveDates')) || [];
            const holidayList = window.spreadsheetHolidays || [];
            const specialDates = JSON.parse(localStorage.getItem('specialDates')) || [];
            const validationResult = window.validateLeave(leaveType, startDateVal, endDateVal, holidayList, appliedDates, specialDates);

            if (!validationResult.valid) {
                alert(`can t aply leave: ${validationResult.message}`);
                return;
            }

            const balances = JSON.parse(localStorage.getItem('leaveBalances'));
            let key = '';
            if (leaveType === "Compensatory off") key = 'compOff';
            else if (leaveType === "Personal Time Off") key = 'pto';
            else if (leaveType === "My day") key = 'mDay';

            let requestedDays = validationResult.daysCount || 1;
            if (isHalfDay) requestedDays = 0.5;

            if (key && balances[key] && balances[key].available < requestedDays) {
                alert(`can t aply leave: Insufficient balance.`);
                return;
            }
            window.currentRequestedDays = requestedDays;
        }

        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        try {
            const FORM_ID = "1FAIpQLSftPqOFlR6Z4cTPfSJTRaMn_jXOaB1B8KJSCVd2QX_Nq0Jh5w";
            const action = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;
            const sDate = new Date(startDateVal);
            const eDate = new Date(endDateVal);

            const body = new URLSearchParams({
                "entry.706412639": leaveType,
                "entry.323582573_year": sDate.getFullYear(), "entry.323582573_month": sDate.getMonth() + 1, "entry.323582573_day": sDate.getDate(),
                "entry.1913559081_year": eDate.getFullYear(), "entry.1913559081_month": eDate.getMonth() + 1, "entry.1913559081_day": eDate.getDate(),
                "entry.2107227366": teamEmail, "entry.1467837153": reason
            });

            await fetch(action, { method: "POST", mode: "no-cors", body: body.toString() });

            updateBalance(leaveType, window.currentRequestedDays || 1, startDateVal, endDateVal);
            alert("Leave application submitted successfully!");
            leaveForm.reset();
            hideModal();
        } catch (error) {
            alert("Submission failed.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit";
        }
    });


function renderAllData(filterType = 'all', section = 'both') {
    const holidays = JSON.parse(localStorage.getItem('localHolidays')) || [];
    const applied = JSON.parse(localStorage.getItem('appliedLeaveDates')) || [];

    const formattedHolidays = holidays.map(h => ({
        type: h.name,
        start: h.date,
        isHoliday: true,
        reason: 'Public Holiday'
    }));

    const formattedApplied = applied.map(a => ({
        type: a.type,
        start: a.start,
        halfDay: a.halfDay,
        isHoliday: false,
        reason: 'Applied via Form'
    }));

    const combined = [...formattedHolidays, ...formattedApplied];
    window.allLeaveItems = combined;

    renderListDisplay(combined, filterType, section);

    window.spreadsheetHolidays = holidays.map(h => ({ tag: 'holiday', date: h.date }));
}

function renderListDisplay(combinedItems, filterType = 'all', section = 'both') {
    const upcomingContainer = document.querySelector(".upcoming__content");
    const pastContainer = document.querySelector(".past__content");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedItems = [...combinedItems].sort((a, b) => new Date(a.start) - new Date(b.start));

    if (section === 'upcoming' || section === 'both') upcomingContainer.innerHTML = '';
    if (section === 'past' || section === 'both') pastContainer.innerHTML = '';

    sortedItems.forEach(item => {
        const dateObj = new Date(item.start);
        if (typeof item.start === 'string' && item.start.includes('-') && !item.start.includes('T')) {
            const [y, m, d] = item.start.split('-').map(Number);
            dateObj.setFullYear(y, m - 1, d);
        }
        dateObj.setHours(0, 0, 0, 0);

        if (isNaN(dateObj.getTime())) return;

        if (filterType === 'uleave' && item.isHoliday) return;
        if (filterType === 'uholiday' && !item.isHoliday) return;

        const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'long' });

        const rowHtml = `
            <div class="list-item">
                <div class="list-item__date">${dateStr}, ${dayName}</div>
                <div class="list-item__event">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    ${item.type} ${item.halfDay ? '<span style="color: #6a7181; font-size: 11px;">(Half Day)</span>' : ''}
                </div>
                <div class="list-item__status">${item.isHoliday ? 'Holiday' : 'Applied'}</div>
            </div>
        `;

        if (dateObj >= today) {
            if (section === 'upcoming' || section === 'both') upcomingContainer.insertAdjacentHTML('beforeend', rowHtml);
        } else {
            if (section === 'past' || section === 'both') pastContainer.insertAdjacentHTML('beforeend', rowHtml);
        }
    });

    if ((section === 'upcoming' || section === 'both') && !upcomingContainer.innerHTML) {
        upcomingContainer.innerHTML = '<div style="padding: 20px; color: #888; font-size: 14px;">No upcoming entries</div>';
    }
    if ((section === 'past' || section === 'both') && !pastContainer.innerHTML) {
        pastContainer.innerHTML = '<div style="padding: 20px; color: #888; font-size: 14px;">No past entries</div>';
    }
}

window.renderSpreadsheetData = renderListDisplay;

const upcomingLeaveSelect = document.getElementById("upcomingLeave");
const pastLeaveSelect = document.getElementById("pastLeave");

if (upcomingLeaveSelect) {
    upcomingLeaveSelect.addEventListener("change", function () {
        renderAllData(this.value, 'upcoming');
    });
}

if (pastLeaveSelect) {
    pastLeaveSelect.addEventListener("change", function () {
        renderAllData(this.value, 'past');
    });
}
