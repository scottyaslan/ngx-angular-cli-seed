Content is generated by maven tasks before the ui builds.

DO NOT MODIFY ANYTHING IN `TARGET` DIRECTORY!

Original template is a copy of the [typescript-angular template].

Change Log:
- #### Request In Progress support

    Each generated service now provides operation name constants for each method. You can check the store and provide status for a given operation:
    
        deleteEntityInProgress$ = this.store.select(
            isOperationInProgress(this.entityService.deleteEntityOperationName)
        );
    
    Then you can use this in the component:
    
        deleteEntityInProgress$ = this.entityService.deleteEntityInProgress$;
    
        <button [disabled]="(deleteEntityInProgress$ | async)"> Delete </button>

- #### Fix enum keys (use enum value as key, too) in `api-client/template/modelGenericEnums.mustache`:
  Replacing `{{name}}: {{{value}}}` to `{{{value}}}: {{{value}}}` E.g.:

      from : export const AnyEnum = { EXTRASMALL: 'EXTRA_SMALL' as AnyEnum, ... }
      to:    export const AnyEnum = { 'EXTRA_SMALL': 'EXTRA_SMALL' as AnyEnum, ... }


[typescript-angular template]: https://github.com/swagger-api/swagger-codegen/tree/master/modules/swagger-codegen/src/main/resources/typescript-angular
