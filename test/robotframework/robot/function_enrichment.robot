*** Settings ***
Documentation     A test suite for the function enrichment input
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.
Resource          resource.robot

*** Test Cases ***
Valid Function Enrichment Single
  Open Browser To Home Page
  Input Function Enrichment Single
  Close Browser

Valid Function Enrichment Multiple
  Open Browser To Home Page
  Input Function Enrichment Multiple
  Close Browser

Valid Function Enrichment ENSG
  Open Browser To Home Page
  Input Function Enrichment Multiple ENSG
  Close Browser
