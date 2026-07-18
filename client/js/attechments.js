// client/attachments.js

document.addEventListener("DOMContentLoaded", () => {
    const attachBtn = document.getElementById("attachBtn");
    const attachMenu = document.getElementById("attachMenu");

    if (attachBtn && attachMenu) {
        // Menu toggle logic
        attachBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            attachMenu.classList.toggle("show");
        });

        // Click outside to close menu
        document.addEventListener("click", (e) => {
            if (!attachMenu.contains(e.target) && e.target !== attachBtn) {
                attachMenu.classList.remove("show");
            }
        });
    }

    // Attach items click handler
    const menuItems = document.querySelectorAll(".attach-item");
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const type = item.getAttribute("data-type");
            const inputEl = document.getElementById(`${type}Input`);
            if (inputEl) {
                inputEl.click();
            }
            if (attachMenu) attachMenu.classList.remove("show");
        });
    });
});
