*** Settings ***
Documentation     A test suite for the gene related functions
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.
Resource          resource.robot

*** Test Cases ***
Valid Gene
  Open Browser To Gene
  Click Gene Databases
  Close Browser
