import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
    document.body.innerHTML = `
    <form id="loginForm">
      <input id="loginUsername" value="Thomas" />
      <input id="loginPassword" value="hemmeligt" />
      <button type="submit">Login</button>
    </form>
    <form id="signupForm" class="hidden">
      <input id="signupUsername" />
      <input id="signupPassword" />
      <button type="submit">Signup</button>
    </form>
    <div id="message"></div>
    <button id="loginTab">Login Tab</button>
    <button id="signupTab">Signup Tab</button>
  `;

    delete window.location;
    window.location = { href: "" };

    require("../public/login.js"); // EFTER DOM er sat op
});

describe("handleAuthentication", () => {
    it("viser succesbesked ved login", async () => {
        const fakeResponse = {
            json: async () => ({ success: true, token: "abc123" }),
        };
        vi.spyOn(global, "fetch").mockResolvedValue(fakeResponse);

        const setItemSpy = vi.spyOn(window.localStorage.__proto__, "setItem");

        const form = document.getElementById("loginForm");
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(document.getElementById("message").textContent).toContain("Login successfuldt");
        expect(setItemSpy).toHaveBeenCalledWith("jwt", "abc123");
        expect(window.location.href).toBe("/fodbold");
    });

});

describe("tab-skift", () => {
    it("viser loginForm når loginTab klikkes", () => {
        const loginTab = document.getElementById("loginTab");
        loginTab.click();

        expect(document.getElementById("loginForm").classList.contains("hidden")).toBe(false);
        expect(document.getElementById("signupForm").classList.contains("hidden")).toBe(true);
    });

});
