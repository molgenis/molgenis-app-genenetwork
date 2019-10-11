*** Settings ***
Documentation     A resource file with reusable keywords and variables.
...
...               The system specific keywords created here form our own
...               domain specific language. They utilize keywords provided
...               by the imported SeleniumLibrary.
Library           SeleniumLibrary

*** Variables ***
${SERVER}         genenetwork.nl
${BROWSER}        Chrome
${DELAY}          1
${HOME URL}      http://${SERVER}/
${NETWORK APPEND}	network/ENSG00000170365,ENSG00000175387,ENSG00000166949,ENSG00000141646,ENSG00000113658
${NETWORK URL}	http://${SERVER}/${NETWORK APPEND}
${GENE APPEND}  gene/ENSG00000170365
${SINGLE GENE URL}  http://${SERVER}/${GENE APPEND}
${FUNCTION ENRICHMENT SINGLE XPATH}	/html/body/div/div/div[2]/div[2]/div/div/span[1]/div[1]
${FUNCTION ENRICHMENT MULTIPLE BUTTON XPATH}	/html/body/div/div/div[3]/div[2]/div/div
${FUNCTION ENRICHMENT MULTIPLE INPUT XPATH}	/html/body/div/div/div[2]/div[3]/textarea
${FUNCTION ENRICHMENT MULTIPLE SUBMIT XPATH}	/html/body/div/div/div[2]/div[4]/form/span[1]
${GENE SET ENRICHMENT NUMBER XPATH}	/html/body/div/div/div[3]/div[1]/div/div[3]
${NETWORK BUTTON XPATH}	//*[@title='Open network']
${NETWORK ELEMENTS XPATH}	//*[@id='nodes']
${NETWORK ELEMENT XPATH}	//*[@class='nodetext clickable'][1]
${ANALYZE ALL GENES BUTTON XPATH}   //*[@title='Run pathway analysis and gene prediction']
${ANALYZE GENES SUB BUTTONS XPATH 1}  //*[@class='button small noselect clickable'][1]
${ANALYZE GENES SUB BUTTONS XPATH 2}  //*[@class='button small noselect clickable'][2]
${ANALYZE GENES SUB BUTTONS XPATH 3}  //*[@class='button small noselect clickable'][3]
${ANALYZE GENES SUB BUTTONS XPATH 4}  //*[@class='button small noselect clickable'][4]
${ANALYZE GENES SUB BUTTONS XPATH 5}  //*[@class='button small noselect clickable'][5]
${PREDICTED GENES BUTTON XPATH}  //*[@class='clickable button'][1]
${PREDICTED GENE TD XPATH}  //table/tbody/tr[1]/td[1]
${GENE HPO ELEMENT XPATH}   //*[@title='Human Phenotype Ontology']
${GENE GOBP ELEMENT XPATH}  //*[@title='Gene Ontology - Biological process']
${GENE GOMF ELEMENT XPATH}  //*[@title='Gene Ontology - Molecular function']
${GENE GOCP ELEMENT XPATH}  //*[@title='Gene Ontology - Cellular component']
${GENE KEGG ELEMENT XPATH}  //*[@title='Kyoto Encyclopedia of Genes and Genomes']
${GENE COREG ELEMENT XPATH}   //*[@class='button clickable mobilefullwidth'][1]
${GENE TISSUES ELEMENT XPATH}   //*[@class='button clickable mobilefullwidth'][2]
${FAQ ELEMENT XPATH}  //*[@class='menuitem ']
${FAQ GADO H XPATH}   //*[@id='can-i-run-gado-locally']
${FAQ GADO L XPATH}   //*[@href='#can-i-run-gado-locally']
${API ELEMENT XPATH}  //*[@class='menuitem last']
${GADO ELEMENT XPATH}   //*[@class='nodecoration black clickable']
${GADO SEARCH XPATH}    //*[@class='Select-placeholder']
${GADO SEARCH INPUT XPATH}    //*[@class='Select-input']/input
${GADO ADD TERM BUTTON XPATH}   //*[@class='button noselect clickable'][1]
${GADO SUBMIT BUTTON XPATH}   //*[@class='button noselect clickable'][1]
${GADO RESULT TABLE XPATH}  //*[@id='gentab']
${GENE 1}	SMAD1
${GENE 2}	SMAD1,SMAD2,SMAD3,SMAD4,SMAD5
${GENE 3}	ENSG00000170365,ENSG00000175387,ENSG00000166949,ENSG00000141646,ENSG00000113658
${GADO TERM 1}  Abnormality of the ovary - HP:0000137
${GADO TERM 2}  Abnormality of the mouth - HP:0000153
${GADO TERM 3}  Movement abnormality of the tongue - HP:0000182


*** Keywords ***
Open Browser To Home Page
    Open Browser    ${HOME URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    ${DELAY}
    Home Page Should Be Open

Home Page Should Be Open
    Title Should Be    Gene Network

Input Function Enrichment Single
	Wait Until Element Is Visible  xpath=${FUNCTION ENRICHMENT SINGLE XPATH}
	Click Element  xpath=${FUNCTION ENRICHMENT SINGLE XPATH}

Input Function Enrichment Multiple
	Click Element  xpath=${FUNCTION ENRICHMENT MULTIPLE BUTTON XPATH}
	Wait Until Element Is Visible  xpath=${FUNCTION ENRICHMENT MULTIPLE INPUT XPATH}
	Input Text   xpath=${FUNCTION ENRICHMENT MULTIPLE INPUT XPATH}	${GENE 2}
	Click Element  xpath=${FUNCTION ENRICHMENT MULTIPLE SUBMIT XPATH}
	Wait Until Element Is Visible  xpath=${GENE SET ENRICHMENT NUMBER XPATH}
	BuiltIn.Wait Until Keyword Succeeds	1m	1s	Element Should Contain	xpath=${GENE SET ENRICHMENT NUMBER XPATH}	5 unique genes found

Input Function Enrichment Multiple ENSG
	Click Element  xpath=${FUNCTION ENRICHMENT MULTIPLE BUTTON XPATH}
	Wait Until Element Is Visible  xpath=${FUNCTION ENRICHMENT MULTIPLE INPUT XPATH}
	Input Text   xpath=${FUNCTION ENRICHMENT MULTIPLE INPUT XPATH}	${GENE 3}
	Click Element  xpath=${FUNCTION ENRICHMENT MULTIPLE SUBMIT XPATH}
	Wait Until Element Is Visible  xpath=${GENE SET ENRICHMENT NUMBER XPATH}
	BuiltIn.Wait Until Keyword Succeeds	1m	1s	Element Should Contain	xpath=${GENE SET ENRICHMENT NUMBER XPATH}	5 unique genes found


Click Network
	Click Element  xpath=${NETWORK BUTTON XPATH}
	Title Should Be	Gene set enrichment - Gene Network

Open Network
	Close Browser
	Open Browser	${NETWORK URL}    ${BROWSER}
	Maximize Browser Window
  Set Selenium Speed    ${DELAY}

Click Analyze All Genes
  BuiltIn.Wait Until Keyword Succeeds   1m	1s   Wait Until Element Is Visible   xpath=${ANALYZE ALL GENES BUTTON XPATH}
  Click Element   xpath=${ANALYZE ALL GENES BUTTON XPATH}
  BuiltIn.Wait Until Keyword Succeeds   2m	1s   Wait Until Element Is Visible   xpath=${ANALYZE GENES SUB BUTTONS XPATH 1}
  Click Element   xpath=${ANALYZE GENES SUB BUTTONS XPATH 1}
  BuiltIn.Wait Until Keyword Succeeds   2m	1s   Wait Until Element Is Visible   xpath=${ANALYZE GENES SUB BUTTONS XPATH 2}
  Click Element   xpath=${ANALYZE GENES SUB BUTTONS XPATH 2}
  BuiltIn.Wait Until Keyword Succeeds   2m	1s   Wait Until Element Is Visible   xpath=${ANALYZE GENES SUB BUTTONS XPATH 3}
  Click Element   xpath=${ANALYZE GENES SUB BUTTONS XPATH 3}
  BuiltIn.Wait Until Keyword Succeeds   2m	1s   Wait Until Element Is Visible   xpath=${ANALYZE GENES SUB BUTTONS XPATH 4}
  Click Element   xpath=${ANALYZE GENES SUB BUTTONS XPATH 4}
  BuiltIn.Wait Until Keyword Succeeds   2m	1s   Wait Until Element Is Visible   xpath=${ANALYZE GENES SUB BUTTONS XPATH 5}
  Click Element   xpath=${ANALYZE GENES SUB BUTTONS XPATH 5}


Click Predicted Genes
  Wait Until Element Is Visible   xpath=${PREDICTED GENES BUTTON XPATH}
  Click Element   xpath=${PREDICTED GENES BUTTON XPATH}

Click Predicted Gene
  Wait Until Element Is Visible   xpath=${PREDICTED GENE TD XPATH}
  Click Element   xpath=${PREDICTED GENE TD XPATH}

Click Network Contents
  BuiltIn.Wait Until Keyword Succeeds	1m	1s	Wait Until Element Is Visible	xpath=${NETWORK ELEMENTS XPATH}
  BuiltIn.Wait Until Keyword Succeeds	1m	1s	Wait Until Element Is Visible	xpath=${NETWORK ELEMENT XPATH}
  Click Element   xpath=${NETWORK ELEMENT XPATH}

Open Browser To Gene
  Open Browser	${SINGLE GENE URL}    ${BROWSER}
  BuiltIn.Wait Until Keyword Succeeds   1m	1s   Title Should Be	SMAD1 - Gene Network

Click Gene Databases
  Wait Until Element Is Visible   xpath=${GENE HPO ELEMENT XPATH}
  Click Element   xpath=${GENE HPO ELEMENT XPATH}
  Wait Until Element Is Visible   xpath=${GENE GOBP ELEMENT XPATH}
  Click Element   xpath=${GENE GOBP ELEMENT XPATH}
  Wait Until Element Is Visible   xpath=${GENE GOMF ELEMENT XPATH}
  Click Element   xpath=${GENE GOMF ELEMENT XPATH}
  Wait Until Element Is Visible   xpath=${GENE GOCP ELEMENT XPATH}
  Click Element   xpath=${GENE GOCP ELEMENT XPATH}
  Wait Until Element Is Visible   xpath=${GENE KEGG ELEMENT XPATH}
  Click Element   xpath=${GENE KEGG ELEMENT XPATH}
  Wait Until Element Is Visible   xpath=${GENE COREG ELEMENT XPATH}
  Click Element   xpath=${GENE COREG ELEMENT XPATH}
  Wait Until Element Is Visible   xpath=${GENE TISSUES ELEMENT XPATH}
  Click Element   xpath=${GENE TISSUES ELEMENT XPATH}

Click FAQ
  Click Element   xpath=${FAQ ELEMENT XPATH}
  Wait Until Element Is Visible   xpath=${FAQ GADO H XPATH}
  Click Element   xpath=${FAQ GADO L XPATH}

Click API
  Click Element   xpath=${API ELEMENT XPATH}

Click GADO
  Click Element   xpath=${GADO ELEMENT XPATH}
  Title Should Be    Diagnosis - Gene Network

Input GADO
  Wait Until Element Is Visible   xpath=${GADO SEARCH XPATH}
  Click Element   xpath=${GADO SEARCH XPATH}
  Wait Until Element Is Visible   xpath=${GADO SEARCH INPUT XPATH}
  Input Text   xpath=${GADO SEARCH INPUT XPATH}  ${GADO TERM 1}
  Sleep  1s
  Press Key   xpath=${GADO SEARCH INPUT XPATH}  \\13
  Input Text   xpath=${GADO SEARCH INPUT XPATH}  ${GADO TERM 2}
  Sleep  1s
  Press Key   xpath=${GADO SEARCH INPUT XPATH}  \\13
  Input Text   xpath=${GADO SEARCH INPUT XPATH}  ${GADO TERM 3}
  Sleep  1s
  Press Key   xpath=${GADO SEARCH INPUT XPATH}  \\13
  Wait Until Element Is Visible   xpath=${GADO ADD TERM BUTTON XPATH}
  Click Element   xpath=${GADO ADD TERM BUTTON XPATH}
  Click Element   xpath=${GADO SUBMIT BUTTON XPATH}
  BuiltIn.Wait Until Keyword Succeeds	1m	1s	Wait Until Element Is Visible   xpath=${GADO RESULT TABLE XPATH}
