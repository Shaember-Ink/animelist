/// <reference types="cypress" />

describe("AnimeList Core Flows", () => {
  beforeEach(() => {
    // Intercept API calls to prevent rate limiting during tests
    cy.intercept("GET", "https://api.jikan.moe/v4/*").as("jikanApi");
    cy.visit("/");
  });

  it("should navigate through the main tabs successfully", () => {
    // Check Home page loads
    cy.contains("Trends Now", { matchCase: false }).should("exist");
    cy.get("a[href*='/anime/']").should("have.length.greaterThan", 0);

    // Navigate to Catalog
    cy.contains("nav a", "Catalog").click();
    cy.url().should("include", "/anime");
    cy.contains("Explore Anime", { matchCase: false }).should("exist");

    // Navigate to Popular
    cy.contains("nav a", "Popular").click();
    cy.url().should("include", "/anime/popular");
    cy.contains("Popular", { matchCase: false }).should("exist");
  });

  it("should perform a search successfully", () => {
    cy.get("a[href='/search']").click();
    cy.url().should("include", "/search");
    
    const query = "Naruto";
    cy.get("input").first().type(`${query}{enter}`);
    
    // Wait for API response
    cy.wait("@jikanApi");
    
    // Target the actual h3 titles inside the cards to ensure we get a search result, not a random header
    cy.get("div[class*='Card_content'] h3").first().invoke('text').then((text) => {
      expect(text.toLowerCase()).to.include(query.toLowerCase());
    });
  });

  it("should filter the catalog by genre", () => {
    cy.visit("/anime");
    
    // Click on the 'Action' genre filter
    cy.contains("button", "Action").click();
    
    // The URL should update or an API call should fire for Action
    cy.wait("@jikanApi");
    
    // Wait for the new data to load and check card existence using the generic Link regex href but avoiding nav links
    cy.get("a[href^='/anime/']").not("a[href='/anime/popular'], a[href='/anime/upcoming'], a[href='/anime/new']").should("have.length.greaterThan", 0);
  });

  it("should navigate to details and then to the player", () => {
    // Go to catalog
    cy.visit("/anime");
    
    // Click the first anime card (avoiding navigation links that also start with /anime/)
    cy.get("a[href^='/anime/']").not("a[href='/anime/popular'], a[href='/anime/upcoming'], a[href='/anime/new']").first().click();
    
    // Should be on the details page
    cy.url().should("match", /\/anime\/\d+/);
    cy.get("h1").should("exist"); 
    
    // Click 'Смотреть' (Watch Now) button. It's usually an anchor linking to /watch
    cy.contains("a", "Смотреть").click();
    
    // Should be on the watch page
    cy.url().should("match", /\/watch\/\d+/);
    
    // Verify the page structure and player wrapper render correctly.
    // We avoid asserting on the external Kodik iframe itself as it can be blocked/flaky in CI/headless runners.
    cy.get("div[class*='Watch_videoWrapper']").should("exist");
  });
});
