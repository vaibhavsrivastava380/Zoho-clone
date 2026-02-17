const leaves = [
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

// Modal Logic
const applyLeaveBtn = document.getElementById("applyLeaveBtn");
const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const leaveForm = document.getElementById("leaveForm");

if (applyLeaveBtn) {
    applyLeaveBtn.addEventListener("click", () => {
        modalOverlay.classList.add("active");
    });
}

function hideModal() {
    modalOverlay.classList.remove("active");
}

if (closeModal) closeModal.addEventListener("click", hideModal);
if (cancelModal) cancelModal.addEventListener("click", hideModal);

window.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        hideModal();
    }
});

// Form Submission Logic
const FORM_ID = "1FAIpQLSftPqOFlR6Z4cTPfSJTRaMn_jXOaB1B8KJSCVd2QX_Nq0Jh5w";
const GOOGLE_FORM_ACTION = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

if (leaveForm) {
    leaveForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const leaveType = document.getElementById("leaveType").value;
        const startDate = new Date(document.getElementById("startDate").value);
        const endDate = new Date(document.getElementById("endDate").value);
        const teamEmail = document.getElementById("teamEmail").value;

        const reason = document.getElementById("reason").value;

        // Visual feedback: Loading state
        const submitBtn = document.querySelector('.btn-submit');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        const formDataEncoded = new URLSearchParams({
            "entry.706412639": leaveType,
            "entry.323582573_year": startDate.getFullYear(),
            "entry.323582573_month": startDate.getMonth() + 1,
            "entry.323582573_day": startDate.getDate(),
            "entry.1913559081_year": endDate.getFullYear(),
            "entry.1913559081_month": endDate.getMonth() + 1,
            "entry.1913559081_day": endDate.getDate(),
            "entry.2107227366": teamEmail,
            "entry.1467837153": reason,
        });

        try {
            await fetch(GOOGLE_FORM_ACTION, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formDataEncoded.toString(),
            });

            alert("Leave application submitted successfully!");
            leaveForm.reset();
            hideModal();
        } catch (error) {
            console.log("Submission error", error);
            alert("Submission failed. Please try again.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    });
}

const upcomingDropdown = document.querySelector("#upcomingLeave");
if (upcomingDropdown) {
    upcomingDropdown.addEventListener("change", function () {
        const value = this.value;
        // renderElement logic would go here
    });
}
