/*
Test to verify that the user is able to change the status both the
HWLC and Enforcement details screens
*/
describe('Complaint Change Status spec - Details View', () => {

  const complaintTypes = ['#hwcr-tab', '#ers-tab'];

  beforeEach(function() {
    cy.viewport("macbook-16");
    cy.kcLogout().kcLogin();
  });

  Cypress._.times(complaintTypes.length, ((index) => {

    it('Verifies filters are available', () => {
      cy.visit("/");
      cy.get(complaintTypes[index]).click({ force: true });
      
      cy.wait(5000);
      //-- check to make sure there are items in the table
      cy.get("#comp-table")
      .find("tr")
      .then(({ length }) => {
        expect(length, "rows N").to.be.gt(0);
      });
      
      cy.get('#complaint-filter-image-id').click({ force: true });

      cy.get('#comp-filter-region-id').should('exist');
      cy.get('#comp-filter-zone-id').should('exist');
      cy.get('#comp-filter-community-id').should('exist');
      cy.get('#comp-filter-officer-id').should('exist');
      if ('#hwcr-tab' === complaintTypes[index]) {
        cy.get('#comp-filter-nature-id').should('exist');//only hwrc
        cy.get('#comp-filter-violation-id').should('not.exist');//only ers
        cy.get('#comp-filter-species-id').should('exist');//only hwrc
      } else {
        cy.get('#comp-filter-nature-id').should('not.exist');//only hwrc
        cy.get('#comp-filter-violation-id').should('exist');//only ers
        cy.get('#comp-filter-species-id').should('not.exist');//only hwrc
      }
      cy.get('#comp-filter-date-id').should('exist');
      cy.get('#comp-filter-status-id').should('exist');

      cy.get('#complaint-filter-image-id').click({ force: true });


    });
  }));
});