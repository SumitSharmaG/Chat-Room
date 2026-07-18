// client/js/attachments.js

document.addEventListener("DOMContentLoaded", () => {
    const attachBtn = document.getElementById("attachBtn");
    const attachMenu = document.getElementById("attachMenu");

    if (attachBtn && attachMenu) {
        // Toggle menu when clicking + button
        attachBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            attachMenu.classList.toggle("show");
            console.log("Menu toggled! Classes now:", attachMenu.className); // Debugging line
        });

        // Close menu on outside click
        document.addEventListener("click", (e) => {
            if (!attachMenu.contains(e.target) && e.target !== attachBtn) {
                attachMenu.classList.remove("show");
            }
        });
    } else {
        console.error("Attachment elements not found in HTML!");
    }

    // Handle menu options click
    const menuItems = document.querySelectorAll(".attach-item");
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            const type = item.getAttribute("data-type");
            const inputEl = document.getElementById(`${type}Input`);
            if (inputEl) {
                inputEl.click();
            }
            attachMenu.classList.remove("show");
        });
    });
});
