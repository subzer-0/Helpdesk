/**
 * Progressive-enhancement helper for a helpdesk complaint form.
 *
 * Usage on the partner page:
 *
 *   <form data-helpdesk-complaint>
 *     <input name="name" required />
 *     <input name="email" type="email" required />
 *     <input name="contact" required />
 *     <textarea name="body" required></textarea>
 *     <input name="website" tabindex="-1" aria-hidden="true" style="display:none" />
 *     <button type="submit">Submit</button>
 *     <div data-helpdesk-status></div>
 *   </form>
 *
 *   <script src="https://helpdesk.example.com/embed.js"
 *           data-endpoint="https://helpdesk.example.com/api/complaints/public"></script>
 */
(function () {
  var script = document.currentScript;
  var endpoint = (script && script.getAttribute("data-endpoint")) ||
    "https://helpdesk.example.com/api/complaints/public";

  function attach(form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var statusEl = form.querySelector("[data-helpdesk-status]");
      var submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;

      var data = {};
      ["name", "email", "contact", "body", "website"].forEach(function (k) {
        var el = form.elements.namedItem(k);
        if (el) data[k] = (el.value || "").toString().trim();
      });

      try {
        var res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        var json = await res.json().catch(function () { return {}; });
        if (!res.ok) throw new Error((json.error && json.error.message) || "Submission failed.");
        if (statusEl) statusEl.textContent =
          "Thanks — your ticket is " + json.ticketId + ". We will reply by email.";
        form.reset();
      } catch (err) {
        if (statusEl) statusEl.textContent = err.message || "Could not submit.";
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }

  document.querySelectorAll("form[data-helpdesk-complaint]").forEach(attach);
})();
