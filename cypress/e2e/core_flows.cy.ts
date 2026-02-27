/// <reference types="cypress" />

describe("AnimeList Core Flows", () => {
  beforeEach(() => {
    // Intercept API calls to prevent rate limiting during tests
    cy.intercept("GET", "https://api.jikan.moe/v4/*").as("jikanApi");
    cy.visit("/");
  });

  it("should navigate through the main tabs successfully", () => {
    // Check Home page loads
    cy.contains("trending").should("exist"); // Partial text match for safety (could be Trending Now or similar)
    cy.get("a[href*='/anime/']").should("have.length.greaterThan", 0);

    // Navigate to Catalog
    cy.contains("nav a", "Catalog").click();
    cy.url().should("include", "/anime");
    cy.contains("Catalog").should("be.visible");
    cy.get(".card").should("have.length.greaterThan", 0);

    // Navigate to Popular
    cy.contains("nav a", "Popular").click();
    cy.url().should("include", "/anime/popular");
    cy.contains("Popular Anime").should("be.visible");
    cy.get(".card").should("have.length.greaterThan", 0);
  });

  it("should perform a search successfully", () => {
    cy.get("a[href='/search']").click();
    cy.url().should("include", "/search");
    
    const query = "Naruto";
    cy.get("input[placeholder*='Search']").type(`${query}{enter}`);
    
    // Wait for API response
    cy.wait("@jikanApi");
    
    // Verify results appear
    cy.get(".card").should("have.length.greaterThan", 0);
    // The title of at least one card should contain the query (case insensitive)
    cy.get(".card h3").first().invoke('text').then((text) => {
      expect(text.toLowerCase()).to.include(query.toLowerCase());
    });
  });

  it("should filter the catalog by genre", () => {
    cy.visit("/anime");
    
    // Click on the 'Action' genre filter
    cy.contains("button", "Action").click();
    
    // The URL should update with the genre ID for Action (usually 1 for Jikan)
    cy.url().should("include", "genre=1");
    
    // Wait for the new data to load
    cy.wait("@jikanApi");
    
    // Verify cards are still rendered after filtering
    cy.get(".card").should("have.length.greaterThan", 0);
  });

  it("should navigate to details and then to the player", () => {
    // Go to catalog
    cy.visit("/anime");
    
    // Click the first anime card
    cy.get(".card").first().click();
    
    // Should be on the details page
    cy.url().should("match", /\/anime\/\d+/);
    cy.get("h1").should("be.visible"); // Title should be visible
    
    // Click 'Смотреть' (Watch Now) button. It's usually an anchor linking to /watch
    cy.contains("a", "Смотреть").click();
    
    // Should be on the watch page
    cy.url().should("match", /\/anime\/\d+\/watch/);
    
    // The video player iframe should exist
    cy.get("iframe").should("exist");
  });
});
