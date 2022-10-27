sap.ui.define([],
    async function() {
        "use strict";
        return {
            onBeforeRendering: function () {
            //change icon button
            let oButton = this.getView().byId("DettaglioButton");
            oButton.setIcon("sap-icon://sys-find");
            oButton = this.getView().byId("LetteraVetturaButton");
            oButton.setIcon("sap-icon://print");
            oButton = this.getView().byId("LetteraVetturaButton");
            oButton.setIcon("sap-icon://print");
            oButton = this.getView().byId("GeneraButton");
            oButton.setIcon("sap-icon://synchronize");
            },
            adaptNavigationParameterExtension: function(oSelectionVariant, oObjectInfo) {
                
                if (oObjectInfo.semanticObject === "OutboundDelivery" && oObjectInfo.action === "displayInWebGUI") {
                    let deliveryValue = oSelectionVariant.getParameter("$filter");
                    let OutboundDelivery = oSelectionVariant.getSelectOption("Vbeln")[0].Low;
                    oSelectionVariant.addParameter("OutboundDelivery", OutboundDelivery );
                    };
                    
                    if (oObjectInfo.semanticObject === "ReturnsDelivery" && oObjectInfo.action === "displayInWebGUI") {
                        let deliveryValue = oSelectionVariant.getParameter("$filter");
                        let returnsDelivery = oSelectionVariant.getSelectOption("Vbeln_rif")[0].Low;
                        oSelectionVariant.addParameter("ReturnsDelivery", returnsDelivery );
                        };    
                     
                },
            letteraVettura: function() {
                var oModel = this.getView().getModel();
                //get data from entity set 
                let aContexts = this.extensionAPI.getSelectedContexts();
                aContexts.forEach(element => {
                    let data = element.getModel().getObject(element.getPath());
                    let awbnumber = data.Awbnumber;
                    let vbeln = data.Vbeln;
                    var sReadPath = oModel.createKey("/zsped_pdfSet", {
                        Vbeln: vbeln,
                        Awbnumber: awbnumber
                    });

                    oModel.read(sReadPath, {
                        success: function(oData, oResponse) {

                            var pdfAsDataUri = oResponse.data.Content;
                            var pdfAsBinary = atob(pdfAsDataUri);
                            var pdfAsArray = new Uint8Array(pdfAsBinary.length);
                            for (var i = 0; i < pdfAsBinary.length; i++) {
                                pdfAsArray[i] = pdfAsBinary.charCodeAt(i);
                            }
                            var pdfAsBlob = new Blob([pdfAsArray.buffer], {
                                type: 'application/pdf'
                            });
                            var pdfAsUrl = URL.createObjectURL(pdfAsBlob);
                            jQuery.sap.addUrlWhitelist(undefined, pdfAsUrl);
                           // window.open(pdfAsUrl);

                           let pdfViewer = new sap.m.PDFViewer();
                            pdfViewer.setSource(pdfAsUrl);
                            pdfViewer.setWidth("100%");
                            pdfViewer.setHeight("100%");
                            
                            //pdfViewer.setToolbarVisible(true);
                            pdfViewer.open();
                            
                        } ,

                        error: function(oError) {
                            console.log(oError);
                        }
                    });
                });
            },
            // this.getView().byId(this.byId("spedizioni").getId() + "Dettaglio").setIcon("sap-icon://status-activating");

            Dettaglio: function(oEvent) {
                let aContexts = this.extensionAPI.getSelectedContexts();
                let text = "";
                let table = [];
                var oModel = new sap.ui.model.json.JSONModel();
                aContexts.forEach(element => {
                    let data = element.getModel().getObject(element.getPath());
                    //message to show in dialog
                    console.log('Selected Rows are => ', data);
                    //get value "Awbnumber" of data
                    let awbnumber = data.Awbnumber;
                    console.log(awbnumber);
                    //call url api
                    let url = "https://express.api.dhl.com/mydhlapi/test/tracking?shipmentTrackingNumber="

                    $.ajax({
                        url: url + awbnumber + "&all-checkpoints=true",
                        type: "GET",
                        dataType: "json",
                        username: "theraslifetIT",
                        password: "W^0vZ@5yE$9zM@6h",
                        cache : false,
                        crossDomain : true,
                        xhrFields : {
                         withCredentials : true
                        },
                        accept: "/",
                        async: false,
                        success: function(data) {
                            console.log(data);
                            //text = awbnumber + " OK " + text;

                            table.push({
                                awbnumber: awbnumber,
                                error: "ok"
                            });

                        },
                        error: function(error) {
                            //text = awbnumber + " Errore " + text;
                            table.push({
                                awbnumber: awbnumber,
                                error: "ko"
                            });

                            console.log(error.statusText);
                        }
                    });

                });
                oModel.setProperty("/table", table);
                //let sPath =  this.getBindingContext("oModel").getPath();
                let oTable =
                    new sap.m.Table({
                        columns: [
                            new sap.m.Column({
                                header: new sap.m.Label({
                                    text: "awbnumber"
                                })
                            }),
                            new sap.m.Column({
                                header: new sap.m.Label({
                                    text: "Status"
                                })
                            })
                        ],
                        items: {
                            path: "/table",
                            template: new sap.m.ColumnListItem({
                                cells: [
                                    new sap.m.Label({
                                        text: "{awbnumber}"
                                    }),
                                    new sap.m.Label({
                                        text: "{error}"
                                    })
                                ]
                            })
                        }
                    });
                oTable.setModel(oModel);
                let oDialog = new sap.m.Dialog({
                    title: 'Dettaglio Tracking',
                    type: 'Message',
                    state: 'Information',
                    content: new sap.m.Text({
                        text: text
                    }),
                    content: oTable,




                    beginButton: new sap.m.Button({
                        text: 'OK',
                        press: function() {
                            oDialog.close();
                        }
                    })
                });

                oDialog.open();


            }
        };
    }


);