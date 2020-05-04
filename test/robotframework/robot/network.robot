*** Settings ***
Documentation     A test suite for the Network related functions
...
...               This test has a workflow that is created using keywords in
...               the imported resource file.
Resource          resource.robot

*** Test Cases ***
Valid Network Input
  Open Browser To Home Page
	Input Function Enrichment Multiple

Valid Network Open
  Click Network

Valid Analyze All Genes
  Open Network
  Click Analyze All Genes

Valid Network Click
  Click Network Contents

Valid Predicted Genes
  Click Predicted Genes
  Click Predicted Gene
  Close Browser
