document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const password = document.getElementById("password").value;

    if (password === "OMEGA-1913") {
        window.location.href = "game.html";
    } else {
        document.getElementById("error").textContent = "Clé invalide.";
    }
});
