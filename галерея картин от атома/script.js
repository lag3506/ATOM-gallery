
const gallery = document.getElementById("galleryGrid");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");
const uploadForm = document.getElementById("uploadForm");

let currentFilter = "all";
let currentUser = localStorage.getItem("atomUser") || "";
let isRegistering = false;

function updateAuthButton() {
    const button = document.getElementById("authButton");

    if (currentUser) {
        button.textContent = currentUser;
        button.onclick = logout;
    } else {
        button.textContent = "Войти";
        button.onclick = openAuth;
    }
}

function openAuth() {
    document.getElementById("authModal").hidden = false;
    document.getElementById("authMessage").textContent = "";
}

function closeAuth() {
    document.getElementById("authModal").hidden = true;
}

function logout() {
    localStorage.removeItem("atomUser");
    currentUser = "";
    updateAuthButton();
}

document.getElementById("switchAuth").addEventListener("click", () => {
    isRegistering = !isRegistering;

    document.getElementById("authTitle").textContent =
        isRegistering ? "Регистрация" : "Вход";

    document.getElementById("authSubmit").textContent =
        isRegistering ? "Создать аккаунт" : "Войти";

    document.getElementById("switchAuth").textContent =
        isRegistering
            ? "Уже есть аккаунт? Войти"
            : "Нет аккаунта? Зарегистрироваться";

    document.getElementById("authMessage").textContent = "";
});

document.getElementById("authForm").addEventListener("submit", event => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("authMessage");

    if (username.length < 2 || password.length < 4) {
        message.textContent = "Укажи имя от 2 символов и пароль от 4 символов.";
        return;
    }

    const users = JSON.parse(localStorage.getItem("atomUsers") || "{}");

    if (isRegistering) {
        if (users[username]) {
            message.textContent = "Такой пользователь уже существует.";
            return;
        }

        // Демонстрационная регистрация для локального прототипа.
        // Не используй такое хранение паролей в реальном публичном сервисе.
        users[username] = password;
        localStorage.setItem("atomUsers", JSON.stringify(users));
    } else if (users[username] !== password) {
        message.textContent = "Неверное имя пользователя или пароль.";
        return;
    }

    currentUser = username;
    localStorage.setItem("atomUser", currentUser);
    updateAuthButton();
    closeAuth();
    document.getElementById("authForm").reset();
});

function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const cards = gallery.querySelectorAll(".work-card");
    let visibleCount = 0;

    cards.forEach(card => {
        const category = card.dataset.category;
        const text = card.textContent.toLowerCase();

        const categoryMatches =
            currentFilter === "all" || category === currentFilter;
        const searchMatches = text.includes(query);
        const visible = categoryMatches && searchMatches;

        card.hidden = !visible;

        if (visible) visibleCount++;
    });

    emptyMessage.hidden = visibleCount !== 0;
}

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        currentFilter = button.dataset.filter;
        applyFilters();
    });
});

searchInput.addEventListener("input", applyFilters);

gallery.addEventListener("click", event => {
    const button = event.target.closest(".like-button");
    if (!button) return;

    const liked = button.classList.toggle("liked");
    let count = Number(button.querySelector("span").textContent);

    count += liked ? 1 : -1;
    button.querySelector("span").textContent = count;
    button.firstChild.textContent = liked ? "♥ " : "♡ ";
});

uploadForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!currentUser) {
        openAuth();
        document.getElementById("authMessage").textContent =
            "Сначала войди или зарегистрируйся.";
        return;
    }

    const title = document.getElementById("workTitle").value.trim();
    const author = document.getElementById("workAuthor").value.trim();
    const category = document.getElementById("workCategory").value;
    const file = document.getElementById("workImage").files[0];

    if (!file || !file.type.startsWith("image/")) {
        alert("Выбери файл изображения.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Изображение должно быть не больше 5 МБ.");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        const card = document.createElement("article");
        card.className = "work-card";
        card.dataset.category = category;

        const image = document.createElement("img");
        image.src = reader.result;
        image.alt = title;

        const info = document.createElement("div");
        info.className = "work-info";

        const details = document.createElement("div");
        const heading = document.createElement("h3");
        heading.textContent = title;

        const authorText = document.createElement("p");
        authorText.textContent = "Автор: " + author;

        details.append(heading, authorText);

        const like = document.createElement("button");
        like.className = "like-button";
        like.setAttribute("aria-label", "Лайк");
        like.append(document.createTextNode("♡ "));

        const count = document.createElement("span");
        count.textContent = "0";
        like.append(count);

        info.append(details, like);
        card.append(image, info);
        gallery.prepend(card);

        uploadForm.reset();
        applyFilters();

        document.getElementById("gallery").scrollIntoView({
            behavior: "smooth"
        });
    };

    reader.readAsDataURL(file);
});

updateAuthButton();
applyFilters();
