(function() {
  var DEFAULT_SITE_URL = "https://infolders.vercel.app";

  function getApiBaseUrl() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["infolders_site_url"], (result) => {
        if (result && result.infolders_site_url) {
          resolve(String(result.infolders_site_url).replace(/\/+$/, ""));
        } else {
          resolve(DEFAULT_SITE_URL);
        }
      });
    });
  }

  var statusEl = document.getElementById("status-message");
  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    if (type === "success") statusEl.style.color = "#22c55e";
    else if (type === "error") statusEl.style.color = "#ef4444";
    else if (type === "warn") statusEl.style.color = "#f59e0b";
    else statusEl.style.color = "#a78bfa";
  }

  var closeBtn = document.getElementById("close-subscriptions");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => window.close());
  }

  function sendToBackground(message) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(response);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  function decodeIdToken(idToken) {
    return JSON.parse(atob(idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  }

  // Login con Google dal popup: salva currentUser + id_token.
  // La sessione Supabase viene completata dal content script alla prossima
  // pagina chatbot (chiave pending_google_id_token).
  async function loginFromPopup() {
    setStatus("Accesso con Google...", "info");
    const response = await sendToBackground({ action: "loginWithGoogle" });
    if (!response || response.error) {
      throw new Error(response && response.error ? response.error : "Login fallito");
    }
    if (!response.token) throw new Error("Token non ricevuto");
    const payload = decodeIdToken(response.token);
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      verified_email: payload.email_verified
    };
    await new Promise((resolve) => {
      chrome.storage.local.set(
        { currentUser: user, pending_google_id_token: response.token },
        () => resolve()
      );
    });
    return user;
  }

  async function startCheckout(plan, user) {
    setStatus("Reindirizzamento a Stripe...", "info");
    const baseUrl = await getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, userId: user.id, email: user.email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Errore nel pagamento");
    }
    chrome.tabs.create({ url: data.url });
    setStatus("Pagamento avviato: apri la finestra di Stripe.", "success");
  }

  document.querySelectorAll(".pricing-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const plan = btn.dataset.plan;
      if (plan === "free") {
        setStatus("Sei già sul piano Free.", "info");
        return;
      }
      // Pro e Team: se non hai fatto l'accesso, login e poi pagamento.
      chrome.storage.local.get(["currentUser"], async (result) => {
        try {
          let user = result.currentUser;
          if (!user || !user.id || !user.email) {
            user = await loginFromPopup();
          }
          await startCheckout(plan, user);
        } catch (err) {
          setStatus(err.message || "Errore nel pagamento. Riprova più tardi.", "error");
        }
      });
    });
  });
})();
