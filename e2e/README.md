# Cypress browser tests

## Configurations

| Config      | UI                    | Back-end   | Tests folder                    | Reporter |
| ----------- |-----------------------| ---------- | ------------------------------- | -------- |
| mocked      | http://localhost:8080 | mocked     | cypress/integration/mocked      | standard |


### Tests with fully mocked backend

In this case we start Angular dev server with `npm run start:e2e:mocked`.
All endpoints mocked out, see `webapp/environments/environment.e2e.mocked.ts`.

App runs on `http://localhost:8080/ui/`;

    npm run e2e:start:mocked  // starts mocked app and opens the Cypress Test Runner
    npm run e2e:run:mocked    // starts mocked app and runs all the tests on a headless browser

## Writing tests

-   Cypress is a bit different even from Protractor.
    Read [introduction] and [best practices].

-   Use page objects! See this short [article about page object pattern]. Do not hard-code any data into page object methods!

-   Add `data-qa` attributes to locate elements and use custom commands!
    We have custom commands like `cy.getByDataQa()` for interacting elements in tests.
    See e2e/cypress/support/commands.ts

        // supports nesting, translates to cy.get('[data-qa=test-parent-name] [data-qa=test-name]')
        cy.getByDataQa('test-parent-name test-name')
            .should('contain', 'Test Text');

[introduction]: https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html#Cypress-Can-Be-Simple-Sometimes
[best practices]: https://docs.cypress.io/guides/references/best-practices.html
[article about page objects]: https://medium.com/reactbrasil/deep-diving-pageobject-pattern-and-using-it-with-cypress-e60b9d7d0d91
